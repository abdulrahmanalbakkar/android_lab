/* Media and sensors track (optional). Same shape as tracks/kotlin.js.
   Demos use the visual kit (Lab.ui). Phone screens are built from the kit's .ui-m-* parts plus the md- classes
   below (a camera viewfinder, a shutter button and flash, a hand over the sensor, a location circle). Every class is prefixed md-. */
(() => {
  const css = `
.md-vf { position: relative; flex: 1; min-height: 150px; margin: 0; background: #14161a; display: grid; place-items: center; overflow: hidden; }
.md-vf.md-on { background: radial-gradient(circle at 40% 45%, rgba(242, 196, 109, 0.75), transparent 34%), radial-gradient(circle at 62% 58%, rgba(214, 120, 70, 0.6), transparent 30%), radial-gradient(circle at 50% 50%, rgba(250, 245, 235, 0.35), transparent 62%), #2a2622; }
.md-vf-tag { font: 600 0.7rem var(--mono); color: #f4f4f4; padding: 3px 9px; border-radius: 999px; background: rgba(0, 0, 0, 0.5); }
.md-flash { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.9); }
.md-bottom { display: flex; justify-content: center; padding: 10px; background: #14161a; }
.md-shutter { width: 40px; height: 40px; border-radius: 50%; border: 4px solid rgba(255, 255, 255, 0.85); background: rgba(255, 255, 255, 0.25); }
.md-hand { position: absolute; top: -4px; left: 50%; width: 70px; height: 54px; margin-left: -35px; border-radius: 0 0 35px 35px; background: var(--warm-soft); border: 2px solid var(--warm); }
.md-circle { justify-self: center; width: 120px; height: 120px; border-radius: 50%; border: 2px dashed var(--accent); background: var(--accent-soft); display: grid; place-items: center; font-size: 0.72rem; }
`;

  Lab.addTrack({
    id: 'media',
    title: 'Media and sensors',
    description: 'Play cooking videos with Media3, keep audio going with a media session, take photos and film clips with CameraX, and read sensors and location only while you need them.',
    group: 'Going deeper',
    requires: ['android'],
    css,
    lessons: [
      {
        id: 'exoplayer',
        title: 'Playing video',
        tagline: 'Media3 ExoPlayer loads a video and plays it. You release it when the screen leaves.',
        goals: ['Create an ExoPlayer and give it a video to play', 'Show the video with the Player composable and a play button', 'Release the player when the screen leaves'],
        level: 'intermediate',
        introduces: ['ExoPlayer', 'MediaItem', 'fromUri', 'setMediaItem', 'prepare', 'play', 'pause', 'release', 'Player', 'STATE_IDLE', 'STATE_BUFFERING', 'STATE_READY', 'STATE_ENDED', 'PlayPauseButton', 'UnstableApi', 'aspectRatio'],
        body: `
<p>One step of Ada’s dumpling recipe says “fold the edge into small pleats”. Words don’t help much here, but a 20-second video shows it at once. So each recipe in the Recipes app can have a video link, and the recipe screen should play it.</p>
<p>Jetpack’s video player is Media3 <em>ExoPlayer</em>. <code>ExoPlayer.Builder(context).build()</code> makes a player. In a composable, <code>LocalContext.current</code> gives you the Context. A <code>MediaItem</code> describes what to play: <code>MediaItem.fromUri(videoUrl)</code> makes one from a link. <code>setMediaItem(item)</code> gives it to the player, and <code>prepare()</code> starts loading. <code>play()</code> and <code>pause()</code> do what they say. If you call <code>play()</code> before enough has loaded, the player remembers and starts as soon as it can.</p>
<p>While it works, the player moves through four <em>playback states</em>: <code>Player.STATE_IDLE</code> (nothing loading yet, or stopped), <code>STATE_BUFFERING</code> (waiting for more data), <code>STATE_READY</code> (it can play right away) and <code>STATE_ENDED</code> (it reached the end). <code>Player</code> is the name of the interface every Media3 player implements, ExoPlayer included, and the <code>STATE_...</code> constants live there. It is also the name of a composable from <code>media3-ui-compose-material3</code>: <code>Player(player = player)</code> draws the picture. <code>PlayPauseButton(player)</code> from the same library is a ready-made play/pause button that calls the player for you. <code>Modifier.aspectRatio(16f / 9f)</code> makes the picture 16 parts wide for every 9 parts high, the shape of most videos. Media3 marks these composables as still changing, so you opt in with <code>@OptIn(UnstableApi::class)</code>, as with <code>ExperimentalMaterial3Api</code>.</p>
<p>A player holds a video decoder (the part of the phone that turns the file into pictures, and phones have only a few), memory and a network connection. When the screen leaves, call <code>release()</code>, in the <code>onDispose</code> of a <code>DisposableEffect</code>. A released player can’t be used again. Build it with <code>remember(videoUrl) { ... }</code>: like the key of <code>LaunchedEffect</code>, the key makes a new player when the link changes, and <code>DisposableEffect(player)</code> then releases the old one.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['your code', 'player state', 'screen'],
            span: 10,
            unit: 's',
            predict: {
              q: 'The user taps play while the video is still loading (<code>STATE_BUFFERING</code>). What happens?',
              options: ['It starts by itself as soon as enough has loaded', 'Nothing: they have to tap again later', 'The app crashes'],
              a: 0,
              why: '<code>play()</code> means “play when you are ready”. The player keeps that wish and starts the moment it reaches <code>STATE_READY</code>.',
            },
            frames: [
              { say: 'The recipe screen opens. There is no player yet.' },
              { bars: [{ lane: 0, from: 0, to: 1, label: 'build()', tone: 'accent' }, { lane: 1, from: 0, to: 1, label: 'IDLE', tone: 'muted' }], say: '<code>ExoPlayer.Builder(context).build()</code> makes a player. It starts in <code>STATE_IDLE</code>: nothing is loading.' },
              { bars: [{ lane: 0, from: 1, to: 2, label: 'prepare()', tone: 'accent' }, { lane: 1, from: 1, to: 3, label: 'BUFFERING', tone: 'warm' }], now: 2, say: '<code>setMediaItem</code> and <code>prepare()</code> start loading the video. The state is <code>STATE_BUFFERING</code>.' },
              { bars: [{ lane: 0, from: 2, to: 3, label: 'play()', tone: 'ok' }], now: 3, say: 'Ada taps the <code>PlayPauseButton</code> while it is still loading. Nothing plays yet, but the player remembers.' },
              { bars: [{ lane: 1, from: 3, to: 7, label: 'READY', tone: 'ok' }, { lane: 2, from: 3, to: 7, label: 'playing', tone: 'ok' }], now: 7, say: 'Enough has loaded: <code>STATE_READY</code>. Because play was asked for, the video starts at once.' },
              { bars: [{ lane: 1, from: 7, to: 8, label: 'ENDED', tone: 'muted' }, { lane: 2, from: 7, to: 8, label: 'last frame', tone: 'muted' }], now: 8, say: 'The video reaches its end: <code>STATE_ENDED</code>.' },
              { bars: [{ lane: 0, from: 8, to: 9, label: 'release()', tone: 'err' }, { lane: 2, from: 9, to: 10, label: 'screen gone', tone: 'muted' }], now: 10, say: 'Ada goes back to the list. <code>onDispose</code> calls <code>release()</code>, and the decoder is free for other apps.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
// dependencies {
//     implementation("androidx.media3:media3-exoplayer:1.11.1")
//     implementation("androidx.media3:media3-ui-compose-material3:1.11.1")
// }
// AndroidManifest.xml: <uses-permission android:name="android.permission.INTERNET" />

@OptIn(UnstableApi::class)                         // Player and PlayPauseButton are still changing
@Composable
fun RecipeVideo(videoUrl: String) {
    val context = LocalContext.current             // the Context, inside a composable
    val player = remember(videoUrl) {              // a new link: a new player
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(videoUrl))
            prepare()                               // start loading: BUFFERING, then READY
        }
    }
    DisposableEffect(player) {
        onDispose { player.release() }              // screen left: free the decoder
    }
    Column {
        Player(player = player, modifier = Modifier.fillMaxWidth().aspectRatio(16f / 9f))   // the picture
        PlayPauseButton(player)                                                              // play and pause
    }
}`,
        remember: 'Build it, give it a MediaItem, prepare() it, show it with Player and PlayPauseButton, and release() it in onDispose.',
        mistakes: [
          {
            title: 'A new player on every recomposition',
            bad: `val player = ExoPlayer.Builder(context).build()   // runs again on every recomposition
player.setMediaItem(MediaItem.fromUri(videoUrl))`,
            good: `val player = remember(videoUrl) {
    ExoPlayer.Builder(context).build().apply { setMediaItem(MediaItem.fromUri(videoUrl)) }
}`,
            why: 'The body of a composable runs again and again. Without <code>remember</code>, each run builds another player, and the old ones are never released, so decoders and memory run out.',
          },
        ],
        terms: [
          { term: 'ExoPlayer', def: 'The video and audio player of Jetpack Media3. Build one with <code>ExoPlayer.Builder(context).build()</code>.' },
          { term: 'MediaItem', def: 'A description of one thing to play, such as <code>MediaItem.fromUri(videoUrl)</code>.' },
          { term: 'playback state', def: 'Where the player is: <code>STATE_IDLE</code>, <code>STATE_BUFFERING</code>, <code>STATE_READY</code> or <code>STATE_ENDED</code>.' },
          { term: 'Player', def: 'The interface every Media3 player implements, ExoPlayer included. Also the composable <code>Player(player = ...)</code> that draws the picture.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a player, give it the video and start loading.', code: 'val player = ExoPlayer.[[Builder]](context).build()\nplayer.setMediaItem(MediaItem.[[fromUri]](videoUrl))\nplayer.[[prepare]]()', why: 'The builder makes the player, <code>fromUri</code> makes the MediaItem, and <code>prepare()</code> starts loading.' },
          { type: 'bug', prompt: 'After a few recipes, videos stop playing: the phone has no free decoder. Tap the line.', code: 'DisposableEffect(player) {\n    onDispose { player.pause() }\n}', bug: 1, fix: '    onDispose { player.release() }', why: '<code>pause()</code> only stops the picture. The player still holds its decoder. <code>release()</code> frees it.' },
        ],
        quiz: [
          { q: 'Which state means “waiting for more data”?', options: ['<code>STATE_BUFFERING</code>', '<code>STATE_IDLE</code>', '<code>STATE_ENDED</code>'], a: 0, why: 'Buffering means the player can’t play from where it is yet, because more data must load.' },
          { q: 'Why call <code>release()</code> when the screen leaves?', options: ['To free the decoder, memory and connection for other apps', 'To save the playing position', 'To make the next video load faster'], a: 0, why: 'A player holds scarce parts of the phone. Release gives them back.' },
          { q: 'You released a player. Can you call <code>play()</code> on it again?', options: ['No: build a new player', 'Yes, it starts from the beginning', 'Yes, after <code>prepare()</code>'], a: 0, why: 'A released player must not be used again. Make a new one if you need to play more.' },
        ],
        docs: [['Create a basic media player with ExoPlayer', 'https://developer.android.com/media/media3/exoplayer/hello-world']],
      },

      {
        id: 'session',
        title: 'Media sessions',
        tagline: 'Put the player in a MediaSessionService, and the lock screen, headphones and notification can control it.',
        goals: ['Move the player into a MediaSessionService with a MediaSession', 'Declare the service for media playback in the manifest', 'Control it from a screen with a MediaController'],
        level: 'intermediate',
        introduces: ['MediaSession', 'MediaSessionService', 'onGetSession', 'ControllerInfo', 'mediaPlayback', 'FOREGROUND_SERVICE_MEDIA_PLAYBACK', 'MediaController', 'SessionToken', 'ComponentName', 'buildAsync', 'releaseFuture', 'currentMediaItem'],
        body: `
<p>Lin listens to a recipe’s audio guide while she cooks. Her hands are covered in flour and the phone is locked. She wants to pause with the button on her headphones, and the guide should keep playing when she opens her timer app. With the last lesson’s code, the player lives in the screen: leave the screen, and it is released.</p>
<p>A <em>MediaSession</em> connects a player to the rest of the phone: the media notification, the lock screen, Bluetooth headphones, a watch. They send it play and pause, and it passes them to the player. To keep playing with no screen, the player and the session live in a <code>MediaSessionService</code>, a foreground service made for media. Build both in <code>onCreate</code>, return the session from <code>onGetSession</code>, and release both in <code>onDestroy</code>. Media3 posts the media notification itself and moves the service in and out of the foreground. Media notifications don’t need <code>POST_NOTIFICATIONS</code>. The manifest lines are in the code below: the service type is <code>mediaPlayback</code>, and the service is <code>exported="true"</code> because controllers from outside your app, like the system’s media controls, connect to it.</p>
<p>Your screen talks to the service through a <em>MediaController</em>. <code>ComponentName(context, PlaybackService::class.java)</code> names one part of your app, here the service class, and <code>SessionToken(context, componentName)</code> turns it into the address of its session. <code>MediaController.Builder(context, token).buildAsync()</code> connects in the background. It returns a <em>future</em>: a box the controller arrives in later. <code>future.addListener({ ... }, ContextCompat.getMainExecutor(context))</code> runs your lambda on the main thread when it is ready. The controller is a <code>Player</code> too, so <code>PlayPauseButton(controller)</code> works. When the screen leaves, <code>MediaController.releaseFuture(future)</code> disconnects it, and the service keeps playing.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'ui', label: 'Recipe screen<br><small>MediaController</small>', x: 18, y: 14, hidden: true },
              { id: 'lock', label: 'Lock screen', x: 18, y: 50, hidden: true },
              { id: 'buds', label: 'Headphones', x: 18, y: 86, hidden: true },
              { id: 'session', label: 'MediaSession<br><small>in PlaybackService</small>', x: 66, y: 50 },
              { id: 'player', label: 'ExoPlayer', x: 66, y: 88, tone: 'ok' },
              { id: 'notif', label: 'Media notification', x: 66, y: 12, hidden: true, tone: 'warm' },
            ],
            predict: {
              q: 'The audio guide plays from <code>PlaybackService</code>. Lin leaves the app. What happens to the sound?',
              options: ['It keeps playing, with controls in the notification', 'It stops, because the screen released its controller', 'It pauses until she opens the app again'],
              a: 0,
              why: 'The player lives in the service, not in the screen. Releasing the controller only disconnects the screen.',
            },
            frames: [
              { add: [['session', 'player', 'controls', 'accent']], say: '<code>PlaybackService</code> starts. In <code>onCreate</code> it builds an <code>ExoPlayer</code> and a <code>MediaSession</code> around it.' },
              { show: ['ui'], add: [['ui', 'session', 'play()', 'ok']], say: 'The recipe screen connects with a <code>MediaController</code> and calls <code>play()</code>. The command goes through the session to the player.' },
              { show: ['notif'], add: [['session', 'notif', 'shows', 'warm']], say: 'Media3 posts the media notification and makes the service a foreground service while it plays.' },
              { gone: ['ui'], remove: [['ui', 'session']], say: 'Lin opens her timer app. The screen releases its controller, but the player is in the service, so the guide keeps playing.' },
              { show: ['buds'], add: [['buds', 'session', 'pause', 'warm']], say: 'She presses the button on her headphones. The session gets the command and pauses the player.' },
              { show: ['lock'], add: [['lock', 'session', 'play', 'ok']], say: 'Later she taps play on the lock screen. Same path: the session, then the player.' },
              { hl: ['session'], say: 'If playback stays paused for 10 minutes, the service leaves the foreground and Android may stop it. <code>onDestroy</code> then releases the player and the session.' },
            ],
          });
        },
        code: `// app/build.gradle.kts: implementation("androidx.media3:media3-session:1.11.1")

// AndroidManifest.xml
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
// <service
//     android:name=".PlaybackService"
//     android:foregroundServiceType="mediaPlayback"
//     android:exported="true">
//     <intent-filter>
//         <action android:name="androidx.media3.session.MediaSessionService" />
//     </intent-filter>
// </service>

class PlaybackService : MediaSessionService() {
    private var session: MediaSession? = null

    override fun onCreate() {
        super.onCreate()
        val player = ExoPlayer.Builder(this).build()
        session = MediaSession.Builder(this, player).build()
    }

    // Every controller (your screen, the lock screen, headphones) gets the session here
    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? = session

    override fun onDestroy() {
        session?.let {
            it.player.release()
            it.release()
        }
        session = null
        super.onDestroy()
    }
}

@OptIn(UnstableApi::class)
@Composable
fun AudioGuide(audioUrl: String) {
    val context = LocalContext.current
    var controller by remember { mutableStateOf<MediaController?>(null) }

    DisposableEffect(Unit) {
        val token = SessionToken(context, ComponentName(context, PlaybackService::class.java))
        val future = MediaController.Builder(context, token).buildAsync()
        future.addListener({
            val ready = future.get()
            if (ready.currentMediaItem == null) {      // nothing playing yet
                ready.setMediaItem(MediaItem.fromUri(audioUrl))
                ready.prepare()
            }
            controller = ready
        }, ContextCompat.getMainExecutor(context))     // run the lambda on the main thread
        onDispose { MediaController.releaseFuture(future) }   // disconnect; the service plays on
    }

    controller?.let { PlayPauseButton(it) }          // Lin's play and pause button
}`,
        remember: 'The player and its MediaSession live in a MediaSessionService. Screens control it through a MediaController.',
        mistakes: [
          {
            title: 'A service without its type',
            bad: `<service
    android:name=".PlaybackService"
    android:exported="true">`,
            good: `<service
    android:name=".PlaybackService"
    android:foregroundServiceType="mediaPlayback"
    android:exported="true">`,
            why: 'Since Android 14, a foreground service must declare its type. Without <code>mediaPlayback</code>, the service can’t go into the foreground when playback starts.',
          },
        ],
        terms: [
          { term: 'MediaSession', def: 'Connects a player to the notification, lock screen, headphones and other controllers, and passes their commands to it.' },
          { term: 'MediaSessionService', def: 'A foreground service from Media3 that holds the player and its session, so playback continues with no screen open.' },
          { term: 'MediaController', def: 'The screen’s side of the connection. It is a <code>Player</code>, and its commands go to the session in the service. It arrives in a <em>future</em>, a box whose value comes later.' },
          { term: 'ComponentName', def: 'Names one part of your app, such as a service class: <code>ComponentName(context, PlaybackService::class.java)</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Hand out the session, and declare the service type.', code: 'override fun [[onGetSession]](controllerInfo: MediaSession.ControllerInfo): MediaSession? = session\n\n// android:foregroundServiceType="[[mediaPlayback]]"', why: 'Controllers ask for the session in <code>onGetSession</code>. The manifest says this foreground service plays media.' },
          { type: 'bug', prompt: 'The screen never connects to the audio guide. Tap the line.', code: 'val token = SessionToken(context, ComponentName(context, MainActivity::class.java))\nval future = MediaController.Builder(context, token).buildAsync()\nfuture.addListener({ controller = future.get() }, ContextCompat.getMainExecutor(context))', bug: 0, fix: 'val token = SessionToken(context, ComponentName(context, PlaybackService::class.java))', why: 'The token must name the service that holds the session. <code>MainActivity</code> is a screen, not a <code>MediaSessionService</code>.' },
        ],
        quiz: [
          { q: 'Who posts the media notification with play and pause?', options: ['Media3, from the player and session state', 'Your code, with NotificationCompat', 'The lock screen'], a: 0, why: 'A <code>MediaSessionService</code> creates and updates the media notification for you.' },
          { q: 'The user said no to notifications (<code>POST_NOTIFICATIONS</code>). Does the media notification still work?', options: ['Yes: media session notifications are exempt', 'No: nothing can be shown', 'Only on tablets'], a: 0, why: 'Notifications that belong to a media session don’t need that permission.' },
          { q: 'Why does the service have <code>exported="true"</code>?', options: ['Controllers outside your app, like the system’s media controls, connect to it', 'So it runs faster', 'Without it, the player has no sound'], a: 0, why: 'An exported component can be reached from outside your app. The session must be reachable by the system and other devices.' },
        ],
        docs: [['Background playback with a MediaSessionService', 'https://developer.android.com/media/media3/session/background-playback'], ['Connect to a media app', 'https://developer.android.com/media/media3/session/connect-to-media-app']],
      },

      {
        id: 'audiofocus',
        title: 'Audio focus',
        tagline: 'Only one app should be heard at a time: pause for a call, play quieter for a short sound.',
        goals: ['Explain what audio focus is and the ways it can be lost', 'Let ExoPlayer handle audio focus with audio attributes', 'Pause when headphones are unplugged'],
        level: 'intermediate',
        introduces: ['AudioAttributes', 'setUsage', 'setContentType', 'C', 'USAGE_MEDIA', 'AUDIO_CONTENT_TYPE_MOVIE', 'AUDIO_CONTENT_TYPE_SPEECH', 'setAudioAttributes', 'setHandleAudioBecomingNoisy'],
        body: `
<p>Sam watches the dumpling video while a friend calls. If the video keeps talking, Sam hears two voices at once. And if Sam then starts music in another app, the video should go quiet, not play on underneath the music.</p>
<p>Android shares the speaker with <em>audio focus</em>. Only one app holds it at a time. An app asks for focus before it plays, and loses it when another app asks. There are three kinds of loss. For good: another music or video app starts, so pause and stay paused. For a while: a phone call, so pause and carry on afterwards. For a moment, with a short sound such as a navigation prompt: play quieter until it is over. Playing quieter is called <em>ducking</em>.</p>
<p>ExoPlayer can do all of this for you. Describe your sound with <code>AudioAttributes</code>: <code>setUsage(C.USAGE_MEDIA)</code> says it is media playback (<code>C</code> holds Media3’s constants), and <code>setContentType(C.AUDIO_CONTENT_TYPE_MOVIE)</code> says it is a video. Pass them to <code>setAudioAttributes</code> on the builder, with <code>true</code> as the second argument (<code>handleAudioFocus</code>), and the player asks for focus on <code>play()</code>, then pauses, carries on and ducks at the right moments. Then don’t write any audio focus code yourself. For a spoken guide, use <code>C.AUDIO_CONTENT_TYPE_SPEECH</code>: the player pauses instead of ducking, so no words get lost under the prompt.</p>
<p>A related surprise: when headphones are unplugged, the sound moves to the phone’s speaker, often loudly. Android calls this <em>becoming noisy</em>. <code>setHandleAudioBecomingNoisy(true)</code> makes the player pause. One more rule: an app that targets Android 15 or higher only gets audio focus while it is on screen or runs a foreground service, another reason background audio lives in a <code>MediaSessionService</code>.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['cooking video', 'other sounds'],
            span: 12,
            unit: 's',
            predict: {
              q: 'With focus handling turned on (<code>true</code> in <code>setAudioAttributes</code>), a call interrupts the video. What happens when the call ends?',
              options: ['The video carries on by itself', 'It stays paused until Sam taps play', 'It never paused during the call'],
              a: 0,
              why: 'A call is a loss “for a while”. ExoPlayer pauses, and when focus comes back it plays again.',
            },
            frames: [
              { say: 'The video asks for audio focus when it starts playing, and gets it.' },
              { bars: [{ lane: 0, from: 0, to: 3, label: 'playing', tone: 'ok' }], say: 'Only the video is heard.' },
              { bars: [{ lane: 1, from: 3, to: 4, label: 'prompt', tone: 'warm' }, { lane: 0, from: 3, to: 4, label: 'quieter', tone: 'warm' }], now: 4, say: 'A navigation app speaks a short direction. Loss for a moment: the video ducks and plays quieter.' },
              { bars: [{ lane: 0, from: 4, to: 6, label: 'playing', tone: 'ok' }], now: 6, say: 'The prompt is over. The video is back at full volume.' },
              { bars: [{ lane: 1, from: 6, to: 9, label: 'phone call', tone: 'err' }, { lane: 0, from: 6, to: 9, label: 'paused', tone: 'muted' }], now: 9, say: 'A call comes in. Loss for a while: the video pauses.' },
              { bars: [{ lane: 0, from: 9, to: 10, label: 'playing', tone: 'ok' }], now: 10, say: 'The call ends and focus comes back. The video carries on by itself.' },
              { bars: [{ lane: 1, from: 10, to: 12, label: 'music app', tone: 'err' }, { lane: 0, from: 10, to: 12, label: 'paused', tone: 'muted' }], now: 12, say: 'Sam starts music in another app. Loss for good: the video pauses and stays paused until Sam taps play.' },
            ],
          });
        },
        code: `// in PlaybackService.onCreate(), where the player lives since Media sessions
val attributes = AudioAttributes.Builder()          // androidx.media3.common.AudioAttributes
    .setUsage(C.USAGE_MEDIA)                         // media playback, not an alarm or a call
    .setContentType(C.AUDIO_CONTENT_TYPE_MOVIE)      // a video: duck for short sounds
    .build()

val player = ExoPlayer.Builder(this)
    .setAudioAttributes(attributes, /* handleAudioFocus = */ true)
    .setHandleAudioBecomingNoisy(true)               // headphones out: pause
    .build()

// For a spoken audio guide, use C.AUDIO_CONTENT_TYPE_SPEECH instead:
// the player pauses for short sounds rather than talking underneath them.`,
        remember: 'Describe the sound with AudioAttributes, pass true to setAudioAttributes, and let ExoPlayer handle audio focus.',
        terms: [
          { term: 'audio focus', def: 'Android’s way of deciding which app is heard. One app holds it at a time and loses it when another asks.' },
          { term: 'ducking', def: 'Playing quieter for a moment while another app plays a short sound.' },
          { term: 'AudioAttributes', def: 'A description of your sound: what it is for (<code>setUsage</code>) and what kind it is (<code>setContentType</code>).' },
          { term: 'becoming noisy', def: 'Sound moving from headphones to the phone’s speaker, for example when they are unplugged.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let the player handle audio focus and pause when headphones are unplugged.', code: 'val player = ExoPlayer.Builder(context)\n    .[[setAudioAttributes]](attributes, true)\n    .[[setHandleAudioBecomingNoisy]](true)\n    .build()', why: '<code>true</code> in <code>setAudioAttributes</code> turns on focus handling. The second call pauses on becoming noisy.' },
          { type: 'bug', prompt: 'During a phone call, the cooking video keeps talking. Tap the line.', code: 'val player = ExoPlayer.Builder(context)\n    .setAudioAttributes(attributes, false)\n    .build()', bug: 1, fix: '    .setAudioAttributes(attributes, true)', why: 'The second argument is <code>handleAudioFocus</code>. With <code>false</code>, the player ignores other apps.' },
        ],
        quiz: [
          { q: 'A movie plays and a short notification sound comes. With focus handling on, what does ExoPlayer do?', options: ['Plays quieter until the sound is over', 'Stops for good', 'Nothing'], a: 0, why: 'A short sound is a loss for a moment. A movie ducks.' },
          { q: 'Another music app starts. What should your video do?', options: ['Pause and stay paused', 'Duck and carry on', 'Play louder'], a: 0, why: 'That is a loss for good. The user chose the other app.' },
          { q: 'Why use <code>AUDIO_CONTENT_TYPE_SPEECH</code> for a spoken guide?', options: ['The player pauses instead of ducking, so no words are lost', 'Speech sounds louder', 'It turns on subtitles'], a: 0, why: 'Talking underneath another voice is hard to follow, so speech pauses.' },
        ],
        docs: [['Manage audio focus', 'https://developer.android.com/media/optimize/audio-focus']],
      },

      {
        id: 'camerax',
        title: 'Taking photos',
        tagline: 'CameraX shows what the camera sees and saves a photo of your dish.',
        goals: ['Bind a Preview and an ImageCapture to the lifecycle', 'Show the camera with CameraXViewfinder', 'Take a photo into a file'],
        level: 'intermediate',
        introduces: ['ProcessCameraProvider', 'awaitInstance', 'bindToLifecycle', 'unbindAll', 'CameraSelector', 'DEFAULT_BACK_CAMERA', 'DEFAULT_FRONT_CAMERA', 'ImageCapture', 'setSurfaceProvider', 'SurfaceRequest', 'CameraXViewfinder', 'LocalLifecycleOwner', 'awaitCancellation', 'OutputFileOptions', 'takePicture', 'OnImageSavedCallback', 'onImageSaved'],
        body: `
<p>Ada’s dumplings are done and she wants a photo of them on the recipe. She could open the phone’s camera app with an intent, but the Recipes app wants its own camera screen: the picture on top, a “Take photo” button below, and the photo saved straight to the recipe.</p>
<p>Jetpack’s camera library is <em>CameraX</em>. You pick <em>use cases</em>, the jobs you want the camera to do: <code>Preview</code> shows what it sees (this is CameraX’s class, not the <code>@Preview</code> of Compose previews), and <code>ImageCapture</code> takes photos. <code>ProcessCameraProvider.awaitInstance(context)</code>, a suspend function, gets the provider, and <code>provider.bindToLifecycle(owner, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageCapture)</code> connects them to the back camera. The <em>lifecycle owner</em> is whatever has the lifecycle, here the camera screen: inside a NavHost, each screen has its own lifecycle (outside one, it is the Activity). A composable gets it with <code>LocalLifecycleOwner.current</code>, imported from <code>androidx.lifecycle.compose</code>. CameraX opens the camera when the owner starts and closes it when it stops, so pressing Home frees the camera for other apps with no code from you.</p>
<p><code>Preview</code> needs a place to draw. <code>preview.setSurfaceProvider { request -&gt; ... }</code> hands you a <code>SurfaceRequest</code>: keep it in state, and <code>CameraXViewfinder(surfaceRequest = request)</code> from <code>camera-compose</code> draws the picture. When the composable leaves the screen, let go of the camera with <code>provider.unbindAll()</code> (the code comments show where).</p>
<p>To take the photo, <code>ImageCapture.OutputFileOptions.Builder(file).build()</code> says where to save it, and <code>takePicture(options, executor, callback)</code> takes it. The callback is an object with two functions: <code>onImageSaved</code> when the file is written, <code>onError</code> if it failed. <code>object : ImageCapture.OnImageSavedCallback { ... }</code> makes one unnamed object that implements the interface, like <code>object : Migration</code> in the Data track. Give each recipe its own file name, so a new photo doesn’t replace another recipe’s. Ask for <code>Manifest.permission.CAMERA</code> first, as in the Permissions lesson.</p>`,
        visual(el) {
          const vf = (on, extra = '') => `<div class="ui-m-bar">← Dumplings</div><div class="md-vf${on ? ' md-on' : ''}">${on ? '' : '<span class="md-vf-tag">camera closed</span>'}${extra}</div><div class="md-bottom"><span class="md-shutter"></span></div>`;
          const home = '<div class="ui-m-center"><b>Home screen</b><span class="ui-m-muted">Recipes is in the background</span></div>';
          Lab.ui.phone(el, {
            logTitle: 'Your code',
            predict: {
              q: 'The camera screen is open and Ada presses Home. Who closes the camera?',
              options: ['CameraX, because it is bound to the lifecycle owner', 'Your <code>onStop</code> code has to close it', 'Nobody: it stays open'],
              a: 0,
              why: '<code>bindToLifecycle</code> ties the camera to the owner. When the owner stops, CameraX closes the camera.',
            },
            frames: [
              { screen: vf(false), log: '// CAMERA permission granted', say: 'The camera screen appears. Nothing is bound yet, so the picture is black.' },
              { screen: vf(true), log: ['bindToLifecycle(owner, DEFAULT_BACK_CAMERA, preview, imageCapture)', 'preview → SurfaceRequest → CameraXViewfinder'], say: 'The use cases are bound. <code>Preview</code> gives a <code>SurfaceRequest</code>, and <code>CameraXViewfinder</code> draws what the back camera sees.' },
              { tap: '.md-shutter', log: 'imageCapture.takePicture(options, mainExecutor, callback)', say: 'Ada taps the button. <code>takePicture</code> starts, and returns before the file is written.' },
              { screen: vf(true, '<div class="md-flash"></div>'), log: 'onImageSaved: files/dish-12.jpg', say: 'A moment later <code>onImageSaved</code> runs. Now the file exists.' },
              { screen: vf(true, '<div class="ui-m-snack">Photo added to Dumplings</div>'), say: 'The app adds the photo to the recipe.' },
              { screen: home, log: '// owner stopped: CameraX closed the camera', say: 'Ada presses Home. The owner stops, and CameraX closes the camera. Other apps can use it now.' },
              { screen: vf(true), log: '// owner started: CameraX opened it again', say: 'Back in the app, the owner starts again and the picture returns, with no extra code.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
// dependencies {
//     implementation("androidx.camera:camera-camera2:1.6.2")
//     implementation("androidx.camera:camera-lifecycle:1.6.2")
//     implementation("androidx.camera:camera-compose:1.6.2")
// }
// AndroidManifest.xml: <uses-permission android:name="android.permission.CAMERA" />

@Composable
fun DishCamera(recipeId: Long, onSaved: (File) -> Unit) {
    val context = LocalContext.current
    val owner = LocalLifecycleOwner.current
    var request by remember { mutableStateOf<SurfaceRequest?>(null) }
    val preview = remember { Preview.Builder().build() }
    val imageCapture = remember { ImageCapture.Builder().build() }

    LaunchedEffect(Unit) {
        preview.setSurfaceProvider { newRequest -> request = newRequest }
        val provider = ProcessCameraProvider.awaitInstance(context)
        provider.bindToLifecycle(owner, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageCapture)
        try {
            awaitCancellation()                  // wait here until the effect is cancelled
        } finally {
            provider.unbindAll()                 // runs when it is: screen left, let go of the camera
        }
    }

    Column {
        request?.let { CameraXViewfinder(surfaceRequest = it, modifier = Modifier.weight(1f)) }
        Button(onClick = { takePhoto(context, recipeId, imageCapture, onSaved) }) { Text("Take photo") }
    }
}

fun takePhoto(context: Context, recipeId: Long, imageCapture: ImageCapture, onSaved: (File) -> Unit) {
    val file = File(context.filesDir, "dish-$recipeId.jpg")      // one photo per recipe
    val options = ImageCapture.OutputFileOptions.Builder(file).build()
    imageCapture.takePicture(options, ContextCompat.getMainExecutor(context),
        object : ImageCapture.OnImageSavedCallback {
            override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                onSaved(file)                    // the file is written now
            }
            override fun onError(exception: ImageCaptureException) {
                Log.e("Camera", "Photo failed", exception)
            }
        })
}`,
        remember: 'Bind Preview and ImageCapture to the lifecycle, draw the SurfaceRequest with CameraXViewfinder, and use the photo in onImageSaved.',
        mistakes: [
          {
            title: 'Using the photo before it is saved',
            bad: `imageCapture.takePicture(options, executor, callback)
onSaved(file)              // the file isn’t written yet`,
            good: `override fun onImageSaved(output: ImageCapture.OutputFileResults) {
    onSaved(file)          // now it is
}`,
            why: '<code>takePicture</code> returns at once and saves the photo later. Only <code>onImageSaved</code> tells you the file is ready.',
          },
        ],
        terms: [
          { term: 'use case', def: 'A job you ask CameraX to do, such as <code>Preview</code> or <code>ImageCapture</code>. You bind the ones you need.' },
          { term: 'lifecycle owner', def: 'Something with a lifecycle, like a screen in a NavHost or an Activity. In Compose: <code>LocalLifecycleOwner.current</code>. Bound use cases follow its start and stop.' },
          { term: 'SurfaceRequest', def: 'Preview’s request for a place to draw. <code>CameraXViewfinder</code> answers it and shows the picture.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Connect the preview and the photo use case to the back camera.', code: 'provider.[[bindToLifecycle]](owner, CameraSelector.[[DEFAULT_BACK_CAMERA]], preview, imageCapture)', why: '<code>bindToLifecycle</code> ties the use cases to the owner. The selector picks the lens.' },
          { type: 'bug', prompt: 'Photos work, but the viewfinder stays black. Tap the line.', code: 'val provider = ProcessCameraProvider.awaitInstance(context)\nprovider.bindToLifecycle(owner, CameraSelector.DEFAULT_BACK_CAMERA, imageCapture)', bug: 1, fix: 'provider.bindToLifecycle(owner, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageCapture)', why: 'Only bound use cases run. Without <code>preview</code>, no frames reach the viewfinder.' },
        ],
        quiz: [
          { q: 'Which use case shows the picture on screen?', options: ['<code>Preview</code>', '<code>ImageCapture</code>', '<code>CameraSelector</code>'], a: 0, why: '<code>Preview</code> sends frames to the screen. <code>ImageCapture</code> takes photos, and the selector only picks the lens.' },
          { q: 'When can you use the photo file?', options: ['In <code>onImageSaved</code>', 'Right after <code>takePicture</code> returns', 'When the screen leaves'], a: 0, why: 'Saving happens later. The callback tells you it is done.' },
          { q: 'To use the selfie camera instead, what do you pass to <code>bindToLifecycle</code>?', options: ['<code>CameraSelector.DEFAULT_FRONT_CAMERA</code>', 'A second <code>Preview</code>', '<code>LocalContext.current</code>'], a: 0, why: 'The selector picks the lens. To switch while the screen is open, <code>unbindAll()</code> and bind again with the other selector.' },
        ],
        docs: [['Image capture', 'https://developer.android.com/media/camera/camerax/take-photo'], ['Implement a preview', 'https://developer.android.com/media/camera/camerax/preview']],
      },

      {
        id: 'video-capture',
        title: 'Recording video',
        tagline: 'VideoCapture and a Recorder film a clip. The file is ready when Finalize arrives.',
        goals: ['Bind a VideoCapture with a Recorder', 'Start and stop a recording into a file', 'Wait for Finalize and check it for errors'],
        level: 'intermediate',
        introduces: ['VideoCapture', 'withOutput', 'Recorder', 'FileOutputOptions', 'prepareRecording', 'PendingRecording', 'withAudioEnabled', 'RECORD_AUDIO', 'Recording', 'VideoRecordEvent', 'Finalize', 'hasError'],
        body: `
<p>Lin wants to film how she kneads the dough, 30 seconds, from the same camera screen as the photos. A photo is one moment. A video goes on until she taps stop, and someone has to turn all those frames and the sound into one file.</p>
<p>That is a third use case, <code>VideoCapture</code>. Its <code>Recorder</code> does the encoding (turning frames and sound into a compact video) and writes the file. <code>VideoCapture.withOutput(recorder)</code> makes the use case, and you bind it next to <code>Preview</code>, like <code>ImageCapture</code>.</p>
<p>A recording has three steps. <code>recorder.prepareRecording(context, options)</code> picks the output, here <code>FileOutputOptions.Builder(file).build()</code>, and returns a <code>PendingRecording</code>: nothing records yet. <code>withAudioEnabled()</code> adds sound, which needs the <code>RECORD_AUDIO</code> runtime permission first. <code>start(executor) { event -&gt; ... }</code> begins, and returns a <code>Recording</code> you can <code>pause()</code>, <code>resume()</code> and <code>stop()</code>. A Recorder runs one recording at a time.</p>
<p>Your lambda gets <code>VideoRecordEvent</code>s: <code>Start</code>, then <code>Status</code> now and then with the time and size so far, and finally <code>Finalize</code>. <code>stop()</code> returns at once, but the Recorder still has to finish the file. Only <code>Finalize</code> says it is done, and <code>event.hasError()</code> tells you whether something went wrong.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['your code', 'Recorder', 'your lambda'],
            span: 12,
            unit: 's',
            predict: {
              q: 'Lin taps stop, and your code calls <code>stop()</code>. When is the video file ready?',
              options: ['As soon as <code>stop()</code> returns', 'When your lambda gets <code>VideoRecordEvent.Finalize</code>', 'After the next <code>Status</code> event'],
              a: 1,
              why: '<code>stop()</code> only asks the Recorder to finish. It still writes the last part and closes the file, then sends <code>Finalize</code>.',
            },
            frames: [
              { say: '<code>VideoCapture</code> with its <code>Recorder</code> is bound next to <code>Preview</code>. Nothing records yet.' },
              { bars: [{ lane: 0, from: 0, to: 1, label: 'prepare', tone: 'accent' }], say: '<code>prepareRecording(context, options)</code> picks the file and returns a <code>PendingRecording</code>. Still nothing records.' },
              { bars: [{ lane: 0, from: 1, to: 2, label: 'audio', tone: 'accent' }], say: '<code>withAudioEnabled()</code> adds sound. Call it only when <code>RECORD_AUDIO</code> is granted.' },
              { bars: [{ lane: 0, from: 2, to: 3, label: 'start()', tone: 'ok' }, { lane: 1, from: 3, to: 8, label: 'recording', tone: 'ok' }, { lane: 2, from: 3, to: 4, label: 'Start', tone: 'accent' }], now: 4, say: '<code>start(executor) { ... }</code> returns a <code>Recording</code>. Your lambda gets <code>Start</code>.' },
              { bars: [{ lane: 2, from: 5, to: 6, label: 'Status', tone: 'muted' }, { lane: 2, from: 6, to: 7, label: 'Status', tone: 'muted' }], now: 7, say: 'While it records, <code>Status</code> events report the time and size so far.' },
              { bars: [{ lane: 0, from: 8, to: 9, label: 'stop()', tone: 'err' }, { lane: 1, from: 8, to: 11, label: 'finishing', tone: 'warm' }], now: 9, say: '<code>stop()</code> returns at once. The Recorder is still writing the end of the file.' },
              { bars: [{ lane: 2, from: 11, to: 12, label: 'Finalize', tone: 'ok' }], now: 12, say: '<code>Finalize</code> arrives. Check <code>hasError()</code>: if it is false, the file is ready, and the Recorder can take a new recording.' },
            ],
          });
        },
        code: `// app/build.gradle.kts: also implementation("androidx.camera:camera-video:1.6.2")
// AndroidManifest.xml: <uses-permission android:name="android.permission.RECORD_AUDIO" />

// inside the LaunchedEffect from Taking photos: add a third use case
val recorder = Recorder.Builder().build()
val videoCapture = VideoCapture.withOutput(recorder)
provider.bindToLifecycle(owner, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageCapture, videoCapture)

// withSound: the caller checked RECORD_AUDIO first (see the mistake below)
fun startClip(context: Context, withSound: Boolean): Recording {
    val file = File(context.filesDir, "knead.mp4")
    val options = FileOutputOptions.Builder(file).build()
    val pending = recorder.prepareRecording(context, options)
    val ready = if (withSound) {
        pending.withAudioEnabled()                   // sound too
    } else {
        pending                                      // a silent clip
    }
    return ready.start(ContextCompat.getMainExecutor(context)) { event ->
        when (event) {
            is VideoRecordEvent.Start -> Log.d("Clip", "Recording")
            is VideoRecordEvent.Finalize ->
                if (event.hasError()) {
                    Log.e("Clip", "Failed with error \${event.error}")
                } else {
                    Log.d("Clip", "Saved \${file.name}")
                }
        }
    }
}

// The stop button: recording.stop(). The file is ready when Finalize arrives.`,
        remember: 'prepareRecording, start, stop, and wait for Finalize. Check hasError() before you tell the user the video is saved.',
        mistakes: [
          {
            title: 'Sound without the permission',
            bad: `recorder.prepareRecording(context, options)
    .withAudioEnabled()            // RECORD_AUDIO was never granted
    .start(executor) { event -> }`,
            good: `val pending = recorder.prepareRecording(context, options)
val canRecordSound = ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
    PackageManager.PERMISSION_GRANTED
val recording = if (canRecordSound) {
    pending.withAudioEnabled().start(executor) { event -> }
} else {
    pending.start(executor) { event -> }       // a silent video is still useful
}`,
            why: '<code>withAudioEnabled()</code> throws a <code>SecurityException</code> without <code>RECORD_AUDIO</code>. Check first, and record without sound if the user said no.',
          },
        ],
        terms: [
          { term: 'VideoCapture', def: 'The CameraX use case for video. It sends camera frames to an output such as a <code>Recorder</code>.' },
          { term: 'Recorder', def: 'Encodes the frames and sound and writes the file. It runs one recording at a time.' },
          { term: 'PendingRecording', def: 'A recording with its output chosen. Nothing records until <code>start()</code>, which returns a <code>Recording</code>.' },
          { term: 'VideoRecordEvent', def: 'What your lambda gets during a recording: <code>Start</code>, <code>Status</code>, and finally <code>Finalize</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Prepare a recording, start it, and react when it is done.', code: 'val recording = recorder\n    .[[prepareRecording]](context, options)\n    .withAudioEnabled()            // RECORD_AUDIO is granted\n    .[[start]](ContextCompat.getMainExecutor(context)) { event ->\n        if (event is VideoRecordEvent.[[Finalize]] && !event.hasError()) {\n            Log.d("Clip", "Saved")\n        }\n    }', why: '<code>prepareRecording</code> picks the output, <code>start</code> begins, and <code>Finalize</code> is the last event.' },
          { type: 'bug', prompt: 'The app says “Saved” when the recording failed, and “Failed” when it worked. Tap the line.', code: 'is VideoRecordEvent.Finalize ->\n    if (!event.hasError()) {\n        Log.e("Clip", "Failed")\n    } else {\n        Log.d("Clip", "Saved")\n    }', bug: 1, fix: '    if (event.hasError()) {', why: '<code>hasError()</code> is <code>true</code> when the recording failed. The <code>!</code> turned the check around.' },
        ],
        quiz: [
          { q: 'What does <code>prepareRecording()</code> give you?', options: ['A <code>PendingRecording</code> that records nothing until <code>start()</code>', 'A <code>Recording</code> that is already running', 'The finished file'], a: 0, why: 'Preparing only picks the output and options. <code>start()</code> returns the active <code>Recording</code>.' },
          { q: 'A recording is still running. Can the same Recorder start a second one?', options: ['No: stop the first one, then start another', 'Yes, into a second file', 'Yes, the first one stops by itself'], a: 0, why: 'A Recorder runs one recording at a time.' },
          { q: 'Which event tells you the video file is finished?', options: ['<code>Finalize</code>', '<code>Start</code>', '<code>Status</code>'], a: 0, why: '<code>Start</code> and <code>Status</code> come while recording. <code>Finalize</code> is last, with the result or an error.' },
        ],
        docs: [['CameraX video capture', 'https://developer.android.com/media/camera/camerax/video-capture']],
      },

      {
        id: 'analysis',
        title: 'Image analysis',
        tagline: 'ImageAnalysis hands your code camera frames, the newest one each time.',
        goals: ['Run your own check on camera frames with ImageAnalysis', 'Keep up with the camera by taking only the newest frame', 'Close every frame when you are done with it'],
        level: 'intermediate',
        introduces: ['ImageAnalysis', 'setBackpressureStrategy', 'STRATEGY_KEEP_ONLY_LATEST', 'STRATEGY_BLOCK_PRODUCER', 'setAnalyzer', 'ImageProxy', 'Executors', 'newSingleThreadExecutor', 'shutdown', 'planes', 'remaining', 'toUByte', 'average'],
        body: `
<p>Photos taken in a dim kitchen come out grey and grainy. The camera screen could warn “Too dark: turn on a light” before Ada taps the button. For that, the app has to look at the frames itself while the preview runs.</p>
<p>The fourth use case, <code>ImageAnalysis</code>, does that. Your <em>analyzer</em>, set with <code>setAnalyzer(executor) { image -&gt; ... }</code>, gets each frame as an <code>ImageProxy</code>. Run it on a background thread: <code>Executors.newSingleThreadExecutor()</code> makes an executor with one thread of its own, so the main thread stays free for the screen. Make it once with <code>remember</code>, and shut it down with <code>worker.shutdown()</code> when the screen leaves, next to <code>unbindAll()</code>. Bind it next to <code>Preview</code>, and the viewfinder stays smooth while you check.</p>
<p>The camera makes about 30 frames a second, one every 33 ms. If your check takes longer than 33 ms, new frames arrive before you are done. By default, <code>ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST</code> drops the ones you missed and gives you the newest, so the warning is always about now. <code>STRATEGY_BLOCK_PRODUCER</code> keeps them in a queue instead, and the answers fall behind. Either way, call <code>image.close()</code> when you are done, also when your check fails: until you do, no next frame arrives.</p>
<p>Inside the frame, <code>image.planes[0]</code> holds one byte of brightness per pixel. Copy its <code>buffer</code> into a <code>ByteArray</code>, sized with <code>buffer.remaining()</code>. An <em>array</em> is a fixed-size row of values, read with <code>[index]</code> like a list, and a <code>ByteArray</code> is an array of bytes; <code>planes</code> is an array too. Kotlin reads a byte as -128 to 127, so <code>toUByte().toInt()</code> turns it into 0 (black) to 255 (white), and <code>average()</code> gives the mean of a list of numbers.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['camera frames', 'your analyzer'],
            span: 300,
            unit: 'ms',
            predict: {
              q: 'Your check takes 100 ms, and the camera makes a frame every 33 ms. With the default strategy, which frame does the analyzer get after frame 1?',
              options: ['Frame 2, the next one in line', 'The newest frame; the ones in between are dropped', 'All of them, one after another'],
              a: 1,
              why: '<code>STRATEGY_KEEP_ONLY_LATEST</code> keeps only the newest frame waiting, so the result is about what the camera sees now.',
            },
            frames: [
              { say: 'The camera sends a frame about every 33 ms. Your brightness check needs 100 ms.' },
              { bars: [{ lane: 0, from: 0, to: 14, label: '1', tone: 'ok' }, { lane: 1, from: 0, to: 98, label: 'checking 1', tone: 'accent' }], now: 14, say: 'Frame 1 arrives and the analyzer starts on it.' },
              { bars: [{ lane: 0, from: 33, to: 47, label: '2', tone: 'muted' }, { lane: 0, from: 66, to: 80, label: '3', tone: 'muted' }], now: 80, say: 'Frames 2 and 3 arrive while it is busy. Only the newest one waits; frame 2 is dropped when 3 comes.' },
              { bars: [{ lane: 0, from: 99, to: 113, label: '4', tone: 'ok' }], marks: [{ at: 98, label: 'close()', tone: 'ok' }], now: 100, say: 'The check ends with <code>image.close()</code>. Frame 4 is the newest, so frame 3 is dropped too.' },
              { bars: [{ lane: 1, from: 100, to: 198, label: 'checking 4', tone: 'accent' }, { lane: 0, from: 132, to: 146, label: '5', tone: 'muted' }, { lane: 0, from: 165, to: 179, label: '6', tone: 'muted' }], now: 198, say: 'The analyzer works on frame 4. Frames 5 and 6 come and go.' },
              { bars: [{ lane: 0, from: 198, to: 212, label: '7', tone: 'ok' }, { lane: 1, from: 200, to: 298, label: 'checking 7', tone: 'accent' }], now: 300, say: 'Then frame 7. The warning is never more than one check behind what the camera sees.' },
              { say: 'Without <code>close()</code>, frame 1 is never given back, and no other frame reaches your analyzer.' },
            ],
          });
        },
        code: `// In DishCamera from Taking photos, next to preview and imageCapture
var tooDark by remember { mutableStateOf(false) }   // true: the screen shows "Too dark: turn on a light"
val analysis = remember {
    ImageAnalysis.Builder()
        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)   // the default
        .build()
}
val worker = remember { Executors.newSingleThreadExecutor() }   // one background thread, made once

LaunchedEffect(Unit) {
    // ... preview.setSurfaceProvider as before
    analysis.setAnalyzer(worker) { image ->
        try {
            tooDark = brightness(image) < 40
        } finally {
            image.close()                              // done: the next frame may come
        }
    }
    val provider = ProcessCameraProvider.awaitInstance(context)
    provider.bindToLifecycle(owner, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageCapture, analysis)
    try {
        awaitCancellation()
    } finally {
        provider.unbindAll()
        worker.shutdown()                              // screen left: end the background thread
    }
}

// Plane 0 holds one brightness byte per pixel: 0 is black, 255 is white.
fun brightness(image: ImageProxy): Double {
    val buffer = image.planes[0].buffer
    val bytes = ByteArray(buffer.remaining())
    buffer.get(bytes)                              // copy the bytes into the array
    return bytes.map { it.toUByte().toInt() }.average()
}`,
        remember: 'ImageAnalysis gives your analyzer the newest frame. Work on a background executor and always close() the image.',
        mistakes: [
          {
            title: 'Checking frames on the main thread',
            bad: 'analysis.setAnalyzer(ContextCompat.getMainExecutor(context)) { image -> ... }',
            good: `val worker = Executors.newSingleThreadExecutor()
analysis.setAnalyzer(worker) { image -> ... }`,
            why: 'The main thread also draws the screen. A 100 ms check on it, many times a second, makes buttons and scrolling stutter.',
          },
        ],
        terms: [
          { term: 'ImageAnalysis', def: 'The CameraX use case that hands camera frames to your own code.' },
          { term: 'ImageProxy', def: 'One camera frame given to your analyzer. Call <code>close()</code> when you are done with it.' },
          { term: 'array', def: 'A fixed-size row of values, read with <code>[index]</code> like a list. <code>image.planes</code> and a <code>ByteArray</code> are arrays.' },
          { term: 'backpressure strategy', def: 'What happens when frames come faster than you can check them: keep only the newest, or wait in a queue.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Check frames on a background thread and give each one back.', code: 'analysis.[[setAnalyzer]](worker) { image ->\n    try {\n        tooDark = brightness(image) < 40\n    } finally {\n        image.[[close]]()\n    }\n}', why: '<code>setAnalyzer</code> connects your code. <code>close()</code> in <code>finally</code> runs even when the check throws.' },
          { type: 'bug', prompt: 'The “Too dark” warning keeps lagging seconds behind the camera. Tap the line.', code: 'val analysis = ImageAnalysis.Builder()\n    .setBackpressureStrategy(ImageAnalysis.STRATEGY_BLOCK_PRODUCER)\n    .build()', bug: 1, fix: '    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)', why: 'Blocking keeps old frames in a queue, so each answer is about the past. Keeping only the latest stays current.' },
        ],
        quiz: [
          { q: 'You forget <code>image.close()</code>. What happens?', options: ['The analyzer gets no more frames', 'Nothing changes', 'The photo is saved twice'], a: 0, why: 'CameraX waits for the frame to come back before it sends the next one.' },
          { q: 'Why give <code>setAnalyzer</code> a single-thread executor instead of the main executor?', options: ['So the checks don’t slow down the screen', 'Because the camera needs two threads', 'So the frames are brighter'], a: 0, why: 'The main thread draws the UI. Heavy work belongs on another thread.' },
          { q: 'Which strategy is the default?', options: ['<code>STRATEGY_KEEP_ONLY_LATEST</code>', '<code>STRATEGY_BLOCK_PRODUCER</code>', 'There is no default'], a: 0, why: 'By default, frames you missed are dropped and you get the newest.' },
        ],
        docs: [['Image analysis', 'https://developer.android.com/media/camera/camerax/analyze']],
      },

      {
        id: 'sensors',
        title: 'Sensors',
        tagline: 'SensorManager reads the phone’s sensors. Listen only while the screen needs them.',
        goals: ['Find a sensor with SensorManager, and handle a phone without one', 'Read its values with a SensorEventListener', 'Unregister when the screen leaves, to save battery'],
        level: 'intermediate',
        introduces: ['SensorManager', 'Sensor', 'getDefaultSensor', 'TYPE_PROXIMITY', 'SensorEventListener', 'onSensorChanged', 'onAccuracyChanged', 'SensorEvent', 'registerListener', 'unregisterListener', 'SENSOR_DELAY_NORMAL', 'SENSOR_DELAY_UI', 'SENSOR_DELAY_GAME', 'SENSOR_DELAY_FASTEST', 'maximumRange'],
        body: `
<p>In cooking mode, the Recipes app shows one step at a time. But Sam’s hands are covered in dough, and touching the screen is the last thing Sam wants. What if a wave of the hand over the top of the phone turned to the next step? The phone already has a sensor for that: the <em>proximity sensor</em>, which turns the screen off when you hold the phone to your ear during a call.</p>
<p>Phones have many sensors: the accelerometer (movement and tilt), the gyroscope (turning), light, proximity and more. <code>context.getSystemService(SensorManager::class.java)</code> gives you the <code>SensorManager</code>, Android’s service for them. <code>getDefaultSensor(Sensor.TYPE_PROXIMITY)</code> returns the sensor, or <code>null</code> if this phone has none, so the feature must be optional.</p>
<p>Readings come to a <code>SensorEventListener</code>, an interface with two functions. <code>onSensorChanged(event)</code> runs for each new reading: <code>event.values</code> is an array, like the frame bytes in Image analysis, and for proximity <code>values[0]</code> is the distance in centimetres. <code>onAccuracyChanged</code> must be there too, but can stay empty. Many proximity sensors know only “near” and “far”: far reads as the sensor’s <code>maximumRange</code>, near as less. <code>registerListener(listener, sensor, SensorManager.SENSOR_DELAY_NORMAL)</code> starts the readings.</p>
<p>A registered sensor keeps running, and using battery, until you unregister it. Android doesn’t stop it when your screen leaves, and it can keep running even when the phone’s screen turns off. (Only once your whole app is in the background does Android stop sending readings.) So register in a <code>DisposableEffect</code> and call <code>unregisterListener(listener)</code> in <code>onDispose</code>. The delay is a wish, not a promise: <code>SENSOR_DELAY_NORMAL</code> is about 200 ms between readings, <code>SENSOR_DELAY_UI</code> 60 ms, <code>SENSOR_DELAY_GAME</code> 20 ms, and <code>SENSOR_DELAY_FASTEST</code> as fast as it goes. Pick the slowest that works.</p>`,
        visual(el) {
          const step = (n, text, hand = '') => `<div class="ui-m-bar">Cooking mode</div><div class="ui-m-body" style="position:relative"><span class="ui-m-muted">Step ${n} of 5</span><b>${text}</b><div class="ui-m-img"></div><div class="ui-m-line"></div><div class="ui-m-line short"></div></div>${hand}`;
          const list = '<div class="ui-m-bar">Recipes</div><div class="ui-m-body"><div class="ui-m-row"><span class="ui-m-av"></span><div>Dumplings</div></div><div class="ui-m-row"><span class="ui-m-av"></span><div>Lentil soup</div></div></div>';
          Lab.ui.phone(el, {
            logTitle: 'Your code',
            predict: {
              q: 'Sam leaves cooking mode, but your code never calls <code>unregisterListener</code>. What happens?',
              options: ['The sensor keeps running and using battery', 'Android stops it when the screen is gone', 'The app crashes'],
              a: 0,
              why: 'Android doesn’t unregister for you. A forgotten listener can drain the battery in a few hours.',
            },
            frames: [
              { screen: step(2, 'Fold the edges into pleats'), log: ['registerListener(listener, proximity, SENSOR_DELAY_NORMAL)', '// this sensor: maximumRange = 5.0'], say: 'Cooking mode opens. The <code>DisposableEffect</code> registers the listener on the proximity sensor.' },
              { screen: step(2, 'Fold the edges into pleats', '<div class="md-hand"></div>'), log: 'onSensorChanged: values[0] = 0.0  → near', say: 'Sam’s hand passes over the top of the phone. The reading drops below <code>maximumRange</code>: near.' },
              { screen: step(3, 'Steam for 12 minutes'), log: 'onSensorChanged: values[0] = 5.0  → far: onWave()', say: 'The hand moves away. Near, then far: that is one wave, so the app shows the next step.' },
              { screen: list, log: 'onDispose: unregisterListener(listener)', say: 'Sam goes back to the list. <code>onDispose</code> unregisters the listener.' },
              { log: '// no more readings: the sensor can power down', say: 'No app is listening any more, so the sensor can stop and save battery.' },
            ],
          });
        },
        code: `@Composable
fun WaveToTurn(onWave: () -> Unit) {
    val context = LocalContext.current
    DisposableEffect(Unit) {
        val sensors = context.getSystemService(SensorManager::class.java)
        val proximity = sensors.getDefaultSensor(Sensor.TYPE_PROXIMITY)   // null: no such sensor
        var near = false
        val listener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) {
                val nowNear = event.values[0] < event.sensor.maximumRange
                if (near && !nowNear) {
                    onWave()                       // near, then far: one wave
                }
                near = nowNear
            }
            override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
        }
        if (proximity != null) {
            sensors.registerListener(listener, proximity, SensorManager.SENSOR_DELAY_NORMAL)
        }
        onDispose { sensors.unregisterListener(listener) }   // stop the readings
    }
}`,
        remember: 'getDefaultSensor may be null. Register while the screen shows, unregister in onDispose, and pick the slowest delay that works.',
        mistakes: [
          {
            title: 'The fastest delay for a slow gesture',
            bad: 'sensors.registerListener(listener, proximity, SensorManager.SENSOR_DELAY_FASTEST)',
            good: 'sensors.registerListener(listener, proximity, SensorManager.SENSOR_DELAY_NORMAL)',
            why: 'A wave takes most of a second. Readings every 200 ms are plenty, and faster ones only use more battery.',
          },
        ],
        terms: [
          { term: 'SensorManager', def: 'Android’s service for sensors. You get it from the Context with <code>getSystemService</code>.' },
          { term: 'SensorEventListener', def: 'An interface with <code>onSensorChanged</code> (a new reading) and <code>onAccuracyChanged</code>.' },
          { term: 'proximity sensor', def: 'Measures how close something is to the top of the screen, in centimetres. Many know only near and far.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start the readings, and stop them when the screen leaves.', code: 'sensors.[[registerListener]](listener, proximity, SensorManager.SENSOR_DELAY_NORMAL)\nonDispose { sensors.[[unregisterListener]](listener) }', why: 'Register to start, unregister to stop. Android won’t stop it for you.' },
          { type: 'bug', prompt: 'The battery drains even after cooking mode is closed. Tap the line.', code: 'DisposableEffect(Unit) {\n    sensors.registerListener(listener, proximity, SensorManager.SENSOR_DELAY_NORMAL)\n    onDispose { }\n}', bug: 2, fix: '    onDispose { sensors.unregisterListener(listener) }', why: 'The cleanup is empty, so the sensor runs forever. Unregister in <code>onDispose</code>.' },
        ],
        quiz: [
          { q: 'When does <code>getDefaultSensor(Sensor.TYPE_PROXIMITY)</code> return <code>null</code>?', options: ['When the phone has no proximity sensor', 'When the screen is off', 'Never'], a: 0, why: 'Not every phone has every sensor, so check for <code>null</code> and keep the app working without it.' },
          { q: 'A proximity sensor only ever reports 0.0 and 5.0, and its <code>maximumRange</code> is 5.0. What does 5.0 mean?', options: ['Far', 'Near', 'An error'], a: 0, why: 'Near-and-far sensors report their maximum range for far and a smaller value for near.' },
          { q: 'Which delay is about 200 ms between readings?', options: ['<code>SENSOR_DELAY_NORMAL</code>', '<code>SENSOR_DELAY_GAME</code>', '<code>SENSOR_DELAY_FASTEST</code>'], a: 0, why: 'NORMAL is about 200 ms, UI 60 ms, GAME 20 ms, FASTEST as fast as the sensor allows.' },
        ],
        docs: [['Sensors overview', 'https://developer.android.com/develop/sensors-and-location/sensors/sensors_overview'], ['Position sensors', 'https://developer.android.com/develop/sensors-and-location/sensors/sensors_position']],
      },

      {
        id: 'location',
        title: 'Location',
        tagline: 'The fused location provider finds where the phone is. Ask for approximate when that is enough.',
        goals: ['Get the current location with the fused location provider', 'Choose between approximate and precise location permissions', 'Pick a priority that fits the feature and the battery'],
        level: 'intermediate',
        introduces: ['LocationServices', 'getFusedLocationProviderClient', 'FusedLocationProviderClient', 'getCurrentLocation', 'Priority', 'PRIORITY_HIGH_ACCURACY', 'PRIORITY_BALANCED_POWER_ACCURACY', 'PRIORITY_LOW_POWER', 'CancellationTokenSource', 'addOnSuccessListener', 'addOnFailureListener', 'Location', 'latitude', 'longitude', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'RequestMultiplePermissions'],
        body: `
<p>A new “Popular near you” screen in the Recipes app shows the dishes people around you cook most. It needs to know roughly where the phone is. The town is plenty; the street would be too much to ask for.</p>
<p>The <em>fused location provider</em> from Google Play services combines GPS, Wi-Fi and the mobile network to give a good answer for the least battery. <code>LocationServices.getFusedLocationProviderClient(context)</code> gives you a <code>FusedLocationProviderClient</code>. <code>getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, token)</code> asks for the current location (a very recent saved one may come back). It answers later, through a Task (Play services’ kind of future): <code>addOnSuccessListener</code> gets a <code>Location</code> with <code>latitude</code> and <code>longitude</code>, or <code>null</code> if none could be found, for example when location is turned off, and <code>addOnFailureListener</code> gets an error. Wrap it in <code>suspendCancellableCoroutine</code>, as in the Flow track, and cancel the request with a <code>CancellationTokenSource</code> if the coroutine is cancelled.</p>
<p>Location has two permissions. <code>ACCESS_COARSE_LOCATION</code> is approximate: within about 3 square kilometres. <code>ACCESS_FINE_LOCATION</code> is precise: usually within about 50 metres. Ask only for approximate when it is enough. If you need precise, ask for both in one request with <code>ActivityResultContracts.RequestMultiplePermissions()</code>. Since Android 12 the user can still choose Approximate, so the app must work with that. Both permissions work while your app is on screen; location in the background needs a separate permission with stricter rules.</p>
<p>The priority sets the trade-off. <code>PRIORITY_HIGH_ACCURACY</code> is the most precise and likely uses GPS, which costs the most battery. <code>PRIORITY_BALANCED_POWER_ACCURACY</code> is about a city block (100 metres), and <code>PRIORITY_LOW_POWER</code> about a city (10 kilometres). With only the approximate permission, you get approximate locations whatever priority you ask for.</p>`,
        visual(el) {
          const popular = '<div class="ui-m-bar">Popular</div><div class="ui-m-body"><b>Popular near you</b><span class="ui-m-muted">The dishes people around you cook most.</span><span class="ui-m-btn loc">Use my location</span></div>';
          const dialog = choose => `<div class="ui-m-bar">Popular</div><div class="ui-m-body"><b>Popular near you</b></div><div class="ui-m-scrim"><div class="ui-m-dialog"><b>Allow Recipes to access this device’s location?</b>${choose}<span class="ui-m-btn ghost ok">While using the app</span><span class="ui-m-btn ghost">Only this time</span><span class="ui-m-btn ghost">Don’t allow</span></div></div>`;
          const approx = '<span class="ui-m-chip">Approximate</span>';
          const both = '<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="ui-m-chip">Precise</span><span class="ui-m-chip" style="border-color:var(--accent);color:var(--accent)">Approximate</span></div>';
          const result = '<div class="ui-m-bar">Popular</div><div class="ui-m-body"><div class="md-circle">around your town</div><div class="ui-m-row"><span class="ui-m-av"></span><div>Lentil soup</div></div><div class="ui-m-row"><span class="ui-m-av"></span><div>Flatbread</div></div></div>';
          Lab.ui.phone(el, {
            logTitle: 'Your code',
            predict: {
              q: 'Your app asks for <code>ACCESS_FINE_LOCATION</code> and <code>ACCESS_COARSE_LOCATION</code> together. The user picks Approximate. What does the app get?',
              options: ['Only approximate locations, even with <code>PRIORITY_HIGH_ACCURACY</code>', 'Precise locations, because the app asked for fine', 'No location at all'],
              a: 0,
              why: 'The user’s choice wins. With only approximate granted, every answer is approximate.',
            },
            frames: [
              { screen: popular, say: 'Ada opens “Popular near you”. The app hasn’t asked for anything yet.' },
              { tap: '.loc', log: 'askLocation.launch(Manifest.permission.ACCESS_COARSE_LOCATION)', say: 'She taps “Use my location”: the right moment to ask. The town is enough, so the app asks for approximate only.' },
              { screen: dialog(approx), say: 'Android shows its dialog. Only approximate location was asked for, so that is what it offers.' },
              { tap: '.ok', log: ['granted = true', 'client.getCurrentLocation(PRIORITY_BALANCED_POWER_ACCURACY, token)'], say: 'Ada allows it while she uses the app. The app asks the fused location provider for the current location.' },
              { screen: result, log: 'onSuccess: latitude 12.34, longitude 56.78   // example numbers', say: 'The answer arrives: somewhere around Ada’s town, a few kilometres wide. Plenty to find the dishes people cook nearby.' },
              { screen: dialog(both), log: '// another app: RequestMultiplePermissions, FINE + COARSE', say: 'An app that needs precise location, say for walking directions, asks for both at once. The dialog then lets the user pick Precise or Approximate.' },
              { screen: result, say: 'If the user picks Approximate, that app only gets approximate locations, and it must still work.' },
            ],
          });
        },
        code: `// app/build.gradle.kts: implementation("com.google.android.gms:play-services-location:21.4.0")
// AndroidManifest.xml: <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

// Android Studio warns MissingPermission on getCurrentLocation: expected, because the caller checks first
suspend fun FusedLocationProviderClient.currentLocation(): Location? =
    suspendCancellableCoroutine { continuation ->
        val cancel = CancellationTokenSource()
        getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, cancel.token)
            .addOnSuccessListener { location -> continuation.resume(location) }   // null if none was found
            .addOnFailureListener { e -> continuation.resumeWithException(e) }
        continuation.invokeOnCancellation { cancel.cancel() }                   // stop asking
    }

