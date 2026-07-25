<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div class="bg-white w-full max-w-xl md:max-w-3xl lg:max-w-5xl rounded-xl shadow-xl flex flex-col max-h-[92vh]">

        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 class="text-base font-bold text-gray-800">Update Property</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div class="overflow-y-auto p-5 space-y-6">
          <form id="updatePropertyForm" @submit.prevent="submitForm">

            <!-- Basic Info -->
            <section class="space-y-3 mb-6">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Basic Info</p>
              <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">

                <div class="sm:col-span-3 lg:col-span-2">
                  <label class="form-label">Property Name <span class="text-red-500">*</span></label>
                  <input v-model="form.name" type="text" required placeholder="e.g. Sunset Villa" class="form-input" />
                </div>

                <!-- Property Type -->
                <div>
                  <label class="form-label">Type <span class="text-red-500">*</span></label>
                  <select v-model="selectedTypeId" required class="form-input" @change="onTypeSelected">
                    <option value="" disabled>Select Type</option>
                    <option v-for="type in propertyTypes" :key="type.id" :value="type.id">
                      {{ type.name }}
                    </option>
                  </select>
                </div>

                <!-- Zone with search -->
                <div>
                  <label class="form-label">Zone <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input
                      v-model="zoneSearch"
                      @input="handleZoneSearch"
                      type="text"
                      placeholder="Search zones..."
                      class="form-input mb-1"
                    />
                    <select
                      v-model="form.property_zone_id"
                      required
                      class="form-input"
                      @change="onZoneSelected"
                    >
                      <option value="" disabled>Select zone</option>
                      <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.name }}</option>
                    </select>
                  </div>
                </div>

                <div class="sm:col-span-3 lg:col-span-1">
                  <label class="form-label">Manager</label>
                  <select v-model="form.manager_id" class="form-input">
                    <option value="">None</option>
                    <option v-for="m in managers" :key="m.manager?.id || m.id" :value="m.manager?.id || m.id">
                      {{ m.manager?.first_name || m.first_name }} {{ m.manager?.last_name || m.last_name }}
                    </option>
                  </select>
                </div>

              </div>
            </section>

            <!-- Location -->
            <section class="space-y-3 mb-6">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Location</p>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <div class="col-span-2 sm:col-span-3 lg:col-span-4">
                  <label class="form-label">Address</label>
                  <input v-model="form.address" type="text" placeholder="Street, house no." class="form-input" />
                </div>
                <div>
                  <label class="form-label">City</label>
                  <input v-model="form.city" type="text" placeholder="City" class="form-input" />
                </div>
                <div>
                  <label class="form-label">State</label>
                  <input v-model="form.state" type="text" placeholder="State" class="form-input" />
                </div>
                <div>
                  <label class="form-label">ZIP Code</label>
                  <input v-model="form.zip_code" type="text" placeholder="ZIP" class="form-input" />
                </div>

                <!-- Conditional location fields driven by property type -->
                <div v-if="selectedType?.has_block_number">
                  <label class="form-label">Block #</label>
                  <input v-model="form.block_number" type="text" placeholder="Block" class="form-input" />
                </div>
                <div v-if="selectedType?.has_floor">
                  <label class="form-label">Floor #</label>
                  <input v-model="form.floor_number" type="text" placeholder="Floor" class="form-input" />
                </div>
                <div v-if="selectedType?.has_house_number">
                  <label class="form-label">House #</label>
                  <input v-model="form.house_number" type="text" placeholder="House" class="form-input" />
                </div>
              </div>
            </section>

            <!-- Specs & Pricing -->
            <section class="space-y-3 mb-6">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Specs & Pricing</p>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div>
                  <label class="form-label">Area (sqft)</label>
                  <input v-model="form.area" type="text" placeholder="0" class="form-input" />
                </div>
                <div v-if="selectedType?.has_bedroom">
                  <label class="form-label">Bedrooms</label>
                  <input v-model.number="form.bed_rooms" type="number" min="0" placeholder="0" class="form-input" />
                </div>
                <div v-if="selectedType?.has_bathroom">
                  <label class="form-label">Bathrooms</label>
                  <input v-model.number="form.bath_rooms" type="number" min="0" placeholder="0" class="form-input" />
                </div>
              </div>

              <!-- Status selector -->
              <div class="mt-3">
                <label class="form-label">Listing Status <span class="text-red-500">*</span></label>
                <div class="flex flex-wrap gap-2 mt-1">
                  <button type="button" v-for="s in statusOptions" :key="s.value"
                    @click="form.status = s.value"
                    :class="form.status === s.value
                      ? s.activeClass
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'"
                    class="flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all">
                    <i :class="s.icon"></i>
                    {{ s.label }}
                  </button>
                </div>
              </div>

              <!-- Conditional pricing fields -->
              <div v-if="form.status === 'for_rent'" class="mt-3 max-w-xs">
                <label class="form-label">
                  Monthly Rent <span class="text-red-500">*</span>
                  <span class="text-gray-400 font-normal ml-1">— amount tenant pays per month</span>
                </label>
                <input v-model.number="form.rent" type="number" min="0" required placeholder="e.g. 15000" class="form-input" />
              </div>

              <div v-if="form.status === 'for_sale'" class="mt-3 max-w-xs">
                <label class="form-label">
                  Selling Price <span class="text-red-500">*</span>
                  <span class="text-gray-400 font-normal ml-1">— total asking price</span>
                </label>
                <input v-model.number="form.price" type="number" min="0" required placeholder="e.g. 2500000" class="form-input" />
              </div>

              <p v-if="form.status === 'available'" class="text-xs text-gray-400 italic mt-1">
                <i class="fas fa-info-circle mr-1"></i>No pricing required for an available (unlisted) property.
              </p>
            </section>

            <!-- Amenities -->
            <section class="space-y-3 mb-6">
              <div class="flex items-center justify-between border-b border-gray-100 pb-1">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Amenities</p>
                <button type="button" @click="addAmenity"
                  class="text-xs text-gray-800 font-bold hover:text-black transition-colors flex items-center gap-1">
                  <i class="fas fa-plus text-[10px]"></i> Add
                </button>
              </div>
              <div v-for="(item, i) in amenities" :key="i" class="flex gap-2">
                <input v-model="item.amenity" placeholder="Feature (e.g. Wifi)" class="form-input flex-1" />
                <input v-model="item.value" placeholder="Value (e.g. Free)" class="form-input flex-1" />
                <button v-if="amenities.length > 1" type="button" @click="removeAmenity(i)"
                  class="text-red-500 hover:text-red-700 transition px-1">
                  <i class="fas fa-times text-xs"></i>
                </button>
              </div>
            </section>

            <!-- Description -->
            <section class="space-y-2">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">Description</p>
              <textarea v-model="form.content" rows="3" placeholder="Describe the property..."
                class="form-input resize-none"></textarea>
            </section>

          </form>
        </div>

        <div class="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl shrink-0">
          <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button form="updatePropertyForm" type="submit" :disabled="saving" class="btn-primary flex items-center gap-2">
            <i v-if="saving" class="fas fa-spinner fa-spin text-xs"></i>
            {{ saving ? 'Saving...' : 'Update Property' }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "UpdateProperty",
  props: { visible: Boolean, property: Object },
  data() {
    return {
      zones: [],
      managers: [],
      propertyTypes: [],
      zoneSearch: "",
      zoneSearchTimeout: null,
      amenities: [{ amenity: "", value: "" }],
      selectedTypeId: "",
      selectedType: null,
      saving: false,
      statusOptions: [
        { value: 'available',        label: 'Available',        icon: 'fas fa-circle-check', activeClass: 'bg-gray-800 border-gray-800 text-white' },
        { value: 'for_rent',         label: 'For Rent',         icon: 'fas fa-home',         activeClass: 'bg-blue-600 border-blue-600 text-white' },
        { value: 'for_sale',         label: 'For Sale',         icon: 'fas fa-tag',          activeClass: 'bg-orange-500 border-orange-500 text-white' },
        { value: 'rent',             label: 'Rented',           icon: 'fas fa-handshake',    activeClass: 'bg-green-600 border-green-600 text-white' },
        { value: 'sale',             label: 'Sold',             icon: 'fas fa-dollar-sign',  activeClass: 'bg-purple-600 border-purple-600 text-white' },
        { value: 'under_maintenance',label: 'Maintenance',      icon: 'fas fa-tools',        activeClass: 'bg-red-600 border-red-600 text-white' },
      ],
      form: {
        id: null,
        property_zone_id: "",
        owner_id: "",
        manager_id: "",
        name: "",
        property_type: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        price: 0,
        bed_rooms: "",
        bath_rooms: "",
        rent: 0,
        content: "",
        status: "available",
        area: "",
        description: "",
        block_number: "",
        floor_number: "",
        house_number: "",
      },
    };
  },
  watch: {
    property: {
      immediate: true,
      handler(val) {
        if (!val) return;
        this.form = { ...val };
        this.amenities = this.parseAmenities(val.description);

        // property_type can be an object {id, name} or a raw id/string
        const typeId = val.property_type?.id ?? val.property_type ?? "";
        this.selectedTypeId = typeId;

        // If propertyTypes already loaded, resolve immediately; otherwise the
        // watch on propertyTypes (set in mounted) will resolve it after load.
        this.resolveSelectedType();

        // Pre-fill the zone search box with the current zone name
        if (val.property_zone_id && this.zones.length) {
          const z = this.zones.find(z => z.id == val.property_zone_id);
          if (z) this.zoneSearch = z.name;
        }
      },
    },
  },
  async mounted() {
    // Load property types first so the watcher can resolve selectedType
    try {
      const typeRes = await this.$apiGet("/get_property_types");
      this.propertyTypes = typeRes.data || typeRes.types || [];
      this.resolveSelectedType();
    } catch (e) {
      console.error("Failed to load property types", e);
    }

    // Zones
    const zRes = await this.$getZones();
    this.zones = zRes.zones || [];

    // Pre-fill zone search if property already set
    if (this.form.property_zone_id) {
      const z = this.zones.find(z => z.id == this.form.property_zone_id);
      if (z) this.zoneSearch = z.name;
    }

    // Managers
    const isSuperuser = localStorage.getItem("is_superuser") === "true";
    const mRes = isSuperuser
      ? await this.$apiGet("/get_managers")
      : await this.$apiGet("/get_owner_managers", { owner__id: localStorage.getItem("userId") });
    this.managers = mRes.data || [];
  },
  methods: {
    resolveSelectedType() {
      if (!this.selectedTypeId || !this.propertyTypes.length) return;
      this.selectedType = this.propertyTypes.find(t => t.id == this.selectedTypeId) || null;
    },

    onTypeSelected() {
      this.selectedType = this.propertyTypes.find(t => t.id == this.selectedTypeId) || null;
      this.form.property_type = this.selectedTypeId;
    },

    async fetchZones(search = "") {
      const zRes = await this.$getZones();
      this.zones = zRes.zones || [];
    },

    handleZoneSearch() {
      if (this.zoneSearchTimeout) clearTimeout(this.zoneSearchTimeout);
      this.zoneSearchTimeout = setTimeout(() => {
        this.fetchZones(this.zoneSearch);
      }, 300);
    },

    onZoneSelected() {
      if (!this.form.property_zone_id) {
        this.zoneSearch = "";
        return;
      }
      const z = this.zones.find(z => z.id == this.form.property_zone_id);
      if (z) this.zoneSearch = z.name;
    },

    parseAmenities(desc) {
      if (!desc || !desc.trim()) return [{ amenity: "", value: "" }];
      const pairs = desc.split(",").map(pair => {
        const [k, v] = pair.split(":");
        return {
          amenity: k?.trim() || "",
          value: v?.replace(/"/g, "").trim() || "",
        };
      }).filter(a => a.amenity || a.value);
      return pairs.length ? pairs : [{ amenity: "", value: "" }];
    },

    addAmenity() { this.amenities.push({ amenity: "", value: "" }); },
    removeAmenity(i) { this.amenities.splice(i, 1); },

    async submitForm() {
      this.saving = true;

      // Zero-out the pricing field that doesn't apply to the selected status
      if (this.form.status === 'available' || this.form.status === 'under_maintenance') {
        this.form.rent = 0;
        this.form.price = 0;
      } else if (this.form.status === 'for_rent' || this.form.status === 'rent') {
        this.form.price = 0;
        if (Number(this.form.rent) < 0) {
          this.$root.$refs.toast.showToast("Monthly rent must be 0 or greater", "error");
          this.saving = false;
          return;
        }
      } else if (this.form.status === 'for_sale' || this.form.status === 'sale') {
        this.form.rent = 0;
        if (Number(this.form.price) < 0) {
          this.$root.$refs.toast.showToast("Selling price must be 0 or greater", "error");
          this.saving = false;
          return;
        }
      }

      // Rebuild description from amenities
      this.form.description = this.amenities
        .filter(a => a.amenity && a.value)
        .map(a => `${a.amenity.trim()}:"${a.value.trim()}"`)
        .join(",");

      // Ensure property_type is the id (not an object)
      if (this.form.property_type?.id) {
        this.form.property_type = this.form.property_type.id;
      }

      try {
        await this.$apiPatch("/update_property", this.form.id, { ...this.form });
        this.$root.$refs.toast.showToast("Property updated successfully", "success");
        this.$emit("refresh");
        this.$emit("close");
      } catch (e) {
        this.$root.$refs.toast.showToast(e.message || "Failed to update", "error");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.form-label { @apply block text-xs font-bold text-gray-800 mb-1; }
.form-input  { @apply w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 bg-white transition-all; }
.btn-cancel  { @apply px-4 py-2 text-sm text-gray-700 font-semibold border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors; }
.btn-primary { @apply px-5 py-2 text-sm font-bold text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed; }
</style>
