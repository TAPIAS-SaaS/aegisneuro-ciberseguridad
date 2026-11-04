import React, { useState, useEffect, useMemo } from 'react';
import {
  Terminal,
  CheckCircle2,
  ExternalLink,
  Bot,
  Send,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Brain,
  Lightbulb,
  BookOpen,
  HelpCircle,
  Eye,
  ShieldCheck,
  Copy,
  Columns2,
  Award,
  Code2,
  Layers,
  Check,
} from 'lucide-react';
import type { CurriculumModule, ActiveRecallQuestion } from '../data/curriculumData';
import {
  buildRoomTasksForModule,
  MODULE_DEEP_EXTRAS,
} from '../data/roomTasksData';
import { MODULE_DEEP_EXPANSION } from '../data/deepContentExpansion';
import {
  calculateModuleMastery,
  evaluateSelfExplanationLocal,
  MASTERY_LABELS,
  calculateRetrievability,
  type FSRSCard,
  type ModuleProgress,
  type Rating,
} from '../utils/fsrs';
import {
  VM_NODES,
  MODULE_TO_VM_NODE,
  executeVMCommand,
  resetVMNodeState,
} from '../utils/vmEngine';
import { validateTaskAnswer } from '../utils/validation';
import {
  LEARNING_STYLE_META,
  askAIMentor,
  type LearningStyle,
} from '../utils/aiMentorEngine';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { ExerciseVMWorkbench, type VMLogLine } from './ExerciseVMWorkbench';
import type { EngineeringNote } from './StudentDashboard';

interface CurriculumViewProps {
  modules: CurriculumModule[];
  selectedModuleId: string;
  onSelectModule: (id: string) => void;
  onBackToPath: () => void;
  progressMap: Record<string, ModuleProgress>;
  onUpdateProgress: (moduleId: string, partial: Partial<ModuleProgress>) => void;
  moduleCards: FSRSCard[];
  onRateCard: (cardId: string, rating: Rating) => void;
  onCreateFlashcardFromModule: (
    module: CurriculumModule,
    concept: string,
    question: string,
    answer: string
  ) => void;
  moduleNotes: EngineeringNote[];
  onSaveModuleNote: (
    moduleTitle: string,
    whatLearned: string,
    errorsCommitted: string,
    commandsUsed: string
  ) => void;
  learningStyle: LearningStyle;
  onChangeLearningStyle: (style: LearningStyle) => void;
}

interface TutorTurn {
  role: 'user' | 'assistant';
  content: string;
  source?: 'ai' | 'local-adaptive';
}

interface UnifiedLessonItem {
  index: number;
  lessonBadge: string;
  title: string;
  paragraphs: string[];
  keyTakeaways: string[];
  codeOrCommandExample?: string;
}

