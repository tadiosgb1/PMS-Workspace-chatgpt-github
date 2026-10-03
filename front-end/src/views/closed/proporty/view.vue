<template>
  <div class="pms-brand-page p-6 bg-gray-100 min-h-screen text-sm text-slate-800">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading properties..." />

    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">All Properties</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Manage Real Estate Portfolio</p>
      </div>
      <button v-if="$hasPermission('pms.add_property')" @click="visible = true"
        class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap">
        <i class="fas fa-plus text-xs"></i> Add Property
      </button>
    </div>

    <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4 bg-white p-4 rounded-lg border border-gray-100">
      <div class="flex flex-wrap gap-3 items-center flex-1 w-full">
        <div class="relative flex-1 max-w-sm w-full">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input v-model="searchTerm" @input="onSearchInput" type="search"
            placeholder="Search name, city, owner..."
            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white transition" />
        </div>

        <select v-if="!zone_id_query_set" v-model="zone_id" @change="fetchProperties()"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
          <option value="">All Zones</option>
          <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.name }}</option>
        </select>

        <select v-model="status" @change="fetchProperties()"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
          <option value="">All Status</option>
          <option value="available">Available (New)</option>
          <option value="for_rent">Available for Rent</option>
          <option value="for_sale">Available for Sale</option>
          <option value="rent">Rented</option>
          <option value="sale">Sold</option>
          <option value="under_maintenance">Under Maintenance</option>
        </select>

        <select v-model="pageSize" @change="fetchProperties()"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
          <option v-for="s in pageSizes" :key="s" :value="s">{{ s }} / page</option>
        </select>
      </div>

      <div class="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1 w-full lg:w-auto justify-between lg:justify-start">
        <span class="text-gray-500 px-2 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">Export Data:</span>
        <div class="flex items-center gap-1">
          <button 
            @click="exportToCSV('displayed')" 
            :disabled="properties.length === 0"
            class="px-2.5 py-1.5 bg-white hover:bg-gray-800 hover:text-white rounded border border-gray-200 text-xs font-semibold text-gray-700 transition disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-700"
            title="Export properties visible on current page matching filters"
          >
            <i class="fas fa-file-csv mr-1 text-emerald-600"></i> Current page
          </button>
          <button 
            @click="exportToCSV('all')" 
            class="px-2.5 py-1.5 bg-white hover:bg-gray-800 hover:text-white rounded border border-gray-200 text-xs font-semibold text-gray-700 transition"
            title="Export all database records across pages matching filters"
          >
            <i class="fas fa-database mr-1 text-emerald-600"></i> All properties
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 transition-colors" @click="changeOrdering('name')">
                Property
              </th>
              <th class="px-4 py-3 text-left">Owner & Manager</th>
              <th class="px-4 py-3 text-left">Location</th>
              <th class="px-4 py-3 text-left">Type</th>
              <th class="px-4 py-3 text-center">Status & Actions</th>
              <th class="px-4 py-3 text-center">Quick Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="p in properties" :key="p.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {{ (p.name||'').substring(0,2) }}
                  </div>
                  <span class="font-semibold text-gray-800 whitespace-nowrap">{{ p.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-gray-600">
                <div class="font-semibold text-gray-700 cursor-pointer hover:underline transition" @click="goToUserDetail(p.owner_id)">
                  {{ p.ownerName || '—' }}
                </div>
                <div class="text-gray-400 mt-0.5">{{ p.managerName || '—' }}</div>
              </td>
              <td class="px-4 py-3 text-xs text-gray-600">
                <div class="text-gray-700">{{ p.city || '—' }}</div>
                <div class="text-gray-400 cursor-pointer hover:underline mt-0.5" @click="goToZoneDetail(p.property_zone_id)">
                  {{ p.zoneName || '—' }}
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-gray-500 capitalize">{{ p?.property_type?.name || '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-col items-center gap-2">
                  <!-- Status Badge with Visual Indicator -->
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full" :class="{
                      'bg-gray-400': p.status === 'available',
                      'bg-blue-500': p.status === 'for_rent',
                      'bg-orange-500': p.status === 'for_sale', 
                      'bg-green-500': p.status === 'rent',
                      'bg-purple-500': p.status === 'sale',
                      'bg-red-500': p.status === 'under_maintenance'
                    }"></div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase" :class="{
                      'bg-gray-100 text-gray-700': p.status === 'available',
                      'bg-blue-100 text-blue-700': p.status === 'for_rent',
                      'bg-orange-100 text-orange-700': p.status === 'for_sale',
                      'bg-green-100 text-green-700': p.status === 'rent',
                      'bg-purple-100 text-purple-700': p.status === 'sale',
                      'bg-red-100 text-red-700': p.status === 'under_maintenance'
                    }">
                      {{ getStatusLabel(p.status) }}
                    </span>
                  </div>

                  <!-- Status Action Buttons -->
                  <div class="flex flex-wrap gap-1 justify-center">
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'available'" @click="markForRent(p)" class="status-btn bg-blue-50 text-blue-600 hover:bg-blue-600" title="List for Rent">
                      <i class="fas fa-home text-xs"></i>
                    </button>
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'available'" @click="markForSale(p)" class="status-btn bg-orange-50 text-orange-600 hover:bg-orange-600" title="List for Sale">
                      <i class="fas fa-tag text-xs"></i>
                    </button>
                    
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'for_rent'" @click="markAsRented(p)" class="status-btn bg-green-50 text-green-600 hover:bg-green-600" title="Mark as Rented">
                      <i class="fas fa-check text-xs"></i>
                    </button>
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'for_rent'" @click="markAvailable(p)" class="status-btn bg-gray-50 text-gray-600 hover:bg-gray-600" title="Remove from Rent">
                      <i class="fas fa-times text-xs"></i>
                    </button>
                    
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'for_sale'" @click="markAsSold(p)" class="status-btn bg-purple-50 text-purple-600 hover:bg-purple-600" title="Mark as Sold">
                      <i class="fas fa-handshake text-xs"></i>
                    </button>
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'for_sale'" @click="markAvailable(p)" class="status-btn bg-gray-50 text-gray-600 hover:bg-gray-600" title="Remove from Sale">
                      <i class="fas fa-times text-xs"></i>
                    </button>
                    
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'rent'" @click="endRental(p)" class="status-btn bg-yellow-50 text-yellow-600 hover:bg-yellow-600" title="End Rental">
                      <i class="fas fa-door-open text-xs"></i>
                    </button>
                    
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'sale'" @click="markAvailable(p)" class="status-btn bg-gray-50 text-gray-600 hover:bg-gray-600" title="Reset to Available">
                      <i class="fas fa-undo text-xs"></i>
                    </button>
                    
                    <button v-if="$hasPermission('pms.change_property') && p.status !== 'under_maintenance'" @click="markMaintenance(p)" class="status-btn bg-red-50 text-red-600 hover:bg-red-600" title="Mark for Maintenance">
                      <i class="fas fa-tools text-xs"></i>
                    </button>
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'under_maintenance'" @click="markAvailable(p)" class="status-btn bg-green-50 text-green-600 hover:bg-green-600" title="Mark Fixed">
                      <i class="fas fa-check-circle text-xs"></i>
                    </button>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button v-if="$hasPermission('pms.view_property')" @click="goToDetail(p.id)" class="btn-action btn-gray" title="View Details"><i class="fas fa-eye"></i></button>
                  <button v-if="$hasPermission('pms.change_property')" @click="editProperty(p)" class="btn-action btn-blue" title="Edit Property"><i class="fas fa-edit"></i></button>
                  
                  <!-- Payment Related Actions -->
                  <button v-if="p.status === 'rent'" @click="rentPay(p.id)" class="btn-action bg-green-50 text-green-600 hover:bg-green-600 hover:text-white" title="Rental Payments"><i class="fas fa-receipt"></i></button>
                  <button v-if="p.status === 'sale'" @click="salesPay(p.id)" class="btn-action bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white" title="Sales Payments"><i class="fas fa-dollar-sign"></i></button>
                  
                  <!-- Listing Actions -->
                  <button v-if="$hasPermission('pms.change_property') && (p.status === 'available' || p.status === 'for_sale')" @click="openSaleModal(p.id)" class="btn-action btn-orange" title="List for Sale"><i class="fas fa-tag"></i></button>
                  
                  <button v-if="$hasPermission('pms.delete_property')" @click="askDeleteConfirmation(p)" class="btn-action btn-red" title="Delete Property"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            </tr>
            <tr v-if="!properties.length && !loading">
              <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-400 italic">No properties found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">
        Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of <span class="font-semibold text-gray-700">{{ totalPages }}</span>
      </span>
      <div class="flex items-center gap-2">
        <button :disabled="!previous" @click="fetchProperties(previous)" class="btn-page">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <span class="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-bold min-w-[2rem] text-center">
          {{ currentPage }}
        </span>
        <button :disabled="!next" @click="fetchProperties(next)" class="btn-page">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <AddProperty v-if="visible" :visible="visible" @close="visible = false" @refresh="fetchProperties" />
    <UpdateProperty v-if="updateVisible" :visible="updateVisible" :property="propertyToEdit" @close="updateVisible = false" @refresh="fetchProperties" />
    <ConfirmModal v-if="confirmVisible" :visible="confirmVisible" title="Delete Property"
      message="This is permanent. Remove this property?" @confirm="confirmDelete" @cancel="confirmVisible = false" />
    <SaleModal v-if="saleVisible" :visible="saleVisible" :propertyId="salePropertyId" sourceType="property"
      @close="saleVisible = false" @refresh="fetchProperties" />
  </div>
</template>

<script>
import AddProperty from "@/views/closed/proporty/add.vue";
import UpdateProperty from "@/views/closed/proporty/update.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Toast from "@/components/Toast.vue";
import SaleModal from "../propertiesListForSale/add.vue";
import Loading from "@/components/Loading.vue";

export default {
  name: "PropertyView",
  components: { AddProperty, UpdateProperty, ConfirmModal, Toast, SaleModal, Loading },
  data() {
    return {
      zones: [], zone_id: "", zone_id_query_set: false,
      properties: [], visible: false, updateVisible: false, confirmVisible: false,
      propertyToEdit: null, propertyToDelete: null,
      searchTerm: "", currentPage: 1, totalPages: 1, next: null, previous: null,
      pageSize: 10, pageSizes: [10, 20, 50, 100, 1000],
      ordering: "-id", status: "",
      saleVisible: false, salePropertyId: null, loading: false,
    };
  },
  async created() {
    if (this.$route.query.zone_id) this.zone_id_query_set = true;
    if (this.$route.query.zone) {
      this.zone_id = this.$route.query.zone;
      this.zone_id_query_set = true;
    }
    const r = await this.$getZones();
    this.zones = r.zones || [];
    await this.fetchProperties();
  },
  methods: {
    async fetchProperties(url = null) {
      this.loading = true;
      try {
        let params = {
          page: this.currentPage,
          page_size: this.pageSize,
          search: this.searchTerm,
          ordering: this.ordering,
          status: this.status,
        };
        if (this.$route.query.zone_id || this.zone_id) {
          params.property_zone_id = this.$route.query.zone_id || this.zone_id;
        }

        if (url) {
          const urlObj = new URL(url, window.location.origin);
          params = Object.fromEntries(urlObj.searchParams.entries());
          const pageParam = urlObj.searchParams.get("page");
          if (pageParam) this.currentPage = parseInt(pageParam, 10);
          params.status = this.status;
          if (this.$route.query.zone_id || this.zone_id) {
            params.property_zone_id = this.$route.query.zone_id || this.zone_id;
          }
        }

        const result = await this.$getProperties(params);
        this.properties = result.properties || [];
        this.currentPage = result.currentPage || this.currentPage;
        this.totalPages = result.totalPages || 1;
        this.next = result.next;
        this.previous = result.previous;
      } catch (e) {
        console.error(e); this.properties = [];
      } finally { this.loading = false; }
    },
    onSearchInput() {
      this.currentPage = 1;
      this.fetchProperties();
    },
    changeOrdering(field) {
      this.ordering = this.ordering === field ? `-${field}` : field;
      this.fetchProperties();
    },
    editProperty(p) { this.propertyToEdit = p; this.updateVisible = true; },
    askDeleteConfirmation(p) { this.propertyToDelete = p; this.confirmVisible = true; },
    async confirmDelete() {
      this.confirmVisible = false;
      if (!this.$hasPermission("pms.delete_property")) {
        this.$root.$refs.toast.showToast("You do not have permission to delete properties.", "error");
        return;
      }
      try {
        const res = await this.$apiDelete(`/delete_property/${this.propertyToDelete.id}`);
        this.$root.$refs.toast.showToast(res.message || "Deleted", "success");
        this.fetchProperties();
      } catch (e) { this.$root.$refs.toast.showToast("Failed to delete", "error"); }
      this.propertyToDelete = null;
    },
    openSaleModal(id) {
      if (!this.$hasPermission("pms.change_property")) {
        this.$root.$refs.toast.showToast("You do not have permission to change property listings.", "error");
        return;
      }
      this.salePropertyId = id; this.saleVisible = true;
    },
    goToUserDetail(id) { if (id) this.$router.push(`/user_detail/${id}`); },
    goToZoneDetail(id) { if (id) this.$router.push(`/zones/${id}`); },
    goToDetail(id) { if (id) this.$router.push({ name: "PropertyDetail", params: { id } }); },
    rentPay(id) { if (id) this.$router.push({ name: "rentPay", params: { id } }); },
    salesPay(id) { if (id) this.$router.push(`/sales-payments?property_id=${id}`); },

    // Status Management Methods
    getStatusLabel(status) {
      const labels = {
        'available': 'Available',
        'for_rent': 'For Rent',
        'for_sale': 'For Sale', 
        'rent': 'Rented',
        'sale': 'Sold',
        'under_maintenance': 'Maintenance'
      };
      return labels[status] || status;
    },

    async updatePropertyStatus(property, newStatus, successMessage) {
      if (!this.$hasPermission("pms.change_property")) {
        this.$root.$refs.toast.showToast("You do not have permission to change property status.", "error");
        return;
      }
      try {
        const res = await this.$apiPatch(`/update_property`, property.id, {
          id: property.id,
          status: newStatus
        });
        if (res) {
          this.$root.$refs.toast.showToast(successMessage, "success");
          await this.fetchProperties();
        }
      } catch (error) {
        console.error('Status update failed:', error);
        this.$root.$refs.toast.showToast("Failed to update property status", "error");
      }
    },

    markForRent(property) {
      this.updatePropertyStatus(property, 'for_rent', 'Property listed for rent');
    },

    markForSale(property) {
      this.updatePropertyStatus(property, 'for_sale', 'Property listed for sale');
    },

    markAsRented(property) {
      this.updatePropertyStatus(property, 'rent', 'Property marked as rented');
    },

    markAsSold(property) {
      this.updatePropertyStatus(property, 'sale', 'Property marked as sold');
    },

    markAvailable(property) {
      this.updatePropertyStatus(property, 'available', 'Property marked as available');
    },

    markMaintenance(property) {
      this.updatePropertyStatus(property, 'under_maintenance', 'Property marked for maintenance');
    },

    endRental(property) {
      // When ending rental, property becomes available again
      this.updatePropertyStatus(property, 'available', 'Rental ended - property now available');
    },

    // CSV Structural File Matrix Processing Engine
    async exportToCSV(type) {
      this.loading = true;
      let dataset = [];

      try {
        if (type === "displayed") {
          dataset = this.properties;
        } else if (type === "all") {
          // Direct API query hitting maximum bounds with matching parameters to process background pipeline
          const params = {
            page: 1,
            page_size: 1000000,
            search: this.searchTerm,
            ordering: this.ordering,
            status: this.status,
          };
          if (this.$route.query.zone_id || this.zone_id) {
            params.property_zone_id = this.$route.query.zone_id || this.zone_id;
          }

          const result = await this.$getProperties(params);
          dataset = result.properties || [];
        }

        if (dataset.length === 0) {
          this.$root.$refs.toast.showToast("No matching data available to build target spreadsheet", "error");
          return;
        }

        // Establish core headers matching property schema data definitions
        const headers = ["Property ID", "Property Name", "Owner Name", "Manager Name", "City", "Zone Name", "Property Type", "Status"];
        const sanitizeToken = (val) => val ? `"${String(val).replace(/"/g, '""')}"` : '""';

        const rowStream = [
          headers.join(","),
          ...dataset.map(p => [
            sanitizeToken(p.id),
            sanitizeToken(p.name),
            sanitizeToken(p.ownerName || "N/A"),
            sanitizeToken(p.managerName || "N/A"),
            sanitizeToken(p.city || "N/A"),
            sanitizeToken(p.zoneName || "N/A"),
            sanitizeToken(p.property_type || "N/A"),
            sanitizeToken(p.status || "N/A")
          ].join(","))
        ];

        // Format CSV context string as a downloadable Blob document element
        const documentString = "data:text/csv;charset=utf-8," + encodeURIComponent(rowStream.join("\n"));
        const downloadAnchor = document.createElement("a");
        
        downloadAnchor.setAttribute("href", documentString);
        downloadAnchor.setAttribute("download", `Properties_Export_${type}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(downloadAnchor);
        
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        this.$root.$refs.toast.showToast("Real estate inventory spreadsheet downloaded successfully", "success");
      } catch (error) {
        console.error("Export sequence malfunction:", error);
        this.$root.$refs.toast.showToast("Failed to compile target data matrix file", "error");
      } finally {
        this.loading = false;
      }
    }
  },
};
</script>

<style scoped>
.btn-action { @apply h-7 w-7 flex items-center justify-center rounded-lg text-xs transition-colors; }
.btn-blue   { @apply bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white; }
.btn-green  { @apply bg-green-50 text-green-600 hover:bg-green-600 hover:text-white; }
.btn-orange { @apply bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white; }
.btn-red    { @apply bg-red-50 text-red-600 hover:bg-red-600 hover:text-white; }
.btn-gray   { @apply bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white; }
.btn-page   { @apply flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all; }
.status-btn { @apply h-6 w-6 flex items-center justify-center rounded text-xs transition-colors; }
</style>