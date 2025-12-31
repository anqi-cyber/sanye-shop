<script setup>
import { computed, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import AppIcon from '@/components/AppIcon.vue';
import ProductCard from '@/components/ProductCard.vue';
import QuantityStepper from '@/components/QuantityStepper.vue';
import { api } from '@/api';
import { useCart } from '@/stores/cart';
import { categoryName, formatPrice } from '@/utils/format';

const props = defineProps({
  id: { type: String, required: true },
});

const router = useRouter();
const { add } = useCart();

const product = ref(null);
const related = ref([]);
const loading = ref(true);
const error = ref('');
const quantity = ref(1);
const notFound = ref(false);

const stockLabel = computed(() => {
  if (!product.value) return '';
  if (product.value.stock === 0) return '暂时售罄';
  if (product.value.stock <= 10) return `现货 · 仅剩 ${product.value.stock} 件`;
  return '现货 · 48 小时内发出';
});

const category = computed(() =>
  product.value ? categoryName(product.value.category) : '',
);

async function loadProduct() {
  loading.value = true;
  error.value = '';
  notFound.value = false;
  product.value = null;
  related.value = [];
  quantity.value = 1;

  try {
    const data = await api.getProduct(props.id);
    product.value = data.product;
  } catch (requestError) {
    if (requestError.status === 404) {
      notFound.value = true;
    } else {
      error.value = requestError.message;
    }
    loading.value = false;
    return;
  }

  loading.value = false;

  try {
    const list = await api.getProducts();
    related.value = list.products
      .filter((item) => item.id !== props.id)
      .slice(0, 3);
  } catch {
    related.value = [];
  }
}

function addToCart() {
  if (!product.value) return false;
  return add(product.value, quantity.value);
}

function buyNow() {
  if (!addToCart()) return;
  router.push('/checkout');
}

watch(() => props.id, loadProduct, { immediate: true });
</script>

<template>
  <div class="product-page container">
    <nav class="breadcrumbs" aria-label="面包屑">
      <RouterLink to="/">首页</RouterLink>
      <span>/</span>
      <RouterLink :to="{ path: '/', hash: '#products' }">全部好物</RouterLink>
      <span>/</span>
      <span class="breadcrumbs__current">{{ product?.name || '商品详情' }}</span>
    </nav>

    <div v-if="loading" class="product-skeleton" aria-label="正在加载商品">
      <div class="skeleton product-skeleton__image"></div>
      <div class="product-skeleton__info">
        <div class="skeleton product-skeleton__line product-skeleton__line--tiny"></div>
        <div class="skeleton product-skeleton__line product-skeleton__line--title"></div>
        <div class="skeleton product-skeleton__line"></div>
        <div class="skeleton product-skeleton__line product-skeleton__line--short"></div>
        <div class="skeleton product-skeleton__block"></div>
      </div>
    </div>

    <div v-else-if="notFound" class="product-state">
      <span class="product-state__icon"><AppIcon name="package" :size="30" /></span>
      <p class="eyebrow">LOST & FOUND</p>
      <h1>这件好物不在货架上</h1>
      <p>它可能已经售罄，或者被移到别处了。</p>
      <RouterLink to="/" class="btn btn--primary">
        回到商店
        <AppIcon name="arrow-right" :size="15" />
      </RouterLink>
    </div>

    <div v-else-if="error" class="product-state">
      <span class="product-state__icon"><AppIcon name="alert" :size="30" /></span>
      <h1>商品加载失败</h1>
      <p>{{ error }}</p>
      <button type="button" class="btn btn--ghost" @click="loadProduct">重新加载</button>
    </div>

    <template v-else-if="product">
      <section class="product-detail">
        <div class="product-gallery">
          <div class="product-gallery__frame">
            <img :src="product.image" :alt="product.name" width="800" height="800" />
            <span v-if="product.badge" class="product-gallery__badge">{{ product.badge }}</span>
            <span class="product-gallery__caption">SAN YE · NO. 01</span>
          </div>
          <div class="product-gallery__foot">
            <span><AppIcon name="leaf" :size="14" /> 独立工坊制作</span>
            <span><AppIcon name="package" :size="14" /> 简约环保包装</span>
          </div>
        </div>

        <div class="product-info">
          <p class="eyebrow">{{ category }} · SAN YE SELECTED</p>
          <h1>{{ product.name }}</h1>
          <p class="product-info__subtitle">{{ product.subtitle }}</p>

          <div class="product-info__price-row">
            <span class="product-info__price">{{ formatPrice(product.price) }}</span>
            <span class="product-info__stock" :class="{ 'is-out': product.stock === 0 }">
              <span></span>
              {{ stockLabel }}
            </span>
          </div>

          <p class="product-info__description">{{ product.description }}</p>

          <ul class="product-info__details">
            <li v-for="detail in product.details" :key="detail">
              <AppIcon name="check" :size="13" />
              {{ detail }}
            </li>
          </ul>

          <div class="product-info__buy">
            <div class="product-info__qty">
              <span>数量</span>
              <QuantityStepper
                v-model="quantity"
                :max="Math.max(product.stock, 1)"
                :disabled="product.stock === 0"
              />
            </div>

            <div class="product-info__actions">
              <button
                type="button"
                class="btn btn--primary product-info__add"
                :disabled="product.stock === 0"
                @click="addToCart"
              >
                <AppIcon name="cart" :size="17" />
                {{ product.stock === 0 ? '暂时售罄' : '加入购物车' }}
              </button>
              <button
                type="button"
                class="btn btn--ghost"
                :disabled="product.stock === 0"
                @click="buyNow"
              >
                立即购买
              </button>
            </div>
          </div>

          <div class="product-info__services">
            <div>
              <AppIcon name="truck" :size="18" />
              <span><strong>满 ¥199 包邮</strong>标准配送 2–4 个工作日</span>
            </div>
            <div>
              <AppIcon name="shield" :size="18" />
              <span><strong>7 天无忧退换</strong>保持商品完好即可</span>
            </div>
          </div>
        </div>
      </section>

      <section v-if="related.length" class="related">
        <div class="related__head">
          <div>
            <p class="eyebrow">YOU MAY ALSO LIKE</p>
            <h2>也许你还会喜欢</h2>
          </div>
          <RouterLink :to="{ path: '/', hash: '#products' }" class="related__link">
            查看全部
            <AppIcon name="arrow-right" :size="14" />
          </RouterLink>
        </div>
        <div class="related__grid">
          <ProductCard v-for="item in related" :key="item.id" :product="item" />
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.product-page {
  padding-top: 30px;
  padding-bottom: 20px;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 0 28px;
  color: var(--muted);
  font-size: 10.5px;
  letter-spacing: 0.03em;
}

.breadcrumbs a {
  transition: color 0.2s ease;
}

.breadcrumbs a:hover {
  color: var(--ink);
}

.breadcrumbs__current {
  overflow: hidden;
  max-width: 260px;
  color: var(--ink-soft);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-detail {
  display: grid;
  grid-template-columns: minmax(0, 1.06fr) minmax(0, 0.94fr);
  gap: 70px;
  align-items: start;
}

.product-gallery__frame {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1 / 1.06;
  border-radius: 26px;
  background: var(--sand);
}

.product-gallery__frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-gallery__badge {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 7px 13px;
  border-radius: 999px;
  background: rgba(250, 246, 236, 0.9);
  color: var(--ink);
  font-size: 10px;
  letter-spacing: 0.12em;
  backdrop-filter: blur(8px);
}

.product-gallery__caption {
  position: absolute;
  right: 20px;
  bottom: 18px;
  color: rgba(35, 53, 45, 0.55);
  font-family: var(--font-serif);
  font-size: 9px;
  letter-spacing: 0.18em;
}

.product-gallery__foot {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 4px 0;
  color: var(--muted);
  font-size: 9.5px;
  letter-spacing: 0.03em;
}

.product-gallery__foot span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.product-info {
  padding-top: 10px;
}

.product-info h1 {
  margin-top: 12px;
  font-family: var(--font-serif);
  font-size: clamp(38px, 4.2vw, 54px);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.025em;
}

.product-info__subtitle {
  margin-top: 10px;
  color: var(--muted);
  font-size: 13px;
  letter-spacing: 0.01em;
}

.product-info__price-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 26px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--line);
}

