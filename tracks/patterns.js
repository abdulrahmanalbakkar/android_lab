/* Design patterns track. Same shape as tracks/kotlin.js.
   Each pattern shown the Kotlin way, with when to leave it out. Demos use the Lab.ui kit only. */
(() => {
  Lab.addTrack({
    id: 'patterns',
    title: 'Design patterns',
    description: 'Named answers to problems that keep coming back, written the Kotlin way, and when to leave them out.',
    group: 'Foundations', requires: ['solid'],
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'what-patterns',
        title: 'What a design pattern is',
        tagline: 'Good answers to problems that keep coming back, with names.',
        goals: ['Explain what a design pattern is, and what it is not', 'Spot a pattern you already used in Kotlin', 'Decide when plain code is the better choice'],
        level: 'beginner', introduces: [],
        body: `
<p>Two developers talk about a bug. One says: “I made one settings object that every screen shares, so nobody can make a second one by mistake.” The other says: “Ah, a singleton.” One word did the work of a whole sentence. Programmers keep meeting the same problems, so the good answers got names.</p>
<p>A <b>design pattern</b> is a named, well-tested shape of code for a problem that keeps coming up: which classes there are, who knows whom, and who calls what. It is not a library you download, and not code to paste. It is more like a recipe: you adapt it to your own program. Most of the names come from a 1994 book on object-oriented design, and developers still use them every day.</p>
<p>You already know some. <code>object</code> from the Kotlin track is the Singleton pattern. The lambda you hand to <code>sortedBy { }</code> is the Strategy pattern. Kotlin builds several patterns right into the language, so in Kotlin they are often only a few lines long.</p>
<p>A pattern also costs something: more classes, more names, more to read. It pays off only when its problem is really in your code, like the same <code>when</code> copied into five places. “Just in case” is not a reason. Each lesson in this track starts with the problem, then shows the pattern that fixes it, and ends with when to leave it out.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'p1', label: 'One settings store<small>shared by every screen</small>', x: 24, y: 12, tone: 'muted' },
              { id: 'p2', label: 'Many parts react<small>when the cart changes</small>', x: 24, y: 38, tone: 'muted' },
              { id: 'p3', label: 'Price rule changes<small>every month</small>', x: 24, y: 64, tone: 'muted' },
              { id: 'p4', label: 'Add two numbers<small>and print them</small>', x: 24, y: 90, tone: 'muted' },
              { id: 'n1', label: 'Singleton', x: 78, y: 12, hidden: true },
              { id: 'n2', label: 'Observer', x: 78, y: 38, hidden: true },
              { id: 'n3', label: 'Strategy', x: 78, y: 64, hidden: true },
              { id: 'n4', label: 'No pattern<small>plain code</small>', x: 78, y: 90, tone: 'ok', hidden: true },
            ],
            predict: {
              q: 'The last problem: a program adds two numbers and prints the result. Which pattern does it need?',
              options: ['Singleton', 'Strategy', 'None: plain code is enough'],
              a: 2,
              why: 'There is no recurring problem to solve. A pattern would only add classes to read.',
            },
            frames: [
              { say: 'Four problems from real programs. The first three show up in program after program.' },
              { show: ['n1'], hl: ['p1', 'n1'], add: [['p1', 'n1', '', 'accent']], say: 'Exactly one of something, reachable from everywhere. So common that its answer has a name: Singleton.' },
              { show: ['n2'], hl: ['p2', 'n2'], add: [['p2', 'n2', '', 'accent']], say: 'Many parts must hear when one thing changes: Observer.' },
              { show: ['n3'], hl: ['p3', 'n3'], add: [['p3', 'n3', '', 'accent']], say: 'Swap how one job is done without rewriting the code around it: Strategy.' },
              { show: ['n4'], hl: ['p4', 'n4'], add: [['p4', 'n4', '', 'ok']], say: 'Adding two numbers needs no pattern. Plain code is the right answer here.' },
              { hl: ['n1', 'n2', 'n3'], say: 'A name is a shortcut. Say “Observer”, and another developer pictures the whole shape at once.' },
            ],
          });
        },
        code: `// You already used a pattern in the Kotlin track.
// "Exactly one, shared by everyone" has a name: Singleton.
object Settings {
    var darkMode = false
}

fun main() {
    Settings.darkMode = true
    println(Settings.darkMode)   // true
}`,
        play: `// The same job, written two ways.

// 1. With a pattern it doesn't need: an interface and two classes.
interface TotalRule {
    fun total(prices: List<Int>): Int
}

class AddEverything : TotalRule {
    override fun total(prices: List<Int>) = prices.sum()
}

class Receipt(val rule: TotalRule) {
    fun print(prices: List<Int>) {
        println("Total: \${rule.total(prices)}")
    }
}

// 2. Plain code.
fun printTotal(prices: List<Int>) {
    println("Total: \${prices.sum()}")
}

fun main() {
    val prices = listOf(4, 6, 10)
    Receipt(AddEverything()).print(prices)
    printTotal(prices)
    // Both print the same. Count the lines each one needs.
    // The pattern only pays off once there are several rules to swap between.
}`,
        remember: 'A design pattern is a named answer to a common problem. Use it when you have that problem, not just in case.',
        terms: [
          { term: 'design pattern', def: 'A named, well-tested shape of code for a problem that keeps coming up. You adapt it to your program; it is not a library.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Kotlin gives the Singleton pattern its own keyword. Use it so there is exactly one Settings.', code: `[[object]] Settings {
    var darkMode = false
}

fun main() {
    [[Settings]].darkMode = true
}`, why: '<code>object</code> makes the one and only Settings, and you use it by its name.' },
          { type: 'bug', prompt: 'Kotlin says <code>\'total\' hides member of supertype \'TotalRule\' and needs an \'override\' modifier.</code> Tap the line.', code: `interface TotalRule {
    fun total(prices: List<Int>): Int
}

class AddEverything : TotalRule {
    fun total(prices: List<Int>) = prices.sum()
}`, bug: 5, fix: '    override fun total(prices: List<Int>) = prices.sum()', why: 'Patterns are built from things you know, like interfaces. A function that keeps an interface’s promise needs <code>override</code>.' },
        ],
        quiz: [
          { q: 'What is a design pattern?', options: ['A named, well-tested shape of code for a problem that keeps coming up', 'A library you download and add to your program', 'A rule every program must follow'], a: 0, why: 'It is an idea with a name. You write the code yourself, shaped to your program.' },
          { q: 'When is a pattern worth adding?', options: ['When the problem it solves is really in your code', 'Always, just in case', 'Only in programs with more than ten classes'], a: 0, why: 'A pattern adds classes and names. That only pays off when it removes a real problem.' },
          { q: 'Which Kotlin keyword already gives you the Singleton pattern?', options: ['<code>object</code>', '<code>class</code>', '<code>val</code>'], a: 0, why: '<code>object</code> makes exactly one, reachable by its name from everywhere.' },
        ],
        docs: [['Kotlin idioms', 'https://kotlinlang.org/docs/idioms.html']],
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'singleton',
        title: 'Singleton',
        tagline: 'Exactly one, shared by everyone, and the dangers that come with it.',
        goals: ['Spot the bug that two copies of one thing cause', 'Make a singleton with <code>object</code>', 'Name the dangers of global state, and when to pass an object in instead'],
        level: 'intermediate', introduces: [],
        body: `
<p>A game has a mute button in its menu. The menu makes a <code>Sound()</code> object, and the game makes its own <code>Sound()</code>. The player taps mute, and every jump still goes “Boing!”. There are two Sound objects, and only the menu’s one was muted.</p>
<p>The <b>Singleton</b> pattern says: this type has exactly one object, and every part of the program reaches that same one. Many languages need a page of code for it. In Kotlin it is the <code>object</code> you already know: <code>object Sound { var muted = false }</code>. The menu writes <code>Sound.muted = true</code>, the game reads <code>Sound.muted</code>, and there is no second Sound to make by mistake.</p>
<p>The danger is that a singleton is <b>global state</b>: every function can reach it and change it, without saying so. A function called <code>sneaky()</code> may set the volume to 0, and nothing in its name or its parameters warns you. When something goes wrong, the cause could be anywhere. And the object keeps its values for as long as the program runs, so a change from one part leaks into every other part.</p>
<p>When not to use it: when there could ever be more than one (players, songs, orders), or when “only one” is true just for now. Then write a normal class, make one object in <code>main</code>, and pass it to whoever needs it, as dependency inversion showed in SOLID. Keep singletons for things that really exist once and hold little changing state.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Sound {
    var muted = false
}

fun main() {
    val menuSound = Sound()
    val gameSound = Sound()
    menuSound.muted = true
    println(menuSound.muted)
    println(gameSound.muted)
}`,
            predict: {
              q: 'The menu mutes its sound. What does the last line, <code>println(gameSound.muted)</code>, print?',
              options: ['<code>true</code>', '<code>false</code>'],
              a: 1,
              why: 'There are two Sound objects. Muting one leaves the other one loud.',
            },
            frames: [
              { line: 1, say: 'A class: a plan. Every Sound starts with <code>muted = false</code>.' },
              { line: 6, vars: { 'menuSound.muted': 'false' }, say: 'The menu makes its own Sound object.' },
              { line: 7, vars: { 'gameSound.muted': 'false' }, say: 'The game makes another one. Now there are two.' },
              { line: 8, vars: { 'menuSound.muted': 'true' }, say: 'The player taps mute in the menu. Only the menu’s object changes.' },
              { line: 9, out: 'true', say: 'The menu thinks the sound is off.' },
              { line: 10, out: 'false', say: 'The game still plays sound. The fix: <code>object Sound</code>, so there is only one Sound to change.' },
            ],
          });
        },
        code: `object Sound {
    var muted = false
}

fun menuMute() {
    Sound.muted = true
}

fun playJump() {
    println(if (Sound.muted) "(silence)" else "Boing!")
}

fun main() {
    playJump()   // Boing!
    menuMute()
    playJump()   // (silence)
}`,
        play: `object Volume {
    var level = 5

    fun up() {
        if (level < 10) {
            level++
        }
    }
}

fun menu() {
    Volume.up()
    Volume.up()
}

fun game() {
    println("Game plays at volume \${Volume.level}")
}

fun sneaky() {
    Volume.level = 0   // nothing in its name says it touches the volume
}

fun main() {
    menu()
    game()
    sneaky()
    game()
    // Every function can reach Volume, so any of them can change it.
    // Delete the line sneaky() in main and run it again.
}`,
        remember: 'object makes a singleton: one object for everyone. Handy, but any code can change it, so keep it for things that truly exist once.',
        mistakes: [
          { title: 'A singleton for something there are many of', bad: `object Player {
    var score = 0
}

Player.score += 10      // Ada scores
println(Player.score)   // Sam's turn: 10 already`, good: `class Player(val name: String) {
    var score = 0
}

val ada = Player("Ada")
val sam = Player("Sam")
ada.score += 10
println(sam.score)   // 0`, why: 'A two-player game has two players. With <code>object</code> there is only one, so they share a score. Use a class and make one object per player.' },
        ],
        terms: [
          { term: 'singleton', def: 'A design pattern: a type with exactly one object, which every part of the program reaches. In Kotlin: <code>object</code>.' },
          { term: 'global state', def: 'Values that any part of the program can read and change, like the <code>var</code> properties of a singleton.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make sure the whole game shares one Sound.', code: `[[object]] Sound {
    var muted = false
}

fun mute() {
    [[Sound]].muted = true
}`, why: '<code>object</code> makes the single Sound, and every function reaches it by its name.' },
          { type: 'bug', prompt: 'Kotlin says <code>Unresolved reference \'muted\'.</code> on both lines in <code>main</code>. There should be exactly one Settings. Tap the line to change.', code: `class Settings {
    var muted = false
}

fun main() {
    Settings.muted = true
    println(Settings.muted)
}`, bug: 0, fix: 'object Settings {', why: 'With <code>class</code>, Settings is only a plan: <code>Settings.muted</code> has no object to belong to. <code>object</code> makes the one Settings that the name stands for.' },
        ],
        quiz: [
          { q: 'The menu and the game each write <code>Sound()</code> for a <code>class Sound</code>. How many Sound objects are there?', options: ['Two', 'One', 'None'], a: 0, why: 'Every <code>Sound()</code> makes a new object. That is how the mute bug happens.' },
          { q: 'What is the biggest danger of a singleton with <code>var</code> properties?', options: ['Any function can change it without saying so', 'It makes the program slower', 'It can’t have functions'], a: 0, why: 'It is global state. A change can come from anywhere, which makes bugs hard to find.' },
          { q: 'A chat app shows many messages. Should <code>Message</code> be an <code>object</code>?', options: ['No: there are many messages, so it is a class', 'Yes: every app needs singletons'], a: 0, why: 'A singleton is for something that exists once. Many messages means many objects.' },
        ],
        docs: [['Object declarations', 'https://kotlinlang.org/docs/object-declarations.html']],
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'factory',
        title: 'Factory',
        tagline: 'One function decides which object to make.',
        goals: ['Recognise creation code that is copied in many places', 'Write a factory function that gives back an interface type', 'Add a new kind of object by changing one place'],
        level: 'intermediate', introduces: [],
        body: `
<p>A game reads its levels from a file: “bat, slime, ghost”. The code has to turn each word into an enemy object. Without a plan, the same <code>when (kind) { "bat" -&gt; Bat() ... }</code> gets copied into the level loader, the map editor and the tutorial. Add a new enemy, and you must find every copy. Miss one, and the new enemy is missing there.</p>
<p>The <b>Factory</b> pattern puts the creating in one place: a function that takes what you know, such as a word, and gives back a ready object. Its return type is the interface, <code>Enemy</code>, not <code>Bat</code> or <code>Slime</code>. Callers don’t need to know which classes exist: they ask for “bat” and get something that can <code>attack()</code>.</p>
<p><code>fun makeEnemy(kind: String): Enemy? = when (kind) { ... }</code>. For a word it doesn’t know, it gives back <code>null</code>, and the caller decides with <code>?:</code> what to do. A new enemy is one new class plus one new line in the factory; nothing else changes. A factory often lives in a companion object: <code>Player.guest()</code> from the Kotlin track was a small factory too.</p>
<p>When not to use it: if there is only one class, and callers always know which one they want, the constructor already is the simplest factory. Write <code>Bat()</code>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `interface Enemy {
    fun attack(): String
}
class Slime : Enemy {
    override fun attack() = "Slime splashes"
}
class Bat : Enemy {
    override fun attack() = "Bat bites"
}

fun makeEnemy(kind: String): Enemy? = when (kind) {
    "slime" -> Slime()
    "bat" -> Bat()
    else -> null
}

fun main() {
    val level = listOf("bat", "slime", "ghost")
    for (kind in level) {
        val enemy = makeEnemy(kind)
        println(enemy?.attack() ?: "Unknown enemy: $kind")
    }
}`,
            predict: {
              q: 'The level also says <code>"ghost"</code>, and there is no Ghost class. What happens on that turn?',
              options: ['It prints <code>Unknown enemy: ghost</code>', 'The program crashes', 'It makes a Bat'],
              a: 0,
              why: 'The factory gives back <code>null</code> for a word it doesn’t know, and <code>?:</code> picks the fallback text.',
            },
            frames: [
              { line: 11, say: 'The factory: the one place that turns a word into an enemy. It promises an <code>Enemy?</code>, not a Bat or a Slime.' },
              { line: 18, vars: { level: '[bat, slime, ghost]' }, say: 'The words come from the level file.' },
              { line: [20, 13], vars: { kind: '"bat"' }, say: '<code>makeEnemy("bat")</code>: the <code>when</code> picks <code>Bat()</code>.' },
              { line: 21, vars: { enemy: 'a Bat' }, out: 'Bat bites', say: '<code>main</code> only knows it has an Enemy. It calls <code>attack()</code>, and the Bat bites.' },
              { line: [20, 12], vars: { kind: '"slime"', enemy: 'a Slime' }, say: 'Next word, next object: a Slime this time.' },
              { line: 21, out: 'Slime splashes', say: 'The same line in <code>main</code>, a different class behind it.' },
              { line: [20, 14], vars: { kind: '"ghost"', enemy: 'null' }, say: 'No class for “ghost”: the factory gives back <code>null</code>.' },
              { line: 21, out: 'Unknown enemy: ghost', say: '<code>?.</code> skips the call and <code>?:</code> picks the fallback. To add a Ghost: one class, one line in the factory.' },
            ],
          });
        },
        code: `interface Shape {
    fun area(): Double
}

class Square(val side: Double) : Shape {
    override fun area() = side * side
}

class Circle(val radius: Double) : Shape {
    override fun area() = 3.14 * radius * radius
}

// The factory: the only place that knows which class goes with which word
fun makeShape(kind: String, size: Double): Shape? = when (kind) {
    "square" -> Square(size)
    "circle" -> Circle(size)
    else -> null
}

fun main() {
    println(makeShape("square", 3.0)?.area())   // 9.0
    println(makeShape("circle", 1.0)?.area())   // 3.14
    println(makeShape("star", 2.0)?.area())     // null
}`,
        play: `interface Greeting {
    fun hello(name: String): String
}

class English : Greeting {
    override fun hello(name: String) = "Hello, $name!"
}

class Spanish : Greeting {
    override fun hello(name: String) = "Hola, $name!"
}

class Norwegian : Greeting {
    override fun hello(name: String) = "Hei, $name!"
}

fun greetingFor(language: String): Greeting = when (language) {
    "es" -> Spanish()
    "no" -> Norwegian()
    else -> English()
}

fun main() {
    println(greetingFor("en").hello("Ada"))
    println(greetingFor("es").hello("Lin"))
    println(greetingFor("no").hello("Sam"))
    // Add a class Dutch ("Hallo, $name!") and a line for "nl" in greetingFor.
    // Then greet someone in Dutch. Nothing else has to know the class Dutch exists.
}`,
        remember: 'A factory is one function that decides which class to make and gives back the interface. New kind: one class, one line.',
        terms: [
          { term: 'factory', def: 'A function (often in a companion object) whose job is to create objects, so the code that uses them doesn’t need to know which class to make.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the factory. It gives back a Shape, or nothing for a word it doesn’t know.', code: `fun makeShape(kind: String, size: Double): [[Shape]]? = when (kind) {
    "square" -> Square(size)
    "circle" -> Circle(size)
    else -> [[null]]
}`, why: 'The return type is the interface, made nullable with <code>?</code>, so the factory can give back <code>null</code> for an unknown word.' },
          { type: 'bug', prompt: 'Kotlin says <code>Return type mismatch: expected \'Enemy\', actual \'Enemy?\'.</code> The factory must be allowed to give back no enemy. Tap the line.', code: `interface Enemy {
    fun attack(): String
}
class Slime : Enemy {
    override fun attack() = "Slime splashes"
}
class Bat : Enemy {
    override fun attack() = "Bat bites"
}

fun makeEnemy(kind: String): Enemy = when (kind) {
    "slime" -> Slime()
    "bat" -> Bat()
    else -> null
}`, bug: 10, fix: 'fun makeEnemy(kind: String): Enemy? = when (kind) {', why: 'The <code>else</code> branch gives <code>null</code>, so the result type must be nullable: <code>Enemy?</code>.' },
        ],
        quiz: [
          { q: 'Why does <code>makeEnemy</code> return <code>Enemy</code> and not <code>Bat</code>?', options: ['So callers can use any enemy without knowing its class', 'Because Bat is private', 'It makes the program faster'], a: 0, why: 'Callers only rely on the interface. Which class is behind it is the factory’s business.' },
          { q: 'You add a Ghost enemy. With a factory, what changes?', options: ['One new class and one new line in the factory', 'Every place in the game that makes enemies', 'Nothing: Kotlin finds Ghost on its own'], a: 0, why: 'All the creating lives in one place, so that is the only place to update.' },
          { q: '<code>Player.guest()</code> in a companion object gives back a ready-made Player. What is it?', options: ['A small factory', 'A singleton', 'A copy of every player'], a: 0, why: 'It is a function whose job is making an object, so it is a factory.' },
        ],
        docs: [['Classes: companion objects', 'https://kotlinlang.org/docs/classes.html'], ['Interfaces', 'https://kotlinlang.org/docs/interfaces.html']],
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'builder',
        title: 'Builder',
        tagline: 'Put an object together step by step, then build it.',
        goals: ['Build an object step by step with a builder class', 'Use named arguments and <code>apply</code>, Kotlin’s lighter builders', 'Choose between the three'],
        level: 'intermediate', introduces: ['toList'],
        body: `
<p>A pizza has a size and any number of toppings, added one by one as the customer taps them. A call like <code>Pizza(25, listOf("olives", "basil"), true, false)</code> works, but what is <code>true</code>, and what is <code>false</code>? And you only know the toppings one at a time.</p>
<p>The <b>Builder</b> pattern puts an object together step by step. A separate builder class collects the parts with small functions, and <code>build()</code> makes the finished object at the end. Each step gives back the builder itself, with <code>return this</code>, so the steps <b>chain</b> with dots: <code>PizzaBuilder().size(25).add("olives").build()</code>. The builder can also refuse at <code>build()</code> when a needed part is missing. And <code>build()</code> hands over a copy of the list, made with <code>toList()</code>, so steps called later on the builder can’t change a pizza that is already finished.</p>
<p>In Kotlin you often don’t need a builder class. Named and default arguments already make a long constructor readable: <code>Alarm(hour = 6, daily = true)</code> names each value and skips the rest. And for a class with <code>var</code> properties, <code>apply</code> is the step-by-step part: <code>Profile().apply { name = "Lin" }</code> sets the properties and gives back the Profile itself.</p>
<p>Which one? Named arguments for a fixed set of settings. <code>apply</code> to set up an object whose properties are <code>var</code>. A builder class when the parts arrive one by one, or the finished object must be checked before it exists and stay unchanged afterwards (all <code>val</code>).</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Pizza(val size: Int, val toppings: List<String>)

class PizzaBuilder {
    private var size = 30
    private val toppings = mutableListOf<String>()

    fun size(cm: Int): PizzaBuilder {
        size = cm
        return this
    }

    fun add(topping: String): PizzaBuilder {
        toppings.add(topping)
        return this
    }

    fun build() = Pizza(size, toppings.toList())
}

fun main() {
    val pizza = PizzaBuilder()
        .size(25)
        .add("olives")
        .add("basil")
        .build()
    println("\${pizza.size} cm with \${pizza.toppings}")
}`,
            varsTitle: 'Builder and pizza',
            predict: {
              q: 'Every step ends with <code>return this</code>. What does <code>.size(25)</code> give back?',
              options: ['The same PizzaBuilder, so <code>.add</code> can be called on it next', 'A finished Pizza', 'Nothing (<code>Unit</code>)'],
              a: 0,
              why: '<code>this</code> is the builder the step was called on. Giving it back is what lets the next dot work.',
            },
            frames: [
              { line: 21, vars: { 'builder.size': '30', 'builder.toppings': '[]' }, say: 'A new builder with the defaults: 30 cm, no toppings yet. No Pizza exists so far.' },
              { line: [22, 8, 9], vars: { 'builder.size': '25' }, say: '<code>.size(25)</code> changes the size and gives back <code>this</code>: the builder itself.' },
              { line: [23, 13, 14], vars: { 'builder.toppings': '[olives]' }, say: 'The next dot calls <code>add</code> on that same builder. One topping.' },
              { line: [24, 13, 14], vars: { 'builder.toppings': '[olives, basil]' }, say: 'Another step, on the same builder again.' },
              { line: [25, 17], vars: { 'pizza.size': '25', 'pizza.toppings': '[olives, basil]' }, say: '<code>build()</code> makes the real Pizza from what was collected. <code>toList()</code> copies the toppings, so later <code>add()</code> calls on the builder can’t reach this pizza.' },
              { line: 26, out: '25 cm with [olives, basil]', say: 'A list prints in square brackets.' },
            ],
          });
        },
        code: `// A fixed set of settings: named and default arguments are enough
class Alarm(
    val hour: Int,
    val minute: Int = 0,
    val sound: String = "Bells",
    val daily: Boolean = false
)

// Set up step by step: var properties plus apply
class Profile {
    var name = ""
    var city = ""
    var darkMode = false
}

fun main() {
    val alarm = Alarm(hour = 6, minute = 30, daily = true)
    println("\${alarm.hour}:\${alarm.minute} \${alarm.sound}")   // 6:30 Bells

    val profile = Profile().apply {
        name = "Lin"
        city = "Lisbon"
        darkMode = true
    }
    println("\${profile.name}, \${profile.city}")   // Lin, Lisbon
}`,
        play: `class Email(val to: String, val subject: String, val lines: List<String>)

class EmailBuilder {
    private var to = ""
    private var subject = "(no subject)"
    private val lines = mutableListOf<String>()

    fun recipient(address: String): EmailBuilder {
        to = address
        return this
    }

    fun subject(text: String): EmailBuilder {
        subject = text
        return this
    }

    fun line(text: String): EmailBuilder {
        lines.add(text)
        return this
    }

    fun build(): Email? {
        if (to == "") {
            return null   // the builder refuses an email with nobody to send it to
        }
        // toList() makes a copy, so later line() calls can't reach this email
        return Email(to, subject, lines.toList())
    }
}

fun main() {
    val email = EmailBuilder()
        .recipient("ada@example.com")
        .subject("Trip to Oslo")
        .line("Hi Ada")
        .line("The train leaves at 9.")
        .build()
    println(email?.subject)
    println(email?.lines)

    val broken = EmailBuilder().subject("Oops").build()
    println(broken)
    // Remove the .subject(...) line from the first email. What does it print now?
}`,
        remember: 'A builder collects parts step by step and build() makes the object. In Kotlin, named arguments and apply often do the job with less code.',
        mistakes: [
          { title: 'Forgetting build()', bad: `val pizza: Pizza = PizzaBuilder().add("olives")
// Error: Initializer type mismatch: expected 'Pizza', actual 'PizzaBuilder'.`, good: 'val pizza: Pizza = PizzaBuilder().add("olives").build()', why: 'Every step gives back the builder, not the pizza. Only <code>build()</code> makes the finished object.' },
        ],
        terms: [
          { term: 'builder', def: 'A design pattern: a helper object that collects the parts step by step, then makes the finished object with <code>build()</code>.' },
          { term: 'chaining', def: 'Calling one function after another with dots, <code>a.size(25).add("olives")</code>, where each call works on what the previous one gave back.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make this step chainable: it must give back the builder itself.', code: `fun add(topping: String): [[PizzaBuilder]] {
    toppings.add(topping)
    return [[this]]
}`, why: 'The return type is the builder, and <code>this</code> is the builder the step was called on.' },
          { type: 'bug', prompt: 'Kotlin says <code>Return type mismatch: expected \'Unit\', actual \'PizzaBuilder\'.</code> at <code>return this</code>, but the line to fix is another one. Tap it.', code: `class PizzaBuilder {
    private val toppings = mutableListOf<String>()

    fun add(topping: String) {
        toppings.add(topping)
        return this
    }
}`, bug: 3, fix: '    fun add(topping: String): PizzaBuilder {', why: 'Without a return type, <code>add</code> gives back <code>Unit</code>, so it can’t return the builder. Write <code>: PizzaBuilder</code>.' },
        ],
        quiz: [
          { q: '<code>class Alarm</code> has a default for every setting except <code>hour</code>. To make <code>Alarm(hour = 6, daily = true)</code>, do you need a builder class?', options: ['No: named and default arguments already do the job', 'Yes: any class with more than two settings needs one'], a: 0, why: 'In Kotlin, named and default arguments cover most of what a builder does for a fixed set of settings.' },
          { q: 'What does <code>Profile().apply { name = "Lin" }</code> give back?', options: ['The Profile itself, with <code>name</code> set', 'The text <code>"Lin"</code>', '<code>Unit</code>'], a: 0, why: '<code>apply</code> gives back the object it was called on. That is why it works as a builder.' },
          { q: 'Why does each builder step end with <code>return this</code>?', options: ['So the next step can be chained with a dot', 'To make the finished object', 'To make the builder private'], a: 0, why: 'Giving back the builder lets the next call work on it. <code>build()</code> makes the object.' },
        ],
        docs: [['Named arguments', 'https://kotlinlang.org/docs/functions.html#named-arguments'], ['Scope functions: apply', 'https://kotlinlang.org/docs/scope-functions.html']],
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'observer',
        title: 'Observer',
        tagline: 'Subscribe once, and hear about every change.',
        goals: ['Keep a list of listeners and notify them all', 'Subscribe and unsubscribe with lambdas', 'Know when a direct call is simpler'],
        level: 'intermediate', introduces: [],
        body: `
<p>A shop app has a cart. When an item is added, the badge on the cart icon, the total line and a “free delivery” banner must all update. If <code>addItem</code> calls each of them by name, the cart has to know every part of the screen, and every new part means editing the cart again.</p>
<p>The <b>Observer</b> pattern turns this around. The cart keeps a list of <b>listeners</b>: functions that want to hear about changes. Anyone who cares calls <code>subscribe</code> and hands in a lambda. When the cart changes, it calls every listener in its list, which is called <b>notifying</b> them. The cart doesn’t know who they are. It only knows: call these, with the new count.</p>
<p>In Kotlin a listener is a lambda with a function type like <code>(Int) -&gt; Unit</code>: it gets the new value and gives nothing back. The list is <code>mutableListOf&lt;(Int) -&gt; Unit&gt;()</code>, and notifying is a loop: <code>for (listener in listeners) { listener(count) }</code>. To stop listening, <code>unsubscribe</code> removes the lambda from the list again.</p>
<p>Watch out: a listener only hears changes made after it subscribed. A part that is gone but never unsubscribed keeps getting calls. And listeners that set off other listeners are hard to follow. When only one thing will ever react, call it directly or pass one lambda: that is simpler.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 270,
            nodes: [
              { id: 'cart', label: 'Cart<small>list of listeners</small>', x: 50, y: 14 },
              { id: 'badge', label: 'Badge', x: 17, y: 82, tone: 'muted', hidden: true },
              { id: 'total', label: 'Total line', x: 50, y: 82, tone: 'muted', hidden: true },
              { id: 'banner', label: 'Banner', x: 83, y: 82, tone: 'muted', hidden: true },
            ],
            predict: {
              q: 'The total line subscribes after the first item was added. Does it hear about that first item?',
              options: ['No: it only hears changes after it subscribed', 'Yes: the cart replays every change it ever had'],
              a: 0,
              why: 'The cart calls whoever is in its list right now. Nobody gets the past.',
            },
            frames: [
              { say: 'A cart with an empty list of listeners. Nobody is listening yet.' },
              { show: ['badge'], add: [['cart', 'badge', 'listening', 'weak']], say: 'The badge calls <code>subscribe</code> and hands in its lambda. The cart adds it to its list.' },
              { hl: ['cart', 'badge'], add: [['cart', 'badge', '1', 'accent']], say: '<code>addItem()</code>: the count is 1. The cart calls every listener in its list, so the badge shows 1.' },
              { show: ['total'], add: [['cart', 'badge', 'listening', 'weak'], ['cart', 'total', 'listening', 'weak']], say: 'Now the total line subscribes too. It missed item 1: it wasn’t listening yet.' },
              { hl: ['cart', 'badge', 'total'], add: [['cart', 'badge', '2', 'accent'], ['cart', 'total', '2', 'accent']], say: 'Second item: one loop, two calls. Both hear 2.' },
              { show: ['banner'], add: [['cart', 'badge', 'listening', 'weak'], ['cart', 'total', 'listening', 'weak'], ['cart', 'banner', 'listening', 'weak']], say: 'A banner subscribes. The cart’s code didn’t change: it still loops over its list.' },
              { hl: ['cart', 'badge', 'total', 'banner'], add: [['cart', 'badge', '3', 'accent'], ['cart', 'total', '3', 'accent'], ['cart', 'banner', '3', 'accent']], say: 'Third item: three calls. The cart knows none of them by name.' },
              { gone: ['badge'], remove: [['cart', 'badge']], add: [['cart', 'total', 'listening', 'weak'], ['cart', 'banner', 'listening', 'weak']], say: '<code>unsubscribe</code> takes the badge off the list. From now on it hears nothing.' },
            ],
          });
        },
        code: `class Thermostat {
    private val listeners = mutableListOf<(Int) -> Unit>()
    var degrees = 20
        private set

    fun subscribe(listener: (Int) -> Unit) {
        listeners.add(listener)
    }

    fun unsubscribe(listener: (Int) -> Unit) {
        listeners.remove(listener)
    }

    fun change(newDegrees: Int) {
        degrees = newDegrees
        for (listener in listeners) {
            listener(degrees)
        }
    }
}

fun main() {
    val thermostat = Thermostat()
    val screen: (Int) -> Unit = { println("Screen: $it degrees") }
    val heater: (Int) -> Unit = { println(if (it < 18) "Heater on" else "Heater off") }

    thermostat.subscribe(screen)
    thermostat.subscribe(heater)
    thermostat.change(16)          // Screen: 16 degrees, then Heater on
    thermostat.unsubscribe(screen)
    thermostat.change(21)          // Heater off (the screen no longer hears)
}`,
        play: `class Newsletter {
    private val readers = mutableListOf<(String) -> Unit>()

    fun subscribe(reader: (String) -> Unit) {
        readers.add(reader)
    }

    fun publish(story: String) {
        println("Publishing: $story")
        for (reader in readers) {
            reader(story)
        }
    }
}

fun main() {
    val news = Newsletter()
    news.subscribe { println("  Ada reads: $it") }
    news.subscribe { println("  Sam saves it for later") }
    news.publish("Rain in Lisbon")
    news.subscribe { println("  Lin shares it") }
    news.publish("Sun in Oslo")
    // Newsletter never needs to know who Ada, Sam or Lin are.
    // Add a fourth reader. Which stories will it hear about?
}`,
        remember: 'Observer: keep a list of listener lambdas, subscribe adds one, and every change calls them all.',
        mistakes: [
          { title: 'Unsubscribing a different lambda', bad: `cart.subscribe { println("Badge shows $it") }
cart.unsubscribe { println("Badge shows $it") }
cart.addItem()   // still prints: Badge shows 1`, good: `val badge: (Int) -> Unit = { println("Badge shows $it") }
cart.subscribe(badge)
cart.unsubscribe(badge)
cart.addItem()   // prints nothing`, why: 'Each <code>{ }</code> makes a new lambda, even when the code inside looks the same. <code>remove</code> only finds the very lambda that was added, so keep it in a <code>val</code> and pass that same one both times.' },
        ],
        terms: [
          { term: 'observer', def: 'A design pattern: one object keeps a list of listeners and calls them all when something changes.' },
          { term: 'listener', def: 'A function handed in to be called later, when something happens. Here a lambda such as <code>(Int) -&gt; Unit</code>.' },
          { term: 'subscribe', def: 'To add yourself to the list of listeners. <code>unsubscribe</code> takes you off it again.' },
          { term: 'notify', def: 'To call every listener in the list with the news.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let anyone subscribe to taps, and tell every listener when the button is tapped.', code: `class Button {
    private val listeners = mutableListOf<() -> Unit>()

    fun subscribe(listener: () -> Unit) {
        listeners.[[add]](listener)
    }

    fun tap() {
        for (listener in listeners) {
            [[listener]]()
        }
    }
}`, why: '<code>subscribe</code> adds the lambda to the list. <code>tap</code> notifies by calling each one with <code>()</code>.' },
          { type: 'bug', prompt: 'It compiles, but nothing reacts when an item is added. Tap the line that should notify each listener.', code: `class Cart {
    private val listeners = mutableListOf<(Int) -> Unit>()
    private var count = 0

    fun subscribe(listener: (Int) -> Unit) {
        listeners.add(listener)
    }

    fun addItem() {
        count++
        for (listener in listeners) {
            listener
        }
    }
}`, bug: 11, fix: '            listener(count)', why: 'Naming a lambda doesn’t run it. Calling it with <code>(count)</code> does, and hands it the news.' },
        ],
        quiz: [
          { q: 'Two listeners have subscribed. <code>addItem()</code> is called once. How many listener calls happen?', options: ['Two: each listener once', 'One: only the first listener', 'None until you call them by name'], a: 0, why: 'The loop calls every listener in the list.' },
          { q: 'What does the Observer pattern buy the cart?', options: ['It doesn’t need to know who is listening', 'It turns the cart into a singleton', 'It sorts the listeners by name'], a: 0, why: 'New parts subscribe themselves. The cart’s code stays the same.' },
          { q: 'A part of the screen goes away but never unsubscribes. What happens?', options: ['The cart keeps calling its listener', 'Its listener is removed on its own'], a: 0, why: 'The lambda stays in the list until someone removes it.' },
        ],
        docs: [['Lambdas and function types', 'https://kotlinlang.org/docs/lambdas.html']],
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'strategy',
        title: 'Strategy',
        tagline: 'Hand in the way a job is done, and swap it when needed.',
        goals: ['Pull a changing rule out into its own class or lambda', 'Swap a strategy while the program runs', 'Tell when a plain <code>if</code> is enough'],
        level: 'intermediate', introduces: [],
        body: `
<p>A checkout adds shipping to the total. First shipping was always 5. Then came “free from 50”, then “express: 15”, then “10% of the total” for a sale. Each rule became one more branch in a growing <code>when</code> inside <code>pay</code>, and every new rule meant editing, and re-checking, code that already worked.</p>
<p>The <b>Strategy</b> pattern pulls out the part that changes. Each way of working out shipping becomes its own small class behind one interface, <code>Shipping</code>. The checkout holds one Shipping and calls <code>cost(total)</code> without knowing which one it has. You can hand in a different one when you make the checkout, or swap it while the program runs. That is open/closed from SOLID: a new rule is a new class, and <code>Checkout</code> stays as it is.</p>
<p>In Kotlin a strategy is often a lambda. A property of type <code>(Int) -&gt; Int</code> holds “how to work out shipping”, and <code>{ if (it &gt;= 50) 0 else 5 }</code> is a whole strategy in one line. You have used this already: <code>sortedBy { it.price }</code> takes a strategy for “what to sort by”.</p>
<p>When not to use it: two fixed choices that will never grow are clearer as an <code>if</code> than as an interface and two classes.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `interface Shipping {
    fun cost(total: Int): Int
}

