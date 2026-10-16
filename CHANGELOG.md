# Changelog

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
