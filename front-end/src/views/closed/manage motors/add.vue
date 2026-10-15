<template>
  <Teleport to="body">
    <div class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6">
      <section class="motor-modal w-full max-w-3xl overflow-hidden bg-white shadow-2xl">
        <header class="border-b border-gray-100 bg-white px-5 py-5 sm:px-7">
          <div class="flex items-start justify-between gap-4">
            <div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Motor management</p><h2 class="mt-1 text-xl font-semibold tracking-tight text-gray-900">Add Motor</h2><p class="mt-1 text-sm text-gray-500">{{ step === 1 ? 'Enter the basic motor information' : step === 2 ? 'Choose the zone and manager' : 'Add a description and review' }}</p></div>
            <button type="button" @click="$emit('close')" aria-label="Close modal" class="grid h-9 w-9 shrink-0 place-items-center border border-gray-200 text-xl text-gray-500 transition hover:bg-gray-50 hover:text-gray-900">&times;</button>
          </div>
          <div class="mt-6 grid grid-cols-3 gap-3">
            <div v-for="item in [{ n: 1, label: 'Motor details' }, { n: 2, label: 'Assignment' }, { n: 3, label: 'Description' }]" :key="item.n">
              <div class="mb-2 flex items-center gap-2"><span class="step-dot" :class="step === item.n ? 'step-active' : step > item.n ? 'step-done' : 'step-idle'">{{ step > item.n ? '✓' : item.n }}</span><span class="text-[11px] font-medium" :class="step === item.n ? 'text-gray-900' : 'text-gray-400'">{{ item.label }}</span></div>
              <div class="h-1 bg-gray-100"><div class="h-full bg-gray-700 transition-all duration-300" :style="{ width: step >= item.n ? '100%' : '0%' }"></div></div>
            </div>
          </div>
        </header>
        <form id="motorAddForm" @submit.prevent="step < 3 ? nextStep() : submit()" class="p-5 sm:p-7">
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
              </div>
            </div>
            <div v-else-if="step === 2" key="zone-manager">
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
            <div v-else key="description">
              <div class="mb-5"><h3 class="text-sm font-semibold text-gray-900">Description & review</h3><p class="mt-1 text-xs text-gray-500">Add any extra details that will help identify or manage this motor.</p></div>
              <label class="field">Description <span class="optional">Optional</span><textarea v-model.trim="form.description" rows="6" class="control resize-y" placeholder="Add helpful notes about condition, purpose, or other details..."></textarea></label>
              <div class="mt-5 border border-gray-100 bg-gray-50 p-4">
                <p class="text-xs font-semibold text-gray-800">Review before saving</p>
                <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div><dt class="text-gray-400">Motor</dt><dd class="mt-1 font-medium text-gray-800">{{ form.name || 'Not entered' }}</dd></div>
                  <div><dt class="text-gray-400">Type</dt><dd class="mt-1 font-medium text-gray-800">{{ form.motor_type || 'Not selected' }}</dd></div>
                  <div><dt class="text-gray-400">Zone</dt><dd class="mt-1 font-medium text-gray-800">{{ zones.find(z => Number(z.id) === Number(form.property_zone))?.name || zones.find(z => Number(z.id) === Number(form.property_zone))?.zone_name || 'Selected zone' }}</dd></div>
                  <div><dt class="text-gray-400">Manager</dt><dd class="mt-1 font-medium text-gray-800">{{ Number(form.manager) ? (managers.find(m => Number(m.id) === Number(form.manager)) ? managerLabel(managers.find(m => Number(m.id) === Number(form.manager))) : 'Selected manager') : 'Not assigned' }}</dd></div>
                </dl>
              </div>
            </div>
          </Transition>
        </form>
        <footer class="flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:px-7">
          <button v-if="step > 1" type="button" @click="previousStep" class="btn-secondary"><i class="fas fa-arrow-left mr-2"></i>Previous</button>
          <button v-else type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <div class="flex items-center gap-2"><span class="mr-2 hidden text-xs text-gray-400 sm:inline">Step {{ step }} of 3</span><button form="motorAddForm" type="submit" :disabled="saving || loadingOptions" class="btn-primary">{{ step < 3 ? 'Next step' : (saving ? 'Saving…' : 'Add Motor') }}<i v-if="step < 3" class="fas fa-arrow-right ml-2"></i></button></div>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