class Standard : Shipping {
    override fun cost(total: Int) = 5
}

class FreeOver50 : Shipping {
    override fun cost(total: Int) = if (total >= 50) 0 else 5
}

class Checkout(var shipping: Shipping) {
    fun pay(total: Int) = total + shipping.cost(total)
}

fun main() {
    val checkout = Checkout(Standard())
    println(checkout.pay(60))
    checkout.shipping = FreeOver50()
    println(checkout.pay(60))
}`,
            predict: {
              q: 'The same checkout pays 60 twice, but the strategy is swapped in between. What does the second <code>println</code> print?',
              options: ['<code>60</code>', '<code>65</code>', '<code>0</code>'],
              a: 0,
              why: 'FreeOver50 charges 0 shipping for 60, so the checkout asks for 60 + 0.',
            },
            frames: [
              { line: [1, 2], say: 'One job, several ways to do it: “work out the shipping”. The interface names the job.' },
              { line: [6, 10], say: 'Two strategies: always 5, or free from 50 up. Each one is a small class of its own.' },
              { line: 18, vars: { 'checkout.shipping': 'Standard' }, say: 'The checkout gets a strategy handed in. It only knows it has a Shipping.' },
              { line: [19, 14, 6], out: '65', say: '<code>pay(60)</code> asks its strategy. Standard says 5, so 60 + 5.' },
              { line: 20, vars: { 'checkout.shipping': 'FreeOver50' }, say: 'Swap the strategy while the program runs. Checkout’s code stays the same.' },
              { line: [21, 14, 10], out: '60', say: 'The same call with the new strategy: 60 is at least 50, so shipping is 0.' },
            ],
          });
        },
        code: `// A lambda as the strategy: no interface, no extra classes
