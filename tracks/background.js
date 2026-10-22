/* Background work track.
   Same shape as tracks/kotlin.js. Demos use the visual kit (Lab.ui); any track CSS goes in the css string, every class
   starting with plt-. */
(() => {
  const css = ``;

  Lab.addTrack({
    id: 'background',
    title: 'Background work',
    description: 'Why Android pauses apps you aren’t looking at, and the right tool for each job Recipes does off screen: WorkManager for a nightly sync, a foreground service for a download, broadcast receivers for system events, and exact alarms for a cooking timer.',
    group: 'Going deeper', requires: ['push', 'arch'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'why-limits',
        title: 'Why Android limits background work',
        tagline: 'A phone must last the day, so Android decides when apps you aren’t looking at may run.',
        goals: ['Explain why Android pauses and ends apps that aren’t on screen', 'Describe what Doze switches off and when waiting work gets its turn', 'Put an emulator into Doze with adb to test your app'],
        level: 'beginner', introduces: ['dumpsys', 'deviceidle', 'unforce'],
        body: `
<p>Sam wants Recipes to notice new recipes at once, so he starts a coroutine that asks the server every 5 minutes, forever. In the morning Lin’s phone, which lay on the table all night, shows yesterday’s list. Sam’s loop didn’t fail with an error. Android stopped it on purpose. A phone has dozens of apps; if each one woke the phone every few minutes, the battery would be empty by lunch. Work an app does while the user isn’t looking at it is <em>background work</em>, and Android decides when it may happen.</p>
<p>Two things got in Sam’s way. First, once the user leaves an app, Android may end its process at any moment to free memory, as you saw with the ViewModel, and every coroutine in it ends too. Second, <em>Doze</em>: when the phone is unplugged, lying still, with the screen off for a while, Android puts it into a deep sleep. Apps lose the network, and the work and alarms they scheduled wait. Every so often Doze opens a short <em>maintenance window</em> where the waiting work runs and the network is back. The longer the phone lies still, the further apart the windows. Picking the phone up, turning the screen on or plugging in the charger ends Doze.</p>
<p>Android also sorts apps by how recently and how often the user opens them, into <em>App Standby Buckets</em>: active, working set, frequent, rare and restricted. On battery, the rarer the bucket, the fewer turns the app gets for its background work; an app in restricted runs its jobs about once a day. So don’t fight these rules. Tell Android what the work needs and let it choose the moment: work that must happen but can wait, work the user is watching, an event to react to, or an exact time. Each of those has its own tool, one per lesson in this track.</p>
<p>To test, you don’t have to wait an hour on the table: <code>adb shell dumpsys deviceidle force-idle</code> puts the emulator into Doze at once, and <code>dumpsys deviceidle unforce</code> ends it. <code>dumpsys</code> is a tool on the phone that shows and changes the state of Android’s parts; <code>deviceidle</code> is the part that runs Doze.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['phone', 'network', 'Sam’s loop'],
            span: 8,
            unit: 'h',
            predict: {
              q: 'Sam’s coroutine asks the server every 5 minutes. Lin leaves the phone on the table overnight, unplugged, screen off. What happens to the loop?',
              options: ['It keeps asking every 5 minutes all night', 'In Doze it can’t reach the server, and when Android ends the process the loop ends too', 'Android moves the loop to the server'],
              a: 1,
              why: 'Doze takes the network away from apps, and an app that isn’t on screen can lose its process at any time. Nothing brings a plain coroutine back.',
            },
            frames: [
              { now: 0, say: 'One night on Lin’s phone: 0 h is 23:00, 8 h is 07:00. She puts the phone down, unplugged, and the screen turns off.' },
              { bars: [{ lane: 0, from: 0, to: 1, label: '', tone: 'muted' }, { lane: 1, from: 0, to: 1, label: '', tone: 'ok' }, { lane: 2, from: 0, to: 1, label: '', tone: 'ok' }], say: 'For the first hour nothing changes: the network is on, and the loop still reaches the server every 5 minutes.' },
              { bars: [{ lane: 0, from: 1, to: 7, label: 'Doze', tone: 'warm' }, { lane: 2, from: 1, to: 4, label: 'requests fail', tone: 'err' }], now: 2, say: 'The phone is still and unplugged, so Android enters Doze. Apps lose the network: every request from the loop fails.' },
              { bars: [{ lane: 1, from: 1.6, to: 1.75, tone: 'ok' }, { lane: 1, from: 3, to: 3.15, tone: 'ok' }, { lane: 1, from: 5.6, to: 5.75, tone: 'ok' }], marks: [{ at: 1.6, label: 'window', tone: 'ok' }, { at: 3, label: '', tone: 'ok' }, { at: 5.6, label: '', tone: 'ok' }], now: 5.75, say: 'Now and then Doze opens a short maintenance window, and waiting work runs with the network back. The windows come further apart as the night goes on.' },
              { marks: [{ at: 4, label: 'process ended', tone: 'err' }], now: 4, say: 'At 03:00 Android needs memory and ends Recipes’ process. The loop ends with it, without a word. In the window after it, nothing of Recipes runs.' },
              { bars: [{ lane: 0, from: 7, to: 8, label: 'awake', tone: 'ok' }, { lane: 1, from: 7, to: 8, label: 'on', tone: 'ok' }], marks: [{ at: 7, label: 'picked up', tone: 'accent' }], now: 8, say: 'At 06:00 Lin picks the phone up and Doze ends. Recipes shows yesterday’s list until she opens it. Work handed to Android itself, not a loop of your own, would have run in one of those windows.' },
            ],
          });
        },
        code: `# Put the emulator into Doze now, instead of waiting an hour
adb shell dumpsys battery unplug          # act as if the charger is out
adb shell dumpsys deviceidle force-idle   # enter Doze at once
# Now forced in to deep idle mode
# (If it says "Unable to go deep idle; not enabled": adb shell dumpsys deviceidle enable)

# ...use Recipes: requests fail, scheduled work waits...

adb shell dumpsys deviceidle unforce      # leave Doze
adb shell dumpsys battery reset           # back to the real charger state`,
        remember: 'Apps you aren’t looking at can lose their process, and in Doze they lose the network. Hand work to Android instead of keeping loops alive.',
        terms: [
          { term: 'background work', def: 'Work an app does while the user isn’t looking at it. Android decides when it may run.' },
          { term: 'Doze', def: 'A deep sleep for a phone that is unplugged, still and dark for a while: no network for apps, and scheduled work and alarms wait.' },
          { term: 'maintenance window', def: 'A short break in Doze where waiting work runs and apps get the network back. The windows get rarer the longer Doze lasts.' },
          { term: 'App Standby Bucket', def: 'Android’s ranking of an app by how recently and often it is used: active, working set, frequent, rare, restricted. Rarer buckets get fewer turns.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Put the emulator into Doze right now.', code: `adb shell dumpsys battery unplug
adb shell [[dumpsys]] deviceidle [[force-idle]]`, why: '<code>dumpsys</code> talks to Android’s parts; <code>deviceidle</code> is the part that runs Doze, and <code>force-idle</code> sends the phone into it at once.' },
          { type: 'bug', prompt: 'This should put the emulator into Doze, but it doesn’t. Tap the wrong line.', code: `adb shell dumpsys battery unplug
adb shell dumpsys deviceidle unforce
# ...test Recipes in Doze...`, bug: 1, fix: 'adb shell dumpsys deviceidle force-idle', why: '<code>unforce</code> ends Doze. To start it, use <code>force-idle</code>.' },
        ],
        quiz: [
          { q: 'Which of these ends Doze?', options: ['A new recipe on the server', 'Lin picks the phone up or plugs it in', 'Recipes asks for the network again'], a: 1, why: 'Doze ends when the phone moves, the screen turns on or the charger is plugged in. Apps can’t end it themselves.' },
          { q: 'During Doze, when does the work apps scheduled get to run?', options: ['In short maintenance windows that come further apart over time', 'Every 5 minutes, as before', 'Never, until the phone is charged'], a: 0, why: 'Doze opens maintenance windows now and then. Waiting work runs in them, with the network back.' },
          { q: 'Lin hasn’t opened Recipes for weeks. What happens to its background work?', options: ['Nothing changes', 'Android deletes the app', 'It moves to a rarer standby bucket and gets fewer turns'], a: 2, why: 'Buckets follow how often the app is used. A rarely used app gets fewer turns; in the restricted bucket, about once a day.' },
        ],
        docs: [['Optimize for Doze and App Standby', 'https://developer.android.com/training/monitoring-device-state/doze-standby'], ['App Standby Buckets', 'https://developer.android.com/topic/performance/appstandby']],
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'workmanager',
        title: 'WorkManager',
        tagline: 'Book a job with Android, say what it needs, and it runs when the moment is right, even after a restart.',
        goals: ['Write a CoroutineWorker that reports success or asks to retry', 'Book a nightly sync that needs Wi-Fi and a charger', 'Book it only once, however often the app starts'],
        level: 'intermediate', introduces: ['WorkManager', 'CoroutineWorker', 'WorkerParameters', 'doWork', 'Result', 'Constraints', 'setRequiredNetworkType', 'NetworkType', 'UNMETERED', 'setRequiresCharging', 'setConstraints', 'PeriodicWorkRequestBuilder', 'TimeUnit', 'enqueueUniquePeriodicWork', 'ExistingPeriodicWorkPolicy', 'KEEP'],
        body: `
<p>Recipes should fetch new recipes once a night, so Lin’s list is fresh in the morning. It doesn’t matter exactly when, but it must happen, and it should wait for Wi-Fi and a charger so it costs Lin no mobile data and no battery. <em>WorkManager</em> is the Jetpack library for that kind of job. You describe the job and what it needs, and WorkManager saves the request in its own small database and asks Android to run it at a good moment, in a Doze maintenance window if need be. Closing the app or restarting the phone doesn’t lose it.</p>
<p>The job itself is a <em>worker</em>: a class that extends <code>CoroutineWorker</code> and overrides <code>suspend fun doWork(): Result</code>. Its answer tells WorkManager how it went: <code>Result.success()</code> means done, <code>Result.retry()</code> means “try again later” (after 30 seconds, then twice as long each time), and <code>Result.failure()</code> means give up. A worker gets about 10 minutes; a nightly refresh needs seconds. WorkManager, not your code, creates the worker when the job is due, and passes it a <code>Context</code> and <code>WorkerParameters</code> (its id and settings). <code>SyncWorker</code> also needs <code>RecipeRepository</code>, which WorkManager can’t supply by itself; the next lesson brings in Hilt for that. This one is about when the job runs.</p>
<p>Next, the request. <code>Constraints.Builder()</code> lists the conditions: <code>setRequiredNetworkType(NetworkType.UNMETERED)</code> means a network that doesn’t charge per megabyte, like Wi-Fi, and <code>setRequiresCharging(true)</code> a charger. If one stops holding during a run, WorkManager stops the worker and runs it again later. <code>PeriodicWorkRequestBuilder&lt;SyncWorker&gt;(1, TimeUnit.DAYS)</code> repeats the job about once a day; <code>TimeUnit</code> names the unit, and 15 minutes is the shortest repeat WorkManager allows. Book it with <code>WorkManager.getInstance(this).enqueueUniquePeriodicWork("nightly-sync", ExistingPeriodicWorkPolicy.KEEP, request)</code>: the name makes it <em>unique work</em>, and <code>KEEP</code> leaves an existing booking alone, so calling it on every app start books it only once.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['charger', 'Wi-Fi', 'SyncWorker'],
            span: 24,
            unit: 'h',
            predict: {
              q: 'The request runs once a day and needs Wi-Fi and a charger. Lin’s phone is on battery all day; at 23:00 she plugs it in at home, on Wi-Fi. When does the first sync run?',
              options: ['At 08:00, when it was booked', 'Soon after 23:00, when both conditions hold', 'Never: Recipes was closed all day'],
              a: 1,
              why: 'WorkManager waits until every constraint holds. The app doesn’t need to be open: the booking lives in WorkManager’s database.',
            },
            frames: [
              { now: 0, say: 'A day on Lin’s phone: 0 h is 08:00. She opens Recipes, and <code>RecipesApp.onCreate</code> books <code>"nightly-sync"</code>: once a day, Wi-Fi and a charger.' },
              { bars: [{ lane: 1, from: 0, to: 1, label: 'home', tone: 'ok' }], now: 6, say: 'She leaves home and spends the day on mobile data and battery. The conditions don’t hold, so WorkManager waits. Recipes is closed by now; that is fine.' },
              { bars: [{ lane: 1, from: 12, to: 24, label: 'home Wi-Fi', tone: 'ok' }], now: 12, say: 'At 20:00 she is home on Wi-Fi, but the phone is still on battery. One condition out of two: still waiting.' },
              { bars: [{ lane: 0, from: 15, to: 23, label: 'charging', tone: 'ok' }, { lane: 2, from: 15.2, to: 15.6, label: 'doWork', tone: 'accent' }], now: 15.6, say: 'At 23:00 she plugs it in. Both conditions hold, so WorkManager creates <code>SyncWorker</code> and runs <code>doWork()</code>: the repository refreshes.' },
              { marks: [{ at: 15.6, label: 'success()', tone: 'ok' }], say: '<code>doWork()</code> returns <code>Result.success()</code>. The next run is due about a day later.' },
              { marks: [{ at: 18, label: 'restart', tone: 'warm' }], now: 18, say: 'At 02:00 the phone restarts for an update. The booking is saved in WorkManager’s database, so tomorrow night’s sync is still on.' },
            ],
          });
        },
        code: `// app/build.gradle.kts, in dependencies { }:
// implementation("androidx.work:work-runtime-ktx:2.12.0")

// data/SyncWorker.kt: the job
class SyncWorker(
    context: Context,                            // from WorkManager
    params: WorkerParameters,                    // from WorkManager
    private val repository: RecipeRepository,    // from Hilt: the next lesson
) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        try {
            repository.refresh(force = true)
            return Result.success()
        } catch (e: IOException) {
            return Result.retry()                // the network dropped: try again later
        }
    }
}

// RecipesApp.kt: book the nightly sync each time the app starts
@HiltAndroidApp
class RecipesApp : Application() {
    override fun onCreate() {
        super.onCreate()
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.UNMETERED)   // Wi-Fi, not mobile data
            .setRequiresCharging(true)
            .build()
        val request = PeriodicWorkRequestBuilder<SyncWorker>(1, TimeUnit.DAYS)
            .setConstraints(constraints)
            .build()
        WorkManager.getInstance(this)
            .enqueueUniquePeriodicWork("nightly-sync", ExistingPeriodicWorkPolicy.KEEP, request)
    }
}`,
        remember: 'A worker does the job, constraints say when it may run, and a unique name makes sure it is booked once.',
        terms: [
          { term: 'WorkManager', def: 'A Jetpack library that saves a job and runs it when its conditions hold, even after the app closes or the phone restarts.' },
          { term: 'worker', def: 'The class that does one job. A <code>CoroutineWorker</code> overrides <code>suspend fun doWork(): Result</code>.' },
          { term: 'constraint', def: 'A condition a job waits for, such as a Wi-Fi network (<code>NetworkType.UNMETERED</code>) or a charger.' },
          { term: 'unique work', def: 'A request booked under a name. <code>KEEP</code> leaves an existing booking with that name alone.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Book the sync once a day, and only once, however often the app starts.', code: `val request = PeriodicWorkRequestBuilder<SyncWorker>(1, TimeUnit.[[DAYS]])
    .setConstraints(constraints)
    .build()
WorkManager.getInstance(this)
    .[[enqueueUniquePeriodicWork]]("nightly-sync", ExistingPeriodicWorkPolicy.[[KEEP]], request)`, why: '<code>TimeUnit.DAYS</code> sets the unit of the 1. The name and <code>KEEP</code> make a second call leave the first booking alone.' },
          { type: 'bug', prompt: 'When the network drops during the sync, the night’s refresh is lost and never tried again. Tap the wrong line.', code: `override suspend fun doWork(): Result {
    try {
        repository.refresh(force = true)
        return Result.success()
    } catch (e: IOException) {
        return Result.success()
    }
}`, bug: 5, fix: '        return Result.retry()', why: '<code>success()</code> tells WorkManager the job is done. <code>retry()</code> runs it again after a wait that starts at 30 seconds and doubles each time.' },
        ],
        quiz: [
          { q: '<code>PeriodicWorkRequestBuilder&lt;SyncWorker&gt;(5, TimeUnit.MINUTES)</code>: how often can it run?', options: ['Every 5 minutes', 'At most every 15 minutes', 'Only once'], a: 1, why: '15 minutes is the shortest repeat. WorkManager raises the 5 and warns in Logcat: “Interval duration lesser than minimum allowed value; Changed to 900000” (milliseconds).' },
          { q: 'The phone restarts during the night. What happens to <code>"nightly-sync"</code>?', options: ['It is still booked', 'It is gone until Recipes opens', 'It runs at once, without its constraints'], a: 0, why: 'WorkManager keeps requests in its own database and books them again after a restart.' },
          { q: '<code>RecipesApp.onCreate</code> calls <code>enqueueUniquePeriodicWork("nightly-sync", KEEP, request)</code>, and Recipes starts 10 times. How many syncs are booked?', options: ['Ten', 'None', 'One'], a: 2, why: 'With <code>KEEP</code>, a booking with the same name stays and the new request is ignored.' },
        ],
        docs: [['Getting started with WorkManager', 'https://developer.android.com/develop/background-work/background-tasks/persistent/getting-started'], ['Define work requests', 'https://developer.android.com/develop/background-work/background-tasks/persistent/getting-started/define-work']],
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'workmanager-hilt',
        title: 'WorkManager with Hilt',
        tagline: 'WorkManager builds your workers. Hand it Hilt’s factory, and they get the repository too.',
        goals: ['Mark a worker so Hilt can pass it the repository', 'Give WorkManager Hilt’s factory from RecipesApp', 'Switch off WorkManager’s default set-up in the manifest'],
        level: 'intermediate', introduces: ['HiltWorker', 'AssistedInject', 'Assisted', 'HiltWorkerFactory', 'workManagerConfiguration', 'setWorkerFactory'],
        body: `
<p>Sam runs Recipes with only the last lesson’s code. At 23:00 the job is due, but nothing refreshes, and Logcat (tag <code>WM-WorkerFactory</code>) says <code>Could not instantiate com.example.recipes.data.SyncWorker</code>. WorkManager makes each worker with a <em>worker factory</em>. Its default one can only call a constructor that takes a <code>Context</code> and <code>WorkerParameters</code> and nothing else, so it can’t build a <code>SyncWorker</code> that also wants a <code>RecipeRepository</code>. Hilt has the repository, and androidx.hilt has a factory that asks Hilt for it: <code>HiltWorkerFactory</code>.</p>
<p>First, the worker. Mark the class <code>@HiltWorker</code> and its constructor <code>@AssistedInject</code>, the way <code>@Inject constructor</code> marks the repository. Then mark the two parameters WorkManager supplies <code>@Assisted</code>. It reads as “WorkManager provides these, Hilt the rest”: Hilt fills in <code>RecipeRepository</code> as it would for a ViewModel.</p>
<p>Two more steps so WorkManager uses Hilt’s factory. <code>RecipesApp</code> implements <code>Configuration.Provider</code>, from WorkManager: its <code>workManagerConfiguration</code> property hands WorkManager a configuration made with <code>setWorkerFactory(workerFactory)</code>. The factory itself comes from Hilt through <code>@Inject lateinit var</code>, as in the push track’s messaging service. Last, WorkManager normally sets itself up with its defaults as the app starts, before your code runs. A few lines in the manifest switch that off, so the first <code>WorkManager.getInstance</code> call asks <code>RecipesApp</code> for the configuration instead.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 270,
            nodes: [
              { id: 'wm', label: 'WorkManager<small>the sync is due</small>', x: 50, y: 12 },
              { id: 'def', label: 'Default factory<small>Context, WorkerParameters</small>', x: 24, y: 50, tone: 'muted' },
              { id: 'hilt', label: 'HiltWorkerFactory<small>from RecipesApp</small>', x: 76, y: 50, hidden: true },
              { id: 'worker', label: 'SyncWorker<small>also needs the repository</small>', x: 30, y: 88 },
              { id: 'repo', label: 'RecipeRepository<small>built by Hilt</small>', x: 78, y: 88, tone: 'ok', hidden: true },
            ],
            predict: {
              q: '<code>SyncWorker</code>’s constructor takes a <code>Context</code>, <code>WorkerParameters</code> and a <code>RecipeRepository</code>. WorkManager still uses its default factory. What happens when the sync is due?',
              options: ['The worker runs and the list refreshes', 'Logcat says “Could not instantiate …SyncWorker”, and the sync doesn’t run', 'The app doesn’t build'],
              a: 1,
              why: 'The default factory only knows constructors with a <code>Context</code> and <code>WorkerParameters</code> and nothing else. It has no way to get a repository, so it gives up while the app runs.',
            },
            frames: [
              { hl: ['wm'], say: 'At 23:00 the nightly sync is due. WorkManager needs a <code>SyncWorker</code> object, so it asks its worker factory to make one.' },
              { add: [['wm', 'def', '', 'accent']], hl: ['def'], say: 'With nothing set up, that is WorkManager’s default factory. It can pass a <code>Context</code> and <code>WorkerParameters</code>, nothing more.' },
              { add: [['def', 'worker', 'gives up', 'err']], hl: ['worker'], say: '<code>SyncWorker</code> also asks for a repository. The factory gives up, Logcat says <code>Could not instantiate com.example.recipes.data.SyncWorker</code>, and tonight’s sync doesn’t run.' },
              { remove: [['wm', 'def'], ['def', 'worker']], gone: ['def'], show: ['hilt'], add: [['wm', 'hilt', '', 'accent']], hl: ['hilt'], say: 'Now the manifest lines switch off the default set-up, and <code>RecipesApp</code>’s <code>workManagerConfiguration</code> hands WorkManager <code>HiltWorkerFactory</code>.' },
              { show: ['repo'], add: [['repo', 'hilt', 'from Hilt', 'ok']], hl: ['repo'], say: '<code>@HiltWorker</code> told Hilt about <code>SyncWorker</code>. The factory asks Hilt for the repository, built from its <code>@Inject constructor</code> as always.' },
              { add: [['hilt', 'worker', 'all three', 'ok']], hl: ['worker'], say: 'It calls the <code>@AssistedInject</code> constructor: the two <code>@Assisted</code> values from WorkManager, the repository from Hilt. <code>doWork()</code> runs, and the list refreshes.' },
            ],
          });
        },
        code: `// app/build.gradle.kts, in dependencies { }, next to work-runtime-ktx:
// implementation("androidx.hilt:hilt-work:1.4.0")
// ksp("androidx.hilt:hilt-compiler:1.4.0")

// data/SyncWorker.kt: three marks; doWork() stays the same
@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,                  // from WorkManager
    @Assisted params: WorkerParameters,          // from WorkManager
    private val repository: RecipeRepository,    // from Hilt
) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        try {
            repository.refresh(force = true)
            return Result.success()
        } catch (e: IOException) {
            return Result.retry()
        }
    }
}

// RecipesApp.kt: hand WorkManager Hilt's factory
// Configuration here is androidx.work.Configuration
@HiltAndroidApp
class RecipesApp : Application(), Configuration.Provider {
    @Inject lateinit var workerFactory: HiltWorkerFactory    // Hilt fills it in

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder().setWorkerFactory(workerFactory).build()

    override fun onCreate() {
        super.onCreate()
        // book "nightly-sync" here, as in the last lesson
    }
}

// AndroidManifest.xml, inside <application> (the <manifest> tag needs
// xmlns:tools="http://schemas.android.com/tools"): switch off the default set-up
// <provider
//     android:name="androidx.startup.InitializationProvider"
//     android:authorities="\${applicationId}.androidx-startup"
//     android:exported="false"
//     tools:node="merge">
//     <meta-data
//         android:name="androidx.work.WorkManagerInitializer"
//         android:value="androidx.startup"
//         tools:node="remove" />
// </provider>`,
        remember: 'WorkManager builds your workers: mark the worker @HiltWorker, hand WorkManager HiltWorkerFactory from RecipesApp, and switch off its default set-up in the manifest.',
        mistakes: [
          { title: 'Keeping WorkManager’s default set-up', bad: `// The manifest has no <provider> entry for WorkManager.
// It sets itself up before RecipesApp can hand it Hilt's factory.
// Logcat, tag WM-WorkerFactory, when the sync is due:
// Could not instantiate com.example.recipes.data.SyncWorker`, good: `<provider
    android:name="androidx.startup.InitializationProvider"
    android:authorities="\${applicationId}.androidx-startup"
    android:exported="false"
    tools:node="merge">
    <meta-data
        android:name="androidx.work.WorkManagerInitializer"
        android:value="androidx.startup"
        tools:node="remove" />
</provider>`, why: 'Without these lines WorkManager starts with its default factory, which can only build workers whose constructor takes a <code>Context</code> and <code>WorkerParameters</code> and nothing else. <code>tools:node="remove"</code> switches that set-up off, so WorkManager asks <code>RecipesApp</code> for its configuration.' },
        ],
        terms: [
          { term: 'worker factory', def: 'What WorkManager asks to make a worker. The default one passes only a <code>Context</code> and <code>WorkerParameters</code>; <code>HiltWorkerFactory</code> also gets the rest from Hilt.' },
          { term: 'assisted injection', def: 'Hilt builds an object together with values someone else supplies. <code>@Assisted</code> marks those values; here they come from WorkManager.' },
          { term: 'Configuration.Provider', def: 'An interface from WorkManager. <code>RecipesApp</code> implements it to hand WorkManager its configuration, here with Hilt’s factory.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Mark the worker so Hilt fills in the repository and WorkManager the other two.', code: `@[[HiltWorker]]
class SyncWorker @[[AssistedInject]] constructor(
    @[[Assisted]] context: Context,
    @Assisted params: WorkerParameters,
    private val repository: RecipeRepository,
) : CoroutineWorker(context, params)`, why: '<code>@HiltWorker</code> tells Hilt about the worker, <code>@AssistedInject</code> marks the constructor, and <code>@Assisted</code> marks each value WorkManager passes in.' },
          { type: 'bug', prompt: 'The worker is marked and the manifest lines are in, but Logcat still says <code>Could not instantiate com.example.recipes.data.SyncWorker</code>. Tap the wrong line.', code: `@HiltAndroidApp
class RecipesApp : Application(), Configuration.Provider {
    @Inject lateinit var workerFactory: HiltWorkerFactory

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder().build()
}`, bug: 5, fix: '        get() = Configuration.Builder().setWorkerFactory(workerFactory).build()', why: 'A configuration built without <code>setWorkerFactory</code> uses the default factory again. Hilt filled in <code>workerFactory</code>, but nobody handed it to WorkManager.' },
        ],
        quiz: [
          { q: 'Which values does WorkManager itself pass to <code>SyncWorker</code>’s constructor?', options: ['The <code>Context</code> and <code>WorkerParameters</code>, marked <code>@Assisted</code>', 'The <code>RecipeRepository</code>', 'All three'], a: 0, why: 'WorkManager supplies the two <code>@Assisted</code> values. Everything else, here the repository, comes from Hilt.' },
          { q: '<code>RecipesApp</code> implements <code>Configuration.Provider</code>, but the manifest lines are missing. What happens?', options: ['It works: WorkManager always asks <code>RecipesApp</code>', 'WorkManager sets itself up with its default factory, and <code>SyncWorker</code> can’t be made', 'The app won’t install'], a: 1, why: 'The default set-up runs as the app starts and wins. The manifest lines switch it off, so your configuration takes effect.' },
          { q: 'Android Studio offers two classes named <code>Configuration</code> to import. Which one does <code>RecipesApp</code> need?', options: ['<code>android.content.res.Configuration</code>', '<code>androidx.work.Configuration</code>'], a: 1, why: '<code>Provider</code> and <code>Builder</code> belong to WorkManager’s <code>androidx.work.Configuration</code>. The other one describes the screen and language, and has neither.' },
        ],
        docs: [['Hilt and WorkManager', 'https://developer.android.com/training/dependency-injection/hilt-jetpack'], ['Custom WorkManager configuration', 'https://developer.android.com/develop/background-work/background-tasks/persistent/configuration/custom-configuration']],
      },
      // 4 ─────────────────────────────────────────────
      {
        id: 'fgs',
        title: 'Foreground services',
        tagline: 'Work the user started and is waiting for keeps going, with a notification that says so.',
        goals: ['Tell when a foreground service fits better than WorkManager', 'Write a service that shows its notification and stops when it is done', 'Declare its type and permissions, and start it from a tap'],
        level: 'intermediate', introduces: ['LifecycleService', 'onStartCommand', 'ServiceCompat', 'startForeground', 'ServiceInfo', 'FOREGROUND_SERVICE_TYPE_DATA_SYNC', 'START_NOT_STICKY', 'stopSelf', 'onTimeout', 'startForegroundService', 'foregroundServiceType', 'FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_DATA_SYNC', 'LocalContext'],
        body: `
<p>Lin is going to a cabin with no signal. In Explore she taps <b>Save for offline</b>: Recipes should download the 500 most popular recipes, which takes a few minutes, while she switches to her map app. A periodic WorkManager request like the nightly sync waits for a good moment, but Lin wants this now and is watching it. (WorkManager can also run such work in a foreground service; the docs on long-running workers show how.) A coroutine in the ViewModel would end if Android ended the process. Work the user started and is waiting for belongs in a <em>foreground service</em>.</p>
<p>A service is the component from the manifest lesson that works without a screen. In the foreground, it shows a notification the whole time it runs, so the user knows (and can stop it from the Task Manager in the notification shade), and Android treats the app as in use: it almost never ends its process to free memory. <code>LifecycleService</code> is a service with a <code>lifecycleScope</code>. Mark it <code>@AndroidEntryPoint</code>, as you did the messaging service in the push track, and Hilt fills its <code>@Inject lateinit var</code> properties as it starts. Android calls <code>onStartCommand</code> when the service starts. Within a few seconds it must call <code>ServiceCompat.startForeground(this, 1, notification, type)</code> with the notification’s id (not 0), or Android stops the app with a <code>ForegroundServiceDidNotStartInTimeException</code>. When the work is done, <code>stopSelf()</code> ends the service and removes the notification. Return <code>START_NOT_STICKY</code> so Android doesn’t restart it by itself if it does end it.</p>
<p>Every foreground service has a <em>type</em> that says what it does: <code>dataSync</code> for transfers like this one, <code>mediaPlayback</code>, <code>location</code>, <code>camera</code> and a few more. Apps that target Android 14 or higher declare it in the manifest with <code>android:foregroundServiceType</code>, and need the <code>FOREGROUND_SERVICE</code> permission plus the type’s own, here <code>FOREGROUND_SERVICE_DATA_SYNC</code>; without them, starting it throws. In apps that target Android 15 or higher, <code>dataSync</code> services may run 6 hours in any 24 hours in all; the count starts again when the user opens the app. Then Android calls <code>onTimeout</code>, and the service has a few seconds to call <code>stopSelf()</code>.</p>
<p>Start the service from the tap, with <code>ContextCompat.startForegroundService(context, intent)</code>. In a composable, <code>LocalContext.current</code> gives you the <code>Context</code>. Since Android 12, an app in the background may not start a foreground service; it gets a <code>ForegroundServiceStartNotAllowedException</code>, apart from a few cases such as a high-priority FCM message or an exact alarm. If the user turned notifications off, the service still runs, and its notice shows only in the Task Manager. If nobody is waiting for the work, use WorkManager instead.</p>`,
        visual(el) {
          const explore = `<div class="ui-m-bar">Explore</div><div class="ui-m-body"><div class="ui-m-row"><div>Shakshuka · 25 min</div></div><div class="ui-m-row"><div>Pad thai · 30 min</div></div><div class="ui-m-row"><div>Ratatouille · 50 min</div></div><span class="ui-m-btn save">Save for offline</span></div>`;
          const note = '<div class="ui-m-card"><b>Saving Explore recipes for offline</b><span class="ui-m-muted">Recipes</span></div>';
          const shade = `<div class="ui-m-body">${note}</div>${explore}`;
          const maps = (n = '') => `<div class="ui-m-body" style="background:var(--sunk)">${n}<div class="ui-m-center ui-m-muted">Map app</div></div>`;
          Lab.ui.phone(el, {
            logTitle: 'What runs',
            predict: {
              q: 'Lin taps <b>Save for offline</b> and switches to her map app. The download takes 4 minutes. What does she see in the meantime?',
              options: ['Nothing: the download stops when she leaves Recipes', 'A Recipes notification that stays until the download is done', 'Recipes keeps jumping back to the front'],
              a: 1,
              why: 'A foreground service shows its notification the whole time it runs, and the download goes on while Lin uses another app.',
            },
            frames: [
              { screen: explore, say: 'Explore in Recipes, on screen. Lin is about to leave for a cabin with no signal.' },
              { tap: '.save', log: 'startForegroundService(OfflineService)', say: 'She taps <b>Save for offline</b>. The app is on screen, so it may start a foreground service.' },
              { screen: shade, log: 'onStartCommand → startForeground(…, DATA_SYNC)', say: 'Within a few seconds <code>onStartCommand</code> calls <code>startForeground</code> with the notification and the <code>dataSync</code> type. The notice appears.' },
              { screen: maps(note), log: 'saving page 9 of 25…', say: 'Lin switches to her map app. Recipes isn’t on screen any more, but the service keeps downloading, and the notification stays.' },
              { screen: maps(), log: 'stopSelf()', say: 'All 25 pages are saved in Room. <code>stopSelf()</code> ends the service, and its notification goes away.' },
              { log: 'ForegroundServiceStartNotAllowedException', say: 'Had Recipes tried to start the service on its own while in the background, say from the nightly worker, Android would have refused with this exception.' },
            ],
          });
        },
        code: `// AndroidManifest.xml
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
// inside <application>:
// <service
//     android:name=".data.OfflineService"
//     android:foregroundServiceType="dataSync"
//     android:exported="false" />

// app/build.gradle.kts: implementation("androidx.lifecycle:lifecycle-service:2.11.0")

@AndroidEntryPoint
class OfflineService : LifecycleService() {
    @Inject lateinit var repository: RecipeRepository

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        val notification = NotificationCompat.Builder(this, "downloads")   // channel made at app start
            .setSmallIcon(R.drawable.ic_download)
            .setContentTitle("Saving Explore recipes for offline")
            .build()
        // first thing, within a few seconds:
        ServiceCompat.startForeground(this, 1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
        lifecycleScope.launch {
            try {
                repository.saveExploreForOffline()   // downloads 25 pages into Room
            } catch (e: IOException) {
                // signal lost: the pages saved so far stay saved
            }
            stopSelf()                               // done: the notification goes away
        }
        return START_NOT_STICKY
    }

    override fun onTimeout(startId: Int, fgsType: Int) {   // Android 15+: the 6 hours are used up
        stopSelf()
    }
}

// ExploreScreen: start it from the tap, while Recipes is on screen
val context = LocalContext.current
Button(onClick = {
    ContextCompat.startForegroundService(context, Intent(context, OfflineService::class.java))
}) { Text("Save for offline") }`,
        remember: 'Foreground service: started from the user’s tap, shows a notification at once, has a declared type, and stops itself when done.',
        terms: [
          { term: 'foreground service', def: 'A service that shows a notification while it works, so it keeps running when the user leaves the app. For work the user is waiting for.' },
          { term: 'foreground service type', def: 'What the service does, such as <code>dataSync</code> or <code>mediaPlayback</code>. Declared with <code>android:foregroundServiceType</code>, with a permission of its own.' },
          { term: 'Task Manager', def: 'The list of running foreground services at the bottom of the notification shade, where the user can stop them.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare a foreground service that downloads data, with both permissions it needs.', code: `<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.[[FOREGROUND_SERVICE_DATA_SYNC]]" />
<service
    android:name=".data.OfflineService"
    android:foregroundServiceType="[[dataSync]]"
    android:exported="false" />`, why: 'Every foreground service needs <code>FOREGROUND_SERVICE</code> and its type’s own permission. The type in the manifest says what the service does.' },
          { type: 'bug', prompt: 'The manifest says <code>foregroundServiceType="dataSync"</code>, but the service crashes with an <code>IllegalArgumentException</code> as it starts. Tap the wrong line.', code: `override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    super.onStartCommand(intent, flags, startId)
    val notification = NotificationCompat.Builder(this, "downloads")
        .setSmallIcon(R.drawable.ic_download)
        .setContentTitle("Saving Explore recipes for offline")
        .build()
    ServiceCompat.startForeground(this, 1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
    lifecycleScope.launch { repository.saveExploreForOffline(); stopSelf() }
    return START_NOT_STICKY
}`, bug: 6, fix: '    ServiceCompat.startForeground(this, 1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)', why: 'The type passed to <code>startForeground</code> must be one the manifest declares. A type the manifest doesn’t list throws <code>IllegalArgumentException</code>.' },
        ],
        quiz: [
          { q: 'Since Android 12, Recipes tries to start <code>OfflineService</code> while it is in the background, and no exception to the rule applies. What happens?', options: ['It starts and shows its notification', '<code>ForegroundServiceStartNotAllowedException</code>', 'It waits until Lin opens Recipes'], a: 1, why: 'An app in the background may not start a foreground service, apart from a few cases such as a high-priority FCM message or an exact alarm.' },
          { q: 'Lin turned notifications off for Recipes. Can <code>OfflineService</code> still run?', options: ['Yes; its notice shows only in the Task Manager', 'No, it needs the notification permission', 'Only on Wi-Fi'], a: 0, why: 'A foreground service doesn’t need the notification permission to start. Without it, its notice is hidden from the shade but still listed in the Task Manager.' },
          { q: 'Which job fits a foreground service best?', options: ['Refreshing recipes once a night', 'A download Lin just started and is waiting for', 'Noticing that the phone’s language changed'], a: 1, why: 'Foreground services are for work the user started and is watching. A nightly refresh can wait, so it belongs in WorkManager.' },
        ],
        docs: [['Foreground service types', 'https://developer.android.com/develop/background-work/services/fgs/service-types'], ['Restrictions on starting a foreground service from the background', 'https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start']],
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'receivers',
        title: 'Broadcast receivers',
        tagline: 'Android announces events like a new language or airplane mode. A receiver is how your app hears them.',
        goals: ['Write a receiver in the manifest that wakes the app for a system event', 'Hand longer work from onReceive to WorkManager', 'Listen to an event only while a screen is open, and stop listening when it closes'],
        level: 'intermediate', introduces: ['BroadcastReceiver', 'onReceive', 'LOCALE_CHANGED', 'OneTimeWorkRequestBuilder', 'enqueueUniqueWork', 'ExistingWorkPolicy', 'IntentFilter', 'ACTION_AIRPLANE_MODE_CHANGED', 'getBooleanExtra', 'registerReceiver', 'unregisterReceiver', 'RECEIVER_NOT_EXPORTED', 'RECEIVER_EXPORTED'],
        body: `
<p>Ada moves abroad and switches her phone to another language. Recipe titles come from the server in the phone’s language, so Recipes should fetch them again now, not tonight. But Recipes is closed. How would it even know? Android announces events like this one to every app that wants to hear them. The announcement is a <em>broadcast</em>, an intent sent to many apps at once, and a <em>broadcast receiver</em> is the component that listens.</p>
<p>A receiver is a class that extends <code>BroadcastReceiver</code> and overrides <code>onReceive(context, intent)</code>. List it in the manifest with <code>&lt;receiver&gt;</code> and an intent filter for <code>android.intent.action.LOCALE_CHANGED</code>, and Android starts your app for it even when it is closed. Use <code>android:exported="false"</code>: Android itself can still reach it, other apps can’t. Since Android 8, a manifest receiver hears only a short list of <em>implicit broadcasts</em>, the ones sent to every app, so that one event can’t wake hundreds of apps at once. <code>LOCALE_CHANGED</code> is on the list, like <code>BOOT_COMPLETED</code> (the phone finished starting) and <code>TIMEZONE_CHANGED</code>.</p>
<p><code>onReceive</code> runs on the main thread, so it must return within a few seconds, and once it returns, Android may end the process. So hand anything longer to WorkManager. For a job that runs once, <code>OneTimeWorkRequestBuilder&lt;SyncWorker&gt;().build()</code> makes the request, and <code>enqueueUniqueWork("language-sync", ExistingWorkPolicy.REPLACE, request)</code> books it; <code>REPLACE</code> cancels an earlier one with that name, even one already running, and books the new one.</p>
<p>Some events, like airplane mode, aren’t on the list, and some only matter while a screen is open. For those, register a receiver in code: <code>ContextCompat.registerReceiver(context, receiver, IntentFilter(Intent.ACTION_AIRPLANE_MODE_CHANGED), ContextCompat.RECEIVER_NOT_EXPORTED)</code>, inside a <code>DisposableEffect</code>, with <code>context.unregisterReceiver(receiver)</code> in <code>onDispose</code>. The last argument is required: <code>RECEIVER_NOT_EXPORTED</code> when only Android or your own app sends the broadcast, <code>RECEIVER_EXPORTED</code> when other apps send it (a few system events, such as Bluetooth ones, come from parts of Android that count as other apps; for those the docs say <code>RECEIVER_EXPORTED</code>).</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'os', label: 'Android', sub: 'sends a broadcast' },
              { id: 'man', label: 'Manifest', sub: 'who listens?' },
              { id: 'rcv', label: 'Receiver', sub: 'onReceive' },
              { id: 'wm', label: 'WorkManager', sub: 'runs the job' },
            ],
            predict: {
              q: 'Recipes is closed. Ada switches her phone to another language, and Recipes has a manifest receiver for <code>LOCALE_CHANGED</code>. What happens?',
              options: ['Nothing, until she opens Recipes', 'Android starts Recipes in the background and calls <code>onReceive</code>', 'Recipes opens on screen'],
              a: 1,
              why: 'A manifest receiver is enough for Android to start the app’s process, without a screen, and deliver the broadcast.',
            },
            frames: [
              { at: 'os', packet: 'LOCALE_CHANGED', say: 'Ada picks a new language. Android sends <code>LOCALE_CHANGED</code> to every app that listens for it.' },
              { at: 'man', mark: { man: 'ok' }, say: 'Recipes’ manifest lists <code>LanguageReceiver</code> for it, and this broadcast is on the short list. Recipes is closed, so Android starts its process, with no screen.' },
              { at: 'rcv', mark: { rcv: 'ok' }, say: '<code>onReceive</code> runs on the main thread. Downloading here would be too slow, so it only books a job.' },
              { at: 'wm', mark: { wm: 'ok' }, say: '<code>enqueueUniqueWork("language-sync", …)</code> hands the refresh to WorkManager, and <code>onReceive</code> returns. The sync runs at once; if there is no network yet, <code>retry()</code> tries again later.' },
              { at: 'os', packet: 'AIRPLANE_MODE', tone: 'warm', mark: { man: false, rcv: false, wm: false }, say: 'Later Ada turns on airplane mode. Android sends <code>ACTION_AIRPLANE_MODE_CHANGED</code>, which is not on the short list.' },
              { at: 'man', tone: 'err', mark: { man: 'err' }, say: 'A manifest receiver would never hear it. With Recipes closed, nothing happens, and that is fine: there is no screen to update.' },
              { at: 'rcv', tone: 'ok', mark: { rcv: 'ok' }, say: 'With the recipe list open, the receiver that <code>DisposableEffect</code> registered hears it, and the screen says it is showing saved recipes. When the screen closes, <code>onDispose</code> unregisters it.' },
            ],
          });
        },
        code: `// AndroidManifest.xml, inside <application>:
// <receiver android:name=".data.LanguageReceiver" android:exported="false">
//     <intent-filter>
//         <action android:name="android.intent.action.LOCALE_CHANGED" />
//     </intent-filter>
// </receiver>

class LanguageReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // main thread, a few seconds at most: only book the work
        val request = OneTimeWorkRequestBuilder<SyncWorker>().build()
        WorkManager.getInstance(context)
            .enqueueUniqueWork("language-sync", ExistingWorkPolicy.REPLACE, request)
    }
}

