<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm">

    <div v-if="loading" class="text-center text-gray-400 py-16 italic">Loading subscription...</div>
    <div v-else-if="error" class="text-center text-red-500 py-16">{{ error }}</div>

    <div v-else-if="subscription" class="max-w-xl mx-auto bg-white border border-gray-100 rounded-lg p-6">
      <div class="mb-5 pb-4 border-b border-gray-100">
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Subscription Details</h1>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Plan Name</p>
          <p class="font-semibold text-gray-800">{{ subscription.plan_name }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Price</p>
          <p class="font-semibold text-gray-800">{{ subscription.price }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Billing Cycle</p>
          <p class="text-gray-700">{{ subscription.billing_cycle || "N/A" }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Status</p>
          <span
            :class="{
              'bg-green-100 text-green-700': subscription.status === 'active',
              'bg-amber-100 text-amber-700': subscription.status === 'pending',
              'bg-red-100 text-red-600': subscription.status === 'cancelled',
            }"
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
          >
            {{ subscription.status }}
          </span>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Start Date</p>
          <p class="text-gray-700">{{ formatDate(subscription.start_date) }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">End Date</p>
          <p class="text-gray-700">{{ formatDate(subscription.end_date) }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Created At</p>
          <p class="text-gray-700">{{ formatDate(subscription.created_at) }}</p>
        </div>
      </div>

      <div class="mt-6 pt-4 border-t border-gray-100">
        <button
          @click="goToUserDetail(subscription.user_id)"
          class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition"
        >
          <i class="fas fa-user text-xs"></i> View User
        </button>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return { subscription: null, loading: true, error: null };
  },
  mounted() { this.fetchSubscription(); },
  methods: {
    async fetchSubscription() {
      try {
        const id = this.$route.params.id;
        const res = await this.$apiGetById("/get_subscription", id);
        this.subscription = res;
      } catch (err) {
        console.error(err);
        this.error = "Failed to load subscription details.";
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateStr) { return dateStr ? new Date(dateStr).toLocaleString() : "N/A"; },
    goToUserDetail(id) { this.$router.push(`/user_detail/${id}`); },
  },
};
</script>
