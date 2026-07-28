export default {

    data() {
        return {
            participants: []
        };
    },

    mounted() {
        this.loadParticipants();
    },

    methods: {

        async loadParticipants() {

            try {

                const response = await fetch(
                    "../backend/participants/get_participants.php",
                    {
                        credentials: "include"
                    }
                );

                const result = await response.json();

                if (result.success) {
                    this.participants = result.participants;
                }

            } catch (error) {
                console.error(error);
            }

        }

    },


template: `

<div class="dash-body">

    <div class="container">

        <!-- PAGE HEADER -->
        <div class="page-header">

            <div>
                <h1>Participants</h1>
                <p>Manage all registered participants.</p>
            </div>

            <button class="primary-btn">
                <i class="fa-solid fa-user-plus"></i>
                Add Participant
            </button>

        </div>

        <!-- FILTERS -->
        <div class="card dashboard-card filter-card">

            <div class="filter-row">

                <input
                    type="text"
                    class="search-input"
                    placeholder="Search participant..."
                >

                <select class="filter-select">
                    <option>All Sports</option>
                </select>

                <select class="filter-select">
                    <option>All D-Groups</option>
                </select>

                <select class="filter-select">
                    <option>All Status</option>
                </select>

            </div>

        </div>

        <!-- PARTICIPANTS TABLE -->

        <div class="card dashboard-card">

            <table class="participants-table">

                <thead>

                    <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Sport</th>
                        <th>D-Group</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>

                </thead>

                <tbody>

                    <tr
                        v-for="participant in participants"
                        :key="participant.user_id"
                    >

                        <td>
                            {{ participant.full_name }}
                        </td>

                        <td>
                            {{ participant.email }}
                        </td>

                        <td>
                            {{ participant.sport_name || 'Not Assigned' }}
                        </td>

                        <td>
                            {{ participant.group_name || 'No D-Group' }}
                        </td>

                        <td>

                            <span
                                :class="participant.membership_status === 'Active'
                                    ? 'status-active'
                                    : 'status-inactive'"
                            >

                                {{ participant.membership_status }}

                            </span>

                        </td>

                        <td>

                            <button class="table-btn view-btn">
                                <i class="fa-solid fa-eye"></i>
                            </button>

                            <button class="table-btn edit-btn">
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button class="table-btn delete-btn">
                                <i class="fa-solid fa-trash"></i>
                            </button>

                        </td>

                    </tr>

                    <tr v-if="participants.length === 0">

                        <td colspan="6" class="empty-state">
                            No participants found.
                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    </div>

</div>

`

};