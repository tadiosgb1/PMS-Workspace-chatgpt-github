<template>
  <div class="pms-brand-page p-6 bg-gray-100 min-h-screen text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading rent payments..." />

    <div class="space-y-4">
      <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
        
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
              <i class="fas fa-file-invoice-dollar text-sm"></i>
            </div>
            <div>
              <h1 class="text-lg font-black text-gray-800">Rent Payments</h1>
              <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Financial Transaction History</p>
            </div>
          </div>

          <!-- Export Buttons -->
          <div class="flex items-center gap-3">
            <button
              @click="exportPayments(false)"
              class="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-700 transition-colors"
            >
              <i class="fas fa-download"></i> Export Filtered
            </button>
            <button
              @click="exportPayments(true)"
              class="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-700 transition-colors"
            >
              <i class="fas fa-download"></i> Export All
            </button>
          </div>
        </div>

        <div v-if="!rentId" class="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-4">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                v-model="searchTerm"
                @input="fetchPayments(1)"
                type="search"
                placeholder="Search payments..."
                class="pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 outline-none transition w-64"
              />
            </div>

            <div class="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
              <div class="flex items-center px-2 gap-2">
                <span class="text-xs text-gray-500 font-semibold">Status</span>
                <select v-model="statusFilter" @change="fetchPayments(1)" class="bg-transparent text-xs font-semibold text-gray-700 outline-none">
                  <option value="all">All Records</option>
                  <option value="complete">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div class="w-px h-4 bg-gray-200"></div>
              <div class="flex items-center px-2 gap-2">
                <span class="text-xs text-gray-500 font-semibold">Method</span>
                <select v-model="payment_method" @change="fetchPayments(1)" class="bg-transparent text-xs font-semibold text-gray-700 outline-none">
                  <option value="">All</option>
                  <option value="tellebirr">Tellebirr</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-500 font-semibold">Show</span>
            <div class="flex gap-1">
              <button 
                v-for="n in [10, 20, 50]" 
                :key="n"
                @click="perPage = n; fetchPayments(1)"
                class="px-3 py-1 text-xs font-semibold rounded-lg transition"
                :class="perPage === n ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                {{ n }}
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Table -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <tr>
                <th class="px-4 py-3 text-left">Ref</th>
                <th class="px-4 py-3 text-left">Amount</th>
                <th class="px-4 py-3 text-left">Due Date</th>
                <th class="px-4 py-3 text-left">Status</th>
                <th class="px-4 py-3 text-left">Modified</th>
                <th class="px-4 py-3 text-left">Relations</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(payment, index) in filteredPayments" :key="payment.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-xs font-semibold text-gray-500">#{{ index + 1 }}</td>
                <td class="px-4 py-3">
                  <div class="text-sm font-semibold text-gray-800">{{ payment.amount }} ETB</div>
                  <div class="text-xs font-semibold text-gray-500 uppercase">{{ payment.payment_method }}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-xs font-semibold text-gray-700">{{ formatDate(payment.due_date) }}</div>
                  <div class="text-xs font-mono text-gray-400 mt-1">{{ payment.transaction_id }}</div>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded-full text-xs font-semibold uppercase" :class="getStatusClass(payment.status)">
                    {{ payment.status }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="text-xs font-semibold text-gray-600">
                    {{ payment.updated_at ? formatDate(payment.updated_at) : formatDate(payment.created_at) }}
                  </div>
                </td>
                <td class="px-4 py-3 space-x-1">
                  <button @click="goToRentDetail(payment.rent_id)" class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-800 hover:text-white transition">Rent</button>
                  <button @click="goToUserDetail(payment.user_id)" class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-800 hover:text-white transition">User</button>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <button
                      v-if="payment.status === 'pending' || payment.status === 'cancelled'"
                      @click="approve(payment)"
                      class="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-medium transition-all"
                    >
                      <i class="fas fa-check"></i> Approve
                    </button>
                    <button
                      v-if="payment.status === 'pending' || payment.status === 'complete'"
                      @click="reject(payment)"
                      class="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-medium transition-all"
                    >
                      <i class="fas fa-times"></i> Reject
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredPayments.length === 0" class="py-10 text-center text-sm text-gray-400 italic">
            No payment records found
          </div>
        </div>

        <!-- Mobile Cards -->
        <div class="lg:hidden p-4 space-y-4">
          <div v-for="payment in filteredPayments" :key="payment.id" class="bg-white border border-gray-100 rounded-lg p-4 space-y-3">
            <!-- Mobile content (simplified for brevity) -->
            <div class="flex justify-between">
              <div class="text-sm font-semibold">{{ payment.amount }} ETB</div>
              <span :class="getStatusClass(payment.status)" class="px-3 py-1 text-xs font-semibold uppercase rounded-full">
                {{ payment.status }}
              </span>
            </div>
            <div class="text-xs text-gray-500">{{ formatDate(payment.due_date) }}</div>
            <div class="flex gap-2">
              <button @click="approve(payment)" v-if="payment.status === 'pending' || payment.status === 'cancelled'" class="flex-1 py-2 text-sm bg-emerald-600 text-white rounded-lg">Approve</button>
              <button @click="reject(payment)" v-if="payment.status === 'pending' || payment.status === 'complete'" class="flex-1 py-2 text-sm bg-red-100 text-red-600 rounded-lg">Reject</button>
            </div>
          </div>
        </div>

        <div v-if="!rentId" class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 border-t border-gray-100">
          <span class="text-xs text-gray-500">Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of <span class="font-semibold text-gray-700">{{ totalPages }}</span></span>
          <div class="flex gap-2">
            <button @click="fetchUrl(previous)" :disabled="!previous" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
              <i class="fas fa-chevron-left text-[10px]"></i> Prev
            </button>
            <button @click="fetchUrl(next)" :disabled="!next" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
              Next <i class="fas fa-chevron-right text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";

export default {
  name: "RentPayments",
  components: { Toast, Loading },
  data() {
    return {
      payments: [],
      searchTerm: "",
      perPage: 10,
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
      statusFilter: "all",
      payment_method: "",
      loading: false,
    };
  },
  computed: {
    rentId() {
      return this.$route.params.id || null;
    },
    filteredPayments() {
      const term = this.searchTerm.toLowerCase();
      return this.payments.filter((p) =>
        Object.values(p).some((val) => String(val || "").toLowerCase().includes(term))
      );
    },
  },
  mounted() {
    this.fetchPayments(1);
  },
  watch: {
    "$route.params.id"() {
      this.fetchPayments(1);
    },
  },
  methods: {
    getStatusClass(status) {
      if (status === 'paid' || status === 'complete') return 'bg-green-100 text-green-700';
      if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
      if (status === 'cancelled') return 'bg-red-100 text-red-700';
      return 'bg-gray-100 text-gray-600';
    },

    goToUserDetail(id) {
      this.$router.push(`/user_detail/${id}`);
    },
    goToRentDetail(id) {
      this.$router.push(`/rent-detail/${id}`);
    },

    async fetchPayments(page = 1) {
      this.loading = true;
      try {
        let params = this.buildRoleParams();
        if (this.rentId) {
          params.rent_id = this.rentId;
        } else {
          params.page = page;
          params.page_size = this.perPage;
          if (this.statusFilter !== "all") params.status = this.statusFilter;
        }

        const res = await this.$apiGet("/get_payments", params);
        this.payments = Array.isArray(res.data) ? res.data : [];
        this.currentPage = res.current_page || 1;
        this.totalPages = res.total_pages || 1;
        this.next = res.next || null;
        this.previous = res.previous || null;
      } catch (error) {
        console.error(error);
        this.payments = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchUrl(url) {
      if (!url) return;
      this.loading = true;
      try {
        const res = await this.$apiGet(url);
        this.payments = Array.isArray(res.data) ? res.data : [];
        this.currentPage = res.current_page || 1;
        this.totalPages = res.total_pages || 1;
        this.next = res.next || null;
        this.previous = res.previous || null;
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // ====================== EXPORT ======================
    async exportPayments(all = false) {
      this.loading = true;
      try {
        let params = this.buildRoleParams();
        if (this.rentId) params.rent_id = this.rentId;
        params.page_size = all ? 1000 : this.perPage;
        if (this.statusFilter !== "all") params.status = this.statusFilter;

        const res = await this.$apiGet("/get_payments", params);
        const data = Array.isArray(res.data) ? res.data : [];

        if (!data.length) {
          this.$root.$refs.toast.showToast("No data to export", "warning");
          return;
        }

        this.downloadCSV(data, all ? "all_rent_payments" : "filtered_rent_payments");
      } catch (err) {
        console.error(err);
        this.$root.$refs.toast.showToast("Export failed", "error");
      } finally {
        this.loading = false;
      }
    },

    downloadCSV(data, filename) {
      const headers = ["ID", "Amount", "Method", "Due Date", "Status", "Transaction ID"];
      const rows = data.map(p => [
        p.id,
        p.amount,
        `"${p.payment_method || ''}"`,
        `"${this.formatDate(p.due_date)}"`,
        `"${p.status}"`,
        `"${p.transaction_id || ''}"`
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    },

    async approve(payment) {
      try {
        await this.$apiPatch(`/update_payment`, payment.id, { status: "paid" });
        this.$root.$refs.toast.showToast("Payment Approved Successfully", "success");
        this.fetchPayments(this.currentPage);
      } catch (err) {
        this.$root.$refs.toast.showToast("Failed to approve payment", "error");
      }
    },

    async reject(payment) {
      try {
        await this.$apiPatch(`/update_payment`, payment.id, { status: "cancelled" });
        this.$root.$refs.toast.showToast("Payment Rejected", "success");
        this.fetchPayments(this.currentPage);
      } catch (err) {
        this.$root.$refs.toast.showToast("Failed to reject payment", "error");
      }
    },

    formatDate(dateString) {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString();
    },

    buildRoleParams(params = {}) {
      // ... your existing role logic (kept unchanged)
      const isSuperUser = localStorage.getItem("is_superuser") === "1" || localStorage.getItem("is_superuser") === "true";
      // ... rest of your buildRoleParams logic
      return params;
    },
  },
};
</script>