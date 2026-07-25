<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button
            @click="$router.go(-1)"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <i class="fas fa-arrow-left"></i>
            <span class="font-medium">Back</span>
          </button>
          <div class="h-6 w-px bg-gray-200"></div>
          <div>
            <h1 class="text-xl font-black text-gray-800 tracking-tight">Rental Details</h1>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-sm p-12 text-center">
        <div class="animate-spin w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full mx-auto mb-4"></div>
        <p class="text-gray-500">Loading rental details...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-white rounded-2xl shadow-sm p-12 text-center">
        <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Content -->
      <div v-else-if="rental" class="bg-white  shadow-sm border border-gray-100 overflow-hidden">
        
        <!-- Rental Information -->
        <div class="p-8 border-b border-gray-100">
          <h2 class="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-3">
            <i class="fas fa-info-circle text-gray-400"></i>
            Rental Information
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Guest Name</p>
              <p class="text-lg font-semibold text-gray-800">{{ rental.guest_name }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Guest Email</p>
              <p class="font-medium">{{ rental.guest_email }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Guest Phone</p>
              <p class="font-medium">{{ rental.guest_phone }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Rental Cycle</p>
              <p class="font-semibold capitalize">{{ rental.cycle }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Start Date</p>
              <p class="font-medium">{{ formatDate(rental.start_date) }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Next Due Date</p>
              <p class="font-medium">{{ formatDate(rental.next_due_date) }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <span
                class="inline-block px-4 py-1 rounded-2xl text-sm font-semibold"
                :class="rental.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'"
              >
                {{ rental.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Created At</p>
              <p class="font-medium">{{ formatDate(rental.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Related Links -->
        <div class="p-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-3">
            <i class="fas fa-link text-gray-400"></i>
            Related Links
          </h2>

          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="goToUserDetail(rental.user?.id)"
              class="flex-1 flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 px-6 py-4 rounded-2xl transition-all group"
            >
              <i class="fas fa-user text-xl text-blue-500 group-hover:scale-110 transition-transform"></i>
              <div class="text-left">
                <p class="font-semibold text-gray-700">View User</p>
                <p class="text-xs text-gray-500">Account Owner</p>
              </div>
            </button>

            <button
              @click="goToSpaceDetail(rental.space?.id)"
              class="flex-1 flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 px-6 py-4 rounded-2xl transition-all group"
            >
              <i class="fas fa-building text-xl text-blue-500 group-hover:scale-110 transition-transform"></i>
              <div class="text-left">
                <p class="font-semibold text-gray-700">View Workspace</p>
                <p class="text-xs text-gray-500">Assigned Space</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "WorkspaceRentalDetail",
  data() {
    return {
      rental: null,
      loading: true,
      error: null,
    };
  },
  mounted() {
    this.fetchRental();
  },
  methods: {
    async fetchRental() {
      this.loading = true;
      this.error = null;
      try {
        const id = this.$route.params.id;
        const res = await this.$apiGetById("get_workspace_rental", id);
        this.rental = res;
      } catch (err) {
        console.error(err);
        this.error = "Failed to load rental details. Please try again.";
      } finally {
        this.loading = false;
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    goToUserDetail(id) {
      if (id) this.$router.push(`/user_detail/${id}`);
    },

    goToSpaceDetail(id) {
      if (id) this.$router.push(`/co-work-detail/${id}`);
    },
  },
};
</script>