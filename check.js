// Run: node check.js  — checks the spaced-review schedule.
const assert = require('assert');
const { schedule } = require('./js/app.js');
const DAY = 864e5;
let c = schedule(undefined, true, 0);
assert.deepStrictEqual(c, { box: 1, due: DAY });
c = schedule(c, true, 0); assert.strictEqual(c.due, 3 * DAY);
assert.strictEqual(schedule({ box: 5 }, true, 0).box, 5);      // capped at the last box
assert.deepStrictEqual(schedule({ box: 4 }, false, 0), { box: 1, due: DAY }); // a miss starts over
console.log('ok');