class PopularActivity : ComponentActivity() {
    private val askLocation = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) {
            showPopular()
        } else {
            Toast.makeText(this, "Pick your region from the list instead", Toast.LENGTH_SHORT).show()
        }
    }

    // The "Use my location" button calls askLocation.launch(Manifest.permission.ACCESS_COARSE_LOCATION)

    private fun showPopular() {
        val granted = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) ==
            PackageManager.PERMISSION_GRANTED
        if (granted) {
            val client = LocationServices.getFusedLocationProviderClient(applicationContext)
            lifecycleScope.launch {
                val location = client.currentLocation()
                if (location != null) {
                    Log.d("Popular", "Near \${location.latitude}, \${location.longitude}")
                }
            }
        }
    }
}`,
        remember: 'Ask for approximate unless you truly need precise, get the current location with getCurrentLocation, and handle null.',
        mistakes: [
          {
            title: 'Asking for precise location by itself',
            bad: 'askLocation.launch(Manifest.permission.ACCESS_FINE_LOCATION)',
            good: 'askLocation.launch(Manifest.permission.ACCESS_COARSE_LOCATION)   // the town is enough',
            why: 'Since Android 12, fine location must be asked for together with coarse, or some versions ignore the request and Logcat says “ACCESS_FINE_LOCATION must be requested with ACCESS_COARSE_LOCATION.” Here approximate is enough, and asking for less also gets more yeses. If you do need precise, ask for both with <code>RequestMultiplePermissions</code>.',
          },
        ],
        terms: [
          { term: 'fused location provider', def: 'The location service in Google Play services. It mixes GPS, Wi-Fi and the mobile network for a good answer at low battery cost.' },
          { term: 'approximate location', def: 'A location within about 3 square kilometres, from <code>ACCESS_COARSE_LOCATION</code>.' },
          { term: 'precise location', def: 'A location usually within about 50 metres, from <code>ACCESS_FINE_LOCATION</code>. The user can still choose approximate.' },
          { term: 'Priority', def: 'How hard to try: from <code>PRIORITY_HIGH_ACCURACY</code> (precise, more battery) to <code>PRIORITY_LOW_POWER</code> (city level).' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Get the client and ask for a location about a city block wide.', code: 'val client = LocationServices.[[getFusedLocationProviderClient]](context)\nclient.getCurrentLocation(Priority.[[PRIORITY_BALANCED_POWER_ACCURACY]], cancel.token)', why: 'The client comes from <code>LocationServices</code>. Balanced is about 100 metres for less battery than GPS.' },
          { type: 'bug', prompt: 'Ada leaves the screen while the location is still being found, but the phone keeps looking. Tap the line.', code: 'suspendCancellableCoroutine { continuation ->\n    val cancel = CancellationTokenSource()\n    getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, cancel.token)\n        .addOnSuccessListener { location -> continuation.resume(location) }\n    continuation.invokeOnCancellation { }\n}', bug: 4, fix: '    continuation.invokeOnCancellation { cancel.cancel() }', why: 'When the coroutine is cancelled, tell Play services to stop too, with the token source.' },
        ],
        quiz: [
          { q: 'Which permission gives an approximate location?', options: ['<code>ACCESS_COARSE_LOCATION</code>', '<code>ACCESS_FINE_LOCATION</code>', '<code>INTERNET</code>'], a: 0, why: 'Coarse is approximate, about 3 square kilometres. Fine is precise.' },
          { q: 'Location is turned off in the phone’s settings. What can <code>getCurrentLocation</code> give you?', options: ['<code>null</code>', 'The last place the phone was in', '<code>0.0</code>, <code>0.0</code>'], a: 0, why: 'There may be no location to give, so the result can be <code>null</code>. Handle it.' },
          { q: 'Which priority usually costs the most battery?', options: ['<code>PRIORITY_HIGH_ACCURACY</code>', '<code>PRIORITY_BALANCED_POWER_ACCURACY</code>', '<code>PRIORITY_LOW_POWER</code>'], a: 0, why: 'High accuracy is likely to use GPS, which uses the most power.' },
        ],
        docs: [['Request location permissions', 'https://developer.android.com/develop/sensors-and-location/location/permissions/runtime'], ['Get the last known location', 'https://developer.android.com/develop/sensors-and-location/location/retrieve-current']],
      },
    ],
  });
})();
