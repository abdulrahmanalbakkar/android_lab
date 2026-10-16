# Changelog

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
