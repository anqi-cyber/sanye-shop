<script setup>
import { RouterLink } from 'vue-router';
import AppIcon from '@/components/AppIcon.vue';
</script>

<template>
  <div class="not-found container">
    <span class="not-found__code">404</span>
    <p class="eyebrow">LOST IN THE WILD</p>
    <h1>这条路，好像走岔了。</h1>
    <p class="not-found__lead">
      你要找的页面不在山野里。别担心，回商店重新出发就好。
    </p>
    <div class="not-found__actions">
      <RouterLink to="/" class="btn btn--primary">
        回到商店
        <AppIcon name="arrow-right" :size="15" />
      </RouterLink>
      <RouterLink to="/orders" class="btn btn--ghost">查看订单</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  position: relative;
  display: flex;
  min-height: 620px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-align: center;
}

.not-found__code {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: -1;
  color: rgba(36, 72, 60, 0.055);
  font-family: var(--font-serif);
  font-size: clamp(180px, 32vw, 400px);
  line-height: 1;
  letter-spacing: -0.06em;
  transform: translate(-50%, -50%);
  user-select: none;
}

.not-found h1 {
  margin-top: 12px;
  font-family: var(--font-serif);
  font-size: clamp(38px, 5.5vw, 62px);
  font-weight: 400;
  letter-spacing: -0.025em;
}

.not-found__lead {
  max-width: 420px;
  margin: 15px 0 26px;
  color: var(--muted);
  font-size: 12.5px;
  line-height: 1.9;
}

.not-found__actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 560px) {
  .not-found {
    min-height: 520px;
  }

  .not-found__actions {
    width: 100%;
    flex-direction: column;
  }
}
</style>
