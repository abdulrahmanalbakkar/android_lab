/* App architecture track.
   Same shape as tracks/kotlin.js. Demos use the visual kit (Lab.ui); any track CSS goes in the css string, every class
   starting with arc-. */
(() => {
  const css = ``;

  Lab.addTrack({
    id: 'arch',
    title: 'App architecture',
    description: 'Give the Recipes app structure step by step: ViewModels, one UI state, layers, repositories and use cases, then wiring it all together with Hilt.',
    group: 'Building apps', requires: ['android', 'flow'],
    css,
    lessons: [
      {
        id: 'why-architecture',
        title: 'Why structure matters',
        tagline: 'Give each part of the app one job, so it can grow without breaking.',
        goals: ['Spot the different jobs one big screen function is doing', 'Explain what goes wrong when they all live in one place', 'Name the three jobs the next lessons pull apart'],
        level: 'intermediate', introduces: [],
        body: `
<p>Ada’s Recipes app works. Now she wants a Favorites screen that refreshes from the server too. She opens <code>RecipesScreen</code>: one composable that reads Room, calls the server, decides the offline note, counts Refresh taps and draws the list. To reuse the refresh she would have to copy it. And when she turns the phone during a refresh, the refresh starts over and the note is gone.</p>
<p>Code that grows needs <b>separation of concerns</b>: split it by job, so each piece has one reason to change. You know the idea as single responsibility from the SOLID track. A screen has three jobs. <em>Drawing</em>: turning values into what you see. <em>Screen state</em>: holding what the screen shows, like the note, and deciding what a tap does. <em>Data</em>: getting and saving recipes in Room, on the server and in DataStore.</p>
<p>Split like that, a new look changes only the drawing, a new server changes only the data part, and a second screen reuses the data part instead of copying it. How an app’s code is split into parts, and how the parts talk to each other, is its <b>architecture</b>. The next lessons build it step by step, starting with a home for screen state that survives turning the phone.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            predict: {
              q: 'Ada adds a Favorites screen that needs the same refresh. With the code as it is now, what does she have to do?',
              options: ['Copy the refresh code into the new screen', 'Call <code>RecipesScreen</code> from the new screen', 'Nothing: Compose shares it by itself'],
              a: 0,
              why: 'The refresh lives inside the <code>RecipesScreen</code> composable. Nothing else can call it without drawing that screen.',
            },
            nodes: [
              { id: 'scr', label: 'RecipesScreen<small>draws, holds, fetches</small>', x: 25, y: 10 },
              { id: 'fav', label: 'FavoritesScreen<small>new</small>', x: 75, y: 10, tone: 'warm', hidden: true },
              { id: 'state', label: 'screen state<small>note, what a tap does</small>', x: 25, y: 42, tone: 'ok', hidden: true },
              { id: 'data', label: 'data<small>refresh, stars</small>', x: 50, y: 64, tone: 'ok', hidden: true },
              { id: 'room', label: 'Room', x: 15, y: 90, tone: 'muted' },
              { id: 'server', label: 'server', x: 50, y: 90, tone: 'muted' },
              { id: 'store', label: 'DataStore', x: 85, y: 90, tone: 'muted' },
            ],
            frames: [
              { add: [['scr', 'room'], ['scr', 'server'], ['scr', 'store']], say: 'Today, <code>RecipesScreen</code> talks to Room, the server and DataStore itself.' },
              { hl: ['scr'], say: 'Inside it: drawing the list, keeping <code>note</code> and <code>taps</code>, deciding when to refresh, writing stars. Four jobs in one function.' },
              { show: ['fav'], add: [['fav', 'room', '', 'err'], ['fav', 'server', '', 'err'], ['fav', 'store', '', 'err']], hl: ['fav'], say: 'The Favorites screen needs the same refresh. With nowhere to share it, the code is copied, and two copies must now be kept the same.' },
              { gone: ['scr'], say: 'Ada turns the phone during a refresh. The Activity is created again, so everything the composable remembered starts over, and the refresh runs again from the start.' },
              { back: ['scr'], remove: [['scr', 'room'], ['scr', 'server'], ['scr', 'store'], ['fav', 'room'], ['fav', 'server'], ['fav', 'store']], show: ['data'], add: [['data', 'room', '', 'ok'], ['data', 'server', '', 'ok'], ['data', 'store', '', 'ok']], hl: ['data'], say: 'Split by job. One data part gets and saves recipes. It is the only part that talks to Room, the server and DataStore.' },
              { show: ['state'], add: [['scr', 'state'], ['state', 'data']], hl: ['state'], say: 'Between them, a part that holds what the screen shows and decides what a tap does. The composable is left with one job: drawing.' },
              { add: [['fav', 'data', '', 'ok']], hl: ['fav', 'data'], say: 'The Favorites screen uses the same data part instead of a copy. Each part has one job, and one reason to change.' },
            ],
          });
        },
        code: `// The Recipes screen at the end of the data track: one function, every job
@Composable
fun RecipesScreen(dao: RecipeDao, session: Session, store: DataStore<Preferences>) {
    // data: read the table
    val recipesFlow = remember { dao.getAll() }
    val recipes by recipesFlow.collectAsStateWithLifecycle(initialValue = listOf())

    // screen state: what the screen shows, and what a tap does
    var note by remember { mutableStateOf("") }
    var taps by remember { mutableStateOf(0) }
    LaunchedEffect(taps) {
        try {
            refreshRecipes(session, dao, store, force = taps > 0)   // data again: the server
            note = ""
        } catch (e: IOException) {
            note = "Offline: showing saved recipes"
        }
    }

    // drawing
    Column {
        Button(onClick = { taps++ }) { Text("Refresh") }
        Text(note)
        LazyColumn {
            items(recipes, key = { it.id }) { recipe ->
                Text("\${recipe.title} · \${recipe.minutes} min")
            }
        }
    }
}
// Turn the phone during a refresh: the refresh is cancelled, note and taps start over,
// and LaunchedEffect starts refreshRecipes again.`,
        remember: 'Split code by job: drawing, screen state, data. Then each part has one reason to change.',
        terms: [
          { term: 'separation of concerns', def: 'Splitting code by job, so each piece does one thing and has one reason to change.' },
          { term: 'architecture', def: 'How an app’s code is split into parts, and how those parts talk to each other.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Sort the jobs of <code>RecipesScreen</code>. Which part should do each one?', code: `Drawing the list               -> the [[composable]]
Holding the note, deciding taps -> the screen [[state]] part
Talking to Room and the server  -> the [[data]] part`, why: 'Drawing, screen state and data are the three jobs. Each gets its own part.' },
          { type: 'bug', prompt: 'The offline note disappears whenever Ada turns the phone. Tap the line to change.', code: `@Composable
fun RecipesScreen(dao: RecipeDao, session: Session, store: DataStore<Preferences>) {
    var note by remember { mutableStateOf("") }
    var taps by remember { mutableStateOf(0) }
    // the rest as before
}`, bug: 2, fix: '    var note by rememberSaveable { mutableStateOf("") }', why: 'Turning the phone creates a new Activity, and <code>remember</code> starts over. <code>rememberSaveable</code> keeps the note. It patches one value; the refresh still restarts, which the next lesson fixes.' },
        ],
        quiz: [
          { q: 'The code is split by job. Ada wants new colours for the list. Which part changes?', options: ['Only the drawing part', 'The data part', 'All three'], a: 0, why: 'Colours are about drawing. Screen state and data don’t change.' },
          { q: 'What does separation of concerns mean?', options: ['Each piece of code has one job', 'Every function goes in its own file', 'Screens never share code'], a: 0, why: 'It is about jobs. Sharing a data part between screens is one of the things it makes possible.' },
          { q: 'Why is a refresh written inside a composable hard to reuse?', options: ['Another screen can’t call it without drawing this screen', 'Room lets only one screen read a table', 'A refresh must always live in <code>MainActivity</code>'], a: 0, why: 'The refresh is part of what <code>RecipesScreen</code> draws. To use it elsewhere, it needs its own place.' },
        ],
        docs: [['Guide to app architecture', 'https://developer.android.com/topic/architecture']],
      },

      {
        id: 'viewmodel',
        title: 'ViewModel',
        tagline: 'A home for screen state and work that survives turning the phone.',
        goals: ['Move screen state and work out of a composable into a <code>ViewModel</code>', 'Start work in <code>viewModelScope</code> so turning the phone doesn’t cancel it', 'Get the screen’s ViewModel in Compose with <code>viewModel { }</code>'],
        level: 'intermediate', introduces: ['ViewModel', 'viewModelScope', 'viewModel', 'init'],
        body: `
<p>Ada taps Refresh in a tunnel and turns the phone while it loads. The new Activity builds a new composition: the running refresh is cancelled, the note is empty again, and the refresh starts over. The screen’s state and work lived in the composable, and that only lives as long as its Activity.</p>
<p>A <code>ViewModel</code> is a class that holds a screen’s state and work, and that Android keeps alive when the Activity is created again after a configuration change. Write <code>class RecipesViewModel(...) : ViewModel()</code>: your class builds on <code>ViewModel</code>, like <code>: Parent()</code> in inheritance. In Compose, <code>viewModel { RecipesViewModel(dao, session, dataStore) }</code> gives you the screen’s ViewModel. The first time, it runs the lambda and makes one. After a rotation it hands back the same object, and the lambda doesn’t run again. It comes from the library <code>androidx.lifecycle:lifecycle-viewmodel-compose</code>.</p>
<p>Every ViewModel has <code>viewModelScope</code>, a coroutine scope that belongs to it, so work launched there keeps going through a rotation. It is cancelled only when the ViewModel is <em>cleared</em>: when the screen is closed for good, with <code>finish()</code>, or with Back from a screen that has another one below it. (On the app’s last screen, Back only sends the app to the background since Android 12, so the ViewModel stays.) Android then calls the ViewModel’s <code>onCleared</code> function. An <code>init { }</code> block inside a class runs once, when the object is made: a good place to start the first refresh.</p>
<p>Two limits. A ViewModel is kept in memory, not saved: when Android closes the app in the background to free memory, it is gone, unlike the saved state of <code>rememberSaveable</code>. Here that is fine, because the recipes are in Room. And because it lives longer than the Activity, never keep an Activity or its <code>Context</code> in a ViewModel: the old Activity could then never be freed from memory.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['Act 1', 'Act 2', 'View<br>Model', 'refresh'],
            span: 14,
            unit: 's',
            predict: {
              q: 'Ada turns the phone while a refresh started in <code>viewModelScope</code> is loading. What happens to the refresh?',
              options: ['It keeps going and finishes on the new screen', 'It is cancelled and starts over', 'It is cancelled and never finishes'],
              a: 0,
              why: 'The ViewModel survives the rotation, and so does its scope. Only the Activity is new.',
            },
            frames: [
              { now: 0, say: 'Time runs left to right. <b>Act 1</b> and <b>Act 2</b> are two <code>MainActivity</code> objects, <b>ViewModel</b> is the <code>RecipesViewModel</code>, and the last row is the refresh work.' },
              { bars: [{ lane: 0, from: 0, to: 2 }, { lane: 2, from: 0, to: 2, label: 'made', tone: 'ok' }], marks: [{ at: 0, label: 'open', tone: 'accent' }], say: 'Ada opens Recipes. <code>viewModel { }</code> runs its lambda and makes the ViewModel. Its <code>init</code> block starts a first refresh, which finds the saved copy fresh enough.' },
              { bars: [{ lane: 0, from: 2, to: 5 }, { lane: 2, from: 2, to: 5, tone: 'ok' }, { lane: 3, from: 2, to: 5, label: 'loading', tone: 'warm' }], marks: [{ at: 2, label: 'Refresh', tone: 'warm' }], say: 'She taps Refresh. The ViewModel launches the refresh in <code>viewModelScope</code>.' },
              { now: 5, marks: [{ at: 5, label: 'rotate', tone: 'err' }], say: 'She turns the phone. Activity 1 is destroyed. The ViewModel isn’t: Android keeps it for the next Activity.' },
              { bars: [{ lane: 1, from: 5, to: 9.5, tone: 'ok' }, { lane: 2, from: 5, to: 9.5, tone: 'ok' }, { lane: 3, from: 5, to: 7.5, label: 'loading', tone: 'warm' }], say: 'Activity 2 is created. <code>viewModel { }</code> hands back the same <code>RecipesViewModel</code>, and its lambda doesn’t run. The refresh never stopped.' },
              { now: 7.5, marks: [{ at: 7.5, label: 'done', tone: 'ok' }], say: 'The refresh finishes and the new list appears on the new screen. Nothing was started twice.' },
              { now: 9.5, marks: [{ at: 9.5, label: 'finish()', tone: 'err' }], say: 'Ada taps Close, which calls <code>finish()</code>. The Activity is gone for good, so the ViewModel is cleared: <code>onCleared</code> runs and <code>viewModelScope</code> is cancelled.' },
              { bars: [{ lane: 2, from: 12, to: 14, label: 'new', tone: 'accent' }], marks: [{ at: 12, label: 'open', tone: 'accent' }], say: 'Next time she opens the app, a new ViewModel is made and <code>init</code> runs again. The same happens after Android closes the app in the background: a ViewModel is not saved.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
// dependencies {
//     implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.11.0")
//     // needs compileSdk = 37 and AGP 9.2 or newer
// }

class RecipesViewModel(
    private val dao: RecipeDao,
    private val session: Session,
    private val store: DataStore<Preferences>
) : ViewModel() {
    val recipes: StateFlow<List<Recipe>> = dao.getAll()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), listOf())
    val note = MutableStateFlow("")

    init {
        refresh(force = false)                  // once, when the ViewModel is made
    }

    fun refresh(force: Boolean) {
        viewModelScope.launch {                 // survives rotation
            try {
                refreshRecipes(session, dao, store, force)
                note.value = ""
            } catch (e: IOException) {
                note.value = "Offline: showing saved recipes"
            }
            // plus the HttpException and SerializationException catches from the caching lesson
        }
    }
}

@Composable
fun RecipesScreen(viewModel: RecipesViewModel) {
    val recipes by viewModel.recipes.collectAsStateWithLifecycle()
    val note by viewModel.note.collectAsStateWithLifecycle()
    Column {
        Button(onClick = { viewModel.refresh(force = true) }) { Text("Refresh") }
        Text(note)
        LazyColumn {
            items(recipes, key = { it.id }) { recipe ->
                Text("\${recipe.title} · \${recipe.minutes} min")
            }
        }
    }
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val dao = RecipesDb.get(this).recipeDao()
        val session = Session(api, dataStore)
        setContent {
            val recipesViewModel = viewModel { RecipesViewModel(dao, session, dataStore) }
            RecipesScreen(recipesViewModel)     // same ViewModel after every rotation
        }
    }
}`,
        remember: 'viewModel { } makes the ViewModel once and hands back the same one after a rotation; work in viewModelScope stops only when the screen is closed for good.',
        mistakes: [
          { title: 'Keeping the Activity in the ViewModel', bad: `class RecipesViewModel(private val activity: MainActivity) : ViewModel() {
    val dao = RecipesDb.get(activity).recipeDao()
}`, good: `class RecipesViewModel(private val dao: RecipeDao) : ViewModel()

// in MainActivity: viewModel { RecipesViewModel(RecipesDb.get(this).recipeDao()) }`, why: 'After a rotation the ViewModel would still hold the old, destroyed Activity, so that Activity can never be freed from memory. Pass in what the ViewModel needs, not the Activity.' },
        ],
        terms: [
          { term: 'ViewModel', def: 'A class that holds a screen’s state and work. Android keeps it through configuration changes, and clears it when the screen is closed for good.' },
          { term: 'viewModelScope', def: 'A coroutine scope that belongs to a ViewModel. It is cancelled when the ViewModel is cleared, not on rotation.' },
          { term: 'viewModel', def: '<code>viewModel { RecipesViewModel(...) }</code> in a composable: makes the ViewModel the first time, and hands back the same one after that.' },
          { term: 'init', def: 'An <code>init { }</code> block in a class runs once, when an object of the class is made.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a ViewModel whose star writes keep going through a rotation.', code: `class RecipesViewModel(private val dao: RecipeDao) : [[ViewModel]]() {
    fun toggleFavorite(recipe: Recipe) {
        [[viewModelScope]].launch {
            dao.update(recipe.copy(favorite = !recipe.favorite))
        }
    }
}`, why: '<code>: ViewModel()</code> lets Android keep the object through rotation, and <code>viewModelScope</code> keeps its work going.' },
          { type: 'bug', prompt: 'Every time Ada turns the phone, the refresh starts over. Tap the wrong line.', code: `setContent {
    val recipesViewModel = remember { RecipesViewModel(dao, session, dataStore) }
    RecipesScreen(recipesViewModel)
}`, bug: 1, fix: '    val recipesViewModel = viewModel { RecipesViewModel(dao, session, dataStore) }', why: '<code>remember</code> starts over in the new Activity, so a new ViewModel is made and its <code>init</code> refreshes again. <code>viewModel { }</code> hands back the one Android kept.' },
        ],
        quiz: [
          { q: 'The phone rotates. What happens to the <code>RecipesViewModel</code>?', options: ['The new Activity gets the same object', 'A new one is made', 'It is saved to a file and read back'], a: 0, why: 'Android keeps the ViewModel in memory and hands it to the new Activity.' },
          { q: 'When is <code>viewModelScope</code> cancelled?', options: ['When the ViewModel is cleared, for example after <code>finish()</code>', 'At every rotation', 'At every <code>onStop</code>'], a: 0, why: 'The scope belongs to the ViewModel, which outlives rotations and stops.' },
          { q: 'Android closed the app in the background to free memory. Ada comes back. What about the ViewModel?', options: ['A new one is made: a ViewModel is not saved', 'The old one comes back with its values', 'The app can’t open again'], a: 0, why: 'A ViewModel lives in memory only. Values that must come back after that belong in saved state or in Room.' },
        ],
        docs: [['ViewModel overview', 'https://developer.android.com/topic/libraries/architecture/viewmodel']],
      },

      {
        id: 'ui-state',
        title: 'UI state',
        tagline: 'Put everything the screen shows into one object.',
        goals: ['Describe a whole screen with one data class', 'Expose it read-only with <code>asStateFlow()</code>', 'Change it with <code>copy</code>, so the screen always gets one consistent picture'],
        level: 'intermediate', introduces: ['asStateFlow'],
        body: `
<p>The ViewModel has <code>recipes</code> and <code>note</code>, and Ada wants the screen to say “Refreshing…” while a refresh runs, so a third value, <code>isRefreshing</code>. Three flows, three collect lines in the screen. Worse, each one changes on its own: for a moment “Refreshing…” can be gone while the note still says nothing, and nobody has decided that the screen should look like that.</p>
<p><b>UI state</b> is everything a screen shows, in one object: <code>data class RecipesUiState(val recipes: List&lt;Recipe&gt; = listOf(), val isRefreshing: Boolean = false, val note: String = "")</code>. The default values describe the screen before anything has loaded. A change makes a whole new object with <code>copy</code>, so <code>_uiState.value = _uiState.value.copy(isRefreshing = false, note = "Offline: showing saved recipes")</code> changes both values in one step. The screen never sees half of a change.</p>
<p>Only the ViewModel may change it. Inside, it keeps <code>private val _uiState = MutableStateFlow(RecipesUiState())</code>. The underscore is a naming habit for the private, changeable one. Outside, it shows <code>val uiState: StateFlow&lt;RecipesUiState&gt; = _uiState.asStateFlow()</code>. <code>asStateFlow()</code> wraps it in a read-only <code>StateFlow</code>: the screen can read and collect it, but setting <code>.value</code> doesn’t compile.</p>
<p>The recipes from Room go into the same object: in <code>init</code>, a coroutine collects <code>dao.getAll()</code> and copies each new list in. The screen collects one thing: <code>val state by viewModel.uiState.collectAsStateWithLifecycle()</code>.</p>`,
        visual(el) {
          const scr = (opts) => `<div class="ui-m-bar">Recipes</div><div class="ui-m-body"><span class="ui-m-btn refresh">Refresh</span>${opts.spin ? '<div class="ui-m-muted">Refreshing…</div>' : ''}${opts.note ? `<div class="ui-m-muted">${opts.note}</div>` : ''}<div class="ui-m-row"><div>Omelette · 10 min</div></div><div class="ui-m-row"><div>Pancakes · 20 min</div></div><div class="ui-m-row"><div>Tomato soup · 35 min</div></div>${opts.curry ? '<div class="ui-m-row"><div>Curry · 40 min</div></div>' : ''}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'uiState',
            predict: {
              q: 'The refresh fails. The ViewModel writes <code>copy(isRefreshing = false, note = "Offline: showing saved recipes")</code>. Can the screen show “Refreshing…” gone but no note yet?',
              options: ['No: both arrive together, in one new object', 'Yes, for a moment', 'Only on slow phones'],
              a: 0,
              why: 'The screen gets whole <code>RecipesUiState</code> objects. Both values were changed in the same <code>copy</code>.',
            },
            frames: [
              { screen: scr({}), log: 'RecipesUiState(recipes = 3, isRefreshing = false, note = "")', say: 'The screen draws one object: three recipes, not refreshing, no note.' },
              { tap: '.refresh', log: 'copy(isRefreshing = true)', say: 'Ada taps Refresh. The ViewModel makes a new state with <code>isRefreshing = true</code>; everything else is copied as it was.' },
              { screen: scr({ spin: true }), say: 'The screen collects the new object and shows “Refreshing…” above the same three recipes.' },
              { screen: scr({ note: 'Offline: showing saved recipes' }), log: 'copy(isRefreshing = false, note = "Offline: showing saved recipes")', say: 'No signal. One <code>copy</code> changes two values, so “Refreshing…” goes and the note appears in the same redraw.' },
              { screen: scr({ spin: true, note: 'Offline: showing saved recipes' }), tap: '.refresh', log: 'copy(isRefreshing = true)', say: 'Signal is back, and Ada taps again. Only <code>isRefreshing</code> changes, so the old note stays until the result is known.' },
              { screen: scr({ curry: true }), log: ['copy(isRefreshing = false, note = "")', 'copy(recipes = 4)   ← Room’s Flow emitted'], say: 'This time it works: the ViewModel clears the note, and Room’s Flow brings the new list, copied into the state too.' },
              { screen: scr({ curry: true }), log: 'rotate: collect again → the same RecipesUiState at once', say: 'Ada turns the phone. The new screen collects the same <code>uiState</code> and gets the current object right away.' },
            ],
          });
        },
        code: `data class RecipesUiState(
    val recipes: List<Recipe> = listOf(),
    val isRefreshing: Boolean = false,
    val note: String = ""
)

class RecipesViewModel(
    private val dao: RecipeDao,
    private val session: Session,
    private val store: DataStore<Preferences>
) : ViewModel() {
    private val _uiState = MutableStateFlow(RecipesUiState())
    val uiState: StateFlow<RecipesUiState> = _uiState.asStateFlow()   // read-only outside

    init {
        viewModelScope.launch {
            dao.getAll().collect { list ->
                _uiState.value = _uiState.value.copy(recipes = list)
            }
        }
        refresh(force = false)
    }

    fun refresh(force: Boolean) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isRefreshing = true)
            try {
                refreshRecipes(session, dao, store, force)
                _uiState.value = _uiState.value.copy(isRefreshing = false, note = "")
            } catch (e: IOException) {
                _uiState.value = _uiState.value.copy(isRefreshing = false, note = "Offline: showing saved recipes")
            }
            // plus the HttpException and SerializationException catches from the caching lesson
        }
    }
}

@Composable
fun RecipesScreen(viewModel: RecipesViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()   // one value for the whole screen
    Column {
        Button(onClick = { viewModel.refresh(force = true) }) { Text("Refresh") }
        if (state.isRefreshing) {
            Text("Refreshing…")
        }
        Text(state.note)
        LazyColumn {
            items(state.recipes, key = { it.id }) { recipe ->
                Text("\${recipe.title} · \${recipe.minutes} min")
            }
        }
    }
}`,
        play: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

data class RecipesUiState(
    val recipes: List<String> = listOf(),
    val isRefreshing: Boolean = false,
    val note: String = ""
)

// Plays the part of the ViewModel: only it can change the state.
class RecipesState {
    private val _uiState = MutableStateFlow(RecipesUiState())
    val uiState: StateFlow<RecipesUiState> = _uiState.asStateFlow()

    fun recipesArrived(titles: List<String>) {
        _uiState.value = _uiState.value.copy(recipes = titles)
    }
    fun refreshStarted() {
        _uiState.value = _uiState.value.copy(isRefreshing = true)
    }
    fun refreshFailed() {
        _uiState.value = _uiState.value.copy(isRefreshing = false, note = "Offline: showing saved recipes")
    }
}

fun main() = runBlocking {
    val holder = RecipesState()
    val screen = launch {
        holder.uiState.collect { println(it) }   // one whole object each time
    }
    delay(100)
    holder.recipesArrived(listOf("Omelette", "Pancakes"))
    delay(100)
    holder.refreshStarted()
    delay(100)
    holder.refreshFailed()
    delay(100)
    // Try: holder.uiState.value = RecipesUiState()   Why doesn't it compile?
    screen.cancel()
}`,
        remember: 'One data class for the whole screen; a private MutableStateFlow inside, asStateFlow() outside; every change is a copy.',
        mistakes: [
          { title: 'Letting the screen change the state', bad: `val uiState = MutableStateFlow(RecipesUiState())

// in a composable:
viewModel.uiState.value = RecipesUiState()   // compiles, and wipes the screen`, good: `private val _uiState = MutableStateFlow(RecipesUiState())
val uiState: StateFlow<RecipesUiState> = _uiState.asStateFlow()

// in a composable: viewModel.uiState.value = ...   'val' cannot be reassigned.`, why: 'If anyone can set the state, a wrong screen can come from anywhere. With a private <code>_uiState</code>, only the ViewModel’s own functions change it.' },
        ],
        terms: [
          { term: 'UI state', def: 'Everything a screen shows, in one object, such as <code>RecipesUiState</code>.' },
          { term: 'asStateFlow', def: '<code>_uiState.asStateFlow()</code> gives a read-only <code>StateFlow</code> of the same values: others can collect it but not set <code>.value</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep the changeable state private, and show a read-only one.', code: `private val _uiState = MutableStateFlow([[RecipesUiState]]())
val uiState: StateFlow<RecipesUiState> = _uiState.[[asStateFlow]]()`, why: 'The default values of <code>RecipesUiState()</code> are the starting screen. <code>asStateFlow()</code> lets the screen read but not write.' },
          { type: 'bug', prompt: 'After a failed refresh, the list is empty, though Room has 40 recipes. Tap the wrong line.', code: `viewModelScope.launch {
    _uiState.value = _uiState.value.copy(isRefreshing = true)
    try {
        refreshRecipes(session, dao, store, force)
        _uiState.value = _uiState.value.copy(isRefreshing = false, note = "")
    } catch (e: IOException) {
        _uiState.value = RecipesUiState(note = "Offline: showing saved recipes")
    }
}`, bug: 6, fix: '        _uiState.value = _uiState.value.copy(isRefreshing = false, note = "Offline: showing saved recipes")', why: '<code>RecipesUiState(note = ...)</code> is a brand-new object with the default, empty list. <code>copy</code> keeps the recipes and changes only what you name.' },
        ],
        quiz: [
          { q: 'Why one <code>RecipesUiState</code> instead of three separate flows?', options: ['The screen gets all values together, so they never disagree', 'It uses less memory', 'Compose can only collect one flow'], a: 0, why: 'Each change is one new, whole object. The screen can’t catch it half done.' },
          { q: 'What does <code>asStateFlow()</code> give the screen?', options: ['A read-only view of the same StateFlow', 'A copy that never changes again', 'A second <code>MutableStateFlow</code>'], a: 0, why: 'It follows every new value, but has no way to set one.' },
          { q: '<code>state</code> is <code>RecipesUiState(isRefreshing = true, note = "Offline")</code>. What is <code>state.copy(isRefreshing = false)</code>?', options: ['<code>isRefreshing = false</code>, <code>note = "Offline"</code>', '<code>isRefreshing = false</code>, <code>note = ""</code>', 'The same object, changed'], a: 0, why: '<code>copy</code> makes a new object and keeps every value you don’t name.' },
        ],
        docs: [['UI layer', 'https://developer.android.com/topic/architecture/ui-layer']],
      },

      {
        id: 'udf',
        title: 'Unidirectional data flow',
        tagline: 'State goes down to the screen, events go up to the ViewModel.',
        goals: ['Split a screen into a part that knows the ViewModel and a part that only draws', 'Send taps up as events, through lambdas', 'Follow one tap around the loop: event, new state, redraw'],
        level: 'intermediate', introduces: [],
        body: `
<p>Ada wants a preview of the recipe list in Android Studio, with three sample recipes. But <code>RecipesScreen</code> needs a real <code>RecipesViewModel</code>, which needs a DAO, a Session and a DataStore. And if a star button could change what it shows by itself, a wrong star could come from the button or from the ViewModel, and she would have to check both.</p>
<p>The rule that fixes both is <b>unidirectional data flow</b>, data that moves one way round. State flows down: the ViewModel gives the composables plain values to draw. Events flow up: an <b>event</b> is something that happened, usually something the user did, like a tap on a star. The composable doesn’t change anything. It reports the event, and the ViewModel decides what it means.</p>
<p>In code, it is state hoisting from the compose track, one level higher. <code>RecipesContent(state, onRefresh, onFavorite)</code> only draws. It gets everything as parameters and knows no ViewModel, so a preview can pass it a <code>RecipesUiState</code> full of sample recipes. <code>RecipesScreen(viewModel)</code> is the thin part on top: it collects <code>uiState</code> and connects the lambdas to the ViewModel’s functions.</p>
<p>The loop: a tap calls <code>onFavorite(recipe)</code>, that calls <code>viewModel.toggleFavorite(recipe)</code>, the table changes, a new <code>uiState</code> comes down, the screen redraws. Every change on the screen goes round that one path, so when something looks wrong, you know where to look.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'content', label: 'RecipesContent', sub: 'only draws' },
              { id: 'screen', label: 'RecipesScreen', sub: 'connects' },
              { id: 'vm', label: 'RecipesViewModel', sub: 'decides' },
              { id: 'room', label: 'Room', sub: 'recipes table' },
            ],
            predict: {
              q: 'Ada taps the star on Pancakes, drawn by <code>RecipesContent</code>. Which code changes <code>favorite</code>?',
              options: ['The ViewModel, once the event reaches it', 'The star button, where it is drawn', '<code>RecipesScreen</code>'],
              a: 0,
              why: 'The button only reports the tap. Deciding what it means is the ViewModel’s job.',
            },
            frames: [
              { at: 'content', packet: '☆', say: '<code>RecipesContent</code> draws the state it was given. Ada taps the star on Pancakes.' },
              { at: 'content', packet: 'onFavorite', tone: 'warm', say: 'The button doesn’t change anything itself. It calls the lambda it was given: an event goes up.' },
              { at: 'screen', say: '<code>RecipesScreen</code> passed <code>{ viewModel.toggleFavorite(it) }</code> as that lambda, so the event reaches the ViewModel.' },
              { at: 'vm', packet: 'toggleFavorite', say: 'The ViewModel decides what a star means: write the opposite <code>favorite</code> into Room.' },
              { at: 'room', packet: 'update', mark: { room: 'ok' }, say: 'Room changes the row, and its Flow emits the new list.' },
              { at: 'vm', packet: 'new uiState', tone: 'ok', say: 'The ViewModel copies the list into a new <code>RecipesUiState</code>. Now state goes down.' },
              { at: 'screen', say: '<code>RecipesScreen</code> collects it and passes it on as a parameter.' },
              { at: 'content', packet: '★', tone: 'ok', say: '<code>RecipesContent</code> redraws with a filled star. Events went up, state came down: one way round.' },
            ],
          });
        },
        code: `@Composable
fun RecipesScreen(viewModel: RecipesViewModel) {       // knows the ViewModel, draws nothing itself
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    RecipesContent(
        state = state,
        onRefresh = { viewModel.refresh(force = true) },
        onFavorite = { viewModel.toggleFavorite(it) }
    )
}

@Composable
fun RecipesContent(state: RecipesUiState, onRefresh: () -> Unit, onFavorite: (Recipe) -> Unit) {
    Column {                                            // only draws what it is given
        Button(onClick = onRefresh) { Text("Refresh") }
        if (state.isRefreshing) {
            Text("Refreshing…")
        }
        Text(state.note)
        LazyColumn {
            items(state.recipes, key = { it.id }) { recipe ->
                Row {
                    Text("\${recipe.title} · \${recipe.minutes} min")
                    TextButton(onClick = { onFavorite(recipe) }) {
                        Text(if (recipe.favorite) "★" else "☆")
                    }
                }
            }
        }
    }
}

@Preview
@Composable
fun RecipesPreview() {                                  // no ViewModel, no database
    RecipesContent(
        state = RecipesUiState(recipes = listOf(Recipe(id = 1, title = "Omelette", minutes = 10))),
        onRefresh = {},
        onFavorite = {}
    )
}

// in RecipesViewModel
fun toggleFavorite(recipe: Recipe) {
    viewModelScope.launch { dao.update(recipe.copy(favorite = !recipe.favorite)) }
}`,
        remember: 'State down as parameters, events up as lambdas; only the ViewModel changes state.',
        mistakes: [
          { title: 'Passing the ViewModel down to every composable', bad: `@Composable
fun RecipeRow(recipe: Recipe, viewModel: RecipesViewModel) {
    TextButton(onClick = { viewModel.toggleFavorite(recipe) }) { Text("☆") }
}`, good: `@Composable
fun RecipeRow(recipe: Recipe, onFavorite: (Recipe) -> Unit) {
    TextButton(onClick = { onFavorite(recipe) }) { Text("☆") }
}`, why: 'A row that needs the ViewModel can’t be previewed or reused without one. Hand it a lambda; only the top composable knows the ViewModel.' },
        ],
        terms: [
          { term: 'unidirectional data flow', def: 'State flows down from the ViewModel to the composables; events flow up from the composables to the ViewModel.' },
          { term: 'event', def: 'Something that happened, usually something the user did, like a tap. Composables report events; the ViewModel decides what they mean.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Connect the drawing part to the ViewModel: state down, events up.', code: `RecipesContent(
    state = [[state]],
    onRefresh = { viewModel.[[refresh]](force = true) },
    onFavorite = { viewModel.toggleFavorite([[it]]) }
)`, why: 'The state goes down as a parameter. Each lambda turns an event into a call on the ViewModel; <code>it</code> is the recipe that was tapped.' },
          { type: 'bug', prompt: 'Tapping a star does nothing at all. Tap the wrong line.', code: `@Composable
fun RecipeRow(recipe: Recipe, onFavorite: (Recipe) -> Unit) {
    Row {
        Text(recipe.title)
        TextButton(onClick = { }) {
            Text(if (recipe.favorite) "★" else "☆")
        }
    }
}`, bug: 4, fix: '        TextButton(onClick = { onFavorite(recipe) }) {', why: 'The event never goes up, so the ViewModel never hears about the tap. Call the lambda the row was given.' },
        ],
        quiz: [
          { q: 'In unidirectional data flow, which way do events go?', options: ['Up, from the composables to the ViewModel', 'Down, from the ViewModel to the composables', 'Both ways'], a: 0, why: 'Events go up, state comes down.' },
          { q: 'Why does <code>RecipesContent</code> take state and lambdas instead of the ViewModel?', options: ['It can be previewed and reused with any state', 'A composable may not hold a ViewModel', 'It makes the app start faster'], a: 0, why: 'A preview passes sample state and empty lambdas, with no database or server.' },
          { q: 'The note on screen is wrong. Where do you look first?', options: ['Where the ViewModel puts the note into <code>uiState</code>', 'In every composable that draws text', 'In the Room table'], a: 0, why: 'Only the ViewModel changes the state, so the note comes from there.' },
        ],
        docs: [['Compose UI architecture', 'https://developer.android.com/develop/ui/compose/architecture']],
      },

      {
        id: 'layers',
        title: 'Layers',
        tagline: 'UI on top, data below, and dependencies that only point down.',
        goals: ['Name the UI layer, the data layer and the optional domain layer', 'Place each class of the Recipes app in its layer and package', 'Check the rule: a layer may use the one below, never the one above'],
        level: 'intermediate', introduces: [],
        body: `
<p>Sam joins Ada on the Recipes app. All the files sit in one folder next to <code>MainActivity</code>, and he asks: “Where do I change how the server is called? May the DAO tell a screen that something changed?” A clear map of the app answers both.</p>
<p>Android’s guide to app architecture splits an app into <b>layers</b>: groups of classes with the same kind of job. The <b>UI layer</b> shows data and reacts to the user: <code>RecipesScreen</code>, <code>RecipesContent</code> and <code>RecipesViewModel</code>. The <b>data layer</b> gets and saves data: <code>RecipeDao</code> and the database, <code>RecipeApi</code> and <code>Session</code>, DataStore. A third one, the <b>domain layer</b>, may sit between them for rules several screens share. It is optional and gets its own lesson.</p>
<p>The rule that makes layers useful: a class may use classes of its own layer or the layer below, never the one above. <code>RecipesViewModel</code> may use <code>RecipeDao</code>, and <code>RecipeDao</code> never knows that a ViewModel or a screen exists. So the data layer works for any screen, and can be tested with no screen at all. News still goes up: Room’s <code>Flow</code> emits, and whoever collects it hears about the change, without the DAO knowing who that is.</p>
<p>Each layer gets its own folder, called a <code>package</code>. The first line of a Kotlin file names it: <code>package com.example.recipes.data</code>. Using a class from another package needs an <code>import</code> line, such as <code>import com.example.recipes.data.RecipeDao</code>. That gives you a quick check: the imports of a data-layer file never mention <code>.ui</code>.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            predict: {
              q: 'The recipes table changes. How does <code>RecipesViewModel</code> hear about it without breaking the rule?',
              options: ['Room’s <code>Flow</code> emits, and the ViewModel collects it', '<code>RecipeDao</code> calls a function on <code>RecipesViewModel</code>', 'It can’t: the ViewModel must ask again'], a: 0,
              why: 'The ViewModel uses the DAO, not the other way round. A Flow carries news up without the DAO knowing who listens.',
            },
            nodes: [
              { id: 'screen', label: 'RecipesScreen<small>UI layer</small>', x: 22, y: 10 },
              { id: 'vm', label: 'RecipesViewModel<small>UI layer</small>', x: 72, y: 10 },
              { id: 'domain', label: 'use cases<small>domain layer, optional</small>', x: 50, y: 46, tone: 'muted', hidden: true },
              { id: 'dao', label: 'RecipeDao<small>data layer</small>', x: 16, y: 86, tone: 'ok' },
              { id: 'session', label: 'Session<small>data layer</small>', x: 50, y: 86, tone: 'ok' },
              { id: 'store', label: 'DataStore<small>data layer</small>', x: 84, y: 86, tone: 'ok' },
            ],
            frames: [
              { say: 'Every class of the Recipes app, sorted into layers: UI on top, data at the bottom.' },
              { add: [['screen', 'vm']], hl: ['screen', 'vm'], say: '<code>RecipesScreen</code> uses <code>RecipesViewModel</code>: both are in the UI layer, which is allowed.' },
              { add: [['vm', 'dao', '', 'ok'], ['vm', 'session', '', 'ok'], ['vm', 'store', '', 'ok']], hl: ['vm'], say: 'The ViewModel uses the data layer below it. Allowed: these arrows point down.' },
              { add: [['dao', 'vm', '✗', 'err']], hl: ['dao'], say: 'Could <code>RecipeDao</code> call the ViewModel? No: then the data layer would depend on one screen, and nothing else could use it or test it without that screen.' },
              { remove: [['dao', 'vm']], hl: ['dao', 'vm'], say: 'Instead, Room’s Flow emits, and the ViewModel, which collects it, hears the news. The dependency still points down.' },
              { show: ['domain'], hl: ['domain'], say: 'Rules that several screens share can get a layer in between: the domain layer. It is optional, and many apps don’t need it.' },
              { hl: ['dao', 'session', 'store'], say: 'In the project: a <code>ui</code> package and a <code>data</code> package. The data package can serve every screen, and none of its files imports from <code>ui</code>.' },
            ],
          });
        },
        code: `// app/src/main/java/com/example/recipes/
//     MainActivity.kt
//     ui/RecipesScreen.kt          RecipesScreen, RecipesContent
//     ui/RecipesViewModel.kt       RecipesViewModel, RecipesUiState
//     data/RecipesDatabase.kt      Recipe, RecipeDao, RecipesDatabase, RecipesDb
//     data/Session.kt              RecipeApi, Session, refreshRecipes

// ui/RecipesViewModel.kt
package com.example.recipes.ui

import com.example.recipes.data.RecipeDao      // UI uses data: allowed
import com.example.recipes.data.Session
// plus the imports for ViewModel, DataStore, Preferences, StateFlow...
// Android Studio adds those when you type the name

class RecipesViewModel(
    private val dao: RecipeDao,
    private val session: Session,
    private val store: DataStore<Preferences>
) : ViewModel() {
    // as in the last lessons
}

// data/RecipesDatabase.kt
package com.example.recipes.data
// no import from com.example.recipes.ui: the data layer knows no screen

@Dao
interface RecipeDao {
    @Query("SELECT * FROM recipes ORDER BY minutes")
    fun getAll(): Flow<List<Recipe>>                // news goes up as a Flow
}`,
        remember: 'UI layer on top, data layer below, domain layer optional in between; a layer uses the one below, never the one above.',
        mistakes: [
          { title: 'Making the data layer return screen state', bad: `package com.example.recipes.data

import com.example.recipes.ui.RecipesUiState

suspend fun loadScreen(dao: RecipeDao): RecipesUiState =
    RecipesUiState(recipes = dao.getAll().first())`, good: `package com.example.recipes.data

suspend fun loadRecipes(dao: RecipeDao): List<Recipe> =
    dao.getAll().first()
// the ViewModel puts the list into RecipesUiState`, why: '<code>RecipesUiState</code> belongs to one screen. Once the data layer imports it, it can’t serve any other screen. Return data; the ViewModel shapes it for its screen.' },
        ],
        terms: [
          { term: 'UI layer', def: 'The classes that show data and react to the user: composables and ViewModels.' },
          { term: 'data layer', def: 'The classes that get and save data: DAOs, the server API, DataStore.' },
          { term: 'domain layer', def: 'An optional layer between UI and data, for rules that several screens share.' },
          { term: 'package', def: 'A named folder of Kotlin files. <code>package com.example.recipes.data</code> on the first line says which one a file is in.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start a file of the UI layer that uses the DAO from the data layer.', code: `[[package]] com.example.recipes.ui

[[import]] com.example.recipes.data.RecipeDao`, why: 'The <code>package</code> line names the file’s folder. <code>import</code> brings in a class from another package.' },
          { type: 'bug', prompt: 'Sam put the DAO in the wrong layer. Tap the line to change.', code: `package com.example.recipes.ui

@Dao
interface RecipeDao {
    @Query("SELECT * FROM recipes ORDER BY minutes")
    fun getAll(): Flow<List<Recipe>>
}`, bug: 0, fix: 'package com.example.recipes.data', why: 'A DAO gets and saves data, so it belongs in the data layer. Move the file to the <code>data</code> folder too; Android Studio then writes this line for you.' },
        ],
        quiz: [
          { q: 'Which layer is <code>RecipesViewModel</code> in?', options: ['The UI layer', 'The data layer', 'The domain layer'], a: 0, why: 'It holds the state of one screen, so it belongs with the screen.' },
          { q: 'Which of these breaks the rule?', options: ['<code>RecipeDao</code> imports <code>RecipesViewModel</code>', '<code>RecipesViewModel</code> imports <code>RecipeDao</code>', 'Neither'], a: 0, why: 'Dependencies point down. The data layer must not know the UI layer.' },
          { q: 'Does every app need a domain layer?', options: ['No, it is optional', 'Yes, it sits between every ViewModel and the data'], a: 0, why: 'A ViewModel may use the data layer directly. The domain layer helps only when rules are shared or a ViewModel grows too big.' },
        ],
        docs: [['Guide to app architecture', 'https://developer.android.com/topic/architecture']],
      },

      {
        id: 'repository',
        title: 'Repositories',
        tagline: 'One class that knows where the recipes come from.',
        goals: ['Gather the DAO, the Session and DataStore behind one <code>RecipeRepository</code>', 'Give the ViewModel one repository instead of three data sources', 'Make the repository in <code>MainActivity</code> and pass it to <code>viewModel { }</code>'],
        level: 'intermediate', introduces: [],
        body: `
<p><code>RecipesViewModel</code> takes a DAO, a Session and a DataStore, and calls <code>refreshRecipes</code>, which knows every step of a refresh: check the time, call the server, keep the favorites, upsert. A Favorites ViewModel would need the same three and the same calls. And if the server changes, every ViewModel that touches it might change too.</p>
<p>A <b>repository</b> is a data-layer class that is the one door to one kind of data. <code>RecipeRepository</code> owns the recipes. It takes the DAO, the Session and the DataStore, and offers the rest of the app a small surface: <code>recipes</code>, a Flow of the list; <code>refresh(force)</code>; and <code>toggleFavorite(recipe)</code>. Each thing it talks to, Room, the server through <code>Session</code>, DataStore, is a <b>data source</b>. Android’s guide says the other layers never use data sources directly: only through a repository. It is the facade pattern from the patterns track: one simple entry point in front of several parts.</p>
<p>The ViewModel shrinks to <code>RecipesViewModel(private val repository: RecipeRepository)</code>. It no longer knows whether recipes come from Room, the server or both. Point the app at a new server, and only the repository and its sources change.</p>
<p>Someone still has to make the repository. For now, <code>MainActivity</code> does, in <code>onCreate</code>: <code>val repository = RecipeRepository(RecipesDb.get(this).recipeDao(), Session(api, dataStore), dataStore)</code>, then <code>viewModel { RecipesViewModel(repository) }</code>. The ViewModel gets what it needs through its constructor, the dependency inversion idea from the SOLID track.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            predict: {
              q: 'The server’s recipe call changes. With a repository in place, which classes change?',
              options: ['<code>Session</code> and <code>RecipeRepository</code>', 'Every ViewModel that shows recipes', 'Every composable that draws recipes'],
              a: 0,
              why: 'Only the repository talks to the server, through <code>Session</code>. The ViewModels only know the repository’s small surface.',
            },
            nodes: [
              { id: 'vm', label: 'RecipesViewModel', x: 25, y: 10 },
              { id: 'fav', label: 'FavoritesViewModel', x: 75, y: 10, tone: 'warm', hidden: true },
              { id: 'repo', label: 'RecipeRepository<small>recipes, refresh, toggleFavorite</small>', x: 50, y: 48, tone: 'ok', hidden: true },
              { id: 'dao', label: 'RecipeDao<small>Room</small>', x: 16, y: 88, tone: 'muted' },
              { id: 'session', label: 'Session<small>server</small>', x: 50, y: 88, tone: 'muted' },
              { id: 'store', label: 'DataStore<small>last refresh</small>', x: 84, y: 88, tone: 'muted' },
            ],
            frames: [
              { add: [['vm', 'dao'], ['vm', 'session'], ['vm', 'store']], say: 'Before: <code>RecipesViewModel</code> knows all three data sources and hands them to <code>refreshRecipes</code>.' },
              { show: ['fav'], add: [['fav', 'dao', '', 'err'], ['fav', 'session', '', 'err'], ['fav', 'store', '', 'err']], hl: ['fav'], say: 'A Favorites screen would need the same three, wired up the same way.' },
              { remove: [['vm', 'dao'], ['vm', 'session'], ['vm', 'store'], ['fav', 'dao'], ['fav', 'session'], ['fav', 'store']], show: ['repo'], add: [['repo', 'dao', '', 'ok'], ['repo', 'session', '', 'ok'], ['repo', 'store', '', 'ok']], hl: ['repo'], say: '<code>RecipeRepository</code> takes the three sources. It is now the only class that talks to them.' },
              { add: [['vm', 'repo'], ['fav', 'repo']], say: 'Both ViewModels use the repository: <code>recipes</code>, <code>refresh</code>, <code>toggleFavorite</code>. One door.' },
              { hl: ['session', 'repo'], say: 'The server’s recipe call changes: <code>Session</code> and the repository change. The ViewModels don’t notice.' },
              { hl: ['vm'], say: '<code>RecipesViewModel</code> now takes one parameter. It asks for recipes; where they come from is the repository’s job.' },
            ],
          });
        },
        code: `// data/RecipeRepository.kt
class RecipeRepository(
    private val dao: RecipeDao,
    private val session: Session,
    private val store: DataStore<Preferences>
) {
    val recipes: Flow<List<Recipe>> = dao.getAll()

    suspend fun refresh(force: Boolean) {           // refreshRecipes from the caching lesson, moved in
        val now = System.currentTimeMillis()
        val last = store.data.first()[LAST_REFRESH] ?: 0L
        if (!force && now - last < MAX_AGE) return
        val fresh = session.getRecipes()            // throws IOException when offline
        val favorites = dao.getAll().first().filter { it.favorite }.map { it.id }
        dao.upsertAll(fresh.map { it.toRecipe(favorite = favorites.contains(it.id)) })
        store.edit { it[LAST_REFRESH] = now }
    }

    suspend fun toggleFavorite(recipe: Recipe) {
        dao.update(recipe.copy(favorite = !recipe.favorite))
    }
}

// ui/RecipesViewModel.kt
class RecipesViewModel(private val repository: RecipeRepository) : ViewModel() {
    private val _uiState = MutableStateFlow(RecipesUiState())
    val uiState: StateFlow<RecipesUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.recipes.collect { list ->
                _uiState.value = _uiState.value.copy(recipes = list)
            }
        }
        refresh(force = false)
    }

    fun refresh(force: Boolean) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isRefreshing = true)
            try {
                repository.refresh(force)
                _uiState.value = _uiState.value.copy(isRefreshing = false, note = "")
            } catch (e: IOException) {
                _uiState.value = _uiState.value.copy(isRefreshing = false, note = "Offline: showing saved recipes")
            }
            // plus the HttpException and SerializationException catches from the caching lesson
        }
    }

    fun toggleFavorite(recipe: Recipe) {
        viewModelScope.launch { repository.toggleFavorite(recipe) }
    }
}

