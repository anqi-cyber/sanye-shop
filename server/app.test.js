import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from './app.js';
import { createStore } from './store.js';

const fixtureProducts = [
  {
    id: 'test-mug',
    name: '测试马克杯',
    subtitle: '测试商品',
    category: 'tableware',
    price: 100,
    stock: 5,
    image: '/images/products/mug.svg',
    badge: '手作',
    description: '用于接口测试的商品。',
    details: ['测试规格'],
  },
  {
    id: 'test-soap',
    name: '测试手工皂',
    subtitle: '测试商品',
    category: 'fragrance',
    price: 120,
    stock: 2,
    image: '/images/products/soap.svg',
    badge: null,
    description: '用于接口测试的商品。',
    details: ['测试规格'],
  },
];

const validCustomer = {
  name: '林小满',
  phone: '13800138000',
  province: '浙江省',
  city: '杭州市',
  district: '西湖区',
  address: '青芝坞 18 号',
  note: '请放在门口',
};

test('购物 API 端到端流程', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'sanye-shop-'));
  const dataFile = path.join(directory, 'db.json');
  const store = createStore({ dataFile, products: fixtureProducts });
  const app = createApp({ store, staticDir: null });
  const server = app.listen(0);

  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  });

  const request = async (pathname, options = {}) => {
    const response = await fetch(`${baseUrl}${pathname}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    return { status: response.status, body: await response.json() };
  };

  let createdOrder;

  await t.test('健康检查与商品列表', async () => {
    const health = await request('/api/health');
    assert.equal(health.status, 200);
    assert.equal(health.body.products, 2);

    const list = await request('/api/products');
    assert.equal(list.status, 200);
    assert.equal(list.body.products.length, 2);
    assert.equal(list.body.products[0].stock, 5);
  });

  await t.test('商品详情与分类筛选', async () => {
    const detail = await request('/api/products/test-mug');
    assert.equal(detail.body.product.name, '测试马克杯');

    const filtered = await request('/api/products?category=fragrance');
    assert.equal(filtered.body.products.length, 1);
    assert.equal(filtered.body.products[0].id, 'test-soap');

    const missing = await request('/api/products/not-found');
    assert.equal(missing.status, 404);
  });

  await t.test('参数校验会拦截非法订单', async () => {
    const result = await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer: { ...validCustomer, phone: '123' },
        items: [{ productId: 'test-mug', quantity: 1 }],
        shipping: 'standard',
        payment: 'online',
      }),
    });
    assert.equal(result.status, 400);
    assert.match(result.body.error, /手机号/);
  });

  await t.test('创建订单并扣减库存', async () => {
    const result = await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer: validCustomer,
        items: [{ productId: 'test-mug', quantity: 2 }],
        shipping: 'standard',
        payment: 'online',
      }),
    });

    assert.equal(result.status, 201);
    createdOrder = result.body.order;
    assert.match(createdOrder.id, /^SY\d{8}[A-F0-9]{6}$/);
    assert.equal(createdOrder.subtotal, 200);
    assert.equal(createdOrder.shipping.fee, 0);
    assert.equal(createdOrder.total, 200);
    assert.equal(createdOrder.status, 'pending');

    const detail = await request('/api/products/test-mug');
    assert.equal(detail.body.product.stock, 3);
  });

  await t.test('库存不足时返回 409', async () => {
    const result = await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer: validCustomer,
        items: [{ productId: 'test-mug', quantity: 4 }],
        shipping: 'express',
        payment: 'cod',
      }),
    });
    assert.equal(result.status, 409);
    assert.match(result.body.error, /库存不足/);
  });

  await t.test('可以按订单号查询订单', async () => {
    const result = await request(`/api/orders/${createdOrder.id}`);
    assert.equal(result.status, 200);
    assert.equal(result.body.order.customer.name, validCustomer.name);

    const missing = await request('/api/orders/SY00000000AAAAAA');
    assert.equal(missing.status, 404);
  });

  await t.test('数据已持久化，重启后仍可读取', async () => {
    const reopened = createStore({ dataFile, products: fixtureProducts });
    const order = await reopened.getOrder(createdOrder.id);
    const products = await reopened.listProducts();

    assert.equal(order.id, createdOrder.id);
    assert.equal(products.find((product) => product.id === 'test-mug').stock, 3);
  });
});
