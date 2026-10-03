<template>
  <div class="pms-brand-page p-6 bg-gray-100 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <button
            @click="$router.back()"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <i class="fas fa-arrow-left"></i>
            <span class="font-medium">Back</span>
          </button>
          <div class="h-6 w-px bg-gray-200"></div>
          <h1 class="text-xl font-black text-gray-800 tracking-tight">Rent Agreement Details</h1>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="editRent(rent)"
            class="bg-white rounded-md flex items-center gap-2 px-5 py-2.5 border border-gray-300 hover:bg-gray-50  text-sm font-semibold text-gray-700 transition-colors"
          >
            <i class="fas fa-edit"></i> Edit Agreement
          </button>
          <button
            @click="addPictureVisible = true"
            class="bg-white rounded-md flex items-center gap-2 px-5 py-2.5 border border-gray-300 hover:bg-gray-50  text-sm font-semibold text-gray-700 transition-colors"
          >
            <i class="fas fa-camera"></i> Add Picture
          </button>
        </div>
      </div>

      <div v-if="loading" class="bg-white rounded-3xl p-12 text-center">
        <div class="animate-spin w-8 h-8 border-4 border-gray-200 border-t-gray-700 rounded-full mx-auto mb-4"></div>
        <p class="text-gray-500">Loading agreement data...</p>
      </div>

      <div v-else-if="rent" class="bg-white shadow-sm border border-gray-100 overflow-hidden">
        
        <!-- Main Info -->
        <div class="p-8 border-b border-gray-100">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <p class="text-xs font-semibold text-gray-500 mb-1">STATUS</p>
              <span
                class="inline-block px-4 py-1.5 rounded-2xl text-sm font-semibold"
                :class="rent.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'"
              >
                {{ rent.status ? rent.status.toUpperCase() : 'N/A' }}
              </span>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 mb-1">START DATE</p>
              <p class="font-semibold text-gray-800">{{ formatDate(rent.start_date) }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 mb-1">END DATE</p>
              <p class="font-semibold text-gray-800">{{ rent.end_date ? formatDate(rent.end_date) : 'Ongoing' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 mb-1">RENT AMOUNT</p>
              <p class="text-2xl font-black text-gray-900">{{ rent.rent_amount }} ETB</p>
            </div>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
          
          <!-- Left Column -->
          <div class="lg:col-span-5 space-y-8">
            <div>
              <h3 class="text-xs font-semibold text-gray-500 mb-4">PROPERTY & TENANT</h3>
              <div class="bg-gray-50 rounded-2xl p-6 space-y-6">
                <div>
                  <p class="text-xs text-gray-500">Property</p>
                  <p class="font-semibold text-gray-800">{{ rent.property_id?.name || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Primary Tenant</p>
                  <p class="font-semibold text-gray-800">
                    {{ rent.user_id?.first_name }} {{ rent.user_id?.last_name }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Agreement Type</p>
                  <span class="inline-block px-4 py-1 bg-gray-100 text-gray-600 rounded-2xl text-xs font-medium">
                    {{ rent.rent_type }}
                  </span>
                </div>
              </div>
            </div>

            <button 
              @click="viewPayments(rent.id)"
              class="w-full flex items-center justify-between border border-gray-200 hover:border-gray-300 p-6 rounded-3xl group transition-all"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600">
                  <i class="fas fa-receipt"></i>
                </div>
                <div>
                  <p class="font-semibold text-gray-700">Payment History</p>
                  <p class="text-xs text-gray-500">View all transactions</p>
                </div>
              </div>
              <i class="fas fa-chevron-right text-gray-400 group-hover:text-gray-600 transition-colors"></i>
            </button>
          </div>

          <!-- Right Column -->
          <div class="lg:col-span-7">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-semibold text-gray-500">ATTACHED DOCUMENTS</h3>
              <span class="text-xs text-gray-400">{{ pictures?.length || 0 }} files</span>
            </div>

            <div v-if="pictures && pictures.length" class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div
                v-for="pic in visiblePictures"
                :key="pic.id"
                @click="previewImage(pic.rent_image)"
                class="group relative aspect-video bg-gray-100 rounded-2xl overflow-hidden cursor-pointer border border-gray-100 hover:border-gray-300 transition-all"
              >
                <img :src="pic.rent_image" class="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent h-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-end p-3">
                  <div class="flex gap-2 w-full">
                    <button @click.stop="openUpdatePicture(pic)" class="flex-1 text-[10px] py-1.5 bg-white/90 text-gray-700 hover:bg-white rounded-lg font-medium">Update</button>
                    <button @click.stop="askDeletePicture(pic)" class="flex-1 text-[10px] py-1.5 bg-rose-500 text-white hover:bg-rose-600 rounded-lg font-medium">Delete</button>
                  </div>
                </div>
              </div>

              <div v-if="remainingPicturesCount > 0 && !showAllPictures" @click="showAllPictures = true" 
                class="aspect-video border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                <span class="text-xl font-black text-gray-400">+{{ remainingPicturesCount }}</span>
                <span class="text-xs font-medium text-gray-400">More Images</span>
              </div>
            </div>

            <div v-else class="border border-dashed border-gray-200 rounded-3xl py-16 text-center">
              <i class="fas fa-images text-4xl text-gray-200 mb-3"></i>
              <p class="text-sm text-gray-400">No documents attached yet</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="bg-white rounded-3xl p-16 text-center">
        <p class="text-gray-400">Rent record not found</p>
      </div>
    </div>

    <!-- Modals -->
    <AddPictureModal v-if="addPictureVisible" :visible="addPictureVisible" :rentId="rentId" @close="addPictureVisible = false" @refresh="fetchPictures" />
    <UpdatePictureModal v-if="updatePictureVisible" :visible="updatePictureVisible" :picture="pictureToUpdate" :rentId="rentId" @close="updatePictureVisible = false" @refresh="fetchPictures" />
    <ConfirmModal v-if="confirmDeleteVisible" :visible="confirmDeleteVisible" title="Confirm Delete" message="Remove this image from agreement?" @confirm="confirmDeletePicture" @cancel="confirmDeleteVisible = false" />

    <!-- Image Preview -->
    <div v-if="imagePreviewVisible" class="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4" @click="imagePreviewVisible = false">
      <div class="relative max-w-5xl w-full">
        <img :src="imageToPreview" class="max-h-[85vh] w-full object-contain rounded-2xl" @click.stop />
        <button @click="imagePreviewVisible = false" class="absolute -top-12 right-4 text-white text-3xl hover:text-gray-300">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import AddPictureModal from "@/views/closed/rent/addRentPicture.vue";
import UpdatePictureModal from "@/views/closed/rent/updateRentPicture.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";

export default {
  name: "RentDetailView",
  components: { AddPictureModal, UpdatePictureModal, ConfirmModal, Toast, Loading },
  data() {
    return {
      rent: null,
      pictures: [],
      rentId: "",
      addPictureVisible: false,
      updatePictureVisible: false,
      confirmDeleteVisible: false,
      pictureToUpdate: null,
      pictureToDelete: null,
      imagePreviewVisible: false,
      imageToPreview: null,
      showAllPictures: false,
      loading: false,
    };
  },
  computed: {
    visiblePictures() {
      if (!this.pictures) return [];
      return this.showAllPictures ? this.pictures : this.pictures.slice(0, 6);
    },
    remainingPicturesCount() {
      if (!this.pictures) return 0;
      return Math.max(0, this.pictures.length - 6);
    },
  },
  mounted() {
    this.rentId = this.$route.params.id;
    this.fetchRent();
    this.fetchPictures();
  },
  methods: {
    async fetchRent() {
      this.loading = true;
      try {
        const response = await this.$apiGetById("get_rent", this.rentId);
        this.rent = response;
      } catch (error) {
        console.error(error);
        this.rent = null;
      } finally {
        this.loading = false;
      }
    },

    async fetchPictures() {
      if (!this.rentId) return;
      try {
        const response = await this.$apiGet("/get_rent_pictures", { rent_id: this.rentId });
        this.pictures = response?.data || [];
      } catch (error) {
        console.error(error);
        this.pictures = [];
      }
    },

    openUpdatePicture(picture) {
      this.pictureToUpdate = picture;
      this.updatePictureVisible = true;
    },

    askDeletePicture(picture) {
      this.pictureToDelete = picture;
      this.confirmDeleteVisible = true;
    },

    async confirmDeletePicture() {
      this.confirmDeleteVisible = false;
      if (!this.pictureToDelete) return;
      try {
        await this.$apiDelete(`/delete_rent_picture/${this.pictureToDelete.id}`);
        this.$root.$refs.toast.showToast("Picture deleted successfully", "success");
        this.fetchPictures();
      } catch (err) {
        this.$root.$refs.toast.showToast("Failed to delete picture", "error");
      }
      this.pictureToDelete = null;
    },

    previewImage(url) {
      this.imageToPreview = url;
      this.imagePreviewVisible = true;
    },

    viewPayments(rentId) {
      this.$router.push({ name: "rents_payment_detail", params: { id: rentId } });
    },

    editRent(rent) {
      console.log("Edit rent:", rent);
      // Add your edit logic here
    },

    formatDate(dateStr) {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    },
  },
};
</script>