<script setup>
import { RouterView } from 'vue-router';
import CartDrawer from '@/components/CartDrawer.vue';
import SiteFooter from '@/components/SiteFooter.vue';
import SiteHeader from '@/components/SiteHeader.vue';
import ToastStack from '@/components/ToastStack.vue';
</script>

<template>
  <div id="app" class="app-shell">
    <SiteHeader />

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <SiteFooter />
    <CartDrawer />
    <ToastStack />
  </div>
</template>
