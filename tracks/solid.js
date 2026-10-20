/* SOLID principles track. Same shape as tracks/kotlin.js.
   Five design principles applied to Kotlin code; builds on the OOP basics track (tracks/oop.js).
   The demos use only the shared kit (Lab.ui), so this track has no css of its own. */
(() => {
  Lab.addTrack({
    id: 'solid',
    title: 'SOLID principles',
    description: 'Five rules of thumb that keep your classes easy to change, one lesson each, with small Kotlin programs you can run and fix.',
    group: 'Foundations',
    requires: ['oop'],
    lessons: [
      {
        id: 'srp',
        title: 'Single responsibility',
        tagline: 'One class, one reason to change.',
        goals: ['Spot a class that does two different jobs', 'Ask “who would ask me to change this?”', 'Split it into two classes with one job each'],
        level: 'intermediate', introduces: [],
        body: `
<p>A shop app has a <code>Cart</code> class. It adds up the prices, and it also writes the text of the receipt. One morning the shop owner wants a new price rule, and a designer wants the receipt to say “You pay” instead of “Total”. Two people, two different wishes, and both of them have to edit the same class. While you change the text, you could break the adding up.</p>
<p>SOLID is the name for five <em>design principles</em>: rules of thumb that keep code easy to change. Each letter is one principle, and this track has one lesson for each. The S is the <em>single responsibility principle</em>: a class should have one job, which means one reason to change. A good test is to ask who would ask you to change it. If the answers are different people with different wishes, the class has more than one job.</p>
<p>The fix is to split it. <code>Cart</code> keeps the prices and gives the total. A new class, <code>Receipt</code>, turns a total into text. Now the price rule changes only <code>Cart</code>, and the new wording changes only <code>Receipt</code>. Each class is small and you can read it in a few seconds. This is cohesion from the OOP track, used as a rule: everything in a class should serve the same job.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 280,
            nodes: [
              { id: 'price', label: 'Shop owner<small>“10% off over 50”</small>', x: 20, y: 22, tone: 'warm' },
              { id: 'text', label: 'Designer<small>“Say You pay, not Total”</small>', x: 20, y: 78, tone: 'warm' },
              { id: 'cart', label: 'Cart<small>prices · total · receipt text</small>', x: 72, y: 50 },
              { id: 'cart2', label: 'Cart<small>prices · total</small>', x: 72, y: 22, tone: 'ok', hidden: true },
              { id: 'receipt', label: 'Receipt<small>receipt text</small>', x: 72, y: 78, tone: 'ok', hidden: true },
            ],
            predict: {
              q: 'This <code>Cart</code> keeps prices, adds them up and writes the receipt text. How many different reasons to change does it have?',
              options: ['One', 'Two', 'Three'],
              a: 1,
              why: 'Keeping prices and adding them up are the same job: the money. Writing the text is a second job, and it changes for a different person.',
            },
            frames: [
              { hl: ['cart'], say: 'Before: one <code>Cart</code> class does everything. Two people will ask for changes this week.' },
              { add: [['price', 'cart', 'edit', 'warm']], hl: ['cart'], say: 'The shop owner wants a new price rule. You open <code>Cart</code>.' },
              { add: [['text', 'cart', 'edit', 'warm']], hl: ['cart'], say: 'The designer wants new wording. You open <code>Cart</code> again. Two reasons to change, one class: each edit can break the other job.' },
              { remove: [['price', 'cart'], ['text', 'cart']], gone: ['cart'], show: ['cart2', 'receipt'], say: 'Split by reason to change. <code>Cart</code> keeps the money part. <code>Receipt</code> gets the text part.' },
              { add: [['price', 'cart2', 'edit', 'ok']], hl: ['cart2'], say: 'The price rule now changes <code>Cart</code> only.' },
              { add: [['text', 'receipt', 'edit', 'ok']], hl: ['receipt'], say: 'The new wording changes <code>Receipt</code> only. <code>Cart</code> isn’t opened at all, so it can’t break.' },
            ],
          });
        },
        code: `// Job: keep the prices. Changes when the price rules change.
class Cart {
    private val prices = mutableListOf<Int>()
    fun add(price: Int) { prices.add(price) }
    fun total() = prices.sum()
}

// Job: write the text. Changes when the wording changes.
class Receipt {
    fun text(total: Int) = "Total: $total"
}

fun main() {
    val cart = Cart()
    cart.add(12)
    cart.add(8)
    println(Receipt().text(cart.total()))   // Total: 20
}`,
        play: `// Keeps the prices. Changes only when the price rules change.
class Cart {
    private val prices = mutableListOf<Int>()

    fun add(price: Int) {
        prices.add(price)
    }

    fun total() = prices.sum()
}

// Turns a total into text. Changes only when the text should look different.
class Receipt {
    fun text(total: Int) = "Total: $total"
}

fun main() {
    val cart = Cart()
    cart.add(12)
    cart.add(8)
    println(Receipt().text(cart.total()))
    // Make the receipt say "You pay 20" instead.
    // Which class did you have to open?
}`,
        remember: 'One class, one job. If two different people would ask you to change a class, split it into two.',
        mistakes: [
          { title: 'One class with two jobs', bad: `class Cart {
    private val prices = mutableListOf<Int>()
    fun add(price: Int) { prices.add(price) }
    fun total() = prices.sum()
    fun receipt() = "Total: \${total()}"   // a second job
}`, good: `class Cart {
    private val prices = mutableListOf<Int>()
    fun add(price: Int) { prices.add(price) }
    fun total() = prices.sum()
}

class Receipt {
    fun text(total: Int) = "Total: $total"
}`, why: 'The money and the wording change for different reasons. In two classes, a change to one can’t break the other.' },
        ],
        terms: [
          { term: 'design principle', def: 'A rule of thumb for arranging code so it stays easy to change. It is advice, not a rule the compiler checks.' },
          { term: 'SOLID', def: 'Five design principles, one per letter: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion.' },
          { term: 'single responsibility', def: 'A class has one job, so it has one reason to change. Ask: who would ask me to change this?' },
        ],
        challenges: [
          { type: 'blank', prompt: '<code>Scores</code> keeps the points, <code>ScoreText</code> writes the line. Fill in the gaps so it prints <code>Score: 7</code>.', code: `class Scores {
    private val points = mutableListOf<Int>()
    fun add(p: Int) { points.add(p) }
    fun [[total]]() = points.sum()
}

class ScoreText {
    fun line(total: Int) = "Score: $total"
}

fun main() {
    val scores = Scores()
    scores.add(3)
    scores.add(4)
    println([[ScoreText]]().line(scores.total()))
}`, why: 'The numbers come from <code>Scores</code>, and the text comes from <code>ScoreText</code>. Each class does its own job.' },
          { type: 'bug', prompt: 'After the split, Kotlin says <code>Unresolved reference \'receipt\'.</code> Tap the line.', code: `class Cart {
    private val prices = mutableListOf<Int>()
    fun add(price: Int) { prices.add(price) }
    fun total() = prices.sum()
}

class Receipt {
    fun text(total: Int) = "Total: $total"
}

fun main() {
    val cart = Cart()
    cart.add(12)
    println(cart.receipt())
}`, bug: 13, fix: '    println(Receipt().text(cart.total()))', why: 'Writing the text is not <code>Cart</code>’s job any more. Ask <code>Cart</code> for the total, then hand it to <code>Receipt</code>.' },
        ],
        quiz: [
          { q: 'What does “single responsibility” mean for a class?', options: ['It has one job, so one reason to change', 'It has only one function', 'Only one object can be made from it'], a: 0, why: 'A class can have several functions, as long as they all serve the same job.' },
          { q: 'A <code>Profile</code> class loads the user’s name and also picks the colors of the profile screen. Who might ask you to change it?', options: ['Two different people: whoever owns the data and the designer', 'Nobody, it works', 'Only the person who wrote it'], a: 0, why: 'Two different askers means two jobs. Split it into a class for the data and one for the look.' },
          { q: 'You split <code>Cart</code> into <code>Cart</code> and <code>Receipt</code>. The designer changes the wording. Which class do you edit?', options: ['<code>Receipt</code> only', '<code>Cart</code> only', 'Both'], a: 0, why: 'The wording is <code>Receipt</code>’s one job, so <code>Cart</code> stays untouched.' },
        ],
        docs: [['Guide to app architecture', 'https://developer.android.com/topic/architecture']],
      },

      {
        id: 'open-closed',
        title: 'Open/closed',
        tagline: 'Add new behaviour without editing code that already works.',
        goals: ['See why a growing <code>when</code> must be edited again and again', 'Add a new case as a new class behind an interface', 'Leave working code untouched when the app grows'],
        level: 'intermediate', introduces: [],
        body: `
<p>The shop app gives discounts. At first a function with a <code>when</code> handles them: <code>"HALF"</code> halves the total, <code>"TEN"</code> takes 10 off. Every new discount means opening that function and adding a branch. One wrong edit there, and every discount in the shop is broken, even the ones that worked yesterday.</p>
<p>The O in SOLID is the <em>open/closed principle</em>: code should be open for extension and closed for modification. <em>Extension</em> means adding new behaviour. This is not the Kotlin extension functions you met earlier: here extension means adding a new class. <em>Modification</em> means editing code that already works. So: add new things by writing new code, not by changing old code.</p>
<p>An interface makes that possible. <code>interface Discount { fun newTotal(total: Int): Int }</code> is the promise, and each discount is its own small class that keeps it. <code>checkout</code> asks for any <code>Discount</code>, the polymorphism you saw in the OOP track. A new discount is a new class, and <code>checkout</code> works with it without one edit. A <code>when</code> is still fine for a set of cases that will never grow, like the days of the week. The principle is for the places where you keep adding.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `interface Discount {
    fun newTotal(total: Int): Int
}

class HalfPrice : Discount {
    override fun newTotal(total: Int) = total / 2
}

class TenOff : Discount {
    override fun newTotal(total: Int) = total - 10
}

fun checkout(total: Int, discount: Discount) {
    println("You pay \${discount.newTotal(total)}")
}

fun main() {
    checkout(40, HalfPrice())
    checkout(40, TenOff())
}`,
            predict: {
              q: '<code>TenOff</code> was added to the shop today. Which other part had to be edited so <code>checkout</code> can use it?',
              options: ['<code>checkout</code>', 'The <code>Discount</code> interface', 'Nothing else'],
              a: 2,
              why: '<code>checkout</code> asks for any <code>Discount</code>. A new class that keeps the promise works with it right away.',
            },
            frames: [
              { line: [1, 2], say: 'The promise: every discount can turn a total into a new total.' },
              { line: [5, 6], say: '<code>HalfPrice</code> has been in the shop for months. It keeps the promise its own way.' },
              { line: [9, 10], say: '<code>TenOff</code> is new today. It was added as a new class. No old line in the file was changed.' },
              { line: [13, 14], say: '<code>checkout</code> knows only the interface. It has no idea which discounts exist.' },
              { line: 18, out: 'You pay 20', say: 'With <code>HalfPrice</code>, the call inside <code>checkout</code> runs <code>HalfPrice</code>’s <code>newTotal</code>: 40 / 2 is 20.' },
              { line: 19, out: 'You pay 30', say: 'With <code>TenOff</code>, the same untouched <code>checkout</code> gives 40 - 10 = 30.' },
            ],
          });
        },
        code: `interface Discount {
    fun newTotal(total: Int): Int
}

class HalfPrice : Discount {
    override fun newTotal(total: Int) = total / 2
}

class TenOff : Discount {
    override fun newTotal(total: Int) = total - 10
}

// Never edited again: it works with any Discount
fun checkout(total: Int, discount: Discount) {
    println("You pay \${discount.newTotal(total)}")
}

fun main() {
    checkout(40, HalfPrice())   // You pay 20
    checkout(40, TenOff())      // You pay 30
}`,
        play: `interface Discount {
    fun newTotal(total: Int): Int
}

class HalfPrice : Discount {
    override fun newTotal(total: Int) = total / 2
}

class NoDiscount : Discount {
    override fun newTotal(total: Int) = total
}

fun checkout(total: Int, discount: Discount) {
    println("You pay \${discount.newTotal(total)}")
}

fun main() {
    checkout(60, HalfPrice())
    checkout(60, NoDiscount())
    // Add a class QuarterOff that takes a quarter off (total - total / 4),
    // and call checkout with it.
    // You should not need to touch checkout at all.
}`,
        remember: 'Open for extension, closed for modification: add a new class that keeps the interface instead of editing code that already works.',
        mistakes: [
          { title: 'A when that grows with every new case', bad: `fun newTotal(code: String, total: Int): Int {
    return when (code) {
        "HALF" -> total / 2
        "TEN" -> total - 10
        // every new discount: edit here again
        else -> total
    }
}`, good: `interface Discount {
    fun newTotal(total: Int): Int
}

class HalfPrice : Discount {
    override fun newTotal(total: Int) = total / 2
}

class TenOff : Discount {
    override fun newTotal(total: Int) = total - 10
}`, why: 'With the interface, a new discount is one new class. The code that already works is never opened, so it can’t break.' },
        ],
        terms: [
          { term: 'open/closed principle', def: 'Code should be open for extension (you can add behaviour) and closed for modification (you don’t edit what already works).' },
          { term: 'extension', def: 'In open/closed: adding new behaviour, for example a new class that keeps an existing interface. Not the same as a Kotlin extension function.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add a new discount without touching <code>checkout</code>.', code: `class TwoOff : [[Discount]] {
    [[override]] fun newTotal(total: Int) = total - 2
}`, why: '<code>: Discount</code> makes <code>TwoOff</code> keep the promise, and <code>override</code> writes its own version of <code>newTotal</code>.' },
          { type: 'bug', prompt: 'Kotlin says <code>Argument type mismatch: actual type is \'TenOff\', but \'HalfPrice\' was expected.</code> Tap the line.', code: `interface Discount {
    fun newTotal(total: Int): Int
}

class HalfPrice : Discount {
    override fun newTotal(total: Int) = total / 2
}

class TenOff : Discount {
    override fun newTotal(total: Int) = total - 10
}

fun checkout(total: Int, discount: HalfPrice) {
    println("You pay \${discount.newTotal(total)}")
}

fun main() {
    checkout(40, TenOff())
}`, bug: 12, fix: 'fun checkout(total: Int, discount: Discount) {', why: 'Asking for one exact class closes the door on every other discount. Ask for the interface, and every class that keeps it fits.' },
        ],
        quiz: [
          { q: 'What does “closed for modification” mean?', options: ['You don’t edit code that already works to add something new', 'Nobody may ever read the code', 'The class is <code>private</code>'], a: 0, why: 'New behaviour goes into new code. The old code stays as it is.' },
          { q: 'The shop wants a 20% off discount. With the <code>Discount</code> interface, what do you write?', options: ['A new class that keeps <code>Discount</code>', 'A new branch inside <code>checkout</code>', 'A second <code>checkout</code> function'], a: 0, why: 'One new class, whose <code>newTotal</code> returns <code>total * 8 / 10</code>. <code>checkout</code> already works with any <code>Discount</code>.' },
        ],
        docs: [['Interfaces', 'https://kotlinlang.org/docs/interfaces.html']],
      },

      {
        id: 'liskov',
        title: 'Liskov substitution',
        tagline: 'A class that keeps an interface must keep its promise too.',
        goals: ['Tell the difference between matching an interface and keeping its promise', 'Spot a class that compiles but surprises the code using it', 'Fix it so any class that keeps the interface can stand in for it'],
        level: 'intermediate', introduces: [],
        body: `
<p>A notes app saves notes through a <code>NoteStore</code> interface. Someone writes a <code>DemoStore</code> for showing the app off. It compiles, the app runs, and then a user types “Buy milk”, taps Save, and the note is gone. Nothing crashed. The class matched the interface but didn’t do what the interface promised.</p>
<p>The L in SOLID is the <em>Liskov substitution principle</em>, named after the computer scientist Barbara Liskov. <em>Substitution</em> means putting one thing in the place of another. The principle says: anywhere the code expects a <code>NoteStore</code>, any class that keeps <code>NoteStore</code> must work without surprises. That class is called a <em>subtype</em>, and the same goes for a child class and its <code>open</code> parent.</p>
<p>The compiler checks only the shape: the names, the parameters and the return types. It can’t check the meaning, like “after <code>save</code>, the note is in <code>all()</code>”. So write the promise down in a comment above the interface, and make every class keep it. If a class can’t keep the promise, it shouldn’t claim the interface at all.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `interface NoteStore {
    // Promise: after save(note), all() includes that note
    fun save(note: String)
    fun all(): List<String>
}

class ListStore : NoteStore {
    private val notes = mutableListOf<String>()
    override fun save(note: String) { notes.add(note) }
    override fun all() = notes
}

class DemoStore : NoteStore {
    override fun save(note: String) { }
    override fun all() = listOf("Welcome!")
}

fun addNote(store: NoteStore) {
    store.save("Buy milk")
    println(store.all())
}

fun main() {
    addNote(ListStore())
    addNote(DemoStore())
}`,
            varsTitle: 'Inside the store',
            predict: {
              q: 'The second call passes a <code>DemoStore</code>. What does it print?',
              options: ['<code>[Welcome!, Buy milk]</code>', '<code>[Welcome!]</code>', 'A compile error'],
              a: 1,
              why: 'It compiles, because <code>DemoStore</code> has the right shape. But its <code>save</code> does nothing, so “Buy milk” is lost.',
            },
            frames: [
              { line: [1, 2], say: 'The promise is written in a comment. The compiler can’t read it, so people have to keep it.' },
              { line: 24, vars: { notes: '[]' }, say: 'First, a <code>ListStore</code>. Its list starts empty.' },
              { line: [19, 9], vars: { notes: '[Buy milk]' }, say: '<code>save</code> adds the note to the list.' },
              { line: 20, out: '[Buy milk]', say: 'The note is there. <code>ListStore</code> keeps the promise.' },
              { line: [25, 14], vars: { notes: '(none in DemoStore)' }, say: 'Now a <code>DemoStore</code> in the same place. Its <code>save</code> has an empty body: it does nothing.' },
              { line: [20, 15], out: '[Welcome!]', say: '“Buy milk” is gone. Same shape, broken promise: <code>DemoStore</code> can’t stand in for a <code>NoteStore</code>.' },
            ],
          });
        },
        code: `interface NoteStore {
    // Promise: after save(note), all() includes that note
    fun save(note: String)
    fun all(): List<String>
}

class ListStore : NoteStore {
    private val notes = mutableListOf<String>()
    override fun save(note: String) { notes.add(note) }
    override fun all() = notes
}

// Starts with a welcome note, and still keeps the promise
class DemoStore : NoteStore {
    private val notes = mutableListOf("Welcome!")
    override fun save(note: String) { notes.add(note) }
    override fun all() = notes
}

fun addNote(store: NoteStore) {
    store.save("Buy milk")
    println(store.all())
}

fun main() {
    addNote(ListStore())   // [Buy milk]
    addNote(DemoStore())   // [Welcome!, Buy milk]
}`,
        play: `interface Counter {
    // Promise: every add() makes count() one bigger
    fun add()
    fun count(): Int
}

class TapCounter : Counter {
    private var taps = 0
    override fun add() { taps++ }
    override fun count() = taps
}

class StuckCounter : Counter {
    override fun add() { }
    override fun count() = 0
}

fun tapThreeTimes(counter: Counter) {
    counter.add()
    counter.add()
    counter.add()
    println("Taps: \${counter.count()}")
}

fun main() {
    tapThreeTimes(TapCounter())
    tapThreeTimes(StuckCounter())
    // StuckCounter compiles, but it breaks the promise.
    // Fix it so both lines print Taps: 3.
}`,
        remember: 'Matching the interface is not enough: every class that keeps it must do what it promises, so code can use any of them without surprises.',
        mistakes: [
          { title: 'An empty body that breaks the promise', bad: `class DemoStore : NoteStore {
    override fun save(note: String) { }   // the note is lost
    override fun all() = listOf("Welcome!")
}`, good: `class DemoStore : NoteStore {
    private val notes = mutableListOf("Welcome!")
    override fun save(note: String) { notes.add(note) }
    override fun all() = notes
}`, why: 'An empty <code>override</code> compiles fine, but code that trusts the promise gets a wrong result. The fixed version can still start with a welcome note.' },
        ],
        terms: [
          { term: 'Liskov substitution principle', def: 'Wherever code expects a type, any subtype must work there without surprises.' },
          { term: 'subtype', def: 'A class that keeps an interface, or a child class of a parent. A <code>ListStore</code> is a subtype of <code>NoteStore</code>.' },
          { term: 'substitution', def: 'Putting one thing in the place of another, like passing a <code>DemoStore</code> where a <code>NoteStore</code> is expected.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>DemoStore</code> keep the promise: after <code>save</code>, the note is in <code>all()</code>.', code: `class DemoStore : NoteStore {
    private val notes = [[mutableListOf]]("Welcome!")
    override fun save(note: String) { notes.[[add]](note) }
    override fun all() = notes
}`, why: 'A list that can change, and a <code>save</code> that really adds to it. Now the class works anywhere a <code>NoteStore</code> is expected.' },
          { type: 'bug', prompt: 'This compiles, but one line breaks the promise in the comment. Tap it.', code: `interface Counter {
    // Promise: every add() makes count() one bigger
    fun add()
    fun count(): Int
}

class DoubleCounter : Counter {
    private var n = 0
    override fun add() { n += 2 }
    override fun count() = n
}`, bug: 8, fix: '    override fun add() { n++ }', why: 'The promise says one bigger. <code>n += 2</code> compiles, but code that counts taps would show twice as many.' },
        ],
        quiz: [
          { q: 'What does the compiler check when a class keeps an interface?', options: ['The shape: names, parameters, return types', 'That every function does what the comment promises', 'Nothing at all'], a: 0, why: 'The meaning is up to you. That is why the promise belongs in a comment, and why this principle exists.' },
          { q: '<code>StuckCounter</code> keeps <code>Counter</code>, but its <code>add()</code> does nothing. What does the principle say?', options: ['It breaks Liskov substitution: it can’t stand in for a <code>Counter</code>', 'It is fine, because it compiles', 'It is fine, because no exception is thrown'], a: 0, why: 'Code that trusts the promise gets <code>0</code> after three taps. Compiling is not the same as keeping a promise.' },
        ],
        docs: [['Inheritance', 'https://kotlinlang.org/docs/inheritance.html']],
      },

      {
        id: 'isp',
        title: 'Interface segregation',
        tagline: 'Small interfaces, so no class promises what it can’t do.',
        goals: ['Spot an interface that forces a class to fake a function', 'Split one big interface into small ones', 'Let a class keep only the interfaces it really can'],
        level: 'intermediate', introduces: [],
        body: `
<p>A music app has one interface for everything you can listen to: <code>Media</code>, with <code>play()</code> and <code>download()</code>. Songs can do both. Then live radio arrives. A live stream can’t be saved, but <code>Media</code> says it must have <code>download()</code>, so the radio writes one that does nothing. On the screen, the Save button for the radio does nothing either.</p>
<p>The I in SOLID is the <em>interface segregation principle</em>. <em>Segregation</em> means splitting apart. The principle says: no class should be forced to promise functions it can’t keep. Prefer several small interfaces over one big one.</p>
<p>Split <code>Media</code> into <code>Playable</code> with <code>play()</code> and <code>Downloadable</code> with <code>download()</code>. A class can keep several interfaces, separated by commas: <code>class Song : Playable, Downloadable</code>. <code>Radio</code> keeps only <code>Playable</code>, and has no fake function. A <code>List&lt;Downloadable&gt;</code> now accepts songs and refuses radios, so the Save button only appears where saving works. Notice the link to the last lesson: a forced empty function is exactly the kind of broken promise Liskov warns about.</p>`,
        visual(el) {
          const row = (name, kind, save, cls) => `<div class="ui-m-row"><span class="ui-m-av"></span><div><b>${name}</b><br><span class="ui-m-muted">${kind}</span></div><span class="ui-m-chip ${cls}-play">Play</span>${save ? `<span class="ui-m-chip ${cls}-save">Save</span>` : ''}</div>`;
          const screen = (radioSave, extra = '') => `<div class="ui-m-bar">Listen</div><div class="ui-m-body">${row('Rain', 'Song', true, 'song')}${row('City FM', 'Live radio', radioSave, 'radio')}</div>${extra}`;
          const snack = t => `<div class="ui-m-snack">${t}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'What the code does',
            predict: {
              q: 'A live stream can’t be saved, but <code>Media</code> forces <code>Radio</code> to have <code>download()</code>. What happens when you tap Save on City FM?',
              options: ['The stream is saved', 'Nothing: <code>download()</code> was written to do nothing', 'The app doesn’t compile'],
              a: 1,
              why: 'It compiles, because <code>Radio</code> wrote a <code>download()</code>. But it is a fake that does nothing, so the button does nothing.',
            },
            frames: [
              { screen: screen(true), log: 'Media: play() + download()', say: 'Before: one big interface, <code>Media</code>. Every item must have both functions, so every row gets a Save button.' },
              { tap: '.song-save', screen: screen(true, snack('Saved Rain')), log: 'song.download() → "Saved Rain"', say: 'Save on a song works. Songs can keep both promises.' },
              { tap: '.radio-save', screen: screen(true), log: 'radio.download() → ""', say: 'Save on the radio does nothing. <code>Radio</code> had to write a <code>download()</code> it can’t really do.' },
              { screen: screen(false), log: ['Playable: play()', 'Downloadable: download()'], say: 'Split the big interface into two small ones. Each one is a single promise.' },
              { screen: screen(false), log: ['class Song : Playable, Downloadable', 'class Radio : Playable'], say: 'Each class keeps only what it can do. The Save button is built only for <code>Downloadable</code> items, so the radio row has none.' },
              { tap: '.radio-play', screen: screen(false, snack('Live: City FM')), log: 'radio.play() → "Live: City FM"', say: 'Play still works for both, through <code>Playable</code>. No fake functions anywhere.' },
            ],
          });
        },
        code: `interface Playable {
    fun play(): String
}

interface Downloadable {
    fun download(): String
}

class Song(val title: String) : Playable, Downloadable {
    override fun play() = "Playing $title"
    override fun download() = "Saved $title"
}

class Radio(val station: String) : Playable {
    override fun play() = "Live: $station"
}

fun main() {
    val queue: List<Playable> = listOf(Song("Rain"), Radio("City FM"))
    for (item in queue) {
        println(item.play())
    }
    // Playing Rain
    // Live: City FM

    val offline: List<Downloadable> = listOf(Song("Rain"), Song("Tide"))
    for (item in offline) {
        println(item.download())
    }
    // Saved Rain
    // Saved Tide
}`,
        play: `interface Playable {
    fun play(): String
}

interface Downloadable {
    fun download(): String
}

class Song(val title: String) : Playable, Downloadable {
    override fun play() = "Playing $title"
    override fun download() = "Saved $title"
}

class Radio(val station: String) : Playable {
    override fun play() = "Live: $station"
}

fun main() {
    val queue: List<Playable> = listOf(Song("Rain"), Radio("City FM"))
    for (item in queue) {
        println(item.play())
    }

    val offline: List<Downloadable> = listOf(Song("Rain"))
    for (item in offline) {
        println(item.download())
    }
    // Add a class Podcast(val episode: String) that keeps both promises.
    // Put a Podcast in both lists. Can a Radio go in the offline list?
}`,
        remember: 'Several small interfaces beat one big one: each class keeps only the promises it can really keep.',
        mistakes: [
          { title: 'A fake function to satisfy a big interface', bad: `interface Media {
    fun play(): String
    fun download(): String
}

class Radio(val station: String) : Media {
    override fun play() = "Live: $station"
    override fun download() = ""   // can't really do this
}`, good: `interface Playable {
    fun play(): String
}

interface Downloadable {
    fun download(): String
}

class Radio(val station: String) : Playable {
    override fun play() = "Live: $station"
}`, why: 'With small interfaces, <code>Radio</code> promises only what it can do. The fake <code>download()</code> disappears.' },
        ],
        terms: [
          { term: 'interface segregation principle', def: 'No class should be forced to promise functions it can’t keep. Split a big interface into small ones.' },
          { term: 'segregation', def: 'Splitting apart. Here: splitting one big interface into several small ones.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A song can play and download. A radio can only play. Give each class the right interfaces.', code: `class Song(val title: String) : Playable, [[Downloadable]] {
    override fun play() = "Playing $title"
    override fun download() = "Saved $title"
}

class Radio(val station: String) : [[Playable]] {
    override fun play() = "Live: $station"
}`, why: 'Several interfaces are separated by commas. <code>Radio</code> keeps only the one it can.' },
          { type: 'bug', prompt: 'Kotlin says <code>Class \'Radio\' is not abstract and does not implement abstract member: fun download(): String</code>. A radio can’t download. Tap the line.', code: `interface Playable {
    fun play(): String
}

interface Downloadable {
    fun download(): String
}

class Radio(val station: String) : Playable, Downloadable {
    override fun play() = "Live: $station"
}`, bug: 8, fix: 'class Radio(val station: String) : Playable {', why: 'Don’t add a fake <code>download()</code> to calm the compiler. Stop claiming <code>Downloadable</code>: <code>Radio</code> keeps only <code>Playable</code>.' },
        ],
        quiz: [
          { q: 'A class has to write <code>override fun download() = ""</code> because its interface forces it. What is the better fix?', options: ['Split the interface so the class doesn’t have to promise <code>download</code>', 'Keep the empty version, it compiles', 'Add even more functions to the interface'], a: 0, why: 'A forced fake function is the sign of an interface that is too big.' },
          { q: 'How does a class keep two interfaces?', options: ['<code>class Song : Playable, Downloadable</code>', '<code>class Song : Playable : Downloadable</code>', 'It can’t: only one interface per class'], a: 0, why: 'A class can keep several interfaces, separated by commas.' },
          { q: 'Can a <code>Radio</code> (only <code>Playable</code>) go in a <code>List&lt;Downloadable&gt;</code>?', options: ['No, it doesn’t keep <code>Downloadable</code>', 'Yes, every class fits every list', 'Yes, but only once'], a: 0, why: 'Kotlin refuses it with a type mismatch. That is what keeps the Save button away from radios.' },
        ],
        docs: [['Interfaces', 'https://kotlinlang.org/docs/interfaces.html']],
      },

      {
        id: 'dip',
        title: 'Dependency inversion',
        tagline: 'Ask for an interface and let someone pass the real thing in.',
        goals: ['Spot a class that builds the helper it needs inside itself', 'Ask for an interface in the constructor instead', 'Pass in a real or a made-up helper from outside'],
        level: 'intermediate', introduces: [],
        body: `
<p>A weather app has a <code>WeatherScreen</code>. Inside it, the screen builds its own <code>OnlineWeather</code>, which asks a server over the internet. Now you want to see how the screen looks on a sunny day, but it is raining outside, and on the train there is no internet. There is no way to give the screen other weather without editing it.</p>
<p>The helper a class needs to do its job is called a <em>dependency</em>: the screen depends on its weather source. The D in SOLID is the <em>dependency inversion principle</em>: the class that does the main work (here the screen) should depend on an interface, not on one exact helper class. The helper keeps that interface. Before, the screen needed <code>OnlineWeather</code>. Now <code>OnlineWeather</code> has to fit the screen’s interface. Who depends on whom has flipped: that is the inversion.</p>
<p>In practice it is one change. Instead of building the helper inside, the class asks for it in its constructor: <code>class WeatherScreen(private val source: WeatherSource)</code>. Whoever makes the screen chooses: <code>WeatherScreen(OnlineWeather())</code> in the app, or <code>WeatherScreen(FakeWeather("Sunny"))</code> to try it out. Passing a dependency in like this is called <em>dependency injection</em>, and Android apps use it everywhere.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 290,
            nodes: [
              { id: 'screen', label: 'WeatherScreen', x: 50, y: 12 },
              { id: 'iface', label: 'WeatherSource<small>interface</small>', x: 50, y: 50, tone: 'warm', hidden: true },
              { id: 'online', label: 'OnlineWeather<small>asks a server</small>', x: 24, y: 88, tone: 'muted' },
              { id: 'fake', label: 'FakeWeather<small>made-up weather</small>', x: 76, y: 88, tone: 'ok', hidden: true },
            ],
            predict: {
              q: '<code>WeatherScreen</code> builds <code>OnlineWeather()</code> inside itself. Can <code>main</code> show it with made-up sunny weather, without editing <code>WeatherScreen</code>?',
              options: ['Yes: pass a FakeWeather to it', 'No: there is no way in', 'Yes, if the phone is offline'],
              a: 1,
              why: 'The screen has no constructor parameter, so nothing can be passed in. Kotlin says <code>Too many arguments for \'constructor(): WeatherScreen\'.</code>',
            },
            frames: [
              { add: [['screen', 'online', 'builds it inside', 'err']], say: 'Before: <code>WeatherScreen</code> builds its own <code>OnlineWeather</code>. The screen sits on top of one exact helper.' },
              { add: [['screen', 'online', 'builds it inside', 'err']], hl: ['online'], say: 'Rain outside, or no internet: the screen shows whatever the server says. To change that, you would have to edit the screen.' },
              { show: ['iface'], remove: [['screen', 'online']], add: [['screen', 'iface', 'asks for one', 'accent']], hl: ['iface'], say: 'Write an interface, <code>WeatherSource</code>. The screen asks for one in its constructor and knows nothing else.' },
              { add: [['online', 'iface', 'keeps it', 'accent']], hl: ['online'], say: '<code>OnlineWeather</code> keeps the interface. Its arrow now points up at the promise: that flip is the inversion.' },
              { show: ['fake'], add: [['fake', 'iface', 'keeps it', 'ok']], hl: ['fake'], say: '<code>FakeWeather</code> keeps the same promise and gives back any weather you choose.' },
              { hl: ['screen'], say: 'Whoever makes the screen decides: <code>WeatherScreen(OnlineWeather())</code> or <code>WeatherScreen(FakeWeather("Sunny"))</code>. The screen itself never changes.' },
            ],
          });
        },
        code: `interface WeatherSource {
    fun today(): String
}

// The real one would ask a weather server over the internet
class OnlineWeather : WeatherSource {
    override fun today() = "Rain, 12 degrees"
}

// Made-up weather, for trying the screen out
class FakeWeather(val text: String) : WeatherSource {
    override fun today() = text
}

// Knows only the interface. Its source is passed in.
class WeatherScreen(private val source: WeatherSource) {
    fun show() {
        println("Today: \${source.today()}")
    }
}

fun main() {
    WeatherScreen(OnlineWeather()).show()
    // Today: Rain, 12 degrees
    WeatherScreen(FakeWeather("Sunny, 25 degrees")).show()
    // Today: Sunny, 25 degrees
}`,
        play: `interface Sender {
    fun send(message: String)
}

class EmailSender : Sender {
    override fun send(message: String) {
        println("Email: $message")
    }
}

class Reminder(private val sender: Sender) {
    fun remind(task: String) {
        sender.send("Don't forget: $task")
    }
}

fun main() {
    val reminder = Reminder(EmailSender())
    reminder.remind("water the plants")
    // Write a class SmsSender that prints "SMS: $message".
    // Pass it to Reminder instead. Reminder itself stays the same.
}`,
        remember: 'Don’t build your helpers inside. Ask for an interface in the constructor, and let whoever makes the object pass the real one in.',
        mistakes: [
          { title: 'Building the helper inside the class', bad: `class WeatherScreen {
    private val source = OnlineWeather()   // always this one
    fun show() {
        println("Today: \${source.today()}")
    }
}`, good: `class WeatherScreen(private val source: WeatherSource) {
    fun show() {
        println("Today: \${source.today()}")
    }
}`, why: 'Built inside, the helper can never be swapped. Asked for in the constructor, any <code>WeatherSource</code> can be passed in, real or made-up.' },
        ],
        terms: [
          { term: 'dependency', def: 'A helper a class needs to do its job. <code>WeatherScreen</code> depends on a weather source.' },
          { term: 'dependency inversion principle', def: 'The class that does the main work (like the screen) depends on an interface, not on one exact helper class. The helpers keep that interface.' },
          { term: 'dependency injection', def: 'Passing a dependency in from outside, usually through the constructor: <code>WeatherScreen(FakeWeather("Sunny"))</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let <code>Reminder</code> work with any <code>Sender</code>, then pass one in.', code: `class Reminder(private val sender: [[Sender]]) {
    fun remind(task: String) {
        sender.send("Don't forget: $task")
    }
}

fun main() {
    val reminder = Reminder([[EmailSender]]())
    reminder.remind("call Lin")
}`, why: 'The constructor asks for the interface. <code>main</code> picks the real class and passes it in.' },
          { type: 'bug', prompt: 'Kotlin says <code>Argument type mismatch: actual type is \'SmsSender\', but \'EmailSender\' was expected.</code> Tap the line.', code: `interface Sender {
    fun send(message: String)
}

class EmailSender : Sender {
    override fun send(message: String) { println("Email: $message") }
}

class SmsSender : Sender {
    override fun send(message: String) { println("SMS: $message") }
}

class Reminder(private val sender: EmailSender) {
    fun remind(task: String) { sender.send("Don't forget: $task") }
}

fun main() {
    Reminder(SmsSender()).remind("call Lin")
}`, bug: 12, fix: 'class Reminder(private val sender: Sender) {', why: '<code>Reminder</code> asked for one exact class. Ask for the interface instead, and any sender fits.' },
        ],
        quiz: [
          { q: 'What is a dependency?', options: ['A helper a class needs to do its job', 'A class that has no functions', 'A line that has a bug'], a: 0, why: 'The weather source is a dependency of the screen; the sender is a dependency of the reminder.' },
          { q: 'Which version lets you pass made-up weather in?', options: ['<code>class WeatherScreen(private val source: WeatherSource)</code>', '<code>class WeatherScreen { private val source = OnlineWeather() }</code>', 'Both'], a: 0, why: 'Only a constructor parameter opens a way in. Built inside, the helper is fixed.' },
          { q: 'In the after picture, which way does <code>OnlineWeather</code>’s arrow point?', options: ['Up, at the <code>WeatherSource</code> interface it keeps', 'Down, at nothing', 'At <code>WeatherScreen</code>, which builds it'], a: 0, why: 'Both the screen and the helper point at the interface. That flip is what “inversion” means.' },
        ],
        docs: [['Dependency injection in Android', 'https://developer.android.com/training/dependency-injection']],
      },
    ],
  });
})();
