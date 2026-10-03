<template>
  <div class="pms-brand-page">
    <Toast ref="toast" />

    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
    >
      <div 
        class="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200"
      >
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 class="text-base font-bold text-gray-800 tracking-tight">Edit Co-Working Space</h2>
          <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold leading-none">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <form id="updateSpaceForm" @submit.prevent="submitForm" class="space-y-8">
            
            <div class="space-y-4">
              <div class="flex items-center gap-2 mb-2">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">General Identity</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-1">
                  <label class="form-label">Display Name</label>
                  <input v-model="form.name" type="text" class="form-input" />
                </div>
                <div class="space-y-1">
                  <label class="form-label">Physical Location</label>
                  <input v-model="form.location" type="text" class="form-input" />
                </div>
                <div class="md:col-span-2 space-y-1">
                  <label class="form-label">Assigned Property Zone</label>
                  <div class="relative">
                    <select v-model="form.zone" class="form-input appearance-none">
                      <option disabled value="">Select a zone</option>
                      <option v-for="zone in zones" :key="zone.id" :value="zone.id">
                        {{ zone.name }} — {{ zone.city }}
                      </option>
                    </select>
                    <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                      <i class="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr class="border-gray-100" />

            <div class="space-y-4">
              <div class="flex items-center gap-2 mb-2">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Revenue & Occupancy</p>
              </div>
              <div class="bg-gray-50 rounded-xl border border-gray-100 p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-800 mb-1">Seats</label>
                  <input v-model="form.capacity" type="number" class="form-input font-bold" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-800 mb-1">Daily</label>
                  <input v-model="form.price_daily" type="number" class="form-input" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-800 mb-1">Monthly</label>
                  <input v-model="form.price_monthly" type="number" class="form-input" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-800 mb-1">Quarterly</label>
                  <input v-model="form.price_quarterly" type="number" class="form-input" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-800 mb-1">Yearly</label>
                  <input v-model="form.price_yearly" type="number" class="form-input" />
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Included Amenities</p>
                </div>
                <button type="button" @click="addAmenity" class="text-xs text-gray-800 font-bold hover:text-black transition flex items-center gap-1">
                  <i class="fas fa-plus text-[10px]"></i> Add Feature
                </button>
              </div>

              <div class="grid grid-cols-1 gap-3">
                <div v-for="(item, index) in amenities" :key="index" class="flex gap-3 items-center group animate-in slide-in-from-right-2 duration-200">
                  <div class="flex-1 grid grid-cols-2 gap-3">
                    <input v-model="item.amenity" placeholder="Amenity Label" class="form-input text-sm" />
                    <input v-model="item.value" placeholder="Description/Value" class="form-input text-sm" />
                  </div>
                  <button v-if="amenities.length > 1" type="button" @click="removeAmenity(index)" class="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition">
                    <i class="fas fa-trash-alt text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            @click="$emit('close')"
            class="px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
          >
            Cancel
          </button>
          <button
            form="updateSpaceForm"
            type="submit"
            class="custom-button !w-auto !px-10 flex items-center gap-2"
          >
            <i class="fas fa-sync-alt"></i>
            Commit Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";

export default {
  name: "UpdateCoworkspace",
  components: { Toast },

  props: {
    visible: Boolean,
    space: Object,
  },

  data() {
    return {
      form: {
        id: null,
        name: "",
        location: "",
        description: "",
        capacity: null,
        price_daily: "",
        price_monthly: "",
        price_quarterly: "",
        price_yearly: "",
        zone: "",
      },

      amenities: [{ amenity: "", value: "" }],

      zones: [],
      zoneSearch: "",
    };
  },

  watch: {
    visible(val) {
      if (val) {
        this.fetchZones();
      }
    },

    space: {
      immediate: true,
      handler(val) {
        if (!val) return;

        this.form = { ...val };
        this.amenities = this.parseAmenities(val.description);
      },
    },
  },

  methods: {
    // 🔥 PROVIDED METHOD (unchanged)
    async fetchZones() {
      try {
        const result = await this.$getZones({ search: this.zoneSearch });
        this.zones = result.zones;
      } catch (err) {
        console.error("Failed to fetch zones:", err);
      }
    },

    parseAmenities(description) {
      if (!description) return [{ amenity: "", value: "" }];

      return description.split(",").map(pair => {
        const [key, value] = pair.split(":");
        return {
          amenity: key?.trim() || "",
          value: value?.replace(/"/g, "").trim() || "",
        };
      });
    },

    addAmenity() {
      this.amenities.push({ amenity: "", value: "" });
    },

    removeAmenity(index) {
      this.amenities.splice(index, 1);
    },

    async submitForm() {
      try {
        this.form.description = this.amenities
          .filter(a => a.amenity && a.value)
          .map(a => `${a.amenity.trim()}:"${a.value.trim()}"`)
          .join(",");

        await this.$apiPut(
          `/update_coworking_space`,
          this.form.id,
          this.form
        );

        this.$root.$refs.toast.showToast(
          "Co-Working Space updated successfully",
          "success"
        );

        this.$emit("refresh");
        this.$emit("close");
      } catch (err) {
        console.error("Update failed:", err);
        alert("Failed to update co-working space.");
      }
    },
  },
};
</script>

<style scoped>
.custom-input {
  @apply w-full px-4 py-2 border border-gray-300 rounded
    focus:outline-none focus:ring-2 focus:ring-blue-500;
}
</style>
