/* Backend basics track (optional). Same shape as tracks/kotlin.js.
   The other end of the wire: a small Recipes server in Ktor 3.6.0, every route under route("/v1") as in
   sysdesign.api (base URLs .../v1/; local flavor http://10.0.2.2:8080/v1/). It implements signup, login, refresh,
   recipes and logout with the data track's JSON keys (id, title, minutes, accessToken, refreshToken); explore and
   devices are left as an exercise (sysdesign.pagination, push). Routing, JSON with kotlinx.serialization, status codes,
   Exposed 1.6.0 with H2, Argon2id password hashes (Password4j 1.8.4, OWASP minimum settings), JWT, testApplication,
   a fat JAR or a container image, and finally the app's local flavor pointed at the laptop.
   Ktor, Exposed, Password4j and Gradle facts were checked against ktor.io, the Exposed docs, the Password4j source
   and OWASP in October 2026. Demos use the visual kit (Lab.ui) only. Any class added here must start with be-. */
(() => {
  const css = ``;

  Lab.addTrack({
    id: 'backend',
    title: 'Backend basics',
    description: 'Write the server your app talks to, in Kotlin: routes and handlers with Ktor, JSON and status codes, a database, safe password storage, sign-in with tokens, tests, deployment, and finally the Recipes app talking to your own server.',
    group: 'Beyond the app',
    requires: ['sysdesign', 'data'],
    css,
    lessons: [
      {
        id: 'what',
        title: 'What a backend does',
        tagline: 'Behind every app that shares data: a server program, its API and a database.',
        goals: ['Name the three parts of a backend: server program, API and database', 'Decide which work belongs on the server and which on the phone', 'Read the Recipes API as a list of endpoints'],
        level: 'beginner', introduces: [],
        body: `
<p>In the data track, Ada’s Recipes app asked <code>recipes.example.com</code> for her recipes and got them back as JSON. Since <a href="#sysdesign.api">Designing an API</a>, the base URL ends in <code>v1/</code>, so that request is <code>GET v1/recipes</code>. Someone wrote the program that answered. This track is about that other end of the wire, the <em>backend</em>, and you write it in Kotlin.</p>
<p>A backend has three parts. A <em>server program</em> runs all day on a computer on the internet and waits for requests. Its <em>API</em> (application programming interface) is the list of requests it answers. Each one is an <em>endpoint</em>: a method plus a path, such as <code>POST /v1/login</code>, <code>POST /v1/refresh</code> or <code>GET /v1/recipes</code>. On the server a path starts with <code>/</code>; in the app, Retrofit puts the base URL in front of <code>login</code>. Behind it, a <em>database</em> keeps the data of every user at once, the way Room keeps one phone’s.</p>
<p>What belongs on the server? Anything shared: Ada’s phone and tablet show the same recipes. Anything secret: the nutrition service key from the <a href="#security.secrets">secrets lesson</a> stays there. And every rule you must be able to trust. The phone is in the user’s hands, and a changed app can send anything, so the server checks every request again: is this token real, is this title not empty? Drawing the screen, and showing the saved copy while offline, stays on the phone.</p>
<p>The app’s <code>RecipeApi</code> interface is one half of a contract, and the server is the other half. Both must agree on each method, each path and the name of every JSON key. If the server renamed <code>minutes</code> to <code>time</code>, every installed app would fail to read the answer.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'app', label: 'Recipes app', sub: 'Ada’s new tablet' },
              { id: 'net', label: 'Internet' },
              { id: 'server', label: 'Server program', sub: 'recipes.example.com' },
              { id: 'db', label: 'Database', sub: 'every user’s recipes' },
            ],
            predict: {
              q: 'Ada’s tablet is brand new. Where do her 40 recipes come from?',
              options: ['The server’s database', 'Her phone, directly', 'The tablet’s own Room database'],
              a: 0,
              why: 'Room on the tablet starts empty. The recipes live in the server’s database, and any device Ada signs in on can ask for them.',
            },
            frames: [
              { at: 'app', packet: 'GET v1/recipes', say: 'Ada signs in on her new tablet. Recipes sends <code>GET v1/recipes</code> with her access token, as in the data track.' },
              { at: 'net', packet: 'GET v1/recipes', say: 'The request crosses the internet to <code>recipes.example.com</code>.' },
              { at: 'server', packet: 'token ✓', tone: 'ok', mark: { server: 'ok' }, say: 'The server program checks the token first, because a changed app could send anything. The token is real, and it is Ada’s.' },
              { at: 'db', packet: 'Ada’s rows', say: 'It asks the database for Ada’s recipes, and only hers. The same database holds Sam’s and Lin’s.' },
              { at: 'server', packet: '200 + JSON', say: 'The server turns the rows into JSON with the keys the app expects: <code>id</code>, <code>title</code>, <code>minutes</code>.' },
              { at: 'app', packet: '40 recipes', tone: 'ok', mark: { app: 'ok' }, say: 'The tablet reads the JSON into <code>RecipeDto</code> objects. Her 40 recipes appear, the same as on her phone.' },
            ],
          });
        },
        code: `// The Recipes API: what the server answers.
// Base URL https://recipes.example.com/v1/, as in Designing an API
//
//   POST /v1/login     body {"email":…,"password":…}    → {"accessToken":…,"refreshToken":…}
//   POST /v1/refresh   body {"refreshToken":…}           → a new pair of tokens
//   GET  /v1/recipes   header Authorization: Bearer …    → [{"id":1,"title":"Tomato soup","minutes":25}, …]

// The app's half, from the data track (Retrofit adds the base URL in front of each path):
interface RecipeApi {
    @POST("login")
    suspend fun login(@Body login: Login): Tokens

    @POST("refresh")
    suspend fun refresh(@Body request: RefreshRequest): Tokens

    @GET("recipes")
    suspend fun getRecipes(@Header("Authorization") auth: String): List<RecipeDto>
}
// The server must use the same methods, paths and JSON keys, or the app can't read its answers.`,
        remember: 'A backend is a server program, its API (the endpoints it answers) and a database; it checks every request again, because the app can be changed.',
        terms: [
          { term: 'backend', def: 'The server side of an app: a server program, the API it answers and the database behind it.' },
          { term: 'API', def: 'Application programming interface: the list of requests a server answers, with what each one takes and gives back.' },
          { term: 'endpoint', def: 'One request an API answers: a method plus a path, like <code>GET /v1/recipes</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'The server’s API lists <code>POST /v1/login</code> and <code>GET /v1/recipes</code>, and the base URL ends in <code>v1/</code>. Complete the app’s half.', code: `interface RecipeApi {
    @[[POST]]("login")
    suspend fun login(@Body login: Login): Tokens

    @GET("[[recipes]]")
    suspend fun getRecipes(@Header("Authorization") auth: String): List<RecipeDto>
}`, why: 'Each function names one endpoint: the method in the annotation, the path in quotes. Both must match the server’s API.' },
          { type: 'bug', prompt: 'The server’s API says <code>POST /v1/refresh</code>. Tap the line that doesn’t match it.', code: `interface RecipeApi {
    @GET("refresh")
    suspend fun refresh(@Body request: RefreshRequest): Tokens
}`, bug: 1, fix: '    @POST("refresh")', why: 'An endpoint is the method and the path together. <code>GET refresh</code> is a different endpoint, one the server doesn’t have.' },
        ],
        quiz: [
          { q: 'Which of these belongs on the server, not in the app?', options: ['Checking that a token is real before sending Ada’s recipes', 'Drawing the list of recipes', 'Showing saved recipes while offline'], a: 0, why: 'The app can be changed by whoever holds the phone, so checks you must trust run on the server. Drawing and offline copies stay on the phone.' },
          { q: 'What is an endpoint?', options: ['A method plus a path, like <code>GET /v1/recipes</code>', 'The last line of a server program', 'A table in the database'], a: 0, why: 'An API is a list of endpoints. Each one is a method and a path.' },
          { q: 'The app already refuses a recipe with an empty title. Must the server check it too?', options: ['Yes: a changed app can send anything', 'No: the app has checked it already', 'Only on the first request'], a: 0, why: 'The phone is in the user’s hands. The server can trust only the checks it runs itself.' },
        ],
        docs: [['Ktor documentation', 'https://ktor.io/docs/welcome.html']],
      },

      {
        id: 'http',
        title: 'HTTP on the server',
        tagline: 'A request comes in, a route matches it, a handler answers.',
        goals: ['Read an HTTP request and response as the text they really are', 'Explain what a route and a handler are', 'Write a tiny router in plain Kotlin'],
        level: 'beginner', introduces: [],
        body: `
<p>When Ada’s app calls <code>getRecipes()</code>, Retrofit sends a few lines of text. The server receives exactly that text, and it answers with text too. Everything a server does starts from these lines. (This is HTTP/1.1. Newer versions pack the same parts more tightly, but the parts stay the same.)</p>
<p>The first line of a request holds the method, the path and the HTTP version: <code>GET /v1/recipes HTTP/1.1</code>. The path is the base URL’s part, <code>/v1/</code>, plus Retrofit’s, <code>recipes</code>. Headers follow, one per line, like <code>Authorization: Bearer eyJhbGciOi…</code>. Then comes an empty line, then the body, if there is one: a <code>GET</code> has none, the <code>POST</code> to <code>login</code> carries JSON. The response looks the same. Its first line is the <em>status line</em>, <code>HTTP/1.1 200 OK</code>, then come headers such as <code>Content-Type: application/json</code>, which says what the body is, an empty line, and the body.</p>
<p>One server answers many different requests. A <em>route</em> is a rule that says “this method and this path go here”: <code>GET /v1/recipes</code> is one route, <code>POST /v1/login</code> another. (Not the navigation route from Compose: here it is a rule on the server.) The code that runs for a route is its <em>handler</em>: it reads the request and builds the response. When no route matches, the server answers <code>404 Not Found</code>.</p>
<p>Below is a tiny router in plain Kotlin: a map from “method path” to a lambda, the handler. To stay short, it leaves out the <code>/v1</code>. Server libraries do the same job, with much more care for the details.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `val routes = mapOf(
    "GET /recipes" to { "200 OK: Tomato soup, Lemon pasta" },
    "POST /login" to { "200 OK: here are your tokens" },
)

fun handle(method: String, path: String): String {
    val handler = routes["$method $path"]
    if (handler == null) {
        return "404 Not Found"
    }
    return handler()
}

fun main() {
    println(handle("GET", "/recipes"))
    println(handle("POST", "/login"))
    println(handle("GET", "/login"))
}`,
            predict: {
              q: 'The third call asks for <code>GET /login</code>. What does it print?',
              options: ['<code>404 Not Found</code>', '<code>200 OK: here are your tokens</code>', 'It crashes'],
              a: 0,
              why: 'A route is the method and the path together. There is a <code>POST /login</code> route, but no <code>GET /login</code>.',
            },
            frames: [
              { line: [1, 2, 3, 4], say: 'Two routes. Each key is a method and a path, and each value is a lambda: the handler that runs for it.' },
              { line: 7, vars: { method: '"GET"', path: '"/recipes"', handler: 'the GET /recipes lambda' }, say: 'The first request is <code>GET /recipes</code>. The router joins method and path into one key, <code>"GET /recipes"</code>, and looks it up.' },
              { line: 11, out: '200 OK: Tomato soup, Lemon pasta', say: 'A route matched, so its handler runs, and its answer goes back.' },
              { line: 7, vars: { method: '"POST"', path: '"/login"', handler: 'the POST /login lambda' }, say: 'Next, <code>POST /login</code>: the second route.' },
              { line: 11, out: '200 OK: here are your tokens', say: 'Its handler answers.' },
              { line: 7, vars: { method: '"GET"', path: '"/login"', handler: 'null' }, say: '<code>GET /login</code>: the map has no such key, so <code>handler</code> is <code>null</code>.' },
              { line: 9, out: '404 Not Found', say: 'No route, so no handler to run: the answer is 404. Real servers do the same for every path they don’t know.' },
            ],
          });
        },
        code: `// What reaches the server when the app calls getRecipes():
//   GET /v1/recipes HTTP/1.1
//   Host: recipes.example.com                // Host: which website this request is for
//   Authorization: Bearer eyJhbGciOi…
//
// What the server sends back:
//   HTTP/1.1 200 OK
//   Content-Type: application/json
//
//   [{"id":1,"title":"Tomato soup","minutes":25}]

// A tiny router: "method path" → handler (without the /v1, to stay short)
val routes = mapOf(
    "GET /recipes" to { "200 OK: Tomato soup, Lemon pasta" },
    "POST /login" to { "200 OK: here are your tokens" },
)

fun handle(method: String, path: String): String {
    val handler = routes["$method $path"]   // find the route
    if (handler == null) {
        return "404 Not Found"              // no route: nothing to run
    }
    return handler()                        // run the handler
}

// handle("GET", "/recipes")   gives  200 OK: Tomato soup, Lemon pasta
// handle("GET", "/login")     gives  404 Not Found`,
        play: `val routes = mapOf(
    "GET /recipes" to { "200 OK: Tomato soup, Lemon pasta" },
    "POST /login" to { "200 OK: here are your tokens" },
)

fun handle(method: String, path: String): String {
    val handler = routes["$method $path"]
    if (handler == null) {
        return "404 Not Found"
    }
    return handler()
}

fun main() {
    println(handle("GET", "/recipes"))
    println(handle("POST", "/login"))
    println(handle("GET", "/login"))
    println(handle("GET", "/cakes"))
    // Add a route "GET /health" that answers "200 OK", and call it here.
}`,
        remember: 'A route is a method plus a path; its handler reads the request and builds the response; no matching route means 404.',
        terms: [
          { term: 'route', def: 'A rule on the server that sends one method and path, like <code>GET /v1/recipes</code>, to one handler.' },
          { term: 'handler', def: 'The code that runs for a route: it reads the request and builds the response.' },
          { term: 'status line', def: 'The first line of a response: the HTTP version, the status code and its name, like <code>HTTP/1.1 200 OK</code>.' },
          { term: 'Content-Type', def: 'A header that says what the body is, like <code>application/json</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add the sign-in route, then look up the handler for a request.', code: `val routes = mapOf(
    "GET /recipes" to { "200 OK: Tomato soup" },
    "[[POST]] /login" to { "200 OK: here are your tokens" },
)

fun handle(method: String, path: String): String {
    val handler = [[routes]]["$method $path"]
    if (handler == null) {
        return "404 Not Found"
    }
    return handler()
}`, why: 'Signing in sends data, so it is a <code>POST</code>. The router finds the handler in the <code>routes</code> map by its key.' },
          { type: 'bug', prompt: 'Every request gets 404, even <code>GET /recipes</code>. Tap the wrong line.', code: `fun handle(method: String, path: String): String {
    val handler = routes["$path $method"]
    if (handler == null) {
        return "404 Not Found"
    }
    return handler()
}`, bug: 1, fix: '    val handler = routes["$method $path"]', why: 'The keys are written method first, like <code>"GET /recipes"</code>. <code>"/recipes GET"</code> is no key at all.' },
        ],
        quiz: [
          { q: 'What is on the first line of a request?', options: ['The method, the path and the HTTP version', 'The status code', 'The JSON body'], a: 0, why: 'For example <code>GET /v1/recipes HTTP/1.1</code>. Headers follow, then an empty line, then the body.' },
          { q: 'A response has the header <code>Content-Type: application/json</code>. What does it tell the app?', options: ['The body is JSON', 'The request was allowed', 'The server is written in Kotlin'], a: 0, why: '<code>Content-Type</code> says what kind of text the body is.' },
          { q: 'A request matches no route. What should the server answer?', options: ['<code>404 Not Found</code>', '<code>200 OK</code> with an empty body', 'Nothing: it ignores the request'], a: 0, why: 'With no route there is no handler to run. 404 tells the app the path doesn’t exist.' },
        ],
        docs: [['Routing (Ktor)', 'https://ktor.io/docs/server-routing.html']],
      },

      {
        id: 'ktor',
        title: 'A server in Kotlin',
        tagline: 'Ktor: a real server program in the language you already know.',
        goals: ['Set up a Ktor server project with Gradle', 'Answer GET /v1/recipes with JSON from a route', 'Run the server and call it with curl'],
        level: 'intermediate', introduces: ['embeddedServer', 'Netty', 'routing', 'route', 'call', 'respond', 'install', 'ContentNegotiation', 'curl'],
        body: `
<p>The toy router showed the idea. A real server also has to accept network connections, read the request text, handle many requests at the same moment and write correct answers. <b>Ktor</b> is a server library from JetBrains, the makers of Kotlin, that does all of that. You write the routes and handlers, in Kotlin, and each handler runs in a coroutine.</p>
<p>A Ktor server is a plain Kotlin program, not an Android app, built with Gradle. Its <code>build.gradle.kts</code> has the Kotlin plugin, the serialization plugin you know from navigation, and the Ktor plugin <code>io.ktor.plugin</code>, version 3.6.0, which picks the matching version of every Ktor library, so those need none. <code>mainClass</code> names the class that holds <code>fun main()</code>: Kotlin compiles the top-level functions of <code>Application.kt</code> into a class named <code>ApplicationKt</code>. <code>start.ktor.io</code>, Ktor’s project generator, makes such a project for you, ready to open in IntelliJ IDEA; choose <em>Configuration in: Code</em>, so it starts with <code>embeddedServer</code>, as here. In the imports, <code>*</code> brings in everything from a package.</p>
<p><code>embeddedServer(Netty, port = 8080) { ... }</code> makes the server. Netty is the <em>engine</em>: the part that talks to the network. The <em>port</em> is a number that tells apart the server programs on one computer; 8080 is a common one while you develop. The braces run <code>module()</code>, an extension function on Ktor’s <code>Application</code> where you set the server up, and <code>.start(wait = true)</code> starts it and keeps the program running. <code>install(ContentNegotiation) { json() }</code> adds a <em>plugin</em>, an add-on part of Ktor, that turns objects into JSON with kotlinx.serialization. <code>routing { get("/recipes") { ... } }</code> declares a route, and the braces after it are the handler. <code>route("/v1") { }</code> around it puts <code>/v1</code> in front of every route inside, as the API version from <a href="#sysdesign.api">Designing an API</a> asks, so this one answers <code>/v1/recipes</code>. Inside the handler, <code>call</code> holds the request and its response, and <code>call.respond(recipes)</code> sends the list as JSON, with status 200.</p>
<p><code>./gradlew run</code> starts the server, and its log says it is “Responding at <code>http://0.0.0.0:8080</code>”: <code>0.0.0.0</code> means it listens on every network of the laptop. Open <code>http://localhost:8080/v1/recipes</code> in a browser (<code>localhost</code> is the computer you are on), or use <b>curl</b>, a command-line tool that sends a request and prints the answer. With <code>-i</code>, curl also prints the status line and the headers.</p>`,
        visual(el) {
          Lab.ui.terminal(el, {
            predict: {
              q: 'The server has one route, <code>GET /v1/recipes</code>. curl asks for <code>/v1/cakes</code>. What comes back?',
              options: ['<code>404 Not Found</code>, sent by Ktor', 'An empty list', 'Nothing: the server crashes'],
              a: 0,
              why: 'No route matches, so none of your handlers runs. Ktor answers 404 by itself.',
            },
            frames: [
              { cmd: './gradlew run', out: '2026-10-22 09:14:03.512 [DefaultDispatcher-worker-1] INFO  io.ktor.server.Application - Responding at http://0.0.0.0:8080', say: 'Gradle builds the server and starts it. We cut Gradle’s lines and keep Ktor’s last one, as it looks with the <code>logback.xml</code> that start.ktor.io adds (not a recording): the server listens on port 8080. This terminal stays busy while the server runs.' },
              { clear: true, cmd: 'curl localhost:8080/v1/recipes', out: '[{"id":1,"title":"Tomato soup","minutes":25},{"id":2,"title":"Lemon pasta","minutes":15}]', say: 'In a second terminal, curl sends <code>GET /v1/recipes</code>. The route matched, and <code>call.respond</code> sent the list as JSON: the same text <code>RecipeDto</code> reads in the app. These answers are what this code sends.' },
              { cmd: 'curl -i localhost:8080/v1/recipes', out: 'HTTP/1.1 200 OK\n\n[{"id":1,"title":"Tomato soup","minutes":25},{"id":2,"title":"Lemon pasta","minutes":15}]', say: 'With <code>-i</code> you see the status line too. (We cut the header lines here and below.)' },
              { cmd: 'curl -i localhost:8080/v1/cakes', out: 'HTTP/1.1 404 Not Found', say: 'No route for <code>/v1/cakes</code>. Ktor answers 404 by itself, and none of your code runs.' },
              { cmd: 'curl localhost:8080/v1/recipes', out: 'curl: (7) Failed to connect to localhost port 8080 after 0 ms: Couldn\'t connect to server', say: 'In the first terminal, Ctrl+C stopped the server. Now nothing listens on port 8080, so curl can’t connect at all: no status code, no answer.' },
            ],
          });
        },
        code: `// build.gradle.kts of the server project
plugins {
    kotlin("jvm") version "2.4.21"
    kotlin("plugin.serialization") version "2.4.21"
    id("io.ktor.plugin") version "3.6.0"          // picks the version of every Ktor library below
}
application {
    mainClass = "com.example.ApplicationKt"       // Application.kt, which has fun main()
}
repositories {
    mavenCentral()
}
dependencies {
    implementation("io.ktor:ktor-server-core")
    implementation("io.ktor:ktor-server-netty")
    implementation("io.ktor:ktor-server-content-negotiation")
    implementation("io.ktor:ktor-serialization-kotlinx-json")
    implementation("ch.qos.logback:logback-classic:1.6.3")   // prints the server's log lines
}

// src/main/kotlin/com/example/Application.kt
package com.example

import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable

@Serializable
data class RecipeDto(val id: Int, val title: String, val minutes: Int)   // the same JSON keys as the app's

val recipes = listOf(RecipeDto(1, "Tomato soup", 25), RecipeDto(2, "Lemon pasta", 15))

fun main() {
    embeddedServer(Netty, port = 8080) {
        module()
    }.start(wait = true)
}

fun Application.module() {
    install(ContentNegotiation) {
        json()                                    // objects ↔ JSON, with kotlinx.serialization
    }
    routing {
        route("/v1") {                            // /v1 in front of every route inside
            get("/recipes") {                     // GET /v1/recipes
                call.respond(recipes)             // 200 and [{"id":1,"title":"Tomato soup","minutes":25},…]
            }
        }
    }
}`,
        remember: 'embeddedServer starts Ktor on a port; install adds plugins like ContentNegotiation; routing { route("/v1") { get(path) { call.respond(...) } } } answers a route.',
        terms: [
          { term: 'Ktor', def: 'A Kotlin library from JetBrains for writing servers (and HTTP clients). Handlers run in coroutines.' },
          { term: 'engine', def: 'The part of Ktor that talks to the network, such as Netty.' },
          { term: 'port', def: 'A number that tells apart the server programs on one computer. Here Ktor listens on 8080.' },
          { term: 'plugin (Ktor)', def: 'An add-on part of a Ktor server, added with <code>install</code>, like <code>ContentNegotiation</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Answer <code>GET /v1/recipes</code> with the list as JSON.', code: `fun Application.module() {
    [[install]](ContentNegotiation) {
        json()
    }
    routing {
        [[route]]("/v1") {
            [[get]]("/recipes") {
                call.[[respond]](recipes)
            }
        }
    }
}`, why: '<code>install</code> adds the JSON plugin, <code>route</code> puts <code>/v1</code> in front, <code>get</code> declares the route, and <code>call.respond</code> sends the answer.' },
          { type: 'bug', prompt: 'The app asks for <code>recipes</code>, but <code>curl -i localhost:8080/v1/recipes</code> shows <code>HTTP/1.1 404 Not Found</code>. Tap the wrong line.', code: `routing {
    route("/v1") {
        get("/recipe") {
            call.respond(recipes)
        }
    }
}`, bug: 2, fix: '        get("/recipes") {', why: 'The path must match exactly. <code>/v1/recipe</code> and <code>/v1/recipes</code> are two different routes, so <code>/v1/recipes</code> matched none.' },
        ],
        quiz: [
          { q: 'What does <code>install(ContentNegotiation) { json() }</code> add?', options: ['Turning objects into JSON, and JSON into objects', 'A database', 'Sign-in'], a: 0, why: 'It is the plugin that lets <code>call.respond</code> send objects as JSON, with kotlinx.serialization.' },
          { q: 'What does <code>call.respond(recipes)</code> send, when nothing else is said?', options: ['Status 200 and the list as JSON', 'Status 201 and nothing else', 'Only the status, no body'], a: 0, why: '200 OK is the default status, and the plugin writes the list as JSON.' },
          { q: 'In <code>embeddedServer(Netty, port = 8080)</code>, what is Netty?', options: ['The engine that talks to the network', 'The database', 'The JSON library'], a: 0, why: 'Ktor can run on several engines. Netty accepts the connections and hands each request to your routes.' },
        ],
        docs: [['Creating a server (Ktor)', 'https://ktor.io/docs/server-create-and-configure.html'], ['Content negotiation and serialization (Ktor)', 'https://ktor.io/docs/server-serialization.html']],
      },

      {
        id: 'rest',
        title: 'REST APIs',
        tagline: 'Paths name things, methods say what to do, status codes say how it went.',
        goals: ['Design endpoints with nouns in the paths and methods as the actions', 'Read a path parameter and the JSON body of a request', 'Answer with 201, 400 and 404 where they fit'],
        level: 'intermediate', introduces: ['post', 'parameters', 'HttpStatusCode', 'Created', 'BadRequest', 'NotFound', 'isBlank'],
        body: `
<p>Sam wants to add a recipe from the app, and to open one recipe by its number. You could invent a path for each action: <code>/getRecipe</code>, <code>/addRecipe</code>, <code>/deleteRecipe</code>. Every team would invent different names. <em>REST</em> is a widely used style that keeps APIs predictable: paths name things, methods say what to do.</p>
<p>Each thing the API offers is a <em>resource</em> with its own path: <code>/v1/recipes</code> is the list, <code>/v1/recipes/3</code> is recipe 3. The method is the verb: <code>GET</code> reads, <code>POST</code> adds to a list, <code>PUT</code> replaces one thing, <code>DELETE</code> removes it. In Ktor, <code>{id}</code> in a route matches any one part of the path, and <code>call.parameters["id"]</code> gives that part as text, which <code>toIntOrNull()</code> turns into a number. <code>post("/recipes")</code> handles a POST, and <code>call.receive&lt;NewRecipe&gt;()</code> reads the JSON body into an object, as <code>call.respond</code> writes one.</p>
<p>The status code tells the app how it went, before it reads the body. <code>HttpStatusCode.Created</code> (201) means “added”, sent with the new recipe and the id the server gave it: <code>call.respond(HttpStatusCode.Created, recipe)</code>. <code>BadRequest</code> (400) means the request itself is wrong, such as an empty title: <code>isBlank()</code> is true for text that is empty or only spaces. <code>NotFound</code> (404): no such recipe. In the app, 400 and 404 arrive as an <code>HttpException</code> with that <code>code()</code>, as in the <a href="#data.net">errors lesson</a>.</p>
<p>To send a POST with curl, <code>-X POST</code> sets the method, <code>-H "Content-Type: application/json"</code> adds the header that says the body is JSON, and <code>-d</code> gives the body, between single quotes (on Windows, use Git Bash or WSL for these commands). All these routes sit inside <code>route("/v1")</code>, as in the last lesson.</p>`,
        visual(el) {
          Lab.ui.terminal(el, {
            predict: {
              q: 'Sam asks for <code>GET /v1/recipes/9</code>, but there are only two recipes. What should the server answer?',
              options: ['<code>404 Not Found</code>', '<code>200 OK</code> with an empty body', '<code>400 Bad Request</code>'],
              a: 0,
              why: 'The request is fine, but the thing it names doesn’t exist: 404. A 400 would mean the request itself is wrong, like <code>/v1/recipes/abc</code>.',
            },
            frames: [
              { cmd: 'curl -i localhost:8080/v1/recipes/2', out: 'HTTP/1.1 200 OK\n\n{"id":2,"title":"Lemon pasta","minutes":15}', say: '<code>{id}</code> matched <code>2</code>. The handler found recipe 2 and sent it. (These answers are what this code sends; header lines are cut.)' },
              { cmd: 'curl -i localhost:8080/v1/recipes/9', out: 'HTTP/1.1 404 Not Found', say: 'The route matched, so this 404 comes from your handler: no recipe has id 9.' },
              { cmd: 'curl -i localhost:8080/v1/recipes/abc', out: 'HTTP/1.1 400 Bad Request', say: '<code>"abc".toIntOrNull()</code> is <code>null</code>. The request itself is wrong, so the handler answers 400.' },
              { cmd: `curl -i -X POST localhost:8080/v1/recipes -H "Content-Type: application/json" -d '{"title":"Bean stew","minutes":45}'`, out: 'HTTP/1.1 201 Created\n\n{"id":3,"title":"Bean stew","minutes":45}', say: 'A POST to the list adds to it. 201 Created, and the body is the new recipe with the id the server gave it.' },
              { cmd: `curl -i -X POST localhost:8080/v1/recipes -H "Content-Type: application/json" -d '{"title":"","minutes":10}'`, out: 'HTTP/1.1 400 Bad Request', say: 'An empty title: <code>isBlank()</code> is true, so the handler refuses it. The server checks, whatever the app did.' },
              { cmd: 'curl localhost:8080/v1/recipes', out: '[{"id":1,"title":"Tomato soup","minutes":25},{"id":2,"title":"Lemon pasta","minutes":15},{"id":3,"title":"Bean stew","minutes":45}]', say: 'The list now has three recipes. Only the valid POST changed anything.' },
            ],
          });
        },
        code: `// add to the imports: import io.ktor.http.*  and  import io.ktor.server.request.*
@Serializable
data class NewRecipe(val title: String, val minutes: Int)       // what the app sends: no id yet

val recipes = mutableListOf(RecipeDto(1, "Tomato soup", 25), RecipeDto(2, "Lemon pasta", 15))

fun Application.module() {
    install(ContentNegotiation) { json() }
    routing {
        route("/v1") {
            get("/recipes") {                                   // the list
                call.respond(recipes)
            }
            get("/recipes/{id}") {                              // one recipe: /v1/recipes/2
                val id = call.parameters["id"]?.toIntOrNull()
                val recipe = recipes.firstOrNull { it.id == id }
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest)     // /v1/recipes/abc
                } else if (recipe == null) {
                    call.respond(HttpStatusCode.NotFound)       // /v1/recipes/9
                } else {
                    call.respond(recipe)                        // 200
                }
            }
            post("/recipes") {                                  // add one to the list
                val input = call.receive<NewRecipe>()
                if (input.title.isBlank() || input.minutes <= 0) {
                    call.respond(HttpStatusCode.BadRequest)
                } else {
                    val recipe = RecipeDto(recipes.size + 1, input.title, input.minutes)
                    recipes.add(recipe)
                    call.respond(HttpStatusCode.Created, recipe) // 201 and the new recipe
                }
            }
        }
    }
}`,
        remember: 'Paths name resources (/v1/recipes, /v1/recipes/3), methods are the verbs, and the status says how it went: 201 added, 400 wrong request, 404 no such thing.',
        mistakes: [
          {
            title: 'Verbs in the paths',
            bad: `post("/addRecipe") { … }
get("/getRecipe/{id}") { … }`,
            good: `post("/recipes") { … }
get("/recipes/{id}") { … }`,
            why: 'The method already says what to do. With nouns in the paths, every resource gets the same predictable endpoints, and anyone can guess them.',
          },
        ],
        terms: [
          { term: 'REST', def: 'A common style for HTTP APIs: paths name resources, methods say what to do, status codes say how it went.' },
          { term: 'resource', def: 'A thing an API offers, with its own path: <code>/v1/recipes</code> (the list), <code>/v1/recipes/3</code> (one recipe).' },
          { term: 'path parameter', def: 'A part of the path that changes, like <code>{id}</code> in <code>/v1/recipes/{id}</code>. <code>call.parameters["id"]</code> reads it as text.' },
          { term: '201 Created', def: 'The status for “added”. The body holds the new thing, with its new id.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the recipe sent in the body, and answer “added”.', code: `post("/recipes") {
    val input = call.[[receive]]<NewRecipe>()
    val recipe = RecipeDto(recipes.size + 1, input.title, input.minutes)
    recipes.add(recipe)
    call.respond(HttpStatusCode.[[Created]], recipe)
}`, why: '<code>receive</code> reads the JSON body into a <code>NewRecipe</code>. <code>Created</code> is 201: the recipe was added.' },
          { type: 'bug', prompt: 'Sam opens recipe 9, which doesn’t exist. The app gets 200 with an empty body and shows a blank screen. Tap the wrong line.', code: `val recipe = recipes.firstOrNull { it.id == id }
if (recipe == null) {
    call.respond(HttpStatusCode.OK)
} else {
    call.respond(recipe)
}`, bug: 2, fix: '    call.respond(HttpStatusCode.NotFound)', why: 'With 200 the app thinks all went well. 404 tells it there is no such recipe, and it arrives in the app as an <code>HttpException</code> it can show.' },
        ],
        quiz: [
          { q: 'Which endpoint follows REST for “delete recipe 3”?', options: ['<code>DELETE /v1/recipes/3</code>', '<code>POST /v1/deleteRecipe</code>', '<code>GET /v1/recipes/3/delete</code>'], a: 0, why: 'The path names the resource, recipe 3, and the method says what to do with it.' },
          { q: 'The app sends a recipe with an empty title. Which status fits?', options: ['400 Bad Request', '404 Not Found', '201 Created'], a: 0, why: 'The request itself is wrong. 404 would mean the thing it names doesn’t exist.' },
          { q: 'In <code>get("/recipes/{id}")</code>, what is <code>call.parameters["id"]</code> for <code>/v1/recipes/7</code>?', options: ['The text <code>"7"</code>', 'The number 7', 'The recipe with id 7'], a: 0, why: 'Path parameters arrive as text. <code>toIntOrNull()</code> turns it into a number, or into null when it isn’t one.' },
        ],
        docs: [['How to create RESTful APIs with Ktor', 'https://ktor.io/docs/server-create-restful-apis.html'], ['Sending responses (Ktor)', 'https://ktor.io/docs/server-responses.html']],
      },

      {
        id: 'sql',
        title: 'Using a database',
        tagline: 'Keep the recipes in tables, and query them from Kotlin with Exposed.',
        goals: ['Explain why a server keeps its data in a database, not in a list', 'Define a table and read and add rows with Exposed', 'Run each database call in a transaction, on Dispatchers.IO'],
        level: 'intermediate', introduces: ['Table', 'integer', 'varchar', 'autoIncrement', 'primaryKey', 'connect', 'transaction', 'SchemaUtils', 'selectAll', 'where', 'eq', 'orderBy', 'deleteWhere'],
        body: `
<p>Restart the server from the last lesson, and Bean stew is gone: the list lived in memory, and memory is wiped when the program stops. Many requests also arrive at the same moment, and a plain list isn’t made to be changed from several places at once. A database keeps its rows on disk and is built for many users at once. You know one already: Room keeps a SQLite database on the phone.</p>
<p>Servers often use PostgreSQL. To start, H2 is easier: a small database written in Java that keeps everything in one file next to the server, <code>recipes.mv.db</code>. You talk to it through <b>Exposed</b>, JetBrains’ SQL library for Kotlin, which Ktor’s own guides use (version 1.6.0 here). <code>Database.connect("jdbc:h2:./recipes")</code> says which database: <code>jdbc</code> is how Java programs talk to databases, <code>h2</code> is the kind, <code>./recipes</code> the file. Moving to PostgreSQL later takes another address, a user name and password, and its driver library, not other code.</p>
<p>A table is an <code>object</code> that extends <code>Table</code>. Each column is a property: <code>integer("minutes")</code>, or <code>varchar("title", 100)</code> for text of at most 100 characters. <code>autoIncrement()</code> lets the database pick each new id, and <code>primaryKey</code> names the column that identifies a row, as <code>@PrimaryKey</code> does in Room. <code>SchemaUtils.create(RecipesTable)</code> makes the table if it isn’t there yet. Then Kotlin calls take the place of SQL: <code>selectAll().where { RecipesTable.owner eq owner }</code> is <code>SELECT … WHERE owner = …</code>, <code>orderBy</code> is <code>ORDER BY</code>, <code>insert { }</code> adds a row, and <code>row[RecipesTable.title]</code> reads one column of a result.</p>
<p>Each call runs inside <code>transaction { }</code>: a group of database steps that all happen, or none do. Without one, Exposed stops with <code>No transaction in context.</code> A transaction blocks its thread while it waits for the database, and Ktor runs handlers on a few shared threads, so wrap it in <code>withContext(Dispatchers.IO)</code>, as in the coroutines track, and make the function <code>suspend</code>. Each recipe also gets an <code>owner</code>: the email of the user it belongs to. The server can’t tell yet who is asking, so the handlers pass Ada’s email.</p>`,
        visual(el) {
          Lab.ui.terminal(el, {
            predict: {
              q: 'The table holds two of Ada’s recipes and one of Sam’s. What does <code>SELECT … WHERE owner = \'ada@example.com\'</code> return?',
              options: ['Ada’s two recipes', 'All three', 'Only the first row'],
              a: 0,
              why: '<code>WHERE</code> keeps only the rows that match. Sam’s row doesn’t.',
            },
            frames: [
              { cmd: `sqlite3 recipes.db "CREATE TABLE recipes (id INTEGER PRIMARY KEY, owner TEXT, title TEXT, minutes INTEGER);"`, say: 'Here is the kind of SQL Exposed writes for you, typed by hand into sqlite3, the same kind of database Room uses on the phone. First, a table. No output means it worked.' },
              { cmd: `sqlite3 recipes.db "INSERT INTO recipes (owner, title, minutes) VALUES ('ada@example.com', 'Tomato soup', 25), ('ada@example.com', 'Lemon pasta', 15), ('sam@example.com', 'Bean stew', 45);"`, say: 'Three rows: two of Ada’s recipes and one of Sam’s. The database picks each <code>id</code>.' },
              { cmd: `sqlite3 recipes.db "SELECT * FROM recipes;"`, out: '1|ada@example.com|Tomato soup|25\n2|ada@example.com|Lemon pasta|15\n3|sam@example.com|Bean stew|45', say: 'sqlite3 prints one row per line, the columns split by <code>|</code>.' },
              { cmd: `sqlite3 recipes.db "SELECT id, title, minutes FROM recipes WHERE owner = 'ada@example.com' ORDER BY minutes;"`, out: '2|Lemon pasta|15\n1|Tomato soup|25', say: '<code>WHERE</code> keeps only Ada’s rows, and <code>ORDER BY minutes</code> puts the quickest first. In Exposed: <code>selectAll().where { … }.orderBy(RecipesTable.minutes)</code>.' },
              { cmd: `sqlite3 recipes.db "SELECT title FROM recipes WHERE owner = 'lin@example.com';"`, say: 'Lin has no recipes yet: no rows, and no error. The handler would answer <code>[]</code>.' },
              { cmd: `sqlite3 recipes.db "SELECT * FROM recipe;"`, out: 'Error: in prepare, no such table: recipe', say: 'A typo in the table name fails only when the SQL runs. With Exposed, <code>RecipesTable</code> is Kotlin code, so the same typo is a compile error, before the server even starts.' },
            ],
          });
        },
        code: `// build.gradle.kts, in dependencies { }:
//     implementation("org.jetbrains.exposed:exposed-core:1.6.0")
//     implementation("org.jetbrains.exposed:exposed-jdbc:1.6.0")
//     implementation("com.h2database:h2:2.4.240")

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.v1.core.*
import org.jetbrains.exposed.v1.jdbc.*
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
// plus the Ktor imports from before

object RecipesTable : Table("recipes") {
    val id = integer("id").autoIncrement()
    val owner = varchar("owner", 100)                 // the user's email
    val title = varchar("title", 100)
    val minutes = integer("minutes")
    override val primaryKey = PrimaryKey(id)
}

suspend fun recipesOf(owner: String): List<RecipeDto> = withContext(Dispatchers.IO) {
    transaction {
        RecipesTable.selectAll()
            .where { RecipesTable.owner eq owner }    // WHERE owner = ...
            .orderBy(RecipesTable.minutes)            // ORDER BY minutes
            .map { row -> RecipeDto(row[RecipesTable.id], row[RecipesTable.title], row[RecipesTable.minutes]) }
    }
}

suspend fun addRecipe(owner: String, title: String, minutes: Int): RecipeDto = withContext(Dispatchers.IO) {
    transaction {
        val id = RecipesTable.insert { row ->
            row[RecipesTable.owner] = owner
            row[RecipesTable.title] = title
            row[RecipesTable.minutes] = minutes
        }[RecipesTable.id]                            // the id the database picked
        RecipeDto(id, title, minutes)
    }
}

fun Application.module(dbUrl: String) {              // main passes "jdbc:h2:./recipes"
    Database.connect(dbUrl)
    transaction {
        SchemaUtils.create(RecipesTable)              // only if it isn't there yet
    }
    install(ContentNegotiation) { json() }
    routing {
        route("/v1") {
            get("/recipes") {
                call.respond(recipesOf("ada@example.com"))
            }
            post("/recipes") {
                val input = call.receive<NewRecipe>()
                if (input.title.isBlank() || input.minutes <= 0) {
                    call.respond(HttpStatusCode.BadRequest)
                } else {
                    call.respond(HttpStatusCode.Created, addRecipe("ada@example.com", input.title, input.minutes))
                }
            }
        }
    }
}`,
        remember: 'A table is an object that extends Table; selectAll().where { } reads, insert { } adds; every call runs in transaction { }, inside withContext(Dispatchers.IO).',
        mistakes: [
          {
            title: 'Gluing a value into SQL text',
            bad: `transaction {
    exec("DELETE FROM recipes WHERE owner = '$owner'")
}
// owner = "x' OR '1'='1" deletes every row`,
            good: `transaction {
    RecipesTable.deleteWhere { RecipesTable.owner eq owner }
}`,
            why: 'Text glued into SQL can change the SQL itself. This is called <em>SQL injection</em>. Exposed sends the value apart from the SQL, so it is only ever a value.',
          },
        ],
        terms: [
          { term: 'Exposed', def: 'JetBrains’ SQL library for Kotlin: tables are Kotlin objects, and queries are Kotlin calls.' },
          { term: 'transaction', def: 'A group of database steps that all happen, or none do. In Exposed every query runs inside <code>transaction { }</code>.' },
          { term: 'JDBC URL', def: 'The address of a database for a Java or Kotlin program, like <code>jdbc:h2:./recipes</code>: the kind of database and where it is.' },
          { term: 'SQL injection', def: 'An attack where text glued into SQL changes the SQL itself. Sending values apart from the SQL prevents it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read Ada’s recipes, quickest first.', code: `transaction {
    RecipesTable.[[selectAll]]()
        .where { RecipesTable.owner [[eq]] owner }
        .[[orderBy]](RecipesTable.minutes)
        .map { row -> RecipeDto(row[RecipesTable.id], row[RecipesTable.title], row[RecipesTable.minutes]) }
}`, why: '<code>selectAll</code> starts the query, <code>where</code> with <code>eq</code> keeps the matching rows, and <code>orderBy</code> sorts them.' },
          { type: 'bug', prompt: '<code>recipesOf("sam@example.com")</code> returns Ada’s recipes too. Tap the wrong line.', code: `suspend fun recipesOf(owner: String): List<RecipeDto> = withContext(Dispatchers.IO) {
    transaction {
        RecipesTable.selectAll()
            .orderBy(RecipesTable.minutes)
            .map { row -> RecipeDto(row[RecipesTable.id], row[RecipesTable.title], row[RecipesTable.minutes]) }
    }
}`, bug: 2, fix: '        RecipesTable.selectAll().where { RecipesTable.owner eq owner }', why: 'Without <code>where</code>, the query returns every row of the table. The filter belongs in the query, so the database sends only the rows you need.' },
        ],
        quiz: [
          { q: 'You restart the server. Where are the recipes now?', options: ['In the database file, <code>recipes.mv.db</code>, as before', 'Gone, as with the list', 'On Ada’s phone'], a: 0, why: 'The database keeps its rows on disk, so a restart loses nothing.' },
          { q: 'Why run a transaction inside <code>withContext(Dispatchers.IO)</code>?', options: ['It blocks its thread while it waits for the database', 'It makes the SQL shorter', 'Exposed only works on the main thread'], a: 0, why: 'Ktor runs handlers on a few shared threads. Dispatchers.IO has threads meant for waiting, so the others stay free for new requests.' },
          { q: 'A query has a typo: <code>RecipesTabel</code>. When do you find out?', options: ['When the code compiles', 'When a request runs that query', 'Never: the query returns no rows'], a: 0, why: 'In Exposed the table is a Kotlin object, so a wrong name is a compile error.' },
        ],
        docs: [['Database persistence with Exposed (Ktor)', 'https://ktor.io/docs/server-integrate-database.html'], ['Get started with Exposed', 'https://www.jetbrains.com/help/exposed/get-started-with-exposed.html']],
      },

      {
        id: 'passwords',
        title: 'Storing passwords',
        tagline: 'Sign-up and sign-in on the server: keep a hash, never the password.',
        goals: ['Explain why a server stores a password hash, never the password', 'Hash and check passwords with Argon2id', 'Answer sign-up with 201 or 409, and a wrong password with 401'],
        level: 'intermediate', introduces: ['Password', 'Argon2Function', 'Argon2', 'addRandomSalt', 'Conflict', 'Unauthorized'],
        body: `
<p>Right now anyone can read every recipe on the server. The app from the <a href="#data.auth">sign-in lesson</a> already does its half: it sends <code>POST login</code> with Ada’s email and password, once. The server’s first job is to know its users: who has an account, and whether a password is right.</p>
<p>Never store a password, not even in your own database. Databases leak, and people reuse passwords, so one leak would open their accounts on other sites too. Store a <em>hash</em> instead: a scrambled form that can’t be turned back into the password. To check a password at sign-in, the server scrambles it the same way and compares. Today OWASP, a security group whose guides many teams follow, recommends <em>Argon2id</em>: it is slow on purpose and uses lots of memory, so guessing passwords from a leak is expensive. Each hash also gets a <em>salt</em>, random bytes mixed in, so two users with the same password get different hashes. Many older servers use bcrypt, an older hash that is still accepted where Argon2id isn’t available.</p>
<p>The Password4j library does both steps. <code>Argon2Function.getInstance(19456, 2, 1, 32, Argon2.ID)</code> picks the settings OWASP gives as the minimum: 19,456 KiB (19 MiB) of memory, 2 passes and 1 thread, plus a 32-byte result. Pass them yourself, because the library’s own default uses less memory. <code>Password.hash(password).addRandomSalt(16).with(argon2).result</code> gives the hash as text. It starts with <code>$argon2id$v=19$m=19456,t=2,p=1$</code>: the settings and the salt are stored in it. <code>Password.check(password, hash).with(argon2)</code> is <code>true</code> when the password is right.</p>
<p>Recipes has no sign-up screen, so <code>POST /v1/signup</code> lets you add accounts by hand. The users table has the email as its primary key, so two accounts can’t share one. When the email is taken, the server answers <code>HttpStatusCode.Conflict</code>, 409, the status you met in <a href="#sysdesign.offline">Sync and conflicts</a>. At <code>/v1/login</code>, a wrong password gets <code>Unauthorized</code>, 401.</p>`,
        visual(el) {
          Lab.ui.terminal(el, {
            predict: {
              q: 'Ada has an account. Someone sends <code>POST /v1/signup</code> with her email again. What does the server answer?',
              options: ['<code>409 Conflict</code>', '<code>201 Created</code>: a second Ada', '<code>404 Not Found</code>'],
              a: 0,
              why: 'The email is the primary key of the users table, so <code>addUser</code> finds it taken and the handler answers 409.',
            },
            frames: [
              { cmd: `curl -i -X POST localhost:8080/v1/signup -H "Content-Type: application/json" -d '{"email":"ada@example.com","password":"lemon-pasta-15"}'`, out: 'HTTP/1.1 201 Created', say: 'The server hashes Ada’s password with Argon2id and saves her email with the hash. These answers are what this code sends; header lines are cut.' },
              { cmd: `curl -i -X POST localhost:8080/v1/signup -H "Content-Type: application/json" -d '{"email":"ada@example.com","password":"another-one"}'`, out: 'HTTP/1.1 409 Conflict', say: 'The same email again. The users table already has it, so <code>addUser</code> returns <code>false</code> and the handler answers 409.' },
              { cmd: `curl -i -X POST localhost:8080/v1/login -H "Content-Type: application/json" -d '{"email":"ada@example.com","password":"lemon-pie"}'`, out: 'HTTP/1.1 401 Unauthorized', say: '<code>Password.check</code> scrambles the guess with the salt and settings stored in Ada’s hash. The result doesn’t match: 401.' },
              { cmd: `curl -i -X POST localhost:8080/v1/login -H "Content-Type: application/json" -d '{"email":"lin@example.com","password":"lemon-pie"}'`, out: 'HTTP/1.1 401 Unauthorized', say: 'Lin has no account. She gets the same 401, so nobody can find out from the answer which emails have accounts.' },
              { cmd: `curl -i -X POST localhost:8080/v1/login -H "Content-Type: application/json" -d '{"email":"ada@example.com","password":"lemon-pasta-15"}'`, out: 'HTTP/1.1 200 OK', say: 'The right password: 200. For now the answer is empty. The tokens the app needs go in it in the next lesson.' },
            ],
          });
        },
        code: `// build.gradle.kts, in dependencies { }:
//     implementation("com.password4j:password4j:1.8.4")

import com.password4j.Argon2Function
import com.password4j.Password
import com.password4j.types.Argon2
// plus the Ktor, Exposed and coroutines imports from before

@Serializable
data class Login(val email: String, val password: String)    // the app's JSON, from the sign-in lesson

object UsersTable : Table("users") {
    val email = varchar("email", 100)
    val passwordHash = varchar("password_hash", 200)          // never the password itself
    override val primaryKey = PrimaryKey(email)               // one account per email
}

// OWASP's minimum for Argon2id: 19 MiB of memory, 2 passes, 1 thread; a 32-byte hash
val argon2 = Argon2Function.getInstance(19456, 2, 1, 32, Argon2.ID)

fun hashPassword(password: String): String =
    Password.hash(password).addRandomSalt(16).with(argon2).result   // "$argon2id$v=19$m=19456,t=2,p=1$…"

suspend fun addUser(email: String, password: String): Boolean = withContext(Dispatchers.IO) {
    transaction {
        val taken = UsersTable.selectAll().where { UsersTable.email eq email }.firstOrNull() != null
        if (taken) {
            false                                             // the email already has an account
        } else {
            UsersTable.insert { row ->
                row[UsersTable.email] = email
                row[UsersTable.passwordHash] = hashPassword(password)
            }
            true
        }
    }
}

suspend fun passwordMatches(login: Login): Boolean = withContext(Dispatchers.IO) {
    transaction {
        val user = UsersTable.selectAll().where { UsersTable.email eq login.email }.firstOrNull()
        user != null && Password.check(login.password, user[UsersTable.passwordHash]).with(argon2)
    }
}

fun Application.module(dbUrl: String) {
    // Database.connect and ContentNegotiation as before; SchemaUtils.create(RecipesTable, UsersTable)
    routing {
        route("/v1") {
            post("/signup") {
                val login = call.receive<Login>()
                if (addUser(login.email, login.password)) {
                    call.respond(HttpStatusCode.Created)      // 201: account added
                } else {
                    call.respond(HttpStatusCode.Conflict)     // 409: the email is taken
                }
            }
            post("/login") {
                if (passwordMatches(call.receive<Login>())) {
                    call.respond(HttpStatusCode.OK)           // the tokens go here in the next lesson
                } else {
                    call.respond(HttpStatusCode.Unauthorized) // 401: wrong email or password
                }
            }
            // get("/recipes") and post("/recipes") as before
        }
    }
}`,
        remember: 'Store an Argon2id hash with its own salt, never the password; Password.check compares at sign-in; a taken email gets 409, a wrong password 401.',
        mistakes: [
          {
            title: 'Saving the password itself',
            bad: `row[UsersTable.password] = password`,
            good: `row[UsersTable.passwordHash] = hashPassword(password)`,
            why: 'Databases leak. With plain passwords, every account is open at once, on every site where people reused them. A slow, salted hash makes each guess expensive.',
          },
        ],
        terms: [
          { term: 'hash', def: 'A scrambled form of a password that can’t be turned back. To check a password, <code>Password.check</code> scrambles it the same way and compares.' },
          { term: 'salt', def: 'Random bytes mixed into each hash, so the same password gives a different hash for every user.' },
          { term: 'Argon2id', def: 'The password hash OWASP recommends today: slow and memory-hungry on purpose, so guessing from a leak is expensive.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Hash a new password, and check one at sign-in.', code: `fun hashPassword(password: String): String =
    Password.[[hash]](password).addRandomSalt(16).with(argon2).result

fun passwordOk(password: String, hash: String): Boolean =
    Password.[[check]](password, hash).with([[argon2]])`, why: '<code>hash</code> makes the stored text, <code>check</code> compares a password with it. Both use the same Argon2id settings.' },
          { type: 'bug', prompt: 'Ada signs up a second time with the same email. curl shows <code>HTTP/1.1 201 Created</code>, but no account was added. Tap the wrong line.', code: `post("/signup") {
    val login = call.receive<Login>()
    if (addUser(login.email, login.password)) {
        call.respond(HttpStatusCode.Created)
    } else {
        call.respond(HttpStatusCode.Created)
    }
}`, bug: 5, fix: '        call.respond(HttpStatusCode.Conflict)', why: '<code>addUser</code> returned <code>false</code>: the email is taken. 409 Conflict says so; 201 claims an account was added.' },
        ],
        quiz: [
          { q: 'Why store a hash and not the password?', options: ['A leak then doesn’t reveal passwords that people reuse on other sites', 'A hash takes less space', 'The server can turn the hash back when Ada forgets her password'], a: 0, why: 'A hash can’t be turned back. The server only ever compares.' },
          { q: 'Why is Argon2id slow and memory-hungry on purpose?', options: ['Every guess against a leaked hash becomes expensive', 'So sign-in waits for the database', 'So the hash fits in a JWT'], a: 0, why: 'One sign-in takes a moment. Millions of guesses take far too long.' },
          { q: 'Sam and Lin both choose the password <code>lemon-pasta-15</code>. Are their hashes the same?', options: ['No: each hash gets its own random salt', 'Yes: the same password gives the same hash', 'Only if they sign up on the same day'], a: 0, why: '<code>addRandomSalt(16)</code> mixes new random bytes into every hash, so a leak doesn’t show who shares a password.' },
        ],
        docs: [['Password Storage Cheat Sheet (OWASP)', 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'], ['Argon2 (Password4j)', 'https://github.com/Password4j/password4j/wiki/Argon2']],
      },

      {
        id: 'tokens',
        title: 'Tokens',
        tagline: 'Hand out tokens at sign-in, and check one on every request.',
        goals: ['Make and check JWT access tokens with Ktor’s Authentication plugin', 'Answer refresh with a new pair, using each refresh token only once', 'Sign a user out by deleting their refresh tokens'],
        level: 'intermediate', introduces: ['Authentication', 'jwt', 'JWT', 'Algorithm', 'HMAC256', 'withIssuer', 'withClaim', 'withExpiresAt', 'sign', 'verifier', 'validate', 'JWTPrincipal', 'principal', 'getClaim', 'asString', 'UUID', 'randomUUID', 'Date', 'getenv', 'NoContent'],
        body: `
<p>Ada’s password is right. Sending it with every request would put it at risk again and again, so, as the <a href="#data.auth">sign-in lesson</a> showed from the app’s side, the server hands out two tokens instead. The <em>access token</em> goes in <code>Authorization: Bearer …</code> on every request and works for 15 minutes. The <em>refresh token</em> gets a new pair when the access token has expired.</p>
<p>The access token is a <em>JWT</em> (JSON Web Token): a little JSON with <em>claims</em>, such as the email and the moment it expires, plus a signature made with a secret only the server knows. Anyone can read a JWT, but nobody can change it: the signature would no longer match. <code>JWT.create()</code> builds one, <code>withClaim</code> adds a claim, and <code>sign(Algorithm.HMAC256(secret))</code> signs it. <code>Date(...)</code> is a moment in time, here now plus 15 minutes in milliseconds. <code>JWT</code> and <code>Algorithm</code> come with the <code>ktor-server-auth-jwt</code> library.</p>
<p><code>install(Authentication) { jwt("auth-jwt") { ... } }</code> checks the tokens: <code>verifier</code> checks the signature, the issuer (who made the token) and the expiry, and <code>validate</code> turns a good token into a <code>JWTPrincipal</code>, which the handler gets from <code>call.principal</code>. Routes inside <code>authenticate("auth-jwt") { }</code> run only with a good token. Otherwise Ktor answers 401 by itself: for the app, the signal to refresh.</p>
<p>The refresh token is random text from <code>UUID.randomUUID()</code>, kept in a table with the email. <code>POST /v1/refresh</code> looks it up and deletes it, so each one works only once, then sends a new pair. <code>POST /v1/logout</code>, which the app calls when Ada signs out (push track), deletes all her refresh tokens and answers <code>NoContent</code>, 204. The secret never goes in the code: <code>System.getenv("JWT_SECRET")</code> reads an <em>environment variable</em>, a named value set outside the program. Writing <code>NAME=value</code> before a command sets it for that one run: <code>JWT_SECRET=a-long-random-text ./gradlew run</code> in macOS and Linux terminals; in Windows PowerShell, <code>$env:JWT_SECRET="a-long-random-text"; ./gradlew run</code>.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'app', label: 'Recipes app', sub: 'Session' },
              { id: 'login', label: 'post("/login")', sub: 'checks the password' },
              { id: 'auth', label: 'authenticate', sub: 'checks the token' },
              { id: 'handler', label: 'get("/recipes")', sub: 'Ada’s rows' },
              { id: 'refresh', label: 'post("/refresh")', sub: 'one use only' },
            ],
            predict: {
              q: 'Twenty minutes after sign-in, the app sends <code>GET v1/recipes</code> with its access token. What does the server answer?',
              options: ['401 Unauthorized: the token has expired', '200 OK: the token was real once', '404 Not Found'],
              a: 0,
              why: 'The token expired after 15 minutes. The verifier checks the expiry on every request, so Ktor answers 401 before the handler runs.',
            },
            frames: [
              { at: 'login', packet: 'email + password', say: 'Ada signs in. <code>post("/login")</code> reads the email and password, and <code>passwordMatches</code> checks them with <code>Password.check</code>, as in the last lesson.' },
              { at: 'app', packet: 'access + refresh', tone: 'ok', mark: { login: 'ok' }, say: 'They match. The server signs an access token, good for 15 minutes, saves a new refresh token in its table, and sends both.' },
              { at: 'auth', packet: 'Bearer eyJ…', say: 'Ada opens her recipes. Before the handler runs, <code>authenticate</code> checks the token: the signature, the issuer and the expiry.' },
              { at: 'handler', packet: 'ada@example.com', tone: 'ok', mark: { auth: 'ok' }, say: 'The token is good. The handler reads the email from <code>call.principal</code> and asks the database for Ada’s recipes only: 200.' },
              { at: 'auth', packet: 'expired token', tone: 'err', mark: { auth: 'err' }, say: 'Twenty minutes later the token has expired. <code>authenticate</code> answers 401 by itself, and the handler never runs.' },
              { at: 'refresh', packet: 'refresh token', mark: { auth: null }, say: 'The app’s <code>Session</code> catches the 401 and sends its refresh token. The server finds it in the table, deletes it and makes a new pair.' },
              { at: 'app', packet: 'new pair', tone: 'ok', mark: { refresh: 'ok' }, say: 'The app saves the new tokens and repeats the call: 200. Ada noticed nothing.' },
              { at: 'refresh', packet: 'old refresh token', tone: 'err', mark: { refresh: 'err' }, say: 'If someone sends that old refresh token again, it is no longer in the table: 401. Each refresh token works only once.' },
            ],
          });
        },
        code: `// build.gradle.kts, in dependencies { }:
//     implementation("io.ktor:ktor-server-auth")
//     implementation("io.ktor:ktor-server-auth-jwt")       // brings the JWT and Algorithm classes too

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import java.util.Date
import java.util.UUID
// plus the imports from before

@Serializable data class Tokens(val accessToken: String, val refreshToken: String)   // the app's JSON
@Serializable data class RefreshRequest(val refreshToken: String)

object RefreshTokensTable : Table("refresh_tokens") {
    val token = varchar("token", 36)
    val email = varchar("email", 100)
    override val primaryKey = PrimaryKey(token)
}

suspend fun newTokens(email: String, secret: String): Tokens {
    val access = JWT.create()
        .withIssuer("recipes-server")
        .withClaim("email", email)
        .withExpiresAt(Date(System.currentTimeMillis() + 15 * 60 * 1000))   // in 15 minutes
        .sign(Algorithm.HMAC256(secret))
    val refresh = UUID.randomUUID().toString()
    withContext(Dispatchers.IO) {
        transaction {
            RefreshTokensTable.insert { row ->
                row[RefreshTokensTable.token] = refresh
                row[RefreshTokensTable.email] = email
            }
        }
    }
    return Tokens(access, refresh)
}

// The email of a refresh token, which is deleted so it works only once; null if there is no such token
suspend fun useRefreshToken(refreshToken: String): String? = withContext(Dispatchers.IO) {
    transaction {
        val row = RefreshTokensTable.selectAll().where { RefreshTokensTable.token eq refreshToken }.firstOrNull()
        if (row == null) {
            null
        } else {
            RefreshTokensTable.deleteWhere { RefreshTokensTable.token eq refreshToken }
            row[RefreshTokensTable.email]
        }
    }
}

suspend fun deleteRefreshTokens(email: String) = withContext(Dispatchers.IO) {
    transaction {
        RefreshTokensTable.deleteWhere { RefreshTokensTable.email eq email }
    }
}

fun Application.module(secret: String, dbUrl: String) {
    // Database.connect, SchemaUtils.create (now with RefreshTokensTable too) and ContentNegotiation as before
    install(Authentication) {
        jwt("auth-jwt") {
            verifier(JWT.require(Algorithm.HMAC256(secret)).withIssuer("recipes-server").build())
            validate { credential ->
                if (credential.payload.getClaim("email").asString() != null) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }
        }
    }
    routing {
        route("/v1") {
            // post("/signup") as before
            post("/login") {
                val login = call.receive<Login>()
                if (passwordMatches(login)) {
                    call.respond(newTokens(login.email, secret))   // 200 and {"accessToken":…,"refreshToken":…}
                } else {
                    call.respond(HttpStatusCode.Unauthorized)
                }
            }
            post("/refresh") {
                val email = useRefreshToken(call.receive<RefreshRequest>().refreshToken)
                if (email == null) {
                    call.respond(HttpStatusCode.Unauthorized)
                } else {
                    call.respond(newTokens(email, secret))
                }
            }
            authenticate("auth-jwt") {                // no good token: 401, the handlers don't run
                get("/recipes") {
                    val email = call.principal<JWTPrincipal>()!!.payload.getClaim("email").asString()
                    call.respond(recipesOf(email))
                }
                // post("/recipes") moves in here too, with this email as the owner
                post("/logout") {
                    val email = call.principal<JWTPrincipal>()!!.payload.getClaim("email").asString()
                    deleteRefreshTokens(email)
                    call.respond(HttpStatusCode.NoContent)  // 204: done, no body
                }
            }
        }
    }
}

fun main() {
    val secret = System.getenv("JWT_SECRET") ?: throw IllegalStateException("JWT_SECRET is not set")
    embeddedServer(Netty, port = 8080) {
        module(secret, "jdbc:h2:./recipes")
    }.start(wait = true)
}`,
        remember: 'Sign short-lived JWTs with a secret from the environment; put private routes inside authenticate { }; a refresh token works once, and logout deletes them all.',
        terms: [
          { term: 'JWT', def: 'JSON Web Token: a small signed piece of JSON with claims, like the email and the expiry. Changing it breaks the signature.' },
          { term: 'claim', def: 'One fact inside a JWT, like <code>"email"</code>. <code>withClaim</code> adds it, <code>getClaim</code> reads it.' },
          { term: 'environment variable', def: 'A named value set outside a program and read with <code>System.getenv("JWT_SECRET")</code>. It keeps secrets out of the code.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Only signed-in users may read recipes, and only their own.', code: `[[authenticate]]("auth-jwt") {
    get("/recipes") {
        val email = call.[[principal]]<JWTPrincipal>()!!.payload.getClaim("[[email]]").asString()
        call.respond(recipesOf(email))
    }
}`, why: 'Routes inside <code>authenticate</code> need a good token. <code>call.principal</code> gives the checked token, and the <code>email</code> claim says whose recipes to read.' },
          { type: 'bug', prompt: 'Right after sign-in, the very next request already gets 401. Tap the wrong line.', code: `val access = JWT.create()
    .withIssuer("recipes-server")
    .withClaim("email", email)
    .withExpiresAt(Date(System.currentTimeMillis() + 15 * 60))
    .sign(Algorithm.HMAC256(secret))`, bug: 3, fix: '    .withExpiresAt(Date(System.currentTimeMillis() + 15 * 60 * 1000))', why: '<code>currentTimeMillis</code> counts milliseconds. <code>15 * 60</code> is 900 milliseconds, less than a second. 15 minutes is <code>15 * 60 * 1000</code>.' },
        ],
        quiz: [
          { q: 'Anyone can read the JSON inside a JWT. Why can’t Sam change the email in his token to Ada’s?', options: ['The signature would no longer match, and only the server has the secret', 'JWTs are encrypted', 'The app checks the email'], a: 0, why: 'The server signs the token with its secret. A changed token fails the check in <code>verifier</code>.' },
          { q: 'A request to a route inside <code>authenticate("auth-jwt")</code> has no token. What happens?', options: ['Ktor answers 401, and the handler doesn’t run', 'The handler runs with no email', 'The server crashes'], a: 0, why: '<code>authenticate</code> checks before the handler. No good token, no handler.' },
          { q: 'Why delete a refresh token when it is used?', options: ['So a stolen copy can’t be used again', 'To save space', 'Because the app forgets it anyway'], a: 0, why: 'Each refresh hands out a new one. An old one sent again is no longer in the table, so it gets 401.' },
        ],
        docs: [['JSON Web Tokens (Ktor)', 'https://ktor.io/docs/server-jwt.html']],
      },

      {
        id: 'testing',
        title: 'Testing a server',
        tagline: 'Send requests to your server from a test, without a network.',
        goals: ['Write a server test with testApplication and its client', 'Check status codes and JSON answers in a test', 'Give each test its own fresh database'],
        level: 'intermediate', introduces: ['testApplication', 'createClient', 'setBody', 'contentType', 'ContentType', 'HttpHeaders'],
        body: `
<p>Sam tidies the sign-in code and, without noticing, moves <code>get("/recipes")</code> outside <code>authenticate</code>, from the <a href="#backend.tokens">tokens lesson</a>. Now anyone can read Ada’s recipes. Trying the app wouldn’t show it, because the app always sends a token. A test that asks without one catches it in a second.</p>
<p><code>testApplication { }</code>, from <code>ktor-server-test-host</code>, runs your server inside the test, with no real network and no port. In its <code>application { }</code> block, call <code>module(...)</code> as <code>main</code> does, with a test secret and a test database. Then <code>client.get("/v1/recipes")</code> sends a request and gives back the response, and <code>response.status</code> is its status code. <code>@Test</code> and <code>assertEquals</code> come from kotlin.test, Kotlin’s own test library; they work like the JUnit ones from the testing track.</p>
<p>To send and read JSON, make a client with <code>createClient { install(ContentNegotiation) { json() } }</code>: the client side of the same plugin. In a request, <code>contentType(ContentType.Application.Json)</code> and <code>setBody(...)</code> fill the body, and <code>header(HttpHeaders.Authorization, "Bearer …")</code> adds the token. <code>body&lt;List&lt;RecipeDto&gt;&gt;()</code> reads the answer. The test is in the package <code>com.example</code>, like the server, so it can use the server’s classes and functions: <code>Login</code>, <code>Tokens</code>, <code>addUser</code>, <code>addRecipe</code>.</p>
<p>Give every test its own database. <code>jdbc:h2:mem:test1</code> keeps one in memory, and a different name in each test (<code>test1</code>, <code>test2</code>) means nothing one test adds is there in the next. <code>DB_CLOSE_DELAY=-1</code> keeps it until all tests are done; without it, H2 would delete it each time Exposed closes its connection. <code>./gradlew test</code> runs the tests, as for the app.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            varsTitle: 'Values',
            code: `@Test
fun recipesNeedAToken() = testApplication {
    application {
        module("test-secret", "jdbc:h2:mem:test1;DB_CLOSE_DELAY=-1")
    }
    val response = client.get("/v1/recipes")
    assertEquals(HttpStatusCode.Unauthorized, response.status)
}`,
            predict: {
              q: 'Sam moved <code>get("/recipes")</code> outside <code>authenticate</code>. What happens to this test?',
              options: ['It fails: the status is 200 OK, not 401', 'It passes: the app sends a token anyway', 'It can’t run without a phone'],
              a: 0,
              why: 'The test sends no token on purpose. Outside <code>authenticate</code>, the handler answers 200, and <code>assertEquals</code> fails.',
            },
            frames: [
              { line: 2, say: '<code>testApplication</code> starts a test version of the server inside the test. No port, no network.' },
              { line: 4, say: '<code>application { }</code> sets it up with <code>module</code>, as <code>main</code> does, with a test secret and a fresh in-memory database called test1.' },
              { line: 6, vars: { 'response.status': '401 Unauthorized' }, say: '<code>client</code> sends <code>GET /v1/recipes</code> without a token. Inside the server, <code>authenticate</code> stops it: 401.' },
              { line: 7, vars: { assertEquals: 'equal: the test passes' }, say: 'Expected 401, got 401. The test passes.' },
              { line: 6, vars: { 'response.status': '200 OK', assertEquals: null }, say: 'Now Sam’s change: the route sits outside <code>authenticate</code>. The same request gets 200 and Ada’s recipes.' },
              { line: 7, vars: { assertEquals: 'not equal: the test fails' }, say: 'Expected 401, got 200: the test fails and names this line. Sam sees it before the change ships.' },
            ],
          });
        },
        code: `// build.gradle.kts, in dependencies { }:
//     testImplementation(kotlin("test"))
//     testImplementation("io.ktor:ktor-server-test-host")
//     testImplementation("io.ktor:ktor-client-content-negotiation")

// src/test/kotlin/com/example/RecipesServerTest.kt
package com.example

import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.testing.*
import kotlin.test.*

class RecipesServerTest {
    @Test
    fun recipesNeedAToken() = testApplication {
        application {
            module("test-secret", "jdbc:h2:mem:test1;DB_CLOSE_DELAY=-1")
        }
        val response = client.get("/v1/recipes")
        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }

    @Test
    fun adaGetsOnlyHerRecipes() = testApplication {
        application {
            module("test-secret", "jdbc:h2:mem:test2;DB_CLOSE_DELAY=-1")
            addUser("ada@example.com", "lemon-pasta-15")
            addRecipe("ada@example.com", "Tomato soup", 25)
            addRecipe("sam@example.com", "Bean stew", 45)
        }
        val jsonClient = createClient {
            install(ContentNegotiation) { json() }
        }
        val tokens = jsonClient.post("/v1/login") {
            contentType(ContentType.Application.Json)
            setBody(Login("ada@example.com", "lemon-pasta-15"))
        }.body<Tokens>()
        val recipes = jsonClient.get("/v1/recipes") {
            header(HttpHeaders.Authorization, "Bearer \${tokens.accessToken}")
        }.body<List<RecipeDto>>()
        assertEquals(listOf("Tomato soup"), recipes.map { it.title })   // not Sam's stew
    }
}`,
        remember: 'testApplication runs the server inside the test; client sends requests; check response.status and the body; give each test its own in-memory database.',
        mistakes: [
          {
            title: 'One database for every test',
            bad: `module("test-secret", "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1")   // the same name in every test`,
            good: `module("test-secret", "jdbc:h2:mem:test1;DB_CLOSE_DELAY=-1")  // test1, test2, …: one per test`,
            why: '<code>DB_CLOSE_DELAY=-1</code> keeps a database alive while the tests run, so with one name, rows from one test are still there in the next. Then a test passes or fails depending on which ran first.',
          },
        ],
        terms: [
          { term: 'testApplication', def: 'Runs your Ktor server inside a test, with no network or port, and gives you a <code>client</code> to call it.' },
          { term: 'test client', def: 'The <code>client</code> inside <code>testApplication</code>: it sends requests straight to the test server.' },
          { term: 'in-memory database', def: 'A database kept only in memory, like <code>jdbc:h2:mem:test1</code>: fast, and gone when the tests end.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Check that recipes need a token.', code: `@Test
fun recipesNeedAToken() = [[testApplication]] {
    application {
        module("test-secret", "jdbc:h2:mem:test1;DB_CLOSE_DELAY=-1")
    }
    val response = [[client]].get("/v1/recipes")
    assertEquals(HttpStatusCode.[[Unauthorized]], response.status)
}`, why: '<code>testApplication</code> runs the server, <code>client</code> calls it, and a request without a token must get 401 Unauthorized.' },
          { type: 'bug', prompt: 'This test passes on its own, but fails when it runs after <code>adaGetsOnlyHerRecipes</code>: Ada is already in that database, and <code>/v1/signup</code> answers 409 when the email exists. Tap the wrong line.', code: `@Test
fun adaCanSignUp() = testApplication {
    application {
        module("test-secret", "jdbc:h2:mem:test2;DB_CLOSE_DELAY=-1")
    }
    val jsonClient = createClient { install(ContentNegotiation) { json() } }
    val response = jsonClient.post("/v1/signup") {
        contentType(ContentType.Application.Json)
        setBody(Login("ada@example.com", "lemon-pasta-15"))
    }
    assertEquals(HttpStatusCode.Created, response.status)
}`, bug: 3, fix: '        module("test-secret", "jdbc:h2:mem:test3;DB_CLOSE_DELAY=-1")', why: '<code>test2</code> is the database of the other test, and Ada’s row is still in it. A name of its own gives this test an empty database.' },
        ],
        quiz: [
          { q: 'What does <code>testApplication</code> need to run your routes?', options: ['Nothing more: it runs the server inside the test', 'A phone or an emulator', 'The server already running on port 8080'], a: 0, why: 'Requests go straight from the test client to the test server, with no network.' },
          { q: 'Why <code>jdbc:h2:mem:</code> in tests?', options: ['A fresh, fast database that is gone after the tests', 'It is the only database Ktor supports', 'It keeps test data for the next run'], a: 0, why: 'Each test starts from an empty database it fills itself, so tests don’t depend on each other.' },
          { q: 'Which test would have caught Sam’s change, the route outside <code>authenticate</code>?', options: ['GET /v1/recipes without a token expects 401', 'GET /v1/recipes with a token expects 200', 'POST /v1/login expects 200'], a: 0, why: 'With a token, both versions answer 200. Only the request without a token shows the difference.' },
        ],
        docs: [['Testing in Ktor Server', 'https://ktor.io/docs/server-testing.html']],
      },

      {
        id: 'deploy',
        title: 'Deploying',
        tagline: 'Package the server as one file or a container image, and run it where every phone can reach it.',
        goals: ['Read the port, the secret and the database address from environment variables', 'Build a fat JAR and a container image with the Ktor Gradle plugin', 'Explain what a hosting service does with your image'],
        level: 'intermediate', introduces: ['buildFatJar', 'buildImage', 'localImageName', 'docker'],
        body: `
<p>The server runs on your laptop, at <code>localhost</code>. Ada’s phone can’t reach it there, and it stops whenever the laptop sleeps. <em>Deploying</em> means running it on a computer that is always on, with an address like <code>recipes.example.com</code>.</p>
<p>First, package it. <code>./gradlew buildFatJar</code>, a task of the Ktor plugin, makes one <em>fat JAR</em>: a single file with your compiled code and every library inside, <code>build/libs/recipes-server-all.jar</code> (the name comes from <code>rootProject.name</code>). Any computer with Java runs it with <code>java -jar</code>. A <em>container image</em> goes one step further: it packs the program together with Java itself and everything else it needs, so it runs the same on any computer that runs containers. <b>Docker</b> is the common tool for them. <code>./gradlew buildImage</code> writes the image to <code>build/jib-image.tar</code>, <code>docker load</code> adds it to Docker, and <code>docker run</code> starts it: <code>-p 8080:8080</code> connects the computer’s port 8080 to the container’s, and <code>-e</code> passes an environment variable.</p>
<p>A <em>hosting service</em> is a company that runs your image on its computers. It gives the server an HTTPS address, restarts it if it crashes, and often says which port to use in the environment variable <code>PORT</code>. So nothing that differs between your laptop and the hosting service is written in the code: <code>System.getenv</code> reads the port, the JWT secret and the database address.</p>
<p>The H2 file inside a container is lost when a new version replaces the container. On a hosting service, use a database it runs for you, such as PostgreSQL, and add its driver library, <code>org.postgresql:postgresql:42.7.14</code>. Set <code>DATABASE_URL</code> to its JDBC URL, with the user name and password in it: <code>jdbc:postgresql://db.example.com:5432/recipes?user=recipes&amp;password=…</code>. If the service gives you an address that starts with <code>postgres://</code>, rewrite it in this form. The recipes then outlive every new version of the server. One more step before you deploy: remove <code>/v1/signup</code>, or protect it. It was only there to add test accounts, and once deployed anyone could call it.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'code', label: 'Your project', sub: 'reads PORT, JWT_SECRET, DATABASE_URL' },
              { id: 'jar', label: 'Fat JAR', sub: 'recipes-server-all.jar' },
              { id: 'image', label: 'Container image', sub: 'JAR + Java' },
              { id: 'host', label: 'Hosting service', sub: 'recipes.example.com' },
              { id: 'phone', label: 'Ada’s phone', sub: 'anywhere' },
            ],
            predict: {
              q: 'The image runs on the hosting service. Where does the server find the JWT secret?',
              options: ['In an environment variable the hosting service sets', 'In the code, as a <code>const val</code>', 'In the name of the image'],
              a: 0,
              why: 'The same image runs everywhere. What differs, like the secret, comes from the environment, set by whoever runs it.',
            },
            frames: [
              { at: 'code', packet: 'source', say: 'Your server project, the same code that runs on your laptop. It names no port, secret or database address: it reads them with <code>System.getenv</code>.' },
              { at: 'jar', packet: 'buildFatJar', say: '<code>./gradlew buildFatJar</code> puts your code and every library into one file. <code>java -jar</code> runs it wherever Java is installed.' },
              { at: 'image', packet: 'buildImage', say: '<code>./gradlew buildImage</code> packs the program together with Java into a container image, <code>build/jib-image.tar</code>.' },
              { at: 'host', packet: 'image', say: 'The hosting service gets the image and starts it, with <code>PORT</code>, <code>JWT_SECRET</code> and <code>DATABASE_URL</code> as environment variables.' },
              { at: 'host', packet: 'PostgreSQL', tone: 'ok', mark: { host: 'ok' }, say: 'The server connects to the PostgreSQL database the service runs. The data lives there, so the next version of the image loses no recipes.' },
              { at: 'phone', packet: 'GET https://recipes.example.com/v1/recipes', tone: 'ok', mark: { phone: 'ok' }, say: 'The server answers at an HTTPS address. Ada’s phone, wherever she is, reaches the same server.' },
            ],
          });
        },
        code: `// settings.gradle.kts:   rootProject.name = "recipes-server"
// build.gradle.kts: the Ktor plugin is already there; give the image a name
// (and for PostgreSQL, in dependencies { }: implementation("org.postgresql:postgresql:42.7.14"))
ktor {
    docker {
        localImageName.set("recipes-server")
    }
}

// Application.kt: everything that differs between laptop and hosting service comes from the environment
fun main() {
    val port = System.getenv("PORT")?.toInt() ?: 8080
    val secret = System.getenv("JWT_SECRET") ?: throw IllegalStateException("JWT_SECRET is not set")
    val dbUrl = System.getenv("DATABASE_URL") ?: "jdbc:h2:./recipes"
    embeddedServer(Netty, port = port) {
        module(secret, dbUrl)
    }.start(wait = true)
}

// Terminal
// ./gradlew buildFatJar                          → build/libs/recipes-server-all.jar
// JWT_SECRET=a-long-random-text java -jar build/libs/recipes-server-all.jar
//
// ./gradlew buildImage                           → build/jib-image.tar
// docker load < build/jib-image.tar
// docker run -p 8080:8080 -e JWT_SECRET=a-long-random-text recipes-server`,
        remember: 'One build, settings from environment variables; buildFatJar makes one runnable JAR, buildImage a container image; on a hosting service, keep the data in the database it runs for you.',
        mistakes: [
          {
            title: 'Listening only on the same computer',
            bad: `embeddedServer(Netty, port = port, host = "127.0.0.1") {`,
            good: `embeddedServer(Netty, port = port) {      // host left out: 0.0.0.0, every network`,
            why: 'Here <code>host</code> is the address Ktor listens on, not the hosting service. <code>127.0.0.1</code> accepts connections only from the same computer. Inside a container, that is the container itself, so no request from outside gets in. Without <code>host</code>, Ktor listens on <code>0.0.0.0</code>: on every network.',
          },
        ],
        terms: [
          { term: 'fat JAR', def: 'One JAR file with your code and all its libraries, run with <code>java -jar</code>.' },
          { term: 'container image', def: 'A package of a program with everything it needs, Java included, that runs the same on any computer with containers.' },
          { term: 'Docker', def: 'The common tool to load, run and share container images.' },
          { term: 'hosting service', def: 'A company that runs your server on its computers, with an address, HTTPS and restarts.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Take the port from the hosting service, or use 8080 on your laptop.', code: `val port = System.[[getenv]]("PORT")?.[[toInt]]() ?: [[8080]]
embeddedServer(Netty, port = port) {
    module(secret, dbUrl)
}.start(wait = true)`, why: '<code>getenv</code> gives null when <code>PORT</code> isn’t set, so <code>?:</code> falls back to 8080. <code>toInt</code> turns the text into a number.' },
          { type: 'bug', prompt: 'The project is on GitHub, and anyone who reads it can sign tokens as any user. Tap the wrong line.', code: `fun main() {
    val port = System.getenv("PORT")?.toInt() ?: 8080
    val secret = "k8Df2-recipes-signing-secret"
    val dbUrl = System.getenv("DATABASE_URL") ?: "jdbc:h2:./recipes"
    embeddedServer(Netty, port = port) {
        module(secret, dbUrl)
    }.start(wait = true)
}`, bug: 2, fix: '    val secret = System.getenv("JWT_SECRET") ?: throw IllegalStateException("JWT_SECRET is not set")', why: 'With the secret in the code, everyone who sees the code can sign tokens. From the environment, it stays with the hosting service, and the server refuses to start without it.' },
        ],
        quiz: [
          { q: 'What does <code>./gradlew buildFatJar</code> make?', options: ['One JAR with your code and every library', 'A container image', 'An APK'], a: 0, why: 'One file that <code>java -jar</code> runs. <code>buildImage</code> makes the container image.' },
          { q: 'Why not keep the H2 file inside the container on a hosting service?', options: ['A new version replaces the container, and the file is lost with it', 'H2 can’t run in a container', 'Hosting services don’t allow files'], a: 0, why: 'Containers are replaced on every deploy. Keep the data in a database that outlives them.' },
          { q: 'In <code>docker run -p 8080:8080 …</code>, what does <code>-p</code> do?', options: ['Connects the computer’s port 8080 to the container’s', 'Sets the password', 'Picks the image'], a: 0, why: 'Without it, the server listens inside the container, and nothing outside can reach it.' },
        ],
        docs: [['Creating fat JARs (Ktor)', 'https://ktor.io/docs/server-fatjar.html'], ['Docker (Ktor)', 'https://ktor.io/docs/docker.html']],
      },

      {
        id: 'client',
        title: 'Connecting your app',
        tagline: 'Point the Recipes app at your own server, and follow the whole trip.',
        goals: ['Add a local flavor whose base URL is your laptop, as the emulator sees it', 'Allow plain HTTP for that one address, in that flavor only', 'Follow a sign-in and a refresh from the app to your server and back'],
        level: 'intermediate', introduces: ['domain-config'],
        body: `
<p>Your server answers the calls of the <a href="#data.auth">sign-in lesson</a>, <code>login</code>, <code>refresh</code> and <code>recipes</code>, plus <code>signup</code> and <code>logout</code>, with the same JSON keys, and 401 when a token has expired. Two calls of <code>RecipeApi</code> aren’t on it: <code>explore</code> from <a href="#data.paging">Paging</a> and <code>devices</code> from the push track. On the local server they get 404, so those screens show their error state. Adding them is a good exercise: <a href="#sysdesign.pagination">Pagination on the server</a> designs <code>explore</code>, and <code>devices</code> is one more route inside <code>authenticate</code> that saves the installation ID with the email. Time to connect: the Recipes app on the emulator, the server on your laptop.</p>
<p>Inside the emulator, <code>localhost</code> is the emulator itself. The emulator gives your laptop a special address instead: <code>10.0.2.2</code>. So add a third flavor next to <code>staging</code> and <code>prod</code> from the <a href="#build.variants">build variants lesson</a>: <code>local</code>, whose <code>BASE_URL</code> is <code>http://10.0.2.2:8080/v1/</code>. Since <a href="#sysdesign.api">Designing an API</a>, the other two end in <code>v1/</code> as well: <code>https://staging.recipes.example.com/v1/</code> and <code>https://recipes.example.com/v1/</code>. Each ends with <code>/</code>, as Retrofit wants, and <code>ServerConfig</code> hands it to Retrofit as before. The paths in <code>RecipeApi</code> stay <code>login</code> and <code>recipes</code>, with no <code>/</code> in front: a path that starts with <code>/</code> would replace the base URL’s path and drop the <code>v1/</code>. <code>applicationIdSuffix = ".local"</code> installs the local app beside the other versions.</p>
<p>That address is plain <code>http://</code>, and the <a href="#security.network">network security config</a> allows HTTPS only. Put a second copy of the file in <code>src/local/res/xml/</code>: the most specific folder wins, so only local builds get it. It replaces the whole main file, so copy in what you want to keep, such as <code>&lt;debug-overrides&gt;</code>. In it, <code>&lt;domain-config cleartextTrafficPermitted="true"&gt;</code> allows plain HTTP for the domains listed inside it, here exactly <code>10.0.2.2</code>. Every other address stays HTTPS-only, and staging and prod don’t change at all.</p>
<p>Then start the server with <code>JWT_SECRET=a-long-random-text ./gradlew run</code>, add Ada’s account with curl, pick the <code>localDebug</code> variant and run the app. Ada signs in, her recipes come from your own database, and when her access token expires, the refresh works too: both halves of the contract fit. On a real phone, <code>10.0.2.2</code> doesn’t exist; there, <code>adb reverse tcp:8080 tcp:8080</code> makes the phone’s <code>localhost:8080</code> reach the laptop, so the base URL and the config use <code>localhost</code> instead.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'app', label: 'Recipes app', sub: 'localDebug, emulator' },
              { id: 'addr', label: '10.0.2.2:8080', sub: 'your laptop, seen from the emulator' },
              { id: 'server', label: 'Ktor server', sub: 'routes + authenticate' },
              { id: 'db', label: 'H2 database', sub: 'recipes.mv.db' },
            ],
            predict: {
              q: 'The app runs on the emulator, the server on your laptop at port 8080. Which base URL works?',
              options: ['<code>http://10.0.2.2:8080/v1/</code>', '<code>http://localhost:8080/v1/</code>', '<code>http://127.0.0.1:8080/v1/</code>'],
              a: 0,
              why: 'Inside the emulator, <code>localhost</code> and <code>127.0.0.1</code> are the emulator itself. <code>10.0.2.2</code> is its name for your laptop.',
            },
            frames: [
              { at: 'app', packet: 'POST login', say: 'Ada signs in on the localDebug app. Retrofit sends <code>POST login</code> to <code>http://10.0.2.2:8080/v1/login</code>; the local network security config lets plain HTTP through to this one address.' },
              { at: 'addr', packet: 'POST /v1/login', say: 'The emulator passes the request to your laptop’s port 8080, where Ktor listens.' },
              { at: 'server', packet: 'password ✓', tone: 'ok', mark: { server: 'ok' }, say: 'Your <code>post("/login")</code> finds Ada in the users table and checks her password against its Argon2id hash.' },
              { at: 'app', packet: '{"accessToken":…,"refreshToken":…}', tone: 'ok', say: 'The answer has exactly the keys of the app’s <code>Tokens</code> class. <code>Session</code> saves both tokens in DataStore.' },
              { at: 'db', packet: 'Ada’s rows', say: '<code>GET v1/recipes</code> with the access token. <code>authenticate</code> accepts it, and <code>recipesOf</code> reads Ada’s rows from H2.' },
              { at: 'app', packet: '[{"id":1,…}]', tone: 'ok', mark: { app: 'ok' }, say: 'The JSON fills <code>RecipeDto</code>, the repository writes it into Room, and the list appears. Ada’s recipes now come from your server.' },
              { at: 'server', packet: '401', tone: 'err', mark: { server: 'err', app: null }, say: 'Fifteen minutes later the access token has expired, and <code>authenticate</code> answers 401.' },
              { at: 'app', packet: 'POST refresh → new pair', tone: 'ok', mark: { server: 'ok', app: 'ok' }, say: '<code>Session</code> catches the 401, sends the refresh token, gets a new pair and repeats the call: 200. Both halves of the contract fit.' },
            ],
          });
        },
        code: `// app/build.gradle.kts, in productFlavors { }, next to staging and prod:
create("local") {
    dimension = "server"
    applicationIdSuffix = ".local"
    buildConfigField("String", "BASE_URL", "\\"http://10.0.2.2:8080/v1/\\"")   // your laptop, seen from the emulator
}

// src/local/res/xml/network_security_config.xml: replaces the whole one in src/main, for local builds only
// <network-security-config>
//     <base-config cleartextTrafficPermitted="false" />
//     <domain-config cleartextTrafficPermitted="true">
//         <domain>10.0.2.2</domain>
//     </domain-config>
//     <debug-overrides>                          <!-- copied from the main file -->
//         <trust-anchors>
//             <certificates src="user" />
//         </trust-anchors>
//     </debug-overrides>
// </network-security-config>

// Terminal, in the recipes-server folder: start the server, then add Ada's account
// JWT_SECRET=a-long-random-text ./gradlew run
// curl -i -X POST localhost:8080/v1/signup -H "Content-Type: application/json" -d '{"email":"ada@example.com","password":"lemon-pasta-15"}'
// answers: HTTP/1.1 201 Created   (what this code sends; headers cut)
//
// Android Studio: Build › Select Build Variant › localDebug, then Run`,
        remember: 'From the emulator your laptop is 10.0.2.2; a local flavor sets that base URL, and its own network security config allows plain HTTP to that address only.',
        mistakes: [
          {
            title: 'Plain HTTP for every address',
            bad: `<!-- src/main/res/xml/network_security_config.xml -->
<base-config cleartextTrafficPermitted="true" />`,
            good: `<!-- src/local/res/xml/network_security_config.xml -->
<domain-config cleartextTrafficPermitted="true">
    <domain>10.0.2.2</domain>
</domain-config>`,
            why: 'In <code>src/main</code> it switches HTTPS off in the release build too, for every server, and tokens could cross a café Wi-Fi as plain text. Allow plain HTTP for <code>10.0.2.2</code> only, and only in the local flavor.',
          },
        ],
        terms: [
          { term: '10.0.2.2', def: 'The Android emulator’s address for the computer it runs on: that computer’s <code>127.0.0.1</code>.' },
          { term: 'domain-config', def: 'A part of the network security config with rules for the domains listed inside it, like allowing plain HTTP to <code>10.0.2.2</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Point the local flavor at your laptop, as the emulator sees it.', code: `create("local") {
    dimension = "server"
    applicationIdSuffix = ".[[local]]"
    buildConfigField("String", "BASE_URL", "\\"http://[[10.0.2.2]]:8080/v1/\\"")
}`, why: 'The suffix makes the local app a separate app on the phone. <code>10.0.2.2</code> is the emulator’s address for your laptop.' },
          { type: 'bug', prompt: 'On the emulator, every call of the local app fails with an <code>IOException</code>, though curl on the laptop works. Tap the wrong line.', code: `create("local") {
    dimension = "server"
    applicationIdSuffix = ".local"
    buildConfigField("String", "BASE_URL", "\\"http://localhost:8080/v1/\\"")
}`, bug: 3, fix: '    buildConfigField("String", "BASE_URL", "\\"http://10.0.2.2:8080/v1/\\"")', why: 'curl runs on the laptop, so <code>localhost</code> is the laptop there. In the emulator, <code>localhost</code> is the emulator, where no server listens.' },
        ],
        quiz: [
          { q: 'Why does the network security config for <code>10.0.2.2</code> go in <code>src/local</code>, not <code>src/main</code>?', options: ['So only local builds may use plain HTTP', 'Android reads only flavor folders', '<code>src/main</code> can’t hold XML files'], a: 0, why: 'The most specific folder wins. Staging and prod keep the HTTPS-only file from <code>src/main</code>.' },
          { q: 'After 15 minutes the server answers 401. Which part of the app handles it?', options: ['<code>Session</code>: it refreshes and repeats the call once', 'Room', 'The network security config'], a: 0, why: 'That is the plan from the sign-in lesson. The server’s <code>post("/refresh")</code> is its other half.' },
          { q: 'The server renames the JSON key <code>accessToken</code> to <code>access</code>. What breaks?', options: ['Reading every <code>Tokens</code> answer: sign-in and refresh', 'Nothing: Retrofit guesses the name', 'Only the recipe list'], a: 0, why: 'Each key fills the property with the same name, and <code>accessToken</code> is missing now. Both halves of an API must keep the same keys.' },
        ],
        docs: [['Network address space (Android Emulator)', 'https://developer.android.com/studio/run/emulator-networking-address'], ['Network security configuration', 'https://developer.android.com/privacy-and-security/security-config']],
      },
    ],
  });
})();
