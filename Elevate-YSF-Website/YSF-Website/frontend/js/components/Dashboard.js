

import { api } from '../api.js';
import { store } from '../store.js';
import { formatSessionLabel, countdownParts, isHappeningNow } from '../schedule.js';
import PreCheckinModal from './PreCheckinModal.js';

console.log("Dashboard.js loaded");

export default {
  name: 'Dashboard',
  components: { PreCheckinModal },
  data() {
    return {
      loading: true,
      profile: null,
      dgroup: null,
      sports: [],
      attendance: [],
      attendanceRate: 0,
      allSports: [],
      myCheckins: [],
      showModal: false,
      countdown: countdownParts(),
      timer: null,
    };
  },
  computed: {
    sessionLabel() { return formatSessionLabel(); },
    liveNow() { return isHappeningNow(); },
  },
  async mounted() {
    this.timer = setInterval(() => { this.countdown = countdownParts(); }, 1000);
    await this.load();
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    async load() {
      this.loading = true;
      const [dashRes, sportsRes] = await Promise.all([
        api.get('dashboard_data.php'),
        api.get('sports_status.php'),
      ]);

      if (dashRes.success) {
        this.profile = dashRes.profile;
        this.dgroup = dashRes.dgroup;
        this.sports = dashRes.sports;
        this.attendance = dashRes.attendance;
        this.attendanceRate = dashRes.attendance_rate;
        this.myCheckins = dashRes.upcoming_checkins || [];
      } else {
        store.toast(dashRes.message || 'Could not load your dashboard.', 'error');
      }
      if (sportsRes.success) this.allSports = sportsRes.sports;
      this.loading = false;
    },
    icon(name) {
      return { Basketball: 'fa-basketball', Volleyball: 'fa-volleyball', Badminton: 'fa-table-tennis-paddle-ball' }[name] || 'fa-medal';
    },
    statusClass(s) { return (s || '').toLowerCase(); },
    onCheckedIn() {
      this.load();
    },
    initials(name) {
      if (!name) return 'YSF';
      return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
    },
    goToProfile() {
        console.log("Navigating...");
        this.$router.push("/profile");
    },
  },
 template: `
<div class="dash-body">

  <div class="container" v-if="loading">
    <p class="empty-state">Loading your dashboard&hellip;</p>
  </div>

  <div class="container" v-else-if="profile">

    <!-- SCHEDULE REMINDER -->
    <div class="schedule-banner" style="margin-bottom:22px">
      <div class="schedule-clock">
        <template v-if="liveNow">Happening now!</template>
        <template v-else>
          {{ countdown.days }}d {{ countdown.hours }}h {{ countdown.minutes }}m
        </template>
      </div>

      <div class="schedule-meta">
        <h3>
          <i class="fa-solid fa-calendar-check" style="color:var(--red)"></i>
          {{ sessionLabel }}, 1:00–5:00 PM
        </h3>

        <p>
          Don't forget to pre-check in so your coach knows to expect you this Saturday.
        </p>
      </div>

      <button class="btn btn-primary" @click="showModal = true">
        <i class="fa-solid fa-clipboard-check"></i>
        Pre-Check In
      </button>
    </div>

    <!-- WELCOME -->
    <div class="card welcome-card">
      <img
        class="welcome-avatar"
        :src="'img/' + (profile.profile_photo || 'default-profile.svg')"
        @error="$event.target.src='img/default-profile.svg'"
        alt=""
      />

      <div class="welcome-copy">
        <span class="status-pill">{{ profile.membership_status }}</span>

        <h1>
          Welcome back, {{ profile.full_name.split(' ')[0] }}!
        </h1>

        <p>
          Stay active and keep growing in Christ through sports.
        </p>
      </div>
    </div>

    <div class="dash-grid">

      <!-- PROFILE -->
      <div
        class="card dashboard-card profile-card"
        @click="goToProfile"
        style="cursor:pointer;">

        <div class="card-heading">
          <i class="fa-solid fa-id-card"></i>
          <h2>My Profile</h2>
        </div>

        <ul class="info-list">
          <li><span>Full Name</span><strong>{{ profile.full_name }}</strong></li>
          <li><span>Username</span><strong>{{ profile.username }}</strong></li>
          <li><span>Email</span><strong>{{ profile.email }}</strong></li>
          <li><span>Member Since</span><strong>{{ profile.member_since }}</strong></li>
          <li><span>Status</span><strong>{{ profile.membership_status }}</strong></li>
        </ul>

      </div>

      <!-- SPORTS -->
      <div class="card dashboard-card">

        <div class="card-heading">
          <i class="fa-solid fa-trophy"></i>
          <h2>My Sports</h2>
        </div>

        <div class="sports-badges" v-if="sports.length">
          <span
            class="sport-badge"
            v-for="s in sports"
            :key="s.sport_id">

            <i class="fa-solid" :class="icon(s.sport_name)"></i>
            {{ s.sport_name }}

          </span>
        </div>

        <p v-else class="empty-state">
          No sports joined yet. Pre-check in above to get started.
        </p>

      </div>

      <!-- LEADER -->
      <div class="card dashboard-card">

        <div class="card-heading">
          <i class="fa-solid fa-people-group"></i>
          <h2>My D-Group Leader</h2>
        </div>

        <div class="leader-profile" v-if="dgroup && dgroup.leader_name">

          <img
            :src="'img/' + (dgroup.leader_photo || 'default-leader.svg')"
            @error="$event.target.src='img/default-leader.svg'"
            alt="">

          <div>
            <h3>{{ dgroup.leader_name }}</h3>
            <p class="muted">{{ dgroup.group_name }}</p>
            <p class="muted">{{ dgroup.leader_contact }}</p>
          </div>

        </div>

        <p v-else class="empty-state">
          Not assigned to a D-Group yet.
        </p>

      </div>

      <!-- ATTENDANCE -->
      <div class="card dashboard-card span-2">

        <div class="card-heading">
          <i class="fa-solid fa-calendar-check"></i>
          <h2>Attendance</h2>
        </div>

        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: attendanceRate + '%' }">
          </div>
        </div>

        <p class="progress-label">
          {{ attendanceRate }}% Attendance
        </p>

        <ul class="attendance-list" v-if="attendance.length">

          <li
            v-for="a in attendance"
            :key="a.attendance_date + a.sport_name">

            <span>
              {{ a.attendance_date }} · {{ a.sport_name || 'General' }}
            </span>

            <span
              class="att-status"
              :class="statusClass(a.status)">
              {{ a.status }}
            </span>

          </li>

        </ul>

        <p v-else class="empty-state">
          No attendance records yet.
        </p>

      </div>

      <!-- ANNOUNCEMENTS -->
      <div class="card dashboard-card">

        <div class="card-heading">
          <i class="fa-solid fa-bullhorn"></i>
          <h2>Announcements</h2>
        </div>

        <ul class="announcement-list">
          <li>Training starts at 1:00 PM sharp.</li>
          <li>Sports Camp registration is open.</li>
          <li>Volunteer applications available.</li>
        </ul>

      </div>

      <!-- QUICK ACTIONS -->
      <div class="card dashboard-card span-3">

        <div class="card-heading">
          <i class="fa-solid fa-bolt"></i>
          <h2>Quick Actions</h2>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">

          <button class="action-btn" @click="showModal = true">
            <i class="fa-solid fa-clipboard-check"></i>
            Pre-Check In
          </button>

          <button class="action-btn" disabled>
            <i class="fa-solid fa-calendar-plus"></i>
            Register Event
          </button>

          <button class="action-btn" disabled>
            <i class="fa-solid fa-clock"></i>
            View Schedule
          </button>

          <button class="action-btn" disabled>
            <i class="fa-solid fa-comments"></i>
            Contact Coach
          </button>

        </div>

      </div>

    </div>

  </div>

  <PreCheckinModal
    v-if="showModal"
    :sports="allSports"
    :already-checked-in="myCheckins"
    @close="showModal = false"
    @checked-in="onCheckedIn"
  />

</div>
`,
};
