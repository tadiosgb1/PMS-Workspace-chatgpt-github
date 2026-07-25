<template>
  <Toast ref="toast" />
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div class="bg-white w-full max-w-2xl rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">

        <!-- Header -->
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 class="text-base font-black text-gray-800 tracking-tight">Upgrade Subscription Plan</h2>
          <button
            @click="$emit('close')"
            class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold"
          >
            &times;
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="loading" class="text-center py-12 text-gray-400 text-sm italic">Loading plans...</div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div
              v-for="plan in plans"
              :key="plan.id"
              class="bg-white border border-gray-100 rounded-lg p-4 flex flex-col justify-between hover:border-gray-300 hover:shadow-sm transition"
            >
              <div class="mb-4">
                <h3 class="font-black text-gray-800 uppercase tracking-tight mb-2">{{ plan.name }}</h3>
                <p class="text-xs text-gray-500 mb-1">Price: <span class="font-semibold text-gray-700">{{ formatPrice(plan.price) }}</span> / {{ plan.billing_cycle }}</p>
                <p class="text-xs text-gray-400">Max Locations: <span class="font-semibold text-gray-600">{{ plan.max_locations }}</span></p>
                <p class="text-xs text-gray-400">Max Staff: <span class="font-semibold text-gray-600">{{ plan.max_staff }}</span></p>
                <p class="text-xs text-gray-400">Max Users: <span class="font-semibold text-gray-600">{{ plan.max_users }}</span></p>
              </div>
              <button
                @click="selectPlan(plan)"
                :disabled="updating"
                class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
              >
                <span v-if="!updating || selectedPlan?.id !== plan.id">
                  <i class="fas fa-arrow-up text-xs mr-1"></i> Select Plan
                </span>
                <span v-else class="flex items-center gap-1">
                  <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Updating...
                </span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script>
import Toast from "@/components/Toast.vue";

export default {
  name: "UpgradeSubscriptionModal",
  components: { Toast },
  props: {
    visible: { type: Boolean, required: true },
    subscriptionId: { type: Number, required: true },
  },
  data() {
    return { plans: [], loading: false, updating: false, selectedPlan: null };
  },
  mounted() { this.fetchPlans(); },
  watch: {
    visible(newVal) { if (newVal) this.fetchPlans(); },
  },
  methods: {
    async fetchPlans() {
      this.loading = true;
      try {
        const response = await this.$apiGet("/get_plans");
        this.plans = response.data;
      } catch (error) {
        console.error("Failed to fetch plans", error);
      } finally {
        this.loading = false;
      }
    },
    formatPrice(amount) {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
    },
    async selectPlan(plan) {
      this.selectedPlan = plan;
      this.updating = true;
      try {
        await this.$apiPost("/update_subscription_plan", {
          subscription_id: this.subscriptionId,
          status: "pending",
          plan_name: plan.name,
        });
        this.$root.$refs.toast.showToast(`Upgraded to ${plan.name} successfully!`, "success");
        this.$emit("plan-upgraded", plan);
        setTimeout(() => this.$emit("close"), 3000);
      } catch (error) {
        console.error("Upgrade failed", error);
        this.$root.$refs.toast.showToast(error.message, "error");
      } finally {
        this.updating = false;
        this.$reloadPage();
      }
    },
  },
};
</script>
