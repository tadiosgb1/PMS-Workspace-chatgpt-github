<template>
  <div class="pms-brand-page" class="p-6 bg-gray-100 min-h-screen text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading Notifications..." />

    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Notifications Center</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Real-time Activity Logs</p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3 bg-white p-4 rounded-lg border border-gray-100">
      <div class="relative flex-1 max-w-sm">
        <input 
          v-model="searchTerm"
          type="search" 
          placeholder="Search notifications..." 
          class="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" 
        />
      </div>

      <div class="flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2 text-gray-500 ml-auto lg:ml-0">
          <label class="font-semibold">Show</label>
          <select v-model="pageSize" @change="fetchNotifications()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition cursor-pointer">
            <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
          </select>
          <span class="text-gray-400">Total: <span class="font-semibold text-gray-600">{{ notifications.length }}</span></span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('is_read')">
                Status <SortIcon field="is_read" :sort-key="sortKey" :sort-asc="sortAsc" />
              </th>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('message')">
                Message <SortIcon field="message" :sort-key="sortKey" :sort-asc="sortAsc" />
              </th>
              <th class="px-4 py-3 text-left">Type</th>
              <th class="px-4 py-3 text-left">Recipient</th>
              <th class="px-4 py-3 text-left">References</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="notif in filteredAndSortedNotifications" :key="notif.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <span 
                  :class="notif.is_read ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'"
                  class="px-2 py-1 rounded-full text-xs font-semibold uppercase"
                >
                  {{ notif.is_read ? "Read" : "Unread" }}
                </span>
              </td>
              <td class="px-4 py-3">
                <p class="font-semibold text-gray-700 max-w-xs truncate">
                  {{ notif.message }}
                </p>
                <p class="text-xs text-gray-400 mt-1">{{ formatDate(notif.created_at) }}</p>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase">
                  {{ notif.notification_type }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-xs font-semibold">
                    {{ notif.user_id.first_name[0] }}{{ notif.user_id.last_name[0] }}
                  </div>
                  <span class="text-xs font-semibold text-gray-600">
                    {{ notif.user_id.first_name }} {{ notif.user_id.last_name }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-1">
                  <span v-if="notif.maintenance_request_id" title="Maintenance" class="h-7 w-7 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center text-xs border border-yellow-100">
                    <i class="fas fa-tools"></i>
                  </span>
                  <span v-if="notif.payment_id" title="Payment" class="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs border border-purple-100">
                    <i class="fas fa-credit-card"></i>
                  </span>
                  <span v-if="notif.rent_id" title="Rent" class="h-7 w-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xs border border-orange-100">
                    <i class="fas fa-home"></i>
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button v-if="!notif.is_read" @click="markAsRead(notif.id)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition text-xs" title="Mark Read">
                    <i class="fas fa-check-double"></i>
                  </button>
                  <button @click="goToNotification(notif.id)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white transition text-xs" title="View">
                    <i class="fas fa-eye"></i>
                  </button>
                  <router-link v-if="notif.user_id" :to="`/users/${notif.user_id.id || notif.user_id}`" class="h-7 w-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition text-xs" title="User">
                    <i class="fas fa-user-circle"></i>
                  </router-link>
                  <router-link v-if="notif.maintenance_request_id" :to="`/maintenance/${notif.maintenance_request_id}`" class="h-7 w-7 flex items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-600 hover:text-white transition text-xs" title="Maintenance">
                    <i class="fas fa-external-link-alt"></i>
                  </router-link>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAndSortedNotifications.length === 0 && !loading">
              <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-400 italic">No notifications found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of <span class="font-semibold text-gray-700">{{ totalPages }}</span></span>
      <div class="flex gap-2">
        <button :disabled="!previous" @click="fetchNotifications(previous)" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <button :disabled="!next" @click="fetchNotifications(next)" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
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
  name: "NotificationsView",
  components: { Toast, Loading, SortIcon },
  data() {
    return {
      notifications: [],
      searchTerm: "",
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
      pageSize: 10,
      pageSizes: [5, 10, 20, 50, 100],
      loading: false,
      sortKey: "created_at",
      sortAsc: false,
    };
  },
  computed: {
    filteredNotifications() {
      const term = this.searchTerm.toLowerCase();
      return this.notifications.filter(
        (n) =>
          n.message.toLowerCase().includes(term) ||
          n.notification_type.toLowerCase().includes(term) ||
          (n.is_read ? "read" : "unread").includes(term)
      );
    },
    filteredAndSortedNotifications() {
      return [...this.filteredNotifications].sort((a, b) => {
        let res = 0;
        if (a[this.sortKey] < b[this.sortKey]) res = -1;
        if (a[this.sortKey] > b[this.sortKey]) res = 1;
        return this.sortAsc ? res : -res;
      });
    },
  },
  mounted() {
    this.fetchNotifications();
  },
  methods: {
    goToNotification(id) {
    this.$router.push({ name: 'notificationDetail', params: { id } });
   },
    async fetchNotifications(customUrl = null) {
      this.loading=true;
      try {
        let params = {
          user_id__email:localStorage.getItem('email'),
          page_size: this.pageSize,
          page: this.currentPage };
          if(localStorage.getItem('is_superuser'=='true')){
         params = {
          page_size: this.pageSize,
          page: this.currentPage };
          }
        const url = customUrl || "get_notifications";
        console.log("params for notif",params);

        const res = await this.$apiGet(`/get_notifications`, params);

        this.notifications = res.data || [];
        this.currentPage = res.current_page || 1;
        this.totalPages = res.total_pages || 1;
        this.next = res.next;
        this.previous = res.previous;
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        this.notifications = [];
      }finally{
        this.loading=false;
      }
    },
   async markAsRead(id) {

    console.log("id",id);

      try {
        const payload = { is_read: true };
        const res = await this.$apiPatch(`/update_notification`, id, payload);
       
        this.$root.$refs.toast.showToast("Successfully marked as red", "success");
        
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    sortBy(field) {
      this.sortKey === field 
        ? (this.sortAsc = !this.sortAsc) 
        : ((this.sortKey = field), (this.sortAsc = true));
    },
  },
};
</script>
