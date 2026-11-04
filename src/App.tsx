/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Play,
  Layers,
  ArrowLeft,
  Database,
  Compass,
} from 'lucide-react';
import { CURRICULUM_MODULES, type CurriculumModule } from './data/curriculumData';
import { generateModuleFlashcards } from './data/roomTasksData';
import {
  scheduleFSRSReview,
  calculateModuleMastery,
  type FSRSCard,
  type ModuleProgress,
  type Rating,
} from './utils/fsrs';
import {
  loadPersistedState,
  savePersistedState,
  clearPersistedState,
} from './utils/storage';
import { StudentDashboard, type EngineeringNote } from './components/StudentDashboard';
import { CurriculumView } from './components/CurriculumView';
import { PlacementTestModal, DataAndDeckModal } from './components/PlacementTestModal';
import {
  LEARNING_STYLE_META,
  type LearningStyle,
} from './utils/aiMentorEngine';

type ViewMode = 'path' | 'module';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('path');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('mod-00');
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(() => {
    try {
      const saved = localStorage.getItem('aegis_learning_style_v1');
      if (
        saved === 'visual_analogies' ||
        saved === 'step_by_step_commands' ||
        saved === 'deep_technical'
      ) {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'visual_analogies';
  });

  const handleChangeLearningStyle = (style: LearningStyle) => {
    setLearningStyle(style);
    try {
      localStorage.setItem('aegis_learning_style_v1', style);
    } catch {
      // ignore storage errors
    }
  };

  const [modules] = useState<CurriculumModule[]>(CURRICULUM_MODULES);

  const [initialState] = useState(() => loadPersistedState());
  const [progressMap, setProgressMap] = useState<Record<string, ModuleProgress>>(
    initialState.progressMap
  );
  const [cards, setCards] = useState<FSRSCard[]>(initialState.cards);
  const [notes, setNotes] = useState<EngineeringNote[]>(initialState.notes);

  useEffect(() => {
    savePersistedState({
      progressMap,
      cards,
      notes,
    });
  }, [progressMap, cards, notes]);

  // Real study-time tracker using Page Visibility API (increments 1 minute per 60s of active study in a module)
  useEffect(() => {
    if (viewMode !== 'module') return;
    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setProgressMap((prev) => {
        const existing: ModuleProgress = prev[selectedModuleId] ?? {
          moduleId: selectedModuleId,
          activeRecallScore: 0,
          selfExplanationScore: 0,
          selfExplanationText: '',
          deliberatePracticeCompleted: false,
          evaluationScore: 0,
          labsCompleted: 0,
          totalLabs: 1,
          practiceMinutes: 0,
          lastStudied: new Date().toISOString(),
        };
        return {
          ...prev,
          [selectedModuleId]: {
            ...existing,
            practiceMinutes: (existing.practiceMinutes || 0) + 1,
            lastStudied: new Date().toISOString(),
          },
        };
      });
    }, 60000);
    return () => window.clearInterval(interval);
  }, [viewMode, selectedModuleId]);

  const ensureModuleCardsUnlocked = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    setCards((prev) => {
      const hasModuleCards = prev.some((c) => c.moduleId === moduleId);
      if (hasModuleCards) return prev;
      const generated = generateModuleFlashcards(mod);
      return [...prev, ...generated];
    });
  };

  const handleOpenModule = (moduleId: string) => {
    ensureModuleCardsUnlocked(moduleId);
    setSelectedModuleId(moduleId);
    setViewMode('module');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProgress = (moduleId: string, partial: Partial<ModuleProgress>) => {
    ensureModuleCardsUnlocked(moduleId);
    setProgressMap((prev) => {
      const existing: ModuleProgress = prev[moduleId] ?? {
        moduleId,
        activeRecallScore: 0,
        selfExplanationScore: 0,
        selfExplanationText: '',
        deliberatePracticeCompleted: false,
        evaluationScore: 0,
        labsCompleted: 0,
        totalLabs: 1,
        practiceMinutes: 1,
        lastStudied: new Date().toISOString(),
      };
      return {
        ...prev,
        [moduleId]: {
          ...existing,
          ...partial,
          lastStudied: new Date().toISOString(),
        },
      };
    });
  };

  const handleRateCard = (cardId: string, rating: Rating) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? scheduleFSRSReview(c, rating, new Date()) : c))
    );
  };

  const handleCreateFlashcardFromModule = (
    module: CurriculumModule,
    concept: string,
    question: string,
    answer: string
  ) => {
    const newCard: FSRSCard = {
      id: `fsrs-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      moduleId: module.id,
      domain: module.domain,
      concept,
      question,
      expectedAnswer: answer,
      keyTerms: concept
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length >= 3)
        .slice(0, 4),
      stability: 0,
      difficulty: 5.5,
      reps: 0,
      lapses: 0,
      lastReview: null,
      nextReview: new Date().toISOString(),
      history: [],
    };
    setCards((prev) => [newCard, ...prev]);
  };

  const handleSaveModuleNote = (
    moduleTitle: string,
    whatLearned: string,
    errorsCommitted: string,
    commandsUsed: string
  ) => {
    const newNote: EngineeringNote = {
      id: `note-${Date.now()}`,
      date: new Date().toISOString(),
      targetId: selectedModuleId,
      targetTitle: moduleTitle,
      whatLearned,
      whatNotUnderstood: '',
      errorsCommitted,
      howSolved: whatLearned,
      commandsAndScripts: commandsUsed,
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleResetAll = () => {
    const fresh = clearPersistedState();
    setProgressMap(fresh.progressMap);
    setCards(fresh.cards);
    setNotes(fresh.notes);
    setSelectedModuleId('mod-00');
    setViewMode('path');
  };

  const totalRooms = modules.length;
  const masteredModulesCount = modules.filter((m) => {
    const p = progressMap[m.id];
    return p ? calculateModuleMastery(p) >= 2 : false;
  }).length;

  const recommendedModule =
    modules.find((m) => {
      const p = progressMap[m.id];
      return !p || calculateModuleMastery(p) < 2;
    }) ?? modules[0];

  const activeModuleCards = cards.filter((c) => c.moduleId === selectedModuleId);
  const activeModuleNotes = notes.filter((n) => n.targetId === selectedModuleId);

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F5F8] text-slate-900 selection:bg-[#88CC14]/30">
      {/* Top Navigation Bar (Clean 3-Zone Contract) */}
      <header className="sticky top-0 z-40 h-16 bg-[#151C2B] border-b border-slate-800 shadow-md">
        <div className="max-w-[1600px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Identity */}
          <button
            type="button"
            onClick={() => {
              setViewMode('path');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 text-left shrink-0 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#88CC14] flex items-center justify-center shadow-xs">
              <Shield className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
              AegisNeuro
            </span>
            <span className="hidden sm:inline text-xs font-mono text-slate-400 whitespace-nowrap">
              · {masteredModulesCount}/{totalRooms} Salas Dominadas
            </span>
          </button>

          {/* Zone 2: Navigation & Quick Tools */}
          <nav aria-label="Herramientas de Aprendizaje" className="flex items-center gap-2">
            {viewMode === 'module' ? (
              <button
                type="button"
                onClick={() => {
                  setViewMode('path');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#88CC14]" />
                Mapa de Rutas ({masteredModulesCount}/{totalRooms} Salas)
              </button>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlacementModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#88CC14]" />
                  <span>Test de Nivel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDataModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-[#88CC14]" />
                  <span>Mazo ({cards.length}) y Backup</span>
                </button>
              </div>
            )}

            <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-mono text-slate-300">
              <span className="text-[#88CC14] font-bold">IA:</span>
              <span>{LEARNING_STYLE_META[learningStyle].shortLabel}</span>
            </div>
          </nav>

          {/* Zone 3: Primary Action CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (viewMode === 'path') {
                  handleOpenModule(recommendedModule.id);
                } else {
                  setViewMode('path');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {viewMode === 'path'
                ? `Ir a Sala ${recommendedModule.number}`
                : 'Ver Todas las Rutas'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 py-7">
        {viewMode === 'path' ? (
          <StudentDashboard
            modules={modules}
            progressMap={progressMap}
            cards={cards}
            learningStyle={learningStyle}
            onChangeLearningStyle={handleChangeLearningStyle}
            onOpenModule={handleOpenModule}
            onRateCard={handleRateCard}
            onOpenPlacementTest={() => setShowPlacementModal(true)}
            onOpenDataModal={() => setShowDataModal(true)}
          />
        ) : (
          <CurriculumView
            modules={modules}
            selectedModuleId={selectedModuleId}
            onSelectModule={handleOpenModule}
            onBackToPath={() => {
              setViewMode('path');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            progressMap={progressMap}
            onUpdateProgress={handleUpdateProgress}
            moduleCards={activeModuleCards}
            onRateCard={handleRateCard}
            onCreateFlashcardFromModule={handleCreateFlashcardFromModule}
            moduleNotes={activeModuleNotes}
            onSaveModuleNote={handleSaveModuleNote}
            learningStyle={learningStyle}
            onChangeLearningStyle={handleChangeLearningStyle}
          />
        )}
      </main>

      {/* Modals for Placement Test & Deck/Data Management */}
      <PlacementTestModal
        isOpen={showPlacementModal}
        onClose={() => setShowPlacementModal(false)}
        onCompletePlacement={(scorePercent, unlockedIds, recommendedStartId) => {
          unlockedIds.forEach((modId) => {
            handleUpdateProgress(modId, {
              activeRecallScore: Math.max(75, scorePercent),
              selfExplanationScore: 70,
              deliberatePracticeCompleted: true,
            });
          });
          handleOpenModule(recommendedStartId);
        }}
      />

      <DataAndDeckModal
        isOpen={showDataModal}
        onClose={() => setShowDataModal(false)}
        cards={cards}
        modules={modules}
        onDeleteCard={(cardId) => {
          setCards((prev) => prev.filter((c) => c.id !== cardId));
        }}
        onCreateCustomCard={(modId, concept, question, answer) => {
          const mod = modules.find((m) => m.id === modId) ?? modules[0];
          handleCreateFlashcardFromModule(mod, concept, question, answer);
        }}
        onExportJson={() => {
          const jsonStr = JSON.stringify(
            {
              schemaVersion: 2,
              progressMap,
              cards,
              notes,
            },
            null,
            2
          );
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `aegisneuro-backup-${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        onImportJson={(rawJson) => {
          try {
            const parsed = JSON.parse(rawJson);
            if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.cards)) {
              return {
                ok: false,
                error: 'El archivo JSON no contiene un mazo válido de AegisNeuro.',
              };
            }
            if (parsed.progressMap) setProgressMap(parsed.progressMap);
            if (Array.isArray(parsed.cards)) setCards(parsed.cards);
            if (Array.isArray(parsed.notes)) setNotes(parsed.notes);
            return { ok: true };
          } catch {
            return { ok: false, error: 'El archivo no es un documento JSON válido.' };
          }
        }}
        onResetAllProgress={handleResetAll}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#151C2B] py-5 mt-12 text-slate-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#88CC14]" />
            <span className="font-semibold text-white">
              AegisNeuro · Plataforma Cognitiva de Ciberseguridad (Modelo DSR + Tutor Socrático)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <span>4 Rutas Progresivas</span>
            <span>•</span>
            <span>{totalRooms} Salas Paso a Paso (00 a 12)</span>
            <span>•</span>
            <span>Estación Linux Bajo Demanda</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
