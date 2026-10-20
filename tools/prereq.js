// Run: node tools/prereq.js [trackId ...]
// Checks that every lesson uses only what earlier lessons taught.
// Each lesson lists the code words and symbols it teaches in `introduces` (e.g. ['val'] or ['if', 'else']).
// The roadmap order (STAGES in js/app.js, then lesson order in each track) decides what "earlier" means.
// A lesson may use: words introduced by earlier lessons of required tracks, earlier lessons of its own track,
// and its own `introduces`. Optional tracks can be skipped, so nothing outside them may depend on them.
// A lesson can list plain-English words to skip in `ignore` (for pseudo-code like "Put the tea bag in a cup").
// It reads code samples, Run it programs, practice code, mistakes, Go deeper code and every <code> span.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const STAGES = eval(app.match(/const STAGES = (\[[\s\S]*?\n  \]);/)[1]);
const optional = new Set(STAGES.flatMap(s => s.optional || []));

const byId = {};
global.Lab = new Proxy({ addTrack: t => (byId[t.id] = t) }, { get: (o, k) => (k in o ? o[k] : () => {}) });
for (const f of fs.readdirSync(path.join(root, 'tracks'))) require(path.join(root, 'tracks', f));

const SYMBOLS = ['?.', '?:', '!!', '==', '!=', '&&', '||', '+=', '-=', '++', '--', '..', '->', '::', '%', '$', '//', '/*'];
function tokens(src) {
  const out = new Set();
  // strings: keep only template markers, drop the text inside
  src = src.replace(/"(?:[^"\\\n]|\\.)*"/g, m => { if (/\$/.test(m)) out.add('$'); return '""'; });
  src = src.replace(/\.\.\.|…/g, ' ');
  if (/\/\/|\/\*/.test(src)) out.add('//');
  src = src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const s of SYMBOLS) if (s !== '$' && s !== '//' && s !== '/*' && src.includes(s)) out.add(s);
  for (const m of src.matchAll(/[A-Za-z_][A-Za-z0-9_]*/g)) out.add(m[0]);
  return out;
}
const html = s => String(s || '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
function used(l) {
  const parts = [l.code, l.play];
  (l.challenges || []).forEach(c => parts.push(c.code.replace(/\[\[|\]\]|\|/g, ' '), c.fix));
  (l.mistakes || []).forEach(m => parts.push(m.bad, m.good));
  (l.deeper || []).forEach(d => parts.push(d.code));
  const htmlFields = [l.body, l.remember, ...(l.quiz || []).flatMap(q => [q.q, ...q.options, q.why]), ...(l.deeper || []).map(d => d.body), ...(l.challenges || []).flatMap(c => [c.prompt, c.why])];
  for (const hf of htmlFields) for (const m of String(hf || '').matchAll(/<code>([\s\S]*?)<\/code>/g)) parts.push(html(m[1]));
  const all = new Set();
  for (const p of parts) if (p) for (const t of tokens(String(p))) all.add(t);
  // Names the lesson declares itself (val width, fun item(...), (label: String)) are its own, not the API word.
  for (const p of parts) if (p) for (const m of String(p).matchAll(/\b(?:val|var|fun|class|object|interface)\s+(?:[A-Z]\w*\.)?([A-Za-z_]\w*)|[(,]\s*(?:val\s+|var\s+)?([a-z_]\w*)\s*:\s*[A-Z(]/g)) all.delete(m[1] || m[2]);
  return all;
}

const order = STAGES.flatMap(s => s.tracks).filter(id => byId[id]);
// Tracks can teach a different language (track.lang, e.g. 'shell' for Git). Words a shell track introduces are only
// checked in that kind of track, so a Kotlin function named show() doesn't clash with `git show`.
const lang = id => byId[id].lang || 'kotlin';
const ledger = new Map(); // token -> [{ track, index }]
for (const id of order) byId[id].lessons.forEach((l, i) => (l.introduces || []).forEach(t => { if (!ledger.has(t)) ledger.set(t, []); ledger.get(t).push({ track: id, i, l }); }));
// Words that only optional tracks introduce are checked inside that track only: they are often plain English words
// (value, time, out) elsewhere, and reviewers catch real misuse.
const taughtIn = (tok, id) => (ledger.get(tok) || []).filter(x => (lang(x.track) === 'kotlin' || lang(x.track) === lang(id)) && (!optional.has(x.track) || x.track === id));

const want = process.argv.slice(2);
const known = new Set();      // from required tracks, in order
const problems = [];
let tagged = 0, total = 0;
for (const id of order) {
  const t = byId[id], own = new Set();
  t.lessons.forEach((l, i) => {
    total++;
    if (l.introduces) tagged++;
    const mine = new Set(l.introduces || []);
    if (!want.length || want.includes(id)) {
      const skip = new Set(l.ignore || []); // words that are plain English in this lesson, e.g. pseudo-code steps
      for (const tok of used(l)) {
        if (skip.has(tok) || !taughtIn(tok, id).length || mine.has(tok) || known.has(tok) || own.has(tok)) continue;
        const where = taughtIn(tok, id).map(x => `${x.track}.${x.l.id}`).join(', ');
        problems.push(`${id}.${l.id}: uses ${tok} before it is taught (taught in ${where})`);
      }
    }
    mine.forEach(x => own.add(x));
  });
  if (!optional.has(id)) own.forEach(x => known.add(x));
}
console.log(`${tagged} of ${total} lessons list what they introduce.`);
console.log(problems.length ? problems.join('\n') : 'OK: nothing used before it is taught.');
process.exitCode = problems.length ? 1 : 0;
