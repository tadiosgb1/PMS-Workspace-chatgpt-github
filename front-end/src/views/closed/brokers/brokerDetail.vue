<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm">
    <Toast ref="toast" />

    <div v-if="loading" class="text-center text-gray-400 py-16 italic">Loading broker...</div>
    <div v-else-if="broker" class="max-w-xl mx-auto bg-white border border-gray-100 rounded-lg p-6">
      <div class="mb-5 pb-4 border-b border-gray-100">
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Broker Details</h1>
      </div>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">ID</p>
          <p class="font-medium text-gray-700">{{ broker.id }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Name</p>
          <p class="font-medium text-gray-700">{{ broker.name }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Email</p>
          <p class="font-medium text-gray-700">{{ broker.email }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Phone</p>
          <p class="font-medium text-gray-700">{{ broker.phone }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Company</p>
          <p class="font-medium text-gray-700">{{ broker.company }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Created At</p>
          <p class="font-medium text-gray-700">{{ broker.created_at }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";

export default {
  name: "BrokerDetail",
  components: { Toast },
  data() { return { broker: null, loading: false }; },
  mounted() { this.fetchBroker(); },
  methods: {
    async fetchBroker() {
      this.loading = true;
      try {
        const res = await this.$apiGet(`/get_broker/${this.$route.params.id}`);
        this.broker = res.data || res;
      } catch (err) { console.error(err); }
      finally { this.loading = false; }
    },
  },
};
</script>
