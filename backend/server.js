require('dotenv').config();
const app = require('./src/app');
const { startCronJobs } = require('./src/services/cronService');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  // Iniciamos los trabajos programados en segundo plano
  startCronJobs();
});