// MainActivity.kt, in onCreate
val repository = RecipeRepository(RecipesDb.get(this).recipeDao(), Session(api, dataStore), dataStore)
setContent {
    val recipesViewModel = viewModel { RecipesViewModel(repository) }
    RecipesScreen(recipesViewModel)
}`,
        remember: 'A repository is the one door to one kind of data; ViewModels use it and never the data sources behind it.',
        mistakes: [
          { title: 'Keeping a side door to the DAO', bad: `class RecipesViewModel(
    private val repository: RecipeRepository,
    private val dao: RecipeDao              // "just for the star"
) : ViewModel()`, good: `class RecipesViewModel(private val repository: RecipeRepository) : ViewModel()

// the star: repository.toggleFavorite(recipe)`, why: 'With a second way in, some writes skip the repository, and changing how recipes are stored means hunting through ViewModels again.' },
        ],
        terms: [
          { term: 'repository', def: 'A data-layer class that is the one door to one kind of data, like <code>RecipeRepository</code> for recipes.' },
          { term: 'data source', def: 'One place a repository gets data from or saves it to: the DAO, the server through <code>Session</code>, DataStore.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the repository’s small surface: the list everyone reads, and the one way to star a recipe.', code: `class RecipeRepository(
    private val dao: RecipeDao,
    private val session: Session,
    private val store: DataStore<Preferences>
) {
    val recipes: Flow<List<Recipe>> = dao.[[getAll]]()

    suspend fun toggleFavorite(recipe: Recipe) {
        [[dao]].update(recipe.copy(favorite = !recipe.favorite))
    }
}`, why: 'The repository hands out the DAO’s Flow of the table, and it is the class that writes to the DAO. The ViewModels only see <code>recipes</code> and <code>toggleFavorite</code>.' },
          { type: 'bug', prompt: 'Kotlin says <code>Suspend function \'suspend fun toggleFavorite(recipe: Recipe): Unit\' can only be called from a coroutine or another suspend function.</code> Tap the wrong line.', code: `class RecipesViewModel(private val repository: RecipeRepository) : ViewModel() {
    fun toggleFavorite(recipe: Recipe) {
        repository.toggleFavorite(recipe)
    }
}`, bug: 2, fix: '        viewModelScope.launch { repository.toggleFavorite(recipe) }', why: 'The repository’s function writes to Room, so it is <code>suspend</code>. The ViewModel starts a coroutine for it in <code>viewModelScope</code>.' },
        ],
        quiz: [
          { q: 'What does <code>RecipesViewModel</code> need to know about where recipes come from?', options: ['Nothing: it asks the repository', 'The table name and the server address', 'Which one is faster'], a: 0, why: 'That is the repository’s job. The ViewModel only uses <code>recipes</code>, <code>refresh</code> and <code>toggleFavorite</code>.' },
          { q: 'Which of these is a data source?', options: ['<code>RecipeDao</code>', '<code>RecipeRepository</code>', '<code>RecipesViewModel</code>'], a: 0, why: 'The DAO talks to one place, Room. The repository sits in front of the sources.' },
          { q: 'Where is the repository made, for now?', options: ['In <code>MainActivity.onCreate</code>, then passed to <code>viewModel { }</code>', 'Inside each composable', 'Inside <code>RecipeDao</code>'], a: 0, why: 'The Activity builds the parts and hands the repository to the ViewModel through its constructor.' },
        ],
        docs: [['Data layer', 'https://developer.android.com/topic/architecture/data-layer']],
      },

      {
        id: 'ssot',
        title: 'Single source of truth',
        tagline: 'Every piece of data has one owner; everyone else reads it from there.',
        goals: ['Name the one owner of each piece of data in the Recipes app', 'Change data only through its owner, and let the change come back by itself', 'Explain why the offline-first loop never shows two different answers'],
        level: 'intermediate', introduces: [],
        body: `
<p>Sam adds a quick fix: when Ada taps a star, the ViewModel also flips <code>favorite</code> in its own <code>uiState.recipes</code>, “so it feels faster”. Now there are two copies of one fact. A refresh replaces the list and the star blinks; on the Favorites screen, which reads the table, the recipe isn’t starred yet. Two copies, two answers.</p>
<p>The rule is <b>single source of truth</b>: every piece of data has exactly one owner, the place where it really lives. Only the owner changes it. Everyone else reads it from the owner, and asks the owner for changes. For recipes, the owner is the recipes table in Room, and only <code>RecipeRepository</code> writes to it. <code>uiState.recipes</code> is not a second truth: it is a copy that follows the table’s Flow and is never changed by hand.</p>
<p>Together with caching, this gives the offline-first loop. A tap goes to the ViewModel, the ViewModel asks the repository, the repository writes Room. A refresh doesn’t hand the server’s answer to a screen either: the repository writes it into Room. Room’s Flow emits, and the new list comes back down to every screen that shows recipes. Every way in ends in the table, and every screen reads from it, with or without a network.</p>
<p>Screen-only values have owners too: <code>isRefreshing</code> and <code>note</code> belong to <code>RecipesViewModel</code>, and the “favorites only” setting to DataStore. Whenever you add a value, ask first: who owns it?</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'screen', label: 'screens', sub: 'Recipes, Favorites' },
              { id: 'vm', label: 'RecipesViewModel', sub: 'reads, asks' },
              { id: 'repo', label: 'RecipeRepository', sub: 'the only writer' },
              { id: 'room', label: 'Room', sub: 'the truth' },
              { id: 'server', label: 'server', sub: 'via Session' },
            ],
            predict: {
              q: 'Ada stars Soup on the Recipes screen. The Favorites screen also collects <code>repository.recipes</code>. Does it show Soup?',
              options: ['Yes: both read the table, which changed', 'Only after the next refresh', 'Only after the app restarts'],
              a: 0,
              why: 'The star was written into the one place both screens read from. Room’s Flow sends the new list to every collector.',
            },
            frames: [
              { at: 'screen', packet: '☆ Soup', say: 'Ada taps the star on Soup.' },
              { at: 'vm', packet: 'toggleFavorite', say: 'The ViewModel doesn’t touch its own list. It asks the owner’s door, the repository.' },
              { at: 'repo', packet: 'update', say: 'Only the repository writes recipes.' },
              { at: 'room', packet: '★ saved', tone: 'ok', mark: { room: 'ok' }, say: 'Room changes the row. This is the truth now.' },
              { at: 'screen', packet: '★ Soup', tone: 'ok', say: 'Room’s Flow emits. The ViewModel copies the list into <code>uiState</code>, and both screens show the star.' },
              { at: 'server', packet: 'refresh', tone: 'warm', say: 'Later, a refresh downloads the recipes from the server.' },
              { at: 'room', packet: 'upsertAll', tone: 'ok', say: 'The answer doesn’t go to a screen. The repository writes it into Room, keeping Ada’s stars.' },
              { at: 'screen', packet: 'new list', tone: 'ok', say: 'The Flow emits again and the same loop brings the list down. There is one copy that counts, so nothing can disagree.' },
            ],
          });
        },
        code: `// The truth for recipes: the Room table. Its only writer: RecipeRepository.
class RecipeRepository(
    private val dao: RecipeDao,
    private val session: Session,
    private val store: DataStore<Preferences>
) {
    val recipes: Flow<List<Recipe>> = dao.getAll()            // everyone reads from here

    suspend fun toggleFavorite(recipe: Recipe) {              // every change goes in here
        dao.update(recipe.copy(favorite = !recipe.favorite))
    }

    suspend fun refresh(force: Boolean) {
        // as before: the server's answer goes into Room with dao.upsertAll, never to a screen
    }
}

// A second screen reads the same truth
class FavoritesViewModel(repository: RecipeRepository) : ViewModel() {
    val favorites: StateFlow<List<Recipe>> = repository.recipes
        .map { list -> list.filter { it.favorite } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), listOf())
}
// Star Soup on the Recipes screen: Soup appears here too, without a single extra line.`,
        remember: 'One owner per piece of data: change it only through the owner, read it only from the owner.',
        mistakes: [
          { title: 'Changing the copy in the ViewModel too', bad: `fun toggleFavorite(recipe: Recipe) {
    val flipped = _uiState.value.recipes.map { if (it.id == recipe.id) it.copy(favorite = !it.favorite) else it }
    _uiState.value = _uiState.value.copy(recipes = flipped)   // a second copy of the truth
    viewModelScope.launch { repository.toggleFavorite(recipe) }
}`, good: `fun toggleFavorite(recipe: Recipe) {
    viewModelScope.launch { repository.toggleFavorite(recipe) }
    // Room's Flow brings the change back into uiState
}`, why: 'Now the ViewModel’s list and the table can disagree, for example when the write fails or a refresh arrives in between. Write to the owner and let the Flow bring the change back.' },
        ],
        terms: [
          { term: 'single source of truth', def: 'The one owner of a piece of data. Only it changes the data; everyone else reads from it and asks it for changes.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the Favorites screen read the same truth as the Recipes screen.', code: `class FavoritesViewModel(repository: RecipeRepository) : ViewModel() {
    val favorites: StateFlow<List<Recipe>> = repository.[[recipes]]
        .map { list -> list.filter { it.[[favorite]] } }
        .[[stateIn]](viewModelScope, SharingStarted.WhileSubscribed(5000), listOf())
}`, why: 'It reads the repository’s Flow of the table, keeps the starred ones, and shares the result as a StateFlow for the screen.' },
          { type: 'bug', prompt: 'Stars never appear on any screen, and the app forgets them anyway. Tap the wrong line.', code: `class RecipeRepository(private val dao: RecipeDao) {
    val recipes: Flow<List<Recipe>> = dao.getAll()
    private val starred = mutableListOf<Int>()

    suspend fun toggleFavorite(recipe: Recipe) {
        starred.add(recipe.id)
    }
}`, bug: 5, fix: '        dao.update(recipe.copy(favorite = !recipe.favorite))', why: 'The star went into a private list that no screen reads and that is gone when the app closes. Write it into the table, the one truth, and Room’s Flow shows it everywhere.' },
        ],
        quiz: [
          { q: 'In the Recipes app, what is the single source of truth for recipes?', options: ['The recipes table in Room', '<code>uiState.recipes</code> in the ViewModel', 'Whatever the server sent last'], a: 0, why: 'Every screen reads the table, and every change, from a tap or a refresh, is written there.' },
          { q: 'A refresh downloads 40 recipes. Where do they go first?', options: ['Into Room; the screens get them from Room’s Flow', 'Straight into <code>uiState</code>', 'Into the screen, then into Room'], a: 0, why: 'The server’s answer goes to the owner. The Flow brings it to every screen.' },
          { q: 'Who owns <code>isRefreshing</code>?', options: ['<code>RecipesViewModel</code>', 'Room', '<code>RecipesContent</code>'], a: 0, why: 'It is a screen-only value, so the screen’s ViewModel owns it.' },
        ],
        docs: [['Build an offline-first app', 'https://developer.android.com/topic/architecture/data-layer/offline-first']],
      },

      {
        id: 'usecases',
        title: 'Use cases',
        tagline: 'A small class for one rule that several ViewModels share.',
        goals: ['Recognise a rule that belongs neither in a ViewModel nor in a repository', 'Write a use case with <code>operator fun invoke</code> and call it like a function', 'Decide when an app doesn’t need one'],
        level: 'intermediate', introduces: ['operator', 'invoke'],
        body: `
<p>Ada adds a Tonight screen: recipes ready in 20 minutes or less. The Recipes screen gets a Quick chip that shows the same list. Now <code>TonightViewModel</code> and <code>RecipesViewModel</code> both filter with <code>it.minutes &lt;= 20</code>. Next month, “quick” means 25 minutes. Change two places, forget one, and the two screens disagree.</p>
<p>A <b>use case</b> is a small class with one job: one rule of the app that ViewModels share. It lives in the domain layer, between UI and data: it uses repositories, and ViewModels use it. Its name says what it does, starting with a verb: <code>GetQuickRecipesUseCase</code>. It keeps no data of its own; the repository still owns the recipes.</p>
<p>A use case has one public function. Kotlin lets you call an object as if it were a function when that function is named <code>invoke</code> and marked <code>operator</code>. With <code>operator fun invoke(): Flow&lt;List&lt;Recipe&gt;&gt;</code>, a ViewModel that holds the use case as <code>getQuickRecipes</code> writes <code>getQuickRecipes()</code>, which is the same as <code>getQuickRecipes.invoke()</code>.</p>
<p>When not to: if a ViewModel only passes a repository call straight through, a use case only adds a file. Add one when a rule is shared by several ViewModels, when it combines data from several repositories, or when a ViewModel gets too big. Many apps have only a few use cases, and some have none.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            predict: {
              q: '“Quick” should now mean 25 minutes instead of 20. With the use case, how many files change?',
              options: ['One: the use case', 'Two: one per ViewModel', 'Three: the ViewModels and the repository'],
              a: 0,
              why: 'The rule is written once, in the use case. Both ViewModels call it.',
            },
            nodes: [
              { id: 'rvm', label: 'RecipesViewModel<small>Quick chip</small>', x: 25, y: 10 },
              { id: 'tvm', label: 'TonightViewModel', x: 75, y: 10 },
              { id: 'uc', label: 'GetQuickRecipesUseCase<small>minutes &lt;= 20</small>', x: 50, y: 48, tone: 'ok', hidden: true },
              { id: 'repo', label: 'RecipeRepository<small>recipes</small>', x: 50, y: 88, tone: 'muted' },
            ],
            frames: [
              { add: [['rvm', 'repo', '&lt;= 20'], ['tvm', 'repo', '&lt;= 20']], say: 'Both ViewModels read <code>repository.recipes</code> and filter it with their own copy of the rule.' },
              { remove: [['rvm', 'repo']], add: [['rvm', 'repo', '&lt;= 25', 'ok']], hl: ['rvm'], say: '“Quick” now means 25 minutes. Sam changes <code>RecipesViewModel</code>…' },
              { remove: [['tvm', 'repo']], add: [['tvm', 'repo', '&lt;= 20', 'err']], hl: ['tvm'], say: '…and forgets <code>TonightViewModel</code>. A 25-minute recipe is quick on one screen and not on the other.' },
              { remove: [['rvm', 'repo'], ['tvm', 'repo']], show: ['uc'], add: [['uc', 'repo', '', 'ok']], hl: ['uc'], say: '<code>GetQuickRecipesUseCase</code> holds the rule, once. It reads the repository’s recipes and filters them.' },
              { add: [['rvm', 'uc', 'getQuickRecipes()'], ['tvm', 'uc', 'getQuickRecipes()']], say: 'Both ViewModels call it like a function. Neither knows the number any more.' },
              { hl: ['uc'], say: 'Change 20 to 25 in one place, and both screens follow.' },
              { hl: ['repo'], say: 'The repository stays about where recipes come from. What “quick” means is a rule of the app, and it sits in the domain layer.' },
            ],
          });
        },
        code: `// domain/GetQuickRecipesUseCase.kt
class GetQuickRecipesUseCase(private val repository: RecipeRepository) {
    operator fun invoke(): Flow<List<Recipe>> =
        repository.recipes.map { list -> list.filter { it.minutes <= 20 } }
}

// ui/TonightViewModel.kt
class TonightViewModel(getQuickRecipes: GetQuickRecipesUseCase) : ViewModel() {
    val recipes: StateFlow<List<Recipe>> = getQuickRecipes()      // calls invoke()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), listOf())
}

// ui/RecipesViewModel.kt: the Quick chip uses the same rule
class RecipesViewModel(
    private val repository: RecipeRepository,
    private val getQuickRecipes: GetQuickRecipesUseCase
) : ViewModel() {
    // as before, plus getQuickRecipes() when the chip is on
}

// MainActivity.kt, in onCreate
val repository = RecipeRepository(RecipesDb.get(this).recipeDao(), Session(api, dataStore), dataStore)
val getQuickRecipes = GetQuickRecipesUseCase(repository)
// viewModel { RecipesViewModel(repository, getQuickRecipes) } and viewModel { TonightViewModel(getQuickRecipes) }`,
        play: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

data class Recipe(val title: String, val minutes: Int)

class RecipeRepository {
    val recipes: Flow<List<Recipe>> = MutableStateFlow(
        listOf(Recipe("Omelette", 10), Recipe("Pancakes", 20), Recipe("Tomato soup", 35))
    )
}

class GetQuickRecipesUseCase(private val repository: RecipeRepository) {
    operator fun invoke(): Flow<List<Recipe>> =
        repository.recipes.map { list -> list.filter { it.minutes <= 20 } }
}

fun main() = runBlocking {
    val getQuickRecipes = GetQuickRecipesUseCase(RecipeRepository())
    val quick = getQuickRecipes().first()     // the same as getQuickRecipes.invoke().first()
    for (recipe in quick) {
        println("\${recipe.title}, \${recipe.minutes} min")
    }
    // Try: change 20 to 35 in the use case, and run it again.
}`,
        remember: 'A use case holds one shared rule; operator fun invoke lets ViewModels call it like a function. Add one only when it earns its file.',
        mistakes: [
          { title: 'A use case that only passes a call through', bad: `class GetRecipesUseCase(private val repository: RecipeRepository) {
    operator fun invoke(): Flow<List<Recipe>> = repository.recipes
}`, good: `class FavoritesViewModel(repository: RecipeRepository) : ViewModel() {
    val favorites = repository.recipes      // no rule to share: use the repository directly
        .map { list -> list.filter { it.favorite } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), listOf())
}`, why: 'This use case adds a file and a name but no rule. A ViewModel may use a repository directly.' },
        ],
        terms: [
          { term: 'use case', def: 'A small domain-layer class with one job, one rule shared by several ViewModels, like <code>GetQuickRecipesUseCase</code>.' },
          { term: 'operator fun invoke', def: 'A function named <code>invoke</code> and marked <code>operator</code>: then <code>getQuickRecipes()</code> calls <code>getQuickRecipes.invoke()</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the use case callable like a function.', code: `class GetQuickRecipesUseCase(private val repository: RecipeRepository) {
    [[operator]] fun [[invoke]](): Flow<List<Recipe>> =
        repository.recipes.map { list -> list.filter { it.minutes <= 20 } }
}`, why: 'Marked <code>operator</code> and named <code>invoke</code>, the function runs when you write <code>getQuickRecipes()</code>.' },
          { type: 'bug', prompt: 'Kotlin says <code>\'operator\' modifier is required on \'fun invoke(): Flow&lt;List&lt;Recipe&gt;&gt;\' defined in \'GetQuickRecipesUseCase\'.</code> Tap the line to change.', code: `class GetQuickRecipesUseCase(private val repository: RecipeRepository) {
    fun invoke(): Flow<List<Recipe>> =
        repository.recipes.map { list -> list.filter { it.minutes <= 20 } }
}

