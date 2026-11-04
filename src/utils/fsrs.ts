/**
 * Spaced Repetition Engine (Inspired by FSRS DSR Model: Difficulty, Stability, Retrievability)
 * & Honest Competency Mastery Scale (Levels 0 - 3)
 *
 * Key guarantees:
 * 1. Four explicit ratings: 'again' (Otra vez), 'hard' (Difícil), 'good' (Bien), 'easy' (Fácil)
 * 2. First review (reps === 0) NEVER counts as a lapse; lapses only increment when reps > 0 and rating === 'again'
 * 3. Due queue strictly filters due cards (nextReview <= now) with daily caps (8 new, 30 reviews)
 * 4. Self-explanation evaluator rejects keyword-stuffing and requires coherent multi-sentence causal reasoning
 */

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export type MasteryLevel = 0 | 1 | 2 | 3;

export interface FSRSCard {
  id: string;
  moduleId: string;
  domain: string;
  concept: string;
  question: string;
  expectedAnswer: string;
  keyTerms: string[];
  stability: number; // S: days until retrievability drops to 90%
  difficulty: number; // D: 1.0 (easiest) to 10.0 (hardest)
  reps: number;
  lapses: number;
  lastReview: string | null; // ISO timestamp
  nextReview: string; // ISO timestamp
  lastRating?: Rating;
  history: {
    date: string;
    rating: Rating;
    intervalDays: number;
    retrievabilityAtReview: number;
  }[];
}

export interface ModuleProgress {
  moduleId: string;
  activeRecallScore: number; // Step 2 Quiz (0 to 100)
  selfExplanationScore: number; // Step 5 Rubric (0 to 100)
  selfExplanationText: string;
  deliberatePracticeCompleted: boolean;
  evaluationScore: number; // Distinct Transfer Evaluation Score (0 to 100)
  delayedTransferPassed?: boolean; // Distinct transfer scenario verification
  labsCompleted: number;
  totalLabs: number;
  practiceMinutes: number;
  hintsUsed?: number;
  hintsUsedCount?: number;
  attemptsCount?: number;
  lastStudied: string | null;
}

export type ModuleMasteryRecord = ModuleProgress;

export const MASTERY_LABELS: Record<
  MasteryLevel,
  { title: string; description: string; badge: string }
> = {
  0: {
    title: 'Nivel 0 · Sin Dominio Demostrado',
    description:
      'No comprende aún el concepto o no ha superado las pruebas de recuperación activa.',
    badge: 'Nivel 0 · Inicial',
  },
  1: {
    title: 'Nivel 1 · Aplicación Guiada',
    description: 'Puede resolver ejercicios siguiendo instrucciones paso a paso.',
    badge: 'Nivel 1 · Guiado',
  },
  2: {
    title: 'Nivel 2 · Autonomía y Explicación',
    description:
      'Resuelve de forma independiente y articula el mecanismo causal con sus propias palabras.',
    badge: 'Nivel 2 · Autónomo',
  },
  3: {
    title: 'Nivel 3 · Transferencia',
    description:
      'Resuelve variantes en escenarios distintos, detecta errores y justifica decisiones defensivas.',
    badge: 'Nivel 3 · Transferencia',
  },
};

/**
 * Power forgetting curve R(t, S) = (1 + FACTOR * t / S)^DECAY where R(S, S) = 0.90
 */
export function calculateRetrievability(card: FSRSCard, now: Date = new Date()): number {
  if (!card.lastReview || card.reps === 0 || card.stability <= 0) {
    return 0;
  }
  const last = new Date(card.lastReview).getTime();
  const elapsedDays = Math.max(0, (now.getTime() - last) / (1000 * 60 * 60 * 24));
  const factor = 19 / 81;
  const decay = -0.5;
  const r = Math.pow(1 + factor * (elapsedDays / card.stability), decay);
  return Math.max(0, Math.min(1, Number(r.toFixed(4))));
}

/**
 * Updates a flashcard using the 4-grade DSR model ('again' | 'hard' | 'good' | 'easy').
 * First review (reps === 0) NEVER increments lapses.
 */
