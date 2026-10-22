/* Kotlin Multiplatform track (optional).
   Same shape as tracks/kotlin.js. Demos use the visual kit (Lab.ui); any track CSS goes in the css string, every class
   starting with kmp-. */
(() => {
  const css = ``;

  Lab.addTrack({
    id: 'kmp',
    title: 'Kotlin Multiplatform',
    description: 'Share the Recipes app’s Kotlin with an iPhone app: targets and source sets, expect and actual, shared networking with Ktor, a shared Room database, shared ViewModels, Compose Multiplatform and calling Kotlin from Swift.',
    group: 'Shipping', requires: ['kotlin', 'arch'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'what-kmp',
        title: 'What Kotlin Multiplatform is',
        tagline: 'Write the app’s rules once in Kotlin and run them on Android and on the iPhone.',
        goals: ['Explain what Kotlin Multiplatform shares and what each platform keeps', 'Name the targets a shared module is built for', 'Read the layout of a KMP project: shared, androidApp and iosApp'],
        level: 'intermediate', introduces: ['iosArm64', 'iosSimulatorArm64', 'baseName'],
        body: `
<p>Lin has an iPhone and asks for Recipes on it. iPhone apps are usually written in Swift, Apple’s language, with Xcode, Apple’s IDE, on a Mac. Writing Recipes again in Swift means every rule, like which recipes count as quick or how a refresh keeps the saved list when offline, exists twice. Sooner or later a fix lands in one copy and not the other.</p>
<p><em>Kotlin Multiplatform</em> (KMP) compiles one Kotlin module for several platforms. Each platform it is built for is a <em>target</em>. For Android, Kotlin compiles to <em>JVM bytecode</em>, the format of the Java Virtual Machine (JVM), a program that runs compiled Java and Kotlin on computers. Android has no JVM: at build time it converts that bytecode, along with the rest of your app, for its own runtime, ART. iPhones have no such runtime, so for them <em>Kotlin/Native</em> compiles the same files to machine code, the phone’s own instructions, and packs it into a <em>framework</em>: a bundle of compiled code that an Xcode project can use. There are two iPhone targets: <code>iosArm64</code> for real iPhones and <code>iosSimulatorArm64</code> for the iPhone simulator on a Mac with an Apple chip.</p>
<p>You decide what to share. Most apps share the logic: data classes, rules, the repository, ViewModels. The screens can stay native, Compose on Android and SwiftUI, Apple’s UI toolkit, much like Compose, on the iPhone, or be shared too. Google supports KMP for sharing business logic between Android and iOS, and it is stable. You can start small, with one shared module next to an existing app.</p>
<p>A KMP project has three parts. <code>shared/</code> is the KMP module: an Android library and an iPhone framework at once. <code>androidApp/</code> is the Android app with <code>MainActivity</code>; since AGP 9 it must be a module of its own. <code>iosApp/</code> is the Xcode project, not a Gradle module. Building for the iPhone needs a Mac with Xcode; the Android side builds anywhere.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 320,
            predict: {
              q: 'Sam fixes a bug in <code>quickLabel</code>, inside <code>shared</code>. Where is it fixed?',
              options: ['Only in the Android app', 'In both apps, once each one is rebuilt', 'Only on the iPhone'],
              a: 1,
              why: 'Both apps are built from the same Kotlin files, so one fix reaches both.',
            },
            nodes: [
              { id: 'sh', label: 'shared<small>Recipe, quickLabel</small>', x: 50, y: 9 },
              { id: 'and', label: 'Android target<small>Android code</small>', x: 22, y: 40 },
              { id: 'ios', label: 'iPhone targets<small>iosArm64, iosSimulatorArm64</small>', x: 74, y: 40 },
              { id: 'app', label: 'androidApp<small>the APK</small>', x: 22, y: 88, hidden: true },
              { id: 'fw', label: 'Shared.framework<small>machine code</small>', x: 74, y: 64, hidden: true },
              { id: 'xc', label: 'iosApp<small>Xcode project</small>', x: 74, y: 90, hidden: true },
            ],
            frames: [
              { hl: ['sh'], say: 'One Gradle module, <code>shared</code>, holds Recipes’ rules in plain Kotlin: no Android code and no iPhone code.' },
              { add: [['sh', 'and']], hl: ['and'], say: 'For the Android target, the Kotlin compiles to the same kind of code as the rest of an Android app.' },
              { show: ['app'], add: [['and', 'app']], hl: ['app'], say: '<code>androidApp</code> depends on <code>shared</code> like on any module, and the shared code ends up in its APK.' },
              { add: [['sh', 'ios']], hl: ['ios'], say: 'Kotlin/Native compiles the same files again for the iPhone targets: once for real iPhones, once for the simulator.' },
              { show: ['fw'], add: [['ios', 'fw']], hl: ['fw'], say: 'The result is packed into a framework, here named <code>Shared</code>. It is machine code: the iPhone runs it directly, with no JVM or ART.' },
              { show: ['xc'], add: [['fw', 'xc']], hl: ['xc'], say: 'The Xcode project <code>iosApp</code> uses the framework. Its Swift code can call <code>quickLabel</code>.' },
              { hl: ['sh', 'app', 'xc'], say: 'A fix in <code>shared</code> reaches both phones the next time each app is built.' },
            ],
          });
        },
        code: `// settings.gradle.kts
include(":shared")       // the KMP module: Recipes' rules, for every target
include(":androidApp")   // the Android app, with MainActivity
// iosApp/ is the Xcode project, not a Gradle module

// gradle/libs.versions.toml
// [plugins]
// kotlinMultiplatform = { id = "org.jetbrains.kotlin.multiplatform", version = "2.4.21" }
// androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version = "9.4.0" }

// shared/build.gradle.kts
plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidMultiplatformLibrary)
}

kotlin {
    android {                       // the Android target
        namespace = "com.example.recipes.shared"
        compileSdk = 37
        minSdk = 26
    }
    iosArm64 {                      // real iPhones
        binaries.framework { baseName = "Shared" }
    }
    iosSimulatorArm64 {             // the simulator on a Mac with an Apple chip
        binaries.framework { baseName = "Shared" }
    }
}

// androidApp/build.gradle.kts
dependencies {
    implementation(project(":shared"))
}`,
        play: `data class Recipe(val id: Int, val title: String, val minutes: Int)

// Recipes' rules: plain Kotlin, no Android and no iPhone code.
// This file could move to shared/src/commonMain as it is.
fun quickLabel(recipe: Recipe): String =
    if (recipe.minutes <= 20) "\${recipe.title} · quick" else "\${recipe.title} · \${recipe.minutes} min"

fun main() {
    val recipes = listOf(Recipe(1, "Pancakes", 20), Recipe(2, "Lasagne", 75), Recipe(3, "Omelette", 10))
    for (recipe in recipes) {
        println(quickLabel(recipe))
    }
    // Add a recipe of your own and see which label it gets.
}`,
        remember: 'KMP compiles one Kotlin module for several targets: Android gets its usual code, the iPhone gets machine code in a framework.',
        mistakes: [
          { title: 'Making the shared module an Android app', bad: `// shared/build.gradle.kts
plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidApplication)   // com.android.application
}`, good: `// shared/build.gradle.kts
plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidMultiplatformLibrary)
}
// MainActivity lives in androidApp, which depends on :shared`, why: 'Since AGP 9, the Kotlin Multiplatform plugin no longer works together with <code>com.android.application</code> or <code>com.android.library</code> in one module. The shared module uses <code>com.android.kotlin.multiplatform.library</code>, and the app is its own module.' },
        ],
        terms: [
          { term: 'Kotlin Multiplatform', def: 'Compiling one Kotlin module for several platforms, its <em>targets</em>, like the Android target or <code>iosArm64</code> for real iPhones, so the apps share that code. KMP for short.' },
          { term: 'JVM', def: 'The Java Virtual Machine: a program that runs compiled Java and Kotlin (JVM bytecode) on computers. Android converts that bytecode for its own runtime, ART; iPhones run neither.' },
          { term: 'Kotlin/Native', def: 'The Kotlin compiler that turns Kotlin into machine code, for platforms with no JVM or ART, such as the iPhone.' },
          { term: 'framework', def: 'A bundle of compiled code an Xcode project can use. The shared module’s iPhone builds are packed into one, here <code>Shared</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build the shared module for real iPhones and for the simulator.', code: `kotlin {
    android { /* namespace, compileSdk, minSdk */ }
    [[iosArm64]] {
        binaries.framework { baseName = "Shared" }
    }
    [[iosSimulatorArm64]] {
        binaries.framework { baseName = "Shared" }
    }
}`, why: '<code>iosArm64</code> is the target for real iPhones; <code>iosSimulatorArm64</code> is the simulator on a Mac with an Apple chip.' },
          { type: 'bug', prompt: '<code>MainActivity</code> can’t find <code>quickLabel</code>. Tap the wrong line.', code: `// androidApp/build.gradle.kts
dependencies {
    implementation(project(":androidApp"))
}`, bug: 2, fix: '    implementation(project(":shared"))', why: 'The app must depend on the module that holds the shared code, <code>:shared</code>, not on itself.' },
        ],
        quiz: [
          { q: 'What does an iPhone run from the shared module?', options: ['Kotlin code for a small JVM on the phone', 'Machine code in a framework, made by Kotlin/Native', 'The Kotlin source files, read as the app runs'], a: 1, why: 'iPhones have no JVM and no ART. Kotlin/Native compiles the shared code to machine code and packs it into a framework.' },
          { q: 'Which target is the iPhone simulator on a Mac with an Apple chip?', options: ['<code>iosArm64</code>', '<code>iosSimulatorArm64</code>', 'The Android target'], a: 1, why: '<code>iosArm64</code> is for real iPhones; the simulator needs its own build, <code>iosSimulatorArm64</code>.' },
          { q: 'With AGP 9, where does <code>MainActivity</code> go?', options: ['In <code>shared</code>', 'In its own <code>androidApp</code> module', 'In <code>iosApp</code>'], a: 1, why: 'The shared module is a library for every target. The Android app, with its activities, is a separate module that depends on it.' },
        ],
        docs: [['Kotlin Multiplatform (Android Developers)', 'https://developer.android.com/kotlin/multiplatform'], ['Recommended KMP project structure', 'https://kotlinlang.org/docs/multiplatform/multiplatform-project-recommended-structure.html']],
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'shares',
        title: 'commonMain and platform code',
        tagline: 'Each file goes in the folder for the platforms it can run on.',
        goals: ['Put code in commonMain, androidMain or iosMain', 'Tell which source sets a build compiles', 'Decide which parts of an app to share'],
        level: 'intermediate', introduces: ['commonMain', 'androidMain', 'iosMain', 'UIDevice'],
        body: `
<p>Sam moves <code>Recipe</code> and <code>quickLabel</code> into <code>shared</code>, and both apps build. Then he moves a function that reads the Android version with <code>Build.VERSION.SDK_INT</code>, and the build stops: <code>Unresolved reference 'android'.</code> The iPhone has no <code>android</code> package, so code meant for every target can’t use it.</p>
<p>So <code>shared/src</code> is split into <em>source sets</em>: folders that each go into some of the targets. <code>commonMain</code> goes into every target, so it may only use Kotlin and multiplatform libraries. <code>androidMain</code> goes only into the Android build and may use Android classes like <code>Context</code> and <code>Build</code>. <code>iosMain</code> goes only into the iPhone builds and may use Apple’s iPhone classes, like <code>UIDevice</code>, which describes the phone. Kotlin creates <code>iosMain</code> for you because you declared iPhone targets; both then share it, so a real iPhone and the simulator run the same code.</p>
<p>A file sees its own source set and <code>commonMain</code>. <code>commonMain</code> sees neither of the others, and <code>androidMain</code> and <code>iosMain</code> never see each other. To decide what goes where, ask what a piece of code touches. Data classes, rules like <code>quickLabel</code>, coroutines, Flow and kotlinx.serialization work everywhere: share them. Notifications, permissions, WorkManager and Hilt are Android only, so they stay in the Android app. Start with models and rules, then move the data layer, then the ViewModels.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            predict: {
              q: 'Sam builds the app for the iPhone simulator. Which source sets are compiled?',
              options: ['<code>commonMain</code> and <code>iosMain</code>', 'Only <code>iosMain</code>', 'All three, <code>androidMain</code> too'],
              a: 0,
              why: 'A build compiles its own source sets plus <code>commonMain</code> above them. <code>androidMain</code> is on the other branch.',
            },
            nodes: [
              { id: 'common', label: 'commonMain<small>every target</small>', x: 50, y: 10 },
              { id: 'and', label: 'androidMain<small>Android build</small>', x: 22, y: 46 },
              { id: 'ios', label: 'iosMain<small>iPhone builds</small>', x: 76, y: 46 },
              { id: 'arm', label: 'iosArm64<small>real iPhone</small>', x: 44, y: 86, hidden: true },
              { id: 'sim', label: 'iosSimulator<wbr>Arm64<small>simulator</small>', x: 82, y: 86, hidden: true },
            ],
            frames: [
              { hl: ['common'], say: '<code>shared/src</code> holds one folder per source set. <code>commonMain</code> is at the top: it goes into every target.' },
              { add: [['common', 'and'], ['common', 'ios']], say: '<code>androidMain</code> and <code>iosMain</code> sit below it. Code in them can use everything in <code>commonMain</code>, but not each other.' },
              { show: ['arm', 'sim'], add: [['ios', 'arm'], ['ios', 'sim']], hl: ['arm', 'sim'], say: 'Below <code>iosMain</code> are the two iPhone targets. Kotlin made <code>iosMain</code> so both get the same code.' },
              { hl: ['common', 'ios', 'sim'], say: 'Building for the simulator compiles <code>commonMain</code> and <code>iosMain</code>. <code>androidMain</code> isn’t part of that build.' },
              { hl: ['common', 'and'], say: 'Building the Android app compiles <code>commonMain</code> and <code>androidMain</code>. Nothing from <code>iosMain</code> gets in.' },
              { hl: ['and'], say: 'A function using <code>Build.VERSION.SDK_INT</code> goes in <code>androidMain</code>. One using <code>UIDevice</code> goes in <code>iosMain</code>.' },
              { hl: ['common'], say: 'Put <code>import android.os.Build</code> in a <code>commonMain</code> file and the build stops with <code>Unresolved reference \'android\'.</code>, because that code must also run on iPhones.' },
            ],
          });
        },
        code: `// shared/src/commonMain/kotlin/com/example/recipes/Recipe.kt   (every target)
