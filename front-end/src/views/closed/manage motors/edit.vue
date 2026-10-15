<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <section class="my-6 w-full max-w-3xl overflow-hidden bg-white shadow-xl">
        <header class="flex items-center justify-between border-b border-primary/10 bg-primary/5 px-6 py-4">
          <div><h2 class="text-base font-bold text-primary">Edit Motor</h2><p class="mt-0.5 text-xs text-gray-500">Update motor property information</p></div>
          <button type="button" @click="$emit('close')" class="px-3 py-1 text-xl text-gray-500 hover:bg-primary/10">&times;</button>
        </header>
        <form id="motorEditForm" @submit.prevent="submit" class="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <label class="field">Name *<input v-model.trim="form.name" required class="control" /></label>
          <label class="field">Motor type *
            <select v-model="form.motor_type" required class="control"><option value="">Select motor type</option><option v-for="type in motorTypes" :key="type" :value="type">{{ type }}</option></select>
          </label>
          <label class="field">Brand<input v-model.trim="form.brand" class="control" /></label>
          <label class="field">Model<input v-model.trim="form.model" class="control" /></label>
          <label class="field">Registration number<input v-model.trim="form.registration_number" class="control" /></label>
          <label class="field">Year<input v-model.number="form.year" type="number" min="1900" class="control" /></label>
          <label class="field">Color
            <select v-model="form.color" class="control"><option value="">Select color</option><option v-for="color in colors" :key="color" :value="color">{{ color }}</option></select>
          </label>
          <label class="field">Price<input v-model.number="form.price" type="number" min="0" step="0.01" class="control" /></label>
          <div class="field">
            <label for="motor-zone-search-edit">Zone *</label>
            <input id="motor-zone-search-edit" v-model="zoneSearch" type="search" placeholder="Search zones..." class="control" />
            <select v-model="form.property_zone_id" required class="control"><option value="">Select zone</option><option v-for="zone in filteredZones" :key="zone.id" :value="zone.id">{{ zone.name || zone.zone_name || ('Zone #' + zone.id) }}</option></select>
          </div>
          <div class="field">
            <label for="motor-manager-search-edit">Manager</label>
            <input id="motor-manager-search-edit" v-model="managerSearch" type="search" placeholder="Search managers..." class="control" />
            <select v-model="form.manager_id" class="control"><option value="">No manager selected</option><option v-for="manager in filteredManagers" :key="manager.id" :value="manager.id">{{ managerLabel(manager) }}</option></select>
          </div>
          <label class="field sm:col-span-2">Description<textarea v-model.trim="form.description" rows="3" class="control"></textarea></label>
        </form>
        <footer class="flex justify-end gap-3 border-t border-primary/10 bg-primary/5 px-6 py-4">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button form="motorEditForm" type="submit" :disabled="saving" class="btn-primary">{{ saving ? 'Saving…' : 'Save Changes' }}</button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
<script>
const fields = ["name", "motor_type", "brand", "model", "registration_number", "year", "color", "price", "description", "property_zone_id", "manager_id"];
export default {
  name: "ManageMotorsEdit",
  props: { data: { type: Object, default: () => ({}) } },
  data: () => ({ saving: false, loadingOptions: false, form: {}, zones: [], managers: [], zoneSearch: "", managerSearch: "", motorTypes: ["Motorcycle", "Car", "Truck", "Bus", "Van", "Tractor", "Other"], colors: ["Black", "White", "Silver", "Gray", "Red", "Blue", "Green", "Yellow", "Brown", "Orange", "Gold", "Other"] }),
  computed: {
    filteredZones() { const q = this.zoneSearch.trim().toLowerCase(); return this.zones.filter(z => !q || String(z.name || z.zone_name || "").toLowerCase().includes(q)); },
    filteredManagers() { const q = this.managerSearch.trim().toLowerCase(); return this.managers.filter(m => this.managerLabel(m).toLowerCase().includes(q) || String(m.manager?.email || m.email || "").toLowerCase().includes(q)); }
  },
  watch: { data: { immediate: true, handler(value) { this.form = Object.fromEntries(fields.map(key => [key, value?.[key] ?? (["year", "price"].includes(key) ? null : "")])); } } },
  async mounted() { await this.loadOptions(); },
  methods: {
    managerLabel(manager) {
      const person = manager?.manager || manager?.user || manager;
      const name = [person?.first_name, person?.middle_name, person?.last_name].filter(Boolean).join(" ");
      return name || person?.email || manager?.email || ('Manager #' + manager?.id);
    },
    async loadOptions() {
      this.loadingOptions = true;
      try {
        const [zoneResult, managerResult] = await Promise.all([this.$getZones(), this.$getManagers("")]);
        this.zones = zoneResult?.zones || [];
        this.managers = managerResult?.managers || [];
      } catch (error) {
        console.error("Failed to load motor zone/manager options:", error);
        this.$root.$refs.toast?.showToast("Could not load zones or managers", "error");
      } finally { this.loadingOptions = false; }
    },
    async submit() {
      if (!this.data?.id) return;
      this.saving = true;
      try {
        const payload = { ...this.form, property_zone_id: this.form.property_zone_id || null, manager_id: this.form.manager_id || null };
        const result = await this.$apiPatch("/update_motor_property", this.data.id, payload);
        if (result?.error) throw new Error(typeof result.error === "string" ? result.error : "Could not update motor.");
        this.$root.$refs.toast?.showToast("Motor updated successfully", "success");
        this.$emit("refresh"); this.$emit("close");
      } catch (error) {
        this.$root.$refs.toast?.showToast(error?.message || "Failed to update motor", "error");
      } finally { this.saving = false; }
    }
  }
};
</script>
<style scoped>
.field { @apply block text-xs font-semibold text-gray-700; }
.control { @apply mt-1 block w-full border border-primary/20 px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary; }
.btn-primary { @apply bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50; }
.btn-secondary { @apply border border-primary/20 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-primary/10; }
</style>
