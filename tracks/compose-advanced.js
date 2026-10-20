/* Compose in depth (optional). Same shape as tracks/kotlin.js; builds on tracks/compose.js.
   Demos use the visual kit (Lab.ui); any track CSS goes in the css string, every class starting with cx-. */
(() => {
  const css = `
.cx-glass { display: block; margin: 0 auto; }
.cx-chips { position: relative; margin: 4px 0; border: 1px dashed var(--muted); border-radius: 6px; }
.cx-chip { position: absolute; display: grid; place-items: center; box-sizing: border-box; border-radius: 8px; border: 1px solid var(--line); background: var(--accent-soft); font-size: 0.68rem; white-space: nowrap; overflow: hidden; }
.cx-chip.cx-new { border: 2px solid var(--accent); }
`;

  Lab.addTrack({
    id: 'compose2',
    title: 'Compose in depth',
    description: 'Take the water tracker further: stable types, derived state, the three phases, drawing, CompositionLocal, animation, shared elements, custom layouts, nested navigation and Navigation 3.',
    group: 'Going deeper', requires: ['compose'],
    css,
    lessons: [
      {
        id: 'stability',
        title: 'Stability',
        tagline: 'Promise Compose what your types do, and know why lambdas don’t stop a skip.',
        goals: ['Explain why passing a lambda doesn’t stop a composable from skipping', 'Choose between <code>@Immutable</code> and <code>@Stable</code> for a class Compose can’t judge', 'Spot a plain <code>var</code> that Compose never hears change'],
        level: 'intermediate', introduces: ['Immutable', 'Stable'],
        body: `
<p>From the Performance track: stable inputs are compared with <code>==</code>, unstable ones like <code>List</code> with <code>===</code>. Now the History screen. Each row gets a <code>DayTags(val date: String, val tags: List&lt;String&gt;)</code> from Room, and Room makes new objects for every row each time any day changes. You add a glass today, and every row of last week runs again: the values are equal, but <code>DayTags</code> holds a <code>List</code>, so it is unstable, and new objects never pass <code>===</code>.</p>
<p>Write <code>@Immutable</code> above <code>DayTags</code>. That is your promise that nothing in it changes after it is made, so Compose treats it as stable and compares with <code>==</code>: an equal new row skips. <code>@Stable</code> is the promise for a class that <em>does</em> change, but only through Compose state: every <code>var</code> is <code>by mutableStateOf(…)</code>, so Compose hears each change. Compose doesn’t check either promise. Break it and the screen shows old values, so use them only for classes Compose can’t judge by itself.</p>
<p>Each row also has <code>DeleteButton(onClick = { onDelete(day.date) })</code>. Doesn’t <code>{ }</code> make a new lambda on every run? With strong skipping, the compiler wraps every lambda inside a composable in <code>remember</code>, keyed by its <em>captures</em>: the values it uses from around it, here <code>onDelete</code> and <code>day</code>. While they are unchanged, the very same lambda comes back, and <code>DeleteButton</code> can skip. The keys follow the same rule as parameters: an unstable capture only counts as unchanged when it is the same object.</p>
<p>One trap: a class with a plain <code>var</code> property (not one backed by <code>mutableStateOf</code>), like <code>class Goal(var glasses: Int)</code>. Setting <code>goal.glasses = 10</code> is no state change, and it is still the same object, so a <code>GoalRow(goal)</code> is skipped and keeps showing 8. Make the property <code>var glasses by mutableStateOf(8)</code>, or keep a <code>val</code> and put a new <code>copy</code> in state.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            varsTitle: 'Children',
            outTitle: 'Result',
            code: `data class Day(val date: String, val glasses: Int)
data class DayTags(val date: String, val tags: List<String>)
class Goal(var glasses: Int)

@Composable
fun HistoryItem(
    day: Day, tags: DayTags,
    goal: Goal, onDelete: (String) -> Unit,
) {
    DayRow(day = day)
    TagsRow(tags = tags)
    GoalRow(goal = goal)
    DeleteButton(onClick = { onDelete(day.date) })
}`,
            predict: {
              q: 'Room sends the days again as new objects with equal values, so <code>HistoryItem</code> runs again. Does <code>DeleteButton(onClick = { onDelete(day.date) })</code> skip?',
              options: ['Yes: the compiler remembered the lambda, keyed by <code>onDelete</code> and <code>day</code>, and they are unchanged', 'No: <code>{ }</code> makes a new lambda object on every run', 'No: a lambda is never compared'],
              a: 0,
              why: 'With strong skipping, every lambda in a composable is remembered by its captures. <code>day</code> is a stable <code>Day</code> equal to last time’s, so the same lambda comes back.',
            },
            frames: [
              { line: 6, vars: { tags: 'new, equal' }, say: 'You add a glass today. Room sends every day again as new objects with the same values. <code>DayTags</code> holds a <code>List</code>, so it is unstable: a new <code>tags</code> fails <code>===</code>, and <code>HistoryItem</code> runs again. Each child now compares its inputs.' },
              { line: 10, vars: { DayRow: 'skipped' }, say: '<code>Day</code> is stable, so <code>==</code>: a new but equal <code>Day</code>. Skip. Nothing new here.' },
              { line: 11, vars: { TagsRow: 'runs' }, say: 'Unstable <code>DayTags</code>, so <code>===</code> again: a new object, so <code>TagsRow</code> runs, although the tags are the same words. This is the case for <code>@Immutable</code>.' },
              { line: 12, vars: { GoalRow: 'skipped' }, say: '<code>Goal</code> has a plain <code>var</code>, so it is unstable too. But the caller passes the same remembered object, so <code>===</code> passes: skip. It would skip even after <code>goal.glasses = 10</code>: Compose never heard about that.' },
              { line: 13, vars: { DeleteButton: 'skipped' }, say: 'The compiler wrapped <code>{ onDelete(day.date) }</code> in <code>remember</code>, keyed by <code>onDelete</code> and <code>day</code>. Both are unchanged, so the same lambda comes back, and the same object passes. Skip.' },
              { line: 14, out: 'ran: TagsRow\nskipped: DayRow, GoalRow, DeleteButton', say: 'Write <code>@Immutable</code> above <code>DayTags</code> and <code>TagsRow</code> is compared with <code>==</code>: it skips too. And give <code>Goal</code> a <code>var glasses by mutableStateOf(8)</code>, so a change is heard.' },
            ],
          });
        },
        code: `// Room makes new objects on every change. Promise that these never change:
@Immutable
data class DayTags(val date: String, val tags: List<String>)

// A class that does change, but only through Compose state:
@Stable
class GoalState {
    var glasses by mutableStateOf(8)     // Compose hears every change
}

@Composable
fun HistoryItem(day: DayTags, goal: GoalState, onDelete: (String) -> Unit) {
    TagsRow(tags = day)        // == now: a new but equal DayTags skips
    GoalRow(goal = goal)       // reads goal.glasses, so it runs again when that changes
    DeleteButton(onClick = { onDelete(day.date) })   // remembered, keyed by onDelete and day
}
// Android Studio adds the imports: androidx.compose.runtime.Immutable and androidx.compose.runtime.Stable`,
        remember: '@Immutable: never changes. @Stable: changes only through Compose state. Lambdas are remembered by their captures. A plain var keeps both promises from working.',
        mistakes: [
          { title: 'Breaking the @Immutable promise', bad: `@Immutable
data class DayTags(val date: String, val tags: MutableList<String>)

day.tags.add("swim")   // TagsRow still shows “tea, run”`, good: `@Immutable
data class DayTags(val date: String, val tags: List<String>)

val newer = day.copy(tags = listOf("tea", "run", "swim"))   // new and not equal: TagsRow runs`, why: 'Compose doesn’t check the promise. <code>add</code> changes the list inside the same object: that is no state change, and an object is always <code>==</code> to itself, so <code>TagsRow</code> is skipped and shows the old tags. Keep a read-only <code>List</code> and make a new value with <code>copy</code>.' },
        ],
        terms: [
          { term: '@Immutable', def: 'Your promise that no property of a class changes after it is made. Compose then treats the class as stable and compares it with <code>==</code>.' },
          { term: '@Stable', def: 'Your promise that a class changes only through Compose state, like <code>var x by mutableStateOf(…)</code>, so Compose hears every change.' },
          { term: 'capture', def: 'A value a lambda uses from around it, like <code>day</code> in <code>{ onDelete(day.date) }</code>. With strong skipping, the lambda is remembered with its captures as keys.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Room sends new but equal <code>DayTags</code> objects, and every <code>TagsRow</code> runs. Promise Compose that <code>DayTags</code> never changes, so it compares them with <code>==</code>.', code: `@[[Immutable]]
data class DayTags(val date: String, val tags: List<String>)`, why: '<code>@Immutable</code> is the promise. Without it, the <code>List</code> property makes the class unstable, compared with <code>===</code>.' },
          { type: 'bug', prompt: '<code>GoalRow(goal)</code> shows <code>goal.glasses</code>. Tapping Raise sets <code>goal.glasses = 10</code>, but the row still shows 8. Tap the line that breaks the <code>@Stable</code> promise.', code: `@Stable
class GoalState {
    var glasses = 8
}`, bug: 2, fix: '    var glasses by mutableStateOf(8)', why: 'A plain <code>var</code> changes without Compose hearing about it, and the object is the same one, so <code>GoalRow</code> is skipped. Backed by <code>mutableStateOf</code>, the change is a state change, and <code>GoalRow</code>, which reads it, runs again.' },
        ],
        quiz: [
          { q: 'Room sends every day again as new <code>DayTags</code> objects with equal values. <code>DayTags</code> holds a <code>List</code> and has no annotation. Does <code>TagsRow(tags)</code> skip?', options: ['No: it is unstable, so it is compared with <code>===</code>, and these are new objects', 'Yes: the values are equal', 'Yes: a data class is always stable'], a: 0, why: 'The <code>List</code> makes <code>DayTags</code> unstable. Only the very same object would pass. With <code>@Immutable</code>, <code>==</code> decides and it skips.' },
          { q: 'With strong skipping, what happens to <code>{ onDelete(day.date) }</code> inside a composable?', options: ['The compiler remembers it, keyed by <code>onDelete</code> and <code>day</code>, so the same lambda comes back while they are unchanged', 'A new lambda is made on every run, so the child never skips', 'Compose ignores lambda parameters when it decides to skip'], a: 0, why: 'Every lambda in a composable is wrapped in <code>remember</code>, with its captures as keys.' },
          { q: 'Which class fits <code>@Stable</code> rather than <code>@Immutable</code>?', options: ['A class whose <code>var</code>s are all <code>by mutableStateOf(…)</code>', 'A data class of <code>val</code>s that never change', 'A class with a plain <code>var</code> that you change in place'], a: 0, why: '<code>@Stable</code>: it may change, but Compose hears every change. A data class that never changes fits <code>@Immutable</code>, and a plain <code>var</code> breaks both promises.' },
        ],
        docs: [['Strong skipping mode', 'https://developer.android.com/develop/ui/compose/performance/stability/strongskipping'], ['Fix stability issues', 'https://developer.android.com/develop/ui/compose/performance/stability/fix']],
      },

      {
        id: 'derived',
        title: 'derivedStateOf',
        tagline: 'Turn a value that changes all the time into one that changes only when it matters.',
        goals: ['Spot a state that changes far more often than the screen needs', 'Wrap the check in <code>remember { derivedStateOf { } }</code>', 'Tell when <code>derivedStateOf</code> is not needed'],
        level: 'intermediate', introduces: ['derivedStateOf', 'animateScrollToItem'],
        body: `
<p>The History list gets a “Back to top” button that appears once the user has scrolled down. <code>val showTop = listState.firstVisibleItemIndex > 0</code> works, but now <code>HistoryScreen</code> reads <code>firstVisibleItemIndex</code> in its body, so it runs again each time the top row changes: 1, 2, 3, up to 40 times on a long scroll. The button itself only changes once.</p>
<p><code>derivedStateOf { listState.firstVisibleItemIndex > 0 }</code> makes a new state out of that check. It watches the states read inside its braces, runs the check again when they change, and reports a change only when the result is different: from <code>false</code> to <code>true</code>, once. Only then do the composables that read it run again. It is like <code>snapshotFlow</code>, but it gives you a state instead of a flow.</p>
<p>Wrap it in <code>remember</code>, so it is made once and kept: <code>val showTop by remember { derivedStateOf { listState.firstVisibleItemIndex > 0 } }</code>. To scroll back, <code>listState.animateScrollToItem(0)</code> glides the list to row 0; it is a <code>suspend</code> function, so the button starts it with <code>scope.launch</code>.</p>
<p>It only helps when the input changes more often than the result. <code>"$glasses of 8 glasses"</code> changes every time <code>glasses</code> does, so there is nothing to save: write it as a plain <code>val</code>.</p>`,
        visual(el) {
          const days = ['Mon 19 Oct', 'Sun 18 Oct', 'Sat 17 Oct', 'Fri 16 Oct', 'Thu 15 Oct', 'Wed 14 Oct', 'Tue 13 Oct', 'Mon 12 Oct', 'Sun 11 Oct', 'Sat 10 Oct'];
          const scr = (top, btn) => `<div class="ui-m-bar">History</div><div class="ui-m-body">${days.slice(top, top + 8).map(d => `<div class="ui-m-row"><div>${d}</div></div>`).join('')}</div>${btn ? '<span class="ui-m-btn" style="position:absolute;right:12px;bottom:12px">Back to top</span>' : ''}`;
          Lab.ui.phone(el, {
            logTitle: 'What ran',
            predict: {
              q: 'No <code>derivedStateOf</code> yet. The user scrolls, and the top row goes 0, 1, 2, 3. How many times does <code>HistoryScreen</code> run again?',
              options: ['Once, when the button appears', '3 times: once per change', 'Never: scrolling isn’t state'],
              a: 1,
              why: 'Reading <code>firstVisibleItemIndex</code> in the body means every change of it runs <code>HistoryScreen</code> again.',
            },
            frames: [
              { screen: scr(0, false), log: '— plain read: showTop = index > 0 —', say: 'First try: <code>HistoryScreen</code> reads <code>firstVisibleItemIndex</code> in its body. The top row is 0, so no button.' },
              { screen: scr(1, true), log: 'index 1: HistoryScreen ran, showTop = true', say: 'The user scrolls one row down: the top row is now 1. The index changed, so <code>HistoryScreen</code> runs again, and the button appears. This run was needed.' },
              { screen: scr(2, true), log: 'index 2: HistoryScreen ran, showTop = true', say: 'Another row. <code>HistoryScreen</code> runs again, but the button was already there. Wasted work.' },
              { screen: scr(3, true), log: 'index 3: HistoryScreen ran, showTop = true', say: 'And again, for every row the user scrolls past.' },
              { screen: scr(0, false), log: '— now with derivedStateOf —', say: 'Second try: <code>val showTop by remember { derivedStateOf { listState.firstVisibleItemIndex > 0 } }</code>.' },
              { screen: scr(1, true), log: 'index 1: showTop false → true, HistoryScreen ran', say: 'The check now says <code>true</code> instead of <code>false</code>. That is a change, so <code>HistoryScreen</code> runs and the button appears.' },
              { screen: scr(3, true), log: ['index 2: showTop still true, nothing ran', 'index 3: showTop still true, nothing ran'], say: 'The index keeps changing, but the check stays <code>true</code>. No change, so nothing runs. The list still scrolls: <code>LazyColumn</code> handles that itself.' },
            ],
          });
        },
        code: `@Composable
fun HistoryScreen(days: List<String>) {
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    val showTop by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 0 }   // changes only false ↔ true
    }

    Box(contentAlignment = Alignment.BottomEnd) {                // BottomEnd: bottom right corner
        LazyColumn(state = listState, modifier = Modifier.fillMaxSize()) {
            items(days) { day -> Text(day, modifier = Modifier.padding(16.dp)) }
        }
        if (showTop) {
            Button(
                onClick = { scope.launch { listState.animateScrollToItem(0) } },
                modifier = Modifier.padding(16.dp),
            ) {
                Text("Back to top")
            }
        }
    }
}
// Scrolling from row 0 to row 40: HistoryScreen runs again once, not 40 times.`,
        remember: 'Use remember { derivedStateOf { check } } when a state changes much more often than the check’s result.',
        mistakes: [
          { title: 'Deriving something that changes just as often', bad: `val label by remember { derivedStateOf { "$glasses of 8 glasses" } }`, good: `val label = "$glasses of 8 glasses"`, why: 'The text changes every time <code>glasses</code> does, so <code>derivedStateOf</code> saves no runs and only adds work. The Compose guide warns against this use.' },
        ],
        terms: [
          { term: 'derivedStateOf', def: 'Makes a state from a calculation on other states. It reports a change only when the result is different.' },
          { term: 'animateScrollToItem', def: 'On a list state: scrolls smoothly to the row with that index. A <code>suspend</code> function, so start it in a coroutine.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>showTop</code> change only when the answer changes.', code: `val showTop by [[remember]] {
    [[derivedStateOf]] { listState.firstVisibleItemIndex > 0 }
}`, why: '<code>derivedStateOf</code> makes the state from the check, and <code>remember</code> keeps that state between runs.' },
          { type: 'bug', prompt: 'The “Back to top” button never appears, however far the user scrolls. Tap the wrong line.', code: `val listState = rememberLazyListState()
val showTop = remember { listState.firstVisibleItemIndex > 0 }
LazyColumn(state = listState) {
    items(days) { day -> Text(day) }
}
if (showTop) {
    BackToTopButton()
}`, bug: 1, fix: 'val showTop by remember { derivedStateOf { listState.firstVisibleItemIndex > 0 } }', why: 'Plain <code>remember</code> runs the check once, at the start, when the answer is <code>false</code>, and keeps that <code>false</code> forever. <code>derivedStateOf</code> runs the check again whenever the index changes.' },
        ],
        quiz: [
          { q: 'The top row index goes 0, 1, 2, 3, 4. How many times does <code>derivedStateOf { listState.firstVisibleItemIndex > 0 }</code> report a change?', options: ['Once: <code>false</code> to <code>true</code>', '4 times', '5 times'], a: 0, why: 'The result is <code>true</code> from index 1 on. It only changes once.' },
          { q: 'Which of these is worth a <code>derivedStateOf</code>?', options: ['A <code>Boolean</code> that becomes <code>true</code> once the user scrolls past row 0', '<code>"$glasses of 8 glasses"</code>', '<code>glasses + 1</code>'], a: 0, why: 'The scroll index changes far more often than the <code>Boolean</code>. The other two change every time <code>glasses</code> does.' },
          { q: 'Why is it wrapped in <code>remember { }</code>?', options: ['So the derived state is made once and kept between runs', 'So it is saved when the phone rotates', 'So it runs on another thread'], a: 0, why: 'Without <code>remember</code>, every run would make a new derived state.' },
        ],
        docs: [['derivedStateOf in Side-effects in Compose', 'https://developer.android.com/develop/ui/compose/side-effects#derivedstateof']],
      },

      {
        id: 'phases',
        title: 'Compose phases',
        tagline: 'Each frame has up to three steps: what to show, where it goes, how it looks.',
        goals: ['Name the three phases of a frame: composition, layout and drawing', 'Tell which phase reads a state, and what runs again when it changes', 'Keep a value that changes every frame out of composition'],
        level: 'intermediate', introduces: [],
        body: `
<p>Remember the drink row you can drag sideways from the Gestures lesson. While the finger moves, <code>offsetX</code> changes on every frame, up to 120 times a second. Yet that row doesn’t recompose while it is dragged. Why not? Because Compose makes each frame in steps, and the row reads <code>offsetX</code> in a late one.</p>
<p>Compose makes a frame in three <em>phases</em>. <em>Composition</em> runs composables to decide what is on the screen. <em>Layout</em> measures each element and decides where it goes. <em>Drawing</em> paints the pixels. Compose notes in which phase a state is read. When the state changes, it starts again from that phase: a read in composition reruns all three, a read in layout reruns layout and drawing, a read in drawing reruns only drawing.</p>
<p><code>Modifier.offset { IntOffset(offsetX.roundToInt(), 0) }</code> takes a lambda, and Compose calls that lambda during layout, when it places the row. So <code>offsetX</code> is read in layout, and a drag reruns layout and drawing only. Now add <code>Text("Moved \${offsetX.roundToInt()} px")</code> inside the row: that reads <code>offsetX</code> in composition, and the row recomposes on every frame of the drag.</p>
<p>For values that change on every frame, like a drag, a scroll position or an animation, read them as late as you can: inside a lambda that a modifier calls later, not in the composable’s body.</p>`,
        visual(el) {
          const fr = (k, comp) => {
            const t = k * 16.7, bars = [];
            let at = t + 1;
            if (comp) { bars.push({ lane: 0, from: at, to: at + 5, tone: 'warm' }); at += 5; }
            bars.push({ lane: 1, from: at, to: at + 3, tone: 'accent' });
            bars.push({ lane: 2, from: at + 3, to: at + 6, tone: 'ok' });
            return bars;
          };
          Lab.ui.timeline(el, {
            lanes: ['Compo&shy;sition', 'Layout', 'Drawing'],
            span: 100,
            unit: 'ms',
            predict: {
              q: 'The row also shows <code>Text("Moved \${offsetX.roundToInt()} px")</code>. While the user drags, which phases run on each frame?',
              options: ['All three: composition, layout and drawing', 'Only layout and drawing', 'Only drawing'],
              a: 0,
              why: 'The <code>Text</code> reads <code>offsetX</code> in the composable’s body, which is composition. A change there reruns every phase.',
            },
            frames: [
              { now: 0, say: 'A drag, six frames of it, 16.7 ms each at 60 Hz. The row reads <code>offsetX</code> only inside <code>offset { }</code>.' },
              { bars: fr(0, false), say: 'Frame 1: the finger moved, so <code>offsetX</code> changed. It was read in layout, so Compose reruns layout and drawing. Composition is left alone.' },
              { bars: [...fr(1, false), ...fr(2, false)], say: 'Frames 2 and 3: the same. Little work per frame, well inside the budget.' },
              { bars: [], marks: [{ at: 50, label: 'Text reads offsetX', tone: 'warm' }], now: 50, say: 'Now add <code>Text("Moved \${offsetX.roundToInt()} px")</code> to the row. It reads <code>offsetX</code> in composition.' },
              { bars: fr(3, true), say: 'Frame 4: the read in composition means the row recomposes first, then layout and drawing run.' },
              { bars: [...fr(4, true), ...fr(5, true)], say: 'Frames 5 and 6: all three phases, on every frame of the drag. More work for the same movement.' },
            ],
          });
        },
        code: `@Composable
fun SwipeDrinkRow(drink: Drink, onDelete: () -> Unit) {
    var offsetX by remember { mutableFloatStateOf(0f) }
    Box(contentAlignment = Alignment.CenterEnd) {
        TextButton(onClick = onDelete) { Text("Delete") }
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .offset { IntOffset(offsetX.roundToInt(), 0) }   // read in layout
                .draggable(
                    orientation = Orientation.Horizontal,
                    state = rememberDraggableState { delta -> offsetX += delta },
                ),
        ) {
            Text("#\${drink.id}: \${drink.ml} ml", modifier = Modifier.padding(16.dp))
        }
    }
}
// Dragging reruns layout and drawing only. SwipeDrinkRow itself doesn't recompose.`,
        remember: 'A state read in composition reruns all three phases; read in layout, only layout and drawing; read in drawing, only drawing.',
        mistakes: [
          { title: 'Reading the value in the body, then passing it in', bad: `val x = offsetX.roundToInt()          // read in composition
Surface(modifier = Modifier.offset { IntOffset(x, 0) }) {
    Text("#2: 500 ml")
}`, good: `Surface(modifier = Modifier.offset { IntOffset(offsetX.roundToInt(), 0) }) {
    Text("#2: 500 ml")
}`, why: 'What counts is where the state is read, not which modifier gets the number. In the first version the body reads <code>offsetX</code>, so every drag frame is a recomposition.' },
        ],
        terms: [
          { term: 'composition', def: 'The first phase of a frame: Compose runs composables to decide what is on the screen.' },
          { term: 'layout phase', def: 'The second phase: each element is measured, then placed at its position.' },
          { term: 'drawing phase', def: 'The last phase: the elements paint their pixels.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in which phases run when <code>offsetX</code> changes.', code: `Modifier.offset { IntOffset(offsetX.roundToInt(), 0) }
// offsetX is read in the [[layout]] phase.
// When it changes, Compose reruns layout and [[drawing]].`, why: 'The lambda in <code>offset { }</code> runs while Compose places the element, which is layout. Drawing always follows layout.' },
          { type: 'bug', prompt: 'The “moved” text was removed from the design, but a leftover line still makes this row recompose on every drag frame. Tap it.', code: `Surface(
    modifier = Modifier
        .offset { IntOffset(offsetX.roundToInt(), 0) }
        .draggable(orientation = Orientation.Horizontal, state = dragState),
) {
    Text("#2: 500 ml, moved \${offsetX.roundToInt()} px")
}`, bug: 5, fix: '    Text("#2: 500 ml")', why: 'That <code>Text</code> reads <code>offsetX</code> in composition. Without it, <code>offsetX</code> is only read inside <code>offset { }</code>, in layout.' },
        ],
        quiz: [
          { q: 'In which phase does Compose measure elements and decide where they go?', options: ['Layout', 'Composition', 'Drawing'], a: 0, why: 'Composition decides what is shown, layout where and how big, drawing how it looks.' },
          { q: 'A state is read only inside <code>Modifier.offset { }</code>. It changes. What runs?', options: ['Layout and drawing', 'All three phases', 'Nothing'], a: 0, why: 'The read happened in layout, so Compose starts again from layout. Drawing comes after it.' },
          { q: 'Which values gain the most from being read late?', options: ['Values that change on every frame, like a drag or a scroll position', 'A title that never changes', 'A value read once when the screen opens'], a: 0, why: 'A value that changes 60 or 120 times a second would recompose that often if read in composition.' },
        ],
        docs: [['Jetpack Compose phases', 'https://developer.android.com/develop/ui/compose/phases']],
      },

      {
        id: 'drawing',
        title: 'Drawing',
        tagline: 'Paint your own shapes with Canvas when no ready-made composable fits.',
        goals: ['Draw rectangles inside a <code>Canvas</code>', 'Place them with pixel coordinates from the top-left corner', 'Size a drawing from <code>size</code> and <code>toPx()</code> so it fits any phone'],
        level: 'intermediate', introduces: ['Canvas', 'drawRect', 'Offset', 'Size', 'toPx'],
        body: `
<p>The water tracker should show a glass that fills up: at 3 of 8 glasses, the bottom 3/8 of it is blue. No ready-made composable looks like that, so you draw it yourself.</p>
<p><code>Canvas(modifier = Modifier.size(120.dp, 160.dp)) { ... }</code> gives you an empty area and a lambda to draw in. Inside the lambda, <code>size</code> is the area’s size in pixels (<code>size.width</code>, <code>size.height</code>), and drawing functions paint one after another, each on top of the last. <code>drawRect(color = glass)</code> with no other arguments fills the whole area. Careful, <code>size</code> means three things here: <code>Modifier.size(w, h)</code> sets the Canvas size in dp; inside the lambda, <code>size</code> is that area in pixels; and <code>drawRect</code>’s <code>size =</code> is the size of the rectangle you paint.</p>
<p>Positions are pixels from the top-left corner: x grows to the right, y grows down. <code>Offset(x, y)</code> is a point and <code>Size(width, height)</code> a size, both in <code>Float</code>s. To fill the glass from the bottom, the water starts <code>level</code> pixels above the bottom: <code>topLeft = Offset(0f, size.height - level)</code>, with <code>size = Size(size.width, level)</code>.</p>
<p>Phones have different numbers of pixels per dp, so don’t write fixed pixels. Work in parts of <code>size</code>, or turn dp into pixels with <code>3.dp.toPx()</code>. The Canvas lambda runs in the drawing phase, outside composition, so read theme colors before it, in the composable’s body.</p>`,
        visual(el) {
          const W = 360, H = 480;
          const svg = (inner, lbl) => `<div class="ui-m-body" style="justify-items:center"><svg class="cx-glass" viewBox="-40 -30 440 540" width="165" height="203" aria-hidden="true"><rect x="0" y="0" width="${W}" height="${H}" style="fill:none;stroke:var(--muted);stroke-dasharray:8 6;stroke-width:2"/>${inner}<text x="-36" y="-8" style="fill:var(--muted);font:600 22px var(--mono)">(0, 0)</text>${lbl || ''}</svg><span class="ui-m-muted">size = ${W} × ${H} px</span></div>`;
          const glass = `<rect x="0" y="0" width="${W}" height="${H}" style="fill:var(--accent-soft)"/>`;
          const water = lvl => `<rect x="0" y="${H - lvl}" width="${W}" height="${lvl}" style="fill:var(--accent)"/>`;
          const goal = `<rect x="0" y="0" width="${W}" height="9" style="fill:var(--accent)"/>`;
          const tag = (y, t) => `<line x1="${W}" y1="${y}" x2="${W + 14}" y2="${y}" style="stroke:var(--err);stroke-width:3"/><text x="${W - 150}" y="${y - 10}" style="fill:var(--err);font:700 24px var(--mono)">${t}</text>`;
          Lab.ui.phone(el, {
            logTitle: 'Drawing calls',
            predict: {
              q: 'The glass is 480 px tall, and the water is <code>level = 180</code> px. It starts at <code>Offset(0f, size.height - level)</code>. How far from the top is its top edge?',
              options: ['300 px', '180 px', '480 px'],
              a: 0,
              why: '480 − 180 = 300. y counts down from the top, so the water starts 300 px down and fills the last 180 px.',
            },
            frames: [
              { screen: svg(''), log: 'Canvas(Modifier.size(120.dp, 160.dp))', say: 'An empty Canvas. On this phone 1 dp is 3 pixels, so <code>size</code> is 360 × 480. (0, 0) is the top-left corner.' },
              { screen: svg(glass), log: 'drawRect(color = glass)', say: 'With only a color, <code>drawRect</code> fills the whole area: the empty glass.' },
              { screen: svg(glass + tag(H - 180, 'y = 300')), log: 'level = size.height * 3 / 8 = 180f', say: '3 of 8 glasses: the water is 3/8 of the height, 180 px. Its top edge is 480 − 180 = 300 px from the top.' },
              { screen: svg(glass + water(180)), log: 'drawRect(water, topLeft = Offset(0f, 300f), size = Size(360f, 180f))', say: 'The water is drawn on top of the glass, from y = 300 down to the bottom.' },
              { screen: svg(glass + water(180) + goal), log: 'drawRect(water, size = Size(360f, 3.dp.toPx()))', say: 'A 3 dp line at the top marks the goal. <code>3.dp.toPx()</code> is 9 pixels on this phone, and the right thickness on any other.' },
              { screen: svg(glass + water(300) + goal), log: ['glasses = 5: only drawing runs again', 'level = 300f, topLeft = Offset(0f, 180f)'], say: 'Two more glasses: the same calls run again with the new numbers. The glass is now 5/8 full.' },
            ],
          });
        },
        code: `@Composable
fun GlassGauge(glasses: Int, goal: Int, modifier: Modifier = Modifier) {
    val water = MaterialTheme.colorScheme.primary          // read colors out here
    val glass = MaterialTheme.colorScheme.primaryContainer
    val shown = if (glasses > goal) goal else glasses       // never more than full

    Canvas(modifier = modifier.size(120.dp, 160.dp)) {
        drawRect(color = glass)                              // the empty glass: the whole area
        val level = size.height * shown / goal               // 3 of 8: 3/8 of the height
        drawRect(
            color = water,
            topLeft = Offset(0f, size.height - level),       // start level pixels above the bottom
            size = Size(size.width, level),                  // and fill down to the bottom
        )
        drawRect(color = water, size = Size(size.width, 3.dp.toPx()))   // the goal line
    }
}
// GlassGauge(glasses = 3, goal = 8): the bottom 3/8 of the glass is blue.`,
        remember: 'Canvas { } draws in pixels from the top-left, y down; size is the area, Offset a point, toPx() turns dp into pixels.',
        mistakes: [
          { title: 'Reading the theme inside the Canvas lambda', bad: `Canvas(modifier = Modifier.size(120.dp, 160.dp)) {
    drawRect(color = MaterialTheme.colorScheme.primary)
    // error: @Composable invocations can only happen from the context of a @Composable function
}`, good: `val water = MaterialTheme.colorScheme.primary
Canvas(modifier = Modifier.size(120.dp, 160.dp)) {
    drawRect(color = water)
}`, why: 'The Canvas lambda runs while drawing, not in composition, so it can’t call composable code like <code>MaterialTheme.colorScheme</code>. Read the color in the body and use it inside.' },
        ],
        terms: [
          { term: 'Canvas', def: 'A composable that gives you an area and a lambda to paint in, with functions like <code>drawRect</code>.' },
          { term: 'drawRect', def: 'Paints a rectangle. With only <code>color</code> it fills the whole area; <code>topLeft</code> and <code>size</code> choose a part.' },
          { term: 'Offset', def: 'A point, <code>Offset(x, y)</code>, in pixels from the top-left corner. y grows downwards.' },
          { term: 'toPx', def: '<code>3.dp.toPx()</code> turns dp into this phone’s pixels, inside a Canvas.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill the whole area with the glass color, then paint the water on top.', code: `[[Canvas]](modifier = Modifier.size(120.dp, 160.dp)) {
    [[drawRect]](color = glass)
    drawRect(color = water, topLeft = Offset(0f, size.height - level), size = Size(size.width, level))
}`, why: '<code>Canvas</code> gives the area. Drawing calls paint in order, so the water, drawn second, ends up on top.' },
          { type: 'bug', prompt: 'The water should fill the glass from the bottom, but it hangs from the top. Tap the wrong line.', code: `Canvas(modifier = Modifier.size(120.dp, 160.dp)) {
    val level = size.height * 3 / 8
    drawRect(
        color = water,
        topLeft = Offset(0f, 0f),
        size = Size(size.width, level),
    )
}`, bug: 4, fix: '        topLeft = Offset(0f, size.height - level),', why: '<code>Offset(0f, 0f)</code> is the top-left corner, so the rectangle starts at the top. y grows down, so start <code>level</code> pixels above the bottom.' },
        ],
        quiz: [
          { q: 'In a Canvas, where is <code>Offset(0f, 0f)</code>?', options: ['The top-left corner', 'The center', 'The bottom-left corner'], a: 0, why: 'x grows to the right and y grows down, both from the top-left corner.' },
          { q: '<code>size.height</code> is 480. A rectangle has <code>topLeft = Offset(0f, 400f)</code>. Where does it start?', options: ['80 px above the bottom', '400 px above the bottom', 'Above the Canvas'], a: 0, why: '400 px down from the top leaves 480 − 400 = 80 px to the bottom.' },
          { q: 'Why use <code>size</code> and <code>toPx()</code> instead of numbers like <code>360f</code>?', options: ['Phones have different pixels per dp, so fixed pixels look bigger or smaller', 'Fixed numbers don’t compile in a Canvas', 'Canvas ignores fixed numbers'], a: 0, why: 'The same 120 dp can be 240 pixels on one phone and 360 on another.' },
        ],
        docs: [['Graphics in Compose', 'https://developer.android.com/develop/ui/compose/graphics/draw/overview']],
      },

      {
        id: 'locals',
        title: 'CompositionLocal',
        tagline: 'Hand a value to a whole part of the screen without passing it through every composable.',
        goals: ['Read a value with <code>.current</code>', 'Make your own with <code>compositionLocalOf</code> and give it with <code>CompositionLocalProvider</code>', 'Decide when a plain parameter is the better choice'],
        level: 'intermediate', introduces: ['CompositionLocal', 'compositionLocalOf', 'CompositionLocalProvider', 'provides', 'current', 'LocalContext'],
        body: `
<p>Users can pick ml or oz in Settings. The amount is shown deep down: <code>WaterApp</code> calls <code>WaterScreen</code>, which calls <code>DrinkList</code>, then <code>DrinkRow</code>, then <code>Amount</code>, which shows “250 ml”. Passing a <code>units</code> parameter through all of them, even the ones that only hand it on, gets tedious. You have already used a value that arrives without a parameter: <code>MaterialTheme.colorScheme</code> works in any composable inside the theme. Behind it is a <code>CompositionLocal</code>.</p>
<p>Make one at the top level of a file: <code>val LocalUnits = compositionLocalOf { Units.Ml }</code>. Names start with <code>Local</code> by habit, and the lambda gives the default, used when nobody has provided a value. Provide a value for a part of the tree: <code>CompositionLocalProvider(LocalUnits provides units) { WaterScreen() }</code>. <code>provides</code> goes between its two values, like <code>to</code> in <code>mapOf</code>.</p>
<p>Read it anywhere inside: <code>LocalUnits.current</code> gives the value from the nearest provider above. When the provided value changes, only the composables that read <code>.current</code> run again; the ones in between are skipped. Android has some of its own: <code>LocalContext.current</code> gives the Context in any composable.</p>
<p>Use them sparingly. A composable that reads a local has a hidden input you can’t see in its parameters. They fit values that a whole part of the screen uses and that have a sensible default, like theme, units or spacing. A screen’s data or its ViewModel should stay a parameter.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'app', label: 'WaterApp<br><small>CompositionLocalProvider</small>', x: 50, y: 9 },
              { id: 'screen', label: 'WaterScreen', x: 30, y: 33 },
              { id: 'list', label: 'DrinkList', x: 30, y: 55 },
              { id: 'row', label: 'DrinkRow', x: 30, y: 75 },
              { id: 'amount', label: 'Amount', x: 30, y: 93, tone: 'warm' },
              { id: 'preview', label: '@Preview<br><small>Amount(250), no provider</small>', x: 75, y: 82, tone: 'muted', hidden: true },
            ],
            predict: {
              q: 'The user switches from ml to oz, so the provided value changes. Which composables run again?',
              options: ['<code>WaterApp</code>, which holds the setting, and <code>Amount</code>, which reads <code>.current</code>', 'Every composable inside the provider', 'None, until the app restarts'],
              a: 0,
              why: 'Compose knows who read <code>LocalUnits.current</code>. The composables in between don’t read it, and their parameters didn’t change, so they are skipped.',
            },
            frames: [
              { add: [['app', 'screen'], ['screen', 'list'], ['list', 'row'], ['row', 'amount']], hl: ['app'], say: '<code>WaterApp</code> wraps the screen in <code>CompositionLocalProvider(LocalUnits provides units)</code>. <code>units</code> is <code>Ml</code>.' },
              { add: [['amount', 'app', 'LocalUnits.current = Ml', 'accent']], hl: ['amount'], say: '<code>Amount</code> reads <code>LocalUnits.current</code>. Compose finds the nearest provider above and hands back <code>Ml</code>: “250 ml”. Nobody in between passed anything.' },
              { remove: [['amount', 'app']], hl: ['app'], say: 'The user picks oz in Settings. <code>WaterApp</code> reads that setting, so it runs again and now provides <code>Oz</code>.' },
              { add: [['amount', 'app', 'LocalUnits.current = Oz', 'warm']], hl: ['amount'], say: 'Only <code>Amount</code> read <code>.current</code>, so only <code>Amount</code> runs again: “8 oz”. <code>WaterScreen</code>, <code>DrinkList</code> and <code>DrinkRow</code> are skipped.' },
              { show: ['preview'], hl: ['preview'], say: 'A Preview shows <code>Amount(250)</code> on its own, with no provider above. <code>.current</code> gives the default from <code>compositionLocalOf { Units.Ml }</code>: “250 ml”.' },
            ],
          });
        },
        code: `enum class Units { Ml, Oz }

val LocalUnits = compositionLocalOf { Units.Ml }   // the default, when nobody provides one

@Composable
fun WaterApp(settings: SettingsViewModel = hiltViewModel()) {
    val units by settings.units.collectAsStateWithLifecycle()
    CompositionLocalProvider(LocalUnits provides units) {
        WaterScreen()             // no units parameter anywhere below
    }
}

@Composable
fun Amount(ml: Int) {
    val text = when (LocalUnits.current) {          // the value from the nearest provider
        Units.Ml -> "$ml ml"
        Units.Oz -> "\${ml / 30} oz"                 // about 30 ml in an oz, rounded down
    }
    Text(text)
}
// Amount(250) shows "250 ml", or "8 oz" after the user picks oz.`,
        remember: 'compositionLocalOf { default } makes it, CompositionLocalProvider(Local provides value) { } gives it, Local.current reads it.',
        mistakes: [
          { title: 'A local for a screen’s ViewModel', bad: `val LocalWaterViewModel = compositionLocalOf<WaterViewModel?> { null }

@Composable
fun DrinkRow(drink: Drink) {
    val viewModel = LocalWaterViewModel.current
    TextButton(onClick = { viewModel?.delete(drink) }) { Text("Delete") }
}`, good: `@Composable
fun DrinkRow(drink: Drink, onDelete: () -> Unit) {
    TextButton(onClick = onDelete) { Text("Delete") }
}`, why: 'The row now secretly needs a ViewModel, and a Preview or test has to provide one. Pass events up with a lambda instead. The Compose guide names this as a bad use of CompositionLocal.' },
        ],
        terms: [
          { term: 'CompositionLocal', def: 'A value that a whole part of the tree can read without parameters, like the theme.' },
          { term: 'compositionLocalOf', def: 'Makes a new CompositionLocal. Its lambda gives the default value.' },
          { term: 'CompositionLocalProvider', def: 'Gives a CompositionLocal a value for everything inside its braces: <code>CompositionLocalProvider(LocalUnits provides Units.Oz) { }</code>.' },
          { term: 'current', def: '<code>LocalUnits.current</code>: the value from the nearest provider above, or the default if there is none.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the local, then show the row in oz.', code: `val LocalUnits = [[compositionLocalOf]] { Units.Ml }

CompositionLocalProvider(LocalUnits [[provides]] Units.Oz) {
    Amount(ml = 250)        // reads LocalUnits.[[current]]: "8 oz"
}`, why: '<code>compositionLocalOf</code> makes it, <code>provides</code> gives it a value, <code>.current</code> reads it.' },
          { type: 'bug', prompt: 'Amounts always show ml, even after the user picks oz. Tap the wrong line.', code: `@Composable
fun WaterApp(units: Units) {
    CompositionLocalProvider(LocalUnits provides Units.Ml) {
        WaterScreen()
    }
}`, bug: 2, fix: '    CompositionLocalProvider(LocalUnits provides units) {', why: 'It always provides <code>Units.Ml</code>. Provide the <code>units</code> parameter, so the user’s choice reaches everything inside.' },
        ],
        quiz: [
          { q: 'What does <code>LocalUnits.current</code> give back?', options: ['The value from the nearest <code>CompositionLocalProvider</code> above', 'Always the default', 'The value of the newest provider anywhere in the app'], a: 0, why: 'It looks up the tree and takes the closest provided value.' },
          { q: 'A Preview shows <code>Amount(250)</code> with no provider around it. What does it show?', options: ['“250 ml”: the default from <code>compositionLocalOf</code>', 'It crashes', 'Nothing'], a: 0, why: 'With no provider above, <code>.current</code> gives the default from the lambda.' },
          { q: 'Which is the best fit for a CompositionLocal?', options: ['The units that every amount on the screen shows', 'The drink one row should delete', 'A screen’s ViewModel'], a: 0, why: 'Units are used all over that part of the screen and have a good default. The others belong in parameters.' },
        ],
        docs: [['Locally scoped data with CompositionLocal', 'https://developer.android.com/develop/ui/compose/compositionlocal']],
      },

      {
        id: 'animation',
        title: 'Animation',
        tagline: 'Let values glide to their new value, and let things fade in and out.',
        goals: ['Animate a number with <code>animateFloatAsState</code>', 'Show and hide content smoothly with <code>AnimatedVisibility</code>', 'Read an animated value in the drawing phase'],
        level: 'intermediate', introduces: ['animateFloatAsState', 'AnimatedVisibility', 'fadeIn', 'fadeOut', 'toFloat'],
        body: `
<p>Tap Add and the glass from the Drawing lesson jumps from 3/8 to 4/8 full. Real water rises. And the “Back to top” button from the derivedStateOf lesson pops in and out with no warning. A short animation shows the user what changed.</p>
<p><code>val level by animateFloatAsState(targetValue = target, label = "level")</code> gives you a state that doesn’t jump. When <code>target</code> changes, <code>level</code> moves towards it over a short moment, with a new value in between on every frame, until it arrives. <code>label</code> is a name that Android Studio’s animation tools show.</p>
<p>Every frame of the animation is a state change, so think about phases. Read <code>level</code> inside the Canvas lambda, and each frame reruns only drawing. <code>GlassGauge</code> itself only runs again when <code>glasses</code> changes.</p>
<p>For things that come and go, <code>AnimatedVisibility(visible = showTop, enter = fadeIn(), exit = fadeOut()) { ... }</code> shows its content when <code>visible</code> is <code>true</code>. When it turns <code>false</code>, the content fades out first, and only then leaves the composition. Without <code>enter</code> and <code>exit</code>, it fades and grows by default.</p>`,
        visual(el) {
          const g = (f, tag) => `<div class="ui-m-body" style="justify-items:center;gap:6px"><div style="font-size:0.95rem">Water today</div><svg class="cx-glass" viewBox="0 0 120 160" width="96" height="128" aria-hidden="true"><rect width="120" height="160" style="fill:var(--accent-soft)"/><rect y="${(160 - 160 * f).toFixed(1)}" width="120" height="${(160 * f).toFixed(1)}" style="fill:var(--accent)"/></svg><div style="font-weight:800">${tag}</div><span class="ui-m-btn b-add" style="justify-self:center">Add a glass</span></div>`;
          const top = o => `<div class="ui-m-bar">History</div><div class="ui-m-body"><div class="ui-m-row"><div>Fri 16 Oct</div></div><div class="ui-m-row"><div>Thu 15 Oct</div></div><div class="ui-m-row"><div>Wed 14 Oct</div></div><div class="ui-m-row"><div>Tue 13 Oct</div></div></div><span class="ui-m-btn" style="position:absolute;right:12px;bottom:12px;opacity:${o}">Back to top</span>`;
          Lab.ui.phone(el, {
            logTitle: 'Each frame',
            predict: {
              q: 'You tap Add once, and the target goes from 0.375 to 0.5. How many times does <code>level</code> change before it settles?',
              options: ['Many times: once per frame', 'Once', 'Twice: start and end'],
              a: 0,
              why: 'An animation is a value that changes a little on every frame until it reaches the target.',
            },
            frames: [
              { screen: g(0.375, '3 of 8 glasses'), log: 'level = 0.375', say: '3 of 8 glasses. <code>level</code> is 0.375 and the glass is drawn 3/8 full.' },
              { tap: '.b-add', screen: g(0.42, '4 of 8 glasses'), log: ['target = 0.5', 'level ≈ 0.42: drawing ran'], say: 'Tap. The target becomes 0.5, but <code>level</code> only moves part of the way this frame. The Canvas reads it, so only drawing runs.' },
              { screen: g(0.47, '4 of 8 glasses'), log: 'level ≈ 0.47: drawing ran', say: 'Next frame: a bit closer. Composition and layout are not involved.' },
              { screen: g(0.5, '4 of 8 glasses'), log: 'level = 0.5: done', say: 'It arrives at 0.5 and stops changing. The water rose instead of jumping. (Values in between are rounded.)' },
              { screen: top(1), log: '— AnimatedVisibility(visible = showTop) —', say: 'Now the History list, scrolled down: <code>showTop</code> is <code>true</code>, so the button is shown.' },
              { screen: top(0.4), log: 'showTop = false: fading out', say: 'The user scrolls back to the top. <code>showTop</code> turns <code>false</code>, and <code>fadeOut()</code> starts. The button is still in the composition while it fades.' },
              { screen: top(0), log: 'faded out: the button left the composition', say: 'When the fade ends, <code>AnimatedVisibility</code> removes the button.' },
            ],
          });
        },
        code: `@Composable
fun GlassGauge(glasses: Int, goal: Int, modifier: Modifier = Modifier) {
    val water = MaterialTheme.colorScheme.primary
    val glass = MaterialTheme.colorScheme.primaryContainer
    val target = if (glasses > goal) 1f else glasses.toFloat() / goal   // toFloat(): like toDouble(). 3 of 8: 0.375
    val level by animateFloatAsState(targetValue = target, label = "level")

    Canvas(modifier = modifier.size(120.dp, 160.dp)) {
        drawRect(color = glass)
        val height = size.height * level              // read here: each frame reruns only drawing
        drawRect(color = water, topLeft = Offset(0f, size.height - height), size = Size(size.width, height))
    }
}

// In HistoryScreen, instead of if (showTop) { ... }:
AnimatedVisibility(visible = showTop, enter = fadeIn(), exit = fadeOut()) {
    Button(onClick = { scope.launch { listState.animateScrollToItem(0) } }) {
        Text("Back to top")
    }
}`,
        remember: 'animateFloatAsState(target) glides to each new target; AnimatedVisibility(visible) fades content in and out.',
        mistakes: [
          { title: 'Hiding AnimatedVisibility with an if', bad: `if (showTop) {
    AnimatedVisibility(visible = showTop, exit = fadeOut()) {
        BackToTopButton()
    }
}`, good: `AnimatedVisibility(visible = showTop, exit = fadeOut()) {
    BackToTopButton()
}`, why: 'When <code>showTop</code> turns <code>false</code>, the <code>if</code> removes <code>AnimatedVisibility</code> at once, so there is nothing left to fade out. Let <code>AnimatedVisibility</code> stay and decide for itself.' },
        ],
        terms: [
          { term: 'animateFloatAsState', def: 'Gives a <code>Float</code> state that moves step by step, one frame at a time, to each new <code>targetValue</code>.' },
          { term: 'AnimatedVisibility', def: 'Shows its content when <code>visible</code> is <code>true</code>, and animates it in and out.' },
          { term: 'fadeIn / fadeOut', def: 'Enter and exit animations for <code>AnimatedVisibility</code>: the content fades in or out.' },
          { term: 'toFloat', def: 'Turns a number into a <code>Float</code>, like <code>toDouble()</code> does for <code>Double</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let the level glide, and fade the button in and out.', code: `val level by [[animateFloatAsState]](targetValue = target, label = "level")

[[AnimatedVisibility]](visible = showTop, enter = fadeIn(), exit = [[fadeOut]]()) {
    BackToTopButton()
}`, why: '<code>animateFloatAsState</code> animates a number. <code>AnimatedVisibility</code> animates something appearing and leaving.' },
          { type: 'bug', prompt: 'The glass still jumps to the new level instead of rising. Tap the wrong line.', code: `val target = glasses.toFloat() / goal
val level by animateFloatAsState(targetValue = target, label = "level")
Canvas(modifier = Modifier.size(120.dp, 160.dp)) {
    val height = size.height * target
    drawRect(color = water, topLeft = Offset(0f, size.height - height), size = Size(size.width, height))
}`, bug: 3, fix: '    val height = size.height * level', why: '<code>target</code> jumps straight to the new value. <code>level</code> is the animated one, so draw with it.' },
        ],
        quiz: [
          { q: 'What does <code>animateFloatAsState</code> give you?', options: ['A state that moves frame by frame from its old value to the target', 'The target, right away', 'A list of every value in between'], a: 0, why: 'You read it like any state. Its value changes a little on each frame.' },
          { q: '<code>level</code> is read only inside the Canvas lambda. While it animates, what runs on each frame?', options: ['Only drawing', 'All three phases', 'Only composition'], a: 0, why: 'A read in the drawing phase reruns only drawing.' },
          { q: '<code>showTop</code> turns <code>false</code>. With <code>AnimatedVisibility(visible = showTop, exit = fadeOut())</code>, what happens to the button?', options: ['It fades out, then leaves the composition', 'It disappears at once', 'It stays on screen, faded'], a: 0, why: 'The content stays while the exit animation runs, and is removed when it ends.' },
        ],
        docs: [['Value-based animations', 'https://developer.android.com/develop/ui/compose/animation/value-based'], ['Animation modifiers and composables', 'https://developer.android.com/develop/ui/compose/animation/composables-modifiers']],
      },

      {
        id: 'shared-elements',
        title: 'Shared elements',
        tagline: 'Let a picture fly from one screen into the next, so the user sees where they went.',
        goals: ['Wrap a <code>NavHost</code> in <code>SharedTransitionLayout</code>', 'Mark the same element on two screens with <code>sharedElement</code> and one key', 'Choose a key that is unique per item'],
        level: 'intermediate', introduces: ['SharedTransitionLayout', 'SharedTransitionScope', 'AnimatedVisibilityScope', 'sharedElement', 'rememberSharedContentState', 'with'],
        body: `
<p>On History, each day has a small glass. Tap Sun 18 Oct and a detail screen opens with a big glass for that day. With a <em>shared element transition</em>, the small glass grows and moves into the big one while the screens change, so the user’s eye follows it to the new screen.</p>
<p>Three pieces work together. <code>SharedTransitionLayout { }</code> goes around the <code>NavHost</code>; inside its braces, <code>this</code> is a <code>SharedTransitionScope</code>, which knows how to move elements between screens. The NavHost animates from one screen to the next, and inside each <code>composable&lt;Route&gt; { }</code>, <code>this</code> is an <code>AnimatedVisibilityScope</code>: it tracks whether that screen is appearing or leaving. With two of them nested, <code>this@SharedTransitionLayout</code> and <code>this@composable</code> say which <code>this</code> you mean: the one of the braces with that name.</p>
<p>Both screens give the glass <code>Modifier.sharedElement(rememberSharedContentState(key = "glass-$date"), animatedVisibilityScope = visibility)</code>. When the screens change, Compose finds the same key on both and animates the glass’s size and position from one to the other. <code>sharedElement</code> only works inside a <code>SharedTransitionScope</code>, so a screen wraps its content in <code>with(shared) { }</code>: like <code>run</code>, it runs the braces with <code>shared</code> as <code>this</code>.</p>
<p>The key is the link, so it must be the same on both screens and unique per day. If every row used <code>"glass"</code>, Compose couldn’t tell which row’s glass belongs to the detail screen. These APIs are stable since Compose Animation 1.10.</p>`,
        visual(el) {
          const glass = (f, w, hgt) => `<svg viewBox="0 0 120 160" width="${w}" height="${hgt}" aria-hidden="true" style="flex:none"><rect width="120" height="160" style="fill:var(--accent-soft)"/><rect y="${160 - 160 * f}" width="120" height="${160 * f}" style="fill:var(--accent)"/></svg>`;
          const days = [['Mon 19 Oct', 6], ['Sun 18 Oct', 8], ['Sat 17 Oct', 5], ['Fri 16 Oct', 9]];
          const list = (o, hide) => `<div class="ui-m-bar" style="opacity:${o}">History</div><div class="ui-m-body" style="opacity:${o}">${days.map(([d, n]) => `<div class="ui-m-row ${d === 'Sun 18 Oct' ? 'd18' : ''}">${d === 'Sun 18 Oct' && hide ? '<span style="width:18px;flex:none"></span>' : glass(Math.min(n, 8) / 8, 18, 24)}<div>${d}: ${n}</div></div>`).join('')}</div>`;
          const fly = (left, top, w) => `<div style="position:absolute;left:${left}px;top:${top}px">${glass(1, w, w * 4 / 3)}</div>`;
          const detail = o => `<div class="ui-m-bar" style="opacity:${o}">← Sun 18 Oct</div><div class="ui-m-body" style="justify-items:center;opacity:${o}"><span style="width:96px;height:128px"></span><b>8 of 8 glasses</b><span class="ui-m-muted">Goal reached</span></div>`;
          const big = fly(64, 52, 96);
          Lab.ui.phone(el, {
            logTitle: 'Shared keys',
            predict: {
              q: 'The detail screen’s glass has the key <code>"glass-Sun 18 Oct"</code>. Which glass on History flies into it?',
              options: ['The one in the Sun 18 Oct row, which has the same key', 'The first row’s glass', 'None: they are on different screens'],
              a: 0,
              why: 'Compose matches elements by key. Only the Sun 18 Oct row uses that key.',
            },
            frames: [
              { screen: list(1), log: 'rows: glass-Mon 19 Oct, glass-Sun 18 Oct, …', say: 'Each row’s small glass has <code>sharedElement</code> with the key <code>"glass-\${day.date}"</code>.' },
              { tap: '.d18', log: 'navigate(DayDetail("Sun 18 Oct", 8))', say: 'The user taps Sun 18 Oct. The NavHost starts animating from History to DayDetail.' },
              { screen: list(0.4, true) + fly(40, 70, 52), log: 'match: glass-Sun 18 Oct on both screens', say: 'For a moment both screens are there. Compose finds the key on both, and moves and grows the glass between its old and new place.' },
              { screen: detail(1) + big, log: 'arrived', say: 'The glass lands in its spot on the detail screen. The rest of the screen faded in around it.' },
              { screen: list(0.4, true) + fly(40, 70, 52), log: 'Back: the same key, the other way', say: 'Back works the same way in reverse: the big glass shrinks back into its row.' },
              { screen: list(1), log: 'back on History', say: 'History again. One key per day, the same on both screens, is all the link there is.' },
            ],
          });
        },
        code: `@Serializable data class History(val goal: Int)
@Serializable data class DayDetail(val date: String, val glasses: Int)

@Composable
fun WaterApp(days: List<Day>) {
    val navController = rememberNavController()
    SharedTransitionLayout {
        // Today left out to keep the example short; HistoryScreen now also gets the days and both scopes.
        NavHost(navController, startDestination = History(goal = 8)) {
            composable<History> {
                HistoryScreen(
                    days = days,
                    onOpen = { day -> navController.navigate(DayDetail(day.date, day.glasses)) },
                    shared = this@SharedTransitionLayout,
                    visibility = this@composable,
                )
            }
            composable<DayDetail> { entry ->
                val route: DayDetail = entry.toRoute()
                DayScreen(route.date, route.glasses, this@SharedTransitionLayout, this@composable)
            }
        }
    }
}

@Composable
fun DayScreen(date: String, glasses: Int, shared: SharedTransitionScope, visibility: AnimatedVisibilityScope) {
    with(shared) {                                    // sharedElement works in here
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            GlassGauge(
                glasses = glasses, goal = 8,
                modifier = Modifier.sharedElement(
                    rememberSharedContentState(key = "glass-$date"),
                    animatedVisibilityScope = visibility,
                ),
            )
            Text(date, style = MaterialTheme.typography.headlineSmall)
        }
    }
}
// HistoryScreen does the same inside with(shared), on each row's small GlassGauge,
// with the key "glass-\${day.date}".`,
        remember: 'SharedTransitionLayout around the NavHost; sharedElement with the same unique key on both screens.',
        mistakes: [
          { title: 'One key for every row', bad: `rememberSharedContentState(key = "glass")`, good: `rememberSharedContentState(key = "glass-\${day.date}")`, why: 'With the same key on every row, Compose can’t tell which of the rows is the one to fly into the detail screen. Put something unique per item in the key, like the date or an id.' },
        ],
        terms: [
          { term: 'shared element transition', def: 'An animation in which an element moves and changes size from its place on one screen to its place on the next.' },
          { term: 'SharedTransitionLayout', def: 'Goes around the screens that share elements. Inside it, <code>this</code> is a <code>SharedTransitionScope</code>.' },
          { term: 'AnimatedVisibilityScope', def: 'Tracks whether a screen is appearing or leaving. In a NavHost, it is <code>this@composable</code>.' },
          { term: 'with', def: '<code>with(x) { }</code> runs the braces with <code>x</code> as <code>this</code>, like <code>x.run { }</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Wrap the NavHost, and hand the screen both scopes.', code: `[[SharedTransitionLayout]] {
    NavHost(navController, startDestination = History(goal = 8)) {
        composable<History> {
            HistoryScreen(shared = this@SharedTransitionLayout, visibility = this@[[composable]])
        }
    }
}`, why: '<code>SharedTransitionLayout</code> goes around the NavHost. Inside <code>composable&lt;History&gt; { }</code>, <code>this@composable</code> is that screen’s <code>AnimatedVisibilityScope</code>.' },
          { type: 'bug', prompt: 'Tapping a day opens the detail screen, but the glass doesn’t fly. It just appears. Tap the wrong line.', code: `// HistoryScreen, each row:
Modifier.sharedElement(rememberSharedContentState(key = "glass-\${day.date}"), animatedVisibilityScope = visibility)
// DayScreen:
Modifier.sharedElement(rememberSharedContentState(key = "big-glass-$date"), animatedVisibilityScope = visibility)`, bug: 3, fix: 'Modifier.sharedElement(rememberSharedContentState(key = "glass-$date"), animatedVisibilityScope = visibility)', why: 'The keys must be the same on both screens. <code>"big-glass-Sun 18 Oct"</code> never matches <code>"glass-Sun 18 Oct"</code>.' },
        ],
        quiz: [
          { q: 'What links the small glass on History to the big one on the detail screen?', options: ['The same key in <code>rememberSharedContentState</code>', 'The same size', 'The same composable'], a: 0, why: 'Compose matches shared elements by key, nothing else.' },
          { q: 'Where does <code>SharedTransitionLayout</code> go?', options: ['Around the NavHost, so both screens are inside it', 'Inside each screen', 'Around each glass'], a: 0, why: 'It has to contain both screens to move an element between them.' },
          { q: 'Inside <code>composable&lt;History&gt; { }</code>, what is <code>this@composable</code>?', options: ['The screen’s <code>AnimatedVisibilityScope</code>: whether it is appearing or leaving', 'The NavController', 'The <code>SharedTransitionScope</code>'], a: 0, why: 'The NavHost animates each screen in and out and hands you that scope as <code>this</code>.' },
        ],
        docs: [['Shared element transitions in Compose', 'https://developer.android.com/develop/ui/compose/animation/shared-elements'], ['Shared elements with Navigation', 'https://developer.android.com/develop/ui/compose/animation/shared-elements/navigation']],
      },

      {
        id: 'layout',
        title: 'Custom layouts',
        tagline: 'Measure the children yourself, then place each one where you want it.',
        goals: ['Measure children inside <code>Layout</code> with <code>measure</code> and the constraints', 'Set the size and place children with <code>layout</code> and <code>placeRelative</code>', 'Build a row that wraps onto the next line'],
        level: 'intermediate', introduces: ['Layout', 'constraints', 'measure', 'Placeable', 'maxWidth', 'layout', 'placeRelative'],
        body: `
<p>Under the counter, the water tracker shows a chip for each drink: “250 ml”, “Tea 300 ml”, and so on. In a <code>Row</code>, the chips run off the right edge of the screen. They should wrap onto the next line, like words in a sentence. Compose has <code>FlowRow</code> for exactly this, but building a small one yourself shows how every layout works, so you can make one that nothing else covers.</p>
<p>In the layout phase, each layout measures its children, then places them. <code>Layout(content = content, modifier = modifier) { measurables, constraints -> ... }</code> hands you the children, not measured yet (<code>measurables</code>), and the <code>constraints</code> from the parent: the smallest and largest width and height you may use, like <code>constraints.maxWidth</code>. <code>it.measure(constraints)</code> measures one child and gives back a <code>Placeable</code>, which knows its <code>width</code> and <code>height</code>. You may measure each child only once.</p>
<p>Then <code>layout(width, height) { ... }</code> (small <code>l</code>: a function inside the lambda, not the <code>Layout</code> composable) sets your layout’s own size, and inside its braces <code>placeable.placeRelative(x, y)</code> puts each child at x and y pixels from the top-left. (“Relative” means it is mirrored for right-to-left languages.)</p>
<p>The wrapping row goes through the chips keeping an <code>x</code> and a <code>y</code>. When the next chip doesn’t fit into <code>maxWidth</code>, it starts a new line: <code>x</code> goes back to 0, and <code>y</code> moves down by the height of the line.</p>`,
        visual(el) {
          const chips = [['250 ml', 80], ['Tea 300 ml', 110], ['330 ml', 70], ['Juice 200 ml', 120]];
          const pos = [[0, 0], [80, 0], [0, 36], [70, 36]];
          const box = (n, h) => `<div class="ui-m-body"><span class="ui-m-muted">WrapRow, maxWidth = 200</span><div class="cx-chips" style="height:${h}px">${chips.slice(0, n).map(([t, w], k) => `<span class="cx-chip${k === n - 1 ? ' cx-new' : ''}" style="left:${pos[k][0] / 2}%;top:${pos[k][1]}px;width:${w / 2}%;height:36px">${t}</span>`).join('')}</div></div>`;
          Lab.ui.phone(el, {
            logTitle: 'measure, then place',
            predict: {
              q: '<code>maxWidth</code> is 200. The first line holds chips 80 and 110 wide, so <code>x</code> is 190. The next chip is 70 wide. Where does it go?',
              options: ['At the start of a new line, x = 0', 'At x = 190 on the same line', 'It is squeezed to 10 wide'],
              a: 0,
              why: '190 + 70 = 260, more than 200. The chip doesn’t fit, so a new line starts.',
            },
            frames: [
              { screen: box(0, 80), log: 'measured: 80, 110, 70, 120 wide, 36 high', say: 'First every chip is measured once. The parent allows at most 200 px of width. (Small numbers, to keep it readable.)' },
              { screen: box(1, 80), log: '250 ml: x 0, y 0 → x = 80', say: 'The first chip goes at (0, 0). <code>x</code> moves on to 80.' },
              { screen: box(2, 80), log: 'Tea 300 ml: 80 + 110 = 190 ≤ 200 → (80, 0), x = 190', say: '80 + 110 = 190, which fits. It goes at (80, 0), and <code>x</code> becomes 190.' },
              { screen: box(3, 80), log: '330 ml: 190 + 70 = 260 > 200 → new line, (0, 36)', say: '190 + 70 is more than 200. New line: <code>x</code> = 0, and <code>y</code> moves down by the line’s height: 0 + 36 = 36.' },
              { screen: box(4, 80), log: 'Juice 200 ml: 70 + 120 = 190 ≤ 200 → (70, 36)', say: 'The last chip fits next to it, at (70, 36).' },
              { log: 'layout(200, 36 + 36): 200 × 72', say: 'The layout’s own size: <code>layout(constraints.maxWidth, y + lineHeight)</code>, so the full width, and <code>y</code> (36) plus the last line’s height (36). Then each chip is placed at the position worked out for it.' },
            ],
          });
        },
        code: `@Composable
fun WrapRow(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Layout(content = content, modifier = modifier) { measurables, constraints ->
        val loose = constraints.copy(minWidth = 0, minHeight = 0)   // a chip may be small
        val placeables = measurables.map { it.measure(loose) }     // measure each child once

        val xs = mutableListOf<Int>()
        val ys = mutableListOf<Int>()
        var x = 0
        var y = 0
        var lineHeight = 0
        for (p in placeables) {
            if (x > 0 && x + p.width > constraints.maxWidth) {     // doesn't fit: new line
                x = 0
                y += lineHeight
                lineHeight = 0
            }
            xs.add(x)
            ys.add(y)
            x += p.width
            if (p.height > lineHeight) {
                lineHeight = p.height
            }
        }

        layout(constraints.maxWidth, y + lineHeight) {            // our own size
            for (i in placeables.indices) {
                placeables[i].placeRelative(xs[i], ys[i])
            }
        }
    }
}

// In WaterScreen:
WrapRow(modifier = Modifier.fillMaxWidth()) {
    for (drink in drinks) {
        Text("\${drink.ml} ml", modifier = Modifier.padding(8.dp))
    }
}`,
        remember: 'Layout { measurables, constraints -> }: measure each child once, then layout(width, height) { placeRelative(x, y) }.',
        mistakes: [
          { title: 'Passing the parent’s constraints straight on', bad: `val placeables = measurables.map { it.measure(constraints) }`, good: `val loose = constraints.copy(minWidth = 0, minHeight = 0)
val placeables = measurables.map { it.measure(loose) }`, why: '<code>Modifier.fillMaxWidth()</code> on <code>WrapRow</code> sets <code>minWidth</code> to the full width. Hand that on, and every chip must be the full width too: one chip per line. <code>copy</code> keeps the maximum and lets the minimum be 0.' },
        ],
        terms: [
          { term: 'Layout', def: 'The composable behind every layout. Its lambda gets the children (<code>measurables</code>) and the parent’s <code>constraints</code>.' },
          { term: 'constraints', def: 'The smallest and largest width and height a layout may use, from its parent, like <code>constraints.maxWidth</code>.' },
          { term: 'measure', def: '<code>measurable.measure(constraints)</code> measures a child once and gives back a <code>Placeable</code> with a <code>width</code> and <code>height</code>.' },
          { term: 'placeRelative', def: 'Places a measured child at x and y pixels, mirrored for right-to-left languages. It goes inside <code>layout(width, height) { }</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A simple column: measure every child, then stack them from the top.', code: `Layout(content = content, modifier = modifier) { measurables, constraints ->
    // a column: here each child may take the full width, so the parent's constraints are fine
    val placeables = measurables.map { it.[[measure]](constraints) }
    [[layout]](constraints.maxWidth, constraints.maxHeight) {
        var y = 0
        for (p in placeables) {
            p.[[placeRelative]](0, y)
            y += p.height
        }
    }
}`, why: 'Measure first, then <code>layout</code> sets the size and places each child, each one below the last.' },
          { type: 'bug', prompt: 'This column draws every child on top of each other at the top. Tap the wrong line.', code: `layout(constraints.maxWidth, constraints.maxHeight) {
    var y = 0
    for (p in placeables) {
        p.placeRelative(0, 0)
        y += p.height
    }
}`, bug: 3, fix: '        p.placeRelative(0, y)', why: '<code>y</code> grows by each child’s height, but the children are all placed at y 0. Place each one at <code>y</code>.' },
        ],
        quiz: [
          { q: 'What does <code>measure()</code> give back?', options: ['A <code>Placeable</code> that knows its width and height', 'The child, already on the screen', 'The parent’s constraints'], a: 0, why: 'You measure first and get a <code>Placeable</code>. It appears on screen only when you place it.' },
          { q: 'How many times may a layout measure one child?', options: ['Once', 'As often as it likes', 'Twice: once small, once big'], a: 0, why: 'Compose allows one measurement per child. That keeps layout fast.' },
          { q: '<code>maxWidth</code> is 300. Chips 120 and 150 wide are on the line, so <code>x</code> is 270. A chip 40 wide comes next. Where does it go?', options: ['At the start of a new line', 'On the same line, at x = 270', 'At x = 300'], a: 0, why: '270 + 40 = 310, more than 300, so it doesn’t fit.' },
        ],
        docs: [['Custom layouts', 'https://developer.android.com/develop/ui/compose/layouts/custom']],
      },

      {
        id: 'navigation',
        title: 'Navigation in depth',
        tagline: 'Group screens into a nested graph, and clear the whole group from the back stack.',
        goals: ['Group related screens into a nested graph with <code>navigation</code>', 'Remove screens from the back stack while navigating, with <code>popUpTo</code>', 'Keep route data small: an id, not a whole object'],
        level: 'intermediate', introduces: ['navigation', 'popUpTo', 'inclusive'],
        body: `
<p>On first launch the water tracker shows two onboarding screens: Welcome, then Pick your goal. Then the Today screen. But Back on Today goes back into Pick your goal, which makes no sense once the user is done. And the two onboarding screens belong together; the NavHost should say so.</p>
<p>A <em>nested graph</em> groups screens under one route. Inside the NavHost, <code>navigation&lt;Onboarding&gt;(startDestination = Welcome) { ... }</code> holds the <code>composable&lt;Welcome&gt;</code> and <code>composable&lt;PickGoal&gt;</code> screens. <code>Onboarding</code> is a route like any other, so <code>NavHost(startDestination = Onboarding)</code> and <code>navigate(Onboarding)</code> both open the group at its start screen, Welcome.</p>
<p>Leaving the group: <code>navController.navigate(Today) { popUpTo(route = Onboarding) { inclusive = true } }</code>. The braces after <code>navigate</code> set options. <code>popUpTo</code> removes screens from the top of the back stack, down to <code>Onboarding</code>, before Today is added; <code>inclusive = true</code> removes <code>Onboarding</code> itself too. The stack is then only Today, so Back leaves the app.</p>
<p>A word on route data: it is saved with the back stack, so keep it small. Navigation stores simple values like <code>Int</code>, <code>String</code> and <code>Boolean</code> on its own. Pass a date or an id, and let the next screen’s ViewModel load the rest with <code>savedStateHandle.toRoute()</code>, as in the news reader app.</p>`,
        visual(el) {
          const welcome = '<div class="ui-m-center"><b style="font-size:1rem">Welcome</b><span class="ui-m-muted">Track the water you drink.</span><span class="ui-m-btn b-next" style="justify-self:center">Next</span></div>';
          const goal = '<div class="ui-m-center"><b style="font-size:1rem">Pick your goal</b><span class="ui-m-chip">8 glasses</span><span class="ui-m-btn b-done" style="justify-self:center">Done</span></div>';
          const today = '<div class="ui-m-bar">Water</div><div class="ui-m-body"><b>0 of 8 glasses</b><span class="ui-m-muted">No drinks yet today.</span></div><span class="ui-m-fab">+</span>';
          const home = '<div class="ui-m-center"><span class="ui-m-muted">Home screen</span></div>';
          Lab.ui.phone(el, {
            logTitle: 'Back stack (top last)',
            predict: {
              q: 'Done calls <code>navigate(Today)</code> with no options. The user makes the Back gesture on Today. What do they see?',
              options: ['Pick your goal', 'The home screen', 'Welcome'],
              a: 0,
              why: 'Plain <code>navigate</code> only adds Today on top. The onboarding screens are still underneath.',
            },
            frames: [
              { screen: welcome, log: '[Welcome]  (inside Onboarding)', say: 'The NavHost starts at <code>Onboarding</code>, which opens its start screen, Welcome.' },
              { tap: '.b-next', screen: goal, log: 'navigate(PickGoal) → [Welcome, PickGoal]', say: 'Next adds Pick your goal on top.' },
              { tap: '.b-done', screen: today, log: 'navigate(Today) → [Welcome, PickGoal, Today]', say: 'First try: Done calls <code>navigate(Today)</code> with no options. Today goes on top of the two onboarding screens.' },
              { screen: goal, log: 'Back → [Welcome, PickGoal]', say: 'Back removes Today and shows what is below it: Pick your goal. Not what the user expects.' },
              { tap: '.b-done', screen: today, log: ['navigate(Today) { popUpTo(route = Onboarding) { inclusive = true } }', '→ [Today]'], say: 'Second try, with <code>popUpTo</code>: Welcome and Pick your goal are removed down to the Onboarding group, and the group itself too (<code>inclusive</code>). Then Today is added.' },
              { screen: home, log: 'Back on [Today]: nothing to pop', say: 'Now Back on Today has nothing below it, so the user leaves the app, as on any first screen.' },
            ],
          });
        },
        code: `@Serializable object Onboarding          // the route of the group
@Serializable object Welcome
@Serializable object PickGoal
@Serializable object Today

@Composable
fun WaterApp() {
    val navController = rememberNavController()
    NavHost(navController, startDestination = Onboarding) {
        navigation<Onboarding>(startDestination = Welcome) {
            composable<Welcome> {
                WelcomeScreen(onNext = { navController.navigate(PickGoal) })
            }
            composable<PickGoal> {
                PickGoalScreen(onDone = {
                    navController.navigate(Today) {
                        popUpTo(route = Onboarding) { inclusive = true }   // drop the whole group
                    }
                })
            }
        }
        composable<Today> { WaterScreen() }
    }
}
// Screens on the back stack before Done: Welcome, PickGoal. After: Today.`,
        remember: 'navigation<Group>(startDestination = First) { } groups screens; navigate(next) { popUpTo(route = Group) { inclusive = true } } clears them.',
        mistakes: [
          { title: 'Putting a whole object in a route', bad: `@Serializable data class DayDetail(val day: Day)   // Day: date, glasses, drinks…`, good: `@Serializable data class DayDetail(val date: String)
// DayViewModel: savedStateHandle.toRoute<DayDetail>().date, then load the day`, why: 'Navigation can’t store a <code>Day</code> without extra code, and a copy saved in the back stack can go stale. Pass the date, and let the ViewModel load the day from the repository.' },
        ],
        terms: [
          { term: 'nested graph', def: 'A group of screens under one route, made with <code>navigation&lt;Route&gt;(startDestination = ...) { }</code> inside a NavHost.' },
          { term: 'popUpTo', def: 'An option of <code>navigate</code>: before adding the new screen, remove screens from the back stack down to the given route.' },
          { term: 'inclusive', def: 'In <code>popUpTo</code>: <code>true</code> removes the given route itself too, not only the screens above it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Group the onboarding screens, and clear them when the user is done.', code: `[[navigation]]<Onboarding>(startDestination = Welcome) {
    composable<Welcome> { WelcomeScreen() }
    composable<PickGoal> { PickGoalScreen() }
}

// when onboarding is done:
navController.navigate(Today) {
    [[popUpTo]](route = Onboarding) { [[inclusive]] = true }
}`, why: '<code>navigation</code> makes the group. <code>popUpTo</code> with <code>inclusive = true</code> removes the whole group before Today is added.' },
          { type: 'bug', prompt: 'After onboarding, Back on Today still shows Pick your goal. Tap the wrong line.', code: `composable<PickGoal> {
    PickGoalScreen(onDone = {
        navController.navigate(Today) {
            popUpTo(route = Today) { inclusive = true }
        }
    })
}`, bug: 3, fix: '            popUpTo(route = Onboarding) { inclusive = true }', why: '<code>popUpTo</code> removes screens down to a route that is already on the back stack. Today isn’t there yet, so nothing is removed. Pop up to the Onboarding group.' },
        ],
        quiz: [
          { q: 'The back stack holds Welcome and PickGoal, inside Onboarding. You call <code>navigate(Today) { popUpTo(route = Onboarding) { inclusive = true } }</code>. What is on the stack now?', options: ['Today', 'Welcome, Today', 'Welcome, PickGoal, Today'], a: 0, why: 'Everything down to and including Onboarding is removed, then Today is added.' },
          { q: 'What does <code>navigate(Onboarding)</code> open?', options: ['The group’s start screen, Welcome', 'Every screen of the group at once', 'The last screen of the group'], a: 0, why: 'A nested graph’s route opens its <code>startDestination</code>.' },
          { q: 'Which route is the better choice?', options: ['<code>DayDetail(val date: String)</code>', '<code>DayDetail(val day: Day)</code>, with the whole day', 'Neither: routes can’t carry data'], a: 0, why: 'A small value is saved easily, and the screen loads fresh data with it.' },
        ],
        docs: [['Nested graphs', 'https://developer.android.com/guide/navigation/design/nested-graphs'], ['Type safety in Kotlin DSL and Navigation Compose', 'https://developer.android.com/guide/navigation/design/type-safety']],
      },

      {
        id: 'nav3',
        title: 'Navigation 3',
        tagline: 'The back stack is a list you own: add to go forward, remove to go back.',
        goals: ['Hold the back stack yourself with <code>rememberNavBackStack</code>', 'Show it with <code>NavDisplay</code> and <code>entryProvider</code>', 'Navigate by adding to the list and removing from it'],
        level: 'intermediate', introduces: ['NavKey', 'rememberNavBackStack', 'NavDisplay', 'entryProvider', 'entryDecorators', 'removeLastOrNull'],
        body: `
<p>In Navigation Compose, the back stack lives inside the <code>NavController</code>: you ask it to navigate or pop, and you learn its options, like <code>popUpTo</code>, for anything unusual. Navigation 3 (<code>androidx.navigation3</code>, stable version 1.2.0) is a newer library made for Compose, in which the back stack is a plain list that you hold and change yourself.</p>
<p>Each screen has a <em>key</em>: <code>@Serializable object Today : NavKey</code>, <code>@Serializable data class History(val goal: Int) : NavKey</code>. <code>NavKey</code> is an interface with nothing to implement; it marks a key that can be saved. <code>val backStack = rememberNavBackStack(Today)</code> makes the list, starting with Today. It is state, and because the keys are <code>@Serializable</code>, it survives rotation and Android stopping the app in the background.</p>
<p><code>NavDisplay(backStack = backStack, onBack = { ... }, entryProvider = entryProvider { ... })</code> shows the screen for the last key in the list. Inside <code>entryProvider { }</code>, <code>entry&lt;History&gt; { key -> ... }</code> says what to show for each key type, and hands you the key itself, so <code>key.goal</code> needs no <code>toRoute</code>. To go forward, <code>backStack.add(History(goal = 8))</code>. To go back, <code>backStack.removeLastOrNull()</code> removes the last key (it returns <code>null</code> instead of crashing on an empty list, but <code>NavDisplay</code> always needs at least one key: on the last screen, Back leaves the app as usual). <code>onBack</code> runs it when the user makes the Back gesture.</p>
<p>For a <code>hiltViewModel()</code> per screen, add the <code>lifecycle-viewmodel-navigation3</code> library and list its decorator in <code>entryDecorators</code>, as in the code. Passing your own list replaces the default, so keep <code>rememberSaveableStateHolderNavEntryDecorator()</code> first: it keeps each screen’s <code>rememberSaveable</code> state. Both libraries are maintained: the Navigation guide still points Compose apps to Navigation Compose, which most existing apps use, while Navigation 3 suits apps that want full control of the stack.</p>`,
        visual(el) {
          const today = '<div class="ui-m-bar">Water</div><div class="ui-m-body"><b>3 of 8 glasses</b><div class="ui-m-row"><div>#1 · 250 ml</div></div><div class="ui-m-row"><div>#2 · 500 ml</div></div><span class="hist" style="justify-self:start;padding:6px 12px;font-weight:700;font-size:0.8rem;color:var(--accent)">History</span></div><span class="ui-m-fab">+</span>';
          const history = g => `<div class="ui-m-bar">← History</div><div class="ui-m-body"><span class="ui-m-muted">Goal: ${g} glasses</span><div class="ui-m-row"><div>Mon 19 Oct: 6${6 >= g ? ' ✓' : ''}</div></div><div class="ui-m-row"><div>Sun 18 Oct: 8${8 >= g ? ' ✓' : ''}</div></div><div class="ui-m-row"><div>Sat 17 Oct: 5${5 >= g ? ' ✓' : ''}</div></div></div>`;
          Lab.ui.phone(el, {
            logTitle: 'backStack',
            predict: {
              q: '<code>backStack</code> is <code>[Today, History(goal=8)]</code>. The user makes the Back gesture. What is in the list now?',
              options: ['<code>[Today]</code>', '<code>[]</code>', '<code>[Today, History(goal=8)]</code>'],
              a: 0,
              why: '<code>onBack</code> calls <code>removeLastOrNull()</code>, which removes the last key, History. Today is shown again.',
            },
            frames: [
              { screen: today, log: '[Today]', say: '<code>rememberNavBackStack(Today)</code>: a list with one key. <code>NavDisplay</code> shows the screen for the last key: Today.' },
              { tap: '.hist', log: 'backStack.add(History(goal = 8))', say: 'The user taps History. Today’s screen calls <code>onOpenHistory(8)</code>, and your code adds a key to the list. No controller involved.' },
              { screen: history(8), log: '[Today, History(goal=8)]', say: 'The list changed, and it is state, so <code>NavDisplay</code> shows the new last key. <code>entry&lt;History&gt; { key -> }</code> reads <code>key.goal</code>.' },
              { screen: today, log: ['Back gesture → onBack → removeLastOrNull()', '[Today]'], say: 'Back runs <code>onBack</code>, which removes the last key. Today is the last one again.' },
              { tap: '.hist', screen: history(6), log: ['backStack.add(History(goal = 6))', '[Today, History(goal=6)]'], say: 'Another key with other data is another screen. Whatever you can do to a list, you can do to the back stack.' },
            ],
          });
        },
        code: `@Serializable object Today : NavKey
@Serializable data class History(val goal: Int) : NavKey

@Composable
fun WaterApp() {
    val backStack = rememberNavBackStack(Today)        // a list of keys, starting with Today

    NavDisplay(
        backStack = backStack,
        onBack = { backStack.removeLastOrNull() },      // the Back gesture removes the last key
        entryDecorators = listOf(
            rememberSaveableStateHolderNavEntryDecorator(),
            rememberViewModelStoreNavEntryDecorator(),  // each screen gets its own ViewModels
        ),
        entryProvider = entryProvider {
            entry<Today> {
                WaterScreen(onOpenHistory = { goal -> backStack.add(History(goal)) })
            }
            entry<History> { key ->
                HistoryScreen(goal = key.goal, onBack = { backStack.removeLastOrNull() })
            }
        },
    )
}

// app/build.gradle.kts (versions from the release pages), plus the Kotlin
// serialization plugin, as for Navigation Compose:
// dependencies {
//     implementation("androidx.navigation3:navigation3-runtime:1.2.0")
//     implementation("androidx.navigation3:navigation3-ui:1.2.0")
//     implementation("androidx.lifecycle:lifecycle-viewmodel-navigation3:2.11.0")
// }`,
        remember: 'Navigation 3: the back stack is your list. add() goes forward, removeLastOrNull() goes back, NavDisplay shows the last key.',
        mistakes: [
          { title: 'A plain list as the back stack', bad: `val backStack = mutableListOf<NavKey>(Today)
NavDisplay(backStack = backStack, entryProvider = entryProvider { /* ... */ })`, good: `val backStack = rememberNavBackStack(Today)
NavDisplay(backStack = backStack, entryProvider = entryProvider { /* ... */ })`, why: 'A plain list isn’t state, so Compose never hears about <code>add</code>, and it is made again on every run. <code>rememberNavBackStack</code> gives a remembered, saved list that Compose watches.' },
        ],
        terms: [
          { term: 'NavKey', def: 'An interface with nothing to implement that marks a Navigation 3 key. With <code>@Serializable</code>, the key can be saved.' },
          { term: 'rememberNavBackStack', def: 'Makes the back stack: a list of keys that is state and survives rotation and the app being stopped.' },
          { term: 'NavDisplay', def: 'Shows the screen for the last key in the back stack, and runs <code>onBack</code> on the Back gesture.' },
          { term: 'entryProvider', def: 'Turns each key into its screen. Inside it, <code>entry&lt;Key&gt; { key -> }</code> says what to show for that key type.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the back stack, go back with the Back gesture, and turn keys into screens.', code: `val backStack = [[rememberNavBackStack]](Today)
NavDisplay(
    backStack = backStack,
    onBack = { backStack.[[removeLastOrNull]]() },
    entryProvider = [[entryProvider]] {
        entry<Today> { WaterScreen(onOpenHistory = { goal -> backStack.add(History(goal)) }) }
        entry<History> { key -> HistoryScreen(goal = key.goal) }
    },
)`, why: 'The list is the back stack. Removing its last key goes back, and <code>entryProvider</code> says what each key shows.' },
          { type: 'bug', prompt: 'Tapping History does nothing. Tap the wrong line.', code: `entry<Today> {
    WaterScreen(onOpenHistory = { goal -> History(goal) })
}`, bug: 1, fix: '    WaterScreen(onOpenHistory = { goal -> backStack.add(History(goal)) })', why: '<code>History(goal)</code> only makes a key and throws it away. Navigation happens when the key is added to the back stack.' },
        ],
        quiz: [
          { q: 'How do you open History in Navigation 3?', options: ['<code>backStack.add(History(goal = 8))</code>', '<code>navController.navigate(History(goal = 8))</code>', '<code>NavDisplay(History(goal = 8))</code>'], a: 0, why: 'There is no controller. You change the list, and <code>NavDisplay</code> follows.' },
          { q: 'Why must keys for <code>rememberNavBackStack</code> be <code>@Serializable</code> and implement <code>NavKey</code>?', options: ['So the list can be saved and restored after rotation or the app being stopped', 'So they can be compared with <code>==</code>', 'So <code>NavDisplay</code> can draw them'], a: 0, why: 'Saving the back stack means storing every key in it.' },
          { q: 'In <code>entry&lt;History&gt; { key -> }</code>, how do you read the goal?', options: ['<code>key.goal</code>', '<code>key.toRoute()</code>', '<code>backStack.goal</code>'], a: 0, why: 'The entry hands you the key itself, with its data.' },
        ],
        docs: [['Navigation 3', 'https://developer.android.com/guide/navigation/navigation-3'], ['Navigation 3 basics', 'https://developer.android.com/guide/navigation/navigation-3/basics']],
      },
    ],
  });
})();
