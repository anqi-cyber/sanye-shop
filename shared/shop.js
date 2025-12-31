export const CATEGORIES = [
  { id: 'all', name: '全部好物' },
  { id: 'tableware', name: '器物' },
  { id: 'fragrance', name: '香氛' },
  { id: 'stationery', name: '文具' },
  { id: 'pantry', name: '食品' },
  { id: 'home', name: '家居' },
];

export const FREE_SHIPPING_THRESHOLD = 199;
export const STANDARD_SHIPPING_FEE = 10;
export const EXPRESS_SHIPPING_FEE = 18;
export const EXPRESS_FREE_THRESHOLD = 399;

export const SHIPPING_METHODS = [
  {
    id: 'standard',
    name: '标准配送',
    description: '预计 2–4 个工作日送达',
  },
  {
    id: 'express',
    name: '顺丰加急',
    description: '预计 1–2 个工作日送达',
  },
];

export const PAYMENT_METHODS = [
  { id: 'online', name: '在线支付', description: '演示环境，不会真实扣款' },
  { id: 'cod', name: '货到付款', description: '收货时向配送员付款' },
];

export const ORDER_STATUS = {
  pending: { label: '待发货', tone: 'warm' },
  shipped: { label: '配送中', tone: 'cool' },
  completed: { label: '已完成', tone: 'calm' },
  cancelled: { label: '已取消', tone: 'muted' },
};

/**
 * 前后端共用的运费计算，服务端始终以这里的结果为准。
 * @param {number} subtotal
 * @param {'standard' | 'express'} method
 */
export function getShippingFee(subtotal, method = 'standard') {
  if (method === 'express') {
    return subtotal >= EXPRESS_FREE_THRESHOLD ? 0 : EXPRESS_SHIPPING_FEE;
  }
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

export function getShippingMethod(id) {
  return SHIPPING_METHODS.find((method) => method.id === id);
}

export function getPaymentMethod(id) {
  return PAYMENT_METHODS.find((method) => method.id === id);
}
