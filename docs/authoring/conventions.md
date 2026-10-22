# Site-wide conventions (for writing and fixing lessons)

## Versions used everywhere (Oct 2026)
compileSdk 37, targetSdk 36, minSdk 26 (Recipes, News), AGP 9.4.0 (Gradle 9.6.0), Kotlin 2.4.21, KSP 2.3.10,
Compose BOM 2026.09.00, lifecycle 2.11.0, Navigation Compose 2.10.2 (Navigation 3 1.2.0 in compose2), Hilt 2.60.1,
androidx.hilt 1.4.0, Room 3 3.0.3 (androidx.room3), DataStore 1.2.1, Retrofit 3.0.0, kotlinx-serialization-json 1.11.0,
kotlinx-coroutines 1.11.0, WorkManager 2.12.0, Firebase BoM 35.0.2 (firebase-messaging 26.0.0: FCM registration by
installation ID — register()/onRegistered/manifest flag; getToken/onNewToken deprecated since 25.1.0),
google-services 4.5.0, Ktor 3.6.0, Exposed 1.6.0, Password4j 1.8.4 (Argon2id), Media3 1.11.1, CameraX 1.6.2,
ML Kit GenAI Summarization 1.0.0-beta1, Compose Multiplatform 1.12.2. GitHub Actions: checkout@v7, setup-java@v6,
setup-gradle@v6. Re-check before reusing: versions move.

## Stories and names
- First steps / Kotlin: small programs; Git: Ada Lin's weather repo.
- capkotlin: a budget tracker. android: Hello app, then a Notes app. compose: a water tracker (also compose2, a11y).
- data → arch → testing → perf → push → background → security → build → launch → aiapps: the Recipes app
  (Recipe, RecipeDao, RecipesDb/RecipesDatabase, SettingsStore, RecipeApi, Session with encrypted tokens via
  TokenCipher, RecipesViewModel/RecipesUiState, RecipeRepository → OfflineRecipeRepository, GetQuickRecipesUseCase,
  modules :app :feature:recipes :feature:tonight :core:data). Server: https://recipes.example.com/v1/ (sysdesign,
  backend, cloud). Users: Ada, Lin, Sam; in cloud the developers are Mei and Kofi.
- capapp → capquality → capship → capai → portfolio: the News app (com.example.news, invented stories only).
- Neutral and international: no real people, brands (except the tools taught), country-specific places or seasons.
  The only exception: the dotted/dotless i bug (Turkish locale) in android.localization.

## House rules
- Kotlin compiler messages start with a capital letter ("Unresolved reference 'x'.").
- Outputs are copied from real runs; anything invented is labelled as an example.
- No "simply", "just", "obviously"; no job-interview framing ("Test yourself", not "interview").
- Track CSS classes use the track's own prefix, never `ui-`.
- Stage rules: earlier stages only; optional tracks (Stage 2 incl. cs, kdeep, views, runtime, compose2, media, kmp,
  backend, cloud) are never assumed outside themselves.
