import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Check,
  RotateCcw,
  Eye,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Sparkles,
  HelpCircle,
  FolderOpen,
} from 'lucide-react';
import {
  runSecurityScriptSandbox,
  resetVMNodeState,
  type VMNode,
} from '../utils/vmEngine';

export interface VMLogLine {
  type: 'input' | 'output' | 'hint';
  text: string;
}

interface CommandBlockItem {
  label: string;
  command: string;
  explanation: string;
}

interface ExerciseVMWorkbenchProps {
  scaffoldingLevel: 'Guiado Paso a Paso' | 'Andamiaje con Pistas' | 'Resolución Autónoma';
  commandBlocks: CommandBlockItem[];
  vmNode: VMNode;
  vmUser: string;
  vmCwd: string;
  vmInput: string;
  onChangeVmInput: (val: string) => void;
  vmHistory: string[];
  vmLogs: VMLogLine[];
  capturedFlag: string | null;
  lastExecutedExplanation: string | null;
  onRunCommand: (rawCmd?: string, stepExplanation?: string) => void;
  onResetNode: () => void;
  onExplainTerminalWithAI?: (lastCommand: string, lastOutput: string) => void;
}

const BEGINNER_QUICK_COMMANDS = [
  { cmd: 'pwd', label: 'pwd (¿Dónde estoy?)', desc: 'Muestra la carpeta actual' },
  { cmd: 'ls -la', label: 'ls -la (Ver archivos)', desc: 'Lista archivos y permisos ocultos' },
  { cmd: 'whoami', label: 'whoami (¿Quién soy?)', desc: 'Muestra tu usuario actual' },
  { cmd: 'help', label: 'help (Ayuda)', desc: 'Muestra los comandos de esta sala' },
];

