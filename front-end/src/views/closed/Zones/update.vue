<template>
  <div class="pms-brand-page">
    <Toast ref="toast" />

    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white w-full max-w-xl md:max-w-3xl lg:max-w-5xl rounded-xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden">

        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 class="text-base font-bold text-gray-800 tracking-tight">Edit Property Zone</h2>
          <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold leading-none">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="editZoneForm" @submit.prevent="updateModalVisible = true" class="space-y-6">

            <section class="space-y-3">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Core Identity</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Zone Name <span class="text-red-500">*</span></label>
                  <input v-model="form.name" class="form-input" required />
                </div>
                <div>
                  <label class="form-label">Manager ID <span class="text-red-500">*</span></label>
                  <input v-model="form.manager_id" type="number" class="form-input" required />
                </div>
              </div>
            </section>

            <section class="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200/60 pb-1">Location Details</p>
              <div>
                <label class="form-label">Street Address</label>
                <input v-model="form.address" placeholder="Full address..." class="form-input" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">City</label>
                  <input v-model="form.city" placeholder="City" class="form-input" />
                </div>
                <div>
                  <label class="form-label">State / Region</label>
                  <input v-model="form.state" placeholder="State / Region" class="form-input" />
                </div>
              </div>
            </section>

            <section class="space-y-3">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Geospatial Coordinates</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Latitude</label>
                  <input v-model="form.latitude" class="form-input font-mono text-xs text-gray-900" placeholder="Latitude decimal mapping" />
                </div>
                <div>
                  <label class="form-label">Longitude</label>
                  <input v-model="form.longitude" class="form-input font-mono text-xs text-gray-900" placeholder="Longitude decimal mapping" />
                </div>
              </div>
            </section>

            <section class="space-y-3">
              <div class="flex justify-between items-center border-b border-gray-100 pb-1">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Amenities / Features</label>
                <button type="button" @click="addAmenity" class="text-xs text-gray-800 font-bold hover:text-black transition flex items-center gap-1">
                  <i class="fas fa-plus text-[10px]"></i> Add Feature
                </button>
              </div>
              <div class="space-y-3">
                <div v-for="(item, index) in amenities" :key="index" class="flex gap-2 items-center">
                  <input v-model="item.amenity" placeholder="Feature" class="form-input flex-1" />
                  <input v-model="item.value" placeholder="Value" class="form-input flex-1" />
                  <button v-if="amenities.length > 1" type="button" @click="removeAmenity(index)" class="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition">
                    <i class="fas fa-trash-alt text-sm"></i>
                  </button>
                </div>
              </div>
            </section>

          </form>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <div v-if="errorMessages.length" class="mb-4 text-red-700 text-sm bg-red-50 border border-red-200 p-4 rounded-lg">
            <ul class="space-y-1">
              <li v-for="(message, index) in errorMessages" :key="index" class="flex items-start gap-2">
                <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                <span>{{ message }}</span>
              </li>
            </ul>
          </div>
          <div class="flex justify-end gap-3">
          <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button v-if="$hasPermission('pms.change_propertyzone')" form="editZoneForm" type="submit" class="btn-primary flex items-center gap-2">
            <i class="fas fa-save text-xs"></i> Update Zone
          </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="updateModalVisible" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="updateModalVisible = false">
      <div class="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl border border-gray-100 animate-in zoom-in-95 duration-150">
        <p class="text-sm font-bold text-gray-800 mb-5">Are you sure you want to apply these updates?</p>
        <div class="flex justify-end gap-3">
          <button @click="updateModalVisible = false" class="btn-cancel">Cancel</button>
          <button v-if="$hasPermission('pms.change_propertyzone')" @click="submitForm" class="btn-primary flex items-center gap-1.5">
            <i class="fas fa-check text-xs"></i> Confirm Updates
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";

export default {
  props: { visible: Boolean, zone: Object },
  components: { Toast },
  data() {
    return {
      form: { id: null, name: "", address: "", city: "", state: "", owner_id: null, manager_id: null, latitude: "", longitude: "", description: "" },
      amenities: [{ amenity: "", value: "" }],
      errorMessages: [],
      updateModalVisible: false,
    };
  },
  watch: { zone: { immediate: true, handler(val) { if (val) this.loadEditData(val); } } },
  methods: {
    addAmenity() { this.amenities.push({ amenity: "", value: "" }); },
    removeAmenity(index) { this.amenities.splice(index, 1); },
    loadEditData(zone) {
      this.form = { ...zone };
      if (zone.description) {
        this.amenities = zone.description.split(",").map(item => { const [key, val] = item.split(":"); return { amenity: key?.trim(), value: val?.replace(/"/g, "").trim() }; });
      } else { this.amenities = [{ amenity: "", value: "" }]; }
    },
    buildDescription() { return this.amenities.filter(a => a.amenity && a.value).map(a => `${a.amenity}:${a.value}`).join(","); },
    getApiErrorMessages(error) {
      const data = error?.response?.data;
      const source = data ?? (error?.message && typeof error.message === "object" ? error.message : null);
      const flatten = (value) => {
        if (typeof value === "string" && value.trim()) return [value.trim()];
        if (Array.isArray(value)) return value.flatMap((item) => flatten(item));
        if (value && typeof value === "object") return Object.values(value).flatMap((item) => flatten(item));
        return [];
      };
      const candidates = [source?.error, source?.message, source, error?.message];
      for (const candidate of candidates) {
        const messages = flatten(candidate);
        if (messages.length) return messages;
      }
      return ["Failed to update zone"];
    },

    async submitForm() {
      if (!this.$hasPermission("pms.change_propertyzone")) {
        this.$root.$refs.toast.showToast("You do not have permission to edit zones.", "error");
        return;
      }
      this.updateModalVisible = false;
      this.errorMessages = [];
      this.form.description = this.buildDescription();
      try {
        const response = await this.$apiPut("/update_property_zone", this.form.id, this.form);
        if (response?.error) { this.errorMessages = this.getApiErrorMessages(response); }
        else { this.$root.$refs.toast.showToast("Zone updated successfully", "success"); this.$emit("refresh"); this.$emit("close"); }
      } catch (err) { console.error(err); this.errorMessages = this.getApiErrorMessages(err); }
    },
  },
};
</script>

<style scoped>
/* Precise, professional utility design layers with maximum contrast and label clarity */
.form-label { @apply block text-xs font-bold text-gray-800 mb-1; }
.form-input  { @apply w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 bg-white transition-all; }
.btn-cancel  { @apply px-4 py-2 text-sm text-gray-700 font-semibold border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors; }
.btn-primary { @apply px-5 py-2 text-sm font-bold text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors; }
</style>