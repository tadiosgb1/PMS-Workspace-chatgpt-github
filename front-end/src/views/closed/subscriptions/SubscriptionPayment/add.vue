<template>
  <div>
    <Toast ref="toast" />
    <div
      v-if="visible"
      class="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
    >
      <div class="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col relative animate-in zoom-in duration-200 border border-gray-100 overflow-hidden">
        
        <div class="bg-gradient-to-r from-dprimary to-primary px-8 py-6 flex justify-between items-center shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white border border-white/20 backdrop-blur-md">
              <i class="fas fa-credit-card text-lg"></i>
            </div>
            <div>
              <h2 class="text-lg font-black text-white tracking-tight uppercase leading-none">Payment Details</h2>
              <p class="text-white/60 text-[9px] uppercase tracking-[0.2em] font-bold mt-1">Manual Entry Processing</p>
            </div>
          </div>
          <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 text-white hover:bg-white/20 transition-all">
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          
          <div class="space-y-2">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Method</label>
            <div class="relative">
              <select
                v-model="form.payment_method"
                class="w-full pl-5 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary outline-none appearance-none transition-all cursor-pointer"
              >
                <option value="" disabled>Select Method</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="telebirr">Telebirr</option>
                <option value="cbe">CBE</option>
              </select>
              <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none text-xs"></i>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Status</label>
            <div class="flex gap-3">
              <button 
                v-for="status in ['pending', 'completed']" 
                :key="status"
                type="button"
                @click="form.status = status"
                class="flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all"
                :class="form.status === status 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'"
              >
                {{ status }}
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transaction Reference</label>
            <div class="relative">
              <i class="fas fa-hashtag absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
              <input
                v-model="form.transaction_id"
                type="text"
                class="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary outline-none transition-all shadow-sm"
                placeholder="Enter unique ID..."
              />
            </div>
          </div>

        </div>

        <div class="p-8 border-t border-gray-50 flex items-center justify-end gap-4 shrink-0 bg-white rounded-b-[2.5rem]">
          <button
            @click="$emit('close')"
            class="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-rose-500 transition-colors"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            @click="submitPayment"
            class="bg-primary hover:bg-dprimary disabled:bg-gray-200 text-white font-black text-[10px] uppercase tracking-[0.2em] px-10 py-4 rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center gap-3"
            :disabled="loading || !form.payment_method || !form.status || !form.transaction_id"
          >
            <i v-if="loading" class="fas fa-circle-notch animate-spin"></i>
            {{ loading ? 'Processing...' : 'Submit Entry' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
export default {
  name: 'PaymentModal',
  components: { Toast },
  props: {
    visible: Boolean,
    payload: Object,
    subscriptionId:Number
  },
  data() {
    return {
      loading: false,
      form: {
        user_id: 0,
        subscription_id: 0,
        amount: 0,
        payment_method: '',
        status: '',
        transaction_id: '',
      },
    };
  },
  watch: {
    payload: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.form.user_id = newVal.user_id || 0;
          this.form.subscription_id = newVal.subscription_id || 0;
          this.form.amount = newVal.amount || 0;
          // Reset payment fields on new payload
          this.form.payment_method = '';
          this.form.status = '';
          this.form.transaction_id = '';
        }
      },
    },
  },
  methods: {
    async submitPayment() {
      if (
        !this.form.payment_method ||
        !this.form.status ||
        !this.form.transaction_id
      ) {
        this.$root.$refs.toast.showToast('Please fill in all payment fields', 'error');
        return;
      }

      this.loading = true;
      try {
        await this.$apiPost('post_subscription_ayment', this.form);
       //  this.$root.$refs.toast.showToast('Payment  successfully ', 'success');
        this.$emit('paid', this.form);
         setTimeout(() => {
          this.$emit("close");
          this.$emit("refresh");
        }, 3000);
      } catch (err) {
        console.error('Payment failed:', err);
        this.$root.$refs.toast.showToast('Payment failed. Please try again.', 'error');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
