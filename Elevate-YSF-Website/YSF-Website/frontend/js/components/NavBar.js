import { store } from '../store.js';
import { api } from '../api.js';

export default {
  name: 'NavBar',
  data() {
    return { open: false };
  },
  computed: {

    user() {
        return store.user;
    },

    dashboardRoute() {

    

    if (!this.user) return "/dashboard";

    switch (this.user.role_name) {

        case "Core Admin":
            return "/admin";

        case "Sports Admin":
            return "/sports";

        case "DGroup Leader":
            return "/dgroup";

        default:
            return "/dashboard";
    }
  }
    
    

  },
  watch: {
    $route() { this.open = false; },
  },
  methods: {
    toggle() { this.open = !this.open; },
    close() { this.open = false; },
    async logout() {
      await api.post('logout.php', {});
      store.clearUser();
      this.close();
      this.$router.push('/');
      store.toast('You have been logged out.', 'success');
    },
  },
  template: `
    <header class="site-header">
      <div class="container">
        <router-link to="/" class="brand" @click="close">
          <img src="img/elevate-ysf-logo.png" alt="Elevate YSF logo" />
          <span>ELEVATE YSF</span>
        </router-link>

        <button class="menu-toggle" @click="toggle" :aria-expanded="open" aria-label="Toggle menu">
          <i class="fa-solid" :class="open ? 'fa-xmark' : 'fa-bars'"></i>
        </button>

        <ul class="nav-links" :class="{ open }">
          <li><router-link to="/" @click="close">Home</router-link></li>
          <li><router-link to="/#programs" @click="close">Programs</router-link></li>
          <li><router-link to="/#events" @click="close">Events</router-link></li>
          <li><router-link to="/#gallery" @click="close">Gallery</router-link></li>
          <li v-if="user"><router-link :to="dashboardRoute" @click="close">Dashboard</router-link></li>
          <li class="mobile-only" v-if="!user"><router-link to="/login" @click="close">Login</router-link></li>
          <li class="mobile-only" v-if="user"><a href="#" @click.prevent="logout"><i class="fa-solid fa-right-from-bracket"></i> Logout</a></li>
        </ul>

        <div class="header-actions">
          <router-link v-if="!user" to="/login" class="btn btn-outline desktop-only">Login</router-link>
          <button v-else class="btn btn-outline desktop-only" @click="logout">Logout</button>
        </div>
      </div>

      <div class="nav-scrim" :class="{ open }" @click="close"></div>
    </header>
  `,
};
