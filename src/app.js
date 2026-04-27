// src/app.js
const express = require('express');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware para parsear el body de las peticiones a JSON
app.use(express.json());

// Ruta de comprobación de salud (Healthcheck)
app.app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor AskingX funcionando' });
});

// Aquí irán nuestras rutas en el futuro
// app.use('/api/users', userRoutes);

// Middleware global de errores (DEBE ir al final de todo)
app.use(errorHandler);

module.exports = app;