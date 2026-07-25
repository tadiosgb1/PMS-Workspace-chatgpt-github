
<template>
  <div class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl p-8 text-sm transform transition-all duration-300 scale-100 hover:scale-[1.01] max-h-[90vh] overflow-y-auto">
      <!-- Header with gradient accent -->
      <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-primary/20 sticky top-0 bg-white">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-dprimary flex items-center justify-center text-white shadow-lg">
            <i class="fas fa-plus text-lg"></i>
          </div>
          <h2 class="text-xl font-black text-slate-800 tracking-tight uppercase">Add Tenant Property</h2>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all duration-200 flex items-center justify-center font-bold text-xl flex-shrink-0">
          &times;
        </button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-4">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="group">
            <label class="block mb-2 text-xs font-black text-slate-700 uppercase tracking-wider">
              <i class="fas fa-tag text-primary mr-2"></i>Listing Price
            </label>
            <input v-model="form.listing_price" type="text" required class="border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Enter listing price" />
          </div>

          <div class="group">
            <label class="block mb-2 text-xs font-black text-slate-700 uppercase tracking-wider">
              <i class="fas fa-dollar-sign text-primary mr-2"></i>Selling Price
            </label>
            <input v-model="form.selling_price" type="text" required class="border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Enter selling price" />
          </div>

          <div class="group">
            <label class="block mb-2 text-xs font-black text-slate-700 uppercase tracking-wider">
              <i class="fas fa-receipt text-primary mr-2"></i>Posting Fee
            </label>
            <input v-model="form.posting_fee" type="text" required class="border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Enter posting fee" />
          </div>

          <div class="group">
            <label class="block mb-2 text-xs font-black text-slate-700 uppercase tracking-wider">
              <i class="fas fa-file-invoice text-primary mr-2"></i>Payment Slip
            </label>
            <input v-model="form.posting_payment_slip" type="text" required class="border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Enter payment slip" />
          </div>

          <div class="group">
            <label class="block mb-2 text-xs font-black text-slate-700 uppercase tracking-wider">
              <i class="fas fa-home text-primary mr-2"></i>Property
            </label>
            <input v-model="form.property" type="text" required class="border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Enter property" />
          </div>

          <div class="group">
            <label class="block mb-2 text-xs font-black text-slate-700 uppercase tracking-wider">
              <i class="fas fa-user-tie text-primary mr-2"></i>Broker
            </label>
            <input v-model="form.broker" type="text" required class="border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Enter broker" />
          </div>

          <div class="group">
            <label class="block mb-2 text-xs font-black text-slate-700 uppercase tracking-wider">
              <i class="fas fa-user text-primary mr-2"></i>Buyer
            </label>
            <input v-model="form.buyer" type="text" required class="border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Enter buyer" />
          </div>

          <div class="group">
            <label class="block mb-2 text-xs font-black text-slate-700 uppercase tracking-wider">
              <i class="fas fa-images text-primary mr-2"></i>Pictures
            </label>
            <input v-model="form.pictures" type="text" required class="border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Enter pictures" />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white border-t-2 border-slate-100 -mx-8 px-8 py-4">
          <button type="button" @click="$emit('close')" class="px-6 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all text-xs uppercase tracking-wider">
            Cancel
          </button>
          <button type="submit" class="px-6 py-3 bg-gradient-to-r from-primary to-dprimary text-white rounded-xl font-black shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all text-xs uppercase tracking-wider hover:scale-105 active:scale-95">
            <i class="fas fa-check mr-2"></i>Add Property
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
        listing_price: this.data?.listing_price || '',
selling_price: this.data?.selling_price || '',
posting_fee: this.data?.posting_fee || '',
posting_payment_slip: this.data?.posting_payment_slip || '',
property: this.data?.property || '',
broker: this.data?.broker || '',
buyer: this.data?.buyer || '',
pictures: this.data?.pictures || ''
      }
    };
  },
  methods: {
    async submitForm() {
      try {
        if ("Add" === "Add") {
        const res= await this.$apiPost("/tenatproperty", this.form);
        if(res){
           this.$root.$refs.toast.showToast('Added successfully', 'success');
         }

        } else {
         const res= await this.$apiPut("/tenatproperty",this.data.id ,this.form);
         if(res){
           this.$root.$refs.toast.showToast('Edited successfully', 'success');
         }
        }
        this.$emit("saved");
        this.$emit("close");
      } catch (e) { console.error(e); }
    }
  }
}
</script>
