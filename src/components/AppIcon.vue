<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  strokeWidth: { type: [Number, String], default: 1.8 },
});
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke-width="strokeWidth"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'cart'">
      <path d="M6.4 8h11.2l.8 11.1a1.5 1.5 0 0 1-1.5 1.6H7.1a1.5 1.5 0 0 1-1.5-1.6L6.4 8Z" />
      <path d="M9 8V6.2a3 3 0 0 1 6 0V8" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="6.4" />
      <path d="m16 16 4.4 4.4" />
    </template>
    <template v-else-if="name === 'plus'">
      <path d="M12 5v14M5 12h14" />
    </template>
    <template v-else-if="name === 'minus'">
      <path d="M5 12h14" />
    </template>
    <template v-else-if="name === 'arrow-right'">
      <path d="M4.5 12h15M13.5 6l6 6-6 6" />
    </template>
    <template v-else-if="name === 'arrow-left'">
      <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />
    </template>
    <template v-else-if="name === 'arrow-up-right'">
      <path d="M7 17 17 7M8 7h9v9" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="m6 6 12 12M18 6 6 18" />
    </template>
    <template v-else-if="name === 'trash'">
      <path d="M4 7h16M9 7V4.8A.8.8 0 0 1 9.8 4h4.4a.8.8 0 0 1 .8.8V7M6.5 7l.8 12.2a1 1 0 0 0 1 .8h7.4a1 1 0 0 0 1-.8L17.5 7" />
      <path d="M10 11v5M14 11v5" />
    </template>
    <template v-else-if="name === 'check'">
      <path d="m5 12.5 4.2 4.2L19 7" />
    </template>
    <template v-else-if="name === 'leaf'">
      <path d="M20 4c-8 0-13 4.2-13 10.2A5.8 5.8 0 0 0 12.8 20C18.8 20 20 13 20 4Z" />
      <path d="M4 20c2.8-5.2 6.2-8.2 11-10.3" />
    </template>
    <template v-else-if="name === 'truck'">
      <path d="M3 6h10.5v10H3zM13.5 9.5H18l3 3V16h-7.5" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17.5" cy="18" r="1.8" />
    </template>
    <template v-else-if="name === 'shield'">
      <path d="M12 3.5 19 6v5.5c0 4.4-2.9 7.5-7 9-4.1-1.5-7-4.6-7-9V6Z" />
      <path d="m8.8 12 2.2 2.2 4.4-4.5" />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <path d="m5 9 7 7 7-7" />
    </template>
    <template v-else-if="name === 'menu'">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </template>
    <template v-else-if="name === 'spark'">
      <path d="M12 3c.6 4.8 3.2 7.4 8 8-4.8.6-7.4 3.2-8 8-.6-4.8-3.2-7.4-8-8 4.8-.6 7.4-3.2 8-8Z" />
    </template>
    <template v-else-if="name === 'alert'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16.5h.01" />
    </template>
    <template v-else-if="name === 'package'">
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" />
      <path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12.1V21" />
    </template>
    <template v-else-if="name === 'pin'">
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </template>
    <template v-else>
      <circle cx="12" cy="12" r="9" />
    </template>
  </svg>
</template>
