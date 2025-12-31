<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import AppIcon from '@/components/AppIcon.vue';
import { api } from '@/api';
import { formatDate, formatPrice } from '@/utils/format';
import { listRememberedOrderIds, rememberOrder } from '@/utils/localOrders';
import { ORDER_STATUS } from '@shared/shop';

const router = useRouter();
const orders = ref([]);
const loading = ref(true);
const lookupId = ref('');
const lookupError = ref('');
const lookupLoading = ref(false);

function statusOf(order) {
  return ORDER_STATUS[order.status] || ORDER_STATUS.pending;
}

function orderTitle(order) {
  const first = order.items[0]?.name || '订单商品';
  return order.items.length > 1 ? `${first} 等 ${order.items.length} 件` : first;
}

function itemCount(order) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

async function loadOrders() {
  const ids = listRememberedOrderIds();
  if (ids.length === 0) {
    loading.value = false;
    return;
  }

  const results = await Promise.allSettled(ids.map((id) => api.getOrder(id)));
  orders.value = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value.order)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  loading.value = false;
}

async function lookupOrder() {
  lookupError.value = '';
  const id = lookupId.value.trim().toUpperCase();
  if (!id) {
    lookupError.value = '请输入订单编号';
    return;
  }

  lookupLoading.value = true;
  try {
    const data = await api.getOrder(id);
    rememberOrder(data.order.id);
    router.push({ name: 'order', params: { id: data.order.id } });
  } catch (error) {
    lookupError.value = error.status === 404 ? '没有找到这个订单号，请再检查一下' : error.message;
  } finally {
    lookupLoading.value = false;
  }
}

onMounted(loadOrders);
</script>

<template>
  <div class="orders-page container">
    <header class="orders-head">
      <div>
        <p class="eyebrow">YOUR ORDERS</p>
        <h1>我的订单</h1>
        <p class="orders-head__lead">
          订单记录保存在当前浏览器里。<br />
          换一台设备时，可以用订单编号找回。
        </p>
      </div>

      <form class="lookup" @submit.prevent="lookupOrder">
        <label for="order-lookup">用订单号查询</label>
        <div class="lookup__row">
          <input
            id="order-lookup"
            v-model="lookupId"
            type="text"
            placeholder="例如 SY20261031A1B2C3"
            autocomplete="off"
            spellcheck="false"
          />
          <button type="submit" class="lookup__button" :disabled="lookupLoading">
            {{ lookupLoading ? '查询中' : '查询' }}
            <AppIcon v-if="!lookupLoading" name="arrow-right" :size="14" />
          </button>
        </div>
        <p v-if="lookupError" class="lookup__error">{{ lookupError }}</p>
      </form>
    </header>

    <div v-if="loading" class="orders-loading">
      <div v-for="index in 2" :key="index" class="skeleton orders-loading__row"></div>
    </div>

    <div v-else-if="orders.length === 0" class="orders-empty">
      <span class="orders-empty__icon"><AppIcon name="package" :size="32" /></span>
      <p class="eyebrow">NOTHING HERE YET</p>
      <h2>还没有订单</h2>
      <p>去商店逛逛，挑一件喜欢的东西。完成下单后，订单会出现在这里。</p>
      <RouterLink to="/" class="btn btn--primary">
        去商店看看
        <AppIcon name="arrow-right" :size="15" />
      </RouterLink>
    </div>

    <template v-else>
      <div class="orders-meta">
        <span>共 {{ orders.length }} 笔订单</span>
        <span>按下单时间排序</span>
      </div>

      <div class="orders-list">
        <article v-for="order in orders" :key="order.id" class="order-row">
          <header class="order-row__head">
            <div class="order-row__identity">
              <span>订单编号</span>
              <strong>{{ order.id }}</strong>
            </div>
            <div class="order-row__date">{{ formatDate(order.createdAt) }}</div>
            <span class="order-row__status" :class="`is-${statusOf(order).tone}`">
              <span></span>{{ statusOf(order).label }}
            </span>
          </header>

          <div class="order-row__body">
            <div class="order-row__thumbs">
              <RouterLink
                v-for="item in order.items.slice(0, 3)"
                :key="item.productId"
                :to="`/product/${item.productId}`"
                class="order-row__thumb"
              >
                <img :src="item.image" :alt="item.name" />
              </RouterLink>
              <span v-if="order.items.length > 3" class="order-row__more">
                +{{ order.items.length - 3 }}
              </span>
            </div>

            <div class="order-row__info">
              <h2>{{ orderTitle(order) }}</h2>
              <p>共 {{ itemCount(order) }} 件 · {{ order.payment.name }}</p>
            </div>

            <div class="order-row__total">
              <span>实付金额</span>
              <strong>{{ formatPrice(order.total) }}</strong>
            </div>

            <RouterLink :to="`/order/${order.id}`" class="order-row__link">
              查看订单
              <AppIcon name="arrow-right" :size="14" />
            </RouterLink>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>

<style scoped>
.orders-page {
  padding-top: 46px;
}

.orders-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 50px;
  padding-bottom: 34px;
  border-bottom: 1px solid var(--line);
}

.orders-head h1 {
  margin-top: 8px;
  font-family: var(--font-serif);
  font-size: clamp(44px, 5vw, 62px);
  font-weight: 400;
  letter-spacing: -0.03em;
}

.orders-head__lead {
  margin-top: 13px;
  color: var(--muted);
  font-size: 11.5px;
  line-height: 1.8;
}

