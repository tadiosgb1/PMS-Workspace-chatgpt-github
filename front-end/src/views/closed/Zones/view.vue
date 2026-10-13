<template>
  <div class="pms-brand-page p-6 bg-gray-100 min-h-screen text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading Property Zones..." />

    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Property Zones</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Real Estate Portfolio</p>
      </div>
      <button v-if="$hasPermission('pms.add_propertyzone')" @click="visible = true" class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
        <i class="fas fa-plus text-xs"></i> Add Zone
      </button>
    </div>

    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3 bg-white p-4 rounded-lg border border-gray-100">
      <div class="relative flex-1 max-w-sm">
        <input 
          v-model="searchTerm" 
          @input="onSearch" 
          type="search" 
          placeholder="Search zones..." 
          class="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" 
        />
      </div>

      <div class="flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1">
          <span class="text-gray-500 px-2 font-bold uppercase tracking-wider text-[10px]">Export CSV:</span>
          <button 
            @click="exportToCSV('displayed')" 
            :disabled="filteredAndSortedZones.length === 0"
            class="px-3 py-1.5 bg-white hover:bg-gray-800 hover:text-white rounded border border-gray-200 font-semibold text-gray-700 transition disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-700"
          >
            <i class="fas fa-file-csv mr-1 text-emerald-600"></i> Current Page
          </button>
          <button 
            @click="exportToCSV('all')" 
            class="px-3 py-1.5 bg-white hover:bg-gray-800 hover:text-white rounded border border-gray-200 font-semibold text-gray-700 transition"
          >
            <i class="fas fa-file-zipper mr-1 text-emerald-600"></i> All Zones
          </button>
        </div>

        <div class="flex items-center gap-2 text-gray-500 ml-auto lg:ml-0">
          <label class="font-semibold">Show</label>
          <select v-model="pageSize" @change="fetchZones" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition cursor-pointer">
            <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
          </select>
          <span class="text-gray-400">Total: <span class="font-semibold text-gray-600">{{ globalZones.length }}</span></span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('name')">
                Zone Name <SortIcon field="name" :sort-key="sortKey" :sort-asc="sortAsc" />
              </th>
              <th class="px-4 py-3 text-left">Location</th>
              <th class="px-4 py-3 text-left">Owner</th>
              <th class="px-4 py-3 text-left">Manager</th>
              <th class="px-4 py-3 text-center">Status & Actions</th>
              <th class="px-4 py-3 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="zone in filteredAndSortedZones" :key="zone.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="font-semibold text-gray-800">{{ zone.name }}</div>
              </td>

              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="text-xs text-gray-600 flex-1">
                    {{ zone.address }} • {{ zone.city }}, {{ zone.state }}
                  </div>
                  <a 
                    :href="`https://www.google.com/maps/search/?api=1&query=${zone.latlong}`" 
                    target="_blank"
                    class="h-7 w-7 flex-shrink-0 inline-flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition text-xs"
                    title="View on Map"
                  >
                    <i class="fas fa-location-dot"></i>
                  </a>
                </div>
              </td>

              <td class="px-4 py-3">
                <button @click="goToDetail(zone.owner_id)" class="text-blue-600 hover:underline font-medium">
                  {{ zone.ownerName || '—' }}
                </button>
              </td>

              <td class="px-4 py-3">
                <button @click="goToDetail(zone.manager_id)" class="text-blue-600 hover:underline font-medium">
                  {{ zone.managerName || '—' }}
                </button>
              </td>

              <td class="px-4 py-3">
                <div class="flex flex-col items-center gap-2">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full" :class="{
                      'bg-gray-400': zone.status === 'active' || !zone.status,
                      'bg-blue-500': zone.status === 'development',
                      'bg-orange-500': zone.status === 'for_sale', 
                      'bg-green-500': zone.status === 'fully_occupied',
                      'bg-red-500': zone.status === 'maintenance'
                    }"></div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase" :class="{
                      'bg-gray-100 text-gray-700': zone.status === 'active' || !zone.status,
                      'bg-blue-100 text-blue-700': zone.status === 'development',
                      'bg-orange-100 text-orange-700': zone.status === 'for_sale',
                      'bg-green-100 text-green-700': zone.status === 'fully_occupied',
                      'bg-red-100 text-red-700': zone.status === 'maintenance'
                    }">
                      {{ getZoneStatusLabel(zone.status) }}
                    </span>
                  </div>

                  <div class="flex flex-wrap gap-1 justify-center">
                    <button v-if="$hasPermission('pms.change_propertyzone') && (zone.status === 'active' || !zone.status)" @click="markZoneForSale(zone)" class="zone-status-btn bg-orange-50 text-orange-600 hover:bg-orange-600" title="List Zone for Sale">
                      <i class="fas fa-tag text-xs"></i>
                    </button>
                    <button v-if="$hasPermission('pms.change_propertyzone') && (zone.status === 'active' || !zone.status)" @click="markZoneDevelopment(zone)" class="zone-status-btn bg-blue-50 text-blue-600 hover:bg-blue-600" title="Mark Under Development">
                      <i class="fas fa-construction text-xs"></i>
                    </button>
                    
                    <button v-if="$hasPermission('pms.change_propertyzone') && zone.status === 'for_sale'" @click="markZoneSold(zone)" class="zone-status-btn bg-green-50 text-green-600 hover:bg-green-600" title="Mark as Sold">
                      <i class="fas fa-handshake text-xs"></i>
                    </button>
                    <button v-if="$hasPermission('pms.change_propertyzone') && zone.status === 'for_sale'" @click="markZoneActive(zone)" class="zone-status-btn bg-gray-50 text-gray-600 hover:bg-gray-600" title="Remove from Sale">
                      <i class="fas fa-times text-xs"></i>
                    </button>
                    
                    <button v-if="$hasPermission('pms.change_propertyzone') && zone.status === 'development'" @click="markZoneActive(zone)" class="zone-status-btn bg-green-50 text-green-600 hover:bg-green-600" title="Development Complete">
                      <i class="fas fa-check text-xs"></i>
                    </button>
                    
                    <button v-if="$hasPermission('pms.change_propertyzone') && zone.status !== 'maintenance'" @click="markZoneMaintenance(zone)" class="zone-status-btn bg-red-50 text-red-600 hover:bg-red-600" title="Mark for Maintenance">
                      <i class="fas fa-tools text-xs"></i>
                    </button>
                    <button v-if="$hasPermission('pms.change_propertyzone') && zone.status === 'maintenance'" @click="markZoneActive(zone)" class="zone-status-btn bg-green-50 text-green-600 hover:bg-green-600" title="Maintenance Complete">
                      <i class="fas fa-check-circle text-xs"></i>
                    </button>
                  </div>
                </div>
              </td>

              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button @click="goToZoneDetail(zone.id)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition text-xs" title="View Details">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button v-if="$hasPermission('pms.change_propertyzone')" @click="editZone(zone)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white transition text-xs" title="Edit Zone">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="properties(zone.id)" class="px-3 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-800 hover:text-white transition text-[10px] font-semibold uppercase" title="View Properties">
                    Units
                  </button>
                  <button @click="coworkingSpaces(zone.id)" class="px-3 h-7 flex items-center justify-center rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition text-[10px] font-semibold uppercase" title="View Coworking Spaces">
                    Spaces
                  </button>
                  <button @click="openSaleModal(zone.id)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white transition text-xs" title="List for Sale">
                    <i class="fas fa-tag"></i>
                  </button>
                  <button v-if="$hasPermission('pms.delete_propertyzone')" @click="askDeleteConfirmation(zone)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition text-xs" title="Delete Zone">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAndSortedZones.length === 0 && !loading">
              <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-400 italic">No zones found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of <span class="font-semibold text-gray-700">{{ totalPages }}</span></span>
      <div class="flex gap-2">
        <button :disabled="currentPage <= 1" @click="changePage(currentPage - 1)" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <button :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <AddZone v-if="visible" :visible="visible" @close="visible = false" @refresh="fetchZones" />
    <UpdateZone v-if="updateVisible" :visible="updateVisible" :zone="zoneToEdit" @close="updateVisible = false" @refresh="fetchZones" />
    <ConfirmModal v-if="confirmVisible" :visible="confirmVisible" title="Delete Zone" message="Are you sure you want to remove this property zone?" @confirm="confirmDelete" @cancel="confirmVisible = false" />
    <SaleModal v-if="saleVisible" :visible="saleVisible" :propertyZoneId="salePropertyId" sourceType="zone" @close="saleVisible = false" @refresh="fetchZones" />
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import AddZone from "./add.vue";
import UpdateZone from "./update.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import SaleModal from "../propertiesListForSale/add.vue";
import Loading from "@/components/Loading.vue";

