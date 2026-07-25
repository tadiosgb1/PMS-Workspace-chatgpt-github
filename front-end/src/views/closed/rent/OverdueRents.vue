<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm text-slate-800">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading overdue rentals..." />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Overdue Rentals</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Tenants with past-due payments</p>
      </div>
      <div class="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
        <i class="fas fa-circle-exclamation text-red-500 text-sm"></i>
        <span class="text-xs font-semibold text-red-600">{{ count }} Overdue Record(s)</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4 bg-white p-4 rounded-lg border border-gray-100">
      <div class="relative flex-1 max-w-sm w-full">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
        <input v-model="searchTerm" @input="onSearch" type="search"
          placeholder="Search tenant, property..."
          class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white transition" />
      </div>
      <select v-model="pageSize" @change="fetchOverdue(1)"
        class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
        <option v-for="s in [10, 20, 50, 100]" :key="s" :value="s">{{ s }} / page</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left">Tenant</th>
              <th class="px-4 py-3 text-left">Property</th>
              <th class="px-4 py-3 text-left">Rent Amount</th>
              <th class="px-4 py-3 text-left">Due Date</th>
              <th class="px-4 py-3 text-center">Days Overdue</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50 transition-colors">
              <!-- Tenant -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {{ (item.tenant?.first_name || 'T').charAt(0) }}
                  </div>
                  <div>
                    <div class="font-semibold text-gray-800">
                      {{ item.tenant?.first_name }} {{ item.tenant?.last_name }}
                    </div>
                    <div class="text-xs text-gray-500">{{ item.tenant?.email || '—' }}</div>
                  </div>
                </div>
              </td>

              <!-- Property -->
              <td class="px-4 py-3">
                <div class="font-semibold text-gray-700">{{ item.property?.name || item.property_name || '—' }}</div>
                <div class="text-xs text-gray-400">{{ item.property?.city || '—' }}</div>
              </td>

              <!-- Rent Amount -->
              <td class="px-4 py-3">
                <div class="font-semibold text-gray-800">
                  {{ formatCurrency(item.monthly_rent || item.rent_amount) }}
                </div>
              </td>

              <!-- Due Date -->
              <td class="px-4 py-3 text-xs text-gray-600">
                <div class="font-semibold text-red-600">{{ formatDate(item.due_date || item.end_date) }}</div>
                <div class="text-gray-400">Started: {{ formatDate(item.start_date) }}</div>
              </td>

              <!-- Days Overdue -->
              <td class="px-4 py-3 text-center">
                <span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                  {{ calculateDaysOverdue(item.due_date || item.end_date) }} days
                </span>
              </td>

              <!-- Status -->
              <td class="px-4 py-3 text-center">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-red-100 text-red-700">
                  Overdue
                </span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button @click="viewRentDetail(item.id)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition text-xs"
                    title="View Rental">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click="viewPayments(item.id)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition text-xs"
                    title="View Payments">
                    <i class="fas fa-receipt"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredItems.length === 0 && !loading">
              <td colspan="7" class="px-4 py-12 text-center">
                <i class="fas fa-check-circle text-green-300 text-3xl mb-2 block"></i>
                <p class="text-sm text-gray-400 font-medium">No overdue rentals found</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">
        Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of
        <span class="font-semibold text-gray-700">{{ totalPages }}</span>
        — <span class="font-semibold text-gray-700">{{ count }}</span> total
      </span>
      <div class="flex items-center gap-2">
        <button :disabled="currentPage <= 1" @click="fetchOverdue(currentPage - 1)"
          class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <span class="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-bold min-w-[2rem] text-center">
          {{ currentPage }}
        </span>
        <button :disabled="currentPage >= totalPages" @click="fetchOverdue(currentPage + 1)"
          class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Loading from "@/components/Loading.vue";
import Toast from "@/components/Toast.vue";

export default {
  name: "OverdueRents",
  components: { Loading, Toast },
  data() {
    return {
      items: [],
      count: 0,
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
      searchTerm: "",
      loading: false,
    };
  },
  computed: {
    filteredItems() {
      if (!this.searchTerm.trim()) return this.items;
      const term = this.searchTerm.toLowerCase();
      return this.items.filter(item => {
        const tenantName = `${item.tenant?.first_name || ''} ${item.tenant?.last_name || ''}`.toLowerCase();
        const tenantEmail = (item.tenant?.email || '').toLowerCase();
        const propertyName = (item.property?.name || item.property_name || '').toLowerCase();
        return tenantName.includes(term) || tenantEmail.includes(term) || propertyName.includes(term);
      });
    },
  },
  mounted() {
    this.fetchOverdue();
  },
  methods: {
    async fetchOverdue(page = 1) {
      this.loading = true;
      this.currentPage = page;
      try {
        const response = await this.$apiGet("get_overdue_rents", {
          page: this.currentPage,
          page_size: this.pageSize,
        });
        // Handle both paginated and flat array responses
        this.items = response.data || response.rents || response.results || response || [];
        this.count = response.count || this.items.length || 0;
        this.totalPages = response.total_pages || Math.ceil(this.count / this.pageSize) || 1;
      } catch (error) {
        console.error("Failed to fetch overdue rents:", error);
        this.items = [];
        this.count = 0;
      } finally {
        this.loading = false;
      }
    },

    onSearch() {
      // Client-side filter — no need to re-fetch
    },

    calculateDaysOverdue(dueDateStr) {
      if (!dueDateStr) return 0;
      const due = new Date(dueDateStr);
      const today = new Date();
      const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    },

    formatDate(dateStr) {
      if (!dateStr) return '—';
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    },

    formatCurrency(amount) {
      if (!amount && amount !== 0) return '—';
      return '$' + parseFloat(amount).toLocaleString();
    },

    viewRentDetail(id) {
      this.$router.push({ name: 'rent-detail', params: { id } });
    },

    viewPayments(id) {
      this.$router.push({ name: 'rents_payment_detail', params: { id } });
    },
  },
};
</script>
