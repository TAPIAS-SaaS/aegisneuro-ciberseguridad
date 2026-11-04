import type { CurriculumModule } from '../data/curriculumData';
import { MODULE_DEEP_EXPANSION } from '../data/deepContentExpansion';
import type { ModuleProgress, FSRSCard } from './fsrs';

export type LearningStyle = 'visual_analogies' | 'step_by_step_commands' | 'deep_technical';

export interface LearnerProfile {
  style: LearningStyle;
  preferredPace: 'guiado' | 'autonomo';
}

export const LEARNING_STYLE_META: Record<
  LearningStyle,
  {
    label: string;
    shortLabel: string;
    badge: string;
    description: string;
  }
> = {
  visual_analogies: {
    label: 'Principiante (Desde cero con analogías)',
    shortLabel: 'Principiante · Analogías',
    badge: 'MODO PRINCIPIANTE',
    description:
      'Explica cada concepto desde cero usando comparaciones de la vida real antes de pasar a los comandos.',
  },
  step_by_step_commands: {
    label: 'Práctico (Enfocado en consola y comandos)',
    shortLabel: 'Práctico · Comandos',
    badge: 'MODO PRÁCTICO VM',
    description:
      'Va directo a la práctica en terminal, desglosando qué hace cada bandera y cómo interpretar la salida.',
  },
  deep_technical: {
    label: 'Técnico Avanzado (Internals, SOC y Red Team)',
    shortLabel: 'Técnico · SOC/Pentest',
    badge: 'MODO INGENIERÍA',
    description:
      'Profundiza en registros del kernel, RFCs, AST, reglas Sigma/SIEM y mitigaciones de arquitectura.',
  },
};

