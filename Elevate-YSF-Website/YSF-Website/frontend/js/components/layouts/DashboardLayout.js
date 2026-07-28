import Sidebar from './Sidebar.js';
import TopBar from './TopBar.js';

export default {
  name: 'DashboardLayout',

  components: {
    Sidebar,
    TopBar,
  },

  props: {
    title: {
      type: String,
      default: 'Dashboard'
    }
  },

  template: `
    <div class="dashboard">

      <Sidebar />

      <div class="dashboard-main">

        <TopBar :title="title" />

        <div class="dashboard-content">
          <slot></slot>
        </div>

      </div>

    </div>
  `
};