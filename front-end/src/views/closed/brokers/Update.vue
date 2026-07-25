<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div class="bg-white w-full max-w-md rounded-xl shadow-xl flex flex-col">

        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 class="text-base font-black text-gray-800 tracking-tight">Update Broker</h2>
          <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold">&times;</button>
        </div>

        <form id="updateBrokerForm" @submit.prevent="updateBroker" class="p-6 space-y-4">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">License Number</label>
            <input v-model="form.license_number" type="text" placeholder="BR-XXXXXX" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Commission Rate (%)</label>
            <input v-model="form.commission_rate" type="number" placeholder="e.g. 5.0" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Wallet</label>
            <input v-model="form.wallet" type="text" placeholder="Wallet address" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
          </div>
        </form>

        <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button form="updateBrokerForm" type="submit" :disabled="loading" class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-60">
            <i class="fas fa-save text-xs"></i> {{ loading ? "Updating..." : "Update" }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "UpdateBroker",
  props: { visible: { type: Boolean, default: false }, broker: { type: Object, default: null } },
  data() { return { form: { license_number: "", commission_rate: "", wallet: "" }, loading: false }; },
  watch: {
    visible(val) { if (val && this.broker) this.fillForm(this.broker); },
    broker: { handler(v) { if (v && this.visible) this.fillForm(v); }, deep: true },
  },
  methods: {
    fillForm(b) { this.form = { license_number: b.license_number || "", commission_rate: b.commission_rate || "", wallet: b.wallet || "" }; },
    async updateBroker() {
      this.loading = true;
      try {
        await this.$apiPatch("/update_broker_profile", this.broker.id, { ...this.form });
        this.$root.$refs.toast.showToast("Broker updated successfully", "success");
        this.$emit("success"); this.$emit("close");
      } catch (e) {
        this.$root.$refs.toast.showToast(e.message || "Failed to update", "error");
        this.$emit("close");
      } finally { this.loading = false; }
    },
  },
};
</script>
