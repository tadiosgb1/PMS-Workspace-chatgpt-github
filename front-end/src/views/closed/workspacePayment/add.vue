<template>
  <div>
    <Toast ref="toast" />

    <transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
      >
        <div 
          class="bg-white w-full max-w-[700px] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100"
        >
          <div class="bg-gradient-to-r from-dprimary to-primary px-6 py-5 flex justify-between items-center shadow-md shrink-0">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white/20 rounded-lg">
                <i class="fas fa-receipt text-white text-lg"></i>
              </div>
              <div>
                <h2 class="text-xl font-bold text-white tracking-tight">New Rental Payment</h2>
                <p class="text-white/70 text-[10px] uppercase tracking-widest font-bold">Add Workspace Transaction</p>
              </div>
            </div>
            <button 
              @click="$emit('close')" 
              class="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 text-white hover:bg-white/20 transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 md:p-8">
            <form id="paymentForm" @submit.prevent="submitForm" class="space-y-6">
              
              <div class="relative group">
                <label class="custom-label">Select Guest Rental <span class="custom-star">*</span></label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-primary">
                    <i class="fas fa-user-tag text-xs"></i>
                  </span>
                  <select
                    v-model="form.rental"
                    class="custom-input !mt-0 !pl-10 h-11 appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>Choose a rental session...</option>
                    <option v-for="r in rentals" :key="r.id" :value="r.id">
                      {{ r.guest_name }} — {{ r.space.name }} ({{ r.cycle }})
                    </option>
                  </select>
                  <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none text-[10px]"></i>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-1">
                  <label class="custom-label">Amount (ETB) <span class="custom-star">*</span></label>
                  <input
                    type="number"
                    v-model="form.amount"
                    placeholder="0.00"
                    class="custom-input !mt-0 h-11"
                    required
                  />
                </div>

                <div class="space-y-1">
                  <label class="custom-label">Payment Method <span class="custom-star">*</span></label>
                  <select v-model="form.payment_method" class="custom-input !mt-0 h-11 cursor-pointer">
                    <option value="cash">Cash</option>
                    <option value="telebirr">Telebirr</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div class="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Billing Cycle Period</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-[11px] font-bold text-gray-600">Cycle Start</label>
                    <input type="date" v-model="form.cycle_start" class="custom-input !mt-0 h-10 shadow-sm" required />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[11px] font-bold text-gray-600">Cycle End</label>
                    <input type="date" v-model="form.cycle_end" class="custom-input !mt-0 h-10 shadow-sm" required />
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="custom-label">Payment Slip (Image)</label>
                <div 
                  class="relative border-2 border-dashed border-gray-200 rounded-2xl p-6 transition-all hover:border-primary/50 group bg-gray-50/50 flex flex-col items-center justify-center cursor-pointer"
                  @click="$refs.fileInput.click()"
                >
                  <input 
                    type="file" 
                    ref="fileInput" 
                    class="hidden" 
                    accept="image/*" 
                    @change="handleFileUpload"
                  />
                  
                  <div v-if="!previewUrl" class="text-center">
                    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-2 text-gray-400 group-hover:text-primary transition-colors">
                      <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Click to upload slip</p>
                  </div>

                  <div v-else class="relative w-full">
                    <img :src="previewUrl" class="h-40 w-full object-contain rounded-lg bg-white" />
                    <div class="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p class="text-white text-[10px] font-black uppercase">Change Photo</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div class="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              @click="$emit('close')"
              class="px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button
              form="paymentForm"
              type="submit"
              :disabled="loading"
              class="custom-button !w-auto !px-10 flex items-center gap-2"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-check-circle"></i>
              {{ loading ? "Processing..." : "Confirm Payment" }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "AddRentalPayment",
  props: {
    visible: { type: Boolean, default: false },
  },
  data() {
    return {
      rentals: [],
      loading: false,
      previewUrl: null,
      form: {
        amount: "",
        cycle_start: "",
        cycle_end: "",
        rental: "",
        payment_method: "cash",
        slip_picture: null, // This holds the File object
      },
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.fetchRentals();
        this.resetForm();
      }
    },
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.form.slip_picture = file; // Direct assignment of the File object
        this.previewUrl = URL.createObjectURL(file);
      }
    },

    async fetchRentals() {
      try {
        const res = await this.$apiGet(`/get_workspace_rentals`, { page_size: 1000 });
        this.rentals = res.data || [];
      } catch (err) {
        console.error("Failed to fetch rentals:", err);
      }
    },

    async submitForm() {
      if (this.loading) return;
      this.loading = true;

      try {
        const formData = new FormData();
        
        // Append all text fields
        formData.append("amount", this.form.amount);
        formData.append("cycle_start", this.form.cycle_start);
        formData.append("cycle_end", this.form.cycle_end);
        formData.append("rental_id", this.form.rental);
        formData.append("payment_method", this.form.payment_method);
        
        // Append file if it exists
        if (this.form.slip_picture instanceof File) {
          formData.append("slip_picture", this.form.slip_picture);
        }

        await this.$apiPost("/post_rental_payment", formData);
        
        // Success handling
        if (this.$refs.toast) this.$refs.toast.show("Payment recorded successfully", "success");
        this.$emit("success");
        this.$emit("close");
      } catch (err) {
        console.error("Failed to save rental payment:", err);
        if (this.$refs.toast) this.$refs.toast.show("Error saving payment", "error");
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.form = {
        amount: "",
        cycle_start: "",
        cycle_end: "",
        rental: "",
        payment_method: "cash",
        slip_picture: null,
      };
      this.previewUrl = null;
      if (this.$refs.fileInput) this.$refs.fileInput.value = "";
    },
  },
};
</script>