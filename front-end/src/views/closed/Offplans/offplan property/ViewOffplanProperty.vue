<template>
  <div class="min-h-full bg-slate-50 px-3 py-4 md:px-4 md:py-5">
    <div class="mx-auto max-w-[1600px]">
      <header class="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="text-lg font-semibold text-slate-900">Offplan properties</h1>
        </div>
        <button @click="openAdd" class="inline-flex items-center justify-center gap-2 border border-primary bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90">
          <i class="fas fa-plus"></i> Add offplan property
        </button>
      </header>

      <section class="mb-3 grid border border-slate-200 bg-white sm:grid-cols-3">
        <div class="flex h-14 items-center justify-between border-b border-slate-200 px-3 sm:border-b-0 sm:border-r">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Total</p>
          <p class="text-lg font-semibold leading-none text-slate-900">{{ filteredProperties.length }}</p>
        </div>
        <div class="flex h-14 items-center justify-between border-b border-slate-200 px-3 sm:border-b-0 sm:border-r">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Under construction</p>
          <p class="text-lg font-semibold leading-none text-slate-900">{{ underConstruction }}</p>
        </div>
        <div class="flex h-14 items-center justify-between px-3">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Ready</p>
          <p class="text-lg font-semibold leading-none text-slate-900">{{ readyCount }}</p>
        </div>
      </section>

      <section class="mb-3 border border-slate-200 bg-white">
        <div class="border-b border-slate-100 p-3">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="min-w-0 lg:col-span-2">
              <label for="offplan-search" class="mb-1 block text-[11px] font-semibold text-slate-600">Search properties</label>
              <div class="relative">
                <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
                <input id="offplan-search" v-model="search" @keyup.enter="applyFilters" type="search" class="w-full border border-slate-300 bg-white py-2 pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-primary" placeholder="Search developer, type, location…" />
              </div>
            </div>
            <div>
              <label for="offplan-zone" class="mb-1 block text-[11px] font-semibold text-slate-600">Property zone</label>
              <select id="offplan-zone" v-model="filters.property_zone" class="w-full border border-slate-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-primary"><option value="">All zones</option><option v-for="zone in zones" :key="zone.id" :value="String(zone.id)">{{ zone.name }}</option></select>
            </div>
            <div>
              <label for="offplan-type" class="mb-1 block text-[11px] font-semibold text-slate-600">Property type</label>
              <select id="offplan-type" v-model="filters.property_type" class="w-full border border-slate-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-primary"><option value="">All property types</option><option v-for="type in propertyTypes" :key="type.id" :value="type.name">{{ type.name }}</option><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="industrial">Industrial</option><option value="land">Land</option><option value="mixed_use">Mixed use</option></select>
            </div>
            <div>
              <label for="offplan-project-status" class="mb-1 block text-[11px] font-semibold text-slate-600">Project status</label>
              <select id="offplan-project-status" v-model="filters.project_status" class="w-full border border-slate-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-primary">
                <option value="">All statuses</option>
                <option v-for="value in filterOptions.project_status" :key="value" :value="value">{{ display(value) }}</option>
              </select>
            </div>
            <div>
              <label for="offplan-completion-status" class="mb-1 block text-[11px] font-semibold text-slate-600">Completion status</label>
              <select id="offplan-completion-status" v-model="filters.completion_status" class="w-full border border-slate-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-primary">
                <option value="">All completion statuses</option>
                <option v-for="value in filterOptions.completion_status" :key="value" :value="value">{{ display(value) }}</option>
              </select>
            </div>
            <div>
              <label for="offplan-price-min" class="mb-1 block text-[11px] font-semibold text-slate-600">Minimum price</label>
              <input id="offplan-price-min" v-model="filters.price__gte" type="number" min="0" class="w-full border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-primary" placeholder="No minimum" />
            </div>
            <div>
              <label for="offplan-price-max" class="mb-1 block text-[11px] font-semibold text-slate-600">Maximum price</label>
              <input id="offplan-price-max" v-model="filters.price__lte" type="number" min="0" class="w-full border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-primary" placeholder="No maximum" />
            </div>
          </div>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
            <button @click="showMoreFilters = true" type="button" class="inline-flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <i class="fas fa-sliders-h"></i>
              More filters
              <span v-if="activeAdvancedFilterCount" class="inline-flex min-w-5 items-center justify-center bg-slate-100 px-1.5 py-0.5 text-[10px]">{{ activeAdvancedFilterCount }}</span>
            </button>
            <div class="flex flex-wrap items-center gap-2">
              <label for="offplan-order" class="text-[11px] font-semibold text-slate-600">Order by</label>
              <select id="offplan-order" v-model="ordering" class="min-w-44 border border-slate-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-primary">
                <option value="">Default order</option>
                <option v-for="field in orderingFields" :key="field.value" :value="field.value">{{ field.label }}</option>
              </select>
              <span class="text-[10px] text-slate-500">{{ filteredProperties.length }} result<span v-if="filteredProperties.length !== 1">s</span></span><button @click="applyFilters" class="border border-primary bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90"><i class="fas fa-filter mr-1"></i>Apply filters</button>
              <button @click="resetFilters" class="border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Clear filters</button>
              <button @click="loadProperties" class="border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><i class="fas fa-rotate mr-1"></i>Refresh</button>
            </div>
          </div>
        </div>
      </section>

      <div v-if="showMoreFilters" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-6" @click.self="showMoreFilters = false">
        <section role="dialog" aria-modal="true" aria-labelledby="offplan-filter-title" class="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
          <header class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 id="offplan-filter-title" class="text-base font-semibold text-slate-900">More offplan filters</h2>
              <p class="mt-1 text-xs text-slate-500">Add details to narrow the property list. Leave fields blank to ignore them.</p>
            </div>
            <button type="button" @click="showMoreFilters = false" aria-label="Close filters" class="flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-100"><i class="fas fa-times"></i></button>
          </header>
          <div class="overflow-y-auto p-5">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div v-if="canFilterOwners" class="min-w-0"><label for="offplan-owner-filter" class="mb-1.5 block text-xs font-semibold text-slate-600">Owner</label><select id="offplan-owner-filter" v-model="filters.owner" class="w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary"><option value="">All owners</option><option v-for="person in owners" :key="person.id" :value="String(person.id)">{{ person.name }}</option></select></div><div v-if="canFilterManagers" class="min-w-0"><label for="offplan-manager-filter" class="mb-1.5 block text-xs font-semibold text-slate-600">Manager</label><select id="offplan-manager-filter" v-model="filters.manager" class="w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary"><option value="">All managers</option><option v-for="person in managers" :key="person.id" :value="String(person.id)">{{ person.name }}</option></select></div><div v-for="field in exactTextFilters" :key="field.key" class="min-w-0">
                <label :for="'offplan-filter-' + field.key" class="mb-1.5 block text-xs font-semibold text-slate-600">{{ field.label }}</label>
                <input :id="'offplan-filter-' + field.key" v-model.trim="filters[field.key]" class="w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary" :placeholder="'Any ' + field.label.toLowerCase()" />
              </div>
              <div>
                <label for="offplan-sale-type" class="mb-1.5 block text-xs font-semibold text-slate-600">Sale type</label>
                <select id="offplan-sale-type" v-model="filters.sale_type" class="w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">All sale types</option><option v-for="value in filterOptions.sale_type" :key="value" :value="value">{{ display(value) }}</option>
                </select>
              </div>
              <div>
                <label for="offplan-project-completion" class="mb-1.5 block text-xs font-semibold text-slate-600">Project completion</label>
                <select id="offplan-project-completion" v-model="filters.project_completion" class="w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">Any completion period</option><option v-for="value in filterOptions.project_completion" :key="value" :value="value">{{ display(value) }}</option>
                </select>
              </div>
              <div>
                <label for="offplan-prehandover" class="mb-1.5 block text-xs font-semibold text-slate-600">Pre-handover payment</label>
                <input id="offplan-prehandover" v-model.trim="filters.pre_handover_payment" class="w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Any payment plan" />
              </div>
              <div>
                <label for="offplan-furnished" class="mb-1.5 block text-xs font-semibold text-slate-600">Furnishing</label>
                <select id="offplan-furnished" v-model="filters.is_furnished" class="w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">Any furnishing</option><option value="true">Furnished</option><option value="false">Unfurnished</option>
                </select>
              </div>
              <div>
                <label for="offplan-price-exact" class="mb-1.5 block text-xs font-semibold text-slate-600">Exact price</label>
                <input id="offplan-price-exact" v-model="filters.price" type="number" min="0" class="w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Exact price" />
              </div>
              <div v-for="field in numericRangeFilters" :key="field.key" class="min-w-0">
                <label :for="'offplan-filter-' + field.key" class="mb-1.5 block text-xs font-semibold text-slate-600">{{ field.label }}</label>
                <input :id="'offplan-filter-' + field.key" v-model="filters[field.key]" type="number" min="0" class="w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary" :placeholder="field.placeholder" />
              </div>
            </div>
            <p class="mt-4 text-[11px] text-slate-500">Text filters match the full value. Numeric filters let you set exact values or area bounds.</p>
          </div>
          <footer class="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" @click="resetFilters" class="border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Clear filters</button>
            <div class="flex justify-end gap-2">
              <button type="button" @click="showMoreFilters = false" class="border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancel</button>
              <button type="button" @click="applyFilters" class="bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"><i class="fas fa-filter mr-2"></i>Apply filters</button>
            </div>
          </footer>
        </section>
      </div>

      <section v-if="loading" class="border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
        <i class="fas fa-spinner fa-spin mr-2"></i>Loading offplan properties…
      </section>

      <section v-else-if="error" class="border border-red-200 bg-red-50 p-4 text-xs text-red-700">
        <div class="flex items-center justify-between gap-3">
          <span>{{ error }}</span>
          <button @click="loadProperties" class="border border-red-300 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-red-700 hover:bg-red-50">Retry</button>
        </div>
      </section>

      <section v-else class="overflow-hidden border border-slate-200 bg-white">
        <div v-if="filteredProperties.length === 0" class="p-10 text-center">
          <div class="mb-2 text-primary"><i class="fas fa-building text-xl"></i></div>
          <h2 class="text-xs font-semibold text-slate-900">No offplan properties found</h2>
          <p class="mt-1 text-xs text-slate-500">Create a property or adjust your search criteria.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-[1100px] w-full border-collapse text-left">
            <thead class="bg-slate-50">
              <tr class="border-b border-slate-200">
                <th class="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Property / Developer</th>
                <th class="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Type</th>
                <th class="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Price</th>
                <th class="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Beds / Baths</th>
                <th class="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Area</th>
                <th class="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Project</th>
                <th class="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Completion</th>
                <th class="px-2 py-1.5 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredProperties" :key="item.id" class="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td class="px-2 py-1.5">
                  <div class="text-xs font-medium leading-tight text-slate-900">{{ item.developer || "—" }}</div>
                </td>
                <td class="px-2 py-1.5 text-xs text-slate-700">{{ display(item.property_type) }}</td>
                <td class="px-2 py-1.5 text-xs font-semibold text-slate-900">{{ item.price || "—" }}</td>
                <td class="px-2 py-1.5 text-xs text-slate-700">{{ item.bedrooms || "—" }} / {{ item.bathrooms || "—" }}</td>
                <td class="px-2 py-1.5 text-xs text-slate-700">{{ item.area_or_size || "—" }}</td>
                <td class="px-2 py-1.5">
                  <span :class="statusClass(item.project_status)" class="inline-flex border px-1.5 py-0.5 text-[10px] font-medium">{{ display(item.project_status) }}</span>
                </td>
                <td class="px-2 py-1.5">
                  <div class="text-xs text-slate-700">{{ display(item.completion_status) }}</div>
                  <div class="mt-0.5 text-[10px] text-slate-500">{{ display(item.project_completion) }}</div>
                </td>
                <td class="px-2 py-1.5">
                  <div class="flex justify-end gap-1">
                    <router-link :to="{ name: 'OffplanProperty-detail', params: { id: item.id } }" class="border border-slate-300 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 hover:border-primary hover:text-primary">View</router-link>
                    <button @click="openEdit(item)" class="border border-primary bg-primary px-2 py-1 text-[10px] font-semibold text-white hover:opacity-90">Edit</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <AddOffplanProperty :open="addOpen" @close="addOpen=false" @saved="loadProperties" />
    <EditOffplanProperty :open="editOpen" :id="selectedId" @close="closeEdit" @saved="loadProperties" />


  </div>
