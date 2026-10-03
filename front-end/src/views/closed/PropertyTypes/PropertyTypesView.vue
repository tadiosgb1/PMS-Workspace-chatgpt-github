<template>
  <div class="p-6 bg-background min-h-screen text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading property types..." />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-primary tracking-tight">Property Types</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Manage Property Categories</p>
      </div>
      <button 
        @click="visible = true"
        class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
      >
        <i class="fas fa-plus text-xs"></i> Add Property Type
      </button>
    </div>

    <!-- Search + Filter -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3 bg-white p-4 rounded-lg border border-primary/10">
      <div class="relative flex-1 max-w-sm">
        <input 
          v-model="searchTerm" 
          @input="onSearchInput" 
          type="search" 
          placeholder="Search property types..." 
          class="border border-primary/20 rounded-lg px-4 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-primary transition" 
        />
      </div>

      <div class="flex items-center gap-2 text-xs text-gray-500">
        <label class="font-semibold">Show</label>
        <select v-model="pageSize" @change="fetchPropertyTypes(1)" class="border border-primary/20 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary transition cursor-pointer">
          <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-primary/10">
            <tr>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-primary transition" @click="sortBy('name')">
                Type Name <SortIcon field="name" :sort-key="sortKey" :sort-asc="sortAsc" />
              </th>
              <th class="px-4 py-3 text-left">Description</th>
              <th class="px-4 py-3 text-center">Sellable / Rentable</th>
              <th class="px-4 py-3 text-center">Features</th>
              <th class="px-4 py-3 text-center">Created Date</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="type in propertyTypes" :key="type.id" class="hover:bg-primary/5 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-background text-gray-700 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {{ (type.name || '').substring(0, 2) }}
                  </div>
                  <span class="font-semibold text-primary">{{ type.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{{ type.description || '—' }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <span :class="type.is_sellable ? 'bg-green-100 text-green-700' : 'bg-background text-gray-400'"
                    class="px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    {{ type.is_sellable ? 'Sell' : 'No Sell' }}
                  </span>
                  <span :class="type.is_rentable ? 'bg-blue-100 text-blue-700' : 'bg-background text-gray-400'"
                    class="px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    {{ type.is_rentable ? 'Rent' : 'No Rent' }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex flex-wrap justify-center gap-1">
                  <span v-if="type.has_floor"        class="feat-badge">Floor</span>
                  <span v-if="type.has_bedroom"      class="feat-badge">Bed</span>
                  <span v-if="type.has_bathroom"     class="feat-badge">Bath</span>
                  <span v-if="type.has_house_number" class="feat-badge">House#</span>
                  <span v-if="type.has_block_number" class="feat-badge">Block#</span>
                  <span v-if="type.has_furnishing"   class="feat-badge">Furnish</span>
                  <span v-if="!type.has_floor && !type.has_bedroom && !type.has_bathroom && !type.has_house_number && !type.has_block_number && !type.has_furnishing"
                    class="text-xs text-gray-300">—</span>
                </div>
              </td>
              <td class="px-4 py-3 text-center text-xs text-gray-500">{{ formatDate(type.created_at) }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="viewDetail(type.id)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white hover:text-white transition text-xs"
                    title="View Detail"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    @click="editPropertyType(type)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-background text-gray-700 hover:bg-gray-600 hover:text-white transition text-xs"
                    title="Edit"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    v-if="$hasPermission('pms.delete_propertytype')"
                    @click="askDeleteConfirmation(type)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition text-xs"
                    title="Delete"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="propertyTypes.length === 0 && !loading">
              <td colspan="6" class="px-4 py-12 text-center text-sm text-gray-400 italic">
                No property types found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-primary/10">
      <span class="text-xs text-gray-500">
        Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of 
        <span class="font-semibold text-gray-700">{{ totalPages }}</span>
      </span>
      <div class="flex gap-2">
        <button :disabled="!previous" @click="fetchPropertyTypes(previous)" class="btn-page">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <span class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold min-w-[2rem] text-center">
          {{ currentPage }}
        </span>
        <button :disabled="!next" @click="fetchPropertyTypes(next)" class="btn-page">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <AddPropertyTypes 
      v-if="visible" 
      :visible="visible" 
      @close="visible = false" 
      @refresh="fetchPropertyTypes" 
    />
    
    <EditPropertyTypes 
      v-if="updateVisible" 
      :data="typeToEdit" 
      :visible="updateVisible" 
      @close="updateVisible = false" 
      @refresh="fetchPropertyTypes" 
    />
    
    <ConfirmModal 
      v-if="confirmVisible" 
      :visible="confirmVisible" 
      title="Delete Property Type"
      message="This is permanent. Remove this property type?" 
      @confirm="confirmDelete" 
      @cancel="confirmVisible = false" 
    />
  </div>
</template>

<script>
import AddPropertyTypes from "./AddPropertyTypes.vue";
import EditPropertyTypes from "./EditPropertyTypes.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";

const SortIcon = {
  props: ["field", "sortKey", "sortAsc"],
  template: `<span class="inline-block ml-1 text-primary">
    <svg v-if="sortKey !== field" class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
    <svg v-else-if="sortAsc" class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 13l4 4 4-4m0-6l-4-4-4 4"/></svg>
    <svg v-else class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
  </span>`,
};

export default {
  name: "PropertyTypesView",
  components: { AddPropertyTypes, EditPropertyTypes, ConfirmModal, SortIcon, Toast, Loading },

  data() {
    return {
      propertyTypes: [],
      visible: false,
      updateVisible: false,
      confirmVisible: false,
      typeToEdit: null,
      typeToDelete: null,
      searchTerm: "",
      searchTimeout: null,
      sortKey: "name",
      sortAsc: true,
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
      pageSize: 10,
      pageSizes: [5, 10, 20, 50, 100],
      loading: false,
    };
  },

  mounted() {
    this.fetchPropertyTypes();
  },

  methods: {
    async fetchPropertyTypes(url = null) {
      this.loading = true;
      try {
        let requestUrl = url || `/get_property_types`;

        const params = {
          page: this.currentPage,
          page_size: this.pageSize,
        };

        if (this.searchTerm) params.search = this.searchTerm;

        const result = await this.$apiGet(requestUrl, params);

        this.propertyTypes = result.data || [];
        this.currentPage = result.current_page || 1;
        this.totalPages = result.total_pages || 1;
        this.next = result.next;
        this.previous = result.previous;
      } catch (err) {
        console.error("Failed to fetch property types:", err);
        this.propertyTypes = [];
      } finally {
        this.loading = false;
      }
    },

    onSearchInput() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.fetchPropertyTypes();
      }, 400);
    },

    sortBy(field) {
      if (this.sortKey === field) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortKey = field;
        this.sortAsc = true;
      }
    },

    editPropertyType(type) {
      this.typeToEdit = { ...type };   // Deep copy to avoid mutation
      this.updateVisible = true;
    },

    askDeleteConfirmation(type) {
      this.typeToDelete = type;
      this.confirmVisible = true;
    },

    async confirmDelete() {
      if (!this.typeToDelete) return;
      this.confirmVisible = false;

      try {
        await this.$apiDelete(`/delete_property_type/${this.typeToDelete.id}`);
        this.$root.$refs.toast?.showToast("Property type deleted successfully", "success");
        this.fetchPropertyTypes();
      } catch (err) {
        console.error(err);
        this.$root.$refs.toast?.showToast("Failed to delete property type", "error");
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "—";
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },

    viewDetail(id) {
      this.$router.push({ name: 'PropertyTypes-detail', params: { id } });
    },
  },
};
</script>

<style scoped>
.btn-page {
  @apply flex items-center gap-1.5 px-3 py-1.5 border border-primary/20 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all;
}
</style>