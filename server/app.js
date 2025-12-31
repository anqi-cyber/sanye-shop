import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStore } from './store.js';
import { ValidationError, parseOrderPayload } from './validation.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export function createApp({
  store = createStore(),
  staticDir = path.resolve(currentDir, '../dist'),
} = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  app.get(
    '/api/health',
    asyncRoute(async (_req, res) => {
      const products = await store.listProducts();
      res.json({ status: 'ok', products: products.length });
    }),
  );

  app.get(
    '/api/products',
    asyncRoute(async (req, res) => {
      const category = typeof req.query.category === 'string' ? req.query.category : 'all';
      const q = typeof req.query.q === 'string' ? req.query.q.slice(0, 80) : '';
      const products = await store.listProducts({ category, q });
      res.json({ products, count: products.length });
    }),
  );

  app.get(
    '/api/products/:id',
    asyncRoute(async (req, res) => {
      const product = await store.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: '这件商品不存在或已下架' });
      }
      return res.json({ product });
    }),
  );

  app.post(
    '/api/orders',
    asyncRoute(async (req, res) => {
      const payload = parseOrderPayload(req.body);
      const order = await store.createOrder(payload);
      res.status(201).json({ order });
    }),
  );

  app.get(
    '/api/orders/:id',
    asyncRoute(async (req, res) => {
      const order = await store.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: '没有找到这笔订单，请检查订单号' });
      }
      return res.json({ order });
    }),
  );

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: '接口不存在' });
  });

  if (staticDir && existsSync(path.join(staticDir, 'index.html'))) {
    app.use(
      express.static(staticDir, {
        index: false,
        maxAge: '1h',
      }),
    );
    app.use((req, res, next) => {
      if (req.method !== 'GET' || !req.accepts('html')) return next();
      return res.sendFile(path.join(staticDir, 'index.html'));
    });
  }

  app.use((_req, res) => {
    res.status(404).json({ error: '页面不存在' });
  });

  app.use((error, _req, res, _next) => {
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ error: '请求内容不是合法的 JSON' });
    }

    const status =
      error instanceof ValidationError ? 400 : Number(error.status) || 500;
    const message =
      status >= 500 ? '服务器开小差了，请稍后再试' : error.message;

    if (status >= 500) {
      console.error('[sanye-shop]', error);
    }

    return res.status(status).json({
      error: message,
      ...(error.code ? { code: error.code } : {}),
      ...(error.field ? { field: error.field } : {}),
    });
  });

  return app;
}
