/* OOP basics track. Same shape as tracks/kotlin.js.
   Design ideas, not syntax: Kotlin class/interface syntax lives in the Kotlin track. SOLID lives in tracks/solid.js.
   Demos use the Lab.ui kit only. */
(() => {
  Lab.addTrack({
    id: 'oop',
    title: 'OOP basics',
    description: 'How to design with objects: modelling real things, identity, encapsulation, composition and inheritance, polymorphism, abstraction, cohesion and domain modelling, all in plain Kotlin.',
    group: 'Foundations',
    requires: ['kotlin'],
    lessons: [
      {
        id: 'objects',
        title: 'Objects model things',
        tagline: 'Read the problem: things become classes, actions become functions.',
        goals: ['Turn a short description into classes (the nouns) and functions (the verbs)', 'Decide which class a rule belongs in: the one that holds its data', 'Spot a rule that is repeated outside its object'],
        level: 'beginner', introduces: [],
        body: `
<p>A library app must remember, for every book, whether it is out on loan, and it must refuse to lend a book that is already out. Members may hold at most 3 books. Before writing any code, you have to decide: which classes does this app need, and where does each of those rules go?</p>
<p>You already give classes properties and functions (<a href="#kotlin.methods">Functions inside a class</a>). This lesson is about choosing them. Describing real things in code is called <em>modelling</em>, and programs are often built from objects that stand for real things: a book, a member, a lift.</p>
<p>A good way to start is to read a short description of the problem. The things in it (nouns) become classes. What they know becomes properties. What they do (verbs) becomes functions. “A <em>member</em> <em>borrows</em> a <em>book</em>. A book is either out or on the shelf.” gives you a Member class, a Book class, an <code>isOut</code> property and a <code>borrow</code> function.</p>
<p>Then put each rule next to the data it is about. “Not already out” is about a book, so the check lives in <code>Book.lend()</code>. “At most 3 books” is about what a member holds, so it lives in <code>Member.borrow()</code>. Each rule is written once, and every part of the app asks the object instead of repeating the check.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 400,
            nodes: [
              { id: 's1', label: '“A member borrows a book.”', x: 24, y: 9, tone: 'muted', hidden: true },
              { id: 's3', label: '“A member holds at most 3 books.”', x: 24, y: 32, tone: 'muted', hidden: true },
              { id: 's2', label: '“A book is out or on the shelf.”', x: 24, y: 62, tone: 'muted', hidden: true },
              { id: 'member', label: 'class Member<small>name, books</small>', x: 76, y: 9, hidden: true },
              { id: 'borrow', label: 'borrow(book)<small>at most 3</small>', x: 76, y: 32, tone: 'ok', hidden: true },
              { id: 'book', label: 'class Book<small>title, isOut</small>', x: 76, y: 62, hidden: true },
              { id: 'lend', label: 'lend()<small>not already out</small>', x: 76, y: 88, tone: 'ok', hidden: true },
            ],
            predict: {
              q: 'The rule “a member holds at most 3 books”: where should its check live?',
              options: ['In Member', 'In Book', 'In every screen that lends books'],
              a: 0,
              why: 'The rule is about what a member holds, and Member keeps that list. So the check goes next to it, written once.',
            },
            frames: [
              { show: ['s1', 's3', 's2'], say: 'Start from a short description of the problem, before any code.' },
              { show: ['member', 'book'], add: [['s1', 'member', 'noun', 'accent'], ['s2', 'book', 'noun', 'accent']], hl: ['member', 'book'], say: 'The nouns, <em>member</em> and <em>book</em>, become classes.' },
              { hl: ['s2', 'book'], say: 'What a thing knows becomes a property. A book knows whether it is out: <code>isOut</code>. A member knows which books they hold: <code>books</code>.' },
              { show: ['borrow'], add: [['member', 'borrow']], hl: ['s1', 'borrow'], say: 'The verb, <em>borrows</em>, becomes a function. The member is the one who borrows, so <code>borrow</code> goes in Member.' },
              { show: ['lend'], add: [['book', 'lend']], hl: ['lend'], say: 'To be borrowed, a book must be lent. Book gets <code>lend()</code>, the only code that changes <code>isOut</code>.' },
              { add: [['s3', 'borrow', 'rule', 'ok']], hl: ['s3', 'borrow'], say: '“At most 3” is about the member’s books, so the check goes in <code>Member.borrow()</code>.' },
              { add: [['s2', 'lend', 'rule', 'ok']], hl: ['s2', 'lend'], say: '“Not already out” is about the book, so the check goes in <code>Book.lend()</code>. Each rule lives next to its data, written once.' },
            ],
          });
        },
        code: `class Book(val title: String) {
    var isOut = false
        private set

    fun lend(): Boolean {
        if (isOut) {
            return false            // the book's rule: not already out
        }
        isOut = true
        return true
    }
}

class Member(val name: String) {
    private val books = mutableListOf<Book>()

    fun borrow(book: Book): Boolean {
        if (books.size >= 3) {
            return false            // the member's rule: at most 3 books
        }
        if (!book.lend()) {
            return false
        }
        books.add(book)
        return true
    }
}

fun main() {
    val ada = Member("Ada")
    val sam = Member("Sam")
    val book = Book("Blue Harbor")
    println(ada.borrow(book))   // true
    println(sam.borrow(book))   // false: the book is already out
}`,
        play: `class Lift(val topFloor: Int) {
    var floor = 0
        private set

    fun up() {
        if (floor < topFloor) {
            floor += 1
        }
    }

    fun down() {
        if (floor > 0) {
            floor -= 1
        }
    }
}

fun main() {
    val lift = Lift(3)
    lift.up()
    lift.up()
    println("Floor \${lift.floor}")
    lift.down()
    lift.down()
    lift.down()
    println("Floor \${lift.floor}")
    // Add a function goTo(target: Int) that calls up() or down() until the lift is there.
    // (If the target is above topFloor or below 0, do nothing.) Try lift.goTo(2).
}`,
        remember: 'Nouns in the description become classes, verbs become functions. Each rule goes in the class that holds the data it is about.',
        mistakes: [
          { title: 'Writing the rule outside the object', bad: `// in main, and again on every screen that lends books
if (!book.isOut) {
    book.isOut = true
}`, good: `book.lend()   // the rule is written once, inside Book`, why: 'Copies of a rule drift apart: fix one and the others stay wrong. With <code>private set</code> on <code>isOut</code>, the first version doesn’t even compile, and that is the point.' },
        ],
        terms: [
          { term: 'modelling', def: 'Describing real things in code: the things become classes, what they know becomes properties, what they do becomes functions.' },
          { term: 'behaviour', def: 'What an object can do: its member functions, like <code>lend()</code>. A rule about the object’s data belongs in its behaviour.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Model this: “A <b>ticket</b> has a seat number. A ticket can be <b>scanned</b> only once.” Fill in the class name and the function name.', code: `class [[Ticket]](val seat: Int) {
    var used = false
        private set

    fun [[scan]](): Boolean {
        if (used) {
            return false
        }
        used = true
        return true
    }
}`, why: 'The noun, ticket, becomes the class. The verb, scan, becomes its function. The “only once” rule lives inside <code>scan()</code>, next to <code>used</code>, the data it is about.' },
          { type: 'bug', prompt: 'Tapping twice should print <code>2</code>, but it prints <code>-2</code>. Tap the line that is wrong.', code: `class Counter {
    var count = 0
        private set

    fun tap() {
        count -= 1
    }
}

fun main() {
    val c = Counter()
    c.tap()
    c.tap()
    println(c.count)
}`, bug: 5, fix: '        count += 1', why: 'The behaviour is in one place, so the fix is in one place too: <code>tap()</code> should add 1.' },
        ],
        quiz: [
          { q: '“A <em>lamp</em> can be <em>switched</em> on.” Which word most likely becomes a class?', options: ['lamp', 'switched', 'on'], a: 0, why: 'A lamp is a thing (a noun), so it becomes a class. <em>Switched</em> is something done to it, so it becomes a function.' },
          { q: 'A shop app says: “A customer adds items to a basket.” Which word most likely becomes a function?', options: ['adds', 'customer', 'basket'], a: 0, why: 'Verbs are things an object does. Customer and basket are things, so they are more likely classes.' },
          { q: 'Where should the rule “a book that is out can’t be lent” live?', options: ['Inside <code>Book</code>, in <code>lend()</code>', 'In every screen that lends books', 'In <code>main</code>'], a: 0, why: 'Next to the data it is about, written once. Every screen then calls <code>book.lend()</code>.' },
        ],
        docs: [['Classes', 'https://kotlinlang.org/docs/classes.html']],
      },

      {
        id: 'identity',
        title: 'Same object or equal object',
        tagline: 'A variable points to an object, and two names can point to the same one.',
        goals: ['Explain what <code>val b = a</code> copies', 'Ask “same object?” with <code>===</code> and “equal?” with <code>==</code>', 'Make a real copy of a data class object with <code>copy()</code>'],
        level: 'beginner', introduces: ['==='],
        body: `
<p>Sam marks a book as out through one variable, and another variable suddenly says the book is out too. Nothing is broken: both names point at the same book. Knowing when two names share one object saves you from some very confusing bugs.</p>
<p>A variable doesn’t hold the object itself. It holds a <em>reference</em>: think of it as an arrow pointing at the object, which lives somewhere in the computer’s memory. <code>val b = a</code> copies the arrow, not the object. Now <code>a</code> and <code>b</code> are two names for one object, and a change made through <code>b</code> shows up through <code>a</code>. Each constructor call, like <code>Book("Blue Harbor")</code>, makes a new, separate object.</p>
<p>So there are two different questions. “Are these the very same object?” is about <em>identity</em>, and Kotlin asks it with <code>===</code> (three equals signs). “Do these two mean the same thing?” is about <em>equality</em>, asked with <code>==</code>. For a plain class, <code>==</code> checks identity too. For a data class, <code>==</code> compares the property values, as you saw earlier: two separate points with the same numbers are equal, but not identical.</p>
<p>Passing an object to a function passes the arrow as well. The function can change the object, and the caller sees the change.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 280,
            nodes: [
              { id: 'a', label: 'a', x: 12, y: 16, tone: 'muted', hidden: true },
              { id: 'b', label: 'b', x: 12, y: 46, tone: 'muted', hidden: true },
              { id: 'c', label: 'c', x: 12, y: 86, tone: 'muted', hidden: true },
              { id: 'o1', label: 'Book #1<small>"Blue Harbor"</small>', x: 68, y: 30, hidden: true },
              { id: 'out', label: 'isOut = true', x: 68, y: 56, tone: 'warm', hidden: true },
              { id: 'o2', label: 'Book #2<small>"Blue Harbor"</small>', x: 68, y: 86, hidden: true },
            ],
            predict: {
              q: '<code>val b = a</code>, then <code>b.lend()</code>. What does <code>println(a.isOut)</code> print?',
              options: ['<code>true</code>', '<code>false</code>', 'An error'],
              a: 0,
              why: '<code>a</code> and <code>b</code> point at the same book, so a change through one is seen through the other.',
            },
            frames: [
              { show: ['a', 'o1'], add: [['a', 'o1']], say: '<code>val a = Book("Blue Harbor")</code> makes a book object. <code>a</code> holds an arrow to it.' },
              { show: ['b'], add: [['b', 'o1', '', 'accent']], say: '<code>val b = a</code> copies the arrow. No new book: <code>b</code> points at the same object.' },
              { show: ['c', 'o2'], add: [['c', 'o2']], say: '<code>val c = Book("Blue Harbor")</code> calls the constructor again: a second object with the same title.' },
              { show: ['out'], add: [['o1', 'out', '', 'warm']], hl: ['b', 'o1'], say: '<code>b.lend()</code> follows b’s arrow and lends book #1.' },
              { hl: ['a', 'o1'], say: '<code>println(a.isOut)</code> prints <code>true</code>: a’s arrow leads to the same book. <code>c.isOut</code> is still <code>false</code>.' },
              { hl: ['a', 'b'], say: '<code>a === b</code> is <code>true</code>: one object. <code>a === c</code> is <code>false</code>: same title, two different objects.' },
            ],
          });
        },
        code: `class Cup(var tea: String)
data class Point(val x: Int, val y: Int)

fun refill(cup: Cup) {
    cup.tea = "mint"
}

fun main() {
    val mine = Cup("black")
    refill(mine)
    println(mine.tea)      // mint: the function got an arrow to the same cup

    val p = Point(1, 2)
    val q = Point(1, 2)
    println(p == q)        // true: same values
    println(p === q)       // false: two different objects
}`,
        play: `class Box(var label: String)
data class Size(val w: Int, val h: Int)

fun main() {
    val a = Box("toys")
    val b = a
    b.label = "books"
    println(a.label)
    println(a === b)

    val big = Size(3, 4)
    val same = Size(3, 4)
    println(big == same)
    println(big === same)
    // Make c = Box("books"). Is a == c? Is a === c? Guess first, then print.
}`,
        remember: 'val b = a copies the arrow, not the object. === asks “same object?”; == asks “equal?”.',
        mistakes: [
          { title: 'Expecting val b = a to make a copy', bad: `data class Note(var text: String)

val first = Note("milk")
val backup = first          // the same object
first.text = "eggs"
println(backup.text)        // eggs`, good: `data class Note(var text: String)

val first = Note("milk")
val backup = first.copy()   // a new object
first.text = "eggs"
println(backup.text)        // milk`, why: '<code>=</code> only copies the arrow. <code>copy()</code> builds a new object with the same values, so changing one leaves the other alone.' },
        ],
        terms: [
          { term: 'reference', def: 'What a variable holds for an object: an arrow to it, not the object itself. <code>val b = a</code> copies the arrow.' },
          { term: 'identity', def: 'Being one particular object. <code>a === b</code> is <code>true</code> only when both point at the same object.' },
          { term: 'equality', def: 'Meaning the same thing, asked with <code>==</code>. A data class compares property values; a plain class compares identity.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print whether <code>x</code> and <code>y</code> are the very same object.', code: `class Key(val code: Int)

fun main() {
    val x = Key(7)
    val y = x
    println(x [[===]] y)
}`, why: '<code>===</code> asks about identity. <code>y</code> is a second name for the same key, so it prints <code>true</code>.' },
          { type: 'bug', prompt: '<code>spare</code> should be another name for the very same key, so this should print <code>true</code>. It prints <code>false</code>. Tap the line to fix.', code: `class Key(val code: Int)

fun main() {
    val mine = Key(42)
    val spare = Key(42)
    println(mine === spare)
}`, bug: 4, fix: '    val spare = mine', why: '<code>Key(42)</code> calls the constructor, which always makes a new object. <code>val spare = mine</code> copies the arrow instead.' },
        ],
        quiz: [
          { q: 'After <code>val a = Book("Rain")</code> and <code>val b = a</code>, how many Book objects exist?', options: ['One', 'Two', 'None'], a: 0, why: 'Only one constructor call. <code>b</code> is a second arrow to the same book.' },
          { q: '<code>data class P(val x: Int)</code>. What do <code>P(1) == P(1)</code> and <code>P(1) === P(1)</code> give?', options: ['<code>true</code> and <code>false</code>', '<code>true</code> and <code>true</code>', '<code>false</code> and <code>false</code>'], a: 0, why: 'Equal values, but each <code>P(1)</code> is a separate object.' },
          { q: '<code>fun refill(c: Cup) { c.tea = "mint" }</code>. After <code>refill(mine)</code>, what is <code>mine.tea</code>?', options: ['<code>"mint"</code>', 'What it was before', 'It doesn’t compile'], a: 0, why: 'The function got an arrow to the same cup, so its change is the caller’s change.' },
        ],
        docs: [['Equality', 'https://kotlinlang.org/docs/equality.html']],
      },

      {
        id: 'encapsulation',
        title: 'Encapsulation: keeping data valid',
        tagline: 'Write each rule once, and let only the class change its data.',
        goals: ['Name a rule an object must always keep (its invariant)', 'Check the rule in every function that changes the state', 'Share a list without letting others change it'],
        level: 'beginner', introduces: [],
        body: `
<p>A bus has 40 seats. If the booking app ever says 43 seats are booked, three people are left standing at the stop, and nobody knows which line of code let it happen. Some facts about an object must always be true.</p>
<p>A rule like “booked seats are never below 0 and never more than the seats on the bus” is called an <em>invariant</em>: something that holds for the whole life of the object. While its invariants hold, the object’s state is <em>valid</em>.</p>
<p>Encapsulation is how a class protects its invariants. You already know the tools, <code>private</code> and <code>private set</code>. The design idea: if only the class’s own functions can change the state, and each of them checks the rule before it changes anything, the rule can’t break. When something does go wrong, you look in one class, not in the whole program.</p>
<p>Watch out for lists. A <code>val</code> property holding a <code>mutableListOf</code> can’t point to a new list, but anyone can still <code>add</code> to it. Keep the mutable list <code>private</code>, and show the outside a read-only <code>List</code> through a getter.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Bus(val seats: Int) {
    var booked = 0
        private set

    fun book(count: Int): Boolean {
        if (count <= 0 || booked + count > seats) {
            return false
        }
        booked += count
        return true
    }
}

fun main() {
    val bus = Bus(40)
    println(bus.book(38))
    println(bus.book(3))
    println(bus.book(2))
    println(bus.booked)
}`,
            predict: {
              q: '38 seats are booked on a 40-seat bus. What does <code>bus.book(3)</code> print?',
              options: ['<code>false</code>', '<code>true</code>', 'It crashes'],
              a: 0,
              why: '38 + 3 is 41, more than 40. The check refuses and nothing changes.',
            },
            frames: [
              { line: [1, 2, 3], say: 'The invariant: <code>booked</code> stays between 0 and <code>seats</code>. Only Bus can change <code>booked</code>.' },
              { line: 15, vars: { 'bus.seats': '40', 'bus.booked': '0' }, say: 'A new bus starts valid: 0 of 40 seats booked.' },
              { line: [16, 6, 9], vars: { 'bus.booked': '38' }, out: 'true', say: '38 more still fits in 40, so the check passes and the seats are booked.' },
              { line: [17, 6, 7], out: 'false', say: '38 + 3 = 41 is more than 40. The check refuses before anything changes.' },
              { line: [18, 9], vars: { 'bus.booked': '40' }, out: 'true', say: '38 + 2 = 40 fits exactly. The bus is full, and still valid.' },
              { line: 19, out: '40', say: 'Writing <code>bus.booked = 43</code> in <code>main</code> would not compile. Nobody can skip the rule.' },
            ],
          });
        },
        code: `class Party(val maxGuests: Int) {
    private val guests = mutableListOf<String>()

    val guestList: List<String>
        get() = guests

    fun invite(name: String): Boolean {
        if (guests.size >= maxGuests || guests.contains(name)) {
            return false
        }
        guests.add(name)
        return true
    }
}

fun main() {
    val party = Party(2)
    println(party.invite("Ada"))   // true
    println(party.invite("Ada"))   // false: already invited
    println(party.invite("Sam"))   // true
    println(party.invite("Lin"))   // false: full
    println(party.guestList)       // [Ada, Sam]
}`,
        play: `class Thermostat {
    var target = 20
        private set

    fun warmer() {
        if (target < 28) {
            target += 1
        }
    }

    fun cooler() {
        if (target > 12) {
            target -= 1
        }
    }
}

fun main() {
    val t = Thermostat()
    for (i in 1..10) {
        t.warmer()
    }
    println(t.target)
    // The rule: target always stays between 12 and 28.
    // Add fun setTo(degrees: Int) that keeps the rule too, then try t.setTo(40).
}`,
        remember: 'Name the invariant, let only the class change its state, and check the rule in every function that changes it.',
        mistakes: [
          { title: 'Letting the mutable list out', bad: `class Party(val maxGuests: Int) {
    val guests = mutableListOf<String>()
}

party.guests.add("Ada")
party.guests.add("Sam")
party.guests.add("Lin")   // 3 guests at a party for 2`, good: `class Party(val maxGuests: Int) {
    private val guests = mutableListOf<String>()
    val guestList: List<String>
        get() = guests
}

party.guestList.add("Lin")   // doesn't compile`, why: 'Outside code gets a read-only <code>List</code>, which has no <code>add</code>, so Kotlin stops it with <code>Unresolved reference \'add\'.</code> The only way in is a function like <code>invite()</code> that checks the rule.' },
        ],
        terms: [
          { term: 'invariant', def: 'A rule about an object that must always be true, like “booked is never more than seats”.' },
          { term: 'valid', def: 'An object is valid while all its invariants hold.' },
          { term: 'encapsulation', def: 'Keeping state private so only the class’s own functions change it, and those functions keep the rules.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A glass must never hold more than its size. Protect the water level.', code: `class Glass(val size: Int) {
    var water = 0
        [[private]] set

    fun pour(amount: Int) {
        if (amount > 0 && water + amount <= [[size]]) {
            water += amount
        }
    }
}`, why: '<code>private set</code> means only <code>pour()</code> can change the water, and <code>pour()</code> checks the size first.' },
          { type: 'bug', prompt: 'A tank should never hold less than 0 litres, but this prints <code>-10</code>. Tap the line that lets the rule break.', code: `class Tank(val capacity: Int) {
    var fuel = 0
        private set

    fun fill(litres: Int) {
        if (litres > 0 && fuel + litres <= capacity) {
            fuel += litres
        }
    }

    fun use(litres: Int) {
        if (litres > 0) {
            fuel -= litres
        }
    }
}

fun main() {
    val tank = Tank(50)
    tank.fill(30)
    tank.use(40)
    println(tank.fuel)
}`, bug: 11, fix: '        if (litres > 0 && litres <= fuel) {', why: 'Every function that changes the state has to keep the invariant. <code>fill()</code> did; <code>use()</code> forgot. Now it prints <code>30</code>.' },
        ],
        quiz: [
          { q: 'What is an invariant?', options: ['A rule about an object that must always be true', 'A property that is a <code>val</code>', 'A function that never changes'], a: 0, why: 'Like “booked seats never go over the seats on the bus”.' },
          { q: '<code>val items = mutableListOf&lt;String&gt;()</code> is a public property. Can outside code add to it?', options: ['Yes: <code>val</code> only stops it pointing to another list', 'No: <code>val</code> makes the list unchangeable'], a: 0, why: 'The arrow is fixed, but the list it points at can still change. Keep it private.' },
          { q: 'The app says 43 of 40 seats are booked. With good encapsulation, where do you look first?', options: ['In Bus’s own functions', 'Everywhere in the program', 'In <code>main</code>'], a: 0, why: 'Only Bus’s functions can change <code>booked</code>, so the bug has to be there.' },
        ],
        docs: [['Visibility modifiers', 'https://kotlinlang.org/docs/visibility-modifiers.html']],
      },
      {
        id: 'composition',
        title: 'Composition',
        tagline: 'Build a bigger object from smaller parts it has.',
        goals: ['Build a class from parts it keeps as properties (“has a”)', 'Let an object do its work by asking its parts', 'Reuse one part class in several bigger classes'],
        level: 'beginner', introduces: [],
        body: `
<p>A phone has a battery and a camera. You could write one big Phone class that tracks the battery level, counts the photos and checks the power, all mixed together. Then a drone needs a battery too, and you copy half of that code.</p>
<p><em>Composition</em> means building an object from smaller objects, its <em>parts</em>. The phone <em>has a</em> battery: a property that holds a Battery object. Each part is a small class with one job and its own rules. The bigger object does its work by asking its parts. The phone doesn’t change the battery level itself; it calls <code>battery.use(30)</code> and listens to the answer.</p>
<p>This pays off in three ways. Each part is small enough to understand on its own. Parts can be reused: a Drone can have a Battery too, with no copied code. And a part can be handed in through the constructor, as in <code>Drone(Battery())</code>, so the code that makes the drone decides which battery it gets.</p>
<p>A quick test: if you can say “an X <em>has a</em> Y”, then Y is a good part for X.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Battery {
    var level = 100
        private set

    fun use(amount: Int): Boolean {
        if (amount > level) {
            return false
        }
        level -= amount
        return true
    }
}

class Camera {
    var photos = 0
        private set

    fun shoot() {
        photos += 1
    }
}

class Phone {
    private val battery = Battery()
    private val camera = Camera()

    fun takePhoto(): String {
        if (!battery.use(30)) {
            return "Battery too low"
        }
        camera.shoot()
        return "Photo \${camera.photos}, battery \${battery.level}%"
    }
}

fun main() {
    val phone = Phone()
    println(phone.takePhoto())
    println(phone.takePhoto())
    println(phone.takePhoto())
    println(phone.takePhoto())
}`,
            predict: {
              q: 'The battery starts at 100 and each photo uses 30. What does the fourth <code>takePhoto()</code> print?',
              options: ['<code>Battery too low</code>', '<code>Photo 4, battery -20%</code>', '<code>Photo 4, battery 0%</code>'],
              a: 0,
              why: 'After three photos the level is 10. The battery’s own rule refuses to give 30.',
            },
            frames: [
              { line: [1, 14], say: 'Two small classes, each with one job and its own rule. A Battery can’t give more than it has; a Camera counts photos.' },
              { line: [23, 24, 25], say: 'A Phone <em>has a</em> battery and <em>has a</em> camera. It keeps them as private properties: its parts.' },
              { line: 37, vars: { 'battery.level': '100', 'camera.photos': '0' }, say: 'Making a Phone makes its parts too.' },
              { line: [38, 28, 9], vars: { 'battery.level': '70' }, say: '<code>takePhoto()</code> doesn’t touch the level itself. It asks its battery: “can you give 30?” Yes.' },
              { line: [31, 19, 32], vars: { 'camera.photos': '1' }, out: 'Photo 1, battery 70%', say: 'Then it asks the camera to shoot, and builds its answer from what the parts report.' },
              { line: [39, 40], vars: { 'battery.level': '10', 'camera.photos': '3' }, out: 'Photo 2, battery 40%\nPhoto 3, battery 10%', say: 'Two more photos. Each part keeps its own state.' },
              { line: [41, 28, 29], out: 'Battery too low', say: 'The battery’s rule says no: 30 is more than 10. The phone only had to listen.' },
            ],
          });
        },
        code: `class Battery {
    var level = 100
        private set

    fun use(amount: Int): Boolean {
        if (amount > level) {
            return false
        }
        level -= amount
        return true
    }
}

class Drone(private val battery: Battery) {
    fun fly(minutes: Int): String {
        if (!battery.use(minutes * 5)) {
            return "Not enough power"
        }
        return "Flew $minutes min, \${battery.level}% left"
    }
}

fun main() {
    val drone = Drone(Battery())   // the same Battery class, a new user
    println(drone.fly(10))         // Flew 10 min, 50% left
    println(drone.fly(12))         // Not enough power
}`,
        play: `class Engine {
    var running = false
        private set

    fun start() {
        running = true
    }

    fun stop() {
        running = false
    }
}

class Radio {
    var station = "off"
        private set

    fun tune(name: String) {
        station = name
    }
}

class Car(private val engine: Engine, private val radio: Radio) {
    fun drive(): String {
        engine.start()
        radio.tune("News")
        return "Driving, radio: \${radio.station}"
    }

    fun park(): String {
        engine.stop()
        return "Parked, engine running: \${engine.running}"
    }
}

fun main() {
    val car = Car(Engine(), Radio())
    println(car.drive())
    println(car.park())
    // Write a class Boat that has its own Engine, and a fun sail() that starts it.
}`,
        remember: 'Composition: build an object from parts it has (“has a”), and let it do its work by asking those parts.',
        mistakes: [
          { title: 'Copying a part’s code into every class', bad: `class Phone {
    var level = 100
    // battery rules written here...
}

class Drone {
    var level = 100
    // ...and copied here
}`, good: `class Phone(private val battery: Battery)

class Drone(private val battery: Battery)`, why: 'Two copies of the battery rules drift apart: fix a bug in one and the other keeps it. One Battery class, used as a part by both, has one copy to fix.' },
        ],
        terms: [
          { term: 'composition', def: 'Building an object from other objects it keeps as properties, and doing the work by asking them.' },
          { term: 'has a', def: 'The test for composition: “a phone has a battery”, so Battery is a part of Phone.' },
          { term: 'part', def: 'An object kept inside another as a property, like the <code>battery</code> in a Phone.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A bike has two wheels. Give it its front wheel, then ask the wheel to spin.', code: `class Wheel {
    fun spin() = "spinning"
}

class Bike {
    private val front = [[Wheel]]()
    private val back = Wheel()

    fun ride() = "Front \${front.[[spin]]()}, back \${back.spin()}"
}`, why: 'Each wheel is a part: a property holding a Wheel object. <code>ride()</code> works by asking its parts.' },
          { type: 'bug', prompt: 'Kotlin says <code>No value passed for parameter \'lamp\'.</code> Tap the line to fix.', code: `class Lamp {
    var on = false
        private set

    fun switch() {
        on = !on
    }
}

class Room(private val lamp: Lamp) {
    fun enter(): String {
        lamp.switch()
        return "Lamp on: \${lamp.on}"
    }
}

fun main() {
    val room = Room()
    println(room.enter())
}`, bug: 17, fix: '    val room = Room(Lamp())', why: 'Room gets its part through the constructor, so whoever makes a Room has to hand it a Lamp.' },
        ],
        quiz: [
          { q: 'Which pair fits composition best?', options: ['A car and its engine', 'A dog and an animal', 'A square and a shape'], a: 0, why: '“A car has an engine.” The other two are “is a” sentences.' },
          { q: 'In <code>class Phone { private val battery = Battery() }</code>, how should Phone use power?', options: ['Call <code>battery.use(30)</code>', 'Change <code>battery.level</code> directly', 'Copy the Battery code into Phone'], a: 0, why: 'The part keeps its own rules. The phone asks; the battery decides.' },
          { q: 'Why hand a part in through the constructor, as in <code>Drone(Battery())</code>?', options: ['The code making the drone picks its battery', 'It makes the drone faster', 'Kotlin requires it for every part'], a: 0, why: 'The drone works with any Battery it is given. Making it yourself inside the class also works, but then the class always picks.' },
        ],
        docs: [['Classes', 'https://kotlinlang.org/docs/classes.html']],
      },

      {
        id: 'inheritance',
        title: 'Inheritance, carefully',
        tagline: 'Build on a class only when “is a” is always true, and know what that ties you to.',
        goals: ['Use the “is a” test before writing <code>: Parent()</code>', 'Explain how a change inside a parent can break a child', 'Call the parent’s version with <code>super</code>, not your own function again'],
        level: 'intermediate', introduces: [], ignore: ['entries'],
        body: `
<p>You met inheritance in the Kotlin track: <code>class Dog(name: String) : Animal(name)</code> gives Dog everything Animal has. It is quick to write. It also ties the child to the parent’s insides more tightly than you might expect, so it is worth using with care.</p>
<p>First, the <em>is a</em> test. Say it out loud: “a savings account is an account”, always, everywhere the program uses accounts. Then inheritance fits. “A car is an engine” is false: a car <em>has</em> an engine, and that is composition. If the sentence is true only sometimes, the parent is the wrong choice.</p>
<p>Second, the risk. A child depends on how the parent works inside, not only on what it offers. Below, CountingLogbook counts entries by overriding both <code>add</code> and <code>addAll</code>. That worked while the parent’s <code>addAll</code> put entries in the list directly, with <code>entries.add(e)</code>. Then someone tidied the parent so that its <code>addAll</code> calls <code>add(e)</code>. Logbook still works perfectly on its own, but the child now counts every entry twice, and its code never changed. This is called the <em>fragile base class</em> problem (“base class” is another name for the parent).</p>
<p>So build on classes that were made to be parents (that is why Kotlin asks for <code>open</code>), and only for an “is a” that will stay true.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `open class Logbook {
    private val entries = mutableListOf<String>()

    open fun add(entry: String) {
        entries.add(entry)
    }

    open fun addAll(list: List<String>) {
        for (e in list) {
            add(e)
        }
    }
}

class CountingLogbook : Logbook() {
    var count = 0

    override fun add(entry: String) {
        count += 1
        super.add(entry)
    }

    override fun addAll(list: List<String>) {
        count += list.size
        super.addAll(list)
    }
}

fun main() {
    val log = CountingLogbook()
    log.addAll(listOf("start", "stop", "pause"))
    println(log.count)
}`,
            predict: {
              q: 'Line 10 used to be <code>entries.add(e)</code>, and the program printed <code>3</code>. Now it is <code>add(e)</code>. What does it print?',
              options: ['<code>6</code>', '<code>3</code>', '<code>0</code>'],
              a: 0,
              why: 'The parent’s loop now calls <code>add</code>, which on this object is the child’s counting <code>add</code>. Every entry is counted twice.',
            },
            frames: [
              { line: [8, 9, 10], say: 'The parent was tidied: <code>addAll</code> now calls <code>add(e)</code>. On its own, Logbook works exactly as before.' },
              { line: [15, 18, 23], say: 'The child counts in both <code>add</code> and <code>addAll</code>. Its author knew the old parent, where <code>addAll</code> didn’t call <code>add</code>.' },
              { line: [31, 24], vars: { 'log.count': '3' }, say: 'The child’s <code>addAll</code> runs: 3 entries, so count becomes 3. Right, so far.' },
              { line: [25, 10], say: '<code>super.addAll</code> runs the parent’s loop. But this object is a CountingLogbook, so <code>add(e)</code> runs the child’s <code>add</code>.' },
              { line: [19, 20], vars: { 'log.count': '4' }, say: 'The child’s <code>add</code> counts "start" again. The same happens for "stop" and "pause".' },
              { line: 32, vars: { 'log.count': '6' }, out: '6', say: 'A count of 6 for 3 entries. The child never changed; a tidy-up inside the parent broke it.' },
            ],
          });
        },
        code: `open class Account(val owner: String) {
    var balance = 0
        private set

    fun deposit(amount: Int) {
        if (amount > 0) {
            balance += amount
        }
    }
}

// A savings account is an account, always: inheritance fits.
class SavingsAccount(owner: String) : Account(owner) {
    fun addInterest() {
        deposit(balance / 100)
    }
}

fun main() {
    val s = SavingsAccount("Lin")
    s.deposit(500)
    s.addInterest()
    println(s.balance)   // 505
}`,
        play: `open class Notebook {
    private val pages = mutableListOf<String>()

    fun pageCount() = pages.size

    open fun write(text: String) {
        pages.add(text)
    }

    open fun writeAll(texts: List<String>) {
        for (t in texts) {
            write(t)
        }
    }
}

class CountingNotebook : Notebook() {
    var written = 0

    override fun write(text: String) {
        written += 1
        super.write(text)
    }

    override fun writeAll(texts: List<String>) {
        written += texts.size
        super.writeAll(texts)
    }
}

fun main() {
    val book = CountingNotebook()
    book.writeAll(listOf("Mon", "Tue"))
    println("Pages: \${book.pageCount()}, counted: \${book.written}")
    // Counted 4 for 2 pages. Delete the writeAll override in CountingNotebook
    // and run again. Then change Notebook's loop to pages.add(t): what breaks now?
}`,
        remember: 'Inherit only when “X is a Y” is always true, from a class made to be a parent. A child depends on its parent’s insides, so a change there can break it.',
        mistakes: [
          { title: 'Inheriting only to borrow code', bad: `open class Engine {
    fun start() = "Engine on"
}

class Car : Engine()   // a car is not an engine`, good: `class Engine {
    fun start() = "Engine on"
}

