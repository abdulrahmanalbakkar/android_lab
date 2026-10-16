# Android Lab: topic gap audit (Oct 2026)

Inventory: 26 tracks, 175 lessons (4 capstones). Compared against the developer.android.com nav and core areas, Android Basics with Compose (8 units), the kotlinlang.org docs TOC, Android 16/17 behavior changes, and a widely used interview list (amitshekhariitbhu/android-interview-questions).

## Covered well
- **Kotlin:** basics, deeper topics (variance, delegation, inline/reified, DSLs, value classes, sequences, Result), OOP, SOLID, patterns.
- **Coroutines and Flow:** structured concurrency, dispatchers, channels, cold and hot streams, operators, backpressure, callbackFlow, lifecycle-safe collection.
- **Compose:** recomposition, modifiers, state, hoisting, lists and keys, effects (LaunchedEffect, DisposableEffect, rememberUpdatedState and snapshotFlow are all covered), stability, phases, CompositionLocal, animation, custom layouts, type-safe navigation, theming and dynamic color.
- **Views:** XML, RecyclerView with DiffUtil, Fragments, interop in both directions.
- **Architecture:** layers, UDF, MVVM vs MVI, use cases, single source of truth, Hilt, modularization, Clean Architecture.
- **Data:** Room (relations, migrations), DataStore, Retrofit with kotlinx.serialization, caching, Paging 3, files, MediaStore and Photo Picker.
- **Background, media and sensors:** WorkManager, foreground services, receivers, Media3, CameraX, sensors, location.
- **Shipping and quality:** security, accessibility, adaptive layouts, edge-to-edge, testing (fakes, coroutines, Flow, Compose UI), performance (frame budget, ANR, leaks, profiler, startup, R8), Gradle, catalogs, variants, signing, bundles, release tracks, push, KMP.
- **Capstones:** the four capstones tie the tracks together well.

## Real gaps (no lesson, and not covered inside one)

| # | Proposed lesson | Track | Level | Why it matters | Priority |
|---|---|---|---|---|---|
| **Platform** |||||
| 1 | Predictive back and OnBackPressedCallback / BackHandler | android | Intermediate | Apps targeting API 36 no longer get `onBackPressed()`. The site never mentions it. | must |
| 2 | Resources and localization: strings, plurals, qualifiers, RTL, per-app language | android | Beginner | Every shipped app needs this. Include the Turkish dotted-i trap with `uppercase(Locale)`. | must |
| 3 | API levels and compatibility: minSdk, targetSdk, compileSdk, `Build.VERSION` checks, desugaring, yearly target bumps | build | Intermediate | Play enforces target API every year, and behavior changes land through targetSdk. | must |
| 4 | Context and app components: Application vs Activity context, the manifest, the four components | android | Beginner | Context is used in 20 tracks but never taught, and the wrong context is the classic leak. | must |
| 5 | The main thread: Looper, Handler and MessageQueue | android (or perf) | Intermediate | Explains ANRs, `Dispatchers.Main` and `post {}`. A top interview topic. | should |
| 6 | Alarms: AlarmManager, exact-alarm permission, when to use WorkManager instead | background | Intermediate | A core area on d.android.com. Reminder and calendar apps need it. | should |
| 7 | Doze, App Standby buckets and background limits | background | Intermediate | Explains why work and pushes are delayed. Today it is only a glossary line in push. | should |
| 8 | Sharing files: FileProvider, content URIs, the share sheet | data | Intermediate | Needed for any "export/share PDF or photo" feature. FileProvider is never mentioned. | should |
| **UI** |||||
| 9 | Loading images with Coil (AsyncImage, placeholders, caching, sizing) | compose (or data) | Beginner | Android Basics unit 5. Coil is named only in passing. | must |
| 10 | Dialogs, bottom sheets, snackbars and menus (Material 3 components) | compose | Beginner | Everyday UI. Only Scaffold and theming are taught. | must |
| 11 | Drawing with Canvas, drawBehind and graphicsLayer | compose2 | Intermediate | Charts, custom progress and effects. Canvas only appears inside an accessibility example. | should |
| 12 | Shared element and screen transitions (SharedTransitionLayout) | compose2 | Advanced | The standard list-to-detail polish. Zero coverage. | nice |
| 13 | Home-screen widgets with Glance | new or compose2 | Intermediate | A distinct surface on d.android.com and common in news and productivity apps. | should |
| 14 | Text in depth: AnnotatedString, links, fonts, `TextFieldState` | compose | Intermediate | Rich text and clickable links come up in almost every app. | nice |
| **Networking** |||||
| 15 | OkHttp interceptors, Authenticator and token refresh | data | Intermediate | Auth headers plus refresh on 401 are in nearly every real app. Today they are only a patterns example. | must |
| 16 | Real-time data: WebSockets / SSE as a Flow | data | Advanced | A system-design interview staple (chat, live scores). | should |
| 17 | Observing connectivity (ConnectivityManager NetworkCallback) | data | Intermediate | Offline banners and sync triggers. | nice (could live inside the callbackFlow lesson) |
| **Concurrency** |||||
| 18 | Shared mutable state: Mutex, atomics, confinement | coroutines | Advanced | Race conditions in repositories and caches. Mutex is never mentioned. | should |
| **Identity and Play** |||||
| 19 | Sign-in with Credential Manager and passkeys | security | Intermediate | "User identity" is a core area. The site gives it one sentence. | must |
| 20 | In-app updates and in-app reviews | new "After launch" track | Beginner | Standard Play libraries. Zero coverage. | should |
| 21 | Play Billing: one-time products and subscriptions | new "After launch" track | Advanced | Required for any monetized app. | should |
| 22 | Crash reporting and Android vitals (Crashlytics, ANR and crash thresholds, R8 mapping upload) | new "After launch" track | Intermediate | Vitals thresholds affect Play visibility. Today vitals is only mentioned. | must |
| 23 | Play policy essentials: Data safety form, target API deadline, developer verification | build | Beginner | A missed policy blocks releases. Developer verification is new for 2026. | should |
| **Tooling** |||||
| 24 | Debugging toolkit: Logcat, breakpoints, Layout Inspector, adb | new "Tools" track or perf | Beginner | No lesson teaches the daily debugging loop. | must |
| 25 | Static analysis and CI: Android Lint, detekt/ktlint, a GitHub Actions pipeline | build | Intermediate | Lint and CI are expected on any team. CI is mentioned only for secrets and caching. | should |
| 26 | Screenshot testing (Compose Preview Screenshot Testing / Roborazzi) | testing | Intermediate | Catches visual regressions cheaply. Today it is a single "next step" line in the recap. | should |
| 27 | Mocking with MockK, and when to prefer fakes | testing | Intermediate | It is in most codebases and interviews, even if fakes come first. | nice |
| **Kotlin** |||||
| 28 | Properties and visibility: getters/setters, backing fields, `lateinit`, `private set`, `internal` | kotlin | Beginner | Its own kotlinlang section. `lateinit` and visibility modifiers are never taught. | should |
| 29 | Maps and Sets (and choosing a collection) | kotlin | Beginner | The collections lesson is list-only. `mapOf` does not appear in the Kotlin track. | should |
| 30 | Java interop: platform types, `@JvmStatic` / `@JvmOverloads`, SAM conversions | kdeep | Intermediate | Every Android codebase still calls Java APIs. | nice |

