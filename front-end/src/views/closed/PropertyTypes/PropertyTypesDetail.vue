<template>
  <div class="p-4 md:p-6 bg-gray-100 min-h-screen text-sm">
    <Loading :visible="loading" message="Loading property type..." />

    <div v-if="item.id" class="max-w-4xl mx-auto space-y-4">

      <!-- Back + Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$router.back()"
            class="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition">
            <i class="fas fa-arrow-left text-xs"></i> Back
          </button>
          <div class="w-px h-4 bg-gray-300"></div>
          <div>
            <h1 class="text-lg font-black text-gray-800 tracking-tight">{{ item.name }}</h1>
            <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Property Type · ID #{{ item.id }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span :class="item.is_sellable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'"
            class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
            {{ item.is_sellable ? 'Sellable' : 'Not Sellable' }}
          </span>
          <span :class="item.is_rentable ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'"
            class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
            {{ item.is_rentable ? 'Rentable' : 'Not Rentable' }}
          </span>
        </div>
      </div>

      <!-- Main Info Card -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Basic Information</h2>
        </div>
        <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div class="detail-row">
            <span class="detail-label">Name</span>
            <span class="detail-value font-semibold text-gray-800">{{ item.name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Description</span>
            <span class="detail-value text-gray-600">{{ item.description || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Created</span>
            <span class="detail-value">{{ formatDate(item.created_at) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Last Updated</span>
            <span class="detail-value">{{ formatDate(item.updated_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Physical Features -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Physical Features</h2>
        </div>
        <div class="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div v-for="feat in physicalFeatures" :key="feat.key" class="feat-card" :class="item[feat.key] ? 'feat-on' : 'feat-off'">
            <i :class="[feat.icon, 'text-sm']"></i>
            <span class="text-xs font-semibold">{{ feat.label }}</span>
            <span class="ml-auto text-[10px] font-bold uppercase">{{ item[feat.key] ? 'Yes' : 'No' }}</span>
          </div>
        </div>
      </div>

      <!-- Listing Capabilities -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Listing Capabilities</h2>
        </div>
        <div class="p-5 grid grid-cols-2 gap-3">
          <div class="feat-card" :class="item.is_sellable ? 'feat-on' : 'feat-off'">
            <i class="fas fa-tag text-sm"></i>
            <span class="text-xs font-semibold">Is Sellable</span>
            <span class="ml-auto text-[10px] font-bold uppercase">{{ item.is_sellable ? 'Yes' : 'No' }}</span>
          </div>
          <div class="feat-card" :class="item.is_rentable ? 'feat-on' : 'feat-off'">
            <i class="fas fa-home text-sm"></i>
            <span class="text-xs font-semibold">Is Rentable</span>
            <span class="ml-auto text-[10px] font-bold uppercase">{{ item.is_rentable ? 'Yes' : 'No' }}</span>
          </div>
        </div>
      </div>

      <!-- Project Info -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Project Info</h2>
        </div>
        <div class="p-5 space-y-3">

          <!-- Project Completion -->
          <div class="flex items-center justify-between py-2 border-b border-gray-50">
            <div class="flex items-center gap-2 text-xs text-gray-600">
              <i class="fas fa-calendar-check text-gray-400 w-4 text-center"></i>
              <span class="font-medium">Has Project Completion</span>
            </div>
            <div class="flex items-center gap-2">
              <span :class="item.has_project_completion ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                {{ item.has_project_completion ? 'Yes' : 'No' }}
              </span>
              <span v-if="item.has_project_completion && item.project_completion_year"
                class="text-xs font-bold text-gray-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded">
                {{ item.project_completion_year }}
              </span>
            </div>
          </div>

          <!-- Project Status -->
          <div class="flex items-center justify-between py-2 border-b border-gray-50">
            <div class="flex items-center gap-2 text-xs text-gray-600">
              <i class="fas fa-hard-hat text-gray-400 w-4 text-center"></i>
              <span class="font-medium">Has Project Status</span>
            </div>
            <div class="flex items-center gap-2">
              <span :class="item.has_project_status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                {{ item.has_project_status ? 'Yes' : 'No' }}
              </span>
              <span v-if="item.has_project_status && item.project_status"
                :class="item.project_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                {{ item.project_status === 'under_construction' ? 'Under Construction' : 'Completed' }}
              </span>
            </div>
          </div>

          <!-- Pre-handover Payment -->
          <div class="flex items-center justify-between py-2">
            <div class="flex items-center gap-2 text-xs text-gray-600">
              <i class="fas fa-hand-holding-dollar text-gray-400 w-4 text-center"></i>
              <span class="font-medium">Has Pre-handover Payment</span>
            </div>
            <div class="flex items-center gap-2">
              <span :class="item.has_pre_handover_payment ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                {{ item.has_pre_handover_payment ? 'Yes' : 'No' }}
              </span>
              <span v-if="item.pre_handover_payment"
                class="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full uppercase">
                {{ preHandoverLabel(item.pre_handover_payment) }}
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>

    <div v-else-if="!loading" class="text-center py-20 text-sm text-gray-400 italic">
      Property type not found.
    </div>
  </div>
</template>

<script>
import Loading from "@/components/Loading.vue";

export default {
  name: "PropertyTypesDetail",
  components: { Loading },
  data() {
    return {
      item: {},
      loading: false,
      physicalFeatures: [
        { key: 'has_floor',        label: 'Has Floor',        icon: 'fas fa-layer-group' },
        { key: 'has_bedroom',      label: 'Has Bedroom',      icon: 'fas fa-bed' },
        { key: 'has_bathroom',     label: 'Has Bathroom',     icon: 'fas fa-bath' },
        { key: 'has_house_number', label: 'Has House Number', icon: 'fas fa-hashtag' },
        { key: 'has_block_number', label: 'Has Block Number', icon: 'fas fa-th-large' },
        { key: 'has_furnishing',   label: 'Has Furnishing',   icon: 'fas fa-couch' },
      ],
    };
  },
  async mounted() {
    this.loading = true;
    try {
      const response = await this.$apiGetById('/get_property_type', this.$route.params.id);
      this.item = response || {};
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '—';
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    },
    preHandoverLabel(val) {
      const map = {
        under_25:  '< 25%',
        '25_to_50': '25–50%',
        '51_to_75': '51–75%',
        above_75:  '> 75%',
      };
      return map[val] || val;
    },
  },
};
</script>

<style scoped>
.detail-row   { @apply flex flex-col gap-0.5; }
.detail-label { @apply text-[10px] font-bold text-gray-400 uppercase tracking-wider; }
.detail-value { @apply text-sm text-gray-700; }

.feat-card {
  @apply flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors;
}
.feat-on  { @apply bg-gray-800 text-white border-gray-800; }
.feat-off { @apply bg-gray-50 text-gray-400 border-gray-100; }
</style>
