<template>
  <div class="pms-brand-page">
    <Toast ref="toast" />
    <div v-if="visible" class="fixed inset-0 z-[40] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div class="bg-white w-full max-w-md rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">

        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 class="text-base font-black text-gray-800 tracking-tight">{{ modalTitle }}</h2>
          <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <form id="saleListingForm" @submit.prevent="submitSale" class="space-y-4">
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Listing Price <span class="text-red-400">*</span></label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
                <input v-model="listingPrice" type="number" placeholder="0.00" required class="border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
              <p class="text-[10px] text-gray-400 mt-1">Set the market entry price for this asset listing.</p>
            </div>
          </form>
        </div>

        <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button form="saleListingForm" type="submit" :disabled="loading" class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50">
            <svg v-if="loading" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
            <i v-else class="fas fa-check text-xs"></i>
            {{ loading ? "Submitting..." : "Confirm" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";

export default {
  name: "SaleModal",
  components: { Toast },
  props: {
    visible: Boolean,
    sourceType: { type: String, required: true },
    propertyId: { type: Number, default: null },
    propertyZoneId: { type: Number, default: null },
  },
  data() { return { listingPrice: "", loading: false }; },
  computed: {
    modalTitle() { return this.sourceType === "zone" ? "Add Property Zone for Sale" : "Add Property for Sale"; },
  },
  methods: {
    async submitSale() {
      try {
        this.loading = true;
        const payload = { listing_price: this.listingPrice };
        if (this.sourceType === "zone") payload.property_zone_id = this.propertyZoneId;
        else payload.property_id = this.propertyId;
        const res = await this.$apiPost("/create_property_sale_listing", payload);
        if (res?.error) { this.$root.$refs.toast.showToast(res.error, "error"); }
        else { this.$root.$refs.toast.showToast(`${this.modalTitle} successfully!`, "success"); this.$emit("close"); this.$emit("refresh"); }
      } catch (err) { console.error(err); this.$root.$refs.toast.showToast(err, "error"); }
      finally { this.loading = false; }
    },
  },
};
</script>
