/* Android fundamentals track. Same shape as tracks/kotlin.js.
   Demos use the shared kit (Lab.ui.phone, graph, flow, timeline, codeStepper); the css string below holds the few
   extra classes they need. Every class is prefixed and- . */
(() => {
  const css = `
/* home screen inside Lab.ui.phone */
.and-home { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, 28px); justify-content: center; align-content: center; gap: 12px; padding: 12px; }
.and-ico { width: 28px; height: 28px; border-radius: 9px; background: var(--sunk); }
.and-ico.and-me { background: var(--accent); }
.and-app { display: grid; justify-items: center; align-content: start; gap: 3px; }
.and-app small { font: 600 0.62rem var(--body); color: var(--ink); white-space: nowrap; }

/* predictive back */
.and-pb-layers { position: relative; flex: 1; min-height: 0; overflow: hidden; background: var(--code-bg); }
.and-pb-under, .and-pb-top { position: absolute; inset: 0; display: flex; flex-direction: column; gap: 7px; padding: 9px; background: var(--surface); font-size: 0.8rem; }
.and-pb-under { filter: brightness(0.92); }
.and-pb-top { transition: transform 0.35s ease, border-radius 0.35s ease, opacity 0.3s; box-shadow: 0 0 0 1px var(--line); }
.and-pb-top.and-pb-peek { transform: translateX(16%) scale(0.86); border-radius: 14px; }
.and-pb-arrow { position: absolute; left: 4px; top: 45%; z-index: 2; width: 26px; height: 26px; border-radius: 50%; background: var(--ink); color: var(--bg); display: grid; place-items: center; font: 700 0.8rem var(--mono); }
`;

  Lab.addTrack({
    id: 'android',
    title: 'Android fundamentals',
    description: 'Your first real app: install Android Studio, run it on a virtual phone, see how a screen lives, add resources and languages, then open screens, ask for permissions and handle Back.',
    group: 'Building apps', requires: ['kotlin'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'what-android',
        title: 'What Android is',
        tagline: 'The program that runs the phone, and the apps that run on top of it.',
        goals: ['Say what an operating system does for apps', 'Tell an app, Android and Google Play apart', 'Match an Android version to its API level'],
        level: 'beginner', introduces: [],
        body: `
<p>Ada taps an icon and a weather forecast appears. The weather app didn’t switch on the screen, find the network or check the battery. Something else on the phone did that work for it, and that something is <em>Android</em>.</p>
<p>Android is an <em>operating system</em>: the main program a phone runs from the moment it switches on. It starts and stops apps, gives each one its turn on the screen, passes it the user’s taps, and keeps apps apart, so one app can’t read another app’s data. An <em>app</em> is a program that runs on top of Android. Your Kotlin programs so far printed text; an Android app is a Kotlin program that asks Android to show things on a phone’s screen.</p>
<p>Most people get apps from <em>Google Play</em>, an app store that comes with most Android phones: it downloads the app, and Android installs it. Android also runs on tablets, watches, TVs and cars.</p>
<p>A new Android version comes out about once a year, and each one has a number called its <em>API level</em>: Android 15 is API level 35, Android 16 is 36, Android 17 is 37. People’s phones run many different versions, so every app says which is the oldest it supports. A phone older than that can’t install it.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'ada', label: 'Ada', x: 50, y: 8, tone: 'warm' },
              { id: 'weather', label: 'Weather app', x: 24, y: 38 },
              { id: 'camera', label: 'Camera app', x: 76, y: 38 },
              { id: 'android', label: 'Android<small>operating system</small>', x: 50, y: 64, tone: 'ok' },
              { id: 'screen', label: 'Screen', x: 16, y: 92, tone: 'muted' },
              { id: 'net', label: 'Network', x: 50, y: 92, tone: 'muted' },
              { id: 'lens', label: 'Camera', x: 84, y: 92, tone: 'muted' },
            ],
            predict: {
              q: 'Ada taps the weather app’s icon. Who starts the app?',
              options: ['The weather app starts itself', 'Android starts it', 'Google Play starts it'],
              a: 1,
              why: 'Android runs the phone. It receives the tap and decides which app to start.',
            },
            frames: [
              { say: 'Ada at the top, two apps, Android in the middle, and the phone’s parts at the bottom. Nothing is running yet.' },
              { add: [['ada', 'android', 'tap', 'warm']], hl: ['android'], say: 'Ada taps the weather icon. The tap goes to Android, not straight to the app.' },
              { add: [['android', 'weather', 'start', 'ok']], hl: ['weather'], say: 'Android starts the weather app and gives it the screen.' },
              { remove: [['ada', 'android'], ['android', 'weather']], add: [['weather', 'android', 'get forecast', 'accent'], ['android', 'net', '', 'ok']], hl: ['android', 'net'], say: 'The app needs the forecast from the internet. It asks Android, and Android uses the network. Apps never touch the phone’s parts themselves.' },
              { remove: [['android', 'net']], add: [['weather', 'android', 'show “Sunny, 21°”', 'accent'], ['android', 'screen', 'draw', 'ok']], hl: ['screen'], say: 'The app says what to show. Android draws it on the screen.' },
              { remove: [['weather', 'android'], ['android', 'screen']], add: [['camera', 'weather', 'read its data?', 'err']], hl: ['camera', 'weather'], say: 'The camera app tries to read the weather app’s data. Android doesn’t allow it: each app’s data is its own.' },
            ],
          });
        },
        code: `// Can this phone install the app? Compare API levels.
fun canInstall(phoneApiLevel: Int, oldestSupported: Int): Boolean {
    return phoneApiLevel >= oldestSupported
}

fun main() {
    println(canInstall(35, 24))   // true: an Android 15 phone, and the app supports API level 24 and newer
    println(canInstall(23, 24))   // false: Android 6 is API level 23, older than the app supports
}`,
        play: `fun canInstall(phoneApiLevel: Int, oldestSupported: Int): Boolean {
    return phoneApiLevel >= oldestSupported
}

fun main() {
    println(canInstall(35, 24))
    println(canInstall(23, 24))
    // Android 16 is API level 36. Can it install an app that supports 37 and newer?
}`,
        remember: 'Android is the operating system that runs the phone and its apps. Each version has an API level: Android 16 is 36.',
        terms: [
          { term: 'operating system', def: 'The main program a device runs. It starts apps, shares the screen and the hardware between them, and keeps them apart.' },
          { term: 'app', def: 'A program that runs on top of Android, like a weather app or your own.' },
          { term: 'Google Play', def: 'The app store on most Android phones. People download apps from it, and Android installs them.' },
          { term: 'API level', def: 'The number of an Android version: Android 15 is 35, Android 16 is 36, Android 17 is 37.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'An app supports API level 26 and newer. Finish the check for an Android 16 phone.', code: `fun canInstall(phoneApiLevel: Int, oldestSupported: Int): Boolean {
    return phoneApiLevel [[>=]] oldestSupported
}

fun main() {
    println(canInstall([[36]], 26))   // true
}`, why: 'A phone can install the app when its API level is the same as, or higher than, the oldest one the app supports. Android 16 is API level 36.' },
          { type: 'bug', prompt: 'An app supports API level 35 and newer. An Android 15 phone (API level 35) should be able to install it, but this prints <code>false</code>. Tap the line to fix.', code: `fun canInstall(phoneApiLevel: Int, oldestSupported: Int): Boolean {
    return phoneApiLevel > oldestSupported
}

fun main() {
    println(canInstall(35, 35))
}`, bug: 1, fix: '    return phoneApiLevel >= oldestSupported', why: '“35 and newer” includes 35 itself. <code>35 &gt; 35</code> is <code>false</code>; <code>35 &gt;= 35</code> is <code>true</code>.' },
        ],
        quiz: [
          { q: 'What is Android?', options: ['The operating system that runs the phone and its apps', 'An app you download from Google Play', 'A programming language'], a: 0, why: 'Android is the main program on the phone. Apps, including yours, run on top of it.' },
          { q: 'An app supports API level 30 and newer. Which phone can install it?', options: ['A phone on API level 33', 'A phone on API level 29', 'Both'], a: 0, why: '33 is newer than 30. A phone on 29 is older than the oldest version the app supports.' },
          { q: 'An app wants to show text on the screen. How does it happen?', options: ['The app tells Android what to show, and Android draws it', 'The app switches the screen’s pixels on by itself', 'Google Play draws it'], a: 0, why: 'Apps never touch the hardware directly. They ask Android, which shares the screen between apps.' },
        ],
        docs: [['Platform architecture', 'https://developer.android.com/guide/platform'], ['Android’s Kotlin-first approach', 'https://developer.android.com/kotlin/first']],
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'studio',
        title: 'Installing Android Studio',
        tagline: 'One program to write, build and try your apps.',
        goals: ['Install Android Studio with the Android SDK', 'Create a virtual phone to test your apps on', 'Say what the IDE, the SDK and the emulator each do'],
        level: 'beginner', introduces: [],
        body: `
<p>So far your Kotlin ran right here on this site. An Android app needs more: tools that turn your code into an app, and a phone to run it on. One free program gives you both.</p>
<p><em>Android Studio</em> is the program Android developers use to make apps. It is an <em>IDE</em> (integrated development environment): a code editor that can also build and run what you write. Download it from developer.android.com/studio and install it with the default settings. It needs at least 8 GB of memory (RAM) and 8 GB of free disk space.</p>
<p>The first time it opens, its Setup Wizard downloads the <em>Android SDK</em> (software development kit): the tools and Android libraries that turn your code into an app. Accept the defaults and wait; it is a big download.</p>
<p>You don’t need an Android phone. The <em>emulator</em> is a program that pretends to be one, in a window on your computer. Each virtual phone has a screen size and an Android version, which comes from a <em>system image</em>: a copy of one Android version for the emulator. Make one in Device Manager: click <b>+</b>, then <b>Create Virtual Device</b>, pick a phone, pick a system image, and click <b>Finish</b>. <b>Launch</b> starts it.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'code', label: 'Your code', sub: 'Kotlin you type' },
              { id: 'studio', label: 'Android Studio', sub: 'the IDE' },
              { id: 'sdk', label: 'Android SDK', sub: 'builds the app' },
              { id: 'emu', label: 'Emulator', sub: 'a phone in a window' },
            ],
            predict: {
              q: 'Ada has no Android phone. Can she still try her apps?',
              options: ['Yes, on the emulator', 'No, she needs a real phone', 'Only after putting the app on Google Play'],
              a: 0,
              why: 'The emulator runs real Android in a window on her computer, so apps behave as they would on a phone.',
            },
            frames: [
              { say: 'The path an app takes, from your keyboard to a phone. Everything here is on your computer.' },
              { at: 'code', packet: 'Kotlin', say: 'You type Kotlin in Android Studio’s editor.' },
              { at: 'studio', packet: 'Run', say: 'You click <b>Run</b>. Android Studio starts the build.' },
              { at: 'sdk', packet: 'app', mark: { code: 'ok', studio: 'ok' }, say: 'The SDK’s tools turn your code into an app Android can install.' },
              { at: 'emu', packet: 'app', mark: { sdk: 'ok' }, say: 'Android Studio installs the app on the emulator and opens it.' },
              { at: 'emu', packet: 'app', mark: { emu: 'ok' }, say: 'The emulator runs real Android, so the app behaves as on a phone. Change the code, click Run again, and the new version replaces the old one.' },
            ],
          });
        },
        code: `1. developer.android.com/studio  >  Download Android Studio
2. Open the downloaded file and install it, accepting the defaults
3. When it first opens, the Setup Wizard downloads the Android SDK and the emulator
4. Welcome to Android Studio  >  More Actions  >  Virtual Device Manager
5. +  >  Create Virtual Device  >  pick a phone  >  Next
6. Pick a system image (download it if needed)  >  Next  >  Finish
7. Launch: a virtual phone opens in a window`,
        remember: 'Android Studio is where you write and run apps; the SDK builds them; the emulator is a phone in a window.',
        terms: [
          { term: 'IDE', def: 'Integrated development environment: a code editor that can also build and run your code. Android Studio is one.' },
          { term: 'Android SDK', def: 'Software development kit: the tools and Android libraries that turn your code into an app.' },
          { term: 'emulator', def: 'A program that pretends to be an Android phone, in a window on your computer. Each virtual phone is also called an AVD (Android Virtual Device).' },
          { term: 'system image', def: 'A copy of one Android version for the emulator to run.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in what each part does.', code: `Android Studio   // the [[IDE]]: where you write, build and run code
Android SDK      // the tools that [[build]] your code into an app
Emulator         // a virtual [[phone]] in a window`, why: 'Android Studio is the IDE you work in. The SDK builds the app. The emulator runs it.' },
          { type: 'bug', prompt: 'Ada’s notes for getting a virtual phone have one wrong step. Tap it.', code: `1. Install Android Studio
2. Let the Setup Wizard download the SDK
3. Download a virtual phone from Google Play
4. Pick a system image  >  Finish
5. Launch the virtual phone`, bug: 2, fix: '3. Device Manager  >  +  >  Create Virtual Device', why: 'Google Play is a store for apps. Virtual phones are made in Android Studio’s Device Manager.' },
        ],
        quiz: [
          { q: 'What does the Android SDK give you?', options: ['The tools and libraries that build Android apps', 'An app store', 'A keyboard for typing code'], a: 0, why: 'SDK means software development kit: what you need to turn code into an Android app.' },
          { q: 'What is a system image?', options: ['A copy of one Android version for the emulator to run', 'A screenshot of your app', 'The app’s icon'], a: 0, why: 'The emulator needs an Android to run. The system image you pick decides which version.' },
          { q: 'Where do you create a virtual phone?', options: ['In Device Manager', 'In Google Play', 'In the Android SDK'], a: 0, why: 'Device Manager, in Android Studio, lists your virtual phones. <b>+</b> and <b>Create Virtual Device</b> make a new one.' },
        ],
        docs: [['Download and install Android Studio', 'https://developer.android.com/codelabs/basic-android-kotlin-compose-install-android-studio'], ['Create and manage virtual devices', 'https://developer.android.com/studio/run/managing-avds']],
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'first-app',
        title: 'Your first app',
        tagline: 'Create a project, run it on the emulator, change one word.',
        goals: ['Create a project from the Empty Activity template', 'Run the app on the emulator', 'Change the code and see the change after Run'],
        level: 'beginner', introduces: [], ignore: ['Activity'],
        body: `
<p>Time to make something that runs on a phone. Ada’s first app is called Hello, and it will greet her by name. It starts as a <em>template</em>, a ready-made project that Android Studio writes for you, and it grows a little in each of the next lessons.</p>
<p>In the Welcome window, click <b>New Project</b>, pick the <b>Empty Activity</b> template and click <b>Next</b>. Name it <code>Hello</code>. Android Studio fills in the <em>package name</em>, <code>com.example.hello</code>: a unique name for the app, written like a web address backwards. <b>Minimum SDK</b> is the oldest Android version the app will run on, as an API level; keep the default. Click <b>Finish</b> and wait until the Gradle sync is done. <em>Gradle</em> is the build tool: the first time, it downloads everything the project needs.</p>
<p>Pick your virtual phone in the device menu in the toolbar and click <b>Run</b> (▶). Android Studio builds the app, installs it on the emulator and opens it. The screen says <code>Hello Android!</code></p>
<p>The code is in <code>MainActivity.kt</code>, open in the editor. Near the top of the file, find the first <code>"Android"</code> and change it to <code>"Ada"</code>. (Another <code>"Android"</code> further down only feeds Android Studio’s preview, not the phone.) The template passes that text to a function it also wrote, <code>Greeting</code>, which shows <code>"Hello $name!"</code>. Look at the emulator: still <code>Hello Android!</code>, because it runs the app as it was last built. Click Run again, and it says <code>Hello Ada!</code></p>`,
        visual(el) {
          const home = '<div class="and-home">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<span class="${i === 4 ? 'and-ico and-me' : 'and-ico'}"></span>`).join('') + '</div>';
          const app = text => `<div class="ui-m-body">${text}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'What Ada did',
            predict: {
              q: 'Ada changed <code>"Android"</code> to <code>"Ada"</code> but hasn’t clicked Run. What does the emulator show?',
              options: ['Hello Ada!', 'Hello Android!', 'An error'],
              a: 1,
              why: 'The emulator runs the app as it was last built. A change reaches the phone when you click Run.',
            },
            frames: [
              { screen: home, log: ['New Project > Empty Activity', 'Name: Hello > Finish'], say: 'The emulator is on, and Android Studio has the new Hello project open.' },
              { screen: app('Hello Android!'), log: 'Run ▶', say: 'Run builds the app, installs it on the emulator and opens it. This is the template’s text.' },
              { log: 'MainActivity.kt: "Android" → "Ada"', say: 'Ada edits the code. The phone still shows the old build.' },
              { screen: app('Hello Ada!'), log: 'Run ▶', say: 'Run again: Android Studio builds the new version and replaces the old one on the phone.' },
              { screen: home, log: 'Home', say: 'Hello is installed now, like any other app. Its icon is on the phone.' },
              { tap: '.and-me', log: 'tap the Hello icon', say: 'Ada opens it the way she opens any app.' },
              { screen: app('Hello Ada!'), say: 'Her own app, on a phone. Small, but real.' },
            ],
          });
        },
        code: `New Project  >  Empty Activity  >  Next
Name: Hello          (package name: com.example.hello)
Minimum SDK: keep the default
Finish               (wait until the Gradle sync is done)
Device menu: your virtual phone  >  Run ▶
// Screen: Hello Android!

MainActivity.kt, near the top: change "Android" to "Ada"  >  Run ▶
// Screen: Hello Ada!`,
        remember: 'Code changes reach the phone only when you click Run.',
        terms: [
          { term: 'template', def: 'A ready-made project Android Studio writes for you, like Empty Activity.' },
          { term: 'package name', def: 'A unique name for the app, written like a web address backwards: <code>com.example.hello</code>.' },
          { term: 'Gradle', def: 'The build tool Android Studio uses to turn the project into an app.' },
          { term: 'Run', def: 'The ▶ button: builds the app, installs it on the chosen phone and opens it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in the steps to create the Hello app and start it.', code: `New Project  >  [[Empty Activity]]  >  Next
Name: Hello  >  Finish
Device menu: your virtual phone  >  [[Run]]`, why: 'Empty Activity is the template with one screen. Run builds the app and opens it on the phone you picked.' },
          { type: 'bug', prompt: 'Ada expects <code>Hello Ada!</code>, but the phone still says <code>Hello Android!</code>. Which step is wrong?', code: `1. New Project  >  Empty Activity  >  Next
2. Name: Hello  >  Finish
3. Run ▶                       // Hello Android!
4. Change "Android" to "Ada"
5. Look at the emulator again  // Hello Android!`, bug: 4, fix: '5. Run ▶ again                 // Hello Ada!', why: 'The emulator only gets the new version when you build and install it again with Run.' },
        ],
        quiz: [
          { q: 'What is the package name <code>com.example.hello</code> for?', options: ['It is a unique name for the app', 'It is the text on the screen', 'It is the Android version'], a: 0, why: 'Android tells apps apart by this name, so no two apps on a phone share one.' },
          { q: 'What does Minimum SDK set?', options: ['The oldest Android version the app runs on', 'The newest Android version', 'How big the app can be'], a: 0, why: 'It is an API level. Phones older than it can’t install the app.' },
          { q: 'You click Run. What happens?', options: ['The app is built, installed on the phone and opened', 'The code is sent to Google Play', 'Only the spelling is checked'], a: 0, why: 'Run does the whole trip: build, install, open.' },
        ],
        docs: [['Create your first Android app', 'https://developer.android.com/codelabs/basic-android-kotlin-compose-first-app'], ['Run apps on the Android Emulator', 'https://developer.android.com/studio/run/emulator']],
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'project-files',
        title: 'What’s in a project',
        tagline: 'Four groups of files, and what each one is for.',
        goals: ['Find the manifest, the Kotlin code, the resources and the Gradle files', 'Say what each one is for', 'Read the app’s Android versions in build.gradle.kts'],
        level: 'beginner', introduces: ['AndroidManifest', 'minSdk', 'targetSdk', 'applicationId'],
        body: `
<p>Ada wants to change her app’s icon, its text and the oldest Android version it supports. Each of these lives in a different file. The Project panel on the left of Android Studio, in its <b>Android</b> view, shows the Hello project in four groups.</p>
<p><b>manifests</b> holds <code>AndroidManifest.xml</code>, the app’s ID card for Android: the app’s name and icon, and its list of screens, so Android knows which one to open when the icon is tapped. It is written in XML, a format of labels in angle brackets. <b>java</b> holds your Kotlin files, like <code>MainActivity.kt</code>; the group has that name for historical reasons, but it holds Kotlin too. (Newer versions of Android Studio may call it <b>kotlin+java</b>.)</p>
<p><b>res</b>, short for <em>resources</em>, holds everything that isn’t code: pictures in <b>drawable</b>, the app icon in <b>mipmap</b>, text and colours in <b>values</b>. <b>Gradle Scripts</b> holds the files that tell Gradle how to build the app: <code>settings.gradle.kts</code> lists the project’s parts, <code>libs.versions.toml</code> lists the versions of the libraries it uses, and there are two <code>build.gradle.kts</code> files, one for the whole project and one for the app.</p>
<p>The app’s <code>build.gradle.kts</code> is the one you will open most. It is written in Kotlin, as settings: <code>applicationId</code> is the app’s unique ID, <code>minSdk</code> the oldest API level it runs on, and <code>targetSdk</code> the API level it was tested on.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 290,
            nodes: [
              { id: 'man', label: 'manifests', x: 22, y: 12 },
              { id: 'java', label: 'java', x: 22, y: 38 },
              { id: 'res', label: 'res', x: 22, y: 64 },
              { id: 'gradle', label: 'Gradle Scripts', x: 22, y: 90 },
              { id: 'mf', label: 'AndroidManifest.xml<small>name, icon, screens</small>', x: 71, y: 12, tone: 'ok', hidden: true },
              { id: 'kt', label: 'MainActivity.kt<small>your Kotlin code</small>', x: 71, y: 38, tone: 'ok', hidden: true },
              { id: 'rs', label: 'drawable, mipmap, values<small>pictures, icon, text</small>', x: 71, y: 64, tone: 'ok', hidden: true },
              { id: 'bg', label: 'build.gradle.kts<small>versions, app ID</small>', x: 71, y: 90, tone: 'ok', hidden: true },
            ],
            predict: {
              q: 'Ada wants Hello to run on older phones too. Which file does she change?',
              options: ['AndroidManifest.xml', 'MainActivity.kt', 'build.gradle.kts'],
              a: 2,
              why: 'The oldest supported version, <code>minSdk</code>, is a build setting. It lives in the app’s <code>build.gradle.kts</code>.',
            },
            frames: [
              { say: 'The Hello project in the Android view of the Project panel: four groups.' },
              { show: ['mf'], add: [['man', 'mf']], hl: ['mf'], say: 'The manifest. One of its lines, <code>&lt;activity android:name=".MainActivity"&gt;</code>, names the screen Android opens when the icon is tapped.' },
              { show: ['kt'], add: [['java', 'kt']], hl: ['kt'], say: 'Your code: the <code>MainActivity.kt</code> you changed in the last lesson.' },
              { show: ['rs'], add: [['res', 'rs']], hl: ['rs'], say: 'Resources: everything that isn’t code. The app’s icon is in <b>mipmap</b>.' },
              { show: ['bg'], add: [['gradle', 'bg']], hl: ['bg'], say: 'The app’s build settings, among them <code>minSdk</code>, the oldest API level it runs on.' },
              { hl: ['mf', 'kt', 'rs', 'bg'], say: 'What the app is, what it does, what it shows, how it is built: each kind of change has its own home.' },
            ],
          });
        },
        code: `// build.gradle.kts in the app module: build settings, written in Kotlin
android {
    namespace = "com.example.hello"
    compileSdk = 37                          // the Android version the app is built with: Android 17

    defaultConfig {
        applicationId = "com.example.hello"  // the app's unique ID on phones and on Google Play
        minSdk = 24                          // the oldest it runs on: Android 7.0
        targetSdk = 36                       // the version it was tested on: Android 16
        versionCode = 1                      // goes up by one with every release
        versionName = "1.0"                  // the version people see
    }
}
// Your numbers may be newer.`,
        remember: 'manifests: what the app is. java: the code. res: everything else. Gradle Scripts: how it is built.',
        terms: [
          { term: 'AndroidManifest.xml', def: 'The app’s ID card for Android: its name, icon and screens.' },
          { term: 'resources', def: 'Everything in an app that isn’t code, in the <b>res</b> folder: pictures, the icon, text, colours.' },
          { term: 'build.gradle.kts', def: 'Build settings written in Kotlin. The app’s one holds <code>applicationId</code>, <code>minSdk</code> and <code>targetSdk</code>.' },
          { term: 'minSdk / targetSdk', def: '<code>minSdk</code>: the oldest API level the app runs on. <code>targetSdk</code>: the API level it was tested on.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make Hello run on Android 8.0 (API level 26) and newer.', code: `defaultConfig {
    applicationId = "com.example.hello"
    [[minSdk]] = 26
    targetSdk = 36
}`, why: '<code>minSdk</code> is the oldest API level the app runs on.' },
          { type: 'bug', prompt: 'Ada wrote down where each change goes. One line is wrong. Tap it.', code: `// Where each change goes in the Hello project
List of screens       ->  AndroidManifest.xml
Kotlin code           ->  MainActivity.kt
Oldest API level      ->  res
Pictures and the icon ->  res`, bug: 3, fix: 'Oldest API level      ->  build.gradle.kts', why: 'The oldest API level, <code>minSdk</code>, is a build setting in the app’s <code>build.gradle.kts</code>. <b>res</b> is for pictures, the icon, text and colours.' },
        ],
        quiz: [
          { q: 'Where do pictures and the app icon go?', options: ['In res', 'In java', 'In Gradle Scripts'], a: 0, why: 'res holds everything that isn’t code. Pictures go in drawable, the icon in mipmap.' },
          { q: 'What does the manifest tell Android?', options: ['What the app is: its name, icon and screens', 'How to turn Kotlin into an app', 'Which apps the user likes'], a: 0, why: 'Android reads the manifest to know which screen to open when the icon is tapped.' },
          { q: 'Hello has <code>minSdk = 24</code>. A phone is on API level 23. What happens?', options: ['It can’t install Hello', 'It installs Hello, which then crashes', 'It installs Hello and runs it'], a: 0, why: 'API level 23 is older than the oldest version Hello supports.' },
        ],
        docs: [['Projects overview', 'https://developer.android.com/studio/projects'], ['Configure your build', 'https://developer.android.com/build']],
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'activity',
        title: 'Activities',
        tagline: 'One screen, one class, and the function Android calls first.',
        goals: ['Say what an Activity is', 'Read MainActivity line by line', 'Put text on the screen with <code>setContent</code> and <code>Text</code>'],
        level: 'beginner', introduces: ['Activity', 'ComponentActivity', 'onCreate', 'Bundle', 'savedInstanceState', 'enableEdgeToEdge', 'setContent', 'Text'], ignore: ['activity'],
        body: `
<p>When Ada taps the Hello icon, Android needs to know what to open. The manifest names a class, <code>MainActivity</code>, and Android makes an object from it. That object is an <em>Activity</em>: one screen of an app, which Android can show, hide and pass taps to.</p>
<p>You don’t write an Activity from nothing. <code>class MainActivity : ComponentActivity()</code> builds on <code>ComponentActivity</code>, a class from Android’s libraries that already knows how to be a screen; yours adds only what is special about it. An app has no <code>fun main()</code>. Android creates the object itself and calls its functions when it needs them.</p>
<p>The first is <code>onCreate</code>, which Android calls once, right after making the object. It is an <code>override</code>, because <code>ComponentActivity</code> has its own <code>onCreate</code>, and the first line, <code>super.onCreate(savedInstanceState)</code>, runs that one so it can set itself up. <code>savedInstanceState</code> is a <code>Bundle?</code>: a <em>Bundle</em> is a small bag of values Android can hand back to a screen. When the screen opens fresh it is <code>null</code>. Pass it to <code>super</code> and leave it at that.</p>
<p><code>setContent { }</code> puts a UI on the screen: whatever its block describes. <code>Text("Hello, Ada!")</code> shows one line of text. Both come from Jetpack Compose, the toolkit for screens that the next track teaches. Try it: in Hello, replace everything inside the template’s <code>setContent { }</code> block with <code>Text("Hello, Ada!")</code> and click Run. Leave the template’s <code>enableEdgeToEdge()</code> line above it as it is: it lets the app draw behind the status bar, the strip with the clock at the top.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            Text("Hello, Ada!")
        }
    }
}`,
            varsTitle: 'Android has',
            outTitle: 'Screen',
            predict: {
              q: 'Nothing in this code calls <code>onCreate</code>. When does it run?',
              options: ['When Android opens the screen', 'Never: some code must call it', 'When Android Studio builds the app'],
              a: 0,
              why: 'Android makes the <code>MainActivity</code> object and calls <code>onCreate</code> on it. You write the function; Android decides when to call it.',
            },
            frames: [
              { say: 'Ada taps the Hello icon. Android reads the manifest: the screen to open is <code>MainActivity</code>.' },
              { line: 1, vars: { MainActivity: 'object made' }, say: 'Android makes a <code>MainActivity</code> object. Nobody wrote <code>MainActivity()</code>; Android did it.' },
              { line: 2, vars: { savedInstanceState: 'null' }, say: 'Android calls <code>onCreate</code>. <code>savedInstanceState</code> is <code>null</code>: the screen is opening fresh.' },
              { line: 3, say: '<code>super.onCreate</code> runs <code>ComponentActivity</code>’s own setup first.' },
              { line: 4, say: '<code>enableEdgeToEdge()</code>, from the template, lets the app draw on the whole screen, behind the status bar too.' },
              { line: [5, 6, 7], out: 'Hello, Ada!', say: '<code>setContent</code> puts its block on the screen, and <code>Text</code> shows one line. Because of <code>enableEdgeToEdge()</code>, the text can sit partly under the clock. That is expected for now.' },
              { line: 8, say: '<code>onCreate</code> is done, and the screen stays up. Android calls this object again when something happens to the screen: that is the next lesson.' },
            ],
          });
        },
        code: `import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.material3.Text

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)   // ComponentActivity's own setup first
        enableEdgeToEdge()                   // from the template: draw behind the status bar
        setContent {
            Text("Hello, Ada!")              // on screen: Hello, Ada!
        }
    }
}`,
        remember: 'An Activity is one screen. Android creates it and calls onCreate, where setContent puts your UI on the screen.',
        mistakes: [
          { title: 'Leaving out super.onCreate', bad: `override fun onCreate(savedInstanceState: Bundle?) {
    setContent {
        Text("Hello, Ada!")
    }
}
// The app closes at once. Logcat: android.util.SuperNotCalledException:
// Activity {com.example.hello/com.example.hello.MainActivity} did not call through to super.onCreate()`, good: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent {
        Text("Hello, Ada!")
    }
}`, why: '<code>ComponentActivity</code> must do its own setup, and Android checks that it ran. Without the <code>super</code> call the app crashes as it opens.' },
        ],
        terms: [
          { term: 'Activity', def: 'One screen of an app: an object Android creates and calls. Yours builds on <code>ComponentActivity</code>.' },
          { term: 'onCreate', def: 'The function Android calls once, right after it creates the Activity. You set up the screen here.' },
          { term: 'Bundle', def: 'A small bag of values Android can hand back to a screen. <code>savedInstanceState</code> is <code>null</code> when the screen opens fresh.' },
          { term: 'setContent', def: 'Puts a UI on the screen: whatever its block describes, such as <code>Text("Hello")</code>, which shows one line of text.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Write the screen that greets Lin.', code: `class MainActivity : [[ComponentActivity]]() {
    override fun [[onCreate]](savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            [[Text]]("Hello, Lin!")
        }
    }
}`, why: 'Build on <code>ComponentActivity</code>, override <code>onCreate</code>, and put a <code>Text</code> inside <code>setContent</code>.' },
          { type: 'bug', prompt: 'This doesn’t build: Kotlin says <code>\'onCreate\' overrides nothing.</code> Tap the line to fix.', code: `class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle) {
        super.onCreate(savedInstanceState)
        setContent {
            Text("Hello, Lin!")
        }
    }
}`, bug: 1, fix: '    override fun onCreate(savedInstanceState: Bundle?) {', why: '<code>ComponentActivity</code>’s <code>onCreate</code> takes a <code>Bundle?</code>, because it can be <code>null</code>. Without the <code>?</code> it is a different function, so there is nothing to override.' },
        ],
        quiz: [
          { q: 'What is an Activity?', options: ['One screen of an app, which Android creates and calls', 'A function you call from <code>main</code>', 'A file in res'], a: 0, why: 'Android makes the Activity object and calls its functions, such as <code>onCreate</code>.' },
          { q: 'Who creates the <code>MainActivity</code> object?', options: ['Android', 'Your code, with <code>MainActivity()</code>', 'Gradle'], a: 0, why: 'Android reads the manifest and creates the Activity itself when the screen opens.' },
          { q: 'What does <code>setContent { Text("Hi") }</code> do?', options: ['Shows a screen with the text Hi', 'Prints Hi below the code', 'Saves Hi in a Bundle'], a: 0, why: '<code>setContent</code> puts its block on the screen, and <code>Text</code> shows a line of text.' },
        ],
        docs: [['Introduction to activities', 'https://developer.android.com/guide/components/activities/intro-activities']],
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'lifecycle',
        title: 'The activity lifecycle',
        tagline: 'Android tells your screen when it appears, goes away and comes back.',
        goals: ['Name the three states an open screen moves through', 'Know which callback Android calls at each step', 'Watch the callbacks in Logcat with <code>Log.d</code>'],
        level: 'beginner', introduces: ['onStart', 'onResume', 'onPause', 'onStop', 'onDestroy', 'Log'],
        body: `
