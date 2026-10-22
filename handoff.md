# Handoff: Android Lab rebuild

Read this first if you are continuing the work (a person or a new Claude session).

## What this is
Android Lab is a static learning site (plain HTML/CSS/JS, no build step) that takes a complete beginner from their first
line of code to shipping Android apps. Live: https://abdulrahmanalbakkar.github.io/android_lab/ (GitHub Pages, served
from `main`). Repo: github.com/abdulrahmanalbakkar/android_lab.

## Where things stand (2026-10-22)
- **The full rebuild is done.** Every track was rewritten for readers who have never programmed, reviewed by a
  beginner-reader pass, and fixed. 12 stages, 44 tracks (see `js/catalog.js` for the live count).
- **New in this rebuild:** First steps; Building with AI (Working with AI tools, AI features in apps, Project: AI in the
  news app); Show your work; release automation (`build.automation`); sets and heaps (cs); Hilt modules; a progress code
  to move progress between browsers; "I already know this" per lesson and "Test out" per track.
- **Work happens on the `rebuild` branch**; `main` was last merged from it after Stage 6. To publish everything, merge
  `rebuild` into `main` (pull request on GitHub, or locally: `git checkout main && git merge rebuild && git push`).
- Saved progress from before the rebuild no longer matches (lesson ids changed). This was accepted.
- Service worker cache is `v15` (`sw.js`); bump it whenever you deploy changes users must get at once.

## How lessons are made
- `docs/curriculum.md`: every lesson in order, what it teaches, and the rules every lesson follows. Keep it in sync.
- `docs/authoring/BRIEF.md` (how to write a lesson), `REVIEW.md` (beginner-reader review), `FIX.md` (applying a review),
  `conventions.md` (versions used site-wide, story/app names per track, house rules).
- Lesson object fields: id, title, tagline, goals, level, introduces, body, visual (Lab.ui kit demo with predict),
  code, play (pure Kotlin, runs on Kotlin Playground), remember, mistakes, terms, challenges (exactly 2), quiz, docs.
  Projects: track `kind: 'project'`, `builds`, step `refs`.
- Demo kit: `js/ui.js` (phone, timeline, graph, flow, codeStepper, terminal, player); its header documents options.

## Checks (run after every change)
```
node tools/catalog.js                 # rebuilds js/catalog.js (commit it)
node tools/prereq.js                  # whole site: nothing used before it is taught
python3 tools/check_track.py . <id>   # needs Playwright + Chromium: errors, overflow, challenges
STEPS=4 python3 tools/shots.py <dir> <track.lesson>   # demo screenshots (1280 light, 400 dark)
node tools/peek.js <track> <lesson>   # print a lesson as plain text (for reviewing)
node check.js                         # spaced-review schedule
```

## Known limits / things to verify with a real build
The lessons were checked against official docs, and pure Kotlin, git, sqlite3, Gradle (plain), curl, keytool and Docker
outputs come from real runs. These could NOT be run in the authoring environment (no Maven/Google Maven access):
- Android/Compose/Hilt/Room/WorkManager/Media3/CameraX/ML Kit code was not compiled. A pass that builds the
  Recipes and News sample code in Android Studio would catch any remaining compile errors.
- MockK, Turbine, Robolectric, kotlinx-coroutines-test, Roborazzi, Macrobenchmark, Ktor and Exposed code was not run.
- fastlane/Play Console steps (build.automation, capship.ship) were not run against a real Play account. Confirm that a
  service account with "View app information" + "Release apps to testing tracks" can upload to internal testing.
- capai.offline: the new `body` column was made nullable (`String?`) to avoid an unconfirmed Room text-default form.

## Ideas not done yet
- Accounts with cross-device sync (would need a backend and privacy terms); the progress code covers it for now.
- A real Android build check in CI for the code samples (extract samples into a Gradle project).

## Style decisions to keep
- Short, friendly, plain words; no "simply/just/obviously"; no job-interview framing ("Test yourself").
- Neutral, international examples; no real people or brands except the tools taught; the dotted/dotless i (Turkish
  locale) in android.localization is the one exception.
- Keep the design simple.
