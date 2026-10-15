<template>
  <div class="pms-brand-page p-6 bg-gray-100 min-h-screen text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading workspace rentals..." />

    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Workspace Rentals</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
          Guest Management & Occupancy
          <span v-if="workspace_id" class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold normal-case">
            Space #{{ workspace_id }}
          </span>
        </p>
      </div>
      <button @click="showAddRental = true" class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
        <i class="fas fa-plus text-xs"></i> Add Rental
      </button>
    </div>

    <div class="mb-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-sm font-bold text-gray-800">Filter workspace rentals</h2>
          <p class="mt-1 text-xs text-gray-500">Filter by start date and next due date, then apply your selections.</p>
        </div>
        <div class="mt-2 flex items-center gap-2 sm:mt-0">
          <label for="rental-page-size" class="whitespace-nowrap text-xs font-medium text-gray-500">Rows per page</label>
          <select id="rental-page-size" v-model="pageSize" @change="currentPage = 1; fetchRentals()" class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
            <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
          </select>
          <span class="whitespace-nowrap text-xs text-gray-500">Total: <strong class="text-gray-700">{{ rentals.length }}</strong></span>
        </div>
      </div>

      <div class="mb-4">
        <label for="rental-search" class="mb-1.5 block text-xs font-semibold text-gray-600">Search</label>
        <input id="rental-search" v-model="searchTerm" type="search" placeholder="Search by guest or space…" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200" />
      </div>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div class="rounded-lg border border-gray-100 bg-gray-50/70 p-3 sm:p-4">
          <h3 class="mb-3 text-xs font-bold uppercase tracking-wide text-gray-700">Start date</h3>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><label for="start-date-exact" class="mb-1 block text-xs font-medium text-gray-600">Exact date</label><input id="start-date-exact" v-model="filters.start_date" type="date" class="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" /></div>
            <div><label for="start-date-gt" class="mb-1 block text-xs font-medium text-gray-600">After (greater than)</label><input id="start-date-gt" v-model="filters.start_date__gt" type="date" class="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" /></div>
            <div><label for="start-date-gte" class="mb-1 block text-xs font-medium text-gray-600">On or after</label><input id="start-date-gte" v-model="filters.start_date__gte" type="date" class="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" /></div>
            <div><label for="start-date-lt" class="mb-1 block text-xs font-medium text-gray-600">Before (less than)</label><input id="start-date-lt" v-model="filters.start_date__lt" type="date" class="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" /></div>
            <div><label for="start-date-lte" class="mb-1 block text-xs font-medium text-gray-600">On or before</label><input id="start-date-lte" v-model="filters.start_date__lte" type="date" class="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" /></div>
          </div>
        </div>
        <div class="rounded-lg border border-gray-100 bg-gray-50/70 p-3 sm:p-4">
          <h3 class="mb-3 text-xs font-bold uppercase tracking-wide text-gray-700">Next due date</h3>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><label for="due-date-exact" class="mb-1 block text-xs font-medium text-gray-600">Exact date</label><input id="due-date-exact" v-model="filters.next_due_date" type="date" class="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" /></div>
            <div><label for="due-date-gt" class="mb-1 block text-xs font-medium text-gray-600">After (greater than)</label><input id="due-date-gt" v-model="filters.next_due_date__gt" type="date" class="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" /></div>
            <div><label for="due-date-gte" class="mb-1 block text-xs font-medium text-gray-600">On or after</label><input id="due-date-gte" v-model="filters.next_due_date__gte" type="date" class="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" /></div>
            <div><label for="due-date-lt" class="mb-1 block text-xs font-medium text-gray-600">Before (less than)</label><input id="due-date-lt" v-model="filters.next_due_date__lt" type="date" class="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" /></div>
            <div><label for="due-date-lte" class="mb-1 block text-xs font-medium text-gray-600">On or before</label><input id="due-date-lte" v-model="filters.next_due_date__lte" type="date" class="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" /></div>
          </div>
        </div>
      </div>

      <div class="mt-5 flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs text-gray-400">Date filters are sent to the rental list endpoint.</p>
        <div class="flex flex-col gap-2 sm:flex-row">
          <button type="button" @click="clearFilters" class="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto">Clear Filters</button>
          <button type="button" @click="applyFilters" class="inline-flex w-full items-center justify-center rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:w-auto"><i class="fas fa-filter mr-2 text-xs"></i>Apply Filters</button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('guest_name')">
                Guest Info <SortIcon field="guest_name" :sort-key="sortKey" :sort-asc="sortAsc" />
              </th>
              <th class="px-4 py-3 text-left">Contact Details</th>
              <th class="px-4 py-3 text-left">Session Details</th>
              <th class="px-4 py-3 text-left">Assigned Space</th>
              <th class="px-4 py-3 text-left">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="rental in filteredAndSortedRentals" :key="rental.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="font-semibold text-gray-800">{{ rental.guest_name }}</div>
                <div class="text-xs text-gray-400">By {{ rental.user.first_name }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2 text-xs text-gray-600">
                    <i class="fas fa-envelope text-gray-400 w-3"></i> {{ rental.guest_email }}
                  </div>
                  <div class="flex items-center gap-2 text-xs text-gray-600">
                    <i class="fas fa-phone text-gray-400 w-3"></i> {{ rental.guest_phone }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-xs font-semibold text-gray-700 uppercase">{{ rental.cycle }}</div>
                <div class="text-xs text-gray-500">Started: {{ rental.start_date }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <span class="text-xs font-semibold text-gray-700">{{ rental.space.name || rental.space }}</span>
                  <button @click="goToSpaceDetail(rental.space.id)" class="text-blue-600 hover:scale-110 transition-transform">
                    <i class="fas fa-external-link-alt text-xs"></i>
                  </button>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  :class="rental.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'"
                  class="px-3 py-1 rounded-full text-xs font-semibold uppercase inline-block"
                >
                  {{ rental.is_active ? "Active" : "Inactive" }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button v-if="rental.is_active" @click="openPaymentModal(rental.id)" class="px-3 h-7 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition text-[10px] font-semibold uppercase">
                    Pay
                  </button>
                  <button @click="goToPayments(rental.id)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition text-xs" title="View History">
                    <i class="fas fa-history"></i>
                  </button>
                  <button @click="editRental(rental)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white transition text-xs" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="askDeleteConfirmation(rental)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition text-xs" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAndSortedRentals.length === 0 && !loading">
              <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-400 italic">No workspace rentals found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of <span class="font-semibold text-gray-700">{{ totalPages }}</span></span>
      <div class="flex gap-2">
        <button :disabled="!previous" @click="fetchRentals(previous)" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <button :disabled="!next" @click="fetchRentals(next)" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <AddRental :visible="showAddRental" @close="showAddRental = false" @success="fetchRentals" />
    <WorkspaceRentalUpdate :visible="updateVisible" :rental="rentalToEdit" @close="updateVisible = false" @refresh="fetchRentals" />
    <ConfirmModal :visible="confirmVisible" title="Confirm Deletion" message="Are you sure you want to delete this rental contract?" @confirm="confirmDelete" @cancel="confirmVisible = false" />
<WorkspaceRentalPay 
  v-if="paymentVisible" 
  :visible="paymentVisible" 
  :rentalId="selectedRentalId" 
  @close="paymentVisible = false" 
  @success="fetchRentals" 
/>
 </div>
</template>


<script>
import Toast from "@/components/Toast.vue";
import AddRental from "./add.vue";
import WorkspaceRentalUpdate from "./update.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import WorkspaceRentalPay from "./workspacerentalpay.vue";
import Loading from "@/components/Loading.vue"; // <-- Added Loading

const SortIcon = {
  props: ["field", "sortKey", "sortAsc"],
  template: `<span class="inline-block ml-1 text-gray-400">
    <svg v-if="sortKey !== field" class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
    <svg v-else-if="sortAsc" class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 13l4 4 4-4m0-6l-4-4-4 4"/></svg>
    <svg v-else class="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
  </span>`,
};

export default {
  name: "WorkspaceRentalView",
  components: { Toast, AddRental, WorkspaceRentalUpdate, ConfirmModal, WorkspaceRentalPay, SortIcon,Loading },
  data() {
    return {
      searchTerm: "",
      rentals: [],
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
      pageSize: 10,
      pageSizes: [5, 10, 20, 50, 100],
      showAddRental: false,
      updateVisible: false,
      rentalToEdit: null,
      confirmVisible: false,
      rentalToDelete: null,
      paymentVisible: false,
      selectedRentalId: null,
      sortKey: "guest_name",
      sortAsc: true,
      loading: false,
      workspace_id: null,       // set from ?workspace_id= query param
      filters: {
        start_date: "",
        start_date__gt: "",
        start_date__gte: "",
        start_date__lt: "",
        start_date__lte: "",
        next_due_date: "",
        next_due_date__gt: "",
        next_due_date__gte: "",
        next_due_date__lt: "",
        next_due_date__lte: "",
      },
    };
  },
  computed: {
    filteredAndSortedRentals() {
      const term = this.searchTerm.toLowerCase();
      return this.rentals
        .filter(
          (r) =>
            r.guest_name.toLowerCase().includes(term) ||
            r.guest_email.toLowerCase().includes(term) ||
            r.guest_phone.toLowerCase().includes(term) ||
            r.cycle.toLowerCase().includes(term) ||
            r.start_date.toLowerCase().includes(term) ||
            String(r.is_active).toLowerCase().includes(term) ||
            String(r.space?.name || r.space).toLowerCase().includes(term)
        )
        .sort((a, b) => {
          let aVal = a[this.sortKey];
          let bVal = b[this.sortKey];
          if (typeof aVal === "string") aVal = aVal.toLowerCase();
          if (typeof bVal === "string") bVal = bVal.toLowerCase();
          if (aVal < bVal) return this.sortAsc ? -1 : 1;
          if (aVal > bVal) return this.sortAsc ? 1 : -1;
          return 0;
        });
    },
  },
  mounted() {
    // Pick up ?workspace_id= from the browser URL and use it to filter
    if (this.$route.query.workspace_id) {
      this.workspace_id = this.$route.query.workspace_id;
    }
    this.fetchRentals();
  },
  methods: {
    goToSpaceDetail(id) {
      this.$router.push(`/co-work-detail/${id}`);
    },
    openPaymentModal(rentalId) {
      this.selectedRentalId = rentalId;
      this.paymentVisible = true;
    },
    applyFilters() {
      this.currentPage = 1;
      this.fetchRentals();
    },
    clearFilters() {
      this.searchTerm = "";
      Object.keys(this.filters).forEach((key) => { this.filters[key] = ""; });
      this.currentPage = 1;
      this.fetchRentals();
    },
    async fetchRentals(url = null) {
      this.loading = true;
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("page", String(this.currentPage));
        queryParams.set("page_size", String(this.pageSize));
        if (this.workspace_id) queryParams.set("space__id", String(this.workspace_id));
        Object.entries(this.filters).forEach(([key, value]) => {
          if (value) queryParams.set(key, value);
        });

        // Keep active filters when moving through next/previous result pages.
        let apiUrl = url;
        if (!apiUrl) {
          apiUrl = `/get_workspace_rentals?${queryParams.toString()}`;
        } else {
          const separator = apiUrl.includes("?") ? "&" : "?";
          const extraParams = new URLSearchParams();
          if (this.workspace_id && !apiUrl.includes("space__id=")) extraParams.set("space__id", String(this.workspace_id));
          Object.entries(this.filters).forEach(([key, value]) => {
            if (value && !apiUrl.includes(`${encodeURIComponent(key)}=`)) extraParams.set(key, value);
          });
          const extraQuery = extraParams.toString();
          if (extraQuery) apiUrl += separator + extraQuery;
        }

        const response = await this.$apiGet(apiUrl, {});
        this.rentals = response.data?.results || response.data || response.rentals || [];
        this.currentPage = response.current_page || response.currentPage || 1;
        this.totalPages = response.total_pages || response.totalPages || 1;
        this.next = response.next || null;
        this.previous = response.previous || null;
      } catch (err) {
        console.error("Failed to fetch rentals:", err);
        this.rentals = [];
      } finally {
        this.loading = false;
      }
    },
    sortBy(key) {
      if (this.sortKey === key) this.sortAsc = !this.sortAsc;
      else this.sortKey = key;
    },
    editRental(rental) {
      this.rentalToEdit = rental;
      this.updateVisible = true;
    },
    askDeleteConfirmation(rental) {
      this.rentalToDelete = rental;
      this.confirmVisible = true;
    },
    async confirmDelete() {
      this.confirmVisible = false;
      try {
        await this.$apiDelete(`/delete_workspace_rental/${this.rentalToDelete.id}`);
        this.$root.$refs.toast.showToast("Rental deleted successfully", "success");
        this.fetchRentals();
      } catch (err) {
        console.error(err);
        this.$refs.toast.showToast("Failed to delete rental", "error");
      } finally {
        this.rentalToDelete = null;
      }
    },
    goToPayments(rental_id) {
      this.$router.push({
        name: "coworking-payments-detail",
        params: { id: rental_id },
      });
    },
  },
};
</script>
