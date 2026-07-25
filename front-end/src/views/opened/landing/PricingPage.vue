<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <NavBar />
    <div class="h-24"></div>

    <main class="flex-1">

      <!-- Page header -->
      <div class="bg-white border-b border-slate-100">
        <div class="max-w-4xl mx-auto px-6 py-14 text-center">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Transparent Pricing</p>
          <h1 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Choose the plan that fits your portfolio
          </h1>
          <p class="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            No hidden fees. Scale up or down at any time. Every plan includes full access to the Alpha PMS core platform.
          </p>
        </div>
      </div>

      <!-- Plans -->
      <div class="max-w-5xl mx-auto px-6 py-16">

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-24 gap-3 text-slate-400">
          <div class="w-4 h-4 border-2 border-slate-200 border-t-primary rounded-full animate-spin"></div>
          <span class="text-xs font-semibold uppercase tracking-widest">Loading plans…</span>
        </div>

        <!-- Cards grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          <div
            v-for="(plan, index) in plans"
            :key="plan.id"
            class="relative flex flex-col bg-white border rounded-md cursor-pointer transition-all duration-200"
            :class="index === 1
              ? 'border-primary ring-1 ring-primary'
              : 'border-slate-200 hover:border-slate-300'"
            @click="selectPlan(plan)"
          >
            <!-- Popular tag -->
            <div v-if="index === 1" class="absolute -top-3 left-1/2 -translate-x-1/2">
              <span class="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>

            <div class="p-7 flex flex-col flex-1">

              <!-- Name -->
              <div class="mb-5 pb-5 border-b border-slate-100">
                <h3 class="text-base font-bold text-slate-900">{{ plan.name }}</h3>
                <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">{{ plan.billing_cycle }}</p>
              </div>

              <!-- Price -->
              <div class="mb-6">
                <div class="flex items-baseline gap-1">
                  <span class="text-4xl font-black text-slate-900 tracking-tight">{{ plan.price.toLocaleString() }}</span>
                  <span class="text-sm font-semibold text-slate-400">ETB</span>
                </div>
                <div v-if="plan.original_price && plan.original_price > plan.price" class="flex items-center gap-2 mt-1.5">
                  <span class="text-xs text-slate-400 line-through">{{ plan.original_price.toLocaleString() }} ETB</span>
                  <span class="text-[9px] font-bold bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded">
                    Save {{ Math.round(((plan.original_price - plan.price) / plan.original_price) * 100) }}%
                  </span>
                </div>
              </div>

              <!-- Features -->
              <ul class="space-y-3 flex-1 mb-7">
                <li class="flex items-center justify-between text-xs">
                  <span class="flex items-center gap-2 text-slate-600">
                    <i class="fas fa-building text-slate-400 w-3 text-center"></i>
                    Locations
                  </span>
                  <span class="font-bold text-slate-800">{{ plan.max_locations }}</span>
                </li>
                <li class="flex items-center justify-between text-xs">
                  <span class="flex items-center gap-2 text-slate-600">
                    <i class="fas fa-user-tie text-slate-400 w-3 text-center"></i>
                    Staff seats
                  </span>
                  <span class="font-bold text-slate-800">{{ plan.max_staff }}</span>
                </li>
                <li class="flex items-center justify-between text-xs">
                  <span class="flex items-center gap-2 text-slate-600">
                    <i class="fas fa-users text-slate-400 w-3 text-center"></i>
                    Total users
                  </span>
                  <span class="font-bold text-slate-800">{{ plan.max_users }}</span>
                </li>
              </ul>

              <!-- CTA -->
              <button
                class="w-full py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all duration-150 active:scale-95"
                :class="index === 1
                  ? 'bg-primary hover:bg-dprimary text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'"
              >
                Get Started <i class="fas fa-arrow-right text-[9px] ml-1"></i>
              </button>

            </div>
          </div>
        </div>

        <!-- Bottom note -->
        <p class="text-center text-xs text-slate-400 mt-10">
          All plans include onboarding support. Cancel or change your plan at any time.
        </p>

        <!-- FAQ teaser -->
        <div class="mt-12 bg-white border border-slate-100 rounded-md p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p class="text-sm font-bold text-slate-800">Have questions about pricing?</p>
            <p class="text-xs text-slate-500 mt-0.5">Reach out and our team will help you pick the right plan.</p>
          </div>
          <a
            :href="contactHref"
            @click.prevent="goContact"
            class="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded transition-all"
          >
            <i class="fas fa-envelope text-[10px]"></i> Contact Us
          </a>
        </div>

      </div>
    </main>

    <LandingFooter />
  </div>
</template>

<script>
import axios from "axios";
import NavBar from "./NavBar.vue";
import LandingFooter from "./footer.vue";

export default {
  name: "PricingPage",
  components: { NavBar, LandingFooter },
  data() {
    return {
      plans: [],
      loading: false,
    };
  },
  mounted() {
    this.fetchPlans();
  },
  methods: {
    async fetchPlans() {
      this.loading = true;
      try {
        const res = await axios.get("https://alphapms.sunriseworld.org/api/get_plans");
        this.plans = Array.isArray(res.data.data) ? res.data.data : [];
      } catch (e) {
        console.error("Failed to fetch plans", e);
        this.plans = [];
      } finally {
        this.loading = false;
      }
    },
    selectPlan(plan) {
      this.$router.push({ path: "/register", query: { plan: plan.id, name: plan.name } });
    },
    goContact() {
      this.$router.push({ path: "/", hash: "#contact" });
    },
    contactHref() {
      return "/#contact";
    },
  },
};
</script>