// Airplane mode can't be heard from the manifest: listen while the screen is open
class AirplaneReceiver(private val onChange: (Boolean) -> Unit) : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        onChange(intent.getBooleanExtra("state", false))   // true: airplane mode is on
    }
}

@Composable
fun AirplaneNote() {
    val context = LocalContext.current
    var airplane by remember { mutableStateOf(false) }   // only hears changes from now on
    DisposableEffect(Unit) {
        val receiver = AirplaneReceiver { on -> airplane = on }
        val filter = IntentFilter(Intent.ACTION_AIRPLANE_MODE_CHANGED)
        ContextCompat.registerReceiver(context, receiver, filter, ContextCompat.RECEIVER_NOT_EXPORTED)
        onDispose {
            context.unregisterReceiver(receiver)
        }
    }
    if (airplane) {
        Text("Airplane mode: showing saved recipes")
    }
}`,
        remember: 'Manifest receivers wake the app for a few system events; receivers registered in code listen while a screen is open. Either way, keep onReceive short.',
        terms: [
          { term: 'broadcast', def: 'An intent Android or an app sends to every app that listens, such as <code>LOCALE_CHANGED</code> when the language changes.' },
          { term: 'broadcast receiver', def: 'A component that hears broadcasts: a class that extends <code>BroadcastReceiver</code>, listed in the manifest or registered in code.' },
          { term: 'implicit broadcast', def: 'A broadcast sent to every app rather than to one. Since Android 8, manifest receivers hear only a short list of them.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make Recipes hear that the phone’s language changed, even when it is closed.', code: `<receiver android:name=".data.LanguageReceiver" android:exported="false">
    <intent-filter>
        <action android:name="android.intent.action.[[LOCALE_CHANGED]]" />
    </intent-filter>
