import { api } from '../api.js';
import { store } from '../store.js';
import { formatSessionLabel } from '../schedule.js';

export default {
  name: 'PreCheckinModal',
  props: {
    sports: { type: Array, default: () => [] },
    alreadyCheckedIn: { type: Array, default: () => [] },
  },
  emits: ['close', 'checked-in'],
  data() {
    return { selectedSportId: null, submitting: false };
  },
  computed: {
    sessionLabel() { return formatSessionLabel(); },
  },
  methods: {
    icon(name) {
      return { Basketball: 'fa-basketball', Volleyball: 'fa-volleyball', Badminton: 'fa-table-tennis-paddle-ball' }[name] || 'fa-medal';
    },
    isFull(s) { return s.spots_left <= 0; },
    isChecked(s) { return this.alreadyCheckedIn.includes(s.sport_id); },
    select(s) {
      if (this.isFull(s) || this.isChecked(s)) return;
      this.selectedSportId = s.sport_id;
    },
    async confirm() {
      if (!this.selectedSportId) {
        store.toast('Please choose a sport first.', 'warn');
        return;
      }
      this.submitting = true;
      const res = await api.post('pre_checkin.php', { sport_id: this.selectedSportId });
      this.submitting = false;

      if (res.success) {
        store.toast(res.message || 'You\'re checked in for Saturday!', 'success');
        this.$emit('checked-in', res);
        this.$emit('close');
      } else {
        // This is the "sport is full" alert path required by the ministry:
        // the backend re-checks capacity at insert time, so even if this
        // list looked open a moment ago, the user still gets a clear alert.
        store.toast(res.message || 'That sport is full for this Saturday.', 'error', 6000);
      }
    },
  },
  template: `
  <div class="modal-scrim" @click.self="$emit('close')">
    <div class="modal-box" role="dialog" aria-modal="true" aria-label="Pre-check in">
      <h2>Pre-Check In</h2>
      <p class="sub">{{ sessionLabel }} &middot; 1:00 PM &ndash; 5:00 PM</p>

      <div v-for="s in sports" :key="s.sport_id"
           class="sport-option"
           :class="{ selected: selectedSportId === s.sport_id, disabled: isFull(s) || isChecked(s) }"
           @click="select(s)">
        <span class="name"><i class="fa-solid" :class="icon(s.sport_name)" style="color:var(--red)"></i> {{ s.sport_name }}</span>
        <span class="slots" v-if="isChecked(s)">Already checked in</span>
        <span class="slots" v-else-if="isFull(s)">Full (0 left)</span>
        <span class="slots" v-else>{{ s.spots_left }} / {{ s.capacity }} left</span>
      </div>

      <div class="modal-actions">
        <button class="btn btn-outline" style="color:var(--ink);border-color:var(--court-line)" @click="$emit('close')">Cancel</button>
        <button class="btn btn-primary" :disabled="submitting || !selectedSportId" @click="confirm">
          <span v-if="submitting"><i class="fa-solid fa-spinner fa-spin"></i> Checking in&hellip;</span>
          <span v-else>Confirm Check-In</span>
        </button>
      </div>
    </div>
  </div>
  `,
};
