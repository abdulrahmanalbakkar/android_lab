/* Testing track.
   Same shape as tracks/kotlin.js. Demos use the visual kit (Lab.ui); any track CSS goes in the css string, every class
   starting with tst-. */
(() => {
  const css = ``;

  Lab.addTrack({
    id: 'testing',
    title: 'Testing',
    description: 'Check the Recipes app with code: unit tests with JUnit, fakes and MockK, coroutines and flows, Robolectric, Compose UI and screenshot tests, Hilt in tests, and measuring startup with baseline profiles.',
    group: 'Going deeper', requires: ['arch'],
    css,
    lessons: [
      {
        id: 'why-test',
        title: 'Why we test',
        tagline: 'Let code check the app after every change, so you can change it without fear.',
        goals: ['Explain how a regression slips past checking by hand', 'Say what an automated test is and when it runs', 'Pick which rules of an app deserve a test first'],
        level: 'beginner', introduces: [],
        body: `
<p>Sam tidies <code>GetQuickRecipesUseCase</code>. The filter <code>it.minutes &lt;= limit</code> becomes <code>it.minutes &lt; limit</code>, which looks like the same thing. The app builds, starts, and the Tonight screen shows recipes. Two weeks later Lin asks where her Lemon pasta went. It takes exactly 20 minutes, and “less than 20” leaves it out. A <em>regression</em>, like the one in the budget tracker project: something that used to work broke, and nobody noticed.</p>
<p>Checking by hand means opening the app and looking at every screen after every change. That is <em>manual testing</em>, and it grows badly: with five screens, nobody checks them all each time, and an edge like “exactly 20 minutes” is easy to forget. An <em>automated test</em> is code that runs your code with an input you chose and compares the answer with the expected value. Hundreds run in seconds, the same way every time: in Android Studio after each change, and in CI on every pull request, next to lint.</p>
<p>To test the rule on its own, Sam first moves it into a plain function, <code>quickRecipes(recipes, limit)</code>, and the use case calls it. Changing how code is written without changing what it does is called a <em>refactor</em>. The function needs no Room, no screen and no phone: give it a list, check the list it gives back.</p>
<p>That is what tests buy you: confidence. You can refactor, or update a library, and know within seconds that the rules still hold. A test only checks what someone thought to check, so start with the rules that would hurt most if they broke: the Quick filter, the offline note, stars that survive a refresh.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `data class Recipe(val id: Int, val title: String, val minutes: Int, val favorite: Boolean)

fun quickRecipes(recipes: List<Recipe>, limit: Int): List<Recipe> =
    recipes.filter { it.minutes < limit }      // Sam's tidy version

fun main() {
    val soup = Recipe(1, "Tomato soup", 15, false)
    val pasta = Recipe(2, "Lemon pasta", 20, false)
    val stew = Recipe(3, "Bean stew", 45, false)
    val quick = quickRecipes(listOf(soup, pasta, stew), 20)
    if (quick == listOf(soup, pasta)) {
        println("PASS keeps a recipe of exactly 20 minutes")
    } else {
        println("FAIL keeps a recipe of exactly 20 minutes")
    }
}`,
            predict: {
              q: 'This hand-made check runs Sam’s version, with <code>&lt;</code>. What does it print?',
              options: ['<code>FAIL keeps a recipe of exactly 20 minutes</code>', '<code>PASS keeps a recipe of exactly 20 minutes</code>', 'Nothing: the code doesn’t compile'],
              a: 0,
              why: '<code>20 &lt; 20</code> is <code>false</code>, so Lemon pasta is left out, and the list differs from the expected one.',
            },
            frames: [
              { line: [3, 4], say: 'Sam’s tidied rule: <code>&lt;</code> instead of <code>&lt;=</code>. It compiles, and the app starts.' },
              { line: [7, 8, 9], vars: { soup: '15 min', pasta: '20 min', stew: '45 min' }, say: 'The check makes its own input: three recipes. Lemon pasta takes exactly 20 minutes, the edge of the rule.' },
              { line: 10, vars: { quick: '[Tomato soup]' }, say: 'For Lemon pasta, <code>20 &lt; 20</code> is <code>false</code>, so it is left out.' },
              { line: 11, say: 'The check compares the answer with the expected value, written by hand: soup and pasta. The two lists differ.' },
              { line: 14, out: 'FAIL keeps a recipe of exactly 20 minutes', say: 'FAIL, in a fraction of a second, without opening the app. Lin found the same bug two weeks later.' },
              { line: 4, say: 'Put <code>&lt;=</code> back and the same check prints PASS. Run it after every change, and this bug never reaches Lin.' },
            ],
          });
        },
        code: `// domain/QuickRecipes.kt: the rule on its own, easy to check
fun quickRecipes(recipes: List<Recipe>, limit: Int): List<Recipe> =
    recipes.filter { it.minutes <= limit }       // 20 minutes counts as quick

// domain/GetQuickRecipesUseCase.kt: does the same as before, through the function
class GetQuickRecipesUseCase @Inject constructor(
    private val repository: RecipeRepository,
    private val quickLimit: QuickLimit,
) {
    operator fun invoke(): Flow<List<Recipe>> {
        val limit = quickLimit.minutes
        return repository.recipes.map { list -> quickRecipes(list, limit) }
    }
}

// What a test of the rule checks, in words:
// quickRecipes([Tomato soup 15, Lemon pasta 20, Bean stew 45], 20)
// should give [Tomato soup, Lemon pasta]`,
        play: `data class Recipe(val id: Int, val title: String, val minutes: Int, val favorite: Boolean)

// The rule: 20 minutes or less counts as quick.
fun quickRecipes(recipes: List<Recipe>, limit: Int): List<Recipe> =
    recipes.filter { it.minutes <= limit }

fun test(name: String, passed: Boolean) {
    if (passed) {
        println("PASS $name")
    } else {
        println("FAIL $name")
    }
}

fun main() {
    val soup = Recipe(1, "Tomato soup", 15, false)
    val pasta = Recipe(2, "Lemon pasta", 20, false)
    val stew = Recipe(3, "Bean stew", 45, false)

    test("keeps a recipe of exactly 20 minutes", quickRecipes(listOf(soup, pasta, stew), 20) == listOf(soup, pasta))
    test("leaves out long recipes", quickRecipes(listOf(stew), 20).isEmpty())
    test("a limit of 45 keeps all three", quickRecipes(listOf(soup, pasta, stew), 45) == listOf(soup, pasta, stew))
    // Change <= to < in quickRecipes and run again: which checks fail?
}`,
        remember: 'A test is code that checks a rule with an input you chose. Run the tests after every change, and a regression shows up in seconds, not weeks.',
        mistakes: [
          { title: 'Skipping the edge', bad: `// passes with <= and with <, so it can't catch Sam's change
test("keeps quick recipes", quickRecipes(listOf(soup, stew), 20) == listOf(soup))`, good: `// Lemon pasta takes exactly 20 minutes: here <= and < give different answers
test("keeps a recipe of exactly 20 minutes", quickRecipes(listOf(soup, pasta, stew), 20) == listOf(soup, pasta))`, why: 'Bugs hide at the edges of a rule. 15 and 45 minutes give the same answer with <code>&lt;</code> and <code>&lt;=</code>; only 20 tells them apart.' },
        ],
        terms: [
          { term: 'manual testing', def: 'Checking an app by hand: opening it and looking at each screen. Slow, and easy to skip a step.' },
          { term: 'automated test', def: 'Code that runs your code with a chosen input and compares the answer with the expected value, the same way every time.' },
          { term: 'refactor', def: 'Changing how code is written without changing what it does, like moving the Quick rule into <code>quickRecipes</code>.' },
          { term: 'edge case', def: 'An input at the border of a rule, like a recipe of exactly 20 minutes. Bugs like to hide there.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the check at the edge of the rule: Lemon pasta takes exactly 20 minutes.', code: `val quick = quickRecipes(listOf(soup, pasta, stew), [[20]])
if (quick == listOf(soup, [[pasta]])) {
    println("PASS keeps a recipe of exactly 20 minutes")
} else {
    println("FAIL keeps a recipe of exactly 20 minutes")
}`, why: 'The limit is 20, and a recipe of exactly 20 minutes must stay in the list, next to the soup.' },
          { type: 'bug', prompt: 'Recipes of 20 minutes or less count as quick, but the check prints FAIL. Tap the wrong line.', code: `fun quickRecipes(recipes: List<Recipe>, limit: Int): List<Recipe> =
    recipes.filter { it.minutes < limit }`, bug: 1, fix: '    recipes.filter { it.minutes <= limit }', why: '“20 minutes or less” is <code>&lt;=</code>. With <code>&lt;</code>, a recipe of exactly 20 minutes is left out.' },
        ],
        quiz: [
          { q: 'What is a regression?', options: ['A bug in something that used to work', 'A test that fails', 'An app that got slower'], a: 0, why: 'Lemon pasta used to show on Tonight. After Sam’s change it didn’t: the app went back, “regressed”.' },
          { q: 'Why do automated tests catch what checking by hand misses?', options: ['They run every check, the same way, in seconds, after every change', 'They find bugs nobody wrote a check for', 'They make the app run faster'], a: 0, why: 'A test checks only what it was written to check, but it never gets tired or skips a step.' },
          { q: 'Which rule of the Recipes app deserves a test first?', options: ['The Quick filter: 20 minutes still counts as quick', 'The colour of the Refresh button', 'The order of the import lines'], a: 0, why: 'Start with the rules users depend on, the ones that would hurt most if they broke quietly.' },
        ],
        docs: [['Fundamentals of testing Android apps', 'https://developer.android.com/training/testing/fundamentals']],
      },

      {
        id: 'unit',
        title: 'Unit tests',
        tagline: 'Write real tests with JUnit, and let Android Studio or Gradle run them all.',
        goals: ['Write a test class with <code>@Test</code> functions in <code>src/test</code>', 'Check results with <code>assertEquals</code> and <code>assertTrue</code>', 'Run the tests and read a failure'],
        level: 'beginner', introduces: ['assertEquals', 'assertTrue', 'testImplementation'],
        body: `
<p>The hand-made check printed PASS or FAIL, but someone still had to run it and read every line. Android projects come with <em>JUnit</em>, the usual test library for Kotlin and Java: it finds every test, runs each one, and reports which failed and why. A <em>unit test</em> checks one small piece on its own, like the function <code>quickRecipes</code>.</p>
<p>Tests live in their own folder, <code>app/src/test/java/com/example/recipes/</code>. Code there runs on your computer, not on a phone, and never goes into the app people install. The library comes from one line in <code>app/build.gradle.kts</code>: <code>testImplementation("junit:junit:4.13.2")</code>. A new project already has it. <code>testImplementation</code> works like <code>implementation</code>, but only for the code in the test folder. Each Gradle module has its own <code>src/test</code> and its own <code>testImplementation</code> lines. To keep paths short, this track writes <code>app/</code>; a test of <code>RecipesViewModel</code> really goes in <code>feature/recipes/src/test/...</code>, and one of <code>OfflineRecipeRepository</code> in <code>core/data/src/test/...</code>.</p>
<p>A test class is a plain class named after what it tests: <code>QuickRecipesTest</code>. Each function marked <code>@Test</code> is one test. Its name may be a whole sentence between backticks, like <code>fun \`keeps a recipe of exactly 20 minutes\`()</code>: Kotlin accepts spaces in a name written between backticks, and the report reads like a list of rules. A test has three steps: <em>arrange</em> the input, <em>act</em> by calling the code, <em>assert</em> that the result is right. <code>assertEquals(expected, actual)</code> fails the test when the two differ, and the expected value goes first. <code>assertTrue(x)</code> fails when <code>x</code> is <code>false</code>. Both are imported from <code>org.junit.Assert</code>.</p>
<p>To run them, click the green triangle next to the class in Android Studio, or type <code>./gradlew test</code> in the terminal, the same command CI can run. When everything passes, Gradle only says the build was successful. A failure names the test and the line, and the report says what was expected and what came instead.</p>`,
        visual(el) {
          Lab.ui.terminal(el, {
            panelTitle: 'QuickRecipesTest',
            predict: {
              q: 'Sam changes <code>&lt;=</code> to <code>&lt;</code> again and runs <code>./gradlew test</code>. Which of the two tests fails?',
              options: ['<code>keeps a recipe of exactly 20 minutes</code>', '<code>leaves out long recipes</code>', 'Both'],
              a: 0,
              why: 'Bean stew takes 45 minutes, so it stays out with <code>&lt;</code> too. Only the 20-minute Lemon pasta changes.',
            },
            frames: [
              { cmd: './gradlew test', out: 'BUILD SUCCESSFUL in 4s', panel: 'passed: keeps a recipe of exactly 20 minutes<br>passed: leaves out long recipes', say: 'Both tests pass. Gradle prints nothing about them, only that the build worked. Android Studio’s run window lists each one.' },
              { say: 'Sam changes <code>it.minutes &lt;= limit</code> to <code>it.minutes &lt; limit</code> and runs the tests again before he commits.' },
              { cmd: './gradlew test', out: '&gt; Task :app:testDebugUnitTest FAILED\n\nQuickRecipesTest &gt; keeps a recipe of exactly 20 minutes FAILED\n    java.lang.AssertionError at QuickRecipesTest.kt:15\n\n2 tests completed, 1 failed', panel: 'failed: keeps a recipe of exactly 20 minutes<br>passed: leaves out long recipes', say: 'The failing test’s name says which rule broke, and <code>QuickRecipesTest.kt:15</code> is the <code>assertEquals</code> line.' },
              { out: '* What went wrong:\nExecution failed for task \':app:testDebugUnitTest\'.\n&gt; There were failing tests. See the report at: file:///home/sam/Recipes/app/build/reports/tests/testDebugUnitTest/index.html', say: 'The build fails, so CI would show a red cross. The report, a page in the build folder, has the details.' },
              { panel: 'java.lang.AssertionError: expected:&lt;[Recipe(id=1, title=Tomato soup, minutes=15, favorite=false), Recipe(id=2, title=Lemon pasta, minutes=20, favorite=false)]&gt; but was:&lt;[Recipe(id=1, title=Tomato soup, minutes=15, favorite=false)]&gt;', say: 'In the report: expected soup and pasta, but was only soup. Lemon pasta is missing. Recipe is a data class, so it prints its values.' },
              { cmd: './gradlew test', out: 'BUILD SUCCESSFUL in 3s', panel: 'passed: keeps a recipe of exactly 20 minutes<br>passed: leaves out long recipes', say: 'Sam puts <code>&lt;=</code> back, runs again, and both pass. The bug never left his computer.' },
            ],
          });
        },
        code: `package com.example.recipes

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class QuickRecipesTest {
    private val soup = Recipe(1, "Tomato soup", 15, false)
    private val pasta = Recipe(2, "Lemon pasta", 20, false)
    private val stew = Recipe(3, "Bean stew", 45, false)

    @Test
    fun \`keeps a recipe of exactly 20 minutes\`() {
        val result = quickRecipes(listOf(soup, pasta, stew), 20)   // arrange and act
        assertEquals(listOf(soup, pasta), result)                  // assert: expected first
    }

    @Test
    fun \`leaves out long recipes\`() {
        val result = quickRecipes(listOf(stew), 20)
        assertTrue(result.isEmpty())
    }
}
// File: app/src/test/java/com/example/recipes/QuickRecipesTest.kt
// Run: the green triangle next to the class, or ./gradlew test
// The line in app/build.gradle.kts (a new project has it):
//     testImplementation("junit:junit:4.13.2")`,
        remember: 'Tests go in src/test; each @Test function is one test; assertEquals(expected, actual) fails when they differ; run them with ./gradlew test.',
        mistakes: [
          { title: 'Expected and actual swapped', bad: `assertEquals(result, listOf(soup, pasta))
// java.lang.AssertionError: expected:<[Recipe(id=1, title=Tomato soup, minutes=15, favorite=false)]>
//   but was:<[Recipe(id=1, title=Tomato soup, minutes=15, favorite=false), Recipe(id=2, title=Lemon pasta, minutes=20, favorite=false)]>`, good: `assertEquals(listOf(soup, pasta), result)
// java.lang.AssertionError: expected:<[Recipe(id=1, title=Tomato soup, minutes=15, favorite=false), Recipe(id=2, title=Lemon pasta, minutes=20, favorite=false)]>
//   but was:<[Recipe(id=1, title=Tomato soup, minutes=15, favorite=false)]>`, why: 'The test still fails, but the message says the opposite of the truth, and you go looking for a bug in the wrong place. The expected value always goes first.' },
        ],
        terms: [
          { term: 'unit test', def: 'A test of one small piece of code on its own, like one function or one class.' },
          { term: 'JUnit', def: 'The test library Android projects use. It runs every function marked <code>@Test</code> and reports which ones failed.' },
          { term: 'assertion', def: 'A line that checks a result and fails the test when it is wrong, like <code>assertEquals(expected, actual)</code>.' },
          { term: 'arrange, act, assert', def: 'The three steps of a test: make the input, call the code, check the result.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make this a test, and check that the answer is soup and pasta.', code: `class QuickRecipesTest {
    @[[Test]]
    fun \`keeps a recipe of exactly 20 minutes\`() {
        val result = quickRecipes(listOf(soup, pasta, stew), 20)
        [[assertEquals]](listOf(soup, pasta), result)
    }
}`, why: '<code>@Test</code> tells JUnit to run the function. <code>assertEquals</code> takes the expected value first, then the result.' },
          { type: 'bug', prompt: 'The class has two tests, but Android Studio’s run window lists only one. Tap the line to change.', code: `@Test
fun \`keeps a recipe of exactly 20 minutes\`() {
    assertEquals(listOf(soup, pasta), quickRecipes(listOf(soup, pasta, stew), 20))
}

fun \`leaves out long recipes\`() {
    assertTrue(quickRecipes(listOf(stew), 20).isEmpty())
}`, bug: 5, fix: '@Test\nfun `leaves out long recipes`() {', why: 'JUnit only runs functions marked <code>@Test</code>. Without it, the second function is never called, and it can never fail.' },
        ],
        quiz: [
          { q: 'Where does <code>QuickRecipesTest.kt</code> go?', options: ['<code>app/src/test/java/com/example/recipes/</code>', '<code>app/src/main/java/com/example/recipes/</code>', '<code>app/src/main/res/</code>'], a: 0, why: 'The <code>test</code> folder holds tests that run on your computer. Nothing in it goes into the app.' },
          { q: '<code>assertEquals(listOf(soup, pasta), result)</code> fails with <code>expected:&lt;[soup, pasta]&gt; but was:&lt;[soup]&gt;</code> (shortened). What did <code>quickRecipes</code> return?', options: ['Only the soup', 'Soup and pasta', 'An empty list'], a: 0, why: '“but was” is the actual value, the one the code gave back.' },
          { q: 'What does <code>testImplementation("junit:junit:4.13.2")</code> do?', options: ['Adds JUnit for the test code only; it is not in the app people install', 'Adds JUnit to the app', 'Runs the tests when the app starts'], a: 0, why: 'It works like <code>implementation</code>, but only for <code>src/test</code>.' },
        ],
        docs: [['Build local unit tests', 'https://developer.android.com/training/testing/local-tests']],
      },

      {
        id: 'pyramid',
        title: 'The testing pyramid',
        tagline: 'Many small, fast tests at the base; a few big, slow ones on top.',
        goals: ['Tell unit, integration and UI tests apart by how much of the app they use', 'Say where each kind runs: on your computer or on a phone', 'Choose a sensible mix of tests for the Recipes app'],
        level: 'beginner', introduces: ['androidTest', 'connectedAndroidTest', 'androidTestImplementation'],
        body: `
<p><code>QuickRecipesTest</code> proves the rule, but not that Lin sees Lemon pasta on the Tonight screen. The rule can be right while the DAO’s query returns the wrong rows, or the screen never draws the list. Different tests answer different questions, and they cost different amounts of time.</p>
<p>A <em>unit test</em> checks one function or class on its own, in milliseconds. An <em>integration test</em> checks several real parts together, like <code>RecipeDao</code> with a real Room database: does the query really return the recipes sorted by minutes? A <em>UI test</em> uses the whole app the way a person does: open the Recipes screen, see “Lemon pasta”. Bigger tests are closer to what users do, but they are slower, and they can fail for reasons that have nothing to do with your code, like a list that is still animating. A test that passes and fails with the same code is <em>flaky</em>.</p>
<p>Where they run matters. <code>src/test</code> runs on your computer: <code>./gradlew test</code>. The folder <code>src/androidTest</code> holds <em>instrumented tests</em>: Gradle builds the app plus a small test app, installs both on a phone or emulator, and the test app drives yours. <code>./gradlew connectedAndroidTest</code> runs them on the connected phone or emulator, and their libraries are added with <code>androidTestImplementation</code>. The Room test and the UI test go there, because they need Android.</p>
<p>The <em>testing pyramid</em> is the shape to aim for: many unit tests at the base, fewer integration tests, and a few UI tests on top for the paths that must never break, like opening the list. A bug caught by a unit test is found in seconds, and the test’s name points at the broken function.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['unit<small>src/test</small>', 'integration<small>androidTest</small>', 'UI<small>androidTest</small>'],
            span: 120, unit: 's',
            predict: {
              q: 'Sam’s <code>&lt;</code> bug hides Lemon pasta. A unit test and a UI test both fail. Which one tells him where to look?',
              options: ['<code>QuickRecipesTest</code>: it checks one function', 'The UI test: it sees what Lin sees', 'Neither: he has to open the app'],
              a: 0,
              why: 'The unit test names the rule and the line. The UI test only knows that “Lemon pasta” is missing from the screen, which could have many causes.',
            },
            frames: [
              { say: 'One run of every test in the Recipes app, drawn on a timeline in seconds. The times are rough; yours will differ.' },
              { bars: [{ lane: 0, from: 0, to: 4, label: '120 tests', tone: 'ok' }], say: '<code>./gradlew test</code>: 120 unit tests on your computer, about 4 seconds in all. Each takes a few milliseconds.' },
              { bars: [{ lane: 1, from: 4, to: 34, label: 'install, 8 DAO tests', tone: 'warm' }], say: '<code>./gradlew connectedAndroidTest</code> builds and installs the app and the test app first. Then 8 tests run <code>RecipeDao</code> against a real Room database.' },
              { bars: [{ lane: 2, from: 34, to: 110, label: '5 screen tests', tone: 'accent' }], say: 'Five UI tests open the Recipes screen, tap, and wait for the list. Each one takes seconds.' },
              { marks: [{ at: 80, label: 'flaky', tone: 'err' }], say: 'One UI test fails, then passes when run again with the same code: the list was still animating. A flaky test.' },
              { marks: [{ at: 2, label: 'FAIL', tone: 'err' }], say: 'Sam’s <code>&lt;</code> bug: <code>QuickRecipesTest</code> fails in the first seconds, and its name points at <code>quickRecipes</code>.' },
              { say: 'So: many unit tests at the base, fewer integration tests, a few UI tests on top for the paths that must never break. That shape is the testing pyramid.' },
            ],
          });
        },
        code: `app/src/main/java/com/example/recipes/            // the app
app/src/test/java/com/example/recipes/            // local tests: on your computer
    QuickRecipesTest.kt                           //   unit: one function, milliseconds
app/src/androidTest/java/com/example/recipes/     // instrumented tests: on a phone or emulator
    RecipeDaoTest.kt                              //   integration: the DAO with a real Room database
    RecipesScreenTest.kt                          //   UI: open the list, see "Lemon pasta"

// app/build.gradle.kts
dependencies {
    testImplementation("junit:junit:4.13.2")      // libraries for src/test
    // androidTestImplementation(...)              // libraries for src/androidTest
}

// In the terminal
./gradlew test                     # runs src/test
./gradlew connectedAndroidTest     # runs src/androidTest on the connected phone or emulator`,
        remember: 'Many fast unit tests in src/test, fewer integration tests, a few UI tests in src/androidTest for the paths that must never break.',
        terms: [
          { term: 'integration test', def: 'A test of several real parts working together, like the DAO with a real Room database.' },
          { term: 'instrumented test', def: 'A test in <code>src/androidTest</code> that runs on a phone or emulator, next to the app, so it can use Android.' },
          { term: 'flaky test', def: 'A test that sometimes passes and sometimes fails with the same code, often because of timing.' },
          { term: 'testing pyramid', def: 'The mix to aim for: many small, fast tests at the base and a few big, slow ones on top.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Put each test in its folder.', code: `app/src/[[test]]/java/com/example/recipes/QuickRecipesTest.kt          // on your computer
app/src/[[androidTest]]/java/com/example/recipes/RecipesScreenTest.kt   // on a phone or emulator`, why: '<code>test</code> runs on your computer. <code>androidTest</code> is installed and run on a phone or emulator.' },
          { type: 'bug', prompt: 'Sam wants to run the UI tests on the emulator, but only the unit tests run. Tap the wrong line.', code: `./gradlew test              # the unit tests in src/test
./gradlew test              # the UI tests in src/androidTest, on the emulator`, bug: 1, fix: './gradlew connectedAndroidTest   # the UI tests in src/androidTest, on the emulator', why: '<code>test</code> only runs <code>src/test</code>. <code>connectedAndroidTest</code> installs the app and runs <code>src/androidTest</code> on the connected phone or emulator.' },
        ],
        quiz: [
          { q: 'Which test is likely the fastest?', options: ['<code>QuickRecipesTest</code>', '<code>RecipeDaoTest</code>', '<code>RecipesScreenTest</code>'], a: 0, why: 'It runs one function on your computer: no install, no database, no screen.' },
          { q: 'A test fails, you run it again with no change, and it passes. What is it?', options: ['A flaky test', 'A unit test', 'A passing test'], a: 0, why: 'Same code, different results: usually timing. Flaky tests teach people to ignore red, so fix them.' },
          { q: 'Why keep most tests at the base of the pyramid?', options: ['They are fast and point at the exact piece that broke', 'UI tests can’t find bugs', 'Gradle can only run unit tests'], a: 0, why: 'UI tests are worth having for the main paths, but they are slow and say less about where the problem is.' },
        ],
        docs: [['Testing strategies', 'https://developer.android.com/training/testing/fundamentals/strategies'], ['Test from the command line', 'https://developer.android.com/studio/test/command-line']],
      },

      {
        id: 'fakes',
        title: 'Test doubles',
        tagline: 'Stand in for the database and the server, so a test is fast and gives the same answer every time.',
        goals: ['Explain why a test replaces Room and the server with a stand-in', 'Write a fake that implements <code>RecipeRepository</code> with a list in memory', 'Tell a fake, a stub and a mock apart'],
        level: 'intermediate', introduces: [],
        body: `
<p>Next, Sam wants to test <code>GetQuickRecipesUseCase</code> itself: does it give only quick recipes from the repository? In the app it gets <code>OfflineRecipeRepository</code>, which needs Room, the server and DataStore. A test through it would need a phone, a network, and whatever recipes the server has today: slow, and a different answer tomorrow.</p>
<p>A <em>test double</em> stands in for a real dependency during a test, like a stunt double in a film. Since the clean architecture lesson, the use case asks for the interface <code>RecipeRepository</code>, not for <code>OfflineRecipeRepository</code>. So any class that keeps the interface’s promise can be passed in. That is dependency inversion paying off.</p>
<p>A <em>fake</em> is a working, lighter version. <code>FakeRecipeRepository</code> keeps its “table” in a <code>MutableStateFlow</code> in memory: <code>toggleFavorite</code> really flips the star, and <code>refresh</code> counts its calls and can fail on purpose, like a phone with no signal. It lives in <code>src/test</code>, so it never ships. A <em>stub</em> only gives back fixed answers. A <em>mock</em> is made by a library: you tell it what to answer, and afterwards check which calls it got. Android’s guide prefers fakes: no library, easy to read, and one fake serves many tests.</p>
<p>The test builds the use case with the fake and a <code>QuickLimit()</code>, calls <code>getQuickRecipes()</code> and takes the first list with <code>first()</code>. <code>first()</code> is a suspend function and a test function is not, so the body runs inside <code>runBlocking { }</code>, from the coroutines track, which waits until the coroutine inside is done.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            predict: {
              q: 'In the test, the use case gets <code>FakeRecipeRepository</code> instead of <code>OfflineRecipeRepository</code>. What must change in <code>GetQuickRecipesUseCase</code>?',
              options: ['Nothing: it only knows the interface', 'The type in its constructor', 'It needs a test-only copy'],
              a: 0,
              why: 'It asks for a <code>RecipeRepository</code>. Both classes implement it, so either one fits.',
            },
            nodes: [
              { id: 'uc', label: 'GetQuickRecipesUseCase', x: 40, y: 10 },
              { id: 'test', label: 'GetQuickRecipesUseCaseTest', x: 80, y: 30, tone: 'warm', hidden: true },
              { id: 'iface', label: 'RecipeRepository<small>interface</small>', x: 40, y: 44, tone: 'muted' },
              { id: 'real', label: 'OfflineRecipeRepository', x: 22, y: 70 },
              { id: 'fake', label: 'FakeRecipeRepository<small>list in memory</small>', x: 76, y: 70, tone: 'ok', hidden: true },
              { id: 'room', label: 'Room', x: 10, y: 92, tone: 'muted' },
              { id: 'server', label: 'server', x: 36, y: 92, tone: 'muted' },
            ],
            frames: [
              { add: [['uc', 'iface', 'needs'], ['real', 'iface', 'implements'], ['real', 'room'], ['real', 'server']], say: 'In the app, the use case asks for the interface, and Hilt hands it <code>OfflineRecipeRepository</code>, which reads Room and calls the server.' },
              { hl: ['room', 'server'], say: 'A test through it needs a phone for Room, a network, and the server’s recipes of today. Slow, and the answer can change.' },
              { show: ['fake', 'test'], gone: ['real', 'room', 'server'], remove: [['real', 'iface'], ['real', 'room'], ['real', 'server']], add: [['fake', 'iface', 'implements', 'ok'], ['test', 'fake', 'builds']], hl: ['fake'], say: 'In the test, a fake implements the same interface. Its table is a <code>MutableStateFlow</code> holding three recipes.' },
              { add: [['test', 'uc', 'calls']], hl: ['test', 'uc'], say: 'The test builds the use case with the fake and calls <code>getQuickRecipes()</code>. The use case runs exactly the same code as in the app.' },
              { hl: ['uc'], say: 'It filters the fake’s list and gives back Tomato soup and Lemon pasta. <code>assertEquals</code> agrees.' },
              { hl: ['fake'], say: 'No phone, no network: the test takes milliseconds and gives the same answer on every run, on any computer, in CI too.' },
            ],
          });
        },
        code: `// app/src/test/java/com/example/recipes/FakeRecipeRepository.kt
class FakeRecipeRepository(saved: List<Recipe> = listOf()) : RecipeRepository {
    val table = MutableStateFlow(saved)          // the "Room table", in memory
    override val recipes: Flow<List<Recipe>> = table

    var refreshCalls = 0
    var failRefresh = false                      // true: act like a phone with no signal

    override suspend fun refresh(force: Boolean) {
        refreshCalls += 1
        if (failRefresh) {
            throw IOException("offline")
        }
    }

    override suspend fun toggleFavorite(recipe: Recipe) {
        table.value = table.value.map { if (it.id == recipe.id) { it.copy(favorite = !it.favorite) } else { it } }
    }
}

// app/src/test/java/com/example/recipes/GetQuickRecipesUseCaseTest.kt
class GetQuickRecipesUseCaseTest {
    private val soup = Recipe(1, "Tomato soup", 15, false)
    private val pasta = Recipe(2, "Lemon pasta", 20, false)
    private val stew = Recipe(3, "Bean stew", 45, false)

    @Test
    fun \`gives only quick recipes\`() = runBlocking {
        val repository = FakeRecipeRepository(listOf(soup, pasta, stew))
        val getQuickRecipes = GetQuickRecipesUseCase(repository, QuickLimit())
        assertEquals(listOf(soup, pasta), getQuickRecipes().first())
    }

    @Test
    fun \`a longer limit gives more\`() = runBlocking {
        val repository = FakeRecipeRepository(listOf(soup, pasta, stew))
        val quickLimit = QuickLimit()
        quickLimit.minutes = 45
        val getQuickRecipes = GetQuickRecipesUseCase(repository, quickLimit)
        assertEquals(listOf(soup, pasta, stew), getQuickRecipes().first())
    }
}`,
        play: `import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking

data class Recipe(val id: Int, val title: String, val minutes: Int, val favorite: Boolean)

interface RecipeRepository {
    val recipes: Flow<List<Recipe>>
    suspend fun toggleFavorite(recipe: Recipe)
}

class FakeRecipeRepository(saved: List<Recipe> = listOf()) : RecipeRepository {
    val table = MutableStateFlow(saved)
    override val recipes: Flow<List<Recipe>> = table

    override suspend fun toggleFavorite(recipe: Recipe) {
        table.value = table.value.map { if (it.id == recipe.id) { it.copy(favorite = !it.favorite) } else { it } }
    }
}

class QuickLimit {
    var minutes = 20
}

class GetQuickRecipesUseCase(private val repository: RecipeRepository, private val quickLimit: QuickLimit) {
    operator fun invoke(): Flow<List<Recipe>> {
        val limit = quickLimit.minutes
        return repository.recipes.map { list -> list.filter { it.minutes <= limit } }
    }
}

fun main() = runBlocking {
    val soup = Recipe(1, "Tomato soup", 15, false)
    val pasta = Recipe(2, "Lemon pasta", 20, false)
    val stew = Recipe(3, "Bean stew", 45, false)
    val repository = FakeRecipeRepository(listOf(soup, pasta, stew))
    val getQuickRecipes = GetQuickRecipesUseCase(repository, QuickLimit())

    val quick = getQuickRecipes().first()
    println(quick.map { it.title })
    println(quick == listOf(soup, pasta))

    repository.toggleFavorite(soup)
    println(repository.recipes.first().map { it.favorite })
    // Try: set the fake's table to listOf(stew) with repository.table.value = ..., then ask again.
}`,
        remember: 'A fake is a light, working version of a dependency, kept in src/test. It works because the code under test asks for an interface.',
        mistakes: [
          { title: 'One fake shared by every test', bad: `object FakeRecipeRepository : RecipeRepository {
    val table = MutableStateFlow(listOf(soup, pasta, stew))
    // ...
}
// one test stars Tomato soup; another expects it unstarred, and fails only sometimes`, good: `@Test
fun \`gives only quick recipes\`() = runBlocking {
    val repository = FakeRecipeRepository(listOf(soup, pasta, stew))   // a new fake in every test
    // ...
}`, why: 'An <code>object</code> is one for the whole test run, so a star from one test is still there in the next. JUnit doesn’t promise an order, so the test passes or fails depending on which test ran before it: add a test, or run one on its own, and the result flips. Build a new fake inside each test.' },
        ],
        terms: [
          { term: 'test double', def: 'Anything that stands in for a real dependency during a test.' },
          { term: 'fake', def: 'A test double with a working, simpler implementation, like a repository that keeps its recipes in memory.' },
          { term: 'stub', def: 'A test double that only gives back fixed answers.' },
          { term: 'mock', def: 'A test double made by a library: you set its answers, and afterwards check which calls it received.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the fake keep the repository’s promise.', code: `class FakeRecipeRepository(saved: List<Recipe> = listOf()) : [[RecipeRepository]] {
    val table = MutableStateFlow(saved)
    [[override]] val recipes: Flow<List<Recipe>> = table
    // refresh and toggleFavorite as before
}`, why: 'The fake implements the interface, so it can go wherever a <code>RecipeRepository</code> is asked for. Each promised member is marked <code>override</code>.' },
          { type: 'bug', prompt: 'A test stars Tomato soup with the fake, but the soup stays unstarred. Tap the wrong line.', code: `override suspend fun toggleFavorite(recipe: Recipe) {
    table.value.map { if (it.id == recipe.id) { it.copy(favorite = !it.favorite) } else { it } }
}`, bug: 1, fix: '    table.value = table.value.map { if (it.id == recipe.id) { it.copy(favorite = !it.favorite) } else { it } }', why: '<code>map</code> makes a new list and leaves the old one alone. Store the new list in <code>table.value</code>, so the flow sends it.' },
        ],
        quiz: [
          { q: 'Why can <code>GetQuickRecipesUseCase</code> take a <code>FakeRecipeRepository</code>?', options: ['It asks for the interface <code>RecipeRepository</code>, and the fake implements it', 'Hilt swaps the classes in tests', 'The fake extends <code>OfflineRecipeRepository</code>'], a: 0, why: 'Code that depends on an interface works with any class that implements it.' },
          { q: 'Which of these is a fake?', options: ['A class with a working, in-memory version of the repository', 'An object from a library whose calls you check afterwards', 'A value passed in but never used'], a: 0, why: 'A fake really works, just in a simpler way. The second one is a mock.' },
          { q: 'Why does the test body run inside <code>runBlocking</code>?', options: ['<code>first()</code> is a suspend function, and a test function is not', 'So the test runs on the main thread', 'It makes the test faster'], a: 0, why: 'A suspend function can only be called from a coroutine. <code>runBlocking</code> starts one and waits for it.' },
        ],
        docs: [['Use test doubles in Android', 'https://developer.android.com/training/testing/fundamentals/test-doubles']],
      },

      {
        id: 'mockk',
        title: 'MockK',
        tagline: 'Make a stand-in in one line, tell it what to answer, then check what it was asked.',
        goals: ['Create a mock with <code>mockk</code> and give it answers with <code>every</code>', 'Check that a call happened with <code>coVerify</code>', 'Choose between a fake and a mock'],
        level: 'intermediate', introduces: ['mockk', 'returns', 'coEvery', 'coVerify', 'relaxed'],
        body: `
<p>Now Sam tests <code>OfflineRecipeRepository</code> itself. When Lin stars Tomato soup, it must write the row with <code>favorite = true</code> to the DAO. A fake <code>RecipeDao</code> would have to implement every DAO function (<code>getAll</code>, <code>insert</code>, <code>update</code>, <code>upsertAll</code>, <code>getWithSteps</code>), and the repository needs a Session and a DataStore too. And the result to check is a call: was <code>dao.update</code> called with the right row?</p>
<p><em>MockK</em> is a mocking library for Kotlin, added with <code>testImplementation("io.mockk:mockk:1.14.11")</code>. <code>mockk&lt;RecipeDao&gt;()</code> makes a mock: an object that pretends to be a <code>RecipeDao</code> and records every call it gets. You choose its answers: <code>every { dao.getAll() } returns MutableStateFlow(listOf(row))</code>. For a suspend function, write <code>coEvery</code> (co for coroutine). A mock is strict: a call it has no answer for throws a <code>MockKException</code> that starts with “no answer found for”. <code>mockk&lt;RecipeDao&gt;(relaxed = true)</code> answers every call with a simple default instead, and does nothing for functions like <code>update</code> that return <code>Unit</code>.</p>
<p>After the code has run, <code>coVerify { dao.update(RecipeEntity(1, "Tomato soup", 15, true)) }</code> fails the test unless that call happened, with an equal row. Use <code>verify</code> for a normal function. <code>coVerify(exactly = 1) { ... }</code> also checks how many times, and <code>exactly = 0</code> checks that something never happened.</p>
<p>Fake or mock? A fake is easier to read and keeps working when the code changes how it calls things, so <code>FakeRecipeRepository</code> stays. A mock is quicker for a big interface, like a DAO, or when the call itself is the result, like a write. Don’t verify every call, though: a test that checks how the code works, instead of what it gives, breaks with every refactor.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            varsTitle: 'Calls the mock saw',
            code: `@Test
fun \`starring writes the row with favorite on\`() = runBlocking {
    val dao = mockk<RecipeDao>(relaxed = true)
    val repository = OfflineRecipeRepository(dao, mockk(), mockk())
    repository.toggleFavorite(Recipe(1, "Tomato soup", 15, false))
    coVerify { dao.update(RecipeEntity(1, "Tomato soup", 15, true)) }
}`,
            predict: {
              q: 'Someone removes the <code>!</code> in <code>toggleFavorite</code>, so the repository writes <code>favorite = false</code>. What happens to this test?',
              options: ['<code>coVerify</code> fails: no call with that row', 'Line 5 throws an exception', 'It still passes: <code>update</code> was called'],
              a: 0,
              why: '<code>coVerify</code> compares the row with <code>==</code>. <code>RecipeEntity</code> is a data class, so a row with <code>favorite = false</code> is not equal.',
            },
            frames: [
              { line: 3, say: 'A relaxed mock: a <code>RecipeDao</code> with no real code inside. It answers every call with a simple default and remembers each one.' },
              { line: 4, vars: { 'call 1': 'getAll()' }, say: 'Building the repository already calls <code>dao.getAll()</code>, because <code>recipes</code> is made from it. The two <code>mockk()</code> are the Session and the DataStore: strict, and never called here.' },
              { line: 5, vars: { 'call 2': 'update(RecipeEntity(1, "Tomato soup", 15, true))' }, say: '<code>toggleFavorite</code> flips the star and writes the row. The mock records the call and its argument.' },
              { line: 6, say: '<code>coVerify</code> looks through the recorded calls for <code>update</code> with an equal row. Call 2 matches, so the test passes.' },
              { line: 6, say: 'If the repository had written <code>favorite = false</code>, call 2 would hold a different row, and <code>coVerify</code> would fail the test.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
//     testImplementation("io.mockk:mockk:1.14.11")

class OfflineRecipeRepositoryTest {
    @Test
    fun \`turns Room rows into recipes\`() = runBlocking {
        val dao = mockk<RecipeDao>()
        every { dao.getAll() } returns MutableStateFlow(listOf(RecipeEntity(1, "Tomato soup", 15, false)))
        val repository = OfflineRecipeRepository(dao, mockk(), mockk())   // after every: recipes reads getAll() right away
        assertEquals(listOf(Recipe(1, "Tomato soup", 15, false)), repository.recipes.first())
    }

    @Test
    fun \`starring writes the row with favorite on\`() = runBlocking {
        val dao = mockk<RecipeDao>(relaxed = true)                          // update returns Unit: nothing to set up
        val repository = OfflineRecipeRepository(dao, mockk(), mockk())   // Session and DataStore: not used here
        repository.toggleFavorite(Recipe(1, "Tomato soup", 15, false))
        coVerify(exactly = 1) { dao.update(RecipeEntity(1, "Tomato soup", 15, true)) }
    }
}`,
        remember: 'mockk<T>() makes a mock; every / coEvery give it answers; verify / coVerify check the calls. Prefer a fake for your own small interfaces.',
        mistakes: [
          { title: 'Building before giving the answer', bad: `val dao = mockk<RecipeDao>()
val repository = OfflineRecipeRepository(dao, mockk(), mockk())
// MockKException: no answer found for …
every { dao.getAll() } returns MutableStateFlow(listOf(row))`, good: `val dao = mockk<RecipeDao>()
every { dao.getAll() } returns MutableStateFlow(listOf(row))
val repository = OfflineRecipeRepository(dao, mockk(), mockk())`, why: 'The repository calls <code>getAll()</code> while it is being built. A strict mock with no answer yet throws, so set up the answers first.' },
        ],
        terms: [
          { term: 'MockK', def: 'A Kotlin library that makes mocks: <code>mockk</code> creates one, <code>every</code> sets answers, <code>verify</code> checks calls.' },
          { term: 'relaxed mock', def: 'A mock made with <code>relaxed = true</code>: it answers every call with a simple default instead of throwing.' },
          { term: 'verify', def: 'Checking afterwards that a mock received a call, with <code>verify { }</code>, or <code>coVerify { }</code> for a suspend function.' },
          { term: 'over-specified test', def: 'A test that checks how the code works, call by call, instead of what it gives, so it breaks with every refactor.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give the strict mock its answer for <code>getAll()</code>.', code: `val dao = mockk<RecipeDao>()
[[every]] { dao.getAll() } [[returns]] MutableStateFlow(listOf(RecipeEntity(1, "Tomato soup", 15, false)))
val repository = OfflineRecipeRepository(dao, mockk(), mockk())
assertEquals(listOf(Recipe(1, "Tomato soup", 15, false)), repository.recipes.first())`, why: '<code>getAll()</code> is a normal function that returns a Flow, so <code>every { } returns</code> sets its answer.' },
          { type: 'bug', prompt: 'The test doesn’t compile: <code>Suspend function \'suspend fun update(recipe: RecipeEntity): Unit\' can only be called from a coroutine or another suspend function.</code> Tap the wrong line.', code: `val dao = mockk<RecipeDao>(relaxed = true)
val repository = OfflineRecipeRepository(dao, mockk(), mockk())
repository.toggleFavorite(Recipe(1, "Tomato soup", 15, false))
verify { dao.update(RecipeEntity(1, "Tomato soup", 15, true)) }`, bug: 3, fix: 'coVerify { dao.update(RecipeEntity(1, "Tomato soup", 15, true)) }', why: '<code>update</code> is a suspend function. <code>verify</code> takes normal code only; <code>coVerify</code> can check suspend calls.' },
        ],
        quiz: [
          { q: 'A test uses <code>mockk&lt;RecipeDao&gt;()</code> with no <code>every</code>, and the code calls <code>dao.getAll()</code>. What happens?', options: ['It throws a <code>MockKException</code>: no answer found', 'It returns an empty list', 'It returns <code>null</code>'], a: 0, why: 'Mocks are strict unless you make them relaxed. Every call needs an answer.' },
          { q: 'Which line checks that the suspend function <code>dao.update</code> was called once?', options: ['<code>coVerify(exactly = 1) { dao.update(row) }</code>', '<code>verify { dao.update(row) }</code>', '<code>coEvery { dao.update(row) }</code>'], a: 0, why: '<code>co</code> is for suspend functions, <code>verify</code> checks, and <code>exactly</code> counts.' },
          { q: '<code>RecipeRepository</code> has three functions and is used by many tests. Which stand-in fits best?', options: ['A fake, written once and reused', 'A new mock with <code>every</code> lines in each test', 'The real <code>OfflineRecipeRepository</code>'], a: 0, why: 'A small interface you own is quick to fake, and the fake reads well in every test.' },
        ],
        docs: [['MockK', 'https://mockk.io/']],
      },

      {
        id: 'coroutines',
        title: 'Testing coroutines',
        tagline: 'Test a ViewModel with runTest, a test Main dispatcher, and a clock that skips delays.',
        goals: ['Replace the Main dispatcher in tests with <code>Dispatchers.setMain</code>', 'Write a test with <code>runTest</code> and run queued coroutines with <code>advanceUntilIdle</code>', 'Explain why <code>delay</code> takes no time inside <code>runTest</code>'],
        level: 'intermediate', introduces: ['runTest', 'setMain', 'resetMain', 'StandardTestDispatcher', 'advanceUntilIdle', 'currentTime'],
        body: `
<p>An important rule of the Recipes screen lives in <code>RecipesViewModel</code>: when the refresh fails, keep the list and show “Offline: showing saved recipes”. Sam builds the ViewModel with a <code>FakeRecipeRepository</code> whose refresh fails, and the test crashes at once: <code>java.lang.IllegalStateException: Module with the Main dispatcher had failed to initialize. For tests Dispatchers.setMain from kotlinx-coroutines-test module can be used</code>. <code>viewModelScope</code> runs on <code>Dispatchers.Main</code>, a phone’s main thread, and a test in <code>src/test</code> runs on your computer, where there is none.</p>
<p>The library <code>kotlinx-coroutines-test</code> fixes it: <code>testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.11.0")</code>. Before each test, <code>Dispatchers.setMain(StandardTestDispatcher())</code> puts a <em>test dispatcher</em> where Main was; after it, <code>Dispatchers.resetMain()</code> puts Main back. A function marked <code>@Before</code> runs before every test of the class, and one marked <code>@After</code> runs after every test. <code>setMain</code> is experimental, so the class gets <code>@OptIn(ExperimentalCoroutinesApi::class)</code>, as for <code>flatMapLatest</code>.</p>
<p>The test body goes inside <code>runTest { }</code> instead of <code>runBlocking</code>. A <code>StandardTestDispatcher</code> doesn’t run a launched coroutine right away: it puts it in a queue, and nothing runs until the test lets it. So just after the ViewModel is built, its state is still the starting one, with <code>isLoading = true</code>. <code>advanceUntilIdle()</code> runs everything in the queue until nothing is left; then the state has the list and the note. You decide when the coroutines run, so every run happens in the same order.</p>
<p><code>runTest</code> also keeps <em>virtual time</em>: a clock of its own. <code>delay(5000)</code> inside it moves that clock 5 seconds forward and returns at once, while <code>runBlocking</code> really waits. A retry that waits 3 seconds in the app takes milliseconds in a test, and <code>currentTime</code> tells you how much virtual time has passed.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            varsTitle: 'uiState and queue',
            code: `@OptIn(ExperimentalCoroutinesApi::class)
class RecipesViewModelTest {
    @Before
    fun setUp() {
        Dispatchers.setMain(StandardTestDispatcher())
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun \`offline refresh keeps the list and shows a note\`() = runTest {
        val soup = Recipe(1, "Tomato soup", 15, false)
        val repository = FakeRecipeRepository(listOf(soup))
        repository.failRefresh = true
        val quickLimit = QuickLimit()
        val viewModel = RecipesViewModel(repository, GetQuickRecipesUseCase(repository, quickLimit), quickLimit)
        assertTrue(viewModel.uiState.value.isLoading)    // queued: nothing ran yet
        advanceUntilIdle()                               // run everything in the queue
        val state = viewModel.uiState.value
        assertEquals(listOf(soup), state.recipes)
        assertEquals("Offline: showing saved recipes", state.note)
        assertEquals(1, repository.refreshCalls)
    }
}`,
            predict: {
              q: 'Line 20 runs right after the ViewModel is built. Is <code>isLoading</code> still <code>true</code> there?',
              options: ['Yes: the coroutines from <code>init</code> are queued until the test lets them run', 'No: <code>init</code> already loaded the list', 'The test crashes on line 19'],
              a: 0,
              why: 'With a <code>StandardTestDispatcher</code>, <code>launch</code> only queues the coroutine. <code>advanceUntilIdle()</code> on line 21 runs it.',
            },
            frames: [
              { line: 5, vars: { Main: 'StandardTestDispatcher' }, say: '<code>@Before</code> runs first. <code>setMain</code> puts a test dispatcher where Main was, so <code>viewModelScope</code> has somewhere to run.' },
              { line: [15, 16, 17], say: 'The fake holds Tomato soup, and its refresh will fail like a phone with no signal.' },
              { line: 19, vars: { queue: 'collect recipes, refresh', isLoading: 'true', recipes: '[]', note: '""' }, say: '<code>init</code> launches two coroutines in <code>viewModelScope</code>: one collects the recipes, one refreshes. Both wait in the queue.' },
              { line: 20, say: 'Nothing has run, so the state is still the start: <code>isLoading</code> is <code>true</code>. The check passes.' },
              { line: 21, vars: { queue: 'refresh', isLoading: 'false', recipes: '[Tomato soup]' }, say: '<code>advanceUntilIdle()</code> runs the queue. First the collect: the fake’s table sends <code>[Tomato soup]</code>.' },
              { line: 21, vars: { queue: '(empty)', note: '"Offline: showing saved recipes"' }, say: 'Then the refresh: the fake throws <code>IOException</code>, and the <code>catch</code> writes the note. The collect waits for the next list. Nothing left to run.' },
              { line: [23, 24, 25], say: 'All three checks pass: the list stayed, the note is there, and the ViewModel refreshed once. The test took milliseconds.' },
              { line: 10, vars: { Main: 'Main' }, say: '<code>@After</code> runs <code>resetMain()</code>, so the next test starts clean.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
//     testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.11.0")

// the new imports (the others as in earlier tests)
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.delay
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.currentTime
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Before

@OptIn(ExperimentalCoroutinesApi::class)
class RecipesViewModelTest {
    @Before
    fun setUp() {
        Dispatchers.setMain(StandardTestDispatcher())
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun \`offline refresh keeps the list and shows a note\`() = runTest {
        val soup = Recipe(1, "Tomato soup", 15, false)
        val repository = FakeRecipeRepository(listOf(soup))
        repository.failRefresh = true
        val quickLimit = QuickLimit()
        val viewModel = RecipesViewModel(repository, GetQuickRecipesUseCase(repository, quickLimit), quickLimit)
        advanceUntilIdle()
        assertEquals("Offline: showing saved recipes", viewModel.uiState.value.note)
    }

    @Test
    fun \`runTest skips delays\`() = runTest {
        delay(5000)                          // returns at once
        assertEquals(5000L, currentTime)     // 5 seconds of virtual time have passed
    }
}`,
        remember: 'setMain(StandardTestDispatcher()) in @Before, resetMain() in @After, the body in runTest; advanceUntilIdle() runs what was queued, and delay costs no real time.',
        mistakes: [
          { title: 'Checking before the queue has run', bad: `val viewModel = RecipesViewModel(repository, GetQuickRecipesUseCase(repository, quickLimit), quickLimit)
assertEquals("Offline: showing saved recipes", viewModel.uiState.value.note)
// org.junit.ComparisonFailure: expected:<[Offline: showing saved recipes]> but was:<[]>`, good: `val viewModel = RecipesViewModel(repository, GetQuickRecipesUseCase(repository, quickLimit), quickLimit)
advanceUntilIdle()
assertEquals("Offline: showing saved recipes", viewModel.uiState.value.note)`, why: 'The refresh is still waiting in the queue, so the note is empty. Let the queued coroutines run first.' },
        ],
        terms: [
          { term: 'runTest', def: 'Runs a test’s body as a coroutine, with a test dispatcher and virtual time, so <code>delay</code> returns at once.' },
          { term: 'test dispatcher', def: 'A dispatcher for tests, like <code>StandardTestDispatcher</code>: it queues coroutines until the test runs them, for example with <code>advanceUntilIdle()</code>.' },
          { term: 'virtual time', def: 'The clock of <code>runTest</code>. <code>delay</code> moves it forward without waiting; <code>currentTime</code> reads it.' },
          { term: '@Before / @After', def: 'Mark functions JUnit runs before and after every test of the class, for setting up and cleaning up.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give the ViewModel a test Main dispatcher, and let its coroutines run before the check.', code: `@Before
fun setUp() {
    Dispatchers.[[setMain]](StandardTestDispatcher())
}

@Test
fun \`offline refresh shows a note\`() = [[runTest]] {
    // the fake with failRefresh = true, and the ViewModel, as before
    [[advanceUntilIdle]]()
    assertEquals("Offline: showing saved recipes", viewModel.uiState.value.note)
}`, why: '<code>setMain</code> replaces Main, <code>runTest</code> runs the body, and <code>advanceUntilIdle()</code> lets the queued refresh finish.' },
          { type: 'bug', prompt: 'The test doesn’t compile: <code>Unresolved reference \'advanceUntilIdle\'.</code> Tap the wrong line.', code: `@Test
fun \`offline refresh shows a note\`() = runBlocking {
    val repository = FakeRecipeRepository(listOf(soup))
    repository.failRefresh = true
    val quickLimit = QuickLimit()
    val viewModel = RecipesViewModel(repository, GetQuickRecipesUseCase(repository, quickLimit), quickLimit)
    advanceUntilIdle()
    assertEquals("Offline: showing saved recipes", viewModel.uiState.value.note)
}`, bug: 1, fix: 'fun `offline refresh shows a note`() = runTest {', why: '<code>advanceUntilIdle()</code> belongs to the test scope that <code>runTest</code> gives its body. <code>runBlocking</code> has no queue to advance.' },
        ],
        quiz: [
          { q: 'Why does building <code>RecipesViewModel</code> in a plain local test crash?', options: ['<code>viewModelScope</code> runs on <code>Dispatchers.Main</code>, and there is no Android main thread on your computer', 'The fake has no recipes', '<code>@Test</code> functions can’t create classes'], a: 0, why: 'The message says it too: for tests, use <code>Dispatchers.setMain</code> from kotlinx-coroutines-test.' },
          { q: 'With a <code>StandardTestDispatcher</code>, when does a coroutine started with <code>launch</code> run?', options: ['When the test lets it, for example with <code>advanceUntilIdle()</code>', 'At once, before <code>launch</code> returns', 'Never, in a test'], a: 0, why: 'It waits in a queue. That gives the test control over the order things happen in.' },
          { q: 'What happens to <code>delay(5000)</code> inside <code>runTest</code>?', options: ['It returns at once, and the virtual clock moves 5 seconds', 'The test waits 5 real seconds', 'It throws an exception'], a: 0, why: '<code>runTest</code> skips delays on its own clock, so tests of retries and timeouts stay fast.' },
        ],
        docs: [['Testing Kotlin coroutines on Android', 'https://developer.android.com/kotlin/coroutines/test']],
      },

      {
        id: 'flows',
        title: 'Testing flows',
        tagline: 'Read every value a flow sends, one at a time, with Turbine.',
        goals: ['Collect a flow in a test with Turbine’s <code>test { }</code>', 'Check each value in order with <code>awaitItem()</code>', 'Explain why a value left unread fails the test'],
        level: 'intermediate', introduces: ['awaitItem', 'cancelAndIgnoreRemainingEvents'],
        body: `
<p>In the fakes lesson, <code>GetQuickRecipesUseCaseTest</code> read the Tonight list with <code>.first()</code>: it took the first list and stopped listening. But the use case’s Flow keeps going. When Lin saves a new recipe, the table changes and Tonight should get a new list. <code>.first()</code> can’t check that second list, and <code>collect</code> never ends, so a test that calls it never finishes.</p>
<p><em>Turbine</em> is a small testing library for exactly this. <code>flow.test { }</code> starts collecting the flow and puts every value that arrives in a <em>queue</em>: a waiting line, first in, first out. Inside the block, <code>awaitItem()</code> takes the next value from the queue, so you can check the values one by one with <code>assertEquals</code>. If the queue is empty, <code>awaitItem()</code> waits for the next value. After 3 seconds with nothing, the test fails with <code>No value produced in 3s</code>.</p>
<p>When the block ends, Turbine stops collecting and checks that you read everything. A value still waiting in the queue fails the test with <code>Unconsumed events found</code> (Turbine calls the values <em>events</em>), so a surprise extra value can’t slip by. If you only care about the first values, end the block with <code>cancelAndIgnoreRemainingEvents()</code>. Write <code>test { }</code> inside <code>runTest</code>, as in the coroutines lesson. The Gradle line is at the top of the code below.</p>
<p>Until now each test class wrote its own <code>soup</code>, <code>pasta</code> and <code>stew</code>. From this lesson on, the tests share them: one file, <code>TestRecipes.kt</code>, in the test folder declares the three at the top level, outside any class, so every test in <code>src/test</code> can use them. The earlier classes can drop their own copies.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            varsTitle: 'Values',
            outTitle: 'Checks',
            code: `@Test
fun \`Tonight follows the table\`() = runTest {
    val repository = FakeRecipeRepository(listOf(soup, stew))
    val getQuickRecipes = GetQuickRecipesUseCase(repository, QuickLimit())

    getQuickRecipes().test {
        assertEquals(listOf(soup), awaitItem())
        repository.table.value = listOf(soup, pasta, stew)
        assertEquals(listOf(soup, pasta), awaitItem())
    }
}`,
            predict: {
              q: 'Suppose the second <code>awaitItem()</code> line were missing. The list with Lemon pasta is still in the queue when the block ends. What happens?',
              options: ['The test passes: nothing was wrong', 'The test fails: <code>Unconsumed events found</code>', 'The test waits forever'],
              a: 1,
              why: 'Turbine checks the queue when the block ends. A value nobody read means the flow sent something the test didn’t expect.',
            },
            frames: [
              { line: 3, vars: { table: '[Tomato soup, Bean stew]' }, say: 'The fake’s table starts with Tomato soup (15 min) and Bean stew (45 min).' },
              { line: 6, vars: { queue: '1 list: [Tomato soup]' }, say: '<code>test { }</code> starts collecting. The flow sends the quick list for the table right now, and it lands in the queue. Bean stew is too long for Tonight.' },
              { line: 7, vars: { queue: '(empty)' }, out: '✓ [Tomato soup]', say: '<code>awaitItem()</code> takes that list out of the queue, and <code>assertEquals</code> checks it.' },
              { line: 8, vars: { table: '[Tomato soup, Lemon pasta, Bean stew]', queue: '1 list: [Tomato soup, Lemon pasta]' }, say: 'Lin saves Lemon pasta. The table changes, the use case sends a new list, and Turbine puts it in the queue.' },
              { line: 9, vars: { queue: '(empty)' }, out: '✓ [Tomato soup, Lemon pasta]', say: 'The second <code>awaitItem()</code> takes the new list. Lemon pasta, exactly 20 minutes, made it in.' },
              { line: 10, out: 'Test passed', say: 'The block ends. The queue is empty, so Turbine stops collecting and the test passes.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
dependencies {
    testImplementation("app.cash.turbine:turbine:1.2.1")
}

// app/src/test/java/com/example/recipes/TestRecipes.kt: shared by the tests from here on
val soup = Recipe(1, "Tomato soup", 15, false)
val pasta = Recipe(2, "Lemon pasta", 20, false)     // exactly 20: the edge of the rule
val stew = Recipe(3, "Bean stew", 45, false)

// app/src/test/java/com/example/recipes/GetQuickRecipesUseCaseTest.kt
import app.cash.turbine.test          // the test { } function for flows

class GetQuickRecipesUseCaseTest {
    @Test
    fun \`Tonight follows the table\`() = runTest {
        val repository = FakeRecipeRepository(listOf(soup, stew))
        val getQuickRecipes = GetQuickRecipesUseCase(repository, QuickLimit())

        getQuickRecipes().test {
            assertEquals(listOf(soup), awaitItem())              // the list right now
            repository.table.value = listOf(soup, pasta, stew)   // Lin saves Lemon pasta
            assertEquals(listOf(soup, pasta), awaitItem())       // the new list
        }                                                        // queue empty: passes
    }
}`,
        remember: 'flow.test { } puts every value in a queue; awaitItem() takes the next one; a value left unread fails the test.',
        mistakes: [
          { title: 'Forgetting the value that is already there', bad: `getQuickRecipes().test {
    repository.table.value = listOf(soup, pasta, stew)
    assertEquals(listOf(soup, pasta), awaitItem())
}
// fails: the first item is the list from before the change, [Tomato soup]`, good: `getQuickRecipes().test {
    assertEquals(listOf(soup), awaitItem())      // the list right now comes first
    repository.table.value = listOf(soup, pasta, stew)
    assertEquals(listOf(soup, pasta), awaitItem())
}`, why: 'The table is a <code>MutableStateFlow</code>, which hands its current value to every new collector. So the first item in the queue is the list from before your change. Read it first.' },
        ],
        terms: [
          { term: 'Turbine', def: 'A small testing library that collects a Flow into a queue, so a test can check each value it sends, in order.' },
          { term: 'test { }', def: 'Turbine’s function on a Flow: <code>flow.test { }</code> collects the flow while the block runs, and fails if a value is left unread at the end.' },
          { term: 'awaitItem()', def: 'Takes the next value from Turbine’s queue, waiting for one if it is empty. Fails after 3 seconds with <code>No value produced in 3s</code>.' },
          { term: 'queue', def: 'A waiting line: values come out in the order they went in.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Collect the Tonight list with Turbine and check the first value.', code: `getQuickRecipes().[[test]] {
    assertEquals(listOf(soup), [[awaitItem]]())
}`, why: '<code>test { }</code> starts collecting into a queue, and <code>awaitItem()</code> takes the next value from it.' },
          { type: 'bug', prompt: 'This test fails with <code>No value produced in 3s</code>. Tap the line that’s wrong.', code: `@Test
fun \`Tonight follows the table\`() = runTest {
    val repository = FakeRecipeRepository(listOf(soup, stew))
    val getQuickRecipes = GetQuickRecipesUseCase(repository, QuickLimit())
    getQuickRecipes().test {
        assertEquals(listOf(soup), awaitItem())
        repository.table.value = listOf(soup, stew)
        assertEquals(listOf(soup, pasta), awaitItem())
    }
}`, bug: 6, fix: '        repository.table.value = listOf(soup, pasta, stew)', why: 'The new list is equal to the old one, and a <code>StateFlow</code> hands out nothing when the value stays the same. So no new value arrives, and the second <code>awaitItem()</code> gives up after 3 seconds. The test meant to add Lemon pasta.' },
        ],
        quiz: [
          { q: 'Inside <code>test { }</code>, you call <code>awaitItem()</code> and the flow sends nothing. What happens?', options: ['It returns <code>null</code>', 'After 3 seconds the test fails with <code>No value produced in 3s</code>', 'It waits forever'], a: 1, why: '<code>awaitItem()</code> waits, but not forever: after 3 seconds Turbine fails the test.' },
          { q: 'The block ends while one value is still in the queue. What happens?', options: ['The test passes', 'The test fails with <code>Unconsumed events found</code>', 'Turbine reads it for you'], a: 1, why: 'A value nobody read is a surprise. Read it, or end the block with <code>cancelAndIgnoreRemainingEvents()</code> if the rest doesn’t matter.' },
          { q: 'The fake’s table is a <code>MutableStateFlow</code> holding Tomato soup. What is the first item in the queue after <code>test {</code> starts?', options: ['The quick list for the table right now: <code>[Tomato soup]</code>', 'Nothing, until the table changes', 'An empty list'], a: 0, why: 'A <code>StateFlow</code> hands its current value to every new collector, so the first list arrives at once.' },
        ],
        docs: [['Turbine', 'https://github.com/cashapp/turbine']],
      },

      {
        id: 'robolectric',
        title: 'Robolectric',
        tagline: 'Run tests that need Android on your computer, with no phone.',
        goals: ['Explain why a local test can’t call Android code like <code>Uri.parse</code>', 'Run a test on a simulated Android with <code>@RunWith(RobolectricTestRunner::class)</code>', 'Read your app’s resources in a local test'],
        level: 'intermediate', introduces: ['RunWith', 'RobolectricTestRunner', 'RuntimeEnvironment', 'getApplication', 'testOptions', 'unitTests', 'isIncludeAndroidResources', 'lastPathSegment'],
        body: `
<p>Ada adds share links to the Recipes app: <code>https://example.com/recipes/2</code> opens Lemon pasta. The function that reads the id uses <code>Uri.parse</code>, from the intents lesson, and <code>lastPathSegment</code>, the part after the last <code>/</code>. Sam writes a local test for it in <code>src/test</code>, and it fails at once with <code>Method parse in android.net.Uri not mocked.</code> On the computer, a local test only gets an empty copy of Android. Every class and function is there, so the code compiles, but their insides were taken out, and calling one throws.</p>
<p><em>Robolectric</em> is a library that fills that copy in. It runs a simulated Android inside your local test, with a real <code>Uri</code>, resources, <code>Context</code> and Activities, still on the computer and with no phone. Mark the test class with <code>@RunWith(RobolectricTestRunner::class)</code>. <code>@RunWith</code> tells JUnit who runs the tests in the class, and <code>RobolectricTestRunner</code> starts the simulated Android first. <code>RuntimeEnvironment.getApplication()</code> gives a test the app’s <code>Context</code>, so <code>getString</code> and <code>getQuantityString</code> work too. One Gradle line, <code>isIncludeAndroidResources = true</code>, hands your app’s resources to the tests.</p>
<p>Starting the simulated Android takes a few seconds, once per run. The tests after it are fast. It is still not a real phone: how fast the app really runs, the system’s own screens and other apps need a test on a device. Use Robolectric for code that needs Android classes, and keep plain local tests for code that doesn’t: they start at once.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['Plain', 'Robo&shy;lectric', 'Phone'],
            span: 8,
            unit: 's',
            predict: {
              q: 'One Robolectric test takes about 3 seconds, most of it starting the simulated Android. About how long do 50 of them take in one run?',
              options: ['About 6 seconds', 'About 150 seconds (50 × 3)', 'As long as 50 tests on a phone'],
              a: 0,
              why: 'The simulated Android starts once per run. The other 49 tests reuse it and take a fraction of a second each.',
            },
            frames: [
              { now: 0, say: '<code>ShareLinksTest</code> calls <code>Uri.parse</code>. Run it three ways and watch the clock from the moment you start. The times are typical, not exact.' },
              { bars: [{ lane: 0, from: 0, to: 0.4, tone: 'err', label: '' }], say: 'As a plain local test it fails in a fraction of a second: <code>Method parse in android.net.Uri not mocked.</code> The empty copy of Android has nothing inside <code>parse</code>.' },
              { bars: [{ lane: 1, from: 0, to: 3, tone: 'warm', label: 'start Android' }], say: 'With <code>RobolectricTestRunner</code>, the run first starts a simulated Android inside the test. That takes a few seconds.' },
              { bars: [{ lane: 1, from: 3, to: 3.1, tone: 'ok', label: '' }], say: 'Then the test itself runs, with a real <code>Uri</code>, in a tenth of a second. It passes.' },
              { bars: [{ lane: 2, from: 0, to: 8, tone: 'warm', label: 'build, install: 30 s or more…' }], say: 'In <code>androidTest</code> on a phone, Gradle first builds and installs the app and its tests. The test starts after half a minute or more: far off the end of this chart.' },
              { bars: [{ lane: 1, from: 3.1, to: 6, tone: 'ok', label: '49 more' }], say: 'Now 50 Robolectric tests in one run: Android starts once, and the other 49 take a fraction of a second each.' },
              { say: 'Robolectric: Android classes in local tests, near local speed, no phone. For how the app behaves on real hardware, you still need the phone.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
android {
    testOptions {
        unitTests {
            isIncludeAndroidResources = true      // tests can read your strings
        }
    }
}
dependencies {
    testImplementation("org.robolectric:robolectric:4.17")
}

// app/src/main/java/com/example/recipes/ShareLinks.kt
fun recipeIdFrom(link: String): String? = Uri.parse(link).lastPathSegment

// app/src/test/java/com/example/recipes/ShareLinksTest.kt
@RunWith(RobolectricTestRunner::class)            // run on a simulated Android
class ShareLinksTest {
    @Test
    fun \`reads the id from a share link\`() {
        assertEquals("2", recipeIdFrom("https://example.com/recipes/2"))     // passes
    }

    @Test
    fun \`counts quick recipes in words\`() {
        val context: Context = RuntimeEnvironment.getApplication()
        val title = context.resources.getQuantityString(R.plurals.quick_recipes, 3, 3)
        assertEquals("3 quick recipes", title)                                 // passes
    }
}
// res/values/strings.xml:
// <plurals name="quick_recipes">
//     <item quantity="one">%d quick recipe</item>
//     <item quantity="other">%d quick recipes</item>
// </plurals>`,
        remember: 'Code that needs Android classes but no phone: @RunWith(RobolectricTestRunner::class) in src/test. Android starts once per run.',
        mistakes: [
          { title: 'Forgetting @RunWith', bad: `class ShareLinksTest {
    @Test
    fun \`reads the id from a share link\`() {
        assertEquals("2", recipeIdFrom("https://example.com/recipes/2"))
    }
}
// fails: Method parse in android.net.Uri not mocked.`, good: `@RunWith(RobolectricTestRunner::class)
class ShareLinksTest {
    @Test
    fun \`reads the id from a share link\`() {
        assertEquals("2", recipeIdFrom("https://example.com/recipes/2"))
    }
}`, why: 'Without <code>@RunWith</code>, JUnit runs the class as a plain local test, with the empty copy of Android. Robolectric only starts when its runner is named.' },
        ],
        terms: [
          { term: 'Robolectric', def: 'A library that runs a simulated Android inside local tests, so code that needs Android classes can be tested on the computer.' },
          { term: '@RunWith', def: 'Names who runs the tests in a class. <code>@RunWith(RobolectricTestRunner::class)</code> starts the simulated Android first.' },
          { term: 'RuntimeEnvironment.getApplication()', def: 'Gives a Robolectric test the app’s <code>Context</code>, for resources and other Android calls.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Run this test on Robolectric and get the app’s Context.', code: `@[[RunWith]](RobolectricTestRunner::class)
class ShareLinksTest {
    @Test
    fun \`counts quick recipes in words\`() {
        val context: Context = RuntimeEnvironment.[[getApplication]]()
        assertEquals("3 quick recipes", context.resources.getQuantityString(R.plurals.quick_recipes, 3, 3))
    }
}`, why: '<code>@RunWith</code> names Robolectric’s runner, and <code>RuntimeEnvironment.getApplication()</code> hands the test the app’s <code>Context</code>.' },
          { type: 'bug', prompt: 'The share-link test passes, but the plurals test fails with <code>Resources$NotFoundException</code>: Robolectric can’t see the app’s resources. Tap the line that’s wrong.', code: `android {
    testOptions {
        unitTests {
            isIncludeAndroidResources = false
        }
    }
}`, bug: 3, fix: '            isIncludeAndroidResources = true', why: 'Robolectric reads your app’s resources only if Gradle hands them to the tests, and this line is what does that.' },
        ],
        quiz: [
          { q: 'Why does a plain local test fail on <code>Uri.parse</code>?', options: ['The copy of Android in local tests has every function, but with nothing inside', 'Uri only works with an internet connection', 'Kotlin can’t compile Android code on a computer'], a: 0, why: 'The code compiles against that copy, but calling a function throws <code>not mocked</code>. Robolectric fills the copy in.' },
          { q: 'Why is the first Robolectric test in a run slower than the rest?', options: ['It starts the simulated Android, once per run', 'It installs the app on a phone', 'It downloads Android'], a: 0, why: 'Starting Android takes a few seconds. The tests after it reuse it.' },
          { q: 'Which of these still needs a test on a real phone?', options: ['How fast the app really starts', 'Reading a string resource', 'Parsing a share link with <code>Uri</code>'], a: 0, why: 'Robolectric simulates Android’s classes, not the phone’s real hardware and speed.' },
        ],
        docs: [['Robolectric: getting started', 'https://robolectric.org/getting-started/'], ['Build local unit tests', 'https://developer.android.com/training/testing/local-tests']],
      },

      {
        id: 'compose-ui',
        title: 'Compose UI tests',
        tagline: 'Find things on the screen by what they show, tap them, and check the result.',
        goals: ['Show a composable in a test with <code>createComposeRule()</code> and <code>setContent</code>', 'Find a node with <code>onNodeWithText</code> and tap it with <code>performClick()</code>', 'Check the screen with <code>assertIsDisplayed()</code>'],
        level: 'intermediate', introduces: ['Rule', 'createComposeRule', 'onNodeWithText', 'performClick', 'assertIsDisplayed', 'debugImplementation'],
        body: `
<p>Sam tidies up <code>RecipesContent</code> and, in the error look, writes <code>Button(onClick = {})</code> for Try again: the button does nothing. Every ViewModel test still passes, because none of them touches the screen. A <em>Compose UI test</em> shows a composable, taps it as a user would, and checks what it shows.</p>
<p>The test doesn’t look at pixels. Next to what it draws, Compose keeps a description of the screen: which texts are shown and which parts can be tapped. This is the <em>semantics tree</em> (a tree, because parts sit inside other parts, like a Button inside a Column), and apps that read the screen aloud use it too. Each part in it is a <em>node</em>. <code>onNodeWithText("Try again")</code> finds the one node that shows that text. A Button takes in the text inside it, so this finds the button itself. <code>performClick()</code> taps it, and <code>assertIsDisplayed()</code> checks that a node is on the screen.</p>
<p>The test gets a place to show composables from a <em>rule</em>: a helper that JUnit sets up before each test and cleans up after it. <code>@get:Rule val composeRule = createComposeRule()</code> makes one (<code>get:</code> puts the mark where JUnit looks for it). Import it from <code>junit4.v2</code>, the current version; the older one is deprecated. In <code>composeRule.setContent { }</code>, call <code>RecipesContent</code> with any state you like: no ViewModel, no database. The rule waits for the screen to settle before each step, so there is no waiting to write. The test runs on Robolectric in <code>src/test</code>, and the same code also runs on a phone in <code>androidTest</code>.</p>
<p>The Gradle lines are at the top of the code below. One of them is new: <code>debugImplementation</code> adds a library to the debug build only, the one tests and Run use; the release build that users get leaves it out. <code>ui-test-manifest</code> gives <code>setContent</code> an empty Activity to draw in.</p>`,
        visual(el) {
          const bar = '<div class="ui-m-bar">Recipes</div>';
          const mark = 'style="outline:2px solid var(--warm);outline-offset:2px;border-radius:6px"';
          const list = (m) => `${bar}<div class="ui-m-body"><span class="ui-m-btn">Refresh</span><div class="ui-m-row" ${m === 1 ? mark : ''}><div>Tomato soup · 15 min</div><span>☆</span></div><div class="ui-m-row"><div>Lemon pasta · 20 min</div><span>☆</span></div></div>`;
          const error = (m) => `${bar}<div class="ui-m-center"><span>Can’t load recipes. Check your connection.</span><span class="ui-m-btn try" ${m ? mark : ''}>Try again</span></div>`;
          Lab.ui.phone(el, {
            logTitle: 'Test',
            predict: {
              q: 'Both recipes on the screen show a ☆. What does <code>onNodeWithText("☆").performClick()</code> do?',
              options: ['Taps the first star', 'Taps both stars', 'Fails: a finder must find exactly one node, and it found two'],
              a: 2,
              why: 'An <code>onNodeWith…</code> finder expects exactly one match. None or two fails the test, so it never taps the wrong thing by luck.',
            },
            frames: [
              { screen: list(0), log: 'setContent { RecipesContent(…soup, pasta…) }', say: '<code>setContent</code> shows <code>RecipesContent</code> with a state the test picked: two recipes, not loading.' },
              { screen: list(1), log: 'onNodeWithText("Tomato soup · 15 min")', say: 'The finder looks through the semantics tree and finds exactly one node with that text.' },
              { log: '.assertIsDisplayed()  ✓', say: 'The node is on the screen, so the check passes.' },
              { screen: error(false), log: 'setContent { …note = "Offline: …" }', say: 'A second test starts fresh, with no recipes and a note: the error look.' },
              { screen: error(true), tap: '.try', log: 'onNodeWithText("Try again").performClick()', say: 'The Button took in its text, so the finder found the button itself. <code>performClick()</code> taps it.' },
              { log: 'assertEquals(1, refreshes)  ✓', say: 'The tap called <code>onRefresh</code> once. With Sam’s <code>onClick = {}</code>, <code>refreshes</code> would stay 0 and this test would fail.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
dependencies {
    testImplementation(platform("androidx.compose:compose-bom:2026.09.00"))
    testImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-test-manifest")   // a host for setContent
}

// app/src/test/java/com/example/recipes/RecipesContentTest.kt
import androidx.compose.ui.test.junit4.v2.createComposeRule

@RunWith(RobolectricTestRunner::class)
class RecipesContentTest {
    @get:Rule val composeRule = createComposeRule()

    @Test
    fun \`shows each recipe with its minutes\`() {
        composeRule.setContent {
            RecipesContent(RecipesUiState(isLoading = false, recipes = listOf(soup, pasta)), onRefresh = {}, onFavorite = {})
        }
        composeRule.onNodeWithText("Tomato soup · 15 min").assertIsDisplayed()
        composeRule.onNodeWithText("Lemon pasta · 20 min").assertIsDisplayed()
    }

    @Test
    fun \`Try again asks for a refresh\`() {
        var refreshes = 0
        composeRule.setContent {
            RecipesContent(RecipesUiState(isLoading = false, note = "Offline: showing saved recipes"), onRefresh = { refreshes += 1 }, onFavorite = {})
        }
        composeRule.onNodeWithText("Try again").performClick()
        assertEquals(1, refreshes)
    }
}`,
        remember: 'setContent shows it, onNodeWithText finds exactly one node, performClick taps it, assertIsDisplayed checks it.',
        mistakes: [
          { title: 'A finder that matches two nodes', bad: `var starred: Recipe? = null
composeRule.setContent {
    RecipesContent(RecipesUiState(isLoading = false, recipes = listOf(soup, pasta)), onRefresh = {}, onFavorite = { starred = it })
}
composeRule.onNodeWithText("☆").performClick()   // fails: two nodes show ☆`, good: `var starred: Recipe? = null
composeRule.setContent {
    RecipesContent(RecipesUiState(isLoading = false, recipes = listOf(soup)), onRefresh = {}, onFavorite = { starred = it })
}
composeRule.onNodeWithText("☆").performClick()   // one recipe, one star
assertEquals(soup, starred)`, why: 'A finder must find exactly one node, or the test fails and says how many it found. Pick a state where what you look for appears once.' },
        ],
        terms: [
          { term: 'semantics tree', def: 'Compose’s description of the screen: what each part shows and what can be tapped. Tests and screen readers read it.' },
          { term: 'node', def: 'One part in the semantics tree, like a Text or a Button. A finder such as <code>onNodeWithText</code> must find exactly one.' },
          { term: 'debugImplementation', def: 'Adds a library to the debug build only, inside <code>dependencies { }</code>. The release build, the one users get, leaves it out.' },
          { term: 'rule', def: 'A helper JUnit sets up before each test and cleans up after, marked <code>@get:Rule</code>. <code>createComposeRule()</code> gives a place to show composables.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Tap Try again and check that it asked for a refresh.', code: `composeRule.[[onNodeWithText]]("Try again").[[performClick]]()
assertEquals(1, refreshes)`, why: '<code>onNodeWithText</code> finds the button by its text, and <code>performClick()</code> taps it.' },
          { type: 'bug', prompt: '<code>RecipesContentTest</code> fails with <code>expected:&lt;1&gt; but was:&lt;0&gt;</code>. The test is right. Tap the line in the screen that’s wrong.', code: `if (state.recipes.isEmpty() && state.note != "") {
    Column {
        Text("Can’t load recipes. Check your connection.")
        Button(onClick = {}) { Text("Try again") }
    }
}`, bug: 3, fix: '        Button(onClick = onRefresh) { Text("Try again") }', why: 'The button was tapped, but its <code>onClick</code> did nothing. Passing <code>onRefresh</code> sends the tap up to the ViewModel again.' },
        ],
        quiz: [
          { q: 'What does a Compose UI test read to find a node?', options: ['The semantics tree: what each part shows and what can be tapped', 'The pixels on the screen', 'Your Kotlin source code'], a: 0, why: 'Compose keeps a description of the screen next to what it draws. Finders search that description.' },
          { q: 'No node shows the text “Pancakes”. What does <code>onNodeWithText("Pancakes").assertIsDisplayed()</code> do?', options: ['Fails: the finder found no node', 'Passes, because nothing is wrong', 'Waits until Pancakes appears'], a: 0, why: 'A finder must find exactly one node. None fails the test.' },
          { q: 'Why does <code>onNodeWithText("Try again")</code> find something you can tap?', options: ['The Button takes in the text inside it, so the node found is the button', 'Every Text can be tapped in tests', 'performClick taps whatever is nearest'], a: 0, why: 'In the semantics tree, the Button and its Text are one node, which can be tapped.' },
        ],
        docs: [['Test your Compose layout', 'https://developer.android.com/develop/ui/compose/testing'], ['Migrate to v2 testing APIs', 'https://developer.android.com/develop/ui/compose/testing/migrate-v2']],
      },

      {
        id: 'screenshots',
        title: 'Screenshot tests',
        tagline: 'Save a picture of the screen, and fail when it changes.',
        goals: ['Explain what a reference image is and why it goes into Git', 'Draw and save a composable with Roborazzi’s <code>captureRoboImage()</code>', 'Record and verify with Gradle, and decide what a failure means'],
        level: 'intermediate', introduces: ['GraphicsMode', 'NATIVE', 'onRoot', 'captureRoboImage', 'roborazzi', 'outputDir', 'recordRoborazziDebug', 'verifyRoborazziDebug'],
        body: `
<p>Lin makes the recipe titles bigger. Every test still passes: “Tomato soup · 15 min” is still on the screen, and Try again still asks for a refresh. But on a phone, the long titles now push the star out of the row. The tests from the last lesson check what is there and what it does, not how it looks.</p>
<p>A <em>screenshot test</em> draws a composable into a picture and compares it with a saved one, the <em>reference image</em>. There are two commands. <em>Record</em> draws every screenshot test and saves the pictures as references; you commit them with Git, next to the code. <em>Verify</em> draws them again and fails if a picture changed. It also saves a comparison image that shows the reference, the new picture and where they differ.</p>
<p><em>Roborazzi</em> is a library that does this on Robolectric, so it needs no phone. <code>@GraphicsMode(GraphicsMode.Mode.NATIVE)</code> on the class makes Robolectric really draw the pixels. In the test, <code>composeRule.onRoot()</code> is the whole content you set, and <code>captureRoboImage()</code> saves it when recording and compares it when verifying. The <code>roborazzi { }</code> block in Gradle puts the references in <code>src/screenshots</code>, because the <code>build</code> folder, where they would go otherwise, is never committed.</p>
<p>A failing screenshot test is not always a bug. If the change was on purpose, record again and commit the new pictures; whoever reviews the pull request sees the old and the new image. If it wasn’t, fix the code and verify again. Draw with fixed data, like <code>soup</code> and <code>pasta</code>, so the picture is the same on every run.</p>`,
        visual(el) {
          const bar = '<div class="ui-m-bar">Recipes</div>';
          const red = 'style="outline:2px solid var(--err);outline-offset:2px;border-radius:6px"';
          const row = (t, big, diff) => big
            ? `<div class="ui-m-row" ${diff ? red : ''}><div style="white-space:normal;font-size:1.15rem;font-weight:700">${t}</div></div>`
            : `<div class="ui-m-row"><div>${t}</div><span>☆</span></div>`;
          const shot = (big, diff) => `${bar}<div class="ui-m-body"><span class="ui-m-btn">Refresh</span>${row('Tomato soup · 15 min', big, diff)}${row('Lemon pasta · 20 min', big, diff)}${row('Bean stew · 45 min', big, diff)}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'What happens',
            predict: {
              q: 'Lin only changes the star’s color, from gold to grey. Which test notices?',
              options: ['<code>RecipesContentTest</code>, from the last lesson', 'The screenshot test', 'Neither'],
              a: 1,
              why: 'The star still shows ☆ and can still be tapped, so the behavior tests pass. Only a picture shows the new color.',
            },
            frames: [
              { screen: shot(false, false), log: '$ ./gradlew recordRoborazziDebug', say: 'Record: Roborazzi draws <code>RecipesContent</code> with soup, pasta and stew, and saves the picture in <code>src/screenshots</code>.' },
              { log: 'git commit: the reference image, with the code', say: 'The reference goes into Git, so everyone on the team compares against the same picture.' },
              { screen: shot(true, false), log: 'Lin: bigger titles', say: 'Lin makes the titles bigger. The stars are pushed out of the rows, and every behavior test still passes.' },
              { log: '$ ./gradlew verifyRoborazziDebug  ✗ failed', say: 'Verify draws the screen again and compares it with the reference. They differ, so the test fails.' },
              { screen: shot(true, true), log: 'comparison image: the rows changed', say: 'The comparison image shows where the pictures differ: every row.' },
              { screen: shot(false, false), log: 'not on purpose: fix the row, verify  ✓', say: 'The stars were meant to stay, so Lin fixes the row and verifies again. Had it been on purpose, she would record again and commit the new picture.' },
            ],
          });
        },
        code: `// build.gradle.kts of the project
plugins {
    id("io.github.takahirom.roborazzi") version "1.74.0" apply false
}
// app/build.gradle.kts
plugins {
    id("io.github.takahirom.roborazzi")
}
roborazzi {
    outputDir.set(file("src/screenshots"))          // reference images live here, in Git
}
dependencies {
    testImplementation("io.github.takahirom.roborazzi:roborazzi:1.74.0")
}

// app/src/test/java/com/example/recipes/RecipesScreenshotTest.kt
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)              // really draw the pixels
class RecipesScreenshotTest {
    @get:Rule val composeRule = createComposeRule()

    @Test
    fun \`recipes list\`() {
        composeRule.setContent {
            MaterialTheme {
                RecipesContent(RecipesUiState(isLoading = false, recipes = listOf(soup, pasta, stew)), onRefresh = {}, onFavorite = {})
            }
        }
        composeRule.onRoot().captureRoboImage()
    }
}

// ./gradlew recordRoborazziDebug     draws and saves the references: commit them
// ./gradlew verifyRoborazziDebug     draws again and fails if a picture changed`,
        remember: 'Record saves reference images to commit; verify fails when a picture changes. On purpose: record again. Not: fix the code.',
        mistakes: [
          { title: 'Recording over a real bug', bad: `./gradlew verifyRoborazziDebug     # fails
./gradlew recordRoborazziDebug     # "fixed": the new picture is the reference now`, good: `./gradlew verifyRoborazziDebug     # fails
# open the comparison image first:
# a change you meant: record again, and commit the new picture
# a change you didn't mean: fix the code, and verify again`, why: 'Recording makes whatever is drawn now the new truth. Look at the comparison image before you record, or a broken screen becomes the reference.' },
        ],
        terms: [
          { term: 'screenshot test', def: 'A test that draws a screen into a picture and fails when it differs from a saved one.' },
          { term: 'reference image', def: 'The saved picture a screenshot test compares against, committed with the code.' },
          { term: 'Roborazzi', def: 'A library for screenshot tests on Robolectric: <code>captureRoboImage()</code>, plus the Gradle tasks <code>recordRoborazziDebug</code> and <code>verifyRoborazziDebug</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make Robolectric really draw, and save the whole content as a picture.', code: `@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.[[NATIVE]])
class RecipesScreenshotTest {
    @get:Rule val composeRule = createComposeRule()

    @Test
    fun \`recipes list\`() {
        composeRule.setContent { RecipesContent(RecipesUiState(isLoading = false, recipes = listOf(soup)), onRefresh = {}, onFavorite = {}) }
        composeRule.onRoot().[[captureRoboImage]]()
    }
}`, why: '<code>NATIVE</code> makes Robolectric draw real pixels, and <code>captureRoboImage()</code> saves or compares the picture.' },
          { type: 'bug', prompt: 'Sam recorded and committed, but on Lin’s computer verify has nothing to compare with: the references never reached Git. Tap the line that’s wrong.', code: `roborazzi {
    outputDir.set(file("build/screenshots"))
}`, bug: 1, fix: '    outputDir.set(file("src/screenshots"))', why: 'The <code>build</code> folder is in <code>.gitignore</code>, so nothing saved there is committed. References belong next to the code.' },
        ],
        quiz: [
          { q: 'What does <code>./gradlew recordRoborazziDebug</code> do?', options: ['Draws every screenshot test and saves the pictures as references', 'Compares the screen with the references', 'Takes a picture of your real phone'], a: 0, why: 'Record writes the references. Verify is the one that compares.' },
          { q: 'Verify fails after a change you made on purpose. What next?', options: ['Record again and commit the new pictures', 'Delete the test', 'Run verify until it passes'], a: 0, why: 'The new picture becomes the reference, and reviewers see the change in the pull request.' },
          { q: 'Why does the class need <code>@GraphicsMode(GraphicsMode.Mode.NATIVE)</code>?', options: ['So Robolectric really draws the pixels', 'So the test runs on a phone', 'So the images go into Git'], a: 0, why: 'Without it, Robolectric doesn’t draw for real, and there is no true picture to compare.' },
        ],
        docs: [['Roborazzi', 'https://github.com/takahirom/roborazzi']],
      },

      {
        id: 'hilt-testing',
        title: 'Hilt in tests',
        tagline: 'Open the whole app in a test, with a fake where the real data would be.',
        goals: ['Swap a Hilt module for tests with <code>@TestInstallIn</code>', 'Open <code>MainActivity</code> in a test with <code>@HiltAndroidTest</code> and <code>HiltAndroidRule</code>', 'Order rules so Hilt is ready before the Activity starts'],
        level: 'intermediate', introduces: ['TestInstallIn', 'HiltAndroidTest', 'HiltAndroidRule', 'createAndroidComposeRule', 'Config', 'HiltTestApplication', 'kspTest'],
        body: `
<p>So far the tests built the ViewModel by hand, or showed <code>RecipesContent</code> with a made-up state. Ada wants one test that opens the whole app, <code>MainActivity</code>, as a user would. Hilt would then build the ViewModel, the use case and the screen, exactly as in the app. But it would also build <code>OfflineRecipeRepository</code>, with the real Room database and the real server: slow, and failing whenever the network does.</p>
<p>Hilt can swap one module just for tests. A test module marked <code>@TestInstallIn(components = [SingletonComponent::class], replaces = [RepositoryModule::class])</code> says: in every test in <code>src/test</code>, leave <code>RepositoryModule</code> out and use this one instead. Inside an annotation, <code>[ ]</code> writes a list. Its <code>@Provides</code> function hands out a <code>FakeRecipeRepository</code> holding Tomato soup and Lemon pasta (<code>soup</code> and <code>pasta</code> from <code>TestRecipes.kt</code>), and <code>@Singleton</code> keeps one for the whole test. Everything else is the app’s real code.</p>
<p>Mark the test class <code>@HiltAndroidTest</code>, so Hilt builds its components for the test, and give it <code>HiltAndroidRule(this)</code>. Then <code>createAndroidComposeRule&lt;MainActivity&gt;()</code> opens the real <code>MainActivity</code>. Hilt has to be ready before the Activity asks for its ViewModel, so number the rules: <code>@get:Rule(order = 0)</code> for Hilt, <code>order = 1</code> for Compose. On Robolectric, <code>@Config(application = HiltTestApplication::class)</code> runs the test in Hilt’s own test Application instead of <code>RecipesApp</code>. The Gradle lines are at the top of the code below.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'test', label: 'MainActivityTest<small>@HiltAndroidTest</small>', x: 75, y: 10, hidden: true, tone: 'warm' },
              { id: 'act', label: 'MainActivity', x: 25, y: 10 },
              { id: 'vm', label: 'RecipesViewModel', x: 25, y: 40 },
              { id: 'mod', label: 'RepositoryModule<small>@Binds</small>', x: 25, y: 65, tone: 'muted' },
              { id: 'real', label: 'Offline&shy;Recipe&shy;Repository<small>Room + server</small>', x: 25, y: 90 },
              { id: 'tmod', label: 'FakeRepositoryModule<small>@TestInstallIn</small>', x: 75, y: 65, hidden: true, tone: 'ok' },
              { id: 'fake', label: 'FakeRecipeRepository<small>soup, pasta</small>', x: 75, y: 90, hidden: true, tone: 'ok' },
            ],
            predict: {
              q: 'Without a test module, the test opens <code>MainActivity</code>. Which repository does <code>RecipesViewModel</code> get?',
              options: ['<code>OfflineRecipeRepository</code>, with the real Room and server', 'A fake, because it is a test', 'None: Hilt doesn’t work in tests'],
              a: 0,
              why: 'Hilt builds what the modules say, test or not. To get a fake in, the test has to swap the module.',
            },
            frames: [
              { add: [['act', 'vm', 'hiltViewModel()'], ['vm', 'mod', 'RecipeRepository'], ['mod', 'real']], say: 'In the app: <code>MainActivity</code> asks for the ViewModel, which asks for a <code>RecipeRepository</code>. <code>RepositoryModule</code> hands over <code>OfflineRecipeRepository</code>.' },
              { show: ['test'], add: [['test', 'act', '', 'warm']], hl: ['real'], say: 'A test opens <code>MainActivity</code>. Left like this, it would read the real database and call the real server.' },
              { hl: ['test'], say: '<code>@HiltAndroidTest</code> and <code>HiltAndroidRule</code>: Hilt builds its components for the test, in <code>HiltTestApplication</code>.' },
              { show: ['tmod'], gone: ['mod', 'real'], remove: [['vm', 'mod'], ['mod', 'real']], add: [['vm', 'tmod', 'RecipeRepository', 'ok']], say: '<code>@TestInstallIn(replaces = [RepositoryModule::class])</code>: in tests, Hilt leaves <code>RepositoryModule</code> out and reads <code>FakeRepositoryModule</code> instead.' },
              { show: ['fake'], add: [['tmod', 'fake', '', 'ok']], hl: ['fake'], say: 'Its <code>@Provides</code> function hands out a <code>FakeRecipeRepository</code> with Tomato soup and Lemon pasta.' },
              { hl: ['act', 'vm'], say: 'The screen shows “Tomato soup · 15 min” from the fake. The Activity, the ViewModel, the use case and the screen are all the app’s real code.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
dependencies {
    testImplementation("com.google.dagger:hilt-android-testing:2.60.1")
    kspTest("com.google.dagger:hilt-compiler:2.60.1")
}

// app/src/test/java/com/example/recipes/FakeRepositoryModule.kt
@Module
@TestInstallIn(components = [SingletonComponent::class], replaces = [RepositoryModule::class])
object FakeRepositoryModule {
    @Provides
    @Singleton
    fun provideRepository(): RecipeRepository = FakeRecipeRepository(listOf(soup, pasta))
}

// app/src/test/java/com/example/recipes/MainActivityTest.kt
import androidx.compose.ui.test.junit4.v2.createAndroidComposeRule

@HiltAndroidTest
@RunWith(RobolectricTestRunner::class)
@Config(application = HiltTestApplication::class)
class MainActivityTest {
    @get:Rule(order = 0) val hiltRule = HiltAndroidRule(this)                       // Hilt first
    @get:Rule(order = 1) val composeRule = createAndroidComposeRule<MainActivity>()  // then the Activity

    @Test
    fun \`opens with the recipes from the repository\`() {
        composeRule.onNodeWithText("Tomato soup · 15 min").assertIsDisplayed()
        composeRule.onNodeWithText("Lemon pasta · 20 min").assertIsDisplayed()
    }
}`,
        remember: '@TestInstallIn swaps a module in every test; @HiltAndroidTest with HiltAndroidRule at order = 0 opens the real app around the fake.',
        mistakes: [
          { title: 'Rules without an order', bad: `@get:Rule val hiltRule = HiltAndroidRule(this)
@get:Rule val composeRule = createAndroidComposeRule<MainActivity>()`, good: `@get:Rule(order = 0) val hiltRule = HiltAndroidRule(this)
@get:Rule(order = 1) val composeRule = createAndroidComposeRule<MainActivity>()`, why: 'Without <code>order</code>, JUnit may start the Compose rule first. It opens <code>MainActivity</code>, which asks Hilt for its ViewModel before Hilt is set up, and the test fails before it starts.' },
        ],
        terms: [
          { term: '@TestInstallIn', def: 'Marks a test module that replaces an app module in every test of that folder: <code>replaces = [RepositoryModule::class]</code>.' },
          { term: '@HiltAndroidTest', def: 'Marks a test class that uses Hilt, so Hilt builds its components for that test.' },
          { term: 'HiltAndroidRule', def: 'The rule that sets Hilt up for each test. It must run before any rule that opens an Activity.' },
          { term: 'HiltTestApplication', def: 'Hilt’s own Application for tests, used instead of the app’s <code>@HiltAndroidApp</code> class.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Replace the app’s repository module in every test.', code: `@Module
@[[TestInstallIn]](components = [SingletonComponent::class], [[replaces]] = [RepositoryModule::class])
object FakeRepositoryModule {
    @Provides
    @Singleton
    fun provideRepository(): RecipeRepository = FakeRecipeRepository(listOf(soup, pasta))
}`, why: '<code>@TestInstallIn</code> marks a module for tests, and <code>replaces</code> names the app module it takes the place of.' },
          { type: 'bug', prompt: 'Hilt refuses to build this test class. Tap the wrong line.', code: `@AndroidEntryPoint
@RunWith(RobolectricTestRunner::class)
@Config(application = HiltTestApplication::class)
class MainActivityTest {
    @get:Rule(order = 0) val hiltRule = HiltAndroidRule(this)
    @get:Rule(order = 1) val composeRule = createAndroidComposeRule<MainActivity>()
}`, bug: 0, fix: '@HiltAndroidTest', why: '<code>@AndroidEntryPoint</code> is for Android classes like an Activity. A test class that uses Hilt is marked <code>@HiltAndroidTest</code>.' },
        ],
        quiz: [
          { q: 'What does <code>@TestInstallIn(…, replaces = [RepositoryModule::class])</code> do?', options: ['In tests, Hilt uses this module instead of RepositoryModule', 'It deletes RepositoryModule from the app', 'It adds a second repository next to the real one'], a: 0, why: 'The app keeps its module. Only the tests in that folder get the replacement.' },
          { q: 'Why is <code>HiltAndroidRule</code> given <code>order = 0</code>?', options: ['Hilt must be ready before the Compose rule opens the Activity', 'Rules with a lower number run faster', 'Hilt only allows one rule'], a: 0, why: 'The Activity asks Hilt for its ViewModel as it opens, so Hilt has to be set up first.' },
          { q: 'In <code>MainActivityTest</code>, which part is not the app’s real code?', options: ['The repository', 'The ViewModel', 'The screen'], a: 0, why: 'Only the module, and with it the repository, was swapped. Everything above it is real, which is what makes this test worth having.' },
        ],
        docs: [['Hilt testing guide', 'https://developer.android.com/training/dependency-injection/hilt-testing']],
      },

      {
        id: 'baseline',
        title: 'Baseline Profiles',
        tagline: 'Make the first start fast, and measure it.',
        goals: ['Explain why an app starts slower right after it is installed', 'Generate a Baseline Profile with <code>BaselineProfileRule</code>', 'Measure startup with Macrobenchmark, with and without the profile'],
        level: 'intermediate', introduces: ['BaselineProfileRule', 'packageName', 'pressHome', 'startActivityAndWait', 'generateBaselineProfile', 'MacrobenchmarkRule', 'measureRepeated', 'metrics', 'StartupTimingMetric', 'iterations', 'startupMode', 'StartupMode', 'COLD', 'compilationMode', 'CompilationMode', 'None', 'Partial'],
        body: `
<p>Ada installs the Recipes app and opens it. The first start feels slow. A few days later, on the same phone, it opens noticeably faster, and nothing in the code changed. What changed is how the phone runs it.</p>
<p>The build turns your Kotlin into code for Android, and the phone still has to translate that into <em>machine code</em>: the instructions its own processor runs. Right after an install, most of the app is translated while it runs, which costs time. Later, while the phone is idle and charging, Android translates the parts used most, ahead of time. A <em>Baseline Profile</em> is a list of the code your start and first screens use, shipped inside the app. Android translates that code when it installs the app, so the first start is already fast. Google reports code running about 30% faster from the first launch.</p>
<p>You don’t write the list by hand. In Android Studio, File > New > New Module > Baseline Profile Generator adds a module with a test that uses <code>BaselineProfileRule</code>. Inside <code>collect</code>, <code>pressHome()</code> and <code>startActivityAndWait()</code> start the app, and you add what users do right after. <code>./gradlew :app:generateBaselineProfile</code> runs it on an emulator, or on a phone with Android 13 or newer, records which code ran, and saves the list in <code>app/src/release/generated/baselineProfiles/baseline-prof.txt</code>. Android uses it only in the release build, the version you publish, not in the debug one that Run installs.</p>
<p>To see the gain, the same module has a <em>Macrobenchmark</em>: a test that starts your app many times and times each start. <code>StartupMode.COLD</code> means the app wasn’t running at all, a <em>cold start</em>. <code>CompilationMode.None()</code> translates nothing ahead, <code>CompilationMode.Partial()</code> uses the profile. Compare the median of <code>timeToInitialDisplayMs</code>, the time until the first frame, on a real phone: emulator numbers don’t match what users get, and Macrobenchmark refuses to measure one.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['No profile', 'With profile'],
            span: 600,
            unit: 'ms',
            predict: {
              q: 'The app ships a Baseline Profile. When does Android translate the code on that list?',
              options: ['When it installs the app', 'Each time the app starts', 'Only after a few days, while charging'],
              a: 0,
              why: 'That is the point of the list: the code the first start needs is translated before the first start.',
            },
            frames: [
              { now: 0, say: 'Ada’s first cold start after installing, twice: once without a profile, once with one. The times are typical, not exact.' },
              { bars: [{ lane: 0, from: 0, to: 120, tone: 'muted', label: '' }], say: 'Android starts the app’s process. This part is the same either way.' },
              { bars: [{ lane: 0, from: 120, to: 560, tone: 'warm', label: 'translating' }], marks: [{ at: 560, label: '560', tone: 'warm' }], say: 'Without a profile, the start code is translated while it runs. The first frame appears at about 560 ms.' },
              { bars: [{ lane: 1, from: 0, to: 120, tone: 'muted', label: '' }, { lane: 1, from: 120, to: 420, tone: 'ok', label: 'machine code' }], marks: [{ at: 420, label: '420', tone: 'ok' }], say: 'With a profile, that code was translated at install, so it runs as machine code at once. The first frame appears at about 420 ms.' },
              { say: 'Macrobenchmark measures exactly this, ten cold starts each way, and reports the median <code>timeToInitialDisplayMs</code> for each.' },
              { say: 'Days later the first lane catches up, once Android has translated the busy code while charging. The profile gives every new user, and everyone after an update, that speed from the first start.' },
            ],
          });
        },
        code: `// The Baseline Profile Generator module adds this test and the Gradle lines
// (androidx.benchmark:benchmark-macro-junit4:1.5.0 in the module,
//  androidx.profileinstaller:profileinstaller:1.4.1 in the app).
class BaselineProfileGenerator {
    @get:Rule val rule = BaselineProfileRule()

    @Test
    fun generate() = rule.collect(packageName = "com.example.recipes") {
        pressHome()
        startActivityAndWait()           // a start, up to the first frame
        // then what users do next, like scrolling the list
    }
}
// ./gradlew :app:generateBaselineProfile
// saves app/src/release/generated/baselineProfiles/baseline-prof.txt

class StartupBenchmark {
    @get:Rule val rule = MacrobenchmarkRule()

    @Test
    fun startupWithoutProfile() = startup(CompilationMode.None())

    @Test
    fun startupWithProfile() = startup(CompilationMode.Partial())

    private fun startup(mode: CompilationMode) = rule.measureRepeated(
        packageName = "com.example.recipes",
        metrics = listOf(StartupTimingMetric()),
        iterations = 10,                       // ten starts each
        startupMode = StartupMode.COLD,        // the app wasn't running
        compilationMode = mode,
    ) {
        pressHome()
        startActivityAndWait()
    }
}
// Run it on a real phone. Studio shows min, median and max for each test.
// Compare the two medians of timeToInitialDisplayMs.`,
        remember: 'A Baseline Profile lists the start code so Android translates it at install; check the gain with a Macrobenchmark on a real phone.',
        mistakes: [
          { title: 'Timing the debug app by hand', bad: `// Press Run in Android Studio and count how long the start feels`, good: `// A Macrobenchmark on a real phone: 10 cold starts,
// CompilationMode.None() against CompilationMode.Partial(),
// then compare the two medians of timeToInitialDisplayMs`, why: 'Run installs a debug build, which runs slower and never uses the profile, and one start by feel says little. Many measured starts of a build like the one you publish do.' },
        ],
        terms: [
          { term: 'machine code', def: 'The instructions a phone’s processor runs. Android translates the app’s code into it, while running or ahead of time.' },
          { term: 'Baseline Profile', def: 'A list, shipped in the app, of the code its start and key screens use. Android translates that code at install.' },
          { term: 'Macrobenchmark', def: 'A test that runs your app many times on a phone and measures it, for example with <code>StartupTimingMetric</code>.' },
          { term: 'cold start', def: 'Opening an app that wasn’t running at all: <code>StartupMode.COLD</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Record which code a start uses.', code: `@Test
fun generate() = rule.[[collect]](packageName = "com.example.recipes") {
    pressHome()
    [[startActivityAndWait]]()
}`, why: '<code>collect</code> records the code that runs inside its block, and <code>startActivityAndWait()</code> starts the app up to its first frame.' },
          { type: 'bug', prompt: 'Both benchmarks report about the same median, even though the app ships a profile. Tap the wrong line.', code: `class StartupBenchmark {
    @get:Rule val rule = MacrobenchmarkRule()

    @Test
    fun startupWithoutProfile() = startup(CompilationMode.None())

    @Test
    fun startupWithProfile() = startup(CompilationMode.None())
}`, bug: 7, fix: '    fun startupWithProfile() = startup(CompilationMode.Partial())', why: '<code>None()</code> translates nothing ahead, so both tests measured the same thing. <code>Partial()</code> installs the profile first.' },
        ],
        quiz: [
          { q: 'What is in a Baseline Profile?', options: ['A list of the code the app’s start and key screens use', 'Pictures of the first screen', 'The user’s settings'], a: 0, why: 'It lists code, so Android knows what to translate into machine code at install.' },
          { q: 'Why does an app start faster a few days after it was installed, even without a profile?', options: ['Android translated the busy code ahead of time, while the phone was idle', 'The app downloaded an update', 'The phone got a faster processor'], a: 0, why: 'In the background Android translates the parts used most. A profile does that at install instead.' },
          { q: 'Where should you run the startup benchmark?', options: ['On a real phone', 'On an emulator', 'In Robolectric'], a: 0, why: 'Emulator numbers don’t match what users get, and Macrobenchmark refuses to measure one.' },
        ],
        docs: [['Baseline Profiles overview', 'https://developer.android.com/topic/performance/baselineprofiles/overview'], ['Write a Macrobenchmark', 'https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview']],
      },
    ],
  });
})();