export interface AIMentorRequest {
  question: string;
  learningStyle: LearningStyle;
  activeModule: CurriculumModule;
  activeStepNum?: number;
  activeLessonTitle?: string;
  lastTerminalCommand?: string;
  lastTerminalOutput?: string;
  mode?:
    | 'socratic'
    | 'simplify_for_beginner'
    | 'evaluate_self_explanation'
    | 'explain_terminal_command'
    | 'personalized_study_plan';
  hintLevel?: number;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface AIMentorResponse {
  reply: string;
  source: 'ai' | 'local-adaptive';
  suggestedFollowUps: string[];
}

/**
 * Generates a deeply contextual, personalized pedagogical response locally
 * when running on static hosting (GitHub Pages) or when no server API key is set.
 */
export function generateAdaptiveLocalResponse(req: AIMentorRequest): AIMentorResponse {
  const {
    question,
    learningStyle,
    activeModule,
    activeStepNum = 1,
    activeLessonTitle,
    lastTerminalCommand,
    lastTerminalOutput,
    mode = 'socratic',
    hintLevel = 1,
  } = req;

  const deepExp = MODULE_DEEP_EXPANSION[activeModule.id] ?? MODULE_DEEP_EXPANSION['mod-00'];
  const styleMeta = LEARNING_STYLE_META[learningStyle];
  const keyTerms = activeModule.selfExplanationPrompt.keyTerms.slice(0, 4).join(', ');
  const firstCheatCmd = deepExp?.commandCheatSheet?.[0];
  const anatomy = deepExp?.attackDefenseAnatomy ?? [];

  // 1. Terminal Command / Output Analysis Mode
  if (mode === 'explain_terminal_command' || lastTerminalCommand) {
    const cmd = lastTerminalCommand || 'ls -la';
    const out = lastTerminalOutput || '';
    const hasError =
      out.includes('command not found') ||
      out.includes('No such file') ||
      out.includes('Permission denied') ||
      out.includes('Error');

    const matchingCheat = deepExp?.commandCheatSheet?.find((c) =>
      cmd.trim().startsWith(c.command.split(' ')[0])
    );

    const styleExplanation =
      learningStyle === 'visual_analogies'
        ? '**Explicación para Principiante (Analogía):** Piensa en la terminal como hablar directamente con el recepcionista del servidor. La primera palabra es la **acción** que pides y las opciones con guion (`-la`, `-perm`) son los **filtros exactos** de lo que quieres ver.'
        : learningStyle === 'step_by_step_commands'
          ? `**Desglose Práctico de Sintaxis:** El comando ejecutado fue \`${cmd}\`. ${
              matchingCheat
                ? matchingCheat.flagsBreakdown
                : 'Observa la primera columna (permisos), el propietario y la ruta devuelta por el sistema.'
            }`
          : `**Análisis Técnico de Consola:** Al invocar \`${cmd}\`, el proceso hijo consulta el estado del nodo virtual y devuelve un código de salida según los permisos del inodo o la tabla de red.`;

    const diagnosticBlock = hasError
      ? [
          '### ⚠️ Diagnóstico del Error en Consola',
          `- La consola devolvió un aviso o error al ejecutar \`${cmd}\`.`,
          '- **Por qué ocurrió:** Verifica si escribiste correctamente el nombre del binario, si estás en el directorio adecuado (`pwd` y `ls -la`) o si necesitas revisar los objetivos numerados encima de la terminal.',
        ].join('\n')
      : [
          '### ✅ Análisis de la Salida de tu Comando',
          `- Has ejecutado \`${cmd}\` correctamente en la máquina virtual.`,
          `- **Qué debes observar en la salida:** Fíjate en los datos clave relacionados con **${keyTerms}**. Si aparece un archivo sospechoso, puerto o permiso especial, ese es tu siguiente objetivo.`,
        ].join('\n');

    return {
      reply: [
        `### Copiloto IA de Terminal · Sala ${activeModule.number} (${styleMeta.badge})`,
        '',
        styleExplanation,
        '',
        diagnosticBlock,
        '',
        firstCheatCmd
          ? `**Sugerencia de comando relacionado:** \`${firstCheatCmd.command}\` — *${firstCheatCmd.whenToUse}*`
          : '',
        '',
        '**Pregunta guía para tu siguiente comando:** Según lo que acaba de imprimir la pantalla, ¿qué archivo, permiso o servicio deberías inspeccionar ahora?',
      ]
        .filter(Boolean)
        .join('\n'),
      source: 'local-adaptive',
      suggestedFollowUps: [
        '¿Qué comando debo ejecutar después de este?',
        'Explícame qué significan los permisos o banderas de este comando',
        '¿Cómo consigo la bandera de la Task 3 sin hacer trampa?',
      ],
    };
  }

  // 2. Simplify for Beginner / Analogy Mode
  if (mode === 'simplify_for_beginner') {
    const lessonContext = activeLessonTitle || activeModule.title;
    const phase1 = anatomy[0]?.technicalDetail || activeModule.summary;
    const phase4 = anatomy[3]?.technicalDetail || 'Aplicar controles de mínimo privilegio y validación estricta.';

    const analogyByDomain =
      activeModule.id === 'mod-00'
        ? 'Imagina que el servidor Linux es un edificio de oficinas: las carpetas (`/home`, `/etc`, `/var/log`) son las habitaciones, `pwd` te dice en qué piso estás parado, `ls -la` enciende la luz para ver qué carpetas y llaves hay en la mesa, y `cat` abre un documento para leerlo.'
        : activeModule.id === 'mod-01' || activeModule.id === 'mod-02'
          ? 'Imagina un hotel donde cada huésped tiene una tarjeta que solo abre su habitación (`UID 1001`). Un binario con permiso **SUID root** es como un ascensor de servicio que tiene pegada con cinta adhesiva la llave maestra del gerente (`EUID 0`): cualquiera que entre al ascensor puede subir al piso presidencial.'
          : activeModule.id === 'mod-07'
            ? 'Imagina un guardia al que le entregas un formulario con tu nombre. Si el guardia pega tu texto directamente dentro de su libro de órdenes (concatenación SQL), puedes escribir `"Juan\' OR 1=1 --"` para cambiar la orden misma y hacer que te abra todas las puertas.'
            : 'Imagina una fortaleza con varias puertas: una vulnerabilidad aparece cuando el guardia confía en quién dice ser el visitante sin pedirle su credencial criptográfica o sin separar los datos del visitante de las órdenes internas.';

    return {
      reply: [
        `### Explicación Personalizada (${styleMeta.badge}) · ${lessonContext}`,
        '',
        '**1. Analogía intuitiva para entenderlo a la primera:**',
        analogyByDomain,
        '',
        '**2. Qué pasa por debajo a nivel técnico:**',
        `- **El problema:** ${phase1}`,
        `- **La solución defensiva:** ${phase4}`,
        '',
        `**3. Conceptos clave que debes retener:** \`${keyTerms}\`.`,
        '',
        '**Comprobemos si quedó claro (1 sola pregunta):** Con esta analogía en mente, ¿qué parte del sistema está confiando de más y cómo le pondrías un control de seguridad?',
      ].join('\n'),
      source: 'local-adaptive',
      suggestedFollowUps: [
        'Ponme un ejemplo práctico en la terminal Linux',
        '¿Qué preguntan sobre esto en el cuestionario de la Task 2?',
        'Explícame la diferencia entre el código vulnerable y el seguro',
      ],
    };
  }

  // 3. Personalized Study Plan Mode
  if (mode === 'personalized_study_plan') {
    return {
      reply: [
        `### Plan de Estudio Personalizado con IA · ${styleMeta.badge}`,
        '',
        `Estás trabajando en **Sala ${activeModule.number}: ${activeModule.title}** (Task activa: **Task ${activeStepNum} de 5**).`,
        '',
        '**Tu ruta recomendada para los próximos 20 minutos:**',
        '1. **Paso 1 (Lectura enfocada):** En la Task 1, avanza lección por lección (1 a 6) usando el selector paso a paso para no saturarte.',
        `2. **Paso 2 (Conceptos críticos):** Asegúrate de dominar **${keyTerms}** antes de pasar al cuestionario de 5 preguntas.`,
        `3. **Paso 3 (Práctica en AttackBox):** Abre la máquina virtual en pantalla dividida y practica con \`${
          firstCheatCmd?.command || 'ls -la'
        }\` observando qué devuelve cada parámetro.`,
        '',
        '**Pregunta rápida de enfoque:** ¿Prefieres que empecemos resumiendo la lección actual con una analogía o vamos directo a probar el primer comando en la terminal?',
      ].join('\n'),
      source: 'local-adaptive',
      suggestedFollowUps: [
        'Resúmeme la lección actual con una analogía sencilla',
        '¿Cómo resuelvo la pregunta de comprobación de esta Task?',
        'Explícame el primer comando del Cheat Sheet',
      ],
    };
  }

  // 4. Default Socratic / Adaptive Mode tailored to LearningStyle & HintLevel
  const styleIntro =
    learningStyle === 'visual_analogies'
      ? `Como elegiste el **Modo Principiante con Analogías**, vamos a aterrizar tu duda (*"${question.slice(0, 90)}"*) de forma muy visual:`
      : learningStyle === 'step_by_step_commands'
        ? `Como elegiste el **Modo Práctico de Comandos**, vamos a conectar tu duda (*"${question.slice(0, 90)}"*) directamente con la consola:`
        : `Desde la perspectiva de **Ingeniería y Arquitectura (${styleMeta.badge})**, analicemos tu consulta (*"${question.slice(0, 90)}"*):`;

  const hintProgression =
    hintLevel === 1
      ? `**Pista Nivel 1 (Intuición):** Observa cómo se relacionan **${keyTerms}** en esta sala. ${
          anatomy[0] ? anatomy[0].technicalDetail : ''
        }`
      : hintLevel === 2
        ? `**Pista Nivel 2 (Mecanismo Técnico):** Revisa la fase de explotación y detección: ${
            anatomy[1] ? anatomy[1].technicalDetail : activeModule.summary
          }`
        : `**Pista Nivel 3 (Acción Práctica sin espóiler de bandera):** El comando de referencia en esta sala es \`${
            firstCheatCmd?.command || 'ls -la'
          }\` (${
            firstCheatCmd?.flagsBreakdown || 'inspecciona el estado actual en la terminal'
          }).`;

  return {
    reply: [
      `### Mentor IA Personalizado · Sala ${activeModule.number} (Pista Nv.${hintLevel}/3 · ${styleMeta.badge})`,
      '',
      styleIntro,
      '',
      hintProgression,
      '',
      '**Tu turno (1 pregunta socrática):** Si aplicas este principio en el ejercicio actual, ¿qué resultado esperas ver en el sistema y por qué?',
    ].join('\n'),
    source: 'local-adaptive',
    suggestedFollowUps: [
      'Dame una pista de Nivel 2 más específica',
      'Explícamelo como si tuviera 12 años con una analogía',
      '¿Qué comando de la Cheat Sheet me sirve aquí?',
    ],
  };
}

/**
 * Generates an automatic diagnostic summary of the student's overall progress for the Dashboard.
 */
export function buildStudentDiagnosticSummary(
  modules: CurriculumModule[],
  progressMap: Record<string, ModuleProgress>,
  cards: FSRSCard[],
  learningStyle: LearningStyle
): {
  headline: string;
  advice: string;
  recommendedModule: CurriculumModule;
  weakConcepts: string[];
  dueCardsCount: number;
} {
  const now = new Date();
  const dueCards = cards.filter((c) => c.reps > 0 && new Date(c.nextReview) <= now);
  const lapsedCards = cards.filter((c) => c.lapses > 0);

  // Find current recommended module (first module not yet at mastery >= 2)
  const recommendedModule =
    modules.find((m) => {
      const p = progressMap[m.id];
      if (!p) return true;
      const isMastered =
        p.activeRecallScore >= 60 &&
        p.deliberatePracticeCompleted &&
        p.selfExplanationScore >= 60;
      return !isMastered;
    }) ?? modules[0];

  const weakConcepts = [
    ...new Set([
      ...lapsedCards.map((c) => c.concept),
      ...recommendedModule.selfExplanationPrompt.keyTerms.slice(0, 3),
    ]),
  ].slice(0, 4);

  const styleAdvice =
    learningStyle === 'visual_analogies'
      ? 'Tu IA está configurada en Modo Principiante: cada lección te mostrará analogías cotidianas y explicaciones paso a paso sin tecnicismos bruscos.'
      : learningStyle === 'step_by_step_commands'
        ? 'Tu IA está configurada en Modo Práctico: priorizaremos el uso de la terminal AttackBox y el desglose de comandos reales.'
        : 'Tu IA está configurada en Modo Técnico Avanzado: profundizaremos en arquitectura, detección SIEM y mitigación de código.';

  const headline =
    recommendedModule.id === 'mod-00'
      ? 'Empieza desde Cero Absoluto en la Sala 00 (Terminal Linux, Archivos y Redes)'
      : `Tu siguiente objetivo recomendado es la Sala ${recommendedModule.number}: ${recommendedModule.title}`;

  const advice =
    dueCards.length > 0
      ? `Tienes ${dueCards.length} tarjeta(s) vencida(s) en tu memoria espaciada DSR. Te recomendamos hacer un repaso de 2 minutos y luego continuar en la Sala ${recommendedModule.number}. ${styleAdvice}`
      : `No tienes repasos atrasados hoy. Es el momento ideal para avanzar en la Sala ${recommendedModule.number} lección por lección. ${styleAdvice}`;

  return {
    headline,
    advice,
    recommendedModule,
    weakConcepts,
    dueCardsCount: dueCards.length,
  };
}

/**
 * Calls the backend Gemini API (`/api/tutor/socratic`) and falls back gracefully
 * to `generateAdaptiveLocalResponse` when running on static GitHub Pages or without an API key.
 */
export async function askAIMentor(req: AIMentorRequest): Promise<AIMentorResponse> {
  const localFallback = generateAdaptiveLocalResponse(req);

  try {
    const response = await fetch('/api/tutor/socratic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: req.question,
        studentLevel:
          req.learningStyle === 'visual_analogies'
            ? 'Principiante'
            : req.learningStyle === 'step_by_step_commands'
              ? 'Intermedio'
              : 'Avanzado',
        learningStyle: req.learningStyle,
        activeModuleTitle: `${req.activeModule.number} · ${req.activeModule.title}`,
        activeLessonTitle: req.activeLessonTitle || '',
        terminalContext: req.lastTerminalCommand
          ? `Comando: ${req.lastTerminalCommand}\nSalida: ${(req.lastTerminalOutput || '').slice(0, 500)}`
          : '',
        weakConcepts: req.activeModule.selfExplanationPrompt.keyTerms,
        mode:
          req.mode === 'explain_terminal_command' || req.mode === 'personalized_study_plan'
            ? 'socratic'
            : req.mode || 'socratic',
        hintLevel: req.hintLevel ?? 1,
        history: (req.history ?? []).slice(-8),
      }),
    });

    if (!response.ok) {
      return localFallback;
    }

    const data = await response.json();
    if (data && data.source === 'ai' && typeof data.reply === 'string' && data.reply.trim()) {
      return {
        reply: data.reply.trim(),
        source: 'ai',
        suggestedFollowUps: localFallback.suggestedFollowUps,
      };
    }

    return localFallback;
  } catch {
    return localFallback;
  }
}
