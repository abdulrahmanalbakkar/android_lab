/* Data and storage track. Same shape as tracks/kotlin.js.
   Room basics, the repository and Retrofit live in the architecture track; this one goes past them.
   Demo styles live in the css string below; every class is prefixed dt-. */
(() => {
  const { h, sleep, hl, replay, swap } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const line = (el, html) => { el.append(h('div', { class: 'line drop-in', html })); el.scrollTop = el.scrollHeight; };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const toggle = (id, label, onchange) => {
    const input = h('input', { type: 'checkbox', id, onchange });
    return Object.assign(h('label', { class: 'switch', for: id }, input, label), { input });
  };

  const css = `
.dt-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.07em; color: var(--muted); }
.dt-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 14px; min-width: 0; }
.dt-card { display: grid; gap: 10px; align-content: start; padding: 14px; border-radius: 14px; border: 2px solid var(--line); background: var(--bg); min-width: 0; transition: border-color 0.25s, background 0.25s; }
.dt-card.dt-on { border-color: var(--accent); background: var(--accent-soft); }
.dt-head { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; justify-content: space-between; min-width: 0; }
.dt-title { font: 700 0.9rem var(--mono); overflow-wrap: anywhere; min-width: 0; }
.dt-sub { color: var(--muted); font-size: 0.86rem; overflow-wrap: anywhere; }
.dt-pill { font: 700 0.74rem var(--mono); padding: 2px 9px; border-radius: 999px; background: var(--sunk); color: var(--muted); white-space: nowrap; }
.dt-pill.dt-ok { background: var(--ok-soft); color: var(--ok); }
.dt-pill.dt-bad { background: var(--err-soft); color: var(--err); }
.dt-pill.dt-warn { background: var(--warm-soft); color: var(--warm); }
.dt-pill.dt-acc { background: var(--accent); color: var(--accent-ink); }

/* 1 choosing storage */
.dt-qs { display: grid; gap: 6px; min-width: 0; }
.dt-q { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); font-size: 0.92rem; transition: opacity 0.25s, border-color 0.25s, background 0.25s; min-width: 0; }
.dt-q > span:first-child { min-width: 0; flex: 1 1 200px; }
.dt-q.dt-ask { border-color: var(--warm); background: var(--warm-soft); }
.dt-q.dt-skip { opacity: 0.38; }
.dt-bins { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr)); gap: 8px; }
.dt-bin { display: grid; gap: 2px; align-content: start; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.25s, background 0.25s; }
.dt-bin b { font: 700 0.84rem var(--mono); overflow-wrap: anywhere; }
.dt-bin small { color: var(--muted); font-size: 0.8rem; }
.dt-bin.dt-on { border-color: var(--accent); background: var(--accent-soft); }
.dt-bin.dt-legacy { border-style: dashed; }
.dt-bin.dt-legacy b { text-decoration: line-through; color: var(--muted); }
.dt-bin.dt-from { border-color: var(--warm); }

/* 2 DataStore */
.dt-file { background: var(--code-bg); color: var(--code-ink); border-radius: 12px; padding: 12px 14px; font: 500 0.84rem/1.7 var(--mono); overflow-x: auto; white-space: pre; min-width: 0; }
.dt-file .dt-fname { color: var(--t-c); }
.dt-hit { background: rgba(255, 212, 121, 0.22); border-radius: 4px; padding: 0 2px; }
.dt-queue { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-height: 40px; padding: 6px 8px; border-radius: 10px; background: var(--sunk); min-width: 0; }
.dt-queue:empty::before { content: "no edits running"; color: var(--muted); font: 500 0.8rem var(--mono); }
.dt-tx { font: 600 0.76rem var(--mono); padding: 4px 8px; border-radius: 8px; background: var(--surface); border: 1px solid var(--line); color: var(--ink); }
.dt-tx.dt-run { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.dt-tx.dt-done { opacity: 0.45; }
.dt-ui { display: grid; gap: 8px; padding: 14px; border-radius: 14px; border: 2px solid var(--line); background: var(--surface); color: var(--ink); min-width: 0; transition: background 0.35s, color 0.35s; }
.dt-ui.dt-dark { background: var(--code-bg); color: var(--code-ink); border-color: var(--code-bg); }
.dt-ui-text { font-weight: 700; line-height: 1.3; transition: font-size 0.3s; overflow-wrap: anywhere; }
.dt-ui .dt-sub { color: inherit; opacity: 0.7; }
.dt-frame { background: var(--ok); }
.dt-frame.dt-lost { opacity: 0.15; }
.dt-grow { transition: width 0.9s linear; }

/* 3 relations, 4 migrations */
.dt-tables { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap: 10px; min-width: 0; }
.dt-table { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--surface); font: 500 0.8rem var(--mono); min-width: 0; align-self: start; }
.dt-tname { padding: 6px 10px; background: var(--code-bg); color: var(--code-ink); font-weight: 600; }
.dt-tr { display: grid; grid-template-columns: var(--dt-cols, minmax(0, 1fr) minmax(0, 1fr)); gap: 8px; padding: 5px 10px; border-top: 1px solid var(--line); transition: background 0.25s; }
.dt-tr > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dt-th { color: var(--muted); font-weight: 600; }
.dt-tr.dt-hot { background: var(--accent-soft); }
.dt-tr.dt-new { background: var(--ok-soft); }
.dt-tr > .dt-newcol { color: var(--ok); font-weight: 700; }
.dt-empty { padding: 10px; color: var(--muted); border-top: 1px solid var(--line); }
.dt-results { display: flex; flex-wrap: wrap; gap: 10px; min-height: 70px; align-items: flex-start; min-width: 0; }
.dt-results:empty::before { content: "Run a query to build objects."; color: var(--muted); font-size: 0.9rem; }
.dt-results .obj { min-width: 0; flex: 1 1 210px; overflow-wrap: anywhere; font-size: 0.8rem; }
.dt-nest { display: flex; flex-wrap: wrap; gap: 4px; padding-left: 10px; border-left: 2px solid var(--line); }
.dt-mini { font: 600 0.74rem var(--mono); padding: 2px 8px; border-radius: 999px; background: var(--sunk); }
.dt-crash { display: grid; justify-items: center; gap: 8px; padding: 18px 10px; text-align: center; border-top: 1px solid var(--line); }

/* 5 paging */
.dt-pg { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 16px; align-items: start; min-width: 0; }
.dt-feed { position: relative; height: 280px; overflow-y: auto; overscroll-behavior: contain; border-radius: 20px; border: 7px solid var(--code-bg); background: var(--surface); padding: 6px; display: grid; align-content: start; gap: 4px; min-width: 0; }
.dt-row { height: 36px; display: flex; align-items: center; gap: 8px; padding: 0 10px; border-radius: 8px; background: var(--sunk); font-size: 0.86rem; white-space: nowrap; overflow: hidden; min-width: 0; }
.dt-row b { font: 600 0.72rem var(--mono); color: var(--muted); flex: none; width: 2.2em; }
.dt-row span { overflow: hidden; text-overflow: ellipsis; }
.dt-row.dt-odd { background: var(--accent-soft); }
.dt-foot { display: grid; justify-items: center; gap: 6px; padding: 8px; min-height: 46px; color: var(--muted); font-size: 0.85rem; text-align: center; }
.dt-spin { width: 22px; height: 22px; border-width: 3px; }
.dt-refresh { position: sticky; top: 0; z-index: 1; justify-self: center; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: var(--surface); box-shadow: 0 4px 14px -6px rgba(20, 10, 60, 0.5); }
.dt-side { display: grid; gap: 10px; min-width: 0; }
.dt-states { display: grid; gap: 6px; }
.dt-state { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 10px; font: 600 0.78rem var(--mono); padding: 6px 10px; border-radius: 8px; background: var(--sunk); color: var(--muted); transition: background 0.2s, color 0.2s; }
.dt-state.dt-loading { background: var(--warm-soft); color: var(--warm); }
.dt-state.dt-err { background: var(--err-soft); color: var(--err); }
.dt-state.dt-end { background: var(--ok-soft); color: var(--ok); }
.dt-pages { display: flex; flex-wrap: wrap; gap: 4px; }
.dt-page { width: 34px; height: 24px; border-radius: 6px; background: var(--sunk); font: 600 0.7rem var(--mono); display: grid; place-items: center; color: var(--muted); }
.dt-page.dt-in { background: var(--accent); color: var(--accent-ink); }
.dt-page.dt-wait { outline: 2px dashed var(--warm); outline-offset: -2px; color: var(--warm); }
.dt-page.dt-fail { background: var(--err-soft); color: var(--err); }

/* 6 files */
.dt-zones { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 10px; min-width: 0; }
.dt-zone { display: grid; gap: 8px; align-content: start; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.25s; }
.dt-zone.dt-on { border-color: var(--accent); }
.dt-path { font: 500 0.74rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.dt-files { display: flex; flex-wrap: wrap; gap: 6px; min-height: 32px; align-items: center; }
.dt-files:empty::before { content: "(empty)"; color: var(--muted); font: 500 0.78rem var(--mono); }
.dt-fileic { font: 600 0.76rem var(--mono); padding: 4px 8px; border-radius: 8px; background: var(--bg); border: 1px solid var(--line); color: var(--ink); overflow-wrap: anywhere; }
.dt-fileic.dt-ours { border-color: var(--accent); color: var(--accent); }
.dt-fileic.dt-pending { border-style: dashed; opacity: 0.6; }
.dt-fileic.dt-orphan { border-color: var(--warm); color: var(--warm); }
.dt-sheet { display: grid; gap: 10px; padding: 14px; border-radius: 18px 18px 8px 8px; border: 2px solid var(--accent); background: var(--surface); min-width: 0; }
.dt-thumbs { display: flex; flex-wrap: wrap; gap: 8px; }
.dt-thumb { width: 76px; height: 64px; border-radius: 10px; border: 2px solid var(--line); background: linear-gradient(135deg, var(--accent-soft), var(--warm-soft)); color: var(--ink); font: 600 0.66rem var(--mono); cursor: pointer; display: grid; place-items: end center; padding: 4px; overflow: hidden; overflow-wrap: anywhere; }
.dt-thumb:hover { border-color: var(--accent); }

/* 7 caching */
.dt-screen { display: grid; gap: 6px; align-content: center; min-height: 92px; padding: 12px; border-radius: 14px; border: 2px solid var(--line); background: var(--surface); min-width: 0; }
.dt-screen .err-icon { width: 34px; height: 34px; font-size: 1.1rem; }
.dt-item { padding: 6px 10px; border-radius: 8px; background: var(--sunk); font-size: 0.86rem; font-weight: 700; overflow-wrap: anywhere; }
.bar.dt-bar-ok { background: var(--ok); }
.bar.dt-bar-stale { background: var(--warm); }
.legend .bar.dt-bar-ok, .legend .bar.dt-bar-stale { height: 12px; }
`;

  Lab.addTrack({
    id: 'data',
    title: 'Data and storage',
    description: 'Pick the right place for each kind of data, then use DataStore, Room relations, migrations, Paging, MediaStore and caching well.',
    group: 'Building apps', requires: ['arch'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'choose',
        title: 'Choosing storage',
        tagline: 'Settings, rows, blobs and shared media each have a home.',
        level: 'beginner',
        body: `
<p>On the device you have four main places for data. DataStore holds a few small settings. Room holds structured rows you query. App-specific files hold blobs like PDFs and downloads. MediaStore holds media that the user expects to see in other apps, like Gallery.</p>
<p><code>SharedPreferences</code> is the old key-value API. It parses the whole file into memory, its first read can block the main thread, and <code>apply()</code> can still stall the app when an activity stops. For new code use DataStore. It reads through a <code>Flow</code> and writes inside a coroutine.</p>
<p>Ask a few questions in order. Is it a blob? Should other apps see it? Do you query it? Pick a piece of data below and follow the questions to its home.</p>`,
        code: `// A few small settings: Preferences DataStore
val DARK_MODE = booleanPreferencesKey("dark_mode")
context.dataStore.edit { it[DARK_MODE] = true }

// Many rows you search, sort or join: Room
@Query("SELECT * FROM articles WHERE title LIKE :pattern ORDER BY publishedAt DESC")
fun search(pattern: String): Flow<List<ArticleEntity>>

// A blob only your app needs: app-specific files
File(context.filesDir, "issue-42.pdf").outputStream().use { body.copyTo(it) }

// Media the user wants in Gallery: MediaStore
context.contentResolver.insert(MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY), values)

// Legacy SharedPreferences: move the values into DataStore once
val Context.dataStore by preferencesDataStore(
    name = "settings",
    produceMigrations = { ctx -> listOf(SharedPreferencesMigration(ctx, "settings")) },
)`,
        remember: 'Settings go in DataStore, rows in Room, blobs in files, shared media in MediaStore.',
        terms: [
          { term: 'SharedPreferences', def: 'The legacy synchronous key-value store; DataStore replaces it for new code.' },
          { term: 'Room', def: 'The Jetpack library that wraps SQLite with typed entities, DAOs and compile-time checked queries.' },
          { term: 'SharedPreferencesMigration', def: 'A DataStore migration that copies values out of a SharedPreferences file the first time DataStore is read.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Store the dark-mode flag and the offline PDF in the right places.', code: '// a dark-mode flag\nval Context.dataStore by [[preferencesDataStore]](name = "settings")\n\n// a PDF only your app reads, kept until the user deletes it\nval pdf = File(context.[[filesDir]], "issue-42.pdf")', why: 'A flag is a small setting, so it goes in DataStore. A file the user expects to keep goes in <code>filesDir</code>. The system may clear <code>cacheDir</code> when space runs low.' },
          { type: 'bug', prompt: 'The feed screen gets slower with every sync. Tap the line that picked the wrong storage.', code: 'class FeedStore(\n    private val dao: ArticleDao,\n    private val dataStore: DataStore<Preferences>,\n) {\n    suspend fun saveFeed(articles: List<Article>) {\n        dataStore.edit { it[FEED_JSON] = Json.encodeToString(articles) }\n    }\n\n    suspend fun markSynced(at: Long) {\n        dataStore.edit { it[LAST_SYNC] = at }\n    }\n}', bug: 5, fix: '        dao.upsertAll(articles.map { it.toEntity() })', why: 'DataStore keeps its whole file in memory and rewrites all of it on every edit. Thousands of articles belong in Room, where you can update single rows and query them. The sync timestamp is a fine DataStore value.' },
        ],
        quiz: [
          { q: 'You cache 5,000 articles and need search by title. Where do they go?', options: ['Preferences DataStore', 'Room', 'A JSON file in <code>cacheDir</code>'], a: 1, why: 'Room gives you indexed queries, partial updates and Flow results. DataStore and a JSON file would load and rewrite everything.' },
          { q: 'Why is <code>SharedPreferences</code> a poor choice for new code?', options: ['It cannot store booleans', 'Its reads and writes can block the main thread, and it has no transactional updates', 'It was removed in Android 15'], a: 1, why: 'The first read is synchronous disk I/O, and even <code>apply()</code> can stall when an activity stops. DataStore uses coroutines and atomic edits.' },
          { q: 'A photo the user took in your app should show up in Gallery. Where do you save it?', options: ['<code>filesDir</code>', 'MediaStore', 'Room as a BLOB'], a: 1, why: 'Only shared storage through MediaStore is visible to other apps, and it stays after your app is uninstalled.' },
        ],
        visual(el) {
          const Q = [
            { id: 'blob', text: 'Is it a blob, like an image, PDF or download?' },
            { id: 'shared', text: 'Should Gallery or other apps see it, even after uninstall?' },
            { id: 'query', text: 'Do you search, sort, page or join many records?' },
            { id: 'typed', text: 'Is it one small object with typed, nested fields?' },
          ];
          const BINS = [
            { id: 'prefs', title: 'Preferences DataStore', sub: 'a few keys and values' },
            { id: 'typed', title: 'Typed DataStore', sub: 'one small @Serializable object' },
            { id: 'room', title: 'Room', sub: 'tables, queries, relations' },
            { id: 'files', title: 'App-specific files', sub: 'filesDir, cacheDir' },
            { id: 'media', title: 'MediaStore', sub: 'shared Pictures, Music, Download' },
            { id: 'legacy', title: 'SharedPreferences', sub: 'legacy: migrate away' },
          ];
          const ITEMS = [
            { label: 'Dark mode on/off', a: { blob: 0, query: 0, typed: 0 }, bin: 'prefs', note: 'context.dataStore.edit { it[DARK_MODE] = true }' },
            { label: '5,000 articles you search', a: { blob: 0, query: 1 }, bin: 'room', note: '@Query("SELECT * FROM articles WHERE title LIKE :pattern")' },
            { label: 'Onboarding progress object', a: { blob: 0, query: 0, typed: 1 }, bin: 'typed', note: 'onboardingStore.updateData { it.copy(step = 3) }' },
            { label: 'PDF saved for offline reading', a: { blob: 1, shared: 0 }, bin: 'files', note: 'File(context.filesDir, "issue-42.pdf")' },
            { label: 'Photo taken in your camera screen', a: { blob: 1, shared: 1 }, bin: 'media', note: 'contentResolver.insert(imagesUri, values)' },
            { label: 'Settings an old version kept in SharedPreferences', a: { blob: 0, query: 0, typed: 0 }, bin: 'prefs', legacy: true, note: 'preferencesDataStore("settings", produceMigrations = { listOf(SharedPreferencesMigration(it, "settings")) })' },
          ];
          const rows = {};
          const qs = h('div', { class: 'dt-qs' }, Q.map(q => {
            const ans = h('span', { class: 'dt-pill' }, '?');
            const e = h('div', { class: 'dt-q' }, h('span', {}, q.text), ans);
            rows[q.id] = { el: e, ans };
            return e;
          }));
          const bins = {};
          const binBox = h('div', { class: 'dt-bins' }, BINS.map(b => (bins[b.id] = h('div', { class: 'dt-bin' + (b.id === 'legacy' ? ' dt-legacy' : '') }, h('b', {}, b.title), h('small', {}, b.sub)))));
          const o = out();
          let busy = false;
          const pathOf = it => (it.a.blob ? ['blob', 'shared'] : it.a.query ? ['blob', 'query'] : ['blob', 'query', 'typed']);
          const clear = () => {
            Object.values(bins).forEach(b => b.classList.remove('dt-on', 'dt-from'));
            Object.values(rows).forEach(r => { r.el.className = 'dt-q'; r.ans.className = 'dt-pill'; r.ans.textContent = '?'; });
          };
          const answer = (id, yes) => { const r = rows[id]; r.el.classList.remove('dt-ask'); r.ans.textContent = yes ? 'yes' : 'no'; r.ans.className = 'dt-pill ' + (yes ? 'dt-ok' : 'dt-bad'); };
          const land = it => {
            const path = pathOf(it);
            Q.filter(q => !path.includes(q.id)).forEach(q => rows[q.id].el.classList.add('dt-skip'));
            bins[it.bin].classList.add('dt-on'); replay(bins[it.bin], 'pop');
            if (it.legacy) { bins.legacy.classList.add('dt-from'); replay(bins.legacy, 'shake'); }
            say(o, `<span class="good">${BINS.find(b => b.id === it.bin).title}:</span> ${hl(it.note)}`);
          };
          async function run(it, btn) {
            if (busy) return; busy = true;
            press(btns, btn); clear();
            say(o, `Where should <b>${it.label}</b> live?`);
            for (const id of pathOf(it)) {
              rows[id].el.classList.add('dt-ask'); replay(rows[id].el, 'pop-soft');
              await sleep(520); if (!o.isConnected) return;
              answer(id, !!it.a[id]); replay(rows[id].ans, 'pop');
              await sleep(260); if (!o.isConnected) return;
            }
            land(it);
            busy = false;
          }
          const btns = ITEMS.map(it => act(it.label, function () { run(it, this); }));
          // open on a finished answer so the board is never blank
          press(btns, btns[1]);
          pathOf(ITEMS[1]).forEach(id => answer(id, !!ITEMS[1].a[id]));
          land(ITEMS[1]);
          el.append(h('div', { class: 'controls' }, btns), qs, binBox, o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'datastore',
        title: 'DataStore',
        tagline: 'Settings as a Flow, changed in safe transactions.',
        level: 'intermediate',
        body: `
<p>DataStore stores a small amount of data in one file. You read it through <code>data</code>, a <code>Flow</code> that emits the whole snapshot now and again after every change. You never read it synchronously, so the main thread never waits on disk.</p>
<p>You write with <code>edit { }</code> (Preferences DataStore) or <code>updateData { }</code> (typed DataStore). Each call is a transaction. DataStore reads the current value, runs your block, writes a temp file and renames it into place. Edits run one at a time, so two concurrent increments both count.</p>
<p>Preferences DataStore uses typed keys like <code>intPreferencesKey("font_size")</code>. Typed DataStore stores your own class through a <code>Serializer</code>, for example with kotlinx.serialization JSON or Protocol Buffers. Create one DataStore per file and keep it as a singleton. Two instances on the same file throw.</p>`,
        code: `// Preferences DataStore: one instance per file, declared once at the top level
val Context.dataStore by preferencesDataStore(name = "settings")

object Keys {
    val THEME = stringPreferencesKey("theme")
    val FONT_SIZE = intPreferencesKey("font_size")
}

class SettingsRepository(private val store: DataStore<Preferences>) {
    val theme: Flow<String> = store.data
        .catch { e -> if (e is IOException) emit(emptyPreferences()) else throw e }
        .map { it[Keys.THEME] ?: "system" }
        .distinctUntilChanged()

    // read and write in one transaction, so no update is lost
    suspend fun bumpFont() = store.edit { prefs ->
        prefs[Keys.FONT_SIZE] = (prefs[Keys.FONT_SIZE] ?: 16) + 1
    }
}

// Typed DataStore: your own class plus a Serializer
@Serializable
data class UserSettings(val theme: String = "system", val fontSize: Int = 16)

object UserSettingsSerializer : Serializer<UserSettings> {
    override val defaultValue = UserSettings()

    override suspend fun readFrom(input: InputStream): UserSettings =
        try {
            Json.decodeFromString(input.readBytes().decodeToString())
        } catch (e: SerializationException) {
            throw CorruptionException("Cannot read settings", e)
        }

    override suspend fun writeTo(t: UserSettings, output: OutputStream) =
        output.write(Json.encodeToString(t).encodeToByteArray())
}

val Context.settingsStore by dataStore("user_settings.json", UserSettingsSerializer)

suspend fun goDark(store: DataStore<UserSettings>) = store.updateData { it.copy(theme = "dark") }`,
        remember: 'Read DataStore as a Flow, write it in edit { }. One instance per file.',
        terms: [
          { term: 'Preferences DataStore', def: 'A DataStore that stores key-value pairs addressed by typed keys such as intPreferencesKey.' },
          { term: 'Typed DataStore', def: 'A DataStore that stores one object of your own type, turned into bytes by a Serializer you provide.' },
          { term: 'DataStore.edit', def: 'A suspend function that reads the current preferences, applies your changes and writes them atomically.' },
          { term: 'CorruptionException', def: 'The exception a DataStore Serializer throws when the file cannot be decoded, so a corruption handler can replace it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare the key and bump it inside a transaction.', code: 'val FONT_SIZE = [[intPreferencesKey]]("font_size")\n\nsuspend fun bump(store: DataStore<Preferences>) {\n    store.[[edit]] { prefs ->\n        prefs[FONT_SIZE] = (prefs[FONT_SIZE] ?: 16) + 1\n    }\n}', why: 'Keys are typed, so <code>prefs[FONT_SIZE]</code> is an <code>Int?</code>. <code>edit</code> runs the read and the write as one atomic step.' },
          { type: 'bug', prompt: 'The app sometimes freezes on launch for a moment. Tap the line.', code: 'class MainActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        val theme = runBlocking { dataStore.data.first()[THEME] }\n        setContent {\n            AppTheme(theme) { App() }\n        }\n    }\n}', bug: 3, fix: '        // expose theme as a StateFlow in a ViewModel and use collectAsStateWithLifecycle() inside setContent', why: '<code>runBlocking</code> on the main thread waits for disk I/O and can drop frames or cause an ANR. Collect the Flow instead and show a default until the first value arrives.' },
        ],
        quiz: [
          { q: 'Two coroutines call <code>edit { it[COUNT] = (it[COUNT] ?: 0) + 1 }</code> at the same time, starting from 5. What is stored?', options: ['6, one update is lost', '7', 'It throws a concurrent modification error'], a: 1, why: 'DataStore runs edits one after another. The second edit reads the result of the first.' },
          { q: 'How do you read a DataStore value?', options: ['A synchronous <code>get()</code>', 'Collect the <code>data</code> Flow', 'Query it with SQL'], a: 1, why: '<code>data</code> emits the current snapshot and every later change. There is no synchronous getter.' },
          { q: 'Two classes each build their own DataStore for <code>settings.preferences_pb</code>. What happens?', options: ['They share the file safely', 'DataStore throws because more than one DataStore is active for the same file', 'The last writer wins silently'], a: 1, why: 'DataStore needs to be the only owner of its file. Declare it once with the top-level delegate or a DI singleton.' },
        ],
        visual(el) {
          const st = { theme: 'dark', font: 16 };
          let typed = false, emissions = 1, running = false, blocking = false;
          const queue = [];
          const file = h('div', { class: 'dt-file' });
          const txs = h('div', { class: 'dt-queue' });
          const uiText = h('p', { class: 'dt-ui-text' }, 'Derby tonight: kickoff at 20:00');
          const uiMeta = h('span', { class: 'dt-sub' });
          const ui = h('div', { class: 'dt-ui' }, h('span', { class: 'dt-label' }, 'UI collecting data'), uiText, uiMeta);
          const track = h('div', { class: 'lane-track' });
          const o = out();
          const paintFile = changed => {
            const mark = (k, v) => (k === changed ? `<span class="dt-hit">${v}</span>` : v);
            file.innerHTML = typed
              ? `<span class="dt-fname">files/datastore/user_settings.json</span>\n{ "theme": ${mark('theme', `"${st.theme}"`)}, "fontSize": ${mark('font', st.font)} }`
              : `<span class="dt-fname">files/datastore/settings.preferences_pb</span>\ntheme     = ${mark('theme', `"${st.theme}"`)}\nfont_size = ${mark('font', st.font)}`;
          };
          const paintUi = () => {
            ui.classList.toggle('dt-dark', st.theme === 'dark');
            uiText.style.fontSize = Math.min(st.font, 26) + 'px';
            uiMeta.textContent = `theme = ${st.theme} · fontSize = ${st.font} · emission #${emissions}`;
          };
          const frames = () => {
            track.replaceChildren(...Array.from({ length: 12 }, (_, i) => h('div', { class: 'bar dt-frame', style: `left:${i * 8.3 + 1}%;width:3%` })));
          };
          const labels = () => {
            const next = st.theme === 'dark' ? 'light' : 'dark';
            themeBtn.innerHTML = hl(typed ? `updateData { it.copy(theme = "${next}") }` : `edit { it[THEME] = "${next}" }`);
            fontBtn.innerHTML = hl(typed ? '2x launch { updateData { it.copy(fontSize = it.fontSize + 1) } }' : '2x launch { edit { it[FONT] = (it[FONT] ?: 16) + 1 } }');
          };
          async function drain() {
            if (running) return; running = true;
            while (queue.length) {
              const tx = queue[0];
              tx.chip.classList.add('dt-run'); replay(tx.chip, 'pop');
              line(o, `<span class="muted">${tx.name}:</span> read file, ${tx.key === 'font' ? 'fontSize' : 'theme'} = ${tx.key === 'font' ? st.font : `"${st.theme}"`}`);
              await sleep(420); if (!o.isConnected) return;
              tx.apply();
              line(o, `<span class="muted">${tx.name}:</span> block sets ${tx.key === 'font' ? `fontSize = ${st.font}` : `theme = "${st.theme}"`}`);
              await sleep(380); if (!o.isConnected) return;
              paintFile(tx.key); replay(file, 'pop-soft');
              line(o, `<span class="muted">${tx.name}:</span> write temp file, rename over the old one`);
              await sleep(380); if (!o.isConnected) return;
              emissions++; paintUi(); replay(ui, 'pop');
              line(o, `<span class="good">data emits</span> the new snapshot`);
              tx.chip.classList.remove('dt-run'); tx.chip.classList.add('dt-done');
              queue.shift();
              await sleep(260); if (!o.isConnected) return;
            }
            running = false;
            paintFile(); labels();
            await sleep(900); if (!o.isConnected || running) return;
            txs.replaceChildren();
          }
          let n = 0;
          const enqueue = (key, apply) => {
            const name = `edit #${++n}`;
            const chip = h('span', { class: 'dt-tx drop-in' }, name);
            txs.append(chip); queue.push({ name, key, apply, chip });
          };
          const themeBtn = cmd('', () => {
            if (queue.length >= 3) { replay(txs, 'shake'); return; }
            if (!running) say(o, 'One edit is one transaction:');
            enqueue('theme', () => { st.theme = st.theme === 'dark' ? 'light' : 'dark'; });
            drain();
          });
          const fontBtn = cmd('', () => {
            if (queue.length >= 3) { replay(txs, 'shake'); return; }
            if (!running) say(o, `Two coroutines edit at once. Start: fontSize = ${st.font}. They run one after the other:`);
            enqueue('font', () => { st.font += 1; });
            enqueue('font', () => { st.font += 1; });
            drain();
          });
          const blockBtn = cmd('runBlocking { dataStore.data.first() }', async () => {
            if (blocking) return; blocking = true;
            frames();
            const bar = h('div', { class: 'bar block', style: 'left:18%;width:0' });
            track.append(bar);
            say(o, '<span class="muted">main thread waits for disk...</span>');
            await sleep(40); if (!o.isConnected) return;
            bar.classList.add('dt-grow'); bar.style.width = '55%';
            await sleep(950); if (!o.isConnected) return;
            track.querySelectorAll('.dt-frame').forEach((f, i) => { if (i >= 2 && i <= 8) f.classList.add('dt-lost'); });
            say(o, '<span class="bad">Choreographer:</span> Skipped 34 frames! The application may be doing too much work on its main thread.');
            line(o, '<span class="muted">// fix: collect data in a ViewModel and show a default until it emits</span>');
            replay(ui, 'shake');
            blocking = false;
          });
          const typedSw = toggle('dt-ds-typed', 'typed DataStore (JSON Serializer)', () => {
            if (running) { typedSw.input.checked = typed; replay(txs, 'shake'); return; }
            typed = typedSw.input.checked;
            paintFile(); labels(); replay(file, 'flip');
            say(o, typed ? 'Same data, now one <code>UserSettings</code> object. You change it with <code>updateData { it.copy(...) }</code>.' : 'Back to key-value pairs with typed keys.');
          });
          frames(); paintFile(); paintUi(); labels();
          say(o, 'The UI is collecting <code>dataStore.data</code>. Change a value and watch the transaction.');
          el.append(
            h('div', { class: 'dt-grid' },
              h('div', { class: 'dt-card' }, h('span', { class: 'dt-label' }, 'On disk'), file, h('span', { class: 'dt-label' }, 'Edits, one at a time'), txs),
              ui),
            h('div', { class: 'timeline' }, h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'main thread'), track)),
            h('div', { class: 'controls' }, themeBtn, fontBtn, blockBtn, typedSw),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'relations',
        title: 'Room relations',
        tagline: 'Tables stay flat. Your objects come back nested.',
        level: 'intermediate',
        body: `
<p>SQL tables are flat, but your screens want an author with their books, or a book with its tags. Room builds those nested objects for you. You write a plain data class that is not an entity, put the parent in it with <code>@Embedded</code>, and describe the children with <code>@Relation</code>.</p>
<p>One-to-many needs a foreign key column on the child, like <code>authorId</code> on <code>Book</code>. Many-to-many needs a third table, a cross-reference with one row per pair, and <code>associateBy = Junction(...)</code> on the relation.</p>
<p>Room loads a relation with more than one query: the parents first, then the children <code>WHERE id IN (...)</code>. Mark the DAO function <code>@Transaction</code> so all queries read the same snapshot. Run the queries below and watch the rows turn into objects.</p>`,
        code: `@Entity(tableName = "authors")
data class Author(@PrimaryKey val authorId: Long, val name: String)

@Entity(
    tableName = "books",
    foreignKeys = [
        ForeignKey(
            entity = Author::class,
            parentColumns = ["authorId"],
            childColumns = ["authorId"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
    indices = [Index("authorId")],
)
data class Book(@PrimaryKey val bookId: Long, val authorId: Long, val title: String)

@Entity(tableName = "tags")
data class Tag(@PrimaryKey val tagId: Long, val label: String)

@Entity(tableName = "book_tag", primaryKeys = ["bookId", "tagId"], indices = [Index("tagId")])
data class BookTagCrossRef(val bookId: Long, val tagId: Long)

// one-to-many
data class AuthorWithBooks(
    @Embedded val author: Author,
    @Relation(parentColumn = "authorId", entityColumn = "authorId")
    val books: List<Book>,
)

// many-to-many through the cross-ref table
data class BookWithTags(
    @Embedded val book: Book,
    @Relation(
        parentColumn = "bookId",
        entityColumn = "tagId",
        associateBy = Junction(BookTagCrossRef::class),
    )
    val tags: List<Tag>,
)

@Dao
interface LibraryDao {
    @Transaction
    @Query("SELECT * FROM authors")
    fun observeAuthorsWithBooks(): Flow<List<AuthorWithBooks>>

    @Transaction
    @Query("SELECT * FROM books")
    fun observeBooksWithTags(): Flow<List<BookWithTags>>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun tag(ref: BookTagCrossRef)
}`,
        remember: '@Embedded the parent, @Relation the children, a Junction for many-to-many, @Transaction on the query.',
        terms: [
          { term: '@Relation', def: 'A Room annotation on a field of a result class that loads related entities by matching a parent column to an entity column.' },
          { term: '@Embedded', def: 'A Room annotation that flattens the fields of another class into the same row or result object.' },
          { term: 'Junction', def: 'The cross-reference table a many-to-many @Relation goes through, given as associateBy = Junction(...).' },
          { term: '@Transaction', def: 'A Room annotation that runs every query of a DAO function inside one database transaction.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Return each author with their books.', code: 'data class AuthorWithBooks(\n    @[[Embedded]] val author: Author,\n    @[[Relation]](parentColumn = "authorId", entityColumn = "authorId")\n    val books: List<Book>,\n)', why: '<code>@Embedded</code> puts the author columns in the object. <code>@Relation</code> loads every book whose <code>authorId</code> matches.' },
          { type: 'bug', prompt: 'This many-to-many relation does not compile. Tap the line.', code: 'data class BookWithTags(\n    @Embedded val book: Book,\n    @Relation(\n        parentColumn = "bookId",\n        entityColumn = "bookId",\n        associateBy = Junction(BookTagCrossRef::class),\n    )\n    val tags: List<Tag>,\n)', bug: 4, fix: '        entityColumn = "tagId",', why: '<code>entityColumn</code> names the key on the entity you collect, here <code>Tag</code>. <code>Tag</code> has no <code>bookId</code> column, so Room reports an error at build time.' },
        ],
        quiz: [
          { q: 'Why mark a DAO function that returns <code>AuthorWithBooks</code> with <code>@Transaction</code>?', options: ['Room needs it to write rows', 'Room runs several queries for it, and the transaction keeps them on one consistent snapshot', 'It makes the query run on the main thread'], a: 1, why: 'Parents and children come from separate queries. Without a transaction a write could land between them.' },
          { q: 'What do you need to model "a book has many tags, a tag has many books"?', options: ['A list column on <code>Book</code>', 'A cross-reference entity with one row per (bookId, tagId) pair', 'Two <code>@Embedded</code> fields'], a: 1, why: 'Many-to-many needs a junction table. The relation uses <code>associateBy = Junction(BookTagCrossRef::class)</code>.' },
          { q: 'Is <code>AuthorWithBooks</code> an <code>@Entity</code>?', options: ['Yes, Room creates a table for it', 'No, it is a result class Room fills from existing tables'], a: 1, why: 'Relation classes are read models. The data stays in the flat <code>authors</code> and <code>books</code> tables.' },
        ],
        visual(el) {
          const authors = [[1, 'Le Guin'], [2, 'Herbert']];
          const books = [[10, 1, 'Earthsea'], [11, 1, 'The Dispossessed'], [12, 2, 'Dune']];
          const tags = [[1, 'fantasy'], [2, 'sci-fi'], [3, 'classic']];
          let refs = [[10, 1], [10, 3], [11, 2], [12, 2]];
          const C2 = '2.2em minmax(0, 1fr)', C3 = '2.2em 2.6em minmax(0, 1fr)';
          function mkTable(name, heads, cols) {
            const body = h('div');
            const rows = new Map();
            const el2 = h('div', { class: 'dt-table' }, h('div', { class: 'dt-tname' }, name),
              h('div', { class: 'dt-tr dt-th', style: `--dt-cols:${cols}` }, heads.map(x => h('span', {}, x))), body);
            return {
              el: el2, rows,
              set(list, key = r => r[0]) {
                rows.clear();
                body.replaceChildren(...list.map(r => { const e = h('div', { class: 'dt-tr', style: `--dt-cols:${cols}` }, r.map(c => h('span', {}, String(c)))); rows.set(key(r), e); return e; }));
              },
              hot(keys) { rows.forEach((e, k) => e.classList.toggle('dt-hot', keys.includes(k))); },
            };
          }
          const tA = mkTable('authors', ['id', 'name'], C2);
          const tB = mkTable('books', ['id', 'aut', 'title'], C3);
          const tR = mkTable('book_tag', ['book', 'tag'], 'minmax(0, 1fr) minmax(0, 1fr)');
          const tT = mkTable('tags', ['id', 'label'], C2);
          const refKey = r => r.join('-');
          tA.set(authors); tB.set(books); tT.set(tags); tR.set(refs, refKey);
          const res = h('div', { class: 'dt-results' });
          const o = out();
          let busy = false, last = null;
          const tagsOf = id => refs.filter(r => r[0] === id).map(r => tags.find(t => t[0] === r[1]));
          const coolAll = () => [tA, tB, tR, tT].forEach(t => t.hot([]));
          const card = (name, embedded, rel, kids, fresh) => h('div', { class: 'obj' + (fresh ? ' drop-in' : '') },
            h('span', { class: 'obj-name' }, name),
            h('span', { class: 'field', html: `${hl('@Embedded')} ${embedded}` }),
            h('span', { class: 'field', html: `${hl('@Relation')} ${rel} =` }),
            h('div', { class: 'dt-nest' }, kids.length ? kids.map(k => h('span', { class: 'dt-mini' }, k)) : h('span', { class: 'dt-mini' }, 'empty list')));
          async function authorsWithBooks(fast) {
            const d = fast ? 120 : 1;
            res.replaceChildren(); coolAll();
            say(o, hl('SELECT * FROM authors'));
            tA.hot(authors.map(a => a[0]));
            await sleep(fast ? 150 : 600); if (!o.isConnected) return;
            line(o, hl('SELECT * FROM books WHERE authorId IN (1, 2)'));
            tB.hot(books.map(b => b[0]));
            await sleep(fast ? 150 : 600); if (!o.isConnected) return;
            for (const [id, name] of authors) {
              const mine = books.filter(b => b[1] === id);
              tA.hot([id]); tB.hot(mine.map(b => b[0]));
              res.append(card('AuthorWithBooks', `author = Author(${id}, "${name}")`, 'books', mine.map(b => b[2]), true));
              await sleep(fast ? d : 650); if (!o.isConnected) return;
            }
            coolAll();
            line(o, '<span class="good">emit</span> List&lt;AuthorWithBooks&gt; <span class="muted">// 2 queries, 1 transaction</span>');
          }
          async function booksWithTags(fast, changed) {
            res.replaceChildren(); coolAll();
            say(o, hl('SELECT * FROM books'));
            tB.hot(books.map(b => b[0]));
            await sleep(fast ? 150 : 600); if (!o.isConnected) return;
            line(o, hl('SELECT tags.*, j.bookId FROM book_tag j JOIN tags ON tags.tagId = j.tagId WHERE j.bookId IN (10, 11, 12)'));
            tR.hot(refs.map(refKey)); tT.hot(tags.map(t => t[0]));
            await sleep(fast ? 150 : 600); if (!o.isConnected) return;
            for (const [id, , title] of books) {
              const mine = tagsOf(id);
              tB.hot([id]); tR.hot(refs.filter(r => r[0] === id).map(refKey)); tT.hot(mine.map(t => t[0]));
              const c = card('BookWithTags', `book = Book(${id}, "${title}")`, 'tags', mine.map(t => t[1]), !fast || id === changed);
              res.append(c);
              if (fast && id === changed) replay(c, 'pop');
              await sleep(fast ? 120 : 650); if (!o.isConnected) return;
            }
            coolAll();
            line(o, '<span class="good">emit</span> List&lt;BookWithTags&gt; <span class="muted">// via the book_tag junction</span>');
          }
          const go = (fn, which, btn) => async () => {
            if (busy) return; busy = true; press(qBtns, btn); last = which;
            await fn(false);
            busy = false;
          };
          const b1 = cmd('dao.observeAuthorsWithBooks()', () => go(authorsWithBooks, 'a', b1)());
          const b2 = cmd('dao.observeBooksWithTags()', () => go(booksWithTags, 'b', b2)());
          const qBtns = [b1, b2];
          const b3 = cmd('dao.tag(BookTagCrossRef(12, 3))', async () => {
            if (busy) return; busy = true;
            const has = refs.some(r => r[0] === 12 && r[1] === 3);
            if (has) {
              tR.rows.get('12-3').classList.add('leave');
              await sleep(420); if (!o.isConnected) return;
              refs = refs.filter(r => !(r[0] === 12 && r[1] === 3));
              tR.set(refs, refKey);
            } else {
              refs = [...refs, [12, 3]];
              tR.set(refs, refKey);
              const e = tR.rows.get('12-3'); e.classList.add('dt-new'); replay(e, 'drop-in');
            }
            b3.innerHTML = hl(has ? 'dao.tag(BookTagCrossRef(12, 3))' : 'dao.untag(BookTagCrossRef(12, 3))');
            say(o, `${hl(has ? 'DELETE FROM book_tag WHERE bookId = 12 AND tagId = 3' : 'INSERT OR IGNORE INTO book_tag VALUES (12, 3)')} <span class="muted">// table changed, observers re-run</span>`);
            await sleep(700); if (!o.isConnected) return;
            press(qBtns, b2); last = 'b';
            await booksWithTags(true, 12);
            busy = false;
          });
          el.append(
            h('div', { class: 'dt-tables' }, tA.el, tB.el, tR.el, tT.el),
            h('div', { class: 'controls' }, b1, b2, b3),
            res, o);
          // open with the one-to-many result already built
          press(qBtns, b1); last = 'a';
          for (const [id, name] of authors) res.append(card('AuthorWithBooks', `author = Author(${id}, "${name}")`, 'books', books.filter(b => b[1] === id).map(b => b[2]), false));
          say(o, 'Four flat tables. Run a query to see Room assemble the nested objects.');
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'migrations',
        title: 'Room migrations',
        tagline: 'Change the schema without losing anyone’s data.',
        level: 'advanced',
        body: `
<p>Users keep their database file when they update your app. When you add a column or table, you raise <code>version</code> in <code>@Database</code> and tell Room how to turn the old file into the new shape. That recipe is a migration.</p>
<p>For simple changes like a new column, an <code>AutoMigration(from = 1, to = 2)</code> lets Room write the SQL by comparing exported schema files. For renames or data changes you write a <code>Migration(1, 2)</code> with your own <code>execSQL</code> calls. Export schemas (the Room Gradle plugin's <code>schemaDirectory</code>) and commit them.</p>
<p>If Room finds no path from the old version, it throws on open, so the app crashes on launch. <code>fallbackToDestructiveMigration</code> with <code>dropAllTables = true</code> avoids the crash by deleting everything, which is fine for a pure cache and a disaster for user data. Pick a strategy below and install the update.</p>`,
        code: `@Database(
    entities = [Article::class],
    version = 3,
    autoMigrations = [AutoMigration(from = 1, to = 2)],   // 1 → 2 added a column: Room writes the SQL
    exportSchema = true,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun articleDao(): ArticleDao
}

// 2 → 3 changes data, not only shape: write it yourself
val MIGRATION_2_3 = object : Migration(2, 3) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE articles ADD COLUMN slug TEXT NOT NULL DEFAULT ''")
        db.execSQL("UPDATE articles SET slug = lower(replace(title, ' ', '-'))")
    }
}

val db = Room.databaseBuilder(context, AppDatabase::class.java, "app.db")
    .addMigrations(MIGRATION_2_3)
    // .fallbackToDestructiveMigration(dropAllTables = true)  // only when the data is a throwaway cache
    .build()

// build.gradle.kts: export schemas so AutoMigration can diff them, and test with MigrationTestHelper
room { schemaDirectory("$projectDir/schemas") }`,
        remember: 'Changed the schema? Bump the version and ship a migration. No path means a crash on launch.',
        terms: [
          { term: 'Migration', def: 'A Room class that upgrades a database file from one version number to another with SQL you write.' },
          { term: 'AutoMigration', def: 'A migration Room generates at build time by comparing two exported schema JSON files.' },
          { term: 'Destructive migration', def: 'A fallback that drops and recreates the tables when no migration path exists, deleting all rows.' },
          { term: 'Schema export', def: 'JSON files Room writes for each database version, used by AutoMigration and migration tests.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add a <code>read</code> column without losing rows.', code: 'val MIGRATION_1_2 = object : [[Migration]](1, 2) {\n    override fun migrate(db: SupportSQLiteDatabase) {\n        db.[[execSQL]]("ALTER TABLE articles ADD COLUMN read INTEGER NOT NULL DEFAULT 0")\n    }\n}', why: 'A <code>Migration</code> takes the start and end versions. Inside, <code>execSQL</code> runs the schema change on the existing file.' },
          { type: 'bug', prompt: '<code>Article</code> just gained a <code>read</code> field and <code>MIGRATION_1_2</code> adds the column. Users who update crash on launch. Tap the line.', code: '@Database(\n    entities = [Article::class],\n    version = 1,\n)\nabstract class AppDatabase : RoomDatabase()\n\nval db = Room.databaseBuilder(context, AppDatabase::class.java, "app.db")\n    .addMigrations(MIGRATION_1_2)\n    .build()', bug: 2, fix: '    version = 2,', why: 'Room only runs migrations when the version goes up. With the schema changed and the version still 1, Room sees a hash mismatch and throws "Room cannot verify the data integrity".' },
        ],
        quiz: [
          { q: 'You ship version 2 of the schema with no migration and no fallback. A user updates. What happens?', options: ['Room adds the column for you', 'The app crashes when it opens the database', 'Room silently deletes the old data'], a: 1, why: 'Room throws <code>IllegalStateException</code>: a migration from 1 to 2 was required but not found.' },
          { q: 'When is <code>fallbackToDestructiveMigration</code> acceptable?', options: ['Always, it is the simplest option', 'When the database is a cache you can refetch from the server', 'Never, it does not compile'], a: 1, why: 'It deletes every row. That is fine for data you can download again, never for notes, drafts or settings.' },
          { q: 'What does <code>AutoMigration</code> need to work?', options: ['Exported schema files for both versions', 'Network access at build time', 'A <code>@Transaction</code> on every DAO'], a: 0, why: 'Room diffs the exported JSON schemas. Without <code>exportSchema</code> and a schema directory there is nothing to compare.' },
        ],
        visual(el) {
          const START = [[1, 'Room 2.8 notes'], [2, 'Paging tips'], [3, 'KSP setup']];
          let rows, cols, ver, crashed, busy = false, strategy = 'none';
          const S = {
            none: { label: 'no migration', code: '@Database(entities = [Article::class], version = 2)\n// nothing describes 1 → 2' },
            manual: { label: 'Migration(1, 2)', code: 'val MIGRATION_1_2 = object : Migration(1, 2) {\n  override fun migrate(db: SupportSQLiteDatabase) =\n    db.execSQL("ALTER TABLE articles ADD COLUMN read INTEGER NOT NULL DEFAULT 0")\n}\n.addMigrations(MIGRATION_1_2)' },
            auto: { label: 'AutoMigration(1, 2)', code: '@Database(\n  entities = [Article::class],\n  version = 2,\n  autoMigrations = [AutoMigration(from = 1, to = 2)],\n)' },
            wipe: { label: 'fallbackToDestructiveMigration', code: '@Database(entities = [Article::class], version = 2)\n.fallbackToDestructiveMigration(dropAllTables = true)' },
            forgot: { label: 'forgot version bump', code: '@Database(entities = [Article::class], version = 1)\n// Article gained `read`, version still 1' },
          };
          const verPill = h('span', { class: 'dt-pill dt-acc' });
          const dbBody = h('div');
          const device = h('div', { class: 'dt-table' }, h('div', { class: 'dt-tname' }, 'articles'), dbBody);
          const kt = h('div', { class: 'kt' });
          const o = out();
          const tpl = () => cols.map(c => (c === 'id' ? '2.2em' : c === 'read' ? '3.2em' : 'minmax(0, 1fr)')).join(' ');
          function paintDb(newCol) {
            verPill.textContent = `version ${ver}`;
            if (crashed) {
              dbBody.replaceChildren(h('div', { class: 'dt-crash drop-in' }, h('div', { class: 'err-icon' }, '!'), h('b', {}, 'News keeps stopping'), h('span', { class: 'dt-sub' }, 'The v1 file is still on disk, untouched.')));
              return;
            }
            const r = (cells, cls) => h('div', { class: 'dt-tr' + (cls || ''), style: `--dt-cols:${tpl()}` }, cells.map((c, i) => h('span', { class: cols[i] === newCol ? 'dt-newcol pop' : null }, String(c))));
            dbBody.replaceChildren(r(cols, ' dt-th'), ...(rows.length ? rows.map(x => r(x)) : [h('div', { class: 'dt-empty' }, 'No rows.')]));
          }
          function reset() {
            rows = START.map(r => [...r]); cols = ['id', 'title']; ver = 1; crashed = false;
            paintDb();
          }
          const pick = (k, btn) => {
            if (busy) return;
            strategy = k; press(sBtns, btn);
            kt.innerHTML = hl(S[k].code); replay(kt, 'pop-soft');
          };
          const sBtns = Object.entries(S).map(([k, s]) => act(s.label, function () { pick(k, this); }));
          async function install() {
            if (busy) return;
            if (ver === 2) { say(o, 'The device is already on version 2. Nothing to migrate. Reset the device to try another strategy.'); replay(device, 'shake'); return; }
            busy = true;
            if (crashed) { crashed = false; paintDb(); }
            const target = strategy === 'forgot' ? 1 : 2;
            say(o, `Room opens app.db: file says version 1, @Database says version ${target}`);
            await sleep(650); if (!o.isConnected) return;
            if (strategy === 'none' || strategy === 'forgot') {
              crashed = true; paintDb(); replay(device, 'shake');
              line(o, strategy === 'none'
                ? '<span class="bad">IllegalStateException:</span> A migration from 1 to 2 was required but not found. Please provide the necessary Migration path via RoomDatabase.Builder.addMigration(...) or allow for destructive migrations.'
                : '<span class="bad">IllegalStateException:</span> Room cannot verify the data integrity. Looks like you\'ve changed schema but forgot to update the version number.');
              busy = false; return;
            }
            if (strategy === 'wipe') {
              line(o, '<span class="muted">no migration found, fallback: DROP TABLE articles; CREATE TABLE articles (...)</span>');
              dbBody.querySelectorAll('.dt-tr:not(.dt-th)').forEach(r => r.classList.add('leave'));
              await sleep(500); if (!o.isConnected) return;
              rows = []; cols = ['id', 'title', 'read']; ver = 2; paintDb('read'); replay(verPill, 'pop');
              line(o, `<span class="bad">All ${START.length} rows deleted.</span> No crash, but the user's data is gone.`);
              busy = false; return;
            }
            line(o, strategy === 'auto'
              ? '<span class="muted">running generated AutoMigration_1_2_Impl (diff of schemas/1.json and 2.json)</span>'
              : '<span class="muted">running MIGRATION_1_2</span>');
            await sleep(550); if (!o.isConnected) return;
            line(o, hl('ALTER TABLE articles ADD COLUMN read INTEGER NOT NULL DEFAULT 0'));
            cols = ['id', 'title', 'read']; rows = rows.map(r => [...r, 0]); paintDb('read');
            await sleep(550); if (!o.isConnected) return;
            ver = 2; paintDb(); replay(verPill, 'pop');
            line(o, `<span class="good">schema matches @Entity, version 2.</span> All ${rows.length} rows kept.`);
            busy = false;
          }
          reset(); pick('manual', sBtns[1]);
          say(o, 'The device has version 1. The new build adds a <code>read</code> column. Pick a strategy and install.');
          el.append(
            h('div', { class: 'dt-grid' },
              h('div', { class: 'dt-card' }, h('div', { class: 'dt-head' }, h('span', { class: 'dt-title' }, 'On the device: app.db'), verPill), device),
              h('div', { class: 'dt-card' }, h('div', { class: 'dt-head' }, h('span', { class: 'dt-title' }, 'New build'), h('span', { class: 'dt-pill' }, 'val read: Boolean = false')), kt)),
            h('div', { class: 'controls' }, sBtns),
            h('div', { class: 'controls' },
              act('install update and open the db', install),
              act('reset device to v1', () => { if (busy) return; reset(); say(o, 'Back to version 1 with 3 rows.'); replay(device, 'pop-soft'); })),
            o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'paging',
        title: 'Paging 3',
        tagline: 'Load a long list one page at a time, as the user scrolls.',
        level: 'intermediate',
        body: `
<p>A feed can have thousands of items. Paging 3 loads them in pages. You write a <code>PagingSource</code> whose <code>load()</code> fetches one page for a key and returns the data plus the keys before and after it. A <code>Pager</code> turns that into a <code>Flow&lt;PagingData&gt;</code>, and <code>cachedIn(viewModelScope)</code> keeps loaded pages across configuration changes.</p>
<p>In Compose, <code>collectAsLazyPagingItems()</code> gives you <code>LazyPagingItems</code>. When the list scrolls within <code>prefetchDistance</code> of the end, Paging asks for the next page. <code>loadState</code> tells you whether refresh, prepend or append is loading, failed or done, so you can show a spinner or a retry row.</p>
<p>Note that <code>initialLoadSize</code> defaults to three times <code>pageSize</code>. With page-number keys, set them equal. For offline-first lists, a <code>RemoteMediator</code> fetches pages from the network into Room, and the Pager reads from Room's own <code>PagingSource</code>.</p>`,
        code: `class ArticlePagingSource(private val api: NewsApi) : PagingSource<Int, Article>() {
    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Article> {
        val page = params.key ?: 1
        return try {
            val items = api.articles(page = page, pageSize = params.loadSize)
            LoadResult.Page(
                data = items,
                prevKey = if (page == 1) null else page - 1,
                nextKey = if (items.isEmpty()) null else page + 1,
            )
        } catch (e: IOException) {
            LoadResult.Error(e)
        }
    }

    override fun getRefreshKey(state: PagingState<Int, Article>): Int? =
        state.anchorPosition?.let { pos ->
            state.closestPageToPosition(pos)?.let { it.prevKey?.plus(1) ?: it.nextKey?.minus(1) }
        }
}

class FeedViewModel(api: NewsApi) : ViewModel() {
    val articles: Flow<PagingData<Article>> = Pager(
        config = PagingConfig(pageSize = 20, initialLoadSize = 20),
        pagingSourceFactory = { ArticlePagingSource(api) },   // a new source on every refresh
        // offline-first: remoteMediator = ArticleRemoteMediator(api, db), source = { db.articleDao().pagingSource() }
    ).flow.cachedIn(viewModelScope)
}

@Composable
fun Feed(vm: FeedViewModel) {
    val items = vm.articles.collectAsLazyPagingItems()
    LazyColumn {
        items(count = items.itemCount, key = items.itemKey { it.id }) { index ->
            items[index]?.let { ArticleRow(it) }
        }
        when (val append = items.loadState.append) {
            is LoadState.Loading -> item { CircularProgressIndicator() }
            is LoadState.Error -> item { RetryRow(append.error, onRetry = items::retry) }
            is LoadState.NotLoading -> Unit
        }
    }
}`,
        remember: 'PagingSource loads one page, Pager makes the Flow, cachedIn keeps it, loadState drives the spinner.',
        terms: [
          { term: 'PagingSource', def: 'A class whose load function returns one page of data plus the keys of the previous and next pages.' },
          { term: 'Pager', def: 'The Paging 3 entry point that combines a PagingConfig and a PagingSource factory into a Flow of PagingData.' },
          { term: 'LazyPagingItems', def: 'The Compose-side handle from collectAsLazyPagingItems that exposes item count, items, loadState, retry and refresh.' },
          { term: 'RemoteMediator', def: 'A Paging component that loads pages from the network into a local database when the database runs out.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep pages across rotation and collect them in Compose.', code: 'val articles = Pager(\n    config = PagingConfig(pageSize = 20),\n    pagingSourceFactory = { ArticlePagingSource(api) },\n).flow.[[cachedIn]](viewModelScope)\n\n// in the composable\nval items = vm.articles.[[collectAsLazyPagingItems]]()', why: '<code>cachedIn</code> shares and caches the loaded pages in the ViewModel scope. <code>collectAsLazyPagingItems</code> hands them to a <code>LazyColumn</code>.' },
          { type: 'bug', prompt: 'Pull-to-refresh crashes with "An instance of PagingSource was re-used". Tap the line.', code: 'class FeedViewModel(api: NewsApi) : ViewModel() {\n    private val source = ArticlePagingSource(api)\n\n    val articles = Pager(\n        config = PagingConfig(pageSize = 20),\n        pagingSourceFactory = { source },\n    ).flow.cachedIn(viewModelScope)\n}', bug: 5, fix: '        pagingSourceFactory = { ArticlePagingSource(api) },', why: 'A PagingSource is single-use. Each refresh invalidates it, so the factory must build a fresh one every time it is called.' },
        ],
        quiz: [
          { q: 'What triggers loading the next page?', options: ['A timer', 'The list scrolling within prefetchDistance of the last loaded item', 'Calling <code>load()</code> from the UI'], a: 1, why: 'Reading items near the end tells Paging the user is getting close, and it calls <code>load</code> with the next key.' },
          { q: 'An append load fails. How does the user try again?', options: ['<code>items.retry()</code>', 'Recreate the Pager', 'Call <code>invalidate()</code> on the Flow'], a: 0, why: '<code>retry()</code> re-runs only the failed load. <code>refresh()</code> would reload from scratch.' },
          { q: 'What does <code>RemoteMediator</code> add?', options: ['Faster JSON parsing', 'Pages fetched from the network land in Room, and the UI pages from Room, so the list works offline', 'Placeholders for missing items'], a: 1, why: 'The database becomes the single source of truth. The mediator fills it when Paging reaches the end of what is stored.' },
        ],
        visual(el) {
          const PAGE = 8, PREFETCH = 4, MAX = 6, ROW = 40;
          const TITLES = ['Derby tonight', 'Compose tips', 'Transfer news', 'Kotlin 2.3 notes', 'Weather alert', 'Market close', 'Paging deep dive', 'Room 2.8'];
          let items = [], pages = 0, refresh = 'idle', append = 'idle', failNext = false, gen = 0;
          const list = h('div', { class: 'dt-feed', tabindex: '0', 'aria-label': 'Paged feed' });
          const foot = h('div', { class: 'dt-foot' });
          const spinTop = h('div', { class: 'dt-refresh' }, h('div', { class: 'spinner dt-spin' }));
          const sRefresh = h('div', { class: 'dt-state' }), sPrepend = h('div', { class: 'dt-state' }), sAppend = h('div', { class: 'dt-state' });
          const pageMap = h('div', { class: 'dt-pages' });
          const o = out();
          const text = s => ({ idle: 'NotLoading', loading: 'Loading', error: 'Error', end: 'NotLoading(end)' }[s]);
          const cls = s => 'dt-state' + ({ loading: ' dt-loading', error: ' dt-err', end: ' dt-end' }[s] || '');
          function paintStates() {
            sRefresh.className = cls(refresh); sRefresh.innerHTML = `<span>refresh</span><span>${text(refresh)}</span>`;
            sPrepend.className = cls('end'); sPrepend.innerHTML = '<span>prepend</span><span>NotLoading(end)</span>';
            sAppend.className = cls(append); sAppend.innerHTML = `<span>append</span><span>${text(append)}</span>`;
            pageMap.replaceChildren(...Array.from({ length: MAX }, (_, i) => {
              const p = i + 1;
              const c = p <= pages ? ' dt-in' : p === pages + 1 && (append === 'loading' || refresh === 'loading') ? ' dt-wait' : p === pages + 1 && (append === 'error' || refresh === 'error') ? ' dt-fail' : '';
              return h('span', { class: 'dt-page' + c }, `p${p}`);
            }));
          }
          function paintFoot() {
            if (append === 'loading' && refresh !== 'loading') foot.replaceChildren(h('div', { class: 'spinner dt-spin' }), h('span', {}, `Loading page ${pages + 1}`));
            else if (append === 'error' || refresh === 'error') foot.replaceChildren(h('span', {}, `Couldn't load page ${pages + 1}.`), cmd('retry()', retry));
            else if (append === 'end') foot.replaceChildren(h('span', {}, `End of list · ${items.length} items`));
            else foot.replaceChildren();
          }
          function paintList() {
            const rows = items.map((t, i) => h('div', { class: 'dt-row' + (Math.floor(i / PAGE) % 2 ? ' dt-odd' : '') }, h('b', {}, `#${i + 1}`), h('span', {}, t)));
            list.replaceChildren(...(refresh === 'loading' ? [spinTop] : []), ...rows, foot);
          }
          const paint = () => { paintStates(); paintFoot(); paintList(); };
          async function load(kind) {
            const my = gen;
            const page = kind === 'refresh' ? 1 : pages + 1;
            if (kind === 'refresh') refresh = 'loading'; else append = 'loading';
            paint();
            line(o, hl(`load(LoadParams.${kind === 'refresh' ? 'Refresh' : 'Append'}(key = ${kind === 'refresh' ? 'null' : page}, loadSize = ${PAGE}))`));
            await sleep(750); if (!o.isConnected || my !== gen) return;
            if (failNext) {
              failNext = false; failSw.input.checked = false;
              if (kind === 'refresh') refresh = 'error'; else append = 'error';
              paint();
              line(o, '<span class="bad">LoadResult.Error</span>(IOException("timeout"))');
              return;
            }
            const fresh = Array.from({ length: PAGE }, (_, i) => TITLES[(page * 3 + i) % TITLES.length]);
            if (kind === 'refresh') { items = fresh; refresh = 'idle'; append = 'idle'; } else { items = items.concat(fresh); append = 'idle'; }
            pages = page;
            if (pages === MAX) append = 'end';
            paint();
            line(o, `<span class="good">LoadResult.Page</span>(${PAGE} items, prevKey = ${page === 1 ? 'null' : page - 1}, nextKey = ${page === MAX ? 'null' : page + 1})`);
            check();
          }
          function check() {
            if (refresh !== 'idle' || append !== 'idle') return;
            const lastVisible = Math.floor((list.scrollTop + list.clientHeight) / ROW);
            if (items.length - lastVisible <= PREFETCH) {
              line(o, `<span class="muted">item #${Math.min(lastVisible, items.length)} visible, ${Math.max(0, items.length - lastVisible)} left ≤ prefetchDistance ${PREFETCH}</span>`);
              load('append');
            }
          }
          function retry() {
            if (append === 'error') { say(o, 'retry() re-runs only the failed load:'); load('append'); }
            else if (refresh === 'error') { say(o, 'retry() re-runs the failed refresh:'); load('refresh'); }
            else { say(o, '<span class="muted">Nothing failed, so retry() does nothing.</span>'); replay(foot, 'shake'); }
          }
          list.addEventListener('scroll', check, { passive: true });
          const failSw = toggle('dt-pg-fail', 'next load fails', () => { failNext = failSw.input.checked; });
          el.append(
            h('div', { class: 'dt-pg' },
              list,
              h('div', { class: 'dt-side' },
                h('span', { class: 'dt-label' }, 'items.loadState'), h('div', { class: 'dt-states' }, sRefresh, sPrepend, sAppend),
                h('span', { class: 'dt-label' }, 'pages in memory'), pageMap,
                h('span', { class: 'tip' }, `PagingConfig(pageSize = ${PAGE}, initialLoadSize = ${PAGE}, prefetchDistance = ${PREFETCH})`))),
            h('div', { class: 'controls' },
              act('scroll down', () => { list.scrollBy({ top: 200, behavior: 'smooth' }); }),
              failSw,
              cmd('retry()', retry),
              cmd('refresh()', () => {
                gen++; list.scrollTop = 0; pages = 0; refresh = 'idle'; append = 'idle';
                say(o, 'refresh(): anchor at the top, getRefreshKey → 1, a new PagingSource');
                load('refresh');
              })),
            o);
          paint();
          say(o, 'Initial load:');
          load('refresh');
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'files',
        title: 'Files and MediaStore',
        tagline: 'Your app’s private files, shared media, and the Photo Picker.',
        level: 'intermediate',
        body: `
<p>App-specific storage is yours alone. <code>filesDir</code> and <code>cacheDir</code> need no permission, other apps cannot read them, and they are deleted when the app is uninstalled. <code>getExternalFilesDir()</code> is also app-specific, just on the larger shared volume.</p>
<p>Scoped storage (Android 10 and later) keeps apps out of each other's files on shared storage. To add a photo, song or download that the user keeps, insert it through MediaStore. Set <code>IS_PENDING</code> while you write, then clear it so Gallery can see the file. Your own MediaStore items need no permission.</p>
<p>To read the user's photos, use the Photo Picker. The system shows the picker, the user chooses, and you get a <code>content://</code> Uri for just that item, with no storage permission at all. Reading another app's file by path fails.</p>`,
        code: `// App-specific: no permission, removed on uninstall
File(context.filesDir, "draft.md").writeText(markdown)

// Shared: add a photo to Pictures/News through MediaStore (no permission on API 29+)
val resolver = context.contentResolver
val collection = MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
val values = ContentValues().apply {
    put(MediaStore.Images.Media.DISPLAY_NAME, "news-card.jpg")
    put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
    put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/News")
    put(MediaStore.Images.Media.IS_PENDING, 1)        // hidden from other apps while writing
}
val uri = resolver.insert(collection, values) ?: return
resolver.openOutputStream(uri)?.use { bitmap.compress(Bitmap.CompressFormat.JPEG, 90, it) }
resolver.update(uri, ContentValues().apply { put(MediaStore.Images.Media.IS_PENDING, 0) }, null, null)

// Reading the user's photos: the Photo Picker, no permission needed
val pickMedia = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
    if (uri != null) viewModel.attach(uri)
}
Button(onClick = {
    pickMedia.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
}) { Text("Attach photo") }`,
        remember: 'Private files in filesDir, shared media through MediaStore, other people’s photos through the Photo Picker.',
        terms: [
          { term: 'App-specific storage', def: 'Directories like filesDir and cacheDir that only your app can access and that are deleted on uninstall.' },
          { term: 'Scoped storage', def: 'The Android 10+ model where each app sees only its own files and its own MediaStore items on shared storage.' },
          { term: 'MediaStore', def: 'The system content provider that indexes shared media such as images, video, audio and downloads.' },
          { term: 'Photo Picker', def: 'A system UI that lets the user choose photos or videos and gives your app a read Uri without storage permissions.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let the user attach one image without asking for a permission.', code: 'val pickMedia = rememberLauncherForActivityResult(\n    ActivityResultContracts.[[PickVisualMedia]]()\n) { uri -> if (uri != null) onPicked(uri) }\n\npickMedia.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.[[ImageOnly]]))', why: '<code>PickVisualMedia</code> opens the system Photo Picker. <code>ImageOnly</code> limits it to images. The result is a Uri you can read right away.' },
          { type: 'bug', prompt: 'The save works, but the photo never appears in Gallery. Tap the line.', code: 'val values = ContentValues().apply {\n    put(MediaStore.Images.Media.DISPLAY_NAME, "card.jpg")\n    put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")\n    put(MediaStore.Images.Media.IS_PENDING, 1)\n}\nval uri = resolver.insert(collection, values) ?: return\nresolver.openOutputStream(uri)?.use { bitmap.compress(Bitmap.CompressFormat.JPEG, 90, it) }\nresolver.update(uri, ContentValues().apply { put(MediaStore.Images.Media.IS_PENDING, 1) }, null, null)', bug: 7, fix: 'resolver.update(uri, ContentValues().apply { put(MediaStore.Images.Media.IS_PENDING, 0) }, null, null)', why: 'While <code>IS_PENDING</code> is 1, only your app sees the item. Set it back to 0 after writing so other apps can see it.' },
        ],
        quiz: [
          { q: 'What happens to files in <code>filesDir</code> when the user uninstalls your app?', options: ['They move to Download', 'They are deleted', 'They stay until the user clears them'], a: 1, why: 'App-specific storage belongs to the app and goes with it. Use MediaStore for anything the user should keep.' },
          { q: 'Your app needs one photo from the user\'s gallery. What is the simplest correct approach?', options: ['Request <code>READ_MEDIA_IMAGES</code> and scan the folder', 'Launch the Photo Picker with <code>PickVisualMedia</code>', 'Read <code>/sdcard/DCIM</code> by path'], a: 1, why: 'The picker needs no permission and the user chooses exactly what to share.' },
          { q: 'Why set <code>IS_PENDING = 1</code> before writing a MediaStore item?', options: ['It compresses the file', 'Other apps cannot see a half-written file', 'It makes the file private forever'], a: 1, why: 'Gallery and others skip pending items. Clear the flag when the bytes are complete.' },
        ],
        visual(el) {
          let busy = false;
          const mkZone = (title, path, note) => {
            const files = h('div', { class: 'dt-files' });
            const e = h('div', { class: 'dt-zone' }, h('div', { class: 'dt-head' }, h('span', { class: 'dt-title' }, title), h('span', { class: 'dt-pill' + (note === 'shared' ? ' dt-warn' : '') }, note)), h('span', { class: 'dt-path' }, path), files);
            return { el: e, files };
          };
          const zin = mkZone('filesDir', '/data/data/com.example.news/files', 'only your app');
          const zext = mkZone('getExternalFilesDir()', 'Android/data/com.example.news/files', 'only your app');
          const zpic = mkZone('Pictures (MediaStore)', 'Pictures/ and DCIM/', 'shared');
          const sheetSlot = h('div');
          const o = out();
          const file = (zone, name, extra = '') => { const f = h('span', { class: 'dt-fileic drop-in' + extra }, name); zone.files.append(f); return f; };
          const glow = z => { [zin, zext, zpic].forEach(x => x.el.classList.toggle('dt-on', x === z)); };
          const has = (z, name) => [...z.files.children].some(c => c.textContent === name);
          function init() {
            [zin, zext, zpic].forEach(z => z.files.replaceChildren());
            file(zin, 'datastore/settings.preferences_pb');
            file(zpic, 'DCIM/Camera/IMG_2041.jpg'); file(zpic, 'DCIM/Camera/IMG_2042.jpg');
            sheetSlot.replaceChildren(); glow(null);
          }
          const writeFile = cmd('File(filesDir, "draft.md").writeText(md)', () => {
            if (busy) return;
            glow(zin);
            if (has(zin, 'draft.md')) { say(o, 'draft.md is already there. writeText() overwrites it in place.'); replay(zin.el, 'pop-soft'); return; }
            file(zin, 'draft.md', ' dt-ours');
            say(o, '<span class="good">ok:</span> no permission needed. Other apps cannot read it. Deleted on uninstall.');
          });
          const writeExt = cmd('File(getExternalFilesDir(DIRECTORY_PICTURES), "thumb.jpg")', () => {
            if (busy) return;
            glow(zext);
            if (has(zext, 'Pictures/thumb.jpg')) { say(o, 'thumb.jpg already exists here.'); replay(zext.el, 'pop-soft'); return; }
            file(zext, 'Pictures/thumb.jpg', ' dt-ours');
            say(o, '<span class="good">ok:</span> still app-specific, just on the big volume. Gallery does not index it.');
          });
          const insert = cmd('resolver.insert(images, values)', async () => {
            if (busy) return;
            glow(zpic);
            if (has(zpic, 'Pictures/News/news-card.jpg')) { say(o, 'news-card.jpg is already in MediaStore.'); replay(zpic.el, 'pop-soft'); return; }
            busy = true;
            const f = file(zpic, 'Pictures/News/news-card.jpg', ' dt-ours dt-pending');
            say(o, `insert → ${hl('content://media/external_primary/images/media/1000000057')} <span class="muted">IS_PENDING = 1, hidden from others</span>`);
            await sleep(700); if (!o.isConnected) return;
            line(o, '<span class="muted">openOutputStream(uri): writing 182 KB...</span>');
            await sleep(700); if (!o.isConnected) return;
            f.classList.remove('dt-pending'); replay(f, 'pop');
            line(o, '<span class="good">update IS_PENDING = 0:</span> Gallery shows it now. No permission was needed.');
            busy = false;
          });
          const readPath = cmd('File("/sdcard/DCIM/Camera/IMG_2041.jpg").readBytes()', () => {
            if (busy) return;
            glow(zpic); replay(zpic.el, 'shake');
            say(o, '<span class="bad">FileNotFoundException:</span> /sdcard/DCIM/Camera/IMG_2041.jpg: open failed: EACCES (Permission denied) <span class="muted">// scoped storage: not your file</span>');
          });
          const picker = cmd('pickMedia.launch(PickVisualMediaRequest(ImageOnly))', () => {
            if (busy) return; busy = true;
            glow(zpic);
            const photos = [...zpic.files.children].map(c => c.textContent).filter(n => /\.jpg$/.test(n));
            const sheet = h('div', { class: 'dt-sheet drop-in', role: 'dialog', 'aria-label': 'Photo picker' },
              h('div', { class: 'dt-head' }, h('b', {}, 'Photo Picker (system UI)'), h('span', { class: 'dt-pill dt-ok' }, 'no permission')),
              h('div', { class: 'dt-thumbs' }, photos.map((n, i) => h('button', { class: 'dt-thumb', 'aria-label': `Pick ${n}`, onclick: () => choose(n, 1000000041 + i, sheet) }, n.split('/').pop()))),
              h('span', { class: 'dt-sub' }, 'Tap a photo. Your app sees only what the user picks.'));
            sheetSlot.replaceChildren(sheet);
            say(o, 'The system shows the picker. Your app cannot see this grid.');
          });
          async function choose(name, id, sheet) {
            sheet.classList.add('leave');
            await sleep(420); if (!o.isConnected) return;
            sheetSlot.replaceChildren();
            say(o, `<span class="good">uri =</span> ${hl(`content://media/picker/0/com.android.providers.media.photopicker/media/${id}`)} <span class="muted">// read access to ${name.split('/').pop()} only</span>`);
            busy = false;
          }
          const uninstall = act('uninstall the app', async () => {
            if (busy) return; busy = true; glow(null);
            const mine = [...zin.files.children, ...zext.files.children];
            mine.forEach(f => f.classList.add('leave'));
            say(o, 'Uninstalling com.example.news...');
            await sleep(450); if (!o.isConnected) return;
            zin.files.replaceChildren(); zext.files.replaceChildren();
            const card = [...zpic.files.children].find(c => c.textContent === 'Pictures/News/news-card.jpg');
            if (card) { card.classList.remove('dt-ours'); card.classList.add('dt-orphan'); replay(card, 'pop'); }
            line(o, card ? 'App-specific files are gone. <span class="good">news-card.jpg stays in Pictures:</span> MediaStore items belong to the user.' : 'App-specific files are gone. Nothing of yours was in shared storage.');
            busy = false;
          });
          init();
          say(o, 'Three places. Write to each, try to read someone else\'s photo, then uninstall.');
          el.append(
            h('div', { class: 'dt-zones' }, zin.el, zext.el, zpic.el),
            sheetSlot,
            h('div', { class: 'controls' }, writeFile, writeExt, insert, readPath, picker, uninstall),
            o);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'caching',
        title: 'Caching strategies',
        tagline: 'Show something now, fetch something fresh, and know when to skip the network.',
        level: 'advanced',
        body: `
<p>A cache answers two questions: what do I show right now, and when do I ask the network? Network-only shows a spinner until the server answers and an error when offline. Cache-then-network shows the stored copy at once, always fetches, and swaps in the fresh data when it arrives.</p>
<p>A time to live (TTL) adds a rule: while the cache is younger than, say, 10 minutes, skip the network. Stale-while-revalidate says what happens after that: keep showing the old copy and refresh in the background, instead of blocking the screen. With Room as the source of truth, the UI just observes the table and the refresh writes into it.</p>
<p>OkHttp can also cache whole HTTP responses. Give the client a <code>Cache</code> and it follows the server's <code>Cache-Control</code> headers. Within <code>max-age</code> it skips the network. After that it sends <code>If-None-Match</code>, and a <code>304 Not Modified</code> reply costs only headers.</p>`,
        code: `class ArticleRepository(
    private val dao: ArticleDao,
    private val api: NewsApi,
    private val now: () -> Long = System::currentTimeMillis,
) {
    // The UI always reads the cache, so stale rows show up at once.
    val articles: Flow<List<Article>> = dao.observeAll().map { rows -> rows.map { it.toModel() } }

    // TTL plus stale-while-revalidate: skip the network while the cache is young.
    suspend fun refreshIfStale(ttl: Duration = 10.minutes): Result<Unit> {
        val fetchedAt = dao.oldestFetchedAt() ?: 0L
        if (now() - fetchedAt < ttl.inWholeMilliseconds) return Result.success(Unit)
        return try {
            val fresh = api.latest()
            dao.replaceAll(fresh.map { it.toEntity(fetchedAt = now()) })   // one @Transaction
            Result.success(Unit)
        } catch (e: IOException) {
            Result.failure(e)   // the stale rows stay on screen; show a small offline banner
        }
    }
}

// HTTP-level cache: OkHttp follows Cache-Control and revalidates with ETags for you
val client = OkHttpClient.Builder()
    .cache(Cache(File(context.cacheDir, "http"), 20L * 1024 * 1024))
    .build()`,
        remember: 'Show the cache now, refresh when the TTL runs out, and never wipe good data because the network failed.',
        terms: [
          { term: 'Cache-then-network', def: 'A strategy that shows cached data immediately, always fetches from the network, and replaces the data when the response arrives.' },
          { term: 'Stale-while-revalidate', def: 'Serving an expired cached copy right away while a background request fetches a fresh one.' },
          { term: 'TTL', def: 'Time to live: how long cached data counts as fresh before the app asks the network again.' },
          { term: 'HTTP cache', def: 'OkHttp’s on-disk response cache that follows Cache-Control and ETag headers to skip or shrink requests.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give OkHttp a 20 MB disk cache in the right directory.', code: 'val client = OkHttpClient.Builder()\n    .[[cache]](Cache(File(context.[[cacheDir]], "http"), 20L * 1024 * 1024))\n    .build()', why: 'The HTTP cache is throwaway data, so it belongs in <code>cacheDir</code>, which the system may clear when space runs low.' },
          { type: 'bug', prompt: 'The app hits the network on every open but never refreshes old data. Tap the line.', code: 'suspend fun refreshIfStale(ttl: Duration = 10.minutes) {\n    val fetchedAt = dao.oldestFetchedAt() ?: 0L\n    val age = System.currentTimeMillis() - fetchedAt\n    if (age > ttl.inWholeMilliseconds) return\n    val fresh = api.latest()\n    dao.replaceAll(fresh.map { it.toEntity(fetchedAt = System.currentTimeMillis()) })\n}', bug: 3, fix: '    if (age < ttl.inWholeMilliseconds) return   // still fresh, skip the network', why: 'The early return should fire while the cache is young. With <code>&gt;</code> it skips exactly the stale case and fetches when the data is fresh.' },
        ],
        quiz: [
          { q: 'Cache-then-network, the device is offline, the cache has yesterday\'s articles. What does the user see?', options: ['A spinner forever', 'Yesterday\'s articles, plus an offline notice', 'An empty list'], a: 1, why: 'The cache shows at once. The failed fetch only adds a notice; it must not clear the stored rows.' },
          { q: 'The TTL is 10 minutes and the cache is 2 minutes old. What does a TTL strategy do on open?', options: ['Fetches anyway', 'Shows the cache and skips the network', 'Clears the cache'], a: 1, why: 'Young data counts as fresh, so there is no request at all.' },
          { q: 'OkHttp has a stale cached response with an ETag. What does it send?', options: ['Nothing, it serves the stale copy', 'A conditional request with <code>If-None-Match</code>; a 304 means the cached body is still good', 'A DELETE for the old response'], a: 1, why: 'Revalidation is cheap: a 304 has no body, and OkHttp serves the cached one.' },
        ],
        visual(el) {
          const STRATS = {
            net: 'network only',
            ctn: 'cache then network',
            ttl: 'TTL + stale-while-revalidate',
            http: 'OkHttp HTTP cache',
          };
          let strat = 'ctn', busy = false;
          const lanes = ['UI', 'cache', 'network'].map(n => {
            const track = h('div', { class: 'lane-track' });
            const cur = h('div', { class: 'cursor', style: 'left:0' });
            track.append(cur);
            return { n, track, cur, el: h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, n), track) };
          });
          const L = { UI: lanes[0], cache: lanes[1], network: lanes[2] };
          const screen = h('div', { class: 'dt-screen', 'aria-live': 'polite' });
          const o = out();
          const offSw = toggle('dt-ca-off', 'offline', () => {});
          const oldSw = toggle('dt-ca-old', 'cache is 2 h old (TTL 10 min)', () => {});
          oldSw.input.checked = true;
          const ageText = () => (oldSw.input.checked ? '2 h old' : '2 min old');
          function show(kind, banner) {
            const list = tag => [h('div', { class: 'dt-head' }, h('b', {}, 'Top stories'), tag), h('div', { class: 'dt-item' }, kind === 'fresh' ? 'Derby tonight: line-ups are out' : 'Derby tonight: kickoff at 20:00'), h('div', { class: 'dt-item' }, kind === 'fresh' ? 'Weather: storm warning lifted' : 'Weather: storm warning')];
            const kids =
              kind === 'spin' ? [h('div', { class: 'spinner' }), h('span', { class: 'dt-sub' }, 'Loading...')] :
              kind === 'error' ? [h('div', { class: 'err-icon' }, '!'), h('b', {}, 'No connection'), h('span', { class: 'dt-sub' }, 'Nothing saved to show.')] :
              kind === 'blank' ? [h('span', { class: 'dt-sub' }, 'Screen not open yet.')] :
              list(h('span', { class: 'dt-pill ' + (kind === 'fresh' ? 'dt-ok' : 'dt-warn') }, kind === 'fresh' ? 'fresh' : `cached · ${ageText()}`));
            if (banner) kids.push(h('span', { class: 'dt-pill dt-bad' }, banner));
            screen.replaceChildren(...kids);
            screen.style.justifyItems = kind === 'spin' || kind === 'error' ? 'center' : '';
            replay(screen, 'pop-soft');
          }
          function plan() {
            const off = offSw.input.checked, old = oldSw.input.checked;
            const B = [], E = [];
            const bar = (lane, s, end, cls) => B.push({ lane, s, end, cls });
            const ev = (t, fn) => E.push({ t, fn });
            const log = (t, html) => ev(t, () => line(o, html));
            if (strat === 'net') {
              bar('UI', 0, off ? 40 : 62, 'wait');
              ev(0, () => show('spin')); log(0, 'no cache in this design: spinner until the server answers');
              if (off) { bar('network', 4, 40, 'block'); ev(40, () => show('error')); log(40, '<span class="bad">IOException:</span> Unable to resolve host "api.example.com"'); }
              else { bar('network', 4, 60, 'run'); bar('UI', 62, 100, 'dt-bar-ok'); ev(62, () => show('fresh')); log(60, '<span class="good">200 OK</span> after 1.3 s, the user waited the whole time'); }
            } else if (strat === 'http') {
              if (!old) {
                bar('UI', 0, 9, 'wait'); bar('cache', 2, 9, 'run'); bar('UI', 9, 100, 'dt-bar-ok');
                ev(0, () => show('spin')); ev(9, () => show('fresh'));
                log(9, '<span class="good">cache hit</span> within max-age=600: no network request' + (off ? ', so offline is fine' : ''));
              } else if (off) {
                bar('UI', 0, 32, 'wait'); bar('network', 3, 32, 'block');
                ev(0, () => show('spin')); ev(32, () => show('error'));
                log(32, '<span class="bad">IOException</span>: stale entry needs revalidation <span class="muted">// accept stale with CacheControl max-stale when offline</span>');
              } else {
                bar('UI', 0, 38, 'wait'); bar('network', 3, 30, 'run'); bar('cache', 30, 38, 'run'); bar('UI', 38, 100, 'dt-bar-ok');
                ev(0, () => show('spin'));
                log(3, `${hl('GET /latest')} <span class="muted">If-None-Match: "a1f9"</span>`);
                log(30, '<span class="good">304 Not Modified</span>: headers only, body comes from disk');
                ev(38, () => { show('fresh'); });
              }
            } else {
              bar('cache', 0, 8, 'run'); bar('UI', 0, 8, 'wait');
              ev(0, () => show('blank'));
              ev(8, () => show('stale')); log(8, `Room emits the cached rows (${ageText()}) at once`);
              const fetch = strat === 'ctn' || old;
              if (!fetch) { bar('UI', 8, 100, 'dt-bar-stale'); log(10, `<span class="good">age 2 min &lt; TTL 10 min:</span> no network call at all`); }
              else if (off) {
                bar('network', 8, 42, 'block'); bar('UI', 8, 100, 'dt-bar-stale');
                ev(42, () => show('stale', 'offline: showing saved copy'));
                log(42, '<span class="bad">IOException</span>: keep the cached rows, add a banner');
              } else {
                if (strat === 'ttl') log(9, '<span class="muted">age 2 h &gt; TTL: revalidate in the background, keep showing the stale copy</span>');
                else log(9, '<span class="muted">always fetch, even if the cache were 1 second old</span>');
                bar('network', 8, 58, 'run'); bar('cache', 58, 64, 'run'); bar('UI', 8, 64, 'dt-bar-stale'); bar('UI', 64, 100, 'dt-bar-ok');
                log(58, `<span class="good">200 OK</span> ${hl('dao.replaceAll(fresh)')}`);
                ev(64, () => show('fresh')); log(64, 'Room emits again, the screen swaps to fresh data');
              }
            }
            return { B, E, refreshed: !off && (strat === 'ctn' || (strat !== 'net' && old)) };
          }
          async function run() {
            if (busy) return; busy = true;
            const { B, E, refreshed } = plan();
            lanes.forEach(l => { l.track.querySelectorAll('.bar').forEach(b => b.remove()); l.cur.style.left = '0'; });
            const bars = B.map(b => { const node = h('div', { class: 'bar ' + b.cls, style: `left:${b.s}%;width:0` }); L[b.lane].track.insertBefore(node, L[b.lane].cur); return { ...b, node }; });
            say(o, `<b>${STRATS[strat]}</b>${offSw.input.checked ? ' · offline' : ''}: openScreen()`);
            const fired = new Set();
            for (let t = 0; t <= 100; t += 2) {
              lanes.forEach(l => { l.cur.style.left = t + '%'; });
              bars.forEach(b => { if (t >= b.s) b.node.style.width = Math.max(0.8, Math.min(t, b.end) - b.s) + '%'; });
              E.forEach((x, i) => { if (!fired.has(i) && x.t <= t) { fired.add(i); x.fn(); } });
              await sleep(40); if (!o.isConnected) return;
            }
            if (refreshed && oldSw.input.checked) { oldSw.input.checked = false; line(o, '<span class="muted">the cache is fresh now: open again to see the TTL skip the network</span>'); }
            busy = false;
          }
          const sBtns = Object.entries(STRATS).map(([k, label]) => act(label, function () { if (busy) return; strat = k; press(sBtns, this); run(); }));
          press(sBtns, sBtns[1]);
          el.append(
            h('div', { class: 'controls' }, sBtns),
            h('div', { class: 'controls' }, offSw, oldSw, cmd('openScreen()', run)),
            h('div', { class: 'dt-grid' },
              h('div', { class: 'timeline' }, lanes.map(l => l.el),
                h('div', { class: 'legend' },
                  h('span', {}, h('i', { class: 'bar wait' }), 'waiting'), h('span', {}, h('i', { class: 'bar run' }), 'working'),
                  h('span', {}, h('i', { class: 'bar block' }), 'failed'), h('span', {}, h('i', { class: 'bar dt-bar-stale' }), 'stale shown'),
                  h('span', {}, h('i', { class: 'bar dt-bar-ok' }), 'fresh shown'))),
              screen),
            o);
          show('blank');
          run();
        },
      },
    ],
  });
})();
