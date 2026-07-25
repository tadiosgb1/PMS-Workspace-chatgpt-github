<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div class="bg-white w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">

        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 class="text-base font-black text-gray-800 tracking-tight">Add Broker</h2>
          <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <form id="brokerForm" @submit.prevent="submitForm" class="space-y-4">

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block mb-1 text-xs font-semibold text-gray-600">First Name <span class="text-red-400">*</span></label>
                <input v-model="form.first_name" type="text" required placeholder="John" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
              <div>
                <label class="block mb-1 text-xs font-semibold text-gray-600">Middle Name</label>
                <input v-model="form.middle_name" type="text" placeholder="(optional)" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
              <div>
                <label class="block mb-1 text-xs font-semibold text-gray-600">Last Name <span class="text-red-400">*</span></label>
                <input v-model="form.last_name" type="text" required placeholder="Doe" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block mb-1 text-xs font-semibold text-gray-600">Email <span class="text-red-400">*</span></label>
                <input v-model="form.email" type="email" required placeholder="broker@example.com" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
              <div>
                <label class="block mb-1 text-xs font-semibold text-gray-600">Phone</label>
                <input v-model="form.phone_number" type="tel" placeholder="+251..." class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
              <div>
                <label class="block mb-1 text-xs font-semibold text-gray-600">Password <span class="text-red-400">*</span></label>
                <input v-model="form.password" type="password" required placeholder="••••••••" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
              <div>
                <label class="block mb-1 text-xs font-semibold text-gray-600">License Number <span class="text-red-400">*</span></label>
                <input v-model="form.license_number" type="text" required placeholder="BR-XXXXXX" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
              <div>
                <label class="block mb-1 text-xs font-semibold text-gray-600">Commission Rate (%) <span class="text-red-400">*</span></label>
                <input v-model="form.commission_rate" type="text" required placeholder="e.g. 5.0" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
              <div>
                <label class="block mb-1 text-xs font-semibold text-gray-600">Wallet <span class="text-red-400">*</span></label>
                <input v-model="form.wallet" type="text" required placeholder="Wallet address" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
              </div>
            </div>

            <div class="pt-2 border-t border-gray-100">
              <label class="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
                <input type="checkbox" v-model="form.is_active" class="rounded border-gray-300" /> Active
              </label>
            </div>

          </form>
        </div>

        <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button form="brokerForm" type="submit" :disabled="loading" class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-60">
            <i class="fas fa-check text-xs"></i> {{ loading ? "Saving..." : "Save Broker" }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "AddBrokerModal",
  props: { visible: Boolean },
  data() {
    return {
      loading: false,
      form: { first_name: "", middle_name: "", last_name: "", email: "", phone_number: "", password: "", license_number: "", commission_rate: "", wallet: "", is_active: true, is_staff: false, is_superuser: false, is_broker: true },
    };
  },
  methods: {
    async submitForm() {
      this.loading = true;
      try {
        await this.$apiPost("/sign_up", { ...this.form });
        this.$root.$refs.toast.showToast("Broker created successfully", "success");
        this.$emit("success"); this.$emit("close");
      } catch (e) {
        this.$root.$refs.toast.showToast(e.message || "Failed to create broker", "error");
      } finally { this.loading = false; }
    },
  },
};
</script>
