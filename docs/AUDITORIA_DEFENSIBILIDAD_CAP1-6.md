# Auditoría de defensibilidad — Memoria TFG (portada + Cap. 1–6)

> Revisión hecha el 2026-06-10 cruzando **toda la memoria escrita** contra el **código real** del repositorio (servicios, middlewares, rutas, `package.json`, componentes del frontend). Objetivo: que ninguna afirmación de la memoria sea indefendible ante el tribunal, que no haya contradicciones internas y que la prosa no suene a IA. Guardado junto a `REVISION_CAP5_DISENO_DETALLADO.md` y `REVISION_CAP6_DESARROLLO.md`.

---

## 🔴 Fallo encontrado y CORREGIDO

**React Portals (era indefendible).** La memoria afirmaba que los modales usan *React Portals*. El código **no contiene `createPortal` en ningún sitio** (`frontend/src`): los modales se implementan con renderizado condicional + capa `fixed inset-0` + escalado explícito de `z-index` (`z-50`, `z-[60]`, `z-[100]`, `z-[110]`). Era el único punto donde la memoria decía lo **contrario** del código.

- **Estado:** corregido en Cap. 5 §Diseño de la interfaz y Cap. 6 §Frontend (subsección renombrada a «Superposición de modales y menús desplegables»).
- **Causa raíz:** `CLAUDE.md` recomienda *priorizar React Portals* para bugs de superposición, pero esa guía nunca se implementó. **El código es la fuente de verdad por encima de `CLAUDE.md`.**

---

## ✅ Afirmaciones verificadas como DEFENSIBLES (están en el código)

| Afirmación de la memoria | Verificado en |
|---|---|
| JWT 24h + bcrypt 10 rondas de sal | `backend/src/services/userService.js` |
| RBAC: middlewares de rol + by-pass de Admin | `backend/src/middlewares/roleMiddleware.js` |
| Anti-spoofing (autoría tomada del token, no del body) | `backend/src/controllers/askController.js` (≈ línea 38) |
| Filtrado de visibilidad a nivel de consulta por rol | `backend/src/services/askService.js` (`getAllAsks`) |
| Máquina de estados estricta (`validTransitions`) | `askService.js` (`updateAskStatus`) |
| Control de sobredonación + transacción atómica (`$transaction`) | `backend/src/services/fulfillmentService.js` |
| Caducidad automática → EXPIRED (`updateMany`) | `backend/src/services/cronService.js` |
| IA: Gemini 2.0 Flash + patrón fallback local | `backend/src/services/aiService.js` |
| Herencia de tabla única (entidad Ask) | `prisma/schema.prisma` + `askService.js` |
| Expertos (Connector/Giver) requieren ≥1 dominio (N:M) | `userService.js` (`createUser`) |
| Emails en el match (solo a givers recién asignados, sin bloquear) | `askService.js` (`matchAsk`) + dependencia `nodemailer` |
| Filtrado de givers por dominio al emparejar | `askService.js` (`matchAsk`) |
| i18n por diccionarios ES/CAT/EN + fallback a ES | `frontend/src/i18n/translations.js` |
| Imagen en las Historias de Impacto (subida, máx. 4 MB, logo por defecto) | `frontend/src/components/stories/StoryModal.jsx` + `storyService.js` |
| Drag & Drop **nativo** de HTML5 (no librería externa) | `frontend/src/pages/ConnectorKanban.jsx` (`onDragStart`/`onDrop`/`draggable`) |
| Giver NO puede registrar entregas («confianza asimétrica») | `backend/src/routes/fulfillmentRoutes.js` (rol GIVER excluido) |
| React 19 / Prisma v5 | `frontend/package.json` (`^19.2.6`) · `backend/package.json` (`^5.22.0`) |
| Republicación con cálculo de remanente (no duplica lo entregado) | `askService.js` (`republishAsk`) |
| Cuadros de mando / gráficas | dependencia `chart.js` + `statsService.js` |

Todo lo anterior puede demostrarse abriendo el fichero correspondiente.

---

## 🟡 Riesgos menores a vigilar (no son código, pero pueden preguntarte)

1. **Citas con número de página.** En el Cap. 2 hay `\cite[págs. 3-5]{canos_manley_2024}` y `\cite[págs. 54-56]{dsi_europe_report}`. No se pudieron verificar esas páginas. **Recomendación:** confirmar que existen y dicen lo citado; si hay duda, **eliminar el número de página** y citar la obra completa (más seguro).
2. **Cierre manual vs automático.** La tabla del Cap. 5 atribuye `MATCHED→FULFILLED` a «proceso automático»; el Cap. 6 añade el cierre manual anticipado (CU-11). Redactado como vía complementaria, **no se contradice**, pero conviene poder explicar en la defensa que son dos caminos al mismo estado: uno por cuota alcanzada (en `createFulfillment`) y otro por el endpoint de cambio de estado.

---

## 👍 Puntos fuertes

- **Coherencia narrativa:** los capítulos se referencian entre sí; la frontera *qué* (Cap. 5) / *cómo* (Cap. 6) está bien marcada y no hay duplicados literales.
- **Tono humano y honesto:** se reconocen limitaciones (baja lógica vs derecho de supresión, Scrum no formal, anonimización como mejora). Reduce el riesgo de «suena a IA» y suma credibilidad ante el tribunal.
- **Artefactos reales:** diagramas TikZ propios, tablas y fragmentos de código extraídos del repositorio. Nivel adecuado para la rama de Ingeniería del Software.
- **Sin afirmaciones infladas** (una vez corregido el Portals): lo escrito se corresponde con la implementación.

## ✍️ Notas de estilo (mejorables, no errores)

- Uso algo intensivo del **guion largo (—)** y de frases largas con varias subordinadas; partir alguna mejoraría la lectura en la versión final.
- Conectores algo repetidos («Por su parte», «Asimismo»). Menor.

---

## 📊 Nota de lo escrito (portada + Cap. 1–6)

**8,5 / 10 (Notable alto).**

- Sube a **9+** al: insertar las **capturas** (Kanban, Historia, UML, mockups), verificar las **2 citas con página** y completar los Cap. 7–10.
- Lo que impide el 10 hoy: capítulos finales aún vacíos (lógico) y los detalles pendientes de citas/capturas.

**Conclusión:** el trabajo va muy bien y, sobre todo, casi todo es defensible con el código en la mano. El único agujero serio (React Portals) ya está tapado.
