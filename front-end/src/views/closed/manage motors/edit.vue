<template>
  <Teleport to="body">
    <div class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6">
      <section class="motor-modal w-full max-w-3xl overflow-hidden bg-white shadow-2xl">
        <header class="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 px-5 py-5 text-white sm:px-7">
          <div class="pointer-events-none absolute -right-10 -top-16 h-40 w-40 border border-white/10"></div>
          <div class="relative flex items-start justify-between gap-4">
            <div><div class="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70"><span class="h-1.5 w-1.5 bg-white"></span> Motor management</div><h2 class="text-xl font-bold">Edit Motor</h2><p class="mt-1 text-sm text-white/75">{{ step === 1 ? 'Start with the motor details' : 'Assign the zone and manager' }}</p></div>
            <button type="button" @click="$emit('close')" aria-label="Close modal" class="grid h-9 w-9 place-items-center border border-white/25 text-xl transition hover:bg-white/15">&times;</button>
          </div>
          <div class="relative mt-6 grid grid-cols-2 gap-3">
            <div><div class="mb-2 flex items-center gap-2"><span class="step-dot" :class="step === 1 ? 'step-active' : 'step-done'">{{ step === 1 ? '1' : '✓' }}</span><span class="text-xs font-semibold">Motor details</span></div><div class="h-1 bg-white/20"><div class="h-full bg-white transition-all duration-300" :style="{ width: step === 1 ? '42%' : '100%' }"></div></div></div>
            <div><div class="mb-2 flex items-center gap-2"><span class="step-dot" :class="step === 2 ? 'step-active' : 'step-idle'">2</span><span class="text-xs font-semibold" :class="step === 2 ? 'text-white' : 'text-white/65'">Zone & manager</span></div><div class="h-1 bg-white/20"><div class="h-full bg-white transition-all duration-300" :style="{ width: step === 2 ? '100%' : '0%' }"></div></div></div>
          </div>
        </header>
        <form id="motorEditForm" @submit.prevent="step === 1 ? nextStep() : submit()" class="p-5 sm:p-7">
          <Transition name="step-slide" mode="out-in">
            <div v-if="step === 1" key="motor-details">
              <div class="mb-5"><h3 class="text-sm font-bold text-gray-800">Motor details</h3><p class="mt-1 text-xs text-gray-500">Fill in the identifying and basic information.</p></div>
              <div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <label class="field">Motor name <span class="required">*</span><input v-model.trim="form.name" required class="control" placeholder="e.g. Company pickup" /></label>
                <label class="field">Motor type <span class="required">*</span><select v-model="form.motor_type" required class="control"><option value="">Choose motor type</option><option v-for="type in motorTypes" :key="type" :value="type">{{ type }}</option></select></label>
                <label class="field">Brand<input v-model.trim="form.brand" class="control" placeholder="e.g. Toyota" /></label>
                <label class="field">Model<input v-model.trim="form.model" class="control" placeholder="e.g. Hilux" /></label>
                <label class="field">Registration number<input v-model.trim="form.registration_number" class="control" placeholder="Enter registration number" /></label>
                <label class="field">Year<input v-model.number="form.year" type="number" min="1900" max="2100" class="control" placeholder="e.g. 2024" /></label>
                <label class="field">Color<select v-model="form.color" class="control"><option value="">Choose a color</option><option v-for="color in colors" :key="color" :value="color">{{ color }}</option></select></label>
                <label class="field">Price<input v-model.number="form.price" type="number" min="0" step="0.01" class="control" placeholder="0.00" /></label>
                <label class="field sm:col-span-2">Description <span class="optional">Optional</span><textarea v-model.trim="form.description" rows="3" class="control resize-y" placeholder="Add any helpful notes about this motor..."></textarea></label>
              </div>
            </div>
            <div v-else key="zone-manager">
              <div class="mb-5"><h3 class="text-sm font-bold text-gray-800">Zone & manager assignment</h3><p class="mt-1 text-xs text-gray-500">Choose the property zone and responsible manager for this motor.</p></div>
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div class="choice-card">
                  <div class="mb-3 flex h-10 w-10 items-center justify-center bg-primary/10 text-primary"><i class="fas fa-map-marker-alt"></i></div>
                  <label for="zone-search" class="field">Property zone <span class="required">*</span></label>
                  <input id="zone-search" v-model="zoneSearch" type="search" class="control mb-2" placeholder="Search zones..." />
                  <select v-model.number="form.property_zone" required class="control"><option :value="0" disabled>Select a property zone</option><option v-for="zone in filteredZones" :key="zone.id" :value="Number(zone.id)">{{ zone.name || zone.zone_name || ('Zone #' + zone.id) }}</option></select>
                  <p class="mt-2 text-[11px] text-gray-500">The motor will be associated with this zone.</p>
                </div>
                <div class="choice-card">
                  <div class="mb-3 flex h-10 w-10 items-center justify-center bg-primary/10 text-primary"><i class="fas fa-user-tie"></i></div>
                  <label for="manager-search" class="field">Manager <span class="optional">Optional</span></label>
                  <input id="manager-search" v-model="managerSearch" type="search" class="control mb-2" placeholder="Search managers by name..." />
                  <select v-model.number="form.manager" class="control"><option :value="0">No manager assigned</option><option v-for="manager in filteredManagers" :key="manager.id" :value="Number(manager.id)">{{ managerLabel(manager) }}</option></select>
                  <p class="mt-2 text-[11px] text-gray-500">You can leave this as 0 if no manager is assigned yet.</p>
                </div>
              </div>
              <div class="mt-5 border border-primary/10 bg-primary/5 p-4"><p class="text-xs font-bold text-gray-800">Quick review</p><div class="mt-2 grid grid-cols-2 gap-3 text-xs"><div><span class="text-gray-500">Motor</span><p class="mt-1 font-semibold text-gray-800">{{ form.name || 'Not entered' }}</p></div><div><span class="text-gray-500">Type</span><p class="mt-1 font-semibold text-gray-800">{{ form.motor_type || 'Not selected' }}</p></div></div></div>
            </div>
          </Transition>
        </form>
        <footer class="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/80 px-5 py-4 sm:px-7">
          <button v-if="step === 2" type="button" @click="previousStep" class="btn-secondary"><i class="fas fa-arrow-left mr-2"></i>Previous</button>
          <button v-else type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <div class="flex items-center gap-2"><span class="mr-2 hidden text-xs text-gray-400 sm:inline">Step {{ step }} of 2</span><button form="motorEditForm" type="submit" :disabled="saving || loadingOptions" class="btn-primary">{{ step === 1 ? 'Next step' : (saving ? 'Saving…' : 'Save Changes') }}<i v-if="step === 1" class="fas fa-arrow-right ml-2"></i></button></div>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