class Checkout(var shipping: (Int) -> Int) {
    fun pay(total: Int) = total + shipping(total)
}

fun main() {
    val checkout = Checkout { 5 }       // a lambda that always gives 5
    println(checkout.pay(30))           // 35

    checkout.shipping = { if (it >= 50) 0 else 5 }
    println(checkout.pay(60))           // 60

    checkout.shipping = { it / 10 }     // 10% of the total
    println(checkout.pay(30))           // 33
}`,
        play: `interface Move {
    fun next(position: Int): Int
}

class Walk : Move {
    override fun next(position: Int) = position + 1
}

class Jump : Move {
    override fun next(position: Int) = position + 3
}

class Robot(val name: String, var move: Move) {
    var position = 0

    fun step() {
        position = move.next(position)
        println("$name is at $position")
    }
}

fun main() {
    val robot = Robot("Rex", Walk())
    robot.step()
    robot.step()
    robot.move = Jump()   // swap the strategy while the program runs
    robot.step()
    // Write a class Back : Move that goes 1 step back, and give it to Rex.
    // Robot itself never changes.
}`,
        remember: 'Strategy: put each way of doing a job behind one interface or function type, hand one in, swap it when needed.',
        terms: [
          { term: 'strategy', def: 'A design pattern: one job with several ways to do it. Each way is a separate object or lambda that you hand in and can swap.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Use the shipping strategy in <code>pay</code>, then switch to free shipping.', code: `class Checkout(var shipping: (Int) -> Int) {
    fun pay(total: Int) = total + [[shipping]](total)
}

