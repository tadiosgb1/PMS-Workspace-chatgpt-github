<template>
  <div>
    <Loading :visible="loading" message="Loading users..." />

    <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
      <div class="relative w-full sm:max-w-sm">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
        <input v-model="search" @input="fetchUsers(1)" type="text" placeholder="Search by name, email or phone..."
          class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-500">
        Show
        <select v-model="pageSize" @change="fetchUsers(1)" class="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option v-for="s in [5,10,20,50,100]" :key="s" :value="s">{{ s }}</option>
        </select>
        entries
      </div>
      <button @click="showAddModal = true" class="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition whitespace-nowrap">
        <i class="fas fa-user-plus"></i> Add User
      </button>
    </div>

    <div class="overflow-x-auto rounded-lg border border-gray-100">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <tr>
            <th class="px-3 py-3 text-left">Name</th>
            <th class="px-3 py-3 text-left">Email</th>
            <th class="px-3 py-3 text-left">Phone</th>
            <th class="px-3 py-3 text-left">Groups</th>
            <th class="px-3 py-3 text-center">Status</th>
            <th class="px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition">
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center uppercase shrink-0">
                  {{ initials(user) }}
                </div>
                <span class="font-medium text-gray-800 whitespace-nowrap">{{ displayName(user) }}</span>
              </div>
            </td>
            <td class="px-3 py-2 text-gray-500 text-xs">{{ user.email || '—' }}</td>
            <td class="px-3 py-2 text-gray-500 text-xs">{{ user.phone_number || '—' }}</td>
            <td class="px-3 py-2">
              <div class="flex flex-wrap gap-1">
                <span v-for="g in user.groups" :key="g" class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold uppercase border border-gray-200">{{ g }}</span>
                <span v-if="!user.groups?.length" class="text-xs text-gray-300 italic">—</span>
              </div>
            </td>
            <td class="px-3 py-2 text-center">
              <span :class="user.is_active ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
                class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase">
                {{ user.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-3 py-2 text-right">
              <div class="flex justify-end gap-1">
                <button @click="goToDetail(user.id)" class="btn-action btn-blue"><i class="fas fa-eye"></i></button>
                <button v-if="!user.is_active" @click="askConfirmation('activate', user.id)" class="btn-action btn-green"><i class="fas fa-power-off"></i></button>
                <button v-else @click="askConfirmation('deactivate', user.id)" class="btn-action btn-orange"><i class="fas fa-ban"></i></button>
              </div>
            </td>
          </tr>
          <tr v-if="!users.length && !loading">
            <td colspan="6" class="px-3 py-10 text-center text-sm text-gray-400 italic">No users found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between mt-4 text-sm text-gray-500">
      <span>Page {{ pagination.current_page }} of {{ pagination.total_pages }}</span>
      <div class="flex gap-2">
        <button :disabled="!pagination.previous" @click="changePage(pagination.current_page - 1)" class="btn-page"><i class="fas fa-chevron-left mr-1"></i> Prev</button>
        <button :disabled="!pagination.next" @click="changePage(pagination.current_page + 1)" class="btn-page">Next <i class="fas fa-chevron-right ml-1"></i></button>
      </div>
    </div>

    <Add v-if="showAddModal" :visible="showAddModal" @close="showAddModal = false" @success="fetchUsers" />
    <ConfirmModal :visible="showConfirm" :title="confirmTitle" :message="confirmMessage" @cancel="showConfirm = false" @confirm="confirmAction" />
  </div>
</template>

<script>
import Add from "./add.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Loading from "@/components/Loading.vue";

export default {
  name: "AllUsers",
  components: { Add, ConfirmModal, Loading },
  data() {
    return {
      users: [], search: "", pageSize: 10,
      pagination: { current_page: 1, total_pages: 1, next: null, previous: null },
      showAddModal: false, showConfirm: false, selectedUser: null, selectedAction: null, loading: false,
    };
  },
  computed: {
    confirmTitle() { return this.selectedAction === "activate" ? "Activate User" : "Deactivate User"; },
    confirmMessage() { return this.selectedAction === "activate" ? "Are you sure you want to activate this user?" : "Are you sure you want to deactivate this user?"; },
  },
  mounted() { this.fetchUsers(); },
  methods: {
    async fetchUsers(page = 1) {
      this.loading = true;
      try {
        const res = await this.$apiGet("/get_users", { search: this.search, page, page_size: this.pageSize, ordering: "-id" });
        this.users = res.data || [];
        this.pagination = { current_page: res.current_page || 1, total_pages: res.total_pages || 1, next: res.next || null, previous: res.previous || null };
      } catch (e) { console.error(e); } finally { this.loading = false; }
    },
    initials(u) { return ((u.first_name || "")[0] || "") + ((u.last_name || "")[0] || "") || "#"; },
    displayName(u) { const p = [u.first_name, u.last_name].filter(Boolean); return p.length ? p.join(" ") : `User #${u.id}`; },
    askConfirmation(action, id) { this.selectedUser = id; this.selectedAction = action; this.showConfirm = true; },
    confirmAction() {
      if (!this.selectedUser || !this.selectedAction) return;
      const p = this.selectedAction === "activate"
        ? this.$apiPost(`/activate_user/${this.selectedUser}`, { id: this.selectedUser })
        : this.$apiDelete(`/deactivate_user`, this.selectedUser);
      p.then(() => this.fetchUsers(this.pagination.current_page)).finally(() => { this.showConfirm = false; });
    },
    changePage(page) { this.fetchUsers(page); },
    goToDetail(id) { this.$router.push(`/user_detail/${id}`); },
  },
};
</script>

<style scoped>
.btn-action { @apply h-7 w-7 flex items-center justify-center rounded-lg text-xs transition; }
.btn-blue   { @apply bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white; }
.btn-green  { @apply bg-green-50 text-green-600 hover:bg-green-600 hover:text-white; }
.btn-orange { @apply bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white; }
.btn-page   { @apply px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 hover:text-primary hover:border-primary disabled:opacity-40 transition; }
</style>