fun showQuick(repository: RecipeRepository) {
    val getQuickRecipes = GetQuickRecipesUseCase(repository)
    val quick = getQuickRecipes()
}`, bug: 1, fix: '    operator fun invoke(): Flow<List<Recipe>> =', why: 'Without <code>operator</code>, only <code>getQuickRecipes.invoke()</code> works. With it, the object can be called like a function.' },
        ],
        quiz: [
          { q: 'With <code>operator fun invoke()</code>, what does <code>getQuickRecipes()</code> do?', options: ['Calls <code>getQuickRecipes.invoke()</code>', 'Makes a new use case', 'Doesn’t compile; you need <code>.invoke()</code>'], a: 0, why: '<code>operator</code> lets the object be called like a function, which runs <code>invoke</code>.' },
          { q: 'Which layer is a use case in?', options: ['The domain layer', 'The data layer', 'The UI layer'], a: 0, why: 'It sits between the ViewModels, which use it, and the repositories it uses.' },
          { q: '<code>FavoritesViewModel</code> shows <code>repository.recipes</code> with one filter no other screen uses. Does it need a use case?', options: ['No: it can use the repository directly', 'Yes: every ViewModel must go through a use case'], a: 0, why: 'The domain layer is optional. A use case earns its place when a rule is shared or a ViewModel grows too big.' },
        ],
        docs: [['Domain layer', 'https://developer.android.com/topic/architecture/domain-layer']],
      },

      {
        id: 'ui-state-patterns',
        title: 'Loading, empty and error',
        tagline: 'Give every look of the screen its own place in the state.',
        goals: ['Name the four looks of a screen: loading, content, empty and error', 'Start the state as loading, so an empty list never shows by mistake', 'Choose between flags in a data class and a sealed interface'],
        level: 'intermediate', introduces: [],
        body: `
