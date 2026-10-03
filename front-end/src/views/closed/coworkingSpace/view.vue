<template>
  <div class="pms-brand-page p-6 bg-gray-100 min-h-screen text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading Co-working Spaces..." />

    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Co-Working Spaces</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Shared Office Management</p>
      </div>
      <button @click="showAddSpace = true" class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
        <i class="fas fa-plus text-xs"></i> Add Space
      </button>
    </div>

    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3 bg-white p-4 rounded-lg border border-gray-100">
      <div class="flex flex-wrap gap-3 items-center flex-1">
        <div class="relative flex-1 max-w-sm">
          <input 
            v-model="searchTerm" 
            @input="onSearchInput"
            type="search" 
            placeholder="Search spaces..." 
            class="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" 
          />
        </div>

        <select v-model="zoneId" @change="fetchSpaces()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
          <option value="">All Zones</option>
          <option v-for="zone in zones" :key="zone.id" :value="zone.id">{{ zone.name }}</option>
        </select>
      </div>

      <div class="flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2 text-gray-500 ml-auto lg:ml-0">
          <label class="font-semibold">Show</label>
          <select v-model="pageSize" @change="fetchSpaces()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition cursor-pointer">
            <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
          </select>
          <span class="text-gray-400">Total: <span class="font-semibold text-gray-600">{{ spaces.length }}</span></span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('name')">
                Space Name <SortIcon field="name" :sort-key="sortKey" :sort-asc="sortAsc" />
              </th>
              <th class="px-4 py-3 text-left">Location</th>
              <th class="px-4 py-3 text-center">Capacity</th>
              <th class="px-4 py-3 text-center">Daily Price</th>
              <th class="px-4 py-3 text-center">Monthly Price</th>
              <th class="px-4 py-3 text-left">Zone</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="space in filteredAndSortedSpaces" :key="space.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="font-semibold text-gray-800">{{ space.name }}</div>
              </td>
              <td class="px-4 py-3 text-xs text-gray-600">{{ space.location }}</td>
              <td class="px-4 py-3 text-center">
                <span class="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs font-semibold">
                  {{ space.capacity }}
                </span>
              </td>
              <td class="px-4 py-3 text-center text-xs font-semibold text-gray-800">{{ space.price_daily }}</td>
              <td class="px-4 py-3 text-center text-xs font-semibold text-gray-800">{{ space.price_monthly }}</td>
              <td class="px-4 py-3 text-xs text-gray-600 truncate max-w-xs">{{ space.zone?.name }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button @click="goDetail(space.id)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition text-xs" title="View">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click="editSpace(space)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white transition text-xs" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="goToRentals(space.id)" class="px-3 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-800 hover:text-white transition text-[10px] font-semibold uppercase">
                    Rentals
                  </button>
                  <button @click="askDeleteConfirmation(space)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition text-xs" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAndSortedSpaces.length === 0 && !loading">
              <td colspan="7" class="px-4 py-10 text-center text-sm text-gray-400 italic">No co-working spaces found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of <span class="font-semibold text-gray-700">{{ totalPages }}</span></span>
      <div class="flex gap-2">
        <button :disabled="!previous" @click="fetchSpaces(previous)" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <button :disabled="!next" @click="fetchSpaces(next)" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <AddSpace :visible="showAddSpace" @close="showAddSpace = false" @success="fetchSpaces" />
    <UpdateCoworkspace :visible="updateVisible" :space="spaceToEdit" @close="updateVisible = false" @refresh="fetchSpaces" />
    <ConfirmModal
      v-if="confirmVisible"
      :visible="confirmVisible"
      title="Confirm Deletion"
      message="This action will permanently remove this co-working space and all associated booking configurations. Proceed?"
      @confirm="confirmDelete"
      @cancel="confirmVisible = false"
    />
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import AddSpace from "./add.vue";
import UpdateCoworkspace from "./update.vue";
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
  name: "CoworkingSpacesView",
  components: { SortIcon, Toast, AddSpace, UpdateCoworkspace, ConfirmModal, Loading },
  data() {
    return {
      searchTerm: "",
      sortKey: "name",
      sortAsc: true,
      spaces: [],
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
      pageSize: 10,
      pageSizes: [5, 10, 20, 50, 100],
      showAddSpace: false,
      updateVisible: false,
      spaceToEdit: null,
      confirmVisible: false,
      spaceToDelete: null,
      loading: false,
      zoneId: "", // For zone filtering
      zones: [], // For zone dropdown
    };
  },
  computed: {
    filteredAndSortedSpaces() {
      const term = this.searchTerm.toLowerCase();
      let filtered = this.spaces.filter(
        (space) =>
          space.name.toLowerCase().includes(term) ||
          space.location.toLowerCase().includes(term) ||
          space.description.toLowerCase().includes(term) ||
          String(space.capacity).includes(term) ||
          String(space.price_daily).includes(term) ||
          String(space.price_monthly).includes(term)
      );

      filtered.sort((a, b) => {
        let aVal = a[this.sortKey];
        let bVal = b[this.sortKey];

        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();

        if (aVal < bVal) return this.sortAsc ? -1 : 1;
        if (aVal > bVal) return this.sortAsc ? 1 : -1;
        return 0;
      });

      return filtered;
    },
  },
  mounted() {
    // Check for zone_id in URL query parameters
    if (this.$route.query.zone_id) {
      this.zoneId = this.$route.query.zone_id;
    }
    this.fetchZones();
    this.fetchSpaces();
  },
  methods: {
    goDetail(id) {
      this.$router.push({
        name: "co-work-detail",
        params: { id: id },
      });
    },

    async fetchZones() {
      try {
        const result = await this.$getZones();
        this.zones = result.zones || [];
      } catch (err) {
        console.error("Failed to fetch zones:", err);
        this.zones = [];
      }
    },

    async fetchSpaces(url = null) {
      this.loading = true;
      try {
        let requestUrl = url;
        if (!requestUrl) {
          requestUrl = `/get_coworking_spaces?page=${this.currentPage}&page_size=${this.pageSize}`;
          
          // Add zone filtering if zone is selected
          if (this.zoneId) {
            requestUrl += `&zone__id=${this.zoneId}`;
          }
          
          // Add search term if provided
          if (this.searchTerm) {
            requestUrl += `&search=${encodeURIComponent(this.searchTerm)}`;
          }
        }
        
        const response = await this.$getCoworkingSpaces(requestUrl);
        this.spaces = response.spaces || [];
        this.currentPage = response.currentPage || 1;
        this.totalPages = response.totalPages || 1;
        this.next = response.next;
        this.previous = response.previous;
      } catch (err) {
        console.error("Failed to fetch coworking spaces:", err);
        this.spaces = [];
      } finally {
        this.loading = false;
      }
    },

    onSearchInput() {
      this.currentPage = 1;
      this.fetchSpaces();
    },

    sortBy(key) {
      if (this.sortKey === key) this.sortAsc = !this.sortAsc;
      else this.sortKey = key;
    },
    editSpace(space) {
      this.spaceToEdit = space;
      this.updateVisible = true;
    },
    askDeleteConfirmation(space) {
      this.spaceToDelete = space;
      this.confirmVisible = true;
    },
    async confirmDelete() {
      this.confirmVisible = false;
      try {
        await this.$apiDelete(`/delete_coworking_space/${this.spaceToDelete.id}`);
        this.$root.$refs.toast.showToast("Co-Working Space deleted successfully", "success");
        this.fetchSpaces();
      } catch (err) {
        console.error(err);
        this.$refs.toast.showToast("Failed to delete co-working space", "error");
      } finally {
        this.spaceToDelete = null;
      }
    },
    goToRentals(workspace_id) {
      this.$router.push({
        path: "/coworking-space-rentals",
        query: { workspace_id },
      });
    },
  },
};
</script>
