import { api } from "../../api.js";
import { store } from "../../store.js";
import EditProfileModal from "./EditProfileModal.js";

export default {
    name: "Profile",

    components: {
    EditProfileModal
    },

    data() {
        return {
            loading: true,

            showEdit: false,

            activeTab: "personal",

            profile: {
                full_name: "",
                birthdate: "",
                gender: "",
                school: "",
                contact_number: "",
                city: "",
                address: "",

                emergency_contact_name: "",
                emergency_contact_relationship: "",
                emergency_contact_number: ""
            }
        };
    },

    async mounted() {
        await this.loadProfile();
    },

    methods: {

        async loadProfile() {

            this.loading = true;

            try {

                console.log("1. Before API call");

                const res = await api.get("participants/get_profile.php");

                console.log("2. API Response:", res);

                

                if (res.success) {

                    console.log("3. Profile Object:", res.message.profile);

                    this.profile = res.message.profile;

                    console.log("4. Profile assigned successfully");

                } else {

                    console.error("API returned success = false", res);

                    store.toast(res.message, "error");

                }

            } catch (err) {

                console.error("loadProfile() failed:", err);

                alert(err.message);

            }

            this.loading = false;

        }

    },

  template: `
<div class="dash-body">

<div class="container">

    <div v-if="loading" class="card">
        <p>Loading profile...</p>
    </div>

    <div v-else>

        <!-- PAGE HEADER -->
        <div class="page-header" style="margin-bottom:25px;">
            <div>
                <h1>My Profile</h1>
                <p>Manage your Elevate YSF participant information.</p>
            </div>

            <button class="btn btn-primary" @click="showEdit = true">
                <i class="fa-solid fa-pen"></i>
                Edit Profile
            </button>
        </div>

        <div class="dash-grid">

            <!-- PROFILE SUMMARY -->
            <div class="card dashboard-card">

                <div style="text-align:center">

                    <img
                        :src="'img/default-profile.svg'"
                        style="width:120px;height:120px;border-radius:50%;margin:auto;border:4px solid var(--red);object-fit:cover;"
                    >

                    <h2 style="margin-top:15px">
                        {{ profile.full_name }}
                    </h2>

                    <p class="muted">
                        Elevate YSF Participant
                    </p>

                </div>

                <hr style="margin:25px 0">

                <div class="info-list">

                    <li>
                        <span>Status</span>
                        <strong>Active</strong>
                    </li>

                    <li>
                        <span>School</span>
                        <strong>{{ profile.school || 'Not Set' }}</strong>
                    </li>

                    <li>
                        <span>City</span>
                        <strong>{{ profile.city || 'Not Set' }}</strong>
                    </li>

                </div>

            </div>

            <!-- PERSONAL INFORMATION -->
            <div class="card dashboard-card span-2">

                <div class="card-heading">
                    <i class="fa-solid fa-user"></i>
                    <h2>Personal Information</h2>
                </div>

                <ul class="info-list">

                    <li>
                        <span>Full Name</span>
                        <strong>{{ profile.full_name }}</strong>
                    </li>

                    <li>
                        <span>Birthdate</span>
                        <strong>{{ profile.birthdate || 'Not Set' }}</strong>
                    </li>

                    <li>
                        <span>Gender</span>
                        <strong>{{ profile.gender || 'Not Set' }}</strong>
                    </li>

                    <li>
                        <span>School</span>
                        <strong>{{ profile.school || 'Not Set' }}</strong>
                    </li>

                    <li>
                        <span>Contact Number</span>
                        <strong>{{ profile.contact_number || 'Not Set' }}</strong>
                    </li>

                    <li>
                        <span>City</span>
                        <strong>{{ profile.city || 'Not Set' }}</strong>
                    </li>

                    <li>
                        <span>Address</span>
                        <strong>{{ profile.address || 'Not Set' }}</strong>
                    </li>

                </ul>

            </div>

            <!-- EMERGENCY CONTACT -->
            <div class="card dashboard-card span-2">

                <div class="card-heading">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <h2>Emergency Contact</h2>
                </div>

                <ul class="info-list">

                    <li>
                        <span>Name</span>
                        <strong>{{ profile.emergency_contact_name || 'Not Set' }}</strong>
                    </li>

                    <li>
                        <span>Relationship</span>
                        <strong>{{ profile.emergency_contact_relationship || 'Not Set' }}</strong>
                    </li>

                    <li>
                        <span>Contact Number</span>
                        <strong>{{ profile.emergency_contact_number || 'Not Set' }}</strong>
                    </li>

                </ul>

            </div>

            <!-- MEMBERSHIP -->
            <div class="card dashboard-card">

                <div class="card-heading">
                    <i class="fa-solid fa-id-card"></i>
                    <h2>Membership</h2>
                </div>

                <ul class="info-list">

                    <li>
                        <span>Membership</span>
                        <strong>Active</strong>
                    </li>

                    <li>
                        <span>Role</span>
                        <strong>Participant</strong>
                    </li>

                    <li>
                        <span>Joined</span>
                        <strong>2026</strong>
                    </li>

                </ul>

            </div>

            <!-- SPORTS -->
            <div class="card dashboard-card">

                <div class="card-heading">
                    <i class="fa-solid fa-trophy"></i>
                    <h2>Sports Joined</h2>
                </div>

                <div class="sports-badges">

                    <span class="sport-badge">
                        <i class="fa-solid fa-basketball"></i>
                        Basketball
                    </span>

                </div>

            </div>

        </div>

    </div>

</div>

<EditProfileModal
    v-if="showEdit"
    :profile="profile"
    @close="showEdit = false"
    @saved="loadProfile"
/>

</div>
`
};