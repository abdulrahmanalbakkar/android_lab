/* First steps: the very beginning, for someone who has never programmed.
   Every lesson may use only what earlier lessons taught (see the curriculum). Class prefix: st-. */
(() => {
  const { h } = Lab;

  const css = `
.st-robot { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; align-items: start; }
@container (max-width: 520px) { .st-robot { grid-template-columns: minmax(0, 1fr); } }
.st-steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; counter-reset: st; }
.st-steps li { counter-increment: st; display: flex; gap: 8px; align-items: center; padding: 6px 10px; border-radius: 8px; background: var(--surface); border: 1px solid var(--line); font-size: 0.92rem; }
.st-steps li::before { content: counter(st); font: 600 0.75rem var(--mono); color: var(--muted); width: 1.2em; }
.st-steps li.on { border-color: var(--accent); background: var(--accent-soft); font-weight: 700; }
.st-steps li.bad { border-color: var(--err); background: var(--err-soft); }
.st-prog { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 6px; }
.st-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; max-width: 240px; justify-self: center; width: 100%; }
.st-cell { aspect-ratio: 1; border-radius: 8px; background: var(--sunk); display: grid; place-items: center; font-size: 1.4rem; line-height: 1; }
.st-cell.goal { background: var(--warm-soft); }
.st-cell.bot { background: var(--accent); color: var(--accent-ink); }
.st-cell.crash { background: var(--err); color: var(--bg); }
`;

  // A robot on a 4 x 3 grid follows a list of plain-English steps.
  function robot(el) {
    const A = ['Move forward', 'Move forward', 'Turn left', 'Move forward', 'Move forward'];
    const B = ['Turn left', 'Move forward', 'Move forward', 'Move forward', 'Move forward'];
    const ARROW = { right: '→', up: '↑', left: '←', down: '↓' };
    const LEFT = { right: 'up', up: 'left', left: 'down', down: 'right' };
    const GOAL = [2, 0];
    // Build frames by actually running each list of steps.
    const run = (prog, steps, intro) => {
      const out = [{ prog, steps, line: 0, x: 0, y: 2, dir: 'right', say: intro }];
      let x = 0, y = 2, dir = 'right';
      steps.forEach((s, i) => {
        if (out[out.length - 1].crash) return;   // stopped: later steps never run
        if (s === 'Turn left') dir = LEFT[dir];
        else {
          const nx = x + (dir === 'right') - (dir === 'left'), ny = y + (dir === 'down') - (dir === 'up');
          if (nx < 0 || ny < 0 || nx > 3 || ny > 2) {
            out.push({ prog, steps, line: i + 1, x, y, dir, crash: true, say: `Step ${i + 1} says move forward, but there is a wall. The robot doesn’t guess what you meant. It stops with an error.` });
            return;
          }
          x = nx; y = ny;
        }
        if (out[out.length - 1].crash) return;
        const done = x === GOAL[0] && y === GOAL[1] && i === steps.length - 1;
        out.push({ prog, steps, line: i + 1, x, y, dir, say: done ? 'It reached the star. Every step ran once, from top to bottom.' : `Step ${i + 1}: <b>${s}</b>.` });
      });
      return out;
    };
    const frames = [
      ...run('Program 1', A, 'The robot can only do two things: move forward one square, or turn left. Here is a list of steps to reach the star.'),
      ...run('Program 2', B, 'The same five steps, but “Turn left” moved to the top. Watch what happens.'),
    ];
    const label = h('div', { class: 'st-prog' });
    const list = h('ol', { class: 'st-steps' });
    const cells = Array.from({ length: 12 }, () => h('div', { class: 'st-cell' }));
    const stage = h('div', { class: 'ui-stage st-robot' }, h('div', {}, label, list), h('div', { class: 'st-grid', role: 'img', 'aria-label': 'Robot on a grid' }, cells));
    Lab.ui.player(el, {
      stage,
      frames,
      speed: 1300,
      predict: {
        q: 'Program 2 has exactly the same steps as Program 1, in a different order. Where does the robot end up?',
        options: ['At the star, the steps are the same', 'Somewhere else: the order changes the result', 'The computer fixes the order for you'],
        a: 1,
        why: 'A computer runs steps in the order you write them. Same steps in another order is a different program.',
      },
      draw(f) {
        label.textContent = f.prog;
        list.replaceChildren(...f.steps.map((s, i) => h('li', { class: i + 1 === f.line ? (f.crash ? 'bad' : 'on') : null }, s)));
        cells.forEach((c, i) => {
          const cx = i % 4, cy = Math.floor(i / 4);
          const bot = cx === f.x && cy === f.y, goal = cx === GOAL[0] && cy === GOAL[1];
          c.className = 'st-cell' + (bot ? (f.crash ? ' crash' : ' bot') : goal ? ' goal' : '');
          c.textContent = bot ? ARROW[f.dir] : goal ? '★' : '';
        });
      },
    });
  }

  Lab.addTrack({
    id: 'start',
    title: 'First steps',
    description: 'Never programmed before? Start here: what a program is, your first lines of code, and what to do when it goes wrong.',
    requires: [],
    css,
    lessons: [
      {
        id: 'program',
        title: 'What a program is',
        tagline: 'A list of steps that a computer follows exactly.',
        goals: ['Explain what a program is', 'Break a job into small, exact steps', 'Put steps in the right order'],
        level: 'beginner', ignore: ['in','a','the'], introduces: [],
        body: `
<p>Every app on your phone, every website and every game is a <em>program</em>: a list of instructions written by a person, for a computer to follow.</p>
<p>A computer is fast but not clever. It does exactly what the instructions say, one after another, from top to bottom. It never guesses what you meant. If a step is wrong, or two steps are in the wrong order, the result is wrong.</p>
<p>So programming is mostly this: breaking a job into small, exact steps, and putting them in the right order. Try it with the robot below.</p>`,
        visual: robot,
        code: `Move forward
Move forward
Turn left
Move forward
Move forward`,
        remember: 'A program is a list of exact instructions. The computer runs them in order and never guesses.',
        terms: [
          { term: 'program', def: 'A list of instructions that a computer follows.' },
          { term: 'instruction', def: 'One step in a program, such as “move forward”.' },
          { term: 'code', def: 'The text of a program, written in a programming language.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'The robot starts facing right. Fill in the missing step so it turns to face up before moving.', code: 'Move forward\n[[Turn left]]\nMove forward', why: 'Turning left from facing right makes the robot face up. Then “Move forward” goes up one square.' },
          { type: 'bug', prompt: 'This recipe for a cup of tea has a step that happens too early. Tap it.', code: 'Boil water\nPut a tea bag in a cup\nDrink the tea\nPour the water into the cup', bug: 2, fix: '(move “Drink the tea” to the end)', why: 'Steps run in order. You can’t drink the tea before the water is poured.' },
        ],
        quiz: [
          { q: 'A step in a program is unclear. What does the computer do?', options: ['Guesses what you meant', 'Does exactly what the step says, or stops with an error', 'Skips it quietly and asks you later'], a: 1, why: 'Computers follow instructions literally. That is why programs must be exact.' },
          { q: 'You swap the order of two steps. What happens?', options: ['Nothing changes, the steps are the same', 'The program can now do something different', 'The computer puts them back in order'], a: 1, why: 'Order is part of the program. Steps run from top to bottom.' },
        ],
        docs: [['Kotlin tour: Hello world', 'https://kotlinlang.org/docs/kotlin-tour-hello-world.html']],
      },

      {
        id: 'first-program',
        title: 'Your first program',
        tagline: 'Write one line of Kotlin and see it print.',
        goals: ['Write and run a complete Kotlin program', 'Print a line of text with <code>println</code>', 'Know where a program starts: <code>fun main()</code>'],
        level: 'beginner', introduces: ['fun','main','println'],
        body: `
<p>We will write programs in <b>Kotlin</b>, the language most Android apps are written in. Here is a complete Kotlin program:</p>
<pre class="code"><code>fun main() {
    println("Hello!")
}</code></pre>
<p><code>fun main() { }</code> marks <em>where the program starts</em>. Every program has one. (<code>fun</code> is short for <em>function</em>, a named group of steps; you’ll write your own later. For now, copy this line as it is.) The steps go between the curly brackets <code>{</code> and <code>}</code>, and they run from top to bottom. The spaces in front of them are only there to make the code easier to read.</p>
<p><code>println</code> means “print a line”: it shows text in the <em>output</em>, the place where a program writes its results. The text goes inside the round brackets <code>( )</code>, in double quotes.</p>
<p>Your turn: scroll to <b>Run it</b>, press <b>Open editor</b>, change the text between the quotes, and press ▶. That is real code, running for real.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    println("Hello!")\n    println("I am learning Kotlin.")\n    println("Bye!")\n}',
            outTitle: 'Output',
            predict: {
              q: 'This program has three <code>println</code> lines. In what order do the lines appear in the output?',
              options: ['In the order they are written, top to bottom', 'All at once, in any order', 'Bottom to top'],
              a: 0,
              why: 'Steps inside <code>main</code> run one after another, from the top.',
            },
            frames: [
              { line: 1, say: 'The program starts at <code>fun main()</code>.' },
              { line: 2, out: 'Hello!', say: 'The first step prints <code>Hello!</code> on its own line.' },
              { line: 3, out: 'I am learning Kotlin.', say: 'Then the next line. Each <code>println</code> starts a new line in the output.' },
              { line: 4, out: 'Bye!', say: 'Then the last one.' },
              { line: 5, say: 'The closing <code>}</code> is the end of <code>main</code>. Nothing is left to do, so the program ends.' },
            ],
          });
        },
        code: `fun main() {
    println("Hello!")
    println("I am learning Kotlin.")
}`,
        play: `fun main() {
    println("Hello!")
    println("I am learning Kotlin.")
}`,
        remember: 'A program starts at fun main(). println("...") prints one line of text.',
        mistakes: [
          { title: 'Forgetting a quote or a bracket', bad: 'println("Hello!)', good: 'println("Hello!")', why: 'Text needs a quote at both ends, and every <code>(</code> needs its <code>)</code>. Without them Kotlin can’t tell where the text stops.' },
        ],
        terms: [
          { term: 'Kotlin', def: 'The programming language used in this course and in most Android apps.' },
          { term: 'main', def: 'Where a Kotlin program starts. Written <code>fun main() { }</code>.' },
          { term: 'println', def: 'Prints a line of text in the output.' },
          { term: 'output', def: 'Where a program shows its results, like the text a program prints.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the program print <code>Good morning</code>.', code: 'fun main() {\n    [[println]]("Good morning")\n}', why: '<code>println</code> prints the text in the brackets.' },
          { type: 'bug', prompt: 'One line stops this program from working. Tap it.', code: 'fun main() {\n    println("Ready")\n    println("Set)\n    println("Go")\n}', bug: 2, fix: '    println("Set")', why: 'The text <code>"Set</code> has no closing quote, so Kotlin can’t tell where the text ends.' },
        ],
        quiz: [
          { q: 'Where does a Kotlin program start?', options: ['At the first <code>println</code>', 'At <code>fun main()</code>', 'At the last line'], a: 1, why: '<code>main</code> is the starting point. Its steps run top to bottom.' },
          { q: 'What does this print?<pre class="code"><code>println("Hi")\nprintln("there")</code></pre>', options: ['<code>Hi there</code> on one line', '<code>Hi</code>, then <code>there</code> on the next line', '<code>there</code>, then <code>Hi</code>'], a: 1, why: 'Each <code>println</code> prints its own line, in order.' },
        ],
        docs: [['Kotlin tour: Hello world', 'https://kotlinlang.org/docs/kotlin-tour-hello-world.html'], ['Basic syntax: program entry point', 'https://kotlinlang.org/docs/basic-syntax.html#program-entry-point']],
      },

      {
        id: 'comments',
        title: 'Comments',
        tagline: 'Notes in your code that the computer ignores.',
        goals: ['Write notes in code with <code>//</code> and <code>/* */</code>', 'Turn a line of code off by commenting it out'],
        level: 'beginner', introduces: ['//'],
        body: `
<p>Code is read by people as well as computers: by you next month, and by the people you work with. A <em>comment</em> is a note for those people. Kotlin skips it completely.</p>
<p><code>//</code> starts a comment that runs to the end of the line. For a longer note, start with <code>/*</code> and end with <code>*/</code>, across as many lines as you like.</p>
<p>Comments have a second use: putting <code>//</code> in front of a line of code turns it off without deleting it. Programmers call that <em>commenting out</em>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    // Greet the user\n    println("Hello")\n    // println("This line is turned off")\n    println("Bye") // a note after the code\n}',
            predict: {
              q: 'How many lines does this program print?',
              options: ['2', '3', '4'],
              a: 0,
              why: 'Only the two <code>println</code> lines that are not commented out run.',
            },
            frames: [
              { line: 1, say: 'Four lines inside <code>main</code>. Which ones run?' },
              { line: 2, say: 'A comment. Kotlin skips it; it is a note for people.' },
              { line: 3, out: 'Hello', say: 'Normal code runs.' },
              { line: 4, say: 'This line has <code>//</code> in front, so it is a comment now. It doesn’t run.' },
              { line: 5, out: 'Bye', say: 'The code runs; the <code>//</code> note after it is ignored.' },
            ],
          });
        },
        code: `fun main() {
    // One-line comment
    println("Hello")

    /* A longer comment
       can span several lines. */
    // println("Turned off")
}`,
        play: `fun main() {
    println("Line one")
    // println("Line two")
    println("Line three")
    // Remove the // before "Line two" and run again.
}`,
        remember: '// and /* */ are notes for people. Kotlin ignores them, so they also turn code off.',
        terms: [
          { term: 'comment', def: 'A note in code that the computer ignores. <code>// ...</code> or <code>/* ... */</code>.' },
          { term: 'commenting out', def: 'Turning a line of code off by making it a comment.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn off the second line so only <code>Keep me</code> prints.', code: 'fun main() {\n    println("Keep me")\n    [[//]] println("Hide me")\n}', why: '<code>//</code> at the start makes the whole line a comment.' },
          { type: 'bug', prompt: 'This note was meant to be a comment, but it breaks the program. Tap it.', code: 'fun main() {\n    Say hello to the user\n    println("Hello")\n}', bug: 1, fix: '    // Say hello to the user', why: 'Without <code>//</code>, Kotlin tries to read the note as code.' },
        ],
        quiz: [
          { q: 'What does Kotlin do with a comment?', options: ['Prints it', 'Ignores it', 'Runs it last'], a: 1, why: 'Comments are for people. The computer skips them.' },
          { q: 'Which line is a comment?', options: ['<code>println("// hi")</code>', '<code>// println("hi")</code>', 'Both'], a: 1, why: 'In the first one, <code>//</code> is inside quotes, so it is just text to print.' },
        ],
        docs: [['Basic syntax: comments', 'https://kotlinlang.org/docs/basic-syntax.html#comments']],
      },

      {
        id: 'text',
        title: 'Printing text',
        tagline: 'Text goes in double quotes. Kotlin calls it a String.',
        goals: ['Write text in double quotes as a <code>String</code>', 'Print text exactly as written', 'Spot why text without quotes fails'],
        level: 'beginner', introduces: ['String'],
        body: `
<p>A piece of text in a program, like <code>"Hello!"</code>, is called a <em>String</em>: a string of letters. The double quotes tell Kotlin “this is text, print it as it is”.</p>
<p>Inside the quotes you can write anything: words, spaces, numbers, emoji. Kotlin doesn’t try to understand it. <code>"2 + 2"</code> prints <code>2 + 2</code>, not 4.</p>
<p>Without quotes, Kotlin reads the words as code. <code>println(Hello)</code> fails, because Kotlin looks for something named <code>Hello</code> and finds nothing.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    println("Kotlin")\n    println("2 + 2")\n    println("")\n    println("Spaces   stay   too")\n}',
            predict: {
              q: 'What does <code>println("2 + 2")</code> print?',
              options: ['<code>4</code>', '<code>2 + 2</code>', 'An error'],
              a: 1,
              why: 'Anything inside quotes is text. Kotlin prints it exactly as written and does no maths.',
            },
            frames: [
              { line: 1, say: 'Four lines of text to print.' },
              { line: 2, out: 'Kotlin', say: 'Text in quotes prints exactly as written, without the quotes.' },
              { line: 3, out: '2 + 2', say: 'In quotes, <code>2 + 2</code> is just three characters with spaces. No maths happens.' },
              { line: 4, out: '', say: '<code>""</code> is empty text. <code>println("")</code> prints an empty line, handy for spacing.' },
              { line: 5, out: 'Spaces   stay   too', say: 'Spaces inside the quotes are kept, every one of them.' },
            ],
          });
        },
        code: `fun main() {
    println("Kotlin")
    println("2 + 2")      // prints: 2 + 2
    println("")           // an empty line
}`,
        play: `fun main() {
    println("Sam")
    println("2 + 2")
    // Try: remove the quotes around Sam and run. Read the error, then put them back.
}`,
        remember: 'Text goes in double quotes and prints exactly as written. That text is called a String.',
        terms: [
          { term: 'String', def: 'A piece of text, written in double quotes: <code>"like this"</code>.' },
          { term: 'empty string', def: '<code>""</code>: text with nothing in it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print the word <code>Done</code> as text.', code: 'fun main() {\n    println([["Done"])\n}', why: 'Text needs double quotes around it.' },
          { type: 'bug', prompt: 'One line stops the program from working. Tap it.', code: 'fun main() {\n    println("Welcome")\n    println(Goodbye)\n}', bug: 2, fix: '    println("Goodbye")', why: 'Without quotes, Kotlin looks for something called <code>Goodbye</code> and can’t find it.' },
        ],
        quiz: [
          { q: 'What does <code>println("10 - 3")</code> print?', options: ['<code>7</code>', '<code>10 - 3</code>', '<code>"10 - 3"</code> with the quotes'], a: 1, why: 'Quotes make it text. The quotes themselves are not printed.' },
          { q: 'What is a String?', options: ['A piece of text', 'A whole number', 'A line of output'], a: 0, why: 'A String is text, written in double quotes.' },
        ],
        docs: [['Strings', 'https://kotlinlang.org/docs/strings.html']],
      },

      {
        id: 'numbers',
        title: 'Numbers and arithmetic',
        tagline: 'Without quotes, Kotlin does the maths.',
        goals: ['Add, subtract, multiply and divide with <code>Int</code> numbers', 'Know which sums Kotlin works out first', 'Use brackets to choose the order'],
        level: 'beginner', introduces: ['+','-','*','/','Int'],
        body: `
<p>Write a number without quotes and Kotlin treats it as a number it can calculate with. <code>println(2 + 3)</code> prints <code>5</code>.</p>
<p>The symbols are <code>+</code> add, <code>-</code> subtract, <code>*</code> multiply and <code>/</code> divide. Like in school maths, <code>*</code> and <code>/</code> happen before <code>+</code> and <code>-</code>. Use brackets to choose the order yourself: <code>(2 + 3) * 4</code> is 20.</p>
<p>Numbers like 3, 0 and -12 are <em>whole numbers</em>. Kotlin calls them <code>Int</code>, short for integer. Decimals come in the next lesson.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    println(2 + 3)\n    println("2 + 3")\n    println(2 + 3 * 4)\n    println((2 + 3) * 4)\n}',
            predict: {
              q: 'What does <code>println(2 + 3 * 4)</code> print?',
              options: ['<code>20</code>', '<code>14</code>', '<code>2 + 3 * 4</code>'],
              a: 1,
              why: 'Multiplication happens first: 3 × 4 = 12, then 2 + 12 = 14.',
            },
            frames: [
              { line: 1, say: 'Two pairs to compare: with and without quotes, with and without brackets.' },
              { line: 2, out: '5', say: 'No quotes, so this is maths. Kotlin works out <code>2 + 3</code> and prints the answer.' },
              { line: 3, out: '2 + 3', say: 'With quotes it is text again, printed as written.' },
              { line: 4, out: '14', say: '<code>*</code> goes first: <code>3 * 4</code> is 12, then <code>2 + 12</code> is 14.' },
              { line: 5, out: '20', say: 'Brackets go first: <code>2 + 3</code> is 5, then <code>5 * 4</code> is 20.' },
            ],
          });
        },
        code: `fun main() {
    println(7 + 5)        // 12
    println(7 - 5)        // 2
    println(7 * 5)        // 35
    println(2 + 3 * 4)    // 14: * comes first
    println((2 + 3) * 4)  // 20: brackets first
}`,
        play: `fun main() {
    // How many minutes are in a week? 7 days, 24 hours, 60 minutes.
    println(7 * 24 * 60)
    // Change the numbers and run again.
}`,
        remember: 'Numbers without quotes are calculated. * and / go before + and -, brackets go first of all.',
        terms: [
          { term: 'Int', def: 'A whole number, like <code>3</code>, <code>0</code> or <code>-12</code>.' },
          { term: 'operator', def: 'A symbol that does something to values, like <code>+</code> or <code>*</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make this print <code>20</code>: add 2 and 3 first, then multiply by 4.', code: 'fun main() {\n    println([[(]]2 + 3[[)]] * 4)\n}', why: 'Brackets make the addition happen before the multiplication.' },
          { type: 'bug', prompt: 'This should print the answer 8, but it prints text. Tap the line.', code: 'fun main() {\n    println("Adding:")\n    println("5 + 3")\n}', bug: 2, fix: '    println(5 + 3)', why: 'In quotes, <code>5 + 3</code> is text. Remove the quotes to calculate.' },
        ],
        quiz: [
          { q: 'What does <code>println(10 - 2 * 3)</code> print?', options: ['<code>24</code>', '<code>4</code>', '<code>10 - 2 * 3</code>'], a: 1, why: '<code>2 * 3</code> is 6 first, then 10 − 6 is 4.' },
          { q: 'Which line prints <code>9</code>?', options: ['<code>println("4 + 5")</code>', '<code>println(4 + 5)</code>', 'Both'], a: 1, why: 'Only the version without quotes does the maths.' },
        ],
        docs: [['Numbers', 'https://kotlinlang.org/docs/numbers.html'], ['Kotlin tour: Basic types', 'https://kotlinlang.org/docs/kotlin-tour-basic-types.html']],
      },

      {
        id: 'decimals',
        title: 'Decimal numbers',
        tagline: 'Numbers with a point, and the surprise in whole-number division.',
        goals: ['Calculate with decimal numbers (<code>Double</code>)', 'Explain why <code>7 / 2</code> gives 3', 'Find the remainder with <code>%</code>'],
        level: 'beginner', introduces: ['%','Double'],
        body: `
<p>Numbers with a decimal point, like <code>3.5</code> or <code>0.25</code>, are called <code>Double</code> in Kotlin. You calculate with them the same way.</p>
<p>Here is the surprise: dividing two whole numbers gives a whole number. <code>7 / 2</code> is <code>3</code>, not 3.5. Kotlin throws the .5 away. If either number has a decimal point, you get the decimal answer: <code>7.0 / 2</code> is <code>3.5</code>.</p>
<p>What was thrown away? The <code>%</code> operator, called <em>remainder</em>, tells you: <code>7 % 2</code> is <code>1</code>, because 2 fits into 7 three times with 1 left over.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    println(7 / 2)\n    println(7.0 / 2)\n    println(7 % 2)\n    println(1.5 + 1.5)\n}',
            predict: {
              q: 'What does <code>println(7 / 2)</code> print?',
              options: ['<code>3.5</code>', '<code>3</code>', '<code>4</code>'],
              a: 1,
              why: '7 and 2 are both whole numbers, so the answer is whole too. The .5 is dropped, not rounded.',
            },
            frames: [
              { line: 1, say: 'Four calculations. Watch the first two closely.' },
              { line: 2, out: '3', say: 'Both numbers are whole (<code>Int</code>), so the answer is whole. The .5 is simply dropped.' },
              { line: 3, out: '3.5', say: '<code>7.0</code> has a decimal point, so this is a <code>Double</code> calculation and the answer keeps its decimals.' },
              { line: 4, out: '1', say: '<code>%</code> gives what was left over: 2 fits into 7 three times, with 1 left.' },
              { line: 5, out: '3.0', say: 'A <code>Double</code> answer always shows its decimal point, even when it is a whole value.' },
            ],
          });
        },
        code: `fun main() {
    println(7 / 2)      // 3   (whole numbers: decimals dropped)
    println(7.0 / 2)    // 3.5 (a Double is involved)
    println(7 % 2)      // 1   (the remainder)
    println(10 % 5)     // 0   (divides evenly)
}`,
        play: `fun main() {
    // Share 10 sweets between 4 friends.
    println(10 / 4)    // whole sweets each: 2
    println(10 % 4)    // sweets left over: 2
    println(10.0 / 4)  // the exact share: 2.5
}`,
        remember: 'Int / Int drops the decimals. Use a Double like 7.0 to keep them. % gives the remainder.',
        mistakes: [
          { title: 'Expecting decimals from whole numbers', bad: 'println(5 / 2)    // 2, not 2.5', good: 'println(5.0 / 2)  // 2.5', why: 'When both numbers are whole, the answer is whole. Make one of them a decimal.' },
        ],
        terms: [
          { term: 'Double', def: 'A number with a decimal point, like <code>3.5</code>.' },
          { term: 'remainder', def: 'What is left over after dividing. Written <code>%</code>: <code>7 % 2</code> is 1.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make this print <code>2.5</code>.', code: 'fun main() {\n    println([[5.0]] / 2)\n}', why: 'One decimal number is enough to get a decimal answer.' },
          { type: 'bug', prompt: 'This should print how many are left over when 9 is split into groups of 4 (the answer is 1). Tap the wrong line.', code: 'fun main() {\n    println("Left over:")\n    println(9 / 4)\n}', bug: 2, fix: '    println(9 % 4)', why: '<code>/</code> gives how many groups (2). <code>%</code> gives what is left over (1).' },
        ],
        quiz: [
          { q: 'What does <code>println(9 / 2)</code> print?', options: ['<code>4.5</code>', '<code>4</code>', '<code>5</code>'], a: 1, why: 'Whole divided by whole drops the decimals. Nothing is rounded up.' },
          { q: 'What does <code>println(9 % 2)</code> print?', options: ['<code>1</code>', '<code>4</code>', '<code>4.5</code>'], a: 0, why: '2 fits into 9 four times, with 1 left over.' },
          { q: 'Which gives <code>4.5</code>?', options: ['<code>9 / 2</code>', '<code>9.0 / 2</code>', '<code>9 % 2</code>'], a: 1, why: 'With a decimal number involved, the answer keeps its decimals.' },
        ],
        docs: [['Numbers: division and remainder', 'https://kotlinlang.org/docs/numbers.html']],
      },

      {
        id: 'errors',
        title: 'When code doesn’t work',
        tagline: 'Errors are normal. Here is how to read them.',
        goals: ['Tell a compile error from a crash', 'Read an error message to find the problem', 'Fix the first error first'],
        level: 'beginner', introduces: [],
        body: `
<p>Every programmer sees errors every day. They are not a sign you’re bad at this. They are the computer telling you exactly where it got stuck.</p>
<p>There are two kinds. A <em>compile error</em> happens before the program runs: Kotlin reads your code, finds something it can’t understand, like a missing quote or a misspelled word, and refuses to start. A <em>crash</em> happens while the program runs: the code made sense, but one step was impossible, like dividing a whole number by zero (<code>10 / 0</code>). The steps before it already ran.</p>
<p>To fix an error, read the message slowly. It names the line and says what is wrong. Fix the first error first, because one mistake can cause others.</p>`,
        visual(el) {
          Lab.ui.terminal(el, {
            prompt: '▶',
            predict: {
              q: 'A program prints two lines, then divides by zero on the third step. What do you see?',
              options: ['Nothing at all, the program never starts', 'The first two lines, then an error', 'All lines, and a warning at the end'],
              a: 1,
              why: 'Dividing by zero is a crash: the steps before it already ran, and the program stops at the impossible step.',
            },
            frames: [
              { say: 'Three small programs, each run once. Watch where each one stops.' },
              { cmd: 'run: prinln("Hi")', out: 'error: Unresolved reference \'prinln\'.', say: 'A typo. Kotlin doesn’t know the word <code>prinln</code>, so this is a <b>compile error</b>: nothing runs at all.' },
              { cmd: 'run: println("Hi")', out: 'Hi', say: 'Fixed the spelling, and it works. The message pointed straight at the problem word.' },
              { clear: true, cmd: 'run: println("Start")  println("Middle")  println(10 / 0)', out: 'Start\nMiddle\nException in thread "main" java.lang.ArithmeticException: / by zero', say: 'This code is valid, so it starts. The first two lines print, then the impossible step <b>crashes</b> the program. The message ends with the reason: <code>/ by zero</code>.' },
              { cmd: 'run: println("Start")  println("Middle")  println(10 / 2)', out: 'Start\nMiddle\n5', say: 'Fix the impossible step and every line runs.' },
            ],
          });
        },
        code: `fun main() {
    println("Start")    // prints
    println(10 / 0)     // crash: you can't divide by zero
    println("End")      // never reached
    // prinln("Hi")     // a typo like this would be a compile error: nothing would run
}`,
        play: `fun main() {
    println("Start")
    println(10 / 2)
    println("End")
    // 1. Change 2 to 0 and run: a crash, after "Start" prints.
    // 2. Then misspell println and run: a compile error, nothing prints.
}`,
        remember: 'Errors are normal. Compile errors stop the program before it starts; crashes stop it partway. Read the message, fix the first one.',
        terms: [
          { term: 'error', def: 'A message saying something in the program went wrong.' },
          { term: 'compile error', def: 'A problem Kotlin finds before running, such as a typo. Nothing runs.' },
          { term: 'crash', def: 'A problem while the program runs, such as dividing by zero. It stops at that step.' },
          { term: 'bug', def: 'A mistake in a program that makes it do the wrong thing.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fix the typo so this compiles.', code: 'fun main() {\n    [[println]]("Fixed")\n}', why: 'Kotlin only knows the exact word <code>println</code>.' },
          { type: 'bug', prompt: 'This program prints “Start”, then crashes. Tap the line that crashes.', code: 'fun main() {\n    println("Start")\n    println(8 / 0)\n    println("End")\n}', bug: 2, fix: '    println(8 / 2)', why: 'Dividing by zero is impossible, so the program stops on that step.' },
        ],
        quiz: [
          { q: 'You misspell <code>println</code> on the last line. What prints?', options: ['Everything except the last line', 'Nothing: it is a compile error', 'Everything, with a warning'], a: 1, why: 'Compile errors are found before the program runs, so nothing runs.' },
          { q: 'A program crashes on its third step. Did steps one and two run?', options: ['Yes', 'No'], a: 0, why: 'A crash happens while running. The steps before it already happened.' },
          { q: 'Your code shows three errors. Which do you fix first?', options: ['The last one', 'The first one', 'The longest message'], a: 1, why: 'One mistake can cause the ones after it. Fixing the first often fixes the rest.' },
        ],
        docs: [['Kotlin tour: Hello world', 'https://kotlinlang.org/docs/kotlin-tour-hello-world.html']],
      },
    ],
  });
})();
