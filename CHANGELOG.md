# Changelog

## 2026-10-18: simpler roadmap, "Test yourself"

- **Roadmap redesigned:**
  - **Layout:** the home page is now a plain syllabus. Each numbered stage is a heading, and each topic is one row with its colour dot, lesson count and progress bar.
  - **Removed:** the tree drawing (spine, zig-zag cards, connectors), the goal picker, the jump bar, the legend and the finish card.
  - **Folding:** finished stages fold to one line.
- **No more interview framing:**
  - **Menu:** "Interview" is now **Test yourself** at `#practice`. Old `#interview` links redirect, and the shortcut key is `p`.
  - **Renames:**
    - Stage "Get the job" → **Problem solving**
    - "CS and interview basics" → **Data structures and algorithms**
    - "Approaching a coding interview" → **Solving a problem step by step**
    - "How a mobile system design interview works" → **How to approach a system design**
    - Preset "Android interview" → **Android core**
  - **Unchanged:** lesson ids, so saved progress is kept.
- **International examples:** every lesson now uses neutral English names, places, app ids and UI text, for example Alice/Bob, City A, `com.example.news`, "Top stories", Team A vs Team B and USD. References to specific real apps are gone. Localization lessons show Spanish, French, German and Arabic. Turkish stays only in the dotted/dotless "i" step, because that bug is the standard example of locale-sensitive case mapping.
- **Credit:** "Built by Abdulrahman Albakkar" moved to the page footer, where it shows on phones too.
- **Service worker cache:** version bumped to v12.

## 2026-10-18: CS foundations, Beyond the app, goals, faster loading

- **Faster loading:**
  - **Up front:** the page loads `js/catalog.js` (lesson titles, terms and quizzes, about 260 KB gzipped) instead of every track file, which was over 5 MB.
  - **On demand:** a track's file is fetched the first time one of its lessons opens. Opening a track page warms it up in the background.
  - **Adding a track:** run `node tools/catalog.js` after adding or editing one. It also checks for duplicate ids and missing quizzes.
- **New stage, Computer science foundations (optional), 50 lessons:**
  - Operating systems (8)
  - Computer networks (8)
  - Databases (8)
  - Concurrency fundamentals (6)
  - How code runs (7)
  - Software engineering practice (7)
- **New stage, Beyond the app, 27 lessons:**
  - Mobile system design (11)
  - Backend with Kotlin (9, using Ktor)
  - Cloud and DevOps basics (7)
- **Independent review:** a reviewer who did not write the new lessons checked each one against official docs. About 35 corrections were made, for example Docker comments, Mutex fairness, SELinux targetSdk rules, cleartext defaults and Ktor config failures.
- **Goals:** a new picker with New to programming, Growing to senior, Interview prep and Everything. The goal opens its stages and folds the others, and finished stages fold too. A jump bar scrolls to any stage.
- **Finish line card** at the end of the roadmap:
  - progress for your goal
  - Interview practice and Review buttons
  - a "Built by" credit
- **Quizzes:**
  - **Sizing:** quiz size now follows the lesson. About 465 questions were added to existing lessons (append-only, so saved review progress is kept), and most lessons now have 4–6.
  - **Question styles:** what does this print, put in order, which line is the bug, and which choice fits.
  - **Totals:** 1,561 questions in all.
- **Interview mode:** new presets, System design & backend and CS fundamentals.
- **Official docs:** all 348 lessons have links (781 in total).
- **Service worker cache:** version bumped to v11. It caches the catalog and docs on install, and track files when first opened.

## 2026-10-16: deep dives promoted to lessons (36 new)

Deep-dive steps that were a concept of their own became full lessons, placed right after their parent. Gap-audit topics were added in the same pass. Existing lesson ids are unchanged, so saved progress is kept.

