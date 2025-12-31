<script setup>
import AppIcon from '@/components/AppIcon.vue';

const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 99 },
  compact: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

function change(delta) {
  const next = Math.max(props.min, Math.min(props.max, props.modelValue + delta));
  if (next !== props.modelValue) emit('update:modelValue', next);
}
</script>

<template>
  <div class="qty" :class="{ 'qty--compact': compact }">
    <button
      type="button"
      class="qty__button"
      :disabled="modelValue <= min"
      aria-label="减少数量"
      @click="change(-1)"
    >
      <AppIcon name="minus" :size="compact ? 13 : 15" />
    </button>
    <span class="qty__value" aria-live="polite">{{ modelValue }}</span>
    <button
      type="button"
      class="qty__button"
      :disabled="modelValue >= max"
      aria-label="增加数量"
      @click="change(1)"
    >
      <AppIcon name="plus" :size="compact ? 13 : 15" />
    </button>
  </div>
</template>

<style scoped>
.qty {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--paper);
  padding: 3px;
}

.qty__button {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.qty__button:hover:not(:disabled) {
  background: var(--forest);
  color: var(--cream);
}

.qty__button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty__value {
  min-width: 28px;
  text-align: center;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.qty--compact .qty__button {
  width: 25px;
  height: 25px;
}

.qty--compact .qty__value {
  min-width: 22px;
  font-size: 13px;
}
</style>
