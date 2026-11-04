import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Check,
  RotateCcw,
  Eye,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import {
  runSecurityScriptSandbox,
  resetVMNodeState,
  type VMNodeState,
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
  vmNode: VMNodeState;
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
}

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
}) => {
  const [vmTab, setVmTab] = useState<'terminal' | 'sandbox'>('terminal');
  const [revealedCommands, setRevealedCommands] = useState<Record<number, boolean>>({});

  // Static Script Analyzer state
  const [sandboxLang, setSandboxLang] = useState<'python' | 'bash'>('python');
  const [sandboxCode, setSandboxCode] = useState(
    '#!/usr/bin/env python3\nimport socket\nimport subprocess\n\ntarget = "10.10.10.45"\ntry:\n    res = subprocess.run(["ping", "-c", "1", target], shell=False, check=True, timeout=3)\n    print(f"[+] Host {target} verificado de forma segura")\nexcept Exception as err:\n    print(f"[-] Error controlado: {err}")\n'
  );
  const [sandboxResult, setSandboxResult] = useState<ReturnType<
    typeof runSecurityScriptSandbox
  > | null>(null);

  return (
    <div className="space-y-4">
      {/* Progressive Scaffolding Command Cards */}
      {commandBlocks && commandBlocks.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
              {scaffoldingLevel === 'Guiado Paso a Paso'
                ? 'MODALIDAD GUIADA (SALAS 00–04): PULSA EN ORDEN O ESCRIBE EL COMANDO EN LA CONSOLA'
                : scaffoldingLevel === 'Andamiaje con Pistas'
                  ? 'MODALIDAD INTERMEDIA (SALAS 05–08): INTENTA ESCRIBIR EL COMANDO EN LA CONSOLA O REVELA LA AYUDA'
                  : 'MODALIDAD AUTÓNOMA SENIOR (SALAS 09–12): RESUELVE EL OBJETIVO EN LA TERMINAL'}
            </h3>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-300">
              Andamiaje: {scaffoldingLevel}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {commandBlocks.map((cmdObj, cIdx) => {
              const alreadyRan = vmHistory.includes(cmdObj.command);
              const isGuided = scaffoldingLevel === 'Guiado Paso a Paso';
              const isRevealed = isGuided || revealedCommands[cIdx] || alreadyRan;

              return (
                <div
                  key={cIdx}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                    alreadyRan
                      ? 'bg-emerald-50/60 border-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                          alreadyRan
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#88CC14] text-slate-950'
                        }`}
                      >
                        Objetivo {cIdx + 1}
                      </span>
                      {alreadyRan && (
                        <span className="text-xs font-mono text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Completado
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-xs font-bold ${
                        alreadyRan ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {cmdObj.label}
                    </p>

                    {isRevealed ? (
                      <code
                        className={`block p-2 rounded text-xs font-mono break-all ${
                          alreadyRan
                            ? 'bg-slate-900 text-[#88CC14]'
                            : 'bg-slate-950 text-[#88CC14]'
                        }`}
                      >
                        $ {cmdObj.command}
                      </code>
                    ) : (
                      <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
                        Comando oculto para entrenar memoria activa. Escríbelo abajo o pulsa &quot;Revelar sintaxis&quot;.
                      </div>
                    )}

                    <p
                      className={`text-xs leading-relaxed ${
                        alreadyRan ? 'text-slate-700' : 'text-slate-300'
                      }`}
                    >
                      {cmdObj.explanation}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!isRevealed && (
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedCommands((prev) => ({ ...prev, [cIdx]: true }))
                        }
                        className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Revelar sintaxis del comando
                      </button>
                    )}

                    {isRevealed && (
                      <button
                        type="button"
                        onClick={() => onRunCommand(cmdObj.command, cmdObj.explanation)}
                        className="w-full py-2 px-3 rounded-lg bg-[#88CC14] hover:bg-[#9be31b] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Ejecutar en Estación de Práctica
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Embedded Terminal & Static Script Analyzer */}
      <div className="rounded-2xl border-2 border-slate-800 bg-[#0D1117] overflow-hidden shadow-lg">
        <div className="bg-[#161E2E] px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#88CC14]" />
            <span className="text-xs font-mono font-bold text-white">
              Estación de Práctica · {vmNode.hostname} ({vmNode.ip}) · cwd: {vmCwd}
            </span>
            {capturedFlag && (
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#88CC14] text-slate-950">
                ✓ FLAG CAPTURADA: {capturedFlag}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-[#0F172A] p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setVmTab('terminal')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                vmTab === 'terminal'
                  ? 'bg-[#88CC14] text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Consola Linux Interactiva
            </button>
            <button
              type="button"
              onClick={() => setVmTab('sandbox')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                vmTab === 'sandbox'
                  ? 'bg-[#88CC14] text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Analizador Estático Python/Bash
            </button>
          </div>
        </div>

        {vmTab === 'terminal' ? (
          <div>
            {lastExecutedExplanation && (
              <div className="px-4 py-2.5 bg-emerald-950/60 border-b border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between gap-2">
                <span>
                  <strong>Explicación de la operación:</strong> {lastExecutedExplanation}
                </span>
              </div>
            )}

            <div className="p-4 h-72 overflow-y-auto font-mono text-xs space-y-2.5 bg-[#0D1117]">
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
                    <div className="p-2.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-200">
                      {log.text}
                    </div>
                  )}
                </div>
              ))}
            </div>

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
                placeholder="Escribe un comando (ej. help, pwd, ls -la, cd /tmp, sudo -l)..."
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
                Reiniciar VM
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
                  Verifica sintaxis real, balance de bloques y antipatrones de seguridad (shell=True, eval, except: pass)
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
