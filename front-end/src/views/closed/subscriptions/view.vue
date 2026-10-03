<template>
  <div class="pms-brand-page p-6 bg-gray-100 min-h-screen text-sm text-slate-800">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading subscriptions..." />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Subscriptions</h1>
        <p class="text-xxs text-gray-400   tracking-wider mt-0.5">Billing & Plan Management</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="exportSubscriptions(false)"
          class="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <i class="fas fa-download"></i> Export Filtered
        </button>
        <button
          @click="exportSubscriptions(true)"
          class="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <i class="fas fa-download"></i> Export All
        </button>
        <button
          v-if="addSubsc"
          @click="visible = true"
          class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <i class="fas fa-plus text-xs"></i> New Subscription
        </button>
      </div>
    </div>

    <!-- Search + Filters -->
    <div class="flex flex-col lg:flex-row gap-3 mb-6">
      <div class="relative flex-1 max-w-md">
        <input
          v-model="searchTerm"
          type="search"
          placeholder="Search by plan or owner..."
          class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
        />
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Plan Filter -->
        <div class="flex items-center gap-2">
          <label class="font-semibold text-xs text-gray-500">Plan</label>
          <select
            v-model="selectedPlan"
            @change="fetchSubscriptions()"
            class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">All Plans</option>
            <option v-for="plan in plans" :key="plan.id" :value="plan.name">
              {{ plan.name }}
            </option>
          </select>
        </div>

        <!-- Status Filter (Superuser only) -->
        <div v-if="is_super_user == 'true'" class="flex items-center gap-2">
          <label class="font-semibold text-xs text-gray-500">Status</label>
          <select v-model="status" @change="fetchSubscriptions()" class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="font-semibold text-xs text-gray-500">Show</label>
          <select v-model="pageSize" @change="fetchSubscriptions()" class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300">
            <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden hidden lg:block">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left">Account Owner</th>
              <th class="px-4 py-3 text-left">Plan & Price</th>
              <th class="px-4 py-3 text-left">Billing Cycle</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="subscription in filteredSubscriptions"
              :key="subscription.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 uppercase shrink-0">
                    {{ (subscription.ownerName || "U")[0] }}
                  </div>
                  <span class="text-gray-700 font-medium">{{ subscription.ownerName || "Unknown" }}</span>
                </div>
              </td>

             <td class="px-4 py-3">
              <div class="flex items-center text-gray-800">
                <span class="font-semibold">{{ subscription.plan_name }}</span>
                <span class="mx-2 text-gray-400">-</span>
                <span class="text-sm text-gray-600">{{ subscription.price }}</span>
              </div>
            </td>

            <td class="px-4 py-3">
              <div class="flex items-center">
                <span class="text-xs text-gray-500">
                  {{ formatDate(subscription.start_date) }}
                </span>
                <span class="mx-1 text-gray-400">--</span>
                <span class="text-xs text-gray-400">
                  {{ formatDate(subscription.end_date) }}
                </span>
              </div>
            </td>

              <td class="px-4 py-3 text-center">
                <span
                  :class="{
                    'bg-amber-100 text-amber-700': subscription.status == 'pending',
                    'bg-red-100 text-red-600': subscription.status == 'expired' || subscription.status == 'terminated',
                    'bg-green-100 text-green-700': subscription.status == 'active',
                  }"
                  class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                >
                  {{ subscription.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button
                    v-if="is_super_user != 'true' && subscription.status === 'pending'"
                    @click="pay(subscription)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition text-xs"
                    title="Pay Now"
                  >
                    <i class="fas fa-credit-card"></i>
                  </button>
                  <button
                    @click="payment(subscription.id)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition text-xs"
                    title="View Payments"
                  >
                    <i class="fas fa-list-ul"></i>
                  </button>
                  <button
                    v-if="is_super_user != 'true'"
                    @click="openUpgradeModal(subscription)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white transition text-xs"
                    title="Upgrade Plan"
                  >
                    <i class="fas fa-arrow-up"></i>
                  </button>
                  <button
                    @click="askDeactivateConfirmation(subscription)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition text-xs"
                    title="Deactivate"
                  >
                    <i class="fas fa-power-off"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredSubscriptions.length">
              <td colspan="5" class="px-4 py-10 text-center text-sm text-gray-400 italic">No subscriptions found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div class="lg:hidden space-y-3">
      <div
        v-for="subscription in filteredSubscriptions"
        :key="subscription.id"
        class="bg-white border border-gray-100 rounded-lg p-4"
      >
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 uppercase">
              {{ (subscription.ownerName || "U")[0] }}
            </div>
            <div>
              <p class="font-medium text-gray-700">{{ subscription.ownerName || "Unknown" }}</p>
              <p class="text-xs text-gray-400">{{ subscription.plan_name }}</p>
            </div>
          </div>
          <span
            :class="subscription.status == 'active' ? 'bg-green-100 text-green-700' : subscription.status == 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'"
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
          >
            {{ subscription.status }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs mb-3">
          <div>
            <p class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Price</p>
            <p class="font-medium">{{ subscription.price }}</p>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Period</p>
            <p class="text-gray-600">{{ formatDate(subscription.start_date) }} – {{ formatDate(subscription.end_date) }}</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          <button v-if="is_super_user != 'true' && subscription.status === 'pending'" @click="pay(subscription)"
            class="flex-1 px-3 py-1.5 bg-green-50 text-green-600 border border-green-100 rounded-lg text-xs font-semibold">
            <i class="fas fa-credit-card"></i> Pay
          </button>
          <button @click="payment(subscription.id)"
            class="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-semibold">
            <i class="fas fa-list-ul"></i> Logs
          </button>
          <button v-if="is_super_user != 'true'" @click="openUpgradeModal(subscription)"
            class="flex-1 px-3 py-1.5 bg-orange-50 text-orange-500 border border-orange-100 rounded-lg text-xs font-semibold">
            <i class="fas fa-arrow-up"></i> Upgrade
          </button>
        </div>
      </div>
      <div v-if="!filteredSubscriptions.length" class="bg-white rounded-lg border border-gray-100 p-10 text-center text-sm text-gray-400 italic">
        No subscriptions found.
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">
        Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of <span class="font-semibold text-gray-700">{{ totalPages }}</span>
      </span>
      <div class="flex items-center gap-2">
        <button
          @click="fetchSubscriptions(previous)"
          :disabled="!previous"
          class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <i class="fas fa-chevron-left text-[10px]"></i> Previous
        </button>
        <button
          @click="fetchSubscriptions(next)"
          :disabled="!next"
          class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <PaymentModal v-if="paymentVisible" :visible="paymentVisible" :payload="paymentPayload" @close="paymentVisible = false" @paid="handlePaymentSuccess" />
    <UpgradeSubscriptionModal v-if="showUpgradeModal" :visible="showUpgradeModal" :subscriptionId="selectedSubscriptionId" @close="showUpgradeModal = false" @plan-upgraded="fetchSubscriptions" />
    <ConfirmModal v-if="confirmVisible" :visible="confirmVisible" title="Confirm Deactivate" message="Are you sure you want to deactivate this subscription?" @confirm="Deactivate" @cancel="confirmVisible = false" />
  </div>
</template>

<script>
import PaymentModal from "./Payment.vue";
import UpgradeSubscriptionModal from "./upgradePlan.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";

export default {
  name: "subscriptionView",
  components: { ConfirmModal, Toast, PaymentModal, UpgradeSubscriptionModal, Loading },
  data() {
    return {
      subscriptions: [],
      plans: [],
      searchTerm: "",
      selectedPlan: "",
      visible: false,
      confirmVisible: false,
      showUpgradeModal: false,
      paymentVisible: false,
      paymentPayload: null,
      is_super_user: false,
      selectedSubscriptionId: null,
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
      pageSize: 10,
      pageSizes: [5, 10, 20, 50, 100],
      status: "",
      loading: false,
      subscriptionToAD: null,
    };
  },
  computed: {
    filteredSubscriptions() {
      const term = this.searchTerm.toLowerCase();
      return this.subscriptions.filter((sub) =>
        Object.values(sub).some((val) => String(val).toLowerCase().includes(term))
      );
    },
  },
  mounted() {
    this.is_super_user = localStorage.getItem("is_superuser");
    this.fetchPlans();
    this.fetchSubscriptions();
  },
  methods: {
    async fetchPlans() {
      try {
        const res = await this.$apiGet("/get_plans");
        this.plans = res.data || [];
      } catch (e) {
        console.error("Failed to fetch plans", e);
      }
    },

    async fetchSubscriptions(url = null) {
      this.loading = true;
      try {
        let params = {
          user_id__id: localStorage.getItem("userId"),
          ordering: "-id",
          status: this.status,
          plan_name: this.selectedPlan,
        };

        if (localStorage.getItem("is_superuser") == "true") {
          delete params.user_id__id;
        }

        const pageUrl = url || `/get_subscription?page=1&page_size=${this.pageSize}&search=${encodeURIComponent(this.searchTerm)}`;
        const res = await this.$apiGet(pageUrl, params);

        this.subscriptions = res.data || [];
        this.currentPage = res.current_page || 1;
        this.totalPages = res.total_pages || 1;
        this.next = res.next || null;
        this.previous = res.previous || null;

        // Fetch owner names
        await Promise.all(
          this.subscriptions.map(async (sub) => {
            if (sub.user_id) {
              try {
                const ownerRes = await this.$apiGetById("get_user", sub.user_id);
                sub.ownerName = ownerRes.first_name || "Unknown";
              } catch {
                sub.ownerName = "Unknown";
              }
            } else {
              sub.ownerName = "Unknown";
            }
          })
        );
      } catch (e) {
        console.error("Error fetching subscriptions", e);
        this.subscriptions = [];
      } finally {
        this.loading = false;
      }
    },

    async exportSubscriptions(all = false) {
      this.loading = true;
      try {
        const params = {
          ordering: "-id",
          status: this.status,
          plan_name: this.selectedPlan,
          page_size: all ? 1000 : this.pageSize,
        };

        if (!all && localStorage.getItem("is_superuser") !== "true") {
          params.user_id__id = localStorage.getItem("userId");
        }

        const res = await this.$apiGet("/get_subscription", params);
        const data = res.data || [];

        if (!data.length) {
          this.$root.$refs.toast.showToast("No data to export", "warning");
          return;
        }

        this.downloadCSV(data, all ? "all_subscriptions" : "filtered_subscriptions");
      } catch (e) {
        console.error(e);
        this.$root.$refs.toast.showToast("Export failed", "error");
      } finally {
        this.loading = false;
      }
    },

    downloadCSV(data, filename) {
      const headers = ["Owner", "Plan", "Price", "Start Date", "End Date", "Status"];
      const csvRows = [
        headers.join(","),
        ...data.map((sub) => [
          `"${sub.ownerName || "Unknown"}"`,
          `"${sub.plan_name}"`,
          `"${sub.price}"`,
          `"${this.formatDate(sub.start_date)}"`,
          `"${this.formatDate(sub.end_date)}"`,
          `"${sub.status}"`,
        ].join(","))
      ];

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleDateString();
    },

    openUpgradeModal(subscription) {
      this.selectedSubscriptionId = subscription.id;
      this.showUpgradeModal = true;
    },

    pay(subscription) {
      this.paymentPayload = { user_id: subscription.user_id, subscription_id: subscription.id, amount: subscription.price };
      this.paymentVisible = true;
    },

    payment(subscriptionId) {
      if (subscriptionId) this.$router.push({ name: "subscriptionsPayment_view", params: { id: subscriptionId } });
    },

    askDeactivateConfirmation(subscription) {
      this.subscriptionToAD = subscription;
      this.confirmVisible = true;
    },

    async Deactivate() {
      this.confirmVisible = false;
      try {
        await this.$apiPatch("/update_subscription", { status: "terminated" }, this.subscriptionToAD.id);
        this.$root.$refs.toast.showToast("Subscription deactivated successfully", "success");
        this.fetchSubscriptions();
      } catch (e) {
        this.$root.$refs.toast.showToast("Failed to deactivate subscription", "error");
      }
    },

    handlePaymentSuccess() {
      this.$root.$refs.toast.showToast("Payment successful", "success");
      this.paymentVisible = false;
      this.fetchSubscriptions();
    },
  },
};
</script>