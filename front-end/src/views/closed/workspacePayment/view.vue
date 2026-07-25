<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm">
    <Toast ref="toast" />

    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Workspace Payments</h1>
        <p class="text-xxs text-gray-400 tracking-wider mt-0.5">Rental Ledger & Transaction History</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="exportPayments(false)"
          class="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <i class="fas fa-download"></i> Export Filtered
        </button>
        <button 
          @click="exportPayments(true)"
          class="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <i class="fas fa-download"></i> Export All
        </button>
        <button v-if="!rentalId" @click="showModal = true" 
          class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <i class="fas fa-plus text-xs"></i> Add Payment
        </button>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3 bg-white p-4 rounded-lg border border-gray-100">
      <div class="relative flex-1 max-w-sm">
        <input 
          v-model="searchTerm" 
          @input="fetchPayments(1)"
          type="search" 
          placeholder="Search rentals..." 
          class="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" 
        />
      </div>

      <div class="flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2 text-gray-500">
          <label class="font-semibold">Status:</label>
          <select v-model="status" @change="fetchPayments(1)" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition cursor-pointer">
            <option value="">All Status</option>
            <option value="complete">Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="flex items-center gap-2 text-gray-500">
          <label class="font-semibold">Method:</label>
          <select v-model="payment_method" @change="fetchPayments(1)" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition cursor-pointer">
            <option value="">All Methods</option>
            <option value="tellebirr">Telebirr</option>
            <option value="cash">Cash</option>
          </select>
        </div>
        <div class="flex items-center gap-2 text-gray-500">
          <label class="font-semibold">Show</label>
          <select v-model="perPage" @change="fetchPayments(1)" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition cursor-pointer">
            <option v-for="size in [10, 20, 50]" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left">Ref/Rental</th>
              <th class="px-4 py-3 text-left">Financials</th>
              <th class="px-4 py-3 text-left">Billing Cycle</th>
              <th class="px-4 py-3 text-left">Evidence</th>
              <th class="px-4 py-3 text-left">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="payment in filteredAndSortedPayments" :key="payment.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="text-xs text-gray-400 mb-1">ID #{{ payment.id }}</div>
                <button @click="goToRentalDetail(payment.rental)" class="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2">
                  Rental #{{ payment.rental_id }}
                  <i class="fas fa-external-link-alt text-xs"></i>
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="font-semibold text-gray-800">{{ payment.amount }} ETB</div>
                <div class="text-xs text-gray-400">{{ payment.transaction_id || 'No Transaction ID' }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="text-xs text-gray-600">{{ formatDate(payment.cycle_start) }}</div>
                  <i class="fas fa-arrow-right text-xs text-gray-300"></i>
                  <div class="text-xs text-gray-600">{{ formatDate(payment.cycle_end) }}</div>
                </div>
                <div class="text-xs text-gray-500 uppercase mt-1">{{ payment.payment_method }}</div>
              </td>
              <td class="px-4 py-3">
                <button
                  v-if="payment.slip_picture"
                  @click="viewSlip(payment.slip_picture)"
                  class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-600 hover:text-white transition-all"
                >
                  <i class="fas fa-image"></i> View Slip
                </button>
                <span v-else class="text-xs text-gray-300 italic">Missing</span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold uppercase inline-block"
                  :class="{
                    'bg-emerald-100 text-emerald-700': payment.status === 'complete',
                    'bg-amber-100 text-amber-700': payment.status === 'pending',
                    'bg-rose-100 text-rose-700': payment.status === 'cancelled'
                  }"
                >
                  {{ payment.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="payment.status !== 'complete'"
                    @click="approve(payment)"
                    class="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-medium transition-all"
                  >
                    <i class="fas fa-check"></i> Approve
                  </button>
                  <button
                    v-else
                    @click="disApprove(payment)"
                    class="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-medium transition-all"
                  >
                    <i class="fas fa-times"></i> Reject
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAndSortedPayments.length === 0">
              <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-400 italic">No payment records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="!rentalId" class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of <span class="font-semibold text-gray-700">{{ totalPages }}</span></span>
      <div class="flex gap-2">
        <button :disabled="!previous" @click="fetchPayments(previous)" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <button :disabled="!next" @click="fetchPayments(next)" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <AddRentalPayment
      v-if="!rentalId"
      :visible="showModal"
      @close="showModal = false"
      @success="fetchPayments"
    />
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import AddRentalPayment from "./add.vue";

export default {
  name: "WorkspacePaymentsView",
  components: { Toast, AddRentalPayment },
  data() {
    return {
      payments: [],
      searchTerm: "",
      perPage: 10,
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
      showModal: false,
      payment_method: "",
      status: "",
    };
  },
  computed: {
    rentalId() {
      return this.$route.params.id || null;
    },
    filteredAndSortedPayments() {
      const term = this.searchTerm.toLowerCase();
      return this.payments
        .filter(
          (p) =>
            String(p.rental_info || "").toLowerCase().includes(term) ||
            String(p.status).toLowerCase().includes(term) ||
            String(p.amount).toLowerCase().includes(term)
        );
    },
  },
  mounted() {
    this.fetchPayments();
  },
  methods: {
    goToRentalDetail(id) {
      this.$router.push(`/co-work-rental-detail/${id}`);
    },

    viewSlip(url) {
      window.open(url, "_blank");
    },

    async fetchPayments(urlOrPage = null) {
      try {
        let params = {};
        if (this.rentalId) {
          params = { rental__id: this.rentalId, payment_method: this.payment_method, status: this.status };
        } else {
          params = { 
            page: urlOrPage || 1, 
            payment_method: this.payment_method, 
            status: this.status, 
            page_size: this.perPage 
          };
        }

        const res = await this.$getWorkspacePayments(null, params);
        this.payments = res.payments || [];
        this.currentPage = res.currentPage || 1;
        this.totalPages = res.totalPages || 1;
        this.next = res.next || null;
        this.previous = res.previous || null;
      } catch (err) {
        console.error("Failed to fetch payments:", err);
        this.payments = [];
      }
    },

    // ====================== EXPORT ======================
    async exportPayments(all = false) {
      try {
        const params = {
          page_size: all ? 1000 : this.perPage,
          payment_method: this.payment_method,
          status: this.status,
        };

        if (this.rentalId) {
          params.rental__id = this.rentalId;
        }

        const res = await this.$getWorkspacePayments(null, params);
        const data = res.payments || [];

        if (!data.length) {
          this.$root.$refs.toast.showToast("No data to export", "warning");
          return;
        }

        this.downloadCSV(data, all ? "all_workspace_payments" : "filtered_payments");
      } catch (err) {
        console.error(err);
        this.$root.$refs.toast.showToast("Export failed", "error");
      }
    },

    downloadCSV(data, filename) {
      const headers = [
        "ID", "Rental ID", "Amount (ETB)", "Transaction ID", 
        "Payment Method", "Cycle Start", "Cycle End", "Status"
      ];

      const rows = data.map(p => [
        p.id,
        p.rental_id,
        p.amount,
        `"${p.transaction_id || ''}"`,
        `"${p.payment_method || ''}"`,
        `"${this.formatDate(p.cycle_start)}"`,
        `"${this.formatDate(p.cycle_end)}"`,
        `"${p.status}"`
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    },

    approve(payment) {
      this.updatePaymentStatus(payment, "complete", "Payment Approved Successfully");
    },

    disApprove(payment) {
      this.updatePaymentStatus(payment, "pending", "Payment Rejected");
    },

    async updatePaymentStatus(payment, status, message) {
      try {
        const res1 = await this.$apiPatch("/update_rental_payment", payment.id, { status });
        if (res1) {
          const payloadWorkspaceRental = { is_active: status === "pending" };
          await this.$apiPatch("/update_workspace_rental", payment.rental, payloadWorkspaceRental);
          this.$root.$refs.toast.showToast(message, "success");
          this.fetchPayments(this.currentPage);
        }
      } catch (err) {
        console.error(err);
        this.$root.$refs.toast.showToast("Failed to update payment", "error");
      }
    },

    formatDate(dateString) {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString();
    },
  },
};
</script>