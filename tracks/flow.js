/* Flow track. Same shape as tracks/kotlin.js.
   Lessons (assembled from rb/flow/chunk_*.js) use the shared Lab.ui demos only. */
(() => {
  Lab.addTrack({
    id: 'flow',
    title: 'Flow',
    description: 'How Flow streams values to your UI, from cold flows and operators to flows of flows, errors, fast producers, hot flows, sharing, lifecycle-aware collection and wrapping callbacks.',
    group: 'Building apps', requires: ['coroutines'],
    lessons: [
      {
        id: 'cold',
        title: 'A stream of values',
        tagline: 'A flow hands out values one by one, and does nothing until someone collects it.',
        goals: ['Build a flow with <code>flow { }</code> and <code>emit</code>', 'Get its values one by one with <code>collect</code>', 'Explain why a flow is cold: each <code>collect</code> runs it from the top'],
        level: 'beginner', introduces: ['Flow', 'flow', 'emit'],
        body: `
<p>A list gives you all its values at once. Other values arrive over time: each sip from a water bottle with a sensor, the temperature every minute, a countdown. In the History screen you already met one: <code>snapshotFlow</code> handed out a new index each time the user scrolled. That was a <em>flow</em>, a stream of values that arrive one by one. Now you build your own.</p>
<p><code>flow { ... }</code> makes one. Inside the braces, <code>emit(3)</code> hands out one value, here 3. The block runs inside the coroutine that collects it, so it can call suspend functions like <code>delay</code> between values. A flow of Ints has the type <code>Flow&lt;Int&gt;</code>, read “flow of Int”, like <code>List&lt;Int&gt;</code>. The flow tools live in their own package, so programs add <code>import kotlinx.coroutines.flow.*</code> below <code>import kotlinx.coroutines.*</code>.</p>
<p>Making a flow runs nothing. It is a recipe: writing a recipe down cooks nothing. <code>collect { }</code> is what runs it. The block starts at the top, and each <code>emit</code> hands its value to the lambda of <code>collect</code>. <code>collect</code> is a suspend function, so it runs inside a coroutine, and it returns when the block reaches its end.</p>
<p>Call <code>collect</code> on the same flow again, and the block runs again from the top, just for that collector. A flow that does nothing until it is collected, and starts over for every collector, is called <em>cold</em>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'val glasses = flow {\n    println("Counting starts")\n    for (i in 1..3) {\n        delay(1000)\n        emit(i)\n    }\n}\n\nfun main() = runBlocking {\n    println("Flow made")\n    glasses.collect { println("A got $it") }\n    glasses.collect { println("B got $it") }\n}',
            predict: {
              q: 'Which line does this program print first?',
              options: ['<code>Flow made</code>', '<code>Counting starts</code>'],
              a: 0,
              why: 'Making the flow runs none of its block. The block starts only when <code>collect</code> is called, and by then <code>main</code> has printed “Flow made”.',
            },
            frames: [
              { line: 1, say: 'The flow is made. Its block doesn’t run: nothing is printed.' },
              { line: 10, out: 'Flow made', say: '<code>main</code> starts. The first line comes from <code>main</code>, not from the flow.' },
              { line: [11, 2], out: 'Counting starts', say: 'The first <code>collect</code> starts the flow. Now its block runs, from the top.' },
              { line: [4, 5, 11], out: 'A got 1', say: 'After a one-second <code>delay</code>, <code>emit(1)</code> hands 1 to the lambda of <code>collect</code>.' },
              { line: 11, out: 'A got 2\nA got 3', say: 'Two more seconds, two more values. Then the loop ends, the block ends, and <code>collect</code> returns.' },
              { line: [12, 2], out: 'Counting starts', say: 'The second <code>collect</code> runs the block again, from the top, just for B.' },
              { line: 12, out: 'B got 1\nB got 2\nB got 3', say: 'B gets its own 1, 2 and 3. Two collects, two runs: the flow is cold.' },
            ],
          });
        },
        code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun countdown(from: Int): Flow<Int> = flow {
    for (i in from downTo 1) {
        emit(i)
        delay(1000)
    }
}

fun main() = runBlocking {
    val timer = countdown(3)          // nothing runs yet
    timer.collect { println(it) }     // 3, 2, 1, one per second
    println("Go!")                    // after the flow has ended
}`,
        play: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

val glasses = flow {
    println("Counting starts")
    for (i in 1..3) {
        delay(1000)
        emit(i)
    }
}

fun main() = runBlocking {
    println("Flow made")
    glasses.collect { println("A got $it") }
    glasses.collect { println("B got $it") }
    // Delete both collect lines and run again. What is still printed?
}`,
        remember: 'flow { emit(x) } is a recipe; collect runs it from the top, again for every collector.',
        mistakes: [
          { title: 'Making a flow and never collecting it', bad: 'val timer = countdown(3)   // nothing happens\nprintln("Go!")', good: 'countdown(3).collect { println(it) }   // 3, 2, 1\nprintln("Go!")', why: 'Calling <code>countdown(3)</code> only makes the recipe. A flow runs when it is collected.' },
        ],
        terms: [
          { term: 'Flow<Int>', def: 'A stream of Ints that arrive one by one over time. Read “flow of Int”.' },
          { term: 'flow { }', def: 'Makes a flow. Its block runs only when someone collects the flow.' },
          { term: 'emit', def: '<code>emit(value)</code> hands one value from the flow’s block to the collector.' },
          { term: 'cold', def: 'A cold flow does nothing until it is collected, and runs again from the top for each collector.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a flow that hands out 1, 2 and 3, then print each value.', code: 'val numbers = [[flow]] {\n    for (i in 1..3) {\n        [[emit]](i)\n    }\n}\nnumbers.[[collect]] { println(it) }', why: '<code>flow { }</code> makes the recipe, <code>emit</code> hands out each value, <code>collect</code> runs it.' },
          { type: 'bug', prompt: 'This should print 3, 2 and 1, then “Go!”, but it only prints “Go!”. Tap the wrong line.', code: 'fun main() = runBlocking {\n    val timer = countdown(3)\n    println("Go!")\n}', bug: 1, fix: '    countdown(3).collect { println(it) }', why: '<code>countdown(3)</code> only makes the flow. Nothing in it runs until something calls <code>collect</code>.' },
        ],
        quiz: [
          { q: 'A flow’s block starts with <code>println("hi")</code>. The program makes the flow but never calls <code>collect</code>. What is printed?', options: ['Nothing', '<code>hi</code>', '<code>hi</code>, then the values'], a: 0, why: 'The block runs only when the flow is collected.' },
          { q: 'The <code>glasses</code> flow above is collected twice. How many times is “Counting starts” printed?', options: ['Once', 'Twice'], a: 1, why: 'A cold flow runs its block again from the top for every <code>collect</code>.' },
          { q: 'When does <code>glasses.collect { ... }</code> return?', options: ['Right away', 'After the first value', 'When the flow’s block reaches its end'], a: 2, why: '<code>collect</code> waits for every value, and returns once the block has finished.' },
        ],
        docs: [['Kotlin docs: Cold flows', 'https://kotlinlang.org/docs/coroutines-flow.html#cold-flows'], ['Kotlin flows on Android', 'https://developer.android.com/kotlin/flow']],
      },

      {
        id: 'operators',
        title: 'Transforming flows',
        tagline: 'map, filter and onEach work on each value as it arrives.',
        goals: ['Change each value of a flow with <code>map</code>', 'Drop values with <code>filter</code>', 'Do something with each value on the way with <code>onEach</code>'],
        level: 'beginner', introduces: ['onEach'],
        body: `
<p>The water tracker gets each drink from a flow, in millilitres (ml). The screen should only celebrate full glasses, 200 ml or more, and show them as text. You already know <code>filter</code> and <code>map</code> on lists. Flows have them too.</p>
<p><code>drinks.filter { it &gt;= 200 }</code> gives a new flow that lets a value through only when the lambda gives <code>true</code>. <code>.map { "$it ml" }</code> gives a new flow where every value is changed by the lambda. <code>.onEach { println(it) }</code> does something with each value and passes it on unchanged, which is handy for printing what goes by. Each of these is an <em>operator</em>: it takes a flow and gives back a new flow. You can write one per line, each line starting with a dot.</p>
<p>A list already has all its values, so <code>map</code> on a list does all of them at once. A flow’s values don’t exist yet. So each value goes through the whole chain on its own, as it arrives, and reaches <code>collect</code> before the next one is even made. And operators alone run nothing: the chain is still a cold recipe until <code>collect</code> at the end.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'src', label: 'drinks', sub: 'flow { }' },
              { id: 'each', label: 'onEach', sub: 'println' },
              { id: 'filter', label: 'filter', sub: 'it >= 200' },
              { id: 'map', label: 'map', sub: 'to text' },
              { id: 'out', label: 'collect', sub: 'println' },
            ],
            predict: {
              q: 'The second drink is 100 ml. How far does it get?',
              options: ['It stops at <code>filter</code>', 'It reaches <code>collect</code> as text', 'It never enters the chain'],
              a: 0,
              why: '<code>onEach</code> sees every value, but <code>100 &gt;= 200</code> is false, so <code>filter</code> drops it.',
            },
            frames: [
              { at: 'src', packet: '250', say: '<code>emit(250)</code>: the first drink enters the chain.' },
              { at: 'each', say: '<code>onEach</code> prints “Drink: 250 ml” and passes 250 on, unchanged.' },
              { at: 'filter', tone: 'ok', say: '<code>250 &gt;= 200</code> is true, so <code>filter</code> lets it through.' },
              { at: 'map', packet: 'text', say: '<code>map</code> turns 250 into the text “A full glass (250 ml)”.' },
              { at: 'out', say: '<code>collect</code> prints it. Only now does the flow go on and make the next drink.' },
              { at: 'each', packet: '100', say: 'The next drink, 100. <code>onEach</code> prints it too: it sees every value.' },
              { at: 'filter', tone: 'err', say: '<code>100 &gt;= 200</code> is false. <code>filter</code> drops it, so <code>map</code> and <code>collect</code> never see it.' },
              { at: 'out', packet: 'text', tone: 'ok', say: 'The third drink, 300, goes all the way through and is printed as “A full glass (300 ml)”.' },
            ],
          });
        },
        code: `val drinks = flow {
    emit(250)
    delay(500)
    emit(100)
    delay(500)
    emit(300)
}

fun main() = runBlocking {
    drinks
        .onEach { println("Drink: $it ml") }
        .filter { it >= 200 }
        .map { "A full glass ($it ml)" }
        .collect { println(it) }
}
// Drink: 250 ml
// A full glass (250 ml)
// Drink: 100 ml
// Drink: 300 ml
// A full glass (300 ml)`,
        play: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

val temps = flow {
    for (t in listOf(12, 25, 18, 31)) {
        delay(300)
        emit(t)
    }
}

fun main() = runBlocking {
    temps
        .onEach { println("Measured $it") }
        .filter { it > 20 }                 // change 20 to 10 and run again
        .map { "Warm: $it degrees" }
        .collect { println(it) }
}`,
        remember: 'map changes, filter drops, onEach looks; each value goes through the whole chain on its own, and only when you collect.',
        mistakes: [
          { title: 'Expecting onEach to run the flow', bad: 'drinks.onEach { println(it) }   // prints nothing', good: 'drinks.onEach { println(it) }.collect { }   // prints every drink', why: '<code>onEach</code> only gives back a new flow. Like any flow, it runs when it is collected. <code>collect { }</code> with an empty lambda runs it and does nothing more with the values.' },
        ],
        terms: [
          { term: 'operator', def: 'A function like <code>map</code> or <code>filter</code> that takes a flow and gives back a new flow.' },
          { term: 'onEach', def: 'Runs a lambda for each value and passes the value on unchanged.' },
          { term: 'ml', def: 'Millilitres: 1,000 ml is one litre. A glass is about 200 to 250 ml.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep only drinks of 200 ml or more, and print them as text.', code: 'drinks\n    .[[filter]] { it >= 200 }\n    .[[map]] { "$it ml" }\n    .[[collect]] { println(it) }', why: '<code>filter</code> drops the small drinks, <code>map</code> makes text, <code>collect</code> runs the chain.' },
          { type: 'bug', prompt: 'This should print only the big drinks, but it prints all of them. Tap the wrong line.', code: 'drinks\n    .onEach { it >= 200 }\n    .collect { println(it) }', bug: 1, fix: '    .filter { it >= 200 }', why: '<code>onEach</code> passes every value on; the result of its lambda is ignored. <code>filter</code> is the one that drops values.' },
        ],
        quiz: [
          { q: 'A flow emits 1, 2 and 3. What does <code>.map { it * 10 }</code> hand to <code>collect</code>?', options: ['10, 20 and 30', '60', '1, 2 and 3'], a: 0, why: '<code>map</code> changes each value on its own, as it arrives.' },
          { q: '<code>.onEach { println(it) }</code> comes before <code>.filter { it &gt; 5 }</code>. Is the value 3 printed?', options: ['Yes', 'No'], a: 0, why: '<code>onEach</code> is above <code>filter</code> in the chain, so it sees 3 before <code>filter</code> drops it.' },
          { q: 'With <code>map</code> and <code>filter</code> and no <code>collect</code>, what runs?', options: ['Nothing', 'The flow, but nothing is printed', 'Only <code>map</code>'], a: 0, why: 'Operators make a new recipe. Nothing runs until <code>collect</code>.' },
        ],
        docs: [['Kotlin docs: Intermediate flow operators', 'https://kotlinlang.org/docs/coroutines-flow.html#intermediate-flow-operators'], ['API: onEach', 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-each.html']],
      },

      {
        id: 'flatmap',
        title: 'Flows of flows',
        tagline: 'When each value starts a flow of its own, flatMapLatest keeps only the newest.',
        goals: ['Start a flow for each value with <code>flatMapLatest</code>', 'Explain why it cancels the old inner flow', 'Choose <code>flatMapConcat</code> or <code>flatMapMerge</code> when old work must go on'],
        level: 'beginner', introduces: ['flatMapLatest', 'flatMapConcat', 'flatMapMerge', 'ExperimentalCoroutinesApi'],
        body: `
<p>The water tracker gets a search box for drinks. Each letter the user types starts a search, and a search takes a moment. Type “tea” quickly and three searches start: for “t”, “te” and “tea”. Only the answer for “tea” matters. An old, slow answer must never arrive last and replace it.</p>
<p>Here each value of one flow, the typed text, starts another flow, the search. <code>map</code> can’t help: it would give a flow of flows, <code>Flow&lt;Flow&lt;String&gt;&gt;</code>, and nothing would collect the inner ones. <code>flatMapLatest { text -&gt; search(text) }</code> collects the inner flow for you and passes its values on, as one flat flow. When a new value arrives, it cancels the inner flow still running for the old one, the same cancelling you know from coroutines.</p>
<p>Two relatives choose differently. <code>flatMapConcat</code> waits its turn: it runs the inner flows one after another, in order, each to its end. <code>flatMapMerge</code> runs them all at the same time and passes values on as they come. All three are marked experimental, so Kotlin warns unless the code that uses them adds <code>@OptIn(ExperimentalCoroutinesApi::class)</code>, like the <code>@OptIn</code> you wrote for the top bar.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['typed', 'search “t”', 'search “te”', 'search “tea”', 'collect'],
            span: 600,
            predict: {
              q: 'The user types “t”, “te” and “tea”, 100 ms apart. Each search takes 300 ms. With <code>flatMapLatest</code>, what does <code>collect</code> get?',
              options: ['Only “Results for tea”', 'Results for t, te and tea, in order', 'Nothing: every search is cancelled'],
              a: 0,
              why: 'Each new text cancels the search still running for the old one. Only the last search runs to its end.',
            },
            frames: [
              { now: 0, say: 'Three texts will arrive, 100 ms apart. Each one starts a search that needs 300 ms.' },
              { bars: [{ lane: 0, from: 0, to: 40, label: 't' }, { lane: 1, from: 0, to: 100, label: '', tone: 'warm' }], now: 100, say: '“t” arrives. <code>flatMapLatest</code> starts <code>search("t")</code> and collects it.' },
              { bars: [{ lane: 0, from: 100, to: 140, label: 'te' }, { lane: 2, from: 100, to: 200, label: '', tone: 'warm' }], marks: [{ at: 100, label: '✕ t' }], now: 200, say: '“te” arrives while the search for “t” is still running. It is cancelled, and <code>search("te")</code> starts.' },
              { bars: [{ lane: 0, from: 200, to: 240, label: 'tea' }, { lane: 3, from: 200, to: 500, label: 'running', tone: 'warm' }], marks: [{ at: 200, label: '✕ te' }], now: 500, say: '“tea” arrives: the search for “te” is cancelled too. Nothing new is typed, so <code>search("tea")</code> runs to its end.' },
              { bars: [{ lane: 4, from: 500, to: 600, label: 'tea', tone: 'ok' }], now: 600, say: 'It emits “Results for tea”, the only value <code>collect</code> gets. Three searches started, one finished.' },
              { now: 600, say: 'With <code>flatMapConcat</code> all three would finish, one after another, until 900 ms. With <code>flatMapMerge</code> all three would run at once. Either way, old answers arrive too.' },
            ],
          });
        },
        code: `fun search(text: String): Flow<String> = flow {
    delay(300)                          // a slow search
    emit("Results for $text")
}

val typed = flow {
    emit("t")
    delay(100)
    emit("te")
    delay(100)
    emit("tea")
}

@OptIn(ExperimentalCoroutinesApi::class)
fun main() = runBlocking {
    typed
        .flatMapLatest { text -> search(text) }
        .collect { println(it) }        // Results for tea

    typed
        .flatMapConcat { text -> search(text) }
        .collect { println(it) }        // Results for t, then te, then tea
}`,
        play: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun search(text: String): Flow<String> = flow {
    println("Searching for $text...")
    delay(300)
    emit("Results for $text")
}

