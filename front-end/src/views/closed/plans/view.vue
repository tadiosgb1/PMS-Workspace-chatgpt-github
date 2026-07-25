<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm text-slate-800">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading plans..." />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Subscription Plans</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Pricing & Limitation Logic</p>
      </div>
      <button
        @click="visible = true"
        class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
      >
        <i class="fas fa-plus text-xs"></i> Create New Plan
      </button>
    </div>

    <!-- Search -->
    <div class="mb-4 max-w-sm">
      <input
        v-model="searchTerm"
        type="search"
        placeholder="Search plans by name..."
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
      />
    </div>

    <!-- Desktop Table -->
    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden hidden md:block">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('name')">
                Tier Name <SortIcon field="name" :sort-key="sortKey" :sort-asc="sortAsc" />
              </th>
              <th class="px-4 py-3 text-center">Resource Limits</th>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('price')">
                Price <SortIcon field="price" :sort-key="sortKey" :sort-asc="sortAsc" />
              </th>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('billing_cycle')">
                Billing Cycle <SortIcon field="billing_cycle" :sort-key="sortKey" :sort-asc="sortAsc" />
              </th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="plan in filteredAndSortedPlans"
              :key="plan.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 font-semibold text-gray-800 uppercase tracking-tight">{{ plan.name }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                  <div class="flex flex-col items-center px-3 py-1 bg-blue-50 rounded-lg border border-blue-100" title="Max Locations">
                    <span class="text-[10px] font-bold text-blue-400 uppercase">LOC</span>
                    <span class="text-xs font-black text-blue-700">{{ plan.max_locations }}</span>
                  </div>
                  <div class="flex flex-col items-center px-3 py-1 bg-purple-50 rounded-lg border border-purple-100" title="Max Staff">
                    <span class="text-[10px] font-bold text-purple-400 uppercase">STF</span>
                    <span class="text-xs font-black text-purple-700">{{ plan.max_staff }}</span>
                  </div>
                  <div class="flex flex-col items-center px-3 py-1 bg-amber-50 rounded-lg border border-amber-100" title="Max Users">
                    <span class="text-[10px] font-bold text-amber-400 uppercase">USR</span>
                    <span class="text-xs font-black text-amber-700">{{ plan.max_users }}</span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 font-semibold text-gray-700">{{ plan.price }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold uppercase border border-gray-200">
                  {{ plan.billing_cycle }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button
                    @click="editPlan(plan)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white transition text-xs"
                    title="Edit"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="askDeleteConfirmation(plan)"
                    class="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition text-xs"
                    title="Delete"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAndSortedPlans.length === 0">
              <td colspan="5" class="px-4 py-10 text-center text-sm text-gray-400 italic">No plans found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-3">
      <div
        v-for="plan in filteredAndSortedPlans"
        :key="plan.id"
        class="bg-white border border-gray-100 rounded-lg p-4"
      >
        <div class="flex justify-between items-start mb-3">
          <h2 class="font-semibold text-gray-800 uppercase tracking-tight">{{ plan.name }}</h2>
          <div class="flex gap-1">
            <button
              @click="editPlan(plan)"
              class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white transition text-xs"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              @click="askDeleteConfirmation(plan)"
              class="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition text-xs"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 mb-3">
          <div class="text-center p-2 bg-gray-50 rounded-lg">
            <p class="text-[9px] font-bold text-gray-400 uppercase">Locs</p>
            <p class="font-bold text-gray-700">{{ plan.max_locations }}</p>
          </div>
          <div class="text-center p-2 bg-gray-50 rounded-lg">
            <p class="text-[9px] font-bold text-gray-400 uppercase">Staff</p>
            <p class="font-bold text-gray-700">{{ plan.max_staff }}</p>
          </div>
          <div class="text-center p-2 bg-gray-50 rounded-lg">
            <p class="text-[9px] font-bold text-gray-400 uppercase">Users</p>
            <p class="font-bold text-gray-700">{{ plan.max_users }}</p>
          </div>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-bold text-gray-800">{{ plan.price }}</span>
          <span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold uppercase rounded border border-gray-200">{{ plan.billing_cycle }}</span>
        </div>
      </div>
      <div v-if="filteredAndSortedPlans.length === 0" class="bg-white rounded-lg border border-gray-100 p-10 text-center text-sm text-gray-400 italic">
        No plans found.
      </div>
    </div>

    <!-- Modals -->
    <AddPlan v-if="visible" :visible="visible" @close="visible = false" />

    <ConfirmModal
      v-if="confirmVisible"
      :visible="confirmVisible"
      title="Delete Plan Tier"
      message="Warning: Deleting this plan will affect all future subscriptions for this tier. Are you sure?"
      @confirm="confirmDelete"
      @cancel="confirmVisible = false"
    />

    <UpdatePlan
      v-if="updateVisible"
      :visible="updateVisible"
      :plan="planToEdit"
      @close="updateVisible = false"
      @refresh="fetchPlans"
    />
  </div>
</template>

<script>
import AddPlan from "@/views/closed/plans/add.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import UpdatePlan from "@/views/closed/plans/update.vue";
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";

const SortIcon = {
  props: ["field", "sortKey", "sortAsc"],
  template: `<span class="inline-block ml-1 text-gray-400">
    <svg v-if="sortKey !== field" class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
    <svg v-else-if="sortAsc" class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 13l4 4 4-4m0-6l-4-4-4 4"/></svg>
    <svg v-else class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
  </span>`,
};

export default {
  name: "plansView",
  components: { SortIcon, AddPlan, ConfirmModal, UpdatePlan, Toast, Loading },
  data() {
    return {
      searchTerm: "",
      visible: false,
      confirmVisible: false,
      planToDelete: null,
      updateVisible: false,
      planToEdit: null,
      sortKey: "name",
      sortAsc: true,
      plans: [],
      loading: false,
    };
  },
  computed: {
    filteredAndSortedPlans() {
      const term = this.searchTerm.toLowerCase();
      let filtered = this.plans.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          String(s.price).toLowerCase().includes(term) ||
          s.billing_cycle.toLowerCase().includes(term)
      );
      filtered.sort((a, b) => {
        let res = 0;
        if (a[this.sortKey] < b[this.sortKey]) res = -1;
        if (a[this.sortKey] > b[this.sortKey]) res = 1;
        return this.sortAsc ? res : -res;
      });
      return filtered;
    },
  },
  mounted() {
    const is_super_user = localStorage.getItem("is_superuser");
    if (is_super_user == "true") {
      this.fetchPlans();
    } else {
      this.$router.push({ name: "accessDenied" });
    }
  },
  methods: {
    async fetchPlans() {
      this.loading = true;
      try {
        const response = await this.$apiGet("/get_plans");
        this.plans = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        this.plans = [];
      } finally {
        this.loading = false;
      }
    },
    sortBy(key) {
      this.sortKey === key ? (this.sortAsc = !this.sortAsc) : ((this.sortKey = key), (this.sortAsc = true));
    },
    editPlan(plan) {
      this.planToEdit = plan;
      this.updateVisible = true;
    },
    askDeleteConfirmation(plan) {
      this.planToDelete = plan;
      this.confirmVisible = true;
    },
    async confirmDelete() {
      this.confirmVisible = false;
      try {
        const response = await this.$apiDelete(`/delete_plan/${this.planToDelete.id}`);
        this.$root.$refs.toast.showToast(response.message, "success");
        this.fetchPlans();
      } catch (error) {
        console.error(error);
      }
      this.planToDelete = null;
    },
  },
};
</script>
