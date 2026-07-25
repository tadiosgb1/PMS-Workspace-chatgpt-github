
<template>
  <div class="min-h-screen bg-slate-50 p-3 md:p-4">
    <!-- Loading -->
    <Loading :visible="loading" message="Loading Tenant Property..." />

    <!-- Page Header -->
    <div class="max-w-4xl mx-auto bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <div class="bg-gradient-to-r from-dprimary to-primary px-6 py-4 flex items-center gap-3">
        <div class="bg-white/20 p-2 rounded-lg backdrop-blur-md">
          <i class="fas fa-home text-white text-lg"></i>
        </div>
        <div>
          <h1 class="text-xl font-black text-white tracking-tight uppercase">Tenant Property Details</h1>
          <p class="text-white/70 text-xs uppercase tracking-widest font-semibold">Property Information</p>
        </div>
      </div>

      <!-- Detail Cards -->
      <div class="p-6 md:p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Pricing Section -->
          <div class="bg-gradient-to-br from-primary/5 to-dprimary/5 rounded-lg border border-primary/20 p-4">
            <h3 class="text-sm font-black text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <i class="fas fa-dollar-sign"></i> Pricing Information
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                <span class="text-xs font-semibold text-slate-600">Listing Price:</span>
                <span class="text-sm font-black text-slate-800">{{ item.listing_price }}</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                <span class="text-xs font-semibold text-slate-600">Selling Price:</span>
                <span class="text-sm font-black text-slate-800">{{ item.selling_price }}</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-200">
                <span class="text-xs font-semibold text-slate-600">Posting Fee:</span>
                <span class="text-sm font-black text-slate-800">{{ item.posting_fee }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs font-semibold text-slate-600">Payment Slip:</span>
                <span class="text-sm font-mono text-slate-600">{{ item.posting_payment_slip }}</span>
              </div>
            </div>
          </div>

          <!-- Property & Stakeholders Section -->
          <div class="bg-gradient-to-br from-secondary/5 to-orange-100/5 rounded-lg border border-secondary/20 p-4">
            <h3 class="text-sm font-black text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <i class="fas fa-users"></i> Stakeholders
            </h3>
            <div class="space-y-3">
              <div class="pb-2 border-b border-slate-200">
                <span class="text-xs font-semibold text-slate-600">Property:</span>
                <p class="text-sm font-semibold text-slate-800 mt-1">{{ item.property?.name }}</p>
              </div>
              <div class="pb-2 border-b border-slate-200">
                <span class="text-xs font-semibold text-slate-600">Broker:</span>
                <p class="text-sm font-semibold text-slate-800 mt-1">{{ item.broker?.first_name }}</p>
              </div>
              <div class="pb-2 border-b border-slate-200">
                <span class="text-xs font-semibold text-slate-600">Buyer:</span>
                <p class="text-sm font-semibold text-slate-800 mt-1">{{ item.buyer?.first_name || 'N/A' }}</p>
              </div>
              <div>
                <span class="text-xs font-semibold text-slate-600">Status:</span>
                <span :class="[
                  'px-3 py-1 rounded-lg text-[10px] font-black uppercase inline-block mt-2',
                  item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                ]">
                  {{ item.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="mt-6 bg-slate-50 rounded-lg border border-slate-200 p-4">
          <h3 class="text-sm font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <i class="fas fa-info-circle text-primary"></i> Additional Information
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span class="font-semibold text-slate-600">ID:</span>
              <p class="text-slate-800 font-mono">{{ item.id }}</p>
            </div>
            <div>
              <span class="font-semibold text-slate-600">Payment Status:</span>
              <p class="text-slate-800">{{ item.posting_payment_status }}</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex gap-3">
          <button @click="$router.back()" class="px-6 py-2.5 border-2 border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm uppercase tracking-wider">
            <i class="fas fa-arrow-left mr-2"></i>Back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loading from "@/components/Loading.vue";

export default {
  components: { Loading },
  data() {
    return {
      item: {},
      loading: false,
    };
  },
  async mounted() {
    this.loading = true;
    const id = this.$route.params.id;
    try {
      const response = await this.$apiGetById('/tenatproperty', id);
      this.item = response || {};
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  },
};
</script>
