import { store } from '../store.js';

export default {
  name: 'ToastStack',
  computed: {
    toasts() { return store.toasts; },
  },
  methods: {
    icon(type) {
      return { success: 'fa-circle-check', error: 'fa-circle-exclamation', warn: 'fa-triangle-exclamation' }[type] || 'fa-circle-info';
    },
  },
  template: `
    <div class="toast-stack" aria-live="polite">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">
        <i class="fa-solid" :class="icon(t.type)"></i>
        <span>{{ t.message }}</span>
      </div>
    </div>
  `,
};
