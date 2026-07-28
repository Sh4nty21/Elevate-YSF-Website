import { api } from '../api.js';
import { store } from '../store.js';

export default {
  name: 'Login',
  data() {
    return {
      identifier: '',
      password: '',
      showPassword: false,
      submitting: false,
      errorMsg: '',
      lockedOutUntil: null,
      remember: true,
    };
  },
  computed: {
    lockedOut() {
      return this.lockedOutUntil && this.lockedOutUntil > Date.now();
    },
  },
  methods: {
    async submit() {
      if (this.submitting || this.lockedOut) return;
      this.errorMsg = '';

      if (!this.identifier.trim() || !this.password) {
        this.errorMsg = 'Please enter your username/email and password.';
        return;
      }

      this.submitting = true;
      const res = await api.post('login.php', {
        identifier: this.identifier.trim(),
        password: this.password,
        remember: this.remember,
      });
      this.submitting = false;

      if (res.success) {
        store.setUser(res.user);
        store.toast(`Welcome back, ${res.user.full_name.split(' ')[0]}!`, 'success');
        this.$router.push(res.redirect);
        return;
      }

      if (res.locked_until) {
        this.lockedOutUntil = res.locked_until * 1000;
        this.errorMsg = res.message;
        return;
      }

      this.errorMsg = res.message || 'Incorrect username/email or password.';
    },
  },
  template: `
  <div class="auth-wrap">
    <div class="auth-side">
      <span class="verse-tag">1 Timothy 4:8</span>
      <h1>Train For What<br/>Lasts Forever</h1>
      <p>"For physical training is of some value, but godliness has value for all things,
         holding promise for the present life and the life to come."</p>
      <router-link to="/" class="back-link"><i class="fa-solid fa-arrow-left"></i> Back to home</router-link>
    </div>

    <div class="auth-form-side">
      <form class="auth-box" @submit.prevent="submit" novalidate>
        <img src="img/elevate-ysf-logo.png" class="logo" alt="Elevate YSF" />
        <h2>Welcome Back</h2>
        <p class="sub">Sign in to pre-check in and view your dashboard.</p>

        <div v-if="errorMsg" class="form-banner error">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>{{ errorMsg }}</span>
        </div>

        <div class="field">
          <label for="identifier">Username or email</label>
          <div class="input-box">
            <i class="fa-solid fa-user"></i>
            <input id="identifier" v-model="identifier" type="text" autocomplete="username" required />
          </div>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <div class="input-box">
            <i class="fa-solid fa-lock"></i>
            <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password"
                   autocomplete="current-password" required />
            <button type="button" class="reveal" @click="showPassword = !showPassword"
                    :aria-label="showPassword ? 'Hide password' : 'Show password'">
              <i class="fa-solid" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
            </button>
          </div>
        </div>

        <label style="display:flex;align-items:center;gap:8px;font-size:0.88rem;color:var(--muted);margin-bottom:18px;">
          <input type="checkbox" v-model="remember" style="width:auto" /> Keep me signed in on this device
        </label>

        <button type="submit" class="btn btn-primary btn-block" :disabled="submitting || lockedOut">
          <span v-if="submitting"><i class="fa-solid fa-spinner fa-spin"></i> Signing in&hellip;</span>
          <span v-else-if="lockedOut"><i class="fa-solid fa-lock"></i> Try again later</span>
          <span v-else>Login</span>
        </button>

        <p class="switch-text">Don't have an account? <router-link to="/signup">Sign Up</router-link></p>
      </form>
    </div>
  </div>
  `,
};
