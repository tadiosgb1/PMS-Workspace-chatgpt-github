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
                <input id="offplan-search" v-model="search" type="search" class="w-full border border-slate-300 bg-white py-2 pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-primary" placeholder="Search developer, type, location…" />
              </div>
            </div>
            <div>
              <label for="offplan-zone" class="mb-1 block text-[11px] font-semibold text-slate-600">Property zone</label>
              <input id="offplan-zone" v-model.trim="filters.property_zone" class="w-full border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-primary" placeholder="Any zone" />
            </div>
            <div>
              <label for="offplan-type" class="mb-1 block text-[11px] font-semibold text-slate-600">Property type</label>
              <input id="offplan-type" v-model.trim="filters.property_type" class="w-full border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-primary" placeholder="Any type" />
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
            <button @click="showMoreFilters = !showMoreFilters" class="inline-flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <i :class="showMoreFilters ? 'fas fa-chevron-up' : 'fas fa-sliders-h'"></i>
              {{ showMoreFilters ? 'Hide additional filters' : 'More filters' }}
              <span v-if="activeAdvancedFilterCount" class="inline-flex min-w-5 items-center justify-center bg-slate-100 px-1.5 py-0.5 text-[10px]">{{ activeAdvancedFilterCount }}</span>
            </button>
            <div class="flex flex-wrap items-center gap-2">
              <label for="offplan-order" class="text-[11px] font-semibold text-slate-600">Order by</label>
              <select id="offplan-order" v-model="ordering" class="min-w-44 border border-slate-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-primary">
                <option value="">Default order</option>
                <option v-for="field in orderingFields" :key="field.value" :value="field.value">{{ field.label }}</option>
              </select>
              <span class="text-[10px] text-slate-500">{{ filteredProperties.length }} result<span v-if="filteredProperties.length !== 1">s</span></span>
              <button @click="resetFilters" class="border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Clear filters</button>
              <button @click="loadProperties" class="border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><i class="fas fa-rotate mr-1"></i>Refresh</button>
            </div>
          </div>
        </div>
        <div v-if="showMoreFilters" class="border-t border-slate-100 bg-slate-50/60 p-3">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="field in exactTextFilters" :key="field.key">
              <label :for="'offplan-filter-' + field.key" class="mb-1 block text-[11px] font-semibold text-slate-600">{{ field.label }}</label>
              <input :id="'offplan-filter-' + field.key" v-model.trim="filters[field.key]" class="w-full border border-slate-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-primary" :placeholder="'Any ' + field.label.toLowerCase()" />
            </div>
            <div>
              <label for="offplan-sale-type" class="mb-1 block text-[11px] font-semibold text-slate-600">Sale type</label>
              <select id="offplan-sale-type" v-model="filters.sale_type" class="w-full border border-slate-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-primary">
                <option value="">All sale types</option><option v-for="value in filterOptions.sale_type" :key="value" :value="value">{{ display(value) }}</option>
              </select>
            </div>
            <div>
              <label for="offplan-project-completion" class="mb-1 block text-[11px] font-semibold text-slate-600">Project completion</label>
              <select id="offplan-project-completion" v-model="filters.project_completion" class="w-full border border-slate-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-primary">
                <option value="">Any completion period</option><option v-for="value in filterOptions.project_completion" :key="value" :value="value">{{ display(value) }}</option>
              </select>
            </div>
            <div>
              <label for="offplan-prehandover" class="mb-1 block text-[11px] font-semibold text-slate-600">Pre-handover payment</label>
              <input id="offplan-prehandover" v-model.trim="filters.pre_handover_payment" class="w-full border border-slate-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-primary" placeholder="Any payment plan" />
            </div>
            <div>
              <label for="offplan-furnished" class="mb-1 block text-[11px] font-semibold text-slate-600">Furnishing</label>
              <select id="offplan-furnished" v-model="filters.is_furnished" class="w-full border border-slate-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-primary">
                <option value="">Any furnishing</option><option value="true">Furnished</option><option value="false">Unfurnished</option>
              </select>
            </div>
            <div>
              <label for="offplan-price-exact" class="mb-1 block text-[11px] font-semibold text-slate-600">Exact price</label>
              <input id="offplan-price-exact" v-model="filters.price" type="number" min="0" class="w-full border border-slate-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-primary" placeholder="Exact price" />
            </div>
            <div v-for="field in numericRangeFilters" :key="field.key">
              <label :for="'offplan-filter-' + field.key" class="mb-1 block text-[11px] font-semibold text-slate-600">{{ field.label }}</label>
              <input :id="'offplan-filter-' + field.key" v-model="filters[field.key]" type="number" min="0" class="w-full border border-slate-300 bg-white px-2.5 py-2 text-xs outline-none focus:border-primary" :placeholder="field.placeholder" />
            </div>
          </div>
          <p class="mt-3 text-[10px] text-slate-500">Text fields use exact matching. Numeric fields support exact, minimum and maximum values.</p>
        </div>
      </section>

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
      search: "",
      showMoreFilters: false,
      ordering: "",
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
      const fields = ["project_status", "completion_status", "sale_type", "project_completion"];
      return fields.reduce((options, key) => {
        options[key] = [...new Set(this.properties.map(item => item?.[key]).filter(value => value !== null && value !== undefined && value !== ""))].sort((a, b) => String(a).localeCompare(String(b)));
        return options;
      }, {});
    },
    exactTextFilters() {
      return [
        { key: "owner", label: "Owner" },
        { key: "manager", label: "Manager" },
        { key: "developer", label: "Developer" },
        { key: "location", label: "Location" },
        { key: "handover_period", label: "Handover period" }
      ];
    },
    numericRangeFilters() {
      return [
        { key: "price__gte", label: "Price at least", placeholder: "Minimum price" },
        { key: "price__lte", label: "Price up to", placeholder: "Maximum price" },
        { key: "min_area", label: "Exact minimum area", placeholder: "Exact minimum area" },
        { key: "min_area__gte", label: "Minimum area at least", placeholder: "Area lower bound" },
        { key: "min_area__lte", label: "Minimum area up to", placeholder: "Area upper bound" },
        { key: "max_area", label: "Exact maximum area", placeholder: "Exact maximum area" },
        { key: "max_area__gte", label: "Maximum area at least", placeholder: "Area lower bound" },
        { key: "max_area__lte", label: "Maximum area up to", placeholder: "Area upper bound" }
      ];
    },
    orderingFields() {
      return [
        "id", "property_zone", "owner", "manager", "property_type", "completion_status", "price",
        "bedrooms", "bathrooms", "min_area", "max_area", "sale_type", "project_completion",
        "pre_handover_payment", "project_status", "location", "handover_period", "developer",
        "is_furnished", "picture", "has_maids_room", "has_study", "has_central_or_ac_and_heating",
        "has_balcony", "has_private_garden", "has_private_pool", "has_private_gym",
        "has_private_jacuzzi", "has_shared_pool", "has_shared_spa", "created_at", "updated_at"
      ].map(value => ({ value, label: this.display(value) })).flatMap(field => [
        field,
        { value: "-" + field.value, label: field.label + " (descending)" }
      ]);
    },
    activeAdvancedFilterCount() {
      const advancedKeys = Object.keys(this.filters).filter(key => !["property_zone", "property_type", "project_status", "completion_status", "price__gte", "price__lte"].includes(key));
      return advancedKeys.filter(key => this.filters[key] !== "" && this.filters[key] !== null && this.filters[key] !== undefined).length;
    },
    filteredProperties() {
      const q = this.search.trim().toLowerCase();
      const exactKeys = ["property_zone", "owner", "manager", "property_type", "completion_status", "sale_type", "project_completion", "project_status", "pre_handover_payment", "developer", "location", "handover_period"];
      const numericKeys = ["price", "price__gte", "price__lte", "min_area", "min_area__gte", "min_area__lte", "max_area", "max_area__gte", "max_area__lte"];
      const filtered = this.properties.filter(item => {
        if (q && ![item.developer, item.property_type, item.project_status, item.completion_status, item.sale_type, item.project_completion, item.location]
          .some(value => String(value ?? "").toLowerCase().includes(q))) return false;
        for (const key of exactKeys) {
          const expected = this.filters[key];
          if (!expected) continue;
          if (String(item?.[key] ?? "").trim().toLowerCase() !== String(expected).trim().toLowerCase()) return false;
        }
        if (this.filters.is_furnished !== "") {
          const actual = item.is_furnished;
          const isFurnished = actual === true || actual === 1 || String(actual).toLowerCase() === "true" || String(actual) === "1";
          if (isFurnished !== (this.filters.is_furnished === "true")) return false;
        }
        for (const key of numericKeys) {
          const expected = this.filters[key];
          if (expected === "" || expected === null || expected === undefined) continue;
          const rawValue = item[key.split("__")[0]];
          const actual = Number(rawValue);
          const target = Number(expected);
          if (!Number.isFinite(actual) || !Number.isFinite(target)) return false;
          if (key.endsWith("__gte") && actual < target) return false;
          else if (key.endsWith("__lte") && actual > target) return false;
          else if (!key.includes("__") && actual !== target) return false;
        }
        return true;
      });
      if (!this.ordering) return filtered;
      const descending = this.ordering.startsWith("-");
      const key = descending ? this.ordering.slice(1) : this.ordering;
      return [...filtered].sort((a, b) => {
        const left = a?.[key];
        const right = b?.[key];
        if (left == null && right == null) return 0;
        if (left == null) return descending ? 1 : -1;
        if (right == null) return descending ? -1 : 1;
        const leftNumber = Number(left);
        const rightNumber = Number(right);
        const comparison = left !== "" && right !== "" && Number.isFinite(leftNumber) && Number.isFinite(rightNumber)
          ? leftNumber - rightNumber
          : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
        return descending ? -comparison : comparison;
      });
    },
    underConstruction() {
      return this.filteredProperties.filter(p => p.project_status === "under_construction").length;
    },
    readyCount() {
      return this.filteredProperties.filter(p => p.completion_status === "ready").length;
    }
  },
  async mounted() {
    await this.loadProperties();
  },
  methods: {
    async loadProperties() {
      this.loading = true;
      this.error = "";
      try {
        const res = await this.$apiGet("/get_offplan_properties");
        const data = res?.data?.data || res?.data || res?.properties || res;
        this.properties = Array.isArray(data) ? data : (data?.results || []);
      } catch (e) {
        this.error = e?.message || "Unable to load offplan properties.";
      } finally {
        this.loading = false;
      }
    },
    resetFilters() {
      this.search = "";
      this.ordering = "";
      this.filters = {
        property_zone: "", owner: "", manager: "", property_type: "", completion_status: "",
        sale_type: "", project_completion: "", project_status: "", pre_handover_payment: "",
        is_furnished: "", price: "", price__gte: "", price__lte: "",
        min_area: "", min_area__gte: "", min_area__lte: "",
        max_area: "", max_area__gte: "", max_area__lte: "",
        developer: "", location: "", handover_period: ""
      };
      this.showMoreFilters = false;
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
