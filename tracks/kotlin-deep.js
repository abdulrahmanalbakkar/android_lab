/* Kotlin, deeper. Same shape as tracks/kotlin.js.
   The demos use only the shared kit (Lab.ui.codeStepper), so this track needs no helpers or styles of its own. */
(() => {
  Lab.addTrack({
    id: 'kdeep',
    title: 'Kotlin, deeper',
    description: 'More of the Kotlin that libraries are built on: generic types, delegates, sequences, builders, Result and calling Java.',
    group: 'Foundations', requires: ['kotlin'],
    lessons: [
      {
        id: 'generics',
        title: 'Generic types',
        tagline: 'One class or function that works for any type you pick.',
        goals: ['Read a type like <code>List&lt;String&gt;</code> as “list of String”', 'Write a class with a type parameter <code>&lt;T&gt;</code>', 'Write a function that works for any type'],
        level: 'intermediate', introduces: ['T'],
        body: `
<p>Say you have a <code>Box</code> class that holds one String. Now you need a box for an Int, and next week one for a <code>Player</code>. Copying the class for every type would repeat the same code again and again. You have already used the way out: <code>List&lt;String&gt;</code> and <code>mutableListOf&lt;String&gt;()</code>. There is one <code>List</code> for every type, and the type in the angle brackets <code>&lt; &gt;</code> says which one.</p>
<p>Your own class can do the same. <code>class Box&lt;T&gt;(val item: T)</code> gives the class a <code>type parameter</code> called <code>T</code>: a stand-in for a type, picked each time a box is made. In <code>Box("tea")</code>, <code>T</code> is <code>String</code>, so the object is a <code>Box&lt;String&gt;</code> and its <code>item</code> is a String. <code>Box(5)</code> makes a <code>Box&lt;Int&gt;</code>. Kotlin works <code>T</code> out from the value, or you write it yourself: <code>Box&lt;Int&gt;(5)</code>. A class or function with a type parameter is called <code>generic</code>.</p>
<p>A function can have one too. It goes before the function name: <code>fun &lt;T&gt; twice(item: T): List&lt;T&gt;</code> reads “for any type T: take a T, give back a list of T”. The name <code>T</code> is a habit (T for type); any name works, as long as you use the same one everywhere inside.</p>
<p>The types are still checked. Once <code>T</code> is picked, it stays: a <code>Box&lt;String&gt;</code> holds Strings only, and Kotlin stops you before the program runs if you try to put an Int in.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Box<T>(val item: T)

fun <T> twice(item: T): List<T> {
    return listOf(item, item)
}

fun main() {
    val tea = Box("tea")
    val five = Box(5)
    println(tea.item.length)
    println(five.item + 1)
    println(twice("Ada"))
}`,
            predict: {
              q: '<code>five</code> is made with <code>Box(5)</code>. What does <code>println(five.item + 1)</code> print?',
              options: ['<code>6</code>', '<code>51</code>', 'Nothing: it doesn’t compile'],
              a: 0,
              why: 'In <code>Box(5)</code>, T is Int, so <code>item</code> is an Int and <code>+ 1</code> adds.',
            },
            frames: [
              { line: 1, say: 'The plan: a <code>Box</code> holds one <code>item</code> of type <code>T</code>. Which type T is, isn’t decided yet.' },
              { line: [3, 4, 5], say: 'A generic function: <code>&lt;T&gt;</code> comes before the name. It takes any T and gives back a <code>List&lt;T&gt;</code>.' },
              { line: 8, vars: { tea: 'Box<String>', 'tea.item': '"tea"' }, say: '<code>Box("tea")</code>: Kotlin sees a String, so for this box T is String.' },
              { line: 9, vars: { five: 'Box<Int>', 'five.item': '5' }, say: 'The same class, a new box: this time T is Int.' },
              { line: 10, out: '3', say: '<code>tea.item</code> is a String, so <code>.length</code> works: 3 letters.' },
              { line: 11, out: '6', say: '<code>five.item</code> is an Int, so <code>+ 1</code> is plain arithmetic.' },
              { line: [12, 4], out: '[Ada, Ada]', say: 'In this call T is String, so <code>twice</code> gives back a <code>List&lt;String&gt;</code>.' },
            ],
          });
        },
        code: `class Box<T>(val item: T) {
    fun describe(): String = "A box with $item"
}

fun main() {
    val box = Box(42)               // Kotlin works out T = Int
    val name = Box<String>("Lin")   // or write T yourself
    println(box.describe())         // A box with 42
    println(name.item.length)       // 3
}`,
        play: `class Shelf<T> {
    private val items = mutableListOf<T>()

    fun put(item: T) {
        items.add(item)
    }

    fun newest(): T = items.last()
}

fun main() {
    val books = Shelf<String>()
    books.put("Blue Harbor")
    books.put("Paper Moons")
    println(books.newest())

    val scores = Shelf<Int>()
    scores.put(7)
    println(scores.newest() + 1)
    // Try books.put(5) and read the error. Then make a Shelf<Double>.
}`,
        remember: 'class Box<T>(val item: T): T stands in for a type, picked each time a Box is made. fun <T> name(...) does the same for a function.',
        mistakes: [
          { title: 'Putting the wrong type in', bad: `val box: Box<String> = Box(5)   // error`, good: `val box: Box<Int> = Box(5)`, why: `Once T is picked, it stays. Kotlin says <code>Initializer type mismatch: expected 'Box&lt;String&gt;', actual 'Box&lt;Int&gt;'.</code>` },
        ],
        terms: [
          { term: 'type parameter', def: `A stand-in for a type, in angle brackets: the <code>T</code> in <code>class Box&lt;T&gt;</code>. It gets a real type each time the class or function is used.` },
          { term: 'generic', def: `A class or function with a type parameter, so one piece of code works for many types, like <code>List</code> or <code>Box&lt;T&gt;</code>.` },
          { term: 'angle brackets', def: `<code>&lt;</code> and <code>&gt;</code> around a type, as in <code>List&lt;Int&gt;</code>: they say which type is used.` },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a crate that can hold any type, then print what is inside.', code: `class Crate<[[T]]>(val content: [[T]])

fun main() {
    val c = Crate("pears")
    println(c.[[content]])
}`, why: `<code>&lt;T&gt;</code> after the class name names the type parameter, and <code>content</code> uses it as its type.` },
          { type: 'bug', prompt: `Kotlin says <code>Unresolved reference 'T'.</code> Tap the line to fix.`, code: `fun lastOf(items: List<T>): T {
    return items.last()
}

fun main() {
    println(lastOf(listOf("Oslo", "Lisbon")))
}`, bug: 0, fix: 'fun <T> lastOf(items: List<T>): T {', why: `A function has to name its type parameter before it uses it: <code>fun &lt;T&gt;</code>. Then it prints <code>Lisbon</code>.` },
        ],
        quiz: [
          { q: '<code>val b = Box(3.5)</code>. What type is <code>b</code>?', options: ['<code>Box&lt;Double&gt;</code>', '<code>Box&lt;T&gt;</code>', '<code>Box&lt;Int&gt;</code>'], a: 0, why: '3.5 is a Double, so Kotlin picks Double for T.' },
          { q: 'Which line is a correct generic function?', options: ['<code>fun &lt;T&gt; first(items: List&lt;T&gt;): T</code>', '<code>fun first(items: List&lt;T&gt;): T</code>', '<code>fun first(&lt;T&gt; items: List): T</code>'], a: 0, why: 'The type parameter is named in angle brackets after <code>fun</code>, before the function name.' },
          { q: '<code>fun unpack(box: Box&lt;String&gt;)</code>. Does <code>unpack(Box(5))</code> compile?', options: ['No: 5 is not a String', 'Yes: any box fits'], a: 0, why: 'The parameter wants a box of Strings, and 5 is an Int.' },
        ],
        docs: [['Generics', 'https://kotlinlang.org/docs/generics.html'], ['Generic functions', 'https://kotlinlang.org/docs/generics.html#generic-functions']],
      },

      {
        id: 'variance',
        title: 'in and out',
        tagline: 'When a Shelter<Cat> may stand in for a Shelter<Animal>.',
        goals: ['Explain why a <code>Shelter&lt;Cat&gt;</code> isn’t always a <code>Shelter&lt;Animal&gt;</code>', 'Mark a type parameter <code>out</code> when a class only gives T out', 'Mark it <code>in</code> when a class only takes T in'],
        level: 'intermediate', introduces: ['out'],
        body: `
<p>A Cat is an Animal, so a function that wants an <code>Animal</code> happily takes a <code>Cat</code>. You’d expect the same for generic classes: a function that wants a <code>Shelter&lt;Animal&gt;</code> should take a <code>Shelter&lt;Cat&gt;</code>. By default Kotlin says no, and it has a good reason.</p>
<p>Picture a shelter you can also put pets into. If a <code>Shelter&lt;Cat&gt;</code> counted as a <code>Shelter&lt;Animal&gt;</code>, some function could put a Dog into it, and later your code would take out a “cat” that barks. So Kotlin keeps <code>Shelter&lt;Cat&gt;</code> and <code>Shelter&lt;Animal&gt;</code> apart, unless the class makes a promise. This rule is called <code>variance</code>.</p>
<p>The promise <code>out</code>: <code>class Shelter&lt;out T&gt;</code> says “T only comes out of this class. It is read or returned, never passed in.” Then nobody can sneak a Dog in, so a <code>Shelter&lt;Cat&gt;</code> may stand in for a <code>Shelter&lt;Animal&gt;</code>. Kotlin’s own <code>List</code> is made this way. That’s why a <code>List&lt;Cat&gt;</code> fits where a <code>List&lt;Animal&gt;</code> is wanted, but a <code>MutableList&lt;Cat&gt;</code>, which takes items in, doesn’t.</p>
<p>The opposite promise is <code>in</code> (the same word as in <code>for</code> loops, with a different job here): T only goes in, as a parameter. A <code>Feeder&lt;in T&gt;</code> that can feed any Animal can do the job of a <code>Feeder&lt;Cat&gt;</code>. A short way to remember it: a class that produces T is <code>out</code>, a class that consumes T is <code>in</code>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `open class Animal(val name: String)
class Cat(name: String) : Animal(name)

class Shelter<out T>(val pet: T)

fun visit(shelter: Shelter<Animal>) {
    println("Hello, " + shelter.pet.name)
}

fun main() {
    val cats = Shelter(Cat("Tom"))
    visit(cats)
}`,
            predict: {
              q: 'Line 12 passes a <code>Shelter&lt;Cat&gt;</code> where a <code>Shelter&lt;Animal&gt;</code> is wanted. What happens?',
              options: ['It prints <code>Hello, Tom</code>', 'It doesn’t compile'],
              a: 0,
              why: 'With <code>out T</code>, the shelter only hands pets out, and every Cat it hands out is an Animal.',
            },
            frames: [
              { line: [1, 2], say: 'Every Cat is an Animal. That part you know from inheritance.' },
              { line: 4, say: '<code>out T</code>: the promise that T only comes out. <code>pet</code> can be read, and nothing of type T is ever passed in.' },
              { line: 11, vars: { cats: 'Shelter<Cat>' }, say: 'Kotlin works out T = Cat for this shelter.' },
              { line: 12, say: '<code>visit</code> wants a <code>Shelter&lt;Animal&gt;</code>. Because of <code>out</code>, a <code>Shelter&lt;Cat&gt;</code> fits.' },
              { line: 7, out: 'Hello, Tom', say: 'Inside <code>visit</code>, the pet is seen as an Animal, so <code>.name</code> works.' },
              { line: 4, say: `Delete <code>out</code> and line 12 stops compiling: <code>Argument type mismatch: actual type is 'Shelter&lt;Cat&gt;', but 'Shelter&lt;Animal&gt;' was expected.</code>` },
            ],
          });
        },
        code: `open class Animal(val name: String)
class Cat(name: String) : Animal(name)

interface Feeder<in T> {
    fun feed(pet: T)
}

class AnimalFeeder : Feeder<Animal> {
    override fun feed(pet: Animal) {
        println("Feeding " + pet.name)
    }
}

fun feedCat(feeder: Feeder<Cat>) {
    feeder.feed(Cat("Tom"))
}

fun main() {
    feedCat(AnimalFeeder())   // Feeding Tom: a feeder for any animal can feed a cat
}`,
        play: `open class Animal(val name: String)
class Cat(name: String) : Animal(name)
class Dog(name: String) : Animal(name)

class Shelter<out T>(val pet: T)

fun visit(shelter: Shelter<Animal>) {
    println("Visiting " + shelter.pet.name)
}

fun main() {
    val cats = Shelter(Cat("Tom"))
    val dogs = Shelter(Dog("Rex"))
    visit(cats)
    visit(dogs)
    // Delete the word out on line 5 and run again: read the error.
}`,
        remember: 'out T: T only comes out, so a Shelter<Cat> fits where a Shelter<Animal> is wanted. in T: T only goes in, so it works the other way round.',
        mistakes: [
          { title: 'Taking T in, in an out class', bad: `class Shelter<out T>(val pet: T) {
    fun swap(newPet: T) { }   // error
}`, good: `class Shelter<T>(var pet: T) {
    fun swap(newPet: T) {
        pet = newPet
    }
}`, why: `A parameter of type T means T goes in, which breaks the <code>out</code> promise. Kotlin says <code>Type parameter 'T' is declared as 'out' but occurs in 'in' position in type 'T (of class Shelter&lt;out T&gt;)'.</code> If the class really takes T in, drop <code>out</code>.` },
        ],
        terms: [
          { term: 'variance', def: `The rule for whether a <code>Shelter&lt;Cat&gt;</code> may be used where a <code>Shelter&lt;Animal&gt;</code> is wanted. Set with <code>out</code>, <code>in</code>, or neither.` },
          { term: 'out', def: `On a type parameter: T only comes out (read or returned). Then a <code>Shelter&lt;Cat&gt;</code> fits where a <code>Shelter&lt;Animal&gt;</code> is wanted.` },
          { term: 'in (on a type parameter)', def: `T only goes in, as a parameter. Then a <code>Feeder&lt;Animal&gt;</code> fits where a <code>Feeder&lt;Cat&gt;</code> is wanted.` },
        ],
        challenges: [
          { type: 'blank', prompt: 'A <code>Source</code> only gives T out. A <code>Sink</code> only takes T in. Add the right word to each.', code: `interface Source<[[out]] T> {
    fun next(): T
}

interface Sink<[[in]] T> {
    fun send(item: T)
}`, why: '<code>next()</code> returns T, so T comes out. <code>send</code> takes T as a parameter, so T goes in.' },
          { type: 'bug', prompt: `Kotlin says <code>Argument type mismatch: actual type is 'Shelter&lt;Cat&gt;', but 'Shelter&lt;Animal&gt;' was expected.</code> The error points at <code>visit(cats)</code>, but the fix is somewhere else. Tap the line to change.`, code: `open class Animal(val name: String)
class Cat(name: String) : Animal(name)

class Shelter<T>(val pet: T)

fun visit(shelter: Shelter<Animal>) {
    println("Hello, " + shelter.pet.name)
}

fun main() {
    val cats = Shelter(Cat("Tom"))
    visit(cats)
}`, bug: 3, fix: 'class Shelter<out T>(val pet: T)', why: 'The shelter only gives its pet out, so it can promise <code>out T</code>. Then a shelter of cats counts as a shelter of animals.' },
        ],
        quiz: [
          { q: '<code>fun countAll(animals: List&lt;Animal&gt;)</code>. Can you pass a <code>List&lt;Cat&gt;</code>?', options: ['Yes', 'No'], a: 0, why: 'A <code>List</code> can only be read, so Kotlin declares it with <code>out</code>.' },
          { q: '<code>fun adopt(animals: MutableList&lt;Animal&gt;)</code>. Can you pass a <code>MutableList&lt;Cat&gt;</code>?', options: ['No', 'Yes'], a: 0, why: '<code>adopt</code> could add a Dog to your list of cats. A <code>MutableList</code> takes items in too, so it has no <code>out</code>.' },
          { q: '<code>interface Printer&lt;___ T&gt; { fun print(item: T) }</code>. Which word fits the gap?', options: ['<code>in</code>', '<code>out</code>'], a: 0, why: 'T is only a parameter here: it goes in.' },
        ],
        docs: [['Variance', 'https://kotlinlang.org/docs/generics.html#variance'], ['Declaration-site variance', 'https://kotlinlang.org/docs/generics.html#declaration-site-variance']],
      },

      {
        id: 'delegation',
        title: 'Delegation',
        tagline: 'Hand a property’s work to a helper with by.',
        goals: ['Explain what <code>by</code> means in <code>val x by lazy { }</code>', 'Run code every time a property changes, with <code>Delegates.observable</code>', 'Read properties from a map with <code>by map</code>'],
        level: 'intermediate', introduces: ['import', 'Delegates', 'observable', 'vetoable', '_'],
        body: `
<p>A game should print a line every time the score changes. You could write a custom setter (from Smarter properties) for that, but you’d write the same setter again for lives, level, coins... Kotlin lets a property hand that work to a ready-made helper instead.</p>
<p>You have seen this already: <code>val books by lazy { ... }</code>. The word <code>by</code> means “reading this property is handled by this helper”. For a <code>var</code>, setting it is handled by the helper too. The helper is called a <code>delegate</code>, and the property a <code>delegated property</code>. <code>lazy</code> is one delegate; Kotlin has a few more.</p>
<p><code>var score: Int by Delegates.observable(0) { _, old, new -> ... }</code> starts at 0 and runs the lambda after every change, with the old and the new value. A lambda can take several parameters, separated by commas before the <code>-></code>: <code>{ a, b -> a + b }</code>. This one gets three parameters, but the first one (which property changed) isn’t needed here, so it is written <code>_</code>: a parameter you don’t use. <code>Delegates</code> isn’t part of the names Kotlin knows on its own, so the file starts with <code>import kotlin.properties.Delegates</code>: a line that brings a name in from Kotlin’s library.</p>
<p>A map can be a delegate too. (<code>Map&lt;String, String&gt;</code> is the type of a map with String keys and String values: a type can have two type parameters.) In a class made from a <code>Map&lt;String, String&gt;</code>, <code>val theme: String by map</code> reads whatever the map holds under the key <code>"theme"</code>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `import kotlin.properties.Delegates

class Player {
    var score: Int by Delegates.observable(0) { _, old, new ->
        println("score: $old -> $new")
    }
}

fun main() {
    val p = Player()
    p.score = 10
    p.score += 5
    println(p.score)
}`,
            predict: {
              q: 'Line 12 is <code>p.score += 5</code>. What does the lambda print for it?',
              options: ['<code>score: 10 -> 15</code>', '<code>score: 0 -> 15</code>', 'Nothing: only <code>=</code> runs it'],
              a: 0,
              why: '<code>+=</code> sets a new value too, so the lambda runs with old 10 and new 15.',
            },
            frames: [
              { line: 1, say: 'Bring the name <code>Delegates</code> in from Kotlin’s library.' },
              { line: [4, 5, 6], say: '<code>by</code> hands <code>score</code> to an observable delegate: start at 0, and run this lambda after each change.' },
              { line: 10, vars: { 'p.score': '0' }, say: 'A new player starts with the delegate’s first value, 0.' },
              { line: 11, vars: { 'p.score': '10' }, say: 'Setting the property goes through the delegate. It stores 10...' },
              { line: 5, out: 'score: 0 -> 10', say: '...and then runs the lambda with the old and the new value.' },
              { line: 12, vars: { 'p.score': '15' }, say: '<code>+=</code> sets a new value as well.' },
              { line: 5, out: 'score: 10 -> 15', say: 'So the lambda runs again.' },
              { line: 13, out: '15', say: 'Reading goes through the delegate too, and gets the stored value.' },
            ],
          });
        },
        code: `class Settings(map: Map<String, String>) {
    val theme: String by map
    val language: String by map
}

fun main() {
    val s = Settings(mapOf("theme" to "dark", "language" to "pt"))
    println(s.theme)      // dark
    println(s.language)   // pt
}`,
        play: `import kotlin.properties.Delegates

class Thermostat {
    // vetoable: the lambda says yes (true) or no (false) to each new value
    var target: Int by Delegates.vetoable(20) { _, _, new ->
        new >= 10 && new <= 30
    }
}

fun main() {
    val t = Thermostat()
    t.target = 25
    println(t.target)
    t.target = 99
    println(t.target)
    // Try other numbers. Only 10 to 30 get through.
}`,
        remember: 'by hands a property to a delegate: by lazy, by Delegates.observable(start) { _, old, new -> }, by map.',
        mistakes: [
          { title: 'Forgetting the import', bad: `class Player {
    var score: Int by Delegates.observable(0) { _, old, new ->   // error
        println("score: $old -> $new")
    }
}`, good: `import kotlin.properties.Delegates

class Player {
    var score: Int by Delegates.observable(0) { _, old, new ->
        println("score: $old -> $new")
    }
}`, why: `Without the import, Kotlin doesn’t know the name: <code>Unresolved reference 'Delegates'.</code> The import line goes at the very top of the file.` },
        ],
        terms: [
          { term: 'delegate', def: 'A helper object that a property hands its work to, named after <code>by</code>: <code>lazy</code>, <code>Delegates.observable</code>, a map.' },
          { term: 'delegated property', def: 'A property written with <code>by</code>, whose reading (and setting, for a <code>var</code>) is done by its delegate.' },
          { term: 'import', def: 'A line at the top of a file that brings in a name from a library: <code>import kotlin.properties.Delegates</code>.' },
          { term: '_', def: 'Used as a lambda parameter name, it means “there is a value here, but I don’t need it”.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print a line every time <code>lives</code> changes.', code: `import kotlin.properties.Delegates

class Player {
    var lives: Int [[by]] Delegates.[[observable]](3) { _, old, new ->
        println("lives: $old -> $new")
    }
}`, why: '<code>by</code> hands the property to a delegate; <code>observable</code> is the one that runs a lambda after each change.' },
          { type: 'bug', prompt: `Kotlin says <code>'val' cannot be reassigned.</code> at <code>p.score = 10</code>. Tap the line that needs to change.`, code: `import kotlin.properties.Delegates

class Player {
    val score: Int by Delegates.observable(0) { _, old, new ->
        println("score: $old -> $new")
    }
}

fun main() {
    val p = Player()
    p.score = 10
}`, bug: 3, fix: '    var score: Int by Delegates.observable(0) { _, old, new ->', why: 'A delegated property that changes must still be a <code>var</code>. Then it prints <code>score: 0 -> 10</code>.' },
        ],
        quiz: [
          { q: 'In <code>val books by lazy { ... }</code>, what does <code>by</code> mean?', options: ['Reading <code>books</code> is handled by the lazy helper', '<code>books</code> is a copy of <code>lazy</code>', 'The block runs on every read'], a: 0, why: '<code>by</code> hands the property to a delegate, here <code>lazy</code>.' },
          { q: 'With <code>Delegates.observable(0) { _, old, new -> ... }</code>, when does the lambda run?', options: ['After every new value is set', 'Every time the property is read', 'Once, when the object is made'], a: 0, why: 'It observes changes: each time the property is set, it runs with the old and the new value.' },
          { q: '<code>class Settings(map: Map&lt;String, String&gt;) { val theme: String by map }</code>. What is <code>Settings(mapOf("theme" to "dark")).theme</code>?', options: ['<code>"dark"</code>', '<code>"theme"</code>', '<code>null</code>'], a: 0, why: 'The property reads the map’s value under the key with its own name, <code>"theme"</code>.' },
        ],
        docs: [['Delegated properties', 'https://kotlinlang.org/docs/delegated-properties.html'], ['Observable properties', 'https://kotlinlang.org/docs/delegated-properties.html#observable-properties']],
      },

      {
        id: 'inline',
        title: 'Inline functions',
        tagline: 'Copy a function into the place that calls it, and get two new powers.',
        goals: ['Explain what <code>inline</code> does to a function that takes a lambda', 'Use <code>return</code> inside such a lambda to leave the outer function', 'Check a type parameter while the program runs, with <code>reified</code>'],
        level: 'intermediate', introduces: ['inline', 'reified'],
        body: `
<p>Functions like <code>filter</code> and <code>map</code> take a lambda, and programs call them all the time, often inside loops. Each call normally packs the lambda into a small object first, then calls it. Kotlin can skip that work by copying the function into the place that calls it.</p>
<p>Mark the function <code>inline</code>: <code>inline fun repeatTimes(times: Int, action: (Int) -> Unit)</code>. When Kotlin compiles a call to it, it pastes the function’s body, with your lambda’s code, right where the call is. The program does the same thing, without the extra object and the extra call. <code>filter</code>, <code>map</code>, <code>let</code> and <code>apply</code> are all inline.</p>
<p>The pasting has a visible effect. In the lambda of a normal function, <code>return</code> isn’t allowed: Kotlin says <code>'return' is prohibited here.</code> In the lambda of an inline function it is allowed, and it returns from the function where the call is written, as if you had written <code>return</code> there. This is called a <code>non-local return</code>.</p>
<p>A second effect. <code>is</code> also works on its own: <code>pet is Cat</code> is <code>true</code> or <code>false</code>. But inside a generic function, the real type of <code>T</code> is forgotten (<em>erased</em>) while the program runs, so <code>it is T</code> doesn’t compile. In an inline function you can mark it <code>reified</code> (“made real”): <code>inline fun &lt;reified T&gt; countOf(...)</code>. Every call gets its own pasted copy with the real type filled in, so <code>is T</code> works.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `inline fun repeatTimes(times: Int, action: (Int) -> Unit) {
    for (i in 1..times) {
        action(i)
    }
}

fun main() {
    repeatTimes(5) { lap ->
        if (lap == 3) return
        println("Lap $lap")
    }
    println("Done")
}`,
            predict: {
              q: 'At lap 3 the lambda runs <code>return</code>. What is the last line printed?',
              options: ['<code>Lap 2</code>', '<code>Done</code>', '<code>Lap 5</code>'],
              a: 0,
              why: '<code>repeatTimes</code> is inline, so this <code>return</code> leaves <code>main</code> itself. <code>Done</code> is never reached.',
            },
            frames: [
              { line: 1, say: '<code>inline</code>: every call to <code>repeatTimes</code> gets this body pasted in, lambda and all.' },
              { line: 8, vars: { lap: '1' }, say: 'Lap 1. After pasting, the lambda is plain code inside <code>main</code>.' },
              { line: 10, out: 'Lap 1', say: 'Not lap 3, so it prints.' },
              { line: 10, vars: { lap: '2' }, out: 'Lap 2', say: 'Lap 2, the same.' },
              { line: 9, vars: { lap: '3' }, say: 'Lap 3: <code>return</code>. The code sits inside <code>main</code>, so this returns from <code>main</code>.' },
              { line: 12, say: 'The program is over. <code>Done</code> never prints, and laps 4 and 5 never run.' },
            ],
          });
        },
        code: `open class Animal(val name: String)
class Cat(name: String) : Animal(name)
class Dog(name: String) : Animal(name)

inline fun <reified T> countOf(pets: List<Animal>): Int {
    return pets.count { it is T }
}

fun main() {
    val pets = listOf(Cat("Tom"), Dog("Rex"), Cat("Kit"))
    println(countOf<Cat>(pets))   // 2
    println(countOf<Dog>(pets))   // 1
}`,
        play: `inline fun eachName(names: List<String>, action: (String) -> Unit) {
    for (name in names) {
        action(name)
    }
}

fun hasLongName(names: List<String>): Boolean {
    eachName(names) {
        if (it.length > 4) return true
    }
    return false
}

fun main() {
    println(hasLongName(listOf("Ada", "Sam", "Lin")))
    println(hasLongName(listOf("Ada", "Marta", "Lin")))
    // Remove the word inline on line 1 and run: return true is no longer allowed.
}`,
        remember: 'inline pastes a function and its lambda where it is called. That allows return inside the lambda, and reified T for is T checks.',
        mistakes: [
          { title: 'is T without reified', bad: `fun <T> countOf(pets: List<Animal>): Int {
    return pets.count { it is T }   // error
}`, good: `inline fun <reified T> countOf(pets: List<Animal>): Int {
    return pets.count { it is T }
}`, why: `Kotlin says <code>Cannot check for instance of erased type 'T (of fun &lt;T&gt; countOf)'.</code> The real type of T is erased while the program runs. <code>inline</code> with <code>reified</code> keeps it.` },
        ],
        terms: [
          { term: 'inline function', def: 'A function marked <code>inline</code>: its body and its lambda are pasted where it is called.' },
          { term: 'non-local return', def: 'A <code>return</code> inside the lambda of an inline function. It leaves the function where the call is written.' },
          { term: 'reified', def: 'Marks a type parameter of an inline function whose real type is still known while the program runs, so <code>is T</code> works.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Count the pets of one type. Fill in the two words that make <code>is T</code> work.', code: `[[inline]] fun <[[reified]] T> countOf(pets: List<Animal>): Int {
    return pets.count { it is T }
}`, why: 'Only an inline function can have a reified type parameter, and only a reified one can be checked with <code>is</code>.' },
          { type: 'bug', prompt: `Kotlin says <code>'return' is prohibited here.</code> Tap the line to change so the <code>return</code> is allowed.`, code: `fun repeatTimes(times: Int, action: (Int) -> Unit) {
    for (i in 1..times) {
        action(i)
    }
}

fun main() {
    repeatTimes(3) { i ->
        if (i == 2) return
        println(i)
    }
}`, bug: 0, fix: 'inline fun repeatTimes(times: Int, action: (Int) -> Unit) {', why: 'With <code>inline</code>, the lambda is pasted into <code>main</code>, so <code>return</code> leaves <code>main</code>. It prints <code>1</code>.' },
        ],
        quiz: [
          { q: 'What does <code>inline</code> do to a function?', options: ['Pastes its body, with the lambda, where it is called', 'Makes its lambda run twice', 'Lets it be called before it is written'], a: 0, why: 'The program does the same, without packing the lambda into an object first.' },
          { q: 'Inside the lambda of an inline function, <code>return</code> leaves...', options: ['the function where the call is written', 'only the lambda', 'the inline function, which carries on'], a: 0, why: 'It works like a <code>return</code> written right there, because after pasting, that’s where the code is.' },
          { q: 'Which line compiles?', options: ['<code>inline fun &lt;reified T&gt; isA(x: Animal) = x is T</code>', '<code>fun &lt;reified T&gt; isA(x: Animal) = x is T</code>'], a: 0, why: 'The second gives <code>Only type parameters of inline functions can be reified.</code>' },
        ],
        docs: [['Inline functions', 'https://kotlinlang.org/docs/inline-functions.html'], ['Reified type parameters', 'https://kotlinlang.org/docs/inline-functions.html#reified-type-parameters']],
      },

      {
        id: 'operators',
        title: 'Operator overloading',
        tagline: 'Teach your own class what +, [ ] and ( ) mean.',
        goals: ['Make <code>+</code> work on your own class with <code>operator fun plus</code>', 'Read items with <code>[ ]</code> through <code>operator fun get</code>', 'Call an object like a function with <code>invoke</code>'],
        level: 'intermediate', introduces: ['operator', 'plus', 'invoke'],
        body: `
<p><code>2 + 3</code> adds numbers and <code>"a" + "b"</code> joins text. On a <code>Point</code> or a <code>Playlist</code> of your own, <code>+</code> means nothing yet, so you write <code>mix.add("Echo")</code>. Kotlin lets you give the usual symbols a meaning for your own classes.</p>
<p>Each symbol stands for a function with a fixed name. <code>a + b</code> is really <code>a.plus(b)</code>, and <code>a[i]</code> is <code>a.get(i)</code>. Write a member function with that name and mark it <code>operator</code>: <code>operator fun plus(song: String): Playlist</code>. From then on <code>mix + "Echo"</code> calls it. Without the word <code>operator</code> it is an ordinary function, and <code>+</code> won’t use it.</p>
<p>Lists already work this way: <code>songs + "Echo"</code> on a List calls the List’s own <code>plus</code>, which gives back a new list with the item at the end. Copy that habit: your <code>plus</code> should give back a new object and leave the old one as it was, the way <code>2 + 3</code> doesn’t change the 2.</p>
<p>One more: <code>operator fun invoke</code> lets you call an object with round brackets, like a function. <code>hello("Ada")</code> runs <code>hello.invoke("Ada")</code>. Use operators only where a reader would guess the meaning; a <code>+</code> that deletes things would confuse everyone.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Playlist(val songs: List<String>) {
    operator fun plus(song: String): Playlist {
        return Playlist(songs + song)
    }

    operator fun get(index: Int): String {
        return songs[index]
    }
}

fun main() {
    val mix = Playlist(listOf("Rain", "Tides"))
    val longer = mix + "Echo"
    println(longer[2])
    println(mix.songs.size)
}`,
            predict: {
              q: 'Line 13 makes <code>longer</code> with <code>mix + "Echo"</code>. How many songs does <code>mix</code> have afterwards?',
              options: ['2', '3'],
              a: 0,
              why: '<code>plus</code> builds a new Playlist. <code>mix</code> keeps its two songs.',
            },
            frames: [
              { line: 2, say: '<code>operator fun plus</code>: from now on, <code>+</code> on a Playlist calls this.' },
              { line: 6, say: '<code>operator fun get</code>: square brackets on a Playlist call this.' },
              { line: 12, vars: { 'mix.songs': '[Rain, Tides]' }, say: 'A playlist with two songs.' },
              { line: [13, 3], vars: { 'longer.songs': '[Rain, Tides, Echo]' }, say: '<code>mix + "Echo"</code> runs <code>mix.plus("Echo")</code>, which makes a new Playlist with three songs.' },
              { line: [14, 7], out: 'Echo', say: '<code>longer[2]</code> runs <code>longer.get(2)</code>: index 2 is the third song.' },
              { line: 15, out: '2', say: 'The original is unchanged.' },
            ],
          });
        },
        code: `class Greeter(val greeting: String) {
    operator fun invoke(name: String): String {
        return "$greeting, $name!"
    }
}

fun main() {
    val hello = Greeter("Hello")
    println(hello("Ada"))           // Hello, Ada!
    println(hello.invoke("Sam"))    // Hello, Sam!  (the same call, written out)
}`,
        play: `data class Point(val x: Int, val y: Int) {
    operator fun plus(other: Point): Point {
        return Point(x + other.x, y + other.y)
    }
}

fun main() {
    val start = Point(1, 2)
    val step = Point(3, 0)
    println(start + step)
    println(start + step + step)
    // Add operator fun minus(other: Point) and try start - step.
}`,
        remember: 'a + b calls a.plus(b), a[i] calls a.get(i), a(x) calls a.invoke(x), once the function is marked operator.',
        mistakes: [
          { title: 'Forgetting the word operator', bad: `fun plus(song: String): Playlist {
    return Playlist(songs + song)
}
// mix + "Echo" is now an error`, good: `operator fun plus(song: String): Playlist {
    return Playlist(songs + song)
}`, why: `The name alone isn’t enough. Kotlin says <code>'operator' modifier is required on 'fun plus(song: String): Playlist' defined in 'Playlist'.</code>` },
        ],
        terms: [
          { term: 'operator overloading', def: 'Giving a symbol like <code>+</code> or <code>[ ]</code> a meaning for your own class.' },
          { term: 'operator', def: 'Marks a function with one of the fixed names (<code>plus</code>, <code>get</code>, <code>invoke</code>...) so the matching symbol calls it.' },
          { term: 'invoke', def: 'The operator behind round brackets on an object: <code>hello("Ada")</code> runs <code>hello.invoke("Ada")</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>shelf[1]</code> give the second book.', code: `class Shelf(val books: List<String>) {
    [[operator]] fun [[get]](index: Int): String {
        return books[index]
    }
}

fun main() {
    val shelf = Shelf(listOf("Blue Harbor", "Paper Moons"))
    println(shelf[1])   // Paper Moons
}`, why: 'Square brackets call an <code>operator fun get</code>.' },
          { type: 'bug', prompt: `Kotlin says <code>'operator' modifier is not applicable to function: illegal function name.</code> Tap the line to fix.`, code: `data class Money(val cents: Int) {
    operator fun add(other: Money): Money {
        return Money(cents + other.cents)
    }
}

fun main() {
    val total = Money(250) + Money(100)
    println(total)
}`, bug: 1, fix: '    operator fun plus(other: Money): Money {', why: 'The name for <code>+</code> is <code>plus</code>, not <code>add</code>. Then it prints <code>Money(cents=350)</code>.' },
        ],
        quiz: [
          { q: 'On your own class, <code>a + b</code> calls...', options: ['<code>a.plus(b)</code>', '<code>b.plus(a)</code>', '<code>a.add(b)</code>'], a: 0, why: 'The left side’s <code>plus</code> runs, with the right side as its argument.' },
          { q: '<code>shelf[0]</code> calls...', options: ['<code>shelf.get(0)</code>', '<code>shelf.invoke(0)</code>', '<code>shelf.first()</code>'], a: 0, why: 'Square brackets are the <code>get</code> operator.' },
          { q: '<code>Greeter</code> has <code>operator fun invoke(name: String)</code> and <code>val hi = Greeter("Hi")</code>. Which call works?', options: ['<code>hi("Lin")</code>', '<code>Greeter.hi("Lin")</code>', '<code>hi["Lin"]</code>'], a: 0, why: 'Round brackets on the object call <code>invoke</code>.' },
        ],
        docs: [['Operator overloading', 'https://kotlinlang.org/docs/operator-overloading.html'], ['Indexed access operator', 'https://kotlinlang.org/docs/operator-overloading.html#indexed-access-operator']],
      },

      {
        id: 'value',
        title: 'Value classes',
        tagline: 'A separate type around one value, at no extra cost.',
        goals: ['Wrap one value in its own type with <code>value class</code>', 'Let Kotlin catch swapped arguments for you', 'Know the rules: one <code>val</code>, and <code>@JvmInline</code> above it'],
        level: 'intermediate', introduces: ['value', 'JvmInline'],
        body: `
<p><code>fun pace(distance: Int, time: Int)</code> takes two Ints. Call it as <code>pace(25, 5000)</code> by mistake, and it compiles and gives a wrong answer: to Kotlin both are only Ints. If distance and time had types of their own, Kotlin would catch the swap.</p>
<p>A small class could do that: <code>class Meters(val value: Int)</code>. But then every distance is a whole extra object around a single number. A <code>value class</code> gives you the separate type without the extra object: <code>@JvmInline value class Meters(val value: Int)</code>. While you write code, <code>Meters</code> and <code>Minutes</code> are different types, so <code>pace(time, run)</code> doesn’t compile. When the program runs, Kotlin passes the plain Int around.</p>
<p>The rules: a value class wraps exactly one property, and it must be a <code>val</code>. The line <code>@JvmInline</code> above it is required on Android. A word starting with <code>@</code> is an <code>annotation</code>: a note for the compiler, here “store this as the plain value inside”. Like a data class, a value class prints its name and value, and <code>==</code> compares the values.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `@JvmInline
value class Meters(val value: Int)

@JvmInline
value class Minutes(val value: Int)

fun pace(distance: Meters, time: Minutes): Int {
    return distance.value / time.value
}

fun main() {
    val run = Meters(5000)
    val time = Minutes(25)
    println(pace(run, time))
    println(run)
}`,
            predict: {
              q: 'What does <code>println(run)</code> on the last line print?',
              options: ['<code>Meters(value=5000)</code>', '<code>5000</code>', '<code>Meters@1b6d3586</code>'],
              a: 0,
              why: 'Like a data class, a value class prints its name and the value inside.',
            },
            frames: [
              { line: [1, 2], say: '<code>@JvmInline value class</code>: a new type, <code>Meters</code>, around one Int.' },
              { line: [4, 5], say: 'A second type around an Int. To Kotlin, <code>Meters</code> and <code>Minutes</code> can’t be swapped for each other.' },
              { line: 12, vars: { run: 'Meters(value=5000)' }, say: 'Wrap 5000 as a distance.' },
              { line: 13, vars: { time: 'Minutes(value=25)' }, say: 'Wrap 25 as a time.' },
              { line: [14, 8], out: '200', say: 'The types match the parameters, so this compiles. <code>.value</code> reads the Int inside.' },
              { line: 14, say: `Swapped, <code>pace(time, run)</code> stops with <code>Argument type mismatch: actual type is 'Minutes', but 'Meters' was expected.</code>` },
              { line: 15, out: 'Meters(value=5000)', say: 'It prints like a data class. Until now it was a plain Int; to print it, Kotlin wraps it in a Meters object for a moment.' },
            ],
          });
        },
        code: `@JvmInline
value class Email(val text: String)

fun send(to: Email, subject: String) {
    println("To \${to.text}: $subject")
}

fun main() {
    send(Email("ada@example.com"), "Hello")   // To ada@example.com: Hello
    // send("Hello", ...) won't compile: a String is not an Email
}`,
        play: `@JvmInline
value class Celsius(val degrees: Double)

@JvmInline
value class Fahrenheit(val degrees: Double)

fun toFahrenheit(c: Celsius): Fahrenheit {
    return Fahrenheit(c.degrees * 9 / 5 + 32)
}

fun main() {
    val today = Celsius(20.0)
    println(toFahrenheit(today))
    // Try toFahrenheit(Fahrenheit(70.0)) and read the error.
}`,
        remember: '@JvmInline value class Meters(val value: Int): its own type while you code, usually a plain Int while it runs.',
        mistakes: [
          { title: 'Leaving out @JvmInline', bad: `value class Grams(val amount: Int)   // error`, good: `@JvmInline
value class Grams(val amount: Int)`, why: `On Android and the JVM, Kotlin says <code>Value classes without '@JvmInline' annotation are not yet supported.</code>` },
        ],
        terms: [
          { term: 'value class', def: 'A class around exactly one <code>val</code>. It is its own type while you write code, and the plain value while the program runs.' },
          { term: 'annotation', def: 'A note for the compiler, written with <code>@</code> before a name, like <code>@JvmInline</code>.' },
          { term: '@JvmInline', def: 'The annotation a value class needs on Android: store it as the plain value inside.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>UserId</code> its own type around an Int, at no extra cost.', code: `@[[JvmInline]]
[[value]] class UserId(val id: Int)

fun greet(user: UserId) {
    println(user.id)
}`, why: 'The annotation <code>@JvmInline</code> and the word <code>value</code> before <code>class</code>.' },
          { type: 'bug', prompt: `Kotlin says <code>Value class primary constructor must only have final read-only ('val') property parameters.</code> Tap the line to fix.`, code: `@JvmInline
value class Grams(var amount: Int)

fun main() {
    val flour = Grams(500)
    println(flour.amount)
}`, bug: 1, fix: 'value class Grams(val amount: Int)', why: 'The value inside a value class can’t change, so it must be a <code>val</code>. Then it prints <code>500</code>.' },
        ],
        quiz: [
          { q: 'Why use <code>value class Meters(val value: Int)</code> instead of a plain <code>Int</code>?', options: ['Kotlin catches a <code>Minutes</code> passed where <code>Meters</code> is wanted', 'It makes the number bigger', 'It lets the value change'], a: 0, why: 'Each value class is its own type, so mixing them up doesn’t compile.' },
          { q: 'Which line compiles?', options: ['<code>@JvmInline value class Grams(val amount: Int)</code>', '<code>@JvmInline value class Point(val x: Int, val y: Int)</code>', '<code>@JvmInline value class Grams(var amount: Int)</code>'], a: 0, why: 'One property, and a <code>val</code>. With two, Kotlin says <code>Inline class must have exactly one primary constructor parameter.</code> (an older name for a value class).' },
          { q: 'While the program runs, what is a <code>Meters(5000)</code> usually stored as?', options: ['The plain Int 5000', 'An object holding one Int', 'A String'], a: 0, why: 'That’s the point of a value class: the safety is checked while compiling, and no extra object is made.' },
        ],
        docs: [['Inline value classes', 'https://kotlinlang.org/docs/inline-classes.html']],
      },
      {
        id: 'sequences',
        title: 'Sequences',
        tagline: 'Do the work one item at a time, and only as much as needed.',
        goals: ['Explain how a chain on a sequence differs from one on a list', 'Turn a list into a sequence with <code>asSequence</code>, and back with <code>toList</code>', 'Tell when a sequence saves work'],
        level: 'intermediate', introduces: ['asSequence', 'toList', 'Sequence'],
        body: `
<p>You have a million numbers and want the first square bigger than 50. With <code>map</code> and <code>filter</code> on a list, <code>map</code> first squares all million numbers into a new list of a million, and only then does <code>filter</code> look through it. You needed 8 of them.</p>
<p>A list chain works step by step: each step finishes the whole list before the next step starts. A <code>Sequence</code> turns that around. It takes one item through all the steps, then the next item, and it stops as soon as it has what you asked for. <code>asSequence()</code> turns a list or a range into a sequence, and the steps (<code>map</code>, <code>filter</code>...) are written the same way as on a list.</p>
<p>A sequence is <code>lazy</code>, like <code>by lazy</code>: nothing runs until something asks for a result. A final step such as <code>first()</code>, <code>sum()</code> or <code>toList()</code> asks, and only then does the work start. <code>toList()</code> collects whatever comes out into a normal list.</p>
<p>When does it help? With many items, several steps, and above all when you need only the first few results. For a short list, a plain list chain is fine, and often a little faster.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `fun main() {
    val result = listOf(1, 2, 3, 4)
        .asSequence()
        .map {
            println("map $it")
            it * 10
        }
        .filter {
            println("filter $it")
            it > 15
        }
        .first()
    println(result)
}`,
            predict: {
              q: 'How many times does <code>map</code> run before <code>first()</code> has its answer?',
              options: ['2', '4', '1'],
              a: 0,
              why: 'Item 1 fails the filter, item 2 passes, and <code>first()</code> stops there. Items 3 and 4 are never touched.',
            },
            frames: [
              { line: [2, 3], say: '<code>asSequence()</code>: from here on, items go through the steps one at a time.' },
              { line: [4, 8], say: 'The steps are only set up. Nothing has run yet.' },
              { line: 12, say: '<code>first()</code> asks for a result. Now the work starts, with item 1.' },
              { line: 5, out: 'map 1', say: 'Item 1 goes through <code>map</code> and becomes 10...' },
              { line: 9, out: 'filter 10', say: '...and straight on to <code>filter</code>. 10 is not over 15, so it is dropped.' },
              { line: 5, out: 'map 2', say: 'Next, item 2 goes through <code>map</code>: 20.' },
              { line: 9, out: 'filter 20', say: '20 passes, and <code>first()</code> has its answer. Items 3 and 4 never run.' },
              { line: 13, out: '20', say: 'Without <code>asSequence()</code>, the list would print all four <code>map</code> lines first, then all four <code>filter</code> lines.' },
            ],
          });
        },
        code: `fun main() {
    val words = listOf("tea", "milk", "bread", "jam")
    val lengths = words.asSequence()
        .map { it.length }
        .filter { it > 3 }
        .toList()
    println(lengths)   // [4, 5]
}`,
        play: `fun main() {
    var work = 0
    val firstBig = (1..1000000).asSequence()
        .map {
            work += 1
            it * it
        }
        .filter { it > 50 }
        .first()
    println(firstBig)
    println("map ran $work times")
    // Delete .asSequence() and run again: compare the count.
}`,
        remember: 'A list chain does each step for all items; a sequence takes one item through all steps, and only when a final step like first() or toList() asks.',
        mistakes: [
          { title: 'Forgetting the final step', bad: `val big = listOf(1, 2, 3).asSequence()
    .map {
        println("working")
        it * 2
    }
println(big)   // kotlin.sequences.TransformingSequence@53d8d10a`, good: `println(big.toList())   // working (3 times), then [2, 4, 6]`, why: 'Without a final step nothing runs, not even <code>println("working")</code>. Printing the sequence shows its type and a code number, not the items.' },
        ],
        terms: [
          { term: 'Sequence', def: 'A chain of steps that takes one item through all of them before the next item, and only when a result is asked for.' },
          { term: 'lazy', def: 'Waiting to do work until the result is needed, like <code>by lazy</code> and sequences.' },
          { term: 'final step', def: 'A call like <code>first()</code>, <code>sum()</code> or <code>toList()</code> that asks a sequence for a result and makes the work happen.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Work through the words one at a time, then collect the result into a list.', code: `val words = listOf("tea", "milk", "bread")
val lengths = words.[[asSequence]]()
    .map { it.length }
    .filter { it > 3 }
    .[[toList]]()`, why: '<code>asSequence()</code> starts the one-at-a-time chain; <code>toList()</code> is the final step that runs it and collects the results.' },
          { type: 'bug', prompt: `Kotlin says <code>Unresolved reference 'size'.</code> A sequence doesn’t know its size until it has run. Tap the line to fix.`, code: `fun main() {
    val evens = listOf(1, 2, 3, 4).asSequence()
        .filter { it % 2 == 0 }
    println(evens.size)
}`, bug: 3, fix: '    println(evens.toList().size)', why: '<code>toList()</code> runs the sequence and gives a list, and a list has a <code>size</code>. It prints <code>2</code>.' },
        ],
        quiz: [
          { q: 'A sequence chain has <code>map</code> and <code>filter</code> but no final step. How many times does <code>map</code> run?', options: ['0', 'Once per item', 'Once'], a: 0, why: 'A sequence is lazy: nothing runs until a final step asks for a result.' },
          { q: 'On a list, <code>listOf(1, 2, 3).map { ... }.filter { ... }</code>: what happens first?', options: ['<code>map</code> runs on all three items, then <code>filter</code>', '<code>map</code> and <code>filter</code> on item 1, then on item 2...'], a: 0, why: 'A list chain finishes each step for the whole list before the next step. The other order is what a sequence does.' },
          { q: 'When does <code>asSequence()</code> help most?', options: ['Many items, several steps, and you need only the first few results', 'A list of three items', 'When you want the items in reverse order'], a: 0, why: 'Then the sequence can stop early and skip most of the work.' },
        ],
        docs: [['Sequences', 'https://kotlinlang.org/docs/sequences.html'], ['Sequence processing example', 'https://kotlinlang.org/docs/sequences.html#sequence-processing-example']],
      },

      {
        id: 'generators',
        title: 'Building sequences',
        tagline: 'Write a sequence step by step with sequence { } and yield.',
        goals: ['Build your own sequence with <code>sequence { }</code> and <code>yield</code>', 'Explain how the block pauses after each <code>yield</code>', 'Take a few items from a sequence that never ends, with <code>take</code>'],
        level: 'intermediate', introduces: ['sequence', 'yield', 'take'],
        body: `
<p>Some lists have no end: all even numbers, the Fibonacci numbers (0, 1, 1, 2, 3, 5...: each is the sum of the two before), a fresh puzzle each time someone asks. They can’t be a list, because the list would never be finished. They can be a sequence, because a sequence makes its items only when they are asked for.</p>
<p><code>sequence { ... }</code> builds a sequence from a block of code. Inside it, <code>yield(x)</code> hands out one item. Then the block pauses right there, remembering where it was and the values of its variables. When the next item is asked for, it carries on from that point until the next <code>yield</code>.</p>
<p>So an endless loop inside is fine. A <code>while (true)</code> loop that yields <code>n</code> and then adds 2 runs only as far as someone asks. <code>take(5)</code> asks for at most five items, and <code>toList()</code> collects them: <code>[0, 2, 4, 6, 8]</code>. Ask an endless sequence for everything, with <code>toList()</code> and no <code>take</code>, and the program never finishes.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `val steps = sequence {
    println("making 1")
    yield(1)
    println("making 2")
    yield(2)
    println("making 3")
    yield(3)
}

fun main() {
    for (n in steps.take(2)) {
        println("got $n")
    }
}`,
            predict: {
              q: 'The loop takes 2 items. Does <code>making 3</code> ever print?',
              options: ['No', 'Yes, at the very start', 'Yes, at the end'],
              a: 0,
              why: '<code>take(2)</code> stops after two items, so the block never gets past <code>yield(2)</code>.',
            },
            frames: [
              { line: 1, say: 'A sequence built from a block. Nothing in the block has run yet.' },
              { line: 11, say: 'The loop asks for the first item.' },
              { line: 2, out: 'making 1', say: 'The block starts at the top...' },
              { line: [3, 12], out: 'got 1', say: '<code>yield(1)</code> hands 1 to the loop, and the block pauses right here.' },
              { line: 4, out: 'making 2', say: 'The loop asks again. The block carries on just after <code>yield(1)</code>.' },
              { line: [5, 12], out: 'got 2', say: '<code>yield(2)</code>: the second item, and another pause.' },
              { line: 11, say: '<code>take(2)</code> has its two items, so the loop ends. The block stays paused: <code>making 3</code> never prints.' },
            ],
          });
        },
        code: `fun main() {
    val evens = sequence {
        var n = 0
        while (true) {
            yield(n)
            n += 2
        }
    }
    println(evens.take(5).toList())   // [0, 2, 4, 6, 8]
}`,
        play: `// Fibonacci numbers: 0, 1, 1, 2, 3, 5... each is the sum of the two before.
fun main() {
    val fibonacci = sequence {
        var a = 0
        var b = 1
        while (true) {
            yield(a)
            val next = a + b
            a = b
            b = next
        }
    }
    println(fibonacci.take(10).toList())
    // Change 10 to 20. The sequence never ends: take decides how many you get.
}`,
        remember: 'sequence { yield(x) } hands out x and pauses until the next item is asked for. take(n) gets at most n items.',
        mistakes: [
          { title: 'Asking an endless sequence for everything', bad: `println(evens.toList())   // never finishes`, good: `println(evens.take(5).toList())`, why: '<code>toList()</code> keeps asking for items until there are no more, and an endless sequence always has more. Use <code>take</code> first.' },
        ],
        terms: [
          { term: 'sequence { }', def: 'Builds a sequence from a block of code that hands out items with <code>yield</code>.' },
          { term: 'yield', def: 'Inside <code>sequence { }</code>: hand out one item, then pause until the next one is asked for.' },
          { term: 'take', def: '<code>take(n)</code> gives at most the first n items, so even an endless sequence can end.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build a sequence of days and get the first two.', code: `fun main() {
    val days = [[sequence]] {
        [[yield]]("Mon")
        yield("Tue")
        yield("Wed")
    }
    println(days.[[take]](2).toList())   // [Mon, Tue]
}`, why: '<code>sequence { }</code> builds it, <code>yield</code> hands out each day, and <code>take(2)</code> stops after two.' },
          { type: 'bug', prompt: 'This should print the three ticks, but it prints a long, strange name instead. Tap the line to fix.', code: `fun main() {
    val ticks = sequence {
        for (i in 1..3) {
            yield("tick $i")
        }
    }
    println(ticks)
}`, bug: 6, fix: '    println(ticks.toList())', why: 'Printing a sequence doesn’t run it. <code>toList()</code> does, and prints <code>[tick 1, tick 2, tick 3]</code>.' },
        ],
        quiz: [
          { q: 'What happens right after <code>yield(x)</code> inside <code>sequence { }</code>?', options: ['The block pauses until the next item is asked for', 'The block ends', 'The block starts again from the top'], a: 0, why: 'It remembers its place and its variables, and carries on from there next time.' },
          { q: '<code>evens</code> is the endless sequence 0, 2, 4, 6... What is <code>evens.take(3).toList()</code>?', options: ['<code>[0, 2, 4]</code>', '<code>[2, 4, 6]</code>', 'It never finishes'], a: 0, why: '<code>take(3)</code> asks for the first three items, then stops.' },
          { q: 'Which line never finishes, on the endless <code>evens</code>?', options: ['<code>evens.toList()</code>', '<code>evens.take(3).toList()</code>', '<code>evens.first()</code>'], a: 0, why: '<code>first()</code> needs one item and <code>take(3)</code> three, but <code>toList()</code> wants them all.' },
        ],
        docs: [['Sequences: from chunks', 'https://kotlinlang.org/docs/sequences.html#from-chunks'], ['sequence()', 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/sequence.html']],
      },

      {
        id: 'dsl',
        title: 'Building a DSL',
        tagline: 'Lambdas with a receiver let code read like a description.',
        goals: ['Read a function type with a receiver, like <code>Menu.() -> Unit</code>', 'Write a builder function that sets up an object from a lambda', 'Explain why such a builder is type-safe'],
        level: 'intermediate', introduces: [],
        body: `
<p>With <code>apply</code> you can set up an object without repeating its name: inside the braces, <code>name = "Lin"</code> means <code>ticket.name = "Lin"</code>. Code written like that reads like a description, not like a list of steps. Android screens and build files are written in this style, and you can make functions that work this way yourself.</p>
<p>The trick is the parameter type <code>build: Menu.() -> Unit</code>. A plain <code>(Menu) -> Unit</code> lambda gets the menu as <code>it</code>. <code>Menu.() -> Unit</code> is a <code>lambda with receiver</code>: inside it, the Menu is <code>this</code>, as in an extension function, so you write <code>item("Soup")</code> instead of <code>it.item("Soup")</code>. To run it, the function needs a Menu to run it on: <code>m.build()</code>.</p>
<p>Put together, <code>fun menu(build: Menu.() -> Unit): Menu</code> makes a Menu, runs the lambda on it, and gives it back. With a trailing lambda, the call reads <code>menu { item("Soup") }</code>. A function like this is a <code>builder</code>. A set of builders is a <code>DSL</code> (domain-specific language): a small language for one job, made of Kotlin code.</p>
<p>It is still Kotlin, with all its checks. Inside the menu block, only what <code>Menu</code> has is available: <code>item(5)</code> or <code>dessert("Cake")</code> doesn’t compile. That’s why these are called <code>type-safe builders</code>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Menu {
    val items = mutableListOf<String>()

    fun item(name: String) {
        items.add(name)
    }
}

fun menu(build: Menu.() -> Unit): Menu {
    val m = Menu()
    m.build()
    return m
}

fun main() {
    val lunch = menu {
        item("Soup")
        item("Salad")
    }
    println(lunch.items)
}`,
            predict: {
              q: 'What does the last line print?',
              options: ['<code>[Soup, Salad]</code>', '<code>[]</code>', 'Nothing: <code>item</code> isn’t known inside <code>main</code>'],
              a: 0,
              why: 'Inside the lambda, the Menu is <code>this</code>, so <code>item(...)</code> calls that menu’s own function.',
            },
            frames: [
              { line: 9, say: '<code>Menu.() -> Unit</code>: a lambda that will run with a Menu as <code>this</code>.' },
              { line: 16, say: 'Call <code>menu</code> with a trailing lambda. The lambda is handed over, not run yet.' },
              { line: 10, vars: { 'm.items': '[]' }, say: 'A new, empty Menu.' },
              { line: [11, 17], vars: { 'm.items': '[Soup]' }, say: '<code>m.build()</code> runs the lambda with <code>m</code> as <code>this</code>. So <code>item("Soup")</code> means <code>m.item("Soup")</code>.' },
              { line: 18, vars: { 'm.items': '[Soup, Salad]' }, say: 'The same for Salad.' },
              { line: [12, 16], vars: { lunch: 'the filled Menu' }, say: 'The filled menu comes back and is stored in <code>lunch</code>.' },
              { line: 20, out: '[Soup, Salad]', say: 'The code in <code>main</code> reads like a description of the menu.' },
            ],
          });
        },
        code: `class Email {
    var to = ""
    var subject = ""

    fun show() {
        println("To: $to | $subject")
    }
}

fun email(build: Email.() -> Unit): Email {
    val e = Email()
    e.build()
    return e
}

fun main() {
    val invite = email {
        to = "ada@example.com"
        subject = "Lunch on Friday?"
    }
    invite.show()   // To: ada@example.com | Lunch on Friday?
}`,
        play: `class Section(val title: String) {
    val items = mutableListOf<String>()

    fun item(name: String) {
        items.add(name)
    }
}

class Shopping {
    val sections = mutableListOf<Section>()

    fun section(title: String, build: Section.() -> Unit) {
        val s = Section(title)
        s.build()
        sections.add(s)
    }
}

fun shopping(build: Shopping.() -> Unit): Shopping {
    val list = Shopping()
    list.build()
    return list
}

fun main() {
    val week = shopping {
        section("Fruit") {
            item("apples")
            item("pears")
        }
        section("Bakery") {
            item("bread")
        }
    }
    for (s in week.sections) {
        println("\${s.title}: \${s.items}")
    }
    // Add a "Dairy" section with two items.
}`,
        remember: 'Type.() -> Unit is a lambda with receiver: inside it, the object is this. A builder makes the object, runs the lambda on it, and gives it back.',
        mistakes: [
          { title: 'Forgetting to run the lambda', bad: `fun menu(build: Menu.() -> Unit): Menu {
    val m = Menu()
    return m   // the lambda never runs: lunch.items is []
}`, good: `fun menu(build: Menu.() -> Unit): Menu {
    val m = Menu()
    m.build()
    return m
}`, why: 'Taking the lambda as a parameter doesn’t run it. <code>m.build()</code> does, with <code>m</code> as <code>this</code>.' },
        ],
        terms: [
          { term: 'lambda with receiver', def: 'A lambda of a type like <code>Menu.() -> Unit</code>. Inside it, the object it runs on is <code>this</code>.' },
          { term: 'builder', def: 'A function that makes an object, lets a lambda with receiver fill it in, and gives it back.' },
          { term: 'DSL', def: 'Domain-specific language: a small language for one job, here made of Kotlin builders.' },
          { term: 'type-safe', def: 'Checked by Kotlin before the program runs: a wrong type or an unknown function doesn’t compile.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the builder so that, inside the lambda, the Menu is <code>this</code>.', code: `fun menu(build: [[Menu]].() -> Unit): Menu {
    val m = Menu()
    m.[[build]]()
    return m
}`, why: '<code>Menu.() -> Unit</code> is a lambda with a Menu receiver, and <code>m.build()</code> runs it on <code>m</code>.' },
          { type: 'bug', prompt: `Kotlin says <code>Unresolved reference 'build'.</code> at <code>m.build()</code> and <code>Unresolved reference 'item'.</code> inside the menu block. One line fixes both. Tap it.`, code: `class Menu {
    val items = mutableListOf<String>()

    fun item(name: String) {
        items.add(name)
    }
}

fun menu(build: (Menu) -> Unit): Menu {
    val m = Menu()
    m.build()
    return m
}

fun main() {
    val lunch = menu {
        item("Soup")
    }
    println(lunch.items)
}`, bug: 8, fix: 'fun menu(build: Menu.() -> Unit): Menu {', why: 'A plain <code>(Menu) -> Unit</code> lambda gets the menu as <code>it</code>, not as <code>this</code>. With a receiver it prints <code>[Soup]</code>.' },
        ],
        quiz: [
          { q: 'Inside a <code>Menu.() -> Unit</code> lambda, what is <code>this</code>?', options: ['The Menu the lambda runs on', 'The lambda itself', 'Nothing: <code>this</code> only works inside a class'], a: 0, why: 'That’s what the receiver is: the object before the dot in <code>Menu.()</code>.' },
          { q: 'Which scope function you know takes a lambda with receiver?', options: ['<code>apply</code>', '<code>let</code>', '<code>also</code>'], a: 0, why: 'Inside <code>apply</code> (and <code>run</code>) the object is <code>this</code>. <code>let</code> and <code>also</code> use <code>it</code>.' },
          { q: '<code>Menu</code> has no <code>dessert</code> function. What happens with <code>menu { dessert("Cake") }</code>?', options: ['It doesn’t compile', 'It runs and skips that line', 'It crashes while running'], a: 0, why: `The builder is type-safe: Kotlin says <code>Unresolved reference 'dessert'.</code>` },
        ],
        docs: [['Type-safe builders', 'https://kotlinlang.org/docs/type-safe-builders.html'], ['Function literals with receiver', 'https://kotlinlang.org/docs/lambdas.html#function-literals-with-receiver']],
      },

      {
        id: 'errors',
        title: 'Result and error handling',
        tagline: 'A failure you expect can be an ordinary value.',
        goals: ['Turn an exception into a value with <code>runCatching</code>', 'Read a <code>Result</code> with <code>getOrDefault</code>, <code>onSuccess</code> and <code>onFailure</code>', 'Choose between throwing an exception and returning a <code>Result</code>'],
        level: 'intermediate', introduces: ['Result', 'runCatching', 'getOrNull', 'onSuccess', 'onFailure', 'fold'],
        body: `
<p>Turning typed text into a number fails a lot: people type “twelve”. <code>try</code>/<code>catch</code> handles it, but look at the function: <code>fun parseAge(text: String): Int</code> doesn’t say it can fail. Whoever calls it can forget the <code>try</code>, and the app crashes.</p>
<p><code>Result&lt;Int&gt;</code> is a box that holds either a success with an Int inside, or a failure with the exception inside. <code>runCatching { "42".toInt() }</code> runs the block. If it finishes, you get a success. If it throws, the exception is caught and you get a failure; nothing crashes. Printed, they look like <code>Success(42)</code> and <code>Failure(java.lang.NumberFormatException: For input string: "abc")</code>.</p>
<p>To get a value out, you must say what happens on failure. <code>getOrDefault(0)</code> gives the value, or 0. <code>getOrNull()</code> gives the value, or <code>null</code>. To react to a failure instead, <code>onFailure { }</code> runs its lambda only for a failure, with the exception as <code>it</code>, so <code>it.message</code> works. <code>onSuccess { }</code> is its partner for a success. Both give back the same Result, so you can chain them: <code>r.onSuccess { ... }.onFailure { ... }</code>.</p>
<p>Which one when? Return a <code>Result</code> when failing is a normal outcome that the caller should handle, like bad input or no network. Throw an exception when something is really wrong and the code can’t sensibly go on, like your own code passing in a negative age.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `fun main() {
    val good = runCatching { "42".toInt() }
    val bad = runCatching { "abc".toInt() }
    println(good)
    println(bad.getOrNull())
    println(bad.getOrDefault(0))
    bad.onFailure { println("Oops: \${it.message}") }
}`,
            predict: {
              q: 'What does <code>println(good)</code> print?',
              options: ['<code>Success(42)</code>', '<code>42</code>', '<code>true</code>'],
              a: 0,
              why: '<code>good</code> is a Result: a box around 42, and it prints as the box.',
            },
            frames: [
              { line: 2, vars: { good: 'Success(42)' }, say: '"42" turns into a number fine: a success with 42 inside.' },
              { line: 3, vars: { bad: 'Failure(NumberFormatException)' }, say: '<code>"abc".toInt()</code> throws. <code>runCatching</code> catches it and gives a failure. No crash.' },
              { line: 4, out: 'Success(42)', say: 'A Result prints as the box, not as the number.' },
              { line: 5, out: 'null', say: 'There is no value inside <code>bad</code>, so <code>getOrNull()</code> gives <code>null</code>.' },
              { line: 6, out: '0', say: '<code>getOrDefault(0)</code> gives the default instead.' },
              { line: 7, out: 'Oops: For input string: "abc"', say: 'Only failures run <code>onFailure</code>. <code>it</code> is the caught exception.' },
            ],
          });
        },
        code: `fun parseAge(text: String): Result<Int> {
    return runCatching { text.toInt() }
}

fun main() {
    parseAge("29")
        .onSuccess { println("Age: $it") }     // Age: 29
        .onFailure { println("Not a number") }
    val age = parseAge("twelve").getOrDefault(0)
    println(age)                                // 0
}`,
        play: `fun divide(a: Int, b: Int): Result<Int> {
    return runCatching { a / b }
}

fun main() {
    // Also useful: fold runs onSuccess or onFailure and gives back what that lambda returns.
    for (b in listOf(2, 0, 5)) {
        val message = divide(10, b).fold(
            onSuccess = { "10 / $b = $it" },
            onFailure = { "10 / $b failed: \${it.message}" }
        )
        println(message)
    }
    // Add another number to the list, or divide something other than 10.
}`,
        remember: 'runCatching { } turns a throw into a Result. Get the value out with getOrDefault or getOrNull, or react with onSuccess / onFailure.',
        mistakes: [
          { title: 'Using the Result as the value', bad: `val n: Int = runCatching { "5".toInt() }   // error`, good: `val n: Int = runCatching { "5".toInt() }.getOrDefault(0)`, why: `A Result is the box, not the number. Kotlin says <code>Initializer type mismatch: expected 'Int', actual 'Result&lt;Int&gt;'.</code>` },
        ],
        terms: [
          { term: 'Result', def: 'A box holding either a success with a value, or a failure with an exception: <code>Result&lt;Int&gt;</code>.' },
          { term: 'runCatching', def: 'Runs a block and gives back a <code>Result</code>: a success with its value, or a failure if it threw.' },
          { term: 'success / failure', def: 'The two cases of a Result. <code>onSuccess</code> runs only for a success, <code>onFailure</code> only for a failure.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn the text into a number without crashing, with 0 when it fails.', code: `fun main() {
    val r = [[runCatching]] { "7x".toInt() }
    println(r.[[getOrDefault]](0))   // 0
}`, why: '<code>runCatching</code> catches the exception, and <code>getOrDefault</code> picks the value or the fallback.' },
          { type: 'bug', prompt: `Kotlin says <code>Operator call is prohibited on a nullable receiver of type 'Int?'. Use '?.'-qualified call instead.</code> Tap the line to fix it so it prints 8.`, code: `fun main() {
    val r = runCatching { "7".toInt() }
    println(r.getOrNull() + 1)
}`, bug: 2, fix: '    println(r.getOrDefault(0) + 1)', why: '<code>getOrNull()</code> can give <code>null</code>, and you can’t add 1 to null. <code>getOrDefault(0)</code> always gives an Int.' },
        ],
        quiz: [
          { q: 'What does <code>runCatching { "abc".toInt() }</code> give?', options: ['A failure holding the exception', 'A crash', '<code>0</code>'], a: 0, why: 'The exception is caught and kept inside the Result. Printed: <code>Failure(java.lang.NumberFormatException: For input string: "abc")</code>.' },
          { q: 'Which gives the number inside <code>r</code>, or <code>-1</code> if it failed?', options: ['<code>r.getOrDefault(-1)</code>', '<code>r.getOrNull(-1)</code>', '<code>r.onFailure(-1)</code>'], a: 0, why: '<code>getOrNull()</code> takes no argument and gives null on failure; <code>onFailure</code> takes a lambda, not a number.' },
          { q: 'Your own code calls <code>setAge(-5)</code>, which should never happen. Throw an exception or return a Result?', options: ['Throw: it is a bug, not a normal outcome', 'Return a Result', 'Neither: print a message and carry on'], a: 0, why: 'A Result is for failures the caller should expect and handle. A bug should stop loudly so you find it.' },
        ],
        docs: [['Result', 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-result/'], ['runCatching', 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/run-catching.html']],
      },

      {
        id: 'java-interop',
        title: 'Calling Java',
        tagline: 'Kotlin and Java share one app. Mind the nulls at the border.',
        goals: ['Call Java code from Kotlin', 'Spot a platform type and give it a safe Kotlin type', 'Make a companion function easy to call from Java with <code>@JvmStatic</code>'],
        level: 'intermediate', introduces: ['JvmStatic', 'Nullable', 'NotNull'],
        body: `
<p>Android was first written in Java, an older language that runs side by side with Kotlin. Many libraries you’ll use are Java code, and one app can mix both. Kotlin calls Java directly: <code>System.getProperty("user.name")</code> calls a function from Java’s own library. It asks the running program for a named setting (here, the user’s name). If there is no such setting, it gives back <code>null</code>.</p>
<p>The catch is <code>null</code>. Java has no <code>String?</code>: any String from Java might be null, and Kotlin can’t tell. So it gets a <code>platform type</code>, shown in the editor as <code>String!</code>, meaning “might be null, I don’t know”. Kotlin then lets you use it either way, without <code>?.</code>. If it really is null, the program crashes with a <code>NullPointerException</code>.</p>
<p>The fix is to decide at the border. Write the type yourself: <code>val color: String? = System.getProperty("app.color")</code>, and from there Kotlin makes you handle null. Java code can help too, with annotations: a Java method marked <code>@Nullable</code> arrives in Kotlin as <code>String?</code>, one marked <code>@NotNull</code> as <code>String</code>.</p>
<p>It works the other way round as well: Java can call your Kotlin. A function in a <code>companion object</code> is called from Java as <code>Settings.Companion.load()</code>. Mark it <code>@JvmStatic</code>, and Java can write <code>Settings.load()</code>, the same as Kotlin does.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `fun main() {
    val user = System.getProperty("user.name")
    println(user.length > 0)
    val missing = System.getProperty("no.such.setting")
    println(missing)
    println(missing.length)
}`,
            predict: {
              q: 'Line 6 asks for the length of <code>missing</code>, which is <code>null</code>. What happens?',
              options: ['The program crashes with a NullPointerException', 'It prints <code>0</code>', 'It doesn’t compile'],
              a: 0,
              why: 'From Java, <code>missing</code> is a <code>String!</code>, so Kotlin lets the call through. While running it is null, and the call crashes.',
            },
            frames: [
              { line: 2, vars: { user: 'String! (your user name)' }, say: 'A Java function. Its String comes in as a platform type, <code>String!</code>.' },
              { line: 3, out: 'true', say: 'Here it isn’t null, so <code>.length</code> works.' },
              { line: 4, vars: { missing: 'null (String!)' }, say: 'No such setting: Java gives back <code>null</code>. Kotlin didn’t make <code>missing</code> a <code>String?</code>, because it couldn’t know.' },
              { line: 5, out: 'null', say: 'Printing null is fine.' },
              { line: 6, out: 'Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because "missing" is null', say: 'Asking null for its length crashes, with no warning before the program ran.' },
              { line: 4, say: 'The fix: <code>val missing: String? = ...</code>. Then line 6 doesn’t compile until you write <code>missing?.length</code>.' },
            ],
          });
        },
        code: `class Settings {
    companion object {
        @JvmStatic
        fun load(): String = "dark theme"
    }
}

// In Kotlin:  Settings.load()
// In Java:    Settings.load()             works, thanks to @JvmStatic
// Without it, Java must write Settings.Companion.load()`,
        play: `fun main() {
    val color: String? = System.getProperty("app.color")
    println(color ?: "no color set")
    println(color?.length)
    // Change String? to String on line 2 and run: now it crashes right on line 2, with a clear message.
}`,
        remember: 'A value from Java has a platform type (String!): give it a Kotlin type, String? if it might be null. @JvmStatic makes companion functions plain to call from Java.',
        mistakes: [
          { title: 'Trusting a platform type', bad: `val color: String = System.getProperty("app.color")   // crashes if not set`, good: `val color: String? = System.getProperty("app.color")`, why: 'If the setting is missing, Java gives back null, and the first line crashes with <code>NullPointerException: getProperty(...) must not be null</code>. Say <code>String?</code> when Java might give null.' },
        ],
        terms: [
          { term: 'Java', def: 'The older language Android was first written in. Kotlin and Java code can call each other in one app.' },
          { term: 'platform type', def: 'The type of a value from Java, shown as <code>String!</code>: Kotlin doesn’t know if it can be null.' },
          { term: '@Nullable / @NotNull', def: 'Annotations in Java code that tell Kotlin a value may be null (<code>String?</code>) or never is (<code>String</code>).' },
          { term: '@JvmStatic', def: 'On a function in a <code>companion object</code>: Java can call it as <code>Settings.load()</code> instead of <code>Settings.Companion.load()</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let Java call <code>Settings.load()</code> directly.', code: `class Settings {
    companion object {
        @[[JvmStatic]]
        fun load(): String = "dark theme"
    }
}`, why: '<code>@JvmStatic</code> makes Java see <code>load</code> as a function of <code>Settings</code> itself.' },
          { type: 'bug', prompt: `<code>Contacts</code> is a Java class in the same app. Its method is marked <code>@Nullable</code>, so Kotlin says <code>Only safe (?.) or non-null asserted (!!.) calls are allowed on a nullable receiver of type 'String?'.</code> Tap the line to fix.`, code: `// Java: @Nullable public static String findNickname(String name)
fun main() {
    val nick = Contacts.findNickname("Sam")
    println(nick.length)
}`, bug: 3, fix: '    println(nick?.length)', why: 'Thanks to <code>@Nullable</code>, <code>nick</code> is a real <code>String?</code>, so Kotlin asks for <code>?.</code>. Sam has no nickname, so it prints <code>null</code>.' },
        ],
        quiz: [
          { q: 'A Java method without annotations returns a String. What type does Kotlin see?', options: ['<code>String!</code>: might be null, might not', '<code>String</code>: never null', '<code>String?</code>: always nullable'], a: 0, why: 'That’s a platform type. Kotlin can’t know, so it leaves the choice to you.' },
          { q: 'A Java method is marked <code>@Nullable</code>. Its String arrives in Kotlin as...', options: ['<code>String?</code>', '<code>String</code>', '<code>String!</code>'], a: 0, why: 'With the annotation, Kotlin knows it may be null and checks your code for it.' },
          { q: 'Without <code>@JvmStatic</code>, how does Java call <code>load()</code> in <code>Settings</code>’s companion object?', options: ['<code>Settings.Companion.load()</code>', '<code>Settings.load()</code>', 'It can’t'], a: 0, why: 'Java sees the companion object as an object named <code>Companion</code> inside the class.' },
        ],
        docs: [['Java interop: null safety and platform types', 'https://kotlinlang.org/docs/java-interop.html#null-safety-and-platform-types'], ['Calling Kotlin from Java: static methods', 'https://kotlinlang.org/docs/java-to-kotlin-interop.html#static-methods']],
      },
    ],
  });
})();
