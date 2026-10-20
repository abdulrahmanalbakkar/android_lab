/* Views track. Same shape as tracks/kotlin.js.
   Optional: reading and changing older View-based screens, then mixing them with Compose.
   Every demo uses the shared Lab.ui kit (phone, flow, timeline), so this track has no css of its own. */
(() => {
  Lab.addTrack({
    id: 'views',
    title: 'Views',
    description: 'Read and change older screens built with Views: XML layouts, RecyclerView, Fragments, and mixing them with Compose.',
    group: 'Building apps',
    requires: ['android', 'compose'],
    lessons: [
      {
        id: 'xml',
        title: 'XML layouts',
        tagline: 'How older screens are written down in a file, then built as objects.',
        goals: ['Read a layout file from <code>res/layout</code>', 'Build its views with view binding and show them', 'Change a view that is already on screen'],
        level: 'beginner',
        introduces: ['View', 'TextView', 'LinearLayout', 'setContentView', 'inflate', 'layoutInflater', 'root', 'viewBinding', 'buildFeatures', 'setOnClickListener', 'findViewById'],
        ignore: ['android', 'id', 'text', 'orientation', 'vertical', 'match_parent', 'wrap_content', 'layout_width', 'layout_height', 'xmlns', 'http', 'schemas', 'com', 'apk', 'res', 'layout', 'xml'],
        body: `
<p>Compose became stable in 2021. Apps written before that, and a lot of code still written today, build screens a different way: with <em>Views</em>. You will meet them in older projects, in library samples and in answers online. This track teaches you to read and change them, comparing each idea to the Compose you know.</p>
<p>A View screen starts as a <em>layout file</em> in <code>res/layout</code>, written in XML: a text format made of tags. <code>&lt;TextView ... /&gt;</code> is one view, a piece of text. <code>&lt;LinearLayout&gt; ... &lt;/LinearLayout&gt;</code> holds other views and, with <code>android:orientation="vertical"</code>, stacks them like a <code>Column</code>.</p>
<p>Each <code>name="value"</code> inside a tag is an <em>attribute</em>. <code>android:text</code> sets the text. <code>android:id="@+id/title"</code> gives the view a name your code can use (<code>@+id/</code> means “create a new id with this name”). Every view also sets <code>android:layout_width</code> and <code>android:layout_height</code>, usually to <code>match_parent</code> (as big as its parent) or <code>wrap_content</code> (as big as its content).</p>
<p>The file is only a description. <em>Inflating</em> reads it and builds real view objects. With <em>view binding</em> turned on in Gradle, <code>activity_profile.xml</code> gets a class <code>ActivityProfileBinding</code>, with one property for each view that has an id. <code>inflate(layoutInflater)</code> builds the views and <code>setContentView(binding.root)</code> shows them, where Compose code would call <code>setContent { }</code>. Then the big difference: a view stays on screen, and you change it, as in <code>binding.title.text = "Hi, Ada"</code>. In Compose you would change state, and Compose would run <code>Text</code> again with the new value.</p>`,
        visual(el) {
          const scr = (title, btn) => `<div class="ui-m-bar">Profile</div><div class="ui-m-body"><b>${title}</b><span class="ui-m-btn">${btn}</span></div>`;
          Lab.ui.phone(el, {
            logTitle: 'Code',
            predict: {
              q: 'You call <code>ActivityProfileBinding.inflate(layoutInflater)</code>. What do you get back?',
              options: ['The XML as text', 'Real view objects, plus a binding with one property per id', 'Views that are already on the screen'],
              a: 1,
              why: 'Inflating builds every view in the file right away, nested like the XML. They exist, but nothing shows them until <code>setContentView</code>.',
            },
            frames: [
              { screen: '<div class="ui-m-center ui-m-muted">nothing on screen yet</div>', log: '// activity_profile.xml: LinearLayout holding TextView @+id/title and Button @+id/follow', say: 'The layout file only describes the screen. No view object exists yet.' },
              { log: 'binding = ActivityProfileBinding.inflate(layoutInflater)', say: 'Inflating builds three objects: a <code>LinearLayout</code>, a <code>TextView</code> and a <code>Button</code>. <code>binding.title</code> and <code>binding.follow</code> point at the last two. Still nothing on screen.' },
              { screen: scr('Hello', 'Follow'), log: 'setContentView(binding.root)', say: '<code>binding.root</code> is the outer <code>LinearLayout</code>. <code>setContentView</code> shows it, and everything inside it.' },
              { screen: scr('Hi, Ada', 'Follow'), log: 'binding.title.text = "Hi, Ada"', say: 'You change the <code>TextView</code> that is already there. No new view is made.' },
              { screen: scr('Hi, Ada', 'Following'), tap: '.ui-m-btn', log: 'binding.follow.setOnClickListener { binding.follow.text = "Following" }', say: '<code>setOnClickListener</code> gives the button a lambda to run on each tap, like <code>onClick</code> in Compose. The lambda changes the button’s own text.' },
              { log: 'binding.subtitle.text = "Oslo"  // Unresolved reference \'subtitle\'.', say: 'No view has the id <code>subtitle</code>, so the binding has no such property. The mistake is caught before the app runs.' },
            ],
          });
        },
        code: `// build.gradle.kts (the app module): turn on view binding
android {
    buildFeatures {
        viewBinding = true
    }
}

<!-- res/layout/activity_profile.xml. Text between these marks is an XML comment. -->
<!-- xmlns:android on the first tag lets the file use android: names. -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">
    <TextView
        android:id="@+id/title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello" />
    <Button
        android:id="@+id/follow"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Follow" />
</LinearLayout>

// ProfileActivity.kt
class ProfileActivity : ComponentActivity() {
    private lateinit var binding: ActivityProfileBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.title.text = "Hi, Ada"          // the screen now says Hi, Ada
        binding.follow.setOnClickListener {      // runs on each tap
            binding.follow.text = "Following"
        }

        // Older code finds a view by id instead of using a binding.
        // Same job, but a wrong id or type only shows up when the app runs.
        findViewById<TextView>(R.id.title).text = "Hi, Ada"
    }
}`,
        remember: 'A layout file describes views; inflate builds them; setContentView(binding.root) shows them; you change a view instead of drawing it again.',
        terms: [
          { term: 'layout file', def: 'An XML file in <code>res/layout</code> that describes the views of a screen as nested tags.' },
          { term: 'inflate', def: 'Read a layout file and build the view objects it describes.' },
          { term: 'view binding', def: 'A build feature that makes a class per layout, like <code>ActivityProfileBinding</code>, with one property for each view that has an id.' },
          { term: 'findViewById', def: 'The older way to get a view: look it up by id, like <code>findViewById(R.id.title)</code>. Mistakes only show up when the app runs.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build the views, show them, then change the title.', code: `binding = ActivityProfileBinding.[[inflate]](layoutInflater)
setContentView(binding.[[root]])
binding.title.text = "Hi, Sam"`, why: '<code>inflate</code> builds the views. <code>root</code> is the outer view, which <code>setContentView</code> puts on the screen.' },
          { type: 'bug', prompt: 'The screen says “Hello” and never “Hi, Ada”. Tap the line that needs to change.', code: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    binding = ActivityProfileBinding.inflate(layoutInflater)
    setContentView(R.layout.activity_profile)
    binding.title.text = "Hi, Ada"
}`, bug: 3, fix: '    setContentView(binding.root)', why: 'Passing the layout id inflates the file a second time, making a second set of views, and shows those. The binding changes the first set, which is never on screen.' },
        ],
        quiz: [
          { q: 'Which views in <code>activity_profile.xml</code> get a property in <code>ActivityProfileBinding</code>?', options: ['Only views that have an <code>android:id</code>', 'Every view in the file', 'Only the outer view'], a: 0, why: 'The binding has one property per view with an id, plus <code>root</code> for the outer view.' },
          { q: 'You rename <code>@+id/title</code> to <code>@+id/heading</code>. What happens to <code>binding.title.text = "Hi"</code>?', options: ['It stops compiling: <code>Unresolved reference \'title\'.</code>', 'The app crashes when it runs that line', 'It still works'], a: 0, why: 'The binding class is made again with a <code>heading</code> property, so <code>title</code> no longer exists.' },
          { q: 'A <code>TextView</code> is on screen. How do you show new text in it?', options: ['<code>binding.title.text = "New"</code>', 'Inflate the layout again', 'Call <code>Text("New")</code>'], a: 0, why: 'A view is an object that stays on screen. You change its properties, and it updates itself.' },
        ],
        docs: [['Layouts in views', 'https://developer.android.com/develop/ui/views/layout/declaring-layout'], ['View binding', 'https://developer.android.com/topic/libraries/view-binding']],
      },

      {
        id: 'passes',
        title: 'Measure, layout, draw',
        tagline: 'Three passes turn a tree of views into pixels.',
        goals: ['Name the three passes and what each one decides', 'Choose between <code>invalidate()</code> and <code>requestLayout()</code>', 'Read a small custom view'],
        level: 'intermediate',
        introduces: ['onMeasure', 'setMeasuredDimension', 'onDraw', 'Canvas', 'drawColor', 'invalidate', 'requestLayout', 'Color'],
        body: `
<p>A badge shows “9”, then “10”. The number got wider, so the badge needs more room, and whatever sits next to it may have to move. Android works this out in three steps, called <em>passes</em>, in the next <em>frame</em>: the next new picture on the screen, which comes many times a second.</p>
<p>The views of a screen form a tree, like the Component Tree you saw in the Layout Inspector (there a <code>Column</code> held a <code>Text</code> and a <code>Button</code>); here the <code>LinearLayout</code> holds the <code>TextView</code> and the <code>Button</code>. <b>Measure</b> walks the tree from the top and asks every view how big it wants to be. <b>Layout</b> walks it again and gives every view its position, using those sizes. <b>Draw</b> paints the views, each parent first, then its children on top.</p>
<p>You never run the passes yourself: you ask for them. <code>invalidate()</code> means “my look changed”, so only draw runs again. <code>requestLayout()</code> means “my size may have changed”, so measure and layout run again too. Built-in views such as <code>TextView</code> ask for themselves when you set <code>text</code>. In a <em>custom view</em>, your own class that extends <code>View</code>, you ask in your property setters. (Compose asks for you whenever state changes.)</p>
<p>The custom view below fills itself with a color. <code>onMeasure</code> answers the measure pass by calling <code>setMeasuredDimension(width, height)</code>; its two parameters carry the space the parent offers, which this small view ignores. <code>onDraw</code> answers the draw pass: <code>canvas</code> is the surface to paint on, and <code>drawColor</code> fills it. <code>Color.RED</code> is a color stored as an <code>Int</code>.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'code', label: 'Your code', sub: 'a setter' },
              { id: 'measure', label: 'measure', sub: 'how big?' },
              { id: 'layout', label: 'layout', sub: 'where?' },
              { id: 'draw', label: 'draw', sub: 'paint it' },
            ],
            predict: {
              q: 'The setter runs <code>swatch.color = Color.BLUE</code>, which calls <code>invalidate()</code>. Which passes run for the swatch in the next frame?',
              options: ['All three', 'Only draw', 'None: the color shows right away'],
              a: 1,
              why: 'A new color changes the look, not the size or the position. <code>invalidate()</code> asks for a redraw only.',
            },
            frames: [
              { say: 'A custom <code>SwatchView</code>, 100 × 100 pixels, filled red. Watch what each change asks for.' },
              { at: 'code', packet: 'color = BLUE', say: 'The <code>color</code> setter stores the new value and calls <code>invalidate()</code>: “my look changed”.' },
              { at: 'draw', mark: { measure: 'muted', layout: 'muted', draw: 'ok' }, say: 'Measure and layout are skipped: the size and position are the same. <code>onDraw</code> runs and paints blue.' },
              { at: 'code', packet: 'sizePx = 200', mark: { measure: '', layout: '', draw: '' }, say: 'Now the <code>sizePx</code> setter calls <code>requestLayout()</code>: “my size may have changed”, and <code>invalidate()</code> to repaint.' },
              { at: 'measure', mark: { measure: 'ok' }, say: '<code>onMeasure</code> runs: <code>setMeasuredDimension(200, 200)</code>. Its parent is measured again too, since one child’s size can change the parent’s.' },
              { at: 'layout', mark: { layout: 'ok' }, say: 'Layout places every view again. A view below the swatch moves down 100 pixels.' },
              { at: 'draw', mark: { draw: 'ok' }, say: 'Then draw paints the swatch at its new size. Measure, then layout, then draw: always in that order.' },
            ],
          });
        },
        code: `class SwatchView(context: Context) : View(context) {
    var color = Color.RED
        set(value) {
            field = value
            invalidate()        // look changed: draw again
        }

    var sizePx = 100
        set(value) {
            field = value
            requestLayout()     // size changed: measure and layout again
            invalidate()        // and draw it at the new size
        }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        setMeasuredDimension(sizePx, sizePx)    // "I want to be sizePx by sizePx"
    }

    override fun onDraw(canvas: Canvas) {
        canvas.drawColor(color)                 // fill the whole view
    }
}

swatch.color = Color.BLUE    // next frame: draw only
swatch.sizePx = 200          // next frame: measure, layout, draw`,
        remember: 'Measure (how big), layout (where), draw (paint). Look changed: invalidate(). Size changed: requestLayout().',
        terms: [
          { term: 'measure, layout, draw', def: 'The three passes of a frame: work out every view’s size, then its position, then paint it.' },
          { term: 'invalidate', def: '<code>invalidate()</code> asks for the view to be drawn again in the next frame, without measuring or placing it again.' },
          { term: 'requestLayout', def: '<code>requestLayout()</code> asks for a new measure and layout pass in the next frame, because a size or position may change.' },
          { term: 'custom view', def: 'Your own class that extends <code>View</code> and paints itself in <code>onDraw</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A new color only changes the look. A new size changes the size.', code: `var color = Color.RED
    set(value) {
        field = value
        [[invalidate]]()
    }

var sizePx = 100
    set(value) {
        field = value
        [[requestLayout]]()
        invalidate()
    }`, why: 'A redraw is enough for a color. A size change needs measure and layout to run again.' },
          { type: 'bug', prompt: 'The code sets <code>swatch.sizePx = 300</code>, but the swatch stays 100 pixels wide. Tap the line that needs to change.', code: `var sizePx = 100
    set(value) {
        field = value
        invalidate()
    }`, bug: 3, fix: '        requestLayout()', why: '<code>invalidate()</code> only paints again at the old size. <code>requestLayout()</code> runs the measure pass, so <code>onMeasure</code> reports the new size, and the view is drawn at that size.' },
        ],
        quiz: [
          { q: 'In which order do the passes run?', options: ['Measure, layout, draw', 'Draw, measure, layout', 'Layout, measure, draw'], a: 0, why: 'Sizes come first, positions use those sizes, and drawing uses the final size and position.' },
          { q: 'A custom view changes only its color. Which call fits?', options: ['<code>invalidate()</code>', '<code>requestLayout()</code>', 'Neither: nothing is needed'], a: 0, why: 'The size and position stay the same, so a redraw is enough. Without any call, the old color stays on screen.' },
          { q: 'You set <code>binding.title.text</code> on a built-in <code>TextView</code>. Do you call <code>requestLayout()</code> yourself?', options: ['No: TextView asks for the passes it needs', 'Yes, every time', 'Only when the text gets longer'], a: 0, why: 'Built-in views ask for their own passes when their properties change. You only do it in your own custom views.' },
        ],
        docs: [['How Android draws views', 'https://developer.android.com/guide/topics/ui/how-android-draws'], ['Create a view class', 'https://developer.android.com/develop/ui/views/layout/custom-views/create-view']],
      },

      {
        id: 'recycler',
        title: 'RecyclerView',
        tagline: 'A long list built from a handful of reused rows.',
        goals: ['Explain why a list reuses its row views', 'Write an adapter with <code>onCreateViewHolder</code> and <code>onBindViewHolder</code>', 'Avoid rows that show the wrong data after scrolling'],
        level: 'intermediate',
        introduces: ['RecyclerView', 'Adapter', 'ViewHolder', 'onCreateViewHolder', 'onBindViewHolder', 'getItemCount', 'LayoutInflater', 'LinearLayoutManager', 'layoutManager', 'adapter', 'isVisible', 'ViewGroup'],
        body: `
<p>A contacts app has 1,000 people, and five fit on the screen. Making 1,000 row views would be slow and waste memory. In Compose, <code>LazyColumn</code> only composes the rows you can see. In Views, the answer is <code>RecyclerView</code>: it makes enough rows to fill the screen, plus a few spare. When a row scrolls off, its view is kept and <em>recycled</em>: filled with the next person and shown again.</p>
<p>You give RecyclerView an <em>adapter</em>, a class that connects your list to rows. RecyclerView calls three of its functions. <code>onCreateViewHolder</code> makes a new, empty row. <code>onBindViewHolder</code> fills a row with the item at a position. <code>getItemCount</code> says how many items there are. Each row lives in a <em>ViewHolder</em>, a small object that keeps the row’s view, here through its binding. A <code>LinearLayoutManager</code> places the rows one under another.</p>
<p>Because rows are reused, <code>onBindViewHolder</code> must set every part of the row, every time. If it shows a star for starred people but never hides it, a reused row keeps the star of whoever had it before.</p>`,
        visual(el) {
          const row = (name, holder, star) => `<div class="ui-m-row"><div class="ui-m-av"></div><div>${name}${star ? ' ★' : ''}</div><span class="ui-m-muted">holder #${holder}</span></div>`;
          const list = rows => `<div class="ui-m-bar">Contacts</div><div class="ui-m-body">${rows.map(r => row(...r)).join('')}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'Adapter calls',
            predict: {
              q: 'The list has 1,000 contacts and the screen fits five rows. You scroll to the very end. About how many times did <code>onCreateViewHolder</code> run?',
              options: ['About 1,000 times', 'About as many rows as fit on screen, plus a few', 'Once'],
              a: 1,
              why: 'After the first screenful and a few spares, every new row reuses an old holder. Only <code>onBindViewHolder</code> runs for it.',
            },
            frames: [
              { screen: list([['Ada', 1, true], ['Ben', 2], ['Cai', 3], ['Dee', 4], ['Eli', 5]]), log: ['onCreateViewHolder ×5: holders #1 to #5', 'onBindViewHolder ×5: positions 0 to 4'], say: 'Five rows fill the screen, so five holders are made and filled. Ada is starred.' },
              { screen: list([['Ben', 2], ['Cai', 3], ['Dee', 4], ['Eli', 5], ['Fay', 6]]), log: ['onCreateViewHolder: holder #6', 'onBindViewHolder(#6, position 5)'], say: 'Ada scrolls off. Her row waits a moment, in case you scroll back, so Fay gets a new holder: one of the spares.' },
              { screen: list([['Cai', 3], ['Dee', 4], ['Eli', 5], ['Fay', 6], ['Gus', 7]]), log: ['onCreateViewHolder: holder #7', 'onBindViewHolder(#7, position 6)'], say: 'Ben scrolls off and waits too. Gus gets one more new holder.' },
              { screen: list([['Dee', 4], ['Eli', 5], ['Fay', 6], ['Gus', 7], ['Hal', 1]]), log: 'onBindViewHolder(#1, position 7)  // reused, no onCreateViewHolder', say: 'Now Ada’s old holder is free for reuse. Hal gets holder #1: only <code>onBindViewHolder</code> runs, and puts Hal’s name into the row.' },
              { screen: list([['Dee', 4], ['Eli', 5], ['Fay', 6], ['Gus', 7], ['Hal', 1, true]]), log: 'if (contact.starred) { holder.binding.star.isVisible = true }', say: 'With this bind code, the star is shown for starred people but never hidden. Hal isn’t starred, yet he shows Ada’s old star.' },
              { screen: list([['Dee', 4], ['Eli', 5], ['Fay', 6], ['Gus', 7], ['Hal', 1]]), log: 'holder.binding.star.isVisible = contact.starred', say: 'Set the star both ways, every time. Now every reused row shows exactly its own contact. 1,000 contacts, seven holders.' },
            ],
          });
        },
        code: `data class Contact(val name: String, val starred: Boolean)

// ItemContactBinding comes from res/layout/item_contact.xml: a TextView "name" and a star image "star"
class ContactHolder(val binding: ItemContactBinding) : RecyclerView.ViewHolder(binding.root)

// <ContactHolder>: the holder class this adapter uses, the way List<String> says what a list holds
class ContactAdapter(private val contacts: List<Contact>) : RecyclerView.Adapter<ContactHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ContactHolder {
        val inflater = LayoutInflater.from(parent.context)
        // false: build the row, but don't add it to the list; RecyclerView adds rows itself
        return ContactHolder(ItemContactBinding.inflate(inflater, parent, false))
    }

    override fun onBindViewHolder(holder: ContactHolder, position: Int) {
        val contact = contacts[position]
        holder.binding.name.text = contact.name
        // isVisible: true shows the view, false hides it, so one line handles both, every time
        holder.binding.star.isVisible = contact.starred
    }

    override fun getItemCount() = contacts.size
}

// In the Activity, after setContentView(binding.root):
binding.list.layoutManager = LinearLayoutManager(this)
binding.list.adapter = ContactAdapter(contacts)`,
        remember: 'RecyclerView makes a screenful of rows and refills them. onBindViewHolder sets every part of the row, every time.',
        terms: [
          { term: 'RecyclerView', def: 'A view that shows a long list by making only a screenful of rows and reusing them as you scroll.' },
          { term: 'adapter', def: 'The class that connects your data to RecyclerView: it makes rows (<code>onCreateViewHolder</code>), fills them (<code>onBindViewHolder</code>) and counts items (<code>getItemCount</code>).' },
          { term: 'ViewHolder', def: 'An object that holds one row view so it can be filled again and again.' },
          { term: 'layout manager', def: 'The part that places the rows, like <code>LinearLayoutManager</code> for one row under another.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill a row with its contact, and report how many contacts there are.', code: `override fun [[onBindViewHolder]](holder: ContactHolder, position: Int) {
    holder.binding.name.text = contacts[position].name
}

override fun getItemCount() = contacts.[[size]]`, why: '<code>onBindViewHolder</code> fills a row for one position. <code>getItemCount</code> tells RecyclerView how many positions exist.' },
          { type: 'bug', prompt: 'The list has 1,000 contacts, but you can never scroll past the fifth one. Tap the line.', code: `class ContactAdapter(private val contacts: List<Contact>) : RecyclerView.Adapter<ContactHolder>() {
    override fun onBindViewHolder(holder: ContactHolder, position: Int) {
        holder.binding.name.text = contacts[position].name
    }
    override fun getItemCount() = 5
}`, bug: 4, fix: '    override fun getItemCount() = contacts.size', why: 'RecyclerView only shows as many items as <code>getItemCount</code> reports. The number of rows on screen is RecyclerView’s job, not yours.' },
        ],
        quiz: [
          { q: 'Which part decides that rows go one under another?', options: ['The layout manager', 'The adapter', 'The ViewHolder'], a: 0, why: '<code>LinearLayoutManager</code> places the rows. The adapter only makes and fills them.' },
          { q: 'When a reused row is shown for a new contact, which function runs for it?', options: ['Only <code>onBindViewHolder</code>', '<code>onCreateViewHolder</code>, then <code>onBindViewHolder</code>', 'Only <code>onCreateViewHolder</code>'], a: 0, why: 'The row already exists, so it only needs to be filled with the new contact.' },
          { q: 'The bind code is <code>if (contact.starred) { holder.binding.star.isVisible = true }</code>. What goes wrong after scrolling?', options: ['Stars show up on contacts who are not starred', 'Starred contacts lose their star', 'Nothing'], a: 0, why: 'A reused row keeps the star from its last contact, because nothing ever hides it. Write <code>star.isVisible = contact.starred</code>.' },
        ],
        docs: [['Create dynamic lists with RecyclerView', 'https://developer.android.com/develop/ui/views/layout/recyclerview']],
      },

      {
        id: 'view-types',
        title: 'Many item types',
        tagline: 'Headers and rows in one list, each with its own layout.',
        goals: ['Give each kind of row its own view type', 'Create and fill the right holder for each kind', 'Explain why holders of different kinds are never mixed'],
        level: 'intermediate',
        introduces: ['getItemViewType', 'viewType'],
        body: `
<p>The contacts list gets letter headers: “A” above Ada and Ali, “B” above Ben. A header looks nothing like a contact row, so it needs its own layout file and its own holder class. Each kind of row is a <em>view type</em>: an <code>Int</code> you pick, such as 0 for a header and 1 for a person.</p>
<p>Override <code>getItemViewType(position)</code> to say which kind sits at each position. RecyclerView passes that number to <code>onCreateViewHolder</code> as <code>viewType</code>, so you inflate the matching layout and return a <code>HeaderHolder</code> or a <code>PersonHolder</code>. The adapter now works with both, so it is a <code>RecyclerView.Adapter&lt;RecyclerView.ViewHolder&gt;</code>: any kind of holder.</p>
<p>Spare rows are kept separately for each view type, so a header holder is only ever reused for another header. In <code>onBindViewHolder</code>, <code>is</code> checks which holder and which row you got. Inside <code>if (holder is HeaderHolder &amp;&amp; row is Header) { }</code>, Kotlin knows both types, the same smart cast you met in <code>when</code>. A sealed interface for the rows keeps the kinds tidy, and the <code>when</code> in <code>getItemViewType</code> needs no <code>else</code>.</p>`,
        visual(el) {
          const head = (l, holder) => `<div class="ui-m-row"><div><b>${l}</b></div><span class="ui-m-muted">header #${holder}</span></div>`;
          const person = (n, holder) => `<div class="ui-m-row"><div class="ui-m-av"></div><div>${n}</div><span class="ui-m-muted">person #${holder}</span></div>`;
          const list = rows => `<div class="ui-m-bar">Contacts</div><div class="ui-m-body">${rows.join('')}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'Adapter calls',
            predict: {
              q: 'A person row scrolls in. The spare holders are one header holder and no person holders. What happens?',
              options: ['A new person holder is made', 'The header holder is filled as a person', 'The row waits for a person holder'],
              a: 0,
              why: 'Spare holders are kept per view type. A header holder never fits a person row, so <code>onCreateViewHolder</code> runs with <code>viewType</code> 1.',
            },
            frames: [
              { screen: list([head('A', 1), person('Ada', 1), person('Ali', 2), head('B', 2), person('Ben', 3)]), log: ['getItemViewType: 0, 1, 1, 0, 1', 'onCreateViewHolder(viewType 0) ×2', 'onCreateViewHolder(viewType 1) ×3'], say: 'For each position, RecyclerView first asks the view type, then makes a holder of that kind.' },
              { screen: list([person('Bo', 4), person('Bea', 5), head('C', 3), person('Cai', 6), person('Cy', 7)]), log: ['spare holders: header 1, person 1'], say: 'After some scrolling, a few holders are free for reuse. They are kept in two groups, one per view type.' },
              { screen: list([person('Bea', 5), head('C', 3), person('Cai', 6), person('Cy', 7), head('D', 1)]), log: ['getItemViewType(position 10) = 0', 'onBindViewHolder(header #1, position 10)  // reused'], say: 'Header “D” scrolls in. A header holder is free, so it is reused and filled with “D”.' },
              { screen: list([head('C', 3), person('Cai', 6), person('Cy', 7), head('D', 1), person('Dee', 1)]), log: ['getItemViewType(position 11) = 1', 'onBindViewHolder(person #1, position 11)  // reused'], say: 'Dee is a person, so she gets the free person holder. Each kind only reuses its own.' },
              { screen: list([person('Cai', 6), person('Cy', 7), head('D', 1), person('Dee', 1), person('Dan', 8)]), log: ['getItemViewType(position 12) = 1', 'no free person holder: onCreateViewHolder(viewType 1)'], say: 'Dan is a person, and no person holder is free. A new one is made, even if a header holder were free.' },
              { log: 'if (holder is PersonHolder && row is Person) { holder.binding.name.text = row.name }', say: 'In <code>onBindViewHolder</code>, the <code>is</code> checks pick the right branch, and inside it <code>holder.binding.name</code> works.' },
            ],
          });
        },
        code: `sealed interface Row
class Header(val letter: String) : Row
class Person(val name: String) : Row

class HeaderHolder(val binding: ItemHeaderBinding) : RecyclerView.ViewHolder(binding.root)
class PersonHolder(val binding: ItemPersonBinding) : RecyclerView.ViewHolder(binding.root)

class ContactsAdapter(private val rows: List<Row>) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    override fun getItemViewType(position: Int): Int = when (rows[position]) {
        is Header -> 0
        is Person -> 1
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return if (viewType == 0) {
            HeaderHolder(ItemHeaderBinding.inflate(inflater, parent, false))
        } else {
            PersonHolder(ItemPersonBinding.inflate(inflater, parent, false))
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val row = rows[position]
        if (holder is HeaderHolder && row is Header) {
            holder.binding.letter.text = row.letter
        }
        if (holder is PersonHolder && row is Person) {
            holder.binding.name.text = row.name
        }
    }

    override fun getItemCount() = rows.size
}

// rows = listOf(Header("A"), Person("Ada"), Person("Ali"), Header("B"), Person("Ben"))`,
        remember: 'One kind of row, one view type. getItemViewType names it, onCreateViewHolder builds it, and holders are only reused within their kind.',
        terms: [
          { term: 'view type', def: 'An <code>Int</code> that names one kind of row, like 0 for a header and 1 for a person. Each kind has its own layout and its own spare holders.' },
          { term: 'getItemViewType', def: 'The adapter function that returns the view type for a position. If you don’t override it, every position gets 0.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Say which kind each row is, then build a holder of that kind.', code: `override fun [[getItemViewType]](position: Int): Int = when (rows[position]) {
    is Header -> 0
    is Person -> 1
}

override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
    val inflater = LayoutInflater.from(parent.context)
    return if ([[viewType]] == 0) {
        HeaderHolder(ItemHeaderBinding.inflate(inflater, parent, false))
    } else {
        PersonHolder(ItemPersonBinding.inflate(inflater, parent, false))
    }
}`, why: 'RecyclerView asks the view type of a position, then passes that same number to <code>onCreateViewHolder</code> when it needs a new holder.' },
          { type: 'bug', prompt: 'Scrolling is slow, nothing is ever reused, and only the first header shows its letter. Tap the line.', code: `override fun getItemViewType(position: Int): Int = position

override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
    val inflater = LayoutInflater.from(parent.context)
    return if (viewType == 0) {
        HeaderHolder(ItemHeaderBinding.inflate(inflater, parent, false))
    } else {
        PersonHolder(ItemPersonBinding.inflate(inflater, parent, false))
    }
}`, bug: 0, fix: 'override fun getItemViewType(position: Int): Int = if (rows[position] is Header) 0 else 1', why: 'Returning the position makes every row its own kind, with its own empty group of spares, so nothing can be reused. Only position 0 gets <code>viewType == 0</code>, so header “B” gets a PersonHolder, and the bind code leaves it blank. Return one number per kind of layout.' },
        ],
        quiz: [
          { q: 'What does <code>getItemViewType</code> return if you don’t override it?', options: ['0 for every position', 'The position', 'A different number for each layout'], a: 0, why: 'By default the adapter assumes one kind of row. Override it once rows look different.' },
          { q: 'Only a header holder is free, and a person row scrolls in. What does RecyclerView do?', options: ['Makes a new person holder', 'Fills the header holder as a person', 'Shows an empty row'], a: 0, why: 'Holders are reused only within their view type, so the bind code never gets a holder of the wrong kind.' },
          { q: 'Inside <code>if (holder is HeaderHolder) { }</code>, why does <code>holder.binding.letter</code> work?', options: ['After the <code>is</code> check, Kotlin knows <code>holder</code> is a HeaderHolder', 'Every holder has a <code>letter</code>', 'It doesn’t compile'], a: 0, why: 'It is a smart cast: inside that branch, Kotlin treats <code>holder</code> as a HeaderHolder.' },
        ],
        docs: [['RecyclerView.Adapter', 'https://developer.android.com/reference/androidx/recyclerview/widget/RecyclerView.Adapter']],
      },

      {
        id: 'diff',
        title: 'Efficient updates',
        tagline: 'Hand over a new list, and only the rows that changed are redrawn.',
        goals: ['Tell a <code>ListAdapter</code> how to compare items with <code>DiffUtil</code>', 'Update a list with <code>submitList</code>', 'Tell “the same item” from “the same contents”'],
        level: 'intermediate',
        introduces: ['ListAdapter', 'DiffUtil', 'ItemCallback', 'areItemsTheSame', 'areContentsTheSame', 'submitList', 'getItem', 'notifyDataSetChanged'],
        body: `
<p>Ben gets a star, so one row should change. Old code often stores the new list in the adapter and calls <code>notifyDataSetChanged()</code>, which tells RecyclerView “anything may have changed”. Every row on screen is filled again, and there is no animation. In Compose, only the rows whose data changed run again, and a key says which item is which. <code>DiffUtil</code> gives Views both: <code>areItemsTheSame</code> works like a key, and <code>areContentsTheSame</code> says whether the row needs filling again.</p>
<p>Extend <code>ListAdapter</code> instead of <code>RecyclerView.Adapter</code>, and give it a <code>DiffUtil.ItemCallback</code> with two answers. <code>areItemsTheSame</code>: are these the same person? Compare ids. <code>areContentsTheSame</code>: does that person look the same? Compare with <code>==</code>, which a data class does field by field. Then call <code>submitList(newList)</code>. ListAdapter compares the old and new lists in the background, so the screen doesn’t freeze, and then updates only what changed: rows inserted, removed, moved or changed.</p>
<p>ListAdapter keeps the list for you, so there is no <code>getItemCount</code> to write, and <code>onBindViewHolder</code> reads an item with <code>getItem(position)</code>. Always pass a new list. If you hand over the very same list object again, ListAdapter sees nothing new and does nothing.</p>`,
        visual(el) {
          const row = (name, opts = {}) => `<div class="ui-m-row"${opts.hl ? ' style="background:var(--accent-soft)"' : ''}${opts.out ? ' style="opacity:0.35"' : ''}><div class="ui-m-av"></div><div>${name}${opts.star ? ' ★' : ''}</div>${opts.note ? `<span class="ui-m-muted">${opts.note}</span>` : ''}</div>`;
          const list = rows => `<div class="ui-m-bar">Contacts</div><div class="ui-m-body">${rows.join('')}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'What ListAdapter does',
            predict: {
              q: 'Suppose <code>areItemsTheSame</code> compares whole objects with <code>==</code>. You submit a list where only Ben gained a star. How does his row update?',
              options: ['It changes in place', 'It is removed and a new row is inserted', 'Nothing happens'],
              a: 1,
              why: 'The starred Ben is not <code>==</code> the old Ben, so DiffUtil decides the old item left and a different one arrived. Comparing ids makes it a change instead.',
            },
            frames: [
              { screen: list([row('Ada'), row('Ben'), row('Cai')]), log: 'submitList(listOf(ada, ben, cai))', say: 'The first list. All three rows are filled.' },
              { log: 'submitList(listOf(ada, ben.copy(starred = true), cai))', say: 'A new list where Ben is starred. ListAdapter compares it with the old one, item by item, in the background.' },
              { screen: list([row('Ada'), row('Ben', { star: true, hl: true, note: 'changed' }), row('Cai')]), log: ['areItemsTheSame: id 2 == id 2, true', 'areContentsTheSame: starred differs, false', 'result: change at position 1'], say: 'Same id, so it is the same person. Different contents, so only Ben’s row is filled again.' },
              { screen: list([row('Ada'), row('Ben', { star: true }), row('Cai'), row('Dee', { hl: true, note: 'inserted' })]), log: ['submitList(listOf(ada, starredBen, cai, dee))', 'result: insert at position 3'], say: 'Add Dee. Only her row is created and slides in. Ada, Ben and Cai are untouched.' },
              { screen: list([row('Ada'), row('Ben', { out: true, note: 'removed' }), row('Ben', { star: true, hl: true, note: 'inserted' }), row('Cai')]), log: ['// areItemsTheSame = oldItem == newItem', 'result: remove at 1, insert at 1'], say: 'With the wrong <code>areItemsTheSame</code>, the starred Ben looks like a new person: the row fades out and a new one fades in.' },
              { screen: list([row('Ada', { hl: true }), row('Ben', { star: true, hl: true }), row('Cai', { hl: true })]), log: 'notifyDataSetChanged()  // every row filled again, no animation', say: 'The old way gives RecyclerView no details at all. Every row is filled again, and nothing animates.' },
            ],
          });
        },
        code: `data class Contact(val id: Int, val name: String, val starred: Boolean)

object ContactDiff : DiffUtil.ItemCallback<Contact>() {
    override fun areItemsTheSame(oldItem: Contact, newItem: Contact) = oldItem.id == newItem.id
    override fun areContentsTheSame(oldItem: Contact, newItem: Contact) = oldItem == newItem
}

class ContactAdapter : ListAdapter<Contact, ContactHolder>(ContactDiff) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ContactHolder {
        val inflater = LayoutInflater.from(parent.context)
        return ContactHolder(ItemContactBinding.inflate(inflater, parent, false))
    }

    override fun onBindViewHolder(holder: ContactHolder, position: Int) {
        val contact = getItem(position)
        holder.binding.name.text = contact.name
        holder.binding.star.isVisible = contact.starred
    }
}

val ada = Contact(1, "Ada", false)
val ben = Contact(2, "Ben", false)
val cai = Contact(3, "Cai", false)

val adapter = ContactAdapter()
binding.list.adapter = adapter
adapter.submitList(listOf(ada, ben, cai))
adapter.submitList(listOf(ada, ben.copy(starred = true), cai))   // only Ben's row changes`,
        remember: 'Same id: same item. Same fields: same contents. Give submitList a new list every time.',
        terms: [
          { term: 'ListAdapter', def: 'An adapter that keeps the list itself and, when you call <code>submitList</code>, updates only the rows that changed.' },
          { term: 'DiffUtil', def: 'The tool that compares an old and a new list and works out the inserts, removals, moves and changes. You answer its questions in a <code>DiffUtil.ItemCallback</code>.' },
          { term: 'submitList', def: '<code>submitList(newList)</code> hands a ListAdapter its next list to compare and show.' },
          { term: 'notifyDataSetChanged', def: 'The old, blunt update: “everything may have changed”. Every visible row is filled again, with no animation.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Match people by id, and compare their contents with data class equality.', code: `object ContactDiff : DiffUtil.ItemCallback<Contact>() {
    override fun areItemsTheSame(oldItem: Contact, newItem: Contact) = oldItem.[[id]] == newItem.id
    override fun areContentsTheSame(oldItem: Contact, newItem: Contact) = oldItem [[==]] newItem
}`, why: 'The id says who it is. Data class <code>==</code> compares every field, so any visible change fills that row again.' },
          { type: 'bug', prompt: 'Starring a contact makes the row vanish and a new one appear, instead of updating in place. Tap the line.', code: `object ContactDiff : DiffUtil.ItemCallback<Contact>() {
    override fun areItemsTheSame(oldItem: Contact, newItem: Contact) = oldItem == newItem
    override fun areContentsTheSame(oldItem: Contact, newItem: Contact) = oldItem == newItem
}`, bug: 1, fix: '    override fun areItemsTheSame(oldItem: Contact, newItem: Contact) = oldItem.id == newItem.id', why: 'Comparing whole objects means any change makes a “different item”: a removal plus an insertion. Comparing ids keeps it the same item, so it becomes a change.' },
        ],
        quiz: [
          { q: 'A contact changes name but keeps its id. What does DiffUtil report?', options: ['A change at that position', 'A removal and an insertion', 'Nothing'], a: 0, why: 'Same id, so the same item. Different contents, so that one row is filled again.' },
          { q: 'Why avoid <code>notifyDataSetChanged()</code> when only one contact changed?', options: ['It fills every row again and plays no animation', 'It crashes on long lists', 'It deletes the list'], a: 0, why: 'RecyclerView can’t tell what changed, so it treats everything as changed.' },
          { q: 'You add Dee to the same <code>mutableListOf</code> you submitted before, then call <code>submitList</code> with that same list. What happens?', options: ['Nothing: it is the same list object', 'Dee’s row slides in', 'The whole list is filled again'], a: 0, why: 'ListAdapter sees the very same list it already has, so it has nothing to compare. Submit a new list instead.' },
        ],
        docs: [['ListAdapter', 'https://developer.android.com/reference/androidx/recyclerview/widget/ListAdapter']],
      },

      {
        id: 'fragments',
        title: 'Fragments',
        tagline: 'A piece of a screen whose view can come and go while it stays.',
        goals: ['Say what a Fragment is and where you meet one', 'Tell the Fragment’s lifecycle from its view’s lifecycle', 'Clear a binding in <code>onDestroyView</code>'],
        level: 'intermediate',
        introduces: ['Fragment', 'onCreateView', 'onViewCreated', 'onDestroyView', 'bind', 'parentFragmentManager', 'commit', 'replace', 'addToBackStack', 'AppCompatActivity', 'FragmentActivity'],
        body: `
<p>Many older apps have one Activity and swap screens inside it: the inbox, then a message, then back to the inbox. Each of those screens is a <code>Fragment</code>: a class with its own layout and lifecycle, shown inside part of an Activity, a bit like one screen (route) in Navigation Compose. The Activity usually extends <code>AppCompatActivity</code>, a kind of <code>FragmentActivity</code>, which is a kind of <code>ComponentActivity</code> with Fragment support.</p>
<p>A Fragment has the callbacks you know from Activities, such as <code>onCreate</code>, <code>onStart</code> and <code>onResume</code>, plus a second, shorter lifecycle for its view. <code>onCreateView</code> builds the view (if you pass a layout to <code>Fragment(R.layout.fragment_inbox)</code>, it does this for you). <code>onViewCreated</code> is where you set the view up, and <code>onDestroyView</code> is where it goes away. <code>FragmentInboxBinding.bind(view)</code> makes a binding for a view that already exists.</p>
<p><code>parentFragmentManager</code> is the object that holds and swaps the Fragments in this Activity; the changes inside <code>commit { }</code> happen together as one step. <code>replace&lt;MessageFragment&gt;(R.id.container)</code> shows a new Fragment (its class goes in the angle brackets) in <code>R.id.container</code>, the area of the Activity’s layout where Fragments are shown. <code>addToBackStack</code> records the change so Back can undo it.</p>
<p>The Fragment can outlive its view. Show a message this way and the inbox’s view is destroyed, but the inbox Fragment stays, waiting on the back stack. Press Back and the same Fragment builds a brand-new view. So set the binding to <code>null</code> in <code>onDestroyView</code>; otherwise the waiting Fragment keeps the old view alive in memory for nothing.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['Inbox Fragment', 'Inbox view', 'Message Fragment'],
            span: 10,
            unit: 'steps',
            predict: {
              q: 'The inbox was replaced by a message, with <code>addToBackStack</code>. You press Back. What builds the inbox screen again?',
              options: ['A new Inbox Fragment, from <code>onCreate</code>', 'The same Inbox Fragment runs <code>onCreateView</code> and <code>onViewCreated</code> again', 'Nothing: the old view is shown again'],
              a: 1,
              why: 'Only the inbox’s view was destroyed. The Fragment object waited on the back stack, and now builds a new view.',
            },
            frames: [
              { now: 0, say: 'Two lifecycles: the Fragment object (top lane) and its view (second lane). Watch them split apart.' },
              { bars: [{ lane: 0, from: 0, to: 3, label: 'on screen' }, { lane: 1, from: 0, to: 3, label: 'view 1' }], say: 'The inbox starts: <code>onCreate</code>, then <code>onCreateView</code> and <code>onViewCreated</code> build view 1, then <code>onStart</code> and <code>onResume</code>.' },
              { bars: [{ lane: 2, from: 3, to: 6, label: 'on screen', tone: 'warm' }, { lane: 0, from: 3, to: 6, label: 'waiting', tone: 'muted' }], marks: [{ at: 3, label: 'onDestroyView', tone: 'err' }], say: 'Tap a message: <code>replace</code> with <code>addToBackStack</code>. The inbox gets <code>onPause</code>, <code>onStop</code> and <code>onDestroyView</code>: view 1 is gone. No <code>onDestroy</code>: the Fragment waits.' },
              { bars: [{ lane: 0, from: 6, to: 10, label: 'on screen' }, { lane: 1, from: 6, to: 10, label: 'view 2', tone: 'ok' }], marks: [{ at: 6, label: 'Back', tone: 'warm' }], say: 'Press Back. The message Fragment is destroyed. The same inbox object runs <code>onCreateView</code> and <code>onViewCreated</code> and builds view 2.' },
              { marks: [{ at: 3, label: 'binding = null', tone: 'ok' }], say: 'Between 3 and 6 on the timeline the inbox had no view. Setting <code>_binding = null</code> in <code>onDestroyView</code> lets view 1 be freed instead of being kept by a Fragment that can’t show it.' },
            ],
          });
        },
        code: `class InboxFragment : Fragment(R.layout.fragment_inbox) {
    private var _binding: FragmentInboxBinding? = null
    private val binding get() = _binding!!     // use only while the view exists

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        _binding = FragmentInboxBinding.bind(view)   // view was built from fragment_inbox.xml
        binding.title.text = "Inbox"
        binding.open.setOnClickListener {
            parentFragmentManager.commit {
                replace<MessageFragment>(R.id.container)   // show a MessageFragment in the container
                addToBackStack(null)                       // Back brings the inbox back
                                                           // null: this back stack entry needs no name
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null                              // the view is gone; the Fragment is not
    }
}`,
        remember: 'A Fragment can outlive its view. Build the binding in onViewCreated and set it to null in onDestroyView.',
        terms: [
          { term: 'Fragment', def: 'A piece of UI with its own layout and lifecycle, shown inside an Activity. Older apps often build each screen as one.' },
          { term: 'view lifecycle', def: 'The shorter life of a Fragment’s view, from <code>onCreateView</code> to <code>onDestroyView</code>. It can end and start again while the Fragment stays.' },
          { term: 'onDestroyView', def: 'The callback where a Fragment’s view is torn down, for example when it goes onto the back stack. Clear view references here.' },
          { term: 'addToBackStack', def: 'Records a Fragment change so that pressing Back undoes it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show the message so Back returns to the inbox, and let go of the old view when it is destroyed.', code: `parentFragmentManager.commit {
    replace<MessageFragment>(R.id.container)
    [[addToBackStack]](null)
}

override fun [[onDestroyView]]() {
    super.onDestroyView()
    _binding = null
}`, why: '<code>addToBackStack</code> lets Back undo the change. <code>onDestroyView</code> runs when the view goes away, even though the Fragment stays.' },
          { type: 'bug', prompt: 'The app crashes with a <code>NullPointerException</code> as soon as the Fragment is created. Tap the line.', code: `class InboxFragment : Fragment(R.layout.fragment_inbox) {
    private var _binding: FragmentInboxBinding? = null
    private val binding = _binding!!

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        _binding = FragmentInboxBinding.bind(view)
    }
}`, bug: 2, fix: '    private val binding get() = _binding!!', why: 'A plain property is set once, when the object is made, and <code>_binding</code> is still <code>null</code> then. A getter reads <code>_binding</code> each time, after the view exists.' },
        ],
        quiz: [
          { q: 'The inbox is replaced by a message, with <code>addToBackStack</code>. What happens to the inbox?', options: ['Its view is destroyed; the Fragment stays', 'The Fragment is destroyed completely', 'Nothing: it stays resumed under the message'], a: 0, why: 'It gets <code>onDestroyView</code> but not <code>onDestroy</code>. Back gives it a new view.' },
          { q: 'Which callback runs again on the same Fragment when you press Back to it?', options: ['<code>onViewCreated</code>', '<code>onCreate</code>', '<code>onDestroy</code>'], a: 0, why: 'The Fragment object was kept, so only its view lifecycle starts again: <code>onCreateView</code>, then <code>onViewCreated</code>.' },
          { q: 'Why set <code>_binding = null</code> in <code>onDestroyView</code>?', options: ['So a waiting Fragment doesn’t keep its old view in memory', 'Because the app won’t compile otherwise', 'To make Back faster'], a: 0, why: 'The binding points at every view in the old layout. While the Fragment waits on the back stack, those views are useless.' },
        ],
        docs: [['The fragment lifecycle', 'https://developer.android.com/guide/fragments/lifecycle'], ['Fragment transactions', 'https://developer.android.com/guide/fragments/transactions']],
      },

      {
        id: 'viewpager',
        title: 'Paging screens',
        tagline: 'Swipe between pages, and know which one is really on screen.',
        goals: ['Show swipeable Fragment pages with <code>ViewPager2</code>', 'Write a <code>FragmentStateAdapter</code>', 'React when a page is the one on screen'],
        level: 'intermediate',
        introduces: ['ViewPager2', 'FragmentStateAdapter', 'createFragment', 'offscreenPageLimit'],
        body: `
<p>A news app has three pages, News, Sports and Weather, and you swipe sideways between them. In Views this is a <code>ViewPager2</code>. It is built on RecyclerView, so it takes an adapter too. For Fragment pages, that is a <code>FragmentStateAdapter</code> with two functions: <code>getItemCount</code> (how many pages) and <code>createFragment(position)</code> (a new Fragment for that page). Its constructor takes the Activity; an <code>AppCompatActivity</code> is a kind of <code>FragmentActivity</code>, so <code>this</code> works.</p>
<p>To make swipes feel instant, a pager builds pages before you see them. With <code>offscreenPageLimit = 1</code> it keeps one page ready on each side of the current one. Those neighbour pages get <code>onCreateView</code>, <code>onViewCreated</code> and <code>onStart</code>, then stop. Only the page on screen reaches <code>onResume</code>, and it gets <code>onPause</code> when you swipe away.</p>
<p>So <code>onResume</code> means “this page is the one the user is looking at”. Count a page view or start a video there, not in <code>onViewCreated</code>, which also runs for a page nobody has seen yet.</p>`,
        visual(el) {
          const page = (name, n) => `<div class="ui-m-bar">${name}</div><div class="ui-m-body"><div class="ui-m-img"></div><div class="ui-m-line"></div><div class="ui-m-line short"></div><div class="ui-m-nav"><span${n === 0 ? ' class="on"' : ''}>News</span><span${n === 1 ? ' class="on"' : ''}>Sports</span><span${n === 2 ? ' class="on"' : ''}>Weather</span></div></div>`;
          Lab.ui.phone(el, {
            logTitle: 'Lifecycle',
            predict: {
              q: '<code>offscreenPageLimit = 1</code>, and the pager opens on News. Which pages get <code>onResume</code>?',
              options: ['Only News', 'News and Sports', 'All three'],
              a: 0,
              why: 'Sports is built ahead of time, but it stops at <code>onStart</code>. Only the page on screen is resumed.',
            },
            frames: [
              { screen: '<div class="ui-m-center ui-m-muted">the pager is about to open</div>', say: 'Three pages: News, Sports and Weather. One page is kept ready on each side of the current one.' },
              { screen: page('News', 0), log: ['News: onCreateView, onViewCreated, onStart, onResume', 'Sports: onCreateView, onViewCreated, onStart'], say: 'News is on screen and resumed. Sports is built next to it, ready for a swipe, but it stops at <code>onStart</code>.' },
              { screen: page('Sports', 1), log: ['News: onPause', 'Sports: onResume', 'Weather: onCreateView, onViewCreated, onStart'], say: 'Swipe to Sports. It was already built, so it appears at once, and now it is resumed. Weather is built as the new neighbour.' },
              { log: 'Sports: onResume  → Log.d("Pages", "Sports is on screen")', say: 'Code in <code>onResume</code> runs exactly when a page becomes the one on screen. <code>onViewCreated</code> ran for Sports while News was still showing.' },
              { screen: page('News', 0), log: ['Sports: onPause', 'News: onResume'], say: 'Swipe back. News was kept, so it is resumed again, and its <code>onResume</code> code runs a second time: it really was viewed twice.' },
            ],
          });
        },
        code: `class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.pager.adapter = PagesAdapter(this)   // binding.pager is a ViewPager2
        binding.pager.offscreenPageLimit = 1
    }
}

