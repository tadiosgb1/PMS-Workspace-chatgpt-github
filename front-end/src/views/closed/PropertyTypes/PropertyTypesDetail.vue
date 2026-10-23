<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-6">
    <Loading :visible="loading" message="Loading property subtype..." />
    <main class="mx-auto max-w-3xl space-y-5">
      <button @click="$router.back()" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"><i class="fas fa-arrow-left"></i> Back to property subtypes</button>
      <section v-if="item.id" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header class="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-primary/10 to-white p-6 sm:flex-row sm:items-center">
          <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-black uppercase text-white">{{ initials(item.name) }}</span>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Property subtype · #{{ item.id }}</p>
            <h1 class="mt-1 break-words text-2xl font-black text-slate-900">{{ item.name }}</h1>
            <p class="mt-1 text-sm text-slate-500">A subtype linked to a parent property type.</p>
          </div>
          <button @click="editSubtype" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary"><i class="fas fa-pen"></i> Edit</button>
        </header>
        <div class="grid gap-4 p-6 sm:grid-cols-2">
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subtype name</p>
            <p class="mt-2 font-bold text-slate-900">{{ item.name || '—' }}</p>
          </div>
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Parent property type</p>
            <p class="mt-2 font-bold text-slate-900">{{ parentTypeName }}</p>
          </div>
        </div>
      </section>
      <section v-else-if="!loading" class="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
        <i class="fas fa-circle-exclamation text-3xl text-slate-300"></i>
        <h1 class="mt-3 font-bold text-slate-900">Property subtype not found</h1>
        <p class="mt-1 text-sm text-slate-500">{{ errorMessage || 'The subtype may have been deleted or is no longer available.' }}</p>
      </section>
    </main>
    <EditPropertyTypes v-if="updateVisible" :data="item" :visible="updateVisible" @close="updateVisible = false" @refresh="afterSave" />
  </div>
</template>

<script>
import Loading from "@/components/Loading.vue";
import EditPropertyTypes from "./EditPropertyTypes.vue";

export default {
  name: "PropertyTypesDetail",
  components: { Loading, EditPropertyTypes },
  data() {
    return { item: {}, propertyTypes: [], loading: false, errorMessage: "", updateVisible: false };
  },
  computed: {
    parentTypeName() {
      const relation = this.item?.property_type;
      if (relation && typeof relation === "object") return relation.name || relation.title || (relation.id ? "Type #" + relation.id : "Not assigned");
      const id = this.item?.property_type_id ?? relation;
      return this.propertyTypes.find((type) => String(type.id) === String(id))?.name || (id != null ? "Type #" + id : "Not assigned");
    },
  },
  mounted() { this.fetchDetail(); this.fetchPropertyTypes(); },
  methods: {
    async fetchDetail() {
      this.loading = true;
      this.errorMessage = "";
      try { this.item = (await this.$apiGetById("/get_property_subtype", this.$route.params.id)) || {}; }
      catch (error) { console.error(error); this.errorMessage = error?.message || "Unable to load this subtype."; }
      finally { this.loading = false; }
    },
    async fetchPropertyTypes() {
      try {
        const response = await this.$apiGet("/get_property_types", { page: 1, page_size: 1000 });
        this.propertyTypes = Array.isArray(response) ? response : (response?.data || response?.results || response?.property_types || []);
      } catch (error) { console.error("Unable to load parent property types:", error); }
    },
    initials(name) { return String(name || "?").trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("") || "?"; },
    editSubtype() { this.updateVisible = true; },
    async afterSave() { this.updateVisible = false; await this.fetchDetail(); },
  },
};
</script>