package com.example.recipes

data class Recipe(val id: Int = 0, val title: String, val minutes: Int, val favorite: Boolean = false)

fun quickLabel(recipe: Recipe): String =
    if (recipe.minutes <= 20) "\${recipe.title} · quick" else "\${recipe.title} · \${recipe.minutes} min"

// shared/src/androidMain/kotlin/com/example/recipes/Device.android.kt   (Android only)
package com.example.recipes

import android.os.Build

fun androidVersion(): String = "Android \${Build.VERSION.SDK_INT}"   // Android 36

// shared/src/iosMain/kotlin/com/example/recipes/Device.ios.kt   (iPhone and simulator)
package com.example.recipes

import platform.UIKit.UIDevice   // Apple's iPhone classes live under platform.

fun iosVersion(): String =
    UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion   // iOS 26.0

// commonMain can call quickLabel, but neither androidVersion nor iosVersion.`,
        remember: 'commonMain goes into every target; androidMain only into Android; iosMain only into the iPhone builds.',
        terms: [
          { term: 'source set', def: 'A folder of a KMP module whose code goes into some of the targets, like <code>commonMain</code> or <code>iosMain</code>.' },
          { term: 'commonMain', def: 'The source set compiled for every target. It may only use Kotlin and multiplatform libraries.' },
          { term: 'platform code', def: 'Code that uses one platform’s own classes, like <code>Build</code> on Android or <code>UIDevice</code> on iOS. It goes in <code>androidMain</code> or <code>iosMain</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Put each file in the right source set.', code: `shared/src/[[commonMain]]/kotlin/Recipe.kt      // every target
shared/src/androidMain/kotlin/Device.android.kt // Android only
shared/src/[[iosMain]]/kotlin/Device.ios.kt      // iPhone and simulator`, why: 'Code for every target goes in <code>commonMain</code>; code for both iPhone targets goes in <code>iosMain</code>.' },
          { type: 'bug', prompt: 'The iPhone build fails with <code>Unresolved reference \'android\'.</code> Tap the line to change.', code: `// shared/src/commonMain/kotlin/Device.kt
import android.os.Build

fun androidVersion(): String = "Android \${Build.VERSION.SDK_INT}"`, bug: 0, fix: '// shared/src/androidMain/kotlin/Device.kt', why: 'The code is fine for Android. It is in the wrong folder: in <code>commonMain</code> it must also compile for iPhones, which have no <code>android</code> package.' },
        ],
        quiz: [
          { q: 'Which source set may use <code>Context</code>?', options: ['<code>commonMain</code>', '<code>androidMain</code>', '<code>iosMain</code>'], a: 1, why: '<code>Context</code> is an Android class, so only code that goes into the Android build may use it.' },
          { q: 'What can a file in <code>iosMain</code> call?', options: ['Code in <code>iosMain</code> and <code>commonMain</code>', 'Only code in <code>iosMain</code>', 'Code in every source set, <code>androidMain</code> too'], a: 0, why: 'A file sees its own source set and <code>commonMain</code>. <code>androidMain</code> isn’t in the iPhone build at all.' },
          { q: 'Which of these belongs in <code>commonMain</code>?', options: ['<code>MainActivity</code>', 'A WorkManager worker', '<code>quickLabel(recipe: Recipe)</code>'], a: 2, why: '<code>quickLabel</code> is plain Kotlin and works on every target. The other two are Android only.' },
        ],
        docs: [['The basics of KMP project structure', 'https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html']],
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'expect',
        title: 'expect and actual',
        tagline: 'Common code asks for something, and each platform supplies it.',
        goals: ['Declare an expect function in commonMain and its actual in each platform', 'Explain what the compiler checks about the pairs', 'Choose between expect/actual and an interface'],
        level: 'intermediate', introduces: ['expect', 'actual'],
        body: `
<p>Recipes’ About text should name the system it runs on: “Recipes on Android 36” or “Recipes on iOS 26.0”. The text is the same on both phones, so it belongs in <code>commonMain</code>. But <code>commonMain</code> can’t call <code>Build</code> or <code>UIDevice</code>.</p>
<p>Write <code>expect fun platformName(): String</code> in <code>commonMain</code>: a function with a name, parameters and a return type, but no body. It is a promise that each platform will supply one. In <code>androidMain</code> and in <code>iosMain</code>, in the same package, write <code>actual fun platformName(): String = ...</code> with the body for that platform. Common code calls <code>platformName()</code> like any function, and each target’s build uses its own <code>actual</code>.</p>
<p>The compiler checks the pairs. Every target needs exactly one <code>actual</code> with the same name, parameters and return type. If <code>iosMain</code> has none, the iPhone build fails with an error saying <code>platformName</code> has no actual declaration, while the Android build still works. Name the files with the platform at the end, like <code>Platform.android.kt</code>, so they don’t clash with <code>Platform.kt</code> in <code>commonMain</code>.</p>
<p>Use <code>expect</code> for small functions and values. When the platform part needs something passed in, like an Android <code>Context</code>, or a test should swap it for a fake, the Kotlin docs recommend an interface in <code>commonMain</code> and one class per platform, passed in through the constructor as in the DI lesson. Kotlin also has <code>expect class</code>, but it is still Beta and the compiler warns about it.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `// commonMain
expect fun platformName(): String
fun aboutText(): String = "Recipes on \${platformName()}"

