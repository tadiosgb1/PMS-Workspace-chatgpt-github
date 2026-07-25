<template>
  <div class="min-h-screen bg-gray-100 pb-10">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading zone detail..." />

    <!-- Top Bar -->
    <div class="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
      <button @click="$router.back()" class="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition uppercase tracking-wider">
        <i class="fas fa-arrow-left text-[10px]"></i> Back
      </button>
      <button @click="addPictureVisible = true" class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition">
        <i class="fas fa-camera text-xs"></i> Add Zone Picture
      </button>
    </div>

    <div v-if="zone" class="max-w-5xl mx-auto px-4 pt-6 space-y-5">

      <!-- Zone Title with Status -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-xl font-black text-gray-800">{{ zone.name }}</h1>
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
          </div>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Zone Management / Details</p>
        </div>
        <button @click="updateZoneStatusVisible = true" class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition">
          <i class="fas fa-cog text-xs"></i> Manage Status
        </button>
      </div>

      <!-- Zone Status Management Panel -->
      <div v-if="updateZoneStatusVisible" class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-700">Zone Status Management</h3>
          <button @click="updateZoneStatusVisible = false" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button @click="updateZoneStatus('active')" class="status-action-card bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100">
            <i class="fas fa-check-circle"></i>
            <span>Mark Active</span>
          </button>
          <button @click="updateZoneStatus('development')" class="status-action-card bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
            <i class="fas fa-construction"></i>
            <span>Under Development</span>
          </button>
          <button @click="updateZoneStatus('for_sale')" class="status-action-card bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100">
            <i class="fas fa-tag"></i>
            <span>List for Sale</span>
          </button>
          <button @click="updateZoneStatus('fully_occupied')" class="status-action-card bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
            <i class="fas fa-users"></i>
            <span>Fully Occupied</span>
          </button>
          <button @click="updateZoneStatus('maintenance')" class="status-action-card bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
            <i class="fas fa-tools"></i>
            <span>Maintenance Required</span>
          </button>
        </div>
      </div>

      <!-- Zone Properties Section -->
      <div class="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <div class="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-gray-700">Zone Properties</h2>
          <button @click="viewAllProperties()" class="text-xs text-blue-600 hover:text-blue-800 font-semibold transition">
            View All Properties <i class="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
        <div class="p-5">
          <!-- Properties Overview Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <div class="text-2xl font-black text-gray-600">{{ zoneStats.totalProperties }}</div>
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Properties</div>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div class="text-2xl font-black text-blue-600">{{ zoneStats.availableForRent }}</div>
              <div class="text-xs font-semibold text-blue-500 uppercase tracking-wider">For Rent</div>
            </div>
            <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div class="text-2xl font-black text-orange-600">{{ zoneStats.availableForSale }}</div>
              <div class="text-xs font-semibold text-orange-500 uppercase tracking-wider">For Sale</div>
            </div>
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div class="text-2xl font-black text-green-600">{{ zoneStats.occupied }}</div>
              <div class="text-xs font-semibold text-green-500 uppercase tracking-wider">Occupied</div>
            </div>
          </div>

          <!-- Recent Properties List -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Recent Properties</h4>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div v-for="property in recentProperties" :key="property.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer" @click="goToPropertyDetail(property.id)">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-gray-200 text-gray-600 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {{ (property.name||'').substring(0,2) }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-700">{{ property.name }}</div>
                 </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :class="{
                    'bg-gray-400': property.status === 'available',
                    'bg-blue-500': property.status === 'for_rent',
                    'bg-orange-500': property.status === 'for_sale', 
                    'bg-green-500': property.status === 'rent' || property.status === 'sale',
                    'bg-red-500': property.status === 'under_maintenance'
                  }"></div>
                  <span class="text-xs text-gray-500 capitalize">{{ getPropertyStatusLabel(property.status) }}</span>
                </div>
              </div>
              <div v-if="!recentProperties.length" class="text-center text-xs text-gray-400 py-4">
                No properties in this zone
              </div>
            </div>
          </div>

          <!-- Property Management Actions -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button @click="viewAllProperties()" class="action-card bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
              <i class="fas fa-building text-lg"></i>
              <div>
                <div class="font-semibold">All Properties</div>
                <div class="text-xs opacity-75">View zone properties</div>
              </div>
            </button>
            
            <button @click="viewRentPayments()" class="action-card bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
              <i class="fas fa-receipt text-lg"></i>
              <div>
                <div class="font-semibold">Rental Payments</div>
                <div class="text-xs opacity-75">Track rent payments</div>
              </div>
            </button>
            
            <button @click="viewSalesPayments()" class="action-card bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100">
              <i class="fas fa-dollar-sign text-lg"></i>
              <div>
                <div class="font-semibold">Sales Payments</div>
                <div class="text-xs opacity-75">Monitor sales transactions</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Zone Coworking Spaces Section -->
      <div class="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <div class="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-gray-700">Zone Coworking Spaces</h2>
          <button @click="viewAllCoworkingSpaces()" class="text-xs text-blue-600 hover:text-blue-800 font-semibold transition">
            View All Spaces <i class="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
        <div class="p-5">
          <!-- Coworking Spaces Overview Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <div class="text-2xl font-black text-gray-600">{{ workspaceStats.totalSpaces }}</div>
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spaces</div>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div class="text-2xl font-black text-blue-600">{{ workspaceStats.totalCapacity }}</div>
              <div class="text-xs font-semibold text-blue-500 uppercase tracking-wider">Total Capacity</div>
            </div>
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div class="text-2xl font-black text-green-600">{{ workspaceStats.rented }}</div>
              <div class="text-xs font-semibold text-green-500 uppercase tracking-wider">Rented</div>
            </div>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div class="text-2xl font-black text-yellow-600">{{ workspaceStats.available }}</div>
              <div class="text-xs font-semibold text-yellow-500 uppercase tracking-wider">Available</div>
            </div>
          </div>

          <!-- Capacity Progress Visualization -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">Occupancy Progress</span>
              <span class="text-xs text-gray-500">{{ occupancyPercentage }}% occupied</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500" 
                   :style="`width: ${occupancyPercentage}%`"></div>
            </div>
          </div>

          <!-- Recent Coworking Spaces List -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Recent Coworking Spaces</h4>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div v-for="space in recentCoworkingSpaces" :key="space.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer" @click="goToCoworkingSpaceDetail(space.id)">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-gray-200 text-gray-600 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    <i class="fas fa-users"></i>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-700">{{ space.name }}</div>
                    <div class="text-xs text-gray-400">{{ space.location }} • Capacity: {{ space.capacity }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-500">
                  <span>${{ space.price_monthly }}/mo</span>
                </div>
              </div>
              <div v-if="!recentCoworkingSpaces.length" class="text-center text-xs text-gray-400 py-4">
                No coworking spaces in this zone
              </div>
            </div>
          </div>

          <!-- Coworking Space Management Actions -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button @click="viewAllCoworkingSpaces()" class="action-card bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
              <i class="fas fa-users text-lg"></i>
              <div>
                <div class="font-semibold">All Spaces</div>
                <div class="text-xs opacity-75">View zone spaces</div>
              </div>
            </button>
            
            <button @click="viewWorkspaceRentals()" class="action-card bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
              <i class="fas fa-list text-lg"></i>
              <div>
                <div class="font-semibold">Workspace Rentals</div>
                <div class="text-xs opacity-75">Manage agreements</div>
              </div>
            </button>
            
            <button @click="viewWorkspacePayments()" class="action-card bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100">
              <i class="fas fa-credit-card text-lg"></i>
              <div>
                <div class="font-semibold">Workspace Payments</div>
                <div class="text-xs opacity-75">Track payments</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Geographic -->
        <div class="lg:col-span-2 bg-white border border-gray-100 rounded-lg p-5">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Geographic Information</p>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Street Address</p>
              <p class="font-medium text-gray-700">{{ zone.address || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">City & State</p>
              <p class="font-medium text-gray-700">{{ zone.city }}, {{ zone.state }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Registered</p>
              <p class="font-medium text-gray-700">{{ new Date(zone.created_at).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>

        <!-- Stakeholders -->
        <div class="bg-white border border-gray-100 rounded-lg p-5">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Stakeholders</p>
          <div class="space-y-4">
            <div>
              <p class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Manager ID</p>
              <p class="font-black text-gray-800">#{{ zone?.manager?.first_name }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Owner ID</p>
              <p class="font-black text-gray-800">#{{ zone?.owner?.first_name }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="zone?.description" class="bg-white border border-gray-100 rounded-lg p-4 text-sm text-gray-600">
        {{ zone.description }}
      </div>

      <!-- Gallery -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-black text-gray-800">Zone Gallery</h3>
          <span class="text-[10px] text-gray-400 font-semibold uppercase">{{ zone?.images?.length || 0 }} assets</span>
        </div>

        <div v-if="zone?.images" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="pic in zone.images" :key="pic.id" class="group relative bg-white border border-gray-100 rounded-lg overflow-hidden">
            <div class="aspect-video bg-gray-100 overflow-hidden">
              <img :src="BASE_URL + pic.property_image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer" @click="previewImage(pic.property_image)" />
            </div>
            <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click.stop="openUpdatePicture(pic)" class="h-6 w-6 flex items-center justify-center rounded bg-white/90 text-gray-600 hover:text-gray-800 shadow text-xs" title="Update">
                <i class="fas fa-sync-alt"></i>
              </button>
              <button @click.stop="askDeletePicture(pic)" class="h-6 w-6 flex items-center justify-center rounded bg-red-500 text-white shadow text-xs" title="Delete">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="bg-white border border-gray-100 rounded-lg p-10 text-center text-sm text-gray-400 italic">No images uploaded yet.</div>
      </div>
    </div>

    <!-- Not found -->
    <div v-if="!zone && !loading" class="flex flex-col items-center justify-center mt-20 text-gray-400">
      <p class="text-sm font-semibold">Zone not found.</p>
    </div>

    <AddPropertyZonePicture v-if="addPictureVisible" :visible="addPictureVisible" :zoneId="$route.params.id" @close="addPictureVisible = false" @refresh="fetchZone" />
    <UpdatePropertyZonePicture v-if="updatePictureVisible" :visible="updatePictureVisible" :picture="pictureToUpdate" :zoneId="$route.params.id" @close="updatePictureVisible = false" @refresh="fetchZone" />
    <ConfirmModal v-if="confirmDeleteVisible" :visible="confirmDeleteVisible" title="Delete Image" message="Are you sure you want to permanently remove this image?" @confirm="confirmDeletePicture" @cancel="confirmDeleteVisible = false" />

    <!-- Image Preview -->
    <div v-if="imagePreviewVisible" class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" @click="imagePreviewVisible = false">
      <img :src="BASE_URL + imageToPreview" class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" @click.stop />
      <button @click="imagePreviewVisible = false" class="absolute top-4 right-4 text-white/70 hover:text-white text-xl">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import AddPropertyZonePicture from "./addPropertyZonePicture.vue";
import UpdatePropertyZonePicture from "./updatePropertyZonePicture.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Loading from "@/components/Loading.vue";

export default {
  name: "ZoneDetail",
  components: { Toast, AddPropertyZonePicture, UpdatePropertyZonePicture, ConfirmModal, Loading },
  data() {
    return {
      zone: null, 
      recentProperties: [],
      recentCoworkingSpaces: [],
      addPictureVisible: false, 
      updatePictureVisible: false, 
      confirmDeleteVisible: false,
      updateZoneStatusVisible: false,
      pictureToUpdate: null, 
      pictureToDelete: null,
      imagePreviewVisible: false, 
      imageToPreview: null,
      loading: false,
      BASE_URL: import.meta.env.VITE_BASE_SERVER_URL,
    };
  },
  mounted() { this.fetchZone(); },
  computed: {
    zoneStats() {
      const properties = this.recentProperties || [];
      return {
        totalProperties: properties.length,
        availableForRent: properties.filter(p => p.status === 'for_rent').length,
        availableForSale: properties.filter(p => p.status === 'for_sale').length,
        occupied: properties.filter(p => p.status === 'rent' || p.status === 'sale').length
      };
    },
    workspaceStats() {
      const spaces = this.recentCoworkingSpaces || [];
      const totalCapacity = spaces.reduce((sum, space) => sum + (space.capacity || 0), 0);
      // For now, we'll calculate estimated occupancy based on spaces
      // In a real app, this would come from rental data
      const estimatedRented = Math.floor(totalCapacity * 0.7); // 70% estimated occupancy
      return {
        totalSpaces: spaces.length,
        totalCapacity: totalCapacity,
        rented: estimatedRented,
        available: totalCapacity - estimatedRented
      };
    },
    occupancyPercentage() {
      const stats = this.workspaceStats;
      return stats.totalCapacity > 0 ? Math.round((stats.rented / stats.totalCapacity) * 100) : 0;
    }
  },
  methods: {
    async fetchZone() {
      this.loading = true;
      try {
        const res = await this.$apiGet(`/get_property_zone/${this.$route.params.id}`);
        this.zone = res.data || res;
        
        // Fetch zone-specific properties and coworking spaces
        await Promise.all([
          this.fetchZoneProperties(),
          this.fetchZoneCoworkingSpaces()
        ]);
      } catch (err) { 
        console.error(err); 
      } finally { 
        this.loading = false; 
      }
    },

    async fetchZoneProperties() {
      try {
        const params = { 
          property_zone_id: this.$route.params.id,
          page_size: 10 // Limit to recent properties for the detail view
        };
        const result = await this.$getProperties('/get_properties', params);
        this.recentProperties = result.properties || [];
      } catch (err) {
        console.error('Failed to fetch zone properties:', err);
        this.recentProperties = [];
      }
    },

    async fetchZoneCoworkingSpaces() {
      try {
        // Note: This assumes the API supports zone filtering for coworking spaces
        // You may need to adjust the API endpoint and parameters based on your backend
        const url = `/get_coworking_spaces?zone__id=${this.$route.params.id}&page_size=10`;
        const result = await this.$getCoworkingSpaces(url);
        this.recentCoworkingSpaces = result.spaces || [];
      } catch (err) {
        console.error('Failed to fetch zone coworking spaces:', err);
        this.recentCoworkingSpaces = [];
      }
    },

    // Zone Status Management
    getZoneStatusLabel(status) {
      const labels = {
        'active': 'Active',
        'development': 'Development', 
        'for_sale': 'For Sale',
        'fully_occupied': 'Full',
        'maintenance': 'Maintenance'
      };
      return labels[status] || 'Active';
    },

    async updateZoneStatus(newStatus) {
      try {
        const res = await this.$apiPatch(`/update_property_zone`, this.zone.id, {
          id: this.zone.id,
          status: newStatus
        });
        if (res) {
          this.zone.status = newStatus;
          this.updateZoneStatusVisible = false;
          this.$root.$refs.toast.showToast("Zone status updated successfully", "success");
        }
      } catch (error) {
        console.error('Zone status update failed:', error);
        this.$root.$refs.toast.showToast("Failed to update zone status", "error");
      }
    },

    // Property Status Helper
    getPropertyStatusLabel(status) {
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

    // Navigation Methods
    viewAllProperties() {
      this.$router.push(`/properties?zone=${this.$route.params.id}`);
    },

    viewAllCoworkingSpaces() {
      this.$router.push(`/coworking-spaces?zone_id=${this.$route.params.id}`);
    },

    viewRentPayments() {
      this.$router.push(`/rent-payments?zone_id=${this.$route.params.id}`);
    },

    viewSalesPayments() {
      this.$router.push(`/sales-payments?zone_id=${this.$route.params.id}`);
    },

    viewWorkspaceRentals() {
      this.$router.push(`/coworking-space-rentals?zone_id=${this.$route.params.id}`);
    },

    viewWorkspacePayments() {
      this.$router.push(`/workspace-payments?zone_id=${this.$route.params.id}`);
    },

    goToPropertyDetail(id) {
      this.$router.push(`/properties/${id}`);
    },

    goToCoworkingSpaceDetail(id) {
      this.$router.push(`/coworking-spaces/${id}`);
    },

    // Picture Management Methods
    openUpdatePicture(pic) { 
      this.pictureToUpdate = pic; 
      this.updatePictureVisible = true; 
    },

    askDeletePicture(pic) { 
      this.pictureToDelete = pic; 
      this.confirmDeleteVisible = true; 
    },

    async confirmDeletePicture() {
      this.confirmDeleteVisible = false;
      if (!this.pictureToDelete) return;
      try {
        const res = await this.$apiDelete(`/delete_property_zone_picture/${this.pictureToDelete.id}`);
        this.$root.$refs.toast.showToast(res.message || "Picture deleted", "success");
        this.fetchZone();
      } catch (err) { 
        this.$root.$refs.toast.showToast("Failed to delete picture", "error"); 
      }
      this.pictureToDelete = null;
    },

    previewImage(img) { 
      this.imageToPreview = img; 
      this.imagePreviewVisible = true; 
    },
  },
};
</script>

<style scoped>
.status-action-card {
  @apply flex flex-col items-center justify-center gap-2 p-4 border rounded-lg text-sm font-semibold transition-colors cursor-pointer;
}

.action-card {
  @apply flex items-center gap-3 p-4 border rounded-lg text-sm font-semibold transition-colors cursor-pointer;
}
</style>
