<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm">
    <Loading :visible="loading" message="Loading System Configurations..." />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">System Configurations</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Application Settings</p>
      </div>
      
      <!-- Add Button: Visible only when no data exists -->
      <button 
        v-if="items.length === 0 && !loading"
        @click="openAddModal" 
        class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
      >
        <i class="fas fa-plus text-xs"></i> Add Configuration
      </button>
    </div>

    <!-- Search + Page Size -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
      <div class="relative flex-1 max-w-sm">
        <input 
          v-model="searchQuery" 
          type="search" 
          placeholder="Search configurations..." 
          @input="fetchItems(1)" 
          class="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" 
        />
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <label class="font-semibold">Show</label>
        <select 
          v-model="pageSize" 
          @change="fetchItems(1)" 
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition cursor-pointer"
        >
          <option v-for="size in [5,10,20,50,100]" :key="size" :value="size">{{ size }}</option>
        </select>
        <span class="font-semibold">entries</span>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left">#</th>
              <th class="px-4 py-3 text-left">Key</th>
              <th class="px-4 py-3 text-left">Value</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr 
              v-for="(item, index) in items" 
              :key="item.id" 
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 text-gray-500 font-medium">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="px-4 py-3 font-medium text-gray-800">{{ item.key }}</td>
              <td class="px-4 py-3 text-gray-600 truncate max-w-md">{{ item.value }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-1">
                  <button 
                    @click="editItem(item)" 
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white transition text-xs"
                    title="Edit"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                </div>
              </td>
            </tr>
            
            <tr v-if="items.length === 0 && !loading">
              <td colspan="4" class="px-4 py-12 text-center">
                <div class="flex flex-col items-center">
                  <i class="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                  <p class="text-gray-400 font-medium">No configurations found</p>
                  <p class="text-gray-400 text-xs mt-1">Add your first configuration to get started</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="items.length > 0" class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">
        Showing 
        <span class="font-semibold text-gray-700">{{ (currentPage - 1) * pageSize + 1 }}</span> 
        to 
        <span class="font-semibold text-gray-700">{{ Math.min(currentPage * pageSize, count) }}</span> 
        of 
        <span class="font-semibold text-gray-700">{{ count }}</span> entries
      </span>
      <div class="flex gap-2">
        <button 
          :disabled="!previousPage" 
          @click="fetchItems(currentPage - 1)" 
          class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <span class="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-semibold flex items-center">
          {{ currentPage }}
        </span>
        <button 
          :disabled="!nextPage" 
          @click="fetchItems(currentPage + 1)" 
          class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <AddSystemConfigurations 
      v-if="showModal && !editMode" 
      :data="selectedItem" 
      @close="closeModal" 
      @saved="handleSaved" 
    />
    <EditSystemConfigurations 
      v-if="showModal && editMode" 
      :data="selectedItem" 
      @close="closeModal" 
      @saved="handleSaved" 
    />
    <DeleteConfirmModal 
      :visible="deleteModalVisible"
      title="Delete Configuration"
      message="Are you sure you want to delete this system configuration?"
      @confirm="confirmDelete"
      @cancel="deleteModalVisible = false"
    />
  </div>
</template>

<script>
import AddSystemConfigurations from "./AddSystemConfigurations.vue";
import EditSystemConfigurations from "./EditSystemConfigurations.vue";
import Loading from "@/components/Loading.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";

export default {
  name: "SystemConfigurationsView",
  components: { 
    AddSystemConfigurations, 
    EditSystemConfigurations, 
    Loading, 
    DeleteConfirmModal 
  },

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

      const params = {
        page: this.currentPage,
        page_size: this.pageSize,
        search: this.searchQuery,
      };

      try {
        const response = await this.$apiGet('/get_system_configurations', params);
        this.items = response.data || [];
        this.count = response.count || 0;
        this.nextPage = response.next || null;
        this.previousPage = response.previous || null;
      } catch (e) {
        console.error(e);
        this.items = [];
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.editMode = false;
      this.selectedItem = null;
      this.showModal = true;
    },

    editItem(item) {
      this.editMode = true;
      this.selectedItem = { ...item };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.selectedItem = null;
    },

    handleSaved() {
      this.closeModal();
      this.fetchItems(this.currentPage);
    },

    openDeleteModal(id) {
      this.deleteId = id;
      this.deleteModalVisible = true;
    },

    async confirmDelete() {
      if (!this.deleteId) return;

      try {
        const res = await this.$apiDelete('/delete_system_configuration', this.deleteId);
        if (res) {
          this.$root.$refs.toast?.showToast('System configuration deleted successfully', 'success');
        }
        this.deleteModalVisible = false;
        this.fetchItems(this.currentPage);
      } catch (e) {
        console.error(e);
        this.$root.$refs.toast?.showToast('Failed to delete configuration', 'error');
      } finally {
        this.deleteId = null;
      }
    },
  },

  mounted() {
    this.fetchItems();
  },
};
</script>