// androidMain
actual fun platformName(): String = "Android \${Build.VERSION.SDK_INT}"

// iosMain
actual fun platformName(): String =
    UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion`,
            outTitle: 'aboutText()',
            predict: {
              q: 'Lin runs the iPhone app and opens About. Which body does <code>platformName()</code> run?',
              options: ['The one in <code>iosMain</code>', 'The one in <code>androidMain</code>', 'Both, and the app picks one as it runs'],
              a: 0,
              why: 'Each target is compiled from its own source sets. The iPhone build contains only the <code>iosMain</code> actual.',
            },
            frames: [
              { line: 2, say: '<code>commonMain</code> promises <code>platformName()</code>: no parameters, a <code>String</code> back, and no body.' },
              { line: 3, say: '<code>aboutText()</code> calls it like any function. It doesn’t know which phone it runs on.' },
              { line: 6, out: 'Recipes on Android 36', say: 'Building the Android app, the compiler uses the <code>androidMain</code> actual. On an Android 16 phone the text is <code>Recipes on Android 36</code>.' },
              { line: [9, 10], out: 'Recipes on iOS 26.0', say: 'Building for the iPhone, it uses the <code>iosMain</code> actual. On an iPhone with iOS 26.0: <code>Recipes on iOS 26.0</code>.' },
              { line: 9, say: 'Each app holds only its own actual: the Android app has no <code>UIDevice</code> code in it at all.' },
              { line: 2, say: 'Delete the <code>iosMain</code> actual and the iPhone build fails, saying <code>platformName</code> has no actual declaration. The Android build still works.' },
            ],
          });
        },
        code: `// shared/src/commonMain/kotlin/com/example/recipes/Platform.kt
package com.example.recipes

expect fun platformName(): String

fun aboutText(): String = "Recipes on \${platformName()}"

// shared/src/androidMain/kotlin/com/example/recipes/Platform.android.kt
package com.example.recipes

import android.os.Build

actual fun platformName(): String = "Android \${Build.VERSION.SDK_INT}"

// shared/src/iosMain/kotlin/com/example/recipes/Platform.ios.kt
package com.example.recipes

import platform.UIKit.UIDevice

actual fun platformName(): String =
    UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion

// aboutText() on Android 16:      Recipes on Android 36
// aboutText() on iOS 26.0:        Recipes on iOS 26.0`,
        remember: 'expect promises it in commonMain; each target keeps the promise with one actual, or that target doesn’t build.',
        mistakes: [
          { title: 'An expect class for something that needs a Context', bad: `// commonMain
expect class Sharer {
    fun share(text: String)
}
// androidMain needs a Context to share, but where does it come from?`, good: `// commonMain
interface Sharer {
    fun share(text: String)
}

// androidMain
class AndroidSharer(private val context: Context) : Sharer {
    override fun share(text: String) { /* start a share Intent */ }
}`, why: 'An <code>expect class</code> is Beta and allows one implementation per target. An interface lets each platform class take what it needs in its constructor, and a test can pass a fake.' },
        ],
        terms: [
          { term: 'expect', def: 'Marks a declaration in <code>commonMain</code> with no body: a promise that every target supplies one.' },
          { term: 'actual', def: 'Marks the platform’s version of an <code>expect</code> declaration, in the same package, with the same name, parameters and type.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Promise an app version in common code and supply it on iOS.', code: `// commonMain
[[expect]] fun appVersion(): String

// iosMain
[[actual]] fun appVersion(): String = "1.4"`, why: '<code>expect</code> declares it without a body in <code>commonMain</code>; <code>actual</code> gives each platform’s body.' },
          { type: 'bug', prompt: 'The Android build fails: the actual doesn’t match. Tap the wrong line.', code: `// commonMain
expect fun platformName(): String

// androidMain
actual fun platformName(): Int = Build.VERSION.SDK_INT`, bug: 4, fix: 'actual fun platformName(): String = "Android ${Build.VERSION.SDK_INT}"', why: 'An actual must match its expect exactly: the same name, parameters and return type. The promise was a <code>String</code>.' },
        ],
        quiz: [
          { q: '<code>iosMain</code> has no actual for <code>platformName</code>. What happens?', options: ['The iPhone build fails; the Android build still works', 'The iPhone app crashes when it calls it', 'The iPhone uses the Android actual'], a: 0, why: 'The compiler checks every target. The one without an actual doesn’t build.' },
          { q: 'What does an <code>expect fun</code> contain?', options: ['A default body the platforms may replace', 'Only its name, parameters and return type', 'A body for each platform'], a: 1, why: 'The <code>expect</code> has no body. The bodies are in the <code>actual</code> functions.' },
          { q: 'Sharing needs an Android <code>Context</code>, and tests need a fake. What do the Kotlin docs recommend?', options: ['An <code>expect class</code>', 'An interface in <code>commonMain</code> and one class per platform, passed in', 'Copying the code into each app'], a: 1, why: 'Each class takes what it needs in its constructor, and a test can pass a fake that implements the interface.' },
        ],
        docs: [['Expected and actual declarations', 'https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html']],
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'data',
        title: 'Shared networking with Ktor',
        tagline: 'Ktor sends Recipes’ requests from commonMain; each platform supplies only the engine.',
        goals: ['Call a server from commonMain with a Ktor HttpClient', 'Give each platform its own Ktor engine', 'Explain why Retrofit and other JVM-only libraries can’t go in commonMain'],
        level: 'intermediate', introduces: ['HttpClient', 'HttpClientEngine', 'ContentNegotiation', 'OkHttp', 'Darwin'],
        body: `
<p>Sam wants the repository from the arch track in <code>shared</code>, so both apps load and save recipes the same way. It fetches recipes with Retrofit, and Retrofit only runs on the JVM, so the iPhone build can’t use it. Every library <code>commonMain</code> uses must be multiplatform itself. This lesson moves the network part; the next one moves the database.</p>
<p>For the network, use <em>Ktor</em>, JetBrains’ multiplatform HTTP client. <code>HttpClient(engine) { install(ContentNegotiation) { json(...) } }</code> makes a client that decodes JSON with kotlinx.serialization, which already runs everywhere. <code>client.get(url).body()</code> sends a GET request and turns the answer into your type. The <em>engine</em> is the part that does the actual network work, and it comes from the platform: OkHttp on Android, Darwin, Apple’s own networking, on the iPhone. <code>commonMain</code> depends on <code>ktor-client-core</code>; <code>androidMain</code> and <code>iosMain</code> each add their engine.</p>
<p>When a request fails, for example with no network, Ktor throws an <code>IOException</code>. Ktor’s errors use <code>kotlinx.io</code>, Kotlin’s multiplatform input/output library that Ktor brings along, so shared code catches <code>kotlinx.io.IOException</code>. On Android it is the same class as <code>java.io.IOException</code>. Build one <code>HttpClient</code> per app and pass it to the classes that need it through their constructor.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'api', label: 'RecipeApi', sub: 'commonMain' },
              { id: 'client', label: 'HttpClient', sub: 'ContentNegotiation' },
              { id: 'eng', label: 'Engine', sub: 'Darwin on iPhone' },
              { id: 'srv', label: 'Server', sub: 'api.example.com' },
            ],
            predict: {
              q: 'Lin’s iPhone is offline when <code>api.recipes()</code> runs. What happens?',
              options: ['It returns an empty list', 'It throws an <code>IOException</code> from kotlinx.io', 'The app crashes inside Ktor'],
              a: 1,
              why: 'The engine can’t reach the server, so Ktor throws an <code>IOException</code>. The code that called <code>recipes()</code> decides what to do with it.',
            },
            frames: [
              { at: 'api', packet: 'GET', say: 'Lin taps Refresh on her iPhone. <code>api.recipes()</code>, in <code>commonMain</code>, calls <code>client.get(...)</code>.' },
              { at: 'client', packet: 'GET', say: 'The shared <code>HttpClient</code> builds the request. It doesn’t know which phone it runs on.' },
              { at: 'eng', packet: 'GET', say: 'The engine does the network work. In the iPhone build it is Darwin, Apple’s own networking; in the Android build it is OkHttp.' },
              { at: 'srv', packet: 'JSON', mark: { srv: 'ok' }, say: 'The server answers with a JSON list of recipes.' },
              { at: 'api', packet: 'recipes', tone: 'ok', mark: { api: 'ok' }, say: '<code>ContentNegotiation</code> decodes the JSON with kotlinx.serialization, and <code>body()</code> returns a <code>List&lt;RecipeDto&gt;</code>.' },
              { at: 'srv', packet: '✕', tone: 'err', mark: { srv: 'err' }, say: 'Later Lin is offline and taps Refresh again. The engine can’t reach the server.' },
              { at: 'api', packet: 'IOException', tone: 'err', mark: { api: 'err' }, say: 'Ktor throws a <code>kotlinx.io.IOException</code>, on the iPhone and on Android alike. The caller catches it.' },
            ],
          });
        },
        code: `// shared/build.gradle.kts (plus the serialization plugin, as in the data track)
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("io.ktor:ktor-client-core:3.6.0")
            implementation("io.ktor:ktor-client-content-negotiation:3.6.0")
            implementation("io.ktor:ktor-serialization-kotlinx-json:3.6.0")
        }
        androidMain.dependencies { implementation("io.ktor:ktor-client-okhttp:3.6.0") }
        iosMain.dependencies { implementation("io.ktor:ktor-client-darwin:3.6.0") }
    }
}

