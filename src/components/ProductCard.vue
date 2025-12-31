<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import AppIcon from '@/components/AppIcon.vue';
import { useCart } from '@/stores/cart';
import { categoryName, formatPrice } from '@/utils/format';

const props = defineProps({
  product: { type: Object, required: true },
});

const { add } = useCart();
const category = computed(() => categoryName(props.product.category));
</script>

<template>
  <article class="product-card">
    <RouterLink
      :to="`/product/${product.id}`"
      class="product-card__media"
      :aria-label="`查看${product.name}`"
    >
      <img
        :src="product.image"
        :alt="product.name"
        loading="lazy"
        width="800"
        height="800"
      />
      <span v-if="product.badge" class="product-card__badge">{{ product.badge }}</span>
      <span v-if="product.stock > 0 && product.stock <= 10" class="product-card__stock">
        仅剩 {{ product.stock }} 件
      </span>
      <span v-else-if="product.stock === 0" class="product-card__stock">暂时售罄</span>
    </RouterLink>

    <div class="product-card__body">
      <div class="product-card__meta">
        <span>{{ category }}</span>
        <span class="product-card__dot" aria-hidden="true"></span>
        <span>山野选物</span>
      </div>

      <RouterLink :to="`/product/${product.id}`" class="product-card__title-link">
        <h3>{{ product.name }}</h3>
      </RouterLink>
      <p class="product-card__subtitle">{{ product.subtitle }}</p>

      <div class="product-card__footer">
        <span class="product-card__price">{{ formatPrice(product.price) }}</span>
        <button
          type="button"
          class="product-card__add"
          :disabled="product.stock === 0"
          :aria-label="`将${product.name}加入购物车`"
          @click="add(product)"
        >
          <AppIcon name="plus" :size="15" />
          <span>加入</span>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.product-card__media {
  position: relative;
  display: block;
  overflow: hidden;
  aspect-ratio: 1 / 1.08;
  border-radius: var(--radius-card);
  background: var(--sand);
}

.product-card__media::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(36, 53, 44, 0.07);
  pointer-events: none;
}

.product-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.75s var(--ease);
}

.product-card:hover .product-card__media img {
  transform: scale(1.035);
}

.product-card__badge {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(250, 246, 236, 0.9);
  color: var(--ink);
  font-size: 10px;
  letter-spacing: 0.12em;
  backdrop-filter: blur(8px);
}

.product-card__stock {
  position: absolute;
  right: 14px;
  bottom: 14px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(31, 58, 47, 0.82);
  color: var(--cream);
  font-size: 10px;
  letter-spacing: 0.06em;
  backdrop-filter: blur(8px);
}

.product-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 17px 3px 0;
}

.product-card__meta {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 9px;
  color: var(--muted);
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.product-card__dot {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: var(--clay);
}

.product-card__title-link {
  color: var(--ink);
}

.product-card__title-link h3 {
  font-family: var(--font-serif);
  font-size: 19px;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: 0.01em;
  transition: color 0.2s ease;
}

.product-card__title-link:hover h3 {
  color: var(--forest);
}

.product-card__subtitle {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 6px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.product-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
}

.product-card__price {
  font-family: var(--font-serif);
  font-size: 20px;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.product-card__add {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 34px;
  padding: 0 13px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--ink-soft);
  font-size: 11.5px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s var(--ease);
}

.product-card__add:hover:not(:disabled) {
  border-color: var(--forest);
  background: var(--forest);
  color: var(--cream);
  transform: translateY(-1px);
}

.product-card__add:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 560px) {
  .product-card__title-link h3 {
    font-size: 17px;
  }

  .product-card__subtitle {
    font-size: 11.5px;
  }

  .product-card__price {
    font-size: 18px;
  }

  .product-card__add {
    height: 32px;
    padding: 0 11px;
  }
}
</style>
