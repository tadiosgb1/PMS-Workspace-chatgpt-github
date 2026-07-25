<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading tenants..." />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Tenants</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Manage Property Tenants</p>
      </div>
      <button 
        @click="addTenantVisible = true"
        class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
      >
        <i class="fas fa-plus text-xs"></i> Add Tenant
      </button>
    </div>

    <!-- Search + Filter -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3 bg-white p-4 rounded-lg border border-gray-100">
      <div class="relative flex-1 max-w-sm">
        <input 
          v-model="searchTerm" 
          @input="onSearchInput" 
          type="search" 
          placeholder="Search by name, email, phone..." 
          class="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" 
        />
      </div>

      <div class="flex items-center gap-2 text-xs text-gray-500">
        <label class="font-semibold">Show</label>
        <select v-model="pageSize" @change="fetchTenants()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition cursor-pointer">
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
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('first_name')">
                Name <SortIcon field="first_name" :sort-key="sortKey" :sort-asc="sortAsc" />
              </th>
              <th class="px-4 py-3 text-left">Email</th>
              <th class="px-4 py-3 text-left">Phone</th>
              <th class="px-4 py-3 text-left">Property</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="tenant in tenants" :key="tenant.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {{ ((tenant.first_name||'')[0]||'') }}{{ ((tenant.last_name||'')[0]||'') }}
                  </div>
                  <span class="font-semibold text-gray-800">
                    {{ formatFullName(tenant) }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-gray-600">{{ tenant.email || '—' }}</td>
              <td class="px-4 py-3 text-xs text-gray-600">{{ tenant.phone_number || '—' }}</td>
              <td class="px-4 py-3 text-xs text-gray-700">{{ tenant.property_id?.name || '—' }}</td>
              <td class="px-4 py-3 text-center">
                <span 
                  :class="tenant.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                >
                  {{ tenant.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button 
                    @click="goToDetail(tenant.id)" 
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition text-xs"
                    title="View Details"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    v-if="!tenant.is_active"
                    @click="askConfirmation('activate', tenant.id)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition text-xs"
                    title="Activate"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button 
                    v-else
                    @click="askConfirmation('deactivate', tenant.id)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition text-xs"
                    title="Deactivate"
                  >
                    <i class="fas fa-power-off"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="tenants.length === 0 && !loading">
              <td colspan="6" class="px-4 py-12 text-center text-sm text-gray-400 italic">
                No tenants found.
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
        <button :disabled="!previous" @click="fetchTenants(previous)" class="btn-page">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <span class="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-bold min-w-[2rem] text-center">
          {{ currentPage }}
        </span>
        <button :disabled="!next" @click="fetchTenants(next)" class="btn-page">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <ConfirmModal 
      :visible="showConfirm" 
      :title="confirmTitle" 
      :message="confirmMessage" 
      @confirm="confirmAction" 
      @cancel="showConfirm = false" 
    />
    
    <addTenant 
      v-if="addTenantVisible" 
      :visible="addTenantVisible" 
      @close="addTenantVisible = false" 
      @success="fetchTenants" 
    />
  </div>
</template>

<script>
import ConfirmModal from "@/components/ConfirmModal.vue";
import Toast from "@/components/Toast.vue";
import addTenant from "./add.vue";
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
  name: "TenantView",
  components: { SortIcon, ConfirmModal, Toast, addTenant, Loading },

  data() {
    return {
      addTenantVisible: false,
      tenants: [],
      searchTerm: "",
      searchTimeout: null,
      sortKey: "first_name",
      sortAsc: true,
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
      pageSize: 10,
      pageSizes: [5, 10, 20, 50, 100],
      showConfirm: false,
      selectedUser: null,
      selectedAction: null,
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
    this.fetchTenants();
  },

  methods: {
    async fetchTenants(url = null) {
      this.loading = true;
      try {
        const res = await this.$getTenants(url || null, this.pageSize, this.searchTerm);
        this.tenants = res.tenants || res.data || [];
        this.currentPage = res.currentPage || 1;
        this.totalPages = res.totalPages || 1;
        this.next = res.next || null;
        this.previous = res.previous || null;
      } catch (e) {
        console.error(e);
        this.tenants = [];
      } finally {
        this.loading = false;
      }
    },

    onSearchInput() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.fetchTenants();
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
        this.fetchTenants();
      } catch (err) {
        console.error(err);
        this.$root.$refs.toast?.showToast("Operation failed", "error");
      } finally {
        this.showConfirm = false;
      }
    },

    goToDetail(id) {
      this.$router.push(`/user_detail/${id}`);
    },

    formatFullName(t) {
      return [t.first_name, t.middle_name, t.last_name]
        .filter(Boolean)
        .join(" ") || `Tenant #${t.id}`;
    },
  },
};
</script>

<style scoped>
.btn-page {
  @apply flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all;
}
</style>