val typed = flow {
    emit("t")
    delay(100)
    emit("te")
    delay(100)
    emit("tea")
}

@OptIn(ExperimentalCoroutinesApi::class)
fun main() = runBlocking {
    typed
        .flatMapLatest { text -> search(text) }   // try flatMapConcat, then flatMapMerge
        .collect { println(it) }
}`,
        remember: 'flatMapLatest cancels the old inner flow, flatMapConcat waits its turn, flatMapMerge runs them all at once.',
        mistakes: [
          { title: 'Using map when each value gives a flow', bad: 'typed\n    .map { text -> search(text) }\n    .collect { println(it) }   // prints the flows themselves, no results', good: 'typed\n    .flatMapLatest { text -> search(text) }\n    .collect { println(it) }   // Results for tea', why: '<code>map</code> hands on each inner flow without running it. A flatMap operator collects the inner flows for you.' },
        ],
        terms: [
          { term: 'inner flow', def: 'The flow that each value starts, like <code>search(text)</code> for each typed text.' },
          { term: 'flatMapLatest', def: 'Starts an inner flow for each value, and cancels the previous one when a new value arrives.' },
          { term: 'flatMapConcat', def: 'Runs the inner flows one after another, in order, each to its end.' },
          { term: 'flatMapMerge', def: 'Runs the inner flows at the same time and passes values on as they arrive.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Search for the newest text only.', code: '@[[OptIn]](ExperimentalCoroutinesApi::class)\nval results = typed.[[flatMapLatest]] { text -> search(text) }', why: '<code>flatMapLatest</code> needs the opt-in, and cancels the search for older text.' },
          { type: 'bug', prompt: 'Sometimes the screen shows results for older text. Tap the wrong line.', code: 'typed\n    .flatMapMerge { text -> search(text) }\n    .collect { println(it) }', bug: 1, fix: '    .flatMapLatest { text -> search(text) }', why: '<code>flatMapMerge</code> keeps old searches running. If an old one is slower, its answer arrives last and replaces the newer one.' },
        ],
        quiz: [
          { q: 'With <code>flatMapLatest</code>, a new value arrives while the inner flow for the old one is still running. What happens to it?', options: ['It is cancelled', 'It finishes first', 'It runs alongside the new one'], a: 0, why: 'A new value cancels the inner flow still running for the previous one.' },
          { q: 'Photos must upload one at a time, in order, and every upload must finish. Which operator fits?', options: ['<code>flatMapConcat</code>', '<code>flatMapLatest</code>', '<code>flatMapMerge</code>'], a: 0, why: '<code>flatMapConcat</code> starts the next inner flow only after the previous one has ended.' },
          { q: 'What does <code>map { text -&gt; search(text) }</code> give, when <code>search</code> returns a flow?', options: ['A flow of flows', 'A flow of results', 'A list'], a: 0, why: '<code>map</code> only wraps each value; it doesn’t collect the flows it makes.' },
        ],
        docs: [['API: flatMapLatest', 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flat-map-latest.html'], ['API: flatMapConcat', 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flat-map-concat.html']],
      },

      {
        id: 'errors-retry',
        title: 'Errors and retries',
        tagline: 'retry tries again; catch turns a failure into a value.',
        goals: ['Turn an exception in a flow into a value with <code>catch</code>', 'Try a failing flow again with <code>retry</code>', 'Put <code>retry</code> and <code>catch</code> in the right order'],
        level: 'beginner', introduces: ['retry'],
        body: `
