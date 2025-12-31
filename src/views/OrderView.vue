<script setup>
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import AppIcon from '@/components/AppIcon.vue';
import { api } from '@/api';
import { formatDate, formatPrice } from '@/utils/format';
import { ORDER_STATUS } from '@shared/shop';

const props = defineProps({
  id: { type: String, required: true },
});

const route = useRoute();
const order = ref(null);
const loading = ref(true);
const error = ref('');
const isNew = computed(() => route.query.new === '1');

const status = computed(() =>
  order.value ? ORDER_STATUS[order.value.status] || ORDER_STATUS.pending : null,
);

async function loadOrder() {
  loading.value = true;
  error.value = '';
  try {
    const data = await api.getOrder(props.id);
    order.value = data.order;
  } catch (requestError) {
    error.value = requestError.message;
  } finally {
    loading.value = false;
  }
}

watch(() => props.id, loadOrder, { immediate: true });
</script>

<template>
  <div class="order-page container">
    <div v-if="loading" class="order-loading">
      <div class="skeleton order-loading__hero"></div>
      <div class="order-loading__grid">
        <div class="skeleton order-loading__block"></div>
        <div class="skeleton order-loading__block"></div>
      </div>
    </div>

    <div v-else-if="error" class="order-state">
      <span class="order-state__icon"><AppIcon name="package" :size="30" /></span>
      <p class="eyebrow">ORDER NOT FOUND</p>
      <h1>没有找到这笔订单</h1>
      <p>{{ error }}</p>
      <div class="order-state__actions">
        <RouterLink to="/orders" class="btn btn--primary">查看我的订单</RouterLink>
        <RouterLink to="/" class="btn btn--ghost">回到商店</RouterLink>
      </div>
    </div>

    <template v-else-if="order">
      <section class="order-hero" :class="{ 'is-new': isNew }">
        <div class="order-hero__main">
          <span class="order-hero__icon">
            <AppIcon :name="isNew ? 'check' : 'package'" :size="26" />
          </span>
          <div>
            <p class="eyebrow">{{ isNew ? 'THANK YOU' : 'ORDER DETAIL' }}</p>
            <h1>{{ isNew ? '谢谢你，订单已收到。' : '订单详情' }}</h1>
            <p class="order-hero__lead">
              <template v-if="isNew">
                我们已收到你的订单，会尽快整理好，预计 48 小时内发出。
              </template>
              <template v-else>
                这里是这笔订单的完整信息，如有疑问欢迎联系我们。
              </template>
            </p>
          </div>
        </div>
        <div class="order-hero__meta">
          <div>
            <span>订单编号</span>
            <strong>{{ order.id }}</strong>
          </div>
          <div>
            <span>下单时间</span>
            <strong>{{ formatDate(order.createdAt) }}</strong>
          </div>
          <div>
            <span>订单状态</span>
            <strong class="status-pill" :class="`status-pill--${status.tone}`">
              <span></span>{{ status.label }}
            </strong>
          </div>
        </div>
      </section>

      <div class="order-grid">
        <div class="order-main">
          <section class="order-card">
            <div class="order-card__head">
              <h2>商品清单</h2>
              <span>{{ order.items.reduce((sum, item) => sum + item.quantity, 0) }} 件</span>
            </div>

            <ul class="order-items">
              <li v-for="item in order.items" :key="item.productId" class="order-item">
                <RouterLink :to="`/product/${item.productId}`" class="order-item__image">
                  <img :src="item.image" :alt="item.name" />
                </RouterLink>
                <div class="order-item__info">
                  <RouterLink :to="`/product/${item.productId}`" class="order-item__name">
                    {{ item.name }}
                  </RouterLink>
                  <span>{{ formatPrice(item.price) }} × {{ item.quantity }}</span>
                </div>
                <strong>{{ formatPrice(item.subtotal) }}</strong>
              </li>
            </ul>

            <div class="order-totals">
              <div><span>商品小计</span><span>{{ formatPrice(order.subtotal) }}</span></div>
              <div><span>运费 · {{ order.shipping.name }}</span><span>{{ order.shipping.fee === 0 ? '免运费' : formatPrice(order.shipping.fee) }}</span></div>
              <div class="order-totals__total">
                <span>实付金额</span>
                <strong>{{ formatPrice(order.total) }}</strong>
              </div>
            </div>
          </section>

          <section class="order-card order-timeline">
            <div class="order-card__head">
              <h2>订单进度</h2>
            </div>
            <div class="timeline">
              <div class="timeline__step is-done">
                <span class="timeline__dot"><AppIcon name="check" :size="12" /></span>
                <div><strong>订单已提交</strong><span>{{ formatDate(order.createdAt) }}</span></div>
              </div>
              <div class="timeline__step is-current">
                <span class="timeline__dot"></span>
                <div><strong>正在备货</strong><span>预计 48 小时内发出</span></div>
              </div>
              <div class="timeline__step">
                <span class="timeline__dot"></span>
                <div><strong>配送中</strong><span>发货后可查看物流</span></div>
              </div>
              <div class="timeline__step">
                <span class="timeline__dot"></span>
                <div><strong>已完成</strong><span>希望你用得开心</span></div>
              </div>
            </div>
          </section>
        </div>

        <aside class="order-aside">
          <section class="order-card">
            <div class="order-card__head">
              <h2>收货信息</h2>
            </div>
            <div class="address">
              <strong>{{ order.customer.name }}</strong>
              <span>{{ order.customer.phone }}</span>
              <p>
                {{ order.customer.province }} {{ order.customer.city }}
                {{ order.customer.district }}<br />
                {{ order.customer.address }}
              </p>
              <p v-if="order.customer.note" class="address__note">
                备注：{{ order.customer.note }}
              </p>
            </div>
          </section>

          <section class="order-card">
            <div class="order-card__head">
              <h2>支付与配送</h2>
            </div>
            <dl class="order-facts">
              <div><dt>支付方式</dt><dd>{{ order.payment.name }}</dd></div>
              <div><dt>配送方式</dt><dd>{{ order.shipping.name }}</dd></div>
              <div><dt>运费</dt><dd>{{ order.shipping.fee === 0 ? '免运费' : formatPrice(order.shipping.fee) }}</dd></div>
            </dl>
            <p class="order-aside__note">
              <AppIcon name="shield" :size="14" />
              演示项目，不会产生真实扣款
            </p>
          </section>

          <div class="order-actions">
            <RouterLink to="/" class="btn btn--primary btn--wide">
              继续逛逛
              <AppIcon name="arrow-right" :size="15" />
            </RouterLink>
            <RouterLink to="/orders" class="btn btn--ghost btn--wide">查看全部订单</RouterLink>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.order-page {
  padding-top: 40px;
}