</receiver>

class LanguageReceiver : [[BroadcastReceiver]]() {
    override fun [[onReceive]](context: Context, intent: Intent) {
        // book the refresh with WorkManager
    }
}`, why: 'The intent filter names the broadcast. The class extends <code>BroadcastReceiver</code>, and Android calls its <code>onReceive</code>.' },
          { type: 'bug', prompt: 'Lin turns the phone a few times with the recipe list open, and Logcat shows: <code>Activity com.example.recipes.MainActivity has leaked IntentReceiver com.example.recipes.ui.AirplaneReceiver@8c3f2a1 that was originally registered here. Are you missing a call to unregisterReceiver()?</code> Tap the wrong line.', code: `DisposableEffect(Unit) {
    val receiver = AirplaneReceiver { on -> airplane = on }
    val filter = IntentFilter(Intent.ACTION_AIRPLANE_MODE_CHANGED)
    ContextCompat.registerReceiver(context, receiver, filter, ContextCompat.RECEIVER_NOT_EXPORTED)
    onDispose { }
}`, bug: 4, fix: '    onDispose { context.unregisterReceiver(receiver) }', why: 'Each turn ends the Activity and builds a new one, and <code>onDispose</code> runs, but here it does nothing. The old receiver is still registered on the old Activity, so Android removes it and logs the leak. Unregister it in <code>onDispose</code>, when the screen leaves.' },
        ],
        quiz: [
          { q: 'Why can’t a manifest receiver hear <code>ACTION_AIRPLANE_MODE_CHANGED</code>?', options: ['Airplane mode switches all apps off', 'It needs the INTERNET permission', 'Since Android 8, manifest receivers hear only a short list of implicit broadcasts'], a: 2, why: 'Most broadcasts sent to every app reach only receivers registered in code, so one event can’t wake hundreds of apps.' },
          { q: '<code>onReceive</code> needs to download the recipes again. What should it do?', options: ['Download them right there', 'Book a WorkManager request and return', 'Wait with a loop until the network is back'], a: 1, why: '<code>onReceive</code> runs on the main thread and must return within seconds, and the process may end once it returns. WorkManager finishes the job.' },
          { q: 'You call <code>ContextCompat.registerReceiver(context, receiver, filter, 0)</code>. What happens?', options: ['It throws <code>IllegalArgumentException</code>: “One of either RECEIVER_EXPORTED or RECEIVER_NOT_EXPORTED is required”', 'It works and receives every broadcast', 'It registers but never receives anything'], a: 0, why: 'The flag is required. Pick <code>RECEIVER_NOT_EXPORTED</code> when only Android or your own app sends the broadcast.' },
        ],
        docs: [['Broadcasts overview', 'https://developer.android.com/develop/background-work/background-tasks/broadcasts'], ['Implicit broadcast exceptions', 'https://developer.android.com/develop/background-work/background-tasks/broadcasts/broadcast-exceptions']],
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'alarms',
        title: 'Alarms',
        tagline: 'When it has to happen at 45:00 sharp, even with the phone asleep, set an exact alarm.',
        goals: ['Tell when an app needs an exact alarm and when an inexact one is enough', 'Set an exact alarm that fires a receiver, even in Doze', 'Check the exact alarm permission and send the user to turn it on'],
        level: 'intermediate', introduces: ['AlarmManager', 'AlarmManagerCompat', 'canScheduleExactAlarms', 'setExactAndAllowWhileIdle', 'setAndAllowWhileIdle', 'RTC_WAKEUP', 'getBroadcast', 'FLAG_UPDATE_CURRENT', 'SCHEDULE_EXACT_ALARM', 'USE_EXACT_ALARM', 'ACTION_REQUEST_SCHEDULE_EXACT_ALARM'],
        body: `
