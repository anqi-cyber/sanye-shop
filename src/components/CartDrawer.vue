<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import AppIcon from '@/components/AppIcon.vue';
import QuantityStepper from '@/components/QuantityStepper.vue';
import { useCart } from '@/stores/cart';
import { formatPrice } from '@/utils/format';
import { FREE_SHIPPING_THRESHOLD } from '@shared/shop';

const router = useRouter();
const { items, count, subtotal, isCartOpen, closeCart, setQuantity, remove } = useCart();

const remaining = computed(() =>
  Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal.value),
);
const progress = computed(() =>
  Math.min(100, (subtotal.value / FREE_SHIPPING_THRESHOLD) * 100),
);

function goCheckout() {
  closeCart();
  router.push('/checkout');
}

function goShopping() {
  closeCart();
  if (router.currentRoute.value.path !== '/') router.push('/');
}

function onKeydown(event) {
  if (event.key === 'Escape' && isCartOpen.value) closeCart();
}

watch(
  isCartOpen,
  (open) => {
    document.body.classList.toggle('no-scroll', open);
  },
  { immediate: true },
);

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.classList.remove('no-scroll');
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isCartOpen"
        class="cart-backdrop"
        aria-hidden="true"
        @click="closeCart"
      ></div>
    </Transition>

    <Transition name="drawer">
      <aside
        v-if="isCartOpen"
        class="cart-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <header class="cart-panel__header">
          <div>
            <p class="eyebrow">YOUR BAG</p>
            <h2 id="cart-title">购物车 <span>{{ count }}</span></h2>
          </div>
          <button type="button" class="icon-button" aria-label="关闭购物车" @click="closeCart">
            <AppIcon name="close" :size="20" />
          </button>
        </header>

        <div v-if="items.length === 0" class="cart-empty">
          <span class="cart-empty__icon"><AppIcon name="cart" :size="34" /></span>
          <h3>还没有装进什么</h3>
          <p>去挑一件喜欢的小东西，让今天多一点期待。</p>
          <button type="button" class="btn btn--primary" @click="goShopping">
            去逛逛
            <AppIcon name="arrow-right" :size="15" />
          </button>
        </div>

        <template v-else>
          <div class="cart-panel__body">
            <div class="shipping-progress">
              <div class="shipping-progress__text">
                <span v-if="remaining > 0">再选 {{ formatPrice(remaining) }} 即可包邮</span>
                <span v-else class="shipping-progress__done">
                  <AppIcon name="check" :size="13" />
                  已享包邮
                </span>
                <span>{{ Math.round(progress) }}%</span>
              </div>
              <div class="shipping-progress__bar">
                <span :style="{ width: `${progress}%` }"></span>
              </div>
            </div>

            <ul class="cart-list">
              <li v-for="item in items" :key="item.id" class="cart-item">
                <RouterLink :to="`/product/${item.id}`" class="cart-item__image" @click="closeCart">
                  <img :src="item.image" :alt="item.name" />
                </RouterLink>

                <div class="cart-item__info">
                  <div class="cart-item__top">
                    <RouterLink :to="`/product/${item.id}`" class="cart-item__name" @click="closeCart">
                      {{ item.name }}
                    </RouterLink>
                    <button
                      type="button"
                      class="cart-item__remove"
                      :aria-label="`移除${item.name}`"
                      @click="remove(item.id)"
                    >
                      <AppIcon name="trash" :size="15" />
                    </button>
                  </div>
                  <p class="cart-item__price">{{ formatPrice(item.price) }} / 件</p>
                  <div class="cart-item__controls">
                    <QuantityStepper
                      :model-value="item.quantity"
                      :max="item.stock"
                      compact
                      @update:model-value="setQuantity(item.id, $event)"
                    />
                    <strong>{{ formatPrice(item.price * item.quantity) }}</strong>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <footer class="cart-panel__footer">
            <div class="cart-total">
              <span>小计</span>
              <strong>{{ formatPrice(subtotal) }}</strong>
            </div>
            <p class="cart-note">运费与优惠将在结算页确认</p>
            <button type="button" class="btn btn--primary btn--wide" @click="goCheckout">
              去结算
              <AppIcon name="arrow-right" :size="16" />
            </button>
            <p class="cart-demo">演示项目 · 不会产生真实扣款</p>
          </footer>
        </template>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cart-backdrop {
  position: fixed;
  z-index: 90;
  inset: 0;
  background: rgba(23, 38, 31, 0.48);
  backdrop-filter: blur(3px);
}