</template>

<script>
import AddOffplanProperty from "./AddOffplanProperty.vue";
import EditOffplanProperty from "./EditOffplanProperty.vue";

export default {
  name: "ViewOffplanProperty",
  components: { AddOffplanProperty, EditOffplanProperty },
  data() {
    return {
      properties: [],
      zones: [],
      propertyTypes: [],
      owners: [],
      managers: [],
      role: "",
      search: "",
      showMoreFilters: false,
      ordering: "-id",
      filters: {
        property_zone: "", owner: "", manager: "", property_type: "", completion_status: "",
        sale_type: "", project_completion: "", project_status: "", pre_handover_payment: "",
        is_furnished: "", price: "", price__gte: "", price__lte: "",
        min_area: "", min_area__gte: "", min_area__lte: "",
        max_area: "", max_area__gte: "", max_area__lte: "",
        developer: "", location: "", handover_period: ""
      },
      loading: true,
      error: "",
      addOpen: false,
      editOpen: false,
      selectedId: null
    };
  },
  computed: {
    filterOptions() {
      const fields = { project_status: ["planned", "under_construction", "completed"], completion_status: ["ready", "offplan", "under_construction"], sale_type: ["initial_sale", "resale", "rent", "lease"], project_completion: ["under_25", "25_50", "50_75", "over_75"] };
      return Object.keys(fields).reduce((options, key) => {
        options[key] = [...new Set([...fields[key], ...this.properties.map(item => item?.[key])].filter(value => value !== null && value !== undefined && value !== ""))].sort((a, b) => String(a).localeCompare(String(b)));
        return options;
      }, {});
    },
    canFilterOwners() { return ["superuser", "super_user", "super_staff"].includes(this.role); },
    canFilterManagers() { return ["owner", "staff"].includes(this.role); },
    exactTextFilters() {
      return [
        { key: "developer", label: "Developer" },
        { key: "location", label: "Location" },
        { key: "handover_period", label: "Handover period" }
      ];
    },
    numericRangeFilters() {
      return [
        { key: "min_area", label: "Exact minimum area", placeholder: "Exact minimum area" },
        { key: "min_area__gte", label: "Minimum area at least", placeholder: "Area lower bound" },
        { key: "min_area__lte", label: "Minimum area up to", placeholder: "Area upper bound" },
        { key: "max_area", label: "Exact maximum area", placeholder: "Exact maximum area" },
        { key: "max_area__gte", label: "Maximum area at least", placeholder: "Area lower bound" },
        { key: "max_area__lte", label: "Maximum area up to", placeholder: "Area upper bound" }
      ];
    },
    orderingFields() {
      const fields = [["id","Recently added"],["property_zone","Property zone"],["owner","Owner"],["manager","Manager"],["property_type","Property type"],["completion_status","Completion status"],["price","Price"],["bedrooms","Bedrooms"],["bathrooms","Bathrooms"],["min_area","Minimum area"],["max_area","Maximum area"],["sale_type","Sale type"],["project_completion","Project completion"],["pre_handover_payment","Pre-handover payment"],["project_status","Project status"],["location","Location"],["handover_period","Handover period"],["developer","Developer"],["is_furnished","Furnishing"],["created_at","Date added"],["updated_at","Last updated"]];
      return fields.flatMap(([value,label]) => [{value,label:label+" — Ascending (A to Z / lowest first)"},{value:"-"+value,label:label+" — Descending (Z to A / highest first)"}]);
    },
    activeAdvancedFilterCount() {
      const advancedKeys = Object.keys(this.filters).filter(key => !["property_zone", "property_type", "project_status", "completion_status", "price__gte", "price__lte"].includes(key));
      return advancedKeys.filter(key => this.filters[key] !== "" && this.filters[key] !== null && this.filters[key] !== undefined).length;
    },
    filteredProperties() {
      return this.properties;
    },
    underConstruction() {
      return this.filteredProperties.filter(p => p.project_status === "under_construction").length;
    },
    readyCount() {
      return this.filteredProperties.filter(p => p.completion_status === "ready").length;
    }
  },
  async mounted() {
    this.role = String(this.$getRole ? this.$getRole() : localStorage.getItem("role") || "").trim().toLowerCase().replace(/[ -]/g, "_");
    await Promise.all([this.loadLookups(), this.loadProperties()]);
  },
  methods: {
    normalizeList(response, keys = []) {
      const raw = response?.data ?? response;
      if (Array.isArray(raw)) return raw;
      for (const key of keys) if (Array.isArray(raw?.[key])) return raw[key];
      return Array.isArray(raw?.results) ? raw.results : [];
    },
    normalizePerson(item) {
      const id = item?.id ?? item?.user_id ?? item?.owner_id ?? item?.manager_id;
      const name = item?.name || item?.full_name || [item?.first_name, item?.last_name].filter(Boolean).join(" ") || item?.username || item?.email || ("User " + id);
      return { id: Number(id), name: String(name).trim() };
    },
    async loadLookups() {
      try {
        const [zoneResponse, typeResponse] = await Promise.all([
          this.$getZones({ page: 1, pageSize: 1000 }),
          this.$apiGet("/get_property_types", { page: 1, page_size: 1000 }).catch(() => null)
        ]);
        this.zones = (zoneResponse?.zones || []).map(item => ({ id: item.id ?? item.zone_id, name: item.name || item.zone_name || item.title || "Unnamed zone" })).filter(item => item.id != null);
        this.propertyTypes = this.normalizeList(typeResponse, ["property_types", "results"]).filter(item => item?.name).map(item => ({ id: item.id, name: item.name }));
        if (this.canFilterOwners) {
          const response = await this.$apiGet("/get_owners", { page: 1, page_size: 1000 });
          this.owners = this.normalizeList(response, ["owners", "results"]).map(this.normalizePerson).filter(item => item.id);
        }
        if (this.canFilterManagers) {
          const userId = Number(localStorage.getItem("userId") || localStorage.getItem("user_id") || localStorage.getItem("id") || 0);
          const response = this.role === "owner"
            ? await this.$apiGet("/get_owner_managers", { owner_id: userId, page: 1, page_size: 1000 })
            : await this.$apiGet("/get_managers", { page: 1, page_size: 1000 });
          this.managers = this.normalizeList(response, ["managers", "results"]).map(this.normalizePerson).filter(item => item.id);
        }
      } catch (e) {
        this.error = e?.message || "Unable to load filter options.";
      }
    },
    async loadProperties() {
      this.loading = true;
      this.error = "";
      try {
        const params = { search: this.search.trim(), ordering: this.ordering || "-id" };
        Object.entries(this.filters).forEach(([key, value]) => {
          if (value === "" || value === null || value === undefined) return;
          if (key === "owner" && !this.canFilterOwners) return;
          if (key === "manager" && !this.canFilterManagers) return;
          const apiKey = key === "property_zone" ? "property_zone_id" : key === "owner" ? "owner_id" : key === "manager" ? "manager_id" : key;
          params[apiKey] = value;
        });
        const response = await this.$apiGet("/get_offplan_properties", params);
        const data = response?.data?.data || response?.data || response?.properties || response;
        this.properties = Array.isArray(data) ? data : (data?.results || data?.properties || []);
      } catch (e) {
        this.error = e?.message || "Unable to load offplan properties.";
      } finally {
        this.loading = false;
      }
    },
    applyFilters() {
      this.showMoreFilters = false;
      this.loadProperties();
    },
    resetFilters() {
      this.search = "";
      this.ordering = "-id";
      this.filters = {
        property_zone: "", owner: "", manager: "", property_type: "", completion_status: "",
        sale_type: "", project_completion: "", project_status: "", pre_handover_payment: "",
        is_furnished: "", price: "", price__gte: "", price__lte: "",
        min_area: "", min_area__gte: "", min_area__lte: "",
        max_area: "", max_area__gte: "", max_area__lte: "",
        developer: "", location: "", handover_period: ""
      };
      this.showMoreFilters = false;
      this.loadProperties();
    },
    openAdd() {
      this.addOpen = true;
    },
    openEdit(item) {
      this.selectedId = item?.id;
      this.editOpen = true;
    },
    closeEdit() {
      this.editOpen = false;
      this.selectedId = null;
    },
    display(v) {
      if (v === null || v === undefined || v === "") return "—";
      return String(v).replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
    },
    statusClass(status) {
      if (status === "completed") return "border-primary/30 bg-primary/5 text-primary";
      if (status === "under_construction") return "border-secondary/30 bg-secondary/5 text-secondary";
      return "border-slate-200 bg-slate-50 text-slate-600";
    },
    activeFeatures(item) {
      if (!item) return [];
      return [
        ["is_furnished", "Furnished"], ["has_maids_room", "Maid’s room"], ["has_study", "Study"],
        ["has_central_or_ac_and_heating", "Central A/C & heating"], ["has_balcony", "Balcony"],
        ["has_private_garden", "Private garden"], ["has_private_pool", "Private pool"],
        ["has_private_gym", "Private gym"], ["has_private_jacuzzi", "Private jacuzzi"],
        ["has_shared_pool", "Shared pool"], ["has_shared_spa", "Shared spa"]
      ].filter(([key]) => item[key]).map(([, label]) => label);
    }
  }
};
</script>
