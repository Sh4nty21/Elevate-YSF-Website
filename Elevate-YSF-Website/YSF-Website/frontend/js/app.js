import { store } from './store.js';
import NavBar from './components/NavBar.js';
import Footer from './components/Footer.js';
import ToastStack from './components/ToastStack.js';
import Home from './components/Home.js';
import Login from './components/Login.js';
import Signup from './components/Signup.js';
import Dashboard from './components/Dashboard.js';
import AdminDashboard from './components/Admindashboard.js';
import SportsDashboard from './components/Sportdashboard.js';
import DGroupDashboard from './components/DGroupdashboard.js';
import Participants from "./components/Participants.js";
import Profile from "./components/participant/Profile.js";
import NotFound from './components/NotFound.js';

const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// Hash history (#/) is used so this build-less SPA can be dropped onto
// ANY static host (Netlify, GitHub Pages, Vercel, a plain Apache folder)
// with zero server rewrite-rule configuration. If your host supports
// SPA rewrites and you'd rather have clean URLs, swap this for
// createWebHistory() and add the rewrite rule described in DEPLOYMENT.md.
const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/login', name: 'login', component: Login, meta: { hideChrome: true, guestOnly: true } },
  { path: '/signup', name: 'signup', component: Signup, meta: { hideChrome: true, guestOnly: true } },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/admin', name: 'admin', component: AdminDashboard, meta: { requiresAuth: true } },
  { path: '/sports', name: 'sports', component: SportsDashboard, meta: { requiresAuth: true } },
  { path: '/dgroup', name: 'dgroup', component: DGroupDashboard, meta: { requiresAuth: true } },
  { path: "/participants", name: "participants", component: Participants },
  { path: "/profile", name: "profile", component: Profile, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  if (!store.authChecked) {
    await store.checkSession();
  }
  if (to.meta.requiresAuth && !store.user) {
    return { name: 'login' };
  }
  if (to.meta.guestOnly && store.user) {
   switch (store.user.role_name) {

        case "Core Admin":
            return { name: "admin" };

        case "Sports Admin":
            return { name: "sports" };

        case "DGroup Leader":
            return { name: "dgroup" };

        default:
            return { name: "dashboard" };
    }
  }
  return true;
});

const App = {
  components: { NavBar, Footer, ToastStack },
  computed: {
    hideChrome() { return this.$route.meta.hideChrome; },
  },
  template: `
    <div>
      <a href="#main" class="skip-link">Skip to content</a>
      <NavBar v-if="!hideChrome" />
      <main id="main">
        <router-view />
      </main>
      <Footer v-if="!hideChrome" />
      <ToastStack />
    </div>
  `,
};

createApp(App).use(router).mount('#app');