<p>Lin installs the Recipes app on her new phone and signs in. For a moment the list is empty, as if she had no recipes, then her 80 recipes appear. Nothing was broken, but for that moment the app told her something false. The state starts as <code>RecipesUiState()</code>, with an empty list, and the screen can’t tell “Room hasn’t answered yet” from “there are no recipes”.</p>
<p>A screen that loads data has four looks. <em>Loading</em>: nothing to show yet. <em>Content</em>: the list. <em>Empty</em>: loading worked, and there is nothing there. <em>Error</em>: loading failed and there is nothing saved to show. Give the state what it needs to tell them apart: <code>isLoading</code> starts as <code>true</code>, and the ViewModel sets it to <code>false</code> together with the first list from Room. The screen then picks one look with <code>if</code> and <code>else if</code>. <code>recipes.isEmpty()</code>, from the paging lesson, is <code>true</code> when the list has no items.</p>
<p>In the Requests and errors lesson the state was a sealed interface instead: <code>Loading</code>, <code>Ready</code> or <code>Failed</code>, only one at a time, and <code>when</code> made you draw every case. That fits a screen whose looks never appear together. The Recipes screen keeps a data class with flags, because during a refresh it shows the list and the refresh at the same time.</p>
<p>Make the empty and error looks helpful. “No recipes yet” with a Refresh button says that everything worked. An error with a Try again button gives the user a way out, instead of a blank screen.</p>`,
        visual(el) {
          const bar = '<div class="ui-m-bar">Recipes</div>';
          const blank = `${bar}<div class="ui-m-body"><span class="ui-m-btn">Refresh</span></div>`;
          const loading = `${bar}<div class="ui-m-center"><div class="ui-m-spin"></div><span class="ui-m-muted">Loading…</span></div>`;
          const list = (a, b, c) => `${bar}<div class="ui-m-body"><span class="ui-m-btn">Refresh</span><div class="ui-m-row"><div>${a}</div></div><div class="ui-m-row"><div>${b}</div></div><div class="ui-m-row"><div>${c}</div></div><span class="ui-m-muted">and more…</span></div>`;
          const lin = list('Omelette · 10 min', 'Pancakes · 20 min', 'Tomato soup · 25 min');
          const ada = list('Green salad · 10 min', 'Lemon pasta · 15 min', 'Curry · 40 min');
          const error = `${bar}<div class="ui-m-center"><b>Can’t load recipes</b><span class="ui-m-muted">Nothing saved yet, and no connection.</span><span class="ui-m-btn try">Try again</span></div>`;
          Lab.ui.phone(el, {
            logTitle: 'State',
            predict: {
              q: 'Before the fix, the state starts as <code>RecipesUiState()</code>, whose list is empty. Room needs a moment to read Lin’s 80 recipes. What does Lin see in that moment?',
              options: ['An empty list, as if she had no recipes', 'A spinner', 'Her 80 recipes'],
              a: 0,
              why: 'The screen draws whatever the state says, and an empty list looks exactly like “there are no recipes”.',
            },
            frames: [
              { screen: blank, log: 'before: recipes = []', say: 'Before: Lin opens the app. The state starts with an empty list, so the screen draws the Refresh button and no recipes at all.' },
              { screen: lin, log: 'Room answers: recipes = [80 recipes]', say: 'A fraction of a second later Room answers with her 80 recipes. For that moment the screen said something false.' },
              { screen: loading, log: 'after: isLoading = true, recipes = []', say: 'After the fix: the state starts with <code>isLoading = true</code>, so the screen shows “Loading…” until Room answers.' },
              { screen: lin, log: 'isLoading = false, recipes = [80 recipes]', say: 'Room answers. The ViewModel sets <code>isLoading = false</code> and the list in one copy, so the list look appears.' },
              { screen: error, log: 'recipes = [], note = "Offline: …"', say: 'Ada, on a new phone, on the metro. Room answers with an empty list and the refresh fails. Nothing saved and no connection: the error look, with Try again.' },
              { screen: error, tap: '.try', log: 'tap Try again → refresh(force = true)', say: 'The signal is back and Ada taps Try again. The tap goes up to the ViewModel as an event.' },
              { screen: loading, log: 'isRefreshing = true, recipes = []', say: 'Refreshing with an empty list: there is still nothing to show, so the screen shows the loading look.' },
              { screen: ada, log: 'isRefreshing = false, recipes = [40 recipes], note = ""', say: 'The refresh writes Room, Room’s Flow sends 40 recipes, and the list look replaces the loading look.' },
            ],
          });
        },
        code: `data class RecipesUiState(
    val isLoading: Boolean = true,            // Room hasn't answered yet
    val recipes: List<Recipe> = listOf(),
    val isRefreshing: Boolean = false,
    val note: String = "",
)