.product-info__price {
  font-family: var(--font-serif);
  font-size: 31px;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.product-info__stock {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--forest);
  font-size: 10px;
  letter-spacing: 0.04em;
}

.product-info__stock span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #63896a;
  box-shadow: 0 0 0 3px rgba(99, 137, 106, 0.14);
}

.product-info__stock.is-out {
  color: var(--clay-deep);
}

.product-info__stock.is-out span {
  background: var(--clay);
  box-shadow: none;
}

.product-info__description {
  margin-top: 22px;
  color: var(--ink-soft);
  font-size: 12.5px;
  line-height: 2;
}

.product-info__details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
}

.product-info__details li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 11px;
  letter-spacing: 0.02em;
}

.product-info__details svg {
  color: var(--clay-deep);
}

.product-info__buy {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.product-info__qty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.product-info__qty > span {
  color: var(--muted);
  font-size: 11px;
  letter-spacing: 0.06em;
}

.product-info__actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.product-info__add {
  flex: 1;
}

.product-info__actions .btn--ghost {
  flex: 0 0 auto;
}

.product-info__services {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
}

.product-info__services > div {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  color: var(--muted);
}

.product-info__services svg {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--forest);
}

.product-info__services span {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 9.5px;
  line-height: 1.5;
}

.product-info__services strong {
  color: var(--ink-soft);
  font-size: 10px;
  font-weight: 500;
}

