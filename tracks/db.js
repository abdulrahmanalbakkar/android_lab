/* Databases track. Same shape as tracks/kotlin.js.
   A beginner's first databases course on SQLite: tables, SQL, keys, joins, table design, indexes, transactions,
   other kinds of databases and schema changes. One story runs through it: Ada's book-lending app.
   Demos show real sqlite3 output; each demo draws its own small tables with tbl(). Every class is prefixed dbx-. */
(() => {
  const { h } = Lab;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const label = text => h('span', { class: 'dbx-label' }, text);

  // A small table. rows: arrays of values; o.cls(row, i) returns a row class; o.keys marks key columns.
  function tbl(name, cols, rows, o = {}) {
    const cls = o.cls || (() => null);
    const keys = o.keys || {};
    return h('div', { class: 'dbx-tw' },
      name ? h('div', { class: 'dbx-tn' }, name) : null,
      h('div', { class: 'dbx-scroll' }, h('table', { class: 'dbx-t' },
        h('thead', {}, h('tr', {}, cols.map(col => h('th', {}, col, keys[col] ? h('span', { class: 'dbx-key-tag' }, ' ' + keys[col]) : null)))),
        h('tbody', {}, rows.length
          ? rows.map((r, i) => h('tr', { class: cls(r, i) || null }, r.map(v => h('td', { class: v == null ? 'dbx-null' : null }, v == null ? 'NULL' : String(v)))))
          : h('tr', {}, h('td', { colspan: String(cols.length), class: 'dbx-null' }, '(no rows)'))))));
  }

  const css = `
.dbx-stage { display: grid; gap: 12px; min-width: 0; }
.dbx-label { font: 600 0.72rem var(--mono); color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
.dbx-tw { display: grid; gap: 4px; min-width: 0; max-width: 100%; }
.dbx-tn { font: 600 0.78rem var(--mono); color: var(--muted); }
.dbx-scroll { overflow-x: auto; max-width: 100%; }
.dbx-t { border-collapse: collapse; font: 500 0.78rem var(--mono); background: var(--surface); color: var(--ink); }
.dbx-t th, .dbx-t td { border: 1px solid var(--line); padding: 4px 8px; text-align: left; white-space: nowrap; transition: background 0.25s, opacity 0.25s; }
.dbx-t th { background: var(--sunk); color: var(--muted); font-weight: 600; }
.dbx-key-tag { color: var(--accent); font-size: 0.68rem; }
.dbx-t td.dbx-null { color: var(--muted); font-style: italic; }
.dbx-t tr.dbx-dim td { opacity: 0.32; }
.dbx-t tr.dbx-hit td { background: var(--ok-soft); }
.dbx-t tr.dbx-bad td { background: var(--err-soft); }
.dbx-t tr.dbx-warm td { background: var(--warm-soft); }
.dbx-stats { display: flex; flex-wrap: wrap; gap: 8px; }
.dbx-stat { font: 500 0.8rem var(--mono); padding: 6px 10px; border-radius: 8px; background: var(--sunk); color: var(--ink); }
.dbx-stat b { color: var(--accent); }
.dbx-doc { font: 500 0.76rem/1.5 var(--mono); background: var(--sunk); color: var(--ink); border-radius: 10px; padding: 8px 12px; white-space: pre-wrap; overflow-wrap: anywhere; margin: 0; min-width: 0; }
.dbx-pass { color: var(--ok); font-weight: 700; }
.dbx-fail { color: var(--err); font-weight: 700; }
`;

  Lab.addTrack({
    id: 'db', lang: 'sql',
    title: 'Databases',
    description: 'Keep an app’s data in a database with SQLite: make tables, ask them questions in SQL, link them with keys, and keep the data fast, safe and up to date as the app grows.',
    requires: ['kotlin'],
    css,
    lessons: [
      {
        id: 'what-db',
        title: 'What a database is',
        tagline: 'A place where an app keeps its data in tidy tables.',
        goals: ['Say what a table, a row and a column are', 'Explain why apps keep data in a database instead of a text file', 'Make a table with <code>CREATE TABLE</code> in <code>sqlite3</code>'],
        level: 'beginner', introduces: ['sqlite3', 'CREATE', 'TABLE', 'INTEGER', 'TEXT'],
        body: `
<p>Ada is building a small app where friends lend each other books. At first she keeps the books in a text file, one per line: <code>Rain at Dawn, Mia Hart, 2019</code>. To find every book by Mia Hart, her program has to read the whole file and cut each line apart at the commas. A title with a comma in it breaks that, and if the app stops halfway through saving, the file can end up half written.</p>
<p>A <em>database</em> is a program built to keep data safe and find it fast. Most databases keep data in <em>tables</em>. A table looks like a spreadsheet: each <em>column</em> has a name and holds one kind of value (title, author, year), and each <em>row</em> is one thing, here one book. In Kotlin terms: a table is like a list of objects of one class, a row is one object, and a column is one property.</p>
<p>Every Android phone comes with <em>SQLite</em>, a small database that apps use to keep data on the phone, and this track uses it too. On your computer, run <code>sqlite3 library.db</code> in the terminal. It opens the database file <code>library.db</code> (making it if it does not exist yet) and waits for your commands after <code>sqlite&gt;</code>. On macOS and most Linux systems it is already installed; on Windows, download it from sqlite.org. Type <code>.quit</code> to leave.</p>
<p>You talk to the database in <em>SQL</em>, a language for asking databases questions. <code>CREATE TABLE books (...)</code> makes a table named <code>books</code>. Inside the parentheses, each column gets a name and a type: <code>INTEGER</code> for whole numbers, like Kotlin’s <code>Int</code>, and <code>TEXT</code> for text, like <code>String</code>. A SQL command can run over several lines and ends with <code>;</code>. SQL words are usually written in capitals so they stand out, but SQLite accepts small letters too.</p>`,
        visual(el) {
          const COLS = ['id', 'title', 'author', 'year', 'copies'];
          const B = [[1, 'Rain at Dawn', 'Mia Hart', 2019, 2], [2, 'The Quiet Sea', 'Leo Brandt', 2015, 1], [3, 'Night Train', 'Mia Hart', 2021, 3], [4, 'Paper Birds', 'Ines Costa', 2018, 1], [5, 'Small Rooms', 'Leo Brandt', 2022, 2]];
          const show = (rows, hit) => n => n.append(tbl('books', COLS, rows, { cls: r => hit == null ? null : (r[0] === hit ? 'dbx-hit' : 'dbx-dim') }));
          Lab.ui.terminal(el, {
            prompt: 'sqlite>',
            panelTitle: 'library.db',
            predict: {
              q: 'Ada runs <code>CREATE TABLE books (...)</code> with five columns. How many rows does the new table have?',
              options: ['0', '5', '1'],
              a: 0,
              why: '<code>CREATE TABLE</code> only describes the columns. Rows arrive when you add books.',
            },
            frames: [
              { out: 'SQLite version 3.45.1 2024-01-30 16:01:20\nEnter ".help" for usage hints.', panel: '<p class="dbx-label">no tables yet</p>', say: 'Ada ran <code>sqlite3 library.db</code> in the terminal. SQLite printed its version and now waits after <code>sqlite&gt;</code>.' },
              { cmd: 'CREATE TABLE books (id INTEGER, title TEXT, author TEXT, year INTEGER, copies INTEGER);', panel: show([]), say: 'It printed nothing: in <code>sqlite3</code>, silence means it worked. The panel draws the new table: five columns, no rows yet.' },
              { cmd: '.tables', out: 'books', say: 'Commands that start with a dot are for the <code>sqlite3</code> program itself, not SQL. <code>.tables</code> lists the tables in this file.' },
              { panel: show(B), say: 'Ada pasted five set-up lines that add her books. They are at the end of the code below: paste them too, so your table matches hers. Each row is one book, and each column holds one kind of value.' },
              { panel: show(B, 3), say: 'One row: Night Train by Mia Hart, from 2021, 3 copies. The <code>id</code> is a number Ada gives every book, so she can point at exactly one.' },
              { cmd: '.quit', say: '<code>.quit</code> closes <code>sqlite3</code>. The table and its rows stay in <code>library.db</code>, ready for next time.' },
            ],
          });
        },
        code: `-- In the terminal: sqlite3 library.db
CREATE TABLE books (
    id INTEGER,
    title TEXT,
    author TEXT,
    year INTEGER,
    copies INTEGER
);
-- prints nothing: the table now exists, with 0 rows

.tables
-- books

-- Set-up: paste these five lines as they are, to give the table Ada's books.
-- The lesson after next explains how they work.
INSERT INTO books VALUES (1, 'Rain at Dawn', 'Mia Hart', 2019, 2);
INSERT INTO books VALUES (2, 'The Quiet Sea', 'Leo Brandt', 2015, 1);
INSERT INTO books VALUES (3, 'Night Train', 'Mia Hart', 2021, 3);
INSERT INTO books VALUES (4, 'Paper Birds', 'Ines Costa', 2018, 1);
INSERT INTO books VALUES (5, 'Small Rooms', 'Leo Brandt', 2022, 2);`,
        ignore: ['INSERT', 'INTO', 'VALUES'],
        remember: 'A table holds rows of one kind of thing; every column has a name and a type. CREATE TABLE makes one.',
        mistakes: [
          { title: 'Forgetting the semicolon', bad: `sqlite> CREATE TABLE books (id INTEGER, title TEXT)
   ...>`, good: `sqlite> CREATE TABLE books (id INTEGER, title TEXT)
   ...> ;`, why: 'Without <code>;</code>, <code>sqlite3</code> thinks the command goes on and shows <code>...&gt;</code> to ask for the rest. Type <code>;</code> and press Enter to finish it.' },
        ],
        terms: [
          { term: 'database', def: 'A program that keeps data safe and finds it fast. SQLite is one.' },
          { term: 'table, row, column', def: 'A table is a grid of data. Each row is one thing (one book); each column is one kind of value (the title).' },
          { term: 'SQL', def: 'The language you use to talk to a database, with commands like <code>CREATE TABLE</code>.' },
          { term: 'sqlite3', def: 'A terminal program for SQLite: <code>sqlite3 library.db</code> opens that database file.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a table <code>members</code> with a whole-number <code>id</code> and a text <code>name</code>.', code: 'CREATE [[TABLE|table]] members (id [[INTEGER|integer]], name [[TEXT|text]]);', why: '<code>CREATE TABLE</code> names the table; <code>INTEGER</code> holds whole numbers and <code>TEXT</code> holds text.' },
          { type: 'bug', prompt: 'A table of cities, where <code>population</code> is a whole number. Tap the wrong line.', code: 'CREATE TABLE cities (\n    name TEXT,\n    population TEXT\n);', bug: 2, fix: '    population INTEGER', why: 'A population is a whole number, so its column type is <code>INTEGER</code>, like <code>Int</code> in Kotlin.' },
        ],
        quiz: [
          { q: 'In Ada’s <code>books</code> table, what is one row?', options: ['One book', 'Every title, top to bottom', 'The whole file'], a: 0, why: 'A row is one thing. Every title, top to bottom, is a column.' },
          { q: 'Which column type fits a year like 2019?', options: ['<code>TEXT</code>', '<code>INTEGER</code>'], a: 1, why: 'A year is a whole number, so <code>INTEGER</code>.' },
          { q: 'Why does a text file get hard to use as an app’s data grows?', options: ['Text files cannot hold numbers', 'The program must read and cut apart every line itself to find anything', 'A computer can open only one text file'], a: 1, why: 'A database does the finding for you, and keeps the data safe while it saves.' },
        ],
        docs: [['Command Line Shell For SQLite', 'https://www.sqlite.org/cli.html']],
      },

      {
        id: 'sql-select',
        title: 'Reading data with SQL',
        tagline: 'Ask a table a question and get back only the rows you need.',
        goals: ['Read columns from a table with <code>SELECT</code> and <code>FROM</code>', 'Keep only the rows that match with <code>WHERE</code>', 'Sort with <code>ORDER BY</code> and keep the first few with <code>LIMIT</code>'],
        level: 'beginner', introduces: ['SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'DESC', 'LIMIT'],
        body: `
<p>Ada’s app has a screen “Books by Mia Hart”, and another with the newest books first. The app does not read the whole table to make them. It asks the database a question, a <em>query</em>, and gets back only the rows it needs.</p>
<p><code>SELECT title, year FROM books;</code> reads the columns <code>title</code> and <code>year</code> from every row of <code>books</code>. <code>SELECT *</code> means all columns. The answer is itself a small table: <code>sqlite3</code> prints one row per line, with <code>|</code> between the values.</p>
<p><code>WHERE</code> keeps only the rows that pass a test: <code>WHERE year &gt; 2018</code>, or <code>WHERE author = 'Mia Hart'</code>. Two things differ from Kotlin: SQL checks “equal” with a single <code>=</code>, and text goes in single quotes. The check is exact, so <code>'mia hart'</code> finds nothing.</p>
<p><code>ORDER BY year</code> sorts the answer, smallest first; add <code>DESC</code> (descending) for biggest first. <code>LIMIT 2</code> keeps only the first two rows. The parts always come in this order: <code>SELECT</code>, <code>FROM</code>, <code>WHERE</code>, <code>ORDER BY</code>, <code>LIMIT</code>. Without <code>ORDER BY</code>, the database promises no order at all.</p>`,
        visual(el) {
          const COLS = ['id', 'title', 'author', 'year', 'copies'];
          const B = [[1, 'Rain at Dawn', 'Mia Hart', 2019, 2], [2, 'The Quiet Sea', 'Leo Brandt', 2015, 1], [3, 'Night Train', 'Mia Hart', 2021, 3], [4, 'Paper Birds', 'Ines Costa', 2018, 1], [5, 'Small Rooms', 'Leo Brandt', 2022, 2]];
          const show = keep => n => n.append(tbl('books', COLS, B, { cls: r => keep ? (keep(r) ? 'dbx-hit' : 'dbx-dim') : null }));
          const err = s => `<span class="dbx-fail">${esc(s)}</span>`;
          Lab.ui.terminal(el, {
            prompt: 'sqlite>',
            panelTitle: 'books',
            predict: {
              q: 'Ada runs <code>SELECT title, year FROM books ORDER BY year DESC LIMIT 2;</code> What is the first line of the answer?',
              options: ['<code>Small Rooms|2022</code>', '<code>The Quiet Sea|2015</code>', '<code>Rain at Dawn|2019</code>'],
              a: 0,
              why: '<code>DESC</code> puts the biggest year first, and Small Rooms is from 2022.',
            },
            frames: [
              { panel: show(), say: 'Ada’s <code>books</code> table with her five books. She opened it with <code>sqlite3 library.db</code>.' },
              { cmd: 'SELECT * FROM books;', out: '1|Rain at Dawn|Mia Hart|2019|2\n2|The Quiet Sea|Leo Brandt|2015|1\n3|Night Train|Mia Hart|2021|3\n4|Paper Birds|Ines Costa|2018|1\n5|Small Rooms|Leo Brandt|2022|2', say: '<code>*</code> means every column. One line per row, with <code>|</code> between the values.' },
              { cmd: 'SELECT title, year FROM books;', out: 'Rain at Dawn|2019\nThe Quiet Sea|2015\nNight Train|2021\nPaper Birds|2018\nSmall Rooms|2022', say: 'Name the columns you want, separated by commas. The others stay out of the answer.' },
              { cmd: "SELECT title FROM books WHERE author = 'Mia Hart';", out: 'Rain at Dawn\nNight Train', panel: show(r => r[2] === 'Mia Hart'), say: '<code>WHERE</code> tests each row. Only Mia Hart’s two books pass. Text goes in single quotes.' },
              { cmd: 'SELECT title, year FROM books WHERE year > 2018;', out: 'Rain at Dawn|2019\nNight Train|2021\nSmall Rooms|2022', panel: show(r => r[3] > 2018), say: 'Comparisons work as in Kotlin. Only “equal” is different: one <code>=</code>.' },
              { cmd: 'SELECT title, year FROM books ORDER BY year DESC;', out: 'Small Rooms|2022\nNight Train|2021\nRain at Dawn|2019\nPaper Birds|2018\nThe Quiet Sea|2015', panel: show(), say: '<code>ORDER BY</code> sorts the answer. <code>DESC</code> means biggest first.' },
              { cmd: 'SELECT title, year FROM books ORDER BY year DESC LIMIT 2;', out: 'Small Rooms|2022\nNight Train|2021', panel: show(r => r[3] > 2020), say: '<code>LIMIT 2</code> keeps the first two rows of the sorted answer: the two newest books.' },
              { cmd: 'SELECT title FROM books WHERE author = Mia;', out: err('Parse error: no such column: Mia\n  SELECT title FROM books WHERE author = Mia;\n                           error here ---^'), say: 'Without quotes, SQL reads <code>Mia</code> as the name of a column. There is no such column, so it stops with an error.' },
            ],
          });
        },
        code: `SELECT title, year FROM books WHERE year > 2018 ORDER BY year DESC;
-- Small Rooms|2022
-- Night Train|2021
-- Rain at Dawn|2019

SELECT title FROM books WHERE author = 'Mia Hart' ORDER BY title LIMIT 1;
-- Night Train`,
        remember: 'SELECT columns FROM table WHERE test ORDER BY column LIMIT n, in that order. Text goes in single quotes.',
        mistakes: [
          { title: 'Text without quotes', bad: `SELECT title FROM books WHERE author = Mia Hart;
-- Parse error: near "Hart": syntax error`, good: `SELECT title FROM books WHERE author = 'Mia Hart';
-- Rain at Dawn
-- Night Train`, why: 'Without quotes, SQL reads words as column names. Put text values in single quotes.' },
        ],
        terms: [
          { term: 'query', def: 'A question you ask the database, like <code>SELECT title FROM books;</code>. The answer is a small table.' },
          { term: 'SELECT … FROM', def: '<code>SELECT</code> names the columns you want, <code>FROM</code> names the table. <code>*</code> means all columns.' },
          { term: 'WHERE', def: 'Keeps only the rows that pass a test, like <code>WHERE year &gt; 2018</code>.' },
          { term: 'ORDER BY, DESC, LIMIT', def: '<code>ORDER BY</code> sorts the answer (<code>DESC</code> for biggest first); <code>LIMIT</code> keeps the first few rows.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'List the titles of the books with exactly 1 copy, sorted by title.', code: 'SELECT title [[FROM|from]] books [[WHERE|where]] copies = 1 [[ORDER BY|order by]] title;', why: 'It prints <code>Paper Birds</code> and <code>The Quiet Sea</code>, in that order.' },
          { type: 'bug', prompt: 'This should list the three newest books, newest first. Tap the wrong line.', code: 'SELECT title, year\nFROM books\nORDER BY year\nLIMIT 3;', bug: 2, fix: 'ORDER BY year DESC', why: 'Without <code>DESC</code>, the oldest come first, so <code>LIMIT 3</code> keeps the three oldest books.' },
        ],
        quiz: [
          { q: "What does <code>SELECT title FROM books WHERE author = 'mia hart';</code> print?", options: ['Rain at Dawn and Night Train', 'Nothing: no row matches', 'An error'], a: 1, why: 'Text must match exactly, small and capital letters included.' },
          { q: 'Which part keeps only some of the rows?', options: ['<code>SELECT</code>', '<code>WHERE</code>', '<code>ORDER BY</code>'], a: 1, why: '<code>SELECT</code> picks columns; <code>WHERE</code> picks rows.' },
          { q: 'How do you get only the oldest book?', options: ['<code>ORDER BY year LIMIT 1</code>', '<code>ORDER BY year DESC LIMIT 1</code>', '<code>LIMIT 1</code>'], a: 0, why: 'Without <code>DESC</code> the smallest year comes first. <code>LIMIT 1</code> alone gives no promised order.' },
        ],
        docs: [['SQLite: SELECT', 'https://www.sqlite.org/lang_select.html']],
      },

      {
        id: 'sql-write',
        title: 'Changing data with SQL',
        tagline: 'Add rows, change them and remove them.',
        goals: ['Add rows with <code>INSERT INTO</code> and <code>VALUES</code>', 'Change rows with <code>UPDATE</code> and <code>SET</code>', 'Remove rows with <code>DELETE FROM</code>, aimed by <code>WHERE</code>'],
        level: 'beginner', introduces: ['INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'NULL'],
        body: `
<p>Someone adds a new book to Ada’s app, a copy is returned, a book is taken off the shelf. Each of those changes the table. SQL has one command for each: add, change, remove.</p>
<p><code>INSERT INTO books VALUES (6, 'Blue Hills', 'Ines Costa', 2023, 1);</code> adds one row. The values go in the same order as the columns: id, title, author, year, copies. To fill only some columns, name them first: <code>INSERT INTO books (id, title, author) VALUES (7, 'Long Winter', 'Mia Hart');</code>. The columns you leave out stay empty: SQL calls this <code>NULL</code>, “no value”, like <code>null</code> in Kotlin.</p>
<p><code>UPDATE books SET copies = 2 WHERE id = 6;</code> changes the rows that pass the <code>WHERE</code> test. <code>SET</code> can also work from the old value: <code>SET copies = copies + 1</code>. <code>DELETE FROM books WHERE id = 6;</code> removes the rows that pass the test.</p>
<p><code>WHERE</code> is what aims <code>UPDATE</code> and <code>DELETE</code>. Leave it out and the command hits every row in the table, without asking and without undo. Before changing rows, you can run a <code>SELECT</code> with the same <code>WHERE</code> to see exactly which rows you are about to hit.</p>`,
        visual(el) {
          const COLS = ['id', 'title', 'author', 'year', 'copies'];
          const B = [[1, 'Rain at Dawn', 'Mia Hart', 2019, 2], [2, 'The Quiet Sea', 'Leo Brandt', 2015, 1], [3, 'Night Train', 'Mia Hart', 2021, 3], [4, 'Paper Birds', 'Ines Costa', 2018, 1], [5, 'Small Rooms', 'Leo Brandt', 2022, 2]];
          const show = (rows, cls) => n => n.append(tbl('books', COLS, rows, { cls }));
          const six = c => [...B.map(r => r[0] === 1 && c > 1 ? [1, 'Rain at Dawn', 'Mia Hart', 2019, 3] : r), [6, 'Blue Hills', 'Ines Costa', 2023, c]];
          const B3 = B.map(r => r[0] === 1 ? [1, 'Rain at Dawn', 'Mia Hart', 2019, 3] : r);
          Lab.ui.terminal(el, {
            prompt: 'sqlite>',
            panelTitle: 'books',
            predict: {
              q: 'Ada runs <code>UPDATE books SET copies = 0;</code> with no <code>WHERE</code>. Which rows change?',
              options: ['None: SQLite asks for a <code>WHERE</code> first', 'Only the first row', 'Every row in the table'],
              a: 2,
              why: 'With no test to pass, every row counts as a match.',
            },
            frames: [
              { panel: show(B), say: 'The same five books. Each command below changes the table, and the panel shows the result.' },
              { cmd: "INSERT INTO books VALUES (6, 'Blue Hills', 'Ines Costa', 2023, 1);", panel: show([...B, [6, 'Blue Hills', 'Ines Costa', 2023, 1]], r => r[0] === 6 ? 'dbx-hit' : null), say: 'A new row. The values follow the order of the columns.' },
              { cmd: 'SELECT * FROM books WHERE id = 6;', out: '6|Blue Hills|Ines Costa|2023|1', say: 'Read it back to check.' },
              { cmd: 'UPDATE books SET copies = 2 WHERE id = 6;', panel: show([...B, [6, 'Blue Hills', 'Ines Costa', 2023, 2]], r => r[0] === 6 ? 'dbx-hit' : null), say: '<code>WHERE</code> picks the row, <code>SET</code> gives the new value. Only Blue Hills changes.' },
              { cmd: 'UPDATE books SET copies = copies + 1 WHERE id = 1;', panel: show(six(2), r => r[0] === 1 ? 'dbx-hit' : null), say: '<code>SET</code> can use the old value: <code>copies + 1</code> turns Rain at Dawn’s 2 into 3.' },
              { cmd: 'DELETE FROM books WHERE id = 6;', panel: show(B3), say: '<code>DELETE</code> removes the rows that match. Blue Hills is gone.' },
              { cmd: 'UPDATE books SET copies = 0;', panel: show(B.map(r => [...r.slice(0, 4), 0]), () => 'dbx-bad'), say: 'No <code>WHERE</code>: every row changes, and <code>sqlite3</code> does not ask first.' },
              { cmd: 'SELECT title, copies FROM books;', out: 'Rain at Dawn|0\nThe Quiet Sea|0\nNight Train|0\nPaper Birds|0\nSmall Rooms|0', say: 'Every book now has 0 copies. That is why you write the <code>WHERE</code> before anything else.' },
            ],
          });
        },
        code: `INSERT INTO books VALUES (6, 'Blue Hills', 'Ines Costa', 2023, 1);
UPDATE books SET copies = 2 WHERE id = 6;
SELECT title, copies FROM books WHERE id = 6;
-- Blue Hills|2

DELETE FROM books WHERE id = 6;
SELECT * FROM books WHERE id = 6;
-- (prints nothing: the row is gone)`,
        remember: 'INSERT adds rows, UPDATE changes them, DELETE removes them. UPDATE and DELETE hit every row unless WHERE aims them.',
        mistakes: [
          { title: 'Too few values', bad: `INSERT INTO books VALUES (8, 'Short Story', 'Leo Brandt', 2020);
-- Parse error: table books has 5 columns but 4 values were supplied`, good: `INSERT INTO books (id, title, author, year) VALUES (8, 'Short Story', 'Leo Brandt', 2020);
-- copies stays empty: NULL`, why: 'Without a list of columns, SQLite wants one value for every column. To fill only some, name them first.' },
        ],
        terms: [
          { term: 'INSERT INTO … VALUES', def: 'Adds a row: <code>INSERT INTO books VALUES (6, \'Blue Hills\', \'Ines Costa\', 2023, 1);</code>' },
          { term: 'UPDATE … SET', def: 'Changes columns in the rows that pass the <code>WHERE</code> test.' },
          { term: 'DELETE FROM', def: 'Removes the rows that pass the <code>WHERE</code> test. Without <code>WHERE</code>, all of them.' },
          { term: 'NULL', def: 'SQL’s “no value”, like <code>null</code> in Kotlin. A column you leave out of an <code>INSERT</code> holds <code>NULL</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A copy of Night Train (id 3) comes back. Add 1 to its copies.', code: '[[UPDATE|update]] books [[SET|set]] copies = copies + 1 [[WHERE|where]] id = 3;', why: '<code>UPDATE</code> names the table, <code>SET</code> the new value, <code>WHERE</code> the row.' },
          { type: 'bug', prompt: 'Ada wants to remove only Small Rooms (id 5). Tap the wrong line.', code: 'SELECT title FROM books WHERE id = 5;\nDELETE FROM books;\nSELECT * FROM books;', bug: 1, fix: 'DELETE FROM books WHERE id = 5;', why: 'Without <code>WHERE</code>, <code>DELETE</code> removes all five books.' },
        ],
        quiz: [
          { q: 'What does <code>DELETE FROM books;</code> remove?', options: ['Nothing: it needs a <code>WHERE</code>', 'Every row; the empty table stays', 'The whole table, columns and all'], a: 1, why: 'It removes all the rows. The table itself is still there, empty.' },
          { q: "After <code>INSERT INTO books (id, title) VALUES (9, 'Mist');</code>, what is in that row’s <code>year</code>?", options: ['<code>0</code>', 'Nothing: it stays empty (<code>NULL</code>)', 'An error stops the INSERT'], a: 1, why: 'Columns you leave out hold <code>NULL</code>. <code>sqlite3</code> prints the row as <code>9|Mist|||</code>.' },
          { q: 'Which command changes Night Train’s year to 2020?', options: ['<code>UPDATE books SET year = 2020 WHERE id = 3;</code>', '<code>INSERT INTO books VALUES (3, 2020);</code>', '<code>UPDATE books WHERE id = 3 SET year = 2020;</code>'], a: 0, why: '<code>SET</code> comes before <code>WHERE</code>. <code>INSERT</code> adds a new row instead of changing one.' },
        ],
        docs: [['SQLite: INSERT', 'https://www.sqlite.org/lang_insert.html'], ['SQLite: UPDATE', 'https://www.sqlite.org/lang_update.html']],
      },

      {
        id: 'keys',
        title: 'Keys and relations',
        tagline: 'Give every row its own name, and let one table point at another.',
        goals: ['Make a column that names each row with <code>PRIMARY KEY</code>', 'Point from one table to another with <code>REFERENCES</code>', 'Turn on SQLite’s link checks with <code>PRAGMA foreign_keys = ON</code>'],
        level: 'beginner', introduces: ['PRIMARY', 'KEY', 'DROP', 'REFERENCES', 'PRAGMA', 'foreign_keys', 'ON'],
        body: `
<p>Ada adds a second book with id 3 by accident. Now “book 3” could mean Night Train or Blue Hills, and when Sam borrows book 3, nobody knows which one he has. Her table needs a column whose value no two rows ever share.</p>
<p>That column is the <em>primary key</em>. Write <code>id INTEGER PRIMARY KEY</code> in <code>CREATE TABLE</code>, and SQLite refuses a second row with the same id. If an <code>INSERT</code> leaves the id out, SQLite uses one more than the biggest id in the table. SQLite can’t add a primary key to a table that already exists, so Ada deletes the old table with <code>DROP TABLE books;</code> (that removes the table and all its rows) and makes it again, with the key.</p>
<p>Now the loans. A loan says which book went to whom. Instead of copying the book’s title into the loan, the loan keeps the book’s id: <code>book_id INTEGER REFERENCES books(id)</code>. Such a column is a <em>foreign key</em>: it points at the primary key of another table. The link between the two tables is called a <em>relation</em>.</p>
<p>With a foreign key, the database checks the link: a loan for book 9, which does not exist, is refused, and so is deleting a book that a loan still points at. SQLite does these checks only after <code>PRAGMA foreign_keys = ON;</code>. <code>PRAGMA</code> changes one of SQLite’s settings, and this one is off again every time you open the database, so run it each time.</p>`,
        visual(el) {
          const COLS = ['id', 'title', 'author', 'year', 'copies'];
          const B = [[1, 'Rain at Dawn', 'Mia Hart', 2019, 2], [2, 'The Quiet Sea', 'Leo Brandt', 2015, 1], [3, 'Night Train', 'Mia Hart', 2021, 3], [4, 'Paper Birds', 'Ines Costa', 2018, 1], [5, 'Small Rooms', 'Leo Brandt', 2022, 2]];
          const L = [[1, 3, 'Sam'], [2, 1, 'Noor'], [3, 4, 'Sam']];
          const err = s => `<span class="dbx-fail">${esc(s)}</span>`;
          const books = (rows, o = {}) => tbl('books', COLS, rows, o);
          Lab.ui.terminal(el, {
            prompt: 'sqlite>',
            panelTitle: 'library.db',
            predict: {
              q: 'The checks are on. Ada adds a loan for book 9, and there is no book 9. What does SQLite do?',
              options: ['Stores the loan anyway', 'Refuses it: <code>FOREIGN KEY constraint failed</code>', 'Makes an empty book 9'],
              a: 1,
              why: 'A foreign key must point at a row that exists. Otherwise the change is refused.',
            },
            frames: [
              { panel: n => n.append(books(B)), say: 'The <code>books</code> table from before. Nothing stops two rows from having the same id.' },
              { cmd: "INSERT INTO books VALUES (3, 'Blue Hills', 'Ines Costa', 2023, 1);", panel: n => n.append(books([...B, [3, 'Blue Hills', 'Ines Costa', 2023, 1]], { cls: r => r[0] === 3 ? 'dbx-bad' : null })), say: 'SQLite takes it without a word. Two books now answer to id 3, so “book 3” means nothing for sure.' },
              { cmd: 'DROP TABLE books;', panel: '<p class="dbx-label">no tables</p>', say: '<code>DROP TABLE</code> deletes the table and every row in it. Ada starts over.' },
              { cmd: 'CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, year INTEGER, copies INTEGER);', panel: n => n.append(books(B, { keys: { id: 'PK' } })), say: 'This time <code>id</code> is the primary key. Ada pastes the five set-up lines from the first lesson again to add her books. (All the lines of this demo are in the code below.)' },
              { cmd: "INSERT INTO books VALUES (3, 'Blue Hills', 'Ines Costa', 2023, 1);", out: err('Runtime error: UNIQUE constraint failed: books.id (19)'), say: 'Refused: no two rows can share a primary key. (19 is SQLite’s number for this kind of error.)' },
              { cmd: 'PRAGMA foreign_keys = ON;', say: 'Turn on the link checks. They stay on until <code>sqlite3</code> closes.' },
              { cmd: 'CREATE TABLE loans (id INTEGER PRIMARY KEY, book_id INTEGER REFERENCES books(id), member TEXT);', panel: n => n.append(books(B, { keys: { id: 'PK' }, cls: r => [1, 3, 4].includes(r[0]) ? 'dbx-hit' : null }), tbl('loans', ['id', 'book_id', 'member'], L, { keys: { id: 'PK', book_id: 'FK' } })), say: 'Each loan’s <code>book_id</code> points at a book’s <code>id</code>. With three <code>INSERT</code> lines (in the code below), Ada adds three loans: Sam has books 3 and 4, Noor has book 1.' },
              { cmd: "INSERT INTO loans VALUES (4, 9, 'Lin');", out: err('Runtime error: FOREIGN KEY constraint failed (19)'), say: 'There is no book 9, so the loan is refused. A broken link never gets in.' },
            ],
          });
        },
        code: `-- the demo, line by line
INSERT INTO books VALUES (3, 'Blue Hills', 'Ines Costa', 2023, 1);
DROP TABLE books;
CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, year INTEGER, copies INTEGER);
INSERT INTO books VALUES (1, 'Rain at Dawn', 'Mia Hart', 2019, 2);
INSERT INTO books VALUES (2, 'The Quiet Sea', 'Leo Brandt', 2015, 1);
INSERT INTO books VALUES (3, 'Night Train', 'Mia Hart', 2021, 3);
INSERT INTO books VALUES (4, 'Paper Birds', 'Ines Costa', 2018, 1);
INSERT INTO books VALUES (5, 'Small Rooms', 'Leo Brandt', 2022, 2);
INSERT INTO books VALUES (3, 'Blue Hills', 'Ines Costa', 2023, 1);
-- Runtime error: UNIQUE constraint failed: books.id (19)
PRAGMA foreign_keys = ON;
CREATE TABLE loans (id INTEGER PRIMARY KEY, book_id INTEGER REFERENCES books(id), member TEXT);
INSERT INTO loans VALUES (1, 3, 'Sam');
INSERT INTO loans VALUES (2, 1, 'Noor');
INSERT INTO loans VALUES (3, 4, 'Sam');
INSERT INTO loans VALUES (4, 9, 'Lin');
-- Runtime error: FOREIGN KEY constraint failed (19)

-- an INSERT without an id
INSERT INTO books (title, author, year, copies) VALUES ('Blue Hills', 'Ines Costa', 2023, 1);
SELECT id, title FROM books WHERE title = 'Blue Hills';
-- 6|Blue Hills          (one more than the biggest id, 5)

DELETE FROM books WHERE id = 3;
-- Runtime error: FOREIGN KEY constraint failed (19)   (a loan still points at book 3)
DELETE FROM books WHERE id = 6;
-- prints nothing: Blue Hills is gone, and books has its five rows again`,
        remember: 'A primary key names each row; a foreign key points at another table’s primary key. In SQLite, run PRAGMA foreign_keys = ON first.',
        mistakes: [
          { title: 'Forgetting to turn the checks on', bad: `-- a new sqlite3 session, PRAGMA not run
INSERT INTO loans VALUES (4, 9, 'Lin');
-- no error: a loan for a book that does not exist`, good: `PRAGMA foreign_keys = ON;
INSERT INTO loans VALUES (4, 9, 'Lin');
-- Runtime error: FOREIGN KEY constraint failed (19)`, why: 'SQLite keeps the checks off unless you turn them on, and only for as long as that session lasts.' },
        ],
        terms: [
          { term: 'primary key', def: 'A column whose value is different in every row, so it names exactly one row: <code>id INTEGER PRIMARY KEY</code>.' },
          { term: 'foreign key', def: 'A column that holds another table’s primary key, like <code>book_id INTEGER REFERENCES books(id)</code>.' },
          { term: 'relation', def: 'The link between two tables made by a foreign key.' },
          { term: 'PRAGMA', def: 'Reads or changes a setting of SQLite, like <code>PRAGMA foreign_keys = ON;</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a table of members whose <code>id</code> names each row.', code: 'CREATE TABLE members (id INTEGER [[PRIMARY KEY|primary key]], name TEXT, city TEXT);', why: '<code>PRIMARY KEY</code> makes SQLite refuse two members with the same id.' },
          { type: 'bug', prompt: 'Ada wants SQLite to refuse loans for books that don’t exist. Tap the wrong line.', code: 'PRAGMA foreign_keys = ON;\nCREATE TABLE loans (\n    id INTEGER PRIMARY KEY,\n    book_id INTEGER,\n    member TEXT\n);', bug: 3, fix: '    book_id INTEGER REFERENCES books(id),', why: 'Without <code>REFERENCES books(id)</code>, <code>book_id</code> is a plain number that SQLite never checks.' },
        ],
        quiz: [
          { q: '<code>id</code> is the primary key of <code>books</code>, and a book with id 2 exists. What does another <code>INSERT</code> with id 2 do?', options: ['Replaces the old row', 'Fails: <code>UNIQUE constraint failed: books.id</code>', 'Keeps both rows'], a: 1, why: 'A primary key value can belong to one row only.' },
          { q: 'A loan has <code>book_id</code> 4. What is <code>book_id</code>?', options: ['The loan’s primary key', 'A foreign key: it points at book 4 in <code>books</code>', 'A copy of the book’s title'], a: 1, why: 'It holds another table’s primary key, so it is a foreign key.' },
          { q: 'You open <code>sqlite3</code> again tomorrow. Are the foreign key checks on?', options: ['Yes, the file remembers', 'No: run <code>PRAGMA foreign_keys = ON;</code> again'], a: 1, why: 'The setting lasts only until the session ends.' },
        ],
        docs: [['SQLite Foreign Key Support', 'https://www.sqlite.org/foreignkeys.html']],
      },

      {
        id: 'joins',
        title: 'Joining tables',
        tagline: 'Put rows from two tables side by side in one answer.',
        goals: ['Combine two tables in one query with <code>JOIN</code> and <code>ON</code>', 'Name a column by its table, like <code>books.title</code>', 'Explain why rows without a partner drop out'],
        level: 'beginner', introduces: ['JOIN'],
        body: `
<p>Ada’s “Loans” screen should say “Sam has Night Train”. But a loan row only says <code>1|3|Sam</code>: loan 1, book 3, Sam. The title lives in <code>books</code>. She needs one answer built from both tables.</p>
<p><code>FROM loans JOIN books ON loans.book_id = books.id</code> builds it. For each loan, SQLite finds the book whose <code>id</code> equals the loan’s <code>book_id</code>, and puts the two rows side by side as one wider row. <code>ON</code> gives the rule for which rows belong together, and it is almost always “foreign key = primary key”.</p>
<p>With two tables in one query, write a column as <code>table.column</code>: <code>books.title</code>, <code>loans.member</code>. Both tables have a column called <code>id</code>, so a bare <code>id</code> is <em>ambiguous</em>: SQLite can’t tell which one you mean, and stops with an error. After the join, <code>WHERE</code> and <code>ORDER BY</code> work as before.</p>
<p>A join keeps only rows that found a partner. Nobody has borrowed The Quiet Sea or Small Rooms, so no loan points at them, and they are not in the answer.</p>`,
        visual(el) {
          const B = [[1, 'Rain at Dawn', 'Mia Hart'], [2, 'The Quiet Sea', 'Leo Brandt'], [3, 'Night Train', 'Mia Hart'], [4, 'Paper Birds', 'Ines Costa'], [5, 'Small Rooms', 'Leo Brandt']];
          const L = [[1, 3, 'Sam'], [2, 1, 'Noor'], [3, 4, 'Sam']];
          const err = s => `<span class="dbx-fail">${esc(s)}</span>`;
          const show = (lc, bc) => n => n.append(
            tbl('loans', ['id', 'book_id', 'member'], L, { keys: { book_id: 'FK' }, cls: lc }),
            tbl('books (id, title, author)', ['id', 'title', 'author'], B, { keys: { id: 'PK' }, cls: bc }));
          Lab.ui.terminal(el, {
            prompt: 'sqlite>',
            panelTitle: 'library.db',
            predict: {
              q: 'Three loans, five books. How many rows does <code>FROM loans JOIN books ON loans.book_id = books.id</code> give?',
              options: ['3', '5', '15'],
              a: 0,
              why: 'Each loan finds the one book its <code>book_id</code> points at: one row per loan.',
            },
            frames: [
              { panel: show(), say: 'Two tables. Each loan’s <code>book_id</code> points at a book’s <code>id</code>. (The panel leaves out <code>year</code> and <code>copies</code>.)' },
              { cmd: 'SELECT * FROM loans;', out: '1|3|Sam\n2|1|Noor\n3|4|Sam', say: 'On its own, a loan holds numbers and a name. Which book is 3?' },
              { cmd: 'SELECT loans.member, books.title FROM loans JOIN books ON loans.book_id = books.id;', out: 'Sam|Night Train\nNoor|Rain at Dawn\nSam|Paper Birds', panel: show(() => 'dbx-hit', r => [1, 3, 4].includes(r[0]) ? 'dbx-hit' : 'dbx-dim'), say: 'Each loan found its book. Three loans, three rows. The two dimmed books have no loan, so they are not in the answer.' },
              { cmd: "SELECT loans.member, books.title, books.author FROM loans JOIN books ON loans.book_id = books.id WHERE loans.member = 'Sam';", out: 'Sam|Night Train|Mia Hart\nSam|Paper Birds|Ines Costa', panel: show(r => r[2] === 'Sam' ? 'dbx-hit' : 'dbx-dim', r => [3, 4].includes(r[0]) ? 'dbx-hit' : 'dbx-dim'), say: '<code>WHERE</code> works on the joined rows: only Sam’s loans, with the author too.' },
              { cmd: 'SELECT id, title FROM loans JOIN books ON loans.book_id = books.id;', out: err('Parse error: ambiguous column name: id\n  SELECT id, title FROM loans JOIN books ON loans.book_id = books.id;\n         ^--- error here'), panel: show(), say: 'Both tables have an <code>id</code> column. SQLite won’t guess which one you mean. <code>books.id</code> would work.' },
              { cmd: 'SELECT loans.member, books.title FROM loans JOIN books;', out: 'Sam|Rain at Dawn\nSam|The Quiet Sea\nSam|Night Train\nSam|Paper Birds\nSam|Small Rooms\nNoor|Rain at Dawn\nNoor|The Quiet Sea\nNoor|Night Train\nNoor|Paper Birds\nNoor|Small Rooms\nSam|Rain at Dawn\nSam|The Quiet Sea\nSam|Night Train\nSam|Paper Birds\nSam|Small Rooms', say: 'Without <code>ON</code> there is no rule, so every loan pairs with every book: 3 × 5 = 15 rows, most of them wrong.' },
            ],
          });
        },
        code: `SELECT loans.member, books.title
FROM loans JOIN books ON loans.book_id = books.id
ORDER BY books.title;
-- Sam|Night Train
-- Sam|Paper Birds
-- Noor|Rain at Dawn`,
        remember: 'FROM a JOIN b ON a.foreign_key = b.id puts matching rows side by side. Rows without a partner drop out.',
        mistakes: [
          { title: 'A column name both tables have', bad: `SELECT id, title FROM loans JOIN books ON loans.book_id = books.id;
-- Parse error: ambiguous column name: id`, good: `SELECT books.id, books.title FROM loans JOIN books ON loans.book_id = books.id;
-- 3|Night Train
-- 1|Rain at Dawn
-- 4|Paper Birds`, why: 'When two tables share a column name, say which table you mean.' },
        ],
        terms: [
          { term: 'join', def: 'Combining rows of two tables into one answer: <code>FROM loans JOIN books ON ...</code>.' },
          { term: 'ON', def: 'In a join, the rule for which rows belong together, like <code>loans.book_id = books.id</code>.' },
          { term: 'ambiguous column', def: 'A column name that more than one table in the query has. Write <code>table.column</code> instead.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'List each member next to the author of the book they have.', code: 'SELECT loans.member, books.author\nFROM loans [[JOIN]] books [[ON|on]] loans.book_id = books.[[id]];', why: 'It prints <code>Sam|Mia Hart</code>, <code>Noor|Mia Hart</code> and <code>Sam|Ines Costa</code>.' },
          { type: 'bug', prompt: 'This should list each loan with its title, but it prints 15 rows. Tap the wrong line.', code: 'SELECT loans.member, books.title\nFROM loans JOIN books\nORDER BY loans.member;', bug: 1, fix: 'FROM loans JOIN books ON loans.book_id = books.id', why: 'Without <code>ON</code>, every loan pairs with every book.' },
        ],
        quiz: [
          { q: 'Why is Small Rooms missing from the joined loans?', options: ['No loan points at it', 'Its id is the biggest', 'A join always skips the last row'], a: 0, why: 'A join keeps only rows that found a partner.' },
          { q: 'What does <code>ON loans.book_id = books.id</code> say?', options: ['Copy <code>book_id</code> into <code>books</code>', 'Which loan row goes with which book row', 'Sort the answer by id'], a: 1, why: '<code>ON</code> is the rule for pairing rows.' },
          { q: 'SQLite says <code>ambiguous column name: id</code>. What fixes it?', options: ['Write <code>books.id</code> or <code>loans.id</code>', 'Add <code>DESC</code>', 'Remove the <code>ON</code> part'], a: 0, why: 'Naming the table makes clear which <code>id</code> you mean.' },
        ],
        docs: [['SQLite: SELECT', 'https://www.sqlite.org/lang_select.html']],
      },

      {
        id: 'normalization',
        title: 'Designing tables',
        tagline: 'Keep each fact in one place, so it can’t disagree with itself.',
        goals: ['Spot a fact that is copied into many rows', 'Split a wide table into tables that each describe one kind of thing', 'Use the normal forms as a plain-words checklist'],
        level: 'beginner', introduces: [],
        body: `
<p>Suppose Ada had kept her loans in one wide table, like a spreadsheet: member, city, title and author on every loan. Sam has two books, so “Sam, Rivertown” sat in two rows. When Sam moved to Hillside, the app changed one of them. Now the table says Sam lives in two cities, and no query can tell which is true.</p>
<p>Copies cause three kinds of trouble, called <em>anomalies</em>. To change a fact you must find every copy, and missing one makes the data disagree. Deleting a row can erase a fact you still need: when Noor returned her only book, her row went, and with it everything the app knew about her. And you can’t store a new member who hasn’t borrowed anything yet without leaving the book columns empty.</p>
<p>The cure is one table per kind of thing, linked by keys: <code>members</code> (who), <code>books</code> (what), and <code>loans</code>, which holds only <code>book_id</code> and <code>member_id</code>. Sam’s city is now written once. To see the wide view again, join the tables, one <code>JOIN ... ON</code> for each extra table. Designing tables this way is called <em>normalization</em>.</p>
<p>Textbooks describe it in steps called <em>normal forms</em>. In plain words: first normal form, one value per cell, so no “Night Train, Paper Birds” in one cell. Second and third: every column describes the thing its table’s key names, and nothing else. A city describes a member, so it belongs in <code>members</code>, not in <code>loans</code>.</p>`,
        visual(el) {
          const S = [['Sam', 'Rivertown', 'Night Train', 'Mia Hart'], ['Noor', 'Rivertown', 'Rain at Dawn', 'Mia Hart'], ['Sam', 'Rivertown', 'Paper Birds', 'Ines Costa']];
          const SC = ['member', 'city', 'title', 'author'];
          const S2 = [['Sam', 'Hillside', 'Night Train', 'Mia Hart'], S[1], S[2]];
          const sheet = (rows, cls) => n => n.append(tbl('loan_sheet', SC, rows, { cls }));
          const split = (city, cls) => n => n.append(
            tbl('members', ['id', 'name', 'city'], [[1, 'Sam', city], [2, 'Lin', 'Lakeside'], [3, 'Noor', 'Rivertown']], { keys: { id: 'PK' }, cls }),
            tbl('books (id, title, author)', ['id', 'title', 'author'], [[1, 'Rain at Dawn', 'Mia Hart'], [2, 'The Quiet Sea', 'Leo Brandt'], [3, 'Night Train', 'Mia Hart'], [4, 'Paper Birds', 'Ines Costa'], [5, 'Small Rooms', 'Leo Brandt']], { keys: { id: 'PK' } }),
            tbl('loans', ['id', 'book_id', 'member_id'], [[1, 3, 1], [2, 1, 3], [3, 4, 1]], { keys: { book_id: 'FK', member_id: 'FK' } }));
          Lab.ui.terminal(el, {
            prompt: 'sqlite>',
            panelTitle: 'library.db',
            predict: {
              q: 'Sam has two loans, so the wide table holds his city twice. The app changes only the Night Train row to Hillside. What does a query for Sam’s city give?',
              options: ['Hillside', 'Hillside and Rivertown', 'Rivertown'],
              a: 1,
              why: 'One copy changed, the other did not. The table now says two different things.',
            },
            frames: [
              { cmd: 'CREATE TABLE loan_sheet (member TEXT, city TEXT, title TEXT, author TEXT);', panel: sheet(S), say: 'Suppose Ada had used one wide table, <code>loan_sheet</code>. She adds three loans with three <code>INSERT</code> lines (all the set-up lines are in the code below). Sam and his city appear twice.' },
              { cmd: 'SELECT * FROM loan_sheet;', out: 'Sam|Rivertown|Night Train|Mia Hart\nNoor|Rivertown|Rain at Dawn|Mia Hart\nSam|Rivertown|Paper Birds|Ines Costa', say: 'Every row carries the member’s city and the book’s author along with the loan.' },
              { cmd: "UPDATE loan_sheet SET city = 'Hillside' WHERE title = 'Night Train';", panel: sheet(S2, (r, i) => i === 0 ? 'dbx-warm' : null), say: 'Sam moved. The app changed the row it was showing: the Night Train loan.' },
              { cmd: "SELECT member, city FROM loan_sheet WHERE member = 'Sam';", out: 'Sam|Hillside\nSam|Rivertown', panel: sheet(S2, (r, i) => i !== 1 ? 'dbx-bad' : null), say: 'Two answers for one fact. The copy nobody changed now disagrees.' },
              { cmd: "DELETE FROM loan_sheet WHERE title = 'Rain at Dawn';", panel: sheet([S2[0], S2[2]]), say: 'Noor returns her book, so her loan row goes…' },
              { cmd: "SELECT * FROM loan_sheet WHERE member = 'Noor';", say: '…and with it, everything the table knew about Noor. She is still a member, but the data has forgotten her.' },
              { panel: split('Rivertown'), say: 'The fix: one table per kind of thing, linked by keys. Each fact is written once. Sam is member 1, Lin 2 and Noor 3. Lin has no loans, and she is still on record. The code below builds these tables.' },
              { cmd: "UPDATE members SET city = 'Hillside' WHERE id = 1;", panel: split('Hillside', r => r[0] === 1 ? 'dbx-hit' : null), say: 'Now Sam’s move changes exactly one row, and every join shows Hillside.' },
            ],
          });
        },
        code: `-- the wide table for the demo
CREATE TABLE loan_sheet (member TEXT, city TEXT, title TEXT, author TEXT);
INSERT INTO loan_sheet VALUES ('Sam', 'Rivertown', 'Night Train', 'Mia Hart');
INSERT INTO loan_sheet VALUES ('Noor', 'Rivertown', 'Rain at Dawn', 'Mia Hart');
INSERT INTO loan_sheet VALUES ('Sam', 'Rivertown', 'Paper Birds', 'Ines Costa');

-- the better design: it replaces the loans table from the keys lesson
DROP TABLE loans;
CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
INSERT INTO members VALUES (1, 'Sam', 'Rivertown');
INSERT INTO members VALUES (2, 'Lin', 'Lakeside');
INSERT INTO members VALUES (3, 'Noor', 'Rivertown');
CREATE TABLE loans (
    id INTEGER PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    member_id INTEGER REFERENCES members(id)
);
INSERT INTO loans VALUES (1, 3, 1);
INSERT INTO loans VALUES (2, 1, 3);
INSERT INTO loans VALUES (3, 4, 1);

-- Sam moves: one row changes
UPDATE members SET city = 'Hillside' WHERE id = 1;

-- the wide view, built again with joins
SELECT members.name, members.city, books.title
FROM loans
JOIN members ON loans.member_id = members.id
JOIN books ON loans.book_id = books.id;
-- Sam|Hillside|Night Train
-- Noor|Rivertown|Rain at Dawn
-- Sam|Hillside|Paper Birds`,
        remember: 'Write each fact once: one table per kind of thing, linked by keys, and joins to put them back together.',
        mistakes: [
          { title: 'A list in one cell', bad: `CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT, books TEXT);
INSERT INTO members VALUES (1, 'Sam', 'Night Train, Paper Birds');
SELECT name FROM members WHERE books = 'Paper Birds';
-- prints nothing`, good: `-- one row per loan, pointing at members and books
SELECT * FROM loans WHERE member_id = 1;
-- 1|3|1
-- 3|4|1`, why: 'A cell holding two titles matches neither title exactly. One row per loan keeps one value per cell, so <code>WHERE</code> and joins work.' },
        ],
        terms: [
          { term: 'normalization', def: 'Designing tables so each fact is stored once, with keys linking the tables.' },
          { term: 'normal forms', def: 'Checklist steps for normalization. In plain words: one value per cell, and every column describes what its table’s key names.' },
          { term: 'anomaly', def: 'A problem caused by copies: an update that misses a copy, a delete that erases a fact you still need, or a fact you can’t store yet.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the loans table so it points at a member by id instead of copying the name.', code: 'CREATE TABLE loans (\n    id INTEGER PRIMARY KEY,\n    book_id INTEGER REFERENCES books(id),\n    member_id INTEGER [[REFERENCES|references]] [[members]](id)\n);', why: '<code>member_id</code> is a foreign key that points at <code>members(id)</code>.' },
          { type: 'bug', prompt: 'In the new design, Sam (member 1) moved to Hillside. Tap the wrong line.', code: "SELECT name, city FROM members WHERE id = 1;\nUPDATE loans SET city = 'Hillside' WHERE member_id = 1;\nSELECT name, city FROM members WHERE id = 1;", bug: 1, fix: "UPDATE members SET city = 'Hillside' WHERE id = 1;", why: 'The city now lives only in <code>members</code>. <code>loans</code> has no <code>city</code> column, so SQLite says <code>Parse error: no such column: city</code>.' },
        ],
        quiz: [
          { q: 'A table copies each member’s city into every loan. What can go wrong?', options: ['Changing the city in one row leaves other rows saying something else', 'The table runs out of columns', 'SQLite refuses text it has seen before'], a: 0, why: 'Every copy must change together, and it is easy to miss one.' },
          { q: 'In Ada’s design, where does a member’s city belong?', options: ['In <code>members</code>', 'In <code>loans</code>', 'In <code>books</code>'], a: 0, why: 'A city describes a member, so it sits next to the member’s key.' },
          { q: 'What is first normal form, in plain words?', options: ['One value per cell', 'Every table has one row', 'Use only one table'], a: 0, why: 'No lists like “Night Train, Paper Birds” packed into a single cell.' },
        ],
        docs: [['Database normalization description', 'https://learn.microsoft.com/en-us/office/troubleshoot/access/database-normalization-description']],
      },

      {
        id: 'indexes',
        title: 'Indexes',
        tagline: 'A sorted lookup list that lets the database jump straight to a row.',
        goals: ['Explain why a search in a big table is slow without an index', 'Make an index with <code>CREATE INDEX</code> and check it with <code>EXPLAIN QUERY PLAN</code>', 'Name the cost: every change also updates the index'],
        level: 'intermediate', introduces: ['INDEX', 'EXPLAIN', 'QUERY', 'PLAN', 'timer'],
        body: `
<p>Ada’s app grows to a million books, and the search box gets slow. To answer <code>WHERE title = 'Night Train'</code>, SQLite reads all million rows and checks each title, because the rows are not stored in title order. That is a <em>full scan</em>.</p>
<p>An <em>index</em> is an extra, sorted list kept next to the table: every title in alphabetical order, each with the place of its row. Like the index at the back of a book, it lets SQLite jump to the right spot instead of reading every page. <code>CREATE INDEX books_by_title ON books(title);</code> makes one; <code>books_by_title</code> is a name you choose. From then on, SQLite uses it by itself whenever it helps. The primary key already works this way, which is why <code>WHERE id = 734512</code> is fast without any extra index.</p>
<p>To see what SQLite will do, put <code>EXPLAIN QUERY PLAN</code> in front of a query. <code>SCAN books</code> means it reads every row; <code>SEARCH books USING INDEX</code> means it jumps. In <code>sqlite3</code>, <code>.timer on</code> prints how long each command took.</p>
<p>An index is not free. It takes space in the file, and every <code>INSERT</code>, <code>UPDATE</code> and <code>DELETE</code> must update every index on the table too. So add indexes for the searches your app runs often, not for every column.</p>`,
        visual(el) {
          const stat = (idx, read) => `<div class="dbx-stats"><span class="dbx-stat">rows <b>1,000,000</b></span><span class="dbx-stat">index on title <b>${idx}</b></span><span class="dbx-stat">rows read <b>${read}</b></span></div>`;
          Lab.ui.terminal(el, {
            prompt: 'sqlite>',
            panelTitle: 'books (test copy)',
            predict: {
              q: 'There is no index yet. To find Night Train among a million books, how many rows does SQLite read?',
              options: ['About one', 'All one million', 'About half'],
              a: 1,
              why: 'The rows are not in title order, so any of them could be Night Train. It checks every one.',
            },
            frames: [
              { panel: stat('none', '?'), say: 'Ada made a test file with a million made-up books, using the set-up lines at the top of the code below. One of them is Night Train.' },
              { cmd: '.timer on', say: '<code>.timer on</code> makes <code>sqlite3</code> print how long each command takes.' },
              { cmd: "SELECT * FROM books WHERE title = 'Night Train';", out: '734512|Night Train|Mia Hart|2021|3\nRun Time: real 0.176 user 0.046504 sys 0.010557', panel: stat('none', '1,000,000'), say: 'Found, after 0.176 seconds (the <code>real</code> time). That is slow for a search box that asks on every key press. Times differ from computer to computer.' },
              { cmd: "EXPLAIN QUERY PLAN SELECT * FROM books WHERE title = 'Night Train';", out: 'QUERY PLAN\n`--SCAN books\nRun Time: real 0.000 user 0.000049 sys 0.000010', say: '<code>SCAN books</code>: read every row. <code>EXPLAIN QUERY PLAN</code> only describes the plan, so it is instant.' },
              { cmd: 'CREATE INDEX books_by_title ON books(title);', out: 'Run Time: real 0.988 user 0.334242 sys 0.076213', panel: stat('books_by_title', '?'), say: 'Building the index sorts a million titles once. That took about a second.' },
              { cmd: "SELECT * FROM books WHERE title = 'Night Train';", out: '734512|Night Train|Mia Hart|2021|3\nRun Time: real 0.000 user 0.000109 sys 0.000025', panel: stat('books_by_title', 'a handful'), say: 'Same query, same answer, now too fast to measure: 0.000 seconds.' },
              { cmd: "EXPLAIN QUERY PLAN SELECT * FROM books WHERE title = 'Night Train';", out: 'QUERY PLAN\n`--SEARCH books USING INDEX books_by_title (title=?)\nRun Time: real 0.000 user 0.000025 sys 0.000006', say: '<code>SEARCH ... USING INDEX</code>: SQLite jumps through the sorted titles straight to Night Train.' },
              { cmd: "EXPLAIN QUERY PLAN SELECT * FROM books WHERE author = 'Mia Hart';", out: 'QUERY PLAN\n`--SCAN books\nRun Time: real 0.000 user 0.000051 sys 0.000011', say: 'An index helps only searches on its own column. A search by author still scans.' },
            ],
          });
        },
        code: `-- Set-up: run sqlite3 test.db (a separate file, so library.db stays small),
-- then paste these three lines as they are. They make a million made-up books.
CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, year INTEGER, copies INTEGER);
INSERT INTO books SELECT value, 'Book ' || value, 'Writer ' || (value % 1000), 2000 + value % 25, 1 FROM generate_series(1, 1000000);
UPDATE books SET title = 'Night Train', author = 'Mia Hart', year = 2021, copies = 3 WHERE id = 734512;

-- now the demo's commands, starting with .timer on
CREATE INDEX books_by_title ON books(title);

EXPLAIN QUERY PLAN SELECT * FROM books WHERE title = 'Night Train';
-- QUERY PLAN
-- \`--SEARCH books USING INDEX books_by_title (title=?)

EXPLAIN QUERY PLAN SELECT * FROM books WHERE author = 'Mia Hart';
-- QUERY PLAN
-- \`--SCAN books`,
        ignore: ['value'],
        remember: 'An index is a sorted list that turns a SCAN of every row into a quick SEARCH. It costs space and slows every write a little.',
        mistakes: [
          { title: 'An index on every column', bad: `CREATE INDEX i1 ON books(title);
CREATE INDEX i2 ON books(author);
CREATE INDEX i3 ON books(year);
CREATE INDEX i4 ON books(copies);`, good: `-- only for the search the app really runs
CREATE INDEX books_by_title ON books(title);`, why: 'Every index must be updated on every write, and takes space. In one test with 300,000 books, the file was 12.6 MB with no extra index, 20.8 MB with one and 31.1 MB with three.' },
        ],
        terms: [
          { term: 'full scan', def: 'Reading every row to answer a query. <code>EXPLAIN QUERY PLAN</code> shows it as <code>SCAN</code>.' },
          { term: 'index', def: 'A sorted list of one column’s values, each pointing at its row, made with <code>CREATE INDEX</code>.' },
          { term: 'query plan', def: 'How SQLite will run a query. <code>EXPLAIN QUERY PLAN</code> prints it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make an index so searches by author jump instead of scanning.', code: '[[CREATE INDEX|create index]] books_by_author [[ON|on]] books([[author]]);', why: 'After this, <code>WHERE author = \'Mia Hart\'</code> shows <code>SEARCH books USING INDEX books_by_author</code>.' },
          { type: 'bug', prompt: 'Ada wants to check that her title search uses the index. Tap the wrong line.', code: "CREATE INDEX books_by_title ON books(title);\nQUERY PLAN SELECT * FROM books WHERE title = 'Night Train';", bug: 1, fix: "EXPLAIN QUERY PLAN SELECT * FROM books WHERE title = 'Night Train';", why: 'The command is <code>EXPLAIN QUERY PLAN</code>. Without <code>EXPLAIN</code>, SQLite says <code>Parse error: near "QUERY": syntax error</code>.' },
        ],
        quiz: [
          { q: 'The plan says <code>SCAN books</code>. What does SQLite do?', options: ['Reads every row', 'Jumps to the row through an index', 'Sorts the table'], a: 0, why: 'A scan reads the whole table.' },
          { q: 'What does an index cost?', options: ['Nothing', 'Space, plus extra work on every <code>INSERT</code>, <code>UPDATE</code> and <code>DELETE</code>', 'It makes every <code>SELECT</code> slower'], a: 1, why: 'The sorted list has to be kept up to date on every write.' },
          { q: 'There is an index on <code>title</code> only. Which search can use it?', options: ["<code>WHERE title = 'Night Train'</code>", "<code>WHERE author = 'Mia Hart'</code>", '<code>WHERE year = 2021</code>'], a: 0, why: 'An index helps searches on the column it sorts.' },
        ],
        docs: [['SQLite: CREATE INDEX', 'https://www.sqlite.org/lang_createindex.html'], ['SQLite: EXPLAIN QUERY PLAN', 'https://www.sqlite.org/eqp.html']],
      },

      {
        id: 'transactions',
        title: 'Transactions',
        tagline: 'Several changes that happen all together, or not at all.',
        goals: ['Group changes with <code>BEGIN</code> and <code>COMMIT</code>', 'Throw away a half-done group with <code>ROLLBACK</code>', 'Explain ACID in plain words'],
        level: 'intermediate', introduces: ['BEGIN', 'COMMIT', 'ROLLBACK'],
        body: `
<p>Borrowing a book takes two changes: one copy fewer in <code>books</code>, and a new row in <code>loans</code>. If the first works and the second fails, a copy has vanished: the count went down, but no loan says who has it. The data is now wrong, and nothing points at the mistake.</p>
<p>A <em>transaction</em> groups changes so they count as one. <code>BEGIN;</code> starts it. The changes after it are not final until <code>COMMIT;</code> makes all of them permanent at once. If something goes wrong on the way, <code>ROLLBACK;</code> throws all of them away, and the data is exactly as it was before <code>BEGIN</code>.</p>
<p>In SQLite, a command that fails inside a transaction cancels only itself. The transaction stays open, with the earlier changes still in it, and you decide: <code>ROLLBACK</code> to undo the lot. Without <code>BEGIN</code>, every command is its own small transaction, final as soon as it finishes.</p>
<p>Databases make four promises about transactions, known as <em>ACID</em>. Atomic: all of it or none of it. Consistent: the rules, like foreign keys, still hold afterwards. Isolated: someone reading at the same time sees the data before your transaction or after it, never halfway. Durable: once <code>COMMIT</code> is done, the change survives even if the app or phone crashes right after.</p>`,
        visual(el) {
          const err = s => `<span class="dbx-fail">${esc(s)}</span>`;
          const show = (copies, cls) => n => n.append(
            tbl('books (id 5)', ['id', 'title', 'copies'], [[5, 'Small Rooms', copies]], { cls: () => cls || null }),
            tbl('loans', ['id', 'book_id', 'member_id'], [[1, 3, 1], [2, 1, 3], [3, 4, 1]]));
          Lab.ui.terminal(el, {
            prompt: 'sqlite>',
            panelTitle: 'library.db',
            predict: {
              q: 'Inside a transaction, the copies of Small Rooms went from 2 to 1, then the loan was refused. Ada runs <code>ROLLBACK;</code>. How many copies now?',
              options: ['1', '2', '0'],
              a: 1,
              why: '<code>ROLLBACK</code> undoes every change since <code>BEGIN</code>, including the one that worked.',
            },
            frames: [
              { panel: show(2), say: 'Lin (member 2) wants Small Rooms, book 5. That takes two changes: copies 2 → 1, and a new loan. The tables are the ones from the last lessons.' },
              { cmd: 'PRAGMA foreign_keys = ON;', say: 'Link checks on, as always.' },
              { cmd: 'BEGIN;', say: 'From here on, changes are not final.' },
              { cmd: 'UPDATE books SET copies = copies - 1 WHERE id = 5;', panel: show(1, 'dbx-warm'), say: 'One copy fewer, but not final yet.' },
              { cmd: 'INSERT INTO loans VALUES (4, 5, 9);', out: err('Runtime error: FOREIGN KEY constraint failed (19)'), say: 'A bug in the app sent member 9 instead of 2. There is no member 9, so the loan is refused.' },
              { cmd: 'SELECT copies FROM books WHERE id = 5;', out: '1', panel: show(1, 'dbx-bad'), say: 'The <code>UPDATE</code> is still in the open transaction: 1 copy, and no loan. Half done.' },
              { cmd: 'ROLLBACK;', panel: show(2, 'dbx-hit'), say: '<code>ROLLBACK</code> throws away everything since <code>BEGIN</code>.' },
              { cmd: 'SELECT copies FROM books WHERE id = 5;', out: '2', say: 'Back to 2, as if nothing happened. The app can show an error and try again with Lin’s real id.' },
            ],
          });
        },
        code: `BEGIN;
UPDATE books SET copies = copies - 1 WHERE id = 5;
INSERT INTO loans VALUES (4, 5, 2);
COMMIT;

SELECT copies FROM books WHERE id = 5;
-- 1
SELECT * FROM loans WHERE id = 4;
-- 4|5|2`,
        remember: 'BEGIN, the changes, then COMMIT to keep them all or ROLLBACK to drop them all.',
        mistakes: [
          { title: 'Two changes without a transaction', bad: `UPDATE books SET copies = copies - 1 WHERE id = 5;
INSERT INTO loans VALUES (4, 5, 9);
-- Runtime error: FOREIGN KEY constraint failed (19)
-- copies is now 1, and no loan exists`, good: `BEGIN;
UPDATE books SET copies = copies - 1 WHERE id = 5;
INSERT INTO loans VALUES (4, 5, 9);
-- Runtime error: FOREIGN KEY constraint failed (19)
ROLLBACK;
-- copies is back to 2`, why: 'Without <code>BEGIN</code>, the <code>UPDATE</code> is final the moment it runs, even when the next step fails.' },
        ],
        terms: [
          { term: 'transaction', def: 'A group of changes that count as one: all of them happen, or none do.' },
          { term: 'COMMIT, ROLLBACK', def: '<code>COMMIT</code> makes every change since <code>BEGIN</code> permanent; <code>ROLLBACK</code> throws them all away.' },
          { term: 'ACID', def: 'Atomic (all or nothing), Consistent (rules still hold), Isolated (nobody sees it halfway), Durable (a commit survives a crash).' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Noor (member 3) borrows Night Train (book 3). Make the two changes count as one.', code: '[[BEGIN|begin]];\nUPDATE books SET copies = copies - 1 WHERE id = 3;\nINSERT INTO loans VALUES (5, 3, 3);\n[[COMMIT|commit]];', why: '<code>BEGIN</code> opens the transaction and <code>COMMIT</code> makes both changes permanent together.' },
          { type: 'bug', prompt: 'The loan was refused, so Ada wants to undo the whole borrow. Tap the wrong line.', code: 'BEGIN;\nUPDATE books SET copies = copies - 1 WHERE id = 5;\nINSERT INTO loans VALUES (4, 5, 9);\nCOMMIT;', bug: 3, fix: 'ROLLBACK;', why: '<code>COMMIT</code> keeps the <code>UPDATE</code> that worked: 1 copy and no loan. <code>ROLLBACK</code> undoes it.' },
        ],
        quiz: [
          { q: 'What does <code>ROLLBACK;</code> undo?', options: ['Only the last command', 'Every change since <code>BEGIN</code>', 'Every change ever made'], a: 1, why: 'It drops the whole open transaction.' },
          { q: 'Which letter of ACID means “all of it or none of it”?', options: ['A, atomic', 'D, durable', 'I, isolated'], a: 0, why: 'Atomic: the group can’t be split.' },
          { q: 'Ada runs <code>COMMIT;</code> with no <code>BEGIN</code> before it. What does <code>sqlite3</code> say?', options: ['Nothing', '<code>Runtime error: cannot commit - no transaction is active</code>', 'It commits the last command again'], a: 1, why: 'Without <code>BEGIN</code>, each command was already final, so there is nothing to commit.' },
        ],
        docs: [['SQLite: Transaction', 'https://www.sqlite.org/lang_transaction.html']],
      },

      {
        id: 'nosql',
        title: 'Other kinds of databases',
        tagline: 'Not every database is made of tables.',
        goals: ['Describe a key-value store and a document store', 'Say what each is good at, and when tables are better', 'Pick a fitting kind of store for a piece of app data'],
        level: 'intermediate', introduces: [],
        body: `
<p>Ada’s app also remembers small settings, like whether the screen is dark or light. A whole table for one value feels heavy. And a member’s profile page shows everything about that person at once. Databases that don’t use tables are often called <em>NoSQL</em> databases. Two kinds are common.</p>
<p>A <em>key-value store</em> works like a Kotlin <code>Map</code> that is saved to disk: you store a value under a key, like <code>"theme" to "dark"</code>, and get it back by that key. It is simple and fast, but it can only find things by their key. Android has one built in for settings like these, called DataStore.</p>
<p>A <em>document store</em> keeps each item as one <em>document</em>: a nested piece of data, usually written in <em>JSON</em>, a text format of names and values inside curly braces, and lists in square brackets. A member’s document can hold the name, the city and a list of loans with the book titles inside. One read brings back the whole profile, no join needed.</p>
<p>The price is the problem from the normalization lesson. If the same title sits inside many members’ documents, a corrected title must be fixed in every one of them. Tables with keys suit data that is shared, linked and must agree; key-value stores suit lookups by one key; documents suit data that is mostly read as one piece.</p>`,
        visual(el) {
          const doc = (name, city, loans, cls) => h('pre', { class: 'dbx-doc' + (cls ? ' ' + cls : ''), html: `{\n  "name": "${name}",\n  "city": "${city}",\n  "loans": [\n${loans.map(t => `    { "title": ${t} }`).join(',\n')}\n  ]\n}` });
          const mark = t => `<b class="dbx-fail">"${t}"</b>`;
          const ok = t => `<b class="dbx-pass">"${t}"</b>`;
          const views = [
            () => [label('tables'), tbl('members', ['id', 'name', 'city'], [[1, 'Sam', 'Hillside']], { keys: { id: 'PK' } }), tbl('loans', ['id', 'book_id', 'member_id'], [[1, 3, 1], [3, 4, 1]]), tbl('books', ['id', 'title'], [[3, 'Night Train'], [4, 'Paper Birds']], { keys: { id: 'PK' } })],
            () => [label('document store: key 1'), doc('Sam', 'Hillside', ['"Night Train"', '"Paper Birds"'])],
            () => [label('key-value store'), tbl(null, ['key', 'value'], [['theme', 'dark'], ['font_size', '18'], ['last_screen', 'loans']])],
            () => [label('key-value store'), tbl(null, ['key', 'value'], [['theme', 'dark'], ['font_size', '18'], ['last_screen', 'loans']], { cls: r => r[0] === 'theme' ? 'dbx-hit' : 'dbx-dim' })],
            () => [label('document store'), doc('Sam', 'Hillside', [mark('Night Train'), '"Paper Birds"']), doc('Noor', 'Rivertown', ['"Rain at Dawn"', mark('Night Train')])],
            () => [label('document store'), doc('Sam', 'Hillside', [ok('The Night Train'), '"Paper Birds"']), doc('Noor', 'Rivertown', ['"Rain at Dawn"', mark('Night Train')])],
            () => [label('tables'), tbl('books', ['id', 'title'], [[3, 'The Night Train'], [4, 'Paper Birds']], { keys: { id: 'PK' }, cls: r => r[0] === 3 ? 'dbx-hit' : null })],
          ];
          const frames = [
            { v: 0, say: 'In tables, Sam’s profile is spread over three tables. Showing it takes a join.' },
            { v: 1, say: 'In a document store, the whole profile is one document, stored under its key. One read, no join. The titles are copied inside.' },
            { v: 2, say: 'A key-value store: names and values, like a Kotlin <code>Map</code>. Good for settings.' },
            { v: 3, say: 'Asking for <code>theme</code> gives <code>dark</code> at once. A question like “which keys hold dark?” means reading every pair.' },
            { v: 4, say: 'Noor borrows Night Train too. Now that title is copied into two documents.' },
            { v: 5, say: 'The title is corrected to “The Night Train”. Every document holding a copy must be found and changed. Miss one, and they disagree, just like the wide table.' },
            { v: 6, say: 'In tables, the title lives in one row of <code>books</code>. One <code>UPDATE</code>, and every join shows the new title.' },
          ];
          const view = h('div', { class: 'dbx-stage' });
          Lab.ui.player(el, {
            frames,
            stage: h('div', { class: 'ui-stage' }, view),
            draw(f) { view.replaceChildren(...views[f.v]()); },
            predict: {
              q: 'Sam’s and Noor’s documents both hold the title Night Train. The title gets corrected. How many places must change?',
              options: ['1', '2', 'None: the store fixes it'],
              a: 1,
              why: 'Each document keeps its own copy, so each copy must change.',
            },
          });
        },
        code: `{
  "id": 1,
  "name": "Sam",
  "city": "Hillside",
  "loans": [
    { "title": "Night Train", "author": "Mia Hart" },
    { "title": "Paper Birds", "author": "Ines Costa" }
  ]
}`,
        remember: 'Tables for linked data that must agree, key-value for lookups by key, documents for data read as one piece.',
        terms: [
          { term: 'NoSQL', def: 'A name for databases that don’t keep data in tables, such as key-value and document stores.' },
          { term: 'key-value store', def: 'Stores values under keys, like a Kotlin <code>Map</code> saved to disk. Finds things only by key.' },
          { term: 'document store', def: 'Stores each item as one nested document, so it can be read in one go.' },
          { term: 'JSON', def: 'A text format for data: names and values in curly braces, lists in square brackets.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A key-value store works like this Kotlin map. Get the theme back by its key.', code: 'val settings = mutableMapOf("theme" to "dark", "font_size" to "18")\nprintln(settings.[[get]]("theme"))   // dark', why: 'You ask by key, and get that one value back.' },
          { type: 'bug', prompt: 'This settings store should print <code>dark</code>, but prints <code>null</code>. Tap the wrong line.', code: 'val settings = mutableMapOf("theme" to "light")\nsettings["theme"] = "dark"\nprintln(settings["Theme"])', bug: 2, fix: 'println(settings["theme"])', why: 'Keys must match exactly, capital letters included. There is no key <code>"Theme"</code>.' },
        ],
        quiz: [
          { q: 'Which fits the app’s dark-mode setting best?', options: ['A key-value store', 'Three tables and a join', 'One document per book'], a: 0, why: 'One value, found by one key.' },
          { q: 'Documents copy a book’s title into each member who borrowed it. What is the risk?', options: ['A correction must reach every copy, or they disagree', 'Documents can’t hold text', 'Each read needs a join'], a: 0, why: 'The same problem as copies in a wide table.' },
          { q: 'What can a key-value store find quickly?', options: ['The value for one key', 'Every key whose value is <code>dark</code>', 'Rows joined with another table'], a: 0, why: 'It is built to look things up by key, and only by key.' },
        ],
        docs: [['DataStore', 'https://developer.android.com/topic/libraries/architecture/datastore']],
      },

      {
        id: 'schema-evolution',
        title: 'Changing a schema',
        tagline: 'Change the shape of a database that already holds people’s data.',
        goals: ['Add a column to an existing table with <code>ALTER TABLE</code> … <code>ADD COLUMN</code>', 'Number schema versions and write one migration per step', 'Keep old code working by adding instead of renaming'],
        level: 'intermediate', introduces: ['ALTER', 'ADD', 'COLUMN', 'user_version', 'RENAME', 'TO'],
        body: `
<p>Version 1 of Ada’s app is on thousands of phones, each with its own <code>library.db</code> full of that person’s loans. Version 2 needs an email for each member. She can’t delete the database and start over: that would wipe everyone’s data.</p>
<p>The <em>schema</em> is the shape of a database: its tables and their columns. A <em>migration</em> is a short script that changes the schema from one version to the next and keeps the rows. <code>ALTER TABLE members ADD COLUMN email TEXT;</code> adds a column to the existing table. Old rows get <code>NULL</code> there, “no value”, as with a column left out of an <code>INSERT</code>. <code>sqlite3</code> prints it as nothing at all.</p>
<p>The database has to remember which version it is at. SQLite keeps a number for that: <code>PRAGMA user_version;</code> reads it, and <code>PRAGMA user_version = 2;</code> sets it. When the new app starts, it reads the number and runs each migration it is missing, in order, inside a transaction. Someone who skipped version 2 and installs version 3 gets 1→2, then 2→3. Room, the library Android apps use on top of SQLite, uses this same number.</p>
<p>Renaming or removing breaks code that still uses the old name. After <code>RENAME COLUMN name TO full_name</code>, every query that says <code>name</code> fails. When many app versions share one database on a <em>server</em> (a computer on the internet that many phones talk to), old versions keep running for months. So prefer changes that only add, and remove the old parts later, once nothing uses them.</p>`,
        visual(el) {
          const err = s => `<span class="dbx-fail">${esc(s)}</span>`;
          const M = [[1, 'Sam', 'Hillside'], [2, 'Lin', 'Lakeside'], [3, 'Noor', 'Rivertown']];
          const ver = v => `<p class="dbx-label">user_version ${v}</p>`;
          const show = (v, cols, rows, cls) => n => { n.innerHTML = ver(v); n.append(tbl('members', cols, rows, { keys: { id: 'PK' }, cls })); };
          const withEmail = M.map(r => [...r, null]);
          Lab.ui.terminal(el, {
            prompt: 'sqlite>',
            panelTitle: 'library.db on a phone',
            predict: {
              q: '<code>members</code> has 3 rows. After <code>ALTER TABLE members ADD COLUMN email TEXT;</code>, how many rows does it have?',
              options: ['0: the table is rebuilt empty', '3, each with no email yet', '6'],
              a: 1,
              why: 'Adding a column keeps every row. The new column starts with no value.',
            },
            frames: [
              { cmd: 'PRAGMA user_version = 1;', panel: show(1, ['id', 'name', 'city'], M), say: 'The database on a phone with app version 1. A new database starts at <code>user_version</code> 0; app version 1 set it to 1 when it made the database. Run this line to do the same in your <code>library.db</code>.' },
              { cmd: 'PRAGMA user_version;', out: '1', say: 'The schema version this database is at.' },
              { cmd: 'ALTER TABLE members ADD COLUMN email TEXT;', panel: show(1, ['id', 'name', 'city', 'email'], withEmail), say: 'The new column joins the table. Every row stays.' },
              { cmd: 'SELECT * FROM members;', out: '1|Sam|Hillside|\n2|Lin|Lakeside|\n3|Noor|Rivertown|', say: 'Nothing after the last <code>|</code>: the old rows hold <code>NULL</code>, no value yet.' },
              { cmd: 'PRAGMA user_version = 2;', panel: show(2, ['id', 'name', 'city', 'email'], withEmail), say: 'Record that the migration is done, so it never runs twice.' },
              { cmd: 'ALTER TABLE members ADD COLUMN email TEXT;', out: err('Parse error: duplicate column name: email'), say: 'This is why the number matters: the same migration a second time fails.' },
              { cmd: 'ALTER TABLE members RENAME COLUMN name TO full_name;', panel: show(2, ['id', 'full_name', 'city', 'email'], withEmail, () => 'dbx-warm'), say: 'Now a rename. It works on the database…' },
              { cmd: 'SELECT name FROM members;', out: err('Parse error: no such column: name\n  SELECT name FROM members;\n         ^--- error here'), say: '…but every query that still says <code>name</code> now fails. Old code breaks.' },
            ],
          });
        },
        code: `-- migration 1 → 2, run once when app version 2 first opens the database
-- (the demo already added email to your library.db, so there this ALTER TABLE
-- would print: Parse error: duplicate column name: email)
BEGIN;
ALTER TABLE members ADD COLUMN email TEXT;
PRAGMA user_version = 2;
COMMIT;

SELECT * FROM members;
-- 1|Sam|Hillside|
-- 2|Lin|Lakeside|
-- 3|Noor|Rivertown|`,
        remember: 'A migration changes the schema one version at a time and keeps the rows. Add new things; remove old ones only when nothing uses them.',
        mistakes: [
          { title: 'Renaming a column old code still reads', bad: `ALTER TABLE members RENAME COLUMN name TO full_name;
SELECT name FROM members;
-- Parse error: no such column: name`, good: `ALTER TABLE members ADD COLUMN full_name TEXT;
UPDATE members SET full_name = name;
-- both columns exist, so old code keeps reading name`, why: 'On one phone, the app code and its migration update together, so a rename there is fine. The add-and-copy way matters when old code may still read the database, like old app versions talking to a server. Drop the old column later, once no running code uses it.' },
        ],
        terms: [
          { term: 'schema', def: 'The shape of a database: its tables and their columns.' },
          { term: 'migration', def: 'A script that moves the schema from one version to the next and keeps the data.' },
          { term: 'user_version', def: 'A number SQLite keeps in the file for you, used as the schema version: <code>PRAGMA user_version;</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add a whole-number column <code>age</code> to <code>members</code>.', code: '[[ALTER|alter]] TABLE members [[ADD COLUMN|add column]] age [[INTEGER|integer]];', why: '<code>ALTER TABLE ... ADD COLUMN</code> adds it; old rows get <code>NULL</code>.' },
          { type: 'bug', prompt: 'This migration takes the database from version 2 to 3. Tap the wrong line.', code: 'BEGIN;\nALTER TABLE members ADD COLUMN phone TEXT;\nPRAGMA user_version = 2;\nCOMMIT;', bug: 2, fix: 'PRAGMA user_version = 3;', why: 'If the number stays 2, the next start runs this migration again and fails with <code>duplicate column name: phone</code>.' },
        ],
        quiz: [
          { q: 'What do old rows hold in a column added with <code>ADD COLUMN</code>?', options: ['<code>0</code>', '<code>NULL</code>: no value', 'A copy of the column before it'], a: 1, why: 'Nothing was ever stored there, so it is <code>NULL</code>.' },
          { q: 'A phone is at <code>user_version</code> 1, and the new app expects 3. What should run?', options: ['Only migration 2→3', 'Migration 1→2, then 2→3', 'Delete the database and start again'], a: 1, why: 'Each step builds on the one before, so they run in order.' },
          { q: 'Why prefer adding a column over renaming one?', options: ['Old code that uses the old name keeps working', 'SQL has no way to rename', 'Adding is faster to type'], a: 0, why: 'Renaming is possible, but it breaks every query that uses the old name.' },
        ],
        docs: [['SQLite: ALTER TABLE', 'https://www.sqlite.org/lang_altertable.html'], ['Migrate your Room database', 'https://developer.android.com/training/data-storage/room/migrating-db-versions']],
      },
    ],
  });
})();
