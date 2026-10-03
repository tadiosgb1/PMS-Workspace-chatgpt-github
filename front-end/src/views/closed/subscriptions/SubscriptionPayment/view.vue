<template>
  <div class="pms-brand-page" class="p-6 bg-gray-100 min-h-screen text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading subscription payments..." />

    <!-- Image Preview Modal -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000] p-4"
      @click.self="showImageModal = false"
    >
      <div class="relative max-w-4xl w-full">
        <button 
          @click="showImageModal = false" 
          class="absolute -top-12 right-0 text-white hover:text-gray-300 text-3xl transition-colors"
        >
          <i class="fas fa-times"></i>
        </button>
        <img 
          :src="selectedSlipImage" 
          class="w-full h-auto rounded-xl shadow-2xl object-contain max-h-[85vh]" 
          alt="Payment Slip"
        />
      </div>
    </div>

    <div class="max-w-7xl mx-auto">
      <div class="bg-white  border border-gray-100 shadow-sm overflow-hidden">
        
        <!-- Header -->
        <div class="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <button
              @click="$router.go(-1)"
              class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <i class="fas fa-arrow-left"></i>
              <span class="font-medium">Back</span>
            </button>
            
            <div class="h-8 w-px bg-gray-200"></div>
            
            <div>
              <h1 class="text-2xl font-black text-gray-800 tracking-tight">Subscription Payments</h1>
              <p class="text-sm text-gray-500">Revenue & Transaction Management</p>
            </div>
          </div>

          <!-- Export Buttons -->
          <div class="flex items-center gap-3">
            <button
              @click="exportPayments(false)"
              class="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 transition-all active:scale-95"
            >
              <i class="fas fa-download"></i>
              Export Filtered
            </button>
            <button
              @click="exportPayments(true)"
              class="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 transition-all active:scale-95"
            >
              <i class="fas fa-download"></i>
              Export All
            </button>
          </div>
        </div>

        <!-- Filters Bar -->
        <div class="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
          <div class="relative flex-1 max-w-xs">
            <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              v-model="searchTerm"
              @input="fetchPayments(1)"
              type="search"
              placeholder="Search by transaction ID, plan or owner..."
              class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition"
            />
          </div>

          <div class="flex items-center gap-4">
            <!-- Status Filter -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-gray-500">STATUS</span>
              <select v-model="statusFilter" @change="fetchPayments(1)" 
                class="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="">All Status</option>
                <option value="paid">Paid/Approved</option>
                <option value="pending">Pending</option>
                <option value="canceled">Cancelled</option>
              </select>
            </div>

            <!-- Payment Method -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-gray-500">METHOD</span>
              <select v-model="payment_method" @change="fetchPayments(1)"
                class="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="">All Methods</option>
                <option value="telebirr">Telebirr</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <!-- Entries -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-gray-500">SHOW</span>
              <select v-model.number="perPage" @change="fetchPayments(1)"
                class="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Desktop Table -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4 text-left">Transaction</th>
                <th class="px-6 py-4 text-left">Plan & Owner </th>
                <th class="px-6 py-4 text-left">Amount</th>
                <th class="px-6 py-4 text-left">Paid At</th>
                <th class="px-6 py-4 text-left">Valid Until/End Date</th>
                <th class="px-6 py-4 text-center">Receipt</th>
                <th v-if="$hasPermission('pms.change_subscriptionpayment')" class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="p in filteredAndSortedPayments" :key="p.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
  <div class="flex items-center flex-wrap">
    <span class="font-mono font-semibold text-gray-800">
      {{ p.transaction_id }}
    </span>
    <span class="mx-1 text-gray-400">-</span>
    <button
      @click="goToSubDetail(p.subscription_id)"
      class="text-blue-600 hover:underline text-xs"
    >
      Sub #{{ p.subscription_id }}
    </button>
  </div>
</td>

<td class="px-6 py-4">
  <div class="flex items-center flex-wrap">
    <span class="font-semibold">
      {{ p.planName }}
    </span>
    <span class="mx-1 text-gray-400">-</span>
    <button
      @click="goToUserDetail(p.user_id)"
      class="text-xs text-gray-500 hover:text-blue-600"
    >
      View Owner
    </button>
  </div>
</td>

