import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRetrievability,
  scheduleFSRSReview,
  calculateModuleMastery,
  buildInterleavedQueue,
  evaluateSelfExplanationLocal,
  MASTERY_LABELS,
  type FSRSCard,
} from './fsrs';

const sampleCard: FSRSCard = {
  id: 'card-1',
  moduleId: 'mod-02',
  domain: 'Linux',
  concept: 'Bit SUID en binarios POSIX',
  question: '¿Qué efecto tiene el permiso octal 4000 (SUID) sobre un ejecutable binario en Linux?',
  expectedAnswer:
    'Ejecuta el proceso con el Effective UID (EUID) del propietario del archivo en lugar del usuario que lo invoca.',
  keyTerms: ['euid', 'propietario', 'root', 'permiso'],
  stability: 0,
  difficulty: 5.5,
  reps: 0,
  lapses: 0,
  lastReview: null,
  nextReview: new Date('2026-11-03T10:00:00Z').toISOString(),
  history: [],
};

test('DSR 4-grade scheduler differentiates again, hard, good, and easy without false initial lapses', () => {
  const now = new Date('2026-11-03T12:00:00Z');
  const againCard = scheduleFSRSReview(sampleCard, 'again', now);
  const hardCard = scheduleFSRSReview(sampleCard, 'hard', now);
  const goodCard = scheduleFSRSReview(sampleCard, 'good', now);
  const easyCard = scheduleFSRSReview(sampleCard, 'easy', now);

  assert.equal(againCard.reps, 1);
  assert.equal(againCard.lapses, 0, 'First-time review (reps === 0) must not count as a lapse');
  assert.equal(hardCard.lapses, 0, 'First-time hard review must not count as a lapse');

  assert.ok(
    againCard.stability < hardCard.stability &&
      hardCard.stability < goodCard.stability &&
      goodCard.stability < easyCard.stability,
    'Stability must strictly increase across again < hard < good < easy'
  );
  assert.ok(
    againCard.difficulty > hardCard.difficulty && hardCard.difficulty > easyCard.difficulty,
    'Difficulty must decrease as rating improves'
  );

  // Subsequent review rated 'again' MUST increment lapses
  const later = new Date('2026-11-06T12:00:00Z');
  const lapsedCard = scheduleFSRSReview(goodCard, 'again', later);
  assert.equal(lapsedCard.lapses, 1, 'Forgetting an already-reviewed card must increment lapses');
});

test('DSR retrievability decays predictably over time', () => {
  const now = new Date('2026-11-03T12:00:00Z');
  const reviewed = scheduleFSRSReview(sampleCard, 'good', now);
  const rImmediate = calculateRetrievability(reviewed, now);
  const afterFiveDays = new Date(now.getTime() + 5 * 24 * 3600 * 1000);
  const rLater = calculateRetrievability(reviewed, afterFiveDays);

  assert.equal(rImmediate, 1);
  assert.ok(
    rLater < 1 && rLater > 0.65,
    `Expected decayed retrievability between 0.65 and 1, got ${rLater}`
  );
});

test('Mastery scale (0-3) uses Nivel 3 · Transferencia and requires active application', () => {
  assert.equal(MASTERY_LABELS[3].badge, 'Nivel 3 · Transferencia');

  const passiveOnly = calculateModuleMastery({
    moduleId: 'mod-02',
    activeRecallScore: 0,
    selfExplanationScore: 0,
    selfExplanationText: '',
    deliberatePracticeCompleted: false,
    evaluationScore: 0,
    labsCompleted: 0,
    totalLabs: 1,
    practiceMinutes: 999,
    lastStudied: null,
  });
  assert.equal(passiveOnly, 0);

  const transferMastery = calculateModuleMastery({
    moduleId: 'mod-02',
    activeRecallScore: 90,
    selfExplanationScore: 85,
    selfExplanationText: 'Explicación causal completa.',
    deliberatePracticeCompleted: true,
    evaluationScore: 90,
    labsCompleted: 1,
    totalLabs: 1,
    practiceMinutes: 45,
    lastStudied: '2026-11-03T12:00:00Z',
  });
  assert.equal(transferMastery, 3);
});

test('Interleaving queue filters strictly for due cards when onlyDue is true and alternates domains', () => {
  const now = new Date('2026-11-03T12:00:00Z');
  const futureIso = new Date('2026-11-10T12:00:00Z').toISOString();
  const pastIso = new Date('2026-11-02T12:00:00Z').toISOString();

  const cards: FSRSCard[] = [
    { ...sampleCard, id: 'c1', domain: 'Linux', nextReview: pastIso },
    { ...sampleCard, id: 'c2', domain: 'Linux', nextReview: pastIso },
    { ...sampleCard, id: 'c3', domain: 'Redes', nextReview: pastIso },
    { ...sampleCard, id: 'c4', domain: 'Web', nextReview: futureIso },
  ];

  const dueQueue = buildInterleavedQueue(cards, 6, now, { onlyDue: true });
  assert.equal(dueQueue.length, 3, 'Future card c4 must be excluded when onlyDue is true');
  assert.notEqual(dueQueue[0].domain, dueQueue[1].domain, 'Adjacent cards should alternate domains');
});

test('Self-explanation evaluator rewards genuine causal explanation and rejects keyword stuffing', () => {
  const stuffed = evaluateSelfExplanationLocal(
    'euid propietario root permiso porque',
    ['euid', 'propietario', 'root', 'permiso']
  );
  assert.ok(
    stuffed.score < 60,
    `Keyword-stuffed fragment must fail (< 60), got ${stuffed.score}`
  );

  const genuine = evaluateSelfExplanationLocal(
    'Cuando un binario tiene activo el permiso SUID, el kernel de Linux asigna al proceso el EUID del propietario del archivo (como root) porque necesita ejecutar esa operación con privilegios elevados temporalmente; por lo tanto, si el binario permite invocar un shell interactivo, un atacante obtiene control total y debemos auditarlo con find.',
    ['euid', 'propietario', 'root', 'permiso']
  );
  assert.ok(genuine.score >= 75, `Genuine explanation must score >= 75, got ${genuine.score}`);
  assert.equal(genuine.hasCausalReasoning, true);
});