// commonMain/kotlin/com/example/recipes/data/RecipeApi.kt   (RecipeDto as in the data track)
class RecipeApi(private val client: HttpClient) {
    // throws kotlinx.io.IOException when offline
    suspend fun recipes(): List<RecipeDto> = client.get("https://api.example.com/recipes").body()
}

fun createHttpClient(engine: HttpClientEngine): HttpClient = HttpClient(engine) {
    install(ContentNegotiation) { json(Json { ignoreUnknownKeys = true }) }
}

// androidApp: val api = RecipeApi(createHttpClient(OkHttp.create()))
// iosMain:    val api = RecipeApi(createHttpClient(Darwin.create()))`,
        remember: 'In commonMain, Ktor’s HttpClient sends the requests; only the engine is per platform: OkHttp on Android, Darwin on the iPhone.',
        mistakes: [
          { title: 'A new HttpClient for every request', bad: `suspend fun loadRecipes(): List<RecipeDto> {
    val client = createHttpClient(Darwin.create())
    return client.get("https://api.example.com/recipes").body()
}`, good: `class RecipeApi(private val client: HttpClient) {   // one client, passed in
    suspend fun recipes(): List<RecipeDto> = client.get("https://api.example.com/recipes").body()
}`, why: 'Each <code>HttpClient</code> sets up its own connections and threads, and this one is never closed. Make one client per app and pass it to the classes that need it.' },
        ],
        terms: [
          { term: 'Ktor', def: 'JetBrains’ multiplatform HTTP client. <code>HttpClient</code> sends requests; plugins like <code>ContentNegotiation</code> add JSON decoding.' },
          { term: 'engine', def: 'The part of Ktor that does the network work on one platform: OkHttp on Android, Darwin on the iPhone. Created with <code>OkHttp.create()</code> or <code>Darwin.create()</code>.' },
          { term: 'kotlinx.io', def: 'Kotlin’s multiplatform input/output library, which Ktor brings along. Its <code>IOException</code> is what shared code catches; on Android it is <code>java.io.IOException</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give each platform its Ktor engine.', code: `androidMain.dependencies { implementation("io.ktor:ktor-client-[[okhttp]]:3.6.0") }
iosMain.dependencies { implementation("io.ktor:ktor-client-[[darwin]]:3.6.0") }`, why: 'Android uses the OkHttp engine; the iPhone uses Darwin, Apple’s own networking.' },
          { type: 'bug', prompt: 'This is in <code>commonMain</code>, and the iPhone build can’t find <code>OkHttp</code>. Tap the wrong line.', code: `// commonMain
fun createHttpClient(): HttpClient = HttpClient(OkHttp.create()) {
    install(ContentNegotiation) { json(Json { ignoreUnknownKeys = true }) }
}`, bug: 1, fix: 'fun createHttpClient(engine: HttpClientEngine): HttpClient = HttpClient(engine) {', why: 'OkHttp is the Android engine, added only to <code>androidMain</code>. Shared code takes the engine as a parameter, and each platform passes its own.' },
        ],
        quiz: [
          { q: 'Why can’t the shared repository keep using Retrofit?', options: ['Retrofit only runs on the JVM, and <code>commonMain</code> is also built for the iPhone', 'Retrofit can’t decode JSON', 'Room doesn’t allow it'], a: 0, why: 'Every library in <code>commonMain</code> must work on every target. Ktor does; Retrofit doesn’t.' },
          { q: 'What does a Ktor engine do?', options: ['Decodes JSON into data classes', 'The platform’s network work: OkHttp on Android, Darwin on the iPhone', 'Saves the answer in Room'], a: 1, why: 'The client and its plugins are shared. Only the engine that talks to the network is per platform.' },
          { q: 'Shared code wants to handle “offline”. Which exception does it catch?', options: ['<code>kotlinx.io.IOException</code>', '<code>java.io.IOException</code>', 'None: Ktor returns an empty list'], a: 0, why: '<code>java.io</code> is a JVM package, missing on the iPhone. Ktor throws <code>kotlinx.io.IOException</code>, which exists on every target.' },
        ],
        docs: [['Ktor: create a cross-platform mobile app', 'https://ktor.io/docs/client-create-multiplatform-application.html'], ['Ktor client engines', 'https://ktor.io/docs/client-engines.html']],
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'local-db',
        title: 'Room in shared code',
        tagline: 'Room 3 keeps the saved recipes in commonMain; each platform only says where the file goes.',
        goals: ['Move Room’s entity, DAO and database to commonMain', 'Set up BundledSQLiteDriver and Room’s code generator for every target', 'Build the database and the repository on each platform'],
        level: 'intermediate', introduces: ['BundledSQLiteDriver', 'ConstructedBy', 'RoomDatabaseConstructor'],
        body: `
<p><code>RecipeApi</code> is shared now, but the repository also needs the saved recipes: <code>refresh()</code> writes to Room, and the screen reads Room’s Flow. Room 3 is multiplatform, and Google’s KMP guide uses it. <code>Recipe</code>, <code>RecipeDao</code> and <code>RecipesDatabase</code> move to <code>commonMain</code> unchanged, with two additions.</p>
<p>First, <code>@ConstructedBy</code> names an <code>expect object</code> that Room’s KSP code generator fills in with an <code>actual</code> for every target, so KSP runs once per target: <code>kspAndroid</code>, <code>kspIosArm64</code> and <code>kspIosSimulatorArm64</code>. Second, the driver is <code>BundledSQLiteDriver</code>, which brings its own copy of SQLite, so every platform behaves the same.</p>
<p>Only the file location is per platform: Android gives a <code>Context</code> and a name, the iPhone a path in the app’s Documents folder, which <code>NSFileManager</code>, Apple’s file helper, finds. Each app builds one database and one <code>HttpClient</code> and passes them to <code>RecipeRepository</code>. Two other multiplatform options exist: SQLDelight, which generates Kotlin from SQL you write in <code>.sq</code> files, and DataStore, for small settings.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'ui', label: 'Screen', sub: 'Android or iPhone' },
              { id: 'repo', label: 'RecipeRepository', sub: 'commonMain' },
              { id: 'room', label: 'Room', sub: 'BundledSQLiteDriver' },
              { id: 'ktor', label: 'Ktor', sub: 'Darwin on iPhone' },
              { id: 'srv', label: 'Server', sub: 'api.example.com' },
            ],
            predict: {
              q: 'Lin’s iPhone is offline and she taps Refresh. What does the screen show?',
              options: ['The recipes already saved in Room', 'An empty list', 'Nothing: the app crashes'],
              a: 0,
              why: 'The list comes from Room’s Flow. The failed request only throws inside <code>refresh()</code>, and the code that called it catches the error.',
            },
            frames: [
              { at: 'ui', packet: 'open', say: 'Lin opens Recipes on her iPhone. The screen asks the shared <code>RecipeRepository</code> for recipes.' },
              { at: 'room', packet: 'rows', mark: { room: 'ok' }, say: '<code>recipes</code> is Room’s Flow, the same <code>getAll()</code> as on Android. The saved rows arrive at once.' },
              { at: 'ktor', packet: 'GET', say: 'She taps Refresh. <code>refresh()</code> calls <code>RecipeApi</code>, and on the iPhone Ktor’s Darwin engine sends the request.' },
              { at: 'srv', packet: '✕', tone: 'err', mark: { srv: 'err' }, say: 'No network. The engine fails, and Ktor throws a <code>kotlinx.io.IOException</code>.' },
              { at: 'repo', packet: 'IOException', tone: 'err', mark: { ktor: 'err' }, say: 'The exception leaves <code>refresh()</code> before <code>upsertAll</code>. Nothing was written to Room, so the saved rows are untouched.' },
              { at: 'ui', packet: 'saved list', tone: 'ok', mark: { ui: 'ok' }, say: 'The caller catches it and shows “Offline: showing saved recipes”. On Android the same code runs, with OkHttp as the engine.' },
            ],
          });
        },
        code: `// shared/build.gradle.kts (plus the KSP and androidx.room3 plugins, as in the data track)
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("androidx.room3:room3-runtime:3.0.3")
            implementation("androidx.sqlite:sqlite-bundled:2.7.1")
        }
    }
}
dependencies {                       // Room's code generator runs once per target
    add("kspAndroid", "androidx.room3:room3-compiler:3.0.3")
    add("kspIosArm64", "androidx.room3:room3-compiler:3.0.3")
    add("kspIosSimulatorArm64", "androidx.room3:room3-compiler:3.0.3")
}

