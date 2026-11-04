import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const SocraticRequestSchema = z.object({
  question: z.string().trim().min(1, 'La consulta no puede estar vacía.').max(1500, 'La consulta excede el límite de 1500 caracteres.'),
  studentLevel: z.enum(['Principiante', 'Intermedio', 'Avanzado', 'Senior']).optional().default('Principiante'),
  learningStyle: z.enum(['visual_analogies', 'step_by_step_commands', 'deep_technical']).optional().default('visual_analogies'),
  activeModuleTitle: z.string().trim().max(200).optional().default('Ciberseguridad Aplicada'),
  activeLessonTitle: z.string().trim().max(200).optional().default(''),
  terminalContext: z.string().trim().max(800).optional().default(''),
  weakConcepts: z.array(z.string().trim().max(120)).max(15).optional().default([]),
  mode: z.enum(['socratic', 'simplify_for_beginner', 'evaluate_self_explanation']).optional().default('socratic'),
  hintLevel: z.number().int().min(1).max(3).optional().default(1),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().max(2000),
      })
    )
    .max(12)
    .optional()
    .default([]),
});

type SocraticRequestPayload = z.infer<typeof SocraticRequestSchema>;

// Simple per-IP sliding window rate limiter (30 requests per 5 minutes)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitMap.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

