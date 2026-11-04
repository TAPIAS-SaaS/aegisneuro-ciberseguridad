/**
 * Verifiable Scientific Evidence Matrix and Pedagogical Architecture Documentation
 * Strictly adheres to peer-reviewed literature without inventing DOIs or citations.
 * New students start with 0 pre-seeded flashcards (`INITIAL_FSRS_CARDS = []`); cards are
 * generated dynamically as rooms are studied or quiz questions are missed.
 */

import type { FSRSCard } from '../utils/fsrs';

export interface ScientificStudy {
  technique: string;
  evidenceTier:
    | 'Evidencia Científica Sólida (Alta Utilidad)'
    | 'Evidencia Moderada / Contextual'
    | 'Decisión de Diseño Instruccional Aplicada';
  authorsAndYear: string;
  publication: string;
  keyFinding: string;
  platformImplementation: string;
}

export const SCIENTIFIC_EVIDENCE: ScientificStudy[] = [
  {
    technique: 'Active Recall (Práctica de Recuperación / Practice Testing)',
    evidenceTier: 'Evidencia Científica Sólida (Alta Utilidad)',
    authorsAndYear:
      'Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013); Roediger, H. L., & Karpicke, J. D. (2006)',
    publication:
      'Psychological Science in the Public Interest, 14(1), 4–58 / Psychological Science, 17(3), 249–255',
    keyFinding:
      'Calificada con la máxima utilidad ("High Utility") entre 10 técnicas evaluadas: recuperar activamente información de la memoria consolida las trazas mnémicas a largo plazo mucho más que releer o subrayar pasivamente (Testing Effect).',
    platformImplementation:
      'Cada una de las 13 salas exige responder 5 preguntas de recuperación con opciones barajadas (mínimo 60% para aprobar) y escribir un intento de respuesta antes de voltear cualquier tarjeta.',
  },
  {
    technique: 'Spaced Repetition (Práctica Distribuida y Modelo DSR inspirado en FSRS)',
    evidenceTier: 'Evidencia Científica Sólida (Alta Utilidad)',
    authorsAndYear:
      'Carpenter, S. K., Cepeda, N. J., Rohrer, D., Kang, S. H. K., & Pashler, H. (2012); Dunlosky et al. (2013)',
    publication: 'Educational Psychology Review, 24(3), 369–378',
    keyFinding:
      'Distribuir el estudio a lo largo del tiempo en función de la curva de olvido detiene el decaimiento exponencial de la memoria y favorece la retención duradera en dominios complejos.',
    platformImplementation:
      'Motor de Repetición Espaciada basado en el modelo DSR (Dificultad, Estabilidad y Recuperabilidad) con 4 calificaciones ("Otra vez", "Difícil", "Bien", "Fácil"), filtro estricto de tarjetas vencidas y topes diarios (8 nuevas, 30 repasos).',
  },
  {
    technique: 'Meta-análisis de Estrategias de Aprendizaje y Transferencia',
    evidenceTier: 'Evidencia Científica Sólida (Alta Utilidad)',
    authorsAndYear: 'Donoghue, G. M., & Hattie, J. A. C. (2021)',
    publication: 'Frontiers in Education, 6, 581216 (Meta-analysis of 242 studies / 1,619 effects)',
    keyFinding:
      'Confirma que la práctica distribuida y la recuperación activa son las estrategias más robustas para consolidar conocimiento, mientras que la transferencia requiere evaluar la aplicación en escenarios nuevos.',
    platformImplementation:
      'Escala de dominio de Nivel 0 a Nivel 3 ("Nivel 3 · Transferencia") que separa el puntaje de Active Recall de un Escenario de Transferencia independiente en el Paso 5.',
  },
  {
    technique: 'Deliberate Practice (Práctica Deliberada con Retroalimentación Inmediata)',
    evidenceTier: 'Evidencia Científica Sólida (Alta Utilidad)',
    authorsAndYear: 'Ericsson, K. A., Krampe, R. T., & Tesch-Römer, C. (1993)',
    publication: 'Psychological Review, 100(3), 363–406',
    keyFinding:
      'El nivel experto no se alcanza por simple acumulación de horas pasivas, sino mediante tareas diseñadas específicamente para superar puntos débiles con detección inmediata de errores y repetición corregida.',
    platformImplementation:
      'Simulador de terminal con sistema de archivos virtual persistente, andamiaje progresivo (Guiado -> Pistas en 3 niveles -> Autónomo) y Analizador Estático de scripts Python/Bash.',
  },
  {
    technique: 'Interleaving (Práctica Intercalada) y Autoexplicación (Self-Explanation)',
    evidenceTier: 'Evidencia Moderada / Contextual',
    authorsAndYear: 'Dunlosky et al. (2013); Rohrer, D. (2012); Chi, M. T. H. et al. (1994)',
    publication: 'Psychological Science in the Public Interest / Cognitive Science',
    keyFinding:
      'Intercalar problemas de distintas áreas entrena la discriminación diagnóstica (saber QUÉ técnica aplicar ante un incidente ambiguo), mientras que la autoexplicación fuerza a articular relaciones causales.',
    platformImplementation:
      'Cola de repaso intercalada (round-robin entre dominios) y evaluador de Autoexplicación que exige oraciones completas, conectores causales y precisión técnica (rechazando listas sueltas de palabras clave).',
  },
  {
    technique: 'Tutoría Socrática Adaptativa con Pistas Graduales',
    evidenceTier: 'Decisión de Diseño Instruccional Aplicada',
    authorsAndYear: 'Diseño de Ingeniería Pedagógica en Ciberseguridad (NIST NICE Framework)',
    publication: 'Arquitectura Educativa AegisNeuro',
    keyFinding:
      'Evita que el estudiante dependa de soluciones copiadas a ciegas, guiándolo con una sola pregunta socrática por turno y tres niveles de pista sin revelar la bandera ni el comando final.',
    platformImplementation:
      'Tutor Socrático con historial de conversación, validación de esquemas Zod e indicación transparente de fuente (IA en vivo con Gemini 3.5 Flash vs. Guía Socrática Local).',
  },
];

/**
 * Empty initial deck: cards are dynamically generated when the learner starts a room
 * or misses an Active Recall question, avoiding false overdue or pre-mastered metrics.
 */
export const INITIAL_FSRS_CARDS: FSRSCard[] = [];
