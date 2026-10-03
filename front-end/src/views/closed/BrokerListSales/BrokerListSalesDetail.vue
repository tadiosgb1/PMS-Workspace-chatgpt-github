<template>
  <div class="pms-brand-page p-6 bg-gray-100 min-h-screen text-sm">
    <Loading :visible="loading" message="Loading sale details..." />

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Broker Sale Details</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Complete Information</p>
      </div>
      <button @click="$router.back()" class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold transition">
        <i class="fas fa-arrow-left text-xs"></i> Back
      </button>
    </div>

    <div v-if="item && !loading" class="bg-white border border-gray-100 rounded-lg p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

        <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Listing Price</p>
          <p class="text-2xl font-black text-gray-800">${{ item.listing_price }}</p>
        </div>

        <div class="bg-green-50 rounded-lg p-4 border border-green-100">
          <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Selling Price</p>
          <p class="text-2xl font-black text-green-600">${{ item.selling_price }}</p>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Posting Fee</p>
          <p class="text-lg font-black text-gray-700">${{ item.posting_fee }}</p>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Payment Status</p>
          <span :class="item.posting_payment_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'" class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase">{{ item.posting_payment_status }}</span>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Property</p>
          <p class="font-semibold text-gray-700">{{ item.property?.name || 'N/A' }}</p>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Broker</p>
          <p class="font-semibold text-gray-700">{{ item.broker?.first_name || 'N/A' }}</p>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Buyer</p>
          <p class="font-semibold text-gray-700">{{ item.buyer?.first_name || 'N/A' }}</p>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Status</p>
          <p class="font-semibold text-gray-700">{{ item.status }}</p>
        </div>

      </div>
    </div>

    <div v-if="!item && !loading" class="bg-white border border-gray-100 rounded-lg p-10 text-center text-sm text-gray-400 italic">
      Sale not found.
    </div>
  </div>
</template>

<script>
import Loading from "@/components/Loading.vue";

export default {
  components: { Loading },
  data() { return { item: {}, loading: false }; },
  async mounted() {
    this.loading = true;
    try {
      const response = await this.$apiGetById("/brokerlistsales", this.$route.params.id);
      this.item = response || {};
    } catch (error) { console.error(error); }
    finally { this.loading = false; }
  },
};
</script>
