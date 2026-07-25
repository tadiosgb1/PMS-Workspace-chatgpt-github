<template>
  <div>
    <Toast ref="toast" />
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div class="bg-white w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">

        <!-- Header -->
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 class="text-base font-black text-gray-800 tracking-tight">Add Subscription</h2>
          <button
            @click="$emit('close')"
            class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold"
          >
            &times;
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <form id="addSubForm" @submit.prevent="submitForm" class="space-y-4">

            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</label>
              <multiselect
                v-model="selectedUser"
                :options="users"
                :searchable="true"
                :close-on-select="true"
                :clear-on-select="true"
                placeholder="Search or select a user"
                label="fullName"
                track-by="id"
                :multiple="false"
              />
            </div>

            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Plan Name</label>
              <input v-model="form.plan_name" type="text" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Billing Cycle</label>
                <select v-model="form.billing_cycle" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
                  <option value="" disabled>Select cycle</option>
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</label>
                <input v-model="form.price" type="number" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Date</label>
                <input v-model="form.start_date" type="date" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">End Date</label>
                <input v-model="form.end_date" type="date" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
            </div>

            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</label>
              <select v-model="form.status" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
                <option value="" disabled>Select status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>

          </form>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button form="addSubForm" type="submit" class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition">
            <i class="fas fa-check text-xs"></i> Add Subscription
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";

export default {
  name: "AddSubscription",
  components: { Toast, Multiselect },
  props: { visible: Boolean },
  data() {
    return {
      users: [],
      selectedUser: null,
      form: { user_id: "", plan_name: "", billing_cycle: "", price: "", start_date: "", end_date: "", status: "" },
    };
  },
  watch: {
    selectedUser(newVal) { this.form.user_id = newVal ? newVal.id : ""; },
  },
  mounted() { this.fetchUsers(); },
  methods: {
    async fetchUsers() {
      try {
        const response = await this.$apiGet("/get_users");
        this.users = response.data.map((u) => ({ id: u.id, fullName: `${u.first_name} ${u.middle_name} ${u.last_name}` }));
      } catch (error) { console.error("Failed to fetch users:", error); }
    },
    async submitForm() {
      try {
        await this.$apiPost("/post_subscription", this.form);
        this.$root.$refs.toast.showToast("Subscription added successfully", "success");
        setTimeout(() => { this.$emit("close"); this.$emit("refresh"); }, 3000);
      } catch (error) {
        console.error("Failed to add subscription:", error);
        this.$root.$refs.toast.showToast(error.message, "error");
      }
    },
  },
};
</script>
