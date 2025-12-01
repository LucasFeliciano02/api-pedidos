import { db } from '../db/database.js';

export function createOrder(order) {
  const { orderId, value, creationDate, items } = order;
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.run(
        'INSERT INTO "Order" (orderId, value, creationDate) VALUES (?, ?, ?)',
        [orderId, value, creationDate],
        (err) => {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }

          const stmt = db.prepare(
            'INSERT INTO Items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)'
          );

          for (const item of items) {
            stmt.run([orderId, item.productId, item.quantity, item.price], (ierr) => {
              if (ierr) {
                stmt.finalize(() => db.run('ROLLBACK'));
                return reject(ierr);
              }
            });
          }

          stmt.finalize((ferr) => {
            if (ferr) {
              db.run('ROLLBACK');
              return reject(ferr);
            }
            db.run('COMMIT', (cerr) => {
              if (cerr) return reject(cerr);
              resolve();
            });
          });
        }
      );
    });
  });
}

export function getOrderById(orderId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT orderId, value, creationDate FROM "Order" WHERE orderId = ?', [orderId], (err, orderRow) => {
      if (err) return reject(err);
      if (!orderRow) return resolve(null);

      db.all('SELECT productId, quantity, price FROM Items WHERE orderId = ?', [orderId], (ierr, itemRows) => {
        if (ierr) return reject(ierr);
        resolve({ ...orderRow, items: itemRows });
      });
    });
  });
}

export function listOrders() {
  return new Promise((resolve, reject) => {
    db.all('SELECT orderId, value, creationDate FROM "Order"', [], (err, orders) => {
      if (err) return reject(err);
      if (orders.length === 0) return resolve([]);

      const placeholders = orders.map(() => '?').join(',');
      const ids = orders.map((o) => o.orderId);

      db.all(`SELECT orderId, productId, quantity, price FROM Items WHERE orderId IN (${placeholders})`, ids, (ierr, items) => {
        if (ierr) return reject(ierr);
        const itemsByOrder = items.reduce((acc, it) => {
          acc[it.orderId] = acc[it.orderId] || [];
          acc[it.orderId].push({ productId: it.productId, quantity: it.quantity, price: it.price });
          return acc;
        }, {});
        const result = orders.map((o) => ({ ...o, items: itemsByOrder[o.orderId] || [] }));
        resolve(result);
      });
    });
  });
}

export function updateOrder(orderId, order) {
  const { value, creationDate, items } = order;
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.run('UPDATE "Order" SET value = ?, creationDate = ? WHERE orderId = ?', [value, creationDate, orderId], (err) => {
        if (err) {
          db.run('ROLLBACK');
          return reject(err);
        }

        db.run('DELETE FROM Items WHERE orderId = ?', [orderId], (derr) => {
          if (derr) {
            db.run('ROLLBACK');
            return reject(derr);
          }

          if (!items || items.length === 0) {
            db.run('COMMIT', (cerr) => (cerr ? reject(cerr) : resolve()));
            return;
          }

          const stmt = db.prepare('INSERT INTO Items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)');
          for (const item of items) {
            stmt.run([orderId, item.productId, item.quantity, item.price], (ierr) => {
              if (ierr) {
                stmt.finalize(() => db.run('ROLLBACK'));
                return reject(ierr);
              }
            });
          }
          stmt.finalize((ferr) => {
            if (ferr) {
              db.run('ROLLBACK');
              return reject(ferr);
            }
            db.run('COMMIT', (cerr) => (cerr ? reject(cerr) : resolve()));
          });
        });
      });
    });
  });
}

export function deleteOrder(orderId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM "Order" WHERE orderId = ?', [orderId], function (err) {
      if (err) return reject(err);
      resolve(this.changes); // number of rows affected
    });
  });
}
