import { computed, ref, watch } from 'vue';
import { useToast } from '@/composables/useToast';

const CART_KEY = 'sanye-cart-v1';

function readCart() {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          Number.isFinite(item.price) &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0,
      )
      .map((item) => ({ ...item, quantity: Math.min(item.quantity, item.stock || 99) }));
  } catch {
    return [];
  }
}

const items = ref(readCart());
const isCartOpen = ref(false);

watch(
  items,
  (value) => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(value));
    } catch {
      // 隐私模式下 localStorage 可能不可用，购物车在当前页面内仍然有效。
    }
  },
  { deep: true },
);

const count = computed(() =>
  items.value.reduce((sum, item) => sum + item.quantity, 0),
);
const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
);

export function useCart() {
  const { show } = useToast();

  function openCart() {
    isCartOpen.value = true;
  }

  function closeCart() {
    isCartOpen.value = false;
  }

  function add(product, quantity = 1) {
    const stock = Math.max(0, Number(product.stock) || 0);
    if (stock < 1) {
      show('这件商品暂时缺货', 'error');
      return false;
    }

    const existing = items.value.find((item) => item.id === product.id);
    const currentQuantity = existing?.quantity || 0;
    const nextQuantity = Math.min(stock, currentQuantity + quantity);

    if (nextQuantity === currentQuantity) {
      show(`「${product.name}」最多只能购买 ${stock} 件`, 'error');
      return false;
    }

    if (existing) {
      existing.quantity = nextQuantity;
      existing.stock = stock;
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        subtitle: product.subtitle,
        image: product.image,
        price: product.price,
        stock,
        quantity: nextQuantity,
      });
    }

    show(`「${product.name}」已加入购物车`);
    return true;
  }

  function setQuantity(id, quantity) {
    const item = items.value.find((entry) => entry.id === id);
    if (!item) return;
    const next = Math.max(1, Math.min(Number(quantity) || 1, item.stock || 99));
    item.quantity = next;
  }

  function remove(id) {
    const item = items.value.find((entry) => entry.id === id);
    items.value = items.value.filter((entry) => entry.id !== id);
    if (item) show(`已移除「${item.name}」`);
  }

  function clear() {
    items.value = [];
  }

  return {
    items,
    count,
    subtotal,
    isCartOpen,
    openCart,
    closeCart,
    add,
    setQuantity,
    remove,
    clear,
  };
}
