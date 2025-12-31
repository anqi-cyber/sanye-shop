<script setup>
import { RouterLink } from 'vue-router';
import AppIcon from '@/components/AppIcon.vue';
import { useCart } from '@/stores/cart';

const { openCart } = useCart();
</script>

<template>
  <footer class="footer">
    <div class="container footer__top">
      <div class="footer__intro">
        <span class="footer__seal"><AppIcon name="leaf" :size="22" /></span>
        <p class="eyebrow eyebrow--light">SLOW GOODS · EST. 2026</p>
        <h2>慢一点，<br /><em>也很好。</em></h2>
        <p class="footer__copy">
          山野商店收集那些值得被日复一日使用的东西：一只杯子、一本书、一盏灯。
          不追赶潮流，只希望它们陪你久一点。
        </p>
      </div>

      <div class="footer__nav">
        <div class="footer__column">
          <h3>逛一逛</h3>
          <RouterLink to="/">首页</RouterLink>
          <RouterLink :to="{ path: '/', hash: '#products' }">全部好物</RouterLink>
          <RouterLink to="/orders">我的订单</RouterLink>
        </div>

        <div class="footer__column">
          <h3>服务</h3>
          <button type="button" class="footer__link" @click="openCart">查看购物车</button>
          <span>满 ¥199 包邮</span>
          <span>7 天无忧退换</span>
        </div>

        <div class="footer__column">
          <h3>找到我们</h3>
          <span>杭州市西湖区青芝坞 18 号</span>
          <span>每周三 · 上新日</span>
          <a href="mailto:hello@sanye.shop">hello@sanye.shop</a>
        </div>
      </div>
    </div>

    <div class="container footer__bottom">
      <span>© 2026 山野商店 SAN YE</span>
      <span>Vue 3 + Node.js 全栈学习项目</span>
      <a href="#app" class="footer__top-link">
        回到顶部
        <AppIcon name="arrow-up-right" :size="13" />
      </a>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  overflow: hidden;
  margin-top: 110px;
  background: var(--forest-deep);
  color: rgba(247, 243, 234, 0.78);
}

.footer::before {
  content: '';
  position: absolute;
  top: -170px;
  right: -120px;
  width: 520px;
  height: 520px;
  border: 1px solid rgba(247, 243, 234, 0.1);
  border-radius: 50%;
  box-shadow:
    0 0 0 70px rgba(247, 243, 234, 0.025),
    0 0 0 140px rgba(247, 243, 234, 0.02);
}

.footer__top {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 80px;
  padding-top: 82px;
  padding-bottom: 70px;
}

.footer__seal {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 24px;
  border: 1px solid rgba(247, 243, 234, 0.2);
  border-radius: 50%;
  color: var(--clay-light);
}

.footer__intro h2 {
  margin: 16px 0 24px;
  color: var(--cream);
  font-family: var(--font-serif);
  font-size: clamp(42px, 5vw, 62px);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.footer__intro h2 em {
  color: var(--clay-light);
  font-weight: 400;
}

.footer__copy {
  max-width: 440px;
  font-size: 13px;
  line-height: 1.9;
  color: rgba(247, 243, 234, 0.58);
}

.footer__nav {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 30px;
  padding-top: 12px;
}

.footer__column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 13px;
  font-size: 12px;
  line-height: 1.6;
}

.footer__column h3 {
  margin-bottom: 8px;
  color: var(--cream);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.footer__column a,
.footer__link {
  position: relative;
  color: rgba(247, 243, 234, 0.62);
  transition: color 0.2s ease;
}

.footer__column a:hover,
.footer__link:hover {
  color: var(--cream);
}

.footer__link {
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.footer__bottom {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-top: 22px;
  padding-bottom: 28px;
  border-top: 1px solid rgba(247, 243, 234, 0.12);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: rgba(247, 243, 234, 0.42);
}

.footer__top-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(247, 243, 234, 0.65);
}

@media (max-width: 900px) {
  .footer__top {
    grid-template-columns: 1fr;
    gap: 50px;
    padding-top: 64px;
  }

  .footer__nav {
    gap: 24px;
  }
}

@media (max-width: 640px) {
  .footer {
    margin-top: 72px;
  }

  .footer__nav {
    grid-template-columns: 1fr 1fr;
    row-gap: 34px;
  }

  .footer__bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
