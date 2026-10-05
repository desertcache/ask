// The conversation layer (js/converse.js) on the shipped model and bank: what each feature does,
// what it must leave alone, and that everything it shows is approved text.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createEmbedder } from '../js/embed.js';
import { createMatcher, bestMatch } from '../js/match.js';
import { createConversation, linesOf, osa, sentences } from '../js/converse.js';
import { MODEL, THRESHOLD, CHAT_MIN, MATCH_OPTIONS, STARTERS } from '../js/config.js';
import { parseBank } from '../scripts/bank.mjs';

const root = new URL('../', import.meta.url);
const buf = readFileSync(new URL(`models/${MODEL}.bin`, root));
const embedder = createEmbedder(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length),
  readFileSync(new URL('models/vocab.txt', root), 'utf8'));
const { entries, fallbacks } = parseBank(readFileSync(new URL('qa.md', root), 'utf8'));
const byId = new Map(entries.map((e) => [e.id, e]));
const matcher = createMatcher(entries, embedder, MATCH_OPTIONS);
const starters = STARTERS.map((id) => byId.get(id));
const fresh = () => createConversation({ entries, matcher, embedder, threshold: THRESHOLD, chatMin: CHAT_MIN, bestMatch, fallbacks, starters, random: () => 0 });
const ids = (t) => t.parts.map((p) => p.entry.id);

test('osa counts a swap as one edit and gives up past its limit', () => {
  assert.equal(osa('baesd', 'based', 1), 1);
  assert.equal(osa('wher', 'where', 1), 1);
  assert.equal(osa('same', 'same', 1), 0);
  assert.equal(osa('kitten', 'sitting', 2), 3);
});

test('sentences split after a full stop, but not inside "B.S.", and keep tiny fragments', () => {
  assert.deepEqual(sentences('Phoenix, Arizona. That\'s UTC−7 all year.'), ['Phoenix, Arizona.', 'That\'s UTC−7 all year.']);
  assert.deepEqual(sentences('A B.S. in biology. Yes.'), ['A B.S. in biology. Yes.']);
});

test('typo repair fixes misspellings and leaves real words alone', () => {
  const t = fresh().turn('wher is he baesd');
  assert.deepEqual(ids(t), ['location']);
  assert.deepEqual(t.fixes, [{ from: 'wher', to: 'where' }, { from: 'baesd', to: 'based' }]);
  assert.equal(t.steps[0].title, 'Fixed 2 typos');
  for (const q of ['is sam actually a coder', 'escalation handling experience', 'whats his tech stack', 'Does he use MCP servers?', 'Is he self-taught?']) {
    assert.deepEqual(fresh().turn(q).fixes, [], q);
  }
});

test('"Sam" is read as "he" only when that matches better', () => {
  const t = fresh().turn('what degree does sam have?');
  assert.deepEqual(ids(t), ['education']);
  assert.ok(t.steps.some((s) => s.title === 'Read “Sam” as “he”'));
  const who = fresh().turn('Who is Sam?');
  assert.deepEqual(ids(who), ['who-is-sam']);
  assert.ok(!who.steps.some((s) => s.title === 'Read “Sam” as “he”'));
});

test('two questions in one message get both answers, in order', () => {
  const t = fresh().turn('Can he code, and where is he based?');
  assert.equal(t.kind, 'two');
  assert.deepEqual(ids(t), ['can-he-code', 'location']);
  assert.deepEqual(t.parts.map((p) => p.aside), ['Two questions there. First:', 'And second:']);
  assert.equal(t.steps[0].title, 'Split it into two questions');
});

test('one question that only looks like two is not split', () => {
  for (const q of ['Does he work with React and TypeScript?', 'Is he more of an engineer or a manager?',
    'Is there a suggested order to go through everything, or can I just jump around?', 'Besides the copilot, what else has he built?']) {
    assert.notEqual(fresh().turn(q).kind, 'two', q);
  }
});

test('a follow-up gets the one line of the last answer that answers it', () => {
  const c = fresh();
  assert.deepEqual(ids(c.turn('Tell me about the AI copilot')), ['copilot']);
  const t = c.turn('How long did it take to build?');
  assert.equal(t.kind, 'followup');
  assert.deepEqual(t.parts[0].lines, ['It went from first prototype to internal pilot in 4 weeks.']);
  assert.equal(t.parts[0].aside, null);
  assert.deepEqual(t.steps.slice(-2).map((s) => s.title), ['Read it as a follow-up', 'Picked the line that fits best']);
});

test('"it" means the answer just shown, unless the question names a linked answer', () => {
  const box = fresh();
  box.turn('how does this ask box actually work');
  const t = box.turn('how accurate is it though?');
  assert.deepEqual(ids(t), ['this-box']);
  assert.deepEqual(t.parts[0].lines, ['On questions it never saw while being tuned, it puts the right answer first about four times in five.']);
  const c = fresh();
  c.turn('Tell me about the AI copilot');
  const rag = c.turn('does it use RAG?');
  assert.deepEqual(ids(rag), ['rag']);
  assert.equal(rag.parts[0].aside, "Here's more on that.");
});

