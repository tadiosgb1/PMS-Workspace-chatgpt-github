<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">All Payments</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Financial Records & Transaction History</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-lg border border-gray-100 p-4 mb-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap',
            activeTab === tab
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ]"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <!-- Tab Content Wrapper -->
    <div class="space-y-4">
      <!-- Subscription Payments -->
      <div v-if="activeTab === 'Subscription Payments'" class="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <subscriptionPayments />
      </div>

      <!-- Sales Payments -->
      <div v-if="activeTab === 'Sales Payments'" class="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <salesPayments />
      </div>

      <!-- Rent Payments -->
      <div v-if="activeTab === 'Rent Payments'" class="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <rent-payments />
      </div>

      <!-- Cowork Space Payments -->
      <div v-if="activeTab === 'Cowork Space Payments'" class="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <coworkspacepayments />
      </div>
    </div>
  </div>
</template>

<script>
import subscriptionPayments from "../subscriptions/SubscriptionPayment/view.vue";
import rentPayments from "../rent/RentPayments.vue";
import salesPayments from "../SalesPayment/view.vue";
import coworkspacepayments from "../workspacePayment/view.vue";

export default {
  components: {
    rentPayments,
    salesPayments,
    subscriptionPayments,
    coworkspacepayments,
  },
  data() {
    return {
      activeTab: "Subscription Payments",
      tabs: [
        "Subscription Payments",
        "Sales Payments",
        "Rent Payments",
        "Cowork Space Payments",
      ],
    };
  },
};
</script>
