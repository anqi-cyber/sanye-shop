<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import AppIcon from '@/components/AppIcon.vue';
import ProductCard from '@/components/ProductCard.vue';
import { api } from '@/api';
import { CATEGORIES } from '@shared/shop';

const products = ref([]);
const loading = ref(true);
const error = ref('');
const activeCategory = ref('all');
const query = ref('');
const sortBy = ref('recommended');
const searchInput = ref(null);

const categoryCounts = computed(() => {
  const counts = { all: products.value.length };
  for (const product of products.value) {
    counts[product.category] = (counts[product.category] || 0) + 1;
  }
  return counts;
});

const visibleProducts = computed(() => {
  const keyword = query.value.trim().toLowerCase();
  const filtered = products.value.filter((product) => {
    const matchCategory =
      activeCategory.value === 'all' || product.category === activeCategory.value;
    const matchQuery =
      !keyword ||
      [product.name, product.subtitle, product.description]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    return matchCategory && matchQuery;
  });

  if (sortBy.value === 'price-asc') {
    return [...filtered].sort((a, b) => a.price - b.price);
  }
  if (sortBy.value === 'price-desc') {
    return [...filtered].sort((a, b) => b.price - a.price);
  }
  return filtered;
});

const resultLabel = computed(() => {
  if (loading.value) return '正在整理货架';
  if (visibleProducts.value.length === 0) return '没有找到好物';
  return `${visibleProducts.value.length} 件好物`;
});

async function loadProducts() {
  loading.value = true;
  error.value = '';
  try {
    const data = await api.getProducts();
    products.value = data.products;
  } catch (requestError) {
    error.value = requestError.message;
  } finally {
    loading.value = false;
  }
}

function clearSearch() {
  query.value = '';
  searchInput.value?.focus();
}

function onKeydown(event) {
  const tag = document.activeElement?.tagName;
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
    event.preventDefault();
    searchInput.value?.focus();
  }
}

