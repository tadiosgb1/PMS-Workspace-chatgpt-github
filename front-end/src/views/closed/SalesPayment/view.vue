<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm">
    <Toast ref="toast" />

    <div class="space-y-4">
      <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
        
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
              <i class="fas fa-hand-holding-usd text-sm"></i>
            </div>
            <div>
              <h1 class="text-lg font-black text-gray-800">Sales Payments</h1>
              <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Sales Transaction Records</p>
            </div>
          </div>
          
          <router-link
            to="/propertiesListForSale"
            class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-800 text-gray-600 hover:text-white rounded-lg transition text-xs font-semibold"
          >
            <i class="fas fa-arrow-left text-xs"></i>
            Back to Sales
          </router-link>
        </div>

        <div class="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
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
                  <option value="">All Status</option>
                  <option value="complete">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div class="w-px h-4 bg-gray-200"></div>
              <div class="flex items-center px-2 gap-2">
                <span class="text-xs text-gray-500 font-semibold">Method</span>
                <select v-model="payment_method" @change="fetchPayments(1)" class="bg-transparent text-xs font-semibold text-gray-700 outline-none">
                  <option value="">All Methods</option>
                  <option value="Telle">Telebirr</option>
                  <option value="cbe">CBE</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-500 font-semibold">Show</span>
            <select v-model.number="perPage" @change="fetchPayments(1)" class="bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200 outline-none">
              <option v-for="n in [10, 20, 50]" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
        </div>

        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <tr>
                <th class="px-4 py-3 text-left">Amount</th>
                <th class="px-4 py-3 text-left">Transaction ID</th>
                <th class="px-4 py-3 text-left">Status</th>
                <th class="px-4 py-3 text-left">Created</th>
                <th class="px-4 py-3 text-left">Relations</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="p in filteredPayments" :key="p.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <div class="text-sm font-semibold text-gray-800">{{ p.amount | currency }}</div>
                  <div class="text-xs font-semibold text-gray-500 uppercase">{{ p.payment_method }}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-xs font-mono font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">
                    {{ p.transaction_id || 'NO-REF' }}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-semibold uppercase"
                    :class="{
                      'bg-green-100 text-green-700': p.status === 'complete',
                      'bg-yellow-100 text-yellow-700': p.status === 'pending',
                      'bg-red-100 text-red-700': p.status === 'cancelled'
                    }"
                  >
                    {{ p.status }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="text-xs font-semibold text-gray-600">{{ p.created_at }}</div>
                </td>
                <td class="px-4 py-3 space-x-1">
                  <button @click="goToSaleDetail(p.property_zone_sale_id)" class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-800 hover:text-white transition">Sale</button>
                  <button @click="goToUserDetail(p.buyer_id)" class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-800 hover:text-white transition">Buyer</button>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-1">
                    <button
                      v-if="p.status=='pending' || p.status=='cancelled'"
                      @click="approve(p)"
                      class="h-7 w-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition text-xs"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button
                      v-if="p.status=='pending' || p.status=='complete'"
                      @click="reject(p)"
                      class="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition text-xs"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredPayments.length === 0">
                <td colspan="6" class="py-10 text-center">
                  <p class="text-sm text-gray-400 italic">No payment records found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="md:hidden p-4 space-y-4">
          <div v-for="p in filteredPayments" :key="p.id" class="bg-white border border-gray-100 rounded-lg p-4 space-y-3">
            <div class="flex justify-between items-start">
              <div>
                <div class="text-lg font-semibold text-gray-800">{{ p.amount | currency }}</div>
                <div class="text-xs font-semibold text-gray-500 uppercase">{{ p.payment_method }}</div>
              </div>
              <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold uppercase">
                {{ p.status }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-2 py-2 border-t border-gray-100">
              <button @click="goToSaleDetail(p.property_zone_sale_id)" class="py-2 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600">View Sale</button>
              <button @click="goToUserDetail(p.buyer_id)" class="py-2 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600">View Buyer</button>
            </div>

            <div class="flex gap-2 pt-2">
              <button v-if="p.status !== 'complete'" @click="approve(p)" class="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold">Approve</button>
              <button v-if="p.status !== 'cancelled'" @click="reject(p)" class="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">Cancel</button>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 border-t border-gray-100">
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

export default {
  name: "salePaymentsView",
  components: { Toast },
  data() {
    return {
      payments: [],
      saleId: this.$route.params.saleId,
      searchTerm: "",
      perPage: 10,
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
      statusFilter: "",
      payment_method: "",
    };
  },
  computed: {
    filteredPayments() {
      const term = this.searchTerm.toLowerCase();
      return this.payments.filter((p) =>
        Object.values(p).some((val) =>
          String(val || "").toLowerCase().includes(term)
        )
      );
    },
  },
  mounted() {
    this.fetchPayments(1);
  },
  methods: {
    goToUserDetail(id) {
      this.$router.push(`/user_detail/${id}`);
    },
    goToSaleDetail(id) {
      this.$router.push(`/property-sale/${id}`);
    },

    // ✅ unified fetch function that respects all filters
    async fetchPayments(page = 1) {
      try {
        const params = {
          page,
          page_size: this.perPage,
          search: this.searchTerm,
        };

        // ✅ add optional filters dynamically
        if (this.statusFilter && this.statusFilter !== "all") {
          params.status = this.statusFilter;
        }

        if (this.payment_method) {
          params.payment_method = this.payment_method;
        }

        // ✅ include sale ID filter if available
        const id = this.$route.query.id;
        if (id) {
          params.property_zone_sale_id__id = id;
        }

        console.log("Params for /get_sales_payments:", params);

        const res = await this.$apiGet("/get_sales_payments", params);
        this.payments = res.data || [];
        this.currentPage = res.current_page || 1;
        this.totalPages = res.total_pages || 1;
        this.next = res.next;
        this.previous = res.previous;
      } catch (err) {
        console.error("Error fetching payments:", err);
        this.payments = [];
      }
    },

    async fetchUrl(url) {
      if (!url) return;
      const res = await this.$apiGet(url);
      this.payments = res.data || [];
      this.currentPage = res.current_page;
      this.totalPages = res.total_pages;
      this.next = res.next;
      this.previous = res.previous;
    },

    // ✅ simplified — reuses fetchPayments() with filters
    async filterByStatus() {
      await this.fetchPayments(1);
    },

    async approve(payment) {
      const payload = { id: payment.id, status: "complete" };
      const res = await this.$apiPatch("/update_sales_payments", payment.id, payload);
      if (res) {
       // this.$root.$refs.toast.showToast("Payment Approved Successfully", "success");
        const salePayload={
         id:payment.property_zone_sale_id,
         status:"active"
        }

        console.log("payment",payment);
          const res = await this.$apiPatch("/update_property_zone_sale", payment.property_zone_sale_id, salePayload);
          console.log("res update the sale property",res);
        //this.fetchPayments(this.currentPage);
      }
    },

    async reject(payment) {
      const payload = { id: payment.id, status: "cancelled" };
      const res = await this.$apiPatch("/update_sales_payments", payment.id, payload);
      if (res) {
        this.$root.$refs.toast.showToast("Payment Disapproved Successfully", "success");
        this.fetchPayments(this.currentPage);
      }
    },
  },
  filters: {
    currency(v) {
      return v ? new Intl.NumberFormat().format(v) + " USD" : "";
    },
  },
};
</script>
