<template>
  <div v-if="open && !canAccess" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
    <div class="w-full max-w-md border border-red-200 bg-white p-6 shadow-2xl" role="alertdialog" aria-modal="true">
      <h2 class="text-base font-semibold text-slate-900">Access restricted</h2>
      <p class="mt-2 text-sm text-slate-600">Only owners, super users and super staff can access offplan properties.</p>
      <button type="button" @click="close" class="mt-5 border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Close</button>
    </div>
  </div>

  <div v-if="open && canAccess" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" @keydown.esc="close">
    <div class="w-full max-w-5xl max-h-[92vh] overflow-hidden border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="edit-offplan-title">
      <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 id="edit-offplan-title" class="text-lg font-semibold text-slate-900">Edit offplan property</h2>
          <p class="mt-0.5 text-xs text-slate-500">Update the selected property without leaving the offplan register.</p>
        </div>
        <button type="button" @click="close" class="flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div v-if="loadingData" class="flex min-h-64 items-center justify-center text-sm text-slate-500">
        <i class="fas fa-spinner fa-spin mr-2"></i>Loading property…
      </div>

      <form v-else @submit.prevent="submitForm" class="max-h-[calc(92vh-132px)] overflow-y-auto">
        <div class="grid gap-5 border-b border-slate-200 p-6 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Property type"><select v-model="form.property_type" class="input"><option value="residential">Residential</option><option value="commercial">Commercial</option></select></Field>
          <Field label="Completion status"><select v-model="form.completion_status" class="input"><option value="ready">Ready</option><option value="offplan">Offplan</option><option value="under_construction">Under construction</option></select></Field>
          <Field label="Price"><input v-model="form.price" class="input" /></Field>
          <Field label="Bedrooms"><input v-model="form.bedrooms" class="input" /></Field>
          <Field label="Bathrooms"><input v-model="form.bathrooms" class="input" /></Field>
          <Field label="Area / size"><input v-model="form.area_or_size" class="input" /></Field>
          <Field label="Sale type"><select v-model="form.sale_type" class="input"><option value="initial_sale">Initial sale</option><option value="resale">Resale</option></select></Field>
          <Field label="Project completion"><select v-model="form.project_completion" class="input"><option value="under_25">Under 25%</option><option value="25_50">25% – 50%</option><option value="50_75">50% – 75%</option><option value="over_75">Over 75%</option></select></Field>
          <Field label="Pre-handover payment"><select v-model="form.pre_handover_payment" class="input"><option value="under_25">Under 25%</option><option value="25_50">25% – 50%</option><option value="50_75">50% – 75%</option><option value="over_75">Over 75%</option></select></Field>
          <Field label="Project status"><select v-model="form.project_status" class="input"><option value="under_construction">Under construction</option><option value="planned">Planned</option><option value="completed">Completed</option></select></Field>
          <Field label="Developer"><input v-model="form.developer" class="input" /></Field>
          <Field label="Property zone" required>
            <div class="space-y-2">
              <input v-model="zoneSearch" class="input" placeholder="Search property zones…" autocomplete="off" />
              <select v-model.number="form.property_zone" class="input" required>
                <option :value="0" disabled>Select a property zone</option>
                <option v-for="zone in filteredZones" :key="zone.id" :value="zone.id">{{ zone.name }}</option>
              </select>
            </div>
          </Field>
          <Field label="Owner" required>
            <template v-if="isElevatedUser">
              <div class="space-y-2">
                <input v-model="ownerSearch" class="input" placeholder="Search owners…" autocomplete="off" />
                <select v-model.number="form.owner" class="input" required>
                  <option :value="0" disabled>Select an owner</option>
                  <option v-for="owner in filteredOwners" :key="owner.id" :value="owner.id">{{ owner.name }}</option>
                </select>
              </div>
            </template>
            <input v-else :value="ownerDisplayName" class="input bg-slate-50" readonly />
          </Field>
          <Field label="Manager" required>
            <div class="space-y-2">
              <input v-model="managerSearch" class="input" placeholder="Search managers…" autocomplete="off" />
              <select v-model.number="form.manager" class="input" required>
                <option :value="0" disabled>Select a manager</option>
                <option v-for="manager in filteredManagers" :key="manager.id" :value="manager.id">{{ manager.name }}</option>
              </select>
            </div>
          </Field>
        </div>

        <div class="border-b border-slate-200 p-6">
          <div class="mb-4">
            <h3 class="text-sm font-semibold text-slate-900">Amenities and features</h3>
            <p class="mt-1 text-xs text-slate-500">Select the features included with the property.</p>
          </div>
          <div class="grid border-l border-t border-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            <label v-for="item in amenityOptions" :key="item.key" class="flex cursor-pointer items-center gap-3 border-b border-r border-slate-200 p-3 hover:bg-slate-50">
              <input v-model="form[item.key]" type="checkbox" class="h-4 w-4 border-slate-300 text-primary focus:ring-primary" />
              <span class="text-sm text-slate-700">{{ item.label }}</span>
            </label>
          </div>
        </div>

        <div v-if="error" class="mx-6 my-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

        <div class="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" @click="close" class="border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" :disabled="saving" class="border border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>{{ saving ? "Saving…" : "Save changes" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import OffplanField from "./OffplanField.vue";

