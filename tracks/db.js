/* Databases track. Same shape as tracks/kotlin.js.
   A university-style databases course (relational model, SQL, joins, normalization, indexes, transactions,
   NoSQL, schema evolution), tied back to SQLite/Room on Android and to the backend.
   Demos run on a tiny in-memory dataset. There is no SQL parser: each query button carries its own
   hand-written evaluator. Every class is prefixed dbx-. */
(() => {
  const { h, sleep, replay } = Lab;
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = (text = '') => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const c = s => `<code>${esc(s)}</code>`;
  const label = text => h('span', { class: 'dbx-label' }, text);

  function stats(names) {
    const vals = {};
    const root = h('div', { class: 'dbx-stats' }, names.map(n => { const b = h('b', {}, '-'); vals[n] = b; return h('span', { class: 'dbx-stat' }, `${n} `, b); }));
    root.set = (n, v) => { if (vals[n].textContent !== String(v)) { vals[n].textContent = String(v); replay(vals[n], 'pop-soft'); } };
    return root;
  }

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

  // Step player over prepared frames. o.paint(frame, i) draws one; frame.msg is shown below.
  function player(el, o) {
    let frames = o.frames || [{ msg: '' }], i = 0, tok = 0;
    const msg = out('');
    const count = h('span', { class: 'dbx-stat' });
    const stepB = act('Step', () => { tok++; go(i + 1); });
    const runB = act('Run', run);
    const backB = act('Restart', () => { tok++; go(0); });
    function go(n) {
      if (n >= frames.length) return;
      i = n;
      o.paint(frames[i], i, frames);
      if (frames[i].msg != null) say(msg, frames[i].msg);
      count.textContent = `step ${i} of ${frames.length - 1}`;
      stepB.disabled = runB.disabled = i >= frames.length - 1;
    }
    async function run() {
      const t = ++tok;
      while (i < frames.length - 1) {
        go(i + 1);
        await sleep(o.speed || 1100);
        if (t !== tok || !el.isConnected) return;
      }
    }
    el.append(h('div', { class: 'dbx-stage' }, ...(o.top || []), h('div', { class: 'controls' }, stepB, runB, backB, count), ...(o.view || []), msg));
    go(0);
    return { load(fr) { tok++; frames = fr; go(0); } };
  }

  // ---------- the shared dataset ----------
  const USERS = [[1, 'Ayşe', 'İzmir'], [2, 'Mehmet', 'Ankara'], [3, 'Zeynep', 'İzmir'], [4, 'Can', 'İstanbul']];
  const POSTS = [[10, 1, 'Kumru tarifi', 42], [11, 1, 'Kordon yürüyüşü', 17], [12, 2, 'Anıtkabir notları', 8], [13, 3, 'Kotlin ipuçları', 95], [14, 3, 'Room ile cache', 61]];
  const TAGS = [[1, 'food'], [2, 'travel'], [3, 'android']];
  const POST_TAGS = [[10, 1], [10, 2], [11, 2], [12, 2], [13, 3], [14, 3]];
  const userName = id => (USERS.find(u => u[0] === id) || [])[1];

  const css = `
.dbx-stage { display: grid; gap: 12px; min-width: 0; }
.dbx-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-start; min-width: 0; }
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
.dbx-t tr.dbx-g0 td { background: var(--accent-soft); }
.dbx-t tr.dbx-g1 td { background: var(--warm-soft); }
.dbx-t tr.dbx-g2 td { background: var(--ok-soft); }
.dbx-chips { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
.dbx-chip { font: 600 0.74rem var(--mono); padding: 4px 9px; border-radius: 999px; border: 1px solid var(--line); color: var(--muted); background: var(--surface); transition: background 0.2s, color 0.2s; }
.dbx-chip.dbx-on { background: var(--accent-soft); color: var(--ink); border-color: var(--accent); }
.dbx-chip.dbx-off { opacity: 0.35; }
.dbx-chip.dbx-okc { background: var(--ok-soft); color: var(--ink); border-color: var(--ok); }
.dbx-chip.dbx-badc { background: var(--err-soft); color: var(--ink); border-color: var(--err); }
.dbx-stats { display: flex; flex-wrap: wrap; gap: 8px; }
.dbx-stat { font: 500 0.8rem var(--mono); padding: 6px 10px; border-radius: 8px; background: var(--sunk); color: var(--ink); }
.dbx-stat b { color: var(--accent); }
.dbx-sql { font: 500 0.8rem/1.5 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 8px 12px; white-space: pre-wrap; overflow-wrap: anywhere; margin: 0; }
.dbx-doc { font: 500 0.76rem/1.5 var(--mono); background: var(--sunk); color: var(--ink); border-radius: 10px; padding: 8px 12px; white-space: pre-wrap; overflow-wrap: anywhere; margin: 0; min-width: 0; }
.dbx-grid { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 3px; max-width: 360px; width: 100%; }
.dbx-cell { font: 500 0.68rem var(--mono); text-align: center; padding: 5px 0; border-radius: 5px; background: var(--sunk); color: var(--muted); transition: background 0.15s; }
.dbx-cell.dbx-read { background: var(--warm-soft); color: var(--ink); }
.dbx-cell.dbx-found { background: var(--ok); color: var(--bg); }
.dbx-tree { display: grid; gap: 6px; justify-items: start; min-width: 0; }
.dbx-lvl { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.dbx-node { display: inline-flex; flex-wrap: wrap; gap: 2px; border: 1px solid var(--line); border-radius: 8px; padding: 3px; background: var(--surface); }
.dbx-k { font: 600 0.76rem var(--mono); padding: 3px 7px; border-radius: 5px; color: var(--ink); transition: background 0.15s; }
.dbx-k.dbx-cmp { background: var(--warm-soft); }
.dbx-k.dbx-found { background: var(--ok); color: var(--bg); }
.dbx-node.dbx-idle { opacity: 0.35; }
.dbx-log { display: grid; gap: 4px; font: 500 0.78rem/1.45 var(--mono); min-width: 0; }
.dbx-ev { display: flex; gap: 8px; align-items: baseline; padding: 5px 8px; border-radius: 8px; background: var(--surface); border: 1px solid var(--line); min-width: 0; overflow-wrap: anywhere; color: var(--ink); }
.dbx-ev span:last-child { min-width: 0; }
.dbx-ev.dbx-evbad { border-color: var(--err); background: var(--err-soft); }
.dbx-ev.dbx-evok { border-color: var(--ok); }
.dbx-lane { flex: none; font-weight: 700; padding: 1px 6px; border-radius: 5px; }
.dbx-lane.dbx-t1 { background: var(--accent-soft); color: var(--ink); }
.dbx-lane.dbx-t2 { background: var(--warm-soft); color: var(--ink); }
.dbx-lane.dbx-sys { background: var(--sunk); color: var(--muted); }
.dbx-replicas { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 8px; align-items: center; }
.dbx-rep { border: 1px solid var(--line); border-radius: 10px; padding: 10px; background: var(--surface); display: grid; gap: 4px; min-width: 0; text-align: center; color: var(--ink); font: 500 0.8rem var(--mono); }
.dbx-rep b { font-size: 1.3rem; color: var(--accent); }
.dbx-link { font: 700 0.8rem var(--mono); color: var(--ok); }
.dbx-link.dbx-cut { color: var(--err); }
.dbx-pass { color: var(--ok); font-weight: 700; }
.dbx-fail { color: var(--err); font-weight: 700; }
`;

  const lessons = [];

  // 1 ─────────────────────────────────────────────
  lessons.push({
    id: 'relational',
    title: 'The relational model',
    tagline: 'Data as tables of rows, tied together by keys the database checks for you.',
    level: 'beginner',
    body: `
<p>A relational database stores data in <strong>tables</strong> (relations). Each row is one fact, each column has one type. A <strong>primary key</strong> names each row uniquely, like <code>users.id</code>. A <strong>foreign key</strong> is a column that points at another table’s primary key, like <code>posts.user_id</code>.</p>
<p>Why not keep a JSON file? A file works until you need to change one fact that is copied in many places, find a few items without reading everything, or stop two writers from clobbering each other. A database stores each fact once, answers queries without loading the whole file, and refuses bad data: a duplicate id or a post by a user that does not exist.</p>
<p>On Android the database is SQLite, and <a href="#data.room">Room</a> sits on top of it. On the backend it is usually PostgreSQL or MySQL. The model is the same everywhere. Try the demo: break the rules and watch SQLite push back. Note that SQLite only checks foreign keys when the connection turns them on.</p>`,
    visual(el) {
      let users = USERS.map(r => r.slice()), posts = POSTS.map(r => r.slice()), fk = false, mark = null;
      const tables = h('div', { class: 'dbx-row' });
      const json = h('pre', { class: 'dbx-doc' });
      const msg = out('Two tables. posts.user_id points at users.id. Pick an action.');
      const fkB = act('PRAGMA foreign_keys = ON', () => {
        fk = !fk;
        fkB.textContent = fk ? 'PRAGMA foreign_keys = OFF' : 'PRAGMA foreign_keys = ON';
        say(msg, fk ? 'Foreign key checks are on for this connection. Now try the orphan insert.' : 'Checks are off again, the SQLite default. SQLite stores whatever you give it.');
      });
      function paint() {
        tables.replaceChildren(
          tbl('users', ['id', 'name', 'city'], users, { keys: { id: 'PK' }, cls: (r) => mark && mark.t === 'users' && mark.ids.includes(r[0]) ? mark.c : null }),
          tbl('posts', ['id', 'user_id', 'title'], posts.map(p => p.slice(0, 3)), { keys: { id: 'PK', user_id: 'FK' }, cls: (r) => mark && mark.t === 'posts' && mark.ids.includes(r[0]) ? mark.c : null }));
        const name = users[0][1];
        json.textContent = `posts.json (author copied into each post)\n[\n  { "id": 10, "author": "${name}", ... },\n  { "id": 11, "author": "${name}", ... },\n  { "id": 12, "author": "Mehmet", ... }, ...\n]`;
      }
      el.append(h('div', { class: 'dbx-stage' },
        h('div', { class: 'controls' },
          act('Rename Ayşe', () => {
            users[0][1] = users[0][1] === 'Ayşe' ? 'Ayşe K.' : 'Ayşe';
            mark = { t: 'users', ids: [1], c: 'dbx-hit' }; paint();
            say(msg, `${c("UPDATE users SET name = '" + users[0][1] + "' WHERE id = 1")}: one row changed. In the JSON file the name is copied into every post, so you rewrite the whole file and must not miss a copy.`);
          }),
          act('Insert post by user 9', () => {
            if (fk) { mark = null; paint(); say(msg, `<span class="bad">FOREIGN KEY constraint failed</span>. User 9 does not exist, so SQLite rejects the row.`); return; }
            if (!posts.some(p => p[0] === 15)) posts.push([15, 9, 'Kayıp yazı', 0]);
            mark = { t: 'posts', ids: [15], c: 'dbx-bad' }; paint();
            say(msg, `Accepted. Post 15 points at user 9, who does not exist: an <span class="bad">orphan row</span>. Foreign key checks are off by default in SQLite. Turn them on and try again.`);
          }),
          act('Insert post id 10 again', () => {
            mark = { t: 'posts', ids: [10], c: 'dbx-bad' }; paint();
            say(msg, `<span class="bad">UNIQUE constraint failed: posts.id</span>. The primary key already exists. A JSON array would happily hold two objects with id 10.`);
          }),
          fkB),
        tables, json, msg));
      paint();
    },
    code: `@Entity(tableName = "users")
data class User(
    @PrimaryKey val id: Long,
    val name: String,
    val city: String,
)

@Entity(
    tableName = "posts",
    foreignKeys = [ForeignKey(
        entity = User::class,
        parentColumns = ["id"],
        childColumns = ["user_id"],
        onDelete = ForeignKey.CASCADE,     // deleting a user deletes their posts
    )],
    indices = [Index("user_id")],          // index the foreign key column
)
data class Post(
    @PrimaryKey val id: Long,
    @ColumnInfo(name = "user_id") val userId: Long,
    val title: String,
    val likes: Int = 0,
)`,
    remember: 'Store each fact once, give every row a primary key, and point between tables with foreign keys.',
    deeper: [
      {
        title: 'Relations, tuples, attributes',
        body: `<p>In the textbook, a table is a <strong>relation</strong>, a row is a <strong>tuple</strong> and a column is an <strong>attribute</strong>. A relation is a set: no duplicate rows and no built-in order. That is why SQL gives you rows in no promised order unless you write <code>ORDER BY</code>.</p>
<p>A <strong>candidate key</strong> is any set of columns that is unique for every row, like <code>email</code>. You pick one as the primary key. A <strong>surrogate key</strong> is a made-up id (<code>1, 2, 3</code> or a UUID); a <strong>natural key</strong> is a real-world value like a national id number. Surrogate keys are safer because real-world values change.</p>`,
      },
      {
        title: 'Constraints do the checking',
        body: `<p>Constraints are rules the database enforces on every write, no matter which code path writes. <code>NOT NULL</code>, <code>UNIQUE</code>, <code>CHECK</code>, <code>PRIMARY KEY</code> and <code>FOREIGN KEY</code> catch bugs that your Kotlin validation misses, like a background sync writing a half-filled row.</p>`,
        code: `CREATE TABLE users (
    id    INTEGER PRIMARY KEY,
    email TEXT    NOT NULL UNIQUE,
    age   INTEGER CHECK (age >= 13)
);
-- SQLite checks REFERENCES only after: PRAGMA foreign_keys = ON;`,
      },
      {
        title: 'What happens when the parent goes away',
        body: `<p>A foreign key also says what to do when the parent row is deleted or its key changes. <code>CASCADE</code> deletes the children too, <code>SET NULL</code> clears the pointer, <code>RESTRICT</code> refuses the delete. Pick on purpose: deleting a user should probably delete their drafts, but not the orders the shop must keep.</p>`,
        code: `@Entity(foreignKeys = [ForeignKey(
    entity = User::class, parentColumns = ["id"], childColumns = ["user_id"],
    onDelete = ForeignKey.SET_NULL,     // keep the order, forget the user
)])
data class Order(@PrimaryKey val id: Long, @ColumnInfo(name = "user_id") val userId: Long?)`,
      },
    ],
    underHood: {
      body: `<p>An SQLite database is one file made of fixed-size pages. Each ordinary table is a <strong>table b-tree</strong> keyed by a 64-bit <code>rowid</code>, with the row data in the leaves. A column declared <code>INTEGER PRIMARY KEY</code> becomes that rowid, so looking a row up by id is a tree search. Every index is a separate <strong>index b-tree</strong>, including the hidden ones SQLite creates for <code>UNIQUE</code> constraints.</p>`,
    },
    mistakes: [
      { title: 'Assuming SQLite checks REFERENCES', bad: '-- raw SQLite connection, default settings\nINSERT INTO posts(id, user_id, title) VALUES (15, 9, \'x\');\n-- succeeds, even though user 9 does not exist', good: 'PRAGMA foreign_keys = ON;   -- once per connection\nINSERT INTO posts(id, user_id, title) VALUES (15, 9, \'x\');\n-- FOREIGN KEY constraint failed', why: 'SQLite keeps foreign key enforcement off by default for backwards compatibility, and the setting is per connection. Turn it on, or rely on a layer that does.' },
      { title: 'Using a changeable value as the primary key', bad: '@Entity data class User(@PrimaryKey val email: String, val name: String)', good: '@Entity(indices = [Index(value = ["email"], unique = true)])\ndata class User(@PrimaryKey(autoGenerate = true) val id: Long = 0, val email: String, val name: String)', why: 'People change emails. If the email is the key, every foreign key that points at it must change too. A surrogate id never changes; a unique index still blocks duplicates.' },
    ],
    terms: [
      { term: 'Primary key', def: 'A column (or set of columns) whose value is unique for every row and identifies it.' },
      { term: 'Foreign key', def: 'A column that holds another table’s primary key, so the database can check the link exists.' },
      { term: 'Constraint', def: 'A rule like NOT NULL, UNIQUE or CHECK that the database enforces on every write.' },
      { term: 'Orphan row', def: 'A child row whose foreign key points at a parent that does not exist.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Give <code>posts</code> a primary key and make <code>user_id</code> point at <code>users</code>.', code: 'CREATE TABLE posts (\n    id      INTEGER [[PRIMARY KEY|primary key]],\n    user_id INTEGER NOT NULL [[REFERENCES|references]] users(id),\n    title   TEXT NOT NULL\n);', why: '<code>PRIMARY KEY</code> makes <code>id</code> unique and, for <code>INTEGER</code>, the rowid. <code>REFERENCES users(id)</code> declares the foreign key.' },
      { type: 'bug', prompt: 'This test expects the orphan insert to fail on a raw SQLite connection, but it passes the insert. Tap the line that is missing its setup.', code: 'val db = SQLiteDatabase.create(null)\ndb.execSQL("CREATE TABLE users(id INTEGER PRIMARY KEY)")\ndb.execSQL("CREATE TABLE posts(id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id))")\ndb.execSQL("INSERT INTO posts VALUES (1, 9)")   // expected: FOREIGN KEY constraint failed', bug: 0, fix: 'val db = SQLiteDatabase.create(null).apply { setForeignKeyConstraintsEnabled(true) }', why: 'Foreign key checks are off by default. <code>setForeignKeyConstraintsEnabled(true)</code> runs <code>PRAGMA foreign_keys = ON</code> for this connection, before the insert.' },
    ],
    quiz: [
      { q: 'An app keeps posts in a JSON file with the author’s name copied into each post. The author changes her name. What is the core problem?', options: ['JSON cannot store Turkish characters', 'The same fact lives in many places, so every copy must be found and rewritten', 'JSON files cannot be larger than 1 MB'], a: 1, why: 'Duplicated facts drift apart when one copy is missed. A table stores the name once and posts point at it by id.' },
      { q: 'On a fresh SQLite connection you run <code>INSERT INTO posts(user_id) VALUES (9)</code> and user 9 does not exist. What happens?', options: ['FOREIGN KEY constraint failed', 'The insert succeeds and leaves an orphan row', 'SQLite creates user 9 automatically'], a: 1, why: 'SQLite leaves foreign key enforcement off by default. It only checks after <code>PRAGMA foreign_keys = ON</code> on that connection.' },
      { q: 'Which column makes the best primary key for a <code>users</code> table?', options: ['email', 'phone number', 'a generated numeric id'], a: 2, why: 'Emails and phone numbers change. A generated id never does, so nothing pointing at it has to change. Keep email unique with an index.' },
    ],
  });

  // 2 ─────────────────────────────────────────────
  const CLAUSES = ['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY', 'LIMIT'];
  const sumBy = uid => POSTS.filter(p => p[1] === uid).reduce((a, p) => a + p[3], 0);
  const groups = [1, 2, 3].map(u => [u, POSTS.filter(p => p[1] === u).length, sumBy(u)]);
  const QUERIES = [
    { label: 'SELECT *', sql: 'SELECT * FROM posts;', use: ['FROM', 'SELECT'], cols: ['id', 'user_id', 'title', 'likes'], rows: () => POSTS, msg: 'Every row, every column. Fine for 5 rows; on a real table, name the columns you need.' },
    { label: 'WHERE', sql: 'SELECT title, likes FROM posts\nWHERE likes > 40;', use: ['FROM', 'WHERE', 'SELECT'], keep: p => p[3] > 40, cols: ['title', 'likes'], rows: () => POSTS.filter(p => p[3] > 40).map(p => [p[2], p[3]]), msg: 'WHERE drops rows before anything else looks at them. Dimmed rows failed the test.' },
    { label: 'ORDER BY + LIMIT', sql: 'SELECT title, likes FROM posts\nORDER BY likes DESC\nLIMIT 3;', use: ['FROM', 'SELECT', 'ORDER BY', 'LIMIT'], cols: ['title', 'likes'], rows: () => POSTS.slice().sort((a, b) => b[3] - a[3]).slice(0, 3).map(p => [p[2], p[3]]), msg: 'Sort, then keep the first 3. Without ORDER BY the order is whatever the engine finds first.' },
    { label: 'GROUP BY', sql: 'SELECT user_id, COUNT(*) AS n,\n       SUM(likes) AS total\nFROM posts\nGROUP BY user_id;', use: ['FROM', 'GROUP BY', 'SELECT'], group: true, cols: ['user_id', 'n', 'total'], rows: () => groups, msg: 'Rows with the same user_id collapse into one output row. COUNT and SUM run once per group.' },
    { label: 'HAVING', sql: 'SELECT user_id, SUM(likes) AS total\nFROM posts\nGROUP BY user_id\nHAVING SUM(likes) > 50\nORDER BY total DESC;', use: ['FROM', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY'], group: true, cols: ['user_id', 'total'], rows: () => groups.filter(g => g[2] > 50).sort((a, b) => b[2] - a[2]).map(g => [g[0], g[2]]), msg: 'HAVING filters groups, after the sums exist. WHERE could not do this: it runs before grouping.' },
  ];
  lessons.push({
    id: 'sql-queries',
    title: 'SQL queries',
    tagline: 'Say what rows you want; the database works out how to get them.',
    level: 'beginner',
    body: `
<p>SQL is declarative: you describe the result, not the loop. <code>SELECT</code> picks columns, <code>FROM</code> picks the table, <code>WHERE</code> filters rows, <code>ORDER BY</code> sorts, <code>LIMIT</code> keeps the first few.</p>
<p><code>GROUP BY</code> folds rows that share a value into one row, and aggregate functions like <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code> and <code>MAX</code> compute one value per group. <code>HAVING</code> filters those groups.</p>
<p>The clauses are written in one order but run in another: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT. That explains most beginner errors, like using an aggregate in <code>WHERE</code>. Run each query and watch the clauses light up in the order they run. In <a href="#data.room">Room</a> these same queries go in <code>@Query</code>, and Room checks them against your schema at compile time.</p>`,
    visual(el) {
      const sql = h('pre', { class: 'dbx-sql' });
      const chips = CLAUSES.map(n => h('span', { class: 'dbx-chip dbx-off' }, n));
      const src = h('div', {});
      const res = h('div', {});
      const msg = out('Pick a query. The source table is on the left, the result on the right.');
      let tok = 0;
      const paintSrc = (q, stage) => src.replaceChildren(tbl('posts', ['id', 'user_id', 'title', 'likes'], POSTS, {
        cls: p => {
          if (stage >= 1 && q.keep && !q.keep(p)) return 'dbx-dim';
          if (stage >= 2 && q.group) return 'dbx-g' + (p[1] - 1);
          return null;
        },
      }));
      const btns = QUERIES.map(q => act(q.label, async () => {
        const t = ++tok;
        press(btns, btns[QUERIES.indexOf(q)]);
        sql.textContent = q.sql;
        chips.forEach(ch => { ch.className = 'dbx-chip dbx-off'; });
        res.replaceChildren(); paintSrc(q, 0);
        let stage = 0;
        for (const n of CLAUSES) {
          if (!q.use.includes(n)) continue;
          chips[CLAUSES.indexOf(n)].className = 'dbx-chip dbx-on';
          if (n === 'WHERE') stage = 1;
          if (n === 'GROUP BY') stage = 2;
          paintSrc(q, stage);
          await sleep(380);
          if (t !== tok || !el.isConnected) return;
        }
        res.replaceChildren(tbl('result', q.cols, q.rows()));
        say(msg, q.msg);
      }));
      press(btns, null);
      paintSrc({}, 0);
      sql.textContent = '-- pick a query';
      el.append(h('div', { class: 'dbx-stage' }, h('div', { class: 'controls' }, btns), sql, h('div', { class: 'dbx-chips' }, label('runs in order'), chips), h('div', { class: 'dbx-row' }, src, res), msg));
    },
    code: `@Dao
interface PostDao {
    @Query("SELECT * FROM posts WHERE likes > :min ORDER BY likes DESC LIMIT :n")
    suspend fun top(min: Int, n: Int): List<Post>

    // A query can return a small data class instead of the entity
    @Query("""
        SELECT user_id AS userId, COUNT(*) AS posts, SUM(likes) AS total
        FROM posts
        GROUP BY user_id
        HAVING SUM(likes) > :atLeast
        ORDER BY total DESC
    """)
    fun popularAuthors(atLeast: Int): Flow<List<AuthorStats>>
}

data class AuthorStats(val userId: Long, val posts: Int, val total: Int)`,
    remember: 'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. WHERE filters rows, HAVING filters groups.',
    deeper: [
      {
        title: 'NULL is not a value',
        body: `<p><code>NULL</code> means “unknown”. Any comparison with it is unknown too, so <code>WHERE city = NULL</code> matches nothing. Use <code>IS NULL</code> and <code>IS NOT NULL</code>. Aggregates skip NULLs: <code>COUNT(*)</code> counts rows, <code>COUNT(city)</code> counts rows where city is not NULL. <code>COALESCE(x, 0)</code> swaps a NULL for a default.</p>`,
        code: `SELECT COUNT(*), COUNT(city) FROM users;      -- 4, 3 if one city is NULL
SELECT * FROM users WHERE city IS NULL;       -- not: city = NULL
SELECT name, COALESCE(city, 'unknown') FROM users;`,
      },
      {
        title: 'Bind parameters, never string concatenation',
        body: `<p>Building SQL by gluing strings lets user input become SQL: a search box value like <code>' OR 1=1 --</code> changes the query. Bind parameters send the value separately, so it can only ever be data. Room’s <code>:name</code> parameters do this for you.</p>`,
        code: `// Bad: injection, and no compile-time check
db.rawQuery("SELECT * FROM users WHERE name = '$input'", null)

// Good: the value is bound, never parsed as SQL
@Query("SELECT * FROM users WHERE name = :name")
suspend fun byName(name: String): List<User>`,
      },
      {
        title: 'Case and Turkish text',
        body: `<p>By default, SQLite’s <code>lower()</code>, <code>upper()</code>, the <code>NOCASE</code> collation and <code>LIKE</code> only know upper and lower case for ASCII letters; full Unicode folding needs the ICU extension. So <code>'İzmir' = 'izmir' COLLATE NOCASE</code> is false. Do not count on the database for Turkish case rules: store a normalized column, lowercased in Kotlin with the Turkish locale, and query that.</p>`,
        code: `val tr = Locale.forLanguageTag("tr")
val key = "İzmir".lowercase(tr)            // "izmir"
// @Entity: val cityKey: String  (filled on insert)
@Query("SELECT * FROM users WHERE city_key = :key")
suspend fun inCity(key: String): List<User>`,
      },
    ],
    mistakes: [
      { title: 'Aggregate in WHERE', bad: 'SELECT user_id, SUM(likes) FROM posts\nWHERE SUM(likes) > 50\nGROUP BY user_id;', good: 'SELECT user_id, SUM(likes) FROM posts\nGROUP BY user_id\nHAVING SUM(likes) > 50;', why: 'WHERE runs before grouping, when no sums exist yet. Filters on aggregates belong in HAVING.' },
      { title: 'Expecting a stable order without ORDER BY', bad: '@Query("SELECT * FROM posts LIMIT 20")\nsuspend fun firstPage(): List<Post>', good: '@Query("SELECT * FROM posts ORDER BY created_at DESC, id DESC LIMIT 20")\nsuspend fun firstPage(): List<Post>', why: 'A table is a set. Without ORDER BY the engine may return rows in any order, and that order can change when an index is added. Add a tie-breaker like id so equal timestamps stay stable.' },
    ],
    terms: [
      { term: 'Aggregate function', def: 'A function like COUNT, SUM or AVG that turns many rows into one value.' },
      { term: 'GROUP BY', def: 'A clause that folds rows with equal values into one output row per group.' },
      { term: 'HAVING', def: 'A filter that runs after grouping, so it can test aggregate values.' },
      { term: 'Bind parameter', def: 'A placeholder like :name whose value is sent separately from the SQL text, which blocks injection.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Count posts per user and keep only users with at least 2 posts.', code: 'SELECT user_id, [[COUNT|count]](*) AS n\nFROM posts\n[[GROUP BY|group by]] user_id\n[[HAVING|having]] COUNT(*) >= 2;', why: '<code>COUNT(*)</code> counts rows per group, <code>GROUP BY</code> makes the groups, <code>HAVING</code> filters groups after counting.' },
      { type: 'bug', prompt: 'This should list users with no city, but it always returns nothing. Tap the bug.', code: '@Query("""\n    SELECT * FROM users\n    WHERE city = NULL\n    ORDER BY name\n""")\nsuspend fun noCity(): List<User>', bug: 2, fix: '    WHERE city IS NULL', why: 'Comparing anything with NULL using <code>=</code> gives unknown, which WHERE treats as false. <code>IS NULL</code> is the test for missing values.' },
    ],
    quiz: [
      { q: 'In which order does the database logically run these clauses?', options: ['SELECT, FROM, WHERE, ORDER BY', 'FROM, WHERE, SELECT, ORDER BY', 'FROM, SELECT, WHERE, ORDER BY', 'WHERE, FROM, SELECT, ORDER BY'], a: 1, why: 'First pick the table, then drop rows, then compute the output columns, then sort them. That is why standard SQL lets ORDER BY use a SELECT alias but not WHERE (SQLite is more lenient and accepts both).' },
      { q: 'With the demo data, what does <code>SELECT COUNT(*) FROM posts WHERE likes > 40</code> return?', options: ['5', '3', '2'], a: 1, why: 'Posts with 42, 95 and 61 likes pass the filter. COUNT then counts the 3 remaining rows.' },
      { q: 'You need users whose posts have more than 100 likes in total. Where does <code>SUM(likes) > 100</code> go?', options: ['In WHERE', 'In HAVING, after GROUP BY user_id', 'In ORDER BY'], a: 1, why: 'The sum only exists per group, after GROUP BY. HAVING is the filter for groups.' },
      { q: 'A search screen builds <code>"... WHERE name = \'" + query + "\'"</code>. Which fix is right?', options: ['Escape quotes by hand', 'Use a bind parameter like :name', 'Trim the input'], a: 1, why: 'A bind parameter sends the value apart from the SQL, so input can never change the query. Hand escaping misses cases.' },
    ],
  });

  // 3 ─────────────────────────────────────────────
  const JOINS = [
    {
      label: 'INNER JOIN', sql: 'SELECT u.name, p.title\nFROM users u\nJOIN posts p ON p.user_id = u.id;',
      cols: ['name', 'title'], rows: () => POSTS.map(p => [userName(p[1]), p[2]]), cls: () => null,
      msg: 'One output row per matching pair. Can has no posts, so Can is missing from the result.',
    },
    {
      label: 'LEFT JOIN', sql: 'SELECT u.name, p.title\nFROM users u\nLEFT JOIN posts p ON p.user_id = u.id;',
      cols: ['name', 'title'], rows: () => [...POSTS.map(p => [userName(p[1]), p[2]]), ['Can', null]], cls: r => r[1] == null ? 'dbx-warm' : null,
      msg: 'Every user stays. Where no post matches, the post columns are NULL. Use it for “users and their posts, if any”.',
    },
    {
      label: 'LEFT JOIN … IS NULL', sql: 'SELECT u.name\nFROM users u\nLEFT JOIN posts p ON p.user_id = u.id\nWHERE p.id IS NULL;',
      cols: ['name'], rows: () => [['Can']], cls: () => 'dbx-warm',
      msg: 'The anti-join: keep only the users the LEFT JOIN could not match. “Users who never posted.”',
    },
    {
      label: 'many-to-many', sql: 'SELECT p.title, t.name AS tag\nFROM posts p\nJOIN post_tags pt ON pt.post_id = p.id\nJOIN tags t ON t.id = pt.tag_id;',
      cols: ['title', 'tag'], rows: () => POST_TAGS.map(([pid, tid]) => [POSTS.find(p => p[0] === pid)[2], TAGS.find(t => t[0] === tid)[1]]), cls: r => r[0] === 'Kumru tarifi' ? 'dbx-g0' : null,
      msg: 'A post has many tags and a tag has many posts. The join table post_tags holds one row per pair. “Kumru tarifi” has two tags, so it appears twice.',
    },
  ];
  lessons.push({
    id: 'joins',
    title: 'Joins',
    tagline: 'Put related rows from two tables side by side, in one query.',
    level: 'intermediate',
    body: `
<p>Data is split across tables, so you need a way to bring it back together. A <strong>join</strong> pairs rows from two tables that satisfy a condition, usually “this foreign key equals that primary key”.</p>
<p><code>INNER JOIN</code> keeps only pairs that match. <code>LEFT JOIN</code> keeps every row of the left table and fills the right side with NULL when nothing matches. A <strong>many-to-many</strong> link (posts and tags) needs a third table, a <strong>join table</strong>, with one row per pair.</p>
<p>The classic performance bug is the <strong>N+1 query problem</strong>: load 20 posts in one query, then run one more query per post to load its author. That is 21 round trips where 1 or 2 would do. Room’s <a href="#data.relations">@Relation</a> avoids it by loading children with one batched <code>IN (...)</code> query.</p>`,
    visual(el) {
      const sql = h('pre', { class: 'dbx-sql' });
      const srcs = h('div', { class: 'dbx-row' },
        tbl('users', ['id', 'name'], USERS.map(u => u.slice(0, 2)), { keys: { id: 'PK' } }),
        tbl('posts', ['id', 'user_id', 'title'], POSTS.map(p => p.slice(0, 3)), { keys: { id: 'PK', user_id: 'FK' } }));
      const tags = h('div', { class: 'dbx-row' },
        tbl('post_tags', ['post_id', 'tag_id'], POST_TAGS, { keys: { post_id: 'FK', tag_id: 'FK' } }),
        tbl('tags', ['id', 'name'], TAGS, { keys: { id: 'PK' } }));
      const res = h('div', {});
      const msg = out('Pick a join.');
      const btns = JOINS.map((j, k) => act(j.label, () => {
        press(btns, btns[k]);
        sql.textContent = j.sql;
        res.replaceChildren(tbl('result', j.cols, j.rows(), { cls: j.cls }));
        replay(res, 'pop-soft');
        say(msg, j.msg);
      }));
      press(btns, null);
      sql.textContent = '-- pick a join';
      el.append(h('div', { class: 'dbx-stage' }, h('div', { class: 'controls' }, btns), sql, srcs, tags, res, msg));
    },
    code: `// One-to-many with Room: parents first, then all children in one IN (...) query
data class UserWithPosts(
    @Embedded val user: User,
    @Relation(parentColumn = "id", entityColumn = "user_id")
    val posts: List<Post>,
)

// Many-to-many: the join table is an entity with a composite primary key
@Entity(tableName = "post_tags", primaryKeys = ["post_id", "tag_id"], indices = [Index("tag_id")])
data class PostTag(@ColumnInfo(name = "post_id") val postId: Long, @ColumnInfo(name = "tag_id") val tagId: Long)

@Dao
interface FeedDao {
    @Transaction                      // several queries, one consistent snapshot
    @Query("SELECT * FROM users")
    fun usersWithPosts(): Flow<List<UserWithPosts>>

    // Or one JOIN returning a multimap
    @Query("SELECT * FROM users JOIN posts ON posts.user_id = users.id")
    suspend fun postsByUser(): Map<User, List<Post>>
}`,
    remember: 'INNER keeps matches, LEFT keeps every left row. Many-to-many needs a join table. Never query once per row.',
    deeper: [
      {
        title: 'The N+1 query problem',
        body: `<p>Count round trips. The naive loop runs 1 query for the posts and 1 per post for its author. The JOIN does it in 1. The batched version runs 2: posts, then <code>WHERE id IN (…)</code> for all their authors at once, which is what Room’s <code>@Relation</code> does. Each query has fixed overhead; on a server, each one is also a network hop.</p>`,
        visual(el) {
          const log = h('div', { class: 'dbx-log' });
          const st = stats(['queries', 'time (≈2 ms each)']);
          const msg = out('Load a feed of 8 posts with their authors.');
          let tok = 0;
          async function run(lines, note) {
            const t = ++tok;
            log.replaceChildren();
            st.set('queries', 0); st.set('time (≈2 ms each)', '0 ms');
            for (let k = 0; k < lines.length; k++) {
              log.append(h('div', { class: 'dbx-ev' }, h('span', { class: 'dbx-lane dbx-sys' }, String(k + 1)), h('span', {}, lines[k])));
              st.set('queries', k + 1); st.set('time (≈2 ms each)', `${(k + 1) * 2} ms`);
              await sleep(220);
              if (t !== tok || !el.isConnected) return;
            }
            say(msg, note);
          }
          const authors = [1, 3, 1, 2, 3, 3, 1, 2];
          el.append(h('div', { class: 'dbx-stage' },
            h('div', { class: 'controls' },
              act('Loop: N+1', () => run(['SELECT * FROM posts LIMIT 8', ...authors.map(a => `SELECT * FROM users WHERE id = ${a}`)], '9 queries for 8 posts, and the same users are fetched again and again. With 50 posts it is 51.')),
              act('One JOIN', () => run(['SELECT … FROM posts JOIN users ON users.id = posts.user_id LIMIT 8'], '1 query. The author columns repeat in every row, which is fine for small rows.')),
              act('Batched IN (…)', () => run(['SELECT * FROM posts LIMIT 8', 'SELECT * FROM users WHERE id IN (1, 2, 3)'], '2 queries no matter how many posts. This is what Room does for @Relation.'))),
            st, log, msg));
        },
        code: `// N+1: hidden inside a map
val feed = postDao.latest(50).map { post ->
    FeedItem(post, userDao.byId(post.userId))     // one query per post
}

// 2 queries total
val posts = postDao.latest(50)
val users = userDao.byIds(posts.map { it.userId }.distinct()).associateBy { it.id }
val feed2 = posts.map { FeedItem(it, users.getValue(it.userId)) }`,
      },
      {
        title: 'How the engine runs a join',
        body: `<p>A <strong>nested loop join</strong> takes each row of one table and looks for matches in the other. Without an index on the join column, that inner lookup is a full scan, so the join costs about rows × rows. With an index on <code>posts.user_id</code>, each lookup is a tree search. SQLite uses nested loops; PostgreSQL can also pick hash joins and merge joins. Either way: index your foreign keys.</p>`,
        code: `EXPLAIN QUERY PLAN
SELECT u.name, p.title FROM users u JOIN posts p ON p.user_id = u.id;
-- with an index on posts(user_id), the inner side reads:
--   SEARCH p USING INDEX index_posts_user_id (user_id=?)`,
      },
      {
        title: 'Joins that multiply rows',
        body: `<p>Joining a user to two one-to-many tables at once (posts and comments) makes posts × comments rows per user. A user with 10 posts and 20 comments becomes 200 rows, and <code>COUNT</code> or <code>SUM</code> over them is wrong. Aggregate each child table in its own subquery, or load them separately.</p>`,
        code: `-- Wrong: counts are multiplied
SELECT u.id, COUNT(p.id), COUNT(c.id)
FROM users u LEFT JOIN posts p ON p.user_id = u.id LEFT JOIN comments c ON c.user_id = u.id
GROUP BY u.id;

-- Right: count each side on its own
SELECT u.id,
  (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id)    AS posts,
  (SELECT COUNT(*) FROM comments c WHERE c.user_id = u.id) AS comments
FROM users u;`,
      },
    ],
    mistakes: [
      { title: 'Filtering the right table of a LEFT JOIN in WHERE', bad: 'SELECT u.name, p.title FROM users u\nLEFT JOIN posts p ON p.user_id = u.id\nWHERE p.likes > 10;      -- users without posts vanish', good: 'SELECT u.name, p.title FROM users u\nLEFT JOIN posts p ON p.user_id = u.id AND p.likes > 10;', why: 'For users without posts, p.likes is NULL and the WHERE test drops them, turning the LEFT JOIN into an inner one. Put conditions on the right table in ON.' },
      { title: 'A query per item in a list', bad: 'items.forEach { item ->\n    item.author = userDao.byId(item.userId)\n}', good: 'val users = userDao.byIds(items.map { it.userId }.distinct())\n    .associateBy { it.id }', why: 'One query per item is the N+1 problem. Load all needed rows in one IN query or a JOIN, then match them in memory.' },
    ],
    terms: [
      { term: 'Join', def: 'Combining rows from two tables into one result where a condition between them holds.' },
      { term: 'LEFT JOIN', def: 'A join that keeps every row of the left table, with NULLs where the right table has no match.' },
      { term: 'Join table', def: 'A table with one row per pair of linked rows, used for many-to-many relationships.' },
      { term: 'N+1 query problem', def: 'Running one query for a list and then one extra query per item, instead of one or two in total.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'List every user and the title of each post they wrote, including users with no posts.', code: 'SELECT u.name, p.title\nFROM users u\n[[LEFT|left|LEFT OUTER|left outer]] JOIN posts p ON p.[[user_id]] = u.id;', why: '<code>LEFT JOIN</code> keeps users without posts. The join condition matches the foreign key <code>p.user_id</code> to the primary key <code>u.id</code>.' },
      { type: 'bug', prompt: 'The feed screen is slow with 100 posts. Tap the line that causes the N+1 problem.', code: 'suspend fun loadFeed(): List<FeedItem> {\n    val posts = postDao.latest(100)\n    return posts.map { post ->\n        FeedItem(post, userDao.byId(post.userId))\n    }\n}', bug: 3, fix: '        FeedItem(post, users.getValue(post.userId))   // users = userDao.byIds(ids).associateBy { it.id }', why: 'Each <code>byId</code> call is one more query, 101 in total. Load all authors once with <code>IN (...)</code> before the loop and look them up in a map.' },
    ],
    quiz: [
      { q: 'With the demo data (Can has no posts), how many rows does <code>users LEFT JOIN posts</code> return?', options: ['4', '5', '6'], a: 2, why: 'Five posts each match one user, giving 5 rows. Can matches nothing, so the LEFT JOIN adds one more row with NULL post columns: 6.' },
      { q: 'Students take many courses and courses have many students. How do you model it?', options: ['A course_id column in students', 'A comma-separated list of ids in each row', 'A third table enrollments(student_id, course_id)'], a: 2, why: 'Each enrollment is its own fact. A join table with both foreign keys, and a composite primary key, models many-to-many.' },
      { q: 'A screen loads 30 orders, then calls <code>customerDao.byId()</code> for each. How many queries run, and what is the fix?', options: ['30, use a cache', '31, load customers with one WHERE id IN (...) query', '1, nothing to fix'], a: 1, why: '1 for the orders plus 30 for customers is N+1. One batched IN query (or a JOIN) brings it to 2 (or 1).' },
      { q: 'Why does Room ask for <code>@Transaction</code> on a query returning <code>UserWithPosts</code>?', options: ['It runs more than one query, and the transaction keeps them on one snapshot', 'Room cannot read without a transaction', 'It makes the query run faster in parallel'], a: 0, why: 'Users and posts come from separate queries. Without a transaction, a write could land between them and you would get posts that do not match the users.' },
    ],
  });

  // 4 ─────────────────────────────────────────────
  const NF = [
    {
      name: 'Unnormalized', anomaly: 2,
      tables: [['orders', ['order_id', 'customer', 'city', 'items'], [[1001, 'Ayşe', 'İzmir', 'çay×2, simit×1'], [1002, 'Ayşe', 'İzmir', 'simit×3'], [1003, 'Mehmet', 'Ankara', 'çay×1']], { order_id: 'PK' }]],
      msg: 'One wide table, and the items column holds a list. You cannot ask “how many simit were sold?” without parsing text.',
    },
    {
      name: '1NF', anomaly: 3,
      tables: [['order_lines', ['order_id', 'product', 'qty', 'customer', 'city', 'price'], [[1001, 'çay', 2, 'Ayşe', 'İzmir', 15], [1001, 'simit', 1, 'Ayşe', 'İzmir', 20], [1002, 'simit', 3, 'Ayşe', 'İzmir', 20], [1003, 'çay', 1, 'Mehmet', 'Ankara', 15]], { order_id: 'PK', product: 'PK' }]],
      msg: '1NF: one value per cell, no lists. The key is now (order_id, product). But Ayşe’s city is copied into 3 rows, and the simit price into 2.',
    },
    {
      name: '2NF', anomaly: 2,
      tables: [
        ['orders', ['order_id', 'customer', 'city'], [[1001, 'Ayşe', 'İzmir'], [1002, 'Ayşe', 'İzmir'], [1003, 'Mehmet', 'Ankara']], { order_id: 'PK' }],
        ['order_lines', ['order_id', 'product', 'qty'], [[1001, 'çay', 2], [1001, 'simit', 1], [1002, 'simit', 3], [1003, 'çay', 1]], { order_id: 'FK', product: 'FK' }],
        ['products', ['product', 'price'], [['çay', 15], ['simit', 20]], { product: 'PK' }]],
      msg: '2NF: every column depends on the whole key. customer and city depend only on order_id, price only on product, so they moved out. City still repeats once per order.',
    },
    {
      name: '3NF', anomaly: 1,
      tables: [
        ['customers', ['id', 'name', 'city'], [[1, 'Ayşe', 'İzmir'], [2, 'Mehmet', 'Ankara']], { id: 'PK' }],
        ['orders', ['order_id', 'customer_id'], [[1001, 1], [1002, 1], [1003, 2]], { order_id: 'PK', customer_id: 'FK' }],
        ['order_lines', ['order_id', 'product', 'qty'], [[1001, 'çay', 2], [1001, 'simit', 1], [1002, 'simit', 3], [1003, 'çay', 1]], {}],
        ['products', ['product', 'price'], [['çay', 15], ['simit', 20]], { product: 'PK' }]],
      msg: '3NF: no column depends on another non-key column. city depended on the customer, not the order, so customers got their own table. Each fact now lives in exactly one row.',
    },
  ];
  lessons.push({
    id: 'normalization',
    title: 'Normalization and modeling',
    tagline: 'Split tables until every fact lives in one place, then copy on purpose.',
    level: 'intermediate',
    body: `
<p>Normalization is a recipe for removing duplicated facts. Duplicates cause <strong>anomalies</strong>: update one copy and forget another (update anomaly), cannot store a product until someone orders it (insert anomaly), delete the last order and lose the customer (delete anomaly).</p>
<p><strong>1NF</strong>: one value per cell, no lists or repeating groups. <strong>2NF</strong>: every non-key column depends on the whole key, not part of it. <strong>3NF</strong>: no non-key column depends on another non-key column. The old mnemonic: every column depends on “the key, the whole key, and nothing but the key”.</p>
<p>Normalize first, then <strong>denormalize on purpose</strong> where reads dominate. A feed that shows like counts can store <code>like_count</code> on the post instead of counting rows every time. A local <a href="#data.caching">cache</a> of API responses can be a flat copy. Each copy is a promise to keep it in sync. Press the steps to split the table and watch the cost of renaming Ayşe’s city fall.</p>`,
    visual(el) {
      const area = h('div', { class: 'dbx-row' });
      const st = stats(['rows to update when Ayşe moves', 'tables']);
      const msg = out('');
      const btns = NF.map((f, k) => act(f.name, () => show(k)));
      function show(k) {
        press(btns, btns[k]);
        const f = NF[k];
        area.replaceChildren(...f.tables.map(([n, cols, rows, keys]) => tbl(n, cols, rows, {
          keys,
          cls: r => (cols.includes('city') && r.includes('Ayşe')) ? 'dbx-warm' : null,
        })));
        replay(area, 'pop-soft');
        st.set('rows to update when Ayşe moves', f.anomaly);
        st.set('tables', f.tables.length);
        say(msg, f.msg);
      }
      el.append(h('div', { class: 'dbx-stage' }, h('div', { class: 'controls' }, btns), st, area, msg));
      show(0);
    },
    code: `// 3NF in Room
@Entity data class Customer(@PrimaryKey val id: Long, val name: String, val city: String)
@Entity data class Product(@PrimaryKey val sku: String, val name: String, val priceKurus: Long)

@Entity(foreignKeys = [ForeignKey(entity = Customer::class, parentColumns = ["id"], childColumns = ["customerId"])],
        indices = [Index("customerId")])
data class Order(@PrimaryKey val id: Long, val customerId: Long, val createdAt: Long)

@Entity(primaryKeys = ["orderId", "sku"], indices = [Index("sku")])
data class OrderLine(
    val orderId: Long,
    val sku: String,
    val qty: Int,
    val unitPriceKurus: Long,   // copied on purpose: the price at the time of sale
)`,
    remember: 'Each fact in one place. Denormalize only for a measured read need, and own the code that keeps copies in sync.',
    deeper: [
      {
        title: 'Functional dependencies',
        body: `<p>The formal tool is the <strong>functional dependency</strong>: A → B means “knowing A tells you B”. <code>product → price</code>, <code>order_id → customer</code>, <code>customer → city</code>. A table is in 3NF when every dependency points from a key. When you find <code>customer → city</code> inside <code>orders</code>, that dependency wants its own table.</p>
<p>Boyce–Codd normal form (BCNF) tightens 3NF: the left side of every dependency must be a candidate key. In practice, reaching 3NF is the goal for app schemas.</p>`,
      },
      {
        title: 'Copying is sometimes correct',
        body: `<p>Not every copy is a duplicate. An order line stores <code>unit_price</code> because the price at the time of sale is its own fact; when the product price changes next week, old receipts must not change. Ask: if the source changes, should this copy change? If no, it is history, not duplication.</p>`,
      },
      {
        title: 'Denormalize a counter',
        body: `<p>A feed of 50 posts with like counts costs 50 <code>COUNT(*)</code> subqueries, or a join plus grouping. Storing <code>like_count</code> on the post makes the read free, and every like now writes two rows. Do both writes in one transaction so the count and the rows cannot disagree.</p>`,
        code: `@Dao
abstract class LikeDao {
    @Insert abstract suspend fun insertLike(like: Like)
    @Query("UPDATE posts SET like_count = like_count + 1 WHERE id = :postId")
    abstract suspend fun bump(postId: Long)

    @Transaction
    open suspend fun like(like: Like) {
        insertLike(like)
        bump(like.postId)       // both or neither
    }
}`,
      },
    ],
    mistakes: [
      { title: 'A list inside one column', bad: '@Entity data class Post(@PrimaryKey val id: Long, val tags: String)   // "kotlin,room,android"', good: '@Entity(primaryKeys = ["postId", "tagId"])\ndata class PostTag(val postId: Long, val tagId: Long)', why: 'A comma-separated column breaks 1NF. You cannot index it, count by tag, or rename a tag without string surgery. A join table makes each pair a row.' },
      { title: 'Denormalizing without a sync plan', bad: '// post.authorName copied at insert time, never updated\n@Entity data class Post(@PrimaryKey val id: Long, val authorId: Long, val authorName: String)', good: '// either join on read...\n@Query("SELECT posts.*, users.name AS authorName FROM posts JOIN users ON users.id = posts.authorId")\n// ...or update every copy in the same transaction as the rename', why: 'A copy with no owner goes stale. If you copy, write the code that updates it; otherwise join.' },
    ],
    terms: [
      { term: 'Normalization', def: 'Splitting tables so each fact is stored once, following 1NF, 2NF and 3NF.' },
      { term: 'Update anomaly', def: 'Changing one copy of a duplicated fact and leaving other copies wrong.' },
      { term: 'Functional dependency', def: 'A → B: knowing the value of A determines the value of B.' },
      { term: 'Denormalization', def: 'Copying data on purpose to make reads cheaper, at the cost of extra writes and sync code.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Name the normal form each fix reaches.', code: '-- items "çay×2, simit×1" split into one row per item   -> [[1NF|1nf]]\n-- price moved out of order_lines into products         -> [[2NF|2nf]]\n-- city moved out of orders into customers              -> [[3NF|3nf]]', why: 'Removing lists gives 1NF. price depended on part of the key (product), a partial dependency, so moving it gives 2NF. city depended on customer, a non-key column, so moving it gives 3NF.' },
      { type: 'bug', prompt: 'This order table is meant to be in 3NF. Tap the column that breaks it.', code: 'CREATE TABLE orders (\n    id           INTEGER PRIMARY KEY,\n    customer_id  INTEGER NOT NULL REFERENCES customers(id),\n    customer_city TEXT NOT NULL,\n    created_at   INTEGER NOT NULL\n);', bug: 3, fix: '    -- (removed) city lives in customers; join when needed', why: '<code>customer_city</code> depends on <code>customer_id</code>, not on the order id. That transitive dependency breaks 3NF and means a move must update every order.' },
    ],
    quiz: [
      { q: 'In <code>order_lines(order_id, product, qty, price)</code> with key (order_id, product), <code>price</code> depends only on <code>product</code>. Which form does this break?', options: ['1NF', '2NF', '3NF only'], a: 1, why: 'A non-key column depending on part of a composite key is a partial dependency, which 2NF forbids. Move price to products.' },
      { q: 'A feed shows like counts for 50 posts and is read 1,000 times for each like. What fits?', options: ['Keep counting with COUNT(*) on every read', 'Store like_count on the post and update it in the same transaction as the like', 'Store likes as a comma-separated list on the post'], a: 1, why: 'Reads dominate, so paying one extra write per like is cheap. The transaction keeps the counter and the rows in sync.' },
      { q: 'Why does an order line keep its own <code>unit_price</code> even in a normalized schema?', options: ['To break 3NF on purpose for speed', 'Because the price at sale time is a separate fact that must not change when the product price changes', 'SQLite cannot join on prices'], a: 1, why: 'The receipt must show what the customer paid. That historic value is not a duplicate of the current price.' },
    ],
  });

  // 5 ─────────────────────────────────────────────
  // Deterministic shuffle of 1..64 for the heap (table) order.
  const HEAP = (() => { const a = Array.from({ length: 64 }, (_, i) => i + 1); let s = 7; for (let i = a.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) % 2147483648; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; })();
  lessons.push({
    id: 'indexes',
    title: 'Indexes',
    tagline: 'A sorted tree beside the table: reads get fast, every write pays a little.',
    level: 'intermediate',
    body: `
<p>Without an index, <code>WHERE email = ?</code> reads every row: a <strong>full scan</strong>, O(n). An <strong>index</strong> is a separate B-tree holding the column’s values in sorted order, each with a pointer (the rowid) back to the table row. A lookup walks from the root to a leaf: O(log n), a handful of pages even for millions of rows. See <a href="#cs.trees">trees</a> and <a href="#cs.binary-search">binary search</a> for the idea underneath.</p>
<p>A B-tree is wide, not tall. Each node is a disk page holding many keys, so a tree with hundreds of keys per node reaches millions of rows in 3 or 4 levels. That matters because reading a page is the expensive part.</p>
<p>Indexes are not free. Each one takes disk space and every <code>INSERT</code>, <code>UPDATE</code> of an indexed column, and <code>DELETE</code> must update it too. Add indexes for the queries you actually run, check them with <code>EXPLAIN QUERY PLAN</code>, and drop ones nothing uses. Try both lookups below.</p>`,
    visual(el) {
      let target = 47, tok = 0;
      const cells = HEAP.map(v => h('div', { class: 'dbx-cell' }, String(v)));
      const grid = h('div', { class: 'dbx-grid' }, cells);
      const tree = h('div', { class: 'dbx-tree' });
      const plan = h('pre', { class: 'dbx-sql' });
      const st = stats(['rows read (scan)', 'pages read (index)']);
      const msg = out('');
      const tLabel = h('b', {});
      // Fan-out 4: root splits 1..64 in 4 ranges of 16, level 2 in ranges of 4, leaves hold 4 keys.
      const nodeEl = keys => h('div', { class: 'dbx-node' }, keys.map(k => h('span', { class: 'dbx-k' }, String(k))));
      function drawTree(show) {
        const lo2 = Math.floor((target - 1) / 16) * 16, lo3 = Math.floor((target - 1) / 4) * 4;
        const root = nodeEl([16, 32, 48]);
        const lvl2 = [0, 16, 32, 48].map(lo => { const n = nodeEl([lo + 4, lo + 8, lo + 12]); if (lo !== lo2) n.classList.add('dbx-idle'); return n; });
        const leaf = nodeEl([lo3 + 1, lo3 + 2, lo3 + 3, lo3 + 4]);
        tree.replaceChildren(
          h('div', { class: 'dbx-lvl' }, label('root'), root),
          h('div', { class: 'dbx-lvl' }, label('inner'), lvl2),
          h('div', { class: 'dbx-lvl' }, label('leaf'), show ? leaf : h('span', { class: 'dbx-stat' }, '16 leaves')));
        return { root, mid: lvl2[lo2 / 16], leaf };
      }
      function reset() {
        tok++;
        cells.forEach(cl => { cl.className = 'dbx-cell'; });
        drawTree(false);
        st.set('rows read (scan)', '-'); st.set('pages read (index)', '-');
        tLabel.textContent = String(target);
      }
      async function scan() {
        reset(); const t = tok;
        plan.textContent = `EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'u${target}@…';\n\`--SCAN users`;
        for (let i = 0; i < HEAP.length; i++) {
          cells[i].classList.add(HEAP[i] === target ? 'dbx-found' : 'dbx-read');
          st.set('rows read (scan)', i + 1);
          if (HEAP[i] === target) { say(msg, `Found after reading <b>${i + 1}</b> of 64 rows. The table is in insertion order, so the scan has no idea where to look. Ask for a missing value and it reads all 64.`); return; }
          await sleep(45);
          if (t !== tok || !el.isConnected) return;
        }
      }
      async function seek() {
        reset(); const t = tok;
        plan.textContent = `CREATE INDEX idx_users_email ON users(email);\nEXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'u${target}@…';\n\`--SEARCH users USING INDEX idx_users_email (email=?)`;
        const { root, mid, leaf } = drawTree(true);
        const path = [root, mid, leaf];
        for (let lv = 0; lv < 3; lv++) {
          const keys = [...path[lv].children];
          for (const k of keys) {
            const v = Number(k.textContent);
            k.classList.add(v === target ? 'dbx-found' : 'dbx-cmp');
            await sleep(260);
            if (t !== tok || !el.isConnected) return;
            if (v >= target) break;
          }
          st.set('pages read (index)', lv + 1);
        }
        const i = HEAP.indexOf(target);
        cells[i].classList.add('dbx-found');
        say(msg, `3 index pages, then 1 jump by rowid to the row. At each level the keys say which child to visit. With real pages of ~100 keys, 3 levels cover a million rows.`);
      }
      el.append(h('div', { class: 'dbx-stage' },
        h('div', { class: 'controls' },
          act('Full scan', scan), act('Index lookup', seek),
          act('Another key', () => { target = 1 + Math.floor(Math.random() * 64); reset(); say(msg, `Now looking for u${target}.`); }),
          h('span', { class: 'dbx-stat' }, 'looking for u', tLabel)),
        st, plan, h('div', { class: 'dbx-row' }, h('div', { class: 'dbx-tw' }, label('table rows (heap order)'), grid), h('div', { class: 'dbx-tw' }, label('index b-tree'), tree)), msg));
      reset();
      plan.textContent = '-- run a lookup';
      say(msg, 'Same question, two strategies. Compare how much each one reads.');
    },
    code: `@Entity(
    tableName = "messages",
    indices = [
        Index(value = ["chat_id", "sent_at"]),         // serves: WHERE chat_id = ? ORDER BY sent_at
        Index(value = ["server_id"], unique = true),   // lookups during sync, and no duplicates
    ],
)
data class Message(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "server_id") val serverId: String,
    @ColumnInfo(name = "chat_id") val chatId: Long,
    @ColumnInfo(name = "sent_at") val sentAt: Long,
    val body: String,
)

@Query("SELECT * FROM messages WHERE chat_id = :chat ORDER BY sent_at DESC LIMIT 50")
fun latest(chat: Long): Flow<List<Message>>`,
    remember: 'Index the columns you filter, join and sort on. Leftmost columns of a composite index first. Check with EXPLAIN QUERY PLAN.',
    deeper: [
      {
        title: 'Composite index order',
        body: `<p>An index on <code>(city, name)</code> is sorted by city, then by name inside each city, like a phone book. It serves <code>WHERE city = ?</code> and <code>WHERE city = ? AND name = ?</code>, because the matches sit next to each other. It cannot jump to <code>WHERE name = ?</code> alone: Ece in İzmir and Ece in Ankara are far apart. Rule: the index is used from its leftmost column onward.</p>`,
        visual(el) {
          const IDX = [['Ankara', 'Ali'], ['Ankara', 'Ece'], ['Ankara', 'Mehmet'], ['İstanbul', 'Can'], ['İstanbul', 'Deniz'], ['İzmir', 'Ayşe'], ['İzmir', 'Ece'], ['İzmir', 'Zeynep']];
          const area = h('div', {});
          const plan = h('pre', { class: 'dbx-sql' });
          const msg = out('Index idx_city_name on users(city, name). Pick a WHERE clause.');
          const Q = [
            { l: "city = 'İzmir'", hit: r => r[0] === 'İzmir', plan: 'SEARCH users USING INDEX idx_city_name (city=?)', m: 'One seek to the first İzmir entry, then read the 3 entries next to it.' },
            { l: "city = 'İzmir' AND name = 'Ece'", hit: r => r[0] === 'İzmir' && r[1] === 'Ece', plan: 'SEARCH users USING INDEX idx_city_name (city=? AND name=?)', m: 'Both columns narrow the seek: straight to one entry.' },
            { l: "name = 'Ece'", hit: r => r[1] === 'Ece', scan: true, plan: 'SCAN users', m: 'The Ece entries are not adjacent, so a seek is impossible. Without other help, SQLite scans the table. Add an index that starts with name if this query matters.' },
          ];
          const btns = Q.map((q, k) => act(q.l, () => {
            press(btns, btns[k]);
            area.replaceChildren(tbl('idx_city_name (sorted)', ['city', 'name'], IDX, { cls: r => q.hit(r) ? 'dbx-hit' : q.scan ? 'dbx-warm' : 'dbx-dim' }));
            plan.textContent = `EXPLAIN QUERY PLAN SELECT * FROM users WHERE ${q.l};\n\`--${q.plan}`;
            say(msg, q.m);
          }));
          press(btns, null);
          area.append(tbl('idx_city_name (sorted)', ['city', 'name'], IDX));
          plan.textContent = '-- pick a query';
          el.append(h('div', { class: 'dbx-stage' }, h('div', { class: 'controls' }, btns), plan, area, msg));
        },
      },
      {
        title: 'Read the plan',
        body: `<p><code>EXPLAIN QUERY PLAN</code> tells you what SQLite will do. <code>SCAN</code> visits every row; <code>SEARCH … USING INDEX</code> visits a subset; <code>USING COVERING INDEX</code> means the index holds every column the query needs, so the table is never read. <code>USE TEMP B-TREE FOR ORDER BY</code> means it has to sort. The output format is for humans and can change between versions, so read it, do not parse it.</p>`,
        code: `// In a debug build, or in Android Studio's Database Inspector
db.query("EXPLAIN QUERY PLAN SELECT * FROM messages WHERE chat_id = 7 ORDER BY sent_at").use { c ->
    while (c.moveToNext()) Log.d("plan", c.getString(3))
}
// SEARCH messages USING INDEX index_messages_chat_id_sent_at (chat_id=?)`,
      },
      {
        title: 'What an index costs',
        body: `<p>Each index is another B-tree to update on every insert and delete, and on updates of its columns. Five indexes on a table means six trees to write per insert. Indexes also take disk space and a bulk import slows down. An index on a low-selectivity column (a boolean that is true for half the rows) rarely helps, because the engine still touches half the table.</p>
<p>Avoid redundant indexes: if you have <code>(chat_id, sent_at)</code>, a separate index on <code>(chat_id)</code> is a prefix of it and adds cost without a new benefit.</p>`,
      },
    ],
    underHood: {
      body: `<p>In SQLite a normal table is itself a B-tree keyed by rowid, with the row data in the leaves. An index is a second B-tree whose entries are the indexed values plus the rowid, and no other data. So an index lookup is two searches: find the rowid in the index, then find the row in the table. A covering index skips the second search. The SQLite docs put the cost of finding K matching rows through an index at about (K + 1) × log N.</p>`,
    },
    mistakes: [
      { title: 'Wrong column order in a composite index', bad: '@Entity(indices = [Index(value = ["sent_at", "chat_id"])])\n// query: WHERE chat_id = ? ORDER BY sent_at', good: '@Entity(indices = [Index(value = ["chat_id", "sent_at"])])', why: 'The query filters by chat_id with equality. Put equality columns first, then the sort or range column. Starting with sent_at cannot seek by chat.' },
      { title: 'A function on the indexed column', bad: "SELECT * FROM users WHERE lower(email) = 'ayse@x.com';", good: "-- store emails lowercased, then\nSELECT * FROM users WHERE email = 'ayse@x.com';", why: 'The index holds email values, not lower(email). Wrapping the column hides it from the index and forces a scan. Normalize on write, or create an index on the expression.' },
    ],
    terms: [
      { term: 'Index', def: 'A separate sorted structure (a B-tree) mapping column values to rows, for fast lookups.' },
      { term: 'Full table scan', def: 'Reading every row of a table to answer a query, O(n).' },
      { term: 'Composite index', def: 'An index on several columns, sorted by the first, then the second within it, and so on.' },
      { term: 'Covering index', def: 'An index that contains every column a query needs, so the table itself is not read.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Add the index that serves <code>WHERE chat_id = ? ORDER BY sent_at</code>.', code: '@Entity(indices = [Index(value = ["[[chat_id]]", "[[sent_at]]"])])\ndata class Message(/* ... */)', why: 'Equality column first, so the seek lands on one chat; then sent_at, so the rows inside that chat are already in order and no sort step is needed.' },
      { type: 'bug', prompt: 'There is an index on <code>email</code>, yet <code>EXPLAIN QUERY PLAN</code> says <code>SCAN users</code>. Tap the line that hides the index.', code: '@Query("""\n    SELECT id, name FROM users\n    WHERE lower(email) = :email\n    LIMIT 1\n""")\nsuspend fun byEmail(email: String): UserRow?', bug: 2, fix: '    WHERE email = :email', why: 'The index stores raw email values. <code>lower(email)</code> is a different expression, so SQLite cannot use the index. Store emails lowercased and compare the column directly.' },
    ],
    quiz: [
      { q: 'With an index on <code>(city, name)</code>, which query cannot seek with it?', options: ["WHERE city = 'İzmir'", "WHERE city = 'İzmir' AND name = 'Ece'", "WHERE name = 'Ece'"], a: 2, why: 'The index is ordered by city first. Rows with name Ece are spread across cities, so there is no single place to seek to.' },
      { q: 'A table has 1,000,000 rows and a B-tree index with about 100 keys per page. Roughly how many index pages does one lookup read?', options: ['About 3', 'About 1,000', 'About 500,000'], a: 0, why: '100 × 100 × 100 = 1,000,000, so three levels are enough. That is why indexes stay fast as tables grow.' },
      { q: 'You add 6 indexes to a <code>messages</code> table that syncs thousands of rows. What gets worse?', options: ['Nothing, indexes only help', 'Inserts, because each one updates 7 B-trees', 'Reads by primary key'], a: 1, why: 'Every index is another tree to update on insert and delete. Keep only the ones a real query needs.' },
      { q: 'EXPLAIN QUERY PLAN prints <code>SEARCH t USING COVERING INDEX i (a=?)</code>. What does it mean?', options: ['The query reads every row', 'The index holds all the columns needed, so the table is not read', 'The index is corrupt'], a: 1, why: 'SEARCH means a subset of rows; COVERING means the answer comes from the index alone.' },
    ],
  });

  // 6 ─────────────────────────────────────────────
  const T = (lane, text, bad) => ({ lane, text, bad });
  const SCEN = [
    {
      key: 'ru', label: 'Read uncommitted', expect: 130,
      intro: 'T1 adds 50 but will fail and roll back. T2 adds 30. The right final balance is 100 + 30 = 130.',
      steps: [
        [T('T1', 'BEGIN; UPDATE wallet SET balance = 150   (not committed)'), 100, 150, 'T1 changed the row but has not committed.'],
        [T('T2', 'BEGIN; SELECT balance → 150', true), 100, 150, '<span class="bad">Dirty read.</span> T2 saw a value that was never committed.'],
        [T('T1', 'ROLLBACK'), 100, null, 'T1 failed and undid its change. The 150 never existed.'],
        [T('T2', 'UPDATE wallet SET balance = 150 + 30 = 180; COMMIT', true), 180, null, null],
      ],
    },
    {
      key: 'rc', label: 'Read committed', expect: 180,
      intro: 'Both transactions read the balance in the app, add to it, and write it back. T1 adds 50, T2 adds 30. Right answer: 180.',
      steps: [
        [T('T1', 'BEGIN; SELECT balance → 100'), 100, null, 'Only committed data is visible. No dirty reads at this level.'],
        [T('T2', 'BEGIN; SELECT balance → 100'), 100, null, 'T2 also reads 100. Both now compute from the same old value.'],
        [T('T1', 'UPDATE wallet SET balance = 150; COMMIT'), 150, null, 'T1 committed 150.'],
        [T('T2', 'UPDATE wallet SET balance = 130; COMMIT', true), 130, null, '<span class="bad">Lost update.</span> T2 wrote 100 + 30 over T1’s 150.'],
      ],
    },
    {
      key: 'rr', label: 'Repeatable read (PostgreSQL)', expect: 180,
      intro: 'Same read-then-write code, on PostgreSQL at REPEATABLE READ. Right answer: 180.',
      steps: [
        [T('T1', 'BEGIN ISOLATION LEVEL REPEATABLE READ; SELECT → 100'), 100, null, 'Each transaction reads from a snapshot taken when it starts.'],
        [T('T2', 'BEGIN ISOLATION LEVEL REPEATABLE READ; SELECT → 100'), 100, null, 'T2’s snapshot also says 100.'],
        [T('T1', 'UPDATE … = 150; COMMIT'), 150, null, 'T1 commits.'],
        [T('T2', 'UPDATE … → ERROR: could not serialize access due to concurrent update'), 150, null, 'The row changed after T2’s snapshot, so PostgreSQL refuses the write instead of losing T1’s update.'],
        [T('T2', 'ROLLBACK; retry: BEGIN; SELECT → 150; UPDATE … = 180; COMMIT'), 180, null, 'The app retries the whole transaction and reads the new value.'],
      ],
    },
    {
      key: 'sqlite', label: 'SQLite (serializable)', expect: 180,
      intro: 'SQLite allows one writer at a time. Both transactions start with BEGIN IMMEDIATE, which takes the write lock up front. Right answer: 180.',
      steps: [
        [T('T1', 'BEGIN IMMEDIATE; SELECT balance → 100'), 100, null, 'T1 holds the write lock.'],
        [T('T2', 'BEGIN IMMEDIATE → SQLITE_BUSY, waits for the lock'), 100, null, 'T2 cannot start a write while T1 holds the lock. With a busy timeout it waits.'],
        [T('T1', 'UPDATE wallet SET balance = 150; COMMIT'), 150, null, 'T1 commits and releases the lock.'],
        [T('T2', 'gets the lock; SELECT balance → 150'), 150, null, 'T2 starts after T1, so it reads 150.'],
        [T('T2', 'UPDATE wallet SET balance = 180; COMMIT'), 180, null, null],
      ],
    },
    {
      key: 'atomic', label: 'One atomic UPDATE', expect: 180,
      intro: 'Skip the read in the app. Let the database do the arithmetic in one statement. Right answer: 180.',
      steps: [
        [T('T1', 'UPDATE wallet SET balance = balance + 50'), 150, null, 'One statement is its own transaction. The read and the write happen together.'],
        [T('T2', 'UPDATE wallet SET balance = balance + 30'), 180, null, 'T2 adds to whatever is committed when it gets the write lock.'],
      ],
    },
  ];
  function scenFrames(s) {
    const fr = [{ log: [], committed: 100, pending: null, msg: s.intro }];
    s.steps.forEach(([ev, committed, pending, m], k) => {
      const last = k === s.steps.length - 1;
      const ok = committed === s.expect;
      fr.push({
        log: [...fr[fr.length - 1].log, ev], committed, pending,
        msg: last ? `Final balance <b>${committed}</b>, expected ${s.expect}: ${ok ? '<span class="dbx-pass">correct</span>.' : '<span class="dbx-fail">wrong</span>.'} ${m || ''}` : m,
        end: last, ok,
      });
    });
    return fr;
  }
  lessons.push({
    id: 'transactions',
    title: 'Transactions and ACID',
    tagline: 'A group of writes that all happen or none do, without stepping on other writers.',
    level: 'advanced',
    body: `
<p>A <strong>transaction</strong> groups statements into one unit. <strong>ACID</strong> names its promises. <strong>Atomicity</strong>: all of it commits, or none of it. <strong>Consistency</strong>: constraints hold before and after. <strong>Isolation</strong>: concurrent transactions do not see each other’s half-done work. <strong>Durability</strong>: once committed, it survives a crash.</p>
<p>Isolation comes in levels, trading safety for concurrency. The SQL standard defines read uncommitted, read committed, repeatable read and serializable by which anomalies they allow: <strong>dirty reads</strong> (seeing uncommitted data), non-repeatable reads, phantoms. The <strong>lost update</strong> (two read-modify-write cycles where one overwrites the other) bites at read committed, which is PostgreSQL’s default.</p>
<p>SQLite is simpler: transactions are serializable and only one writer runs at a time. In WAL mode readers keep reading a snapshot while the writer works. On Android, wrap related writes in a Room <code>@Transaction</code> or <code>withTransaction { }</code>; see <a href="#data.room">Room</a> and, for in-memory races, <a href="#coroutines.shared-state">shared state</a>. Step through each level below.</p>`,
    visual(el) {
      const log = h('div', { class: 'dbx-log' });
      const st = stats(['committed balance', 'uncommitted']);
      let p;
      const btns = SCEN.map((s, k) => act(s.label, () => { press(btns, btns[k]); p.load(scenFrames(s)); }));
      press(btns, btns[0]);
      p = player(el, {
        top: [h('div', { class: 'controls' }, btns)],
        view: [st, log],
        speed: 1300,
        frames: scenFrames(SCEN[0]),
        paint(f) {
          st.set('committed balance', f.committed);
          st.set('uncommitted', f.pending == null ? '-' : f.pending);
          log.replaceChildren(...f.log.map((e, k) => h('div', { class: `dbx-ev ${e.bad ? 'dbx-evbad' : ''} ${f.end && k === f.log.length - 1 && f.ok ? 'dbx-evok' : ''}` },
            h('span', { class: `dbx-lane ${e.lane === 'T1' ? 'dbx-t1' : 'dbx-t2'}` }, e.lane), h('span', {}, e.text))));
        },
      });
    },
    code: `// Room: both writes commit together, or neither does
suspend fun transfer(db: AppDatabase, from: Long, to: Long, kurus: Long) {
    db.withTransaction {
        val dao = db.walletDao()
        check(dao.balance(from) >= kurus) { "insufficient funds" }
        dao.add(from, -kurus)
        dao.add(to, kurus)
    }
}

@Dao
interface WalletDao {
    @Query("SELECT balance FROM wallet WHERE id = :id")
    suspend fun balance(id: Long): Long

    // The arithmetic happens inside the database: no lost update
    @Query("UPDATE wallet SET balance = balance + :delta WHERE id = :id")
    suspend fun add(id: Long, delta: Long)
}`,
    remember: 'Group related writes in one transaction. Do read-modify-write in SQL (balance = balance + x), or at an isolation level that stops lost updates.',
    deeper: [
      {
        title: 'The anomalies, by level',
        body: `<p>The standard table, with PostgreSQL’s actual behavior in brackets:</p>
<ul><li><strong>Read uncommitted</strong>: dirty reads allowed [PostgreSQL treats it as read committed].</li>
<li><strong>Read committed</strong>: no dirty reads; non-repeatable reads and phantoms allowed. PostgreSQL’s default.</li>
<li><strong>Repeatable read</strong>: a transaction keeps seeing its first snapshot [PostgreSQL also blocks phantoms here and aborts the second writer of a row].</li>
<li><strong>Serializable</strong>: the result matches some one-at-a-time order. The database may abort a transaction, so the app must retry.</li></ul>
<p>Higher levels mean more aborts and waits. Many backends stay at read committed and fix hot spots with atomic updates or <code>SELECT … FOR UPDATE</code> row locks.</p>`,
      },
      {
        title: 'SQLite on Android: one writer, WAL readers',
        body: `<p>SQLite lets only one connection write at a time; other writers wait or get <code>SQLITE_BUSY</code>. In the default rollback-journal mode a writer committing blocks readers. In <strong>WAL mode</strong> (write-ahead logging) changes go to a separate <code>-wal</code> file: readers keep reading the last committed snapshot while the writer appends, so the UI can read while sync writes. A checkpoint later copies the log back into the main file.</p>
<p>Plain <code>BEGIN</code> is deferred: a transaction that reads first and writes later may fail to upgrade if another connection committed in between. <code>BEGIN IMMEDIATE</code> takes the write lock at the start. Keep write transactions short, and never do network calls inside one.</p>`,
        code: `Room.databaseBuilder(context, AppDatabase::class.java, "app.db")
    .setJournalMode(RoomDatabase.JournalMode.WRITE_AHEAD_LOGGING)   // explicit WAL
    .build()

// Wrong: holds the write lock for the whole network call
db.withTransaction { val page = api.fetch(); dao.insertAll(page) }
// Right: fetch first, then a short transaction
val page = api.fetch()
db.withTransaction { dao.clear(); dao.insertAll(page) }`,
      },
      {
        title: 'Atomicity and durability: the journal',
        body: `<p>How does a crash mid-write not leave half a transaction? The database writes intent to a journal before touching the main data. In rollback mode SQLite saves the original pages first and restores them after a crash. In WAL mode it appends new pages to the log, and a transaction counts only once its commit record is in the log. PostgreSQL uses its own write-ahead log the same way. Durability means that log reaches the disk before COMMIT returns.</p>`,
      },
    ],
    mistakes: [
      { title: 'Read in Kotlin, write back the sum', bad: 'val b = dao.balance(id)\ndao.setBalance(id, b + 50)     // two statements, no transaction', good: 'dao.add(id, 50)   // UPDATE wallet SET balance = balance + :delta', why: 'Between the read and the write another writer can commit, and your write erases theirs. Doing the arithmetic in one SQL statement makes it atomic.' },
      { title: 'Several writes, no transaction', bad: 'dao.deleteAll()\ndao.insertAll(fresh)     // the UI briefly sees an empty list', good: 'db.withTransaction {\n    dao.deleteAll()\n    dao.insertAll(fresh)\n}', why: 'Without a transaction, observers see the in-between state, and a crash after the delete leaves the table empty. A transaction commits both or neither.' },
    ],
    terms: [
      { term: 'ACID', def: 'Atomicity, Consistency, Isolation, Durability: the guarantees of a database transaction.' },
      { term: 'Dirty read', def: 'Reading data another transaction wrote but has not committed, and may roll back.' },
      { term: 'Lost update', def: 'Two transactions read the same value and write back; the second write erases the first.' },
      { term: 'WAL mode', def: 'SQLite write-ahead logging: writes go to a log file so readers can keep reading a snapshot during a write.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Make the like counter safe against lost updates, with no app-side read.', code: '@Query("UPDATE posts SET like_count = [[like_count + 1|like_count+1]] WHERE id = :id")\nsuspend fun like(id: Long)', why: 'The database reads and writes the value in one statement, under its own lock, so two likes at once both count.' },
      { type: 'bug', prompt: 'Users sometimes see an empty list during sync, and a crash mid-sync leaves it empty for good. Tap the line to change.', code: 'suspend fun sync(fresh: List<Article>) {\n    dao.deleteAll()\n    dao.insertAll(fresh)\n}', bug: 0, fix: 'suspend fun sync(fresh: List<Article>) = db.withTransaction {', why: 'Wrapping the body in <code>withTransaction</code> makes delete and insert one atomic unit: observers see old rows, then new rows, and a crash rolls back to the old rows. Close the block after the insert.' },
    ],
    quiz: [
      { q: 'T1 sets the balance to 150 without committing. T2 reads 150. T1 rolls back. What did T2 do?', options: ['A lost update', 'A dirty read', 'A phantom read'], a: 1, why: 'T2 read data that was never committed. Only read uncommitted allows it, and PostgreSQL does not allow it even there.' },
      { q: 'Two requests run <code>SELECT likes</code>, add 1 in Kotlin, then <code>UPDATE … SET likes = ?</code>, at read committed. Both started at 10. What is the final value?', options: ['12', '11', 'The second request fails'], a: 1, why: 'Both computed 11 from the same read. The second write overwrites the first: a lost update. Use likes = likes + 1.' },
      { q: 'In SQLite WAL mode, a sync job is writing. What happens to a query the UI runs at the same time?', options: ['It waits until the write commits', 'It reads the last committed snapshot and returns', 'It sees the half-written rows'], a: 1, why: 'In WAL mode writers do not block readers. The reader sees the database as of its start; the new rows show up on the next read.' },
      { q: 'At PostgreSQL REPEATABLE READ, your UPDATE fails with “could not serialize access due to concurrent update”. What should the app do?', options: ['Ignore it, the row was saved', 'Retry the whole transaction from the start', 'Switch to read uncommitted'], a: 1, why: 'Another transaction changed the row after your snapshot. Retrying reads the new value and redoes the logic on it.' },
      { q: 'Put a safe Room sync in order.', options: ['begin transaction → fetch from network → write → commit', 'fetch from network → begin transaction → write → commit', 'write → fetch from network → commit'], a: 1, why: 'Network calls are slow and can hang. Holding the single SQLite write lock during one blocks every other writer. Fetch first, then write in a short transaction.' },
    ],
  });

  // 7 ─────────────────────────────────────────────
  lessons.push({
    id: 'nosql',
    title: 'NoSQL',
    tagline: 'Model the data for the queries you will run, not for the facts you have.',
    level: 'intermediate',
    body: `
<p>“NoSQL” covers several shapes. <strong>Key-value</strong> stores (Redis, <a href="#data.datastore">DataStore</a> on the device) get and set a value by key and little else. <strong>Document</strong> stores (Firestore, MongoDB) keep JSON-like documents with nested fields. <strong>Wide-column</strong> stores (Cassandra, Bigtable) group rows by a partition key and spread them across many machines. <strong>Graph</strong> databases (Neo4j) store nodes and edges for “friends of friends” queries.</p>
<p>The big mental shift: in a relational database you normalize and join at read time. Document stores have limited or no joins, so you shape documents around your screens and copy data where reads need it. Firestore bills and limits by documents read and written, so a feed that needs 1 read per post plus 1 per author costs twice what a copied author name would.</p>
<p>The trade is writes. Copied data has to be updated everywhere when it changes. Toggle the model below and compare reads for the feed against writes for a rename.</p>`,
    visual(el) {
      let denorm = false;
      const doc = h('pre', { class: 'dbx-doc' });
      const st = stats(['reads', 'writes']);
      const msg = out('Feed: 10 posts by 6 authors. Ayşe wrote 4 of them.');
      const modeB = [act('Normalized: authorId only', () => set(false)), act('Denormalized: copy authorName', () => set(true))];
      function set(d) {
        denorm = d; press(modeB, modeB[d ? 1 : 0]);
        st.set('reads', '-'); st.set('writes', '-');
        doc.textContent = d
          ? 'users/ayse   { name: "Ayşe", city: "İzmir" }\nposts/p10    { authorId: "ayse",\n               authorName: "Ayşe",\n               title: "Kumru tarifi", likes: 42 }\nposts/p11    { authorId: "ayse", authorName: "Ayşe", … }'
          : 'users/ayse   { name: "Ayşe", city: "İzmir" }\nposts/p10    { authorId: "ayse",\n               title: "Kumru tarifi", likes: 42 }\nposts/p11    { authorId: "ayse", … }';
        replay(doc, 'pop-soft');
        say(msg, d ? 'Each post carries the author name it shows on screen.' : 'Posts point at users by id, like a foreign key. There is no server-side join.');
      }
      el.append(h('div', { class: 'dbx-stage' },
        h('div', { class: 'controls' }, modeB),
        h('div', { class: 'controls' },
          act('Load feed', () => {
            st.set('reads', denorm ? 10 : 16); st.set('writes', 0);
            say(msg, denorm ? '<b>10 reads</b>: one query, the name is already in each post.' : '<b>16 reads</b>: 10 posts, then 6 user documents fetched by id to show the names. The client does the join.');
          }),
          act('Rename Ayşe', () => {
            st.set('reads', denorm ? 4 : 0); st.set('writes', denorm ? 5 : 1);
            say(msg, denorm ? '<b>5 writes</b>: her user document plus 4 posts, ideally in one batched write or a Cloud Function. Miss one and the feed shows the old name.' : '<b>1 write</b>: the user document. Every feed shows the new name at once.');
          })),
        st, doc, msg));
      set(false);
    },
    code: `// Firestore (Android, Kotlin): shape documents around the screen
data class FeedPost(
    val authorId: String = "",
    val authorName: String = "",      // copied so the feed needs one query
    val title: String = "",
    val likes: Long = 0,
    val createdAt: Timestamp? = null,
)

val feed = Firebase.firestore.collection("posts")
    .orderBy("createdAt", Query.Direction.DESCENDING)
    .limit(20)
    .snapshots()                       // Flow<QuerySnapshot>
    .map { it.toObjects<FeedPost>() }

// Rename: update the user and every copy in one atomic batch
suspend fun rename(uid: String, name: String, postIds: List<String>) {
    val db = Firebase.firestore
    db.runBatch { b ->
        b.update(db.collection("users").document(uid), "name", name)
        postIds.forEach { b.update(db.collection("posts").document(it), "authorName", name) }
    }.await()
}`,
    remember: 'Relational: model the facts, join on read. Document: model the screens, copy on write. Pick by your read and write patterns.',
    deeper: [
      {
        title: 'Four shapes, four sweet spots',
        body: `<ul><li><strong>Key-value</strong>: sessions, caches, feature flags, settings. Fast by key; no queries on the value.</li>
<li><strong>Document</strong>: profiles, posts, chat messages. Nested data read together; queries on fields with indexes; few or no joins.</li>
<li><strong>Wide-column</strong>: huge append-heavy data like events or metrics, read by a known partition key (for example, per device per day).</li>
<li><strong>Graph</strong>: relationships are the data: social graphs, recommendations, fraud rings.</li></ul>
<p>Relational databases are still the default for business data with many relationships and a need for transactions across them. Many systems use both.</p>`,
      },
      {
        title: 'Firestore: nest, subcollection or root collection',
        body: `<p>Firestore stores documents in collections; a document can hold nested maps and its own <strong>subcollections</strong>. A document is limited to 1 MiB, so a growing list (all comments on a post) should not be an array inside it. Put it in a subcollection (<code>posts/p10/comments</code>) or a root collection with a <code>postId</code> field. Root collections suit many-to-many links; subcollections keep the parent small. Firestore needs an index for every query, and composite queries need composite indexes you declare.</p>`,
        code: `// Small, fixed list: nest it
users/ayse { name: "Ayşe", links: { github: "...", site: "..." } }

// Grows without limit: subcollection
posts/p10/comments/c1 { authorId: "can", text: "Eline sağlık" }

// Many-to-many: a root collection of pairs
follows/ayse_can { from: "ayse", to: "can", at: <timestamp> }`,
      },
      {
        title: 'CAP in plain words',
        body: `<p>When a distributed database is split by a network failure (a <strong>partition</strong>), each side must choose: refuse requests until it can reach the other side (<strong>consistent</strong>, “CP”), or keep answering with what it has and reconcile later (<strong>available</strong>, “AP”). You cannot have both during the split. When the network is fine, the trade becomes latency versus consistency. Cut the link and try each choice.</p>`,
        visual(el) {
          let cut = false, mode = 'CP', a = 1, b = 1;
          const ra = h('b', {}), rb = h('b', {});
          const link = h('span', { class: 'dbx-link' });
          const msg = out('Two replicas of the same value x. Pick a mode, cut the link, then write.');
          const mB = [act('CP: refuse', () => setMode('CP')), act('AP: accept', () => setMode('AP'))];
          function paint() { ra.textContent = String(a); rb.textContent = String(b); link.textContent = cut ? '✕ cut' : '⇄ ok'; link.className = `dbx-link ${cut ? 'dbx-cut' : ''}`; replay(ra, 'pop-soft'); replay(rb, 'pop-soft'); }
          function setMode(m) { mode = m; press(mB, mB[m === 'CP' ? 0 : 1]); say(msg, m === 'CP' ? 'CP: during a partition, writes that cannot reach the other replica are refused.' : 'AP: every replica keeps accepting writes and syncs later.'); }
          el.append(h('div', { class: 'dbx-stage' },
            h('div', { class: 'controls' }, mB),
            h('div', { class: 'controls' },
              act('Cut the link', () => { cut = true; paint(); say(msg, 'Partition. Replica A and replica B cannot talk.'); }),
              act('Write x = x + 1 on A', () => {
                if (!cut) { a += 1; b = a; paint(); say(msg, 'Link is up: A writes and B copies it. Both agree.'); return; }
                if (mode === 'CP') { say(msg, '<span class="bad">Error: cannot reach a majority, try later.</span> Consistent, but not available.'); return; }
                a += 1; paint(); say(msg, `Accepted on A. B still says ${b}. Available, but a reader on B gets a <b>stale</b> value.`);
              }),
              act('Read on B', () => say(msg, cut && mode === 'CP' ? '<span class="bad">Error: B may be stale, refusing.</span>' : `B answers x = ${b}${a !== b ? ', which is stale' : ''}.`)),
              act('Heal', () => { cut = false; b = a = Math.max(a, b); paint(); say(msg, `Link back. The replicas sync to x = ${a}. In AP systems conflicting writes need a merge rule, such as last write wins.`); })),
            h('div', { class: 'dbx-replicas' }, h('div', { class: 'dbx-rep' }, 'replica A', ra), link, h('div', { class: 'dbx-rep' }, 'replica B', rb)),
            msg));
          setMode('CP'); paint();
        },
      },
    ],
    mistakes: [
      { title: 'An unbounded array inside one document', bad: 'posts/p10 { title: "...", comments: [ {...}, {...}, ... ] }   // grows forever', good: 'posts/p10/comments/{commentId} { authorId, text, createdAt }', why: 'A Firestore document has a 1 MiB limit, and every read downloads the whole array. A subcollection keeps the post small and lets you page comments.' },
      { title: 'Designing a NoSQL schema like SQL tables', bad: '// feed: query posts, then fetch each author, each like count, each tag\nposts.forEach { db.collection("users").document(it.authorId).get() }', good: '// store what the feed shows inside the post document\nposts/p10 { authorName, authorAvatar, likeCount, tags: ["food"] }', why: 'Without joins, normalized documents turn every screen into N+1 reads. Copy the fields the screen needs and update them on write.' },
    ],
    terms: [
      { term: 'Document store', def: 'A database of JSON-like documents with nested fields, queried by field, usually without joins.' },
      { term: 'Key-value store', def: 'A database that maps keys to opaque values; fast lookup by key only.' },
      { term: 'Partition (network)', def: 'A failure where parts of a distributed system cannot reach each other.' },
      { term: 'CAP trade-off', def: 'During a partition, a system must choose between refusing requests (consistency) and answering with possibly stale data (availability).' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Comments on a post can grow without limit. Put them where Firestore can page them.', code: 'Firebase.firestore\n    .collection("posts").document(postId)\n    .[[collection]]("comments")\n    .orderBy("createdAt")\n    .[[limit]](20)', why: 'A subcollection under the post holds one document per comment, and <code>limit</code> pages through them, instead of one huge array in the post.' },
      { type: 'bug', prompt: 'Renaming a user leaves the old name on some posts. Tap the line that should be part of the same batch.', code: 'suspend fun rename(uid: String, name: String, postIds: List<String>) {\n    val db = Firebase.firestore\n    db.collection("users").document(uid).update("name", name).await()\n    postIds.forEach { db.collection("posts").document(it).update("authorName", name) }\n}', bug: 3, fix: '    db.runBatch { b -> b.update(db.collection("users").document(uid), "name", name); postIds.forEach { b.update(db.collection("posts").document(it), "authorName", name) } }.await()', why: 'The post updates are fired and forgotten, outside any batch. If one fails, copies disagree. One batched write commits the user and every copy together.' },
    ],
    quiz: [
      { q: 'A chat app shows the sender’s name on every message and names change rarely. In Firestore, what fits?', options: ['Store only senderId and fetch each user on display', 'Copy senderName into each message and update copies on the rare rename', 'Keep all messages in one document'], a: 1, why: 'Reads are constant and renames are rare, so paying on the rename is cheaper. Fetching users per message is the N+1 pattern.' },
      { q: 'Which store fits “store the last 30 days of sensor readings per device, billions of rows, read by device and day”?', options: ['A graph database', 'A wide-column store partitioned by device and day', 'A single SQLite file'], a: 1, why: 'Wide-column stores spread rows by partition key across machines and read one partition fast. That matches append-heavy, key-shaped access.' },
      { q: 'During a network partition, an AP system accepts a write on replica A. What can a reader on replica B see?', options: ['An error', 'The old value until the partition heals', 'The new value immediately'], a: 1, why: 'AP keeps answering, so B serves what it has, which is stale. A CP system would refuse instead.' },
    ],
  });

  // 8 ─────────────────────────────────────────────
  const C = (name, st) => ({ name, st });
  const MIG_START = { cols: ['id', 'name'], rows: [[1, 'Ayşe'], [2, 'Can']] };
  const BIGBANG = [
    { ...MIG_START, clients: [C('app v1 reads name', 'ok')], msg: 'Backend table users(id, name). Every installed app is v1 and reads name.' },
    { cols: ['id', 'display_name'], rows: [[1, 'Ayşe'], [2, 'Can']], sql: "ALTER TABLE users RENAME COLUMN name TO display_name;", clients: [C('app v1 reads name', 'bad'), C('app v2 reads display_name', 'not out yet')], msg: '<span class="bad">Every v1 request now fails: no such column: name.</span> App stores take days to roll out v2, and some users never update.' },
  ];
  const EXPAND = [
    { ...MIG_START, clients: [C('app v1 reads name', 'ok')], msg: 'Same start. This time each step keeps every running version working.' },
    { cols: ['id', 'name', 'display_name'], rows: [[1, 'Ayşe', null], [2, 'Can', null]], sql: 'ALTER TABLE users ADD COLUMN display_name TEXT;', clients: [C('app v1 reads name', 'ok')], msg: '<b>Expand.</b> Add the new column, nullable, so the change is instant and nothing that exists breaks.' },
    { cols: ['id', 'name', 'display_name'], rows: [[1, 'Ayşe', null], [2, 'Can', null], [3, 'Ece', 'Ece']], sql: '-- backend code: on every write, set both name and display_name', clients: [C('app v1 reads name', 'ok')], msg: '<b>Dual write.</b> New and changed rows get both columns. Old rows still have NULL.' },
    { cols: ['id', 'name', 'display_name'], rows: [[1, 'Ayşe', 'Ayşe'], [2, 'Can', 'Can'], [3, 'Ece', 'Ece']], sql: 'UPDATE users SET display_name = name\nWHERE display_name IS NULL AND id BETWEEN ? AND ?;   -- in batches', clients: [C('app v1 reads name', 'ok')], msg: '<b>Backfill.</b> Copy old values in small batches so no single transaction locks the table for long.' },
    { cols: ['id', 'name', 'display_name'], rows: [[1, 'Ayşe', 'Ayşe'], [2, 'Can', 'Can'], [3, 'Ece', 'Ece']], sql: '-- release app v2 and API v2, reading display_name', clients: [C('app v1 reads name', 'ok'), C('app v2 reads display_name', 'ok')], msg: '<b>Switch reads.</b> Ship v2. Both versions work, because both columns exist and are in sync.' },
    { cols: ['id', 'name', 'display_name'], rows: [[1, 'Ayşe', 'Ayşe'], [2, 'Can', 'Can'], [3, 'Ece', 'Ece']], sql: '-- wait: watch v1 traffic fall; raise the minimum supported version', clients: [C('app v1 reads name', 'retired'), C('app v2 reads display_name', 'ok')], msg: '<b>Wait.</b> Only contract when analytics show v1 is gone or you force an update.' },
    { cols: ['id', 'display_name'], rows: [[1, 'Ayşe'], [2, 'Can'], [3, 'Ece']], sql: '-- stop writing name, then:\nALTER TABLE users DROP COLUMN name;', clients: [C('app v2 reads display_name', 'ok')], msg: '<b>Contract.</b> Remove the old column. The rename is done and no client ever broke.' },
  ];
  lessons.push({
    id: 'schema-evolution',
    title: 'Migrations and schema evolution',
    tagline: 'Change a live schema in small steps that every running version survives.',
    level: 'advanced',
    body: `
<p>A schema changes for the whole life of a product. A <strong>migration</strong> is a versioned script that moves the database from one shape to the next, kept in source control and run in order. On the device, Room runs it when the app opens a database with an older version; see <a href="#data.migrations">Room migrations</a>.</p>
<p>The device is the easy case: one app version talks to its own database file. A backend is harder. Old app versions stay installed for months, and during a deploy old and new server code run side by side. A change is <strong>backwards-compatible</strong> when the old code keeps working: adding a nullable column or a new table is safe; renaming, dropping or changing a column’s type is not.</p>
<p>The safe pattern is <strong>expand and contract</strong> (also called parallel change): add the new shape, write to both, backfill, move readers over, and only then remove the old shape. Compare it with the one-step rename below.</p>`,
    visual(el) {
      const sql = h('pre', { class: 'dbx-sql' });
      const area = h('div', {});
      const clients = h('div', { class: 'dbx-chips' });
      let p;
      const btns = [act('One-step rename', () => { press(btns, btns[0]); p.load(BIGBANG); }), act('Expand / contract', () => { press(btns, btns[1]); p.load(EXPAND); })];
      press(btns, btns[0]);
      p = player(el, {
        top: [h('div', { class: 'controls' }, btns)],
        view: [sql, area, clients],
        speed: 1500,
        frames: BIGBANG,
        paint(f) {
          sql.textContent = f.sql || '-- current schema';
          area.replaceChildren(tbl('users (backend)', f.cols, f.rows));
          clients.replaceChildren(label('clients'), ...f.clients.map(cl => h('span', { class: `dbx-chip ${cl.st === 'ok' ? 'dbx-okc' : cl.st === 'bad' ? 'dbx-badc' : 'dbx-off'}` }, `${cl.name}: ${cl.st === 'bad' ? 'broken' : cl.st}`)));
        },
      });
    },
    code: `@Database(
    entities = [User::class],
    version = 3,
    autoMigrations = [
        AutoMigration(from = 1, to = 2),                           // added a nullable column
        AutoMigration(from = 2, to = 3, spec = Rename2to3::class), // rename needs a hint
    ],
    exportSchema = true,          // schemas/ JSON files: commit them
)
abstract class AppDatabase : RoomDatabase()

@RenameColumn(tableName = "users", fromColumnName = "name", toColumnName = "display_name")
class Rename2to3 : AutoMigrationSpec

// Changes Room cannot infer, like splitting a table, get a manual Migration
val MIGRATION_3_4 = object : Migration(3, 4) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("CREATE TABLE addresses (user_id INTEGER NOT NULL PRIMARY KEY, city TEXT NOT NULL)")
        db.execSQL("INSERT INTO addresses (user_id, city) SELECT id, city FROM users")
    }
}`,
    remember: 'Expand, migrate data, switch readers, contract. Never remove what a running version still reads.',
    deeper: [
      {
        title: 'Safe and unsafe changes',
        body: `<ul><li><strong>Safe</strong>: add a table; add a nullable column, or one with a default; add an index (on a big PostgreSQL table, <code>CREATE INDEX CONCURRENTLY</code> avoids blocking writes).</li>
<li><strong>Unsafe in one step</strong>: rename or drop a column or table; change a type; add <code>NOT NULL</code> to existing data; tighten a constraint.</li></ul>
<p>Every unsafe change can be rewritten as a series of safe ones. The same rule applies to the API: add fields freely, never remove or repurpose one that old clients read.</p>`,
      },
      {
        title: 'SQLite cannot alter everything',
        body: `<p>SQLite’s <code>ALTER TABLE</code> supports renaming a table, renaming a column, adding a column and dropping a column, with limits. Adding a <code>NOT NULL</code> column needs a non-NULL default. Other changes (a new type, a new foreign key, a changed primary key) use the documented procedure: create the new table, copy the rows, drop the old one, rename the new one, all in one transaction. Room’s auto-migrations generate that recreate-and-copy SQL for you when needed.</p>`,
        code: `// Manual version of a table rebuild
db.execSQL("CREATE TABLE users_new (id INTEGER PRIMARY KEY NOT NULL, display_name TEXT NOT NULL, city TEXT)")
db.execSQL("INSERT INTO users_new (id, display_name, city) SELECT id, COALESCE(name, ''), city FROM users")
db.execSQL("DROP TABLE users")
db.execSQL("ALTER TABLE users_new RENAME TO users")
db.execSQL("CREATE INDEX index_users_city ON users(city)")   // indexes do not come along`,
      },
      {
        title: 'Test every path',
        body: `<p>A user can jump from version 1 straight to version 6. Test each migration and the full chain with Room’s <code>MigrationTestHelper</code>, which builds the old schema from the exported JSON, runs your migrations and checks the result against the new schema. A missing path throws <code>IllegalStateException</code> on open, which is a crash on launch. <code>fallbackToDestructiveMigration</code> deletes all data instead: acceptable for a pure cache, never for user data.</p>`,
        code: `@get:Rule
val helper = MigrationTestHelper(InstrumentationRegistry.getInstrumentation(), AppDatabase::class.java)

@Test fun migrate3to4() {
    helper.createDatabase("t.db", 3).use { it.execSQL("INSERT INTO users (id, display_name, city) VALUES (1, 'Ayşe', 'İzmir')") }
    helper.runMigrationsAndValidate("t.db", 4, true, MIGRATION_3_4).use { db ->
        db.query("SELECT city FROM addresses WHERE user_id = 1").use { c -> c.moveToFirst(); assertEquals("İzmir", c.getString(0)) }
    }
}`,
      },
    ],
    mistakes: [
      { title: 'Renaming a column the old app still reads', bad: '-- deploy day\nALTER TABLE users RENAME COLUMN name TO display_name;', good: '-- release 1: add display_name, dual write, backfill\n-- release 2: apps read display_name\n-- later: DROP COLUMN name', why: 'Installed apps and old server instances keep sending the old column name. Expand and contract keeps both shapes alive until nobody uses the old one.' },
      { title: 'Editing a migration that already shipped', bad: '// changed MIGRATION_2_3 after release to also add an index', good: '// leave MIGRATION_2_3 alone; add MIGRATION_3_4 with the index and bump version', why: 'Devices that already ran 2 → 3 will never run it again, so they miss the change and schemas drift. Shipped migrations are history; fix forward.' },
    ],
    terms: [
      { term: 'Migration', def: 'A versioned script that moves a database schema, and its data, from one version to the next.' },
      { term: 'Backwards-compatible change', def: 'A schema change that the currently running code keeps working with, like adding a nullable column.' },
      { term: 'Expand and contract', def: 'Change a schema by adding the new shape, moving data and readers over, then removing the old shape.' },
      { term: 'Backfill', def: 'Filling a new column or table with values derived from existing data, usually in batches.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Add a column that existing rows can satisfy, in one safe step on SQLite.', code: "ALTER TABLE users ADD COLUMN status TEXT NOT NULL [[DEFAULT|default]] 'active';", why: 'SQLite requires a non-NULL default when adding a NOT NULL column, so existing rows have a value. Without it the statement fails.' },
      { type: 'bug', prompt: 'Version 4 shipped, and users on version 2 now crash on launch. Tap the line that causes it.', code: 'Room.databaseBuilder(context, AppDatabase::class.java, "app.db")\n    .addMigrations(MIGRATION_1_2, MIGRATION_3_4)\n    .build()\n// @Database(version = 4)', bug: 1, fix: '    .addMigrations(MIGRATION_1_2, MIGRATION_2_3, MIGRATION_3_4)', why: 'There is no path from 2 to 3, so Room throws <code>IllegalStateException</code> when a version-2 database opens. Every step in the chain must exist.' },
    ],
    quiz: [
      { q: 'Put the expand/contract steps for renaming <code>name</code> to <code>display_name</code> in order.', options: ['drop name → add display_name → backfill → ship readers', 'add display_name → dual write → backfill → ship readers → drop name', 'ship readers → add display_name → drop name → backfill'], a: 1, why: 'Each step keeps every running version working: the old column stays until nobody reads it.' },
      { q: 'Which backend change is safe to deploy while old app versions are still in use?', options: ['Adding a nullable column', 'Dropping a column v1 reads', 'Changing a column from TEXT to INTEGER'], a: 0, why: 'Old code ignores a column it does not know. The other two break queries or parsing for old clients.' },
      { q: 'On the device, why does a Room migration not need expand/contract?', options: ['Room does it automatically', 'Only one app version uses that database file, and it migrates before first use', 'SQLite has no columns to rename'], a: 1, why: 'The app upgrades and migrates its own file in one go. The many-versions problem lives on the server and in the API.' },
    ],
  });

  Lab.addTrack({
    id: 'db',
    title: 'Databases',
    description: 'How databases work, from tables and SQL to indexes, transactions, NoSQL and migrations, tied back to SQLite, Room and the backend.',
    requires: ['kotlin'],
    css,
    lessons,
  });
})();
