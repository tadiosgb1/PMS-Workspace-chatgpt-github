<template>
  <div>
    <Toast ref="toast" />
    <div
      v-if="visible"
      class="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="bg-white w-full max-w-[850px] shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 overflow-hidden">
        
        <!-- Header -->
        <div class="px-8 py-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 bg-gray-100 rounded-2xl flex items-center justify-center">
              <i class="fas fa-money-bill-wave text-xl text-gray-700"></i>
            </div>
            <div>
              <h2 class="text-2xl font-black text-gray-800 tracking-tight">Pay Rent</h2>
              <p class="text-gray-500 text-sm">Settlement Processing</p>
            </div>
          </div>
          <button 
            @click="$emit('close')" 
            class="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <form
          @submit.prevent="submitPayment"
          class="flex-1 overflow-y-auto p-8 space-y-8"
          enctype="multipart/form-data"
        >
          <input type="hidden" v-model="form.rent_id" />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <!-- Left Column -->
            <div class="space-y-6">
              <div class="space-y-3">
                <label class="block text-xs font-semibold text-gray-500">Select Billing Cycles</label>
                <div class="border border-gray-200 rounded-2xl p-4 bg-gray-50 max-h-56 overflow-y-auto">
                  <div
                    v-for="cycle in cycles"
                    :key="cycle.id"
                    class="flex items-center gap-3 bg-white p-3 rounded-xl border border-transparent hover:border-gray-300 transition-all cursor-pointer mb-2 last:mb-0"
                  >
                    <input
                      type="checkbox"
                      :value="cycle.id"
                      v-model="form.cycle_ids"
                      class="h-5 w-5 rounded border-gray-300 text-gray-900 focus:ring-gray-300 cursor-pointer"
                    />
                    <span class="text-sm font-medium text-gray-700">
                      {{ cycle.cycle_start }} → {{ cycle.cycle_end }}
                    </span>
                  </div>
                  <div v-if="!cycles.length" class="text-center py-8 text-gray-400 text-sm">
                    No pending cycles available
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-2">Payment Method</label>
                <select
                  v-model="form.payment_method"
                  class="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cbe">CBE</option>
                  <option value="tellbirr">Tele Birr</option>
                </select>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-2">Transaction ID / Reference</label>
                <input
                  v-model="form.transaction_id"
                  type="text"
                  class="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300"
                  placeholder="TXN-000000"
                  required
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-2">Proof of Payment (Slip)</label>
                <label
                  for="slip-upload"
                  class="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                >
                  <input
                    id="slip-upload"
                    type="file"
                    accept="image/*"
                    @change="handleFileUpload"
                    class="hidden"
                  />
                  
                  <div v-if="!form.preview" class="text-center">
                    <i class="fas fa-receipt text-4xl text-gray-300 mb-3"></i>
                    <p class="text-sm font-medium text-gray-500">Click to upload receipt</p>
                  </div>
                  
                  <img v-else :src="form.preview" class="w-full h-full object-cover rounded-3xl" />
                </label>
              </div>
            </div>
          </div>
        </form>

        <!-- Footer -->
        <div class="px-8 py-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-8 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>

          <button
            @click="submitPayment"
            :disabled="loading"
            class="px-10 py-3 bg-gray-900 hover:bg-black text-white rounded-2xl font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            {{ loading ? "Processing..." : "Submit Payment" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "../../../components/Toast.vue";

export default {
  name: "MakePaymentModal",
  components: { Toast },
  props: {
    rentId: { type: Number, required: true },
    visible: { type: Boolean, required: true },
  },
  data() {
    return {
      form: {
        rent_id: this.rentId,
        cycle_ids: [],
        payment_method: "",
        transaction_id: "",
        slip_picture: null,
        preview: null,
      },
      cycles: [],
      loading: false,
    };
  },
  watch: {
    rentId: {
      immediate: true,
      handler(newVal) {
        if (newVal) this.fetchCycles(newVal);
      },
    },
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.form.slip_picture = file;
        this.form.preview = URL.createObjectURL(file);
      }
    },

    async fetchCycles(rentId) {
      try {
        const response = await this.$apiGetById("get_rent_cycles", rentId);
        this.cycles = response.data || [];
      } catch (error) {
        console.error("Failed to fetch cycles:", error);
        this.cycles = [];
      }
    },

    async submitPayment() {
      if (!this.form.cycle_ids.length) {
        this.$root.$refs.toast.showToast("Please select at least one cycle", "error");
        return;
      }

      if (!this.form.slip_picture) {
        this.$root.$refs.toast.showToast("Proof of payment (slip) is required", "error");
        return;
      }

      this.loading = true;
      try {
        const fd = new FormData();
        fd.append("rent_id", this.form.rent_id);
        fd.append("payment_method", this.form.payment_method);
        fd.append("transaction_id", this.form.transaction_id);
        fd.append("slip_picture", this.form.slip_picture);

        this.form.cycle_ids.forEach((id) => fd.append("cycle_ids", id));

        const response = await this.$apiPost("make_payment", fd);

        this.$root.$refs.toast.showToast("Rent paid successfully", "success");
        this.$emit("success", response);
        this.$emit("close");
      } catch (error) {
        console.error(error);
        this.$root.$refs.toast.showToast("Failed to submit payment", "error");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>