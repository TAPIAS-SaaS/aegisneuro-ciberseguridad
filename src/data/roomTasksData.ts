/**
 * Deep Progressive Room Tasks (Sala 00 to Sala 12)
 * - 5 sequential tasks per room with technical reference tables, command blocks,
 *   3-level progressive hints, and strict answer validation specs (exact, regex, flag).
 * - Automatic FSRS flashcard generator (6-7 cards per room, including Cloze command cards)
 *   covering all 13 rooms (00 through 12).
 */

import type { CurriculumModule } from './curriculumData';
import type { TaskQuestionValidation } from '../utils/validation';
import type { FSRSCard } from '../utils/fsrs';

export interface TechnicalReferenceRow {
  item: string;
  specification: string;
  securityImpact: string;
  practicalCommandOrUsage: string;
}

export interface RoomTaskQuestion {
  id: string;
  questionPrompt: string;
  placeholder: string;
  acceptedAnswers: string[];
  validationSpec: TaskQuestionValidation;
  hint: string;
  progressiveHints: [string, string, string];
  explanationOnSuccess: string;
}

export interface RoomTask {
  taskNumber: number;
  title: string;
  type: 'theory-deep' | 'architecture-protocol' | 'attackbox-lab' | 'defense-hardening' | 'neuro-consolidation';
  badgeText: string;
  scaffoldingLevel: 'Guiado Paso a Paso' | 'Andamiaje con Pistas' | 'Resolución Autónoma';
  readingParagraphs: string[];
  referenceTable?: {
    caption: string;
    rows: TechnicalReferenceRow[];
  };
  commandBlocks: {
    label: string;
    command: string;
    explanation: string;
  }[];
  taskQuestions: RoomTaskQuestion[];
}

export const MODULE_DEEP_EXTRAS: Record<
  string,
  {
    careerPath:
      | 'Ruta 1 · Pre-Security y Fundamentos'
      | 'Ruta 2 · Pentesting y Seguridad Web'
      | 'Ruta 3 · Blue Team, SOC y Forense DFIR'
      | 'Ruta 4 · Red Teaming y Seguridad Cloud';
    targetIp: string;
    scaffoldingLevel: 'Guiado Paso a Paso' | 'Andamiaje con Pistas' | 'Resolución Autónoma';
    deepIntroParagraphs: string[];
    referenceTableCaption: string;
    referenceRows: TechnicalReferenceRow[];
    firstComprehensionQuestion: {
      prompt: string;
      placeholder: string;
      accepted: string[];
      regexPattern?: string;
      progressiveHints: [string, string, string];
    };
    labWalkthroughParagraphs: string[];
    labCommands: { label: string; command: string; explanation: string }[];
    labFlagAnswer: string;
    labQuestionPrompt: string;
    labProgressiveHints: [string, string, string];
    defenseDeepParagraphs: string[];
    defenseCommand: { label: string; command: string; explanation: string };
    defenseQuestion: {
      prompt: string;
      placeholder: string;
      accepted: string[];
      regexPattern?: string;
      hint: string;
      progressiveHints: [string, string, string];
    };
  }
