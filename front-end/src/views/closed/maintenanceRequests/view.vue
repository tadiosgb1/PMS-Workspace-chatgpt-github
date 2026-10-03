<template>
  <div class="pms-brand-page mt-4">
    <Loading :visible="loading" message="Loading maintenance requests..." />

    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('description')">Description</th>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('status')">Status</th>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('requested_at')">Requested At</th>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('resolved_at')">Resolved At</th>
              <th class="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="maint in maintenance" :key="maint.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 text-gray-700">{{ maint.description }}</td>
              <td class="px-4 py-3">
                <span
                  :class="maint.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'"
                  class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                >
                  {{ maint.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-500">{{ maint.requested_at }}</td>
              <td class="px-4 py-3 text-xs text-gray-500">{{ maint.resolved_at || "N/A" }}</td>
              <td class="px-4 py-3 text-center">
                <button
                  @click="confirm = true; selectedId = maint.id"
                  class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition mx-auto"
                >
                  <i class="fas fa-check text-xs"></i> Resolve
                </button>
              </td>
            </tr>
            <tr v-if="maintenance.length === 0">
              <td colspan="5" class="px-4 py-10 text-center text-sm text-gray-400 italic">No maintenance requests found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Confirm Modal -->
    <div v-if="confirm" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
        <p class="text-gray-700 font-semibold mb-5">Do you want to mark this as resolved?</p>
        <div class="flex justify-center gap-3">
          <button @click="confirm = false" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button @click="resolve()" class="flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition">
            <i class="fas fa-check text-xs"></i> OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loading from "@/components/Loading.vue";

export default {
  name: "Maintenance",
  components: { Loading },
  props: { propertyId: Number },
  data() {
    return { maintenance: [], confirm: false, selectedId: null, loading: false };
  },
  mounted() { this.fetchMaintenance(); },
  methods: {
    async fetchMaintenance() {
      this.loading = true;
      try {
        const response = await this.$apiGet("get_maintenance_requests", { property_id__id: this.propertyId });
        this.maintenance = response.data || [];
      } catch (err) { console.error(err); this.maintenance = []; }
      finally { this.loading = false; }
    },
    sortBy(field) {
      if (!this.maintenance) return;
      this.maintenance.sort((a, b) => (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0));
    },
    async resolve() {
      await this.$apiPost("/resolve_maintenance_request", { id: this.selectedId });
      this.confirm = false;
    },
  },
};
</script>