- **Kotlin:** lateinit and lazy; Maps and Sets; Properties, setters and visibility.
- **Kotlin, deeper:** sequence { } and yield; Java interop.
- **Coroutines (4 to 7):** exception handling; cancellation and timeouts; shared mutable state.
- **Flow:** stateIn vs shareIn; suspendCancellableCoroutine.
- **Android fundamentals:** launch modes and task affinity; package visibility.
- **Compose:** DisposableEffect and SideEffect; snapshotFlow; TextFieldState.
- **Compose, advanced:** drawing with Canvas; shared element transitions; Navigation 3.
- **Views:** multiple view types; ViewPager2.
- **Accessibility:** custom actions; keyboard and D-pad focus; Android 17 resizability.
- **Architecture:** Hilt components and scopes.
- **Data:** real-time data with WebSockets as a Flow; sharing files with FileProvider.
- **Testing (6 to 10):** Robolectric; MockK; screenshot tests; Hilt in tests.
- **Performance:** the main thread (Looper, Handler, MessageQueue).
- **Media:** recording video with CameraX.
- **Notifications and push (4 to 6):** styles and actions; verified App Links.
- **Background work (3 to 5):** Doze and App Standby buckets; alarms.
- **Official docs:** the new lessons have links too, so all 277 lessons have 1–3 (588 links in total).
- **Service worker cache:** version bumped to v9.
- **Testing:** all 30 topics and 277 lessons, at 1280px light and 400px dark. No script errors and no page wider than the screen.

## 2026-10-16: new topics and official docs

- **New topics (34 lessons):**
  - **Git and the command line** (9 lessons, Programming basics): terminal, commits, .gitignore, branches, merging, rebase, remotes, pull requests, undoing things.
  - **Android Studio and debugging** (7, Your first app): Studio tour, Logcat, debugger, Layout Inspector, adb, Lint, CI on every PR.
  - **After launch** (7, Ship it): crashes and vitals, analytics, feature flags, in-app updates, in-app reviews, Play Billing, Play policy.
  - **CS and interview basics** (11), in the new last stage **Get the job**: Big-O, lists, hashing, stacks and queues, two pointers, binary search, sorting, trees, graphs, dynamic programming, interview approach.
- **OOP basics** grew from 4 to 11 lessons: objects, identity vs equality, inheritance, delegation, interfaces vs abstract classes, cohesion and coupling, domain modeling.
- **Gap-audit lessons added:**
  - Android fundamentals: Context and app components, resources and localization, predictive back, plus a task-affinity step in the back stack lesson.
  - Compose: Coil images; dialogs, sheets, snackbars and menus.
  - Data: OkHttp interceptors and token refresh.
  - Build: API levels and compatibility.
  - Security: Credential Manager and passkeys.
- **Official docs:** every lesson (241) ends with 1–3 links to official documentation, 504 links in total, each opened and checked. The links live in `js/docs.js`.
- **Facts checked in Oct 2026:**
  - Play target API 36 since Aug 31, 2026.
  - Billing Library 8+ required.
  - Vitals thresholds: 1.09% crashes, 0.47% ANRs.
  - Predictive back is on by default when targeting API 36.
  - Coil 3.
  - Credential Manager 1.6.0.
- **Fixes:** the roadmap now puts projects at the end of each stage, so topic cards keep alternating sides.
- **Service worker cache:** version bumped to v8.
- **Testing:** all 30 topics and 241 lessons, at 1280px light and 400px dark. No script errors and no page wider than the screen.

## 2026-10-16: roadmap home

- **New home:** the subway map is replaced by a vertical roadmap with 8 stages: Programming basics, Think in objects, Your first app, Async and data, Architecture, Quality, Platform features, Ship it, then Job ready. Topics branch off the spine as cards marked core, optional or project, each with its progress. On phones the spine runs down the left.
- **Optional topics:** Kotlin deeper, Views interop, Compose advanced, Media and KMP.
- **Fix:** the Today panel said "First lesson" for someone who had already opened a lesson. It now says "Continue".
- **Track placement:** tracks now go on the roadmap through `STAGES` in `js/app.js` or a `stage` field. The old `group` field is no longer used.
- **Service worker cache:** version bumped to v7.
- **Testing:** all 26 topics and 192 lessons, at 1280px light and 400px dark. No script errors and no page wider than the screen.

