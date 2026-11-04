/**
 * Validated Persistence & JSON Backup Utility (Zod Schema + Migration)
 * Ensures localStorage corruption never crashes the app and new students start with 0 fake progress.
 */

import { z } from 'zod';
import type { FSRSCard, ModuleProgress } from './fsrs';
import type { EngineeringNote } from '../components/StudentDashboard';

export const STORAGE_KEY = 'aegisneuro_cyber_learning_v2';

const FSRSReviewLogSchema = z.object({
  date: z.string(),
  rating: z.enum(['again', 'hard', 'good', 'easy']),
  intervalDays: z.number(),
  retrievabilityAtReview: z.number(),
});

export const FSRSCardSchema = z.object({
  id: z.string().min(1),
  moduleId: z.string().min(1),
  domain: z.string().min(1),
  concept: z.string().min(1),
  question: z.string().min(1),
  expectedAnswer: z.string().min(1),
  keyTerms: z.array(z.string()),
  stability: z.number().min(0),
  difficulty: z.number().min(1).max(10),
  reps: z.number().int().min(0),
  lapses: z.number().int().min(0),
  lastReview: z.string().nullable().default(null),
  nextReview: z.string(),
  lastRating: z.enum(['again', 'hard', 'good', 'easy']).optional(),
  history: z.array(FSRSReviewLogSchema).default([]),
});

export const ModuleProgressSchema = z.object({
  moduleId: z.string().min(1),
  activeRecallScore: z.number().min(0).max(100).default(0),
  selfExplanationScore: z.number().min(0).max(100).default(0),
  selfExplanationText: z.string().default(''),
  deliberatePracticeCompleted: z.boolean().default(false),
  evaluationScore: z.number().min(0).max(100).default(0),
  delayedTransferPassed: z.boolean().optional(),
  labsCompleted: z.number().int().min(0).default(0),
  totalLabs: z.number().int().min(1).default(1),
  practiceMinutes: z.number().min(0).default(0),
  hintsUsed: z.number().int().min(0).optional(),
  hintsUsedCount: z.number().int().min(0).optional(),
  attemptsCount: z.number().int().min(0).optional(),
  lastStudied: z.string().nullable().default(null),
});

export const EngineeringNoteSchema = z.object({
  id: z.string().min(1),
  date: z.string(),
  targetId: z.string().min(1),
  targetTitle: z.string().min(1),
  whatLearned: z.string(),
  whatNotUnderstood: z.string().default(''),
  errorsCommitted: z.string().default(''),
  howSolved: z.string().default(''),
  commandsAndScripts: z.string().default(''),
});

export const PersistedAppStateSchema = z.object({
  schemaVersion: z.number().int().default(2),
  progressMap: z.record(z.string(), ModuleProgressSchema).default({}),
  cards: z.array(FSRSCardSchema).default([]),
  notes: z.array(EngineeringNoteSchema).default([]),
  placementCompleted: z.boolean().optional().default(false),
  placementScore: z.number().int().min(0).max(100).optional(),
});

export type PersistedAppState = {
  schemaVersion?: number;
  progressMap: Record<string, ModuleProgress>;
  cards: FSRSCard[];
  notes: EngineeringNote[];
  placementCompleted?: boolean;
  placementScore?: number;
};

export function createEmptyAppState(): PersistedAppState {
  return {
    schemaVersion: 2,
    progressMap: {},
    cards: [],
    notes: [],
    placementCompleted: false,
  };
}

export function loadPersistedState(): PersistedAppState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createEmptyAppState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createEmptyAppState();
    }
    const parsedJson = JSON.parse(raw);
    const validated = PersistedAppStateSchema.safeParse(parsedJson);
    if (!validated.success) {
      return createEmptyAppState();
    }
    return validated.data;
  } catch {
    return createEmptyAppState();
  }
}

export function savePersistedState(state: PersistedAppState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const payload = {
      schemaVersion: 2,
      ...state,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota errors gracefully
  }
}

export function clearPersistedState(): PersistedAppState {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem('aegisneuro_cyber_learning_v1');
      window.localStorage.removeItem('aegisneuro_progress_v4');
      window.localStorage.removeItem('aegisneuro_fsrs_cards_v4');
      window.localStorage.removeItem('aegisneuro_notes_v4');
    } catch {
      // Ignore storage errors
    }
  }
  return createEmptyAppState();
}

export function exportStateToJson(state: PersistedAppState): string {
  return JSON.stringify(
    {
      schemaVersion: 2,
      progressMap: state.progressMap,
      cards: state.cards,
      notes: state.notes,
      placementCompleted: state.placementCompleted ?? false,
      placementScore: state.placementScore,
    },
    null,
    2
  );
}

export function validateAndImportStateJson(rawJson: string): {
  ok: boolean;
  data?: PersistedAppState;
  error?: string;
} {
  try {
    const parsed = JSON.parse(rawJson);
    const result = PersistedAppStateSchema.safeParse(parsed);
    if (!result.success) {
      const issue = result.error.issues[0];
      return {
        ok: false,
        error: `El archivo JSON no cumple el esquema de AegisNeuro (${issue?.path.join('.') || 'raíz'}: ${issue?.message || 'formato inválido'}).`,
      };
    }
    return { ok: true, data: result.data };
  } catch {
    return {
      ok: false,
      error: 'El archivo seleccionado no es un documento JSON válido.',
    };
  }
}