test('another side of the same answer gets its line, and the trace quotes the visitor', () => {
  const c = fresh();
  c.turn('wher is he baesd');
  const t = c.turn('what time zone?');
  assert.deepEqual(t.parts[0].lines, ["That's UTC−7 all year, since Arizona skips daylight saving."]);
  assert.equal(t.steps.find((s) => s.title === 'Read it as a follow-up')?.detail, 'to “wher is he baesd”');
});

test('a score just under the bar never shows as the bar', () => {
  const t = fresh().turn('what happened when the POS partner shut down its API?');
  const last = t.steps.at(-1);
  assert.equal(last.title, 'Not confident enough to answer');
  assert.match(last.detail ?? '', /^0\.44 is under the 0\.45 bar/);
});

test('"its" that belongs to something named in the same question is not a follow-up', () => {
  const c = fresh();
  c.turn('what degree does sam have?');
  const t = c.turn('what happened when the POS partner shut down its API?');
  assert.notEqual(t.kind, 'followup');
  assert.ok(!t.steps.some((s) => s.title === 'Read it as a follow-up'));
  assert.ok(t.suggest.some((e) => e.id === 'api-migration'));
});

test('a pronoun that belongs to a word earlier in the question is not a follow-up', () => {
  const c = fresh();
  c.turn('Has he won any awards?');
  const t = c.turn('does phoenix move its clocks twice a year');
  assert.deepEqual(ids(t), ['location']);
  assert.notEqual(t.kind, 'followup');
});

test('a full new question that starts with "and" is answered on its own; a bare "and the X?" is a follow-up', () => {
  const c = fresh();
  c.turn('Is he open to new roles right now?');
  assert.deepEqual(ids(c.turn('and what are his pay expectations?')), ['salary']);
  const s = fresh();
  s.turn('tech stack?');
  const t = s.turn('and the AI side?');
  assert.equal(t.kind, 'followup');
  assert.ok(t.parts[0].lines?.[0].startsWith('AI: retrieval (RAG) design'), t.parts[0].lines?.[0]);
});

test('an answer outside the thread, found by its own sentence, is shown whole and not as a follow-up', () => {
  const c = fresh();
  c.turn('did he actually work as an EMT?');
  const t = c.turn('where did he get certified for that?');
  assert.equal(t.kind, 'answer');
  assert.deepEqual(ids(t), ['education']);
  assert.equal(t.parts[0].lines, null);
  assert.equal(t.parts[0].aside, null);
  assert.equal(t.steps.at(-1).title, 'Checked the closest answers’ own sentences');
});

test('a new topic mid-thread is answered on its own', () => {
  const c = fresh();
  c.turn('Tell me about the AI copilot');
  const t = c.turn('Where is he based?');
  assert.equal(t.kind, 'answer');
  assert.deepEqual(ids(t), ['location']);
});

test('"tell me more" walks the answers Sam linked, skipping what was shown', () => {
  const c = fresh();
  c.turn('Tell me about the AI copilot');
  const copilot = byId.get('copilot');
  const first = c.turn('tell me more');
  assert.equal(first.kind, 'more');
  assert.deepEqual(ids(first), [copilot.next[0]]);
  const second = c.turn('tell me more');
  const seen = ['copilot', copilot.next[0]];
  assert.ok(!seen.includes(ids(second)[0]), `repeated ${ids(second)[0]}`);
});

test('an off-topic question is declined with a fallback line and the starters', () => {
  const t = fresh().turn('What is the capital of Australia?');
  assert.equal(t.kind, 'none');
  assert.equal(t.message, fallbacks[0]);
  assert.deepEqual(t.suggest, starters);
  assert.equal(t.steps.at(-1).title, 'Not confident enough to answer');
});

test('asking the same thing twice says so', () => {
  const c = fresh();
  c.turn('Where is he based?');
  const t = c.turn('Where is he based?');
  assert.deepEqual(ids(t), ['location']);
  assert.equal(t.parts[0].aside, 'Like I said a moment ago:');
});

test('everything shown is approved text: whole answers, or lines copied from them', () => {
  const c = fresh();
  const script = ['Tell me about the AI copilot', 'who uses it?', 'does it use RAG?', 'why?', 'tell me more',
    'What does he do at DoorDash and is he open to remote?', 'and the team?', 'wht is his tech stak', 'thanks!'];
  for (const q of script) {
    const t = c.turn(q);
    assert.ok(t.steps.length >= 1 && t.steps.every((s) => s.title), q);
    for (const p of t.parts) {
      assert.ok(byId.get(p.entry.id) === p.entry, q);
      for (const line of p.lines ?? []) assert.ok(linesOf(p.entry).includes(line), `${q}: "${line}" is not a line of ${p.entry.id}`);
    }
  }
});

test('the same messages give the same turns', () => {
  const run = () => {
    const c = fresh();
    return ['Tell me about the AI copilot', 'how long did that take', 'Can he code, and where is he based?', 'tell me more']
      .map((q) => { const t = c.turn(q); return [t.kind, ids(t), t.parts.map((p) => p.lines), t.suggest.map((e) => e.id)]; });
  };
  assert.deepEqual(run(), run());
});