// RecipesViewModel:
init {
    viewModelScope.launch {
        repository.recipes.collect { list ->
            _uiState.value = _uiState.value.copy(isLoading = false, recipes = list)
        }
    }
    refresh(force = false)
}

@Composable
fun RecipesContent(state: RecipesUiState, onRefresh: () -> Unit, onFavorite: (Recipe) -> Unit) {
    // nothing to show yet: Room hasn't answered, or the first refresh is still running
    val nothingYet = state.isLoading || (state.isRefreshing && state.recipes.isEmpty())
    if (nothingYet) {
        Text("Loading…")
    } else if (state.recipes.isEmpty() && state.note != "") {
        Column {                                       // error: no recipes, refresh failed
            Text("Can’t load recipes. Check your connection.")
            Button(onClick = onRefresh) { Text("Try again") }
        }
    } else if (state.recipes.isEmpty()) {
        Column {                                       // empty: it worked, there is nothing
            Text("No recipes yet")
            Button(onClick = onRefresh) { Text("Refresh") }
        }
    } else {
        Column {                                       // content: the screen from the udf lesson
            Button(onClick = onRefresh) { Text("Refresh") }
            if (state.isRefreshing) {
                Text("Refreshing…")                    // a small sign; the list stays
            }
            Text(state.note)
            LazyColumn {
                items(state.recipes, key = { it.id }) { recipe ->
                    Row {
                        Text("\${recipe.title} · \${recipe.minutes} min")
                        TextButton(onClick = { onFavorite(recipe) }) {
                            Text(if (recipe.favorite) "★" else "☆")
                        }
                    }
                }
            }
        }
    }
}`,
        remember: 'Draw loading, content, empty and error; start as loading, so an empty list only shows when it is true.',
        mistakes: [
          { title: 'Hiding the list during every refresh', bad: `if (state.isLoading || state.isRefreshing) {
    Text("Loading…")              // the 40 recipes vanish on every refresh
} else {
    LazyColumn { items(state.recipes, key = { it.id }) { recipe -> Text(recipe.title) } }
}`, good: `if (state.isLoading) {
    Text("Loading…")              // only when there is nothing yet
} else {
    Column {
        if (state.isRefreshing) {
            Text("Refreshing…")   // a small sign; the list stays
        }
        LazyColumn { items(state.recipes, key = { it.id }) { recipe -> Text(recipe.title) } }
    }
}`, why: 'With flags, the list and <code>isRefreshing</code> can be on screen together. Hiding the list throws away what Ada was reading and makes the screen jump every time she refreshes.' },
        ],
        terms: [
          { term: 'loading state', def: 'The look of a screen while there is nothing to show yet, such as a spinner or “Loading…”.' },
          { term: 'empty state', def: 'The look when loading worked but the list has no items: a short message, often with a button.' },
          { term: 'error state', def: 'The look when loading failed and there is nothing saved to show: a message and a way to try again.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start the state as loading, and draw the empty look when the list has no items.', code: `data class RecipesUiState(
    val isLoading: Boolean = [[true]],
    val recipes: List<Recipe> = listOf(),
    val isRefreshing: Boolean = false,
    val note: String = "",
)

// in RecipesContent:
if (state.isLoading) {
    Text("Loading…")
} else if (state.recipes.[[isEmpty]]()) {
    Text("No recipes yet")
}`, why: 'Starting at <code>true</code> means the screen says “Loading…” until Room answers. <code>isEmpty()</code> is <code>true</code> for a list with no items.' },
          { type: 'bug', prompt: 'Room answers with 80 recipes, but the screen shows “Loading…” forever. Tap the wrong line.', code: `init {
    viewModelScope.launch {
        repository.recipes.collect { list ->
            _uiState.value = _uiState.value.copy(recipes = list)
        }
    }
    refresh(force = false)
}`, bug: 3, fix: '            _uiState.value = _uiState.value.copy(isLoading = false, recipes = list)', why: 'Nothing ever sets <code>isLoading</code> back to <code>false</code>, so the screen keeps choosing the loading look. Set it in the same copy as the first list.' },
        ],
        quiz: [
          { q: 'Room answered with an empty list, the refresh worked and <code>note</code> is <code>""</code>. Which look does the screen show?', options: ['Empty: “No recipes yet”', 'Loading', 'Error, with Try again'], a: 0, why: 'Loading is over and nothing failed. The list is really empty, so “No recipes yet” is true now.' },
          { q: 'Ada taps Refresh while 40 recipes are on screen. What should she see?', options: ['The 40 recipes, with a small sign that it is refreshing', 'Only a spinner until the refresh ends', 'An empty screen'], a: 0, why: 'Flags let the list and <code>isRefreshing</code> be true together, so nothing she was reading disappears.' },
          { q: 'When does a sealed interface like <code>Loading</code>, <code>Ready</code>, <code>Failed</code> fit best?', options: ['When the looks never appear together', 'When the list must stay on screen during a refresh', 'Never: flags are always better'], a: 0, why: 'A sealed value is one look at a time, and <code>when</code> makes you draw each one. Flags fit when two things show together.' },
        ],
        docs: [['UI layer', 'https://developer.android.com/topic/architecture/ui-layer']],
      },

      {
        id: 'mvvm-mvi',
        title: 'MVVM and MVI',
        tagline: 'A function per event, or every event as a value through one function.',
        goals: ['Tell MVVM and MVI apart by how the screen sends its events', 'Write a sealed intent type and a <code>reduce</code> function that returns the next state', 'Choose the style that fits a screen'],
        level: 'intermediate', introduces: [],
        body: `
<p>The Recipes screen already has a style, even if it has no name yet. The screen draws <code>uiState</code>, and for each event it calls one function on the ViewModel: <code>refresh(force = true)</code> or <code>toggleFavorite(recipe)</code>. That style is <em>MVVM</em>: Model (the data and the repository), View (the composables), ViewModel. Most Android screens are written this way.</p>
<p>Now Ada wants a cooking screen with a servings counter: + adds one, − takes one away, never below 1. In <em>MVI</em> (Model, View, Intent) the screen sends every event as a value of one sealed type, <code>ServingsIntent</code>. Here an <em>intent</em> means “what the user wants to do”; it has nothing to do with Android’s <code>Intent</code> class. The ViewModel has one entry point, <code>onIntent(intent)</code>.</p>
<p><code>onIntent</code> hands the current state and the intent to one function, <code>reduce</code>, which returns the next state. It is the state machine from the patterns track: states, events, and every allowed move in one <code>when</code>. Because <code>reduce</code> only computes, the same intents always give the same state. You can test it with plain values and print a list of every intent the user sent. Work that has to wait, like a refresh, stays in the ViewModel, outside <code>reduce</code>.</p>
<p>MVVM is less code and fits most screens. MVI pays off when many events change the same state, as in a long form or an editor. Both keep the state in a ViewModel and let it flow down to the screen.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            outTitle: 'Intents sent',
            code: `fun onIntent(intent: ServingsIntent) {
    _uiState.value = reduce(_uiState.value, intent)
}

fun reduce(state: ServingsUiState, intent: ServingsIntent): ServingsUiState =
    when (intent) {
        ServingsIntent.More -> state.copy(servings = state.servings + 1)
        ServingsIntent.Fewer ->
            if (state.servings > 1) state.copy(servings = state.servings - 1) else state
    }`,
            predict: {
              q: 'The counter shows 1 serving. Ada taps −, so the screen sends <code>Fewer</code>. What does <code>reduce</code> return?',
              options: ['The same state: 1 serving', 'A state with 0 servings', 'An error'],
              a: 0,
              why: 'The <code>if</code> only takes one away while there is more than 1. Otherwise <code>reduce</code> gives back the state it got.',
            },
            frames: [
              { line: 1, vars: { servings: 2 }, say: 'The cooking screen shows 2 servings. Every tap becomes an intent, sent to <code>onIntent</code>.' },
              { line: 1, vars: { intent: 'More' }, out: 'More', say: 'Ada taps +. The screen calls <code>onIntent(ServingsIntent.More)</code>.' },
              { line: [2, 7], vars: { servings: 3 }, say: '<code>reduce</code> gets the state and the intent. For <code>More</code> it returns a copy with one more serving, and that copy becomes the new state.' },
              { line: [8, 9], vars: { intent: 'Fewer', servings: 2 }, out: 'Fewer', say: 'She taps −. <code>Fewer</code>: 3 is more than 1, so the copy has 2.' },
              { line: [8, 9], vars: { servings: 1 }, out: 'Fewer', say: '− again: 2 is more than 1, so the copy has 1.' },
              { line: [8, 9], vars: { servings: 1 }, out: 'Fewer', say: '− once more: 1 is not more than 1, so <code>reduce</code> returns the same state. The rule “at least 1” lives in exactly one place.' },
              { line: 2, say: 'Every change went through <code>reduce</code>. Send the same four intents again, in a test, and you get 1 again.' },
            ],
          });
        },
        code: `data class ServingsUiState(val servings: Int = 2)

// MVVM: one function per event
class ServingsViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(ServingsUiState())
    val uiState: StateFlow<ServingsUiState> = _uiState.asStateFlow()

    fun more() {
        _uiState.value = _uiState.value.copy(servings = _uiState.value.servings + 1)
    }

    fun fewer() {
        val now = _uiState.value.servings
        if (now > 1) {
            _uiState.value = _uiState.value.copy(servings = now - 1)
        }
    }
}
// screen: Button(onClick = { viewModel.more() }) { Text("+") }

// MVI: every event is a value, and one function computes the next state
sealed interface ServingsIntent {
    object More : ServingsIntent
    object Fewer : ServingsIntent
}

fun reduce(state: ServingsUiState, intent: ServingsIntent): ServingsUiState = when (intent) {
    ServingsIntent.More -> state.copy(servings = state.servings + 1)
    ServingsIntent.Fewer -> if (state.servings > 1) state.copy(servings = state.servings - 1) else state
}

class ServingsMviViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(ServingsUiState())
    val uiState: StateFlow<ServingsUiState> = _uiState.asStateFlow()

    fun onIntent(intent: ServingsIntent) {
        _uiState.value = reduce(_uiState.value, intent)
    }
}
// screen: Button(onClick = { viewModel.onIntent(ServingsIntent.More) }) { Text("+") }`,
        play: `data class ServingsUiState(val servings: Int = 2)

sealed interface ServingsIntent {
    object More : ServingsIntent
    object Fewer : ServingsIntent
}

fun reduce(state: ServingsUiState, intent: ServingsIntent): ServingsUiState = when (intent) {
    ServingsIntent.More -> state.copy(servings = state.servings + 1)
    ServingsIntent.Fewer -> if (state.servings > 1) state.copy(servings = state.servings - 1) else state
}

fun main() {
    var state = ServingsUiState()
    val taps = listOf(ServingsIntent.More, ServingsIntent.Fewer, ServingsIntent.Fewer, ServingsIntent.Fewer)
    for (intent in taps) {
        state = reduce(state, intent)
        println(state)
    }
    // Add an intent Reset that goes back to 2 servings.
    // Kotlin points at the when until reduce handles it.
}`,
        remember: 'MVVM: one ViewModel function per event. MVI: one sealed intent type, one onIntent, and reduce(state, intent) returns the next state.',
        mistakes: [
          { title: 'A second way in, next to onIntent', bad: `class ServingsMviViewModel : ViewModel() {
    fun onIntent(intent: ServingsIntent) {
        _uiState.value = reduce(_uiState.value, intent)
    }

    fun setServings(n: Int) {            // skips reduce
        _uiState.value = ServingsUiState(n)
    }
}
// setServings(0) shows 0 servings`, good: `sealed interface ServingsIntent {
    object More : ServingsIntent
    object Fewer : ServingsIntent
    class SetTo(val servings: Int) : ServingsIntent
}
// reduce handles SetTo too, and keeps the “at least 1” rule`, why: 'The point of MVI is that every change goes through <code>reduce</code>. A function that skips it also skips its rules, and the list of intents no longer tells the whole story.' },
        ],
        terms: [
          { term: 'MVVM', def: 'Model, View, ViewModel: the screen draws the ViewModel’s state and calls one of its functions for each event.' },
          { term: 'MVI', def: 'Model, View, Intent: the screen sends every event as a value of one sealed type to a single <code>onIntent</code>.' },
          { term: 'intent (MVI)', def: 'A value that describes what the user wants, like <code>ServingsIntent.More</code>. Not Android’s <code>Intent</code> class.' },
          { term: 'reducer', def: 'A function like <code>reduce(state, intent)</code> that only computes the next state from the current one and an intent.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare the intents and send every one through <code>reduce</code>.', code: `[[sealed]] interface ServingsIntent {
    object More : ServingsIntent
    object Fewer : ServingsIntent
}

fun onIntent(intent: ServingsIntent) {
    _uiState.value = [[reduce]](_uiState.value, intent)
}`, why: 'A sealed type lists every intent, so the <code>when</code> in <code>reduce</code> must handle each one. <code>onIntent</code> stores what <code>reduce</code> returns.' },
          { type: 'bug', prompt: 'Ada taps − three times and the counter shows 0 servings, then −1. Tap the wrong line.', code: `fun reduce(state: ServingsUiState, intent: ServingsIntent): ServingsUiState = when (intent) {
    ServingsIntent.More -> state.copy(servings = state.servings + 1)
    ServingsIntent.Fewer -> state.copy(servings = state.servings - 1)
}`, bug: 2, fix: '    ServingsIntent.Fewer -> if (state.servings > 1) state.copy(servings = state.servings - 1) else state', why: 'The rule “at least 1” belongs in <code>reduce</code>, the one place every change passes through. Take one away only while there is more than 1.' },
        ],
        quiz: [
          { q: 'In MVI, how does the screen add a serving?', options: ['<code>viewModel.onIntent(ServingsIntent.More)</code>', '<code>viewModel.more()</code>', '<code>state.servings += 1</code>'], a: 0, why: 'Every event is a value sent to the one entry point. <code>viewModel.more()</code> is the MVVM way.' },
          { q: 'What does <code>reduce</code> take and give back?', options: ['The current state and an intent in, the next state out', 'An intent in, a network result out', 'Nothing: it changes the screen directly'], a: 0, why: 'It only computes. That is why the same intents always lead to the same state.' },
          { q: 'A settings screen has two switches that never affect each other. Which style fits?', options: ['MVVM: one function per switch', 'MVI with a reducer'], a: 0, why: 'MVI’s extra type pays off when many events change the same state. Two separate switches don’t need it.' },
        ],
        docs: [['UI State production', 'https://developer.android.com/topic/architecture/ui-layer/state-production']],
      },

      {
        id: 'di',
        title: 'Dependency injection',
        tagline: 'Build the app’s shared objects in one place, once, and hand them out.',
        goals: ['Explain why <code>onCreate</code> is the wrong place to build the app’s objects', 'Build them once in an <code>AppContainer</code>, kept by your own <code>Application</code> class', 'Hand dependencies to ViewModels from the container'],
        level: 'intermediate', introduces: ['Application'],
        body: `
<p>Right now <code>MainActivity.onCreate</code> builds the whole app: the DAO, the <code>Session</code>, the <code>RecipeRepository</code>, the use case, and then the ViewModels. <code>onCreate</code> runs again on every turn of the phone, so each turn builds a new repository that nobody uses: <code>viewModel { }</code> keeps the first ViewModel and its first repository. And every new class means one more line there, in the right order.</p>
<p>In the SOLID track you met <em>dependency injection</em>: a class asks for what it needs in its constructor, and someone else hands it over. <code>RecipesViewModel(repository)</code> already does that. What is missing is a good “someone else”: one place that builds the shared objects, once, and hands out the same ones. That place is called a <em>container</em>, here <code>AppContainer</code>.</p>
<p>An Activity comes and goes, so it can’t keep the container. The <code>Application</code> class can: Android makes one <code>Application</code> object when the app’s process starts, before any Activity, and it lives as long as the process. Write <code>class RecipesApp : Application()</code> and name it in the manifest with <code>android:name=".RecipesApp"</code>, so Android makes yours. <code>by lazy</code> builds the container the first time someone asks for it.</p>
<p>In the Activity, <code>application</code> is that object. Its type is the plain <code>Application</code>, so <code>application as RecipesApp</code> tells Kotlin “treat this as my <code>RecipesApp</code>”, and then <code>container</code> is reachable. After a turn of the phone, <code>onCreate</code> asks the container again and gets the same objects. You still write every line of the container yourself, in order. The next lesson hands that job to a library.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 340,
            predict: {
              q: 'The wiring is in <code>onCreate</code>. Ada opens the app and turns the phone three times. How many <code>RecipeRepository</code> objects have been built?',
              options: ['4: one for every time <code>onCreate</code> ran', '1: the ViewModel keeps it', '3: one for every turn'],
              a: 0,
              why: '<code>onCreate</code> builds one every time it runs: once at the start and once per turn. <code>viewModel { }</code> only uses the first, so three are built for nothing.',
            },
            nodes: [
              { id: 'act', label: 'MainActivity<small>onCreate</small>', x: 18, y: 10 },
              { id: 'vm', label: 'RecipesViewModel', x: 18, y: 48 },
              { id: 'r1', label: 'RecipeRepository<small>#1</small>', x: 52, y: 24, hidden: true },
              { id: 'r2', label: 'RecipeRepository<small>#2, unused</small>', x: 52, y: 52, tone: 'err', hidden: true },
              { id: 'app', label: 'RecipesApp<small>one per app</small>', x: 84, y: 10, tone: 'ok', hidden: true },
              { id: 'box', label: 'AppContainer', x: 84, y: 46, tone: 'ok', hidden: true },
              { id: 'repo', label: 'RecipeRepository<small>the only one</small>', x: 56, y: 84, tone: 'ok', hidden: true },
              { id: 'tvm', label: 'TonightViewModel', x: 18, y: 84, hidden: true },
            ],
            frames: [
              { say: 'Before: all the wiring lives in <code>MainActivity.onCreate</code>.' },
              { show: ['r1'], add: [['act', 'r1', 'builds'], ['vm', 'r1', 'uses', 'accent']], hl: ['r1'], say: '<code>onCreate</code> builds repository #1, and <code>viewModel { }</code> hands it to the new <code>RecipesViewModel</code>.' },
              { show: ['r2'], add: [['act', 'r2', 'builds again', 'err']], hl: ['act', 'r2'], say: 'Ada turns the phone. <code>onCreate</code> runs again and builds repository #2. <code>viewModel { }</code> returns the old ViewModel, so #2 is never used.' },
              { show: ['app', 'box'], gone: ['r1', 'r2'], remove: [['act', 'r1'], ['act', 'r2'], ['vm', 'r1']], add: [['app', 'box', 'keeps', 'ok']], hl: ['app'], say: 'After: <code>RecipesApp</code>, the app’s <code>Application</code>, is made once, before any screen. It keeps one <code>AppContainer</code>.' },
              { show: ['repo'], add: [['box', 'repo', 'builds once', 'ok']], hl: ['box', 'repo'], say: 'The container builds the repository, and everything it needs, the first time it is asked.' },
              { add: [['act', 'box', 'asks'], ['vm', 'repo', 'uses', 'accent']], hl: ['act', 'vm'], say: '<code>onCreate</code> asks the container for the repository and passes it to the ViewModel.' },
              { hl: ['act', 'repo'], say: 'Ada turns the phone. <code>onCreate</code> asks again and gets the same repository. Nothing new is built.' },
              { show: ['tvm'], add: [['tvm', 'repo', 'same one', 'ok']], hl: ['tvm', 'repo'], say: 'The Tonight screen’s ViewModel gets its use case from the same container, built on the same repository.' },
            ],
          });
        },
        code: `// Everything the app shares, built in one place
class AppContainer(context: Context) {
    private val store = context.dataStore
    private val dao = RecipesDb.get(context).recipeDao()
    private val session = Session(api, store)
    val repository = RecipeRepository(dao, session, store)
    val getQuickRecipes = GetQuickRecipesUseCase(repository)
}

// One per app: Android makes it before any Activity
class RecipesApp : Application() {
    val container by lazy { AppContainer(this) }     // built the first time it is read
}

// AndroidManifest.xml, name your class on <application>:
// <application android:name=".RecipesApp" ...>

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val container = (application as RecipesApp).container   // the same one after every turn
        setContent {
            val recipesViewModel = viewModel { RecipesViewModel(container.repository, container.getQuickRecipes) }
            RecipesScreen(recipesViewModel)
        }
    }
}`,
        play: `class RecipeRepository {
    init {
        println("RecipeRepository built")
    }
}

