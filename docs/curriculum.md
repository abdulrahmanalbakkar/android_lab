# Android Lab curriculum: zero to hero

Reader on day one: has never programmed. Knows how to use a computer and a phone, nothing more.

## Rules every lesson follows
1. One new idea per lesson. A lesson takes 5 to 10 minutes.
2. A lesson may use only what earlier lessons taught (everything above it in this file), plus the one idea it teaches.
   Optional tracks may be skipped, so a lesson never depends on an optional track unless it is in that same track.
3. If an example needs something not taught yet, change the example. Never "you'll learn this later" in the main path.
4. Order inside a lesson: why it matters (one or two sentences, a real situation), the idea, see it (demo), try it
   (Run it or practice), a small win (quiz). Short paragraphs, plain words, no jargon without a one-line explanation.
5. "Go deeper" is optional extra depth on the SAME idea, still using only known concepts. Anything that needs a later
   topic moves to that later lesson.
6. Every new word the lesson introduces is in its `terms`. That list is what the checker uses.
7. Every lesson starts with 2-3 `goals` ("In this lesson": what you'll be able to do), so a reader can tell at a glance
   whether it is new to them. Readers who already know it can take the quick check and move on.
8. Neutral, international examples. Friendly, never condescending. No "simply", "just", "obviously".

Format: `id | Title | teaches`. Track ids stay the same where a track continues to exist; lesson ids are new.
(new) marks a track that does not exist yet. (optional) tracks are skippable.

---

## Stage 1: Programming basics

### start: First steps (new)
- program | What a program is | program, instruction, runs in order, computers do exactly what they are told
- first-program | Your first program | fun main as "where the program starts", println, running code, output
- text | Printing text | text in quotes (String), printing several lines, what happens without quotes
- numbers | Numbers and arithmetic | whole numbers, + - * /, order of operations, parentheses
- decimals | Decimal numbers | 3.5, division of whole numbers drops the decimals, % remainder
- comments | Comments | // and /* */, writing notes for humans, turning a line off
- errors | When code doesn't work | compile errors vs crashes, reading an error message, errors are normal

### kotlin: Kotlin
- val | Naming a value with val | variable as a named box, val, reading a value, naming rules
- var | Values that change with var | var, reassigning, += -= ++, when to choose val
- types | Types | Int, Double, String, Boolean, type inference, writing the type explicitly, type mismatch errors
- templates | Putting values into text | string templates $name and ${expr}, + to join text
- conversion | Converting between types | toInt(), toDouble(), toString(), why "5" + 1 is not 6
- booleans | True or false | Boolean, comparisons == != < > <= >=
- logic | Combining conditions | && || !, reading complex conditions
- if | Making decisions with if | if, else, else if, blocks { }
- if-expression | if gives back a value | if as an expression, val result = if ... else ...
- when | Choosing among many cases | when with values, ranges in when, else branch
- while | Repeating with while | loops, while, loop counter, infinite loop danger
- for-ranges | Counting with for | for, ranges 1..5, until, downTo, step
- functions | Writing your own function | fun, calling a function, why functions (reuse, names)
- parameters | Giving a function inputs | parameters, arguments, several parameters
- return | Getting a result back | return, return type, Unit, single-expression functions
- default-args | Default and named arguments | default values, named arguments
- scope | Where a name exists | local scope, blocks, shadowing (gently)
- null | When there might be no value | null, nullable types String?, why Kotlin separates them
- null-safety | Working safely with null | ?. safe call, ?: Elvis, !! and why to avoid it, smart cast after a check
- lists | Lists | listOf, size, get by index, first/last, index out of range
- list-loop | Going through a list | for item in list, indices, withIndex
- mutable-lists | Lists that change | mutableListOf, add, remove, val list vs changing contents
- sets | Sets | setOf, no duplicates, contains
- maps | Maps | mapOf, key to value, get, getOrDefault, mutableMapOf
- lambdas | Functions as values | lambda { }, it, function types
- function-params | Functions that take functions | function-type parameters, passing a lambda, trailing lambdas, dropping empty ()
- collection-ops | Transforming lists | filter, map, sum, count, any, all, sortedBy
- classes | Your own types: classes | class, constructor, properties, creating an object
- methods | Functions inside a class | member functions, this, objects keep their own state
- encapsulation-basics | Hiding the inside | private, why hide state, getters through properties
- data-classes | Data classes | data class, toString, equals, copy
- enums | A fixed set of choices | enum class, when over an enum
- inheritance | Building on a class | open, : Parent(), override, super
- interfaces | Promises a class keeps | interface, implementing, a list of different types behind one interface
- objects | One-of-a-kind objects | object declaration, companion object
- sealed | A closed family of types | sealed class/interface, exhaustive when
- exceptions | When something goes wrong at run time | exceptions, throw, try/catch/finally, crash vs handled
- extensions | Adding functions to existing types | extension functions
- scope-functions | let, apply, also, run | scope functions, it vs this, when each reads best
- properties | Smarter properties | custom getters/setters, backing field, const val
- late-init | Values that arrive later | lateinit, by lazy

### git: Git
- terminal | The terminal | command line, folders, cd, ls/dir, pwd, why developers use it
- what-git | What version control is | versions, history, why not "final_v2_really_final"
- init | Starting a repository | git init, the .git folder, git status
- commits | Saving a snapshot | working tree, staging area, git add, git commit, messages
- history | Looking at history | git log, git diff, git show
- ignore | Ignoring files | .gitignore, what not to commit (secrets, build outputs)
- branches | Branches | branch as a label, HEAD, git switch -c
- merging | Merging | merge, fast-forward, merge commit
- conflicts | Merge conflicts | conflict markers, resolving, finishing the merge
- remotes | Working with GitHub | remote, clone, push, pull, fetch, origin
- pull-requests | Pull requests and review | pull request, review, merge on GitHub
- rebase | Rebase | rebase vs merge, when not to rebase shared branches
- undo | Undoing things | restore, reset, revert, which to use when

### kdeep: Kotlin in depth (optional)
- generics | Generic types | type parameters, List<T>, writing a generic function/class
- variance | in and out | variance, producers and consumers
- delegation | Delegation | by, delegated properties
- inline | Inline functions | inline, reified, non-local return
- operators | Operator overloading | operator fun, plus, get, invoke
- value | Value classes | @JvmInline value class, type safety without cost
- sequences | Sequences | lazy evaluation, asSequence, when it helps
- generators | Building sequences | sequence { yield }
- dsl | Building a DSL | lambdas with receiver, type-safe builders
- errors | Result and error handling | Result, runCatching, choosing exceptions vs Result
- java-interop | Calling Java | platform types, nullability annotations, @JvmStatic

---

## Stage 2: Computer science foundations (all optional; assume Stage 1)

### os: Operating systems
- what-os | What an operating system does | OS, kernel, hardware abstraction
- processes | Processes | process, memory isolation, process lifecycle
- threads | Threads | thread, sharing memory, why many threads
- scheduling | Sharing the CPU | scheduler, time slices, context switch
- memory | Memory | RAM, stack and heap, virtual memory
- low-memory | When memory runs out | out of memory, killing processes, how phones free memory
- ipc | Processes talking | inter-process communication, how phone apps talk to the system
- files | Files and storage | file system, paths, permissions
- power | Power and battery | sleep states, wake locks, why apps get limited

### net: Computer networks
- what-network | What a network is | network, packet, client and server
- ip | Addresses and routing | IP address, router, hops
- dns | Names to addresses | DNS lookup, caching
- tcp-udp | TCP and UDP | reliable vs fast, connection, ports
- http | HTTP | request, response, methods, status codes, headers
- tls | HTTPS and TLS | encryption, certificates, handshake
- http-versions | HTTP/1.1, 2 and 3 | multiplexing, QUIC
- latency | Latency and bandwidth | latency vs bandwidth, why round trips matter on mobile
- debugging | Seeing network traffic | inspecting requests, proxies, common failures

### db: Databases
- what-db | What a database is | table, row, column, why not a text file
- sql-select | Reading data with SQL | SELECT, WHERE, ORDER BY, LIMIT
- sql-write | Changing data with SQL | INSERT, UPDATE, DELETE
- keys | Keys and relations | primary key, foreign key
- joins | Joining tables | JOIN, combining rows
- normalization | Designing tables | duplication problems, normal forms in plain words
- indexes | Indexes | index, why lookups get fast, cost on writes
- transactions | Transactions | all-or-nothing, ACID in plain words
- nosql | Other kinds of databases | key-value, document stores, trade-offs
- schema-evolution | Changing a schema | migrations, compatibility

### concurrency: Concurrency (the os track is optional, so briefly re-explain process and thread where needed)
- concurrency-parallelism | Concurrency and parallelism | interleaving vs parallel
- race-conditions | Race conditions | shared state, lost updates
- locks | Locks | mutual exclusion, critical section
- deadlock | Deadlock | waiting in a circle, lock ordering
- memory-visibility | Memory visibility | caches, volatile
- lock-free-tools | Safer tools | atomics, immutable data, confinement

### sweng: Software engineering
- sdlc | How software gets built | requirements, design, build, test, release
- agile | Working in iterations | sprints, backlog, stand-ups
- estimation | Estimating work | uncertainty, breaking work down
- design-doc | Design documents | writing a proposal, trade-offs
- code-review | Code review | giving and receiving review
- tech-debt | Technical debt | shortcuts, paying back
- teamwork | Working in a team | communication, ownership

### cs: Data structures and algorithms (optional; assume Stage 1 only. Each lesson names the matching Kotlin type)
- big-o | How fast is it? | Big O in plain words
- arrays-lists | Arrays and lists | index access, inserting (List, ArrayList)
- hashing | Hash maps | hashing, collisions (HashMap, mapOf)
- sets | Sets | membership, no duplicates (HashSet, setOf)
- stacks-queues | Stacks and queues | LIFO, FIFO (ArrayDeque)
- recursion | Recursion | a function calling itself, base case
- two-pointers | Two pointers | technique
- binary-search | Binary search | halving
- sorting | Sorting | how sorts work (sorted, sortedBy)
- trees | Trees | binary trees, traversal
- heaps | Heaps and priority queues | smallest first (PriorityQueue)
- graphs | Graphs | BFS, DFS
- dp | Dynamic programming | remembering answers
- method | Solving a problem step by step | a method

---

## Stage 3: Think in objects (assume Stage 1)

### oop: Object-oriented programming
- objects | Objects model things | state and behaviour, real-world modelling
- identity | Same object or equal object | == vs ===, references
- encapsulation | Encapsulation | invariants, keeping data valid
- composition | Composition | has-a, building from parts
- inheritance | Inheritance, carefully | is-a, fragile base class
- composition-vs-inheritance | Choosing between them | trade-offs
- polymorphism | Polymorphism | one call, many behaviours, dynamic dispatch
- abstraction | Abstraction | hiding detail behind a simple surface
- interface-or-abstract | Interface or abstract class | when to use which
- delegation | Delegation in design | forwarding to a helper
- cohesion-coupling | Cohesion and coupling | what makes code easy to change
- domain-modeling | Modelling a domain | turning a problem into types

### solid: SOLID
- srp | Single responsibility | one reason to change
- open-closed | Open/closed | extend without editing
- liskov | Liskov substitution | subtypes must keep promises
- isp | Interface segregation | small interfaces
- dip | Dependency inversion | depend on abstractions, passing dependencies in

### patterns: Design patterns
- what-patterns | What a design pattern is | named solutions, when not to use one
- singleton | Singleton | one instance, object, dangers
- factory | Factory | creating objects behind a function
- builder | Builder | step-by-step construction, apply as Kotlin's builder
- observer | Observer | listeners, subscribe and notify
- strategy | Strategy | swapping behaviour
- adapter | Adapter | fitting one interface to another
- decorator | Decorator | wrapping to add behaviour
- facade | Facade | one simple entry point
- state-machine | State machine | states, events, transitions

### capkotlin: Project: a budget tracker in Kotlin (project)
- plan | What we'll build | requirements, breaking into steps
- model | The data model | data classes, enums for the budget
- input | Reading input | parsing lines, handling bad input
- reports | Reports | collection operations for totals
- storage | Saving to a file | writing and reading text
- rules | Budget rules | sealed results, validation
- tests | Testing it | writing small checks
- recap | Putting it together | full program, what's next

---

## Stage 4: Your first app (assume Stages 1 and 3)

### android: Android basics
- what-android | What Android is | OS for phones, apps, Google Play, versions
- studio | Installing Android Studio | IDE, SDK, emulator
- first-app | Your first app | new project, run on emulator, project structure
- project-files | What's in a project | manifest, Kotlin files, res, Gradle files (just names)
- activity | Activities | Activity as a screen, onCreate, setContent
- lifecycle | The activity lifecycle | created, started, resumed and the callbacks
- config-changes | Rotation and configuration changes | recreation, losing state
- resources | Resources | strings, colors, drawables, R
- localization | Other languages | values-xx folders, plurals, locale bugs (Turkish i)
- context | Context | what Context is, Activity vs Application context
- intents | Intents | starting another screen, implicit intents (share, open link)
- permissions | Permissions | runtime permissions, asking at the right moment
- manifest | The manifest in depth | components, package visibility
- backstack | The back stack and tasks | back navigation, tasks, launch modes
- predictive-back | Predictive back | back gesture, handling back in code

### compose: Jetpack Compose
- what-compose | What Compose is | declarative UI, @Composable, preview
- text-and-modifiers | Text and modifiers | Text, Modifier, padding, size
- layouts | Arranging things | Column, Row, Box, alignment, spacing
- images | Images and icons | Image, painterResource, Icon
- buttons | Buttons and clicks | Button, onClick
- state | State | remember, mutableStateOf, recomposition
- recomposition | How Compose redraws | recomposition, what triggers it
- hoisting | State hoisting | stateless composables, passing state and events
- saveable | Surviving rotation | rememberSaveable
- text-input | Text fields | TextField, input state
- lists | Lists | LazyColumn, items
- lazy-keys | Keys in lists | keys, stable identity
- scaffold | Screen structure | Scaffold, top bar, FAB
- theming | Theming | MaterialTheme, colors, typography, dark mode
- overlays | Dialogs and sheets | AlertDialog, bottom sheet
- gestures | Gestures | clickable, drag, swipe
- effects | Side effects | LaunchedEffect
- disposable-effect | Cleaning up | DisposableEffect
- snapshot-flow | Watching state over time | snapshotFlow
- navigation | Moving between screens | Navigation Compose basics

### tools: Developer tools
- studio-tour | A tour of Android Studio | panels, shortcuts
- logcat | Logcat | Log, filtering, reading crashes
- debugger | The debugger | breakpoints, stepping, watching values
- layout-inspector | Layout Inspector | inspecting the UI tree
- adb | adb | install, shell, logcat from the terminal
- lint | Lint | warnings, fixing, baselines
- ci | Continuous integration | automated builds and checks

### views: Views (optional)
- xml | XML layouts | layout files, inflating, view binding
- passes | Measure, layout, draw | the three passes
- recycler | RecyclerView | adapter, view holder
- view-types | Many item types | view types
- diff | Efficient updates | DiffUtil, ListAdapter
- fragments | Fragments | fragment lifecycle, view lifecycle
- viewpager | Paging screens | ViewPager2
- compose-in-views | Mixing Compose and Views | ComposeView, AndroidView

### runtime: How code runs (optional, end of Stage 4: explains what happens inside an Android app)
- source-to-machine | From source to machine code | compiler, interpreter, bytecode, VM
- kotlin-compile | How Kotlin compiles | kotlinc, .class files, what a getter compiles to
- dex | DEX files | d8, dex, multidex
- art | Android Runtime | ART, AOT and JIT, profiles
- gc | Garbage collection | reachability, mark and sweep
- references | Strong and weak references | WeakReference, when it helps
- startup | What happens at app start | process start, Application, first frame

---

## Stage 5: Async and data (assume Stages 1, 3, 4)

### coroutines: Coroutines
- why-async | Why apps must not wait | main thread, frozen UI, ANR in plain words
- basics | Your first coroutine | suspend, launch, delay
- structured | Structured concurrency | scopes, parent and child, coroutineScope
- async | Doing things at the same time | async, await
- dispatchers | Which thread runs it | Dispatchers.Main, IO, Default, withContext
- cancellation | Cancelling work | cancel, cooperative cancellation, timeouts
- exceptions | Errors in coroutines | try/catch, propagation, SupervisorJob
- shared-state | Shared state | Mutex, confinement
- channels | Channels | send/receive between coroutines

### flow: Flow
- cold | A stream of values | Flow, flow { emit }, collect, cold
- operators | Transforming flows | map, filter, onEach
- flatmap | Flows of flows | flatMapLatest and friends
- errors-retry | Errors and retries | catch, retry
- backpressure | Fast producers | buffer, conflate, collectLatest
- hot | Hot flows | StateFlow, SharedFlow
- statein-sharein | Sharing a flow | stateIn, shareIn
- lifecycle | Collecting safely in UI | collectAsStateWithLifecycle, repeatOnLifecycle
- callbackflow | Wrapping callbacks | callbackFlow
- suspend-callback | One-shot callbacks | suspendCancellableCoroutine

### data: Data
- choose | Where to keep data | options: preferences, files, database, network
- datastore | Small settings | DataStore
- room | A local database | what a table, a primary key and a query are (briefly, the db track is optional), Room, entity, DAO
- room-setup | Opening the database | @Database, one instance with Room.databaseBuilder, Gradle setup (KSP, Room plugin, saved schemas)
- room-flow | Live queries | Room with Flow
- relations | Related tables in Room | relations
- migrations | Changing the database | Room migrations
- files | Files | app storage, reading and writing
- share-files | Sharing files | FileProvider
- http-basics | Talking to a server | what a server, an HTTP request and JSON are (briefly, the net track is optional), kotlinx.serialization
- retrofit | Calling a server with Retrofit | Retrofit interface, base URL, JSON converter, INTERNET permission
- net | Requests and errors | handling HTTP and IO errors
- auth | Signing in | tokens, refresh, secure storage
- caching | Caching | offline first, cache invalidation
- paging | Loading in pages | Paging 3
- realtime | Live updates | WebSockets, server-sent events

---

## Stage 6: Architecture (assume Stages 1, 3, 4, 5)

### arch: Architecture
- why-architecture | Why structure matters | code that grows, separation
- viewmodel | ViewModel | surviving rotation, viewModelScope
- ui-state | UI state | one state object, StateFlow
- udf | Unidirectional data flow | events up, state down
- layers | Layers | UI, domain, data
- repository | Repositories | one source for data
- ssot | Single source of truth | offline first data flow
- usecases | Use cases | when a domain layer helps
- ui-state-patterns | Loading, error, empty | modelling screen states
- mvvm-mvi | MVVM and MVI | the two styles compared
- di | Dependency injection | passing dependencies, why
- hilt | Hilt | @HiltAndroidApp, @AndroidEntryPoint, @Inject constructor, hiltViewModel
- hilt-modules | Hilt modules | @Module, @Provides, @InstallIn, @ApplicationContext
- hilt-scopes | Scopes in Hilt | Singleton, ViewModelScoped
- modularization-arch | Modules | feature and core modules
- clean | Clean architecture | dependency rule

### capapp: Project: a news reader app (project)
- setup | Project setup | dependencies, version catalog
- screens | Screens and navigation | list and detail
- viewmodel | ViewModel and state | UI state
- network | Loading from the network | Retrofit
- cache | Offline cache | Room as source of truth
- hilt | Wiring with Hilt | modules
- states | Loading and errors | state handling
- recap | Putting it together | review

---

## Stage 7: Quality (assume Stages 1, 3–6)

### testing: Testing
- why-test | Why we test | confidence, regressions
- unit | Unit tests | JUnit, assertions
- pyramid | The testing pyramid | unit, integration, UI
- fakes | Test doubles | fakes vs mocks
- mockk | MockK | mocking, verifying
- coroutines | Testing coroutines | runTest, test dispatchers
- flows | Testing flows | Turbine
- robolectric | Robolectric | JVM tests for Android
- compose-ui | Compose UI tests | semantics, finders, actions
- screenshots | Screenshot tests | golden images
- hilt-testing | Hilt in tests | test modules
- baseline | Baseline profiles | startup performance testing

### perf: Performance
- frame | Frames and jank | 60/120 Hz, frame budget
- main-thread | The main thread | blocking work
- anr | ANRs | what triggers them
- leaks | Memory leaks | leaks, LeakCanary
- profiler | Profiling | CPU and memory profiler
- compose-perf | Compose performance | stability, skipping
- startup | Startup time | cold start, lazy init
- r8 | Shrinking with R8 | build types, R8, signed release build, mapping.txt
- keep-rules | Keep rules | code found by name, ClassNotFoundException, keep rules

### a11y: Accessibility
- why | Why accessibility | who it helps
- semantics | Semantics | content descriptions, roles
- custom-actions | Custom actions | TalkBack actions
- targets | Touch targets | sizes
- keyboard-nav | Keyboard navigation | focus
- text-scale | Large text | sp, scaling
- window-size | Window sizes | window size classes
- foldables | Foldables | postures
- resizability | Resizable apps | orientation, large screens
- insets | Edge to edge | window insets

### compose2: Compose in depth (optional)
- stability | Stability | stable types
- derived | derivedStateOf | avoiding extra work
- phases | Compose phases | composition, layout, drawing
- drawing | Drawing | Canvas
- locals | CompositionLocal | implicit values
- animation | Animation | animate*AsState, AnimatedVisibility
- shared-elements | Shared elements | transitions
- layout | Custom layouts | Layout composable
- navigation | Navigation in depth | arguments, nested graphs
- nav3 | Navigation 3 | back stack as state

### capquality: Project: quality pass (project)
- unit-tests | Unit tests | testing the ViewModel
- turbine | Flow tests | Turbine
- ui-tests | UI tests | Compose tests
- recomposition | Fixing recomposition | stability
- leak | Fixing a leak | LeakCanary
- a11y-pass | Accessibility pass | semantics
- adaptive | Adaptive layout | window sizes
- startup | Faster startup | baseline profile
- recap | Review | quality gates

---

## Stage 8: Platform features (assume Stages 1, 3–7)

### push: Notifications and push
- notifications | Showing a notification | NotificationCompat, permission
- channels | Notification channels | importance
- styles | Rich notifications | styles, actions
- fcm | Firebase Cloud Messaging | what FCM is, Firebase setup with the BoM, FirebaseMessagingService, receiving a message
- fcm-registration | Registering with FCM | installation ID, onRegistered, register() at every start, app-wide scope, sign-out
- messages | Message types | notification vs data messages
- deeplinks | Deep links | opening a screen from a link (Recipes gets a detail screen with Navigation)
- app-links | App Links | verified links

### background: Background work
- why-limits | Why Android limits background work | battery, Doze
- workmanager | WorkManager | reliable background tasks: worker, request, constraints, unique periodic work
- workmanager-hilt | WorkManager with Hilt | @HiltWorker, @AssistedInject, HiltWorkerFactory, switching off the default set-up
- fgs | Foreground services | long visible work
- receivers | Broadcast receivers | system events
- alarms | Alarms | exact alarms

### security: Security
- threats | Threats | what attackers want
- at-rest | Data at rest | encryption
- keystore | Keystore | keys in hardware
- network | Network security | TLS, pinning
- secrets | API keys and secrets | what can't be hidden
- credential-manager | Signing in | Credential Manager, passkeys
- biometric | Biometrics | BiometricPrompt
- privacy | Privacy | data minimization, permissions

### media: Media and sensors (optional)
- exoplayer | Playing video | Media3 ExoPlayer
- session | Media sessions | MediaSession
- audiofocus | Audio focus | ducking
- camerax | Camera | CameraX
- video-capture | Recording video | VideoCapture
- analysis | Image analysis | ImageAnalysis
- sensors | Sensors | SensorManager
- location | Location | fused location

---

## Stage 9: Ship it (assume Stages 1, 3–8)

### build: Build and release
- gradle | Gradle | tasks, builds, caching
- catalogs | Version catalogs | libs.versions.toml
- api-levels | API levels | minSdk, targetSdk, compileSdk
- variants | Build variants | debug, release, flavors
- modules | Gradle modules | multi-module builds
- signing | Signing | keys, Play App Signing
- bundles | App bundles | AAB
- tracks | Release tracks | internal, closed, open, production

### launch: Launch and grow
- crashes | Crash reporting | Crashlytics
- analytics | Analytics | events
- flags | Feature flags | Remote Config
- updates | In-app updates | update flows
- review | In-app review | review API
- billing | Payments | Play Billing: products, BillingClient connection, showing the price, launchBillingFlow
- purchases | Handling purchases | purchase result, server verification, acknowledge within 3 days, queryPurchasesAsync (QueryPurchasesParams) after connect and in onResume
- policy | Play policies | staying compliant

### capship: Project: ship it (project)
- channels | Notification channels | setup
- tokens | FCM tokens | registration
- messages | Handling messages | data messages
- deeplink | Deep link to content | navigation
- sync | Background sync | WorkManager
- harden | Hardening | security pass
- release-build | Release build | R8, signing
- ship | Shipping | Play Console

### kmp: Kotlin Multiplatform (optional)
- what-kmp | What KMP is | shared code, targets
- shares | What to share | common, platform code
- expect | expect and actual | platform APIs
- data | Shared networking with Ktor | HttpClient, engine per platform, kotlinx.io IOException
- local-db | Room in shared code | Room 3 KMP with BundledSQLiteDriver (Google's KMP guide); SQLDelight and DataStore KMP named in one sentence
- viewmodels | Shared ViewModels | lifecycle
- compose-mp | Compose Multiplatform | shared UI
- swift | Calling from Swift | interop

---

## Stage 10: Beyond the app (assume Stages 1, 3–9; net and db from Stage 2 are optional, so explain what is needed in plain sentences)

### sysdesign: System design (server and scale side; the data track already taught the app side of caching, offline, real-time and paging: recap, don't repeat)
- approach | How to approach a system design | requirements, estimates, components
- api | Designing an API | resources, versioning
- pagination | Pagination on the server | cursors vs offsets
- caching | Caching on the server | layers of cache, CDN
- offline | Sync and conflicts | the server side of offline first
- realtime | Real-time at scale | WebSockets, polling, connections
- push-scale | Push at scale | fan-out
- media | Media at scale | CDNs, upload
- reliability | Reliability | retries, idempotency
- news-feed | Design: news feed | end-to-end
- chat | Design: chat app | end-to-end

### backend: Backend basics (optional)
- what | What a backend does | server, API, database
- http | HTTP on the server | routes, handlers
- ktor | A server in Kotlin | Ktor
- rest | REST APIs | resources, status codes
- sql | Using a database | queries from code
- passwords | Storing passwords | signup, Argon2id hashes, the login check
- tokens | Tokens | JWT access token, authenticate, refresh tokens used once, logout
- testing | Testing a server | test client
- deploy | Deploying | containers, hosting
- client | Connecting your app | the Android client

### cloud: Cloud (optional)
- what-cloud | What the cloud is | servers you rent
- docker | Containers | Docker
- pipelines | Pipelines | CI/CD
- secrets | Secrets | secret managers
- baas | Backend as a service | Firebase and friends
- observability | Observability | logs, metrics, traces
- scaling | Scaling | horizontal, vertical

---

## Stage 11: Building with AI (assume Stages 1, 3–10; backend/cloud optional. No brand-led lessons: tool names at most once, neutrally)

### aidev: Working with AI tools
- what-agents | What AI coding tools are | assistants vs agents, how they work in plain words
- limits | Where AI goes wrong | made-up APIs, outdated versions, confident mistakes
- context | Giving good context | clear small tasks, project instruction files
- review | Reviewing AI code | a checklist from testing, perf, a11y, security
- tests-first | Tests as a safety net | write the test, then let the agent change code
- agents | Agents that run tasks | multi-step tasks, permissions, refactors, CI fixes
- tools | Connecting tools | MCP in plain words
- safety | Security, privacy and licences | secrets, private code, licences
- workflow | A day with an agent | plan, small diffs, commits, review

### aiapps: AI features in apps
- what | What an AI feature is | models, prompts, tokens
- server | Calling a model safely | your server holds the key
- streaming | Streaming answers | Flow into Compose
- structured | Structured output | JSON from a model, parsing, validating
- on-device | On-device models | privacy, offline
- costs | Cost and limits | tokens, rate limits, caching
- failures | When the model is wrong | checks, UI for uncertainty, safety
- evals | Testing AI features | example sets, comparing outputs

### capai: Project: AI in the news app (project)
- agent-feature | A feature with an agent | plan, review, fix what it got wrong
- summary | Summarise an article | server call, streaming
- offline | An on-device fallback | on-device model
- recap | Review | what to keep checking

---

## Stage 12: Show your work (assume everything required before)

### portfolio: Show your work
- repo | A repository others can read | README, structure
- ci | CI that proves it works | tests on every push
- publish | Publishing your app | store listing, screenshots
- explain | Explaining your decisions | write-ups, trade-offs
- keep-learning | Keep learning | docs, changelogs, release notes
