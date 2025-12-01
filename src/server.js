import express from 'express';
import { initDb } from './db/database.js';
import orderRoutes from './routes/order.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Verifica se a API está respondendo
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rotas principais da API de pedidos
app.use('/', orderRoutes);

// Inicializa o banco e, ao concluir, inicia o servidor
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
