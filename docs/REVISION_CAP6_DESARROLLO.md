# Revisión — Cap. 6 «Desarrollo de la solución propuesta» (handoff para revisar al detalle)

> Documento generado para revisar en el otro dispositivo. Resume **qué se ha escrito**, **el estudio previo del proyecto**, **las decisiones de redacción** y **cómo se ha evitado repetir o contradecir** otros capítulos. Al final, checklist de verificación. (`git pull` para tenerlo; recuerda commit + push antes de cerrar.)

---

## 1. Estudio previo realizado (antes de escribir)

Para redactar el Cap. 6 con fidelidad **se leyó tanto la documentación como el código real** del proyecto, no solo los `.md`. Fuentes consultadas:

- **Docs:** `DECISIONES_TECNICAS.md`, `FLUJO_PETICIONES.md`, `IMPLEMENTACION_ADMIN.md`, `IMPLEMENTACION_CU05.md` (IA), `IMPLEMENTACION_CU10.md` (expiración), `IMPLEMENTACION_CU11.md` (entrega parcial), `IMPLEMENTACION_I18N.md`, `guia_defensa_tecnica.md`.
- **Código backend real** (fuente de verdad, por encima de los docs): `askService.js`, `fulfillmentService.js`, `aiService.js`, `cronService.js`, `userService.js`, `askController.js`, `authMiddleware.js`, `roleMiddleware.js`, `errorHandler.js`.

**Hallazgo importante de coherencia:** el doc `IMPLEMENTACION_CU05.md` dice «Gemini 1.5 Flash», pero el **código real** (`aiService.js`) usa `gemini-2.0-flash` (un comentario explica que los nombres 1.5 fueron retirados de la API). En el capítulo se ha escrito lo que dice **el código** (`gemini-2.0-flash`), no el doc desactualizado.

---

## 2. Qué se ha escrito

Se han rellenado las **5 secciones** del Cap. 6 (estaban vacías), todas centradas en el **«cómo» técnico** y apoyadas en fragmentos de código reales extraídos del repositorio:

1. **Separación por capas lógicas** — Recorrido real de una petición HTTP (ruta → middlewares → controlador/Zod → servicio → Prisma) + el gestor de errores centralizado. Incluye un **diagrama TikZ del flujo entre capas** (`fig:flujo-capas`) y un **fragmento de código** del `errorHandler` (`lst:errorhandler`).

2. **Backend y persistencia** — Prisma como puente UML→BD; autenticación (bcrypt 10 rondas, JWT 24h con payload `{userId, role}`); los dos middlewares (auth + rol con by-pass de Admin); **anti-spoofing** (fragmento `lst:antispoofing`); **máquina de estados** en el servicio (fragmento `lst:statemachine` con la tabla `validTransitions`); **filtrado por consulta** (fragmento `lst:visibilidad` con el `OR` del Connector).

3. **Frontend** — SPA (main.jsx, App.jsx, ruta protegida, layout con outlet); capa de servicios con `fetch` + inyección del token; programación defensiva; **formularios polimórficos** (crear/editar + mutación por tipo STI); fechas/zonas horarias; **superposición de modales** (overlay `fixed inset-0` + escalado de `z-index`, NO React Portals — corregido el 2026-06-10 tras comprobar que el código no usa `createPortal`); **tablero Kanban** con Drag&Drop nativo (placeholder de captura `fig:kanban`); **i18n** (diccionarios + contexto + fallback ES).

4. **Integración de IA** — Aislamiento en un único módulo; modelo `gemini-2.0-flash` por HTTP; **patrón de fallback** (fragmento `lst:iafallback`): sin clave → plantilla local (coste 0); si Gemini falla → plantilla. Precondiciones, upsert 1:1 y visibilidad por rol. Placeholder de captura `fig:historia-ia`.

5. **Flujo relacional (1 a N)** — Entregas parciales: agregación `_sum`, control de sobredonación, cierre automático, **transacción atómica** (fragmento `lst:fulfillment`); **diagrama de secuencia TikZ** del registro de una entrega (`fig:secuencia-fulfillment`); cierre manual anticipado; republicación con cálculo de remanente; expiración por **cron** (`node-cron`, `updateMany` delegado a PostgreSQL).

---

## 3. Cómo se evitó repetir o contradecir otros capítulos

La regla rectora fue la **frontera "qué" (Cap. 5) vs "cómo" (Cap. 6)** acordada en la revisión anterior. En concreto:

| Tema | Dónde estaba el "qué/por qué" | Qué aporta el Cap. 6 (sin repetir) |
|---|---|---|
| Capas / arquitectura | Cap. 5 §Arquitectura | El recorrido real de una petición y el `errorHandler` (código) |
| Máquina de estados | Cap. 5 Fig./Tabla de transiciones | El `validTransitions` en el servicio; **se cita** `\ref{fig:maquina-estados}` |
| Invariantes (sobredonación, anti-spoofing, filtrado…) | Cap. 5 Tabla `tab:invariantes` | Su **materialización en código**; se cita la tabla y se dice «se enunció en el Cap. 5» |
| Anti-spoofing / filtrado por consulta | Cap. 3 §Sprint 3 (narrado) | El fragmento exacto y el `where` dinámico de Prisma |
| Render por rol / Kanban / DnD | Cap. 3 §Sprint 4-5 y Cap. 5 | Implementación con hooks, Portals, capa de servicios |
| Ética de la IA | Cap. 4 §RGPD/IA | **No se repite**: se referencia explícitamente al Cap. 4 |

**Posible contradicción evitada (importante):** la tabla del Cap. 5 atribuye `MATCHED→FULFILLED` a «proceso automático», pero existe además un **cierre manual anticipado** (CU-11 «forzar cierre»). Para no contradecir, en el Cap. 6 el cierre automático se presenta como vía principal y el manual como **afordancia complementaria** bajo confirmación, sin reetiquetar la tabla del Cap. 5.

**Matiz sobre quién aprueba (revisar):** la máquina de estados del código permite `CREATED→OPEN` a roles no-Admin, mientras el Cap. 5 atribuyó esa transición al Admin. Se resolvió **separando dos planos**: la tabla `validTransitions` decide qué transiciones son *estructuralmente* válidas; *quién* puede invocarlas lo deciden los middlewares de rol. Así no se contradice el Cap. 5. **→ Conviene que verifiques que esto encaja con cómo lo quieres defender.**

---

## 4. Decisiones de redacción

- **Apoyo en código real:** se incluyen 5 fragmentos (`lstlisting`) extraídos del repositorio. Para ello se añadió el paquete `listings` al preámbulo (estilo `codigofuente`). Los comentarios de los fragmentos se dejaron **sin acentos** a propósito (compatibilidad de `listings` con `inputenc utf8`).
- **Diagramas propios en TikZ** (no requieren que subas nada): flujo entre capas y diagrama de secuencia de la entrega parcial, con la **misma paleta** que el resto de la memoria (azul `blue!8`, gris, flechas `Stealth`) para que no desentonen ni parezcan IA.
- **Tono:** prosa formal pero natural, nivel de TFG de Ingeniería del Software, evitando la cadencia robótica. Términos técnicos en `\textit{}`.

---

## 5. Referencias bibliográficas (verificadas antes de añadir)

Se añadieron **2 referencias nuevas al `.bib`**, ambas comprobadas online antes de incluirlas:

- **`gemini_api_docs`** → https://ai.google.dev/gemini-api/docs — verificada (página oficial «Gemini API | Google AI for Developers»).
- **`node_cron_docs`** → https://github.com/node-cron/node-cron — verificada (repositorio oficial del paquete).

El resto de citas del capítulo reutiliza referencias ya existentes: `prisma_docs`, `react_doc`, `mdn_fetch`, `mdn_dnd`, `jwt_rfc`, `bcrypt_docs`.

---

## 6. Imágenes que TIENES que subir (marcadas con `% TODO (Saúl)`)

1. **`fig:kanban`** — captura del tablero del Connector con sus columnas de estado.
2. **`fig:historia-ia`** — captura del modal de Historia de Impacto con el texto generado por la IA.

(Los dos diagramas TikZ —flujo de capas y secuencia— ya están hechos y no requieren nada.)

---

## 7. Checklist de verificación (para el revisor)

- [ ] **¿Compila?** Comprobar especialmente: el paquete `listings`, los 5 `lstlisting` y el **diagrama de secuencia TikZ** (`fig:secuencia-fulfillment`), que es el de mayor riesgo geométrico.
- [ ] ¿Algún fragmento de código contradice el código real del repo? (se transcribieron de `errorHandler.js`, `askController.js`, `askService.js`, `aiService.js`, `fulfillmentService.js`).
- [ ] ¿El modelo de IA citado (`gemini-2.0-flash`) es el que quieres que aparezca, o prefieres una formulación más genérica («familia Gemini Flash»)? Ahora aparecen ambas.
- [ ] ¿El matiz «máquina de estados estructural vs autorización por rol» (punto 3) encaja con tu discurso de defensa?
- [ ] ¿Se repite literalmente algo de Cap. 3 §Sprint 3 o Cap. 5? (objetivo: 0 duplicados literales; solo referencias cruzadas).
- [ ] ¿Las dos referencias nuevas aparecen bien renderizadas en el capítulo de Referencias?
- [ ] ¿Los fragmentos de código se ven bien (no se desbordan del margen)? `breaklines` está activado, pero conviene mirarlo.

---

## 8. Siguiente paso sugerido

Quedan por rellenar: **título + keywords + 3 resúmenes** (siguen con `????`), y los capítulos **7 Implantación**, **8 Pruebas**, **9 Conclusiones** y **10 Trabajos futuros**. El natural sería el **Cap. 7 Implantación** (despliegue en Supabase + PaaS), o cerrar antes la portada (título/resúmenes).