Notes:
- **Wear OS, TV, Auto, XR:** only Media3 sessions touch these. Fine to leave out, but add one "other form factors" pointer page.
- **NDK/JNI and 16 KB pages:** nice-to-have. Apps that bundle native libraries must be 16 KB-aligned for Play.
- **Bluetooth, NFC, AIDL/IPC:** out of scope for a general curriculum.

## Partial coverage (mentioned in passing; deserves its own lesson)
- **Navigation 3:** one sentence in compose2/navigation. It is now the recommended Compose navigation library, so it deserves its own lesson. The same lesson can cover bottom nav with multiple back stacks, which neither nav lesson covers.
- **Coroutine exception handling** (CoroutineExceptionHandler, SupervisorJob, `async` vs `launch` propagation): folded into the structured concurrency lesson. Interviewers expect it as its own topic.
- **App Links and deep links:** only inside push/deeplinks and the cap-ship deep-link lesson. Needs a standalone lesson on verified App Links (`assetlinks.json`, `autoVerify`) and testing with adb.
- **Android 17 resizability:** `a11y/window-size` and `foldables` exist, but should state that API 37 ignores orientation and resizability locks on sw ≥ 600 dp (Play deadline: Aug 2027), and cover camera preview and state-loss pitfalls.
- **Launch modes and task affinity:** appear only as `singleTop` inside push and capship. The android/backstack lesson should own them, since this is a frequent interview question.
- **Hilt testing** (`@HiltAndroidTest`, `@TestInstallIn`): only appears in capstones. Worth a lesson in testing.
- **Notification styles and actions** (BigText, Messaging, progress / Live Updates, reply actions): push covers only channels, FCM and taps.
- **App Startup / ContentProvider init:** inside perf/startup. Fine as is.
- **KSP and annotation processing:** named in the arch and data tracks, never explained. Could become a short build lesson.

## Suggested new tracks

**1. After launch (group: Shipping)**, gaps 20 to 23 plus:
1. Crash reporting and Android vitals
2. Analytics events that answer real questions
3. Remote Config and feature flags
4. In-app updates
5. In-app reviews
6. Play Billing: products and subscriptions
7. Play policy: Data safety, target API, developer verification

**2. Tools and debugging (group: Foundations or Going deeper)**, gaps 24 and 25 plus:
1. Logcat and structured logging
2. The debugger: breakpoints, evaluate, watch
3. Layout Inspector and Compose recomposition counts
4. adb essentials (install, intents, deep links, `dumpsys`, `am kill`)
5. Android Lint and custom lint checks
6. detekt/ktlint and a CI pipeline on every PR

**3. AI in Android apps (group: Going deeper)**. developer.android.com/ai is now a top-level section.
1. On-device vs cloud: choosing an approach
2. ML Kit vision: text recognition and barcode scanning (builds on CameraX ImageAnalysis)
3. Gemini Nano via ML Kit GenAI APIs (summarize, rewrite)
4. Cloud Gemini with Firebase AI Logic
5. Streaming model output into Compose with Flow
6. Privacy, safety and fallbacks for AI features

## Top 10 to build first
Predictive back; resources and localization; Context and app components; API levels and compatibility; Coil images; dialogs and sheets; OkHttp auth and token refresh; Credential Manager; debugging toolkit; crash reporting and vitals.

Sources: [Android Basics with Compose](https://developer.android.com/courses/android-basics-compose/course), [d.android.com core areas](https://developer.android.com/develop/core-areas), [Android 16 behavior changes](https://developer.android.com/about/versions/16/behavior-changes-16), [Android 17 resizability post](https://android-developers.googleblog.com/2026/02/prepare-your-app-for-resizability-and.html), [Kotlin docs TOC (kr.tree)](https://github.com/JetBrains/kotlin-web-site/blob/master/docs/kr.tree), [Android interview questions](https://github.com/amitshekhariitbhu/android-interview-questions).
