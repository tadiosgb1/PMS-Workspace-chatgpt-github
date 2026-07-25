<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-screen">
    <Loading :visible="loading" message="Loading property..." />

    <div v-if="property" class="max-w-6xl mx-auto space-y-5">

      <!-- Page header with status workflow -->
    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
  <!-- Left Section -->
  <div>
    <!-- Back Button -->
    <button
      @click="$router.go(-1)"
      class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition mb-3"
    >
      <i class="fas fa-arrow-left text-xs"></i>
      <span>Back</span>
    </button>

    <!-- Property Name -->
    <h1 class="text-2xl font-semibold text-gray-900">
      {{ property.name }}
    </h1>

    <!-- Status -->
    <div class="flex items-center gap-2 mt-2">
      <div
        class="w-2 h-2 rounded-full"
        :class="{
          'bg-gray-400': property.status === 'available',
          'bg-blue-500': property.status === 'for_rent',
          'bg-orange-500': property.status === 'for_sale',
          'bg-green-500': property.status === 'rent',
          'bg-purple-500': property.status === 'sale',
          'bg-red-500': property.status === 'under_maintenance'
        }"
      ></div>

      <span
        class="px-2 py-1 rounded-full text-xs font-medium uppercase"
        :class="{
          'bg-gray-100 text-gray-700': property.status === 'available',
          'bg-blue-100 text-blue-700': property.status === 'for_rent',
          'bg-orange-100 text-orange-700': property.status === 'for_sale',
          'bg-green-100 text-green-700': property.status === 'rent',
          'bg-purple-100 text-purple-700': property.status === 'sale',
          'bg-red-100 text-red-700': property.status === 'under_maintenance'
        }"
      >
        {{ getStatusLabel(property.status) }}
      </span>
    </div>
  </div>

  <!-- Right Section -->
  <div class="flex items-center">
    <button
      v-if="$hasPermission('pms.change_property')"
      @click="editProperty(property)"
      class="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
    >
      <i class="fas fa-edit text-xs"></i>
      Edit
    </button>
  </div>
