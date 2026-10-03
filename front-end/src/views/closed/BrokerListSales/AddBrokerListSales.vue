<template>
  <div class="pms-brand-page" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 text-sm max-h-[90vh] overflow-y-auto">

      <div class="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
        <h2 class="text-base font-black text-gray-800 tracking-tight">Add Broker Sale</h2>
        <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold">&times;</button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Listing Price</label>
            <input v-model="form.listing_price" type="text" required placeholder="Enter listing price" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Selling Price</label>
            <input v-model="form.selling_price" type="text" required placeholder="Enter selling price" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Posting Fee</label>
            <input v-model="form.posting_fee" type="text" required placeholder="Enter posting fee" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Status</label>
            <input v-model="form.posting_payment_status" type="text" required placeholder="pending / approved" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Property</label>
            <input v-model="form.property" type="text" required placeholder="Property ID" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Broker</label>
            <input v-model="form.broker" type="text" required placeholder="Broker ID" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Buyer</label>
            <input v-model="form.buyer" type="text" required placeholder="Buyer ID" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</label>
            <input v-model="form.status" type="text" required placeholder="Status" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition">
            <i class="fas fa-check text-xs"></i> Add Sale
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: { data: Object },
  data() {
    return {
      form: {
        listing_price: this.data?.listing_price || "",
        selling_price: this.data?.selling_price || "",
        posting_fee: this.data?.posting_fee || "",
        posting_payment_status: this.data?.posting_payment_status || "",
        property: this.data?.property || "",
        broker: this.data?.broker || "",
        buyer: this.data?.buyer || "",
        status: this.data?.status || "",
      },
    };
  },
  methods: {
    async submitForm() {
      try {
        const res = await this.$apiPost("/post_broker_property_sale", this.form);
        if (res) this.$root.$refs.toast.showToast("Added successfully", "success");
        this.$emit("saved"); this.$emit("close");
      } catch (e) { console.error(e); }
    },
  },
};
</script>
