import {
  PAYMENT_METHODS,
  SHIPPING_METHODS,
} from '../shared/shop.js';

export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.code = 'VALIDATION_ERROR';
    this.field = field;
  }
}

function asObject(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError('请求数据格式不正确', field);
  }
  return value;
}

function cleanText(value, { field, label, min = 0, max = 100 }) {
  if (typeof value !== 'string') {
    throw new ValidationError(`请填写${label}`, field);
  }
  const text = value.trim();
  if (text.length < min) {
    throw new ValidationError(
      min <= 1 ? `请填写${label}` : `${label}至少需要 ${min} 个字符`,
      field,
    );
  }
  if (text.length > max) {
    throw new ValidationError(`${label}不能超过 ${max} 个字符`, field);
  }
  return text;
}

function normalizePhone(value) {
  const phone = String(value ?? '').replace(/[\s-]/g, '');
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    throw new ValidationError('请输入有效的 11 位手机号', 'customer.phone');
  }
  return phone;
}

export function parseOrderPayload(body) {
  const payload = asObject(body, 'body');
  const customerInput = asObject(payload.customer, 'customer');

  const customer = {
    name: cleanText(customerInput.name, {
      field: 'customer.name',
      label: '收货人姓名',
      min: 2,
      max: 30,
    }),
    phone: normalizePhone(customerInput.phone),
    province: cleanText(customerInput.province, {
      field: 'customer.province',
      label: '省份',
      min: 2,
      max: 30,
    }),
    city: cleanText(customerInput.city, {
      field: 'customer.city',
      label: '城市',
      min: 2,
      max: 30,
    }),
    district: cleanText(customerInput.district, {
      field: 'customer.district',
      label: '区 / 县',
      min: 1,
      max: 30,
    }),
    address: cleanText(customerInput.address, {
      field: 'customer.address',
      label: '详细地址',
      min: 4,
      max: 120,
    }),
    note:
      typeof customerInput.note === 'string'
        ? cleanText(customerInput.note, {
            field: 'customer.note',
            label: '订单备注',
            max: 200,
          }) || ''
        : '',
  };

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new ValidationError('购物车是空的，无法提交订单', 'items');
  }
  if (payload.items.length > 30) {
    throw new ValidationError('单次订单商品种类不能超过 30 种', 'items');
  }

  const seen = new Set();
  const items = payload.items.map((item, index) => {
    const input = asObject(item, `items.${index}`);
    const productId = cleanText(input.productId, {
      field: `items.${index}.productId`,
      label: '商品编号',
      max: 60,
    });
    if (seen.has(productId)) {
      throw new ValidationError('购物车中存在重复商品', 'items');
    }
    seen.add(productId);

    const quantity = Number(input.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new ValidationError('每件商品数量需为 1–20 的整数', `items.${index}.quantity`);
    }
    return { productId, quantity };
  });

  const shipping = payload.shipping ?? 'standard';
  if (!SHIPPING_METHODS.some((method) => method.id === shipping)) {
    throw new ValidationError('请选择有效的配送方式', 'shipping');
  }

  const payment = payload.payment ?? 'online';
  if (!PAYMENT_METHODS.some((method) => method.id === payment)) {
    throw new ValidationError('请选择有效的支付方式', 'payment');
  }

  return { customer, items, shipping, payment };
}