const defaults = {
  property_type: "residential", completion_status: "ready", price: "", bedrooms: "", bathrooms: "", area_or_size: "",
  sale_type: "initial_sale", project_completion: "under_25", pre_handover_payment: "under_25",
  project_status: "under_construction", developer: "", is_furnished: true, has_maids_room: true, has_study: true,
  has_central_or_ac_and_heating: true, has_balcony: true, has_private_garden: true, has_private_pool: true,
  has_private_gym: true, has_private_jacuzzi: true, has_shared_pool: true, has_shared_spa: true,
  property_zone: 0, owner: 0, manager: 0
};

export default {
  name: "EditOffplanProperty",
  components: { Field: OffplanField },
  props: { open: { type: Boolean, default: false }, id: { type: [String, Number], default: null } },
  data() {
    return {
      form: { ...defaults },
      loadingData: false,
      saving: false,
      error: "",
      zones: [],
      owners: [],
      managers: [],
      zoneSearch: "",
      ownerSearch: "",
      managerSearch: "",
      amenityOptions: [
        { key: "is_furnished", label: "Furnished" }, { key: "has_maids_room", label: "Maid’s room" },
        { key: "has_study", label: "Study" }, { key: "has_central_or_ac_and_heating", label: "Central A/C & heating" },
        { key: "has_balcony", label: "Balcony" }, { key: "has_private_garden", label: "Private garden" },
        { key: "has_private_pool", label: "Private pool" }, { key: "has_private_gym", label: "Private gym" },
        { key: "has_private_jacuzzi", label: "Private jacuzzi" }, { key: "has_shared_pool", label: "Shared pool" },
        { key: "has_shared_spa", label: "Shared spa" }
      ]
    };
  },
  mounted() {
    if (this.open) this.initializeLookups();
  },
  watch: {
    open(value) {
      if (value) this.load();
    }
  },
  computed: {
    role() {
      return String(this.$getRole ? this.$getRole() : localStorage.getItem("role") || "tenant").trim().toLowerCase();
    },
    isElevatedUser() {
      return this.role === "superuser" || this.role === "super_staff";
    },
    canAccess() {
      return this.isElevatedUser || this.role === "owner";
    },
    filteredZones() {
      const q = this.zoneSearch.trim().toLowerCase();
      return q ? this.zones.filter(item => item.name.toLowerCase().includes(q)) : this.zones;
    },
    filteredOwners() {
      const q = this.ownerSearch.trim().toLowerCase();
      return q ? this.owners.filter(item => item.name.toLowerCase().includes(q)) : this.owners;
    },
    filteredManagers() {
      const q = this.managerSearch.trim().toLowerCase();
      return q ? this.managers.filter(item => item.name.toLowerCase().includes(q)) : this.managers;
    },
    ownerDisplayName() {
      const owner = this.owners.find(item => Number(item.id) === Number(this.form.owner));
      return owner?.name || (this.form.owner ? "Owner #" + this.form.owner : "Assigned owner");
    }
  },
  methods: {
    normalizeList(response, keys = []) {
      const raw = response?.data ?? response;
      if (Array.isArray(raw)) return raw;
      for (const key of keys) if (Array.isArray(raw?.[key])) return raw[key];
      return [];
    },
    normalizePerson(item) {
      const id = item?.id ?? item?.user_id ?? item?.owner_id ?? item?.manager_id;
      const name = item?.name || item?.full_name || [item?.first_name, item?.middle_name, item?.last_name].filter(Boolean).join(" ") || item?.username || item?.email || ("#" + id);
      return { id: Number(id), name: String(name).trim() };
    },
    normalizeZone(item) {
      const id = item?.id ?? item?.property_zone_id ?? item?.zone_id;
      const name = item?.name || item?.zone_name || item?.title || ("Zone #" + id);
      return { id: Number(id), name: String(name).trim() };
    },
    getLoggedInUserId() {
      const value = localStorage.getItem("userId") || localStorage.getItem("user_id") || localStorage.getItem("id");
      return value ? Number(value) : 0;
    },
    async initializeLookups() {
      if (!this.canAccess) return;
      this.loadingData = true;
      this.error = "";
      try {
        const zoneResponse = await this.$apiGet("/get_property_zones", { page: 1, page_size: 1000 });
        this.zones = this.normalizeList(zoneResponse, ["zones", "results"]).map(this.normalizeZone).filter(item => item.id);
        if (this.isElevatedUser) {
          const ownerResponse = await this.$apiGet("/get_owners", { page: 1, page_size: 1000 });
          const managerResponse = await this.$apiGet("/get_managers", { page: 1, page_size: 1000 });
          this.owners = this.normalizeList(ownerResponse, ["owners", "results"]).map(this.normalizePerson).filter(item => item.id);
          this.managers = this.normalizeList(managerResponse, ["managers", "results"]).map(this.normalizePerson).filter(item => item.id);
        } else {
          const ownerId = this.getLoggedInUserId();
          if (!ownerId) throw new Error("Unable to determine the logged-in owner.");
          this.form.owner = ownerId;
          const managerResponse = await this.$apiGet("/get_owner_managers", { owner_id: ownerId, page: 1, page_size: 1000 });
          this.managers = this.normalizeList(managerResponse, ["managers", "results"]).map(this.normalizePerson).filter(item => item.id);
        }
        await this.loadProperty();
      } catch (e) {
        this.error = e?.message || "Unable to load property zones, owners or managers.";
      } finally {
        this.loadingData = false;
      }
    },
    close() {
      if (!this.saving) this.$emit("close");
    },
    async loadProperty() {
      if (!this.id) return;
      const res = await this.$apiGetById("/get_offplan_property", this.id);
      const item = res?.data?.data || res?.data || res?.property || res;
      this.form = { ...defaults, ...item };
      if (!this.isElevatedUser) this.form.owner = this.getLoggedInUserId();
    },
    async load() {
      if (!this.canAccess || !this.id) return;
      await this.initializeLookups();
    },
    async submitForm() {
      if (!this.canAccess) return;
      if (!this.form.property_zone || !this.form.manager) {
        this.error = "Property zone and manager are required.";
        return;
      }
      if (!this.isElevatedUser) this.form.owner = this.getLoggedInUserId();
      if (!this.form.owner) {
        this.error = "Please select an owner.";
        return;
      }
      this.saving = true;
      this.error = "";
      try {
        await this.$apiPatch("/update_offplan_property", this.id, { ...this.form });
        this.$emit("saved");
        this.$emit("close");
      } catch (e) {
        this.error = e?.message || "Unable to update the offplan property.";
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #cbd5e1;
  padding: .625rem .75rem;
  outline: none;
  background: #fff;
  color: #0f172a;
  font-size: .875rem;
}
.input:focus {
  border-color: #5f5ffc;
  box-shadow: 0 0 0 2px rgba(95,95,252,.12);
}
</style>
