require('dotenv').config(); // Carga las variables de tu archivo .env
const app = require('./src/app');

// Usamos el puerto del .env, o el 3000 por defecto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[API] 🚀 Servidor encendido y escuchando en http://localhost:${PORT}`);
  console.log(`[API] 🩺 Health check disponible en http://localhost:${PORT}/api/health`);
});