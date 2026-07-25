<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <Loading :visible="loading" message="Loading groups..." />

    <div class="mb-8">
  <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Roles Management</h1>
  <p class="text-gray-500 mt-1 max-w-lg">
    Manage your team's permission levels and access control settings.
  </p>
</div>
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
      <div class="relative w-full sm:max-w-sm">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
        <input v-model="searchTerm" type="search" placeholder="Search groups or permissions..."
          class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <span class="text-xs text-gray-400">{{ filteredGroups.length }} group{{ filteredGroups.length !== 1 ? 's' : '' }}</span>
      <button @click="visible = true"
        class="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition whitespace-nowrap">
        <i class="fas fa-plus"></i> Add Group
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-lg border border-gray-100 bg-white">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <tr>
            <th class="px-3 py-3 text-left cursor-pointer hover:text-primary" @click="sortBy('name')">
              Group Name <SortIcon field="name" :sort-key="sortKey" :sort-asc="sortAsc" />
            </th>
            <th class="px-3 py-3 text-left">Permissions</th>
            <th class="px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="group in filteredGroups" :key="group.id" class="hover:bg-gray-50 transition">
            <td class="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{{ group.name }}</td>
            <td class="px-3 py-2">
              <div class="flex flex-wrap gap-1">
                <span v-for="p in group.permissions" :key="p"
                  class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-mono border border-blue-100">
                  {{ p }}
                </span>
                <span v-if="!group.permissions?.length" class="text-xs text-gray-300 italic">No permissions</span>
              </div>
            </td>
            <td class="px-3 py-2 text-right">
              <div class="flex justify-end gap-1">
                <button @click="editGroup(group)" class="btn-action btn-blue"><i class="fas fa-edit"></i></button>
                <button @click="confirmDelete(group)" class="btn-action btn-red"><i class="fas fa-trash-alt"></i></button>
              </div>
            </td>
          </tr>
          <tr v-if="!filteredGroups.length && !loading">
            <td colspan="3" class="px-3 py-10 text-center text-sm text-gray-400 italic">No groups found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <AddGroup v-if="visible" :visible="visible" @close="visible = false" @saved="fetchGroups" />
    <UpdateGroup v-if="updateVisible" :visible="updateVisible" :groupData="selectedGroup" @close="updateVisible = false" @updated="fetchGroups" />
    <ConfirmModal :visible="deleteVisible" title="Delete Group" :message="`Delete '${groupToDelete?.name}'?`"
      @cancel="deleteVisible = false" @confirm="doDelete" />
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import AddGroup from "./add.vue";
import UpdateGroup from "./update.vue";
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
  name: "GroupsView",
  components: { SortIcon, AddGroup, UpdateGroup, Toast, ConfirmModal, Loading },
  data() {
    return {
      searchTerm: "", visible: false, updateVisible: false, deleteVisible: false,
      selectedGroup: null, groupToDelete: null, sortKey: "name", sortAsc: true,
      groups: [], loading: false,
    };
  },
  computed: {
    filteredGroups() {
      const t = this.searchTerm.toLowerCase();
      let list = this.groups.filter(g =>
        g.name.toLowerCase().includes(t) ||
        (g.permissions || []).some(p => p.toLowerCase().includes(t))
      );
      list.sort((a, b) => {
        const r = a[this.sortKey] < b[this.sortKey] ? -1 : a[this.sortKey] > b[this.sortKey] ? 1 : 0;
        return this.sortAsc ? r : -r;
      });
      return list;
    },
  },
  mounted() { this.fetchGroups(); },
  methods: {
    async fetchGroups() {
      this.loading = true;
      try {
        const res = await this.$apiGet("/get_groups", { page_size: 1000 });
        this.groups = res.data || [];
      } catch (e) { console.error(e); this.groups = []; } finally { this.loading = false; }
    },
    sortBy(key) { this.sortKey === key ? (this.sortAsc = !this.sortAsc) : ((this.sortKey = key), (this.sortAsc = true)); },
    editGroup(group) { this.selectedGroup = { ...group }; this.updateVisible = true; },
    confirmDelete(group) { this.groupToDelete = group; this.deleteVisible = true; },
    async doDelete() {
      this.deleteVisible = false;
      try {
        await this.$apiDelete(`/delete_group/${this.groupToDelete.id}`);
        this.$root.$refs.toast.showToast("Group deleted", "success");
        this.fetchGroups();
      } catch (e) { this.$root.$refs.toast.showToast(e.message || "Failed", "error"); }
      finally { this.groupToDelete = null; }
    },
  },
};
</script>

<style scoped>
.btn-action { @apply h-7 w-7 flex items-center justify-center rounded-lg text-xs transition; }
.btn-blue   { @apply bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white; }
.btn-red    { @apply bg-red-50 text-red-600 hover:bg-red-600 hover:text-white; }
</style>
