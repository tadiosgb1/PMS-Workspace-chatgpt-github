<template>
  <div class="pms-brand-page" class="p-6 bg-gray-100 min-h-screen text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading property listings..." />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Property Sale Listings</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Properties & Zones For Sale</p>
      </div>
      <button @click="$router.back()" class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold transition">
        <i class="fas fa-arrow-left text-xs"></i> Back
      </button>
    </div>

    <!-- Filters and Controls -->
    <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4 bg-white p-4 rounded-lg border border-gray-100">
      <div class="flex flex-wrap gap-3 items-center flex-1 w-full">
        <div class="relative flex-1 max-w-sm w-full">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input v-model="searchTerm" @input="onSearch" type="search"
            placeholder="Search properties, zones..."
            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white transition" />
        </div>

        <select v-model="statusFilter" @change="onSearch"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
          <option value="">All Status</option>
          <option value="listed">Listed For Sale</option>
          <option value="sold">Sold</option>
          <option value="pending">Sale Pending</option>
        </select>

        <select v-model="typeFilter" @change="onSearch"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
          <option value="">All Types</option>
          <option value="property">Properties Only</option>
          <option value="zone">Zones Only</option>
        </select>

        <select v-model="pageSize" @change="onSearch"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
          <option v-for="s in [10,20,50,100]" :key="s" :value="s">{{ s }} / page</option>
        </select>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left">Property / Zone</th>
              <th class="px-4 py-3 text-left">Type & Location</th>
              <th class="px-4 py-3 text-left">Price (ETB)</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="listing in listings" :key="listing.id" class="hover:bg-gray-50 transition-colors">
              <!-- Property/Zone Name -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {{ getItemInitials(listing) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-gray-800 truncate">{{ getItemName(listing) }}</div>
                    <div class="text-xs text-gray-500 truncate">{{ getItemDescription(listing) }}</div>
                  </div>
                </div>
              </td>

              <!-- Type & Location -->
              <td class="px-4 py-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase" :class="{
                      'bg-blue-100 text-blue-700': isProperty(listing),
                      'bg-purple-100 text-purple-700': isZone(listing)
                    }">
                      {{ isProperty(listing) ? 'Property' : 'Zone' }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-600">{{ getLocation(listing) }}</div>
                </div>
              </td>

              <!-- Price -->
              <td class="px-4 py-3">
                <div class="space-y-1">
                  <div class="font-semibold text-gray-700">{{ formatPrice(listing.listing_price) }} ETB</div>
                  <div class="text-xs text-gray-400">{{ formatPriceWords(listing.listing_price) }}</div>
                </div>
              </td>

              <!-- Status -->
              <td class="px-4 py-3 text-center">
                <span class="px-2 py-1 rounded-full text-[10px] font-semibold uppercase" :class="{
                  'bg-green-100 text-green-700': getItemStatus(listing) === 'listed',
                  'bg-blue-100 text-blue-700': getItemStatus(listing) === 'sold',
                  'bg-yellow-100 text-yellow-700': getItemStatus(listing) === 'pending'
                }">
                  {{ getStatusLabel(getItemStatus(listing)) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button @click="goToDetail(listing)" 
                          class="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition text-xs" 
                          title="View Details">
                    <i class="fas fa-eye"></i>
                  </button>
                  
                  <button v-if="getItemStatus(listing) === 'listed'" 
                          @click="sale(listing)" 
                          class="h-7 w-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition text-xs" 
                          title="Process Sale">
                    <i class="fas fa-handshake"></i>
                  </button>
                  
                  <button @click="editListing(listing)"
                          class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white transition text-xs" 
                          title="Edit Listing">
                    <i class="fas fa-edit"></i>
                  </button>
                  
                  <button @click="deleteListing(listing.id)"
                          class="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition text-xs" 
                          title="Remove Listing">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="listings.length === 0 && !loading">
              <td colspan="5" class="px-4 py-10 text-center text-sm text-gray-400 italic">No property listings found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">
        Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of <span class="font-semibold text-gray-700">{{ totalPages }}</span>
        — <span class="font-semibold text-gray-700">{{ totalCount }}</span> total
      </span>
      <div class="flex items-center gap-2">
        <button :disabled="!previous" @click="fetchListings(previous)" class="btn-page">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <span class="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-bold min-w-[2rem] text-center">
          {{ currentPage }}
        </span>
        <button :disabled="!next" @click="fetchListings(next)" class="btn-page">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <AddPropertySaleListing v-if="visible" :visible="visible" @close="visible = false" @refresh="fetchListings" />
    <MakePropertySale v-if="saleVisible" :visible="saleVisible" :listing="selectedListing" @close="saleVisible = false" @success="fetchListings" />
    <ConfirmModal v-if="deleteVisible" :visible="deleteVisible" title="Remove Listing" 
                  message="Are you sure you want to remove this property from sale?" 
                  @confirm="confirmDelete" @cancel="deleteVisible = false" />
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";
import AddPropertySaleListing from "./add.vue";
import MakePropertySale from "./MakePropertySale.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";

export default {
  name: "PropertySaleListingView",
  components: { Toast, Loading, AddPropertySaleListing, MakePropertySale, ConfirmModal },
  data() {
    return {
      listings: [], 
      visible: false, 
      searchTerm: "",
      statusFilter: "",
      typeFilter: "",
      saleVisible: false, 
      selectedListing: null,
      next: null, 
      previous: null, 
      pageSize: 10,
      currentPage: 1, 
      totalPages: 1,
      totalCount: 0,
      loading: false,
      deleteVisible: false,
      deleteId: null,
    };
  },
  mounted() { 
    this.fetchListings(); 
  },
  methods: {
    async fetchListings(url = null) {
      this.loading = true;
      try {
        let apiUrl = url;
        if (!apiUrl) {
          const params = new URLSearchParams({
            search: this.searchTerm,
            page_size: this.pageSize,
            page: this.currentPage
          });
          if (this.statusFilter) params.append('status', this.statusFilter);
          if (this.typeFilter) params.append('type', this.typeFilter);
          apiUrl = `/get_property_zone_sales?${params.toString()}`;
        }

        const response = await this.$apiGet(apiUrl);
        if (response?.data) {
          this.listings = response.data || [];
          this.next = response.next; 
          this.previous = response.previous;
          this.currentPage = response.current_page || 1; 
          this.totalPages = response.total_pages || 1;
          this.totalCount = response.count || 0;
        }
      } catch (error) { 
        console.error(error); 
        this.listings = []; 
      } finally {
        this.loading = false;
      }
    },

    onSearch() { 
      this.currentPage = 1; 
      this.fetchListings(); 
    },

    // Item type detection
    isProperty(listing) {
      return listing.property_id !== null && listing.property_id !== undefined;
    },

    isZone(listing) {
      return listing.property_zone_id !== null && listing.property_zone_id !== undefined;
    },

    // Get item details
    getItemName(listing) {
      if (this.isProperty(listing)) {
        return listing.property_id?.name || listing.property?.name || 'Unknown Property';
      }
      return listing.property_zone_id?.name || listing.zone?.name || 'Unknown Zone';
    },

    getItemDescription(listing) {
      if (this.isProperty(listing)) {
        return listing.property_id?.address || listing.property?.address || 'No address';
      }
      return listing.property_zone_id?.description || listing.zone?.description || 'Zone description';
    },

    getItemInitials(listing) {
      const name = this.getItemName(listing);
      return name.substring(0, 2).toUpperCase();
    },

    getLocation(listing) {
      if (this.isProperty(listing)) {
        const prop = listing.property_id || listing.property || {};
        return `${prop.city || ''}, ${prop.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Location not specified';
      }
      const zone = listing.property_zone_id || listing.zone || {};
      return `${zone.city || ''}, ${zone.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Location not specified';
    },

    getItemStatus(listing) {
      // Check if the item is sold based on property/zone status
      if (this.isProperty(listing)) {
        const status = listing.property_id?.status || listing.property?.status;
        return status === 'sale' ? 'sold' : 'listed';
      } else {
        const status = listing.property_zone_id?.status || listing.zone?.status;
        return status === 'sold' ? 'sold' : 'listed';
      }
    },

    getStatusLabel(status) {
      const labels = {
        'listed': 'For Sale',
        'sold': 'Sold',
        'pending': 'Sale Pending'
      };
      return labels[status] || status;
    },

    // Currency formatting for Ethiopian Birr
    formatPrice(price) {
      if (!price) return '0';
      return parseFloat(price).toLocaleString();
    },

    formatPriceWords(price) {
      if (!price) return '';
      const num = parseFloat(price);
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M Birr`;
      } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K Birr`;
      }
      return 'Birr';
    },

    // Navigation
    goToDetail(listing) {
      if (this.isProperty(listing)) {
        const propertyId = listing.property_id?.id || listing.property?.id;
        if (propertyId) {
          this.$router.push({ name: "PropertyDetail", params: { id: propertyId } });
        }
      } else {
        const zoneId = listing.property_zone_id?.id || listing.zone?.id;
        if (zoneId) {
          this.$router.push({ name: "zoneDetail", params: { id: zoneId } });
        }
      }
    },

    // Actions
    sale(listing) {
      this.selectedListing = listing;
      this.saleVisible = true;
    },

    editListing(listing) {
      // Open edit modal
      this.selectedListing = listing;
      this.visible = true;
    },

    deleteListing(id) {
      this.deleteId = id;
      this.deleteVisible = true;
    },

    async confirmDelete() {
      try {
        const res = await this.$apiDelete(`/delete_property_zone_sale/${this.deleteId}`);
        if (res) {
          this.$root.$refs.toast.showToast("Listing removed successfully", "success");
          this.fetchListings();
        }
      } catch (error) {
        console.error(error);
        this.$root.$refs.toast.showToast("Failed to remove listing", "error");
      }
      this.deleteVisible = false;
      this.deleteId = null;
    },
  },
};
</script>

<style scoped>
.btn-page {
  @apply flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all;
}
</style>
