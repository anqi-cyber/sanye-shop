export class ApiError extends Error {
  constructor(message, status = 0, code = 'API_ERROR', field = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  try {
    const response = await fetch(path, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError(
        data?.error || `请求失败（${response.status}）`,
        response.status,
        data?.code,
        data?.field,
      );
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'AbortError') throw error;
    throw new ApiError(
      '无法连接服务器，请确认 npm run dev 已启动',
      0,
      'NETWORK_ERROR',
    );
  }
}

export const api = {
  getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') {
      query.set('category', params.category);
    }
    if (params.q) query.set('q', params.q);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request(`/api/products${suffix}`);
  },

  getProduct(id, options = {}) {
    return request(`/api/products/${encodeURIComponent(id)}`, options);
  },

  createOrder(payload) {
    return request('/api/orders', { method: 'POST', body: payload });
  },

  getOrder(id, options = {}) {
    return request(`/api/orders/${encodeURIComponent(id)}`, options);
  },
};