class Car(private val engine: Engine) {
    fun drive() = engine.start()
}`, why: 'The first version compiles and even runs, but now every Car counts as an Engine and can be passed anywhere an Engine is wanted. A car <em>has</em> an engine: that is composition.' },
        ],
        terms: [
          { term: 'is a', def: 'The test for inheritance: “a savings account is an account” must be true always, not only sometimes.' },
          { term: 'base class', def: 'Another name for a parent class, the class others build on.' },
          { term: 'fragile base class', def: 'When a change inside a parent breaks a child that didn’t change, because the child relied on how the parent worked inside.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A bike is a vehicle, always. Let Vehicle be a parent, and let Bike build on it with 2 wheels.', code: `[[open]] class Vehicle(val wheels: Int) {
    fun describe() = "$wheels wheels"
}

class Bike : [[Vehicle]](2)`, why: '<code>open</code> lets Vehicle be a parent. <code>: Vehicle(2)</code> says a Bike is a Vehicle and passes 2 to its constructor.' },
          { type: 'bug', prompt: 'This should print <code>Hi, Ada!</code>, but it crashes with <code>StackOverflowError</code> (a function that keeps calling itself until the program runs out of room). Tap the line.', code: `open class Greeter {
    open fun greet(name: String) = "Hi, $name"
}

