<template>
  <div class="min-h-screen bg-gray-100 pb-10">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading broker profile..." />

    <!-- Back -->
    <div class="bg-white border-b border-gray-100 px-6 py-4">
      <button @click="$router.back()" class="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition uppercase tracking-wider">
        <i class="fas fa-arrow-left text-[10px]"></i> Back to Brokers
      </button>
    </div>

    <div v-if="broker" class="max-w-5xl mx-auto px-4 pt-6 space-y-5">

      <!-- Profile Card -->
      <div class="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <div class="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-100">
          <div class="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center text-gray-600 font-black text-xl uppercase shrink-0">
            {{ initials(broker.first_name, broker.last_name) }}
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-lg font-black text-gray-800 tracking-tight truncate">{{ fullName }}</h1>
            <div class="flex flex-wrap gap-2 mt-1.5">
              <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold uppercase border border-gray-200">{{ broker.license_number || 'No License' }}</span>
              <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold uppercase border border-gray-200">{{ broker.commission_rate || 0 }}% Commission</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span :class="broker.is_active ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'" class="px-3 py-1 rounded-full text-[10px] font-semibold uppercase">
              {{ broker.is_active ? 'Active' : 'Inactive' }}
            </span>
            <button @click="showEditModal = true" class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-[10px] font-semibold uppercase tracking-wide transition">
              <i class="fas fa-pen text-[9px]"></i> Edit
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 px-6 py-4">
          <div class="py-3 sm:py-0 sm:pr-4">
            <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Email</p>
            <p class="text-xs font-medium text-gray-700 truncate">{{ broker.email || '—' }}</p>
          </div>
          <div class="py-3 sm:py-0 sm:px-4">
            <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Phone</p>
            <p class="text-xs font-medium text-gray-700">{{ broker.phone_number || '—' }}</p>
          </div>
          <div class="py-3 sm:py-0 sm:px-4">
            <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Wallet</p>
            <p class="text-xs font-medium text-gray-700 truncate">{{ broker.wallet || '—' }}</p>
          </div>
          <div class="py-3 sm:py-0 sm:pl-4">
            <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Date Joined</p>
            <p class="text-xs font-medium text-gray-700">{{ fmt(broker.date_joined) }}</p>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-white border border-gray-100 rounded-lg p-4">
          <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Sale Listings</p>
          <p class="text-2xl font-black text-gray-800">{{ saleListing.length }}</p>
        </div>
        <div class="bg-white border border-gray-100 rounded-lg p-4">
          <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Approved Sales</p>
          <p class="text-2xl font-black text-green-600">{{ approvedSales }}</p>
        </div>
        <div class="bg-white border border-gray-100 rounded-lg p-4">
          <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Total Posting Fees</p>
          <p class="text-2xl font-black text-amber-600">{{ currency(totalPostingFees) }}</p>
        </div>
        <div class="bg-white border border-gray-100 rounded-lg p-4">
          <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Commissions</p>
          <p class="text-2xl font-black text-gray-700">{{ totalCommissions }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <div class="border-b border-gray-100 flex gap-0.5 px-4 pt-3 overflow-x-auto">
          <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
            class="flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold rounded-t-lg border-b-2 whitespace-nowrap transition-all"
            :class="activeTab === tab.key ? 'border-gray-800 text-gray-800 bg-gray-50' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'"
          >
            <i :class="tab.icon"></i> {{ tab.label }}
            <span v-if="tab.count !== undefined" class="px-1.5 py-0.5 rounded-full text-[9px] font-bold" :class="activeTab === tab.key ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'">{{ tab.count }}</span>
          </button>
        </div>

        <!-- Sale Listings -->
        <div v-if="activeTab === 'sale_listings'" class="p-5">
          <Loading :visible="loadingSales" message="Loading..." />
          <div class="overflow-x-auto rounded-lg border border-gray-100">
            <table class="w-full text-xs">
              <thead class="bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <tr>
                  <th class="px-3 py-2.5 text-left">Property</th>
                  <th class="px-3 py-2.5 text-right">Listing Price</th>
                  <th class="px-3 py-2.5 text-right">Selling Price</th>
                  <th class="px-3 py-2.5 text-right">Posting Fee</th>
                  <th class="px-3 py-2.5 text-center">Payment Status</th>
                  <th class="px-3 py-2.5 text-center">Status</th>
                  <th class="px-3 py-2.5 text-left">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="s in saleListing" :key="s.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-3 py-2.5 font-medium text-gray-800">{{ s.property?.name || s.property_zone?.name || '—' }}</td>
                  <td class="px-3 py-2.5 text-right text-gray-600">{{ currency(s.listing_price) }}</td>
                  <td class="px-3 py-2.5 text-right font-semibold text-green-600">{{ currency(s.selling_price) }}</td>
                  <td class="px-3 py-2.5 text-right text-amber-700 font-semibold">{{ currency(s.posting_fee) }}</td>
                  <td class="px-3 py-2.5 text-center">
                    <span :class="s.posting_payment_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'" class="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase">{{ s.posting_payment_status || 'pending' }}</span>
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <span :class="s.status === 'sold' ? 'bg-blue-100 text-blue-700' : s.status === 'for_sale' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'" class="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase">{{ s.status || '—' }}</span>
                  </td>
                  <td class="px-3 py-2.5 text-gray-400">{{ fmt(s.created_at) }}</td>
                </tr>
                <tr v-if="!saleListing.length && !loadingSales">
                  <td colspan="7" class="py-10 text-center text-gray-400 italic text-xs">No sale listings found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Sale Commissions -->
        <div v-if="activeTab === 'sale_commissions'" class="p-5">
          <Loading :visible="loadingSaleComm" message="Loading..." />
          <div class="overflow-x-auto rounded-lg border border-gray-100">
            <table class="w-full text-xs">
              <thead class="bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <tr>
                  <th class="px-3 py-2.5 text-left">Property Sale</th>
                  <th class="px-3 py-2.5 text-center">SaaS %</th>
                  <th class="px-3 py-2.5 text-center">Broker %</th>
                  <th class="px-3 py-2.5 text-center">Total %</th>
                  <th class="px-3 py-2.5 text-left">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="c in saleCommissions" :key="c.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-3 py-2.5 font-medium text-gray-800">{{ c.property_sale_name || c.property_sale || '—' }}</td>
                  <td class="px-3 py-2.5 text-center"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-semibold">{{ c.saas_commission }}%</span></td>
                  <td class="px-3 py-2.5 text-center"><span class="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 font-semibold">{{ c.broker_commission }}%</span></td>
                  <td class="px-3 py-2.5 text-center"><span class="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100 font-bold">{{ c.total_commission }}%</span></td>
                  <td class="px-3 py-2.5 text-gray-400">{{ fmt(c.created_at) }}</td>
                </tr>
                <tr v-if="!saleCommissions.length && !loadingSaleComm">
                  <td colspan="5" class="py-10 text-center text-gray-400 italic text-xs">No sale commissions found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Rent Commissions -->
        <div v-if="activeTab === 'rent_commissions'" class="p-5">
          <Loading :visible="loadingRentComm" message="Loading..." />
          <div class="overflow-x-auto rounded-lg border border-gray-100">
            <table class="w-full text-xs">
              <thead class="bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <tr>
                  <th class="px-3 py-2.5 text-left">Rent Ref</th>
                  <th class="px-3 py-2.5 text-center">SaaS %</th>
                  <th class="px-3 py-2.5 text-center">Broker %</th>
                  <th class="px-3 py-2.5 text-center">Total %</th>
                  <th class="px-3 py-2.5 text-left">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="c in rentCommissions" :key="c.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-3 py-2.5 font-medium text-gray-700">#{{ c.rent || '—' }}</td>
                  <td class="px-3 py-2.5 text-center"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-semibold">{{ c.saas_commission }}%</span></td>
                  <td class="px-3 py-2.5 text-center"><span class="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 font-semibold">{{ c.broker_commission }}%</span></td>
                  <td class="px-3 py-2.5 text-center"><span class="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100 font-bold">{{ c.total_commission }}%</span></td>
                  <td class="px-3 py-2.5 text-gray-400">{{ fmt(c.created_at) }}</td>
                </tr>
                <tr v-if="!rentCommissions.length && !loadingRentComm">
                  <td colspan="5" class="py-10 text-center text-gray-400 italic text-xs">No rent commissions found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Posting Fees -->
        <div v-if="activeTab === 'posting_fees'" class="p-5">
          <div class="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4 flex items-start gap-2 text-xs text-amber-800">
            <i class="fas fa-info-circle text-amber-500 mt-0.5 shrink-0"></i>
            Fees paid by the broker to list properties for sale on the platform.
          </div>
          <div class="overflow-x-auto rounded-lg border border-gray-100">
            <table class="w-full text-xs">
              <thead class="bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <tr>
                  <th class="px-3 py-2.5 text-left">Property</th>
                  <th class="px-3 py-2.5 text-right">Listing Price</th>
                  <th class="px-3 py-2.5 text-right">Posting Fee</th>
                  <th class="px-3 py-2.5 text-center">Status</th>
                  <th class="px-3 py-2.5 text-left">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="s in saleListing" :key="s.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-3 py-2.5 font-medium text-gray-800">{{ s.property?.name || s.property_zone?.name || '—' }}</td>
                  <td class="px-3 py-2.5 text-right text-gray-600">{{ currency(s.listing_price) }}</td>
                  <td class="px-3 py-2.5 text-right font-bold text-amber-700">{{ currency(s.posting_fee) }}</td>
                  <td class="px-3 py-2.5 text-center">
                    <span :class="s.posting_payment_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'" class="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase">{{ s.posting_payment_status || 'pending' }}</span>
                  </td>
                  <td class="px-3 py-2.5 text-gray-400">{{ fmt(s.created_at) }}</td>
                </tr>
                <tr v-if="!saleListing.length && !loadingSales">
                  <td colspan="5" class="py-10 text-center text-gray-400 italic text-xs">No posting fee records.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="saleListing.length" class="mt-4 flex justify-end">
            <div class="bg-amber-50 border border-amber-200 rounded-lg px-5 py-3 flex items-center gap-3">
              <span class="text-xs font-semibold text-amber-700 uppercase">Total Fees Paid</span>
              <span class="text-lg font-black text-amber-800">{{ currency(totalPostingFees) }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div v-if="!broker && !loading" class="flex flex-col items-center justify-center mt-20 text-gray-400">
      <p class="text-sm font-semibold">Broker not found.</p>
    </div>

    <!-- Edit Broker Modal -->
    <UpdateBroker :visible="showEditModal" :broker="broker" @close="showEditModal = false" @success="onEditSuccess" />
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";
import UpdateBroker from "./update.vue";

export default {
  name: "BrokerDetail",
  components: { Toast, Loading, UpdateBroker },
  data() {
    return {
      broker: null, saleListing: [], saleCommissions: [], rentCommissions: [],
      loading: false, loadingSales: false, loadingSaleComm: false, loadingRentComm: false,
      activeTab: "sale_listings",
      showEditModal: false,
    };
  },
  computed: {
    fullName() { if (!this.broker) return ""; return [this.broker.first_name, this.broker.middle_name, this.broker.last_name].filter(Boolean).join(" "); },
    approvedSales() { return this.saleListing.filter(s => s.posting_payment_status === "approved").length; },
    totalPostingFees() { return this.saleListing.reduce((sum, s) => sum + (parseFloat(s.posting_fee) || 0), 0); },
    totalCommissions() { return this.saleCommissions.length + this.rentCommissions.length; },
    tabs() {
      return [
        { key: "sale_listings", label: "Sale Listings", icon: "fas fa-tags", count: this.saleListing.length },
        { key: "posting_fees", label: "Posting Fees", icon: "fas fa-receipt", count: this.saleListing.length },
        { key: "sale_commissions", label: "Sale Commissions", icon: "fas fa-money-bill-wave", count: this.saleCommissions.length },
        { key: "rent_commissions", label: "Rent Commissions", icon: "fas fa-file-contract", count: this.rentCommissions.length },
      ];
    },
  },
  async mounted() { await this.loadBroker(this.$route.params.id); },
  methods: {
    async loadBroker(profileId) {
      this.loading = true;
      try {
        const res = await this.$apiGet("/get_broker_profiles", { page_size: 1000 });
        const list = res.data || [];
        const profile = (list.results || list).find(b => String(b.id) === String(profileId));
        if (profile) {
          const user = await this.$apiGetById("/get_user", profile.user);
          this.broker = { ...profile, first_name: user.first_name || "", middle_name: user.middle_name || "", last_name: user.last_name || "", email: user.email || "", phone_number: user.phone_number || "", is_active: user.is_active ?? true, date_joined: user.date_joined || "" };
          this.loadSaleListing(profileId);
          this.loadSaleCommissions(profileId);
          this.loadRentCommissions(profileId);
        }
      } catch (e) { console.error(e); this.broker = null; }
      finally { this.loading = false; }
    },
    async loadSaleListing(brokerId) {
      this.loadingSales = true;
      try { const res = await this.$apiGet("/get_broker_property_sales", { broker__id: brokerId, page_size: 1000 }); this.saleListing = res.data || []; }
      catch (e) { console.error(e); this.saleListing = []; } finally { this.loadingSales = false; }
    },
    async loadSaleCommissions(brokerId) {
      this.loadingSaleComm = true;
      try { const res = await this.$apiGet("/get_commissions", { broker__id: brokerId, page_size: 1000 }); this.saleCommissions = res.data || []; }
      catch (e) { console.error(e); this.saleCommissions = []; } finally { this.loadingSaleComm = false; }
    },
    async loadRentCommissions(brokerId) {
      this.loadingRentComm = true;
      try { const res = await this.$apiGet("/get_rent_commissions", { broker__id: brokerId, page_size: 1000 }); this.rentCommissions = res.data || []; }
      catch (e) { console.error(e); this.rentCommissions = []; } finally { this.loadingRentComm = false; }
    },
    initials(first, last) { return ((first || "")[0] || "") + ((last || "")[0] || "") || "?"; },
    fmt(d) { return d ? new Date(d).toLocaleDateString() : "—"; },
    currency(v) { if (v === null || v === undefined || v === "") return "—"; const n = parseFloat(v); if (isNaN(n)) return v; return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
    async onEditSuccess() { await this.loadBroker(this.$route.params.id); },
  },
};
</script>
