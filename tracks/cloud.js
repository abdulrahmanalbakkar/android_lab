/* Cloud and DevOps basics track. Same shape as tracks/kotlin.js.
   The servers, containers, pipelines, secrets, backends, telemetry and scaling around an Android app.
   Product facts were checked against docs.docker.com, docs.github.com, firebase.google.com, supabase.com/docs,
   docs.cloud.google.com and opentelemetry.io. Prices in demos are made-up "units", not real rates.
   Demo styles live in the css string below; every class is prefixed cl-. */
(() => {
  const { h, sleep, replay } = Lab;
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const label = t => h('span', { class: 'cl-label' }, t);
  const pill = (text, kind = '') => h('span', { class: 'cl-pill' + (kind ? ' cl-' + kind : '') }, text);

  const css = `
.cl-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.cl-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.cl-pill { font: 600 0.74rem var(--mono); padding: 3px 9px; border-radius: 8px; border: 1.5px solid var(--line); background: var(--surface); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; transition: background 0.25s, border-color 0.25s; }
.cl-pill.cl-ok { border-color: var(--ok); background: var(--ok-soft); }
.cl-pill.cl-err { border-color: var(--err); background: var(--err-soft); }
.cl-pill.cl-warn { border-color: var(--warm); background: var(--warm-soft); }
.cl-pill.cl-acc { border-color: var(--accent); background: var(--accent-soft); }
.cl-pill.cl-ghost { border-style: dashed; color: var(--muted); background: transparent; }
.cl-box { display: grid; gap: 8px; padding: 12px; border-radius: 12px; background: var(--sunk); border: 1px solid var(--line); min-width: 0; }
.cl-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 110px), 1fr)); gap: 8px; min-width: 0; }
.cl-stat { padding: 8px 10px; border-radius: 10px; background: var(--surface); border: 1px solid var(--line); min-width: 0; }
.cl-stat b { display: block; font: 700 1.1rem var(--mono); color: var(--ink); }
.cl-stat span { font-size: 0.78rem; color: var(--muted); }

/* 1 hosting models */
.cl-hours { display: grid; grid-template-columns: repeat(24, minmax(0, 1fr)); gap: 2px; align-items: end; height: 130px; padding: 6px; border-radius: 10px; background: var(--surface); border: 1px solid var(--line); min-width: 0; }
.cl-hr { position: relative; height: 100%; display: flex; align-items: flex-end; min-width: 0; }
.cl-need { width: 100%; background: var(--accent); border-radius: 3px 3px 0 0; opacity: 0.25; transition: opacity 0.2s, background 0.2s; }
.cl-hr.cl-lit .cl-need { opacity: 0.85; }
.cl-hr.cl-over .cl-need { background: var(--err); opacity: 0.9; }
.cl-hr.cl-short .cl-need { background: var(--warm); opacity: 0.9; }
.cl-cap { position: absolute; left: 0; right: 0; bottom: 0; border-top: 2px solid var(--ink); background: var(--ok-soft); opacity: 0; transition: height 0.25s, opacity 0.2s; border-radius: 3px 3px 0 0; }
.cl-hr.cl-lit .cl-cap { opacity: 0.55; }
.cl-axis { display: flex; justify-content: space-between; font: 500 0.7rem var(--mono); color: var(--muted); padding: 0 6px; }
.cl-legend { display: flex; flex-wrap: wrap; gap: 10px; font-size: 0.78rem; color: var(--muted); }
.cl-sw { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 4px; vertical-align: -1px; }

/* 2 docker layers */
.cl-file { display: grid; gap: 4px; padding: 10px; border-radius: 12px; background: var(--code-bg); color: var(--code-ink); font: 500 0.78rem/1.5 var(--mono); min-width: 0; }
.cl-layer { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 7px; border: 1px solid transparent; transition: background 0.2s, border-color 0.2s; min-width: 0; }
.cl-layer code { background: none; padding: 0; color: inherit; overflow-wrap: anywhere; min-width: 0; flex: 1 1 180px; }
.cl-layer .cl-st { font: 700 0.68rem var(--mono); padding: 2px 7px; border-radius: 6px; background: rgba(255,255,255,0.08); white-space: nowrap; }
.cl-layer.cl-run { border-color: var(--t-s); background: rgba(255, 212, 121, 0.14); }
.cl-layer.cl-run .cl-st { animation: pulse 0.8s infinite; }
.cl-layer.cl-hit .cl-st { color: var(--t-k); }
.cl-layer.cl-did .cl-st { color: var(--t-s); }
.cl-layer.cl-did { background: rgba(255, 212, 121, 0.07); }

/* 3 pipeline */
.cl-pipe { display: grid; gap: 6px; min-width: 0; }
.cl-stage { display: grid; grid-template-columns: 22px minmax(0, 1fr) auto; gap: 8px; align-items: center; padding: 8px 10px; border-radius: 10px; border: 1.5px solid var(--line); background: var(--surface); transition: background 0.25s, border-color 0.25s, opacity 0.25s; min-width: 0; }
.cl-stage > span:nth-child(2) { overflow-wrap: anywhere; min-width: 0; font-size: 0.88rem; }
.cl-stage small { font: 600 0.7rem var(--mono); color: var(--muted); text-align: right; }
.cl-dot { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--line); background: var(--bg); }
.cl-stage.cl-on { border-color: var(--warm); background: var(--warm-soft); }
.cl-stage.cl-on .cl-dot { border-color: var(--warm); animation: pulse 0.7s infinite; }
.cl-stage.cl-pass { border-color: var(--ok); }
.cl-stage.cl-pass .cl-dot { background: var(--ok); border-color: var(--ok); }
.cl-stage.cl-fail { border-color: var(--err); background: var(--err-soft); }
.cl-stage.cl-fail .cl-dot { background: var(--err); border-color: var(--err); }
.cl-stage.cl-skip { opacity: 0.45; border-style: dashed; }
.cl-stage.cl-wait { border-color: var(--accent); background: var(--accent-soft); }
.cl-stage.cl-wait .cl-dot { border-color: var(--accent); }
.cl-env { font: 700 0.62rem var(--mono); text-transform: uppercase; letter-spacing: 0.05em; padding: 1px 6px; border-radius: 5px; border: 1px solid var(--line); margin-left: 6px; color: var(--muted); }

/* 4 secret scanner */
.cl-repo { display: grid; gap: 8px; min-width: 0; }
.cl-fname { font: 700 0.72rem var(--mono); color: var(--t-c); padding-bottom: 2px; overflow-wrap: anywhere; }
.cl-line { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 3px 6px; border-radius: 6px; border: 1px solid transparent; min-width: 0; }
.cl-line > code { background: none; padding: 0; color: inherit; white-space: pre-wrap; overflow-wrap: anywhere; min-width: 0; flex: 1 1 200px; }
.cl-line.cl-flag { border-color: var(--t-e); background: rgba(255, 120, 120, 0.12); }
.cl-line.cl-info { border-color: var(--t-s); background: rgba(255, 212, 121, 0.1); }
.cl-line.cl-fixed { background: rgba(126, 226, 168, 0.12); }
.cl-fix { font: 600 0.72rem var(--mono); padding: 3px 8px; border-radius: 6px; border: 1px solid var(--t-k); background: transparent; color: var(--t-k); cursor: pointer; }
.cl-why { flex-basis: 100%; font: 500 0.72rem/1.4 var(--mono); color: var(--t-c); }

/* 5 baas picker */
.cl-reqs { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
.cl-req { font: inherit; font-size: 0.8rem; text-align: left; padding: 7px 10px; border-radius: 9px; border: 1.5px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer; max-width: 100%; overflow-wrap: anywhere; }
.cl-req[aria-pressed="true"] { border-color: var(--accent); background: var(--accent-soft); }
.cl-bars { display: grid; gap: 8px; min-width: 0; }
.cl-bar { display: grid; grid-template-columns: minmax(0, 7.5em) minmax(0, 1fr) 3em; gap: 8px; align-items: center; font-size: 0.86rem; min-width: 0; }
.cl-bar > span:first-child { font-weight: 600; overflow-wrap: anywhere; }
.cl-track { height: 14px; border-radius: 7px; background: var(--surface); border: 1px solid var(--line); overflow: hidden; }
.cl-fill { height: 100%; width: 0; background: var(--accent); border-radius: 7px; transition: width 0.45s; }
.cl-bar.cl-top .cl-fill { background: var(--ok); }
.cl-bar b { font: 700 0.8rem var(--mono); text-align: right; }
.cl-notes { display: grid; gap: 4px; font-size: 0.84rem; margin: 0; padding-left: 1.1em; }
.cl-notes .cl-plus::marker { content: "+  "; color: var(--ok); }
.cl-notes .cl-minus::marker { content: "−  "; color: var(--err); }
.cl-notes .cl-zero::marker { content: "=  "; color: var(--muted); }

/* 6 observability */
.cl-logs { display: grid; gap: 2px; padding: 8px; border-radius: 12px; background: var(--code-bg); color: var(--code-ink); font: 500 0.74rem/1.5 var(--mono); min-width: 0; }
.cl-log { padding: 1px 6px; border-radius: 5px; overflow-wrap: anywhere; transition: opacity 0.25s, background 0.25s; }
.cl-log.cl-dim { opacity: 0.25; }
.cl-log.cl-match { background: rgba(255, 212, 121, 0.16); }
.cl-log .cl-svc { color: var(--t-t); }
.cl-log .cl-e { color: var(--t-e); }
.cl-spans { display: grid; gap: 4px; min-width: 0; }
.cl-span { display: grid; grid-template-columns: minmax(0, 8em) minmax(0, 1fr); gap: 8px; align-items: center; font: 500 0.74rem var(--mono); min-width: 0; }
.cl-span > span:first-child { overflow-wrap: anywhere; }
.cl-lane { position: relative; height: 16px; border-radius: 4px; background: var(--surface); border: 1px solid var(--line); overflow: hidden; }
.cl-sbar { position: absolute; top: 2px; bottom: 2px; border-radius: 3px; background: var(--accent); width: 0; transition: width 0.5s; }
.cl-sbar.cl-slow { background: var(--err); }
.cl-crash { white-space: pre-wrap; padding: 8px 10px; border-radius: 10px; border: 1.5px solid var(--err); background: var(--err-soft); font: 500 0.78rem/1.5 var(--mono); overflow-wrap: anywhere; }

/* 7 scaling */
.cl-lb { justify-self: center; padding: 8px 14px; border-radius: 10px; border: 2px solid var(--ink); background: var(--surface); font: 700 0.82rem var(--mono); text-align: center; }
.cl-flow { position: relative; height: 26px; overflow: hidden; min-width: 0; }
.cl-req-dot { position: absolute; top: 9px; left: 50%; width: 8px; height: 8px; margin-left: -4px; border-radius: 50%; background: var(--accent); animation: cl-fall 0.6s ease-in forwards; }
.cl-req-dot.cl-img { background: var(--warm); }
@keyframes cl-fall { from { transform: translate(0, -10px); opacity: 1; } to { transform: translate(var(--dx, 0), 14px); opacity: 0; } }
.cl-fleet { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 6px; min-width: 0; }
.cl-inst { display: grid; gap: 4px; padding: 6px; border-radius: 9px; border: 1.5px solid var(--line); background: var(--surface); font: 600 0.7rem var(--mono); min-width: 0; transition: border-color 0.2s, opacity 0.3s; }
.cl-inst.cl-boot { border-style: dashed; opacity: 0.6; }
.cl-inst.cl-hot { border-color: var(--err); }
.cl-load { height: 8px; border-radius: 4px; background: var(--sunk); overflow: hidden; }
.cl-load i { display: block; height: 100%; width: 0; background: var(--ok); transition: width 0.3s, background 0.3s; }
.cl-inst.cl-warmi .cl-load i { background: var(--warm); }
.cl-inst.cl-hot .cl-load i { background: var(--err); }
.cl-cdn { padding: 6px 10px; border-radius: 10px; border: 1.5px dashed var(--line); font: 600 0.74rem var(--mono); color: var(--muted); text-align: center; }
.cl-cdn.cl-cdn-on { border-style: solid; border-color: var(--warm); background: var(--warm-soft); color: var(--ink); }
`;

  Lab.addTrack({
    id: 'cloud',
    title: 'Cloud and DevOps basics',
    description: 'The servers, containers, pipelines, secrets and dashboards around your Android app, explained for app developers.',
    requires: ['build'],
    css,
    lessons: [
      // ---------------------------------------------------------------- 1
      {
        id: 'what-cloud',
        title: 'What "the cloud" is',
        tagline: 'Someone else\'s computers, rented by the hour or by the request, in a place you pick.',
        level: 'beginner',
        body: `
<p>"The cloud" is a provider's data centers that you rent instead of buying servers. You pick a <b>region</b> (a geographic area, such as Belgium or Frankfurt), and inside it the provider runs several <b>zones</b>: separate groups of machines, so one fire or power cut does not take everything down.</p>
<p>You can rent at different levels. A <b>virtual machine (VM)</b> is a whole computer you patch and run yourself. A <b>container service</b> runs your packaged app and adds copies when traffic grows. <b>Serverless</b> runs your code only while a request is being handled, and can drop to zero copies when nobody calls it. Higher levels mean less work for you and less control.</p>
<p>A <b>managed service</b> is something the provider runs for you, like a database with backups and upgrades included. The price model is <b>pay per use</b>: you pay for what is switched on, so a server sized for the 09:00 push burst also costs money at 03:00. Try the three models on one day of traffic for a news app.</p>`,
        visual(el) {
          // Instances needed per hour for a news app: quiet night, push burst at 09:00, evening peak.
          const NEED = [1, 0, 0, 0, 0, 0, 1, 3, 5, 9, 4, 3, 3, 4, 3, 3, 4, 5, 6, 7, 8, 5, 3, 2];
          const MAX = 10;
          const MODELS = {
            vm: { name: 'VM (fixed 6)', rate: 1, cap: () => NEED.map(() => 6) },
            ctr: { name: 'Containers (autoscale, min 1)', rate: 1, cap: () => { let prev = 1; return NEED.map(n => (prev = Math.max(1, Math.min(n, prev + 3)))); } },
            sls: { name: 'Serverless (scale to zero)', rate: 1.5, cap: () => NEED.slice() },
          };
          const cols = NEED.map(n => {
            const need = h('div', { class: 'cl-need', style: `height:${(n / MAX) * 100}%` });
            const cap = h('div', { class: 'cl-cap', style: 'height:0' });
            const c = h('div', { class: 'cl-hr', title: `${n} instances needed` }, cap, need); c.cap = cap; return c;
          });
          const stats = h('div', { class: 'cl-stats' });
          const o = out('');
          let token = 0;
          const stat = (v, t) => h('div', { class: 'cl-stat' }, h('b', {}, v), h('span', {}, t));
          async function run(id, btn) {
            press(btns, btn); const my = ++token;
            const m = MODELS[id], cap = m.cap();
            cols.forEach(c => { c.className = 'cl-hr'; c.cap.style.height = '0'; });
            let cost = 0, over = 0, idle = 0, colds = 0;
            for (let i = 0; i < 24; i++) {
              await sleep(70); if (!el.isConnected || my !== token) return;
              const c = cols[i], n = NEED[i], k = cap[i];
              c.cap.style.height = `${(k / MAX) * 100}%`;
              c.classList.add('cl-lit');
              if (n > k) { c.classList.add(id === 'ctr' ? 'cl-short' : 'cl-over'); over++; }
              if (id === 'sls' && n > 0 && i > 0 && NEED[i - 1] === 0) colds++;
              idle += Math.max(0, k - n);
              cost += id === 'sls' ? n * m.rate : k * m.rate;
            }
            stats.replaceChildren(stat(Math.round(cost) + ' u', 'cost for the day'), stat(String(over), 'hours short of capacity'), stat(String(idle), 'idle instance-hours'), stat(String(colds), 'cold starts'));
            say(o, id === 'vm'
              ? '<span class="bad">Fixed size: paid for 6 all night, still too small at 09:00 and 19:00–20:00.</span> <span class="muted">A VM does what you size it for, no more, no less.</span>'
              : id === 'ctr'
                ? '<span class="good">Cheaper and mostly right.</span> <span class="muted">At 09:00 the push burst grows faster than new instances start (amber). Autoscaling reacts, it does not predict.</span>'
                : '<span class="good">Zero cost while idle at night.</span> <span class="muted">Each unit of work costs more, and the first request after a quiet stretch waits for a cold start.</span>');
          }
          const btns = [act('VM', e => run('vm', e.currentTarget)), act('Containers', e => run('ctr', e.currentTarget)), act('Serverless', e => run('sls', e.currentTarget))];
          say(o, 'Pick a hosting model and watch it serve one day of traffic.');
          el.append(
            h('div', { class: 'controls' }, btns),
            h('div', { class: 'cl-legend' }, h('span', {}, h('i', { class: 'cl-sw', style: 'background:var(--accent)' }), 'needed'), h('span', {}, h('i', { class: 'cl-sw', style: 'background:var(--ok-soft);border:1px solid var(--ink)' }), 'running'), h('span', {}, h('i', { class: 'cl-sw', style: 'background:var(--err)' }), 'overloaded')),
            h('div', { class: 'cl-hours', role: 'img', 'aria-label': 'Instances needed and running for each hour of the day' }, cols),
            h('div', { class: 'cl-axis' }, h('span', {}, '00'), h('span', {}, '06'), h('span', {}, '12'), h('span', {}, '18'), h('span', {}, '23')),
            stats, o);
        },
        code: `// A tiny Ktor API that runs the same on a laptop, a VM, or a container service.
// Container platforms such as Cloud Run tell your app which port to listen on via PORT.
fun main() {
    val port = System.getenv("PORT")?.toInt() ?: 8080
    embeddedServer(Netty, port = port) {
        routing {
            get("/health") { call.respondText("ok") }
            get("/api/headlines") { call.respond(headlineRepo.latest()) }
        }
    }.start(wait = true)
}`,
        remember: 'Pick the highest level that fits: managed or serverless first, VMs only when you need the control. You pay for what is switched on, not for what is used.',
        deeper: [
          { title: 'Regions and zones', body: '<p>Put your backend in a region close to your users, so requests travel less. Inside a region, spread copies across zones. Google Cloud\'s docs describe zones as separate pieces of infrastructure so that one outage does not hit all your resources at once. Different regions give even more independence, at the cost of keeping data in sync across a longer distance.</p>' },
          { title: 'IaaS, PaaS, serverless in one sentence each', body: '<p><b>VM (infrastructure)</b>: you get an OS and do the rest: updates, firewall, restarts. <b>Container service (platform)</b>: you hand over an image, the platform runs, restarts and scales it. <b>Serverless functions</b>: you hand over a function, it runs per event and you pay per call. They are not different worlds: Cloud Run, for example, runs containers and can still scale to zero.</p>' },
          { title: 'Pay per use cuts both ways', body: '<p>On Cloud Run with request-based billing you pay only while requests are handled, and a service with no minimum instances costs nothing when idle. The flip side: a bug that loops calls, or a bot hammering an endpoint, also bills you per use. Set budgets and alerts on the billing account from day one.</p>' },
        ],
        underHood: {
          body: '<p>A VM is a slice of a physical server made by a hypervisor; it boots a full OS. A container shares the host OS kernel and only packages your app and its files, so it starts in about the time your app takes to start. Serverless platforms keep a pool of warm machines and start your container or function on one when a request arrives. That start is the "cold start" you see as a slow first request.</p>',
        },
        mistakes: [
          {
            title: 'Sizing a fixed server for the peak',
            bad: '# one big VM, always on\nmachine: 16 vCPU, 64 GB   # sized for the 09:00 push',
            good: '# container service\nmin-instances: 1\nmax-instances: 20          # grows for the push, shrinks at night',
            why: 'Traffic for a news or push-driven app has sharp peaks. A fixed size is either wasted at night or too small at the peak.',
          },
          {
            title: 'Hard-coding the port',
            bad: 'embeddedServer(Netty, port = 8080)',
            good: 'embeddedServer(Netty, port = System.getenv("PORT")?.toInt() ?: 8080)',
            why: 'The platform decides which port your container listens on and passes it in. Read it from the environment.',
          },
        ],
        terms: [
          { term: 'Region / zone', def: 'A region is a geographic area of data centers. Zones are separate failure areas inside one region.' },
          { term: 'Managed service', def: 'Something the provider runs for you (a database, a queue), including backups, patches and failover.' },
          { term: 'Serverless', def: 'You deploy code, the platform runs it per request or event, and it can scale to zero when idle.' },
          { term: 'Cold start', def: 'The delay while a new instance starts because none was running to take the request.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the port that the container platform hands to your app.', code: 'val port = System.[[getenv]]("[[PORT]]")?.toInt() ?: 8080', why: 'Platforms like Cloud Run set PORT. The fallback keeps local runs working.' },
          { type: 'bug', prompt: 'The service is meant to cost nothing at night when nobody uses it. Tap the setting that stops that.', code: 'service: headlines-api\nregion: europe-west1\nmin-instances: 3\nmax-instances: 20\nconcurrency: 80', bug: 2, fix: 'min-instances: 0', why: 'Minimum instances stay running (and billed) even with zero traffic. Zero lets the service scale to zero, at the price of cold starts.' },
        ],
        quiz: [
          { q: 'Your API runs on one VM sized for the morning push burst. What happens at 03:00?', options: ['It shuts down automatically', 'It keeps running and you keep paying for it', 'The provider moves it to a cheaper zone'], a: 1, why: 'A VM is billed while it is on. Nothing scales it down unless you set that up.' },
          { q: 'Which trade-off fits serverless with scale to zero?', options: ['No idle cost, but the first request after a quiet period is slower', 'Fastest possible first request, higher idle cost', 'Full control over the OS'], a: 0, why: 'With no instance running, a new request has to wait for one to start: a cold start.' },
          { q: 'Why spread instances across zones in a region?', options: ['Zones are cheaper', 'So one infrastructure failure does not take all copies down', 'Because Android apps need it'], a: 1, why: 'Zones are separate failure areas. Copies in two zones survive one zone failing.' },
          { q: 'In the demo, why did the container service fall short at 09:00 even with autoscaling?', options: ['It has a fixed size', 'Traffic grew faster than new instances could start', 'Containers cannot scale'], a: 1, why: 'Autoscalers react to load they already see. A sudden burst, like a push to millions of devices, arrives before new instances are ready.' },
        ],
      },

      // ---------------------------------------------------------------- 2
      {
        id: 'docker',
        title: 'Containers with Docker',
        tagline: 'Package the app with everything it needs, so it runs the same on your laptop, in CI and in production.',
        level: 'beginner',
        body: `
<p>An <b>image</b> is a read-only package: an OS base, a runtime such as a JDK, your app and its settings. A <b>container</b> is a running process started from an image, isolated from other processes. One image can start many containers, the same way one APK installs on many phones.</p>
<p>A <b>Dockerfile</b> builds the image step by step. Each instruction makes a <b>layer</b>, and Docker caches layers. If a layer's input changes, that layer and <b>every layer after it</b> rebuild, even if their output would be the same. So put things that rarely change (base image, dependency list) first and your source code last.</p>
<p>This is why "works on my machine" goes away: the machine is part of the image. CI, staging and production all run the exact same image. Edit files below and watch which layers come from cache.</p>`,
        visual(el) {
          const GOOD = [
            { src: 'FROM gradle:jdk21 AS build', deps: [], sec: 0, note: 'pulled' },
            { src: 'WORKDIR /app', deps: [], sec: 0 },
            { src: 'COPY settings.gradle.kts build.gradle.kts ./', deps: ['gradle'], sec: 1 },
            { src: 'COPY gradle ./gradle', deps: ['gradle'], sec: 1 },
            { src: 'RUN gradle dependencies --no-daemon', deps: [], sec: 85 },
            { src: 'COPY src ./src', deps: ['src'], sec: 1 },
            { src: 'RUN gradle installDist --no-daemon', deps: [], sec: 35 },
          ];
          const BAD = [
            { src: 'FROM gradle:jdk21 AS build', deps: [], sec: 0, note: 'pulled' },
            { src: 'WORKDIR /app', deps: [], sec: 0 },
            { src: 'COPY . .', deps: ['gradle', 'src'], sec: 1 },
            { src: 'RUN gradle installDist --no-daemon', deps: [], sec: 120 },
          ];
          let order = 'good', built = false, busy = false, token = 0;
          const file = h('div', { class: 'cl-file', 'aria-live': 'polite' });
          const total = h('span', { class: 'cl-pill cl-ghost' }, 'no build yet');
          const o = out('');
          let rows = [];
          function paint() {
            const L = order === 'good' ? GOOD : BAD;
            rows = L.map(l => { const st = h('span', { class: 'cl-st' }, '—'); const r = h('div', { class: 'cl-layer' }, h('code', {}, l.src), st); r.st = st; return r; });
            file.replaceChildren(...rows);
          }
          async function build(changed, why) {
            if (busy) return; busy = true; const my = ++token;
            const L = order === 'good' ? GOOD : BAD;
            let dirty = !built, secs = 0;
            rows.forEach(r => { r.className = 'cl-layer'; r.st.textContent = '…'; });
            for (let i = 0; i < L.length; i++) {
              const l = L[i], r = rows[i];
              if (l.deps.some(d => changed.includes(d))) dirty = true;
              if (dirty) {
                r.classList.add('cl-run'); r.st.textContent = 'RUN';
                await sleep(140 + l.sec * 6); if (!el.isConnected || my !== token) return;
                r.classList.remove('cl-run'); r.classList.add('cl-did'); r.st.textContent = l.note && !built ? l.note : `${l.sec}s`; secs += l.sec;
              } else {
                await sleep(90); if (!el.isConnected || my !== token) return;
                r.classList.add('cl-hit'); r.st.textContent = 'CACHED';
              }
            }
            built = true; busy = false;
            total.className = 'cl-pill ' + (secs > 60 ? 'cl-warn' : 'cl-ok'); total.textContent = `build: ${secs}s`;
            say(o, why(secs));
          }
          const edit = () => build(['src'], s => order === 'good'
            ? `<span class="good">Only the last two layers ran (${s}s).</span> <span class="muted">Dependencies came from cache because build.gradle.kts did not change.</span>`
            : `<span class="bad">${s}s: dependencies downloaded again.</span> <span class="muted">COPY . . copies src too, so a one-line edit invalidates it and everything after it.</span>`);
          const dep = () => build(['gradle'], s => `<span class="good">Dependency list changed: ${s}s.</span> <span class="muted">Everything from that COPY on reruns. Expected: dependencies really did change.</span>`);
          const same = () => build([], () => (built ? '<span class="good">Nothing changed, every layer CACHED.</span> <span class="muted">The image is identical to the last one.</span>' : '<span class="muted">First build: no cache yet, so every layer runs.</span>'));
          const flip = act('Switch to COPY . . order', e => {
            if (busy) return;
            order = order === 'good' ? 'bad' : 'good'; built = false; paint();
            e.currentTarget.textContent = order === 'good' ? 'Switch to COPY . . order' : 'Switch to dependencies-first order';
            total.className = 'cl-pill cl-ghost'; total.textContent = 'no build yet';
            say(o, order === 'good' ? 'Dependencies-first order. Build once, then edit source.' : 'Everything copied in one step. Build once, then edit source.');
          });
          paint();
          say(o, 'Build once, then edit a source file and build again.');
          el.append(
            h('div', { class: 'controls' }, act('docker build', same), act('Edit src/Routes.kt + build', edit), act('Add a dependency + build', dep)),
            h('div', { class: 'cl-row' }, label('Dockerfile'), total, flip),
            file, o);
        },
        code: `# Dockerfile for a Kotlin (Ktor) backend. Multi-stage: build with Gradle, run on a small JRE image.
# (Docker comments must start a line: a # after an instruction is read as an argument.)
FROM gradle:jdk21 AS build
WORKDIR /app
# Build files rarely change. A directory source copies its contents, so name the target folder.
COPY settings.gradle.kts build.gradle.kts ./
COPY gradle ./gradle
# Cached until the files above change
RUN gradle dependencies --no-daemon
# Source changes on every commit, so it comes last
COPY src ./src
RUN gradle installDist --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
# installDist output is named after rootProject.name, here "api"
COPY --from=build /app/build/install/api ./
# Documents the port; it does not publish it
EXPOSE 8080
CMD ["./bin/api"]

# Build and run, publishing host port 8080 to container port 8080:
#   docker build -t headlines-api .
#   docker run -p 8080:8080 -e DATABASE_URL=... headlines-api`,
        remember: 'Order the Dockerfile from rarely changes to always changes. A changed layer rebuilds itself and everything after it.',
        deeper: [
          { title: 'Ports: EXPOSE is a note, -p is the switch', body: '<p><code>EXPOSE 8080</code> only records which port the app uses. Nothing outside can reach it until you publish it with <code>-p HOST:CONTAINER</code>. <code>docker run -p 8080:8080</code> sends traffic from your machine\'s port 8080 into the container\'s 8080. From an Android emulator, your machine is <code>10.0.2.2</code>, so the app can call <code>http://10.0.2.2:8080</code>.</p>' },
          { title: 'Volumes: data that outlives the container', body: '<p>A container\'s own files vanish when you remove it. For a local Postgres you want data to survive, so mount a <b>volume</b>: storage managed by Docker that exists outside any one container. Remove and recreate the container and the data is still there.</p>', code: 'docker volume create pgdata\ndocker run -d --name db -e POSTGRES_PASSWORD=dev \\\n  -v pgdata:/var/lib/postgresql/data -p 5432:5432 postgres:17' },
          { title: 'Multi-stage builds keep images small', body: '<p>The Gradle image with a full JDK is big. In a multi-stage build, the first stage compiles and the final stage copies only the built app onto a small runtime image. The final image has no build tools and no source, which means less to download and less to attack.</p>' },
          { title: '.dockerignore', body: '<p>The build context is everything you send to <code>docker build</code>. A <code>.dockerignore</code> file (same pattern style as <code>.gitignore</code>) keeps out <code>build/</code>, <code>.gradle/</code>, <code>.git/</code> and local secret files. Smaller context, faster builds, and no <code>local.properties</code> baked into an image by accident.</p>', code: '.git\n.gradle\nbuild\n**/build\nlocal.properties\n*.jks' },
        ],
        underHood: {
          body: '<p>Each layer is a set of file changes stored by content hash. An image is an ordered list of layers plus settings like <code>CMD</code>. When a container starts, Docker stacks the read-only layers and adds one thin writable layer on top for that container. That is why ten containers from one image share disk space, and why anything a container writes is lost when it is removed, unless it writes to a volume.</p>',
        },
        mistakes: [
          {
            title: 'Copying everything before installing dependencies',
            bad: 'COPY . .\nRUN gradle installDist',
            good: 'COPY settings.gradle.kts build.gradle.kts ./\nCOPY gradle ./gradle\nRUN gradle dependencies\nCOPY src ./src\nRUN gradle installDist',
            why: 'Any source edit invalidates <code>COPY . .</code>, so dependencies download again on every build.',
          },
          {
            title: 'Passing secrets as build arguments',
            bad: 'ARG DB_PASSWORD\nENV DB_PASSWORD=$DB_PASSWORD',
            good: '# pass at run time instead\ndocker run -e DB_PASSWORD=... headlines-api',
            why: 'Docker\'s docs warn that build args and env set in the Dockerfile persist in the image. Anyone who can pull it can read them.',
          },
        ],
        terms: [
          { term: 'Image', def: 'An immutable package of layers: base OS, runtime, app and settings.' },
          { term: 'Container', def: 'An isolated running process started from an image, with its own thin writable layer.' },
          { term: 'Layer cache', def: 'Docker reuses a layer when its instruction and inputs are unchanged; a change rebuilds it and all layers after it.' },
          { term: 'Volume', def: 'Docker-managed storage whose contents live outside any one container\'s lifecycle.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Run the image and publish host port 8080 to the container\'s port 8080.', code: 'docker [[run]] [[-p|--publish]] 8080:8080 headlines-api', why: '<code>-p HOST:CONTAINER</code> publishes the port. <code>EXPOSE</code> alone does not.' },
          { type: 'bug', prompt: 'Every one-line code change re-downloads all Gradle dependencies. Tap the line to blame.', code: 'FROM gradle:jdk21 AS build\nWORKDIR /app\nCOPY . .\nRUN gradle dependencies --no-daemon\nRUN gradle installDist --no-daemon', bug: 2, fix: 'COPY settings.gradle.kts build.gradle.kts ./', why: 'Copy only the build files (and the <code>gradle</code> folder, with <code>COPY gradle ./gradle</code>) before resolving dependencies, then copy <code>src</code> in a later layer.' },
        ],
        quiz: [
          { q: 'You edit one Kotlin file. In the dependencies-first Dockerfile, which layers rebuild?', options: ['All of them', 'COPY src and every layer after it', 'Only the FROM line'], a: 1, why: 'The COPY src layer\'s input changed, so it and all later layers run again. Earlier layers come from cache.' },
          { q: 'The Dockerfile says <code>EXPOSE 8080</code>. You run <code>docker run headlines-api</code>. Can your browser open localhost:8080?', options: ['Yes, EXPOSE published it', 'No, nothing is published without -p or -P', 'Only on Linux'], a: 1, why: 'EXPOSE documents the port. Publishing needs <code>-p 8080:8080</code> (or <code>-P</code> for all exposed ports).' },
          { q: 'You remove a Postgres container that had no volume and start a new one. Where is the data?', options: ['In the new container', 'Gone, it lived in the removed container\'s writable layer', 'In the image'], a: 1, why: 'Without a volume, writes go to the container\'s own layer, which is deleted with it.' },
          { q: 'Which is the main reason containers end "works on my machine" arguments?', options: ['They are faster than VMs', 'The runtime, libraries and settings travel inside the image, so every environment runs the same thing', 'Docker fixes bugs automatically'], a: 1, why: 'The image carries the environment. CI, staging and production run the identical image.' },
          { q: 'One image, five containers. How many copies of the image layers are on disk?', options: ['Five', 'One shared set, plus a thin writable layer per container', 'None until a container writes'], a: 1, why: 'Read-only layers are shared. Each container only adds its own small writable layer.' },
        ],
      },

      // ---------------------------------------------------------------- 3
      {
        id: 'pipelines',
        title: 'CI/CD pipelines',
        tagline: 'Every push goes through the same build, test, sign and deploy stages, so releasing is boring.',
        level: 'intermediate',
        body: `
<p><b>CI</b> (continuous integration) builds and tests every change; you met it in <a href="#tools.ci">CI on every pull request</a>. <b>CD</b> (continuous delivery) goes further: after the tests pass, the pipeline signs the build and ships it somewhere real. A failed stage stops everything after it, so a broken test never reaches users.</p>
<p>Ship through <b>environments</b>: <b>dev</b> for daily builds, <b>staging</b> that mirrors production with test data, and <b>prod</b>. In GitHub Actions an environment can hold its own secrets and require a reviewer before a job that uses it runs. That approval is your "are we sure?" button.</p>
<p>For the app, a pipeline can upload the signed bundle to the Play <b>internal testing</b> track (see <a href="#build.tracks">Play testing tracks</a>). For the backend, it builds a container image and deploys it to a host. Try a clean push, a failing test and a missing secret.</p>`,
        visual(el) {
          const ST = [
            { id: 'build', name: 'Build: bundleRelease + API image', t: '2m 10s' },
            { id: 'test', name: 'Test: unit tests (app + API)', t: '1m 40s' },
            { id: 'sign', name: 'Sign AAB with upload key', t: '8s' },
            { id: 'stg', name: 'Deploy: API → staging, AAB → Play internal', env: 'staging', t: '1m 05s' },
            { id: 'smoke', name: 'Smoke test: GET staging /health', env: 'staging', t: '4s' },
            { id: 'prod', name: 'API → production', env: 'prod', t: '58s', gate: true },
          ];
          const rows = ST.map(s => {
            const t = h('small', {}, '');
            const r = h('div', { class: 'cl-stage' }, h('span', { class: 'cl-dot' }), h('span', {}, s.name, s.env ? h('span', { class: 'cl-env' }, s.env) : null), t); r.t = t; return r;
          });
          const status = pill('idle', 'ghost');
          const o = out('');
          let busy = false, token = 0, waiting = null;
          const approve = act('Approve production', () => { if (waiting) { const w = waiting; waiting = null; approve.disabled = true; w(); } }, { disabled: true });
          async function step(i, my) {
            const r = rows[i]; r.className = 'cl-stage cl-on'; r.t.textContent = 'running';
            await sleep(520); return el.isConnected && my === token;
          }
          async function go(kind) {
            if (busy) return; busy = true; const my = ++token;
            rows.forEach(r => { r.className = 'cl-stage'; r.t.textContent = ''; });
            status.className = 'cl-pill cl-warn'; status.textContent = 'running';
            const failAt = kind === 'test' ? 'test' : kind === 'secret' ? 'sign' : null;
            for (let i = 0; i < ST.length; i++) {
              const s = ST[i], r = rows[i];
              if (s.gate) {
                r.className = 'cl-stage cl-wait'; r.t.textContent = 'waiting';
                say(o, '<span class="good">Staging is green and testers have the build.</span> <span class="muted">The production environment needs a reviewer. Click Approve.</span>');
                approve.disabled = false;
                await new Promise(res => { waiting = res; });
                if (!el.isConnected || my !== token) return;
              }
              if (!(await step(i, my))) return;
              if (s.id === failAt) {
                r.className = 'cl-stage cl-fail'; r.t.textContent = 'failed'; replay(r, 'shake');
                for (let j = i + 1; j < ST.length; j++) { rows[j].className = 'cl-stage cl-skip'; rows[j].t.textContent = 'skipped'; }
                status.className = 'cl-pill cl-err'; status.textContent = 'failed';
                say(o, failAt === 'test'
                  ? '<span class="bad">HeadlineParserTest > skips items without title FAILED.</span> <span class="muted">Nothing was signed or deployed. Users and testers never saw it.</span>'
                  : '<span class="bad">Keystore file not found: KEYSTORE_BASE64 is empty.</span> <span class="muted">An unset secret is an empty string. Add it to the repository or environment secrets.</span>');
                busy = false; return;
              }
              r.className = 'cl-stage cl-pass'; r.t.textContent = s.t;
            }
            status.className = 'cl-pill cl-ok'; status.textContent = 'deployed';
            say(o, '<span class="good">Production updated.</span> <span class="muted">The same commit, image and bundle went through every stage. Promote the app from internal to production in Play when testers are happy.</span>');
            busy = false;
          }
          say(o, 'Push a commit to main.');
          el.append(
            h('div', { class: 'controls' }, act('Push to main', () => go('ok')), act('Push with a failing test', () => go('test')), act('Push with keystore secret missing', () => go('secret')), approve),
            h('div', { class: 'cl-row' }, label('workflow: release'), status),
            h('div', { class: 'cl-pipe' }, rows), o);
        },
        code: `# .github/workflows/release.yml (shortened)
on:
  push:
    branches: [main]

jobs:
  app:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-java@v5
        with: { distribution: temurin, java-version: 17 }
      - uses: gradle/actions/setup-gradle@v6
      - run: ./gradlew testReleaseUnitTest
      - name: Restore upload keystore
        run: echo "$KEYSTORE_BASE64" | base64 --decode > app/upload.jks
        env:
          KEYSTORE_BASE64: \${{ secrets.KEYSTORE_BASE64 }}
      - name: Build, sign and upload to the internal track
        run: ./gradlew publishReleaseBundle   # Gradle Play Publisher, default track: internal
        env:
          KEYSTORE_PASSWORD: \${{ secrets.KEYSTORE_PASSWORD }}
          KEY_PASSWORD: \${{ secrets.KEY_PASSWORD }}
          ANDROID_PUBLISHER_CREDENTIALS: \${{ secrets.PLAY_SERVICE_ACCOUNT_JSON }}

  api-prod:
    needs: app
    runs-on: ubuntu-latest
    environment: production          # required reviewer + prod-only secrets
    steps:
      - uses: actions/checkout@v6
      # (Google Cloud auth step omitted)
      - run: gcloud run deploy headlines-api --source . --region europe-west1`,
        remember: 'One pipeline, same artifact, every stage: build, test, sign, deploy to staging, then a human approves production.',
        deeper: [
          { title: 'Uploading to Play from CI', body: '<p>Two common tools talk to the Google Play Developer API. <b>Gradle Play Publisher</b> (plugin <code>com.github.triplet.play</code>, 4.1.1 at the time of writing) adds tasks like <code>publishBundle</code>; its default track is <code>internal</code>. Its README says it is in maintenance mode: issues are ignored, pull requests are not. <b>fastlane</b>\'s <code>upload_to_play_store</code> (alias <code>supply</code>) does the same from Ruby; its default track is <code>production</code>, so pass <code>track: "internal"</code> explicitly.</p><p>Both need a Google Cloud service account with the Play Developer API turned on, invited in Play Console under Users and permissions. The very first upload of a new app must be done by hand in Play Console, because the API cannot register a new app.</p>', code: '// app/build.gradle.kts\nplugins {\n    id("com.android.application")\n    id("com.github.triplet.play") version "4.1.1"\n}\nplay {\n    track.set("internal")\n    // credentials come from ANDROID_PUBLISHER_CREDENTIALS in CI\n}' },
          { title: 'Build once, promote the same thing', body: '<p>Do not rebuild for production. Build one container image (tagged with the commit SHA) and one signed bundle, test those, and promote <i>the same files</i> from staging to production. A rebuild can pull a newer dependency or base image, and then what you tested is not what you shipped.</p>' },
          { title: 'Environments and approvals', body: '<p>In GitHub, a job with <code>environment: production</code> must pass that environment\'s protection rules before it runs or reads its secrets. Rules include required reviewers (up to 6, one approval is enough), a wait timer, and which branches may deploy. Put production secrets only in the production environment, so a pull request job can never see them.</p>' },
          { title: 'Roll forward, roll back', body: '<p>Pair the pipeline with a way out. On the backend, keep the previous image so you can switch back in seconds. On the app you cannot pull a version off phones, so use staged rollouts and <a href="#launch.flags">feature flags</a> to turn a broken feature off without a new release.</p>' },
        ],
        mistakes: [
          {
            title: 'Rebuilding for each environment',
            bad: 'deploy-staging: ./gradlew build && deploy\ndeploy-prod:    ./gradlew build && deploy',
            good: 'build:   image tagged :$GITHUB_SHA\nstaging: deploy :$GITHUB_SHA\nprod:    deploy :$GITHUB_SHA (after approval)',
            why: 'Two builds are two different artifacts. Promote the exact one you tested.',
          },
          {
            title: 'Assuming fastlane uploads to internal',
            bad: 'upload_to_play_store(aab: "app-release.aab")',
            good: 'upload_to_play_store(aab: "app-release.aab", track: "internal")',
            why: 'fastlane\'s default track is <code>production</code>. Be explicit about where the build goes.',
          },
        ],
        terms: [
          { term: 'Continuous delivery', def: 'Every change that passes the pipeline is built, signed and deployed to at least one real environment automatically.' },
          { term: 'Environment', def: 'A named deploy target (dev, staging, prod) with its own config, secrets and protection rules.' },
          { term: 'Artifact', def: 'The built output that moves through the pipeline: a signed AAB or a container image.' },
          { term: 'Smoke test', def: 'A quick check after deploy (does /health answer?) that catches a dead deployment early.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the job wait for the production environment\'s reviewers and use its secrets.', code: 'api-prod:\n  needs: app\n  runs-on: ubuntu-latest\n  [[environment]]: [[production]]', why: 'A job that references an environment must pass its protection rules before it runs or reads its secrets.' },
          { type: 'bug', prompt: 'This lane was meant to send builds to testers, but users got them. Tap the line.', code: 'lane :beta do\n  gradle(task: "bundle", build_type: "Release")\n  upload_to_play_store(\n    aab: lane_context[SharedValues::GRADLE_AAB_OUTPUT_PATH]\n  )\nend', bug: 3, fix: '    aab: lane_context[SharedValues::GRADLE_AAB_OUTPUT_PATH], track: "internal"', why: 'Without <code>track</code>, fastlane uploads to <code>production</code>.' },
        ],
        quiz: [
          { q: 'Put the stages in order.', options: ['Build → Sign → Test → Deploy', 'Build → Test → Sign → Deploy staging → Approve → Deploy prod', 'Deploy staging → Build → Test → Deploy prod'], a: 1, why: 'Test before you sign and ship anything, and let staging prove the deploy before a human approves production.' },
          { q: 'The unit test stage fails. What happens to the deploy stages?', options: ['They run anyway', 'They are skipped', 'Only production is skipped'], a: 1, why: 'A failed stage stops the stages that depend on it. That is the point of the pipeline.' },
          { q: 'The workflow reads <code>${{ secrets.KEYSTORE_BASE64 }}</code>, but nobody created that secret. What does the step get?', options: ['An error before the job starts', 'An empty string', 'The value from your laptop'], a: 1, why: 'GitHub evaluates an unset secret to an empty string, so the failure shows up later, when decoding or signing.' },
          { q: 'Why must the first release of a new app be uploaded by hand in Play Console?', options: ['Google wants a human to read the code', 'The Play Developer API cannot register a new app', 'CI cannot sign apps'], a: 1, why: 'Gradle Play Publisher\'s README says registering the app cannot be done through the API. After that, CI can take over.' },
          { q: 'Staging passed with image <code>:a1b2c3</code>. Which trade-off fits "rebuild from main for production"?', options: ['Safer, because it is fresh', 'Riskier: the new build may differ from what you tested', 'No difference'], a: 1, why: 'A rebuild can pick up different dependencies or base images. Promote the tested artifact.' },
        ],
      },

      // ---------------------------------------------------------------- 4
      {
        id: 'secrets',
        title: 'Configuration and secrets',
        tagline: 'Config lives in the environment, secrets live in a vault, and neither lives in git.',
        level: 'intermediate',
        body: `
<p>The same build runs in dev, staging and prod, so anything that differs between them (database URL, API base URL, log level) comes from <b>configuration</b>, usually <b>environment variables</b>. The code reads <code>System.getenv("DATABASE_URL")</code> and does not care where it runs.</p>
<p>A <b>secret</b> is config that grants access: passwords, private keys, server API keys. Keep secrets in a <b>secret manager</b> (GitHub Actions secrets, Google Cloud Secret Manager and similar) and inject them at run time. Once a secret is in a git commit, deleting it in the next commit is not enough: it is still in history and in every clone. <b>Rotate it.</b></p>
<p>Not every key is a secret. Firebase says its API keys in <code>google-services.json</code> only identify your project, and access is controlled by Security Rules and App Check. They are fine in the app, as long as they are restricted to Firebase APIs. A server key, a database password or a Play service account file is a real secret. Scan this commit before pushing it. For the app side, see <a href="#security.secrets">secrets in the app</a>.</p>`,
        visual(el) {
          const FILES = [
            { name: 'app/build.gradle.kts', lines: [
              { src: 'signingConfigs { create("release") {' },
              { src: '    storePassword = "Secret2026!"', kind: 'flag', why: 'Keystore password in source.', fix: '    storePassword = System.getenv("KEYSTORE_PASSWORD")' },
              { src: '    keyAlias = "upload"' },
            ] },
            { name: 'api/src/main/kotlin/Payments.kt', lines: [
              { src: 'private const val PAYMENT_SECRET = "sk_live_51Hx9TrQ2vYb7"', kind: 'flag', why: 'Live server-side payment key.', fix: 'private val PAYMENT_SECRET = System.getenv("PAYMENT_SECRET")' },
            ] },
            { name: 'play-service-account.json', lines: [
              { src: '"private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEv..."', kind: 'flag', why: 'Service account private key: can publish your app.', fix: '(file removed, added to .gitignore, stored as a CI secret)' },
            ] },
            { name: 'app/google-services.json', lines: [
              { src: '"current_key": "AIzaSyB2kX9fQwz4Lr8tVn1mPq7sYc3Ud0eHj5o"', kind: 'info', why: 'Firebase API key: identifies the project, OK in the app if restricted to Firebase APIs.' },
            ] },
            { name: '.env', lines: [
              { src: 'DATABASE_URL=postgres://admin:s3cr3t@10.0.0.4/news', kind: 'flag', why: 'Password inside a connection URL.', fix: '(file removed, .env added to .gitignore)' },
            ] },
          ];
          let scanned = false, pushed = false;
          const all = [];
          const repo = h('div', { class: 'cl-file cl-repo' });
          for (const f of FILES) {
            const box = h('div', {}, h('div', { class: 'cl-fname' }, f.name));
            for (const l of f.lines) {
              const code = h('code', {}, l.src);
              const r = h('div', { class: 'cl-line' }, code); r.l = l; r.code = code; r.open = l.kind === 'flag';
              all.push(r); box.append(r);
            }
            repo.append(box);
          }
          const status = pill('not scanned', 'ghost');
          const o = out('');
          const left = () => all.filter(r => r.l.kind === 'flag' && r.open).length;
          function paintStatus() {
            const n = left();
            status.className = 'cl-pill ' + (!scanned ? 'cl-ghost' : n ? 'cl-err' : 'cl-ok');
            status.textContent = !scanned ? 'not scanned' : n ? `${n} secret${n > 1 ? 's' : ''} found` : 'clean';
          }
          function scan() {
            scanned = true;
            for (const r of all) {
              r.querySelectorAll('.cl-why, .cl-fix').forEach(x => x.remove());
              if (r.l.kind === 'info') { r.classList.add('cl-info'); r.append(h('span', { class: 'cl-why' }, 'note: ' + r.l.why)); }
              if (r.l.kind === 'flag' && r.open) {
                r.classList.add('cl-flag'); replay(r, 'pop-soft');
                r.append(h('button', { class: 'cl-fix', onclick() {
                  r.open = false; r.code.textContent = r.l.fix; r.className = 'cl-line cl-fixed';
                  r.querySelectorAll('.cl-why, .cl-fix').forEach(x => x.remove());
                  paintStatus();
                  say(o, left() ? `<span class="good">Moved out of the code.</span> <span class="muted">${left()} left.</span>` : '<span class="good">No secrets left in this commit.</span> <span class="muted">Now push.</span>');
                } }, 'fix'), h('span', { class: 'cl-why' }, r.l.why));
              }
            }
            paintStatus();
            say(o, left() ? `<span class="bad">${left()} secrets in this commit.</span> <span class="muted">Tap fix on each. The Firebase key is flagged as a note, not a leak.</span>` : '<span class="good">Clean.</span>');
          }
          function push() {
            if (pushed) { say(o, '<span class="muted">Already pushed.</span>'); return; }
            if (!scanned) scan();
            if (left()) {
              replay(repo, 'shake');
              say(o, '<span class="bad">Push blocked: secret scanning found credentials.</span> <span class="muted">GitHub push protection is on by default for your account when pushing to public repos. Do not rely on it alone: private repos and other hosts may not check.</span>');
              return;
            }
            pushed = true;
            say(o, '<span class="good">Pushed a clean commit.</span> <span class="muted">If the old values were ever pushed before, they are still in history: rotate the passwords and keys, then reset the Play upload key if it leaked.</span>');
          }
          say(o, 'Scan the commit before you push it.');
          el.append(h('div', { class: 'controls' }, act('Scan commit', scan), act('git push', push)), h('div', { class: 'cl-row' }, label('staged changes'), status), repo, o);
        },
        code: `// app/build.gradle.kts: signing values come from the environment (CI secrets) or local, ignored files.
android {
    signingConfigs {
        create("release") {
            storeFile = file(System.getenv("KEYSTORE_PATH") ?: "upload.jks")
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = System.getenv("KEY_ALIAS") ?: "upload"
            keyPassword = System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release { signingConfig = signingConfigs.getByName("release") }
    }
}

// Backend: read config once at startup and fail fast if it is missing.
val databaseUrl = System.getenv("DATABASE_URL")
    ?: error("DATABASE_URL is not set")`,
        remember: 'Config from the environment, secrets from a secret manager, nothing secret in git. A leaked secret gets rotated, not just deleted.',
        deeper: [
          { title: 'The keystore in CI', body: '<p>GitHub secrets are text, so a keystore file goes in as Base64 and the workflow decodes it to a file before the build. GitHub\'s docs note Base64 is an encoding, not encryption, and that secrets larger than 48 KB need a different approach (encrypt the file, commit it, store the passphrase as a secret). Keep the passwords in separate secrets. Delete the decoded file at the end, or rely on the runner being thrown away.</p>', code: 'base64 -i upload.jks | pbcopy        # macOS: copy, then paste into a repo secret\n# in the workflow:\necho "$KEYSTORE_BASE64" | base64 --decode > app/upload.jks' },
          { title: 'Upload key vs app signing key', body: '<p>With Play App Signing, Google holds the <b>app signing key</b> that signs what users install. You hold only the <b>upload key</b>. If the upload key leaks or is lost, you can request an upload key reset in Play Console and keep publishing. That is a strong reason to use Play App Signing: the key that lives in CI is the one that can be replaced. More in <a href="#build.signing">Signing</a>.</p>' },
          { title: 'Secret managers on the server', body: '<p>On the backend, store secrets in a manager such as Google Cloud Secret Manager. It keeps versions (so you can roll back), limits who can read each secret with IAM roles, and makes rotation a routine change instead of a code change. Your container reads the value as an env var or a mounted file at start.</p>' },
          { title: 'Fork pull requests get no secrets', body: '<p>GitHub does not pass secrets (other than <code>GITHUB_TOKEN</code>) to workflows triggered from forks, and Dependabot runs have no access either. So signing and deploy jobs should run on pushes to your own branches, not on outside pull requests.</p>' },
        ],
        underHood: {
          body: '<p>Secret scanners match known shapes: provider prefixes like <code>sk_live_</code> or <code>AIza</code>, PEM headers like <code>-----BEGIN PRIVATE KEY-----</code>, and high-entropy strings near words like <code>password</code>. GitHub masks secret values in Actions logs when they appear as-is, but its docs say not to print them anyway, and a value that is transformed (Base64, split) will not be masked. Use <code>::add-mask::</code> for derived values you must handle.</p>',
          code: '- run: |\n    TOKEN=$(./fetch-token.sh)\n    echo "::add-mask::$TOKEN"\n    echo "TOKEN=$TOKEN" >> "$GITHUB_ENV"',
        },
        mistakes: [
          {
            title: 'Deleting the leaked key in a new commit',
            bad: 'git rm play-service-account.json\ngit commit -m "remove key"',
            good: '# 1. revoke the key in Google Cloud and create a new one\n# 2. store the new one as a CI secret\n# 3. then remove the file and ignore it',
            why: 'The old commit still has the key, and so does every clone and fork. Only revoking it makes it useless.',
          },
          {
            title: 'Putting a server key in the app',
            bad: 'buildConfigField("String", "PAYMENT_SECRET", "\\"sk_live_...\\"")',
            good: '// app calls your backend; the backend holds PAYMENT_SECRET\napi.createPayment(orderId)',
            why: 'Anything in an APK can be extracted. Keys that grant server-side power stay on the server.',
          },
        ],
        terms: [
          { term: 'Environment variable', def: 'A named value the OS passes to a process at start. The usual way to hand config to a container.' },
          { term: 'Secret manager', def: 'A service that stores secrets with access control, versions and audit, and hands them to apps at run time.' },
          { term: 'Rotation', def: 'Replacing a secret with a new value and revoking the old one.' },
          { term: 'Push protection', def: 'GitHub secret scanning that blocks a push when it detects known credential formats.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Decode the keystore from a repository secret into a file in CI.', code: 'run: echo "$KEYSTORE_BASE64" | base64 [[--decode|-d]] > app/upload.jks\nenv:\n  KEYSTORE_BASE64: ${{ [[secrets]].KEYSTORE_BASE64 }}', why: 'The secret holds Base64 text. The <code>secrets</code> context reads it and <code>base64 --decode</code> turns it back into the file.' },
          { type: 'bug', prompt: 'One line puts a real secret into the APK. Tap it.', code: 'defaultConfig {\n    applicationId = "com.example.news"\n    buildConfigField("String", "API_BASE", "\\"https://api.example.com\\"")\n    buildConfigField("String", "DB_PASSWORD", "\\"s3cr3t\\"")\n}', bug: 3, fix: '    // DB_PASSWORD stays on the server; the app only knows API_BASE', why: 'A base URL is config. A database password is a secret, and anything in BuildConfig ships in the APK.' },
        ],
        quiz: [
          { q: 'A Play service account JSON was pushed to a private repo last week. What do you do first?', options: ['Delete the file in a new commit', 'Revoke the key and create a new one', 'Make the repo private again'], a: 1, why: 'The key is in history and in clones. Revoking it is the only thing that makes the leak harmless.' },
          { q: 'Which of these is fine to ship inside the app?', options: ['A Firebase API key restricted to Firebase APIs', 'A database password', 'A Play service account private key'], a: 0, why: 'Firebase says its keys only identify the project; Security Rules and App Check control access. The others grant real power.' },
          { q: 'Which line is the problem? (1) <code>val url = System.getenv("API_BASE")</code> (2) <code>ARG DB_PASSWORD</code> in a Dockerfile (3) <code>env: KEY: ${{ secrets.KEY }}</code>', options: ['Line 1', 'Line 2', 'Line 3'], a: 1, why: 'Docker build args persist in the image. Pass secrets at run time or with a build secret mount.' },
          { q: 'Why is Play App Signing helpful if the CI keystore leaks?', options: ['It encrypts the APK', 'The leaked key is only the upload key, and Play can reset it', 'It deletes leaked keys automatically'], a: 1, why: 'Google holds the app signing key. You can request an upload key reset and keep updating the same app.' },
        ],
      },

      // ---------------------------------------------------------------- 5
      {
        id: 'baas',
        title: 'Backend-as-a-service',
        tagline: 'Firebase, Supabase or your own server: pick by your data, your team and how easily you can leave.',
        level: 'intermediate',
        body: `
<p>A <b>backend-as-a-service (BaaS)</b> gives you auth, a database, file storage and server functions behind an SDK, with no servers to run. It is the fastest way to a working app. The cost is <b>lock-in</b>: your data model and code start to depend on one vendor.</p>
<p><b>Firebase</b> (Google) centers on Cloud Firestore, a document database with offline persistence on by default on Android, plus Auth, Storage and Cloud Functions. Cloud Functions and Cloud Storage need the pay-as-you-go Blaze plan. <b>Supabase</b> gives every project a full Postgres database, with Auth, Row Level Security policies, Storage, Realtime and Edge Functions (TypeScript on Deno). It can be self-hosted with Docker. <b>Your own server</b> (for example Ktor plus Postgres in a container) gives full control and the most work.</p>
<p>Push notifications do not decide this: FCM works with any backend that can call its API (see <a href="#push.fcm">FCM</a>). Pick your requirements and see how the options move.</p>`,
        visual(el) {
          const OPTS = [['fb', 'Firebase'], ['sb', 'Supabase'], ['own', 'Own server']];
          const REQS = [
            { id: 'sql', label: 'Relational data with joins', s: { fb: [-2, 'Firestore is a document database; joins mean extra reads or duplicated data'], sb: [2, 'Every project is a full Postgres database'], own: [2, 'Any database you like'] } },
            { id: 'off', label: 'Offline cache with no extra code', s: { fb: [2, 'Firestore offline persistence is on by default on Android'], sb: [-1, 'You build the cache yourself, for example with Room'], own: [-1, 'You build the cache yourself, for example with Room'] } },
            { id: 'fast', label: 'Two people, ship in weeks', s: { fb: [2, 'Auth, database and SDKs on day one'], sb: [2, 'Auth, database and APIs on day one'], own: [-2, 'You write and run auth, APIs, backups'] } },
            { id: 'self', label: 'Data must stay on servers we run', s: { fb: [-3, 'Runs only on Google\'s infrastructure'], sb: [2, 'Can be self-hosted with Docker'], own: [3, 'It is your server'] } },
            { id: 'logic', label: 'Heavy server logic, long jobs', s: { fb: [0, 'Cloud Functions work, but need the Blaze plan'], sb: [0, 'Edge Functions suit short TypeScript tasks'], own: [2, 'Any code, any runtime, any duration'] } },
            { id: 'free', label: 'Hobby project, zero budget', s: { fb: [1, 'Spark plan is free, without Cloud Functions or Storage'], sb: [1, 'Free plan, but projects pause after 7 days of low activity'], own: [-1, 'A server costs money even when idle, unless it scales to zero'] } },
            { id: 'exit', label: 'Easy to move away later', s: { fb: [-2, 'Firestore data and rules do not map directly to other databases'], sb: [1, 'Standard Postgres you can dump and restore elsewhere'], own: [2, 'Nothing to migrate away from'] } },
            { id: 'push', label: 'Push notifications', s: { fb: [0, 'FCM works with any backend'], sb: [0, 'FCM works with any backend'], own: [0, 'FCM works with any backend'] } },
          ];
          const on = new Set(['fast']);
          const bars = OPTS.map(([id, name]) => {
            const fill = h('div', { class: 'cl-fill' }); const num = h('b', {}, '0');
            const r = h('div', { class: 'cl-bar' }, h('span', {}, name), h('div', { class: 'cl-track' }, fill), num); r.fill = fill; r.num = num; r.id = id; return r;
          });
          const notes = h('ul', { class: 'cl-notes' });
          const head = h('div', { class: 'cl-row' });
          const o = out('');
          function paint() {
            const score = Object.fromEntries(OPTS.map(([id]) => [id, 0]));
            for (const r of REQS) if (on.has(r.id)) for (const [id] of OPTS) score[id] += r.s[id][0];
            const vals = Object.values(score), lo = Math.min(0, ...vals), hi = Math.max(1, ...vals);
            const best = Math.max(...vals);
            const tops = OPTS.filter(([id]) => score[id] === best).map(([id]) => id);
            bars.forEach(b => {
              b.fill.style.width = `${Math.max(4, ((score[b.id] - lo) / (hi - lo || 1)) * 100)}%`;
              b.num.textContent = (score[b.id] > 0 ? '+' : '') + score[b.id];
              b.classList.toggle('cl-top', on.size > 0 && tops.includes(b.id));
            });
            const pick = tops[0], name = OPTS.find(x => x[0] === pick)[1];
            head.replaceChildren(label('why'), pill(tops.length > 1 ? 'tie: ' + tops.map(t => OPTS.find(x => x[0] === t)[1]).join(' / ') : name, 'ok'));
            notes.replaceChildren(...REQS.filter(r => on.has(r.id)).map(r => {
              const [v, why] = r.s[pick];
              return h('li', { class: v > 0 ? 'cl-plus' : v < 0 ? 'cl-minus' : 'cl-zero' }, h('b', {}, r.label + ': '), why);
            }));
            say(o, !on.size ? '<span class="muted">Pick at least one requirement.</span>'
              : tops.length > 1 ? '<span class="good">A tie.</span> <span class="muted">Add the requirement that matters most to break it. Real choices usually hinge on one or two.</span>'
                : `<span class="good">${name} fits these requirements best.</span> <span class="muted">Scores are a teaching aid, not a verdict: weigh the minus points.</span>`);
          }
          const reqBtns = REQS.map(r => h('button', { class: 'cl-req', 'aria-pressed': String(on.has(r.id)), onclick(e) {
            on.has(r.id) ? on.delete(r.id) : on.add(r.id);
            e.currentTarget.setAttribute('aria-pressed', String(on.has(r.id))); paint();
          } }, r.label));
          el.append(label('your requirements'), h('div', { class: 'cl-reqs' }, reqBtns), h('div', { class: 'cl-box' }, h('div', { class: 'cl-bars' }, bars), head, notes), o);
          paint();
        },
        code: `// Keep the BaaS behind your own interface, so the rest of the app does not know which one you chose.
interface HeadlineSource {
    suspend fun latest(category: String): List<Headline>
}

class FirestoreHeadlines(private val db: FirebaseFirestore) : HeadlineSource {
    override suspend fun latest(category: String): List<Headline> =
        db.collection("headlines")
            .whereEqualTo("category", category)        // e.g. "sports", "business"
            .orderBy("publishedAt", Query.Direction.DESCENDING)
            .limit(20)
            .get().await()
            .toObjects(Headline::class.java)
}

// Moving to Supabase or your own API later means a new HeadlineSource, not a rewrite.`,
        remember: 'Start with a BaaS if it fits your data, but keep it behind your own interface. The cheapest migration is the one you planned for.',
        deeper: [
          { title: 'Security moves to rules and policies', body: '<p>With a BaaS the app talks to the database directly, so the database must decide who can read what. In Firebase that is <b>Security Rules</b>; in Supabase it is Postgres <b>Row Level Security</b> policies. A missing rule is the classic BaaS breach: the app works, and so does anyone else\'s script.</p>', code: '-- Supabase: users can read only their own saved articles\nalter table saved_articles enable row level security;\ncreate policy "own rows" on saved_articles\n  for select using (auth.uid() = user_id);' },
          { title: 'Free tiers have shapes', body: '<p>Firebase Spark includes Firestore with daily quotas (50K reads and 20K writes per day for the Standard edition) and Auth, but not Cloud Functions or Cloud Storage. Supabase Free gives two free projects, a 500 MB database per project, and pauses projects with low activity over 7 days. Read the pricing pages for the numbers that matter to your app: they change.</p>' },
          { title: 'Kotlin clients', body: '<p>Firebase ships official Android SDKs. For Supabase, the Kotlin client <code>supabase-kt</code> is documented on supabase.com but is a community library, not an official one. Your own server can share Kotlin models with the app through a <a href="#kmp">Kotlin Multiplatform</a> module.</p>' },
          { title: 'Mixing is normal', body: '<p>Many apps use Firebase for FCM, Crashlytics and Remote Config while their data lives in their own Postgres. Pick per job: the push and crash tools are free on the Spark plan and do not lock in your data.</p>' },
        ],
        mistakes: [
          {
            title: 'BaaS calls spread through the UI',
            bad: '@Composable fun Feed() {\n    LaunchedEffect(Unit) { Firebase.firestore.collection("headlines").get() }\n}',
            good: 'class FeedViewModel(private val source: HeadlineSource) : ViewModel()',
            why: 'When the SDK is called from screens, switching vendors means touching every screen. Behind an interface, it is one class.',
          },
          {
            title: 'Leaving the database open "for now"',
            bad: 'match /{document=**} {\n  allow read, write: if true;\n}',
            good: 'match /users/{uid}/saved/{id} {\n  allow read, write: if request.auth != null && request.auth.uid == uid;\n}',
            why: 'With a BaaS, rules are your backend. An open rule means anyone with your project id can read and write everything.',
          },
        ],
        terms: [
          { term: 'BaaS', def: 'Backend-as-a-service: hosted auth, database, storage and functions used through an SDK.' },
          { term: 'Vendor lock-in', def: 'How hard and costly it is to move your data and code to another provider.' },
          { term: 'Row Level Security', def: 'Postgres policies that decide, per row, which user can read or change it.' },
          { term: 'Security Rules', def: 'Firebase\'s rules language that decides who can read or write Firestore, Realtime Database and Storage data.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn on per-row access control for a Supabase table.', code: 'alter table saved_articles enable [[row level security]];', why: 'Without RLS enabled, policies do nothing and the table is open to the client API key.' },
          { type: 'bug', prompt: 'This Firestore rule lets any visitor rewrite every user\'s data. Tap the line.', code: 'rules_version = \'2\';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /users/{uid}/{doc=**} {\n      allow read, write: if true;\n    }\n  }\n}', bug: 4, fix: '      allow read, write: if request.auth != null && request.auth.uid == uid;', why: 'Check that the signed-in user owns the path. <code>if true</code> allows everyone.' },
        ],
        quiz: [
          { q: 'Your news app needs joins between articles, authors and tags, and the data must be on servers your company runs. Which trade-off fits?', options: ['Firebase: fastest to start', 'Supabase self-hosted or your own server: SQL and you run it', 'Any of them, it does not matter'], a: 1, why: 'Relational data favors Postgres, and "we run it" rules out Firebase, which runs only on Google\'s infrastructure.' },
          { q: 'You need a Cloud Function that runs when a document is written. Which Firebase plan?', options: ['Spark', 'Blaze', 'Either'], a: 1, why: 'Firebase\'s pricing page lists Cloud Functions as Blaze only.' },
          { q: 'Does choosing Supabase stop you from sending FCM push notifications?', options: ['Yes, FCM needs Firebase as the database', 'No, any backend can call FCM', 'Only on Android 13+'], a: 1, why: 'FCM is a separate service. Your Supabase function or own server can send messages through its API.' },
          { q: 'What does wrapping Firestore in a <code>HeadlineSource</code> interface buy you?', options: ['Faster queries', 'One place to change if you switch backends, and an easy fake for tests', 'Offline support'], a: 1, why: 'The rest of the app depends on your interface, not the vendor SDK.' },
        ],
      },

      // ---------------------------------------------------------------- 6
      {
        id: 'observability',
        title: 'Observability',
        tagline: 'Logs, metrics and traces, joined by one request id, so a crash on a phone points to the server line that caused it.',
        level: 'intermediate',
        body: `
<p><b>Observability</b> is being able to answer "what is going wrong, and where?" from the data your system sends out. OpenTelemetry groups that data into signals. <b>Logs</b> are timestamped events ("payment failed for order 812"). <b>Metrics</b> are numbers over time (requests per second, error rate, p95 latency). <b>Traces</b> follow one request through every service it touches, as a tree of timed <b>spans</b>.</p>
<p><b>Dashboards</b> show metrics at a glance. <b>Alerts</b> page someone when a metric stays bad, such as "error rate above 2% for 5 minutes". Alert on what users feel (errors, latency), not on every CPU blip.</p>
<p>The glue is an id. The app sends a request id (or a W3C <code>traceparent</code> header) with each call, and records it in the crash report (see <a href="#launch.crashes">Crash reporting</a>). On the server every log line carries the same id. Try it: make a request fail, then follow the id.</p>`,
        visual(el) {
          const ID = 'a91f-3c7e';
          const LOGS = [
            ['09:00:01.120', 'gateway', 'GET /api/headlines 200 41ms', '5d02-91aa'],
            ['09:00:01.402', 'gateway', 'GET /api/headlines/812 → feed', ID],
            ['09:00:01.405', 'feed', 'load article 812', ID],
            ['09:00:01.511', 'auth', 'token ok user=4471', '77c1-0b2e'],
            ['09:00:01.530', 'feed', 'query related(812) on postgres', ID],
            ['09:00:02.050', 'gateway', 'GET /api/weather 200 18ms', '0e3b-6612'],
            ['09:00:04.531', 'feed', 'ERROR query timeout after 3000ms', ID, true],
            ['09:00:04.533', 'gateway', 'GET /api/headlines/812 503 3131ms', ID, true],
            ['09:00:04.900', 'gateway', 'GET /api/headlines 200 38ms', 'c4d8-2f19'],
          ];
          const SPANS = [['app: openArticle', 0, 100], ['gateway', 4, 96], ['feed: loadArticle', 6, 92], ['postgres: related()', 12, 86, true]];
          const logRows = LOGS.map(([t, svc, msg, id, err]) => h('div', { class: 'cl-log' }, `${t} `, h('span', { class: 'cl-svc' }, svc.padEnd(7)), ' ', err ? h('span', { class: 'cl-e' }, msg) : msg, ` req=${id}`));
          logRows.forEach((r, i) => { r.id = LOGS[i][3]; });
          const crash = h('div', { class: 'cl-crash', hidden: true }, `Crashlytics · non-fatal · ArticleDetailViewModel\nHttpException: HTTP 503 · last_request_id=${ID}`);
          const spanBars = SPANS.map(([n, s, w, slow]) => { const b = h('i', { class: 'cl-sbar' + (slow ? ' cl-slow' : ''), style: `left:${s}%` }); b.w = w; return h('div', { class: 'cl-span' }, h('span', {}, n), h('div', { class: 'cl-lane' }, b)); });
          const trace = h('div', { class: 'cl-box', hidden: true }, label(`trace ${ID} · 3.13 s`), h('div', { class: 'cl-spans' }, spanBars));
          const logs = h('div', { class: 'cl-logs', 'aria-label': 'Server logs' }, logRows);
          const o = out('');
          let failed = false;
          const fail = () => {
            failed = true; crash.hidden = false; replay(crash, 'shake');
            say(o, '<span class="bad">A user opened article 812 and saw an error.</span> <span class="muted">The crash report has the request id the app sent. The server logs are mixed with everyone else\'s traffic.</span>');
          };
          const find = () => {
            if (!failed) fail();
            logRows.forEach(r => { r.classList.toggle('cl-dim', r.id !== ID); r.classList.toggle('cl-match', r.id === ID); });
            say(o, `<span class="good">Filtered by req=${ID}: 5 lines across 2 services.</span> <span class="muted">The feed service timed out waiting for Postgres. Now open the trace to see where the time went.</span>`);
          };
          const showTrace = async () => {
            if (!failed) find();
            trace.hidden = false; spanBars.forEach(r => { r.querySelector('.cl-sbar').style.width = '0'; });
            for (const r of spanBars) { await sleep(180); if (!el.isConnected) return; const b = r.querySelector('.cl-sbar'); b.style.width = b.w + '%'; }
            say(o, '<span class="good">The postgres span takes almost the whole 3.1 s.</span> <span class="muted">Logs told you what failed; the trace shows where the time went. Next: a metric and alert on p95 latency for that query.</span>');
          };
          say(o, 'Make a request fail on the phone.');
          el.append(h('div', { class: 'controls' }, act('Open article 812 (fails)', fail), act('Search logs by request id', find), act('Open trace', showTrace)), crash, label('server logs, all users'), logs, trace, o);
        },
        code: `// OkHttp interceptor: tag every request with an id, and remember the last one for crash reports.
class RequestIdInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val id = UUID.randomUUID().toString()
        Firebase.crashlytics.setCustomKeys { key("last_request_id", id) }
        val request = chain.request().newBuilder()
            .header("X-Request-Id", id)
            .build()
        return chain.proceed(request)
    }
}

// Server (Ktor): read the id and put it on every log line for this call.
install(CallId) {
    retrieveFromHeader("X-Request-Id")
    generate { UUID.randomUUID().toString() }   // for calls that arrive without one
}
install(CallLogging) { callIdMdc("req") }       // log pattern: ... req=%X{req}`,
        remember: 'Logs say what happened, metrics say how much, traces say where. One request id ties a phone\'s crash to the server\'s logs.',
        deeper: [
          { title: 'Traces and traceparent', body: '<p>OpenTelemetry\'s default propagator uses the W3C Trace Context headers. A <code>traceparent</code> header carries a version, the 32-hex-digit trace id, the parent span id and flags. Every service that receives it continues the same trace, so your gateway, API and database spans line up in one view.</p>', code: 'traceparent: 00-a0892f3577b34da6a3ce929d0e0e4736-f03067aa0ba902b7-01\n#            ver trace-id                         parent-span-id   flags' },
          { title: 'Structured logs', body: '<p>Log JSON, not prose. <code>{"level":"error","req":"a91f-3c7e","article":812,"msg":"query timeout"}</code> can be filtered and counted; "something went wrong!!" cannot. Never log tokens, passwords or full personal data: logs are copied to more places than your database.</p>' },
          { title: 'Alerts that mean something', body: '<p>Alert on symptoms users feel: error rate, p95 latency, failed logins. Require it to last a few minutes so one slow request does not wake anyone. Each alert should link to a dashboard and say what to check first. An alert nobody acts on trains the team to ignore all alerts.</p>' },
        ],
        underHood: {
          body: '<p>A span records a name, start and end time, its trace id, its own id and its parent\'s id. The tracing backend builds the tree from those parent links. Most systems sample traces (keep, say, 10% plus every error) because storing every span of every request is expensive. Logs and metrics are usually kept in full, which is why the request id in each log line matters even when the trace was not sampled.</p>',
        },
        mistakes: [
          {
            title: 'Logs without a correlation id',
            bad: 'log.error("query timeout")',
            good: 'log.error("query timeout article={}", id)   // req=%X{req} added by the pattern',
            why: 'With thousands of requests per minute, a log line you cannot tie to one request is noise.',
          },
          {
            title: 'Logging the auth token "to debug"',
            bad: 'log.info("headers={}", call.request.headers.entries())',
            good: 'log.info("path={} user={}", call.request.path(), userId)',
            why: 'Headers include Authorization. Logs go to dashboards, exports and people who should not see tokens.',
          },
        ],
        terms: [
          { term: 'Metric', def: 'A number measured over time, such as error rate or p95 latency.' },
          { term: 'Trace / span', def: 'A trace is one request\'s path through the system; each span is one timed step in it.' },
          { term: 'Correlation id', def: 'An id sent with a request and logged by every service, so you can find all lines for one call.' },
          { term: 'p95 latency', def: 'The time under which 95% of requests finish. It shows the slow tail that averages hide.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Attach the request id to every outgoing call.', code: 'val request = chain.request().newBuilder()\n    .[[header|addHeader]]("X-Request-Id", id)\n    .build()\nreturn chain.[[proceed]](request)', why: 'The interceptor adds the header and passes the new request down the chain.' },
          { type: 'bug', prompt: 'Crash reports always show a request id, but it never matches anything in the server logs. Tap the line.', code: 'override fun intercept(chain: Interceptor.Chain): Response {\n    val id = UUID.randomUUID().toString()\n    Firebase.crashlytics.setCustomKeys { key("last_request_id", id) }\n    val request = chain.request().newBuilder()\n        .header("X-Request-Id", UUID.randomUUID().toString())\n        .build()\n    return chain.proceed(request)\n}', bug: 4, fix: '        .header("X-Request-Id", id)', why: 'The app records one id and sends a different one. Use the same value in both places.' },
        ],
        quiz: [
          { q: 'Users say "the app is slow sometimes." Which signal shows it best at a glance?', options: ['A log search for ERROR', 'A p95 latency metric on a dashboard', 'One trace picked at random'], a: 1, why: 'A latency metric over time shows when and how much. Then traces explain the slow cases.' },
          { q: 'You found the failing log line by request id. What do you open next to see which service spent the time?', options: ['The trace for that request', 'The CPU metric of the database', 'The Play Console'], a: 0, why: 'The trace shows each span\'s duration, so the slow hop stands out.' },
          { q: 'Which alert rule fits best?', options: ['CPU above 50% for 10 seconds', 'Error rate above 2% for 5 minutes', 'Any ERROR log line'], a: 1, why: 'It tracks what users feel and ignores short blips, so it fires rarely and means something.' },
          { q: 'What does the trace id in <code>traceparent</code> let services do?', options: ['Encrypt the request', 'Join their spans into one trace', 'Skip authentication'], a: 1, why: 'Each service that receives the header continues the same trace instead of starting a new one.' },
        ],
      },

      // ---------------------------------------------------------------- 7
      {
        id: 'scaling',
        title: 'Scaling basics',
        tagline: 'More traffic: a bigger machine, or more machines behind a load balancer, and a CDN for what does not change.',
        level: 'intermediate',
        body: `
<p><b>Vertical scaling</b> is a bigger machine: more CPU and memory. It is simple and has a ceiling, and the machine is still one point of failure. <b>Horizontal scaling</b> is more machines doing the same job, with a <b>load balancer</b> in front spreading requests across them and sending traffic only to healthy ones.</p>
<p>Horizontal scaling only works if servers are <b>stateless</b>: any instance can answer any request, because sessions, carts and uploads live in a shared database, cache or bucket, not in one server\'s memory. Then an <b>autoscaler</b> can add instances when load rises and remove them when it falls.</p>
<p>A <b>CDN</b> (content delivery network) caches responses at edge locations near users: images, app config, the headline list for 60 seconds. A cache hit never reaches your servers. Every instance and every gigabyte costs money, so watch the cost counter while you send a breaking-news push.</p>`,
        visual(el) {
          const CAP = 10;
          let traffic = 12, auto = true, cdn = false, stateful = false;
          let fleet = [{ boot: 0 }, { boot: 0 }];
          let hiTicks = 0, loTicks = 0, dropped = 0, lost = 0, cost = 0, tick = 0;
          const root = h('div', { class: 'cl-box' });
          const lb = h('div', { class: 'cl-lb' }, 'load balancer');
          const flow = h('div', { class: 'cl-flow', 'aria-hidden': 'true' });
          const fleetEl = h('div', { class: 'cl-fleet' });
          const cdnEl = h('div', { class: 'cl-cdn' }, 'CDN off: images hit the servers');
          const stats = h('div', { class: 'cl-stats' });
          const o = out('');
          const stat = (v, t) => h('div', { class: 'cl-stat' }, h('b', {}, v), h('span', {}, t));
          function render(load) {
            fleetEl.replaceChildren(...fleet.map((f, i) => {
              const pct = f.boot ? 0 : Math.min(100, Math.round(load * 100));
              const bar = h('i', { style: `width:${pct}%` });
              const cls = 'cl-inst' + (f.boot ? ' cl-boot' : pct >= 100 ? ' cl-hot' : pct >= 70 ? ' cl-warmi' : '');
              return h('div', { class: cls }, h('span', {}, `#${i + 1} ${f.boot ? 'starting' : pct + '%'}`), h('div', { class: 'cl-load' }, bar));
            }));
            stats.replaceChildren(stat(String(fleet.filter(f => !f.boot).length), 'serving'), stat(String(dropped), 'requests dropped (5xx)'), stat(cost.toFixed(0) + ' u', 'cost so far'), stat(String(lost), 'sessions lost'));
          }
          function step() {
            if (!root.isConnected) { clearInterval(timer); return; }
            tick++;
            fleet.forEach(f => { if (f.boot) f.boot--; });
            const ready = fleet.filter(f => !f.boot).length || 1;
            const origin = cdn ? traffic * 0.4 : traffic;      // 60% of requests are images
            const load = origin / (ready * CAP);
            if (load > 1) dropped += Math.round(origin - ready * CAP);
            cost += fleet.length * 0.5 + (cdn ? traffic * 0.02 : 0);
            if (auto) {
              hiTicks = load > 0.7 ? hiTicks + 1 : 0;
              loTicks = load < 0.3 ? loTicks + 1 : 0;
              if (hiTicks >= 2 && fleet.length < 12) { fleet.push({ boot: 3 }); hiTicks = 0; }
              if (loTicks >= 5 && fleet.length > 2) { fleet.pop(); loTicks = 0; if (stateful) lost += 40; }
            }
            const n = Math.min(6, Math.ceil(traffic / 8));
            for (let i = 0; i < n; i++) {
              const img = i < n * 0.6;
              const d = h('i', { class: 'cl-req-dot' + (img ? ' cl-img' : ''), style: `--dx:${Math.round((Math.random() - 0.5) * 300)}px` });
              flow.append(d); setTimeout(() => d.remove(), 650);
            }
            render(load);
          }
          const timer = setInterval(step, 450);
          const tBtns = [
            act('Normal traffic', e => { traffic = 12; press(tBtns, e.currentTarget); say(o, '<span class="muted">Back to normal. Watch idle instances get removed after a while.</span>'); }),
            act('Breaking news push', e => { traffic = 75; press(tBtns, e.currentTarget); say(o, auto ? '<span class="bad">Traffic jumps 6x.</span> <span class="muted">Requests drop until new instances finish starting. Autoscaling reacts with a delay.</span>' : '<span class="bad">Traffic jumps 6x and the fleet stays at its size.</span> <span class="muted">Turn autoscaling on.</span>'); }),
          ];
          const autoBtn = act('Autoscaling: on', e => { auto = !auto; e.currentTarget.textContent = 'Autoscaling: ' + (auto ? 'on' : 'off'); e.currentTarget.setAttribute('aria-pressed', String(auto)); }, { 'aria-pressed': 'true' });
          const cdnBtn = act('CDN for images', e => {
            cdn = !cdn; e.currentTarget.setAttribute('aria-pressed', String(cdn));
            cdnEl.className = 'cl-cdn' + (cdn ? ' cl-cdn-on' : ''); cdnEl.textContent = cdn ? 'CDN on: images served from the edge' : 'CDN off: images hit the servers';
            say(o, cdn ? '<span class="good">60% of requests now stop at the CDN.</span> <span class="muted">The same push needs far fewer instances. The CDN has its own per-request cost, much smaller here.</span>' : '<span class="muted">Every image request reaches your servers again.</span>');
          }, { 'aria-pressed': 'false' });
          const stBtn = act('Sessions in server memory', e => {
            stateful = !stateful; e.currentTarget.setAttribute('aria-pressed', String(stateful));
            say(o, stateful ? '<span class="bad">Now each instance holds its users\' sessions in memory.</span> <span class="muted">When the autoscaler removes one, those users are logged out. Send a push, then go back to normal.</span>' : '<span class="good">Stateless again: sessions live in a shared store.</span> <span class="muted">Removing an instance loses nothing.</span>');
          }, { 'aria-pressed': 'false' });
          press(tBtns, tBtns[0]);
          say(o, 'Send a breaking news push and watch the fleet.');
          root.append(lb, flow, fleetEl, cdnEl);
          el.append(h('div', { class: 'controls' }, tBtns), h('div', { class: 'controls' }, autoBtn, cdnBtn, stBtn), root, stats, o);
          render(traffic / (fleet.length * CAP));
        },
        code: `// Stateless Ktor route: nothing is kept in this instance's memory between requests,
// and the response tells the CDN it may cache it for 60 seconds.
get("/api/headlines") {
    val category = call.request.queryParameters["category"] ?: "top"
    call.response.header(HttpHeaders.CacheControl, "public, max-age=60")
    call.respond(headlineRepo.latest(category))   // reads from the shared database
}

// User-specific data: never cacheable by a CDN.
get("/api/me/saved") {
    call.response.header(HttpHeaders.CacheControl, "private, no-store")
    call.respond(savedRepo.forUser(call.userId()))  // session lives in a shared store, not a local map
}`,
        remember: 'Scale out, not up: stateless instances behind a load balancer, an autoscaler to add and remove them, and a CDN so most requests never reach them.',
        deeper: [
          { title: 'Health checks', body: '<p>A load balancer keeps asking each instance something like <code>GET /health</code>. Instances that stop answering are taken out of rotation, and traffic moves to the healthy ones. Keep the health endpoint cheap and honest: if the instance cannot reach its database, say so.</p>' },
          { title: 'How a real autoscaler decides', body: '<p>Cloud Run, for example, targets 60% CPU and request concurrency by default and adds instances when load goes past the target. It can scale to zero, and when no instance is free a new one starts; requests wait a while for it and fail with 429 if none frees up in time. Every service has a maximum instances limit, which also caps your bill when something goes wrong.</p>' },
          { title: 'Pushes are a self-made traffic spike', body: '<p>Sending one push to a million devices makes many of them open the app within a minute. Spread the send over a few minutes, make the first screen read from a CDN-cached endpoint, and set minimum instances before a planned big push. See <a href="#push.messages">push messages</a> for the client side.</p>' },
          { title: 'The database scales last', body: '<p>Stateless app servers are easy to multiply. The shared database is not. Read replicas, caching and connection pooling come next, and a sudden fleet of 50 instances can exhaust database connections. Cap max instances to what the database can take.</p>' },
        ],
        mistakes: [
          {
            title: 'Sessions in a local map',
            bad: 'val sessions = mutableMapOf<String, User>()   // per instance',
            good: 'val user = sessionStore.get(token)            // Redis or the database, shared',
            why: 'The next request may land on another instance, and scale-down deletes this one. Users get logged out at random.',
          },
          {
            title: 'Letting a CDN cache personal data',
            bad: 'get("/api/me/saved") {\n    call.response.header(HttpHeaders.CacheControl, "public, max-age=300")\n}',
            good: 'get("/api/me/saved") {\n    call.response.header(HttpHeaders.CacheControl, "private, no-store")\n}',
            why: '<code>public</code> lets the edge cache one user\'s list and serve it to the next user who asks for the same URL.',
          },
        ],
        terms: [
          { term: 'Load balancer', def: 'Spreads incoming requests across instances and routes around unhealthy ones.' },
          { term: 'Stateless server', def: 'An instance that keeps no user data between requests, so any instance can serve any request.' },
          { term: 'Autoscaling', def: 'Adding and removing instances automatically based on load, within a min and max.' },
          { term: 'CDN', def: 'A network of edge caches near users; a cache hit is answered without reaching your origin servers.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let the CDN cache the public headline list for 60 seconds.', code: 'call.response.header(HttpHeaders.CacheControl, "[[public]], max-age=[[60]]")', why: '<code>public</code> allows shared caches like a CDN to store it; <code>max-age</code> is in seconds.' },
          { type: 'bug', prompt: 'After autoscaling kicks in, users are randomly logged out. Tap the line.', code: 'class AuthService(private val db: UserDb) {\n    private val sessions = mutableMapOf<String, Long>()\n    fun login(user: Long): String {\n        val token = newToken()\n        sessions[token] = user\n        return token\n    }\n}', bug: 1, fix: '    private val sessions: SessionStore = RedisSessionStore()', why: 'An in-memory map exists on one instance only. Keep sessions in a shared store so any instance can read them.' },
        ],
        quiz: [
          { q: 'What happens to sessions kept in instance memory when the autoscaler removes that instance?', options: ['They move to another instance', 'They are lost and those users are logged out', 'The load balancer saves them'], a: 1, why: 'Memory dies with the instance. That is why horizontally scaled servers keep state in shared storage.' },
          { q: 'Which trade-off fits vertical scaling?', options: ['Simple, but there is a size ceiling and still one machine to fail', 'Unlimited, but requires stateless code', 'Free, but slow'], a: 0, why: 'A bigger machine needs no code changes, but it has a maximum size and stays a single point of failure.' },
          { q: 'A push goes out and 60% of the requests are for article images. What cuts server load the most?', options: ['A bigger database', 'A CDN in front of the images', 'More logging'], a: 1, why: 'Cache hits at the edge never reach your servers, so most of the spike disappears.' },
          { q: 'Why can a brand-new instance not help with the first seconds of a spike?', options: ['It has to start before it can take requests', 'Load balancers ignore new instances', 'It needs a new Docker image'], a: 0, why: 'Start time is the gap between "autoscaler decided" and "instance serving". Minimum instances or a CDN cover that gap.' },
          { q: 'Which response must never be <code>public</code> in Cache-Control?', options: ['/api/headlines', '/api/me/saved', '/images/812.webp'], a: 1, why: 'It is per-user. A shared cache would serve one user\'s data to others.' },
        ],
      },
    ],
  });
})();