<p>Ada is using Hello, switches to another app, and comes back ten minutes later. A game would want to pause while she is away; a timer would want to know she is back. Android tells your Activity each time, by calling its <em>lifecycle callbacks</em>: functions you write and Android calls, like <code>onCreate</code>.</p>
<p>An open screen moves through three states. <em>Created</em>: the object exists. <em>Started</em>: the screen is visible. <em>Resumed</em>: it is in front and gets the user’s taps. Each state has a pair of callbacks, one on the way in and one on the way out: <code>onCreate</code> and <code>onDestroy</code>, <code>onStart</code> and <code>onStop</code>, <code>onResume</code> and <code>onPause</code>. Opening a screen goes up: <code>onCreate</code>, <code>onStart</code>, <code>onResume</code>. Leaving goes down in the opposite order.</p>
<p>Pressing Home runs <code>onPause</code> and <code>onStop</code>, but not <code>onDestroy</code>: the object still exists. So coming back runs <code>onStart</code> and <code>onResume</code> on the same object, with no new <code>onCreate</code>. <code>onDestroy</code> runs when Android is done with the object for good.</p>
<p>To watch them, override each callback, call its <code>super</code> first (the app crashes without it), and add <code>Log.d("Hello", "onStart")</code>. <code>Log.d</code> writes a message to <em>Logcat</em>, Android Studio’s log window (<b>View &gt; Tool Windows &gt; Logcat</b>). <code>"Hello"</code> is the tag, a label: type <code>tag:Hello</code> in Logcat’s search box to see only your lines. <code>Log</code> needs <code>import android.util.Log</code> at the top of the file.</p>`,
        visual(el) {
          const home = '<div class="and-home">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<span class="${i === 4 ? 'and-ico and-me' : 'and-ico'}"></span>`).join('') + '</div>';
          const app = '<div class="ui-m-body">Hello, Ada!</div>';
          Lab.ui.phone(el, {
            logTitle: 'Logcat, message column',
            predict: {
              q: 'Ada presses Home, then opens Hello again. Does <code>onCreate</code> run a second time?',
              options: ['Yes, every time the screen appears', 'No, the same MainActivity object comes back', 'Only <code>onCreate</code> runs, nothing else'],
              a: 1,
              why: 'Home only stops the Activity. The object still exists, so Android calls <code>onStart</code> and <code>onResume</code> on it again.',
            },
            frames: [
              { screen: home, say: 'Hello isn’t running. The log on the right shows only the message part of each Logcat line.' },
              { tap: '.and-me', log: 'onCreate', say: 'Ada taps the icon. Android creates <code>MainActivity</code> and calls <code>onCreate</code>. State: Created. Nothing is visible yet.' },
              { screen: app, log: 'onStart', say: '<code>onStart</code>: the screen is visible. State: Started.' },
              { log: 'onResume', say: '<code>onResume</code>: in front, ready for taps. State: Resumed. It stays here while Ada uses it.' },
              { screen: home, log: ['onPause', 'onStop'], say: 'Ada presses Home. Two steps down: <code>onPause</code> (no longer in front), then <code>onStop</code> (no longer visible). No <code>onDestroy</code>: the object still exists.' },
              { tap: '.and-me', say: 'She taps the Hello icon again.' },
              { screen: app, log: ['onStart', 'onResume'], say: 'The same object comes back up: <code>onStart</code>, <code>onResume</code>. No <code>onCreate</code> this time.' },
            ],
          });
        },
        code: `import android.util.Log
// ...and the imports from the last lesson

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        Log.d("Hello", "onCreate")
        setContent {
            Text("Hello, Ada!")
        }
    }

    override fun onStart() {
        super.onStart()
        Log.d("Hello", "onStart")
    }

    override fun onResume() {
        super.onResume()
        Log.d("Hello", "onResume")
    }

    override fun onPause() {
        super.onPause()
        Log.d("Hello", "onPause")
    }

    override fun onStop() {
        super.onStop()
        Log.d("Hello", "onStop")
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("Hello", "onDestroy")
    }
}
// Open the app:      onCreate, onStart, onResume
// Home:              onPause, onStop
// Open it again:     onStart, onResume`,
        remember: 'Up: onCreate, onStart, onResume. Down: onPause, onStop, onDestroy. Home stops the screen; it doesn’t destroy it.',
        mistakes: [
          { title: 'Doing “every time” work in onCreate', bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    Log.d("Hello", "Hello is visible")   // Home, then back: not logged again
    setContent {
        Text("Hello, Ada!")
    }
}`, good: `override fun onStart() {
    super.onStart()
    Log.d("Hello", "Hello is visible")   // every time the screen becomes visible
}`, why: '<code>onCreate</code> runs once per object. Coming back from Home reuses the object, so work that must happen every time the screen appears belongs in <code>onStart</code>.' },
        ],
        terms: [
          { term: 'lifecycle', def: 'The states a screen moves through, from created to destroyed, and the order Android moves it in.' },
          { term: 'callback', def: 'A function you write and Android calls when something happens, like <code>onStart</code> when the screen becomes visible.' },
          { term: 'Created, Started, Resumed', def: 'The object exists; the screen is visible; the screen is in front and gets taps.' },
          { term: 'Logcat', def: 'Android Studio’s log window. <code>Log.d("Hello", "onStart")</code> writes the message <code>onStart</code> with the tag <code>Hello</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Log a line every time the Hello screen becomes visible.', code: `override fun [[onStart]]() {
    super.[[onStart]]()
    Log.d("Hello", "visible")
}`, why: 'The screen becomes visible in <code>onStart</code>, and each override calls the same function on <code>super</code>.' },
          { type: 'bug', prompt: 'Ada presses Home, and Logcat shows <code>onStop</code> twice in a row. Tap the line to fix.', code: `override fun onResume() {
    super.onResume()
    Log.d("Hello", "onResume")
}

override fun onPause() {
    super.onPause()
    Log.d("Hello", "onStop")
}

override fun onStop() {
    super.onStop()
    Log.d("Hello", "onStop")
}`, bug: 7, fix: '    Log.d("Hello", "onPause")', why: 'Home runs <code>onPause</code>, then <code>onStop</code>. The message in <code>onPause</code> was copied from <code>onStop</code> and never changed.' },
        ],
        quiz: [
          { q: 'Hello is in front. Ada presses Home. Which callbacks run?', options: ['<code>onPause</code>, then <code>onStop</code>', '<code>onPause</code> only', '<code>onPause</code>, <code>onStop</code>, <code>onDestroy</code>'], a: 0, why: 'The screen leaves the front, then leaves view. It isn’t destroyed, because Ada can come back to it.' },
          { q: 'In which state can the user tap things on your screen?', options: ['Resumed', 'Started', 'Created'], a: 0, why: 'Started means visible. Resumed means in front, receiving taps.' },
          { q: 'Why does your <code>onStart</code> call <code>super.onStart()</code>?', options: ['<code>ComponentActivity</code> does its own work there, and the app crashes if it is skipped', 'It makes the log line appear', 'It runs <code>onStart</code> a second time'], a: 0, why: 'Like <code>super.onCreate</code>, each <code>super</code> call lets <code>ComponentActivity</code> do its part. Android checks that it ran.' },
        ],
        docs: [['The activity lifecycle', 'https://developer.android.com/guide/components/activities/activity-lifecycle'], ['View logs with Logcat', 'https://developer.android.com/studio/debug/logcat']],
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'config-changes',
        title: 'Rotation and configuration changes',
        tagline: 'Turn the phone, and you get a brand-new Activity.',
        goals: ['Name changes that make Android recreate an Activity', 'Predict the callbacks when the phone rotates', 'Explain why values kept in the Activity are lost'],
        level: 'beginner', introduces: [],
        body: `
<p>Lin is on question 7 of a quiz app, with 60 points. She turns the phone sideways to see a picture better, and the app is back at question 1 with 0 points. Nothing crashed. The app forgot, because of how rotation works on Android.</p>
<p>The screen’s shape, light or dark theme, the language and the font size together are the device’s <em>configuration</em>: the settings a screen depends on. When one of them changes while the app is open, Android doesn’t patch the old screen. It destroys the Activity (<code>onPause</code>, <code>onStop</code>, <code>onDestroy</code>) and at once creates a new one for the new configuration (<code>onCreate</code>, <code>onStart</code>, <code>onResume</code>). That way the new screen starts with the right layout, text and colours. This is called <em>recreation</em>.</p>
<p>The new <code>MainActivity</code> is a different object. Like two players made from one <code>Player</code> class, each object has its own properties. A value kept in a property of the old one goes away with it, and the new one starts with the starting values. That is what happened to Lin’s points.</p>
<p>See it in Hello: give <code>MainActivity</code> a property, <code>private var starts = 0</code>, add one to it in <code>onStart</code>, and log it. Home and back counts up. Rotating starts again at 1. To rotate the emulator, use <b>Rotate left</b> or <b>Rotate right</b> in its toolbar; if the screen doesn’t turn, switch on Auto-rotate in the phone’s quick settings. Keeping a value through rotation has its own lesson in the compose track.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['object 1', 'object 2', 'object 3'],
            span: 13,
            unit: 's',
            predict: {
              q: '<code>starts</code> is 2. Ada rotates the phone. What does the next <code>starts</code> line in Logcat say?',
              options: ['<code>starts = 3</code>', '<code>starts = 1</code>', 'Nothing: rotating doesn’t call <code>onStart</code>'],
              a: 1,
              why: 'Rotating destroys the Activity and creates a new <code>MainActivity</code>. Its <code>starts</code> begins at 0 again, and <code>onStart</code> makes it 1.',
            },
            frames: [
              { now: 0, say: 'Time runs left to right. Each row is one <code>MainActivity</code> object, and the number in a bar is its <code>starts</code>. The Logcat lines are in these captions.' },
              { bars: [{ lane: 0, from: 0, to: 4, label: '1' }], marks: [{ at: 0, label: 'open', tone: 'accent' }], say: 'Ada opens Hello. Logcat: <code>onCreate</code>, <code>starts = 1</code>.' },
              { bars: [{ lane: 0, from: 4, to: 7, label: '2' }], marks: [{ at: 4, label: 'Home', tone: 'warm' }], say: 'Home, then back. The same object gets <code>onStart</code> again: <code>starts = 2</code>.' },
              { now: 7, marks: [{ at: 7, label: 'rotate', tone: 'err' }], say: 'Ada turns the phone sideways. Object 1 gets <code>onPause</code>, <code>onStop</code>, <code>onDestroy</code>, and its <code>starts</code> goes with it.' },
              { bars: [{ lane: 1, from: 7, to: 10, label: '1', tone: 'ok' }], say: 'Android creates object 2 for the new screen shape: <code>onCreate</code>, then <code>starts = 1</code>. Same class, new object, starting values.' },
              { bars: [{ lane: 2, from: 10, to: 13, label: '1', tone: 'ok' }], marks: [{ at: 10, label: 'dark', tone: 'err' }], say: 'Not only rotation: switching to dark theme is a configuration change too. Object 2 is destroyed, and object 3 starts at 1.' },
            ],
          });
        },
        code: `class MainActivity : ComponentActivity() {
    private var starts = 0      // belongs to this object, and only lives as long as it does

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        Log.d("Hello", "onCreate")
        setContent {
            Text("Hello, Ada!")
        }
    }

    override fun onStart() {
        super.onStart()
        starts++
        Log.d("Hello", "starts = $starts")
    }
    // the other callbacks from the last lesson stay as they were
}
// Open the app:         onCreate, starts = 1
// Home, open it again:  starts = 2
// Rotate the phone:     onCreate, starts = 1   (a new MainActivity)`,
        remember: 'A configuration change, like rotation or dark theme, destroys the Activity and creates a new one. Its properties start over.',
        terms: [
          { term: 'configuration', def: 'The settings a screen depends on: screen shape and size, light or dark theme, language, font size.' },
          { term: 'configuration change', def: 'One of those settings changing while the app is open, such as rotating the phone.' },
          { term: 'recreation', def: 'What Android does on a configuration change: destroy the Activity, then create a new one for the new configuration.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Ada rotates the phone. Fill in the callbacks Android calls, in order.', code: `Old MainActivity:  onPause  ->  onStop  ->  [[onDestroy]]
New MainActivity:  [[onCreate]]  ->  onStart  ->  onResume`, why: 'The old object goes all the way down, and a new one comes all the way up.' },
          { type: 'bug', prompt: 'Ada guessed her Logcat for: open Hello, Home and back, then rotate. One line is wrong. Tap it.', code: `// Ada's guess
onCreate
starts = 1
starts = 2
onCreate
starts = 3`, bug: 5, fix: 'starts = 1', why: 'The second <code>onCreate</code> belongs to a new object, whose <code>starts</code> begins at 0. Its <code>onStart</code> makes it 1.' },
        ],
        quiz: [
          { q: 'Which of these is a configuration change?', options: ['Switching the phone to dark theme', 'Getting a new message', 'Tapping text in the app'], a: 0, why: 'Dark theme changes how every screen should look, so Android recreates the Activity.' },
          { q: 'Why does Android create a new Activity on a configuration change?', options: ['So the new screen starts with the right layout, text and colours', 'To free memory', 'Because the app crashed'], a: 0, why: 'A fresh object is built for the new settings from the start.' },
          { q: '<code>MainActivity</code> has <code>private var name = "Ada"</code>, and the app changed it to <code>"Lin"</code>. The phone rotates. What is <code>name</code> in the new <code>MainActivity</code>?', options: ['<code>"Ada"</code>', '<code>"Lin"</code>', '<code>null</code>'], a: 0, why: 'The new object starts with the starting value. The <code>"Lin"</code> was in the old object, which is gone.' },
        ],
        docs: [['Handle configuration changes', 'https://developer.android.com/guide/topics/resources/runtime-changes']],
      },

      {
        id: 'resources',
        title: 'Resources',
        tagline: 'Keep words, colours and pictures in res/, and reach them through R.',
        goals: ['Move the text your app shows into <code>strings.xml</code>', 'Name a colour and add a picture to <code>res/</code>', 'Read a resource in code through its id in <code>R</code>'],
        level: 'beginner',
        introduces: ['R', 'color', 'drawable', 'getString', 'resources', 'label'],
        body: `
<p>Hello’s greeting, <code>"Hello, Ada!"</code>, is typed inside <code>MainActivity.kt</code>. That works for one line. A real app shows hundreds of texts, often the same words in several places, and changing one means finding every copy in the code. Android keeps text, colours and pictures in their own folder, <code>res/</code> (short for <em>resources</em>), so each one lives in exactly one place.</p>
<p>Text goes in <code>res/values/strings.xml</code>, one line per text, each with a name. Hello’s file already has one line, written by the template: <code>&lt;string name="app_name"&gt;Hello&lt;/string&gt;</code>. Add the greeting below it: <code>&lt;string name="greeting"&gt;Hello, Ada!&lt;/string&gt;</code>. Colours go in <code>res/values/colors.xml</code>: <code>&lt;color name="sky"&gt;#FF4FA3E0&lt;/color&gt;</code>. After the <code>#</code> come hex digits, 0–9 and A–F, two per part, from <code>00</code> (none) to <code>FF</code> (full): first how visible the colour is (<code>FF</code>, fully), then how much red, green and blue. Pictures are files in <code>res/drawable/</code>, like <code>logo.png</code>. Resource names use lowercase letters, digits and <code>_</code>.</p>
<p>When the app builds, Android makes a class called <code>R</code> with an id for every resource: <code>R.string.greeting</code>, <code>R.color.sky</code>, <code>R.drawable.logo</code> (the file name without <code>.png</code>). An id is an <code>Int</code>, a number, not the text itself. Inside an Activity, <code>getString(R.string.greeting)</code> looks the id up and gives back <code>"Hello, Ada!"</code>. In Hello, change <code>Text("Hello, Ada!")</code> to <code>Text(getString(R.string.greeting))</code> and click Run: the screen looks the same, but the words now live in <code>strings.xml</code>.</p>
<p>XML files point at resources with <code>@</code>. Open Hello’s <code>AndroidManifest.xml</code>: the line <code>android:label="@string/app_name"</code> takes the app’s name, the one under its icon, from <code>strings.xml</code>.</p>`,
        visual(el) {
          const app = text => `<div class="ui-m-body">${text}</div>`;
          const home = '<div class="and-home">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => i === 4 ? '<span class="and-app"><span class="and-ico and-me"></span><small>Hello</small></span>' : '<span class="and-ico"></span>').join('') + '</div>';
          const sky = '<div class="ui-m-body"><div class="ui-m-img"></div><b>Hi, Ada!</b><span class="ui-m-chip" style="background:#4FA3E0;color:#0B2233;border-color:#4FA3E0">sky</span><span class="ui-m-muted">R.drawable.logo above, R.color.sky here</span></div>';
          Lab.ui.phone(el, {
            logTitle: 'res/ and R',
            predict: {
              q: 'Hello shows <code>getString(R.string.greeting)</code>. You change <code>greeting</code> in <code>strings.xml</code> to “Hi, Ada!” and click Run. What else must you change?',
              options: ['Nothing: the screen shows “Hi, Ada!”', '<code>MainActivity.kt</code>, to type the new words there too', 'The manifest'],
              a: 0,
              why: 'The code holds only the id, and the id points at the one line in <code>strings.xml</code>.',
            },
            frames: [
              { screen: app('Hello, Ada!'), log: '// res/values/strings.xml: greeting = "Hello, Ada!"', say: 'Hello after this lesson’s change. It looks the same, but the greeting now comes from <code>strings.xml</code>.' },
              { log: 'getString(R.string.greeting)  →  "Hello, Ada!"', say: 'The Kotlin code never contains the words. It holds the id <code>R.string.greeting</code>, and <code>getString</code> looks up the text.' },
              { screen: home, log: ['// AndroidManifest.xml', 'android:label="@string/app_name"  →  "Hello"'], say: 'The name under the icon comes from the same file: the manifest points at <code>app_name</code> with <code>@</code>.' },
              { log: '// strings.xml edited: greeting = "Hi, Ada!"', say: 'One line in <code>strings.xml</code> changes. No Kotlin file is touched. Click Run.' },
              { screen: app('Hi, Ada!'), log: 'Run ▶', say: 'The screen shows the new text.' },
              { screen: sky, log: ['R.color.sky       // from colors.xml', 'R.drawable.logo   // from res/drawable/logo.png'], say: 'Colours and pictures work the same way: one name in <code>res/</code>, one id in <code>R</code>.' },
              { log: ['getString(R.string.greetin)', "Unresolved reference 'greetin'."], say: 'A typo in a name is caught when the app builds: <code>R</code> has no id called <code>greetin</code>.' },
            ],
          });
        },
        code: `<!-- res/values/strings.xml -->
<resources>
    <string name="app_name">Hello</string>        <!-- written by the template -->
    <string name="greeting">Hello, Ada!</string>
</resources>

<!-- res/values/colors.xml -->
<resources>
    <color name="sky">#FF4FA3E0</color>
</resources>

// MainActivity.kt
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val greeting = getString(R.string.greeting)   // "Hello, Ada!"
        setContent {
            Text(greeting)
        }
    }
}`,
        remember: 'Text, colours and pictures live in res/. R gives each one an id, and getString(R.string.name) reads a text.',
        mistakes: [
          { title: 'Typing the text into the code', bad: `setContent {
    Text("Hello, Ada!")
}`, good: `setContent {
    Text(getString(R.string.greeting))
}`, why: 'Text in the code has to be found and changed in every file. In <code>strings.xml</code> it is one line, and it can be translated, as the next lesson shows.' },
        ],
        terms: [
          { term: 'resource', def: 'Something your app uses that is not code: a text, a colour, a picture. Resources live in <code>res/</code>.' },
          { term: 'strings.xml', def: 'The file in <code>res/values/</code> that holds the app’s texts, each with a name.' },
          { term: 'R', def: 'A class Android generates when the app builds, with an <code>Int</code> id for every resource, like <code>R.string.greeting</code>.' },
          { term: 'drawable', def: 'A picture resource in <code>res/drawable/</code>. Its id is <code>R.drawable.</code> plus the file name without the ending.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add a text called <code>farewell</code> and read it in the Activity.', code: `<string name="[[farewell]]">Bye, Ada!</string>

val text = getString(R.[[string]].farewell)`, why: 'The <code>name</code> in <code>strings.xml</code> becomes the last part of the id: <code>R.string.farewell</code>.' },
          { type: 'bug', prompt: 'The build stops with <code>Unresolved reference \'Save\'.</code> Tap the line that needs to change.', code: `<resources>
    <string name="app_name">Hello</string>
    <string name="save">Save</string>
</resources>

val label = getString(R.string.Save)`, bug: 5, fix: 'val label = getString(R.string.save)', why: 'The id uses the name exactly as written in <code>strings.xml</code>, including lowercase letters: <code>save</code>.' },
        ],
        quiz: [
          { q: 'What is <code>R.string.greeting</code>?', options: ['An <code>Int</code> id that points at the text', 'The text “Hello, Ada!” itself', 'The file <code>strings.xml</code>'], a: 0, why: 'R holds ids. <code>getString(R.string.greeting)</code> turns the id into the text.' },
          { q: 'Where does a picture called <code>logo.png</code> go, and what is its id?', options: ['<code>res/drawable/</code>, <code>R.drawable.logo</code>', '<code>res/values/</code>, <code>R.string.logo</code>', 'Next to <code>MainActivity.kt</code>, <code>R.logo</code>'], a: 0, why: 'Pictures are drawables. The id is the file name without <code>.png</code>.' },
          { q: 'How does an XML file, like the manifest, point at the text <code>app_name</code>?', options: ['<code>@string/app_name</code>', '<code>R.string.app_name</code>', '<code>getString(app_name)</code>'], a: 0, why: 'XML uses <code>@</code> plus the type and name. <code>R.string.app_name</code> is the Kotlin way.' },
        ],
        docs: [['App resources overview', 'https://developer.android.com/guide/topics/resources/providing-resources'], ['String resources', 'https://developer.android.com/guide/topics/resources/string-resource']],
      },

      {
        id: 'localization',
        title: 'Other languages',
        tagline: 'Add a folder per language, and Android picks the right one for each phone.',
        goals: ['Translate your app with a <code>values-es</code> style folder', 'Write counts like “1 visit” and “3 visits” with <code>plurals</code>', 'Avoid the dotted and dotless i bug when changing case'],
        level: 'beginner',
        introduces: ['plurals', 'quantity', 'getQuantityString', 'import', 'Locale', 'forLanguageTag', 'getDefault', 'uppercase'],
        body: `
<p>Sam’s phone is set to Spanish, but Hello still greets in English. Because the greeting is already in <code>strings.xml</code>, translating it means adding files, not changing code.</p>
<p>Make a folder <code>res/values-es/</code> with its own <code>strings.xml</code>: the same names, Spanish text, like <code>&lt;string name="greeting"&gt;¡Hola, Ada!&lt;/string&gt;</code>. <code>-es</code> is a language code (<code>fr</code> is French, <code>ja</code> Japanese). Android reads the phone’s language and takes each string from the matching folder. If there is no matching folder, or the text is missing there, it falls back to plain <code>values/</code>. So <code>values/</code> must hold every string: if one is missing there, the app crashes on phones in other languages when it reads that string.</p>
<p>Counts need care. Say Hello shows how many times Ada has visited it: <code>"$count visits"</code> gives “1 visits”. A <code>&lt;plurals&gt;</code> resource holds one <code>&lt;item&gt;</code> per form: <code>quantity="one"</code> and <code>quantity="other"</code> in English, and some languages have more (Arabic has six). To read it, use <code>resources</code>, the Activity’s way into everything in <code>res/</code>: <code>resources.getQuantityString(R.plurals.visit_count, count, count)</code> takes the count twice. The first picks the form, the second fills the <code>%d</code>, the spot where a whole number goes.</p>
<p>Changing case depends on language too. Turkish has a dotted <code>i</code> (capital <code>İ</code>) and a dotless <code>ı</code> (capital <code>I</code>). A <code>Locale</code> describes a language for code, and <code>"title".uppercase(Locale.forLanguageTag("tr"))</code> gives <code>"TİTLE"</code>. If your code uppercases with the phone’s language and then checks <code>== "TITLE"</code>, the check fails on Turkish phones. So for words your code compares, use <code>uppercase()</code> with no locale: the same result on every phone. Use <code>Locale.getDefault()</code>, the phone’s language, only for text people read. <code>Locale</code> comes from Java, so the file needs <code>import java.util.Locale</code> at the top. Android Studio offers to add that line for you.</p>`,
        visual(el) {
          const scr = (w, n) => `<div class="ui-m-body"><b>${w}</b><span class="ui-m-muted">${n}</span></div>`;
          Lab.ui.phone(el, {
            logTitle: 'Which folder?',
            predict: {
              q: 'Hello has <code>values/</code> (English) and <code>values-es/</code> (Spanish). The phone is set to German. What does the greeting show?',
              options: ['“Hello, Ada!”, from <code>values/</code>', '“¡Hola, Ada!”, from <code>values-es/</code>', 'An error: the app stops'], a: 0,
              why: 'No folder matches German, so Android falls back to the default <code>values/</code>. That is why it must hold every string.',
            },
            frames: [
              { screen: scr('Hello, Ada!', '3 visits'), log: ['phone language: English', 'values/  →  "Hello, Ada!"'], say: 'An English phone. Every string comes from the default folder, <code>values/</code>.' },
              { log: ['phone language: Spanish', 'no values-es/  →  values/'], say: 'Sam sets his phone to Spanish. There is no Spanish folder yet, so he still sees English.' },
              { screen: scr('¡Hola, Ada!', '3 visitas'), log: ['// added res/values-es/strings.xml', 'values-es/  →  "¡Hola, Ada!"'], say: 'Add <code>values-es/strings.xml</code> with the same names. The code didn’t change, but now Sam reads Spanish.' },
              { screen: scr('Hello, Ada!', '3 visits'), log: ['phone language: German', 'no values-de/  →  values/'], say: 'A German phone has no matching folder, so Android uses <code>values/</code>.' },
              { screen: scr('Hello, Ada!', '1 visit'), log: ['phone language: English', 'getQuantityString(R.plurals.visit_count, 1, 1)  →  "1 visit"'], say: 'One visit. The first <code>1</code> picks the <code>one</code> form, the second fills <code>%d</code>. A template like <code>"$count visits"</code> would say “1 visits”.' },
              { log: ['phone language: Turkish', '"title".uppercase(Locale.getDefault())  →  "TİTLE"', '"TİTLE" == "TITLE"  →  false'], say: 'On a Turkish phone, code that compares words using the phone’s language breaks: <code>i</code> becomes the dotted <code>İ</code>.' },
              { log: ['"title".uppercase()  →  "TITLE"', '"TITLE" == "TITLE"  →  true'], say: 'With no locale, <code>uppercase()</code> gives <code>"TITLE"</code> on every phone. Keep the phone’s language for text people read.' },
            ],
          });
        },
        code: `<!-- res/values/strings.xml: the default, with every string -->
<resources>
    <string name="app_name">Hello</string>
    <string name="greeting">Hello, Ada!</string>
    <plurals name="visit_count">
        <item quantity="one">%d visit</item>
        <item quantity="other">%d visits</item>
    </plurals>
</resources>

<!-- res/values-es/strings.xml: Spanish -->
<resources>
    <string name="greeting">¡Hola, Ada!</string>
    <plurals name="visit_count">
        <item quantity="one">%d visita</item>
        <item quantity="other">%d visitas</item>
    </plurals>
</resources>

// MainActivity.kt, inside onCreate, on a Spanish phone
val count = 3
val greeting = getString(R.string.greeting)                                  // "¡Hola, Ada!"
val visits = resources.getQuantityString(R.plurals.visit_count, count, count)  // "3 visitas"`,
        play: `import java.util.Locale

fun main() {
    val turkish = Locale.forLanguageTag("tr")
    println("title".uppercase())                     // TITLE, the same everywhere
    println("title".uppercase(turkish))              // TİTLE
    println("title".uppercase(turkish) == "TITLE")   // false
    // Try "lisbon" with and without the Turkish locale.
}`,
        remember: 'values/ has every string; values-xx overrides some. Counts use plurals with the count twice. Compare words with uppercase(), no locale.',
        mistakes: [
          { title: 'Building a count with a template', bad: `val visits = "$count visits"   // "1 visits"`, good: `val visits = resources.getQuantityString(R.plurals.visit_count, count, count)   // "1 visit"`, why: 'A template can’t pick the right form, and it can’t be translated. <code>plurals</code> does both.' },
        ],
        terms: [
          { term: 'language folder', def: 'A folder like <code>res/values-es/</code>. The code after the dash names the language its strings are for.' },
          { term: 'default resources', def: 'The folders without a dash, like <code>values/</code>. Android falls back to them, so they must have every string.' },
          { term: 'plurals', def: 'A string with one <code>&lt;item&gt;</code> per form, such as <code>one</code> and <code>other</code>. Android picks the form from the count and the language.' },
          { term: 'Locale', def: 'A description of a language (and maybe a region) for code, like <code>Locale.forLanguageTag("tr")</code>. Case changes and number formats follow it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give English the two forms it needs.', code: `<plurals name="photos">
    <item quantity="[[one]]">%d photo</item>
    <item quantity="[[other]]">%d photos</item>
</plurals>`, why: 'English has <code>one</code> and <code>other</code>. Always supply both; translators add the forms their language needs.' },
          { type: 'bug', prompt: 'On a phone set to Turkish, <code>isTitle("title")</code> returns <code>false</code>. Tap the line that needs to change.', code: `fun isTitle(tag: String): Boolean {
    return tag.uppercase(Locale.getDefault()) == "TITLE"
}`, bug: 1, fix: '    return tag.uppercase() == "TITLE"', why: 'This compares words, so it must not follow the phone’s language. <code>uppercase()</code> with no locale gives the same result on every phone.' },
        ],
        quiz: [
          { q: 'Hello has <code>values/</code> and <code>values-es/</code>. Where does a Spanish phone get a string that is only in <code>values/</code>?', options: ['From <code>values/</code>', 'Nowhere: the text is empty', 'From Google Translate'], a: 0, why: 'A string missing from the language folder falls back to the default folder.' },
          { q: 'On an English phone, what does <code>resources.getQuantityString(R.plurals.visit_count, 1, 1)</code> return, with the plurals from this lesson?', options: ['<code>"1 visit"</code>', '<code>"1 visits"</code>', '<code>"%d visit"</code>'], a: 0, why: 'The first <code>1</code> picks <code>quantity="one"</code>, the second replaces <code>%d</code>.' },
          { q: 'What does <code>"title".uppercase()</code> return on a phone set to Turkish?', options: ['<code>"TITLE"</code>', '<code>"TİTLE"</code>'], a: 0, why: 'With no locale, <code>uppercase()</code> uses the same rules on every phone. Only <code>uppercase(Locale.forLanguageTag("tr"))</code> gives the dotted <code>İ</code>.' },
        ],
        docs: [['Localize your app', 'https://developer.android.com/guide/topics/resources/localization'], ['uppercase', 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/uppercase.html']],
      },

      {
        id: 'context',
        title: 'Context',
        tagline: 'The object your code uses to reach Android, and which one to keep.',
        goals: ['Explain what a <code>Context</code> is and where you already have one', 'Choose between the Activity and <code>applicationContext</code>', 'Avoid keeping a closed screen in memory by mistake'],
        level: 'beginner',
        introduces: ['Context', 'applicationContext', 'Toast', 'makeText', 'LENGTH_SHORT', 'show'],
        body: `
<p>Reading a text from <code>res/</code>, showing a short message, opening another screen: your code can’t do these alone. It has to ask Android. A <code>Context</code> is the object you ask. It gives access to resources (<code>getString</code>), to the app’s files and to the system.</p>
<p>You already have one. An Activity is a <code>Context</code> (it inherits from it), which is why <code>getString</code> works inside <code>MainActivity</code>. Functions that need one take a <code>Context</code> parameter, and inside an Activity you pass <code>this</code>. For example, <code>Toast.makeText(this, "Saved", Toast.LENGTH_SHORT).show()</code> shows a short message, a <em>toast</em>, at the bottom of the screen.</p>
<p>There are two you will meet. The Activity lives only as long as that screen: rotating the phone destroys it and makes a new one, as you saw. <code>applicationContext</code> is one object for the whole app, and it lives as long as the app runs.</p>
<p>That difference matters when something long-lived keeps a context. Android frees the memory of objects nothing points to any more. Say Hello gets an <code>object GreetingStore</code> that needs a context to read the greeting. If it stores the Activity, the old screen can never be freed after a rotation: a <em>memory leak</em>. The rule: anything that outlives a screen keeps <code>applicationContext</code>. Work for the screen you are on, like a toast, uses the Activity.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 320,
            nodes: [
              { id: 'app0', label: 'The app<small>keeps objects alive</small>', x: 20, y: 10, tone: 'muted' },
              { id: 'store', label: 'GreetingStore<small>object</small>', x: 20, y: 45 },
              { id: 'appctx', label: 'applicationContext<small>one per app</small>', x: 22, y: 85, tone: 'ok', hidden: true },
              { id: 'a1', label: 'Activity #1', x: 76, y: 10 },
              { id: 'a2', label: 'Activity #2', x: 76, y: 36, hidden: true },
              { id: 'a3', label: 'Activity #3', x: 76, y: 62, hidden: true },
              { id: 'sys', label: 'Android<small>shows the screen</small>', x: 76, y: 90, tone: 'muted' },
            ],
            predict: {
              q: 'Every <code>onCreate</code> calls <code>GreetingStore.init(this)</code>, and <code>init</code> keeps only the first <code>MainActivity</code> it gets. The phone rotates twice. How many old <code>MainActivity</code> objects stay in memory?',
              options: ['One: #1, the one <code>GreetingStore</code> points to', 'None: closed screens are always freed', 'Two: #1 and #2'],
              a: 0,
              why: 'Android frees an object only when nothing points to it. <code>GreetingStore</code> still points to #1. Nothing points to #2, so it is freed.',
            },
            frames: [
              { add: [['app0', 'store'], ['sys', 'a1']], say: '<code>MainActivity</code> #1 is on screen, so Android points to it. <code>GreetingStore</code> is an <code>object</code>: it lives as long as the app.' },
              { add: [['store', 'a1', 'context']], say: '<code>GreetingStore.init(this)</code> passes the Activity. <code>init</code> keeps only the first one it gets, so <code>GreetingStore</code> now points to #1.' },
              { show: ['a2'], remove: [['sys', 'a1']], add: [['sys', 'a2']], say: 'Rotate. Android destroys #1, makes #2, and stops pointing to #1. #2’s <code>onCreate</code> calls <code>init(this)</code> too, but <code>init</code> already has a context and ignores it.' },
              { show: ['a3'], remove: [['sys', 'a2']], add: [['sys', 'a3']], gone: ['a2'], say: 'Rotate again. Nothing points to #2 any more, so its memory is freed.' },
              { hl: ['store', 'a1'], add: [['app0', 'store', '', 'err'], ['store', 'a1', 'context', 'err']], say: 'But #1 is still pointed to: the app → <code>GreetingStore</code> → #1. It can’t be freed, with everything it holds. That is a memory leak.' },
              { show: ['appctx'], remove: [['store', 'a1']], add: [['app0', 'store'], ['store', 'appctx', 'context', 'ok']], gone: ['a1'], say: 'The fix: keep <code>context.applicationContext</code>. It lives as long as the app anyway, and no closed screen is held.' },
            ],
          });
        },
        code: `object GreetingStore {
    private var context: Context? = null

    fun init(context: Context) {
        if (this.context == null) {                       // keep only the first one
            this.context = context.applicationContext     // the app, never the screen
        }
    }

    fun greeting(): String = context?.getString(R.string.greeting) ?: ""
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        GreetingStore.init(this)                                       // an Activity is a Context
        Toast.makeText(this, "Welcome", Toast.LENGTH_SHORT).show()     // work for this screen
        setContent { Text(GreetingStore.greeting()) }                  // Hello, Ada!
    }
}`,
        remember: 'An Activity is a Context for its own screen. Anything that lives longer keeps applicationContext.',
        mistakes: [
          { title: 'Keeping the Activity in an object', bad: `fun init(context: Context) {
    if (this.context == null) {
        this.context = context        // the first Activity, kept for ever
    }
}`, good: `fun init(context: Context) {
    if (this.context == null) {
        this.context = context.applicationContext
    }
}`, why: 'An <code>object</code> lives as long as the app. If it keeps an Activity, that screen stays in memory after it closes.' },
        ],
        terms: [
          { term: 'Context', def: 'The object your code uses to reach Android: resources, files, messages, other screens. An Activity is one.' },
          { term: 'applicationContext', def: 'One <code>Context</code> for the whole app. It lives as long as the app runs, so long-lived objects may keep it.' },
          { term: 'toast', def: 'A short message at the bottom of the screen that goes away by itself: <code>Toast.makeText(this, "Saved", Toast.LENGTH_SHORT).show()</code>.' },
          { term: 'memory leak', def: 'Memory that can’t be freed because something still points to an object nobody needs, like a closed screen.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'This class lives as long as the app. Keep the right context.', code: `class Analytics(context: Context) {
    private val appContext = context.[[applicationContext]]
}`, why: '<code>applicationContext</code> lives as long as the app, so keeping it holds on to no screen.' },
          { type: 'bug', prompt: '<code>MainActivity</code> calls <code>Settings.init(this)</code>, and <code>init</code> keeps the first context it gets. After a rotation, the old <code>MainActivity</code> stays in memory. Tap the line that needs to change.', code: `object Settings {
    private var context: Context? = null
    fun init(context: Context) {
        if (this.context == null) {
            this.context = context
        }
    }
}`, bug: 4, fix: '            this.context = context.applicationContext', why: 'The object keeps whatever it is given for as long as the app runs. Give it the app’s context, not the screen.' },
        ],
        quiz: [
          { q: 'Why can <code>MainActivity</code> call <code>getString(R.string.greeting)</code> with nothing in front?', options: ['An Activity is a <code>Context</code>, and <code>getString</code> belongs to <code>Context</code>', '<code>getString</code> works anywhere in Kotlin', 'Android Studio adds it while the app runs'], a: 0, why: 'The Activity inherits <code>getString</code> from <code>Context</code>.' },
          { q: 'An <code>object</code> keeps the first Activity it was given. The phone rotates. What happens to that old Activity?', options: ['It stays in memory, because the object still points to it', 'The object switches to the new Activity by itself', 'The app stops at once'], a: 0, why: 'Android frees only what nothing points to. The object still points to the old screen.' },
          { q: 'A cache lives as long as the app and needs a <code>Context</code>. What should it keep?', options: ['<code>applicationContext</code>', 'The Activity that created it', 'A new Activity for each call'], a: 0, why: 'Keep the context that lives as long as the cache: the app’s.' },
        ],
        docs: [['Context', 'https://developer.android.com/reference/android/content/Context']],
      },

      {
        id: 'intents',
        title: 'Intents',
        tagline: 'Name the screen you want, or describe the job and let Android find an app.',
        goals: ['Open your own second screen with an <code>Intent</code>', 'Send a value to that screen with <code>putExtra</code>', 'Open a web link in another app'],
        level: 'beginner',
        introduces: ['Intent', 'startActivity', 'putExtra', 'getStringExtra', 'intent', '::', 'activity', 'Button', 'onClick', 'ACTION_VIEW', 'Uri', 'parse', 'ActivityNotFoundException'],
        body: `
<p>Hello has one screen, and it has done its job. From here on we build a small <b>Notes</b> app with two screens: a list of notes, <code>MainActivity</code>, and a detail screen that shows one note, <code>DetailActivity</code>. To follow along, make a new Empty Activity project called <code>Notes</code>. Tapping a note should open its details, but you can’t call the other Activity’s <code>onCreate</code> yourself: Android creates screens. You ask it with an <code>Intent</code>, a message that says “please start this”.</p>
<p><code>Intent(this, DetailActivity::class.java)</code> names the screen. <code>DetailActivity::class.java</code> means “the class <code>DetailActivity</code> itself”, in the form Android expects. <code>startActivity(intent)</code> sends it, and the new screen opens on top. Write <code>DetailActivity</code> in a new file, <code>DetailActivity.kt</code>, next to <code>MainActivity.kt</code>. Every Activity must also be listed in the manifest, as <code>&lt;activity android:name=".DetailActivity" /&gt;</code>, or Android can’t start it. To trigger it, <code>Button(onClick = { ... }) { Text("Open") }</code> shows a button, and the code in <code>onClick</code> runs when it is tapped.</p>
<p>An intent can carry values, called <em>extras</em>. <code>intent.putExtra("title", "Shopping")</code> packs a value under a key. In the new screen, <code>intent</code> is the Intent that started it, and <code>intent.getStringExtra("title")</code> reads the value back. It is a <code>String?</code>, because the key might be missing.</p>
<p>An intent that names a class is <em>explicit</em>. An <em>implicit</em> intent describes a job instead, and Android finds an app that can do it. <code>Intent(Intent.ACTION_VIEW, Uri.parse("https://example.com"))</code> means “show this web page”, and a browser opens it (<code>Uri.parse</code> turns the text into an address). If no app on the phone can do the job, <code>startActivity</code> throws <code>ActivityNotFoundException</code>, so put it in a <code>try</code> and catch that.</p>`,
        visual(el) {
          const list = '<div class="ui-m-bar">Notes</div><div class="ui-m-body"><div class="ui-m-row n1"><span class="ui-m-av"></span><div>Shopping</div></div><div class="ui-m-row"><span class="ui-m-av"></span><div>Trip to Oslo</div></div></div>';
          const detail = (extra = '') => `<div class="ui-m-bar">← Shopping</div><div class="ui-m-body"><b>Shopping</b><div class="ui-m-line"></div><div class="ui-m-line short"></div><span class="ui-m-btn lk">Open recipe link</span></div>${extra}`;
          const browser = '<div class="ui-m-bar">Browser</div><div class="ui-m-body"><span class="ui-m-chip">https://example.com/recipe</span><div class="ui-m-img"></div><div class="ui-m-line"></div></div>';
          Lab.ui.phone(el, {
            logTitle: 'Your code',
            predict: {
              q: 'Your app opens a link with an implicit intent, with no <code>try</code>/<code>catch</code>, on a phone where no app can open links. What happens?',
              options: ['<code>ActivityNotFoundException</code> is thrown and the app crashes', 'Nothing happens', 'Android installs a browser'],
              a: 0,
              why: 'No app matches the job, so <code>startActivity</code> throws. Catch <code>ActivityNotFoundException</code> and tell the user.',
            },
            frames: [
              { screen: list, say: 'The Notes list screen, <code>MainActivity</code>. Each note is a button.' },
              { tap: '.n1', log: ['val intent = Intent(this, DetailActivity::class.java)', 'intent.putExtra("title", "Shopping")', 'startActivity(intent)'], say: 'Tap “Shopping”. The code names the screen, packs the title as an extra, and asks Android to start it.' },
              { screen: detail(), log: ['DetailActivity.onCreate()', 'intent.getStringExtra("title")  →  "Shopping"'], say: 'Android creates <code>DetailActivity</code> on top. It reads the extra from the Intent that started it.' },
              { tap: '.lk', log: 'startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://example.com/recipe")))', say: 'Tap the link. This intent names no class: <code>ACTION_VIEW</code> with a web address means “show this page”.' },
              { screen: browser, say: 'A browser, another app, opens the page. Your app didn’t need to know which one.' },
              { screen: detail('<div class="ui-m-snack">No app can open this link</div>'), log: ['catch (e: ActivityNotFoundException)', '// a phone with no app for the job'], say: 'On a phone with no app for the job, <code>startActivity</code> throws. Your <code>catch</code> shows a message instead of crashing.' },
            ],
          });
        },
        code: `// MainActivity.kt: open the detail screen
setContent {
    Button(onClick = {
        val intent = Intent(this, DetailActivity::class.java)
        intent.putExtra("title", "Shopping")
        startActivity(intent)
    }) { Text("Open Shopping") }
}

// DetailActivity.kt (listed in the manifest as <activity android:name=".DetailActivity" />)
class DetailActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val title = intent.getStringExtra("title") ?: "No title"   // "Shopping"
        setContent { Text(title) }
    }

    // Open a web page in whichever app can show it (call it from a button)
    private fun openLink() {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://example.com")))
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(this, "No app can open this link", Toast.LENGTH_SHORT).show()
        }
    }
}`,
        remember: 'An explicit Intent names your screen; an implicit Intent names a job. startActivity sends it; catch ActivityNotFoundException.',
        mistakes: [
          { title: 'Forgetting the manifest line', bad: `// AndroidManifest.xml lists only MainActivity
