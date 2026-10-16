# Android Lab

Interactive lessons for Kotlin and Android. Each lesson has an animated demo, a one-line rule to remember, practice challenges, and a quiz that comes back on a spaced-review schedule.

Plain HTML, CSS and JavaScript. No build step and no dependencies. Open `index.html`, or serve the folder to get offline support.

Live at https://abdulrahmanalbakkar.github.io/android_lab/

## Features

- **Subway map** (`#home`): every track is a colored line and every lesson a station, grouped as Foundations, Building apps, Going deeper and Shipping. A "you are here" marker shows your last lesson. Tracks you haven't reached yet are dimmed but still open.
- **Track pages** (`#<track>`) and **lesson pages** (`#<track>.<lesson>`): demo, code, "Pin this" rule, optional Go deeper / Under the hood / Common mistakes, practice, terms and a quiz.
- **Capstone projects**: guided builds drawn on the map as a double "express" rail at the end of their group. A project page shows "What you'll build" and its steps; each step links the lessons to review first.
- **Interview practice** (`#interview`): timed, mixed-topic questions drawn from every quiz. Pick topics or a preset, 10/20/30 questions and no limit, 30 s or 60 s per question. Results show a per-topic breakdown, explanations for every miss, and a button that adds the misses to Review. Best scores are kept per setup.
- **Spaced review** (`#review`): quiz questions come back after 1, 3, 7, 21 and 60 days while you keep getting them right.
- **Search** (`/`) across tracks, projects, lessons and glossary terms, and a **glossary** (`#glossary`).
- **Keyboard**: `←` `→` lessons, `/` search, `m` map, `r` review, `i` interview, `g` glossary, `t` theme, `?` all shortcuts. In interview mode, `1`–`4` answer and `Enter` moves on.
- Light and dark themes (System, Light, Dark), works offline once visited, installable as an app.

Progress lives in this browser's `localStorage` under `android-lab:v1`.

## Add a track

1. Copy the shape of `tracks/kotlin.js` into `tracks/<name>.js` and call `Lab.addTrack({...})`. The header comment in `js/app.js` lists the optional fields (`group`, `requires`, `hue`, lesson `deeper` / `underHood` / `mistakes`).
2. Add `<script src="tracks/<name>.js"></script>` to `index.html`, before the capstone scripts.

The map, search, glossary, level filters, review, interview mode and the offline cache pick it up automatically.

## Add a capstone project

A project is a track with two extra fields, and its lessons are build steps:

```js
Lab.addTrack({
  id: 'cap-notes', kind: 'project', group: 'Building apps',
  title: 'Build a notes app', requires: ['compose', 'arch'],
  description: 'One sentence about the project.',
  builds: 'One sentence: what the learner has at the end.',
  lessons: [{ /* a normal lesson */ refs: ['compose.state', 'arch.udf'] }, ...],
});
```

`refs` are `track.lesson` ids shown as "Review first" links; ids that don't resolve are skipped. List the script after the regular tracks in `index.html`. The map puts a project at the end of its group whatever the load order.

## Check

```
node check.js
```

It checks the spaced-review schedule and prints `ok`.

## Offline

`sw.js` is a service worker, registered only when the site is served over http(s) (not from `file://`).

- On install it caches the page, `style.css`, `js/app.js`, the icons, the manifest and every script listed in `index.html`. It reads that list from `index.html`, so a new track needs no change in `sw.js`.
- Those files are served cache-first and refreshed in the background, so an edit shows up on the visit after the next one.
- Everything else, fonts included, is network-first with the cache as a fallback.
- To push fresh files to everyone at once, bump `VERSION` in `sw.js`; old caches are deleted when the new worker activates.

All paths are relative, so the site works from a subpath such as `/android_lab/`.

## Social preview and icons

`og.png` (1200×630) is the Open Graph and Twitter image. `favicon.svg` is the tab icon; `icon-512.png` is the home-screen icon used by `manifest.webmanifest` and iOS.
