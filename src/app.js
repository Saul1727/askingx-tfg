// src/app.js
const express = require('express');
const errorHandler = require('./middlewares/errorHandler');
const userRoutes = require('./routes/userRoutes');
const askerRoutes = require('./routes/askerRoutes');
const askRoutes = require('./routes/askRoutes');
const fulfillmentRoutes = require('./routes/fulfillmentRoutes');


const app = express();

// Middleware para parsear el body de las peticiones a JSON
app.use(express.json());

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

// Middleware global de errores (DEBE ir al final de todo)
app.use(errorHandler);

module.exports = app;