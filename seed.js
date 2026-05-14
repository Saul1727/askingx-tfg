const prisma = require('./src/config/prisma');

async function main() {
  console.log("Inyectando dominio en la base de datos...");
  
  const nuevoDominio = await prisma.domain.create({
    data: {
      name: "Material Sanitario",
      description: "Sillas de ruedas, muletas, vendas, etc."
    }
  });

  console.log("✅ ¡Dominio creado con éxito!");
  console.log("Copia este ID en tu Postman ->", nuevoDominio.id);
}

main()
  .catch(e => {
    console.error("❌ Error:", e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });