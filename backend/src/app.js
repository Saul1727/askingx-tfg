// src/app.js
const express = require('express');
const errorHandler = require('./middlewares/errorHandler');
const userRoutes = require('./routes/userRoutes');
const askerRoutes = require('./routes/askerRoutes');
const askRoutes = require('./routes/askRoutes');
const fulfillmentRoutes = require('./routes/fulfillmentRoutes');
const domainRoutes = require('./routes/domainRoutes');
const statsRoutes = require('./routes/statsRoutes');
const configRoutes = require('./routes/configRoutes');
const storyRoutes = require('./routes/storyRoutes');
const cors = require('cors');

const app = express();

app.use(cors());
// Middleware para parsear el body de las peticiones a JSON.
// Límite ampliado para admitir imágenes embebidas (data URL) en las Historias de Impacto.
app.use(express.json({ limit: '6mb' }));

// Ruta de comprobación de salud (Healthcheck)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor AskingX funcionando' });
});

// Rutas de usuarios
app.use('/api/users', userRoutes);
// Rutas de solicitantes (Askers)
app.use('/api/askers', askerRoutes);
// Rutas de peticiones (Asks)
app.use('/api/asks', askRoutes);
// Rutas de entregas (Fulfillments)
app.use('/api/fulfillments', fulfillmentRoutes);
// Rutas de dominios temáticos
app.use('/api/domains', domainRoutes);
// Rutas de estadísticas
app.use('/api/stats', statsRoutes);
// Rutas de configuración global
app.use('/api/config', configRoutes);
// Rutas de historias de impacto (CU-05)
app.use('/api/stories', storyRoutes);

// Middleware global de errores (DEBE ir al final de todo)
app.use(errorHandler);

module.exports = app;