function getGenAIClient(): GoogleGenAI | null {
  const envKey = process.env.GEMINI_API_KEY;
  if (!envKey || envKey === 'MY_GEMINI_API_KEY' || envKey.trim() === '' || envKey.startsWith('AQ.')) {
    return null;
  }

  return new GoogleGenAI({
    apiKey: envKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Generates a strict Socratic fallback response locally when the API key is absent or network fails.
 * Never leaks exact lab flags or final exploit commands; asks 1 guiding question at a time.
 */
function buildSocraticFallbackResponse(params: SocraticRequestPayload): string {
  const q = params.question.toLowerCase();
  const moduleContext = params.activeModuleTitle || 'Ciberseguridad General';
  const weakList =
    params.weakConcepts.length > 0
      ? params.weakConcepts.slice(0, 2).join(', ')
      : 'privilegios del proceso y validación de entradas';

  if (params.mode === 'simplify_for_beginner') {
    return [
      `### Explicación Intuitiva desde Cero · ${moduleContext}`,
      '',
      '**1. Analogía del mundo real:**',
      'Imagina un edificio donde cada empleado tiene una tarjeta que solo abre su oficina. Una vulnerabilidad ocurre cuando una puerta confía en una orden verbal sin comprobar la tarjeta, o cuando una herramienta interna tiene pegada la llave maestra del director.',
      '',
      '**2. Qué observar en este módulo:**',
      '- Primero identifica **qué componente** toma la decisión de confianza (el kernel, el protocolo de red o la consulta de base de datos).',
      '- Luego comprueba cómo separar los **datos del usuario** de las **instrucciones del sistema**.',
      '',
      '**Pregunta socrática (1 sola):** ¿Qué dato o permiso en este escenario está siendo aceptado por el sistema sin verificar quién lo envía?',
    ].join('\n');
  }

  if (params.mode === 'evaluate_self_explanation') {
    return [
      `### Revisión Socrática de tu Autoexplicación · ${moduleContext}`,
      '',
      'He analizado tu explicación con nuestra rúbrica local:',
      '- Asegúrate de conectar la **causa técnica** con su **consecuencia** usando conectores causales (*porque*, *por lo tanto*, *debido a*).',
      '- Verifica que hayas mencionado tanto el mecanismo del fallo como el control defensivo que lo corrige de raíz.',
      '',
      '**Pregunta de profundización:** ¿Qué ocurriría exactamente en el sistema si aplicamos el control defensivo y el atacante vuelve a enviar el mismo payload?',
    ].join('\n');
  }

  if (q.includes('suid') || q.includes('privilegio') || q.includes('linux') || q.includes('4000') || q.includes('cap')) {
    const hintByLevel =
      params.hintLevel === 1
        ? '**Pista Nivel 1 (Empujón conceptual):** Piensa en la diferencia entre quién lanza un comando (Real UID) y qué identidad evalúa el kernel cuando el archivo tiene un bit especial de propietario.'
        : params.hintLevel === 2
          ? '**Pista Nivel 2 (Concepto clave):** Recuerda que el permiso octal `4000` (SUID) se busca con `find` filtrando por `-perm`, mientras que las capacidades extendidas del inodo requieren otra utilidad (`getcap`).'
          : '**Pista Nivel 3 (Estructura general):** Usa `find / -perm ...` descartando errores con `2>/dev/null` para localizar el binario, y para remediarlo usa `chmod` quitando el bit `s` del usuario (`u-s`).';

    return [
      `### Guía Socrática Local · ${moduleContext} (Nivel de Pista ${params.hintLevel}/3)`,
      '',
      hintByLevel,
      '',
      '**Pregunta para que des el siguiente paso por ti mismo:** Cuando un binario propiedad de `root` tiene activo ese permiso especial, ¿con qué valor numérico de `EUID` lo ejecuta el kernel y cómo lo revocarías sin borrar el archivo?',
    ].join('\n');
  }

  if (q.includes('sql') || q.includes('inyeccion') || q.includes('owasp') || q.includes('web') || q.includes('xss')) {
    return [
      `### Guía Socrática Local · Seguridad Web (Nivel de Pista ${params.hintLevel}/3)`,
      '',
      '- **Observación clave:** El motor de base de datos construye un árbol sintáctico (AST) a partir de la cadena SQL. Si concatenas el texto del usuario con `+`, una comilla simple cierra el literal de datos y permite inyectar un operador booleano.',
      '',
      '**Pregunta socrática:** Si en lugar de concatenar cadenas usamos marcadores de posición (`$1` o `?`), ¿en qué momento compila el motor la estructura SQL y cómo trata el dato enviado por el usuario?',
    ].join('\n');
  }

  return [
    `### Guía Socrática Local · ${moduleContext} (Nivel de Pista ${params.hintLevel}/3)`,
    '',
    `Analicemos tu consulta sobre **"${params.question.slice(0, 120)}"** sin darte la respuesta masticada:`,
    '',
    `- **Pista gradual:** Relaciona este problema con **${weakList}**. Observa primero la tabla de referencia de la tarea activa para identificar qué herramienta inspecciona este estado sin modificarlo.`,
    '',
    '**Tu turno (1 sola pregunta):** ¿Qué hipótesis tienes sobre cuál es la causa raíz en este paso y qué comando de lectura usarías para comprobarla?',
  ].join('\n');
}

async function startServer() {
  const app = express();

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  app.use(express.json({ limit: '32kb' }));

  app.post('/api/tutor/socratic', async (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
      return res.status(429).json({
        error: 'Has alcanzado el límite de consultas por minuto. Reflexiona sobre la pista actual e inténtalo en unos instantes.',
      });
    }

    const parsed = SocraticRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Solicitud inválida para el tutor socrático.',
      });
    }

    const payload = parsed.data;
    const ai = getGenAIClient();

    if (!ai) {
      return res.json({
        reply: buildSocraticFallbackResponse(payload),
        source: 'fallback',
        modelUsed: 'socratic-local-fallback',
      });
    }

    const systemInstruction = [
      'Eres el Mentor Socrático Personalizado de AegisNeuro, una plataforma científica de formación en ciberseguridad estilo TryHackMe.',
      `Nivel actual del estudiante: ${payload.studentLevel}. Estilo de aprendizaje preferido: ${payload.learningStyle}. Módulo activo: ${payload.activeModuleTitle}. Lección activa: ${payload.activeLessonTitle || 'General'}. Modo: ${payload.mode}. Nivel de pista solicitado: ${payload.hintLevel}/3.`,
      payload.terminalContext ? `Contexto reciente de la terminal VM del estudiante: ${payload.terminalContext}` : '',
      `Conceptos que el estudiante debe reforzar en su memoria espaciada: ${payload.weakConcepts.length > 0 ? payload.weakConcepts.join(', ') : 'ninguno registrado aún'}.`,
      'REGLAS SOCRÁTICAS ESTRICTAS E INQUEBRANTABLES:',
      '1. PROHIBIDO dar la solución final, el comando completo de explotación listo para copiar y pegar, o cualquier bandera FLAG{...}.',
      '2. Haz SIEMPRE UNA SOLA pregunta socrática al final de tu respuesta para guiar al alumno a descubrir el siguiente paso por sí mismo.',
      '3. Si el estilo es "visual_analogies", usa analogías cotidianas muy claras para alguien que empieza desde cero. Si es "step_by_step_commands", explica qué hace cada parámetro en la consola.',
      '4. Si el modo es "evaluate_self_explanation", evalúa si el alumno explicó el mecanismo causal (por qué ocurre y cómo se mitiga), señala qué parte estuvo bien y hazle 1 pregunta sobre lo que le faltó precisar.',
      '5. Responde siempre en español claro y riguroso.',
    ].filter(Boolean).join('\n');

    const contents = [
      ...payload.history.map((turn) => ({
        role: turn.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: turn.content }],
      })),
      {
        role: 'user' as const,
        parts: [{ text: payload.question }],
      },
    ];

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        return res.json({
          reply: buildSocraticFallbackResponse(payload),
          source: 'fallback',
          modelUsed: 'socratic-local-fallback',
        });
      }

      return res.json({
        reply: replyText,
        source: 'ai',
        modelUsed: 'gemini-3.8-flash',
      });
    } catch (_err) {
      return res.json({
        reply: buildSocraticFallbackResponse(payload),
        source: 'fallback',
        modelUsed: 'socratic-local-fallback',
      });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AegisNeuro Cyber Learning Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