onMounted(() => {
  loadProducts();
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div class="home">
    <div class="container">
      <section class="hero">
        <div class="hero__copy">
          <p class="eyebrow hero__eyebrow">
            <span class="hero__eyebrow-line"></span>
            山野商店 · 手作与日常
          </p>
          <h1 class="hero__title">把日子，<br />过得<em>有点讲究。</em></h1>
          <p class="hero__lead">
            我们走进山野与工坊，挑回一些安静、耐用、让人愿意反复使用的东西。
            不追赶潮流，只把日常过得更好一点。
          </p>

          <div class="hero__actions">
            <a href="#products" class="btn btn--primary">
              开始挑选
              <AppIcon name="arrow-right" :size="16" />
            </a>
            <RouterLink to="/product/mist-mug" class="btn btn--ghost">
              本周选物
              <AppIcon name="arrow-up-right" :size="15" />
            </RouterLink>
          </div>

          <div class="hero__proof">
            <div class="hero__avatars" aria-hidden="true">
              <span>山</span>
              <span>野</span>
              <span>手</span>
              <span>作</span>
            </div>
            <p>
              <strong>320+</strong> 位客人
              <span>把山野带回了家</span>
            </p>
          </div>
        </div>

        <div class="hero__art">
          <div class="hero__main-image">
            <img
              src="/images/products/mug.svg"
              alt="山雾窑变马克杯"
              width="800"
              height="800"
            />
          </div>
          <div class="hero__small-image">
            <img
              src="/images/products/candle.svg"
              alt="雪松晚风香薰蜡烛"
              width="800"
              height="800"
            />
          </div>
          <div class="hero__stamp" aria-hidden="true">
            <strong>山野</strong>
            <span>HANDMADE</span>
            <em>SINCE 2026</em>
          </div>
          <RouterLink to="/product/mist-mug" class="hero__note">
            <span class="hero__note-label">本周选物 · No. 01</span>
            <strong>山雾窑变马克杯</strong>
            <span class="hero__note-link">
              去看看
              <AppIcon name="arrow-right" :size="13" />
            </span>
          </RouterLink>
        </div>
      </section>

      <div class="promise-bar">
        <div class="promise">
          <AppIcon name="leaf" :size="19" />
          <div><strong>独立工坊</strong><span>小批量手作</span></div>
        </div>
        <div class="promise">
          <AppIcon name="truck" :size="19" />
          <div><strong>满 ¥199 包邮</strong><span>48 小时内发出</span></div>
        </div>
        <div class="promise">
          <AppIcon name="shield" :size="19" />
          <div><strong>7 天无忧退换</strong><span>安心慢慢挑</span></div>
        </div>
        <div class="promise">
          <AppIcon name="spark" :size="19" />
          <div><strong>每周三上新</strong><span>少量，但认真</span></div>
        </div>
      </div>
    </div>

    <section id="products" class="products-section">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">THE COLLECTION</p>
            <h2>山野选物</h2>
          </div>
          <p class="section-head__note">
            每一件都经过挑选与试用，<br />
            希望它能陪你很久。
          </p>
        </div>

        <div class="shop-bar">
          <div class="category-tabs" aria-label="商品分类">
            <button
              v-for="category in CATEGORIES"
              :key="category.id"
              type="button"
              class="category-tab"
              :class="{ 'is-active': activeCategory === category.id }"
              @click="activeCategory = category.id"
            >
              {{ category.name }}
              <span v-if="categoryCounts[category.id]" class="category-tab__count">
                {{ categoryCounts[category.id] }}
              </span>
            </button>
          </div>

          <div class="shop-tools">
            <label class="search-box">
              <AppIcon name="search" :size="16" />
              <input
                ref="searchInput"
                v-model="query"
                type="search"
                placeholder="搜索好物"
                aria-label="搜索商品"
              />
              <button
                v-if="query"
                type="button"
                class="search-box__clear"
                aria-label="清空搜索"
                @click="clearSearch"
              >
                <AppIcon name="close" :size="13" />
              </button>
              <kbd v-else>/</kbd>
            </label>

            <label class="sort-select">
              <select v-model="sortBy" aria-label="商品排序">
                <option value="recommended">推荐排序</option>
                <option value="price-asc">价格从低到高</option>
                <option value="price-desc">价格从高到低</option>
              </select>
              <AppIcon name="chevron-down" :size="14" />
            </label>
          </div>
        </div>

        <div class="result-line">
          <span>{{ resultLabel }}</span>
          <span v-if="activeCategory !== 'all' || query" class="result-line__filter">
            已筛选
            <button type="button" @click="activeCategory = 'all'; query = ''">清除</button>
          </span>
        </div>

        <div v-if="loading" class="product-grid" aria-label="正在加载商品">
          <div v-for="index in 8" :key="index" class="skeleton-card">
            <div class="skeleton skeleton-card__image"></div>
            <div class="skeleton skeleton-card__line"></div>
            <div class="skeleton skeleton-card__line skeleton-card__line--short"></div>
          </div>
        </div>

        <div v-else-if="error" class="state-box">
          <span class="state-box__icon"><AppIcon name="alert" :size="24" /></span>
          <h3>货架暂时没有整理好</h3>
          <p>{{ error }}</p>
          <button type="button" class="btn btn--ghost" @click="loadProducts">重新加载</button>
        </div>

        <div v-else-if="visibleProducts.length === 0" class="state-box">
          <span class="state-box__icon"><AppIcon name="search" :size="24" /></span>
          <h3>没有找到这件好物</h3>
          <p>换个关键词，或者看看其他分类。</p>
          <button
            type="button"
            class="btn btn--ghost"
            @click="activeCategory = 'all'; query = ''"
          >
            看看全部
          </button>
        </div>

        <div v-else class="product-grid">
          <ProductCard
            v-for="product in visibleProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <section id="story" class="story-section">
      <div class="container">
        <div class="story">
          <div class="story__media">
            <img
              src="/images/products/blanket.svg"
              alt="燕麦色羊毛盖毯"
              loading="lazy"
              width="800"
              height="800"
            />
            <span class="story__media-tag">MADE SLOWLY</span>
          </div>
          <div class="story__content">
            <p class="eyebrow eyebrow--light">OUR PHILOSOPHY</p>
            <h2>好东西，<br /><em>不需要太多。</em></h2>
            <p class="story__copy">
              我们相信，真正的好物会在日复一日的使用里慢慢显出价值。
              一只顺手的水杯、一条越洗越软的毯子、一盏愿意在夜里点亮的蜡烛。
              所以山野商店只做一件事：把经得起时间的东西，认真选给你。
            </p>

            <div class="story__stats">
              <div>
                <strong>30<span>+</span></strong>
                <p>合作独立工坊</p>
              </div>
              <div>
                <strong>100<span>%</span></strong>
                <p>小批量制作</p>
              </div>
              <div>
                <strong>7<span>天</span></strong>
                <p>无忧退换</p>
              </div>
            </div>

            <a href="#products" class="story__link">
              继续逛逛
              <AppIcon name="arrow-right" :size="15" />
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.03fr) minmax(0, 0.97fr);
  align-items: center;
  gap: 64px;
  padding-top: 74px;
  padding-bottom: 64px;
}

