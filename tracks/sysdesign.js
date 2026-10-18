/* Mobile system design track. Same shape as tracks/kotlin.js.
   Client plus server design for design reviews and senior work, always tied back to the Android side.
   Demo styles live in the css string below; every class is prefixed sd-. */
(() => {
  const { h, sleep, replay } = Lab;
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', type: 'button', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const row = (...kids) => h('div', { class: 'sd-row' }, ...kids);
  const label = t => h('span', { class: 'sd-label' }, t);
  const STATES = ['sd-hot', 'sd-ok', 'sd-err', 'sd-warn', 'sd-dim'];
  const mark = (el, cls) => { el.classList.remove(...STATES); if (cls) el.classList.add(cls); };
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const pill = (text, cls = '') => h('span', { class: `sd-pill ${cls}` }, text);
  const toggle = (labelText, on, onchange) => {
    const paint = () => { b.textContent = labelText(on); b.setAttribute('aria-pressed', String(on)); };
    const b = act(labelText(on), () => { on = !on; paint(); onchange(on); }, { 'aria-pressed': String(on) });
    b.set = v => { on = v; paint(); };   // reset without firing onchange
    return b;
  };

  const css = `
.sd-wrap { display: grid; gap: 12px; min-width: 0; }
.sd-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.sd-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.sd-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap: 12px; min-width: 0; }
.sd-trio { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap: 10px; min-width: 0; }
.sd-card { display: grid; gap: 8px; align-content: start; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--bg); min-width: 0; transition: border-color 0.25s, background 0.25s, opacity 0.25s; }
.sd-card h4 { margin: 0; font: 700 0.86rem var(--mono); overflow-wrap: anywhere; }
.sd-flow { display: flex; flex-wrap: wrap; gap: 6px; align-items: stretch; min-width: 0; }
.sd-box { display: grid; gap: 2px; align-content: center; padding: 7px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font: 500 0.78rem var(--mono); color: var(--ink); min-width: 0; overflow-wrap: anywhere; text-align: left; transition: border-color 0.2s, background 0.2s, opacity 0.2s, transform 0.2s; }
button.sd-box { cursor: pointer; }
button.sd-box:hover { transform: translateY(-1px); }
.sd-box b { font-weight: 700; }
.sd-box small { color: var(--muted); font-size: 0.7rem; }
.sd-arrow { align-self: center; color: var(--muted); font: 700 0.9rem var(--mono); }
.sd-hot { border-color: var(--accent) !important; background: var(--accent-soft) !important; }
.sd-ok { border-color: var(--ok) !important; background: var(--ok-soft) !important; }
.sd-err { border-color: var(--err) !important; background: var(--err-soft) !important; }
.sd-warn { border-color: var(--warm) !important; background: var(--warm-soft) !important; }
.sd-dim { opacity: 0.45; }
.sd-stats { display: flex; flex-wrap: wrap; gap: 4px 14px; font: 600 0.78rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; min-width: 0; }
.sd-stats b { color: var(--ink); }
.sd-pill { display: inline-block; font: 600 0.72rem var(--mono); padding: 2px 7px; border-radius: 7px; border: 1.5px solid var(--line); background: var(--surface); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; }
.sd-pill.sd-p-ok { border-color: var(--ok); background: var(--ok-soft); }
.sd-pill.sd-p-err { border-color: var(--err); background: var(--err-soft); }
.sd-pill.sd-p-warn { border-color: var(--warm); background: var(--warm-soft); }
.sd-pill.sd-p-acc { border-color: var(--accent); background: var(--accent-soft); }
.sd-list { display: grid; gap: 4px; min-width: 0; align-content: start; }
.sd-item { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 8px; border: 1.5px solid var(--line); background: var(--surface); font: 500 0.76rem var(--mono); min-width: 0; overflow-wrap: anywhere; transition: border-color 0.2s, background 0.2s; }
.sd-item > span:first-child { min-width: 0; }
.sd-empty { color: var(--muted); font: 500 0.76rem var(--mono); padding: 4px 2px; }
.sd-log { display: grid; gap: 2px; align-content: start; font: 500 0.75rem/1.5 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 8px 10px; min-height: 3.2em; max-height: 200px; overflow-y: auto; min-width: 0; overflow-wrap: anywhere; }
.sd-bar { height: 10px; border-radius: 6px; background: var(--sunk); overflow: hidden; min-width: 0; }
.sd-bar > span { display: block; height: 100%; width: 0; background: var(--accent); transition: width 0.35s; }
.sd-bar.sd-b-ok > span { background: var(--ok); }
.sd-bar.sd-b-warn > span { background: var(--warm); }
.sd-bar.sd-b-err > span { background: var(--err); }
.sd-meter { display: grid; grid-template-columns: minmax(0, 8.5em) minmax(0, 1fr) minmax(0, 6.5em); gap: 8px; align-items: center; font: 500 0.75rem var(--mono); min-width: 0; }
.sd-meter > span { overflow-wrap: anywhere; min-width: 0; }
.sd-meter > span:last-child { text-align: right; font-variant-numeric: tabular-nums; }

/* 1 approach */
.sd-strip { display: flex; height: 30px; border-radius: 8px; overflow: hidden; border: 1.5px solid var(--line); min-width: 0; }
.sd-seg { display: grid; place-items: center; font: 600 0.66rem var(--mono); color: var(--muted); background: var(--surface); border-right: 1.5px solid var(--line); min-width: 0; overflow: hidden; white-space: nowrap; transition: background 0.2s, color 0.2s; }
.sd-seg:last-child { border-right: 0; }
.sd-seg.sd-on { background: var(--accent-soft); color: var(--ink); }
.sd-say { padding: 10px 12px; border-radius: 10px; border-left: 4px solid var(--accent); background: var(--surface); font-size: 0.92rem; min-width: 0; overflow-wrap: anywhere; }
.sd-say p { margin: 0 0 6px; } .sd-say p:last-child { margin: 0; }

/* 3 pagination */
.sd-item.sd-dup { border-color: var(--err); background: var(--err-soft); }
.sd-item.sd-fresh { border-color: var(--ok); background: var(--ok-soft); }
.sd-item.sd-gone { border-style: dashed; color: var(--muted); }
.sd-mini { display: flex; flex-wrap: wrap; gap: 3px; min-width: 0; }
.sd-mini span { font: 600 0.66rem var(--mono); padding: 1px 5px; border-radius: 5px; background: var(--surface); border: 1px solid var(--line); }
.sd-mini span.sd-new { border-color: var(--ok); background: var(--ok-soft); }

/* 6 real-time, 9 backoff: timelines */
.sd-time { position: relative; height: 26px; border-radius: 8px; background: var(--sunk); min-width: 0; overflow: hidden; }
.sd-time.sd-thin { height: 16px; border-radius: 5px; }
.sd-held { position: absolute; top: 0; bottom: 0; left: 0; background: var(--accent-soft); transition: width 0.1s linear; }
.sd-dot { position: absolute; top: 50%; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; background: var(--accent); }
.sd-time.sd-thin .sd-dot { width: 8px; height: 8px; margin: -4px 0 0 -4px; }
.sd-dot.sd-d-ev { background: var(--warm); border-radius: 2px; transform: rotate(45deg); }
.sd-dot.sd-d-ok { background: var(--ok); }
.sd-dot.sd-d-err { background: var(--err); }
.sd-dot.sd-d-empty { background: transparent; border: 2px solid var(--muted); }
.sd-tick { position: absolute; bottom: 1px; font: 500 0.6rem var(--mono); color: var(--muted); transform: translateX(-50%); }
.sd-lanes { display: grid; gap: 4px; min-width: 0; }
.sd-lane { display: grid; grid-template-columns: 2.6em minmax(0, 1fr); gap: 6px; align-items: center; font: 600 0.68rem var(--mono); color: var(--muted); }
.sd-hist { display: flex; align-items: flex-end; gap: 2px; height: 70px; position: relative; padding-bottom: 1px; border-bottom: 1.5px solid var(--line); min-width: 0; }
.sd-hist > span { flex: 1 1 0; min-width: 0; background: var(--accent); border-radius: 3px 3px 0 0; transition: height 0.2s; }
.sd-hist > span.sd-over { background: var(--err); }
.sd-cap { position: absolute; left: 0; right: 0; border-top: 2px dashed var(--ok); pointer-events: none; }
.sd-key { display: flex; flex-wrap: wrap; gap: 4px 12px; font: 500 0.7rem var(--mono); color: var(--muted); }
.sd-key i { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 4px; vertical-align: -1px; background: var(--accent); }
.sd-key i.sd-d-ev { background: var(--warm); border-radius: 2px; }
.sd-key i.sd-d-ok { background: var(--ok); }
.sd-key i.sd-d-err { background: var(--err); }
.sd-key i.sd-d-empty { background: transparent; border: 2px solid var(--muted); }

/* 8 media */
.sd-photo { position: relative; aspect-ratio: 4 / 3; width: min(100%, 240px); border-radius: 10px; overflow: hidden; background: var(--sunk); }
.sd-photo > div { position: absolute; inset: 0; transition: filter 0.5s, opacity 0.5s; }
.sd-photo .sd-sky { background: linear-gradient(180deg, var(--accent-soft) 0 55%, var(--warm-soft) 55% 100%); }
.sd-photo .sd-sun { position: absolute; width: 26%; aspect-ratio: 1; left: 62%; top: 16%; border-radius: 50%; background: var(--warm); }
.sd-photo .sd-hill { position: absolute; left: -10%; right: 30%; bottom: -30%; height: 70%; border-radius: 50%; background: var(--ok); opacity: 0.75; }
.sd-photo .sd-hill2 { position: absolute; left: 40%; right: -20%; bottom: -35%; height: 65%; border-radius: 50%; background: var(--accent); opacity: 0.6; }
.sd-photo.sd-ph-color > div { opacity: 0; }
.sd-photo.sd-ph-color { background: var(--warm-soft); }
.sd-photo.sd-ph-blur > div { filter: blur(9px); }
.sd-chunks { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 3px; min-width: 0; }
.sd-chunks > span { height: 22px; border-radius: 5px; background: var(--sunk); border: 1.5px solid var(--line); transition: background 0.2s, border-color 0.2s; }
.sd-chunks > span.sd-c-ok { background: var(--ok-soft); border-color: var(--ok); }
.sd-chunks > span.sd-c-hot { background: var(--accent-soft); border-color: var(--accent); }
.sd-chunks > span.sd-c-err { background: var(--err-soft); border-color: var(--err); }

/* 9 circuit breaker */
.sd-states { display: flex; flex-wrap: wrap; gap: 6px; }

/* 10 news feed */
.sd-zone { display: grid; gap: 8px; padding: 10px; border-radius: 12px; border: 2px dashed var(--line); min-width: 0; }

/* 11 chat */
.sd-phone { display: grid; gap: 6px; align-content: start; padding: 10px; border-radius: 16px; border: 2px solid var(--line); background: var(--surface); min-height: 190px; min-width: 0; transition: opacity 0.25s, border-color 0.25s; }
.sd-phone.sd-off { opacity: 0.55; border-style: dashed; }
.sd-phone-head { display: flex; justify-content: space-between; gap: 6px; font: 700 0.78rem var(--mono); flex-wrap: wrap; }
.sd-bub { justify-self: start; max-width: 85%; padding: 5px 9px; border-radius: 12px 12px 12px 3px; background: var(--bg); border: 1.5px solid var(--line); font-size: 0.85rem; overflow-wrap: anywhere; }
.sd-bub.sd-me { justify-self: end; border-radius: 12px 12px 3px 12px; background: var(--accent-soft); border-color: var(--accent); }
.sd-bub small { margin-left: 6px; font: 600 0.7rem var(--mono); color: var(--muted); white-space: nowrap; }
.sd-bub small.sd-read { color: var(--accent); }
`;

  const lessons = [];

  // 1 ─────────────────────────────────────────────
  lessons.push({
    id: 'interview',
    title: 'How to approach a system design',
    tagline: 'Turn a vague prompt into a scoped design: clarify, estimate, sketch, deep-dive, weigh trade-offs.',
    level: 'intermediate',
    body: `
<p>A design discussion often starts from an open prompt like "design a news app" or "design a chat app", and a first pass can fit in about 45 minutes. There is no single right answer. What matters is how you turn a vague prompt into a scoped problem, make decisions, and say what each decision costs.</p>
<p>Use a fixed order: clarify the requirements, estimate the load, sketch the client and the server, deep-dive into one or two hard parts, then talk about trade-offs. Mobile designs usually put more weight on the client than backend designs do: the <a href="#arch.layers">layers</a>, the <a href="#arch.ssot">source of truth</a>, offline behaviour, battery, data use, and how the app talks to the API. The server can stay at the level of boxes unless your team needs more detail.</p>
<p>Say your assumptions out loud and write them down where everyone can see them. "1M daily users, Android first, cached articles must open offline" is a decision the rest of the design can point back to. Coding problems have their own routine in <a href="#cs.interview">Solving a problem step by step</a>. Step through the phases below.</p>`,
    code: `// Back-of-the-envelope numbers: say them out loud and write them down
val dailyUsers = 1_000_000L
val feedLoadsPerUser = 10
val requestsPerDay = dailyUsers * feedLoadsPerUser      // 10,000,000
val avgPerSecond = requestsPerDay / 86_400              // about 116 req/s
val peakPerSecond = avgPerSecond * 5                    // assumption: 5x at the morning peak

// The client sketch you draw first, before any server box
interface ArticleApi { suspend fun feed(cursor: String?): FeedPage }        // remote source
interface ArticleDao { fun observeFeed(): Flow<List<ArticleEntity>> }        // local source

class FeedRepository(private val api: ArticleApi, private val dao: ArticleDao) {
    val feed: Flow<List<Article>> = dao.observeFeed()       // the UI reads local data only
        .map { rows -> rows.map(ArticleEntity::toModel) }

    suspend fun refresh() {
        val page = api.feed(cursor = null)
        dao.upsertAll(page.items.map(ArticleDto::toEntity))  // network only refreshes the database
    }
}`,
    remember: 'Clarify, estimate, sketch, deep-dive, trade-offs. Say every assumption out loud, and put most of the depth into the client.',
    terms: [
      { term: 'Functional requirement', def: 'What the product does: show a feed, open an article, bookmark it, receive breaking news.' },
      { term: 'Non-functional requirement', def: 'How well it must do it: works offline, opens fast, light on battery and data, handles 1M users.' },
      { term: 'Back-of-the-envelope estimate', def: 'A rough calculation of load (requests per second, bytes per day) used to pick the design, not to be precise.' },
      { term: 'Deep dive', def: 'The part of the design where you go into detail on one hard piece, such as sync or caching.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Finish the estimate: 1M users load the feed 10 times a day. Divide by the seconds in a day.', code: 'val requestsPerDay = 1_000_000L * [[10]]\nval avgPerSecond = requestsPerDay / [[86_400|86400]]   // about 116', why: 'A day has 24 × 60 × 60 = 86,400 seconds. 10M requests spread over it is about 116 per second on average.' },
      { type: 'bug', prompt: 'The estimate says the server needs to handle 2,777 requests per second on average. Tap the line that is wrong.', code: 'val dailyUsers = 1_000_000L\nval loadsPerUser = 10\nval perDay = dailyUsers * loadsPerUser\nval perSecond = perDay / 3_600\nval peak = perSecond * 5', bug: 3, fix: 'val perSecond = perDay / 86_400', why: '3,600 is the number of seconds in an hour, not a day. The real average is about 116 requests per second.' },
    ],
    quiz: [
      { q: 'The prompt is "Design a news app." What do you do in the first five minutes?', options: ['Draw a load balancer, three servers and a database', 'Ask about scope, users, offline needs and platforms, and write the answers down', 'Write the Retrofit interface', 'Pick between SQL and NoSQL'], a: 1, why: 'Every later decision depends on the requirements. Asking first means you scope before you build.' },
      { q: 'Which order fits a 45-minute design session?', options: ['Sketch → Clarify → Deep dive → Estimate', 'Clarify → Estimate → Sketch → Deep dive → Trade-offs', 'Estimate → Deep dive → Clarify → Sketch', 'Deep dive → Sketch → Trade-offs → Clarify'], a: 1, why: 'Requirements decide what to estimate, the numbers shape the sketch, and the sketch shows which part deserves a deep dive.' },
      { q: 'A stakeholder adds: "People read on the metro with no signal." Which part of your design changes most?', options: ['The CDN provider', 'The client: a local database as the source of truth, plus a sync job', 'The server language', 'The load balancer'], a: 1, why: 'Offline reading is a client problem. The screen must read from Room and the network only refreshes it.' },
      { q: '2M daily users each make 5 requests a day. About how many requests per second on average?', options: ['About 12', 'About 116', 'About 1,160', 'About 10,000'], a: 1, why: '2M × 5 = 10M requests a day. 10M / 86,400 is about 116 per second.' },
    ],
    deeper: [
      {
        title: 'Split requirements into two lists',
        body: `<p>Functional requirements are features. Non-functional ones are qualities, and on mobile they drive most of the design. Write both lists, then ask your team to confirm or trim them. Cutting scope is allowed and expected: "Comments and login are out of scope; I will mention where they would plug in."</p>
<p>For a news app a good non-functional list is short and concrete: opens with content in under a second, readable offline, works on 3G outside the big cities, small data use, low battery cost, and correct relative dates and plurals ("2 hours ago").</p>`,
        code: `Functional                      Non-functional
- feed by category              - content on screen < 1 s, even offline
- article detail                - works on slow 3G
- bookmarks                     - small data and battery cost
- breaking-news push            - 1M daily users, reads >> writes`,
      },
      {
        title: 'Only estimate what changes a decision',
        body: `<p>Numbers matter when they pick between options. 116 requests per second is small, but they are almost all reads of the same feed, so a CDN can answer most of them. Bytes matter on mobile too: 20 thumbnails × 30 KB × 10 feed loads is 6 MB per user per day. That number is why you resize images per screen.</p>`,
        code: `val thumbsPerLoad = 20
val bytesPerThumb = 30_000
val loadsPerDay = 10
val perUserPerDay = thumbsPerLoad * bytesPerThumb * loadsPerDay   // 6,000,000 bytes, about 6 MB`,
      },
      {
        title: 'Choose the deep dive on purpose',
        body: `<p>Pick the part that is hardest for this product, and offer it: "The interesting parts here are feed freshness and offline. Shall I go deep on sync?" For a news app that is caching and push. For chat it is delivery, ordering and offline sending. For a photo app it is upload and image delivery. Your team may want a different part, which is fine.</p>`,
      },
      {
        title: 'Say every trade-off in one sentence',
        body: `<p>A useful shape: "I chose X because of Y. It costs Z. If W changes, I would switch to V." For example: "I use cursor pagination because the feed changes while people scroll. It means no jumping to page 50, which we don't need. If we add a search with page numbers, that endpoint can use offsets."</p>`,
      },
    ],
    mistakes: [
      { title: 'Drawing boxes before asking anything', bad: '// minute 1\n"We need Kafka, Redis, a CDN and microservices."', good: '// minute 1\n"Who reads this, how many of them,\n and must it work without a connection?"', why: 'Without requirements every box is a guess, and the reviewer can\'t tell whether you picked the right tools for this product.' },
      { title: 'A backend-only design for a mobile app', bad: 'Server boxes: LB → API → DB\nClient: "the app calls the API"', good: 'Client: Compose → ViewModel → Repository\n        → Room (source of truth) + WorkManager sync\nServer: CDN → API → cache → DB', why: 'A mobile design needs depth on the app: what the screen reads, what happens offline, when the radio wakes up.' },
    ],
    visual(el) {
      Lab.ui.timeline(el, {
        lanes: ['Scope', 'Design', 'Wrap up'],
        span: 45,
        unit: 'min',
        predict: {
          q: 'Which phase should get the biggest block of the 45 minutes?',
          options: ['Clarifying the requirements', 'Drawing every server box in detail', 'A deep dive into the hardest part'],
          a: 2,
          why: 'Clarifying and estimating are short and come first. The deep dive is where you show real judgement, so it gets the most time.',
        },
        frames: [
          { now: 0, say: 'A 45-minute session: “Design a news app.” Watch where the minutes go.' },
          { bars: [{ lane: 0, from: 0, to: 5, label: 'Clarify' }], say: 'Clarify first: feed and article pages only? Must cached articles open offline? How many daily users?' },
          { bars: [{ lane: 0, from: 5, to: 10, label: 'Estimate', tone: 'warm' }], say: '1M daily users × 10 feed loads ≈ 116 requests per second, more at the morning peak. Mostly identical reads, so a CDN fits.' },
          { bars: [{ lane: 1, from: 10, to: 20, label: 'Sketch', tone: 'ok' }], say: 'Sketch the boxes: Compose UI → ViewModel → Repository → Room, then CDN → API → cache → database, plus FCM.' },
          { bars: [{ lane: 1, from: 20, to: 35, label: 'Deep dive' }], say: 'The longest block goes to the hardest part. Here: freshness, Cache-Control per endpoint, and how an edited headline gets purged.' },
          { bars: [{ lane: 2, from: 35, to: 40, label: 'Trade-offs', tone: 'warm' }], say: 'Name what each choice costs: cursor pages cannot jump to page 50; a 30 s max-age means the list can lag, so push covers breaking news.' },
          { bars: [{ lane: 2, from: 40, to: 45, label: 'Questions', tone: 'muted' }], say: 'End with what is still open, for example how old app versions cope with API changes.' },
        ],
      });
    },
  });

  // 2 ─────────────────────────────────────────────
  lessons.push({
    id: 'api',
    title: 'API design for mobile',
    tagline: 'Design for screens, slow networks, and app versions you can\'t force to update.',
    level: 'intermediate',
    body: `
<p>A website is updated the moment you deploy. An Android app is not: people keep old versions for months, and some never update. Every response your server sends must still make sense to every app version that is still in use. That is the main rule of mobile API design.</p>
<p>Three styles are common. <b>REST</b> uses resources and HTTP methods (<code>GET /v1/articles/42</code>), and GET responses cache at the CDN and in OkHttp with no extra work. <b>GraphQL</b> lets the client ask for exactly the fields a screen needs in one request, which helps on slow networks, but queries are often sent as POST, which shared caches don't store by default. <b>gRPC</b> sends compact Protocol Buffers over HTTP/2 with generated Kotlin clients: fast and typed, but harder to inspect and to cache at a CDN.</p>
<p>On the client, parse leniently: ignore unknown fields, give optional fields defaults, and map unknown enum values to a fallback. The Retrofit and serialization setup is in <a href="#data.net">Retrofit and kotlinx.serialization</a>. Make a server change below and see which app versions break.</p>`,
    code: `val json = Json {
    ignoreUnknownKeys = true      // new server fields don't crash old apps
    coerceInputValues = true      // unknown enum value, or null for a non-null field -> the default
}

@Serializable
enum class ArticleType { NEWS, VIDEO, OPINION, UNKNOWN }

@Serializable
data class ArticleDto(
    val id: String,
    val title: String,
    val type: ArticleType = ArticleType.UNKNOWN,   // fallback for values added later
    val author: String? = null,                    // optional fields get defaults
    val imageUrl: String? = null,
)

interface NewsApi {
    @GET("v1/feed")
    suspend fun feed(@Query("cursor") cursor: String?, @Query("limit") limit: Int = 20): FeedPageDto

    @GET("v1/articles/{id}")
    suspend fun article(@Path("id") id: String): ArticleDto
}`,
    remember: 'Old app versions live for months. Only make additive changes, and parse leniently: ignore unknown keys, default everything optional.',
    terms: [
      { term: 'Backwards compatibility', def: 'A new server response still works for app versions built before the change.' },
      { term: 'Additive change', def: 'Adding a new optional field or endpoint without removing or renaming anything. Safe for old clients that parse leniently.' },
      { term: 'BFF (backend for frontend)', def: 'A thin server layer that gives each screen exactly the data it needs in one call, built from several internal services.' },
      { term: 'Protocol Buffers', def: 'Google\'s binary data format used by gRPC. Smaller and faster to parse than JSON, with code generated from a schema.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Make the parser survive new fields and new enum values from the server.', code: 'val json = Json {\n    [[ignoreUnknownKeys]] = true\n    [[coerceInputValues]] = true\n}', why: '<code>ignoreUnknownKeys</code> skips fields the app doesn\'t know. <code>coerceInputValues</code> replaces an unknown enum value with the property\'s default.' },
      { type: 'bug', prompt: 'The server starts sending <code>"type": "LIVE"</code>. The app has <code>coerceInputValues = true</code> but still fails to parse the feed. Tap the line.', code: '@Serializable\ndata class ArticleDto(\n    val id: String,\n    val title: String,\n    val type: ArticleType,\n    val imageUrl: String? = null,\n)', bug: 4, fix: '    val type: ArticleType = ArticleType.UNKNOWN,', why: 'Coercion can only fall back to a default value. Without one there is nothing to coerce to, so parsing throws.' },
    ],
    predict: {
      q: "The server renames <code>title</code> to <code>headline</code>. Which installed app versions break?",
      options: ["Only the oldest, strict one","Every installed version","None: lenient parsing handles it"],
      a: 1,
      why: "<code>ignoreUnknownKeys</code> skips the new key, but every version still needs <code>title</code>. Removing or renaming a field breaks all of them.",
    },
    quiz: [
      { q: 'The server adds a field <code>liveScore</code> to every article. Your 3.0 app was built with plain <code>Json</code> and default settings. What happens?', options: ['It ignores the field', 'Parsing throws for every article that has it', 'It shows the score'], a: 1, why: 'By default kotlinx.serialization rejects unknown keys. That is why <code>ignoreUnknownKeys = true</code> belongs in every mobile client.' },
      { q: 'Which change is safe without a new API version?', options: ['Renaming title to headline', 'Adding an optional field that clients default', 'Changing id from a number to a string', 'Removing a field old apps read'], a: 1, why: 'Adding is safe for lenient parsers. Renames, type changes and removals break versions already installed.' },
      { q: 'On 3G, the article screen needs data from four internal services. What fits best?', options: ['Four REST calls from the app, one after another', 'One screen-shaped endpoint (a BFF) or one GraphQL query', 'One WebSocket per service'], a: 1, why: 'Each round trip on a slow network can cost hundreds of milliseconds. Joining the data on the server sends one request instead of four.' },
      { q: 'Why might a team keep the article endpoint as REST GET instead of moving it to GraphQL?', options: ['GraphQL can\'t return JSON', 'GET URLs cache naturally at the CDN and in OkHttp', 'REST payloads are always smaller'], a: 1, why: 'A plain GET with Cache-Control is cached by every layer. GraphQL can be cached too, but it takes extra work like persisted queries sent as GET.' },
    ],
    deeper: [
      {
        title: 'Design for screens, not tables',
        body: `<p>A mobile screen that makes four calls in a row pays four round trips. On 3G each can take 300 ms or more before any data moves. A screen-shaped endpoint (often called a BFF) or a GraphQL query joins the data on the server, where the network between services is fast. Pick a style below and count the waits.</p>`,
        visual(el) {
          const RTT = 300;
          const STY = {
            'REST, one call per resource': ['GET /articles/42', 'GET /authors/7', 'GET /articles/42/comments?limit=3', 'GET /articles/42/related'],
            'BFF endpoint': ['GET /screens/article/42'],
            'GraphQL query': ['POST /graphql { article(id: 42) { title author { name } comments(first: 3) { text } related { title } } }'],
          };
          const log = h('div', { class: 'sd-log', 'aria-live': 'polite' });
          const o = out('');
          let run = 0;
          const btns = Object.keys(STY).map(k => act(k, async () => {
            const me = ++run; press(btns, btns.find(b => b.k === k)); log.replaceChildren();
            let t = 0;
            for (const call of STY[k]) {
              if (me !== run) return;
              t += RTT; log.append(h('div', {}, `${String(t).padStart(5)} ms  ${call}`));
              await sleep(220);
            }
            if (me === run) say(o, `${STY[k].length} round trip${STY[k].length > 1 ? 's' : ''} · about ${t} ms of waiting at ${RTT} ms each`);
          }));
          btns.forEach((b, i) => { b.k = Object.keys(STY)[i]; });
          el.append(h('div', { class: 'sd-wrap' }, row(...btns), log, o));
        },
      },
      {
        title: 'Version only when you must break',
        body: `<p>Additive changes need no new version. When you really must break the shape, add a new path (<code>/v2/feed</code>) and keep <code>/v1/feed</code> running until the old versions' share is low enough. Track that share by having the app send its version in every request. Pair it with a minimum supported version the server can raise, and an <a href="#launch.updates">in-app update</a> prompt for apps below it.</p>`,
        code: `class AppVersionInterceptor(private val versionName: String) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response =
        chain.proceed(
            chain.request().newBuilder()
                .header("X-App-Version", versionName)     // lets the server measure and tailor
                .build(),
        )
}`,
      },
      {
        title: 'Make errors data, not surprises',
        body: `<p>Use real HTTP status codes and one error body shape for every endpoint, so one piece of client code can handle them all. Say whether a retry can help. Never return <code>200</code> with an error inside: caches will store it and retries won't happen.</p>`,
        code: `// 409 Conflict
{ "code": "bookmark_exists", "message": "Already bookmarked", "retryable": false }

// 503 Service Unavailable, with Retry-After: 30
{ "code": "feed_unavailable", "message": "Try again soon", "retryable": true }`,
      },
    ],
    mistakes: [
      { title: 'A strict parser in a shipped app', bad: 'val json = Json   // default: unknown keys throw', good: 'val json = Json {\n    ignoreUnknownKeys = true\n    coerceInputValues = true\n}', why: 'The first time the server adds a field, every installed copy of this build fails to parse. You can\'t fix apps that are already out there.' },
      { title: 'Renaming a field in place', bad: '// server, new release\n{ "id": "42", "headline": "Team A 2-2 Team B" }', good: '// add the new name, keep the old one\n{ "id": "42", "title": "Team A 2-2 Team B", "headline": "Team A 2-2 Team B" }', why: 'Old apps still read <code>title</code>. Keep both until the versions that use the old name are gone.' },
    ],
    visual(el) {
      const VERS = [
        { v: '4.2', share: 64, lenient: true, enumFallback: true, nullableAuthor: true },
        { v: '3.9', share: 27, lenient: true, enumFallback: false, nullableAuthor: false },
        { v: '3.0', share: 9, lenient: false, enumFallback: false, nullableAuthor: false },
      ];
      const CH = [
        { k: 'Add field imageUrl', breaks: x => !x.lenient, why: x => x.lenient ? 'unknown key ignored' : 'strict Json: unknown key throws' },
        { k: 'Add enum value type=LIVE', breaks: x => !x.enumFallback, why: x => x.enumFallback ? 'mapped to UNKNOWN' : 'no fallback: parse fails' },
        { k: 'Send author: null', breaks: x => !x.nullableAuthor, why: x => x.nullableAuthor ? 'author is String?' : 'author is non-null String' },
        { k: 'Rename title → headline', breaks: () => true, why: () => 'missing required field title' },
        { k: 'Add /v2/feed, keep /v1', breaks: () => false, why: () => 'still calls /v1, unchanged' },
      ];
      const cards = VERS.map(x => {
        const st = h('span', {}, pill('ok', 'sd-p-ok'));
        const why = h('small', { class: 'tip' }, '');
        const c = h('div', { class: 'sd-card' },
          h('h4', {}, `app ${x.v}`), h('span', { class: 'sd-stats' }, h('span', {}, h('b', {}, `${x.share}%`), ' of users')),
          h('span', { class: 'sd-label' }, `${x.lenient ? 'ignoreUnknownKeys' : 'strict Json'} · ${x.enumFallback ? 'enum UNKNOWN' : 'no enum fallback'}`), st, why);
        return { x, c, st, why };
      });
      const o = out('Pick a server change.');
      const btns = CH.map(ch => act(ch.k, () => {
        press(btns, btns[CH.indexOf(ch)]);
        let broken = 0;
        cards.forEach(({ x, c, st, why }) => {
          const bad = ch.breaks(x);
          if (bad) broken += x.share;
          mark(c, bad ? 'sd-err' : 'sd-ok');
          st.replaceChildren(pill(bad ? 'broken' : 'ok', bad ? 'sd-p-err' : 'sd-p-ok'));
          why.textContent = ch.why(x);
          if (bad) replay(c, 'shake');
        });
        say(o, broken ? `<span class="bad">${broken}% of users</span> see a broken feed. You can't patch apps already installed.` : 'Every version keeps working: an additive change.');
      }));
      el.append(h('div', { class: 'sd-wrap' }, label('server change'), row(...btns), h('div', { class: 'sd-trio' }, cards.map(c => c.c)), o));
    },
  });

  // 3 ─────────────────────────────────────────────
  lessons.push({
    id: 'pagination',
    title: 'Pagination: offset vs cursor',
    tagline: 'Load a live feed in pages without duplicates or gaps when new items arrive.',
    level: 'intermediate',
    body: `
<p>A feed can hold millions of items, so the app loads it in pages. There are two common ways to ask for the next one. <b>Offset</b> pagination says "skip 20, give me 20" (<code>?offset=20&amp;limit=20</code>). <b>Cursor</b> pagination, also called keyset, says "give me 20 items older than this one" (<code>?cursor=a_981</code>), where the cursor points at the last item you received.</p>
<p>Offset breaks on a live feed. When a new article is published at the top, every item shifts down one place, so "skip 20" now returns an item you already have: a duplicate. When an item above you is deleted, everything shifts up and you skip one without ever seeing it. A cursor is tied to an item, not a position, so changes above it don't matter. It is faster on the server too: <code>WHERE published_at &lt; ? ORDER BY published_at DESC LIMIT 20</code> uses an index, while a large offset makes the database step over every skipped row.</p>
<p>On Android, Paging 3 keeps the key for the next page and asks for it before the user reaches the bottom (<code>prefetchDistance</code>). See <a href="#data.paging">Paging 3</a>. Below, load a page, publish or delete an article, then load the next page in both lists.</p>`,
    code: `@Serializable
data class FeedPageDto(val items: List<ArticleDto>, val nextCursor: String?)   // null = end of the feed

class FeedPagingSource(private val api: NewsApi) : PagingSource<String, ArticleDto>() {
    override suspend fun load(params: LoadParams<String>): LoadResult<String, ArticleDto> = try {
        val page = api.feed(cursor = params.key, limit = params.loadSize)   // key is null on the first load
        LoadResult.Page(data = page.items, prevKey = null, nextKey = page.nextCursor)
    } catch (e: IOException) {
        LoadResult.Error(e)
    } catch (e: HttpException) {
        LoadResult.Error(e)
    }

    override fun getRefreshKey(state: PagingState<String, ArticleDto>): String? = null   // refresh from the top
}

val pager = Pager(PagingConfig(pageSize = 20, prefetchDistance = 10)) { FeedPagingSource(api) }`,
    remember: 'A live feed needs cursors: "items after this one", not "skip N". Offsets repeat or skip items when the list changes.',
    terms: [
      { term: 'Offset pagination', def: 'Paging by position: skip N items, take M. Simple, allows page jumps, breaks when items are added or removed above.' },
      { term: 'Cursor (keyset) pagination', def: 'Paging by position in the sort order: take M items after this key. Stable under inserts and fast on an index.' },
      { term: 'Opaque cursor', def: 'A cursor the client treats as a plain string and never parses, so the server can change what is inside.' },
      { term: 'Prefetch distance', def: 'How many items from the end of the loaded list Paging starts fetching the next page.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Pass the server\'s cursor on as the key for the next page.', code: 'val page = api.feed(cursor = params.[[key]], limit = params.loadSize)\nLoadResult.Page(data = page.items, prevKey = null, nextKey = page.[[nextCursor]])', why: 'Paging hands you the previous page\'s <code>nextKey</code> as <code>params.key</code>. The server says where to continue.' },
      { type: 'bug', prompt: 'Scrolling down shows the first page again and again. Tap the line.', code: 'override suspend fun load(params: LoadParams<String>): LoadResult<String, ArticleDto> {\n    val page = api.feed(cursor = params.key, limit = params.loadSize)\n    return LoadResult.Page(\n        data = page.items,\n        prevKey = null,\n        nextKey = params.key,\n    )\n}', bug: 5, fix: '        nextKey = page.nextCursor,', why: 'The next key must come from the response. Reusing the current key asks for the same page forever.' },
    ],
    predict: {
      q: "Cursor pagination: two articles are published at the top before you load page 2. What does page 2 contain?",
      options: ["Two items you already saw, then new ones","The next items older than the last one you saw, with no repeats","The two new articles"],
      a: 1,
      why: "A cursor asks for items older than the last one seen. New items above it do not shift anything below it.",
    },
    quiz: [
      { q: 'You loaded 20 items with offset pagination. Two articles are published. You request <code>offset=20&amp;limit=20</code>. What do you get?', options: ['20 new items, no repeats', 'Two items at the start repeat items you already have', 'Two items are skipped'], a: 1, why: 'The two new articles pushed everything down two places. The first two items after offset 20 are the last two items of the page you already have.' },
      { q: 'With offset pagination, one article above your position is deleted before you load the next page. What happens?', options: ['A duplicate appears', 'One item is skipped and never shown', 'Nothing changes'], a: 1, why: 'Everything shifts up one place, so the item that moved into position 19 is never requested.' },
      { q: 'Why does a good cursor contain the id as well as <code>published_at</code>?', options: ['To make the URL longer', 'Two articles can share a timestamp, and the id breaks the tie so none is skipped or repeated', 'Ids sort faster than timestamps'], a: 1, why: 'With "older than this time" alone, an article published in the same second as the cursor item falls through the gap. <code>(published_at, id)</code> is unique.' },
    ],
    deeper: [
      {
        title: 'Make the cursor unique and opaque',
        body: `<p>Sort by a unique pair, usually the timestamp plus the id, and compare both in the query. Encode the pair into one string the client never reads. Then the server can change the sort or add fields to the cursor later without breaking old apps.</p>`,
        code: `-- server: next page after the cursor (published_at, id)
SELECT * FROM articles
WHERE category = :cat
  AND (published_at, id) < (:cursorTime, :cursorId)
ORDER BY published_at DESC, id DESC
LIMIT 20;

-- cursor sent to the app: base64("1729231200|a_981")  ->  "MTcyOTIzMTIwMHxhXzk4MQ"`,
      },
      {
        title: 'Choose a page size for the network',
        body: `<p>Small pages mean more round trips. Big pages slow down the first paint and waste data when the user only reads three items. For a text-and-thumbnail feed, 20 is a common choice. Paging 3 loads a larger first page by default (<code>initialLoadSize</code>) so the screen fills, then smaller pages as you scroll. Set <code>prefetchDistance</code> so the next page arrives before the user reaches the end.</p>`,
      },
      {
        title: 'New items at the top: tell, don\'t jump',
        body: `<p>Don't insert new articles above what the user is reading. The list jumps and they lose their place. Check for newer items (a light call, or a push), show a "3 new articles" chip, and refresh from the top when they tap it. With a database in between (<code>RemoteMediator</code>), you store the next page key in Room next to the items, so the list and its position survive process death.</p>`,
      },
    ],
    mistakes: [
      { title: 'Offset on a feed that changes', bad: '@GET("v1/feed")\nsuspend fun feed(@Query("offset") offset: Int, @Query("limit") limit: Int): List<ArticleDto>', good: '@GET("v1/feed")\nsuspend fun feed(@Query("cursor") cursor: String?, @Query("limit") limit: Int): FeedPageDto', why: 'Offsets are fine for a static, numbered list. A news feed changes every minute, so offsets repeat and skip items.' },
      { title: 'Parsing the cursor in the app', bad: 'val (time, id) = page.nextCursor!!.split("|")\napi.feed(before = time.toLong())', good: 'api.feed(cursor = page.nextCursor)   // pass it back as-is', why: 'Once the app depends on the cursor\'s format, the server can never change it without breaking installed versions.' },
    ],
    visual(el) {
      const PAGE = 4;
      let nextId, server, off, cur, curKey, pageNo;
      const offList = h('div', { class: 'sd-list' }), curList = h('div', { class: 'sd-list' });
      const offStat = h('div', { class: 'sd-stats' }), curStat = h('div', { class: 'sd-stats' });
      const mini = h('div', { class: 'sd-mini', 'aria-label': 'Server feed, newest first' });
      const o = out('');
      const newIds = new Set();
      function reset() {
        nextId = 21; server = []; for (let i = 20; i >= 1; i--) server.push(i);
        off = []; cur = []; curKey = null; pageNo = 0; newIds.clear();
        paint(); say(o, 'Server feed has 20 articles, newest first. Load page 1.');
      }
      function stats(list, el2) {
        const dups = list.filter(x => x.dup).length;
        const ids = list.map(x => x.id), lo = Math.min(...ids), hi = Math.max(...ids);
        const skipped = ids.length ? server.filter(id => id > lo && id < hi && !ids.includes(id) && !newIds.has(id)).length : 0;
        el2.innerHTML = `<span>loaded <b>${list.length}</b></span><span>duplicates <b>${dups}</b></span><span>skipped <b>${skipped}</b></span>`;
      }
      function paint() {
        mini.replaceChildren(...server.map(id => h('span', { class: newIds.has(id) ? 'sd-new' : '' }, `#${id}`)));
        [[off, offList, offStat], [cur, curList, curStat]].forEach(([list, el2, st]) => {
          el2.replaceChildren(...(list.length ? list.map(x => h('div', { class: `sd-item${x.dup ? ' sd-dup' : ''}${!server.includes(x.id) ? ' sd-gone' : ''}` },
            h('span', {}, `article #${x.id}`), x.dup ? pill('dup', 'sd-p-err') : h('span', { class: 'sd-label' }, `p${x.page}`))) : [h('div', { class: 'sd-empty' }, 'nothing loaded')]));
          stats(list, st);
        });
      }
      function loadNext() {
        const page = ++pageNo, offAt = off.length;
        // offset
        const o1 = server.slice(offAt, offAt + PAGE);
        const asked = curKey == null ? 'null' : '#' + curKey;
        const have = new Set(off.map(x => x.id));
        o1.forEach(id => off.push({ id, page, dup: have.has(id) }));
        // cursor
        const after = curKey == null ? server : server.filter(id => id < curKey);
        const c1 = after.slice(0, PAGE);
        c1.forEach(id => cur.push({ id, page, dup: false }));
        if (c1.length) curKey = c1[c1.length - 1];
        paint();
        replay(offList, 'pop-soft'); replay(curList, 'pop-soft');
        say(o, `Page ${page}: offset asked <code>offset=${offAt}&amp;limit=${PAGE}</code>, cursor asked <code>cursor=${asked}</code> (items older than the last one seen).`);
      }
      function publish() { server.unshift(nextId); newIds.add(nextId); say(o, `Article #${nextId} published at the top. Every position shifts down one.`); nextId++; paint(); }
      function remove() {
        const top = server.find(id => !newIds.has(id) && off.some(x => x.id === id));
        if (top == null) { say(o, 'Load a page first, then delete one you have seen.'); return; }
        server = server.filter(id => id !== top); say(o, `Article #${top} deleted. Everything below it shifts up one.`); paint();
      }
      const card = (t, list, st, sub) => h('div', { class: 'sd-card' }, h('h4', {}, t), h('span', { class: 'sd-label' }, sub), st, list);
      el.append(h('div', { class: 'sd-wrap' },
        row(act('Load next page', loadNext), act('Publish an article', publish), act('Delete a seen article', remove), act('Reset', reset)),
        label('server, newest first'), mini,
        h('div', { class: 'sd-pair' }, card('Offset', offList, offStat, 'skip N, take 4'), card('Cursor', curList, curStat, 'older than the last item')), o));
      reset();
    },
  });

  // 4 ─────────────────────────────────────────────
  lessons.push({
    id: 'caching',
    title: 'Caching layers end to end',
    tagline: 'Memory, disk, CDN, server cache: skip as many hops as you can, and know how each copy goes stale.',
    level: 'intermediate',
    body: `
<p>The fastest request is the one you never send. A news app can keep copies in five places, from nearest to farthest: memory in the app, disk in the app (Room or the OkHttp cache), the CDN edge near the user, a cache in front of the database on the server (such as Redis), and the database itself. Each hop you skip saves time, battery and data.</p>
<p>HTTP gives the app and the CDN shared rules. <code>Cache-Control: max-age=300</code> says the response stays fresh for 5 minutes, so OkHttp can answer from disk without touching the network. After that it is stale and must be revalidated: the client sends <code>If-None-Match</code> with the stored <code>ETag</code>, and if nothing changed the server answers <code>304 Not Modified</code> with no body. You still pay a round trip, but not the download.</p>
<p>The hard part is invalidation. When an editor fixes a headline, you can delete the server cache entry and purge the CDN, but you can't reach into phones: copies already on devices stay until their <code>max-age</code> runs out. So choose <code>max-age</code> per endpoint by how stale it may be. The client side is in <a href="#data.caching">Caching strategies</a>. Step through below: open, wait, edit, and watch which layer answers.</p>`,
    code: `val client = OkHttpClient.Builder()
    .cache(Cache(File(context.cacheDir, "http"), 50L * 1024 * 1024))   // honours Cache-Control and ETag
    .build()

// Offline: accept whatever is on disk instead of failing
fun cachedArticle(id: String): Response {
    val request = Request.Builder()
        .url("https://api.example.com/v1/articles/$id")
        .cacheControl(CacheControl.FORCE_CACHE)   // never use the network; 504 if nothing is cached
        .build()
    return client.newCall(request).execute()      // call from Dispatchers.IO
}

// Server, per endpoint:
// GET /v1/articles/42  -> Cache-Control: public, max-age=300     ETag: "a42-v7"
// GET /v1/feed         -> Cache-Control: public, max-age=30
// GET /v1/me           -> Cache-Control: private, no-cache
// GET /img/9f3c1e.webp -> Cache-Control: public, max-age=31536000, immutable`,
    remember: 'Every cache answers faster and goes stale. You can purge the CDN and the server, never the phones: choose max-age with that in mind.',
    terms: [
      { term: 'max-age', def: 'A Cache-Control directive: how many seconds a response stays fresh and can be reused without asking the server.' },
      { term: 'ETag', def: 'A version tag for a response. The client sends it back in If-None-Match to ask "has this changed?"' },
      { term: '304 Not Modified', def: 'The server\'s answer when the client\'s copy is still current. No body, so almost no bytes.' },
      { term: 'CDN', def: 'Content delivery network: cache servers close to users that answer repeated requests without reaching your servers.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Revalidate a stale copy and get the cheap answer when nothing changed.', code: 'GET /v1/articles/42\n[[If-None-Match]]: "a42-v7"\n\nHTTP/1.1 [[304]] Not Modified', why: 'The client sends the stored ETag in <code>If-None-Match</code>. A match means <code>304</code>, with no body to download.' },
      { type: 'bug', prompt: 'The team added a 50 MB disk cache, but every launch still downloads every article. Tap the line.', code: 'val client = OkHttpClient.Builder()\n    .addNetworkInterceptor { chain ->\n        chain.proceed(chain.request()).newBuilder()\n            .header("Cache-Control", "no-store")\n            .build()\n    }\n    .cache(Cache(File(context.cacheDir, "http"), 50L * 1024 * 1024))\n    .build()', bug: 3, fix: '            .header("Cache-Control", "public, max-age=300")', why: '<code>no-store</code> tells every cache not to keep the response. A network interceptor that rewrites headers should set a real freshness lifetime, or better, the server should send it.' },
    ],
    quiz: [
      { q: 'The article came with <code>max-age=300</code>. The user opens it again 2 minutes later. What happens?', options: ['A network request with If-None-Match', 'It is served from the disk cache, no network', 'It is served from the CDN'], a: 1, why: 'The copy is still fresh (120 s < 300 s), so OkHttp answers from disk without any request.' },
      { q: 'Ten minutes later, the article has not changed. What does the network carry?', options: ['A 200 with the full body', 'A 304 with no body; the stored copy is reused', 'Nothing; the app shows an error'], a: 1, why: 'The copy is stale, so OkHttp revalidates with the ETag. The server sees it still matches and sends 304.' },
      { q: 'An editor fixes a headline and you purge the CDN. A phone fetched the article a minute ago with <code>max-age=300</code>. What does it show?', options: ['The fix, at once', 'The old headline for up to 4 more minutes', 'An error'], a: 1, why: 'The phone\'s copy is fresh by its own rules and won\'t ask the server until max-age passes. Purges don\'t reach devices.' },
      { q: 'Which header fits <code>GET /v1/me</code>, the signed-in user\'s profile?', options: ['public, max-age=3600', 'private, no-cache', 'public, immutable'], a: 1, why: '<code>private</code> keeps it out of the CDN, so one user\'s data is never served to another. <code>no-cache</code> means revalidate each time.' },
      { q: 'An image URL contains a hash of its content, so a new image always gets a new URL. Which header?', options: ['no-store', 'public, max-age=31536000, immutable', 'private, no-cache'], a: 1, why: 'The bytes behind that URL can never change, so every layer can keep it for a year. Updating means publishing a new URL.' },
    ],
    deeper: [
      {
        title: 'Pick max-age per endpoint',
        body: `<p>There is no single right value. Ask how bad a stale copy is and how often it changes. A feed list changes every minute but a 30-second-old list is fine. An article body rarely changes after publishing. A user\'s own data must never sit in a shared cache. Images with a hash in the URL never change at all.</p>`,
        code: `Endpoint             Cache-Control                     Why
/v1/feed             public, max-age=30                changes often, slight staleness is fine
/v1/articles/{id}    public, max-age=300               rarely edited after publishing
/v1/me               private, no-cache                 per user; always revalidate
/img/{hash}.webp     public, max-age=31536000, immutable   new content = new URL`,
      },
      {
        title: 'Server cache: cache-aside and the stampede',
        body: `<p>The usual pattern is cache-aside: read the cache, and on a miss read the database and fill the cache with a TTL. On a write, delete the key so the next read refills it. Watch out for the stampede: when a hot key such as the home feed expires, thousands of requests miss at once and all hit the database. Let only one request rebuild it while the rest wait or get the old copy.</p>`,
        code: `suspend fun feed(cat: String): Feed =
    cache.get("feed:$cat")
        ?: mutexFor("feed:$cat").withLock {               // one rebuild per key at a time
            cache.get("feed:$cat")                        // someone may have filled it meanwhile
                ?: db.loadFeed(cat).also { cache.put("feed:$cat", it, ttl = 30.seconds) }
        }`,
      },
      {
        title: 'Two caches on the phone',
        body: `<p>The OkHttp cache stores raw HTTP responses by URL, which is great for images and simple GETs. Room stores structured data you can query, which is what an offline-first screen needs. Many apps use both: Room for the feed and bookmarks, the HTTP cache (and the image loader\'s cache) for everything else. A small in-memory copy in the repository saves even the disk read when you move between screens.</p>`,
      },
    ],
    mistakes: [
      { title: 'Putting personal data in a shared cache', bad: '// GET /v1/me\nCache-Control: public, max-age=300', good: '// GET /v1/me\nCache-Control: private, no-cache', why: '<code>public</code> lets the CDN store the response and give it to the next person who asks for the same URL.' },
      { title: 'Thinking no-cache means "don\'t store"', bad: 'Cache-Control: no-cache   // meant: never keep this', good: 'Cache-Control: no-store   // never keep this\nCache-Control: no-cache   // keep it, but revalidate before each use', why: '<code>no-cache</code> still stores the response; it only forces a check with the server before reuse.' },
      { title: 'A long max-age on something editors change', bad: '// GET /v1/feed\nCache-Control: public, max-age=86400', good: '// GET /v1/feed\nCache-Control: public, max-age=30', why: 'Phones would keep yesterday\'s feed for a whole day, and no purge can reach them.' },
    ],
    visual(el) {
      Lab.ui.flow(el, {
        nodes: [
          { id: 'mem', label: 'Memory', sub: 'in the app' },
          { id: 'disk', label: 'Disk', sub: 'OkHttp cache' },
          { id: 'cdn', label: 'CDN', sub: 'edge near user' },
          { id: 'sc', label: 'Server cache', sub: 'Redis' },
          { id: 'db', label: 'Database', sub: 'source' },
        ],
        predict: {
          q: 'The article came with <code>max-age=300</code>. The app process is killed, and the user reopens the article 3 minutes after the first load. Which layer answers?',
          options: ['The memory cache', 'The disk cache, with no network', 'The CDN'],
          a: 1,
          why: 'Killing the process empties the memory cache, but the disk copy survives and is still fresh for two more minutes. No request goes out.',
        },
        frames: [
          { say: 'All caches are empty. The user opens an article; the response will say <code>max-age=300</code> (5 minutes).' },
          { at: 'cdn', packet: 'miss', tone: 'warm', say: 'First open: memory, disk and the CDN have nothing, so the request goes further in.' },
          { at: 'db', packet: 'v1', tone: 'ok', mark: { db: 'ok' }, say: 'The server cache misses too, so the database answers. On the way back, each layer keeps a copy.' },
          { at: 'mem', packet: 'v1 · 200', tone: 'ok', mark: { mem: 'ok', disk: 'ok', cdn: 'ok', sc: 'ok' }, say: 'The phone shows v1 and keeps it in memory and on disk, fresh for 5 minutes.' },
          { at: 'mem', packet: 'hit', tone: 'ok', say: 'One minute later: the memory copy is still fresh. No network at all.' },
          { at: 'disk', packet: 'hit', tone: 'ok', mark: { mem: 'muted' }, say: 'The app is killed and reopened. Memory is gone, but the disk copy is still fresh.' },
          { at: 'cdn', packet: 'If-None-Match "v1"', tone: 'warm', mark: { disk: 'warm' }, say: 'Ten minutes later the disk copy is stale. OkHttp sends a conditional request with the ETag it has.' },
          { at: 'disk', packet: '304 Not Modified', tone: 'ok', mark: { disk: 'ok' }, say: 'Nothing changed, so the answer is <code>304</code>: one round trip, no body. The disk copy is fresh again.' },
          { at: 'db', packet: 'v2', tone: 'warm', mark: { cdn: 'err', sc: 'err', db: 'warm' }, say: 'An editor saves v2. The server deletes its cache key and purges the CDN. It cannot reach copies already on phones.' },
          { at: 'mem', packet: 'still v1', tone: 'err', mark: { mem: 'err' }, say: 'A phone that loaded v1 a minute ago keeps showing it until its max-age runs out. Choose max-age by how stale each endpoint may be.' },
        ],
      });
    },
  });

  // 5 ─────────────────────────────────────────────
  lessons.push({
    id: 'offline',
    title: 'Offline-first and sync',
    tagline: 'Read and write locally, queue changes in an outbox, and make retries safe with idempotency keys.',
    level: 'advanced',
    body: `
<p>An offline-first app always reads from its own database. The network only refreshes that database. The screen never waits for the server and never goes blank in a tunnel. This is the <a href="#arch.ssot">repository as source of truth</a>, with Room as the store (<a href="#data.room">Room basics</a>).</p>
<p>Writes need more care. When the user bookmarks an article offline, write the bookmark to Room right away and, in the same transaction, add a row to an <b>outbox</b> table: "add bookmark 42". A <a href="#background.workmanager">WorkManager</a> job with a network constraint drains the outbox once the device is online, and retries with backoff when a request fails. The Android guide calls this a lazy write: local first, network later.</p>
<p>Retries bring a new problem. The server may have applied the request while the response got lost, so the app sends it again. Give each outbox row an <b>idempotency key</b>, a UUID made when the user acted, and send it with every attempt. The server remembers keys it has applied and answers a repeat with the first result instead of applying it twice. Go offline below, bookmark a few articles, lose a response, and switch the keys off to see what they prevent.</p>`,
    code: `@Entity(tableName = "outbox")
data class OutboxEntry(
    @PrimaryKey val idempotencyKey: String = UUID.randomUUID().toString(),   // made once, at the user's tap
    val type: String,                                                        // "bookmark.add"
    val articleId: String,
    val createdAt: Long = System.currentTimeMillis(),
)

class BookmarkRepository(private val db: AppDb, private val workManager: WorkManager) {
    suspend fun bookmark(articleId: String) {
        db.withTransaction {                                   // both rows or neither
            db.bookmarks().upsert(BookmarkEntity(articleId, pending = true))
            db.outbox().insert(OutboxEntry(type = "bookmark.add", articleId = articleId))
        }
        val sync = OneTimeWorkRequestBuilder<OutboxWorker>()
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
            .build()
        workManager.enqueueUniqueWork("outbox", ExistingWorkPolicy.KEEP, sync)
    }
}

@HiltWorker
class OutboxWorker @AssistedInject constructor(
    @Assisted ctx: Context, @Assisted params: WorkerParameters,
    private val db: AppDb, private val api: NewsApi,
) : CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        while (true) {
            val entry = db.outbox().oldest() ?: return Result.success()   // also picks up rows added meanwhile
            try {
                api.addBookmark(AddBookmark(entry.articleId), entry.idempotencyKey)   // same key on every attempt
            } catch (e: IOException) {
                return Result.retry()                                          // WorkManager backs off, then calls again
            }
            db.withTransaction {
                db.outbox().delete(entry)
                db.bookmarks().markSynced(entry.articleId)
            }
        }
    }
}`,
    remember: 'Write to Room and the outbox in one transaction, sync later, and send the same idempotency key on every retry.',
    terms: [
      { term: 'Outbox', def: 'A local table of changes not yet confirmed by the server. A sync job sends them in order and deletes each on success.' },
      { term: 'Idempotency key', def: 'A unique id sent with a write so the server can recognise a repeat and apply it only once.' },
      { term: 'Last-write-wins', def: 'A conflict rule: when two versions collide, keep the one written last. Simple, but it can drop the other side\'s changes.' },
      { term: 'CRDT', def: 'Conflict-free replicated data type: a data shape whose copies always merge to the same result, whatever order the changes arrive in.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Send the stored key on every attempt, and ask WorkManager to try again on a network error.', code: 'try {\n    api.addBookmark(AddBookmark(entry.articleId), entry.[[idempotencyKey]])\n} catch (e: IOException) {\n    return Result.[[retry]]()\n}', why: 'The key must be the one saved with the outbox row, so every retry carries the same value. <code>Result.retry()</code> uses the request\'s backoff policy.' },
      { type: 'bug', prompt: 'After flaky Wi-Fi, some users have the same bookmark twice on the server. Tap the line.', code: 'override suspend fun doWork(): Result {\n    val entry = db.outbox().oldest() ?: return Result.success()\n    val key = UUID.randomUUID().toString()\n    return try {\n        api.addBookmark(AddBookmark(entry.articleId), key)\n        db.outbox().delete(entry)\n        Result.success()\n    } catch (e: IOException) {\n        Result.retry()\n    }\n}', bug: 2, fix: '    val key = entry.idempotencyKey', why: 'A new key per attempt makes each retry look like a new request to the server. The key has to be made once, when the user acted, and stored.' },
    ],
    predict: {
      q: "Idempotency keys are switched off. A bookmark request reaches the server, the response is lost, and WorkManager retries. What ends up on the server?",
      options: ["One bookmark","Two copies of the bookmark","None: the retry is dropped"],
      a: 1,
      why: "Without a key, the server cannot tell a retry from a new request, so it applies it again.",
    },
    quiz: [
      { q: 'The user bookmarks an article with no connection. What should the screen show?', options: ['An error: "No connection"', 'The bookmark at once, marked as pending', 'Nothing until the server confirms'], a: 1, why: 'The write goes to Room first, so the UI updates straight away. A small pending mark is honest about the sync.' },
      { q: 'A request reached the server and was applied, but the response was lost. The worker retries with the same key. What should the server do?', options: ['Apply it again', 'Return the first result without applying it again', 'Return 500 so the client stops'], a: 1, why: 'That is the point of the key: the server stored the result under it and replays the result for any repeat.' },
      { q: 'Which order is right for a lazy write?', options: ['Send to server → write Room → add outbox row', 'Write Room and the outbox row in one transaction → enqueue the worker → worker sends with the key → delete the row on success', 'Enqueue the worker → write Room → send without a key', 'Add an outbox row → delete it → write Room'], a: 1, why: 'Local first, in one transaction so a crash can\'t leave half a change. The row is deleted only after the server confirms.' },
      { q: 'Last-write-wins on whole records. The phone edits a note\'s title offline; the tablet edits its tags and syncs later. What happens?', options: ['Both edits are kept', 'The phone\'s title edit is lost, because the tablet\'s whole record replaced it', 'The server rejects both'], a: 1, why: 'Whole-record LWW keeps one version. Merging per field, or using operations instead of snapshots, keeps both.' },
      { q: 'Why use server-side version numbers rather than phone clocks to decide which write is newer?', options: ['Phone clocks can be wrong or changed by the user', 'Numbers take less space', 'Android has no clock API'], a: 0, why: 'A phone set five minutes ahead would win every conflict. A version the server increments has one order everyone agrees on.' },
    ],
    deeper: [
      {
        title: 'Conflicts: last-write-wins vs merge',
        body: `<p>Two devices edit the same note while offline, then both sync. Last-write-wins keeps whichever arrives last, whole. A field-level merge keeps each field\'s latest change, so edits to different fields both survive. Try both.</p>`,
        visual(el) {
          const base = { title: 'Match notes', tags: 'sports' };
          const phone = { title: 'Final notes', tags: 'sports' };
          const tablet = { title: 'Match notes', tags: 'sports, final' };
          const show = (t, x, cls) => h('div', { class: `sd-card ${cls || ''}` }, h('h4', {}, t), h('span', { class: 'sd-label' }, `title: ${x.title}`), h('span', { class: 'sd-label' }, `tags: ${x.tags}`));
          const res = h('div', {});
          const o = out('Phone changed the title. Tablet changed the tags. Tablet syncs last.');
          const btns = [
            act('Last-write-wins', () => { press(btns, btns[0]); res.replaceChildren(show('server result', tablet, 'sd-err')); say(o, '<span class="bad">Phone\'s title edit lost.</span> The tablet\'s whole record replaced it.'); }),
            act('Field-level merge', () => { press(btns, btns[1]); res.replaceChildren(show('server result', { title: phone.title, tags: tablet.tags }, 'sd-ok')); say(o, 'Both kept: each field takes its own latest change. Same field on both sides still needs a rule.'); }),
          ];
          el.append(h('div', { class: 'sd-wrap' }, h('div', { class: 'sd-trio' }, show('base', base), show('phone (offline)', phone), show('tablet (offline)', tablet)), row(...btns), res, o));
        },
      },
      {
        title: 'Operations merge better than snapshots',
        body: `<p>Instead of sending "the bookmark list is now [3, 7, 9]", send operations: "add 7", "remove 3". Adds and removes of different items commute, so the order they arrive in doesn\'t matter. That is the idea behind CRDTs: pick data shapes, like counters and sets with per-item ids, where any two copies can always merge to the same result. Libraries such as Automerge and Yjs do this for whole documents; for most apps, operations plus a server version per record are enough.</p>`,
      },
      {
        title: 'The server half of idempotency',
        body: `<p>The server stores each key with the result it returned, scoped to the user, for a window such as 24 hours. A repeat inside the window gets the stored result. A unique constraint in the database is the simplest guard: a second insert with the same key fails and the server returns the existing row.</p>`,
        code: `// POST /v1/bookmarks   Idempotency-Key: 6f1c...
suspend fun addBookmark(userId: String, key: String, articleId: String): BookmarkDto {
    idempotency.find(userId, key)?.let { return it }      // seen before: replay the first answer
    val created = bookmarks.insert(userId, articleId)
    idempotency.save(userId, key, created, ttl = 24.hours)
    return created
}`,
      },
      {
        title: 'Pull changes since a token',
        body: `<p>Reads sync too. Rather than downloading everything, the app keeps a sync token from the last pull and asks "what changed since token 812?" The server returns changed and deleted ids plus a new token. A push data message can nudge the app to pull right away (see <a href="#push.messages">notification vs data messages</a>).</p>`,
        code: `@GET("v1/bookmarks/changes")
suspend fun changes(@Query("since") token: String?): ChangesDto   // { upserts, deletedIds, nextToken }`,
      },
    ],
    mistakes: [
      { title: 'Network first, local second', bad: 'suspend fun bookmark(id: String) {\n    api.addBookmark(AddBookmark(id))      // throws offline\n    db.bookmarks().upsert(BookmarkEntity(id))\n}', good: 'suspend fun bookmark(id: String) {\n    db.withTransaction {\n        db.bookmarks().upsert(BookmarkEntity(id, pending = true))\n        db.outbox().insert(OutboxEntry(type = "bookmark.add", articleId = id))\n    }\n    scheduleSync()\n}', why: 'Offline, the first version throws and the user\'s action is lost. The second keeps it and syncs later.' },
      { title: 'Two writes without a transaction', bad: 'db.bookmarks().upsert(BookmarkEntity(id, pending = true))\ndb.outbox().insert(OutboxEntry(type = "bookmark.add", articleId = id))', good: 'db.withTransaction {\n    db.bookmarks().upsert(BookmarkEntity(id, pending = true))\n    db.outbox().insert(OutboxEntry(type = "bookmark.add", articleId = id))\n}', why: 'If the process dies between the two lines, the bookmark exists locally but never reaches the server.' },
    ],
    visual(el) {
      const ART = ['Team A 2-2 Team B', 'Markets hit a record', 'New metro line opens', 'City holds safety drill', 'Election poll released', 'Weather update'];
      let online, keys, dropNext, n, local, outbox, server, seen, dupes, syncing;
      const listEl = h('div', { class: 'sd-list' }), boxEl = h('div', { class: 'sd-list' }), srvEl = h('div', { class: 'sd-list' });
      const stats = h('div', { class: 'sd-stats' });
      const phoneCard = h('div', { class: 'sd-card' }, h('h4', {}, 'Phone'), label('Room: bookmarks'), listEl, label('outbox'), boxEl);
      const srvCard = h('div', { class: 'sd-card' }, h('h4', {}, 'Server'), stats, srvEl);
      const o = out('');
      const netBtn = toggle(on => on ? 'Online' : 'Offline', true, on => { online = on; mark(phoneCard, on ? null : 'sd-warn'); say(o, on ? 'Back online: WorkManager\'s network constraint is met, the outbox drains.' : 'Offline. Writes still go to Room and the outbox.'); if (on) sync(); });
      const keyBtn = toggle(on => `Idempotency keys: ${on ? 'on' : 'off'}`, true, on => { keys = on; });
      const dropBtn = act('Lose next response', () => { dropNext = true; say(o, 'The next request will reach the server, but its response will be lost on the way back.'); });
      const short = k => k.slice(0, 4);
      function paint() {
        listEl.replaceChildren(...(local.length ? local.map(b => h('div', { class: 'sd-item' }, h('span', {}, b.title), pill(b.synced ? 'synced' : 'pending', b.synced ? 'sd-p-ok' : 'sd-p-warn'))) : [h('div', { class: 'sd-empty' }, 'no bookmarks')]));
        boxEl.replaceChildren(...(outbox.length ? outbox.map(e => h('div', { class: `sd-item${e.hot ? ' sd-hot' : ''}` }, h('span', {}, `add “${e.title}”`), h('span', { class: 'sd-label' }, keys ? `key ${short(e.key)}` : 'no key'))) : [h('div', { class: 'sd-empty' }, 'empty')]));
        srvEl.replaceChildren(...(server.length ? server.map(s => h('div', { class: `sd-item${s.dup ? ' sd-dup' : ''}` }, h('span', {}, s.title), s.dup ? pill('duplicate', 'sd-p-err') : pill('saved', 'sd-p-ok'))) : [h('div', { class: 'sd-empty' }, 'nothing yet')]));
        stats.innerHTML = `<span>rows <b>${server.length}</b></span><span>repeats caught <b>${seen.caught}</b></span><span>duplicates <b>${dupes}</b></span>`;
      }
      function reset() {
        online = true; keys = true; dropNext = false; n = 0; local = []; outbox = []; server = []; seen = { set: new Set(), caught: 0 }; dupes = 0; syncing = false;
        netBtn.set(true); keyBtn.set(true);
        mark(phoneCard, null); paint(); say(o, 'Bookmark an article, or go offline first.');
      }
      function add() {
        if (n >= ART.length) { say(o, 'That\'s every article. Reset to start over.'); return; }
        const title = ART[n++], key = crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2);
        local.push({ title, synced: false }); outbox.push({ title, key });
        paint(); replay(listEl, 'pop-soft');
        say(o, `Room transaction: bookmark “${title}” (pending) + outbox row. The screen updates now.`);
        if (online) sync();
      }
      async function sync() {
        if (syncing) return; syncing = true;
        while (online && outbox.length) {
          const e = outbox[0]; e.hot = true; paint(); await sleep(450);
          if (!online) { e.hot = false; break; }
          // server side
          const repeat = keys && seen.set.has(e.key);
          if (repeat) { seen.caught++; }
          else {
            const dup = server.some(s => s.title === e.title);
            server.push({ title: e.title, dup }); if (dup) dupes++;
            if (keys) seen.set.add(e.key);
          }
          paint(); replay(srvCard, 'pop-soft');
          if (dropNext) {
            dropNext = false; e.hot = false; paint();
            say(o, `Server applied “${e.title}”, but the response was lost. The row stays; WorkManager retries${keys ? ' with the same key' : ''}.`);
            await sleep(900); continue;
          }
          outbox.shift(); const b = local.find(x => x.title === e.title && !x.synced); if (b) b.synced = true;
          paint();
          say(o, repeat ? `Server saw key ${short(e.key)} before and replayed the first result. No duplicate.` : `“${e.title}” saved on the server. Row deleted, bookmark marked synced.`);
          await sleep(300);
        }
        syncing = false;
      }
      el.append(h('div', { class: 'sd-wrap' },
        row(act('Bookmark next article', add), netBtn, dropBtn, keyBtn, act('Reset', reset)),
        h('div', { class: 'sd-pair' }, phoneCard, srvCard), o));
      reset();
    },
  });

  // 6 ─────────────────────────────────────────────
  lessons.push({
    id: 'realtime',
    title: 'Real-time updates',
    tagline: 'Polling, long polling, SSE, WebSockets and push: freshness against battery and server cost.',
    level: 'intermediate',
    body: `
<p>Some data must reach the screen within seconds: a live score, a new chat message, a breaking story. There are five common ways to get it, and they trade freshness against battery and server cost.</p>
<p><b>Polling</b> asks every N seconds; most answers are "nothing new", and each request wakes the radio. <b>Long polling</b> sends a request that the server holds open until there is news or a timeout, then the client asks again. <b>Server-Sent Events</b> (SSE) keep one HTTP response open and the server writes events into it, in one direction only. <b>WebSockets</b> keep a two-way connection open (see <a href="#data.realtime">WebSockets as a Flow</a>). <b>Push</b> through FCM rides on one connection that Google Play services keeps for all apps, so your app holds no connection of its own and its process does not need to be running. (A user force-stop is different: it blocks delivery until the app is opened again.)</p>
<p>The usual mobile answer combines them: a WebSocket or SSE stream only while the screen is visible, and push while the app is in the background. Your own socket in the background drains the battery, and in <a href="#background.doze">Doze</a> the system suspends app network access anyway. Run the same minute of events through each strategy below.</p>`,
    code: `class LiveScoreRepository(private val client: OkHttpClient, private val json: Json) {
    fun scores(matchId: String): Flow<Score> = callbackFlow {
        val request = Request.Builder().url("wss://live.example.com/matches/$matchId").build()
        val socket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onMessage(webSocket: WebSocket, text: String) {
                trySend(json.decodeFromString<Score>(text))
            }
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                close(t)
            }
        })
        awaitClose { socket.close(1000, "no collectors") }     // the socket lives only while collected
    }.retryWhen { cause, attempt ->
        if (cause is IOException && attempt < 5) { delay(1_000L shl attempt.toInt()); true } else false
    }
}

class MatchViewModel(repo: LiveScoreRepository, matchId: String) : ViewModel() {
    val score: StateFlow<Score?> = repo.scores(matchId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)   // closes 5 s after the UI stops
}

// In the screen: collectAsStateWithLifecycle stops collecting when the app goes to the background
val score by viewModel.score.collectAsStateWithLifecycle()`,
    remember: 'Hold a socket only while the user is looking. In the background, let FCM push wake you.',
    terms: [
      { term: 'Long polling', def: 'A request the server keeps open until it has news or a timeout passes. The client then sends the next one.' },
      { term: 'Server-Sent Events', def: 'A long-lived HTTP response in which the server writes a stream of text events. One way only, server to client.' },
      { term: 'WebSocket', def: 'A two-way connection that starts as HTTP and stays open, so both sides can send messages at any time (RFC 6455).' },
      { term: 'Heartbeat', def: 'A small ping sent on an idle connection so both sides, and the networks between them, know it is still alive.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Keep the socket open only while someone collects, and close it when they stop.', code: '.stateIn(viewModelScope, SharingStarted.[[WhileSubscribed]](5_000), null)\n\nawaitClose { socket.[[close]](1000, "no collectors") }', why: '<code>WhileSubscribed</code> cancels the upstream flow after the last collector leaves. Cancelling runs <code>awaitClose</code>, which closes the socket.' },
      { type: 'bug', prompt: 'Users complain the app drains battery: the live-score socket stays open while the app sits in the background. Tap the line.', code: 'val scores: StateFlow<Score?> = repository.scores(matchId)\n    .stateIn(\n        scope = viewModelScope,\n        started = SharingStarted.Eagerly,\n        initialValue = null,\n    )', bug: 3, fix: '        started = SharingStarted.WhileSubscribed(5_000),', why: '<code>Eagerly</code> keeps collecting for as long as the ViewModel lives, which includes time in the background. <code>WhileSubscribed</code> stops when the UI stops collecting.' },
    ],
    predict: {
      q: "Over one minute, how many requests does polling every 10 seconds open?",
      options: ["1","6","60"],
      a: 1,
      why: "One request every 10 seconds for 60 seconds is six, whether or not anything happened in between.",
    },
    quiz: [
      { q: 'The app polls every 10 seconds. A goal happens at second 11. When does the user see it?', options: ['At second 11', 'At second 20, the next poll', 'At second 30'], a: 1, why: 'Polling delivers on its own schedule. The worst-case delay is the full interval, and most polls return nothing.' },
      { q: 'The match screen shows a live score while it is open. What fits best?', options: ['Only FCM push for every event', 'A WebSocket or SSE stream while the screen is visible, and push when the app is in the background', 'Poll every second'], a: 1, why: 'A stream gives instant updates while the user watches. Push covers the background without holding a connection.' },
      { q: 'The client must also send "typing…" events to the server over the same connection. Which one?', options: ['Server-Sent Events', 'WebSocket', 'Polling'], a: 1, why: 'SSE only carries server-to-client events. A WebSocket is two-way.' },
      { q: 'What happens to your app\'s own socket when the device enters Doze?', options: ['It keeps working as usual', 'App network access is suspended so it stalls; high-priority FCM messages can still wake the app', 'It switches to SSE'], a: 1, why: 'Doze defers app network access to save battery. FCM high-priority messages are the supported way to reach the app then.' },
    ],
    deeper: [
      {
        title: 'Reconnect, then catch up',
        body: `<p>A dropped socket loses whatever was sent while it was down. Give every event an increasing id. After reconnecting, send the last id you saw and let the server replay what you missed, or fetch it with a normal GET. SSE builds this in: the browser API resends the last id in a <code>Last-Event-ID</code> header. With a WebSocket you design it yourself.</p>`,
        code: `// first message after (re)connecting
{ "type": "resume", "matchId": "m42", "lastEventId": 1837 }
// server replays events 1838.. then continues live`,
      },
      {
        title: 'What it costs the server',
        body: `<p>Every open connection takes memory on a server and a slot on the load balancer. A million concurrent sockets need a fleet of gateway servers, and a publish/subscribe layer between them, so a goal event reaches the gateway each fan is connected to. Polling has the opposite cost: few open connections, but a flood of mostly empty requests. Long polling sits in between.</p>`,
      },
      {
        title: 'Batch the radio when it is not urgent',
        body: `<p>Each network burst keeps the cellular radio in a high-power state for several seconds after it ends. Ten tiny requests spread over a minute cost far more battery than one request with all ten. For anything that isn\'t real-time, such as analytics, logs and prefetching, batch the work and let WorkManager schedule it.</p>`,
      },
    ],
    mistakes: [
      { title: 'Background polling for live data', bad: '// "poll every 5 seconds in the background"\nPeriodicWorkRequestBuilder<ScoreWorker>(5, TimeUnit.SECONDS)', good: '// background: let the server push\nFirebase.messaging.subscribeToTopic("match-m42")', why: 'Periodic work can\'t run more often than every 15 minutes, and frequent wake-ups drain the battery. Push is the background channel.' },
      { title: 'Not catching up after a reconnect', bad: 'override fun onOpen(webSocket: WebSocket, response: Response) {\n    // start listening\n}', good: 'override fun onOpen(webSocket: WebSocket, response: Response) {\n    webSocket.send("""{"type":"resume","lastEventId":$lastSeen}""")\n}', why: 'Without a resume step, every event sent while the connection was down is silently gone.' },
    ],
    visual(el) {
      const EV = [7, 19, 22, 41, 55], T = 60;
      const STRAT = {
        Polling: () => {
          const req = [], del = []; let last = 0;
          for (let p = 10; p <= T; p += 10) { const got = EV.filter(e => e > last && e <= p); req.push({ t: p, empty: !got.length }); got.forEach(e => del.push({ e, t: p })); last = p; }
          return { req, del, held: false, note: 'radio wakes every 10 s' };
        },
        'Long polling': () => {
          const req = [{ t: 0, empty: false, open: true }], del = []; let t = 0;
          while (t < T) {
            const nx = EV.find(e => e > t);
            if (nx != null && nx - t <= 15) { del.push({ e: nx, t: nx }); req.push({ t: nx, empty: false }); t = nx; }
            else if (t + 15 < T) { req.push({ t: t + 15, empty: true }); t += 15; }
            else break;
          }
          return { req, del, held: true, note: 'request held open, re-sent after each answer or 15 s timeout' };
        },
        SSE: () => ({ req: [{ t: 0, empty: false }], del: EV.map(e => ({ e, t: e })), held: true, note: 'one HTTP response stays open; server → app only' }),
        WebSocket: () => ({ req: [{ t: 0, empty: false }, { t: 25, empty: true }, { t: 50, empty: true }], del: EV.map(e => ({ e, t: e })), held: true, note: 'one two-way connection; small pings keep it alive' }),
        'FCM push': () => ({ req: [], del: EV.map(e => ({ e, t: e + 1 })), held: false, note: 'no app connection; the shared FCM connection delivers (timing not guaranteed)' }),
      };
      const lane = h('div', { class: 'sd-time' }), held = h('div', { class: 'sd-held' }); lane.append(held);
      const evLane = h('div', { class: 'sd-time sd-thin' });
      EV.forEach(e => evLane.append(h('span', { class: 'sd-dot sd-d-ev', style: `left:${(e / T) * 100}%` })));
      [0, 15, 30, 45, 60].forEach(s => lane.append(h('span', { class: 'sd-tick', style: `left:${Math.min(97, Math.max(3, (s / T) * 100))}%` }, `${s}s`)));
      const stats = h('div', { class: 'sd-stats' });
      const o = out('Pick a strategy and run one minute.');
      let run = 0;
      const btns = Object.keys(STRAT).map(k => act(k, async () => {
        const me = ++run; press(btns, btns.find(b => b.k === k));
        const r = STRAT[k]();
        lane.querySelectorAll('.sd-dot').forEach(d => d.remove()); held.style.width = '0';
        const marks = [...r.req.map(q => ({ t: q.t, cls: q.empty ? 'sd-d-empty' : '' })), ...r.del.map(d => ({ t: d.t, cls: 'sd-d-ok' }))].sort((a, b) => a.t - b.t);
        let i = 0;
        for (let s = 0; s <= T; s += 1) {
          if (me !== run) return;
          if (r.held) held.style.width = `${(s / T) * 100}%`;
          while (i < marks.length && marks[i].t <= s) { lane.append(h('span', { class: `sd-dot ${marks[i].cls}`, style: `left:${(Math.min(marks[i].t, T - 0.5) / T) * 100}%` })); i++; }
          await sleep(35);
        }
        const avg = r.del.reduce((a, d) => a + (d.t - d.e), 0) / r.del.length;
        stats.innerHTML = `<span>requests opened <b>${r.req.length}</b></span><span>empty <b>${r.req.filter(q => q.empty).length}</b></span><span>avg delay <b>${avg.toFixed(1)} s</b></span><span>connection held <b>${r.held ? 'yes' : 'no'}</b></span>`;
        say(o, r.note);
      }));
      btns.forEach((b, i) => { b.k = Object.keys(STRAT)[i]; });
      el.append(h('div', { class: 'sd-wrap' }, row(...btns),
        label('events on the server'), evLane, label('what the app sees'), lane,
        h('div', { class: 'sd-key' }, h('span', {}, h('i', { class: 'sd-d-ev' }), 'event'), h('span', {}, h('i', {}), 'request'), h('span', {}, h('i', { class: 'sd-d-empty' }), 'empty answer / ping'), h('span', {}, h('i', { class: 'sd-d-ok' }), 'delivered')),
        stats, o));
    },
  });

  // 7 ─────────────────────────────────────────────
  lessons.push({
    id: 'push-scale',
    title: 'Push notifications at scale',
    tagline: 'One event, a million phones: fan-out, topics, collapse keys, TTL and stale tokens.',
    level: 'advanced',
    body: `
<p>Sending one notification is one API call. Sending a breaking story to a million phones is a <b>fan-out</b>: one event becomes a million deliveries. You can address them by <b>token</b> (each install has a registration token you store with the user) or by <b>topic</b> (installs subscribe to <code>breaking-news</code> and FCM does the fan-out). Firebase documents topic messages as tuned for throughput rather than latency, so a big topic does not reach every phone in the same second.</p>
<p>Delivery is not guaranteed. Phones are switched off, in Doze, out of coverage, or the app was uninstalled. FCM keeps messages for offline devices for their time to live (TTL), which defaults to four weeks, the maximum. A <b>collapse key</b> says "only the newest of these matters": a phone that was offline through three score updates gets only the last one. FCM allows up to four different collapse keys per device at a time.</p>
<p>Tokens go stale. Upload the token from <code>onNewToken</code> and on app start, with a timestamp. Delete a token when FCM answers <code>UNREGISTERED</code>, and drop tokens you haven\'t seen for about a month. FCM treats an Android token as expired after 270 days without activity. The app side is in <a href="#push.fcm">FCM basics</a> and <a href="#push.messages">notification vs data messages</a>. Step through a breaking story going to a million installs below.</p>`,
    code: `// Server (Kotlin + Firebase Admin SDK): one request, FCM fans out to every subscriber
val message = Message.builder()
    .setTopic("breaking-news")
    .setNotification(Notification.builder().setTitle("Breaking news").setBody("City safety drill has started").build())
    .putData("articleId", "a_981")
    .setAndroidConfig(
        AndroidConfig.builder()
            .setPriority(AndroidConfig.Priority.HIGH)          // shows a notification, so high is fair
            .setTtl(Duration.ofHours(1).toMillis())            // old news is worthless: let it expire
            .setCollapseKey("breaking")                        // a newer alert replaces an undelivered one
            .build(),
    )
    .build()
FirebaseMessaging.getInstance().send(message)

// App: keep the server's copy of the token fresh
class PushService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        TokenUploader.enqueue(applicationContext, token)       // WorkManager job: POST token + timestamp
    }
}

// App: opt in to a topic, for example from a settings switch
Firebase.messaging.subscribeToTopic("breaking-news")`,
    remember: 'Push is best effort. Set a TTL that matches how long the news matters, collapse what supersedes itself, and prune dead tokens.',
    terms: [
      { term: 'Fan-out', def: 'Turning one event into many deliveries, one per recipient device.' },
      { term: 'Topic', def: 'A named group in FCM that installs subscribe to. One send reaches every subscriber.' },
      { term: 'Collapse key', def: 'A label on a message. For an offline device, a newer message with the same key replaces an older undelivered one.' },
      { term: 'TTL (time to live)', def: 'How long FCM keeps trying to deliver a message to an offline device before dropping it.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Score updates: deliver fast, and let a newer score replace an older one that hasn\'t arrived yet.', code: 'AndroidConfig.builder()\n    .setPriority(AndroidConfig.Priority.[[HIGH]])\n    .[[setCollapseKey]]("score-m42")\n    .build()', why: 'High priority is for messages the user sees right away. A shared collapse key means an offline phone wakes up to the latest score only.' },
      { type: 'bug', prompt: 'The token table keeps growing and every send gets slower, with thousands of errors each time. Tap the line.', code: 'when (error.messagingErrorCode) {\n    MessagingErrorCode.UNREGISTERED -> tokens.keep(token)\n    MessagingErrorCode.QUOTA_EXCEEDED -> retryLater(token)\n    else -> log(error)\n}', bug: 1, fix: '    MessagingErrorCode.UNREGISTERED -> tokens.delete(token)', why: '<code>UNREGISTERED</code> means the token is no longer valid, for example after an uninstall. It will never work again, so delete it.' },
    ],
    quiz: [
      { q: 'A phone is offline while three score updates are sent with the same collapse key. What does it get when it reconnects?', options: ['All three, in order', 'Only the newest', 'None of them'], a: 1, why: 'For a disconnected device, FCM keeps only the last message per collapse key.' },
      { q: 'A breaking-news alert is sent with the default TTL. A phone is switched off for three days. What happens?', options: ['It never gets the alert', 'It gets a three-day-old alert when it turns on', 'It gets it one hour later'], a: 1, why: 'The default TTL is four weeks, so FCM delivers it late. For time-sensitive alerts, set a short TTL.' },
      { q: 'FCM returns <code>UNREGISTERED</code> for a token. What should the server do?', options: ['Retry it tomorrow', 'Delete the token from its database', 'Send the message to a topic instead'], a: 1, why: 'The token is invalid for good. Keeping it only adds failed sends to every fan-out.' },
      { q: 'An app sends high-priority data messages that never show a notification. What can FCM do over time?', options: ['Lower those messages to normal priority', 'Make them faster', 'Turn them into topics'], a: 0, why: 'FCM watches whether high-priority messages lead to visible notifications and may deprioritize them when they don\'t.' },
    ],
    deeper: [
      {
        title: 'Collapse keys, step by step',
        body: `<p>The phone is offline during a match. Send three score updates, with and without a collapse key, then bring the phone back.</p>`,
        visual(el) {
          const SC = ['1-0', '1-1', '2-1'];
          let useKey = true, queue = [], sent = 0;
          const q = h('div', { class: 'sd-list' }), phone = h('div', { class: 'sd-list' });
          const o = out('The phone is offline.');
          const paint = () => { q.replaceChildren(...(queue.length ? queue.map(s => h('div', { class: 'sd-item' }, h('span', {}, `score ${s}`), h('span', { class: 'sd-label' }, useKey ? 'key score-m42' : 'no key'))) : [h('div', { class: 'sd-empty' }, 'empty')])); };
          const keyBtn = toggle(on => `Collapse key: ${on ? 'on' : 'off'}`, true, on => { useKey = on; queue = []; sent = 0; phone.replaceChildren(); paint(); say(o, 'Queue cleared. Send the updates again.'); });
          const send = act('Send next score', () => {
            if (sent >= SC.length) { say(o, 'Match over. Bring the phone online.'); return; }
            const s = SC[sent++];
            if (useKey) queue = [s]; else queue.push(s);
            paint(); replay(q, 'pop-soft');
            say(o, useKey ? `Score ${s} replaces the undelivered one with the same key.` : `Score ${s} queued behind the others.`);
          });
          const on = act('Phone comes online', () => {
            phone.replaceChildren(...queue.map(s => h('div', { class: 'sd-item sd-fresh drop-in' }, h('span', {}, `🔔 Team A vs Team B ${s}`))));
            say(o, queue.length > 1 ? `${queue.length} notifications at once, two of them already wrong.` : queue.length ? 'One notification with the current score.' : 'Nothing was queued.');
            queue = []; sent = 0; paint();
          });
          el.append(h('div', { class: 'sd-wrap' }, row(send, on, keyBtn), h('div', { class: 'sd-pair' }, h('div', { class: 'sd-card' }, h('h4', {}, 'FCM queue for this phone'), q), h('div', { class: 'sd-card' }, h('h4', {}, 'Phone'), phone)), o));
          paint();
        },
      },
      {
        title: 'Your own fan-out for personal pushes',
        body: `<p>Topics suit "everyone who follows Sports". Personal pushes ("your team scored", "a reply to your comment") need per-token sends that your server fans out. Put the job on a queue, let a pool of workers send per token with a concurrency limit, retry <code>429</code> and <code>5xx</code> answers with backoff, and delete tokens that come back <code>UNREGISTERED</code>. Store each token with the user, the app version and a last-seen timestamp.</p>`,
        code: `// one breaking-news event -> many send jobs
queue.publish(FanOutJob(eventId = "e_77", segment = "followers:team-a"))

// workers
for (batch in tokens.forSegment(job.segment).chunked(500)) {
    batch.forEach { token -> sendWithRetry(token, message) }   // backoff on 429 / 5xx
}`,
      },
      {
        title: 'High priority only for what the user sees',
        body: `<p>High priority can wake a dozing phone, which costs battery. Use it for messages that show a notification right away. Silent syncs and prefetch nudges go as normal priority. FCM can lower the priority of an app\'s high-priority messages when they keep not producing visible notifications.</p>`,
      },
      {
        title: 'Measure what actually arrived',
        body: `<p>"Sent" is not "seen". FCM reports outcomes such as delivered, pending and dropped because the device was inactive. Add your own events on the device: received, shown, opened. The gap between sent and opened, per app version and per Android version, tells you where pushes get lost (a channel the user muted, battery optimisation, an old token).</p>`,
      },
    ],
    mistakes: [
      { title: 'Default TTL on time-sensitive alerts', bad: 'AndroidConfig.builder()\n    .setPriority(AndroidConfig.Priority.HIGH)\n    .build()   // TTL: four weeks', good: 'AndroidConfig.builder()\n    .setPriority(AndroidConfig.Priority.HIGH)\n    .setTtl(Duration.ofHours(1).toMillis())\n    .build()', why: 'A phone that was off for days would show "Breaking: storm warning" long after the storm.' },
      { title: 'Uploading the token only once', bad: 'override fun onNewToken(token: String) {\n    api.uploadToken(token)   // fails offline, never retried\n}', good: 'override fun onNewToken(token: String) {\n    TokenUploader.enqueue(applicationContext, token)   // WorkManager, retried\n}\n// and refresh the timestamp on app start', why: 'A lost upload means the server has no valid token for this install. Without timestamps you can\'t tell live tokens from dead ones.' },
    ],
    visual(el) {
      Lab.ui.graph(el, {
        height: 300,
        nodes: [
          { id: 'srv', label: 'Your server', x: 50, y: 10 },
          { id: 'tok', label: 'Tokens<small>your table</small>', x: 17, y: 44, tone: 'muted', hidden: true },
          { id: 'fcm', label: 'FCM<small>topic: breaking</small>', x: 50, y: 44, tone: 'warm' },
          { id: 'on', label: 'Online<small>now</small>', x: 17, y: 86, tone: 'ok' },
          { id: 'off', label: 'Offline<small>or Doze</small>', x: 50, y: 86, tone: 'muted' },
          { id: 'dead', label: 'Uninstalled<small>stale</small>', x: 83, y: 86, tone: 'err', hidden: true },
        ],
        predict: {
          q: 'Your server sends one breaking-news message to a topic with a million subscribers. How many requests does your server make?',
          options: ['One', 'One per subscriber', 'One per thousand subscribers'],
          a: 0,
          why: 'With a topic, FCM does the fan-out on its side. Your server only names the topic.',
        },
        frames: [
          { say: 'A breaking story must reach about a million installs subscribed to the topic <code>breaking</code>.' },
          { add: [['srv', 'fcm', '1 request']], say: 'Your server sends one message to the topic. FCM does the fan-out, not your workers.' },
          { add: [['fcm', 'on', '', 'ok']], hl: ['on'], say: 'Phones with a live FCM connection get it within seconds.' },
          { add: [['fcm', 'off', 'stored', 'warm']], hl: ['off'], say: 'Phones that are off or in Doze: FCM stores the message and delivers it when they reconnect, until its TTL runs out. The default is 4 weeks.' },
          { add: [['fcm', 'off', 'TTL 1 h', 'err']], hl: ['off'], say: 'Breaking news is old after an hour. With a 1-hour TTL, phones that stay off longer never get stale alerts.' },
          { show: ['tok'], remove: [['srv', 'fcm']], add: [['srv', 'tok', 'reads'], ['tok', 'fcm', 'per token']], hl: ['tok'], say: 'Personal alerts go per token instead. Now your server reads tokens from its own table and sends one request each.' },
          { show: ['dead'], add: [['fcm', 'dead', '', 'err']], hl: ['dead'], say: 'For an uninstalled app, FCM answers <code>UNREGISTERED</code>. Delete that token, and drop tokens you have not seen for about a month.' },
          { gone: ['dead'], remove: [['fcm', 'dead']], say: 'Pruned. Fewer wasted sends, and your delivery numbers mean something again.' },
        ],
      });
    },
  });

  // 8 ─────────────────────────────────────────────
  lessons.push({
    id: 'media',
    title: 'Images and media delivery',
    tagline: 'Resize per screen, pick modern formats, load progressively, and upload in resumable chunks.',
    level: 'intermediate',
    body: `
<p>Images are most of the bytes a news app downloads. A photographer\'s original is 4000×3000 pixels and several megabytes, but a list thumbnail needs a few hundred pixels across. Sending the original wastes the user\'s data plan, and decoding it takes 4000 × 3000 × 4 bytes, about 48 MB of memory, for one picture.</p>
<p>So the server stores one original, and an image service behind the CDN makes variants on request: <code>/img/a981.jpg?w=360&amp;fmt=webp</code>. The app asks for the width it will draw in pixels: the size in dp times the screen density. Modern formats help: WebP decodes on every Android version you still support, and AVIF decodes from Android 12. The CDN caches each variant, so the resize happens once.</p>
<p>For speed the user can feel, load progressively: a placeholder colour at once, a tiny blurred preview, then the real image. The image loader (<a href="#compose.images">Coil</a>) handles memory and disk caching on the device. Uploads go the other way, and big ones should go in chunks that can resume after a drop. Follow one thumbnail request below.</p>`,
    code: `@Composable
fun ArticleThumb(article: Article, modifier: Modifier = Modifier) {
    BoxWithConstraints(modifier.aspectRatio(4f / 3f)) {
        val widthPx = with(LocalDensity.current) { maxWidth.roundToPx() }
        // a few fixed widths, so the CDN caches a handful of variants instead of one per device
        val bucket = listOf(180, 360, 720, 1080).firstOrNull { it >= widthPx } ?: 1440
        AsyncImage(
            model = ImageRequest.Builder(LocalContext.current)
                .data("\${article.imageBase}?w=$bucket&fmt=webp")
                .crossfade(true)
                .build(),
            placeholder = ColorPainter(Color(article.dominantColor)),   // sent in the feed JSON, shown instantly
            contentDescription = null,                                  // decorative: the title is next to it
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
        )
    }
}`,
    remember: 'Request the pixels you will draw, in a modern format, from a CDN. Never ship the original to a thumbnail.',
    terms: [
      { term: 'Image variant', def: 'A version of one original image at a given width, quality and format, made by the server or CDN on request.' },
      { term: 'dp to px', def: 'Pixels = dp × density. A 120 dp thumbnail on a density-3 screen needs 360 px.' },
      { term: 'Progressive loading', def: 'Showing something at once (a colour, a tiny preview) and refining it as better data arrives.' },
      { term: 'Resumable upload', def: 'An upload split into chunks, where the client can ask the server how much it has and continue from there after a failure.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Turn the composable\'s width from dp into whole pixels.', code: 'val widthPx = with(LocalDensity.current) { maxWidth.[[roundToPx]]() }', why: '<code>roundToPx()</code> multiplies by the screen density and rounds, giving the pixel width to request.' },
      { type: 'bug', prompt: 'The memory estimate says a 360×270 bitmap needs about 97 KB. It really needs about four times that. Tap the line.', code: 'fun bitmapBytes(widthPx: Int, heightPx: Int): Long =\n    widthPx.toLong() * heightPx * 1   // ARGB_8888', bug: 1, fix: '    widthPx.toLong() * heightPx * 4   // ARGB_8888', why: '<code>ARGB_8888</code> stores 4 bytes per pixel: alpha, red, green and blue.' },
    ],
    quiz: [
      { q: 'A 4000×3000 photo is decoded as ARGB_8888. About how much memory does the bitmap take?', options: ['About 12 MB', 'About 48 MB', 'About 3 MB, the file size'], a: 1, why: '4000 × 3000 × 4 bytes = 48,000,000 bytes. The compressed file size says nothing about the decoded size.' },
      { q: 'A 120 dp thumbnail on a screen with density 3. Which width should the app request?', options: ['120 px', '360 px', '4000 px, and let the loader shrink it'], a: 1, why: '120 × 3 = 360 pixels. Anything larger is wasted download and memory.' },
      { q: 'A 40 MB video upload drops at 80%. With a resumable upload, what happens next?', options: ['It starts again from 0', 'The app asks the server how much it has and sends the remaining 20%', 'The upload is lost for good'], a: 1, why: 'The server keeps the received bytes for the session. The client asks for the offset and continues from there.' },
    ],
    deeper: [
      {
        title: 'Resumable uploads, chunk by chunk',
        body: `<p>Start an upload session, send the file in chunks, and if the connection drops, ask the server how many bytes it has and continue. Google Cloud Storage, for example, keeps a resumable session for up to a week. Run the upload inside WorkManager with a network constraint so it survives the app being closed. Try dropping the connection with and without resume.</p>`,
        visual(el) {
          const N = 8;
          let resumable = true, got = 0, sentTotal = 0, drop = false, busy = false;
          const cells = Array.from({ length: N }, () => h('span', {}));
          const stats = h('div', { class: 'sd-stats' });
          const o = out('A 40 MB video in 8 chunks of 5 MB.');
          const paint = (hot = -1) => {
            cells.forEach((c, i) => { c.className = i < got ? 'sd-c-ok' : i === hot ? 'sd-c-hot' : ''; });
            stats.innerHTML = `<span>on server <b>${got * 5} MB</b></span><span>sent in total <b>${sentTotal * 5} MB</b></span>`;
          };
          const modeBtn = toggle(on => on ? 'Resumable' : 'Single request', true, on => { resumable = on; got = 0; sentTotal = 0; paint(); say(o, on ? 'Resumable session: the server keeps what it received.' : 'One plain request: a drop throws the whole thing away.'); });
          async function go() {
            if (busy) return; busy = true;
            if (got >= N) { got = 0; sentTotal = 0; }
            if (got && resumable) say(o, `Asked the server for the offset: it has ${got * 5} MB. Continuing from chunk ${got + 1}.`);
            while (got < N) {
              paint(got); await sleep(260); sentTotal++;
              if (drop && got >= 4) {
                drop = false; cells[got].className = 'sd-c-err';
                if (!resumable) { await sleep(300); got = 0; paint(); say(o, '<span class="bad">Connection lost.</span> The single request failed; nothing was kept. Upload again starts from 0.'); }
                else say(o, '<span class="bad">Connection lost</span> in chunk ' + (got + 1) + '. Earlier chunks are safe on the server. Press Upload to resume.');
                busy = false; return;
              }
              got++; paint();
            }
            say(o, `Done. Sent ${sentTotal * 5} MB for a 40 MB file.`); busy = false;
          }
          el.append(h('div', { class: 'sd-wrap' }, row(act('Upload', go), act('Drop connection at chunk 5', () => { drop = true; say(o, 'The connection will drop during chunk 5.'); }), modeBtn), h('div', { class: 'sd-chunks', 'aria-hidden': 'true' }, cells), stats, o));
          paint();
        },
      },
      {
        title: 'Keep the number of variants small',
        body: `<p>If every device asks for its exact width (353, 361, 368 px…), the CDN stores hundreds of variants and most requests miss the cache. Round up to a few buckets. The image is a little bigger than needed, but the hit ratio goes up and the first load gets faster for everyone.</p>`,
      },
      {
        title: 'Reserve the space, then fill it',
        body: `<p>Put the image\'s aspect ratio and dominant colour in the feed JSON. The list can lay out every row at its final height before any image arrives, so nothing jumps, and the colour block makes the wait feel shorter. A tiny encoded preview (a few dozen bytes, blurred when drawn) is a step better.</p>`,
        code: `{ "id": "a_981", "title": "Team A 2-2 Team B",
  "image": { "base": "https://img.example.com/a981", "ratio": 1.333, "color": "#7A3B2E" } }`,
      },
      {
        title: 'Video streams adapt',
        body: `<p>Video is served as HLS or DASH: the file is cut into short segments at several bitrates, and the player switches between them as the network changes. Media3 ExoPlayer does this for you (<a href="#media.exoplayer">Playing media with ExoPlayer</a>). The design question is which renditions to encode and how long the segments are.</p>`,
      },
    ],
    mistakes: [
      { title: 'The original in a thumbnail', bad: 'AsyncImage(model = article.originalImageUrl, contentDescription = null)', good: 'AsyncImage(model = "\${article.imageBase}?w=360&fmt=webp", contentDescription = null)', why: 'The loader can shrink the bitmap, but the full file is still downloaded first: megabytes of data for a 360 px picture.' },
      { title: 'A big upload in one request', bad: 'api.upload(file.asRequestBody())   // 40 MB, all or nothing', good: '// resumable session: send chunks, ask for the offset after a failure\nuploader.resume(sessionUri, file, fromByte = server.offset(sessionUri))', why: 'On mobile, a drop during a long upload is likely. Restarting from zero wastes data and may never finish on a bad network.' },
    ],
    visual(el) {
      Lab.ui.flow(el, {
        nodes: [
          { id: 'app', label: 'App', sub: 'image loader' },
          { id: 'cdn', label: 'Image CDN', sub: 'variant cache' },
          { id: 'rs', label: 'Resizer', sub: 'scale + encode' },
          { id: 'org', label: 'Origin', sub: '4000×3000 JPEG' },
        ],
        predict: {
          q: 'A second phone asks for the same <code>w=360</code> WebP a minute later. What does the resizer do?',
          options: ['Resizes the original again', 'Nothing: the CDN answers from its cache', 'Sends the original so the phone can resize it'],
          a: 1,
          why: 'Each variant has its own URL, so the CDN caches it like any other file. The resize happens once per variant.',
        },
        frames: [
          { say: 'A list cell needs a thumbnail 360 pixels wide. Follow one image request.' },
          { at: 'app', packet: '?w=360&fmt=webp', say: 'The app asks for exactly that width and a modern format, not the original photo.' },
          { at: 'cdn', packet: 'miss', tone: 'warm', say: 'This is the first request for this variant, so the CDN has no copy yet.' },
          { at: 'org', packet: '≈3 MB JPEG', tone: 'warm', say: 'The resizer fetches the original once: 4000×3000 pixels, a few megabytes.' },
          { at: 'rs', packet: '360×270 WebP', tone: 'ok', mark: { rs: 'ok' }, say: 'It scales the photo to 360 px wide and encodes it as WebP: tens of kilobytes instead of megabytes (example sizes).' },
          { at: 'cdn', packet: '≈26 KB', tone: 'ok', mark: { cdn: 'ok' }, say: 'The CDN caches this variant under its own URL.' },
          { at: 'app', packet: '≈26 KB', tone: 'ok', mark: { app: 'ok' }, say: 'The phone downloads about 26 KB and decodes a 360×270 bitmap: 360 × 270 × 4 bytes ≈ 390 KB of memory.' },
          { at: 'cdn', packet: 'hit', tone: 'ok', say: 'The next phone that asks for the same variant gets a CDN hit. The origin and the resizer are not touched.' },
        ],
      });
    },
  });

  // 9 ─────────────────────────────────────────────
  lessons.push({
    id: 'reliability',
    title: 'Reliability: retries, backoff and degradation',
    tagline: 'Timeouts, exponential backoff with jitter, circuit breakers, 429s and feature flags.',
    level: 'advanced',
    body: `
<p>Networks fail all the time on mobile: tunnels, lifts, crowded stadiums. Servers fail too. Reliability means deciding in advance what the app does when a call fails, so a bad minute on the server doesn\'t turn into an hour-long outage.</p>
<p>Start with <b>timeouts</b>, so no request hangs forever. Then <b>retry</b> only what is safe to repeat (reads, or writes with an idempotency key), and wait longer each time: 1 s, 2 s, 4 s. That is <b>exponential backoff</b>. Add <b>jitter</b>, a random part of each wait, or a million phones that failed in the same second will all retry in the same second and knock the server over again. When the server answers <code>429 Too Many Requests</code> or <code>503</code> with a <code>Retry-After</code> header, wait at least that long.</p>
<p>When a dependency keeps failing, stop calling it for a while: a <b>circuit breaker</b>. Show cached content and a quiet banner instead of an error screen (<b>graceful degradation</b>), and keep a remote <a href="#launch.flags">feature flag</a> to switch off a broken feature without a release. Flow\'s <a href="#flow.errors-retry">retry operators</a> and WorkManager\'s backoff do the waiting for you. Below, eight phones retry after a 6-second outage against a server that can take 3 requests per second.</p>`,
    code: `suspend fun <T> withRetry(
    maxAttempts: Int = 5,
    baseMs: Long = 1_000,
    capMs: Long = 30_000,
    block: suspend () -> T,
): T {
    var attempt = 0
    while (true) {
        try {
            return block()
        } catch (e: HttpException) {
            val retryable = e.code() == 429 || e.code() in 500..599
            if (!retryable || ++attempt >= maxAttempts) throw e
            val retryAfterMs = e.response()?.headers()?.get("Retry-After")?.toLongOrNull()?.times(1_000)  // seconds form only
            delay(maxOf(retryAfterMs ?: 0L, fullJitter(attempt, baseMs, capMs)))
        } catch (e: IOException) {
            if (++attempt >= maxAttempts) throw e
            delay(fullJitter(attempt, baseMs, capMs))
        }
    }
}

// "Full jitter": a random wait between 0 and the exponential ceiling
private fun fullJitter(attempt: Int, baseMs: Long, capMs: Long): Long =
    Random.nextLong(0, minOf(capMs, baseMs shl attempt) + 1)

val client = OkHttpClient.Builder()
    .connectTimeout(10, TimeUnit.SECONDS)
    .readTimeout(15, TimeUnit.SECONDS)
    .callTimeout(30, TimeUnit.SECONDS)     // the whole call, including redirects and retries inside OkHttp
    .build()`,
    remember: 'Time out, retry only what is safe, back off exponentially with jitter, honour Retry-After, and degrade instead of failing.',
    terms: [
      { term: 'Exponential backoff', def: 'Waiting twice as long after each failed attempt (1 s, 2 s, 4 s…), up to a cap.' },
      { term: 'Jitter', def: 'Randomness added to each wait so clients that failed together don\'t retry together.' },
      { term: 'Circuit breaker', def: 'A switch that stops calls to a failing dependency for a cool-down, then lets one test call through.' },
      { term: 'Retry-After', def: 'A response header on 429 or 503 telling the client how long to wait before trying again.' },
      { term: 'Graceful degradation', def: 'Keeping the core of the app working when a part fails, for example showing cached news without the comments.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Compute the exponential ceiling and pick a random wait under it.', code: 'val ceiling = minOf(capMs, baseMs [[shl]] attempt)\nval wait = Random.[[nextLong]](0, ceiling + 1)', why: '<code>baseMs shl attempt</code> is baseMs × 2^attempt. A random value from 0 to that ceiling is "full jitter".' },
      { type: 'bug', prompt: 'After a server outage, every phone retries in lockstep every second and the server can\'t recover. Tap the line.', code: 'suspend fun refreshWithRetry() {\n    var attempt = 0\n    while (attempt < 5) {\n        try { return repository.refresh() }\n        catch (e: IOException) { attempt++ }\n        delay(1_000)\n    }\n}', bug: 5, fix: '        delay(Random.nextLong(0, (1_000L shl attempt) + 1))', why: 'A fixed one-second wait keeps all clients in sync. Growing the wait and randomising it spreads the retries out.' },
    ],
    predict: {
      q: "Eight phones retry every second during a 6-second outage. The server comes back. What is its first second like?",
      options: ["Calm: one phone retries at a time","A burst: all eight retry at once, above capacity","Empty: the phones have given up"],
      a: 1,
      why: "Fixed one-second retries keep every phone in step, so they all hit the recovering server together.",
    },
    quiz: [
      { q: 'Why add jitter to exponential backoff?', options: ['To make retries faster', 'So clients that failed together don\'t retry together and overload the server again', 'To use less memory'], a: 1, why: 'Without jitter, every client that failed at second 0 retries at 1, 3, 7… at the same moments, in spikes.' },
      { q: 'The server answers <code>429</code> with <code>Retry-After: 120</code>. What should the client do?', options: ['Retry after 1 second', 'Wait at least 120 seconds before retrying', 'Never retry'], a: 1, why: 'The server is telling you its limit. Retrying sooner just gets more 429s and adds load.' },
      { q: 'Which request is safe to retry automatically?', options: ['POST /payments with no idempotency key', 'GET /v1/feed', 'POST /comments with no idempotency key'], a: 1, why: 'A GET doesn\'t change anything, so repeating it is harmless. A POST without a key may be applied twice.' },
      { q: 'The circuit breaker for the comments service is open. What does the app do?', options: ['Keeps calling the service as usual', 'Fails fast or shows cached comments, and lets one test call through after a cool-down', 'Restarts itself'], a: 1, why: 'Open means "don\'t call". After the cool-down, half-open lets one call test whether the service is back.' },
      { q: 'The recommendations service is down. What should the article screen do?', options: ['Show a full-screen error', 'Show the article without the "related" row', 'Spin until the service is back'], a: 1, why: 'The article is the core feature. Optional parts should disappear quietly when they fail.' },
    ],
    deeper: [
      {
        title: 'A circuit breaker, by hand',
        body: `<p>Closed: calls go through. After 3 failures in a row it opens: calls fail at once without touching the network. After a cool-down it goes half-open and lets one call test the service. Success closes it; failure opens it again.</p>`,
        visual(el) {
          let healthy = false, state = 'closed', fails = 0, cool = 0;
          const st = { closed: h('span', { class: 'sd-box' }, h('b', {}, 'Closed'), h('small', {}, 'calls go through')), open: h('span', { class: 'sd-box' }, h('b', {}, 'Open'), h('small', {}, 'fail fast')), half: h('span', { class: 'sd-box' }, h('b', {}, 'Half-open'), h('small', {}, 'one test call')) };
          const log = h('div', { class: 'sd-log', 'aria-live': 'polite' });
          const stats = h('div', { class: 'sd-stats' });
          const paint = () => { Object.entries(st).forEach(([k, b]) => mark(b, k === state ? (k === 'open' ? 'sd-err' : k === 'half' ? 'sd-warn' : 'sd-ok') : null)); stats.innerHTML = `<span>failures in a row <b>${fails}</b></span><span>cool-down <b>${cool}s</b></span><span>service <b>${healthy ? 'healthy' : 'down'}</b></span>`; };
          const line = t => { log.append(h('div', {}, t)); log.scrollTop = log.scrollHeight; };
          const call = () => {
            if (state === 'open') { line('→ rejected at once, cached comments shown'); paint(); return; }
            if (healthy) { line(state === 'half' ? '→ test call OK: circuit closes' : '→ 200 OK'); state = 'closed'; fails = 0; }
            else {
              fails++;
              if (state === 'half' || fails >= 3) { state = 'open'; cool = 10; line('→ failed: circuit opens for 10 s'); }
              else line(`→ failed (${fails}/3)`);
            }
            paint();
          };
          const tick = () => { if (state === 'open') { cool = 0; state = 'half'; line('cool-down over: half-open'); } else line('10 s pass'); paint(); };
          const hBtn = toggle(on => `Service: ${on ? 'healthy' : 'down'}`, false, on => { healthy = on; paint(); });
          el.append(h('div', { class: 'sd-wrap' }, row(act('Load comments', call), act('+10 s', tick), hBtn), h('div', { class: 'sd-states' }, st.closed, st.open, st.half), stats, log));
          paint();
        },
      },
      {
        title: 'Limit yourself before the server does',
        body: `<p>Servers protect themselves with rate limits and answer <code>429</code> when you go over. The app can avoid most of them: debounce search typing, keep one refresh in flight instead of stacking them, and batch analytics. On the server, a token bucket per user is a common limiter: each request takes a token, tokens refill at a fixed rate, and an empty bucket means 429.</p>`,
        code: `// one refresh at a time, however often the user pulls
private val refreshMutex = Mutex()
suspend fun refresh() {
    if (!refreshMutex.tryLock()) return
    try { api.feed(cursor = null).also { dao.upsertAll(it.items.map(ArticleDto::toEntity)) } }
    finally { refreshMutex.unlock() }
}`,
      },
      {
        title: 'Decide what can fail',
        body: `<p>Rank the features. For a news app: the feed and article must work, from cache if needed. Comments, related articles, live tickers and recommendations are optional and should hide or show a small "couldn\'t load" row. A feature flag in Remote Config lets you switch off a broken optional feature for everyone in minutes, without shipping an update.</p>`,
      },
    ],
    mistakes: [
      { title: 'Retrying a write that isn\'t idempotent', bad: 'retry(3) { api.postComment(text) }   // may post three times', good: 'val key = UUID.randomUUID().toString()\nretry(3) { api.postComment(text, idempotencyKey = key) }', why: 'If the first attempt succeeded but the response was lost, each retry adds another comment.' },
      { title: 'An error screen when you have data', bad: 'catch (e: IOException) {\n    _ui.value = UiState.Error("No connection")\n}', good: 'catch (e: IOException) {\n    _ui.update { it.copy(banner = "Offline · showing saved news") }\n}', why: 'The cached feed is still useful. Replacing it with an error throws away what the user could read.' },
    ],
    visual(el) {
      const C = 8, CAP = 3, DOWN = 6, T = 24;
      const MODES = {
        'Retry every 1 s': n => 1,
        Exponential: n => 2 ** n,
        'Exponential + jitter': n => Math.random() * 2 ** (n + 1),
      };
      const hist = h('div', { class: 'sd-hist' });
      const lanes = h('div', { class: 'sd-lanes' });
      const stats = h('div', { class: 'sd-stats' });
      const o = out('Pick a strategy.');
      let run = 0;
      function simulate(wait) {
        const attempts = [], load = Array(T + 1).fill(0);
        const q = Array.from({ length: C }, (_, c) => ({ c, t: 0, n: 0 }));
        let finish = 0;
        while (q.length) {
          q.sort((a, b) => a.t - b.t);
          const x = q.shift();
          if (x.t > T) { attempts.push({ c: x.c, t: x.t, ok: false, out: true }); continue; }
          const s = Math.floor(x.t);
          load[s]++;
          const ok = x.t >= DOWN && load[s] <= CAP;
          attempts.push({ c: x.c, t: x.t, ok });
          if (ok) finish = Math.max(finish, x.t);
          else q.push({ c: x.c, t: x.t + wait(x.n), n: x.n + 1 });
        }
        return { attempts, load, finish, left: attempts.filter(a => a.out).length };
      }
      const btns = Object.keys(MODES).map(k => act(k, async () => {
        const me = ++run; press(btns, btns.find(b => b.k === k));
        const r = simulate(MODES[k]);
        hist.replaceChildren(h('span', { class: 'sd-cap', style: `bottom:${(CAP / C) * 100}%` }), ...r.load.map(() => h('span', { style: 'height:0' })));
        const bars = [...hist.children].slice(1);
        lanes.replaceChildren(...Array.from({ length: C }, (_, c) => h('div', { class: 'sd-lane' }, h('span', {}, `📱${c + 1}`), h('div', { class: 'sd-time sd-thin' }))));
        const rows = [...lanes.children].map(l => l.lastChild);
        const seen = Array(T + 1).fill(0);
        const list = r.attempts.filter(a => !a.out).sort((a, b) => a.t - b.t);
        let i = 0;
        for (let s = 0; s <= T; s += 0.5) {
          if (me !== run) return;
          while (i < list.length && list[i].t <= s) {
            const a = list[i++];
            rows[a.c].append(h('span', { class: `sd-dot ${a.ok ? 'sd-d-ok' : 'sd-d-err'}`, style: `left:${(a.t / T) * 100}%` }));
            const b = Math.floor(a.t); seen[b]++;
            bars[b].style.height = `${Math.min(100, (seen[b] / C) * 100)}%`;
            bars[b].classList.toggle('sd-over', seen[b] > CAP);
          }
          await sleep(45);
        }
        const peak = Math.max(...r.load);
        stats.innerHTML = `<span>requests <b>${list.length}</b></span><span>peak <b>${peak}/s</b> (server takes ${CAP}/s)</span><span>all done <b>${r.left ? `not by ${T} s` : `at ${r.finish.toFixed(1)} s`}</b></span>`;
        say(o, k === 'Retry every 1 s' ? 'Every phone hammers the server every second. Most requests are wasted, and the burst right after recovery is the biggest.' : k === 'Exponential' ? 'Fewer requests, but all eight still retry at the same moments: 1, 3, 7, 15 s. Each spike overloads the server again.' : 'Same backoff, random waits. The retries spread out, the load stays near capacity, and phones finish sooner.');
      }));
      btns.forEach((b, i) => { b.k = Object.keys(MODES)[i]; });
      el.append(h('div', { class: 'sd-wrap' }, row(...btns),
        label(`server load per second · down until ${DOWN} s · dashed line = capacity`), hist,
        label('each phone\'s attempts'), lanes,
        h('div', { class: 'sd-key' }, h('span', {}, h('i', { class: 'sd-d-err' }), 'failed'), h('span', {}, h('i', { class: 'sd-d-ok' }), 'succeeded')),
        stats, o));
    },
  });

  // 10 ─────────────────────────────────────────────
  lessons.push({
    id: 'news-feed',
    title: 'Design walkthrough: a news feed',
    tagline: 'A news app with a million daily readers, from requirements to the boxes and back to Room.',
    level: 'advanced',
    body: `
<p>Prompt: "Design a news app for a large publisher. 1M daily users." Clarify first. Functional: a feed per category, article pages, bookmarks, breaking-news push. Non-functional: content on screen in under a second even offline, usable on 3G, light on data and battery. Reads vastly outnumber writes: a few hundred articles a day from editors, millions of reads.</p>
<p>Estimate: 1M users × 10 feed loads is about 116 requests per second on average, a few hundred at the morning peak. Most of them ask for the same category feed, so a CDN with a short <code>max-age</code> answers nearly all of them and the origin sees a trickle. Images dominate bytes, so they get their own CDN and per-screen sizes.</p>
<p>Client: Compose UI → ViewModel → repository → Room as the source of truth. Paging with a <code>RemoteMediator</code> pulls feed pages into Room (<a href="#data.paging">Paging 3</a>). WorkManager prefetches top stories on Wi-Fi while charging, and drains the bookmark outbox. FCM topics carry breaking news (<a href="#push.fcm">FCM basics</a>). Server: CMS → feed service that rebuilds category lists on publish → cache → API behind the CDN, plus an image service and a push sender. Trace a few scenarios through the diagram below, or tap any box.</p>`,
    code: `@OptIn(ExperimentalPagingApi::class)
class FeedRepository @Inject constructor(
    private val db: NewsDb,
    private val api: NewsApi,
) {
    fun feed(category: String): Flow<PagingData<ArticleEntity>> = Pager(
        config = PagingConfig(pageSize = 20, prefetchDistance = 10),
        remoteMediator = FeedRemoteMediator(category, db, api),          // network -> Room
        pagingSourceFactory = { db.articles().pagingSource(category) },  // Room -> UI
    ).flow
}

// Prefetch the top stories on Wi-Fi while charging, so the morning open is instant
val prefetch = PeriodicWorkRequestBuilder<PrefetchWorker>(6, TimeUnit.HOURS)
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.UNMETERED)
            .setRequiresCharging(true)
            .build(),
    )
    .build()

WorkManager.getInstance(context)
    .enqueueUniquePeriodicWork("prefetch", ExistingPeriodicWorkPolicy.KEEP, prefetch)`,
    remember: 'Read-heavy and the same for everyone: cache the shared feed at the CDN, keep Room as the screen\'s source, and use push for what can\'t wait.',
    terms: [
      { term: 'Fan-out on write', def: 'Doing the work when content is published (rebuilding feed lists) so that reads are cheap lookups.' },
      { term: 'Cache hit ratio', def: 'The share of requests a cache answers without going to the origin. 95% means only 1 in 20 reaches your servers.' },
      { term: 'Origin', def: 'Your own servers behind the CDN, which answer whatever the CDN can\'t.' },
      { term: 'Prefetch', def: 'Downloading data before the user asks for it, at a cheap moment such as on Wi-Fi while charging.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Let the network fill Room, and let the UI page from Room.', code: 'Pager(\n    config = PagingConfig(pageSize = 20),\n    remoteMediator = [[FeedRemoteMediator]](category, db, api),\n    pagingSourceFactory = { db.articles().[[pagingSource]](category) },\n).flow', why: 'The mediator writes network pages into Room. The paging source comes from Room, so the list works offline and survives process death.' },
      { type: 'bug', prompt: 'The feed must open with content on the metro, but this pager shows an error offline. Tap the line.', code: 'val feed: Flow<PagingData<ArticleDto>> = Pager(\n    config = PagingConfig(pageSize = 20),\n    pagingSourceFactory = { FeedPagingSource(api) },\n).flow', bug: 2, fix: '    pagingSourceFactory = { db.articles().pagingSource(category) },', why: 'A network paging source has nothing to show offline. Page from Room and add a <code>RemoteMediator</code> to fill it from the network.' },
    ],
    predict: {
      q: "An editor publishes breaking news. Which part of the design reaches phones where the app is closed?",
      options: ["The CDN","FCM, with a topic message","Room"],
      a: 1,
      why: "The CDN and Room only answer when the app asks. FCM delivers to the device on its own shared connection.",
    },
    quiz: [
      { q: 'Which response is easiest to cache at the CDN?', options: ['The shared category feed, the same for everyone', 'The user\'s bookmarks', 'The user\'s notification settings'], a: 0, why: 'One response serves every reader of that category. Personal data must stay private and can\'t be shared.' },
      { q: 'About 116 feed requests per second arrive, and the CDN hit ratio is 95%. About how many reach the origin?', options: ['About 6 per second', 'About 116 per second', 'About 1,000 per second'], a: 0, why: '5% of 116 is about 6. That is why the origin for a news feed can be small.' },
      { q: 'An editor fixes a typo and the CDN is purged. Why do some readers still see the typo for a few minutes?', options: ['The CDN never purges', 'Phones keep their copy until its max-age runs out', 'Room is corrupted'], a: 1, why: 'Device caches follow the max-age they were given. Short max-age on articles keeps that window small.' },
      { q: 'Morning, on the metro, no signal. Which order happens when the app opens?', options: ['Network → Room → UI', 'Room → UI, then a network refresh into Room when possible', 'The UI waits for WorkManager'], a: 1, why: 'Offline-first: the screen reads Room at once. The refresh runs when it can and updates Room, which updates the screen.' },
    ],
    deeper: [
      {
        title: 'Split shared from personal',
        body: `<p>Personalising the whole feed makes every response unique, so the CDN can\'t help. Keep the big part shared and cacheable, and fetch a small personal part separately: the reader\'s followed teams, read markers, bookmarks. The app merges them in the repository.</p>`,
        code: `GET /v1/feed?category=sports&cursor=...   Cache-Control: public, max-age=30   (same for everyone)
GET /v1/me/feed-extras                    Cache-Control: private, no-cache    (small, per user)`,
      },
      {
        title: 'Build the feed when articles are published',
        body: `<p>Writes are rare and reads are constant, so do the work on write. When an editor publishes, the feed service inserts the article id into each category list it belongs to (a sorted list in Redis, say), and purges the CDN key for those feeds. A read is then a range lookup plus fetching article summaries, which are cached too.</p>`,
      },
      {
        title: 'Breaking news: push plus a fresh list',
        body: `<p>Push reaches people outside the app. Send to a topic with a short TTL and a collapse key, since a newer alert should replace an older one. Inside the app, the feed\'s 30-second max-age could hide the story briefly, so the push payload carries the article id and the app inserts or refreshes it directly.</p>`,
      },
      {
        title: 'Things to mention if there is time',
        body: `<p>Analytics batched and sent by WorkManager. Remote Config flags for new sections. Relative dates ("2 hours ago") and plurals from resources. Accessibility: content descriptions and large fonts in the article view. Observability: crash rate, cold-start time and feed-load errors per app version, so you notice a bad release.</p>`,
      },
    ],
    mistakes: [
      { title: 'A network-first feed', bad: 'val feed = flow { emit(api.feed(category, cursor = null).items) }   // blank offline', good: 'val feed = db.articles().observe(category)   // Room first\n// and refresh() writes network results into Room', why: 'Every cold start waits for the network, and in a tunnel the user sees an error instead of yesterday\'s news.' },
      { title: 'Polling for breaking news', bad: '// every 60 s while the app is open, and a worker in the background\nwhile (true) { api.breaking(); delay(60_000) }', good: '// server sends one topic message when it happens\nFirebase.messaging.subscribeToTopic("breaking-news")', why: 'Every open app asks once a minute and almost every answer is "nothing". In the background a worker can\'t run that often anyway (periodic work is at least 15 minutes apart), so the alert still arrives late. One push reaches everyone.' },
    ],
    visual(el) {
      const NODES = {
        ui: ['Compose UI', 'feed screen', 'Draws the list from PagingData. Shows an "offline, updated 08:12" banner when a refresh fails.'],
        vm: ['ViewModel', 'state holder', 'Exposes feed and UI state as StateFlow. Survives rotation.'],
        repo: ['Repository', 'offline-first', 'Reads Room, triggers refresh, owns the outbox for bookmarks.'],
        room: ['Room', 'source of truth', 'Articles, remote keys, bookmarks, outbox. Survives process death and works offline.'],
        wm: ['WorkManager', 'sync + prefetch', 'Drains the outbox with a network constraint; prefetches top stories on Wi-Fi while charging.'],
        cdn: ['CDN', 'max-age 30 s feed', 'Answers most feed and article reads at the edge. Purged by the feed service on publish.'],
        api: ['API / BFF', 'screen-shaped', 'Builds responses from the cache. Sets Cache-Control and ETag per endpoint.'],
        cache: ['Feed cache', 'Redis lists', 'Category lists of article ids, plus article summaries.'],
        svc: ['Feed service', 'fan-out on write', 'On publish: inserts the id into category lists, deletes cache keys, purges CDN paths.'],
        db: ['Database', 'articles', 'The authoritative copy of articles and user data.'],
        cms: ['CMS', 'editors', 'Where editors write, publish and fix articles.'],
        img: ['Image CDN', 'variants', 'Resizes originals to width buckets and WebP/AVIF, caches each variant.'],
        fcm: ['FCM', 'topics', 'Fans breaking news out to topic subscribers with TTL and collapse keys.'],
      };
      const SC = {
        'Cold start, online': [['ui', 'Feed screen opens'], ['vm', 'ViewModel collects repository.feed("top")'], ['repo', 'Repository reads Room first'], ['room', 'Room has 60 articles from last night: drawn at once'], ['cdn', 'RemoteMediator refresh: GET /v1/feed?category=top → CDN hit'], ['room', 'New page written in one transaction; the list updates'], ['img', 'Thumbnails at w=360, WebP, from the image CDN']],
        'Offline open': [['ui', 'Feed screen opens in a tunnel'], ['repo', 'Repository reads Room'], ['room', 'Cached articles and bookmarks shown'], ['repo', 'Refresh throws IOException: keep the content, show a banner'], ['wm', 'Sync stays queued until the network constraint is met']],
        'Pull to refresh': [['ui', 'User pulls to refresh'], ['repo', 'One refresh in flight (others ignored)'], ['cdn', 'CDN copy older than 30 s: goes to origin'], ['api', 'BFF assembles the feed'], ['cache', 'Feed cache hit: list of ids + summaries'], ['cdn', 'CDN stores the new copy for 30 s'], ['room', 'Room updated; Paging shows new items']],
        'Breaking news': [['cms', 'Editor publishes a breaking story'], ['svc', 'Feed service inserts it into the top-stories list'], ['cache', 'Cache keys for top stories deleted'], ['cdn', 'CDN paths for /v1/feed?category=top purged'], ['fcm', 'Topic message to breaking-news: TTL 1 h, collapse key "breaking"'], ['ui', 'User taps the notification → deep link to the article'], ['room', 'Article fetched and stored; back stack lands on the feed']],
        'Editor fixes a typo': [['cms', 'Editor fixes a headline'], ['db', 'Article version 8 → 9'], ['svc', 'Cache key deleted, CDN path purged'], ['cdn', 'Next request at the edge gets version 9'], ['room', 'Phones that opened it keep version 8 until max-age (5 min) runs out']],
      };
      const boxes = {};
      const info = h('div', { class: 'sd-say', 'aria-live': 'polite' }, 'Pick a scenario, or tap a box to see its job.');
      const log = h('div', { class: 'sd-log', 'aria-live': 'polite' });
      Object.entries(NODES).forEach(([k, [t, s, d]]) => {
        boxes[k] = h('button', { class: 'sd-box', type: 'button', onclick() { info.innerHTML = `<b>${t}</b>: ${d}`; replay(info, 'pop-soft'); } }, h('b', {}, t), h('small', {}, s));
      });
      const zone = (title, keys) => h('div', { class: 'sd-zone' }, label(title), h('div', { class: 'sd-flow' }, keys.map(k => boxes[k])));
      let run = 0;
      const btns = Object.keys(SC).map(k => act(k, async () => {
        const me = ++run; press(btns, btns.find(b => b.k === k)); log.replaceChildren();
        Object.values(boxes).forEach(b => mark(b, 'sd-dim'));
        const seen = new Set();
        for (const [n, text] of SC[k]) {
          if (me !== run) return;
          seen.forEach(s => mark(boxes[s], 'sd-ok'));
          mark(boxes[n], k === 'Editor fixes a typo' && n === 'room' ? 'sd-warn' : 'sd-hot'); seen.add(n);
          log.append(h('div', {}, `${String(log.childElementCount + 1).padStart(2)}. ${text}`)); log.scrollTop = log.scrollHeight;
          await sleep(650);
        }
      }));
      btns.forEach((b, i) => { b.k = Object.keys(SC)[i]; });
      el.append(h('div', { class: 'sd-wrap' }, row(...btns),
        h('div', { class: 'sd-pair' }, zone('phone', ['ui', 'vm', 'repo', 'room', 'wm']), zone('cloud', ['cdn', 'api', 'cache', 'svc', 'db', 'cms', 'img', 'fcm'])),
        log, info));
    },
  });

  // 11 ─────────────────────────────────────────────
  lessons.push({
    id: 'chat',
    title: 'Design walkthrough: a chat app',
    tagline: 'Delivery ticks, ordering, offline sending, push wake-ups and where encryption fits.',
    level: 'advanced',
    body: `
<p>Chat looks simple and hides most of the hard problems in this track. A message must never be lost, never appear twice, show in the same order for both people, and work when either phone is offline.</p>
<p>The sender\'s app writes the message to Room first, with a client-made id and state <b>pending</b> (a clock), and sends it over the WebSocket. The server stores it, gives it a <b>sequence number</b> within the conversation, and acks: now it is <b>sent</b> (✓). When the receiver\'s device stores it, the device acks: <b>delivered</b> (✓✓). When the receiver opens the chat: <b>read</b>. Each change is a small event back to the sender.</p>
<p>If the receiver is offline, the server keeps the message and sends a high-priority FCM data message, which is fair because the app will show a notification. The app wakes, fetches what it missed, and acks. Order comes from the server\'s sequence number, never from phone clocks. The client id doubles as an idempotency key, so a resend after a dropped connection can\'t create a copy. With end-to-end encryption, keys stay on the devices (<a href="#security.keystore">Android Keystore</a>) and the server stores only ciphertext. Send a few messages below with each phone on and off.</p>`,
    code: `enum class Delivery { PENDING, SENT, DELIVERED, READ }

@Entity(tableName = "messages", indices = [Index(value = ["conversationId", "serverSeq"])])
data class MessageEntity(
    @PrimaryKey val clientId: String = UUID.randomUUID().toString(),   // also the idempotency key
    val conversationId: String,
    val senderId: String,
    val body: String,
    val serverSeq: Long? = null,               // null until the server acks
    val state: Delivery = Delivery.PENDING,
    val createdAt: Long = System.currentTimeMillis(),
)

@Dao
interface MessageDao {
    // Server order first; my unsent messages stay at the bottom until acked
    @Query("""
        SELECT * FROM messages WHERE conversationId = :id
        ORDER BY serverSeq IS NULL, serverSeq, createdAt
    """)
    fun observe(id: String): Flow<List<MessageEntity>>

    @Query("UPDATE messages SET serverSeq = :seq, state = 'SENT' WHERE clientId = :clientId")
    suspend fun markSent(clientId: String, seq: Long)

    @Query("SELECT MAX(serverSeq) FROM messages WHERE conversationId = :id")
    suspend fun lastSeq(id: String): Long?      // "give me everything after this" on reconnect
}`,
    remember: 'Room first with a client id, server sequence for order, acks for ticks, push to wake an offline receiver.',
    terms: [
      { term: 'Delivery receipt', def: 'An ack from the receiving device that it stored the message: the second tick.' },
      { term: 'Sequence number', def: 'A counter the server assigns per conversation. It gives every device the same order and makes gaps easy to spot.' },
      { term: 'Client id', def: 'An id the sender makes before sending. It identifies the message across retries, so the server stores it once.' },
      { term: 'End-to-end encryption', def: 'Only the participants\' devices hold the keys. The server relays and stores ciphertext it can\'t read.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'When the server acks, store its sequence number and move the message to the sent state.', code: '@Query("UPDATE messages SET serverSeq = :seq, state = \'[[SENT]]\' WHERE [[clientId]] = :clientId")\nsuspend fun markSent(clientId: String, seq: Long)', why: 'The ack carries the client id you sent, so you can find the local row, and the sequence number that fixes its place in the conversation.' },
      { type: 'bug', prompt: 'Two friends see their messages in a different order, because one phone\'s clock is 3 minutes fast. Tap the line.', code: '@Query("""\n    SELECT * FROM messages WHERE conversationId = :id\n    ORDER BY createdAt\n""")\nfun observe(id: String): Flow<List<MessageEntity>>', bug: 2, fix: '    ORDER BY serverSeq IS NULL, serverSeq, createdAt', why: '<code>createdAt</code> comes from each phone\'s own clock. The server\'s sequence number is one order that every device shares.' },
    ],
    predict: {
      q: "The server stored Alice’s message, but its ack to Alice was lost. What does Alice’s phone show?",
      options: ["✓ sent","◷ pending, and it will resend","✓✓ delivered"],
      a: 1,
      why: "Alice only marks a message sent when the ack arrives. Without it the message stays pending and is resent with the same client id.",
    },
    quiz: [
      { q: 'Alice sends a message while Bob\'s phone is switched off. What does Alice see?', options: ['A clock forever', '✓ sent, then ✓✓ once Bob\'s phone comes online and stores it', '✓✓ at once'], a: 1, why: 'The server acks (✓) when it stores the message. Delivered (✓✓) needs Bob\'s device to receive it and ack.' },
      { q: 'The server stored a message, but the connection dropped before the ack reached the sender. The app resends with the same client id. What should happen?', options: ['Two copies appear', 'The server finds the client id and returns the existing sequence number: one copy', 'The message is lost'], a: 1, why: 'The client id makes the send idempotent. The resend only recovers the ack.' },
      { q: 'Bob has messages up to sequence 41 and then receives 43. What should his app do?', options: ['Show 43 and forget 42', 'Fetch the missing 42 from the server, then show them in order', 'Renumber 43 as 42'], a: 1, why: 'Sequence numbers make gaps visible. The client asks for what it is missing instead of silently skipping it.' },
      { q: 'With end-to-end encryption, what can the server no longer do for users?', options: ['Store messages', 'Send push wake-ups', 'Search the text of their messages on the server'], a: 2, why: 'The server holds only ciphertext. Search, previews and spam checks on content move to the device or go away.' },
    ],
    deeper: [
      {
        title: 'Ordering and gaps',
        body: `<p>The server increments a counter per conversation and stamps each message with it. Every device sorts by it, so everyone sees the same order. A client that has 41 and receives 43 knows 42 is missing and fetches it. After any reconnect, it asks for "everything after my last sequence" before going live again.</p>`,
        code: `// on (re)connect
val since = dao.lastSeq(conversationId) ?: 0
socket.send(json.encodeToString(Resume(conversationId, afterSeq = since)))`,
      },
      {
        title: 'Waking an offline receiver',
        body: `<p>When the receiver has no open socket, the server sends an FCM data message. Keep it small: the conversation id and maybe a preview, within the 4 KB data payload limit. With end-to-end encryption, either send only a "you have new messages" hint and let the app fetch, or send the ciphertext and decrypt on the device. Since the app shows a notification for it, high priority is the right choice.</p>`,
      },
      {
        title: 'Groups change the cost',
        body: `<p>In a group of 200, one message becomes 200 deliveries and up to 400 receipts. Store the message once per conversation and fan out only pointers or pushes. Aggregate receipts ("read by 37") instead of sending each one to every member, and consider dropping per-person read state for very large groups.</p>`,
      },
      {
        title: 'Encryption: say where it fits',
        body: `<p>In a design discussion it is usually enough to place it: keys are made and kept on each device, messages are encrypted before they leave the phone, and the server handles only ciphertext and metadata (who talked to whom, when). Name a known protocol such as Signal\'s, and the costs: multi-device needs keys for every device, backups get harder, and server-side features on content are gone.</p>`,
      },
    ],
    mistakes: [
      { title: 'A new id on every send attempt', bad: 'fun send(text: String) = socket.send(Outgoing(id = UUID.randomUUID().toString(), text))\n// called again on retry', good: 'val msg = MessageEntity(conversationId = c, senderId = me, body = text)   // id made once\ndao.insert(msg)\nsocket.send(Outgoing(id = msg.clientId, text = msg.body))', why: 'If the first attempt reached the server, a retry with a new id is a second message. Make the id once and store it.' },
      { title: 'Showing a message only after the server acks', bad: 'val seq = api.send(text)        // spinner until this returns\ndao.insert(MessageEntity(..., serverSeq = seq))', good: 'dao.insert(MessageEntity(..., state = Delivery.PENDING))   // visible at once\nsender.enqueue(msg.clientId)', why: 'On a slow network the message would sit in a spinner, and offline it would be lost. Room first, ticks later.' },
    ],
    visual(el) {
      const TEXT = ['Hi!', 'What time is the game?', '21:45, I think', 'OK, see you', 'Bring your jersey'];
      let aOn, bOn, dropAck, n, seq, msgs, busy;
      const aPhone = h('div', { class: 'sd-phone' }), bPhone = h('div', { class: 'sd-phone' });
      const srv = h('div', { class: 'sd-card' });
      const o = out('');
      const TICK = { PENDING: '◷', SENT: '✓', DELIVERED: '✓✓', READ: '✓✓' };
      function paint() {
        aPhone.className = `sd-phone${aOn ? '' : ' sd-off'}`; bPhone.className = `sd-phone${bOn ? '' : ' sd-off'}`;
        const ordered = [...msgs].sort((x, y) => (x.seq == null) - (y.seq == null) || (x.seq || 0) - (y.seq || 0) || x.t - y.t);
        aPhone.replaceChildren(h('div', { class: 'sd-phone-head' }, h('span', {}, 'Alice'), pill(aOn ? 'online' : 'offline', aOn ? 'sd-p-ok' : 'sd-p-warn')),
          ...ordered.map(m => h('div', { class: 'sd-bub sd-me' }, m.text, h('small', { class: m.state === 'READ' ? 'sd-read' : '' }, TICK[m.state]))));
        bPhone.replaceChildren(h('div', { class: 'sd-phone-head' }, h('span', {}, 'Bob'), pill(bOn ? 'online' : 'offline', bOn ? 'sd-p-ok' : 'sd-p-warn')),
          ...ordered.filter(m => m.onB).map(m => h('div', { class: 'sd-bub' }, m.text)));
        const stored = msgs.filter(m => m.seq != null).sort((x, y) => x.seq - y.seq);
        srv.replaceChildren(h('h4', {}, 'Server'), label('conversation, by sequence'),
          ...(stored.length ? stored.map(m => h('div', { class: 'sd-item' }, h('span', {}, `#${m.seq} ${m.text}`), h('span', { class: 'sd-label' }, m.onB ? 'acked by B' : 'waiting for B'))) : [h('div', { class: 'sd-empty' }, 'nothing stored')]));
      }
      function reset() { aOn = true; bOn = true; dropAck = false; n = 0; seq = 40; msgs = []; busy = false; aBtn.set(true); bBtn.set(true); paint(); say(o, 'Both phones online. Alice can send.'); }
      async function flushA() {
        if (busy) return; busy = true;
        for (const m of msgs.filter(x => x.state === 'PENDING')) {
          if (!aOn) break;
          await sleep(400);
          if (!aOn) break;
          if (m.seq == null) m.seq = ++seq;
          else { say(o, `Resent with client id ${m.id}. Server already has it as #${m.seq}: no copy, it just repeats the ack.`); }
          if (dropAck) {
            dropAck = false; paint();
            say(o, `Server stored #${m.seq}, but the ack was lost. Alice still sees ◷ and resends with the same client id.`);
            await sleep(1300); if (!aOn) break;
            say(o, `Resent with client id ${m.id}. Server already has it as #${m.seq}: no copy, it just repeats the ack.`);
            await sleep(900); if (!aOn) break;
          }
          m.state = 'SENT'; paint();
          await deliver(m);
        }
        busy = false;
      }
      async function deliver(m) {
        if (!bOn) { say(o, `#${m.seq} stored. Bob is offline: the server sends a high-priority FCM data message and waits.`); return; }
        await sleep(400);
        m.onB = true; if (m.state === 'SENT') m.state = 'DELIVERED'; paint();
        say(o, `#${m.seq} on Bob's phone. His device acked: ✓✓ delivered.`);
      }
      const aBtn = toggle(on => `Alice: ${on ? 'online' : 'offline'}`, true, on => { aOn = on; paint(); if (on) { say(o, 'Alice reconnects: pending messages go out in order.'); flushA(); } else say(o, 'Alice is offline. New messages stay in Room as pending.'); });
      const bBtn = toggle(on => `Bob: ${on ? 'online' : 'offline'}`, true, on => {
        bOn = on; paint();
        if (on) {
          const missing = msgs.filter(m => m.seq != null && !m.onB);
          missing.forEach(m => { m.onB = true; if (m.state === 'SENT') m.state = 'DELIVERED'; });
          paint(); say(o, missing.length ? `Bob's app wakes, asks for everything after his last sequence, gets ${missing.length}, acks: ✓✓.` : 'Bob is back online. Nothing missed.');
        } else say(o, 'Bob is offline.');
      });
      el.append(h('div', { class: 'sd-wrap' },
        row(act('Alice sends', () => {
          if (n >= TEXT.length) { say(o, 'Enough messages. Reset to start over.'); return; }
          const m = { id: Math.random().toString(16).slice(2, 6), text: TEXT[n++], state: 'PENDING', seq: null, onB: false, t: Date.now() };
          msgs.push(m); paint();
          say(o, aOn ? `Written to Room as pending (◷), client id ${m.id}. Sending over the socket…` : `Offline: saved as pending (◷), client id ${m.id}.`);
          if (aOn) flushA();
        }), act('Bob opens the chat', () => {
          if (!bOn) { say(o, 'Bob is offline; he can\'t read anything new.'); return; }
          const r = msgs.filter(m => m.onB && m.state !== 'READ'); r.forEach(m => { m.state = 'READ'; }); paint();
          say(o, r.length ? `Read receipt for ${r.length} message${r.length > 1 ? 's' : ''}: Alice's ticks turn blue.` : 'Nothing new to read.');
        }), aBtn, bBtn, act('Lose next ack', () => { dropAck = true; say(o, 'The next server ack to Alice will be lost.'); }), act('Reset', reset)),
        h('div', { class: 'sd-trio' }, aPhone, srv, bPhone), o));
      reset();
    },
  });

  Lab.addTrack({
    id: 'sysdesign',
    title: 'Mobile system design',
    description: 'How to design mobile systems, step by step: APIs, pagination, caching, offline sync, real-time, push at scale, media and reliability, with two full walkthroughs.',
    group: 'Beyond the app',
    requires: ['arch', 'data'],
    css,
    lessons,
  });
})();
