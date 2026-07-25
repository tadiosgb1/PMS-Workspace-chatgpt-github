<template>
  <section id="plans" class="relative bg-white py-28 px-6 overflow-hidden">

    <!-- Background accents -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]"></div>
    </div>

    <div class="max-w-6xl mx-auto relative z-10">

      <!-- Section header -->
      <div class="text-center mb-20">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 mb-6">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Transparent Pricing</span>
        </div>

        <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-5">
          Choose the plan that<br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-dprimary">fits your portfolio.</span>
        </h2>
        <p class="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
          No hidden fees. Scale up or down at any time. Every plan includes full access to the Alpha PMS core platform.
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="flex items-center gap-3 text-slate-400">
          <div class="w-5 h-5 border-2 border-slate-200 border-t-primary rounded-full animate-spin"></div>
          <span class="text-sm font-bold uppercase tracking-widest">Loading plans…</span>
        </div>
      </div>

      <!-- Pricing cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <div
          v-for="(plan, index) in plans"
          :key="plan.id"
          @click="selectPlan(plan)"
          class="pricing-card relative flex flex-col rounded-3xl border cursor-pointer transition-all duration-300"
          :class="index === 1
            ? 'bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/20 scale-[1.03]'
            : 'bg-white border-slate-200 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5'"
        >

          <!-- Popular badge -->
          <div v-if="index === 1" class="absolute -top-4 left-1/2 -translate-x-1/2">
            <span class="inline-flex items-center gap-1.5 bg-primary text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-primary/40">
              <i class="fas fa-star text-[7px]"></i> Most Popular
            </span>
          </div>

          <!-- Selected checkmark overlay -->
          <div
            v-if="selectedPlan === plan.id"
            class="absolute top-4 right-4 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <i class="fas fa-check text-white text-[10px]"></i>
          </div>

          <div class="p-8 flex flex-col flex-grow">

            <!-- Plan name & cycle -->
            <div class="mb-6">
              <h3
                class="text-xl font-black tracking-tight mb-1"
                :class="index === 1 ? 'text-white' : 'text-slate-900'"
              >
                {{ plan.name }}
              </h3>
              <p
                class="text-[10px] font-bold uppercase tracking-[0.18em]"
                :class="index === 1 ? 'text-slate-400' : 'text-slate-400'"
              >
                {{ plan.billing_cycle }}
              </p>
            </div>

            <!-- Price -->
            <div class="mb-8 pb-8" :class="index === 1 ? 'border-b border-slate-700' : 'border-b border-slate-100'">
              <div class="flex items-end gap-1.5">
                <span
                  class="text-5xl font-black tracking-tighter leading-none"
                  :class="index === 1 ? 'text-white' : 'text-slate-900'"
                >
                  {{ plan.price.toLocaleString() }}
                </span>
                <span
                  class="text-sm font-bold mb-1.5"
                  :class="index === 1 ? 'text-slate-400' : 'text-slate-400'"
                >
                  ETB
                </span>
              </div>
              <div v-if="plan.original_price && plan.original_price > plan.price" class="flex items-center gap-2 mt-2">
                <span class="line-through text-sm" :class="index === 1 ? 'text-slate-500' : 'text-slate-300'">
                  {{ plan.original_price.toLocaleString() }} ETB
                </span>
                <span class="text-[9px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Save {{ Math.round(((plan.original_price - plan.price) / plan.original_price) * 100) }}%
                </span>
              </div>
            </div>

            <!-- Features / limits -->
            <div class="space-y-4 flex-grow mb-8">

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    :class="index === 1 ? 'bg-slate-800' : 'bg-slate-50'"
                  >
                    <i class="fas fa-building text-[9px]" :class="index === 1 ? 'text-primary' : 'text-primary'"></i>
                  </div>
                  <span class="text-xs font-bold" :class="index === 1 ? 'text-slate-300' : 'text-slate-600'">Locations</span>
                </div>
                <span class="text-xs font-black" :class="index === 1 ? 'text-white' : 'text-slate-900'">
                  {{ plan.max_locations }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    :class="index === 1 ? 'bg-slate-800' : 'bg-slate-50'"
                  >
                    <i class="fas fa-user-tie text-[9px]" :class="index === 1 ? 'text-secondary' : 'text-secondary'"></i>
                  </div>
                  <span class="text-xs font-bold" :class="index === 1 ? 'text-slate-300' : 'text-slate-600'">Staff Access</span>
                </div>
                <span class="text-xs font-black" :class="index === 1 ? 'text-white' : 'text-slate-900'">
                  {{ plan.max_staff }} seats
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    :class="index === 1 ? 'bg-slate-800' : 'bg-slate-50'"
                  >
                    <i class="fas fa-users text-[9px]" :class="index === 1 ? 'text-slate-300' : 'text-slate-500'"></i>
                  </div>
                  <span class="text-xs font-bold" :class="index === 1 ? 'text-slate-300' : 'text-slate-600'">Total Users</span>
                </div>
                <span class="text-xs font-black" :class="index === 1 ? 'text-white' : 'text-slate-900'">
                  {{ plan.max_users }}
                </span>
              </div>

            </div>

            <!-- CTA button -->
            <button
              class="w-full py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.18em] transition-all duration-300 active:scale-95"
              :class="selectedPlan === plan.id
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : index === 1
                  ? 'bg-white text-slate-900 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/30'
                  : 'bg-slate-900 text-white hover:bg-primary hover:shadow-lg hover:shadow-primary/30'"
            >
              <span class="flex items-center justify-center gap-2">
                <i v-if="selectedPlan === plan.id" class="fas fa-check text-[8px]"></i>
                {{ selectedPlan === plan.id ? 'Selected' : 'Get Started' }}
                <i v-if="selectedPlan !== plan.id" class="fas fa-arrow-right text-[8px]"></i>
              </span>
            </button>

          </div>
        </div>
      </div>

      <!-- Bottom note -->
      <p class="text-center text-xs text-slate-400 font-medium mt-12">
        All plans include onboarding support. Cancel or change your plan at any time.
      </p>

    </div>
  </section>

</template>

<style scoped>
.pricing-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}
.pricing-card:hover {
  transform: translateY(-4px);
}
</style>

<script>
import axios from 'axios';

export default {
  name: 'PlansSection',
  emits: ['plan-selected'],
  data() {
    return {
      selectedPlan: null,
      plans: [],
      loading: false,
    };
  },
  mounted() {
    this.fetchPlans();
  },
  methods: {
    selectPlan(plan) {
      this.selectedPlan = plan.id;
      // Emit up to parent — parent decides whether to open modal or navigate
      this.$emit('plan-selected', { id: plan.id, name: plan.name });
    },
    async fetchPlans() {
      this.loading = true;
      try {
        const response = await axios.get("https://alphapms.sunriseworld.org/api/get_plans");
        if (Array.isArray(response.data.data)) {
          this.plans = response.data.data;
        } else {
          console.warn("Unexpected response format:", response);
          this.plans = [];
        }
      } catch (error) {
        console.error("Failed to fetch plans", error);
        this.plans = [];
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