.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero__eyebrow-line {
  width: 32px;
  height: 1px;
  background: var(--clay);
}

.hero__title {
  margin-top: 22px;
  font-family: var(--font-serif);
  font-size: clamp(48px, 6.2vw, 78px);
  font-weight: 400;
  line-height: 1.12;
  letter-spacing: -0.035em;
}

.hero__title em {
  position: relative;
  color: var(--clay-deep);
  font-style: normal;
  white-space: nowrap;
}

.hero__title em::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 3px;
  left: 0;
  height: 6px;
  border-radius: 50%;
  background: rgba(199, 119, 80, 0.22);
  transform: rotate(-1.2deg);
}

.hero__lead {
  max-width: 440px;
  margin-top: 24px;
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.95;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 32px;
}

.hero__proof {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 42px;
}

.hero__avatars {
  display: flex;
}

.hero__avatars span {
  display: grid;
  place-items: center;
  width: 27px;
  height: 27px;
  margin-left: -7px;
  border: 2px solid var(--cream);
  border-radius: 50%;
  background: var(--sand);
  color: var(--forest);
  font-family: var(--font-serif);
  font-size: 9px;
}

.hero__avatars span:first-child {
  margin-left: 0;
  background: var(--forest);
  color: var(--cream);
}

.hero__avatars span:nth-child(2) {
  background: var(--clay-light);
  color: #fff9ee;
}

.hero__proof p {
  color: var(--muted);
  font-size: 10.5px;
  line-height: 1.5;
}

.hero__proof strong {
  color: var(--ink);
  font-weight: 600;
}

.hero__proof p span {
  display: block;
}

.hero__art {
  position: relative;
  min-height: 550px;
}

.hero__art::before {
  content: '';
  position: absolute;
  top: 10px;
  right: 12%;
  width: 380px;
  height: 490px;
  border: 1px solid rgba(36, 72, 60, 0.15);
  border-radius: 200px 200px 28px 28px;
  transform: rotate(5deg);
}

.hero__main-image {
  position: absolute;
  top: 0;
  right: 0;
  overflow: hidden;
  width: 74%;
  height: 500px;
  border-radius: 190px 190px 26px 26px;
  background: var(--sand);
  box-shadow: 0 30px 60px rgba(42, 55, 45, 0.1);
}

.hero__main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s var(--ease);
}

.hero__art:hover .hero__main-image img {
  transform: scale(1.025);
}

.hero__small-image {
  position: absolute;
  bottom: 24px;
  left: 0;
  overflow: hidden;
  width: 37%;
  aspect-ratio: 0.82;
  border: 7px solid var(--cream);
  border-radius: 18px;
  background: var(--sand);
  box-shadow: 0 24px 40px rgba(42, 55, 45, 0.14);
  transform: rotate(-3deg);
}

.hero__small-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__stamp {
  position: absolute;
  top: 26px;
  left: 15%;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 98px;
  height: 98px;
  border: 1px dashed rgba(36, 72, 60, 0.6);
  border-radius: 50%;
  background: rgba(247, 243, 234, 0.9);
  color: var(--forest);
  text-align: center;
  transform: rotate(-8deg);
  backdrop-filter: blur(8px);
}

.hero__stamp strong {
  font-family: var(--font-serif);
  font-size: 21px;
  font-weight: 500;
  letter-spacing: 0.08em;
}

.hero__stamp span {
  margin-top: 2px;
  font-size: 6.5px;
  letter-spacing: 0.2em;
}

.hero__stamp em {
  margin-top: 5px;
  color: var(--clay-deep);
  font-size: 6.5px;
  font-style: normal;
  letter-spacing: 0.16em;
}

.hero__note {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  width: 236px;
  flex-direction: column;
  padding: 16px 18px;
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  background: rgba(255, 253, 248, 0.94);
  box-shadow: 0 18px 40px rgba(42, 55, 45, 0.11);
  backdrop-filter: blur(10px);
  transition: transform 0.3s var(--ease);
}

.hero__note:hover {
  transform: translateY(-3px);
}

.hero__note-label {
  color: var(--muted);
  font-size: 8.5px;
  letter-spacing: 0.12em;
}

.hero__note strong {
  margin-top: 5px;
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 600;
}

.hero__note-link {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  color: var(--clay-deep);
  font-size: 10px;
}

.promise-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 20px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.promise {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 18px;
  border-right: 1px solid var(--line);
  color: var(--forest);
}

.promise:last-child {
  border-right: 0;
}

