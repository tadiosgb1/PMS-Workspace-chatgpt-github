<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm">
    <Loading :visible="loading" message="Loading brokers..." />

    <!-- Header -->
    <div v-if="$route && $route.name === 'brokers'" class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Brokers</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Manage Real Estate Brokers</p>
      </div>
      <button @click="showAddBroker = true" class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
        <i class="fas fa-plus text-xs"></i> Add Broker
      </button>
    </div>

    <!-- Search + Page Size -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
      <div class="relative flex-1 max-w-sm">
        <input v-model="searchTerm" type="search" placeholder="Search brokers..." @input="onSearchInput" class="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <label class="font-semibold">Show</label>
        <select v-model="pageSize" @change="fetchBrokers" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition cursor-pointer">
          <option v-for="s in pageSizes" :key="s" :value="s">{{ s }}</option>
        </select>
        <span class="font-semibold">entries</span>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('name')">
                Name <SortIcon field="name" :sort-key="sortKey" :sort-asc="sortAsc" />
              </th>
              <th class="px-4 py-3 text-left">Email</th>
              <th class="px-4 py-3 text-left">License</th>
              <th class="px-4 py-3 text-left">Commission</th>
              <th class="px-4 py-3 text-left">Wallet</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="broker in brokers" :key="broker.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {{ ((broker.first_name||'')[0]||'') }}{{ ((broker.last_name||'')[0]||'') }}
                  </div>
                  <span class="font-medium text-gray-800 whitespace-nowrap">
                    {{ [broker.first_name, broker.middle_name, broker.last_name].filter(Boolean).join(' ') || '—' }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs">{{ broker.email || '—' }}</td>
              <td class="px-4 py-3 text-xs text-gray-700">{{ broker.license_number || '—' }}</td>
              <td class="px-4 py-3 text-xs">
                <span class="px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-100 font-semibold">{{ broker.commission_rate }}%</span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-500 italic max-w-[140px] truncate">{{ broker.wallet || '—' }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-1">
                  <button @click="goToDetail(broker.id)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition text-xs"><i class="fas fa-eye"></i></button>
                  <button @click="openUpdateModal(broker)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white transition text-xs"><i class="fas fa-edit"></i></button>
                  <button @click="askDeleteConfirmation(broker)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition text-xs"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            </tr>
            <tr v-if="!brokers.length && !loading">
              <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-400 italic">No brokers found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of <span class="font-semibold text-gray-700">{{ totalPages }}</span></span>
      <div class="flex gap-2">
        <button :disabled="!previous" @click="fetchBrokers(previous)" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <button :disabled="!next" @click="fetchBrokers(next)" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <AddBroker :visible="showAddBroker" @close="showAddBroker = false" @success="fetchBrokers" />
    <UpdateBroker :visible="showUpdateModal" :broker="selectedBroker" @close="showUpdateModal = false" @success="fetchBrokers" />
    <ConfirmModal :visible="confirmVisible" title="Confirm Deletion" message="Are you sure you want to delete this broker?" @confirm="confirmDelete" @cancel="confirmVisible = false" />
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import AddBroker from "./add.vue";
import UpdateBroker from "./Update.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
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
  name: "BrokersView",
  components: { Toast, AddBroker, UpdateBroker, ConfirmModal, SortIcon, Loading },
  data() {
    return {
      searchTerm: "", brokers: [], currentPage: 1, totalPages: 1,
      next: null, previous: null, pageSize: 10, pageSizes: [5, 10, 20, 50, 100],
      showAddBroker: false, showUpdateModal: false, confirmVisible: false,
      brokerToDelete: null, sortKey: "name", sortAsc: true,
      searchTimeout: null, selectedBroker: null, loading: false,
    };
  },
  mounted() { this.fetchBrokers(); },
  methods: {
    goToDetail(id) { this.$router.push({ name: "broker-detail", params: { id } }); },
    openUpdateModal(broker) { this.selectedBroker = { ...broker }; this.showUpdateModal = true; },
    onSearchInput() { clearTimeout(this.searchTimeout); this.searchTimeout = setTimeout(() => this.fetchBrokers(), 300); },
    async fetchBrokers(customUrl = null) {
      this.loading = true;
      try {
        const url = customUrl || "get_broker_profiles";
        const res = await this.$apiGet(url, { user__first_name: this.searchTerm, page_size: this.pageSize });
        const data = res.data || [];
        this.brokers = data.results || data;
        await Promise.all(this.brokers.map(async (broker) => {
          try {
            const u = await this.$apiGetById("/get_user", broker.user);
            broker.user = u.id; broker.first_name = u.first_name; broker.middle_name = u.middle_name; broker.last_name = u.last_name; broker.email = u.email;
          } catch (e) { broker.first_name = ""; broker.last_name = ""; broker.email = ""; }
        }));
        this.currentPage = data.current_page || 1; this.totalPages = data.total_pages || 1;
        this.next = data.next; this.previous = data.previous;
      } catch (e) { console.error(e); this.brokers = []; }
      finally { this.loading = false; }
    },
    sortBy(key) { this.sortKey === key ? (this.sortAsc = !this.sortAsc) : ((this.sortKey = key), (this.sortAsc = true)); },
    askDeleteConfirmation(broker) { this.brokerToDelete = broker; this.confirmVisible = true; },
    async confirmDelete() {
      this.confirmVisible = false;
      try {
        await this.$apiDelete(`/delete_broker/${this.brokerToDelete.id}`);
        this.$root.$refs.toast.showToast("Broker deleted", "success");
        this.fetchBrokers();
      } catch (e) { this.$root.$refs.toast.showToast("Failed to delete broker", "error"); }
      finally { this.brokerToDelete = null; }
    },
  },
};
</script>
