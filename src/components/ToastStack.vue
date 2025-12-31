<script setup>
import AppIcon from '@/components/AppIcon.vue';
import { useToast } from '@/composables/useToast';

const { toasts, dismiss } = useToast();
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast">
        <button
          v-for="toast in toasts"
          :key="toast.id"
          type="button"
          class="toast"
          :class="`toast--${toast.type}`"
          @click="dismiss(toast.id)"
        >
          <span class="toast__icon">
            <AppIcon :name="toast.type === 'error' ? 'alert' : 'check'" :size="15" />
          </span>
          <span>{{ toast.message }}</span>
        </button>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  z-index: 120;
  right: 24px;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: min(360px, calc(100vw - 32px));
  padding: 12px 16px 12px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: var(--forest-deep);
  color: var(--cream);
  box-shadow: 0 18px 40px rgba(23, 44, 36, 0.28);
  font-size: 13.5px;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;
  pointer-events: auto;
}

.toast__icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
}

.toast--error {
  background: #743f31;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

@media (max-width: 640px) {
  .toast-stack {
    right: 16px;
    bottom: 16px;
    left: 16px;
    align-items: stretch;
  }

  .toast {
    max-width: none;
  }
}
</style>
