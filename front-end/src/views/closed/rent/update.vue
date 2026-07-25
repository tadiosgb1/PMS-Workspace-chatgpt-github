<template>
  <div>
    <Toast ref="toast" />
    <div
      v-if="visible"
      class="fixed inset-0 w-full z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-auto"
    >
      <div
        class="bg-white w-full sm:w-auto sm:max-w-[700px] md:max-w-[850px] lg:max-w-[950px] xl:max-w-[1050px] rounded-lg shadow-lg overflow-hidden relative mx-auto"
      >
        <!-- Header -->
        <div
          class="bg-orange-500 text-white px-6 py-4 text-2xl font-semibold flex justify-between items-center"
        >
          Edit Rent
          <button
            @click="$emit('close')"
            class="text-white hover:text-gray-200 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <!-- Form -->
        <form
          @submit.prevent="submitForm"
          class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto"
        >
          <div>
            <label class="block text-gray-700">Property ID</label>
            <input v-model="form.property_id" type="number" class="custom-input" />
          </div>

          <div>
            <label class="block text-gray-700">User ID</label>
            <input v-model="form.user_id" type="number" class="custom-input" />
          </div>

          <div>
            <label class="block text-gray-700">Rent Type</label>
            <input v-model="form.rent_type" type="text" class="custom-input" />
          </div>

          <div>
            <label class="block text-gray-700">Start Date</label>
            <input v-model="form.start_date" type="date" class="custom-input" />
          </div>

          <div>
            <label class="block text-gray-700">End Date</label>
            <input v-model="form.end_date" type="date" class="custom-input" />
          </div>

          <div>
            <label class="block text-gray-700">Payment Cycle</label>
            <input v-model="form.payment_cycle" type="text" class="custom-input" />
          </div>

          <div>
            <label class="block text-gray-700">Rent Amount</label>
            <input v-model="form.rent_amount" type="number" class="custom-input" />
          </div>

          <div>
            <label class="block text-gray-700">Deposit Amount</label>
            <input v-model="form.deposit_amount" type="number" class="custom-input" />
          </div>

          <div>
            <label class="block text-gray-700">Status</label>
            <input v-model="form.status" type="text" class="custom-input" />
          </div>

          <!-- Buttons -->
          <div class="md:col-span-2 text-right">
            <button
              type="submit"
              class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded shadow"
            >
              Update Rent
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from '@/components/Toast.vue';

export default {
  name: 'UpdateRent',
  components: { Toast },
  props: {
    visible: Boolean,
    rent: Object,
  },
  data() {
    return {
      form: {
        id: null,
        property_id: '',
        user_id: '',
        rent_type: '',
        start_date: '',
        end_date: '',
        payment_cycle: '',
        rent_amount: '',
        deposit_amount: '',
        status: '',
      },
    };
  },
  watch: {
    rent: {
      immediate: true,
      handler(val) {
        if (val) {
          this.form = {
            ...val,
            start_date: val.start_date ? val.start_date.split('T')[0] : '',
            end_date: val.end_date ? val.end_date.split('T')[0] : '',
          };
        }
      },
    },
  },
  methods: {
    async submitForm() {
      try {
        await this.$apiPut(`/update_rent`, this.form.id, this.form);
        this.$root.$refs.toast.showToast("Rent updated successfully", "success");
        setTimeout(() => {
          this.$emit('close');
        }, 3000);
        this.$emit('refresh');
      } catch (err) {
        console.error('Update failed:', err);

       this.$root.$refs.toast.showToast("Update failed", "error");
       // alert('Failed to update rent.');
      }
    },
  },
};
</script>

<style scoped>
.custom-input {
  @apply w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500;
}
</style>