<p>The water tracker loads today’s glasses from a server. Phones lose the network on a train or underground, so sometimes the loading fails with an exception. Without care, the exception travels down the chain to <code>collect</code>, and the program crashes like with any exception nobody catches.</p>
<p><code>.catch { e -&gt; ... }</code> handles an exception thrown anywhere above it in the chain. <code>e</code> is the exception, as in <code>try</code>/<code>catch</code>. Inside, you can <code>emit</code> a value to show instead, such as “Could not load”, and then the flow ends normally. <code>catch</code> only sees errors from above it: an error in an operator below it, or inside <code>collect</code>, goes straight past.</p>
<p>Often the network is back a moment later. <code>.retry(2)</code> runs the flow above it again, from the top, when it fails, up to 2 more times. Only if the last try fails too does the exception go on down. So put <code>retry</code> first and <code>catch</code> after it: try again, and if nothing works, show the fallback. Leave out the number, <code>retry()</code>, and it tries again forever.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['try 1', 'try 2', 'try 3', 'collect'],
            span: 700,
            predict: {
              q: 'The network fails twice, then works. With <code>.retry(2)</code> and then <code>.catch</code>, what does <code>collect</code> get?',
              options: ['“5 glasses today”', '“Could not load: No network”', 'Nothing: the program crashes'],
              a: 0,
              why: '<code>retry(2)</code> allows two more tries after the first. The third one works, so <code>catch</code> has nothing to do.',
            },
            frames: [
              { now: 0, say: 'The flow loads from the server, which takes 200 ms. The chain is <code>.retry(2)</code>, then <code>.catch</code>, then <code>collect</code>. The network will fail twice.' },
              { bars: [{ lane: 0, from: 0, to: 200, label: 'loading' }], marks: [{ at: 200, label: '✕' }], now: 200, say: 'Try 1 throws “No network”. The exception travels down and reaches <code>retry</code> first. It has 2 tries left.' },
              { bars: [{ lane: 1, from: 200, to: 400, label: 'loading' }], marks: [{ at: 400, label: '✕' }], now: 400, say: '<code>retry</code> runs the flow again from the top. It fails again: 1 try left.' },
              { bars: [{ lane: 2, from: 400, to: 600, label: 'loading', tone: 'ok' }], now: 600, say: 'The third try works and emits “5 glasses today”.' },
              { bars: [{ lane: 3, from: 600, to: 700, label: '5 glasses', tone: 'ok' }], now: 700, say: 'The value passes <code>retry</code> and <code>catch</code> unchanged and reaches <code>collect</code>. <code>catch</code> never ran: no exception was left.' },
              { now: 700, say: 'With <code>retry(1)</code>, try 2 would be the last. Its exception would reach <code>catch</code>, and <code>collect</code> would get “Could not load: No network” instead.' },
            ],
          });
        },
        code: `var tries = 0

val glassesFromServer = flow {
    delay(200)                           // pretend the server takes 200 ms
    tries++
    if (tries < 3) {
        throw Exception("No network")    // the first two tries fail
    }
    emit("5 glasses today")
}

fun main() = runBlocking {
    glassesFromServer
        .retry(2)                                               // up to 2 more tries
        .catch { e -> emit("Could not load: \${e.message}") }   // if they all fail
        .collect { println(it) }                                // 5 glasses today
}`,
        play: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

var tries = 0

val glassesFromServer = flow {
    delay(200)                   // pretend the server takes 200 ms
    tries++
    println("Try $tries")
    if (tries < 3) {
        throw Exception("No network")
    }
    emit("5 glasses today")
}

fun main() = runBlocking {
    glassesFromServer
        .retry(2)                // change to retry(1) and run again
        .catch { e -> emit("Could not load: \${e.message}") }
        .collect { println(it) }
}`,
        remember: 'retry first, catch after it: try again, then show a fallback. catch only sees errors from above it.',
        mistakes: [
          { title: 'catch above retry', bad: 'glassesFromServer\n    .catch { e -> emit("Could not load") }\n    .retry(2)\n    .collect { println(it) }   // Could not load, after one try', good: 'glassesFromServer\n    .retry(2)\n    .catch { e -> emit("Could not load") }\n    .collect { println(it) }   // 5 glasses today', why: 'An exception travels down the chain. When <code>catch</code> comes first, it turns the error into a value, so <code>retry</code> never sees a failure and never tries again.' },
        ],
        terms: [
          { term: 'catch { } (on a flow)', def: 'An operator that handles an exception thrown above it in the chain, and can <code>emit</code> a value instead.' },
          { term: 'retry(n)', def: 'When the flow above it fails, runs it again from the top, up to <code>n</code> more times.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Try up to 3 more times, then show a fallback text.', code: 'glassesFromServer\n    .[[retry]](3)\n    .[[catch]] { e -> [[emit]]("Could not load") }\n    .collect { println(it) }', why: '<code>retry</code> tries again; whatever still fails reaches <code>catch</code>, which emits the fallback.' },
          { type: 'bug', prompt: 'Without network, this program never ends: it tries again and again. Tap the wrong line.', code: 'glassesFromServer\n    .retry()\n    .catch { e -> emit("Could not load") }\n    .collect { println(it) }', bug: 1, fix: '    .retry(2)', why: '<code>retry()</code> with no number tries forever, so <code>catch</code> is never reached. Give it a limit.' },
        ],
        quiz: [
          { q: 'The chain is <code>.retry(2)</code> then <code>.catch</code>, and the server fails every time. How many tries are made in all?', options: ['3', '2', '1'], a: 0, why: 'The first try, plus 2 more. Then the exception reaches <code>catch</code>.' },
          { q: 'An exception is thrown inside <code>collect { }</code>. Does a <code>.catch</code> earlier in the chain handle it?', options: ['No', 'Yes'], a: 0, why: '<code>catch</code> only sees errors from above it. <code>collect</code> is below it.' },
          { q: 'What does <code>catch</code> do after it has emitted its fallback value?', options: ['The flow ends normally', 'The flow starts again', 'The program crashes'], a: 0, why: 'The exception is handled, so the flow simply ends, and <code>collect</code> returns.' },
        ],
        docs: [['Kotlin docs: Handle exceptions in flows', 'https://kotlinlang.org/docs/coroutines-flow.html#handle-exceptions-in-flows'], ['API: retry', 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/retry.html']],
      },

      {
        id: 'backpressure',
        title: 'Fast producers',
        tagline: 'When values come faster than you can handle them: buffer, conflate or collectLatest.',
        goals: ['Explain why a slow collector slows the flow down', 'Keep every value with <code>buffer</code>, or only the newest with <code>conflate</code>', 'Cancel old work with <code>collectLatest</code>'],
        level: 'beginner', introduces: ['buffer', 'conflate', 'collectLatest'],
        body: `
