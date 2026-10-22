# Beginner-reader review of a rebuilt track

You are reviewing one track of a learning website for people who started with ZERO programming knowledge. Play that
reader: you know only what the earlier lessons taught (given in your assignment), and you read this track's lessons
strictly in order. Curriculum for context:
  docs/curriculum.md

Dump each lesson with: node tools/peek.js <track> <lessonId>
(If a demo shows as "custom interactive demo", read its source in tracks/<file>.js.)

Report, per lesson, ONLY real problems, each with the exact text and a concrete fix:
1. Unexplained: any word, symbol, command, API or concept used before it is taught (body, demo code/commands/output/
   captions, code sample, Run it program, quiz, challenges, mistakes, goals).
2. Confusing: likely misreadings, jumps too big, ambiguous quiz options, a challenge not solvable with what was taught,
   a bug challenge whose one-line fix doesn't really fix it, repeated challenges, story inconsistencies across lessons.
3. Wrong: any fact, output, error text or quiz answer that is incorrect. Verify doubtful ones by running real tools here
   (git, sqlite3, kotlinc 2.x, shell commands) or official docs.
4. Overwhelm: too much at once, or tone that is condescending or dry.
5. Kotlin compiler messages must start with a capital letter (house style), e.g. "Unresolved reference 'x'.".
6. Real people or brands used as example names, or anything country-specific (should be neutral and international).
Plus one line on what works well per lesson. Compact lists. Do not edit any files.
Write the full report to a file, then give one line saying where it is and how many real problems you found.
