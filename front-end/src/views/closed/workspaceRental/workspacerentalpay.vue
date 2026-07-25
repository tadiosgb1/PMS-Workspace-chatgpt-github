<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-2xl max-h-[95vh] shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        
        <!-- Header -->
        <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div class="flex items-center gap-3">
           
            <div>
              <h2 class="text-2xl font-black text-gray-800 tracking-tight">Rental Payment</h2>
              <p class="text-gray-500 text-sm">Settle Workspace Balance</p>
            </div>
          </div>
          <button 
            @click="$emit('close')" 
            class="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Tab Navigation -->
        <div class="flex bg-gray-50 border-b border-gray-100 p-2 gap-2">
          <button
            class="flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
            :class="tab === 'manual' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'"
            @click="tab = 'manual'"
          >
            <i class="fas fa-hand-holding-usd"></i> Manual Entry
          </button>
          <button
            class="flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
            :class="tab === 'telebirr' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'"
            @click="tab = 'telebirr'"
          >
            <i class="fas fa-mobile-alt"></i> Telebirr Checkout
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 md:p-8">
          <!-- Manual Payment -->
          <form v-if="tab === 'manual'" id="manualPaymentForm" @submit.prevent="submitPayment" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-xs font-semibold text-gray-500">Amount (ETB) <span class="text-red-500">*</span></label>
                <input v-model="form.amount" type="number" step="0.01" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300 text-lg font-semibold" 
                  placeholder="0.00" required />
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-semibold text-gray-500">Payment Method <span class="text-red-500">*</span></label>
                <select v-model="form.payment_method" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white" required>
                  <option value="">Select Method</option>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="telebirr">Telebirr (Manual)</option>
                </select>
              </div>

              <div class="md:col-span-2 space-y-2">
                <label class="block text-xs font-semibold text-gray-500">Transaction ID / Reference <span class="text-red-500">*</span></label>
                <input v-model="form.transaction_id" type="text" placeholder="e.g. TXN12345678" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" required />
              </div>

              <div class="md:col-span-2 space-y-2">
                <label class="block text-xs font-semibold text-gray-500">Cycle End Date <span class="text-red-500">*</span></label>
                <input v-model="form.cycle_end" type="date" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" required />
              </div>

              <!-- Slip Upload -->
              <div class="md:col-span-2 space-y-2">
                <label class="block text-xs font-semibold text-gray-500">Payment Slip / Receipt</label>
                <div class="border-2 border-dashed border-gray-200 rounded-3xl p-8 hover:border-gray-300 transition-all cursor-pointer bg-gray-50"
                     @click="$refs.fileInput.click()">
                  <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileUpload" />
                  
                  <div v-if="!fileName" class="text-center">
                    <div class="mx-auto w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                      <i class="fas fa-cloud-upload-alt text-2xl text-gray-400"></i>
                    </div>
                    <p class="text-sm text-gray-500 font-medium">Click to upload receipt or slip</p>
                  </div>

                  <div v-else class="flex items-center justify-center gap-3 bg-white border border-emerald-200 rounded-2xl py-3 px-4">
                    <i class="fas fa-image text-emerald-500"></i>
                    <span class="text-sm font-medium text-gray-700 truncate">{{ fileName }}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <!-- Telebirr Tab -->
          <div v-if="tab === 'telebirr'" class="flex flex-col items-center justify-center py-12 space-y-8">
            <div class="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center border border-blue-100">
              <img src="https://teller.telebirr.com.et/teller/img/telebirr_logo.svg" alt="Telebirr" class="w-16 h-16" />
            </div>
            <div class="text-center">
              <h3 class="text-2xl font-black text-gray-800">Telebirr Direct Checkout</h3>
              <p class="text-gray-500 mt-2 max-w-xs">Secure and instant payment.</p>
            </div>

            <div class="w-full max-w-sm space-y-3">
              <label class="block text-center text-xs font-semibold text-gray-500">AMOUNT TO PAY (ETB)</label>
              <input v-model="form.amount" type="number" step="0.01"
                class="w-full text-center text-4xl font-black text-gray-800 bg-gray-50 border border-gray-200 rounded-3xl py-6 focus:outline-none focus:ring-2 focus:ring-blue-200" 
                placeholder="0.00" />
            </div>

            <button @click="startTelebirrCheckout" :disabled="isSaving || !form.amount"
              class="w-full max-w-sm py-4 bg-[#0066b3] hover:bg-[#0055a0] text-white rounded-3xl font-bold text-sm tracking-widest shadow-lg transition-all">
              <span v-if="isSaving">PROCESSING...</span>
              <span v-else>LAUNCH TELEBIRR GATEWAY</span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4">
          <button @click="$emit('close')" class="px-8 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            Cancel
          </button>
          <button v-if="tab === 'manual'" form="manualPaymentForm" type="submit" :disabled="isSaving"
            class="px-10 py-3 bg-gray-900 hover:bg-black text-white rounded-3xl font-semibold flex items-center gap-2 transition-all active:scale-95">
            <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-check"></i>
            {{ isSaving ? 'Processing...' : 'Submit Payment' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "WorkspaceRentalPay",
  props: {
    rentalId: { type: Number, required: true },
    visible: { type: Boolean, required: true },
  },
  data() {
    return {
      tab: "manual",
      isSaving: false,
      fileName: "",
      slipFile: null,
      form: {
        amount: "",
        payment_method: "",
        transaction_id: "",
        cycle_end: "",
        rental: null,        // ← Important: Use "rental" as per backend
        status: "pending",
      },
    };
  },
  watch: {
    rentalId: {
      immediate: true,
      handler(newVal) {
        if (newVal) this.form.rental = newVal;
      },
    },
    visible(val) {
      if (!val) this.resetForm();
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.fileName = file.name;
        this.slipFile = file;
      }
    },

    async submitPayment() {
      if (this.isSaving) return;
      this.isSaving = true;

      try {
        const formData = new FormData();

        // Append all form fields
        Object.keys(this.form).forEach(key => {
          if (this.form[key] !== null && this.form[key] !== "") {
            formData.append(key, this.form[key]);
          }
        });

        // Append file if exists
        if (this.slipFile) {
          formData.append("slip_picture", this.slipFile);
        }
        const headers = { "Content-Type": "multipart/form-data" };

        // Send with multipart/form-data
        await this.$apiPost("/post_rental_payment", formData, headers);

        this.$root.$refs.toast.showToast("Payment recorded successfully", "success");
        this.$emit("success");
        this.$emit("close");
      } catch (error) {
        console.error(error);
        this.$root.$refs.toast.showToast("Failed to record payment", "error");
      } finally {
        this.isSaving = false;
      }
    },

    async startTelebirrCheckout() {
      if (!this.form.amount) {
        this.$root.$refs.toast.showToast("Please enter an amount", "warning");
        return;
      }

      this.isSaving = true;
      try {
        const response = await this.$apiPost("/telebirr_checkout", {
          amount: this.form.amount,
          rental: this.form.rental,
        });

        if (response.checkout_url) {
          window.open(response.checkout_url, "_blank");
          this.$emit("close");
        }
      } catch (error) {
        this.$root.$refs.toast.showToast("Failed to initiate Telebirr checkout", "error");
      } finally {
        this.isSaving = false;
      }
    },

    resetForm() {
      this.form = {
        amount: "",
        payment_method: "",
        transaction_id: "",
        cycle_end: "",
        rental: this.rentalId,
        status: "pending",
      };
      this.fileName = "";
      this.slipFile = null;
      if (this.$refs.fileInput) this.$refs.fileInput.value = "";
      this.tab = "manual";
    },
  },
};
</script>