<p>The water bottle’s sensor reports a sip every 100 ms, but drawing the chart for one takes 250 ms. The side that makes values, the <em>producer</em>, is faster than the side that handles them, the <em>collector</em>. What happens to the extra values?</p>
<p>By default the two take turns. <code>emit</code> hands the value to <code>collect</code> and waits until its lambda has finished. Nothing is lost, but the producer is slowed down to the collector’s speed.</p>
<p>Three operators change that. <code>.buffer()</code> lets the producer run ahead: values wait in a queue, the <em>buffer</em>, and every one is handled, in order. <code>.conflate()</code> keeps only the newest waiting value: when the collector is free it gets the latest, and the ones in between are dropped. <code>.collectLatest { }</code> is used in place of <code>collect</code>: a new value cancels the lambda still working on the old one, and starts it again with the new value.</p>
<p>Pick by what matters. Every value must be handled, like saving each sip: <code>buffer</code>. Only the newest value matters, but each job should finish: <code>conflate</code>. Only the newest matters and old work is useless, like drawing a chart that is already out of date: <code>collectLatest</code>.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['plain', 'buffer', '<span style="font-size:0.85em">conflate</span>', 'latest'],
            span: 1800,
            predict: {
              q: 'Values 1 to 5 are made every 100 ms, and handling one takes 250 ms. With <code>conflate()</code>, which values are handled?',
              options: ['1, 3 and 5', 'All five, in order', 'Only 5'],
              a: 0,
              why: 'While the collector is busy, <code>conflate</code> keeps only the newest waiting value: 3 replaces 2, and later 5 replaces 4.',
            },
            frames: [
              { now: 0, say: 'The producer can make a value every 100 ms. Handling one takes 250 ms. Each lane shows when the collector handles which value: plain <code>collect</code>, <code>buffer()</code>, <code>conflate()</code> and <code>collectLatest</code>.' },
              { bars: [{ lane: 0, from: 100, to: 350, label: '1' }, { lane: 0, from: 450, to: 700, label: '2' }, { lane: 0, from: 800, to: 1050, label: '3' }, { lane: 0, from: 1150, to: 1400, label: '4' }, { lane: 0, from: 1500, to: 1750, label: '5' }], now: 1750, say: 'Plain <code>collect</code>: they take turns. <code>emit</code> waits 250 ms each time, so every next value is made late. All five are handled, done at 1750 ms.' },
              { bars: [{ lane: 1, from: 100, to: 350, label: '1' }, { lane: 1, from: 350, to: 600, label: '2' }, { lane: 1, from: 600, to: 850, label: '3' }, { lane: 1, from: 850, to: 1100, label: '4' }, { lane: 1, from: 1100, to: 1350, label: '5' }], now: 1350, say: '<code>buffer()</code>: the producer runs ahead and values wait in the queue. All five are handled back to back, done at 1350 ms.' },
              { bars: [{ lane: 2, from: 100, to: 350, label: '1' }, { lane: 2, from: 350, to: 600, label: '3' }, { lane: 2, from: 600, to: 850, label: '5' }], now: 850, say: '<code>conflate()</code>: while 1 is handled, 2 and 3 arrive, and only the newest, 3, is kept. Then 5. Values 2 and 4 are dropped.' },
              { bars: [{ lane: 3, from: 100, to: 200, label: '1', tone: 'muted' }, { lane: 3, from: 200, to: 300, label: '2', tone: 'muted' }, { lane: 3, from: 300, to: 400, label: '3', tone: 'muted' }, { lane: 3, from: 400, to: 500, label: '4', tone: 'muted' }, { lane: 3, from: 500, to: 750, label: '5', tone: 'ok' }], now: 750, say: '<code>collectLatest</code>: every new value cancels the work on the old one, 100 ms in. Only 5 is handled to the end, at 750 ms.' },
              { now: 1800, say: 'Every value: <code>buffer</code>. The newest, but let each job finish: <code>conflate</code>. Only the newest, and old work is useless: <code>collectLatest</code>.' },
            ],
          });
        },
        code: `val sips = flow {
    for (i in 1..5) {
        delay(100)               // a new value every 100 ms
        emit(i)
    }
}

fun main() = runBlocking {
    sips.buffer()
        .collect {
            delay(250)           // slow handling
            println(it)          // 1, 2, 3, 4, 5
        }
    sips.conflate()
        .collect {
            delay(250)
            println(it)          // 1, 3, 5
        }
    sips.collectLatest {
        delay(250)
        println(it)              // 5
    }
}`,
        play: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

val sips = flow {
    for (i in 1..5) {
        delay(100)
        println("Made $i")
        emit(i)
    }
}

fun main() = runBlocking {
    sips
        .conflate()              // try .buffer(), or delete this line
        .collect {
            delay(250)
            println("Showed $it")
        }
}`,
        remember: 'buffer keeps every value, conflate keeps the newest, collectLatest cancels the old work.',
        mistakes: [
          { title: 'conflate where every value counts', bad: 'sips\n    .conflate()\n    .collect { save(it) }   // some sips are never saved', good: 'sips\n    .buffer()\n    .collect { save(it) }   // every sip is saved', why: '<code>conflate</code> keeps only the newest value that arrived while the collector was busy and drops the rest. When each value must be handled, use <code>buffer</code>.' },
        ],
        terms: [
          { term: 'producer and collector', def: 'The producer is the side that makes values (the flow’s block). The collector is the side that handles them (<code>collect</code>).' },
          { term: 'buffer', def: 'A queue between producer and collector. <code>buffer()</code> lets the producer run ahead; every value is still handled.' },
          { term: 'conflate', def: 'Keeps only the newest value while the collector is busy; the ones in between are dropped.' },
          { term: 'collectLatest', def: 'Like <code>collect</code>, but a new value cancels the lambda still working on the old one.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Draw only the newest chart, and save every sip.', code: 'sips.[[collectLatest]] { sip ->\n    drawChart(sip)\n}\nsips.[[buffer]]().collect { save(it) }', why: '<code>collectLatest</code> cancels a drawing that is already out of date. <code>buffer</code> lets values queue up, so none are lost.' },
          { type: 'bug', prompt: 'Every sip must be saved, but some go missing. Tap the wrong line.', code: 'sips\n    .conflate()\n    .collect { save(it) }', bug: 1, fix: '    .buffer()', why: '<code>conflate</code> drops values while <code>save</code> is busy. <code>buffer</code> keeps them all.' },
        ],
        quiz: [
          { q: 'No operator. The producer is faster than the collector. What does the producer do?', options: ['Waits in <code>emit</code> until the collector is done', 'Keeps going at full speed', 'Drops values'], a: 0, why: 'By default they take turns: <code>emit</code> returns only when the collector’s lambda has finished.' },
          { q: 'With <code>collectLatest</code>, value 2 arrives while the lambda is still handling 1. What happens?', options: ['The work on 1 is cancelled, and the lambda starts with 2', '2 waits until 1 is done', '2 is dropped'], a: 0, why: 'A new value cancels the old work and starts the lambda again.' },
          { q: 'With <code>buffer()</code>, how many values are lost?', options: ['None', 'All but the newest', 'Half'], a: 0, why: 'The values wait in the queue and every one is handled, in order.' },
        ],
        docs: [['API: buffer', 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/buffer.html'], ['API: collectLatest', 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect-latest.html']],
      },

      {
        id: 'hot',
        title: 'Hot flows',
        tagline: 'A StateFlow holds the current value; a SharedFlow announces events to whoever is listening.',
        goals: ['Hold a value that screens can watch with <code>MutableStateFlow</code>', 'Announce one-off events with <code>MutableSharedFlow</code>', 'Explain what makes a flow hot'],
        level: 'beginner', introduces: ['MutableStateFlow', 'StateFlow', 'MutableSharedFlow', 'SharedFlow'],
        body: `