.order-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 40px;
  overflow: hidden;
  padding: 38px 40px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--paper);
}

.order-hero.is-new {
  border-color: transparent;
  background:
    radial-gradient(circle at 82% 12%, rgba(199, 119, 80, 0.14), transparent 18rem),
    var(--forest-deep);
  color: var(--cream);
}

.order-hero.is-new::after {
  content: 'SAN YE';
  position: absolute;
  right: 28px;
  bottom: -20px;
  color: rgba(247, 243, 234, 0.04);
  font-family: var(--font-serif);
  font-size: 110px;
  letter-spacing: 0.06em;
  pointer-events: none;
}

.order-hero__main {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.order-hero__icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 60px;
  height: 60px;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--forest);
}

.order-hero.is-new .order-hero__icon {
  border-color: rgba(247, 243, 234, 0.2);
  background: rgba(247, 243, 234, 0.08);
  color: var(--clay-light);
}

.order-hero h1 {
  margin-top: 7px;
  font-family: var(--font-serif);
  font-size: clamp(32px, 4vw, 44px);
  font-weight: 400;
  line-height: 1.18;
  letter-spacing: -0.02em;
}

.order-hero__lead {
  max-width: 480px;
  margin-top: 10px;
  color: var(--muted);
  font-size: 11.5px;
  line-height: 1.8;
}

.order-hero.is-new .order-hero__lead {
  color: rgba(247, 243, 234, 0.58);
}

.order-hero.is-new .eyebrow {
  color: var(--clay-light);
}

.order-hero__meta {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 210px;
  flex-direction: column;
  gap: 13px;
  padding-left: 30px;
  border-left: 1px solid var(--line);
}

.order-hero.is-new .order-hero__meta {
  border-color: rgba(247, 243, 234, 0.14);
}

.order-hero__meta > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-hero__meta span {
  color: var(--muted);
  font-size: 8.5px;
  letter-spacing: 0.08em;
}

.order-hero.is-new .order-hero__meta span {
  color: rgba(247, 243, 234, 0.45);
}

.order-hero__meta strong {
  font-size: 11px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
}

.status-pill > span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--gold);
}

.status-pill--cool > span {
  background: #7195a1;
}

.status-pill--calm > span {
  background: #6e8c6e;
}

.order-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 370px;
  gap: 26px;
  align-items: start;
  padding-top: 26px;
}

.order-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 22px;
}

.order-aside {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.order-card {
  padding: 26px 28px;
  border: 1px solid var(--line-soft);
  border-radius: 18px;
  background: rgba(255, 253, 248, 0.72);
}

.order-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line-soft);
}

.order-card__head h2 {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 500;
}

.order-card__head > span {
  color: var(--muted);
  font-size: 9.5px;
}

.order-items {
  margin: 0;
  padding: 0;
  list-style: none;
}