</div>

      <!-- Property Status Workflow Tracker -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h2 class="text-sm font-semibold text-gray-700">Property Lifecycle & Actions</h2>
        </div>
        <div class="p-5">
          <!-- Workflow Selection Tabs -->
          <div class="flex items-center gap-4 mb-6">
            <button @click="activeWorkflow = 'rent'" 
                    :class="activeWorkflow === 'rent' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'"
                    class="px-4 py-2 rounded-lg border text-sm font-semibold transition">
              <i class="fas fa-home mr-2"></i>Rental Workflow
            </button>
            <button @click="activeWorkflow = 'sale'" 
                    :class="activeWorkflow === 'sale' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-600 border-gray-200'"
                    class="px-4 py-2 rounded-lg border text-sm font-semibold transition">
              <i class="fas fa-dollar-sign mr-2"></i>Sales Workflow
            </button>
          </div>

          <!-- Rental Workflow Visualization -->
          <div v-if="activeWorkflow === 'rent'" class="mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Rental Lifecycle Progress</h3>
            <div class="flex items-center justify-between relative">
              <!-- Progress Line -->
              <div class="absolute top-4 left-8 right-8 h-0.5 bg-gray-200"></div>
              <div class="absolute top-4 left-8 h-0.5 bg-blue-500 transition-all duration-500" 
                   :style="`width: ${getRentProgressWidth()}%`"></div>
              
              <!-- Status Steps -->
              <div v-for="(step, index) in statusSteps" :key="step.status" 
                   class="flex flex-col items-center relative z-10">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                     :class="getRentStepClasses(step.status, property.status)">
                  <i :class="step.icon"></i>
                </div>
                <span class="text-xs font-medium mt-1 text-center max-w-20" 
                      :class="isInRentFlow(property.status) && property.status === step.status ? 'text-gray-800' : 'text-gray-500'">
                  {{ step.label }}
                </span>
              </div>
            </div>
          </div>

          <!-- Sales Workflow Visualization -->
          <div v-if="activeWorkflow === 'sale'" class="mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Sales Lifecycle Progress</h3>
            <div class="flex items-center justify-between relative">
              <!-- Progress Line -->
              <div class="absolute top-4 left-8 right-8 h-0.5 bg-gray-200"></div>
              <div class="absolute top-4 left-8 h-0.5 bg-orange-500 transition-all duration-500" 
                   :style="`width: ${getSalesProgressWidth()}%`"></div>
              
              <!-- Status Steps -->
              <div v-for="(step, index) in salesSteps" :key="step.status" 
                   class="flex flex-col items-center relative z-10">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                     :class="getSalesStepClasses(step.status, property.status)">
                  <i :class="step.icon"></i>
                </div>
                <span class="text-xs font-medium mt-1 text-center max-w-20" 
                      :class="isInSalesFlow(property.status) && property.status === step.status ? 'text-gray-800' : 'text-gray-500'">
                  {{ step.label }}
                </span>
              </div>
            </div>
          </div>

          <!-- Current Status Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Available Actions -->
            <div v-if="property.status === 'available'" class="space-y-2">
              <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Available Actions</h4>
              <button @click="updateStatus('for_rent')" class="action-card bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                <i class="fas fa-home"></i>
                <span>List for Rent</span>
              </button>
              <button @click="updateStatus('for_sale')" class="action-card bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100">
                <i class="fas fa-tag"></i>
                <span>List for Sale</span>
              </button>
            </div>

            <!-- For Rent Actions -->
            <div v-if="property.status === 'for_rent'" class="space-y-2">
              <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Rental Actions</h4>
              <button @click="addRentVisible = true" class="action-card bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                <i class="fas fa-handshake"></i>
                <span>Mark as Rented</span>
              </button>
              <button @click="updateStatus('available')" class="action-card bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100">
                <i class="fas fa-times"></i>
                <span>Remove Listing</span>
              </button>
            </div>

            <!-- For Sale Actions -->
            <div v-if="property.status === 'for_sale'" class="space-y-2">
              <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Sales Actions</h4>
              <button @click="updateStatus('sale')" class="action-card bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100">
                <i class="fas fa-dollar-sign"></i>
                <span>Mark as Sold</span>
              </button>
              <button @click="updateStatus('available')" class="action-card bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100">
                <i class="fas fa-times"></i>
                <span>Remove Listing</span>
              </button>
            </div>

            <!-- Rented Actions -->
            <div v-if="property.status === 'rent'" class="space-y-2">
              <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Rental Management</h4>
              <button @click="goToRentPayments()" class="action-card bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                <i class="fas fa-receipt"></i>
                <span>View Payments</span>
              </button>
              <button @click="updateStatus('available')" class="action-card bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100">
                <i class="fas fa-door-open"></i>
                <span>End Rental</span>
              </button>
            </div>

            <!-- Sold Actions -->
            <div v-if="property.status === 'sale'" class="space-y-2">
              <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Sales Management</h4>
              <button @click="goToSalesPayments()" class="action-card bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100">
                <i class="fas fa-dollar-sign"></i>
                <span>View Payments</span>
              </button>
              <button @click="updateStatus('available')" class="action-card bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100">
                <i class="fas fa-undo"></i>
                <span>Reset Status</span>
              </button>
            </div>

            <!-- Maintenance Actions -->
            <div v-if="property.status === 'under_maintenance'" class="space-y-2">
              <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Maintenance</h4>
              <button @click="updateStatus('available')" class="action-card bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                <i class="fas fa-check-circle"></i>
                <span>Mark Fixed</span>
              </button>
            </div>

            <!-- Universal Actions -->
            <div class="space-y-2">
              <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Maintenance</h4>
              <button v-if="property.status !== 'under_maintenance'" @click="updateStatus('under_maintenance')" 
                      class="action-card bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
                <i class="fas fa-tools"></i>
                <span>Need Maintenance</span>
              </button>
              <button @click="viewMaintenanceHistory()" class="action-card bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100">
                <i class="fas fa-history"></i>
                <span>View History</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <p class="text-xs text-gray-400 font-medium mb-1">Monthly Rent</p>
          <p class="text-lg font-bold text-primary">{{ property.rent || '—' }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <p class="text-xs text-gray-400 font-medium mb-1">Selling Price</p>
          <p class="text-lg font-bold text-orange-600">{{ property.price?.toLocaleString() || '—' }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <p class="text-xs text-gray-400 font-medium mb-1">Type</p>
          <p class="text-base font-bold text-gray-700 capitalize">{{ property?.property_type?.name || '—' }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4">
          <p class="text-xs text-gray-400 font-medium mb-1">Rooms</p>
          <p class="text-base font-bold text-gray-700">{{ property.bed_rooms || 0 }} BD · {{ property.bath_rooms || 0 }} BA</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <!-- Left: Details + Amenities + Maintenance -->
        <div class="lg:col-span-2 space-y-5">

          <!-- Specifications -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h2 class="text-sm font-semibold text-gray-700">Specifications</h2>
            </div>
            <div class="p-5 grid grid-cols-2 gap-x-8 gap-y-3">
              <div class="flex justify-between border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400">City</span>
                <span class="text-xs font-semibold text-gray-700">{{ property.city || '—' }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400">State</span>
                <span class="text-xs font-semibold text-gray-700">{{ property.state || '—' }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400">ZIP</span>
                <span class="text-xs font-semibold text-gray-700">{{ property.zip_code || '—' }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400">Area</span>
                <span class="text-xs font-semibold text-gray-700">{{ property.area || '—' }} sqft</span>
              </div>
              <div class="flex justify-between border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400">Block #</span>
                <span class="text-xs font-semibold text-gray-700">{{ property.block_number || '—' }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400">Floor #</span>
                <span class="text-xs font-semibold text-gray-700">{{ property.floor_number || '—' }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400">House #</span>
                <span class="text-xs font-semibold text-gray-700">{{ property.house_number || '—' }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400">Address</span>
                <span class="text-xs font-semibold text-gray-700 text-right max-w-[140px]">{{ property.address || '—' }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400">Created</span>
                <span class="text-xs font-semibold text-gray-700">{{ property.created_at || '—' }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400">Updated</span>
                <span class="text-xs font-semibold text-gray-700">{{ property.updated_at || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Amenities -->
          <div v-if="amenities.length" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h2 class="text-sm font-semibold text-gray-700">Amenities</h2>
            </div>
            <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div v-for="(item, i) in amenities" :key="i"
                class="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                <span class="text-xs text-gray-600 font-medium">{{ item.amenity }}</span>
                <span class="text-xs text-primary font-semibold">{{ item.value }}</span>
              </div>
            </div>
          </div>

          <!-- Maintenance -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden maintenance-history">
            <div class="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h2 class="text-sm font-semibold text-gray-700">Maintenance History</h2>
            </div>
            <div class="p-2">
              <Maintenance :visible="true" :propertyId="property.id" @close="() => {}" />
            </div>
          </div>

          <!-- Property Rentals -->
          <div v-if="property.status === 'rent' || propertyRentals.length > 0" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h2 class="text-sm font-semibold text-gray-700">Property Rentals</h2>
              <span class="text-xs text-gray-500">{{ propertyRentals.length }} rental(s)</span>
            </div>
            <div class="p-5">
              <div v-if="propertyRentals.length > 0" class="space-y-3">
                <div v-for="rental in propertyRentals" :key="rental.id" 
                     class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                        {{ (rental.tenant?.first_name || 'T').charAt(0) }}
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-gray-800">{{ rental.tenant?.first_name }} {{ rental.tenant?.last_name }}</p>
                        <p class="text-xs text-gray-500">{{ rental.tenant?.email }}</p>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span class="text-gray-400">Monthly Rent:</span>
                        <span class="font-semibold text-gray-700 ml-1">${{ rental.monthly_rent || '—' }}</span>
                      </div>
                      <div>
                        <span class="text-gray-400">Start Date:</span>
                        <span class="font-semibold text-gray-700 ml-1">{{ formatDate(rental.start_date) }}</span>
                      </div>
                      <div>
                        <span class="text-gray-400">End Date:</span>
                        <span class="font-semibold text-gray-700 ml-1">{{ formatDate(rental.end_date) }}</span>
                      </div>
                      <div>
                        <span class="text-gray-400">Status:</span>
                        <span class="ml-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                              :class="rental.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'">
                          {{ rental.is_active ? 'Active' : 'Inactive' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button @click="goToRentalPayments(rental.id)" 
                            class="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold transition">
                      <i class="fas fa-receipt mr-1"></i>Payments
                    </button>
                    <button @click="viewRentalDetail(rental.id)"
                            class="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white rounded-lg text-xs font-semibold transition">
                      <i class="fas fa-eye mr-1"></i>View
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 text-sm text-gray-400">
                <i class="fas fa-file-contract text-2xl mb-2 block opacity-30"></i>
                No rental records found for this property
              </div>
            </div>
          </div>

        </div>

        <!-- Right: Gallery -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-700">Photos</h2>
            <button @click="addPictureVisible = true"
              class="text-xs font-semibold text-primary border border-primary/30 bg-primary/5 px-3 py-1 rounded-lg hover:bg-primary/10 transition">
              <i class="fas fa-plus text-[10px] mr-1"></i> Add
            </button>
          </div>

          <div v-if="property.property_pictures?.length" class="space-y-3">
            <div v-for="pic in visiblePictures" :key="pic.id"
              class="group rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm">
              <div class="aspect-video overflow-hidden relative">
                <img :src="pic.property_image" :alt="pic.description"
                  class="object-cover w-full h-full cursor-pointer transition-transform duration-300 group-hover:scale-105"
                  @click="previewImage(pic.property_image)" />
                <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button @click.stop="openUpdatePicture(pic)"
                    class="w-7 h-7 bg-white rounded-full text-blue-600 text-xs shadow flex items-center justify-center hover:bg-blue-600 hover:text-white transition">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button @click.stop="askDeletePicture(pic)"
                    class="w-7 h-7 bg-white rounded-full text-red-600 text-xs shadow flex items-center justify-center hover:bg-red-600 hover:text-white transition">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <p class="text-xs text-gray-500 px-3 py-2 truncate">{{ pic.description }}</p>
            </div>

            <button v-if="remainingPicturesCount > 0 && !showAllPictures"
              @click="showAllPictures = true"
              class="w-full py-3 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 font-semibold hover:border-primary hover:text-primary transition">
              +{{ remainingPicturesCount }} more
            </button>
          </div>

          <div v-else class="rounded-xl border border-dashed border-gray-200 p-10 text-center bg-white">
            <i class="fas fa-images text-gray-200 text-3xl mb-2 block"></i>
            <p class="text-xs text-gray-400">No photos yet</p>
          </div>
        </div>

      </div>
    </div>

    <div v-else-if="!loading" class="text-center py-20 text-sm text-gray-400 italic">Property not found.</div>

    <!-- Modals -->
    <AddPictureModal v-if="addPictureVisible && property" :visible="addPictureVisible"
      :propertyId="property.id" :propertyName="property.name"
      @close="addPictureVisible = false" @refresh="fetchProperty" />
    <UpdatePictureModal v-if="updatePictureVisible && property" :visible="updatePictureVisible"
      :picture="pictureToUpdate" :propertyId="property.id"
      @close="updatePictureVisible = false" @refresh="fetchProperty" />
    <ConfirmModal v-if="confirmDeleteVisible" :visible="confirmDeleteVisible"
      title="Delete Photo" message="Delete this photo?"
      @confirm="confirmDeletePicture" @cancel="confirmDeleteVisible = false" />
    <UpdateProperty v-if="updateVisible" :visible="updateVisible" :property="propertyToEdit"
      @close="updateVisible = false" @refresh="fetchProperty" />
    <AddRent v-if="addRentVisible" :visible="addRentVisible" :propertyId="$route.params.id"
      @close="addRentVisible = false" @refresh="fetchProperty " />
    <!-- Image preview lightbox -->
    <div v-if="imagePreviewVisible"
      class="fixed inset-0 bg-black/90 flex items-center justify-center z-[100]"
      @click="imagePreviewVisible = false">
      <img :src="imageToPreview" class="max-h-[88vh] max-w-[92vw] rounded-xl shadow-2xl" @click.stop />
      <button @click="imagePreviewVisible = false"
        class="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import AddPictureModal from "@/views/closed/proporty/AddPropertyPicture.vue";
import UpdatePictureModal from "@/views/closed/proporty/UpdatePropertyPicture.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import UpdateProperty from "@/views/closed/proporty/update.vue";
import Toast from "@/components/Toast.vue";
import Maintenance from "@/views/closed/maintenanceRequests/view1.vue";
import Loading from "@/components/Loading.vue";

import AddRent from "@/views/closed/rent/add.vue";

export default {
  name: "PropertyDetail",
  components: { AddPictureModal, UpdatePictureModal, UpdateProperty, ConfirmModal, Toast, Maintenance, Loading,AddRent },
  data() {
    return {
      addRentVisible: false,
      property: null, 
      loading: false,
      propertyRentals: [], // Add rental data
      addPictureVisible: false, updatePictureVisible: false, pictureToUpdate: null,
      confirmDeleteVisible: false, pictureToDelete: null,
      showAllPictures: false, imagePreviewVisible: false, imageToPreview: null,
      updateVisible: false, propertyToEdit: null,
      activeWorkflow: 'rent', // Default to rental workflow
      statusSteps: [
        { status: 'available', label: 'Available', icon: 'fas fa-home' },
        { status: 'for_rent', label: 'For Rent', icon: 'fas fa-list' },
        { status: 'rent', label: 'Rented', icon: 'fas fa-handshake' },
      ],
      salesSteps: [
        { status: 'available', label: 'Available', icon: 'fas fa-home' },
        { status: 'for_sale', label: 'For Sale', icon: 'fas fa-tag' },
        { status: 'sale', label: 'Sold', icon: 'fas fa-dollar-sign' },
      ],
    };
  },
  computed: {
    amenities() {
      if (!this.property?.description) return [];
      return this.property.description.split(",").map(pair => {
        const [k, v] = pair.split(":");
        return { amenity: k?.trim() || "", value: v?.replace(/"/g, "").trim() || "" };
      }).filter(a => a.amenity);
    },
    visiblePictures() {
      const pics = this.property?.property_pictures || [];
      return this.showAllPictures ? pics : pics.slice(0, 3);
    },
    remainingPicturesCount() {
      return Math.max(0, (this.property?.property_pictures?.length || 0) - 3);
    },
  },
  mounted() { 
    this.fetchProperty().then(() => {
      // Auto-select appropriate workflow based on property status
      if (this.property && this.isInSalesFlow(this.property.status)) {
        this.activeWorkflow = 'sale';
      }
      // Fetch property rentals after property is loaded
      this.fetchPropertyRentals();
    }); 
  },
  methods: {
    editProperty(p) { this.propertyToEdit = p; this.updateVisible = true; },
    async fetchProperty() {
      this.loading = true;
      try {
        const res = await this.$apiGet(`/get_property/${this.$route.params.id}`);
        this.property = res.data || res;
      } catch (e) { console.error(e); } finally { this.loading = false; }
    },
    openUpdatePicture(pic) { this.pictureToUpdate = pic; this.updatePictureVisible = true; },
    askDeletePicture(pic) { this.pictureToDelete = pic; this.confirmDeleteVisible = true; },
    async confirmDeletePicture() {
      this.confirmDeleteVisible = false;
      if (!this.pictureToDelete) return;
      try {
        await this.$apiDelete(`/delete_property_picture/${this.pictureToDelete.id}`);
        this.$root.$refs.toast.showToast("Photo deleted", "success");
        this.fetchProperty();
      } catch (e) { this.$root.$refs.toast.showToast("Failed to delete", "error"); }
      this.pictureToDelete = null;
    },
    previewImage(url) { this.imageToPreview = url; this.imagePreviewVisible = true; },
    
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

    getProgressWidth() {
      const statusOrder = ['available', 'for_rent', 'rent'];
      const currentIndex = statusOrder.indexOf(this.property?.status);
      if (currentIndex === -1) return 0;
      return (currentIndex / (statusOrder.length - 1)) * 100;
    },

    getRentProgressWidth() {
      const statusOrder = ['available', 'for_rent', 'rent'];
      const currentIndex = statusOrder.indexOf(this.property?.status);
      if (currentIndex === -1 || !this.isInRentFlow(this.property?.status)) return 0;
      return (currentIndex / (statusOrder.length - 1)) * 100;
    },

    getSalesProgressWidth() {
      const statusOrder = ['available', 'for_sale', 'sale'];
      const currentIndex = statusOrder.indexOf(this.property?.status);
      if (currentIndex === -1 || !this.isInSalesFlow(this.property?.status)) return 0;
      return (currentIndex / (statusOrder.length - 1)) * 100;
    },

    getRentStepClasses(stepStatus, currentStatus) {
      const statusOrder = ['available', 'for_rent', 'rent'];
      const stepIndex = statusOrder.indexOf(stepStatus);
      const currentIndex = statusOrder.indexOf(currentStatus);
      
      if (this.isInRentFlow(currentStatus) && stepIndex <= currentIndex) {
        return 'bg-blue-500 text-white';
      } else {
        return 'bg-gray-200 text-gray-500';
      }
    },

    getSalesStepClasses(stepStatus, currentStatus) {
      const statusOrder = ['available', 'for_sale', 'sale'];
      const stepIndex = statusOrder.indexOf(stepStatus);
      const currentIndex = statusOrder.indexOf(currentStatus);
      
      if (this.isInSalesFlow(currentStatus) && stepIndex <= currentIndex) {
        return 'bg-orange-500 text-white';
      } else {
        return 'bg-gray-200 text-gray-500';
      }
    },

    isInRentFlow(status) {
      return ['available', 'for_rent', 'rent'].includes(status);
    },

    isInSalesFlow(status) {
      return ['available', 'for_sale', 'sale'].includes(status);
    },

    getStepClasses(stepStatus, currentStatus) {
      const statusOrder = ['available', 'for_rent', 'rent'];
      const stepIndex = statusOrder.indexOf(stepStatus);
      const currentIndex = statusOrder.indexOf(currentStatus);
      
      if (stepIndex <= currentIndex) {
        return 'bg-blue-500 text-white';
      } else {
        return 'bg-gray-200 text-gray-500';
      }
    },

    async updateStatus(newStatus) {
      try {
        const res = await this.$apiPatch(`/update_property`, this.property.id, {
          id: this.property.id,
          status: newStatus
        });
        if (res) {
          this.property.status = newStatus;
          this.$root.$refs.toast.showToast(`Property status updated to ${this.getStatusLabel(newStatus)}`, "success");
        }
      } catch (error) {
        console.error('Status update failed:', error);
        this.$root.$refs.toast.showToast("Failed to update property status", "error");
      }
    },

    goToRentPayments() {
      this.$router.push(`/rent-payments?property_id=${this.property.id}`);
    },

    goToSalesPayments() {
      this.$router.push(`/sales-payments?property_id=${this.property.id}`);
    },

    viewMaintenanceHistory() {
      // Scroll to maintenance section
      const maintenanceElement = document.querySelector('.maintenance-history');
      if (maintenanceElement) {
        maintenanceElement.scrollIntoView({ behavior: 'smooth' });
      }
    },

    async fetchPropertyRentals() {
      if (!this.property?.id) return;
      try {
        const response = await this.$apiGet(`/get_property_rents`, { property_id: this.property.id });
        this.propertyRentals = response.rents || response.data || [];
      } catch (error) {
        console.error('Failed to fetch property rentals:', error);
        this.propertyRentals = [];
      }
    },

    goToRentalPayments(rentalId) {
      this.$router.push(`/rent-payments/${rentalId}`);
    },

    viewRentalDetail(rentalId) {
      this.$router.push({ name: 'rent-detail', params: { id: rentalId } });
    },

    formatDate(dateString) {
      if (!dateString) return '—';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    },
  },
};
</script>

<style scoped>
.action-card {
  @apply w-full flex items-center gap-3 px-4 py-3 border rounded-lg transition-colors cursor-pointer;
}

.action-card i {
  @apply text-lg;
}

.action-card span {
  @apply text-sm font-semibold;
}

.maintenance-history {
  scroll-margin-top: 2rem;
}
</style>
