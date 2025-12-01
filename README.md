# API de Pedidos

API simples em Node.js + Express com SQLite para gerenciar pedidos.

## Requisitos
- Node.js >= 18 (npm)

## Instalação
```powershell
npm install
```

## Executar
- Desenvolvimento (recarrega com nodemon):
```powershell
npm run dev
```
- Produção:
```powershell
npm start
```

A API sobe em `http://localhost:3000`.

## Endpoints
- Criar pedido (POST) `http://localhost:3000/order`
- Obter por ID (GET) `http://localhost:3000/order/:orderId`
- Listar todos (GET) `http://localhost:3000/order/list`
- Atualizar (PUT) `http://localhost:3000/order/:orderId`
- Deletar (DELETE) `http://localhost:3000/order/:orderId`

## Formato de Entrada (POST/PUT)
```json
{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    { "idItem": "2434", "quantidadeItem": 1, "valorItem": 1000 }
  ]
}
```

## Mapeamento para Persistência
- `numeroPedido` -> `orderId`
- `valorTotal` -> `value` (inteiro)
- `dataCriacao` -> `creationDate` (ISO, Z)
- `items[].idItem` -> `productId` (number)
- `items[].quantidadeItem` -> `quantity`
- `items[].valorItem` -> `price`

## Exemplo cURL (criar pedido)
```bash
curl --location 'http://localhost:3000/order' \
--header 'Content-Type: application/json' \
--data '{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    { "idItem": "2434", "quantidadeItem": 1, "valorItem": 1000 }
  ]
}'
```

## Banco de Dados
- Arquivo: `data/database.sqlite`
- Tabelas:
  - `"Order"(orderId TEXT PK, value INTEGER, creationDate TEXT)`
  - `Items(orderId TEXT FK, productId INTEGER, quantity INTEGER, price INTEGER)`
