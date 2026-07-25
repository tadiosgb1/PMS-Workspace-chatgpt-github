<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading managers..." />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Managers</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Manage Property Managers</p>
      </div>
      <button 
        @click="showAddManager = true"
        class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
      >
        <i class="fas fa-plus text-xs"></i> Add Manager
      </button>
    </div>

    <!-- Search + Filter -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3 bg-white p-4 rounded-lg border border-gray-100">
      <div class="relative flex-1 max-w-sm">
        <input 
          v-model="searchTerm" 
          @input="onSearchInput" 
          type="search" 
          placeholder="Search managers..." 
          class="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" 
        />
      </div>

      <div class="flex items-center gap-2 text-xs text-gray-500">
        <label class="font-semibold">Show</label>
        <select v-model="pageSize" @change="fetchManagers()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition cursor-pointer">
          <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('fullName')">
                Name <SortIcon field="fullName" :sort-key="sortKey" :sort-asc="sortAsc" />
              </th>
              <th class="px-4 py-3 text-left">Email</th>
              <th class="px-4 py-3 text-left">Groups</th>
              <th class="px-4 py-3 text-left">Owner</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="manager in managers" :key="manager.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {{ ((manager.manager.first_name||'')[0]||'') }}{{ ((manager.manager.last_name||'')[0]||'') }}
                  </div>
                  <span class="font-semibold text-gray-800">
                    {{ manager.manager.first_name }} {{ manager.manager.middle_name }} {{ manager.manager.last_name }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-gray-600">{{ manager.manager.email || '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="g in manager.manager.groups" 
                    :key="g" 
                    class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold uppercase border border-gray-200"
                  >
                    {{ g }}
                  </span>
                  <span v-if="!manager.manager.groups?.length" class="text-xs text-gray-300 italic">—</span>
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-gray-700">
                <div class="flex items-center gap-1">
                  <i class="fas fa-crown text-amber-400 text-[10px]"></i>
                  {{ manager.owner.first_name }} {{ manager.owner.last_name }}
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <span 
                  :class="manager.is_active ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
                  class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                >
                  {{ manager.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <router-link 
                    :to="`/user_detail/${manager.id}`" 
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition text-xs"
                    title="View Details"
                  >
                    <i class="fas fa-eye"></i>
                  </router-link>
                  <button 
                    v-if="!manager.is_active"
                    @click="askConfirmation('activate', manager.id)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition text-xs"
                    title="Activate"
                  >
                    <i class="fas fa-power-off"></i>
                  </button>
                  <button 
                    v-else
                    @click="askConfirmation('deactivate', manager.id)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition text-xs"
                    title="Deactivate"
                  >
                    <i class="fas fa-ban"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="managers.length === 0 && !loading">
              <td colspan="6" class="px-4 py-12 text-center text-sm text-gray-400 italic">
                No managers found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">
        Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of 
        <span class="font-semibold text-gray-700">{{ totalPages }}</span>
      </span>
      <div class="flex gap-2">
        <button :disabled="!previous" @click="fetchManagers(previous)" class="btn-page">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <span class="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-bold min-w-[2rem] text-center">
          {{ currentPage }}
        </span>
        <button :disabled="!next" @click="fetchManagers(next)" class="btn-page">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <AddManager 
      v-if="showAddManager" 
      :visible="showAddManager" 
      @close="showAddManager = false" 
      @success="fetchManagers" 
    />
    
    <ConfirmModal 
      :visible="showConfirm" 
      :title="confirmTitle" 
      :message="confirmMessage" 
      @confirm="confirmAction" 
      @cancel="showConfirm = false" 
    />
  </div>
</template>

<script>
import AddManager from "./add.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";

const SortIcon = {
  props: ["field", "sortKey", "sortAsc"],
  template: `<span class="inline-block ml-1 text-gray-400">
    <svg v-if="sortKey !== field" class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
    <svg v-else-if="sortAsc" class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 13l4 4 4-4m0-6l-4-4-4 4"/></svg>
    <svg v-else class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
  </span>`,
};

export default {
  name: "ManagersView",
  components: { SortIcon, AddManager, ConfirmModal, Toast, Loading },

  data() {
    return {
      managers: [],
      showAddManager: false,
      showConfirm: false,
      selectedUser: null,
      selectedAction: null,
      searchTerm: "",
      searchTimeout: null,
      sortKey: "fullName",
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

  computed: {
    confirmTitle() {
      return this.selectedAction === "activate" ? "Activate User" : "Deactivate User";
    },
    confirmMessage() {
      return this.selectedAction === "activate"
        ? "Are you sure you want to activate this user?"
        : "Are you sure you want to deactivate this user?";
    },
  },

  mounted() {
    if (this.$hasPermission("pms.view_ownermanager") || localStorage.getItem("is_superuser") === "true") {
      this.fetchManagers();
    } else {
      this.$router.push({ name: "accessDenied" });
    }
  },

  methods: {
    async fetchManagers(url = null) {
      this.loading = true;
      try {
        const result = await this.$getManagers(this.searchTerm);
        this.managers = result.managers || [];
        this.currentPage = result.currentPage || 1;
        this.totalPages = result.totalPages || 1;
        this.next = result.next;
        this.previous = result.previous;
      } catch (e) {
        console.error(e);
        this.managers = [];
      } finally {
        this.loading = false;
      }
    },

    onSearchInput() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.fetchManagers();
      }, 400);
    },

    sortBy(key) {
      if (this.sortKey === key) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortKey = key;
        this.sortAsc = true;
      }
    },

    askConfirmation(action, id) {
      this.selectedUser = id;
      this.selectedAction = action;
      this.showConfirm = true;
    },

    async confirmAction() {
      if (!this.selectedUser || !this.selectedAction) return;

      const promise = this.selectedAction === "activate"
        ? this.$apiPost(`/activate_user/${this.selectedUser}`, { id: this.selectedUser })
        : this.$apiDelete(`/deactivate_user`, this.selectedUser);

      try {
        await promise;
        this.$root.$refs.toast?.showToast(
          this.selectedAction === "activate" ? "User activated" : "User deactivated",
          "success"
        );
        this.fetchManagers();
      } catch (err) {
        console.error(err);
        this.$root.$refs.toast?.showToast("Operation failed", "error");
      } finally {
        this.showConfirm = false;
      }
    },
  },
};
</script>

<style scoped>
.btn-page {
  @apply flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all;
}
</style>