const SortIcon = {
  props: ["field", "sortKey", "sortAsc"],
  template: `
    <span v-if="field === sortKey" class="ml-1">
      <i :class="sortAsc ? 'fas fa-sort-up' : 'fas fa-sort-down'" class="text-[10px]"></i>
    </span>
    <span v-else class="ml-1 opacity-30">
      <i class="fas fa-sort text-[10px]"></i>
    </span>
  `
};

export default {
  components: { AddZone, UpdateZone, ConfirmModal, SortIcon, Toast, SaleModal, Loading },
  data() {
    return {
      globalZones: [], 
      visible: false, 
      updateVisible: false, 
      confirmVisible: false,
      zoneToEdit: null, 
      zoneToDelete: null, 
      searchTerm: "",
      sortKey: "name", 
      sortAsc: true, 
      currentPage: 1, 
      totalPages: 1,
      pageSize: 10, 
      pageSizes: [5, 10, 20, 50, 100],
      saleVisible: false, 
      salePropertyId: null, 
      loading: false,
    };
  },
  computed: {
    filteredAndSortedZones() {
      return [...this.globalZones].sort((a, b) => {
        let res = 0;
        if (a[this.sortKey] < b[this.sortKey]) res = -1;
        if (a[this.sortKey] > b[this.sortKey]) res = 1;
        return this.sortAsc ? res : -res;
      });
    },
  },
  async mounted() { 
    await this.fetchZones(); 
  },
  methods: {
    getZoneStatusLabel(status) {
      const labels = {
        'active': 'Active',
        'development': 'Development',
        'for_sale': 'For Sale', 
        'fully_occupied': 'Occupied',
        'maintenance': 'Maintenance'
      };
      return labels[status] || 'Active';
    },

    async updateZoneStatus(zone, newStatus, successMessage) {
      if (!this.$hasPermission("pms.change_propertyzone")) {
        this.$root.$refs.toast.showToast("You do not have permission to change zone status.", "error");
        return;
      }
      try {
        const res = await this.$apiPatch(`/update_property_zone`, zone.id, {
          id: zone.id,
          status: newStatus
        });
        if (res) {
          this.$root.$refs.toast.showToast(successMessage, "success");
          await this.fetchZones();
        }
      } catch (error) {
        console.error('Zone status update failed:', error);
        this.$root.$refs.toast.showToast("Failed to update zone status", "error");
      }
    },

    markZoneForSale(zone) {
      this.updateZoneStatus(zone, 'for_sale', 'Zone listed for sale');
    },

    markZoneDevelopment(zone) {
      this.updateZoneStatus(zone, 'development', 'Zone marked under development');
    },

    markZoneSold(zone) {
      this.updateZoneStatus(zone, 'sold', 'Zone marked as sold');
    },

    markZoneActive(zone) {
      this.updateZoneStatus(zone, 'active', 'Zone marked as active');
    },

    markZoneMaintenance(zone) {
      this.updateZoneStatus(zone, 'maintenance', 'Zone marked for maintenance');
    },

    sortBy(field) {
      if (this.sortKey === field) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortKey = field;
        this.sortAsc = true;
      }
    },

    onSearch() {
      this.currentPage = 1;
      this.fetchZones();
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchZones();
      }
    },

    editZone(zone) {
      this.zoneToEdit = zone;
      this.updateVisible = true;
    },

    askDeleteConfirmation(zone) {
      this.zoneToDelete = zone;
      this.confirmVisible = true;
    },

    async confirmDelete() {
      this.confirmVisible = false;
      if (!this.$hasPermission("pms.delete_propertyzone")) {
        this.$root.$refs.toast.showToast("You do not have permission to delete zones.", "error");
        this.zoneToDelete = null;
        return;
      }
      try {
        const res = await this.$apiDelete(`/delete_property_zone/${this.zoneToDelete.id}`);
        this.$root.$refs.toast.showToast(res.message || "Zone deleted", "success");
        this.fetchZones();
      } catch (e) {
        this.$root.$refs.toast.showToast("Failed to delete zone", "error");
      }
      this.zoneToDelete = null;
    },

    openSaleModal(id) {
      this.salePropertyId = id;
      this.saleVisible = true;
    },

    goToDetail(id) {
      if (id) this.$router.push(`/user_detail/${id}`);
    },

    goToZoneDetail(id) {
      if (id) this.$router.push(`/zones/${id}`);
    },

    properties(zoneId) {
      if (zoneId) this.$router.push(`/properties?zone_id=${zoneId}`);
    },

    coworkingSpaces(zoneId) {
      if (zoneId) this.$router.push(`/coworking-spaces?zone_id=${zoneId}`);
    },

    async fetchZones() {
      this.loading = true;
      try {
        const result = await this.$getZones({
          page: this.currentPage,
          pageSize: this.pageSize,
          search: this.searchTerm,
          ordering: "-id",
        });
        
        this.globalZones = result.zones || [];
        this.currentPage = result.currentPage || 1;
        this.totalPages = result.totalPages || 1;
      } catch (err) { 
        console.error("Failed to fetch zones:", err); 
        this.globalZones = []; 
      } finally { 
        this.loading = false; 
      }
    },

    async exportToCSV(type) {
      this.loading = true;
      let dataset = [];

      try {
        if (type === "displayed") {
          dataset = this.filteredAndSortedZones;
        } else if (type === "all") {
          const result = await this.$getZones({
            page: 1,
            pageSize: 1000000,
            search: this.searchTerm,
            ordering: "-id",
          });
          dataset = result.zones || [];
        }

        if (dataset.length === 0) {
          this.$root.$refs.toast.showToast("No data available to export", "error");
          return;
        }

        const headers = ["Zone ID", "Zone Name", "Address", "City", "State", "Owner", "Manager", "Status"];
        const sanitizeToken = (val) => val ? `"${String(val).replace(/"/g, '""')}"` : '""';

        const rowStream = [
          headers.join(","),
          ...dataset.map(zone => [
            sanitizeToken(zone.id),
            sanitizeToken(zone.name),
            sanitizeToken(zone.address || "N/A"),
            sanitizeToken(zone.city || "N/A"),
            sanitizeToken(zone.state || "N/A"),
            sanitizeToken(zone.ownerName || "N/A"),
            sanitizeToken(zone.managerName || "N/A"),
            sanitizeToken(zone.status || "Active")
          ].join(","))
        ];

        const documentString = "data:text/csv;charset=utf-8," + encodeURIComponent(rowStream.join("\n"));
        const downloadAnchor = document.createElement("a");
        
        downloadAnchor.setAttribute("href", documentString);
        downloadAnchor.setAttribute("download", `Zones_Export_${type}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(downloadAnchor);
        
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        this.$root.$refs.toast.showToast("Zone data exported successfully", "success");
      } catch (error) {
        console.error("Export failed:", error);
        this.$root.$refs.toast.showToast("Failed to export data", "error");
      } finally {
        this.loading = false;
      }
    }
  },
};
</script>

<style scoped>
.zone-status-btn {
  @apply h-6 w-6 flex items-center justify-center rounded text-xs transition-colors;
}
</style>