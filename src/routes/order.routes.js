import express from 'express';
import { createOrder, getOrderById, listOrders, updateOrder, deleteOrder } from '../repositories/orderRepository.js';

const router = express.Router();

// Valida o JSON de entrada e mapeia para o schema interno
function validateAndMap(body) {
  const errors = [];
  const numeroPedido = body?.numeroPedido;
  const valorTotal = body?.valorTotal;
  const dataCriacao = body?.dataCriacao;
  const items = body?.items;

  if (!numeroPedido || typeof numeroPedido !== 'string') errors.push('numeroPedido é obrigatório e deve ser string');
  if (typeof valorTotal !== 'number' || !Number.isFinite(valorTotal)) errors.push('valorTotal é obrigatório e deve ser número');
  if (!dataCriacao || typeof dataCriacao !== 'string') errors.push('dataCriacao é obrigatório e deve ser string ISO');
  if (!Array.isArray(items) || items.length === 0) errors.push('items é obrigatório e deve ser um array com ao menos 1 item');

  const date = new Date(dataCriacao);
  if (isNaN(date.getTime())) errors.push('dataCriacao inválida');

  const mappedItems = [];
  if (Array.isArray(items)) {
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const idItem = it?.idItem;
      const quantidadeItem = it?.quantidadeItem;
      const valorItem = it?.valorItem;
      const productId = typeof idItem === 'string' ? parseInt(idItem, 10) : idItem;
      if (!Number.isInteger(productId)) errors.push(`items[${i}].idItem deve ser número`);
      if (!Number.isInteger(quantidadeItem) || quantidadeItem <= 0) errors.push(`items[${i}].quantidadeItem deve ser inteiro positivo`);
      if (typeof valorItem !== 'number' || !Number.isFinite(valorItem)) errors.push(`items[${i}].valorItem deve ser número`);
      mappedItems.push({ productId, quantity: quantidadeItem, price: valorItem });
    }
  }

  if (errors.length) {
    const err = new Error('Erro de validação');
    err.status = 400;
    err.details = errors;
    throw err;
  }

  return {
    orderId: numeroPedido,
    value: valorTotal,
    creationDate: date.toISOString(),
    items: mappedItems,
  };
}

// Cria um novo pedido
router.post('/order', async (req, res) => {
  try {
    const order = validateAndMap(req.body);
    await createOrder(order);
    return res.status(201).json({ message: 'Pedido criado com sucesso', orderId: order.orderId });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({ error: 'Dados inválidos', detalhes: err.details });
    }
    if (err && err.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'Pedido já existe' });
    }
    console.error('Erro ao criar pedido:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obtém um pedido por ID
router.get('/order/:orderId', async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    return res.status(200).json(order);
  } catch (err) {
    console.error('Erro ao obter pedido:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Lista todos os pedidos
router.get('/order/list', async (_req, res) => {
  try {
    const orders = await listOrders();
    return res.status(200).json(orders);
  } catch (err) {
    console.error('Erro ao listar pedidos:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualiza um pedido existente
router.put('/order/:orderId', async (req, res) => {
  try {
    const mapped = validateAndMap({ ...req.body, numeroPedido: req.params.orderId });
    const existing = await getOrderById(req.params.orderId);
    if (!existing) return res.status(404).json({ error: 'Pedido não encontrado' });
    await updateOrder(req.params.orderId, mapped);
    return res.status(200).json({ message: 'Pedido atualizado com sucesso' });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({ error: 'Dados inválidos', detalhes: err.details });
    }
    console.error('Erro ao atualizar pedido:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Remove um pedido por ID
router.delete('/order/:orderId', async (req, res) => {
  try {
    const deleted = await deleteOrder(req.params.orderId);
    if (!deleted) return res.status(404).json({ error: 'Pedido não encontrado' });
    return res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar pedido:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
