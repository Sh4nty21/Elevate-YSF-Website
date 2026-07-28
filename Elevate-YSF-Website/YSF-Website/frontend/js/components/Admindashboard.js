import { api } from '../api.js';
import { store } from '../store.js';

export default {
    name: 'AdminDashboard',

    data() {
        return {
            loading: true,

            profile: null,

            stats: {
                participants: 0,
                sports: 0,
                sportsAdmins: 0,
                dgroups: 0
            },

            sportsOverview: [],
            attendanceToday: [],
            sportsAdmins: [],
            sportsManagement: []
         
        };
    },

    async mounted() {
        await this.load();
    },

    methods: {

        async load() {

            try {

                // Get logged-in user's profile
                const dashRes = await api.get('dashboard_data.php');

                if (dashRes.success) {
                    this.profile = dashRes.profile;
                }

            } catch (e) {
                console.error(e);
            }

            // Placeholder data while building
            this.stats = {
                participants: 245,
                sports: 3,
                sportsAdmins: 3,
                dgroups: 12
            };

            this.sportsOverview = [
                {
                    sport: "Basketball",
                    participants: 120,
                    admin: "John Cruz"
                },
                {
                    sport: "Volleyball",
                    participants: 78,
                    admin: "Mary Santos"
                },
                {
                    sport: "Badminton",
                    participants: 47,
                    admin: "Peter Reyes"
                }
            ];

            this.attendanceToday = [
                {
                    sport: "Basketball",
                    present: 32,
                    total: 40
                },
                {
                    sport: "Volleyball",
                    present: 20,
                    total: 25
                },
                {
                    sport: "Badminton",
                    present: 14,
                    total: 18
                }
            ];

            this.sportsAdmins = [
                {
                    name: "John Cruz",
                    sport: "Basketball",
                    members: 120
                },
                {
                    name: "Mary Santos",
                    sport: "Volleyball",
                    members: 78
                },
                {
                    name: "Peter Reyes",
                    sport: "Badminton",
                    members: 47
                }
            ];

            this.sportsManagement = [
                {
                 id: 1,
                    sport: "Basketball",
                    admin: "John Cruz",
                    participants: 120,
                    status: "Active"
                },
                {
                    id: 2,
                    sport: "Volleyball",
                    admin: "Mary Santos",
                    participants: 78,
                    status: "Active"
                },
                {
                    id: 3,
                    sport: "Badminton",
                    admin: "Peter Reyes",
                    participants: 47,
                    status: "Active"
                }
            ];

            this.loading = false;
        },

        viewSport(sport) {
            alert("Opening " + sport.sport + " management...");
        }

    },

  template: `
<div class="dash-body">

    <div class="container" v-if="loading">
        <p class="empty-state">Loading dashboard...</p>
    </div>

    <div class="container" v-else>

        <!-- WELCOME -->
        <div class="card welcome-card">

            <div class="welcome-copy">

                <span class="status-pill">
                    Core Administrator
                </span>

                <h1>
                    Welcome back, {{ profile ? profile.full_name.split(' ')[0] : 'Admin' }}!
                </h1>

                <p>
                    Manage members, sports, attendance,
                    and ministry activities from one place.
                </p>

            </div>

        </div>

        <!-- STATISTICS -->
        <div class="dash-grid">

            <div class="card dashboard-card stat-card">
                <i class="fa-solid fa-users stat-icon"></i>
                <h2>{{ stats.participants }}</h2>
                <p>Total Participants</p>
            </div>

            <div class="card dashboard-card stat-card">
                <i class="fa-solid fa-basketball stat-icon"></i>
                <h2>{{ stats.sports }}</h2>
                <p>Sports</p>
            </div>

            <div class="card dashboard-card stat-card">
                <i class="fa-solid fa-user-tie stat-icon"></i>
                <h2>{{ stats.sportsAdmins }}</h2>
                <p>Sports Admins</p>
            </div>

            <div class="card dashboard-card stat-card">
                <i class="fa-solid fa-people-group stat-icon"></i>
                <h2>{{ stats.dgroups }}</h2>
                <p>D-Groups</p>
            </div>

        </div>

        <!-- FIRST DASHBOARD ROW -->
        <div class="dashboard-row">

            <!-- SPORTS OVERVIEW -->
            <div class="card dashboard-card half-card">

                <div class="card-heading">
                    <i class="fa-solid fa-trophy"></i>
                    <h2>Sports Overview</h2>
                </div>

                <table class="overview-table">

                    <thead>
                        <tr>
                            <th>Sport</th>
                            <th>Participants</th>
                            <th>Sports Admin</th>
                        </tr>
                    </thead>

                    <tbody>

                        <tr
                            v-for="sport in sportsOverview"
                            :key="sport.sport"
                        >

                            <td>
                                <i class="fa-solid fa-medal"></i>
                                {{ sport.sport }}
                            </td>

                            <td>
                                <span class="table-badge">
                                    {{ sport.participants }}
                                </span>
                            </td>

                            <td>
                                {{ sport.admin }}
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

            <!-- TODAY'S ATTENDANCE -->
            <div class="card dashboard-card half-card">

                <div class="card-heading">
                    <i class="fa-solid fa-calendar-check"></i>
                    <h2>Today's Attendance</h2>
                </div>

                <div
                    class="attendance-item"
                    v-for="item in attendanceToday"
                    :key="item.sport"
                >

                    <div class="attendance-header">

                        <strong>
                            {{ item.sport }}
                        </strong>

                        <span>
                            {{ item.present }} / {{ item.total }}
                        </span>

                    </div>

                    <div class="attendance-bar">

                        <div
                            class="attendance-fill"
                            :style="{ width: ((item.present / item.total) * 100) + '%' }"
                        ></div>

                    </div>

                </div>

            </div>

        </div>

        <!-- SECOND DASHBOARD ROW -->
        <div class="dashboard-row">

            <!-- SPORTS MANAGEMENT -->
            <div class="card dashboard-card half-card">

                <div class="card-heading">
                    <i class="fa-solid fa-futbol"></i>
                    <h2>Sports Management</h2>
                </div>

                <div
                    class="sport-management-card"
                    v-for="sport in sportsManagement"
                    :key="sport.id"
                >

                    <div class="sport-header">

                        <h3>{{ sport.sport }}</h3>

                        <span class="status-active">
                            {{ sport.status }}
                        </span>

                    </div>

                    <p>
                        <i class="fa-solid fa-user"></i>
                        {{ sport.admin }}
                    </p>

                    <p>
                        <i class="fa-solid fa-users"></i>
                        {{ sport.participants }} Participants
                    </p>

                    <button
                        class="view-details-btn"
                        @click="viewSport(sport)"
                    >
                        View Details
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>

                </div>

            </div>

            <!-- QUICK ACTIONS -->
            <div class="card dashboard-card half-card">

                <div class="card-heading">
                    <i class="fa-solid fa-bolt"></i>
                    <h2>Quick Actions</h2>
                </div>

                <div class="quick-actions-grid">

                   <div
                     class="quick-action-card"
                     @click="$router.push('/participants')"
                    >
                         <i class="fa-solid fa-user-plus"></i>
                         <span>Participants</span>
                    </div>

                    <div class="quick-action-card">
                        <i class="fa-solid fa-basketball"></i>
                        <span>Sports</span>
                    </div>

                    <div class="quick-action-card">
                        <i class="fa-solid fa-user-tie"></i>
                        <span>Sports Admins</span>
                    </div>

                    <div class="quick-action-card">
                        <i class="fa-solid fa-people-group"></i>
                        <span>D-Groups</span>
                    </div>

                    <div class="quick-action-card">
                        <i class="fa-solid fa-calendar-check"></i>
                        <span>Attendance</span>
                    </div>

                    <div class="quick-action-card">
                        <i class="fa-solid fa-chart-column"></i>
                        <span>Reports</span>
                    </div>

                </div>

            </div>

        </div>

         <!-- RECENT ACTIVITY -->
        <div class="dashboard-row">

            <div class="card dashboard-card full-card">

                <div class="card-heading">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                    <h2>Recent Activity</h2>
                </div>

                <div class="activity-list">

                    <div class="activity-item">

                        <div class="activity-icon success">
                            <i class="fa-solid fa-user-plus"></i>
                        </div>

                        <div class="activity-content">
                            <strong>Sean Marcus joined Basketball</strong>
                            <p>10 minutes ago</p>
                        </div>

                    </div>

                    <div class="activity-item">

                        <div class="activity-icon primary">
                            <i class="fa-solid fa-calendar-check"></i>
                        </div>

                        <div class="activity-content">
                            <strong>Basketball attendance updated</strong>
                            <p>35 minutes ago</p>
                        </div>

                    </div>

                    <div class="activity-item">

                        <div class="activity-icon warning">
                            <i class="fa-solid fa-user-tie"></i>
                        </div>

                        <div class="activity-content">
                            <strong>John Cruz assigned as Sports Admin</strong>
                            <p>1 hour ago</p>
                        </div>

                    </div>

                    <div class="activity-item">

                        <div class="activity-icon info">
                            <i class="fa-solid fa-people-group"></i>
                        </div>

                        <div class="activity-content">
                            <strong>D-Group Alpha was created</strong>
                            <p>Today</p>
                        </div>

                    </div>

                    <div class="activity-item">

                        <div class="activity-icon success">
                            <i class="fa-solid fa-chart-line"></i>
                        </div>

                        <div class="activity-content">
                            <strong>Monthly attendance report generated</strong>
                            <p>Today</p>
                        </div>

                    </div>

                </div>

            </div>

        </div>

    </div>

</div>
`
};