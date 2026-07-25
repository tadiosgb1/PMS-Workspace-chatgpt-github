<template>
  <div class="p-6 bg-slate-50 min-h-screen text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading owners..." />

    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 tracking-tight">Owners</h1>
        <p class="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">Manage Property Owners</p>
      </div>
      <button 
        @click="showAddOwner = true"
        class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
      >
        <i class="fas fa-plus text-xs"></i> Add Owner
      </button>
    </div>

    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
      <div class="relative flex-1 max-w-sm">
        <input 
          v-model="searchTerm" 
          @input="onSearchInput" 
          type="search" 
          placeholder="Search owners..." 
          class="border border-slate-200 rounded-lg px-4 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition" 
        />
      </div>

      <div class="flex items-center gap-2 text-xs text-slate-500">
        <label class="font-semibold">Show</label>
        <select v-model="pageSize" @change="fetchOwners()" class="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition cursor-pointer">
          <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th class="px-5 py-3.5 text-left cursor-pointer hover:text-slate-700 transition" @click="sortBy('first_name')">
                Name <SortIcon field="first_name" :sort-key="sortKey" :sort-asc="sortAsc" />
              </th>
              <th class="px-5 py-3.5 text-left">Email</th>
              <th class="px-5 py-3.5 text-left">Phone</th>
              <th class="px-5 py-3.5 text-left">Date Joined</th>
              <th class="px-5 py-3.5 text-center">Status</th>
              <th class="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="owner in owners" :key="owner.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {{ owner.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('') || '?' }}
                  </div>
                  <span class="font-semibold text-slate-800">{{ owner.full_name || '—' }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-600 font-medium">{{ owner.email || '—' }}</td>
              <td class="px-5 py-3.5 text-xs text-slate-600 font-medium">{{ owner.phone_number || '—' }}</td>
              <td class="px-5 py-3.5 text-xs text-slate-500 font-medium">
                {{ owner.date_joined ? new Date(owner.date_joined).toLocaleDateString() : '—' }}
              </td>
              <td class="px-5 py-3.5 text-center">
                <span 
                  :class="owner.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'"
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide"
                >
                  <span :class="owner.is_active ? 'bg-emerald-500' : 'bg-rose-500'" class="w-1.5 h-1.5 rounded-full"></span>
                  {{ owner.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="goToDetail(owner.id)" 
                    class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline px-2 py-1 transition"
                  >
                    View Details
                  </button>

                  <button 
                    v-if="!owner.is_active"
                    @click="askConfirmation('activate', owner.id)"
                    class="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-2.5 py-1 rounded transition"
                  >
                    Activate
                  </button>
                  
                  <button 
                    v-else
                    @click="askConfirmation('deactivate', owner.id)"
                    class="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white px-2.5 py-1 rounded transition"
                  >
                    Deactivate
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="owners.length === 0 && !loading">
              <td colspan="6" class="px-5 py-12 text-center text-sm text-slate-400 italic">
                No owners found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
      <span class="text-xs text-slate-500">
        Page <span class="font-semibold text-slate-700">{{ currentPage }}</span> of 
        <span class="font-semibold text-slate-700">{{ totalPages }}</span>
      </span>
      <div class="flex gap-2">
        <button :disabled="!previous" @click="fetchOwners(previous)" class="btn-page">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <span class="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold min-w-[2rem] text-center">
          {{ currentPage }}
        </span>
        <button :disabled="!next" @click="fetchOwners(next)" class="btn-page">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <AddOwner 
      v-if="showAddOwner" 
      :visible="showAddOwner" 
      @close="showAddOwner = false" 
      @success="fetchOwners" 
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
import AddOwner from "./add.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";

const SortIcon = {
  props: ["field", "sortKey", "sortAsc"],
  template: `<span class="inline-block ml-1 text-slate-400">
    <svg v-if="sortKey !== field" class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
    <svg v-else-if="sortAsc" class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 13l4 4 4-4m0-6l-4-4-4 4"/></svg>
    <svg v-else class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
  </span>`,
};

export default {
  name: "OwnersView",
  components: { SortIcon, AddOwner, ConfirmModal, Toast, Loading },

  data() {
    return {
      owners: [],
      showAddOwner: false,
      showConfirm: false,
      selectedUser: null,
      selectedAction: null,
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
      loading: false,
    };
  },

  computed: {
    confirmTitle() {
      return this.selectedAction === "activate" ? "Activate Owner" : "Deactivate Owner";
    },
    confirmMessage() {
      return this.selectedAction === "activate"
        ? "Are you sure you want to activate this owner?"
        : "Are you sure you want to deactivate this owner?";
    },
  },

  mounted() {
    this.fetchOwners();
  },

  methods: {
    goToDetail(id) {
      this.$router.push({ name: 'owner-detail', params: { id } });
    },

    async fetchOwners(url = null) {
      this.loading = true;
      try {
        const params = {
          search: this.searchTerm || '',
          page_size: this.pageSize,
        };

        const res = await this.$apiGet(url || `/get_owners`, params);
        
        // Match the API format precisely
        const rawList = res.data || res.owners || res.results || [];
        
        this.owners = rawList.map(owner => {
          // Fallback to safely construct full name from fragmented pieces
          const parts = [owner.first_name, owner.middle_name, owner.last_name].filter(Boolean);
          const computedFullName = parts.length > 0 ? parts.join(' ') : owner.email?.split('@')[0];
          
          return {
            ...owner,
            full_name: computedFullName
          };
        });

        this.currentPage = res.current_page || res.page || 1;
        this.totalPages = res.total_pages || res.total_pages || 1;
        this.next = res.next;
        this.previous = res.previous;
      } catch (e) {
        console.error(e);
        this.owners = [];
      } finally {
        this.loading = false;
      }
    },

    onSearchInput() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.fetchOwners();
      }, 400);
    },

    sortBy(key) {
      if (this.sortKey === key) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortKey = key;
        this.sortAsc = true;
      }
      this.fetchOwners();
    },

    askConfirmation(action, id) {
      this.selectedUser = id;
      this.selectedAction = action;
      this.showConfirm = true;
    },

    async confirmAction() {
      if (!this.selectedUser || !this.selectedAction) return;

      try {
        if (this.selectedAction === "activate") {
          await this.$apiPost(`/activate_user/${this.selectedUser}`, {});
          this.$root.$refs.toast?.showToast("Owner activated successfully", "success");
        } else {
          await this.$apiDelete(`/deactivate_user`,this.selectedUser);
          this.$root.$refs.toast?.showToast("Owner deactivated successfully", "success");
        }
        this.fetchOwners();
      } catch (e) {
        console.error(e);
        this.$root.$refs.toast?.showToast("Action failed", "error");
      } finally {
        this.showConfirm = false;
        this.selectedUser = null;
        this.selectedAction = null;
      }
    },
  },
};
</script>

<style scoped>
.btn-page {
  @apply flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all;
}
</style>