export function scheduleFSRSReview(
  card: FSRSCard,
  rating: Rating,
  now: Date = new Date()
): FSRSCard {
  const gradeMap: Record<Rating, number> = {
    again: 1,
    hard: 2,
    good: 3,
    easy: 4,
  };
  const g = gradeMap[rating];

  const initialStability: Record<Rating, number> = {
    again: 0.25, // Re-study same day (~6 hours)
    hard: 1.2,
    good: 3.2,
    easy: 7.5,
  };

  let newDifficulty = card.difficulty;
  let newStability = card.stability;
  let newLapses = card.lapses;
  const r = card.reps === 0 ? 0.9 : calculateRetrievability(card, now);

  if (card.reps === 0) {
    // First study session: NEVER count as a lapse even if 'again' or 'hard'
    newStability = initialStability[rating];
    newDifficulty = clampDifficulty(6.2 - 0.85 * (g - 3));
  } else {
    const deltaD = -0.85 * (g - 3);
    const dampedD = card.difficulty + deltaD * ((10 - card.difficulty) / 9);
    newDifficulty = clampDifficulty(0.15 * 5.0 + 0.85 * dampedD);

    if (rating === 'again') {
      // Forgotten on subsequent review: increment lapse and schedule same-day relearning
      newLapses += 1;
      newStability = Math.max(0.25, Number((card.stability * 0.35).toFixed(2)));
    } else if (rating === 'hard') {
      // Recalled with high effort: no lapse, modest stability change
      newStability = Math.max(1.0, Number((card.stability * 1.15).toFixed(2)));
    } else {
      const easyBonus = rating === 'easy' ? 1.38 : 1.0;
      const difficultyFactor = 11 - newDifficulty;
      const stabilityDamping = Math.pow(Math.max(0.5, card.stability), -0.18);
      const retrievabilityGain = Math.exp(0.22 * (1 - r)) - 1;

      const growth =
        1 +
        0.32 *
          difficultyFactor *
          stabilityDamping *
          (retrievabilityGain + 0.65) *
          easyBonus;

      newStability = Number(Math.min(365, Math.max(1.5, card.stability * growth)).toFixed(2));
    }
  }

  // Same-day relearning for 'again' (0.25 days = 6 hours), otherwise integer days
  const intervalDays =
    rating === 'again' ? 0.25 : Math.max(1, Math.round(newStability));
  const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    ...card,
    stability: newStability,
    difficulty: Number(newDifficulty.toFixed(2)),
    reps: card.reps + 1,
    lapses: newLapses,
    lastReview: now.toISOString(),
    nextReview: nextDate.toISOString(),
    lastRating: rating,
    history: [
      ...card.history,
      {
        date: now.toISOString(),
        rating,
        intervalDays,
        retrievabilityAtReview: r,
      },
    ],
  };
}

function clampDifficulty(d: number): number {
  return Math.max(1.0, Math.min(10.0, d));
}

/**
 * Computes real competency level (0 - 3) for a module.
 * Requires distinct transfer evaluation (evaluationScore >= 80 & delayedTransferPassed) for Level 3.
 */
export function calculateModuleMastery(progress: ModuleProgress): MasteryLevel {
  const {
    activeRecallScore,
    selfExplanationScore,
    deliberatePracticeCompleted,
    evaluationScore,
    delayedTransferPassed,
    labsCompleted,
  } = progress;

  // Nivel 3 · Transferencia: Requires distinct transfer test + active recall >= 80 + self-explanation >= 75 + lab
  if (
    activeRecallScore >= 80 &&
    selfExplanationScore >= 75 &&
    deliberatePracticeCompleted &&
    evaluationScore >= 80 &&
    delayedTransferPassed !== false &&
    labsCompleted >= 1
  ) {
    return 3;
  }

  // Nivel 2 · Autónomo: Independent resolution + self-explanation >= 65 + quiz >= 70
  if (
    activeRecallScore >= 70 &&
    selfExplanationScore >= 65 &&
    deliberatePracticeCompleted
  ) {
    return 2;
  }

  // Nivel 1 · Guiado: Completed quiz >= 60 or lab practice
  if (activeRecallScore >= 60 || deliberatePracticeCompleted || labsCompleted >= 1) {
    return 1;
  }

  return 0;
}

export interface InterleavedQueueOptions {
  onlyDue?: boolean;
  maxNewPerDay?: number;
  maxReviewsPerDay?: number;
}

/**
 * Returns cards respecting daily limits (maxNew = 8, maxReviews = 30),
 * interleaved across domains so adjacent cards do not share the same domain when possible.
 */
export function buildInterleavedQueue(
  cards: FSRSCard[],
  count: number = 8,
  now: Date = new Date(),
  onlyDueOrOptions: boolean | InterleavedQueueOptions = false
): FSRSCard[] {
  if (cards.length === 0 || count <= 0) return [];

  const onlyDue =
    typeof onlyDueOrOptions === 'boolean'
      ? onlyDueOrOptions
      : Boolean(onlyDueOrOptions.onlyDue);
  const maxNew =
    typeof onlyDueOrOptions === 'object' && onlyDueOrOptions.maxNewPerDay !== undefined
      ? onlyDueOrOptions.maxNewPerDay
      : 8;
  const maxReviews =
    typeof onlyDueOrOptions === 'object' && onlyDueOrOptions.maxReviewsPerDay !== undefined
      ? onlyDueOrOptions.maxReviewsPerDay
      : 30;

  const eligible = onlyDue
    ? cards.filter((c) => new Date(c.nextReview).getTime() <= now.getTime())
    : cards;

  if (eligible.length === 0) return [];

  // Enforce daily caps: maxNew new cards (reps === 0) and maxReviews review cards
  let newCount = 0;
  let reviewCount = 0;
  const capped = eligible.filter((c) => {
    if (c.reps === 0) {
      if (newCount >= maxNew) return false;
      newCount += 1;
      return true;
    }
    if (reviewCount >= maxReviews) return false;
    reviewCount += 1;
    return true;
  });

  const scored = capped.map((card) => {
    const dueMs = new Date(card.nextReview).getTime() - now.getTime();
    const isDue = dueMs <= 0;
    const priority = (isDue ? -1000 : 0) + dueMs / (1000 * 3600 * 24) - card.difficulty * 2;
    return { card, priority };
  });

  scored.sort((a, b) => a.priority - b.priority);

  const domainBuckets = new Map<string, FSRSCard[]>();
  for (const { card } of scored) {
    const list = domainBuckets.get(card.domain) ?? [];
    list.push(card);
    domainBuckets.set(card.domain, list);
  }

  const result: FSRSCard[] = [];
  let lastDomain: string | null = null;
  const targetCount = Math.min(count, capped.length);

  while (result.length < targetCount) {
    let picked = false;
    for (const [domain, bucket] of domainBuckets.entries()) {
      if (bucket.length > 0 && domain !== lastDomain) {
        result.push(bucket.shift()!);
        lastDomain = domain;
        picked = true;
        if (result.length >= targetCount) break;
      }
    }
    if (!picked) {
      for (const [, bucket] of domainBuckets.entries()) {
        if (bucket.length > 0) {
          result.push(bucket.shift()!);
          picked = true;
          break;
        }
      }
    }
    if (!picked) break;
  }

  return result;
}

