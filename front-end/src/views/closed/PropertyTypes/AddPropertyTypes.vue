<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl md:max-w-4xl my-4 sm:my-6 flex flex-col">

        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary/10 flex items-center justify-between bg-primary/5 rounded-t-xl shrink-0">
          <div>
            <h2 class="text-base font-bold text-primary">Add Property Type</h2>
            <p class="text-xs text-gray-700 mt-0.5">Create a new property category</p>
          </div>
          <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition">&times;</button>
        </div>

        <!-- Form -->
        <form id="addPropertyTypeForm" @submit.prevent="submitForm" class="overflow-y-auto p-6 space-y-5">

          <!-- Name + Description -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Name <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" required placeholder="e.g. Apartment, Villa" class="form-input" />
            </div>
            <div>
              <label class="form-label">Description</label>
              <textarea v-model="form.description" rows="2" placeholder="Brief description..." class="form-input resize-none"></textarea>
            </div>
          </div>

          <!-- Boolean Features -->
          <div>
            <p class="section-label">Physical Features</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <label v-for="feat in physicalFeatures" :key="feat.key" class="toggle-row">
                <input type="checkbox" v-model="form[feat.key]" class="toggle-cb" />
                <span class="text-xs text-gray-800">{{ feat.label }}</span>
              </label>
            </div>
          </div>

          <!-- Listing Capabilities -->
          <div>
            <p class="section-label">Listing Capabilities</p>
            <div class="grid grid-cols-2 gap-2">
              <label class="toggle-row">
                <input type="checkbox" v-model="form.is_sellable" class="toggle-cb" />
                <span class="text-xs text-gray-800">Is Sellable</span>
              </label>
              <label class="toggle-row">
                <input type="checkbox" v-model="form.is_rentable" class="toggle-cb" />
                <span class="text-xs text-gray-800">Is Rentable</span>
              </label>
            </div>
          </div>

          <!-- Project Completion -->
          <div>
            <p class="section-label">Project Info</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="toggle-row mb-2">
                  <input type="checkbox" v-model="form.has_project_completion" class="toggle-cb" />
                  <span class="text-xs font-semibold text-gray-800">Has Project Completion Year</span>
                </label>
                <input v-if="form.has_project_completion" v-model="form.project_completion_year"
                  type="text" maxlength="4" placeholder="e.g. 2026" class="form-input" />
              </div>
              <div>
                <label class="toggle-row mb-2">
                  <input type="checkbox" v-model="form.has_project_status" class="toggle-cb" />
                  <span class="text-xs font-semibold text-gray-800">Has Project Status</span>
                </label>
                <select v-if="form.has_project_status" v-model="form.project_status" class="form-input">
                  <option value="">Select status</option>
                  <option value="under_construction">Under Construction</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Pre-handover Payment -->
          <div>
            <label class="toggle-row mb-2">
              <input type="checkbox" v-model="form.has_pre_handover_payment" class="toggle-cb" />
              <span class="text-xs font-semibold text-gray-800">Has Pre-handover Payment</span>
            </label>
            <select v-if="form.has_pre_handover_payment" v-model="form.pre_handover_payment" class="form-input max-w-xs">
              <option value="">Select band</option>
              <option value="under_25">Under 25%</option>
              <option value="25_to_50">25% – 50%</option>
              <option value="51_to_75">51% – 75%</option>
              <option value="above_75">Above 75%</option>
            </select>
          </div>

        </form>

        <!-- Footer -->
        <div class="border-t border-primary/10 px-6 py-4 bg-primary/5 flex justify-end gap-3 rounded-b-xl shrink-0">
          <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button form="addPropertyTypeForm" type="submit" :disabled="saving" class="btn-primary flex items-center gap-2">
            <i v-if="saving" class="fas fa-spinner fa-spin text-xs"></i>
            {{ saving ? 'Saving...' : 'Add Property Type' }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "AddPropertyTypes",
  props: { visible: Boolean },
  data() {
    return {
      saving: false,
      physicalFeatures: [
        { key: 'has_floor',        label: 'Has Floor' },
        { key: 'has_bedroom',      label: 'Has Bedroom' },
        { key: 'has_bathroom',     label: 'Has Bathroom' },
        { key: 'has_house_number', label: 'Has House Number' },
        { key: 'has_block_number', label: 'Has Block Number' },
        { key: 'has_furnishing',   label: 'Has Furnishing' },
      ],
      form: {
        name: "",
        description: "",
        has_floor: false,
        has_bedroom: false,
        has_bathroom: false,
        has_house_number: false,
        has_block_number: false,
        has_furnishing: false,
        is_sellable: false,
        is_rentable: false,
        has_project_completion: false,
        project_completion_year: "",
        has_project_status: false,
        project_status: "",
        has_pre_handover_payment: false,
        pre_handover_payment: "",
      },
    };
  },
  methods: {
    async submitForm() {
      if (!this.form.name.trim()) {
        this.$root.$refs.toast?.showToast("Name is required", "error");
        return;
      }
      this.saving = true;
      try {
        await this.$apiPost("/post_property_type", { ...this.form });
        this.$root.$refs.toast?.showToast("Property type added successfully", "success");
        this.$emit("refresh");
        this.$emit("close");
      } catch (e) {
        console.error(e);
        this.$root.$refs.toast?.showToast(e?.message || "Failed to add property type", "error");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.form-label   { @apply block text-xs font-semibold text-gray-700 mb-1; }
.form-input   { @apply w-full border border-primary/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition; }
.section-label{ @apply text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 border-b border-primary/10 pb-1; }
.toggle-row   { @apply flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-primary/5 border border-primary/10 transition; }
.toggle-cb    { @apply h-4 w-4 rounded border-gray-300 accent-primary shrink-0; }
.btn-cancel   { @apply px-4 py-2 text-sm font-semibold text-gray-700 border border-primary/20 rounded-lg hover:bg-primary/10 transition; }
.btn-primary  { @apply px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed; }
</style>