<p>Every flow so far was cold: it runs only for a collector, and starts over each time. But the number of glasses today exists whether a screen watches it or not. Open History, come back, and the water screen should show the count right away, not count from zero again.</p>
<p><code>val glasses = MutableStateFlow(0)</code> is a flow that always holds one value, here starting at 0. Read and change it with <code>glasses.value</code>, like a <code>var</code>: <code>glasses.value = 3</code>. A new collector gets the current value at once, then every new one. Setting the same value again hands out nothing. Its type is <code>MutableStateFlow&lt;Int&gt;</code>; the read-only kind, without “Mutable”, is <code>StateFlow&lt;Int&gt;</code>, like <code>List</code> and <code>MutableList</code>.</p>
<p><code>val messages = MutableSharedFlow&lt;String&gt;()</code> holds no value at all. <code>messages.emit("Goal reached!")</code> hands the message to everyone collecting right now, and to nobody else: a collector that starts later never sees it. That suits one-off events, like a message that pops up once.</p>
<p>Both are <em>hot</em>: they exist and take values with nobody collecting, and collecting them starts no code, unlike <code>flow { }</code>. They also never end, so <code>collect</code> on them never returns. It stops only when its coroutine is cancelled.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['glasses (StateFlow)', 'messages (SharedFlow)', 'screen'],
            span: 400,
            predict: {
              q: 'Before any screen collects, <code>glasses</code> becomes 1 and “Good morning!” is emitted. Then a screen starts collecting both. What does it get right away?',
              options: ['Only the 1', 'Only “Good morning!”', 'Both'],
              a: 0,
              why: 'A StateFlow always holds its current value and hands it to every new collector. A SharedFlow keeps nothing, so a message nobody was collecting is gone.',
            },
            frames: [
              { now: 0, say: '<code>glasses</code> is a <code>MutableStateFlow(0)</code>. <code>messages</code> is a <code>MutableSharedFlow&lt;String&gt;()</code>. No screen is collecting yet.' },
              { bars: [{ lane: 0, from: 0, to: 40, label: '1' }, { lane: 1, from: 0, to: 40, label: 'msg', tone: 'muted' }], now: 40, say: '<code>glasses.value = 1</code> and “Good morning!” is emitted, with nobody collecting. The StateFlow keeps 1. The message reaches nobody and is gone.' },
              { bars: [{ lane: 2, from: 40, to: 80, label: '1', tone: 'ok' }], now: 80, say: 'The screen starts collecting both. The StateFlow hands it the current value, 1, at once. The SharedFlow has nothing to hand over.' },
              { bars: [{ lane: 0, from: 100, to: 140, label: '2' }, { lane: 2, from: 100, to: 140, label: '2', tone: 'ok' }], now: 140, say: '<code>glasses.value = 2</code>. The screen is collecting, so it gets 2.' },
              { bars: [{ lane: 0, from: 200, to: 240, label: '2', tone: 'muted' }], now: 240, say: '<code>glasses.value = 2</code> again. It is the same value, so nothing is handed out.' },
              { bars: [{ lane: 1, from: 300, to: 340, label: 'msg' }, { lane: 2, from: 300, to: 340, label: 'Goal', tone: 'ok' }], now: 340, say: '<code>messages.emit("Goal reached!")</code> while the screen is collecting: this time it arrives.' },
              { now: 400, say: 'The screen closes and its coroutines are cancelled. <code>glasses.value</code> is still 2, ready for the next screen.' },
            ],
          });
        },
        code: `object WaterLog {   // one water log for the whole app
    val glasses = MutableStateFlow(0)
    val messages = MutableSharedFlow<String>()

    suspend fun addGlass() {
        glasses.value += 1
        if (glasses.value == 3) {
            messages.emit("Goal reached!")
        }
    }
}

fun main() = runBlocking {
    val screen = launch { WaterLog.glasses.collect { println("$it of 3") } }
    val popup = launch { WaterLog.messages.collect { println(it) } }
    delay(100)
    for (i in 1..3) {
        WaterLog.addGlass()
        delay(100)
    }
    screen.cancel()     // collect on a hot flow never returns by itself
    popup.cancel()
}
// 0 of 3
// 1 of 3
// 2 of 3
// 3 of 3
// Goal reached!`,
        play: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val glasses = MutableStateFlow(0)
    val messages = MutableSharedFlow<String>()

    glasses.value = 1               // nobody is collecting yet
    messages.emit("Good morning!")  // nobody is collecting yet

    val screen = launch {
        glasses.collect { println("Screen shows $it") }
    }
    val popup = launch {
        messages.collect { println("Message: $it") }
    }
    delay(100)

    glasses.value = 2
    delay(100)
    glasses.value = 2               // the same value again
    delay(100)
    messages.emit("Goal reached!")
    delay(100)

    println("Now: \${glasses.value}")
    screen.cancel()
    popup.cancel()
}`,
        remember: 'StateFlow: always one value, handed to every new collector. SharedFlow: events for whoever is collecting right now.',
        mistakes: [
          { title: 'Waiting for collect on a hot flow to return', bad: 'glasses.collect { println(it) }\nprintln("Done")   // never runs: a StateFlow never ends', good: 'val screen = launch { glasses.collect { println(it) } }\nprintln("Done")\nscreen.cancel()   // stop collecting when you are done', why: 'A hot flow never ends, so its <code>collect</code> waits forever. Collect it in its own <code>launch</code>, and cancel that when you no longer need it.' },
        ],
        terms: [
          { term: 'hot flow', def: 'A flow that exists and takes values with nobody collecting. Collecting it starts no code, and it never ends.' },
          { term: 'StateFlow', def: 'A hot flow that always holds one value, <code>.value</code>, and hands it to every new collector.' },
          { term: 'SharedFlow', def: 'A hot flow that hands each value to the collectors there at that moment, and keeps nothing.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a counter that starts at 0, then change it to 5.', code: 'val glasses = [[MutableStateFlow]](0)\nglasses.[[value]] = 5', why: '<code>MutableStateFlow(0)</code> starts at 0; setting <code>.value</code> hands the new value to every collector.' },
          { type: 'bug', prompt: 'The screen should show 3, but it keeps showing 0. Tap the wrong line.', code: 'val glasses = MutableStateFlow(0)\nvar count = glasses.value\nlaunch { glasses.collect { println(it) } }\ncount = 3', bug: 3, fix: 'glasses.value = 3', why: '<code>count</code> is a plain copy of the value at that moment. Only setting <code>glasses.value</code> hands a new value to collectors.' },
        ],
        quiz: [
          { q: 'A StateFlow holds 4. A new screen starts collecting it. What does the screen get first?', options: ['4, right away', 'Nothing until the value changes', 'Every value it ever held'], a: 0, why: 'A StateFlow hands its current value to every new collector at once.' },
          { q: '<code>messages.emit("Hi")</code> runs on a <code>MutableSharedFlow</code> while nobody collects. What happens to “Hi”?', options: ['It is lost', 'It waits for the first collector', 'The program crashes'], a: 0, why: 'A SharedFlow made with <code>MutableSharedFlow()</code> keeps nothing. Only the collectors there at that moment get a value.' },
          { q: '<code>glasses.value</code> is 3, and the code sets it to 3 again. What do the collectors get?', options: ['Nothing', '3 once more', '0'], a: 0, why: 'A StateFlow hands out a value only when it is different from the current one.' },
        ],
        docs: [['StateFlow and SharedFlow', 'https://developer.android.com/kotlin/flow/stateflow-and-sharedflow'], ['Kotlin docs: Hot flows', 'https://kotlinlang.org/docs/coroutines-flow.html#hot-flows']],
      },

      {
        id: 'statein-sharein',
        title: 'Sharing a flow',
        tagline: 'stateIn and shareIn run one cold flow once and share it with every collector.',
        goals: ['Share one run of a cold flow with <code>stateIn</code>', 'Say when it runs with <code>SharingStarted</code>', 'Choose between <code>stateIn</code> and <code>shareIn</code>'],
        level: 'beginner', introduces: ['stateIn', 'shareIn', 'SharingStarted', 'WhileSubscribed', 'Eagerly'],
        body: `
<p>The water bottle’s sensor is read through a cold flow: collecting it turns the sensor on. The water screen and the History screen both show the sips. Two collectors of a cold flow mean two runs, so the sensor is turned on twice and the bottle’s battery runs down twice as fast.</p>
<p><code>bottleSips.stateIn(scope, SharingStarted.WhileSubscribed(5000), 0)</code> turns the cold flow into a hot <code>StateFlow</code>. It runs the cold flow once, in a coroutine it starts in <code>scope</code>, and shares the values with every collector. Like any StateFlow it always has a value: the last argument, here 0, until the first real value arrives. The scope sets how long the sharing may live: when the scope is cancelled, the sharing stops. In a small program, <code>this</code> inside <code>launch { }</code> is that coroutine’s scope.</p>
<p><code>SharingStarted</code> says when to run the cold flow. <code>SharingStarted.WhileSubscribed(5000)</code> runs it while at least one collector is there, and 5000 ms (5 seconds) longer after the last one leaves, so a screen that closes and opens again within 5 seconds doesn’t turn the sensor off and on again. <code>SharingStarted.Eagerly</code> starts at once and runs until the scope ends.</p>
<p>Its relative <code>shareIn(scope, SharingStarted.WhileSubscribed(5000))</code> gives a <code>SharedFlow</code> instead: no starting value, and a new collector gets only what comes next. The rule: <code>stateIn</code> for what the screen shows, <code>shareIn</code> for events.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 260,
            nodes: [
              { id: 'sensor', label: 'Bottle sensor<small>flow { }</small>', x: 50, y: 12, tone: 'warm' },
              { id: 'st', label: 'stateIn<small>StateFlow</small>', x: 50, y: 50, hidden: true },
              { id: 'a', label: 'Water screen', x: 25, y: 88 },
              { id: 'b', label: 'History screen', x: 75, y: 88 },
            ],
            predict: {
              q: 'With <code>stateIn</code> and <code>WhileSubscribed(5000)</code>, the water screen and the History screen both close. When is the sensor turned off?',
              options: ['About 5 seconds later, if nobody comes back', 'Right away', 'Never, while the app runs'],
              a: 0,
              why: '<code>WhileSubscribed(5000)</code> keeps the cold flow running 5 seconds after the last collector leaves, then cancels it.',
            },
            frames: [
              { say: 'The sensor is read through a cold flow. Every <code>collect</code> runs it again and turns the sensor on.' },
              { add: [['sensor', 'a', 'run 1', 'accent']], say: 'The water screen collects the cold flow. The sensor turns on for it.' },
              { add: [['sensor', 'b', 'run 2', 'err']], hl: ['sensor'], say: 'The History screen collects too. A cold flow runs again: the sensor is now on twice.' },
              { remove: [['sensor', 'a'], ['sensor', 'b']], show: ['st'], add: [['sensor', 'st', 'one run', 'ok'], ['st', 'a', '', 'ok'], ['st', 'b', '', 'ok']], say: 'With <code>stateIn</code>, one coroutine collects the sensor and both collect the StateFlow. One run, shared.' },
              { remove: [['st', 'a'], ['st', 'b']], gone: ['a', 'b'], say: 'Both close. <code>WhileSubscribed(5000)</code> keeps the sensor on 5 more seconds, in case one comes back.' },
              { remove: [['sensor', 'st']], gone: ['sensor'], say: 'Nobody came back, so the cold flow is cancelled and the sensor turns off. The StateFlow keeps its last value.' },
              { back: ['a', 'sensor'], add: [['sensor', 'st', 'one run', 'ok'], ['st', 'a', '', 'ok']], say: 'The water screen opens again. It gets the last value at once, and the sensor turns on again, still once.' },
            ],
          });
        },
        code: `val bottleSips: Flow<Int> = flow {
    println("Sensor on")
    for (sips in 1..3) {         // a real sensor would go on and on
        delay(100)
        emit(sips)
    }
}

fun main() = runBlocking {
    val app = launch {
        val sips: StateFlow<Int> = bottleSips
            .stateIn(this, SharingStarted.WhileSubscribed(5000), 0)
        launch { sips.collect { println("Water: $it") } }
        launch { sips.collect { println("History: $it") } }
    }
    delay(1000)
    app.cancel()        // the sharing stops with its scope
}
// Water: 0, History: 0, Sensor on, then 1, 2 and 3 for each.
// "Sensor on" is printed once: one run, shared.`,
        play: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

