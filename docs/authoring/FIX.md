# Fix a track from its beginner-reader review

Rules: docs/authoring/BRIEF.md (beginner audience, only
earlier lessons, exact real output, neutral international examples).

1. Read the review file named in your assignment. Apply EVERY fix it lists. If a suggested fix is itself wrong, apply a
   correct one instead and say so in your reply. Verify changed facts/outputs with real tools or official docs.
2. Edit only the track file(s) under review (tracks/<file>.js).
3. Keep the track description fitting the lessons and suitable for a beginner.
4. Make sure every lesson has a `goals` field (2-3 lines starting with a verb).
5. Checks: node tools/catalog.js ; node tools/prereq.js (OK) ; python3 tools/check_track.py . <track> (OK: no problems).
Final reply: short list of changes, plus anything you could not apply.
