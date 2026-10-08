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
        <div class="flex flex-col gap-2 p-3 lg:flex-row lg:items-center">
          <div class="relative flex-1">
            <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
            <input v-model="search" class="w-full border border-slate-300 bg-white py-1.5 pl-8 pr-2.5 text-xs text-slate-800 outline-none focus:border-primary" placeholder="Search developer, type, project status or completion…" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-slate-500">{{ filteredProperties.length }} result<span v-if="filteredProperties.length !== 1">s</span></span>
            <button @click="loadProperties" class="border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
              <i class="fas fa-rotate mr-1"></i>Refresh
            </button>
          </div>
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
      loading: true,
      error: "",
      addOpen: false,
      editOpen: false,
      selectedId: null
    };
  },
  computed: {
    filteredProperties() {
      const q = this.search.trim().toLowerCase();
      if (!q) return this.properties;
      return this.properties.filter(p =>
        [p.developer, p.property_type, p.project_status, p.completion_status, p.sale_type, p.project_completion]
          .some(v => String(v ?? "").toLowerCase().includes(q))
      );
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
