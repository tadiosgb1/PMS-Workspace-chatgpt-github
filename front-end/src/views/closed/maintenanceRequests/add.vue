<template>
  <div>
    <Toast ref="toast" />
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div class="bg-white w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">

        <!-- Header -->
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 class="text-base font-black text-gray-800 tracking-tight">Add Maintenance Request</h2>
          <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold">&times;</button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <form id="maintenanceForm" @submit.prevent="submitForm" class="space-y-4">

            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description <span class="text-red-400">*</span></label>
              <textarea v-model="form.description" rows="4" required placeholder="Describe the issue..." class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition resize-none"></textarea>
            </div>

            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</label>
              <select v-model="form.status" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <!-- Property Search -->
            <div class="relative">
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Property <span class="text-red-400">*</span></label>
              <input v-model="propertySearch" type="text" required placeholder="Search property..." class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" @input="searchProperties" @focus="propertyDropdown = true" @blur="hideDropdown('property')" />
              <ul v-if="properties.length > 0 && propertyDropdown" class="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                <li v-for="property in properties" :key="property.id" @mousedown.prevent="selectProperty(property)" class="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-0">{{ property.name }}</li>
              </ul>
            </div>

            <!-- User Search -->
            <div class="relative">
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Requester <span class="text-red-400">*</span></label>
              <input v-model="userSearch" type="text" required autocomplete="off" placeholder="Search tenant..." class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" @input="searchUsers" @focus="userDropdown = true" @blur="hideDropdown('user')" />
              <ul v-if="users.length > 0 && userDropdown" class="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                <li v-for="user in users" :key="user.id" @mousedown.prevent="selectUser(user)" class="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-0">
                  {{ user.first_name }} {{ user.middle_name }} {{ user.last_name }}
                </li>
              </ul>
            </div>

          </form>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button form="maintenanceForm" type="submit" class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition">
            <i class="fas fa-save text-xs"></i> Save Request
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";

export default {
  name: "MaintenanceRequestAdd",
  components: { Toast },
  props: { visible: Boolean },
  data() {
    return {
      form: { status: "pending", description: "", requested_at: new Date().toISOString().split("T")[0], user_id: "", property_id: "" },
      properties: [], users: [],
      propertySearch: "", userSearch: "",
      propertyDropdown: false, userDropdown: false,
      ordering: "-id",
    };
  },
  mounted() { this.fetchProperties(); this.fetchUsers(); },
  methods: {
    async fetchProperties(url = null) {
      try {
        const result = await this.$getProperties({
          page: 1,
          page_size: 1000,
          search: this.propertySearch,
          ordering: this.ordering,
        });
        this.properties = result.properties;
      } catch (err) { console.error(err); }
    },
    async fetchUsers(url = null) {
      try {
        const pageUrl = url || `/get_rents?search=${this.userSearch}`;
        const response = await this.$getTenants.call(this, pageUrl);
        this.users = response.tenants || response.data || [];
      } catch (err) { console.error(err); }
    },
    searchProperties() { this.fetchProperties(); },
    searchUsers() { this.fetchUsers(); },
    selectProperty(property) { this.form.property_id = property.id; this.propertySearch = property.name; this.propertyDropdown = false; },
    selectUser(user) { this.form.user_id = user.id; this.userSearch = `${user.first_name} ${user.middle_name} ${user.last_name}`; this.userDropdown = false; },
    hideDropdown(type) { setTimeout(() => { if (type === "property") this.propertyDropdown = false; if (type === "user") this.userDropdown = false; }, 200); },
    async submitForm() {
      try {
        this.form.requested_at = new Date().toISOString().split("T")[0];
        const res = await this.$apiPost("/post_maintenance_request", this.form);
        if (res?.data?.error) {
          this.$root.$refs.toast.showToast(res.data.error, "error");
        } else {
          this.$root.$refs.toast.showToast("Maintenance request saved successfully", "success");
        }
        this.form = { status: "pending", description: "", requested_at: new Date().toISOString().split("T")[0], user_id: "", property_id: "" };
        this.propertySearch = ""; this.userSearch = "";
        setTimeout(() => this.$emit("close"), 2000);
      } catch (error) { console.error(error); }
    },
  },
};
</script>
