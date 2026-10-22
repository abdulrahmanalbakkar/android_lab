/* Launch and grow track. Same shape as tracks/kotlin.js.
   What happens once Recipes is on Google Play: crash reports, analytics events, feature flags, in-app updates and
   reviews, Play Billing and the Play policies that decide whether an update is accepted.
   Version- and policy-specific facts were checked against developer.android.com, firebase.google.com and
   support.google.com/googleplay/android-developer in October 2026.
   Demos use the visual kit (Lab.ui). `board` is a Lab.ui.player with a custom stage; every class here starts with al-. */
(() => {
  const { h } = Lab;

  // A step player whose stage is redrawn from the current frame by draw(stage, frame).
  const board = (el, { frames, predict, draw }) => {
    const stage = h('div', { class: 'ui-stage al-board' });
    return Lab.ui.player(el, { frames, predict, stage, draw: f => { stage.replaceChildren(); draw(stage, f); } });
  };

  const css = `
.al-board { display: grid; gap: 12px; min-width: 0; }
.al-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.al-note { font-size: 0.86rem; color: var(--muted); line-height: 1.45; overflow-wrap: anywhere; }
.al-q { font-weight: 700; overflow-wrap: anywhere; }

/* analytics: event rows with a bar each */
.al-rows { display: grid; gap: 8px; min-width: 0; }
.al-row { display: grid; gap: 3px; min-width: 0; }
.al-row-head { display: flex; justify-content: space-between; gap: 8px; font: 600 0.8rem var(--mono); min-width: 0; }
.al-row-head span { overflow-wrap: anywhere; min-width: 0; }
.al-row-head b { font-variant-numeric: tabular-nums; flex: none; }
.al-bar { height: 22px; border-radius: 7px; background: var(--accent); min-width: 3px; transition: width 0.6s cubic-bezier(0.3, 1.1, 0.5, 1); }
.al-bar.al-err { background: var(--err); }
.al-bar.al-muted { background: var(--muted); opacity: 0.55; }
.al-bar.al-ok { background: var(--ok); }

/* flags: three layers of Remote Config values */
.al-cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; min-width: 0; }
.al-col { display: grid; gap: 4px; padding: 8px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; text-align: center; }
.al-col b { font: 700 0.9rem var(--mono); overflow-wrap: anywhere; }
.al-col small { font-size: 0.72rem; color: var(--muted); overflow-wrap: anywhere; }
.al-col.al-hit { border-color: var(--accent); background: var(--accent-soft); }
.al-read { font: 600 0.82rem var(--mono); padding: 8px 10px; border-radius: 10px; background: var(--code-bg); color: var(--code-ink); overflow-wrap: anywhere; }
.al-read b { color: var(--t-k); }

/* review: stars on the mock rating card */
.al-stars { font-size: 1.25rem; letter-spacing: 4px; color: var(--warm); }

/* policy: a checklist */
.al-checks { display: grid; gap: 6px; min-width: 0; }
.al-check { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 8px; align-items: start; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font-size: 0.84rem; min-width: 0; }
.al-check span { overflow-wrap: anywhere; min-width: 0; }
.al-check i { font-style: normal; font-weight: 700; }
.al-check.al-ok { border-color: var(--ok); }
.al-check.al-ok i { color: var(--ok); }
.al-check.al-bad { border-color: var(--err); background: var(--err-soft); }
.al-check.al-bad i { color: var(--err); }
.al-check.al-wait { border-style: dashed; color: var(--muted); }
`;

  Lab.addTrack({
    id: 'launch',
    title: 'Launch and grow',
    description: 'Keep Recipes healthy once it is on Google Play: crash reports, analytics events, feature flags, in-app updates and reviews, payments with Play Billing, and the Play policies every update must meet.',
    group: 'Shipping', requires: ['build'],
    css,
    lessons: [
      {
        id: 'crashes',
        title: 'Crash reporting',
        tagline: 'Find out why the app crashed on a phone you will never hold.',
        goals: ['Add Firebase Crashlytics to Recipes and read a crash report', 'Add log lines, keys and caught errors to the reports', 'Explain the crash rates Google Play watches in Android vitals'],
        level: 'intermediate', introduces: ['Firebase', 'crashlytics', 'recordException', 'setCustomKey'],
        body: `
<p>Recipes 1.5.0 is on Google Play. Two days later a review says: “Closes every time I open Bean stew.” On your phone it works. Ada’s phone has no Logcat you can read and no debugger you can attach. A <em>crash reporter</em> collects the stack trace on your users’ phones and sends it to you. Firebase has one, <b>Crashlytics</b>, and Recipes already uses Firebase for FCM.</p>
<p>Setup is all Gradle. Next to the <code>google-services</code> plugin, add the Crashlytics plugin <code>com.google.firebase.crashlytics</code>, version 3.0.8, and the <code>firebase-crashlytics</code> library under the Firebase BoM. Crashes need no code: when nothing catches an exception, Crashlytics writes a report to the phone’s storage, the app closes as it would anyway, and the report is sent the next time the app starts. R8 renamed the release build’s code to short names like <code>a.b</code>, so the plugin uploads each release build’s <code>mapping.txt</code>, and the report shows your real class names and line numbers.</p>
<p>A few calls add context. <code>Firebase.crashlytics.log("...")</code> adds a line to the report’s logs (Crashlytics keeps the last 64 kB). <code>setCustomKey("recipe_id", 42)</code> records a value, up to 64 keys. <code>recordException(e)</code> reports an exception you caught: a <em>non-fatal</em>. The app keeps running, and the report goes out at the next start. If you also add the Firebase Analytics library, Crashlytics adds <em>breadcrumbs</em> by itself: the Analytics events recorded just before the crash. Reports leave the phone and your whole team reads them, so never put an email or a name in them.</p>
<p>Google Play counts crashes too, in <b>Android vitals</b> in Play Console. The <em>user-perceived crash rate</em> is the share of daily users who had a crash while the app showed a screen or ran a foreground service. Vitals also shows a plain crash rate, which counts every crash, even with no screen open. Play’s limits are called <em>bad behaviour thresholds</em>: a user-perceived crash rate of 1.09% or more over the last 28 days, 0.47% or more for ANRs, or 8% or more on any one phone model. Over one of them, Play may show Recipes to fewer people and put a warning on its store page.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'build', label: 'Release build', sub: 'R8 + mapping.txt' },
              { id: 'phone', label: 'Ada’s phone', sub: 'Recipes 1.5.0' },
              { id: 'cl', label: 'Crashlytics', sub: 'Firebase console' },
              { id: 'you', label: 'You', sub: 'reading the issue' },
            ],
            predict: {
              q: 'Recipes crashes on Ada’s phone. When does the report reach Crashlytics?',
              options: ['The next time Ada opens Recipes', 'At the moment of the crash', 'When Ada updates the app'],
              a: 0,
              why: 'A crashing app is a bad place for a network call. The report is saved on the phone and sent at the next start.',
            },
            frames: [
              { at: 'build', packet: 'mapping.txt', say: 'You build Recipes 1.5.0 for release. R8 renames the code to short names, and writes <code>mapping.txt</code> with every old and new name.' },
              { at: 'cl', packet: 'mapping.txt', say: 'The Crashlytics plugin uploads that <code>mapping.txt</code> as part of the build. You don’t do anything.' },
              { at: 'phone', packet: 'crash', tone: 'err', say: 'Days later, Ada opens Bean stew and Recipes closes. Nothing caught the exception.' },
              { at: 'phone', packet: 'report saved', tone: 'warm', mark: { phone: 'warm' }, say: 'Before the app closes, Crashlytics writes the stack trace, your log lines and keys to the phone’s storage. Nothing is sent yet.' },
              { at: 'cl', packet: 'report', say: 'The next morning Ada opens Recipes again. Now Crashlytics sends the saved report.' },
              { at: 'cl', packet: 'a.b.c → RecipeDetailViewModel', tone: 'ok', mark: { cl: 'ok' }, say: 'With the mapping file, <code>a.b.c.a</code> becomes <code>RecipeDetailViewModel.kt</code>, line 42.' },
              { at: 'you', packet: '1 issue · 37 users', tone: 'ok', mark: { you: 'ok' }, say: 'Reports with the same cause are grouped into one issue: <code>NoSuchElementException: List is empty.</code>, 37 users, all on 1.5.0. Now you know which line to fix.' },
            ],
          });
        },
        code: `// build.gradle.kts of the project, next to google-services:
// plugins {
//     id("com.google.gms.google-services") version "4.5.0" apply false
//     id("com.google.firebase.crashlytics") version "3.0.8" apply false
// }
// app/build.gradle.kts:
// plugins {
//     id("com.google.gms.google-services")
//     id("com.google.firebase.crashlytics")       // also uploads mapping.txt of release builds
// }
// dependencies {
//     implementation(platform("com.google.firebase:firebase-bom:35.0.2"))
//     implementation("com.google.firebase:firebase-crashlytics")
//     implementation("com.google.firebase:firebase-analytics")   // lets Crashlytics add breadcrumbs
// }

// RecipesViewModel: context for the next report, and the errors you catch
fun refresh(force: Boolean) {
    Firebase.crashlytics.log("refresh, force = $force")       // a line in the report's logs
    Firebase.crashlytics.setCustomKey("recipes", _uiState.value.recipes.size)
    viewModelScope.launch {
        try {
            repository.refresh(force)
        } catch (e: IOException) {
            // offline is expected: no report, the screen says so
            _uiState.value = _uiState.value.copy(note = "Offline: showing saved recipes")
        } catch (e: HttpException) {
            Firebase.crashlytics.recordException(e)            // a non-fatal: reported, app keeps running
            _uiState.value = _uiState.value.copy(note = "The server had a problem. Try again later.")
        }
    }
}`,
        remember: 'Crashlytics sends the stack trace at the next start, with real names thanks to the uploaded mapping.txt; Play judges you on user-perceived crashes and ANRs.',
        mistakes: [
          {
            title: 'Personal data in a report',
            bad: `Firebase.crashlytics.setCustomKey("email", "ada@example.com")`,
            good: `Firebase.crashlytics.setCustomKey("recipe_id", 42)`,
            why: 'Reports leave the phone and everyone on your team can read them. Record the state of the app, never who the user is.',
          },
        ],
        terms: [
          { term: 'Crashlytics', def: 'Firebase’s crash reporter. It saves a report when the app crashes and sends it at the next start.' },
          { term: 'non-fatal', def: 'An exception your code caught and reported with <code>recordException(e)</code>. The app kept running.' },
          { term: 'Android vitals', def: 'Play Console’s numbers for crashes, ANRs and more, from your users’ phones. Play uses them to rate your app’s quality.' },
          { term: 'user-perceived crash rate', def: 'The share of daily users who had a crash while the app showed a screen or ran a foreground service.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add a line to the report’s logs, then report the server error you caught, without crashing.', code: `Firebase.crashlytics.[[log]]("refresh, force = $force")
try {
    repository.refresh(force)
} catch (e: HttpException) {
    Firebase.crashlytics.[[recordException]](e)
}`, why: '<code>log</code> adds a line to the next report. <code>recordException</code> sends a non-fatal with the stack trace of the exception you caught.' },
          { type: 'bug', prompt: 'Server errors during a refresh never show up in Crashlytics. Tap the line to change.', code: `viewModelScope.launch {
    try {
        repository.refresh(force)
    } catch (e: HttpException) {
        // ignore it
    }
}`, bug: 4, fix: '        Firebase.crashlytics.recordException(e)', why: 'A caught exception is gone unless you report it. <code>recordException(e)</code> turns it into a non-fatal you can count and fix.' },
        ],
        quiz: [
          { q: 'Crashes from the release build would show names like <code>a.b.c</code>. What turns them back into your class names?', options: ['The <code>mapping.txt</code> the Crashlytics plugin uploads with each release build', 'Installing a debug build on every phone', 'Nothing: renamed code can’t be read'], a: 0, why: '<code>mapping.txt</code> lists every old and new name. Crashlytics uses the one uploaded for that build.' },
          { q: 'A WorkManager worker crashes while no screen is open and no foreground service runs. Does that count in the user-perceived crash rate?', options: ['No, but it counts in the plain crash rate', 'Yes, every crash counts there', 'Only if the user sees a dialog'], a: 0, why: 'User-perceived means the app showed a screen or ran a foreground service. Crashlytics still reports it, so fix it anyway.' },
          { q: 'Overall, 0.6% of daily users see a crash, but one phone model is at 10%. Does Play care?', options: ['Yes: one phone model at 8% or more is over a bad behaviour threshold too', 'No: 0.6% is under 1.09%', 'Only if that phone is new'], a: 0, why: 'Android vitals has an overall threshold and a per phone model threshold. Play can act on either.' },
        ],
        docs: [['Get started with Firebase Crashlytics', 'https://firebase.google.com/docs/crashlytics/android/get-started'], ['Android vitals', 'https://developer.android.com/topic/performance/vitals']],
      },

      {
        id: 'analytics',
        title: 'Analytics',
        tagline: 'Log what people do in the app, so a question can be answered with numbers.',
        goals: ['Log an event with parameters using logEvent', 'Put changing details in parameters, not in event names', 'Keep personal data out, and wait for consent when needed'],
        level: 'intermediate', introduces: ['analytics', 'logEvent', 'param', 'FirebaseAnalytics', 'SELECT_CONTENT', 'CONTENT_TYPE', 'ITEM_ID', 'setAnalyticsCollectionEnabled'],
        body: `
<p>Recipes 1.6.0 adds a Start timer button on every step that has a time, next to the one at the top of the recipe. Does anyone use them? Crashlytics tells you what broke, not what people do. <b>Google Analytics for Firebase</b> counts what people do: each time someone does something you care about, the app logs an <em>event</em>, and the Firebase console adds them up over all users. The <code>firebase-analytics</code> library is already in the app, for Crashlytics’ breadcrumbs.</p>
<p><code>Firebase.analytics.logEvent("timer_start") { param("source", "step") }</code> logs one event. Its name says what the person did; its <em>parameters</em>, keys and values, carry the details. Firebase suggests names for common actions in <code>FirebaseAnalytics.Event</code>, such as <code>SELECT_CONTENT</code> for “opened something”, and keys in <code>FirebaseAnalytics.Param</code>, such as <code>CONTENT_TYPE</code> and <code>ITEM_ID</code>. Your own events get names like <code>timer_start</code>. To see a parameter of your own, like <code>source</code>, in reports, register it once as a <em>custom dimension</em> in the Firebase console.</p>
<p>Two rules keep the numbers useful. Details that change go in parameters: <code>"timer_start_" + recipe.id</code> makes a new event name for every recipe, the taps are scattered over dozens of names, and an app can only log 500 different names. And names are case-sensitive: <code>timer_start</code> and <code>Timer_start</code> are two events. So log every event from one class, <code>RecipeAnalytics</code>.</p>
<p>Events leave the phone. Never log emails or names, and declare what you collect in the Data safety form. Where the law or your privacy promise says users must agree first, switch collection off in the manifest with the <code>firebase_analytics_collection_enabled</code> setting, and call <code>Firebase.analytics.setAnalyticsCollectionEnabled(true)</code> after Ada says yes. Crashlytics works the same way, with <code>firebase_crashlytics_collection_enabled</code> and <code>setCrashlyticsCollectionEnabled(true)</code>.</p>`,
        visual(el) {
          const max = 1000;
          board(el, {
            predict: {
              q: 'The app logs <code>"timer_start_" + recipe.id</code>. What does the console show?',
              options: ['A different event for every recipe, each with a few taps', 'One <code>timer_start</code> event with all the taps', 'An error: names can’t contain numbers'],
              a: 0,
              why: 'Every distinct name is its own event. The recipe id belongs in a parameter, so all the taps stay in one event.',
            },
            draw(stage, f) {
              stage.append(h('span', { class: 'al-label' }, 'Question'), h('div', { class: 'al-q' }, 'Do people who open a recipe start a timer?'),
                h('span', { class: 'al-label' }, 'Events in the console, yesterday'),
                h('div', { class: 'al-rows' }, f.rows.map(([name, n, tone]) => h('div', { class: 'al-row' },
                  h('div', { class: 'al-row-head' }, h('span', {}, name), h('b', {}, n.toLocaleString('en-US'))),
                  h('div', { class: `al-bar ${tone ? 'al-' + tone : ''}`, style: `width:${Math.max(1, (n / max) * 100)}%` })))));
            },
            frames: [
              { rows: [], say: 'The question comes first. Which events would answer it?' },
              { rows: [['select_content · content_type = recipe', 1000]], say: 'Every time someone opens a recipe, the app logs <code>select_content</code> with <code>content_type</code> = <code>recipe</code>. Yesterday: 1,000.' },
              { rows: [['select_content · content_type = recipe', 1000], ['timer_start', 140]], say: 'Every tap on a Start timer button logs <code>timer_start</code>: 140 taps for 1,000 opened recipes.' },
              { rows: [['select_content · content_type = recipe', 1000], ['timer_start · source = top', 25, 'ok'], ['timer_start · source = step', 115, 'ok']], say: 'With <code>source</code> registered as a custom dimension, a report splits the same 140 taps: most come from the buttons on the steps, few from the top.' },
              { rows: [['timer_start_12', 4, 'muted'], ['timer_start_31', 3, 'muted'], ['timer_start_7', 3, 'muted'], ['timer_start_58', 2, 'muted'], ['… 76 more names', 128, 'err']], say: 'The other way: the recipe id inside the name. 80 recipes make 80 event names, and the 140 taps are scattered over all of them.' },
              { rows: [['timer_start · item_id = 12', 4, 'ok'], ['timer_start · item_id = 31', 3, 'ok'], ['timer_start (all)', 140]], say: 'With the id in <code>ITEM_ID</code>, there is one <code>timer_start</code> with all 140 taps. The recipe is a detail on each tap, not a new name.' },
            ],
          });
        },
        code: `// One class logs every event, so the names never drift
@Singleton
class RecipeAnalytics @Inject constructor() {
    private val analytics = Firebase.analytics

    fun recipeOpened(recipe: Recipe) {
        analytics.logEvent(FirebaseAnalytics.Event.SELECT_CONTENT) {
            param(FirebaseAnalytics.Param.CONTENT_TYPE, "recipe")
            param(FirebaseAnalytics.Param.ITEM_ID, recipe.id.toString())
        }
    }

    fun timerStarted(recipe: Recipe, source: String) {       // source: "top" or "step"
        analytics.logEvent("timer_start") {
            param(FirebaseAnalytics.Param.ITEM_ID, recipe.id.toString())
            param("source", source)
        }
    }
}

// AndroidManifest.xml, inside <application>: collect nothing until Ada agrees
// <meta-data android:name="firebase_analytics_collection_enabled" android:value="false" />

// After she says yes on your consent screen:
Firebase.analytics.setAnalyticsCollectionEnabled(true)

// Terminal: watch the events in Logcat while you test
// (setprop turns on Firebase's detailed Logcat lines)
// adb shell setprop log.tag.FA VERBOSE
// adb shell setprop log.tag.FA-SVC VERBOSE
// adb logcat -v time -s FA FA-SVC`,
        remember: 'An event name says what the person did; the details that change go in parameters.',
        mistakes: [
          {
            title: 'Logging who, instead of what',
            bad: `analytics.logEvent("timer_start") {
    param("user", "ada@example.com")
}`,
            good: `analytics.logEvent("timer_start") {
    param("source", "step")
}`,
            why: 'Analytics is for what people do, not who they are. An email in an event is personal data sent off the phone.',
          },
        ],
        terms: [
          { term: 'event', def: 'One thing a person did in the app, with a name and parameters, logged with <code>logEvent</code>.' },
          { term: 'parameter', def: 'A key and a value on an event, such as <code>source</code> = <code>step</code>. Once a parameter of your own is registered as a custom dimension, reports can split an event by it.' },
          { term: 'Google Analytics for Firebase', def: 'Firebase’s analytics: it collects the events from every phone and adds them up in the console.' },
          { term: 'consent', def: 'The user’s yes to collecting data. Where it is needed, collect nothing until you have it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Log a timer start, with where the tap came from as a parameter.', code: `analytics.[[logEvent]]("timer_start") {
    [[param]]("source", "step")
}`, why: '<code>logEvent</code> takes the event name, and each <code>param</code> inside the braces adds a key and a value.' },
          { type: 'bug', prompt: 'A month later the console shows dozens of timer events with a few taps each. Tap the line responsible.', code: `fun timerStarted(recipe: Recipe) {
    analytics.logEvent("timer_start_" + recipe.id) {
        param(FirebaseAnalytics.Param.ITEM_ID, recipe.id.toString())
    }
}`, bug: 1, fix: '    analytics.logEvent("timer_start") {', why: 'Each recipe id made a new event name. The id is already in <code>ITEM_ID</code>, so one <code>timer_start</code> name is enough.' },
        ],
        quiz: [
          { q: 'You want to know where timer taps come from. Where does <code>"step"</code> go?', options: ['In a parameter: <code>source</code> = <code>step</code>', 'In the name: <code>timer_start_step</code>', 'In Crashlytics'], a: 0, why: 'One event name with a parameter, registered as a custom dimension, can be split by it in reports.' },
          { q: 'The recipe screen logs <code>timer_start</code> and the step screen logs <code>Timer_start</code>. What does the console show?', options: ['Two different events', 'One event: names are lowercased', 'An error'], a: 0, why: 'Event names are case-sensitive. Logging every event from one class keeps the spelling the same.' },
          { q: 'Users must agree before Recipes collects analytics. Where do you switch collection off until then?', options: ['In AndroidManifest.xml, with the <code>firebase_analytics_collection_enabled</code> setting', 'In Play Console', 'Nowhere: Analytics asks the user itself'], a: 0, why: 'The manifest setting stops collection from the very first start. <code>setAnalyticsCollectionEnabled(true)</code> turns it on after the yes.' },
        ],
        docs: [['Log events', 'https://firebase.google.com/docs/analytics/android/events'], ['Configure Analytics data collection', 'https://firebase.google.com/docs/analytics/android/configure-data-collection']],
      },

      {
        id: 'flags',
        title: 'Feature flags',
        tagline: 'Ship new code switched off, then switch it on from a server: for some users, all, or none.',
        goals: ['Explain what a feature flag and a kill switch are', 'Read a flag from Firebase Remote Config, with a safe default', 'Say when a value from the server takes effect'],
        level: 'intermediate', introduces: ['remoteConfig', 'remoteConfigSettings', 'minimumFetchIntervalInSeconds', 'setConfigSettingsAsync', 'setDefaultsAsync', 'fetchAndActivate', 'getBoolean', 'addOnCompleteListener', 'isSuccessful'],
        body: `
<p>Cook mode is ready: big text, one step at a time, for a phone propped up next to the stove. But a release takes days to reach users, and it can’t be taken back: if Cook mode crashes on some phones, they wait for the next version. A <em>feature flag</em> separates shipping from switching on. The Cook mode code ships inside Recipes 1.7.0, behind <code>if (flags.cookMode())</code>, and a value on a server decides. If it misbehaves, you set the value to false: a <em>kill switch</em>, with no new release.</p>
<p><b>Firebase Remote Config</b> holds such values. In the Firebase console you add a parameter, <code>cook_mode</code>, and set it to true for everyone, or only under a condition, such as 10% of users. In the app, <code>Firebase.remoteConfig</code> gives you Remote Config, and <code>getBoolean("cook_mode")</code> reads the value. Give every parameter a default in the app with <code>setDefaultsAsync(mapOf("cook_mode" to false))</code>: until the first download is activated, for example on a first start without network, the app has nothing from the server.</p>
<p>New values arrive with <code>fetchAndActivate()</code>: it downloads them (fetch) and makes them the ones <code>getBoolean</code> returns (activate). That takes a moment, so it returns a <code>Task</code>: Google’s object for an answer that comes later. <code>addOnCompleteListener { task -> }</code> runs your lambda when it is done, and <code>task.isSuccessful</code> says whether it worked. The app doesn’t download every time: by default it waits 12 hours after the last download, the <em>minimum fetch interval</em>. <code>remoteConfigSettings { minimumFetchIntervalInSeconds = 3600 }</code>, passed to <code>setConfigSettingsAsync</code>, makes it one hour. Much shorter, and the server stops answering the app for a while (<em>throttling</em>), so keep 0 for debug builds.</p>`,
        visual(el) {
          board(el, {
            predict: {
              q: 'Ada’s phone has <code>cook_mode = true</code>. You set it to false in the console. When does her phone switch?',
              options: ['At its next download, once the minimum fetch interval has passed', 'Right away', 'Only after she updates the app'],
              a: 0,
              why: 'The phone only learns about the change when it downloads again, and it waits for the minimum fetch interval first.',
            },
            draw(stage, f) {
              const col = (name, v, hit) => h('div', { class: `al-col${hit ? ' al-hit' : ''}` }, h('small', {}, name), h('b', {}, v));
              stage.append(
                h('span', { class: 'al-label' }, 'Firebase console'), h('div', { class: 'al-read' }, f.console),
                h('span', { class: 'al-label' }, 'On Ada’s phone'),
                h('div', { class: 'al-cols' }, col('in-app default', 'false', f.from === 'default'), col('last download', f.fetched, false), col('active', f.active, f.from === 'active')),
                h('div', { class: 'al-read', html: `getBoolean("cook_mode") → <b>${f.from === 'default' ? 'false' : f.active}</b>` }),
                h('div', { class: 'al-note' }, f.screen));
            },
            frames: [
              { console: 'cook_mode: not created yet', fetched: '–', active: '–', from: 'default', screen: 'Recipe screen: no Cook mode button', say: 'Ada installs Recipes 1.7.0 on the train, with no signal. Nothing came from the server, so the in-app default answers: false.' },
              { console: 'cook_mode = true for 10% of users', fetched: '–', active: '–', from: 'default', screen: 'Recipe screen: no Cook mode button', say: 'You turn <code>cook_mode</code> on in the console for 10% of users. Ada is in that 10%, but her phone doesn’t know yet.' },
              { console: 'cook_mode = true for 10% of users', fetched: 'true', active: 'true', from: 'active', screen: 'Recipe screen: Cook mode button', say: 'At home, on Wi-Fi, <code>fetchAndActivate()</code> downloads <code>true</code> and activates it. The next recipe Ada opens has a Cook mode button.' },
              { console: 'cook_mode = false (kill switch)', fetched: 'true', active: 'true', from: 'active', screen: 'Recipe screen: Cook mode button', say: 'Crashlytics shows Cook mode crashing on some phones. You set the flag to false in the console. No new release.' },
              { console: 'cook_mode = false (kill switch)', fetched: 'true', active: 'true', from: 'active', screen: 'Recipe screen: Cook mode button', say: 'Twenty minutes later Ada opens Recipes. The last download was less than an hour ago, so <code>fetchAndActivate()</code> doesn’t download. Still true for her.' },
              { console: 'cook_mode = false (kill switch)', fetched: 'false', active: 'false', from: 'active', screen: 'Recipe screen: no Cook mode button', say: 'After the hour, the next start downloads <code>false</code>. Cook mode is gone, on every phone as it downloads, and you fix it calmly.' },
            ],
          });
        },
        code: `// app/build.gradle.kts, under the same Firebase BoM:
// implementation("com.google.firebase:firebase-config")

@Singleton
class Flags @Inject constructor() {
    private val config = Firebase.remoteConfig

    init {
        config.setConfigSettingsAsync(remoteConfigSettings {
            minimumFetchIntervalInSeconds = if (BuildConfig.DEBUG) 0 else 3600   // at most once an hour
        })
        config.setDefaultsAsync(mapOf("cook_mode" to false))   // used until a download is activated
    }

    fun cookMode(): Boolean = config.getBoolean("cook_mode")

    // RecipesApp.onCreate calls this at every start
    fun refresh() {
        config.fetchAndActivate().addOnCompleteListener { task ->
            if (task.isSuccessful) {
                Log.d("Flags", "cook_mode = \${cookMode()}")
            } else {
                Log.d("Flags", "No download: keeping the active values")
            }
        }
    }
}

// The recipe screen reads the flag when it is drawn
if (flags.cookMode()) {
    Button(onClick = onCookMode) { Text("Cook mode") }
}`,
        remember: 'Every flag has an in-app default; a change on the server reaches a phone at its next download and activate.',
        mistakes: [
          {
            title: 'Downloading on every start in the release build',
            bad: `remoteConfigSettings {
    minimumFetchIntervalInSeconds = 0
}`,
            good: `remoteConfigSettings {
    minimumFetchIntervalInSeconds = if (BuildConfig.DEBUG) 0 else 3600
}`,
            why: 'A very short interval is for testing. With thousands of users, frequent downloads make the server stop answering the app for a while (throttling), and then no new values arrive at all.',
          },
        ],
        terms: [
          { term: 'feature flag', def: 'A value read while the app runs that switches a piece of shipped code on or off.' },
          { term: 'kill switch', def: 'A flag you set to false on the server to turn off a broken feature without a new release.' },
          { term: 'Remote Config', def: 'Firebase’s service for values the app reads from the server, with defaults in the app.' },
          { term: 'Task', def: 'Google’s object for an answer that comes later. <code>addOnCompleteListener</code> runs your code when it is done.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give Cook mode a safe default, then download and activate new values.', code: `config.setDefaultsAsync(mapOf("cook_mode" to [[false]]))
config.[[fetchAndActivate]]().addOnCompleteListener { task ->
    if (task.[[isSuccessful]]) {
        Log.d("Flags", "new values are active")
    }
}`, why: 'Off until the server says otherwise. <code>fetchAndActivate</code> downloads and activates in one call, and the <code>Task</code> tells you whether it worked.' },
          { type: 'bug', prompt: 'The console says <code>cook_mode</code> = true for everyone and the download works, but Cook mode never shows. Tap the line.', code: `init {
    config.setDefaultsAsync(mapOf("cook_mode" to false))
}

fun cookMode(): Boolean = config.getBoolean("cookMode")`, bug: 4, fix: 'fun cookMode(): Boolean = config.getBoolean("cook_mode")', why: 'The key must match the console exactly. For a key it doesn’t know, <code>getBoolean</code> returns false.' },
        ],
        quiz: [
          { q: 'Cook mode, behind a flag, crashes for many users. What is the fastest safe fix?', options: ['Set <code>cook_mode</code> to false in the console', 'Publish a new release', 'Ask users to reinstall'], a: 0, why: 'The kill switch turns the code off on each phone at its next download. A release takes days to reach everyone.' },
          { q: 'Without your own setting, how long does Remote Config wait between downloads?', options: ['12 hours', '1 minute', '1 week'], a: 0, why: 'The default minimum fetch interval is 12 hours. Recipes sets one hour.' },
          { q: 'Why does every parameter need a default in the app?', options: ['Until the first download is activated, such as on a first start offline, there is nothing from the server', 'Remote Config won’t download without one', 'Defaults make downloads faster'], a: 0, why: 'Until a download is activated, <code>getBoolean</code> answers with the in-app default.' },
        ],
        docs: [['Get started with Remote Config', 'https://firebase.google.com/docs/remote-config/android/get-started']],
      },

      {
        id: 'updates',
        title: 'In-app updates',
        tagline: 'Ask Google Play to update the app, from inside the app.',
        goals: ['Check from the app whether Google Play has a newer version', 'Run a flexible update and finish it with completeUpdate', 'Choose between a flexible and an immediate update'],
        level: 'intermediate', introduces: ['AppUpdateManager', 'AppUpdateManagerFactory', 'appUpdateInfo', 'addOnSuccessListener', 'updateAvailability', 'UpdateAvailability', 'UPDATE_AVAILABLE', 'isUpdateTypeAllowed', 'AppUpdateType', 'FLEXIBLE', 'IMMEDIATE', 'startUpdateFlowForResult', 'AppUpdateOptions', 'StartIntentSenderForResult', 'resultCode', 'RESULT_OK', 'InstallStateUpdatedListener', 'installStatus', 'InstallStatus', 'DOWNLOADED', 'completeUpdate', 'registerListener', 'unregisterListener'],
        body: `
<p>Recipes 1.8.0 fixes the Cook mode crash. A week later many people still run 1.7.0, which has the bug, so the flag has to stay off: not everyone updates apps often. The <b>Play In-App Updates</b> library lets Recipes ask Google Play “is there a newer version?” and start the update itself. It works for apps installed from Google Play, on phones, tablets and ChromeOS devices with Android 5.0 or newer.</p>
<p>There are two kinds. A <em>flexible update</em> shows Play’s prompt; if Ada accepts, it downloads in the background while she keeps cooking. When it is downloaded, the app shows a Restart button, and <code>completeUpdate()</code> lets Play install it and restart the app. An <em>immediate update</em> covers the whole screen: she can’t use the app until Play has installed the new version and restarted it. Keep that for versions the old app can’t work without.</p>
<p>In code it is a chain of four steps. <b>Check</b>: <code>AppUpdateManagerFactory.create(this)</code> gives an <code>AppUpdateManager</code>, and its <code>appUpdateInfo</code> is a Task; <code>addOnSuccessListener { info -> }</code> runs only when it worked. <b>Start</b>: if <code>info.updateAvailability()</code> is <code>UPDATE_AVAILABLE</code> and a flexible update is allowed, <code>startUpdateFlowForResult</code> shows Play’s prompt. Each <code>info</code> can start one flow: to ask again later, get a new one.</p>
<p><b>Downloaded</b>: a listener hears the download’s progress. When <code>installStatus()</code> is <code>InstallStatus.DOWNLOADED</code>, show a Restart button: for a flexible update, Play doesn’t restart the app by itself. If the download finished while Recipes was closed, no listener heard it, so check <code>info.installStatus()</code> at every start too. <b>Install</b>: the button calls <code>completeUpdate()</code>. To test it, Play Console’s internal app sharing gives you a link for each test build: install one, then open the link of a build with a higher version code but don’t install it there. Open Recipes, and it finds the update.</p>`,
        visual(el) {
          const list = '<div class="ui-m-row"><div>Bean stew · 45 min</div></div><div class="ui-m-row"><div>Lemon pasta · 20 min</div></div><div class="ui-m-row"><div>Tomato soup · 25 min</div></div>';
          const app = (ver, top = '', over = '') => `<div class="ui-m-bar">Recipes ${ver}</div><div class="ui-m-body">${top}${list}</div>${over}`;
          // Play draws its own screens: these are sketches with descriptions, not Play's exact words.
          const sheet = '<div class="ui-m-sheet"><b>Play’s update prompt</b><span class="ui-m-muted">sketch · offers Recipes 1.8.0</span><span class="ui-m-btn up-yes">accept</span><span class="ui-m-btn ghost">decline</span></div>';
          const restart = '<span class="ui-m-btn up-restart">Restart to update</span>';
          const installing = '<div class="ui-m-center"><div class="ui-m-spin"></div><b>Play installs 1.8.0</b><span class="ui-m-muted">sketch of Play’s screen</span></div>';
          const immediate = '<div class="ui-m-center"><b>Play’s full-screen update</b><span class="ui-m-muted">sketch · Recipes 1.8.0</span><div class="ui-m-spin"></div><span class="ui-m-muted">the app is blocked until it is installed</span></div>';
          Lab.ui.phone(el, {
            logTitle: 'What your code sees',
            predict: {
              q: 'A flexible update has finished downloading. What happens next?',
              options: ['Nothing, until your app calls <code>completeUpdate()</code>', 'Play restarts the app right away', 'The phone restarts'],
              a: 0,
              why: 'For a flexible update, Play waits for your app. You show a Restart button, and <code>completeUpdate()</code> installs.',
            },
            frames: [
              { screen: app('1.7.0'), log: '// Recipes 1.7.0 starts', say: 'Ada opens Recipes 1.7.0. In <code>onCreate</code>, the app asks Play about updates.' },
              { log: ['appUpdateInfo → UPDATE_AVAILABLE', 'isUpdateTypeAllowed(FLEXIBLE) → true'], say: 'Play answers: 1.8.0 is available, and a flexible update is allowed.' },
              { screen: app('1.7.0', '', sheet), log: 'startUpdateFlowForResult(info, updateLauncher, FLEXIBLE)', say: 'Your code starts the flow. Play draws its prompt, not your app; this is a sketch, and Play uses its own words.' },
              { tap: '.up-yes', screen: app('1.7.0'), log: ['updateLauncher: RESULT_OK', 'installStatus() → DOWNLOADING'], say: 'Ada accepts. The download runs in the background while she keeps reading the stew recipe.' },
              { screen: app('1.7.0', restart), log: 'installStatus() → DOWNLOADED, updateReady = true', say: 'Downloaded. Play doesn’t restart the app by itself, so your listener shows the Restart button.' },
              { tap: '.up-restart', screen: installing, log: 'completeUpdate()', say: 'She taps it when the pot is on. <code>completeUpdate()</code> hands over to Play, which installs 1.8.0 and restarts the app.' },
              { screen: app('1.8.0'), log: '// Recipes 1.8.0 starts', say: 'Recipes is back, on 1.8.0. She chose when to restart.' },
              { screen: immediate, log: 'AppUpdateOptions.newBuilder(IMMEDIATE)', say: 'An immediate update would instead cover the whole app until Play has installed it. Keep it for versions the old app can’t work without.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
// implementation("com.google.android.play:app-update:2.1.0")
// implementation("com.google.android.play:app-update-ktx:2.1.0")

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    private val updateManager by lazy { AppUpdateManagerFactory.create(this) }
    private var updateReady by mutableStateOf(false)

    // Made before the screen starts, like the permission launcher.
    // resultCode is RESULT_OK when Ada accepted Play's prompt.
    private val updateLauncher = registerForActivityResult(StartIntentSenderForResult()) { result ->
        if (result.resultCode != RESULT_OK) {
            Log.d("Update", "Not now: ask again at a later start")
        }
    }

    // Hears the download while the app runs: added with registerListener, removed in onDestroy
    private val installListener = InstallStateUpdatedListener { state ->
        if (state.installStatus() == InstallStatus.DOWNLOADED) {
            updateReady = true                                  // shows the Restart button
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        updateManager.registerListener(installListener)
        updateManager.appUpdateInfo.addOnSuccessListener { info ->
            if (info.installStatus() == InstallStatus.DOWNLOADED) {
                updateReady = true                              // downloaded while Recipes was closed
            } else if (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&
                info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) {
                updateManager.startUpdateFlowForResult(
                    info, updateLauncher, AppUpdateOptions.newBuilder(AppUpdateType.FLEXIBLE).build())
            }
        }
        setContent {
            Column {
                if (updateReady) {
                    Button(onClick = { updateManager.completeUpdate() }) { Text("Restart to update") }
                }
                // the Recipes screens, as before
            }
        }
    }

    override fun onDestroy() {
        updateManager.unregisterListener(installListener)
        super.onDestroy()
    }
}`,
        remember: 'Flexible by default, immediate only when the old version can’t work; a flexible update installs when you call completeUpdate().',
        mistakes: [
          {
            title: 'An immediate update for every release',
            bad: `AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build()   // for a small text fix`,
            good: `AppUpdateOptions.newBuilder(AppUpdateType.FLEXIBLE).build()    // she keeps cooking`,
            why: 'An immediate update blocks the whole app until it is installed. Used for every release, people learn to cancel it.',
          },
        ],
        terms: [
          { term: 'flexible update', def: 'An in-app update that downloads in the background while the app stays usable. <code>completeUpdate()</code> installs it.' },
          { term: 'immediate update', def: 'A full-screen in-app update: the app can’t be used until Play has installed it and restarted the app.' },
          { term: 'AppUpdateManager', def: 'The object from the Play In-App Updates library that checks for updates and starts them.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start a flexible update when Play has one and allows it.', code: `updateManager.appUpdateInfo.addOnSuccessListener { info ->
    if (info.updateAvailability() == UpdateAvailability.[[UPDATE_AVAILABLE]] &&
        info.isUpdateTypeAllowed(AppUpdateType.[[FLEXIBLE]])) {
        updateManager.[[startUpdateFlowForResult]](
            info, updateLauncher, AppUpdateOptions.newBuilder(AppUpdateType.FLEXIBLE).build())
    }
}`, why: 'First check that an update exists and that a flexible one is allowed, then start the flow with the same type.' },
          { type: 'bug', prompt: 'The update downloads, Ada taps Restart to update, and nothing happens. Tap the line.', code: `if (updateReady) {
    Button(onClick = { updateManager.registerListener(installListener) }) {
        Text("Restart to update")
    }
}`, bug: 1, fix: '    Button(onClick = { updateManager.completeUpdate() }) {', why: 'The listener was registered long ago. <code>completeUpdate()</code> is what asks Play to install the download and restart the app.' },
        ],
        quiz: [
          { q: 'Which kind of update lets Ada keep using the app while it downloads?', options: ['Flexible', 'Immediate', 'Both'], a: 0, why: 'A flexible update downloads in the background. An immediate update covers the whole app.' },
          { q: 'The listener reports <code>DOWNLOADED</code> for a flexible update. What must the app do?', options: ['Show a Restart button that calls <code>completeUpdate()</code>', 'Nothing: Play restarts it', 'Start an immediate update'], a: 0, why: 'Play doesn’t restart the app for a flexible update. It waits for <code>completeUpdate()</code>.' },
          { q: 'Ada declined the update. At the next start you want to offer the update again. What do you start the flow with?', options: ['A new <code>AppUpdateInfo</code> from <code>appUpdateInfo</code>', 'The same <code>info</code> as last time', 'An immediate update'], a: 0, why: 'Each <code>AppUpdateInfo</code> can start one flow. Ask for a fresh one.' },
        ],
        docs: [['Support in-app updates (Kotlin or Java)', 'https://developer.android.com/guide/playcore/in-app-updates/kotlin-java'], ['In-app updates', 'https://developer.android.com/guide/playcore/in-app-updates']],
      },

      {
        id: 'review',
        title: 'In-app review',
        tagline: 'Ask for a rating at a good moment, and let Google Play decide whether to show it.',
        goals: ['Show Google Play’s rating card inside the app', 'Pick a good moment to ask', 'Explain why the app never learns the result'],
        level: 'intermediate', introduces: ['ReviewManagerFactory', 'requestReviewFlow', 'launchReviewFlow', 'ReviewInfo'],
        body: `
<p>Ratings help people choose apps on Google Play, but few people leave an app to go and rate it. The <b>Play In-App Review</b> API shows Play’s own rating card on top of Recipes: stars and an optional review, without leaving the app. It works on Android 5.0 and newer, on phones and tablets with the Play Store.</p>
<p>It takes two calls on a <code>ReviewManager</code> from <code>ReviewManagerFactory.create(activity)</code>. <code>requestReviewFlow()</code> asks Play to get ready; its Task gives you a <code>ReviewInfo</code> as <code>task.result</code>. <code>launchReviewFlow(activity, reviewInfo)</code> hands over to Play, which may show the card. A <code>ReviewInfo</code> is only valid for a short time, so ask for it shortly before you launch.</p>
<p>Play decides, not you. It limits how often one person can see the card, and doesn’t publish the limit: a second call within a short time, such as less than a month, often shows nothing. When the flow is over, your listener runs, but it never says whether the card showed or whether Ada rated, so carry on the same way every time. Ask after Ada got something out of the app, for example when she finishes her third recipe in Cook mode. Never ask a question first (“Do you like Recipes?”), and never put the API behind a Rate button, which might do nothing: a button opens Recipes’ page in the Play Store instead.</p>`,
        visual(el) {
          const done = '<div class="ui-m-bar">Cook mode</div><div class="ui-m-center"><b>Bean stew is ready</b><span class="ui-m-muted">Step 6 of 6 · 45 min</span><span class="ui-m-btn">Done</span></div>';
          // Play draws the card and the store page: these are sketches, not Play's exact words.
          const card = `${done}<div class="ui-m-scrim"><div class="ui-m-dialog"><b>Play’s rating card</b><span class="ui-m-muted">sketch · stars and an optional review</span><span class="al-stars rv-submit">★★★★★</span></div></div>`;
          const settings = '<div class="ui-m-bar">Settings</div><div class="ui-m-body"><div class="ui-m-row"><div>Notifications</div></div><div class="ui-m-row"><div>App lock</div></div><div class="ui-m-row rv-rate"><div>Rate Recipes</div></div></div>';
          const store = '<div class="ui-m-bar">Google Play</div><div class="ui-m-body"><b>Recipes’ store page</b><span class="ui-m-muted">sketch · where anyone can rate and review</span><span class="al-stars">☆☆☆☆☆</span></div>';
          Lab.ui.phone(el, {
            logTitle: 'What your code sees',
            predict: {
              q: 'The card showed last week. Today the app calls <code>launchReviewFlow</code> again. What does Ada see?',
              options: ['Probably nothing: Play limits how often the card shows', 'The card again', 'An error message from Play'],
              a: 0,
              why: 'Play limits how often one person sees the card. Your listener runs the same way whether it showed or not.',
            },
            frames: [
              { screen: done, log: '// Ada finished her 3rd recipe in Cook mode', say: 'Ada just finished cooking her third recipe in Cook mode. She got something out of the app: a good moment to ask.' },
              { log: 'requestReviewFlow() → ReviewInfo', say: 'The app asks Play to get ready and receives a <code>ReviewInfo</code>.' },
              { screen: card, log: 'launchReviewFlow(activity, info)', say: 'Play draws its rating card over Recipes (a sketch here). You can’t change how it looks, and you don’t see what Ada picks.' },
              { tap: '.rv-submit', screen: done, log: 'launchReviewFlow finished → your listener runs', say: 'She picks five stars and sends them, or closes the card. Either way your listener runs, and the app carries on.' },
              { log: ['// a week later, another recipe', 'requestReviewFlow() → ReviewInfo', 'launchReviewFlow(activity, info)', 'launchReviewFlow finished → your listener runs'], say: 'A week later the app asks again. Play doesn’t show the card this time. Your code can’t tell the difference.' },
              { screen: settings, log: '// Ada opens Settings', say: 'A “Rate Recipes” item in Settings. If it called the review API, a tap could do nothing at all.' },
              { tap: '.rv-rate', screen: store, log: 'startActivity(Intent(Intent.ACTION_VIEW, storeLink))', say: 'So it opens Recipes’ page in the Play Store, where a review always works.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
// implementation("com.google.android.play:review:2.0.2")
// implementation("com.google.android.play:review-ktx:2.0.2")

class ReviewPrompt(private val activity: Activity) {
    private val manager = ReviewManagerFactory.create(activity)

    // Call at a good moment: Ada just finished her third recipe in Cook mode
    fun ask(onDone: () -> Unit) {
        manager.requestReviewFlow().addOnCompleteListener { request ->
            if (request.isSuccessful) {
                manager.launchReviewFlow(activity, request.result).addOnCompleteListener {
                    onDone()            // no way to know if the card showed, or if she rated
                }
            } else {
                onDone()                // something failed: carry on as normal
            }
        }
    }
}

// "Rate Recipes" in Settings opens the Play Store page instead
fun openStorePage(context: Context) {
    val storeLink = Uri.parse("https://play.google.com/store/apps/details?id=\${context.packageName}")
    context.startActivity(Intent(Intent.ACTION_VIEW, storeLink))
}`,
        remember: 'Ask at a good moment with no question first, then carry on: the review API may show nothing and never reports what happened.',
        mistakes: [
          {
            title: 'A question before the card',
            bad: `showQuestion("Do you like Recipes?")   // only a yes leads to the card`,
            good: `reviewPrompt.ask { goNext() }          // the card, with no question before it`,
            why: 'Play’s rules forbid asking anything before or while the card shows, including sending only happy users to it.',
          },
        ],
        terms: [
          { term: 'in-app review', def: 'Google Play’s rating card, shown on top of your app by the Play In-App Review API.' },
          { term: 'ReviewInfo', def: 'What <code>requestReviewFlow()</code> gives you to pass to <code>launchReviewFlow()</code>. It is valid only for a short time.' },
          { term: 'review quota', def: 'Play’s limit on how often one person can see the card. The number isn’t published and can change.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Get a ReviewInfo, then hand it to Play.', code: `manager.[[requestReviewFlow]]().addOnCompleteListener { request ->
    if (request.isSuccessful) {
        manager.[[launchReviewFlow]](activity, request.result).addOnCompleteListener {
            onDone()
        }
    }
}`, why: 'The first call gets Play ready and gives a <code>ReviewInfo</code>. The second shows the card, if Play decides to.' },
          { type: 'bug', prompt: 'Some taps on “Rate Recipes” do nothing at all. Tap the line.', code: `val context = LocalContext.current
Column {
    SettingRow("Notifications", onClick = openNotifications)
    SettingRow("Rate Recipes", onClick = { reviewPrompt.ask { } })
}`, bug: 3, fix: '    SettingRow("Rate Recipes", onClick = { openStorePage(context) })', why: 'If Play’s limit is reached, the review flow shows nothing and the button looks broken. A button opens the store page, which always works.' },
        ],
        quiz: [
          { q: 'The listener after <code>launchReviewFlow</code> runs. What do you know?', options: ['Only that the flow is over', 'That Ada rated the app', 'That the card was shown'], a: 0, why: 'The API never says whether the card showed or whether a rating was given. Carry on the same way.' },
          { q: 'When is a good moment to call the review flow?', options: ['Right after Ada finished cooking a recipe in the app', 'At the very first start', 'Right after an error message'], a: 0, why: 'Ask after she got something out of the app, so she has an opinion worth giving.' },
          { q: 'Why not show the card from a “Rate us” button?', options: ['Play may not show the card, and the button would seem broken', 'Buttons can’t call Play libraries', 'It costs money'], a: 0, why: 'Because of the quota, the flow may show nothing. A button should open the store page.' },
        ],
        docs: [['In-app reviews', 'https://developer.android.com/guide/playcore/in-app-review'], ['Integrate in-app reviews (Kotlin or Java)', 'https://developer.android.com/guide/playcore/in-app-review/kotlin-java']],
      },

      {
        id: 'billing',
        title: 'Payments',
        tagline: 'Sell Recipes Plus with Google Play Billing: connect, show the price, open Play’s purchase sheet.',
        goals: ['Connect a BillingClient to Google Play', 'Load a product and show its price from Play', 'Open Play’s purchase sheet with launchBillingFlow'],
        level: 'intermediate', introduces: ['BillingClient', 'setListener', 'enablePendingPurchases', 'PendingPurchasesParams', 'enableOneTimeProducts', 'enableAutoServiceReconnection', 'startConnection', 'BillingClientStateListener', 'onBillingSetupFinished', 'onBillingServiceDisconnected', 'BillingResult', 'responseCode', 'BillingResponseCode', 'queryProductDetailsAsync', 'QueryProductDetailsParams', 'setProductId', 'setProductType', 'ProductType', 'INAPP', 'setProductList', 'productDetailsList', 'ProductDetails', 'oneTimePurchaseOfferDetails', 'offerToken', 'formattedPrice', 'BillingFlowParams', 'ProductDetailsParams', 'setProductDetails', 'setOfferToken', 'setProductDetailsParamsList', 'launchBillingFlow'],
        body: `
<p>Recipes Plus adds a weekly meal planner, sold once, for good. To sell digital things in an app from Google Play, you use <b>Google Play Billing</b>: Play shows its own purchase sheet, takes the payment and tells your app. Recipes never sees a card number. You create the product in Play Console with the ID <code>recipes_plus</code> and its price, and add the <code>billing-ktx</code> library, version 9.1.0. Since August 31, 2026, new apps and updates on Play must use version 8 or newer, with an extension to November 1, 2026 on request.</p>
<p>A <code>BillingClient</code> does the talking. <code>startConnection</code> connects it to Google Play on the phone, and <code>onBillingSetupFinished</code> runs when it is ready, with a response code: <code>BillingResponseCode.OK</code> means it worked. <code>enableAutoServiceReconnection()</code> makes it reconnect by itself if the link drops.</p>
<p>Once connected, <code>queryProductDetailsAsync</code> asks Play for the product. The answer is a <code>ProductDetails</code> with the name, the price as <code>formattedPrice</code>, already in the currency of Ada’s country, and an <code>offerToken</code> that names the offer she will buy. Show that price on the button; never type a price into the code.</p>
<p>When Ada taps the button, <code>launchBillingFlow(activity, params)</code> opens Play’s sheet over Recipes. When the sheet closes, Play calls the listener you gave <code>setListener</code>, with a response code and a list of purchases. What the app does with them is the next lesson.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'console', label: 'Play Console', sub: 'recipes_plus + price' },
              { id: 'app', label: 'Recipes', sub: 'BillingClient' },
              { id: 'play', label: 'Google Play', sub: 'on Ada’s phone' },
            ],
            predict: {
              q: 'Where does the price on the “Get Recipes Plus” button come from?',
              options: ['From Google Play, as <code>formattedPrice</code> in the <code>ProductDetails</code>', 'From a number typed into the app’s code', 'From Ada’s bank'],
              a: 0,
              why: 'You set the price in Play Console. Play hands it to the app, already in the currency of the user’s country.',
            },
            frames: [
              { at: 'console', packet: 'recipes_plus', say: 'You create <code>recipes_plus</code> in Play Console and give it a price. The app’s code has no price in it.' },
              { at: 'play', packet: 'startConnection', say: 'Ada opens the Plus screen. The <code>BillingClient</code> connects to Google Play on her phone.' },
              { at: 'app', packet: 'onBillingSetupFinished · OK', tone: 'ok', say: 'Play answers with <code>BillingResponseCode.OK</code>: connected. Now the app may ask for products.' },
              { at: 'play', packet: 'queryProductDetailsAsync', say: 'The app asks for <code>recipes_plus</code>.' },
              { at: 'app', packet: 'ProductDetails · formattedPrice', tone: 'ok', mark: { app: 'ok' }, say: 'Play answers with the <code>ProductDetails</code>: the name, the price in Ada’s currency, and an offer token. The button now shows that price.' },
              { at: 'play', packet: 'launchBillingFlow', tone: 'warm', mark: { play: 'warm' }, say: 'Ada taps the button. <code>launchBillingFlow</code> opens Play’s purchase sheet over Recipes. Play takes the payment; Recipes never sees her card.' },
              { at: 'app', packet: 'response code + purchases', say: 'The sheet closes and Play calls your listener with a response code and the purchases.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
// implementation("com.android.billingclient:billing-ktx:9.1.0")

class PlusStore(context: Context, private val session: Session, private val appScope: CoroutineScope) {
    private val client = BillingClient.newBuilder(context)
        .setListener { result, purchases ->                    // Play calls this when the sheet closes
            if (result.responseCode == BillingResponseCode.OK && purchases != null) {
                for (purchase in purchases) {
                    handle(purchase)                            // the purchases lesson
                }
            }
        }
        // required: allows purchases that are paid later, in a shop
        .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
        .enableAutoServiceReconnection()
        .build()

    fun connect(onReady: () -> Unit) {
        client.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                if (result.responseCode == BillingResponseCode.OK) {
                    onReady()                                   // now loadPlus may run
                }
            }
            override fun onBillingServiceDisconnected() {}      // the library reconnects by itself
        })
    }

    fun loadPlus(onLoaded: (ProductDetails) -> Unit) {
        // The question for Play: one product, recipes_plus, sold once (INAPP)
        val product = QueryProductDetailsParams.Product.newBuilder()
            .setProductId("recipes_plus")
            .setProductType(ProductType.INAPP)
            .build()
        val params = QueryProductDetailsParams.newBuilder().setProductList(listOf(product)).build()
        client.queryProductDetailsAsync(params) { result, details ->
            val plus = details.productDetailsList.firstOrNull()
            if (result.responseCode == BillingResponseCode.OK && plus != null) {
                onLoaded(plus)            // the screen shows plus.oneTimePurchaseOfferDetails?.formattedPrice
            }
        }
    }

    fun buy(activity: Activity, plus: ProductDetails) {
        val offer = plus.oneTimePurchaseOfferDetails ?: return
        // What to buy: this product, with this offer's token
        val item = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(plus)
            .setOfferToken(offer.offerToken)
            .build()
        val params = BillingFlowParams.newBuilder().setProductDetailsParamsList(listOf(item)).build()
        client.launchBillingFlow(activity, params)              // Play shows its purchase sheet
    }
}`,
        remember: 'Connect first, load the product from Play and show its formattedPrice, then launchBillingFlow opens Play’s sheet.',
        mistakes: [
          {
            title: 'A price typed into the code',
            bad: `Text("Get Recipes Plus: 4.99")`,
            good: `Text("Get Recipes Plus: \${offer.formattedPrice}")`,
            why: 'The price is set in Play Console and can differ by country and currency. Only <code>formattedPrice</code> shows what Ada will really pay.',
          },
        ],
        terms: [
          { term: 'Google Play Billing', def: 'Play’s way to sell digital things in an app: Play shows the purchase sheet and takes the payment.' },
          { term: 'BillingClient', def: 'The object that connects the app to Google Play to load products and start purchases.' },
          { term: 'ProductDetails', def: 'What Play returns for a product: its name, its <code>formattedPrice</code> and the offer token you buy it with.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Ask Play for the product, and pass it on only when Play answered OK.', code: `client.[[queryProductDetailsAsync]](params) { result, details ->
    val plus = details.productDetailsList.firstOrNull()
    if (result.responseCode == BillingResponseCode.[[OK]] && plus != null) {
        onLoaded(plus)
    }
}`, why: '<code>queryProductDetailsAsync</code> loads the product. Use it only when the response code is <code>OK</code> and the product is there.' },
          { type: 'bug', prompt: 'Users in Oslo see a price in the wrong currency. Tap the line.', code: `val offer = plus.oneTimePurchaseOfferDetails
if (offer != null) {
    Button(onClick = { store.buy(activity, plus) }) {
        Text("Get Recipes Plus: 4.99")
    }
}`, bug: 3, fix: '        Text("Get Recipes Plus: ${offer.formattedPrice}")', why: 'Play knows the price and currency for each country. <code>formattedPrice</code> shows it as Ada will pay it.' },
        ],
        quiz: [
          { q: 'When may the app call <code>queryProductDetailsAsync</code>?', options: ['After <code>onBillingSetupFinished</code> reports <code>OK</code>', 'Before <code>startConnection</code>', 'Only after a purchase'], a: 0, why: 'The client must be connected to Play first. <code>onBillingSetupFinished</code> says when it is.' },
          { q: 'What does <code>launchBillingFlow</code> do?', options: ['Opens Google Play’s purchase sheet over the app', 'Takes the payment inside Recipes', 'Unlocks Plus'], a: 0, why: 'Play shows the sheet and takes the payment. The app hears the result in its listener.' },
          { q: 'You send an update to Play in late November 2026. Which Play Billing Library may it use?', options: ['Version 8 or newer, such as 9.1.0', 'Any version', 'Version 7 is enough'], a: 0, why: 'Since August 31, 2026, new apps and updates need version 8 or newer. The extension ran only to November 1, 2026.' },
        ],
        docs: [['Integrate the Google Play Billing Library', 'https://developer.android.com/google/play/billing/integrate'], ['Play Billing Library deprecation', 'https://developer.android.com/google/play/billing/deprecation-faq']],
      },

      {
        id: 'purchases',
        title: 'Handling purchases',
        tagline: 'Check each purchase on your server, acknowledge it, and catch the ones paid while the app was closed.',
        goals: ['Grant only paid purchases that your server has verified', 'Acknowledge a purchase within three days', 'Find purchases paid while the app was closed with queryPurchasesAsync'],
        level: 'intermediate', introduces: ['Purchase', 'purchaseState', 'PurchaseState', 'PURCHASED', 'PENDING', 'purchaseToken', 'isAcknowledged', 'acknowledgePurchase', 'AcknowledgePurchaseParams', 'setPurchaseToken', 'queryPurchasesAsync', 'QueryPurchasesParams'],
        body: `
<p>Ada closes Play’s sheet and the listener gets a <code>Purchase</code>. Is Plus hers now? Not yet. Anyone can change a copy of the APK so that the app “gets” a purchase that was never paid. So the app never decides alone: your server does, and the app only unlocks what the server says.</p>
<p>A <code>Purchase</code> has a <code>purchaseState</code>. <code>PURCHASED</code> means paid. <code>PENDING</code> means not yet, for example when Ada chose to pay cash at a shop later: grant nothing until it is paid. For a paid one, send its <code>purchaseToken</code>, the string that names this one purchase, to your server. The server asks the Google Play Developer API whether the token is real, checks it wasn’t used before, saves it, and unlocks Plus for Ada’s account.</p>
<p>Then the purchase is <em>acknowledged</em> with <code>acknowledgePurchase</code>, which tells Play it was granted. A purchase not acknowledged within three days of being paid is refunded, and Plus is taken away. <code>isAcknowledged</code> says whether it already was.</p>
<p>A pending purchase can become paid while Recipes is closed, and then no listener hears it. So after connecting, and in <code>onResume</code>, call <code>queryPurchasesAsync</code> with <code>QueryPurchasesParams</code> for your product type. It returns the purchases Ada owns, and you handle each one the same way.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'app', label: 'Recipes', sub: 'BillingClient' },
              { id: 'play', label: 'Google Play', sub: 'payments' },
              { id: 'srv', label: 'Your server', sub: 'checks, unlocks' },
              { id: 'api', label: 'Play Developer API', sub: 'Google’s records' },
            ],
            predict: {
              q: 'Ada pays at the shop the next day, while Recipes is closed. How does the app find out?',
              options: ['<code>queryPurchasesAsync</code> at the next start returns it as <code>PURCHASED</code>', 'The listener runs anyway, even with the app closed', 'It never does: she must buy again'],
              a: 0,
              why: 'The listener only hears purchases while the app runs. Asking Play at every start catches the rest.',
            },
            frames: [
              { at: 'app', packet: 'PENDING', tone: 'warm', mark: { app: 'warm' }, say: 'Ada chooses to pay cash at a shop. The listener gets a <code>Purchase</code> with state <code>PENDING</code>. The app grants nothing.' },
              { at: 'play', packet: 'paid at the shop', say: 'The next day she pays. Recipes is closed, so no listener hears it.' },
              { at: 'app', packet: 'queryPurchasesAsync → PURCHASED', tone: 'ok', say: 'She opens Recipes. After connecting, the app calls <code>queryPurchasesAsync</code>: now the state is <code>PURCHASED</code>, with a purchase token. The three days for acknowledging started when it was paid.' },
              { at: 'srv', packet: 'purchase token', say: 'The app unlocks nothing yet. It sends the token to your server.' },
              { at: 'api', packet: 'is this token real?', say: 'The server asks the Google Play Developer API about the token, and checks that it wasn’t used before.' },
              { at: 'srv', packet: 'valid', tone: 'ok', mark: { srv: 'ok' }, say: 'It is real. The server saves the token and unlocks Plus for Ada’s account.' },
              { at: 'app', packet: 'acknowledged · Plus on', tone: 'ok', mark: { app: 'ok' }, say: 'The app acknowledges the purchase and opens the meal planner. Without the acknowledgement, Play would refund Ada after three days.' },
            ],
          });
        },
        code: `// PlusStore, continued: the purchase listener and restore() both call handle()
private fun handle(purchase: Purchase) {
    if (purchase.purchaseState != Purchase.PurchaseState.PURCHASED) {
        return                                              // PENDING: not paid yet, grant nothing
    }
    appScope.launch {
        // Session posts the token to your server, which checks it with Google Play and unlocks Plus
        val valid = session.verifyPurchase(purchase.purchaseToken)
        if (valid && !purchase.isAcknowledged) {
            val params = AcknowledgePurchaseParams.newBuilder().setPurchaseToken(purchase.purchaseToken).build()
            client.acknowledgePurchase(params)              // within three days, or Play refunds
        }                                                   // (the server may acknowledge instead)
    }
}

// Call after connect, and in onResume: purchases paid while the app was closed
fun restore() {
    val params = QueryPurchasesParams.newBuilder().setProductType(ProductType.INAPP).build()
    client.queryPurchasesAsync(params) { result, purchases ->
        if (result.responseCode == BillingResponseCode.OK) {
            for (purchase in purchases) {
                handle(purchase)
            }
        }
    }
}`,
        remember: 'Grant only PURCHASED, let the server verify the token, acknowledge within three days, and ask queryPurchasesAsync at every start.',
        mistakes: [
          {
            title: 'Unlocking a pending purchase',
            bad: `private fun handle(purchase: Purchase) {
    unlockPlus()        // even when the state is PENDING
}`,
            good: `private fun handle(purchase: Purchase) {
    if (purchase.purchaseState != Purchase.PurchaseState.PURCHASED) {
        return
    }
    // send the token to the server, as above
}`,
            why: 'A pending purchase isn’t paid and may never be. Unlock only what is <code>PURCHASED</code> and verified.',
          },
        ],
        terms: [
          { term: 'purchase token', def: 'The string that identifies one purchase. Your server checks it with Google Play and saves it.' },
          { term: 'acknowledge', def: 'Telling Play that the purchase was granted. Without it, Play refunds the purchase three days after it was paid.' },
          { term: 'pending purchase', def: 'A purchase not paid yet, such as cash at a shop. Grant nothing until it becomes <code>PURCHASED</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Handle only purchases that are paid, and send their token to the server.', code: `if (purchase.purchaseState == Purchase.PurchaseState.[[PURCHASED]]) {
    appScope.launch {
        session.verifyPurchase(purchase.[[purchaseToken]])
    }
}`, why: 'A pending purchase waits. A paid one goes to the server by its token, and the server decides.' },
          { type: 'bug', prompt: 'Ada pays and gets Plus, then three days later Play refunds her and Plus is gone. Tap the line.', code: `appScope.launch {
    val valid = session.verifyPurchase(purchase.purchaseToken)
    if (valid && purchase.isAcknowledged) {
        val params = AcknowledgePurchaseParams.newBuilder().setPurchaseToken(purchase.purchaseToken).build()
        client.acknowledgePurchase(params)
    }
}`, bug: 2, fix: '    if (valid && !purchase.isAcknowledged) {', why: 'A new purchase isn’t acknowledged yet, so this never acknowledged anything. The <code>!</code> acknowledges the ones that still need it.' },
        ],
        quiz: [
          { q: 'What happens to a paid purchase that is never acknowledged?', options: ['Play refunds it after three days and takes Plus away', 'Nothing', 'Play acknowledges it by itself'], a: 0, why: 'Acknowledging tells Play the purchase was granted. Without it, Play refunds after three days.' },
          { q: 'The listener reports a <code>PURCHASED</code> purchase. Who decides to unlock Plus?', options: ['Your server, after it checks the token with Google Play', 'The app, right away', 'Nobody: Play unlocks it by itself'], a: 0, why: 'A changed copy of the app can fake a purchase. The server checks the token before anything is unlocked.' },
          { q: 'A <code>PENDING</code> purchase is paid while Recipes is closed. What picks it up?', options: ['<code>queryPurchasesAsync</code>, after connecting and in <code>onResume</code>', 'The purchase listener, the next morning', 'A new <code>launchBillingFlow</code>'], a: 0, why: 'The listener only hears purchases while the app runs. <code>queryPurchasesAsync</code> returns what Ada owns, and <code>handle</code> treats it the same way.' },
        ],
        docs: [['Integrate the Google Play Billing Library', 'https://developer.android.com/google/play/billing/integrate'], ['Fight fraud and abuse', 'https://developer.android.com/google/play/billing/security']],
      },

      {
        id: 'policy',
        title: 'Play policies',
        tagline: 'A few rules decide whether Google Play accepts your next update.',
        goals: ['Check an update against Play’s target API rule for each kind of device', 'Keep the Data safety form in line with what the app and its libraries send', 'Spot permissions and foreground services that need a declaration in Play Console'],
        level: 'intermediate', introduces: [],
        body: `
<p>Recipes 1.9.0 passes every test, and still Play can turn it away, for reasons that have nothing to do with bugs. Three come up again and again: the target API level, the Data safety form, and permissions that need a reason. Check them before you upload, not after.</p>
<p><b>Target API level.</b> As in <a href="#build.api-levels">API levels</a>, phone apps and their updates must target API 36 since August 31, 2026, and Recipes does. Two more facts: other devices have their own numbers (Wear OS and Android Automotive OS apps 35, Android TV and Android XR apps 34), and you can ask for an extension to November 1, 2026.</p>
<p><b>Data safety.</b> The form on Play Console’s App content page says which data the app <em>collects</em>, sends off the phone, and which it <em>shares</em>, passes to someone else. It counts what your libraries send. Recipes’ form already lists what the app itself sends, such as Ada’s email address for her account. Then Crashlytics and Analytics joined: Crashlytics sends crash logs and diagnostics, Analytics sends app interactions and an approximate location worked out from the IP address, and both send device or other IDs. Each library has its own data disclosure page to check, but the answers are yours: you are responsible for them, and a wrong form can lead to blocked updates or removal from Play.</p>
<p><b>Declarations.</b> Ask only for what a feature needs, as in the privacy lesson. Some permissions also need a declaration form in Play Console that explains why the app’s main features need them, such as SMS and call log, background location, all files access, <code>QUERY_ALL_PACKAGES</code> and <code>USE_EXACT_ALARM</code>. That is why the timer uses <code>SCHEDULE_EXACT_ALARM</code>. And an app that targets Android 14 or newer declares each foreground service type it uses on the App content page, with a description and a link to a short video: Recipes’ <code>dataSync</code> download needs one.</p>`,
        visual(el) {
          const icon = { ok: '✓', bad: '✗', wait: '…' };
          board(el, {
            predict: {
              q: 'Recipes’ Data safety form already lists what the app itself sends. Then Crashlytics joins. What changes?',
              options: ['Add what Crashlytics sends: data sent by libraries counts', 'Nothing: the form is only about your own code', 'Nothing: each library fills in its own form'],
              a: 0,
              why: 'The form covers everything that leaves the phone from your app, including what its libraries send.',
            },
            draw(stage, f) {
              stage.append(h('span', { class: 'al-label' }, 'Will Play accept Recipes 1.9.0?'),
                h('div', { class: 'al-checks' }, f.rows.map(([state, text]) => h('div', { class: `al-check al-${state}` }, h('i', { 'aria-hidden': 'true' }, icon[state]), h('span', {}, text)))));
            },
            frames: [
              { rows: [['wait', 'targetSdk'], ['wait', 'Play Billing Library'], ['wait', 'Data safety form'], ['wait', 'Foreground service declaration']], say: 'Recipes 1.9.0 is ready to upload. Check it the way Play will, one row at a time.' },
              { rows: [['ok', 'targetSdk = 36: the rule for phone apps since August 31, 2026'], ['wait', 'Play Billing Library'], ['wait', 'Data safety form'], ['wait', 'Foreground service declaration']], say: 'Recipes targets 36, tested as in the build track. This row is fine.' },
              { rows: [['ok', 'targetSdk = 36: the rule for phone apps since August 31, 2026'], ['ok', 'billing-ktx 9.1.0: version 8 or newer is required'], ['wait', 'Data safety form'], ['wait', 'Foreground service declaration']], say: 'Recipes Plus uses Play Billing Library 9.1.0, newer than the version 8 Play asks for.' },
              { rows: [['ok', 'targetSdk = 36: the rule for phone apps since August 31, 2026'], ['ok', 'billing-ktx 9.1.0: version 8 or newer is required'], ['bad', 'Data safety form: lists the account, but not what Crashlytics and Analytics send'], ['wait', 'Foreground service declaration']], say: 'The form was filled in before Crashlytics and Analytics joined the app. Now it is wrong, and you are responsible for it.' },
              { rows: [['ok', 'targetSdk = 36: the rule for phone apps since August 31, 2026'], ['ok', 'billing-ktx 9.1.0: version 8 or newer is required'], ['ok', 'Data safety form: crash logs, diagnostics, app interactions, device or other IDs, approximate location added'], ['wait', 'Foreground service declaration']], say: 'You read both libraries’ data disclosure pages and add what they send. The form matches the app again.' },
              { rows: [['ok', 'targetSdk = 36: the rule for phone apps since August 31, 2026'], ['ok', 'billing-ktx 9.1.0: version 8 or newer is required'], ['ok', 'Data safety form: crash logs, diagnostics, app interactions, device or other IDs, approximate location added'], ['ok', 'dataSync foreground service: declared on the App content page, with a video']], say: 'The download runs as a <code>dataSync</code> foreground service, so it is declared with a description and a short video. Every row is green: upload.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
android {
    compileSdk = 37
    defaultConfig {
        applicationId = "com.example.recipes"
        minSdk = 26
        targetSdk = 36          // the build track's api-levels lesson: Play's rule since August 31, 2026
        versionCode = 22        // after 17 (1.4.2) came 1.5.0 to 1.8.0
        versionName = "1.9.0"
    }
}

// AndroidManifest.xml: only what the features need
// <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
// <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />           <!-- the timer -->
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />   <!-- declared in Play Console -->

// Data safety form, App content page in Play Console. Rows added for the libraries:
//   Crash logs, Diagnostics      sent by Crashlytics
//   App interactions             sent by Analytics
//   Device or other IDs          sent by both
//   Approximate location         Analytics, from the IP address
// Check each library's own data disclosure page; the mapping is yours, and so is the responsibility.`,
        remember: 'Before each upload: targetSdk meets this year’s rule, the Data safety form matches every library, and sensitive permissions and foreground services are declared.',
        mistakes: [
          {
            title: 'Filling in the Data safety form only once',
            bad: `implementation("com.google.firebase:firebase-analytics")   // added; the form stays as it was`,
            good: `implementation("com.google.firebase:firebase-analytics")   // added; the form now lists what Analytics sends`,
            why: 'A new library can send new data off the phone. If the form doesn’t say so, it is wrong, and you are responsible for it.',
          },
        ],
        terms: [
          { term: 'Data safety form', def: 'The form in Play Console that tells users which data the app collects and shares. It must match the app and all its libraries.' },
          { term: 'collected', def: 'In the Data safety form: data your app or its libraries send off the phone.' },
          { term: 'shared', def: 'In the Data safety form: data passed on to someone else, a third party.' },
          { term: 'declaration', def: 'A form in Play Console that explains why the app needs a sensitive permission or a foreground service type.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Recipes’ download runs as a <code>dataSync</code> foreground service. Add the permission that goes with that type; Play Console then asks you to declare it.', code: `<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.[[FOREGROUND_SERVICE_DATA_SYNC]]" />`, why: 'Each foreground service type has its own permission. An app that targets Android 14 or newer also declares the type on the App content page.' },
          { type: 'bug', prompt: 'Play won’t accept this manifest for a recipe app. Tap the line.', code: `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
</manifest>`, bug: 2, fix: '    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />', why: 'Play allows <code>USE_EXACT_ALARM</code> only for apps whose main job is alarms or calendars. A cooking timer uses <code>SCHEDULE_EXACT_ALARM</code>, which the user turns on.' },
        ],
        quiz: [
          { q: 'A Wear OS app sends an update to Play in late November 2026. Which <code>targetSdk</code> must it have at least?', options: ['35', '36', '34'], a: 0, why: 'Phone apps need 36, Wear OS and Android Automotive OS apps 35, Android TV and Android XR apps 34.' },
          { q: 'Recipes targets Android 16 and runs a <code>dataSync</code> foreground service. What does Play Console ask for?', options: ['A declaration on the App content page, with a description and a video link', 'Nothing: the manifest is enough', 'A new upload key'], a: 0, why: 'Apps that target Android 14 or newer declare each foreground service type they use.' },
          { q: 'You add a library that sends data off the phone. Who must make sure the Data safety form says so?', options: ['You', 'The library’s makers', 'Google Play, automatically'], a: 0, why: 'What your app’s libraries send counts as your app’s data, and you are accountable for the form.' },
        ],
        docs: [['Target API level requirements for Google Play apps', 'https://developer.android.com/google/play/requirements/target-sdk'], ['Provide information for Google Play’s Data safety section', 'https://support.google.com/googleplay/android-developer/answer/10787469']],
      },
    ],
  });
})();
