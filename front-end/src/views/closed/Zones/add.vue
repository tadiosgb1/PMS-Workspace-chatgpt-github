<template>
  <div class="pms-brand-page">
    <Toast ref="toast" />
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white w-full max-w-2xl rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">

        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 class="text-base font-bold text-gray-800 tracking-tight">Add Property Zone</h2>
          <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold leading-none">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <form id="zoneForm" @submit.prevent="submitForm" class="space-y-5">

            <section class="space-y-2.5">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Core Configuration</p>
              <div>
                <label class="form-label">Zone Name <span class="text-red-500">*</span></label>
                <input v-model="form.name" placeholder="e.g. North Sector" class="form-input" required />
              </div>
            </section>

            <section class="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100 space-y-4">
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
                <span>Use the buttons below to capture your current GPS position or pick an exact point on the map.</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Latitude</label>
                  <input
                    v-model="form.latitude"
                    readonly
                    class="form-input bg-gray-100 cursor-not-allowed font-mono text-xs text-gray-600 select-all"
                    placeholder="Not set"
                  />
                </div>
                <div>
                  <label class="form-label">Longitude</label>
                  <input
                    v-model="form.longitude"
                    readonly
                    class="form-input bg-gray-100 cursor-not-allowed font-mono text-xs text-gray-600 select-all"
                    placeholder="Not set"
                  />
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  @click="getCurrentLocation"
                  :disabled="locating"
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition disabled:opacity-60"
                >
                  <i v-if="locating" class="fas fa-spinner fa-spin text-xs"></i>
                  <i v-else class="fas fa-location-arrow text-xs"></i>
                  {{ locating ? "Getting location..." : "Get Current Location" }}
                </button>
                <button
                  type="button"
                  @click="openMapPicker"
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition"
                >
                  <i class="fas fa-map-marked-alt text-xs"></i>
                  Get from Map
                </button>
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
                  <button
                    v-if="amenities.length > 1"
                    type="button"
                    @click="removeAmenity(index)"
                    class="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition"
                  >
                    <i class="fas fa-trash-alt text-sm"></i>
                  </button>
                </div>
              </div>
            </section>

          </form>
        </div>

        <div class="px-6 py-3.5 border-t border-gray-100 bg-gray-50 shrink-0">
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
          <button v-if="$hasPermission('pms.add_propertyzone')" form="zoneForm" type="submit" :disabled="loading" class="btn-primary disabled:opacity-50 flex items-center gap-2">
            <i v-if="loading" class="fas fa-spinner fa-spin text-xs"></i>
            <i v-else class="fas fa-save text-xs"></i>
            {{ loading ? "Saving Zone..." : "Save Zone" }}
          </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Map Picker Modal -->
    <div
      v-if="showMapPicker"
      class="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
    >
      <div class="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden" style="height: 85vh; max-height: 700px;">
        <div class="flex justify-between items-center px-5 py-3 border-b border-gray-100 shrink-0">
          <h3 class="text-sm font-bold text-gray-800">Pick Location on Map</h3>
          <button
            @click="closeMapPicker"
            class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold leading-none"
          >&times;</button>
        </div>

        <div class="relative flex-1" style="min-height: 300px;">
          <div ref="mapContainer" id="zone-map" style="width: 100%; height: 100%; min-height: 300px;"></div>
        </div>

        <div class="flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
          <p class="text-xs text-gray-500 font-medium">
            Click on the map to place the marker (you can also drag it).
            <span v-if="mapLat && mapLng" class="block mt-0.5 font-mono text-gray-700">
              {{ mapLat }}, {{ mapLng }}
            </span>
          </p>
          <div class="flex gap-2">
            <button type="button" @click="closeMapPicker" class="btn-cancel">Cancel</button>
            <button
              type="button"
              @click="confirmMapLocation"
              :disabled="!mapLat || !mapLng"
              class="btn-primary disabled:opacity-50"
            >
              Use this location
            </button>
          </div>
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
      loading: false,
      errorMessages: [],
      locating: false,
      amenities: [{ amenity: "", value: "" }],
      form: {
        owner_id: localStorage.getItem("userId"),
        name: "",
        address: "",
        city: "",
        state: "",
        latitude: "",
        longitude: "",
        description: "",
      },

      showMapPicker: false,
      map: null,
      marker: null,
      mapLat: null,
      mapLng: null,
      leafletReady: false,
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.getCurrentLocation();
      }
    },
  },
  mounted() {
    if (this.visible) this.getCurrentLocation();
  },
  beforeDestroy() {
    this.destroyMap();
  },
  beforeUnmount() {
    this.destroyMap();
  },
  methods: {
    showError(msg) {
      if (this.$refs.toast && this.$refs.toast.showToast) {
        this.$refs.toast.showToast("error", msg);
      } else if (this.$root?.$refs?.toast?.showToast) {
        this.$root.$refs.toast.showToast("error", msg);
      } else {
        alert(msg);
      }
    },

    addAmenity() {
      this.amenities.push({ amenity: "", value: "" });
    },
    removeAmenity(index) {
      this.amenities.splice(index, 1);
    },
    buildDescription() {
      return this.amenities
        .filter((a) => a.amenity && a.value)
        .map((a) => `${a.amenity.trim()}:"${a.value.trim()}"`)
        .join(",");
    },

    getCurrentLocation() {
      if (!navigator.geolocation) {
        this.showError("Geolocation is not supported by this browser.");
        return;
      }
      this.locating = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.form.latitude = pos.coords.latitude.toFixed(6);
          this.form.longitude = pos.coords.longitude.toFixed(6);
          this.locating = false;
        },
        (err) => {
          console.error(err);
          this.locating = false;
          this.showError("Unable to retrieve location. Please allow access or use the map.");
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    },

    // Dynamically load Leaflet if it is not already present
    loadLeaflet() {
      return new Promise((resolve, reject) => {
        if (typeof window.L !== "undefined") {
          this.leafletReady = true;
          resolve();
          return;
        }

        // CSS
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        // JS
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => {
          this.leafletReady = true;
          resolve();
        };
        script.onerror = () => reject(new Error("Failed to load Leaflet"));
        document.head.appendChild(script);
      });
    },

    async openMapPicker() {
      try {
        await this.loadLeaflet();
      } catch (e) {
        this.showError("Could not load map library. Check your internet connection.");
        return;
      }

      this.showMapPicker = true;
      this.mapLat = this.form.latitude || null;
      this.mapLng = this.form.longitude || null;

      this.$nextTick(() => {
        setTimeout(() => this.initMap(), 50);
      });
    },

    closeMapPicker() {
      this.showMapPicker = false;
      this.destroyMap();
    },

    destroyMap() {
      if (this.map) {
        this.map.off();
        this.map.remove();
        this.map = null;
        this.marker = null;
      }
    },

    initMap() {
      if (typeof window.L === "undefined") {
        this.showError("Map library not available.");
        return;
      }

      this.destroyMap();

      const container = this.$refs.mapContainer || document.getElementById("zone-map");
      if (!container) return;

      const defaultLat = parseFloat(this.form.latitude) || 9.03;
      const defaultLng = parseFloat(this.form.longitude) || 38.74;

      this.map = window.L.map(container).setView([defaultLat, defaultLng], 15);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(this.map);

      if (this.form.latitude && this.form.longitude) {
        this.placeMarker(defaultLat, defaultLng);
      }

      this.map.on("click", (e) => {
        this.placeMarker(e.latlng.lat, e.latlng.lng);
      });

      // Important: force correct size after modal animation
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 200);
    },

    placeMarker(lat, lng) {
      this.mapLat = Number(lat).toFixed(6);
      this.mapLng = Number(lng).toFixed(6);

      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        this.marker = window.L.marker([lat, lng], { draggable: true }).addTo(this.map);
        this.marker.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          this.mapLat = pos.lat.toFixed(6);
          this.mapLng = pos.lng.toFixed(6);
        });
      }
      this.map.panTo([lat, lng]);
    },

    confirmMapLocation() {
      if (!this.mapLat || !this.mapLng) return;
      this.form.latitude = this.mapLat;
      this.form.longitude = this.mapLng;
      this.closeMapPicker();
    },

    getApiErrorMessages(error) {
      const data = error?.response?.data;
      const source = data ?? (error?.message && typeof error.message === "object" ? error.message : null);
      const flatten = (value) => {
        if (typeof value === "string" && value.trim()) return [value.trim()];
        if (Array.isArray(value)) return value.flatMap((item) => flatten(item));
        if (value && typeof value === "object") {
          return Object.values(value).flatMap((item) => flatten(item));
        }
        return [];
      };
      const candidates = [source?.error, source?.message, source, error?.message];
      for (const candidate of candidates) {
        const messages = flatten(candidate);
        if (messages.length) return messages;
      }
      return ["Failed to save zone"];
    },

    async submitForm() {
      if (!this.$hasPermission("pms.add_propertyzone")) {
        this.showError("You do not have permission to add zones.");
        return;
      }
      this.loading = true;
      this.errorMessages = [];
      this.form.description = this.buildDescription();
      try {
        await this.$apiPost("post_property_zone", this.form);
        this.$reloadPage();
        this.$emit("close");
      } catch (err) {
        this.errorMessages = this.getApiErrorMessages(err);
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.form-label { @apply block text-xs font-bold text-gray-800 mb-1; }
.form-input  { @apply w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 bg-white transition-all; }
.btn-cancel  { @apply px-4 py-2 text-sm text-gray-700 font-semibold border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors; }
.btn-primary { @apply px-5 py-2 text-sm font-bold text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors; }
</style>