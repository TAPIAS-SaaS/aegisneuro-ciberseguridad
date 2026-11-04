/**
 * Strict, Pure Validation Engine for Task & Lab Verification
 * - Eliminates length-based bypasses (e.g., rawAns.length >= 12) and generic words ("comprendido", "listo")
 * - Supports three explicit validation modes: 'exact', 'regex', and 'flag'
 * - Prevents substring false positives (e.g., '4755' is rejected when '0755' or 'u-s' is required)
 */

export type ValidationMode = 'exact' | 'regex' | 'flag';

export interface TaskQuestionValidation {
  mode: ValidationMode;
  acceptedAnswers?: string[];
  pattern?: string;
  regexPattern?: string;
  flags?: string;
  expectedFlag?: string;
  requireVmCapture?: boolean;
  requiresCapturedFlag?: boolean;
}

export type TaskValidationSpec = TaskQuestionValidation;

export interface ValidationOutcome {
  ok: boolean;
  valid: boolean;
  isValid: boolean;
  reason: string;
}

const FORBIDDEN_TRIVIAL_ANSWERS = new Set([
  'comprendido',
  'listo',
  'ok',
  'si',
  'sí',
  'yes',
  'true',
  'hecho',
  'done',
]);

export function normalizeAnswerToken(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function makeOutcome(ok: boolean, reason: string): ValidationOutcome {
  return {
    ok,
    valid: ok,
    isValid: ok,
    reason,
  };
}

export function validateTaskAnswer(
  rawInput: string,
  spec: TaskQuestionValidation,
  capturedFlagInVM: string | string[] | null = null
): ValidationOutcome {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return makeOutcome(
      false,
      'La respuesta está vacía. Ejecuta el análisis técnico e introduce el valor exacto.'
    );
  }

  const normalized = normalizeAnswerToken(trimmed);

  // Never allow trivial filler words or repeated characters (e.g. "aaaaaaaaaaaa")
  if (FORBIDDEN_TRIVIAL_ANSWERS.has(normalized) || /^(.)\1{5,}$/.test(normalized)) {
    return makeOutcome(
      false,
      'No se aceptan respuestas genéricas ni caracteres repetidos. Debes introducir el hallazgo técnico real.'
    );
  }

  if (spec.mode === 'flag') {
    const expectedFlag = (spec.expectedFlag || spec.acceptedAnswers?.[0] || '')
      .trim()
      .toUpperCase();
    if (!expectedFlag) {
      return makeOutcome(false, 'No hay bandera configurada para esta tarea.');
    }

    const mustCaptureInVm =
      spec.requireVmCapture !== false && spec.requiresCapturedFlag !== false;

    if (mustCaptureInVm) {
      const capturedList = Array.isArray(capturedFlagInVM)
        ? capturedFlagInVM.map((f) => f.trim().toUpperCase())
        : capturedFlagInVM
          ? [capturedFlagInVM.trim().toUpperCase()]
          : [];

      if (!capturedList.includes(expectedFlag)) {
        return makeOutcome(
          false,
          'Primero debes capturar la bandera ejecutando los comandos correspondientes dentro de la Máquina Virtual.'
        );
      }
    }

    if (trimmed.toUpperCase() === expectedFlag) {
      return makeOutcome(
        true,
        'Bandera verificada correctamente contra la sesión activa de la Máquina Virtual.'
      );
    }

    return makeOutcome(
      false,
      'La bandera introducida no coincide con el formato exacto FLAG{...} obtenido en la Máquina Virtual.'
    );
  }

  const regexStr = spec.pattern || spec.regexPattern;
  if (spec.mode === 'regex' && regexStr) {
    try {
      const re = new RegExp(regexStr, spec.flags || 'i');
      if (re.test(trimmed)) {
        return makeOutcome(
          true,
          'Expresión técnica y parámetros verificados correctamente.'
        );
      }
      return makeOutcome(
        false,
        'La sintaxis o el valor técnico no cumple con la especificación exacta requerida.'
      );
    } catch {
      // Fallback to exact match if regex is invalid
    }
  }

  // Default: 'exact' normalized equality against acceptedAnswers (NO substring .includes()!)
  const candidates = spec.acceptedAnswers ?? [];
  const matchesExact = candidates.some(
    (candidate) => normalizeAnswerToken(candidate) === normalized
  );

  if (matchesExact) {
    return makeOutcome(true, 'Respuesta técnica verificada con exactitud.');
  }

  return makeOutcome(
    false,
    'El valor introducido no coincide exactamente con el resultado esperado.'
  );
}

export const validateTaskResponse = validateTaskAnswer;
