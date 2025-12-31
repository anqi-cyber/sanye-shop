const ORDERS_KEY = 'sanye-my-orders';

export function rememberOrder(orderId) {
  try {
    const ids = listRememberedOrderIds();
    const next = [orderId, ...ids.filter((id) => id !== orderId)].slice(0, 30);
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
  } catch {
    // 忽略存储失败，订单仍可通过订单号查询。
  }
}

export function listRememberedOrderIds() {
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}
