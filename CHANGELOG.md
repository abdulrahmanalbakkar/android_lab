# Changelog

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