.promise div {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.promise strong {
  color: var(--ink);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.promise span {
  color: var(--muted);
  font-size: 9px;
  letter-spacing: 0.02em;
}

.products-section {
  padding-top: 96px;
  scroll-margin-top: 100px;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
}

.section-head h2 {
  margin-top: 10px;
  font-family: var(--font-serif);
  font-size: clamp(36px, 4vw, 48px);
  font-weight: 400;
  letter-spacing: -0.02em;
}

.section-head__note {
  color: var(--muted);
  font-size: 11px;
  line-height: 1.8;
  text-align: right;
}

.shop-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 34px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line);
}

.category-tabs {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(233, 224, 207, 0.55);
}

.category-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--ink-soft);
  font-size: 11.5px;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.category-tab:hover {
  color: var(--ink);
}

.category-tab.is-active {
  background: var(--forest);
  color: var(--cream);
}

.category-tab__count {
  font-size: 8.5px;
  opacity: 0.55;
  font-variant-numeric: tabular-nums;
}

.shop-tools {
  display: flex;
  align-items: center;
  gap: 9px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 190px;
  height: 38px;
  padding: 0 11px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 253, 248, 0.6);
  color: var(--muted);
  transition: border-color 0.2s ease, width 0.3s var(--ease);
}

.search-box:focus-within {
  border-color: var(--forest);
  width: 220px;
}

.search-box input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ink);
  font-size: 11.5px;
}

.search-box input::placeholder {
  color: #9ca299;
}

.search-box input::-webkit-search-cancel-button {
  display: none;
}

.search-box kbd {
  display: grid;
  place-items: center;
  width: 17px;
  height: 17px;
  border: 1px solid var(--line);
  border-radius: 4px;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 9px;
}

.search-box__clear {
  display: grid;
  place-items: center;
  padding: 2px;
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}

.sort-select {
  position: relative;
  display: flex;
  align-items: center;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 253, 248, 0.6);
}

.sort-select select {
  height: 100%;
  padding: 0 32px 0 13px;
  border: 0;
  outline: 0;
  appearance: none;
  background: transparent;
  color: var(--ink-soft);
  font-size: 11px;
  cursor: pointer;
}

.sort-select svg {
  position: absolute;
  right: 11px;
  color: var(--muted);
  pointer-events: none;
}

.result-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0 20px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.06em;
}

.result-line__filter {
  display: flex;
  align-items: center;
  gap: 6px;
}

.result-line__filter button {
  padding: 0;
  border: 0;
  border-bottom: 1px solid var(--muted);
  background: transparent;
  color: var(--ink-soft);
  font-size: 10px;
  cursor: pointer;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 42px 22px;
}

.skeleton-card__image {
  aspect-ratio: 1 / 1.08;
  border-radius: var(--radius-card);
}

.skeleton-card__line {
  width: 72%;
  height: 12px;
  margin-top: 16px;
}

.skeleton-card__line--short {
  width: 45%;
  margin-top: 8px;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 330px;
  padding: 40px;
  border: 1px dashed var(--line);
  border-radius: var(--radius-card);
  text-align: center;
}

.state-box__icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--muted);
}

.state-box h3 {
  margin-top: 18px;
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 500;
}

.state-box p {
  max-width: 360px;
  margin: 8px 0 20px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
}

.story-section {
  padding-top: 100px;
}

.story {
  display: grid;
  grid-template-columns: 0.86fr 1.14fr;
  overflow: hidden;
  min-height: 470px;
  border-radius: 30px;
  background: var(--forest-deep);
  color: var(--cream);
}

.story__media {
  position: relative;
  overflow: hidden;
  min-height: 100%;
  background: var(--sand);
}

.story__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1s var(--ease);
}

.story:hover .story__media img {
  transform: scale(1.025);
}

.story__media-tag {
  position: absolute;
  right: 20px;
  bottom: 20px;
  padding: 7px 12px;
  border: 1px solid rgba(255, 253, 248, 0.3);
  border-radius: 999px;
  color: var(--cream);
  font-size: 8px;
  letter-spacing: 0.2em;
  backdrop-filter: blur(8px);
}

.story__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 64px 68px;
}

.story__content h2 {
  margin-top: 17px;
  font-family: var(--font-serif);
  font-size: clamp(38px, 4vw, 50px);
  font-weight: 400;
  line-height: 1.12;
  letter-spacing: -0.02em;
}

.story__content h2 em {
  color: var(--clay-light);
  font-style: normal;
}

