import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSeedProducts } from './seed.js';
import {
  getPaymentMethod,
  getShippingFee,
  getShippingMethod,
} from '../shared/shop.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_DATA_FILE =
  process.env.SANYE_DB_FILE || path.join(currentDir, 'data', 'db.json');

export class StoreError extends Error {
  constructor(message, status = 400, code = 'STORE_ERROR') {
    super(message);
    this.name = 'StoreError';
    this.status = status;
    this.code = code;
  }
}

function createInitialDb(products) {
  return {
    version: 1,
    products: structuredClone(products),
    orders: [],
  };
}

function formatDatePart(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function generateOrderId(existingOrders) {
  const existingIds = new Set(existingOrders.map((order) => order.id));
  let id;
  do {
    const suffix = randomBytes(3).toString('hex').toUpperCase();
    id = `SY${formatDatePart()}${suffix}`;
  } while (existingIds.has(id));
  return id;
}

/**
 * 一个极简的 JSON 数据库。
 * 所有写操作都串行执行，并通过临时文件 + rename 原子落盘。
 */
export function createStore({
  dataFile = DEFAULT_DATA_FILE,
  products = createSeedProducts(),
} = {}) {
  let db = null;
  let loadPromise = null;
  let mutationQueue = Promise.resolve();

  async function persist() {
    await mkdir(path.dirname(dataFile), { recursive: true });
    const tempFile = `${dataFile}.${process.pid}.tmp`;
    await writeFile(tempFile, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
    await rename(tempFile, dataFile);
  }

  async function load() {
    if (db) return;
    if (!loadPromise) {
      loadPromise = (async () => {
        try {
          const raw = await readFile(dataFile, 'utf8');
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed.products) || !Array.isArray(parsed.orders)) {
            throw new Error('数据文件缺少 products 或 orders 数组');
          }
          db = parsed;
        } catch (error) {
          if (error.code !== 'ENOENT') {
            throw new Error(`无法读取数据文件 ${dataFile}：${error.message}`);
          }
          db = createInitialDb(products);
          await persist();
        }
      })();
    }
    await loadPromise;
  }

  function enqueue(operation) {
    const run = mutationQueue.then(operation, operation);
    mutationQueue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async function listProducts({ category = 'all', q = '' } = {}) {
    await mutationQueue;
    await load();
    const keyword = String(q).trim().toLowerCase();
    return db.products
      .filter((product) => category === 'all' || product.category === category)
      .filter((product) => {
        if (!keyword) return true;
        return [product.name, product.subtitle, product.description]
          .join(' ')
          .toLowerCase()
          .includes(keyword);
      })
      .map((product) => structuredClone(product));
  }

  async function getProduct(id) {
    await mutationQueue;
    await load();
    const product = db.products.find((entry) => entry.id === id);
    return product ? structuredClone(product) : null;
  }

  async function createOrder({ customer, items, shipping, payment }) {
    return enqueue(async () => {
      await load();

      const shippingMethod = getShippingMethod(shipping);
      const paymentMethod = getPaymentMethod(payment);
      if (!shippingMethod) {
        throw new StoreError('请选择有效的配送方式', 400, 'INVALID_SHIPPING');
      }
      if (!paymentMethod) {
        throw new StoreError('请选择有效的支付方式', 400, 'INVALID_PAYMENT');
      }

      const requested = new Map();
      for (const item of items) {
        requested.set(
          item.productId,
          (requested.get(item.productId) || 0) + item.quantity,
        );
      }

      const lines = [];
      for (const [productId, quantity] of requested) {
        const product = db.products.find((entry) => entry.id === productId);
        if (!product) {
          throw new StoreError('部分商品已下架，请刷新后重试', 400, 'PRODUCT_NOT_FOUND');
        }
        if (product.stock < quantity) {
          throw new StoreError(
            `「${product.name}」库存不足，仅剩 ${product.stock} 件`,
            409,
            'OUT_OF_STOCK',
          );
        }
        lines.push({
          productId: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
          subtotal: product.price * quantity,
        });
      }

      const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
      const shippingFee = getShippingFee(subtotal, shipping);
      const order = {
        id: generateOrderId(db.orders),
        createdAt: new Date().toISOString(),
        status: 'pending',
        customer: structuredClone(customer),
        items: lines,
        subtotal,
        shipping: {
          method: shippingMethod.id,
          name: shippingMethod.name,
          fee: shippingFee,
        },
        payment: {
          method: paymentMethod.id,
          name: paymentMethod.name,
        },
        total: subtotal + shippingFee,
      };

      const quantityByProduct = new Map(lines.map((line) => [line.productId, line.quantity]));
      db = {
        ...db,
        products: db.products.map((product) => {
          const quantity = quantityByProduct.get(product.id);
          return quantity
            ? { ...product, stock: product.stock - quantity }
            : product;
        }),
        orders: [order, ...db.orders],
      };
      await persist();
      return structuredClone(order);
    });
  }

  async function getOrder(id) {
    await mutationQueue;
    await load();
    const normalizedId = String(id || '').trim().toUpperCase();
    const order = db.orders.find((entry) => entry.id === normalizedId);
    return order ? structuredClone(order) : null;
  }

  return {
    dataFile,
    listProducts,
    getProduct,
    createOrder,
    getOrder,
  };
}
