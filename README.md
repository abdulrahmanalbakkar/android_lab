# Android Lab

Interactive lessons for Kotlin and Android. Each lesson has an animated demo, a one-line rule to remember, practice challenges, and a quiz that comes back on a spaced-review schedule.

Plain HTML, CSS and JavaScript, no dependencies. The only build-like step is `node tools/catalog.js` after editing a track. Serve the folder (for example `python3 -m http.server`) to try it locally; lessons load on demand, and offline support needs http(s).

Live at https://abdulrahmanalbakkar.github.io/android_lab/

## Features

- **Roadmap** (`#home`): numbered stages from Programming basics to Problem solving, each topic one row with its lesson count and progress. Optional topics and projects are labelled, and finished stages fold to their heading.
- **Track pages** (`#<track>`) and **lesson pages** (`#<track>.<lesson>`): demo, code, "Pin this" rule, optional Go deeper / Under the hood / Common mistakes, practice, terms and a quiz.
- **Capstone projects**: guided builds shown as a double-bordered card at the end of their stage. A project page shows "What you'll build" and its steps; each step links the lessons to review first.
- **Test yourself** (`#practice`; old `#interview` links redirect): timed, mixed-topic questions drawn from every quiz. Pick topics or a preset, 10/20/30 questions and no limit, 30 s or 60 s per question. Results show a per-topic breakdown, explanations for every miss, and a button that adds the misses to Review. Best scores are kept per setup.
- **Spaced review** (`#review`): quiz questions come back after 1, 3, 7, 21 and 60 days while you keep getting them right.
- **Search** (`/`) across tracks, projects, lessons and glossary terms, and a **glossary** (`#glossary`).
- **Keyboard**: `←` `→` lessons, `/` search, `m` map, `r` review, `p` test yourself, `g` glossary, `t` theme, `?` all shortcuts. In Test yourself, `1`–`4` answer and `Enter` moves on.
- **Predict first**: before a demo plays, the lesson asks what you think will happen. The demo unlocks after an answer or Skip.
- **Step-through demos**: many demos are step players (Back, Play/Pause, Next, Reset) built from the visual kit in `js/ui.js`.
- **Run it**: Kotlin-language lessons have an editable program that runs on JetBrains' official [Kotlin Playground](https://github.com/JetBrains/kotlin-playground) (loaded on demand; needs a connection).
- **Official docs**: each lesson links 1–3 official pages, listed in `js/docs.js` (keys are `track.lesson`).
- Light and dark themes (System, Light, Dark), works offline once visited, installable as an app.

Progress lives in this browser's `localStorage` under `android-lab:v1`.

## Add a track

1. Copy the shape of `tracks/kotlin.js` into `tracks/<name>.js` and call `Lab.addTrack({...})`.
2. Put it on the roadmap by adding its id to a stage in `STAGES` in `js/app.js` (or give the track `stage: '<stage title>'`, plus `optional: true` if it's optional). The header comment in `js/app.js` lists the other optional fields (`requires`, `hue`, lesson `deeper` / `underHood` / `mistakes`).
3. Run `node tools/catalog.js`. It rebuilds `js/catalog.js` and checks for duplicate ids and missing quizzes.

**Run step 3 after every change to a track file**, then commit `js/catalog.js` with it. The page loads only the catalog (titles, terms and quizzes, about 140 KB gzipped) and fetches a track's full file the first time one of its lessons opens. If a track file and the catalog disagree, the browser console says so.

The roadmap, search, glossary, level filters, review, Test yourself and the offline cache pick it up automatically.

## Demos: the visual kit

`js/ui.js` adds `Lab.ui`, a set of step players: `phone`, `timeline`, `graph`, `flow`, `codeStepper`, `terminal`, plus `player` for a custom stage. A demo is a list of frames; frame 0 is the start, each frame has a `say` caption. The header of `js/ui.js` documents every option, and these lessons are short examples of each: `kotlin.vals`, `git.branches`, `perf.leaks`, `data.net`, `push.messages`, `concurrency.concurrency-parallelism`.

Optional lesson fields:
- `predict: { q, options, a, why }`: asked before the demo. Kit components take it as an option instead.
- `play`: a complete Kotlin program with `fun main()` (standard library and kotlinx.coroutines only), shown under **Run it**.

Track CSS must not use the `ui-` class prefix.

## Add a capstone project

A project is a track with two extra fields, and its lessons are build steps:

```js
Lab.addTrack({
  id: 'cap-notes', kind: 'project', stage: 'Architecture',
  title: 'Build a notes app', requires: ['compose', 'arch'],
  description: 'One sentence about the project.',
  builds: 'One sentence: what the learner has at the end.',
  lessons: [{ /* a normal lesson */ refs: ['compose.state', 'arch.udf'] }, ...],
});
```

`refs` are `track.lesson` ids shown as "Review first" links; ids that don't resolve are skipped. Then run `node tools/catalog.js`.

## Check

```
node check.js
```

It checks the spaced-review schedule and prints `ok`.

## Offline

`sw.js` is a service worker, registered only when the site is served over http(s) (not from `file://`).

- On install it caches the page, `style.css`, `js/app.js`, `js/catalog.js`, `js/docs.js`, the icons and the manifest.
- Track files are cached the first time one of their lessons opens, so a visited lesson works offline.
- Those files are served cache-first and refreshed in the background, so an edit shows up on the visit after the next one.
- Everything else, fonts included, is network-first with the cache as a fallback.
- To push fresh files to everyone at once, bump `VERSION` in `sw.js`; old caches are deleted when the new worker activates.

All paths are relative, so the site works from a subpath such as `/android_lab/`.

## Social preview and icons

`og.png` (1200×630) is the Open Graph and Twitter image. The logo is "Parallel lines": three topic lines bending into one station. `favicon.svg` is the tab icon (a simpler two-line version that reads at 16px). `icon-192.png` is the iOS icon, `icon-512.png` and `icon-maskable-512.png` are the app icons in `manifest.webmanifest`. The header logo is inline SVG in `index.html` and its colors follow the theme.
