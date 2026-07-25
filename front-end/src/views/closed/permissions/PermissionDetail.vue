<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-screen">
    <Loading :visible="loading" message="Loading permission..." />

    <div v-if="item.id" class="max-w-lg mx-auto space-y-4">

      <div class="flex items-center gap-3">
        <button @click="$router.back()" class="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition">
          <i class="fas fa-arrow-left text-xs"></i> Back
        </button>
        <h1 class="text-lg font-semibold text-gray-800">Permission Detail</h1>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        <div class="flex items-center px-5 py-3 gap-4">
          <span class="text-xs font-medium text-gray-400 w-28 shrink-0">Name</span>
          <span class="text-sm text-gray-800">{{ item.name }}</span>
        </div>
        <div class="flex items-center px-5 py-3 gap-4">
          <span class="text-xs font-medium text-gray-400 w-28 shrink-0">Codename</span>
          <span class="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{{ item.codename }}</span>
        </div>
        <div class="flex items-center px-5 py-3 gap-4">
          <span class="text-xs font-medium text-gray-400 w-28 shrink-0">Content Type</span>
          <span class="text-sm text-gray-800">{{ item.content_type }}</span>
        </div>
        <div class="flex items-center px-5 py-3 gap-4">
          <span class="text-xs font-medium text-gray-400 w-28 shrink-0">ID</span>
          <span class="text-sm text-gray-400">#{{ item.id }}</span>
        </div>
      </div>

    </div>
    <div v-else-if="!loading" class="text-center py-20 text-sm text-gray-400 italic">Permission not found.</div>
  </div>
</template>

<script>
import Loading from "@/components/Loading.vue";
export default {
  components: { Loading },
  data() { return { item: {}, loading: false }; },
  async mounted() {
    this.loading = true;
    try {
      const res = await this.$apiGetById("/permissions", this.$route.params.id);
      this.item = res || {};
    } catch (e) { console.error(e); } finally { this.loading = false; }
  },
};
</script>
