import React, { useState } from 'react';
import type { CurriculumModule } from '../data/curriculumData';

interface ArchitectureDiagramProps {
  type?: CurriculumModule['diagramType'];
  diagramType?: CurriculumModule['diagramType'];
  caption: string;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({
  type,
  diagramType,
  caption,
}) => {
  const [inspectMode, setInspectMode] = useState<'architecture' | 'attack-defense'>('architecture');
  const resolvedType = type ?? diagramType ?? 'memory-stack';

  const renderDiagramContent = () => {
    switch (resolvedType) {
      case 'terminal-filesystem':
        return (
          <svg viewBox="0 0 760 230" className="w-full h-auto" role="img" aria-label={caption}>
            <rect x="10" y="10" width="740" height="210" rx="8" fill="#090D16" stroke="#1E293B" />
            {/* Left: FHS Tree */}
            <rect x="30" y="30" width="335" height="170" rx="6" fill="#0F172A" stroke="#38BDF8" />
            <text x="197" y="53" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">
              JERARQUÍA DE ARCHIVOS LINUX (FHS · /)
            </text>
            <text x="50" y="80" fill="#F8FAFC" fontSize="11" fontFamily="JetBrains Mono">/ (Raíz del Sistema)</text>
            <text x="65" y="103" fill="#88CC14" fontSize="11" fontFamily="JetBrains Mono">├── /home/auditor (pwd actual · .env)</text>
            <text x="65" y="125" fill="#E2E8F0" fontSize="11" fontFamily="JetBrains Mono">├── /etc (passwd, shadow, sshd_config)</text>
            <text x="65" y="147" fill="#38BDF8" fontSize="11" fontFamily="JetBrains Mono">├── /var/log (auth.log · auditoría)</text>
            <text x="65" y="169" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">└── /proc &amp; /root (Kernel y superusuario)</text>

            {/* Right: POSIX Permissions Breakdown */}
            <rect
              x="385"
              y="30"
              width="345"
              height="170"
              rx="6"
              fill="#0F172A"
              stroke={inspectMode === 'attack-defense' ? '#F59E0B' : '#10B981'}
            />
            <text x="557" y="53" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">
              {inspectMode === 'architecture'
                ? 'ANATOMÍA DE PERMISOS POSIX (ls -la)'
                : 'EXPOSICIÓN (.env 666) VS HARDENING (chmod 600)'}
            </text>

            <rect x="405" y="68" width="95" height="52" rx="4" fill="#1E293B" stroke="#88CC14" />
            <text x="452" y="89" textAnchor="middle" fill="#88CC14" fontSize="12" fontFamily="JetBrains Mono" fontWeight="700">rwx (7)</text>
            <text x="452" y="108" textAnchor="middle" fill="#CBD5E1" fontSize="10">Propietario (u)</text>

            <rect x="510" y="68" width="95" height="52" rx="4" fill="#1E293B" stroke="#38BDF8" />
            <text x="557" y="89" textAnchor="middle" fill="#38BDF8" fontSize="12" fontFamily="JetBrains Mono" fontWeight="700">
              {inspectMode === 'architecture' ? 'r-x (5)' : '--- (0)'}
            </text>
            <text x="557" y="108" textAnchor="middle" fill="#CBD5E1" fontSize="10">Grupo (g)</text>

            <rect
              x="615"
              y="68"
              width="95"
              height="52"
              rx="4"
              fill={inspectMode === 'attack-defense' ? '#7F1D1D' : '#1E293B'}
              stroke={inspectMode === 'attack-defense' ? '#EF4444' : '#64748B'}
            />
            <text x="662" y="89" textAnchor="middle" fill={inspectMode === 'attack-defense' ? '#FCA5A5' : '#E2E8F0'} fontSize="12" fontFamily="JetBrains Mono" fontWeight="700">
              {inspectMode === 'architecture' ? 'r-- (4)' : '--- (0)'}
            </text>
            <text x="662" y="108" textAnchor="middle" fill="#CBD5E1" fontSize="10">Otros (o)</text>

            <text x="557" y="148" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontFamily="JetBrains Mono">
              {inspectMode === 'architecture'
                ? 'r=4 (Lectura) · w=2 (Escritura) · x=1 (Ejecución)'
                : 'Vulnerable: -rw-rw-rw- (666) → Seguro: chmod 600 (-rw-------)'}
            </text>
            <text x="557" y="172" textAnchor="middle" fill="#94A3B8" fontSize="10">
              Un archivo oculto (.env) nunca sustituye a los permisos del kernel
            </text>
          </svg>
        );

      case 'memory-stack':
        return (
          <svg viewBox="0 0 760 230" className="w-full h-auto" role="img" aria-label={caption}>
            <rect x="10" y="10" width="740" height="210" rx="8" fill="#090D16" stroke="#1E293B" />
            {/* High to Low memory blocks */}
            <rect x="40" y="35" width="140" height="150" rx="4" fill="#0F172A" stroke="#334155" />
            <text x="110" y="60" textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">0x00400000 (.text)</text>
            <text x="110" y="95" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontWeight="600">Código Binario RX</text>
            <text x="110" y="125" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="JetBrains Mono">RIP apunta aquí</text>

            <rect x="210" y="35" width="150" height="150" rx="4" fill="#0F172A" stroke="#0284C7" />
            <text x="285" y="60" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="JetBrains Mono">HEAP (malloc/new)</text>
            <text x="285" y="95" textAnchor="middle" fill="#E2E8F0" fontSize="12">Crece hacia arriba →</text>
            <text x="285" y="130" textAnchor="middle" fill="#94A3B8" fontSize="11">Datos dinámicos</text>

            <rect x="395" y="35" width="325" height="150" rx="4" fill="#0F172A" stroke={inspectMode === 'attack-defense' ? '#F59E0B' : '#10B981'} />
            <text x="557" y="55" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontWeight="600">
              {inspectMode === 'architecture' ? 'STACK FRAME ( ← Crece hacia direcciones bajas )' : 'DESBORDAMIENTO DE BUFFER & STACK CANARY'}
            </text>
            <rect x="415" y="72" width="85" height="45" rx="3" fill="#1E293B" stroke="#475569" />
            <text x="457" y="98" textAnchor="middle" fill="#F8FAFC" fontSize="11" fontFamily="JetBrains Mono">buf[64]</text>

            <rect x="510" y="72" width="90" height="45" rx="3" fill="#064E3B" stroke="#10B981" />
            <text x="555" y="94" textAnchor="middle" fill="#A7F3D0" fontSize="10" fontFamily="JetBrains Mono">Stack Canary</text>
            <text x="555" y="108" textAnchor="middle" fill="#6EE7B7" fontSize="9" fontFamily="JetBrains Mono">0x00affb12...</text>

            <rect x="610" y="72" width="90" height="45" rx="3" fill={inspectMode === 'attack-defense' ? '#7F1D1D' : '#1E293B'} stroke="#EF4444" />
            <text x="655" y="94" textAnchor="middle" fill="#FCA5A5" fontSize="10" fontFamily="JetBrains Mono">Saved RIP</text>
            <text x="655" y="108" textAnchor="middle" fill="#FECACA" fontSize="9" fontFamily="JetBrains Mono">Ret Address</text>

            <text x="557" y="150" textAnchor="middle" fill="#94A3B8" fontSize="11">
              {inspectMode === 'architecture'
                ? 'RSP apunta al tope actual · RBP referencia el marco base'
                : 'Mitigación: Canary valida integridad antes de RET + NX impide ejecutar la pila'}
            </text>
          </svg>
        );

      case 'tcp-handshake':
        return (
          <svg viewBox="0 0 760 230" className="w-full h-auto" role="img" aria-label={caption}>
            <rect x="10" y="10" width="740" height="210" rx="8" fill="#090D16" stroke="#1E293B" />
            <rect x="60" y="35" width="150" height="160" rx="6" fill="#0F172A" stroke="#38BDF8" />
            <text x="135" y="65" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="600">Auditor (10.10.14.2)</text>
            <text x="135" y="85" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="JetBrains Mono">kali-ops</text>

            <rect x="550" y="35" width="150" height="160" rx="6" fill="#0F172A" stroke="#10B981" />
            <text x="625" y="65" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="600">Servidor (10.10.10.45)</text>
            <text x="625" y="85" textAnchor="middle" fill="#10B981" fontSize="11" fontFamily="JetBrains Mono">Puerto 8080/TCP</text>

            <line x1="220" y1="75" x2="535" y2="95" stroke="#38BDF8" strokeWidth="2" />
            <text x="380" y="75" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="JetBrains Mono">1. [SYN] Seq=0</text>

            <line x1="535" y1="125" x2="220" y2="145" stroke="#10B981" strokeWidth="2" />
            <text x="380" y="128" textAnchor="middle" fill="#10B981" fontSize="11" fontFamily="JetBrains Mono">2. [SYN, ACK] Seq=0, Ack=1 (Puerto Abierto)</text>

            <line x1="220" y1="168" x2="535" y2="185" stroke={inspectMode === 'attack-defense' ? '#F59E0B' : '#E2E8F0'} strokeWidth="2" />
            <text x="380" y="172" textAnchor="middle" fill={inspectMode === 'attack-defense' ? '#FBBF24' : '#E2E8F0'} fontSize="11" fontFamily="JetBrains Mono">
              {inspectMode === 'architecture'
                ? '3. [ACK] Seq=1, Ack=1 (Conexión Completa)'
                : '3. [RST] (Nmap -sS Half-Open Scan cierra sin completar)'}
            </text>
          </svg>
        );

      case 'owasp-sqli':
        return (
          <svg viewBox="0 0 760 230" className="w-full h-auto" role="img" aria-label={caption}>
            <rect x="10" y="10" width="740" height="210" rx="8" fill="#090D16" stroke="#1E293B" />
            <rect x="35" y="40" width="330" height="150" rx="6" fill="#0F172A" stroke="#EF4444" />
            <text x="200" y="65" textAnchor="middle" fill="#FCA5A5" fontSize="12" fontWeight="600">VULNERABLE: Concatenación de Cadena</text>
            <text x="55" y="95" fill="#E2E8F0" fontSize="10" fontFamily="JetBrains Mono">{"SELECT * FROM users WHERE user = '"}</text>
            <text x="55" y="118" fill="#F87171" fontSize="11" fontFamily="JetBrains Mono">{"' OR 1=1 --"} (Altera el AST SQL)</text>
            <text x="55" y="150" fill="#94A3B8" fontSize="11">Resultado: Devuelve todas las filas (SUPERADMIN)</text>

            <rect x="395" y="40" width="330" height="150" rx="6" fill="#0F172A" stroke="#10B981" />
            <text x="560" y="65" textAnchor="middle" fill="#6EE7B7" fontSize="12" fontWeight="600">SEGURO: Consulta Parametrizada ($1)</text>
            <text x="415" y="95" fill="#E2E8F0" fontSize="10" fontFamily="JetBrains Mono">{"PREPARE: SELECT * FROM users WHERE user = $1"}</text>
            <text x="415" y="118" fill="#38BDF8" fontSize="11" fontFamily="JetBrains Mono">{"BIND $1 = \"' OR 1=1 --\" (Literal puro)"}</text>
            <text x="415" y="150" fill="#94A3B8" fontSize="11">Resultado: 0 filas (Inyección neutralizada)</text>
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 760 230" className="w-full h-auto" role="img" aria-label={caption}>
            <rect x="10" y="10" width="740" height="210" rx="8" fill="#090D16" stroke="#1E293B" />
            <rect x="40" y="55" width="200" height="120" rx="6" fill="#0F172A" stroke="#38BDF8" />
            <text x="140" y="95" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="JetBrains Mono">CAPA 01 · ENTRADA / IDENTIDAD</text>
            <text x="140" y="122" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="600">
              {inspectMode === 'architecture' ? 'Superficie de Exposición' : 'Vector de Intrusión / IoC'}
            </text>
            <text x="140" y="145" textAnchor="middle" fill="#94A3B8" fontSize="10">Validación de privilegios</text>

            <line x1="240" y1="115" x2="280" y2="115" stroke="#475569" strokeWidth="2" />

            <rect x="280" y="55" width="200" height="120" rx="6" fill="#0F172A" stroke="#F59E0B" />
            <text x="380" y="95" textAnchor="middle" fill="#FBBF24" fontSize="11" fontFamily="JetBrains Mono">CAPA 02 · CONTROL / KERNEL</text>
            <text x="380" y="122" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="600">
              {inspectMode === 'architecture' ? 'Política & Telemetría' : 'Inspección Profunda (SIEM)'}
            </text>
            <text x="380" y="145" textAnchor="middle" fill="#94A3B8" fontSize="10">EUID / Firewall / Reglas Sigma</text>

            <line x1="480" y1="115" x2="520" y2="115" stroke="#475569" strokeWidth="2" />

            <rect x="520" y="55" width="200" height="120" rx="6" fill="#0F172A" stroke="#10B981" />
            <text x="620" y="95" textAnchor="middle" fill="#34D399" fontSize="11" fontFamily="JetBrains Mono">CAPA 03 · DEFENSA ACTIVA</text>
            <text x="620" y="122" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="600">
              {inspectMode === 'architecture' ? 'Arquitectura Hardened' : 'Contención & Remediación'}
            </text>
            <text x="620" y="145" textAnchor="middle" fill="#94A3B8" fontSize="10">Zero Trust · Mínimo Privilegio</text>
          </svg>
        );
    }
  };

  return (
    <div className="border border-slate-800 bg-slate-900/60 rounded-lg p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-mono text-sky-400">Diagrama Arquitectónico Interactivo</p>
          <p className="text-sm text-slate-300 mt-0.5">{caption}</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-md">
          <button
            type="button"
            onClick={() => setInspectMode('architecture')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              inspectMode === 'architecture'
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vista Arquitectónica
          </button>
          <button
            type="button"
            onClick={() => setInspectMode('attack-defense')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              inspectMode === 'attack-defense'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vector y Mitigación
          </button>
        </div>
      </div>

      {renderDiagramContent()}
    </div>
  );
};
