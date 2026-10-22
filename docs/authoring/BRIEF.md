# Writing lessons for Android Lab

The site teaches people who have NEVER programmed, from zero to Android developer. Knowledge builds step by step. The reader must never feel overwhelmed; it should be an enjoyable learning experience.

Lessons live in tracks/*.js. The curriculum (lesson order for the whole site, what each lesson teaches, what each
stage may assume) is docs/curriculum.md. Read its "Rules every lesson follows" first. They are binding.
Site-wide versions, story names and per-stage notes: docs/authoring/conventions.md.

## Quality bar: read these first
The finished tracks `start` (First steps) and `kotlin` are the standard. Dump any lesson with:
  node tools/peek.js <track> <lessonId>
Read at least start.program, start.errors, kotlin.val, kotlin.if, kotlin.lists, kotlin.classes. Look at their source in
tracks/start.js and tracks/kotlin.js to see how `visual`, `play`, `goals`, `introduces` are written.
The visual kit is documented in the header of js/ui.js (phone, timeline, graph, flow, codeStepper, terminal, player).

## What the reader already knows
Everything the curriculum lists before your lessons in the stages your stage assumes, plus earlier lessons of your
own track. Nothing else. For non-optional earlier tracks, read their finished lessons if you need to see exactly what
was taught.

## Lesson object (all fields required unless marked optional)
{
  id, title, tagline,            // from the curriculum line (you may refine the title/tagline wording)
  goals: [...],                  // 2-3 short lines starting with a verb: what the reader can do afterwards
  level: 'beginner' | 'intermediate',
  introduces: [...],             // code words/commands/symbols this lesson TEACHES first, exactly as written in code
                                 // (e.g. ['git init'] is wrong: use the separate words that appear, like ['init']). Only
                                 // list words a later lesson would use as code; plain English words don't go here.
                                 // Never list everyday words that earlier lessons already use as names (size,
                                 // item, key, type, end, string...): run prereq.js on the WHOLE site, not just your track.
  body,                          // HTML, 3 short paragraphs (sometimes 4). Start with WHY: one real situation.
  visual(el) { Lab.ui.<component>(el, {...}) },   // a kit demo with predict-first, 4-8 frames, a `say` on every frame
  code,                          // a short realistic example (Kotlin, or shell commands for tools), comments show results
  play (optional),               // Kotlin tracks only: a complete program with fun main() for the Kotlin Playground
  remember,                      // one line
  mistakes (optional, 0-1),      // [{ title, bad, good, why }]
  terms,                         // 1-4 [{ term, def }]; def is HTML (use <code>)
  challenges,                    // exactly 2: { type:'blank', prompt, code:'... [[answer]] ...', why } and
                                 //   { type:'bug', prompt, code, bug: <0-based line>, fix: '<the corrected line>', why }
                                 //   the bug fix must be ONE line that really fixes it
  quiz,                          // 2-3 [{ q, options, a, why }]
  docs: [['Title', 'https://...']],   // 1-2 official links (git-scm.com, docs.github.com, kotlinlang.org,
                                      // developer.android.com...). Fetch each with WebFetch to confirm it exists.
}
No deeper / underHood. One idea per lesson; depth comes in its own later lesson.

## Hard rules
- Common traps: the Kotlin track never taught `"\n"`, `forEach`, looping over a map, `if` without braces, or
  `readln`. Avoid them, or teach them in the lesson that first needs them.
- Use ONLY what earlier lessons taught plus this lesson's idea, everywhere: body, demo (code, commands, captions),
  code, challenges, quiz, mistakes. If an example needs something not taught yet, change the example. No "you'll
  learn this later" in the main path. Explain every new symbol and word the first time, in plain words.
- In HTML inside JS template literals, escape `${` as `\${`.
- Every output, error message and quiz answer must be exactly what the real tool prints. You can run things here:
  use real git (make a throwaway repo in a temp folder, set user.name/email locally, and copy the real
  output; keep hashes short and plausible). Kotlin compiler messages are written with a capital first letter, as
  in the kotlin track ("Unresolved reference 'x'."), even though the command-line compiler prints them lowercase. For Kotlin, find a kotlinc with
  any kotlinc 2.x (the site's outputs were made with kotlinc 2.2.20 + kotlinx-coroutines-core-jvm). Shorten output only by cutting lines, never by
  rewording, and say so in a caption if it matters.
- Neutral international examples (names like Ada, Sam, Lin; cities like Lisbon, Oslo). No Turkish, no real brands
  other than the tools being taught (Git, GitHub, Android Studio...), no job-interview framing. Friendly, never
  condescending; no "simply", "just", "obviously".
- Track CSS: any class you add must use the track's existing prefix (look at the css string), never `ui-`.

## Where to write and how to check
Edit the lesson objects in tracks/<file>.js directly. Then:
1. node tools/catalog.js
2. node tools/prereq.js   (whole site; must print "OK: nothing used before it is taught.")
3. python3 tools/check_track.py . <trackId>   (needs Playwright + Chromium; must print "OK: no problems")
4. Screenshot demos at 400px dark and look at them: STEPS=4 python3 tools/shots.py <outdir> <track.lesson> ...
5. Re-read your lessons as a complete beginner who knows only the earlier lessons, and fix anything confusing.
6. Have someone (or a separate reviewer) follow docs/authoring/REVIEW.md, then apply fixes with docs/authoring/FIX.md.