.lookup {
  width: min(360px, 100%);
}

.lookup > label {
  display: block;
  margin-bottom: 7px;
  color: var(--muted);
  font-size: 9px;
  letter-spacing: 0.08em;
}

.lookup__row {
  display: flex;
  height: 46px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--paper);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.lookup__row:focus-within {
  border-color: var(--forest);
  box-shadow: 0 0 0 3px rgba(36, 72, 60, 0.08);
}

.lookup__row input {
  min-width: 0;
  flex: 1;
  padding: 0 13px;
  border: 0;
  border-radius: 10px 0 0 10px;
  outline: 0;
  background: transparent;
  color: var(--ink);
  font-size: 11px;
  letter-spacing: 0.04em;
}

.lookup__row input::placeholder {
  color: #a8aaa1;
}

.lookup__button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 16px;
  border: 0;
  border-left: 1px solid var(--line);
  border-radius: 0 10px 10px 0;
  background: transparent;
  color: var(--forest);
  font-size: 10.5px;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.lookup__button:hover:not(:disabled) {
  background: var(--forest);
  color: var(--cream);
}

.lookup__button:disabled {
  opacity: 0.55;
  cursor: wait;
}

.lookup__error {
  margin-top: 6px;
  color: var(--clay-deep);
  font-size: 9.5px;
}

.orders-meta {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 2px;
  color: var(--muted);
  font-size: 9.5px;
  letter-spacing: 0.06em;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.order-row {
  padding: 20px 24px;
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  background: rgba(255, 253, 248, 0.72);
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s var(--ease);
}

.order-row:hover {
  border-color: var(--line);
  box-shadow: 0 18px 40px rgba(35, 53, 45, 0.06);
  transform: translateY(-2px);
}

.order-row__head {
  display: flex;
  align-items: center;
  gap: 22px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--line-soft);
}

.order-row__identity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-row__identity span {
  color: var(--muted);
  font-size: 8.5px;
  letter-spacing: 0.06em;
}

.order-row__identity strong {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.order-row__date {
  color: var(--muted);
  font-size: 9px;
}

.order-row__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  color: var(--ink-soft);
  font-size: 9px;
}

.order-row__status > span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--gold);
}

.order-row__status.is-cool > span {
  background: #7195a1;
}

.order-row__status.is-calm > span {
  background: #6e8c6e;
}

.order-row__body {
  display: flex;
  align-items: center;
  gap: 22px;
  padding-top: 16px;
}

.order-row__thumbs {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.order-row__thumb {
  overflow: hidden;
  width: 62px;
  height: 62px;
  margin-left: -9px;
  border-radius: 9px;
  border: 3px solid var(--paper);
  background: var(--sand);
  transition: transform 0.25s var(--ease);
}

.order-row__thumb:first-child {
  margin-left: 0;
}

.order-row__thumb:hover {
  z-index: 1;
  transform: translateY(-3px);
}

.order-row__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.order-row__more {
  display: grid;
  place-items: center;
  width: 44px;
  height: 62px;
  margin-left: -9px;
  border: 3px solid var(--paper);
  border-radius: 9px;
  background: var(--cream);
  color: var(--muted);
  font-size: 9px;
}

.order-row__info {
  min-width: 0;
  flex: 1;
}

.order-row__info h2 {
  overflow: hidden;
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-row__info p {
  margin-top: 4px;
  color: var(--muted);
  font-size: 9.5px;
}

.order-row__total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  flex: 0 0 auto;
}

.order-row__total span {
  color: var(--muted);
  font-size: 8.5px;
}

.order-row__total strong {
  font-family: var(--font-serif);
  font-size: 19px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.order-row__link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
  padding: 8px 13px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--ink-soft);
  font-size: 9.5px;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.order-row__link:hover {
  border-color: var(--forest);
  background: var(--forest);
  color: var(--cream);
}

.orders-loading {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 20px;
}

.orders-loading__row {
  height: 142px;
  border-radius: 16px;
}

.orders-empty {
  display: flex;
  min-height: 460px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.orders-empty__icon {
  display: grid;
  place-items: center;
  width: 74px;
  height: 74px;
  margin-bottom: 20px;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--muted);
}

.orders-empty h2 {
  margin-top: 8px;
  font-family: var(--font-serif);
  font-size: 32px;
  font-weight: 400;
}

.orders-empty p:not(.eyebrow) {
  max-width: 360px;
  margin: 9px 0 22px;
  color: var(--muted);
  font-size: 11.5px;
  line-height: 1.8;
}

@media (max-width: 860px) {
  .orders-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 24px;
  }

  .lookup {
    width: 100%;
  }

  .order-row__body {
    flex-wrap: wrap;
    gap: 16px;
  }

  .order-row__info {
    flex-basis: calc(100% - 220px);
  }

  .order-row__total {
    align-items: flex-start;
  }

  .order-row__link {
    margin-left: auto;
  }
}

@media (max-width: 620px) {
  .orders-page {
    padding-top: 30px;
  }

  .order-row {
    padding: 17px;
  }

  .order-row__head {
    flex-wrap: wrap;
    gap: 5px 14px;
  }

  .order-row__status {
    margin-left: 0;
  }

  .order-row__date {
    margin-left: auto;
  }

  .order-row__thumbs {
    width: 100%;
  }

  .order-row__info {
    flex-basis: 100%;
  }

  .order-row__total {
    margin-top: -4px;
  }

  .order-row__link {
    margin-left: auto;
  }
}
</style>
