<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
  >
    <div class="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Rent Property</h2>
        <button @click="$emit('close')" class="text-gray-600 hover:text-black">&times;</button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitRent">
        <div class="space-y-4">
          <!-- Rent Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Rent Type</label>
            <select
              v-model="form.rent_type"
              class="w-full mt-1 border rounded px-3 py-2"
              required
            >
              <option value="short_term">Short Term</option>
              <option value="long_term">Long Term</option>
            </select>
          </div>

          <!-- Dates -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              v-model="form.start_date"
              type="date"
              class="w-full mt-1 border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">End Date</label>
            <input
              v-model="form.end_date"
              type="date"
              class="w-full mt-1 border rounded px-3 py-2"
              required
            />
          </div>

          <!-- Payment Cycle -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Payment Cycle</label>
            <select
              v-model="form.payment_cycle"
              class="w-full mt-1 border rounded px-3 py-2"
              required
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <!-- Amounts -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Rent Amount</label>
            <input
              v-model="form.rent_amount"
              type="number"
              class="w-full mt-1 border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Deposit Amount</label>
            <input
              v-model="form.deposit_amount"
              type="number"
              class="w-full mt-1 border rounded px-3 py-2"
            />
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <select
              v-model="form.status"
              class="w-full mt-1 border rounded px-3 py-2"
              required
            >
              <option value="active">Active</option>
              <option value="terminated">Terminated</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            :disabled="loading"
          >
            {{ loading ? 'Saving...' : 'Save Rent' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "RentPropertyModal",
  props: {
    visible: { type: Boolean, default: false },
    propertyId: { type: Number, required: true },
  },
  data() {
    return {
      loading: false,
      form: {
        rent_type: "long_term",
        start_date: "",
        end_date: "",
        payment_cycle: "monthly",
        rent_amount: "",
        deposit_amount: "",
        status: "active",
        user_id: localStorage.getItem("userId") || "", // default user
      },
    };
  },
  methods: {
    async submitRent() {
      this.loading = true;
      try {
        const payload = {
          ...this.form,
          property_id: this.propertyId,
        };
        const res = await this.$apiPost("/create_rent_property", payload);
        this.$root.$refs.toast.showToast(res.message || "Property rent created", "success");
        this.$emit("close");
      } catch (err) {
        console.error(err);
        this.$root.$refs.toast.showToast("Failed to create rent", "error");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
