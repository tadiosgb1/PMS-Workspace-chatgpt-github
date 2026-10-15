<template>
  <div class="min-h-screen bg-background p-4 text-sm md:p-6">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading motors..." />
    <div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div><h1 class="text-xl font-black tracking-tight text-primary">Manage Motors</h1><p class="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Motor property records</p></div>
      <button @click="addVisible = true" class="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary/90"><i class="fas fa-plus"></i> Add Motor</button>
    </div>
    <section class="mb-4 border border-primary/10 bg-white">
      <div class="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
        <input v-model="search" @input="fetchMotors" type="search" placeholder="Search motors..." class="w-full max-w-sm border border-primary/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        <div class="text-xs text-gray-500 sm:ml-auto">{{ filteredMotors.length }} record(s)</div>
      </div>
      <form @submit.prevent="applyFilters" class="p-4">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div><h2 class="text-sm font-bold text-gray-800">Filter motors</h2><p class="mt-1 text-xs text-gray-500">Combine filters to narrow the results. List filters accept comma-separated values.</p></div>
          <div class="flex flex-wrap gap-2">
            <button type="button" @click="showAdvancedFilters = true" class="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"><i class="fas fa-sliders-h"></i> More filters <span v-if="advancedFilterCount" class="bg-primary px-1.5 py-0.5 text-[10px] text-white">{{ advancedFilterCount }}</span></button>
            <button type="button" @click="clearFilters" class="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">Clear filters</button>
            <button type="submit" class="bg-primary px-4 py-2 text-xs font-bold text-white hover:opacity-90">Apply filters</button>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <label class="block min-w-0"><span class="mb-1.5 block text-xs font-semibold text-gray-600">Property zone</span><select v-model="filters.property_zone" class="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="">All property zones</option><option v-for="zone in propertyZones" :key="optionValue(zone)" :value="optionValue(zone)">{{ optionLabel(zone) }}</option></select></label>
          <div v-if="isSuperRole" class="relative block min-w-0"><label for="motor-owner-search" class="mb-1.5 block text-xs font-semibold text-gray-600">Owner</label><input id="motor-owner-search" v-model="ownerSearch" @input="searchOwners" @focus="ownerDropdownOpen = !!ownerSearch.trim()" @blur="closeOwnerDropdown" @keydown.esc="ownerDropdownOpen = false" autocomplete="off" placeholder="Search and select owner..." class="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary" /><div v-if="ownerDropdownOpen && ownerSearch.trim() && owners.length" class="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto border border-gray-200 bg-white shadow-xl"><button v-for="person in owners" :key="optionValue(person)" type="button" @mousedown.prevent="selectOwner(person)" class="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm hover:bg-primary/5 last:border-b-0">{{ optionLabel(person) }}</button></div><p v-if="filters.owner" class="mt-1 text-xs text-gray-500">Selected: {{ selectedOwnerLabel }}</p></div>
          <div v-else-if="isOwnerOrStaff" class="relative block min-w-0"><label for="motor-manager-search" class="mb-1.5 block text-xs font-semibold text-gray-600">Manager</label><input id="motor-manager-search" v-model="managerSearch" @input="searchManagers" @focus="managerDropdownOpen = !!managerSearch.trim()" @blur="closeManagerDropdown" @keydown.esc="managerDropdownOpen = false" autocomplete="off" placeholder="Search and select manager..." class="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary" /><div v-if="managerDropdownOpen && managerSearch.trim() && managers.length" class="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto border border-gray-200 bg-white shadow-xl"><button v-for="person in managers" :key="optionValue(person)" type="button" @mousedown.prevent="selectManager(person)" class="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm hover:bg-primary/5 last:border-b-0">{{ optionLabel(person) }}</button></div><p v-if="filters.manager" class="mt-1 text-xs text-gray-500">Selected: {{ selectedManagerLabel }}</p></div>
          <label v-for="field in visibleFilterFields" :key="field.key" class="block min-w-0">
            <span class="mb-1.5 block text-xs font-semibold text-gray-600">{{ field.label }}</span>
            <select v-if="field.key === 'usage'" v-model="filters.usage" class="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="">All usages</option><option v-for="usage in usageOptions" :key="usage" :value="usage">{{ usage }}</option></select>
            <select v-else-if="field.key === 'usage__in'" v-model="usageSelect" @change="syncUsageFilter" class="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="">Add usage...</option><option v-for="usage in usageOptions" :key="usage" :value="usage">{{ usage }}</option></select>
            <input v-if="field.key === 'usage__in'" v-model="filters.usage__in" type="text" placeholder="new, used" class="mt-2 w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary" />
            <input v-else-if="field.key !== 'usage' && field.key !== 'usage__in'" v-model="filters[field.key]" :type="field.type || 'text'" :step="field.type === 'number' ? 'any' : undefined" :placeholder="field.placeholder || field.label" class="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            <span v-if="field.key === 'usage__in'" class="mt-1 block text-[11px] text-gray-500">Choose multiple usages from the dropdown or type comma-separated values.</span>
          </label>
        </div>
        <div v-if="showAdvancedFilters" class="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/50 p-4" @click.self="showAdvancedFilters = false">
          <section class="max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-gray-200 bg-white shadow-2xl">
            <header class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4"><div><h3 class="text-base font-bold text-gray-900"><i class="fas fa-sliders-h mr-2 text-primary"></i>Advanced motor filters</h3><p class="mt-1 text-xs text-gray-500">Narrow results with exact matches, ranges and location filters.</p></div><button type="button" @click="showAdvancedFilters = false" class="px-3 py-2 text-xl text-gray-500 hover:bg-gray-100" aria-label="Close filters">&times;</button></header>
            <div class="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <label v-for="field in advancedFilterFields" :key="field.key" class="block min-w-0"><span class="mb-1.5 block text-xs font-semibold text-gray-600">{{ field.label }}</span><template v-if="field.key === 'usage__in'"><div class="relative"><button type="button" @focus="usageDropdownOpen = true" @click="usageDropdownOpen = true" @blur="closeUsageDropdown" @keydown.esc="usageDropdownOpen = false" class="flex w-full items-center justify-between border border-gray-300 bg-white px-3 py-2.5 text-left text-sm outline-none focus:border-primary"><span>{{ usageSelect || 'Select usage...' }}</span><i class="fas fa-chevron-down text-xs text-gray-400"></i></button><div v-if="usageDropdownOpen" class="absolute left-0 right-0 top-full z-50 mt-1 border border-gray-200 bg-white shadow-xl"><button v-for="usage in usageOptions" :key="usage" type="button" @mousedown.prevent="chooseUsage(usage)" class="block w-full px-3 py-2 text-left text-sm hover:bg-primary/5">{{ usage }}</button></div></div><input v-model="filters.usage__in" type="text" :placeholder="field.placeholder || field.label" class="mt-2 w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" /><span class="mt-1 block text-[11px] text-gray-500">Choose usages from the dropdown or enter comma-separated values.</span></template><input v-else v-model="filters[field.key]" :type="field.type || 'text'" :step="field.type === 'number' ? 'any' : undefined" :placeholder="field.placeholder || field.label" class="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></label>
            </div>
            <footer class="sticky bottom-0 flex justify-end gap-2 border-t border-gray-200 bg-white p-4"><button type="button" @click="showAdvancedFilters = false" class="border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700">Done</button><button type="button" @click="showAdvancedFilters = false; applyFilters()" class="bg-primary px-4 py-2 text-xs font-bold text-white">Apply filters</button></footer>
          </section>
        </div>
      </form>
    </section>
    <div class="overflow-hidden rounded-lg border border-primary/10 bg-white">
      <div class="overflow-x-auto"><table class="w-full text-left text-sm">
        <thead class="border-b border-primary/10 bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th class="px-4 py-3">Image</th><th class="px-4 py-3">Motor</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">Brand / Model</th><th class="px-4 py-3">Registration</th><th class="px-4 py-3">Price</th><th class="px-4 py-3 text-right">Actions</th></tr></thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="motor in filteredMotors" :key="motor.id" class="hover:bg-primary/5">
            <td class="px-4 py-3"><img v-if="motorImage(motor)" :src="motorImage(motor)" :alt="motor.name || 'Motor image'" class="h-12 w-16 rounded object-cover" /><span v-else class="text-xs text-gray-400">No image</span></td><td class="px-4 py-3 font-semibold text-primary">{{ displayValue(motor.name) }}</td><td class="px-4 py-3">{{ displayValue(motor.property_type || motor.motor_type) }}</td><td class="px-4 py-3">{{ [motor.brand, motor.model].filter(Boolean).join(' / ') || '—' }}</td><td class="px-4 py-3">{{ motor.registration_number || '—' }}</td><td class="px-4 py-3">{{ motor.price ?? '—' }}</td>
            <td class="px-4 py-3"><div class="flex justify-end gap-1"><button @click="viewDetail(motor.id)" title="View details" class="h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white"><i class="fas fa-eye"></i></button><button v-if="canEdit" @click="editMotor(motor)" title="Edit" class="h-8 w-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white"><i class="fas fa-edit"></i></button></div></td>
          </tr>
          <tr v-if="!loading && filteredMotors.length === 0"><td colspan="7" class="px-4 py-12 text-center text-gray-400">No motor properties found.</td></tr>
        </tbody>
      </table></div>
    </div>
    <AddMotor v-if="addVisible" @close="addVisible = false" @refresh="fetchMotors" />
    <EditMotor v-if="editVisible" :data="selectedMotor" @close="editVisible = false" @refresh="fetchMotors" />
  </div>