## 2026-10-16: new logo

- **Logo:** "Parallel lines" (three topic lines bending into one station) replaces the "fun" badge in the header. It switches colors with the theme.
- **Icons:** new favicon, 192 and 512 app icons, a maskable icon for Android home screens, and a new social preview image (og.png).
- **Service worker cache:** version bumped to v6.

## 2026-10-16: depth pass 2 (no gaps)

- **Every lesson deepened:** all 159 lessons now have Go deeper steps and Common mistakes, and almost all have an Under the hood panel. The site has 312 step demos in total.
- **Facts checked:** version-sensitive facts in the new steps were checked against developer.android.com, kotlinlang.org and AndroidX/kotlinx source.
- **Fixes to existing lessons:**
  - kmp.swift: `@Throws` on a suspend function now lists `CancellationException`.
  - perf.r8: obfuscated stack frames now show `r8-map-id-…`, as they do since AGP 8.12.
  - push.fcm: the "Fresh timestamps" demo no longer crashes.
- **Service worker cache:** version bumped to v3.
- **Testing:** all 26 lines and 192 lessons, at 1280px light and 400px dark. No script errors and no page wider than the screen.
- **Topic audit:** a coverage check against developer.android.com, Android Basics with Compose and the Kotlin docs found topics with no lesson yet. The full report is in `docs/gap-audit.md`.

## 2026-10-16: track restructure (26 lines)

- **OOP and SOLID** became **OOP basics** (encapsulation, composition, polymorphism, abstraction) and **SOLID principles** (5 lessons). Design patterns is now recommended after SOLID.
- **Coroutines and Flow** became **Coroutines** (basics moved in from the Kotlin track, structured concurrency, dispatchers, channels) and **Flow** (8 lessons).
- **Platform and push** became **Notifications and push** (channels, FCM, message types, deep links, under Shipping) and **Background work** (WorkManager, foreground services, receivers, under Going deeper).
- **Room basics** and **Retrofit** moved from App architecture to **Data and networking**. Architecture is now design only.
- **Saved progress:** completed lessons, review cards and "you are here" move to the new ids automatically. Old links such as `#platform.fcm` redirect.
- **Kept together:** capstone "Review first" links, "recommended after" hints and the interview presets now use the new ids. The service worker cache version is bumped to v2.
- **Testing:** all 26 lines and 192 lessons, at 1280px light and 400px dark. No script errors and no page wider than the screen.

## 2026-10-16: fact-check, capstones, interview mode, polish

### Fact-check (primary sources: Android, Kotlin, Firebase docs, AOSP/AndroidX source, kotlinc 2.2.20 output)
- **FCM:** firebase-messaging 25.1.0 (June 2026) deprecated `getToken()`, `deleteToken()` and `onNewToken()` in favor of Firebase Installation ID registration (`onRegistered`). platform.fcm now says so; the code samples still use the token API. The 270-day expiry is confirmed. Offline messages are "kept and delivered", with no ordering guarantee.
- **Platform:**
  - The `startForeground()` deadline is "a few seconds, varies by version" (AOSP main uses 30 s), not a fixed 5 s.
  - `createNotificationChannel` on an existing channel only updates its name and description.
  - A `rememberSaveable` with no Saver throws when it registers, not later.
  - On Android 8.0 and later, heads-up comes from channel importance, not priority.
- **Kotlin:** compiler messages updated to K2 wording, for example `'val' cannot be reassigned` and `Unresolved reference 'x'.`. Extensions can see `internal` members (only `private` is hidden).
- **Compose:** in M3 `Scaffold` the snackbar sits above the FAB. `AnimatedVisibility` defaults to `fadeIn + expandIn`. Large and XL window classes need `supportLargeAndXLargeWidth = true`. The Android 16 orientation rule depends on smallest width.
- **KMP:** `androidLibrary {}` became `android {}`. Swift export is Alpha.
- **Media:** the Android 15 audio-focus rule depends on targetSdk. `onPlaybackResumption` gained an `isForPlayback` parameter in 1.9. `CommandButton` and `setMediaButtonPreferences` are `@UnstableApi`.
- **Flow and testing:**
  - `flatMapConcat` and `flatMapMerge` need `@OptIn(ExperimentalCoroutinesApi)`.
  - `StandardTestDispatcher()` borrows the test Main dispatcher's scheduler when one is installed.
  - The Compose test error texts and the Macrobenchmark DEBUGGABLE error were corrected.
