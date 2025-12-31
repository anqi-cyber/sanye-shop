<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import AppIcon from '@/components/AppIcon.vue';
import { useCart } from '@/stores/cart';

const route = useRoute();
const { count, openCart } = useCart();

const scrolled = ref(false);
const menuOpen = ref(false);

function onScroll() {
  scrolled.value = window.scrollY > 10;
}

function openCartAndCloseMenu() {
  menuOpen.value = false;
  openCart();
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  },
);
</script>

<template>
  <header class="site-header">
    <div class="announcement">
      <div class="container announcement__inner">
        <span>满 ¥199 包邮</span>
        <span class="announcement__dot" aria-hidden="true"></span>
        <span>手作小批量</span>
        <span class="announcement__dot" aria-hidden="true"></span>
        <span>7 天无忧退换</span>
      </div>
    </div>

    <div class="nav-shell" :class="{ 'is-scrolled': scrolled }">
      <div class="container nav">
        <RouterLink to="/" class="brand" aria-label="山野商店首页">
          <span class="brand__mark"><AppIcon name="leaf" :size="19" /></span>
          <span class="brand__text">
            <strong>山野商店</strong>
            <em>SAN YE</em>
          </span>
        </RouterLink>

        <nav class="nav__links" :class="{ 'is-open': menuOpen }" aria-label="主导航">
          <RouterLink to="/" class="nav__link">首页</RouterLink>
          <RouterLink
            :to="{ path: '/', hash: '#products' }"
            class="nav__link"
            active-class=""
          >
            全部好物
          </RouterLink>
          <RouterLink to="/orders" class="nav__link">我的订单</RouterLink>
        </nav>

        <div class="nav__actions">
          <button
            type="button"
            class="cart-button"
            :aria-label="`打开购物车，共 ${count} 件商品`"
            @click="openCartAndCloseMenu"
          >
            <AppIcon name="cart" :size="18" />
            <span class="cart-button__label">购物车</span>
            <span class="cart-button__count" :class="{ 'is-empty': count === 0 }">
              {{ count }}
            </span>
          </button>

          <button
            type="button"
            class="menu-toggle"
            :aria-label="menuOpen ? '关闭菜单' : '打开菜单'"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <AppIcon :name="menuOpen ? 'close' : 'menu'" :size="20" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: relative;
  z-index: 50;
}

.announcement {
  background: var(--forest-deep);
  color: rgba(247, 243, 234, 0.82);
}

.announcement__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 34px;
  font-size: 10.5px;
  letter-spacing: 0.14em;
}

.announcement__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--clay-light);
}

.nav-shell {
  position: sticky;
  top: 0;
  background: rgba(247, 243, 234, 0.88);
  border-bottom: 1px solid transparent;
  backdrop-filter: blur(18px);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.nav-shell.is-scrolled {
  border-color: rgba(49, 63, 54, 0.1);
  box-shadow: 0 10px 30px rgba(38, 48, 40, 0.05);
}

.nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 78px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: var(--ink);
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--forest);
  color: var(--cream);
  transform: rotate(-4deg);
  transition: transform 0.3s var(--ease);
}

.brand:hover .brand__mark {
  transform: rotate(4deg);
}

.brand__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.brand__text strong {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.brand__text em {
  font-family: var(--font-serif);
  font-size: 8px;
  font-style: normal;
  letter-spacing: 0.34em;
  color: var(--muted);
}

.nav__links {
  display: flex;
  align-items: center;
  gap: 34px;
}

.nav__link {
  position: relative;
  padding: 8px 0;
  color: var(--ink-soft);
  font-size: 13px;
  letter-spacing: 0.08em;
  transition: color 0.2s ease;
}

.nav__link::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 2px;
  left: 0;
  height: 1px;
  background: var(--ink);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.25s var(--ease);
}

.nav__link:hover,
.nav__link.router-link-active {
  color: var(--ink);
}

.nav__link:hover::after,
.nav__link.router-link-active::after {
  transform: scaleX(1);
  transform-origin: left;
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 8px 0 15px;
  border: 0;
  border-radius: 999px;
  background: var(--forest);
  color: var(--cream);
  font-size: 12.5px;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s var(--ease);
}

.cart-button:hover {
  background: var(--forest-deep);
  transform: translateY(-1px);
}

.cart-button__count {
  display: grid;
  place-items: center;
  min-width: 26px;
  height: 26px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--clay);
  color: #fff9ee;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  transition: background 0.2s ease;
}

.cart-button__count.is-empty {
  background: rgba(255, 255, 255, 0.14);
}

.menu-toggle {
  display: none;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
}

@media (max-width: 900px) {
  .menu-toggle {
    display: grid;
  }

  .nav {
    height: 68px;
  }

  .nav__links {
    position: absolute;
    top: calc(100% + 1px);
    right: 0;
    left: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 10px 24px 18px;
    background: var(--paper);
    border-bottom: 1px solid var(--line);
    box-shadow: 0 24px 30px rgba(38, 48, 40, 0.08);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
    transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s;
  }

  .nav__links.is-open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .nav__link {
    padding: 14px 0;
    border-bottom: 1px solid var(--line-soft);
    font-size: 14px;
  }

  .nav__link:last-child {
    border-bottom: 0;
  }

  .nav__link::after {
    display: none;
  }

  .cart-button__label {
    display: none;
  }

  .cart-button {
    padding: 0 7px;
  }
}

@media (max-width: 560px) {
  .announcement__inner {
    gap: 9px;
    min-height: 32px;
    font-size: 9.5px;
    letter-spacing: 0.08em;
  }

  .brand__text strong {
    font-size: 16px;
  }

  .nav {
    gap: 12px;
  }
}
</style>