</template>
<script>
import AddMotor from "./add.vue";
import EditMotor from "./edit.vue";
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";
export default {
  name: "ManageMotorsView", components: { AddMotor, EditMotor, Toast, Loading },
  data: () => ({ motors: [], loading: false, addVisible: false, editVisible: false, selectedMotor: null, search: "", searchTimeout: null, showAdvancedFilters: false, filters: { property_zone: "", owner: "", manager: "", property_type: "", property_type__in: "", usage: "", usage__in: "", make: "", make__icontains: "", model: "", model__icontains: "", year: "", year__gte: "", year__lte: "", price: "", price__gte: "", price__lte: "", price__gt: "", price__lt: "", location: "", location__icontains: "" }, propertyZones: [], owners: [], managers: [], ownerSearch: "", managerSearch: "", ownerDropdownOpen: false, managerDropdownOpen: false, usageDropdownOpen: false, usageSelect: "", lookupTimeout: null }),
  computed: {
    canEdit() { const role = this.$getRole?.() || "tenant"; return ["superuser", "owner", "admin", "super_staff"].includes(String(role).toLowerCase()); },
    allFilterFields() { return [
      {key:"property_type",label:"Property type (exact)"},{key:"property_type__in",label:"Property types (comma-separated)",placeholder:"car, boat"},
      {key:"usage",label:"Usage (exact)"},{key:"usage__in",label:"Usages (select or comma-separated)",placeholder:"new, used"},{key:"make",label:"Make (exact)"},{key:"make__icontains",label:"Make contains"},{key:"model",label:"Model (exact)"},{key:"model__icontains",label:"Model contains"},
      {key:"year",label:"Year (exact)"},{key:"year__gte",label:"Year from",type:"number"},{key:"year__lte",label:"Year to",type:"number"},{key:"price",label:"Price (exact)"},{key:"price__gte",label:"Minimum price",type:"number"},{key:"price__lte",label:"Maximum price",type:"number"},{key:"price__gt",label:"Price greater than",type:"number"},{key:"price__lt",label:"Price less than",type:"number"},
      {key:"location",label:"Location (exact)"},{key:"location__icontains",label:"Location contains"}
    ]; },
    visibleFilterFields() { return this.allFilterFields.filter(field => ["property_type","usage","price__gte","price__lte"].includes(field.key)); },
    advancedFilterFields() { return this.allFilterFields.filter(field => !["property_type","usage","price__gte","price__lte"].includes(field.key)); },
    advancedFilterCount() { return this.advancedFilterFields.filter(field => String(this.filters[field.key] || "").trim()).length; },
    isSuperRole() { const role = String(this.$getRole?.() || "").toLowerCase(); return ["superuser","super_user","super staff","super_staff","superstaff"].includes(role); },
    isOwnerOrStaff() { const role = String(this.$getRole?.() || "").toLowerCase(); return ["owner","staff"].includes(role); },
    selectedOwnerLabel() { const person = this.owners.find(item => this.optionValue(item) === String(this.filters.owner)); return person ? this.optionLabel(person) : this.ownerSearch; },
    selectedManagerLabel() { const person = this.managers.find(item => this.optionValue(item) === String(this.filters.manager)); return person ? this.optionLabel(person) : this.managerSearch; },
    usageOptions() { return ["new","used"]; },
    filteredMotors() { const q = this.search.trim().toLowerCase(); return this.motors.filter(m => !q || Object.values(m || {}).some(v => this.displayValue(v).toLowerCase().includes(q))); }
  },
  mounted() { this.fetchMotors(); this.loadFilterOptions(); },
  beforeUnmount() { clearTimeout(this.searchTimeout); clearTimeout(this.lookupTimeout); },
  methods: {
    optionValue(item) { if (item === null || item === undefined) return ""; if (typeof item !== "object") return String(item); return String(item.id ?? item.value ?? item.uuid ?? item.pk ?? ""); },
    optionLabel(item) { if (item === null || item === undefined) return ""; if (typeof item !== "object") return String(item); const name = [item.first_name,item.middle_name,item.last_name].filter(Boolean).join(" "); return name || item.full_name || item.name || item.title || item.label || item.username || item.email || this.optionValue(item); },
    async loadFilterOptions() {
      try { const response = await this.$apiGet("/get_property_zones", {}); const payload = response?.data ?? response?.results ?? response; this.propertyZones = Array.isArray(payload) ? payload : payload?.results || payload?.property_zones || payload?.zones || []; } catch (error) { console.warn("Property zones could not be loaded", error); }
      if (this.isSuperRole) await this.searchOwners();
      if (this.isOwnerOrStaff) await this.searchManagers();
    },
    closeOwnerDropdown() { this.ownerDropdownOpen = false; },
    closeManagerDropdown() { this.managerDropdownOpen = false; },
    closeUsageDropdown() { this.usageDropdownOpen = false; },
    selectOwner(person) { this.filters.owner = this.optionValue(person); this.ownerSearch = this.optionLabel(person); this.ownerDropdownOpen = false; },
    selectManager(person) { this.filters.manager = this.optionValue(person); this.managerSearch = this.optionLabel(person); this.managerDropdownOpen = false; },
    searchOwners() { this.filters.owner = ""; const query = this.ownerSearch.trim(); this.ownerDropdownOpen = !!query; clearTimeout(this.lookupTimeout); if (!query) { this.owners = []; return; } this.lookupTimeout = setTimeout(async () => { try { const response = await this.$apiGet("/get_owners", { search: query }); const payload = response?.data ?? response?.results ?? response; this.owners = Array.isArray(payload) ? payload : payload?.results || payload?.owners || payload?.users || []; } catch (error) { console.warn("Owners could not be loaded", error); } }, 250); },
    searchManagers() { this.filters.manager = ""; const query = this.managerSearch.trim(); this.managerDropdownOpen = !!query; clearTimeout(this.lookupTimeout); if (!query) { this.managers = []; return; } this.lookupTimeout = setTimeout(async () => { try { const response = await this.$apiGet("/get_managers", { search: query }); const payload = response?.data ?? response?.results ?? response; this.managers = Array.isArray(payload) ? payload : payload?.results || payload?.managers || payload?.users || []; } catch (error) { console.warn("Managers could not be loaded", error); } }, 250); },
    chooseUsage(usage) { this.usageSelect = usage; this.syncUsageFilter(); this.usageDropdownOpen = false; },
    syncUsageFilter() { if (!this.usageSelect) return; const current = this.filters.usage__in.split(",").map(v => v.trim()).filter(Boolean); if (!current.includes(this.usageSelect)) current.push(this.usageSelect); this.filters.usage__in = current.join(", "); this.usageSelect = ""; },
    applyFilters() { this.fetchMotors(true); },
    clearFilters() { this.filters = { property_zone: "", owner: "", manager: "", property_type: "", property_type__in: "", usage: "", usage__in: "", make: "", make__icontains: "", model: "", model__icontains: "", year: "", year__gte: "", year__lte: "", price: "", price__gte: "", price__lte: "", price__gt: "", price__lt: "", location: "", location__icontains: "" }; this.fetchMotors(true); },
    async fetchMotors(immediate = false) {
      clearTimeout(this.searchTimeout);
      const params = {};
      if (this.search.trim()) params.search = this.search.trim();
      if (this.isSuperRole && this.ownerSearch.trim() && !this.filters.owner) params.owner = this.ownerSearch.trim();
      if (this.isOwnerOrStaff && this.managerSearch.trim() && !this.filters.manager) params.manager = this.managerSearch.trim();
      Object.entries(this.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && String(value).trim() !== "") params[key] = String(value).trim();
      });
      this.searchTimeout = setTimeout(async () => {
        this.loading = true;
        try {
          const response = await this.$apiGet("/get_motor_properties", params);
          const payload = response?.data ?? response?.results ?? response;
          this.motors = Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : Array.isArray(payload?.motor_properties) ? payload.motor_properties : [];
          try {
            const pictureResponse = await this.$apiGet("/get_motor_property_pictures", {});
            const picturePayload = pictureResponse?.data ?? pictureResponse?.results ?? pictureResponse;
            const pictures = Array.isArray(picturePayload) ? picturePayload : picturePayload?.results || picturePayload?.motor_property_pictures || picturePayload?.data || [];
            this.motors = this.motors.map(motor => {
              const related = pictures.filter(pic => Number(pic.motor_property?.id ?? pic.motor_property ?? pic.motor_property_id) === Number(motor.id));
              return { ...motor, pictures: motor.pictures || motor.motor_property_pictures || related };
            });
          } catch (pictureError) { console.warn("Motor pictures could not be loaded:", pictureError); }
        } catch (error) { console.error("Failed to load motors:", error); this.motors = []; this.$root.$refs.toast?.showToast("Failed to load motor properties", "error"); }
        finally { this.loading = false; }
      }, immediate ? 0 : (this.search ? 250 : 0));
    },
    displayValue(value) { if (value === null || value === undefined || value === "") return "—"; if (typeof value === "object") { const preferred = value.name ?? value.title ?? value.label ?? value.description ?? value.url ?? value.image ?? value.id; return preferred !== undefined ? this.displayValue(preferred) : Object.entries(value).map(([k,v]) => this.labelKey(k) + ": " + this.displayValue(v)).join(", "); } if (typeof value === "boolean") return value ? "Yes" : "No"; return String(value).replace(/_/g, " "); },
    labelKey(key) { return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); },
    motorImage(motor) { const pics = motor?.pictures || motor?.motor_property_pictures || motor?.images || motor?.motor_property_picture; const first = Array.isArray(pics) ? pics[0] : pics; return first?.image || first?.url || first?.image_url || first?.picture || motor?.image || motor?.image_url || ""; },
    editMotor(motor) { this.selectedMotor = { ...motor }; this.editVisible = true; },
    viewDetail(id) { this.$router.push({ name: "ManageMotors-detail", params: { id } }); }
  }
};
</script>
