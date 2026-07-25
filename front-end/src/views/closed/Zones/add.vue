<template>
  <div>
    <Toast ref="toast" />
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white w-full max-w-xl md:max-w-3xl lg:max-w-5xl rounded-xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden">

        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 class="text-base font-bold text-gray-800 tracking-tight">Add Property Zone</h2>
          <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold leading-none">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="zoneForm" @submit.prevent="submitForm" class="space-y-6">

            <section class="space-y-3">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Core Configuration</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="relative">
                  <label class="form-label">Zone Manager <span class="text-red-500">*</span></label>
                  <input v-model="managerSearch" type="text" class="form-input" placeholder="Search manager..." @input="searchManagers" @focus="managerDropdown = true" @blur="hideDropdown" />
                  <ul v-if="managers.length && managerDropdown" class="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                    <li v-for="manager in managers" :key="manager.manager.id" @mousedown.prevent="selectManager(manager)" class="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm font-medium border-b border-gray-100 last:border-0 text-gray-900">
                      {{ manager.manager.first_name }} {{ manager.manager.last_name || "" }}
                    </li>
                  </ul>
                </div>

                <div>
                  <label class="form-label">Zone Name <span class="text-red-500">*</span></label>
                  <input v-model="form.name" placeholder="e.g. North Sector" class="form-input" required />
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
              <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs font-semibold text-amber-950 flex items-start gap-2">
                <i class="fas fa-info-circle text-amber-600 mt-0.5 text-sm"></i>
                <span>Please be physically present in the zone to capture accurate GPS coordinates.</span>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Latitude</label>
                  <input v-model="form.latitude" readonly class="form-input bg-gray-100 cursor-not-allowed font-mono text-xs text-gray-600 select-all" placeholder="Automatically captured" />
                </div>
                <div>
                  <label class="form-label">Longitude</label>
                  <input v-model="form.longitude" readonly class="form-input bg-gray-100 cursor-not-allowed font-mono text-xs text-gray-600 select-all" placeholder="Automatically captured" />
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
                  <input v-model="item.amenity" placeholder="Feature (e.g. Water)" class="form-input flex-1" />
                  <input v-model="item.value" placeholder="Value (e.g. 24/7)" class="form-input flex-1" />
                  <button v-if="amenities.length > 1" type="button" @click="removeAmenity(index)" class="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition">
                    <i class="fas fa-trash-alt text-sm"></i>
                  </button>
                </div>
              </div>
            </section>

          </form>
        </div>

        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button form="zoneForm" type="submit" :disabled="loading" class="btn-primary disabled:opacity-50 flex items-center gap-2">
            <i v-if="loading" class="fas fa-spinner fa-spin text-xs"></i>
            <i v-else class="fas fa-save text-xs"></i>
            {{ loading ? "Saving Zone..." : "Save Zone" }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: { visible: Boolean },
  data() {
    return {
      managerSearch: "", managerDropdown: false, managers: [], loading: false,
      amenities: [{ amenity: "", value: "" }],
      form: { owner_id: localStorage.getItem("userId"), name: "", address: "", city: "", state: "", manager_id: "", latitude: "12.3", longitude: "97.1", description: "" },
    };
  },
  watch: { visible(val) { if (val) this.getCurrentLocation(); } },
  async mounted() {
    const result = await this.$getManagers();
    this.managers = result.managers;
    if (this.visible) this.getCurrentLocation();
  },
  methods: {
    searchManagers() {
      if (!this.managerSearch) return;
      this.managers = this.managers.filter(m => `${m.manager.first_name} ${m.manager.last_name || ""}`.toLowerCase().includes(this.managerSearch.toLowerCase()));
    },
    selectManager(manager) { this.form.manager_id = manager.manager.id; this.managerSearch = `${manager.manager.first_name} ${manager.manager.last_name || ""}`; this.managerDropdown = false; },
    hideDropdown() { setTimeout(() => (this.managerDropdown = false), 200); },
    addAmenity() { this.amenities.push({ amenity: "", value: "" }); },
    removeAmenity(index) { this.amenities.splice(index, 1); },
    buildDescription() { return this.amenities.filter(a => a.amenity && a.value).map(a => `${a.amenity.trim()}:"${a.value.trim()}"`).join(","); },
    getCurrentLocation() {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(pos => { this.form.latitude = pos.coords.latitude.toFixed(6); this.form.longitude = pos.coords.longitude.toFixed(6); }, err => console.error(err));
    },
    async submitForm() {
      this.loading = true;
      this.form.description = this.buildDescription();
      try {
        await this.$apiPost("post_property_zone", this.form);
        this.$reloadPage();
        this.$emit("close");
      } catch (err) { this.$emit("close"); this.$root.$refs.toast.showToast("error", err[0]); console.error(err); }
      finally { this.loading = false; }
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