val bottleSips = flow {
    println("Sensor on")
    for (sips in 1..3) {
        delay(100)
        emit(sips)
    }
}

fun main() = runBlocking {
    val app = launch {
        val sips = bottleSips.stateIn(this, SharingStarted.WhileSubscribed(5000), 0)
        // Try: val sips = bottleSips      How often is "Sensor on" printed now?
        launch { sips.collect { println("Water: $it") } }
        launch { sips.collect { println("History: $it") } }
    }
    delay(1000)
    app.cancel()
}`,
        remember: 'stateIn and shareIn run a cold flow once, in a scope, for every collector. stateIn has a current value; shareIn is for events.',
        mistakes: [
          { title: 'Calling stateIn for each collector', bad: 'launch { bottleSips.stateIn(this, SharingStarted.Eagerly, 0).collect { show(it) } }\nlaunch { bottleSips.stateIn(this, SharingStarted.Eagerly, 0).collect { show(it) } }\n// "Sensor on" twice', good: 'val sips = bottleSips.stateIn(this, SharingStarted.Eagerly, 0)\nlaunch { sips.collect { show(it) } }\nlaunch { sips.collect { show(it) } }\n// "Sensor on" once', why: 'Every <code>stateIn</code> call starts its own run of the cold flow. Make the shared flow once, in a <code>val</code>, and let everyone collect that.' },
        ],
        terms: [
          { term: 'stateIn', def: 'Runs a cold flow once in a scope and shares it as a <code>StateFlow</code>, which starts with the value you give.' },
          { term: 'shareIn', def: 'Like <code>stateIn</code>, but gives a <code>SharedFlow</code>: no starting value, and a new collector gets only what comes next.' },
          { term: 'SharingStarted', def: 'When the shared cold flow runs: <code>WhileSubscribed(5000)</code> while someone collects, plus 5 seconds; <code>Eagerly</code> at once, until the scope ends.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Share the bottle’s flow as a StateFlow that starts at 0.', code: 'val sips = bottleSips.[[stateIn]](this, [[SharingStarted]].WhileSubscribed(5000), [[0]])', why: '<code>stateIn</code> takes the scope, when to run, and the starting value.' },
          { type: 'bug', prompt: 'The sensor is turned on twice. Tap the wrong line.', code: 'val sips = bottleSips.stateIn(this, SharingStarted.WhileSubscribed(5000), 0)\nlaunch { sips.collect { println("Water: $it") } }\nlaunch { bottleSips.collect { println("History: $it") } }', bug: 2, fix: 'launch { sips.collect { println("History: $it") } }', why: 'The History screen collects the cold <code>bottleSips</code> flow itself, which runs it a second time. Collect the shared <code>sips</code> instead.' },
        ],
        quiz: [
          { q: '<code>stateIn(this, SharingStarted.WhileSubscribed(5000), 0)</code>. A screen collects before the sensor has sent anything. What does it get?', options: ['0', 'Nothing yet', 'An error'], a: 0, why: 'A StateFlow always has a value. Until the cold flow emits, it is the starting value you passed, 0.' },
          { q: 'Three screens collect one <code>stateIn</code> StateFlow. How many times does the cold flow run?', options: ['Once', 'Three times'], a: 0, why: 'That is the point of sharing: one run, its values handed to every collector.' },
          { q: 'The screen should show the latest sips at once when it opens. Which one fits?', options: ['<code>stateIn</code>', '<code>shareIn</code>'], a: 0, why: '<code>stateIn</code> makes a StateFlow, which always holds a value and hands it to a new collector right away. <code>shareIn</code> makes a SharedFlow, which keeps nothing: a new collector waits for the next value.' },
        ],
        docs: [['StateFlow and SharedFlow', 'https://developer.android.com/kotlin/flow/stateflow-and-sharedflow'], ['API: stateIn', 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/state-in.html']],
      },

      {
        id: 'lifecycle',
        title: 'Collecting safely in the UI',
        tagline: 'Collect while the screen is visible, stop when it isn’t.',
        goals: ['Read a flow as state in Compose with <code>collectAsStateWithLifecycle</code>', 'Collect only while the screen is started with <code>repeatOnLifecycle</code>', 'Explain why collecting in the background wastes battery'],
        level: 'beginner', introduces: ['collectAsStateWithLifecycle', 'initialValue', 'lifecycleScope', 'repeatOnLifecycle', 'Lifecycle', 'STARTED'],
        body: `
