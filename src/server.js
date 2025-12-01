import express from 'express';
import { initDb } from './db/database.js';
import orderRoutes from './routes/order.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/', orderRoutes);

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API de pedidos ouvindo em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Falha ao inicializar o banco de dados:', err);
    process.exit(1);
  });