class PagesAdapter(activity: FragmentActivity) : FragmentStateAdapter(activity) {
    override fun getItemCount() = 3

    override fun createFragment(position: Int): Fragment = when (position) {
        0 -> NewsFragment()
        1 -> SportsFragment()
        else -> WeatherFragment()
    }
}

class SportsFragment : Fragment(R.layout.fragment_sports) {
    override fun onResume() {
        super.onResume()
        Log.d("Pages", "Sports is on screen")   // each time Sports becomes the current page
    }
}`,
        remember: 'ViewPager2 plus a FragmentStateAdapter (getItemCount, createFragment). Only the page on screen is resumed.',
        terms: [
          { term: 'ViewPager2', def: 'A view that shows pages the user swipes between. It is built on RecyclerView.' },
          { term: 'FragmentStateAdapter', def: 'The adapter for Fragment pages: <code>getItemCount</code> says how many, <code>createFragment</code> makes the Fragment for a page.' },
          { term: 'offscreenPageLimit', def: 'How many pages the pager keeps built on each side of the current page.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the page Fragment for each position, and connect the adapter to the pager.', code: `class PagesAdapter(activity: FragmentActivity) : FragmentStateAdapter(activity) {
    override fun getItemCount() = 2
    override fun [[createFragment]](position: Int): Fragment = when (position) {
        0 -> NewsFragment()
        else -> SportsFragment()
    }
}