fun main() {
    val checkout = Checkout { 5 }
    checkout.shipping = { [[0]] }   // free shipping today
    println(checkout.pay(20))       // 20
}`, why: '<code>shipping</code> holds a lambda, so <code>shipping(total)</code> runs it. A lambda that gives 0 is the free-shipping strategy.' },
          { type: 'bug', prompt: 'Kotlin says <code>\'cost\' overrides nothing.</code> and won’t accept Express as a Shipping. Tap the line.', code: `interface Shipping {
    fun cost(total: Int): Int
}

class Express {
    override fun cost(total: Int) = 15
}

class Checkout(var shipping: Shipping)

fun main() {
    val checkout = Checkout(Express())
}`, bug: 4, fix: 'class Express : Shipping {', why: 'Express has the right function, but it never promised to be a Shipping. <code>: Shipping</code> makes it keep the interface, so it can be handed in.' },
        ],
        quiz: [
          { q: 'A new rule arrives: shipping costs 2 on Sundays. With the Strategy pattern, what do you change?', options: ['Write one new Shipping class (or lambda)', 'Edit the <code>pay</code> function in Checkout', 'Edit every existing rule'], a: 0, why: 'The checkout only knows the interface. A new rule is new code, not an edit to old code.' },
          { q: 'Which of these is a strategy you have already used?', options: ['The lambda in <code>sortedBy { it.price }</code>', '<code>listOf(1, 2, 3)</code>', '<code>println("Hi")</code>'], a: 0, why: 'You hand <code>sortedBy</code> the rule for what to sort by. Swap the lambda, get a different order.' },
          { q: 'There are exactly two ways to charge shipping, and that will never change. What is the best choice?', options: ['An <code>if</code>', 'An interface and two classes'], a: 0, why: 'A pattern earns its extra classes when rules keep coming. For two fixed choices, an <code>if</code> is clearer.' },
        ],
        docs: [['Lambdas and function types', 'https://kotlinlang.org/docs/lambdas.html'], ['Interfaces', 'https://kotlinlang.org/docs/interfaces.html']],
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'adapter',
        title: 'Adapter',
        tagline: 'Make a class you can’t change fit the interface you need.',
        goals: ['Recognise when two pieces of code don’t fit together', 'Write an adapter class that translates between them', 'Know when changing the code is better than wrapping it'],
        level: 'intermediate', introduces: [],
        body: `