.related {
  margin-top: 100px;
}

.related__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 26px;
  border-bottom: 1px solid var(--line);
}

.related__head h2 {
  margin-top: 9px;
  font-family: var(--font-serif);
  font-size: clamp(30px, 3.5vw, 40px);
  font-weight: 400;
  letter-spacing: -0.02em;
}

.related__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--line);
  color: var(--ink-soft);
  font-size: 10.5px;
  transition: gap 0.2s ease;
}

.related__link:hover {
  gap: 9px;
}

.related__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
  padding-top: 30px;
}

.product-skeleton {
  display: grid;
  grid-template-columns: minmax(0, 1.06fr) minmax(0, 0.94fr);
  gap: 70px;
}

.product-skeleton__image {
  aspect-ratio: 1 / 1.06;
  border-radius: 26px;
}

.product-skeleton__info {
  padding-top: 40px;
}

.product-skeleton__line {
  width: 80%;
  height: 14px;
  margin-bottom: 12px;
}

.product-skeleton__line--tiny {
  width: 25%;
  height: 10px;
}

.product-skeleton__line--title {
  width: 62%;
  height: 42px;
  margin: 18px 0 16px;
}

.product-skeleton__line--short {
  width: 40%;
}

.product-skeleton__block {
  width: 100%;
  height: 180px;
  margin-top: 30px;
}

.product-state {
  display: flex;
  min-height: 480px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.product-state__icon {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  margin-bottom: 20px;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--muted);
}

.product-state h1 {
  margin-top: 10px;
  font-family: var(--font-serif);
  font-size: 38px;
  font-weight: 400;
}

.product-state p {
  max-width: 360px;
  margin: 10px 0 22px;
  color: var(--muted);
  font-size: 12px;
}

@media (max-width: 980px) {
  .product-detail,
  .product-skeleton {
    gap: 42px;
  }

  .product-info h1 {
    font-size: 40px;
  }

  .product-info__actions {
    flex-direction: column;
  }

  .product-info__services {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .product-detail,
  .product-skeleton {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .product-gallery__frame {
    aspect-ratio: 1 / 1;
  }

  .product-info h1 {
    font-size: clamp(34px, 9vw, 44px);
  }

  .product-info__services {
    grid-template-columns: 1fr 1fr;
  }

  .related {
    margin-top: 70px;
  }

  .related__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 30px 16px;
  }

  .related__grid > :last-child {
    display: none;
  }
}

@media (max-width: 520px) {
  .breadcrumbs {
    padding-bottom: 18px;
  }

  .product-gallery__foot {
    font-size: 8.5px;
  }

  .product-info__services {
    grid-template-columns: 1fr;
  }

  .related__head {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