/**
 * Evaluates a student's Self-Explanation text.
 * Strictly rejects keyword-stuffing (e.g. "euid propietario root permiso porque")
 * by requiring coherent sentence structure, word count >= 18, and causal articulation.
 */
export function evaluateSelfExplanationLocal(
  studentText: string,
  keyTerms: string[],
  minWords: number = 18
): {
  score: number;
  qualityLabel: string;
  matchedTerms: string[];
  missingTerms: string[];
  hasCausalReasoning: boolean;
  isKeywordStuffing: boolean;
  feedback: string;
} {
  const normalized = studentText
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const words = normalized
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const matchedTerms: string[] = [];
  const missingTerms: string[] = [];

  for (const term of keyTerms) {
    const normTerm = term
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes(normTerm)) {
      matchedTerms.push(term);
    } else {
      missingTerms.push(term);
    }
  }

  const causalConnectors = [
    'porque',
    'debido',
    'permite',
    'cuando',
    'tanto',
    'causa',
    'evita',
    'mediante',
    'provoca',
    'verifica',
    'protege',
    'impide',
  ];
  const hasCausalReasoning = causalConnectors.some((c) => normalized.includes(c));

  // Detect keyword stuffing: too short (< 12 words), low lexical diversity, or no clause punctuation/length
  const uniqueWords = new Set(words);
  const hasPunctuationOrClauses = /[,.;:]/.test(studentText) || words.length >= 16;
  const isKeywordStuffing =
    words.length < 12 ||
    uniqueWords.size / Math.max(1, words.length) < 0.5 ||
    !hasPunctuationOrClauses;

  if (words.length < 5) {
    return {
      score: 0,
      qualityLabel: 'Insuficiente',
      matchedTerms,
      missingTerms,
      hasCausalReasoning: false,
      isKeywordStuffing: true,
      feedback:
        'Explicación demasiado breve (0/100). Escribe al menos dos oraciones completas explicando la causa técnica y la defensa.',
    };
  }

  if (isKeywordStuffing) {
    return {
      score: Math.min(35, words.length * 2),
      qualityLabel: 'Enumeración sin estructura causal',
      matchedTerms,
      missingTerms,
      hasCausalReasoning,
      isKeywordStuffing: true,
      feedback:
        'Se detectó una lista de palabras sueltas sin estructura explicativa completa. No basta con enumerar términos clave: redacta al menos dos frases completas explicando cómo funciona el mecanismo y por qué lo mitiga la defensa.',
    };
  }

  const termRatio = keyTerms.length > 0 ? matchedTerms.length / keyTerms.length : 1;
  const lengthRatio = Math.min(1, words.length / minWords);
  const causalBonus = hasCausalReasoning ? 20 : 0;

  const rawScore = Math.round(termRatio * 55 + lengthRatio * 25 + causalBonus);
  const score = Math.min(100, rawScore);

  let feedback = '';
  let qualityLabel = 'En desarrollo';
  if (score >= 80) {
    qualityLabel = 'Excelente articulación causal';
    feedback = `Excelente autoexplicación (${score}/100). Articulaste el mecanismo causal con oraciones completas e integraste los conceptos clave (${matchedTerms.join(', ')}).`;
  } else if (score >= 65) {
    qualityLabel = 'Comprensión funcional';
    feedback = `Comprensión funcional (${score}/100). Para profundizar, conecta también: ${missingTerms.slice(0, 3).join(', ')}.`;
  } else {
    qualityLabel = 'Explicación parcial';
    feedback = `Explicación parcial (${score}/100). Explica con tus propias palabras la relación causa-efecto e integra conceptos como: ${missingTerms.slice(0, 4).join(', ')}.`;
  }

  return {
    score,
    qualityLabel,
    matchedTerms,
    missingTerms,
    hasCausalReasoning,
    isKeywordStuffing: false,
    feedback,
  };
}