<p>The water screen shows the glasses from a StateFlow. When the user presses Home, the screen is hidden but the Activity still exists: <code>onStop</code> runs, not <code>onDestroy</code>. A screen that kept collecting would keep working while nobody looks: it would recompose for every new value, and collecting a cold flow like the bottle sensor would keep the sensor on and drain the battery.</p>
<p>In Compose, <code>val glasses by WaterLog.glasses.collectAsStateWithLifecycle()</code> collects the flow and turns it into state the composable reads, like <code>remember { mutableStateOf(0) }</code>: each new value recomposes the screen. It collects only while the screen is at least started (visible), stops when the screen is stopped, and starts again when the user comes back. A StateFlow hands its current value right away, so the screen is up to date at once. A plain <code>Flow</code> has no current value, so give it one to show until the first value arrives: <code>collectAsStateWithLifecycle(initialValue = 0)</code>. It all comes from the library <code>androidx.lifecycle:lifecycle-runtime-compose</code>.</p>
<p>Outside a composable, for example in <code>onCreate</code> of an Activity, you do the same by hand. <code>lifecycleScope</code> is a scope that belongs to the Activity: its coroutines are cancelled when the Activity is destroyed. Inside <code>lifecycleScope.launch { }</code>, <code>repeatOnLifecycle(Lifecycle.State.STARTED) { ... }</code> runs its block each time the screen is started and cancels it each time the screen is stopped. Put the <code>collect</code> inside that block.</p>`,
        visual(el) {
          const scr = n => `<div class="ui-m-body" style="justify-items:center;gap:10px"><div style="font-size:1.05rem;font-weight:800">${n} of 8 glasses</div><span style="justify-self:center" class="ui-m-btn b-add">Add a glass</span></div>`;
          const home = '<div class="ui-m-body" style="place-items:center;color:var(--muted)">Home screen</div>';
          Lab.ui.phone(el, {
            logTitle: 'What happens',
            predict: {
              q: 'The user presses Home. What happens to the collecting?',
              options: ['It stops, and starts again when the user comes back', 'It keeps running in the background', 'It stops for good'],
              a: 0,
              why: '<code>collectAsStateWithLifecycle</code> collects only while the screen is started. Home stops the screen; coming back starts it again.',
            },
            frames: [
              { screen: scr(2), log: 'onStart: collecting starts, gets 2', say: 'The screen opens. <code>collectAsStateWithLifecycle</code> starts collecting and gets the current value, 2, at once.' },
              { screen: scr(3), tap: '.b-add', log: 'new value: 3', say: 'Add a glass: <code>WaterLog.glasses.value</code> becomes 3, a new value arrives, and the screen recomposes.' },
              { screen: home, log: 'onStop: collecting cancelled', say: 'Home: <code>onStop</code> runs and collecting stops. The StateFlow still holds 3, but nothing on this screen runs.' },
              { log: 'value set to 4, nobody collecting', say: 'While the app is hidden, the value becomes 4. Nobody collects it, and that is fine: the StateFlow holds it.' },
              { screen: scr(4), log: 'onStart: collecting starts, gets 4', say: 'Back in the app: <code>onStart</code>, collecting starts again and gets the current value, 4, right away.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
// dependencies {
//     implementation("androidx.lifecycle:lifecycle-runtime-compose:2.11.0")
//     implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.11.0")
// }

object WaterLog {
    val glasses = MutableStateFlow(0)
}

@Composable
fun WaterScreen() {
    val glasses by WaterLog.glasses.collectAsStateWithLifecycle()   // only while visible
    GlassCounter(glasses = glasses, onAdd = { WaterLog.glasses.value += 1 })
}

@Composable
fun TemperatureText(temps: Flow<Int>) {
    val temp by temps.collectAsStateWithLifecycle(initialValue = 0)   // 0 until the first value
    Text("$temp degrees")
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {   // runs at onStart, cancelled at onStop
                WaterLog.glasses.collect { Log.d("Water", "$it glasses") }
            }
        }
        setContent { WaterScreen() }
    }
}`,
        remember: 'In Compose, collectAsStateWithLifecycle(); elsewhere, repeatOnLifecycle(Lifecycle.State.STARTED) inside lifecycleScope.launch. Both collect only while the screen is visible.',
        mistakes: [
          { title: 'collectAsState in an Android app', bad: 'val glasses by WaterLog.glasses.collectAsState()   // also collects in the background', good: 'val glasses by WaterLog.glasses.collectAsStateWithLifecycle()', why: '<code>collectAsState()</code> collects as long as the composable is part of the screen, and that includes the time the app is hidden. The lifecycle version stops at <code>onStop</code>.' },
        ],
        terms: [
          { term: 'collectAsStateWithLifecycle', def: 'Collects a flow into state a composable reads, only while the screen is at least started.' },
          { term: 'initialValue', def: 'For a plain <code>Flow</code>, which has no current value: <code>collectAsStateWithLifecycle(initialValue = 0)</code> shows 0 until the first value arrives.' },
          { term: 'lifecycleScope', def: 'A scope that belongs to an Activity. Its coroutines are cancelled when the Activity is destroyed.' },
          { term: 'repeatOnLifecycle', def: '<code>repeatOnLifecycle(Lifecycle.State.STARTED) { }</code> runs its block each time the screen is started and cancels it each time it is stopped.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the glasses in Compose, and log them from the Activity, both only while the screen is visible.', code: 'val glasses by WaterLog.glasses.[[collectAsStateWithLifecycle]]()\n\nlifecycleScope.launch {\n    [[repeatOnLifecycle]](Lifecycle.State.[[STARTED]]) {\n        WaterLog.glasses.collect { Log.d("Water", "$it glasses") }\n    }\n}', why: 'Both start collecting at <code>onStart</code> and stop at <code>onStop</code>.' },
          { type: 'bug', prompt: 'Log lines keep appearing while the app is hidden. <code>CREATED</code> means “until the Activity is destroyed”. Tap the wrong line.', code: 'lifecycleScope.launch {\n    repeatOnLifecycle(Lifecycle.State.CREATED) {\n        WaterLog.glasses.collect { Log.d("Water", "$it glasses") }\n    }\n}', bug: 1, fix: '    repeatOnLifecycle(Lifecycle.State.STARTED) {', why: 'A hidden Activity is still created, so the block keeps running. With <code>STARTED</code> it is cancelled at <code>onStop</code>.' },
        ],
        quiz: [
          { q: 'The user presses Home. What does <code>collectAsStateWithLifecycle</code> do?', options: ['Stops collecting', 'Keeps collecting', 'Destroys the StateFlow'], a: 0, why: 'Home stops the screen, and collecting stops with it. The StateFlow itself keeps its value.' },
          { q: 'The user comes back. What does the screen show first?', options: ['The StateFlow’s current value', 'The value it showed before Home', '0'], a: 0, why: 'Collecting starts again, and a StateFlow hands its current value at once.' },
          { q: 'When are the coroutines in <code>lifecycleScope</code> cancelled?', options: ['When the Activity is destroyed', 'At every <code>onStop</code>', 'Never'], a: 0, why: 'The scope belongs to the Activity. Stopping and starting inside it is the job of <code>repeatOnLifecycle</code>.' },
        ],
        docs: [['Coroutines with lifecycle-aware components', 'https://developer.android.com/topic/libraries/architecture/coroutines'], ['Lifecycle-aware coroutines in Views: repeatOnLifecycle', 'https://developer.android.com/topic/libraries/architecture/views/coroutines-views']],
      },

      {
        id: 'callbackflow',
        title: 'Wrapping callbacks',
        tagline: 'callbackFlow turns a listener into a flow, and removes the listener when collecting stops.',
        goals: ['Turn a listener into a flow with <code>callbackFlow</code>', 'Send values from the listener with <code>trySend</code>', 'Remove the listener in <code>awaitClose</code>'],
        level: 'beginner', introduces: ['callbackFlow', 'trySend', 'awaitClose'],
        body: `
<p>The water bottle comes with a library written the older way. You subscribe a listener, a function it calls for every sip, like the observer pattern you met. When you are done you must unsubscribe it, or the bottle keeps calling a screen that is long gone. The rest of the app works with flows. How do you join the two?</p>
<p><code>callbackFlow { }</code> makes a flow from a listener. In its block, make a listener that calls <code>trySend(ml)</code>, and subscribe it. <code>trySend</code> puts a value into the flow without waiting. A listener is a plain function, not a coroutine, so it can’t call suspend functions like <code>emit</code> or <code>send</code>.</p>
<p>The block ends with <code>awaitClose { bottle.unsubscribe(listener) }</code>. <code>awaitClose</code> waits there and keeps the flow open while someone collects. When collecting stops, because its coroutine is cancelled, the lambda runs: that is where you unsubscribe. It lives in another package, so add <code>import kotlinx.coroutines.channels.awaitClose</code>.</p>
<p>Like <code>flow { }</code>, <code>callbackFlow</code> is cold: each collector runs the block, and subscribes a listener of its own.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun sipsOf(bottle: Bottle): Flow<Int> = callbackFlow {\n    val listener: (Int) -> Unit = { ml -> trySend(ml) }\n    bottle.subscribe(listener)\n    awaitClose { bottle.unsubscribe(listener) }\n}\n\nfun main() = runBlocking {\n    val bottle = Bottle()\n    val screen = launch {\n        sipsOf(bottle).collect { println("Sip: $it ml") }\n    }\n    delay(100)\n    bottle.sip(30)\n    bottle.sip(50)\n    delay(100)\n    screen.cancel()\n}',
            predict: {
              q: 'The screen’s coroutine is cancelled at the end. What runs because of that?',
              options: ['The lambda of <code>awaitClose</code>, which unsubscribes', 'Nothing: the listener stays subscribed', '<code>bottle.subscribe</code> runs again'],
              a: 0,
              why: 'Cancelling stops the collecting. <code>awaitClose</code> stops waiting and runs its lambda.',
            },
            frames: [
              { line: [9, 10], say: 'The screen starts collecting. That runs the <code>callbackFlow</code> block. (<code>Bottle</code> is the class from the library; its functions print what they do.)' },
              { line: [2, 3], out: 'Listener added', say: 'A listener is made and subscribed. The bottle prints “Listener added”.' },
              { line: 4, say: '<code>awaitClose</code> waits here. The block doesn’t end, so the flow stays open.' },
              { line: [13, 2, 10], out: 'Sip: 30 ml', say: 'A sip: the bottle calls the listener, <code>trySend(30)</code> puts 30 into the flow, and <code>collect</code> prints it.' },
              { line: [14, 10], out: 'Sip: 50 ml', say: 'Every sip arrives the same way.' },
              { line: [16, 4], out: 'Listener removed', say: 'The screen is cancelled. Collecting stops, so the lambda of <code>awaitClose</code> runs and unsubscribes.' },
            ],
          });
        },
        code: `class Bottle {
    private val listeners = mutableListOf<(Int) -> Unit>()

    fun subscribe(listener: (Int) -> Unit) {
        listeners.add(listener)
    }

    fun unsubscribe(listener: (Int) -> Unit) {
        listeners.remove(listener)
    }

    fun sip(ml: Int) {
        for (listener in listeners) {
            listener(ml)
        }
    }
}

fun sipsOf(bottle: Bottle): Flow<Int> = callbackFlow {
    val listener: (Int) -> Unit = { ml -> trySend(ml) }   // called for every sip
    bottle.subscribe(listener)
    awaitClose { bottle.unsubscribe(listener) }           // runs when collecting stops
}`,
        play: `import kotlinx.coroutines.*
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.*

class Bottle {
    private val listeners = mutableListOf<(Int) -> Unit>()

    fun subscribe(listener: (Int) -> Unit) {
        listeners.add(listener)
        println("Listener added")
    }

    fun unsubscribe(listener: (Int) -> Unit) {
        listeners.remove(listener)
        println("Listener removed")
    }

    fun sip(ml: Int) {
        for (listener in listeners) {
            listener(ml)
        }
    }
}

fun sipsOf(bottle: Bottle): Flow<Int> = callbackFlow {
    val listener: (Int) -> Unit = { ml -> trySend(ml) }
    bottle.subscribe(listener)
    awaitClose { bottle.unsubscribe(listener) }   // try awaitClose { } and run again
}

fun main() = runBlocking {
    val bottle = Bottle()
    val screen = launch {
        sipsOf(bottle).collect { println("Sip: $it ml") }
    }
    delay(100)
    bottle.sip(30)
    bottle.sip(50)
    delay(100)
    screen.cancel()
    delay(100)
    bottle.sip(40)                                // nobody is listening any more
    println("Done")
}`,
        remember: 'In callbackFlow: subscribe a listener that calls trySend, then awaitClose { unsubscribe }.',
        mistakes: [
          { title: 'Calling send from the listener', bad: 'val listener: (Int) -> Unit = { ml -> send(ml) }\n// error: Suspension functions can only be called within coroutine body.', good: 'val listener: (Int) -> Unit = { ml -> trySend(ml) }', why: 'The listener is a plain function that the bottle calls, not a coroutine, so it can’t wait. <code>trySend</code> doesn’t wait.' },
        ],
        terms: [
          { term: 'callbackFlow', def: 'Makes a cold flow from a listener: subscribe it in the block, and unsubscribe in <code>awaitClose</code>.' },
          { term: 'trySend', def: 'Puts a value into a <code>callbackFlow</code> without waiting, so a plain listener can call it.' },
          { term: 'awaitClose', def: 'Keeps a <code>callbackFlow</code> open while someone collects; its lambda runs when collecting stops.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn the bottle’s listener into a flow.', code: 'fun sipsOf(bottle: Bottle): Flow<Int> = [[callbackFlow]] {\n    val listener: (Int) -> Unit = { ml -> [[trySend]](ml) }\n    bottle.subscribe(listener)\n    [[awaitClose]] { bottle.unsubscribe(listener) }\n}', why: '<code>callbackFlow</code> builds the flow, <code>trySend</code> passes each sip on, <code>awaitClose</code> cleans up.' },
          { type: 'bug', prompt: 'Each time the screen opens and closes, one more listener stays subscribed. Tap the wrong line.', code: 'fun sipsOf(bottle: Bottle): Flow<Int> = callbackFlow {\n    val listener: (Int) -> Unit = { ml -> trySend(ml) }\n    bottle.subscribe(listener)\n    awaitClose { }\n}', bug: 3, fix: '    awaitClose { bottle.unsubscribe(listener) }', why: 'An empty <code>awaitClose</code> never unsubscribes, so the bottle keeps every old listener and keeps calling it.' },
        ],
        quiz: [
          { q: 'Why does the listener call <code>trySend</code> and not <code>emit</code>?', options: ['The listener is a plain function and can’t wait', '<code>trySend</code> is faster', '<code>emit</code> only works with numbers'], a: 0, why: 'The bottle calls the listener like any function. Only <code>trySend</code> works there, because it never waits.' },
          { q: 'When does the lambda of <code>awaitClose</code> run?', options: ['When collecting stops', 'Right after <code>subscribe</code>', 'After every sip'], a: 0, why: '<code>awaitClose</code> waits while someone collects. When the collecting coroutine is cancelled, its lambda runs.' },
          { q: 'Two screens collect <code>sipsOf(bottle)</code>. How many listeners does the bottle have?', options: ['Two', 'One'], a: 0, why: '<code>callbackFlow</code> is cold: each collector runs the block and subscribes its own listener.' },
        ],
        docs: [['Kotlin flows on Android (see Convert callback-based APIs to flows)', 'https://developer.android.com/kotlin/flow'], ['API: callbackFlow', 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/callback-flow.html']],
      },

      {
        id: 'suspend-callback',
        title: 'One-shot callbacks',
        tagline: 'suspendCancellableCoroutine turns a single answer into a suspend function.',
        goals: ['Turn a one-time callback into a suspend function with <code>suspendCancellableCoroutine</code>', 'Hand back the answer with <code>resume</code>, or an error with <code>resumeWithException</code>', 'Stop the request with <code>invokeOnCancellation</code>'],
        level: 'beginner', introduces: ['suspendCancellableCoroutine', 'resume', 'resumeWithException', 'invokeOnCancellation'],
        body: `
<p>The bottle’s library can also tell you its battery level, once, through a callback: <code>bottle.askBattery { percent -&gt; ... }</code>. In a coroutine you would rather write <code>val battery = batteryOf(bottle)</code> and carry on, as after <code>delay</code>. A flow is the wrong shape for a single answer.</p>
<p><code>suspendCancellableCoroutine { continuation -&gt; ... }</code> pauses the coroutine that calls it and hands you a <em>continuation</em>: a handle to wake that coroutine up again. Ask the question in the block, and in the callback call <code>continuation.resume(percent)</code>. The coroutine goes on, and <code>suspendCancellableCoroutine</code> gives back <code>percent</code>. If the library reports an error instead, <code>continuation.resumeWithException(e)</code> makes the call throw <code>e</code>. Call one of them exactly once.</p>
<p>The caller may be cancelled while it waits, for example when the screen closes. <code>continuation.invokeOnCancellation { bottle.stopAsking() }</code> runs its lambda in that case, so you can tell the library to stop.</p>
<p>A callback that fires many times becomes a <code>callbackFlow</code>; one that fires once becomes a suspend function. <code>resume</code> and <code>resumeWithException</code> live in Kotlin itself, so they need <code>import kotlin.coroutines.resume</code> and <code>import kotlin.coroutines.resumeWithException</code>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'suspend fun batteryOf(bottle: Bottle): Int =\n    suspendCancellableCoroutine { continuation ->\n        bottle.askBattery { percent -> continuation.resume(percent) }\n        continuation.invokeOnCancellation { bottle.stopAsking() }\n    }\n\nfun main() = runBlocking {\n    val bottle = Bottle()\n    launch {\n        delay(500)\n        bottle.reply(80)\n    }\n    val battery = batteryOf(bottle)\n    println("Battery: $battery%")\n}',
            predict: {
              q: '<code>main</code> calls <code>batteryOf(bottle)</code>, and the bottle replies 500 ms later. What does <code>main</code> do in those 500 ms?',
              options: ['It waits on line 13, without blocking other coroutines', 'It goes on with <code>battery</code> set to 0', 'It crashes: there is no value yet'],
              a: 0,
              why: '<code>suspendCancellableCoroutine</code> pauses the caller until <code>resume</code> is called, like <code>delay</code>. The coroutine with the reply runs meanwhile.',
            },
            frames: [
              { line: 13, say: '<code>main</code> calls <code>batteryOf</code> and will wait for its answer. (<code>Bottle</code> is the library’s class; its functions print what they do.)' },
              { line: [2, 3], out: 'Asked the bottle', say: 'The block asks the bottle and hands it a callback. The bottle prints “Asked the bottle”.' },
              { line: 4, say: 'The cancel handler is set, in case <code>main</code> is cancelled. The block ends, and <code>main</code>’s coroutine is paused: there is no answer yet.' },
              { line: [10, 11], say: '500 ms later the other coroutine runs <code>bottle.reply(80)</code>, and the bottle calls the callback.' },
              { line: 3, say: 'The callback calls <code>continuation.resume(80)</code>. The paused coroutine wakes up.' },
              { line: [13, 14], vars: { battery: '80' }, out: 'Battery: 80%', say: '<code>batteryOf</code> gives back 80, and <code>main</code> goes on as after any suspend function.' },
            ],
          });
        },
        code: `// This version of the library takes two callbacks: one for the answer, one for an error.
suspend fun batteryOf(bottle: Bottle): Int =
    suspendCancellableCoroutine { continuation ->
        bottle.askBattery(
            onResult = { percent -> continuation.resume(percent) },
            onError = { e -> continuation.resumeWithException(e) },
        )
        continuation.invokeOnCancellation { bottle.stopAsking() }
    }

fun main() = runBlocking {
    val bottle = Bottle()
    try {
        val battery = batteryOf(bottle)
        println("Battery: $battery%")        // Battery: 80%
    } catch (e: Exception) {
        println("No answer: \${e.message}")   // if onError was called
    }
}`,
        play: `import kotlinx.coroutines.*
import kotlin.coroutines.resume

class Bottle {
    // a function to call later, or null: the brackets make the whole function type nullable
    private var waiting: ((Int) -> Unit)? = null

    fun askBattery(callback: (Int) -> Unit) {
        println("Asked the bottle")
        waiting = callback
    }

    fun stopAsking() {
        println("Question cancelled")
        waiting = null
    }

    fun reply(percent: Int) {
        val callback = waiting
        if (callback != null) {
            callback(percent)
        }
    }
}

suspend fun batteryOf(bottle: Bottle): Int =
    suspendCancellableCoroutine { continuation ->
        bottle.askBattery { percent -> continuation.resume(percent) }
        continuation.invokeOnCancellation { bottle.stopAsking() }
    }

fun main() = runBlocking {
    val bottle = Bottle()
    launch {
        delay(500)
        bottle.reply(80)
    }
    val battery = batteryOf(bottle)
    println("Battery: $battery%")

    val screen = launch { batteryOf(bottle) }   // asks again, then the screen closes
    delay(100)
    screen.cancel()
    delay(100)
    println("Done")
    // Delete the invokeOnCancellation line and run again. What is missing?
}`,
        remember: 'One answer: suspendCancellableCoroutine, resume once, and stop the request in invokeOnCancellation. Many answers: callbackFlow.',
        mistakes: [
          { title: 'Using it for a callback that fires many times', bad: 'bottle.askBattery { percent -> continuation.resume(percent) }\n// the bottle replies 70, then 71:\n// IllegalStateException: Already resumed, but proposed with update 71', good: '// a callback that fires many times belongs in a callbackFlow:\nval listener: (Int) -> Unit = { percent -> trySend(percent) }', why: 'A continuation can be resumed only once. The second call crashes the program. For a stream of answers, use <code>callbackFlow</code>.' },
        ],
        terms: [
          { term: 'suspendCancellableCoroutine', def: 'Pauses the calling coroutine and hands you a continuation; what you pass to <code>resume</code> becomes its result.' },
          { term: 'continuation', def: 'A handle to a paused coroutine. <code>resume(value)</code> wakes it with a value, <code>resumeWithException(e)</code> makes it throw <code>e</code>.' },
          { term: 'invokeOnCancellation', def: 'Sets a lambda that runs if the waiting coroutine is cancelled, to stop the request.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn the one-time callback into a suspend function.', code: 'suspend fun batteryOf(bottle: Bottle): Int =\n    [[suspendCancellableCoroutine]] { continuation ->\n        bottle.askBattery { percent -> continuation.[[resume]](percent) }\n        continuation.[[invokeOnCancellation]] { bottle.stopAsking() }\n    }', why: 'The block asks, the callback resumes with the answer, and the handler stops the question if the caller is cancelled.' },
          { type: 'bug', prompt: '<code>batteryOf</code> never returns, even after the bottle replies. Tap the wrong line.', code: 'suspend fun batteryOf(bottle: Bottle): Int =\n    suspendCancellableCoroutine { continuation ->\n        bottle.askBattery { percent -> println(percent) }\n        continuation.invokeOnCancellation { bottle.stopAsking() }\n    }', bug: 2, fix: '        bottle.askBattery { percent -> continuation.resume(percent) }', why: 'Nothing calls <code>resume</code>, so the paused coroutine is never woken up.' },
        ],
        quiz: [
          { q: 'A library calls your callback once with a result. Which tool fits?', options: ['<code>suspendCancellableCoroutine</code>', '<code>callbackFlow</code>', '<code>MutableStateFlow</code>'], a: 0, why: 'One answer becomes a suspend function. A callback that fires many times becomes a <code>callbackFlow</code>.' },
          { q: 'When does the lambda of <code>invokeOnCancellation</code> run?', options: ['When the waiting coroutine is cancelled', 'After every <code>resume</code>', 'Right away'], a: 0, why: 'It is there for cancelling only, so you can stop the request.' },
          { q: 'The callback calls <code>continuation.resumeWithException(e)</code>. What happens in the caller?', options: ['The call throws <code>e</code>', 'It gets 0', 'It waits forever'], a: 0, why: 'The paused coroutine wakes up with the exception, which a <code>try</code>/<code>catch</code> around the call can handle.' },
        ],
        docs: [['API: suspendCancellableCoroutine', 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/suspend-cancellable-coroutine.html']],
      },
    ],
  });
})();
