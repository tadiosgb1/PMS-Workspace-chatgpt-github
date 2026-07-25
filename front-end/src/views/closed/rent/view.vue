<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading rent ledger..." />

    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Rents</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Tenant Occupancy & Financials</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="$router.back()" class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
          <i class="fas fa-arrow-left text-xs"></i>
          Back
        </button>
        <button @click="visible = true" class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <i class="fas fa-plus text-xs"></i> Create Rent
        </button>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3 bg-white p-4 rounded-lg border border-gray-100">
      <div class="relative flex-1 max-w-sm">
        <input 
          v-model="searchTerm"
          @input="onSearch"
          type="search" 
          placeholder="Search tenant or property..." 
          class="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition" 
        />
      </div>

      <div class="flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2 text-gray-500 ml-auto lg:ml-0">
          <label class="font-semibold">Show</label>
          <select v-model="pageSize" @change="fetchRents()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition cursor-pointer">
            <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
          </select>
          <span class="text-gray-400">Total: <span class="font-semibold text-gray-600">{{ rents.length }}</span></span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700 transition" @click="sortBy('property_id')">
                Agreement <SortIcon field="property_id" :sort-key="sortKey" :sort-asc="sortAsc" />
              </th>
              <th class="px-4 py-3 text-left">Timeline</th>
              <th class="px-4 py-3 text-left">Finances</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="rent in rents" :key="rent.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="space-y-1">
                  <button @click="goToPropertyDetail(rent.property_id.id)" class="font-semibold text-gray-800 hover:text-blue-600 transition-colors text-left">
                    {{ rent.property_id?.name || 'N/A' }}
                  </button>
                  <div @click="goToUserDetail(rent.user_id.id)" class="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 cursor-pointer transition-colors">
                    <i class="fas fa-user text-xs"></i>
                    {{ rent.user_id?.first_name }} {{ rent.user_id?.last_name }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-col gap-1">
                  <span class="text-xs font-semibold text-gray-700">{{ new Date(rent.start_date).toLocaleDateString() }}</span>
                  <span class="text-xs text-gray-500">→ {{ new Date(rent.end_date).toLocaleDateString() }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-col gap-1">
                  <span class="font-semibold text-gray-800">{{ rent.rent_amount }} ETB</span>
                  <span class="text-xs text-gray-500 uppercase">{{ rent.payment_cycle }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold uppercase inline-block"
                  :class="rent.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
                >
                  {{ rent.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button @click="selectedRentId = rent.id; showModal = true" class="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition text-xs" title="Pay Rent">
                    <i class="fas fa-credit-card"></i>
                  </button>
                  <button @click="rentDetail(rent.id)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition text-xs" title="View">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click="goToPayments(rent.id)" class="px-3 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-800 hover:text-white transition text-[10px] font-semibold uppercase">
                    Payments
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="rents.length === 0 && !loading">
              <td colspan="5" class="px-4 py-10 text-center text-sm text-gray-400 italic">No rent records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of <span class="font-semibold text-gray-700">{{ totalPages }}</span></span>
      <div class="flex gap-2">
        <button :disabled="!previous" @click="fetchRents(previous)" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <button :disabled="!next" @click="fetchRents(next)" class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <AddPictureModal v-if="addPictureVisible" :visible="addPictureVisible" :rentId="selectedRentId" @close="addPictureVisible = false" @refresh="fetchRents" />
    <MakePaymentModal v-if="showModal" :visible="showModal" :rentId="selectedRentId" @close="showModal = false" @success="handlePaymentSuccess" />
    <AddRent v-if="visible" :propertyId="$route.params.id" :visible="visible" @close="visible = false" @refresh="fetchRents" />
    <UpdateRent v-if="updateVisible" :visible="updateVisible" :rent="rentToEdit" @close="updateVisible = false" @refresh="fetchRents" />
    <ConfirmModal v-if="confirmVisible" :visible="confirmVisible" title="Confirm Deletion" message="Are you sure you want to delete this rent?" @confirm="confirmDelete" @cancel="confirmVisible = false" />
  </div>
</template>

<script>
import AddRent from "@/views/closed/rent/add.vue";
import UpdateRent from "@/views/closed/rent/update.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Toast from "@/components/Toast.vue";
import AddPictureModal from "@/views/closed/rent/addRentPicture.vue";
import MakePaymentModal from "@/views/closed/rent/addRentPayment.vue";
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
  name: "RentsView",
  components: {
    AddRent,
    UpdateRent,
    ConfirmModal,
    Toast,
    AddPictureModal,
    MakePaymentModal,
    Loading,
    SortIcon
  },
  data() {
    return {
      selectedRentId: "",
      addPictureVisible: false,
      searchTerm: "",
      visible: false,
      updateVisible: false,
      confirmVisible: false,
      rentToEdit: null,
      rentToDelete: null,
      sortKey: "property_id",
      sortAsc: true,
      rents: [],
      showModal: false,
      pageSize: 10,
      pageSizes: [5, 10, 20, 50, 100],
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
     loading:false
    };
  },
  computed: {
    filteredAndSortedRents() {
      let sorted = [...this.rents];
      sorted.sort((a, b) => {
        let valA = a[this.sortKey];
        let valB = b[this.sortKey];
        if (this.sortKey === "property_id") {
          valA = a.property_id?.name || "";
          valB = b.property_id?.name || "";
        }
        if (this.sortKey === "user_id") {
          valA = a.user_id?.first_name || "";
          valB = b.user_id?.first_name || "";
        }
        if (valA < valB) return this.sortAsc ? -1 : 1;
        if (valA > valB) return this.sortAsc ? 1 : -1;
        return 0;
      });
      return sorted;
    },
  },
  mounted() {
    this.fetchRents();
  },
  methods: {
    goToPayments(rentId) {
      this.$router.push({ name: "rents_payment_detail", params: { id: rentId } });
    },
    rentDetail(rentId) {
      this.$router.push({ name: "rent-detail", params: { id: rentId } });
    },
    buildRoleParams(params = {}) {
      const isSuperUser =
        localStorage.getItem("is_superuser") === "1" ||
        localStorage.getItem("is_superuser") === "true";
      const groups = JSON.parse(localStorage.getItem("groups") || "[]");
      const email = localStorage.getItem("email");

      if (!isSuperUser) {
        if (groups.includes("manager")) {
          params["property_id__property_zone_id__manager_id__email"] = email;
         
        } else if (groups.includes("owner")) {
          params["property_id__property_zone_id__owner_id__email"] = email;
             
        } else if (groups.includes("staff")) {
          params["property_id__property_zone_id__staff_id__email"] = email;
            
        }
      }
      return params;
    },
    async fetchRents(url = `/get_rents?search=${this.searchTerm}&page_size=${this.pageSize}`) {
      this.loading=true
      try {
        const params = this.buildRoleParams();
        const response = await this.$apiGet(url, params);
       console.log("response rents",response);

        if (response && response.data) {
          this.rents = response.data || [];
          this.next = response.next;
          this.previous = response.previous;
          this.currentPage = response.current_page;
          this.totalPages = response.total_pages;
        }
      } catch (error) {
        console.error("Failed to fetch rents:", error);
        this.rents = [];
      }
      finally {
        this.loading=false
      }
    },
    goToPropertyDetail(propertyId) {
      if (propertyId)
        this.$router.push({
          name: "PropertyDetail",
          params: { id: propertyId },
        });
    },
    goToUserDetail(id) {
      this.$router.push(`/user_detail/${id}`);
    },
    onSearch() {
      this.currentPage = 1;
      this.fetchRents();
    },
    sortBy(key) {
      if (this.sortKey === key) this.sortAsc = !this.sortAsc;
      else {
        this.sortKey = key;
        this.sortAsc = true;
      }
    },
  },
};
</script>

<style scoped>
@media (max-width: 768px) {
  .card {
    transition: box-shadow 0.2s ease-in-out;
  }
  .card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}
</style>
