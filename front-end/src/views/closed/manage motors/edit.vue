<template>
  <Teleport to="body">
    <div class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-5">
      <section class="motor-modal w-full max-w-3xl overflow-hidden bg-white shadow-xl">
        <header class="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Edit Motor</h2>
            <p class="mt-1 text-xs text-gray-500">Enter the motor information below.</p>
          </div>
          <button type="button" @click="$emit('close')" aria-label="Close modal" class="grid h-9 w-9 place-items-center border border-gray-300 text-xl text-gray-600 hover:bg-gray-100">&times;</button>
        </header>
        <form id="motorEditForm" @submit.prevent="step === 1 ? nextStep() : submit()" class="max-h-[75vh] overflow-y-auto px-5 py-5 sm:px-6">
          <div class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div v-if="step === 1" class="contents">
              <label class="field">Motor name <span class="required">*</span><input v-model.trim="form.name" required class="control" placeholder="Motor name" /></label>
              <label class="field">Motor subtype <span class="required">*</span><select v-model="form.motor_type" required class="control"><option value="">Select motor subtype</option><option v-for="type in motorTypes" :key="type" :value="type">{{ type }}</option></select></label>
              <label class="field">Motor type <span class="required">*</span><select v-model="form.property_type" required class="control"><option value="" disabled>Select motor type</option><option v-for="type in propertyTypes" :key="type" :value="type">{{ type }}</option></select></label>
              <label class="field">Usage <span class="required">*</span><select v-model="form.usage" required class="control"><option value="" disabled>Select usage</option><option value="new">New</option><option value="used">Used</option></select></label>
              <label class="field sm:col-span-2">Location <span class="required">*</span><input v-model.trim="form.location" required class="control" placeholder="Enter motor location" /></label>
            </div>
            <div v-else class="contents">
            
            
            
            
            
            <label class="field">Brand<input v-model.trim="form.brand" class="control" placeholder="e.g. Toyota" /></label>
            <label class="field">Model<input v-model.trim="form.model" class="control" placeholder="e.g. Hilux" /></label>
            <label class="field">Registration number<input v-model.trim="form.registration_number" class="control" placeholder="Registration number" /></label>
            <label class="field">Year<input v-model.number="form.year" type="number" min="1900" max="2100" class="control" placeholder="e.g. 2024" /></label>
            <label class="field">Color<select v-model="form.color" class="control"><option value="">Select color</option><option v-for="color in colors" :key="color" :value="color">{{ color }}</option></select></label>
            <label class="field">Price<input v-model.number="form.price" type="number" min="0" step="0.01" class="control" placeholder="0.00" /></label>
            <label class="field">Property zone <span class="required">*</span><select v-model.number="form.property_zone" required class="control"><option :value="0" disabled>Select a zone</option><option v-for="zone in zones" :key="zone.id" :value="Number(zone.id)">{{ zone.name || zone.zone_name || ('Zone #' + zone.id) }}</option></select></label>
            <label class="field">Manager <span class="optional">Optional</span><select v-model.number="form.manager" class="control"><option :value="0">No manager assigned</option><option v-for="manager in managers" :key="manager.id" :value="Number(manager.id)">{{ managerLabel(manager) }}</option></select></label>
            <label class="field sm:col-span-2">Description <span class="optional">Optional</span><textarea v-model.trim="form.description" rows="2" class="control resize-y" placeholder="Additional details (optional)"></textarea></label>
            <label class="field sm:col-span-2">Motor image <span class="optional">Optional</span><input type="file" accept="image/*" class="control" @change="onImageChange" /><span class="mt-1 block text-xs font-normal text-gray-500">Choose an image to add or replace the motor picture.</span><img v-if="imagePreview || currentImageUrl" :src="imagePreview || currentImageUrl" alt="Motor image preview" class="mt-2 h-36 max-w-full rounded object-cover" /></label>
            </div>
          </div>
        </form>
        <footer class="flex items-center justify-between border-t border-gray-200 px-5 py-4 sm:px-6">
          <button v-if="step === 1" type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button v-else type="button" @click="previousStep" class="btn-secondary"><i class="fas fa-arrow-left mr-2"></i>Previous</button>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-500">Step {{ step }} of 2</span>
            <button v-if="step === 1" form="motorEditForm" type="submit" :disabled="saving || loadingOptions" class="btn-primary">Next <i class="fas fa-arrow-right ml-2"></i></button>
            <button v-else form="motorEditForm" type="submit" :disabled="saving || loadingOptions" class="btn-primary">{{ saving ? "Saving…" : "Save Changes" }}</button>
          </div>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