// commonMain: Recipe, RecipeDao and toRecipe() as in the data track
@Database(entities = [Recipe::class], version = 1)
@ConstructedBy(RecipesDatabaseConstructor::class)
abstract class RecipesDatabase : RoomDatabase() {
    abstract fun recipeDao(): RecipeDao
}

@Suppress("KotlinNoActualForExpect")   // Room's KSP writes the actual for every target
expect object RecipesDatabaseConstructor : RoomDatabaseConstructor<RecipesDatabase> {
    override fun initialize(): RecipesDatabase
}

fun buildDatabase(builder: RoomDatabase.Builder<RecipesDatabase>): RecipesDatabase =
    builder.setDriver(BundledSQLiteDriver()).build()

class RecipeRepository(private val dao: RecipeDao, private val api: RecipeApi) {
    val recipes: Flow<List<Recipe>> = dao.getAll()

    suspend fun refresh() {                       // throws kotlinx.io.IOException when offline
        val favorites = dao.getAll().first().filter { it.favorite }.map { it.id }
        dao.upsertAll(api.recipes().map { it.toRecipe(favorite = favorites.contains(it.id)) })
    }
}

// androidApp, MainActivity.onCreate:
// val db = buildDatabase(Room.databaseBuilder<RecipesDatabase>(applicationContext, "recipes.db"))
// val repository = RecipeRepository(db.recipeDao(), RecipeApi(createHttpClient(OkHttp.create())))

// iosMain/kotlin/com/example/recipes/IosRepository.kt
fun iosRepository(): RecipeRepository {
    val documents = NSFileManager.defaultManager.URLForDirectory(   // the app's Documents folder,
        directory = NSDocumentDirectory,                            // as in Google's KMP guide
        inDomain = NSUserDomainMask,
        appropriateForURL = null,
        create = false,
        error = null,
    )
    val path = requireNotNull(documents?.path) + "/recipes.db"     // requireNotNull: stop with an error if null
    val db = buildDatabase(Room.databaseBuilder<RecipesDatabase>(name = path))
    return RecipeRepository(db.recipeDao(), RecipeApi(createHttpClient(Darwin.create())))
}`,
        remember: 'Room 3 runs in commonMain with BundledSQLiteDriver and KSP for every target. Only the database file location is per platform.',
        terms: [
          { term: 'BundledSQLiteDriver', def: 'A Room driver that brings its own SQLite, so the database behaves the same on every platform. It works in <code>commonMain</code>.' },
          { term: '@ConstructedBy', def: 'Names the <code>expect object</code> that makes the database. Room’s KSP code generator writes its <code>actual</code> for every target.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let Room make the database on every target, with its own SQLite.', code: `@Database(entities = [Recipe::class], version = 1)
@[[ConstructedBy]](RecipesDatabaseConstructor::class)
abstract class RecipesDatabase : RoomDatabase() {
    abstract fun recipeDao(): RecipeDao
}

fun buildDatabase(builder: RoomDatabase.Builder<RecipesDatabase>): RecipesDatabase =
    builder.setDriver([[BundledSQLiteDriver]]()).build()`, why: '<code>@ConstructedBy</code> points Room to the object KSP fills in per target; <code>BundledSQLiteDriver</code> brings the same SQLite to every platform.' },
          { type: 'bug', prompt: 'This is in <code>commonMain</code>, and the iPhone build fails with <code>Unresolved reference \'AndroidSQLiteDriver\'.</code> Tap the wrong line.', code: `fun buildDatabase(builder: RoomDatabase.Builder<RecipesDatabase>): RecipesDatabase =
    builder.setDriver(AndroidSQLiteDriver()).build()`, bug: 1, fix: '    builder.setDriver(BundledSQLiteDriver()).build()', why: '<code>AndroidSQLiteDriver</code> uses Android’s own SQLite, so it only exists on Android. <code>BundledSQLiteDriver</code> brings its own SQLite and works on every target.' },
        ],
        quiz: [
          { q: 'What is per platform in the Room setup?', options: ['The entity and the DAO', 'The SQL queries', 'Where the database file goes'], a: 2, why: 'Entity, DAO and database are in <code>commonMain</code>. Each platform only makes the builder with its own file location.' },
          { q: 'Why does <code>room3-compiler</code> appear three times in <code>dependencies</code>?', options: ['Room’s code generator runs once per target, to write each <code>actual</code>', 'Each copy adds more tables', 'Gradle needs three copies to be safe'], a: 0, why: 'KSP runs for <code>kspAndroid</code>, <code>kspIosArm64</code> and <code>kspIosSimulatorArm64</code>, and each run writes that target’s <code>actual</code> for the database object.' },
          { q: 'Lin is offline and taps Refresh. What happens to the saved recipes?', options: ['They are deleted', 'They stay: the request throws before anything is written', 'They are replaced by an empty list'], a: 1, why: '<code>api.recipes()</code> throws first, so <code>upsertAll</code> never runs and Room keeps its rows.' },
        ],
        docs: [['Set up Room for KMP', 'https://developer.android.com/kotlin/multiplatform/room']],
      },
      // 6 ─────────────────────────────────────────────
      {
        id: 'viewmodels',
        title: 'Shared ViewModels',
        tagline: 'One RecipesViewModel in commonMain, kept and cleared by each platform.',
        goals: ['Move a ViewModel to commonMain with the multiplatform lifecycle library', 'Explain who keeps and clears a ViewModel on Android and on the iPhone', 'Keep a shared ViewModel free of Android and JVM classes'],
        level: 'intermediate', introduces: ['ViewModelStore', 'ViewModelProvider', 'viewModelFactory', 'initializer'],
        body: `
