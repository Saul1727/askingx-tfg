require('dotenv').config();
const prisma = require('./src/config/prisma');
const bcrypt = require('bcrypt');

const days = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function main() {
  console.log("🌱 Iniciando siembra de datos realistas para AskingValència...");

  const passwordHash = await bcrypt.hash("password123", 10);

  console.log("🧹 Limpiando base de datos...");
  await prisma.story.deleteMany();
  await prisma.fulfillment.deleteMany();
  await prisma.ask.deleteMany();
  await prisma.asker.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.user.deleteMany();

  // ─── 1. DOMINIOS ────────────────────────────────────────────────────────────
  console.log("🏷️  Creando Dominios...");
  const dSalud    = await prisma.domain.create({ data: { name: "Salud",        description: "Material sanitario, acompañamiento médico y atención sociosanitaria" } });
  const dEdu      = await prisma.domain.create({ data: { name: "Educación",    description: "Material escolar, clases de refuerzo y formación" } });
  const dTec      = await prisma.domain.create({ data: { name: "Tecnología",   description: "Equipos informáticos, soporte técnico y conectividad" } });
  const dAlim     = await prisma.domain.create({ data: { name: "Alimentación", description: "Alimentos, kits de higiene y productos de primera necesidad" } });
  const dJuridico = await prisma.domain.create({ data: { name: "Asesoría Jurídica", description: "Orientación legal, gestión de trámites y defensa de derechos" } });
  const dLogis    = await prisma.domain.create({ data: { name: "Logística",    description: "Transporte, almacenamiento y distribución de recursos" } });

  // ─── 2. USUARIOS ────────────────────────────────────────────────────────────
  console.log("👥 Creando Usuarios...");

  const admin = await prisma.user.create({
    data: { email: "admin@askingx.com", fullName: "Administrador AskingX", passwordHash, role: "ADMIN" }
  });

  // Authors
  const author1 = await prisma.user.create({
    data: { email: "author1@askingx.com", fullName: "María Soler (Gestora ONGs)", passwordHash, role: "AUTHOR" }
  });
  const author2 = await prisma.user.create({
    data: { email: "author2@askingx.com", fullName: "Pedro Navarro (Gestor Particulares)", passwordHash, role: "AUTHOR" }
  });

  // Connectors
  const conn1 = await prisma.user.create({
    data: {
      email: "connector1@askingx.com", fullName: "Laura Gómez (Salud / Alimentación)",
      passwordHash, role: "CONNECTOR",
      specialties: { connect: [{ id: dSalud.id }, { id: dAlim.id }] }
    }
  });
  const conn2 = await prisma.user.create({
    data: {
      email: "connector2@askingx.com", fullName: "Carlos Ibáñez (Tecnología / Logística)",
      passwordHash, role: "CONNECTOR",
      specialties: { connect: [{ id: dTec.id }, { id: dLogis.id }] }
    }
  });
  const conn3 = await prisma.user.create({
    data: {
      email: "connector3@askingx.com", fullName: "Elena Martí (Educación / Jurídica)",
      passwordHash, role: "CONNECTOR",
      specialties: { connect: [{ id: dEdu.id }, { id: dJuridico.id }] }
    }
  });

  // Givers
  const giver1 = await prisma.user.create({
    data: { email: "giver1@askingx.com", fullName: "Voluntario Juan Pérez", passwordHash, role: "GIVER",
      specialties: { connect: [{ id: dSalud.id }, { id: dAlim.id }] } }
  });
  const giver2 = await prisma.user.create({
    data: { email: "giver2@askingx.com", fullName: "Voluntaria Ana Torres", passwordHash, role: "GIVER",
      specialties: { connect: [{ id: dEdu.id }, { id: dJuridico.id }] } }
  });
  const giver3 = await prisma.user.create({
    data: { email: "giver3@askingx.com", fullName: "Donante Miguel Ríos (Empresa TechValencia)", passwordHash, role: "GIVER",
      specialties: { connect: [{ id: dTec.id }] } }
  });
  const giver4 = await prisma.user.create({
    data: { email: "giver4@askingx.com", fullName: "Abogada Carmen Vidal", passwordHash, role: "GIVER",
      specialties: { connect: [{ id: dJuridico.id }] } }
  });
  const giver5 = await prisma.user.create({
    data: { email: "giver5@askingx.com", fullName: "Transportista Roberto Sanz", passwordHash, role: "GIVER",
      specialties: { connect: [{ id: dLogis.id }] } }
  });

  // ─── 3. ASKERS ──────────────────────────────────────────────────────────────
  console.log("🏢 Creando Solicitantes (Askers)...");

  const cruzRoja = await prisma.asker.create({
    data: { organizationName: "Cruz Roja Valencia", contactPerson: "Directora Amparo Llopis",
      email: "amparo.llopis@cruzroja-vlc.org", phone: "963111222", address: "C/ Médico Peset Cervera, 12 - Valencia",
      askAuthorId: author1.id }
  });
  const caritas = await prisma.asker.create({
    data: { organizationName: "Cáritas Diocesana Valencia", contactPerson: "Coordinador Luis Ferrer",
      email: "luis.ferrer@caritas-valencia.org", phone: "963222333", address: "C/ Trinitarios, 5 - Valencia",
      askAuthorId: author1.id }
  });
  const bancoAlim = await prisma.asker.create({
    data: { organizationName: "Banco de Alimentos de Valencia", contactPerson: "Responsable Rosa Catalá",
      email: "rosa.catala@bav.org", phone: "963333444", address: "Polígono Vara de Quart - Valencia",
      askAuthorId: author1.id }
  });
  const famGarcia = await prisma.asker.create({
    data: { organizationName: "Particular - Familia García Sanz", contactPerson: "Marta García Sanz",
      email: "marta.garcia@gmail.com", phone: "612345678",
      askAuthorId: author2.id }
  });
  const anciano = await prisma.asker.create({
    data: { organizationName: "Particular - D. Antonio Ruiz", contactPerson: "Antonio Ruiz Hernández",
      email: "antoniorus65@gmail.com", phone: "611987654",
      askAuthorId: author2.id }
  });

  // ─── 4. ASKS ────────────────────────────────────────────────────────────────
  console.log("📝 Creando Peticiones variadas...");

  // ── CREATED (Borradores pendientes de aprobación) ──
  await prisma.ask.create({ data: {
    title: "200 kits de higiene personal para el albergue",
    description: "Cruz Roja gestiona un albergue de emergencia con 80 personas. Necesitamos kits básicos (jabón, champú, cepillo de dientes, pasta) para cubrir el próximo trimestre.",
    type: "THINGS", status: "CREATED", quantityRequested: 200,
    askerId: cruzRoja.id, askAuthorId: author1.id, domainId: dAlim.id
  }});

  await prisma.ask.create({ data: {
    title: "Tablet o portátil para estudiante con pocos recursos",
    description: "Familia monoparental con 2 hijos en edad escolar sin dispositivo para las clases online. Se necesita al menos 1 dispositivo funcional.",
    type: "THINGS", status: "CREATED", quantityRequested: 1,
    dueDate: days(30),
    askerId: famGarcia.id, askAuthorId: author2.id, domainId: dEdu.id
  }});

  // ── OPEN ──
  const askOpen1 = await prisma.ask.create({ data: {
    title: "50 lotes de alimentos básicos para familias",
    description: "El Banco de Alimentos necesita reponer existencias antes de la campaña de verano. Cada lote incluye: aceite, legumbres, pasta, conservas y leche. Para 50 familias en situación de vulnerabilidad.",
    type: "THINGS", status: "OPEN", quantityRequested: 50,
    dueDate: days(14),
    askerId: bancoAlim.id, askAuthorId: author1.id, domainId: dAlim.id
  }});

  await prisma.ask.create({ data: {
    title: "Clases de español para 8 personas migrantes",
    description: "Cáritas acoge a un grupo de 8 personas migrantes que necesitan clases de español básico para acceder al mercado laboral. Se buscan 2h semanales durante 3 meses.",
    type: "TIME", status: "OPEN", estimatedHours: 24,
    serviceLocation: "Sede Cáritas, C/ Trinitarios 5",
    dueDate: days(20),
    askerId: caritas.id, askAuthorId: author1.id, domainId: dEdu.id
  }});

  await prisma.ask.create({ data: {
    title: "Revisión médica básica para 15 personas sin hogar",
    description: "Cruz Roja organiza una jornada de atención sanitaria. Se necesita un médico o enfermero/a que dedique 4 horas a revisar tensión, glucosa y orientar sobre patologías crónicas.",
    type: "TIME", status: "OPEN", estimatedHours: 4,
    serviceLocation: "Centro de Día Cruz Roja, Valencia",
    dueDate: days(7),
    askerId: cruzRoja.id, askAuthorId: author1.id, domainId: dSalud.id
  }});

  await prisma.ask.create({ data: {
    title: "Asesoría para solicitud de ayudas SEPE",
    description: "D. Antonio, jubilado de 78 años, necesita ayuda para tramitar su solicitud de prestación complementaria. No sabe usar el ordenador y tiene dificultad para desplazarse a las oficinas.",
    type: "EXPERTISE", status: "OPEN",
    requiredSkill: "Trabajador/a Social o Gestor/a Administrativo",
    serviceLocation: "Domicilio del solicitante o visita a domicilio",
    dueDate: days(21),
    askerId: anciano.id, askAuthorId: author2.id, domainId: dJuridico.id
  }});

  // ── MATCHED (con progreso parcial para THINGS/TIME) ──
  const askMatched1 = await prisma.ask.create({ data: {
    title: "30 ordenadores reacondicionados para aula digital",
    description: "Cáritas ha habilitado un aula de formación digital para desempleados. Necesita 30 ordenadores de sobremesa o portátiles en buen estado con Windows instalado.",
    type: "THINGS", status: "MATCHED", quantityRequested: 30,
    dueDate: days(10),
    askerId: caritas.id, askAuthorId: author1.id, domainId: dTec.id,
    connectorId: conn2.id,
    givers: { connect: [{ id: giver3.id }] }
  }});
  // 12 de 30 ya entregados (primera tanda)
  await prisma.fulfillment.create({ data: {
    askId: askMatched1.id, giverId: giver3.id,
    quantityDelivered: 12,
    expertNotes: "Primera entrega: 12 portátiles Lenovo ThinkPad reacondicionados."
  }});

  const askMatched2 = await prisma.ask.create({ data: {
    title: "Transporte de alimentos: almacén central → 4 centros",
    description: "El Banco de Alimentos distribuye quincenalmente a 4 centros de la ciudad. Se necesita furgoneta o camión pequeño durante una mañana completa para la ruta.",
    type: "TIME", status: "MATCHED", estimatedHours: 8,
    serviceLocation: "Polígono Vara de Quart (salida) → Valencia ciudad",
    dueDate: days(5),
    askerId: bancoAlim.id, askAuthorId: author1.id, domainId: dLogis.id,
    connectorId: conn2.id,
    givers: { connect: [{ id: giver5.id }] }
  }});
  // 3 de 8 horas completadas
  await prisma.fulfillment.create({ data: {
    askId: askMatched2.id, giverId: giver5.id,
    quantityDelivered: 3,
    expertNotes: "Completados los 2 primeros centros de distribución sin incidencias."
  }});

  const askMatched3 = await prisma.ask.create({ data: {
    title: "Defensa legal en proceso de desahucio",
    description: "La Familia García lleva 3 meses en proceso de desahucio por impago derivado de ERTE. Necesita abogado/a colegiado/a que revise el caso y pueda representarles en la vista.",
    type: "EXPERTISE", status: "MATCHED",
    requiredSkill: "Abogado/a Colegiado (Derecho Civil / Arrendamientos)",
    serviceLocation: "Online + asistencia al juzgado (Valencia)",
    askerId: famGarcia.id, askAuthorId: author2.id, domainId: dJuridico.id,
    connectorId: conn3.id,
    givers: { connect: [{ id: giver4.id }] }
  }});

  // ── FULFILLED (con historial de fulfillments) ──
  const askFul1 = await prisma.ask.create({ data: {
    title: "100 mantas para el albergue de invierno",
    description: "Campaña de frío de Cruz Roja. El albergue necesitaba mantas de emergencia para la ola de frío de enero.",
    type: "THINGS", status: "FULFILLED", quantityRequested: 100,
    askerId: cruzRoja.id, askAuthorId: author1.id, domainId: dSalud.id,
    connectorId: conn1.id,
    givers: { connect: [{ id: giver1.id }, { id: giver3.id }] }
  }});
  await prisma.fulfillment.create({ data: {
    askId: askFul1.id, giverId: giver1.id, quantityDelivered: 60,
    expertNotes: "Primera donación: 60 mantas de lana de almacén particular."
  }});
  await prisma.fulfillment.create({ data: {
    askId: askFul1.id, giverId: giver3.id, quantityDelivered: 40,
    expertNotes: "Aportación final empresa TechValencia para completar el pedido."
  }});

  const askFul2 = await prisma.ask.create({ data: {
    title: "Reparación y puesta a punto del aula de informática",
    description: "El aula de 10 ordenadores llevaba 2 años sin mantenimiento. Necesitaba limpieza de hardware, formateo e instalación de software educativo.",
    type: "SERVICES", status: "FULFILLED",
    requiredSkill: "Técnico Informático",
    serviceLocation: "Sede Cáritas, C/ Trinitarios 5",
    askerId: caritas.id, askAuthorId: author1.id, domainId: dTec.id,
    connectorId: conn2.id,
    givers: { connect: [{ id: giver3.id }] }
  }});
  await prisma.fulfillment.create({ data: {
    askId: askFul2.id, giverId: giver3.id, quantityDelivered: 1,
    expertNotes: "Trabajo completado en 1 jornada. 10 equipos formateados con Windows 10 LTSC y LibreOffice. Todo operativo."
  }});

  const askFul3 = await prisma.ask.create({ data: {
    title: "Orientación laboral para jóvenes ex-tutelados",
    description: "3 jóvenes de entre 18-21 años que salen del sistema de tutela necesitaban orientación profesional: CV, entrevistas y búsqueda de empleo.",
    type: "EXPERTISE", status: "FULFILLED",
    requiredSkill: "Orientador/a Laboral o RRHH",
    serviceLocation: "Online (videoconferencia)",
    askerId: caritas.id, askAuthorId: author1.id, domainId: dEdu.id,
    connectorId: conn3.id,
    givers: { connect: [{ id: giver2.id }] }
  }});
  await prisma.fulfillment.create({ data: {
    askId: askFul3.id, giverId: giver2.id, quantityDelivered: 1,
    expertNotes: "3 sesiones de 1h con cada joven. Los 3 tienen ahora CV actualizado y han realizado entrevistas simuladas."
  }});

  // ── CANCELLED ──
  await prisma.ask.create({ data: {
    title: "Clases de conducción adaptada para persona con movilidad reducida",
    description: "El solicitante necesitaba clases con instructor especializado en vehículos adaptados.",
    type: "SERVICES", status: "CANCELLED",
    cancellationReason: "El solicitante ha obtenido financiación pública para costearlo por otra vía.",
    requiredSkill: "Instructor de conducción con vehículo adaptado",
    serviceLocation: "Academia de conducción adaptada",
    askerId: anciano.id, askAuthorId: author2.id, domainId: dLogis.id
  }});

  await prisma.ask.create({ data: {
    title: "10 sillas de ruedas para residencia",
    description: "La residencia necesitaba sillas de ruedas de segunda mano en buen estado.",
    type: "THINGS", status: "CANCELLED", quantityRequested: 10,
    cancellationReason: "La Conselleria de Sanitat ha donado las sillas directamente a la residencia.",
    askerId: cruzRoja.id, askAuthorId: author1.id, domainId: dSalud.id
  }});

  // ── EXPIRED (para demo del flujo de republish) ──
  await prisma.ask.create({ data: {
    title: "Acompañamiento médico para anciano: revisión cardiológica",
    description: "D. Antonio necesitaba que alguien le acompañase al cardiólogo del Hospital La Fe. La cita era en marzo.",
    type: "TIME", status: "EXPIRED", estimatedHours: 3,
    serviceLocation: "Hospital Universitario La Fe, Valencia",
    dueDate: days(-45),
    askerId: anciano.id, askAuthorId: author2.id, domainId: dSalud.id
  }});

  await prisma.ask.create({ data: {
    title: "Furgoneta para el evento de recogida solidaria de ropa",
    description: "Cruz Roja organizaba una jornada de recogida de ropa en 5 puntos de la ciudad. Necesitaba vehículo de carga para centralizar todo.",
    type: "TIME", status: "EXPIRED", estimatedHours: 6,
    serviceLocation: "Varios puntos de Valencia ciudad",
    dueDate: days(-30),
    askerId: cruzRoja.id, askAuthorId: author1.id, domainId: dLogis.id
  }});

  await prisma.ask.create({ data: {
    title: "20 mochilas escolares con material para inicio de curso",
    description: "Para familias en riesgo de exclusión cuyos hijos comienzan la ESO en septiembre. Plazo: antes del 1 de septiembre.",
    type: "THINGS", status: "EXPIRED", quantityRequested: 20,
    dueDate: days(-60),
    askerId: caritas.id, askAuthorId: author1.id, domainId: dEdu.id
  }});

  // ─── RESUMEN ────────────────────────────────────────────────────────────────
  console.log("\n✅ ¡Base de datos poblada con éxito!");
  console.log("─────────────────────────────────────────────────────────────");
  console.log("🔑 CUENTAS DE PRUEBA (contraseña para todas: password123)");
  console.log("─────────────────────────────────────────────────────────────");
  console.log("  ADMIN:       admin@askingx.com");
  console.log("  AUTHOR 1:    author1@askingx.com  → gestiona Cruz Roja, Cáritas, Banco Alimentos");
  console.log("  AUTHOR 2:    author2@askingx.com  → gestiona Familia García, D. Antonio");
  console.log("  CONNECTOR 1: connector1@askingx.com  (Salud / Alimentación)");
  console.log("  CONNECTOR 2: connector2@askingx.com  (Tecnología / Logística)");
  console.log("  CONNECTOR 3: connector3@askingx.com  (Educación / Jurídica)");
  console.log("  GIVER 1:     giver1@askingx.com   → Voluntario Juan Pérez");
  console.log("  GIVER 2:     giver2@askingx.com   → Voluntaria Ana Torres");
  console.log("  GIVER 3:     giver3@askingx.com   → Empresa TechValencia");
  console.log("  GIVER 4:     giver4@askingx.com   → Abogada Carmen Vidal");
  console.log("  GIVER 5:     giver5@askingx.com   → Transportista Roberto Sanz");
  console.log("─────────────────────────────────────────────────────────────");
  console.log("📊 RESUMEN DE PETICIONES CREADAS:");
  console.log("  CREATED:   2  (pendientes de aprobación admin)");
  console.log("  OPEN:      5  (buscando donantes)");
  console.log("  MATCHED:   3  (en curso — 2 con progreso parcial visible)");
  console.log("  FULFILLED: 3  (completadas con fulfillments reales)");
  console.log("  CANCELLED: 2  (con motivo de cancelación)");
  console.log("  EXPIRED:   3  (para demo del flujo republish/descartar)");
  console.log("─────────────────────────────────────────────────────────────");
}

main()
  .catch((e) => { console.error("❌ Error durante el seed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