class RecipesViewModel(val repository: RecipeRepository)
class TonightViewModel(val repository: RecipeRepository)

class AppContainer {
    val repository by lazy { RecipeRepository() }
}

fun main() {
    val container = AppContainer()
    println("Container ready")
    val recipes = RecipesViewModel(container.repository)
    val tonight = TonightViewModel(container.repository)
    println(recipes.repository === tonight.repository)
    // Try: val repository = RecipeRepository() without by lazy.
    // Which line is printed first now?
}`,
        remember: 'Build shared objects once in a container, keep the container in your Application class, and hand the objects in through constructors.',
        mistakes: [
          { title: 'Forgetting android:name in the manifest', bad: `<application
    android:label="Recipes"
    ...>
// opening the app: java.lang.ClassCastException:
// android.app.Application cannot be cast to com.example.recipes.RecipesApp`, good: `<application
    android:name=".RecipesApp"
    android:label="Recipes"
    ...>`, why: 'Without <code>android:name</code>, Android makes a plain <code>Application</code>, not your <code>RecipesApp</code>. Then <code>application as RecipesApp</code> fails and the app crashes as it opens.' },
        ],
        terms: [
          { term: 'container', def: 'One object that builds the app’s shared objects, once, and hands them out, like <code>AppContainer</code>.' },
          { term: 'Application', def: 'The class Android makes one object of when the app’s process starts, before any Activity. Your own subclass is named in the manifest.' },
          { term: 'as', def: '<code>x as RecipesApp</code> tells Kotlin to treat <code>x</code> as a <code>RecipesApp</code>. If it is something else, the app crashes with a <code>ClassCastException</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep the container in your own Application class, and reach it from the Activity.', code: `class RecipesApp : [[Application]]() {
    val container by lazy { AppContainer(this) }
}

// MainActivity, in onCreate:
val container = (application [[as]] RecipesApp).container`, why: '<code>RecipesApp</code> extends <code>Application</code>, so there is one per app. <code>as</code> tells Kotlin the app’s <code>application</code> is your <code>RecipesApp</code>.' },
          { type: 'bug', prompt: 'Each turn of the phone builds a new container, a new repository and a new use case. Tap the wrong line.', code: `class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val container = AppContainer(this)
        setContent {
            val recipesViewModel = viewModel { RecipesViewModel(container.repository, container.getQuickRecipes) }
            RecipesScreen(recipesViewModel)
        }
    }
}`, bug: 3, fix: '        val container = (application as RecipesApp).container', why: '<code>onCreate</code> runs on every turn, so <code>AppContainer(this)</code> there builds everything again. The one in <code>RecipesApp</code> lives as long as the app.' },
        ],
        quiz: [
          { q: 'Why does the container live in <code>RecipesApp</code> and not in <code>MainActivity</code>?', options: ['RecipesApp lives as long as the app; the Activity is made again on every turn', 'An Activity can’t hold a property', 'Android deletes containers in Activities'], a: 0, why: 'There is one <code>Application</code> object per app process, so what it keeps is built once.' },
          { q: 'What does <code>(application as RecipesApp).container</code> do?', options: ['Treats the app’s Application object as your RecipesApp and reads its container', 'Makes a new RecipesApp', 'Turns the Activity into an Application'], a: 0, why: '<code>application</code> has the plain type <code>Application</code>. <code>as</code> lets Kotlin see your class and its <code>container</code>.' },
          { q: 'With <code>val container by lazy { AppContainer(this) }</code>, when is the container built?', options: ['The first time something reads <code>container</code>', 'Every time something reads it', 'When the app is installed'], a: 0, why: '<code>by lazy</code> runs the block once, on first use, and keeps the result.' },
        ],
        docs: [['Manual dependency injection', 'https://developer.android.com/training/dependency-injection/manual']],
      },

      {
        id: 'hilt',
        title: 'Hilt',
        tagline: 'Mark your classes, and let Hilt write the container.',
        goals: ['Set up Hilt with <code>@HiltAndroidApp</code> and <code>@AndroidEntryPoint</code>', 'Tell Hilt how to build your own classes with <code>@Inject constructor</code>', 'Get a ViewModel built by Hilt with <code>@HiltViewModel</code> and <code>hiltViewModel()</code>'],
        level: 'intermediate', introduces: ['HiltAndroidApp', 'AndroidEntryPoint', 'Inject', 'HiltViewModel', 'hiltViewModel'], ignore: ['Provides'],
        body: `
