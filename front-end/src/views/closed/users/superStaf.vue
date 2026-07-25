<template>
  <div>
    <Loading :visible="loading" message="Loading super staff..." />

    <div class="flex justify-end mb-4">
      <button 
        @click="showAddModal = true" 
        class="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition"
      >
        <i class="fas fa-plus"></i> Add Super Staff
      </button>
    </div>

    <div class="overflow-x-auto rounded-lg border border-gray-100">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <tr>
            <th class="px-3 py-3 text-left cursor-pointer hover:text-primary" @click="sortBy('fullName')">
              Name <SortIcon field="fullName" :sort-key="sortKey" :sort-asc="sortAsc" />
            </th>
            <th class="px-3 py-3 text-left cursor-pointer hover:text-primary" @click="sortBy('email')">
              Email <SortIcon field="email" :sort-key="sortKey" :sort-asc="sortAsc" />
            </th>
            <th class="px-3 py-3 text-left cursor-pointer hover:text-primary" @click="sortBy('phone_number')">
              Phone Number <SortIcon field="phone_number" :sort-key="sortKey" :sort-asc="sortAsc" />
            </th>
            <th class="px-3 py-3 text-center">Status</th>
            <th class="px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="user in sortedSuperStaffs" :key="user.id" class="hover:bg-gray-50 transition">
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center uppercase shrink-0">
                  {{ (user.first_name || '')[0] || '' }}{{ (user.last_name || '')[0] || '' }}
                </div>
                <span class="font-medium text-gray-800 whitespace-nowrap">
                  {{ user.first_name }} {{ user.middle_name || '' }} {{ user.last_name }}
                </span>
              </div>
            </td>
            
            <td class="px-3 py-2 text-gray-600 whitespace-nowrap">
              {{ user.email || '—' }}
            </td>

            <td class="px-3 py-2 text-gray-600 whitespace-nowrap">
              {{ user.phone_number || '—' }}
            </td>
            
            <td class="px-3 py-2 text-center">
              <span 
                :class="user.is_active ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
                class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
              >
                {{ user.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            
            <td class="px-3 py-2 text-right">
              <div class="flex justify-end gap-1">
                <button @click="goToDetail(user.id)" class="btn-action btn-blue" title="View Details">
                  <i class="fas fa-eye"></i>
                </button>
                <button 
                  v-if="!user.is_active" 
                  @click="askConfirmation('activate', user.id)" 
                  class="btn-action btn-green" 
                  title="Activate User"
                >
                  <i class="fas fa-power-off"></i>
                </button>
                <button 
                  v-else 
                  @click="askConfirmation('deactivate', user.id)" 
                  class="btn-action btn-orange" 
                  title="Deactivate User"
                >
                  <i class="fas fa-ban"></i>
                </button>
              </div>
            </td>
          </tr>
          
          <tr v-if="!sortedSuperStaffs.length && !loading">
            <td colspan="5" class="px-3 py-10 text-center text-sm text-gray-400 italic">
              No super staff found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Addsuperstaff v-if="showAddModal" :visible="showAddModal" @close="showAddModal = false" @success="fetchUsers" />
    
    <ConfirmModal 
      :visible="showConfirm" 
      :title="confirmTitle" 
      :message="confirmMessage" 
      @cancel="showConfirm = false" 
      @confirm="confirmAction" 
    />
  </div>
</template>

<script>
import Addsuperstaff from "./addSuperStaff.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Loading from "@/components/Loading.vue";

const SortIcon = {
  props: ["field", "sortKey", "sortAsc"],
  template: `
    <span class="inline-block ml-1 text-gray-400">
      <svg v-if="sortKey !== field" class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
      </svg>
      <svg v-else-if="sortAsc" class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
      <svg v-else class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
      </svg>
    </span>
  `,
};

export default {
  components: { Addsuperstaff, SortIcon, ConfirmModal, Loading },
  data() {
    return {
      users: [],
      sortKey: "fullName",
      sortAsc: true,
      showAddModal: false,
      showConfirm: false,
      selectedUser: null,
      selectedAction: null,
      loading: false
    };
  },
  computed: {
    superStaffs() {
      return this.users.filter(u => u.groups && u.groups.includes("super_staff"));
    },
    sortedSuperStaffs() {
      return [...this.superStaffs].sort((a, b) => {
        let valA = "";
        let valB = "";

        if (this.sortKey === "fullName") {
          valA = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
          valB = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
        } else {
          valA = (a[this.sortKey] || "").toString().toLowerCase();
          valB = (b[this.sortKey] || "").toString().toLowerCase();
        }

        if (valA < valB) return this.sortAsc ? -1 : 1;
        if (valA > valB) return this.sortAsc ? 1 : -1;
        return 0;
      });
    },
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
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        const res = await this.$apiGet("/get_users", { page_size: 1000000 });
        this.users = res.data || [];
      } catch (e) {
        console.error("Error fetching users:", e);
      } finally {
        this.loading = false;
      }
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
      
      this.loading = true;
      try {
        if (this.selectedAction === "activate") {
          await this.$apiPost(`/activate_user/${this.selectedUser}`, { id: this.selectedUser });
        } else {
          await this.$apiDelete(`/deactivate_user`, this.selectedUser);
        }
        await this.fetchUsers();
      } catch (e) {
        console.error(`Error processing ${this.selectedAction}:`, e);
      } finally {
        this.showConfirm = false;
        this.loading = false;
      }
    },
    goToDetail(id) {
      this.$router.push(`/user_detail/${id}`);
    },
  },
};
</script>

<style scoped>
.btn-action { @apply h-7 w-7 flex items-center justify-center rounded-lg text-xs transition; }
.btn-blue   { @apply bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white; }
.btn-green  { @apply bg-green-50 text-green-600 hover:bg-green-600 hover:text-white; }
.btn-orange { @apply bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white; }
</style>