startActivity(Intent(this, DetailActivity::class.java))   // ActivityNotFoundException`, good: `// AndroidManifest.xml lists DetailActivity too:
// <activity android:name=".DetailActivity" />
startActivity(Intent(this, DetailActivity::class.java))   // opens`, why: 'Android starts only the screens the manifest lists. Without the line, <code>startActivity</code> throws <code>ActivityNotFoundException</code>.' },
        ],
        terms: [
          { term: 'Intent', def: 'A message that asks Android to start something, like another screen.' },
          { term: 'explicit intent', def: 'An Intent that names the exact class to start, for screens in your own app: <code>Intent(this, DetailActivity::class.java)</code>.' },
          { term: 'implicit intent', def: 'An Intent that describes a job, like <code>ACTION_VIEW</code> with a web address, so Android finds an app that can do it.' },
          { term: 'extra', def: 'A value carried by an Intent under a key: <code>putExtra("title", "Shopping")</code>, read with <code>getStringExtra("title")</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Open a web page in whichever app can show it.', code: `try {
    startActivity(Intent(Intent.[[ACTION_VIEW]], Uri.[[parse]]("https://example.com")))
} catch (e: ActivityNotFoundException) {
    Toast.makeText(this, "No app can open this link", Toast.LENGTH_SHORT).show()
}`, why: '<code>ACTION_VIEW</code> describes the job, and <code>Uri.parse</code> turns the text into an address.' },
          { type: 'bug', prompt: 'This doesn’t compile. Tap the line that needs to change.', code: `fun openDetail() {
    val intent = Intent(this, DetailActivity::class)
    intent.putExtra("title", "Shopping")
    startActivity(intent)
}`, bug: 1, fix: '    val intent = Intent(this, DetailActivity::class.java)', why: 'An Intent needs the class in the form Android expects: <code>DetailActivity::class.java</code>.' },
        ],
        quiz: [
          { q: '<code>Intent(Intent.ACTION_VIEW, Uri.parse("https://example.com"))</code> is', options: ['implicit: it describes a job', 'explicit: it names a class'], a: 0, why: 'It names an action and an address, not a class. Android picks the app.' },
          { q: 'In <code>DetailActivity</code>, what type does <code>intent.getStringExtra("title")</code> have?', options: ['<code>String?</code>', '<code>String</code>', '<code>Int</code>'], a: 0, why: 'The key might be missing, so the result can be <code>null</code>. Use <code>?:</code> to give a default.' },
          { q: 'To open your own <code>SettingsActivity</code>, which intent fits?', options: ['An explicit one: <code>Intent(this, SettingsActivity::class.java)</code>', 'An implicit one with <code>ACTION_VIEW</code>'], a: 0, why: 'For your own screens, name the class. Then no other app can receive it.' },
        ],
        docs: [['Intents and intent filters', 'https://developer.android.com/guide/components/intents-filters']],
      },

      {
        id: 'permissions',
        title: 'Permissions',
        tagline: 'The camera, location and microphone need the user’s yes, asked at the right moment.',
        goals: ['Declare a permission in the manifest', 'Check a permission and ask for it while the app runs', 'Keep the app working when the answer is no'],
        level: 'beginner',
        introduces: ['uses', 'permission', 'Manifest', 'CAMERA', 'ContextCompat', 'checkSelfPermission', 'PackageManager', 'PERMISSION_GRANTED', 'PERMISSION_DENIED', 'registerForActivityResult', 'ActivityResultContracts', 'RequestPermission', 'launch', 'shouldShowRequestPermissionRationale'],
        body: `
<p>Notes could let the user add a photo to a note, with an “Add photo” button on the detail screen, <code>DetailActivity</code>. But the camera can see a person’s home, so Android won’t let an app use it until the user says yes. That yes is a <em>permission</em>. Some permissions, like using the internet, only need a line in the manifest. Others, called <em>runtime permissions</em> (camera, location, microphone), also need the user to agree while the app runs.</p>
<p>First, the manifest: <code>&lt;uses-permission android:name="android.permission.CAMERA" /&gt;</code>. Then, when the user taps “Add photo”, check with <code>ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)</code>. <code>ContextCompat</code> is a helper from Android’s libraries, and the check answers <code>PackageManager.PERMISSION_GRANTED</code> or <code>PackageManager.PERMISSION_DENIED</code>. If it is granted, go ahead.</p>
<p>If not, ask. <code>registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted -&gt; ... }</code> makes a <em>launcher</em>. Create it as a property of the Activity, so it exists before the screen starts. <code>launcher.launch(Manifest.permission.CAMERA)</code> shows the system’s dialog, and your lambda receives <code>true</code> or <code>false</code>.</p>
<p>Ask at the moment the user wants the feature, not when the app opens, so the question makes sense. If the user said no before, <code>shouldShowRequestPermissionRationale(Manifest.permission.CAMERA)</code> returns <code>true</code>: explain why you need it first, then ask. After the user taps “Don’t allow” twice, Android stops showing the dialog and answers no at once; only the Settings app can change it. So the rest of the app must keep working without the permission.</p>`,
        visual(el) {
          const note = (extra = '') => `<div class="ui-m-bar">← Shopping</div><div class="ui-m-body"><b>Shopping</b><div class="ui-m-line"></div><div class="ui-m-line short"></div><span class="ui-m-btn ph">Add photo</span></div>${extra}`;
          const dialog = '<div class="ui-m-scrim"><div class="ui-m-dialog"><b>Allow Notes to take pictures and record video?</b><span class="ui-m-btn ghost">While using the app</span><span class="ui-m-btn ghost">Only this time</span><span class="ui-m-btn ghost no">Don’t allow</span></div></div>';
          const why = '<div class="ui-m-sheet"><b>Photos need the camera</b><span class="ui-m-muted">Notes uses it only when you add a photo.</span><span class="ui-m-btn">Continue</span></div>';
          const snack = t => `<div class="ui-m-snack">${t}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'Your code',
            predict: {
              q: 'The user has tapped “Don’t allow” twice. Your app calls <code>launch(Manifest.permission.CAMERA)</code> again. What happens?',
              options: ['No dialog: the lambda gets <code>false</code> at once', 'The dialog shows again', 'The app crashes'],
              a: 0,
              why: 'Two denials mean “don’t ask again”. Android answers for the user, and only Settings can turn the camera back on.',
            },
            frames: [
              { screen: note(), log: '// manifest: &lt;uses-permission android:name="android.permission.CAMERA" /&gt;', say: 'The manifest says the app may ask for the camera. The user hasn’t answered yet.' },
              { tap: '.ph', log: ['checkSelfPermission(this, CAMERA)  →  PERMISSION_DENIED', 'askCamera.launch(Manifest.permission.CAMERA)'], say: 'The user taps “Add photo”. That is the right moment to ask. The check says no, so the app launches the request.' },
              { screen: note(dialog), say: 'Android shows its own dialog. Your app can’t change its words.' },
              { tap: '.no', screen: note(dialog), say: 'The user taps “Don’t allow”.' },
              { screen: note(snack('You can still write notes')), log: 'granted = false', say: 'Your lambda gets <code>false</code>. The app keeps working, just without photos.' },
              { screen: note(why), log: ['shouldShowRequestPermissionRationale(CAMERA)  →  true'], say: 'Next time they tap “Add photo”, the user has said no before. Explain why first, then ask again.' },
              { screen: note(snack('Turn on the camera in Settings to add photos')), log: ['// second "Don’t allow"', 'askCamera.launch(...)  →  no dialog', 'granted = false'], say: 'After a second no, Android stops asking and answers <code>false</code> at once. Point the user to Settings, and keep the app usable.' },
            ],
          });
        },
        code: `// AndroidManifest.xml
// <uses-permission android:name="android.permission.CAMERA" />

// DetailActivity.kt: the note screen, now with a photo button
class DetailActivity : ComponentActivity() {
    // Created with the Activity, before the screen starts
    private val askCamera = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) {
            openCamera()
        } else {
            Toast.makeText(this, "You can still write notes", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Button(onClick = { addPhoto() }) { Text("Add photo") }
        }
    }

    private fun addPhoto() {            // runs when the user taps: the right moment
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            openCamera()
        } else if (shouldShowRequestPermissionRationale(Manifest.permission.CAMERA)) {
            // the user said no before: explain first, then ask
            Toast.makeText(this, "The camera lets you add photos to notes", Toast.LENGTH_SHORT).show()
            askCamera.launch(Manifest.permission.CAMERA)
        } else {
            askCamera.launch(Manifest.permission.CAMERA)
        }
    }

    private fun openCamera() {
        Toast.makeText(this, "Camera ready", Toast.LENGTH_SHORT).show()
    }
}`,
        remember: 'List it in the manifest, check it, ask when the user wants the feature, and keep working if the answer is no.',
        mistakes: [
          { title: 'Asking as soon as the app opens', bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    askCamera.launch(Manifest.permission.CAMERA)   // before the user did anything
}`, good: `Button(onClick = { addPhoto() }) { Text("Add photo") }   // ask on this tap`, why: 'A camera question at start-up has no reason the user can see, so many people say no. Asked when they tap “Add photo”, it makes sense.' },
        ],
        terms: [
          { term: 'permission', def: 'Android’s permission for an app to use something protected, listed in the manifest with <code>&lt;uses-permission&gt;</code>.' },
          { term: 'runtime permission', def: 'A permission the user must also grant while the app runs, through a system dialog. Camera, location and microphone are examples.' },
          { term: 'launcher', def: 'The object <code>registerForActivityResult</code> returns. Its <code>launch(...)</code> shows the request, and the answer arrives in your lambda.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare the camera, then check whether it is granted.', code: `<uses-permission android:name="android.permission.[[CAMERA]]" />

val ok = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.[[PERMISSION_GRANTED]]`, why: 'The manifest line makes the camera possible. The check tells you whether the user has said yes.' },
          { type: 'bug', prompt: 'The app tries the camera without permission, and asks again when it already has it. Tap the line that needs to change.', code: `private fun addPhoto() {
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_DENIED) {
        openCamera()
    } else {
        askCamera.launch(Manifest.permission.CAMERA)
    }
}`, bug: 1, fix: '    if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {', why: 'Open the camera only when the check says <code>PERMISSION_GRANTED</code>. Otherwise, ask.' },
        ],
        quiz: [
          { q: 'Is the manifest line enough to use the camera?', options: ['No: the user must also say yes while the app runs', 'Yes: the manifest line grants it', 'Only on tablets'], a: 0, why: 'The camera is a runtime permission. The manifest line makes it possible to ask; the user decides.' },
          { q: 'When is the best moment to ask for the camera?', options: ['When the user taps “Add photo”', 'In <code>onCreate</code>, as the app opens', 'After the app has been open for a week'], a: 0, why: 'Asked in context, the reason is clear to the user.' },
          { q: 'The user tapped “Don’t allow” twice. What can still turn the camera on?', options: ['Only the Settings app', 'Calling <code>launch</code> again', 'Restarting the phone'], a: 0, why: 'After two denials Android doesn’t show the dialog any more. The user can change it in Settings.' },
        ],
        docs: [['Request runtime permissions', 'https://developer.android.com/training/permissions/requesting'], ['Permissions on Android', 'https://developer.android.com/guide/topics/permissions/overview']],
      },

      {
        id: 'manifest',
        title: 'The manifest in depth',
        tagline: 'One file tells Android what your app contains, what it needs, and what it can do for other apps.',
        goals: ['Read the main parts of <code>AndroidManifest.xml</code>', 'Let other apps share text into a screen with an <code>intent-filter</code>', 'Use <code>exported</code> and <code>queries</code> correctly'],
        level: 'beginner',
        introduces: ['manifest', 'filter', 'action', 'category', 'MAIN', 'LAUNCHER', 'SEND', 'DEFAULT', 'data', 'mimeType', 'EXTRA_TEXT', 'exported', 'queries', 'service', 'provider'],
        body: `
<p>Before your app runs any code, Android reads <code>AndroidManifest.xml</code>. That is how the home screen knows which screen your icon opens, and how the <em>share sheet</em> (the list of apps that opens when you tap Share in another app) knows your app can receive text. If something isn’t in the manifest, Android doesn’t know it exists.</p>
<p>Inside <code>&lt;application&gt;</code>, each part of the app Android can start has its own tag. These parts are called <em>components</em>. <code>&lt;activity&gt;</code> is a screen. <code>&lt;service&gt;</code> does work without a screen, like playing music. <code>&lt;receiver&gt;</code> reacts to a system event, like the phone finishing start-up. <code>&lt;provider&gt;</code> shares data with other apps. Permissions sit outside, in <code>&lt;uses-permission&gt;</code>.</p>
<p>An <code>&lt;intent-filter&gt;</code> lists the implicit intents a screen accepts. The screen with <code>MAIN</code> and <code>LAUNCHER</code> is the one the app icon opens. Say Notes gets a third screen, <code>NewNoteActivity</code>, that makes a new note. A filter with <code>SEND</code>, <code>DEFAULT</code> and <code>mimeType="text/plain"</code> puts it in the share sheet, and the shared text arrives as an extra under the key <code>Intent.EXTRA_TEXT</code>. <code>android:exported="true"</code> lets other apps start a screen. An activity, service or receiver with a filter must say <code>true</code> or <code>false</code>, or an app that targets Android 12 or higher won’t build. Use <code>false</code> for screens only your app opens.</p>
<p>An app that targets Android 11 or higher can’t see the full list of other installed apps. Starting another app still works: call <code>startActivity</code> and catch <code>ActivityNotFoundException</code>. Only if you must know in advance, for example to hide a button, list what you look for in <code>&lt;queries&gt;</code>.</p>`,
        visual(el) {
          const mail = sheet => `<div class="ui-m-bar">Mail</div><div class="ui-m-body"><b>From Ada</b><span>Milk, bread, apples</span><div class="ui-m-line"></div><span class="ui-m-btn sh">Share</span></div>${sheet || ''}`;
          const sheet = apps => `<div class="ui-m-sheet"><b>Share with</b>${apps.map((a, i) => `<div class="ui-m-row${i === apps.length - 1 && a === 'Notes' ? ' nt' : ''}"><span class="ui-m-av"></span><div>${a}</div></div>`).join('')}</div>`;
          const newNote = '<div class="ui-m-bar">New note</div><div class="ui-m-body"><div class="ui-m-field on">Milk, bread, apples</div><span class="ui-m-btn">Save</span></div>';
          const home = '<div class="ui-m-body" style="grid-template-columns:repeat(3,1fr);align-content:center;justify-items:center"><span class="ui-m-av"></span><span class="ui-m-av"></span><span class="ui-m-av"></span><span class="ui-m-av"></span><b style="grid-column:span 3;font-size:0.72rem">Notes</b></div>';
          Lab.ui.phone(el, {
            logTitle: 'AndroidManifest.xml',
            predict: {
              q: 'You add a <code>SEND</code> intent filter to <code>NewNoteActivity</code> but forget <code>android:exported</code>. The app targets Android 14. What happens when you build?',
              options: ['The build fails and asks for an explicit <code>android:exported</code>', 'It builds, and Notes appears in the share sheet', 'It builds, but the app crashes on start'],
              a: 0,
              why: 'Since Android 12, a component with an intent filter must say whether other apps may start it.',
            },
            frames: [
              { screen: home, log: '&lt;activity android:name=".MainActivity" android:exported="true"&gt; + MAIN, LAUNCHER', say: 'The home screen shows the Notes icon because one screen has <code>MAIN</code> and <code>LAUNCHER</code> in its filter.' },
              { screen: mail(), tap: '.sh', say: 'In a mail app, Ada’s shopping list. The user taps Share.' },
              { screen: mail(sheet(['Messages'])), say: 'Notes is missing: its manifest says nothing about receiving text.' },
              { screen: mail(), log: ['&lt;activity android:name=".NewNoteActivity"&gt;', '  &lt;intent-filter&gt; SEND, DEFAULT, text/plain', 'Manifest merger failed : Apps targeting Android 12 and higher are required to specify an explicit value for android:exported when the corresponding component has an intent filter defined.'], say: 'Add a filter to <code>NewNoteActivity</code>, the screen that makes a new note. The build stops: a screen with a filter must say whether other apps may start it.' },
              { log: '&lt;activity android:name=".NewNoteActivity" android:exported="true"&gt;', say: 'Add <code>android:exported="true"</code>. Now the app builds.' },
              { screen: mail(sheet(['Messages', 'Notes'])), tap: '.nt', say: 'Share again. Android finds the filter, and Notes is in the list.' },
              { screen: newNote, log: 'NewNoteActivity: intent.getStringExtra(Intent.EXTRA_TEXT)  →  "Milk, bread, apples"', say: 'Android starts <code>NewNoteActivity</code> with the shared text as an extra.' },
            ],
          });
        },
        code: `<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.CAMERA" />

    <application android:label="@string/app_name">

        <!-- The screen the app icon opens -->
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Other apps can share text into this screen -->
        <activity android:name=".NewNoteActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="text/plain" />
            </intent-filter>
        </activity>

        <!-- Only this app opens it -->
        <activity android:name=".DetailActivity" android:exported="false" />
    </application>

    <!-- Only to check in advance which apps can open web links -->
    <queries>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="https" />
        </intent>
    </queries>
</manifest>`,
        remember: 'Every component is listed in the manifest. An intent-filter says which jobs a screen accepts, and a screen with a filter must set exported.',
        terms: [
          { term: 'component', def: 'A part of an app Android can start: an activity, service, receiver or provider. Each one is listed in the manifest.' },
          { term: 'intent filter', def: 'A list in the manifest of the implicit intents a component accepts, such as <code>SEND</code> with <code>text/plain</code>.' },
          { term: 'exported', def: '<code>android:exported="true"</code> lets other apps start the component; <code>"false"</code> keeps it for your app only.' },
          { term: 'share sheet', def: 'The list of apps Android shows when you tap Share. A screen appears in it when its intent filter accepts <code>SEND</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make this the screen the app icon opens.', code: `<activity android:name=".MainActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.[[MAIN]]" />
        <category android:name="android.intent.category.[[LAUNCHER]]" />
    </intent-filter>
</activity>`, why: '<code>MAIN</code> plus <code>LAUNCHER</code> puts the screen behind the app’s icon.' },
          { type: 'bug', prompt: 'The build fails: <code>android:exported</code> needs an explicit value. Tap the line that needs to change.', code: `<activity android:name=".NewNoteActivity">
    <intent-filter>
        <action android:name="android.intent.action.SEND" />
        <category android:name="android.intent.category.DEFAULT" />
        <data android:mimeType="text/plain" />
    </intent-filter>
</activity>`, bug: 0, fix: '<activity android:name=".NewNoteActivity" android:exported="true">', why: 'A screen with an intent filter must say whether other apps may start it. Other apps share into this one, so <code>true</code>.' },
        ],
        quiz: [
          { q: 'Which component does work without a screen, like playing music?', options: ['<code>&lt;service&gt;</code>', '<code>&lt;activity&gt;</code>', '<code>&lt;provider&gt;</code>'], a: 0, why: 'An activity is a screen, and a provider shares data with other apps. A service works without a screen.' },
          { q: 'What does <code>android:exported="false"</code> mean on an Activity?', options: ['Only your own app can start it', 'It can’t be started at all', 'It is hidden from the home screen only'], a: 0, why: 'Other apps can’t start it; your app still can.' },
          { q: 'Your app targets Android 14 and opens a web link with <code>startActivity</code>. Does it need <code>&lt;queries&gt;</code>?', options: ['No: starting another app works without it', 'Yes: without it the link never opens'], a: 0, why: '<code>&lt;queries&gt;</code> is only for checking in advance. Starting an app is not filtered; catch <code>ActivityNotFoundException</code>.' },
        ],
        docs: [['App manifest overview', 'https://developer.android.com/guide/topics/manifest/manifest-intro'], ['Package visibility', 'https://developer.android.com/training/package-visibility']],
      },

      {
        id: 'backstack',
        title: 'The back stack and tasks',
        tagline: 'Each new screen goes on top, and Back takes the top one off.',
        goals: ['Predict where Back goes after several screens', 'Close a screen from code with <code>finish()</code>', 'Use a launch mode to avoid two copies of one screen'],
        level: 'beginner',
        introduces: ['launchMode', 'standard', 'singleTop', 'singleTask', 'onNewIntent', 'setIntent'],
        body: `
<p>Notes gets a third screen, <code>EditActivity</code>, opened by an Edit button on the detail screen. The user goes from the list to a note’s details, then to Edit. Back should walk the same way in reverse: Edit, then the details, then the list. Android remembers the screens in order for you.</p>
<p>The screens the user opened for one job form a <em>task</em>, kept in a <em>back stack</em>: newest on top, like a pile of cards. <code>startActivity</code> puts a new Activity on top. Back takes the top one off and destroys it (<code>onDestroy</code> runs), and the one below comes back. <code>finish()</code> does the same from code, for example after Save. On the last screen, Back sends the app to the background (since Android 12), like the Home gesture.</p>
<p>By default, each <code>startActivity</code> creates a new Activity, even if the same screen is already on top. That is the <code>standard</code> <em>launch mode</em>, and tapping a link to a note twice can stack two copies. In the manifest, <code>android:launchMode="singleTop"</code> reuses the screen when it is already on top: no new copy, and the new Intent arrives in <code>onNewIntent(intent)</code> instead of <code>onCreate</code>. <code>singleTask</code> keeps only one copy and closes the screens above it. Most screens stay <code>standard</code>.</p>`,
        visual(el) {
          const list = '<div class="ui-m-bar">Notes</div><div class="ui-m-body"><div class="ui-m-row n1"><span class="ui-m-av"></span><div>Shopping</div></div><div class="ui-m-row"><span class="ui-m-av"></span><div>Trip to Oslo</div></div></div>';
          const note = '<div class="ui-m-bar">← Shopping</div><div class="ui-m-body"><b>Shopping</b><div class="ui-m-line"></div><div class="ui-m-line short"></div><span class="ui-m-btn ed">Edit</span></div>';
          const edit = '<div class="ui-m-bar">← Edit</div><div class="ui-m-body"><div class="ui-m-field on">Milk, bread, apples</div><span class="ui-m-btn sv">Save</span></div>';
          const home = '<div class="ui-m-center ui-m-muted">Home screen</div>';
          Lab.ui.phone(el, {
            logTitle: 'Back stack',
            predict: {
              q: 'The stack is List › Detail › Edit. The user taps Save, which calls <code>finish()</code>, then does Back once. What is on screen?',
              options: ['List', 'Detail', 'The home screen'],
              a: 0,
              why: '<code>finish()</code> takes Edit off, so Detail is on top. Back then takes Detail off, and List is left.',
            },
            frames: [
              { screen: list, log: 'stack: List', say: 'The app starts with one screen in its task.' },
              { tap: '.n1', log: 'startActivity(DetailActivity)', say: 'The user taps a note.' },
              { screen: note, tap: '.ed', log: ['stack: List › Detail', 'startActivity(EditActivity)'], say: 'Detail goes on top. List is still there, below it, stopped. Now the user taps Edit.' },
              { screen: edit, tap: '.sv', log: 'stack: List › Detail › Edit', say: 'Edit goes on top of Detail. The user taps Save.' },
              { screen: note, log: ['finish()  →  EditActivity.onDestroy()', 'stack: List › Detail'], say: 'Save calls <code>finish()</code>. Edit is taken off and destroyed, and Detail comes back.' },
              { screen: list, log: ['Back  →  DetailActivity.onDestroy()', 'stack: List'], say: 'Back takes Detail off. List resumes.' },
              { screen: home, log: ['Back on the last screen', '→ List goes to the background (not destroyed)'], say: 'Back on the last screen: since Android 12 the app goes to the background, like Home. Open it again and List is still there.' },
            ],
          });
        },
        code: `// EditActivity.kt: Save closes this screen, like Back
setContent {
    Button(onClick = {
        saveNote()
        finish()
    }) { Text("Save") }
}

// AndroidManifest.xml: reuse DetailActivity when it is already on top
// <activity android:name=".DetailActivity" android:launchMode="singleTop" />

class DetailActivity : ComponentActivity() {
    // onCreate as usual: reads intent.getStringExtra("title")

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)                                  // so intent is the new one
        val title = intent.getStringExtra("title") ?: ""
        setContent { Text(title) }                         // show the new note
    }
}`,
        remember: 'startActivity puts a screen on top; Back and finish() take it off. singleTop reuses the top screen through onNewIntent.',
        terms: [
          { term: 'task', def: 'The screens the user opened for one job, kept in order. The Recents screen shows tasks.' },
          { term: 'back stack', def: 'The order of the screens in a task, newest on top. Back takes the top one off.' },
          { term: 'finish()', def: 'Closes the Activity it is called on, like Back does. The screen below comes back.' },
          { term: 'launch mode', def: 'A manifest setting that says what <code>startActivity</code> does when the screen may already exist: <code>standard</code>, <code>singleTop</code>, <code>singleTask</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Close the screen after saving, and reuse DetailActivity when it is on top.', code: `saveNote()
[[finish]]()

<activity android:name=".DetailActivity" android:launchMode="[[singleTop]]" />`, why: '<code>finish()</code> takes this screen off the stack. <code>singleTop</code> reuses the top copy instead of making another.' },
          { type: 'bug', prompt: 'After Save, Back goes to Edit again, then to Detail, then to List. The stack has grown to List › Detail › Edit › Detail. Tap the line that needs to change.', code: `Button(onClick = {
    saveNote()
    startActivity(Intent(this, DetailActivity::class.java))
}) { Text("Save") }`, bug: 2, fix: '    finish()', why: '<code>startActivity</code> puts a new Detail on top. To go back to the Detail below, take Edit off with <code>finish()</code>.' },
        ],
        quiz: [
          { q: 'The stack is List › Detail. The user does Back. What happens to Detail?', options: ['It is taken off and destroyed; List comes back', 'It moves under List', 'It stays on top, paused'], a: 0, why: 'Back takes the top screen off and destroys it.' },
          { q: 'DetailActivity is <code>standard</code> and on top. The app starts DetailActivity again. What is the stack?', options: ['List › Detail › Detail', 'List › Detail', 'Detail'], a: 0, why: '<code>standard</code> always makes a new copy, even of the screen on top.' },
          { q: 'With <code>launchMode="singleTop"</code>, the same case: where does the new Intent arrive?', options: ['In <code>onNewIntent</code> of the Detail on top', 'In <code>onCreate</code> of a new Detail', 'Nowhere: it is dropped'], a: 0, why: '<code>singleTop</code> reuses the copy on top and hands it the new Intent.' },
        ],
        docs: [['Tasks and the back stack', 'https://developer.android.com/guide/components/activities/tasks-and-back-stack']],
      },

      {
        id: 'predictive-back',
        title: 'Predictive back',
        tagline: 'Show where Back leads before the user lets go, and step in only when you must.',
        goals: ['Describe what the predictive back gesture shows', 'Run your own code on Back with <code>addCallback</code>', 'Turn that code on only while it is needed'],
        level: 'beginner',
        introduces: ['OnBackPressedCallback', 'onBackPressedDispatcher', 'addCallback', 'enabled', 'isEnabled', 'onBackPressed'],
        body: `
<p>On phones with gesture navigation, the user swipes in from the edge of the screen to go back. With <em>predictive back</em>, while the finger is still down, the current screen shrinks and the screen behind it peeks out: the previous screen, or the home screen. The user sees where Back leads, and can still change their mind by sliding back. Phones on Android 16 and newer show this for apps that target Android 16, like yours. On older phones, Back works the same, without the preview.</p>
<p>To draw that preview, Android must know as the swipe starts whether your app will handle Back itself. So you can’t decide after the fact. The old way, overriding <code>onBackPressed()</code>, is replaced: for apps that target Android 16 and run on it, it isn’t called at all.</p>
<p>Instead you register a callback ahead of time: <code>onBackPressedDispatcher.addCallback(this, enabled = false) { ... }</code>. The first argument, <code>this</code> (the Activity), ties the callback to the screen, so it goes away when the screen is destroyed. It returns an <code>OnBackPressedCallback</code>. While its <code>isEnabled</code> is <code>true</code>, Back runs your lambda and there is no preview. While it is <code>false</code>, Android handles Back with the animation.</p>
<p>So turn it on only while Back must do something else. A note editor with unsaved text sets <code>isEnabled = true</code> and asks “Save or discard?”. After saving, it sets <code>isEnabled = false</code>, and Back works normally again.</p>`,
        visual(el) {
          const listHtml = '<div class="ui-m-bar">Notes</div><div class="ui-m-row"><span class="ui-m-av"></span><div>Shopping</div></div><div class="ui-m-row"><span class="ui-m-av"></span><div>Trip to Oslo</div></div>';
          const editHtml = (txt, extra = '') => `<div class="ui-m-bar">← New note</div><div class="ui-m-field${txt ? ' on' : ''}">${txt || 'Type a note'}</div><span class="ui-m-btn sv">Save</span>${extra}`;
          const layers = (top, cls = '', arrow = false) => `<div class="and-pb-layers"><div class="and-pb-under">${listHtml}</div><div class="and-pb-top ${cls}">${top}</div>${arrow ? '<span class="and-pb-arrow">‹</span>' : ''}</div>`;
          const list = `<div class="ui-m-bar">Notes</div><div class="ui-m-body"><div class="ui-m-row"><span class="ui-m-av"></span><div>Shopping</div></div><div class="ui-m-row"><span class="ui-m-av"></span><div>Trip to Oslo</div></div></div>`;
          Lab.ui.phone(el, {
            logTitle: 'keepDraft callback',
            predict: {
              q: 'The user has typed text, so <code>keepDraft.isEnabled</code> is <code>true</code>. They start the back swipe. What do they see?',
              options: ['No preview: when they let go, your lambda runs', 'The notes list peeks out behind the editor', 'The app closes at once'],
              a: 0,
              why: 'An enabled callback tells Android, before the swipe starts, that your app handles this Back. So there is nothing to preview.',
            },
            frames: [
              { screen: layers(editHtml('')), log: 'isEnabled = false   // nothing typed yet', say: 'An empty editor on top of the notes list. The callback is off.' },
              { screen: layers(editHtml(''), 'and-pb-peek'), log: 'swipe starts: no enabled callback', say: 'The user starts the back swipe. The editor shrinks and the list peeks out behind it.' },
              { screen: list, log: '→ Android: EditActivity finishes', say: 'They let go. Android plays the rest of the animation and closes the editor.' },
              { screen: layers(editHtml('Milk, bread')), log: 'onTextChanged()  →  isEnabled = true', say: 'Another editor, and this time the user types. The app turns the callback on.' },
              { screen: layers(editHtml('Milk, bread'), '', true), log: 'swipe starts: keepDraft is enabled', say: 'The back swipe now shows only the small arrow. Android knows your app will handle it, so no screen peeks out.' },
              { screen: layers(editHtml('Milk, bread', '<div class="ui-m-snack">Save or discard your note first</div>')), log: 'keepDraft runs  →  askSaveOrDiscard()', say: 'They let go, and your lambda runs instead of closing the screen.' },
              { screen: layers(editHtml('Milk, bread')), tap: '.sv', log: 'onSaved()  →  isEnabled = false', say: 'The user taps Save. The app turns the callback off.' },
              { screen: layers(editHtml('Milk, bread'), 'and-pb-peek'), log: 'swipe starts: no enabled callback', say: 'With nothing to lose, the next swipe shows the list behind the editor again.' },
            ],
          });
        },
        code: `class EditActivity : ComponentActivity() {
    private lateinit var keepDraft: OnBackPressedCallback

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Off at first: Back closes the screen, with the preview
        keepDraft = onBackPressedDispatcher.addCallback(this, enabled = false) {
            askSaveOrDiscard()            // runs instead of closing the screen
        }
        setContent { Text("New note") }
    }

    // call this when the user types (text fields come in the compose track)
    fun onTextChanged() {
        keepDraft.isEnabled = true        // unsaved text: this app handles Back
    }

    // call this after the note is saved
    fun onSaved() {
        keepDraft.isEnabled = false       // nothing to lose: Android handles Back
    }

    private fun askSaveOrDiscard() {
        Toast.makeText(this, "Save or discard your note first", Toast.LENGTH_SHORT).show()
    }
}`,
        remember: 'Register a back callback in advance and keep it enabled only while Back must do something else; otherwise Android shows the preview.',
        mistakes: [
          { title: 'A callback that is always on', bad: `keepDraft = onBackPressedDispatcher.addCallback(this) {
    finish()          // enabled from the start, just to close the screen
}`, good: `keepDraft = onBackPressedDispatcher.addCallback(this, enabled = false) {
    askSaveOrDiscard()
}`, why: '<code>enabled</code> is <code>true</code> unless you say otherwise. An always-on callback blocks the preview on every swipe, even when there is nothing to protect.' },
        ],
        terms: [
          { term: 'predictive back', def: 'The back gesture that shows, while the finger is still down, the screen Back will lead to.' },
          { term: 'OnBackPressedCallback', def: 'Code you register to run on Back. It runs only while its <code>isEnabled</code> is <code>true</code>.' },
          { term: 'onBackPressedDispatcher', def: 'The Activity’s list of back callbacks. <code>addCallback</code> adds one.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Register a callback that starts off, and turn it off after saving.', code: `keepDraft = onBackPressedDispatcher.[[addCallback]](this, enabled = false) {
    askSaveOrDiscard()
}

fun onSaved() {
    keepDraft.[[isEnabled]] = false
}`, why: '<code>addCallback</code> registers the code. Setting <code>isEnabled</code> to <code>false</code> hands Back to Android again.' },
          { type: 'bug', prompt: 'On this screen the back swipe never shows a preview, even before the user types anything. Tap the line that needs to change.', code: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    keepDraft = onBackPressedDispatcher.addCallback(this, enabled = true) {
        askSaveOrDiscard()
    }
    setContent { Text("New note") }
}`, bug: 2, fix: '    keepDraft = onBackPressedDispatcher.addCallback(this, enabled = false) {', why: 'The callback is on from the start, so Android never shows the preview. Start it off and turn it on when there is unsaved text.' },
        ],
        quiz: [
          { q: 'Why can’t predictive back work with code that decides after Back happens?', options: ['Android must know when the swipe starts whether your app handles Back', 'The animation is too fast for Kotlin', 'Back is only for the home screen'], a: 0, why: 'The preview is drawn during the swipe, so the answer is needed before the user lets go.' },
          { q: 'No back callback is enabled. The user swipes back on the second screen. What happens?', options: ['The previous screen peeks out, and letting go closes this one', 'Nothing: Back needs a callback', 'The app closes'], a: 0, why: 'With no enabled callback, Android handles Back and shows the preview.' },
          { q: 'Your app targets Android 16 and overrides <code>onBackPressed()</code>. On an Android 16 phone, is it called?', options: ['No', 'Yes, as before', 'Only on tablets'], a: 0, why: 'For apps that target Android 16 and run on it, <code>onBackPressed()</code> is not called. Use a callback.' },
        ],
        docs: [['Predictive back gesture', 'https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture'], ['Custom back navigation', 'https://developer.android.com/guide/navigation/custom-back']],
      },
    ],
  });
})();