binding.pager.[[adapter]] = PagesAdapter(this)`, why: '<code>createFragment</code> builds the page for a position. The pager shows nothing until it has an adapter.' },
          { type: 'bug', prompt: 'The adapter keeps its own <code>sports</code> object to change that page later. After you rotate the phone, changes made through <code>sports</code> never show on screen. Tap the line.', code: `class PagesAdapter(activity: FragmentActivity) : FragmentStateAdapter(activity) {
    val sports = SportsFragment()
    override fun getItemCount() = 3

    override fun createFragment(position: Int): Fragment = when (position) {
        0 -> NewsFragment()
        1 -> sports
        else -> WeatherFragment()
    }
}`, bug: 6, fix: '        1 -> SportsFragment()', why: 'After a rotation, the adapter brings back the page Fragments it saved, without asking <code>createFragment</code>. The new <code>sports</code> object is never put on screen, so changing it has no effect. <code>createFragment</code> must return a new Fragment each time it is asked.' },
        ],
        quiz: [
          { q: 'Sports is on screen, with News and Weather built on each side. Which page is resumed?', options: ['Only Sports', 'All three', 'None: pager pages stop at onStart'], a: 0, why: 'Neighbour pages stop at <code>onStart</code>. Only the current page gets <code>onResume</code>.' },
          { q: 'Where should a page count “this page was viewed”?', options: ['<code>onResume</code>', '<code>onViewCreated</code>', '<code>createFragment</code>'], a: 0, why: '<code>onViewCreated</code> also runs for neighbour pages nobody has seen. <code>onResume</code> runs when the page becomes the current one.' },
          { q: 'The pager opens on News with <code>offscreenPageLimit = 1</code>. Which callbacks has the Sports page had?', options: ['<code>onViewCreated</code> and <code>onStart</code>, not <code>onResume</code>', 'All of them, including <code>onResume</code>', 'None yet'], a: 0, why: 'Sports is built ahead so a swipe shows it at once, but it is not on screen, so it is not resumed.' },
        ],
        docs: [['Slide between fragments using ViewPager2', 'https://developer.android.com/develop/ui/views/animations/screen-slide-2']],
      },

      {
        id: 'compose-in-views',
        title: 'Mixing Compose and Views',
        tagline: 'Compose inside an old screen, and an old view inside Compose.',
        goals: ['Show composables inside a View screen with <code>ComposeView</code>', 'Show a View inside a composable with <code>AndroidView</code>', 'Know what <code>factory</code> and <code>update</code> each do'],
        level: 'intermediate',
        introduces: ['ComposeView', 'setViewCompositionStrategy', 'ViewCompositionStrategy', 'DisposeOnViewTreeLifecycleDestroyed', 'AndroidView', 'factory', 'update', 'requireContext'],
        body: `
