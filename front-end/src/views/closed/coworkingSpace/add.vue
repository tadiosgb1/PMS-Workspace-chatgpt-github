<template>
  <div>
    <Toast ref="toast" />

    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
    >
      <div 
        class="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200"
      >
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 class="text-base font-bold text-gray-800 tracking-tight">Add Co-Working Space</h2>
          <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold leading-none">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <form id="addSpaceForm" @submit.prevent="submitForm" class="space-y-8">
            
            <div class="space-y-4">
              <div class="flex items-center gap-2 mb-2">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Core Configuration</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-1">
                  <label class="form-label">Space Name <span class="text-red-500">*</span></label>
                  <input v-model="form.name" type="text" placeholder="Executive Suite A" class="form-input" required />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Specific Location <span class="text-red-500">*</span></label>
                  <input v-model="form.location" type="text" placeholder="Floor 4, East Wing" class="form-input" required />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Service Category</label>
                  <select v-model="form.service_type" class="form-input appearance-none">
                    <option value="" disabled>Select Space Type</option>
                    <option value="single_space">Single Hot Desk</option>
                    <option value="multiple_space">Dedicated Desk Group</option>
                    <option value="private_space">Private Office</option>
                    <option value="meeting_room">Meeting/Board Room</option>
                    <option value="office">Corporate Office</option>
                    <option value="evet_space">Event Venue</option>
                    <option value="other">Other specialized</option>
                  </select>
                </div>
                <div class="space-y-1 relative">
                  <label class="form-label">Property Zone Association <span class="text-red-500">*</span></label>
                  <div class="relative group">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <i class="fas fa-search text-[10px]"></i>
                    </span>
                    <input
                      v-model="zoneSearch"
                      type="text"
                      class="form-input pl-9"
                      placeholder="Type to search zone..."
                      @input="searchZones"
                      @focus="zoneDropdown = true"
                      @blur="hideDropdown('zone')"
                      required
                    />
                  </div>
                  <ul v-if="zones.length > 0 && zoneDropdown" class="absolute z-50 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl mt-1 animate-in fade-in slide-in-from-top-2">
                    <li v-for="zone in zones" :key="zone.id" class="px-4 py-2.5 hover:bg-gray-50 text-sm font-semibold text-gray-700 cursor-pointer border-b border-gray-50 last:border-0" @mousedown.prevent="selectZone(zone)">
                      {{ zone.name }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <hr class="border-gray-100" />

            <div class="space-y-4">
              <div class="flex items-center gap-2 mb-2">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Pricing & Capacity</p>
              </div>
              <div class="bg-gray-50 rounded-xl border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-800 mb-1">Capacity (Seats)</label>
                  <input v-model.number="form.capacity" type="number" min="1" class="form-input font-bold" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-800 mb-1">Daily Rate</label>
                  <input v-model="form.price_daily" type="number" step="0.01" class="form-input" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-800 mb-1">Monthly Rate</label>
                  <input v-model="form.price_monthly" type="number" step="0.01" class="form-input" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-800 mb-1">Yearly Rate</label>
                  <input v-model="form.price_yearly" type="number" step="0.01" class="form-input" required />
                </div>
                <div class="md:col-span-4">
                   <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-800 mb-1">Quarterly Rate</label>
                    <input v-model="form.price_quarterly" type="number" step="0.01" class="form-input" required />
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Amenities & Features</p>
                </div>
                <button type="button" @click="addAmenity" class="text-xs text-gray-800 font-bold hover:text-black transition flex items-center gap-1">
                  <i class="fas fa-plus text-[10px]"></i> Add Feature
                </button>
              </div>

              <div class="space-y-3">
                <div v-for="(item, index) in amenities" :key="index" class="flex gap-3 items-center animate-in slide-in-from-left-2 duration-200">
                  <div class="flex-1 grid grid-cols-2 gap-3">
                    <input v-model="item.amenity" placeholder="e.g. Wi-Fi Speed" class="form-input text-sm" />
                    <input v-model="item.value" placeholder="e.g. 100Mbps" class="form-input text-sm" />
                  </div>
                  <button v-if="amenities.length > 1" type="button" @click="removeAmenity(index)" class="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition">
                    <i class="fas fa-trash-alt text-sm"></i>
                  </button>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button
            type="button"
            @click="$emit('close')"
            class="btn-cancel"
          >
            Cancel
          </button>
          <button
            form="addSpaceForm"
            type="submit"
            :disabled="loading"
            class="btn-primary disabled:opacity-50 flex items-center gap-2"
          >
            <i class="fas fa-save" v-if="!loading"></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
            {{ loading ? "Saving..." : "Save Space" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "../../../components/Toast.vue";

export default {
  name: "AddSpaceModal",
  components: { Toast },
  props: {
    visible: Boolean,
  },
  data() {
    return {
      form: {
        name: "",
        location: "",
        description: "",
        capacity: 1,
        price_daily: "",
        price_monthly: "",
        price_quarterly: "",
        price_yearly: "",
        zone: "",
        service_type:""
      },
       amenities: [
          { amenity: "", value: "" }
        ],
      zoneSearch: "",
      zones: [],
      zoneDropdown: false,
      loading: false, // Added loading state
    };
  },
  mounted() {
    this.fetchZones();
  },
  methods: {
     addAmenity() {
    this.amenities.push({ amenity: "", value: "" });
  },
  removeAmenity(index) {
    this.amenities.splice(index, 1);
  },
    async fetchZones() {
      try {
        const url = `/get_property_zones?search=${this.zoneSearch}`;
        const result = await this.$getZones(url);
        this.zones = result.zones;
      } catch (err) {
        console.error("Failed to fetch zones:", err);
      }
    },
    searchZones() {
      this.fetchZones();
    },
    selectZone(zone) {
      this.form.zone = zone.id;
      this.zoneSearch = zone.name;
      this.zoneDropdown = false;
    },
    hideDropdown(type) {
      setTimeout(() => {
        if (type === "zone") this.zoneDropdown = false;
      }, 200);
    },
    async submitForm() {
      this.loading = true;

    this.form.description = this.amenities
    .filter(a => a.amenity && a.value)
    .map(a => `${a.amenity.trim()}:"${a.value.trim()}"`)
    .join(",");


      try {
        const payload = { ...this.form };
        const res = await this.$apiPost("/post_coworking_space", payload);
        console.log("Space added:", res);

        if (res && res.error) {
          this.$root.$refs.toast.showToast(
            res.error || "Failed to add space",
            "error"
          );
        } else {
          this.$root.$refs.toast.showToast(
            "Co-working space added successfully!",
            "success"
          );
          this.resetForm();
          this.$emit("success");
          this.$reloadPage();
          setTimeout(() => this.$emit("close"), 1500);
        }
      } catch (err) {
        console.error("Failed to add space:", err);
        this.$root.$refs.toast.showToast(
          "Failed to add co-working space",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.form = {
        name: "",
        location: "",
        description: "",
        capacity: 1,
        price_daily: "",
        price_monthly: "",
        price_quarterly: "",
        price_yearly: "",
        zone: "",
      };
      this.zoneSearch = "";
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
