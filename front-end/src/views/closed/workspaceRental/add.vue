<template>
  <div class="pms-brand-page">
    <Toast ref="toast" />
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white w-full max-w-xl md:max-w-3xl lg:max-w-5xl rounded-xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden">

        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 class="text-base font-bold text-gray-800 tracking-tight">Add Workspace Rental</h2>
          <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold leading-none">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="rentalForm" @submit.prevent="submitForm" class="space-y-6">

            <section class="space-y-3">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Guest Information</p>
              
              <div class="space-y-2">
                <label class="form-label">Full Name <span class="text-red-500">*</span></label>
                <input v-model="form.guest_name" type="text" placeholder="e.g. Abebe Bikila" class="form-input" required />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="form-label">Email Address <span class="text-red-500">*</span></label>
                  <input v-model="form.guest_email" type="email" placeholder="guest@mail.com" class="form-input" required />
                </div>
                <div class="space-y-2">
                  <label class="form-label">Phone Number <span class="text-red-500">*</span></label>
                  <input v-model="form.guest_phone" type="tel" placeholder="0911..." class="form-input" required />
                </div>
              </div>
            </section>

            <section class="space-y-3">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Contract Details</p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="form-label">Billing Cycle <span class="text-red-500">*</span></label>
                  <select v-model="form.cycle" class="form-input appearance-none" required>
                    <option disabled value="">Select Cycle</option>
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

                <div class="space-y-2">
                  <label class="form-label">Next Due Date <span class="text-red-500">*</span></label>
                  <input v-model="form.next_due_date" type="date" class="form-input" required />
                </div>
              </div>

              <div class="space-y-2 relative">
                <label class="form-label">Assigned Workspace <span class="text-red-500">*</span></label>
                <input
                  v-model="spaceSearch"
                  type="text"
                  placeholder="Search space..."
                  class="form-input"
                  @input="searchSpaces"
                  @focus="spaceDropdown = true"
                  @blur="hideDropdown"
                  required
                />
                
                <ul v-if="spaces.length > 0 && spaceDropdown" class="absolute z-50 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl mt-1">
                  <li v-for="space in spaces" :key="space.id" class="px-4 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700 cursor-pointer border-b border-gray-100 last:border-0" @mousedown.prevent="selectSpace(space)">
                    {{ space.name }}
                  </li>
                </ul>
              </div>
            </section>

          </form>
        </div>

        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button form="rentalForm" type="submit" :disabled="isSaving" class="btn-primary disabled:opacity-50 flex items-center gap-2">
            <i v-if="isSaving" class="fas fa-spinner fa-spin text-xs"></i>
            <i v-else class="fas fa-save text-xs"></i>
            {{ isSaving ? "Saving..." : "Save Rental" }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Unified professional CSS utility declarations featuring prominent visibility values */
.form-label { @apply block text-xs font-bold text-gray-800 mb-1; }
.form-input  { @apply w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 bg-white transition-all; }
.btn-cancel  { @apply px-4 py-2 text-sm text-gray-700 font-semibold border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors; }
.btn-primary { @apply px-5 py-2 text-sm font-bold text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors; }
</style>

<script>
export default {
  name: "AddRental",
  props: {
    visible: Boolean,
    preSelectedSpace: Object, // Space object to pre-populate
  },
  data() {
    return {
      isSaving: false,
      form: {
        guest_name: "",
        guest_email: "",
        guest_phone: "",
        cycle: "",
        start_date: "",
        next_due_date:"",
        is_active: true,
        user: localStorage.getItem("userId") || 0,
        space: "",
        status:"pending"
      },
      spaces: [],
      spaceSearch: "",
      spaceDropdown: false,
    };
  },
  watch: {
    preSelectedSpace: {
      immediate: true,
      handler(newSpace) {
        if (newSpace) {
          this.form.space = newSpace.id;
          this.spaceSearch = newSpace.name;
        }
      }
    }
  },
  async mounted() {
    this.fetchSpaces();
  },
  methods: {
    async fetchSpaces() {
      try {
        const response = await this.$getCoworkingSpaces();
        this.spaces = response.spaces || [];
        console.log("spaces", this.spaces);
      } catch (err) {
        console.error("Failed to fetch spaces:", err);
      }
    },

    async searchSpaces() {
      try {
        const response = await this.$getCoworkingSpaces();
        if (this.spaceSearch) {
          this.spaces = response.spaces.filter((s) =>
            s.name.toLowerCase().includes(this.spaceSearch.toLowerCase())
          );
        } else {
          this.spaces = response.spaces;
        }
      } catch (error) {
        console.error("Failed to search spaces:", error);
      }
    },

    selectSpace(space) {
      this.form.space = space.id;
      this.spaceSearch = space.name;
      this.spaceDropdown = false;
    },

    hideDropdown() {
      setTimeout(() => {
        this.spaceDropdown = false;
      }, 200);
    },

    async submitForm() {
      this.isSaving = true;
      try {
        const payload = { ...this.form };
        const res = await this.$apiPost("/post_workspace_rental", payload);
        console.log("Rental added:", res);
        this.$emit("success");
        this.resetForm();
        this.$emit("close");
      } catch (err) {
        console.error("Failed to add rental:", err);
        alert("Failed to add workspace rental.");
      } finally {
        this.isSaving = false;
      }
    },

    resetForm() {
      this.form = {
        guest_name: "",
        guest_email: "",
        guest_phone: "",
        cycle: "",
        start_date: "",
        is_active: true,
        user: localStorage.getItem("userId") || 0,
        space: "",
      };
      this.spaceSearch = "";
    },
  },
};
</script>