export const ExerciseVMWorkbench: React.FC<ExerciseVMWorkbenchProps> = ({
  scaffoldingLevel,
  commandBlocks,
  vmNode,
  vmUser,
  vmCwd,
  vmInput,
  onChangeVmInput,
  vmHistory,
  vmLogs,
  capturedFlag,
  lastExecutedExplanation,
  onRunCommand,
  onResetNode,
  onExplainTerminalWithAI,
}) => {
  const [vmTab, setVmTab] = useState<'terminal' | 'sandbox'>('terminal');
  const [activeObjectiveIdx, setActiveObjectiveIdx] = useState<number>(0);
  const [revealedCommands, setRevealedCommands] = useState<Record<number, boolean>>({});
  const [copiedIp, setCopiedIp] = useState(false);
  const [showBeginnerGuide, setShowBeginnerGuide] = useState(false);

  // Static Script Analyzer state
  const [sandboxLang, setSandboxLang] = useState<'python' | 'bash'>('python');
  const [sandboxCode, setSandboxCode] = useState(
    '#!/usr/bin/env python3\nimport socket\nimport subprocess\n\ntarget = "10.10.10.45"\ntry:\n    res = subprocess.run(["ping", "-c", "1", target], shell=False, check=True, timeout=3)\n    print(f"[+] Host {target} verificado de forma segura")\nexcept Exception as err:\n    print(f"[-] Error controlado: {err}")\n'
  );
  const [sandboxResult, setSandboxResult] = useState<ReturnType<
    typeof runSecurityScriptSandbox
  > | null>(null);

  const safeObjectiveIdx =
    commandBlocks && commandBlocks.length > 0
      ? Math.min(activeObjectiveIdx, commandBlocks.length - 1)
      : 0;
  const activeCmdObj = commandBlocks?.[safeObjectiveIdx];

  const lastCmd = vmHistory.length > 0 ? vmHistory[vmHistory.length - 1] : 'ls -la';
  const lastOut =
    [...vmLogs]
      .reverse()
      .find((l) => l.type === 'output' || l.type === 'hint')?.text || '';

  const handleCopyTargetIp = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(vmNode.ip).catch(() => {});
    }
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 1800);
  };

  return (
    <div className="space-y-3">
      {/* TryHackMe AttackBox & Target Machine Status Header */}
      <div className="rounded-2xl border-2 border-slate-800 bg-[#0D1117] overflow-hidden shadow-xl">
        {/* Top Target & Machine Status Bar */}
        <div className="bg-[#161E2E] px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[#88CC14] text-[11px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#88CC14]" />
              ATTACKBOX ACTIVA
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {vmNode.hostname}
            </span>
            <button
              type="button"
              onClick={handleCopyTargetIp}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-sky-300 flex items-center gap-1 cursor-pointer"
              title="Copiar dirección IP del objetivo"
            >
              <span>IP: {vmNode.ip}</span>
              <Copy className="w-3 h-3" />
              {copiedIp && <span className="text-[#88CC14] font-bold">Copiada</span>}
            </button>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1">
              <FolderOpen className="w-3 h-3 text-amber-400" />
              {vmCwd}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onExplainTerminalWithAI && (
              <button
                type="button"
                onClick={() => onExplainTerminalWithAI(lastCmd, lastOut)}
                className="px-2.5 py-1 rounded-lg bg-[#88CC14]/20 hover:bg-[#88CC14]/30 border border-[#88CC14]/50 text-[#88CC14] text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                title="La IA analiza tu último comando y te explica qué hacer ahora"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Explicar Consola con IA
              </button>
            )}

            <div className="flex items-center gap-1 bg-[#0F172A] p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setVmTab('terminal')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  vmTab === 'terminal'
                    ? 'bg-[#88CC14] text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Terminal
              </button>
              <button
                type="button"
                onClick={() => setVmTab('sandbox')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  vmTab === 'sandbox'
                    ? 'bg-[#88CC14] text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Script Sandbox
              </button>
            </div>
          </div>
        </div>

        {/* Compact Step-by-Step Lab Objectives inside the AttackBox Header */}
        {vmTab === 'terminal' && commandBlocks && commandBlocks.length > 0 && (
          <div className="bg-[#111827] px-4 py-3 border-b border-slate-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold mr-1">
                  PASOS GUIADOS:
                </span>
                {commandBlocks.map((cmdObj, cIdx) => {
                  const alreadyRan = vmHistory.includes(cmdObj.command);
                  const isSelected = safeObjectiveIdx === cIdx;
                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => setActiveObjectiveIdx(cIdx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#88CC14] text-slate-950 border-[#88CC14]'
                          : alreadyRan
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {alreadyRan && <Check className="w-3 h-3" />}
                      <span>Paso {cIdx + 1}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowBeginnerGuide((prev) => !prev)}
                className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showBeginnerGuide ? 'Ocultar ayuda básica' : '¿Nuevo en la terminal? Ver comandos básicos'}
              </button>
            </div>

            {/* Active Objective Compact Action Box */}
            {activeCmdObj && (
              <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {activeCmdObj.label}
                    </span>
                    {vmHistory.includes(activeCmdObj.command) && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[#88CC14] text-[10px] font-mono font-bold">
                        ✓ EJECUTADO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeCmdObj.explanation}
                  </p>
                  {(scaffoldingLevel === 'Guiado Paso a Paso' ||
                    revealedCommands[safeObjectiveIdx] ||
                    vmHistory.includes(activeCmdObj.command)) ? (
                    <code className="inline-block px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-[#88CC14]">
                      $ {activeCmdObj.command}
                    </code>
                  ) : (
                    <span className="inline-block text-[11px] font-mono text-amber-300">
                      Intenta escribir el comando abajo o pulsa &quot;Revelar comando&quot;
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!(
                    scaffoldingLevel === 'Guiado Paso a Paso' ||
                    revealedCommands[safeObjectiveIdx] ||
                    vmHistory.includes(activeCmdObj.command)
                  ) ? (
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedCommands((prev) => ({
                          ...prev,
                          [safeObjectiveIdx]: true,
                        }))
                      }
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Revelar comando
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onRunCommand(activeCmdObj.command, activeCmdObj.explanation);
                        if (safeObjectiveIdx < commandBlocks.length - 1) {
                          setActiveObjectiveIdx(safeObjectiveIdx + 1);
                        }
                      }}
                      className="px-3.5 py-2 rounded-lg bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Ejecutar Paso {safeObjectiveIdx + 1}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Beginner Quick Commands Helper */}
            {showBeginnerGuide && (
              <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30 space-y-2">
                <p className="text-[11px] text-sky-200">
                  <strong>Guía rápida desde cero:</strong> Haz clic en cualquiera de estos comandos básicos para ejecutarlo en la consola y ver qué responde Linux:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {BEGINNER_QUICK_COMMANDS.map((item) => (
                    <button
                      key={item.cmd}
                      type="button"
                      onClick={() => onRunCommand(item.cmd, item.desc)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-sky-500/30 text-xs font-mono text-sky-300 cursor-pointer"
                      title={item.desc}
                    >
                      ▶ {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {vmTab === 'terminal' ? (
          <div>
            {/* Flag Captured Banner inside Terminal */}
            {capturedFlag && (
              <div className="px-4 py-2 bg-[#88CC14]/20 border-b border-[#88CC14]/50 text-xs font-mono text-[#88CC14] font-bold flex items-center justify-between gap-2">
                <span>🎯 ¡BANDERA CAPTURADA EN CONSOLA!: {capturedFlag}</span>
                <span className="text-[11px] text-emerald-200">
                  Copiada automáticamente a la pregunta de Task 3
                </span>
              </div>
            )}

            {lastExecutedExplanation && (
              <div className="px-4 py-2 bg-emerald-950/60 border-b border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between gap-2">
                <span>
                  <strong>Qué acaba de hacer este comando:</strong> {lastExecutedExplanation}
                </span>
              </div>
            )}

            {/* Terminal Output Window */}
            <div className="p-4 h-80 overflow-y-auto font-mono text-xs space-y-2.5 bg-[#0D1117]">
              {vmLogs.map((log, index) => (
                <div key={index}>
                  {log.type === 'input' && (
                    <div className="text-[#88CC14] font-bold">{log.text}</div>
                  )}
                  {log.type === 'output' && (
                    <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {log.text}
                    </pre>
                  )}
                  {log.type === 'hint' && (
                    <div className="p-2.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-200 flex items-center justify-between gap-2">
                      <span>{log.text}</span>
                      {onExplainTerminalWithAI && (
                        <button
                          type="button"
                          onClick={() => onExplainTerminalWithAI(lastCmd, log.text)}
                          className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold shrink-0 cursor-pointer"
                        >
                          Ayuda IA
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Terminal Prompt Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onRunCommand();
              }}
              className="p-3 bg-[#161E2E] border-t border-slate-800 flex flex-wrap sm:flex-nowrap items-center gap-2"
            >
              <span className="text-xs font-mono text-[#88CC14] font-bold shrink-0">
                {vmUser}@{vmNode.hostname}:{vmCwd}$
              </span>
              <input
                type="text"
                value={vmInput}
                onChange={(e) => onChangeVmInput(e.target.value)}
                placeholder="Escribe un comando aquí (ej. ls -la, pwd, help)..."
                className="flex-1 bg-[#0D1117] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#88CC14]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
              >
                Ejecutar
              </button>
              <button
                type="button"
                onClick={() => {
                  resetVMNodeState(vmNode.id);
                  onResetNode();
                }}
                className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs shrink-0 cursor-pointer flex items-center gap-1"
                title="Reiniciar estado de archivos y permisos de este nodo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar
              </button>
            </form>
          </div>
        ) : (
          <div className="p-4 space-y-3 bg-[#0D1117]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSandboxLang('python');
                    setSandboxCode(
                      '#!/usr/bin/env python3\nimport socket\nimport subprocess\n\ntarget = "10.10.10.45"\ntry:\n    res = subprocess.run(["ping", "-c", "1", target], shell=False, check=True, timeout=3)\n    print(f"[+] Host {target} verificado de forma segura")\nexcept Exception as err:\n    print(f"[-] Error controlado: {err}")\n'
                    );
                    setSandboxResult(null);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer ${
                    sandboxLang === 'python'
                      ? 'bg-[#88CC14] text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Python 3
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSandboxLang('bash');
                    setSandboxCode(
                      '#!/usr/bin/env bash\nset -euo pipefail\n\ngrep "Failed password" auth.log | awk \'{print $11}\' | sort | uniq -c\n'
                    );
                    setSandboxResult(null);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer ${
                    sandboxLang === 'bash'
                      ? 'bg-[#88CC14] text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Bash POSIX
                </button>
                <span className="text-[11px] font-mono text-slate-400">
                  Verifica sintaxis y antipatrones de seguridad (shell=True, eval)
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const res = runSecurityScriptSandbox(sandboxLang, sandboxCode);
                  setSandboxResult(res);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Analizar y Validar Script
              </button>
            </div>

            <textarea
              rows={7}
              value={sandboxCode}
              onChange={(e) => setSandboxCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-[#88CC14]"
            />

            {sandboxResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono space-y-2 ${
                  sandboxResult.passed
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    {sandboxResult.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#88CC14]" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    )}
                    {sandboxResult.passed
                      ? `ANÁLISIS APROBADO (${sandboxResult.score}/100)`
                      : `ANÁLISIS RECHAZADO (${sandboxResult.score}/100)`}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap text-slate-200 bg-slate-950/80 p-2.5 rounded border border-slate-800">
                  {sandboxResult.output}
                </pre>
                <p className="leading-relaxed">{sandboxResult.feedback}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