<p><code>AppContainer</code> works, but it grows with the app: every new class is one more line, written by hand, in the right order. <em>Hilt</em> is a library that writes the container for you. You mark your classes, and when the app is built, Hilt writes the code that builds each object, in the right order, and hands it to whoever asks.</p>
<p>Two marks set it up. <code>@HiltAndroidApp</code> on <code>RecipesApp</code> replaces <code>AppContainer</code>; the manifest still names <code>RecipesApp</code>. <code>@AndroidEntryPoint</code> on <code>MainActivity</code> lets Hilt hand things to that Activity and to the composables inside it. The Gradle lines that add Hilt go in once; they are at the top of the code below.</p>
<p>Then tell Hilt how to build each of your classes. <code>@Inject constructor</code> means: to make one, call this constructor, after building each of its parameters. So far the constructor was only the parentheses after the class name. To put a mark on it, Kotlin needs the word <code>constructor</code> before the parentheses, with the annotation in front: <code>class RecipeRepository @Inject constructor(...)</code>. Mark <code>RecipeRepository</code>, <code>GetQuickRecipesUseCase</code> and <code>RecipesViewModel</code> this way. The ViewModel also gets <code>@HiltViewModel</code>, and on the screen <code>hiltViewModel()</code> takes the place of <code>viewModel { ... }</code>: it gives back the same ViewModel after a turn, like before.</p>
<p>Hilt checks the whole picture when you build, before the app ever runs. If a class asks for a type Hilt can’t make, the build stops with a <code>[Dagger/MissingBinding]</code> error that names the type. (Hilt is built on a library called Dagger.) After this lesson the build still stops there: <code>RecipeDao</code>, <code>Session</code> and the DataStore have no constructor you can mark. The next lesson teaches Hilt to make them.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 340,
            predict: {
              q: 'The screen asks for a <code>RecipesViewModel</code>, and Hilt follows each <code>@Inject constructor</code> down. Where does it get stuck?',
              options: ['At the DAO, the Session and the DataStore: nothing says how to make them', 'At the ViewModel: Hilt can’t build ViewModels', 'Nowhere: Hilt can make any class'],
              a: 0,
              why: 'Hilt only knows how to build a class whose constructor is marked <code>@Inject</code>, and those three have none.',
            },
            nodes: [
              { id: 'ask', label: 'hiltViewModel()<small>the screen asks</small>', x: 18, y: 9, tone: 'muted' },
              { id: 'vm', label: 'RecipesViewModel<small>@HiltViewModel</small>', x: 62, y: 9 },
              { id: 'uc', label: 'GetQuickRecipesUseCase<small>@Inject constructor</small>', x: 71, y: 38 },
              { id: 'repo', label: 'RecipeRepository<small>@Inject constructor</small>', x: 27, y: 38 },
              { id: 'dao', label: 'RecipeDao<small>?</small>', x: 17, y: 78, tone: 'err', hidden: true },
              { id: 'session', label: 'Session<small>?</small>', x: 50, y: 78, tone: 'err', hidden: true },
              { id: 'store', label: 'DataStore<small>?</small>', x: 83, y: 78, tone: 'err', hidden: true },
            ],
            frames: [
              { add: [['ask', 'vm', 'asks for']], hl: ['vm'], say: 'The screen calls <code>hiltViewModel()</code>. Hilt has to hand over a <code>RecipesViewModel</code>, which is marked <code>@HiltViewModel</code>.' },
              { add: [['vm', 'repo', 'needs'], ['vm', 'uc', 'needs']], hl: ['repo', 'uc'], say: 'Its <code>@Inject constructor</code> asks for a <code>RecipeRepository</code> and a <code>GetQuickRecipesUseCase</code>. Both have an <code>@Inject constructor</code> too, so Hilt knows how to build them.' },
              { add: [['uc', 'repo', 'needs']], hl: ['uc'], say: 'The use case needs a repository as well. Hilt already knows how to build one.' },
              { show: ['dao', 'session', 'store'], add: [['repo', 'dao', 'needs', 'err'], ['repo', 'session', 'needs', 'err'], ['repo', 'store', 'needs', 'err']], hl: ['dao', 'session', 'store'], say: 'The repository needs a <code>RecipeDao</code>, a <code>Session</code> and a DataStore. None of them has an <code>@Inject constructor</code>, so Hilt doesn’t know how to make them.' },
              { hl: ['dao'], say: 'Hilt finds this while the app is built, not while it runs: the build stops with a <code>[Dagger/MissingBinding]</code> error that names the missing type.' },
              { hl: ['repo', 'uc', 'vm'], say: 'Everything above the bottom row is ready. Once Hilt learns to make those three, in the next lesson, it builds the repository, the use case and the ViewModel by itself.' },
            ],
          });
        },
        code: `// build.gradle.kts of the project:
// plugins {
//     id("com.google.dagger.hilt.android") version "2.60.1" apply false
// }
// app/build.gradle.kts:
// plugins {
//     id("com.google.devtools.ksp")             // already there for Room
//     id("com.google.dagger.hilt.android")
// }
// dependencies {
//     implementation("com.google.dagger:hilt-android:2.60.1")
//     ksp("com.google.dagger:hilt-compiler:2.60.1")
//     implementation("androidx.hilt:hilt-lifecycle-viewmodel-compose:1.4.0")   // hiltViewModel()
//     // needs compileSdk = 37 and AGP 9.2 or newer
// }

@HiltAndroidApp                       // Hilt writes the container; AppContainer is gone
class RecipesApp : Application()      // the manifest still says android:name=".RecipesApp"

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { RecipesScreen() }
    }
}

@Composable
fun RecipesScreen(viewModel: RecipesViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    RecipesContent(state, onRefresh = { viewModel.refresh(force = true) }, onFavorite = { viewModel.toggleFavorite(it) })
}

@HiltViewModel
class RecipesViewModel @Inject constructor(
    private val repository: RecipeRepository,
    private val getQuickRecipes: GetQuickRecipesUseCase,
) : ViewModel() { /* as before */ }

class GetQuickRecipesUseCase @Inject constructor(
    private val repository: RecipeRepository,
) { /* as before */ }

class RecipeRepository @Inject constructor(
    private val dao: RecipeDao,
    private val session: Session,
    private val store: DataStore<Preferences>,
) { /* as before */ }

// Build now, and Hilt stops with errors like this one:
// [Dagger/MissingBinding] com.example.recipes.data.RecipeDao cannot be provided without an @Provides-annotated method.
// RecipeDao, Session and the DataStore come in the next lesson.`,
        remember: '@HiltAndroidApp on the Application, @AndroidEntryPoint on the Activity, @Inject constructor on your classes, @HiltViewModel and hiltViewModel() for the ViewModel.',
        mistakes: [
          { title: 'Forgetting @AndroidEntryPoint', bad: `class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { RecipesScreen() }   // hiltViewModel() inside fails
    }
}`, good: `@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { RecipesScreen() }
    }
}`, why: 'Hilt only hands things to Android classes marked <code>@AndroidEntryPoint</code>. Without it, the build still works, but <code>hiltViewModel()</code> crashes the app when the screen opens.' },
        ],
        terms: [
          { term: 'Hilt', def: 'A library for dependency injection on Android. From your annotations it writes, at build time, the code that builds and hands out your objects.' },
          { term: '@Inject constructor', def: 'Marks the constructor Hilt calls to build your class. Hilt builds each parameter first. The word <code>constructor</code> is needed so the annotation has something to sit on.' },
          { term: '@HiltViewModel', def: 'Marks a ViewModel that Hilt may build. On the screen, <code>hiltViewModel()</code> asks for it, and gives back the same one after a turn.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let Hilt build the ViewModel, and ask for it on the screen.', code: `@[[HiltViewModel]]
class RecipesViewModel @[[Inject]] constructor(
    private val repository: RecipeRepository,
    private val getQuickRecipes: GetQuickRecipesUseCase,
) : ViewModel()

@Composable
fun RecipesScreen(viewModel: RecipesViewModel = [[hiltViewModel]]()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
}`, why: '<code>@HiltViewModel</code> marks a ViewModel Hilt may build, <code>@Inject</code> marks the constructor it calls, and <code>hiltViewModel()</code> asks for it.' },
          { type: 'bug', prompt: 'The build fails: <code>[Dagger/MissingBinding] com.example.recipes.data.RecipeRepository cannot be provided without an @Inject constructor or an @Provides-annotated method.</code> Tap the wrong line.', code: `class RecipeRepository(
    private val dao: RecipeDao,
    private val session: Session,
    private val store: DataStore<Preferences>,
) { /* ... */ }

@HiltViewModel
class RecipesViewModel @Inject constructor(
    private val repository: RecipeRepository,
    private val getQuickRecipes: GetQuickRecipesUseCase,
) : ViewModel()`, bug: 0, fix: 'class RecipeRepository @Inject constructor(', why: 'The ViewModel asks for a <code>RecipeRepository</code>, but nothing tells Hilt how to build one. <code>@Inject constructor</code> does.' },
        ],
        quiz: [
          { q: 'What does <code>@Inject constructor(...)</code> tell Hilt?', options: ['How to build this class: call this constructor after building its parameters', 'To keep one object for the whole app', 'To build it on a background thread'], a: 0, why: 'It marks the constructor Hilt calls. How many objects exist is a different question, for a later lesson.' },
          { q: 'Why does <code>class RecipeRepository @Inject constructor(...)</code> need the word <code>constructor</code>?', options: ['So the annotation has a constructor to sit on', 'It makes a second constructor', 'Hilt only builds classes that use the word'], a: 0, why: 'Without an annotation, the parentheses are enough. To mark the constructor, Kotlin needs the word in front of them.' },
          { q: 'A class asks for a type Hilt can’t make. When do you find out?', options: ['When you build: Hilt names the missing type', 'Only when that screen opens', 'Never: Hilt passes null'], a: 0, why: 'Hilt checks the whole picture at build time, so a missing binding is a build error. A missing <code>@AndroidEntryPoint</code> is the one you only find when the screen opens.' },
        ],
        docs: [['Dependency injection with Hilt', 'https://developer.android.com/training/dependency-injection/hilt-android'], ['Hilt Gradle setup', 'https://dagger.dev/hilt/gradle-setup']],
      },

      {
        id: 'hilt-modules',
        title: 'Hilt modules',
        tagline: 'Tell Hilt how to make the objects you can’t mark.',
        goals: ['Write a Hilt module with <code>@Module</code> and <code>@InstallIn</code>', 'Make objects you can’t edit with <code>@Provides</code> functions', 'Ask Hilt for the app’s <code>Context</code> with <code>@ApplicationContext</code>'],
        level: 'intermediate', introduces: ['InstallIn', 'SingletonComponent', 'Provides', 'ApplicationContext'],
        body: `
<p>The last lesson ended with a build that stops: Hilt can’t make a <code>RecipeDao</code>, a <code>Session</code> or the DataStore. There is no constructor to mark. Room writes the DAO’s code from your interface, the DataStore comes from the <code>dataStore</code> property of a <code>Context</code>, and <code>Session</code> needs the <code>api</code> object. In <code>AppContainer</code> you wrote one line for each. Hilt needs the same lines, in a place it can find.</p>
<p>That place is a <em>module</em>: an <code>object</code> marked <code>@Module</code>. Each of its functions marked <code>@Provides</code> makes one object. Hilt looks at the type the function returns, and calls it whenever something needs that type. Its parameters are handed in by Hilt too, so <code>provideSession(store: DataStore&lt;Preferences&gt;)</code> gets the DataStore that <code>provideStore</code> made.</p>
<p>The DAO and the DataStore need a <code>Context</code>. A parameter marked <code>@ApplicationContext</code> asks Hilt for the app’s own one, which it always has. It lives as long as the app, so unlike an Activity it is safe to keep. One more line: Hilt calls its containers <em>components</em>, and <code>@InstallIn(SingletonComponent::class)</code> says which one the module joins. <code>SingletonComponent</code> is the one for the whole app, so every class can use what the module makes; <code>::class</code> names the class itself. For now, write this line on every module. The next lesson shows what components mean for how long objects live.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 340,
            predict: {
              q: 'With <code>DataModule</code> in place, the screen calls <code>hiltViewModel()</code>. Which objects does Hilt build first?',
              options: ['The DAO and the DataStore, which need only the app’s Context', 'The RecipesViewModel, the one the screen asked for', 'The RecipeRepository, in the middle'],
              a: 0,
              why: 'A constructor or a <code>@Provides</code> function can only run once its parameters exist. So Hilt starts at the bottom and works up to what was asked for.',
            },
            nodes: [
              { id: 'ask', label: 'hiltViewModel()<small>the screen asks</small>', x: 18, y: 9, tone: 'muted' },
              { id: 'vm', label: 'RecipesViewModel<small>@Inject constructor</small>', x: 62, y: 9 },
              { id: 'repo', label: 'RecipeRepository<small>@Inject constructor</small>', x: 62, y: 38 },
              { id: 'dao', label: 'RecipeDao<small>@Provides</small>', x: 17, y: 66 },
              { id: 'session', label: 'Session<small>@Provides</small>', x: 52, y: 66 },
              { id: 'store', label: 'DataStore<small>@Provides</small>', x: 85, y: 66 },
              { id: 'ctx', label: 'Context<small>@ApplicationContext</small>', x: 50, y: 92, tone: 'muted' },
            ],
            frames: [
              { add: [['ask', 'vm', 'asks for']], hl: ['vm'], say: 'The screen calls <code>hiltViewModel()</code>. Hilt has to hand over a <code>RecipesViewModel</code>.' },
              { add: [['vm', 'repo', 'needs']], hl: ['repo'], say: 'Its <code>@Inject constructor</code> asks for a <code>RecipeRepository</code> (the use case needs one too). The repository has an <code>@Inject constructor</code> as well.' },
              { add: [['repo', 'dao', 'needs'], ['repo', 'session', 'needs'], ['repo', 'store', 'needs']], hl: ['dao', 'session', 'store'], say: 'The repository needs a DAO, a <code>Session</code> and a DataStore. This time Hilt finds a <code>@Provides</code> function for each, in <code>DataModule</code>.' },
              { add: [['dao', 'ctx', 'needs'], ['store', 'ctx', 'needs'], ['session', 'store', 'needs']], hl: ['ctx'], say: 'Those functions need the app’s <code>Context</code>, which Hilt always has, and <code>provideSession</code> needs the DataStore. Nothing is missing, so the build passes.' },
              { hl: ['dao', 'store', 'session'], say: 'When the screen opens, Hilt builds from the bottom up: the DAO and the DataStore, then the Session.' },
              { add: [['repo', 'dao', 'gets it', 'ok'], ['repo', 'session', 'gets it', 'ok'], ['repo', 'store', 'gets it', 'ok']], hl: ['repo'], say: 'With its three parameters ready, Hilt calls the repository’s constructor.' },
              { add: [['vm', 'repo', 'gets it', 'ok'], ['ask', 'vm', 'hands over', 'ok']], hl: ['vm'], say: 'Last, the ViewModel. It received everything through its constructor and never built a thing itself.' },
            ],
          });
        },
        code: `// data/DataModule.kt: how to make what has no constructor to mark
@Module
@InstallIn(SingletonComponent::class)        // join the component for the whole app
object DataModule {
    @Provides
    fun provideDao(@ApplicationContext context: Context): RecipeDao =
        RecipesDb.get(context).recipeDao()

    @Provides
    fun provideStore(@ApplicationContext context: Context): DataStore<Preferences> =
        context.dataStore

    @Provides
    fun provideSession(store: DataStore<Preferences>): Session =   // Hilt hands in the DataStore
        Session(api, store)
}
// Build again: it passes. hiltViewModel() can now build RecipesViewModel and everything it needs.`,
        remember: 'A @Module object, @InstallIn(SingletonComponent::class), and one @Provides function per object Hilt can’t build with a constructor.',
        mistakes: [
          { title: 'Asking for a plain Context', bad: `@Provides
fun provideDao(context: Context): RecipeDao =
    RecipesDb.get(context).recipeDao()
// [Dagger/MissingBinding] android.content.Context cannot be provided without an @Provides-annotated method.`, good: `@Provides
fun provideDao(@ApplicationContext context: Context): RecipeDao =
    RecipesDb.get(context).recipeDao()`, why: 'An app has many <code>Context</code>s, one per Activity among them, so Hilt won’t guess. <code>@ApplicationContext</code> asks for the app’s own, which lives as long as the app.' },
        ],
        terms: [
          { term: 'module (Hilt)', def: 'An <code>object</code> marked <code>@Module</code> and <code>@InstallIn</code> whose functions tell Hilt how to make objects it can’t build with a constructor.' },
          { term: '@Provides', def: 'Marks a module function that makes one object, like the DAO. Hilt hands in its parameters too.' },
          { term: '@InstallIn', def: '<code>@InstallIn(SingletonComponent::class)</code> puts a module in Hilt’s component for the whole app, so every class can use what it makes.' },
          { term: '@ApplicationContext', def: 'Marks a <code>Context</code> parameter that should get the app’s own <code>Context</code>, not an Activity’s.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Tell Hilt how to make the DAO, with the app’s Context.', code: `@[[Module]]
@InstallIn(SingletonComponent::class)
object DataModule {
    @[[Provides]]
    fun provideDao(@[[ApplicationContext]] context: Context): RecipeDao =
        RecipesDb.get(context).recipeDao()
}`, why: '<code>@Module</code> marks the object Hilt reads, <code>@Provides</code> marks a function that makes one object, and <code>@ApplicationContext</code> asks for the app’s Context.' },
          { type: 'bug', prompt: 'The build fails: <code>[Dagger/MissingBinding] com.example.recipes.data.Session cannot be provided without an @Inject constructor or an @Provides-annotated method.</code> Tap the wrong line.', code: `@Module
@InstallIn(SingletonComponent::class)
object DataModule {
    @Provides
    fun provideStore(@ApplicationContext context: Context): DataStore<Preferences> = context.dataStore

    fun provideSession(store: DataStore<Preferences>): Session = Session(api, store)
}`, bug: 6, fix: '    @Provides fun provideSession(store: DataStore<Preferences>): Session = Session(api, store)', why: 'Without <code>@Provides</code>, it is an ordinary function that Hilt never calls, so nothing makes a <code>Session</code>.' },
        ],
        quiz: [
          { q: 'Room writes <code>RecipeDao</code> for you. How does Hilt learn to make one?', options: ['A <code>@Provides</code> function in a <code>@Module</code>', 'Put <code>@Inject</code> on the DAO interface', 'Hilt finds DAOs by itself'], a: 0, why: 'You can’t mark a constructor in code Room writes, so a module function says how to get one.' },
          { q: '<code>provideSession</code> takes a <code>DataStore&lt;Preferences&gt;</code>. Where does it come from?', options: ['Hilt calls <code>provideStore</code> and hands it in', 'You pass it when you call <code>provideSession</code>', 'Kotlin makes an empty one'], a: 0, why: 'You never call <code>@Provides</code> functions yourself. Hilt calls them, and builds their parameters first.' },
          { q: 'What does <code>@ApplicationContext context: Context</code> get?', options: ['The app’s own Context, which lives as long as the app', 'The Context of the Activity on screen', 'A new Context every time'], a: 0, why: 'Hilt always has the app’s Context. Being as long-lived as the app, it is safe to keep.' },
        ],
        docs: [['Dependency injection with Hilt', 'https://developer.android.com/training/dependency-injection/hilt-android']],
      },

      {
        id: 'hilt-scopes',
        title: 'Scopes in Hilt',
        tagline: 'Decide how many of each object exist, and how long they live.',
        goals: ['Predict when Hilt builds a new object and when it hands out the same one', 'Keep one database for the whole app with <code>@Singleton</code>', 'Share one object inside a ViewModel with <code>@ViewModelScoped</code>'],
        level: 'intermediate', introduces: ['Singleton', 'ViewModelScoped'],
        body: `
<p>Now that Hilt builds everything, <code>RecipesDb</code> can go: a <code>@Provides</code> function can build the database with <code>Room.databaseBuilder</code>. But Sam spots a problem: the Recipes and Favorites screens each got their own database object, on the same file. Each one is expensive, and a write through one doesn’t wake the Flows that watch the other, so a star Ada adds can be missing from a Favorites list that is already showing.</p>
<p>By default Hilt builds a new object every time something asks for one. That is called <em>unscoped</em>, and for most classes it is right: <code>RecipeRepository</code> and <code>GetQuickRecipesUseCase</code> keep nothing of their own, so two of them cost almost nothing. A <em>scope</em> changes that: it tells Hilt to build one object and hand the same one to everyone, for as long as a certain lifetime lasts.</p>
<p><code>@Singleton</code> means one for the whole app, for as long as the app’s process lives. It survives turning the phone; only a new process, after Android has stopped the app, builds it again. Put it on the <code>@Provides</code> function of the database: opening one is expensive, and the app needs exactly one. A module in <code>SingletonComponent</code> may use <code>@Singleton</code>.</p>
<p><code>@ViewModelScoped</code> means one per ViewModel: everything built for the same ViewModel shares it, and the next ViewModel gets its own. Ada wants the Quick chip on the Recipes screen to mean 30 minutes, while Tonight keeps 20. A small class, <code>QuickLimit</code>, holds the number. Marked <code>@ViewModelScoped</code>, <code>RecipesViewModel</code> and the use case built for it get the same <code>QuickLimit</code>: the ViewModel sets 30, and its use case reads 30. <code>TonightViewModel</code> has its own, still at 20. It lives as long as its ViewModel, so it survives turning the phone too. A scope is a promise to keep an object in memory, so use one only when sharing really matters.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 360,
            predict: {
              q: '<code>provideDatabase</code> has no scope. <code>RecipesViewModel</code> and <code>FavoritesViewModel</code> each get a repository. How many <code>RecipesDatabase</code> objects are there?',
              options: ['2: one per repository', '1: Hilt always shares', '0: a database is only built when a query runs'],
              a: 0,
              why: 'Unscoped means a new object for every request. Two repositories ask, so <code>provideDatabase</code> runs twice.',
            },
            nodes: [
              { id: 'rvm', label: 'RecipesViewModel', x: 24, y: 8 },
              { id: 'tvm', label: 'FavoritesViewModel', x: 74, y: 8 },
              { id: 'r1', label: 'RecipeRepository<small>#1, unscoped</small>', x: 24, y: 38, hidden: true },
              { id: 'r2', label: 'RecipeRepository<small>#2, unscoped</small>', x: 74, y: 38, hidden: true },
              { id: 'db1', label: 'RecipesDatabase<small>#1</small>', x: 24, y: 68, tone: 'err', hidden: true },
              { id: 'db2', label: 'RecipesDatabase<small>#2, same file</small>', x: 74, y: 68, tone: 'err', hidden: true },
              { id: 'db', label: 'RecipesDatabase<small>@Singleton</small>', x: 50, y: 92, tone: 'ok', hidden: true },
            ],
            frames: [
              { say: 'Both screens are open. Each ViewModel asks Hilt for a <code>RecipeRepository</code>.' },
              { show: ['r1', 'r2'], add: [['rvm', 'r1', 'gets'], ['tvm', 'r2', 'gets']], hl: ['r1', 'r2'], say: 'The repository has no scope, so each request builds a new one. It keeps nothing of its own, so two are fine.' },
              { show: ['db1', 'db2'], add: [['r1', 'db1', '', 'err'], ['r2', 'db2', '', 'err']], hl: ['db1', 'db2'], say: 'Without a scope, <code>provideDatabase</code> runs for each repository too: two database objects on the same <code>recipes.db</code>. A star saved through #1 doesn’t wake the Flow of #2.' },
              { show: ['db'], gone: ['db1', 'db2'], remove: [['r1', 'db1'], ['r2', 'db2']], add: [['r1', 'db', 'same one', 'ok'], ['r2', 'db', 'same one', 'ok']], hl: ['db'], say: 'With <code>@Singleton</code> on <code>provideDatabase</code>, Hilt builds it once and hands the same one to every repository. A star saved through it reaches every Flow.' },
              { hl: ['rvm', 'tvm', 'db'], say: 'Ada turns the phone. The ViewModels survive, and the <code>@Singleton</code> database is still the same object.' },
              { hl: ['db'], say: 'In the background Android stops the app’s process. Next time a new process starts, and a new <code>@Singleton</code> database opens the same file. Nothing saved is lost.' },
            ],
          });
        },
        code: `@Module
@InstallIn(SingletonComponent::class)
object DataModule {
    @Provides
    @Singleton                                    // one database for the whole app
    fun provideDatabase(@ApplicationContext context: Context): RecipesDatabase =
        Room.databaseBuilder<RecipesDatabase>(context, "recipes.db")
            .setDriver(AndroidSQLiteDriver())
            .build()

    @Provides                                     // cheap: asks the one database for its DAO
    fun provideDao(db: RecipesDatabase): RecipeDao = db.recipeDao()

    // provideStore and provideSession as before
}

// One per ViewModel: how many minutes count as quick on this screen
@ViewModelScoped
class QuickLimit @Inject constructor() {
    var minutes = 20
}

// No scope: keeps nothing of its own, so a new one per request is fine
class GetQuickRecipesUseCase @Inject constructor(
    private val repository: RecipeRepository,
    private val quickLimit: QuickLimit,
) {
    operator fun invoke(): Flow<List<Recipe>> {
        val limit = quickLimit.minutes
        return repository.recipes.map { list -> list.filter { it.minutes <= limit } }
    }
}

@HiltViewModel
class RecipesViewModel @Inject constructor(
    private val repository: RecipeRepository,
    private val getQuickRecipes: GetQuickRecipesUseCase,
    private val quickLimit: QuickLimit,           // the same object as inside getQuickRecipes
) : ViewModel() {
    // as before; the Quick chip sets quickLimit.minutes = 30, then calls getQuickRecipes()
}
// TonightViewModel gets its own QuickLimit and its own use case: still 20 minutes.`,
        remember: 'Unscoped: a new object per request. @Singleton: one for the app process. @ViewModelScoped: one per ViewModel.',
        mistakes: [
          { title: 'A longer scope than the object needs', bad: `@Singleton
class QuickLimit @Inject constructor() {
    var minutes = 20
}
// Ada picks 30 on the Recipes screen: Tonight jumps to 30 too`, good: `@ViewModelScoped
class QuickLimit @Inject constructor() {
    var minutes = 20
}`, why: 'With <code>@Singleton</code>, every ViewModel in the app gets the same <code>QuickLimit</code>, so one screen’s choice leaks into the other. Pick the shortest lifetime that does the job, and no scope at all when nothing needs sharing.' },
        ],
        terms: [
          { term: 'unscoped', def: 'Hilt’s default: a new object for every class that asks for one.' },
          { term: 'scope', def: 'An annotation that makes Hilt build one object and share it for a certain lifetime.' },
          { term: '@Singleton', def: 'One object for the whole app, for as long as the app’s process lives.' },
          { term: '@ViewModelScoped', def: 'One object per ViewModel, shared by everything inside it, for as long as that ViewModel lives.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep one database for the app, and one quick limit per ViewModel.', code: `@Provides
@[[Singleton]]
fun provideDatabase(@ApplicationContext context: Context): RecipesDatabase =
    Room.databaseBuilder<RecipesDatabase>(context, "recipes.db").setDriver(AndroidSQLiteDriver()).build()

@[[ViewModelScoped]]
class QuickLimit @Inject constructor() {
    var minutes = 20
}`, why: '<code>@Singleton</code> shares one object across the whole app. <code>@ViewModelScoped</code> shares one inside each ViewModel.' },
          { type: 'bug', prompt: 'Sam finds two database objects on the same file, one for each screen. Tap the wrong line.', code: `@Module
@InstallIn(SingletonComponent::class)
object DataModule {
    @Provides
    fun provideDatabase(@ApplicationContext context: Context): RecipesDatabase =
        Room.databaseBuilder<RecipesDatabase>(context, "recipes.db")
            .setDriver(AndroidSQLiteDriver())
            .build()
}`, bug: 3, fix: '    @Provides @Singleton', why: 'Without a scope, every request builds a new database. <code>@Singleton</code> builds it once for the whole app.' },
        ],
        quiz: [
          { q: '<code>GetQuickRecipesUseCase</code> has no scope. Two ViewModels ask for it. How many exist?', options: ['2', '1'], a: 0, why: 'Unscoped is the default, and it means a new object for every request.' },
          { q: 'Ada turns the phone. What happens to the <code>@Singleton</code> database and the <code>@ViewModelScoped</code> <code>QuickLimit</code>?', options: ['Both stay the same objects', 'Both are built again', 'Only the <code>QuickLimit</code> is built again'], a: 0, why: 'The app process keeps running, and the ViewModel survives the turn, so both lifetimes go on.' },
          { q: 'When is the <code>@Singleton</code> database built again?', options: ['When Android starts a new process for the app', 'On every turn of the phone', 'Never, even after the phone restarts'], a: 0, why: '<code>@Singleton</code> lasts as long as the process. A new process builds everything again.' },
        ],
        docs: [['Hilt components and scopes', 'https://dagger.dev/hilt/components'], ['Use Hilt with other Jetpack libraries', 'https://developer.android.com/training/dependency-injection/hilt-jetpack']],
      },

      {
        id: 'modularization-arch',
        title: 'Modules',
        tagline: 'Split the app into feature and core modules with clear rules between them.',
        goals: ['Split an app into an app module, feature modules and core modules', 'List modules in <code>settings.gradle.kts</code> and depend on one with <code>project(...)</code>', 'Keep features apart: they depend on core, never on each other'],
        level: 'intermediate', introduces: ['include'],
        body: `
<p>The Recipes app now has a team: Ada works on the Recipes screen, Lin, who now helps build it, on Tonight, and Sam on the data. Everything sits in one <code>app</code> module, so nothing stops Tonight’s code from reaching into the Recipes screen, and one change can ripple anywhere. Gradle can split a project into <em>modules</em>: folders with their own <code>build.gradle.kts</code>, which build on their own and can only use another module they depend on. This is not the same as a Hilt <code>@Module</code>: a Gradle module is a whole folder of code with its own build file.</p>
<p>A common split. <em>Feature modules</em> hold one part of the app the user sees, like <code>:feature:recipes</code> and <code>:feature:tonight</code>, each with its screens and ViewModels. <em>Core modules</em> hold what features share, like <code>:core:data</code> with the repository, Room and Retrofit. Here it holds the use cases too; a bigger app gives the domain layer its own <code>:core:domain</code>. <code>:app</code> holds <code>RecipesApp</code>, <code>MainActivity</code> and the <code>NavHost</code>. Every module is listed with <code>include(...)</code> in <code>settings.gradle.kts</code>, and <code>implementation(project(":core:data"))</code> makes one module depend on another.</p>
<p>The rules keep the arrows simple. Features depend on core. Core never depends on a feature. Features never depend on each other: when Tonight wants to open the Recipes screen, <code>TonightScreen</code> takes a lambda, <code>onOpenRecipes</code>, and <code>:app</code>, the one module that sees every feature, passes the navigation in. Then Lin’s changes in <code>:feature:tonight</code> can only reach <code>:app</code>, never Ada’s screen.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            predict: {
              q: 'Lin changes a screen in <code>:feature:tonight</code>. Which modules can that change reach?',
              options: ['<code>:feature:tonight</code> and <code>:app</code>', 'All four', 'Only <code>:feature:tonight</code>'],
              a: 0,
              why: 'A change can only reach the modules that depend on it. <code>:app</code> depends on Tonight; nothing else does.',
            },
            nodes: [
              { id: 'app', label: ':app<small>RecipesApp, NavHost</small>', x: 50, y: 10 },
              { id: 'fr', label: ':feature:recipes<small>RecipesScreen</small>', x: 20, y: 48 },
              { id: 'ft', label: ':feature:tonight<small>TonightScreen</small>', x: 80, y: 48 },
              { id: 'cd', label: ':core:data<small>RecipeRepository, Room</small>', x: 50, y: 88 },
            ],
            frames: [
              { say: 'One app, four modules. An arrow means “depends on”: it can use that module’s code.' },
              { add: [['app', 'fr'], ['app', 'ft']], hl: ['app'], say: '<code>:app</code> depends on both features. It holds <code>RecipesApp</code>, <code>MainActivity</code> and the <code>NavHost</code> that links the screens.' },
              { add: [['fr', 'cd'], ['ft', 'cd']], hl: ['cd'], say: 'Each feature depends on <code>:core:data</code> for the repository, and for now the use cases too. A bigger app gives them their own <code>:core:domain</code>.' },
              { add: [['ft', 'fr', 'not allowed', 'err']], hl: ['ft', 'fr'], say: 'Tonight wants to open the Recipes screen. Depending on <code>:feature:recipes</code> is the arrow the rules forbid: Tonight would see every class of Recipes.' },
              { remove: [['ft', 'fr']], add: [['app', 'ft', 'passes onOpenRecipes', 'ok']], hl: ['app'], say: 'Instead <code>TonightScreen</code> takes <code>onOpenRecipes: () -> Unit</code>, and <code>:app</code> passes in <code>navController.navigate(RecipesRoute)</code>.' },
              { hl: ['ft', 'app'], say: 'Lin changes <code>TonightScreen</code>. Only <code>:feature:tonight</code> and <code>:app</code>, which depends on it, can be affected. Ada’s module is untouched.' },
              { hl: ['cd', 'fr', 'ft', 'app'], say: 'A change in <code>:core:data</code> reaches every module above it. That is why core modules change with care.' },
            ],
          });
        },
        code: `// settings.gradle.kts: every module of the project
include(":app")
include(":feature:recipes")
include(":feature:tonight")
include(":core:data")

// feature/tonight/build.gradle.kts
plugins {
    id("com.android.library")          // code for other modules, not an app of its own
    // plus the Compose and Hilt plugins this module uses, as in app/build.gradle.kts
}
android {
    namespace = "com.example.recipes.feature.tonight"
    // compileSdk and the rest as in app/build.gradle.kts
}
dependencies {
    implementation(project(":core:data"))    // RecipeRepository; the use cases too, for now
}

// app/build.gradle.kts
dependencies {
    implementation(project(":feature:recipes"))
    implementation(project(":feature:tonight"))
}

// :app, the one place that knows every feature
NavHost(navController, startDestination = RecipesRoute) {
    composable<RecipesRoute> {
        RecipesScreen(onOpenTonight = { navController.navigate(TonightRoute) })
    }
    composable<TonightRoute> {
        TonightScreen(onOpenRecipes = { navController.navigate(RecipesRoute) })
    }
}`,
        remember: 'Features depend on core, never on each other; only :app sees every feature and links them.',
        terms: [
          { term: 'module', def: 'A part of a Gradle project with its own folder and <code>build.gradle.kts</code>. It can only use modules it depends on.' },
          { term: 'feature module', def: 'A module for one part of the app the user sees, with its screens and ViewModels, like <code>:feature:tonight</code>.' },
          { term: 'core module', def: 'A module with code several features share, like <code>:core:data</code>. It never depends on a feature.' },
          { term: 'library module', def: 'A module made with <code>com.android.library</code>: its code goes into an app, but it is not an app itself.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'List the new module, and let it use the data module.', code: `// settings.gradle.kts
[[include]](":feature:tonight")

// feature/tonight/build.gradle.kts
dependencies {
    implementation([[project]](":core:data"))
}`, why: '<code>include</code> adds a module to the project, and <code>project(":core:data")</code> names a module to depend on.' },
          { type: 'bug', prompt: 'Every change to the Recipes screen now affects Tonight too, and Lin keeps waiting for Ada’s code. Tap the wrong line.', code: `// feature/tonight/build.gradle.kts
dependencies {
    implementation(project(":feature:recipes"))
}`, bug: 2, fix: '    implementation(project(":core:data"))', why: 'A feature must not depend on another feature. Tonight gets the shared repository from <code>:core:data</code>, and <code>:app</code> passes in the way to open Recipes.' },
        ],
        quiz: [
          { q: 'Tonight needs to open the Recipes screen. What should it do?', options: ['Take an <code>onOpenRecipes</code> lambda that <code>:app</code> passes in', 'Depend on <code>:feature:recipes</code>', 'Copy <code>RecipesScreen</code> into Tonight'], a: 0, why: '<code>:app</code> sees every feature, so it links them. The features stay apart.' },
          { q: 'Which file lists every module of the project?', options: ['<code>settings.gradle.kts</code>, with <code>include</code>', '<code>app/build.gradle.kts</code>', 'The manifest'], a: 0, why: 'Gradle reads <code>settings.gradle.kts</code> first to know which modules exist.' },
          { q: 'Which module may depend on <code>:feature:recipes</code>?', options: ['<code>:app</code>', '<code>:core:data</code>', '<code>:feature:tonight</code>'], a: 0, why: 'Core never depends on a feature, and features never depend on each other. Only <code>:app</code> does.' },
        ],
        docs: [['Guide to Android app modularization', 'https://developer.android.com/topic/modularization'], ['Common modularization patterns', 'https://developer.android.com/topic/modularization/patterns']],
      },

      {
        id: 'clean',
        title: 'Clean architecture',
        tagline: 'Keep the heart of the app in plain Kotlin, with every arrow pointing in.',
        goals: ['State the dependency rule: code points inward, toward the domain', 'Move the repository interface into the domain and implement it in data', 'Map a Room entity to a plain domain model'],
        level: 'intermediate', introduces: ['Binds'],
        body: `
<p>Look closely at <code>GetQuickRecipesUseCase</code>, the domain layer’s use case. It works with <code>Recipe</code>, which is a Room <code>@Entity</code>, and with <code>RecipeRepository</code>, a class in data. So the heart of the app, its rules about recipes, depends on Room. If Sam replaces Room, or the table changes, the use cases change too.</p>
<p><em>Clean architecture</em> draws the app as rings. In the middle sits the <em>domain</em>: the model <code>Recipe</code>, the rules, and the use cases, in plain Kotlin, with no Room, Retrofit or Android. Around it sit the UI and the data layers. The <em>dependency rule</em>: code may only depend on rings further in. The domain knows nothing about the rings around it.</p>
<p>The domain still needs recipes, so it declares what it needs as an interface: <code>interface RecipeRepository</code>. The data layer implements it with <code>OfflineRecipeRepository</code>, which uses Room and Retrofit. The arrow between domain and data flips, exactly as in the dependency inversion lesson. Android’s own guide lets the domain depend on data; clean architecture flips this one arrow. The old <code>class RecipeRepository</code> is renamed <code>OfflineRecipeRepository</code>, and its name goes to the domain’s interface. Room’s row becomes <code>RecipeEntity</code> in data, and a small function, <code>toRecipe()</code>, turns it into the plain <code>Recipe</code>. The refresh now writes rows, so the server’s <code>RecipeDto</code> is turned into a <code>RecipeEntity</code> with <code>toEntity()</code>. Hilt needs one more line: which class to hand over when someone asks for the interface. A function marked <code>@Binds</code> says it, in a module that is an <code>abstract class</code>: it takes the class and returns the interface, and Hilt writes the body.</p>
<p>That safety costs extra classes and mapping. A small app with one screen can stay as it is. Add the rings when the app, the team or the number of data sources grows.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            predict: {
              q: 'After the change, the server renames <code>"minutes"</code> to <code>"cook_minutes"</code>. Which part of the app has to change?',
              options: ['Only data, where <code>RecipeDto</code> reads the JSON', 'The domain’s <code>Recipe</code>', 'Every layer'], a: 0,
              why: 'The JSON is a detail of the data layer. The domain’s <code>Recipe</code> and the screens built on it don’t see it.',
            },
            nodes: [
              { id: 'ui', label: 'UI<small>RecipesScreen, RecipesViewModel</small>', x: 20, y: 12 },
              { id: 'data', label: 'Data<small>OfflineRecipeRepository, RecipeEntity, RecipeDto</small>', x: 78, y: 12 },
              { id: 'dom', label: 'Domain<small>Recipe, RecipeRepository, GetQuickRecipesUseCase</small>', x: 50, y: 52 },
              { id: 'fw', label: 'Room, Retrofit, Android', x: 78, y: 88, tone: 'muted' },
            ],
            frames: [
              { add: [['ui', 'dom'], ['dom', 'data'], ['data', 'fw']], say: 'Before, as in the layers lesson: UI depends on domain, domain on data, data on Room and Retrofit.' },
              { add: [['dom', 'fw', 'Recipe is an @Entity', 'err']], hl: ['dom', 'fw'], say: 'And the domain’s <code>Recipe</code> is a Room <code>@Entity</code>. The center of the app needs Room.' },
              { remove: [['dom', 'data'], ['dom', 'fw']], add: [['data', 'dom', 'implements', 'ok']], hl: ['data', 'dom'], say: 'After: the domain declares <code>interface RecipeRepository</code>, and data’s <code>OfflineRecipeRepository</code> implements it. The arrow flips.' },
              { hl: ['dom'], say: 'Now the domain depends on nothing. Every arrow points in toward it: that is the dependency rule.' },
              { hl: ['data', 'fw'], say: 'Room keeps its own row, <code>RecipeEntity</code>, and <code>toRecipe()</code> turns each row into a plain <code>Recipe</code> on the way in.' },
              { hl: ['data'], say: 'The server renames a field: only <code>RecipeDto</code>, in data, changes. The domain and the screens don’t notice.' },
            ],
          });
        },
        code: `// domain: plain Kotlin, no Room, Retrofit or Android
data class Recipe(val id: Int, val title: String, val minutes: Int, val favorite: Boolean)

interface RecipeRepository {
    val recipes: Flow<List<Recipe>>
    suspend fun refresh(force: Boolean)
    suspend fun toggleFavorite(recipe: Recipe)
}

class GetQuickRecipesUseCase @Inject constructor(      // @Inject is plain Java, not Android
    private val repository: RecipeRepository,            // the interface, not the data class
    private val quickLimit: QuickLimit,                  // as in the scopes lesson
) {
    operator fun invoke(): Flow<List<Recipe>> {
        val limit = quickLimit.minutes
        return repository.recipes.map { list -> list.filter { it.minutes <= limit } }
    }
}

// data: Room's row, and the class that implements the domain's interface
@Entity(tableName = "recipes")                           // same table as before
data class RecipeEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val minutes: Int,
    val favorite: Boolean = false,
)

fun RecipeEntity.toRecipe() = Recipe(id, title, minutes, favorite)                 // row -> domain
fun RecipeDto.toEntity(favorite: Boolean) = RecipeEntity(id, title, minutes, favorite)   // server -> row

class OfflineRecipeRepository @Inject constructor(
    private val dao: RecipeDao,                          // RecipeDao now works with RecipeEntity
    private val session: Session,
    private val store: DataStore<Preferences>,
) : RecipeRepository {
    override val recipes: Flow<List<Recipe>> =
        dao.getAll().map { rows -> rows.map { it.toRecipe() } }

    override suspend fun refresh(force: Boolean) {
        // as before, with toEntity instead of toRecipe:
        // dao.upsertAll(fresh.map { it.toEntity(favorite = favorites.contains(it.id)) })
    }

    override suspend fun toggleFavorite(recipe: Recipe) {
        dao.update(RecipeEntity(recipe.id, recipe.title, recipe.minutes, !recipe.favorite))
    }
}

// Hilt: whoever asks for the interface gets OfflineRecipeRepository
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindRepository(repository: OfflineRecipeRepository): RecipeRepository
}`,
        remember: 'Code points inward: the domain is plain Kotlin and declares interfaces; data implements them and maps its own models.',
        mistakes: [
          { title: 'Room annotations in the domain', bad: `// domain
@Entity(tableName = "recipes")
data class Recipe(@PrimaryKey val id: Int, val title: String, val minutes: Int, val favorite: Boolean)`, good: `// domain
data class Recipe(val id: Int, val title: String, val minutes: Int, val favorite: Boolean)

// data
@Entity(tableName = "recipes")
data class RecipeEntity(@PrimaryKey val id: Int, val title: String, val minutes: Int, val favorite: Boolean)
fun RecipeEntity.toRecipe() = Recipe(id, title, minutes, favorite)`, why: 'With <code>@Entity</code> on it, the domain’s model depends on Room, and every Room change reaches the center of the app. Keep the row in data and map it.' },
        ],
        terms: [
          { term: 'clean architecture', def: 'A way to arrange an app in rings, with the domain in the middle and the UI, data and libraries around it.' },
          { term: 'dependency rule', def: 'Code may only depend on rings further in. The domain depends on nothing outside it.' },
          { term: '@Binds', def: 'Marks an <code>abstract</code> function in a Hilt module that says which class to hand over for an interface, like <code>OfflineRecipeRepository</code> for <code>RecipeRepository</code>.' },
          { term: 'mapper', def: 'A small function that turns one layer’s model into another’s, like <code>RecipeEntity.toRecipe()</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Implement the domain’s interface in data, and turn Room’s rows into domain recipes.', code: `class OfflineRecipeRepository @Inject constructor(
    private val dao: RecipeDao,
    private val session: Session,
    private val store: DataStore<Preferences>,
) : [[RecipeRepository]] {
    override val recipes: Flow<List<Recipe>> =
        dao.getAll().map { rows -> rows.map { it.[[toRecipe]]() } }
}`, why: 'The data class keeps the promise the domain wrote down, and the mapper turns each <code>RecipeEntity</code> into a plain <code>Recipe</code>.' },
          { type: 'bug', prompt: 'The use case in the domain can only work with the Room version of the repository. Tap the line that breaks the dependency rule.', code: `class GetQuickRecipesUseCase @Inject constructor(
    private val repository: OfflineRecipeRepository,
    private val quickLimit: QuickLimit,
) {
    operator fun invoke(): Flow<List<Recipe>> {
        val limit = quickLimit.minutes
        return repository.recipes.map { list -> list.filter { it.minutes <= limit } }
    }
}`, bug: 1, fix: '    private val repository: RecipeRepository,', why: '<code>OfflineRecipeRepository</code> lives in data, so this arrow points out of the domain. Ask for the domain’s interface instead.' },
        ],
        quiz: [
          { q: 'In clean architecture, which ring knows nothing about the others?', options: ['The domain, in the middle', 'The UI', 'The data layer'], a: 0, why: 'Every arrow points in toward the domain. It is plain Kotlin and depends on nothing around it.' },
          { q: 'Where does <code>interface RecipeRepository</code> live?', options: ['In the domain; data implements it', 'In data, next to Room', 'In the UI'], a: 0, why: 'The domain says what it needs. The data layer keeps that promise, so the arrow points in.' },
          { q: 'A small app has one screen and one data source. Does it need these rings?', options: ['Not yet: they cost classes and pay off as the app grows', 'Yes, always', 'Only if it uses Room'], a: 0, why: 'Clean architecture trades extra code for safety when things change. Add it when the app, the team or the data sources grow.' },
        ],
        docs: [['Guide to app architecture', 'https://developer.android.com/topic/architecture'], ['Domain layer', 'https://developer.android.com/topic/architecture/domain-layer']],
      },
    ],
  });
})();