- **Confirmed unchanged:** AGP 9 defaults, Play Console numbers, the security-crypto deprecation, the Tink rotation code, FCM payload, TTL and collapse limits, WorkManager defaults.
- **Still unverified, left as written:** a few exact compiler and library error strings, `waitUntilExactlyOneExists` opt-in status, and the `navDeepLink<T>` path format (cap-ship step 4).

### Capstone projects (shown as "express" lines at the end of each map group)
- **Expense Tracker Core** (Foundations, 8 steps): pure Kotlin. Model, parsing, reports, storage interface, budget DSL, coroutine sync, tests.
- **News reader** (Building apps, 8 steps): offline-first Compose app with Retrofit, Room, Hilt and UI states.
- **Production Quality Pass** (Going deeper, 9 steps): tests, Turbine, UI tests, recomposition, a leak, accessibility, adaptive layout, Baseline Profile.
- **Ship the news reader** (Shipping, 8 steps): channels, FCM tokens and topics, data messages, deep links, WorkManager prefetch, hardening, flavors and signing, staged rollout.
- **Step pages:** "Step N of M", plus "Review first" links to the lessons each step applies.

### Interview mode (`#interview`, key `i`)
- **Setup:** presets or pick topics, 10, 20 or 30 questions, optional 30 or 60 s timer.
- **Answering:** keys 1–4 and Enter.
- **Results:** per-topic breakdown, missed questions with explanations, "Add missed to Review", best scores.

### Polish
- **Offline support:** a service worker caches the whole site after the first visit on GitHub Pages. Bump `VERSION` in sw.js to force everyone onto fresh files.
- **App and sharing:** web app manifest, favicon, social preview image (og.png), and theme-color.
- **Lighthouse:** accessibility 100, SEO 100. The map stations are 32 px tap targets on phones.
- **CSS cleanup:** the per-track CSS workarounds were removed; style.css now covers them.

### Testing
- **Coverage:** all 23 lines and 192 lessons and steps, plus the interview, glossary and review pages.
- **Sizes:** 1280px light and 400px dark.
- **Result:** no script errors and no page wider than the screen.

## 2026-10-16: depth pass

- **New lesson sections**, shown only where a lesson needs them:
  - **Go deeper**: 2–4 numbered steps, each adding one idea, most with their own demo.
  - **Under the hood**: a collapsed panel on what the compiler or runtime does.
  - **Common mistakes**: before and after code with the reason.
- **Coverage:** 55 of the 159 lessons now have these sections, with 112 new step demos. Lessons whose single demo already tells the whole story were left alone.
- **Deepened lessons, by track:**
  - Kotlin: nulls, lambdas, collections, classes, data, coroutines
  - Kotlin, deeper: variance, delegation, inline, errors
  - OOP and SOLID: polymorphism, liskov, dip
  - Design patterns: singleton, observer, state-machine
  - Android fundamentals: savedstate, permissions
  - Views and Compose interop: recycler, fragments
  - Platform and push: fcm, messages, workmanager
  - Jetpack Compose: recomposition, remember, lazy-keys, effects
  - Compose, advanced: stability, derived, phases
  - Accessibility and adaptive UI: semantics, insets
  - Coroutines and Flow: structured, dispatchers, hot, lifecycle
  - Testing and quality: coroutines, compose-ui
  - Performance and debugging: leaks, compose-perf
  - App architecture: udf, ssot, room, hilt
  - Data and storage: migrations, paging
  - Kotlin Multiplatform: expect, viewmodels
  - Security and privacy: keystore, at-rest, network
  - Build and release: gradle, modules
  - Media, camera and sensors: session, analysis

