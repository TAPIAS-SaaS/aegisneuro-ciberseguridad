# AegisNeuro — Sistema Inteligente de Aprendizaje de Ciberseguridad

Plataforma progresiva de formación en ciberseguridad basada en ciencia cognitiva (**Active Recall**, **Repetición Espaciada con Modelo DSR de 4 grados**, **Práctica Deliberada en Estación Linux Stateful**, **Práctica Intercalada** y **Autoexplicación Causal con Tutor Socrático**).

## Características Principales

- **13 Salas Progresivas (Sala 00 a Sala 12)** organizadas en 4 rutas de aprendizaje:
  - **Ruta 1 · Pre-Security y Fundamentos (Salas 00 a 04)**: Introducción desde Cero Absoluto, Arquitectura x86-64/Memoria, Linux y Windows Internals, Redes TCP/IP y Automatización con Python/Bash.
  - **Ruta 2 · Pentesting y Seguridad Web (Salas 05 a 08)**: Criptografía Aplicada, Seguridad de Redes/Nmap/Firewall, OWASP Top 10/SQLi y Gestión de Vulnerabilidades CVE/CVSS/EPSS.
  - **Ruta 3 · Blue Team, SOC y Forense DFIR (Salas 09 a 10)**: Detección SIEM/Sysmon/Reglas Sigma y Análisis Forense de Memoria RAM con Volatility 3.
  - **Ruta 4 · Red Teaming y Seguridad Cloud (Salas 11 a 12)**: Active Directory (Kerberoasting) y Seguridad en Kubernetes/Contenedores.
- **5 Pasos Cognitivos por Sala**:
  1. **Predicción Previa + Teoría Profunda + Glosario + Tutor Socrático**: activa esquemas previos antes de leer y ofrece asistencia socrática que guía con preguntas sin revelar banderas.
  2. **Recuperación Activa (Active Recall)**: 5 preguntas de opción múltiple con distribución equilibrada, umbral mínimo del 60% y generación automática de tarjetas de refuerzo al fallar.
  3. **Práctica Deliberada con Estación Linux Bajo Demanda**: emulador de terminal Linux interactivo y con estado por nodo (`linux-target`, `net-sensor`, `soc-siem`, `web- vulnerable-app`, `forensics-box`, `ad-dc01`, `cloud-k8s-node`), pistas progresivas de 3 niveles y verificación criptográfica de captura de bandera en sesión.
  4. **Defensa (Hardening) y Autoexplicación Causal**: evaluación de conectores causales, vocabulario técnico y densidad léxica (anti-*keyword stuffing*).
  5. **Escenario de Transferencia + Repetición Espaciada DSR (4 Grados)**: pregunta de transferencia independiente y tarjetas espaciadas con intento escrito obligatorio antes de voltear y 4 calificaciones (`Otra vez`, `Difícil`, `Bien`, `Fácil`).
- **Gestión Transparente del Estudiante**:
  - **Test de Nivel Inicial (10 preguntas)** para recomendar la sala de partida adecuada.
  - **Inventario del Mazo DSR**, exportación/importación de progreso en JSON validado con `zod` y reinicio limpio a cero.

## Requisitos y Ejecución Local

1. Clonar el repositorio e instalar dependencias:
   ```bash
   npm install
   ```
2. (Opcional) Configurar `GEMINI_API_KEY` en un archivo `.env` para habilitar respuestas en vivo del Tutor Socrático en el servidor Express (`server.ts`). Si se despliega como sitio estático (por ejemplo en GitHub Pages), el tutor conmuta automáticamente al motor socrático local determinista.
3. Iniciar el servidor de desarrollo (puerto 3000):
   ```bash
   npm run dev
   ```
4. Ejecutar pruebas unitarias y validación de tipos TypeScript (`strict: true`):
   ```bash
   npm test
   npm run lint
   npm run build
   ```

## Licencia

Distribuido bajo la licencia **Apache-2.0**. Consulta el archivo [LICENSE](./LICENSE) para más detalles.