<p>Your weather app works with a <code>Thermometer</code> interface that has one function, <code>celsius()</code>. Another team gives you their sensor class. It works, but it has <code>fahrenheit()</code>, not <code>celsius()</code>, and you can’t change it: it isn’t your code. Your <code>report</code> function only accepts Thermometers.</p>
<p>The <b>Adapter</b> pattern is a travel plug adapter for code. You write a small class that keeps your interface on the outside and holds the other object on the inside: <code>class SensorAdapter(private val sensor: OldSensor) : Thermometer</code>. Its <code>celsius()</code> calls <code>sensor.fahrenheit()</code> and converts the answer. To the rest of your app it is one more Thermometer.</p>
<p>Neither side changes. <code>report</code> still only knows Thermometer, and the sensor class stays as it was. All the translating lives in the adapter: different names, different units, or extra steps such as “connect first, then send”. It is composition from the oop track: the adapter has a sensor and passes calls on to it.</p>
<p>When not to use it: if both pieces of code are yours, change one to fit the other instead of adding a class in between. An adapter is for code you can’t, or shouldn’t, edit.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'report', label: 'report()', sub: 'needs a Thermometer' },
              { id: 'adapter', label: 'SensorAdapter', sub: 'a Thermometer outside' },
              { id: 'sensor', label: 'OldSensor', sub: 'only has fahrenheit()' },
            ],
            predict: {
              q: '<code>report</code> accepts only a Thermometer. OldSensor has <code>fahrenheit()</code> and no <code>celsius()</code>. Can you pass an OldSensor to <code>report</code> directly?',
              options: ['No: it doesn’t keep the Thermometer promise', 'Yes: Kotlin converts it for you'],
              a: 0,
              why: 'OldSensor never promised to be a Thermometer, so it doesn’t compile. That is the gap the adapter fills.',
            },
            frames: [
              { say: '<code>report</code> only talks to Thermometers. OldSensor isn’t one, and you can’t edit it.' },
              { at: 'report', packet: 'celsius()', say: '<code>report</code> asks for <code>celsius()</code>, the only thing it knows.' },
              { at: 'adapter', packet: 'celsius()', mark: { adapter: 'accent' }, say: 'The adapter keeps the Thermometer promise, so the call can reach it.' },
              { at: 'sensor', packet: 'fahrenheit()', say: 'Inside, the adapter calls what the sensor really has: <code>fahrenheit()</code>.' },
              { at: 'sensor', packet: '68.0', tone: 'warm', say: 'The sensor answers in its own unit: 68.0.' },
              { at: 'adapter', packet: '20.0', tone: 'ok', say: 'The adapter converts: (68.0 − 32) × 5 / 9 is 20.0.' },
              { at: 'report', packet: '20.0', tone: 'ok', mark: { report: 'ok' }, say: '<code>report</code> prints <code>It is 20.0 degrees</code>. Neither report nor OldSensor changed.' },
            ],
          });
        },
        code: `interface Thermometer {
    fun celsius(): Double
}

// From another team. You can't change this class.
class OldSensor {
    fun fahrenheit() = 68.0
}

class SensorAdapter(private val sensor: OldSensor) : Thermometer {
    override fun celsius() = (sensor.fahrenheit() - 32) * 5 / 9
}

fun report(t: Thermometer) {
    println("It is \${t.celsius()} degrees")
}

fun main() {
    val old = OldSensor()
    report(SensorAdapter(old))   // It is 20.0 degrees
}`,
        play: `interface Distance {
    fun km(): Double
}

class Trip(val kilometers: Double) : Distance {
    override fun km() = kilometers
}

// An old class that only knows miles
class MilesCounter(val miles: Double)

class MilesAdapter(private val counter: MilesCounter) : Distance {
    override fun km() = counter.miles * 1.6
}

fun total(parts: List<Distance>): Double {
    var sum = 0.0
    for (part in parts) {
        sum += part.km()
    }
    return sum
}

fun main() {
    val parts = listOf(Trip(10.0), MilesAdapter(MilesCounter(5.0)), Trip(2.0))
    println("Total: \${total(parts)} km")
    // total() only knows Distance. The adapter lets the miles join in.
    // Add one more MilesAdapter to the list.
}`,
        remember: 'An adapter keeps the interface your code expects on the outside and calls the class you can’t change on the inside.',
        terms: [
          { term: 'adapter', def: 'A design pattern: a class that keeps the interface your code expects on the outside, and calls a different class on the inside, translating between them.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let a MilesCounter be used anywhere a Distance is expected.', code: `class MilesAdapter(private val counter: MilesCounter) : [[Distance]] {
    override fun km() = [[counter]].miles * 1.6
}`, why: 'The adapter keeps the Distance promise on the outside and reads the counter it holds on the inside.' },
          { type: 'bug', prompt: 'On a mild day the report says <code>It is 68.0 degrees</code> Celsius. Celsius is (F − 32) × 5 / 9. Tap the wrong line.', code: `interface Thermometer {
    fun celsius(): Double
}

class OldSensor {
    fun fahrenheit() = 68.0
}

class SensorAdapter(private val sensor: OldSensor) : Thermometer {
    override fun celsius() = sensor.fahrenheit()
}`, bug: 9, fix: '    override fun celsius() = (sensor.fahrenheit() - 32) * 5 / 9', why: 'The adapter passes the call on but forgets to translate. Converting the unit is its whole job.' },
        ],
        quiz: [
          { q: 'You can’t edit OldSensor, and <code>report</code> needs a Thermometer. What does the adapter do?', options: ['Keeps the Thermometer promise and calls OldSensor inside', 'Changes OldSensor’s code', 'Copies OldSensor’s code into report'], a: 0, why: 'It sits between the two and translates, so neither side has to change.' },
          { q: 'Both classes are yours, and both are easy to change. Do you need an adapter?', options: ['Usually not: change one to fit the other', 'Yes, always'], a: 0, why: 'An extra class in between only pays off for code you can’t or shouldn’t edit.' },
          { q: 'With <code>km() = counter.miles * 1.6</code>, what is <code>MilesAdapter(MilesCounter(5.0)).km()</code>?', options: ['<code>8.0</code>', '<code>5.0</code>', '<code>3.1</code>'], a: 0, why: '5.0 × 1.6 is 8.0.' },
        ],
        docs: [['Interfaces', 'https://kotlinlang.org/docs/interfaces.html']],
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'decorator',
        title: 'Decorator',
        tagline: 'Wrap an object to add something, layer by layer.',
        goals: ['Add behaviour by wrapping instead of making subclasses', 'Stack wrappers in any order', 'Forward the rest with <code>by</code>'],
        level: 'intermediate', introduces: [],
        body: `
<p>A café app: a coffee costs 250 cents. Milk adds 50, syrup adds 70, and a customer can have both, or syrup twice. A subclass for every mix, <code>CoffeeWithMilk</code>, <code>CoffeeWithMilkAndSyrup</code> and so on, gets out of hand fast: every new extra doubles the count.</p>
<p>The <b>Decorator</b> pattern wraps instead. <code>Milk</code> is a Drink, and it holds another Drink inside. Its <code>price()</code> asks the inner drink for its price and adds 50. Wrap as many layers as you like, in any order: <code>Syrup(Milk(Coffee()))</code>. Each layer adds its part and passes the call on.</p>
<p>An adapter wraps an object too. The difference: an adapter changes the interface to fit; a decorator keeps the same interface and adds behaviour.</p>
<p>When an interface has many functions and a decorator changes only one, forwarding all the others by hand is dull work. Class delegation from the oop track does it for you: in <code>class HappyHour(private val inner: Drink) : Drink by inner</code>, everything HappyHour doesn’t override goes straight to <code>inner</code>. When not to use it: if every drink always gets the extra, put it in the class itself. And many layers make it hard to see what really runs.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `interface Drink {
    fun price(): Int
    fun name(): String
}