class LoudGreeter : Greeter() {
    override fun greet(name: String): String = greet(name) + "!"
}

fun main() {
    println(LoudGreeter().greet("Ada"))
}`, bug: 5, fix: '    override fun greet(name: String): String = super.greet(name) + "!"', why: 'Inside LoudGreeter, <code>greet(name)</code> calls LoudGreeter’s own <code>greet</code>, which calls itself again, over and over, until the program runs out of room. <code>super.greet</code> runs the parent’s version.' },
        ],
        quiz: [
          { q: 'Which sentence passes the “is a” test?', options: ['A savings account is an account', 'A car is an engine', 'A phone is a battery'], a: 0, why: 'It is true always. The other two are “has a”: composition.' },
          { q: 'What is the fragile base class problem?', options: ['A change inside a parent breaks a child that didn’t change', 'A parent class can’t be changed at all', 'A child class has too many functions'], a: 0, why: 'The child relied on how the parent worked inside, and that changed.' },
          { q: 'Why does Kotlin ask for <code>open</code> before a class can be a parent?', options: ['So being built on is a choice the class’s author made', 'To make the class run faster', 'Because open classes can’t have properties'], a: 0, why: 'A class meant to be a parent is written and changed with its children in mind.' },
        ],
        docs: [['Inheritance', 'https://kotlinlang.org/docs/inheritance.html']],
      },

      {
        id: 'composition-vs-inheritance',
        title: 'Choosing between them',
        tagline: 'Composition or inheritance? Count what each one costs.',
        goals: ['Spot when inheritance multiplies into too many classes', 'Swap a part while the program runs, using composition', 'Pick composition or inheritance for a new case'],
        level: 'intermediate', introduces: [],
        body: `
