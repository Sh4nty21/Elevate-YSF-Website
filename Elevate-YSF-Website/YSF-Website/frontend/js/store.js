import { api } from './api.js';

const { reactive } = Vue;

export const store = reactive({
  user: null,
  authChecked: false,
  toasts: [],

  async checkSession() {
    const res = await api.get('session_check.php');
    this.user = res.success ? res.user : null;
    this.authChecked = true;
    return this.user;
  },

  setUser(user) {
    this.user = user;
  },

  clearUser() {
    this.user = null;
  },

  toast(message, type = 'success', timeout = 4500) {
    const id = Date.now() + Math.random();
    this.toasts.push({ id, message, type });
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }, timeout);
  },
});

window.addEventListener('ysf:unauthorized', () => {
  store.clearUser();
});
