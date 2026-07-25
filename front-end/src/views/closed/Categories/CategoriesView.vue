
<template>
  <div class="min-h-screen bg-slate-50 p-3 md:p-4">
    <!-- Loading -->
    <Loading :visible="loading" message="Loading Categories..." />

    <!-- Page Header -->
    <div class="max-w-7xl mx-auto bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <div class="bg-gradient-to-r from-dprimary to-primary px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="bg-white/20 p-2 rounded-lg backdrop-blur-md">
            <i class="fas fa-list text-white text-lg"></i>
          </div>
          <div>
            <h1 class="text-xl font-black text-white tracking-tight uppercase">Categories</h1>
            <p class="text-white/70 text-xs uppercase tracking-widest font-semibold">Manage Categories</p>
          </div>
        </div>
        <button @click="openAddModal" class="bg-white text-primary hover:bg-slate-50 font-bold px-6 py-2.5 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 text-sm">
          <i class="fas fa-plus"></i> Add Category
        </button>
      </div>

      <!-- Search + Page Size -->
      <div class="p-4 md:p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div class="relative w-full md:w-1/3">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <i class="fas fa-search text-sm"></i>
            </span>
            <input v-model="searchQuery" @input="fetchItems(1)" type="text" placeholder="Search categories..."
              class="border-2 border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
          </div>
          <div class="flex items-center gap-3 text-xs font-semibold text-slate-600">
            <label>Show</label>
            <select v-model="pageSize" @change="fetchItems(1)" class="border-2 border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all">
              <option v-for="size in [5,10,20,50,100]" :key="size" :value="size">{{ size }}</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        <!-- Desktop Table -->
        <div class="hidden md:block overflow-hidden rounded-lg border border-slate-200 shadow-sm">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm divide-y divide-slate-100">
              <thead class="bg-gradient-to-r from-dprimary to-primary">
                <tr>
                  <th class="px-4 py-2.5 text-left text-xs font-black text-white uppercase tracking-wider">#</th>
                  <th class="px-4 py-2.5 text-left text-xs font-black text-white uppercase tracking-wider">
                    <i class="fas fa-tag text-white/70 mr-2"></i>Name
                  </th>
                  <th class="px-4 py-2.5 text-left text-xs font-black text-white uppercase tracking-wider">
                    <i class="fas fa-align-left text-white/70 mr-2"></i>Description
                  </th>
                  <th class="px-4 py-2.5 text-center text-xs font-black text-white uppercase tracking-wider">
                    <i class="fas fa-cog text-white/70"></i> Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-100">
                <tr v-for="(item, index) in items" :key="item.id" class="hover:bg-slate-50 transition-colors group">
                  <td class="px-4 py-2 whitespace-nowrap text-xs font-semibold text-slate-600">{{ index + 1 }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-xs font-semibold text-slate-800 group-hover:text-primary transition-colors">{{ item.name }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-xs text-slate-600 truncate max-w-xs">{{ item.description }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-center">
                    <div class="flex justify-center gap-1">
                      <button @click="viewDetails(item.id)" class="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm" title="View">
                        <i class="fas fa-eye text-xs"></i>
                      </button>
                      <button @click="editItem(item)" class="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm" title="Edit">
                        <i class="fas fa-edit text-xs"></i>
                      </button>
                      <button @click="openDeleteModal(item.id)" class="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Delete">
                        <i class="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="items.length === 0">
                  <td colspan="4" class="text-center py-8 text-slate-400">
                    <div class="flex flex-col items-center">
                      <i class="fas fa-inbox text-3xl mb-2"></i>
                      <p class="text-xs font-medium">No categories found</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden space-y-3">
          <div v-for="(item, index) in items" :key="item.id" class="bg-white border-l-4 border-l-primary rounded-lg shadow-sm p-4 border border-slate-200">
            <div class="flex justify-between items-start mb-3">
              <h2 class="font-bold text-slate-800 text-sm">Category #{{ index + 1 }}</h2>
              <div class="flex gap-2">
                <button @click="viewDetails(item.id)" class="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-xs">
                  <i class="fas fa-eye"></i>
                </button>
                <button @click="editItem(item)" class="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-xs">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="openDeleteModal(item.id)" class="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
            <div class="space-y-2 text-xs text-slate-700">
              <div>
                <span class="font-semibold text-slate-600">Name:</span>
                <p class="text-slate-800">{{ item.name }}</p>
              </div>
              <div>
                <span class="font-semibold text-slate-600">Description:</span>
                <p class="text-slate-800">{{ item.description }}</p>
              </div>
            </div>
          </div>
          <p v-if="items.length === 0" class="text-center text-slate-400 py-8 text-xs font-medium">No categories found.</p>
        </div>

        <!-- Pagination -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4 text-xs text-slate-600">
          <span class="font-medium">
            Showing {{ (currentPage - 1) * pageSize + 1 }} 
            to {{ Math.min(currentPage * pageSize, count) }} 
            of {{ count }} total entries
          </span>
          <div class="flex items-center gap-2">
            <button @click="fetchItems(currentPage - 1)" :disabled="!previousPage"
              class="px-4 py-2 border-2 border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-xs">← Previous</button>
            <span class="px-4 py-2 bg-gradient-to-r from-dprimary to-primary text-white rounded-lg font-black text-xs">{{ currentPage }}</span>
            <button @click="fetchItems(currentPage + 1)" :disabled="!nextPage"
              class="px-4 py-2 border-2 border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-xs">Next →</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <add-categories v-if="showModal && !editMode" :data="selectedItem" @close="showModal=false" @saved="fetchItems"/>
    <edit-categories v-if="showModal && editMode" :data="selectedItem" @close="showModal=false" @saved="fetchItems"/>

    <!-- Delete Confirmation Modal -->
    <delete-confirm-modal 
      :visible="deleteModalVisible"
      title="Delete Categories"
      message="Are you sure you want to delete this Categories?"
      @confirm="confirmDelete"
      @cancel="deleteModalVisible=false"
    />
  </div>
</template>

<script>
import AddCategories from "./AddCategories.vue";
import EditCategories from "./EditCategories.vue";
import Loading from "@/components/Loading.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";

export default {
  components: { AddCategories, EditCategories, Loading, DeleteConfirmModal },

  data() {
    return {
      items: [],
      count: 0,
      nextPage: null,
      previousPage: null,
      currentPage: 1,
      pageSize: 10,
      searchQuery: "",
      showModal: false,
      editMode: false,
      selectedItem: null,
      loading: false,
      deleteModalVisible: false,
      deleteId: null,
    };
  },

  methods: {
    async fetchItems(page = 1) {
      this.loading = true;
      this.currentPage = page;
      const params = { page: this.currentPage, page_size: this.pageSize, search: this.searchQuery };
      try {
        const response = await this.$apiGet('/categories', params);
        this.items = response.data;
        this.count = response.count || 0;
        this.nextPage = response.next || null;
        this.previousPage = response.previous || null;
      } catch(e) { console.error(e); }
      finally { this.loading = false; }
    },

    openAddModal() { this.editMode = false; this.selectedItem = null; this.showModal = true; },
    editItem(item) { this.editMode = true; this.selectedItem = item; this.showModal = true; },
    
    // Navigate using static route name
    viewDetails(id) { 
      this.$router.push({ name: 'Categories-detail', params: { id } });
    },

    openDeleteModal(id) { this.deleteId = id; this.deleteModalVisible = true; },

    // Delete with toast
    async confirmDelete() {
      const res = await this.$apiDelete('/categories', this.deleteId);
      if(res) {
        this.$root.$refs.toast.showToast('Categories deleted successfully', 'success');
      }
      this.deleteModalVisible = false;
      this.fetchItems(this.currentPage);
    },
  },

  mounted() { this.fetchItems(); }
};
</script>
