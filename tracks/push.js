/* Notifications and push track. Same shape as tracks/kotlin.js.
   Demos use the visual kit (Lab.ui). Phone screens are built from the kit's .ui-m-* parts plus the small
   plt- helpers below (a notification, the shade, the home screen, a heads-up banner). Every class is prefixed plt-. */
(() => {
  // One notification as HTML. o: { ch, title, text, open, more, acts: ['Label'], cls, on }
  const note = o => `<div class="plt-note${o.cls ? ' ' + o.cls : ''}">` +
    `<span class="plt-note-app"><i class="plt-dot"></i>Recipes${o.ch ? ' · ' + o.ch : ''}</span>` +
    `<b>${o.title}</b>${o.text ? `<span class="plt-note-text${o.open || o.more ? ' plt-open' : ''}">${o.text}</span>` : ''}` +
    (o.more ? `<span class="plt-more">${o.more}</span>` : '') +
    (o.acts ? `<span class="plt-acts">${o.acts.map((a, k) => `<span class="plt-act${o.on === k ? ' plt-on' : ''}">${a}</span>`).join('')}</span>` : '') +
    `</div>`;
  // The notification shade, pulled down over the screen, with a list of notifications.
  const shade = (...notes) => `<div class="plt-shade"><span class="plt-shade-title">Notifications</span>${notes.join('') || '<span class="ui-m-muted">No notifications</span>'}</div>`;
  // The home screen: a grid of app icons, with the Recipes app first.
  const home = (extra = '') => `<div class="plt-home"><span class="plt-icon plt-me">R</span>${'<span class="plt-icon"></span>'.repeat(7)}</div>${extra}`;
  // An app screen: a top bar and a body.
  const screen = (title, body) => `<div class="ui-m-bar">${title}</div><div class="ui-m-body">${body}</div>`;
  // A heads-up banner floating over whatever is on screen.
  const heads = (n, under) => `${under}<div class="plt-hu">${n}</div>`;
  // The status bar row inside the screen: small icons for notifications that are waiting.
  const bar = n => `<div class="plt-sb">${'<i class="plt-dot"></i>'.repeat(n)}</div>`;

  const css = `
.plt-shade { flex: 1; display: grid; gap: 6px; align-content: start; padding: 8px; background: var(--sunk); min-height: 0; overflow: hidden; }
.plt-shade-title { font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.plt-note { display: grid; gap: 2px; padding: 8px 10px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); font-size: 0.76rem; line-height: 1.3; min-width: 0; overflow-wrap: anywhere; }
.plt-note b { font-size: 0.8rem; }
.plt-note-app { display: flex; align-items: center; gap: 5px; font: 600 0.6rem var(--mono); color: var(--muted); }
.plt-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); flex: none; }
.plt-note-text { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.plt-note-text.plt-open { white-space: normal; }
.plt-more { display: block; color: var(--muted); }
.plt-acts { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 4px; padding-top: 4px; border-top: 1px solid var(--line); }
.plt-act { font: 700 0.7rem var(--body); color: var(--accent); border-radius: 6px; padding: 1px 3px; }
.plt-act.plt-on { background: var(--accent-soft); }
.plt-note.plt-hi { border: 2px solid var(--accent); }
.plt-note.plt-faint { opacity: 0.55; }
.plt-hu { position: absolute; left: 6px; right: 6px; top: 6px; z-index: 2; box-shadow: var(--shadow); border-radius: 14px; animation: ui-fade 0.3s; }
.plt-home { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 18px 14px; }
.plt-icon { aspect-ratio: 1; border-radius: 12px; background: var(--sunk); display: grid; place-items: center; font-weight: 800; }
.plt-icon.plt-me { background: var(--accent); color: var(--accent-ink); }
.plt-sb { display: flex; gap: 3px; padding: 2px 12px 4px; min-height: 12px; }
.plt-link { color: var(--accent); overflow-wrap: anywhere; }
.plt-pic { border-radius: 8px; height: 54px; background: linear-gradient(135deg, var(--warm-soft), var(--accent-soft)); }
`;

  Lab.addTrack({
    id: 'push',
    title: 'Notifications and push',
    description: 'Tell Recipes users about a new recipe: notifications and channels, rich styles and actions, Firebase Cloud Messaging, and links that open the right screen.',
    group: 'Shipping', requires: ['arch'],
    css,
    lessons: [
      {
        id: 'notifications',
        title: 'Showing a notification',
        tagline: 'A short message from your app that waits for the user outside it.',
        goals: ['Build a notification with a small icon, a title and a text', 'Ask for the notification permission when the user wants alerts', 'Post a notification with <code>notify</code>, and replace it by using the same id'],
        level: 'beginner',
        introduces: ['NotificationCompat', 'setSmallIcon', 'setContentTitle', 'setContentText', 'NotificationManagerCompat', 'notify', 'POST_NOTIFICATIONS', 'NotificationChannel', 'NotificationManager', 'IMPORTANCE_DEFAULT', 'getSystemService', 'createNotificationChannel', 'VERSION', 'SDK_INT', 'VERSION_CODES', 'TIRAMISU'],
        body: `
<p>Lin likes the Recipes app, but she won’t open it every day to check for something new. When a new recipe is out, the app should tell her, even while she is in another app. That is a <em>notification</em>: a small icon in the status bar at the top of the screen, and the full message in the <em>notification shade</em>, the list Lin pulls down from the top.</p>
<p>You describe a notification with <code>NotificationCompat.Builder(context, NEW_RECIPES)</code>, from Android’s libraries. <code>setSmallIcon</code> is required: it is the icon in the status bar. <code>setContentTitle</code> and <code>setContentText</code> are the two lines of text, and <code>build()</code> makes the notification. <code>NotificationManagerCompat.from(context).notify(id, notification)</code> shows it. The <code>id</code> is a number you choose: posting again with the same id replaces that notification, so the recipe’s own id is a good choice.</p>
<p><code>NEW_RECIPES</code> names a <em>channel</em>. Since Android 8.0, every notification belongs to a channel, a kind of notification the user can turn on or off in Settings. Recipes runs on Android 8.0 and newer (its <code>minSdk</code> is 26), so every phone needs it. Create the channel when the app starts: override <code>onCreate</code> in <code>RecipesApp</code>, as you do in an Activity. <code>getSystemService(NotificationManager::class.java)</code> gives you Android’s notification manager, and <code>createNotificationChannel</code> adds the channel. If it exists already, the call does nothing, so it is safe on every start.</p>
<p>From Android 13, posting needs the <code>POST_NOTIFICATIONS</code> runtime permission, and a newly installed app starts with notifications off. List it in the manifest, and ask at the moment the user wants alerts, like a tap on “Tell me about new recipes”. Older phones don’t have this permission, so ask only when <code>Build.VERSION.SDK_INT</code>, the phone’s API level, is at least <code>Build.VERSION_CODES.TIRAMISU</code>, the name for API 33, Android 13. Before each post, check the answer. If it is no, nothing would appear, so skip it and keep the app working. Android Studio may still underline <code>notify</code>; the check in <code>canNotify</code> covers it.</p>`,
        visual(el) {
          const list = `<div class="ui-m-row"><div>Bean stew · 90 min</div></div><div class="ui-m-row"><div>Rice salad · 15 min</div></div>`;
          const app = screen('Recipes', list + '<span class="ui-m-btn plt-bell">Tell me about new recipes</span>');
          const dialog = app + '<div class="ui-m-scrim"><div class="ui-m-dialog"><b>Allow Recipes to send you notifications?</b><span class="ui-m-btn plt-allow">Allow</span><span class="ui-m-btn ghost">Don’t allow</span></div></div>';
          const n42 = text => note({ title: 'New recipe', text });
          Lab.ui.phone(el, {
            logTitle: 'Your code',
            predict: {
              q: 'Lin’s phone runs Android 15. She installed Recipes and has never answered the notification question. The app calls <code>notify()</code> for a new recipe. What does she see?',
              options: ['Nothing: notifications are off until she says yes', 'The notification, as usual', 'A message that the app crashed'],
              a: 0,
              why: 'From Android 13, a newly installed app starts with notifications off. The user turns them on by answering yes.',
            },
            frames: [
              { screen: bar(0) + home(), say: 'Lin’s phone runs Android 15. Recipes is installed, and its notifications are off until she says yes.' },
              { screen: app, tap: '.plt-bell', say: 'She opens Recipes and taps “Tell me about new recipes”. Now the question makes sense, so this is the moment to ask.' },
              { screen: dialog, log: 'askNotifications.launch(Manifest.permission.POST_NOTIFICATIONS)', say: 'The phone runs Android 13 or newer, so the app launches the request. Android shows its own dialog; the app can’t change its words.' },
              { screen: app, tap: '.plt-bell', log: 'granted = true', say: 'Lin taps Allow, and the lambda gets <code>true</code>.' },
              { screen: bar(1) + home(), log: 'notify(42, notification)', say: 'Later, a new recipe is out and the app posts notification 42. A small icon appears in the status bar, with a sound, because the channel is <code>IMPORTANCE_DEFAULT</code>.' },
              { screen: shade(n42('Lemon pasta, 20 min')), say: 'Lin pulls down the shade: the small icon, the title and the text.' },
              { screen: shade(n42('Lemon pasta, 15 min')), log: 'notify(42, notification)', say: 'The recipe gets quicker, and the app posts again with the same id, 42. The notification is replaced, not added.' },
              { screen: shade(note({ title: 'New recipe', text: 'Bean soup, 40 min' }), n42('Lemon pasta, 15 min')), log: 'notify(43, notification)', say: 'A different id, 43, is a second notification.' },
            ],
          });
        },
        code: `// AndroidManifest.xml, next to the other <uses-permission> lines:
// <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

const val NEW_RECIPES = "new_recipes"

@HiltAndroidApp
class RecipesApp : Application() {
    override fun onCreate() {
        super.onCreate()
        val channel = NotificationChannel(NEW_RECIPES, getString(R.string.channel_new_recipes), NotificationManager.IMPORTANCE_DEFAULT)
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)   // safe on every start
    }
}

fun canNotify(context: Context): Boolean {
    return Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
        ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
}

fun showNewRecipe(context: Context, recipe: Recipe) {
    if (!canNotify(context)) {
        return                                       // the user said no: show nothing
    }
    val notification = NotificationCompat.Builder(context, NEW_RECIPES)
        .setSmallIcon(R.drawable.ic_recipe)          // required: the status bar icon
        .setContentTitle("New recipe")
        .setContentText("\${recipe.title}, \${recipe.minutes} min")   // "Lemon pasta, 20 min"
        .build()
    NotificationManagerCompat.from(context).notify(recipe.id, notification)   // same id: replaced
}

// MainActivity: ask when the user wants alerts
private val askNotifications = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
    // false after "Don’t allow": the app keeps working, without alerts
}

private fun turnOnAlerts() {                         // runs on a tap on “Tell me about new recipes”
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        askNotifications.launch(Manifest.permission.POST_NOTIFICATIONS)
    }
}`,
        remember: 'A channel, a small icon, a title and a text. Ask for POST_NOTIFICATIONS when the user wants alerts; the same id replaces.',
        mistakes: [
          {
            title: 'One id for every notification',
            bad: `NotificationManagerCompat.from(context).notify(1, notification)   // every recipe is 1`,
            good: `NotificationManagerCompat.from(context).notify(recipe.id, notification)`,
            why: 'With the same id, each new recipe replaces the one before, and Lin only ever sees the last one. Use an id that belongs to what the notification is about.',
          },
        ],
        terms: [
          { term: 'notification', def: 'A message from an app shown outside it: a small icon in the status bar and an entry in the notification shade.' },
          { term: 'notification shade', def: 'The list of notifications the user pulls down from the top of the screen.' },
          { term: 'notification channel', def: 'A kind of notification, made with <code>NotificationChannel</code>. Every notification belongs to one, and the user can turn each channel on or off in Settings.' },
          { term: 'POST_NOTIFICATIONS', def: 'The runtime permission an app needs from Android 13 (API 33, <code>TIRAMISU</code>) to show notifications.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build the notification with its required icon, then show it.', code: 'val notification = NotificationCompat.Builder(context, NEW_RECIPES)\n    .[[setSmallIcon]](R.drawable.ic_recipe)\n    .setContentTitle("New recipe")\n    .setContentText("Lemon pasta, 20 min")\n    .build()\nNotificationManagerCompat.from(context).[[notify]](recipe.id, notification)', why: '<code>setSmallIcon</code> is the one part every notification needs. <code>notify</code> shows it under the id you give.' },
          { type: 'bug', prompt: 'Phones older than Android 13 don’t have this permission, so <code>canNotify</code> should say yes there and check the permission on newer phones. It does the opposite. Tap the line that needs to change.', code: 'fun canNotify(context: Context): Boolean {\n    return Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU ||\n        ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED\n}', bug: 1, fix: '    return Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||', why: 'Below API 33 (<code>TIRAMISU</code>) the answer is yes at once. From API 33 on, the permission check decides.' },
        ],
        quiz: [
          { q: 'Lin’s phone runs Android 14, and she tapped “Don’t allow”. The app posts a notification. What does she see?', options: ['Nothing', 'The notification', 'The permission dialog again'], a: 0, why: 'Without <code>POST_NOTIFICATIONS</code>, the app can’t show notifications. Check first, and keep the app working without them.' },
          { q: 'The app calls <code>notify(42, a)</code> and then <code>notify(42, b)</code>. What is in the shade?', options: ['One notification: <code>b</code>', 'Two notifications', 'One notification: <code>a</code>'], a: 0, why: 'The same id replaces the notification that is there.' },
          { q: 'Which of these must every notification have?', options: ['A small icon, from <code>setSmallIcon</code>', 'A title', 'A sound'], a: 0, why: 'The small icon is the only part that is required. Title and text are what you will almost always add.' },
        ],
        docs: [['Create a notification', 'https://developer.android.com/develop/ui/views/notifications/build-notification'], ['Notification runtime permission', 'https://developer.android.com/develop/ui/views/notifications/notification-permission']],
      },

      {
        id: 'channels',
        title: 'Notification channels',
        tagline: 'One channel for each kind of message, so the user can mute one and keep the other.',
        goals: ['Choose an importance for each kind of notification', 'Explain why the user, not your code, controls a channel once it exists', 'Check whether a channel is blocked and open its settings'],
        level: 'beginner',
        introduces: ['IMPORTANCE_HIGH', 'IMPORTANCE_LOW', 'IMPORTANCE_MIN', 'IMPORTANCE_NONE', 'deleteNotificationChannel', 'getNotificationChannel', 'importance', 'areNotificationsEnabled', 'Settings', 'ACTION_CHANNEL_NOTIFICATION_SETTINGS', 'EXTRA_APP_PACKAGE', 'EXTRA_CHANNEL_ID'],
        body: `
<p>Recipes now sends two kinds of notifications: new recipes, a few times a week, and cooking reminders, like “Time to put the stew in the oven”. Sam loves the reminders but finds the new-recipe sound annoying. With one channel for both, Sam’s only choice is to turn everything off. With one channel for each kind, Settings &gt; Apps &gt; Recipes &gt; Notifications lists both, each with its own switch.</p>
<p>Each channel has an <em>importance</em>, which decides how loud its notifications are. <code>IMPORTANCE_HIGH</code> makes a sound and shows a <em>heads-up</em> banner over the app on screen. <code>IMPORTANCE_DEFAULT</code> makes a sound. <code>IMPORTANCE_LOW</code> is silent, with an icon in the status bar. <code>IMPORTANCE_MIN</code> is silent, with no icon: the notification is only in the shade. Pick the quietest that fits: reminders are urgent, so <code>HIGH</code>; new recipes can wait, so <code>DEFAULT</code>. A channel’s <code>description</code> tells the user in Settings what it is for.</p>
<p>Once <code>createNotificationChannel</code> has run on a phone, the user is in charge of that channel. Your code can’t change its importance any more, only its name and description. To give a channel a new default, make a new channel with a new id, and remove the old one with <code>deleteNotificationChannel</code>. Settings shows how many channels an app has deleted, so do this rarely.</p>
<p>The user can block a channel, or all of Recipes. <code>areNotificationsEnabled()</code> tells you whether the whole app may notify, and <code>getNotificationChannel(id)</code> gives you one channel: its <code>importance</code> is <code>IMPORTANCE_NONE</code> when the user turned it off. If a feature depends on it, explain why, then open that channel’s settings with an Intent for <code>Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS</code>, with two extras: your package name (<code>context.packageName</code>, under <code>Settings.EXTRA_APP_PACKAGE</code>) and the channel’s id (under <code>Settings.EXTRA_CHANNEL_ID</code>).</p>`,
        visual(el) {
          const list = screen('Recipes', '<div class="ui-m-row"><div>Bean stew · 90 min</div></div><div class="ui-m-row"><div>Rice salad · 15 min</div></div>');
          const reminder = note({ ch: 'Cooking reminders', title: 'Time to put the stew in the oven', text: 'Bean stew, step 3' });
          const fresh = note({ ch: 'New recipes', title: 'New recipe', text: 'Lemon pasta, 20 min' });
          const sw = (on1, on2) => screen('Recipes notifications', `<div class="ui-m-row"><div>Cooking reminders</div><span class="ui-m-chip">${on1}</span></div><div class="ui-m-row plt-row2"><div>New recipes</div><span class="ui-m-chip">${on2}</span></div>`);
          Lab.ui.phone(el, {
            logTitle: 'What Sam notices',
            predict: {
              q: 'Sam turned off the New recipes channel. The next version of Recipes creates <code>new_recipes</code> again, now with <code>IMPORTANCE_HIGH</code>. What happens on Sam’s phone?',
              options: ['Nothing changes: the channel stays off', 'The channel turns on again, as HIGH', 'The app crashes at start'],
              a: 0,
              why: 'Once a channel exists, the user controls it. Creating it again can update its name and description, never what the user chose.',
            },
            frames: [
              { screen: bar(0) + list, say: 'Sam is using Recipes. The app has made two channels: Cooking reminders with <code>IMPORTANCE_HIGH</code>, and New recipes with <code>IMPORTANCE_DEFAULT</code>.' },
              { screen: heads(reminder, bar(1) + list), log: 'Cooking reminders (HIGH): sound and a banner', say: 'A reminder arrives. <code>HIGH</code> makes a sound and a heads-up banner over the app on screen.' },
              { screen: bar(2) + list, log: 'New recipes (DEFAULT): sound, icon only', say: 'A new recipe arrives. <code>DEFAULT</code> makes a sound and adds an icon, with no banner.' },
              { screen: sw('On', 'On'), tap: '.plt-row2 .ui-m-chip', say: 'Sam opens Settings &gt; Apps &gt; Recipes &gt; Notifications. Each channel has its own switch.' },
              { screen: sw('On', 'Off'), log: 'New recipes: off', say: 'Sam turns New recipes off. Its <code>importance</code> is now <code>IMPORTANCE_NONE</code>.' },
              { screen: bar(0) + list, log: 'New recipe posted: nothing appears', say: 'The next new recipe is posted, and nothing appears: no sound, no icon, nothing in the shade.' },
              { screen: heads(reminder, bar(1) + list), log: 'Reminder posted: sound and a banner', say: 'Reminders still arrive as before. That is why each kind gets its own channel.' },
              { screen: bar(0) + list, log: ['createNotificationChannel(new_recipes, HIGH)', 'New recipes: still off'], say: 'An update creates <code>new_recipes</code> again with <code>HIGH</code>. Nothing changes: Sam’s choice wins.' },
            ],
          });
        },
        code: `const val NEW_RECIPES = "new_recipes"
const val REMINDERS = "cook_reminders"

// RecipesApp.onCreate: one channel for each kind of notification
val manager = getSystemService(NotificationManager::class.java)
val newRecipes = NotificationChannel(NEW_RECIPES, getString(R.string.channel_new_recipes), NotificationManager.IMPORTANCE_DEFAULT)
newRecipes.description = getString(R.string.channel_new_recipes_text)   // "A few times a week"
val reminders = NotificationChannel(REMINDERS, getString(R.string.channel_reminders), NotificationManager.IMPORTANCE_HIGH)
manager.createNotificationChannel(newRecipes)
manager.createNotificationChannel(reminders)

// Has the user blocked reminders, or all of Recipes?
fun remindersBlocked(context: Context): Boolean {
    val manager = context.getSystemService(NotificationManager::class.java)
    if (!manager.areNotificationsEnabled()) {
        return true
    }
    val channel = manager.getNotificationChannel(REMINDERS)
    return channel == null || channel.importance == NotificationManager.IMPORTANCE_NONE
}

// After explaining why, open the settings of that one channel
fun openReminderSettings(context: Context) {
    val intent = Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS)
    intent.putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
    intent.putExtra(Settings.EXTRA_CHANNEL_ID, REMINDERS)
    context.startActivity(intent)
}`,
        remember: 'One channel per kind, the quietest importance that fits. After the first create, the channel belongs to the user.',
        mistakes: [
          {
            title: 'Changing the importance in code',
            bad: `// version 2: new recipes should be louder now
NotificationChannel(NEW_RECIPES, name, NotificationManager.IMPORTANCE_HIGH)   // same id: no change`,
            good: `NotificationChannel("new_recipes_v2", name, NotificationManager.IMPORTANCE_HIGH)
manager.deleteNotificationChannel(NEW_RECIPES)`,
            why: 'Phones that already have <code>new_recipes</code> keep its importance. Only a new channel id gets the new default.',
          },
        ],
        terms: [
          { term: 'importance', def: 'How loud a channel’s notifications are, from <code>IMPORTANCE_HIGH</code> (sound and banner) to <code>IMPORTANCE_MIN</code> (only in the shade). <code>IMPORTANCE_NONE</code> means blocked.' },
          { term: 'heads-up notification', def: 'A banner that floats over the app on screen for a moment. Only channels with <code>IMPORTANCE_HIGH</code> show it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the reminders channel urgent: a sound and a heads-up banner. Then add it.', code: 'val reminders = NotificationChannel(\n    REMINDERS,\n    getString(R.string.channel_reminders),\n    NotificationManager.[[IMPORTANCE_HIGH]]\n)\nmanager.[[createNotificationChannel]](reminders)', why: 'Only <code>IMPORTANCE_HIGH</code> shows a heads-up banner. <code>createNotificationChannel</code> adds the channel, and does nothing if it exists.' },
          { type: 'bug', prompt: '<code>remindersBlocked</code> says “blocked” exactly when reminders are at their loudest. Tap the line that needs to change.', code: 'fun remindersBlocked(context: Context): Boolean {\n    val manager = context.getSystemService(NotificationManager::class.java)\n    val channel = manager.getNotificationChannel(REMINDERS)\n    return channel == null || channel.importance == NotificationManager.IMPORTANCE_HIGH\n}', bug: 3, fix: '    return channel == null || channel.importance == NotificationManager.IMPORTANCE_NONE', why: 'A channel the user turned off has <code>IMPORTANCE_NONE</code>. <code>IMPORTANCE_HIGH</code> is the loudest it can be.' },
        ],
        quiz: [
          { q: 'Which importance makes a sound and shows a heads-up banner?', options: ['<code>IMPORTANCE_HIGH</code>', '<code>IMPORTANCE_DEFAULT</code>', '<code>IMPORTANCE_LOW</code>'], a: 0, why: '<code>DEFAULT</code> makes a sound without a banner. <code>LOW</code> is silent.' },
          { q: 'Why give new recipes and reminders their own channels?', options: ['So the user can turn off one and keep the other', 'Because a channel holds only one notification', 'So the app can change their sound later'], a: 0, why: 'Each channel has its own switch in Settings, and the user decides.' },
          { q: 'A notification is posted to a channel with <code>IMPORTANCE_LOW</code>. What does the user notice?', options: ['An icon in the status bar, no sound', 'A sound and a banner', 'Nothing at all'], a: 0, why: '<code>LOW</code> is silent but shows an icon. <code>MIN</code> drops the icon too.' },
        ],
        docs: [['Create and manage notification channels', 'https://developer.android.com/develop/ui/views/notifications/channels']],
      },

      {
        id: 'styles',
        title: 'Rich notifications',
        tagline: 'Open the app on a tap, show more than one line, and add buttons.',
        goals: ['Open the app when the user taps a notification, with a <code>PendingIntent</code>', 'Show long text or a list with <code>BigTextStyle</code> and <code>InboxStyle</code>', 'Add an action button that opens another part of the app'],
        level: 'intermediate',
        introduces: ['PendingIntent', 'getActivity', 'FLAG_IMMUTABLE', 'setContentIntent', 'setAutoCancel', 'setStyle', 'BigTextStyle', 'bigText', 'InboxStyle', 'addLine', 'BigPictureStyle', 'addAction'],
        body: `
<p>Lin taps “New recipe: Lemon pasta is ready in 20 minutes. Tap to…” and nothing happens. The text is cut after one line, and a tap doesn’t open anything. Both need a little more code.</p>
<p>The notification lives in Android’s shade, not in your app, so it can’t run your code when it is tapped. Instead you hand it a <code>PendingIntent</code>: an Intent wrapped so Android can start it later, for your app. <code>PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE)</code> wraps an Intent that starts an Activity. The <code>0</code> is a <em>request code</em>, a number you pick. Android 12 and newer require you to say whether the Intent inside may be changed; <code>FLAG_IMMUTABLE</code> means no, which is right almost always. <code>setContentIntent</code> sets what a tap does, and <code>setAutoCancel(true)</code> removes the notification after the tap. Add <code>Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK</code> to the Intent with <code>addFlags</code>: Recipes then starts fresh in its own task, instead of stacking a second <code>MainActivity</code> on top when it is already open.</p>
<p>Closed, a notification shows one line. <code>setStyle</code> gives it a bigger view when the user opens it with a swipe down. <code>NotificationCompat.BigTextStyle().bigText(text)</code> shows all of a long text. <code>NotificationCompat.InboxStyle()</code> with <code>addLine</code> shows short lines, such as three new recipes; only the first six are shown. <code>BigPictureStyle</code> shows a photo.</p>
<p><code>addAction(icon, label, pendingIntent)</code> adds a button under the text, up to three of them. A button must do something other than the tap, such as “Shopping list”, which opens that part of the app. Give each <code>PendingIntent</code> its own request code: Android treats two whose Intents differ only in their extras as the same one: the second call gets the first PendingIntent back, and the button opens what the tap opens.</p>`,
        visual(el) {
          const long = 'Lemon pasta is ready in 20 minutes. Tap to see the ingredients and steps.';
          const closed = note({ title: 'New recipe', text: long });
          const open = note({ title: 'New recipe', text: long, open: true, cls: 'plt-hi' });
          const withAct = on => note({ title: 'New recipe', text: long, acts: ['Shopping list'], on });
          const inbox = note({ title: '3 new recipes', text: 'Lemon pasta, 20 min', more: 'Bean stew, 90 min<br>Rice salad, 15 min' });
          const shop = screen('Shopping list', '<div class="ui-m-row"><div>Lemons · 2</div></div><div class="ui-m-row"><div>Basil · 1 bunch</div></div><div class="ui-m-row"><div>Parmesan · 100 g</div></div>');
          const list = screen('Recipes', '<div class="ui-m-row"><div>Lemon pasta · 20 min</div></div><div class="ui-m-row"><div>Bean stew · 90 min</div></div>');
          Lab.ui.phone(el, {
            logTitle: 'Your code',
            predict: {
              q: 'A notification has no <code>setContentIntent</code>. Lin taps it. What happens?',
              options: ['Nothing opens', 'Recipes opens on its start screen', 'Android asks which app to open'],
              a: 0,
              why: 'Without a PendingIntent, Android has nothing to start. The tap action is yours to give.',
            },
            frames: [
              { screen: shade(closed), say: 'A plain notification: one line, cut off. A tap opens nothing, because no <code>PendingIntent</code> was set.' },
              { screen: shade(open), log: '.setStyle(NotificationCompat.BigTextStyle().bigText(text))', say: 'With <code>BigTextStyle</code>, Lin swipes the notification down and reads all of it.' },
              { screen: shade(inbox), log: 'NotificationCompat.InboxStyle().addLine(…)', say: 'Three new recipes at once? <code>InboxStyle</code> gives one line each, in a single notification.' },
              { screen: shade(withAct()), log: '.addAction(R.drawable.ic_cart, "Shopping list", toShopping)', say: 'An action button under the text, with its own <code>PendingIntent</code> and request code 1.' },
              { screen: shade(withAct(0)), tap: '.plt-act', say: 'Lin taps Shopping list. Android starts the Intent inside that PendingIntent.' },
              { screen: shop, log: 'intent.getStringExtra("open")  // "shopping"', say: '<code>MainActivity</code> reads the extra and shows the shopping list.' },
              { screen: shade(withAct()), tap: '.plt-note', say: 'Another day: Lin taps the notification itself, not the button.' },
              { screen: list, log: 'setAutoCancel(true): removed from the shade', say: 'The tap’s PendingIntent opens Recipes, and <code>setAutoCancel(true)</code> clears the notification.' },
            ],
          });
        },
        code: `fun showNewRecipe(context: Context, recipe: Recipe) {
    if (!canNotify(context)) {
        return
    }
    val text = "\${recipe.title} is ready in \${recipe.minutes} minutes. Tap to see the ingredients and steps."

    // A tap opens Recipes, fresh in its own task
    val open = Intent(context, MainActivity::class.java)
    open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
    val tap = PendingIntent.getActivity(context, 0, open, PendingIntent.FLAG_IMMUTABLE)

    // The button opens the shopping list: its own request code, 1
    val shopping = Intent(context, MainActivity::class.java)
    shopping.putExtra("open", "shopping")
    val toShopping = PendingIntent.getActivity(context, 1, shopping, PendingIntent.FLAG_IMMUTABLE)

    val notification = NotificationCompat.Builder(context, NEW_RECIPES)
        .setSmallIcon(R.drawable.ic_recipe)
        .setContentTitle("New recipe")
        .setContentText(text)                                         // the one line
        .setStyle(NotificationCompat.BigTextStyle().bigText(text))    // all of it, when opened
        .setContentIntent(tap)
        .setAutoCancel(true)                                          // gone after the tap
        .addAction(R.drawable.ic_cart, "Shopping list", toShopping)
        .build()
    NotificationManagerCompat.from(context).notify(recipe.id, notification)
}

// Several recipes at once: one line each
val style = NotificationCompat.InboxStyle()
    .addLine("Lemon pasta, 20 min")
    .addLine("Bean stew, 90 min")
    .addLine("Rice salad, 15 min")

// MainActivity.onCreate
val open = intent.getStringExtra("open")     // "shopping" after the button, null after a tap`,
        remember: 'A PendingIntent for the tap, a style for more text, up to three actions, each PendingIntent with its own request code.',
        mistakes: [
          {
            title: 'The same request code for two PendingIntents',
            bad: `val tap = PendingIntent.getActivity(context, 0, open, PendingIntent.FLAG_IMMUTABLE)
val toShopping = PendingIntent.getActivity(context, 0, shopping, PendingIntent.FLAG_IMMUTABLE)`,
            good: `val tap = PendingIntent.getActivity(context, 0, open, PendingIntent.FLAG_IMMUTABLE)
val toShopping = PendingIntent.getActivity(context, 1, shopping, PendingIntent.FLAG_IMMUTABLE)`,
            why: 'The two Intents differ only in an extra, and Android doesn’t compare extras. With the same request code, the second call gets the first PendingIntent back, and the button opens what the tap opens.',
          },
        ],
        terms: [
          { term: 'PendingIntent', def: 'An Intent wrapped so that Android can start it later for your app, for example when a notification is tapped.' },
          { term: 'request code', def: 'A number you give each <code>PendingIntent</code> so Android can tell apart ones whose Intents look the same.' },
          { term: 'notification style', def: 'A bigger view for a notification, set with <code>setStyle</code>: <code>BigTextStyle</code>, <code>InboxStyle</code> or <code>BigPictureStyle</code>.' },
          { term: 'action button', def: 'A button under a notification’s text, added with <code>addAction</code>. A notification can have up to three.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show all of a long text when the notification is opened, and open Recipes on a tap.', code: 'NotificationCompat.Builder(context, NEW_RECIPES)\n    .setSmallIcon(R.drawable.ic_recipe)\n    .setContentTitle("New recipe")\n    .setContentText(text)\n    .setStyle(NotificationCompat.[[BigTextStyle]]().bigText(text))\n    .[[setContentIntent]](tap)\n    .build()', why: '<code>BigTextStyle</code> gives the long text room. <code>setContentIntent</code> sets the PendingIntent that a tap starts.' },
          { type: 'bug', prompt: 'On Android 12 and newer, this line throws <code>IllegalArgumentException</code>. Tap it.', code: 'val open = Intent(context, MainActivity::class.java)\nval tap = PendingIntent.getActivity(context, 0, open, 0)\nbuilder.setContentIntent(tap)', bug: 1, fix: 'val tap = PendingIntent.getActivity(context, 0, open, PendingIntent.FLAG_IMMUTABLE)', why: 'Android 12 and newer require you to say whether the Intent may be changed. <code>FLAG_IMMUTABLE</code> says it may not.' },
        ],
        quiz: [
          { q: 'Why does a notification need a <code>PendingIntent</code> to open your app?', options: ['The notification lives in Android’s shade, so Android starts the Intent later for your app', 'A normal Intent is too slow', 'Only a PendingIntent can carry extras'], a: 0, why: 'Your code isn’t running when the user taps. Android starts the wrapped Intent for you.' },
          { q: 'How many action buttons can a notification have?', options: ['Up to three', 'One', 'As many as you like'], a: 0, why: 'Up to three, and none should repeat what the tap does.' },
          { q: 'You add eight lines with <code>InboxStyle</code>. How many does Lin see?', options: ['The first six', 'All eight', 'Only the last one'], a: 0, why: 'InboxStyle shows at most six lines.' },
        ],
        docs: [['Create an expandable notification', 'https://developer.android.com/develop/ui/views/notifications/expanded'], ['Create a notification', 'https://developer.android.com/develop/ui/views/notifications/build-notification']],
      },

      {
        id: 'fcm',
        title: 'Firebase Cloud Messaging',
        tagline: 'Your server can’t reach a phone by itself. FCM can, even when the app isn’t running.',
        goals: ['Explain why push messages go through Firebase Cloud Messaging', 'Add Firebase to Recipes with the Firebase BoM', 'Receive a message in a <code>FirebaseMessagingService</code>'],
        level: 'intermediate',
        introduces: ['FirebaseMessagingService', 'onMessageReceived', 'RemoteMessage'],
        body: `
<p>So far the app posted its own notifications. But a new recipe appears on the server while Lin’s phone is in her pocket and Recipes isn’t running. The app can’t keep its own connection to the server open all day: that would drain the battery, and Android stops apps the user isn’t using. <em>Firebase Cloud Messaging</em> (FCM) is a Google service that delivers small messages from your server to your app, even when the app isn’t running. Such a message is called a <em>push</em>. FCM needs the Google Play Store app on the phone, and Android 7.0 or newer; Recipes already needs 8.0.</p>
<p>To set it up, create a project in the Firebase console and add your app with its package name, <code>com.example.recipes</code>. The console gives you a file, <code>google-services.json</code>, which goes in the app folder, next to the app’s <code>build.gradle.kts</code>. In Gradle, add the <code>google-services</code> plugin, which reads that file, and the Firebase BoM. It works like the Compose BOM: inside <code>platform(...)</code>, it picks matching versions for all Firebase libraries, so the <code>firebase-messaging</code> line needs no version.</p>
<p>FCM hands messages to a <em>service</em>: a part of your app that Android can start without a screen. Write a class that extends <code>FirebaseMessagingService</code>, and list it in the manifest as a <code>&lt;service&gt;</code> with the <code>com.google.firebase.MESSAGING_EVENT</code> action. <code>android:exported="false"</code> keeps other apps from starting it. Then override <code>onMessageReceived(message: RemoteMessage)</code>. When a message for this phone arrives, Android starts Recipes in the background if it isn’t running, and FCM calls this function.</p>
<p><code>message.data</code> holds what the server put in: keys and values, all text, like <code>"recipeId"</code> and <code>"42"</code>. For a first test, write it to Logcat. Your server picks the phone by an ID that FCM gives each install of the app.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            predict: {
              q: 'Recipes isn’t running when a message for Lin’s phone arrives. What happens?',
              options: ['Android starts Recipes in the background, and <code>onMessageReceived</code> runs', 'The message waits until Lin opens Recipes', 'FCM throws the message away'],
              a: 0,
              why: 'That is what FCM is for: Android starts the app in the background and hands the message to your service.',
            },
            nodes: [
              { id: 'server', label: 'Your server', sub: 'has a new recipe' },
              { id: 'fcm', label: 'FCM', sub: 'Google’s service' },
              { id: 'app', label: 'Your service', sub: 'on Lin’s phone' },
              { id: 'log', label: 'Logcat' },
            ],
            frames: [
              { say: 'A new recipe is on the server. Lin’s phone is in her pocket, and Recipes isn’t running. Your server can’t reach the phone by itself.' },
              { at: 'fcm', packet: '{ data }', say: 'Your server hands FCM a message for Lin’s phone, with data: <code>"recipeId"</code> is <code>"42"</code>.' },
              { at: 'app', packet: 'recipeId = 42', mark: { app: 'ok' }, say: 'FCM delivers it. Android starts Recipes in the background, and FCM calls <code>onMessageReceived(message)</code> in your service.' },
              { at: 'log', packet: 'Message: {recipeId=42}', tone: 'ok', mark: { log: 'ok' }, say: 'Your code writes <code>message.data</code> to Logcat. Kotlin prints the keys and values as <code>{recipeId=42}</code>.' },
              { at: 'app', packet: 'done', tone: 'warm', mark: { app: 'warm' }, say: 'Nothing appeared on Lin’s screen: your code only logged the message. What the app does with a message is up to you.' },
            ],
          });
        },
        code: `// build.gradle.kts of the project:
// plugins {
//     id("com.google.gms.google-services") version "4.5.0" apply false
// }
// app/build.gradle.kts, with google-services.json in the app folder:
// plugins {
//     id("com.google.gms.google-services")
// }
// dependencies {
//     implementation(platform("com.google.firebase:firebase-bom:35.0.2"))   // like the Compose BOM
//     implementation("com.google.firebase:firebase-messaging")             // the BoM picks the version
// }

// AndroidManifest.xml, inside <application>:
// <service android:name=".RecipesMessagingService" android:exported="false">
//     <intent-filter>
//         <action android:name="com.google.firebase.MESSAGING_EVENT" />
//     </intent-filter>
// </service>

class RecipesMessagingService : FirebaseMessagingService() {
    // FCM calls this when a message for this phone arrives
    override fun onMessageReceived(message: RemoteMessage) {
        Log.d("Push", "Message: \${message.data}")
    }
}

// Logcat:  Push  com.example.recipes  D  Message: {recipeId=42}`,
        remember: 'FCM delivers your server’s messages to the phone; your FirebaseMessagingService receives them in onMessageReceived.',
        mistakes: [
          {
            title: 'Adding the BoM without <code>platform(...)</code>',
            bad: `implementation("com.google.firebase:firebase-bom:35.0.2")
implementation("com.google.firebase:firebase-messaging")`,
            good: `implementation(platform("com.google.firebase:firebase-bom:35.0.2"))
implementation("com.google.firebase:firebase-messaging")`,
            why: 'As with the Compose BOM, the versions only come from it inside <code>platform(...)</code>. Without it, nothing gives <code>firebase-messaging</code> a version, and the Gradle sync fails.',
          },
        ],
        terms: [
          { term: 'Firebase Cloud Messaging', def: 'FCM: a Google service that delivers small messages from your server to your app, even when the app isn’t running.' },
          { term: 'push message', def: 'A message your server sends to the phone through FCM, instead of the app asking for it.' },
          { term: 'FirebaseMessagingService', def: 'The class you extend to hear from FCM. List it in the manifest as a <code>&lt;service&gt;</code> with the <code>MESSAGING_EVENT</code> action.' },
          { term: 'google-services.json', def: 'The file the Firebase console gives you for your app. It goes in the app folder, and the <code>google-services</code> plugin reads it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Receive messages from FCM and write their data to Logcat.', code: 'class RecipesMessagingService : [[FirebaseMessagingService]]() {\n    override fun [[onMessageReceived]](message: RemoteMessage) {\n        Log.d("Push", "Message: ${message.data}")\n    }\n}', why: 'The service extends <code>FirebaseMessagingService</code>, and FCM calls <code>onMessageReceived</code> with each message.' },
          { type: 'bug', prompt: 'The server sends messages, but <code>onMessageReceived</code> never runs. Tap the line in the manifest that needs to change.', code: '<service android:name=".RecipesMessagingService" android:exported="false">\n    <intent-filter>\n        <action android:name="android.intent.action.VIEW" />\n    </intent-filter>\n</service>', bug: 2, fix: '        <action android:name="com.google.firebase.MESSAGING_EVENT" />', why: 'FCM looks for the service that has the <code>com.google.firebase.MESSAGING_EVENT</code> action. <code>VIEW</code> is for links.' },
        ],
        quiz: [
          { q: 'Why can’t Recipes keep its own connection to the server open, waiting for new recipes?', options: ['It would drain the battery, and Android stops apps the user isn’t using', 'Servers can only send email', 'Android allows only one app on the internet at a time'], a: 0, why: 'FCM delivers the message for you, even when the app isn’t running.' },
          { q: 'Why does the <code>firebase-messaging</code> line have no version?', options: ['The Firebase BoM, inside <code>platform(...)</code>, picks it', 'Gradle always takes the newest one', '<code>google-services.json</code> holds it'], a: 0, why: 'Like the Compose BOM, the Firebase BoM gives every Firebase library a matching version.' },
          { q: 'Where does <code>google-services.json</code> go?', options: ['In the app folder, next to the app’s <code>build.gradle.kts</code>', 'In <code>res/values</code>', 'On your server'], a: 0, why: 'The <code>google-services</code> plugin reads it from the app folder when the app is built.' },
        ],
        docs: [['Add Firebase to your Android project', 'https://firebase.google.com/docs/android/setup'], ['Set up a Firebase Cloud Messaging client app on Android', 'https://firebase.google.com/docs/cloud-messaging/android/client']],
      },

      {
        id: 'fcm-registration',
        title: 'Registering with FCM',
        tagline: 'FCM gives each install an ID. Your server needs it to reach that phone.',
        goals: ['Receive this install’s ID in <code>onRegistered</code> and send it to your server', 'Upload it from an app-wide scope that keeps going after the service stops', 'Keep the server’s list right: register at every start, and tell the server on sign-out'],
        level: 'intermediate',
        introduces: ['onRegistered', 'FirebaseMessaging', 'getInstance', 'register', 'unregister', 'CoroutineScope'],
        body: `
<p>Recipes can receive messages now, but how does your server name Lin’s phone? FCM gives each install of the app an ID, the <em>Firebase installation ID</em>. The server sends messages to that ID, so it has to know it, and which user it belongs to. Turn this on with one line in the manifest, the <code>firebase_messaging_installation_id_enabled</code> meta-data. The ID changes when the app is restored on a new phone, reinstalled, or its data is cleared.</p>
<p>Override <code>onRegistered(installationId)</code> in your service. FCM calls it when this install is first registered, again when the ID changes or the registration is refreshed (after an app update, for example), and every time you call <code>FirebaseMessaging.getInstance().register()</code>. Each time, send the ID to your server with the user’s access token; the server keeps it next to the user, with the time. Call <code>register()</code> in <code>RecipesApp.onCreate</code>, so every start sends the ID again and repairs an upload that failed. Call it after Ada signs in too, so her phone is linked at once.</p>
<p><code>onRegistered</code> already runs on a background thread, but it isn’t a coroutine, so it has to launch one to call the upload. Not in a scope of the service’s own: Android stops the service as soon as <code>onRegistered</code> returns, and that scope would be cancelled in the middle of the upload. Use one scope for the whole app instead. <code>CoroutineScope(Dispatchers.IO)</code> makes a scope whose coroutines run on the IO threads, and nothing cancels it. A Hilt module makes it once, with <code>@Singleton</code>. Android, not Hilt, creates the service, so there is no constructor to mark: put <code>@AndroidEntryPoint</code> on the service, and Hilt fills in each property marked <code>@Inject lateinit var</code>.</p>
<p>When Ada signs out, her pushes must stop reaching this phone. <code>FirebaseMessaging.getInstance().unregister()</code> stops FCM’s deliveries, but Recipes registers again at its next start, so only your server can really forget her. Before deleting the tokens, send it a sign-out request. Older code uses a registration token, with <code>getToken</code> and <code>onNewToken</code>; Firebase deprecated it in June 2026 (firebase-messaging 25.1.0) for installation IDs.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            predict: {
              q: 'Lin clears Recipes’ data in Settings. What happens to her installation ID?',
              options: ['It changes, and <code>onRegistered</code> runs with the new one', 'It stays the same', 'FCM stops working on her phone'],
              a: 0,
              why: 'Clearing the app’s data, reinstalling it, or restoring it on a new phone gives a new ID. Send each one to your server.',
            },
            nodes: [
              { id: 'app', label: 'Recipes app', sub: 'on Lin’s phone' },
              { id: 'fcm', label: 'FCM', sub: 'Google’s service' },
              { id: 'server', label: 'Your server', sub: 'recipes and users' },
            ],
            frames: [
              { say: 'Three parts: the app on Lin’s phone, FCM, and your own server. The server needs this phone’s ID before it can send anything.' },
              { at: 'fcm', packet: 'register()', say: 'Recipes starts, and <code>RecipesApp.onCreate</code> calls <code>register()</code>. The Firebase library registers this install with FCM.' },
              { at: 'app', packet: 'ID cQ3k…', mark: { fcm: 'ok' }, say: 'FCM answers with this install’s ID and calls <code>onRegistered("cQ3k…")</code> in your service.' },
              { at: 'server', packet: 'POST devices: cQ3k…', mark: { server: 'ok' }, say: 'A coroutine in the app-wide scope sends the ID with Lin’s access token. The server keeps it next to Lin, with the time.' },
              { at: 'fcm', packet: 'to cQ3k…: New recipe', say: 'Days later, a new recipe is out. Your server asks FCM to deliver a message to <code>cQ3k…</code>.' },
              { at: 'app', packet: 'New recipe', tone: 'ok', mark: { app: 'ok' }, say: 'FCM delivers it to Lin’s phone, and <code>onMessageReceived</code> runs.' },
              { at: 'app', packet: 'ID fH2x…', tone: 'warm', mark: { app: 'warm', server: '' }, say: 'Lin clears the app’s data. The install gets a new ID, and <code>onRegistered("fH2x…")</code> runs.' },
              { at: 'server', packet: 'POST devices: fH2x…', tone: 'ok', mark: { server: 'ok' }, say: 'The new ID goes to the server too. When FCM reports that the old one is no longer valid, the server deletes it.' },
            ],
          });
        },
        code: `// AndroidManifest.xml, inside <application>: use installation IDs
// <meta-data android:name="firebase_messaging_installation_id_enabled" android:value="true" />

// One scope for the whole app, made once by Hilt
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun provideAppScope(): CoroutineScope = CoroutineScope(Dispatchers.IO)   // nothing cancels it
}

@AndroidEntryPoint
class RecipesMessagingService : FirebaseMessagingService() {
    @Inject lateinit var session: Session              // Hilt fills these in
    @Inject lateinit var appScope: CoroutineScope

    // First registration, a new ID, a refresh, and after every register()
    override fun onRegistered(installationId: String) {
        appScope.launch {                               // keeps going after the service stops
            try {
                session.registerDevice(installationId)
            } catch (e: IOException) {
                // offline: the next start calls register(), and this runs again
            } catch (e: HttpException) {
                // the server said no: the same, it is sent again at the next start
            }
        }
    }

    // onMessageReceived as before
}

// RecipesApp.onCreate, after the channels: every start sends the ID again
FirebaseMessaging.getInstance().register()

// RecipeApi: two more calls
@POST("devices")
suspend fun registerDevice(@Header("Authorization") auth: String, @Body device: Device)

@POST("logout")
suspend fun logout(@Header("Authorization") auth: String)

@Serializable
data class Device(val installationId: String)

// Session: link this phone to the signed-in user
suspend fun registerDevice(installationId: String) {
    val token = store.data.first()[ACCESS_TOKEN]
    if (token == null) {
        return                                           // not signed in: nothing to link
    }
    api.registerDevice("Bearer $token", Device(installationId))
}

// Session: the server forgets this phone for Ada, then the tokens go
suspend fun signOut() {
    val token = store.data.first()[ACCESS_TOKEN]
    if (token != null) {
        api.logout("Bearer $token")
    }
    store.edit { settings ->
        settings.remove(ACCESS_TOKEN)
        settings.remove(REFRESH_TOKEN)
    }
}

// After a successful sign-in: run onRegistered again, now with Ada’s token
FirebaseMessaging.getInstance().register()`,
        remember: 'FCM reaches the phone through its installation ID. Send every ID from onRegistered to your server, from an app-wide scope, and call register() at every start.',
        mistakes: [
          {
            title: 'Giving the service its own scope',
            bad: `private val scope = CoroutineScope(Dispatchers.IO)

override fun onDestroy() {
    scope.cancel()                 // runs right after onRegistered returns
    super.onDestroy()
}`,
            good: `@Inject lateinit var appScope: CoroutineScope   // the app-wide one from AppModule`,
            why: 'Android stops a <code>FirebaseMessagingService</code> as soon as <code>onRegistered</code> returns. <code>onDestroy</code> then cancels the scope, and the upload with it, nearly every time.',
          },
        ],
        terms: [
          { term: 'installation ID', def: 'The ID FCM gives one install of your app. Your server sends messages to it. It changes when the app is reinstalled, restored on a new phone, or its data is cleared.' },
          { term: 'onRegistered', def: 'The function in your <code>FirebaseMessagingService</code> that FCM calls with the installation ID: at the first registration, when the ID changes or is refreshed, and after each <code>register()</code>.' },
          { term: 'app-wide scope', def: 'One <code>CoroutineScope</code> for the whole app, made once (here by Hilt, with <code>@Singleton</code>). Nothing cancels it, so its coroutines outlive screens and services.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Hear the installation ID from FCM, and start the upload in the app-wide scope.', code: 'override fun [[onRegistered]](installationId: String) {\n    appScope.[[launch]] {\n        try {\n            session.registerDevice(installationId)\n        } catch (e: IOException) {\n        }\n    }\n}', why: 'FCM calls <code>onRegistered</code> with the ID. It isn’t a coroutine, so <code>launch</code> starts one in the app-wide scope.' },
          { type: 'bug', prompt: 'Signed-in users never get pushes, and signed-out phones send requests that fail. Tap the line that needs to change.', code: 'suspend fun registerDevice(installationId: String) {\n    val token = store.data.first()[ACCESS_TOKEN]\n    if (token != null) {\n        return\n    }\n    api.registerDevice("Bearer $token", Device(installationId))\n}', bug: 2, fix: '    if (token == null) {', why: 'Stop only when there is no token, because nobody is signed in. With a token, send the ID.' },
        ],
        quiz: [
          { q: 'Which of these gives Lin’s install a new installation ID?', options: ['Clearing the app’s data', 'An update from Google Play', 'Turning the phone off and on'], a: 0, why: 'Clearing data, reinstalling and restoring on a new phone give a new ID. An update only refreshes the registration, with the same ID; <code>onRegistered</code> runs either way.' },
          { q: 'Why does the upload run in the app-wide scope, not in a scope of the service’s own?', options: ['Android stops the service as soon as <code>onRegistered</code> returns, and its own scope would be cancelled with it', 'A service can’t start coroutines', 'The app-wide scope makes the upload faster'], a: 0, why: 'The app-wide scope isn’t tied to the service, so the upload can finish after the service has stopped.' },
          { q: 'Why call <code>register()</code> in <code>RecipesApp.onCreate</code>?', options: ['Each call runs <code>onRegistered</code>, so every start sends the ID again and repairs a failed upload', 'Without it, notifications can’t be shown', 'It makes a new installation ID at every start'], a: 0, why: 'FCM keeps the ID it has. <code>register()</code> only makes <code>onRegistered</code> run again with it.' },
        ],
        docs: [['Set up a Firebase Cloud Messaging client app on Android', 'https://firebase.google.com/docs/cloud-messaging/android/client'], ['Best practices for FCM registration management', 'https://firebase.google.com/docs/cloud-messaging/manage-tokens']],
      },

      {
        id: 'messages',
        title: 'Message types',
        tagline: 'A notification message is shown for you. A data message is handed to your code.',
        goals: ['Tell a notification message from a data message by its JSON', 'Predict who shows a push, Android or your code, with the app open or closed', 'Handle a data message in <code>onMessageReceived</code> and show your own notification'],
        level: 'intermediate',
        introduces: [],
        body: `
<p>The server sends “New recipe: Lemon pasta” to Lin twice: once while she is cooking with Recipes open, and once while the phone is in her pocket. What happens depends on two things: what the server puts in the message, and whether Recipes is on screen.</p>
<p>FCM messages come in two kinds. A <em>notification message</em> has a <code>notification</code> block with a title and a body: text meant for the user. A <em>data message</em> has only a <code>data</code> block: keys and values, all text, that only your app understands, like <code>"recipeId": "42"</code>. A message can have both. Either way it is small, at most 4 KB, so send the recipe’s id and let the app load the rest.</p>
<p>When Recipes isn’t on screen, a notification message is shown by Android for you, in the channel your manifest names, and none of your code runs. A tap opens the app’s launcher Activity, and the message’s data arrives as extras of its Intent. A data message instead goes to your service, as in the FCM lesson: FCM calls <code>onMessageReceived(message)</code>, you read <code>message.data</code>, and you post a notification yourself, with your channel, style and buttons. When Recipes is on screen, both kinds go to <code>onMessageReceived</code>, and nothing appears unless your code shows it.</p>
<p><code>onMessageReceived</code> gets only a few seconds, so keep the work in it short: read the message and post a notification.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            predict: {
              q: 'Lin’s phone is in her pocket; Recipes isn’t on screen. The server sends a message with only a <code>data</code> block. Who shows a notification?',
              options: ['Your code, in <code>onMessageReceived</code>', 'Android, by itself', 'Nobody: data messages are never shown'],
              a: 0,
              why: 'A data message always goes to <code>onMessageReceived</code>. Android shows nothing for it; your code posts the notification.',
            },
            nodes: [
              { id: 'server', label: 'Your server', sub: 'sends JSON' },
              { id: 'fcm', label: 'FCM' },
              { id: 'code', label: 'onMessageReceived', sub: 'your code' },
              { id: 'shade', label: 'Notification shade' },
            ],
            frames: [
              { say: 'One push, four places. Watch whether it passes through your code on its way to the shade.' },
              { at: 'server', packet: '{ notification }', say: 'Case 1: a notification message, with a title and a body. Recipes isn’t on screen.' },
              { at: 'fcm', packet: '{ notification }', say: 'FCM delivers it to Lin’s phone.' },
              { at: 'shade', packet: 'New recipe', tone: 'warm', mark: { code: 'muted', shade: 'warm' }, say: 'Android shows it for you, in the default channel from the manifest. Your code never ran.' },
              { at: 'server', packet: '{ data }', mark: { code: '', shade: '' }, say: 'Case 2: a data message, <code>"recipeId": "42"</code>. Recipes still isn’t on screen.' },
              { at: 'code', packet: 'data["recipeId"] = "42"', mark: { code: 'ok' }, say: 'This time FCM calls <code>onMessageReceived</code>. Your code reads the data.' },
              { at: 'shade', packet: 'Lemon pasta, 20 min', tone: 'ok', mark: { shade: 'ok' }, say: 'Your code posts the notification: your channel, your style, your buttons.' },
              { at: 'code', packet: '{ notification }', tone: 'warm', mark: { code: 'ok', shade: 'muted' }, say: 'Case 3: Recipes is on screen. Now even a notification message goes to <code>onMessageReceived</code>, and nothing appears unless your code shows it.' },
            ],
          });
        },
        code: `// What the server sends (only the part that matters here):
// a notification message
// { "notification": { "title": "New recipe", "body": "Lemon pasta, 20 min" },
//   "data": { "recipeId": "42" } }
// a data message
// { "data": { "recipeId": "42", "title": "Lemon pasta", "minutes": "20" } }

@AndroidEntryPoint
class RecipesMessagingService : FirebaseMessagingService() {
    // session, appScope and onRegistered as before

    // Data messages always; notification messages only while Recipes is on screen
    override fun onMessageReceived(message: RemoteMessage) {
        val id = message.data["recipeId"]?.toIntOrNull()
        val title = message.data["title"]
        if (id == null || title == null) {
            return                                   // not a recipe message
        }
        val minutes = message.data["minutes"]?.toIntOrNull() ?: 0   // all values are text
        showNewRecipe(this, Recipe(id = id, title = title, minutes = minutes, favorite = false))
    }
}

// AndroidManifest.xml, inside <application>: the channel Android uses
// when it shows a notification message for you
// <meta-data android:name="com.google.firebase.messaging.default_notification_channel_id"
//     android:value="new_recipes" />

// MainActivity.onCreate: a tapped notification message brings its data as extras
val recipeId = intent.getStringExtra("recipeId")    // "42", or null after a normal start`,
        remember: 'Notification message, app not on screen: Android shows it. Everything else goes to onMessageReceived.',
        mistakes: [
          {
            title: 'Reading the title of a data message from <code>notification</code>',
            bad: `val title = message.notification?.title     // null: a data message has no notification block`,
            good: `val title = message.data["title"]`,
            why: 'A data message carries only <code>data</code>, so <code>message.notification</code> is <code>null</code> and the recipe is never shown.',
          },
        ],
        terms: [
          { term: 'notification message', def: 'An FCM message with a <code>notification</code> block. When the app isn’t on screen, Android shows it without running your code.' },
          { term: 'data message', def: 'An FCM message with only a <code>data</code> block of text keys and values. It always goes to <code>onMessageReceived</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Receive a message and read the recipe id from its data.', code: 'override fun [[onMessageReceived]](message: RemoteMessage) {\n    val id = message.[[data]]["recipeId"]?.toIntOrNull()\n    if (id == null) {\n        return\n    }\n}', why: 'FCM calls <code>onMessageReceived</code>, and the keys and values are in <code>message.data</code>.' },
          { type: 'bug', prompt: 'This doesn’t compile: <code>minutes</code> must be an <code>Int</code>. Tap the line that needs to change.', code: 'val id = message.data["recipeId"]?.toIntOrNull()\nval title = message.data["title"]\nval minutes = message.data["minutes"]\nif (id == null || title == null) {\n    return\n}\nshowNewRecipe(this, Recipe(id = id, title = title, minutes = minutes, favorite = false))', bug: 2, fix: 'val minutes = message.data["minutes"]?.toIntOrNull() ?: 0', why: 'Every value in <code>data</code> is a <code>String?</code>. Turn it into a number with <code>toIntOrNull()</code>, with 0 when it is missing.' },
        ],
        quiz: [
          { q: 'Recipes isn’t on screen. A notification message arrives. What does your code do?', options: ['Nothing: Android shows it, and your code doesn’t run', '<code>onMessageReceived</code> shows it', 'It throws an exception'], a: 0, why: 'In that case, Android puts it in the shade by itself, in the manifest’s default channel.' },
          { q: 'Recipes is on screen. A notification message arrives. What does Lin see?', options: ['Nothing, unless <code>onMessageReceived</code> shows something', 'The notification, as when the app is closed', 'A heads-up banner'], a: 0, why: 'With the app on screen, every message goes to <code>onMessageReceived</code>, and your code decides.' },
          { q: 'Why send <code>"recipeId": "42"</code> instead of the whole recipe?', options: ['A message can carry at most 4 KB', 'FCM accepts only numbers', 'Data messages can’t have more than one key'], a: 0, why: 'Messages are small. Send the id, and let the app load the rest.' },
        ],
        docs: [['Receive messages in an Android app', 'https://firebase.google.com/docs/cloud-messaging/android/receive-messages'], ['About FCM messages', 'https://firebase.google.com/docs/cloud-messaging/concept-options']],
      },

      {
        id: 'deeplinks',
        title: 'Deep links',
        tagline: 'A link like recipes.example.com/recipe/42 opens recipe 42, not the start screen.',
        goals: ['Name the parts of a link: scheme, host and path', 'Make a Navigation route answer to a link, with an intent filter in the manifest', 'Open one recipe from a notification, with Back leading to the list'],
        level: 'intermediate',
        introduces: ['deepLinks', 'navDeepLink', 'basePath', 'BROWSABLE', 'pathPrefix', 'TaskStackBuilder', 'addNextIntentWithParentStack', 'getPendingIntent'],
        body: `
<p>Lin taps “New recipe: Lemon pasta” and lands on the list of 80 recipes, then has to find it herself. The notification should open recipe 42 directly. An address that opens one place inside an app is a <em>deep link</em>, like <code>https://recipes.example.com/recipe/42</code>. It has three parts: the <em>scheme</em>, <code>https</code>; the <em>host</em>, <code>recipes.example.com</code>; and the <em>path</em>, <code>/recipe/42</code>.</p>
<p>So far Recipes has one screen. It now gets a second one, for one recipe, and Navigation Compose moves between them, as in the water tracker: add the <code>navigation-compose</code> line to Gradle (Recipes already has the serialization plugin), make the routes <code>RecipeList</code> and <code>RecipeRoute(val id: Int)</code>, and put a <code>NavHost</code> in <code>setContent</code>. One change to <code>RecipesScreen</code>: it gets a new parameter, <code>onOpen: (Int) -&gt; Unit</code>, next to <code>viewModel</code> with its default <code>hiltViewModel()</code>. It hands <code>onOpen</code> on to <code>RecipesContent</code>, where a tap on a row reports that recipe’s id.</p>
<p>To make the recipe screen answer to a link, give its <code>composable</code> a <code>deepLinks</code> list with <code>navDeepLink&lt;RecipeRoute&gt;(basePath = "https://recipes.example.com/recipe")</code>. Navigation adds each property without a default value to the path, so the link matches <code>…/recipe/{id}</code>, and <code>/recipe/42</code> becomes <code>RecipeRoute(id = 42)</code>.</p>
<p>Android also has to know that <code>MainActivity</code> accepts these links; Navigation can’t add that to the manifest for you. Add an <code>&lt;intent-filter&gt;</code> with the <code>VIEW</code> action, the <code>DEFAULT</code> and <code>BROWSABLE</code> categories (<code>BROWSABLE</code> lets a link in a web page or a message reach it), and a <code>&lt;data&gt;</code> tag with the <code>scheme</code>, the <code>host</code> and a <code>pathPrefix</code>, which must start with <code>/</code>.</p>
<p>For the notification, make an Intent that names both the link and <code>MainActivity</code>, so it always reaches your app. <code>TaskStackBuilder.create(context).addNextIntentWithParentStack(link)</code> starts the app in a fresh task, and <code>getPendingIntent</code> wraps it: Navigation shows recipe 42 with the list under it, so Back goes to the list. A link that another app opens is different: from Android 12, an https link reaches your app only if your app is verified for that site; otherwise it opens in the browser, unless the user turns the link on by hand in Recipes’ “Open by default” settings.</p>`,
        visual(el) {
          const n = note({ title: 'New recipe', text: 'Lemon pasta, 20 min' });
          const recipe = screen('Lemon pasta', '<div class="plt-pic"></div><b>20 min · serves 2</b><div class="ui-m-line"></div><div class="ui-m-line short"></div>');
          const list = screen('Recipes', '<div class="ui-m-row"><div>Bean stew · 90 min</div></div><div class="ui-m-row"><div>Lemon pasta · 20 min</div></div><div class="ui-m-row"><div>Rice salad · 15 min</div></div>');
          const chat = screen('Chat with Sam', '<div class="ui-m-card"><span>Try this!</span><u class="plt-link">recipes.example.com/recipe/42</u></div>');
          const web = screen('Browser', '<span class="ui-m-muted">recipes.example.com/recipe/42</span><div class="plt-pic"></div><div class="ui-m-line"></div>');
          Lab.ui.phone(el, {
            logTitle: 'What happens',
            predict: {
              q: 'The notification’s PendingIntent comes from <code>TaskStackBuilder</code> with the deep link Intent. Lin taps it, reads recipe 42, then goes Back. Where does she land?',
              options: ['On the Recipes list', 'On the home screen', 'In the shade again'],
              a: 0,
              why: 'Started in a fresh task, Navigation puts the start screen, the list, under the recipe. Back goes there.',
            },
            frames: [
              { screen: shade(n), say: 'A new recipe notification. Its PendingIntent holds <code>ACTION_VIEW</code> with <code>https://recipes.example.com/recipe/42</code>, aimed at <code>MainActivity</code>.' },
              { screen: shade(n), tap: '.plt-note', log: 'MainActivity starts with …/recipe/42', say: 'Lin taps it. Android starts <code>MainActivity</code> in a fresh task, with the link in its Intent.' },
              { screen: recipe, log: '…/recipe/{id} matches: RecipeRoute(id = 42)', say: 'Navigation matches the link against <code>…/recipe/{id}</code> and shows recipe 42.' },
              { screen: list, log: 'Back: RecipeRoute(42) is removed', say: 'Back takes the recipe off the stack. Under it is the start screen, the list.' },
              { screen: bar(0) + home(), log: 'Back: the app goes to the background', say: 'Back again leaves the app.' },
              { screen: chat, tap: '.plt-link', say: 'Another day, Sam sends the same link in a chat app, and Lin taps it.' },
              { screen: web, log: 'not verified: the browser opens it', say: 'Android 12 and newer give an https link from another app to your app only when your app is verified for the site. Recipes isn’t, so the browser opens.' },
            ],
          });
        },
        code: `// app/build.gradle.kts, as in the water tracker:
// implementation("androidx.navigation:navigation-compose:2.10.2")

@Serializable object RecipeList
@Serializable data class RecipeRoute(val id: Int)

const val WEB = "https://recipes.example.com"

// New parameter: what a tap on a recipe does. The viewModel parameter stays as it was.
@Composable
fun RecipesScreen(onOpen: (Int) -> Unit, viewModel: RecipesViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    RecipesContent(state, onRefresh = { viewModel.refresh(force = true) }, onFavorite = { viewModel.toggleFavorite(it) }, onOpen = onOpen)
}
// In RecipesContent, each row: Modifier.clickable { onOpen(recipe.id) }

// MainActivity: setContent { ... }
val navController = rememberNavController()
NavHost(navController, startDestination = RecipeList) {
    composable<RecipeList> {
        RecipesScreen(onOpen = { id -> navController.navigate(RecipeRoute(id)) })
    }
    composable<RecipeRoute>(
        deepLinks = listOf(navDeepLink<RecipeRoute>(basePath = "$WEB/recipe"))   // matches …/recipe/{id}
    ) { entry ->
        val route: RecipeRoute = entry.toRoute()
        RecipeScreen(id = route.id)                   // the new screen: one recipe
    }
}

// AndroidManifest.xml, inside MainActivity's <activity>:
// <intent-filter>
//     <action android:name="android.intent.action.VIEW" />
//     <category android:name="android.intent.category.DEFAULT" />
//     <category android:name="android.intent.category.BROWSABLE" />
//     <data android:scheme="https" android:host="recipes.example.com" android:pathPrefix="/recipe" />
// </intent-filter>

// The notification opens recipe 42, with the list under it for Back
val link = Intent(Intent.ACTION_VIEW, Uri.parse("$WEB/recipe/\${recipe.id}"), context, MainActivity::class.java)
val tap = TaskStackBuilder.create(context)
    .addNextIntentWithParentStack(link)
    .getPendingIntent(recipe.id, PendingIntent.FLAG_IMMUTABLE)
builder.setContentIntent(tap)

// Try a link from the terminal; the package name at the end sends it to your app:
// adb shell am start -W -a android.intent.action.VIEW -d "https://recipes.example.com/recipe/42" com.example.recipes`,
        remember: 'A navDeepLink on the route, an intent filter in the manifest, and TaskStackBuilder so Back leads to the list.',
        mistakes: [
          {
            title: 'A path prefix without the slash',
            bad: `<data android:scheme="https" android:host="recipes.example.com" android:pathPrefix="recipe" />`,
            good: `<data android:scheme="https" android:host="recipes.example.com" android:pathPrefix="/recipe" />`,
            why: 'A path always starts with <code>/</code>, so <code>pathPrefix</code> needs it too. Without it, no link matches.',
          },
        ],
        terms: [
          { term: 'deep link', def: 'A link that opens one place inside an app, like <code>https://recipes.example.com/recipe/42</code>.' },
          { term: 'scheme, host, path', def: 'The parts of a link: <code>https</code>, then <code>recipes.example.com</code>, then <code>/recipe/42</code>.' },
          { term: 'BROWSABLE', def: 'An intent filter category that lets links from web pages and messages reach your Activity.' },
          { term: 'TaskStackBuilder', def: 'Builds a PendingIntent that starts your app in a fresh task, so Back leads through your app instead of out of it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let the recipe route answer to links that start with <code>https://recipes.example.com/recipe</code>.', code: 'composable<RecipeRoute>(\n    [[deepLinks]] = listOf(navDeepLink<RecipeRoute>([[basePath]] = "https://recipes.example.com/recipe"))\n) { entry ->\n    val route: RecipeRoute = entry.toRoute()\n    RecipeScreen(id = route.id)\n}', why: '<code>deepLinks</code> lists the links for this screen. <code>basePath</code> is the start; Navigation adds <code>/{id}</code> from the route.' },
          { type: 'bug', prompt: 'Tapping the notification opens the Recipes list, not recipe 42. Tap the line that needs to change.', code: 'val link = Intent(context, MainActivity::class.java)\nval tap = TaskStackBuilder.create(context)\n    .addNextIntentWithParentStack(link)\n    .getPendingIntent(recipe.id, PendingIntent.FLAG_IMMUTABLE)\nbuilder.setContentIntent(tap)', bug: 0, fix: 'val link = Intent(Intent.ACTION_VIEW, Uri.parse("$WEB/recipe/${recipe.id}"), context, MainActivity::class.java)', why: 'Without the link in the Intent, Navigation has nothing to match and shows the start screen. Put the address in, with <code>ACTION_VIEW</code>.' },
        ],
        quiz: [
          { q: 'In <code>https://recipes.example.com/recipe/42</code>, which part is the host?', options: ['<code>recipes.example.com</code>', '<code>https</code>', '<code>/recipe/42</code>'], a: 0, why: '<code>https</code> is the scheme, and <code>/recipe/42</code> is the path.' },
          { q: 'Recipes isn’t verified for its site. On Android 13, Lin taps <code>https://recipes.example.com/recipe/42</code> in a chat app. What opens?', options: ['The browser', 'Recipes, on recipe 42', 'A list of apps to choose from'], a: 0, why: 'From Android 12, an https link from another app reaches your app only when your app is verified for that site.' },
          { q: 'What does <code>BROWSABLE</code> in the intent filter allow?', options: ['Links in web pages and messages can reach the Activity', 'The Activity can open a browser', 'Other apps can read your recipes'], a: 0, why: 'Without it, a link tapped in a browser or a message can’t lead to your Activity.' },
        ],
        docs: [['Create deep links', 'https://developer.android.com/training/app-links/create-deeplinks'], ['Navigation: deep links', 'https://developer.android.com/guide/navigation/design/deep-link']],
      },

      {
        id: 'app-links',
        title: 'App Links',
        tagline: 'Your website vouches for your app, so its links open the app instead of the browser.',
        goals: ['Explain why Android sends unverified web links to the browser', 'Link the site and the app with <code>autoVerify</code> and <code>assetlinks.json</code>', 'Check the result with adb'],
        level: 'intermediate',
        introduces: ['autoVerify'],
        ignore: ['assetlinks', 'json', 'well', 'known', 'pm', 'verify', 're', 'get', 'links'],
        body: `
<p>Sam’s link to recipe 42 opened in the browser, though Lin has Recipes installed. That is on purpose. Any app can put <code>recipes.example.com</code> in its manifest, a fake one too. So since Android 12, a web link from another app goes to an app only when the site itself says the app is allowed. A link verified this way is an <em>App Link</em>.</p>
<p>The app half: put <code>android:autoVerify="true"</code> on the intent filter, and list both <code>http</code> and <code>https</code> as schemes, as Android’s guide asks. Navigation matches only the links in <code>deepLinks</code>, so add a second <code>navDeepLink</code> with an <code>http://</code> base path; otherwise an http link opens the list, not the recipe. The site half: a file at <code>https://recipes.example.com/.well-known/assetlinks.json</code> that names your package, <code>com.example.recipes</code>, and the SHA-256 <em>fingerprint</em> of the certificate that signs your app, a short code that only your signing key matches. The release build’s certificate is the one users install; you can list more fingerprints, for example the debug one too.</p>
<p>When the app is installed, Android downloads the file from every host in your filters and compares it with the app. The file must be served over HTTPS, as <code>application/json</code>, with no redirect, on each host. If the check fails, nothing crashes: links go to the browser, as before. Android 15 and newer check again in the background, and a change to the file can take up to a week to reach every phone; older versions check at install and update.</p>
<p>On a test phone you can run the check yourself with adb: <code>pm verify-app-links --re-verify</code> starts it; wait a few minutes, then <code>pm get-app-links</code> shows the result for each host. Only <code>verified</code> means it worked. If Google Play signs your app for you, the fingerprint from your own key won’t match: Play Console shows the right one under Release &gt; Setup &gt; App signing.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            predict: {
              q: 'The server answers the request for <code>assetlinks.json</code> with a redirect to another address. Lin taps a recipe link in a chat on Android 14. What opens?',
              options: ['The browser', 'Recipes', 'A message that the link is broken'],
              a: 0,
              why: 'The file must be served without redirects. The check fails, so the link goes to the browser.',
            },
            nodes: [
              { id: 'chat', label: 'Link in a chat<small>…/recipe/42</small>', x: 22, y: 12 },
              { id: 'android', label: 'Android', x: 78, y: 50, tone: 'muted' },
              { id: 'site', label: 'Website<small>assetlinks.json</small>', x: 78, y: 12, tone: 'warm' },
              { id: 'app', label: 'Recipes app<small>autoVerify</small>', x: 22, y: 86 },
              { id: 'browser', label: 'Browser', x: 78, y: 86, tone: 'muted' },
            ],
            frames: [
              { say: 'Recipes asks for <code>recipes.example.com</code> links, with <code>autoVerify="true"</code>. The site has an <code>assetlinks.json</code> file.' },
              { add: [['android', 'site', 'download']], hl: ['android'], say: 'Lin installs Recipes. Android downloads <code>/.well-known/assetlinks.json</code> from the host in the filter.' },
              { add: [['site', 'app', 'names it', 'ok']], hl: ['site', 'app'], say: 'The file names <code>com.example.recipes</code> and the fingerprint of the app’s certificate. Both match the installed app.' },
              { add: [['android', 'app', 'verified', 'ok']], hl: ['app'], say: 'Android marks the host as verified for Recipes.' },
              { add: [['chat', 'app', 'opens', 'ok']], hl: ['chat', 'app'], say: 'Now a tap on the link in the chat opens recipe 42 in Recipes, with no browser in between.' },
              { remove: [['site', 'app'], ['android', 'app'], ['chat', 'app']], add: [['android', 'site', 'redirect', 'err']], hl: ['site'], say: 'Another app, another site: here the server answers the request for the file with a redirect.' },
              { add: [['chat', 'browser', 'opens', 'err']], hl: ['browser'], say: 'The check fails, so the host isn’t verified. No crash, no error: links go to the browser.' },
            ],
          });
        },
        code: `<!-- AndroidManifest.xml, MainActivity -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="http" />
    <data android:scheme="https" />
    <data android:host="recipes.example.com" />
    <data android:pathPrefix="/recipe" />
</intent-filter>

// On the site: https://recipes.example.com/.well-known/assetlinks.json
// [{
//   "relation": ["delegate_permission/common.handle_all_urls"],
//   "target": {
//     "namespace": "android_app",
//     "package_name": "com.example.recipes",
//     "sha256_cert_fingerprints": ["14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5"]
//   }
// }]

// NavHost: the recipe route answers to both schemes
// deepLinks = listOf(
//     navDeepLink<RecipeRoute>(basePath = "https://recipes.example.com/recipe"),
//     navDeepLink<RecipeRoute>(basePath = "http://recipes.example.com/recipe"),
// )

// Check it on a test phone (Android 12 and newer):
// adb shell pm verify-app-links --re-verify com.example.recipes
// (wait a few minutes)
// adb shell pm get-app-links com.example.recipes
// com.example.recipes:
//     ID: …
//     Signatures: […]
//     Domain verification state:
//       recipes.example.com: verified`,
        remember: 'autoVerify in the manifest, assetlinks.json on every host with the right fingerprint, no redirects. Then links open the app.',
        mistakes: [
          {
            title: 'Redirecting the file',
            bad: `// https://recipes.example.com/.well-known/assetlinks.json
// answers: 301, moved to https://www.recipes.example.com/...`,
            good: `// https://recipes.example.com/.well-known/assetlinks.json
// answers: 200, Content-Type: application/json, the file itself`,
            why: 'Android doesn’t follow redirects for this file. A rule that sends the whole site to another address often catches it by accident.',
          },
        ],
        terms: [
          { term: 'App Link', def: 'A web link that Android has verified for your app, so it opens the app directly instead of the browser.' },
          { term: 'autoVerify', def: 'An intent filter attribute, <code>android:autoVerify="true"</code>, that asks Android to verify the filter’s hosts when the app is installed.' },
          { term: 'assetlinks.json', def: 'The file at <code>/.well-known/assetlinks.json</code> on your site that names the apps allowed to open its links.' },
          { term: 'certificate fingerprint', def: 'A short code (SHA-256) made from the certificate that signs your app. Only an app signed with that key matches it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Ask Android to verify the host, and let links from web pages and messages reach the Activity.', code: '<intent-filter android:[[autoVerify]]="true">\n    <action android:name="android.intent.action.VIEW" />\n    <category android:name="android.intent.category.DEFAULT" />\n    <category android:name="android.intent.category.[[BROWSABLE]]" />\n    <data android:scheme="http" />\n    <data android:scheme="https" />\n    <data android:host="recipes.example.com" />\n</intent-filter>', why: '<code>autoVerify</code> starts the check at install. <code>BROWSABLE</code> lets links reach the Activity.' },
          { type: 'bug', prompt: 'Verification fails for <code>recipes.example.com</code>. The app’s package is <code>com.example.recipes</code>. Tap the line that needs to change.', code: '[{\n  "relation": ["delegate_permission/common.handle_all_urls"],\n  "target": {\n    "namespace": "android_app",\n    "package_name": "com.example.recipe",\n    "sha256_cert_fingerprints": ["14:6D:E9:83:...:44:E5"]\n  }\n}]', bug: 4, fix: '    "package_name": "com.example.recipes",', why: 'The file must name the exact package. <code>com.example.recipe</code> is a different app.' },
        ],
        quiz: [
          { q: 'Recipes has <code>autoVerify="true"</code>, but the site has no <code>assetlinks.json</code>. On Android 13, Lin taps a recipe link in a chat. What opens?', options: ['The browser', 'Recipes', 'A list of apps to choose from'], a: 0, why: 'Without the file, the host can’t be verified, and since Android 12 unverified web links go to the browser.' },
          { q: 'Where must the file be?', options: ['At <code>/.well-known/assetlinks.json</code> on each host, over HTTPS, without redirects', 'In the app’s <code>res</code> folder', 'In <code>google-services.json</code>'], a: 0, why: 'Android downloads it from every host in your intent filters.' },
          { q: 'Why does the file hold a certificate fingerprint, not only the package name?', options: ['A package name is only a name another app could copy, but no other app can be signed with your key', 'Package names are too long', 'The browser needs it'], a: 0, why: 'The fingerprint ties the links to apps signed with your key, so a copy with the same package name can’t take them.' },
        ],
        docs: [['Add intent filters for App Links', 'https://developer.android.com/training/app-links/add-applinks'], ['Configure website associations', 'https://developer.android.com/training/app-links/configure-assetlinks']],
      },
    ],
  });
})();
