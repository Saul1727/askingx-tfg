# Revisión — Cap. 5 §Diseño Detallado (handoff para revisar al detalle)

> Documento generado para revisar en el otro dispositivo. Resume **qué se ha escrito**, **qué se vio en el resto de la memoria (sobre todo el Cap. 4)** y **qué decisiones de redacción se tomaron**, para poder verificar si está bien hecho. Al final hay una checklist de verificación.

---

## 1. Qué se ha escrito

Se ha rellenado la sección `\section{Diseño Detallado}` (estaba vacía) dentro del **Capítulo 5 — Diseño de la solución**, en el fichero `tfgetsinf/tfgetsinf/plantillatfg.tex`. Se ha dividido en **5 subsecciones**:

1. **Modelo de datos** — Diagrama de clases (placeholder de PNG) + justificación de dos decisiones: la entidad `User` única cualificada por rol, y la herencia de tabla única para `Ask`. Incluye una **tabla** (`tab:herencia-ask`) que mapea cada tipo de petición con su campo específico (THINGS→quantityRequested, TIME→estimatedHours, EXPERTISE→requiredSkill, SERVICES→serviceLocation).

2. **Ciclo de vida de la petición** — La **figura estrella**: máquina de estados dibujada en **TikZ** (`fig:maquina-estados`), con el flujo CREATED→OPEN→MATCHED→FULFILLED más las ramas a CANCELLED y EXPIRED y el bucle de republicación. Acompañada de una **tabla exhaustiva de transiciones** (`tab:transiciones`): origen, destino, evento y responsable.

3. **Reglas de negocio e invariantes** — Una **tabla** (`tab:invariantes`) con 6 invariantes que el diseño garantiza: control de sobredonación, cierre automático, autoría no falsificable (anti-spoofing), aislamiento por consulta, especialidad obligatoria y baja lógica.

4. **Decisiones de diseño transversales** — 4 decisiones en prosa: notificación por email en el emparejamiento, filtrado de donantes por dominio, imagen en las Historias de Impacto y gestión de especialidades por el Admin.

5. **Diseño de la interfaz** — Placeholder de capturas/mockups + criterios de diseño: renderizado por rol y patrón **React Portals** para la superposición de modales/desplegables.

---

## 2. Qué se vio en el resto de la memoria (análisis de solapamientos)

Antes de escribir se revisaron los 10 capítulos para que esta sección **no repita** lo que ya está escrito. Hallazgos clave:

### Lo que ya estaba escrito y NO se debía repetir
- **Cap. 3 §Sprint 3 (línea ~339):** ya explica anti-spoofing, filtrado por consulta (*query-level filtering*) y la agregación de Fulfillments.
- **Cap. 3 §Metodología (línea ~261):** ya narra la decisión Match→Fulfilled y el patrón *Human-in-the-loop*.
- **Cap. 4 §Requisitos (RF-07, RF-08):** ya enumeran en lenguaje natural las reglas del ciclo de vida.
- **Cap. 4 §Modelado Conceptual (línea ~438):** ya tiene un diagrama TikZ de entidades **abstracto** (`fig:modelo-conceptual`).
- **Cap. 4 §RGPD (línea ~477):** ya menciona RBAC + filtrado por consulta + baja lógica.
- **Cap. 5 §Arquitectura (línea ~711, ~716):** ya introduce la "confianza asimétrica" (el Giver no escribe Fulfillments) y **menciona el concepto** de herencia de tabla única.

### ⭐ Promesa pendiente que el Cap. 4 dejaba abierta
En el **Cap. 4 §Modelado Conceptual (línea ~467)** el texto dice literalmente que la entidad `User` única "**se justifica en detalle en el capítulo de diseño**". Es decir, había una **deuda** que esta sección **tenía que cubrir**. Por eso la subsección "Modelo de datos" incluye expresamente la justificación del `User` único frente a una tabla por rol. **→ Verificar que esto se lee coherente con lo prometido en Cap. 4.**

---

## 3. Decisiones de redacción tomadas