<script>
const fields = ["name", "motor_type", "property_type", "usage", "location", "brand", "model", "registration_number", "year", "color", "price", "description", "property_zone", "manager"];
export default {
  name: "ManageMotorsEdit",
  props: { data: { type: Object, default: () => ({}) } },
  data: () => ({ step: 1, saving: false, loadingOptions: false, selectedImage: null, imagePreview: "", form: {}, zones: [], managers: [], propertyTypes: ["car", "motorcycle", "heavy_vehicle", "boat", "auto_accessories_parts", "export_cars"], zoneSearch: "", managerSearch: "", motorTypes: ["Motorcycle", "Car", "Truck", "Bus", "Van", "Tractor", "Other"], colors: ["Black", "White", "Silver", "Gray", "Red", "Blue", "Green", "Yellow", "Brown", "Orange", "Gold", "Other"] }),
  computed: {
    currentPicture() { const value = this.data?.pictures || this.data?.motor_property_pictures || this.data?.images || this.data?.motor_property_picture; return Array.isArray(value) ? value[0] : value || null; },
    currentImageUrl() { const picture = this.currentPicture; return picture?.image || picture?.url || picture?.image_url || picture?.picture || this.data?.image || this.data?.image_url || ""; },
    filteredZones() { const q = this.zoneSearch.trim().toLowerCase(); return this.zones.filter(z => !q || String(z.name || z.zone_name || "").toLowerCase().includes(q)); },
    filteredManagers() { const q = this.managerSearch.trim().toLowerCase(); return this.managers.filter(m => this.managerLabel(m).toLowerCase().includes(q) || String(m.manager?.email || m.email || "").toLowerCase().includes(q)); }
  },
  watch: { data: { immediate: true, handler(value) { this.form = Object.fromEntries(fields.map(key => { let current = value?.[key]; if (key === "property_zone") current = current ?? value?.property_zone_id ?? value?.zone?.id; if (key === "manager") current = current ?? value?.manager_id ?? value?.manager?.id; if (current && typeof current === "object") current = current.id; return [key, current ?? (["year", "price"].includes(key) ? null : key === "property_zone" || key === "manager" ? 0 : "")]; })); this.step = 1; } } },
  async mounted() { await this.loadOptions(); },
  methods: {
    managerLabel(manager) { const person = manager?.manager || manager?.user || manager; const name = [person?.first_name, person?.middle_name, person?.last_name].filter(Boolean).join(" "); return name || person?.email || manager?.email || ('Manager #' + manager?.id); },
    async loadOptions() {
      this.loadingOptions = true;
      try { const [zoneResult, managerResult] = await Promise.all([this.$getZones(), this.$getManagers("")]); this.zones = zoneResult?.zones || []; this.managers = managerResult?.managers || []; }
      catch (error) { console.error("Failed to load motor zone/manager options:", error); this.$root.$refs.toast?.showToast("Could not load zones or managers", "error"); }
      finally { this.loadingOptions = false; }
    },
    onImageChange(event) { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith("image/")) { this.$root.$refs.toast?.showToast("Please select an image file", "error"); event.target.value = ""; return; } this.selectedImage = file; if (this.imagePreview) URL.revokeObjectURL(this.imagePreview); this.imagePreview = URL.createObjectURL(file); },
    async uploadImage() { if (!this.selectedImage || !this.data?.id) return; const fd = new FormData(); fd.append("description", this.form.description || ""); fd.append("motor_property", String(this.data.id)); fd.append("image", this.selectedImage); const pictureId = this.currentPicture?.id; if (pictureId) await this.$apiPut("/update_motor_property_picture", pictureId, fd, { "Content-Type": "multipart/form-data" }); else await this.$apiPost("/post_motor_property_picture", fd, { "Content-Type": "multipart/form-data" }); },
    nextStep() {
      if (!this.form.name || !this.form.motor_type || !this.form.property_type || !this.form.usage || !this.form.location) return;
      this.step = 2;
    },
    previousStep() { if (this.step > 1) this.step = 1; },
    async submit() {
      if (!this.data?.id) return;
      if (!Number(this.form.property_zone)) { this.$root.$refs.toast?.showToast("Please select a property zone", "error"); return; }
      this.saving = true;
      try {
        const payload = { ...this.form, property_type: this.form.property_type, property_zone: Number(this.form.property_zone) || 0, manager: Number(this.form.manager) || 0 };
        const result = await this.$apiPatch("/update_motor_property", this.data.id, payload);
        if (result?.error) throw new Error(typeof result.error === "string" ? result.error : "Could not save motor.");
        if (this.selectedImage) await this.uploadImage();
        this.$root.$refs.toast?.showToast("Motor updated successfully", "success"); this.$emit("refresh"); this.$emit("close");
      } catch (error) { this.$root.$refs.toast?.showToast(error?.message || "Failed to save motor", "error"); }
      finally { this.saving = false; }
    }
  }
};
</script>
<style scoped>
.modal-backdrop { background:rgba(15,23,42,.48); backdrop-filter:blur(3px); }
.motor-modal { border:1px solid #cbd5e1; border-radius:6px; }
.field { display:block; color:#374151; font-size:12px; font-weight:600; }
.control { display:block; width:100%; margin-top:6px; border:1px solid #9ca3af; border-radius:4px; background:#fff; padding:9px 11px; color:#111827; font-size:13px; font-weight:400; outline:none; box-shadow:inset 0 1px 2px rgba(15,23,42,.04); transition:border-color .15s,box-shadow .15s; }
.control::placeholder { color:#9ca3af; }
.control:focus { border-color:#4b5563; box-shadow:0 0 0 2px rgba(75,85,99,.16); }
.required { color:#dc2626; }
.optional { margin-left:4px; color:#6b7280; font-size:10px; font-weight:500; }
.btn-primary { border:1px solid #374151; border-radius:4px; background:#374151; padding:9px 16px; color:#fff; font-size:12px; font-weight:700; }
.btn-primary:hover:not(:disabled) { background:#1f2937; }
.btn-primary:disabled { opacity:.55; cursor:not-allowed; }
.btn-secondary { border:1px solid #9ca3af; border-radius:4px; background:#fff; padding:9px 16px; color:#374151; font-size:12px; font-weight:600; }
.btn-secondary:hover { background:#f3f4f6; }
</style>