.story__copy {
  max-width: 490px;
  margin-top: 22px;
  color: rgba(247, 243, 234, 0.6);
  font-size: 12.5px;
  line-height: 1.95;
}

.story__stats {
  display: flex;
  gap: 46px;
  margin-top: 34px;
}

.story__stats strong {
  font-family: var(--font-serif);
  font-size: 34px;
  font-weight: 400;
  color: var(--cream);
}

.story__stats strong span {
  margin-left: 2px;
  color: var(--clay-light);
  font-size: 17px;
}

.story__stats p {
  margin-top: 2px;
  color: rgba(247, 243, 234, 0.45);
  font-size: 9.5px;
  letter-spacing: 0.06em;
}

.story__link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 40px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(247, 243, 234, 0.35);
  color: var(--cream);
  font-size: 11px;
  letter-spacing: 0.06em;
  transition: gap 0.2s ease, border-color 0.2s ease;
}

.story__link:hover {
  gap: 11px;
  border-color: var(--cream);
}

@media (max-width: 1100px) {
  .hero {
    gap: 40px;
  }

  .hero__art {
    min-height: 500px;
  }

  .hero__main-image {
    height: 450px;
  }

  .hero__stamp {
    left: 8%;
  }

  .product-grid {
    gap: 36px 20px;
  }

  .story__content {
    padding: 50px 46px;
  }

  .story__stats {
    gap: 32px;
  }
}

@media (max-width: 980px) {
  .hero {
    grid-template-columns: 1fr;
    padding-top: 54px;
  }

  .hero__copy {
    max-width: 620px;
  }

  .hero__art {
    width: min(560px, 100%);
    margin-inline: auto;
  }

  .promise-bar {
    grid-template-columns: 1fr 1fr;
    row-gap: 18px;
  }

  .promise:nth-child(2) {
    border-right: 0;
  }

  .promise:nth-child(3),
  .promise:nth-child(4) {
    padding-top: 16px;
    border-top: 1px solid var(--line);
  }

  .shop-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .category-tabs {
    width: fit-content;
    max-width: 100%;
    overflow-x: auto;
  }

  .shop-tools {
    justify-content: space-between;
  }

  .search-box {
    width: 100%;
  }

  .search-box:focus-within {
    width: 100%;
  }

  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .story {
    grid-template-columns: 1fr;
  }

  .story__media {
    min-height: 360px;
    max-height: 420px;
  }

  .story__content {
    padding: 48px;
  }
}

@media (max-width: 740px) {
  .hero {
    padding-top: 44px;
    padding-bottom: 44px;
  }

  .hero__title {
    font-size: clamp(43px, 11vw, 60px);
  }

  .hero__lead {
    margin-top: 20px;
    font-size: 13px;
  }

  .hero__proof {
    margin-top: 30px;
  }

  .hero__art {
    min-height: 430px;
  }

  .hero__main-image {
    width: 78%;
    height: 390px;
  }

  .hero__small-image {
    width: 39%;
  }

  .hero__stamp {
    width: 82px;
    height: 82px;
    top: 18px;
    left: 2%;
  }

  .hero__stamp strong {
    font-size: 18px;
  }

  .hero__note {
    display: none;
  }

  .products-section {
    padding-top: 68px;
  }

  .section-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }

  .section-head__note {
    text-align: left;
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 32px 16px;
  }

  .story-section {
    padding-top: 70px;
  }

  .story__content {
    padding: 38px 30px;
  }

  .story__stats {
    gap: 28px;
  }

  .story__stats strong {
    font-size: 29px;
  }
}

@media (max-width: 480px) {
  .hero__actions .btn {
    flex: 1;
    padding: 0 14px;
  }

  .hero__art {
    min-height: 360px;
  }

  .hero__main-image {
    height: 330px;
    border-radius: 140px 140px 22px 22px;
  }

  .hero__small-image {
    bottom: 12px;
    border-width: 5px;
  }

  .hero__stamp {
    width: 70px;
    height: 70px;
  }

  .hero__stamp strong {
    font-size: 15px;
  }

  .hero__stamp span,
  .hero__stamp em {
    font-size: 5.5px;
  }

  .promise {
    justify-content: flex-start;
    padding: 0 8px;
  }

  .promise strong {
    font-size: 10.5px;
  }

  .shop-tools {
    flex-wrap: wrap;
  }

  .sort-select {
    width: 100%;
  }

  .sort-select select {
    width: 100%;
  }

  .product-grid {
    gap: 28px 12px;
  }

  .story__stats {
    flex-wrap: wrap;
    gap: 20px 30px;
  }
}
</style>
