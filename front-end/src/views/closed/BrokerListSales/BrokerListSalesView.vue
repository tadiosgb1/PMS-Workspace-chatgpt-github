<template>
  <div class="pms-brand-page p-6 bg-gray-100 min-h-screen text-sm text-slate-800">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading broker sales..." />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Broker Property Sales</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Review & Approve Sales</p>
      </div>
    </div>

    <!-- Filters and Controls -->
    <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4 bg-white p-4 rounded-lg border border-gray-100">
      <div class="flex flex-wrap gap-3 items-center flex-1 w-full">
        <div class="relative flex-1 max-w-sm w-full">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input v-model="searchQuery" @input="fetchItems(1)" type="search"
            placeholder="Search properties, brokers..."
            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white transition" />
        </div>

        <select v-model="statusFilter" @change="fetchItems(1)"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select v-model="pageSize" @change="fetchItems(1)"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
          <option v-for="s in [10,20,50,100]" :key="s" :value="s">{{ s }} / page</option>
        </select>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left">Property & Broker</th>
              <th class="px-4 py-3 text-left">Pricing</th>
              <th class="px-4 py-3 text-center">Payment Slip</th>
              <th class="px-4 py-3 text-center">Fee Status</th>
              <th class="px-4 py-3 text-center">Sale Status</th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50 transition-colors">
              <!-- Property & Broker -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {{ (item.property?.name || 'P').substring(0,2) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-gray-800 truncate">{{ item.property?.name || 'N/A' }}</div>
                    <div class="text-xs text-gray-500 truncate">{{ item.property?.address || 'N/A' }}</div>
                    <div class="text-xs text-blue-600 font-medium mt-1">
                      <i class="fas fa-user-tie mr-1"></i>{{ item.broker?.first_name }} {{ item.broker?.last_name }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Pricing -->
              <td class="px-4 py-3">
                <div class="space-y-1">
                  <div class="text-xs text-gray-500">Listing: <span class="font-semibold text-gray-700">${{ parseFloat(item.listing_price || 0).toLocaleString() }}</span></div>
                  <div class="text-xs text-gray-500">Selling: <span class="font-semibold text-green-600">${{ item.selling_price ? parseFloat(item.selling_price).toLocaleString() : '—' }}</span></div>
                  <div class="text-xs text-gray-500">Fee: <span class="font-semibold text-orange-600">${{ parseFloat(item.posting_fee || 0).toLocaleString() }}</span></div>
                </div>
              </td>

              <!-- Payment Slip -->
              <td class="px-4 py-3 text-center">
                <div v-if="item.posting_payment_slip" class="flex flex-col items-center gap-2">
                  <button @click="viewPaymentSlip(item.posting_payment_slip)" 
                          class="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded text-xs font-semibold transition">
                    <i class="fas fa-file-image mr-1"></i>View Slip
                  </button>
                </div>
                <div v-else class="text-xs text-gray-400">No slip uploaded</div>
              </td>

              <!-- Fee Status -->
              <td class="px-4 py-3 text-center">
                <div class="flex flex-col items-center gap-2">
                  <span class="px-2 py-1 rounded-full text-[10px] font-semibold uppercase" :class="{
                    'bg-green-100 text-green-700': item.posting_payment_status === 'approved',
                    'bg-yellow-100 text-yellow-700': item.posting_payment_status === 'pending',
                    'bg-red-100 text-red-700': item.posting_payment_status === 'rejected'
                  }">
                    {{ item.posting_payment_status || 'pending' }}
                  </span>
                  
                  <!-- Approval Actions -->
                  <div v-if="item.posting_payment_status !== 'approved'" class="flex gap-1">
                    <button @click="updatePaymentStatus(item.id, 'approved')" 
                            class="px-2 py-1 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded text-[10px] font-semibold transition"
                            title="Approve">
                      <i class="fas fa-check"></i>
                    </button>
                    <button @click="updatePaymentStatus(item.id, 'rejected')" 
                            class="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded text-[10px] font-semibold transition"
                            title="Reject">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </td>

              <!-- Sale Status -->
              <td class="px-4 py-3 text-center">
                <span class="px-2 py-1 rounded-full text-[10px] font-semibold uppercase" :class="{
                  'bg-blue-100 text-blue-700': item.status === 'pending',
                  'bg-green-100 text-green-700': item.status === 'completed',
                  'bg-red-100 text-red-700': item.status === 'cancelled'
                }">
                  {{ item.status || 'pending' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button @click="viewDetails(item.id)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition text-xs" title="View Details">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click="editItem(item)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white transition text-xs" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="openDeleteModal(item.id)" class="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition text-xs" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="items.length === 0 && !loading">
              <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-400 italic">No broker sales found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">
        Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of <span class="font-semibold text-gray-700">{{ totalPages }}</span>
        — <span class="font-semibold text-gray-700">{{ count }}</span> total
      </span>
      <div class="flex items-center gap-2">
        <button @click="fetchItems(currentPage - 1)" :disabled="!previousPage" class="btn-page">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <span class="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-bold min-w-[2rem] text-center">
          {{ currentPage }}
        </span>
        <button @click="fetchItems(currentPage + 1)" :disabled="!nextPage" class="btn-page">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <AddBrokerListSales v-if="showModal && !editMode" :data="selectedItem" @close="showModal=false" @saved="fetchItems"/>
    <EditBrokerListSales v-if="showModal && editMode" :data="selectedItem" @close="showModal=false" @saved="fetchItems"/>
    <ConfirmModal v-if="deleteModalVisible" :visible="deleteModalVisible" title="Delete Broker Sale" 
                  message="Are you sure you want to delete this sale?" @confirm="confirmDelete" @cancel="deleteModalVisible=false"/>
    
    <!-- Payment Slip Modal -->
    <div v-if="paymentSlipVisible" class="fixed inset-0 bg-black/90 flex items-center justify-center z-[100]" @click="paymentSlipVisible = false">
      <div class="max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden" @click.stop>
        <div class="p-4 bg-gray-50 border-b flex items-center justify-between">
          <h3 class="font-semibold text-gray-800">Payment Slip</h3>
          <button @click="paymentSlipVisible = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <img :src="currentPaymentSlip" class="max-w-full max-h-[70vh] mx-auto rounded" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AddBrokerListSales from "./AddBrokerListSales.vue";
import EditBrokerListSales from "./EditBrokerListSales.vue";
import Loading from "@/components/Loading.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Toast from "@/components/Toast.vue";

export default {
  components: { AddBrokerListSales, EditBrokerListSales, Loading, ConfirmModal, Toast },
  data() {
    return { 
      items: [], 
      count: 0, 
      nextPage: null, 
      previousPage: null, 
      currentPage: 1, 
      pageSize: 10, 
      totalPages: 1, 
      searchQuery: "", 
      statusFilter: "",
      showModal: false, 
      editMode: false, 
      selectedItem: null, 
      loading: false, 
      deleteModalVisible: false, 
      deleteId: null,
      paymentSlipVisible: false,
      currentPaymentSlip: null
    };
  },
  methods: {
    async fetchItems(page = 1) {
      this.loading = true; 
      this.currentPage = page;
      try {
        const params = { 
          page: this.currentPage, 
          page_size: this.pageSize, 
          search: this.searchQuery 
        };
        if (this.statusFilter) params.posting_payment_status = this.statusFilter;
        
        const response = await this.$apiGet("/get_broker_property_sales", params);
        this.items = response.data || []; 
        this.count = response.count || 0;
        this.nextPage = response.next || null; 
        this.previousPage = response.previous || null;
        this.totalPages = response.total_pages || 1;
      } catch(e) { 
        console.error(e); 
        this.items = [];
      } finally { 
        this.loading = false; 
      }
    },

    async updatePaymentStatus(saleId, status) {
      try {
        const res = await this.$apiPatch(`/update_broker_property_sale`, saleId, {
          posting_payment_status: status
        });
        if (res) {
          this.$root.$refs.toast.showToast(`Payment status updated to ${status}`, "success");
          await this.fetchItems(this.currentPage);
        }
      } catch (error) {
        console.error('Failed to update payment status:', error);
        this.$root.$refs.toast.showToast("Failed to update payment status", "error");
      }
    },

    viewPaymentSlip(slipUrl) {
      this.currentPaymentSlip = slipUrl;
      this.paymentSlipVisible = true;
    },

    openAddModal() { 
      this.editMode = false; 
      this.selectedItem = null; 
      this.showModal = true; 
    },

    editItem(item) { 
      this.editMode = true; 
      this.selectedItem = item; 
      this.showModal = true; 
    },

    viewDetails(id) { 
      this.$router.push({ name: "BrokerListSales-detail", params: { id } }); 
    },

    openDeleteModal(id) { 
      this.deleteId = id; 
      this.deleteModalVisible = true; 
    },

    async confirmDelete() {
      try {
        const res = await this.$apiDelete("/delete_broker_property_sale", this.deleteId);
        if(res) {
          this.$root.$refs.toast.showToast("Sale deleted successfully", "success");
          this.fetchItems(this.currentPage);
        }
      } catch(e) {
        this.$root.$refs.toast.showToast("Failed to delete sale", "error");
      }
      this.deleteModalVisible = false;
    },
  },
  mounted() { 
    this.fetchItems(); 
  },
};
</script>

<style scoped>
.btn-page {
  @apply flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all;
}
</style>