> = {
  'mod-00': {
    careerPath: 'Ruta 1 · Pre-Security y Fundamentos',
    targetIp: '10.10.10.45',
    scaffoldingLevel: 'Guiado Paso a Paso',
    deepIntroParagraphs: [
      'Bienvenido a tu primera sala práctica. No necesitas haber usado Linux nunca: aquí aprenderás desde absoluto cero cómo comunicarte con un servidor mediante comandos claros y por qué los profesionales de ciberseguridad prefieren la consola frente al ratón.',
      'El sistema de archivos de Linux es como un árbol invertido cuya base es el directorio raíz `/`. Dentro de `/home/auditor` se encuentra tu carpeta de trabajo personal. Cada vez que escribes un comando como `pwd` (Print Working Directory) o `ls -la` (List All in Long format), el intérprete Bash le pide al núcleo del sistema operativo que te muestre tu ubicación y los permisos exactos de cada archivo.',
      'Además, antes de ejecutar cualquier herramienta de red aprenderás la regla más importante de nuestra profesión: la ética y la autorización legal. Un ingeniero o hacker ético jamás interactúa con direcciones IP fuera del alcance autorizado (Scope). En nuestros laboratorios usamos rangos internos privados (`10.10.10.0/24`) y el bloque oficial de documentación `203.0.113.0/24` (RFC 5737).',
    ],
    referenceTableCaption: 'Tus Primeros Comandos Esenciales en Linux y Lectura de Permisos POSIX',
    referenceRows: [
      {
        item: '`pwd` (Print Working Directory)',
        specification: 'Muestra la ruta absoluta del directorio actual',
        securityImpact: 'Evita ejecutar comandos o modificar archivos en la carpeta equivocada.',
        practicalCommandOrUsage: 'Ejecutar `pwd` al iniciar sesión -> `/home/auditor`.',
      },
      {
        item: '`ls -la` (List All + Long)',
        specification: 'Lista todos los archivos, incluidos los ocultos que empiezan con `.`',
        securityImpact: 'Permite descubrir archivos ocultos (`.bashrc`, `.ssh`, `.env`) y auditar quién es su propietario.',
        practicalCommandOrUsage: '`ls -la` muestra permisos como `-rw-r--r-- 1 auditor auditor`.',
      },
      {
        item: '`cat <archivo>` (Concatenate)',
        specification: 'Imprime el contenido de un archivo de texto en pantalla',
        securityImpact: 'Fundamental para leer notas operativas, archivos de configuración y logs sin abrir un editor.',
        practicalCommandOrUsage: '`cat bienvenida_terminal.txt`',
      },
      {
        item: 'Permisos `rwx` (4, 2, 1)',
        specification: '3 bloques: Propietario (User), Grupo (Group) y Otros (Others)',
        securityImpact: '`r` (4) = leer, `w` (2) = escribir, `x` (1) = ejecutar. Un permiso `755` equivale a `rwxr-xr-x`.',
        practicalCommandOrUsage: 'Restringir archivos privados con `chmod 600 archivo.txt`.',
      },
    ],
    firstComprehensionQuestion: {
      prompt: 'Según la tabla técnica superior, ¿qué comando de 3 letras imprime la ruta absoluta de la carpeta en la que te encuentras actualmente?',
      placeholder: 'Ej. comando de 3 letras',
      accepted: ['pwd'],
      progressiveHints: [
        'Empujón conceptual: Busca en la primera fila de la tabla el comando que significa "Print Working Directory".',
        'Concepto clave: No es `ls` (listar) ni `cat` (leer archivo), sino el comando que muestra tu directorio actual.',
        'Comando exacto: Escribe `pwd`.',
      ],
    },
    labWalkthroughParagraphs: [
      'En este paso se despliega tu Estación de Práctica conectada al nodo `srv-prod-01 (10.10.10.45)`. Como esta es tu primera sala, cuentas con **Andamiaje Guiado Paso a Paso**: puedes pulsar el botón de ejecución rápida o escribir el comando tú mismo en la consola.',
      'Primero comprobaremos tu usuario y carpeta actual con `pwd` y `ls -la`, y a continuación leeremos el archivo `bienvenida_terminal.txt` con el comando `cat` para obtener tu primera bandera verificada por la máquina virtual.',
    ],
    labCommands: [
      {
        label: 'Paso 1: Verificar directorio actual y listar archivos ocultos',
        command: 'ls -la',
        explanation: 'Muestra todos los archivos en `/home/auditor`, incluyendo `bienvenida_terminal.txt`.',
      },
      {
        label: 'Paso 2: Leer el archivo de bienvenida y capturar tu primera bandera',
        command: 'cat bienvenida_terminal.txt',
        explanation: 'Imprime el contenido del archivo de iniciación y registra la bandera en la VM.',
      },
    ],
    labFlagAnswer: 'FLAG{TERMINAL_BASICS_FIRST_DAY_READY}',
    labQuestionPrompt: 'Ejecuta `cat bienvenida_terminal.txt` en la terminal interactiva. ¿Cuál es la bandera (FLAG{...}) que aparece al final del archivo?',
    labProgressiveHints: [
      'Empujón conceptual: Para leer el contenido de un archivo de texto en Linux usamos el comando `cat` seguido del nombre del archivo.',
      'Concepto clave: El archivo se llama `bienvenida_terminal.txt` y está en tu directorio `/home/auditor`.',
      'Estructura del comando: Ejecuta `cat bienvenida_terminal.txt` en la consola de la derecha y copia la línea `FLAG{...}`.',
    ],
    defenseDeepParagraphs: [
      'Cuando administras un servidor Linux, proteger las claves privadas (como `.ssh/id_ed25519` o archivos `.env`) exige asignar permisos donde únicamente el propietario pueda leer y escribir, impidiendo cualquier acceso al grupo o a otros usuarios.',
      'En notación octal, dar lectura (`4`) + escritura (`2`) al propietario y cero (`0`) al grupo y a otros se representa como `600` (`-rw-------`).',
    ],
    defenseCommand: {
      label: 'Verificar tu identidad y grupos actuales en el sistema',
      command: 'id',
      explanation: 'Muestra tu UID numérico (1000) y los grupos a los que perteneces.',
    },
    defenseQuestion: {
      prompt: '¿Qué número octal de 3 dígitos en `chmod ___ clave_privada` asigna lectura y escritura únicamente al propietario (`rw-------`) y ningún permiso al grupo ni a otros?',
      placeholder: 'Ej. 3 dígitos octales',
      accepted: ['600', '0600', 'chmod 600'],
      regexPattern: '^(?:chmod\\s+)?0?600$',
      hint: 'Suma Lectura (4) + Escritura (2) = 6 para el propietario, y 0 para grupo y otros.',
      progressiveHints: [
        'Empujón conceptual: Recuerda que Lectura vale 4 y Escritura vale 2. El grupo y otros deben quedar en 0.',
        'Concepto clave: El primer dígito es 4 + 2 = 6; el segundo es 0; el tercero es 0.',
        'Valor exacto: Escribe `600`.',
      ],
    },
  },
  'mod-01': {
    careerPath: 'Ruta 1 · Pre-Security y Fundamentos',
    targetIp: '10.10.10.45',
    scaffoldingLevel: 'Guiado Paso a Paso',
    deepIntroParagraphs: [
      'Para convertirte en un profesional sólido en Ciberseguridad, debes comprender cómo funciona un programa por dentro. Cuando ejecutas cualquier aplicación en Linux o Windows, el sistema operativo crea un proceso y le asigna un espacio de memoria virtual aislado. Dentro de la CPU x86_64, el registro RIP (Instruction Pointer) apunta siempre a la dirección de la siguiente instrucción máquina.',
      'El espacio de direcciones virtuales de un proceso se divide en segmentos con permisos estrictos de página (Lectura `r`, Escritura `w`, Ejecución `x`): (1) Segmento `.text` (`r-xp`, código máquina compilado), (2) Segmentos `.data` y `.bss` (`rw-p`, variables globales), (3) El `[heap]` (memoria dinámica que crece hacia direcciones altas), y (4) El `[stack]` o Pila (estructura LIFO que almacena variables locales y la dirección de retorno Saved RIP, creciendo hacia direcciones bajas).',
      '¿Por qué ocurre un Buffer Overflow clásico? Porque mientras el Stack crece hacia direcciones menores, la escritura dentro de un arreglo local `char buffer[64]` avanza hacia direcciones mayores, en dirección al Saved RBP y al Saved RIP. Para mitigar esto, el kernel y el compilador aplican NX (pila `rw-p` no ejecutable), Stack Canaries y ASLR (`randomize_va_space = 2`).',
    ],
    referenceTableCaption: 'Anatomía de Registros x86_64, Segmentos de Memoria y Mitigaciones del Compilador',
    referenceRows: [
      {
        item: 'RIP (Instruction Pointer)',
        specification: 'Registro de 64 bits de control de flujo',
        securityImpact: 'Contiene la dirección exacta de la próxima instrucción a ejecutar. Objetivo primario de un exploit.',
        practicalCommandOrUsage: 'Se carga automáticamente al ejecutar la instrucción `ret` leyendo el tope del Stack.',
      },
      {
        item: 'RSP / RBP (Stack & Base Pointer)',
        specification: 'Delimitadores del Stack Frame activo',
        securityImpact: 'RSP apunta al tope de la pila; RBP sirve de referencia para acceder a variables locales (`[rbp-0x20]`).',
        practicalCommandOrUsage: 'Prólogo de función: `push rbp; mov rbp, rsp; sub rsp, 0x40`.',
      },
      {
        item: 'NX / DEP (No-eXecute)',
        specification: 'Bit de tabla de páginas de hardware',
        securityImpact: 'Marca el Stack y el Heap como `rw-p` (sin permiso `x`), impidiendo ejecutar shellcode inyectado en la pila.',
        practicalCommandOrUsage: 'Auditable en vivo mediante `cat /proc/self/maps` (permisos de página) y `checksec`.',
      },
      {
        item: 'Stack Canary (SSP)',
        specification: 'Valor centinela aleatorio en la pila',
        securityImpact: 'Se coloca entre el buffer local y el Saved RIP. Si cambia antes de `ret`, el programa aborta con `__stack_chk_fail`.',
        practicalCommandOrUsage: 'Auditable en cabeceras ELF con `checksec --file=/usr/local/bin/sysdiag`.',
      },
      {
        item: 'ASLR / PIE',
        specification: 'Aleatorización del espacio de memoria',
        securityImpact: 'Cambia en cada ejecución las direcciones base de Stack, Heap, libc y binario para frustrar saltos fijos.',
        practicalCommandOrUsage: 'Verificar estado en el kernel con `cat /proc/sys/kernel/randomize_va_space` (Valor 2 = Full).',
      },
    ],
    firstComprehensionQuestion: {
      prompt: 'Según la tabla técnica de arquitectura x86_64, ¿qué siglas de 3 letras identifican al registro que contiene la dirección de la próxima instrucción que ejecutará la CPU?',
      placeholder: 'Ej. Registro de 3 letras',
      accepted: ['rip'],
      progressiveHints: [
        'Empujón conceptual: Es el puntero de instrucción (Instruction Pointer) de 64 bits.',
        'Concepto clave: No es RSP (pila) ni RBP (base), sino el registro que se carga al ejecutar `ret`.',
        'Respuesta: Escribe `RIP`.',
      ],
    },
    labWalkthroughParagraphs: [
      'Vamos a inspeccionar cómo Linux organiza realmente los segmentos de memoria virtual de un proceso y cómo se auditan las protecciones de un binario ELF.',
      'Nota importante de realismo técnico: en un sistema Linux real, `cat /proc/self/maps` muestra exclusivamente los rangos hexadecimales y permisos de página (`r-xp`, `rw-p`), mientras que para ver las mitigaciones de compilación (`RELRO`, `Canary`, `NX`, `PIE`) e inspeccionar el binario debes ejecutar la herramienta `checksec --file=/usr/local/bin/sysdiag`.',
    ],
    labCommands: [
      {
        label: 'Paso 1: Inspeccionar las páginas de memoria virtual en /proc/self/maps',
        command: 'cat /proc/self/maps',
        explanation: 'Muestra los segmentos reales del proceso ([heap] y [stack] con permisos rw-p, sin bit x).',
      },
      {
        label: 'Paso 2: Auditar las mitigaciones ELF del binario con checksec y obtener la Flag',
        command: 'checksec --file=/usr/local/bin/sysdiag',
        explanation: 'Inspecciona la cabecera ELF (RELRO, Canary, NX, PIE) y emite la bandera de verificación arquitectónica.',
      },
    ],
    labFlagAnswer: 'FLAG{CPU_MEMORY_ASLR_NX_VERIFIED}',
    labQuestionPrompt: 'Ejecuta `checksec --file=/usr/local/bin/sysdiag` en la terminal interactiva tras revisar `/proc/self/maps`. ¿Cuál es la bandera (FLAG{...}) obtenida?',
    labProgressiveHints: [
      'Empujón conceptual: `/proc/self/maps` muestra las páginas de memoria, pero el análisis de cabeceras ELF y la bandera se obtienen con `checksec`.',
      'Concepto clave: Debes pasar el archivo `/usr/local/bin/sysdiag` a `checksec`.',
      'Estructura del comando: Ejecuta `checksec --file=/usr/local/bin/sysdiag` en la terminal.',
    ],
    defenseDeepParagraphs: [
      'Para erradicar las vulnerabilidades de corrupción de memoria aplicamos defensa en profundidad en tres niveles: (1) Código fuente: prohibir `gets`, `strcpy`, `sprintf` y usar alternativas con límite (`fgets`, `snprintf`) o lenguajes con seguridad de memoria.',
      '(2) Compilación: exigir `-fstack-protector-strong`, `-Wl,-z,relro,-z,now` y `-fPIE -pie`. (3) Kernel: asegurar que `/proc/sys/kernel/randomize_va_space` tenga el valor `2` (ASLR completo).',
    ],
    defenseCommand: {
      label: 'Verificar estado de ASLR en el Kernel',
      command: 'cat /proc/sys/kernel/randomize_va_space',
      explanation: 'Confirma que el kernel aplica aleatorización total (valor 2).',
    },
    defenseQuestion: {
      prompt: '¿Qué valor numérico devuelve `/proc/sys/kernel/randomize_va_space` cuando ASLR completo (incluyendo Stack, Libs, PIE y Heap) está habilitado en el kernel Linux?',
      placeholder: 'Valor numérico (0, 1 o 2)',
      accepted: ['2'],
      hint: 'Ejecuta `cat /proc/sys/kernel/randomize_va_space` en la terminal.',
      progressiveHints: [
        'Empujón conceptual: 0 significa desactivado y 1 significa parcial.',
        'Concepto clave: El nivel máximo de aleatorización en el kernel Linux es el entero superior a 1.',
        'Estructura del comando: Ejecuta `cat /proc/sys/kernel/randomize_va_space` (el resultado es `2`).',
      ],
    },
  },
  'mod-02': {
    careerPath: 'Ruta 1 · Pre-Security y Fundamentos',
    targetIp: '10.10.10.45',
    scaffoldingLevel: 'Guiado Paso a Paso',
    deepIntroParagraphs: [
      'Un sistema operativo moderno actúa como el árbitro absoluto de recursos e identidades. Tanto en Linux como en Windows Server, casi todas las brechas críticas pasan por una fase de Escalada de Privilegios Local (pasar de un usuario limitado como `auditor` hacia `root` o `NT AUTHORITY\\SYSTEM`).',
      'En Linux, cada proceso tiene un Real UID (quién inició el proceso) y un Effective UID (EUID, qué identidad evalúa el kernel para otorgar acceso). Cuando un ejecutable tiene activo el bit especial SUID (valor octal `4000`, visible como una `s` en `-rwsr-xr-x`), el kernel lanza el proceso asignando como `EUID` el UID del propietario del archivo (`root`, UID 0).',
      'Adicionalmente, el kernel Linux divide el poder de `root` en privilegios granulares llamados **Linux Capabilities** (`cap_setuid`, `cap_net_raw`). Como las Capabilities se guardan en atributos extendidos del inodo (`security.capability`), un binario como `/usr/bin/python3.10` con `cap_setuid+ep` NO tiene el bit SUID activo y jamás aparecerá en `find / -perm -4000`; para descubrirlo es obligatorio ejecutar `getcap -r / 2>/dev/null`.',
    ],
    referenceTableCaption: 'Permisos Especiales POSIX, Linux Capabilities y Tokens de Privilegio en Windows Server',
    referenceRows: [
      {
        item: 'Bit SUID (Octal 4000)',
        specification: 'Permiso `-rwsr-xr-x` en binarios ejecutables',
        securityImpact: 'Ejecuta el binario con el Effective UID (EUID) del propietario del archivo (`root`).',
        practicalCommandOrUsage: 'Buscar en todo el disco: `find / -perm -4000 -type f 2>/dev/null`.',
      },
      {
        item: 'Linux Capabilities (`cap_setuid+ep`)',
        specification: 'Atributos extendidos en el inodo (`security.capability`)',
        securityImpact: 'Permite llamar a `setuid(0)` para obtener root sin tener el bit SUID clásico activo.',
        practicalCommandOrUsage: 'Enumerar capacidades: `getcap -r / 2>/dev/null`.',
      },
      {
        item: 'Archivo `/etc/shadow`',
        specification: 'Almacén de hashes con Salt (`-rw-r----- root:shadow`)',
        securityImpact: 'Contiene los hashes de contraseñas (`$y$` yescrypt). Si es legible, permite crackeo offline.',
        practicalCommandOrUsage: 'Verificar permisos: `ls -la /etc/passwd /etc/shadow`.',
      },
      {
        item: 'Remediación de SUID (`chmod u-s`)',
        specification: 'Revocación del bit 4000 dejando el archivo en `0755` (`-rwxr-xr-x`)',
        securityImpact: 'Impide que el binario eleve el EUID a 0 al ser invocado por usuarios no privilegiados.',
        practicalCommandOrUsage: '`chmod u-s /usr/local/bin/sysdiag` (o `chmod 0755 /usr/local/bin/sysdiag`).',
      },
    ],
    firstComprehensionQuestion: {
      prompt: 'Según la explicación y la tabla técnica, ¿qué comando específico permite enumerar las Linux Capabilities (`cap_setuid+ep`) en todo el sistema de archivos cuando `find / -perm -4000` no las muestra?',
      placeholder: 'Ej. comando -r / 2>/dev/null',
      accepted: ['getcap', 'getcap -r /', 'getcap -r / 2>/dev/null'],
      regexPattern: '^getcap(?:\\s+-r\\s+\\/(?:\\s+2>\\/dev\\/null)?)?$',
      progressiveHints: [
        'Empujón conceptual: Busca en la segunda fila de la tabla la herramienta que lee `security.capability`.',
        'Concepto clave: El comando empieza por `get` seguido de `cap` (capabilities).',
        'Estructura del comando: Escribe `getcap -r / 2>/dev/null` o `getcap`.',
      ],
    },
    labWalkthroughParagraphs: [
      'Estás conectado como el usuario `auditor` en `srv-prod-01 (10.10.10.45)`. Realizaremos una auditoría completa de escalada de privilegios y su posterior remediación en el mismo sistema.',
      'Observa cómo `find / -perm -4000 2>/dev/null` lista los binarios SUID (como `/usr/local/bin/sysdiag`), mientras que `getcap -r / 2>/dev/null` revela las capacidades en `python3.10`. Luego ejecutaremos `/usr/local/bin/sysdiag --root-shell` para obtener la bandera como `root`, y en la Tarea 4 revocaremos el bit SUID con `chmod u-s /usr/local/bin/sysdiag` comprobando que el exploit deja de funcionar.',
    ],
    labCommands: [
      {
        label: 'Paso 1: Enumerar binarios con bit SUID (Octal 4000)',
        command: 'find / -perm -4000 2>/dev/null',
        explanation: 'Descubre `/usr/local/bin/sysdiag` con permiso `-rwsr-xr-x`.',
      },
      {
        label: 'Paso 2: Enumerar Linux Capabilities extendidas',
        command: 'getcap -r / 2>/dev/null',
        explanation: 'Identifica `/usr/bin/python3.10 = cap_setuid+ep` (invisible para find -perm -4000).',
      },
      {
        label: 'Paso 3: Ejecutar el binario SUID `/usr/local/bin/sysdiag` y capturar la Flag',
        command: '/usr/local/bin/sysdiag --root-shell',
        explanation: 'Eleva EUID a 0 (root) y entrega la bandera del módulo.',
      },
    ],
    labFlagAnswer: 'FLAG{LINUX_SUID_CAPABILITIES_MASTERED_2026}',
    labQuestionPrompt: 'Ejecuta `/usr/local/bin/sysdiag --root-shell` en la terminal interactiva. ¿Cuál es la bandera (FLAG{...}) obtenida?',
    labProgressiveHints: [
      'Empujón conceptual: Primero enumera con `find / -perm -4000 2>/dev/null` para localizar el binario SUID personalizado en `/usr/local/bin/`.',
      'Concepto clave: El binario `/usr/local/bin/sysdiag` acepta el argumento `--root-shell` mientras tiene el bit SUID activo.',
      'Estructura del comando: Ejecuta `/usr/local/bin/sysdiag --root-shell` en la terminal.',
    ],
    defenseDeepParagraphs: [
      'Una vez demostrada la vulnerabilidad, un ingeniero de seguridad aplica la remediación y verifica que el vector quedó cerrado. Para quitar el bit SUID de `/usr/local/bin/sysdiag` se ejecuta `chmod u-s /usr/local/bin/sysdiag` (o `chmod 0755 /usr/local/bin/sysdiag`).',
      '¡Atención crítica! Nunca escribas `4755`, porque el `4` delante de `755` mantiene activo el bit SUID (`4000`). Si ejecutas `chmod u-s /usr/local/bin/sysdiag` en la terminal y luego intentas correr `/usr/local/bin/sysdiag --root-shell` otra vez, comprobarás que el sistema ahora bloquea la escalada con `Permission denied (EUID=1000)`.',
    ],
    defenseCommand: {
      label: 'Paso 4 (Remediación en Vivo): Revocar el bit SUID del binario vulnerable',
      command: 'chmod u-s /usr/local/bin/sysdiag',
      explanation: 'Actualiza el inodo en la VM a `-rwxr-xr-x (0755)` y neutraliza el exploit.',
    },
    defenseQuestion: {
      prompt: 'Escribe el comando o modificador exacto de `chmod` para ELIMINAR el bit SUID de `/usr/local/bin/sysdiag` (nota: `4755` es incorrecto porque conserva el bit SUID):',
      placeholder: 'Ej. chmod u-s /usr/local/bin/sysdiag',
      accepted: ['u-s', 'chmod u-s', '0755', 'chmod u-s /usr/local/bin/sysdiag', 'chmod 0755 /usr/local/bin/sysdiag'],
      regexPattern: '^(?:sudo\\s+)?(?:chmod\\s+)?(?:u-s|-s|0?755)(?:\\s+\\/usr\\/local\\/bin\\/sysdiag)?$',
      hint: 'Usa `chmod u-s /usr/local/bin/sysdiag` (o `u-s` / `0755`).',
      progressiveHints: [
        'Empujón conceptual: En notación simbólica de `chmod`, `u` representa al usuario propietario, `-` quita un permiso y `s` es el bit SUID.',
        'Concepto clave: En octal sin SUID es `0755` (nunca `4755`), y en simbólico es `u-s`.',
        'Estructura del comando: Escribe `chmod u-s /usr/local/bin/sysdiag` o `u-s`.',
      ],
    },
  },
  'mod-03': {
    careerPath: 'Ruta 1 · Pre-Security y Fundamentos',
    targetIp: '10.10.10.45',
    scaffoldingLevel: 'Guiado Paso a Paso',
    deepIntroParagraphs: [
      'Toda auditoría de ciberseguridad o investigación en un SOC requiere leer la red a nivel de paquete. Cuando una aplicación envía datos, el kernel los encapsula de arriba hacia abajo: Capa 7 (HTTP/DNS/TLS) -> Capa 4 (TCP/UDP con puertos 1–65535) -> Capa 3 (IPv4/IPv6) -> Capa 2 (Trama Ethernet con direcciones MAC).',
      'En TCP (RFC 9293), cada conexión comienza con el **Three-Way Handshake**: (1) Cliente envía `SYN`; (2) Servidor con puerto abierto responde `SYN, ACK`; (3) Cliente confirma con `ACK`. En un escaneo `nmap -sS` (SYN Half-Open), al recibir el `[SYN, ACK]` del paso 2, el escáner envía inmediatamente `[RST]` para no completar la conexión.',
      'En la red local (Capa 2), el protocolo **ARP** traduce direcciones IP a direcciones MAC sin autenticación nativa, lo que permite ataques de **ARP Spoofing** a menos que el switch empresarial tenga habilitado **DHCP Snooping + Dynamic ARP Inspection (DAI)**.',
    ],
    referenceTableCaption: 'Banderas TCP, Tipos de Escaneo Nmap, Subredes CIDR y Controles de Capa 2/4',
    referenceRows: [
      {
        item: 'Escaneo TCP SYN (`nmap -sS`)',
        specification: 'Flujo `SYN` -> `SYN,ACK` -> `RST`',
        securityImpact: 'Identifica puertos abiertos rápidamente sin completar el handshake de 3 vías.',
        practicalCommandOrUsage: 'Comando estándar: `nmap -sS -sV 10.10.10.45`.',
      },
      {
        item: 'Puerto Cerrado vs. Filtrado',
        specification: 'Respuesta `RST,ACK` vs. Silencio / ICMP Unreachable',
        securityImpact: 'Un puerto `closed` responde con `RST,ACK`; un puerto `filtered` indica que un firewall descarta el paquete (`DROP`).',
        practicalCommandOrUsage: 'Distinguir reglas de firewall perimetral durante el reconocimiento.',
      },
      {
        item: 'Cálculo de Subredes CIDR (`/24`, `/26`, `/30`)',
        specification: 'Hosts utilizables = 2^(32 - prefijo) - 2',
        securityImpact: 'Define el alcance exacto: `/24` = 254 hosts; `/26` = 62 hosts; `/30` = 2 hosts.',
        practicalCommandOrUsage: 'Escanear segmento: `nmap -sn 10.10.10.0/24`.',
      },
      {
        item: 'Disección PCAP con `tcpdump`',
        specification: 'Captura y lectura de paquetes en interfaz o archivo',
        securityImpact: 'Revela credenciales o tokens JWT enviados sobre protocolos en texto claro (HTTP, FTP, Telnet).',
        practicalCommandOrUsage: '`tcpdump -nn -A -r captura_red.pcap`.',
      },
    ],
    firstComprehensionQuestion: {
      prompt: 'Según la tabla técnica de TCP/IP, ¿con qué combinación de banderas TCP responde un servidor cuando envías un paquete `SYN` hacia un puerto que está CERRADO (`closed`)?',
      placeholder: 'Ej. RST,ACK',
      accepted: ['rst,ack', 'rst, ack', 'rst ack', 'rst'],
      regexPattern: '^\\[?rst(?:[\\s,/-]+ack)?\\]?$',
      progressiveHints: [
        'Empujón conceptual: Revisa la segunda fila de la tabla ("Puerto Cerrado vs. Filtrado").',
        'Concepto clave: A diferencia de un puerto abierto (`SYN,ACK`), un puerto cerrado reinicia la conexión inmediatamente.',
        'Respuesta: Escribe `RST,ACK`.',
      ],
    },
    labWalkthroughParagraphs: [
      'En esta práctica utilizaremos la estación de trabajo para auditar la superficie de red de `10.10.10.45` y analizar el archivo de captura de paquetes `captura_red.pcap`.',
      'Ejecutaremos primero `nmap -sV 10.10.10.45` para descubrir qué servicios están escuchando, y a continuación analizaremos `captura_red.pcap` con `tcpdump -A -r captura_red.pcap` para extraer el token Bearer transmitido en texto claro sobre HTTP.',
    ],
    labCommands: [
      {
        label: 'Paso 1: Escaneo de puertos y versiones de servicios con Nmap',
        command: 'nmap -sV 10.10.10.45',
        explanation: 'Sondea los puertos abiertos e interroga los banners de versión de cada servicio activo.',
      },
      {
        label: 'Paso 2: Extraer el payload ASCII de la captura de tráfico (.pcap)',
        command: 'tcpdump -A -r captura_red.pcap',
        explanation: 'Lee el archivo PCAP y muestra en texto ASCII la petición HTTP GET y el token Bearer con la bandera.',
      },
    ],
    labFlagAnswer: 'FLAG{NET_PCAP_CLEARTEXT_TOKEN_EXPOSED}',
    labQuestionPrompt: 'Ejecuta `tcpdump -A -r captura_red.pcap` en la terminal interactiva. ¿Cuál es la bandera (FLAG{...}) expuesta dentro del encabezado Authorization: Bearer?',
    labProgressiveHints: [
      'Empujón conceptual: Necesitas leer el archivo `captura_red.pcap` mostrando su contenido en texto ASCII (`-A`).',
      'Concepto clave: En `tcpdump`, la opción `-r` lee un archivo de captura y `-A` imprime cada paquete en ASCII.',
      'Estructura del comando: Ejecuta `tcpdump -A -r captura_red.pcap` en la terminal.',
    ],
    defenseDeepParagraphs: [
      'En una arquitectura Zero Trust (NIST SP 800-207), nunca se asume que la red interna es segura: todo el tráfico interno entre microservicios debe ir cifrado mediante TLS 1.3 o mTLS.',
      'En la capa de enlace (switches de Capa 2), se debe habilitar **DHCP Snooping** junto con **Dynamic ARP Inspection (DAI)** para bloquear paquetes ARP falsificados.',
    ],
    defenseCommand: {
      label: 'Inspeccionar la tabla ARP de vecinos en la interfaz de red',
      command: 'arp -a',
      explanation: 'Verifica las asociaciones IP <-> Dirección MAC actuales en el segmento local.',
    },
    defenseQuestion: {
      prompt: '¿Cuántas direcciones IP utilizables para hosts existen exactamente en una subred con máscara `/26` (2^6 - 2)?',
      placeholder: 'Número entero de hosts',
      accepted: ['62'],
      regexPattern: '^62(?:\\s*(?:hosts|direcciones))?$',
      hint: 'En un /26 quedan 6 bits de host: 2^6 = 64. Resta 2 (red y broadcast).',
      progressiveHints: [
        'Empujón conceptual: Una dirección IPv4 tiene 32 bits. En `/26` quedan 32 - 26 = 6 bits para hosts.',
        'Concepto clave: Calcula 2 elevado a 6 (64) y resta las 2 direcciones reservadas (red y broadcast).',
        'Valor exacto: Escribe `62`.',
      ],
    },
  },
  'mod-04': {
    careerPath: 'Ruta 1 · Pre-Security y Fundamentos',
    targetIp: '10.10.10.200',
    scaffoldingLevel: 'Guiado Paso a Paso',
    deepIntroParagraphs: [
      'La capacidad de programar y automatizar en Python y Bash distingue a un ingeniero de ciberseguridad frente a un operador que solo usa herramientas ajenas. Cuando te enfrentas a millones de líneas de log, un pipeline en Bash o un script en Python resuelve el incidente en segundos.',
      'En **Bash POSIX**, todo script profesional debe comenzar con `set -euo pipefail`: `-e` aborta el script si un comando devuelve error; `-u` trata las variables no inicializadas como error fatal; y `-o pipefail` asegura que si falla cualquier comando intermedio dentro de una tubería `cmd1 | cmd2 | cmd3`, toda la tubería reporte el fallo.',
      'En **Python 3**, además de dominar `socket`, `requests` y `hashlib`, debes prevenir **Command Injection** en tus propias herramientas: jamás uses `os.system()` ni `subprocess.run(..., shell=True)` con datos externos. Usa siempre listas de argumentos con `shell=False`.',
    ],
    referenceTableCaption: 'Patrones Profesionales de Automatización en Bash y Python para Ciberseguridad',
    referenceRows: [
      {
        item: '`set -euo pipefail`',
        specification: 'Cabecera de seguridad obligatoria en Bash',
        securityImpact: 'Previene ejecuciones parciales corruptas y detecta fallos ocultos en tuberías de procesamiento.',
        practicalCommandOrUsage: 'Colocar justo debajo de `#!/usr/bin/env bash`.',
      },
      {
        item: 'Pipeline de triaje `grep | awk | sort | uniq -c`',
        specification: 'Extracción estadística de logs en consola',
        securityImpact: 'Permite identificar en segundos las IPs que están realizando fuerza bruta o escaneo.',
        practicalCommandOrUsage: '`grep "Failed password" auth.log | awk \'{print $11}\' | sort | uniq -c`',
      },
      {
        item: 'Python `subprocess.run([...], shell=False)`',
        specification: 'Ejecución segura de binarios del sistema',
        securityImpact: 'Elimina de raíz la inyección de comandos por metacaracteres de shell (`;`, `&&`, `|`).',
        practicalCommandOrUsage: '`subprocess.run(["ping", "-c", "1", ip], shell=False, timeout=5)`',
      },
      {
        item: 'Python `socket` con Timeouts y Excepciones',
        specification: 'Comunicación de red de bajo nivel',
        securityImpact: 'Permite interactuar con servicios binarios y capturar banners sin bloquear hilos indefinidamente.',
        practicalCommandOrUsage: '`s.settimeout(2.0)` dentro de un bloque `try ... except socket.timeout:`.',
      },
    ],
    firstComprehensionQuestion: {
      prompt: '¿Qué directiva de configuración en Bash (`set -___ pipefail`) obliga a que el script se detenga ante errores, variables no definidas y fallos en mitad de una tubería?',
      placeholder: 'Ej. set -euo pipefail',
      accepted: ['euo', '-euo', 'set -euo pipefail'],
      regexPattern: '^(?:set\\s+)?-?euo(?:\\s+-?o?\\s*pipefail)?$',
      progressiveHints: [
        'Empujón conceptual: Revisa la primera fila de la tabla de patrones profesionales en Bash.',
        'Concepto clave: Combina las banderas `-e` (exit on error), `-u` (unset variables) y `-o pipefail`.',
        'Respuesta: Escribe `set -euo pipefail` o `euo`.',
      ],
    },
    labWalkthroughParagraphs: [
      'En la terminal interactiva (y su pestaña de **Analizador Estático Python/Bash**) vamos a procesar el archivo `auth.log` del nodo `soc-siem-collector (10.10.10.200)` mediante una tubería POSIX completa.',
      'Ejecuta el pipeline `grep "Failed password" auth.log | awk \'{print $11}\' | sort | uniq -c` para agrupar y contar los intentos fallidos por dirección IP (identificando el origen `203.0.113.42`) y obtener la bandera de automatización.',
    ],
    labCommands: [
      {
        label: 'Paso 1: Inspeccionar intentos fallidos en auth.log con grep',
        command: 'grep "Failed password" auth.log',
        explanation: 'Filtra las líneas de fallo de autenticación SSH desde 203.0.113.42.',
      },
      {
        label: 'Paso 2: Ejecutar el pipeline completo de agregación para obtener la Flag',
        command: "grep \"Failed password\" auth.log | awk '{print $11}' | sort | uniq -c",
        explanation: 'Extrae la columna IP, ordena, cuenta ocurrencias con uniq -c y entrega la bandera del módulo.',
      },
    ],
    labFlagAnswer: 'FLAG{PYTHON_BASH_AUTOMATION_SCRIPT_OK}',
    labQuestionPrompt: 'Ejecuta el pipeline `grep "Failed password" auth.log | awk \'{print $11}\' | sort | uniq -c` en la terminal. ¿Cuál es la bandera (FLAG{...}) obtenida?',
    labProgressiveHints: [
      'Empujón conceptual: Un simple `grep` muestra las líneas, pero para obtener la estadística y la bandera debes encadenar `awk`, `sort` y `uniq -c`.',
      'Concepto clave: Asegúrate de incluir `| awk` y `| uniq -c` en el comando.',
      'Estructura del comando: Ejecuta `grep "Failed password" auth.log | awk \'{print $11}\' | sort | uniq -c`.',
    ],
    defenseDeepParagraphs: [
      'Al construir herramientas para un SOC (SOAR) o scripts de auditoría, tu propio código debe ser resistente a entradas maliciosas. Si un script parsea logs usando `eval()` o `shell=True`, un atacante puede inyectar payloads dentro de los cabeceros HTTP o nombres de usuario para comprometer tu estación.',
      'Puedes usar la pestaña **"Analizador Estático Python/Bash"** de la derecha para verificar que tus scripts incluyan control de errores real y no contengan patrones inseguros.',
    ],
    defenseCommand: {
      label: 'Comprobar el pipeline de extracción en consola',
      command: "grep \"Failed password\" auth.log | awk '{print $11}' | sort | uniq -c",
      explanation: 'Verifica el conteo de eventos por IP origen.',
    },
    defenseQuestion: {
      prompt: 'En Python `subprocess.run()`, ¿qué valor booleano exacto debe tener el parámetro `shell` (`shell=___`) para evitar vulnerabilidades de Command Injection?',
      placeholder: 'Valor booleano en Python',
      accepted: ['false', 'shell=false'],
      regexPattern: '^(?:shell\\s*=\\s*)?false$',
      hint: 'Con `shell=False`, Python ejecuta el binario directamente mediante `execve` sin invocar `/bin/sh`.',
      progressiveHints: [
        'Empujón conceptual: Si activas el intérprete de comandos (`True`), los caracteres como `;` y `|` permiten inyectar comandos.',
        'Concepto clave: Debes desactivar el uso de shell intermedio.',
        'Respuesta: Escribe `False` (o `shell=False`).',
      ],
    },
  },
  'mod-05': {
    careerPath: 'Ruta 1 · Pre-Security y Fundamentos',
    targetIp: '10.10.10.200',
    scaffoldingLevel: 'Andamiaje con Pistas',
    deepIntroParagraphs: [
      'La mayoría de los fallos criptográficos en sistemas reales no ocurren porque alguien rompa matemáticamente AES-256, sino porque se eligen modos inseguros (como AES-ECB), se reutilizan Nonces o se guardan contraseñas con hashes rápidos sin Salt.',
      'Debes distinguir cuatro primitivas: (1) **Hashing Criptográfico (SHA-256, BLAKE3)** para integridad; (2) **KDFs Memory-Hard para Contraseñas (Argon2id, yescrypt)** con Salt único por usuario; (3) **Cifrado Simétrico Autenticado — AEAD (AES-256-GCM, ChaCha20-Poly1305)** que garantiza confidencialidad e integridad a la vez; y (4) **Criptografía Asimétrica (ECDHE, Ed25519)** para acuerdo de claves con Forward Secrecy y firmas digitales.',
      'A nivel arquitectónico, la metodología **STRIDE** audita cada componente contra 6 amenazas: **S**poofing, **T**ampering, **R**epudiation, **I**nformation Disclosure, **D**enial of Service y **E**levation of Privilege.',
    ],
    referenceTableCaption: 'Primitivas Criptográficas Modernas y Matriz de Modelado de Amenazas STRIDE',
    referenceRows: [
      {
        item: 'AES-256-GCM / ChaCha20-Poly1305',
        specification: 'Cifrado Simétrico Autenticado (AEAD)',
        securityImpact: 'Garantiza Confidencialidad + Integridad simultáneamente. Prohibido reutilizar el mismo Nonce con la misma clave.',
        practicalCommandOrUsage: 'Estándar obligatorio en TLS 1.3 y almacenamiento cifrado moderno.',
      },
      {
        item: 'Argon2id / yescrypt',
        specification: 'Hashing de contraseñas Memory-Hard con Salt',
        securityImpact: 'Neutraliza ataques por diccionario con GPUs/ASICs y tablas precomputadas (Rainbow Tables).',
        practicalCommandOrUsage: 'Usado en `/etc/shadow` (`$y$`) y backends de autenticación.',
      },
      {
        item: 'ECDHE (Diffie-Hellman Efímero)',
        specification: 'Acuerdo de claves asimétrico con Forward Secrecy',
        securityImpact: 'Si la clave privada del servidor se filtra en el futuro, el atacante NO puede descifrar el tráfico capturado hoy.',
        practicalCommandOrUsage: 'Negociación de claves en cada handshake TLS 1.3.',
      },
      {
        item: 'Metodología STRIDE',
        specification: 'Spoofing, Tampering, Repudiation, Info Disclosure, DoS, EoP',
        securityImpact: 'Identifica fallos de diseño arquitectónico antes de escribir código.',
        practicalCommandOrUsage: 'Aplicar sobre cada frontera de confianza (Trust Boundary) del sistema.',
      },
    ],
    firstComprehensionQuestion: {
      prompt: 'Según la tabla criptográfica, ¿qué algoritmo ganador de la Password Hashing Competition es el estándar recomendado (Memory-Hard con Salt) para almacenar contraseñas resistiendo ataques con GPUs?',
      placeholder: 'Ej. Nombre del algoritmo KDF',
      accepted: ['argon2id', 'argon2'],
      regexPattern: '^argon2(?:id)?$',
      progressiveHints: [
        'Empujón conceptual: Revisa la segunda fila de la tabla ("Hashing de contraseñas Memory-Hard con Salt").',
        'Concepto clave: Su nombre empieza por `Argon2` y su variante híbrida termina en `id`.',
        'Respuesta: Escribe `Argon2id`.',
      ],
    },
    labWalkthroughParagraphs: [
      'A partir de este módulo entras en fase de **Andamiaje con Pistas**: aplica los comandos de auditoría criptográfica en el nodo `soc-siem-collector (10.10.10.200)` para inspeccionar la configuración de políticas criptográficas del servidor.',
      'Ejecuta `cat /etc/crypto-policies/config` para verificar que el servidor exige `TLS1.3`, `AES-256-GCM` y `Argon2id`, obteniendo la bandera de verificación criptográfica.',
    ],
    labCommands: [
      {
        label: 'Paso 1: Auditar la política criptográfica del sistema',
        command: 'cat /etc/crypto-policies/config',
        explanation: 'Inspecciona los algoritmos permitidos (AEAD, KDF, firmas) y devuelve la bandera del módulo 05.',
      },
    ],
    labFlagAnswer: 'FLAG{CRYPTO_AES_GCM_ARGON2ID_VERIFIED}',
    labQuestionPrompt: 'Ejecuta `cat /etc/crypto-policies/config` en la terminal interactiva. ¿Cuál es la bandera (FLAG{...}) de verificación criptográfica?',
    labProgressiveHints: [
      'Empujón conceptual: Debes leer el archivo de configuración ubicado en `/etc/crypto-policies/config`.',
      'Concepto clave: Usa el comando `cat` seguido de la ruta `/etc/crypto-policies/config`.',
      'Estructura del comando: Ejecuta `cat /etc/crypto-policies/config` en la consola.',
    ],
    defenseDeepParagraphs: [
      'Regla de oro de la ingeniería criptográfica: **"Never roll your own crypto"**. Utiliza construcciones AEAD estándar (`AES-256-GCM` o `ChaCha20-Poly1305`) donde cada operación de cifrado genere un Nonce único de 96 bits mediante un generador criptográficamente seguro (`os.urandom(12)`).',
    ],
    defenseCommand: {
      label: 'Verificar integridad SHA-256 de artefactos en el sistema',
      command: 'sha256sum /tmp/.systemd-sync',
      explanation: 'Comprueba la huella criptográfica inmutable de 256 bits.',
    },
    defenseQuestion: {
      prompt: '¿Qué siglas en inglés (4 letras) identifican al esquema de "Cifrado Autenticado con Datos Asociados" (como AES-GCM) que garantiza confidencialidad e integridad simultáneamente?',
      placeholder: 'Siglas de 4 letras',
      accepted: ['aead'],
      regexPattern: '^aead$',
      hint: 'Authenticated Encryption with Associated Data.',
      progressiveHints: [
        'Empujón conceptual: Son las iniciales en inglés de Authenticated Encryption with Associated Data.',
        'Concepto clave: Aparece en la primera fila de la tabla de referencia junto a AES-256-GCM.',
        'Respuesta: Escribe `AEAD`.',
      ],
    },
  },
  'mod-06': {
    careerPath: 'Ruta 3 · Blue Team, SOC y Forense DFIR',
    targetIp: '10.10.10.200',
    scaffoldingLevel: 'Andamiaje con Pistas',
    deepIntroParagraphs: [
      'Diseñar una red segura exige asumir que cualquier activo perimetral puede ser comprometido y que la arquitectura interna debe impedir el movimiento lateral. Para ello combinamos tres pilares: **Filtrado de Paquetes Stateful (Netfilter / nftables / UFW)**, **Inspección Profunda de Paquetes (IDS/IPS con Suricata)** y **Monitoreo de Metadatos de Red (NSM con Zeek)**.',
      'En el kernel Linux, **Netfilter** procesa cada paquete evaluando las reglas **secuencialmente de arriba hacia abajo (First Match Wins)**. Además, en servidores de producción es crítico aplicar **Egress Filtering (Filtrado de Salida)**: bloquear salidas no autorizadas hacia Internet inutiliza las Reverse Shells y la descarga de implantes C2.',
      'Por su parte, **Suricata** puede operar como **IDS pasivo** (en un puerto espejo SPAN/TAP) o como **IPS en línea (Inline)** (donde la acción `drop` descarta el paquete malicioso antes de que alcance al servidor destino).',
    ],
    referenceTableCaption: 'Arquitectura de Cortafuegos Netfilter, Modos IDS/IPS Suricata y Segmentación',
    referenceRows: [
      {
        item: 'Regla `First Match Wins` en Firewall',
        specification: 'Evaluación secuencial de arriba hacia abajo',
        securityImpact: 'Si agregas un bloqueo debajo de una regla `ALLOW ANY`, nunca se ejecutará. Usa siempre `insert 1` (`-I`).',
        practicalCommandOrUsage: '`ufw deny from 203.0.113.42 to any`',
      },
      {
        item: 'Egress Filtering (Filtrado Saliente)',
        specification: 'Restricción de la cadena `OUTPUT` / Salida a Internet',
        securityImpact: 'Impide que un servidor explotado establezca una Reverse Shell hacia el servidor C2 (`203.0.113.42`).',
        practicalCommandOrUsage: 'Permitir solo DNS/NTP/Actualizaciones hacia repositorios internos.',
      },
      {
        item: 'Suricata IDS (SPAN/TAP) vs. IPS (Inline)',
        specification: 'Detección pasiva vs. Prevención activa en línea',
        securityImpact: 'El modo IDS alerta sin latencia; el modo IPS ejecuta `drop` en tiempo real sobre payloads de ataque.',
        practicalCommandOrUsage: 'Regla IPS: `drop http any any -> $HOME_NET any (msg:"SQLi Attempt"; ...)`',
      },
      {
        item: 'Microsegmentación VLAN & DMZ',
        specification: 'Aislamiento entre zonas de confianza con ACLs',
        securityImpact: 'Frena la propagación lateral (SMB 445 / RDP 3389) entre estaciones y servidores críticos.',
        practicalCommandOrUsage: 'La DMZ solo puede hablar con la BD en el puerto específico (ej. 5432/TCP).',
      },
    ],
    firstComprehensionQuestion: {
      prompt: '¿Cómo se denomina en inglés (dos palabras: `___ Filtering`) al control de firewall que restringe las conexiones SALIENTES iniciadas desde un servidor interno hacia Internet para frenar Reverse Shells?',
      placeholder: 'Ej. Egress Filtering',
      accepted: ['egress filtering', 'egress', 'filtrado de salida'],
      regexPattern: '^(?:egress(?:\\s+filtering)?|filtrado\\s+de\\s+salida)$',
      progressiveHints: [
        'Empujón conceptual: Ingress es entrada; busca en la segunda fila de la tabla el término opuesto para la salida.',
        'Concepto clave: Empieza por la palabra `Egress`.',
        'Respuesta: Escribe `Egress Filtering` (o `Egress`).',
      ],
    },
    labWalkthroughParagraphs: [
      'En el nodo `soc-siem-collector (10.10.10.200)` hemos detectado que el servidor de Comando y Control (C2) en la dirección de pruebas `203.0.113.42` (RFC 5737) mantiene comunicación con nuestro host.',
      'Inspecciona primero el registro `auth.log` para confirmar la IP del adversario y ejecuta inmediatamente la regla de contención en el firewall con `ufw deny from 203.0.113.42 to any` para bloquear al atacante y obtener la bandera de seguridad de red.',
    ],
    labCommands: [
      {
        label: 'Paso 1: Confirmar la IP atacante en el registro de autenticación',
        command: 'grep "Failed password" auth.log',
        explanation: 'Muestra los intentos desde la dirección IP 203.0.113.42.',
      },
      {
        label: 'Paso 2: Ejecutar contención activa en el Firewall del Kernel',
        command: 'ufw deny from 203.0.113.42 to any',
        explanation: 'Inserta la regla de bloqueo para 203.0.113.42 y devuelve la bandera del módulo 06.',
      },
    ],
    labFlagAnswer: 'FLAG{FIREWALL_IDS_ZERO_TRUST_ACTIVE}',
    labQuestionPrompt: 'Ejecuta `ufw deny from 203.0.113.42 to any` en la terminal interactiva. ¿Cuál es la bandera (FLAG{...}) de verificación de contención?',
    labProgressiveHints: [
      'Empujón conceptual: Debes indicar a `ufw` que deniegue (`deny`) todo el tráfico proveniente (`from`) de la IP `203.0.113.42`.',
      'Concepto clave: La sintaxis de UFW es `ufw deny from <IP> to any`.',
      'Estructura del comando: Ejecuta `ufw deny from 203.0.113.42 to any` en la terminal.',
    ],
    defenseDeepParagraphs: [
      'Recuerda siempre combinar el bloqueo en el firewall con la terminación de sesiones establecidas (`conntrack -D` o `ss -K`), ya que si una regla stateful permite `ESTABLISHED` antes del bloqueo, una sesión TCP ya abierta podría seguir transmitiendo datos.',
    ],
    defenseCommand: {
      label: 'Verificar estado de reglas y contención en el firewall',
      command: 'ufw deny from 203.0.113.42 to any',
      explanation: 'Aplica la regla DENY en Netfilter.',
    },
    defenseQuestion: {
      prompt: '¿Qué siglas de 3 letras identifican el modo de despliegue en el que Suricata se coloca directamente en línea (Inline) para poder descartar (`drop`) paquetes maliciosos en tránsito?',
      placeholder: 'Siglas de 3 letras',
      accepted: ['ips', 'modo ips'],
      regexPattern: '^(?:modo\\s+)?ips$',
      hint: 'IDS detecta pasivamente; IPS (Intrusion Prevention System) previene en línea.',
      progressiveHints: [
        'Empujón conceptual: IDS significa Intrusion Detection System (solo detecta). Busca las siglas de Intrusion Prevention System.',
        'Concepto clave: Cambia la D de Detection por la P de Prevention.',
        'Respuesta: Escribe `IPS`.',
      ],
    },
  },
  'mod-07': {
    careerPath: 'Ruta 2 · Pentesting y Seguridad Web',
    targetIp: '10.10.10.80',
    scaffoldingLevel: 'Andamiaje con Pistas',
    deepIntroParagraphs: [
      'Las aplicaciones web y APIs REST/GraphQL constituyen la puerta de entrada principal hacia los datos críticos. El estándar **OWASP Top 10** sintetiza las categorías de riesgo más graves, encabezadas por **A01: Broken Access Control (IDOR / BOLA)** y **A03: Injection (SQL Injection, XSS, Command Injection)**.',
      'Cuando un desarrollador concatena cadenas en SQL (`"SELECT * FROM users WHERE username = \'" + user + "\'"`), el motor SQL recibe una única cadena y construye un **Árbol de Sintaxis Abstracta (AST)**. Si el usuario envía `\' OR 1=1 --`, la comilla simple cierra el literal, `OR 1=1` inyecta una condición siempre verdadera en el AST y `--` comenta el resto de la consulta. En cambio, con **Consultas Parametrizadas (Prepared Statements)** (`SELECT * FROM users WHERE username = $1`), el motor compila primero el AST fijo y luego inyecta el parámetro únicamente como dato escalar literal.',
      'En **Cross-Site Scripting (XSS)**, el navegador ejecuta JavaScript inyectado si la aplicación inserta datos sin codificación contextual. Proteger las cookies de sesión con el atributo `HttpOnly` impide que un script malicioso las lea mediante `document.cookie`.',
    ],
    referenceTableCaption: 'Vulnerabilidades Críticas OWASP Top 10: Mecanismo de Explotación y Remediación Definitiva',
    referenceRows: [
      {
        item: 'SQL Injection (CWE-89)',
        specification: 'Alteración del Árbol Sintáctico (AST) SQL por concatenación',
        securityImpact: 'Evasión de autenticación (`\' OR 1=1 --`) o volcado de tablas (`UNION SELECT`).',
        practicalCommandOrUsage: 'Defensa: Consultas Parametrizadas (`$1`, `?`) en el 100% de las consultas.',
      },
      {
        item: 'Broken Access Control / IDOR (A01)',
        specification: 'Falta de validación de pertenencia del objeto en el servidor',
        securityImpact: 'Un usuario autenticado cambia `/api/cuentas/1050` por `/api/cuentas/1001` y accede a datos ajenos.',
        practicalCommandOrUsage: 'Defensa: Verificar en cada controlador que `resource.owner_id === session.user_id`.',
      },
      {
        item: 'Cross-Site Scripting — XSS (CWE-79)',
        specification: 'Inyección de JavaScript en el contexto del navegador víctima',
        securityImpact: 'Secuestro de sesión y ejecución de acciones arbitrarias desde el navegador del usuario.',
        practicalCommandOrUsage: 'Defensa: Output Encoding + DOMPurify + `Content-Security-Policy` + Cookie `HttpOnly`.',
      },
      {
        item: 'Server-Side Request Forgery — SSRF (A10)',
        specification: 'Petición HTTP forzada desde el servidor hacia redes internas',
        securityImpact: 'Acceso a servicios en `127.0.0.1` o robo de credenciales IAM en `169.254.169.254`.',
        practicalCommandOrUsage: 'Defensa: Lista blanca estricta de dominios e IMDSv2.',
      },
    ],
    firstComprehensionQuestion: {
      prompt: 'Según la tabla técnica OWASP Top 10, ¿qué siglas de 4 letras identifican la vulnerabilidad de control de acceso roto donde un usuario accede a registros de otro cambiando el ID en la URL (`/api/cuentas/1001`)?',
      placeholder: 'Siglas de 4 letras',
      accepted: ['idor', 'bola'],
      regexPattern: '^(?:idor|bola)$',
      progressiveHints: [
        'Empujón conceptual: Revisa la segunda fila de la tabla ("Broken Access Control").',
        'Concepto clave: Significa Insecure Direct Object Reference (o BOLA en APIs).',
        'Respuesta: Escribe `IDOR`.',
      ],
    },
    labWalkthroughParagraphs: [
      'Estás auditando el nodo `finbank-portal (10.10.10.80)`. Primero realizaremos una auditoría de caja blanca leyendo el archivo `auth_controller.js` para localizar la concatenación SQL.',
      'Luego lanzaremos nuestro payload con `curl` (o `sqlmap -u ...`) inyectando `\' OR 1=1 --` sobre el parámetro `user` para demostrar la evasión de autenticación y capturar la bandera del módulo 07.',
    ],
    labCommands: [
      {
        label: 'Paso 1: Auditar el código fuente del controlador de login',
        command: 'cat auth_controller.js',
        explanation: 'Muestra la línea exacta donde `req.query.user` se concatena en la consulta PostgreSQL.',
      },
      {
        label: 'Paso 2: Ejecutar la prueba de concepto de Inyección SQL con curl',
        command: "curl \"http://10.10.10.80/api/login?user=' OR 1=1 --\"",
        explanation: 'Inyecta la tautología booleana y recupera el registro administrativo con la bandera.',
      },
    ],
    labFlagAnswer: 'FLAG{OWASP_SQLI_PREPARED_STATEMENTS_FIXED}',
    labQuestionPrompt: 'Ejecuta el comando `curl` con el payload SQLi en la terminal interactiva. ¿Cuál es la bandera (FLAG{...}) devuelta en el campo `secret_flag`?',
    labProgressiveHints: [
      'Empujón conceptual: Primero lee `cat auth_controller.js` para ver cómo se construye la consulta en `http://10.10.10.80/api/login`.',
      'Concepto clave: Debes enviar el parámetro `?user=\' OR 1=1 --` usando `curl` hacia `10.10.10.80`.',
      'Estructura del comando: Ejecuta `curl "http://10.10.10.80/api/login?user=\' OR 1=1 --"` en la terminal.',
    ],
    defenseDeepParagraphs: [
      'Jamás intentes mitigar SQL Injection usando `replace("\'", "")` ni listas negras de palabras como `SELECT` o `UNION`.',
      'La remediación obligatoria es refactorizar el controlador para usar una **Consulta Parametrizada (Prepared Statement)**: `const result = await db.query("SELECT id, username, role FROM users WHERE username = $1 AND active = 1", [user]);`.',
    ],
    defenseCommand: {
      label: 'Comprobar detección automatizada en el endpoint (con objetivo -u)',
      command: 'sqlmap -u "http://10.10.10.80/api/login?user=test"',
      explanation: 'Nota: `sqlmap --help` solo muestra el manual; para auditar debes especificar `-u` con el objetivo.',
    },
    defenseQuestion: {
      prompt: '¿Qué atributo de seguridad en la cabecera `Set-Cookie` impide que un script malicioso (XSS) pueda leer la cookie de sesión mediante `document.cookie`?',
      placeholder: 'Nombre del atributo de cookie',
      accepted: ['httponly', 'http-only'],
      regexPattern: '^http-?only$',
      hint: 'Es una directiva que indica que la cookie solo es accesible por HTTP y no por JavaScript.',
      progressiveHints: [
        'Empujón conceptual: Busca en la fila de XSS de la tabla el atributo de cookie que bloquea a `document.cookie`.',
        'Concepto clave: Combina las palabras `Http` y `Only`.',
        'Respuesta: Escribe `HttpOnly`.',
      ],
    },
  },
  'mod-08': {
    careerPath: 'Ruta 2 · Pentesting y Seguridad Web',
    targetIp: '10.10.10.45',
    scaffoldingLevel: 'Andamiaje con Pistas',
    deepIntroParagraphs: [
      'Un profesional Senior comprende la taxonomía técnica (**CWE -> CVE -> CVSS -> EPSS -> CISA KEV**) para priorizar qué vulnerabilidades representan un riesgo inminente de intrusión real.',
      'En un vector **CVSS v3.1 / v4.0** como `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H`: `AV:N` indica explotable por red; `AC:L` baja complejidad; `PR:N` sin privilegios previos; `UI:N` sin interacción del usuario ("Zero-Click"); y `S:C` (Scope: Changed) advierte que permite comprometer otro ámbito de seguridad.',
      'Sin embargo, **CVSS mide severidad teórica, NO probabilidad de explotación activa**. Por eso cruzamos CVSS con el puntaje **EPSS (Exploit Prediction Scoring System)** y el catálogo **CISA KEV (Known Exploited Vulnerabilities)**.',
    ],
    referenceTableCaption: 'Métricas de Clasificación y Priorización de Vulnerabilidades en Ingeniería de Seguridad',
    referenceRows: [
      {
        item: 'CWE vs. CVE',
        specification: 'Debilidad abstracta vs. Instancia específica en un producto',
        securityImpact: '`CWE-89` es el concepto de Inyección SQL; `CVE-2021-44228` es Log4Shell en Apache Log4j.',
        practicalCommandOrUsage: 'Mapear hallazgos de código propio a CWE y dependencias a CVE.',
      },
      {
        item: 'Métrica CVSS `S:C` (Scope: Changed)',
        specification: 'Cambio de autoridad de seguridad tras la explotación',
        securityImpact: 'Eleva la severidad a nivel crítico (ej. Escape de contenedor a nodo host).',
        practicalCommandOrUsage: 'Auditar con prioridad máxima cualquier CVE perimetral con `AV:N/PR:N/S:C`.',
      },
      {
        item: 'EPSS & Catálogo CISA KEV',
        specification: 'Probabilidad empírica (0–100%) y Explotación Activa Confirmada',
        securityImpact: 'Permite remediar primero el subconjunto de vulnerabilidades que causan las brechas reales.',
        practicalCommandOrUsage: 'Parcheo de emergencia en < 24–48h para cualquier activo expuesto en CISA KEV.',
      },
      {
        item: 'Pipeline SAST + SCA (SBOM) + DAST',
        specification: 'Pruebas estáticas, de dependencias y dinámicas en CI/CD',
        securityImpact: 'SAST audita tu código fuente; SCA detecta librerías vulnerables (`package.json`); DAST prueba el servidor en vivo.',
        practicalCommandOrUsage: 'Combinar Semgrep/CodeQL (SAST) + Trivy (SCA) + Nuclei/ZAP (DAST).',
      },
    ],
    firstComprehensionQuestion: {
      prompt: '¿Qué siglas de 4 letras identifican al sistema que estima la probabilidad empírica (de 0 a 100%) de que un CVE sea explotado en la vida real durante los próximos 30 días?',
      placeholder: 'Siglas de 4 letras',
      accepted: ['epss'],
      regexPattern: '^epss$',
      progressiveHints: [
        'Empujón conceptual: CVSS mide severidad teórica; busca en la tercera fila de la tabla el sistema que predice la probabilidad de explotación.',
        'Concepto clave: Significa Exploit Prediction Scoring System.',
        'Respuesta: Escribe `EPSS`.',
      ],
    },
    labWalkthroughParagraphs: [
      'Realizaremos la enumeración de versiones de servicios sobre `10.10.10.45` y validaremos activamente el servicio Werkzeug Python expuesto en el puerto `8080`.',
      'Ejecuta `nmap -sV 10.10.10.45` para identificar versiones y luego interroga el puerto `8080` con `curl http://10.10.10.45:8080` para confirmar la exposición y obtener la bandera de priorización de vulnerabilidades.',
    ],
    labCommands: [
      {
        label: 'Paso 1: Detectar versiones exactas y servicios expuestos con Nmap',
        command: 'nmap -sV 10.10.10.45',
        explanation: 'Identifica Werkzeug/3.0.1 Python/3.11.6 con Debug Console expuesta en el puerto 8080.',
      },
      {
        label: 'Paso 2: Validar activamente el endpoint expuesto en el puerto 8080',
        command: 'curl http://10.10.10.45:8080',
        explanation: 'Confirma sin falsos positivos que el endpoint responde en modo debug y devuelve la bandera del módulo 08.',
      },
    ],
    labFlagAnswer: 'FLAG{CVE_CVSS_EPSS_PRIORITIZED_2026}',
    labQuestionPrompt: 'Ejecuta `curl http://10.10.10.45:8080` en la terminal interactiva. ¿Cuál es la bandera (FLAG{...}) devuelta por el servicio al validar el hallazgo?',
    labProgressiveHints: [
      'Empujón conceptual: Tras escanear con `nmap -sV 10.10.10.45`, debes hacer una petición HTTP al puerto 8080.',
      'Concepto clave: Usa `curl` apuntando a `http://10.10.10.45:8080`.',
      'Estructura del comando: Ejecuta `curl http://10.10.10.45:8080` en la terminal.',
    ],
    defenseDeepParagraphs: [
      'Todo hallazgo de un escáner automatizado debe ser validado para descartar falsos positivos antes de abrir un ticket crítico, acompañándolo de una recomendación de parcheo y un control compensatorio inmediato.',
    ],
    defenseCommand: {
      label: 'Confirmar inventario de servicios abiertos en el objetivo',
      command: 'nmap -sV 10.10.10.45',
      explanation: 'Verifica el inventario de puertos expuestos.',
    },
    defenseQuestion: {
      prompt: '¿Qué siglas de 3 letras (`SAST`, `DAST` o `SCA`) identifican al análisis que inspecciona los archivos de dependencias de terceros (`package.json`, `requirements.txt`, `pom.xml`) para encontrar librerías con CVEs conocidos?',
      placeholder: 'Siglas de 3 letras',
      accepted: ['sca', 'software composition analysis'],
      regexPattern: '^(?:sca|software\\s+composition\\s+analysis)$',
      hint: 'Software Composition Analysis (SCA) analiza las librerías y dependencias de terceros.',
      progressiveHints: [
        'Empujón conceptual: SAST analiza tu propio código estático y DAST prueba la app corriendo. Busca el que analiza la composición de librerías.',
        'Concepto clave: Son las iniciales de Software Composition Analysis.',
        'Respuesta: Escribe `SCA`.',
      ],
    },
  },
  'mod-09': {
    careerPath: 'Ruta 3 · Blue Team, SOC y Forense DFIR',
    targetIp: '10.10.10.200',
    scaffoldingLevel: 'Resolución Autónoma',
    deepIntroParagraphs: [
      'En un Centro de Operaciones de Seguridad (SOC) moderno, los atacantes utilizan técnicas **Living off the Land (LotL / LOLBins)**: abusan de herramientas legítimas del sistema (`curl`, `powershell`, `bash`, `python3`) para descargar payloads sin dejar archivos maliciosos obvios.',
      'La **Pirámide del Dolor** de David Bianco y **MITRE ATT&CK** demuestran que mientras cambiar un hash SHA-256 o una IP le toma segundos al adversario, cambiar sus **TTPs (Comportamientos)** es sumamente costoso. Con **Reglas Sigma** detectamos comportamientos de creación de procesos y correlación de sesiones.',
      'En **Sysmon** (Windows) y **auditd** (Linux) existen eventos clave que todo analista debe dominar: **Sysmon Event ID 1** (Creación de procesos con `CommandLine` y `ParentImage`), **Event ID 3** (Conexión de red), **Event ID 10** (`ProcessAccess` sobre `lsass.exe` para detectar `T1003.001`), y **Event ID 11** (Creación de archivos).',
    ],
    referenceTableCaption: 'Telemetría de Endpoints (Sysmon / Windows / Linux), MITRE ATT&CK y Pirámide del Dolor',
    referenceRows: [
      {
        item: 'Sysmon Event ID 1 & Windows 4688',
        specification: 'Process Creation (con `CommandLine` y `ParentImage`)',
        securityImpact: 'Permite detectar ejecución de LOLBins, scripts ofuscados y árboles padre-hijo anómalos.',
        practicalCommandOrUsage: 'Correlacionar `ParentImage` (`nginx`) -> `Image` (`/bin/sh`).',
      },
      {
        item: 'Sysmon Event ID 10 (`ProcessAccess`)',
        specification: 'Apertura de handle de memoria sobre otro proceso',
        securityImpact: 'Detecta el robo de credenciales en memoria RAM (`TargetImage: lsass.exe`, MITRE `T1003.001`).',
        practicalCommandOrUsage: 'Alertar ante `GrantedAccess` sospechoso como `0x1010` o `0x1fffff`.',
      },
      {
        item: 'Windows Event ID 4624 vs. 4625',
        specification: 'Inicio de sesión exitoso vs. Fallido (Logon Types 2, 3, 10)',
        securityImpact: 'Logon Type 3 indica acceso por red (SMB/RPC); Logon Type 10 indica acceso interactivo remoto (RDP).',
        practicalCommandOrUsage: 'Correlacionar múltiples 4625 seguidos de un 4624.',
      },
      {
        item: 'Reglas Sigma & YARA',
        specification: 'Estándar universal para logs SIEM (Sigma) y archivos/RAM (YARA)',
        securityImpact: 'Permite compartir ingeniería de detección entre distintos SIEMs (Splunk, Elastic, Sentinel).',
        practicalCommandOrUsage: 'Mapear cada regla Sigma a su identificador `attack.tXXXX` de MITRE.',
      },
    ],
    firstComprehensionQuestion: {
      prompt: 'Según la Pirámide del Dolor de David Bianco, ¿qué siglas (3 o 4 letras) situadas en la cúspide de la pirámide representan las Tácticas, Técnicas y Procedimientos (el comportamiento del adversario)?',
      placeholder: 'Siglas de la cúspide de la pirámide',
      accepted: ['ttps', 'ttp'],
      regexPattern: '^ttps?$',
      progressiveHints: [
        'Empujón conceptual: En la base están los Hashes y las IPs; en la punta está el comportamiento del atacante.',
        'Concepto clave: Son las siglas de Tactics, Techniques, and Procedures.',
        'Respuesta: Escribe `TTPs`.',
      ],
    },
    labWalkthroughParagraphs: [
      'A partir del módulo 09 entras en nivel de **Resolución Autónoma (Avanzado / Senior)**: el sistema te da el objetivo operativo en `soc-siem-collector (10.10.10.200)` y dispones de pistas progresivas si las necesitas.',
      'Inspecciona el archivo completo `auth.log` con `cat auth.log` para reconstruir toda la secuencia del ataque desde `203.0.113.42` (fuerza bruta SSH -> acceso con la cuenta `deploy` -> descarga con `sudo curl`) y obtener la bandera de Threat Hunting del SIEM.',
    ],
    labCommands: [
      {
        label: 'Paso 1: Reconstruir la secuencia completa del ataque en auth.log',
        command: 'cat auth.log',
        explanation: 'Muestra los intentos fallidos, el acceso en `deploy`, el comando `sudo curl` y la bandera del módulo 09.',
      },
    ],
    labFlagAnswer: 'FLAG{SIEM_SIGMA_THREAT_HUNTED_203_0_113_42}',
    labQuestionPrompt: 'Ejecuta `cat auth.log` en la terminal interactiva para correlacionar la intrusión completa. ¿Cuál es la bandera (FLAG{...}) de caza de amenazas que registra el SIEM?',
    labProgressiveHints: [
      'Empujón conceptual: A diferencia de `grep` que solo filtra una línea, necesitas leer todo el registro `auth.log` para ver la correlación completa.',
      'Concepto clave: Usa el comando `cat` sobre el archivo `auth.log` en el directorio del incidente.',
      'Estructura del comando: Ejecuta `cat auth.log` en la terminal.',
    ],
    defenseDeepParagraphs: [
      'Siguiendo **NIST SP 800-61 Rev. 2**, tras detectar y analizar el alcance del compromiso debes preservar la evidencia, contener al atacante en el firewall (`ufw deny from 203.0.113.42 to any`) y revocar las claves SSH de la cuenta comprometida (`deploy`).',
    ],
    defenseCommand: {
      label: 'Contener la IP C2 en el firewall tras el análisis',
      command: 'ufw deny from 203.0.113.42 to any',
      explanation: 'Bloquea el tráfico hacia/desde 203.0.113.42.',
    },
    defenseQuestion: {
      prompt: '¿Qué número de Event ID en Windows Sysmon registra específicamente cuando un proceso abre y lee la memoria de otro proceso (como `lsass.exe`)?',
      placeholder: 'Número de Event ID',
      accepted: ['10', 'event id 10', 'id 10'],
      regexPattern: '^(?:(?:sysmon\\s+)?(?:event\\s+)?id\\s*)?10$',
      hint: 'Sysmon Event ID 1 es creación de proceso; Event ID 10 es ProcessAccess.',
      progressiveHints: [
        'Empujón conceptual: Revisa la segunda fila de la tabla de telemetría de endpoints (`ProcessAccess`).',
        'Concepto clave: Event ID 1 es creación de proceso, Event ID 3 es conexión de red; busca el de apertura de memoria de proceso.',
        'Respuesta: Escribe `10`.',
      ],
    },
  },
  'mod-10': {
    careerPath: 'Ruta 3 · Blue Team, SOC y Forense DFIR',
    targetIp: '10.10.10.200',
    scaffoldingLevel: 'Resolución Autónoma',
    deepIntroParagraphs: [
      'El Análisis Forense Digital y Respuesta a Incidentes (**DFIR**) exige respetar el **Orden de Volatilidad definido en el estándar RFC 3227**: recolectar siempre desde la evidencia más efímera hacia la más persistente.',
      'Si apagas un servidor comprometido tirando del cable, destruyes instantáneamente la **Memoria RAM**, donde residen los procesos activos sin archivo en disco (*Fileless Malware*), las tablas de sockets abiertos y las claves en claro. El orden correcto es: (1) Registros/Caché CPU, (2) Memoria RAM y estado de red/procesos, (3) Sistemas de archivos temporales (`/tmp`, `/proc`), (4) Discos duros persistentes, y (5) Backups.',
      'En Linux, muchos atacantes ejecutan su implante (`/tmp/.systemd-sync`) y borran el archivo en disco con `rm`. Sin embargo, mientras el proceso siga vivo en memoria (por ejemplo con PID `4120`), el kernel mantiene el inodo activo y puedes recuperar el ejecutable íntegro copiando `/proc/4120/exe`.',
    ],
    referenceTableCaption: 'Orden de Volatilidad (RFC 3227), Artefactos en `/proc` y Plugins de Volatility 3',
    referenceRows: [
      {
        item: 'Orden de Volatilidad (RFC 3227)',
        specification: '1. CPU/Caché -> 2. RAM/Red -> 3. Temp -> 4. Disco -> 5. Backups',
        securityImpact: 'Garantiza no destruir evidencias críticas en memoria volátil al intervenir un incidente.',
        practicalCommandOrUsage: 'Adquirir volcado de RAM (`.raw` / `.lime`) antes de apagar o reiniciar el host.',
      },
      {
        item: 'Cadena de Custodia & Hash SHA-256',
        specification: 'Integridad matemática de la evidencia original vs. copia de trabajo',
        securityImpact: 'Nunca se analiza el disco original; se calcula el hash SHA-256 antes y después del análisis.',
        practicalCommandOrUsage: '`sha256sum /tmp/.systemd-sync`',
      },
      {
        item: 'Recuperación de Binario Borrado en `/proc/<PID>/exe`',
        specification: 'Descriptor de ejecutable activo en el kernel Linux',
        securityImpact: 'Permite recuperar el binario exacto en memoria aunque el atacante haya ejecutado `rm` sobre el archivo.',
        practicalCommandOrUsage: '`cp /proc/4120/exe /var/evidencia/malware_recuperado.elf`',
      },
      {
        item: 'Volatility 3 (`pstree`, `netscan`, `malfind`)',
        specification: 'Framework estándar de análisis forense de memoria RAM',
        securityImpact: '`malfind` localiza regiones de memoria con permisos `rwx` donde se inyectó shellcode.',
        practicalCommandOrUsage: '`volatility3 -f memoria_volatil.raw linux.pstree`',
      },
    ],
    firstComprehensionQuestion: {
      prompt: 'Según la tabla forense de Volatility 3, ¿cómo se llama el plugin específico que busca regiones de memoria virtual con permisos `rwx` sospechosos de inyección de código en RAM?',
      placeholder: 'Nombre del plugin de Volatility',
      accepted: ['malfind', 'linux.malfind', 'windows.malfind'],
      regexPattern: '^(?:(?:linux|windows)\\.)?malfind$',
      progressiveHints: [
        'Empujón conceptual: Revisa la cuarta fila de la tabla ("Volatility 3").',
        'Concepto clave: Su nombre combina `mal` (malware) y `find` (encontrar).',
        'Respuesta: Escribe `malfind`.',
      ],
    },
    labWalkthroughParagraphs: [
      'Realizaremos el triaje forense sobre el artefacto sospechoso `/tmp/.systemd-sync` en el nodo `soc-siem-collector (10.10.10.200)` sin llegar a ejecutarlo.',
      'Primero calcula su huella criptográfica para la Cadena de Custodia con `sha256sum /tmp/.systemd-sync` y luego extrae las cadenas ASCII embebidas en el binario con `strings /tmp/.systemd-sync` para descubrir el servidor C2 (`203.0.113.42:4443`) y el MUTEX con la bandera forense.',
    ],
    labCommands: [
      {
        label: 'Paso 1: Generar huella SHA-256 para la Cadena de Custodia',
        command: 'sha256sum /tmp/.systemd-sync',
        explanation: 'Calcula el hash SHA-256 y verifica el descriptor en memoria `/proc/4120/exe`.',
      },
      {
        label: 'Paso 2: Extraer cadenas estáticas e indicadores con strings',
        command: 'strings /tmp/.systemd-sync',
        explanation: 'Extrae la URL del C2 y el identificador MUTEX con la bandera del módulo 10.',
      },
    ],
    labFlagAnswer: 'FLAG{DFIR_VOLATILITY_MEMORY_FORENSICS_DONE}',
    labQuestionPrompt: 'Ejecuta `strings /tmp/.systemd-sync` en la terminal interactiva. ¿Cuál es la bandera (FLAG{...}) contenida en el MUTEX del binario?',
    labProgressiveHints: [
      'Empujón conceptual: Para ver las cadenas de texto legibles dentro de un binario ELF sin ejecutarlo se utiliza la utilidad `strings`.',
      'Concepto clave: El artefacto se encuentra en la ruta `/tmp/.systemd-sync`.',
      'Estructura del comando: Ejecuta `strings /tmp/.systemd-sync` en la terminal.',
    ],
    defenseDeepParagraphs: [
      'Al redactar un informe pericial DFIR, incluye siempre: (1) Los hashes SHA-256 exactos de cada evidencia, (2) La línea temporal en formato UTC correlacionando los tiempos MACB, y (3) Las reglas YARA para buscar el implante en el resto de servidores.',
    ],
    defenseCommand: {
      label: 'Verificar integridad criptográfica del artefacto',
      command: 'sha256sum /tmp/.systemd-sync',
      explanation: 'Confirma que el hash SHA-256 permanece inalterado.',
    },
    defenseQuestion: {
      prompt: 'En Linux, si un proceso malicioso con PID `4120` borró su archivo en disco pero sigue corriendo en RAM, ¿qué nombre de enlace simbólico dentro de `/proc/4120/___` apunta al binario ejecutable para poder recuperarlo?',
      placeholder: 'Nombre del enlace de 3 letras',
      accepted: ['exe', '/proc/4120/exe'],
      regexPattern: '^(?:\\/proc\\/4120\\/)?exe$',
      hint: 'El enlace simbólico se llama `exe` (`/proc/4120/exe`).',
      progressiveHints: [
        'Empujón conceptual: Revisa la tercera fila de la tabla forense ("Recuperación de Binario Borrado").',
        'Concepto clave: Son las 3 primeras letras de la palabra *executable*.',
        'Respuesta: Escribe `exe` (o `/proc/4120/exe`).',
      ],
    },
  },
  'mod-11': {
    careerPath: 'Ruta 4 · Red Teaming y Seguridad Cloud',
    targetIp: '10.10.10.45',
    scaffoldingLevel: 'Resolución Autónoma',
    deepIntroParagraphs: [
      'Un Pentester Senior opera bajo el estándar **PTES (Penetration Testing Execution Standard)** y jamás toca un servidor sin contar primero con las **Reglas de Enfrentamiento (Rules of Engagement — RoE)** y el **Alcance (Scope)** firmados por escrito.',
      'Una competencia clave en entornos corporativos es el **Pivoting y Port Forwarding**: cuando comprometes un servidor en la DMZ (`10.10.10.45`), a menudo descubres que servicios críticos (como PostgreSQL en el puerto `5432`) escuchan exclusivamente en la interfaz loopback local `127.0.0.1` o en una subred interna aislada (`172.16.50.0/24`). Mediante **SSH Local Port Forwarding (`ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45`)** o un proxy dinámico SOCKS5 (`ssh -N -D 1080`), encapsulas tu tráfico a través del host pivote.',
      'Finalmente, todo ejercicio culmina con el **Informe de Auditoría** dividido en **Resumen Ejecutivo** (riesgo de negocio para el directorio) e **Informe Técnico Reproducible** (evidencia, causa raíz y parche exacto).',
    ],
    referenceTableCaption: 'Fases Metodológicas PTES, Técnicas de Pivoting SSH y Estructura de Informes Senior',
    referenceRows: [
      {
        item: 'Reglas de Enfrentamiento (RoE) y Scope',
        specification: 'Contrato legal, rangos IP autorizados y protocolo de emergencia',
        securityImpact: 'Si se detecta un compromiso criminal previo o riesgo de caída en producción, se pausa la prueba y se notifica de inmediato.',
        practicalCommandOrUsage: 'Validar cada IP objetivo contra la lista blanca del Scope antes de escanear.',
      },
      {
        item: 'SSH Local Port Forwarding (`ssh -L`)',
        specification: '`ssh -N -L puerto_local:host_destino:puerto_destino user@pivote`',
        securityImpact: 'Permite alcanzar servicios ligados a `127.0.0.1` o subredes internas detrás del host pivote.',
        practicalCommandOrUsage: '`ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45`',
      },
      {
        item: 'SSH Dynamic SOCKS5 Proxy (`ssh -D`)',
        specification: '`ssh -N -D 127.0.0.1:1080 user@pivote` + `proxychains4`',
        securityImpact: 'Enruta múltiples herramientas TCP hacia toda una subred interna a través de un único túnel SSH.',
        practicalCommandOrUsage: '`proxychains4 -q nmap -sT -Pn 172.16.50.10`',
      },
      {
        item: 'Hardening contra Pivoting SSH',
        specification: 'Restricción en `/etc/ssh/sshd_config`',
        securityImpact: 'Deshabilitar reenvío TCP en servidores donde no sea necesario frena el uso de SSH como túnel.',
        practicalCommandOrUsage: '`AllowTcpForwarding no` y `PermitTunnel no`.',
      },
    ],
    firstComprehensionQuestion: {
      prompt: '¿Qué siglas de 4 letras identifican al estándar metodológico de ejecución de pruebas de penetración (Pre-engagement, Intelligence Gathering, Threat Modeling, Exploitation, Post-Exploitation, Reporting)?',
      placeholder: 'Siglas de 4 letras',
      accepted: ['ptes'],
      regexPattern: '^ptes$',
      progressiveHints: [
        'Empujón conceptual: Revisa el primer párrafo de introducción y el título de la tabla.',
        'Concepto clave: Significa Penetration Testing Execution Standard.',
        'Respuesta: Escribe `PTES`.',
      ],
    },
    labWalkthroughParagraphs: [
      'En la consola interactiva estableceremos un túnel de Pivoting SSH hacia `10.10.10.45` para alcanzar el servicio PostgreSQL interno que escucha únicamente en `127.0.0.1:5432`.',
      'Ejecuta el comando de túnel `ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45` para abrir el reenvío de puertos y capturar la bandera de pivoting.',
    ],
    labCommands: [
      {
        label: 'Paso 1: Establecer túnel SSH Local Port Forwarding hacia 127.0.0.1:5432',
        command: 'ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45',
        explanation: 'Redirige el puerto local 15432 a través del servidor pivote hacia 127.0.0.1:5432 y entrega la bandera del módulo 11.',
      },
    ],
    labFlagAnswer: 'FLAG{PTES_PIVOTING_LATERAL_MOVEMENT_COMPLETE}',
    labQuestionPrompt: 'Ejecuta el comando de túnel SSH (`ssh -N -L ...`) en la terminal interactiva. ¿Cuál es la bandera (FLAG{...}) obtenida al activar el túnel de pivoting?',
    labProgressiveHints: [
      'Empujón conceptual: Necesitas usar `ssh` con la bandera `-L` para redirigir tu puerto local `15432` hacia `127.0.0.1:5432` en `auditor@10.10.10.45`.',
      'Concepto clave: Incluye `-N` (no ejecutar comando remoto) y `-L 127.0.0.1:15432:127.0.0.1:5432`.',
      'Estructura del comando: Ejecuta `ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45`.',
    ],
    defenseDeepParagraphs: [
      'Para defender una infraestructura contra el abuso de túneles SSH, los equipos Blue Team configuran `AllowTcpForwarding no` y `PermitTunnel no` en `/etc/ssh/sshd_config` en aquellos servidores donde los usuarios no requieran reenvío de puertos.',
    ],
    defenseCommand: {
      label: 'Comprobar el establecimiento del túnel SSH',
      command: 'ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45',
      explanation: 'Valida la redirección de puertos.',
    },
    defenseQuestion: {
      prompt: '¿Qué bandera de `ssh` (`-L`, `-R` o `-D`) se utiliza para crear un proxy dinámico SOCKS5 en un puerto local?',
      placeholder: 'Bandera de ssh (ej. -X)',
      accepted: ['-d', 'ssh -d'],
      regexPattern: '^(?:ssh\\s+)?-d$',
      hint: '`-L` es Local port forwarding; `-D` es Dynamic application-level port forwarding (SOCKS).',
      progressiveHints: [
        'Empujón conceptual: `-L` redirige un único puerto local y `-R` un puerto remoto. Busca la bandera de *Dynamic* SOCKS proxy.',
        'Concepto clave: Es un guion seguido de la letra inicial de *Dynamic* en mayúscula.',
        'Respuesta: Escribe `-D`.',
      ],
    },
  },
  'mod-12': {
    careerPath: 'Ruta 4 · Red Teaming y Seguridad Cloud',
    targetIp: '10.10.10.250',
    scaffoldingLevel: 'Resolución Autónoma',
    deepIntroParagraphs: [
      'En infraestructuras **Cloud (AWS, Azure, GCP) y Kubernetes**, la Identidad (IAM) y la Configuración del Plano de Control son el nuevo perímetro.',
      'En **AWS IAM**, conceder `iam:PassRole` sobre `Resource: "*"` junto con `ec2:RunInstances` o `lambda:CreateFunction` permite adjuntar un Rol de Administrador a una instancia nueva y tomar control de la cuenta. Asimismo, **IMDSv2** mitiga el robo de credenciales en `169.254.169.254` mediante vulnerabilidades SSRF al exigir una petición `PUT` inicial con cabecera `X-aws-ec2-metadata-token-ttl-seconds` y `HopLimit = 1`.',
      'En **Kubernetes**, los contenedores comparten el mismo kernel Linux del nodo físico. Desplegar un Pod con `privileged: true` y `hostPID: true` desactiva el aislamiento de capacidades y permite montar el disco del host (`/dev/sda1`), provocando un **Escape de Contenedor**.',
    ],
    referenceTableCaption: 'Vectores Críticos en Cloud (AWS IAM / IMDSv2) y Hardening de Clústeres Kubernetes',
    referenceRows: [
      {
        item: 'Escalada por `iam:PassRole` en AWS',
        specification: 'Combinación de `iam:PassRole` (`*`) + `ec2:RunInstances` / `lambda:CreateFunction`',
        securityImpact: 'Permite adjuntar un rol de Administrador a un recurso nuevo y comprometer toda la cuenta Cloud.',
        practicalCommandOrUsage: 'Restringir `Resource` al ARN exacto del rol permitido.',
      },
      {
        item: 'AWS IMDSv1 vs. IMDSv2 (`169.254.169.254`)',
        specification: 'GET directo vs. Sesión autenticada por token mediante HTTP PUT',
        securityImpact: 'IMDSv2 bloquea el robo de credenciales IAM mediante vulnerabilidades SSRF clásicas.',
        practicalCommandOrUsage: 'Exigir `HttpTokens=required` y `HttpPutResponseHopLimit=1`.',
      },
      {
        item: 'Kubernetes `privileged: true` & `hostPID: true`',
        specification: 'Desactivación del aislamiento de capacidades y espacio de procesos',
        securityImpact: 'Permite montar el disco del nodo host (`mount /dev/sda1 /mnt`) y escapar del contenedor.',
        practicalCommandOrUsage: 'Auditar con `kubectl get pods` y aplicar Pod Security Standards (`restricted`).',
      },
      {
        item: 'Pod Security Standards (`Restricted`)',
        specification: '`runAsNonRoot: true`, `allowPrivilegeEscalation: false`, `drop: ["ALL"]`',
        securityImpact: 'Garantiza que aunque la aplicación dentro del contenedor sufra RCE, no tenga privilegios de root.',
        practicalCommandOrUsage: 'Enforzar a nivel de Namespace mediante `pod-security.kubernetes.io/enforce=restricted`.',
      },
    ],
    firstComprehensionQuestion: {
      prompt: 'En AWS IAM, ¿qué permiso específico (`iam:___`) permite a un usuario asignar un rol IAM existente a una nueva instancia EC2 o función Lambda, causando escalada de privilegios si tiene `"Resource": "*"`?',
      placeholder: 'Ej. iam:PassRole',
      accepted: ['iam:passrole', 'passrole'],
      regexPattern: '^(?:iam:)?passrole$',
      progressiveHints: [
        'Empujón conceptual: Revisa la primera fila de la tabla de seguridad Cloud.',
        'Concepto clave: Es la acción de "pasar un rol" (`PassRole`) dentro del servicio `iam`.',
        'Respuesta: Escribe `iam:PassRole`.',
      ],
    },
    labWalkthroughParagraphs: [
      'Estás conectado al nodo `cloud-cluster (10.10.10.250)`. Nota de aislamiento: las herramientas `aws` y `kubectl` están instaladas exclusivamente en este nodo de control Cloud (si intentas ejecutarlas en otro servidor de laboratorio, devolverán `command not found` con código `127`, y `kubectl version` solo mostrará la versión sin regalar banderas).',
      'Audita primero la política AWS IAM con `aws iam get-policy-version` y luego ejecuta `kubectl get pods` para inspeccionar los contextos de seguridad de los contenedores desplegados y obtener la bandera del módulo 12.',
    ],
    labCommands: [
      {
        label: 'Paso 1: Auditar la política AWS IAM en busca de permisos de escalada',
        command: 'aws iam get-policy-version',
        explanation: 'Muestra el documento JSON de la política y resalta el abuso de `iam:PassRole` con `Resource: "*"`.',
      },
      {
        label: 'Paso 2: Auditar los Pods del clúster Kubernetes y sus contextos de seguridad',
        command: 'kubectl get pods',
        explanation: 'Detecta el Pod `payment-worker-7d9c8b-x92lq` corriendo con `privileged: true` y entrega la bandera.',
      },
    ],
    labFlagAnswer: 'FLAG{CLOUD_IAM_K8S_PRIVILEGED_POD_MITIGATED}',
    labQuestionPrompt: 'Ejecuta `kubectl get pods` en el nodo `cloud-cluster` de la terminal interactiva. ¿Cuál es la bandera (FLAG{...}) que aparece al detectar el Pod privilegiado?',
    labProgressiveHints: [
      'Empujón conceptual: Asegúrate de estar en el nodo `cloud-cluster (10.10.10.250)`. `kubectl version` no entrega la bandera; debes listar los Pods activos.',
      'Concepto clave: Usa el subcomando `get pods` de `kubectl`.',
      'Estructura del comando: Ejecuta `kubectl get pods` en la terminal.',
    ],
    defenseDeepParagraphs: [
      'En entornos DevSecOps modernos, herramientas de **IaC Security** (`Trivy`, `Checkov`) escanean los manifiestos de Kubernetes en cada Pull Request, mientras `Pod Security Admission` en modo `restricted` rechaza automáticamente cualquier despliegue que intente usar `privileged: true`.',
    ],
    defenseCommand: {
      label: 'Verificar estado de los Pods del clúster',
      command: 'kubectl get pods',
      explanation: 'Comprueba qué Pods cumplen `runAsNonRoot: true` frente a `privileged: true`.',
    },
    defenseQuestion: {
      prompt: '¿Qué método o verbo HTTP (`GET`, `POST` o `PUT`) exige el servicio de metadatos **IMDSv2** en AWS en su primera petición para emitir un token de sesión y frenar ataques SSRF?',
      placeholder: 'Verbo HTTP de 3 letras',
      accepted: ['put', 'http put'],
      regexPattern: '^(?:http\\s+)?put$',
      hint: 'IMDSv2 requiere una petición `PUT` inicial con la cabecera `X-aws-ec2-metadata-token-ttl-seconds`.',
      progressiveHints: [
        'Empujón conceptual: Los SSRF clásicos suelen forzar peticiones `GET`. IMDSv2 exige un verbo HTTP de escritura para solicitar el token.',
        'Concepto clave: Revisa la segunda fila de la tabla ("AWS IMDSv1 vs. IMDSv2").',
        'Respuesta: Escribe `PUT`.',
      ],
    },
  },
};

