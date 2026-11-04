import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  ArrowRight,
  Play,
  Database,
  Compass,
  Award,
  Flame,
  BookOpen,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { type CurriculumModule } from '../data/curriculumData';
import {
  calculateModuleMastery,
  buildInterleavedQueue,
  MASTERY_LABELS,
  type FSRSCard,
  type MasteryLevel,
  type ModuleProgress,
  type Rating,
} from '../utils/fsrs';
import { MODULE_DEEP_EXTRAS } from '../data/roomTasksData';
import { MODULE_DEEP_EXPANSION } from '../data/deepContentExpansion';

export interface EngineeringNote {
  id: string;
  date: string;
  targetId: string;
  targetTitle: string;
  whatLearned: string;
  whatNotUnderstood: string;
  errorsCommitted: string;
  howSolved: string;
  commandsAndScripts: string;
}

interface StudentDashboardProps {
  modules: CurriculumModule[];
  progressMap: Record<string, ModuleProgress>;
  cards: FSRSCard[];
  onOpenModule: (moduleId: string) => void;
  onRateCard: (cardId: string, rating: Rating) => void;
  onOpenPlacementTest: () => void;
  onOpenDataModal: () => void;
}

const LEARNING_PATHS = [
  {
    id: 'stage-1',
    stepRange: 'Salas 00 a 04',
    badge: 'ETAPA 1 · FUNDAMENTOS Y PRE-SECURITY',
    title: 'Ruta 1: Introducción Absoluta, Arquitectura, Linux/Windows, Redes y Programación',
    subtitle:
      'Pensada para quien empieza desde cero. Comenzarás en la Sala 00 dominando la terminal, permisos POSIX y direcciones IP, para luego profundizar en arquitectura x86-64, administración de sistemas, protocolo TCP/IP y automatización con Python y Bash.',
    moduleIds: ['mod-00', 'mod-01', 'mod-02', 'mod-03', 'mod-04'],
  },
  {
    id: 'stage-2',
    stepRange: 'Salas 05 a 08',
    badge: 'ETAPA 2 · SEGURIDAD OFENSIVA Y WEB',
    title: 'Ruta 2: Criptografía Aplicada, Seguridad de Redes, Hacking Web (OWASP) y Vulnerabilidades',
    subtitle:
      'Aprende cómo se protegen y auditan las redes empresariales, cómo funcionan las vulnerabilidades web reales (SQLi, XSS, SSRF, IDOR) y cómo priorizar riesgos mediante CVSS v3.1, EPSS y KEV.',
    moduleIds: ['mod-05', 'mod-06', 'mod-07', 'mod-08'],
  },
  {
    id: 'stage-3',
    stepRange: 'Salas 09 a 10',
    badge: 'ETAPA 3 · DEFENSA SOC Y FORENSE DFIR',
    title: 'Ruta 3: Operaciones de Defensa (Blue Team / SIEM) e Investigación Forense Digital',
    subtitle:
      'Detecta intrusiones en tiempo real mediante telemetría SIEM, reglas Sigma y Threat Hunting, e investiga servidores comprometidos preservando la cadena de custodia y el orden de volatilidad RFC 3227.',
    moduleIds: ['mod-09', 'mod-10'],
  },
  {
    id: 'stage-4',
    stepRange: 'Salas 11 a 12',
    badge: 'ETAPA 4 · RED TEAMING Y SEGURIDAD CLOUD',
    title: 'Ruta 4: Pentesting Ético Completo, Active Directory y Seguridad Cloud / Kubernetes',
    subtitle:
      'Integra todo lo aprendido en auditorías completas de Red Team (Kerberoasting, movimiento lateral) y protección de infraestructuras modernas en AWS IAM, contenedores y Kubernetes.',
    moduleIds: ['mod-11', 'mod-12'],
  },
];

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  modules,
  progressMap,
  cards,
  onOpenModule,
  onRateCard,
  onOpenPlacementTest,
  onOpenDataModal,
}) => {
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [showInlineReview, setShowInlineReview] = useState(false);
  const [showBadgesDrawer, setShowBadgesDrawer] = useState(false);
  const [frozenQueueIds, setFrozenQueueIds] = useState<string[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [writtenAttempt, setWrittenAttempt] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  const now = new Date();
  const dueCards = buildInterleavedQueue(cards, 30, now, {
    onlyDue: true,
    maxNewPerDay: 8,
    maxReviewsPerDay: 30,
  });

  const handleToggleInlineReview = () => {
    if (!showInlineReview) {
      const queue = buildInterleavedQueue(cards, 8, new Date(), {
        onlyDue: true,
        maxNewPerDay: 8,
        maxReviewsPerDay: 30,
      });
      setFrozenQueueIds(queue.map((c) => c.id));
      setReviewIndex(0);
      setWrittenAttempt('');
      setShowAnswer(false);
      setShowInlineReview(true);
    } else {
      setShowInlineReview(false);
    }
  };

  const activeCardId = frozenQueueIds[reviewIndex];
  const activeReviewCard = cards.find((c) => c.id === activeCardId) ?? null;

  const getModuleMasteryLevel = (moduleId: string): MasteryLevel => {
    const prog = progressMap[moduleId];
    if (!prog) return 0;
    return calculateModuleMastery(prog);
  };

  const totalRooms = modules.length;
  const completedModulesCount = modules.filter((m) => getModuleMasteryLevel(m.id) >= 2).length;
  const progressPercentage = Math.round(
    (completedModulesCount / Math.max(1, totalRooms)) * 100
  );

  // Calculate personal study stats (no external leaderboard)
  const totalPracticeMinutes = Object.values(progressMap).reduce(
    (acc, p) => acc + (p?.practiceMinutes || 0),
    0
  );
  const totalLabsCompleted = Object.values(progressMap).reduce(
    (acc, p) => acc + (p?.labsCompleted || 0),
    0
  );
  const activeStudyDaysCount = new Set(
    Object.values(progressMap)
      .filter((p) => p?.lastStudied)
      .map((p) => p.lastStudied!.slice(0, 10))
  ).size;

  const currentStepModule =
    modules.find((m) => getModuleMasteryLevel(m.id) < 2) ?? modules[0];

  const handleInlineRate = (rating: Rating) => {
    if (!activeReviewCard) return;
    onRateCard(activeReviewCard.id, rating);
    setWrittenAttempt('');
    setShowAnswer(false);
    setReviewIndex((prev) => prev + 1);
  };

  const filteredPaths =
    selectedStageFilter === 'all'
      ? LEARNING_PATHS
      : LEARNING_PATHS.filter((p) => p.id === selectedStageFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* TryHackMe-Style Personal Command & Current Room Banner */}
      <div className="bg-[#161E2E] border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-md bg-[#88CC14] text-slate-950 font-bold uppercase tracking-wider">
                RUTA GUIADA · DE CERO A PROFESIONAL
              </span>
              <span className="text-slate-300">
                Sala Actual: <strong className="text-white">Sala {currentStepModule.number}</strong> · {completedModulesCount} de {totalRooms} salas dominadas
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {currentStepModule.number} · {currentStepModule.title}
              </h1>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-2xl">
                Cada sala integra 6 lecciones técnicas profundas, anatomía de ataque y defensa en 4 fases, hoja de comandos de campo (Cheat Sheet), laboratorio Linux en pantalla dividida, auditoría de código vulnerable vs. seguro y repetición espaciada DSR.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onOpenModule(currentStepModule.id)}
                className="px-5 py-3 rounded-xl bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-sm transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Continuar en Sala {currentStepModule.number}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleToggleInlineReview}
                className="px-4 py-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-white border border-slate-700 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Brain className="w-4 h-4 text-[#88CC14]" />
                {showInlineReview
                  ? 'Ocultar Repaso Diario'
                  : `Repaso Espaciado (${dueCards.length} vencidas)`}
              </button>

              <button
                type="button"
                onClick={() => setShowBadgesDrawer((prev) => !prev)}
                className="px-3.5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-[#88CC14]" />
                Insignias Personales ({completedModulesCount}/{totalRooms})
              </button>

              <button
                type="button"
                onClick={onOpenPlacementTest}
                className="px-3.5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#88CC14]" />
                Test de Nivel
              </button>

              <button
                type="button"
                onClick={onOpenDataModal}
                className="px-3.5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Database className="w-4 h-4 text-[#88CC14]" />
                Mazo ({cards.length}) y Backup
              </button>
            </div>
          </div>

          {/* Right Personal Telemetry Box (Strictly Personal — No XP Leaderboard) */}
          <div className="lg:col-span-4 bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">
                DOMINIO PERSONAL ACUMULADO
              </span>
              <span className="text-sm font-mono font-bold text-[#88CC14] tabular-nums">
                {completedModulesCount} / {totalRooms} Salas ({progressPercentage}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#88CC14] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Días Activos</span>
                </div>
                <p className="text-base font-mono font-bold text-white mt-0.5 tabular-nums">
                  {activeStudyDaysCount} {activeStudyDaysCount === 1 ? 'día' : 'días'}
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <Terminal className="w-3.5 h-3.5 text-sky-400" />
                  <span>Labs VM</span>
                </div>
                <p className="text-base font-mono font-bold text-white mt-0.5 tabular-nums">
                  {totalLabsCompleted} / {totalRooms}
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <BookOpen className="w-3.5 h-3.5 text-[#88CC14]" />
                  <span>Estudio</span>
                </div>
                <p className="text-base font-mono font-bold text-white mt-0.5 tabular-nums">
                  {totalPracticeMinutes}m
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sistema de progreso individual: cada sala incluye 6 lecciones completas, Cheat Sheet de comandos, laboratorio Linux interactivo y repaso DSR.
            </p>
          </div>
        </div>

        {/* Personal Competency Badges Drawer (No XP Table — Pure Technical Certifications) */}
        {showBadgesDrawer && (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#88CC14]" />
                  Insignias Personales de Competencia Técnica (CERT-00 a CERT-12)
                </h2>
                <p className="text-xs text-slate-400">
                  Se desbloquean al alcanzar Nivel 2 (Aplicación) o Nivel 3 (Transferencia) en cada sala mediante cuestionario, laboratorio VM y autoexplicación.
                </p>
              </div>
              <span className="text-xs font-mono text-[#88CC14]">
                {completedModulesCount} de {totalRooms} desbloqueadas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {modules.map((mod) => {
                const lvl = getModuleMasteryLevel(mod.id);
                const unlocked = lvl >= 2;
                const badge = MODULE_DEEP_EXPANSION[mod.id]?.competencyBadge;
                return (
                  <div
                    key={mod.id}
                    onClick={() => onOpenModule(mod.id)}
                    className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex items-start gap-3 ${
                      unlocked
                        ? 'bg-[#0F172A] border-[#88CC14]/60 text-white'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                        unlocked
                          ? 'bg-[#88CC14] text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {unlocked ? <ShieldCheck className="w-5 h-5" /> : mod.number}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono">
                        <span className={unlocked ? 'text-[#88CC14] font-bold' : 'text-slate-500'}>
                          {badge?.code || `CERT-${mod.number}`}
                        </span>
                        <span>·</span>
                        <span>{unlocked ? 'VERIFICADA' : 'PENDIENTE'}</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate mt-0.5">
                        {badge?.name || mod.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {badge?.skillVerified || mod.domain}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inline Daily DSR Warmup Drawer */}
        {showInlineReview && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            {activeReviewCard ? (
              <div className="bg-[#0F172A] border border-[#88CC14]/50 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[#88CC14]" />
                    <span className="text-xs font-mono uppercase text-[#88CC14] font-bold">
                      COLA DE REPASO CONGELADA ({reviewIndex + 1} / {frozenQueueIds.length}) · {activeReviewCard.domain}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Concepto: {activeReviewCard.concept} · Estabilidad: {activeReviewCard.stability}d · Lapsos: {activeReviewCard.lapses}
                  </span>
                </div>

                <p className="text-base font-bold text-white">{activeReviewCard.question}</p>

                <div className="space-y-2">
                  <label className="block text-xs font-mono text-slate-300">
                    Escribe tu intento de recuperación antes de voltear la tarjeta (mínimo 8 caracteres):
                  </label>
                  <textarea
                    rows={2}
                    value={writtenAttempt}
                    onChange={(e) => setWrittenAttempt(e.target.value)}
                    placeholder="Redacta con tus palabras la respuesta antes de compararla..."
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-[#88CC14]"
                  />
                </div>

                {!showAnswer ? (
                  <button
                    type="button"
                    disabled={writtenAttempt.trim().length < 8}
                    onClick={() => setShowAnswer(true)}
                    className="px-4 py-2 rounded-lg bg-[#88CC14] hover:bg-[#9be31b] disabled:opacity-40 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Comparar con la Respuesta Esperada
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-200 leading-relaxed">
                      <strong className="text-[#88CC14]">Respuesta esperada:</strong>{' '}
                      {activeReviewCard.expectedAnswer}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 mr-2">
                        Califica tu recuerdo (Modelo DSR de 4 grados):
                      </span>
                      <button
                        type="button"
                        onClick={() => handleInlineRate('again')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold cursor-pointer"
                      >
                        1 · Otra vez (Olvidado)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInlineRate('hard')}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold cursor-pointer"
                      >
                        2 · Difícil (Con esfuerzo)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInlineRate('good')}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-mono font-bold cursor-pointer"
                      >
                        3 · Bien (Correcto)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInlineRate('easy')}
                        className="px-3 py-1.5 rounded-lg bg-[#88CC14]/20 hover:bg-[#88CC14]/30 border border-[#88CC14]/40 text-[#88CC14] text-xs font-mono font-bold cursor-pointer"
                      >
                        4 · Fácil (Inmediato)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 text-xs sm:text-sm text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-white">
                    No tienes tarjetas vencidas pendientes en este momento.
                  </p>
                  <p className="text-slate-400 mt-0.5">
                    Las tarjetas se desbloquean automáticamente a medida que estudias cada sala (o cuando fallas una pregunta de Active Recall).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenDataModal}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold shrink-0 cursor-pointer"
                >
                  Abrir Mazo ({cards.length} tarjetas)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stage Filter Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'Todas las Salas (13)' },
            { id: 'stage-1', label: 'Etapa 1 · Fundamentos (00–04)' },
            { id: 'stage-2', label: 'Etapa 2 · Pentesting y Web (05–08)' },
            { id: 'stage-3', label: 'Etapa 3 · Blue Team y Forense (09–10)' },
            { id: 'stage-4', label: 'Etapa 4 · Red Team y Cloud (11–12)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStageFilter(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedStageFilter === tab.id
                  ? 'bg-[#161E2E] text-[#88CC14]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono text-slate-500 px-2">
          6 Lecciones + Cheat Sheet + Laboratorio VM por Sala
        </span>
      </div>

      {/* Progressive Learning Paths Roadmap (Connected Visual Timeline) */}
      <div className="space-y-8">
        {filteredPaths.map((path) => {
          const pathModules = modules.filter((m) => path.moduleIds.includes(m.id));
          const completedInPath = pathModules.filter(
            (m) => getModuleMasteryLevel(m.id) >= 2
          ).length;

          return (
            <section
              key={path.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
            >
              {/* Path Stage Header */}
              <div className="bg-[#161E2E] px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-[#88CC14] font-bold uppercase tracking-wider">
                      {path.badge}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300">{path.stepRange}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {path.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                    {path.subtitle}
                  </p>
                </div>

                <div className="shrink-0 bg-[#0F172A] border border-slate-800 rounded-xl px-4 py-2.5 text-right">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">
                    AVANCE DE ETAPA
                  </span>
                  <span className="text-base font-mono font-bold text-[#88CC14] tabular-nums">
                    {completedInPath} / {pathModules.length} Salas
                  </span>
                </div>
              </div>

              {/* Connected Timeline Nodes inside this Path */}
              <div className="p-6 sm:p-8">
                <div className="relative border-l-2 border-slate-200 ml-5 sm:ml-6 pl-6 sm:pl-8 space-y-6">
                  {pathModules.map((mod) => {
                    const masteryLevel = getModuleMasteryLevel(mod.id);
                    const masteryInfo = MASTERY_LABELS[masteryLevel];
                    const isCurrentRecommended = mod.id === currentStepModule.id;
                    const isCompleted = masteryLevel >= 2;
                    const extra = MODULE_DEEP_EXTRAS[mod.id];
                    const deepExp = MODULE_DEEP_EXPANSION[mod.id];
                    const totalLessonsCount =
                      mod.theorySections.length +
                      (deepExp?.extendedSubModules?.length ?? 0);

                    return (
                      <div
                        key={mod.id}
                        onClick={() => onOpenModule(mod.id)}
                        className={`relative rounded-2xl border p-5 transition-all cursor-pointer group ${
                          isCurrentRecommended
                            ? 'bg-emerald-50/40 border-[#88CC14] shadow-xs'
                            : isCompleted
                              ? 'bg-white border-emerald-300/80 hover:border-emerald-400'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        {/* Connected Timeline Circle Node */}
                        <div
                          className={`absolute -left-[43px] sm:-left-[51px] top-6 w-9 h-9 rounded-xl font-mono font-bold text-xs flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105 ${
                            isCompleted
                              ? 'bg-[#88CC14] text-slate-950'
                              : isCurrentRecommended
                                ? 'bg-[#161E2E] text-[#88CC14] ring-4 ring-[#88CC14]/30'
                                : 'bg-white text-slate-700 border-2 border-slate-300'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-slate-950" />
                          ) : (
                            mod.number
                          )}
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                          <div className="space-y-2">
                            {/* Clean Zero-Pill Metadata Line */}
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-slate-500">
                              <span className="font-bold text-slate-800">
                                SALA {mod.number}
                              </span>
                              <span>·</span>
                              <span>{mod.domain}</span>
                              <span>·</span>
                              <span>{mod.estimatedHours}h</span>
                              <span>·</span>
                              <span className="text-emerald-800 font-semibold">
                                {totalLessonsCount} Lecciones + Cheat Sheet + Lab VM
                              </span>
                              <span>·</span>
                              <span className="text-slate-700 font-semibold">
                                {masteryInfo.badge}
                              </span>
                              {isCurrentRecommended && (
                                <>
                                  <span>·</span>
                                  <span className="text-[#E11D48] font-bold">
                                    ★ PASO ACTUAL RECOMENDADO
                                  </span>
                                </>
                              )}
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#3F6212] transition-colors">
                              {mod.title}
                            </h3>

                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                              {mod.summary || extra?.deepIntroParagraphs?.[0]}
                            </p>

                            {/* Preview of the 6 lessons included inside the room */}
                            {deepExp && (
                              <div className="pt-1 text-xs text-slate-500 font-mono flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="text-slate-700 font-semibold">
                                  Temario ampliado ({totalLessonsCount} subtemas):
                                </span>
                                {deepExp.extendedSubModules.slice(0, 3).map((sub) => (
                                  <span key={sub.id} className="text-slate-600">
                                    • {sub.title.replace(/^\d+\.\s*/, '')}
                                  </span>
                                ))}
                                <span className="text-emerald-800 font-semibold">
                                  + Anatomía 4 Fases y Auditoría de Código
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action CTA */}
                          <div className="shrink-0 self-start md:self-center">
                            <span
                              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
                                isCurrentRecommended
                                  ? 'bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 shadow-xs'
                                  : 'bg-[#161E2E] group-hover:bg-slate-800 text-white'
                              }`}
                            >
                              {isCompleted
                                ? 'Repasar Sala'
                                : isCurrentRecommended
                                  ? 'Continuar Aquí'
                                  : 'Entrar a la Sala'}
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