1. **Frontera "qué" vs "cómo" (la decisión más importante).** Para no chocar con el futuro **Cap. 6 — Desarrollo**, este capítulo describe **qué se diseñó y por qué** (diagramas, reglas, invariantes) y deja el **cómo se programó** (código, middlewares, consultas) para el Cap. 6. Esto se dice explícitamente en el párrafo introductorio de la sección. Las reglas de negocio aparecen aquí como **invariantes** (qué se garantiza) y su implementación se reservará al Cap. 6.

2. **Concepto vs detalle en la herencia de tabla única.** Como el Cap. 5 §Arquitectura ya *menciona* el concepto, aquí no se reexplica: se da el **detalle concreto** (qué campo cualifica cada tipo) y se enlaza con un "como se adelantó en la arquitectura...".

3. **Modelo físico vs conceptual.** El diagrama de Cap. 4 es **abstracto** (entidades + cardinalidades). El de aquí es el **modelo de clases implementado** (atributos, tipos, claves de Prisma) → se apoya en el PNG del UML, no se duplica el TikZ conceptual.

4. **La máquina de estados como formalización, no como narración.** Cap. 3/4 ya *cuentan* el ciclo de vida en prosa. Aquí se aporta lo que faltaba: el **diagrama** + la **tabla formal de transiciones**. Se evita volver a narrar la historia del Human-in-the-loop.

5. **Las invariantes se consolidan, no se renarran.** Anti-spoofing y filtrado por consulta ya estaban sueltos en Cap. 3. Aquí se **agrupan sistemáticamente** en una tabla como artefacto de diseño (útil para luego verificarlas en el Cap. 8 Pruebas), sin repetir la narración.

6. **Decisiones transversales: vía libre.** Emails en el match, filtrado de givers por dominio, imagen en Historias y edición de especialidades por el Admin **no aparecían en ningún otro capítulo** → se escriben aquí sin riesgo de duplicado.

7. **Estilo.** Se ha imitado el tono del resto de la memoria: prosa reflexiva con matices honestos, términos en inglés en `\textit{}`, tablas con `booktabs`/`tabularx`, figuras TikZ con la misma paleta (azul `blue!8`, gris, flechas `Stealth`) para que **no parezca generado por IA** y sea visualmente consistente.

---

## 4. Placeholders dejados (cosas que TÚ tienes que subir)

En el `.tex` hay dos marcas `% TODO (Saúl)`:
- **`Diagrama_UML_Corregido.png`** → diagrama de clases UML (lo tienes hecho). Va en `fig:diagrama-clases`. Hay que descomentar el `\includegraphics` y borrar el `\fbox` provisional.
- **Capturas/mockups de la interfaz** → van en `fig:mockups`.

---

## 5. Checklist de verificación (para el revisor)

- [ ] **¿Compila el TikZ de la máquina de estados sin descuadres?** Es la pieza con más riesgo geométrico (flechas a CANCELLED/EXPIRED y el bucle dashed de republicación).
- [ ] ¿La justificación del `User` único encaja con lo prometido en Cap. 4 (línea ~467)?
- [ ] ¿La tabla de transiciones (`tab:transiciones`) coincide exactamente con la lógica real del backend (estados y responsables)? En especial: ¿quién dispara FULFILLED y EXPIRED es realmente el "proceso automático"?
- [ ] ¿Las 6 invariantes son correctas y ninguna se contradice con el código?
- [ ] ¿Hay alguna frase que repita textualmente algo del Cap. 3 §Sprint 3 o Cap. 5 §Arquitectura? (objetivo: 0 duplicados literales)
- [ ] ¿El reparto "qué aquí / cómo en Cap. 6" se sostiene, o alguna parte se ha metido demasiado en implementación?
- [ ] ¿Los términos técnicos están todos en `\textit{}` de forma consistente?

---

## 6. Recomendación adicional dada

Se sugirió crear **un diagrama de secuencia del flujo de entrega parcial** (Connector registra Fulfillment → acumula → comprueba sobredonación → transiciona a FULFILLED) para el **Cap. 6**. Ese se puede hacer en TikZ (no hace falta dibujarlo a mano). Los **casos de uso** que ya tienes hechos podrían reforzar el **Cap. 4 §Requisitos** si se quiere.