<p>Big apps don’t rewrite every screen at once. They move to Compose piece by piece, so for a while both kinds of UI live side by side, often in the same screen. Two bridges make that work, one for each direction.</p>
<p><code>ComposeView</code> is a View that shows Compose. Put it in an XML layout, or create it in code, then call <code>setContent { }</code> on it, the same call you use in an Activity. A Fragment can return one from <code>onCreateView</code> and draw its whole screen in Compose; <code>requireContext()</code> gives the Fragment’s Context to create it with. In a Fragment, also call <code>setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)</code>: it ends the Compose content when the Fragment’s view is destroyed, in step with <code>onDestroyView</code>.</p>
<p><code>AndroidView</code> goes the other way: a composable that shows a View, for a view with no Compose version yet, like the <code>SwatchView</code> from the measure lesson. It takes two lambdas. <code>factory</code> creates the View, once. <code>update</code> runs right after that, and again whenever state or a parameter it reads changes, so it is where you copy state into the View. A value set only in <code>factory</code> is never updated. <code>SwatchView.color</code> is an <code>Int</code>, so <code>Color.BLUE</code> here is <code>android.graphics.Color.BLUE</code> from the measure lesson, not Compose’s <code>Color.Blue</code>.</p>`,
        visual(el) {
          const xmlScreen = `<div class="ui-m-bar">Product</div><div class="ui-m-body"><div class="ui-m-img"></div><b>Desk lamp</b><div class="ui-m-card"><span class="ui-m-muted">ComposeView</span><span>★★★★☆</span></div></div>`;
          const swatch = (c, label) => `<div class="ui-m-bar">Color</div><div class="ui-m-body"><div class="ui-m-card"><span class="ui-m-muted">AndroidView › SwatchView</span><div style="height:56px;border-radius:8px;background:${c}"></div></div><span class="ui-m-btn">${label}</span></div>`;
          Lab.ui.phone(el, {
            logTitle: 'Code',
            predict: {
              q: 'An <code>AndroidView</code> sets the swatch color only inside <code>factory</code>. Then the <code>blue</code> state becomes true. What does the swatch show?',
              options: ['Blue', 'Still red: factory ran once, and nothing copies the new state into the View', 'Nothing: the View is removed'],
              a: 1,
              why: '<code>factory</code> creates the View once. Only <code>update</code> runs again when the state it reads changes.',
            },
            frames: [
              { screen: xmlScreen, log: '<code>&lt;androidx.compose.ui.platform.ComposeView android:id="@+id/rating" ... /&gt;</code>', say: 'An old XML screen. One piece, the star rating, has moved to Compose. In the layout it is a <code>ComposeView</code> tag.' },
              { log: 'binding.rating.setContent { Text("★★★★☆") }', say: '<code>setContent</code> on the ComposeView fills it with composables. The rest of the screen stays Views.' },
              { screen: swatch('#d64545', 'Blue'), log: 'factory = { context -> SwatchView(context) }  // once', say: 'Now the other direction: a Compose screen that needs the old <code>SwatchView</code>. <code>factory</code> creates it once.' },
              { log: 'update = { swatch -> swatch.color = if (blue) Color.BLUE else Color.RED }', say: '<code>update</code> runs right after <code>factory</code>. It reads <code>blue</code> (false), so the swatch is red.' },
              { screen: swatch('#3b6fd6', 'Blue'), tap: '.ui-m-btn', log: ['blue = true', 'update runs again: swatch.color = Color.BLUE'], say: 'Tap Blue. The state changes, so <code>update</code> runs again and the View turns blue. <code>factory</code> does not run again: it is the same View.' },
              { screen: swatch('#d64545', 'Blue'), tap: '.ui-m-btn', log: ['factory = { context -> SwatchView(context).apply { color = Color.RED } }', 'blue = true  // nothing reads it'], say: 'If the color is only set in <code>factory</code>, nothing reads <code>blue</code>, and the tap changes nothing on screen.' },
            ],
          });
        },
        code: `// 1. Compose inside a Fragment, which is a View screen