.order-item {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  align-items: center;
  gap: 15px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line-soft);
}

.order-item:last-child {
  border-bottom: 0;
}

.order-item__image {
  overflow: hidden;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  background: var(--sand);
}

.order-item__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.order-item__info {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.order-item__name {
  font-family: var(--font-serif);
  font-size: 14.5px;
  font-weight: 600;
}

.order-item__info > span {
  color: var(--muted);
  font-size: 9.5px;
}

.order-item > strong {
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 600;
}

.order-totals {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
  padding: 16px 0 0;
  border-top: 1px solid var(--line);
}

.order-totals > div {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: var(--muted);
  font-size: 10.5px;
}

.order-totals .order-totals__total {
  align-items: baseline;
  margin-top: 5px;
  padding-top: 12px;
  border-top: 1px solid var(--line-soft);
  color: var(--ink);
}

.order-totals__total strong {
  font-family: var(--font-serif);
  font-size: 26px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.timeline {
  display: flex;
  flex-direction: column;
  padding-top: 8px;
}

.timeline__step {
  position: relative;
  display: flex;
  gap: 14px;
  padding: 12px 0;
}

.timeline__step:not(:last-child)::before {
  content: '';
  position: absolute;
  top: 34px;
  bottom: -12px;
  left: 7px;
  width: 1px;
  background: var(--line);
}

.timeline__dot {
  z-index: 1;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 15px;
  height: 15px;
  margin-top: 2px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--paper);
  color: var(--cream);
}

.timeline__step.is-done .timeline__dot {
  border-color: var(--forest);
  background: var(--forest);
}

.timeline__step.is-current .timeline__dot {
  border-color: var(--clay);
  box-shadow: 0 0 0 4px rgba(199, 119, 80, 0.12);
}

.timeline__step div {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.timeline__step strong {
  color: var(--muted);
  font-size: 10.5px;
  font-weight: 500;
}

.timeline__step.is-done strong,
.timeline__step.is-current strong {
  color: var(--ink);
}

.timeline__step span {
  color: var(--muted);
  font-size: 8.5px;
}

.address {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 16px;
}

.address strong {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 600;
}

.address > span {
  color: var(--muted);
  font-size: 10.5px;
}

.address p {
  margin-top: 6px;
  color: var(--ink-soft);
  font-size: 11px;
  line-height: 1.8;
}

.address__note {
  padding: 9px 11px;
  border-radius: 8px;
  background: var(--cream);
  color: var(--muted) !important;
  font-size: 9.5px !important;
}

.order-facts {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin: 16px 0 0;
}

.order-facts > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 10px;
}

.order-facts dt {
  color: var(--muted);
}

.order-facts dd {
  margin: 0;
  color: var(--ink-soft);
}

.order-aside__note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding-top: 13px;
  border-top: 1px solid var(--line-soft);
  color: var(--muted);
  font-size: 8.5px;
}

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.order-state {
  display: flex;
  min-height: 540px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.order-state__icon {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  margin-bottom: 20px;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--muted);
}

.order-state h1 {
  margin-top: 10px;
  font-family: var(--font-serif);
  font-size: 37px;
  font-weight: 400;
}

.order-state p {
  margin: 9px 0 22px;
  color: var(--muted);
  font-size: 12px;
}

.order-state__actions {
  display: flex;
  gap: 10px;
}

.order-loading {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.order-loading__hero {
  height: 210px;
  border-radius: 24px;
}

.order-loading__grid {
  display: grid;
  grid-template-columns: 1fr 370px;
  gap: 26px;
}

.order-loading__block {
  height: 420px;
  border-radius: 18px;
}

@media (max-width: 1000px) {
  .order-hero {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .order-hero__meta {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 24px;
    padding-top: 20px;
    padding-left: 0;
    border-top: 1px solid var(--line);
    border-left: 0;
  }

  .order-hero.is-new .order-hero__meta {
    border-color: rgba(247, 243, 234, 0.14);
  }

  .order-grid,
  .order-loading__grid {
    grid-template-columns: 1fr;
  }

  .order-aside {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }

  .order-actions {
    grid-column: 1 / -1;
    flex-direction: row;
  }
}

@media (max-width: 680px) {
  .order-page {
    padding-top: 24px;
  }

  .order-hero {
    padding: 26px 22px;
  }

  .order-hero__main {
    flex-direction: column;
    gap: 14px;
  }

  .order-hero__meta {
    flex-direction: column;
    gap: 12px;
  }

  .order-card {
    padding: 22px 20px;
  }

  .order-aside {
    display: flex;
  }

  .order-actions {
    flex-direction: column;
  }

  .order-item {
    grid-template-columns: 54px minmax(0, 1fr) auto;
    gap: 11px;
  }

  .order-item__image {
    width: 54px;
    height: 54px;
  }

  .order-state__actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>