<p>A robot game has robots that move on wheels or on legs, and carry a claw or a laser. With inheritance, every combination needs its own class: WheelClaw, WheelLaser, LegClaw, LegLaser. Add tracks as a third way to move, and you need more classes again. The family keeps growing.</p>
<p>With composition, a robot <em>has</em> a mover and <em>has</em> a tool. Each kind of mover and each kind of tool is one small class that keeps an interface, <code>Mover</code> or <code>Tool</code>. Any mover goes with any tool, so tracks means one new class. And because a part is a property, a <code>var tool</code> can be swapped while the program runs. A parent class, on the other hand, is fixed the moment the object is made.</p>
<p>Inheritance has its strengths too. It is less code: the child gets all of the parent’s functions without writing a line for each one. It fits when the “is a” sentence is always true, the family is small and clear, and the parent was made to be built on.</p>
<p>A good habit: start with composition. Use inheritance for a real, lasting “is a” in a small family. If the combinations start to multiply, or a child only wants part of what the parent does, go back to parts. This kind of weighing up is called a <em>trade-off</em>: each choice gives you something and costs you something.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 360,
            nodes: [
              { id: 'robot', label: 'Robot', x: 50, y: 7, hidden: true },
              { id: 'wr', label: 'WheelRobot', x: 25, y: 27, hidden: true },
              { id: 'lr', label: 'LegRobot', x: 75, y: 27, hidden: true },
              { id: 'wc', label: 'WheelClaw', x: 12, y: 47, tone: 'warm', hidden: true },
              { id: 'wl', label: 'WheelLaser', x: 37, y: 47, tone: 'warm', hidden: true },
              { id: 'lc', label: 'LegClaw', x: 63, y: 47, tone: 'warm', hidden: true },
              { id: 'll', label: 'LegLaser', x: 88, y: 47, tone: 'warm', hidden: true },
              { id: 'comp', label: 'Robot<small>has a mover, has a tool</small>', x: 50, y: 70, tone: 'ok', hidden: true },
              { id: 'wheels', label: 'Wheels', x: 12, y: 93, tone: 'muted', hidden: true },
              { id: 'legs', label: 'Legs', x: 37, y: 93, tone: 'muted', hidden: true },
              { id: 'claw', label: 'Claw', x: 63, y: 93, tone: 'muted', hidden: true },
              { id: 'laser', label: 'Laser', x: 88, y: 93, tone: 'muted', hidden: true },
            ],
            predict: {
              q: 'Two ways to move (wheels, legs) and two tools (claw, laser). With one class per combination, how many robot classes are on the bottom row?',
              options: ['4', '2', '3'],
              a: 0,
              why: '2 movers times 2 tools is 4, and every new mover or tool adds a whole set more.',
            },
            frames: [
              { show: ['robot', 'wr', 'lr'], add: [['wr', 'robot', 'is a'], ['lr', 'robot', 'is a']], say: 'Inheritance: a WheelRobot is a Robot, a LegRobot is a Robot. So far, two children.' },
              { show: ['wc', 'wl', 'lc', 'll'], add: [['wc', 'wr'], ['wl', 'wr'], ['lc', 'lr'], ['ll', 'lr']], say: 'Now each one needs a claw or a laser. Every pair gets its own class: 4 on the bottom row, 7 classes in all.' },
              { hl: ['wc', 'wl', 'lc', 'll'], say: 'Tracks as a third way to move? TrackRobot, TrackClaw and TrackLaser: 3 more classes. Each new kind multiplies.' },
              { show: ['comp', 'wheels', 'legs', 'claw', 'laser'], add: [['comp', 'wheels', 'has a', 'accent'], ['comp', 'claw', 'has a', 'accent']], say: 'Composition: one Robot class that has a mover and a tool. Wheels and Legs keep <code>Mover</code>; Claw and Laser keep <code>Tool</code>.' },
              { remove: [['comp', 'claw']], add: [['comp', 'laser', 'has a', 'accent']], hl: ['comp', 'laser'], say: '<code>bot.tool = Laser()</code>: a part can be swapped while the program runs. Any mover goes with any tool.' },
              { hl: ['comp'], say: 'Tracks is now one new class that keeps <code>Mover</code>. With Tracks that is 5 small part classes; the inheritance family needs 10.' },
            ],
          });
        },
        code: `interface Mover {
    fun move(): String
}

interface Tool {
    fun use(): String
}

class Wheels : Mover {
    override fun move() = "rolls"
}

class Legs : Mover {
    override fun move() = "walks"
}

class Claw : Tool {
    override fun use() = "grabs"
}

class Robot(private val mover: Mover, var tool: Tool) {
    fun work() = "Robot \${mover.move()} and \${tool.use()}"
}

fun main() {
    val bot = Robot(Legs(), Claw())
    println(bot.work())          // Robot walks and grabs
    val rover = Robot(Wheels(), Claw())
    println(rover.work())        // Robot rolls and grabs
}`,
        play: `interface Mover {
    fun move(): String
}

interface Tool {
    fun use(): String
}

class Wheels : Mover {
    override fun move() = "rolls"
}

class Legs : Mover {
    override fun move() = "walks"
}

class Claw : Tool {
    override fun use() = "grabs"
}

class Brush : Tool {
    override fun use() = "sweeps"
}

class Robot(private val mover: Mover, var tool: Tool) {
    fun work() = "Robot \${mover.move()} and \${tool.use()}"
}

fun main() {
    val bot = Robot(Wheels(), Claw())
    println(bot.work())
    bot.tool = Brush()
    println(bot.work())
    // Add a Mover called Propeller ("flies") and build a flying robot with a Brush.
}`,
        remember: 'Start with composition: parts combine freely and can be swapped. Use inheritance for a true, lasting “is a” in a small family.',
        terms: [
          { term: 'trade-off', def: 'A choice where each option gives you something and costs you something, like less code (inheritance) against free combining (composition).' },
          { term: 'combination', def: 'One pick from each group, like wheels with a laser. With inheritance each combination needs its own class.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A clock has an alarm sound, and any Sound will do. Fill in the part’s type and the call to it.', code: `interface Sound {
    fun play(): String
}

class Bell : Sound {
    override fun play() = "ding"
}

class Clock(private val alarm: [[Sound]]) {
    fun ring() = "Wake up: \${alarm.[[play]]()}"
}`, why: 'The part’s type is the interface, so any Sound fits: a Bell today, something else tomorrow.' },
          { type: 'bug', prompt: 'Kotlin says <code>\'val\' cannot be reassigned.</code> at <code>bot.tool = Brush()</code>. The robot should be able to swap tools. Tap the line to fix.', code: `interface Tool {
    fun use(): String
}

class Claw : Tool {
    override fun use() = "grabs"
}

class Brush : Tool {
    override fun use() = "sweeps"
}

class Robot(val tool: Tool) {
    fun work() = "Robot \${tool.use()}"
}

fun main() {
    val bot = Robot(Claw())
    bot.tool = Brush()
    println(bot.work())
}`, bug: 12, fix: 'class Robot(var tool: Tool) {', why: 'A part that should be swappable has to be a <code>var</code>. Now it prints <code>Robot sweeps</code>.' },
        ],
        quiz: [
          { q: 'Robots have 3 kinds of mover and 2 kinds of tool. With composition, how many part classes do you write?', options: ['5', '6', '9'], a: 0, why: '3 movers plus 2 tools. With one class per combination you would need 6 at the bottom alone.' },
          { q: 'Which one can change while the program runs?', options: ['A <code>var tool: Tool</code> part', 'The parent class of an object', 'Neither'], a: 0, why: 'A part is a property, so a <code>var</code> can point to a new part. The parent is fixed when the object is made.' },
          { q: 'When is inheritance a good fit?', options: ['A small family where “is a” is always true', 'Whenever two classes share one function', 'When you need many combinations'], a: 0, why: 'Many combinations and shared bits of code are both better handled with parts.' },
        ],
        docs: [['Inheritance', 'https://kotlinlang.org/docs/inheritance.html'], ['Interfaces', 'https://kotlinlang.org/docs/interfaces.html']],
      },

      {
        id: 'polymorphism',
        title: 'Polymorphism',
        tagline: 'One call, many behaviours, or one when over every kind: where each kind’s code lives.',
        goals: ['Compare a <code>when</code> over kinds with one override per class', 'Explain how the real object, not the variable’s type, picks the code that runs', 'Choose by what grows: new kinds favour overrides, new operations favour sealed and <code>when</code>'],
        level: 'intermediate', introduces: [],
        body: `
<p>A delivery app quotes a price and a time. At first there are bikes and vans, so you write <code>when (kind) { "bike" -> ... "van" -> ... }</code> in the price function, and another <code>when</code> in the time function. Then drones arrive, and you have to find every <code>when</code> in the app that asks about kinds and add a branch to each. Miss one, and somewhere a drone quietly costs 0.</p>
<p>You saw the other way in <a href="#kotlin.interfaces">Promises a class keeps</a>: an interface, with each class writing its own version of the function. The code that quotes a price only says <code>d.cost(km)</code>, and what that does depends on which object is behind <code>d</code>. One call, many behaviours: that is <em>polymorphism</em> (Greek for “many shapes”). The variable’s type, <code>Delivery</code>, decides what you may call; the real object decides which code runs, worked out while the program runs. That is called <em>dynamic dispatch</em>.</p>
<p>Here is why it matters for design. It decides where each kind’s code lives. With a <code>when</code> in every function, a bike’s price is in one place and its time in another. With overrides, everything about bikes sits in the Bike class, and adding Drone means writing one new class: <code>quote</code> and every other caller stay exactly as they are.</p>
<p>A <code>when</code> isn’t always wrong. With a sealed family and no <code>else</code>, Kotlin finds every <code>when</code> that needs a new branch for you. And overrides have their own cost: a new <em>operation</em>, like a label for each kind, means editing every class. So pick by what grows. New kinds keep coming: overrides. A fixed set of kinds that keeps getting new operations: sealed and <code>when</code>.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 400,
            nodes: [
              { id: 'hA', label: 'A: a <code>when</code> in each function', x: 25, y: 6, tone: 'muted' },
              { id: 'hB', label: 'B: an override in each class', x: 75, y: 6, tone: 'muted' },
              { id: 'fcost', label: 'cost(kind)<small>bike, van</small>', x: 25, y: 23, hidden: true },
              { id: 'nA1', label: '+ drone branch', x: 25, y: 34, tone: 'err', hidden: true },
              { id: 'fmin', label: 'minutes(kind)<small>bike, van</small>', x: 25, y: 49, hidden: true },
              { id: 'nA2', label: '+ drone branch', x: 25, y: 60, tone: 'err', hidden: true },
              { id: 'flabel', label: 'label(kind)<small>new function</small>', x: 25, y: 76, tone: 'ok', hidden: true },
              { id: 'cbike', label: 'Bike<small>cost, minutes</small>', x: 75, y: 23, hidden: true },
              { id: 'nB1', label: '+ label()', x: 75, y: 34, tone: 'err', hidden: true },
              { id: 'cvan', label: 'Van<small>cost, minutes</small>', x: 75, y: 49, hidden: true },
              { id: 'nB2', label: '+ label()', x: 75, y: 60, tone: 'err', hidden: true },
              { id: 'cdrone', label: 'Drone<small>new class</small>', x: 75, y: 76, tone: 'ok', hidden: true },
              { id: 'nB3', label: '+ label()', x: 75, y: 87, tone: 'err', hidden: true },
            ],
            predict: {
              q: 'Drones arrive. Version A has a <code>when</code> in <code>cost</code> and in <code>minutes</code>. Version B has a Bike and a Van class. How many places change in each?',
              options: ['A: 2 functions. B: 1 new class', 'A: 1 function. B: 2 classes', 'Both: 1 place'],
              a: 0,
              why: 'In A, every <code>when</code> over kinds needs a drone branch. In B, the new Drone class brings its own answers, and nothing else changes.',
            },
            frames: [
              { show: ['fcost', 'fmin'], say: 'Version A: two functions, each with a <code>when (kind)</code> over bike and van. A bike’s code is split across both.' },
              { show: ['cbike', 'cvan'], say: 'Version B: an interface <code>Delivery</code> with <code>cost</code> and <code>minutes</code>. Bike and Van each override both, so all of a bike’s code is in Bike.' },
              { show: ['nA1', 'nA2'], hl: ['fcost', 'fmin'], say: 'A new kind, drone. In A, every function with a <code>when</code> over kinds needs a new branch: here 2, in a real app maybe many more.' },
              { show: ['cdrone'], hl: ['cdrone'], say: 'In B, Drone is one new class with its own <code>cost</code> and <code>minutes</code>. The callers only say <code>d.cost(km)</code>, so none of them change.' },
              { show: ['flabel'], hl: ['flabel'], say: 'Now the other way round: a new <em>operation</em>, a label for each kind. In A, that is one new function with one <code>when</code>.' },
              { show: ['nB1', 'nB2', 'nB3'], hl: ['cbike', 'cvan', 'cdrone'], say: 'In B, every class needs a new override: 3 edits. So each style is cheap for one kind of change.' },
              { hl: ['hA', 'hB'], say: 'Pick by what grows. New kinds keep coming: B, overrides. A fixed set of kinds getting new operations: A, as a sealed family with no <code>else</code>, so Kotlin points at every <code>when</code> for you.' },
            ],
          });
        },
        code: `interface Delivery {
    fun cost(km: Int): Int
    fun minutes(km: Int): Int
}

class Bike : Delivery {          // everything about bikes, in one place
    override fun cost(km: Int) = 2 + km
    override fun minutes(km: Int) = km * 4
}

class Drone : Delivery {         // a new kind: one new class
    override fun cost(km: Int) = 15
    override fun minutes(km: Int) = km
}

fun quote(d: Delivery, km: Int) {
    println("\${d.cost(km)} for \${d.minutes(km)} min")
}

fun main() {
    quote(Bike(), 5)    // 7 for 20 min
    quote(Drone(), 5)   // 15 for 5 min
}`,
        play: `interface Discount {
    fun priceAfter(price: Int): Int
}

class NoDiscount : Discount {
    override fun priceAfter(price: Int) = price
}

class HalfPrice : Discount {
    override fun priceAfter(price: Int) = price / 2
}

class MinusTen : Discount {
    override fun priceAfter(price: Int) = if (price > 10) price - 10 else 0
}

fun checkout(price: Int, offers: List<Discount>) {
    for (offer in offers) {
        println(offer.priceAfter(price))
    }
}

fun main() {
    checkout(40, listOf(NoDiscount(), HalfPrice(), MinusTen()))
    // Add a class MinusQuarter : Discount (price - price / 4) and put it in the list.
    // checkout() itself never needs to change.
}`,
        remember: 'Polymorphism: one call, and the real object decides which override runs. Overrides make new kinds cheap; sealed and when make new operations cheap. Pick by what grows.',
        mistakes: [
          { title: 'Asking “which kind are you?” with a String and an else', bad: `fun cost(kind: String, km: Int): Int {
    return when (kind) {
        "bike" -> 2 + km
        "van" -> 10 + km * 2
        else -> 0
    }
}

println(cost("drone", 5))   // 0: nobody told cost() about drones`, good: `interface Delivery {
    fun cost(km: Int): Int
}