<p>Both apps now share the repository, but each still has its own screen logic: the note, the Refresh button, the loading flag. The iPhone version already shows “Offline” differently from Android. That logic is <code>RecipesViewModel</code> from the arch track, and it can be shared too.</p>
<p>Jetpack’s <code>androidx.lifecycle:lifecycle-viewmodel</code> is multiplatform since 2.8.0. Add it to <code>commonMain</code> and the class moves unchanged: <code>ViewModel</code>, <code>viewModelScope</code>, <code>StateFlow</code> and <code>init</code> all work on every target. Two things change: catch <code>kotlinx.io.IOException</code> instead of <code>java.io.IOException</code>, and drop Hilt, which only runs on Android, so the ViewModel takes its repository through a plain constructor. As in Google’s guide, add the library with <code>api(...)</code> instead of <code>implementation(...)</code> and list it with <code>export(...)</code> in the framework settings, so Swift sees the <code>ViewModel</code> class by name.</p>
<p>What differs is who keeps the ViewModel and who clears it. On Android nothing changes: <code>viewModel { RecipesViewModel(repository) }</code> stores it in the Activity’s <code>ViewModelStore</code>, which survives rotation and is cleared when the Activity finishes. iOS doesn’t rebuild a screen when the phone turns, but something must still clear the ViewModel when the screen closes, or its work keeps running. In <code>iosMain</code>, make a <code>ViewModelStore</code> per screen and get the ViewModel from it: <code>ViewModelProvider.create(store, factory)[RecipesViewModel::class]</code> returns the store’s <code>RecipesViewModel</code>, making it the first time, and <code>viewModelFactory { initializer { ... } }</code> is the factory that says how to make one. Keep the holder in a Swift object that SwiftUI keeps alive for the screen (one marked <code>@StateObject</code>), and call <code>clear()</code> in its <code>deinit</code>, the code Swift runs when the object is thrown away. Google’s KMP ViewModel guide does the same with its <code>IosViewModelStoreOwner</code>. Reading <code>uiState</code> from SwiftUI needs a helper library; see Calling Kotlin from Swift.</p>`,
        visual(el) {
          const list = (bar, note) => `<div class="ui-m-bar">${bar}</div><div class="ui-m-body"><div class="ui-m-row"><div>Omelette · quick</div></div><div class="ui-m-row"><div>Pancakes · quick</div></div><div class="ui-m-row"><div>Lasagne · 75 min</div></div>${note ? `<div class="ui-m-muted">${note}</div>` : ''}</div>`;
          const home = label => `<div class="ui-m-center"><div class="ui-m-muted">${label}</div></div>`;
          Lab.ui.phone(el, {
            logTitle: 'RecipesViewModel',
            predict: {
              q: 'On the iPhone, Lin closes the Recipes screen during a refresh, and nothing calls <code>clear()</code>. What happens to the refresh?',
              options: ['It stops on its own', 'It keeps running, and the ViewModel stays in memory', 'The app crashes'],
              a: 1,
              why: 'Only clearing the store ends <code>viewModelScope</code>. If nobody clears it, the ViewModel and its work live on.',
            },
            frames: [
              { screen: list('Recipes (Android)', ''), log: 'Android: created by viewModel { }', say: 'Android: <code>MainActivity</code> gets the shared <code>RecipesViewModel</code> with <code>viewModel { }</code>, as in the arch track.' },
              { log: 'Android: rotated, same object', say: 'Lin turns the phone. The Activity is recreated; the ViewModel isn’t, because the Activity’s <code>ViewModelStore</code> keeps it.' },
              { screen: home('Home screen'), log: 'Android: Back, onCleared(), viewModelScope cancelled', say: 'Back finishes the Activity. Android clears its store: <code>onCleared()</code> runs and any refresh in <code>viewModelScope</code> stops.' },
              { screen: list('Recipes (iPhone)', 'Refreshing…'), log: 'iPhone: RecipesHolder made, created', say: 'iPhone: the same class, from the <code>Shared</code> framework. When the screen opens, Swift makes a <code>RecipesHolder</code>, which owns a <code>ViewModelStore</code>.' },
              { log: 'iPhone: rotated, nothing rebuilt', say: 'iOS doesn’t rebuild a screen when the phone turns, so there is nothing to survive. Here the ViewModel holds the state and owns the work.' },
              { screen: home('Home screen'), log: 'iPhone: closed, no clear(): refresh still running', say: 'Lin closes the screen during a refresh, and the Swift code never calls <code>clear()</code>. The ViewModel and its refresh live on, with nobody watching.' },
              { log: 'iPhone: clear(), onCleared(), viewModelScope cancelled', say: 'With <code>holder.clear()</code> in the <code>deinit</code> of the Swift object that owns the screen, the iPhone gets what Android does: the store clears the ViewModel and cancels its scope.' },
            ],
          });
        },
        code: `// shared/build.gradle.kts, as in Google's KMP ViewModel guide
kotlin {
    iosArm64 {
        binaries.framework {
            baseName = "Shared"
            export("androidx.lifecycle:lifecycle-viewmodel:2.11.0")   // Swift sees ViewModel by name
        }
    }
    // the same for iosSimulatorArm64
    sourceSets {
        commonMain.dependencies {
            api("androidx.lifecycle:lifecycle-viewmodel:2.11.0")      // export needs api, not implementation
        }
    }
}

// commonMain/kotlin/com/example/recipes/ui/RecipesViewModel.kt
import kotlinx.io.IOException      // not java.io: commonMain is also built for the iPhone

class RecipesViewModel(private val repository: RecipeRepository) : ViewModel() {
    private val _uiState = MutableStateFlow(RecipesUiState())
    val uiState: StateFlow<RecipesUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.recipes.collect { list -> _uiState.value = _uiState.value.copy(recipes = list) }
        }
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            try {
                repository.refresh()
                _uiState.value = _uiState.value.copy(note = "")
            } catch (e: IOException) {
                _uiState.value = _uiState.value.copy(note = "Offline: showing saved recipes")
            }
        }
    }
}

// androidApp, MainActivity: unchanged
// setContent { val viewModel = viewModel { RecipesViewModel(repository) }; RecipesScreen(viewModel) }

// iosMain/kotlin/com/example/recipes/RecipesHolder.kt: one per iPhone screen
class RecipesHolder(repository: RecipeRepository) {
    private val store = ViewModelStore()
    val viewModel: RecipesViewModel = ViewModelProvider.create(
        store,
        viewModelFactory { initializer { RecipesViewModel(repository) } },
    )[RecipesViewModel::class]

    fun clear() {
        store.clear()              // onCleared() runs, viewModelScope is cancelled
    }
}
// Swift keeps a RecipesHolder in a @StateObject for the screen and calls clear() in its deinit.`,
        remember: 'The ViewModel class is shared; its owner is not. Android’s Activity clears it for you; on the iPhone, clear its ViewModelStore when the screen closes.',
        mistakes: [
          { title: 'Hilt annotations in commonMain', bad: `// commonMain
@HiltViewModel
class RecipesViewModel @Inject constructor(
    private val repository: RecipeRepository,
) : ViewModel()
// Unresolved reference 'dagger'. (from import dagger.hilt...)`, good: `// commonMain
class RecipesViewModel(private val repository: RecipeRepository) : ViewModel()

// androidApp: viewModel { RecipesViewModel(repository) }
// iosMain:    RecipesHolder(repository)`, why: 'Hilt only runs on Android, so its imports don’t exist for the iPhone build. Keep a plain constructor in shared code and let each app pass the repository in.' },
        ],
        terms: [
          { term: 'ViewModelStore', def: 'Holds ViewModels for one screen. <code>clear()</code> clears every ViewModel in it, which runs <code>onCleared()</code> and cancels <code>viewModelScope</code>.' },
          { term: 'ViewModelProvider', def: 'Gets a ViewModel from a store, making it the first time. <code>ViewModelProvider.create(store, factory)[RecipesViewModel::class]</code>.' },
          { term: 'viewModelFactory', def: 'Describes how to make a ViewModel: <code>viewModelFactory { initializer { RecipesViewModel(repository) } }</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the ViewModel library available in shared code, and Swift-visible.', code: `commonMain.dependencies {
    [[api]]("androidx.lifecycle:lifecycle-viewmodel:2.11.0")
}

class RecipesViewModel(private val repository: RecipeRepository) : [[ViewModel]]()`, why: 'Google’s guide uses <code>api</code> instead of <code>implementation</code>, so the library can be exported to the framework that Swift uses. The class extends <code>ViewModel</code> as on Android.' },
          { type: 'bug', prompt: 'This file is in <code>commonMain</code>, and the iPhone build fails with <code>Unresolved reference \'java\'.</code> Tap the wrong line.', code: `import java.io.IOException

class RecipesViewModel(private val repository: RecipeRepository) : ViewModel() {
    fun refresh() {
        viewModelScope.launch {
            try { repository.refresh() } catch (e: IOException) { /* show the note */ }
        }
    }
}`, bug: 0, fix: 'import kotlinx.io.IOException', why: '<code>java.io</code> is a JVM package, missing on the iPhone. Ktor throws <code>kotlinx.io.IOException</code>, which exists on every target.' },
        ],
        quiz: [
          { q: 'On Android, who clears the shared <code>RecipesViewModel</code>?', options: ['Swift code', 'The Activity’s ViewModelStore, when the Activity finishes', 'Nobody: it lives as long as the app'], a: 1, why: '<code>viewModel { }</code> puts it in the Activity’s store. Android clears that store when the Activity finishes, not on rotation.' },
          { q: 'On the iPhone, what must happen when the Recipes screen closes?', options: ['Nothing: iOS clears ViewModels by itself', 'The screen calls <code>clear()</code> on the store that holds the ViewModel', 'The app restarts'], a: 1, why: 'iOS has no Activity to do it. Clearing the store runs <code>onCleared()</code> and cancels <code>viewModelScope</code>.' },
          { q: 'Why does a shared ViewModel take its repository through a plain constructor?', options: ['Hilt only runs on Android', 'Constructors are faster', 'ViewModels can’t have parameters'], a: 0, why: 'Shared code must compile for the iPhone too, where Hilt doesn’t exist. Each app passes the repository in its own way.' },
        ],
        docs: [['Set up ViewModel for KMP', 'https://developer.android.com/kotlin/multiplatform/viewmodel']],
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'compose-mp',
        title: 'Compose Multiplatform',
        tagline: 'The same composables draw the screen on Android and on the iPhone.',
        goals: ['Move a Compose screen to commonMain with Compose Multiplatform', 'Show the shared screen from Android and from an iPhone app', 'Weigh a shared UI against a native one'],
        level: 'intermediate', introduces: ['ComposeUIViewController', 'UIViewController'],
        body: `
<p>The iPhone app shares the ViewModel, but its screen is still written separately, so every change to the list is made twice. <em>Compose Multiplatform</em>, from JetBrains, runs the Compose you know, <code>Column</code>, <code>Text</code>, <code>LazyColumn</code>, <code>Button</code>, <code>MaterialTheme</code>, <code>remember</code>, on the iPhone, on desktop and on the web. Its iPhone support is stable since version 1.8.0; the current version is 1.12.2. Desktop apps are stable too and the web is Beta, but this lesson stays with the two phones.</p>
<p>The screen moves to <code>commonMain</code>. The Compose libraries come from JetBrains, as <code>org.jetbrains.compose...</code>, and so do the lifecycle helpers for <code>viewModel { }</code> and <code>collectAsStateWithLifecycle()</code>, as <code>org.jetbrains.androidx.lifecycle...</code>. On Android they are the same Jetpack libraries you used; for the other targets JetBrains builds them. In common code, always pass <code>viewModel</code> the <code>{ }</code> that makes the ViewModel: on Android the library can make one from its class alone, but on iOS it can’t. Inside <code>ComposeUIViewController</code>, Compose Multiplatform provides the <code>ViewModelStore</code> and clears it for you, so <code>RecipesHolder</code> is only needed for SwiftUI screens.</p>
<p>Each platform needs a small entry point. Android’s <code>MainActivity</code>, in <code>androidApp</code>, calls <code>setContent { App(repository) }</code>. In <code>iosMain</code>, <code>ComposeUIViewController { App(repository) }</code> wraps the composable in a <code>UIViewController</code>, iOS’s container for one screen, much like an Activity. The Xcode project shows that view controller; the project wizard writes that Swift part for you. On the iPhone, Compose draws every pixel itself, so the screen looks like your Android one.</p>
<p>That is the trade-off. A shared UI is written once; a native SwiftUI screen feels exactly like other iPhone apps. You can mix both, and many teams start with shared logic only. If one app keeps a native UI, the recommended layout splits shared code into a logic module and a UI module, so that app doesn’t depend on Compose.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 320,
            predict: {
              q: 'Sam renames the button in <code>App()</code> from Refresh to Update. Which apps show Update once they are rebuilt?',
              options: ['Only Android', 'Android and the iPhone', 'Only the iPhone'],
              a: 1,
              why: 'Both entry points draw the same <code>App()</code> from <code>commonMain</code>.',
            },
            nodes: [
              { id: 'app', label: 'App()<small>commonMain</small>', x: 50, y: 9 },
              { id: 'act', label: 'MainActivity<small>setContent</small>', x: 25, y: 50 },
              { id: 'mvc', label: 'MainView<wbr>Controller()<small>iosMain</small>', x: 75, y: 50 },
              { id: 'and', label: 'Android phone', x: 25, y: 90, hidden: true, tone: 'ok' },
              { id: 'iph', label: 'iPhone', x: 75, y: 90, hidden: true, tone: 'ok' },
            ],
            frames: [
              { hl: ['app'], say: '<code>App()</code> is one composable in <code>commonMain</code>: the recipe list, the Refresh button and the note.' },
              { add: [['act', 'app']], show: ['and'], hl: ['act'], say: 'Android: <code>MainActivity</code> in <code>androidApp</code> calls <code>setContent { App(repository) }</code>, as before.' },
              { add: [['act', 'and']], say: 'On the Android phone it is a normal Compose screen.' },
              { add: [['mvc', 'app']], hl: ['mvc'], say: 'iPhone: <code>MainViewController()</code> in <code>iosMain</code> wraps <code>App()</code> in <code>ComposeUIViewController</code>, a view controller iOS can show.' },
              { show: ['iph'], add: [['mvc', 'iph']], hl: ['iph'], say: 'The Xcode project shows that view controller. Compose draws every pixel itself, so the list looks like the Android one.' },
              { hl: ['iph'], say: 'Here <code>viewModel { }</code> works as on Android: <code>ComposeUIViewController</code> provides the <code>ViewModelStore</code> and clears it when the screen goes away.' },
              { hl: ['app', 'and', 'iph'], say: 'Sam renames the button to Update. After a rebuild both apps say Update: one change, one place.' },
            ],
          });
        },
        code: `// shared/build.gradle.kts
plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidMultiplatformLibrary)
    alias(libs.plugins.composeMultiplatform)   // org.jetbrains.compose, 1.12.2
    alias(libs.plugins.composeCompiler)        // org.jetbrains.kotlin.plugin.compose, 2.4.21
}
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.compose.runtime:runtime:1.12.2")
            implementation("org.jetbrains.compose.foundation:foundation:1.12.2")
            implementation("org.jetbrains.compose.material3:material3:1.12.0-alpha03")   // its own version line, still alpha
            implementation("org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-compose:2.11.0")
            implementation("org.jetbrains.androidx.lifecycle:lifecycle-runtime-compose:2.11.0")
        }
    }
}

// commonMain/kotlin/com/example/recipes/ui/App.kt
@Composable
fun App(repository: RecipeRepository) {
    MaterialTheme {
        val viewModel = viewModel { RecipesViewModel(repository) }
        val state by viewModel.uiState.collectAsStateWithLifecycle()
        Column {
            Button(onClick = { viewModel.refresh() }) { Text("Refresh") }
            Text(state.note)
            LazyColumn {
                items(state.recipes, key = { it.id }) { recipe -> Text(quickLabel(recipe)) }
            }
        }
    }
}

// androidApp, MainActivity.onCreate
setContent { App(repository) }

// iosMain/kotlin/com/example/recipes/MainViewController.kt
fun MainViewController(): UIViewController {
    val repository = iosRepository()            // IosRepository.kt, from the Room lesson
    return ComposeUIViewController { App(repository) }
}`,
        remember: 'With Compose Multiplatform, App() lives in commonMain; Android shows it with setContent, the iPhone with ComposeUIViewController.',
        terms: [
          { term: 'Compose Multiplatform', def: 'JetBrains’ version of Compose that also runs on iOS, desktop and the web. Stable on iOS since 1.8.0.' },
          { term: 'view controller', def: 'iOS’s container for one screen, a <code>UIViewController</code>. It plays the role an Activity plays on Android.' },
          { term: 'ComposeUIViewController', def: 'Wraps composables in a <code>UIViewController</code>, so an iPhone app can show a Compose screen.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show the shared screen on the iPhone.', code: `fun MainViewController(): UIViewController {
    val repository = iosRepository()
    return [[ComposeUIViewController]] { [[App]](repository) }
}`, why: '<code>ComposeUIViewController</code> turns the composable into a view controller the iPhone app can show.' },
          { type: 'bug', prompt: '<code>App()</code> in <code>commonMain</code> fails with <code>Unresolved reference \'viewModel\'.</code> Tap the wrong line.', code: `kotlin {
    sourceSets {
        androidMain.dependencies {
            implementation("org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-compose:2.11.0")
        }
    }
}`, bug: 2, fix: '        commonMain.dependencies {', why: 'A library added to <code>androidMain</code> is only visible to Android code. <code>App()</code> is in <code>commonMain</code>, so the dependency must be there.' },
        ],
        quiz: [
          { q: 'What does <code>ComposeUIViewController</code> do?', options: ['Starts an Activity on the iPhone', 'Wraps composables in a view controller the iPhone app can show', 'Turns SwiftUI code into Compose'], a: 1, why: 'A view controller is iOS’s container for a screen. <code>ComposeUIViewController</code> puts a Compose screen in one.' },
          { q: 'What is the status of Compose Multiplatform on iOS?', options: ['Stable since 1.8.0', 'Alpha', 'It only runs on Android and desktop'], a: 0, why: 'iOS support became stable in Compose Multiplatform 1.8.0. The web is still Beta.' },
          { q: 'In common code, why do you always write <code>viewModel { RecipesViewModel(repository) }</code>?', options: ['Hilt needs it', 'On iOS the library can’t make a ViewModel from its class alone, so you say how', 'It makes the screen faster'], a: 1, why: 'The Kotlin docs: on iOS there is no way to make an object from its class alone, so common code passes the <code>{ }</code> that makes the ViewModel.' },
        ],
        docs: [['Compose Multiplatform entry points', 'https://kotlinlang.org/docs/multiplatform/compose-multiplatform-entry-points.html'], ['Stability of supported platforms', 'https://kotlinlang.org/docs/multiplatform/supported-platforms.html']],
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'swift',
        title: 'Calling Kotlin from Swift',
        tagline: 'How your shared Kotlin looks from the Swift side of the iPhone app.',
        goals: ['Call shared classes and functions from Swift', 'Mark a function with @Throws so Swift can catch its errors', 'Tell Objective-C headers and Swift export apart'],
        level: 'intermediate', introduces: ['Throws', 'Int32'],
        body: `
