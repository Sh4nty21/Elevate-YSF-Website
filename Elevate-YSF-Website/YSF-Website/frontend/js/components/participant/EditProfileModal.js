import { api } from "../../api.js";
import { store } from "../../store.js";

export default {

    name: "EditProfileModal",

    props: {
        profile: {
            type: Object,
            required: true
        }
    },

    emits: ["close", "saved"],

    data() {

        return {

            saving: false,

            form: {

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

    mounted() {

        this.form = {

            ...this.profile

        };

    },

    methods: {

        async saveProfile() {

            this.saving = true;

            try {

                const res = await api.post(
                    "participants/update_profile.php",
                    this.form
                );

                if (res.success) {

                    store.toast(
                        "Profile updated successfully.",
                        "success"
                    );

                    this.$emit("saved");
                    this.$emit("close");

                }

                else {

                    store.toast(
                        res.message,
                        "error"
                    );

                }

            }

            catch (err) {

                console.error(err);

                store.toast(
                    "Unable to update profile.",
                    "error"
                );

            }

            this.saving = false;

        }

    },

    template: `
    <div class="modal-scrim">

<div class="modal-box" style="max-width:750px;">

<h2>Edit Profile</h2>

<p class="sub">
Update your personal information.
</p>

<div
style="
display:grid;
grid-template-columns:1fr 1fr;
gap:20px;
">

<div>

<div class="field">

<label>Full Name</label>

<div class="input-box">

<input
v-model="form.full_name">

</div>

</div>

<div class="field">

<label>Birthdate</label>

<div class="input-box">

<input
type="date"
v-model="form.birthdate">

</div>

</div>

<div class="field">

<label>Gender</label>

<div class="input-box">

<select
v-model="form.gender">

<option value="">Select</option>
<option>Male</option>
<option>Female</option>

</select>

</div>

</div>

<div class="field">

<label>School</label>

<div class="input-box">

<input
v-model="form.school">

</div>

</div>

<div class="field">

<label>Contact Number</label>

<div class="input-box">

<input
v-model="form.contact_number">

</div>

</div>

</div>

<div>

<div class="field">

<label>City</label>

<div class="input-box">

<input
v-model="form.city">

</div>

</div>

<div class="field">

<label>Address</label>

<div class="input-box">

<textarea
v-model="form.address"
style="
width:100%;
border:none;
outline:none;
resize:vertical;
background:transparent;
font-family:inherit;
"></textarea>

</div>

</div>

<div class="field">

<label>Emergency Contact</label>

<div class="input-box">

<input
v-model="form.emergency_contact_name">

</div>

</div>

<div class="field">

<label>Relationship</label>

<div class="input-box">

<input
v-model="form.emergency_contact_relationship">

</div>

</div>

<div class="field">

<label>Emergency Number</label>

<div class="input-box">

<input
v-model="form.emergency_contact_number">

</div>

</div>

</div>

</div>

<div
class="modal-actions">

<button
class="btn btn-outline"
@click="$emit('close')">

Cancel

</button>

<button
class="btn btn-primary"
@click="saveProfile"
:disabled="saving">

{{ saving ? 'Saving...' : 'Save Changes' }}

</button>

</div>

</div>

</div>
`
};