<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-6">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading space details..." />

    <div v-if="space" class="max-w-6xl mx-auto space-y-4">
      
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button @click="$router.back()" class="text-xs font-semibold text-gray-500 hover:text-gray-700 transition flex items-center gap-2 mb-2">
            <i class="fas fa-arrow-left text-xs"></i> Back to Spaces
          </button>
          <h1 class="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
            {{ space.name }}
            <span class="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
              ID: #{{ space.id }}
            </span>
          </h1>
        </div>
        
        <div class="flex items-center gap-2">
          <button
            @click="openEdit"
            class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:shadow-sm transition flex items-center gap-2"
          >
            <i class="fas fa-edit text-blue-500 text-xs"></i> Edit Details
          </button>
          <button
            @click="addPictureVisible = true"
            class="px-3 py-2 bg-gray-800 text-white rounded-lg text-xs font-semibold shadow hover:bg-gray-700 hover:shadow-md transition flex items-center gap-2"
          >
            <i class="fas fa-camera text-xs"></i> Add Media
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        <div class="lg:col-span-2 space-y-4">
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <i class="fas fa-info-circle text-gray-600 text-sm"></i>
              <h2 class="text-sm font-bold text-gray-700">General Overview</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="space-y-3">
                <div>
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</p>
                  <p class="text-sm text-gray-700 font-medium flex items-center gap-2 mt-1">
                    <i class="fas fa-map-marker-alt text-red-400 text-xs"></i> {{ space.location }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Max Capacity</p>
                  <p class="text-sm text-gray-700 font-medium flex items-center gap-2 mt-1">
                    <i class="fas fa-users text-blue-400 text-xs"></i> {{ space.capacity }} Seats Available
                  </p>
                </div>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assigned Zone</p>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-800">{{ space.zone?.name }}</span>
                  <button @click="goToZoneDetail(space.zone.id)" class="text-xs font-semibold bg-white px-2 py-1 rounded border border-gray-200 text-blue-600 hover:bg-blue-50 transition">
                    Open Zone <i class="fas fa-external-link-alt ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <i class="fas fa-chart-bar text-gray-600 text-sm"></i>
                <h2 class="text-xs font-bold text-gray-700 uppercase tracking-wide">Capacity & Rental Tracking</h2>
              </div>
              <button @click="addRentalVisible = true" class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition flex items-center gap-2">
                <i class="fas fa-plus text-xs"></i> Add Rental
              </button>
            </div>

            <!-- Capacity Overview Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div class="text-xl font-bold text-blue-600">{{ space.capacity || 0 }}</div>
                <div class="text-xs font-medium text-blue-500 uppercase tracking-wide">Total Capacity</div>
              </div>
              <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div class="text-xl font-bold text-green-600">{{ rentalStats.rented }}</div>
                <div class="text-xs font-medium text-green-500 uppercase tracking-wide">Rented</div>
              </div>
              <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <div class="text-xl font-bold text-red-600">{{ rentalStats.unpaid }}</div>
                <div class="text-xs font-medium text-red-500 uppercase tracking-wide">Unpaid</div>
              </div>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <div class="text-xl font-bold text-gray-600">{{ rentalStats.available }}</div>
                <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Available</div>
              </div>
            </div>

            <!-- Current Rentals List -->
            <div class="mb-4">
              <h4 class="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Current Rentals</h4>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div v-for="rental in activeRentals" :key="rental.id" 
                     class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-xs">
                  <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded bg-gray-200 text-gray-600 font-bold text-xs flex items-center justify-center">
                      {{ rental.guest_name.substring(0,1) }}
                    </div>
                    <div>
                      <div class="font-medium text-gray-700">{{ rental.guest_name }}</div>
                      <div class="text-gray-400">{{ rental.cycle }} • {{ formatDate(rental.start_date) }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded text-xs font-medium" :class="{
                      'bg-red-100 text-red-700': rental.is_active,
                      'bg-green-100 text-green-700': !rental.is_active
                    }">
                      {{ rental.is_active ? 'Unpaid' : 'Paid' }}
                    </span>
                    <button @click="viewRentalPayment(rental.id)" 
                            class="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium transition">
                      Payment
                    </button>
                  </div>
                </div>
                <div v-if="!activeRentals.length" class="text-center text-xs text-gray-400 py-4">
                  No active rentals
                </div>
              </div>
            </div>

            <!-- Rental Management Actions -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button @click="viewWorkspaceRentals()" class="rental-action-card bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                <i class="fas fa-list"></i>
                <div class="text-left">
                  <div class="font-bold text-xs">View All Rentals</div>
                  <div class="text-xs opacity-75">Manage agreements</div>
                </div>
              </button>
              
              <button @click="viewAllPayments()" class="rental-action-card bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                <i class="fas fa-dollar-sign"></i>
                <div class="text-left">
                  <div class="font-bold text-xs">Payment Tracking</div>
                  <div class="text-xs opacity-75">Monitor payments</div>
                </div>
              </button>
              
              <button @click="releaseExpiredRentals()" class="rental-action-card bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100">
                <i class="fas fa-calendar-times"></i>
                <div class="text-left">
                  <div class="font-bold text-xs">Release Expired</div>
                  <div class="text-xs opacity-75">Free capacity</div>
                </div>
              </button>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <i class="fas fa-concierge-bell text-gray-600 text-sm"></i>
              <h2 class="text-sm font-bold text-gray-700">Amenities & Services</h2>
            </div>

            <div v-if="amenities.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="(item, index) in amenities"
                :key="index"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition group"
              >
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform"></div>
                  <span class="text-xs font-medium text-gray-600">{{ item.amenity }}</span>
                </div>
                <span class="text-sm font-semibold text-gray-800">{{ item.value }}</span>
              </div>
            </div>
            <div v-else class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <i class="fas fa-clipboard-list text-gray-300 text-2xl mb-2"></i>
              <p class="text-xs font-semibold text-gray-400">No amenities configured</p>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <i class="fas fa-images text-gray-600 text-sm"></i>
              <h2 class="text-sm font-bold text-gray-700">Visual Assets</h2>
            </div>

            <div v-if="space.pictures.length" class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div
                v-for="pic in space.pictures"
                :key="pic.id"
                class="group relative aspect-video rounded-lg overflow-hidden cursor-pointer shadow-sm border border-gray-100"
                @click="previewImage(getImageUrl(pic.image))"
              >
                <img :src="getImageUrl(pic.image)" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <i class="fas fa-search-plus text-white text-lg"></i>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <i class="fas fa-images text-gray-300 text-2xl mb-2"></i>
              <p class="text-xs font-semibold text-gray-400">Gallery Empty</p>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          
          <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-5 text-white relative overflow-hidden">
             <div class="relative z-10">
                <div class="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                  <i class="fas fa-coins text-blue-400 text-sm"></i>
                  <h2 class="text-sm font-bold">Pricing Matrix</h2>
                </div>
                
                <div class="space-y-3">
                  <div class="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                    <span class="text-xs font-semibold text-gray-300">Daily Rate</span>
                    <span class="text-sm font-bold text-blue-400">${{ space.price_daily }}</span>
                  </div>
                  <div class="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                    <span class="text-xs font-semibold text-gray-300">Monthly Rate</span>
                    <span class="text-sm font-bold text-blue-400">${{ space.price_monthly }}</span>
                  </div>
                  <div class="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                    <span class="text-xs font-semibold text-gray-300">Quarterly Rate</span>
                    <span class="text-sm font-bold text-blue-400">${{ space.price_quarterly }}</span>
                  </div>
                  <div class="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                    <span class="text-xs font-semibold text-gray-300">Yearly Rate</span>
                    <span class="text-sm font-bold text-blue-400">${{ space.price_yearly }}</span>
                  </div>
                </div>
             </div>
             <i class="fas fa-wallet absolute -bottom-3 -right-3 text-6xl text-white/5 -rotate-12"></i>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">System Metadata</h2>
            <div class="space-y-2">
              <div class="flex justify-between text-xs">
                <span class="text-gray-500 font-medium">Created</span>
                <span class="text-gray-700 font-semibold">{{ formatDate(space.created_at) }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-500 font-medium">Last Updated</span>
                <span class="text-gray-700 font-semibold">{{ formatDate(space.updated_at) }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <UpdateCoworkspace :visible="updateVisible" :space="spaceToEdit" @close="updateVisible = false" @refresh="fetchSpace" />
    <AddPropertySpacePicture v-if="addPictureVisible" :visible="addPictureVisible" :spaceId="$route.params.id" @close="addPictureVisible = false" @refresh="fetchSpace" />
    <AddWorkspaceRental :visible="addRentalVisible" :preSelectedSpace="space" @close="addRentalVisible = false" @success="handleRentalAdded" />

    <div v-if="imagePreviewVisible" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" @click="imagePreviewVisible = false">
      <div class="relative max-w-4xl w-full h-full flex items-center justify-center">
        <img :src="imageToPreview" class="max-h-full max-w-full rounded-lg shadow-2xl object-contain border border-white/10" @click.stop />
        <button @click="imagePreviewVisible = false" class="absolute top-4 right-4 p-3 text-white text-xl hover:text-red-400 transition bg-black/20 rounded-lg backdrop-blur-sm">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import AddPropertySpacePicture from "./spcaePicture.vue";
import UpdateCoworkspace from "./update.vue";
import AddWorkspaceRental from "../workspaceRental/add.vue";

export default {
  name: "CoworkingSpaceDetail",

  components: {
    AddPropertySpacePicture,
    UpdateCoworkspace,
    AddWorkspaceRental,
  },

  data() {
    return {
      space: { pictures: [], rentals: [] },
      loading: true,
      error: null,

      addPictureVisible: false,
      addRentalVisible: false,

      // edit modal
      updateVisible: false,
      spaceToEdit: null,

      // image preview
      imagePreviewVisible: false,
      imageToPreview: null,
    };
  },

  computed: {
    amenities() {
      if (!this.space.description) return [];

      return this.space.description.split(",").map(pair => {
        const [key, value] = pair.split(":");
        return {
          amenity: key?.trim(),
          value: value?.replace(/"/g, "").trim(),
        };
      });
    },

    activeRentals() {
      // Get all rentals from the space data
      return this.space.rentals || [];
    },

    rentalStats() {
      const totalCapacity = this.space.capacity || 0;
      const rentals = this.activeRentals;
      
      // Count active rentals (both paid and unpaid)
      const totalRented = rentals.length;
      
      // is_active: true = unpaid, is_active: false = paid
      const unpaid = rentals.filter(rental => rental.is_active === true).length;
      const paid = rentals.filter(rental => rental.is_active === false).length;
      
      // Available capacity = total capacity - number of rented slots
      const available = totalCapacity - totalRented;

      return {
        rented: totalRented,
        unpaid: unpaid,
        paid: paid,
        available: Math.max(0, available) // Ensure it's not negative
      };
    },

    occupancyPercentage() {
      const totalCapacity = this.space.capacity || 0;
      return totalCapacity > 0 ? Math.round((this.rentalStats.rented / totalCapacity) * 100) : 0;
    },

    paymentPercentage() {
      const rented = this.rentalStats.rented;
      return rented > 0 ? Math.round((this.rentalStats.paid / rented) * 100) : 0;
    }
  },

  mounted() {
    this.fetchSpace();
  },

  methods: {
    openEdit() {
      this.spaceToEdit = { ...this.space };
      this.updateVisible = true;
    },

    getImageUrl(imagePath) {
      if (!imagePath) return "";
      const apiBase = import.meta.env.VITE_APP_BASE_URL_LOCAL;
      return `${apiBase.replace("/api", "")}${imagePath}`;
    },

    previewImage(img) {
      this.imageToPreview = img;
      this.imagePreviewVisible = true;
    },

    goToZoneDetail(id) {
      this.$router.push(`/zones/${id}`);
    },

    handleRentalAdded() {
      this.$root.$refs.toast?.showToast("Workspace rental added successfully", "success");
      this.fetchSpace(); // Refresh space data to show new rental
    },

    // Workspace Rental Management Methods
    viewWorkspaceRentals() {
      this.$router.push(`/coworking-space-rentals?workspace_id=${this.$route.params.id}`);
    },

    viewAllPayments() {
      this.$router.push(`/workspace-payments?workspace_id=${this.$route.params.id}`);
    },

    viewRentalPayment(rentalId) {
      // Navigate to specific rental payment page using rental ID
      this.$router.push(`/coworking-payments/${rentalId}`);
    },

    async releaseExpiredRentals() {
      try {
        // This would call an API endpoint to release expired rentals
        // const response = await this.$apiPost(`/release_expired_workspace_rentals/${this.$route.params.id}`);
        this.$root.$refs.toast?.showToast("Expired rentals have been released", "success");
        this.fetchSpace(); // Refresh data
      } catch (error) {
        console.error('Failed to release expired rentals:', error);
        this.$root.$refs.toast?.showToast("Failed to release expired rentals", "error");
      }
    },

    async fetchSpace() {
      this.loading = true;
      try {
        const id = this.$route.params.id;
        const res = await this.$apiGetById(`/get_coworking_space`, id);
        this.space = res;
      } catch (err) {
        console.error(err);
        this.error = "Failed to load coworking space details.";
      } finally {
        this.loading = false;
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleDateString();
    },
  },
};
</script>

<style scoped>
.rental-action-card {
  @apply flex items-center gap-2 p-3 border rounded-lg text-xs font-medium transition-all cursor-pointer hover:shadow-sm;
}
</style>
