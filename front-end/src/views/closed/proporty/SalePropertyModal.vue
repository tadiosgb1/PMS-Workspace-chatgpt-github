<template>
  <div>
    <Toast ref="toast" />
    <div
      v-if="visible"
      class="fixed inset-0 z-[70] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
    >
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 animate-in zoom-in duration-200">
        
        <div class="bg-gradient-to-r from-emerald-700 to-emerald-500 px-8 py-6 flex justify-between items-center shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
              <i class="fas fa-hand-holding-usd text-lg"></i>
            </div>
            <div>
              <h2 class="text-lg font-black text-white tracking-tight leading-none">Property Sale</h2>
              <p class="text-white/60 text-[10px] uppercase tracking-widest font-bold mt-1">Transaction Management</p>
            </div>
          </div>
          <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 text-white hover:bg-white/20 transition-all">
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>

        <form @submit.prevent="submitSale" class="flex-1 overflow-y-auto p-8 space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            <div class="space-y-1">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Listing Price</label>
              <div class="relative">
                <span class="absolute left-4 top-3.5 text-gray-400 text-xs font-bold">$</span>
                <input
                  v-model="form.listing_price"
                  type="number"
                  class="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div class="space-y-1">
              <label class="block text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Selling Price</label>
              <div class="relative">
                <span class="absolute left-4 top-3.5 text-emerald-400 text-xs font-bold">$</span>
                <input
                  v-model="form.selling_price"
                  type="number"
                  class="w-full pl-8 pr-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transaction Status</label>
            <div class="relative">
              <select
                v-model="form.status"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                required
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="pending">Pending</option>
              </select>
              <i class="fas fa-chevron-down absolute right-4 top-4 text-gray-300 pointer-events-none text-xs"></i>
            </div>
          </div>

          <div class="space-y-6 pt-2">
            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2">Parties Involved</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seller (User ID)</label>
                <input
                  v-model="form.seller"
                  type="number"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>
              <div class="space-y-1">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Buyer (User ID)</label>
                <input
                  v-model="form.buyer"
                  type="number"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Optional"
                />
                <p class="text-[9px] text-gray-400 font-medium mt-1 ml-1 italic">Leave empty if not finalized</p>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white pt-6 pb-2 mt-auto border-t border-gray-50 flex items-center gap-4 shrink-0">
            <button 
              type="button" 
              @click="$emit('close')" 
              class="flex-1 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="loading"
              class="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-black text-[11px] uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-emerald-200 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              <i v-if="loading" class="fas fa-circle-notch animate-spin"></i>
              <i v-else class="fas fa-file-invoice-dollar"></i>
              {{ loading ? 'Processing...' : 'Record Transaction' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SalePropertyModal",
  props: {
    visible: { type: Boolean, default: false },
    propertyId: { type: Number, required: true },
  },
  data() {
    return {
      loading: false,
      form: {
        listing_price: "",
        selling_price: "",
        status: "available",
        seller: localStorage.getItem("userId") || "", // default seller
        buyer: "",
      },
    };
  },
  methods: {
    async submitSale() {
      this.loading = true;
      try {
        const payload = {
          ...this.form,
          property_id: this.propertyId,
        };
        const res = await this.$apiPost("/create_sale_property", payload);
        this.$root.$refs.toast.showToast(res.message || "Property sale created", "success");
        this.$emit("close");
      } catch (err) {
        console.error(err);
        this.$root.$refs.toast.showToast("Failed to create sale", "error");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
