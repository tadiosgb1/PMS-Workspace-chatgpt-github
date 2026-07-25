<template>
  <div>
    <Toast ref="toast" />
    <div v-if="visible" class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div class="bg-white w-full max-w-2xl rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">

        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 class="text-base font-black text-gray-800 tracking-tight">Execute Property Sale</h2>
          <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <form @submit.prevent="submitSale" class="space-y-6">

            <!-- Buyer -->
            <div>
              <div class="flex justify-between items-center mb-3">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">1. Buyer Information</p>
                <button type="button" @click="toggleBuyerMode" class="text-xs font-semibold text-gray-500 hover:text-gray-800 transition flex items-center gap-1">
                  <i :class="buyerMode === 'search' ? 'fas fa-plus' : 'fas fa-search'" class="text-xs"></i>
                  {{ buyerMode === 'search' ? 'Create New' : 'Search Existing' }}
                </button>
              </div>

              <div v-if="buyerMode === 'search'" class="relative">
                <input v-model="buyerSearch" @input="fetchBuyers" @focus="buyerDropdown = true" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" placeholder="Type name or phone..." />
                <ul v-if="buyerDropdown && buyers.length" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                  <li v-for="u in buyers" :key="u.id" @mousedown.prevent="selectBuyer(u)" class="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm flex justify-between border-b border-gray-100 last:border-0">
                    <span class="font-medium">{{ u.first_name }} {{ u.last_name }}</span>
                    <span class="text-xs text-gray-400">{{ u.phone_number }}</span>
                  </li>
                </ul>
              </div>

              <div v-else class="grid grid-cols-3 gap-3">
                <input v-model="buyer.first_name" placeholder="First Name" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
                <input v-model="buyer.middle_name" placeholder="Middle Name" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
                <input v-model="buyer.last_name" placeholder="Last Name" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
                <input v-model="buyer.email" placeholder="Email" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
                <input v-model="buyer.phone_number" placeholder="Phone" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
                <input v-model="buyer.password" type="password" placeholder="Password" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
            </div>

            <!-- Broker -->
            <div>
              <div class="flex justify-between items-center mb-3">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">2. Broker Information</p>
                <button type="button" @click="toggleBrokerMode" class="text-xs font-semibold text-gray-500 hover:text-gray-800 transition flex items-center gap-1">
                  <i :class="brokerMode === 'search' ? 'fas fa-plus' : 'fas fa-search'" class="text-xs"></i>
                  {{ brokerMode === 'search' ? 'Create New' : 'Search Existing' }}
                </button>
              </div>

              <div v-if="brokerMode === 'search'" class="relative">
                <input v-model="brokerSearch" @input="fetchBrokers" @focus="brokerDropdown = true" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" placeholder="Search brokers..." />
                <ul v-if="brokerDropdown && brokers.length" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                  <li v-for="u in brokers" :key="u.id" @mousedown.prevent="selectBroker(u)" class="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-0 font-medium">
                    {{ u.first_name }} {{ u.last_name }}
                  </li>
                </ul>
              </div>

              <div v-else class="grid grid-cols-3 gap-3">
                <input v-model="broker.first_name" placeholder="First Name" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
                <input v-model="broker.last_name" placeholder="Last Name" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
                <input v-model="broker.email" placeholder="Email" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
            </div>

            <!-- Payment -->
            <div class="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-4">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">3. Payment</p>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block mb-1 text-xs font-semibold text-gray-600">Method <span class="text-red-400">*</span></label>
                  <select v-model="payment_method" required class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
                    <option value="">Select</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>
                <div>
                  <label class="block mb-1 text-xs font-semibold text-gray-600">Transaction Ref <span class="text-red-400">*</span></label>
                  <input v-model="transaction_id" required placeholder="TID-XXXXXX" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
                </div>
              </div>

              <div>
                <label class="block mb-1.5 text-xs font-semibold text-gray-600">Slip Picture <span class="text-red-400">*</span></label>
                <label class="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition">
                  <i class="fas fa-cloud-upload-alt text-gray-300 text-xl mb-1"></i>
                  <span class="text-[10px] font-semibold text-gray-400 uppercase">Upload Receipt</span>
                  <input type="file" class="hidden" accept="image/*" @change="e => slip_picture = e.target.files[0]" required />
                </label>
              </div>
            </div>

          </form>
        </div>

        <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button @click="submitSale" :disabled="loading" class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50">
            <svg v-if="loading" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
            <i v-else class="fas fa-check text-xs"></i>
            {{ loading ? "Processing..." : "Complete Sale" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: { visible: Boolean, listing: Object },
  data() {
    return {
      loading: false, slip_picture: null,
      buyerMode: "search", brokerMode: "search",
      buyers: [], buyerSearch: "", buyerDropdown: false, selectedBuyer: null,
      brokers: [], brokerSearch: "", brokerDropdown: false, selectedBroker: null,
      buyer: { first_name: "", middle_name: "", last_name: "", email: "", phone_number: "", address: "", password: "", plan: 1, start_date: new Date() },
      broker: { first_name: "", middle_name: "", last_name: "", email: "", phone_number: "", address: "", password: "", start_date: new Date() },
      payment_method: "", transaction_id: "",
    };
  },
  methods: {
    toggleBuyerMode() { this.buyerMode = this.buyerMode === "search" ? "add" : "search"; this.selectedBuyer = null; },
    toggleBrokerMode() { this.brokerMode = this.brokerMode === "search" ? "add" : "search"; this.selectedBroker = null; },
    async fetchBuyers() { const res = await this.$apiGet("/get_users", { search: this.buyerSearch, is_owner: true }); this.buyers = res.data || []; },
    selectBuyer(u) { this.selectedBuyer = u; this.buyerSearch = `${u.first_name} ${u.last_name}`; this.buyerDropdown = false; },
    async fetchBrokers() { const res = await this.$apiGet("/get_users", { search: this.brokerSearch, is_broker: true }); this.brokers = res.data || []; },
    selectBroker(u) { this.selectedBroker = u; this.brokerSearch = `${u.first_name} ${u.last_name}`; this.brokerDropdown = false; },
    async submitSale() {
      if (!this.slip_picture) { alert("Please upload a slip picture"); return; }
      this.loading = true;
      try {
        const buyerId = this.buyerMode === "search" ? this.selectedBuyer.id : (await this.$apiPost("/sign_up", { ...this.buyer, is_owner: true })).id;
        const brokerId = this.brokerMode === "search" ? this.selectedBroker.id : (await this.$apiPost("/sign_up", { ...this.broker, is_broker: true })).id;
        const fd = new FormData();
        fd.append("buyer_id", buyerId);
        fd.append("broker_id", brokerId);
        fd.append("selling_price", this.listing.listing_price);
        fd.append("property_zone_sale_id", this.listing.property_zone_id?.id);
        fd.append("payment_method", this.payment_method);
        fd.append("transaction_id", this.transaction_id);
        fd.append("status", "pending");
        fd.append("slip_picture", this.slip_picture);
        await this.$apiPost("/sell_property", fd, true);
        this.$emit("success"); this.$emit("close");
      } finally { this.loading = false; }
    },
  },
};
</script>
