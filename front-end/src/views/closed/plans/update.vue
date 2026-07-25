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
          <div>
            <h2 class="text-base font-black text-gray-800 tracking-tight">Edit Plan</h2>
            <p class="text-xs text-gray-400 mt-0.5">Modifying: {{ form.name }}</p>
          </div>
          <button
            @click="$emit('close')"
            class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold"
          >
            &times;
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <form id="editPlanForm" @submit.prevent="submitForm" class="space-y-4">

            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Plan Name <span class="text-red-400">*</span></label>
              <input
                v-model="form.name"
                type="text"
                required
                class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
              />
            </div>

            <!-- Resource Limits -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Resource Limits</p>
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Max Locations</label>
                  <input v-model="form.max_locations" type="number" required class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
                </div>
                <div>
                  <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Max Staff</label>
                  <input v-model="form.max_staff" type="number" required class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
                </div>
                <div>
                  <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Max Users</label>
                  <input v-model="form.max_users" type="number" required class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price <span class="text-red-400">*</span></label>
                <input v-model="form.price" type="number" step="0.01" required class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Billing Cycle <span class="text-red-400">*</span></label>
                <select v-model="form.billing_cycle" required class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

          </form>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
            Discard
          </button>
          <button form="editPlanForm" type="submit" class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition">
            <i class="fas fa-save text-xs"></i> Update Plan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";

export default {
  name: "UpdatePlan",
  components: { Toast },
  props: { visible: Boolean, plan: Object },
  data() {
    return {
      form: {
        id: null, name: "", max_locations: "", max_staff: "",
        max_users: "", max_kds: "27", kds_enabled: false,
        price: null, billing_cycle: "", updated_at: new Date().toISOString(),
      },
    };
  },
  watch: {
    plan: {
      immediate: true,
      handler(val) {
        if (val) {
          this.form = {
            ...val,
            created_at: val.created_at ? val.created_at.split("T")[0] : "",
            updated_at: val.updated_at ? val.updated_at.split("T")[0] : "",
          };
        }
      },
    },
  },
  methods: {
    async submitForm() {
      try {
        await this.$apiPut("/update_plan", this.form.id, this.form);
        this.$root.$refs.toast.showToast("Plan updated successfully", "success");
        setTimeout(() => { this.$emit("close"); }, 3000);
        this.$emit("refresh");
      } catch (err) {
        console.error("Update failed:", err);
        this.$root.$refs.toast.showToast(err.message, "error");
      }
    },
  },
};
</script>
