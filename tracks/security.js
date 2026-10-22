/* Security and privacy track.
   Same shape as tracks/kotlin.js. Demos use the visual kit (Lab.ui); any track CSS goes in the css string, every class
   starting with sec-. Signing keys live in the build track; runtime permission basics live in the android track. */
(() => {
  const css = ``;

  Lab.addTrack({
    id: 'security',
    title: 'Security and privacy',
    description: 'Protect the Recipes app on phones you don’t control: encrypt the saved tokens with a Keystore key, keep traffic on HTTPS and secrets on the server, sign in with passkeys, lock with a fingerprint, and collect only what you need.',
    group: 'Shipping',
    requires: ['android'],
    css,
    lessons: [
      {
        id: 'threats',
        title: 'Threats',
        tagline: 'Before you protect anything, list what attackers want and what they can reach.',
        goals: ['List what in the Recipes app is worth stealing', 'Name four kinds of attacker and what each can reach', 'Explain why decisions that matter belong on the server'],
        level: 'intermediate', introduces: [],
        body: `
<p>The Recipes app now keeps Ada’s tokens on her phone, and the server keeps her recipes. Before you add any protection, ask three questions: what is worth stealing, who wants it, and what can they reach? That short list is a <em>threat model</em>. It tells you which defenses matter, so you don’t lock the window and leave the door open.</p>
<p>For Recipes, the prize is the tokens: whoever has them can act as Ada until they run out. Think of four attackers. Another app on the same phone can’t open Recipes’ own storage, because Android keeps every app in its own <em>sandbox</em>. Someone on the same café Wi-Fi can see every request that isn’t protected. Anyone can download the APK, read every word in it with free tools, change it and install the changed copy. And someone holding Ada’s phone gets the open app; if the phone is <em>rooted</em>, its owner can read every app’s files too.</p>
<p>The APK leads to the main rule: a check in the app protects nothing on its own. Hiding the Delete button on recipes that aren’t Ada’s makes a friendly screen, but a changed copy can show it again. So the server decides: it checks the token on every request and answers 403, “not allowed”, when the answer is no. The other attackers get their own answers in this track: encrypted tokens, HTTPS, secrets kept on the server, better sign-in, an app lock, and asking for less.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 290,
            nodes: [
              { id: 'app', label: 'Recipes app<br><small>tokens in its storage</small>', x: 24, y: 22 },
              { id: 'server', label: 'Server', x: 24, y: 84, tone: 'ok' },
              { id: 'other', label: 'Another app', x: 78, y: 10, tone: 'muted', hidden: true },
              { id: 'wifi', label: 'Same Wi-Fi', x: 78, y: 37, tone: 'err', hidden: true },
              { id: 'apk', label: 'A copy of the APK', x: 78, y: 63, tone: 'err', hidden: true },
              { id: 'hand', label: 'Ada’s phone in hand', x: 78, y: 90, tone: 'warm', hidden: true },
            ],
            predict: {
              q: 'Which attacker can read a word written in the app’s code, such as a key?',
              options: ['Anyone with a copy of the APK', 'Only someone on the same Wi-Fi', 'Nobody: the code is compiled'],
              a: 0,
              why: 'The APK is a file anyone can download and take apart. Compiling doesn’t hide the words inside.',
            },
            frames: [
              { add: [['app', 'server', 'requests + token', 'accent']], say: 'Recipes on Ada’s phone talks to the server. The tokens sit in the app’s own storage. Who might want them?' },
              { show: ['other'], add: [['other', 'app', 'blocked: sandbox', 'ok']], say: 'Another app on the phone. Android keeps every app in its own sandbox, so it can’t open Recipes’ files. Already safe.' },
              { show: ['wifi'], add: [['wifi', 'app', 'reads plain requests', 'err']], say: 'Someone on the same café Wi-Fi sees every request that isn’t protected, the token included.' },
              { show: ['apk'], add: [['apk', 'app', 'reads and changes code', 'err']], say: 'Anyone can download the APK, read every word in it, and install a changed copy. A secret or a check in the code isn’t safe there.' },
              { show: ['hand'], add: [['hand', 'app', 'the open app; files if rooted', 'warm']], say: 'Someone holding Ada’s unlocked phone gets the open app. On a rooted phone, its owner can read the files too.' },
              { hl: ['server'], add: [['server', 'app', 'checks every request', 'ok']], say: 'The server is the one place no attacker controls. It checks the token on every request and makes the decisions that matter.' },
            ],
          });
        },
        code: `data class Threat(val who: String, val canReach: String, val defense: String)

// The Recipes threat model: one line per attacker
val threats = listOf(
    Threat("Another app on the phone", "nothing in Recipes' own storage", "the sandbox, already on"),
    Threat("Someone on the same Wi-Fi", "every request on the network", "HTTPS"),
    Threat("Anyone with the APK", "every word and check in the code", "secrets and decisions on the server"),
    Threat("Someone holding Ada's phone", "the open app, and on a rooted phone its files", "encrypted tokens, an app lock"),
)

for (threat in threats) {
    println("\${threat.who}: \${threat.defense}")
}
// Another app on the phone: the sandbox, already on
// Someone on the same Wi-Fi: HTTPS
// Anyone with the APK: secrets and decisions on the server
// Someone holding Ada's phone: encrypted tokens, an app lock`,
        play: `data class Threat(val who: String, val canReach: String, val defense: String)

fun main() {
    val threats = listOf(
        Threat("Another app on the phone", "nothing in Recipes' own storage", "the sandbox, already on"),
        Threat("Someone on the same Wi-Fi", "every request on the network", "HTTPS"),
        Threat("Anyone with the APK", "every word and check in the code", "secrets and decisions on the server"),
        Threat("Someone holding Ada's phone", "the open app, and on a rooted phone its files", "encrypted tokens, an app lock"),
    )
    for (threat in threats) {
        println("\${threat.who}: \${threat.defense}")
    }
}`,
        remember: 'The APK is public and the phone may not be on your side: list what each attacker can reach, and let the server make the decisions that matter.',
        terms: [
          { term: 'threat model', def: 'A short list: what you protect, who wants it, what they can reach, and which defense answers each one.' },
          { term: 'sandbox', def: 'Android keeps each app apart: one app can’t open another app’s own storage.' },
          { term: 'rooted phone', def: 'A phone whose owner gave themselves full control of it. They can read every app’s files and change what apps do.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add the café attacker to the threat model, with the defense that answers it.', code: `data class Threat(val who: String, val canReach: String, val defense: String)

val wifi = [[Threat]]("Someone on the same Wi-Fi", "every request on the network", "[[HTTPS]]")`, why: 'A threat model line names the attacker, what they can reach, and the defense. On a shared network, HTTPS is the answer.' },
          { type: 'bug', prompt: 'One defense in this threat model doesn’t protect anything. Tap the line.', code: `val threats = listOf(
    Threat("Another app on the phone", "nothing in Recipes' own storage", "the sandbox, already on"),
    Threat("Someone on the same Wi-Fi", "every request on the network", "HTTPS"),
    Threat("Anyone with the APK", "every word and check in the code", "hide the check better in the code"),
)`, bug: 3, fix: '    Threat("Anyone with the APK", "every word and check in the code", "secrets and decisions on the server"),', why: 'Whoever has the APK can read and change any check in it, however well hidden. Only the server is out of their reach.' },
        ],
        quiz: [
          { q: 'Where should “may Ada delete this recipe?” be decided?', options: ['On the server, for every request', 'In the app, by hiding the button', 'In DataStore'], a: 0, why: 'A changed copy of the app can skip any check in it. The server sees every request and can answer 403.' },
          { q: 'What does the sandbox protect Recipes’ files from?', options: ['Other apps on the same phone', 'Someone on the same Wi-Fi', 'The owner of a rooted phone'], a: 0, why: 'The sandbox keeps apps apart. Network traffic and a rooted phone need other defenses.' },
          { q: 'What is a threat model?', options: ['A short list of what you protect, who wants it and what they can reach', 'A tool that finds bugs', 'A kind of encryption'], a: 0, why: 'It is a plan, not a tool. It shows which defenses matter for your app.' },
        ],
        docs: [['Security checklist', 'https://developer.android.com/privacy-and-security/security-tips'], ['Common security risks', 'https://developer.android.com/privacy-and-security/risks']],
      },

      {
        id: 'at-rest',
        title: 'Data at rest',
        tagline: 'Encrypt saved data, so a copied file is only noise.',
        goals: ['Explain what encryption, a key and an IV are', 'Encrypt and decrypt a text with AES-GCM', 'Explain why the key must not sit next to the data'],
        level: 'intermediate', introduces: ['ByteArray', 'toByteArray', 'decodeToString', 'Base64', 'Cipher', 'doFinal', 'iv', 'KeyGenerator', 'generateKey', 'SecretKey', 'GCMParameterSpec', 'copyOfRange', 'AEADBadTagException'],
        body: `
<p>The tokens sit in DataStore, in Recipes’ own storage. The sandbox keeps other apps out, but inside, the file is plain text: on a rooted phone its owner can open it, and a copy of the phone’s storage can be read on a laptop. Data saved on a disk is <em>at rest</em>. To protect it there, save it scrambled: <em>encrypted</em>.</p>
<p>Encryption takes your text and a <em>key</em>, a long random number, and gives back bytes that look like noise. Only the same key turns them back: that is decrypting. It works on bytes, not text. A <code>ByteArray</code> holds bytes; <code>"access-7f3a9c".toByteArray()</code> turns text into bytes, and <code>decodeToString()</code> turns them back. <code>Base64.encode(bytes)</code> writes bytes as letters and digits, so you can print them or save them as a <code>String</code>, and <code>Base64.decode(text)</code> undoes it.</p>
<p>Android’s guide recommends AES in GCM mode: <code>Cipher.getInstance("AES/GCM/NoPadding")</code>. <code>KeyGenerator</code> makes a <code>SecretKey</code>, <code>cipher.init(Cipher.ENCRYPT_MODE, key)</code> gets the cipher ready, and <code>doFinal(bytes)</code> does the work. Each time, the cipher picks a fresh random <em>IV</em>, 12 bytes it needs again to decrypt. The IV isn’t secret, so save it in front: <code>cipher.iv + ciphertext</code> joins the two arrays, and <code>copyOfRange(0, 12)</code> takes the first 12 bytes back out. <code>GCMParameterSpec(128, iv)</code> hands the IV over for decrypting. GCM also adds a check: with the wrong key, or one changed byte, <code>doFinal</code> throws <code>AEADBadTagException</code> instead of giving garbage.</p>
<p>Now the hard part: where does the key live? Saved in the same storage, it is a lock with the key taped to it. Written in the code, everyone with the APK has it. In this lesson’s program the key exists only while the program runs. A real app needs a place where the key can be used but never read.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `val key = KeyGenerator.getInstance("AES").apply { init(256) }.generateKey()

val first = encrypt("access-7f3a9c", key)
val second = encrypt("access-7f3a9c", key)
println(Base64.encode(first))
println(Base64.encode(second))
println(decrypt(first, key))

val otherKey = KeyGenerator.getInstance("AES").apply { init(256) }.generateKey()
try {
    decrypt(first, otherKey)
} catch (e: AEADBadTagException) {
    println("Wrong key: \${e.message}")
}`,
            predict: {
              q: 'The same token is encrypted twice with the same key. Do the two results match?',
              options: ['No: each one gets a new random IV', 'Yes: same text and key, same result', 'Only the first 12 bytes differ'],
              a: 0,
              why: 'A fresh IV changes every byte of the result. Nobody can even tell that the two hold the same token.',
            },
            frames: [
              { line: 1, vars: { key: 'SecretKey, 256 bits' }, say: '<code>KeyGenerator</code> makes a 256-bit AES key: 32 random bytes. Whoever has them can decrypt.' },
              { line: 3, vars: { first: '41 bytes' }, say: '<code>encrypt</code> picks a random IV (12 bytes), scrambles the 13 bytes of the token, and GCM adds a 16-byte check: 41 bytes.' },
              { line: 4, vars: { second: '41 bytes' }, say: 'The same token with the same key, encrypted again.' },
              { line: [5, 6], out: 'k8XjrqFotFTkc3ro/rTy9HCe7KZ5nZccf15RNiNtYdU7ZqW3JxQ9Zj0=\ngQUO15u7SWBkgH6aalW9Oxbd6Iw8h5MLiN+b0eX7tYkNiPwx9pYv2s8=', say: 'Printed as Base64, the two look nothing alike, because each got its own IV. Your run prints other letters: the key and the IVs are random.' },
              { line: 7, out: 'access-7f3a9c', say: '<code>decrypt</code> takes the IV from the first 12 bytes, and the same key turns the rest back into the token.' },
              { line: 9, vars: { otherKey: 'SecretKey, 256 bits' }, say: 'A second key, as if an attacker guessed one.' },
              { line: 11, say: 'Decrypting with the wrong key: GCM’s check fails, so <code>doFinal</code> throws instead of returning noise.' },
              { line: 13, out: 'Wrong key: Tag mismatch', say: 'The <code>catch</code> prints the message. Without the right key, the 41 bytes are worthless.' },
            ],
          });
        },
        code: `fun encrypt(text: String, key: SecretKey): ByteArray {
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.ENCRYPT_MODE, key)                  // picks a fresh random IV
    return cipher.iv + cipher.doFinal(text.toByteArray())  // IV first, then the scrambled bytes
}

fun decrypt(sealed: ByteArray, key: SecretKey): String {
    val iv = sealed.copyOfRange(0, 12)                     // the first 12 bytes
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(128, iv))
    return cipher.doFinal(sealed.copyOfRange(12, sealed.size)).decodeToString()
}

// val key = KeyGenerator.getInstance("AES").apply { init(256) }.generateKey()
// Base64.encode(encrypt("access-7f3a9c", key))   // k8XjrqFotFTkc3ro/rTy9HCe7KZ5nZcc… (different every time)
// decrypt(sealed, key)                            // access-7f3a9c
// decrypt(sealed, otherKey)                       // throws AEADBadTagException: Tag mismatch`,
        play: `import javax.crypto.AEADBadTagException
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import kotlin.io.encoding.Base64

fun encrypt(text: String, key: SecretKey): ByteArray {
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.ENCRYPT_MODE, key)                  // picks a fresh random IV
    return cipher.iv + cipher.doFinal(text.toByteArray())  // IV first, then the scrambled bytes
}

fun decrypt(sealed: ByteArray, key: SecretKey): String {
    val iv = sealed.copyOfRange(0, 12)                     // the first 12 bytes
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(128, iv))
    return cipher.doFinal(sealed.copyOfRange(12, sealed.size)).decodeToString()
}

fun main() {
    val key = KeyGenerator.getInstance("AES").apply { init(256) }.generateKey()

    val first = encrypt("access-7f3a9c", key)
    val second = encrypt("access-7f3a9c", key)
    println(Base64.encode(first))
    println(Base64.encode(second))
    println(decrypt(first, key))

    val otherKey = KeyGenerator.getInstance("AES").apply { init(256) }.generateKey()
    try {
        decrypt(first, otherKey)
    } catch (e: AEADBadTagException) {
        println("Wrong key: \${e.message}")
    }
}`,
        remember: 'Encrypt with AES-GCM and a fresh IV saved in front of the ciphertext; the data is only as safe as the place the key lives.',
        mistakes: [
          { title: 'Using the same IV every time', bad: `cipher.init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(128, ByteArray(12)))`, good: `cipher.init(Cipher.ENCRYPT_MODE, key)   // a fresh random IV each time`, why: '<code>ByteArray(12)</code> is 12 zero bytes, the same for every token. With the same key and IV twice, GCM loses its protection: comparing two results gives away facts about both texts.' },
        ],
        terms: [
          { term: 'data at rest', def: 'Data saved on a disk, such as the DataStore file, as opposed to data travelling over the network.' },
          { term: 'encryption', def: 'Turning data into bytes that look like noise, with a key. Only the same key turns them back (decrypting).' },
          { term: 'key', def: 'The secret random number that encrypts and decrypts. Whoever has it can read the data.' },
          { term: 'IV', def: 'A fresh random value for each encryption, 12 bytes for AES-GCM. Not secret: it is saved next to the ciphertext.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Encrypt with AES in GCM mode, and save the IV in front of the result.', code: `val cipher = Cipher.getInstance("AES/[[GCM]]/NoPadding")
cipher.init(Cipher.[[ENCRYPT_MODE]], key)
return cipher.[[iv]] + cipher.doFinal(text.toByteArray())`, why: 'GCM is the mode Android’s guide recommends. <code>ENCRYPT_MODE</code> picks a fresh IV, and <code>cipher.iv</code> reads it so it can go in front of the ciphertext.' },
          { type: 'bug', prompt: 'Every decrypt throws <code>AEADBadTagException</code>, even with the right key. Tap the wrong line.', code: `fun decrypt(sealed: ByteArray, key: SecretKey): String {
    val iv = sealed.copyOfRange(0, 16)
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(128, iv))
    return cipher.doFinal(sealed.copyOfRange(12, sealed.size)).decodeToString()
}`, bug: 1, fix: '    val iv = sealed.copyOfRange(0, 12)', why: 'The IV is the first 12 bytes. Taking 16 adds 4 bytes of ciphertext to it, so GCM’s check fails.' },
        ],
        quiz: [
          { q: 'Why save the IV next to the ciphertext?', options: ['Decrypting needs it, and it isn’t secret', 'It is the key', 'Base64 needs it'], a: 0, why: 'The IV only makes each result different. Without the key it is useless to an attacker.' },
          { q: 'Recipes encrypts the tokens and saves the key in the same DataStore file. Someone copies the file. What do they get?', options: ['The tokens: the key is right there', 'Noise they can’t read', 'Only the IV'], a: 0, why: 'A key next to the data is a lock with the key taped to it. The key needs a home of its own.' },
          { q: 'You decrypt with the wrong key. What happens with GCM?', options: ['<code>doFinal</code> throws <code>AEADBadTagException</code>', 'You get random-looking text', 'You get the token anyway'], a: 0, why: 'GCM checks the result. A wrong key or a changed byte fails the check.' },
        ],
        docs: [['Cryptography', 'https://developer.android.com/privacy-and-security/cryptography']],
      },

      {
        id: 'keystore',
        title: 'Keystore',
        tagline: 'A key your app can use but never read, kept in the phone’s secure hardware.',
        goals: ['Make an AES key inside the Android Keystore', 'Encrypt the session tokens before they go into DataStore', 'Explain what an attacker gets from a copied file'],
        level: 'intermediate', introduces: ['KeyStore', 'getKey', 'KeyGenParameterSpec', 'KeyProperties', 'setBlockModes', 'setEncryptionPaddings', 'setKeySize'],
        body: `
<p>The last lesson’s key lived only while the program ran. Recipes needs the same key tomorrow, to read the tokens it saved today, and the key must not sit next to them. Android has a place built for this: the <em>Android Keystore</em>. It makes the key, keeps it, and does the encrypting itself. Your app gets a handle to the key, never its bytes.</p>
<p>On most phones the Keystore lives in secure hardware: a separate, locked-off part of the chip that the rest of Android can’t look into, and on some phones a security chip of its own, called StrongBox. So even a rooted phone can’t hand the key out. Someone who copies the DataStore file gets Base64 noise, and the key that opens it never leaves that phone. Uninstalling the app deletes its keys.</p>
<p>The code is the last lesson’s, with a new home for the key. <code>KeyStore.getInstance("AndroidKeyStore")</code> and <code>load(null)</code> open the store. <code>getKey(KEY_ALIAS, null)</code> looks the key up by its name, the <em>alias</em>; <code>as? SecretKey</code> reads the answer as a key, or gives <code>null</code> if there is none yet. The first time, <code>KeyGenParameterSpec.Builder</code> describes the key: it may encrypt and decrypt (<code>or</code> joins the two), GCM mode, no padding, 256 bits. These rules are sealed into the key and can’t change later. <code>KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")</code> makes the key inside the Keystore.</p>
<p><code>TokenCipher</code> has an <code>@Inject</code> constructor, so Hilt can hand it to <code>Session</code>. <code>save</code> now stores <code>cipher.encrypt(token)</code>, and reading decrypts. If decrypting fails, for example on a plain token saved before this update, or a backup restored to a new phone, where the key doesn’t exist, treat Ada as signed out: she signs in once more. Older code may use <code>EncryptedSharedPreferences</code> from the security-crypto library. It is deprecated; Android now points you to the Keystore directly.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 320,
            nodes: [
              { id: 'app', label: 'Recipes app<br><small>TokenCipher</small>', x: 24, y: 12 },
              { id: 'ks', label: 'Android Keystore<br><small>secure hardware</small>', x: 74, y: 42, tone: 'ok' },
              { id: 'file', label: 'DataStore file', x: 24, y: 72 },
              { id: 'thief', label: 'Copied file<br><small>on a laptop</small>', x: 74, y: 92, tone: 'err', hidden: true },
            ],
            predict: {
              q: 'Someone copies the encrypted DataStore file to a laptop. What can they read?',
              options: ['Nothing useful: the key stayed in the phone’s hardware', 'The tokens: the key is in the file too', 'The tokens, after taking the APK apart'],
              a: 0,
              why: 'The file holds IVs and ciphertext. The only key that opens them never leaves the phone’s Keystore.',
            },
            frames: [
              { say: 'Recipes needs a key that survives restarts and that nobody can copy.' },
              { add: [['app', 'ks', 'make “session_key”', 'accent']], say: 'The first time, the app asks the Keystore to make an AES key named <code>session_key</code>. The key is made inside and stays there.' },
              { remove: [['app', 'ks']], add: [['ks', 'app', 'a handle, not the bytes', 'muted']], say: 'The app gets a <code>SecretKey</code> that only points at the key. There are no key bytes in the app to steal.' },
              { remove: [['ks', 'app']], add: [['app', 'ks', 'token in, IV + ciphertext out', 'accent']], say: 'To encrypt, the token goes in and the IV and ciphertext come out. The work happens inside the Keystore.' },
              { add: [['app', 'file', 'Base64 noise', 'ok']], say: 'DataStore saves that as Base64 text. The token itself is never in the file.' },
              { show: ['thief'], add: [['file', 'thief', 'copied', 'err']], say: 'Someone copies the file off a rooted phone.' },
              { hl: ['ks'], add: [['thief', 'ks', 'no way to the key', 'weak']], say: 'They have the noise, but not the key: it never leaves this phone. On the phone itself the app can still decrypt, so the server keeps checking every request.' },
            ],
          });
        },
        code: `// data/TokenCipher.kt
import kotlin.io.encoding.Base64   // Kotlin’s, the same as the last lesson

private const val KEY_ALIAS = "session_key"

class TokenCipher @Inject constructor() {
    private fun key(): SecretKey {
        val keyStore = KeyStore.getInstance("AndroidKeyStore")
        keyStore.load(null)
        val saved = keyStore.getKey(KEY_ALIAS, null) as? SecretKey
        if (saved != null) {
            return saved                                   // made on an earlier run
        }
        val spec = KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .build()
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        generator.init(spec)
        return generator.generateKey()                     // made and kept inside the Keystore
    }

    fun encrypt(text: String): String {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key())            // the Keystore picks the IV
        return Base64.encode(cipher.iv + cipher.doFinal(text.toByteArray()))
    }

    fun decrypt(saved: String): String {
        val sealed = Base64.decode(saved)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, sealed.copyOfRange(0, 12)))
        return cipher.doFinal(sealed.copyOfRange(12, sealed.size)).decodeToString()
    }
}

// Session: the same class, now with a TokenCipher
class Session(
    private val api: RecipeApi,
    private val store: DataStore<Preferences>,
    private val cipher: TokenCipher,
) {
    private suspend fun save(tokens: Tokens) {
        store.edit { settings ->
            settings[ACCESS_TOKEN] = cipher.encrypt(tokens.accessToken)
            settings[REFRESH_TOKEN] = cipher.encrypt(tokens.refreshToken)
        }
    }

    private fun read(saved: String?): String? {
        try {
            return saved?.let { cipher.decrypt(it) }
        } catch (e: Exception) {
            return null                                    // can't decrypt: signed out, sign in again
        }
    }
    // getRecipes uses read(saved[ACCESS_TOKEN]) and read(saved[REFRESH_TOKEN]); the rest is as before
}

// DataModule: Hilt makes TokenCipher from its @Inject constructor
@Provides
fun provideSession(store: DataStore<Preferences>, cipher: TokenCipher): Session =
    Session(api, store, cipher)`,
        remember: 'Make the key inside the Android Keystore and look it up by its alias; save only Base64 ciphertext in DataStore.',
        terms: [
          { term: 'Android Keystore', def: 'Android’s safe for keys. It makes and keeps them, often in secure hardware, and does the encrypting itself; the app never sees the key bytes.' },
          { term: 'alias', def: 'The name a key is kept under in the Keystore, such as <code>"session_key"</code>.' },
          { term: 'secure hardware', def: 'A locked-off part of the phone’s chip, or a separate security chip (StrongBox), that the rest of Android can’t look into.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the AES key inside the Keystore, for GCM.', code: `val spec = KeyGenParameterSpec.Builder(KEY_ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
    .setBlockModes(KeyProperties.BLOCK_MODE_[[GCM]])
    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
    .setKeySize(256)
    .build()
val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "[[AndroidKeyStore]]")`, why: 'GCM matches the cipher <code>"AES/GCM/NoPadding"</code>. The provider name <code>"AndroidKeyStore"</code> makes the key inside the Keystore instead of in the app.' },
          { type: 'bug', prompt: 'After every restart, the saved tokens can’t be decrypted and Ada has to sign in again. Tap the wrong line.', code: `private fun key(): SecretKey {
    val keyStore = KeyStore.getInstance("AndroidKeyStore")
    keyStore.load(null)
    val saved = keyStore.getKey("session", null) as? SecretKey
    if (saved != null) {
        return saved
    }
    return makeKey(KEY_ALIAS)   // the KeyGenParameterSpec code from above
}`, bug: 3, fix: '    val saved = keyStore.getKey(KEY_ALIAS, null) as? SecretKey', why: 'The key is made as <code>"session_key"</code> but looked up as <code>"session"</code>, so the lookup always finds nothing. Each start makes a new key that replaces the old one, and yesterday’s tokens can’t be decrypted.' },
        ],
        quiz: [
          { q: 'Where are the bytes of a Keystore key?', options: ['Inside the Keystore, often in secure hardware; never in your app', 'In the DataStore file', 'In the APK'], a: 0, why: 'Your app holds a handle. The data goes in to the Keystore and the result comes out.' },
          { q: 'After an update, decrypting a saved token throws. What should <code>Session</code> do?', options: ['Treat Ada as signed out, so she signs in again', 'Crash, so the bug gets noticed', 'Send the encrypted text as the token'], a: 0, why: 'A token that can’t be read is as good as none. One more sign-in fixes it.' },
          { q: 'Why look the alias up before making a key?', options: ['Making a key under the same alias replaces it, and older tokens can’t be decrypted', 'The Keystore allows only one lookup', 'Looking up is needed to encrypt faster'], a: 0, why: 'Make the key once, then reuse it. A new key can’t open what the old one encrypted.' },
        ],
        docs: [['Android Keystore system', 'https://developer.android.com/privacy-and-security/keystore'], ['Security library releases', 'https://developer.android.com/jetpack/androidx/releases/security']],
      },

      {
        id: 'network',
        title: 'Network security',
        tagline: 'HTTPS keeps requests private and proves you reached the real server.',
        goals: ['Explain what HTTPS protects on a café Wi-Fi', 'Turn plain HTTP off with a network security config', 'Explain what certificate pinning is and why Android advises against it'],
        level: 'intermediate', introduces: ['networkSecurityConfig', 'cleartextTrafficPermitted', 'base-config', 'debug-overrides'],
        body: `
<p>Ada opens Recipes in a café. Her phone talks to the server through the café’s Wi-Fi, and anyone on that network can watch the traffic go by. With plain <code>http://</code>, they read every request, including <code>Authorization: Bearer</code> and the token, and they can even change the answers.</p>
<p><em>HTTPS</em> is HTTP sent through <em>TLS</em>, which encrypts each request on the way. TLS also proves who is on the other end. The server shows a <em>certificate</em>, a signed card that says “I am recipes.example.com”, signed by a certificate authority: a company the phone already trusts. A fake server on the café network can’t show a valid card for that name, so the connection fails before any token is sent. With a base URL that starts with <code>https://</code>, Retrofit does all of this for you, and a failed check arrives as an <code>IOException</code>, like being offline.</p>
<p>For apps that target Android 9 or higher, Android blocks plain HTTP by default: the request fails with “CLEARTEXT communication to … not permitted by network security policy”. The <em>network security config</em> is an XML file where you write these rules down, <code>res/xml/network_security_config.xml</code>, named in the manifest with <code>android:networkSecurityConfig</code>. <code>&lt;base-config cleartextTrafficPermitted="false" /&gt;</code> says “HTTPS only” for every address. <code>&lt;debug-overrides&gt;</code> holds rules for the debug build only, such as trusting a certificate you installed yourself, so a debugging tool can show your own traffic.</p>
<p><em>Certificate pinning</em> goes one step further: the app accepts only the certificate keys it lists in advance. Android’s guide advises against it for apps: when the server moves to another certificate authority, every installed copy stops connecting until it is updated. If you must pin, list backup pins, one of them a key fully in your control, and a short expiration date. And never “fix” a certificate error by trusting every certificate: that hands the café attacker everything.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'app', label: 'Recipes app', sub: 'Ada’s phone' },
              { id: 'wifi', label: 'Café Wi-Fi', sub: 'anyone can listen' },
              { id: 'server', label: 'Server', sub: 'recipes.example.com' },
            ],
            predict: {
              q: 'On the café Wi-Fi, a fake server answers instead of recipes.example.com. With HTTPS, what happens?',
              options: ['The connection fails before the token is sent', 'The fake server gets the token', 'The app warns Ada and goes on'],
              a: 0,
              why: 'The fake server has no certificate for recipes.example.com signed by an authority the phone trusts, so TLS stops right there.',
            },
            frames: [
              { at: 'app', packet: 'GET recipes + token', say: 'Ada taps refresh. The request carries her access token.' },
              { at: 'wifi', packet: 'Bearer 7f3a9c…', tone: 'err', mark: { wifi: 'err' }, say: 'With plain <code>http://</code>, the request crosses the café network as readable text. Anyone listening copies the token.' },
              { at: 'server', packet: 'TLS: who are you?', tone: 'accent', mark: { wifi: null }, say: 'Now with <code>https://</code>. Before any request, the app starts TLS and asks the server to prove its name.' },
              { at: 'app', packet: 'certificate ✓', tone: 'ok', mark: { server: 'ok' }, say: 'The server shows its certificate for recipes.example.com, signed by an authority the phone trusts. The check passes.' },
              { at: 'wifi', packet: 'x9#Lq2…', tone: 'ok', mark: { wifi: 'warm' }, say: 'The request now crosses the Wi-Fi encrypted. The listener sees noise.' },
              { at: 'wifi', packet: 'fake certificate', tone: 'err', mark: { wifi: 'err', server: null }, say: 'Another day, an attacker on the Wi-Fi pretends to be the server, with a certificate it made itself. No trusted authority signed it.' },
              { at: 'app', packet: 'check failed', tone: 'err', mark: { app: 'ok' }, say: 'The check fails and the connection stops, before the token leaves the phone. Retrofit throws an <code>IOException</code>, as when offline.' },
            ],
          });
        },
        code: `<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <!-- HTTPS only, for every address -->
    <base-config cleartextTrafficPermitted="false" />

    <!-- Debug build only: also trust certificates you installed on the test phone,
         so a debugging tool can show your own traffic -->
    <debug-overrides>
        <trust-anchors>
            <certificates src="user" />
        </trust-anchors>
    </debug-overrides>
</network-security-config>

<!-- AndroidManifest.xml -->
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ... >

<!-- Retrofit: the base URL starts with https://
     .baseUrl("https://recipes.example.com/") -->`,
        remember: 'HTTPS everywhere, written down in the network security config; debug-only rules go in debug-overrides, and avoid pinning unless you must.',
        mistakes: [
          { title: 'Turning cleartext on to make an error go away', bad: `<application android:usesCleartextTraffic="true" ... >`, good: `.baseUrl("https://recipes.example.com/")`, why: 'In an app without a network security config, this allows plain HTTP for every address, in the release build too, and the café attacker reads the tokens again. (With a config, Android ignores it and follows the config.) Use the server’s HTTPS address instead.' },
        ],
        terms: [
          { term: 'HTTPS', def: 'HTTP sent through TLS: requests are encrypted on the way, and the server proves its name with a certificate.' },
          { term: 'certificate', def: 'A signed card a server shows, saying which name it belongs to. A certificate authority the phone trusts signs it.' },
          { term: 'network security config', def: 'An XML file, named in the manifest with <code>android:networkSecurityConfig</code>, with the app’s rules for connections.' },
          { term: 'certificate pinning', def: 'Accepting only certificate keys listed in the app in advance. Android’s guide advises against it, because a server change can lock old app versions out.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Allow HTTPS only, and name the config file in the manifest.', code: `<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <base-config [[cleartextTrafficPermitted]]="[[false]]" />
</network-security-config>

<!-- AndroidManifest.xml -->
<application android:[[networkSecurityConfig]]="@xml/network_security_config">`, why: '<code>cleartextTrafficPermitted="false"</code> refuses plain HTTP everywhere. The manifest attribute tells Android which file holds the rules.' },
          { type: 'bug', prompt: 'Every request fails with “CLEARTEXT communication to recipes.example.com not permitted by network security policy”. Tap the wrong line.', code: `val api: RecipeApi = Retrofit.Builder()
    .baseUrl("http://recipes.example.com/")
    .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
    .build()
    .create(RecipeApi::class.java)`, bug: 1, fix: '    .baseUrl("https://recipes.example.com/")', why: 'The base URL asks for plain HTTP, which Android refuses. With <code>https://</code> every request goes through TLS.' },
        ],
        quiz: [
          { q: 'What does the server’s certificate prove?', options: ['That the server really is recipes.example.com', 'That the app is signed', 'That the token is still fresh'], a: 0, why: 'A trusted authority signed it for that name. A fake server can’t get one.' },
          { q: 'Why does Android’s guide advise against certificate pinning?', options: ['When the server changes certificate authority, pinned app versions can’t connect until they update', 'It makes requests slower', 'It turns HTTPS off'], a: 0, why: 'The pins are inside every installed copy. Changing them needs an app update.' },
          { q: 'A test server you run has a certificate the phone doesn’t trust. What is a safe fix?', options: ['Trust your own test certificate in <code>debug-overrides</code>, or fix the server’s certificate', 'Trust every certificate', 'Switch to <code>http://</code>'], a: 0, why: '<code>debug-overrides</code> only applies to the debug build. The other two turn protection off for everyone.' },
        ],
        docs: [['Network security configuration', 'https://developer.android.com/privacy-and-security/security-config'], ['Security with network protocols', 'https://developer.android.com/privacy-and-security/security-ssl']],
      },

      {
        id: 'secrets',
        title: 'API keys and secrets',
        tagline: 'Anything inside the APK is public, so real secrets stay on the server.',
        goals: ['Explain why a key in the APK can be read by anyone', 'Move a paid service’s key behind your own server', 'Keep a key out of Git with local.properties'],
        level: 'intermediate', introduces: ['buildConfigField', 'Properties', 'inputStream'],
        body: `
<p>Recipes would like to show the calories of each recipe. A nutrition service sells that data, and each request needs its <em>API key</em>, a password for apps; every request costs a little, billed to the key’s owner. The quick way is a <code>const val</code> in the code. But anyone can download the APK and list every text inside it with free tools in a minute. R8 renames classes and functions, but texts stay as they are. Whoever copies the key sends requests on your bill.</p>
<p>So nothing in the APK is secret, however you hide it. Split into pieces, encoded or in a resource file, the app must rebuild the key to use it, and so can anyone else. A real <em>secret</em> stays on a computer you control. The app asks your own server, with Ada’s token as always. The server adds its key, calls the nutrition service and passes the answer on. It can also refuse an account after 200 requests a day, and a new key only has to change in one place.</p>
<p>Some keys are made to ship inside the app, such as a key for a map service. Protect those differently: in the service’s console, if it offers this, limit the key to your app’s application id and signing key, so a copy is useless elsewhere. Keep them out of Git all the same. <code>local.properties</code>, in the project’s top folder, is already in a new project’s <code>.gitignore</code>. In <code>app/build.gradle.kts</code>, <code>Properties</code> reads it (<code>rootProject.file</code> finds a file in the project’s top folder, <code>inputStream()</code> opens the file, <code>getProperty</code> reads one value), and <code>buildConfigField</code> puts the value into <code>BuildConfig</code>. That keeps the key out of Git, not out of the APK.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 280,
            nodes: [
              { id: 'app', label: 'Recipes app', x: 16, y: 18 },
              { id: 'copy', label: 'A copied APK', x: 16, y: 84, tone: 'err', hidden: true },
              { id: 'server', label: 'Your server', x: 50, y: 50, tone: 'ok', hidden: true },
              { id: 'nutri', label: 'Nutrition service', x: 84, y: 18 },
              { id: 'bill', label: 'Your bill', x: 84, y: 84, tone: 'warm', hidden: true },
            ],
            predict: {
              q: 'R8 renames every class and function in the release build. Is <code>const val NUTRI_KEY = "nk_live_51c9e2"</code> hidden now?',
              options: ['No: R8 leaves texts as they are', 'Yes: renamed code can’t be read', 'Only on rooted phones'],
              a: 0,
              why: 'Renaming changes names, not the texts the code uses. The key is still there for anyone who looks.',
            },
            frames: [
              { add: [['app', 'nutri', 'key nk_live_51c9e2', 'warm']], say: 'Version 1 sends the nutrition key straight from the app. It works.' },
              { show: ['copy'], add: [['app', 'copy', 'download', 'muted']], say: 'Anyone can download the APK and list every text in it. The key is right there.' },
              { show: ['bill'], add: [['copy', 'nutri', 'the same key', 'err'], ['nutri', 'bill', 'every request', 'err']], say: 'Now their requests carry your key, and every one lands on your bill.' },
              { show: ['server'], gone: ['bill'], remove: [['app', 'nutri'], ['copy', 'nutri'], ['nutri', 'bill']], add: [['app', 'server', 'Ada’s token', 'accent']], say: 'Version 2: the app asks your own server, with Ada’s token, like every other request.' },
              { add: [['server', 'nutri', 'the key, only here', 'ok']], say: 'The server adds the key and calls the service. The key never leaves the server.' },
              { hl: ['server'], add: [['copy', 'server', 'no token: 401', 'weak']], say: 'A copied APK has no key left to steal. Without a valid token the server answers 401, and it can stop any account that asks too often.' },
            ],
          });
        },
        code: `// Version 1, don't: the secret is in every copy of the APK
// const val NUTRI_KEY = "nk_live_51c9e2"

// Version 2: the app asks your own server, like for recipes
@Serializable
data class Nutrition(val recipeId: Int, val calories: Int)

interface RecipeApi {
    @GET("recipes/nutrition")          // your server adds the key and calls the service
    suspend fun getNutrition(@Header("Authorization") auth: String): List<Nutrition>
}

// A key that has to ship, such as a map key: out of Git, still inside the APK
// local.properties (already in .gitignore):
//     MAPS_KEY=mk_4e1b90

// app/build.gradle.kts
import java.util.Properties            // at the very top of the file

val localProperties = Properties()
localProperties.load(rootProject.file("local.properties").inputStream())

android {
    defaultConfig {
        buildConfigField("String", "MAPS_KEY", "\\"\${localProperties.getProperty("MAPS_KEY")}\\"")
    }
    buildFeatures {
        buildConfig = true
    }
}
// In the app: BuildConfig.MAPS_KEY`,
        remember: 'Everything in the APK is public: real secrets stay on your server, and keys that must ship are limited to your app and kept out of Git.',
        mistakes: [
          { title: 'Hiding a key by splitting it', bad: `val key = "nk_live_" + "51c9e2"   // split, so nobody finds it?`, good: `api.getNutrition("Bearer $accessToken")   // the server adds the key`, why: 'The app has to join the pieces to use the key, and anyone reading the APK can join them too. Only a key that isn’t in the app is safe.' },
        ],
        terms: [
          { term: 'API key', def: 'A password for apps that a service gives you. Requests that carry it are allowed, and often billed to you.' },
          { term: 'secret', def: 'Anything that must not be known outside your team, such as a paid service’s key. It can’t live in the APK.' },
          { term: 'local.properties', def: 'A file in the project’s top folder for settings of this computer only. A new project’s <code>.gitignore</code> already leaves it out of Git.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Put the map key from <code>local.properties</code> into <code>BuildConfig</code>.', code: `android {
    defaultConfig {
        [[buildConfigField]]("String", "MAPS_KEY", "\\"\${localProperties.getProperty("MAPS_KEY")}\\"")
    }
    buildFeatures {
        [[buildConfig]] = true
    }
}`, why: '<code>buildConfigField</code> adds a field to <code>BuildConfig</code>, and <code>buildConfig = true</code> makes Gradle write that class. The key stays out of Git, but it is still in the APK.' },
          { type: 'bug', prompt: 'This sends the nutrition service’s key from the app, where anyone can read it. Tap the line.', code: `interface RecipeApi {
    @GET("recipes/nutrition")
    suspend fun getNutrition(@Header("Authorization") auth: String): List<Nutrition>
}

suspend fun loadNutrition(api: RecipeApi, accessToken: String): List<Nutrition> =
    api.getNutrition("Bearer nk_live_51c9e2")`, bug: 6, fix: '    api.getNutrition("Bearer $accessToken")', why: 'The app should send Ada’s token, which runs out and only works for her. The nutrition key belongs on the server.' },
        ],
        quiz: [
          { q: 'Where can a paid service’s key live safely?', options: ['On your server', 'In <code>BuildConfig</code>', 'In <code>local.properties</code>'], a: 0, why: 'Both other places end up in the APK or on a laptop. Only the server keeps it out of reach.' },
          { q: 'What does <code>local.properties</code> protect a key from?', options: ['Being pushed to Git', 'Being read from the APK', 'Being renamed by R8'], a: 0, why: 'It keeps the key out of the repository. Once it is in <code>BuildConfig</code>, it is inside the APK.' },
          { q: 'A map key has to ship in the app. What helps most?', options: ['Limit the key to your app’s id and signing key in the service’s console', 'Split it into two texts', 'Encode it with Base64'], a: 0, why: 'A copy of a limited key is useless in another app. Splitting and encoding only slow a reader down for a minute.' },
        ],
        docs: [['Hardcoded cryptographic secrets', 'https://developer.android.com/privacy-and-security/risks/hardcoded-cryptographic-secrets']],
      },

      {
        id: 'credential-manager',
        title: 'Signing in',
        tagline: 'One system sheet for passwords and passkeys, with nothing to phish.',
        goals: ['Explain what a passkey is and why a fake site can’t use it', 'Ask Credential Manager for a saved password or passkey', 'Send the answer to your server and save the tokens'],
        level: 'intermediate', introduces: ['CredentialManager', 'GetCredentialRequest', 'GetPasswordOption', 'GetPublicKeyCredentialOption', 'getCredential', 'PublicKeyCredential', 'PasswordCredential', 'authenticationResponseJson', 'GetCredentialException'],
        body: `
<p>Recipes signs Ada in with an email and a password typed into a form. Passwords get reused, guessed, and typed into fake sites that look real. Android’s <em>Credential Manager</em> is one Jetpack API for signing in. It shows one system sheet with what Ada already saved for Recipes, such as a password in her password manager or a passkey. One tap, no typing.</p>
<p>A <em>passkey</em> replaces the password. When Ada makes one, her phone makes a pair of keys: a private key that stays in her password manager, and a public key the server keeps. To sign in, the server sends a <em>challenge</em>, a new random text each time. After Ada unlocks with her fingerprint or screen lock, the phone signs it with the private key, and the server checks the signature with the public key. No secret is sent, and a stolen copy of the server’s data opens no accounts. A passkey only works for the domain it was made for, recipes.example.com, so a fake site can’t use it. It needs the same <code>assetlinks.json</code> file as App Links, with one more relation in its list: <code>"delegate_permission/common.get_login_creds"</code>, which lets the app use the site’s sign-ins. Making a passkey is a similar call, <code>createCredential</code> with a <code>CreatePublicKeyCredentialRequest</code> and your server’s JSON, usually offered right after a password sign-in. This lesson codes signing in with one Ada already has.</p>
<p><code>CredentialManager.create(context)</code> makes the manager. A <code>GetCredentialRequest</code> lists what Recipes accepts: <code>GetPasswordOption()</code> and <code>GetPublicKeyCredentialOption(requestJson)</code>, with the JSON your server sent, which holds the challenge. <code>getCredential(context, request)</code> is a suspend function: it shows the sheet and waits. The context must be the Activity, and in a composable <code>LocalContext.current</code> is the Context it runs in.</p>
<p>The answer’s <code>credential</code> can be several types, so <code>when</code> with <code>is</code> checks which: a <code>PublicKeyCredential</code> has <code>authenticationResponseJson</code>, the signed challenge for the server; a <code>PasswordCredential</code> has <code>id</code> and <code>password</code> for the old <code>signIn</code>. Either way the server answers with tokens, saved as before. If nothing is saved, or Ada closes the sheet, <code>getCredential</code> throws a <code>GetCredentialException</code>: show the form. Sign in with Google comes through the same sheet, with an option from Google’s own library.</p>`,
        visual(el) {
          const signin = (extra = '') => `<div class="ui-m-bar">Recipes</div><div class="ui-m-body"><b>Welcome back</b><div class="ui-m-field">Email</div><div class="ui-m-field">Password</div><span class="ui-m-btn si">Sign in</span></div>${extra}`;
          const sheet = '<div class="ui-m-sheet"><b>Sign in to Recipes</b><div class="ui-m-row pk"><span class="ui-m-av"></span><div>ada@example.com<br><span class="ui-m-muted">Passkey</span></div></div><div class="ui-m-row"><span class="ui-m-av"></span><div>ada@example.com<br><span class="ui-m-muted">Password</span></div></div></div>';
          const lock = '<div class="ui-m-sheet"><b>Use your screen lock</b><span class="ui-m-muted">to sign in to recipes.example.com</span><div class="ui-m-spin"></div></div>';
          const home = '<div class="ui-m-bar">Recipes</div><div class="ui-m-body"><div class="ui-m-row"><div>Tomato soup · 25 min</div></div><div class="ui-m-row"><div>Lemon pasta · 20 min</div></div><div class="ui-m-row"><div>Oslo pancakes · 15 min</div></div></div>';
          Lab.ui.phone(el, {
            logTitle: 'App and server',
            predict: {
              q: 'A fake site that looks like Recipes asks for Ada’s passkey. What does it get?',
              options: ['Nothing: her passkey only works for recipes.example.com', 'Her private key', 'Her password'],
              a: 0,
              why: 'The passkey is tied to the real domain, and the private key never leaves her password manager.',
            },
            frames: [
              { screen: signin(), log: 'GET passkey/request  →  challenge "Zq81…", domain recipes.example.com', say: 'The app asks its server for a passkey request: a fresh challenge and the domain.' },
              { tap: '.si', log: 'credentialManager.getCredential(context, request)', say: 'Ada taps Sign in. <code>getCredential</code> shows the system sheet and waits.' },
              { screen: signin(sheet), say: 'The sheet lists what she saved for Recipes: a passkey and a password. The sheet is Android’s, not your app’s.' },
              { tap: '.pk', say: 'She picks the passkey.' },
              { screen: signin(lock), say: 'To use the private key, she unlocks with her fingerprint or screen lock.' },
              { screen: signin(), log: ['PublicKeyCredential  →  authenticationResponseJson', 'POST passkey/login  →  200, access + refresh tokens'], say: 'The phone signs the challenge. The app sends the signed answer; the server checks it with Ada’s public key and returns tokens.' },
              { screen: home, log: 'tokens encrypted into DataStore', say: 'The tokens are saved, encrypted as in the Keystore lesson. No password was typed or sent.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
// implementation("androidx.credentials:credentials:1.6.0")
// implementation("androidx.credentials:credentials-play-services-auth:1.6.0")   // for Android 13 and lower

// Two calls on your server: one hands out a fresh challenge, one checks the signed answer
@Serializable
data class PasskeyRequest(val requestJson: String)

@Serializable
data class PasskeyAnswer(val responseJson: String)

interface RecipeApi {
    // login, refresh and getRecipes as before
    @GET("passkey/request")
    suspend fun passkeyRequest(): PasskeyRequest

    @POST("passkey/login")
    suspend fun passkeyLogin(@Body answer: PasskeyAnswer): Tokens
}

// Session gets two small functions:
//     suspend fun passkeyRequest(): String = api.passkeyRequest().requestJson
//     suspend fun signInWithPasskey(responseJson: String) { save(api.passkeyLogin(PasskeyAnswer(responseJson))) }

@Composable
fun SignInButton(session: Session, onSignedIn: () -> Unit, onShowForm: () -> Unit) {
    val context = LocalContext.current                  // the Activity: the sheet opens over it
    val scope = rememberCoroutineScope()
    Button(onClick = {
        scope.launch {
            try {
                val request = GetCredentialRequest(listOf(
                    GetPasswordOption(),
                    GetPublicKeyCredentialOption(session.passkeyRequest()),
                ))
                val result = CredentialManager.create(context).getCredential(context, request)
                val credential = result.credential
                when (credential) {
                    is PublicKeyCredential -> session.signInWithPasskey(credential.authenticationResponseJson)
                    is PasswordCredential -> session.signIn(credential.id, credential.password)
                }
                onSignedIn()
            } catch (e: GetCredentialException) {
                onShowForm()                            // nothing saved, or Ada closed the sheet
            } catch (e: HttpException) {
                onShowForm()                            // the server said no, for example 401 or 500
            } catch (e: IOException) {
                onShowForm()                            // offline: the form can say so
            }
        }
    }) {
        Text("Sign in")
    }
}`,
        remember: 'Ask Credential Manager with a password option and a passkey option, send what comes back to your server, and fall back to the form on GetCredentialException.',
        terms: [
          { term: 'Credential Manager', def: 'The Jetpack API for signing in. It shows one system sheet with the user’s saved passwords and passkeys for your app.' },
          { term: 'passkey', def: 'A key pair that replaces a password. The private key stays in the user’s password manager, the server keeps the public key, and it only works for its own domain.' },
          { term: 'challenge', def: 'A new random text the server sends for each sign-in. The phone signs it, so an old answer can’t be used again.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Accept both a saved password and a passkey.', code: `val request = GetCredentialRequest(listOf(
    [[GetPasswordOption]](),
    [[GetPublicKeyCredentialOption]](session.passkeyRequest()),
))`, why: 'Each option is one kind of credential the sheet may offer. The passkey option needs the server’s request JSON with the challenge.' },
          { type: 'bug', prompt: 'Ada closes the sheet without choosing, and the app crashes. Tap the wrong line.', code: `try {
    val result = CredentialManager.create(context).getCredential(context, request)
    val credential = result.credential
    when (credential) {
        is PublicKeyCredential -> session.signInWithPasskey(credential.authenticationResponseJson)
        is PasswordCredential -> session.signIn(credential.id, credential.password)
    }
    onSignedIn()
} catch (e: IOException) {
    onShowForm()
}`, bug: 8, fix: '} catch (e: GetCredentialException) {', why: 'Closing the sheet throws a <code>GetCredentialException</code>, not an <code>IOException</code>. Nothing catches it, so the app crashes.' },
        ],
        quiz: [
          { q: 'What does the server keep for Ada’s passkey?', options: ['Only the public key', 'The private key', 'Her password'], a: 0, why: 'The public key can only check signatures. A stolen copy of it signs nothing.' },
          { q: 'Why is there a new challenge for every sign-in?', options: ['So an old signed answer can’t be sent again', 'So the sheet looks different', 'Because passkeys run out'], a: 0, why: 'Each signature only fits its own challenge. A copied answer is useless the next time.' },
          { q: 'Which context should <code>getCredential</code> get?', options: ['The Activity, for example <code>LocalContext.current</code> in a composable', 'The application context', 'None'], a: 0, why: 'The sheet opens over a screen, so it needs the Activity the user is looking at.' },
        ],
        docs: [['Credential Manager', 'https://developer.android.com/identity/sign-in/credential-manager'], ['Sign in with passkeys', 'https://developer.android.com/identity/passkeys/sign-in-with-passkeys']],
      },

      {
        id: 'biometric',
        title: 'Biometrics',
        tagline: 'Ask for a fingerprint, a face or the screen lock with BiometricPrompt.',
        goals: ['Lock the app behind Android’s fingerprint, face or screen lock prompt', 'Check that the phone can do it before you ask', 'Explain what your app learns from the prompt'],
        level: 'intermediate', introduces: ['BiometricPrompt', 'BiometricManager', 'canAuthenticate', 'BIOMETRIC_SUCCESS', 'BIOMETRIC_WEAK', 'BIOMETRIC_STRONG', 'DEVICE_CREDENTIAL', 'AuthenticationCallback', 'onAuthenticationSucceeded', 'PromptInfo', 'setAllowedAuthenticators', 'authenticate', 'FragmentActivity', 'getMainExecutor', 'viewModels'],
        body: `
<p>Ada stays signed in to Recipes for weeks, which is what she wants. But when her nephew borrows her unlocked phone, he can open Recipes and change her account. An app lock helps: before Recipes opens, ask for her fingerprint, her face or the phone’s screen lock. Android draws that request itself: the <code>BiometricPrompt</code>.</p>
<p>Your app never sees a fingerprint. The phone checks it in secure hardware and tells your app one thing: it matched. You choose what counts. <code>BIOMETRIC_WEAK or DEVICE_CREDENTIAL</code> accepts any fingerprint or face the phone trusts, or the PIN, pattern or password. <code>BIOMETRIC_STRONG</code> accepts only the safest sensors, but together with <code>DEVICE_CREDENTIAL</code> it doesn’t work on Android 10 and lower, and Recipes runs from Android 8.0 (minSdk 26), so the app lock uses <code>BIOMETRIC_WEAK</code>. Before asking, <code>BiometricManager.from(this).canAuthenticate(allowed)</code> answers <code>BIOMETRIC_SUCCESS</code> if the phone has one of them set up.</p>
<p>BiometricPrompt needs a <code>FragmentActivity</code>, a <code>ComponentActivity</code> with a little more inside, so <code>MainActivity</code> extends it now; <code>setContent</code> works the same. Make the prompt before the screen starts, as with the permission launcher; here that is <code>onCreate</code>, because it needs the Activity ready: <code>BiometricPrompt(this, ContextCompat.getMainExecutor(this), callback)</code>, where the executor runs the callback on the main thread. The callback is an <code>object :</code> that extends <code>BiometricPrompt.AuthenticationCallback</code> on the spot, with no name of its own. Override <code>onAuthenticationSucceeded</code> to unlock. A wrong finger is handled inside the prompt, and if Ada cancels, the screen stays locked. <code>PromptInfo.Builder()</code> sets the title and what counts, and <code>authenticate(info)</code> shows the prompt.</p>
<p>The locked state lives in a small ViewModel, so a rotation doesn’t lock Recipes again. <code>by viewModels()</code> gives an Activity its ViewModel, the same one after rotation, as <code>hiltViewModel()</code> does in a composable. <code>LockViewModel</code> needs nothing, so it doesn’t need <code>@HiltViewModel</code>. A new start of the app is locked again.</p>`,
        visual(el) {
          const locked = '<div class="ui-m-bar">Recipes</div><div class="ui-m-center"><b>Recipes is locked</b><span class="ui-m-muted">App lock is on</span><span class="ui-m-btn ul">Unlock</span></div>';
          const prompt = (msg = 'Touch the fingerprint sensor') => `${locked}<div class="ui-m-sheet"><b>Unlock Recipes</b><div class="ui-m-spin"></div><span class="ui-m-muted">${msg}</span><span class="ui-m-btn ghost">Use PIN</span></div>`;
          const home = '<div class="ui-m-bar">Recipes</div><div class="ui-m-body"><div class="ui-m-row"><div>Tomato soup · 25 min</div></div><div class="ui-m-row"><div>Lemon pasta · 20 min</div></div><div class="ui-m-row"><div>Account: ada@example.com</div></div></div>';
          Lab.ui.phone(el, {
            logTitle: 'Your code',
            predict: {
              q: 'The nephew’s finger doesn’t match. What does your app receive?',
              options: ['No unlock: the prompt says so and stays open', 'A copy of his fingerprint', '<code>onAuthenticationSucceeded</code>'],
              a: 0,
              why: 'The phone compares fingerprints in secure hardware. Your app only ever hears “succeeded”, and that didn’t happen.',
            },
            frames: [
              { screen: locked, log: 'locked = true', say: 'Ada turned on App lock. When Recipes starts, MainActivity shows the locked screen.' },
              { tap: '.ul', log: 'canAuthenticate(BIOMETRIC_WEAK or DEVICE_CREDENTIAL)  →  BIOMETRIC_SUCCESS', say: 'She taps Unlock. The phone has a fingerprint set up, so the app may ask.' },
              { screen: prompt(), log: 'prompt.authenticate(info)', say: 'Android shows its own prompt, with your title. Your app can’t see inside it.' },
              { screen: prompt('Not recognized'), say: 'Her nephew tries his finger. Not recognized: the prompt stays open, and Recipes stays locked.' },
              { screen: prompt(), say: 'Ada touches the sensor.' },
              { screen: home, log: ['onAuthenticationSucceeded(result)', 'locked = false'], say: 'It matches. All your app hears is “succeeded”, and it unlocks.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
// implementation("androidx.biometric:biometric:1.1.0")

class LockViewModel : ViewModel() {
    val locked = MutableStateFlow(true)            // kept through rotation; a new start is locked
}

@AndroidEntryPoint
class MainActivity : FragmentActivity() {          // BiometricPrompt needs a FragmentActivity
    private val lock: LockViewModel by viewModels()
    private lateinit var prompt: BiometricPrompt
    private val allowed = BiometricManager.Authenticators.BIOMETRIC_WEAK or
        BiometricManager.Authenticators.DEVICE_CREDENTIAL      // a finger or face, or the screen lock

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prompt = BiometricPrompt(this, ContextCompat.getMainExecutor(this),
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    lock.locked.value = false
                }
            })
        setContent {
            val locked by lock.locked.collectAsStateWithLifecycle()
            if (locked) {
                LockedScreen(onUnlock = { unlock() })   // your composable: a lock icon and an Unlock button
            } else {
                RecipesScreen()
            }
        }
    }

    private fun unlock() {
        if (BiometricManager.from(this).canAuthenticate(allowed) != BiometricManager.BIOMETRIC_SUCCESS) {
            lock.locked.value = false              // no screen lock on this phone: nothing to check with
            return
        }
        val info = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Unlock Recipes")
            .setAllowedAuthenticators(allowed)
            .build()
        prompt.authenticate(info)
    }
}`,
        remember: 'Check canAuthenticate, then show BiometricPrompt with what counts; your app only learns that it succeeded.',
        terms: [
          { term: 'biometric', def: 'Something about your body the phone can check, such as a fingerprint or a face.' },
          { term: 'BiometricPrompt', def: 'Android’s own prompt that asks for a fingerprint, a face or the screen lock, and tells your app whether it succeeded.' },
          { term: 'device credential', def: 'The phone’s screen lock: its PIN, pattern or password. <code>DEVICE_CREDENTIAL</code> accepts it.' },
          { term: 'FragmentActivity', def: 'A <code>ComponentActivity</code> with support for fragments, which BiometricPrompt uses inside.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Describe the prompt and show it.', code: `val info = BiometricPrompt.PromptInfo.Builder()
    .setTitle("Unlock Recipes")
    .[[setAllowedAuthenticators]](allowed)
    .build()
prompt.[[authenticate]](info)`, why: '<code>setAllowedAuthenticators</code> says what counts, and <code>authenticate</code> shows Android’s prompt.' },
          { type: 'bug', prompt: 'App lock opens Recipes without ever showing the prompt. Tap the wrong line.', code: `private fun unlock() {
    if (BiometricManager.from(this).canAuthenticate(allowed) == BiometricManager.BIOMETRIC_SUCCESS) {
        lock.locked.value = false
        return
    }
    prompt.authenticate(info)   // info built as above
}`, bug: 1, fix: '    if (BiometricManager.from(this).canAuthenticate(allowed) != BiometricManager.BIOMETRIC_SUCCESS) {', why: 'With <code>==</code>, every phone that can show the prompt skips it and unlocks. Only a phone that can’t check anything should skip it.' },
        ],
        quiz: [
          { q: 'What does your app learn from Ada’s fingerprint?', options: ['Only that it matched', 'An image of the fingerprint', 'Which finger she used'], a: 0, why: 'The fingerprint stays in secure hardware. The app gets <code>onAuthenticationSucceeded</code>, nothing more.' },
          { q: 'Why does the app lock use <code>BIOMETRIC_WEAK or DEVICE_CREDENTIAL</code>?', options: ['<code>BIOMETRIC_STRONG</code> with <code>DEVICE_CREDENTIAL</code> doesn’t work on Android 10 and lower', 'Weak sensors are faster', 'Strong sensors need the internet'], a: 0, why: 'Recipes runs from Android 8.0, so it uses the pair that works on every version it supports.' },
          { q: 'Why does <code>MainActivity</code> extend <code>FragmentActivity</code> now?', options: ['BiometricPrompt needs one', 'Hilt needs it', 'Compose needs it'], a: 0, why: 'BiometricPrompt from androidx.biometric is built on fragments. <code>setContent</code> keeps working, because a FragmentActivity is a ComponentActivity too.' },
        ],
        docs: [['Show a biometric authentication dialog', 'https://developer.android.com/identity/sign-in/biometric-auth']],
      },

      {
        id: 'privacy',
        title: 'Privacy',
        tagline: 'Collect only what a feature needs, and ask for less.',
        goals: ['Let the user pick one photo with no permission at all', 'Ask for approximate location when a city-sized area is enough', 'Explain what the Data safety form asks'],
        level: 'intermediate', introduces: ['rememberLauncherForActivityResult', 'PickVisualMedia', 'PickVisualMediaRequest', 'ImageOnly', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
        body: `
<p>Two new features: a photo for each recipe, and “Popular near you”. The easy way asks for all of Ada’s photos and her exact position. But every permission is a question she may refuse, everything you collect can leak, and Google Play asks you to declare it. The privacy rule is <em>data minimization</em>: collect only what a feature needs, keep it only as long as it needs, and choose a way that needs no permission when there is one.</p>
<p>For the photo, use the <em>photo picker</em>, Android’s own screen. Ada picks one photo, and your app gets that one only: no permission, nothing in the manifest. In a composable, <code>rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia())</code> makes a launcher, the composable version of <code>registerForActivityResult</code>. <code>launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))</code> opens it with photos only. The lambda gets a <code>Uri</code>, or <code>null</code> if she closes the picker. Access lasts until the phone restarts or the app stops, so copy the photo into <code>filesDir</code> to keep it.</p>
<p>For “near you”, a city-sized area is enough. <code>ACCESS_COARSE_LOCATION</code> gives an approximate location, an area of about 3 square kilometers. <code>ACCESS_FINE_LOCATION</code> is precise, often within 50 meters. Declare and ask for coarse only. An app that does need precise location asks for both in one request, and since Android 12 the user can still choose “Approximate”, so the app must work with that too.</p>
<p>Before you publish, Google Play asks you to fill in the <em>Data safety</em> form: which data leaves the phone, why, and whether you share it with others, including what the libraries in your app send. An app that collects nothing fills it in too. The less you collect, the shorter that answer, and the less there is to protect.</p>`,
        visual(el) {
          const detail = (extra = '', photo = '') => `<div class="ui-m-bar">← Lemon pasta</div><div class="ui-m-body">${photo}<b>Lemon pasta · 20 min</b><div class="ui-m-line"></div><span class="ui-m-btn ghost ph">Add photo</span><span class="ui-m-btn nr">Popular near you</span></div>${extra}`;
          const picker = '<div class="ui-m-sheet"><b>Select a photo</b><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px"><div class="ui-m-img"></div><div class="ui-m-img p2"></div><div class="ui-m-img"></div><div class="ui-m-img"></div><div class="ui-m-img"></div><div class="ui-m-img"></div></div></div>';
          const dialog = '<div class="ui-m-scrim"><div class="ui-m-dialog"><b>Allow Recipes to access this device’s location?</b><span class="ui-m-muted">Approximate</span><span class="ui-m-btn ghost ok">While using the app</span><span class="ui-m-btn ghost">Only this time</span><span class="ui-m-btn ghost">Don’t allow</span></div></div>';
          const near = '<div class="ui-m-bar">← Popular near you</div><div class="ui-m-body"><span class="ui-m-muted">In your area</span><div class="ui-m-row"><div>Oslo pancakes</div></div><div class="ui-m-row"><div>Tomato soup</div></div></div>';
          Lab.ui.phone(el, {
            logTitle: 'Your code',
            predict: {
              q: 'Recipes uses the photo picker. Which permission must it ask for first?',
              options: ['None', 'Access to all photos', 'The camera'],
              a: 0,
              why: 'The picker is Android’s own screen. Ada chooses, and the app only gets the photo she picked.',
            },
            frames: [
              { screen: detail(), log: '// manifest: no photo permission', say: 'Ada wants a photo for her lemon pasta.' },
              { tap: '.ph', log: 'pickPhoto.launch(PickVisualMediaRequest(ImageOnly))', say: 'She taps Add photo. No permission check: the picker needs none.' },
              { screen: detail(picker), say: 'Android’s photo picker opens. It isn’t your app: Recipes sees nothing until she picks.' },
              { tap: '.p2', log: 'uri = content://…   // this one photo', say: 'She picks one photo. Your lambda gets its <code>Uri</code>: access to that photo only.' },
              { screen: detail('', '<div class="ui-m-img"></div>'), log: 'copied into filesDir', say: 'The app copies it into <code>filesDir</code>, so the recipe keeps it after a restart.' },
              { tap: '.nr', log: 'askLocation.launch(Manifest.permission.ACCESS_COARSE_LOCATION)', say: '“Near you” needs an area, not a street. The app asks for approximate location only.' },
              { screen: detail(dialog, '<div class="ui-m-img"></div>'), say: 'Android’s dialog asks about approximate location. A smaller question gets fewer no’s.' },
              { screen: near, log: 'granted = true   // an area of about 3 km²', say: 'She allows it. Recipes shows what is popular in her area, and never learns her street.' },
            ],
          });
        },
        code: `// The photo picker: no permission, nothing in the manifest
@Composable
fun AddPhotoButton(onPicked: (Uri) -> Unit) {
    val pickPhoto = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) {
            onPicked(uri)                          // copy it into filesDir to keep it
        }
    }
    Button(onClick = {
        pickPhoto.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
    }) {
        Text("Add photo")
    }
}

// AndroidManifest.xml: approximate location only
// <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

@Composable
fun NearYouButton(onAllowed: () -> Unit) {
    val askLocation = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) {
            onAllowed()                            // an area of about 3 km²: enough for "near you"
        }
    }
    Button(onClick = { askLocation.launch(Manifest.permission.ACCESS_COARSE_LOCATION) }) {
        Text("Popular near you")
    }
}`,
        remember: 'Collect only what the feature needs: the photo picker instead of all photos, approximate instead of precise location, and an honest Data safety form.',
        mistakes: [
          { title: 'Asking for precise location when an area is enough', bad: `<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />`, good: `<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />`, why: 'Precise location shows Ada’s street. A bigger question gets more no’s, needs more care, and goes on the Data safety form.' },
        ],
        terms: [
          { term: 'data minimization', def: 'Collecting only the data a feature needs, and keeping it only as long as it needs.' },
          { term: 'photo picker', def: 'Android’s own screen for choosing photos. The app gets only the ones the user picks, with no permission.' },
          { term: 'approximate location', def: 'A location good to an area of about 3 square kilometers, from <code>ACCESS_COARSE_LOCATION</code>.' },
          { term: 'Data safety form', def: 'The form in Google Play where you declare which data your app collects and shares, and why. It is shown on the app’s store page.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Open the photo picker with photos only.', code: `val pickPhoto = rememberLauncherForActivityResult(ActivityResultContracts.[[PickVisualMedia]]()) { uri ->
    if (uri != null) {
        onPicked(uri)
    }
}
pickPhoto.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.[[ImageOnly]]))`, why: '<code>PickVisualMedia</code> is the photo picker, and <code>ImageOnly</code> leaves videos out.' },
          { type: 'bug', prompt: '“Popular near you” only needs an area, but this asks for Ada’s exact position. Tap the line.', code: `Button(onClick = { askLocation.launch(Manifest.permission.ACCESS_FINE_LOCATION) }) {
    Text("Popular near you")
}`, bug: 0, fix: 'Button(onClick = { askLocation.launch(Manifest.permission.ACCESS_COARSE_LOCATION) }) {', why: 'Coarse location is enough for “near you” and is the smaller question to ask.' },
        ],
        quiz: [
          { q: 'What does the Data safety form ask about?', options: ['Which data leaves the phone, why, and who it is shared with', 'How fast the app starts', 'Which Android versions it supports'], a: 0, why: 'It includes data sent by the libraries in your app, and every app on Google Play fills it in.' },
          { q: 'An app asks for precise location on Android 12. What can Ada choose?', options: ['Approximate instead, so the app must work with that', 'Only precise or nothing', 'Her street name'], a: 0, why: 'Since Android 12 the user picks how precise. Plan for approximate.' },
          { q: 'The picker gave the app a <code>Uri</code>. How long can it read the photo?', options: ['Until the phone restarts or the app stops, so copy it to keep it', 'Forever', 'For one second'], a: 0, why: 'The access is short on purpose. Copy the photo into <code>filesDir</code> if the recipe should keep it.' },
        ],
        docs: [['Minimize your permission requests', 'https://developer.android.com/privacy-and-security/minimize-permission-requests'], ['Photo picker', 'https://developer.android.com/training/data-storage/shared/photopicker']],
      },
    ],
  });
})();