/**
 * Builds the 5 sequential Tasks for any CurriculumModule with strict validationSpecs
 * and 3-level progressive hints (never exposing flags in placeholders or hints).
 */
export function buildRoomTasksForModule(mod: CurriculumModule): RoomTask[] {
  const extra = MODULE_DEEP_EXTRAS[mod.id] ?? MODULE_DEEP_EXTRAS['mod-01'];
  const firstSec = mod.theorySections[0];
  const secondSec = mod.theorySections[1] ?? mod.theorySections[0];
  const q0 = mod.activeRecallQuestions[0];
  const q0CorrectText = q0?.options[q0.correctIndex ?? 0] ?? '';

  return [
    {
      taskNumber: 1,
      title: `Fundamentos Profundos y Anatomía desde Cero: ${mod.title}`,
      type: 'theory-deep',
      badgeText: 'Teoría + Tabla Técnica + Glosario',
      scaffoldingLevel: extra.scaffoldingLevel,
      readingParagraphs: [
        extra.deepIntroParagraphs[0],
        firstSec.content,
        extra.deepIntroParagraphs[1],
      ],
      referenceTable: {
        caption: extra.referenceTableCaption,
        rows: extra.referenceRows,
      },
      commandBlocks: firstSec.codeSnippet
        ? [
            {
              label: `Referencia Técnica (${mod.domain})`,
              command: extra.labCommands[0]?.command || 'help',
              explanation: firstSec.codeSnippet,
            },
          ]
        : [],
      taskQuestions: [
        {
          id: `${mod.id}-t1-q1`,
          questionPrompt: extra.firstComprehensionQuestion.prompt,
          placeholder: extra.firstComprehensionQuestion.placeholder,
          acceptedAnswers: extra.firstComprehensionQuestion.accepted,
          validationSpec: extra.firstComprehensionQuestion.regexPattern
            ? {
                mode: 'regex',
                pattern: extra.firstComprehensionQuestion.regexPattern,
                flags: 'i',
                acceptedAnswers: extra.firstComprehensionQuestion.accepted,
              }
            : {
                mode: 'exact',
                acceptedAnswers: extra.firstComprehensionQuestion.accepted,
              },
          hint: extra.firstComprehensionQuestion.progressiveHints[0],
          progressiveHints: extra.firstComprehensionQuestion.progressiveHints,
          explanationOnSuccess:
            'Concepto fundamental verificado con precisión. Avanza al Paso 2 para analizar la arquitectura y comprobar tu recuperación activa.',
        },
      ],
    },
    {
      taskNumber: 2,
      title: 'Arquitectura Interna, Protocolos bajo el Capó y Caso Real de Incidente',
      type: 'architecture-protocol',
      badgeText: 'Diagrama + Caso Real + Quiz 5 Preguntas',
      scaffoldingLevel: extra.scaffoldingLevel,
      readingParagraphs: [
        secondSec.content,
        extra.deepIntroParagraphs[2],
        `CASO REAL DE INGENIERÍA (${mod.realWorldCase.title}): ${mod.realWorldCase.context} Causa raíz técnica: ${mod.realWorldCase.technicalRootCause} Lección obligatoria: ${mod.realWorldCase.lesson}`,
      ],
      commandBlocks: [
        {
          label: 'Comprobar entorno en la Estación de Práctica',
          command: extra.labCommands[0]?.command || 'uname -a',
          explanation:
            'Puedes abrir la terminal interactiva en cualquier momento para experimentar con el comando de inspección.',
        },
      ],
      taskQuestions: [
        {
          id: `${mod.id}-t2-q1`,
          questionPrompt: `Verificación rápida de lectura del Caso Real: Según el análisis de "${mod.realWorldCase.title}", ¿cuál es el término clave n.º 1 del módulo (${mod.selfExplanationPrompt.keyTerms[0]}) involucrado en la causa raíz o su mitigación?`,
          placeholder: 'Escribe el término técnico clave...',
          acceptedAnswers: [
            mod.selfExplanationPrompt.keyTerms[0].toLowerCase(),
            ...(q0CorrectText ? [q0CorrectText.toLowerCase()] : []),
          ],
          validationSpec: {
            mode: 'exact',
            acceptedAnswers: [
              mod.selfExplanationPrompt.keyTerms[0].toLowerCase(),
              ...(mod.selfExplanationPrompt.keyTerms[1]
                ? [mod.selfExplanationPrompt.keyTerms[1].toLowerCase()]
                : []),
            ],
          },
          hint: `Revisa los conceptos clave del caso real (por ejemplo: ${mod.selfExplanationPrompt.keyTerms[0]}).`,
          progressiveHints: [
            `Empujón conceptual: Revisa el párrafo del Caso Real "${mod.realWorldCase.title}".`,
            `Concepto clave: Es el primer concepto clave de este dominio relacionado con ${mod.domain}.`,
            `Término esperado: Escribe "${mod.selfExplanationPrompt.keyTerms[0]}".`,
          ],
          explanationOnSuccess:
            'Lectura del caso real verificada. Completa ahora las 5 preguntas del cuestionario Active Recall inferior (mínimo 60% de acierto) para desbloquear el siguiente nivel.',
        },
      ],
    },
    {
      taskNumber: 3,
      title: `Laboratorio Práctico en Vivo (${extra.targetIp}): Auditoría y Captura de Flag`,
      type: 'attackbox-lab',
      badgeText: `Práctica en VM · ${extra.scaffoldingLevel}`,
      scaffoldingLevel: extra.scaffoldingLevel,
      readingParagraphs: extra.labWalkthroughParagraphs,
      commandBlocks: extra.labCommands,
      taskQuestions: [
        {
          id: `${mod.id}-t3-q1`,
          questionPrompt: extra.labQuestionPrompt,
          placeholder: 'FLAG{...} (capturada al ejecutar el ejercicio en la terminal)',
          acceptedAnswers: [extra.labFlagAnswer],
          validationSpec: {
            mode: 'flag',
            expectedFlag: extra.labFlagAnswer,
            requireVmCapture: true,
          },
          hint: extra.labProgressiveHints[0],
          progressiveHints: extra.labProgressiveHints,
          explanationOnSuccess: `¡Excelente ejecución verificada en la Máquina Virtual! Has capturado la bandera real del escenario de ${mod.domain}.`,
        },
      ],
    },
    {
      taskNumber: 4,
      title: 'Ingeniería Defensiva, Remediación de Causa Raíz y Hardening en Producción',
      type: 'defense-hardening',
      badgeText: 'Defensa & Parcheo Verificado',
      scaffoldingLevel: extra.scaffoldingLevel,
      readingParagraphs: extra.defenseDeepParagraphs,
      commandBlocks: [extra.defenseCommand],
      taskQuestions: [
        {
          id: `${mod.id}-t4-q1`,
          questionPrompt: extra.defenseQuestion.prompt,
          placeholder: extra.defenseQuestion.placeholder,
          acceptedAnswers: extra.defenseQuestion.accepted,
          validationSpec: extra.defenseQuestion.regexPattern
            ? {
                mode: 'regex',
                pattern: extra.defenseQuestion.regexPattern,
                flags: 'i',
                acceptedAnswers: extra.defenseQuestion.accepted,
              }
            : {
                mode: 'exact',
                acceptedAnswers: extra.defenseQuestion.accepted,
              },
          hint: extra.defenseQuestion.progressiveHints[0],
          progressiveHints: extra.defenseQuestion.progressiveHints,
          explanationOnSuccess: 'Remediación técnica validada con criterio de Ingeniería de Seguridad.',
        },
      ],
    },
    {
      taskNumber: 5,
      title: 'Consolidación Cognitiva: Escenario de Transferencia, Autoexplicación y Repaso Espaciado',
      type: 'neuro-consolidation',
      badgeText: 'Transferencia + Autoexplicación + DSR',
      scaffoldingLevel: extra.scaffoldingLevel,
      readingParagraphs: [
        'En esta etapa final consolidas el aprendizaje a largo plazo mediante tres pruebas independientes: (1) un Escenario de Transferencia inédito para medir tu capacidad de aplicar el conocimiento a un caso nuevo, (2) una Autoexplicación con tus propias palabras evaluada por conectores causales y precisión técnica, y (3) tu cola de tarjetas de Repetición Espaciada con recuperación escrita previa.',
      ],
      commandBlocks: [],
      taskQuestions: [],
    },
  ];
}