<script>
const fields = ["name", "motor_type", "brand", "model", "registration_number", "year", "color", "price", "description", "property_zone", "manager"];
export default {
  name: "ManageMotorsEdit",
  props: { data: { type: Object, default: () => ({}) } },
  data: () => ({ step: 1, saving: false, loadingOptions: false, form: {}, zones: [], managers: [], zoneSearch: "", managerSearch: "", motorTypes: ["Motorcycle", "Car", "Truck", "Bus", "Van", "Tractor", "Other"], colors: ["Black", "White", "Silver", "Gray", "Red", "Blue", "Green", "Yellow", "Brown", "Orange", "Gold", "Other"] }),
  computed: {
    filteredZones() { const q = this.zoneSearch.trim().toLowerCase(); return this.zones.filter(z => !q || String(z.name || z.zone_name || "").toLowerCase().includes(q)); },
    filteredManagers() { const q = this.managerSearch.trim().toLowerCase(); return this.managers.filter(m => this.managerLabel(m).toLowerCase().includes(q) || String(m.manager?.email || m.email || "").toLowerCase().includes(q)); }
  },
  watch: { data: { immediate: true, handler(value) { this.form = Object.fromEntries(fields.map(key => [key, value?.[key] ?? (["year", "price"].includes(key) ? null : key === "property_zone" || key === "manager" ? 0 : "")])); this.step = 1; } } },
  async mounted() { await this.loadOptions(); },
  methods: {
    managerLabel(manager) { const person = manager?.manager || manager?.user || manager; const name = [person?.first_name, person?.middle_name, person?.last_name].filter(Boolean).join(" "); return name || person?.email || manager?.email || ('Manager #' + manager?.id); },
    async loadOptions() {
      this.loadingOptions = true;
      try { const [zoneResult, managerResult] = await Promise.all([this.$getZones(), this.$getManagers("")]); this.zones = zoneResult?.zones || []; this.managers = managerResult?.managers || []; }
      catch (error) { console.error("Failed to load motor zone/manager options:", error); this.$root.$refs.toast?.showToast("Could not load zones or managers", "error"); }
      finally { this.loadingOptions = false; }
    },
    nextStep() { if (!this.form.name || !this.form.motor_type) return; this.step = 2; },
    previousStep() { this.step = 1; },
    async submit() {
      if (!this.data?.id) return;
      if (!Number(this.form.property_zone)) { this.$root.$refs.toast?.showToast("Please select a property zone", "error"); return; }
      this.saving = true;
      try {
        const payload = { ...this.form, property_zone: Number(this.form.property_zone) || 0, manager: Number(this.form.manager) || 0 };
        const result = await this.$apiPatch("/update_motor_property", this.data.id, payload);
        if (result?.error) throw new Error(typeof result.error === "string" ? result.error : "Could not save motor.");
        this.$root.$refs.toast?.showToast("Motor updated successfully", "success"); this.$emit("refresh"); this.$emit("close");
      } catch (error) { this.$root.$refs.toast?.showToast(error?.message || "Failed to save motor", "error"); }
      finally { this.saving = false; }
    }
  }
};
</script>
<style scoped>
.modal-backdrop { background: rgba(15, 23, 42, .58); backdrop-filter: blur(5px); animation: backdrop-in .18s ease-out; }
.motor-modal { animation: modal-in .24s cubic-bezier(.2,.75,.25,1); border: 1px solid rgba(255,255,255,.65); }
.field { display:block; color:#374151; font-size:12px; font-weight:650; }
.control { display:block; width:100%; margin-top:7px; border:1px solid #e2e8f0; background:#fff; padding:10px 12px; color:#1f2937; font-size:13px; font-weight:400; outline:none; transition:border-color .18s, box-shadow .18s, background .18s; }
.control:focus { border-color:var(--color-primary, #64748b); box-shadow:0 0 0 3px rgba(100,116,139,.12); background:#fff; }
.required { color:#dc2626; }
.optional { margin-left:4px; color:#9ca3af; font-size:10px; font-weight:500; }
.choice-card { border:1px solid #e8edf3; background:linear-gradient(145deg,#fff,#fafbfd); padding:18px; transition:border-color .2s, box-shadow .2s; }
.choice-card:focus-within { border-color:#cbd5e1; box-shadow:0 8px 24px rgba(15,23,42,.045); }
.step-dot { display:inline-flex; height:25px; width:25px; flex-shrink:0; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,.45); font-size:11px; font-weight:700; }
.step-active,.step-done { background:#fff; color:#334155; }
.step-idle { color:#fff; opacity:.72; }
.btn-primary { background:var(--color-primary,#334155); padding:10px 17px; color:#fff; font-size:12px; font-weight:700; transition:transform .18s,filter .18s; }
.btn-primary:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); }
.btn-primary:disabled { opacity:.5; cursor:not-allowed; }
.btn-secondary { border:1px solid #e2e8f0; background:#fff; padding:10px 16px; color:#475569; font-size:12px; font-weight:650; transition:background .18s; }
.btn-secondary:hover { background:#f1f5f9; }
.step-slide-enter-active,.step-slide-leave-active { transition:opacity .16s ease,transform .16s ease; }
.step-slide-enter-from { opacity:0; transform:translateX(12px); }
.step-slide-leave-to { opacity:0; transform:translateX(-12px); }
@keyframes modal-in { from { opacity:0; transform:translateY(10px) scale(.99); } to { opacity:1; transform:translateY(0) scale(1); } }
@keyframes backdrop-in { from { opacity:0; } to { opacity:1; } }
@media (prefers-reduced-motion: reduce) { .modal-backdrop,.motor-modal { animation:none; } .step-slide-enter-active,.step-slide-leave-active { transition:none; } }
</style>
