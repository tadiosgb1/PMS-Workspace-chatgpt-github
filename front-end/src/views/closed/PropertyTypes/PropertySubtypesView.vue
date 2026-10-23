<template>
  <div class="pms-brand-page min-h-screen bg-slate-50 p-4 md:p-6 text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading property subtypes..." />

    <div class="mx-auto max-w-7xl space-y-5">
      <button @click="$router.push({ name: 'PropertyTypes-view' })" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"><i class="fas fa-arrow-left"></i> Back to property types</button>
      <header class="flex flex-col gap-1 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-lg font-semibold text-slate-900">{{ selectedPropertyType?.name || "Property" }} subtypes</h1>
          <p class="mt-1 text-xs text-slate-500">Manage the subtypes belonging to this property type.</p>
        </div>
        <button @click="visible = true" class="inline-flex items-center justify-center gap-2 border border-primary bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90">
          <i class="fas fa-plus"></i> Add subtype
        </button>
      </header>

      <section class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total subtypes</p>
          <p class="mt-2 text-2xl font-black text-slate-900">{{ filteredSubtypes.length }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Parent property types</p>
          <p class="mt-2 text-2xl font-black text-slate-900">{{ propertyTypes.length }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Currently displayed</p>
          <p class="mt-2 text-2xl font-black text-slate-900">{{ propertySubtypes.length }}</p>
        </div>
      </section>

      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="font-bold text-slate-900">Subtype directory</h2>
            <p class="mt-1 text-xs text-slate-500">Search by subtype name or parent type.</p>
          </div>
          <div class="relative w-full md:max-w-sm">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input v-model="searchTerm" type="search" placeholder="Search subtypes..." aria-label="Search property subtypes"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" />
          </div>
        </div>

        <div v-if="errorMessage" class="m-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700" role="alert">
          <i class="fas fa-circle-exclamation mt-0.5"></i>
          <div class="flex-1">
            <p class="font-semibold">Could not load property subtypes</p>
            <p class="mt-1 text-xs">{{ errorMessage }}</p>
          </div>
          <button @click="fetchPropertySubtypes" class="text-xs font-bold underline">Retry</button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[540px]">
            <thead class="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th class="px-5 py-3">Subtype name</th>
                <th class="px-5 py-3">Parent property type</th>
                
                <th class="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="subtype in filteredSubtypes" :key="subtype.id" class="transition hover:bg-slate-50/80">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-black uppercase text-primary">{{ initials(subtype.name) }}</span>
                    <div>
                      <p class="font-bold text-slate-900">{{ subtype.name || 'Unnamed subtype' }}</p>
                      <p class="mt-0.5 text-xs text-slate-400">Property subtype</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span class="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    <i class="fas fa-house text-slate-400"></i>{{ parentTypeName(subtype) }}
                  </span>
                </td>
                
                <td class="px-5 py-4">
                  <div class="flex justify-end gap-1.5">
                    <button @click="viewDetail(subtype.id)" :aria-label="'View ' + subtype.name" title="View details" class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-primary hover:bg-primary hover:text-white"><i class="fas fa-eye"></i></button>
                    <button @click="editSubtype(subtype)" :aria-label="'Edit ' + subtype.name" title="Edit subtype" class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-primary hover:bg-primary hover:text-white"><i class="fas fa-pen"></i></button>
                    <button @click="askDeleteConfirmation(subtype)" :aria-label="'Delete ' + subtype.name" title="Delete subtype" class="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-600 hover:text-white"><i class="fas fa-trash-alt"></i></button>
                  </div>
                </td>
              </tr>
              <tr v-if="!loading && !errorMessage && filteredSubtypes.length === 0">
                <td colspan="3" class="px-5 py-14 text-center">
                  <div class="mx-auto flex max-w-sm flex-col items-center">
                    <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><i class="fas fa-layer-group text-xl"></i></span>
                    <p class="mt-3 font-bold text-slate-800">{{ searchTerm ? 'No matching subtypes' : 'No property subtypes yet' }}</p>
                    <p class="mt-1 text-xs text-slate-500">{{ searchTerm ? 'Try a different search term.' : 'Create a subtype and assign it to a property type.' }}</p>
                    <button v-if="!searchTerm" @click="visible = true" class="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:opacity-90">Create first subtype</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer class="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-xs text-slate-500">Showing <span class="font-bold text-slate-700">{{ filteredSubtypes.length }}</span> of <span class="font-bold text-slate-700">{{ propertySubtypes.length }}</span> subtypes</p>
          <button @click="fetchPropertySubtypes" :disabled="loading" class="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-primary hover:text-primary disabled:opacity-50 sm:self-auto"><i class="fas fa-rotate" :class="{ 'fa-spin': loading }"></i> Refresh list</button>
        </footer>
      </section>
    </div>

    <AddPropertyTypes v-if="visible" :visible="visible" :parent-type-id="$route.params.id" @close="visible = false" @refresh="afterSave" />
    <EditPropertyTypes v-if="updateVisible" :data="typeToEdit" :visible="updateVisible" @close="updateVisible = false" @refresh="afterSave" />
    <ConfirmModal v-if="confirmVisible" :visible="confirmVisible" title="Delete property subtype" :message="'Delete “' + (typeToDelete?.name || 'this subtype') + '”? This action cannot be undone.'" @confirm="confirmDelete" @cancel="confirmVisible = false" />
  </div>
</template>

<script>
import AddPropertyTypes from "./AddPropertyTypes.vue";
import EditPropertyTypes from "./EditPropertyTypes.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";

export default {
  name: "PropertySubtypesView",
  components: { AddPropertyTypes, EditPropertyTypes, ConfirmModal, Toast, Loading },
  data() {
    return {
      propertySubtypes: [],
      propertyTypes: [],
      visible: false,
      updateVisible: false,
      confirmVisible: false,
      typeToEdit: null,
      typeToDelete: null,
      searchTerm: "",
      loading: false,
      errorMessage: "",
    };
  },
  computed: {
    selectedPropertyType() { return this.propertyTypes.find((item) => String(item.id) === String(this.$route.params.id)) || null; },
    filteredSubtypes() {
      const term = this.searchTerm.trim().toLowerCase();
      if (!term) return this.propertySubtypes.filter((item) => this.belongsToSelectedType(item));
      return this.propertySubtypes.filter((item) => this.belongsToSelectedType(item) && (
        String(item.name || "").toLowerCase().includes(term) ||
        this.parentTypeName(item).toLowerCase().includes(term) ||
        String(item.id ?? "").includes(term)
      ));
    },
  },
  mounted() {
    this.fetchPropertyTypes();
    this.fetchPropertySubtypes();
  },
  methods: {
    belongsToSelectedType(item) { const rel = item?.property_type; const id = rel && typeof rel === "object" ? rel.id : (item?.property_type_id ?? rel); return String(id) === String(this.$route.params.id); },
    async fetchPropertySubtypes() {
      this.loading = true;
      this.errorMessage = "";
      try {
        const result = await this.$apiGet("/get_property_subtypes", {});
        const items = Array.isArray(result) ? result : (result?.data || result?.results || result?.property_subtypes || []);
        this.propertySubtypes = items;
      } catch (error) {
        console.error("Failed to fetch property subtypes:", error);
        this.errorMessage = error?.message || "Please check your connection and try again.";
      } finally {
        this.loading = false;
      }
    },
    async fetchPropertyTypes() {
      try {
        const result = await this.$apiGet("/get_property_types", { page: 1, page_size: 1000 });
        this.propertyTypes = Array.isArray(result) ? result : (result?.data || result?.results || result?.property_types || []);
      } catch (error) {
        console.error("Failed to fetch parent property types:", error);
        this.propertyTypes = [];
      }
    },
    parentTypeName(subtype) {
      const relation = subtype?.property_type;
      if (relation && typeof relation === "object") return relation.name || relation.title || (relation.id ? "Type #" + relation.id : "Not assigned");
      const id = subtype?.property_type_id ?? relation;
      const parent = this.propertyTypes.find((item) => String(item.id) === String(id));
      return parent?.name || (id != null ? "Type #" + id : "Not assigned");
    },
    initials(name) {
      return String(name || "?").trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("") || "?";
    },
    afterSave() {
      this.visible = false;
      this.updateVisible = false;
      this.fetchPropertySubtypes();
    },
    editSubtype(subtype) {
      this.typeToEdit = { ...subtype };
      this.updateVisible = true;
    },
    askDeleteConfirmation(subtype) {
      this.typeToDelete = subtype;
      this.confirmVisible = true;
    },
    async confirmDelete() {
      if (!this.typeToDelete?.id) return;
      const target = this.typeToDelete;
      this.confirmVisible = false;
      try {
        await this.$apiDelete("/delete_property_subtype", target.id);
        this.$refs.toast?.showToast("Property subtype deleted successfully.", "success");
        this.typeToDelete = null;
        await this.fetchPropertySubtypes();
      } catch (error) {
        console.error("Failed to delete property subtype:", error);
        this.$refs.toast?.showToast(error?.message || "Could not delete this property subtype.", "error");
      }
    },
    viewDetail(id) {
      this.$router.push({ name: "PropertyTypes-detail", params: { id } });
    },
  },
};
</script>
