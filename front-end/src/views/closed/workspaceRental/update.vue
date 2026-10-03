<template>
  <div class="pms-brand-page">
    <Toast ref="toast" />
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white w-full max-w-xl md:max-w-3xl lg:max-w-5xl rounded-xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden">

        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 class="text-base font-bold text-gray-800 tracking-tight">Edit Workspace Rental</h2>
          <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold leading-none">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="editRentalForm" @submit.prevent="submitForm" class="space-y-6">

            <section class="space-y-3">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Guest Details</p>
              
              <div class="space-y-2">
                <label class="form-label">Guest Name <span class="text-red-500">*</span></label>
                <input v-model="form.guest_name" type="text" class="form-input" required />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="form-label">Email <span class="text-red-500">*</span></label>
                  <input v-model="form.guest_email" type="email" class="form-input" required />
                </div>
                <div class="space-y-2">
                  <label class="form-label">Phone <span class="text-red-500">*</span></label>
                  <input v-model="form.guest_phone" type="text" class="form-input" required />
                </div>
              </div>
            </section>

            <section class="space-y-3">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Rental Settings</p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="form-label">Billing Cycle <span class="text-red-500">*</span></label>
                  <select v-model="form.cycle" class="form-input appearance-none" required>
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="form-label">Start Date <span class="text-red-500">*</span></label>
                  <input v-model="form.start_date" type="date" class="form-input" required />
                </div>
              </div>

              <div class="space-y-2">
                <label class="form-label">Workspace Assignment <span class="text-red-500">*</span></label>
                <select v-model="form.space" class="form-input appearance-none" required>
                  <option v-for="space in spaces" :key="space.id" :value="space.id">
                    {{ space.name }}
                  </option>
                </select>
              </div>

              <div class="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p class="text-sm font-semibold text-gray-700">Contract Active Status</p>
                  <p class="text-xs text-gray-500">Toggle to enable/disable rental access</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="form.is_active" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                </label>
              </div>
            </section>

          </form>
        </div>

        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button form="editRentalForm" type="submit" class="btn-primary flex items-center gap-2">
            <i class="fas fa-save text-xs"></i> Update Rental
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";

export default {
  name: "WorkspaceRentalUpdate",
  components: { Toast },
  props: {
    visible: Boolean,
    rental: Object,
  },
  data() {
    return {
      form: {
        id: null,
        guest_name: "",
        guest_email: "",
        guest_phone: "",
        cycle: "daily",
        start_date: "",
        is_active: true,
        user: 0,
        space: 0,
      },
      spaces: [], // fetch from API
    };
  },
  watch: {
    rental: {
      immediate: true,
      handler(val) {
        if (val) {
          this.form = {
            id: val.id,
            guest_name: val.guest_name || "",
            guest_email: val.guest_email || "",
            guest_phone: val.guest_phone || "",
            cycle: val.cycle || "daily",
            start_date: val.start_date || "",
            is_active: val.is_active ?? true,
            user: val.user?.id || 0,   // use ID only
            space: val.space?.id || 0, // use ID only
          };
        }
      },
    },
  },
  mounted() {
    this.fetchSpaces();
  },
  methods: {
    async fetchSpaces() {
      try {
        const res = await this.$apiGet("/get_coworking_spaces");
        this.spaces = res.data || [];
      } catch (err) {
        console.error("Failed to fetch spaces:", err);
      }
    },
    async submitForm() {
      try {
        console.log("Updating rental:", this.form);

        // send PUT with correct body
        await this.$apiPut(`/update_workspace_rental`, this.form.id,this.form);

        this.$root.$refs.toast.showToast(
          "Workspace rental updated successfully",
          "success"
        );
        this.$emit("refresh");
        setTimeout(() => this.$emit("close"), 2000);
      } catch (err) {
        console.error("Update failed:", err);
        this.$root.$refs.toast.showToast("Failed to update rental", "error");
      }
    },
  },
};
</script>

<style scoped>
/* Unified professional CSS utility declarations featuring prominent visibility values */
.form-label { @apply block text-xs font-bold text-gray-800 mb-1; }
.form-input  { @apply w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 bg-white transition-all; }
.btn-cancel  { @apply px-4 py-2 text-sm text-gray-700 font-semibold border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors; }
.btn-primary { @apply px-5 py-2 text-sm font-bold text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors; }
</style>
