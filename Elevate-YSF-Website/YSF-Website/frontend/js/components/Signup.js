import { api } from '../api.js';
import { store } from '../store.js';

function scorePassword(pw) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 4);
}

export default {
  name: 'Signup',
  data() {
    return {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      agree: false,
      website: '', // honeypot: real users never fill this (hidden via CSS)
      submitting: false,
      errorMsg: '',
      successMsg: '',
      fieldErrors: {},
    };
  },
  computed: {
    strength() { return scorePassword(this.password); },
    strengthLabel() {
      return ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'][this.strength];
    },
    strengthColor() {
      return ['#d5312a', '#d5312a', '#e8a13d', '#3d8ee8', '#1f8a4c'][this.strength];
    },
  },
  methods: {
    validate() {
      const errs = {};
      if (this.fullName.trim().length < 2) errs.fullName = 'Enter your full name.';
      if (!/^[a-zA-Z0-9_.]{3,30}$/.test(this.username)) {
        errs.username = '3-30 characters: letters, numbers, dot or underscore only.';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) errs.email = 'Enter a valid email address.';
      if (this.password.length < 8) errs.password = 'Use at least 8 characters.';
      else if (this.strength < 2) errs.password = 'Add numbers, symbols, or mixed case for a stronger password.';
      if (this.confirmPassword !== this.password) errs.confirmPassword = 'Passwords do not match.';
      if (!this.agree) errs.agree = 'Please confirm you agree to the fellowship guidelines.';
      this.fieldErrors = errs;
      return Object.keys(errs).length === 0;
    },
    async submit() {
      this.errorMsg = '';
      this.successMsg = '';
      if (this.website) return; // bot caught by honeypot, silently drop
      if (!this.validate()) return;

      this.submitting = true;
      const res = await api.post('register.php', {
        full_name: this.fullName.trim(),
        username: this.username.trim(),
        email: this.email.trim(),
        password: this.password,
      });
      this.submitting = false;

      if (res.success) {
        this.successMsg = 'Account created! Redirecting you to sign in...';
        store.toast('Account created successfully!', 'success');
        setTimeout(() => this.$router.push('/login'), 1400);
      } else if (res.field_errors) {
        this.fieldErrors = { ...this.fieldErrors, ...res.field_errors };
      } else {
        this.errorMsg = res.message || 'Something went wrong. Please try again.';
      }
    },
  },
  template: `
  <div class="auth-wrap">
    <div class="auth-side">
      <span class="verse-tag">Join The Team</span>
      <h1>Create Your Account,<br/>Become Part of<br/>The Fellowship</h1>
      <p>Sign up to pre-check in for Saturday sessions, track your attendance, and connect with your D-Group leader.</p>
      <router-link to="/" class="back-link"><i class="fa-solid fa-arrow-left"></i> Back to home</router-link>
    </div>

    <div class="auth-form-side">
      <form class="auth-box" @submit.prevent="submit" novalidate>
        <img src="img/elevate-ysf-logo.png" class="logo" alt="Elevate YSF" />
        <h2>Create Account</h2>
        <p class="sub">It only takes a minute.</p>

        <div v-if="errorMsg" class="form-banner error"><i class="fa-solid fa-circle-exclamation"></i><span>{{ errorMsg }}</span></div>
        <div v-if="successMsg" class="form-banner success"><i class="fa-solid fa-circle-check"></i><span>{{ successMsg }}</span></div>

        <!-- Honeypot: visually hidden, real users leave it blank -->
        <div class="visually-hidden" aria-hidden="true">
          <label for="website">Leave blank</label>
          <input id="website" v-model="website" type="text" tabindex="-1" autocomplete="off" />
        </div>

        <div class="field">
          <label for="fullName">Full name</label>
          <div class="input-box">
            <i class="fa-solid fa-user"></i>
            <input id="fullName" v-model="fullName" type="text" autocomplete="name" required />
          </div>
          <p class="field-error">{{ fieldErrors.fullName || '' }}</p>
        </div>

        <div class="field">
          <label for="username">Username</label>
          <div class="input-box">
            <i class="fa-solid fa-user-tag"></i>
            <input id="username" v-model="username" type="text" autocomplete="username" required />
          </div>
          <p class="field-error">{{ fieldErrors.username || '' }}</p>
        </div>

        <div class="field">
          <label for="email">Email address</label>
          <div class="input-box">
            <i class="fa-solid fa-envelope"></i>
            <input id="email" v-model="email" type="email" autocomplete="email" required />
          </div>
          <p class="field-error">{{ fieldErrors.email || '' }}</p>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <div class="input-box">
            <i class="fa-solid fa-lock"></i>
            <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password"
                   autocomplete="new-password" required />
            <button type="button" class="reveal" @click="showPassword = !showPassword"
                    :aria-label="showPassword ? 'Hide password' : 'Show password'">
              <i class="fa-solid" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
            </button>
          </div>
          <div class="strength-meter" v-if="password">
            <div class="strength-fill" :style="{ width: (strength/4*100) + '%', background: strengthColor }"></div>
          </div>
          <p class="field-hint" v-if="password">{{ strengthLabel }} password</p>
          <p class="field-error">{{ fieldErrors.password || '' }}</p>
        </div>

        <div class="field">
          <label for="confirmPassword">Confirm password</label>
          <div class="input-box">
            <i class="fa-solid fa-lock"></i>
            <input :type="showPassword ? 'text' : 'password'" id="confirmPassword" v-model="confirmPassword"
                   autocomplete="new-password" required />
          </div>
          <p class="field-error">{{ fieldErrors.confirmPassword || '' }}</p>
        </div>

        <label style="display:flex;align-items:flex-start;gap:8px;font-size:0.85rem;color:var(--muted);margin-bottom:6px;">
          <input type="checkbox" v-model="agree" style="width:auto;margin-top:3px" />
          I agree to follow the fellowship's conduct guidelines and understand my info is used only for ministry sign-ups.
        </label>
        <p class="field-error">{{ fieldErrors.agree || '' }}</p>

        <button type="submit" class="btn btn-primary btn-block" :disabled="submitting" style="margin-top:10px">
          <span v-if="submitting"><i class="fa-solid fa-spinner fa-spin"></i> Creating account&hellip;</span>
          <span v-else>Sign Up</span>
        </button>

        <p class="switch-text">Already have an account? <router-link to="/login">Login</router-link></p>
      </form>
    </div>
  </div>
  `,
};