<p>Lin puts the bean stew on, taps <b>Start 45-minute timer</b>, locks the phone and goes out to the garden. At 45:00 the phone must ring, not some time in the next hour. A coroutine with <code>delay</code> ends with the process, WorkManager picks its own moment, and Doze holds back ordinary scheduled work. For a fixed time, Android has <code>AlarmManager</code>: you give it a time and an intent, and Android sends the intent at that time, even if your app isn’t running.</p>
<p>Most alarms are <em>inexact</em>: <code>setAndAllowWhileIdle</code> never fires early, but may fire later, so Android can bundle alarms from many apps and wake the phone less. An <em>exact alarm</em> fires on time: <code>setExactAndAllowWhileIdle</code> rings even in Doze (in Doze, at most one such alarm per app every 9 minutes). The time here is clock time: <code>System.currentTimeMillis()</code> plus 45 minutes, in milliseconds, and <code>RTC_WAKEUP</code> says “this is clock time; wake the phone for it”. <code>AlarmManagerCompat</code> has the same calls, plus a permission check that also works before Android 12.</p>
<p>Exact alarms cost battery, so they need the <code>SCHEDULE_EXACT_ALARM</code> permission, and since Android 14 it starts off for newly installed apps. The user turns it on under <b>Alarms &amp; reminders</b> in Settings. Check <code>AlarmManagerCompat.canScheduleExactAlarms(alarmManager)</code> first: setting an exact alarm without it throws a <code>SecurityException</code>. If it is off, explain why the timer needs it, then open that page with <code>Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:\${context.packageName}"))</code>; the <code>package:</code> address takes Lin straight to Recipes’ switch, not a list of all apps; until then, fall back to an inexact alarm. <code>USE_EXACT_ALARM</code> is granted at install, but Google Play allows it only for alarm clock and calendar apps, not for Recipes.</p>
<p>Android sends a <code>PendingIntent</code>, as with notification taps in the push track, but made with <code>PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)</code>, because it goes to <code>TimerReceiver</code>, a manifest receiver that posts “Bean stew is ready”. <code>or</code> joins the two flags, and <code>FLAG_UPDATE_CURRENT</code> puts the new title into the <code>PendingIntent</code> if one with that request code already exists. Two more rules: setting an alarm with the same <code>PendingIntent</code> again replaces the old one; and alarms are cleared when the phone restarts. So save the end time, for example in DataStore, and set the alarm again from a <code>BOOT_COMPLETED</code> receiver (that needs the <code>RECEIVE_BOOT_COMPLETED</code> permission). That is why the time is clock time: it still means the same moment after a restart, and an alarm for a time that has passed rings at once.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['phone', 'inexact', 'exact'],
            span: 60,
            unit: 'min',
            predict: {
              q: 'The phone is in Doze when the 45 minutes are up. Which alarm rings at 45:00?',
              options: ['Both: every alarm rings on time', 'The exact one, set with <code>setExactAndAllowWhileIdle</code>', 'Neither: nothing runs in Doze'],
              a: 1,
              why: 'An exact alarm that is allowed while idle fires on time even in Doze. An inexact one can be held back to a later moment.',
            },
            frames: [
              { now: 0, say: 'Lin taps Start at minute 0. Two alarms side by side, both for 45:00: an inexact one, and an exact one.' },
              { bars: [{ lane: 0, from: 0, to: 12, label: 'off', tone: 'muted' }, { lane: 0, from: 12, to: 60, label: 'Doze', tone: 'warm' }], now: 30, say: 'She locks the phone (screen off) and goes to the garden. The phone lies still, so after a while it enters Doze.' },
              { bars: [{ lane: 2, from: 45, to: 48, label: '', tone: 'ok' }], marks: [{ at: 45, label: '45:00', tone: 'ok' }], now: 45, say: 'At exactly 45:00 Android wakes the phone, sends the <code>PendingIntent</code>, and <code>TimerReceiver</code> posts “Bean stew is ready”.' },
              { bars: [{ lane: 1, from: 53, to: 56, label: '', tone: 'warm' }], now: 55, say: 'The inexact alarm never fires early, but here it comes 8 minutes late, together with other work. Fine for a reminder, not for a stew.' },
              { marks: [{ at: 0, label: 'permission off', tone: 'err' }], now: 0, say: 'If <b>Alarms &amp; reminders</b> is off, the exact call throws a <code>SecurityException</code>. So check <code>canScheduleExactAlarms</code> first and fall back to the inexact alarm.' },
              { marks: [{ at: 30, label: 'restart', tone: 'err' }], now: 30, say: 'A restart at minute 30 clears both alarms. A <code>BOOT_COMPLETED</code> receiver reads the saved clock time and sets an <code>RTC_WAKEUP</code> alarm for it again: still 45:00.' },
            ],
          });
        },
        code: `// AndroidManifest.xml
// <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
// inside <application>:
// <receiver android:name=".TimerReceiver" android:exported="false" />

class TimerReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val title = intent.getStringExtra("title") ?: "Your dish"
        showReadyNotification(context, title)   // posts "Bean stew is ready", as in the push track
    }
}

fun startTimer(context: Context, title: String, minutes: Int) {
    val alarmManager = context.getSystemService(AlarmManager::class.java)
    val intent = Intent(context, TimerReceiver::class.java).putExtra("title", title)
    val flags = PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT   // new title each time
    val pending = PendingIntent.getBroadcast(context, 0, intent, flags)
    val at = System.currentTimeMillis() + minutes * 60 * 1000    // clock time, in milliseconds
    // save "at" (for example in DataStore), so a BOOT_COMPLETED receiver can set it again
    if (AlarmManagerCompat.canScheduleExactAlarms(alarmManager)) {
        AlarmManagerCompat.setExactAndAllowWhileIdle(alarmManager, AlarmManager.RTC_WAKEUP, at, pending)
    } else {
        // no permission: an inexact alarm, which may ring late
        AlarmManagerCompat.setAndAllowWhileIdle(alarmManager, AlarmManager.RTC_WAKEUP, at, pending)
    }
}

// After explaining why the timer needs it: open Recipes' switch in "Alarms & reminders"
val settings = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:\${context.packageName}"))
context.startActivity(settings)`,
        remember: 'Exact alarms are for times the user set: check the permission, fall back to inexact, and set them again after a restart.',
        mistakes: [
          { title: 'Reaching for USE_EXACT_ALARM', bad: `<!-- granted at install, so no Settings page... -->
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />`, good: `<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<!-- and in code: check canScheduleExactAlarms, fall back to inexact -->`, why: '<code>USE_EXACT_ALARM</code> is meant for alarm clock and calendar apps, and Google Play rejects other apps that declare it. A recipe app with a timer uses <code>SCHEDULE_EXACT_ALARM</code> and lets the user decide.' },
        ],
        terms: [
          { term: 'exact alarm', def: 'An alarm that fires at the time you set. <code>setExactAndAllowWhileIdle</code> fires even in Doze, and needs the exact alarm permission.' },
          { term: 'inexact alarm', def: 'An alarm that never fires early but may fire later, so Android can bundle it with other work. Needs no special permission.' },
          { term: 'clock time', def: 'The time of day in milliseconds, from <code>System.currentTimeMillis()</code>. <code>RTC_WAKEUP</code> alarms use it, so a saved time still means the same moment after a restart.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Set the alarm exactly if the app may, and inexactly if not.', code: `if (AlarmManagerCompat.[[canScheduleExactAlarms]](alarmManager)) {
    AlarmManagerCompat.[[setExactAndAllowWhileIdle]](alarmManager, AlarmManager.RTC_WAKEUP, at, pending)
} else {
    AlarmManagerCompat.setAndAllowWhileIdle(alarmManager, AlarmManager.RTC_WAKEUP, at, pending)
}`, why: 'Check the permission first; without it, the exact call throws a <code>SecurityException</code>. The inexact alarm is the fallback.' },
          { type: 'bug', prompt: 'The timer should ring in 45 minutes, but it rings almost at once. Tap the wrong line.', code: `fun startTimer(context: Context, title: String, minutes: Int) {
    val alarmManager = context.getSystemService(AlarmManager::class.java)
    val intent = Intent(context, TimerReceiver::class.java).putExtra("title", title)
    val pending = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    val at = System.currentTimeMillis() + minutes
    AlarmManagerCompat.setExactAndAllowWhileIdle(alarmManager, AlarmManager.RTC_WAKEUP, at, pending)
}`, bug: 4, fix: '    val at = System.currentTimeMillis() + minutes * 60 * 1000', why: 'The time is in milliseconds. Adding 45 means 45 milliseconds; 45 minutes is <code>45 * 60 * 1000</code>.' },
        ],
        quiz: [
          { q: 'Recipes was installed today on an Android 14 phone. What does <code>canScheduleExactAlarms</code> return before the user does anything?', options: ['<code>true</code>', '<code>false</code>', 'It throws'], a: 1, why: 'Since Android 14, <code>SCHEDULE_EXACT_ALARM</code> starts off for newly installed apps. The user turns it on under Alarms &amp; reminders.' },
          { q: 'Lin starts a 45-minute timer, and the phone restarts 20 minutes later. What happens to the alarm?', options: ['It rings at the right time anyway', 'It rings as soon as the phone is back on', 'It is gone, unless a <code>BOOT_COMPLETED</code> receiver sets it again'], a: 2, why: 'Android clears alarms on restart. Save the end time as clock time, and set the alarm again from a <code>BOOT_COMPLETED</code> receiver.' },
          { q: 'Lin starts a second timer, and <code>startTimer</code> builds the same <code>PendingIntent</code> again. What happens to the first alarm?', options: ['The new alarm replaces it', 'Both ring', 'The second call is ignored'], a: 0, why: 'An alarm set with the same <code>PendingIntent</code> replaces the earlier one, and <code>FLAG_UPDATE_CURRENT</code> gives it the new title. Two timers at once need two different request codes, the <code>0</code> in <code>getBroadcast</code>.' },
        ],
        docs: [['Schedule alarms', 'https://developer.android.com/develop/background-work/services/alarms'], ['Schedule exact alarms are denied by default', 'https://developer.android.com/about/versions/14/changes/schedule-exact-alarms']],
      },
    ],
  });
})();
