
<template>
  <div class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl p-8 text-sm transform transition-all duration-300 scale-100 hover:scale-[1.01] max-h-[90vh] overflow-y-auto">
      <!-- Header with gradient accent -->
      <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-primary/20 sticky top-0 bg-white">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-dprimary flex items-center justify-center text-white shadow-lg">
            <i class="fas fa-plus text-lg"></i>
          </div>
          <h2 class="text-xl font-black text-slate-800 tracking-tight uppercase">Add Tenant Property Sale Request</h2>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all duration-200 flex items-center justify-center font-bold text-xl flex-shrink-0">
          &times;
        </button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-4">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="group">
            <label class="block mb-2 text-xs font-black text-slate-700 uppercase tracking-wider">
              <i class="fas fa-comment text-primary mr-2"></i>Message
            </label>
            <input v-model="form.message" type="text" required class="border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Enter message" />
          </div>

          <div class="group">
            <label class="block mb-2 text-xs font-black text-slate-700 uppercase tracking-wider">
              <i class="fas fa-user text-primary mr-2"></i>Requester
            </label>
            <input v-model="form.requester" type="text" required class="border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Enter requester" />
          </div>

          <div class="group">
            <label class="block mb-2 text-xs font-black text-slate-700 uppercase tracking-wider">
              <i class="fas fa-home text-primary mr-2"></i>Broker Property Sale
            </label>
            <input v-model="form.broker_property_sale" type="text" required class="border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Enter broker property sale" />
          </div>

          <div class="group">
            <label class="block mb-2 text-xs font-black text-slate-700 uppercase tracking-wider">
              <i class="fas fa-info-circle text-primary mr-2"></i>Status
            </label>
            <input v-model="form.status" type="text" required class="border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Enter status" />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white border-t-2 border-slate-100 -mx-8 px-8 py-4">
          <button type="button" @click="$emit('close')" class="px-6 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all text-xs uppercase tracking-wider">
            Cancel
          </button>
          <button type="submit" class="px-6 py-3 bg-gradient-to-r from-primary to-dprimary text-white rounded-xl font-black shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all text-xs uppercase tracking-wider hover:scale-105 active:scale-95">
            <i class="fas fa-check mr-2"></i>Add Request
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
        message: this.data?.message || '',
        requester: this.data?.requester || '',
        broker_property_sale: this.data?.broker_property_sale || '',
        status: this.data?.status || ''
      }
    };
  },
  methods: {
    async submitForm() {
      try {
        if ("Add" === "Add") {
        const res= await this.$apiPost("/post_tenant_property_sale_request", this.form);
        if(res){
           this.$root.$refs.toast.showToast('Added successfully', 'success');
         }

        } else {
         const res= await this.$apiPut("/post_tenant_property_sale_request",this.data.id ,this.form);
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