.cart-panel {
  position: fixed;
  z-index: 100;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: min(460px, 100vw);
  background: var(--paper);
  box-shadow: -24px 0 70px rgba(23, 38, 31, 0.22);
}

.cart-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 28px 28px 20px;
  border-bottom: 1px solid var(--line-soft);
}

.cart-panel__header h2 {
  margin-top: 7px;
  font-family: var(--font-serif);
  font-size: 27px;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.cart-panel__header h2 span {
  display: inline-grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  margin-left: 6px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--clay);
  color: #fff9ee;
  font-family: var(--font-sans);
  font-size: 10px;
  vertical-align: middle;
}

.icon-button {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.icon-button:hover {
  background: var(--ink);
  color: var(--cream);
}

.cart-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 22px 28px;
}

.shipping-progress {
  padding: 13px 15px;
  border: 1px solid var(--line-soft);
  border-radius: 13px;
  background: var(--cream);
}

.shipping-progress__text {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
  font-size: 10.5px;
  letter-spacing: 0.03em;
}

.shipping-progress__done {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--forest);
}

.shipping-progress__bar {
  overflow: hidden;
  height: 3px;
  margin-top: 10px;
  border-radius: 999px;
  background: var(--line-soft);
}

.shipping-progress__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--clay);
  transition: width 0.35s var(--ease);
}

.cart-list {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

.cart-item {
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr);
  gap: 15px;
  padding: 18px 0;
  border-bottom: 1px solid var(--line-soft);
}

.cart-item:last-child {
  border-bottom: 0;
}

.cart-item__image {
  overflow: hidden;
  aspect-ratio: 1;
  border-radius: 12px;
  background: var(--sand);
}

.cart-item__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item__info {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.cart-item__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.cart-item__name {
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}

.cart-item__name:hover {
  color: var(--clay-deep);
}

.cart-item__remove {
  flex: 0 0 auto;
  padding: 2px;
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s ease;
}

.cart-item__remove:hover {
  color: var(--clay-deep);
}

.cart-item__price {
  margin-top: 3px;
  color: var(--muted);
  font-size: 10.5px;
}

.cart-item__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 9px;
}

.cart-item__controls strong {
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.cart-panel__footer {
  padding: 20px 28px 24px;
  border-top: 1px solid var(--line-soft);
  background: var(--paper);
}

.cart-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 20px;
}

.cart-total span {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.cart-total strong {
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.cart-note {
  margin-top: 3px;
  color: var(--muted);
  font-size: 10px;
  text-align: right;
}

.cart-panel__footer .btn {
  margin-top: 14px;
}

.cart-demo {
  margin-top: 10px;
  color: var(--muted);
  font-size: 9.5px;
  text-align: center;
  letter-spacing: 0.06em;
}

.cart-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.cart-empty__icon {
  display: grid;
  place-items: center;
  width: 74px;
  height: 74px;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--muted);
}

.cart-empty h3 {
  margin-top: 22px;
  font-family: var(--font-serif);
  font-size: 23px;
  font-weight: 500;
}

.cart-empty p {
  max-width: 250px;
  margin: 10px 0 22px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.28s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.38s var(--ease);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

@media (max-width: 520px) {
  .cart-panel__header {
    padding: 22px 20px 17px;
  }

  .cart-panel__body {
    padding: 18px 20px;
  }

  .cart-panel__footer {
    padding: 16px 20px 20px;
  }

  .cart-item {
    grid-template-columns: 74px minmax(0, 1fr);
  }
}
</style>