class Coffee : Drink {
    override fun price() = 250
    override fun name() = "Coffee"
}

class Milk(private val inner: Drink) : Drink {
    override fun price() = inner.price() + 50
    override fun name() = inner.name() + " + milk"
}

class Syrup(private val inner: Drink) : Drink {
    override fun price() = inner.price() + 70
    override fun name() = inner.name() + " + syrup"
}

fun main() {
    val order = Syrup(Milk(Coffee()))
    println(order.name())
    println(order.price())
}`,
            varsTitle: 'The order',
            predict: {
              q: 'Prices are in cents: coffee 250, milk +50, syrup +70. What does <code>order.price()</code> print?',
              options: ['<code>370</code>', '<code>250</code>', '<code>320</code>'],
              a: 0,
              why: 'Each layer adds its part to what the layer inside it says: 250 + 50 + 70.',
            },
            frames: [
              { line: 22, stack: ['main'], vars: { order: 'Syrup(Milk(Coffee))' }, say: 'Three layers: a Coffee, wrapped in Milk, wrapped in Syrup. Every layer is a Drink.' },
              { line: [23, 18, 13, 8], out: 'Coffee + milk + syrup', say: '<code>name()</code> goes in layer by layer, and each layer adds its words on the way back out.' },
              { line: [24, 17], stack: ['main', 'Syrup.price'], say: '<code>price()</code> on the outer layer. Syrup first asks its inner drink.' },
              { line: 12, stack: ['main', 'Syrup.price', 'Milk.price'], say: 'Milk asks its inner drink too.' },
              { line: 7, stack: ['main', 'Syrup.price', 'Milk.price', 'Coffee.price'], say: 'The Coffee in the middle answers: 250.' },
              { line: 12, stack: ['main', 'Syrup.price', 'Milk.price'], say: 'Back in Milk: 250 + 50 is 300.' },
              { line: 17, stack: ['main', 'Syrup.price'], say: 'Back in Syrup: 300 + 70 is 370.' },
              { line: 24, stack: ['main'], out: '370', say: 'One call on the outside; three layers, each adding its part.' },
            ],
          });
        },
        code: `interface Drink {
    fun price(): Int
    fun name(): String
    fun size(): String
}

class Tea : Drink {
    override fun price() = 200
    override fun name() = "Tea"
    override fun size() = "Large"
}

// "by inner": everything this class doesn't override goes straight to inner
class HappyHour(private val inner: Drink) : Drink by inner {
    override fun price() = inner.price() / 2
}

fun main() {
    val tea = HappyHour(Tea())
    println(tea.name())    // Tea
    println(tea.size())    // Large
    println(tea.price())   // 100
}`,
        play: `interface Message {
    fun text(): String
}

class Plain(private val words: String) : Message {
    override fun text() = words
}

class Shout(private val inner: Message) : Message {
    override fun text() = inner.text() + "!!!"
}

class Signed(private val inner: Message, private val name: String) : Message {
    override fun text() = inner.text() + " - " + name
}

class Framed(private val inner: Message) : Message {
    override fun text() = "[ " + inner.text() + " ]"
}

