<template>
  <div class="pms-brand-page">
    <Toast ref="toast" />
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div class="bg-white w-full max-w-md rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">

        <!-- Header -->
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 class="text-base font-black text-gray-800 tracking-tight">Payment</h2>
          <button
            @click="$emit('close')"
            class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold"
          >
            &times;
          </button>
        </div>

        <!-- Mode Switch -->
        <div class="flex border-b border-gray-100">
          <button
            @click="mode = 'manual'"
            class="flex-1 py-2.5 text-xs font-semibold transition"
            :class="mode === 'manual' ? 'border-b-2 border-gray-800 text-gray-800' : 'text-gray-400 hover:text-gray-600'"
          >
            Manual Payment
          </button>
          <button
            @click="mode = 'online'"
            class="flex-1 py-2.5 text-xs font-semibold transition"
            :class="mode === 'online' ? 'border-b-2 border-gray-800 text-gray-800' : 'text-gray-400 hover:text-gray-600'"
          >
            Online Payment
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">

          <!-- Manual -->
          <div v-if="mode === 'manual'" class="space-y-4">
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-600">
              <p class="font-semibold text-gray-700 mb-2">Payment Instructions</p>
              <p><span class="font-semibold">CBE Account:</span> 1000 2000 3000</p>
              <p><span class="font-semibold">TeleBirr:</span> +2519-------</p>
            </div>

            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Method</label>
              <select v-model="form.payment_method" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
                <option disabled value="">Select method</option>
                <option value="cash">Cash</option>
                <option value="telebirr">Telebirr</option>
                <option value="cbe">CBE</option>
                <option value="e-birr">E-Birr</option>
              </select>
            </div>

            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction ID</label>
              <input v-model="form.transaction_id" type="text" placeholder="Unique transaction reference" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
            </div>

            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Remark</label>
              <input v-model="form.remark" type="text" placeholder="Remark" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
            </div>

            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Slip Picture</label>
              <input type="file" accept="image/*" @change="handleFileUpload" class="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
            </div>
          </div>

          <!-- Online -->
          <div v-else class="space-y-3">
            <p class="text-xs text-gray-500">Choose an online payment provider:</p>
            <button
              @click="payOnline('arifpay')"
              :disabled="loading"
              class="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
            >
              Pay with SantimPay
            </button>
            <button
              @click="payOnline('telebirr')"
              :disabled="loading"
              class="w-full px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
            >
              Pay with TeleBirr
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button @click="$emit('close')" :disabled="loading" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button v-if="mode === 'manual'" @click="submitPayment" class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition">
            <i class="fas fa-check text-xs"></i> {{ loading ? "Processing..." : "Submit" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";

export default {
  name: "PaymentModal",
  components: { Toast },
  props: { visible: Boolean, payload: Object },
  data() {
    return {
      loading: false,
      mode: "manual",
      form: { user_id: 0, subscription_id: 0, amount: 0, payment_method: "", status: "pending", transaction_id: "", remark: "", slip_picture: null },
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
          this.form.payment_method = "";
          this.form.transaction_id = "";
          this.form.remark = "";
          this.form.slip_picture = null;
        }
      },
    },
  },
  methods: {
    handleFileUpload(e) { this.form.slip_picture = e.target.files[0]; },
    async submitPayment() {
      if (!this.form.payment_method || !this.form.transaction_id || !this.form.slip_picture) {
        this.$root.$refs.toast.showToast("All fields including slip picture are required", "error");
        return;
      }
      this.loading = true;
      try {
        const fd = new FormData();
        fd.append("user_id", this.form.user_id);
        fd.append("subscription_id", this.form.subscription_id);
        fd.append("amount", this.form.amount);
        fd.append("payment_method", this.form.payment_method);
        fd.append("transaction_id", this.form.transaction_id);
        fd.append("remark", this.form.remark);
        fd.append("status", "pending");
        fd.append("slip_picture", this.form.slip_picture);
        await this.$apiPost("post_subscription_ayment", fd, { "Content-Type": "multipart/form-data" });
        this.$emit("paid", this.form);
        setTimeout(() => { this.$emit("close"); this.$emit("refresh"); }, 3000);
      } catch (err) {
        console.error("Payment failed:", err);
        this.$root.$refs.toast.showToast(err.message, "error");
      } finally {
        this.loading = false;
      }
    },
    async payOnline(provider) {
      this.loading = true;
      try {
        this.$root.$refs.toast.showToast(`Redirecting to ${provider}...`, "info");
      } catch (err) {
        this.$root.$refs.toast.showToast(err.message, "error");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