class Drone : Delivery {
    override fun cost(km: Int) = 15
}`, why: 'A <code>when</code> over String kinds with an <code>else</code> has to be updated by hand for every new kind, in every place it appears, and Kotlin can’t warn you. With an override, the new class carries its own answer.' },
        ],
        terms: [
          { term: 'polymorphism', def: 'One call that behaves differently depending on the object behind it, like <code>d.cost(km)</code> on a Bike or a Drone.' },
          { term: 'dynamic dispatch', def: 'Picking which override runs from the real object, while the program runs. The variable’s type only decides what you may call.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'This used to be <code>when (kind) { "taxi" -> 3 + km * 2  "bus" -> 2 }</code>. Now each kind answers for itself. Fill in the gaps.', code: `interface Ride {
    fun fare(km: Int): Int
}

class Taxi : Ride {
    override fun fare(km: Int) = 3 + km * 2
}

class Bus : Ride {
    [[override]] fun fare(km: Int) = 2
}

fun printFare(r: Ride) {
    println(r.[[fare]](10))
}

fun main() {
    printFare(Taxi())
    printFare(Bus())
}`, why: 'Bus writes its own version with <code>override</code>. <code>printFare</code> makes one call, <code>r.fare(10)</code>, and prints <code>23</code> for the taxi and <code>2</code> for the bus.' },
          { type: 'bug', prompt: 'Kotlin says <code>Argument type mismatch: actual type is \'Torch\', but \'Candle\' was expected.</code> <code>show</code> should work for any light. Tap the line.', code: `interface Light {
    fun glow(): String
}

class Candle : Light {
    override fun glow() = "flicker"
}

class Torch : Light {
    override fun glow() = "beam"
}

fun show(light: Candle) {
    println(light.glow())
}

fun main() {
    show(Torch())
}`, bug: 12, fix: 'fun show(light: Light) {', why: 'Ask for the interface, not one class that keeps it. Then any Light fits, and it prints <code>beam</code>.' },
        ],
        quiz: [
          { q: '<code>val d: Delivery = Van()</code>. Whose <code>cost</code> runs for <code>d.cost(5)</code>?', options: ['Van’s', 'Delivery’s', 'Bike’s'], a: 0, why: 'The real object decides, and it is a Van. Delivery only promises <code>cost</code>; it has no body to run.' },
          { q: 'A delivery app gets a new kind of vehicle every month. Which style keeps each change small?', options: ['An interface with one class per kind', 'A <code>when</code> over kinds in every function', 'One big class with a Boolean per kind'], a: 0, why: 'New kinds are what grows, so each one should be a single new class. The callers stay the same.' },
          { q: 'A sealed family of shapes is fixed, but keeps getting new operations: area, outline, a label. Which style keeps each change small?', options: ['A <code>when</code> with no <code>else</code> per operation', 'A new override in every shape class', 'A <code>when</code> with an <code>else</code> branch'], a: 0, why: 'A new operation is then one new function. With no <code>else</code>, Kotlin also checks that every shape is handled.' },
        ],
        docs: [['Interfaces', 'https://kotlinlang.org/docs/interfaces.html'], ['Sealed classes and interfaces', 'https://kotlinlang.org/docs/sealed-classes.html']],
      },

      {
        id: 'abstraction',
        title: 'Abstraction',
        tagline: 'Show a simple surface, and hide the detail behind it.',
        goals: ['Design a class whose public functions say what, not how', 'Keep the steps private so they can change freely', 'Tell abstraction apart from encapsulation'],
        level: 'intermediate', introduces: [],
        body: `
<p>To drive a car you use a steering wheel and two pedals. You don’t time the fuel or choose the gear ratios yourself. The car hides hundreds of details behind a few controls. That is why anyone can drive it, and why a mechanic can replace the engine without every driver learning to drive again.</p>
<p><em>Abstraction</em> means giving something a simple surface and hiding the detail behind it. In a class, the surface is its public functions and properties: everything other code can use. A good surface is small, and named after what the caller wants, like <code>next()</code> or <code>makeTea()</code>, not after how it is done. The steps stay <code>private</code>.</p>
<p>You use abstraction all the time. <code>println</code> and <code>listOf</code> have plenty of code inside, and you have never needed to see it. The Playlist below hides a position and a bit of arithmetic behind one word, <code>next()</code>. Callers can’t depend on detail they can’t see, so the inside can change later without touching them.</p>
<p>Abstraction and encapsulation work together, but they answer different questions. Encapsulation: how do I keep this data valid? Abstraction: how little does the caller need to know?</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Playlist(private val songs: List<String>) {
    private var index = 0

    fun next(): String {
        val song = songs[index]
        index = (index + 1) % songs.size
        return song
    }
}

fun main() {
    val mix = Playlist(listOf("Rain", "Tides", "Echo"))
    println(mix.next())
    println(mix.next())
    println(mix.next())
    println(mix.next())
}`,
            predict: {
              q: 'Three songs, and <code>next()</code> is called a fourth time. What does it print?',
              options: ['<code>Rain</code>', '<code>Echo</code>', 'It crashes: there is no fourth song'],
              a: 0,
              why: 'The playlist wraps around to the start. The caller doesn’t need to know how.',
            },
            frames: [
              { line: 4, say: 'The surface: one public function, <code>next()</code>. That is all a caller has to know.' },
              { line: [1, 2], say: 'The detail: a private list and a private position. Callers can’t see or touch either one.' },
              { line: [13, 5, 6], vars: { index: '1' }, out: 'Rain', say: 'Give back the song at the position, then move the position one on.' },
              { line: [14, 5, 6], vars: { index: '2' }, out: 'Tides', say: 'Same steps, the next song.' },
              { line: [15, 6], vars: { index: '0' }, out: 'Echo', say: '(2 + 1) % 3 is 0: the remainder sends the position back to the start.' },
              { line: [16, 5], vars: { index: '1' }, out: 'Rain', say: 'Round again. <code>main</code> never saw an index or a <code>%</code>.' },
            ],
          });
        },
        code: `class Clock {
    private var minutes = 0

    fun tick(m: Int) {
        minutes = (minutes + m) % (24 * 60)
    }

    fun time(): String {
        val h = minutes / 60
        val m = minutes % 60
        val mm = if (m < 10) "0$m" else "$m"
        return "$h:$mm"
    }
}

fun main() {
    val clock = Clock()
    clock.tick(65)
    println(clock.time())   // 1:05
    clock.tick(1440)
    println(clock.time())   // 1:05: a whole day later
}`,
        play: `class Kettle {
    private var water = 0
    private var temperature = 20

    fun makeTea(): String {
        fill()
        boil()
        return pour()
    }

    private fun fill() {
        water = 500
    }

    private fun boil() {
        while (temperature < 100) {
            temperature += 20
        }
    }

    private fun pour(): String {
        water -= 250
        return "Tea at $temperature degrees, $water ml left"
    }
}

fun main() {
    val kettle = Kettle()
    println(kettle.makeTea())
    // The caller knows one word: makeTea(). Try kettle.boil() here and read the error.
}`,
        remember: 'Keep the public surface small and named after what the caller wants. Keep the how private, so it can change.',
        mistakes: [
          { title: 'A surface made of steps', bad: `kettle.fill()