<p>Ada writes one of Recipes’ iPhone screens in SwiftUI, and it needs <code>quickLabel</code> and the repository. Swift reads a lot like Kotlin: <code>let</code> is <code>val</code>, <code>var</code> is <code>var</code>, <code>func</code> is <code>fun</code>, and <code>print</code> is <code>println</code>. <code>import Shared</code> at the top of a Swift file makes the framework’s classes and functions visible. Ada also moved <code>quickLabel</code> out of <code>Recipe.kt</code> into its own file, <code>QuickLabel.kt</code>.</p>
<p>The framework describes your Kotlin to Swift with a <em>header</em> written in Objective-C, Apple’s older language. So Swift sees Kotlin through Objective-C’s eyes. A class stays a class, and its constructor becomes a Swift initializer whose argument labels are your parameter names. <code>String</code> stays <code>String</code>, a <code>List</code> becomes a Swift array, and an interface becomes a protocol, Swift’s word for it. Kotlin’s <code>Int</code> becomes <code>Int32</code>, because Swift’s own <code>Int</code> is bigger. A top-level function sits on a class named after its file plus <code>Kt</code>: <code>quickLabel</code> in <code>QuickLabel.kt</code> is <code>QuickLabelKt.quickLabel(recipe:)</code>, and <code>iosRepository()</code> in <code>IosRepository.kt</code> is <code>IosRepositoryKt.iosRepository()</code>.</p>
<p>A <code>suspend</code> function arrives with a completion handler, a callback for the result, and Swift can also call it with <code>try await</code>, which the Kotlin docs still call experimental. Errors need care: Swift must know which exceptions to expect. Mark the function <code>@Throws(Exception::class)</code> and the exception becomes a Swift error that <code>catch</code> handles. A <code>suspend</code> function without it passes on only cancellation; any other exception ends the app. A <code>Flow</code>, a ViewModel’s <code>StateFlow</code> too, has no Swift form in the header: Swift gets a Kotlin interface it can’t loop over. For SwiftUI screens that watch a shared ViewModel, use a helper library such as SKIE, KMP-NativeCoroutines or KMP-ObservableViewModel. With KMP-ObservableViewModel, SwiftUI holds the ViewModel and clears it when the screen goes away, so you don’t need <code>RecipesHolder</code>.</p>
<p><em>Swift export</em>, Alpha since Kotlin 2.4, skips Objective-C and writes Swift directly: top-level functions without the <code>Kt</code> class, <code>suspend</code> as Swift <code>async</code>, and a <code>Flow</code> as an <code>AsyncSequence</code> Swift can loop over. It is opt-in and still changing; the header is the default.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `import Shared

let recipe = Recipe(id: 1, title: "Pancakes", minutes: 20, favorite: false)
print(QuickLabelKt.quickLabel(recipe: recipe))
let minutes: Int32 = recipe.minutes
let repository = IosRepositoryKt.iosRepository()

Task {
    do {
        try await repository.refresh()
    } catch {
        print("Offline: showing saved recipes")
    }
}`,
            varsTitle: 'Swift values',
            predict: {
              q: 'Suppose <code>refresh()</code> had no <code>@Throws</code>. Lin is offline and Ktor throws an <code>IOException</code> inside it. What happens on her iPhone?',
              options: ['Swift’s <code>catch</code> block runs', 'The app is terminated', 'The exception is ignored and nothing happens'],
              a: 1,
              why: 'A <code>suspend</code> function without <code>@Throws</code> passes only cancellation to Swift. Any other Kotlin exception reaching Swift ends the program.',
            },
            frames: [
              { line: 1, say: '<code>import Shared</code> makes every public class and function in the framework visible to this Swift file.' },
              { line: 3, vars: { recipe: 'Recipe' }, say: 'Kotlin’s constructor is a Swift initializer. Each argument has a label: the Kotlin parameter name.' },
              { line: 4, out: 'Pancakes · quick', say: '<code>quickLabel</code> is a top-level function in <code>QuickLabel.kt</code>, so Swift finds it on the class <code>QuickLabelKt</code>.' },
              { line: 5, vars: { minutes: '20 (Int32)' }, say: 'Kotlin’s <code>Int</code> is 32 bits; Swift’s <code>Int</code> is bigger. So the value arrives as an <code>Int32</code>.' },
              { line: 6, vars: { repository: 'RecipeRepository' }, say: '<code>iosRepository()</code> is in <code>IosRepository.kt</code>, so Swift finds it on <code>IosRepositoryKt</code>. It builds the iPhone’s database and <code>HttpClient</code>.' },
              { line: [8, 10], say: '<code>refresh()</code> is a <code>suspend</code> function. Swift calls it with <code>try await</code> inside a <code>Task</code>, Swift’s way to start async work, like <code>launch</code>.' },
              { line: 10, say: 'Lin is offline and Ktor throws. <code>refresh()</code> is marked <code>@Throws(Exception::class)</code>, so the exception becomes a Swift error.' },
              { line: 12, out: 'Offline: showing saved recipes', say: 'The <code>catch</code> block runs and the app carries on. Without <code>@Throws</code>, the exception would have ended the app.' },
            ],
          });
        },
        code: `// shared/src/commonMain/kotlin/com/example/recipes/QuickLabel.kt
fun quickLabel(recipe: Recipe): String =
    if (recipe.minutes <= 20) "\${recipe.title} · quick" else "\${recipe.title} · \${recipe.minutes} min"

// shared/src/commonMain/kotlin/com/example/recipes/RecipeRepository.kt
class RecipeRepository(private val dao: RecipeDao, private val api: RecipeApi) {
    val recipes: Flow<List<Recipe>> = dao.getAll()

    @Throws(Exception::class)       // Swift: refresh() async throws
    suspend fun refresh() { /* as in the Room lesson */ }
}

// iosApp/RecipesSettings.swift (Swift)
// import Shared
//
// let recipe = Recipe(id: 1, title: "Pancakes", minutes: 20, favorite: false)
// print(QuickLabelKt.quickLabel(recipe: recipe))     // Pancakes · quick
// let minutes: Int32 = recipe.minutes                // Kotlin Int is Int32 in Swift
// let repository = IosRepositoryKt.iosRepository()   // from IosRepository.kt
//
// Task {
//     do {
//         try await repository.refresh()
//     } catch {
//         print("Offline: showing saved recipes")
//     }
// }`,
        remember: 'Swift sees Kotlin through an Objective-C header: Int is Int32, top-level functions sit on FileKt, and a suspend function needs @Throws for Swift to catch its errors.',
        mistakes: [
          { title: 'A suspend function Swift calls, without @Throws', bad: `// commonMain
suspend fun refresh() {
    dao.upsertAll(api.recipes().map { it.toRecipe(favorite = false) })   // throws when offline
}`, good: `// commonMain
@Throws(Exception::class)
suspend fun refresh() {
    dao.upsertAll(api.recipes().map { it.toRecipe(favorite = false) })
}`, why: 'Without <code>@Throws</code>, only cancellation reaches Swift as an error. The <code>IOException</code> from an offline phone would end the iPhone app instead of reaching Swift’s <code>catch</code>.' },
        ],
        terms: [
          { term: 'Swift', def: 'Apple’s language for iPhone apps. <code>let</code> is like <code>val</code>, <code>func</code> like <code>fun</code>.' },
          { term: 'header', def: 'A file in the framework that describes the Kotlin classes and functions, in Objective-C, so Swift can call them.' },
          { term: '@Throws', def: 'Lists the exceptions a function may throw, so Swift gets them as errors it can <code>catch</code>: <code>@Throws(Exception::class)</code>.' },
          { term: 'Swift export', def: 'A newer way, Alpha since Kotlin 2.4, to show Kotlin to Swift as Swift code directly, without the Objective-C header.' },
        ],
        challenges: [
          { type: 'blank', prompt: '<code>formatMinutes</code> is a top-level function in <code>Minutes.kt</code>. Call it from Swift.', code: `import [[Shared]]

print([[MinutesKt]].formatMinutes(minutes: 45))`, why: 'The framework is <code>Shared</code>. A top-level function sits on a class named after its file plus <code>Kt</code>.' },
          { type: 'bug', prompt: 'Swift won’t build this: the types don’t match. Tap the wrong line.', code: `import Shared

let recipe = Recipe(id: 1, title: "Pancakes", minutes: 20, favorite: false)
let minutes: Int = recipe.minutes
print(minutes)`, bug: 3, fix: 'let minutes: Int32 = recipe.minutes', why: 'Kotlin’s <code>Int</code> arrives in Swift as <code>Int32</code>, and Swift doesn’t turn it into its bigger <code>Int</code> by itself.' },
        ],
        quiz: [
          { q: '<code>fun formatPrice(cents: Int): String</code> is in <code>Prices.kt</code>. How does Swift call it, with the Objective-C header?', options: ['<code>PricesKt.formatPrice(cents: 250)</code>', '<code>formatPrice(cents: 250)</code>', '<code>Shared.formatPrice(250)</code>'], a: 0, why: 'Each Kotlin file becomes a class named after it plus <code>Kt</code>, and its top-level functions sit on that class.' },
          { q: 'What type does Kotlin’s <code>Int</code> have in Swift?', options: ['<code>Int</code>', '<code>Int32</code>', '<code>Double</code>'], a: 1, why: 'Kotlin’s <code>Int</code> is 32 bits. Swift’s <code>Int</code> is bigger, so the value arrives as <code>Int32</code>.' },
          { q: 'What is the status of Swift export in Kotlin 2.4?', options: ['The default for every project', 'Alpha and opt-in; the Objective-C header is still the default', 'Removed'], a: 1, why: 'Swift export became Alpha in Kotlin 2.4. You turn it on yourself, and it is still changing.' },
        ],
        docs: [['Interoperability with Swift/Objective-C', 'https://kotlinlang.org/docs/native-objc-interop.html'], ['Swift export', 'https://kotlinlang.org/docs/native-swift-export.html']],
      },
    ],
  });
})();
