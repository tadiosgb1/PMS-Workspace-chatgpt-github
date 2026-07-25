<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading staff..." />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Staffs</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Manage Owner Staff Members</p>
      </div>
      <button 
        @click="showAddStaff = true"
        class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
      >
        <i class="fas fa-plus text-xs"></i> Add Staff
      </button>
    </div>

    <!-- Search + Filter -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3 bg-white p-4 rounded-lg border border-gray-100">
      <div class="relative flex-1 max-w-sm">
        <input 
          v-model="searchTerm" 
          @input="onSearchInput" 
          type="search" 
          placeholder="Search staff by name, email or group..." 
          class="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" 
        />
      </div>

      <div class="flex items-center gap-2 text-xs text-gray-500">
        <label class="font-semibold">Show</label>
        <select v-model="pageSize" @change="fetchStaffs()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition cursor-pointer">
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
              <th class="px-4 py-3 text-left">Phone</th>
              <th class="px-4 py-3 text-left">Groups</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="staff in filteredAndSortedStaffs" :key="staff.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {{ ((staff.staff.first_name||'')[0]||'') }}{{ ((staff.staff.last_name||'')[0]||'') }}
                  </div>
                  <span class="font-semibold text-gray-800">
                    {{ staff.staff.first_name }} {{ staff.staff.middle_name }} {{ staff.staff.last_name }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-gray-600">{{ staff.staff.email || '—' }}</td>
              <td class="px-4 py-3 text-xs text-gray-600">{{ staff.staff.phone_number || '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="g in staff.staff.groups" 
                    :key="g" 
                    class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold uppercase border border-gray-200"
                  >
                    {{ g }}
                  </span>
                  <span v-if="!staff.staff.groups?.length" class="text-xs text-gray-300 italic">—</span>
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <span 
                  :class="staff.staff.is_active ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
                  class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                >
                  {{ staff.staff.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <router-link 
                    :to="`/user_detail/${staff.staff.id}`" 
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition text-xs"
                    title="View Details"
                  >
                    <i class="fas fa-eye"></i>
                  </router-link>
                  <button 
                    v-if="!staff.staff.is_active"
                    @click="activateUser(staff.id)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition text-xs"
                    title="Activate"
                  >
                    <i class="fas fa-power-off"></i>
                  </button>
                  <button 
                    v-else
                    @click="deactivateUser(staff.id)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition text-xs"
                    title="Deactivate"
                  >
                    <i class="fas fa-ban"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAndSortedStaffs.length === 0 && !loading">
              <td colspan="6" class="px-4 py-12 text-center text-sm text-gray-400 italic">
                No staff found.
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
        <button :disabled="!previous" @click="fetchStaffs(previous)" class="btn-page">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <span class="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-bold min-w-[2rem] text-center">
          {{ currentPage }}
        </span>
        <button :disabled="!next" @click="fetchStaffs(next)" class="btn-page">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <AddStaff 
      v-if="showAddStaff" 
      :visible="showAddStaff" 
      @close="showAddStaff = false" 
      @success="fetchStaffs" 
    />
  </div>
</template>

<script>
import AddStaff from "./add.vue";
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
  name: "StaffsView",
  components: { SortIcon, AddStaff, Toast, Loading },

  data() {
    return {
      staffs: [],
      showAddStaff: false,
      searchTerm: "",
      searchTimeout: null,
      sortKey: "fullName",
      sortAsc: true,
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
      pageSize: 20,
      pageSizes: [5, 10, 20, 50, 100],
      loading: false,
    };
  },

  computed: {
    filteredAndSortedStaffs() {
      const term = this.searchTerm.toLowerCase().trim();
      let filtered = this.staffs.filter(s => {
        const u = s.staff || {};
        const fullName = `${u.first_name || ""} ${u.middle_name || ""} ${u.last_name || ""}`.toLowerCase();
        return fullName.includes(term) ||
               (u.email || "").toLowerCase().includes(term) ||
               (u.phone_number || "").toLowerCase().includes(term) ||
               (u.groups || []).join(" ").toLowerCase().includes(term);
      });

      // Client-side sorting
      filtered.sort((a, b) => {
        const an = `${a.staff?.first_name || ""} ${a.staff?.last_name || ""}`.toLowerCase();
        const bn = `${b.staff?.first_name || ""} ${b.staff?.last_name || ""}`.toLowerCase();
        return an < bn ? (this.sortAsc ? -1 : 1) : an > bn ? (this.sortAsc ? 1 : -1) : 0;
      });

      return filtered;
    },
  },

  mounted() {
    this.fetchStaffs();
  },

  methods: {
    async fetchStaffs(customUrl = null) {
      this.loading = true;
      try {
        const isSuperuser = localStorage.getItem("is_superuser") === "true";
        const params = isSuperuser ? {} : { owner__id: localStorage.getItem("userId") };
        
        const res = await this.$apiGet(customUrl || "get_owner_staffs", params);
        this.staffs = Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        console.error(e);
        this.staffs = [];
      } finally {
        this.loading = false;
      }
    },

    onSearchInput() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        // Note: Since filtering is client-side, we don't need to refetch
        // But we reset page if pagination is implemented later
      }, 300);
    },

    sortBy(key) {
      if (this.sortKey === key) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortKey = key;
        this.sortAsc = true;
      }
    },

    activateUser(id) {
      this.$apiPost(`/activate_user/${id}`, { id })
        .then(() => {
          this.$root.$refs.toast?.showToast("Staff activated", "success");
          this.fetchStaffs();
        })
        .catch(() => this.$root.$refs.toast?.showToast("Failed to activate staff", "error"));
    },

    deactivateUser(id) {
      this.$apiDelete(`/deactivate_user`, id)
        .then(() => {
          this.$root.$refs.toast?.showToast("Staff deactivated", "success");
          this.fetchStaffs();
        })
        .catch(() => this.$root.$refs.toast?.showToast("Failed to deactivate staff", "error"));
    },
  },
};
</script>

<style scoped>
.btn-page {
  @apply flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all;
}
</style>