class SettingsFragment : Fragment() {
    override fun onCreateView(           // Android passes these in; this Fragment doesn't need them
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View = ComposeView(requireContext()).apply {
        setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)
        setContent {
            MaterialTheme {
                Text("Settings")
            }
        }
    }
}

// 2. A View inside a composable
@Composable
fun ColorPicker() {
    var blue by remember { mutableStateOf(false) }
    Column {
        // SwatchView.color is an Int: this is android.graphics.Color.BLUE, not Compose's Color.Blue
        AndroidView(
            factory = { context -> SwatchView(context) },                                  // once
            update = { swatch -> swatch.color = if (blue) Color.BLUE else Color.RED },     // now, and when blue changes
        )
        Button(onClick = { blue = true }) { Text("Blue") }
    }
}`,
        remember: 'ComposeView: Compose inside a View. AndroidView: a View inside Compose, where factory runs once and update runs whenever what it reads changes.',
        terms: [
          { term: 'ComposeView', def: 'A View that shows composables. Fill it with <code>setContent { }</code>.' },
          { term: 'AndroidView', def: 'A composable that shows a View: <code>factory</code> creates it once, <code>update</code> copies state into it.' },
          { term: 'ViewCompositionStrategy', def: 'The rule for when a ComposeView ends its Compose content. In a Fragment, use <code>DisposeOnViewTreeLifecycleDestroyed</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill an XML ComposeView with Compose, then show a View inside Compose.', code: `binding.rating.[[setContent]] {
    Text("★★★★☆")
}

