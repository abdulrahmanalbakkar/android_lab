/* System design track: the server side of the Recipes app (and the news reader), at scale.
   Demos use only the visual kit (Lab.ui.*), so this track needs no helpers or CSS of its own. */
(() => {
  Lab.addTrack({
    id: 'sysdesign',
    title: 'Mobile system design',
    description: 'Plan the server side of an app, step by step: requirements and estimates, APIs, pagination, caching, sync, real-time, push, media and reliability, then two full designs.',
    group: 'Beyond the app',
    requires: ['arch', 'data'],
    lessons: [
      {
        id: 'approach',
        title: 'How to approach a system design',
        tagline: 'Before any server code: what the system must do, how much work that is, and which parts do it.',
        goals: ['Write down what a system must do before drawing anything', 'Estimate requests per second and storage from a few example numbers', 'Sketch the parts of a system and the job of each one'],
        level: 'intermediate',
        introduces: [],
        body: `
<p>Recipes is doing well. In this track’s example, 200,000 people open it every day, at dinner time the server gets slow, and next month every recipe should get a photo. Before anyone writes server code, the team plans on paper: which parts the system needs, what each part does, and how much work it must handle. That plan is a <em>system design</em>. This track designs the server side of Recipes, one question at a time.</p>
<p>Start with the <em>requirements</em>: what the system must do, and how well. “Ada saves a recipe on her phone and sees it on her tablet.” “Anyone can browse the shared recipes in Explore.” “Explore opens in under a second.” Showing saved recipes offline is already the app’s job, from <a href="#data.caching">Caching</a>. Write the requirements down first; every later choice points back to one of them.</p>
<p>Then <em>estimate</em>: rough numbers that show the size of the job. These are example numbers, and the track keeps using them. 200,000 daily users × 10 requests each = 2,000,000 requests a day. A day has 86,400 seconds, so that is about 23 requests per second on average, and perhaps 4 times as many, about 92, at the dinner peak. Photos: 500 new recipes a day × 300 KB = 150 MB a day, about 55 GB a year (1,000 KB make a MB, 1,000 MB a GB). Round freely: the point is to know whether you need tens or thousands per second.</p>
<p>Last, sketch the parts and the job of each: the Recipes app; an <em>API server</em>, the program that answers the app’s requests; a database for recipes and users; and photo storage for the picture files. Then find the hard part. Here, reads outnumber writes by about 100 to 1 (another example number), so the next lessons are mostly about answering reads fast.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 280,
            predict: {
              q: '2,000,000 requests a day, spread over the 86,400 seconds of a day. About how many requests per second is that?',
              options: ['About 23', 'About 2,300', 'About 230,000'],
              a: 0,
              why: '2,000,000 / 86,400 is about 23. A day has many more seconds than most people guess.',
            },
            nodes: [
              { id: 'app', label: 'Recipes app<small>200,000 users a day</small>', x: 18, y: 50 },
              { id: 'api', label: 'API server<small>recipes.example.com</small>', x: 52, y: 50, tone: 'muted', hidden: true },
              { id: 'db', label: 'database<small>recipes, users</small>', x: 83, y: 18, tone: 'muted', hidden: true },
              { id: 'photos', label: 'photo storage<small>picture files</small>', x: 83, y: 82, tone: 'muted', hidden: true },
            ],
            frames: [
              { say: 'A blank page with only the app on it. First the requirements: save a recipe and see it on every device, browse Explore, and Explore opens in under a second.' },
              { show: ['api'], add: [['app', 'api', 'requests']], say: 'Something has to answer the app’s requests: the API server, at <code>recipes.example.com</code>.' },
              { show: ['db'], add: [['api', 'db', 'rows']], say: 'Recipes and users must outlive any one phone, so they live in a database. Only the API server talks to it.' },
              { show: ['photos'], add: [['api', 'photos', 'files']], say: 'Photos are big files, not rows in a table. They get their own place: photo storage.' },
              { hl: ['api'], say: 'Now the example numbers: 2,000,000 requests a day is about 23 a second, and about 92 at the dinner peak. That is the load the API server must carry.' },
              { hl: ['db', 'photos'], say: 'Storage: 500 new photos a day at 300 KB is 150 MB a day, about 55 GB a year. The recipe text is tiny next to that.' },
              { hl: ['app', 'api'], say: 'The hard part: for every save there are about 100 reads, many of them for the same Explore page. Answering reads fast is where the next lessons go.' },
            ],
          });
        },
        code: `// Example numbers for Recipes: guesses, written down so anyone can check or change them
fun main() {
    val dailyUsers = 200000
    val requestsPerUser = 10
    val secondsPerDay = 24 * 60 * 60                 // 86400

    val requestsPerDay = dailyUsers * requestsPerUser
    val perSecond = requestsPerDay / secondsPerDay
    val peakPerSecond = perSecond * 4                 // dinner time: guessed at 4 times the average
    println("$requestsPerDay requests a day")        // 2000000 requests a day
    println("$perSecond per second")                 // 23 per second
    println("$peakPerSecond at the peak")            // 92 at the peak

    val newRecipesPerDay = 500
    val photoKb = 300
    val photoMbPerDay = newRecipesPerDay * photoKb / 1000
    println("$photoMbPerDay MB of photos a day")             // 150 MB of photos a day
    println("\${photoMbPerDay * 365 / 1000} GB a year")       // 54 GB a year: Int drops the rest, so about 55
}`,
        remember: 'Requirements first, then rough example numbers, then the parts and their jobs. Then find the hard part.',
        terms: [
          { term: 'system design', def: 'A plan for a whole system: which parts it has, what each one does, and how much work it must handle.' },
          { term: 'requirements', def: 'What the system must do (“see my recipes on every device”) and how well (“Explore opens in under a second”).' },
          { term: 'estimate', def: 'A rough calculation from example numbers, such as requests per second or storage per year, to see the size of the job.' },
          { term: 'API server', def: 'The program on a server that answers the app’s requests, for Recipes at <code>recipes.example.com</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn the requests of all users into requests per second, then into the dinner peak, guessed at 4 times the average.', code: 'val requestsPerDay = dailyUsers [[*]] requestsPerUser\nval perSecond = requestsPerDay [[/]] secondsPerDay\nval peakPerSecond = perSecond * [[4]]', why: 'Users times requests gives the day’s total. Dividing by the seconds in a day gives the average, and the peak is a multiple of it.' },
          { type: 'bug', prompt: 'This estimate prints <code>1388 per second</code>, 60 times too many. Tap the wrong line.', code: 'fun main() {\n    val requestsPerDay = 2000000\n    val secondsPerDay = 24 * 60\n    val perSecond = requestsPerDay / secondsPerDay\n    println("$perSecond per second")\n}', bug: 2, fix: '    val secondsPerDay = 24 * 60 * 60', why: '<code>24 * 60</code> is the minutes in a day. A day has <code>24 * 60 * 60</code> = 86,400 seconds, and then the answer is 23.' },
        ],
        quiz: [
          { q: 'What comes first in a system design?', options: ['Writing down the requirements', 'Choosing a database', 'Writing the server code'], a: 0, why: 'Every later choice should point back to something the system must do. Without requirements, each box is a guess.' },
          { q: 'Example numbers: 50,000 daily users, 10 requests each. About how many requests per second is that on average?', options: ['About 6', 'About 60', 'About 500'], a: 0, why: '500,000 requests a day / 86,400 seconds is about 5.8, so about 6.' },
          { q: 'Reads outnumber writes by about 100 to 1. Where should the design put most of its effort?', options: ['Answering reads fast', 'Making saves faster', 'Neither: both happen equally often'], a: 0, why: 'Almost all the work is reads, so that is where speed matters most.' },
        ],
        docs: [['Overview of HTTP', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview']],
      },

      {
        id: 'api',
        title: 'Designing an API',
        tagline: 'Name requests after the things the app works with, and never break the apps already installed.',
        goals: ['Name requests after resources, such as <code>GET v1/recipes/42</code>', 'Tell a safe API change from a breaking one', 'Put a version in the path, so old app versions keep working'],
        level: 'intermediate',
        introduces: ['PUT', 'DELETE', 'Path'],
        body: `
<p>Lin hasn’t updated Recipes for a year. One day the server team renames the key <code>minutes</code> to <code>durationMinutes</code>, and Lin’s app can’t read any recipe: its <code>RecipeDto</code> needs <code>minutes</code>, so reading throws a <code>SerializationException</code>. A website changes for everyone the moment it is updated. An app doesn’t: people keep old versions for months, and all of them talk to the same server.</p>
<p>The requests a server answers, and what each one sends back, are its <em>API</em>. Design it around <em>resources</em>, the things the app works with, named as nouns in the path: <code>recipes</code> is Ada’s list, <code>recipes/42</code> is one recipe. The method says what to do: <code>GET</code> reads, <code>POST</code> adds one (the server answers <code>201 Created</code> with the new recipe and its id), <code>PUT</code> replaces one, and <code>DELETE</code> removes it (<code>204 No Content</code>: done, and no body). An id that doesn’t exist gets <code>404 Not Found</code>. In Retrofit, <code>{id}</code> in the path is filled from the parameter marked <code>@Path("id")</code>.</p>
<p>Some changes are safe for old apps. A new key, such as <code>"servings": 4</code>, is skipped by apps that read with <code>ignoreUnknownKeys</code>, from <a href="#data.net">Requests and errors</a>. A <em>breaking change</em> renames or removes a key, or changes its type. Those go into a new <em>version</em> of the API, named in the path, as the news reader’s server did with <code>/v1/headlines</code>. Recipes now puts <code>v1/</code> first in every path, so the base URL becomes <code>https://recipes.example.com/v1/</code>, and a breaking change goes to <code>v2/recipes</code>. The server keeps answering v1 as long as old apps call it, and counts requests per version to see when it can stop.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 290,
            predict: {
              q: 'The server renames <code>minutes</code> to <code>durationMinutes</code> inside v1. Lin’s year-old app asks for recipe 42. What happens?',
              options: ['Reading fails: her <code>RecipeDto</code> needs <code>minutes</code>', 'It works: <code>ignoreUnknownKeys</code> handles it', 'Her app updates itself first'],
              a: 0,
              why: '<code>ignoreUnknownKeys</code> only skips keys the app doesn’t know. A key the app needs is missing now, so reading throws a <code>SerializationException</code>.',
            },
            nodes: [
              { id: 'newapp', label: 'Recipes 3.0<small>new</small>', x: 17, y: 16 },
              { id: 'oldapp', label: 'Recipes 2.1<small>Lin’s phone</small>', x: 17, y: 84 },
              { id: 'v2', label: 'v2/recipes/42<small>durationMinutes</small>', x: 55, y: 16, tone: 'muted', hidden: true },
              { id: 'v1', label: 'v1/recipes/42<small>minutes</small>', x: 55, y: 84, tone: 'muted' },
              { id: 'db', label: 'database', x: 87, y: 50, tone: 'muted' },
            ],
            frames: [
              { add: [['newapp', 'v1', 'GET'], ['oldapp', 'v1', 'GET']], say: 'Two versions of Recipes are installed out there. Both ask for recipe 42 at <code>v1/recipes/42</code>.' },
              { add: [['v1', 'db', 'row 42'], ['newapp', 'v1', 'GET', 'ok'], ['oldapp', 'v1', 'GET', 'ok']], hl: ['v1'], say: 'The answer: <code>{"id":42,"title":"Tomato soup","minutes":25}</code>. Both apps read it into their <code>RecipeDto</code>.' },
              { hl: ['v1', 'oldapp'], say: 'A safe change: the answer gets a new key, <code>"servings": 4</code>. Recipes 3.0 shows it; Lin’s 2.1 skips it with <code>ignoreUnknownKeys</code>. Nothing breaks.' },
              { add: [['oldapp', 'v1', 'fails', 'err']], hl: ['oldapp'], say: 'A breaking change in place: v1 now sends <code>durationMinutes</code> instead of <code>minutes</code>. Lin’s app needs <code>minutes</code>, so reading throws a <code>SerializationException</code>. She can’t open a single recipe.' },
              { show: ['v2'], remove: [['newapp', 'v1']], add: [['oldapp', 'v1', 'GET', 'ok'], ['newapp', 'v2', 'GET', 'ok']], hl: ['v1', 'v2'], say: 'The right way: v1 keeps its shape, with <code>minutes</code>. The new shape lives at <code>v2/recipes/42</code>, and only Recipes 3.0, built for it, calls v2.' },
              { add: [['v2', 'db', 'row 42']], hl: ['db'], say: 'Both versions read the same row in the database. Only the shape of the answer differs, so running both costs little.' },
              { gone: ['oldapp'], remove: [['oldapp', 'v1']], hl: ['v1'], say: 'Months later the server’s count shows almost no requests to v1. The team announces a date, asks the last old apps to update, and then turns v1 off.' },
            ],
          });
        },
        code: `// Base URL: https://recipes.example.com/v1/
// Every call also sends the Authorization header from Signing in; left out here.
interface RecipeApi {
    @GET("recipes")                         // GET v1/recipes: Ada's list
    suspend fun getRecipes(): List<RecipeDto>

    @GET("recipes/{id}")                    // GET v1/recipes/42
    suspend fun getRecipe(@Path("id") id: Int): RecipeDto

    @POST("recipes")                        // 201 Created: the answer has the new id
    suspend fun addRecipe(@Body recipe: NewRecipe): RecipeDto

    @PUT("recipes/{id}")                    // replace recipe 42 with this one
    suspend fun saveRecipe(@Path("id") id: Int, @Body recipe: RecipeDto): RecipeDto

    @DELETE("recipes/{id}")                 // 204 No Content: no body, so nothing to return
    suspend fun deleteRecipe(@Path("id") id: Int)
}

@Serializable
data class NewRecipe(val title: String, val minutes: Int)   // no id yet: the server picks it

// v1 answer, still safe with a new key:  {"id":42,"title":"Tomato soup","minutes":25,"servings":4}
// v2 answer, after a breaking change:    {"id":42,"title":"Tomato soup","durationMinutes":25}`,
        remember: 'Nouns in the path, the method says what to do. Add freely inside a version; anything that breaks old apps goes to the next version.',
        mistakes: [
          {
            title: 'Renaming a key inside the same version',
            bad: `// v1/recipes/42, new server release
{"id":42,"title":"Tomato soup","durationMinutes":25}`,
            good: `// v1/recipes/42 keeps its shape
{"id":42,"title":"Tomato soup","minutes":25}
// the new name lives in v2/recipes/42
{"id":42,"title":"Tomato soup","durationMinutes":25}`,
            why: 'Every installed app that reads <code>minutes</code> breaks at once, and you can’t update apps that are already on people’s phones.',
          },
        ],
        terms: [
          { term: 'API', def: 'The requests a server answers and what each one sends back. The app and the server both depend on it.' },
          { term: 'resource', def: 'A thing the app works with, named as a noun in the path: <code>recipes</code>, <code>recipes/42</code>.' },
          { term: 'breaking change', def: 'A change that makes installed apps fail: renaming or removing a key, or changing its type. Adding a key is not one.' },
          { term: 'API version', def: 'A name in the path, like <code>v1/</code>, for one shape of the API. A breaking change goes to the next one, <code>v2/</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read one recipe by its id, and delete one.', code: '@[[GET]]("recipes/{id}")\nsuspend fun getRecipe(@[[Path]]("id") id: Int): RecipeDto\n\n@[[DELETE]]("recipes/{id}")\nsuspend fun deleteRecipe(@Path("id") id: Int)', why: 'The method names what to do, the path names the resource, and <code>@Path("id")</code> fills <code>{id}</code>.' },
          { type: 'bug', prompt: 'The first call crashes: Retrofit says the URL <code>recipes/{id}</code> has no <code>{recipeId}</code>. Tap the wrong line.', code: 'interface RecipeApi {\n    @GET("recipes/{id}")\n    suspend fun getRecipe(@Path("recipeId") id: Int): RecipeDto\n}', bug: 2, fix: '    suspend fun getRecipe(@Path("id") id: Int): RecipeDto', why: 'The name in <code>@Path</code> must match the name in braces in the path, here <code>id</code>.' },
        ],
        quiz: [
          { q: 'Which change can stay in v1?', options: ['Adding a new key, <code>"servings"</code>', 'Renaming <code>minutes</code> to <code>durationMinutes</code>', 'Changing <code>id</code> from a number to a text'], a: 0, why: 'Old apps skip a new key. A rename or a new type breaks every app that reads that key.' },
          { q: 'Which request reads recipe 42 in the Recipes API?', options: ['<code>GET v1/recipes/42</code>', '<code>POST v1/getRecipe?id=42</code>', '<code>DELETE v1/recipes/42</code>'], a: 0, why: 'The noun and the id are in the path, and <code>GET</code> says “read it”.' },
          { q: 'v2 is out. Why does the server keep answering v1?', options: ['Old app versions are still installed and call it', 'v2 needs v1 to work', 'The database only understands v1'], a: 0, why: 'People don’t update at once. v1 can go when its requests have nearly stopped.' },
        ],
        docs: [['Retrofit', 'https://square.github.io/retrofit/'], ['HTTP request methods', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods']],
      },

      {
        id: 'pagination',
        title: 'Pagination on the server',
        tagline: 'Page numbers repeat rows when new ones arrive. A cursor remembers where you stopped.',
        goals: ['Explain why page numbers repeat items when new rows arrive', 'Design a list endpoint that hands out a cursor', 'Switch a <code>PagingSource</code> from page numbers to cursors'],
        level: 'intermediate',
        introduces: ['LIMIT', 'OFFSET'],
        body: `
<p>Explore loads shared recipes 20 at a time with page numbers, as in <a href="#data.paging">Loading in pages</a>. The server now sorts them newest first. While Ada reads page 1, Sam and Lin share two new recipes. Ada scrolls on, and page 2 starts with two recipes she has already seen. Two rows with the same id also break the list’s <code>key</code>, which must be unique.</p>
<p>Here is why. For <code>page=2</code> the server runs <code>SELECT * FROM recipes ORDER BY id DESC LIMIT 20 OFFSET 20</code>: sort by id, largest first (<code>DESC</code>, as for the news reader’s headlines; new recipes get larger ids), skip 20 rows (<code>OFFSET</code>), and keep the next 20 (<code>LIMIT</code>). This is <em>offset pagination</em>. Two new rows at the top push every row down by two, so the first rows of page 2 are the two that ended page 1 a moment ago.</p>
<p>A <em>cursor</em> fixes it: instead of “skip 20”, the server says where it stopped. The answer is <code>{"recipes":[…],"next":"19981"}</code>, and the app asks for <code>explore?cursor=19981</code> next. The server runs <code>SELECT * FROM recipes WHERE id &lt; 19981 ORDER BY id DESC LIMIT 20</code>: the 20 recipes after the last one Ada saw, however many arrived on top. At the end, <code>next</code> is <code>null</code>. The app never looks inside the cursor; it hands it back unchanged, so the server is free to change what the text means later.</p>
<p>Cursors are faster deep in the list, too. Take the last page. With an offset it is <code>OFFSET 19980</code>, and the database walks past 19,980 rows only to throw them away. With a cursor it is <code>id &lt; 21</code>, and the database uses the primary key, which it keeps sorted like the index at the back of a book, and jumps straight there. The price: no jumping to page 50, which Explore doesn’t need. In the app only the key changes: <code>PagingSource&lt;String, RecipeDto&gt;</code>, with <code>nextKey = page.next</code>.</p>`,
        visual(el) {
          const tag = (text, tone) => `<span class="ui-m-chip" style="border-color:var(--${tone});background:var(--${tone}-soft)">${text}</span>`;
          const row = (id, extra = '') => `<div class="ui-m-row"><div>Recipe ${id}</div>${extra}</div>`;
          const more = n => `<div class="ui-m-muted">… ${n} more</div>`;
          const screen = rows => '<div class="ui-m-bar">Explore</div><div class="ui-m-body">' + rows.join('') + '</div>';
          const page1 = screen([row(20000), row(19999), row(19998), more(16), row(19981)]);
          Lab.ui.phone(el, {
            logTitle: 'Server log',
            predict: {
              q: 'Page 1 showed recipes 20000 down to 19981. Then two new recipes arrive at the top. With <code>LIMIT 20 OFFSET 20</code>, what does page 2 start with?',
              options: ['19982 and 19981, again', '19980, the next one down', 'The two new recipes'],
              a: 0,
              why: 'Two new rows at the top push every row down by two. Skipping 20 rows now stops two rows earlier.',
            },
            frames: [
              { screen: page1, log: ['GET v1/explore?page=1', 'ORDER BY id DESC LIMIT 20 OFFSET 0 → 20000 … 19981'], say: 'Explore, newest first. Page 1 is recipes 20000 down to 19981: the server sorts by id, largest first, and keeps 20.' },
              { log: ['INSERT 20001 (Sam)', 'INSERT 20002 (Lin)'], say: 'While Ada reads, Sam and Lin share two recipes. They get the next ids, 20001 and 20002, so they sort to the top.' },
              { screen: screen([row(19982), row(19981), row(19982, tag('again', 'err')), row(19981, tag('again', 'err')), row(19980)]), log: ['GET v1/explore?page=2', 'ORDER BY id DESC LIMIT 20 OFFSET 20 → 19982 … 19963'], say: 'Ada scrolls on. Page 2 skips 20 rows, but the list grew by two at the top: page 2 starts with 19982 and 19981, which she has already seen.' },
              { screen: page1, log: ['— the same, with a cursor —', 'GET v1/explore?limit=20', '→ 20000 … 19981, "next": "19981"'], say: 'Now the same story with a cursor. Page 1 is the same 20 recipes, and the answer also says where it stopped: <code>"next": "19981"</code>.' },
              { log: ['INSERT 20001 (Sam)', 'INSERT 20002 (Lin)'], say: 'Again two new recipes arrive at the top while Ada reads.' },
              { screen: screen([row(19982), row(19981), row(19980, tag('next', 'ok')), row(19979, tag('next', 'ok')), row(19978, tag('next', 'ok'))]), log: ['GET v1/explore?limit=20&cursor=19981', 'WHERE id < 19981 ORDER BY id DESC LIMIT 20 → 19980 … 19961'], say: 'The app sends the cursor back. The server asks for ids below 19981, so page 2 starts at 19980, whatever arrived on top.' },
              { log: ['the last page, asked two ways:', 'OFFSET 19980 → SCAN recipes', 'id < 21 → SEARCH recipes USING INTEGER PRIMARY KEY (rowid<?)'], say: 'At the very end of the list the difference is biggest. Asked how it will run each query, SQLite says: with the offset it scans the table row by row; with the cursor it searches by the primary key and jumps straight there.' },
            ],
          });
        },
        code: `// On the server (SQL):
//   page numbers: SELECT * FROM recipes ORDER BY id DESC LIMIT 20 OFFSET 20
//   cursor:       SELECT * FROM recipes WHERE id < 19981 ORDER BY id DESC LIMIT 20
//
// GET v1/explore?limit=20&cursor=19981 answers:
// {"recipes":[{"id":19980,"title":"Bean stew","minutes":40}, …],"next":"19961"}

@Serializable
data class ExplorePage(val recipes: List<RecipeDto>, val next: String?)   // next is null at the end

interface RecipeApi {
    // ...
    @GET("explore")                      // a null cursor is left out of the URL
    suspend fun explore(@Query("limit") limit: Int, @Query("cursor") cursor: String?): ExplorePage
}

class ExploreSource(private val api: RecipeApi) : PagingSource<String, RecipeDto>() {
    override suspend fun load(params: LoadParams<String>): LoadResult<String, RecipeDto> {
        try {
            val page = api.explore(limit = 20, cursor = params.key)   // key is null on the first load
            return LoadResult.Page(data = page.recipes, prevKey = null, nextKey = page.next)
        } catch (e: IOException) {
            return LoadResult.Error(e)
        } catch (e: HttpException) {
            return LoadResult.Error(e)
        } catch (e: SerializationException) {
            return LoadResult.Error(e)
        }
    }

    override fun getRefreshKey(state: PagingState<String, RecipeDto>): String? = null   // reload from the top
}`,
        remember: 'Offsets count rows, so new rows shift every page. A cursor names the last row sent, so the next page starts right after it.',
        terms: [
          { term: 'offset pagination', def: 'Pages made by skipping rows: page 2 is <code>LIMIT 20 OFFSET 20</code>. New rows at the top shift every page.' },
          { term: 'cursor', def: 'A text the server sends with a page, like <code>"next": "19981"</code>, that says where it stopped. The app sends it back unchanged for the next page.' },
          { term: 'LIMIT, OFFSET', def: 'SQL: <code>LIMIT 20</code> keeps at most 20 rows; <code>OFFSET 20</code> skips the first 20 before that.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Use the cursor as the page key, send it to the server, and take the next one from the answer.', code: 'class ExploreSource(private val api: RecipeApi) : PagingSource<[[String]], RecipeDto>() {\n    override suspend fun load(params: LoadParams<String>): LoadResult<String, RecipeDto> {\n        val page = api.explore(limit = 20, cursor = params.[[key]])\n        return LoadResult.Page(data = page.recipes, prevKey = null, nextKey = page.[[next]])\n    }\n}', why: 'The key is now the cursor text. <code>params.key</code> is <code>null</code> first, and <code>page.next</code> is <code>null</code> at the end, which tells Paging to stop.' },
          { type: 'bug', prompt: 'After page 1, Explore shows the newest recipes again instead of older ones. Tap the wrong line.', code: '// page 1\nSELECT * FROM recipes ORDER BY id DESC LIMIT 20\n// page 2, cursor 19981\nSELECT * FROM recipes WHERE id > 19981 ORDER BY id DESC LIMIT 20', bug: 3, fix: 'SELECT * FROM recipes WHERE id < 19981 ORDER BY id DESC LIMIT 20', why: 'Newest first means older recipes have smaller ids. The next page needs the ids below the cursor, <code>id &lt; 19981</code>.' },
        ],
        quiz: [
          { q: 'Explore uses page numbers. Two recipes are added while Ada reads page 1. What happens on page 2?', options: ['Its first two recipes repeat the end of page 1', 'Two recipes are skipped', 'Nothing changes'], a: 0, why: 'The new rows push every row down by two, and the offset still skips exactly 20.' },
          { q: 'The answer says <code>"next": "19981"</code>. What does the app do with it?', options: ['Sends it back unchanged as the cursor for the next page', 'Adds 20 to it', 'Shows it to the user'], a: 0, why: 'Only the server knows what is inside the cursor. The app hands it back as it is.' },
          { q: 'What can cursors not do easily?', options: ['Jump straight to page 50', 'Cope with new rows at the top', 'Tell the app that the list has ended'], a: 0, why: 'A cursor only knows where the last page stopped. For a list you scroll, that is all you need.' },
        ],
        docs: [['SQLite: SELECT and LIMIT', 'https://www.sqlite.org/lang_select.html'], ['Paging library overview', 'https://developer.android.com/topic/libraries/architecture/paging/v3-overview']],
      },

      {
        id: 'caching',
        title: 'Caching on the server',
        tagline: 'Most requests ask for the same thing. Answer them from a copy before they reach the database.',
        goals: ['Place caches in layers: the app, a CDN, the server cache, then the database', 'Tell shared caches what they may keep with <code>Cache-Control</code>', 'Throw away a cached copy when the data changes'],
        level: 'intermediate',
        introduces: [],
        body: `
<p>Each phone keeps its own copy of the recipes in Room, from <a href="#data.caching">Caching</a>, so it doesn’t ask twice. Still, at dinner about 92 requests a second reach the server (example numbers), and many ask for the same thing: the first page of Explore, which is the same for everyone. For each one, the database sorts and reads the same 20 rows again.</p>
<p>A <em>server cache</em> keeps recent answers in memory next to the API server; memory is much faster than the database. Every request checks it first. A <em>hit</em> is answered from memory. A <em>miss</em> goes to the database, and the answer is saved for next time with a time to live, say 60 seconds, after which it is thrown away. When a recipe changes, the server deletes that recipe’s copy at once, so nobody sees the old one for a minute.</p>
<p>A <em>CDN</em>, content delivery network, goes one step further: servers in many cities that keep copies of answers close to the users. Sam and Lin live in the same town, far from the API server. Lin gets Explore from the CDN’s server in her town, called an <em>edge server</em>, and her request never reaches <code>recipes.example.com</code>. The server says what such shared caches may keep with a header on the answer (answers have header lines too, like requests): <code>Cache-Control: public, max-age=60</code> means anyone may keep this for 60 seconds. Ada’s own recipes get <code>Cache-Control: private</code>: only her phone may keep them, or a shared cache could hand her list to Sam.</p>
<p>So a request meets caches in layers: the app’s Room copy, the CDN, the server cache, and only then the database. If the CDN answers 80% of the 92 requests a second (another example number), about 18 reach the API server; if the server cache answers 80% of those, about 4 reach the database.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            predict: {
              q: 'Lin opens Explore 20 seconds after Sam did, in the same town. The answer said <code>max-age=60</code>. Where does her answer come from?',
              options: ['The CDN’s edge server in their town', 'The database', 'The server cache'],
              a: 0,
              why: 'The edge server kept a copy for 60 seconds, so it answers her itself. The request never reaches your server.',
            },
            nodes: [
              { id: 'phone', label: 'Phones in one town', sub: 'Sam, then Lin' },
              { id: 'cdn', label: 'CDN', sub: 'edge server in town' },
              { id: 'api', label: 'API server', sub: 'recipes.example.com' },
              { id: 'cache', label: 'server cache', sub: 'memory' },
              { id: 'db', label: 'database', sub: 'recipes' },
            ],
            frames: [
              { at: 'phone', packet: 'GET explore', say: 'Sam opens Explore. His phone has no copy yet, so it asks for <code>v1/explore?limit=20</code>.' },
              { at: 'cdn', mark: { cdn: 'err' }, say: 'The request reaches the CDN’s edge server in his town first. It has no copy: a miss. It passes the request on.' },
              { at: 'cache', mark: { api: 'accent', cache: 'err' }, say: 'The API server checks its server cache in memory: another miss.' },
              { at: 'db', packet: '20 rows', mark: { db: 'warm' }, say: 'The database sorts the recipes and reads the 20 newest. This is the slow, costly step.' },
              { at: 'cache', packet: '20 recipes', mark: { cache: 'ok' }, say: 'On the way back the server cache saves the answer for 60 seconds, so the next request to this server needs no database.' },
              { at: 'cdn', packet: 'max-age=60', mark: { cdn: 'ok' }, say: 'The answer carries <code>Cache-Control: public, max-age=60</code>, so the edge server keeps a copy for 60 seconds too.' },
              { at: 'phone', packet: '20 recipes', tone: 'ok', say: 'Sam gets his list. His phone saves it in Room, as before.' },
              { at: 'cdn', packet: '20 recipes', tone: 'ok', say: '20 seconds later Lin, in the same town, opens Explore. A hit at the edge: she gets the answer from the edge server nearby, and the request never reaches your server.' },
            ],
          });
        },
        code: `// The answer's header tells shared caches what they may keep:
// GET v1/explore?limit=20    Cache-Control: public, max-age=60   (the same for everyone)
// GET v1/recipes             Cache-Control: private              (Ada's own: only her phone)

// A server cache, in a few lines of Kotlin. Times are in milliseconds.
data class Entry(val body: String, val savedAt: Long)

class ServerCache(private val ttl: Long) {
    private val saved = mutableMapOf<String, Entry>()

    fun read(key: String, now: Long, load: () -> String): String {
        val entry = saved[key]
        if (entry != null && now - entry.savedAt < ttl) {
            println("hit  $key")
            return entry.body
        }
        println("miss $key")
        val body = load()                   // ask the database
        saved[key] = Entry(body, now)
        return body
    }

    fun forget(key: String) {               // the data changed: drop the copy now
        saved.remove(key)
    }
}

fun main() {
    val cache = ServerCache(ttl = 60000)    // 60 seconds
    val fromDatabase = { "20 recipes" }
    cache.read("explore", now = 0, fromDatabase)        // miss explore
    cache.read("explore", now = 20000, fromDatabase)    // hit  explore
    cache.read("explore", now = 70000, fromDatabase)    // miss explore: the copy was 70 s old
    cache.forget("explore")                             // Sam shares a recipe: Explore changed
    cache.read("explore", now = 71000, fromDatabase)    // miss explore: fresh from the database
}`,
        remember: 'Check the closest copy first: the app, the CDN, the server cache, the database. Public answers may be shared; private ones never.',
        mistakes: [
          {
            title: 'Letting a shared cache keep private data',
            bad: `// GET v1/recipes (Ada's own list, with her token)
Cache-Control: public, max-age=60`,
            good: `// GET v1/recipes (Ada's own list, with her token)
Cache-Control: private`,
            why: '<code>public</code> lets the CDN keep the answer and hand it to the next person who asks the same address, even if they are not Ada.',
          },
        ],
        terms: [
          { term: 'server cache', def: 'Recent answers kept in memory next to the API server, so repeated requests don’t reach the database.' },
          { term: 'hit, miss', def: 'A hit is a request answered from the cache. A miss finds no fresh copy and has to ask further down.' },
          { term: 'CDN', def: 'Content delivery network: servers in many cities that keep copies of answers close to the users. Each of these servers is an <em>edge server</em>.' },
          { term: 'Cache-Control', def: 'A header on the answer that tells caches what they may keep: <code>public, max-age=60</code> (anyone, 60 seconds) or <code>private</code> (only the user’s own device).' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Explore is the same for everyone and may be kept for 60 seconds. Ada’s own list must never sit in a shared cache.', code: '// GET v1/explore?limit=20\nCache-Control: [[public]], max-age=[[60]]\n\n// GET v1/recipes\nCache-Control: [[private]]', why: '<code>public</code> lets shared caches such as the CDN keep the answer; <code>max-age</code> is in seconds. <code>private</code> keeps it on the user’s own device only.' },
          { type: 'bug', prompt: 'The cache should keep answers for 60 seconds, but it prints <code>miss</code> every time. <code>ttl</code> is in milliseconds. Tap the wrong line.', code: 'fun main() {\n    val cache = ServerCache(ttl = 60)\n    val fromDatabase = { "20 recipes" }\n    cache.read("explore", now = 0, fromDatabase)\n    cache.read("explore", now = 20000, fromDatabase)\n}', bug: 1, fix: '    val cache = ServerCache(ttl = 60000)', why: '60 milliseconds is gone long before the next request. 60 seconds is 60,000 milliseconds.' },
        ],
        quiz: [
          { q: 'Which answer may the CDN keep and share?', options: ['The first page of Explore', 'Ada’s own recipes', 'The tokens from <code>login</code>'], a: 0, why: 'Explore is the same for everyone. The other two belong to one person.' },
          { q: '92 requests a second, and the CDN answers 80% of them. About how many reach the API server?', options: ['About 18', 'About 74', 'All 92'], a: 0, why: '20% of 92 is about 18. The other 74 are answered at the edge.' },
          { q: 'Ada edits recipe 42. What should the server do with its cached copy of that recipe?', options: ['Delete it right away', 'Keep it until its 60 seconds are up', 'Nothing: caches update themselves'], a: 0, why: 'Deleting it means the next request reads the new version from the database. Otherwise people see the old one for up to a minute.' },
        ],
        docs: [['HTTP caching', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching'], ['CDN', 'https://developer.mozilla.org/en-US/docs/Glossary/CDN']],
      },

      {
        id: 'offline',
        title: 'Sync and conflicts',
        tagline: 'Two devices change the same recipe offline. The server notices, and nothing is lost.',
        goals: ['Explain how two offline edits can conflict', 'Detect a conflict on the server with a version number', 'Merge after a <code>409 Conflict</code> instead of overwriting'],
        level: 'intermediate',
        introduces: [],
        body: `
<p>On the metro, with no signal, Ada changes the tomato soup on her phone to 20 minutes. The app saves the change in Room and sends it when there is a network again, for example from a job like the ones in <a href="#background.workmanager">WorkManager</a>. Meanwhile, at home, her tablet is online, and she renames the same soup “Quick tomato soup”. Two changes to one recipe, made without knowing about each other: a <em>conflict</em>. The server is the one place that sees both, so the server must decide.</p>
<p>The simplest rule is <em>last write wins</em>: whatever arrives last replaces the rest. The phone’s late <code>PUT</code> carries the whole recipe, with the old title, so the tablet’s rename is lost without a word. That is fine for something small, like a favorite star, but not for Ada’s edits.</p>
<p>Better: each recipe on the server has a <em>version</em> number that goes up by one at every save. The app sends the version its edit was based on: <code>PUT v1/recipes/42</code> with <code>"version": 3</code>. If the server has 3 too, nobody saved in between: it saves, as version 4. If it has 4, someone did: it answers <code>409 Conflict</code> with its current copy and overwrites nothing. The app compares both copies with version 3, the copy its edit started from (still in Room): the tablet changed the title, the phone the minutes. Different fields, so it keeps both and sends again, based on version 4. If both changed the same field, it asks Ada which one to keep.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['Phone', 'Tablet', 'Server'],
            span: 60,
            unit: 'min',
            predict: {
              q: 'The tablet saved first, so the server’s recipe is at version 4. Now the phone sends its edit, based on version 3. What does the server answer?',
              options: ['<code>409 Conflict</code>, with its current copy', '200: it saves the phone’s copy over the tablet’s', '404: the recipe is gone'],
              a: 0,
              why: 'The versions differ, so someone saved in between. The server refuses to overwrite and sends what it has.',
            },
            frames: [
              { bars: [{ lane: 2, from: 0, to: 14, label: 'v3', tone: 'muted' }], now: 0, say: 'Recipe 42 on the server: “Tomato soup”, 25 minutes, version 3. Ada’s phone and tablet both have version 3 in Room.' },
              { bars: [{ lane: 0, from: 2, to: 20, label: 'edit, offline', tone: 'warm' }], now: 2, say: 'Minute 2, on the metro, no signal: on her phone Ada sets 20 minutes. The app saves it in Room, based on version 3, to send later.' },
              { bars: [{ lane: 1, from: 6, to: 14, label: 'PUT', tone: 'ok' }, { lane: 2, from: 14, to: 46, label: 'v4', tone: 'ok' }], now: 14, say: 'Minute 6, at home: on the tablet she renames it “Quick tomato soup”. The tablet sends <code>PUT v1/recipes/42</code> based on version 3. The server has 3 too, so it saves: version 4.' },
              { bars: [{ lane: 0, from: 20, to: 28, label: 'PUT', tone: 'err' }], marks: [{ at: 28, label: '409', tone: 'err' }], now: 28, say: 'Minute 20, signal again. The phone sends its edit, based on version 3. The server has 4: someone saved in between. It answers <code>409 Conflict</code> with its copy and overwrites nothing.' },
              { bars: [{ lane: 0, from: 28, to: 38, label: 'merge', tone: 'accent' }, { lane: 0, from: 38, to: 46, label: 'PUT', tone: 'ok' }, { lane: 2, from: 46, to: 60, label: 'v5', tone: 'ok' }], now: 46, say: 'The phone compares both copies with version 3, which its edit started from and still keeps in Room: the tablet changed the title, the phone the minutes. Different fields, so it keeps both and sends again, based on version 4. Saved as version 5: “Quick tomato soup”, 20 minutes.' },
              { bars: [{ lane: 1, from: 50, to: 58, label: 'v5', tone: 'ok' }], now: 58, say: 'At its next refresh the tablet gets version 5. Both devices agree, and neither change was lost.' },
              { now: 60, say: 'With last write wins, the phone’s late <code>PUT</code> would have replaced the whole recipe: the title back to “Tomato soup”, and the tablet’s change gone.' },
            ],
          });
        },
        code: `// On the wire:
// PUT v1/recipes/42   {"id":42,"title":"Tomato soup","minutes":20,"version":3}
// 409 Conflict        {"id":42,"title":"Quick tomato soup","minutes":25,"version":4}

// The server's check, in Kotlin:
data class Recipe(val id: Int, val title: String, val minutes: Int, val version: Int)

sealed interface SaveResult
data class Saved(val recipe: Recipe) : SaveResult          // answered with 200 OK
data class Conflict(val current: Recipe) : SaveResult      // answered with 409 Conflict

val recipes = mutableMapOf(42 to Recipe(42, "Tomato soup", 25, version = 3))

fun save(edit: Recipe): SaveResult {
    val current = recipes[edit.id]!!        // recipe 42 exists in this example
    if (edit.version != current.version) {
        return Conflict(current)            // someone saved in between
    }
    val saved = edit.copy(version = current.version + 1)
    recipes[edit.id] = saved
    return Saved(saved)
}

fun main() {
    val tablet = Recipe(42, "Quick tomato soup", 25, version = 3)
    val phone = Recipe(42, "Tomato soup", 20, version = 3)
    println(save(tablet))   // Saved(recipe=Recipe(id=42, title=Quick tomato soup, minutes=25, version=4))
    println(save(phone))    // Conflict(current=Recipe(id=42, title=Quick tomato soup, minutes=25, version=4))
    val merged = phone.copy(title = "Quick tomato soup", version = 4)   // keep both changes
    println(save(merged))   // Saved(recipe=Recipe(id=42, title=Quick tomato soup, minutes=20, version=5))
}`,
        remember: 'Every save raises the version. An edit based on an old version gets 409 Conflict, never a silent overwrite.',
        terms: [
          { term: 'conflict', def: 'Two changes to the same data, made without knowing about each other, for example on two devices while one was offline.' },
          { term: 'last write wins', def: 'A rule for conflicts: whatever arrives last replaces the rest. Simple, but the other change is lost.' },
          { term: 'version number', def: 'A number on each record that goes up by one at every save. An edit says which version it was based on.' },
          { term: '409 Conflict', def: 'The status code for “your change is based on an old copy”. The answer carries the server’s current copy.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Refuse an edit based on an old version, and raise the version on every save.', code: 'fun save(edit: Recipe): SaveResult {\n    val current = recipes[edit.id]!!\n    if (edit.[[version]] != current.version) {\n        return [[Conflict]](current)\n    }\n    val saved = edit.copy(version = current.version + [[1]])\n    recipes[edit.id] = saved\n    return Saved(saved)\n}', why: 'Different versions mean someone saved in between. Each save adds one, so the next edit based on the old number is caught.' },
          { type: 'bug', prompt: 'The tablet saved first, yet the phone’s edit, based on the same old version, overwrote it without a 409. Tap the wrong line.', code: 'fun save(edit: Recipe): SaveResult {\n    val current = recipes[edit.id]!!\n    if (edit.version != current.version) {\n        return Conflict(current)\n    }\n    val saved = edit.copy(version = current.version)\n    recipes[edit.id] = saved\n    return Saved(saved)\n}', bug: 5, fix: '    val saved = edit.copy(version = current.version + 1)', why: 'If a save keeps the old number, the next edit based on that number still matches. The version has to go up at every save.' },
        ],
        quiz: [
          { q: 'With last write wins, what is lost in Ada’s story?', options: ['The tablet’s new title', 'Nothing', 'Both changes'], a: 0, why: 'The phone’s <code>PUT</code> arrives last and carries the whole recipe with the old title.' },
          { q: 'The server’s recipe is at version 7. An edit based on version 7 arrives. What happens?', options: ['It is saved as version 8', '<code>409 Conflict</code>', 'It is saved, and stays version 7'], a: 0, why: 'Same version: nobody saved in between, so the edit is saved and the number goes up.' },
          { q: 'After a 409, the two copies changed different fields. What should the app do?', options: ['Keep both changes and send again with the new version', 'Send the same request again', 'Throw its change away'], a: 0, why: 'Sending the same request again gets another 409. Merging keeps both changes, and the new version number lets the save through.' },
        ],
        docs: [['Build an offline-first app', 'https://developer.android.com/topic/architecture/data-layer/offline-first'], ['409 Conflict', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/409']],
      },

      {
        id: 'realtime',
        title: 'Real-time at scale',
        tagline: 'Thousands of open connections need their own servers, and a way to reach the right one.',
        goals: ['Explain why open WebSockets go to their own connection servers', 'Estimate how many connections the Recipes server holds at the dinner peak', 'Follow one live change through pub/sub to every phone of the right user'],
        level: 'intermediate', introduces: [],
        body: `
<p>In <a href="#data.realtime">Live updates</a> the Recipes app opened a WebSocket, so Ada’s phone shows a change from her tablet at once. That was the app side. Now the server side, with example numbers: at the dinner peak, 20,000 phones have Recipes open, each with one WebSocket. An ordinary request is over in a moment: the API server answers and forgets it. A WebSocket stays open as long as the screen does, so the server holds 20,000 connections at the same time, each using a little memory. Polling instead would be worse: 20,000 phones asking every 10 seconds is 2,000 requests a second, more than 20 times the whole API’s dinner peak of about 92, and nearly every answer is “nothing new”.</p>
<p>So the open connections get servers of their own: <b>connection servers</b>, which only hold WebSockets and pass messages along. Say one holds 10,000 connections (an example number): at the peak Recipes needs two, A and B, and more as it grows. In front of them sits a <b>load balancer</b>, a server that hands each new connection or request to one of several servers behind it, so no single server gets too many.</p>
<p>That raises a new question. Ada’s tablet may be on server A and her phone on server B, and the API server that saves her change holds no connections at all. The answer is <b>pub/sub</b> (publish and subscribe): the API server publishes one message, “recipe 42 changed for Ada”, and every connection server that subscribed gets a copy. Each one passes it on to the phones it holds for Ada, and ignores it if it holds none.</p>
<p>Two more things follow. When a connection server restarts, all its phones lose the connection at the same moment and reconnect, which the reliability lesson makes gentle. And once Recipes is in the background, Android soon stops it (see <a href="#background.why-limits">Why Android limits background work</a>), and its WebSocket goes with it: reaching that phone is the job of push, in the next lesson.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            predict: {
              q: 'Ada saves a change on her tablet. The API server stores it. Her phone is connected to server B. How does B find out?',
              options: ['The API server publishes one message, and every connection server gets a copy', 'B asks the database every second', 'The API server opens its own connection to Ada’s phone'],
              a: 0,
              why: 'The API server doesn’t know which server holds which phone. It publishes once, and pub/sub hands a copy to every connection server.',
            },
            nodes: [
              { id: 'tab', label: 'Ada’s tablet', x: 13, y: 12 },
              { id: 'ada', label: 'Ada’s phone', x: 13, y: 55 },
              { id: 'lin', label: 'Lin’s phone', x: 13, y: 90 },
              { id: 'A', label: 'server A<small>connections</small>', x: 50, y: 30, tone: 'muted' },
              { id: 'B', label: 'server B<small>connections</small>', x: 50, y: 75, tone: 'muted' },
              { id: 'api', label: 'API server', x: 85, y: 12, tone: 'muted' },
              { id: 'bus', label: 'pub/sub', x: 85, y: 55, tone: 'warm', hidden: true },
              { id: 'C', label: 'server C<small>spare</small>', x: 85, y: 90, tone: 'muted', hidden: true },
            ],
            frames: [
              { add: [['tab', 'A', '', 'weak'], ['ada', 'B', '', 'weak'], ['lin', 'B', '', 'weak']], say: 'Example numbers: 20,000 open WebSockets at dinner, 10,000 per connection server, so two servers. The load balancer put Ada’s tablet on A, and her phone and Lin’s on B.' },
              { add: [['tab', 'api', 'PUT v1/recipes/42']], hl: ['api'], say: 'Ada changes the soup to 20 minutes on her tablet. The change is a normal request to the API server, which saves it in the database.' },
              { show: ['bus'], add: [['api', 'bus', 'recipe 42, Ada', 'accent']], hl: ['bus'], say: 'The API server holds no WebSockets, and doesn’t know where Ada’s devices are. It publishes one message.' },
              { add: [['bus', 'A', '', 'warm'], ['bus', 'B', '', 'warm']], hl: ['A', 'B'], say: 'Every connection server subscribed, so both get a copy. Each one checks: do I hold a phone of Ada’s?' },
              { add: [['A', 'tab', '', 'ok'], ['B', 'ada', 'recipe 42', 'ok']], hl: ['ada', 'tab'], say: 'A sends it to the tablet and B to the phone, each down that device’s open WebSocket. Lin’s phone, also on B, gets nothing: the change isn’t hers.' },
              { gone: ['B'], hl: ['ada', 'lin'], say: 'Later, server B restarts for an update. Its 10,000 phones lose their connection at the same moment, and all of them try to reconnect.' },
              { show: ['C'], remove: [['ada', 'B'], ['lin', 'B'], ['B', 'ada']], add: [['ada', 'C', '', 'weak'], ['lin', 'C', '', 'weak']], hl: ['C'], say: 'The load balancer sends them to a server with room. A is already full, so a third, spare server C takes them: that is why you keep one ready.' },
            ],
          });
        },
        code: `// A tiny model of pub/sub. Each connection server knows whose phones it holds.
class ConnectionServer(val name: String, val users: List<String>) {
    fun onPublish(user: String, text: String) {
        if (users.contains(user)) {
            println("$name sends to $user: $text")   // down that user's open WebSocket
        }
    }
}

fun main() {
    val servers = listOf(
        ConnectionServer("A", listOf("Ada", "Sam")),   // A holds Ada's tablet and Sam's phone
        ConnectionServer("B", listOf("Ada", "Lin")),   // B holds Ada's phone and Lin's phone
    )
    // The API server saved recipe 42 for Ada and publishes one message.
    // Every connection server gets it; only those holding Ada pass it on.
    for (server in servers) {
        server.onPublish("Ada", "recipe 42 changed")
    }
}
// A sends to Ada: recipe 42 changed
// B sends to Ada: recipe 42 changed`,
        remember: 'Open WebSockets live on connection servers; the API server publishes each change once, and pub/sub brings it to the servers holding that user’s phones.',
        terms: [
          { term: 'connection server', def: 'A server that only holds open WebSockets and passes messages down them.' },
          { term: 'load balancer', def: 'A server in front of several others that hands each new request or connection to one of them, so none gets too many.' },
          { term: 'pub/sub', def: 'Publish and subscribe: one side publishes a message, and every subscriber gets a copy.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Example numbers for the dinner peak. Fill in the sums.', code: `val online = 20000              // phones with Recipes open
val perServer = 10000           // connections one server holds
val servers = online [[/]] perServer            // 2
val pollingPerSecond = online / [[10]]          // 2000, if each phone asked every 10 s`, why: 'Two servers hold 20,000 connections. Polling every 10 seconds would mean one tenth of the phones asking in every second: 2,000 requests.' },
          { type: 'bug', prompt: 'Server B holds Ada’s phone, but sends nothing when a change for Ada is published. Tap the wrong line.', code: `class ConnectionServer(val name: String, val users: List<String>) {
    fun onPublish(user: String, text: String) {
        if (users.contains(name)) {
            println("$name sends to $user: $text")
        }
    }
}`, bug: 2, fix: '        if (users.contains(user)) {', why: 'The server must look for the user the message is for, not for its own name.' },
        ],
        quiz: [
          { q: 'Why do open WebSockets get their own connection servers?', options: ['Each one stays open as long as the screen does, so these servers hold thousands of connections at once', 'WebSockets can’t carry JSON', 'The API server is only allowed one connection'], a: 0, why: 'A request is over in a moment. A WebSocket is held for minutes or hours, which is a different kind of work.' },
          { q: 'Example numbers: 20,000 phones poll every 10 seconds. How many requests a second is that?', options: ['2,000', '200', '20,000'], a: 0, why: '20,000 / 10 = 2,000, and almost all of them find nothing new.' },
          { q: 'Ada’s phone is on server B, her tablet on A. The API server saves her change. What happens next?', options: ['It publishes one message; A and B both get it and pass it to Ada’s devices', 'It sends the change to B only, because it remembers where her phone is', 'Nothing, until the phone polls'], a: 0, why: 'With pub/sub the API server doesn’t need to know where anyone is connected.' },
        ],
        docs: [['The WebSocket API (MDN)', 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API']],
      },

      {
        id: 'push-scale',
        title: 'Push at scale',
        tagline: 'One event, 150,000 phones: a queue, a worker, and batches of 500.',
        goals: ['Explain fan-out: one event that becomes many deliveries', 'Split installation IDs into batches with <code>chunked</code> and send each with one FCM call', 'Clean up IDs that will never work again'],
        level: 'intermediate', introduces: ['chunked', 'MulticastMessage', 'putData', 'addAllFids', 'sendEachForMulticast', 'AndroidConfig', 'setAndroidConfig', 'setTtl'],
        body: `
<p>Every Friday, Recipes sends “Recipe of the week” to everyone who turned it on. The app side is done: in <a href="#push.fcm-registration">Registering with FCM</a> each install sent its installation ID to the server, which keeps one row per device. With example numbers, that is 150,000 IDs. One event that becomes many deliveries is called <b>fan-out</b>, and 150,000 sends don’t fit inside one request.</p>
<p>So the API server doesn’t send them. When the Recipes team presses Send, it puts one job in a <b>queue</b>, a list of jobs kept on the server that wait their turn, and answers at once. A push worker, a server program that takes jobs from the queue (like WorkManager’s worker, but on the server), reads the IDs. The job stays in the queue until the worker says it is done, so a crash doesn’t lose it, and more workers can share a big queue. FCM’s <code>sendEachForMulticast</code> takes up to 500 IDs per call, so the worker cuts the list into <b>batches</b> of 500 with <code>chunked(500)</code>: 300 calls.</p>
<p>Each call gives back one answer per ID, in the same order. An ID answered <code>UNREGISTERED</code> belongs to an install that is gone, for example because the app was uninstalled: delete its row, or every Friday wastes a call on it. Also decide how long the message is worth anything. A phone that is switched off gets it when it comes back, by default up to four weeks later. Like the server cache’s copies, a message can have a <b>time to live</b>: set a shorter one with <code>setTtl</code> in the message’s <code>AndroidConfig</code>, its Android part, such as two days, so nobody gets last week’s pick.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            predict: {
              q: 'Example numbers: 150,000 installation IDs, and FCM takes up to 500 per call. How many calls does the worker make?',
              options: ['300', '1', '150,000'],
              a: 0,
              why: '150,000 / 500 = 300. One call sends up to 500, and the SDK sends them for you, so the worker’s loop stays short.',
            },
            nodes: [
              { id: 'team', label: 'team', sub: 'presses Send' },
              { id: 'api', label: 'API server' },
              { id: 'queue', label: 'queue', sub: 'jobs wait' },
              { id: 'worker', label: 'push worker' },
              { id: 'fcm', label: 'FCM' },
              { id: 'phones', label: 'phones', sub: '150,000' },
            ],
            frames: [
              { say: 'Friday, 18:00. The Recipes team picks Sam’s lentil soup as recipe of the week.' },
              { at: 'api', packet: 'send', say: 'Pressing Send makes one request to the API server. It doesn’t send anything to phones itself.' },
              { at: 'queue', packet: 'job', mark: { api: 'ok' }, say: 'It puts one job in the queue and answers at once. The team’s screen doesn’t wait for 150,000 sends.' },
              { at: 'worker', packet: '150,000 IDs', say: 'A push worker takes the job and reads the installation IDs of everyone who turned the weekly pick on.' },
              { at: 'worker', packet: '300 × 500', tone: 'warm', say: '<code>chunked(500)</code> cuts the list into 300 batches of 500, the most FCM takes in one call.' },
              { at: 'fcm', packet: '300 calls', mark: { worker: 'ok' }, say: 'One <code>sendEachForMulticast</code> call per batch. FCM delivers to each phone; switched-off phones get it when they come back, within the time to live.' },
              { at: 'phones', packet: '✓', tone: 'ok', mark: { fcm: 'ok', phones: 'ok' }, say: 'The notification appears. Tapping it opens the soup, through the deep link from the push track.' },
              { at: 'worker', packet: '2,100 ✗', tone: 'err', mark: { phones: 'ok' }, say: 'The answers come back in the same order as the IDs. Say 2,100 say <code>UNREGISTERED</code> (an example number): those installs are gone, so the worker deletes their rows. The job is done.' },
            ],
          });
        },
        code: `// chunked cuts a list into lists of at most that many items:
// listOf("a", "b", "c", "d", "e").chunked(2) is [[a, b], [c, d], [e]]

// The push worker, on the server, with the Firebase Admin SDK
fun sendWeeklyPick(fids: List<String>, recipeId: String): List<String> {
    val failed = mutableListOf<String>()
    for (batch in fids.chunked(500)) {               // 150,000 IDs: 300 batches
        val message = MulticastMessage.builder()
            .putData("recipeId", recipeId)           // a data message, as in the push track
            .addAllFids(batch)
            .setAndroidConfig(AndroidConfig.builder().setTtl(2L * 24 * 60 * 60 * 1000).build())   // two days, in milliseconds
            .build()
        val response = FirebaseMessaging.getInstance().sendEachForMulticast(message)
        for ((i, answer) in response.responses.withIndex()) {   // same order as batch
            if (!answer.isSuccessful) {
                failed.add(batch[i])                 // check why; UNREGISTERED: delete its row
            }
        }
    }
    return failed
}`,
        remember: 'Fan-out goes through a queue to a worker, which sends in batches of 500, deletes dead IDs and sets a time to live.',
        terms: [
          { term: 'fan-out', def: 'One event that becomes many deliveries, one per device.' },
          { term: 'queue', def: 'A list of jobs kept on the server. Workers take them in turn, and a job stays until a worker marks it done.' },
          { term: 'batch', def: 'A group of items handled in one go, such as 500 installation IDs in one FCM call. <code>chunked(n)</code> makes them.' },
          { term: 'time to live', def: 'TTL: how long FCM keeps trying to deliver a message to a phone that is offline. Four weeks unless you set it shorter.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Send one FCM call per batch of 500 installation IDs.', code: `for (batch in fids.[[chunked]]([[500]])) {
    val message = MulticastMessage.builder()
        .putData("recipeId", recipeId)
        .[[addAllFids]](batch)
        .build()
    FirebaseMessaging.getInstance().[[sendEachForMulticast]](message)
}`, why: '<code>chunked(500)</code> makes the batches, <code>addAllFids</code> puts one batch in the message, and <code>sendEachForMulticast</code> sends it to every ID in it.' },
          { type: 'bug', prompt: 'FCM takes at most 500 IDs per call, but this worker’s batches are bigger. Tap the wrong line.', code: `for (batch in fids.chunked(5000)) {
    val message = MulticastMessage.builder()
        .putData("recipeId", recipeId)
        .addAllFids(batch)
        .build()
    FirebaseMessaging.getInstance().sendEachForMulticast(message)
}`, bug: 0, fix: 'for (batch in fids.chunked(500)) {', why: 'The batch size must be 500 or less, the most one <code>sendEachForMulticast</code> call takes.' },
        ],
        quiz: [
          { q: 'Why does the API server put a job in a queue instead of sending the 150,000 messages itself?', options: ['It can answer at once, and the job survives if the worker crashes', 'FCM only accepts calls from queues', 'Queues make messages smaller'], a: 0, why: 'The slow work happens in a worker. The job waits safely in the queue until it is done.' },
          { q: 'FCM answers <code>UNREGISTERED</code> for one installation ID. What should the worker do?', options: ['Delete that ID’s row', 'Try it again next Friday', 'Send it twice'], a: 0, why: 'That install is gone and the ID will never work again. Keeping it wastes a call on every fan-out.' },
          { q: 'Lin’s phone is switched off from Friday to Monday. The weekly pick was sent with a time to live of two days. What happens?', options: ['She doesn’t get it: it expired on Sunday', 'She gets it on Monday', 'FCM sends it to her tablet instead'], a: 0, why: 'FCM stops trying when the time to live runs out. Without one, she would get it, up to four weeks late.' },
        ],
        docs: [['Send messages with the Admin SDK', 'https://firebase.google.com/docs/cloud-messaging/send/admin-sdk'], ['Set the lifespan of a message', 'https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-lifespan']],
      },

      {
        id: 'media',
        title: 'Media at scale',
        tagline: 'Photos go straight to photo storage, get copies in a few sizes, and reach phones through the CDN.',
        goals: ['Upload a photo straight to photo storage with a signed upload URL', 'Pick the right size copy from the width the screen will draw', 'Explain why the CDN can keep photo copies for a year'],
        level: 'intermediate', introduces: [],
        body: `
<p>Every recipe has a photo. With the example numbers, 500 new photos arrive a day at about 300 KB each: 150 MB a day. And the Explore list shows 20 recipes at a time. At full size that is 20 × 300 KB = 6 MB of thumbnails for one screen, on Sam’s mobile data, to draw pictures not much bigger than a stamp.</p>
<p>First the upload. The photos live in <b>photo storage</b>: a service that keeps files by name, cheap for huge amounts, and that can hand them out again. The file shouldn’t go through the API server, which would be busy for the whole upload. Instead the app asks the API server with a small request, <code>POST v1/recipes/42/photo</code>, and gets back a new photo id, say <code>p7</code>, and a <b>signed upload URL</b>: an address that lets the app send one file to photo storage for a short time, say 15 minutes. <em>Signed</em> means it carries a code only the server can make, which storage checks. The app sends the photo there with a <code>PUT</code>, and the recipe’s JSON now says which photo it shows: <code>"photo":"p7"</code>.</p>
<p>Then the copies. A new photo puts a job in a queue, as in the push lesson, and a worker makes <b>image variants</b>: copies 360, 720 and 1440 pixels wide. The app asks for the smallest copy at least as wide as it will draw, which is the width in dp times the screen’s pixels per dp. A 120 dp thumbnail on a screen with 3 pixels per dp needs 360 px. Say the 360 px copy is about 30 KB: the Explore screen then costs 600 KB instead of 6 MB.</p>
<p>Last, delivery. The copies are named after the photo, not the recipe: <code>p7-360.jpg</code>, <code>p7-720.jpg</code>, <code>p7-1440.jpg</code>. If Ada replaces the photo, the new upload gets a new id, <code>p8</code>, so a name never shows a different picture. That is why the CDN from the caching lesson may keep each copy for up to a year, <code>Cache-Control: public, max-age=31536000</code> (365 × 86,400 seconds). An edge server may drop a copy few people ask for sooner, but popular photos are answered at the edge, not by photo storage.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            predict: {
              q: 'Sam’s phone has 3 pixels per dp, and the Explore thumbnail is 120 dp wide. Which copy should the app ask for?',
              options: ['The 360 px copy', 'The 1440 px copy, to look sharp', 'The original photo'],
              a: 0,
              why: '120 × 3 = 360 pixels. Anything bigger costs data and memory, and looks the same.',
            },
            nodes: [
              { id: 'ada', label: 'Ada’s phone' , x: 13, y: 15 },
              { id: 'api', label: 'API server', x: 50, y: 40, tone: 'muted' },
              { id: 'store', label: 'photo storage', x: 85, y: 15, tone: 'muted' },
              { id: 'work', label: 'worker<small>makes copies</small>', x: 85, y: 85, tone: 'muted', hidden: true },
              { id: 'cdn', label: 'CDN', x: 50, y: 65, tone: 'warm' },
              { id: 'sam', label: 'Sam’s phone', x: 13, y: 65 },
              { id: 'lin', label: 'Lin’s phone', x: 13, y: 92 },
            ],
            frames: [
              { say: 'Ada adds a photo to her tomato soup, recipe 42. Example size: 300 KB.' },
              { add: [['ada', 'api', 'POST …/42/photo'], ['api', 'ada', '', 'ok']], hl: ['api'], say: 'The app asks for a signed upload URL. The API server gives the new photo the id <code>p7</code> and signs an address, valid for 15 minutes and for this one file.' },
              { add: [['ada', 'store', 'PUT 300 KB', 'ok']], hl: ['store'], say: 'The app sends the file straight to photo storage. The API server isn’t busy for the whole upload.' },
              { show: ['work'], add: [['store', 'work', 'new photo'], ['work', 'store', '360 · 720 · 1440', 'ok']], hl: ['work'], say: 'A queue job tells a worker about the new photo. It makes three copies once, and stores them as <code>p7-360.jpg</code>, <code>p7-720.jpg</code> and <code>p7-1440.jpg</code>: named after the photo, so a new photo never reuses a name.' },
              { add: [['sam', 'cdn', 'p7-360'], ['cdn', 'store', 'miss', 'err']], hl: ['cdn'], say: 'Sam opens Explore and asks for the 360 px copy. The nearby edge server doesn’t have it yet, so it fetches it from photo storage: 30 KB, not 300.' },
              { add: [['lin', 'cdn', 'p7-360', 'ok']], hl: ['lin', 'cdn'], say: 'Lin asks for the same copy. The edge server has it now and answers by itself, and can keep doing so for up to a year.' },
            ],
          });
        },
        code: `val widths = listOf(360, 720, 1440)   // the copies the server makes of every photo

// photo is the id from the recipe's JSON, such as "p7"
fun photoUrl(photo: String, dp: Int, density: Double): String {
    val needed = (dp * density).toInt()                        // pixels the screen will draw
    val width = widths.firstOrNull { it >= needed } ?: widths.last()
    return "https://cdn.recipes.example.com/photos/$photo-$width.jpg"
}

fun main() {
    println(photoUrl("p7", 120, 3.0))   // https://cdn.recipes.example.com/photos/p7-360.jpg   needs 360 px
    println(photoUrl("p7", 120, 2.0))   // https://cdn.recipes.example.com/photos/p7-360.jpg   needs 240 px: 360 is the smallest that fits
    println(photoUrl("p7", 400, 3.0))   // https://cdn.recipes.example.com/photos/p7-1440.jpg  needs 1200 px
}`,
        remember: 'Upload straight to photo storage with a signed URL, make a few sizes once, ask for the smallest that fits, and let the CDN keep them.',
        terms: [
          { term: 'photo storage', def: 'A service that keeps files by name, cheap for huge amounts, and hands them out again.' },
          { term: 'signed upload URL', def: 'An address that lets the app send one file to storage for a short time. It carries a code only the server can make, which storage checks.' },
          { term: 'image variant', def: 'A copy of one photo at a set width, made once by the server, such as <code>p7-360.jpg</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Work out the pixels the screen needs, then pick the smallest copy that is wide enough.', code: `val needed = (dp * [[density]]).toInt()
val width = widths.[[firstOrNull]] { it [[>=]] needed } ?: widths.last()`, why: 'Width in dp times pixels per dp gives the pixels. <code>firstOrNull</code> finds the first copy at least that wide; the list is sorted from small to big.' },
          { type: 'bug', prompt: 'On the full-width recipe screen, the photo looks blurry: the app always gets the 360 px copy. Tap the wrong line.', code: `fun photoUrl(photo: String, dp: Int, density: Double): String {
    val needed = (dp * density).toInt()
    val width = widths.firstOrNull { it <= needed } ?: widths.last()
    return "https://cdn.recipes.example.com/photos/$photo-$width.jpg"
}`, bug: 2, fix: '    val width = widths.firstOrNull { it >= needed } ?: widths.last()', why: 'With <code><=</code>, 360 is always the first match. The copy must be at least as wide as needed: <code>>=</code>.' },
        ],
        quiz: [
          { q: 'Why does the app upload the photo with a signed upload URL instead of through the API server?', options: ['The file goes straight to photo storage, so the API server isn’t busy for the whole upload', 'The API server can’t receive files', 'It makes the photo smaller'], a: 0, why: 'The API server only signs a short-lived address. Storage is built for big files.' },
          { q: 'Example numbers: 20 thumbnails at 300 KB each, or at 30 KB each. How much data does the smaller copy save on one screen?', options: ['5.4 MB: 6 MB down to 600 KB', '270 KB', 'Nothing, the CDN shrinks them anyway'], a: 0, why: '20 × 300 KB = 6 MB, 20 × 30 KB = 600 KB.' },
          { q: 'Why can the CDN keep photo copies for a whole year?', options: ['Copies are named after the photo id, so a name always shows the same picture', 'Photos are too big to download twice', 'The CDN ignores max-age'], a: 0, why: 'A replaced photo gets a new id, such as <code>p8</code>, so its copies get new URLs. An old name never goes out of date.' },
        ],
        docs: [['Loading images in Compose', 'https://developer.android.com/develop/ui/compose/graphics/images/loading'], ['HTTP caching (MDN)', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching']],
      },

      {
        id: 'reliability',
        title: 'Reliability',
        tagline: 'Retry safely with an idempotency key, and wait a little longer, a little randomly, each time.',
        goals: ['Explain why a retried <code>POST</code> can save a recipe twice', 'Make a retry safe with an idempotency key the server remembers', 'Space retries out with exponential backoff and jitter'],
        level: 'intermediate', introduces: ['randomUUID', 'Random', 'nextLong'],
        body: `
<p>Ada saves her new lemon pasta as the train enters a tunnel. The <code>POST v1/recipes</code> reaches the server, which saves it and answers 201, but the answer is lost on the way back. Her phone only sees an <code>IOException</code>, so it tries again. The server can’t tell a retry from a new recipe, and now Ada has two lemon pastas.</p>
<p>A request is <b>idempotent</b> when doing it twice has the same effect as doing it once. A <code>GET</code> is: it only reads. <code>PUT</code> and <code>DELETE</code> are idempotent too: replacing or deleting twice ends the same way. A <code>POST</code> that creates something is not. To make it safe, the app gives each new recipe an <b>idempotency key</b>: a random id made once, with <code>UUID.randomUUID().toString()</code> (from <code>java.util.UUID</code>), saved with the recipe while it waits to be sent, and sent in a header, <code>Idempotency-Key: 7f3c9a…</code>. The server keeps each key with the answer it gave. When a key comes back, it sends the same answer again and saves nothing.</p>
<p>Retries also need good timing. If a connection server restarts, 10,000 phones reconnect in the same second, and if they all retry every second, they keep the server down. <b>Exponential backoff</b> waits twice as long after each failure: 1 s, 2 s, 4 s, up to a limit. WorkManager does this for <code>Result.retry()</code>, starting at 30 seconds. Add <b>jitter</b>, a random part of each wait, so phones that failed together don’t all come back together. And when a server answers 429 Too Many Requests with a <code>Retry-After: 120</code> header, wait at least those 120 seconds.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['no key', 'server', 'with key', 'server'],
            span: 8,
            unit: 's',
            predict: {
              q: 'The server saved the recipe, but the answer was lost. The phone sends the same <code>POST</code> again, with no key. What is in Ada’s list afterwards?',
              options: ['Two lemon pastas', 'One lemon pasta', 'No lemon pasta'],
              a: 0,
              why: 'Without a key, the second request looks like a new recipe, so the server saves it again.',
            },
            frames: [
              { now: 0, say: 'Two phones save the same new recipe. The top one sends no key; the bottom one sends an idempotency key. Each has a server lane below it.' },
              { bars: [{ lane: 0, from: 0, to: 1, label: 'POST' }, { lane: 1, from: 1, to: 2, label: 'saves 1', tone: 'ok' }, { lane: 2, from: 0, to: 1, label: 'POST' }, { lane: 3, from: 1, to: 2, label: 'saves 1', tone: 'ok' }], say: 'Both requests arrive, and both servers save the recipe as id 1 and answer 201.' },
              { marks: [{ at: 2, label: 'answer lost', tone: 'err' }], now: 2, say: 'The tunnel. Both answers are lost on the way back. The phones see an <code>IOException</code>, not a 201.' },
              { bars: [{ lane: 0, from: 2, to: 3, label: 'wait 1 s', tone: 'muted' }, { lane: 0, from: 3, to: 4, label: 'POST' }, { lane: 1, from: 4, to: 5, label: 'saves 2', tone: 'err' }], say: 'The top phone waits a second and retries. The server sees a new request and saves the recipe again: Ada has two.' },
              { bars: [{ lane: 2, from: 2, to: 2.8, label: 'wait', tone: 'muted' }, { lane: 2, from: 2.8, to: 3.8, label: 'same key' }, { lane: 3, from: 3.8, to: 4.8, label: 'seen: 1', tone: 'ok' }], say: 'The bottom phone retries with the same key. The server finds the key and sends the first answer again, id 1. Nothing new is saved.' },
              { bars: [{ lane: 2, from: 4.8, to: 5.4, label: '1', tone: 'ok' }], marks: [{ at: 5.4, label: 'one recipe', tone: 'ok' }], now: 5.4, say: 'One recipe, and the phone has its id. Notice its wait was 0.8 s, not exactly 1 s: it picked a random time between 0.5 and 1 s. That random part is the jitter.' },
              { bars: [{ lane: 0, from: 6, to: 8, label: 'next wait 2 s', tone: 'warm' }, { lane: 2, from: 6, to: 8, label: 'next 1–2 s', tone: 'warm' }], say: 'Had a retry failed again, the next wait would double: backoff. Without jitter that is exactly 2 s for every phone; with it, each phone picks its own time from 1 to 2 s, so 10,000 phones arrive spread out, not in one burst.' },
            ],
          });
        },
        code: `import kotlin.random.Random

val recipes = mutableListOf<String>()
val answers = mutableMapOf<String, Int>()      // idempotency key -> id of the recipe it made

fun createRecipe(key: String, title: String): Int {
    val earlier = answers[key]
    if (earlier != null) {
        return earlier                         // seen this key: same answer, nothing saved again
    }
    recipes.add(title)
    val id = recipes.size
    answers[key] = id
    return id
}

fun waitBefore(attempt: Int): Long {
    var ceiling: Long = 1000                   // at most 1 s before the first retry
    for (i in 1 until attempt) {
        ceiling = ceiling * 2                  // then 2 s, 4 s, 8 s...
    }
    return Random.nextLong(ceiling / 2, ceiling + 1)   // jitter: a random time in the top half
}

fun main() {
    println(createRecipe("7f3c9a", "Lemon pasta"))   // 1
    println(createRecipe("7f3c9a", "Lemon pasta"))   // 1: the retry after a lost answer
    println(createRecipe("b21e04", "Lentil soup"))   // 2
    println(recipes)                                 // [Lemon pasta, Lentil soup]
    println(waitBefore(3))                           // a different number each run, from 2000 to 4000
}`,
        remember: 'Send an idempotency key with every create, so a retry can’t save twice; retry with growing, random waits.',
        mistakes: [
          { title: 'A new key for every try', bad: `import java.util.UUID

suspend fun save(recipe: NewRecipe) {
    api.create(UUID.randomUUID().toString(), recipe)   // a retry calls save again: a new key
}`, good: `import java.util.UUID

// in RecipeApi: the key goes in a header
@POST("recipes")
suspend fun create(@Header("Idempotency-Key") key: String, @Body recipe: NewRecipe): RecipeDto

// make the key once, when Ada taps Save, and keep it with the recipe
val key = UUID.randomUUID().toString()
api.create(key, recipe)          // every retry sends this same key`, why: 'The server can only spot a retry if the key is the same. A key made inside the retried code is new every time, so it protects nothing.' },
        ],
        terms: [
          { term: 'idempotent', def: 'Doing it twice has the same effect as doing it once. <code>GET</code>, <code>PUT</code> and <code>DELETE</code> are; a <code>POST</code> that creates is not.' },
          { term: 'idempotency key', def: 'A random id the app makes once per action and sends with every try, so the server can answer a retry without doing the work again.' },
          { term: 'exponential backoff', def: 'Waiting twice as long after each failed try (1 s, 2 s, 4 s…), up to a limit.' },
          { term: 'jitter', def: 'A random part added to each wait, so phones that failed together don’t retry together.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Double the wait for each attempt, then pick a random time in its top half.', code: `var ceiling: Long = 1000
for (i in 1 until attempt) {
    ceiling = ceiling [[*]] 2
}
return Random.[[nextLong]](ceiling / 2, ceiling + 1)`, why: 'Multiplying by 2 each time gives 1 s, 2 s, 4 s. <code>Random.nextLong(from, until)</code> picks a whole number from the first value up to, not including, the second.' },
          { type: 'bug', prompt: 'A retry with the same key still saves a second lemon pasta. Tap the wrong line.', code: `fun createRecipe(key: String, title: String): Int {
    val earlier = answers[key]
    if (earlier != null) {
        return earlier
    }
    recipes.add(title)
    val id = recipes.size
    answers[title] = id
    return id
}`, bug: 7, fix: '    answers[key] = id', why: 'The answer must be kept under the key. Kept under the title, a later lookup by key finds nothing, so the retry saves again.' },
        ],
        quiz: [
          { q: 'Which request is safe to retry even without an idempotency key?', options: ['<code>GET v1/recipes/42</code>', '<code>POST v1/recipes</code>', 'Any request, if you wait long enough'], a: 0, why: 'A GET only reads, so doing it twice changes nothing. A POST may create a second recipe.' },
          { q: 'Why add jitter to backoff?', options: ['So phones that failed at the same moment don’t all retry at the same moment', 'To make each retry faster', 'Because the server needs random numbers'], a: 0, why: 'Without it, 10,000 phones retry at 1 s, 2 s, 4 s together, in bursts that can keep the server down.' },
          { q: 'The server answers 429 with <code>Retry-After: 120</code>. What should the app do?', options: ['Wait at least 120 seconds before trying again', 'Try again after 1 second', 'Never try again'], a: 0, why: 'The server says how much it can take. Trying sooner only earns more 429s.' },
        ],
        docs: [['FCM error codes: backoff and Retry-After', 'https://firebase.google.com/docs/cloud-messaging/error-codes'], ['WorkManager: retries and backoff', 'https://developer.android.com/develop/background-work/background-tasks/persistent/getting-started/define-work']],
      },

      {
        id: 'news-feed',
        title: 'Design: news feed',
        tagline: 'The news reader’s server, end to end: requirements, numbers, and every piece of this track.',
        goals: ['Walk through a design in order: requirements, estimate, pieces', 'Decide which answers the CDN can share and which must stay private', 'Choose push, not WebSockets, for breaking news, and say why'],
        level: 'intermediate', introduces: [],
        body: `
<p>Back to the news reader you built in <a href="#capapp.network">the project track</a>: <code>https://news.example.com/</code> answers <code>GET v1/headlines</code>. Now design its server for a publisher that expects 1,000,000 daily readers (example numbers). Start with the requirements. Readers must see headlines within a second, also on a train; save stories as bookmarks; get an alert for breaking news; and use little mobile data. Editors publish about 300 articles a day, while readers open the feed millions of times: the system is <b>read-heavy</b>, so the design is about serving reads cheaply.</p>
<p>Then the estimate. Eight feed opens per reader a day is 8,000,000 a day, about 92 a second, and about 368 a second in the morning rush. The headlines are the same for everyone, so they go out with <code>Cache-Control: public, max-age=60</code> and the CDN answers almost all of them. If it answers 95 of every 100 (its <b>hit ratio</b>), only about 18 a second reach the API server, which has a server cache in front of the database. Bookmarks are personal: <code>private</code>, never shared by the CDN.</p>
<p>Now the pieces, each from a lesson of this track. The list comes in pages with a cursor, <code>v1/headlines?limit=20&amp;cursor=…</code>, so a new article doesn’t shift the pages. Photos are uploaded once and served as variants through the CDN. On the phone, Room shows yesterday’s copy at once, and the refresh only updates it. Saving a bookmark sends an idempotency key, with backoff and jitter on retries.</p>
<p>Breaking news needs no WebSockets: it happens only a few times a day, and 1,000,000 open connections waiting for it would cost servers and batteries for very little. An editor marks a story as breaking, which puts one job in the queue; the push worker fans it out to the 600,000 readers who turned alerts on (an example number), in 1,200 calls of 500, with a time to live of one hour, because old news isn’t news.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 320,
            predict: {
              q: 'Example numbers: 368 headline requests a second in the morning, and the headlines are the same for everyone. Where should most of them end?',
              options: ['At the CDN', 'At the API server', 'At the database'],
              a: 0,
              why: 'One shared answer serves everyone for 60 seconds, so the edge servers near the readers can give it out.',
            },
            nodes: [
              { id: 'app', label: 'news app<small>Room</small>', x: 13, y: 45 },
              { id: 'cdn', label: 'CDN', x: 40, y: 20, tone: 'warm', hidden: true },
              { id: 'api', label: 'API server', x: 66, y: 20, tone: 'muted', hidden: true },
              { id: 'db', label: 'database<small>+ server cache</small>', x: 88, y: 45, tone: 'muted', hidden: true },
              { id: 'photo', label: 'photo storage', x: 40, y: 72, tone: 'muted', hidden: true },
              { id: 'ed', label: 'editors', x: 88, y: 85, tone: 'muted', hidden: true },
              { id: 'push', label: 'queue +<small>push worker</small>', x: 62, y: 85, tone: 'muted', hidden: true },
            ],
            frames: [
              { hl: ['app'], say: 'Requirements first: headlines in a second, also offline; bookmarks; breaking news alerts; little data. Example numbers: 1,000,000 daily readers, 300 new articles a day.' },
              { show: ['api', 'db'], add: [['app', 'api', '368 / s'], ['api', 'db']], hl: ['api'], say: 'The estimate: 8,000,000 feed opens a day, about 92 a second, 368 in the morning rush. Sent straight to the API server, all of them would hit it.' },
              { show: ['cdn'], remove: [['app', 'api']], add: [['app', 'cdn', 'GET v1/headlines', 'ok'], ['cdn', 'api', '18 / s', 'warm']], hl: ['cdn'], say: 'The headlines are public and the same for everyone, so the CDN keeps them for 60 seconds. At a 95% hit ratio, about 18 a second reach the API server.' },
              { add: [['app', 'api', 'bookmarks: private']], hl: ['app', 'api'], say: 'Bookmarks are Ada’s alone: <code>private</code>, so they always go to the API server, with an idempotency key when she saves one.' },
              { show: ['photo'], add: [['cdn', 'photo', 'variants']], hl: ['photo'], say: 'Photos go through the same CDN, as copies in a few widths, and the app asks for the one that fits its screen.' },
              { show: ['ed', 'push'], add: [['ed', 'push', 'breaking'], ['push', 'app', 'FCM, TTL 1 h', 'accent']], hl: ['push'], say: 'An editor marks a story as breaking. One job, then fan-out to the 600,000 readers who turned alerts on (an example number): 1,200 calls of 500, and a time to live of one hour.' },
              { gone: ['cdn', 'api', 'db', 'photo'], hl: ['app'], say: 'On the train, nothing on the server can be reached. Room shows the copy from this morning at once, and the next refresh updates it when the signal comes back.' },
            ],
          });
        },
        code: `fun main() {
    // Example numbers for the news reader
    val readers = 1000000             // daily readers
    val opensEach = 8                 // feed opens per reader per day
    val perDay = readers * opensEach
    val average = perDay / 86400      // seconds in a day
    val peak = average * 4            // the morning rush
    val toServer = peak * 5 / 100     // the CDN answers 95 of every 100
    println("$perDay a day, about $average per second")
    println("Peak: about $peak per second, $toServer reach the API server")
    println("Breaking news: \${600000 / 500} FCM calls")   // 600,000 phones, 500 per call
}
// 8000000 a day, about 92 per second
// Peak: about 368 per second, 18 reach the API server
// Breaking news: 1200 FCM calls`,
        remember: 'Requirements, then numbers, then pieces: a read-heavy feed lives on the CDN, personal data stays private, and breaking news goes by push.',
        terms: [
          { term: 'read-heavy', def: 'A system that is read far more often than it is written, like a news feed. Its design is about cheap reads.' },
          { term: 'hit ratio', def: 'The share of requests a cache answers by itself. At 95%, only 5 of every 100 reach the server behind it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the estimate (example numbers).', code: `val perDay = 1000000 * 8                 // 8,000,000 feed opens
val average = perDay / [[86400]]         // about 92 a second
val peak = average * 4                   // 368
val toServer = peak * [[5]] / 100        // the CDN answers 95 of every 100: 18`, why: 'A day has 86,400 seconds. If the CDN answers 95 of every 100, the other 5 reach the server.' },
          { type: 'bug', prompt: 'Readers start seeing other people’s bookmarks. Tap the line with the wrong header.', code: `GET v1/headlines              Cache-Control: public, max-age=60
GET v1/headlines?cursor=981   Cache-Control: public, max-age=60
GET v1/bookmarks              Cache-Control: public, max-age=60
GET v1/articles/981           Cache-Control: public, max-age=60`, bug: 2, fix: 'GET v1/bookmarks              Cache-Control: private', why: 'With <code>public</code>, the CDN may hand one reader’s bookmarks to the next reader who asks. Personal answers must be <code>private</code>.' },
        ],
        quiz: [
          { q: 'Why does breaking news go by push instead of a WebSocket to every reader?', options: ['It happens only a few times a day; holding 1,000,000 open connections for that wastes servers and batteries', 'WebSockets can’t carry headlines', 'Push is always faster'], a: 0, why: 'Push needs no open connection of your own. A WebSocket fits when changes come often and the screen is open, as in chat.' },
          { q: 'Example numbers: 368 requests a second and a 95% hit ratio. About how many reach the API server?', options: ['About 18 a second', 'About 350 a second', 'None'], a: 0, why: '5% of 368 is about 18. That is why the API server of a read-heavy app can stay small.' },
          { q: 'Why does the breaking-news push get a time to live of one hour?', options: ['A phone that comes back hours later shouldn’t get old news as breaking news', 'FCM refuses anything longer', 'It makes the push arrive faster'], a: 0, why: 'Without it, FCM keeps trying for up to four weeks. After an hour the story is in the normal headlines anyway.' },
        ],
        docs: [['Build an offline-first app', 'https://developer.android.com/topic/architecture/data-layer/offline-first'], ['HTTP caching (MDN)', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching']],
      },

      {
        id: 'chat',
        title: 'Design: chat app',
        tagline: 'Chat in Recipes, end to end: never lost, never twice, in the same order on every phone.',
        goals: ['Turn chat’s requirements into an estimate and a set of pieces', 'Order messages with a server sequence number, not phone clocks', 'Follow one message from pending to sent, delivered and read, also when the other phone is offline'],
        level: 'intermediate', introduces: [],
        body: `
<p>Recipes adds chat, so Ada can ask Sam about his lentil soup. The requirements sound small and hide most of this track. A message must arrive within a second when both are online, never be lost, never appear twice, show in the same order on every phone (Ada’s tablet too), and wait for Sam when his phone is off. The estimate, with example numbers: Recipes has grown ten times, to 2,000,000 daily users. If one in five chats and sends 10 messages a day, that is 4,000,000 messages a day, about 46 a second, about 184 at the peak. At 200 bytes each, the <code>messages</code> table grows by 800 MB a day, so old messages load in pages, with a cursor.</p>
<p>Sending. Ada’s app writes the message to Room first, as pending, with an id it made itself, <code>UUID.randomUUID().toString()</code>, and sends it on her WebSocket to a connection server, which passes it to the API server. The API server stores it with the next <b>sequence number</b> of that chat: a counter the server gives each message of one conversation, 41, 42, 43. Every phone sorts by it, never by its own clock, which may be wrong. The app’s id is an idempotency key: a resend after a tunnel gets the same number back, not a copy. Then the API server tells Ada’s phone, through the same connection server: sent, one tick.</p>
<p>Delivering. The API server publishes the message, and pub/sub brings it to the connection servers holding Sam’s phone and tablet. Sam’s phone stores it in Room and sends a <b>receipt</b> back: “delivered”, two ticks, and later “read”. The connection servers also keep a shared <b>online list</b> of who is connected right now: a user is added when a WebSocket opens and removed when it closes. If Sam isn’t on it, the API server puts a job in the push queue, and the push worker sends a small data message, only the chat’s id. His app wakes and asks for everything after the last number it has, <code>GET v1/chats/7/messages?after=41</code>. A gap works the same way: a phone that has 41 and receives 43 asks for 42.</p>
<p>What this design leaves out: group chats fan out each message to every member, and end-to-end encryption keeps the keys only on the phones, so the server stores text it can’t read.</p>`,
        visual(el) {
          const bubbles = (tick, sam) => `<div class="ui-m-bar">← Sam</div><div class="ui-m-body"><div class="ui-m-row"><div>Sam: Soak them · 41</div></div>${sam ? '<div class="ui-m-row"><div>You: Oven at 200? · 42</div><span class="ui-m-chip">' + tick + '</span></div>' : ''}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'Behind the scenes',
            predict: {
              q: 'Ada’s message was stored as number 42, but the answer was lost in a tunnel. Her phone sends it again with the same id. What does the server do?',
              options: ['Finds the id and answers 42 again: still one message', 'Stores it as 43: two messages', 'Throws both away'],
              a: 0,
              why: 'The id the app made is an idempotency key. The server has seen it, so it repeats the first answer.',
            },
            frames: [
              { screen: bubbles('', false), say: 'Ada’s chat with Sam. The last message is number 41 in this conversation.' },
              { screen: bubbles('sending', true), log: 'Room: saved as pending, id ada-7f3c', say: 'Ada sends “Is the oven at 200?”. It goes into Room first, as pending, so it isn’t lost even if the app closes now.' },
              { screen: bubbles('✓', true), log: ['WebSocket → server A → API server', 'stored as 42 in chat 7 → sent'], say: 'Her WebSocket carries it to a connection server, which passes it to the API server. The API server stores it as number 42 and answers: one tick.' },
              { log: 'tunnel: answer lost, resend id ada-7f3c → already 42, no copy', say: 'Suppose the answer had been lost. The resend has the same id, so the server repeats “42” and stores nothing new.' },
              { log: ['online list: Sam not connected', 'push queue → push worker → data message, chat 7'], say: 'The online list shows no open connection for Sam: his phone is in his pocket. So the API server puts a job in the push queue, and the push worker sends a small data message with only the chat’s id.' },
              { screen: bubbles('✓✓', true), log: ['Sam’s phone: GET v1/chats/7/messages?after=41', 'receipt: delivered 42'], say: 'Sam’s app wakes, asks for everything after 41, stores 42 in Room and sends a receipt. Ada sees two ticks.' },
              { screen: bubbles('✓✓ read', true), log: 'receipt: read 42', say: 'Sam opens the chat: one more receipt, and Ada sees it was read. Every phone shows 41 above 42, whatever its clock says.' },
            ],
          });
        },
        code: `data class Message(val clientId: String, val seq: Int, val text: String)

val chat = mutableListOf<Message>()           // one conversation, in the order the server stored it

fun receive(clientId: String, text: String): Int {
    val earlier = chat.firstOrNull { it.clientId == clientId }
    if (earlier != null) {
        return earlier.seq                    // a resend: same number, no copy
    }
    val seq = chat.size + 1                   // the server numbers messages 1, 2, 3...
    chat.add(Message(clientId, seq, text))
    return seq
}

fun main() {
    println(receive("ada-1", "Is the oven at 200?"))   // 1
    println(receive("sam-1", "Yes, 200"))              // 2
    println(receive("ada-1", "Is the oven at 200?"))   // 1: Ada's phone sent it again
    println(chat.filter { it.seq > 1 }.map { it.text }) // [Yes, 200]  what a phone that has 1 still needs
}`,
        remember: 'Room first, an id from the app, a number from the server, receipts back, and push plus “everything after” for phones that were away.',
        terms: [
          { term: 'sequence number', def: 'A counter the server gives each message of one conversation. Every phone sorts by it, and a missing number shows a gap.' },
          { term: 'receipt', def: 'A small message from the receiving phone back to the sender: “delivered” or “read”. It turns into the ticks.' },
          { term: 'online list', def: 'A list, shared by the connection servers, of who has an open WebSocket right now. Also called <em>presence</em>. Someone not on it gets a push instead.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give a resend its first number, and a new message the next one.', code: `val earlier = chat.[[firstOrNull]] { it.clientId == clientId }
if (earlier != null) {
    return earlier.[[seq]]
}
val seq = chat.size + [[1]]`, why: 'The app’s id finds a message the server already has. A new one gets the next number in the conversation.' },
          { type: 'bug', prompt: 'Sam’s phone clock is 3 minutes slow, so his answers show above Ada’s questions. Tap the wrong line in the app’s Room DAO.', code: `@Dao
interface MessageDao {
    @Query("SELECT * FROM messages WHERE chatId = :id ORDER BY sentAt")
    fun observe(id: Int): Flow<List<MessageEntity>>
}`, bug: 2, fix: '    @Query("SELECT * FROM messages WHERE chatId = :id ORDER BY seq")', why: 'Phone clocks can be wrong. The server’s sequence number gives every phone the same order.' },
        ],
        quiz: [
          { q: 'What decides the order of messages on every phone?', options: ['The server’s sequence number', 'Each phone’s clock', 'The order the push messages arrive'], a: 0, why: 'One counter on the server, one order for everyone. Clocks and networks can’t promise that.' },
          { q: 'Sam’s phone has messages up to 41, then receives 43. What should it do?', options: ['Ask the server for 42, then show them in order', 'Show 43 and forget 42', 'Renumber 43 as 42'], a: 0, why: 'Sequence numbers make a gap visible, so the phone can fetch what it missed.' },
          { q: 'Ada sends a message while Sam’s phone is off. What does she see?', options: ['One tick now, two when Sam’s phone stores it and sends a receipt', 'Two ticks at once', 'A clock until Sam reads it'], a: 0, why: 'One tick means the server has it. Two need Sam’s phone, which gets it after the push wakes it.' },
        ],
        docs: [['Build an offline-first app', 'https://developer.android.com/topic/architecture/data-layer/offline-first'], ['The WebSocket API (MDN)', 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API']],
      },
    ],
  });
})();
