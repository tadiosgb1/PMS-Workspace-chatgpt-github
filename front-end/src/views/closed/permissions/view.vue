<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <Loading :visible="loading" message="Loading permissions..." />

    <!-- Page Header -->
    <div class="flex items-center gap-4 mb-6 pb-5 border-b border-gray-200">
    
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Permissions</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Manage System Permissions</p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
      <div class="relative w-full sm:max-w-sm">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
        <input v-model="searchTerm" type="search" placeholder="Search by name or codename..."
          class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <span class="text-xs text-gray-400">{{ filteredPermissions.length }} permission{{ filteredPermissions.length !== 1 ? 's' : '' }}</span>
      <button @click="addVisible = true"
        class="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition whitespace-nowrap">
        <i class="fas fa-plus"></i> Add Permission
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-lg border border-gray-100 bg-white">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <tr>
            <th class="px-3 py-3 text-left cursor-pointer hover:text-primary" @click="sortBy('name')">
              Name <SortIcon field="name" :sort-key="sortKey" :sort-asc="sortAsc" />
            </th>
            <th class="px-3 py-3 text-left cursor-pointer hover:text-primary" @click="sortBy('codename')">
              Codename <SortIcon field="codename" :sort-key="sortKey" :sort-asc="sortAsc" />
            </th>
            <th class="px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="perm in filteredPermissions" :key="perm.id" class="hover:bg-gray-50 transition">
            <td class="px-3 py-2 text-gray-800 text-xs">{{ perm.name }}</td>
            <td class="px-3 py-2">
              <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono border border-gray-200">
                {{ perm.codename }}
              </span>
            </td>
            <td class="px-3 py-2 text-right">
              <div class="flex justify-end gap-1">
                <button @click="editPermission(perm)" class="btn-action btn-blue"><i class="fas fa-edit"></i></button>
                <button @click="askDelete(perm)" class="btn-action btn-red"><i class="fas fa-trash-alt"></i></button>
              </div>
            </td>
          </tr>
          <tr v-if="!filteredPermissions.length && !loading">
            <td colspan="3" class="px-3 py-10 text-center text-sm text-gray-400 italic">No permissions found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <AddPermissionModal v-if="addVisible" :visible="addVisible" @close="addVisible = false; fetchPermissions();" />
    <UpdatePermissionModal v-if="updateVisible" :visible="updateVisible" :permission="permissionToEdit"
      @close="updateVisible = false" @refresh="fetchPermissions" />
    <ConfirmModal :visible="deleteVisible" title="Delete Permission"
      :message="`Delete '${permToDelete?.name}'? This cannot be undone.`"
      @cancel="deleteVisible = false" @confirm="doDelete" />
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import AddPermissionModal from "./add.vue";
import UpdatePermissionModal from "./update.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
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
  name: "PermissionsView",
  components: { SortIcon, AddPermissionModal, UpdatePermissionModal, ConfirmModal, Toast, Loading },
  data() {
    return {
      searchTerm: "", sortKey: "name", sortAsc: true,
      permissions: [], loading: false,
      addVisible: false, updateVisible: false, deleteVisible: false,
      permissionToEdit: null, permToDelete: null,
    };
  },
  computed: {
    filteredPermissions() {
      const t = this.searchTerm.toLowerCase();
      let list = this.permissions.filter(p =>
        p.name.toLowerCase().includes(t) || p.codename.toLowerCase().includes(t)
      );
      list.sort((a, b) => {
        const r = a[this.sortKey] < b[this.sortKey] ? -1 : a[this.sortKey] > b[this.sortKey] ? 1 : 0;
        return this.sortAsc ? r : -r;
      });
      return list;
    },
  },
  mounted() { this.fetchPermissions(); },
  methods: {
    async fetchPermissions() {
      this.loading = true;
      try {
        const res = await this.$apiGet("/get_permissions", { page_size: 1000 });
        this.permissions = res.data || [];
      } catch (e) { console.error(e); } finally { this.loading = false; }
    },
    sortBy(key) { this.sortKey === key ? (this.sortAsc = !this.sortAsc) : ((this.sortKey = key), (this.sortAsc = true)); },
    editPermission(p) { this.permissionToEdit = p; this.updateVisible = true; },
    askDelete(p) { this.permToDelete = p; this.deleteVisible = true; },
    async doDelete() {
      this.deleteVisible = false;
      try {
        await this.$apiDelete(`/delete_permission/${this.permToDelete.id}`);
        this.$root.$refs.toast.showToast("Permission deleted", "success");
        this.fetchPermissions();
      } catch (e) { this.$root.$refs.toast.showToast(e.message || "Failed", "error"); }
      finally { this.permToDelete = null; }
    },
  },
};
</script>

<style scoped>
.btn-action { @apply h-7 w-7 flex items-center justify-center rounded-lg text-xs transition; }
.btn-blue   { @apply bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white; }
.btn-red    { @apply bg-red-50 text-red-600 hover:bg-red-600 hover:text-white; }
</style>
