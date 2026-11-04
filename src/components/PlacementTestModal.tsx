import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  Compass,
  Award,
  ArrowRight,
  Download,
  Upload,
  Trash2,
  Plus,
} from 'lucide-react';
import { PLACEMENT_TEST_QUESTIONS, type CurriculumModule } from '../data/curriculumData';
import type { FSRSCard } from '../utils/fsrs';

interface PlacementTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompletePlacement: (scorePercent: number, unlockedModuleIds: string[], recommendedStartId: string) => void;
}

export const PlacementTestModal: React.FC<PlacementTestModalProps> = ({
  isOpen,
  onClose,
  onCompletePlacement,
}) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = PLACEMENT_TEST_QUESTIONS.length;

  const calculateResult = () => {
    let correct = 0;
    const unlockedIds: string[] = [];

    PLACEMENT_TEST_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correct += 1;
        if (q.recommendedSkipModuleId) {
          unlockedIds.push(q.recommendedSkipModuleId);
        }
      }
    });

    const scorePercent = Math.round((correct / totalQuestions) * 100);
    let recommendedStartId = 'mod-00';
    if (scorePercent >= 80) {
      recommendedStartId = 'mod-09';
    } else if (scorePercent >= 50) {
      recommendedStartId = 'mod-05';
    } else if (answers['pt-01'] === PLACEMENT_TEST_QUESTIONS[0].correctIndex) {
      recommendedStartId = 'mod-01';
    }

    return { correct, scorePercent, unlockedIds, recommendedStartId };
  };

  const result = submitted ? calculateResult() : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="bg-[#161E2E] px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-[#88CC14]" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Test Diagnóstico de Nivel Inicial (10 Preguntas)
              </h2>
              <p className="text-xs text-slate-400">
                Evalúa tu base técnica actual para recomendarte por qué Sala empezar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {!submitted ? (
            <>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
                Responde sin buscar en Internet. Si estás empezando desde cero y no conoces una respuesta, puedes cerrar este test y comenzar directamente en la <strong>Sala 00 (Tu Primer Día con la Terminal)</strong>.
              </div>

              {PLACEMENT_TEST_QUESTIONS.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono uppercase text-[#E11D48] font-bold">
                      Pregunta {idx + 1} de {totalQuestions} · {q.domain}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{q.question}</p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oIdx) => {
                      const chosen = answers[q.id] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                          }
                          className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2 cursor-pointer ${
                            chosen
                              ? 'bg-[#161E2E] border-[#161E2E] text-white font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-400'
                          }`}
                        >
                          <span className="font-mono font-bold">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          ) : (
            result && (
              <div className="p-6 rounded-2xl bg-[#161E2E] text-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#88CC14] text-slate-950 flex items-center justify-center font-bold">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase text-[#88CC14]">
                      RESULTADO DEL DIAGNÓSTICO INICIAL
                    </span>
                    <h3 className="text-xl font-bold">
                      Puntaje: {result.scorePercent}% ({result.correct}/{totalQuestions} aciertos)
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {result.scorePercent < 30
                    ? 'Te recomendamos comenzar por la Sala 00 (Fundamentos desde Cero: Tu Primer Día con la Terminal, Internet y Ética Legal) para construir una base firme paso a paso.'
                    : result.scorePercent < 70
                      ? 'Ya dominas varios conceptos iniciales. Hemos registrado tus competencias base y te recomendamos continuar desde tu punto óptimo en la ruta.'
                      : '¡Excelente base técnica! Hemos acreditado los módulos iniciales que ya dominas y te llevamos directamente a las salas intermedias/avanzadas.'}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onCompletePlacement(
                        result.scorePercent,
                        result.unlockedIds,
                        result.recommendedStartId
                      );
                      onClose();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                  >
                    Aplicar Recomendación e Ir a Mi Sala ({result.recommendedStartId.toUpperCase()})
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-600">
            Respondidas: {answeredCount} / {totalQuestions}
          </span>
          {!submitted ? (
            <button
              type="button"
              disabled={answeredCount < totalQuestions}
              onClick={() => setSubmitted(true)}
              className="px-5 py-2.5 rounded-xl bg-[#88CC14] hover:bg-[#9be31b] disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Calificar Mi Nivel Inicial
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
            >
              Repetir Diagnóstico
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface DataAndDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: FSRSCard[];
  modules: CurriculumModule[];
  onDeleteCard: (cardId: string) => void;
  onCreateCustomCard: (moduleId: string, concept: string, question: string, answer: string) => void;
  onExportJson: () => void;
  onImportJson: (rawJson: string) => { ok: boolean; error?: string };
  onResetAllProgress: () => void;
}

export const DataAndDeckModal: React.FC<DataAndDeckModalProps> = ({
  isOpen,
  onClose,
  cards,
  modules,
  onDeleteCard,
  onCreateCustomCard,
  onExportJson,
  onImportJson,
  onResetAllProgress,
}) => {
  const [selectedModId, setSelectedModId] = useState(modules[0]?.id || 'mod-00');
  const [concept, setConcept] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const res = onImportJson(text);
      if (res.ok) {
        setImportFeedback({ ok: true, msg: 'Respaldo JSON validado con Zod e importado correctamente.' });
      } else {
        setImportFeedback({ ok: false, msg: res.error || 'Error al validar el archivo JSON.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="bg-[#161E2E] px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              Inventario de Tarjetas DSR, Respaldo JSON y Gestión de Progreso
            </h2>
            <p className="text-xs text-slate-400">
              Total en tu mazo personal: {cards.length} tarjetas · Esquema validado con Zod
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Backup Export / Import + Reset */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
              1. PORTABILIDAD DE DATOS (EXPORTAR / IMPORTAR JSON) Y REINICIO HONESTO
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onExportJson}
                className="px-4 py-2 rounded-xl bg-[#161E2E] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#88CC14]" />
                Exportar Progreso (.json)
              </button>

              <label className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-2 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-sky-600" />
                Importar Respaldo (.json)
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reiniciar Progreso a Cero
                </button>
              ) : (
                <div className="flex items-center gap-2 ml-auto bg-rose-50 border border-rose-300 px-3 py-1.5 rounded-xl">
                  <span className="text-xs text-rose-900 font-semibold">
                    ¿Confirmas borrar todo el progreso?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetAllProgress();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Sí, borrar todo
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1 rounded bg-white text-slate-700 border border-slate-300 text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {importFeedback && (
              <div
                className={`p-3 rounded-lg text-xs font-medium ${
                  importFeedback.ok
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border border-rose-300 text-rose-900'
                }`}
              >
                {importFeedback.msg}
              </div>
            )}
          </div>

          {/* Create New Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
              2. CREAR NUEVA TARJETA DE MEMORIA ESPACIADA
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <select
                value={selectedModId}
                onChange={(e) => setSelectedModId(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    Sala {m.number} · {m.title}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Concepto clave (ej. SUID 4000 / IMDSv2)"
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Pregunta de recuperación activa..."
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Respuesta esperada..."
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!concept.trim() || !question.trim() || !answer.trim()) return;
                    onCreateCustomCard(selectedModId, concept.trim(), question.trim(), answer.trim());
                    setConcept('');
                    setQuestion('');
                    setAnswer('');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir
                </button>
              </div>
            </div>
          </div>

          {/* Card List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
              3. INVENTARIO DE TARJETAS EN TU MAZO ({cards.length})
            </h3>
            {cards.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 rounded-xl bg-slate-50 border border-slate-200">
                Tu mazo empieza limpio (0 tarjetas falsas). Al abrir cualquier Sala de estudio o fallar una pregunta de quiz se generan automáticamente las tarjetas de ese módulo.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-xl">
                {cards.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-white flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                          {c.domain}
                        </span>
                        <span className="font-bold text-slate-900">{c.concept}</span>
                        <span className="text-slate-500">
                          S={c.stability}d · D={c.difficulty} · Lapses={c.lapses}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium">{c.question}</p>
                      <p className="text-slate-500">{c.expectedAnswer}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteCard(c.id)}
                      className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
                      title="Eliminar tarjeta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