<script>
const blankForm = () => ({ name: "", motor_type: "", brand: "", model: "", registration_number: "", year: null, color: "", price: null, description: "", property_zone: 0, manager: 0 });
export default {
  name: "ManageMotorsAdd",
  
  data: () => ({ step: 1, saving: false, loadingOptions: false, form: blankForm(), zones: [], managers: [], zoneSearch: "", managerSearch: "", motorTypes: ["Motorcycle", "Car", "Truck", "Bus", "Van", "Tractor", "Other"], colors: ["Black", "White", "Silver", "Gray", "Red", "Blue", "Green", "Yellow", "Brown", "Orange", "Gold", "Other"] }),
  computed: {
    filteredZones() { const q = this.zoneSearch.trim().toLowerCase(); return this.zones.filter(z => !q || String(z.name || z.zone_name || "").toLowerCase().includes(q)); },
    filteredManagers() { const q = this.managerSearch.trim().toLowerCase(); return this.managers.filter(m => this.managerLabel(m).toLowerCase().includes(q) || String(m.manager?.email || m.email || "").toLowerCase().includes(q)); }
  },
  
  async mounted() { await this.loadOptions(); },
  methods: {
    managerLabel(manager) { const person = manager?.manager || manager?.user || manager; const name = [person?.first_name, person?.middle_name, person?.last_name].filter(Boolean).join(" "); return name || person?.email || manager?.email || ('Manager #' + manager?.id); },
    async loadOptions() {
      this.loadingOptions = true;
      try { const [zoneResult, managerResult] = await Promise.all([this.$getZones(), this.$getManagers("")]); this.zones = zoneResult?.zones || []; this.managers = managerResult?.managers || []; }
      catch (error) { console.error("Failed to load motor zone/manager options:", error); this.$root.$refs.toast?.showToast("Could not load zones or managers", "error"); }
      finally { this.loadingOptions = false; }
    },
    nextStep() {
      if (this.step === 1) {
        if (!this.form.name || !this.form.motor_type) return;
        this.step = 2;
        return;
      }
      if (this.step === 2) {
        if (!Number(this.form.property_zone)) { this.$root.$refs.toast?.showToast("Please select a property zone", "error"); return; }
        this.step = 3;
      }
    },
    previousStep() { if (this.step > 1) this.step -= 1; },
    async submit() {
      
      if (!Number(this.form.property_zone)) { this.$root.$refs.toast?.showToast("Please select a property zone", "error"); return; }
      this.saving = true;
      try {
        const payload = { ...this.form, property_zone: Number(this.form.property_zone) || 0, manager: Number(this.form.manager) || 0 };
        const result = await this.$apiPost("/post_motor_property", payload);
        if (result?.error) throw new Error(typeof result.error === "string" ? result.error : "Could not save motor.");
        this.$root.$refs.toast?.showToast("Motor added successfully", "success"); this.$emit("refresh"); this.$emit("close");
      } catch (error) { this.$root.$refs.toast?.showToast(error?.message || "Failed to save motor", "error"); }
      finally { this.saving = false; }
    }
  }
};
</script>
<style scoped>
.modal-backdrop { background: rgba(15, 23, 42, .48); backdrop-filter: blur(4px); animation: backdrop-in .18s ease-out; }
.motor-modal { animation: modal-in .24s cubic-bezier(.2,.75,.25,1); border: 1px solid #e5e7eb; }
.field { display:block; color:#374151; font-size:12px; font-weight:650; }
.control { display:block; width:100%; margin-top:7px; border:1px solid #e2e8f0; background:#fff; padding:10px 12px; color:#1f2937; font-size:13px; font-weight:400; outline:none; transition:border-color .18s, box-shadow .18s, background .18s; }
.control:focus { border-color:var(--color-primary, #64748b); box-shadow:0 0 0 3px rgba(100,116,139,.12); background:#fff; }
.required { color:#dc2626; }
.optional { margin-left:4px; color:#9ca3af; font-size:10px; font-weight:500; }
.choice-card { border:1px solid #e8edf3; background:#fff; padding:18px; transition:border-color .2s, box-shadow .2s; }
.choice-card:focus-within { border-color:#cbd5e1; box-shadow:0 8px 24px rgba(15,23,42,.045); }
.step-dot { display:inline-flex; height:25px; width:25px; flex-shrink:0; align-items:center; justify-content:center; border:1px solid #e5e7eb; font-size:11px; font-weight:700; color:#9ca3af; background:#fff; }
.step-active,.step-done { border-color:#374151; background:#374151; color:#fff; }
.step-idle { color:#9ca3af; background:#fff; }
.btn-primary { background:#374151; padding:10px 17px; color:#fff; font-size:12px; font-weight:700; transition:transform .18s,filter .18s; }
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
