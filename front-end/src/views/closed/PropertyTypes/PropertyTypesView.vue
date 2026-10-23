<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-6 text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading property types..." />
    <main class="mx-auto max-w-7xl space-y-5">
      <header class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start gap-3">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><i class="fas fa-house text-xl"></i></div>
          <div>
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Property configuration</p>
            <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-900">Property Types</h1>
            <p class="mt-1 text-sm text-slate-500">Choose a property type to view or add its subtypes.</p>
          </div>
        </div>
        <button @click="fetchPropertyTypes" :disabled="loading" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition hover:border-primary hover:text-primary disabled:opacity-50"><i class="fas fa-rotate" :class="{ 'fa-spin': loading }"></i> Refresh</button>
      </header>

      <section class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-4"><p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Property types</p><p class="mt-2 text-2xl font-black text-slate-900">{{ propertyTypes.length }}</p></div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4"><p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Property subtypes</p><p class="mt-2 text-2xl font-black text-slate-900">{{ propertySubtypes.length }}</p></div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4"><p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Types with subtypes</p><p class="mt-2 text-2xl font-black text-slate-900">{{ typesWithSubtypes }}</p></div>
      </section>

      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 class="font-bold text-slate-900">Property type directory</h2><p class="mt-1 text-xs text-slate-500">Each row lets you manage subtypes for that parent type.</p></div>
          <div class="relative w-full sm:max-w-sm"><i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i><input v-model="searchTerm" type="search" placeholder="Search property types..." aria-label="Search property types" class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" /></div>
        </div>
        <div v-if="errorMessage" class="m-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700" role="alert"><i class="fas fa-circle-exclamation mt-0.5"></i><div class="flex-1"><p class="font-semibold">Could not load property types</p><p class="mt-1 text-xs">{{ errorMessage }}</p></div><button @click="fetchPropertyTypes" class="text-xs font-bold underline">Retry</button></div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[650px]">
            <thead class="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th class="px-5 py-3">Property type</th><th class="px-5 py-3">Type ID</th><th class="px-5 py-3">Subtypes</th><th class="px-5 py-3 text-right">Actions</th></tr></thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="type in filteredPropertyTypes" :key="type.id" class="transition hover:bg-slate-50/80">
                <td class="px-5 py-4"><div class="flex items-center gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-black uppercase text-primary">{{ initials(type.name) }}</span><div><p class="font-bold text-slate-900">{{ type.name || 'Unnamed property type' }}</p><p class="mt-0.5 text-xs text-slate-400">Parent property type</p></div></div></td>
                <td class="px-5 py-4 font-mono text-xs text-slate-500">#{{ type.id }}</td>
                <td class="px-5 py-4"><span class="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">{{ subtypeCount(type.id) }} {{ subtypeCount(type.id) === 1 ? 'subtype' : 'subtypes' }}</span></td>
                <td class="px-5 py-4"><div class="flex justify-end gap-2"><button @click="openAddSubtype(type)" :aria-label="'Add subtype to ' + type.name" title="Add subtype" class="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition hover:opacity-90"><i class="fas fa-plus"></i><span>Add subtype</span></button><button @click="viewSubtypes(type)" :aria-label="'View subtypes for ' + type.name" title="View subtypes" class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-primary hover:text-primary"><i class="fas fa-eye"></i><span>View subtypes</span></button></div></td>
              </tr>
              <tr v-if="!loading && !errorMessage && filteredPropertyTypes.length === 0"><td colspan="4" class="px-5 py-14 text-center"><i class="fas fa-house text-3xl text-slate-300"></i><p class="mt-3 font-bold text-slate-800">{{ searchTerm ? 'No matching property types' : 'No property types found' }}</p><p class="mt-1 text-xs text-slate-500">Property types are loaded from the get_property_types API.</p></td></tr>
            </tbody>
          </table>
        </div>
        <footer class="border-t border-slate-100 bg-slate-50/70 px-5 py-3"><p class="text-xs text-slate-500">Showing <span class="font-bold text-slate-700">{{ filteredPropertyTypes.length }}</span> of <span class="font-bold text-slate-700">{{ propertyTypes.length }}</span> property types</p></footer>
      </section>
    </main>
    <AddPropertyTypes v-if="addVisible" :visible="addVisible" :parent-type-id="selectedType?.id" @close="closeAddSubtype" @refresh="afterSave" />
  </div>
</template>

<script>
import AddPropertyTypes from "./AddPropertyTypes.vue";
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";

export default {
  name: "PropertyTypesView",
  components: { AddPropertyTypes, Toast, Loading },
  data() {
    return { propertyTypes: [], propertySubtypes: [], searchTerm: "", loading: false, errorMessage: "", addVisible: false, selectedType: null };
  },
  computed: {
    filteredPropertyTypes() {
      const term = this.searchTerm.trim().toLowerCase();
      if (!term) return this.propertyTypes;
      return this.propertyTypes.filter((item) => String(item.name || "").toLowerCase().includes(term) || String(item.id ?? "").includes(term));
    },
    typesWithSubtypes() { return this.propertyTypes.filter((type) => this.subtypeCount(type.id) > 0).length; },
  },
  mounted() { this.loadDirectory(); },
  methods: {
    async loadDirectory() {
      await this.fetchPropertyTypes();
      if (this.propertyTypes.length) await this.fetchPropertySubtypes();
    },
    async fetchPropertyTypes() {
      this.loading = true; this.errorMessage = "";
      try {
        const response = await this.$apiGet("/get_property_types", { page: 1, page_size: 1000 });
        this.propertyTypes = Array.isArray(response) ? response : (response?.data || response?.results || response?.property_types || []);
        await this.fetchPropertySubtypes();
      } catch (error) {
        console.error("Failed to fetch property types:", error);
        this.errorMessage = error?.message || "Please check your connection and try again.";
      } finally { this.loading = false; }
    },
    async fetchPropertySubtypes() {
      try {
        const response = await this.$apiGet("/get_property_subtypes", {});
        this.propertySubtypes = Array.isArray(response) ? response : (response?.data || response?.results || response?.property_subtypes || []);
      } catch (error) { console.warn("Could not load subtype counts:", error); this.propertySubtypes = []; }
    },
    subtypeCount(typeId) {
      return this.propertySubtypes.filter((item) => {
        const relation = item?.property_type;
        const id = relation && typeof relation === "object" ? relation.id : (item?.property_type_id ?? relation);
        return String(id) === String(typeId);
      }).length;
    },
    initials(name) { return String(name || "?").trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("") || "?"; },
    openAddSubtype(type) { this.selectedType = type; this.addVisible = true; },
    closeAddSubtype() { this.addVisible = false; this.selectedType = null; },
    viewSubtypes(type) { this.$router.push({ name: "PropertySubtypes-view", params: { id: type.id } }); },
    async afterSave() { this.closeAddSubtype(); await this.fetchPropertySubtypes(); },
  },
};
</script>
