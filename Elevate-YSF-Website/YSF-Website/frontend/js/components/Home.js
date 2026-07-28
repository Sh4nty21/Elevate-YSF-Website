import { api } from '../api.js';
import { store } from '../store.js';
import { formatSessionLabel, countdownParts } from '../schedule.js';

export default {
  name: 'Home',
  data() {
    return {
      sports: [],
      loadingSports: true,
      countdown: countdownParts(),
      timer: null,
    };
  },
  computed: {
    sessionLabel() { return formatSessionLabel(); },
  },
  async mounted() {
    this.timer = setInterval(() => { this.countdown = countdownParts(); }, 1000);
    const res = await api.get('sports_status.php');
    if (res.success) this.sports = res.sports;
    this.loadingSports = false;

    // Smooth-scroll to hash targets (e.g. /#programs) after render
    if (this.$route.hash) {
      requestAnimationFrame(() => {
        const el = document.querySelector(this.$route.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    }
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    icon(name) {
      return { Basketball: 'fa-basketball', Volleyball: 'fa-volleyball', Badminton: 'fa-table-tennis-paddle-ball' }[name] || 'fa-medal';
    },
    ctaClick() {
      if (store.user) this.$router.push('/dashboard');
      else this.$router.push('/signup');
    },
  },
  template: `
  <div>
    <!-- HERO -->
    <section class="hero">
      <div class="container">
        <span class="hero-eyebrow">"No games are too tough..."</span>
        <h1>JESUS STRENGTH<br/>IS <span class="accent">ENOUGH</span></h1>
        <p class="lead">
          Making Christ-committed followers who will make Christ-committed followers &mdash; through sports.
        </p>
        <div class="buttons">
          <a href="#" class="btn btn-primary" @click.prevent="ctaClick">Join Now</a>
          <a href="#events" class="btn btn-outline">Upcoming Events</a>
        </div>
      </div>
    </section>

    <!-- SATURDAY SCHEDULE STRIP -->
    <section class="page-section tight bg-white">
      <div class="container">
        <div class="schedule-banner">
          <div class="schedule-clock">
            {{ countdown.days }}d {{ countdown.hours }}h {{ countdown.minutes }}m
          </div>
          <div class="schedule-meta">
            <h3><i class="fa-solid fa-calendar-check" style="color:var(--red)"></i> Next Session: {{ sessionLabel }}</h3>
            <p>Every Saturday, 1:00 PM &ndash; 5:00 PM. Members can pre-check in from the dashboard so we know who to expect.</p>
          </div>
          <router-link to="/login" class="btn btn-primary">Pre-Check In</router-link>
        </div>
      </div>
    </section>

    <div class="court-divider"></div>

    <!-- ABOUT -->
    <section class="page-section" id="about">
      <div class="container about-grid">
        <img src="img/kneel.jpg" alt="Youth praying together before a game" />
        <div class="about-text">
          <span class="eyebrow">Who we are</span>
          <h2 class="section-title">About Us</h2>
          <p>Youth Sports Fellowship helps young athletes grow in their faith and love for Jesus while actively doing sports.</p>
          <p style="margin-top:14px">We believe sports can be an avenue to worship Jesus.</p>
          <span class="tagline">ALL FOR JESUS!!</span>
        </div>
      </div>
    </section>

    <div class="court-divider"></div>

    <!-- PROGRAMS -->
    <section class="page-section bg-white" id="programs">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Pick your court</span>
          <h2 class="section-title">Sports Programs</h2>
          <p class="section-sub">Every session fills up &mdash; spots below update live from pre-check-ins.</p>
        </div>
        <div class="program-grid">
          <div class="program-card" v-for="s in sports" :key="s.sport_id">
            <i class="fa-solid" :class="icon(s.sport_name)"></i>
            <h3>{{ s.sport_name }}</h3>
            <p>{{ s.tagline }}</p>
            <span class="capacity-pill" :class="{ full: s.spots_left <= 0 }">
              <span class="dot"></span>
              {{ s.spots_left <= 0 ? 'Session full' : s.spots_left + ' of ' + s.capacity + ' spots left' }}
            </span>
          </div>
          <div v-if="loadingSports" class="program-card"><p>Loading programs&hellip;</p></div>
        </div>
      </div>
    </section>

    <!-- EVENTS -->
    <section class="page-section bg-ink" id="events">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow" style="color:var(--gold)">Save the date</span>
          <h2 class="section-title">Upcoming Events</h2>
        </div>
        <div class="event-grid">
          <div class="event-card">
            <span class="tag">Camp</span>
            <h3>ENDURE: Youth Sports Camp</h3>
            <p>June 26&ndash;29, 2026</p>
            <p>Mount Makiling Recreational Center (MMRC)</p>
          </div>
          <div class="event-card">
            <span class="tag">New Series</span>
            <h3>Class Meet</h3>
            <p>New upcoming series &mdash; details soon.</p>
          </div>
          <div class="event-card">
            <span class="tag">Weekly</span>
            <h3>Volunteers Night</h3>
            <p>Join us every Wednesday at 6:00 PM.</p>
          </div>
          <!-- PLACEHOLDER: add more event cards here, or wire this section
               to a future /events.php API endpoint -->
        </div>
      </div>
    </section>

    <!-- GALLERY -->
    <section class="page-section bg-white" id="gallery">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Moments</span>
          <h2 class="section-title">Gallery</h2>
        </div>
        <div class="gallery-grid">
          <img src="img/Dgroup.jpg" alt="D-Group fellowship" loading="lazy" />
          <img src="img/shooting.jpg" alt="Basketball practice" loading="lazy" />
          <img src="img/spike.jpg" alt="Volleyball spike" loading="lazy" />
          <img src="img/focus.jpg" alt="Badminton focus" loading="lazy" />
          <!-- PLACEHOLDER: more gallery photos / a "view all" lightbox can go here -->
        </div>
      </div>
    </section>
  </div>
  `,
};