<td class="px-6 py-4">
  <div class="flex items-center flex-wrap">
    <span class="font-semibold text-gray-900">
      {{ p.amount }} ETB
    </span>
    <span class="mx-1 text-gray-400">-</span>
    <span class="text-xs uppercase font-medium text-gray-500">
      {{ p.payment_method }}
    </span>
  </div>
</td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ p.paid_at ? new Date(p.paid_at).toLocaleString() : '—' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ p.end_date ? new Date(p.end_date).toLocaleDateString() : '—' }}
                </td>
                <td class="px-6 py-4 text-center">
                  <button 
                    v-if="p.slip_picture" 
                    @click="openSlipModal(p.slip_picture)"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium transition"
                  >
                    <i class="fas fa-image"></i> View Slip
                  </button>
                  <span v-else class="text-gray-400 text-sm">No Slip</span>
                </td>
                <td v-if="$hasPermission('pms.change_subscriptionpayment')" class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button 
                      v-if="p.status !== 'paid'"
                      @click="askConfirmation('approve', p)"
                      class="flex items-center gap-2 px-5 py-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-xl text-sm font-medium transition-all"
                    >
                      <i class="fas fa-check"></i> Approve
                    </button>
                    <button 
                      v-if="p.status !== 'canceled'"
                      @click="askConfirmation('reject', p)"
                      class="flex items-center gap-2 px-5 py-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-xl text-sm font-medium transition-all"
                    >
                      <i class="fas fa-times"></i> Reject
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="!filteredAndSortedPayments.length" class="py-20 text-center text-gray-400">
          No payment records found.
        </div>

        <!-- Mobile Cards -->
        <div class="lg:hidden p-4 space-y-4">
          <div v-for="p in filteredAndSortedPayments" :key="p.id" class="bg-white border border-gray-100 rounded-2xl p-5">
            <!-- ... Mobile card content can be expanded if needed ... -->
            <div class="flex justify-between">
              <div>
                <div class="font-mono text-sm">{{ p.transaction_id }}</div>
                <div class="font-semibold mt-1">{{ p.planName }}</div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-lg">{{ p.amount }} ETB</div>
                <div class="text-xs text-gray-500">{{ p.payment_method }}</div>
              </div>
            </div>
            <!-- Add more fields as needed for mobile -->
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-gray-50 border-t border-gray-100">
          <div class="text-xs text-gray-500">
            Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of 
            <span class="font-semibold text-gray-700">{{ totalPages }}</span>
          </div>
          <div class="flex gap-3 mt-3 sm:mt-0">
            <button @click="fetchUrl(previous)" :disabled="!previous" 
              class="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium disabled:opacity-40">
              <i class="fas fa-chevron-left"></i> Previous
            </button>
            <button @click="fetchUrl(next)" :disabled="!next" 
              class="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium disabled:opacity-40">
              Next <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      :visible="showConfirm"
      :title="confirmTitle"
      :message="confirmMessage"
      @cancel="showConfirm = false"
      @confirm="confirmAction"
    />
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Loading from "@/components/Loading.vue";