### To verify
- **FCM tokens:** the monthly refresh guidance and the 270-day token expiry (platform.fcm) come from memory.
- **Media3:** `setMediaButtonPreferences` and `CommandButton.ICON_SKIP_FORWARD_15` need Media3 1.6 or later (media.session).
- **Tink:** the keyset rotation snippet (security.at-rest).
- **Error messages:** the Dagger and AutoMigration texts are marked "(shortened)", not exact compiler wording.

### Testing
- **Coverage:** all 159 lessons at 1280px light and 400px dark.
- **What was exercised:** clicks on core and step demos, with every "Under the hood" panel open.
- **Result:** no script errors and no page wider than the screen.

## 2026-10-16: overnight build

### New shell
- **Look:** an Android-green palette in light and dark. A theme button cycles System, Light and Dark, and `t` toggles the theme.
- **Home:** a short hero, the rotating "Pin this" card, and a **subway map**. Each track is a colored line and each lesson is a station on it. Lines are grouped as Foundations, Building apps, Going deeper and Shipping. A "you are here" marker shows your last lesson.
- **Track pages** at `#<track>`: breadcrumbs, progress, a level filter, a Start/Continue button, and the lessons drawn as a vertical line.
- **Lesson pages:** breadcrumbs, a reading-progress bar, an "On this page" list, and a dismissible "recommended first" banner.
- **Soft locks:** a track that needs another track first shows "Recommended after X". Its line is dimmed on the map but still fully clickable.
- **Keyboard shortcuts:** `←`/`→` move between lessons, `/` search, `m` map, `r` review, `g` glossary, `t` theme, `?` lists all shortcuts.
- **Search** now finds tracks as well as lessons and glossary terms.

### Content: 19 tracks, 159 lessons
- **New tracks:**
  - Kotlin, deeper
  - OOP and SOLID
  - Design patterns
  - Data and storage
  - Views and Compose interop
  - Accessibility and adaptive UI
  - Performance and debugging
  - Media, camera and sensors
  - Security and privacy
  - Build and release
- **Expanded tracks:**
  - Kotlin (+7 basics: types, control flow, classes, inheritance, objects, enums, exceptions)
  - Compose (+6: layouts, Scaffold, theming, text input, lists, gestures)
  - Coroutines and Flow (+5: flatMap*, buffering, retry, channels, callbackFlow)
  - Architecture (+5: MVVM vs MVI, use cases, UI state patterns, modularization, Clean)
- Every lesson has an animated demo, a "Pin this" rule, 2–3 quiz questions, glossary terms, and two challenges (one fill-in-the-blank, one spot-the-bug).

### Decisions to review
- **Dimmed lines:** almost every line looks dimmed for a new learner, because most tracks recommend Kotlin first. Only the rail is dimmed, not the line name, so the names stay readable.
- **Line colors:** each track takes a color from a fixed list of 18 in load order, so adding a track in the middle shifts the colors of the tracks after it. A track can pin its own color with a `hue` field.
- **The `t` key:** it switches between light and dark directly. The header button cycles through all three modes, including System.
- **security-crypto:** the Security track teaches Keystore + Tink and says `security-crypto` (EncryptedSharedPreferences/EncryptedFile) is deprecated.
- **Version-specific claims:** the Build track states AGP 9 details (built-in Kotlin, `buildConfig` off by default) and Play facts (100 internal testers; new personal accounts need 12 testers for 14 days). Check these against current docs.
- **Platform track:** the foreground-service limits on Android 14 and 15 and the default FCM priorities come from model knowledge, not checked against the docs.
- **Map tap size:** at phone width, the 17-station Kotlin line gives each station about 22px, slightly under the recommended 24px tap size.

### Testing
- **Coverage:** every track page, every lesson, the glossary and review were loaded at 1280px light and 400px dark.
- **What was clicked:** up to 10 demo buttons in each lesson.
- **Result:** no script errors, no page wider than the screen, and every lesson has its two challenges.
- **Schedule check:** `node check.js` passes.