/**
 * Generates 6 structured FSRS flashcards for a given module when the student enters or studies the room.
 * Covers all 13 modules (mod-00 through mod-12), including rooms 06, 08, and 11, with both conceptual
 * and Cloze command completion cards.
 */
export function generateModuleFlashcards(mod: CurriculumModule, now: Date = new Date()): FSRSCard[] {
  const extra = MODULE_DEEP_EXTRAS[mod.id] ?? MODULE_DEEP_EXTRAS['mod-01'];
  const isoNow = now.toISOString();
  const cards: FSRSCard[] = [];

  // 1-3: Cards from the module's Active Recall questions
  mod.activeRecallQuestions.slice(0, 3).forEach((q, idx) => {
    const correctAns = q.options[q.correctIndex] ?? '';
    cards.push({
      id: `fsrs-${mod.id}-ar-${idx + 1}`,
      moduleId: mod.id,
      domain: mod.domain,
      concept: `${mod.number} · Concepto Clave #${idx + 1}`,
      question: q.question,
      expectedAnswer: `${correctAns}. ${q.explanation}`,
      keyTerms: mod.selfExplanationPrompt.keyTerms.slice(0, 4),
      stability: 0,
      difficulty: 5.0,
      reps: 0,
      lapses: 0,
      lastReview: isoNow,
      nextReview: isoNow,
      history: [],
    });
  });

  // 4: Cloze command card for the primary lab command
  const primaryCmd = extra.labCommands[0]?.command || mod.deliberatePractice.starterCommandOrCode;
  const cmdParts = primaryCmd.trim().split(/\s+/);
  const clozePrompt =
    cmdParts.length >= 2
      ? `Completa el comando técnico de ${mod.domain}: \`${cmdParts[0]} ___ ${cmdParts.slice(2).join(' ')}\` (${extra.labCommands[0]?.label || mod.deliberatePractice.prompt})`
      : `¿Qué comando utilizas en ${mod.domain} para: ${extra.labCommands[0]?.label || mod.deliberatePractice.prompt}?`;

  cards.push({
    id: `fsrs-${mod.id}-cloze-cmd`,
    moduleId: mod.id,
    domain: mod.domain,
    concept: `${mod.number} · Sintaxis de Comando (Cloze)`,
    question: clozePrompt,
    expectedAnswer: `Comando completo: \`${primaryCmd}\`. ${extra.labCommands[0]?.explanation || mod.deliberatePractice.feedbackSuccess}`,
    keyTerms: [cmdParts[0].toLowerCase(), ...mod.selfExplanationPrompt.keyTerms.slice(0, 2)],
    stability: 0,
    difficulty: 5.2,
    reps: 0,
    lapses: 0,
    lastReview: isoNow,
    nextReview: isoNow,
    history: [],
  });

  // 5: Defense & Hardening remediation card
  cards.push({
    id: `fsrs-${mod.id}-defense`,
    moduleId: mod.id,
    domain: mod.domain,
    concept: `${mod.number} · Ingeniería Defensiva y Remediación`,
    question: extra.defenseQuestion.prompt,
    expectedAnswer: `Respuesta técnica: \`${extra.defenseQuestion.accepted[0]}\`. Comando asociado: \`${extra.defenseCommand.command}\` (${extra.defenseCommand.explanation}).`,
    keyTerms: [extra.defenseQuestion.accepted[0].toLowerCase(), ...mod.selfExplanationPrompt.keyTerms.slice(0, 2)],
    stability: 0,
    difficulty: 5.4,
    reps: 0,
    lapses: 0,
    lastReview: isoNow,
    nextReview: isoNow,
    history: [],
  });

  // 6: Causal Mechanism & Real-World Case card
  cards.push({
    id: `fsrs-${mod.id}-case`,
    moduleId: mod.id,
    domain: mod.domain,
    concept: `${mod.number} · Causa Raíz: ${mod.realWorldCase.title}`,
    question: `En el caso real "${mod.realWorldCase.title}", ¿cuál fue la causa raíz técnica y qué lección defensiva obligatoria deja?`,
    expectedAnswer: `Causa raíz: ${mod.realWorldCase.technicalRootCause} Lección: ${mod.realWorldCase.lesson}`,
    keyTerms: mod.selfExplanationPrompt.keyTerms,
    stability: 0,
    difficulty: 5.5,
    reps: 0,
    lapses: 0,
    lastReview: isoNow,
    nextReview: isoNow,
    history: [],
  });

  return cards;
}