kettle.boil()
kettle.pour()   // every caller must know the steps, in order`, good: `kettle.makeTea()   // the steps are the kettle's business`, why: 'When callers run the steps themselves, someone runs them in the wrong order, and every caller has to change when the steps change.' },
        ],
        terms: [
          { term: 'abstraction', def: 'Giving something a simple surface and hiding the detail behind it, so callers only need to know what it does.' },
          { term: 'surface', def: 'Everything other code can use from a class: its public functions and properties.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Callers should only see a summary, never the raw count. Hide the count.', code: `class Counter {
    [[private]] var clicks = 0

    fun click() {
        clicks += 1
    }

    fun summary() = "Clicked $clicks times"
}

fun main() {
    val c = Counter()
    c.click()
    c.click()
    println(c.[[summary]]())
}`, why: 'The surface is <code>click()</code> and <code>summary()</code>. The count is detail, so it is private. This prints <code>Clicked 2 times</code>.' },
          { type: 'bug', prompt: 'Kotlin says <code>Cannot access \'fun boil(): Unit\': it is private in \'Kettle\'.</code> Use the kettle’s surface instead. Tap the line.', code: `class Kettle {
    private var temperature = 20

    fun makeTea(): String {
        boil()
        return "Tea at $temperature degrees"
    }

    private fun boil() {
        temperature = 100
    }
}

fun main() {
    val kettle = Kettle()
    kettle.boil()
}`, bug: 15, fix: '    println(kettle.makeTea())', why: '<code>boil()</code> is a step, hidden on purpose. The surface is <code>makeTea()</code>, which prints <code>Tea at 100 degrees</code>.' },
        ],
        quiz: [
          { q: 'Which is the better surface for a music player class?', options: ['<code>play()</code> and <code>next()</code>', '<code>setIndex()</code>, <code>readFile()</code> and <code>startSpeaker()</code>'], a: 0, why: 'They say what the caller wants. The other set exposes how it is done.' },
          { q: 'Playlist changes how it stores its songs inside. What must callers of <code>next()</code> change?', options: ['Nothing', 'Every call to <code>next()</code>', 'Only the first call'], a: 0, why: 'They only ever used the surface, and the surface stayed the same.' },
          { q: 'Which question does abstraction answer?', options: ['How little does the caller need to know?', 'How do I keep this data valid?', 'Which class is the parent?'], a: 0, why: 'Keeping data valid is encapsulation. The two often work together.' },
        ],
        docs: [['Visibility modifiers', 'https://kotlinlang.org/docs/visibility-modifiers.html']],
      },

      {
        id: 'interface-or-abstract',
        title: 'Interface or abstract class',
        tagline: 'Two ways to describe a family. Pick by what the family shares.',
        goals: ['Write an <code>abstract class</code> with an <code>abstract fun</code>', 'Explain why you can’t make an object of an abstract class', 'Choose between an interface and an abstract class'],
        level: 'intermediate', introduces: ['abstract'],
        body: `
<p>A zoo app has many animals. Each one makes its own sound, but every animal also has a name and a meal count, and is fed in the same way. An interface can promise <code>sound()</code>, but it can’t store a name or a count. An <code>open</code> parent class can store them, but then someone could make a plain <code>Animal</code>, which makes no sense: what sound would it make?</p>
<p>An <em>abstract class</em> sits in between. <code>abstract class Animal(val name: String)</code> can have a constructor, properties and finished functions, like any class. It can also have <code>abstract fun sound(): String</code>: a function with no body, which every child must <code>override</code>. That is the “abstract member” from the error you met when a class forgot an interface function. Because it is unfinished on purpose, Kotlin won’t let you make an object of an abstract class: <code>Animal("Cat")</code> doesn’t compile. Abstract classes and functions are already open, so you don’t write <code>open</code>.</p>
<p>How to choose. An interface is mostly a promise: no constructor, no stored values, and a class can keep several. (An interface may give a function a ready body too; what it can’t do is store values or take a constructor.) An abstract class can share stored values and code with its children, but a class has only one parent. So describe what something <em>can do</em> with an interface (Swimmer, Chargeable). Use an abstract class when close relatives share data and code, and the “is a” test holds. When in doubt, start with an interface.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `interface Swimmer {
    fun swim(): String
}

abstract class Animal(val name: String) {
    var meals = 0

    abstract fun sound(): String

    fun feed() {
        meals += 1
        println("$name meals: $meals")
    }
}

class Duck : Animal("Duck"), Swimmer {
    override fun sound() = "Quack"
    override fun swim() = "paddles"
}

fun main() {
    val d = Duck()
    d.feed()
    println(d.sound())
    println("Duck \${d.swim()}")
}`,
            predict: {
              q: 'Could <code>main</code> also say <code>val a = Animal("Cat")</code>?',
              options: ['No: Animal is abstract', 'Yes: Animal has a constructor', 'Yes, but <code>sound()</code> would give back nothing'],
              a: 0,
              why: 'An abstract class is unfinished on purpose. Only its children can be made.',
            },
            frames: [
              { line: [1, 2], say: 'An interface: only a promise. No constructor, nothing stored.' },
              { line: [5, 6], say: 'An abstract class can have a constructor and stored values, like any class: a name and a meal count.' },
              { line: 8, say: '<code>abstract fun</code>: no body. Every child must write its own. Because of this gap, nobody can make a plain Animal.' },
              { line: [10, 11, 12], say: 'A finished function, shared by every animal.' },
              { line: 16, say: 'One parent class, <code>Animal("Duck")</code>, with parentheses. Plus an interface, without. More interfaces could follow after commas.' },
              { line: [22, 23, 11, 12], vars: { 'd.name': '"Duck"', 'd.meals': '1' }, out: 'Duck meals: 1', say: '<code>feed()</code> comes from the abstract parent, ready to use.' },
              { line: [24, 25, 17, 18], out: 'Quack\nDuck paddles', say: '<code>sound()</code> and <code>swim()</code> are Duck’s own overrides.' },
            ],
          });
        },
        code: `abstract class Shape(val name: String) {
    abstract fun area(): Double

    fun describe() = "$name, area \${area()}"
}

class Square(val side: Double) : Shape("Square") {
    override fun area() = side * side
}

class Circle(val radius: Double) : Shape("Circle") {
    override fun area() = 3.14 * radius * radius
}

fun main() {
    println(Square(2.0).describe())   // Square, area 4.0
    println(Circle(1.0).describe())   // Circle, area 3.14
    // Shape("Blob") would not compile: Shape is abstract
}`,
        play: `interface Chargeable {
    fun charge(): String
}

abstract class Gadget(val name: String) {
    var battery = 100
        private set

    abstract fun drain(): Int

    fun useIt() {
        battery -= drain()
        println("$name: $battery%")
    }
}

class Watch : Gadget("Watch"), Chargeable {
    override fun drain() = 5
    override fun charge() = "Watch on its stand"
}

class Tablet : Gadget("Tablet") {
    override fun drain() = 20
}

fun main() {
    val watch = Watch()
    val tablet = Tablet()
    watch.useIt()
    tablet.useIt()
    tablet.useIt()
    println(watch.charge())
    // Make Tablet keep Chargeable too. Then try Gadget("Box") and read the error.
}`,
        remember: 'Interface: a promise of what a class can do; a class can keep many. Abstract class: shared values and code for close relatives, with abstract functions the children fill in; one parent only, and no objects of its own.',
        mistakes: [
          { title: 'Two abstract classes as parents', bad: `abstract class Flyer {
    abstract fun fly(): String
}

abstract class Swimmer {
    abstract fun swim(): String
}

class Duck : Flyer(), Swimmer() {   // error
    override fun fly() = "flaps"
    override fun swim() = "paddles"
}`, good: `interface Flyer {
    fun fly(): String
}

interface Swimmer {
    fun swim(): String
}

class Duck : Flyer, Swimmer {
    override fun fly() = "flaps"
    override fun swim() = "paddles"
}`, why: 'A class has only one parent class. Kotlin says <code>Only one class can appear in a supertype list.</code> Abilities like flying and swimming are interfaces, and a class can keep as many as it needs.' },
        ],
        terms: [
          { term: 'abstract class', def: 'A class that can’t be made into an object itself. It can hold values and finished functions, plus abstract functions for its children to write.' },
          { term: 'abstract function', def: 'A function with no body, like <code>abstract fun sound(): String</code>. Every child must <code>override</code> it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Every report prints its title the same way, but each kind writes its own body. Make Report unfinished on purpose.', code: `[[abstract]] class Report(val title: String) {
    [[abstract]] fun body(): String

    fun print() {
        println(title)
        println(body())
    }
}

class Weekly : Report("This week") {
    override fun body() = "All good"
}`, why: 'The class is abstract because <code>body()</code> has no body yet. Weekly fills it in, and <code>Weekly().print()</code> prints both lines.' },
          { type: 'bug', prompt: 'Kotlin says <code>\'water\' hides member of supertype \'Plant\' and needs an \'override\' modifier.</code> Tap the line.', code: `abstract class Plant(val name: String) {
    abstract fun water(): String
}

class Cactus : Plant("Cactus") {
    fun water() = "Once a month"
}

fun main() {
    println(Cactus().water())
}`, bug: 5, fix: '    override fun water() = "Once a month"', why: 'Filling in an abstract function is an override, so it needs the word, the same as with an interface.' },
        ],
        quiz: [
          { q: 'Which one can hold a stored value with a starting value, like <code>var meals = 0</code>?', options: ['An abstract class', 'An interface', 'Neither'], a: 0, why: 'An interface only promises. An abstract class is a class, so it can store values.' },
          { q: 'A Duck must be both a <code>Swimmer</code> and a <code>Flyer</code>. Which choice is sure to compile?', options: ['Both are interfaces', 'Both are abstract classes'], a: 0, why: 'A class can keep many interfaces but has only one parent class.' },
          { q: 'Animal is an abstract class. What happens with <code>Animal("Cat")</code>?', options: ['It doesn’t compile', 'It makes an animal with no sound', 'It crashes when <code>sound()</code> is called'], a: 0, why: 'Kotlin stops it before the program runs: <code>Cannot create an instance of an abstract class.</code>' },
        ],
        docs: [['Abstract classes', 'https://kotlinlang.org/docs/classes.html#abstract-classes'], ['Interfaces', 'https://kotlinlang.org/docs/interfaces.html']],
      },
      {
        id: 'delegation',
        title: 'Delegation in design',
        tagline: 'Hand the work to a helper object, and let Kotlin write the forwarding.',
        goals: ['Pass calls on to a helper object instead of inheriting from a class', 'Use <code>by</code> to let Kotlin write the forwarding functions', 'Override only the functions that should behave differently'],
        level: 'intermediate', introduces: [],
        body: `
<p>Remember the CountingLogbook that broke when its parent was tidied? The class wanted everything a logbook does, plus a counter. You can get that without inheriting: keep a logbook as a part, and pass each call on to it.</p>
<p>That is <em>delegation</em>: an object hands a job to a helper object, called its <em>delegate</em>. Written by hand, each function is one line that passes the call on, like <code>override fun size() = inner.size()</code>. That is called <em>forwarding</em>. With three functions it is fine; with twenty it is a chore, so Kotlin can write the forwarding for you.</p>
<p>In <code>class CountingLogbook(private val inner: Logbook) : Logbook by inner</code>, the part <code>by inner</code> means: keep the Logbook interface by forwarding every call to <code>inner</code>. You met <code>by</code> in <code>by lazy</code>, where it handed a property’s value over to <code>lazy</code>. Here it hands a whole interface over to an object. It works with interfaces, not with classes.</p>
<p>Then override only what should be different: <code>add</code> and <code>addAll</code> count, then forward. Everything else, like <code>size()</code>, is forwarded without a line of your code. And the fragile parent problem is gone: when the helper’s <code>addAll</code> calls <code>add</code>, it calls its own <code>add</code>, not yours, so nothing is counted twice.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `interface Logbook {
    fun add(entry: String)
    fun addAll(list: List<String>)
    fun size(): Int
}

class SimpleLogbook : Logbook {
    private val entries = mutableListOf<String>()

    override fun add(entry: String) {
        entries.add(entry)
    }

    override fun addAll(list: List<String>) {
        for (e in list) {
            add(e)
        }
    }

    override fun size() = entries.size
}

class CountingLogbook(private val inner: Logbook) : Logbook by inner {
    var count = 0

    override fun add(entry: String) {
        count += 1
        inner.add(entry)
    }

    override fun addAll(list: List<String>) {
        count += list.size
        inner.addAll(list)
    }
}

fun main() {
    val log = CountingLogbook(SimpleLogbook())
    log.addAll(listOf("start", "stop", "pause"))
    println(log.count)
    println(log.size())
}`,
            predict: {
              q: 'SimpleLogbook’s <code>addAll</code> calls <code>add(e)</code>, like the tidied parent that counted 6. What does <code>log.count</code> print this time?',
              options: ['<code>3</code>', '<code>6</code>', '<code>0</code>'],
              a: 0,
              why: 'The helper’s <code>add(e)</code> runs the helper’s own <code>add</code>. The counting <code>add</code> is never called from inside it.',
            },
            frames: [
              { line: [1, 2, 3, 4], say: 'Logbook is now an interface. SimpleLogbook keeps it, and its <code>addAll</code> calls <code>add(e)</code>, like the tidied parent did.' },
              { line: 23, say: '<code>: Logbook by inner</code>: CountingLogbook keeps Logbook by forwarding calls to <code>inner</code>, its delegate. No parent class at all.' },
              { line: 38, vars: { 'log.count': '0' }, say: 'The helper is handed in through the constructor, like any part.' },
              { line: [39, 32, 33], vars: { 'log.count': '3' }, say: 'Our <code>addAll</code> counts 3 entries, then forwards to <code>inner.addAll</code>.' },
              { line: [15, 16, 11], say: 'Inside SimpleLogbook, <code>add(e)</code> is SimpleLogbook’s own <code>add</code>. Our counting <code>add</code> isn’t involved.' },
              { line: 40, out: '3', say: 'Counted once per entry. The helper can change inside without breaking us.' },
              { line: [41, 20], out: '3', say: 'We never wrote <code>size()</code>. <code>by inner</code> forwarded it to the helper.' },
            ],
          });
        },
        code: `interface Speaker {
    fun hello(): String
    fun bye(): String
}

class Polite : Speaker {
    override fun hello() = "Good morning"
    override fun bye() = "Goodbye"
}

// By hand: every function forwards to the helper.
class Robot(private val voice: Speaker) : Speaker {
    override fun hello() = voice.hello()
    override fun bye() = voice.bye()
}

// With by: Kotlin writes the forwarding. Override only what differs.
class LoudRobot(private val voice: Speaker) : Speaker by voice {
    override fun hello() = voice.hello() + "!"
}

fun main() {
    println(Robot(Polite()).hello())       // Good morning
    println(LoudRobot(Polite()).hello())   // Good morning!
    println(LoudRobot(Polite()).bye())     // Goodbye
}`,
        play: `interface Storage {
    fun save(key: String, value: String)
    fun load(key: String): String?
    fun keys(): Int
}

class MemoryStorage : Storage {
    private val data = mutableMapOf<String, String>()   // empty: String keys, String values

    override fun save(key: String, value: String) {
        data[key] = value
    }

    override fun load(key: String): String? = data[key]

    override fun keys() = data.size
}

class LoggingStorage(private val inner: Storage) : Storage by inner {
    override fun save(key: String, value: String) {
        println("Saving $key")
        inner.save(key, value)
    }
}

fun main() {
    val store = LoggingStorage(MemoryStorage())
    store.save("city", "Oslo")
    store.save("name", "Lin")
    println(store.load("city"))
    println(store.keys())
    // Override load() too, so it prints "Loading city" first.
}`,
        remember: 'Delegation: keep a helper and pass calls on to it. class X(private val inner: I) : I by inner forwards every function you don’t override.',
        mistakes: [
          { title: 'Overriding and forgetting to forward', bad: `override fun add(entry: String) {
    count += 1
    // forgot: inner.add(entry)
}`, good: `override fun add(entry: String) {
    count += 1
    inner.add(entry)
}`, why: 'An override replaces the forwarding for that one function. If it doesn’t call the helper, the entry is counted but never stored.' },
        ],
        terms: [
          { term: 'delegation', def: 'Handing a job to a helper object instead of doing it yourself or inheriting it.' },
          { term: 'delegate', def: 'The helper object that receives the calls, like <code>inner</code> in <code>Logbook by inner</code>.' },
          { term: 'forwarding', def: 'A function that only passes the call on to the delegate, like <code>override fun size() = inner.size()</code>. <code>by</code> writes these for you.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Shy greets in its own way, but waves exactly like its helper. Let Kotlin forward the rest to <code>helper</code>.', code: `interface Greeter {
    fun greet(): String
    fun wave(): String
}

class Friendly : Greeter {
    override fun greet() = "Hi"
    override fun wave() = "o/"
}

class Shy(private val helper: Greeter) : Greeter [[by]] [[helper]] {
    override fun greet() = "...hi"
}`, why: '<code>by helper</code> forwards <code>wave()</code>. Only <code>greet()</code> is overridden, so <code>Shy(Friendly())</code> says <code>...hi</code> and waves <code>o/</code>.' },
          { type: 'bug', prompt: 'Kotlin says <code>Class \'SafePrinter\' is not abstract and does not implement abstract member: fun status(): String</code>. The status should come from the helper. Tap the line.', code: `interface Printer {
    fun print(text: String): String
    fun status(): String
}

class OfficePrinter : Printer {
    override fun print(text: String) = "Printed: $text"
    override fun status() = "Ready"
}

class SafePrinter(private val inner: Printer) : Printer {
    override fun print(text: String) = if (text == "") "Nothing to print" else inner.print(text)
}

fun main() {
    val p = SafePrinter(OfficePrinter())
    println(p.print("Menu"))
    println(p.status())
}`, bug: 10, fix: 'class SafePrinter(private val inner: Printer) : Printer by inner {', why: 'Without <code>by inner</code>, SafePrinter promised all of Printer but wrote only <code>print</code>. With it, <code>status()</code> is forwarded and prints <code>Ready</code>.' },
        ],
        quiz: [
          { q: 'In <code>class A(private val b: Speaker) : Speaker by b</code>, A doesn’t override <code>bye()</code>. Whose <code>bye()</code> runs?', options: ['<code>b</code>’s', 'A’s own, empty one', 'None: it doesn’t compile'], a: 0, why: '<code>by b</code> forwards every function A doesn’t write itself.' },
          { q: 'Why does the counting logbook built with <code>by</code> count 3, not 6?', options: ['The helper’s <code>addAll</code> calls the helper’s own <code>add</code>', '<code>by</code> skips <code>addAll</code>', 'The count is reset after each call'], a: 0, why: 'There is no parent whose code calls back into ours. The helper only ever calls itself.' },
          { q: 'Which line forwards the Storage interface to a helper called <code>inner</code>?', options: ['<code>class Logged(private val inner: Storage) : Storage by inner</code>', '<code>class Logged : Storage(inner)</code>', '<code>class Logged by Storage</code>'], a: 0, why: 'The helper comes in through the constructor; <code>: Storage by inner</code> keeps the interface by forwarding to it.' },
        ],
        docs: [['Delegation', 'https://kotlinlang.org/docs/delegation.html']],
      },

      {
        id: 'cohesion-coupling',
        title: 'Cohesion and coupling',
        tagline: 'Code is easy to change when each class has one focus and classes are linked loosely.',
        goals: ['Spot a class that does unrelated jobs (low cohesion)', 'Spot code that reaches into another class’s insides (tight coupling)', 'Count which classes a change touches, and bring that number down'],
        level: 'intermediate', introduces: [],
        body: `
<p>A shop app needs one small change: the cart should store its prices in a map instead of a list. If four classes break, that small change takes a day. If one class changes, it takes ten minutes. The difference comes from two qualities of a design.</p>
<p><em>Cohesion</em> is how well the things inside one class belong together. A Cart that holds prices and adds them up has high cohesion: one focus. A class that adds up prices, writes emails and formats dates has low cohesion: three unrelated reasons to change, tangled in one place.</p>
<p><em>Coupling</em> is how much one class depends on another. Tight coupling means reaching into another class’s insides, like a Receipt that loops over <code>cart.prices</code> itself. Then any change to how Cart stores its prices breaks the Receipt. Loose coupling means using only what the other class offers on its surface, like <code>cart.total()</code>. Then Cart can change inside as much as it likes.</p>
<p>Aim for high cohesion and loose coupling. What you have learned so far all helps: encapsulation and abstraction keep the insides private, so other classes can only couple to the surface.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'cart', label: 'Cart', x: 30, y: 14 },
              { id: 'items', label: 'prices<small>inside Cart</small>', x: 80, y: 14, tone: 'warm' },
              { id: 'receipt', label: 'Receipt', x: 12, y: 86, tone: 'muted' },
              { id: 'banner', label: 'Banner', x: 46, y: 86, tone: 'muted' },
              { id: 'report', label: 'Report', x: 82, y: 86, tone: 'muted' },
            ],
            predict: {
              q: 'Receipt, Banner and Report all read Cart’s list of prices themselves. Cart switches that list to a map. How many classes need changes?',
              options: ['4', '1', '3'],
              a: 0,
              why: 'Cart itself, plus all three classes that reached inside it.',
            },
            frames: [
              { add: [['cart', 'items', 'has'], ['receipt', 'items', 'reads'], ['banner', 'items', 'reads'], ['report', 'items', 'reads']], say: 'Tight coupling: Receipt, Banner and Report each go into Cart’s list and work with it themselves.' },
              { hl: ['items'], say: 'One decision inside Cart: the prices move from a list to a map.' },
              { add: [['receipt', 'items', 'breaks', 'err'], ['banner', 'items', 'breaks', 'err'], ['report', 'items', 'breaks', 'err']], hl: ['receipt', 'banner', 'report'], say: 'Every class that reached inside breaks. Four classes to change, for one decision inside Cart.' },
              { remove: [['receipt', 'items'], ['banner', 'items'], ['report', 'items']], add: [['receipt', 'cart', 'total()', 'accent'], ['banner', 'cart', 'count()', 'accent'], ['report', 'cart', 'total()', 'accent']], say: 'Loose coupling: Cart keeps its prices private and offers <code>total()</code> and <code>count()</code>. The others use only those.' },
              { add: [['cart', 'items', 'map now', 'ok']], hl: ['cart', 'items'], say: 'The same change again, list to map. Only Cart’s own code changes; <code>total()</code> still gives back a number.' },
              { hl: ['cart'], say: 'Cart has high cohesion too: everything in it is about the prices in the cart. Emails and dates belong in other classes.' },
            ],
          });
        },
        code: `class Cart {
    private val prices = mutableListOf<Int>()

    fun add(price: Int) {
        prices.add(price)
    }

    fun total() = prices.sum()
}

class Receipt(private val cart: Cart) {
    fun text() = "Total: \${cart.total()}"   // only Cart's surface
}

fun main() {
    val cart = Cart()
    cart.add(30)
    cart.add(12)
    println(Receipt(cart).text())   // Total: 42
}`,
        play: `class Cart {
    val prices = mutableListOf<Int>()
}

class Receipt(private val cart: Cart) {
    fun text(): String {
        var sum = 0
        for (p in cart.prices) {
            sum += p
        }
        return "Total: $sum"
    }
}

class Banner(private val cart: Cart) {
    fun text() = "\${cart.prices.size} items in your cart"
}

fun main() {
    val cart = Cart()
    cart.prices.add(30)
    cart.prices.add(12)
    println(Receipt(cart).text())
    println(Banner(cart).text())
    // Receipt and Banner reach into Cart's list: they are tightly coupled.
    // Give Cart fun add(price: Int), fun total() and fun count(), make prices private,
    // then change Receipt, Banner and main to use only those three.
}`,
        remember: 'High cohesion: each class has one focus. Loose coupling: classes use each other only through their surfaces. Then a change stays in one place.',
        mistakes: [
          { title: 'One class with three jobs', bad: `class Shop {
    fun total(prices: List<Int>) = prices.sum()
    fun welcomeEmail(name: String) = "Hello $name, thanks for joining"
    fun shortDate(day: Int, month: Int) = "$day/$month"
}`, good: `class Cart { /* prices and their total */ }
class Mailer { /* email texts */ }
class Dates { /* date formats */ }`, why: 'Three unrelated reasons to change share one class. Editing the email text means editing the class that adds up prices too. Split it so each class has one focus.' },
        ],
        terms: [
          { term: 'cohesion', def: 'How well the things inside one class belong together. High cohesion: one clear focus.' },
          { term: 'coupling', def: 'How much one class depends on another. Tight: it reaches into the other’s insides. Loose: it uses only the other’s surface.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let Receipt use only what Cart offers. Give Cart’s function a name, and call it.', code: `class Cart {
    private val prices = mutableListOf<Int>()

    fun add(price: Int) {
        prices.add(price)
    }

    fun [[total]]() = prices.sum()
}

class Receipt(private val cart: Cart) {
    fun text() = "Total: \${cart.[[total]]()}"
}`, why: 'Receipt now depends only on <code>total()</code>, not on how Cart stores its prices.' },
          { type: 'bug', prompt: 'Kotlin says <code>Cannot access \'val prices: MutableList&lt;Int&gt;\': it is private in \'Cart\'.</code> (<code>MutableList&lt;Int&gt;</code> is the type of a <code>mutableListOf&lt;Int&gt;()</code>.) Tap the line that reaches inside.', code: `class Cart {
    private val prices = mutableListOf<Int>()

    fun add(price: Int) {
        prices.add(price)
    }

    fun total() = prices.sum()
}

class Receipt(private val cart: Cart) {
    fun text() = "Total: \${cart.prices.sum()}"
}

fun main() {
    val cart = Cart()
    cart.add(5)
    println(Receipt(cart).text())
}`, bug: 11, fix: '    fun text() = "Total: ${cart.total()}"', why: 'The private list is Cart’s business. Use its surface, <code>total()</code>, and it prints <code>Total: 5</code>.' },
        ],
        quiz: [
          { q: 'A class adds up prices, sends emails and formats dates. What is the problem?', options: ['Low cohesion: three unrelated jobs', 'Tight coupling to Cart', 'Nothing'], a: 0, why: 'Each job is a separate reason to change. They belong in separate classes.' },
          { q: 'Which line is loosely coupled to Cart?', options: ['<code>cart.total()</code>', '<code>cart.prices.sum()</code>'], a: 0, why: 'It uses Cart’s surface. The other depends on how Cart stores its prices inside.' },
          { q: 'How do private properties help keep coupling loose?', options: ['Other classes can only use the surface, so they can’t depend on the insides', 'Private code runs faster', 'They make classes shorter'], a: 0, why: 'What others can’t reach, they can’t depend on, so it is free to change.' },
        ],
        docs: [['Guide to app architecture', 'https://developer.android.com/topic/architecture']],
      },

      {
        id: 'domain-modeling',
        title: 'Modelling a domain',
        tagline: 'Turn a description of a problem into types that make mistakes hard to write.',
        goals: ['Pick the right tool for each part of a description: class, data class, enum or sealed', 'Put each rule in the class that owns the data', 'Let the compiler point to every place a new case must be handled'],
        level: 'intermediate', introduces: [],
        body: `
<p>A small library asks for an app: “Members, each with a card number, borrow books. A book is on the shelf, on loan to a member until a due day, or lost. A book on loan can’t be lent again.” Before writing any logic, decide which types the program has. Good types make many mistakes impossible even to write.</p>
<p>The <em>domain</em> is the part of the world a program is about: here, members, books and loans. Modelling the domain means turning its words into types, with the tools you know. A plain value described by its data, like a member with a card number and a name, is a <code>data class</code>. A thing with a life and rules, like a book that gets lent, is a class with private state and functions. A fixed list of simple choices is an <code>enum class</code>. Either-or cases where some carry their own data, like “on loan to Ada until day 17”, are a <code>sealed interface</code> with one member per case.</p>
<p>Then each rule goes into the class that owns the data: “a book on loan can’t be lent again” lives in <code>Book.lendTo()</code>. Notice what the types rule out. A book can’t be lost and on loan at once, because it has exactly one state. A loan can’t forget its member, because <code>OnLoan</code> can’t be made without one. And if the library later adds a case, like “being repaired”, every <code>when</code> that doesn’t handle it stops compiling and shows you where to update.</p>
<p>Two small details in the code below. <code>is</code> also works in an <code>if</code>: <code>if (state is OnLoan)</code>. And <code>state</code> is a <code>var</code>, so Kotlin won’t trust a check on it, because it could change in between. Copy it into a <code>val</code> first (<code>val s = book.state</code>), and the <code>is OnLoan</code> smart cast in the <code>when</code> works.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 430,
            nodes: [
              { id: 'p1', label: '“members”<small>have a card number, a name</small>', x: 22, y: 9, tone: 'muted', hidden: true },
              { id: 'p2', label: '“books”<small>have a title, get lent</small>', x: 22, y: 30, tone: 'muted', hidden: true },
              { id: 'p3', label: '“on the shelf, on loan, or lost”', x: 22, y: 51, tone: 'muted', hidden: true },
              { id: 'p4', label: '“on loan to a member until a day”', x: 22, y: 72, tone: 'muted', hidden: true },
              { id: 'p5', label: '“can’t be lent again”', x: 22, y: 92, tone: 'muted', hidden: true },
              { id: 't1', label: 'data class Member', x: 76, y: 9, hidden: true },
              { id: 't2', label: 'class Book<small>private state</small>', x: 76, y: 30, hidden: true },
              { id: 't3', label: 'sealed interface BookState', x: 76, y: 51, tone: 'ok', hidden: true },
              { id: 't4', label: 'class OnLoan<small>member, dueDay</small>', x: 76, y: 72, tone: 'ok', hidden: true },
              { id: 't5', label: 'fun lendTo()<small>in Book</small>', x: 76, y: 92, hidden: true },
            ],
            predict: {
              q: 'A book is “on the shelf”, “on loan until day 30”, or “lost”. Which tool fits best?',
              options: ['A sealed interface, with a class for the loan', 'An enum class with three choices', 'Three Boolean properties'],
              a: 0,
              why: 'A book is in exactly one state, and only the loan carries extra data. Three Booleans could all be true at once.',
            },
            frames: [
              { show: ['p1', 't1'], add: [['p1', 't1', '', 'accent']], say: '“Members” with a card number and a name: a plain value described by its data, so a <code>data class</code>. The card number is an <code>id</code>: two different people both called Ada get different ids, so they are not equal.' },
              { show: ['p2', 't2'], add: [['p2', 't2', '', 'accent']], say: '“Books” have a life: they are lent and given back. A class with private state and functions.' },
              { show: ['p3', 't3'], add: [['p3', 't3', '', 'accent']], say: 'Three cases, exactly one at a time: a <code>sealed interface BookState</code>. OnShelf and Lost carry no data, so they are objects.' },
              { show: ['p4', 't4'], add: [['p4', 't4', '', 'accent'], ['t4', 't3', 'is a', 'ok']], say: 'Only the loan carries data: who has the book, and until when. So OnLoan is a class with properties, which an enum choice couldn’t hold.' },
              { show: ['p5', 't5'], add: [['p5', 't5', '', 'accent']], say: 'The rule goes into the class that owns the state: <code>lendTo()</code> checks the book’s state before changing it.' },
              { hl: ['t3'], say: 'A new case later, like Repairing? Add one member to BookState, and Kotlin points at every <code>when</code> that must handle it.' },
            ],
          });
        },
        code: `data class Member(val id: Int, val name: String)

sealed interface BookState
object OnShelf : BookState
class OnLoan(val member: Member, val dueDay: Int) : BookState
object Lost : BookState

class Book(val title: String) {
    var state: BookState = OnShelf   // the type is BookState, so any case fits later
        private set

    fun lendTo(member: Member, today: Int): Boolean {
        if (state != OnShelf) {
            return false
        }
        state = OnLoan(member, today + 14)
        return true
    }

    fun giveBack() {
        if (state is OnLoan) {
            state = OnShelf
        }
    }

    fun markLost() {
        state = Lost
    }
}

fun describe(book: Book): String {
    val s = book.state   // a val copy, so the smart cast to OnLoan works
    return when (s) {
        OnShelf -> "\${book.title}: on the shelf"
        is OnLoan -> "\${book.title}: with \${s.member.name} until day \${s.dueDay}"
        Lost -> "\${book.title}: lost"
    }
}

fun main() {
    val ada = Member(1, "Ada")
    val book = Book("Blue Harbor")
    println(describe(book))                     // Blue Harbor: on the shelf
    book.lendTo(ada, 3)
    println(describe(book))                     // Blue Harbor: with Ada until day 17
    println(book.lendTo(Member(2, "Sam"), 4))   // false: already on loan
}`,
        play: `enum class Size { SMALL, LARGE }

data class Drink(val name: String, val size: Size)

sealed interface OrderState
object Waiting : OrderState
class Ready(val counter: Int) : OrderState
object Collected : OrderState

class Order(val drink: Drink) {
    var state: OrderState = Waiting   // the type is OrderState, so any case fits later
        private set

    fun price(): Int = if (drink.size == Size.SMALL) 3 else 4

    fun finish(counter: Int) {
        if (state == Waiting) {
            state = Ready(counter)
        }
    }

    fun collect() {
        if (state is Ready) {
            state = Collected
        }
    }
}

fun show(order: Order): String {
    val s = order.state   // a val copy, so the smart cast to Ready works
    return when (s) {
        Waiting -> "\${order.drink.name}: waiting"
        is Ready -> "\${order.drink.name}: ready at counter \${s.counter}"
        Collected -> "\${order.drink.name}: collected"
    }
}

fun main() {
    val order = Order(Drink("Cocoa", Size.LARGE))
    println("Price: \${order.price()}")
    println(show(order))
    order.finish(2)
    println(show(order))
    order.collect()
    println(show(order))
    // New rule: an order can be Cancelled, with a reason. Add it to OrderState
    // and see which line Kotlin points you to.
}`,
        remember: 'Turn the words of the problem into types: data class for values, classes for things with rules, enum for simple choices, sealed for cases with their own data. Put each rule where its data lives.',
        mistakes: [
          { title: 'Modelling cases with loose Booleans', bad: `class Book(val title: String) {
    var onLoan = false
    var lost = false
    var member: String? = null
}
// onLoan and lost can both be true,
// and a loan can be missing its member`, good: `sealed interface BookState
object OnShelf : BookState
class OnLoan(val member: Member, val dueDay: Int) : BookState
object Lost : BookState`, why: 'With Booleans, nonsense states are possible, and every function has to check for them. With a sealed state, a book is in exactly one case, and a loan always has its member.' },
        ],
        terms: [
          { term: 'domain', def: 'The part of the world a program is about, like members, books and loans for a library.' },
          { term: 'domain model', def: 'The types that describe a domain in code, with each rule placed in the class that owns its data.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A seat is free, or taken by someone. Put Free in the family, and handle the taken case.', code: `sealed interface Seat
object Free : [[Seat]]
class Taken(val person: String) : Seat

fun label(s: Seat): String = when (s) {
    Free -> "free"
    is [[Taken]] -> "taken by \${s.person}"
}`, why: 'Free carries no data, so it is an object. Taken carries a name, so it is a class, and after <code>is Taken</code> you can read <code>s.person</code>.' },
          { type: 'bug', prompt: 'Kotlin says <code>Assignment type mismatch: actual type is \'Lost\', but \'BookState\' was expected.</code> Tap the line.', code: `sealed interface BookState
object OnShelf : BookState
object Lost

class Book(val title: String) {
    var state: BookState = OnShelf
        private set

    fun markLost() {
        state = Lost
    }
}`, bug: 2, fix: 'object Lost : BookState', why: 'Lost is a case of BookState, so it has to join the family with <code>: BookState</code>. Without it, it is an unrelated object.' },
        ],
        quiz: [
          { q: 'A café has cup sizes small, medium and large, with nothing else to store. Which tool fits?', options: ['An enum class', 'A sealed interface', 'A data class'], a: 0, why: 'A fixed list of simple choices, none carrying its own data.' },
          { q: 'Where does the rule “a book on loan can’t be lent again” belong?', options: ['In <code>Book.lendTo()</code>', 'In every screen with a Lend button', 'In the Member class'], a: 0, why: 'In the class that owns the book’s state, written once.' },
          { q: 'You add <code>object Repairing : BookState</code>. What does Kotlin do?', options: ['Every <code>when</code> over BookState with no <code>else</code> stops compiling until it handles Repairing', 'Nothing, until the program runs', 'The program crashes at the start'], a: 0, why: 'A sealed family is known in full, so Kotlin can check every <code>when</code> before the program runs.' },
        ],
        docs: [['Sealed classes and interfaces', 'https://kotlinlang.org/docs/sealed-classes.html'], ['Data classes', 'https://kotlinlang.org/docs/data-classes.html']],
      },
    ],
  });
})();