function renderFormattedAIText(raw: string): React.ReactNode {
  const lines = raw.split('\n');
  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[#88CC14] font-mono text-xs"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-xs sm:text-sm font-bold text-[#88CC14] font-mono pt-1">
              {trimmed.replace(/^###\s+/, '')}
            </h4>
          );
        }
        if (trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-[#88CC14] font-bold">•</span>
              <span>{formatInline(trimmed.slice(2))}</span>
            </div>
          );
        }
        return <p key={idx}>{formatInline(trimmed)}</p>;
      })}
    </div>
  );
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  modules,
  selectedModuleId,
  onSelectModule,
  onBackToPath,
  progressMap,
  onUpdateProgress,
  moduleCards,
  onRateCard,
  onCreateFlashcardFromModule,
  moduleNotes,
  onSaveModuleNote,
  learningStyle,
  onChangeLearningStyle,
}) => {
  const activeModule = modules.find((m) => m.id === selectedModuleId) ?? modules[0];
  const currentIndex = modules.findIndex((m) => m.id === activeModule.id);
  const prevModule = currentIndex > 0 ? modules[currentIndex - 1] : null;
  const nextModule = currentIndex < modules.length - 1 ? modules[currentIndex + 1] : null;

  const progress: ModuleProgress = progressMap[activeModule.id] ?? {
    moduleId: activeModule.id,
    activeRecallScore: 0,
    selfExplanationScore: 0,
    selfExplanationText: '',
    deliberatePracticeCompleted: false,
    evaluationScore: 0,
    labsCompleted: 0,
    totalLabs: 1,
    practiceMinutes: 0,
    lastStudied: null,
    delayedTransferPassed: false,
    hintsUsedCount: 0,
  };

  const masteryLevel = calculateModuleMastery(progress);
  const masteryInfo = MASTERY_LABELS[masteryLevel];
  const roomTasks = useMemo(() => buildRoomTasksForModule(activeModule), [activeModule]);
  const deepExtras = MODULE_DEEP_EXTRAS[activeModule.id] ?? MODULE_DEEP_EXTRAS['mod-01'];
  const deepExpansion = MODULE_DEEP_EXPANSION[activeModule.id] ?? MODULE_DEEP_EXPANSION['mod-01'];

  // Guided Step (1 to 5)
  const [activeStep, setActiveStep] = useState<number>(1);
  // Sub-Tab inside Task 1 ('lessons' | 'anatomy' | 'cheatsheet')
  const [task1SubTab, setTask1SubTab] = useState<'lessons' | 'anatomy' | 'cheatsheet'>('lessons');
  // Step-by-step lesson index inside Task 1 (0 to 5, or -1 for "Ver todas")
  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);
  const [readLessons, setReadLessons] = useState<Record<number, boolean>>({});

  // Split-Screen VM toggle (automatically active on Steps 3 & 4, or toggleable anytime)
  const [splitScreenEnabled, setSplitScreenEnabled] = useState<boolean>(false);
  const [copiedCmdToast, setCopiedCmdToast] = useState<string | null>(null);

  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
  const [taskFeedback, setTaskFeedback] = useState<
    Record<string, { ok: boolean; msg: string }>
  >({});
  // Progressive hint level per question (0 = hidden, 1 = Empujón, 2 = Concepto, 3 = Estructura)
  const [hintLevels, setHintLevels] = useState<Record<string, number>>({});
  const [predictionRevealed, setPredictionRevealed] = useState(false);

  // Socratic AI Mentor Drawer State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiHistory, setAiHistory] = useState<TutorTurn[]>([]);
  const [aiSource, setAiSource] = useState<'ai' | 'local-adaptive' | null>(null);
  const [aiSuggestedChips, setAiSuggestedChips] = useState<string[]>([]);
  const [tutorHintLevel, setTutorHintLevel] = useState<number>(1);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiDrawer, setShowAiDrawer] = useState(false);

  // Active Recall Quiz state (Step 2 - 5 questions)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizLastScore, setQuizLastScore] = useState<number | null>(null);

  // Transfer Scenario state (Step 5 - independent evaluationScore)
  const [transferSelected, setTransferSelected] = useState<number | null>(null);
  const [transferSubmitted, setTransferSubmitted] = useState(false);

  // Self-Explanation state (Step 5)
  const [explanationDraft, setExplanationDraft] = useState(
    progress.selfExplanationText || ''
  );
  const [explanationResult, setExplanationResult] = useState<ReturnType<
    typeof evaluateSelfExplanationLocal
  > | null>(null);
  const [aiEvaluationFeedback, setAiEvaluationFeedback] = useState<string | null>(null);
  const [aiEvaluationSource, setAiEvaluationSource] = useState<'ai' | 'local-adaptive' | null>(null);
  const [aiEvaluating, setAiEvaluating] = useState(false);

  // Flashcard Active Retrieval before Flip (Step 5)
  const [cardAttemptInputs, setCardAttemptInputs] = useState<Record<string, string>>({});
  const [revealedCardIds, setRevealedCardIds] = useState<Record<string, boolean>>({});
  const [ratedCardFeedback, setRatedCardFeedback] = useState<Record<string, string>>({});

  // Custom FSRS Flashcard creation inside Step 5
  const [customCardConcept, setCustomCardConcept] = useState('');
  const [customCardQuestion, setCustomCardQuestion] = useState('');
  const [customCardAnswer, setCustomCardAnswer] = useState('');
  const [cardSavedToast, setCardSavedToast] = useState(false);

  // Integrated Note / Error Log state (Step 5)
  const [noteLearned, setNoteLearned] = useState('');
  const [noteErrors, setNoteErrors] = useState('');
  const [noteSavedToast, setNoteSavedToast] = useState(false);

  // On-Demand Exercise VM State (Step 3 & Step 4 or Split-Screen)
  const vmNodeId = MODULE_TO_VM_NODE[activeModule.id] || 'linux-target';
  const vmNode = VM_NODES[vmNodeId] ?? VM_NODES['linux-target'];
  const [vmUser, setVmUser] = useState(vmNode.user);
  const [vmCwd, setVmCwd] = useState(vmNode.cwd);
  const [vmInput, setVmInput] = useState('');
  const [vmHistory, setVmHistory] = useState<string[]>([]);
  const [vmLogs, setVmLogs] = useState<VMLogLine[]>([]);
  const [capturedFlag, setCapturedFlag] = useState<string | null>(null);
  const [lastExecutedExplanation, setLastExecutedExplanation] = useState<string | null>(null);

  const task1 = roomTasks[0];
  const task2 = roomTasks[1];
  const task3 = roomTasks[2];
  const task4 = roomTasks[3];

  // Build unified 6-lesson array for structured step-by-step beginner learning
  const unifiedLessons = useMemo<UnifiedLessonItem[]>(() => {
    const items: UnifiedLessonItem[] = [];
    const baseSections = activeModule.theorySections ?? [];
    const extraIntro = task1?.readingParagraphs ?? [];

    baseSections.forEach((sec, idx) => {
      const extraPara = extraIntro[idx] ? [extraIntro[idx]] : [];
      items.push({
        index: idx,
        lessonBadge: `Lección ${idx + 1} de ${baseSections.length + (deepExpansion?.extendedSubModules?.length ?? 0)}`,
        title: sec.heading,
        paragraphs: [sec.content, ...extraPara].filter(Boolean),
        keyTakeaways: [
          activeModule.objectives[idx] || activeModule.objectives[0] || '',
        ].filter(Boolean),
        codeOrCommandExample:
          sec.codeSnippet || deepExpansion?.commandCheatSheet?.[idx]?.command,
      });
    });

    (deepExpansion?.extendedSubModules ?? []).forEach((sub, idx) => {
      const num = baseSections.length + idx + 1;
      const total = baseSections.length + (deepExpansion?.extendedSubModules?.length ?? 0);
      items.push({
        index: num - 1,
        lessonBadge: `Lección ${num} de ${total}`,
        title: sub.title.replace(/^\d+\.\s*/, ''),
        paragraphs: sub.deepExplanation,
        keyTakeaways: sub.keyTakeaways,
        codeOrCommandExample: sub.codeOrCommandExample,
      });
    });

    return items;
  }, [activeModule, task1, deepExpansion]);

  const initVmBanner = (node = vmNode) => {
    setVmUser(node.user);
    setVmCwd(node.cwd);
    setVmHistory([]);
    setCapturedFlag(null);
    setLastExecutedExplanation(null);
    setVmLogs([
      {
        type: 'output',
        text: `[Estación AttackBox Interactiva] Nodo: ${node.hostname} (${node.ip})\nSistema Operativo: ${node.os}\nEscribe 'help' para ver los comandos disponibles, usa 'pwd', 'ls -la', 'cd', 'cat' o haz clic en los Pasos Guiados de arriba.`,
      },
    ]);
  };

  // Reset state when switching modules
  useEffect(() => {
    setActiveStep(1);
    setTask1SubTab('lessons');
    setActiveLessonIdx(0);
    setReadLessons({});
    setSplitScreenEnabled(false);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizLastScore(null);
    setTransferSelected(null);
    setTransferSubmitted(false);
    setExplanationDraft(progressMap[activeModule.id]?.selfExplanationText || '');
    setExplanationResult(null);
    setAiEvaluationFeedback(null);
    setAiEvaluationSource(null);
    setAiHistory([]);
    setAiSource(null);
    setAiSuggestedChips([]);
    setShowAiDrawer(false);
    setPredictionRevealed(false);
    setHintLevels({});
    setTaskFeedback({});
    setCardAttemptInputs({});
    setRevealedCardIds({});

    const node = VM_NODES[MODULE_TO_VM_NODE[activeModule.id] || 'linux-target'] ?? VM_NODES['linux-target'];
    resetVMNodeState(node.id);
    initVmBanner(node);
  }, [activeModule.id]);

  // Execute command in the Exercise VM using the 5-argument signature
  const handleRunVMCommand = (rawCmd?: string, stepExplanation?: string) => {
    const cmd = (rawCmd ?? vmInput).trim();
    if (!cmd) return;

    const promptStr = `${vmUser}@${vmNode.hostname}:${vmCwd}$ ${cmd}`;
    if (cmd === 'clear') {
      setVmLogs([]);
      setVmInput('');
      return;
    }

    const res = executeVMCommand(activeModule.id, vmNodeId, cmd, vmCwd, vmUser);
    const nextLogs: VMLogLine[] = [
      ...vmLogs,
      { type: 'input', text: promptStr },
    ];
    if (res.output) {
      nextLogs.push({ type: 'output', text: res.output });
    }
    if (res.detectedErrorHint) {
      nextLogs.push({ type: 'hint', text: res.detectedErrorHint });
    }

    setVmLogs(nextLogs);
    setVmHistory((prev) => [...prev, cmd]);
    if (res.newUser) setVmUser(res.newUser);
    if (res.newCwd) setVmCwd(res.newCwd);
    if (!rawCmd) setVmInput('');

    if (stepExplanation) {
      setLastExecutedExplanation(stepExplanation);
    }

    if (res.capturedFlag) {
      setCapturedFlag(res.capturedFlag);
      const q3 = roomTasks[2]?.taskQuestions[0];
      if (q3) {
        setTaskInputs((prev) => ({
          ...prev,
          [q3.id]: res.capturedFlag!,
        }));
      }
      onUpdateProgress(activeModule.id, {
        deliberatePracticeCompleted: true,
        labsCompleted: 1,
      });
    }
  };

  const handleCopyCommand = (cmd: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cmd).catch(() => {});
    }
    setCopiedCmdToast(cmd);
    setTimeout(() => setCopiedCmdToast(null), 2200);
  };

  const handleSendCommandToVM = (cmd: string, explanation?: string) => {
    setSplitScreenEnabled(true);
    setVmInput(cmd);
    handleRunVMCommand(cmd, explanation);
  };

  // Call Personalized AI Mentor
  const handleAskSocraticTutor = async (
    customPrompt?: string,
    mode:
      | 'socratic'
      | 'simplify_for_beginner'
      | 'explain_terminal_command'
      | 'personalized_study_plan' = 'socratic',
    terminalCmd?: string,
    terminalOut?: string
  ) => {
    const query = (customPrompt ?? aiQuestion).trim();
    if (!query || aiLoading) return;

    setShowAiDrawer(true);
    setAiLoading(true);
    const nextUserTurn: TutorTurn = { role: 'user', content: query };
    const historyForApi = aiHistory.slice(-8).map((h) => ({
      role: h.role,
      content: h.content,
    }));

    const currentLessonObj =
      activeLessonIdx >= 0 ? unifiedLessons[activeLessonIdx] : unifiedLessons[0];

    try {
      const result = await askAIMentor({
        question: query,
        learningStyle,
        activeModule,
        activeStepNum: activeStep,
        activeLessonTitle: currentLessonObj?.title,
        lastTerminalCommand: terminalCmd,
        lastTerminalOutput: terminalOut,
        mode,
        hintLevel: tutorHintLevel,
        history: historyForApi,
      });

      setAiSource(result.source);
      setAiSuggestedChips(result.suggestedFollowUps);
      setAiHistory((prev) => [
        ...prev,
        nextUserTurn,
        { role: 'assistant', content: result.reply, source: result.source },
      ]);
      if (!customPrompt) setAiQuestion('');
    } finally {
      setAiLoading(false);
    }
  };

  // Increment progressive hint level (1 -> 2 -> 3) and record in telemetry
  const handleAdvanceHint = (questionId: string) => {
    setHintLevels((prev) => {
      const current = prev[questionId] ?? 0;
      const next = Math.min(3, current + 1);
      return { ...prev, [questionId]: next };
    });
    onUpdateProgress(activeModule.id, {
      hintsUsedCount: (progress.hintsUsedCount ?? 0) + 1,
    });
  };

  // Strict Task Question Verification using validateTaskAnswer
  const handleVerifyTaskQuestion = (taskIndex: number) => {
    const task = roomTasks[taskIndex];
    const qObj = task?.taskQuestions?.[0];
    if (!task || !qObj) return;

    const rawAns = taskInputs[qObj.id] || '';
    const check = validateTaskAnswer(rawAns, qObj.validationSpec, capturedFlag);

    if (check.ok) {
      const stepKey = `step-${taskIndex + 1}`;
      setCompletedSteps((prev) => ({ ...prev, [stepKey]: true }));
      setTaskFeedback((prev) => ({
        ...prev,
        [qObj.id]: {
          ok: true,
          msg: qObj.explanationOnSuccess || check.reason,
        },
      }));

      if (taskIndex === 2 || taskIndex === 3) {
        onUpdateProgress(activeModule.id, {
          deliberatePracticeCompleted: true,
          labsCompleted: 1,
        });
      }
    } else {
      const currentHintIdx = Math.max(0, (hintLevels[qObj.id] ?? 1) - 1);
      const hintMsg = qObj.progressiveHints[currentHintIdx] || qObj.hint;
      setTaskFeedback((prev) => ({
        ...prev,
        [qObj.id]: {
          ok: false,
          msg: `${check.reason} · ${hintMsg}`,
        },
      }));
    }
  };

  // Submit 5-Question Active Recall Quiz (requires all 5 answered and >= 60% to pass)
  const handleQuizSubmit = () => {
    const questions = activeModule.activeRecallQuestions;
    if (Object.keys(selectedAnswers).length < questions.length) {
      return;
    }

    let correct = 0;
    questions.forEach((q: ActiveRecallQuestion) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct += 1;
      } else {
        const missedConcept = `${activeModule.number} · Refuerzo: ${q.id.toUpperCase()}`;
        const alreadyExists = moduleCards.some((c) => c.question === q.question);
        if (!alreadyExists) {
          onCreateFlashcardFromModule(
            activeModule,
            missedConcept,
            q.question,
            `${q.options[q.correctIndex]}. ${q.explanation}`
          );
        }
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    setQuizSubmitted(true);
    setQuizLastScore(score);

    onUpdateProgress(activeModule.id, {
      activeRecallScore: Math.max(progress.activeRecallScore, score),
    });

    if (score >= 60) {
      setCompletedSteps((prev) => ({ ...prev, 'step-2': true }));
    }
  };

  // Submit Independent Transfer Scenario in Step 5
  const handleTransferSubmit = () => {
    if (transferSelected === null) return;
    setTransferSubmitted(true);
    const isCorrect = transferSelected === activeModule.transferScenarioQuestion.correctIndex;
    const transferScore = isCorrect ? 100 : 0;

    onUpdateProgress(activeModule.id, {
      evaluationScore: Math.max(progress.evaluationScore, transferScore),
      delayedTransferPassed: isCorrect || Boolean(progress.delayedTransferPassed),
    });
  };

  // Evaluate Self-Explanation
  const handleEvaluateSelfExplanation = async () => {
    const res = evaluateSelfExplanationLocal(
      explanationDraft,
      activeModule.selfExplanationPrompt.keyTerms
    );
    setExplanationResult(res);

    onUpdateProgress(activeModule.id, {
      selfExplanationScore: Math.max(progress.selfExplanationScore, res.score),
      selfExplanationText: explanationDraft,
    });

    if (res.score >= 60) {
      setCompletedSteps((prev) => ({ ...prev, 'step-5': true }));
    }

    if (explanationDraft.trim().length >= 15) {
      setAiEvaluating(true);
      try {
        const aiRes = await askAIMentor({
          question: `Evalúa socráticamente esta autoexplicación del estudiante sobre "${activeModule.selfExplanationPrompt.question}": "${explanationDraft}". Conceptos esperados: ${activeModule.selfExplanationPrompt.keyTerms.join(', ')}.`,
          learningStyle,
          activeModule,
          mode: 'evaluate_self_explanation',
        });
        setAiEvaluationFeedback(aiRes.reply);
        setAiEvaluationSource(aiRes.source);
      } finally {
        setAiEvaluating(false);
      }
    }
  };

  const totalLessonsCount = unifiedLessons.length;

  const stepsMeta = [
    {
      num: 1,
      shortTitle: `Task 1 · Teoría (${totalLessonsCount} Lecciones)`,
      subtitle: 'Paso a Paso + Anatomía + Cheat Sheet',
      hasVM: false,
    },
    {
      num: 2,
      shortTitle: 'Task 2 · Arquitectura y Quiz',
      subtitle: 'Diagrama + Caso Real + 5 Preguntas',
      hasVM: false,
    },
    {
      num: 3,
      shortTitle: 'Task 3 · Laboratorio en VM',
      subtitle: deepExtras.scaffoldingLevel,
      hasVM: true,
    },
    {
      num: 4,
      shortTitle: 'Task 4 · Código y Hardening',
      subtitle: 'Vulnerable vs. Seguro + Parcheo VM',
      hasVM: true,
    },
    {
      num: 5,
      shortTitle: 'Task 5 · Transferencia y DSR',
      subtitle: 'Escenario + Autoexplicación + Mazo',
      hasVM: false,
    },
  ];

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const completionPercent = Math.min(
    100,
    Math.max(masteryLevel * 33, Math.round((completedCount / 5) * 100))
  );

  const q1 = task1?.taskQuestions?.[0];
  const q3 = task3?.taskQuestions?.[0];
  const q4 = task4?.taskQuestions?.[0];

  const allQuizAnswered =
    Object.keys(selectedAnswers).length === activeModule.activeRecallQuestions.length;

  // Whether the persistent right-side VM workbench is shown alongside the left guide
  const showSideBySideVM = splitScreenEnabled || activeStep === 3 || activeStep === 4;
  const activeVMCommandBlocks =
    activeStep === 4 ? task4?.commandBlocks ?? [] : task3?.commandBlocks ?? [];
  const activeVMScaffolding =
    activeStep === 4
      ? task4?.scaffoldingLevel ?? deepExtras.scaffoldingLevel
      : task3?.scaffoldingLevel ?? deepExtras.scaffoldingLevel;

  const lessonsToDisplay =
    activeLessonIdx === -1
      ? unifiedLessons
      : [unifiedLessons[Math.min(activeLessonIdx, unifiedLessons.length - 1)]].filter(
          Boolean
        );

  return (
    <div
      className={`${
        showSideBySideVM ? 'max-w-[1600px]' : 'max-w-5xl'
      } mx-auto space-y-5 transition-all duration-200`}
    >
      {/* Top TryHackMe-Style Room Header */}
      <div className="bg-[#161E2E] border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onBackToPath}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#88CC14]" />
              Mapa de Rutas
            </button>
            <span className="text-slate-600 font-mono">/</span>
            <span className="text-xs font-mono text-[#88CC14] font-semibold uppercase">
              {deepExtras.careerPath}
            </span>
            <span className="text-slate-600 font-mono">/</span>
            <span className="text-xs font-mono text-slate-200">
              Sala {activeModule.number}
            </span>
          </div>

          {/* AI Learning Profile Selector right in the Room Header */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0F172A] p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 px-2">
              Tu Modo IA:
            </span>
            {(Object.keys(LEARNING_STYLE_META) as LearningStyle[]).map((styleKey) => {
              const meta = LEARNING_STYLE_META[styleKey];
              const isSelected = learningStyle === styleKey;
              return (
                <button
                  key={styleKey}
                  type="button"
                  onClick={() => onChangeLearningStyle(styleKey)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#88CC14] text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title={meta.description}
                >
                  {meta.shortLabel}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!prevModule}
              onClick={() => prevModule && onSelectModule(prevModule.id)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Anterior
            </button>
            <button
              type="button"
              disabled={!nextModule}
              onClick={() => nextModule && onSelectModule(nextModule.id)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              Siguiente <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Room Title + Target Machine Bar + Primary Controls */}
        <div className="pt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded font-bold bg-[#88CC14] text-slate-950 whitespace-nowrap">
                SALA {activeModule.number} ({currentIndex + 1} DE {modules.length})
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-300 whitespace-nowrap">
                MÁQUINA OBJETIVO: {vmNode.hostname} ({vmNode.ip})
              </span>
              {deepExpansion?.competencyBadge && (
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 inline-flex items-center gap-1 whitespace-nowrap">
                  <Award className="w-3 h-3 text-[#88CC14]" />
                  {deepExpansion.competencyBadge.code}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {activeModule.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {activeModule.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* TryHackMe Start AttackBox Split-Screen Button */}
            <button
              type="button"
              onClick={() => setSplitScreenEnabled((prev) => !prev)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-colors cursor-pointer ${
                showSideBySideVM
                  ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-xs'
                  : 'bg-[#0F172A] hover:bg-slate-800 border-sky-500/50 text-sky-300'
              }`}
            >
              <Columns2 className="w-4 h-4 text-sky-400" />
              {showSideBySideVM
                ? 'Ocultar AttackBox Lateral'
                : 'Iniciar AttackBox (Pantalla Dividida)'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAiDrawer((prev) => !prev);
                if (aiHistory.length === 0) {
                  handleAskSocraticTutor(
                    `Explícame con una analogía sencilla los fundamentos de "${activeModule.title}" según mi perfil (${LEARNING_STYLE_META[learningStyle].shortLabel}).`,
                    'simplify_for_beginner'
                  );
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Mentor IA Personalizado
            </button>

            <div className="bg-[#0F172A] border border-slate-800 rounded-xl px-3.5 py-2 w-40">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Avance Sala</span>
                <span className="font-mono font-bold text-[#88CC14] tabular-nums">
                  {completionPercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#88CC14] transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5-Task TryHackMe-Style Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-5 pt-4 border-t border-slate-800">
          {stepsMeta.map((step) => {
            const isCurrent = activeStep === step.num;
            const isDone = completedSteps[`step-${step.num}`];
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveStep(step.num)}
                className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#88CC14] border-[#88CC14] text-slate-950 shadow-sm'
                    : isDone
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200 hover:bg-emerald-950/70'
                      : 'bg-[#0F172A] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-mono font-bold">{step.shortTitle}</span>
                  {isDone ? (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isCurrent ? 'text-slate-950' : 'text-[#88CC14]'
                      }`}
                    />
                  ) : step.hasVM ? (
                    <Terminal
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isCurrent ? 'text-slate-950' : 'text-sky-400'
                      }`}
                    />
                  ) : null}
                </div>
                <p
                  className={`text-[11px] mt-0.5 truncate ${
                    isCurrent ? 'text-slate-900 font-medium' : 'text-slate-400'
                  }`}
                >
                  {step.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Flag Captured Celebration Banner */}
      {capturedFlag && (
        <div className="bg-[#0F172A] border-2 border-[#88CC14] rounded-2xl p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#88CC14] text-slate-950 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#88CC14] font-bold">
                <span>¡BANDERA CAPTURADA EN ATTACKBOX LINUX!</span>
                {deepExpansion?.competencyBadge && (
                  <span>· {deepExpansion.competencyBadge.code}</span>
                )}
              </div>
              <p className="text-sm font-mono font-bold text-white mt-0.5">
                {capturedFlag}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeStep !== 3 && (
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-3.5 py-2 rounded-xl bg-[#88CC14] text-slate-950 font-bold text-xs cursor-pointer"
              >
                Ir a Task 3 para Validar Bandera
              </button>
            )}
          </div>
        </div>
      )}

      {/* Collapsible Personalized AI Mentor Drawer */}
      {showAiDrawer && (
        <div className="bg-[#161E2E] border-2 border-[#88CC14] rounded-2xl p-5 text-white shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#88CC14] text-slate-950 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                  Mentor IA Personalizado ({LEARNING_STYLE_META[learningStyle].badge})
                  {aiSource === 'ai' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#88CC14]/20 text-[#88CC14] border border-[#88CC14]/40">
                      IA EN VIVO · GEMINI FLASH
                    </span>
                  )}
                  {aiSource === 'local-adaptive' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      MOTOR ADAPTATIVO LOCAL ACTIVO
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">
                  Explica lecciones con analogías, analiza tus comandos en la terminal y te guía con 1 pregunta a la vez.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#0F172A] p-1 rounded-lg border border-slate-800">
                {[1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTutorHintLevel(lvl)}
                    className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer ${
                      tutorHintLevel === lvl
                        ? 'bg-[#88CC14] text-slate-950 font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Pista Nv.{lvl}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowAiDrawer(false)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
            {aiHistory.map((turn, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl text-xs sm:text-sm whitespace-pre-wrap leading-relaxed ${
                  turn.role === 'user'
                    ? 'bg-slate-800/90 text-slate-100 ml-8 border border-slate-700'
                    : 'bg-[#0F172A] text-slate-200 mr-4 border border-slate-800'
                }`}
              >
                <div className="text-[10px] font-mono uppercase text-[#88CC14] mb-1">
                  {turn.role === 'user'
                    ? 'Tú'
                    : `Mentor IA (${LEARNING_STYLE_META[learningStyle].shortLabel})`}
                </div>
                {turn.role === 'assistant' ? renderFormattedAIText(turn.content) : turn.content}
              </div>
            ))}
            {aiLoading && (
              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-xs font-mono text-[#88CC14]">
                Analizando tu contexto y preparando explicación personalizada...
              </div>
            )}
          </div>

          {/* Quick Follow-Up Prompt Chips for Beginners */}
          {aiSuggestedChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {aiSuggestedChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskSocraticTutor(chip, 'socratic')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-sky-300 cursor-pointer"
                >
                  ✨ {chip}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAskSocraticTutor();
              }}
              placeholder="Pregúntale a la IA sobre esta lección, un comando o pide una analogía..."
              className="flex-1 bg-[#0F172A] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#88CC14]"
            />
            <button
              type="button"
              onClick={() => handleAskSocraticTutor()}
              disabled={aiLoading}
              className="px-4 py-2.5 rounded-xl bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar a la IA
            </button>
          </div>
        </div>
      )}

      {/* Main Responsive Grid: Single-column or Split-Screen (Left Task Content + Right Persistent AttackBox VM) */}
      <div
        className={
          showSideBySideVM
            ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'
            : 'space-y-6'
        }
      >
        {/* LEFT PANE: Active Task Content */}
        <div className={showSideBySideVM ? 'lg:col-span-6 space-y-6' : 'space-y-6'}>
          {/* =====================================================================
              STEP 1: TEORÍA ORGANIZADA POR PESTAÑAS Y LECCIONES PASO A PASO (1 A 6)
             ===================================================================== */}
          {activeStep === 1 && task1 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="bg-[#1C2538] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#E11D48] text-white">
                    Task 1 de 5
                  </span>
                  <h2 className="text-base sm:text-lg font-bold">{task1.title}</h2>
                </div>
                <span className="text-xs font-mono text-[#88CC14]">
                  Estudio Organizado Paso a Paso
                </span>
              </div>

              {/* Clean Sub-Navigation Tabs inside Task 1 so the beginner is never overwhelmed */}
              <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTask1SubTab('lessons')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      task1SubTab === 'lessons'
                        ? 'bg-[#161E2E] text-[#88CC14] shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    1. Lecciones Paso a Paso ({Object.keys(readLessons).length}/{totalLessonsCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTask1SubTab('anatomy')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      task1SubTab === 'anatomy'
                        ? 'bg-[#161E2E] text-[#88CC14] shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    2. Anatomía (4 Fases) y Tabla Resumen
                  </button>

                  <button
                    type="button"
                    onClick={() => setTask1SubTab('cheatsheet')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      task1SubTab === 'cheatsheet'
                        ? 'bg-[#161E2E] text-[#88CC14] shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    3. Cheat Sheet de Comandos y Glosario
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-500">
                  Avanza a tu ritmo sin muros de texto
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* SUB-TAB 1: STEP-BY-STEP LESSONS (1 TO 6) */}
                {task1SubTab === 'lessons' && (
                  <div className="space-y-6">
                    {/* Interactive Lesson Selector Bar */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-mono uppercase text-slate-700 font-bold">
                          SELECCIONA LA LECCIÓN ACTUAL (O LEE DE LA 1 A LA {totalLessonsCount} EN ORDEN):
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveLessonIdx((prev) => (prev === -1 ? 0 : -1))
                          }
                          className="text-xs font-mono text-[#3F6212] hover:underline font-bold cursor-pointer"
                        >
                          {activeLessonIdx === -1
                            ? 'Volver al Modo Paso a Paso (1 por vez)'
                            : `Ver las ${totalLessonsCount} lecciones juntas`}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {unifiedLessons.map((les) => {
                          const isCurrent = activeLessonIdx === les.index;
                          const isRead = Boolean(readLessons[les.index]);
                          return (
                            <button
                              key={les.index}
                              type="button"
                              onClick={() => setActiveLessonIdx(les.index)}
                              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-[#161E2E] text-[#88CC14] border-[#161E2E] shadow-2xs'
                                  : isRead
                                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              {isRead && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                              <span>Lección {les.index + 1}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Render Active Lesson(s) */}
                    <div className="space-y-5">
                      {lessonsToDisplay.map((les) => (
                        <div
                          key={les.index}
                          className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-2xs space-y-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div>
                              <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-[#3F6212] text-xs font-mono font-bold">
                                {les.lessonBadge}
                              </span>
                              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1.5">
                                {les.title}
                              </h3>
                            </div>

                            {/* Personalized AI Explain Button per Lesson */}
                            <button
                              type="button"
                              onClick={() =>
                                handleAskSocraticTutor(
                                  `Explícame la "${les.lessonBadge}: ${les.title}" de forma sencilla según mi estilo (${LEARNING_STYLE_META[learningStyle].shortLabel}) y ponme un ejemplo claro.`,
                                  'simplify_for_beginner'
                                )
                              }
                              className="px-3.5 py-2 rounded-xl bg-[#161E2E] hover:bg-slate-800 text-[#88CC14] text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Explicar esta lección con IA
                            </button>
                          </div>

                          {/* Paragraphs */}
                          <div className="space-y-3.5">
                            {les.paragraphs.map((p, pIdx) => (
                              <p
                                key={pIdx}
                                className="text-sm sm:text-base text-slate-800 leading-relaxed"
                              >
                                {p}
                              </p>
                            ))}
                          </div>

                          {/* Key Takeaways */}
                          {les.keyTakeaways.length > 0 && (
                            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                              <span className="text-xs font-mono uppercase text-emerald-950 font-bold block">
                                LO MÁS IMPORTANTE DE ESTA LECCIÓN:
                              </span>
                              <ul className="space-y-1">
                                {les.keyTakeaways.map((kt, kIdx) => (
                                  <li
                                    key={kIdx}
                                    className="text-xs sm:text-sm text-slate-800 flex items-start gap-2"
                                  >
                                    <span className="text-[#3F6212] font-bold">✓</span>
                                    <span>{kt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Executable Command / Snippet */}
                          {les.codeOrCommandExample && (
                            <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[11px] font-mono uppercase text-[#88CC14] font-bold">
                                  COMANDO / EJEMPLO PRÁCTICO DE ESTA LECCIÓN
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCommand(les.codeOrCommandExample!)}
                                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                                  >
                                    <Copy className="w-3 h-3" />
                                    {copiedCmdToast === les.codeOrCommandExample
                                      ? 'Copiado'
                                      : 'Copiar'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSendCommandToVM(
                                        les.codeOrCommandExample!.split('\n')[0],
                                        les.title
                                      )
                                    }
                                    className="px-2.5 py-1 rounded bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                                  >
                                    <Terminal className="w-3 h-3" />
                                    Probar en AttackBox
                                  </button>
                                </div>
                              </div>
                              <pre className="text-xs font-mono text-slate-100 overflow-x-auto whitespace-pre-wrap">
                                {les.codeOrCommandExample}
                              </pre>
                            </div>
                          )}

                          {/* Step-by-Step Lesson Navigation Footer */}
                          {activeLessonIdx !== -1 && (
                            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                              <button
                                type="button"
                                disabled={les.index === 0}
                                onClick={() => setActiveLessonIdx(Math.max(0, les.index - 1))}
                                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Lección Anterior
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setReadLessons((prev) => ({ ...prev, [les.index]: true }));
                                  if (les.index < unifiedLessons.length - 1) {
                                    setActiveLessonIdx(les.index + 1);
                                  } else {
                                    setTask1SubTab('anatomy');
                                  }
                                }}
                                className="px-4 py-2.5 rounded-xl bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                {les.index < unifiedLessons.length - 1
                                  ? `Marcar comprendida e ir a Lección ${les.index + 2}`
                                  : 'Completar Lecciones y ver Anatomía en 4 Fases'}
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* "Predice antes de ver" Active Micro-Pause */}
                    {activeModule.predictionPrompt && (
                      <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono uppercase text-amber-900 font-bold flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            PAUSA DE PREDICCIÓN ACTIVA (PIENSA ANTES DE REVELAR)
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          {activeModule.predictionPrompt.question}
                        </p>
                        {!predictionRevealed ? (
                          <button
                            type="button"
                            onClick={() => setPredictionRevealed(true)}
                            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ya pensé mi predicción · Comprobar explicación
                          </button>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-white border border-amber-300 text-xs sm:text-sm text-slate-800 leading-relaxed">
                            <strong className="text-emerald-800">Comprobación:</strong>{' '}
                            {activeModule.predictionPrompt.reveal}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* SUB-TAB 2: 4-PHASE ANATOMY & TECHNICAL REFERENCE TABLE */}
                {task1SubTab === 'anatomy' && (
                  <div className="space-y-6">
                    {deepExpansion?.attackDefenseAnatomy && (
                      <div className="rounded-2xl bg-[#161E2E] text-white p-5 sm:p-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-mono uppercase tracking-wider text-[#88CC14] font-bold">
                              ANATOMÍA COMPLETA DE ATAQUE Y DEFENSA (4 FASES)
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                              Cómo ocurre el fallo técnico, cómo se detecta y cómo se erradica
                            </h3>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {deepExpansion.attackDefenseAnatomy.map((phaseItem, pIdx) => {
                            const colors = [
                              'text-rose-400',
                              'text-amber-400',
                              'text-sky-400',
                              'text-[#88CC14]',
                            ];
                            return (
                              <div
                                key={pIdx}
                                className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1.5"
                              >
                                <span
                                  className={`text-xs font-mono font-bold block ${
                                    colors[pIdx % colors.length]
                                  }`}
                                >
                                  {phaseItem.phase.toUpperCase()} · {phaseItem.title}
                                </span>
                                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                                  {phaseItem.technicalDetail}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {task1.referenceTable && (
                      <div className="rounded-xl border border-slate-300 overflow-hidden">
                        <div className="bg-[#161E2E] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-mono uppercase tracking-wider text-[#88CC14] font-semibold">
                            {task1.referenceTable.caption}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            Tabla de Referencia Técnica
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-100 border-b border-slate-300 text-xs font-mono uppercase text-slate-700">
                                <th className="py-3 px-4">Concepto / Técnica</th>
                                <th className="py-3 px-4">Especificación</th>
                                <th className="py-3 px-4">Impacto en Seguridad</th>
                                <th className="py-3 px-4">Comando / Uso Práctico</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                              {task1.referenceTable.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50">
                                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                    {row.item}
                                  </td>
                                  <td className="py-3 px-4 font-mono text-slate-700">
                                    {row.specification}
                                  </td>
                                  <td className="py-3 px-4 text-slate-700">{row.securityImpact}</td>
                                  <td className="py-3 px-4 font-mono text-[#1E293B] bg-slate-50/70">
                                    {row.practicalCommandOrUsage}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setTask1SubTab('cheatsheet')}
                        className="px-4 py-2 rounded-xl bg-[#161E2E] text-[#88CC14] text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        Ir a Cheat Sheet de Comandos y Glosario
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 3: CHEAT SHEET & GLOSSARY */}
                {task1SubTab === 'cheatsheet' && (
                  <div className="space-y-6">
                    {deepExpansion?.commandCheatSheet &&
                      deepExpansion.commandCheatSheet.length > 0 && (
                        <div className="rounded-2xl border border-slate-300 bg-slate-900 text-white overflow-hidden">
                          <div className="bg-[#161E2E] px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-mono uppercase tracking-wider text-[#88CC14] font-bold">
                                CHEAT SHEET INTERACTIVO DE COMANDOS DE CAMPO
                              </span>
                              <p className="text-xs text-slate-400">
                                Haz clic en &quot;Ejecutar en AttackBox&quot; para abrir la consola lateral y probar cada comando en vivo.
                              </p>
                            </div>
                          </div>

                          <div className="divide-y divide-slate-800">
                            {deepExpansion.commandCheatSheet.map((item, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                              >
                                <div className="space-y-1">
                                  <code className="text-xs sm:text-sm font-mono font-bold text-[#88CC14] bg-slate-950 px-2.5 py-1 rounded border border-slate-800 inline-block">
                                    {item.command}
                                  </code>
                                  <p className="text-xs text-slate-200 pt-1">
                                    <strong className="text-sky-400">Desglose de banderas:</strong>{' '}
                                    {item.flagsBreakdown}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    <strong className="text-slate-300">Cuándo usarlo:</strong>{' '}
                                    {item.whenToUse}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCommand(item.command)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    {copiedCmdToast === item.command ? 'Copiado' : 'Copiar'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSendCommandToVM(item.command, item.flagsBreakdown)
                                    }
                                    className="px-3 py-1.5 rounded-lg bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Terminal className="w-3.5 h-3.5" />
                                    Ejecutar en AttackBox
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {activeModule.glossary && activeModule.glossary.length > 0 && (
                      <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase text-sky-900 font-bold">
                          <BookOpen className="w-4 h-4 text-sky-700" />
                          GLOSARIO DE TÉRMINOS CLAVE PARA PRINCIPIANTES:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {activeModule.glossary.map((g, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg bg-white border border-sky-100 text-xs space-y-1"
                            >
                              <span className="font-mono font-bold text-slate-900">
                                {g.term}
                              </span>
                              <p className="text-slate-600 leading-relaxed">{g.definition}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TryHackMe-Style "Answer the questions below" Box for Task 1 */}
                {q1 && (
                  <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-mono uppercase tracking-wider text-[#E11D48] font-bold">
                        RESPONDE LA PREGUNTA DE TASK 1 PARA MARCARLA COMPLETADA:
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          handleAskSocraticTutor(
                            `Necesito una pista socrática para responder esta pregunta de la Task 1: "${q1.questionPrompt}"`,
                            'socratic'
                          )
                        }
                        className="text-xs font-mono text-[#3F6212] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        Pedir ayuda a la IA con esta pregunta
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{q1.questionPrompt}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={taskInputs[q1.id] || ''}
                        onChange={(e) =>
                          setTaskInputs((prev) => ({ ...prev, [q1.id]: e.target.value }))
                        }
                        placeholder={q1.placeholder}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleVerifyTaskQuestion(0)}
                        className="px-5 py-2.5 rounded-xl bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-xs sm:text-sm shrink-0 cursor-pointer"
                      >
                        Validar Respuesta
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdvanceHint(q1.id)}
                        className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Pista ({hintLevels[q1.id] || 0}/3)
                      </button>
                    </div>

                    {(hintLevels[q1.id] ?? 0) > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                        {q1.progressiveHints.slice(0, hintLevels[q1.id]).map((h, i) => (
                          <p key={i}>• {h}</p>
                        ))}
                      </div>
                    )}

                    {taskFeedback[q1.id] && (
                      <div
                        className={`p-3 rounded-xl border text-xs font-medium ${
                          taskFeedback[q1.id].ok
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        {taskFeedback[q1.id].msg}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleAskSocraticTutor(
                        `Explícame con un ejemplo sencillo las lecciones técnicas de "${activeModule.title}".`,
                        'simplify_for_beginner'
                      )
                    }
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Bot className="w-4 h-4 text-[#3F6212]" />
                    Pedir analogía al Mentor IA
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-3 rounded-xl bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-sm flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    Ir a Task 2 (Arquitectura, Caso Real y Quiz de 5 Preguntas)
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              STEP 2: CASO REAL + DIAGRAMA + ACTIVE RECALL (5 PREGUNTAS, MÍN 60%)
             ===================================================================== */}
          {activeStep === 2 && task2 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="bg-[#1C2538] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#E11D48] text-white">
                    Task 2 de 5
                  </span>
                  <h2 className="text-base sm:text-lg font-bold">
                    Arquitectura Visual, Caso Real y Cuestionario Active Recall (5 Preguntas)
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#88CC14]">
                  Exige responder las 5 y obtener ≥ 60%
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-4">
                  {task2.readingParagraphs.map((p, idx) => (
                    <p key={idx} className="text-sm sm:text-base text-slate-800 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800">
                  <ArchitectureDiagram
                    diagramType={activeModule.diagramType}
                    caption={activeModule.diagramCaption}
                  />
                </div>

                {/* 5-Question Active Recall Quiz */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-[#E11D48] font-bold">
                        TÉCNICA 1 · ACTIVE RECALL (5 PREGUNTAS CON OPCIONES DISTRIBUIDAS A/B/C/D)
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                        Responde las {activeModule.activeRecallQuestions.length} preguntas sin apuntes (mínimo 60% para superar el paso)
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-700 font-bold">
                      Mejor puntaje Active Recall: {progress.activeRecallScore}%
                    </span>
                  </div>

                  {activeModule.activeRecallQuestions.map((q, qIdx) => {
                    const selected = selectedAnswers[q.id];
                    const isCorrect = selected === q.correctIndex;
                    return (
                      <div
                        key={q.id}
                        className="p-5 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm sm:text-base font-bold text-slate-900">
                            Pregunta {qIdx + 1} de {activeModule.activeRecallQuestions.length}: {q.question}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              handleAskSocraticTutor(
                                `Sin darme la letra correcta, explícame el concepto detrás de esta pregunta de Active Recall: "${q.question}"`,
                                'simplify_for_beginner'
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-mono text-[#3F6212] font-bold shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Pista IA
                          </button>
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => {
                            const isChosen = selected === oIdx;
                            let style =
                              'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-400';
                            if (quizSubmitted) {
                              if (oIdx === q.correctIndex) {
                                style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                              } else if (isChosen && oIdx !== q.correctIndex) {
                                style = 'border-rose-400 bg-rose-50 text-rose-950';
                              }
                            } else if (isChosen) {
                              style = 'border-[#161E2E] bg-[#161E2E] text-white font-semibold';
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => {
                                  if (!quizSubmitted) {
                                    setSelectedAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                                  }
                                }}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 cursor-pointer ${style}`}
                              >
                                <span className="font-mono font-bold">
                                  {String.fromCharCode(65 + oIdx)}.
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div
                            className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                : 'bg-amber-50 border-amber-300 text-amber-950'
                            }`}
                          >
                            <p className="font-bold">
                              {isCorrect
                                ? '✓ ¡Respuesta Correcta!'
                                : '✗ Error detectado (Se ha añadido automáticamente una tarjeta de refuerzo a tu cola DSR):'}
                            </p>
                            <p>{q.explanation}</p>
                            <p className="text-slate-600 pt-1">
                              <strong>Confusión frecuente a evitar:</strong> {q.commonMisconception}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {quizSubmitted && quizLastScore !== null && (
                    <div
                      className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between ${
                        quizLastScore >= 60
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50 border-rose-300 text-rose-950'
                      }`}
                    >
                      <span>
                        {quizLastScore >= 60
                          ? `✓ ¡Task 2 Superada! Obtuviste ${quizLastScore}% en Active Recall (mínimo requerido: 60%).`
                          : `✗ Obtuviste ${quizLastScore}% (menor al 60% mínimo). Revisa las explicaciones diagnósticas y vuelve a intentarlo para completar Task 2.`}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!allQuizAnswered}
                        onClick={handleQuizSubmit}
                        className="px-5 py-2.5 rounded-xl bg-[#161E2E] hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs sm:text-sm cursor-pointer"
                      >
                        {allQuizAnswered
                          ? 'Calificar las 5 Respuestas'
                          : `Responde las ${activeModule.activeRecallQuestions.length} preguntas (${Object.keys(selectedAnswers).length}/${activeModule.activeRecallQuestions.length})`}
                      </button>
                      {quizSubmitted && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAnswers({});
                            setQuizSubmitted(false);
                            setQuizLastScore(null);
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
                        >
                          Reintentar Cuestionario
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveStep(3);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-3 rounded-xl bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-sm flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      Ir a Task 3: Laboratorio en Pantalla Dividida (AttackBox)
                      <Terminal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              STEP 3: EJERCICIO PRÁCTICO EN VM (GUÍA IZQUIERDA + ATTACKBOX DERECHA)
             ===================================================================== */}
          {activeStep === 3 && task3 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="bg-[#1C2538] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#88CC14] text-slate-950">
                    Task 3 de 5 · Laboratorio AttackBox
                  </span>
                  <h2 className="text-base sm:text-lg font-bold">{task3.title}</h2>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-mono bg-emerald-500/20 text-[#88CC14] border border-[#88CC14]/40">
                  AttackBox Derecha Activa: {vmNode.hostname} ({vmNode.ip})
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Beginner Orientation Banner for the Lab */}
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs sm:text-sm text-sky-950 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-sky-700" />
                    ¿Cómo resolver este laboratorio en la AttackBox (a tu derecha)?
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    En la ventana negra de la derecha tienes los <strong>Pasos Guiados (Paso 1, Paso 2, Paso 3)</strong>. Puedes hacer clic en <strong>&quot;Ejecutar Paso&quot;</strong> o escribir los comandos directamente en la consola hasta obtener la bandera <code className="font-mono font-bold">FLAG&#123;...&#125;</code>. Si algo falla, pulsa <strong>&quot;Explicar Consola con IA&quot;</strong>.
                  </p>
                </div>

                <div className="space-y-3">
                  {task3.readingParagraphs.map((p, idx) => (
                    <p key={idx} className="text-sm sm:text-base text-slate-800 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>

                {/* Quick Command Reference from Cheat Sheet */}
                {deepExpansion?.commandCheatSheet && (
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2.5">
                    <span className="text-xs font-mono uppercase text-[#88CC14] font-bold block">
                      COMANDOS RÁPIDOS DE APOYO PARA ESTE LABORATORIO:
                    </span>
                    <div className="space-y-2">
                      {deepExpansion.commandCheatSheet.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <code className="text-xs font-mono text-[#88CC14] font-bold">
                              {c.command}
                            </code>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {c.flagsBreakdown}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRunVMCommand(c.command, c.flagsBreakdown)}
                            className="px-2.5 py-1 rounded bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-mono font-bold text-[11px] shrink-0 cursor-pointer"
                          >
                            ▶ Enviar a AttackBox
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verify Task 3 Flag Question */}
                {q3 && (
                  <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-mono uppercase tracking-wider text-[#E11D48] font-bold">
                        VERIFICACIÓN DE BANDERA CAPTURADA EN LA ATTACKBOX:
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          handleAskSocraticTutor(
                            `Estoy en el laboratorio de la Task 3 de "${activeModule.title}". ¿Qué pasos debo seguir en la terminal para encontrar la bandera?`,
                            'socratic'
                          )
                        }
                        className="text-xs font-mono text-[#3F6212] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        ¿Atascado? Pedir guía a la IA
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{q3.questionPrompt}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={taskInputs[q3.id] || ''}
                        onChange={(e) =>
                          setTaskInputs((prev) => ({
                            ...prev,
                            [q3.id]: e.target.value,
                          }))
                        }
                        placeholder={q3.placeholder}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-[#161E2E]"
                      />
                      <button
                        type="button"
                        onClick={() => handleVerifyTaskQuestion(2)}
                        className="px-5 py-2.5 rounded-xl bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-xs sm:text-sm shrink-0 cursor-pointer"
                      >
                        Validar Bandera
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdvanceHint(q3.id)}
                        className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Pista ({hintLevels[q3.id] || 0}/3)
                      </button>
                    </div>

                    {(hintLevels[q3.id] ?? 0) > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                        {q3.progressiveHints.slice(0, hintLevels[q3.id]).map((h, i) => (
                          <p key={i}>• {h}</p>
                        ))}
                      </div>
                    )}

                    {taskFeedback[q3.id] && (
                      <div
                        className={`p-3 rounded-xl border text-xs font-medium ${
                          taskFeedback[q3.id].ok
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        {taskFeedback[q3.id].msg}
                      </div>
                    )}

                    <div className="pt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStep(4);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-6 py-3 rounded-xl bg-[#161E2E] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                      >
                        Continuar a Task 4: Código Vulnerable vs. Seguro y Parcheo
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================================
              STEP 4: AUDITORÍA DE CÓDIGO (VULNERABLE VS SEGURO) + DEFENSA EN VM
             ===================================================================== */}
          {activeStep === 4 && task4 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="bg-[#1C2538] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#88CC14] text-slate-950">
                    Task 4 de 5 · Defensa y Remediación
                  </span>
                  <h2 className="text-base sm:text-lg font-bold">{task4.title}</h2>
                </div>
                <span className="text-xs font-mono text-[#88CC14]">
                  Comparativa de Código + Hardening en Vivo
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-4">
                  {task4.readingParagraphs.map((p, idx) => (
                    <p key={idx} className="text-sm sm:text-base text-slate-800 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>

                {/* Side-by-Side Vulnerable vs. Hardened Code / Config Comparison */}
                {deepExpansion?.vulnerableVsSecureCode && (
                  <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-5 text-white space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-[#88CC14]" />
                        <div>
                          <span className="text-xs font-mono uppercase text-[#88CC14] font-bold block">
                            AUDITORÍA COMPARATIVA DE CÓDIGO / CONFIGURACIÓN
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            {deepExpansion.vulnerableVsSecureCode.title}
                          </h3>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleAskSocraticTutor(
                            `Explícame línea por línea la diferencia entre el código vulnerable y el código seguro en "${deepExpansion.vulnerableVsSecureCode.title}".`,
                            'simplify_for_beginner'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#88CC14] text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Explicar código con IA
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="rounded-xl bg-rose-950/30 border border-rose-500/40 p-3.5 space-y-2">
                        <span className="text-xs font-mono font-bold text-rose-300 block">
                          ✗ {deepExpansion.vulnerableVsSecureCode.vulnerableLabel}
                        </span>
                        <pre className="text-xs font-mono text-rose-100 overflow-x-auto whitespace-pre-wrap bg-slate-950/80 p-3 rounded-lg border border-rose-500/20">
                          {deepExpansion.vulnerableVsSecureCode.vulnerableSnippet}
                        </pre>
                        <p className="text-xs text-rose-200 leading-relaxed">
                          <strong>Por qué falla:</strong>{' '}
                          {deepExpansion.vulnerableVsSecureCode.vulnerableWhyItFails}
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/40 p-3.5 space-y-2">
                        <span className="text-xs font-mono font-bold text-[#88CC14] block">
                          ✓ {deepExpansion.vulnerableVsSecureCode.secureLabel}
                        </span>
                        <pre className="text-xs font-mono text-emerald-100 overflow-x-auto whitespace-pre-wrap bg-slate-950/80 p-3 rounded-lg border border-emerald-500/20">
                          {deepExpansion.vulnerableVsSecureCode.secureSnippet}
                        </pre>
                        <p className="text-xs text-emerald-200 leading-relaxed">
                          <strong>Por qué mitiga la causa raíz:</strong>{' '}
                          {deepExpansion.vulnerableVsSecureCode.secureWhyItWorks}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {q4 && (
                  <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#E11D48] font-bold">
                      VERIFICACIÓN DEL COMANDO O PARÁMETRO DE REMEDIACIÓN:
                    </p>
                    <p className="text-sm font-bold text-slate-900">{q4.questionPrompt}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={taskInputs[q4.id] || ''}
                        onChange={(e) =>
                          setTaskInputs((prev) => ({
                            ...prev,
                            [q4.id]: e.target.value,
                          }))
                        }
                        placeholder={q4.placeholder}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleVerifyTaskQuestion(3)}
                        className="px-5 py-2.5 rounded-xl bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-xs sm:text-sm shrink-0 cursor-pointer"
                      >
                        Confirmar Remediación
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdvanceHint(q4.id)}
                        className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Pista ({hintLevels[q4.id] || 0}/3)
                      </button>
                    </div>

                    {(hintLevels[q4.id] ?? 0) > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                        {q4.progressiveHints.slice(0, hintLevels[q4.id]).map((h, i) => (
                          <p key={i}>• {h}</p>
                        ))}
                      </div>
                    )}

                    {taskFeedback[q4.id] && (
                      <div
                        className={`p-3 rounded-xl border text-xs font-medium ${
                          taskFeedback[q4.id].ok
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        {taskFeedback[q4.id].msg}
                      </div>
                    )}

                    <div className="pt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStep(5);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-6 py-3 rounded-xl bg-[#161E2E] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                      >
                        Ir a Task 5: Transferencia + Autoexplicación + DSR
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================================
              STEP 5: CONSOLIDACIÓN (ESCENARIO DE TRANSFERENCIA + AUTOEXPLICACIÓN + DSR)
             ===================================================================== */}
          {activeStep === 5 && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="bg-[#1C2538] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#E11D48] text-white">
                      Task 5 de 5 · Cierre Cognitivo y Nivel 3 (Transferencia)
                    </span>
                    <h2 className="text-base sm:text-lg font-bold">
                      Escenario de Transferencia, Autoexplicación y Repetición Espaciada DSR
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-[#88CC14]">
                    Métricas honestas e independientes
                  </span>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* 1. Independent Transfer Challenge */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-[#E11D48] font-bold">
                          PRUEBA INDEPENDIENTE DE TRANSFERENCIA (REQUISITO PARA NIVEL 3)
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                          Aplica lo aprendido a un escenario nuevo no visto en el cuestionario inicial
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-slate-700 font-bold">
                        Puntaje de Transferencia: {progress.evaluationScore}%
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-slate-900">
                      {activeModule.transferScenarioQuestion.question}
                    </p>

                    <div className="space-y-2">
                      {activeModule.transferScenarioQuestion.options.map((opt, oIdx) => {
                        const isChosen = transferSelected === oIdx;
                        let style =
                          'border-slate-200 bg-white text-slate-800 hover:border-slate-400';
                        if (transferSubmitted) {
                          if (oIdx === activeModule.transferScenarioQuestion.correctIndex) {
                            style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                          } else if (isChosen) {
                            style = 'border-rose-400 bg-rose-50 text-rose-950';
                          }
                        } else if (isChosen) {
                          style = 'border-[#161E2E] bg-[#161E2E] text-white font-semibold';
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => {
                              if (!transferSubmitted) setTransferSelected(oIdx);
                            }}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 cursor-pointer ${style}`}
                          >
                            <span className="font-mono font-bold">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {transferSubmitted && (
                      <div
                        className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1 ${
                          transferSelected === activeModule.transferScenarioQuestion.correctIndex
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-amber-50 border-amber-300 text-amber-950'
                        }`}
                      >
                        <p className="font-bold">
                          {transferSelected === activeModule.transferScenarioQuestion.correctIndex
                            ? '✓ ¡Transferencia Verificada! Has desbloqueado el criterio de evaluación para Nivel 3 · Transferencia.'
                            : '✗ Diagnóstico del Escenario de Transferencia:'}
                        </p>
                        <p>{activeModule.transferScenarioQuestion.explanation}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={transferSelected === null}
                        onClick={handleTransferSubmit}
                        className="px-5 py-2.5 rounded-xl bg-[#161E2E] hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs sm:text-sm cursor-pointer"
                      >
                        Evaluar Escenario de Transferencia
                      </button>
                      {transferSubmitted && (
                        <button
                          type="button"
                          onClick={() => {
                            setTransferSelected(null);
                            setTransferSubmitted(false);
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
                        >
                          Reintentar Escenario
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. Self-Explanation Card */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-[#3F6212] font-bold">
                        TÉCNICA NEUROCOGNITIVA · AUTOEXPLICACIÓN CAUSAL (SELF-EXPLANATION)
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                        {activeModule.selfExplanationPrompt.question}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        Redacta una explicación con oraciones completas y conectores causales (<em>porque, por lo tanto, debido a, cuando</em>). Las listas sueltas de palabras clave sin explicación son rechazadas por la rúbrica.
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-xs text-slate-500 mr-1">
                          Conceptos técnicos a articular:
                        </span>
                        {activeModule.selfExplanationPrompt.keyTerms.map((term) => (
                          <span
                            key={term}
                            className="px-2 py-0.5 rounded bg-white border border-slate-300 text-xs font-mono text-slate-800"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={4}
                      value={explanationDraft}
                      onChange={(e) => setExplanationDraft(e.target.value)}
                      placeholder="Explica con tus propias palabras la relación causa-efecto del mecanismo y cómo actúa la defensa..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#161E2E]"
                    />

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleEvaluateSelfExplanation}
                        disabled={aiEvaluating}
                        className="px-5 py-2.5 rounded-xl bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        {aiEvaluating
                          ? 'Evaluando Autoexplicación...'
                          : 'Evaluar mi Autoexplicación (Rúbrica Causal + IA)'}
                      </button>
                    </div>

                    {explanationResult && (
                      <div
                        className={`p-4 rounded-xl border text-xs sm:text-sm space-y-2 ${
                          explanationResult.score >= 60
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-amber-50 border-amber-300 text-amber-950'
                        }`}
                      >
                        <p className="font-bold">
                          Puntaje de Rúbrica Estructural: {explanationResult.score}/100 ({explanationResult.qualityLabel})
                        </p>
                        <p>{explanationResult.feedback}</p>
                        {explanationResult.score >= 60 && (
                          <p className="text-slate-700 pt-1 border-t border-emerald-200">
                            <strong>Respuesta modelo para contrastar:</strong>{' '}
                            {activeModule.selfExplanationPrompt.exemplarAnswer}
                          </p>
                        )}
                      </div>
                    )}

                    {aiEvaluationFeedback && (
                      <div className="p-4 rounded-xl bg-[#161E2E] text-white text-xs sm:text-sm space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-xs text-[#88CC14] font-bold uppercase">
                            Observación Socrática Complementaria:
                          </p>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {aiEvaluationSource === 'ai'
                              ? 'Fuente: Gemini Flash'
                              : 'Fuente: Motor Adaptativo Local'}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed text-slate-200">
                          {aiEvaluationFeedback}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Integrated DSR Spaced Repetition Cards */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#161E2E] text-white space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-[#88CC14] font-bold">
                          MOTOR DE REPETICIÓN ESPACIADA (MODELO DSR · 4 CALIFICACIONES)
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                          Escribe tu respuesta de memoria antes de voltear cada tarjeta ({moduleCards.length} tarjetas en esta sala)
                        </h3>
                      </div>
                      <Brain className="w-5 h-5 text-[#88CC14]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {moduleCards.map((card) => {
                        const r = Math.round(calculateRetrievability(card) * 100);
                        const isRevealed = Boolean(revealedCardIds[card.id]);
                        const attemptText = cardAttemptInputs[card.id] || '';

                        return (
                          <div
                            key={card.id}
                            className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between gap-3"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-[#88CC14] font-bold">{card.concept}</span>
                                <span className="text-slate-400">
                                  S: {card.stability}d · D: {card.difficulty} · R: {r}%
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm font-semibold text-white">
                                {card.question}
                              </p>

                              {!isRevealed ? (
                                <div className="space-y-2 pt-1">
                                  <input
                                    type="text"
                                    value={attemptText}
                                    onChange={(e) =>
                                      setCardAttemptInputs((prev) => ({
                                        ...prev,
                                        [card.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Escribe qué recuerdas antes de ver la solución..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#88CC14]"
                                  />
                                  <button
                                    type="button"
                                    disabled={attemptText.trim().length < 2}
                                    onClick={() =>
                                      setRevealedCardIds((prev) => ({ ...prev, [card.id]: true }))
                                    }
                                    className="px-3.5 py-1.5 rounded-lg bg-[#88CC14] hover:bg-[#9be31b] disabled:opacity-40 text-slate-950 font-bold text-xs cursor-pointer"
                                  >
                                    Comprobar Respuesta Esperada
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="text-xs text-slate-400 bg-slate-950/70 p-2 rounded border border-slate-800">
                                    <strong>Tu intento:</strong> {attemptText}
                                  </div>
                                  <div className="text-xs text-slate-200 bg-slate-900/90 p-2.5 rounded border border-[#88CC14]/40">
                                    <strong className="text-[#88CC14]">Respuesta esperada:</strong>{' '}
                                    {card.expectedAnswer}
                                  </div>
                                </div>
                              )}
                            </div>

                            {isRevealed && (
                              <div className="space-y-2 pt-2 border-t border-slate-800">
                                <p className="text-[11px] font-mono text-slate-400">
                                  Califica tu recuperación (4 grados DSR):
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onRateCard(card.id, 'again');
                                      setRatedCardFeedback((prev) => ({
                                        ...prev,
                                        [card.id]: 'Otra vez (Olvido · reinicio a 1 día)',
                                      }));
                                    }}
                                    className="py-1.5 px-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-[11px] font-mono font-bold cursor-pointer"
                                  >
                                    Otra vez
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onRateCard(card.id, 'hard');
                                      setRatedCardFeedback((prev) => ({
                                        ...prev,
                                        [card.id]: 'Difícil (Intervalo conservador)',
                                      }));
                                    }}
                                    className="py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold cursor-pointer"
                                  >
                                    Difícil
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onRateCard(card.id, 'good');
                                      setRatedCardFeedback((prev) => ({
                                        ...prev,
                                        [card.id]: 'Bien (Intervalo óptimo DSR)',
                                      }));
                                    }}
                                    className="py-1.5 px-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-[11px] font-mono font-bold cursor-pointer"
                                  >
                                    Bien
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onRateCard(card.id, 'easy');
                                      setRatedCardFeedback((prev) => ({
                                        ...prev,
                                        [card.id]: 'Fácil (Intervalo extendido)',
                                      }));
                                    }}
                                    className="py-1.5 px-2 rounded-lg bg-[#88CC14]/20 hover:bg-[#88CC14]/30 border border-[#88CC14]/40 text-[#88CC14] text-[11px] font-mono font-bold cursor-pointer"
                                  >
                                    Fácil
                                  </button>
                                </div>
                                {ratedCardFeedback[card.id] && (
                                  <p className="text-[11px] font-mono text-[#88CC14]">
                                    ✓ {ratedCardFeedback[card.id]}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Custom Card */}
                    <div className="pt-3 border-t border-slate-800">
                      <p className="text-xs font-mono text-slate-300 mb-2">
                        + Añadir tarjeta personalizada a este módulo:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={customCardConcept}
                          onChange={(e) => setCustomCardConcept(e.target.value)}
                          placeholder="Concepto (ej. SUID 4000)"
                          className="bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={customCardQuestion}
                          onChange={(e) => setCustomCardQuestion(e.target.value)}
                          placeholder="Pregunta de memoria..."
                          className="bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customCardAnswer}
                            onChange={(e) => setCustomCardAnswer(e.target.value)}
                            placeholder="Respuesta esperada..."
                            className="flex-1 bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                !customCardConcept.trim() ||
                                !customCardQuestion.trim() ||
                                !customCardAnswer.trim()
                              )
                                return;
                              onCreateFlashcardFromModule(
                                activeModule,
                                customCardConcept.trim(),
                                customCardQuestion.trim(),
                                customCardAnswer.trim()
                              );
                              setCustomCardConcept('');
                              setCustomCardQuestion('');
                              setCustomCardAnswer('');
                              setCardSavedToast(true);
                              setTimeout(() => setCardSavedToast(false), 3000);
                            }}
                            className="px-3 py-2 rounded-lg bg-[#88CC14] text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                      {cardSavedToast && (
                        <p className="text-xs font-mono text-[#88CC14] mt-1.5">
                          ✓ Tarjeta añadida a tu mazo de repetición espaciada.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4. Personal Engineering Notebook */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
                      BITÁCORA DE INGENIERÍA POST-MORTEM EN ESTE MÓDULO
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={noteLearned}
                        onChange={(e) => setNoteLearned(e.target.value)}
                        placeholder="¿Qué mecanismo técnico aprendiste en esta sala?"
                        className="bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={noteErrors}
                          onChange={(e) => setNoteErrors(e.target.value)}
                          placeholder="¿Qué error cometiste y cómo lo corregiste?"
                          className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!noteLearned.trim()) return;
                            onSaveModuleNote(
                              `${activeModule.number} · ${activeModule.title}`,
                              noteLearned.trim(),
                              noteErrors.trim() || 'Ningún bloqueo reportado',
                              vmHistory.join(' ; ') || 'Práctica en terminal'
                            );
                            setNoteLearned('');
                            setNoteErrors('');
                            setNoteSavedToast(true);
                            setTimeout(() => setNoteSavedToast(false), 3000);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#161E2E] hover:bg-slate-800 text-white font-bold text-xs shrink-0 cursor-pointer"
                        >
                          Guardar Nota
                        </button>
                      </div>
                    </div>
                    {noteSavedToast && (
                      <p className="text-xs font-mono text-emerald-700 font-bold">
                        ✓ Nota guardada en el historial de este módulo.
                      </p>
                    )}
                    {moduleNotes.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        {moduleNotes.slice(0, 3).map((n) => (
                          <div
                            key={n.id}
                            className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700"
                          >
                            <strong>Aprendizaje:</strong> {n.whatLearned} ·{' '}
                            <span className="text-rose-700">
                              <strong>Error/Corrección:</strong> {n.errorsCommitted}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 5. Verified Direct References & Official Standards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                        RECURSOS TÉCNICOS Y GUÍAS DIRECTAS VERIFICADAS
                      </h4>
                      {activeModule.spanishVideos.map((vid, idx) => (
                        <a
                          key={idx}
                          href={vid.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg bg-white border border-slate-200 hover:border-slate-400 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {vid.title}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          </div>
                          <span className="text-[11px] font-mono text-[#3F6212] block mt-0.5">
                            {vid.author} · {vid.duration}
                          </span>
                          <p className="text-xs text-slate-600 mt-1">{vid.focus}</p>
                        </a>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                        ESTÁNDARES Y DOCUMENTACIÓN OFICIAL PRIMARIA
                      </h4>
                      {activeModule.officialDocs.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg bg-white border border-slate-200 hover:border-slate-400 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {doc.title}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            {doc.organization} · {doc.type}
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Finish Room / Next Room CTA */}
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={onBackToPath}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                    >
                      Volver al Mapa de Rutas
                    </button>

                    {nextModule && (
                      <button
                        type="button"
                        onClick={() => onSelectModule(nextModule.id)}
                        className="px-6 py-3 rounded-xl bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-sm flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        Continuar a la Sala {nextModule.number}: {nextModule.title}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANE: Sticky Interactive Linux AttackBox VM + Python/Bash Static Analyzer */}
        {showSideBySideVM && (
          <div className="lg:col-span-6 lg:sticky lg:top-20 space-y-4">
            <ExerciseVMWorkbench
              scaffoldingLevel={activeVMScaffolding}
              commandBlocks={activeVMCommandBlocks}
              vmNode={vmNode}
              vmUser={vmUser}
              vmCwd={vmCwd}
              vmInput={vmInput}
              onChangeVmInput={setVmInput}
              vmHistory={vmHistory}
              vmLogs={vmLogs}
              capturedFlag={capturedFlag}
              lastExecutedExplanation={lastExecutedExplanation}
              onRunCommand={handleRunVMCommand}
              onResetNode={() => initVmBanner(vmNode)}
              onExplainTerminalWithAI={(lastCmd, lastOut) => {
                handleAskSocraticTutor(
                  `Acabo de ejecutar "${lastCmd}" en la AttackBox Linux. Explícame qué significa la salida de la consola y qué comando debería probar a continuación.`,
                  'explain_terminal_command',
                  lastCmd,
                  lastOut
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