AndroidView(
    [[factory]] = { context -> SwatchView(context) },
    update = { swatch -> swatch.color = Color.BLUE },
)`, why: '<code>setContent</code> gives a ComposeView its composables. <code>factory</code> creates the View inside an AndroidView.' },
          { type: 'bug', prompt: '<code>Swatch(blue = true)</code> still shows red. Tap the line.', code: `@Composable
fun Swatch(blue: Boolean) {
    AndroidView(
        factory = { context -> SwatchView(context) },
        update = { swatch -> swatch.color = Color.RED },
    )
}`, bug: 4, fix: '        update = { swatch -> swatch.color = if (blue) Color.BLUE else Color.RED },', why: '<code>update</code> must copy the state into the View. Here it never reads <code>blue</code>, so it always sets red.' },
        ],
        quiz: [
          { q: 'What is <code>ComposeView</code>?', options: ['A View that shows composables', 'A composable that shows a View', 'A kind of Fragment'], a: 0, why: 'It is a View, so it fits anywhere a View fits: in XML, in code, or as a Fragment’s view.' },
          { q: 'In an <code>AndroidView</code>, state that <code>update</code> reads changes. What runs again?', options: ['Only <code>update</code>', '<code>factory</code>, then <code>update</code>', 'Nothing'], a: 0, why: 'The View already exists, so <code>factory</code> is not called again. <code>update</code> copies the new state into it.' },
          { q: 'A ComposeView is a Fragment’s whole view. Which strategy fits?', options: ['<code>DisposeOnViewTreeLifecycleDestroyed</code>', 'None: Compose content never ends', 'Call <code>setContent</code> again in <code>onDestroyView</code>'], a: 0, why: 'It ends the Compose content together with the Fragment’s view, in step with <code>onDestroyView</code>.' },
        ],
        docs: [['Using Compose in Views', 'https://developer.android.com/develop/ui/compose/migrate/interoperability-apis/compose-in-views'], ['Using Views in Compose', 'https://developer.android.com/develop/ui/compose/migrate/interoperability-apis/views-in-compose']],
      },
    ],
  });
})();
