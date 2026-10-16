/* Views and Compose interop track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed vw-. */
(() => {
  const { h, sleep, hl, replay, swap } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const stat = (label, value) => {
    const b = h('b', {}, String(value));
    const s = h('span', { class: 'vw-stat' }, label + ' ', b);
    s.set = v => { b.textContent = String(v); replay(b, 'pop'); };
    return s;
  };
  const toggle = (id, label, checked, onchange) => {
    const input = h('input', { type: 'checkbox', id, checked, onchange });
    return { input, el: h('label', { class: 'switch', for: id }, input, h('span', { html: label })) };
  };

  const css = `
.vw-split { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap: 14px; align-items: start; min-width: 0; }
.vw-col { display: grid; gap: 10px; align-content: start; min-width: 0; }
.vw-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.vw-stats { display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
.vw-stat { font: 600 0.78rem var(--mono); padding: 4px 10px; border-radius: 999px; background: var(--sunk); color: var(--ink); font-variant-numeric: tabular-nums; }
.vw-stat b { display: inline-block; color: var(--accent); }
.vw-stat.vw-bad b { color: var(--err); }

/* phone-like screen with absolutely placed views */
.vw-screen { position: relative; width: 210px; max-width: 100%; height: 250px; border-radius: 24px; border: 8px solid var(--code-bg); background: var(--surface); overflow: hidden; justify-self: center; }
.vw-root { position: absolute; inset: 6px; border: 1.5px dashed var(--line); border-radius: 12px; }
.vw-v { position: absolute; top: 16px; left: 14px; max-width: calc(100% - 28px); font: 700 0.95rem var(--body); color: var(--ink); transition: top 0.45s cubic-bezier(0.2, 1.3, 0.4, 1), left 0.45s cubic-bezier(0.2, 1.3, 0.4, 1); }
.vw-v.vw-btn { top: 56px; padding: 6px 14px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); font-size: 0.85rem; }
.vw-v.vw-loose { top: 0; left: 0; outline: 2px dashed var(--err); outline-offset: 1px; }
.vw-idtag { display: block; font: 500 0.66rem var(--mono); color: var(--muted); }
.vw-v.vw-btn .vw-idtag { color: inherit; opacity: 0.75; }

/* measure, layout, draw */
.vw-phases { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.vw-phase { font: 600 0.8rem var(--mono); padding: 6px 12px; border-radius: 999px; border: 2px solid var(--line); background: var(--surface); color: var(--muted); transition: background 0.2s, border-color 0.2s, color 0.2s; }
.vw-phase.on { border-color: var(--accent); background: var(--accent-soft); color: var(--ink); }
.vw-tree { display: grid; gap: 6px; min-width: 0; }
.vw-node { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 2px 10px; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font: 500 0.84rem var(--mono); min-width: 0; transition: border-color 0.2s, background 0.2s; }
.vw-node.vw-kid { margin-left: 18px; }
.vw-node.on { border-color: var(--accent); background: var(--accent-soft); }
.vw-note { color: var(--muted); font-size: 0.76rem; overflow-wrap: anywhere; }
.vw-prev { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); min-width: 0; }
.vw-prev b { font: 700 1rem var(--display); }
.vw-badge { display: inline-grid; place-items: center; height: 30px; padding: 0 10px; border-radius: 999px; font: 700 0.9rem var(--mono); color: var(--surface); transition: background 0.3s; }
.vw-badge.c0 { background: var(--err); } .vw-badge.c1 { background: var(--ok); } .vw-badge.c2 { background: var(--warm); }

/* RecyclerView */
.vw-rv { display: flex; flex-direction: column; gap: 6px; height: 268px; padding: 10px; border-radius: 14px; background: var(--bg); border: 2px solid var(--ink); overflow: hidden; min-width: 0; }
.vw-row { flex: none; display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 10px; border-radius: 10px; background: var(--surface); border: 2px solid var(--line); min-width: 0; font-size: 0.92rem; transition: border-color 0.3s, background 0.3s; }
.vw-row > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vw-pos { margin-left: auto; flex: none; color: var(--muted); font: 500 0.74rem var(--mono); }
.vw-vh { flex: none; font: 600 0.72rem var(--mono); padding: 2px 7px; border-radius: 6px; border: 2px solid var(--ink); background: var(--sunk); color: var(--ink); }
.vw-vh.c0 { border-color: var(--accent); background: var(--accent-soft); }
.vw-vh.c1 { border-color: var(--warm); background: var(--warm-soft); }
.vw-vh.c2 { border-color: var(--ok); background: var(--ok-soft); }
.vw-vh.c3 { border-color: var(--err); background: var(--err-soft); }
.vw-vh.c4 { border-color: var(--ink); background: var(--sunk); }
.vw-vh.c5 { border-color: var(--muted); background: var(--surface); }
.vw-pool { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-height: 44px; padding: 10px; border-radius: 12px; border: 2px dashed var(--line); min-width: 0; }

/* DiffUtil */
.vw-list { display: grid; gap: 6px; min-width: 0; }
.vw-list .vw-row { height: 40px; }
.vw-row.vw-ins { border-color: var(--accent); background: var(--accent-soft); }
.vw-row.vw-chg { border-color: var(--warm); background: var(--warm-soft); }
.vw-row.vw-mov { border-color: var(--ok); background: var(--ok-soft); }
.vw-row.vw-all { border-color: var(--warm); animation: pop-soft 0.6s ease-out; }
.vw-tag { flex: none; font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 7px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.vw-tag.vw-star { background: var(--warm-soft); color: var(--warm); }

/* Fragments */
.vw-stack { display: grid; gap: 8px; min-width: 0; }
.vw-frag { display: grid; gap: 6px; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; }
.vw-frag.vw-top { border-color: var(--accent); }
.vw-frag-name { font: 700 0.9rem var(--mono); }
.vw-st { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 4px 8px; font: 500 0.8rem var(--mono); }
.vw-s { padding: 1px 8px; border-radius: 999px; font-weight: 600; background: var(--ok-soft); color: var(--ok); }
.vw-s.vw-mid { background: var(--warm-soft); color: var(--warm); }
.vw-s.vw-dead { background: var(--err-soft); color: var(--err); }
.vw-log { display: grid; gap: 1px; align-content: start; font: 500 0.8rem/1.55 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 10px 12px; min-height: 10.5em; overflow-x: auto; min-width: 0; }
.vw-log div { white-space: pre; }

/* ComposeView */
.vw-bar { position: absolute; left: 0; right: 0; top: 0; height: 44px; display: flex; align-items: center; padding: 0 12px; background: var(--sunk); font: 700 0.85rem var(--body); }
.vw-bar small { margin-left: auto; font: 500 0.66rem var(--mono); color: var(--muted); }
.vw-cv { position: absolute; left: 10px; right: 10px; top: 56px; bottom: 10px; display: grid; place-items: center; align-content: center; gap: 8px; padding: 8px; border: 2px dashed var(--accent); border-radius: 12px; text-align: center; transition: opacity 0.3s, border-color 0.3s; }
.vw-cv.vw-off { opacity: 0.4; border-color: var(--muted); }
.vw-cv-name { font: 600 0.66rem var(--mono); color: var(--accent); text-transform: uppercase; letter-spacing: 0.06em; }
.vw-cv.vw-off .vw-cv-name { color: var(--muted); }
.vw-count { font: 800 2rem var(--display); }
.vw-strats { display: grid; gap: 6px; min-width: 0; }
.vw-strats .cmd { text-align: left; min-width: 0; white-space: normal; overflow-wrap: anywhere; }
.vw-strats { grid-template-columns: minmax(0, 1fr); }
.vw-screens { display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
.vw-scr { display: grid; gap: 1px; padding: 6px 12px; border-radius: 10px; border: 2px solid var(--warm); background: var(--warm-soft); font: 700 0.85rem var(--body); }
.vw-scr small { font: 600 0.66rem var(--mono); color: var(--warm); text-transform: uppercase; letter-spacing: 0.06em; }
.vw-scr.vw-done { border-color: var(--accent); background: var(--accent-soft); }
.vw-scr.vw-done small { color: var(--accent); }

/* AndroidView */
.vw-card { display: grid; gap: 8px; padding: 12px 14px; border-radius: 14px; border: 2px solid var(--ink); background: var(--surface); min-width: 0; transition: border-color 0.3s, opacity 0.3s; }
.vw-card.vw-stale { border-color: var(--err); }
.vw-card.vw-gone { opacity: 0.4; border-style: dashed; }
.vw-card-title { font: 700 0.88rem var(--mono); overflow-wrap: anywhere; }
.vw-gauge { height: 14px; border-radius: 99px; background: var(--sunk); overflow: hidden; }
.vw-gauge span { display: block; height: 100%; background: var(--accent); border-radius: 99px; transition: width 0.45s ease-out; }
.vw-card.vw-stale .vw-gauge span { background: var(--err); }
.vw-big { font: 800 1.6rem var(--display); font-variant-numeric: tabular-nums; }

/* depth: shell-level fix so long code scrolls inside step and hood grids (harmless if duplicated) */
.step > pre.code, .hood > pre.code, .hood > .prose { min-width: 0; }
.hood::details-content { min-width: 0; }

/* depth: RecyclerView */
.vw-row.vw-hdr { height: 30px; background: var(--sunk); border-style: dashed; font: 700 0.8rem var(--mono); }
.vw-pools { display: grid; gap: 8px; min-width: 0; }
.vw-pools .vw-pool { min-height: 40px; padding: 8px; }
.vw-ent { display: inline-flex; gap: 4px; align-items: center; font: 500 0.7rem var(--mono); color: var(--muted); }

/* depth: Fragments */
.vw-objs { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 8px; min-width: 0; }
.vw-objs .obj { min-width: 0; padding: 10px; font-size: 0.78rem; overflow-wrap: anywhere; transition: border-color 0.25s; }
.vw-objs .vw-tag { justify-self: start; }
.vw-objs .obj.vw-new { border-color: var(--warm); }
.vw-objs .obj.vw-kept { border-color: var(--ok); }
.vw-tag.vw-tnew { background: var(--warm-soft); color: var(--warm); }
.vw-tag.vw-tkept { background: var(--ok-soft); color: var(--ok); }
.vw-stores { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap: 8px; min-width: 0; }
.vw-store { display: grid; gap: 6px; align-content: start; min-height: 96px; padding: 10px; border-radius: 12px; border: 2px dashed var(--line); background: var(--bg); min-width: 0; }
.vw-store .obj { min-width: 0; padding: 8px 10px; font-size: 0.78rem; overflow-wrap: anywhere; }
`;

  Lab.addTrack({
    id: 'views',
    title: 'Views and Compose interop',
    description: 'Maintain View-based screens and move them to Compose one piece at a time.',
    group: 'Building apps',
    requires: ['android'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'xml',
        title: 'XML layouts and View binding',
        tagline: 'From an XML file to typed view references.',
        level: 'beginner',
        body: `
<p>A View-based screen starts as an XML layout. Inflation reads that file and builds real <code>View</code> objects, one per tag, nested like the XML.</p>
<p>View binding generates a class per layout, such as <code>ActivityProfileBinding</code>, with one typed field per view that has an id. <code>binding.title</code> is already a <code>TextView</code>. A wrong id fails at compile time. <code>findViewById</code> finds views by id at runtime, so a wrong id or a wrong type only shows up as a crash.</p>
<p><code>ConstraintLayout</code> places each child with constraints to the parent or to siblings. Every view needs at least one horizontal and one vertical constraint. Without them it jumps to the top left corner at runtime.</p>`,
        code: `// build.gradle.kts
android {
    buildFeatures { viewBinding = true }
}

class ProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityProfileBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.title.text = getString(R.string.greeting, "Ada")  // TextView, no cast
        binding.follow.setOnClickListener { viewModel.follow() }   // Button
    }
}

// The old way: a lookup by id at runtime, typed by hand
val title = findViewById<TextView>(R.id.title)`,
        remember: 'Inflation turns XML into View objects. View binding gives you typed, null-safe fields for them.',
        terms: [
          { term: 'Layout inflation', def: 'Reading an XML layout and creating the View objects it describes.' },
          { term: 'View binding', def: 'A build feature that generates a class per layout with a typed field for every view that has an id.' },
          { term: 'findViewById', def: 'A runtime lookup that returns the view with a given id, or null, cast to whatever type you ask for.' },
          { term: 'ConstraintLayout', def: 'A ViewGroup that positions each child with constraints relative to the parent or to other children.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Inflate the layout through its binding and show it.', code: 'binding = ActivityProfileBinding.[[inflate]](layoutInflater)\nsetContentView(binding.[[root]])', why: '<code>inflate</code> builds the view tree. <code>root</code> is the top view of that tree, which you pass to <code>setContentView</code>.' },
          { type: 'bug', prompt: 'The screen shows up empty and the text never changes. Tap the line.', code: 'override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    binding = ActivityProfileBinding.inflate(layoutInflater)\n    setContentView(R.layout.activity_profile)\n    binding.title.text = "Hi, Ada"\n}', bug: 3, fix: '    setContentView(binding.root)', why: 'Passing the layout id inflates a second, separate tree. The binding points at the first tree, which is never shown.' },
        ],
        quiz: [
          { q: 'You rename the id <code>title</code> to <code>heading</code> in XML. What happens to <code>binding.title</code>?', options: ['It returns null at runtime', 'The code stops compiling', 'It still finds the old view'], a: 1, why: 'The binding class is regenerated with a <code>heading</code> field, so <code>title</code> no longer exists.' },
          { q: '<code>findViewById&lt;Button&gt;(R.id.title)</code> where title is a TextView. What happens?', options: ['A compile error', 'A ClassCastException at runtime', 'It returns null'], a: 1, why: '<code>findViewById</code> trusts the type you ask for. The wrong type only fails when the code runs.' },
          { q: 'A Button in a ConstraintLayout has no vertical constraint. Where does it show at runtime?', options: ['Centered', 'At the top', 'Below the previous view'], a: 1, why: 'Unconstrained views go to the top left. The editor warns about it, but the build still succeeds.' },
        ],
        visual(el) {
          const xml = [
            '<ConstraintLayout ...>',
            '  <TextView android:id="@+id/title"',
            '      app:layout_constraintTop_toTopOf="parent" />',
            '  <Button android:id="@+id/follow"',
            '      app:layout_constraintTop_toBottomOf="@id/title" />',
            '</ConstraintLayout>',
          ];
          const lines = xml.map(t => h('div', { class: 'branch' }, t));
          const code = h('div', { class: 'when' }, lines);
          const screen = h('div', { class: 'vw-screen' });
          const titleText = h('span', {}, 'Profile');
          const title = h('div', { class: 'vw-v' }, titleText, h('span', { class: 'vw-idtag' }, 'binding.title'));
          const btn = h('div', { class: 'vw-v vw-btn' }, 'Follow', h('span', { class: 'vw-idtag' }, 'binding.follow'));
          const root = h('div', { class: 'vw-root' });
          const o = out('Inflated. Try the binding, then findViewById.');
          let busy = false, n = 0;
          const names = ['Hi, Ada', 'Hi, Grace', 'Hi, Linus'];
          const sw = toggle('vw-xml-constraint', 'Button has <code>constraintTop_toBottomOf</code>', true, () => {
            const on = sw.input.checked;
            btn.classList.toggle('vw-loose', !on);
            lines[4].classList.toggle('cut', !on);
            say(o, on ? '<span class="good">constrained:</span> follow sits below title'
              : '<span class="bad">no vertical constraint:</span> follow jumps to the top left at runtime');
          });
          screen.append(root, title, btn);
          async function inflate() {
            if (busy) return; busy = true;
            screen.replaceChildren();
            for (let i = 0; i < lines.length; i++) {
              lines[i].classList.add('scan');
              if (i === 0) screen.append(root);
              if (i === 1) { title.classList.add('drop-in'); screen.append(title); }
              if (i === 3) { btn.classList.add('drop-in'); screen.append(btn); }
              await sleep(360);
              lines[i].classList.remove('scan');
              if (!el.isConnected) return;
            }
            title.classList.remove('drop-in'); btn.classList.remove('drop-in');
            say(o, '<span class="good">inflated:</span> 3 View objects. The binding holds typed fields for the 2 with ids.');
            busy = false;
          }
          el.append(
            h('div', { class: 'vw-split' }, h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'activity_profile.xml'), code), screen),
            sw.el,
            h('div', { class: 'controls' },
              cmd('ActivityProfileBinding.inflate(layoutInflater)', inflate),
              cmd('binding.title.text = name', () => {
                if (busy) return;
                titleText.textContent = names[n++ % names.length]; replay(title, 'pop');
                say(o, `<span class="good">ok:</span> binding.title is a TextView, no cast, no null check`);
              }),
              cmd('binding.subtitle.text = name', () => { if (busy) return; replay(code, 'shake'); say(o, '<span class="bad">compile error:</span> Unresolved reference \'subtitle\' <span class="muted">// caught before the app runs</span>'); }),
              cmd('findViewById<Button>(R.id.title)', () => { if (busy) return; replay(title, 'shake'); say(o, '<span class="bad">crash:</span> ClassCastException: TextView cannot be cast to Button'); })),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'passes',
        title: 'The View lifecycle: measure, layout, draw',
        tagline: 'Three passes turn a tree of views into pixels.',
        level: 'intermediate',
        body: `
<p>Each frame that needs work goes through three passes, top down through the tree. <b>Measure</b> asks every view how big it wants to be, inside the limits its parent passes in a <code>MeasureSpec</code>. <b>Layout</b> gives every view its final position. <b>Draw</b> paints each view onto the canvas.</p>
<p>You never call these passes yourself. You ask for them. <code>requestLayout()</code> says the size or position may change, so the next frame runs measure and layout again. <code>invalidate()</code> says only the look changed, so the next frame redraws that view and skips measure and layout.</p>
<p>Pick the cheaper call when you can. A color change is a redraw. New text in a <code>wrap_content</code> view may change its size, so it needs a layout pass.</p>`,
        code: `class BadgeView @JvmOverloads constructor(
    context: Context, attrs: AttributeSet? = null,
) : View(context, attrs) {
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply { textSize = 36f }
    private val pad = 24

    var count = 0
        set(value) {
            val sizeChanges = value.toString().length != field.toString().length
            field = value
            if (sizeChanges) requestLayout()   // measure + layout, then draw
            invalidate()                       // draw the new number
        }

    var badgeColor = Color.RED
        set(value) { field = value; invalidate() }   // looks only: draw pass

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val w = paint.measureText(count.toString()).toInt() + pad * 2
        val h = (paint.textSize + pad).toInt()
        setMeasuredDimension(resolveSize(w, widthMeasureSpec), resolveSize(h, heightMeasureSpec))
    }

    override fun onDraw(canvas: Canvas) {
        paint.color = badgeColor
        canvas.drawRoundRect(0f, 0f, width.toFloat(), height.toFloat(), height / 2f, height / 2f, paint)
        paint.color = Color.WHITE
        canvas.drawText(count.toString(), pad.toFloat(), height - pad / 2f, paint)
    }
}`,
        remember: 'Size or position changed: requestLayout(). Only the look changed: invalidate().',
        terms: [
          { term: 'Measure pass', def: 'The pass where each view reports the size it wants, within the constraints from its parent.' },
          { term: 'MeasureSpec', def: 'A packed int a parent passes to a child in onMeasure, holding a size and a mode: EXACTLY, AT_MOST or UNSPECIFIED.' },
          { term: 'requestLayout', def: 'Marks a view as needing a new measure and layout pass on the next frame.' },
          { term: 'invalidate', def: 'Marks a view as needing a redraw on the next frame, without measuring or laying it out again.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A new count can change the badge width. A new color can’t.', code: 'var count = 0\n    set(value) { field = value; [[requestLayout]](); invalidate() }\n\nvar badgeColor = Color.RED\n    set(value) { field = value; [[invalidate]]() }', why: 'A size change needs measure and layout. A color change only needs a redraw.' },
          { type: 'bug', prompt: 'This view works but stutters while it animates, and Lint flags one line. Tap it.', code: 'override fun onDraw(canvas: Canvas) {\n    val paint = Paint(Paint.ANTI_ALIAS_FLAG)\n    paint.color = badgeColor\n    canvas.drawCircle(width / 2f, height / 2f, width / 2f, paint)\n}', bug: 1, fix: '    // move the Paint to a property: private val paint = Paint(Paint.ANTI_ALIAS_FLAG)', why: '<code>onDraw</code> can run every frame. Allocating there creates garbage on each frame and triggers GC pauses.' },
        ],
        quiz: [
          { q: 'A custom view changes only its fill color. Which call fits?', options: ['<code>requestLayout()</code>', '<code>invalidate()</code>', 'Both'], a: 1, why: 'The size and position stay the same, so a redraw is enough.' },
          { q: 'In which order do the passes run?', options: ['Draw, measure, layout', 'Measure, layout, draw', 'Layout, measure, draw'], a: 1, why: 'Sizes come first, positions use those sizes, and drawing uses the final bounds.' },
          { q: 'Inside <code>onMeasure</code>, what must a view always do?', options: ['Call <code>invalidate()</code>', 'Call <code>setMeasuredDimension()</code>', 'Call <code>requestLayout()</code>'], a: 1, why: 'Without it the framework throws an IllegalStateException. Calling requestLayout from a pass would also loop.' },
        ],
        visual(el) {
          let count = 8, color = 0, busy = false;
          const colors = ['RED', 'GREEN', 'ORANGE'];
          const phases = ['measure', 'layout', 'draw'].map(p => h('span', { class: 'vw-phase' }, p));
          const mk = (name, kid) => {
            const note = h('span', { class: 'vw-note' }, 'ready');
            return { el: h('div', { class: 'vw-node' + (kid ? ' vw-kid' : '') }, h('span', {}, name), note), note };
          };
          const nodes = [mk('LinearLayout', false), mk('TextView title', true), mk('BadgeView badge', true)];
          const badge = h('span', { class: 'vw-badge c0' }, String(count));
          const width = () => 60 + 18 * (String(count).length - 1);
          const tally = { measure: stat('measure', 0), layout: stat('layout', 0), draw: stat('draw', 0) };
          const n = { measure: 0, layout: 0, draw: 0 };
          const o = out('Change the badge. Watch which passes run.');
          const notes = {
            measure: i => ['onMeasure: 240 × 52', 'onMeasure: 150 × 24', `onMeasure: ${width()} × 30`][i],
            layout: i => ['onLayout: 0, 0', 'onLayout: 12, 14', `onLayout: ${168 - width() + 60}, 11`][i],
            draw: () => 'onDraw',
          };
          async function frame(plan, apply) {
            busy = true;
            nodes.forEach(x => { x.note.textContent = 'skipped'; });
            for (const [p, which] of plan) {
              const pill = phases[['measure', 'layout', 'draw'].indexOf(p)];
              pill.classList.add('on');
              for (const i of which) {
                nodes[i].el.classList.add('on'); nodes[i].note.textContent = notes[p](i);
                if (p === 'draw' && i === 2) apply();
                await sleep(300);
                if (!el.isConnected) return;
                nodes[i].el.classList.remove('on');
              }
              n[p]++; tally[p].set(n[p]);
              pill.classList.remove('on');
            }
            busy = false;
          }
          async function inc() {
            if (busy) return;
            const before = String(count).length;
            count = count >= 999 ? 8 : count + 1;
            const grows = String(count).length !== before;
            if (grows) {
              say(o, `count = ${count}: digit count changed, size may change <span class="muted">// requestLayout() + invalidate()</span>`);
              await frame([['measure', [0, 1, 2]], ['layout', [0, 1, 2]], ['draw', [0, 2]]], () => { badge.textContent = String(count); replay(badge, 'pop'); });
            } else {
              say(o, `count = ${count}: same width <span class="muted">// invalidate() only</span>`);
              await frame([['draw', [2]]], () => { badge.textContent = String(count); replay(badge, 'pop'); });
            }
          }
          async function recolor() {
            if (busy) return;
            color = (color + 1) % colors.length;
            say(o, `badgeColor = Color.${colors[color]} <span class="muted">// invalidate(): draw only</span>`);
            await frame([['draw', [2]]], () => { badge.className = `vw-badge c${color}`; });
          }
          async function jump() {
            if (busy) return;
            count = count < 100 ? 128 : 8;
            say(o, `count = ${count} <span class="muted">// size changes: requestLayout() + invalidate()</span>`);
            await frame([['measure', [0, 1, 2]], ['layout', [0, 1, 2]], ['draw', [0, 2]]], () => { badge.textContent = String(count); replay(badge, 'pop'); });
          }
          el.append(
            h('div', { class: 'vw-phases' }, h('span', { class: 'vw-label' }, 'Next frame'), phases),
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-tree' }, nodes.map(x => x.el)),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'On screen'), h('div', { class: 'vw-prev' }, h('b', {}, 'Inbox'), badge))),
            h('div', { class: 'controls' },
              cmd('badge.count++', inc),
              cmd('badge.count = 128', jump),
              cmd('badge.badgeColor = next', recolor)),
            h('div', { class: 'vw-stats' }, tally.measure, tally.layout, tally.draw),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'recycler',
        title: 'RecyclerView',
        tagline: 'A long list built from a handful of reused views.',
        level: 'intermediate',
        body: `
<p>A list of 10,000 rows can’t have 10,000 views. <code>RecyclerView</code> creates only enough rows to fill the screen, plus a few spare. When a row scrolls off, its view goes into a pool. The next row that scrolls in takes a view from that pool and gets new data.</p>
<p>Three parts split the work. The <code>Adapter</code> creates row views in <code>onCreateViewHolder</code> and fills them in <code>onBindViewHolder</code>. A <code>ViewHolder</code> wraps one row view and keeps references to its children. The <code>LayoutManager</code> decides where rows go: a vertical list, a grid, or a staggered grid.</p>
<p>Because views get reused, <code>onBindViewHolder</code> must set every field every time. If you show a star only when an item is starred and never hide it, a recycled row keeps the star from its last item.</p>`,
        code: `class ContactAdapter(
    private val items: List<Contact>,
    private val onClick: (Contact) -> Unit,
) : RecyclerView.Adapter<ContactAdapter.Holder>() {

    class Holder(val binding: ItemContactBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): Holder {
        val inflater = LayoutInflater.from(parent.context)
        return Holder(ItemContactBinding.inflate(inflater, parent, false))
    }

    override fun onBindViewHolder(holder: Holder, position: Int) {
        val item = items[position]
        holder.binding.name.text = item.name
        holder.binding.star.isVisible = item.starred      // set it both ways
        holder.binding.root.setOnClickListener { onClick(item) }
    }

    override fun getItemCount() = items.size
}

binding.list.layoutManager = LinearLayoutManager(requireContext())
binding.list.adapter = ContactAdapter(contacts) { openDetail(it.id) }`,
        remember: 'RecyclerView creates a screenful of rows and rebinds them. Bind every field, every time.',
        terms: [
          { term: 'ViewHolder', def: 'An object that wraps one row view of a RecyclerView and holds references to its child views.' },
          { term: 'onBindViewHolder', def: 'The adapter callback that fills an existing row view with the data for a given position.' },
          { term: 'LayoutManager', def: 'The RecyclerView component that measures and positions rows and decides which ones to recycle.' },
          { term: 'RecycledViewPool', def: 'The store of detached ViewHolders, kept by view type, that RecyclerView reuses before creating new ones.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Inflate a row without attaching it, and report how many rows there are.', code: 'override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =\n    Holder(ItemContactBinding.inflate(LayoutInflater.from(parent.context), parent, [[false]]))\n\noverride fun getItemCount() = items.[[size]]', why: 'RecyclerView attaches rows itself, so <code>attachToParent</code> must be false. Passing <code>parent</code> still gives the row the right layout params.' },
          { type: 'bug', prompt: 'After scrolling, stars show up on contacts that are not starred. Tap the line.', code: 'override fun onBindViewHolder(holder: Holder, position: Int) {\n    val item = items[position]\n    holder.binding.name.text = item.name\n    if (item.starred) holder.binding.star.isVisible = true\n}', bug: 3, fix: '    holder.binding.star.isVisible = item.starred', why: 'A recycled row still shows its last item’s star. Setting the field only one way never clears it.' },
        ],
        quiz: [
          { q: 'You scroll a 5,000 item list to the end. Roughly how often did <code>onCreateViewHolder</code> run?', options: ['About 5,000 times', 'About as many rows as fit on screen, plus a few', 'Once'], a: 1, why: 'After the first screenful, rows come from the pool and only <code>onBindViewHolder</code> runs.' },
          { q: 'Which part decides that rows form a 2 column grid?', options: ['The Adapter', 'The ViewHolder', 'The LayoutManager'], a: 2, why: '<code>GridLayoutManager(context, 2)</code> places the rows. The adapter stays the same.' },
        ],
        deeper: [
          {
            title: 'View types get their own pools',
            body: `<p>A list with headers and contacts has two row layouts. Override <code>getItemViewType</code> and the adapter gets that type in <code>onCreateViewHolder</code>. The pool keeps holders per type, so a header holder is never handed to a contact row.</p>
<p>Scroll down and watch: a contact that scrolls in can only take a contact holder. If that bin is empty, a new one is created even when a header holder is waiting.</p>`,
            code: `override fun getItemViewType(position: Int) = when (items[position]) {
    is Row.Header -> TYPE_HEADER
    is Row.Person -> TYPE_PERSON
}

override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
    val inflater = LayoutInflater.from(parent.context)
    return when (viewType) {
        TYPE_HEADER -> HeaderHolder(ItemHeaderBinding.inflate(inflater, parent, false))
        else -> PersonHolder(ItemContactBinding.inflate(inflater, parent, false))
    }
}`,
            visual(el) {
              const DATA = ['A', 'Ada', 'Alan', 'B', 'Barbara', 'D', 'Dennis', 'E', 'Edsger', 'F', 'Frances', 'G', 'Grace', 'H', 'Hedy', 'I', 'Ivan', 'J', 'Joan', 'K', 'Ken'];
              const type = pos => (DATA[pos].length === 1 ? 'header' : 'person');
              const SHOW = 5;
              let top = 0, busy = false;
              const made = { header: 0, person: 0 }, pools = { header: [], person: [] };
              const rv = h('div', { class: 'vw-rv', 'aria-label': 'RecyclerView viewport' });
              const poolEls = { header: h('div', { class: 'vw-pool' }), person: h('div', { class: 'vw-pool' }) };
              const sH = stat('header holders', 0), sP = stat('person holders', 0);
              const o = out();
              const rows = [];
              const chip = vh => h('span', { class: 'vw-vh ' + (vh[0] === 'H' ? 'c1' : 'c0') }, vh);
              const rowEl = (vh, pos) => type(pos) === 'header'
                ? h('div', { class: 'vw-row vw-hdr' }, chip(vh), h('span', {}, DATA[pos]))
                : h('div', { class: 'vw-row' }, chip(vh), h('span', {}, DATA[pos]), h('span', { class: 'vw-pos' }, `pos ${pos}`));
              const paintPools = () => Object.entries(poolEls).forEach(([k, p]) => p.replaceChildren(h('span', { class: 'vw-label' }, k), ...(pools[k].length ? pools[k].map(chip) : [h('span', { class: 'vw-note' }, 'empty')])));
              function holder(pos) {
                const k = type(pos);
                if (pools[k].length) { const vh = pools[k].shift(); paintPools(); return { vh, msg: `<span class="good">reused</span> ${vh} from the ${k} pool` }; }
                const vh = (k === 'header' ? 'H' : 'P') + (++made[k]);
                (k === 'header' ? sH : sP).set(made[k]);
                const other = k === 'header' ? 'person' : 'header';
                return { vh, msg: `<span class="bad">created</span> ${vh}: the ${k} pool was empty` + (pools[other].length ? ` <span class="muted">// ${pools[other].length} ${other} holder${pools[other].length > 1 ? 's' : ''} can’t help</span>` : '') };
              }
              for (let p = 0; p < SHOW; p++) { const { vh } = holder(p); const r = { pos: p, vh, el: rowEl(vh, p) }; rows.push(r); rv.append(r.el); }
              paintPools();
              say(o, 'Headers and people use different layouts. Scroll down.');
              async function scroll() {
                if (busy) return false;
                const pos = top + SHOW;
                if (pos >= DATA.length) { replay(rv, 'shake'); say(o, '<span class="muted">// end of list</span>'); return false; }
                busy = true;
                const { vh, msg } = holder(pos);
                const r = { pos, vh, el: rowEl(vh, pos) };
                r.el.classList.add('drop-in'); rows.push(r); rv.append(r.el);
                say(o, `${msg}, bind ${type(pos)} "${DATA[pos]}"`);
                await sleep(320);
                const gone = rows.shift(); gone.el.classList.add('leave');
                await sleep(400);
                gone.el.remove();
                pools[type(gone.pos)].push(gone.vh); paintPools();
                top++;
                busy = false;
                return el.isConnected;
              }
              let multi = false;
              async function three() {
                if (multi || busy) return; multi = true;
                for (let i = 0; i < 3; i++) { if (!(await scroll())) break; await sleep(60); }
                multi = false;
              }
              el.append(
                h('div', { class: 'vw-split' },
                  h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'On screen'), rv),
                  h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'RecycledViewPool, one bin per type'), h('div', { class: 'vw-pools' }, poolEls.header, poolEls.person))),
                h('div', { class: 'controls' }, act('Scroll down 1 row', scroll), act('Scroll down 3 rows', three)),
                h('div', { class: 'vw-stats' }, sH, sP),
                o);
            },
          },
          {
            title: 'A small cache sits in front of the pool',
            body: `<p>A row that just scrolled off does not go straight to the pool. It first waits in a small cache, two holders by default, still bound to its position. Scroll back and that row returns as it was, with no <code>onBindViewHolder</code> at all.</p>
<p>When the cache is full, its oldest holder moves to the pool and forgets its data. Anything from the pool must be bound again. That is why small back-and-forth scrolls are cheap.</p>`,
            visual(el) {
              const names = ['Ada', 'Alan', 'Barbara', 'Dennis', 'Edsger', 'Frances', 'Grace', 'Hedy', 'Ivan', 'Joan', 'Ken', 'Linus', 'Margaret', 'Niklaus', 'Radia', 'Shafi'];
              const SHOW = 4, CACHE = 2;
              let top = 0, created = 0, binds = 0, hits = 0, busy = false;
              const rows = [], cache = [], pool = [];
              const rv = h('div', { class: 'vw-rv', style: 'height:220px', 'aria-label': 'RecyclerView viewport' });
              const cacheEl = h('div', { class: 'vw-pool' }), poolEl = h('div', { class: 'vw-pool' });
              const sC = stat('created', 0), sB = stat('bound', 0), sH = stat('cache hits', 0);
              const o = out();
              const chip = vh => h('span', { class: `vw-vh c${(vh - 1) % 6}` }, `VH${vh}`);
              const rowEl = (vh, pos) => h('div', { class: 'vw-row' }, chip(vh), h('span', {}, names[pos]), h('span', { class: 'vw-pos' }, `pos ${pos}`));
              const paint = () => {
                cacheEl.replaceChildren(...(cache.length ? cache.map(c => h('span', { class: 'vw-ent' }, chip(c.vh), `pos ${c.pos}`)) : [h('span', { class: 'vw-note' }, 'empty')]));
                poolEl.replaceChildren(...(pool.length ? pool.map(chip) : [h('span', { class: 'vw-note' }, 'empty')]));
              };
              function holder(pos) {
                const i = cache.findIndex(c => c.pos === pos);
                if (i >= 0) { const [c] = cache.splice(i, 1); sH.set(++hits); return { vh: c.vh, msg: `<span class="good">cache hit</span> VH${c.vh} still shows pos ${pos}. No bind.` }; }
                if (pool.length) { const vh = pool.shift(); sB.set(++binds); return { vh, msg: `from the pool: VH${vh}, onBindViewHolder(VH${vh}, ${pos})` }; }
                const vh = ++created; sC.set(created); sB.set(++binds);
                return { vh, msg: `<span class="bad">created</span> VH${vh}, then bound to pos ${pos}` };
              }
              function park(r) {
                cache.push({ vh: r.vh, pos: r.pos });
                if (cache.length > CACHE) { const old = cache.shift(); pool.push(old.vh); return ` Cache full: VH${old.vh} moves to the pool and forgets pos ${old.pos}.`; }
                return '';
              }
              for (let p = 0; p < SHOW; p++) { const vh = ++created; binds++; const r = { pos: p, vh, el: rowEl(vh, p) }; rows.push(r); rv.append(r.el); }
              sC.set(created); sB.set(binds); paint();
              say(o, 'Scroll down a few rows, then back up.');
              async function scroll(dir) {
                if (busy) return;
                const pos = dir > 0 ? top + SHOW : top - 1;
                if (pos < 0 || pos >= names.length) { replay(rv, 'shake'); say(o, '<span class="muted">// end of list</span>'); return; }
                busy = true;
                const { vh, msg } = holder(pos);
                const r = { pos, vh, el: rowEl(vh, pos) };
                r.el.classList.add('drop-in');
                if (dir > 0) { rows.push(r); rv.append(r.el); } else { rows.unshift(r); rv.prepend(r.el); }
                paint(); say(o, msg);
                await sleep(320);
                const gone = dir > 0 ? rows.shift() : rows.pop();
                gone.el.classList.add('leave');
                await sleep(400);
                if (!el.isConnected) return;
                gone.el.remove();
                const extra = park(gone); paint();
                if (extra) o.append(h('span', {}, extra));
                top += dir;
                busy = false;
              }
              el.append(
                h('div', { class: 'vw-split' },
                  h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'On screen'), rv),
                  h('div', { class: 'vw-col' },
                    h('span', { class: 'vw-label' }, 'View cache: bound, by position'), cacheEl,
                    h('span', { class: 'vw-label' }, 'Pool: needs a bind'), poolEl)),
                h('div', { class: 'controls' }, act('Scroll down 1 row', () => scroll(1)), act('Scroll up 1 row', () => scroll(-1))),
                h('div', { class: 'vw-stats' }, sC, sB, sH),
                o);
            },
          },
          {
            title: 'Rebind only what changed with payloads',
            body: `<p>A star toggle does not need the whole row rebound. Pass a payload with the change, and the three-argument <code>onBindViewHolder</code> receives it. Update just the star there, and fall back to a full bind when <code>payloads</code> is empty.</p>
<p>A payload also changes the animation. The default item animator reuses the same holder instead of cross-fading a copy, so the row doesn’t flicker. With <code>ListAdapter</code>, return the payload from <code>getChangePayload</code> in your <code>ItemCallback</code>.</p>`,
            code: `object ContactDiff : DiffUtil.ItemCallback<Contact>() {
    override fun areItemsTheSame(oldItem: Contact, newItem: Contact) = oldItem.id == newItem.id
    override fun areContentsTheSame(oldItem: Contact, newItem: Contact) = oldItem == newItem
    override fun getChangePayload(oldItem: Contact, newItem: Contact): Any? =
        if (oldItem.copy(starred = newItem.starred) == newItem) STAR_CHANGED else null
}

override fun onBindViewHolder(holder: Holder, position: Int, payloads: MutableList<Any>) {
    if (STAR_CHANGED in payloads) holder.binding.star.isVisible = getItem(position).starred
    else super.onBindViewHolder(holder, position, payloads)   // full bind
}`,
          },
        ],
        underHood: {
          body: `<p>When the LayoutManager needs a row, it calls <code>Recycler.getViewForPosition</code>. The Recycler looks in a fixed order: the scrap of rows detached during this layout pass, then the view cache by position, then by stable id if the adapter has stable ids, then an optional <code>ViewCacheExtension</code>, then the <code>RecycledViewPool</code> by view type. Only if all of those miss does it call <code>onCreateViewHolder</code>. A holder from the scrap or cache that is still valid skips the bind.</p>
<p>The pool keeps at most 5 holders per type by default. On top of this, a <code>GapWorker</code> prefetches the next rows in the idle time between frames on the UI thread, while the RenderThread draws, and parks them in the cache. So a fling often finds its next row already created and bound.</p>`,
          code: `binding.list.setItemViewCacheSize(4)                                 // default 2
binding.list.recycledViewPool.setMaxRecycledViews(TYPE_PERSON, 10)    // default 5 per type`,
        },
        mistakes: [
          {
            title: 'Capturing the bind-time position in a click listener',
            bad: `override fun onBindViewHolder(holder: Holder, position: Int) {
    holder.itemView.setOnClickListener { onClick(items[position]) }
}`,
            good: `// in onCreateViewHolder, once per holder
holder.itemView.setOnClickListener {
    val pos = holder.bindingAdapterPosition
    if (pos != RecyclerView.NO_POSITION) onClick(items[pos])
}`,
            why: 'An insert above shifts rows without rebinding them, so the captured <code>position</code> points at the wrong item. Ask the holder at click time.',
          },
          {
            title: 'Leaving a CheckBox listener attached while you set its state',
            bad: `val item = items[position]
holder.binding.done.isChecked = item.done
holder.binding.done.setOnCheckedChangeListener { _, c -> onToggle(item.id, c) }`,
            good: `val item = items[position]
holder.binding.done.setOnCheckedChangeListener(null)
holder.binding.done.isChecked = item.done
holder.binding.done.setOnCheckedChangeListener { _, c -> onToggle(item.id, c) }`,
            why: 'A recycled holder still has the previous item’s listener. Setting <code>isChecked</code> fires it and toggles that other item.',
          },
          {
            title: 'A new inner adapter on every bind',
            bad: `override fun onBindViewHolder(holder: RowHolder, position: Int) {
    holder.binding.tags.adapter = TagAdapter(items[position].tags)
}`,
            good: `private val tagPool = RecyclerView.RecycledViewPool()
// onCreateViewHolder: tags.setRecycledViewPool(tagPool) and set one TagAdapter
override fun onBindViewHolder(holder: RowHolder, position: Int) {
    (holder.binding.tags.adapter as TagAdapter).submitList(items[position].tags)
}`,
            why: 'Swapping the adapter throws away the inner rows, and each inner list has its own pool by default. Share one pool and keep one adapter per row.',
          },
        ],
        visual(el) {
          const names = ['Ada', 'Alan', 'Barbara', 'Dennis', 'Edsger', 'Frances', 'Grace', 'Hedy', 'Ivan', 'Joan', 'Ken', 'Linus', 'Margaret', 'Niklaus', 'Radia', 'Shafi', 'Tim', 'Yukihiro'];
          const N = 40, SHOW = 5;
          let top = 0, created = 0, binds = 0, busy = false;
          const rv = h('div', { class: 'vw-rv', 'aria-label': 'RecyclerView viewport' });
          const pool = h('div', { class: 'vw-pool' });
          const sCreate = stat('onCreateViewHolder', 0), sBind = stat('onBindViewHolder', 0), sItems = stat('items', N);
          const o = out();
          const rows = []; // { pos, vh, el }
          const poolList = [];
          const vhChip = vh => h('span', { class: `vw-vh c${(vh - 1) % 6}` }, `VH${vh}`);
          const rowEl = (vh, pos) => h('div', { class: 'vw-row' }, vhChip(vh), h('span', {}, names[pos % names.length]), h('span', { class: 'vw-pos' }, `pos ${pos}`));
          const paintPool = () => { pool.replaceChildren(...(poolList.length ? poolList.map(vhChip) : [h('span', { class: 'vw-note' }, 'empty')])); };
          function holderFor(pos) {
            let vh, msg;
            if (poolList.length) {
              vh = poolList.shift(); paintPool();
              msg = `<span class="good">reused</span> VH${vh} from the pool`;
            } else {
              vh = ++created; sCreate.set(created);
              msg = `<span class="bad">created</span> VH${vh}: pool was empty`;
            }
            binds++; sBind.set(binds);
            return { vh, msg: `${msg}, onBindViewHolder(VH${vh}, ${pos})` };
          }
          for (let p = 0; p < SHOW; p++) { const vh = ++created; binds++; const r = { pos: p, vh, el: rowEl(vh, p) }; rows.push(r); rv.append(r.el); }
          sCreate.set(created); sBind.set(binds); paintPool();
          say(o, `${SHOW} rows created to fill the screen. Scroll down.`);
          async function scroll(dir) {
            if (busy) return false;
            const pos = dir > 0 ? top + SHOW : top - 1;
            if (pos < 0 || pos >= N) { replay(rv, 'shake'); say(o, `<span class="muted">// end of list</span>`); return false; }
            busy = true;
            const { vh, msg } = holderFor(pos);
            const r = { pos, vh, el: rowEl(vh, pos) };
            r.el.classList.add('drop-in');
            if (dir > 0) { rows.push(r); rv.append(r.el); } else { rows.unshift(r); rv.prepend(r.el); }
            say(o, msg);
            await sleep(320);
            const gone = dir > 0 ? rows.shift() : rows.pop();
            gone.el.classList.add('leave');
            await sleep(420);
            gone.el.remove();
            poolList.push(gone.vh); paintPool(); replay(pool.lastElementChild, 'pop');
            top += dir;
            busy = false;
            return el.isConnected;
          }
          let flinging = false;
          async function fling() {
            if (flinging || busy) return; flinging = true;
            for (let i = 0; i < 8; i++) { if (!(await scroll(1))) break; await sleep(80); }
            flinging = false;
          }
          el.append(
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'On screen'), rv),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'RecycledViewPool'), pool,
                h('p', { class: 'tip' }, 'Rows that scroll off wait here. The next row that scrolls in takes one and gets rebound.'))),
            h('div', { class: 'controls' },
              act('Scroll down 1 row', () => scroll(1)),
              act('Scroll up 1 row', () => scroll(-1)),
              act('Fling 8 rows', fling)),
            h('div', { class: 'vw-stats' }, sCreate, sBind, sItems),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'diff',
        title: 'ListAdapter and DiffUtil',
        tagline: 'Hand over a new list, get only the changes.',
        level: 'intermediate',
        body: `
<p><code>notifyDataSetChanged()</code> tells RecyclerView that everything may have changed. It rebinds every visible row and plays no animations. <code>ListAdapter</code> does better: you call <code>submitList(newList)</code> and it diffs the old list against the new one on a background thread, then sends only the inserts, removes, moves and changes.</p>
<p>The diff needs two answers from a <code>DiffUtil.ItemCallback</code>. <code>areItemsTheSame</code> asks whether two entries are the same thing, usually by comparing ids. <code>areContentsTheSame</code> asks whether that thing looks different now. If you compare whole objects in the first one, an edited item looks like a removal plus an insert.</p>
<p>Always submit a new list. If you change the list you already submitted and pass the same instance again, ListAdapter sees the same reference and does nothing.</p>`,
        code: `data class Contact(val id: Long, val name: String, val starred: Boolean)

object ContactDiff : DiffUtil.ItemCallback<Contact>() {
    override fun areItemsTheSame(oldItem: Contact, newItem: Contact) = oldItem.id == newItem.id
    override fun areContentsTheSame(oldItem: Contact, newItem: Contact) = oldItem == newItem
}

class ContactAdapter : ListAdapter<Contact, ContactAdapter.Holder>(ContactDiff) {
    class Holder(val binding: ItemContactBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        Holder(ItemContactBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: Holder, position: Int) {
        val item = getItem(position)
        holder.binding.name.text = item.name
        holder.binding.star.isVisible = item.starred
    }
}

// In the Fragment
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.contacts.collect { adapter.submitList(it) }
    }
}`,
        remember: 'Same id means same item. Same fields means same contents. Submit a new list every time.',
        terms: [
          { term: 'submitList', def: 'The ListAdapter method that takes a new list, diffs it against the current one and dispatches only the changes.' },
          { term: 'areItemsTheSame', def: 'The DiffUtil callback that decides whether two entries represent the same item, usually by id.' },
          { term: 'areContentsTheSame', def: 'The DiffUtil callback that decides whether an item that stayed has visible changes and needs a rebind.' },
          { term: 'notifyDataSetChanged', def: 'An adapter call that marks every item as changed, rebinding all rows with no item animations.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Match items by id, and compare contents with data class equality.', code: 'object ContactDiff : DiffUtil.ItemCallback<Contact>() {\n    override fun areItemsTheSame(oldItem: Contact, newItem: Contact) =\n        oldItem.[[id]] == newItem.[[id]]\n    override fun areContentsTheSame(oldItem: Contact, newItem: Contact) =\n        oldItem [[==]] newItem\n}', why: 'The id says which item it is. Data class <code>==</code> compares every field, so any visible change triggers a rebind.' },
          { type: 'bug', prompt: 'Tapping Add puts the contact in the list, but the screen never updates. Tap the line.', code: 'private val cache = mutableListOf<Contact>()\n\nfun add(contact: Contact) {\n    cache.add(contact)\n    adapter.submitList(cache)\n}', bug: 4, fix: '    adapter.submitList(cache.toList())', why: 'The adapter already holds this exact list instance. Submitting the same reference is ignored, so pass a fresh copy.' },
        ],
        quiz: [
          { q: 'A contact changes name but keeps its id. What does DiffUtil report?', options: ['A remove and an insert', 'A change at that position', 'Nothing'], a: 1, why: 'Same id, so it is the same item. Different contents, so that one row is rebound.' },
          { q: 'Where does ListAdapter compute the diff by default?', options: ['On the main thread', 'On a background thread', 'During onDraw'], a: 1, why: 'AsyncListDiffer runs the diff on a background executor and applies the result on the main thread.' },
          { q: 'Why avoid <code>notifyDataSetChanged()</code> for a single edit?', options: ['It crashes on large lists', 'It rebinds every row and skips the animations', 'It is not allowed with ListAdapter'], a: 1, why: 'RecyclerView can’t tell what changed, so it treats everything as changed.' },
        ],
        visual(el) {
          let nextId = 5, byId = true, busy = false, binds = 4;
          const extras = ['Margaret', 'Barbara', 'Ken', 'Hedy', 'Radia', 'Dennis'];
          let list = [{ id: 1, name: 'Ada', star: false }, { id: 2, name: 'Grace', star: true }, { id: 3, name: 'Linus', star: false }, { id: 4, name: 'Alan', star: false }];
          const box = h('div', { class: 'vw-list' });
          const cb = h('div', { class: 'kt' });
          const sBind = stat('rows rebound', binds);
          const o = out('Submit a new list. Only the changes animate.');
          const keyOf = x => byId ? String(x.id) : `${x.id}|${x.name}|${x.star}`;
          const row = (x, cls) => h('div', { class: 'vw-row' + (cls ? ' ' + cls : '') },
            h('span', { class: 'vw-tag' }, `id ${x.id}`), h('span', {}, x.name),
            x.star ? h('span', { class: 'vw-tag vw-star' }, 'starred') : null);
          const paintCb = () => { cb.innerHTML = hl(byId ? 'areItemsTheSame = old.id == new.id' : 'areItemsTheSame = old == new  // whole object'); };
          box.append(...list.map(x => row(x)));
          paintCb();
          function lcs(a, b) {
            const m = a.map(() => b.map(() => 0));
            for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--)
              m[i][j] = a[i] === b[j] ? 1 + ((m[i + 1] || [])[j + 1] || 0) : Math.max((m[i + 1] || [])[j] || 0, m[i][j + 1] || 0);
            const keep = new Set(); let i = 0, j = 0;
            while (i < a.length && j < b.length) {
              if (a[i] === b[j]) { keep.add(a[i]); i++; j++; }
              else if (((m[i + 1] || [])[j] || 0) >= (m[i][j + 1] || 0)) i++; else j++;
            }
            return keep;
          }
          async function submit(next) {
            if (busy) return; busy = true;
            const oldK = list.map(keyOf), newK = next.map(keyOf);
            const removed = list.filter(x => !newK.includes(keyOf(x)));
            const inserted = new Set(next.filter(x => !oldK.includes(keyOf(x))).map(keyOf));
            const common = newK.filter(k => oldK.includes(k));
            const stay = lcs(oldK.filter(k => common.includes(k)), common);
            const oldBy = new Map(list.map(x => [keyOf(x), x]));
            const changed = new Set(next.filter(x => oldBy.has(keyOf(x)) && JSON.stringify(oldBy.get(keyOf(x))) !== JSON.stringify(x)).map(keyOf));
            const moved = new Set(common.filter(k => !stay.has(k)));
            [...box.children].forEach((r, i) => { if (removed.includes(list[i])) r.classList.add('leave'); });
            if (removed.length) await sleep(430);
            if (!el.isConnected) return;
            box.replaceChildren(...next.map(x => {
              const k = keyOf(x);
              if (inserted.has(k)) return row(x, 'vw-ins drop-in');
              if (changed.has(k)) return row(x, 'vw-chg pop');
              if (moved.has(k)) return row(x, 'vw-mov flip');
              return row(x);
            }));
            list = next;
            binds += inserted.size + changed.size; sBind.set(binds);
            const parts = [[inserted.size, 'insert'], [removed.length, 'remove'], [moved.size, 'move'], [changed.size, 'change']].filter(([c]) => c).map(([c, w]) => `${c} ${w}`);
            say(o, `DiffUtil: ${parts.join(', ') || 'no changes'} <span class="muted">// ${inserted.size + changed.size} row${inserted.size + changed.size === 1 ? '' : 's'} bound</span>` +
              (!byId && changed.size === 0 && removed.length && inserted.size ? ' <span class="bad">an edit became remove + insert</span>' : ''));
            await sleep(450);
            busy = false;
          }
          const sw = toggle('vw-diff-byid', 'Match items by <code>id</code>', true, () => {
            byId = sw.input.checked; paintCb(); replay(cb, 'pop-soft');
            say(o, byId ? 'Items match by id. An edit is a change.' : '<span class="bad">Items match by whole object.</span> Now try Star one.');
          });
          el.append(
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'RecyclerView'), box),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'ItemCallback'), cb, sw.el,
                h('p', { class: 'tip' }, 'Green: inserted. Orange: changed. Teal: moved.'))),
            h('div', { class: 'controls' },
              act('Add one', () => { if (list.length >= 7) { replay(box, 'shake'); return; } const next = list.slice(); next.splice(1, 0, { id: nextId, name: extras[(nextId - 5) % extras.length], star: false }); nextId++; submit(next); }),
              act('Remove one', () => { if (list.length <= 1) { replay(box, 'shake'); return; } submit(list.slice(0, -1)); }),
              act('Star one', () => { const i = Math.min(1, list.length - 1); submit(list.map((x, j) => j === i ? { ...x, star: !x.star } : x)); }),
              act('Move last to top', () => { if (list.length < 2) return; submit([list[list.length - 1], ...list.slice(0, -1)]); }),
              cmd('notifyDataSetChanged()', () => {
                if (busy) return;
                [...box.children].forEach(r => { r.className = 'vw-row'; replay(r, 'vw-all'); });
                binds += list.length; sBind.set(binds);
                say(o, `<span class="bad">all ${list.length} rows rebound</span> <span class="muted">// no item animations</span>`);
              })),
            h('div', { class: 'vw-stats' }, sBind),
            o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'fragments',
        title: 'Fragments and their two lifecycles',
        tagline: 'The Fragment outlives its view.',
        level: 'advanced',
        body: `
<p>A Fragment has two lifecycles. The Fragment object lives from <code>onCreate</code> to <code>onDestroy</code>. Its view lives from <code>onCreateView</code> to <code>onDestroyView</code>. When you replace a Fragment and add the transaction to the back stack, its view is destroyed but the Fragment stays. Press Back and it builds a brand new view.</p>
<p>So anything that touches views belongs to the view lifecycle. Observe with <code>viewLifecycleOwner</code>, launch with <code>viewLifecycleOwner.lifecycleScope</code>, and set the binding to null in <code>onDestroyView</code>. If you observe with <code>this</code>, every return from the back stack adds another observer, and the old ones hold on to dead views.</p>
<p>The <code>FragmentManager</code> runs transactions and keeps the back stack. Writing those transactions by hand gets messy fast. The Navigation component puts destinations and arguments in one graph and handles the back stack for you.</p>`,
        code: `class ProfileFragment : Fragment(R.layout.fragment_profile) {
    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!
    private val viewModel: ProfileViewModel by viewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        _binding = FragmentProfileBinding.bind(view)
        viewModel.user.observe(viewLifecycleOwner) { binding.name.text = it.name }
        binding.open.setOnClickListener { openDetail() }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null            // the view is gone, the Fragment is not
    }

    // By hand, with FragmentManager
    private fun openDetail() = parentFragmentManager.commit {
        setReorderingAllowed(true)
        replace<DetailFragment>(R.id.container)
        addToBackStack("detail")
    }
}

// With Navigation and a type-safe route
@Serializable data class Detail(val userId: Long)
findNavController().navigate(Detail(userId = 42))`,
        remember: 'A Fragment can outlive its view. Tie view work to viewLifecycleOwner and clear the binding in onDestroyView.',
        terms: [
          { term: 'onDestroyView', def: 'The Fragment callback where its view is torn down, for example when it goes onto the back stack, while the Fragment object stays alive.' },
          { term: 'FragmentManager', def: 'The class that adds, replaces and removes Fragments in transactions and keeps their back stack.' },
          { term: 'addToBackStack', def: 'A FragmentTransaction call that records the transaction so pressing Back reverses it.' },
          { term: 'Navigation component', def: 'A Jetpack library that describes destinations in a graph and runs Fragment transactions and the back stack for you.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Observe on the view lifecycle and drop the binding when the view goes away.', code: 'viewModel.user.observe([[viewLifecycleOwner]]) { binding.name.text = it.name }\n\noverride fun onDestroyView() {\n    super.onDestroyView()\n    _binding = [[null]]\n}', why: 'The observer stops with the view, and the Fragment stops holding a view tree it no longer shows.' },
          { type: 'bug', prompt: 'LeakCanary reports a leaked view tree every time this Fragment sits on the back stack. Tap the line.', code: 'private var _binding: FragmentProfileBinding? = null\nprivate val binding get() = _binding!!\n\noverride fun onViewCreated(view: View, savedInstanceState: Bundle?) {\n    _binding = FragmentProfileBinding.bind(view)\n}\n\noverride fun onDestroy() { super.onDestroy(); _binding = null }', bug: 7, fix: 'override fun onDestroyView() { super.onDestroyView(); _binding = null }', why: 'On the back stack the view is destroyed but <code>onDestroy</code> does not run, so the binding keeps the whole old view tree alive.' },
        ],
        quiz: [
          { q: 'Fragment A is replaced by B with <code>addToBackStack</code>. What happens to A?', options: ['A is destroyed completely', 'A’s view is destroyed, A stays created', 'Nothing, A stays resumed under B'], a: 1, why: 'A gets <code>onDestroyView</code> but not <code>onDestroy</code>. Back recreates its view.' },
          { q: 'A Fragment observes LiveData with <code>this</code> in <code>onViewCreated</code>. The user goes to B and back twice. How many observers now?', options: ['1', '2', '3'], a: 2, why: 'The Fragment never reached DESTROYED, so each new view adds one more observer.' },
        ],
        deeper: [
          {
            title: 'Rotation and process death rebuild the Fragment too',
            body: `<p>The back stack destroys only the view. A configuration change goes further: the Activity is recreated, and its FragmentManager creates brand new Fragment objects for every Fragment it had. Their ViewModels survive. After process death even the ViewModels are new, and only the <code>arguments</code> Bundle and the saved state come back.</p>
<p>So a field you set on the Fragment by hand, or a constructor parameter, is gone after rotation. Put inputs in <code>arguments</code> and screen state in a ViewModel with a <code>SavedStateHandle</code>.</p>`,
            visual(el) {
              const nt = t => `<span class="muted">// ${t}</span>`;
              const addr = () => '@' + (0x1000 + Math.floor(Math.random() * 0xefff)).toString(16);
              const PARTS = [
                { k: 'frag', name: 'ProfileFragment' },
                { k: 'view', name: 'its View' },
                { k: 'vm', name: 'ProfileViewModel' },
                { k: 'args', name: 'arguments', fixed: 'userId = 42' },
              ];
              const PLAN = {
                back: { label: 'go to B, then press Back', fresh: ['view'], tail: 'Only the view was rebuilt. The Fragment and its fields stayed.' },
                rot: { label: 'rotate', fresh: ['frag', 'view'], tail: 'New Fragment and view. The ViewModel came from the store, the arguments from the saved Bundle.' },
                death: { label: 'process death, then return', fresh: ['frag', 'view', 'vm'], tail: 'Everything in memory is new. The arguments and saved state came back from the Bundle.' },
              };
              let busy = false;
              const o = out('Pick an event. Orange means a new object, teal means the same one.');
              const cards = PARTS.map(p => {
                const val = h('span', { class: 'obj-addr' }, p.fixed || addr());
                const t = h('span', { class: 'vw-tag' }, 'live');
                const box = h('div', { class: 'obj' }, h('span', { class: 'obj-name' }, p.name), val, t);
                return Object.assign(p, { val, t, box });
              });
              async function run(key) {
                if (busy) return; busy = true;
                const plan = PLAN[key];
                say(o, nt(plan.label));
                for (const c of cards) {
                  const fresh = plan.fresh.includes(c.k);
                  if (fresh) { c.val.textContent = addr(); c.box.className = 'obj vw-new'; replay(c.box, 'drop-in'); c.t.textContent = 'new'; c.t.className = 'vw-tag vw-tnew'; }
                  else { c.box.className = 'obj vw-kept'; replay(c.box, 'pop'); c.t.textContent = c.k === 'args' && key !== 'back' ? 'restored' : 'same'; c.t.className = 'vw-tag vw-tkept'; }
                  await sleep(300);
                  if (!el.isConnected) return;
                }
                o.append(h('div', { class: 'line drop-in' }, plan.tail));
                busy = false;
              }
              el.append(
                h('div', { class: 'vw-objs' }, cards.map(c => c.box)),
                h('div', { class: 'controls' }, Object.entries(PLAN).map(([k, p]) => act(p.label, () => run(k)))),
                o);
            },
          },
          {
            title: 'Pick the ViewModel’s scope on purpose',
            body: `<p><code>by viewModels()</code> scopes the ViewModel to this Fragment. <code>by activityViewModels()</code> scopes it to the Activity, so every Fragment in it gets the same instance. With Navigation, <code>navGraphViewModels(R.id.checkout)</code> shares one across the screens of a nested graph and clears it when the user leaves that graph.</p>
<p>A list and a detail screen that share a selection need the wider scope. Try both: select an item, then open the detail.</p>`,
            code: `class ListFragment : Fragment() {
    private val shared: SelectionViewModel by activityViewModels()
    fun onPick(id: Long) = shared.select(id)
}

class DetailFragment : Fragment() {
    private val shared: SelectionViewModel by activityViewModels()   // same instance
}`,
            visual(el) {
              const nt = t => `<span class="muted">// ${t}</span>`;
              let scope = 'activity', busy = false, picked = null, onDetail = false;
              const stores = { act: h('div', { class: 'vw-store' }), list: h('div', { class: 'vw-store' }), detail: h('div', { class: 'vw-store' }) };
              const LABEL = { act: 'Activity store', list: 'ListFragment store', detail: 'DetailFragment store' };
              const o = out();
              const vm = (sel, who) => h('div', { class: 'obj drop-in' }, h('span', { class: 'obj-name' }, 'SelectionViewModel'), h('span', { class: 'field' }, 'selected = ', h('b', {}, sel || 'null')), h('span', { class: 'obj-addr' }, who));
              const where = () => (scope === 'activity' ? 'act' : 'list');
              function paint() {
                Object.entries(stores).forEach(([k, s]) => s.replaceChildren(h('span', { class: 'vw-label' }, LABEL[k])));
                stores[where()].append(vm(picked, scope === 'activity' ? 'used by List and Detail' : 'used by ListFragment'));
                if (onDetail && scope === 'fragment') stores.detail.append(vm(null, 'a second instance'));
              }
              const btns = {};
              const setScope = v => {
                if (busy) return;
                scope = v; picked = null; onDetail = false;
                Object.entries(btns).forEach(([k, b]) => b.setAttribute('aria-pressed', String(k === v)));
                paint();
                say(o, v === 'activity' ? 'Both Fragments use by activityViewModels().' : 'Both Fragments use by viewModels().');
              };
              btns.activity = cmd('by activityViewModels()', () => setScope('activity'));
              btns.fragment = cmd('by viewModels()', () => setScope('fragment'));
              function pick() {
                if (busy) return;
                picked = 'Grace'; onDetail = false; paint();
                say(o, `${hl('shared.select("Grace")')}  ${nt(`stored in the ${LABEL[where()]}`)}`);
              }
              async function open() {
                if (busy) return; busy = true;
                onDetail = true; paint();
                say(o, nt('DetailFragment asks for SelectionViewModel'));
                await sleep(450);
                if (!el.isConnected) return;
                if (scope === 'activity') { replay(stores.act, 'pop'); o.append(h('div', { class: 'line drop-in', html: picked ? '<span class="good">same instance:</span> Detail shows Grace' : 'same instance, but nothing is selected yet' })); }
                else { replay(stores.detail, 'shake'); o.append(h('div', { class: 'line drop-in', html: '<span class="bad">new instance:</span> selected = null. Detail has nothing to show.' })); }
                busy = false;
              }
              setScope('activity');
              say(o, 'Select Grace in the list, then open the detail.');
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'vw-label' }, 'scope'), btns.activity, btns.fragment),
                h('div', { class: 'vw-stores' }, stores.act, stores.list, stores.detail),
                h('div', { class: 'controls' }, cmd('ListFragment: select("Grace")', pick), cmd('navigate to DetailFragment', open)),
                o);
            },
          },
          {
            title: 'Pages in a ViewPager2 stop at STARTED',
            body: `<p><code>FragmentStateAdapter</code> keeps neighbour pages alive, but it caps every page except the current one at STARTED with <code>setMaxLifecycle</code>. Only the visible page reaches RESUMED.</p>
<p>So <code>onResume</code> means “this page is the one on screen”. Log a page view or start a video there, not in <code>onViewCreated</code>, which runs for pages the user hasn’t seen yet.</p>`,
            code: `class ArticlePageFragment : Fragment(R.layout.page_article) {
    override fun onResume() {
        super.onResume()
        analytics.pageView(requireArguments().getLong("id"))   // only the visible page
    }
}

binding.pager.adapter = object : FragmentStateAdapter(this) {
    override fun getItemCount() = ids.size
    override fun createFragment(position: Int) =
        ArticlePageFragment().apply { arguments = bundleOf("id" to ids[position]) }
}`,
          },
        ],
        underHood: {
          body: `<p>When the Activity saves state, the FragmentManager writes a record for each Fragment: its class name, its <code>arguments</code>, its saved state and its place in the back stack. After a rotation or process death, it rebuilds each one from that record through a <code>FragmentFactory</code>. The default factory calls the no-argument constructor by reflection, which is why a Fragment must have one unless you install your own factory.</p>
<p><code>viewLifecycleOwner</code> is a separate object, created fresh in each <code>onCreateView</code> and moved to DESTROYED just before <code>onDestroyView</code>. LiveData and <code>repeatOnLifecycle</code> tied to it stop at that moment, which is what keeps them off dead views.</p>`,
          code: `class AppFragmentFactory(private val repo: ProfileRepository) : FragmentFactory() {
    override fun instantiate(classLoader: ClassLoader, className: String): Fragment =
        when (loadFragmentClass(classLoader, className)) {
            ProfileFragment::class.java -> ProfileFragment(repo)
            else -> super.instantiate(classLoader, className)
        }
}

// Set it before super.onCreate, so restored Fragments use it too
supportFragmentManager.fragmentFactory = AppFragmentFactory(repo)
super.onCreate(savedInstanceState)`,
        },
        mistakes: [
          {
            title: 'Adding the first Fragment on every onCreate',
            bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    supportFragmentManager.commit { add<HomeFragment>(R.id.container) }
}`,
            good: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (savedInstanceState == null) {
        supportFragmentManager.commit { add<HomeFragment>(R.id.container) }
    }
}`,
            why: 'After rotation the FragmentManager has already restored HomeFragment. Adding it again stacks a second copy on top.',
          },
          {
            title: 'Passing data through the constructor',
            bad: `class DetailFragment(private val userId: Long) : Fragment()

replace(R.id.container, DetailFragment(42))`,
            good: `class DetailFragment : Fragment() {
    private val userId get() = requireArguments().getLong("userId")
}
replace<DetailFragment>(R.id.container, args = bundleOf("userId" to 42L))`,
            why: 'On recreation the default factory calls a no-argument constructor, so this crashes with <code>Fragment.InstantiationException</code>. Arguments are saved and restored for you.',
          },
          {
            title: 'Touching views from the Fragment’s own scope',
            bad: `lifecycleScope.launch {
    val user = repo.load()
    binding.name.text = user.name
}`,
            good: `viewLifecycleOwner.lifecycleScope.launch {
    val user = repo.load()
    binding.name.text = user.name
}`,
            why: 'If the user moves on before <code>load()</code> returns, the view is gone but the Fragment scope is still alive, and <code>binding</code> throws. The view scope is cancelled with the view.',
          },
        ],
        visual(el) {
          let useView = true, busy = false, onB = false, observers = 1, aViewGen = 1;
          const log = h('div', { class: 'vw-log', 'aria-live': 'polite' });
          const line = (txt, cls) => { log.append(h('div', { class: cls ? cls + ' drop-in' : 'drop-in' }, txt)); while (log.children.length > 7) log.firstElementChild.remove(); };
          const chip = (txt, cls) => h('span', { class: 'vw-s' + (cls ? ' ' + cls : '') }, txt);
          const stack = h('div', { class: 'vw-stack' });
          const sObs = stat('observers on A', observers);
          const sGen = stat('A views built', aViewGen);
          const frag = (name, fState, vState, top, extra) => h('div', { class: 'vw-frag' + (top ? ' vw-top' : '') },
            h('span', { class: 'vw-frag-name' }, name),
            h('div', { class: 'vw-st' }, 'Fragment', chip(fState[0], fState[1])),
            h('div', { class: 'vw-st' }, 'View', chip(vState[0], vState[1])),
            extra || null);
          function paint() {
            const a = onB
              ? frag('ProfileFragment (A)', ['CREATED', 'vw-mid'], ['destroyed', 'vw-dead'], false)
              : frag('ProfileFragment (A)', ['RESUMED'], [`RESUMED #${aViewGen}`], true);
            const kids = onB ? [frag('DetailFragment (B)', ['RESUMED'], ['RESUMED'], true, h('span', { class: 'vw-note' }, 'top of the back stack')), a] : [a];
            stack.replaceChildren(...kids);
            sObs.classList.toggle('vw-bad', observers > 1 || (onB && !useView && observers > 0));
          }
          paint();
          line('A.onCreate', 'muted'); line('A.onCreateView, onViewCreated #1'); line('  observe(' + (useView ? 'viewLifecycleOwner' : 'this') + ')', 'good');
          async function step(lines) {
            for (const [t, c, fn] of lines) { line(t, c); if (fn) fn(); await sleep(330); if (!el.isConnected) return false; }
            return true;
          }
          async function push() {
            if (busy) return; if (onB) { replay(stack, 'shake'); line('B is already on top', 'muted'); return; }
            busy = true; log.replaceChildren();
            const ok = await step([
              ['replace(B).addToBackStack("detail")', 'muted'],
              ['B.onCreate, onCreateView, onViewCreated'],
              ['A.onPause, onStop'],
              ['A.onDestroyView', 'bad', () => { onB = true; if (useView) observers = 0; sObs.set(observers); paint(); }],
              [useView ? '  observer removed with the view' : `  ${observers} observer${observers > 1 ? 's' : ''} still attached to a dead view`, useView ? 'good' : 'bad'],
              ['B.onStart, onResume'],
            ]);
            if (ok) busy = false;
          }
          async function pop() {
            if (busy) return; if (!onB) { replay(stack, 'shake'); line('back stack is empty: Back would finish the Activity', 'muted'); return; }
            busy = true; log.replaceChildren();
            const ok = await step([
              ['popBackStack()', 'muted'],
              ['B.onPause, onStop'],
              [`A.onCreateView, onViewCreated #${aViewGen + 1}`, null, () => { aViewGen++; sGen.set(aViewGen); }],
              [`  observe(${useView ? 'viewLifecycleOwner' : 'this'})`, useView ? 'good' : 'bad', () => { observers++; sObs.set(observers); }],
              ['B.onDestroyView, onDestroy', null, () => { onB = false; paint(); }],
              ['A.onStart, onResume'],
              [useView ? `  1 observer, on view #${aViewGen}` : `  ${observers} observers: each update runs ${observers} times`, useView ? 'good' : 'bad'],
            ]);
            if (ok) busy = false;
          }
          const sw = toggle('vw-frag-owner', 'Observe with <code>viewLifecycleOwner</code>', true, () => {
            useView = sw.input.checked;
            line(`next observe uses ${useView ? 'viewLifecycleOwner' : 'this (the Fragment)'}`, useView ? 'good' : 'bad');
          });
          el.append(
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'Back stack, top first'), stack),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'Callbacks'), log)),
            sw.el,
            h('div', { class: 'controls' },
              cmd('commit { replace<DetailFragment>(...) }', push),
              cmd('popBackStack()', pop)),
            h('div', { class: 'vw-stats' }, sObs, sGen),
            h('p', { class: 'tip' }, 'Turn the switch off, then go to B and back a few times.'));
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'compose-in-views',
        title: 'Compose inside Views',
        tagline: 'Drop a ComposeView into an existing screen.',
        level: 'intermediate',
        body: `
<p><code>ComposeView</code> is a regular Android View that hosts a composition. Put it in an XML layout or create it in code, then call <code>setContent { }</code>. Inside, everything is normal Compose: state, theming and <code>collectAsStateWithLifecycle</code>.</p>
<p>A ComposeView has to know when to dispose its composition. The default strategy disposes as soon as the view leaves the window, unless it sits in a pooling container like RecyclerView. In a Fragment, pass <code>DisposeOnViewTree&shy;LifecycleDestroyed</code> to <code>setViewCompositionStrategy</code>, so the composition lives exactly as long as the Fragment’s view.</p>
<p>This is how most teams migrate. Start with one leaf, like a rating bar or a list row. Then move whole screens: the Fragment returns a ComposeView and the screen becomes one composable. When every screen is Compose, replace the Fragments with Navigation Compose.</p>`,
        code: `// A whole screen: the Fragment stays, its view is Compose
class SettingsFragment : Fragment() {
    private val viewModel: SettingsViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?,
    ): View = ComposeView(requireContext()).apply {
        setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)
        setContent {
            AppTheme {
                val state by viewModel.state.collectAsStateWithLifecycle()
                SettingsScreen(state, onToggle = viewModel::toggle)
            }
        }
    }
}

// One piece of an XML screen:
// <androidx.compose.ui.platform.ComposeView android:id="@+id/rating" ... />
binding.rating.apply {
    setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)
    setContent { AppTheme { RatingBar(stars = 4) } }
}`,
        remember: 'ComposeView hosts Compose in a View. In a Fragment, dispose with the view lifecycle.',
        terms: [
          { term: 'ComposeView', def: 'An Android View that hosts a Compose composition, set with setContent.' },
          { term: 'ViewCompositionStrategy', def: 'The rule that decides when a ComposeView disposes its composition, such as on detach or when its lifecycle is destroyed.' },
          { term: 'Incremental migration', def: 'Moving a View-based app to Compose one component or screen at a time while both systems run side by side.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Return a Compose screen from a Fragment.', code: 'override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View =\n    [[ComposeView]](requireContext()).apply {\n        setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)\n        [[setContent]] { AppTheme { SettingsScreen() } }\n    }', why: '<code>ComposeView</code> is the View, <code>setContent</code> gives it the composable to show.' },
          { type: 'bug', prompt: 'This ComposeView sits in a Fragment. Its remembered state resets whenever the view is detached, even though the Fragment’s view is still alive. Tap the line.', code: 'override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View =\n    ComposeView(requireContext()).apply {\n        setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnDetachedFromWindow)\n        setContent { AppTheme { SettingsScreen() } }\n    }', bug: 2, fix: '        setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)', why: 'Detaching disposes the composition under this strategy. Following the view tree lifecycle keeps it until <code>onDestroyView</code>.' },
        ],
        quiz: [
          { q: 'What is <code>ComposeView</code>?', options: ['A composable that wraps Views', 'A View that hosts a composition', 'A Fragment subclass'], a: 1, why: 'It extends View, so it fits anywhere a View fits: XML, a ViewGroup, or a Fragment’s onCreateView.' },
          { q: 'Which strategy fits a ComposeView that is a Fragment’s view?', options: ['<code>DisposeOnDetachedFromWindow</code>', '<code>DisposeOnViewTreeLifecycleDestroyed</code>', 'None, it never disposes'], a: 1, why: 'The composition then ends with the Fragment’s view lifecycle, in onDestroyView.' },
          { q: 'What is a good first step in a migration?', options: ['Rewrite every screen at once', 'Convert one small component or a new screen', 'Replace Fragments with Navigation Compose first'], a: 1, why: 'Small steps keep the app shippable. Navigation Compose comes last, once the screens are Compose.' },
        ],
        visual(el) {
          const strategies = [
            { id: 'default', label: 'DisposeOnDetachedFromWindowOrReleasedFromPool', onDetach: true },
            { id: 'lifecycle', label: 'DisposeOnViewTreeLifecycleDestroyed', onDetach: false },
          ];
          let strat = strategies[0], count = 3, alive = true, attached = true, viewUp = true, busy = false;
          const num = h('span', { class: 'vw-count' }, String(count));
          const plus = h('button', { class: 'btn small primary', type: 'button', onclick() {
            if (!alive || !attached) { replay(cv, 'shake'); return; }
            count++; num.textContent = String(count); replay(num, 'pop');
          } }, 'count++');
          const cvName = h('span', { class: 'vw-cv-name' }, 'ComposeView');
          const cvNote = h('span', { class: 'vw-note' }, 'remember { count }');
          const cv = h('div', { class: 'vw-cv' }, cvName, num, plus, cvNote);
          const screen = h('div', { class: 'vw-screen' }, h('div', { class: 'vw-bar' }, 'Settings', h('small', {}, 'XML')), cv);
          const o = out();
          const btns = strategies.map(s => cmd(s.label, () => {
            if (busy) return;
            strat = s; btns.forEach((b, i) => b.setAttribute('aria-pressed', String(strategies[i] === s)));
            say(o, `strategy: ${s.label}`);
          }, { 'aria-pressed': String(s === strat) }));
          const paint = () => {
            cv.classList.toggle('vw-off', !alive || !attached);
            cvName.textContent = !viewUp ? 'view destroyed' : !attached ? (alive ? 'detached, composition kept' : 'detached, disposed') : 'ComposeView';
            num.textContent = alive ? String(count) : '-';
          };
          function dispose() { alive = false; }
          function compose() { if (!alive) { alive = true; count = 0; } }
          const detachBtn = act('Detach from window', () => {
            if (busy || !viewUp) return;
            if (attached) {
              attached = false;
              if (strat.onDetach) { dispose(); say(o, '<span class="bad">detached: composition disposed</span>, the count is gone'); }
              else say(o, '<span class="good">detached: composition kept</span> <span class="muted">// the view lifecycle is still alive</span>');
              detachBtn.textContent = 'Attach again';
            } else {
              attached = true; compose();
              say(o, count === 0 ? '<span class="bad">attached: new composition</span>, count starts at 0' : `<span class="good">attached:</span> same composition, count is still ${count}`);
              detachBtn.textContent = 'Detach from window';
            }
            paint(); replay(cv, 'pop-soft');
          });
          const destroyBtn = act('Fragment onDestroyView', async () => {
            if (busy) return; busy = true;
            if (viewUp) {
              viewUp = false; attached = false; dispose();
              say(o, 'onDestroyView: <span class="good">composition disposed</span> under both strategies');
              destroyBtn.textContent = 'Back: onCreateView';
            } else {
              viewUp = true; attached = true; compose();
              say(o, 'onCreateView: a new ComposeView and a new composition');
              destroyBtn.textContent = 'Fragment onDestroyView';
            }
            detachBtn.textContent = 'Detach from window';
            paint(); replay(cv, 'pop-soft');
            await sleep(300); busy = false;
          });
          paint();
          say(o, 'Bump the count, then detach the view under each strategy.');
          // migration strip
          const names = ['Settings', 'Profile', 'Search', 'Detail', 'Home'];
          let migrated = 1;
          const scrs = names.map((n, i) => h('div', { class: 'vw-scr' + (i < migrated ? ' vw-done' : '') }, n, h('small', {}, i < migrated ? 'Compose' : 'XML')));
          const o2 = out('1 of 5 screens in Compose. Each one ships on its own.');
          const migrate = act('Migrate next screen', () => {
            if (migrated >= names.length) {
              scrs.forEach(s => replay(s, 'pop'));
              say(o2, '<span class="good">all Compose:</span> swap the Fragments for Navigation Compose, then drop the View deps');
              return;
            }
            const s = scrs[migrated];
            s.classList.add('vw-done'); s.lastElementChild.textContent = 'Compose'; replay(s, 'flip');
            migrated++;
            say(o2, `${migrated} of ${names.length} screens in Compose <span class="muted">// ${names[migrated - 1]}Fragment now returns a ComposeView</span>`);
          });
          el.append(
            h('div', { class: 'vw-split' }, screen,
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'setViewCompositionStrategy'), h('div', { class: 'vw-strats' }, btns),
                h('div', { class: 'controls' }, detachBtn, destroyBtn))),
            o,
            h('span', { class: 'vw-label' }, 'Migrating screen by screen'),
            h('div', { class: 'vw-screens' }, scrs),
            h('div', { class: 'controls' }, migrate),
            o2);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'android-view',
        title: 'Views inside Compose',
        tagline: 'Wrap a View you can’t rewrite yet.',
        level: 'advanced',
        body: `
<p>Some Views have no Compose version yet, or are too big to rewrite now: a map, an ad, a video player, an in-house chart. <code>AndroidView</code> puts one inside a composable.</p>
<p>It takes two lambdas with different jobs. <code>factory</code> creates the View once, when <code>AndroidView</code> enters the composition. <code>update</code> runs right after that and again whenever state it reads changes. Put one-time setup in <code>factory</code> and anything driven by state in <code>update</code>. A value you only set in <code>factory</code> never changes again.</p>
<p>Clean up in <code>onRelease</code>, which runs when the View leaves the composition. In a lazy list, pass <code>onReset</code> too, so the View can be reused for another item instead of being thrown away. For a whole XML layout, <code>AndroidViewBinding</code> inflates it through its binding class. Also keep the View inside the composable. Don’t store it in a ViewModel, because that leaks the Activity context.</p>`,
        code: `@Composable
fun SpeedGauge(speed: Int, modifier: Modifier = Modifier) {
    AndroidView(
        factory = { context ->
            GaugeView(context).apply { maxValue = 200 }   // once
        },
        update = { gauge ->
            gauge.value = speed                            // every time speed changes
        },
        onRelease = { gauge -> gauge.stopAnimations() },   // left the composition
        modifier = modifier.size(160.dp),
    )
}

// A whole XML layout, through its binding (ui-viewbinding)
@Composable
fun LegacyBanner(title: String) {
    AndroidViewBinding(BannerBinding::inflate) {
        bannerTitle.text = title                           // runs like update
    }
}`,
        remember: 'factory builds the View once. update pushes state into it. onRelease cleans up.',
        terms: [
          { term: 'AndroidView', def: 'A composable that creates an Android View with factory and keeps it in sync with state through update.' },
          { term: 'AndroidView update', def: 'The AndroidView lambda that runs after the View is created and again whenever the state it reads changes.' },
          { term: 'AndroidViewBinding', def: 'A composable from ui-viewbinding that inflates an XML layout through its generated binding class.' },
          { term: 'onRelease', def: 'The AndroidView callback that runs when the View leaves the composition for good, the place to free its resources.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Create the gauge once, and push the speed into it on every change.', code: 'AndroidView(\n    [[factory]] = { context -> GaugeView(context) },\n    [[update]] = { gauge -> gauge.value = speed },\n)', why: '<code>factory</code> runs once per entry into the composition. <code>update</code> reruns when <code>speed</code> changes.' },
          { type: 'bug', prompt: 'The gauge shows the first speed and never moves after that. Tap the line.', code: '@Composable\nfun SpeedGauge(speed: Int) {\n    AndroidView(\n        factory = { context -> GaugeView(context).apply { value = speed } },\n        modifier = Modifier.size(160.dp),\n    )\n}', bug: 3, fix: '        factory = { context -> GaugeView(context) }, update = { it.value = speed },', why: '<code>factory</code> runs only once, so the View never sees a new speed. State that changes belongs in <code>update</code>.' },
        ],
        quiz: [
          { q: '<code>speed</code> changes from 40 to 60. Which lambda runs?', options: ['<code>factory</code>', '<code>update</code>', 'Both'], a: 1, why: 'The View already exists. Only <code>update</code> reruns, because it read <code>speed</code>.' },
          { q: 'Where should you stop a View’s animations or listeners?', options: ['In <code>factory</code>', 'In <code>onRelease</code>', 'In <code>update</code>'], a: 1, why: '<code>onRelease</code> runs when the View leaves the composition for good.' },
          { q: 'Why not keep the View instance in a ViewModel?', options: ['Views are not Parcelable', 'It holds an Activity context and leaks it across rotation', 'Compose forbids it at compile time'], a: 1, why: 'A ViewModel outlives the Activity, and every View points at the context it was created with.' },
        ],
        visual(el) {
          let speed = 40, viewVal = 40, inComp = true, inFactory = false, inst = 1, nF = 1, nU = 1, nR = 0, busy = false;
          const sF = stat('factory', nF), sU = stat('update', nU), sR = stat('onRelease', nR);
          const stateNum = h('span', { class: 'vw-big' }, String(speed));
          const comp = h('div', { class: 'vw-card' }, h('span', { class: 'vw-card-title', html: hl('var speed by remember') }), stateNum, h('span', { class: 'vw-note' }, 'Compose state'));
          const fill = h('span', { style: `width:${viewVal / 2}%` });
          const vTitle = h('span', { class: 'vw-card-title' });
          const vVal = h('span', { class: 'vw-note' });
          const view = h('div', { class: 'vw-card' }, vTitle, h('div', { class: 'vw-gauge' }, fill), vVal);
          const lam = h('div', { class: 'kt' });
          const o = out('Change the speed. Only update runs.');
          const paint = () => {
            stateNum.textContent = String(speed);
            vTitle.textContent = inComp ? `GaugeView #${inst}` : `GaugeView #${inst} (released)`;
            vVal.textContent = inComp ? `value = ${viewVal}` : 'detached';
            fill.style.width = `${viewVal / 2}%`;
            view.classList.toggle('vw-gone', !inComp);
            view.classList.toggle('vw-stale', inComp && viewVal !== speed);
            lam.innerHTML = hl(inFactory
              ? 'factory = { GaugeView(it).apply { value = speed } }\n// no update'
              : 'factory = { GaugeView(it) }\nupdate = { it.value = speed }');
          };
          paint();
          async function change(d) {
            if (busy) return; busy = true;
            speed = Math.max(0, Math.min(200, speed + d));
            replay(stateNum, 'pop'); paint();
            await sleep(250);
            if (!el.isConnected) return;
            if (!inComp) say(o, `speed = ${speed} <span class="muted">// no AndroidView in the composition</span>`);
            else if (inFactory) { replay(view, 'shake'); say(o, `recomposed, <span class="bad">nothing reached the View</span> <span class="muted">// factory already ran, value is still ${viewVal}</span>`); }
            else { viewVal = speed; nU++; sU.set(nU); replay(view, 'pop-soft'); say(o, `<span class="good">update</span> ran: gauge.value = ${speed} <span class="muted">// same View instance #${inst}</span>`); }
            paint(); busy = false;
          }
          async function showHide() {
            if (busy) return; busy = true;
            if (inComp) {
              inComp = false; nR++; sR.set(nR); replay(view, 'pop-soft');
              say(o, `if (showGauge) is false: <span class="good">onRelease</span> ran, View #${inst} is gone`);
              tgl.textContent = 'showGauge = true';
            } else {
              inComp = true; inst++; nF++; sF.set(nF); viewVal = speed;
              if (!inFactory) { nU++; sU.set(nU); }
              replay(view, 'drop-in');
              say(o, `<span class="good">factory</span> built View #${inst}${inFactory ? '' : ', then update set value'} = ${speed}`);
              tgl.textContent = 'showGauge = false';
            }
            paint(); await sleep(300); busy = false;
          }
          const tgl = cmd('showGauge = false', showHide);
          const sw = toggle('vw-av-factory', 'Set <code>value</code> only in <code>factory</code> (the bug)', false, () => {
            inFactory = sw.input.checked; paint(); replay(lam, 'pop-soft');
            say(o, inFactory ? '<span class="bad">No update lambda.</span> Change the speed now.' : 'update is back. The next change syncs the View.');
          });
          el.append(
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'Composable'), comp),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'Android View'), view)),
            lam, sw.el,
            h('div', { class: 'controls' },
              cmd('speed += 20', () => change(20)),
              cmd('speed -= 20', () => change(-20)),
              tgl),
            h('div', { class: 'vw-stats' }, sF, sU, sR),
            o);
        },
      },
    ],
  });
})();
