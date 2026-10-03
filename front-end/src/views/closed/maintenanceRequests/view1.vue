<template>
  <div class="pms-brand-page p-6 bg-gray-100 min-h-screen text-sm text-slate-800">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading maintenance requests..." />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Maintenance Requests</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Facility & Operations Management</p>
      </div>
      <button
        v-if="!propertyId"
        @click="visible = true"
        class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
      >
        <i class="fas fa-plus text-xs"></i> New Request
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white border border-gray-100 rounded-lg p-4 mb-4">
      <div class="flex flex-wrap gap-3 items-end">
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</label>
          <input v-model="startDate" type="date" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
        </div>
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</label>
          <input v-model="endDate" type="date" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
        </div>
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter By</label>
          <select v-model="filter_by" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
            <option value="" disabled>Select...</option>
            <option value="requested_at">Requested At</option>
            <option value="resolved_at">Resolved At</option>
          </select>
        </div>
        <div class="flex items-end gap-2">
          <button
            @click="applyDateFilter()"
            :disabled="!filter_by"
            class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40 transition"
          >
            <i class="fas fa-filter text-xs"></i> Apply
          </button>
        </div>
        <div class="ml-auto flex items-end gap-2 text-xs text-gray-500">
          <label class="font-semibold">Show</label>
          <select v-model.number="pageSize" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
            <option v-for="size in [5, 10, 50, 100]" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden hidden md:block">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('description')">Description</th>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('status')">Status</th>
              <th class="px-4 py-3 text-left">Timeline</th>
              <th class="px-4 py-3 text-left">Property & User</th>
              <th class="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="maint in paginatedData" :key="maint.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 max-w-xs truncate font-medium text-gray-700" :title="maint.description">{{ maint.description }}</td>
              <td class="px-4 py-3">
                <span
                  :class="maint.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'"
                  class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                >
                  {{ maint.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="text-xs text-gray-500">REQ: {{ formatDate(maint.requested_at) }}</div>
                <div v-if="maint.resolved_at" class="text-xs text-green-600">RES: {{ formatDate(maint.resolved_at) }}</div>
                <div v-else class="text-xs text-amber-500 italic">Awaiting resolution</div>
              </td>
              <td class="px-4 py-3">
                <router-link v-if="maint.property_id" :to="`/dashboard/properties/${maint.property_id.id}`" class="text-xs font-semibold text-blue-600 hover:underline block">
                  {{ maint.property_id.name }}
                </router-link>
                <router-link v-if="maint.user_id" :to="`/user_detail/${maint.user_id.id}`" class="text-xs text-gray-500 hover:underline block mt-0.5">
                  {{ fullName(maint.user_id) }}
                </router-link>
              </td>
              <td class="px-4 py-3 text-center">
                <button
                  v-if="maint.status === 'pending'"
                  @click="confirm = true; selectedId = maint.id"
                  class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition mx-auto"
                >
                  <i class="fas fa-check text-xs"></i> Resolve
                </button>
                <span v-else class="text-green-500 text-xs font-semibold">Resolved</span>
              </td>
            </tr>
            <tr v-if="filteredData.length === 0">
              <td colspan="5" class="px-4 py-10 text-center text-sm text-gray-400 italic">No maintenance requests found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-3">
      <div v-for="maint in paginatedData" :key="maint.id" class="bg-white border border-gray-100 rounded-lg p-4">
        <div class="flex justify-between items-start mb-2">
          <p class="font-semibold text-gray-800 text-sm max-w-[70%]">{{ maint.description }}</p>
          <span
            :class="maint.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'"
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase shrink-0"
          >
            {{ maint.status }}
          </span>
        </div>
        <div class="text-xs text-gray-500 mb-1">{{ maint.property_id ? maint.property_id.name : 'N/A' }}</div>
        <div class="text-xs text-gray-400 mb-3">REQ: {{ formatDate(maint.requested_at) }}</div>
        <button
          v-if="maint.status === 'pending'"
          @click="confirm = true; selectedId = maint.id"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition"
        >
          <i class="fas fa-check text-xs"></i> Resolve
        </button>
      </div>
      <div v-if="filteredData.length === 0" class="bg-white rounded-lg border border-gray-100 p-10 text-center text-sm text-gray-400 italic">
        No requests found.
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredData.length > 0" class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of <span class="font-semibold text-gray-700">{{ totalPages }}</span></span>
      <div class="flex items-center gap-2">
        <button @click="prevPage" :disabled="currentPage === 1" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <i class="fas fa-chevron-left text-[10px]"></i> Previous
        </button>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <!-- Resolve Confirm -->
    <div v-if="confirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
        <p class="text-gray-700 font-semibold mb-5">Are you sure this maintenance issue has been resolved?</p>
        <div class="flex justify-center gap-3">
          <button @click="confirm = false" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button @click="resolve()" class="flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition">
            <i class="fas fa-check text-xs"></i> Yes, Resolve
          </button>
        </div>
      </div>
    </div>

    <MaintenanceRequestAdd v-if="visible" :visible="visible" @close="visible = false; fetchMaintenance()" />
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import MaintenanceRequestAdd from "@/views/closed/maintenanceRequests/add.vue";
import Loading from "@/components/Loading.vue";

export default {
  name: "MaintenanceRequestView",
  components: { Toast, MaintenanceRequestAdd, Loading },
  props: { propertyId: Number },
  data() {
    return {
      maintenance: [],
      filter_by: "",
      startDate: "",
      endDate: "",
      currentPage: 1,
      pageSize: 5,
      sortKey: "requested_at",
      sortAsc: true,
      visible: false,
      confirm: false,
      selectedId: "",
      loading: false,
    };
  },
  computed: {
    filteredData() {
      return [...this.maintenance].sort((a, b) => {
        let res = 0;
        if (a[this.sortKey] < b[this.sortKey]) res = -1;
        if (a[this.sortKey] > b[this.sortKey]) res = 1;
        return this.sortAsc ? res : -res;
      });
    },
    totalPages() { return Math.ceil(this.filteredData.length / this.pageSize) || 1; },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredData.slice(start, start + this.pageSize);
    },
  },
  mounted() { this.fetchMaintenance(); },
  methods: {
    buildRoleParams(params = {}) {
      const isSuperUser = localStorage.getItem("is_superuser") === "1" || localStorage.getItem("is_superuser") === "true";
      const groups = JSON.parse(localStorage.getItem("groups") || "[]");
      const email = localStorage.getItem("email");
      if (!isSuperUser) {
        if (groups.includes("manager")) params = { ...params, "property_id__property_zone_id__manager_id__email": email };
        else if (groups.includes("owner")) params = { ...params, "property_id__property_zone_id__owner_id__email": email };
        else if (groups.includes("staff")) params = { ...params, "staff_id__email": email };
      }
      if (this.propertyId) params = { ...params, "property_id__id": this.propertyId };
      return params;
    },
    async fetchMaintenance() {
      this.loading = true;
      try {
        const params = this.buildRoleParams();
        const response = await this.$apiGet("get_maintenance_requests", params);
        this.maintenance = response.data || [];
      } catch (err) {
        console.error(err);
        this.maintenance = [];
      } finally { this.loading = false; }
    },
    async applyDateFilter() {
      try {
        let params = this.buildRoleParams();
        if (this.filter_by === "requested_at") params = { ...params, requested_at__gt: this.startDate, requested_at__lt: this.endDate };
        else if (this.filter_by === "resolved_at") params = { ...params, resolved_at__gt: this.startDate, resolved_at__lt: this.endDate };
        const res = await this.$apiGet("get_maintenance_requests", params);
        this.maintenance = res.data;
      } catch (error) { console.error(error); }
    },
    async resolve() {
      try {
        await this.$apiPost("/resolve_maintenance_request", { id: this.selectedId });
        this.confirm = false;
        this.fetchMaintenance();
      } catch (error) { console.error(error); }
    },
    sortBy(field) { this.sortKey === field ? (this.sortAsc = !this.sortAsc) : ((this.sortKey = field), (this.sortAsc = true)); },
    prevPage() { if (this.currentPage > 1) this.currentPage--; },
    nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; },
    fullName(user) { return [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(" "); },
    formatDate(dateStr) { return dateStr ? new Date(dateStr).toLocaleDateString() : ""; },
  },
};
</script>
