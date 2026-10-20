/* Data and networking track. Same shape as tracks/kotlin.js.
   One Recipes app throughout: settings, a Room database, files, then a server, errors, sign-in, an offline cache,
   paging and live updates. Lessons (assembled from rb/data/chunk_*.js) use the shared Lab.ui demos only. */
(() => {
  Lab.addTrack({
    id: 'data',
    title: 'Data and networking',
    description: 'Build a Recipes app that keeps its data: settings in DataStore, recipes in a Room database, documents in files, then recipes from a server with Retrofit, kept offline, loaded in pages and updated live.',
    group: 'Building apps', requires: ['android', 'compose', 'coroutines', 'flow'],
    lessons: [
      {
        id: 'choose',
        title: 'Where to keep data',
        tagline: 'Settings, lists, documents and shared data each have their own place.',
        goals: ['Explain why data in a variable is gone after the app closes', 'Name four places an app can keep data', 'Pick the right place for a setting, a long list, a document and shared data'],
        level: 'beginner', introduces: [],
        body: `
<p>Ada adds twelve recipes to a new Recipes app, swipes it away, and opens it the next day. The list is empty. Everything in a <code>val</code>, a <code>var</code> or <code>remember</code> lives in the app’s memory, and Android clears that memory when the app stops: when the user swipes it away, or when Android needs the memory for another app. Data that must stay has to be written to <em>storage</em>, the phone’s long-term memory, the way the budget tracker wrote its expenses to a file.</p>
<p>Android apps keep data in four common places. A few small settings, like an on/off choice, go in <em>DataStore</em>, a small file of keys and values. Many records of the same shape that you sort and search, like 300 recipes, go in a <em>database</em>; on Android that is usually the Room library. A whole document, such as a recipe list to print, is a <em>file</em>. Data that other people or other phones must see lives on a <em>server</em>, a computer on the internet that your app talks to.</p>
<p>To choose, ask in this order. Must other phones see it? Then a server. Is it one whole document? A file. Is it many records you sort or search? A database. Is it a few settings? DataStore. Over this track the Recipes app uses all four, one lesson at a time.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            predict: {
              q: 'Ada turns on “Favorites only”, an on/off choice. Which place fits it best?',
              options: ['DataStore', 'A database', 'A server'],
              a: 0,
              why: 'It is one small setting. A database is for many records, a server for data other phones must see.',
            },
            nodes: [
              { id: 'fav', label: '“Favorites only”<small>on or off</small>', x: 22, y: 12, tone: 'warm', hidden: true },
              { id: 'list', label: '300 recipes<small>sorted by time</small>', x: 22, y: 37, tone: 'warm', hidden: true },
              { id: 'doc', label: 'A list to print<small>one document</small>', x: 22, y: 62, tone: 'warm', hidden: true },
              { id: 'friends', label: 'Recipes for Sam’s phone<small>shared</small>', x: 22, y: 88, tone: 'warm', hidden: true },
              { id: 'ds', label: 'DataStore<small>small settings</small>', x: 78, y: 12 },
              { id: 'db', label: 'Database<small>many records</small>', x: 78, y: 37 },
              { id: 'files', label: 'Files<small>whole documents</small>', x: 78, y: 62 },
              { id: 'server', label: 'Server<small>over the internet</small>', x: 78, y: 88 },
            ],
            frames: [
              { say: 'Four places to keep data. Each one fits a different kind of data.' },
              { show: ['fav'], add: [['fav', 'ds', '', 'ok']], hl: ['ds'], say: 'One on/off choice is a small setting: DataStore keeps it in a tiny file.' },
              { show: ['list'], add: [['list', 'db', '', 'ok']], hl: ['db'], say: 'Hundreds of recipes, sorted by cooking time and searched by name: a database is built for that.' },
              { show: ['doc'], add: [['doc', 'files', '', 'ok']], hl: ['files'], say: 'A recipe list to keep or print is one whole document: a file.' },
              { show: ['friends'], add: [['friends', 'server', '', 'ok']], hl: ['server'], say: 'Sam should see Ada’s recipes on his own phone. Only a server both phones talk to can do that.' },
              { hl: ['ds', 'db', 'files', 'server'], say: 'And a list kept only in a <code>var</code>? It is in none of these places, so it is gone when the app closes.' },
            ],
          });
        },
        code: `// Where the Recipes app keeps each kind of data
fun placeFor(kind: String): String = when (kind) {
    "setting" -> "DataStore"      // "Favorites only": on or off
    "recipe" -> "database"        // hundreds of records to sort and search
    "export" -> "file"            // one whole document to keep or print
    "shared" -> "server"          // recipes other phones must see
    else -> "memory"              // a var: gone when the app closes
}

fun main() {
    println(placeFor("setting"))   // DataStore
    println(placeFor("recipe"))    // database
}`,
        remember: 'A few settings: DataStore. Many records: a database. One document: a file. Shared with other phones: a server. Memory forgets.',
        terms: [
          { term: 'storage', def: 'The phone’s long-term memory. What an app writes there is still there after the app closes.' },
          { term: 'DataStore', def: 'A Jetpack library that keeps a few small settings, as keys and values, in one file.' },
          { term: 'database', def: 'A program that keeps many records of the same shape, and finds, sorts and changes them one at a time.' },
          { term: 'server', def: 'A computer on the internet that many phones talk to, so they can share data.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Send each kind of data to its place.', code: `fun placeFor(kind: String): String = when (kind) {
    "setting" -> "[[DataStore]]"
    "recipe" -> "[[database]]"
    else -> "file"
}`, why: 'A setting is small: DataStore. Recipes are many records you sort and search: a database.' },
          { type: 'bug', prompt: 'With every new recipe, saving gets slower: one small-settings file now holds all 300 recipes, and it is rewritten after every change. Tap the line that picked the wrong place.', code: `fun placeFor(kind: String): String = when (kind) {
    "setting" -> "DataStore"
    "recipe" -> "DataStore"
    "export" -> "file"
    else -> "memory"
}`, bug: 2, fix: '    "recipe" -> "database"', why: 'DataStore is made for a few small values and rewrites its whole file on every change. A database changes one record at a time.' },
        ],
        quiz: [
          { q: 'Ada’s recipes were only in a <code>var</code>. She swipes the app away and opens it again. What does she see?', options: ['An empty list', 'Her twelve recipes', 'The recipes from yesterday morning'], a: 0, why: 'A <code>var</code> lives in memory, and the memory is cleared when the app stops.' },
          { q: 'Which place fits 300 recipes that the user sorts by cooking time?', options: ['A database', 'DataStore', 'The app’s memory'], a: 0, why: 'Many records of the same shape, sorted and searched: that is what a database is for.' },
          { q: 'Lin wants her friend Sam to see her recipes on his own phone. What does that need?', options: ['A server', 'A file on Lin’s phone', 'DataStore on Lin’s phone'], a: 0, why: 'Everything on Lin’s phone stays on Lin’s phone. Both phones must talk to a server.' },
        ],
        docs: [['Data and file storage overview', 'https://developer.android.com/training/data-storage']],
      },

      {
        id: 'datastore',
        title: 'Small settings',
        tagline: 'Remember the user’s choices after the app closes.',
        goals: ['Keep an on/off setting in DataStore', 'Read it as a <code>Flow</code> and show it on screen', 'Save a change from a button with <code>rememberCoroutineScope</code>'],
        level: 'intermediate', introduces: ['DataStore', 'Preferences', 'preferencesDataStore', 'booleanPreferencesKey'],
        body: `
<p>The Recipes app has a button, “Favorites only”. Sam turns it on, closes the app, and next morning it is off again. <code>rememberSaveable</code> survives rotation, not a closed app. A choice like this belongs in storage, and for a few small settings Jetpack has <em>DataStore</em>: it keeps keys and values in one small file in the app’s private folder.</p>
<p><code>val Context.dataStore by preferencesDataStore(name = "settings")</code> goes once at the top level of a Kotlin file, outside any class. It adds a <code>dataStore</code> property to every <code>Context</code>. You know <code>by</code> from <code>by remember</code>; here it lets <code>preferencesDataStore</code> make the store the first time it is used, and hand back the same one every time after, so every use gets the same store for the file “settings”. There must never be two stores for one file. Its type is <code>DataStore&lt;Preferences&gt;</code>: <code>Preferences</code> are the keys and values in the file. Each value has a typed key: <code>booleanPreferencesKey("favorites_only")</code> is the key for a <code>Boolean</code> named “favorites_only”. The code keeps it in <code>val FAVORITES_ONLY</code>.</p>
<p>To read, <code>store.data</code> is a <code>Flow</code> of <code>Preferences</code>: it emits what is in the file now, and again after every change. <code>prefs[FAVORITES_ONLY] ?: false</code> reads one value, or <code>false</code> if it was never saved. To write, <code>store.edit { prefs -&gt; prefs[FAVORITES_ONLY] = true }</code> changes the value and writes the file. <code>edit</code> is a <code>suspend</code> function, because writing a file takes time.</p>
<p>A suspend function needs a coroutine, and a button’s <code>onClick</code> is not one. As in the coroutines track, <code>val scope = rememberCoroutineScope()</code> gives you a scope that belongs to this composable, and <code>scope.launch { ... }</code> inside <code>onClick</code> starts a coroutine in it. If the composable leaves the screen, its coroutines are cancelled. Use <code>LaunchedEffect</code> for work that starts when something appears, and <code>rememberCoroutineScope</code> for work that starts with a tap.</p>`,
        visual(el) {
          const scr = on => `<div class="ui-m-bar">Recipes</div><div class="ui-m-body"><span class="ui-m-btn fav${on ? '' : ' ghost'}">Favorites only: ${on ? 'on' : 'off'}</span><div class="ui-m-row"><div>★ Pancakes · 20 min</div></div><div class="ui-m-row"><div>☆ Tomato soup · 35 min</div></div></div>`;
          Lab.ui.phone(el, {
            logTitle: 'settings file',
            predict: {
              q: 'Sam turns “Favorites only” on and closes the app. Next morning he opens it. Once the file is read, what does the button show?',
              options: ['on', 'off', 'Whatever <code>rememberSaveable</code> kept'],
              a: 0,
              why: '<code>edit</code> wrote the value to a file, and files stay when the app closes.',
            },
            frames: [
              { screen: scr(false), log: 'data emits: no favorites_only yet → false', say: 'The app opens. <code>data</code> reads the file. There is no value yet, so <code>?: false</code> gives <code>false</code>.' },
              { tap: '.fav', log: ['tap → scope.launch { setFavoritesOnly(true) }', 'edit: favorites_only = true, file written'], say: 'Sam taps. The click starts a coroutine, and <code>edit</code> writes the new value to the file.' },
              { screen: scr(true), log: 'data emits: true', say: 'After the write, <code>data</code> emits again. The state changes, and the button shows “on”.' },
              { screen: '<div class="ui-m-center"><span class="ui-m-muted">App closed</span></div>', log: 'app stops: memory cleared, file kept', say: 'Sam swipes the app away. Everything in memory is gone, but the file stays in the app’s folder.' },
              { screen: scr(false), log: 'next morning: initialValue = false', say: 'Next morning. For a moment the state holds <code>initialValue</code>, <code>false</code>, while the file is read.' },
              { screen: scr(true), log: 'data emits: true', say: 'A moment later <code>data</code> emits the saved <code>true</code>. Sam’s choice is back.' },
            ],
          });
        },
        code: `// Settings.kt
// Top level, outside any class: one DataStore for the file "settings"
val Context.dataStore by preferencesDataStore(name = "settings")

val FAVORITES_ONLY = booleanPreferencesKey("favorites_only")

class SettingsStore(private val store: DataStore<Preferences>) {
    // emits the saved value now, and again after every change
    val favoritesOnly: Flow<Boolean> = store.data.map { prefs -> prefs[FAVORITES_ONLY] ?: false }

    suspend fun setFavoritesOnly(on: Boolean) {
        store.edit { prefs -> prefs[FAVORITES_ONLY] = on }   // writes the file
    }
}

@Composable
fun FavoritesButton(settings: SettingsStore) {
    val on by settings.favoritesOnly.collectAsStateWithLifecycle(initialValue = false)
    val scope = rememberCoroutineScope()
    Button(onClick = { scope.launch { settings.setFavoritesOnly(!on) } }) {
        Text(if (on) "Favorites only: on" else "Favorites only: off")
    }
}

// MainActivity, in onCreate. An Activity is a Context, so dataStore works here:
// val settings = SettingsStore(dataStore)
// setContent { FavoritesButton(settings) }

// app/build.gradle.kts
// dependencies {
//     implementation("androidx.datastore:datastore-preferences:1.2.1")
// }`,
        remember: 'preferencesDataStore once at the top level; read with data (a Flow), write with edit inside a coroutine.',
        mistakes: [
          { title: 'Calling edit straight from onClick', bad: `Button(onClick = { settings.setFavoritesOnly(true) }) {
    Text("Favorites only")
}
// error: Suspend function 'suspend fun setFavoritesOnly(on: Boolean): Unit'
// can only be called from a coroutine or another suspend function.`, good: `val scope = rememberCoroutineScope()
Button(onClick = { scope.launch { settings.setFavoritesOnly(true) } }) {
    Text("Favorites only")
}`, why: '<code>onClick</code> is an ordinary lambda, not a coroutine. <code>scope.launch</code> starts a coroutine in which the suspend function can run.' },
        ],
        terms: [
          { term: 'DataStore', def: 'A Jetpack library that keeps small settings in a file. <code>data</code> reads them as a <code>Flow</code>; <code>edit</code> changes them.' },
          { term: 'preferences key', def: 'A typed name for one setting, like <code>booleanPreferencesKey("favorites_only")</code>.' },
          { term: 'edit', def: 'A suspend function of DataStore: <code>store.edit { prefs -&gt; prefs[KEY] = value }</code> changes values and writes the file.' },
          { term: 'rememberCoroutineScope', def: 'Gives a composable its own scope. <code>scope.launch { }</code> starts a coroutine from a click; it is cancelled when the composable leaves the screen.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Save the setting when the button is tapped.', code: `val scope = [[rememberCoroutineScope]]()
Button(onClick = {
    scope.[[launch]] { settings.setFavoritesOnly(true) }
}) { Text("Favorites only") }`, why: '<code>rememberCoroutineScope()</code> gives a scope; <code>launch</code> starts the coroutine that runs the suspend function.' },
          { type: 'bug', prompt: 'Tapping the button never turns the setting on. Tap the wrong line.', code: `val FAVORITES_ONLY = booleanPreferencesKey("favorites_only")

class SettingsStore(private val store: DataStore<Preferences>) {
    val favoritesOnly: Flow<Boolean> = store.data.map { prefs -> prefs[FAVORITES_ONLY] ?: false }

    suspend fun setFavoritesOnly(on: Boolean) {
        store.edit { prefs -> prefs[FAVORITES_ONLY] = false }
    }
}`, bug: 6, fix: '        store.edit { prefs -> prefs[FAVORITES_ONLY] = on }', why: 'The function always writes <code>false</code>. It must write the value it was given, <code>on</code>.' },
        ],
        quiz: [
          { q: 'Where does <code>val Context.dataStore by preferencesDataStore(name = "settings")</code> go?', options: ['Once, at the top level of a Kotlin file', 'Inside the composable that uses it', 'Inside every Activity'], a: 0, why: 'At the top level it is made once, so the app has exactly one store for the file.' },
          { q: 'What does <code>store.data</code> give you?', options: ['A <code>Flow</code> that emits the saved values now and after every change', 'The values once, then nothing', 'A list of every change ever made'], a: 0, why: 'That is why the screen updates by itself after <code>edit</code>.' },
          { q: 'Why does the button use <code>scope.launch</code>?', options: ['<code>edit</code> is a suspend function, and <code>onClick</code> is not a coroutine', 'It makes the button draw faster', 'Compose needs it to show <code>Text</code>'], a: 0, why: 'A suspend function runs only in a coroutine or another suspend function.' },
        ],
        docs: [['DataStore', 'https://developer.android.com/topic/libraries/architecture/datastore']],
      },

      {
        id: 'room',
        title: 'A local database',
        tagline: 'Describe a table of recipes, and the questions you ask it.',
        goals: ['Explain what a table, a row, a primary key and a query are', 'Describe the recipes table with <code>@Entity</code>', 'Write its reads and writes as a DAO with <code>@Query</code> and <code>@Insert</code>'],
        level: 'intermediate', introduces: ['Entity', 'tableName', 'PrimaryKey', 'autoGenerate', 'Dao', 'Query', 'Insert'],
        body: `
<p>Ada’s list grows to 40 recipes, and she wants them sorted by cooking time. DataStore would read and rewrite one file holding all 40 every time she changes one. A <em>database</em> is made for this: it keeps records in <em>tables</em> and changes one record at a time.</p>
<p>A table looks like a spreadsheet. Each <em>row</em> is one recipe; each <em>column</em> is one property: id, title, minutes, favorite. Every row needs a <em>primary key</em>, a value no other row has; here it is the id. You ask a database for rows with a <em>query</em>, written in SQL, a small language for databases. <code>"SELECT * FROM recipes ORDER BY minutes"</code> means “every column of every row in recipes, shortest cooking time first”. Android has a database built in, SQLite, and <em>Room</em> is the Jetpack library that lets you use it from Kotlin.</p>
<p>You describe the table with annotations, words starting with <code>@</code> (like <code>@Composable</code>) that tell a tool what a piece of code is. <code>@Entity(tableName = "recipes")</code> on a data class makes it a table, with one column per property. <code>@PrimaryKey(autoGenerate = true)</code> on <code>id</code> lets Room pick a new number for each row, so you make recipes with <code>id = 0</code>, which means “not set yet”.</p>
<p>The reads and writes go in an interface marked <code>@Dao</code>, a <em>data access object</em>. <code>@Query("...")</code> on a function runs that SQL; <code>@Insert</code> adds a row. You don’t write their bodies: when the app is built, a tool called KSP writes that code for you. They are <code>suspend</code> functions, and Room runs them on a background thread, so the screen never waits. To use the DAO, the app needs a database file that holds the table: that is the next lesson.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            predict: {
              q: 'Ada adds two recipes, both made with <code>id = 0</code>. Which ids do they get in the table?',
              options: ['1 and 2', '0 and 0', 'The second one is refused: 0 is taken'],
              a: 0,
              why: 'With <code>autoGenerate = true</code>, an id of 0 means “not set yet”, and the database picks the next free number.',
            },
            nodes: [
              { id: 'app', label: 'Your code', sub: 'in a coroutine' },
              { id: 'dao', label: 'RecipeDao', sub: 'your interface' },
              { id: 'room', label: 'Room', sub: 'code KSP wrote' },
              { id: 'db', label: 'Table', sub: 'recipes' },
            ],
            frames: [
              { say: 'Four parts: your code calls the DAO, Room’s generated code runs the SQL, and the rows live in the recipes table.' },
              { at: 'dao', packet: 'insert(Pancakes, 20)', say: 'Ada taps Add. Inside a coroutine, the app calls <code>dao.insert(Recipe(title = "Pancakes", minutes = 20))</code>, with <code>id = 0</code>.' },
              { at: 'room', packet: 'INSERT INTO recipes …', say: 'Room’s code turns the call into SQL, on a background thread.' },
              { at: 'db', packet: 'row 1 · Pancakes · 20', tone: 'ok', mark: { db: 'ok' }, say: 'The table gets a new row. <code>autoGenerate</code> picked id 1. Omelette, added next, gets id 2.' },
              { at: 'dao', packet: 'getAll()', say: 'To show the list, the app calls <code>getAll()</code>, the function with the <code>@Query</code>.' },
              { at: 'db', packet: 'SELECT * … ORDER BY minutes', say: 'Room runs the query on the table.' },
              { at: 'app', packet: 'Omelette 10 · Pancakes 20', tone: 'ok', mark: { app: 'ok' }, say: 'The rows come back as a <code>List&lt;Recipe&gt;</code>, shortest cooking time first.' },
            ],
          });
        },
        code: `@Entity(tableName = "recipes")
data class Recipe(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,   // 0: let Room pick
    val title: String,
    val minutes: Int,
    val favorite: Boolean = false,
)

@Dao
interface RecipeDao {
    @Query("SELECT * FROM recipes ORDER BY minutes")
    suspend fun getAll(): List<Recipe>

    @Insert
    suspend fun insert(recipe: Recipe)
}

// Calling it, inside a coroutine:
// dao.insert(Recipe(title = "Pancakes", minutes = 20))   // gets id 1
// dao.insert(Recipe(title = "Omelette", minutes = 10))   // gets id 2
// dao.getAll()
// [Recipe(id=2, title=Omelette, minutes=10, favorite=false), Recipe(id=1, title=Pancakes, minutes=20, favorite=false)]`,
        remember: 'A table has rows (records) and columns (properties); @Entity describes the table, @Dao holds its queries.',
        terms: [
          { term: 'table', def: 'Rows and columns in a database. Each row is one record (a recipe); each column is one property (its title).' },
          { term: 'primary key', def: 'A column whose value no other row has, like the id. <code>@PrimaryKey</code> marks it.' },
          { term: 'query', def: 'A question to the database, written in SQL, like <code>"SELECT * FROM recipes ORDER BY minutes"</code>.' },
          { term: 'DAO', def: 'Data access object: an interface marked <code>@Dao</code> with the functions that read and write the tables.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Mark the class as a table and the interface as its DAO.', code: `@[[Entity]](tableName = "recipes")
data class Recipe(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val minutes: Int,
)

@[[Dao]]
interface RecipeDao {
    @Insert
    suspend fun insert(recipe: Recipe)
}`, why: '<code>@Entity</code> makes the table; <code>@Dao</code> marks the interface Room writes the code for.' },
          { type: 'bug', prompt: 'The build stops: Room says the table has no primary key. Tap the line to fix.', code: `@Entity(tableName = "recipes")
data class Recipe(
    val id: Int = 0,
    val title: String,
    val minutes: Int,
)`, bug: 2, fix: '    @PrimaryKey(autoGenerate = true) val id: Int = 0,', why: 'Every table needs a primary key so Room can tell rows apart. <code>autoGenerate</code> lets Room pick the numbers.' },
        ],
        quiz: [
          { q: 'In the recipes table, what is one row?', options: ['One recipe', 'One property of every recipe, like all the titles', 'The whole database'], a: 0, why: 'Rows are records; columns are properties.' },
          { q: 'What does <code>"SELECT * FROM recipes ORDER BY minutes"</code> give back?', options: ['Every recipe, shortest cooking time first', 'Only the minutes column', 'The recipe that takes longest'], a: 0, why: '<code>*</code> means every column; <code>ORDER BY minutes</code> sorts the rows, smallest first.' },
          { q: 'Why are <code>getAll</code> and <code>insert</code> <code>suspend</code> functions?', options: ['Reading and writing the file takes time, so Room does it on a background thread while the screen keeps working', 'Room needs them to be private', 'So they run only once'], a: 0, why: 'The caller waits in a coroutine; the screen does not freeze.' },
        ],
        docs: [['Save data in a local database using Room', 'https://developer.android.com/training/data-storage/room']],
      },

      {
        id: 'room-setup',
        title: 'Opening the database',
        tagline: 'Make one database for the whole app, and put its recipes on screen.',
        goals: ['List the tables of a database with <code>@Database</code>', 'Open it once for the whole app with <code>Room.databaseBuilder</code>', 'Add Room to the build, with a saved schema for every version'],
        level: 'intermediate', introduces: ['Database', 'entities', 'RoomDatabase', 'Room', 'databaseBuilder', 'setDriver', 'AndroidSQLiteDriver', 'schemaDirectory'],
        body: `
<p>The last lesson described the recipes table and its DAO. But no file holds the table yet, and nothing hands the app a <code>RecipeDao</code>. That is the database: one file, <code>recipes.db</code>, that the app opens once and keeps open.</p>
<p><code>@Database(entities = [Recipe::class], version = 1)</code> goes on an <code>abstract</code> class that extends <code>RoomDatabase</code>. The square brackets list its tables. <code>version</code> is the number of this shape of the database; it starts at 1. The function <code>recipeDao()</code> hands out the DAO, and KSP writes its body too.</p>
<p><code>Room.databaseBuilder&lt;RecipesDatabase&gt;(context, "recipes.db")</code> names the file, <code>setDriver(AndroidSQLiteDriver())</code> tells Room to use Android’s own SQLite, and <code>build()</code> makes the database. Opening one is expensive, so the app keeps one for its whole life, like a singleton: that is <code>RecipesDb</code> below. It uses <code>applicationContext</code>, the <code>Context</code> of the whole app, which lives as long as the database does.</p>
<p>In Gradle, the KSP plugin runs the tool that writes Room’s code, and the Room plugin saves a <em>schema</em> at every build: a description of every table and column, one file per version, such as <code>schemas/…/1.json</code>. Commit that folder with Git. You need these files when the database changes.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            predict: {
              q: 'Ada turns the phone, so <code>onCreate</code> runs again and calls <code>RecipesDb.get(this)</code> again. How many databases are open now?',
              options: ['One: the same as before', 'Two: one per <code>onCreate</code>', 'None: turning the phone closed it'],
              a: 0,
              why: '<code>RecipesDb</code> keeps the database it built. The second call finds it and hands it back.',
            },
            nodes: [
              { id: 'c1', label: 'onCreate<small>app starts</small>', x: 22, y: 10 },
              { id: 'c2', label: 'onCreate<small>after turning</small>', x: 22, y: 40, hidden: true },
              { id: 'get', label: 'RecipesDb.get(this)', x: 70, y: 25 },
              { id: 'db', label: 'RecipesDatabase<small>one, open</small>', x: 70, y: 57, tone: 'ok', hidden: true },
              { id: 'file', label: 'recipes.db<small>the file</small>', x: 78, y: 88, tone: 'muted' },
              { id: 'dao', label: 'recipeDao()<small>RecipeDao</small>', x: 26, y: 88, hidden: true },
            ],
            frames: [
              { say: 'The app starts. <code>RecipesDb</code> holds no database yet: <code>db</code> is <code>null</code>.' },
              { add: [['c1', 'get']], hl: ['get'], say: '<code>onCreate</code> calls <code>RecipesDb.get(this)</code>. Because <code>db</code> is <code>null</code>, the builder runs.' },
              { show: ['db'], add: [['get', 'db', 'build()', 'ok'], ['db', 'file', '', 'ok']], hl: ['db'], say: '<code>build()</code> makes the database and opens <code>recipes.db</code>. <code>RecipesDb</code> keeps it in <code>db</code>.' },
              { show: ['dao'], add: [['db', 'dao', '', 'ok']], hl: ['dao'], say: '<code>recipeDao()</code> gives the DAO, and <code>setContent</code> passes it to the screen.' },
              { show: ['c2'], add: [['c2', 'get']], hl: ['c2', 'get'], say: 'Ada turns the phone. <code>onCreate</code> runs again and calls <code>get</code> again.' },
              { add: [['get', 'db', 'same one', 'ok']], hl: ['db'], say: 'This time <code>db</code> is not <code>null</code>, so <code>get</code> hands back the same database. Still one open.' },
            ],
          });
        },
        code: `@Database(entities = [Recipe::class], version = 1)
abstract class RecipesDatabase : RoomDatabase() {
    abstract fun recipeDao(): RecipeDao
}

// One database for the whole app
object RecipesDb {
    private var db: RecipesDatabase? = null

    fun get(context: Context): RecipesDatabase {
        val open = db ?: Room.databaseBuilder<RecipesDatabase>(context.applicationContext, "recipes.db")
            .setDriver(AndroidSQLiteDriver())
            .build()
        db = open
        return open
    }
}

@Composable
fun RecipeList(dao: RecipeDao) {
    var recipes by remember { mutableStateOf(listOf<Recipe>()) }
    val scope = rememberCoroutineScope()
    LaunchedEffect(Unit) { recipes = dao.getAll() }          // load once
    Column {
        Button(onClick = {
            scope.launch {
                dao.insert(Recipe(title = "Pancakes", minutes = 20))
                recipes = dao.getAll()                        // load again, by hand
            }
        }) { Text("Add pancakes") }
        LazyColumn {
            items(recipes) { recipe -> Text("\${recipe.title} · \${recipe.minutes} min") }
        }
    }
}

// MainActivity, in onCreate:
// setContent { RecipeList(RecipesDb.get(this).recipeDao()) }

// build.gradle.kts of the project:
// plugins {
//     id("androidx.room3") version "3.0.3" apply false
// }
// app/build.gradle.kts:
// plugins {
//     id("com.google.devtools.ksp") version "2.3.10"   // KSP writes Room's code
//     id("androidx.room3")                              // saves the schemas
// }
// room3 {
//     schemaDirectory("$projectDir/schemas")   // a description of the database at every build: commit it
// }
// dependencies {
//     implementation("androidx.room3:room3-runtime:3.0.3")
//     implementation("androidx.sqlite:sqlite-framework:2.7.1")   // AndroidSQLiteDriver
//     ksp("androidx.room3:room3-compiler:3.0.3")
// }`,
        remember: '@Database lists the tables and the version; open it once for the whole app with Room.databaseBuilder; the Room plugin saves a schema per version.',
        mistakes: [
          { title: 'Opening the database in onCreate', bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val db = Room.databaseBuilder<RecipesDatabase>(this, "recipes.db")
        .setDriver(AndroidSQLiteDriver())
        .build()
    setContent { RecipeList(db.recipeDao()) }
}`, good: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val dao = RecipesDb.get(this).recipeDao()
    setContent { RecipeList(dao) }
}`, why: '<code>onCreate</code> runs again after every rotation, so each turn of the phone opens one more database on the same file. The Room guide says to keep one instance: each one is expensive.' },
        ],
        terms: [
          { term: 'database class', def: 'An <code>abstract</code> class marked <code>@Database</code> that extends <code>RoomDatabase</code>. It lists the tables and hands out the DAOs.' },
          { term: 'version', def: 'The number of the database’s shape in <code>@Database(..., version = 1)</code>. It goes up when a table changes.' },
          { term: 'schema', def: 'The description of a database: its tables, their columns and types. The Room plugin saves one file per version.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'List the table and hand out its DAO.', code: `@[[Database]](entities = [Recipe::class], version = 1)
abstract class RecipesDatabase : [[RoomDatabase]]() {
    abstract fun recipeDao(): RecipeDao
}`, why: '<code>@Database</code> lists the tables, and the class extends <code>RoomDatabase</code> so Room can build it.' },
          { type: 'bug', prompt: 'Every time the phone turns, one more database is opened on the same file. Tap the wrong line.', code: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val db = Room.databaseBuilder<RecipesDatabase>(this, "recipes.db").setDriver(AndroidSQLiteDriver()).build()
    setContent { RecipeList(db.recipeDao()) }
}`, bug: 2, fix: '    val db = RecipesDb.get(this)', why: '<code>onCreate</code> runs after every rotation. <code>RecipesDb.get</code> builds the database once and then hands back the same one.' },
        ],
        quiz: [
          { q: 'What do the square brackets in <code>entities = [Recipe::class]</code> hold?', options: ['The list of tables in the database', 'The rows of the recipes table', 'The DAO functions'], a: 0, why: 'Each entity listed there becomes one table.' },
          { q: 'Why does the app keep one database in <code>RecipesDb</code>?', options: ['Opening a database is expensive, and the app needs only one', 'Room allows only one table per database', 'So the database is deleted when the app closes'], a: 0, why: 'One instance for the whole life of the app, as the Room guide says.' },
          { q: 'What does the Room Gradle plugin save at every build?', options: ['A schema file describing the tables of this version', 'A copy of every recipe', 'The SQL of every query you ran'], a: 0, why: 'You need the schema files of the old and new version when the database changes.' },
        ],
        docs: [['Save data in a local database using Room', 'https://developer.android.com/training/data-storage/room'], ['Room 3 releases and setup', 'https://developer.android.com/jetpack/androidx/releases/room3']],
      },

      {
        id: 'room-flow',
        title: 'Live queries',
        tagline: 'Let the list update itself whenever the table changes.',
        goals: ['Return a <code>Flow</code> from a DAO query', 'Show it on screen with <code>collectAsStateWithLifecycle</code>', 'Change a row with <code>@Update</code> and watch the list follow'],
        level: 'intermediate', introduces: ['Update'],
        body: `
<p>In the last lesson, the screen called <code>getAll()</code> again after every insert. Forget that once, say on the new star button, and the screen shows old data. Worse, when another screen changes a recipe, this one never hears about it.</p>
<p>Let the query tell you. Change it to <code>fun getAll(): Flow&lt;List&lt;Recipe&gt;&gt;</code>, without <code>suspend</code>: the call returns a <code>Flow</code> at once, and nothing runs until it is collected. While it is collected, Room runs the query and emits the list, then keeps watching the recipes table. After every insert, update or delete in that table, it runs the query again and emits the new list. (It reruns after any change to the table, even to a row the query doesn’t return.)</p>
<p>In the screen, <code>remember { dao.getAll() }</code> keeps one <code>Flow</code> across recompositions, and <code>collectAsStateWithLifecycle(initialValue = listOf())</code> turns it into state. To star a recipe, <code>@Update suspend fun update(recipe: Recipe)</code> replaces the row with the same primary key: <code>dao.update(recipe.copy(favorite = !recipe.favorite))</code>. The click only writes. The list follows by itself.</p>`,
        visual(el) {
          const scr = (pancakes, soup) => `<div class="ui-m-bar">Recipes</div><div class="ui-m-body"><div class="ui-m-row"><div>Omelette · 10 min</div><span class="ui-m-chip">☆</span></div><div class="ui-m-row"><div>Pancakes · 20 min</div><span class="ui-m-chip star">${pancakes ? '★' : '☆'}</span></div>${soup ? '<div class="ui-m-row"><div>Tomato soup · 35 min</div><span class="ui-m-chip">☆</span></div>' : ''}</div><span class="ui-m-fab">+</span>`;
          Lab.ui.phone(el, {
            logTitle: 'Room and the screen',
            predict: {
              q: 'The star’s click calls only <code>dao.update(...)</code>, nothing else. Does the star on screen fill in?',
              options: ['Yes: Room emits a new list after the write', 'No: the screen must call <code>getAll()</code> again', 'Only after the app restarts'],
              a: 0,
              why: 'The screen collects a Flow query. Room runs it again after every change to the table.',
            },
            frames: [
              { screen: scr(false, false), log: 'collect getAll() → query runs → emits 2 recipes', say: 'The screen collects <code>getAll()</code>. Room runs the query and emits the list.' },
              { tap: '.star', log: 'tap ☆ → update(pancakes.copy(favorite = true))', say: 'Ada stars Pancakes. The click only calls <code>update</code>, which writes the row.' },
              { screen: scr(true, false), log: 'recipes table changed → query runs → emits', say: 'Room sees that the recipes table changed, runs the query again and emits a new list. The star fills in.' },
              { tap: '.ui-m-fab', log: 'tap + → insert(Recipe(title = "Tomato soup", minutes = 35))', say: 'She adds Tomato soup. Again the click only writes.' },
              { screen: scr(true, true), log: 'recipes table changed → emits 3 recipes', say: 'A new list arrives with three recipes, still sorted by minutes.' },
              { screen: '<div class="ui-m-bar">Settings</div><div class="ui-m-body"><span class="ui-m-btn ghost">Favorites only: off</span></div>', log: 'screen left → collection stopped, Room stops watching', say: 'Ada opens another screen. The list is no longer collected, so Room stops running the query for it.' },
            ],
          });
        },
        code: `@Dao
interface RecipeDao {
    @Query("SELECT * FROM recipes ORDER BY minutes")
    fun getAll(): Flow<List<Recipe>>        // no suspend: it returns a Flow at once

    @Insert
    suspend fun insert(recipe: Recipe)

    @Update
    suspend fun update(recipe: Recipe)      // replaces the row with the same id
}

@Composable
fun RecipeList(dao: RecipeDao) {
    val recipesFlow = remember { dao.getAll() }
    val recipes by recipesFlow.collectAsStateWithLifecycle(initialValue = listOf())
    val scope = rememberCoroutineScope()

    LazyColumn {
        items(recipes, key = { it.id }) { recipe ->
            Row {
                Text("\${recipe.title} · \${recipe.minutes} min")
                TextButton(onClick = {
                    scope.launch { dao.update(recipe.copy(favorite = !recipe.favorite)) }
                }) { Text(if (recipe.favorite) "★" else "☆") }
            }
        }
    }
}`,
        remember: 'A DAO query that returns Flow emits again after every change to its table; the screen only collects, the clicks only write.',
        mistakes: [
          { title: 'A new Flow on every recomposition', bad: `val recipes by dao.getAll().collectAsStateWithLifecycle(initialValue = listOf())`, good: `val recipesFlow = remember { dao.getAll() }
val recipes by recipesFlow.collectAsStateWithLifecycle(initialValue = listOf())`, why: 'Each call to <code>getAll()</code> makes a new <code>Flow</code>. Without <code>remember</code>, every recomposition starts the collection, and the query, over again.' },
        ],
        terms: [
          { term: 'observable query', def: 'A DAO function that returns a <code>Flow</code>. Room emits its result, and emits again after every change to the table.' },
          { term: 'Update', def: '<code>@Update</code> marks a DAO function that replaces the row with the same primary key.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the list update itself, and add a function that changes a recipe.', code: `@Dao
interface RecipeDao {
    @Query("SELECT * FROM recipes ORDER BY minutes")
    fun getAll(): [[Flow]]<List<Recipe>>

    @[[Update]]
    suspend fun update(recipe: Recipe)
}`, why: 'Returning a <code>Flow</code> makes the query live. <code>@Update</code> replaces a row, found by its id.' },
          { type: 'bug', prompt: 'Tapping a filled star should remove it, but the star stays. Tap the wrong line.', code: `TextButton(onClick = {
    scope.launch { dao.update(recipe.copy(favorite = true)) }
}) { Text(if (recipe.favorite) "★" else "☆") }`, bug: 1, fix: '    scope.launch { dao.update(recipe.copy(favorite = !recipe.favorite)) }', why: 'The click always writes <code>true</code>. <code>!recipe.favorite</code> writes the opposite of the current value.' },
        ],
        quiz: [
          { q: 'After <code>dao.insert(...)</code>, what must a screen that collects <code>getAll()</code> do?', options: ['Nothing: Room emits the new list', 'Call <code>getAll()</code> again', 'Restart the app'], a: 0, why: 'The table changed, so Room runs the query again and emits.' },
          { q: 'Why is <code>getAll()</code> no longer a <code>suspend</code> function?', options: ['It returns a Flow at once; the query runs while the Flow is collected', 'Flow functions must run on the main thread', 'Room doesn’t allow suspend functions'], a: 0, why: 'Making the Flow is quick. The work happens during <code>collect</code>.' },
          { q: 'How does <code>@Update</code> find the row to change?', options: ['By its primary key, the id', 'By its title', 'By its place on the screen'], a: 0, why: 'That is why <code>copy</code> keeps the id and changes only <code>favorite</code>.' },
        ],
        docs: [['Write asynchronous DAO queries', 'https://developer.android.com/training/data-storage/room/async-queries']],
      },

      {
        id: 'relations',
        title: 'Related tables',
        tagline: 'Give every recipe its steps, and load both together.',
        goals: ['Link two tables with a column that holds the other row’s id', 'Load a recipe with its steps using <code>@Embedded</code> and <code>@Relation</code>', 'Explain why the query needs <code>@Transaction</code>'],
        level: 'intermediate', introduces: ['Embedded', 'Relation', 'parentColumns', 'entityColumns', 'Transaction'],
        body: `
<p>A recipe needs steps: “Mix flour and eggs”, “Fry for 2 minutes”. One recipe can have any number of them, and a column holds just one value. So steps get their own table, <code>steps</code>, and each step row says which recipe it belongs to, in a column <code>recipeId</code>. One recipe, many steps: a <em>one-to-many relation</em>.</p>
<p><code>Step</code> is a second entity, listed in <code>entities = [Recipe::class, Step::class]</code>. To show a recipe with its steps, write a plain data class that is not an entity, <code>RecipeWithSteps</code>. <code>@Embedded val recipe: Recipe</code> takes the recipe’s columns as they are. <code>@Relation(parentColumns = ["id"], entityColumns = ["recipeId"]) val steps: List&lt;Step&gt;</code> tells Room: fill this list with every <code>Step</code> whose <code>recipeId</code> equals this recipe’s <code>id</code>.</p>
<p>The DAO returns it from <code>@Query("SELECT * FROM recipes WHERE id = :id")</code>. <code>:id</code> stands for the function’s parameter <code>id</code>; Room fills it in. For the steps, Room runs a second query. <code>@Transaction</code> makes both queries read the database at the same moment, so a change in between can’t mix old and new rows. The Room guide says it is needed whenever a function runs two queries like this.</p>
<p>The list of tables changed. While the app is only on your own test phone, uninstall it and run again, so Room starts with a fresh file. Once real people have recipes in it, that is not an option. That is the next lesson.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 340,
            predict: {
              q: 'Pancakes has id 1. Which steps end up in its <code>steps</code> list?',
              options: ['Every step whose recipeId is 1', 'Every step in the table', 'Only the step whose own id is 1'],
              a: 0,
              why: '<code>@Relation</code> matches the recipe’s <code>id</code> with the step’s <code>recipeId</code>.',
            },
            nodes: [
              { id: 'r1', label: 'Pancakes<small>recipes · id 1</small>', x: 20, y: 14 },
              { id: 'r2', label: 'Tomato soup<small>recipes · id 2</small>', x: 20, y: 52 },
              { id: 's1', label: 'Mix flour, eggs<small>steps · recipeId 1</small>', x: 76, y: 10, tone: 'muted' },
              { id: 's2', label: 'Fry 2 minutes<small>steps · recipeId 1</small>', x: 76, y: 36, tone: 'muted' },
              { id: 's3', label: 'Chop tomatoes<small>steps · recipeId 2</small>', x: 76, y: 62, tone: 'muted' },
              { id: 'res', label: 'RecipeWithSteps<small>Pancakes + 2 steps</small>', x: 36, y: 90, tone: 'ok', hidden: true },
            ],
            frames: [
              { say: 'Two tables. Each step row keeps the id of its recipe in <code>recipeId</code>.' },
              { add: [['s1', 'r1'], ['s2', 'r1'], ['s3', 'r2']], say: 'Follow <code>recipeId</code>: the first two steps belong to Pancakes, the third to Tomato soup.' },
              { hl: ['r1'], say: '<code>getWithSteps(1)</code>. First query: <code>SELECT * FROM recipes WHERE id = 1</code>. One row, Pancakes.' },
              { hl: ['s1', 's2'], say: 'Second query, written by Room: the steps whose <code>recipeId</code> is 1. Two rows.' },
              { show: ['res'], add: [['r1', 'res', '', 'ok'], ['s1', 'res', '', 'ok'], ['s2', 'res', '', 'ok']], hl: ['res'], say: 'Room builds one <code>RecipeWithSteps</code>: the recipe through <code>@Embedded</code>, its steps through <code>@Relation</code>.' },
              { hl: ['r1', 's1', 's2', 'res'], say: '<code>@Transaction</code> made both queries read the same moment of the database, so the recipe and its steps belong together.' },
            ],
          });
        },
        code: `@Entity(tableName = "steps")
data class Step(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val recipeId: Int,      // the id of the recipe this step belongs to
    val number: Int,        // 1, 2, 3: the order of the steps
    val text: String,
)

// Not an entity: Room fills it from both tables
data class RecipeWithSteps(
    @Embedded val recipe: Recipe,
    @Relation(parentColumns = ["id"], entityColumns = ["recipeId"])
    val steps: List<Step>,
)

@Dao
interface RecipeDao {
    // getAll, insert and update as before

    @Transaction
    @Query("SELECT * FROM recipes WHERE id = :id")
    fun getWithSteps(id: Int): Flow<RecipeWithSteps>

    @Insert
    suspend fun insertSteps(steps: List<Step>)
}

@Database(entities = [Recipe::class, Step::class], version = 1)
abstract class RecipesDatabase : RoomDatabase() {
    abstract fun recipeDao(): RecipeDao
}

@Composable
fun RecipeDetail(dao: RecipeDao, id: Int) {
    val detailFlow = remember { dao.getWithSteps(id) }
    val detail by detailFlow.collectAsStateWithLifecycle(initialValue = null)
    val current = detail
    if (current != null) {
        Column {
            Text(current.recipe.title)
            for (step in current.steps.sortedBy { it.number }) {
                Text("\${step.number}. \${step.text}")
            }
        }
    }
}`,
        remember: 'The child table keeps the parent’s id; @Embedded plus @Relation builds the nested object; mark the query @Transaction.',
        mistakes: [
          { title: 'A list inside one column', bad: `@Entity(tableName = "recipes")
data class Recipe(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val steps: List<String>,
)`, good: `@Entity(tableName = "steps")
data class Step(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val recipeId: Int,
    val number: Int,
    val text: String,
)`, why: 'A column holds one value, so Room stops the build: it doesn’t know how to store a list there. A steps table also lets you add or change one step without touching the others.' },
        ],
        terms: [
          { term: 'one-to-many relation', def: 'One row in a table (a recipe) belongs with many rows in another (its steps), linked by a column like <code>recipeId</code>.' },
          { term: 'Embedded', def: '<code>@Embedded</code> puts all the columns of an entity into a plain class, as one property.' },
          { term: 'Relation', def: '<code>@Relation(parentColumns = [...], entityColumns = [...])</code> fills a list with the rows of another table whose column matches.' },
          { term: 'Transaction', def: '<code>@Transaction</code> makes all the queries of one DAO function act as a single step on the database.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build a recipe with its steps.', code: `data class RecipeWithSteps(
    @[[Embedded]] val recipe: Recipe,
    @[[Relation]](parentColumns = ["id"], entityColumns = ["recipeId"])
    val steps: List<Step>,
)`, why: '<code>@Embedded</code> holds the recipe; <code>@Relation</code> collects the matching steps.' },
          { type: 'bug', prompt: 'Pancakes (id 1) shows one wrong step: the step whose own id is 1, not the steps whose recipeId is 1. Tap the wrong line.', code: `data class RecipeWithSteps(
    @Embedded val recipe: Recipe,
    @Relation(parentColumns = ["id"], entityColumns = ["id"])
    val steps: List<Step>,
)`, bug: 2, fix: '    @Relation(parentColumns = ["id"], entityColumns = ["recipeId"])', why: 'The step column to match is <code>recipeId</code>, the link to the recipe, not the step’s own <code>id</code>.' },
        ],
        quiz: [
          { q: 'Where is the link between a step and its recipe stored?', options: ['In the steps table, in the column <code>recipeId</code>', 'In the recipes table, as a list of steps', 'In DataStore'], a: 0, why: 'The “many” side keeps the id of the “one” side.' },
          { q: 'In <code>WHERE id = :id</code>, what is <code>:id</code>?', options: ['The function’s parameter <code>id</code>, filled in by Room', 'A column named “:id”', 'A comment'], a: 0, why: 'A colon and a parameter name put that value into the query.' },
          { q: 'Why does <code>getWithSteps</code> need <code>@Transaction</code>?', options: ['Room runs two queries, and both must read the same moment of the database', 'Without it the steps come back in the wrong order', 'It makes the query faster'], a: 0, why: 'One query for the recipe, one for its steps: <code>@Transaction</code> keeps them together.' },
        ],
        docs: [['Define and query one-to-many relationships', 'https://developer.android.com/training/data-storage/room/relationships/one-to-many']],
      },

      {
        id: 'migrations',
        title: 'Changing the database',
        tagline: 'Update the app without losing anyone’s recipes.',
        goals: ['Explain why a changed table needs a new version number', 'Let Room write a simple migration with <code>AutoMigration</code>', 'Write a migration yourself with <code>Migration</code>'],
        level: 'intermediate', introduces: ['AutoMigration', 'autoMigrations', 'ColumnInfo', 'defaultValue', 'Migration', 'migrate', 'SQLiteConnection', 'executeSQL', 'addMigrations'],
        body: `
<p>Recipes is out, and Lin has 80 recipes in it. Version 2 of the app should show how long each step takes, so <code>Step</code> gets a new property, <code>minutes</code>. But Lin’s phone still has the old <code>recipes.db</code>, whose steps table has no minutes column. Uninstalling would delete her recipes. The file must be changed in place, keeping every row.</p>
<p>Room writes a version number into the file. Raise it in <code>@Database(..., version = 2)</code>. When the new app finds a version 1 file, Room needs a <em>migration</em>: the steps that turn a version 1 file into a version 2 file. If it has none, it throws an <code>IllegalStateException</code>, and the app crashes as soon as it opens the database, for every user who updates.</p>
<p>For a simple change like a new column, Room can write the migration: <code>autoMigrations = [AutoMigration(from = 1, to = 2)]</code>. It compares the <em>schemas</em> of the two versions: the description of every table and column, which the Room Gradle plugin saves as a file at each build. The plugin from “Opening the database” already saved <code>1.json</code> when version 1 was built, and this build adds <code>2.json</code>. The rows already there need a value for the new column, so give it a default in the database: <code>@ColumnInfo(defaultValue = "0")</code>. A Kotlin default, <code>= 0</code>, only helps when your code makes a new <code>Step</code>.</p>
<p>When Room can’t work a change out from the schemas, write the migration yourself. <code>object : Migration(1, 2) { ... }</code> makes one object of a class that extends <code>Migration</code>, without naming that class. Its <code>migrate</code> function gets a <code>SQLiteConnection</code>, and <code>connection.executeSQL("...")</code> runs your SQL. Add it to the builder with <code>.addMigrations(...)</code>.</p>`,
        visual(el) {
          const detail = mins => `<div class="ui-m-bar">← Pancakes</div><div class="ui-m-body"><div class="ui-m-row"><div>1. Mix flour and eggs${mins ? ' · ' + mins[0] : ''}</div></div><div class="ui-m-row"><div>2. Fry for 2 minutes${mins ? ' · ' + mins[1] : ''}</div></div><span class="ui-m-muted">80 recipes</span></div>`;
          const updating = '<div class="ui-m-center"><div class="ui-m-spin"></div><span class="ui-m-muted">Installing update…</span></div>';
          Lab.ui.phone(el, {
            logTitle: 'recipes.db',
            predict: {
              q: 'Version 2 says <code>version = 2</code> but has no migration. What happens on Lin’s phone after the update?',
              options: ['The app crashes when it opens the database', 'Room deletes the old file and starts empty', 'Room adds the column on its own'],
              a: 0,
              why: 'Room finds no way from version 1 to 2, so it throws an <code>IllegalStateException</code>.',
            },
            frames: [
              { screen: detail(null), log: 'app version 1 · file version 1', say: 'Lin’s phone: version 1 of the app, 80 recipes in <code>recipes.db</code>.' },
              { screen: updating, log: 'update installed: code says version 2, file is still version 1', say: 'The update replaces the code. The database file stays exactly as it was.' },
              { screen: '<div class="ui-m-scrim"><div class="ui-m-dialog"><b>Recipes keeps stopping</b><span class="ui-m-muted">Close app</span></div></div>', log: 'no migration 1 → 2: IllegalStateException', say: 'Without a migration, Room has no way from 1 to 2 and throws. The app crashes at every start, because the first screen reads the database.' },
              { screen: updating, log: 'the fixed update: autoMigrations = [AutoMigration(from = 1, to = 2)]', say: 'The fixed version 2 ships with <code>AutoMigration(from = 1, to = 2)</code>.' },
              { screen: detail(['0 min', '0 min']), log: ['migration: ADD COLUMN minutes … DEFAULT 0', 'file is now version 2'], say: 'Room runs the migration once. Every old step gets <code>minutes = 0</code>, the default. All 80 recipes are still there.' },
              { screen: detail(['5 min', '2 min']), log: 'next start: file already version 2, nothing to do', say: 'Lin fills in the times. Next start the file is already version 2, so no migration runs.' },
            ],
          });
        },
        code: `@Entity(tableName = "steps")
data class Step(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val recipeId: Int,
    val number: Int,
    val text: String,
    @ColumnInfo(defaultValue = "0") val minutes: Int = 0,   // new in version 2
)

@Database(
    entities = [Recipe::class, Step::class],
    version = 2,                                            // was 1
    autoMigrations = [AutoMigration(from = 1, to = 2)],
)
abstract class RecipesDatabase : RoomDatabase() {
    abstract fun recipeDao(): RecipeDao
}

// The same change, written by hand (for changes Room can't work out itself):
val MIGRATION_1_2 = object : Migration(1, 2) {
    override suspend fun migrate(connection: SQLiteConnection) {
        connection.executeSQL("ALTER TABLE steps ADD COLUMN minutes INTEGER NOT NULL DEFAULT 0")
    }
}
// Room.databaseBuilder<RecipesDatabase>(context.applicationContext, "recipes.db")
//     .setDriver(AndroidSQLiteDriver())
//     .addMigrations(MIGRATION_1_2)
//     .build()

// No Gradle change: the Room plugin already saved schemas/…/1.json for version 1,
// and this build adds 2.json. AutoMigration compares the two. Commit both.`,
        remember: 'Change a table: raise version, and give Room a migration, AutoMigration for simple changes or Migration with your own SQL.',
        mistakes: [
          { title: 'A new NOT NULL column without a default', bad: `connection.executeSQL("ALTER TABLE steps ADD COLUMN minutes INTEGER NOT NULL")
// SQLite: Cannot add a NOT NULL column with default value NULL`, good: `connection.executeSQL("ALTER TABLE steps ADD COLUMN minutes INTEGER NOT NULL DEFAULT 0")`, why: 'The steps already in the table need a value for the new column. Without a default they would have none, and SQLite refuses (on some phones even when the table is empty), so the app crashes after the update.' },
        ],
        terms: [
          { term: 'migration', def: 'The steps that change a database file from one version to the next while keeping its rows.' },
          { term: 'schema', def: 'The description of a database: its tables, their columns and types. Room saves one file per version.' },
          { term: 'AutoMigration', def: '<code>AutoMigration(from = 1, to = 2)</code> in <code>@Database</code>: Room compares the two schemas and writes the migration.' },
          { term: 'Migration', def: 'A class whose <code>migrate</code> function runs your own SQL to go from one version to another.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Version 2 adds a column. Raise the version and let Room write the migration.', code: `@Database(
    entities = [Recipe::class, Step::class],
    version = [[2]],
    [[autoMigrations]] = [AutoMigration(from = 1, to = 2)],
)
abstract class RecipesDatabase : RoomDatabase() {
    abstract fun recipeDao(): RecipeDao
}`, why: 'The version number tells Room the file must change; <code>autoMigrations</code> says how.' },
          { type: 'bug', prompt: 'After the update, the app crashes. SQLite says “Cannot add a NOT NULL column with default value NULL”. Tap the wrong line.', code: `val MIGRATION_1_2 = object : Migration(1, 2) {
    override suspend fun migrate(connection: SQLiteConnection) {
        connection.executeSQL("ALTER TABLE steps ADD COLUMN minutes INTEGER NOT NULL")
    }
}`, bug: 2, fix: '        connection.executeSQL("ALTER TABLE steps ADD COLUMN minutes INTEGER NOT NULL DEFAULT 0")', why: 'Existing rows need a value for the new column. <code>DEFAULT 0</code> gives them one.' },
        ],
        quiz: [
          { q: 'When must you raise <code>version</code>?', options: ['Whenever a table or column changes', 'At every release of the app', 'Only when you add a whole new table'], a: 0, why: 'Any change to the shape of the database needs a new version and a migration.' },
          { q: 'Why does the new column need <code>@ColumnInfo(defaultValue = "0")</code>, and not only <code>= 0</code> in Kotlin?', options: ['The rows already in the file get their value from the database, and a Kotlin default lives only in your code', 'Kotlin defaults are not allowed in entities', 'It makes the column the primary key'], a: 0, why: 'The migration runs in the database; it never sees your Kotlin code.' },
          { q: 'What does <code>AutoMigration</code> compare to write the migration?', options: ['The saved schema files of the two versions', 'The recipes on the user’s phone', 'The old and the new app'], a: 0, why: 'That is why the schema files must exist for both versions.' },
        ],
        docs: [['Migrate your Room database', 'https://developer.android.com/training/data-storage/room/migrating-db-versions']],
      },

      {
        id: 'files',
        title: 'Files',
        tagline: 'Write a whole document into your app’s own folder, and read it back.',
        goals: ['Find your app’s private folders with <code>filesDir</code> and <code>cacheDir</code>', 'Write and read a text file away from the main thread', 'Say what happens to those files on uninstall and when space runs low'],
        level: 'intermediate', introduces: ['filesDir', 'cacheDir', 'readText'],
        body: `
<p>Sam wants all his recipes as plain text, to keep or print. That is one document: a file. In the budget tracker, <code>File("expenses.txt")</code> made a file in the folder the program ran from. An Android app can’t write just anywhere: it gets folders of its own.</p>
<p>Every <code>Context</code> has <code>filesDir</code>, a private folder for files the app keeps. <code>File(context.filesDir, "recipes.txt")</code> names a file in it. No other app can read it, you need no permission, and Android deletes it when the app is uninstalled. <code>cacheDir</code> is for files you can make again, such as a small copy of a photo for the list. Android may delete them when the phone runs low on space, so check <code>file.exists()</code> before you read one. DataStore and Room keep their files in the app’s private storage too, next to <code>filesDir</code>.</p>
<p><code>file.writeText(text)</code> replaces what is in the file; <code>file.readText()</code> reads the whole file as one <code>String</code>. A disk can be slow, on a cheap phone a lot slower than you think, so do file work away from the main thread: inside <code>withContext(Dispatchers.IO) { ... }</code>, in a coroutine started by the click.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 320,
            predict: {
              q: 'The phone runs low on space. Which file may Android delete on its own?',
              options: ['<code>cake-small.jpg</code> in cache', '<code>recipes.txt</code> in files', '<code>recipes.db</code>'],
              a: 0,
              why: 'Only <code>cacheDir</code> is for files you can make again. Android may empty it to free space.',
            },
            nodes: [
              { id: 'root', label: 'com.example.recipes<small>the app’s private folder</small>', x: 50, y: 8, tone: 'warm' },
              { id: 'files', label: 'files', x: 18, y: 42 },
              { id: 'cache', label: 'cache', x: 50, y: 42 },
              { id: 'dbs', label: 'databases', x: 82, y: 42 },
              { id: 'ds', label: 'datastore<small>settings</small>', x: 12, y: 74, tone: 'muted' },
              { id: 'txt', label: 'recipes.txt', x: 30, y: 92, tone: 'ok', hidden: true },
              { id: 'img', label: 'cake-small.jpg', x: 55, y: 74, tone: 'ok', hidden: true },
              { id: 'db', label: 'recipes.db', x: 84, y: 74, tone: 'muted' },
            ],
            frames: [
              { add: [['root', 'files'], ['root', 'cache'], ['root', 'dbs'], ['files', 'ds'], ['dbs', 'db']], say: 'The app’s private storage. DataStore keeps its file inside <code>files</code>, and Room keeps <code>recipes.db</code> in <code>databases</code>, next to it.' },
              { show: ['txt'], add: [['files', 'txt', 'filesDir', 'ok']], hl: ['txt'], say: 'Export writes <code>File(filesDir, "recipes.txt")</code>. It stays until the app deletes it or is uninstalled.' },
              { show: ['img'], add: [['cache', 'img', 'cacheDir', 'ok']], hl: ['img'], say: 'A small copy of a photo, which the app can make again, goes in <code>cacheDir</code>.' },
              { gone: ['img'], say: 'The phone runs low on space. Android may delete cache files without asking, so check <code>exists()</code> before reading one.' },
              { hl: ['txt'], say: '<code>readText()</code> reads <code>recipes.txt</code> back as one <code>String</code>. It was never at risk.' },
              { gone: ['root', 'files', 'cache', 'dbs', 'ds', 'txt', 'db'], say: 'The user uninstalls the app. The whole private folder goes: files, settings and database alike.' },
            ],
          });
        },
        code: `fun exportText(recipes: List<Recipe>): String {
    var text = ""
    for (recipe in recipes) {
        text += "\${recipe.title}: \${recipe.minutes} min\\n"   // "Pancakes: 20 min"
    }
    return text
}

suspend fun saveExport(folder: File, recipes: List<Recipe>) {
    withContext(Dispatchers.IO) {                       // disk work, off the main thread
        File(folder, "recipes.txt").writeText(exportText(recipes))
    }
}

suspend fun readExport(folder: File): String = withContext(Dispatchers.IO) {
    val file = File(folder, "recipes.txt")
    if (file.exists()) file.readText() else ""
}

@Composable
fun ExportButton(folder: File, recipes: List<Recipe>) {
    val scope = rememberCoroutineScope()
    Button(onClick = { scope.launch { saveExport(folder, recipes) } }) {
        Text("Export recipes")
    }
}

// recipes: the list RecipeList collected from Room.
// filesDir is a property of every Context: MainActivity passes it down to RecipeList,
// and RecipeList shows ExportButton(folder = folder, recipes = recipes).`,
        remember: 'filesDir keeps files until uninstall; cacheDir may be emptied by Android; read and write inside withContext(Dispatchers.IO).',
        mistakes: [
          { title: 'A file name without a folder', bad: `File("recipes.txt").writeText(text)`, good: `File(context.filesDir, "recipes.txt").writeText(text)`, why: 'On a computer, a bare name means the folder the program runs from. An Android app may not write there, so this throws an exception. Always start from one of the app’s own folders.' },
        ],
        terms: [
          { term: 'filesDir', def: 'A property of every <code>Context</code>: the app’s private folder for files it keeps. Deleted on uninstall.' },
          { term: 'cacheDir', def: 'The app’s private folder for files it can make again. Android may delete them when space runs low.' },
          { term: 'readText', def: '<code>file.readText()</code> reads the whole file as one <code>String</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Write the export away from the main thread.', code: `suspend fun saveExport(folder: File, text: String) {
    withContext(Dispatchers.[[IO]]) {
        File(folder, "recipes.txt").[[writeText]](text)
    }
}`, why: '<code>Dispatchers.IO</code> is for waiting on the disk; <code>writeText</code> writes the text into the file.' },
          { type: 'bug', prompt: 'Some days the export is gone, though Sam never deleted it. Tap the line that picked the wrong folder.', code: `// MainActivity, in onCreate: the folder is passed down to RecipeList
val folder = cacheDir
setContent { RecipeList(dao = dao, folder = folder) }`, bug: 1, fix: 'val folder = filesDir', why: 'Android may empty <code>cacheDir</code> when space runs low. A file the user wants to keep belongs in <code>filesDir</code>.' },
        ],
        quiz: [
          { q: 'Which apps can read <code>File(context.filesDir, "recipes.txt")</code>?', options: ['Only your app', 'Every app with a storage permission', 'Every app'], a: 0, why: '<code>filesDir</code> is private to your app.' },
          { q: 'What happens to files in <code>filesDir</code> when the user uninstalls the app?', options: ['They are deleted', 'They stay for the next install', 'They move to Downloads'], a: 0, why: 'The whole private folder goes with the app.' },
          { q: 'Why does <code>writeText</code> run inside <code>withContext(Dispatchers.IO)</code>?', options: ['Writing to disk can be slow, and the main thread must keep drawing the screen', '<code>writeText</code> works only there', 'It keeps the file private'], a: 0, why: 'On the main thread a slow write would freeze the screen.' },
        ],
        docs: [['Access app-specific files', 'https://developer.android.com/training/data-storage/app-specific']],
      },

      {
        id: 'share-files',
        title: 'Sharing files',
        tagline: 'Hand one file to another app without opening your whole folder.',
        goals: ['Explain why another app can’t open a file in your <code>filesDir</code>', 'Set up <code>FileProvider</code> and get a <code>content://</code> address for one file', 'Share the file with <code>ACTION_SEND</code> and a temporary read permission'],
        level: 'intermediate', introduces: ['FileProvider', 'getUriForFile', 'ACTION_SEND', 'EXTRA_STREAM', 'addFlags', 'FLAG_GRANT_READ_URI_PERMISSION', 'createChooser', 'mkdirs', 'authorities', 'grantUriPermissions'],
        body: `
<p>Sam taps Share to mail <code>recipes.txt</code> to Lin. The mail app is another app, and <code>filesDir</code> is closed to it. Telling it where the file is doesn’t help: it isn’t allowed to open that folder.</p>
<p><code>FileProvider</code>, part of Jetpack’s core library (already in every new project), is a ready-made <code>provider</code>, the kind of component that shares data with other apps. You list it in the manifest with an <em>authority</em>, a unique name for it: your app’s id plus <code>.fileprovider</code>. A small file, <code>res/xml/file_paths.xml</code>, lists the folders it may share: <code>&lt;files-path name="exports" path="exports/" /&gt;</code> means the folder <code>exports</code> inside <code>filesDir</code>, and nothing else.</p>
<p><code>FileProvider.getUriForFile(this, "com.example.recipes.fileprovider", file)</code> gives a <code>content://</code> <code>Uri</code> for the file, like <code>content://com.example.recipes.fileprovider/exports/recipes.txt</code>. It names the file without showing where it really is. Put it in an <code>Intent(Intent.ACTION_SEND)</code> under <code>Intent.EXTRA_STREAM</code>, with the file’s type, <code>"text/plain"</code>.</p>
<p>The <code>Uri</code> alone opens nothing. <code>addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)</code> lets the app that receives the intent read this one file, for a while: the permission ends by itself when that app’s task is finished. <code>Intent.createChooser(send, null)</code> shows the share sheet, so the user picks the app.</p>`,
        visual(el) {
          const list = '<div class="ui-m-bar">Recipes</div><div class="ui-m-body"><div class="ui-m-row"><div>Omelette · 10 min</div></div><div class="ui-m-row"><div>Pancakes · 20 min</div></div><span class="ui-m-btn share">Share recipes</span></div>';
          const sheet = list + '<div class="ui-m-sheet"><b>Share with</b><span><span class="ui-m-chip mail">Mail</span> <span class="ui-m-chip">Messages</span> <span class="ui-m-chip">Notes</span></span></div>';
          const mail = extra => `<div class="ui-m-bar">New mail</div><div class="ui-m-body"><div class="ui-m-field on">To: Lin</div><div class="ui-m-card"><b>Attachment</b><span class="ui-m-muted">recipes.txt</span></div></div>${extra || ''}`;
          Lab.ui.phone(el, {
            logTitle: 'Recipes and Mail',
            predict: {
              q: 'The intent carries the <code>Uri</code>, but no <code>FLAG_GRANT_READ_URI_PERMISSION</code>. Can the mail app read the file?',
              options: ['No, it is refused', 'Yes, the Uri is enough', 'Yes, but only the file name'],
              a: 0,
              why: 'The flag is the permission. Without it, FileProvider refuses every other app.',
            },
            frames: [
              { screen: list, tap: '.share', log: 'saveExport → files/exports/recipes.txt', say: 'Sam taps Share. The app first writes <code>recipes.txt</code> into the <code>exports</code> folder of <code>filesDir</code>.' },
              { log: 'getUriForFile → content://com.example.recipes.fileprovider/exports/recipes.txt', say: '<code>FileProvider</code> gives a <code>content://</code> Uri. It names the file without showing its real place.' },
              { screen: sheet, log: 'startActivity(Intent.createChooser(send, null))', say: 'The share sheet lists apps that accept <code>ACTION_SEND</code> with <code>text/plain</code>.' },
              { tap: '.mail', screen: mail(), log: ['Mail opens the Uri: allowed by FLAG_GRANT_READ_URI_PERMISSION', 'FileProvider hands over recipes.txt'], say: 'Sam picks Mail. Mail opens the Uri, the flag lets it read, and the file is attached.' },
              { log: 'Mail can read this one file, nothing else in your folder', say: 'The permission covers this one Uri. The rest of the private folder stays closed, settings and database included.' },
              { screen: mail('<div class="ui-m-snack">Couldn’t attach the file</div>'), log: 'without the flag: Mail gets a SecurityException', say: 'Forget the flag and Mail is refused: it gets a <code>SecurityException</code>, and most apps show an error like this one.' },
            ],
          });
        },
        code: `<!-- AndroidManifest.xml, inside <application> -->
<provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="com.example.recipes.fileprovider"
    android:exported="false"
    android:grantUriPermissions="true">
    <meta-data
        android:name="android.support.FILE_PROVIDER_PATHS"
        android:resource="@xml/file_paths" />
</provider>

<!-- res/xml/file_paths.xml: only filesDir/exports may be shared -->
<paths>
    <files-path name="exports" path="exports/" />
</paths>

// Kotlin: write the export into filesDir/exports
suspend fun saveExport(folder: File, recipes: List<Recipe>): File = withContext(Dispatchers.IO) {
    val exports = File(folder, "exports")
    exports.mkdirs()                       // makes the folder if it isn't there yet
    val file = File(exports, "recipes.txt")
    file.writeText(exportText(recipes))
    file
}

// In MainActivity: share it
fun shareFile(file: File) {
    val uri = FileProvider.getUriForFile(this, "com.example.recipes.fileprovider", file)
    // content://com.example.recipes.fileprovider/exports/recipes.txt

    val send = Intent(Intent.ACTION_SEND)
    send.type = "text/plain"
    send.putExtra(Intent.EXTRA_STREAM, uri)
    send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)   // the receiver may read this one file
    startActivity(Intent.createChooser(send, null))
}

// The button: scope.launch { shareFile(saveExport(filesDir, recipes)) }`,
        remember: 'FileProvider turns one file in a listed folder into a content:// Uri; send it with ACTION_SEND and FLAG_GRANT_READ_URI_PERMISSION.',
        mistakes: [
          { title: 'A file outside the listed folders', bad: `val file = File(filesDir, "recipes.txt")
val uri = FileProvider.getUriForFile(this, "com.example.recipes.fileprovider", file)
// IllegalArgumentException: file_paths.xml lists only exports/`, good: `val file = File(File(filesDir, "exports"), "recipes.txt")
val uri = FileProvider.getUriForFile(this, "com.example.recipes.fileprovider", file)`, why: 'FileProvider gives Uris only for the folders in <code>file_paths.xml</code>. For any other file, <code>getUriForFile</code> throws an <code>IllegalArgumentException</code>.' },
        ],
        terms: [
          { term: 'FileProvider', def: 'A ready-made provider from Jetpack’s core library that gives other apps a <code>content://</code> Uri for one of your files.' },
          { term: 'authority', def: 'The unique name of a provider, like <code>com.example.recipes.fileprovider</code>. It is the first part of its Uris.' },
          { term: 'content Uri', def: 'An address like <code>content://…/exports/recipes.txt</code> that names a file through a provider, without its real place.' },
          { term: 'FLAG_GRANT_READ_URI_PERMISSION', def: 'A flag on an Intent that lets the receiving app read the Uri it carries, until that app’s task is finished.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Get a Uri for the file and put it in the share intent.', code: `val uri = FileProvider.[[getUriForFile]](this, "com.example.recipes.fileprovider", file)
val send = Intent(Intent.ACTION_SEND)
send.type = "text/plain"
send.putExtra(Intent.[[EXTRA_STREAM]], uri)
send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)`, why: '<code>getUriForFile</code> makes the <code>content://</code> Uri; <code>EXTRA_STREAM</code> is where <code>ACTION_SEND</code> expects a file.' },
          { type: 'bug', prompt: 'Sam taps Share and the app crashes with an <code>IllegalArgumentException</code>. The manifest says <code>android:authorities="com.example.recipes.fileprovider"</code>. Tap the wrong line.', code: `val folder = File(filesDir, "exports")
val file = File(folder, "recipes.txt")
val uri = FileProvider.getUriForFile(this, "com.example.recipes.files", file)
val send = Intent(Intent.ACTION_SEND)`, bug: 2, fix: 'val uri = FileProvider.getUriForFile(this, "com.example.recipes.fileprovider", file)', why: 'The authority in the code must be exactly the one in the manifest, or FileProvider can’t be found.' },
        ],
        quiz: [
          { q: 'What does <code>file_paths.xml</code> decide?', options: ['Which folders FileProvider may give Uris for', 'Where Room keeps the database', 'Which apps appear in the share sheet'], a: 0, why: 'Only files inside the listed folders can be shared.' },
          { q: 'How long can the mail app read the file?', options: ['Until its task is finished: the permission is temporary', 'Forever', 'Until your app closes'], a: 0, why: 'A permission from the Intent’s flag ends by itself.' },
          { q: 'Why not send the file’s real path?', options: ['Other apps can’t open your <code>filesDir</code>, so the path is no use to them', 'Paths are too long for an Intent', 'Intents can’t carry text'], a: 0, why: 'FileProvider opens the file for them, one Uri at a time.' },
        ],
        docs: [['Setting up file sharing', 'https://developer.android.com/training/secure-file-sharing/setup-sharing'], ['Sharing a file', 'https://developer.android.com/training/secure-file-sharing/share-file']],
      },

      {
        id: 'http-basics',
        title: 'Talking to a server',
        tagline: 'What a server, an HTTP request and JSON are, and how JSON becomes a Kotlin object.',
        goals: ['Explain what a server, an HTTP request and a response are', 'Read JSON: lists, objects and their keys', 'Turn JSON text into a Kotlin object with <code>@Serializable</code> and <code>Json</code>'],
        level: 'intermediate', introduces: ['GET', 'Json', 'decodeFromString'],
        body: `
<p>Ada has 40 recipes in the app on her phone. She buys a tablet and wants the same recipes there, and Sam would like her lemon pasta. A database on one phone can’t do that. The recipes have to live on a <em>server</em>: a computer on the internet that keeps data and answers the apps that ask for it.</p>
<p>Apps and servers talk with <em>HTTP</em>. The app sends a <em>request</em>: a method, such as <code>GET</code> (“give me”), and an address, the <em>URL</em>, such as <code>https://recipes.example.com/recipes</code>. The server sends back a <em>response</em>: a <em>status code</em> (200 means OK) and a body.</p>
<p>The body is text in <em>JSON</em>, a common format for data: <code>[{"id":1,"title":"Tomato soup","minutes":25}]</code>. Square brackets hold a list, curly braces hold one object, and each <code>"key": value</code> pair is one property. Text, because the app and the server may be written in different languages; both can read and write text.</p>
<p>To turn that text into Kotlin objects, use the kotlinx.serialization library. You met <code>@Serializable</code> on navigation routes; on a data class it also lets the class be read from JSON. <code>Json.decodeFromString&lt;RecipeDto&gt;(text)</code> reads the text and makes a <code>RecipeDto</code>: the type in <code>&lt; &gt;</code> says what to make, and each key fills the property with the same name. The class is called <code>RecipeDto</code>: a <em>DTO</em>, data transfer object, is the shape the server sends.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'app', label: 'Recipes app' },
              { id: 'reader', label: 'Json', sub: 'kotlinx.serialization' },
              { id: 'net', label: 'Internet' },
              { id: 'server', label: 'Server', sub: 'recipes.example.com' },
            ],
            predict: {
              q: 'The server has Ada’s recipes. What does it send back to the app?',
              options: ['Text in JSON', 'Ready-made Kotlin objects', 'A picture of the list'],
              a: 0,
              why: 'Apps and servers can be written in different languages, so they agree on text. kotlinx.serialization turns that text into Kotlin objects.',
            },
            frames: [
              { say: 'The app, a JSON reader, the internet and the server. The app wants Ada’s recipes.' },
              { at: 'net', packet: 'GET /recipes', say: 'The app sends a request: method <code>GET</code>, URL <code>https://recipes.example.com/recipes</code>.' },
              { at: 'server', packet: 'GET /recipes', mark: { server: 'ok' }, say: 'The request travels over the internet: a fraction of a second on good Wi-Fi, a few seconds on a weak signal. The server finds Ada’s recipes.' },
              { at: 'net', packet: '200 [{"id":1,…}]', tone: 'ok', say: 'The response comes back: status 200, which means OK, and a body of plain text: <code>[{"id":1,"title":"Tomato soup","minutes":25}, …]</code>.' },
              { at: 'reader', packet: 'List&lt;RecipeDto&gt;', tone: 'ok', say: '<code>Json.decodeFromString</code> reads the text. Each key fills the property with the same name: <code>RecipeDto(id=1, title=Tomato soup, minutes=25)</code>.' },
              { at: 'app', packet: '3 recipes', tone: 'ok', mark: { app: 'ok' }, say: 'The app now has a list of Kotlin objects it can show, three recipes.' },
            ],
          });
        },
        code: `// app/build.gradle.kts. The serialization plugin is already there from navigation;
// its version is your project's Kotlin version:
// plugins {
//     kotlin("plugin.serialization") version "2.4.21"
// }
// dependencies {
//     implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")
// }

@Serializable
data class RecipeDto(val id: Int, val title: String, val minutes: Int)

fun readRecipe(text: String): RecipeDto = Json.decodeFromString<RecipeDto>(text)

fun readRecipes(text: String): List<RecipeDto> = Json.decodeFromString<List<RecipeDto>>(text)

// text from the server:   {"id":1,"title":"Tomato soup","minutes":25}
// readRecipe(text) gives:  RecipeDto(id=1, title=Tomato soup, minutes=25)
// readRecipe(text).minutes is 25

// a list from the server: [{"id":1,"title":"Tomato soup","minutes":25},{"id":2,"title":"Lemon pasta","minutes":15}]
// readRecipes(text).size is 2`,
        remember: 'A server answers HTTP requests with a status code and a JSON body; @Serializable and Json.decodeFromString turn that JSON into Kotlin objects.',
        terms: [
          { term: 'server', def: 'A computer on the internet that keeps data and answers requests from apps.' },
          { term: 'HTTP', def: 'How apps and servers talk. A request has a method (<code>GET</code>, …) and a URL; a response has a status code (200 means OK) and a body.' },
          { term: 'JSON', def: 'A text format for data: <code>[ ]</code> holds a list, <code>{ }</code> holds an object made of <code>"key": value</code> pairs.' },
          { term: 'DTO', def: 'Data transfer object: a class with the shape the server sends, like <code>RecipeDto</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let the class be read from JSON, and read one recipe from the server’s text.', code: `@[[Serializable]]
data class RecipeDto(val id: Int, val title: String, val minutes: Int)

fun readRecipe(text: String): RecipeDto = Json.[[decodeFromString]]<RecipeDto>(text)`, why: '<code>@Serializable</code> lets kotlinx.serialization read the class; <code>decodeFromString</code> turns the text into a <code>RecipeDto</code>.' },
          { type: 'bug', prompt: 'The server sends a list, <code>[{"id":1,…},{"id":2,…}]</code>, but the reader fails: it expected one object. Tap the wrong line.', code: `@Serializable
data class RecipeDto(val id: Int, val title: String, val minutes: Int)

fun readRecipes(text: String): List<RecipeDto> = Json.decodeFromString<RecipeDto>(text)`, bug: 3, fix: 'fun readRecipes(text: String): List<RecipeDto> = Json.decodeFromString<List<RecipeDto>>(text)', why: 'Square brackets hold a list, so the type in <code>&lt; &gt;</code> must be <code>List&lt;RecipeDto&gt;</code>, not one <code>RecipeDto</code>.' },
        ],
        quiz: [
          { q: 'The server answers with status code 200. What does that mean?', options: ['OK: the body has what you asked for', 'The server is busy', '200 recipes are on the way'], a: 0, why: '200 is the code for success. The data is in the body.' },
          { q: 'In JSON, what do square brackets <code>[ ]</code> hold?', options: ['A list', 'One object', 'A comment'], a: 0, why: 'Square brackets hold a list; curly braces hold one object.' },
          { q: 'Reading <code>{"id":1,"title":"Tomato soup","minutes":25}</code>, which property does the key <code>"title"</code> fill?', options: ['<code>title</code>, the property with the same name', 'The first property, <code>id</code>', 'None: keys are only labels'], a: 0, why: 'Each key fills the property with the same name.' },
        ],
        docs: [['Serialization', 'https://kotlinlang.org/docs/serialization.html'], ['Get started with serialization', 'https://kotlinlang.org/docs/serialization-get-started.html']],
      },

      {
        id: 'retrofit',
        title: 'Calling a server with Retrofit',
        tagline: 'Describe the server’s requests as an interface, and let Retrofit send them.',
        goals: ['Describe a server call as a Retrofit interface with <code>@GET</code>', 'Build one <code>RecipeApi</code> with a base URL and a JSON converter', 'Call it from <code>LaunchedEffect</code> and show the recipes'],
        level: 'intermediate', introduces: ['Retrofit', 'baseUrl', 'addConverterFactory', 'asConverterFactory', 'toMediaType', 'INTERNET'],
        body: `
<p>The last lesson read the server’s JSON. Something still has to send the request, wait for the answer and hand over its body. Doing that by hand takes a lot of code for every call. <em>Retrofit</em> is a library that writes it for you, from an interface.</p>
<p><code>@GET("recipes") suspend fun getRecipes(): List&lt;RecipeDto&gt;</code> says “send GET to recipes, and give me a list back”. <code>Retrofit.Builder()</code>, a builder like the one in the patterns track, takes the <code>baseUrl</code> that every address starts with; it must end with <code>/</code>. <code>create(RecipeApi::class.java)</code> writes the code behind the interface; <code>RecipeApi::class.java</code> names the interface itself.</p>
<p>The builder also needs a converter, which reads each body: <code>Json.asConverterFactory(...)</code> hands it the <code>Json</code> reader from the last lesson. Call <code>api.getRecipes()</code> from a coroutine, such as the block of <code>LaunchedEffect</code>. Retrofit waits for the network on its own threads, so you need no <code>withContext</code> and the screen never freezes.</p>
<p>Last, the app needs the <code>INTERNET</code> permission: one line in the manifest, granted when the app is installed, with no dialog.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'app', label: 'Recipes app', sub: 'LaunchedEffect' },
              { id: 'retro', label: 'Retrofit', sub: 'RecipeApi' },
              { id: 'net', label: 'Internet' },
              { id: 'server', label: 'Server', sub: 'recipes.example.com' },
            ],
            predict: {
              q: 'The base URL is <code>https://recipes.example.com/</code> and the function says <code>@GET("recipes")</code>. Which address does Retrofit ask?',
              options: ['<code>https://recipes.example.com/recipes</code>', '<code>https://recipes.example.com/</code>', '<code>recipes</code>'],
              a: 0,
              why: 'Retrofit puts the path from <code>@GET</code> after the base URL.',
            },
            frames: [
              { at: 'app', packet: 'getRecipes()', say: 'The screen appears and <code>LaunchedEffect</code> calls <code>api.getRecipes()</code>. The coroutine waits here; the screen keeps working.' },
              { at: 'retro', packet: 'GET /recipes', say: 'Retrofit reads <code>@GET("recipes")</code>, puts it after the base URL and builds the request: GET <code>https://recipes.example.com/recipes</code>.' },
              { at: 'server', packet: 'GET /recipes', mark: { server: 'ok' }, say: 'Retrofit sends it over the internet, on its own threads. The server answers: status 200 and a JSON body.' },
              { at: 'net', packet: '200 [{"id":1,…}]', tone: 'ok', say: 'The response comes back as plain text.' },
              { at: 'retro', packet: 'List&lt;RecipeDto&gt;', tone: 'ok', say: 'The converter reads the body with <code>Json</code>, as in the last lesson, and makes a <code>List&lt;RecipeDto&gt;</code>.' },
              { at: 'app', packet: '3 recipes', tone: 'ok', mark: { app: 'ok' }, say: '<code>getRecipes()</code> returns the list and the coroutine goes on. The new state redraws the screen with three recipes.' },
            ],
          });
        },
        code: `// app/build.gradle.kts:
// dependencies {
//     implementation("com.squareup.retrofit2:retrofit:3.0.0")
//     implementation("com.squareup.retrofit2:converter-kotlinx-serialization:3.0.0")
// }
// AndroidManifest.xml, inside <manifest>:
// <uses-permission android:name="android.permission.INTERNET" />

interface RecipeApi {
    @GET("recipes")                        // GET https://recipes.example.com/recipes
    suspend fun getRecipes(): List<RecipeDto>
}

val api: RecipeApi = Retrofit.Builder()
    .baseUrl("https://recipes.example.com/")
    // reads each body with Json; "application/json".toMediaType() says the body is JSON
    .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
    .build()
    .create(RecipeApi::class.java)

@Composable
fun ServerRecipes(api: RecipeApi) {
    var recipes by remember { mutableStateOf(listOf<RecipeDto>()) }   // empty at first
    LaunchedEffect(Unit) {
        recipes = api.getRecipes()         // waits for the server; the screen keeps working
    }
    LazyColumn {
        items(recipes) { recipe ->
            Text("\${recipe.title} · \${recipe.minutes} min")         // Tomato soup · 25 min
        }
    }
}`,
        remember: 'Retrofit turns an interface into HTTP requests: @GET names the path, baseUrl ends with /, and the converter reads the JSON.',
        mistakes: [
          { title: 'Forgetting the INTERNET permission', bad: `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application ...>
        ...
    </application>
</manifest>
// the call fails, for example: SecurityException: Permission denied (missing INTERNET permission?)`, good: `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <application ...>
        ...
    </application>
</manifest>`, why: 'Without <code>INTERNET</code> in the manifest, Android doesn’t let the app use the network at all. It is a normal permission: one line, and no dialog for the user.' },
        ],
        terms: [
          { term: 'Retrofit', def: 'A library that turns an interface with <code>@GET</code> and friends into HTTP requests.' },
          { term: 'base URL', def: 'The start of every address, like <code>https://recipes.example.com/</code>. Retrofit puts each path after it, so it must end with <code>/</code>.' },
          { term: 'converter', def: 'The part of Retrofit that turns a JSON body into Kotlin objects, here with <code>Json</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Ask the server for the list without freezing the screen.', code: `interface RecipeApi {
    @[[GET]]("recipes")
    [[suspend]] fun getRecipes(): List<RecipeDto>
}`, why: '<code>@GET</code> names the request, and <code>suspend</code> lets the coroutine wait for the answer.' },
          { type: 'bug', prompt: 'The app crashes at start with <code>IllegalArgumentException: baseUrl must end in /: https://recipes.example.com/api</code>. Tap the wrong line.', code: `val api: RecipeApi = Retrofit.Builder()
    .baseUrl("https://recipes.example.com/api")
    .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
    .build()
    .create(RecipeApi::class.java)`, bug: 1, fix: '    .baseUrl("https://recipes.example.com/api/")', why: 'Retrofit puts each path, like <code>recipes</code>, after the base URL. For that to work, the base URL must end with <code>/</code>.' },
        ],
        quiz: [
          { q: 'Why is <code>getRecipes()</code> a <code>suspend</code> function?', options: ['So the coroutine can wait for the server without freezing the screen', 'So the request travels faster', 'Because it returns a list'], a: 0, why: 'A server answer can take seconds. A suspend function lets the coroutine wait while the screen keeps working.' },
          { q: 'What does <code>create(RecipeApi::class.java)</code> do?', options: ['Writes the code behind the interface and gives you an object to call', 'Sends the first request', 'Downloads the recipes'], a: 0, why: 'You only write the interface. Retrofit makes the object that sends the requests.' },
          { q: 'Does the user see a dialog for the <code>INTERNET</code> permission?', options: ['No: it is granted when the app is installed', 'Yes, the first time the app goes online', 'Yes, every time the app opens'], a: 0, why: 'It is a normal permission. One line in the manifest is enough.' },
        ],
        docs: [['Connect to the network', 'https://developer.android.com/develop/connectivity/network-ops/connecting'], ['Retrofit', 'https://square.github.io/retrofit/']],
      },

      {
        id: 'net',
        title: 'Requests and errors',
        tagline: 'No signal, a broken server, odd JSON: show a message, not a crash.',
        goals: ['Name the three ways a server call fails', 'Catch them and show a message instead of crashing', 'Let the user try again'],
        level: 'intermediate', introduces: ['IOException', 'HttpException', 'SerializationException', 'ignoreUnknownKeys'],
        body: `
<p>Ada opens the Recipes app on the metro, between two stations. <code>api.getRecipes()</code> can’t reach the server and throws an exception. Nothing catches it, so the app crashes. A network call can always fail, so every call needs a plan for when it does.</p>
<p>A call fails in three ways. No connection, or no answer in time: an <code>IOException</code>. Its relatives, like <code>UnknownHostException</code> (the phone can’t even find the server), count too, so one <code>catch (e: IOException)</code> catches them all. A missing <code>INTERNET</code> permission can also look like no connection, so if every call fails, check the manifest first. The server answered, but not with success: Retrofit throws an <code>HttpException</code>, and <code>e.code()</code> gives the status code. Codes in the 200s mean success, the 400s mean the request was wrong (404: not found), the 500s mean the server had a problem. Last, the answer arrived but its JSON doesn’t fit your class: a <code>SerializationException</code>.</p>
<p>Catch the three where you call, and turn each into a state the screen can show. A sealed interface, as in the Kotlin track, fits: <code>Loading</code>, <code>Ready</code> with the list, or <code>Failed</code> with a message. A “Try again” button adds 1 to <code>attempt</code>, the key of <code>LaunchedEffect</code>, so the call starts again.</p>
<p>One <code>SerializationException</code> is common: the server adds a key, say <code>"author"</code>, that <code>RecipeDto</code> doesn’t have. By default the reader refuses keys it doesn’t know. <code>Json { ignoreUnknownKeys = true }</code> makes a reader that skips them, so a newer server doesn’t break older apps. Pass it to the converter in place of <code>Json</code>.</p>`,
        visual(el) {
          const bar = '<div class="ui-m-bar">Recipes</div>';
          const loading = bar + '<div class="ui-m-center"><span class="ui-m-spin"></span><span class="ui-m-muted">Loading…</span></div>';
          const failed = msg => bar + `<div class="ui-m-center"><b>${msg}</b><span class="ui-m-btn retry">Try again</span></div>`;
          const ready = bar + '<div class="ui-m-body"><div class="ui-m-row"><div>Tomato soup · 25 min</div></div><div class="ui-m-row"><div>Lemon pasta · 15 min</div></div><div class="ui-m-row"><div>Pancakes · 20 min</div></div></div>';
          Lab.ui.phone(el, {
            logTitle: 'What happens',
            predict: {
              q: 'Airplane mode is on. What does <code>api.getRecipes()</code> do?',
              options: ['Throws an <code>IOException</code>', 'Throws an <code>HttpException</code>', 'Returns an empty list'],
              a: 0,
              why: 'No answer arrives at all, so it is an <code>IOException</code>. An <code>HttpException</code> needs an answer from the server.',
            },
            frames: [
              { screen: loading, log: ['attempt = 0: LaunchedEffect(attempt) starts', 'state = Loading'], say: 'Airplane mode is on. The screen opens, the call starts, and the state is <code>Loading</code>.' },
              { screen: failed('Can’t reach the server. Check your connection.'), log: ['UnknownHostException, a kind of IOException', 'catch (e: IOException) → state = Failed'], say: 'The phone can’t find the server, so the call throws an <code>UnknownHostException</code>. The <code>catch</code> turns it into a message. No crash.' },
              { tap: '.retry', screen: loading, log: ['tap Try again: attempt 0 → 1', 'new key: the block starts again'], say: 'Ada turns airplane mode off and taps Try again. <code>attempt</code> changes, so <code>LaunchedEffect</code> runs its block again.' },
              { screen: failed('The server answered 500. Try again later.'), log: ['HttpException, e.code() = 500', 'state = Failed'], say: 'This time the server answers, but with 500: something broke on the server. Retrofit throws an <code>HttpException</code>, and <code>e.code()</code> is 500.' },
              { tap: '.retry', screen: loading, log: 'tap Try again: attempt 1 → 2', say: 'A moment later Ada tries again.' },
              { screen: ready, log: ['200 OK: 3 recipes', 'state = Ready(3 recipes)'], say: 'Status 200 and a list that fits <code>RecipeDto</code>. The state is <code>Ready</code> and the recipes appear.' },
            ],
          });
        },
        code: `sealed interface RecipesState {
    object Loading : RecipesState
    data class Ready(val recipes: List<RecipeDto>) : RecipesState
    data class Failed(val message: String) : RecipesState
}

suspend fun loadRecipes(api: RecipeApi): RecipesState {
    try {
        return RecipesState.Ready(api.getRecipes())
    } catch (e: IOException) {               // no connection, no answer in time
        return RecipesState.Failed("Can’t reach the server. Check your connection.")
    } catch (e: HttpException) {             // the server answered 404, 500, …
        return RecipesState.Failed("The server answered \${e.code()}. Try again later.")
    } catch (e: SerializationException) {    // the JSON doesn’t fit RecipeDto
        return RecipesState.Failed("The app couldn’t read the server’s answer.")
    }
}

@Composable
fun ServerRecipes(api: RecipeApi) {
    // <RecipesState>: the state may hold any of the three, not only Loading
    var state by remember { mutableStateOf<RecipesState>(RecipesState.Loading) }
    var attempt by remember { mutableStateOf(0) }
    LaunchedEffect(attempt) {                // a new attempt starts the call again
        state = RecipesState.Loading
        state = loadRecipes(api)
    }
    val current = state                      // a val, so Kotlin can smart cast it below
    when (current) {
        is RecipesState.Loading -> Text("Loading…")
        is RecipesState.Ready -> LazyColumn {
            items(current.recipes) { recipe -> Text("\${recipe.title} · \${recipe.minutes} min") }
        }
        is RecipesState.Failed -> Column {
            Text(current.message)
            Button(onClick = { attempt++ }) { Text("Try again") }
        }
    }
}

// A reader that skips keys RecipeDto doesn’t have, like a new "author":
val json = Json { ignoreUnknownKeys = true }
// in the builder: .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))`,
        remember: 'Catch IOException (no connection), HttpException (a failed status code) and SerializationException (JSON that doesn’t fit), and show each as a state.',
        mistakes: [
          { title: 'Catching every Exception', bad: `try {
    return RecipesState.Ready(api.getRecipes())
} catch (e: Exception) {
    return RecipesState.Failed("Something went wrong.")
}`, good: `try {
    return RecipesState.Ready(api.getRecipes())
} catch (e: IOException) {
    return RecipesState.Failed("Can’t reach the server. Check your connection.")
} catch (e: HttpException) {
    return RecipesState.Failed("The server answered \${e.code()}. Try again later.")
} catch (e: SerializationException) {
    return RecipesState.Failed("The app couldn’t read the server’s answer.")
}`, why: 'When the user leaves the screen, the coroutine is cancelled with a <code>CancellationException</code>. <code>catch (e: Exception)</code> catches that too, so a stopped call is treated as an error and the code goes on. Catching the three real failures also lets each message say what happened.' },
        ],
        terms: [
          { term: 'IOException', def: 'Thrown when the request gets no answer: no connection, server not found, or no answer in time.' },
          { term: 'HttpException', def: 'Thrown by Retrofit when the server answers with a status code outside the 200s. <code>e.code()</code> gives the code.' },
          { term: 'SerializationException', def: 'Thrown when the JSON doesn’t fit the class, for example a missing or unknown key.' },
          { term: 'status code', def: 'The number at the start of a response: 200s success, 400s a wrong request (404 not found), 500s a server problem.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn “no connection” and “bad status code” into messages.', code: `try {
    return RecipesState.Ready(api.getRecipes())
} catch (e: [[IOException]]) {
    return RecipesState.Failed("Can’t reach the server.")
} catch (e: [[HttpException]]) {
    return RecipesState.Failed("The server answered \${e.[[code]]()}.")
}`, why: '<code>IOException</code> means no answer arrived; <code>HttpException</code> means an answer with a failed status, which <code>code()</code> gives you.' },
          { type: 'bug', prompt: 'Since the server started sending <code>"author"</code> with every recipe, every load fails with a <code>SerializationException</code>. Tap the line to change.', code: `@Serializable
data class RecipeDto(val id: Int, val title: String, val minutes: Int)

val json = Json { ignoreUnknownKeys = false }`, bug: 3, fix: 'val json = Json { ignoreUnknownKeys = true }', why: 'With <code>ignoreUnknownKeys = true</code> the reader skips keys the class doesn’t have, so <code>"author"</code> no longer breaks it.' },
        ],
        quiz: [
          { q: 'The server answers 404. What does the suspend Retrofit call do?', options: ['Throws an <code>HttpException</code>', 'Throws an <code>IOException</code>', 'Returns an empty list'], a: 0, why: 'An answer arrived, but its status code isn’t in the 200s, so Retrofit throws an <code>HttpException</code>.' },
          { q: 'Which status codes mean success?', options: ['The 200s', 'The 400s', 'The 500s'], a: 0, why: '200s are success, 400s a wrong request, 500s a server problem.' },
          { q: 'Ada taps Try again, which runs <code>attempt++</code>. Why does the call run again?', options: ['<code>attempt</code> is the key of <code>LaunchedEffect</code>, and a new key restarts its block', 'The button calls <code>getRecipes()</code> itself', 'Every recomposition restarts <code>LaunchedEffect</code>'], a: 0, why: 'A new key stops the old block and starts it again from the top.' },
        ],
        docs: [['Retrofit', 'https://square.github.io/retrofit/'], ['JSON features: ignoring unknown keys', 'https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/json.md']],
      },

      {
        id: 'auth',
        title: 'Signing in',
        tagline: 'Sign in once, then let a short-lived token prove who you are.',
        goals: ['Explain what an access token and a refresh token are', 'Send the token with every request and refresh it when it runs out', 'Keep tokens where other apps can’t read them'],
        level: 'intermediate', introduces: ['POST', 'Body', 'Header'],
        body: `
<p>Now everyone has their own recipes on the server, so when the app asks for <code>recipes</code>, the server must know who is asking. Sending Ada’s email and password with every request would mean keeping her password on the phone, and a leaked password opens every account where she uses it. So the app signs in once and gets a <em>token</em> instead.</p>
<p>A token is a long, random-looking text the server hands out after sign-in. Like a cloakroom ticket, it proves you may have the coat without saying who you are. To sign in, the app sends a <code>POST</code> (“take this”) to <code>login</code>; <code>@Body</code> turns the <code>Login</code> object into JSON and sends it as the request body. The server answers with two tokens. The <em>access token</em> goes with every request in a <em>header</em>, an extra line of the request: <code>Authorization: Bearer</code> followed by the token. <code>@Header("Authorization")</code> puts a parameter there, so <code>getRecipes</code> now takes that text.</p>
<p>An access token is short-lived, often 15 minutes to an hour, so a stolen one is soon useless. When it has run out, the server answers 401. The app then sends the <em>refresh token</em> to <code>refresh</code>, gets a new pair, saves it, and repeats the call once. If the refresh is refused too, Ada has to sign in again.</p>
<p>Keep the tokens in DataStore, from the settings lesson: <code>Session</code> gets the same <code>dataStore</code>, as <code>SettingsStore</code> does. Its file is in the app’s own storage, which Android lets only your app read. <code>stringPreferencesKey</code> makes a key for a String, and <code>store.data.first()</code> reads the saved values once: <code>first()</code> takes the first value of a flow and stops. Never save the password, and never write tokens to Logcat.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'store', label: 'DataStore', sub: 'only this app' },
              { id: 'app', label: 'Recipes app', sub: 'Session' },
              { id: 'server', label: 'Server', sub: 'recipes.example.com' },
            ],
            predict: {
              q: 'Twenty minutes later the access token has run out, and the server answers 401. What should the app do first?',
              options: ['Send the refresh token to get a new access token', 'Ask Ada for her password again', 'Send the same request again'],
              a: 0,
              why: 'The refresh token exists for this moment. Ada only has to sign in again if the refresh is refused too.',
            },
            frames: [
              { at: 'server', packet: 'POST /login', say: 'Ada types her email and password once. The app sends them in the body of <code>POST login</code>.' },
              { at: 'app', packet: 'access + refresh', tone: 'ok', say: 'The server checks them and answers with two tokens. The app forgets the password right away.' },
              { at: 'store', packet: 'save tokens', tone: 'ok', mark: { store: 'ok' }, say: 'Both tokens go into DataStore, in the app’s own storage. Other apps can’t read them.' },
              { at: 'server', packet: 'GET + Bearer', tone: 'ok', say: 'Every call now carries <code>Authorization: Bearer</code> and the access token. The server answers 200 with Ada’s recipes.' },
              { at: 'app', packet: '401', tone: 'err', mark: { server: 'err' }, say: 'Twenty minutes later the access token has run out. The server answers 401, and Retrofit throws an <code>HttpException</code> with <code>code()</code> 401.' },
              { at: 'server', packet: 'POST /refresh', tone: 'warm', say: 'The app catches it and sends the refresh token to <code>refresh</code>.' },
              { at: 'store', packet: 'save new pair', tone: 'ok', mark: { server: 'ok' }, say: 'A new access token and refresh token arrive. They replace the old ones in DataStore.' },
              { at: 'app', packet: '200 recipes', tone: 'ok', mark: { app: 'ok' }, say: 'The app repeats the call once with the new access token: 200. Ada noticed nothing.' },
            ],
          });
        },
        code: `@Serializable
data class Login(val email: String, val password: String)

@Serializable
data class RefreshRequest(val refreshToken: String)

@Serializable
data class Tokens(val accessToken: String, val refreshToken: String)

interface RecipeApi {
    @POST("login")
    suspend fun login(@Body login: Login): Tokens

    @POST("refresh")
    suspend fun refresh(@Body request: RefreshRequest): Tokens

    @GET("recipes")
    suspend fun getRecipes(@Header("Authorization") auth: String): List<RecipeDto>
}

val ACCESS_TOKEN = stringPreferencesKey("access_token")
val REFRESH_TOKEN = stringPreferencesKey("refresh_token")

class Session(private val api: RecipeApi, private val store: DataStore<Preferences>) {
    suspend fun signIn(email: String, password: String) {
        save(api.login(Login(email, password)))     // the password is sent once, never saved
    }

    suspend fun getRecipes(): List<RecipeDto> {
        val saved = store.data.first()               // the saved values, read once
        try {
            return api.getRecipes("Bearer \${saved[ACCESS_TOKEN]}")
        } catch (e: HttpException) {
            if (e.code() != 401) throw e             // only “token ran out” is handled here
            // a 401 from refresh too means: show the sign-in screen
            val fresh = api.refresh(RefreshRequest(saved[REFRESH_TOKEN] ?: ""))
            save(fresh)
            return api.getRecipes("Bearer \${fresh.accessToken}")
        }
    }

    private suspend fun save(tokens: Tokens) {
        store.edit { settings ->
            settings[ACCESS_TOKEN] = tokens.accessToken
            settings[REFRESH_TOKEN] = tokens.refreshToken
        }
    }
}`,
        remember: 'Sign in once; send the access token in the Authorization header; on 401 refresh once and repeat; keep tokens in DataStore, never the password.',
        mistakes: [
          { title: 'Writing the token to Logcat', bad: `Log.d("Session", "signed in, token: \${tokens.accessToken}")`, good: `Log.d("Session", "signed in")`, why: 'Logs end up in bug reports and on other people’s screens. Whoever reads the token can act as Ada until it runs out.' },
        ],
        terms: [
          { term: 'token', def: 'A long random-looking text the server hands out after sign-in. It proves who is asking, without the password.' },
          { term: 'access token', def: 'The short-lived token sent with every request, in the header <code>Authorization: Bearer …</code>.' },
          { term: 'refresh token', def: 'A longer-lived token that only gets a new access token when the old one has run out.' },
          { term: 'header', def: 'An extra named line in a request or response, like <code>Authorization</code>. <code>@Header</code> fills one from a parameter.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Send the login as JSON in the body, and the token in a header.', code: `interface RecipeApi {
    @[[POST]]("login")
    suspend fun login(@[[Body]] login: Login): Tokens

    @GET("recipes")
    suspend fun getRecipes(@[[Header]]("Authorization") auth: String): List<RecipeDto>
}`, why: '<code>@POST</code> sends data, <code>@Body</code> turns the object into the JSON body, and <code>@Header</code> puts the token text in the <code>Authorization</code> header.' },
          { type: 'bug', prompt: 'Twenty minutes after sign-in, every load fails, even though the refresh token is still good. Tap the wrong line.', code: `try {
    return api.getRecipes("Bearer \${saved[ACCESS_TOKEN]}")
} catch (e: HttpException) {
    if (e.code() != 404) throw e
    val fresh = api.refresh(RefreshRequest(saved[REFRESH_TOKEN] ?: ""))
    save(fresh)
    return api.getRecipes("Bearer \${fresh.accessToken}")
}`, bug: 3, fix: '    if (e.code() != 401) throw e', why: 'A token that has run out gives 401. With 404 in the check, the 401 is thrown on and the refresh never happens.' },
        ],
        quiz: [
          { q: 'Why does the app keep a token instead of the password?', options: ['A token soon runs out and only works for this server; a password may open many accounts', 'Tokens are shorter to type', 'Servers can’t read passwords'], a: 0, why: 'A leaked token does little harm for a short time. A leaked password does much more.' },
          { q: 'The refresh request gets a 401 too. What now?', options: ['Show the sign-in screen', 'Refresh again and again', 'Keep using the old access token'], a: 0, why: 'Both tokens are no good any more, so Ada has to sign in again.' },
          { q: 'Where is a good place to keep the tokens?', options: ['DataStore, in the app’s own storage', 'In the code, as a <code>const val</code>', 'In a Logcat message'], a: 0, why: 'Android lets only your app read its own storage. Code and logs can be read by others.' },
        ],
        docs: [['Security tips', 'https://developer.android.com/privacy-and-security/security-tips']],
      },

      {
        id: 'caching',
        title: 'Caching',
        tagline: 'Show the saved recipes at once, and let the network only refresh them.',
        goals: ['Show saved recipes at once, even offline', 'Make the Room table the one place the screen reads from', 'Decide when the saved copy is too old'],
        level: 'intermediate', introduces: ['Upsert', 'longPreferencesKey'],
        body: `
<p>On the metro, with no signal, Ada opens the app to check the soup recipe she looked at an hour ago. With the code so far she sees “Can’t reach the server”: the list from the server lives only in memory while the screen is open. Yet the phone has a database. A copy of server data kept on the phone is called a <em>cache</em>.</p>
<p><em>Offline first</em> means the screen reads only from Room, the <code>getAll()</code> Flow from the live queries lesson, so saved recipes show at once, with or without a network. The network has one job: refresh the table. Download the recipes and write them with an <code>@Upsert</code> function: for each recipe, a row with the same id is updated, and a new id is inserted. Room’s Flow then sends the new list to the screen by itself. If the refresh fails, nothing is lost: the old copy stays on screen, with a small note.</p>
<p>The server’s shape, <code>RecipeDto</code>, and the table’s shape, <code>Recipe</code>, differ: <code>favorite</code> only exists on the phone. An extension function, <code>toRecipe(favorite)</code>, turns one into the other. The refresh looks up which recipes are favorites first, so a refresh never loses Ada’s stars. The ids come from the server now: Ada’s recipes are on her account, and a new recipe goes to the server first and comes back with the next refresh. So the table is a copy of the server’s list, and two recipes never share an id. (<code>autoGenerate</code> only picks an id when the id is 0; the server’s ids are never 0, so Room keeps them.)</p>
<p>When is the copy too old? Deciding that is called <em>cache invalidation</em>. A simple rule: refresh when the screen opens, but only if the last refresh was more than 15 minutes ago, and always when Ada taps Refresh. <code>System.currentTimeMillis()</code> gives the time now in milliseconds, as a <code>Long</code> (a whole number with room for big values); save it in DataStore with a <code>longPreferencesKey</code>. Recipes change rarely, so 15 minutes is plenty. A weather app would pick less.</p>`,
        visual(el) {
          const list = (rows, note) => '<div class="ui-m-bar">Recipes <span class="refresh" style="margin-left:auto">↻</span></div><div class="ui-m-body">' + rows.map(r => `<div class="ui-m-row"><div>${r}</div></div>`).join('') + '</div>' + (note ? `<div class="ui-m-snack">${note}</div>` : '');
          const old = ['Tomato soup · 25 min', 'Lemon pasta · 15 min', 'Pancakes · 20 min'];
          const fresh = ['Tomato soup · 20 min', 'Lemon pasta · 15 min', 'Pancakes · 20 min', 'Lentil curry · 35 min'];
          Lab.ui.phone(el, {
            logTitle: 'What happens',
            predict: {
              q: 'No signal. Yesterday the app saved 3 recipes in Room. What does Ada see when she opens it?',
              options: ['The 3 saved recipes, with a note that she is offline', 'A spinner until the signal comes back', '“Can’t reach the server” and no recipes'],
              a: 0,
              why: 'The screen reads only from Room, which is on the phone. The failed refresh only adds a note.',
            },
            frames: [
              { screen: list(old), log: 'getAll() → 3 recipes from Room', say: 'The screen reads the Room table, so yesterday’s recipes appear at once.' },
              { log: ['last refresh: 20 hours ago, more than 15 min', 'refresh: session.getRecipes()…'], say: '<code>LaunchedEffect</code> checks the time of the last refresh. 20 hours is too old, so it starts one.' },
              { screen: list(old, 'Offline: showing saved recipes'), log: 'IOException → keep the saved copy', say: 'No signal: the call throws an <code>IOException</code>. Nothing on screen is lost; a small note says the list may be old.' },
              { tap: '.refresh', screen: list(old), log: 'signal is back: Ada taps ↻ (force = true)', say: 'At the next station Ada taps Refresh. A tap always refreshes, whatever the time.' },
              { screen: list(fresh), log: ['200 OK: 4 recipes', 'upsertAll(4 recipes) → Room', 'getAll() sends the new list → screen redraws'], say: 'The refresh writes into Room: the soup is updated to 20 minutes, the curry is inserted. Room’s Flow sends the new list, and the screen redraws.' },
              { log: ['5 min later: screen opens again', 'last refresh: 5 min ago → skip'], say: 'Five minutes later the copy is fresh enough. No call, no waiting, no mobile data used.' },
            ],
          });
        },
        code: `@Dao
interface RecipeDao {
    @Query("SELECT * FROM recipes ORDER BY minutes")
    fun getAll(): Flow<List<Recipe>>

    @Upsert                                   // same id: update the row; new id: insert it
    suspend fun upsertAll(recipes: List<Recipe>)
}

fun RecipeDto.toRecipe(favorite: Boolean) =
    Recipe(id = id, title = title, minutes = minutes, favorite = favorite)

val LAST_REFRESH = longPreferencesKey("last_refresh")
const val MAX_AGE = 15 * 60 * 1000L           // 15 minutes in ms; the L makes it a Long

suspend fun refreshRecipes(session: Session, dao: RecipeDao, store: DataStore<Preferences>, force: Boolean) {
    val now = System.currentTimeMillis()
    val last = store.data.first()[LAST_REFRESH] ?: 0L
    if (!force && now - last < MAX_AGE) return   // the saved copy is fresh enough
    val fresh = session.getRecipes()             // throws when offline: the old copy stays
    val favorites = dao.getAll().first().filter { it.favorite }.map { it.id }
    dao.upsertAll(fresh.map { it.toRecipe(favorite = favorites.contains(it.id)) })
    store.edit { it[LAST_REFRESH] = now }
}

@Composable
fun RecipesScreen(dao: RecipeDao, session: Session, store: DataStore<Preferences>) {
    val recipesFlow = remember { dao.getAll() }
    val recipes by recipesFlow.collectAsStateWithLifecycle(initialValue = listOf())
    var note by remember { mutableStateOf("") }
    var taps by remember { mutableStateOf(0) }
    LaunchedEffect(taps) {                        // 0 when the screen opens, +1 per Refresh tap
        try {
            refreshRecipes(session, dao, store, force = taps > 0)
            note = ""
        } catch (e: IOException) {
            note = "Offline: showing saved recipes"
        } catch (e: HttpException) {
            note = "Server problem (\${e.code()}): showing saved recipes"
        } catch (e: SerializationException) {
            note = "Couldn’t read the server’s answer: showing saved recipes"
        }
    }
    // a Column with: Button(onClick = { taps++ }) { Text("Refresh") }, Text(note), the list of recipes
}`,
        remember: 'The screen reads only from Room; the network only refreshes Room, and only when the copy is too old or the user asks.',
        mistakes: [
          { title: 'Showing the server’s answer directly', bad: `LaunchedEffect(Unit) {
    recipes = session.getRecipes()   // offline: nothing to show
}`, good: `val recipesFlow = remember { dao.getAll() }
val recipes by recipesFlow.collectAsStateWithLifecycle(initialValue = listOf())
LaunchedEffect(Unit) {
    refreshRecipes(session, dao, store, force = false)   // writes into Room
}`, why: 'With two sources, the screen shows nothing when the network fails, and can disagree with the table. Read from Room only, and let the network write into Room.' },
        ],
        terms: [
          { term: 'cache', def: 'A copy of data kept close by, here server recipes saved in Room, so they can be shown without asking again.' },
          { term: 'offline first', def: 'The screen reads only from the local database; the network only refreshes that database.' },
          { term: '@Upsert', def: 'A Room DAO function that updates the row with the same primary key, or inserts the row if there is none.' },
          { term: 'cache invalidation', def: 'Deciding when the saved copy is too old and must be refreshed, for example after 15 minutes or when the user asks.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let the screen watch the table, and let a refresh update or insert recipes.', code: `@Dao
interface RecipeDao {
    @Query("SELECT * FROM recipes ORDER BY minutes")
    fun getAll(): [[Flow]]<List<Recipe>>

    @[[Upsert]]
    suspend fun upsertAll(recipes: List<Recipe>)
}`, why: 'A <code>Flow</code> sends a new list whenever the table changes. <code>@Upsert</code> updates rows with known ids and inserts new ones.' },
          { type: 'bug', prompt: 'The app never refreshes by itself: the list stays days old until Ada taps Refresh. Tap the wrong line.', code: `val now = System.currentTimeMillis()
val last = store.data.first()[LAST_REFRESH] ?: 0L
if (!force && now - last > MAX_AGE) return
val fresh = session.getRecipes()`, bug: 2, fix: 'if (!force && now - last < MAX_AGE) return', why: 'Skip the refresh only while the copy is younger than <code>MAX_AGE</code>. With <code>&gt;</code>, it skips exactly when the copy is old.' },
        ],
        quiz: [
          { q: 'In an offline-first app, where does the recipe screen read its list from?', options: ['The Room table', 'The server, and Room only when offline', 'Both, one after the other'], a: 0, why: 'One source for the screen: the table. The network only writes into it.' },
          { q: 'A refresh brings a recipe whose id is already in the table. What does <code>@Upsert</code> do?', options: ['Updates that row', 'Adds a second row with the same id', 'Throws an error'], a: 0, why: 'Same primary key: update. A new key: insert.' },
          { q: 'The last refresh was 5 minutes ago and <code>MAX_AGE</code> is 15 minutes. The screen opens. What happens?', options: ['No call: the saved recipes are shown', 'A full refresh', 'The table is emptied first'], a: 0, why: 'The copy is younger than <code>MAX_AGE</code>, so <code>refreshRecipes</code> returns early.' },
        ],
        docs: [['Build an offline-first app', 'https://developer.android.com/topic/architecture/data-layer/offline-first'], ['Accessing data using Room DAOs', 'https://developer.android.com/training/data-storage/room/accessing-data']],
      },

      {
        id: 'paging',
        title: 'Loading in pages',
        tagline: 'Twenty thousand recipes, twenty at a time, as the user scrolls.',
        goals: ['Explain why a long list loads in pages', 'Write a <code>PagingSource</code> that loads one page from the server', 'Show the pages in a <code>LazyColumn</code> with <code>collectAsLazyPagingItems</code>'],
        level: 'intermediate', introduces: ['PagingSource', 'LoadParams', 'LoadResult', 'prevKey', 'nextKey', 'getRefreshKey', 'PagingState', 'Pager', 'PagingConfig', 'pageSize', 'collectAsLazyPagingItems', 'itemCount', 'itemKey', 'loadState', 'LoadState'],
        body: `
<p>The new Explore tab shows recipes that everyone has shared: 20,000 of them. Downloading them all would take long and use a lot of mobile data and memory, and Ada reads maybe the first thirty. So the server hands out the list in <em>pages</em>: <code>explore?page=1</code> gives recipes 1 to 20, <code>page=2</code> the next 20. In Retrofit, <code>@Query("page") page: Int</code> adds <code>?page=2</code> to the URL. It shares its name with Room’s <code>@Query</code>, but it comes from Retrofit and does something else. Explore is public, so it needs no token.</p>
<p>Paging 3 is a Jetpack library that loads the next page when the user scrolls near the end. You write a <code>PagingSource&lt;Int, RecipeDto&gt;</code>: <code>Int</code> is the <em>key</em> that names a page, here the page number, and <code>RecipeDto</code> is the item. Its <code>load(params)</code> reads <code>params.key</code> (<code>null</code> on the first load, so start at 1), downloads that page, and returns <code>LoadResult.Page(data, prevKey, nextKey)</code>. <code>nextKey = null</code> means there are no more pages: <code>recipes.isEmpty()</code> is <code>true</code> when the page has no recipes, and then <code>nextKey = null</code>. A failure returns <code>LoadResult.Error(e)</code> instead of crashing. <code>getRefreshKey</code> says where to start when the list reloads; <code>null</code> means the first page.</p>
<p><code>Pager(PagingConfig(pageSize = 20)) { ExploreSource(api) }.flow</code> gives a Flow of pages. In the composable, <code>collectAsLazyPagingItems()</code> turns it into items for a <code>LazyColumn</code>: <code>items(count = items.itemCount, key = items.itemKey { it.id })</code>, then <code>items[index]</code> for each row. Reading a row near the end is what starts the next load. Paging loads ahead, by <code>pageSize</code> rows by default, so the next page is usually there before Ada reaches it. When a page fails, <code>items.loadState.append</code> is a <code>LoadState.Error</code>, and <code>items.retry()</code> tries that page again.</p>`,
        visual(el) {
          const rows = (from, to, extra = '') => '<div class="ui-m-bar">Explore</div><div class="ui-m-body">' + Array.from({ length: to - from + 1 }, (_, k) => `<div class="ui-m-row"><div>Recipe ${from + k}</div></div>`).join('') + extra + '</div>';
          Lab.ui.phone(el, {
            logTitle: 'Paging log',
            predict: {
              q: 'Page 1 (20 recipes) arrives, and the screen shows the first 8. Does Paging load page 2 before Ada scrolls?',
              options: ['Yes: fewer than 20 rows are left below the screen, so it loads ahead', 'No: it waits until she reaches recipe 20', 'No: it waits for a “More” button'],
              a: 0,
              why: 'Paging loads ahead by <code>pageSize</code> rows (20). Only 12 loaded rows are left below the screen, so page 2 starts at once.',
            },
            frames: [
              { screen: '<div class="ui-m-bar">Explore</div><div class="ui-m-center"><span class="ui-m-spin"></span></div>', log: 'load(key = null) → page = 1, GET explore?page=1', say: 'Explore opens. Paging calls <code>load</code> with key <code>null</code>, so the source asks for page 1.' },
              { screen: rows(1, 8), log: ['Page(20 recipes, prevKey = null, nextKey = 2)', 'on screen: 1–8 of 20'], say: 'Page 1 arrives with <code>nextKey = 2</code>. The screen shows the first 8 rows.' },
              { log: ['12 rows left below the screen, fewer than 20', 'load(key = 2) → Page(20, nextKey = 3): 40 loaded'], say: 'Fewer than 20 loaded rows are left below the screen, so Paging loads page 2 right away. Ada hasn’t scrolled yet.' },
              { screen: rows(21, 28), log: ['Ada scrolls: fewer than 20 rows left below the screen', 'load(key = 3) → Page(20, nextKey = 4): 60 loaded'], say: 'Ada scrolls down. Once fewer than 20 loaded rows are left below what she sees, page 3 loads while she reads.' },
              { screen: rows(53, 60, '<span class="ui-m-btn retry">Retry</span>'), log: ['load(key = 4): IOException', 'LoadResult.Error → loadState.append is LoadState.Error'], say: 'In a tunnel, page 4 fails. The source returns <code>LoadResult.Error</code>. The 60 rows stay, and the screen shows a Retry button.' },
              { tap: '.retry', screen: rows(53, 60), log: ['items.retry() → load(key = 4) → Page(20, nextKey = 5): 80 loaded'], say: 'Out of the tunnel, Ada taps Retry. <code>items.retry()</code> loads page 4 again.' },
              { log: ['… load(key = 1001) → empty page, nextKey = null', 'end of list: no more loads'], say: 'Much later, past page 1000, the server sends an empty page. <code>nextKey = null</code> tells Paging to stop asking.' },
            ],
          });
        },
        code: `interface RecipeApi {
    // ...
    @GET("explore")                                  // GET explore?page=2
    suspend fun explore(@Query("page") page: Int): List<RecipeDto>
}

class ExploreSource(private val api: RecipeApi) : PagingSource<Int, RecipeDto>() {
    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, RecipeDto> {
        val page = params.key ?: 1                   // null on the first load
        try {
            val recipes = api.explore(page)
            return LoadResult.Page(
                data = recipes,
                prevKey = null,                      // Explore only scrolls forward
                nextKey = if (recipes.isEmpty()) null else page + 1,
            )
        } catch (e: IOException) {
            return LoadResult.Error(e)
        } catch (e: HttpException) {
            return LoadResult.Error(e)
        } catch (e: SerializationException) {
            return LoadResult.Error(e)
        }
    }

    override fun getRefreshKey(state: PagingState<Int, RecipeDto>): Int? = null   // reload from page 1
}

@Composable
fun ExploreScreen(api: RecipeApi) {
    val pages = remember { Pager(PagingConfig(pageSize = 20)) { ExploreSource(api) }.flow }
    val items = pages.collectAsLazyPagingItems()
    LazyColumn {
        items(count = items.itemCount, key = items.itemKey { it.id }) { index ->
            val recipe = items[index]                // reading near the end loads the next page
            if (recipe != null) {
                Text("\${recipe.title} · \${recipe.minutes} min")
            }
        }
        if (items.loadState.append is LoadState.Error) {   // the next page failed
            item { Button(onClick = { items.retry() }) { Text("Retry") } }   // item: one extra row
        }
    }
}

// app/build.gradle.kts, from the Paging release page:
// implementation("androidx.paging:paging-runtime:3.5.3")
// implementation("androidx.paging:paging-compose:3.5.3")`,
        remember: 'A PagingSource loads one page per key and returns nextKey (null at the end); Pager plus collectAsLazyPagingItems loads more as the user scrolls.',
        mistakes: [
          { title: 'A new Pager on every recomposition', bad: `val items = Pager(PagingConfig(pageSize = 20)) { ExploreSource(api) }
    .flow.collectAsLazyPagingItems()`, good: `val pages = remember { Pager(PagingConfig(pageSize = 20)) { ExploreSource(api) }.flow }
val items = pages.collectAsLazyPagingItems()`, why: 'Without <code>remember</code>, every recomposition makes a new Pager, and the list starts over at page 1. <code>remember</code> keeps one Pager while the screen is shown.' },
        ],
        terms: [
          { term: 'page', def: 'One slice of a long list that the server sends at a time, such as recipes 21 to 40.' },
          { term: 'PagingSource', def: 'Your class that loads one page for a key and says which keys come before and after it.' },
          { term: 'LoadResult', def: 'What <code>load</code> returns: <code>LoadResult.Page(data, prevKey, nextKey)</code> on success, <code>LoadResult.Error(e)</code> on failure.' },
          { term: 'Pager', def: 'Makes a Flow of pages from a <code>PagingConfig</code> and a PagingSource. <code>collectAsLazyPagingItems()</code> shows it in a <code>LazyColumn</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Return one page, and stop when the server sends an empty one.', code: `val recipes = api.explore(page)
return LoadResult.[[Page]](
    data = recipes,
    prevKey = null,
    nextKey = if (recipes.[[isEmpty]]()) [[null]] else page + 1,
)`, why: '<code>LoadResult.Page</code> carries the rows and the keys around them. An empty page means the end, so <code>nextKey = null</code>.' },
          { type: 'bug', prompt: 'Right after the first page, the app crashes: Paging says the same <code>nextKey</code> came twice. Tap the wrong line.', code: `val page = params.key ?: 1
val recipes = api.explore(page)
return LoadResult.Page(
    data = recipes,
    prevKey = null,
    nextKey = if (recipes.isEmpty()) null else page,
)`, bug: 5, fix: '    nextKey = if (recipes.isEmpty()) null else page + 1,', why: 'With <code>nextKey = page</code>, page 1 says the next page is 1 again. The next key must point to the following page.' },
        ],
        quiz: [
          { q: 'What does <code>nextKey = null</code> tell Paging?', options: ['There are no more pages', 'Load page 1 again', 'This page failed'], a: 0, why: '<code>null</code> means nothing comes after this page, so Paging stops loading.' },
          { q: 'In <code>PagingSource&lt;Int, RecipeDto&gt;</code>, what is the <code>Int</code>?', options: ['The key that names a page, here the page number', 'How many rows a page has', 'The recipe id'], a: 0, why: 'The first type is the key, the second the item.' },
          { q: 'Page 4 fails because the signal is gone. What should <code>load</code> return?', options: ['<code>LoadResult.Error(e)</code>', 'An empty <code>LoadResult.Page</code>', 'Nothing: let the exception crash the app'], a: 0, why: 'An error result keeps the loaded rows and lets <code>retry()</code> load that page again. An empty page would end the list.' },
        ],
        docs: [['Load and display paged data', 'https://developer.android.com/topic/libraries/architecture/paging/v3-paged-data']],
      },

      {
        id: 'realtime',
        title: 'Live updates',
        tagline: 'Keep a connection open and let the server tell you when something changes.',
        goals: ['Explain why asking again and again is slow and wasteful', 'Turn WebSocket messages into a Flow with <code>callbackFlow</code>', 'Save each live change into Room so the screen updates by itself'],
        level: 'intermediate', introduces: ['WebSocket', 'OkHttpClient', 'newWebSocket', 'WebSocketListener', 'onMessage', 'onClosing', 'onClosed', 'onFailure', 'Throwable'],
        body: `
<p>Ada changes the soup on her tablet: 20 minutes instead of 25. Her phone, propped up by the stove, still says 25. The app could ask the server every 10 seconds, which is called <em>polling</em>. But almost every answer would be “nothing new”, each request costs battery and data, and a change still shows up to 10 seconds late.</p>
<p>A <em>WebSocket</em> is a connection that stays open. The app opens it once, and from then on either side can send a message whenever it likes, so the server sends one the moment a recipe changes. OkHttp, the library Retrofit uses underneath, has WebSockets: <code>client.newWebSocket(request, listener)</code> opens one, and the listener’s <code>onMessage</code> is called for every text message. <code>object : WebSocketListener() { ... }</code> makes one object on the spot from that class, overriding only the functions you need. The address starts with <code>wss://</code>, the secure WebSocket version of <code>https://</code>.</p>
<p>A listener is a callback, so wrap it with <code>callbackFlow</code> from the flow track: <code>trySend</code> each message, and close the socket in <code>awaitClose</code> when collecting stops. Collect it in <code>LaunchedEffect</code>, read each message with <code>json.decodeFromString&lt;RecipeDto&gt;(text)</code>, using the <code>json</code> reader with <code>ignoreUnknownKeys</code> from the errors lesson, and upsert it into Room. The screen reads Room, so it updates by itself. When the server closes the connection, <code>onClosing</code> is called: close your side too, and once both sides are closed, <code>onClosed</code> ends the flow. When the connection drops, <code>onFailure</code> ends the flow with the error; its <code>Throwable</code> is the parent type of every exception. <code>retry</code> can also take a lambda: it runs after each failure, may wait, and gives <code>true</code> to try again.</p>
<p>If the app only needs to receive, <em>server-sent events</em> (SSE) are a lighter choice: a normal HTTP response that never ends, in which the server writes one event after another. OkHttp has a small extra library for them, okhttp-sse. Pick a WebSocket when the app also sends, as in a chat.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['Polling', 'Socket'],
            span: 40,
            unit: 's',
            predict: {
              q: 'Ada saves the change at second 13. When does the phone that polls every 10 seconds show it?',
              options: ['At 20 s, with its next request', 'At 13 s, right away', 'At 40 s'],
              a: 0,
              why: 'A polling phone only learns about a change when it asks next. Its requests go out at 0, 10, 20 and 30 seconds.',
            },
            frames: [
              { bars: [{ lane: 1, from: 0, to: 40, tone: 'muted', label: 'open' }], now: 0, say: 'Two phones show Ada’s recipes. The top one, Polling, asks the server every 10 seconds. The bottom one opened a WebSocket and keeps it open.' },
              { bars: [{ lane: 0, from: 0, to: 1.5, tone: 'muted' }, { lane: 0, from: 10, to: 11.5, tone: 'muted' }], now: 12, say: 'Polling: requests at 0 s and 10 s. Both answers: nothing new.' },
              { marks: [{ at: 13, label: 'soup: 20 min', tone: 'warm' }], bars: [{ lane: 1, from: 13, to: 15, tone: 'ok' }], now: 13, say: 'At 13 s Ada saves the change on her tablet. The server sends a message on the open WebSocket, and the bottom phone shows 20 minutes at once.' },
              { bars: [{ lane: 0, from: 20, to: 21.5, tone: 'ok' }], now: 21, say: 'The polling phone finds out with its next request, at 20 s: seven seconds late.' },
              { bars: [{ lane: 0, from: 30, to: 31.5, tone: 'muted' }], now: 40, say: 'And it keeps asking. In an hour that is 360 requests, nearly all of them “nothing new”. The WebSocket sent one message.' },
            ],
          });
        },
        code: `val client = OkHttpClient()                    // OkHttp's client: it opens the socket

fun liveChanges(token: String): Flow<String> = callbackFlow {
    val request = Request.Builder()
        .url("wss://recipes.example.com/live")
        .header("Authorization", "Bearer $token")
        .build()
    val socket = client.newWebSocket(request, object : WebSocketListener() {
        override fun onMessage(webSocket: WebSocket, text: String) {
            trySend(text)                     // {"id":1,"title":"Tomato soup","minutes":20}
        }
        override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
            webSocket.close(1000, null)       // the server wants to close: close our side too
        }
        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
            close()                           // both sides closed: end the flow
        }
        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
            close(t)                          // the connection dropped: end it with the error
        }
    })
    awaitClose { socket.close(1000, null) }   // collecting stopped: close the socket (1000 = normal)
}

@Composable
fun LiveUpdates(dao: RecipeDao, token: String) {
    LaunchedEffect(token) {
        liveChanges(token)
            .retry {
                delay(5000)                   // the connection dropped: wait 5 s,
                true                          // then connect again
            }
            .collect { text ->
                val dto = json.decodeFromString<RecipeDto>(text)   // skips unknown keys
                val favorite = dao.getAll().first().any { it.id == dto.id && it.favorite }
                dao.upsertAll(listOf(dto.toRecipe(favorite)))   // the screen reads Room: it updates
            }
    }
}`,
        remember: 'A WebSocket stays open so the server can send changes at once; wrap it in callbackFlow, write each change into Room, and retry when it drops.',
        mistakes: [
          { title: 'Polling in a loop', bad: `LaunchedEffect(Unit) {
    while (true) {
        refreshRecipes(session, dao, store, force = true)
        delay(10000)                 // ask again in 10 s, mostly for nothing
    }
}`, good: `LaunchedEffect(token) {
    liveChanges(token).collect { text ->
        // decode and upsert, as above
    }
}`, why: 'A loop sends a request every 10 seconds whether anything changed or not, and still shows changes late. A WebSocket sends a message only when something changes.' },
        ],
        terms: [
          { term: 'polling', def: 'Asking the server again and again, at fixed times, whether anything changed.' },
          { term: 'WebSocket', def: 'A connection that stays open, so the app and the server can each send messages at any time.' },
          { term: 'server-sent events', def: 'SSE: a response that never ends, in which the server writes one event after another. One way only, server to app.' },
          { term: 'OkHttp', def: 'The library Retrofit uses to send requests. It also opens WebSockets with <code>newWebSocket</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Open the socket, pass each message into the flow, and close the socket when collecting stops.', code: `val socket = client.[[newWebSocket]](request, object : WebSocketListener() {
    override fun [[onMessage]](webSocket: WebSocket, text: String) {
        [[trySend]](text)
    }
})
[[awaitClose]] { socket.close(1000, null) }`, why: '<code>newWebSocket</code> opens the connection, <code>onMessage</code> is called per message, <code>trySend</code> puts it in the flow, and <code>awaitClose</code> runs when collecting stops.' },
          { type: 'bug', prompt: 'After Ada leaves the screen, the phone keeps receiving messages and using data. Tap the wrong line.', code: `val socket = client.newWebSocket(request, object : WebSocketListener() {
    override fun onMessage(webSocket: WebSocket, text: String) {
        trySend(text)
    }
})
awaitClose { }`, bug: 5, fix: 'awaitClose { socket.close(1000, null) }', why: 'The block of <code>awaitClose</code> runs when collecting stops. If it doesn’t close the socket, the connection stays open with no one listening.' },
        ],
        quiz: [
          { q: 'Why is polling every 10 seconds a poor fit for live changes?', options: ['Most requests find nothing new, they cost battery, and changes still arrive up to 10 s late', 'Servers can’t answer that often', 'HTTP allows only one request a minute'], a: 0, why: 'Polling pays for every request but only learns about a change on the next one.' },
          { q: 'An app only receives live scores and never sends anything. Which is the lighter choice?', options: ['Server-sent events', 'A WebSocket', 'Polling every second'], a: 0, why: 'SSE is one way, server to app, over a normal HTTP response. A WebSocket is for both directions.' },
          { q: 'A live change is upserted into Room. How does the recipe screen update?', options: ['Room’s Flow sends the new list, and the screen redraws', 'The WebSocket code redraws the screen', 'Only after the app restarts'], a: 0, why: 'The screen reads Room. Any write to the table, from a refresh or a live message, reaches it through the Flow.' },
        ],
        docs: [['OkHttp: WebSocket', 'https://square.github.io/okhttp/5.x/okhttp/okhttp3/-web-socket/index.html']],
      },
    ],
  });
})();
