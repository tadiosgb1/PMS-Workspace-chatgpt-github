<template>
  <div class="pms-brand-page min-h-screen bg-gray-100 pb-10">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading notification detail..." />

    <!-- Top Bar -->
    <div class="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
      <button @click="$router.back()" class="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition uppercase tracking-wider">
        <i class="fas fa-arrow-left text-[10px]"></i> Back
      </button>
      <button 
        v-if="!notification.is_read" 
        @click="markAsRead(notification.id)" 
        class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition"
      >
        <i class="fas fa-check-double text-xs"></i> Mark as Read
      </button>
    </div>

    <div v-if="notification" class="max-w-5xl mx-auto px-4 pt-6 space-y-5">

      <!-- Notification Title -->
      <div>
        <h1 class="text-xl font-black text-gray-800">Notification Details</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Activity Center / Notification</p>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Message Content -->
        <div class="lg:col-span-2 bg-white border border-gray-100 rounded-lg p-5">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Message Content</p>
          <div class="space-y-4 text-sm">
            <div>
              <p class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Notification Message</p>
              <p class="font-medium text-gray-700">{{ notification.message || 'N/A' }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Type</p>
                <span class="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase">
                  {{ notification.notification_type || 'N/A' }}
                </span>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Status</p>
                <span 
                  :class="notification.is_read ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'"
                  class="px-2 py-1 rounded-full text-xs font-semibold uppercase"
                >
                  {{ notification.is_read ? "Read" : "Unread" }}
                </span>
              </div>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Created</p>
              <p class="font-medium text-gray-700">{{ formatDate(notification.created_at) }}</p>
            </div>
            <div v-if="notification.read_at">
              <p class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Read At</p>
              <p class="font-medium text-gray-700">{{ formatDate(notification.read_at) }}</p>
            </div>
          </div>
        </div>

        <!-- User Information -->
        <div class="bg-white border border-gray-100 rounded-lg p-5">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Recipient</p>
          <div class="space-y-4">
            <div v-if="notification.user_id" class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-xs font-semibold">
                {{ notification.user_id.first_name?.[0] || '' }}{{ notification.user_id.last_name?.[0] || '' }}
              </div>
              <div>
                <p class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">User</p>
                <p class="font-black text-gray-800">{{ notification.user_id.first_name || '' }} {{ notification.user_id.last_name || '' }}</p>
              </div>
            </div>
            <div v-if="notification.user_id">
              <p class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">User ID</p>
              <p class="font-black text-gray-800">#{{ notification.user_id.id || notification.user_id }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Resources -->
      <div v-if="hasRelatedResources" class="bg-white border border-gray-100 rounded-lg p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Related Resources</p>
        <div class="flex flex-wrap gap-3">
          <router-link 
            v-if="notification.maintenance_request_id" 
            :to="`/maintenance/${notification.maintenance_request_id}`" 
            class="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg border border-yellow-100 transition text-xs font-semibold"
          >
            <i class="fas fa-tools"></i>
            Maintenance Request #{{ notification.maintenance_request_id }}
          </router-link>
          <router-link 
            v-if="notification.payment_id" 
            :to="`/payments/${notification.payment_id}`" 
            class="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg border border-purple-100 transition text-xs font-semibold"
          >
            <i class="fas fa-credit-card"></i>
            Payment #{{ notification.payment_id }}
          </router-link>
          <router-link 
            v-if="notification.rent_id" 
            :to="`/rents/${notification.rent_id}`" 
            class="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg border border-orange-100 transition text-xs font-semibold"
          >
            <i class="fas fa-home"></i>
            Rent Agreement #{{ notification.rent_id }}
          </router-link>
          <router-link 
            v-if="notification.user_id" 
            :to="`/users/${notification.user_id.id || notification.user_id}`" 
            class="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg border border-blue-100 transition text-xs font-semibold"
          >
            <i class="fas fa-user-circle"></i>
            User Profile
          </router-link>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-if="!notification && !loading" class="flex flex-col items-center justify-center mt-20 text-gray-400">
      <p class="text-sm font-semibold">Notification not found.</p>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";

export default {
  name: "NotificationDetail",
  components: { Toast, Loading },
  data() {
    return {
      notification: {},
      loading: false,
    };
  },
  computed: {
    hasRelatedResources() {
      return this.notification.maintenance_request_id || 
             this.notification.payment_id || 
             this.notification.rent_id || 
             this.notification.user_id;
    },
  },
  mounted() {
    this.fetchNotification();
  },
  methods: {
    async fetchNotification() {
      this.loading = true;
      try {
        const id = this.$route.params.id;
        const res = await this.$apiGet(`/get_notification/${id}`);
        this.notification = res || {};
      } catch (error) {
        console.error("Failed to fetch notification:", error);
        this.notification = {};
      } finally {
        this.loading = false;
      }
    },
    async markAsRead(id) {
      try {
        const payload = { 
          is_read: true,
          id: id,
          user: localStorage.getItem('userId')
        };
        const res = await this.$apiPost(`/post_notification_user`, payload);
        if (res) {
          this.notification.is_read = true;
          this.notification.read_at = new Date().toISOString();
          this.$root.$refs.toast.showToast("Successfully marked as read", "success");
        }
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    },
    formatDate(dateString) {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleString();
    },
  },
};
</script>
