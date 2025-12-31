import { ref } from 'vue';

const toasts = ref([]);
let nextId = 0;

export function useToast() {
  function dismiss(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }

  function show(message, type = 'success', duration = 2800) {
    const id = ++nextId;
    toasts.value.push({ id, message, type });
    window.setTimeout(() => dismiss(id), duration);
    return id;
  }

  return { toasts, show, dismiss };
}