export default {
  components: { Toast, ConfirmModal, Loading },

  data() {
    return {
      payments: [],
      searchTerm: "",
      statusFilter: "",
      payment_method: "",
      perPage: 10,
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
      loading: false,
      showConfirm: false,
      selectedPayment: null,
      selectedAction: "",
      showImageModal: false,
      selectedSlipImage: "",
    };
  },

  computed: {
    filteredAndSortedPayments() {
      let list = [...this.payments];

      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        list = list.filter(p => 
          JSON.stringify(p).toLowerCase().includes(term)
        );
      }

      if (this.statusFilter) {
        list = list.filter(p => p.status === this.statusFilter);
      }

      return list;
    },

    confirmTitle() {
      return this.selectedAction === "approve" ? "Approve Payment" : "Reject Payment";
    },

    confirmMessage() {
      return this.selectedAction === "approve"
        ? "Are you sure you want to approve this payment?"
        : "Are you sure you want to reject this payment? This action cannot be undone.";
    },
  },

  mounted() {
    this.fetchPayments(1);
  },

  methods: {
    openSlipModal(url) {
      this.selectedSlipImage = url;
      this.showImageModal = true;
    },

    goToUserDetail(id) {
      this.$router.push(`/user_detail/${id}`);
    },

    goToSubDetail(id) {
      this.$router.push(`/sub-detail/${id}`);
    },

    async fetchPayments(page = 1) {
      this.loading = true;
      try {
        const params = {
          page,
          page_size: this.perPage,
          payment_method: this.payment_method,
          subscription_id: this.$route.params.id,
        };

        if (this.statusFilter) params.status = this.statusFilter;

        if (localStorage.getItem("is_superuser") !== "true") {
          params.user_id = localStorage.getItem("userId");
        }

        const res = await this.$apiGet("/get_subscription_payment", params);

        this.payments = res.data || [];
        this.currentPage = res.current_page || 1;
        this.totalPages = res.total_pages || 1;
        this.next = res.next;
        this.previous = res.previous;

        await Promise.all(this.payments.map(async (p) => {
          if (p.user_id) {
            try {
              const user = await this.$apiGetById("get_user", p.user_id);
              p.ownerName = user.first_name || "Unknown";
            } catch { p.ownerName = "Unknown"; }
          }
          if (p.subscription_id) {
            try {
              const sub = await this.$apiGetById("get_subscription", p.subscription_id);
              p.planName = sub.plan_name || "Unknown Plan";
            } catch { p.planName = "Unknown Plan"; }
          }
        }));
      } catch (err) {
        console.error(err);
        this.$root.$refs.toast.showToast("Failed to load payments", "error");
      } finally {
        this.loading = false;
      }
    },

    async fetchUrl(url) {
      if (!url) return;
      this.loading = true;
      try {
        const res = await this.$apiGet(url);
        this.payments = res.data || [];
        this.currentPage = res.current_page || 1;
        this.totalPages = res.total_pages || 1;
        this.next = res.next;
        this.previous = res.previous;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    // ====================== EXPORT ======================
    async exportPayments(all = false) {
      this.loading = true;
      try {
        const params = {
          page_size: all ? 1000 : this.perPage,
          payment_method: this.payment_method,
          subscription_id: this.$route.params.id,
        };

        if (this.statusFilter) params.status = this.statusFilter;
        if (localStorage.getItem("is_superuser") !== "true") {
          params.user_id = localStorage.getItem("userId");
        }

        const res = await this.$apiGet("/get_subscription_payment", params);
        const data = res.data || [];

        if (!data.length) {
          this.$root.$refs.toast.showToast("No records to export", "warning");
          return;
        }

        this.downloadCSV(data, all ? "all_subscription_payments" : "filtered_payments");
      } catch (err) {
        this.$root.$refs.toast.showToast("Export failed", "error");
      } finally {
        this.loading = false;
      }
    },

    downloadCSV(data, baseFilename) {
      const headers = [
        "Transaction ID", "Owner", "Plan", "Amount (ETB)", "Method",
        "Status", "Paid At", "Valid Until", "Created At"
      ];

      const rows = data.map(p => [
        `"${p.transaction_id || ''}"`,
        `"${p.ownerName || 'Unknown'}"`,
        `"${p.planName || 'Unknown'}"`,
        p.amount,
        `"${p.payment_method || ''}"`,
        `"${p.status || ''}"`,
        `"${p.paid_at ? new Date(p.paid_at).toLocaleString() : ''}"`,
        `"${p.end_date ? new Date(p.end_date).toLocaleDateString() : ''}"`,
        `"${p.created_at ? new Date(p.created_at).toLocaleString() : ''}"`
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${baseFilename}_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    },

    askConfirmation(action, payment) {
      this.selectedPayment = payment;
      this.selectedAction = action;
      this.showConfirm = true;
    },

    async confirmAction() {
      if (!this.selectedPayment) return;

      const newStatus = this.selectedAction === "approve" ? "paid" : "canceled";

      try {
        await this.$apiPatch("/update_subscription_payment", this.selectedPayment.id, {
          status: newStatus
        });

        this.$root.$refs.toast.showToast(
          newStatus === "paid" ? "Payment approved successfully" : "Payment rejected",
          "success"
        );

        this.fetchPayments(this.currentPage);
      } catch (err) {
        this.$root.$refs.toast.showToast("Operation failed", "error");
      } finally {
        this.showConfirm = false;
      }
    },
  },
};
</script>