/* Cloud track (optional). Same shape as tracks/kotlin.js.
   Where the Recipes server runs: rented machines, Docker images, a delivery pipeline, secrets, a ready-made backend,
   logs/metrics/traces and scaling. Facts were checked in October 2026 against docs.docker.com, docs.github.com,
   github.com (action versions), firebase.google.com, opentelemetry.io, ktor.io and kubernetes.io.
   Docker, curl and git outputs come from real runs (Docker 29.8 with a locally built Java 21 base image). Image
   digests and build times are shown as examples and labelled so; server start-up lines show Ktor's text, shortened. Numbers about traffic are example numbers and are labelled so.
   Demos use the visual kit (Lab.ui); this track adds no CSS classes of its own (prefix cl- if you add some). */
(() => {
  // Terminal output is HTML: escape tool output before showing it.
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // A file shown in a terminal side panel.
  const file = s => '<pre class="ui-out" style="white-space: pre-wrap; overflow-wrap: anywhere">' + esc(s) + '</pre>';

  Lab.addTrack({
    id: 'cloud',
    title: 'Cloud',
    description: 'Where your app’s server runs: rented machines, Docker images, delivery pipelines, secrets, ready-made backends, monitoring and scaling.',
    requires: ['tools', 'sysdesign'],
    css: '',
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'what-cloud',
        title: 'What the cloud is',
        tagline: 'Computers you rent, in a place you pick, so your server keeps running when your laptop sleeps.',
        goals: ['Say what renting a server in the cloud means', 'Pick a region and a managed database for a small server', 'Check from the terminal that a server answers, with <code>curl</code>'],
        level: 'beginner', introduces: ['curl', 'localhost'],
        body: `
<p>For the first tests, Mei ran the Recipes server on her laptop: the Kotlin program that answers the app’s requests with JSON, as in <a href="#data.http-basics">Talking to a server</a>, together with its database. It works until she closes the lid at night. Then every app that asks for new recipes gets an error. A real server has to run day and night, on a fast connection, and keep the data safe when a disk breaks.</p>
<p><em>The cloud</em> means computers you rent from a provider, in its <em>data centers</em>: buildings full of servers, with power, cooling and fast connections. The simplest thing to rent is a <em>virtual machine</em> (VM): a computer made in software on one of the provider’s big machines. You choose how many processors (CPUs) and how much memory it has, and you pay for every hour it is switched on, used or not. You also choose a <em>region</em>, the area where its data center is, such as Frankfurt. Choose one near your users: every request has less distance to travel.</p>
<p>A provider can also run whole parts for you. That is a <em>managed service</em>. With a managed database, the provider installs the database, keeps it updated and makes backups; you get an address and a password. Less work for you, a little less control. A common start: your own server on a VM, the data in a managed database in the same region.</p>
<p>To check that a server answers, use <code>curl</code>, a terminal tool that sends one request and prints the answer. The app’s requests go to <code>https://recipes.example.com/v1/</code>, as in <a href="#sysdesign.api">Designing an API</a>, so the recipe list is <code>/v1/recipes</code>. The server also has an address just for checks, <code>/health</code>, which answers <code>ok</code> while it runs; the app never calls it, so it needs no <code>v1/</code>. With <code>-i</code>, curl also prints the status line, such as <code>HTTP/1.1 200 OK</code>, and the headers. On your own computer, the server’s address is <code>localhost</code>, which means “this computer”, and a number after it, such as <code>localhost:8080</code>, is the <em>port</em>: a numbered door on a computer where a server waits for requests.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 280,
            nodes: [
              { id: 'apps', label: 'Recipes app<small>on many phones</small>', x: 20, y: 16 },
              { id: 'laptop', label: 'Mei’s laptop<small>server and database</small>', x: 76, y: 16 },
              { id: 'vm', label: 'Rented VM<small>Frankfurt region</small>', x: 76, y: 54, tone: 'ok', hidden: true },
              { id: 'db', label: 'Managed database<small>Frankfurt region</small>', x: 76, y: 88, tone: 'ok', hidden: true },
            ],
            predict: {
              q: 'At 23:00 Mei closes her laptop, where the Recipes server runs. What do the apps get when they ask for new recipes?',
              options: ['No answer: their requests fail', 'The answers, only slower', 'The answers: the server keeps running on the internet'],
              a: 0,
              why: 'A closed laptop goes to sleep: its programs stop and it leaves the network. Nothing is left to answer at that address.',
            },
            frames: [
              { add: [['apps', 'laptop', 'GET v1/recipes', 'ok']], say: 'During the first tests, <code>recipes.example.com</code> leads to Mei’s laptop. The Recipes server and its database both run there.' },
              { add: [['apps', 'laptop', 'no answer', 'err']], gone: ['laptop'], say: '23:00: Mei closes the lid. Every request fails. The apps still show the recipes they saved, as in <a href="#data.caching">Caching</a>, but nothing new arrives.' },
              { show: ['vm'], remove: [['apps', 'laptop']], add: [['apps', 'vm', 'GET v1/recipes', 'ok']], say: 'Mei rents a VM in the Frankfurt region, starts the server on it, and makes the address lead there. It runs all night, and she pays for every hour it is on.' },
              { hl: ['vm'], say: 'The database still runs on the VM, so Mei has to install its updates and make backups herself. If the VM’s disk breaks, the recipes are gone.' },
              { show: ['db'], add: [['vm', 'db', 'queries', 'ok']], say: 'She moves the data to a managed database. The provider installs it, updates it and backs it up. Mei’s server only needs its address and a password.' },
              { hl: ['vm', 'db'], say: 'Both are in the Frankfurt region: near most Recipes users in Lisbon, Oslo and Berlin, and near each other, so every query is quick.' },
              { say: 'The server is rented, not bought: Mei can choose a bigger VM later, or switch it off when it isn’t needed. The bill counts the hours it runs, not the requests.' },
            ],
          });
        },
        code: `# Terminal: is the server up? curl sends one GET request and prints the answer
curl https://recipes.example.com/health
# ok

# On Mei's laptop. localhost means "this computer"; 8080 is the port,
# the numbered door where the server waits for requests.
# -i also prints the status line and the headers (shortened here: only two of them).
curl -i http://localhost:8080/v1/recipes
# HTTP/1.1 200 OK
# Content-Type: application/json; charset=UTF-8
#
# [{"id":1,"title":"Pancakes","minutes":15},{"id":42,"title":"Tomato soup","minutes":25}]

# After Mei stops the server, nothing answers:
curl http://localhost:8080/health
# curl: (7) Failed to connect to localhost port 8080 after 0 ms: Couldn't connect to server`,
        remember: 'The cloud is computers you rent: a VM in a region near your users for your server, a managed database for your data, paid for while they run.',
        terms: [
          { term: 'the cloud', def: 'Computers you rent from a provider, in its data centers, instead of buying and running your own.' },
          { term: 'virtual machine (VM)', def: 'A computer made in software on one of the provider’s big machines. You choose its size and pay for every hour it is switched on.' },
          { term: 'region', def: 'The area where a provider’s data center is, such as Frankfurt. Choose one close to your users.' },
          { term: 'managed service', def: 'A part the provider runs for you, such as a database it installs, updates and backs up. You get an address and a password.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Check from the terminal that the Recipes server answers.', code: `[[curl]] https://recipes.example.com/health
# ok`, why: '<code>curl</code> sends one request to the address and prints the answer. The server’s <code>/health</code> address answers <code>ok</code> while it runs.' },
          { type: 'bug', prompt: 'Mei wrote down her plan. Most Recipes users live in Lisbon, Oslo and Berlin. Tap the line that makes every request travel further than it needs to.', code: `Recipes server plan
server:   a VM with 2 CPUs and 4 GB of memory
region:   Sydney
database: managed, in the same region as the server`, bug: 2, fix: 'region:   Frankfurt', why: 'Every request goes to the data center and back. A region in Europe keeps that trip short for users in Europe.' },
        ],
        quiz: [
          { q: 'Mei’s VM is switched on all month, but Recipes is mostly used in the evenings. What does she pay for?', options: ['Every hour it is switched on', 'Only the hours with requests', 'Nothing until it gets busy'], a: 0, why: 'A VM is billed while it is on, used or not. Switching it off, or choosing a smaller one, is what saves money.' },
          { q: 'What does a managed database give Mei?', options: ['The provider installs, updates and backs it up; she gets an address and a password', 'A database inside the app on each phone', 'A VM on which she installs the database herself'], a: 0, why: 'A managed service is a part the provider runs for you. The server connects to it with its address and password.' },
          { q: '<code>curl http://localhost:8080/health</code> prints <code>Failed to connect to localhost port 8080</code>. What does that mean?', options: ['Nothing on this computer answers at port 8080: the server isn’t running there', 'The server answered with an error page', 'The internet connection is down'], a: 0, why: '<code>localhost</code> is this computer. “Failed to connect” means no program answered there at all.' },
        ],
        docs: [['The NIST Definition of Cloud Computing', 'https://csrc.nist.gov/pubs/sp/800/145/final'], ['curl manual', 'https://curl.se/docs/manpage.html']],
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'docker',
        title: 'Containers with Docker',
        tagline: 'Pack the server with Java and everything else it needs, so it runs the same on every machine.',
        goals: ['Read a short Dockerfile line by line', 'Build an image and start a container from it', 'Connect a port with <code>-p</code> so you can reach the server'],
        level: 'beginner', introduces: ['docker', 'FROM', 'WORKDIR', 'COPY', 'EXPOSE', 'CMD', 'buildFatJar'],
        body: `
<p>Gradle builds the whole Recipes server into one file, <code>recipes-server-all.jar</code>, with every library inside. A <em>JAR</em> is a Java program packed into one file; a <em>fat JAR</em> also holds every library it uses. (The server uses Ktor, a Kotlin library for servers, and Ktor’s Gradle task <code>buildFatJar</code> makes the file.) <code>java -jar recipes-server-all.jar</code> starts it. Mei copies the file to the VM, and it won’t start: the VM has an older Java than her laptop. She fixes that, and a month later Kofi sets up a second VM and forgets the same step. Each machine had to be prepared by hand.</p>
<p><em>Docker</em> packs the server together with what it needs. An <em>image</em> is that package: the basic files of an operating system, Java, the server’s JAR and the command that starts it. A <em>container</em> is one running copy of an image, kept apart from the other programs on the machine. Every computer with Docker runs an image the same way: Mei’s laptop, the VM, a CI machine. It is a little like an APK: built once, installed on many phones.</p>
<p>A <em>Dockerfile</em> describes the image, one instruction per line. <code>FROM</code> starts from an existing image: <code>eclipse-temurin:21-jre</code> already has Java 21, and the part after <code>:</code> is its <em>tag</em>, which picks a version. <code>WORKDIR</code> sets the folder inside the image, <code>COPY</code> copies a file from your project into it, and <code>CMD</code> is the command a container runs when it starts, written as a list in <code>[ ]</code> with double quotes. A line that starts with <code>#</code> is a comment.</p>
<p><code>docker build -t recipes-server .</code> builds the image from the Dockerfile in this folder (the dot) and names it (<code>-t</code>). <code>docker run recipes-server</code> starts a container. A server waits for requests at a port, the numbered door from <a href="#cloud.what-cloud">the last lesson</a>; Recipes uses 8080. A container has its own ports, so <code>-p 8080:8080</code> connects port 8080 of your computer to port 8080 of the container. <code>EXPOSE 8080</code> in the Dockerfile only notes which port the server uses; it connects nothing.</p>`,
        visual(el) {
          const dockerfile = `FROM eclipse-temurin:21-jre
WORKDIR /app
COPY build/libs/recipes-server-all.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]`;
          const noConnect = "curl: (7) Failed to connect to localhost port 8080 after 0 ms: Couldn't connect to server";
          Lab.ui.terminal(el, {
            panelTitle: 'Dockerfile',
            predict: {
              q: 'Mei starts the server with <code>docker run recipes-server</code>, without <code>-p</code>. Then she runs <code>curl http://localhost:8080/health</code> on her laptop. What does she get?',
              options: ['<code>ok</code>: the Dockerfile says <code>EXPOSE 8080</code>', 'Failed to connect: nothing connects her laptop’s port 8080 to the container', 'The JSON list of recipes'],
              a: 1,
              why: 'The server listens on port 8080 inside the container. <code>EXPOSE</code> only notes that; <code>-p 8080:8080</code> is what connects a port of the laptop to it.',
            },
            frames: [
              { panel: file(dockerfile), say: 'Mei’s server project. <code>./gradlew buildFatJar</code> has built <code>build/libs/recipes-server-all.jar</code>, and the Dockerfile (right) is in the top folder.' },
              { cmd: 'docker build -t recipes-server .', out: esc(`[+] Building 1.5s (8/8) FINISHED                                 docker:default
 => [1/3] FROM docker.io/library/eclipse-temurin:21-jre@sha256:…            0.7s
 => [2/3] WORKDIR /app                                                     0.1s
 => [3/3] COPY build/libs/recipes-server-all.jar app.jar                   0.1s
 => exporting to image                                                     0.4s
 => => naming to docker.io/library/recipes-server:latest                   0.0s`), say: 'Docker follows the instructions in order: start from the Java image, make the folder <code>/app</code>, copy the JAR in. The image is called <code>recipes-server</code>. (Output shortened: Docker prints more lines. Your digest after <code>sha256:</code> and your times will differ. The first build also downloads the Java image, which takes longer.)' },
              { cmd: 'docker run recipes-server', out: '… Responding at http://0.0.0.0:8080', say: 'A container starts from the image and runs <code>CMD</code>: <code>java -jar app.jar</code>. Ktor’s start-up line says the server waits on port 8080 (shortened: the real line starts with the time). Mei’s own Java version doesn’t matter: Java 21 is inside the image.' },
              { cmd: 'curl http://localhost:8080/health', out: esc(noConnect), say: 'In a second terminal window, curl can’t connect. The server listens on port 8080 of the <em>container</em>, and nothing connects the laptop’s port 8080 to it.' },
              { cmd: 'docker run -p 8080:8080 recipes-server', out: '… Responding at http://0.0.0.0:8080', say: 'Mei stops the container with Ctrl+C in the first window and starts a new one with <code>-p 8080:8080</code>: the laptop’s port 8080 now leads to the container’s port 8080.' },
              { cmd: 'curl http://localhost:8080/health', out: 'ok', say: 'Now the request reaches the server inside the container.' },
              { cmd: 'curl http://localhost:8080/v1/recipes', out: esc('[{"id":1,"title":"Pancakes","minutes":15},{"id":42,"title":"Tomato soup","minutes":25}]'), say: 'The same answer as when Mei ran the JAR herself.' },
              { say: 'On the VM, the same image and the same <code>docker run -p 8080:8080 recipes-server</code> give the same server. The VM only needs Docker; Java travels inside the image.' },
            ],
          });
        },
        code: `# Dockerfile, in the top folder of the server project
# Start from an image that already has Java 21
FROM eclipse-temurin:21-jre
# Work in the folder /app inside the image
WORKDIR /app
# Copy the server, built by Gradle, into the image
COPY build/libs/recipes-server-all.jar app.jar
# The server listens on port 8080
EXPOSE 8080
# The command a container runs when it starts
CMD ["java", "-jar", "app.jar"]

# Terminal, in the same folder
./gradlew buildFatJar                    # the server and every library in one file: build/libs/recipes-server-all.jar
docker build -t recipes-server .         # build an image called recipes-server from the Dockerfile here (.)
docker run -p 8080:8080 recipes-server   # start a container; this computer's port 8080 leads to the container's 8080
# … Responding at http://0.0.0.0:8080      (Ktor's start-up line, shortened: it starts with the time)`,
        remember: 'A Dockerfile describes an image: FROM, WORKDIR, COPY, CMD. docker build makes it, docker run starts a container, and -p connects a port.',
        mistakes: [
          { title: 'A comment after an instruction', bad: `EXPOSE 8080   # the server's port`, good: `# the server's port
EXPOSE 8080`, why: 'In a Dockerfile, <code>#</code> starts a comment only at the beginning of a line. Anywhere else it is part of the instruction, so this build stops with <code>ERROR: failed to build: failed to solve: invalid containerPort: #</code>.' },
        ],
        terms: [
          { term: 'image', def: 'A package with everything a program needs to run: basic system files, Java, your JAR and the start command. <code>docker build</code> makes one from a Dockerfile.' },
          { term: 'container', def: 'One running copy of an image, kept apart from the other programs on the machine. <code>docker run</code> starts one.' },
          { term: 'Dockerfile', def: 'A text file of instructions for building an image: <code>FROM</code>, <code>WORKDIR</code>, <code>COPY</code>, <code>EXPOSE</code>, <code>CMD</code>.' },
          { term: 'port', def: 'A numbered door on a computer where a server waits for requests, such as 8080. <code>-p 8080:8080</code> connects a port of your computer to one of the container.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start a container so that <code>curl http://localhost:8080/health</code> on this computer reaches the server.', code: `docker run [[-p]] 8080:8080 recipes-server`, why: '<code>-p 8080:8080</code> connects port 8080 of this computer to port 8080 of the container. Without it, nothing outside the container reaches the server.' },
          { type: 'bug', prompt: '<code>docker build</code> stops with an error that ends in <code>"/recipes-server-all.jar": not found</code>. Gradle puts the JAR in <code>build/libs</code>. Tap the line.', code: `FROM eclipse-temurin:21-jre
WORKDIR /app
COPY recipes-server-all.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]`, bug: 2, fix: 'COPY build/libs/recipes-server-all.jar app.jar', why: '<code>COPY</code> looks for the file from the folder you build in. The JAR is in <code>build/libs</code>, so the path must say so.' },
        ],
        quiz: [
          { q: 'What is the difference between an image and a container?', options: ['An image is the package; a container is one running copy of it', 'They are two words for the same thing', 'A container is the package; an image is a running copy'], a: 0, why: 'One image can start many containers, the way one APK installs on many phones.' },
          { q: 'Why does the server start on the VM now, although the VM has an old Java?', options: ['Java 21 is inside the image, so the VM’s own Java doesn’t matter', 'Docker updates the VM’s Java', 'The fat JAR contains Java'], a: 0, why: '<code>FROM eclipse-temurin:21-jre</code> puts Java 21 in the image. The VM only needs Docker.' },
          { q: 'What does <code>EXPOSE 8080</code> do?', options: ['It notes which port the server uses; it connects nothing', 'It connects port 8080 of the computer to the container', 'It starts the server on port 8080'], a: 0, why: 'Only <code>-p 8080:8080</code> on <code>docker run</code> connects a port of your computer to the container.' },
        ],
        docs: [['What is a container?', 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/'], ['Dockerfile reference', 'https://docs.docker.com/reference/dockerfile/']],
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'pipelines',
        title: 'Pipelines: CI/CD',
        tagline: 'Every change that reaches main is tested, packed into an image and delivered, without anyone typing a step.',
        goals: ['Explain what continuous delivery adds to CI', 'Read a workflow that tests the server, builds its image and uploads it to a registry', 'Go back to an earlier version by its image tag'],
        level: 'intermediate', introduces: ['permissions', 'GITHUB_TOKEN', 'secrets', 'sha', 'actor'],
        body: `
<p>Every release, Mei runs the tests, builds the JAR, builds the image, puts it on the VM and restarts the server: five steps, twenty minutes. One Friday she is in a hurry and skips the tests, and a bug reaches every user. Steps that must happen every time, in the same order, are a job for a machine.</p>
<p>In <a href="#tools.ci">Continuous integration</a> a GitHub Actions workflow checked every pull request. <em>Continuous delivery</em> (CD) goes one step further: when a change reaches <code>main</code> and passes the checks, the workflow also builds what you ship and delivers it, ready to release. When the last step also starts it on the server automatically, it is called <em>continuous deployment</em>; both are shortened to CD. The chain of steps from a push to a running server is called a <em>pipeline</em>. The Recipes server’s workflow runs <code>./gradlew test buildFatJar</code> first. If a test fails, the step fails and the steps after it don’t run, as in the CI lesson, so nothing broken is shipped.</p>
<p>The image goes to a <em>registry</em>: an online store for images, the way GitHub stores code. GitHub has one at <code>ghcr.io</code>. <code>docker/login-action</code> logs in to it, and <code>docker/build-push-action</code> runs <code>docker build</code> and then uploads the image (<em>push</em>).</p>
<p>Logging in needs a password. <code>\${{ secrets.GITHUB_TOKEN }}</code> gives it: GitHub replaces <code>\${{ }}</code> with a value before the step runs, and <code>GITHUB_TOKEN</code> is a password GitHub makes for each run. <code>permissions:</code> says what that password may do, here upload images (<code>packages: write</code>).</p>
<p>Every image gets the tag <code>\${{ github.sha }}</code>: the hash of the commit, the id <code>git log</code> shows, in its full 40-character form. So you always know which commit is running, and going back is starting the image with an earlier tag. The last link, making the cloud run the new image, depends on the provider: many can watch the registry, or a last step tells them. Recipes does this, so every change that passes the tests reaches users: continuous deployment.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'push', label: 'push', sub: 'to main' },
              { id: 'test', label: 'test', sub: 'gradlew test' },
              { id: 'image', label: 'image', sub: 'build + push' },
              { id: 'reg', label: 'ghcr.io', sub: 'one tag per commit' },
              { id: 'server', label: 'server', sub: 'runs one tag' },
            ],
            predict: {
              q: 'Two hours after a release, users find a bug in the new version. The registry still has every image, one per commit. What is the quickest way back?',
              options: ['Run the image with the previous commit’s tag', 'Rebuild the old version by hand on the VM', 'Wait for a fix: a release can’t be undone'],
              a: 0,
              why: 'The old image is still in the registry, tagged with its commit hash. Starting it again takes a minute, and nothing has to be rebuilt.',
            },
            frames: [
              { at: 'server', packet: '4de786f', mark: { server: 'ok' }, say: 'The server runs the image tagged with commit <code>4de786f…</code> (tags are shortened here; the real ones have 40 characters). Kofi merges a pull request into <code>main</code>.' },
              { at: 'push', packet: 'commit 9c1e2a7', mark: { server: '' }, say: 'The push to <code>main</code> starts <code>server.yml</code> on a fresh machine: check out, set up Java and Gradle.' },
              { at: 'test', packet: 'tests pass', tone: 'ok', mark: { push: 'ok', test: 'ok' }, say: '<code>./gradlew test buildFatJar</code>: the tests pass, then Gradle builds the fat JAR. Had a test failed, the run would stop here and nothing would be shipped.' },
              { at: 'image', packet: 'docker build', mark: { image: 'warm' }, say: 'The login step signs in to <code>ghcr.io</code> with <code>GITHUB_TOKEN</code>. Then <code>build-push-action</code> builds the image from the Dockerfile, with the new JAR inside.' },
              { at: 'reg', packet: ':9c1e2a7', tone: 'ok', mark: { image: 'ok', reg: 'ok' }, say: 'It uploads the image as <code>ghcr.io/recipes-team/recipes-server:9c1e2a7…</code>. The image for <code>4de786f…</code> stays there too.' },
              { at: 'server', packet: '9c1e2a7', tone: 'ok', mark: { server: 'ok' }, say: 'The cloud starts a container from the new tag and stops the old one: continuous deployment. Nobody typed a step, and the tests ran every time.' },
              { at: 'server', packet: 'bug!', tone: 'err', mark: { server: 'err' }, say: 'Two hours later, users report that the shopping list is empty. The tests didn’t cover that.' },
              { at: 'server', packet: '4de786f', tone: 'warm', mark: { server: 'warm' }, say: 'Mei tells the cloud to run tag <code>4de786f…</code> again. A minute later, users have the old version back, and the team fixes the bug in peace. The fix becomes the next commit, <code>e436816</code>.' },
            ],
          });
        },
        code: `# .github/workflows/server.yml, in the server's repository
name: Server CD

on:
  push:
    branches: [main]                # what was merged; pull requests get their own CI

jobs:
  deliver:
    runs-on: ubuntu-latest
    permissions:                    # what GITHUB_TOKEN may do in this job:
      contents: read                #   read the repository
      packages: write               #   upload images to ghcr.io
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-java@v6
        with:
          distribution: temurin
          java-version: 21
      - uses: gradle/actions/setup-gradle@v6
      - run: ./gradlew test buildFatJar           # tests first: if one fails, nothing is shipped
      - uses: docker/login-action@v4              # log in to the registry
        with:
          registry: ghcr.io
          username: \${{ github.actor }}           # the user who started the run
          password: \${{ secrets.GITHUB_TOKEN }}   # a password GitHub makes for this run
      - uses: docker/build-push-action@v7         # docker build, then upload the image
        with:
          context: .                              # build from the files here, with the new JAR
          push: true
          tags: ghcr.io/recipes-team/recipes-server:\${{ github.sha }}`,
        remember: 'CD: every push to main is tested, built into an image tagged with its commit hash and uploaded to a registry. Going back is running an earlier tag.',
        terms: [
          { term: 'continuous delivery, continuous deployment (CD)', def: 'After CI’s checks pass on <code>main</code>, the workflow also builds what you ship and delivers it, every time, in the same order. In continuous deployment, it also starts the new version on the server automatically.' },
          { term: 'pipeline', def: 'The chain of steps from a push to a running server: test, build, upload, run. A failed step stops the steps after it.' },
          { term: 'registry', def: 'An online store for images, such as <code>ghcr.io</code>. Workflows upload (push) images to it; servers download them from it.' },
          { term: 'GITHUB_TOKEN', def: 'A password GitHub makes for each workflow run. <code>permissions:</code> says what it may do, such as <code>packages: write</code> to upload images.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Tag each image with the hash of the commit it was built from.', code: `tags: ghcr.io/recipes-team/recipes-server:\${{ github.[[sha]] }}`, why: '<code>github.sha</code> is the commit hash that started the run. With it, every image says exactly which code is inside.' },
          { type: 'bug', prompt: 'The login works, but the registry refuses to take the image. Tap the line.', code: `deliver:
  runs-on: ubuntu-latest
  permissions:
    contents: read
    packages: read`, bug: 4, fix: '    packages: write', why: '<code>packages: read</code> only lets <code>GITHUB_TOKEN</code> download images. Uploading one needs <code>packages: write</code>.' },
        ],
        quiz: [
          { q: 'The step <code>./gradlew test buildFatJar</code> fails on a push to <code>main</code>. What does the server run afterwards?', options: ['The image it already ran: nothing new was built or uploaded', 'The new code, with the failing test', 'Nothing: the server stops'], a: 0, why: 'A failed step stops the steps after it. No image is built or uploaded, so the server keeps its current version.' },
          { q: 'Why tag each image with <code>\${{ github.sha }}</code>?', options: ['You know which commit is running, and can start any earlier one again', 'It makes the image smaller', 'GitHub refuses images without it'], a: 0, why: 'The tag is the commit hash. Going back to an earlier version is running the image with that commit’s tag.' },
          { q: 'Where does <code>\${{ secrets.GITHUB_TOKEN }}</code> come from?', options: ['GitHub makes it for each run of the workflow', 'Mei types her own GitHub password into the file', 'Docker sends it to GitHub'], a: 0, why: 'GitHub creates <code>GITHUB_TOKEN</code> automatically for every run. No password is written in the workflow.' },
        ],
        docs: [['Publishing Docker images', 'https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images'], ['Workflow syntax for GitHub Actions', 'https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax']],
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'secrets',
        title: 'Secrets',
        tagline: 'Passwords and keys stay out of the code: the server asks for them by name, and a secret manager hands them over.',
        goals: ['Read a secret from an environment variable in Kotlin', 'Keep a workflow’s secrets in GitHub’s repository secrets', 'Say what a secret manager does and what to do when a secret leaks'],
        level: 'intermediate', introduces: ['System', 'getenv', 'env'],
        body: `
<p>The Recipes server now connects to the managed database, so it needs the database’s password, and the key for the nutrition service: another company’s server that tells Recipes the calories of a recipe. In <a href="#security.secrets">API keys and secrets</a> you saw that real secrets belong on the server. Kofi put the database password in <code>Server.kt</code> as a <code>const val</code> and pushed. Now everyone who can read the repository has it, and so does every clone and every CI machine. Deleting the line in the next commit doesn’t help: Git keeps every earlier version.</p>
<p>So the code only names the secret, and gets its value from outside. An <em>environment variable</em> is a named value that a program receives from whoever starts it. <code>System.getenv("DATABASE_PASSWORD")</code> reads one; it gives <code>null</code> when it isn’t set, so <code>?: throw Exception(...)</code> stops the server at once with a clear message. On your laptop, <code>docker run -e DATABASE_PASSWORD=...</code> starts a container with that variable set.</p>
<p>In the cloud, secrets live in a <em>secret manager</em>: a service that stores each secret encrypted, decides which programs and people may read it, keeps every version, and records who read or changed it. When the cloud starts the server’s container, it reads the secret and sets <code>DATABASE_PASSWORD</code>. The workflow’s own secrets, such as the key a deploy step needs, go in GitHub: <b>Settings › Secrets and variables › Actions</b>, then <code>\${{ secrets.NAME }}</code>, like <code>GITHUB_TOKEN</code>. <code>env:</code> hands it to one step as an environment variable, and GitHub hides its value in the logs.</p>
<p>If a secret leaks anyway, <em>rotate</em> it: make a new password at the database, save it as a new version in the secret manager and restart the server. The old password stops working, so the copy in Git’s history is worth nothing.</p>`,
        visual(el) {
          Lab.ui.terminal(el, {
            predict: {
              q: 'Kofi removed the password from <code>Server.kt</code> in a new commit and pushed. Can someone with a copy of the repository still read it?',
              options: ['Yes: the earlier commit still has it', 'No: the file no longer contains it', 'Only Kofi can, on his laptop'],
              a: 0,
              why: 'A new commit changes only the newest version. Every earlier commit, in every clone, still holds the password. That is why it has to be changed.',
            },
            frames: [
              { say: 'Yesterday Kofi put the database password into <code>Server.kt</code> and pushed. This morning he took it out again, in a new commit.' },
              { cmd: 'git log --oneline', out: '1e782a8 Remove the database password\n5c28103 Connect to the database\ne436816 Fix the empty shopping list', say: 'The history still has the commit that added it, right after the shopping-list fix from the last lesson.' },
              { cmd: 'git show 5c28103', out: esc(`commit 5c28103c41fae0ad8b77d0e800b09b3676b10d84
Author: Kofi <kofi@example.com>

    Connect to the database

+const val DB_PASSWORD = "plum-river-7731"`), say: 'Anyone with a clone can print it. (Shortened: the date and the rest of the change are cut.) The team treats the password as leaked.' },
              { say: 'Mei rotates it: she sets a new password on the managed database and saves it in the secret manager as version 2 of the secret <code>recipes-db-password</code>. The password in the history no longer opens anything.' },
              { cmd: 'docker run -p 8080:8080 recipes-server', out: esc('Exception in thread "main" java.lang.Exception: DATABASE_PASSWORD is not set\n\tat ServerKt.main(Server.kt:6)\n\tat ServerKt.main(Server.kt)'), say: 'The server now reads <code>System.getenv("DATABASE_PASSWORD")</code>. Started without it, it stops at once and says why, instead of failing later at the first query.' },
              { cmd: 'docker run -e DATABASE_PASSWORD=local-dev-password -p 8080:8080 recipes-server', out: '… Responding at http://0.0.0.0:8080', say: 'On her laptop, Mei hands the container the password of her own test database with <code>-e</code>.' },
              { say: 'In the cloud, the platform reads version 2 from the secret manager and starts the container with <code>DATABASE_PASSWORD</code> set. The password is in no new commit or image, and no line of code. Old images in the registry, built from commit <code>5c28103</code>, still hold the old one: one more reason the rotation matters.' },
            ],
          });
        },
        code: `// Server.kt: the code names the secret; its value comes from outside
val dbPassword = System.getenv("DATABASE_PASSWORD")
    ?: throw Exception("DATABASE_PASSWORD is not set")

# Terminal, on your laptop: -e sets an environment variable in the container
docker run -e DATABASE_PASSWORD=local-dev-password -p 8080:8080 recipes-server

# .github/workflows/server.yml: a repository secret, handed to one step.
# (deploy.sh is the team's small script that tells the cloud to run a new tag.)
      - run: ./deploy.sh \${{ github.sha }}
        env:
          CLOUD_TOKEN: \${{ secrets.CLOUD_TOKEN }}   # Settings › Secrets and variables › Actions`,
        remember: 'Code names a secret, the environment hands over its value: a secret manager in the cloud, repository secrets in GitHub. A leaked secret is rotated, not only deleted.',
        mistakes: [
          { title: 'Printing a secret to check it', bad: `println("Connecting with password $dbPassword")`, good: `println("Connecting to the database")`, why: 'Server logs are read by many people and tools. GitHub hides its secrets in workflow logs, but your server’s own logs print whatever you give them.' },
        ],
        terms: [
          { term: 'environment variable', def: 'A named value a program receives from whoever starts it. <code>System.getenv("NAME")</code> reads it, or gives <code>null</code>.' },
          { term: 'secret manager', def: 'A cloud service that stores secrets encrypted, decides who may read each one, keeps every version and records each read and change.' },
          { term: 'repository secret', def: 'A secret stored in a GitHub repository’s settings and used in a workflow as <code>\${{ secrets.NAME }}</code>. Its value is hidden in the logs.' },
          { term: 'rotate', def: 'Replace a secret with a new value and make the old one stop working. The answer to a leak.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the nutrition service’s key from an environment variable, and stop at once if it isn’t set.', code: `val nutritionKey = System.[[getenv]]("NUTRITION_KEY")
    ?: [[throw]] Exception("NUTRITION_KEY is not set")`, why: '<code>System.getenv</code> gives <code>null</code> when the variable isn’t set; <code>?: throw</code> turns that into a clear message at start.' },
          { type: 'bug', prompt: 'This workflow works, but anyone who can read the repository can use the cloud’s key. Tap the line.', code: `      - run: ./deploy.sh \${{ github.sha }}
        env:
          CLOUD_TOKEN: ct_live_8f2a91d4`, bug: 2, fix: '          CLOUD_TOKEN: \${{ secrets.CLOUD_TOKEN }}', why: 'The key is written in the file, so it is in Git’s history. Store it as a repository secret and let GitHub fill it in. (The key in the history must be rotated too.)' },
        ],
        quiz: [
          { q: 'The database password was in a commit that was pushed. What makes the leak harmless?', options: ['Rotate it: a new password, and the old one stops working', 'Delete the line in a new commit', 'Make the repository private'], a: 0, why: 'Earlier commits and every clone still hold the old password. Only changing it makes that copy useless.' },
          { q: 'What does <code>System.getenv("DATABASE_PASSWORD")</code> give when the variable isn’t set?', options: ['<code>null</code>', 'An empty text, <code>""</code>', 'A crash'], a: 0, why: 'Its type is <code>String?</code>. That is why the code adds <code>?: throw Exception(...)</code>.' },
          { q: 'A workflow uses <code>\${{ secrets.CLOUD_TOKEN }}</code>, but nobody created that secret. What does the step get?', options: ['An empty text', 'An error before the run starts', 'The value from Mei’s laptop'], a: 0, why: 'GitHub gives an empty text for a secret that isn’t set, so the step fails later, when it tries to use the key.' },
        ],
        docs: [['Using secrets in GitHub Actions', 'https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets']],
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'baas',
        title: 'Backend as a service',
        tagline: 'Sign-in, a database and file storage that someone else runs, used straight from the app.',
        goals: ['Say what a backend as a service gives you and what it costs you', 'Read documents from Cloud Firestore in Kotlin', 'Protect the data with Security Rules'],
        level: 'beginner', introduces: ['firestore', 'allow'],
        body: `
<p>Noor leads a cooking club and wants a small app: members sign in and share shopping lists. For Recipes, the team runs a server, builds an image, keeps a pipeline, a managed database and secrets. For one person and a small app, that is a lot to look after.</p>
<p>A <em>backend as a service</em> (BaaS) is a backend someone else runs: sign-in, a database and file storage, which the app uses through the provider’s library. You already use Firebase for push, crash reports and Remote Config. It also has Firebase Authentication for sign-in, Cloud Storage for files, and <em>Cloud Firestore</em>, a database of <em>documents</em>: each document is a set of named fields, and documents are grouped in collections, such as the collection <code>lists</code> with a document <code>weekend</code>. Cloud Functions runs your own code on Firebase’s servers when something happens. Cloud Functions and Cloud Storage need the pay-as-you-go Blaze plan. Supabase and Appwrite offer similar services, built on open-source parts you can also run yourself.</p>
<p>The app reads Firestore directly, with no server of Noor’s in between. So who checks who may read what? <em>Security Rules</em>: rules you write in Firebase, which Firebase checks for every request from an app before it reads or writes anything. <code>allow read, write: if request.auth != null;</code> lets only signed-in users in. Signed in isn’t the same as allowed: anyone can make an account, so real rules also check <em>who</em>, for example <code>request.auth.uid == resource.data.owner</code> (only the list’s owner). Never rely on the app’s own code for this: anyone can change an APK, and the project’s details are inside every copy.</p>
<p>What it costs: the start is fast and there is no server to look after, but as the app grows you pay for every read, write and stored byte, and your app depends on one provider. That is <em>vendor lock-in</em>. Keep the Firestore calls in one repository, as in <a href="#arch.repository">Repositories</a>, so a move later touches one class, not every screen.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 290,
            nodes: [
              { id: 'app', label: 'Club app<small>Firebase library</small>', x: 22, y: 14 },
              { id: 'auth', label: 'Authentication<small>who is signed in</small>', x: 22, y: 52, hidden: true },
              { id: 'rules', label: 'Security Rules<small>checked on every request</small>', x: 70, y: 52, tone: 'warm', hidden: true },
              { id: 'fs', label: 'Cloud Firestore<small>lists/weekend</small>', x: 70, y: 88 },
              { id: 'other', label: 'A stranger’s script<small>with the project’s details</small>', x: 70, y: 14, tone: 'err', hidden: true },
            ],
            predict: {
              q: 'The club app reads Firestore directly, with no server of Noor’s in between. What stops a stranger’s script from reading every list?',
              options: ['Security Rules, which Firebase checks for every request', 'The app’s own code, which checks before each read', 'Nothing: with a BaaS the data is open'],
              a: 0,
              why: 'The app’s code runs on phones, where anyone can change it. The rules run on Firebase’s side, so every request passes them, whoever sends it.',
            },
            frames: [
              { add: [['app', 'fs', 'get lists']], say: 'Noor’s app reads the collection <code>lists</code> straight from Firestore, through the Firebase library. She runs no server, no image and no pipeline.' },
              { show: ['auth'], add: [['app', 'auth', 'sign in', 'ok']], say: 'Members sign in with Firebase Authentication. From then on, every request says who is asking.' },
              { show: ['rules'], remove: [['app', 'fs']], add: [['app', 'rules', 'get lists'], ['rules', 'fs', 'allowed', 'ok']], say: 'Every request passes the Security Rules first. The rule <code>if request.auth != null</code> lets signed-in members read and write.' },
              { show: ['other'], add: [['other', 'rules', 'not signed in', 'err']], say: 'Someone copies the project’s details out of the APK and sends requests from a script. Not signed in: refused. But this rule only stops anonymous requests: the script could make an account and sign in, so the club’s real rules also check that a list belongs to the member who asks.' },
              { remove: [['other', 'rules']], add: [['other', 'fs', 'if true', 'err']], hl: ['fs'], say: 'With the rule <code>allow read, write: if true;</code>, the same script could read every list and delete them all. With a BaaS, the rules are your server’s checks.' },
              { remove: [['other', 'fs']], gone: ['other'], hl: ['app'], say: 'If the club app ever moves away from Firebase, every Firestore call has to change. Kept in one repository class, that is one file.' },
              { say: 'For Noor: a working app in a weekend, and no server to look after. The price: a bill for each read and write as the club grows, and a provider that is hard to leave.' },
            ],
          });
        },
        code: `// app/build.gradle.kts (the Firebase BoM is already there from the FCM lesson)
dependencies {
    implementation("com.google.firebase:firebase-firestore")
}

// Read every document in the collection "lists"
val db = Firebase.firestore
db.collection("lists")
    .get()
    .addOnSuccessListener { result ->
        for (document in result) {
            Log.d("Club", "\${document.id} => \${document.data}")
        }
    }
// Club: weekend => {items=[eggs, flour], owner=ada}

// firestore.rules, published in the Firebase console
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /lists/{listId} {
      allow read, write: if request.auth != null;   // only signed-in users
    }
  }
}`,
        remember: 'A BaaS runs sign-in, a database and storage for you. Security Rules are its checks, and keeping its calls in one repository keeps you free to leave.',
        terms: [
          { term: 'backend as a service (BaaS)', def: 'A backend someone else runs (sign-in, a database, file storage), used from the app through the provider’s library. Firebase is one.' },
          { term: 'Cloud Firestore', def: 'Firebase’s database of documents. Each document is a set of named fields; documents are grouped in collections.' },
          { term: 'Security Rules', def: 'Rules you write in Firebase that decide who may read or write which data. Firebase checks them on every request from an app.' },
          { term: 'vendor lock-in', def: 'How hard and costly it is to move your app and its data to another provider.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the documents of the collection <code>lists</code>.', code: `val db = Firebase.firestore
db.[[collection]]("lists")
    .get()
    .addOnSuccessListener { result ->
        for (document in result) {
            Log.d("Club", document.id)
        }
    }`, why: '<code>collection("lists")</code> picks the collection, and <code>get()</code> reads its documents. The result is a list of documents you can loop through.' },
          { type: 'bug', prompt: 'With these rules, anyone with the project’s details can read and delete every list. Tap the line.', code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /lists/{listId} {
      allow read, write: if true;
    }
  }
}`, bug: 4, fix: '      allow read, write: if request.auth != null;', why: '<code>if true</code> allows every request. <code>request.auth != null</code> lets only signed-in users in.' },
        ],
        quiz: [
          { q: 'Noor wants her own code to run on Firebase’s servers each time a list changes. What does she need?', options: ['Cloud Functions, on the pay-as-you-go Blaze plan', 'Nothing extra: it works on the free plan', 'Her own VM'], a: 0, why: 'Cloud Functions runs your code on Firebase’s servers, and it needs the Blaze plan.' },
          { q: 'Can an app whose data lives on its own server still use Firebase Cloud Messaging?', options: ['Yes: any server can send messages through FCM', 'No: FCM needs Firestore', 'Only with Cloud Functions'], a: 0, why: 'FCM is a separate service. In the FCM lesson, your server sends the message; where your data lives doesn’t matter.' },
          { q: 'What keeps vendor lock-in small?', options: ['All Firestore calls in one repository class', 'Calling Firestore from every screen', 'Using the free plan'], a: 0, why: 'The rest of the app talks to your repository, so switching providers means rewriting one class.' },
        ],
        docs: [['Cloud Firestore', 'https://firebase.google.com/docs/firestore'], ['Get started with Cloud Firestore Security Rules', 'https://firebase.google.com/docs/firestore/security/get-started']],
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'observability',
        title: 'Logs, metrics and traces',
        tagline: 'When users say “it’s slow”, the server’s own records tell you when, what and where.',
        goals: ['Tell logs, metrics and traces apart, and what each one answers', 'Find the slow part of a request in a trace', 'Add the OpenTelemetry Java agent to the server’s image'],
        level: 'intermediate', introduces: ['ENV', 'javaagent', 'OTEL_SERVICE_NAME', 'OTEL_EXPORTER_OTLP_ENDPOINT'],
        body: `
<p>Monday, 09:00: users write that opening a recipe takes ages. Crashlytics, from <a href="#launch.crashes">Crash reporting</a>, shows no new crashes: nothing broke, it is only slow. Somewhere between the server, the database and the nutrition service, time goes missing. Without records from the server, the team can only guess.</p>
<p><em>Observability</em> means a system tells you what it is doing. It sends three kinds of records, called signals. <em>Logs</em> record events, one line each, with the time: <code>GET /v1/recipes/42 200 2412ms</code>. <em>Metrics</em> are numbers measured over time, such as requests per minute, how many fail and how long they take: good for charts and for alarms. A <em>trace</em> follows one request through every part it touches. Each step is a <em>span</em>, with a start and an end, so the slow step stands out.</p>
<p><em>OpenTelemetry</em> (OTel) is an open standard, with free tools, for making all three. Most monitoring services can read it, so you can switch services without changing your code. For a server that runs on Java, the OpenTelemetry Java agent does it without code changes: <code>java -javaagent:opentelemetry-javaagent.jar -jar app.jar</code> loads the agent before the server, and it measures incoming requests, database calls and calls to other services. <code>OTEL_SERVICE_NAME</code> gives the server a name in the records, and <code>OTEL_EXPORTER_OTLP_ENDPOINT</code> says where to send them, often to an OpenTelemetry Collector, a program that receives the data and passes it on.</p>
<p>In the Dockerfile, <code>ENV</code> sets an environment variable that every container of the image gets. Read the signals in order: the metric shows <em>when</em> it started, the log shows <em>what</em> happened, and the trace shows <em>where</em> the time went.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['server', 'data&shy;base', 'nutri&shy;tion'],
            span: 2500,
            unit: 'ms',
            predict: {
              q: 'The server’s log line says <code>GET /v1/recipes/42 200 2412ms</code>. What does it tell you?',
              options: ['The request worked but took 2.4 seconds; not which part was slow', 'The database is slow', 'The request failed'],
              a: 0,
              why: '200 means it worked, and 2412ms is the time for the whole request. Which part took that time is what a trace shows.',
            },
            frames: [
              { say: 'The metric for <code>GET /v1/recipes/42</code>: about 150 ms all last week, about 2,400 ms since 09:00 today. (Example numbers.) The metric shows <em>that</em> it got slow, and <em>when</em>.' },
              { bars: [{ lane: 0, from: 0, to: 2412, label: 'GET /v1/recipes/42' }], say: 'One trace of a slow request. The first span is the server handling it: 2,412 ms, the same as the log line.' },
              { bars: [{ lane: 1, from: 30, to: 90, label: 'load recipe', tone: 'ok' }], say: 'Inside it, the database span: loading recipe 42 takes 60 ms. Not the problem.' },
              { bars: [{ lane: 2, from: 110, to: 2380, label: 'GET calories: 2.27 s', tone: 'err' }], say: 'The call to the nutrition service takes 2,270 ms, almost all of the request. That service got slow this morning.' },
              { say: 'The log lines of this request carry the trace’s id, so the team can read exactly what the server wrote while it waited.' },
              { say: 'The fix: keep the calories on the server for a day, as in <a href="#sysdesign.caching">Caching on the server</a>, and stop waiting after 500 ms. The next morning the metric is back at about 150 ms.' },
            ],
          });
        },
        code: `# Dockerfile: the same server, now sending logs, metrics and traces
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY build/libs/recipes-server-all.jar app.jar
# The OpenTelemetry Java agent, downloaded from its releases page
COPY opentelemetry-javaagent.jar opentelemetry-javaagent.jar
# The server's name in every log, metric and trace
ENV OTEL_SERVICE_NAME=recipes-server
EXPOSE 8080
# Load the agent first, then start the server
CMD ["java", "-javaagent:opentelemetry-javaagent.jar", "-jar", "app.jar"]

# Terminal: where the records go is set when the container starts,
# here a Collector that the team runs at the address collector.
# 4318: the port where a Collector receives OpenTelemetry data
docker run -e OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318 -p 8080:8080 recipes-server`,
        remember: 'Metrics show when, logs show what, traces show where. OpenTelemetry makes all three; on Java, its agent needs no code changes.',
        terms: [
          { term: 'log', def: 'A record of one event, with its time, such as <code>GET /v1/recipes/42 200 2412ms</code>.' },
          { term: 'metric', def: 'A number measured over time, such as requests per minute or how long they take. Shown in charts and used for alarms.' },
          { term: 'trace, span', def: 'A trace follows one request through every part it touches. Each step in it is a span, with a start and an end.' },
          { term: 'OpenTelemetry', def: 'An open standard, with free tools, for making logs, metrics and traces that most monitoring services can read.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give the server its name in every log, metric and trace.', code: `[[ENV]] [[OTEL_SERVICE_NAME]]=recipes-server`, why: '<code>ENV</code> sets an environment variable in the image, and the agent reads <code>OTEL_SERVICE_NAME</code> for the service’s name.' },
          { type: 'bug', prompt: 'The server runs, but it sends no traces at all. Tap the line.', code: `FROM eclipse-temurin:21-jre
WORKDIR /app
COPY build/libs/recipes-server-all.jar app.jar
COPY opentelemetry-javaagent.jar opentelemetry-javaagent.jar
ENV OTEL_SERVICE_NAME=recipes-server
CMD ["java", "-jar", "app.jar", "-javaagent:opentelemetry-javaagent.jar"]`, bug: 5, fix: 'CMD ["java", "-javaagent:opentelemetry-javaagent.jar", "-jar", "app.jar"]', why: 'Java reads its own options only before <code>-jar app.jar</code>. Everything after it goes to the server as input, so the agent is never loaded.' },
        ],
        quiz: [
          { q: 'Which signal tells you how many requests failed each minute last week?', options: ['A metric', 'One trace', 'One log line'], a: 0, why: 'A metric is a number measured over time, made for questions like “how many, and when”.' },
          { q: 'One request was slow. Which signal shows which part of it took the time?', options: ['Its trace', 'The error-count metric', 'The crash report'], a: 0, why: 'A trace has a span for every step of that request, each with a start and an end.' },
          { q: 'What does the OpenTelemetry Java agent need from you?', options: ['Loading it with <code>-javaagent:</code> and a few environment variables', 'A call to it in every function', 'A new server written for it'], a: 0, why: 'The agent measures requests, database calls and calls to other services by itself. You start Java with it and set its environment variables.' },
        ],
        docs: [['OpenTelemetry signals', 'https://opentelemetry.io/docs/concepts/signals/'], ['Java agent: getting started', 'https://opentelemetry.io/docs/zero-code/java/agent/getting-started/']],
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'scaling',
        title: 'Scaling',
        tagline: 'More traffic: a bigger machine, or more copies of the server behind a load balancer.',
        goals: ['Compare vertical and horizontal scaling', 'Work out how many copies of the server a peak needs', 'Explain why the copies must keep nothing in their own memory'],
        level: 'intermediate', introduces: [],
        body: `
<p>Saturday, 20:00: a cooking show on TV mentions Recipes. Requests jump from 300 to 2,000 per second. One copy of the server handles about 500 (example numbers). The VM’s processors run at full speed, requests wait in line, and the app shows errors. To <em>scale</em> is to give the server room for more work.</p>
<p><em>Vertical scaling</em> means a bigger machine: more processors and memory. It needs no change to the code. But the VM restarts to change size, the biggest size has a limit, and it is still one machine: if it fails, Recipes is down.</p>
<p><em>Horizontal scaling</em> means more copies of the same server, started from the same image, with a <em>load balancer</em> in front, as in <a href="#sysdesign.realtime">Real-time at scale</a>: a server that hands each request to one of the copies. It also asks each copy for <code>/health</code> every few seconds and stops sending requests to a copy that doesn’t answer. Four copies of 500 handle 2,000. With autoscaling, the cloud adds copies when they get busy and removes them when it is quiet, between a smallest and a largest number you set.</p>
<p>This only works if the server is <em>stateless</em>: a copy keeps nothing about users in its own memory between requests. Ada’s next request may reach another copy, and the autoscaler may remove this one. Favorites, sign-ins and lists live in the shared database, which every copy uses. That database is usually the part you scale last, often by giving the managed database a bigger size.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'req', label: 'Requests', x: 50, y: 8 },
              { id: 'lb', label: 'Load balancer<small>asks /health</small>', x: 50, y: 36, tone: 'warm', hidden: true },
              { id: 'c1', label: 'Copy 1<small>500/s max</small>', x: 13, y: 66 },
              { id: 'c2', label: 'Copy 2', x: 38, y: 66, hidden: true },
              { id: 'c3', label: 'Copy 3', x: 62, y: 66, hidden: true },
              { id: 'c4', label: 'Copy 4', x: 87, y: 66, hidden: true },
              { id: 'db', label: 'Managed database<small>shared by all copies</small>', x: 50, y: 93, tone: 'ok' },
            ],
            predict: {
              q: 'Recipes runs four copies behind a load balancer. Copy 2 crashes. What happens to the requests it would have got?',
              options: ['The load balancer sends them to the other copies', 'They fail until someone restarts copy 2', 'They wait inside copy 2 until it is back'],
              a: 0,
              why: 'Copy 2 stops answering <code>/health</code>, so the load balancer stops sending it requests. The other copies take them.',
            },
            frames: [
              { add: [['req', 'c1', '300/s', 'ok'], ['c1', 'db']], say: 'A normal evening: one copy of the server on one VM, 300 requests per second out of the 500 it can handle. (Example numbers.)' },
              { add: [['req', 'c1', '2,000/s', 'err']], hl: ['c1'], say: '20:00, the cooking show: 2,000 per second. Four times what one copy can do. Requests wait, then fail.' },
              { hl: ['c1'], say: 'Vertical: a VM with four times the processors could cope. But it restarts to change size, there is a biggest size, and it is still one machine that can fail.' },
              { show: ['lb', 'c2', 'c3', 'c4'], remove: [['req', 'c1']], add: [['req', 'lb', '2,000/s'], ['lb', 'c1', '', 'ok'], ['lb', 'c2', '', 'ok'], ['lb', 'c3', '', 'ok'], ['lb', 'c4', '', 'ok'], ['c2', 'db'], ['c3', 'db'], ['c4', 'db']], say: 'Horizontal: four copies of the same image, and a load balancer that shares out the requests. 2,000 ÷ 500 = 4.' },
              { gone: ['c2'], add: [['lb', 'c2', '', 'err']], say: 'Copy 2 crashes and stops answering <code>/health</code>. The load balancer skips it, and the other three take its share. But three copies handle 1,500, less than 2,000: requests wait again until the autoscaler adds a copy. That is why teams run one spare: five copies, not four.' },
              { back: ['c2'], add: [['lb', 'c2', '', 'ok']], say: 'The autoscaler sees busy copies and starts a new one from the image. A minute later it takes requests.' },
              { hl: ['c1', 'c3'], say: 'Ada saves a favorite; copy 1 handles it. Her next request reaches copy 3. If copy 1 had kept the favorite in its own memory, copy 3 wouldn’t know it. Stored in the shared database, every copy sees it.' },
              { gone: ['c3', 'c4'], remove: [['lb', 'c3'], ['lb', 'c4']], add: [['req', 'lb', '300/s'], ['lb', 'c1', '', 'ok'], ['lb', 'c2', '', 'ok']], say: 'Late at night it is quiet again. The autoscaler removes copies down to the smallest number Mei set, two, and the bill shrinks with them.' },
            ],
          });
        },
        code: `// Example numbers: how many copies does the cooking show need?
val perCopy = 500           // requests per second one copy can handle
val peak = 2000             // requests per second during the show
println(peak / perCopy)     // 4
// Int division rounds down: 2100 / 500 gives 4, but 2,100 per second needs 5 copies.
// When it doesn't divide evenly, round up.

// Stateless: every copy reads and writes the same database
interface FavoritesStore {
    fun add(userId: String, recipeId: Int)
    fun forUser(userId: String): List<Int>
}

// MemoryFavorites keeps a map in this copy's memory: another copy can't see it,
// and it is lost when the autoscaler removes this copy.
// DatabaseFavorites uses the shared database.
val favorites: FavoritesStore = DatabaseFavorites(database)`,
        remember: 'Vertical: a bigger machine, simple but limited. Horizontal: more stateless copies behind a load balancer, added and removed as traffic changes.',
        terms: [
          { term: 'vertical scaling', def: 'Giving the server a bigger machine: more processors and memory. No code changes, but there is a limit and it stays one machine.' },
          { term: 'horizontal scaling', def: 'Running more copies of the same server. With autoscaling, the cloud adds and removes copies as traffic changes.' },
          { term: 'load balancer', def: 'A server in front of the copies that hands each request to one of them, and skips copies that don’t answer <code>/health</code>.' },
          { term: 'stateless', def: 'A server that keeps nothing about users in its own memory between requests, so any copy can answer any request.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Work out how many copies a peak of 3,000 requests per second needs. (Example numbers.)', code: `val perCopy = 500           // requests per second one copy can handle
val peak = 3000
val copies = peak / [[perCopy]]
println(copies)             // 6`, why: 'Each copy takes 500 per second, so 3,000 needs 3,000 ÷ 500 = 6 copies.' },
          { type: 'bug', prompt: 'Recipes now runs four copies, and users say their favorites appear and disappear. Tap the line.', code: `interface FavoritesStore {
    fun add(userId: String, recipeId: Int)
    fun forUser(userId: String): List<Int>
}
// MemoryFavorites keeps a map in this copy's memory; DatabaseFavorites uses the shared database
val favorites: FavoritesStore = MemoryFavorites()`, bug: 5, fix: 'val favorites: FavoritesStore = DatabaseFavorites(database)', why: 'Each copy has its own memory, so a favorite saved on copy 1 is missing on copy 3. The shared database is the same for every copy.' },
        ],
        quiz: [
          { q: 'What is the catch with vertical scaling?', options: ['The biggest machine has a limit, and it is still one machine that can fail', 'The code has to be rewritten', 'It only works with containers'], a: 0, why: 'A bigger machine needs no code change, but it can only grow so far, and when it fails, everything is down.' },
          { q: 'Why must the copies be stateless?', options: ['The next request may reach another copy, and removed copies lose their memory', 'Load balancers can’t send requests to servers with memory', 'Stateless servers are always faster'], a: 0, why: 'Anything kept in one copy’s memory is missing on the others, and gone when the autoscaler removes that copy.' },
          { q: 'At the peak, 2,100 requests per second arrive, and one copy handles 500. How many copies does Recipes need? (Example numbers.)', options: ['5', '4', '2,100'], a: 0, why: '2,100 ÷ 500 = 4.2. Four copies handle only 2,000, so round up: 5. (In Kotlin, <code>2100 / 500</code> gives 4, because Int division rounds down.)' },
        ],
        docs: [['Horizontal and vertical scaling (Kubernetes docs)', 'https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/']],
      },
    ],
  });
})();