fun main() {
    val hello = Plain("See you in Oslo")
    println(hello.text())
    println(Shout(hello).text())
    println(Signed(Shout(hello), "Ada").text())
    println(Framed(Signed(hello, "Sam")).text())
    // Swap the order: Signed(Framed(hello), "Sam"). What changes?
}`,
        remember: 'A decorator is the same interface wrapped around another object: it adds its part and passes the call on. by inner forwards the rest.',
        mistakes: [
          { title: 'Forgetting to ask the inner object', bad: `class Milk(private val inner: Drink) : Drink {
    override fun price() = 50
    override fun name() = inner.name() + " + milk"
}
// Milk(Coffee()).price() is 50: the coffee is lost`, good: `class Milk(private val inner: Drink) : Drink {
    override fun price() = inner.price() + 50
    override fun name() = inner.name() + " + milk"
}
// Milk(Coffee()).price() is 300`, why: 'A decorator adds to what the inner object does. If it doesn’t call the inner object, it replaces it instead.' },
        ],
        terms: [
          { term: 'decorator', def: 'A design pattern: a class that keeps the same interface as the object it holds, adds something, and passes the call on.' },
          { term: 'wrap', def: 'To hold another object inside and stand in front of it, so calls go through you first.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Write a Sugar decorator that adds 20 to any drink.', code: `class Sugar(private val inner: Drink) : [[Drink]] {
    override fun price() = [[inner]].price() + 20
    override fun name() = inner.name() + " + sugar"
}`, why: 'A decorator is itself a Drink, and adds its part to what the inner drink says.' },
          { type: 'bug', prompt: 'Kotlin says <code>Class \'HappyHour\' is not abstract and does not implement abstract member: fun name(): String</code>. HappyHour should pass <code>name()</code> on to the inner drink. Tap the line.', code: `interface Drink {
    fun price(): Int
    fun name(): String
}

class HappyHour(private val inner: Drink) : Drink {
    override fun price() = inner.price() / 2
}`, bug: 5, fix: 'class HappyHour(private val inner: Drink) : Drink by inner {', why: '<code>by inner</code> forwards every function HappyHour doesn’t write itself, so <code>name()</code> goes to the inner drink.' },
        ],
        quiz: [
          { q: 'Coffee costs 250 and Milk adds 50. What does <code>Milk(Milk(Coffee())).price()</code> give?', options: ['<code>350</code>', '<code>300</code>', '<code>250</code>'], a: 0, why: 'Two Milk layers, each adding 50 to what is inside: 250 + 50 + 50.' },
          { q: 'What is the difference between a decorator and an adapter?', options: ['A decorator keeps the same interface and adds behaviour; an adapter changes the interface to fit', 'There is no difference', 'A decorator needs inheritance; an adapter doesn’t'], a: 0, why: 'Both wrap an object. The adapter translates, the decorator adds.' },
          { q: 'In <code>class HappyHour(private val inner: Drink) : Drink by inner</code>, HappyHour doesn’t write <code>name()</code>. What does <code>name()</code> do?', options: ['It calls <code>inner.name()</code>', 'It doesn’t compile', 'It gives back an empty text'], a: 0, why: '<code>by inner</code> forwards every function you don’t override to <code>inner</code>.' },
        ],
        docs: [['Delegation', 'https://kotlinlang.org/docs/delegation.html']],
      },

      // 9 ─────────────────────────────────────────────
      {
        id: 'facade',
        title: 'Facade',
        tagline: 'One simple front door for a job that needs many parts.',
        goals: ['Spot the same sequence of calls repeated in many places', 'Write a facade class with one simple function', 'Keep a facade small, and the parts still usable'],
        level: 'intermediate', introduces: [],
        body: `
<p>Movie night at home: dim the lights to 10%, lower the screen, switch the projector on, then show the film. Every place in the app that starts a movie repeats those four calls, in that order. One day someone forgets to lower the screen, and the film plays on the wall.</p>
<p>The <b>Facade</b> pattern puts one simple front in front of a group of parts. (A facade is the front of a building: what you see from the street.) A <code>MovieNight</code> class gets the lights, screen and projector through its constructor and offers one function, <code>start(movie)</code>, that calls them in the right order. Callers learn one call instead of four.</p>
<p>The parts don’t disappear. Code that only wants to dim the lights can still use <code>Lights</code> directly. A facade is a shortcut for the common job, not a wall around the parts. Because it gets its parts passed in (dependency injection, from the SOLID track), you choose which objects it uses. Make <code>Lights</code> an interface, as dependency inversion asks, and you could hand it a different kind of lights too.</p>
<p>When not to use it: a facade around a single call adds nothing. And watch for a facade that keeps growing until it does everything in the app: then it is one big class with many reasons to change, the opposite of single responsibility.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 290,
            nodes: [
              { id: 'main', label: 'main', x: 50, y: 10 },
              { id: 'night', label: 'MovieNight<small>start(movie)</small>', x: 50, y: 46, tone: 'ok', hidden: true },
              { id: 'lights', label: 'Lights', x: 15, y: 86, tone: 'muted' },
              { id: 'screen', label: 'Screen', x: 50, y: 86, tone: 'muted' },
              { id: 'projector', label: 'Projector', x: 85, y: 86, tone: 'muted' },
            ],
            predict: {
              q: 'With the facade in place, how many calls does <code>main</code> need to start a movie?',
              options: ['One: <code>start(movie)</code>', 'Four: one per step', 'None'],
              a: 0,
              why: 'The facade knows the steps and their order. Its caller makes one call.',
            },
            frames: [
              { add: [['main', 'lights'], ['main', 'screen'], ['main', 'projector']], say: 'Without a facade, <code>main</code> talks to every part itself and must know the right order.' },
              { hl: ['main', 'lights', 'screen', 'projector'], say: 'Every place in the app that starts a movie repeats these calls. Forget one, and the film plays on the wall.' },
              { show: ['night'], remove: [['main', 'lights'], ['main', 'screen'], ['main', 'projector']], add: [['main', 'night', 'start()', 'accent'], ['night', 'lights'], ['night', 'screen'], ['night', 'projector']], say: 'A facade in between. <code>main</code> makes one call; MovieNight knows the steps.' },
              { hl: ['night', 'lights'], add: [['night', 'lights', 'dim(10)', 'accent']], say: 'MovieNight calls <code>lights.dim(10)</code>, which prints <code>Lights at 10%</code>…' },
              { hl: ['night', 'screen'], add: [['night', 'lights'], ['night', 'screen', 'lower()', 'accent']], say: '…then <code>screen.lower()</code>: <code>Screen down</code>…' },
              { hl: ['night', 'projector'], add: [['night', 'screen'], ['night', 'projector', 'on(), show()', 'accent']], say: '…then <code>Projector on</code> and <code>Showing Northern Lights</code>. Always in this order.' },
              { hl: ['main', 'lights'], add: [['night', 'projector'], ['main', 'lights', 'dim(50)', 'weak']], say: 'The parts are still there. To only change the lights, <code>main</code> can still use Lights directly.' },
            ],
          });
        },
        code: `class Lights {
    fun dim(percent: Int) = println("Lights at $percent%")
}
class Screen {
    fun lower() = println("Screen down")
}
class Projector {
    fun on() = println("Projector on")
    fun show(movie: String) = println("Showing $movie")
}

// The facade: one call for the whole job, in the right order
class MovieNight(
    private val lights: Lights,
    private val screen: Screen,
    private val projector: Projector
) {
    fun start(movie: String) {
        lights.dim(10)
        screen.lower()
        projector.on()
        projector.show(movie)
    }
}

fun main() {
    val night = MovieNight(Lights(), Screen(), Projector())
    night.start("Northern Lights")
    // Lights at 10%
    // Screen down
    // Projector on
    // Showing Northern Lights
}`,
        play: `class Kettle {
    fun boil() = println("Water boiling")
}
class Grinder {
    fun grind(grams: Int) = println("Ground $grams g of beans")
}
class Cups {
    var left = 2
    fun take(): Boolean {
        if (left == 0) {
            return false
        }
        left -= 1
        return true
    }
}

class CoffeeMachine(
    private val kettle: Kettle,
    private val grinder: Grinder,
    private val cups: Cups
) {
    fun makeCoffee() {
        if (!cups.take()) {
            println("No clean cups!")
            return
        }
        grinder.grind(15)
        kettle.boil()
        println("Coffee is ready")
    }
}

fun main() {
    val machine = CoffeeMachine(Kettle(), Grinder(), Cups())
    machine.makeCoffee()
    machine.makeCoffee()
    machine.makeCoffee()
    // The caller only knows makeCoffee(). Add a class Milk with a function froth(),
    // pass a Milk() into CoffeeMachine, and call froth() inside makeCoffee.
    // The three makeCoffee() calls in main stay the same.
}`,
        remember: 'A facade is one simple function in front of several parts, calling them in the right order. The parts stay usable on their own.',
        terms: [
          { term: 'facade', def: 'A design pattern: one class with a simple function that runs a common job across several parts, in the right order.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the facade: dim the lights, then switch on the projector and show the movie.', code: `class MovieNight(private val lights: Lights, private val projector: Projector) {
    fun start(movie: String) {
        [[lights]].dim(10)
        projector.on()
        projector.[[show]](movie)
    }
}`, why: 'The facade calls the parts it was given, in order. Callers only see <code>start</code>.' },
          { type: 'bug', prompt: 'Every order is charged 40, whatever the amount. Tap the wrong line.', code: `class OrderService(
    private val stock: Stock,
    private val payment: Payment,
    private val courier: Courier
) {
    fun placeOrder(item: String, amount: Int, city: String) {
        stock.reserve(item)
        payment.charge(40)
        courier.book(city)
    }
}`, bug: 7, fix: '        payment.charge(amount)', why: 'The facade must pass on what its caller gave it. A fixed number ignores the <code>amount</code> parameter.' },
        ],
        quiz: [
          { q: 'What does a facade give its callers?', options: ['One simple call for a job that needs several parts', 'A copy of every part', 'A list of listeners'], a: 0, why: 'The facade knows the steps and their order, so callers don’t have to.' },
          { q: 'MovieNight is in place. Can other code still use <code>Lights</code> on its own?', options: ['Yes: the parts are still there', 'No: the facade hides them for good'], a: 0, why: 'A facade is a shortcut for the common job, not a wall.' },
          { q: 'A facade has grown to 40 functions covering the whole app. What is the risk?', options: ['It has become one big class with many reasons to change', 'None: a bigger facade is a better facade'], a: 0, why: 'That breaks single responsibility. Keep a facade to one job, or split it.' },
        ],
        docs: [['Classes', 'https://kotlinlang.org/docs/classes.html']],
      },

      // 10 ────────────────────────────────────────────
      {
        id: 'state-machine',
        title: 'State machine',
        tagline: 'Always in exactly one state, and only allowed moves between them.',
        goals: ['Replace contradicting Booleans with one state', 'Write the transitions in one function with <code>when</code>', 'Use a sealed interface when a state carries data'],
        level: 'intermediate', introduces: [],
        body: `
<p>A music player keeps <code>isPlaying</code> and <code>isPaused</code> as two Booleans. A bug sets both to <code>true</code>. Is it playing or paused? The screen shows the play button and the pause button at once. Two Booleans make four combinations, and only three of them make sense.</p>
<p>A <b>state machine</b> lists the states something can be in, and it is always in exactly one of them. Things that happen are <b>events</b>: for a door, open, close, lock and unlock. A <b>transition</b> is a rule: in this state, this event leads to that state. An event with no rule for the current state changes nothing.</p>
<p>In Kotlin, an enum holds the states and another holds the events, and one function holds every transition: <code>fun next(door: Door, action: Action): Door = when (door) { ... }</code>. A <code>when</code> over an enum must cover every value, so a new state with no rules yet stops the program compiling until you add them. When a state needs its own data, like a percent while loading or a reason for a failure, use a sealed interface instead of an enum, as in the code below.</p>
<p>When not to use it: something with two states and one switch, like a lamp that is on or off, is fine as one Boolean. Reach for a state machine once the states, and the rules about which moves are allowed, start to multiply.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `enum class Door { OPEN, CLOSED, LOCKED }
enum class Action { OPEN, CLOSE, LOCK, UNLOCK }

fun next(door: Door, action: Action): Door = when (door) {
    Door.OPEN -> if (action == Action.CLOSE) Door.CLOSED else door
    Door.CLOSED -> when (action) {
        Action.OPEN -> Door.OPEN
        Action.LOCK -> Door.LOCKED
        else -> door
    }
    Door.LOCKED -> if (action == Action.UNLOCK) Door.CLOSED else door
}

fun main() {
    var door = Door.OPEN
    door = next(door, Action.LOCK)
    println(door)
    door = next(door, Action.CLOSE)
    door = next(door, Action.LOCK)
    println(door)
    door = next(door, Action.OPEN)
    println(door)
}`,
            predict: {
              q: 'The door is open, and someone tries to lock it. What does the first <code>println(door)</code> print?',
              options: ['<code>OPEN</code>', '<code>LOCKED</code>', '<code>CLOSED</code>'],
              a: 0,
              why: 'From OPEN, only CLOSE leads anywhere. Locking an open door is not a transition, so the state stays OPEN.',
            },
            frames: [
              { line: [1, 2, 4], say: 'The states, the events, and <code>next</code>, which holds every transition. <code>Door.OPEN</code> is a state; <code>Action.OPEN</code> is something someone does.' },
              { line: 15, vars: { door: 'OPEN' }, say: 'The door starts open. It is in exactly one state.' },
              { line: [16, 5], vars: { door: 'OPEN' }, say: 'LOCK while OPEN: only CLOSE moves an open door, so <code>next</code> gives back the same state.' },
              { line: 17, out: 'OPEN', say: 'You can’t lock an open door. The rule for that lives in one place.' },
              { line: [18, 5], vars: { door: 'CLOSED' }, say: 'CLOSE while OPEN is a transition: now CLOSED.' },
              { line: [19, 8], vars: { door: 'LOCKED' }, say: 'LOCK while CLOSED: now LOCKED.' },
              { line: 20, out: 'LOCKED', say: 'Two events, two moves, each one allowed by a rule.' },
              { line: [21, 11, 22], out: 'LOCKED', say: 'OPEN while LOCKED has no rule, so it stays LOCKED. No mix like “open and locked” can ever happen.' },
            ],
          });
        },
        code: `sealed interface Download
object Waiting : Download
class Loading(val percent: Int) : Download
class Done(val size: Int) : Download
class Failed(val reason: String) : Download

// Every allowed move between states, in one place
fun progress(state: Download, percent: Int): Download = when (state) {
    Waiting -> Loading(percent)
    // 12 is the file's size in MB, made up for this example
    is Loading -> if (percent >= 100) Done(12) else Loading(percent)
    is Done -> state          // finished: nothing changes it any more
    is Failed -> state
}

fun show(state: Download): String = when (state) {
    Waiting -> "Waiting..."
    is Loading -> "Loading \${state.percent}%"
    is Done -> "Done: \${state.size} MB"
    is Failed -> "Failed: \${state.reason}"
}

fun main() {
    var state: Download = Waiting
    println(show(state))                 // Waiting...
    state = progress(state, 40)
    println(show(state))                 // Loading 40%
    state = progress(state, 100)
    println(show(state))                 // Done: 12 MB
    state = progress(state, 50)
    println(show(state))                 // Done: 12 MB (no going back)
}`,
        play: `enum class Light { RED, GREEN, YELLOW }

fun next(light: Light): Light = when (light) {
    Light.RED -> Light.GREEN
    Light.GREEN -> Light.YELLOW
    Light.YELLOW -> Light.RED
}

fun main() {
    var light = Light.RED
    for (tick in 1..5) {
        println("Tick $tick: $light")
        light = next(light)
    }
    // The light is always in exactly one state, and next() lists every move.
    // Add a state FLASHING that comes after YELLOW and goes to RED.
    // Kotlin points at the when until you handle it.
}`,
        remember: 'A state machine is in exactly one state at a time. Events move it only along the transitions you wrote, all in one when.',
        mistakes: [
          { title: 'Booleans that can contradict each other', bad: `class Player {
    var isPlaying = false
    var isPaused = false
}
// Nothing stops isPlaying and isPaused both being true`, good: `enum class PlayerState { STOPPED, PLAYING, PAUSED }

class Player {
    var state = PlayerState.STOPPED
}`, why: 'With one <code>state</code> the player is always in exactly one of the three. The impossible fourth combination can’t even be written.' },
        ],
        terms: [
          { term: 'state machine', def: 'A design where something is always in exactly one of a fixed set of states, and only the listed transitions move it to another.' },
          { term: 'event', def: 'Something that happens and may change the state, such as someone pressing Lock.' },
          { term: 'transition', def: 'A rule: in state A, event E leads to state B.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A traffic light goes red, then green, then yellow, then red again. Finish its transitions.', code: `enum class Light { RED, GREEN, YELLOW }

fun next(light: Light): Light = [[when]] (light) {
    Light.RED -> Light.GREEN
    Light.GREEN -> Light.[[YELLOW]]
    Light.YELLOW -> Light.RED
}`, why: 'One <code>when</code> over the enum holds every transition, and Kotlin checks that every state has one.' },
          { type: 'bug', prompt: 'After yellow the light should turn red, but it goes back to green. Tap the wrong line.', code: `enum class Light { RED, GREEN, YELLOW }

fun next(light: Light): Light = when (light) {
    Light.RED -> Light.GREEN
    Light.GREEN -> Light.YELLOW
    Light.YELLOW -> Light.GREEN
}`, bug: 5, fix: '    Light.YELLOW -> Light.RED', why: 'Every transition lives in one place, so a wrong move is one line to find and fix.' },
        ],
        quiz: [
          { q: 'A player has <code>var isPlaying</code> and <code>var isPaused</code>. How many combinations can the two make?', options: ['Four, and one of them makes no sense', 'Three', 'Two'], a: 0, why: 'Two Booleans give 2 × 2 = 4 combinations. Playing and paused at once is the impossible one.' },
          { q: 'With the door rules above, the door is LOCKED and the event OPEN arrives. What is the state after?', options: ['<code>LOCKED</code>', '<code>OPEN</code>', '<code>CLOSED</code>'], a: 0, why: 'From LOCKED, only UNLOCK leads anywhere. Any other event leaves the state as it is.' },
          { q: 'One state needs its own data, like a percent while loading. Which Kotlin tool fits?', options: ['A sealed interface with a class for that state', 'An enum plus a few Booleans', 'A plain String'], a: 0, why: 'Each member of a sealed family can carry its own properties, and <code>when</code> still checks you handled them all.' },
        ],
        docs: [['Enum classes', 'https://kotlinlang.org/docs/enum-classes.html'], ['Sealed classes and interfaces', 'https://kotlinlang.org/docs/sealed-classes.html']],
      },
    ],
  });
})();
