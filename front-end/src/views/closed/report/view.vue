<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm">
    
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">Management Analytics</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Operational Overview & Reporting</p>
      </div>
      
      <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-100">
        <span class="text-xs text-gray-500 font-semibold">System Status</span>
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>
    </div>

    <div class="space-y-6">
      
      <section class="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div class="p-6">
          <div class="flex flex-col lg:flex-row gap-8">
            
            <div class="flex-1 space-y-6">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-semibold text-gray-800">User Demographics</h2>
                <div class="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    v-for="tab in userTabs"
                    :key="tab.key"
                    @click="activeUserTab = tab.key; fetchUsers()"
                    :class="[activeUserTab === tab.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800']"
                    class="px-3 py-1.5 rounded text-xs font-semibold transition-all"
                  >
                    {{ tab.label }}
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div class="space-y-1">
                  <label class="text-xs text-gray-500 font-semibold">Date From</label>
                  <input type="date" v-model="userFilter.from" class="w-full bg-white border border-gray-200 rounded-lg text-xs p-2 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs text-gray-500 font-semibold">Date To</label>
                  <input type="date" v-model="userFilter.to" class="w-full bg-white border border-gray-200 rounded-lg text-xs p-2 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
                <div class="flex items-end">
                  <button @click="applyUserFilter" class="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition">
                    Apply Filter
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p class="text-xs text-gray-500 font-semibold mb-1">Total {{ activeUserTab }}</p>
                  <p class="text-2xl font-black text-gray-800">{{ filteredUsers.length }}</p>
                </div>
                <button @click="downloadUsers" class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition">
                  <i class="fas fa-download text-xs"></i> Export List
                </button>
              </div>
            </div>

            <div class="flex-1 min-h-[300px] bg-gray-50 rounded-lg p-4 flex items-center justify-center border border-gray-100">
              <apexchart type="donut" width="100%" height="300" :options="userChartOptions" :series="userSeries" />
            </div>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div class="p-6">
          <div class="flex flex-col lg:flex-row-reverse gap-8">
            
            <div class="flex-1 space-y-6">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <h2 class="text-sm font-semibold text-gray-800">Financial Streams</h2>
                <div class="flex flex-wrap bg-gray-100 p-1 rounded-lg">
                  <button
                    v-for="tab in paymentTabs"
                    :key="tab.key"
                    @click="activePaymentTab = tab.key"
                    :class="[activePaymentTab === tab.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800']"
                    class="px-3 py-1.5 rounded text-xs font-semibold transition-all"
                  >
                    {{ tab.label }}
                  </button>
                </div>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div class="space-y-1">
                    <label class="text-xs text-gray-500 font-semibold">From</label>
                    <input type="date" v-show="activePaymentTab === 'subscription'" v-model="subscriptionPaymentFilter.from" class="w-full bg-white border border-gray-200 rounded-lg text-xs p-2" />
                    <input type="date" v-show="activePaymentTab === 'sales'" v-model="salesPaymentFilter.from" class="w-full bg-white border border-gray-200 rounded-lg text-xs p-2" />
                    <input type="date" v-show="activePaymentTab === 'rent'" v-model="rentPaymentFilter.from" class="w-full bg-white border border-gray-200 rounded-lg text-xs p-2" />
                    <input type="date" v-show="activePaymentTab === 'rental'" v-model="rentalPaymentFilter.from" class="w-full bg-white border border-gray-200 rounded-lg text-xs p-2" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs text-gray-500 font-semibold">To</label>
                    <input type="date" v-show="activePaymentTab === 'subscription'" v-model="subscriptionPaymentFilter.to" class="w-full bg-white border border-gray-200 rounded-lg text-xs p-2" />
                    <input type="date" v-show="activePaymentTab === 'sales'" v-model="salesPaymentFilter.to" class="w-full bg-white border border-gray-200 rounded-lg text-xs p-2" />
                    <input type="date" v-show="activePaymentTab === 'rent'" v-model="rentPaymentFilter.to" class="w-full bg-white border border-gray-200 rounded-lg text-xs p-2" />
                    <input type="date" v-show="activePaymentTab === 'rental'" v-model="rentalPaymentFilter.to" class="w-full bg-white border border-gray-200 rounded-lg text-xs p-2" />
                  </div>

                  <div v-if="activePaymentTab === 'rental'" class="space-y-1">
                    <label class="text-xs text-gray-500 font-semibold">Logic Type</label>
                    <select v-model="cowrk_type" class="w-full bg-white border border-gray-200 rounded-lg text-xs p-2">
                      <option value="rental__start_date">Agreement Start</option>
                      <option value="paid_at">Paid at</option>
                      <option value="cycle_start">Cycle Start</option>
                    </select>
                  </div>

                  <div :class="activePaymentTab === 'rental' ? '' : 'sm:col-span-2 lg:col-span-2'">
                    <button 
                      @click="activePaymentTab === 'subscription' ? applySubscriptionFilter() : 
                              activePaymentTab === 'sales' ? applySalesFilter() : 
                              activePaymentTab === 'rent' ? applyRentFilter() : applyRentalFilter()" 
                      class="w-full py-2 text-white rounded-lg text-xs font-semibold transition bg-gray-800 hover:bg-gray-700"
                    >
                      Update View
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p class="text-xs text-gray-500 font-semibold mb-1 capitalize">{{ activePaymentTab }} Payments</p>
                  <p class="text-2xl font-black text-gray-800">
                    {{ activePaymentTab === 'subscription' ? filteredSubscriptionPayments.length : 
                       activePaymentTab === 'sales' ? filteredSalesPayments.length : 
                       activePaymentTab === 'rent' ? filteredRentPayments.length : filteredRentalPayments.length }}
                  </p>
                </div>
                <button 
                  @click="activePaymentTab === 'subscription' ? downloadSubscriptionPayments() : 
                          activePaymentTab === 'sales' ? downloadSalesPayments() : 
                          activePaymentTab === 'rent' ? downloadRentPayments() : downloadRentalPayments()"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition text-white bg-gray-800 hover:bg-gray-700"
                >
                  <i class="fas fa-download text-xs"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="flex-1 min-h-[300px] bg-gray-50 rounded-lg p-4 flex items-center justify-center border border-gray-100">
              <apexchart type="donut" width="100%" height="300" :options="paymentChartOptions" :series="paymentSeries" />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import * as XLSX from "xlsx";
import VueApexCharts from "vue3-apexcharts";

export default {
  components: { apexchart: VueApexCharts },
  data() {
    return {
       totalUsers: 0,
      cowrk_type: "rental__start_date",
      activeUserTab: "owners",
      activePaymentTab: "subscription",
      userTabs: [
        { key: "owners", label: "Owners" },
        { key: "tenants", label: "Tenants" },
        { key: "staffs", label: "Staffs" },
        { key: "managers", label: "Managers" },
      ],
      paymentTabs: [
        { key: "subscription", label: "Subscription" },
        { key: "sales", label: "Sales" },
        { key: "rent", label: "Rent" },
        { key: "rental", label: "Co-work-space" },
      ],

      users: [],
      subscriptionPayments: [],
      salesPayments: [],
      rentPayments: [],
      rentalPayments: [],

      filteredUsers: [],
      filteredSubscriptionPayments: [],
      filteredSalesPayments: [],
      filteredRentPayments: [],
      filteredRentalPayments: [],

      userFilter: { from: "", to: "" },
      subscriptionPaymentFilter: { from: "", to: "" },
      salesPaymentFilter: { from: "", to: "" },
      rentPaymentFilter: { from: "", to: "" },
      rentalPaymentFilter: { from: "", to: "" },

      userSeries: [1, 1, 1, 1],
      userChartOptions: { labels: ["Owners", "Tenants", "Staffs", "Managers"], legend: { position: "bottom" } },
      paymentSeries: [10, 20, 15, 5],
      paymentChartOptions: { labels: ["Subscription", "Sales", "Rent", "Workspace"], legend: { position: "bottom" } },
    };
  },
  mounted() {
    this.fetchUsers();
    this.fetchAllPayments();
  },
  methods: {
    /** USERS */
 async fetchUsers() {
    try {
      let endpoint = "";
      switch (this.activeUserTab) {
        case "owners":
          endpoint = "/get_owners";
          break;
        case "managers":
          endpoint = "/get_managers";
          break;
        case "staffs":
          endpoint = "/get_staffs";
          break;
        case "tenants":
          endpoint = "/get_tenants";
          break;
      }

      const res = await this.$apiGet(endpoint);

      // Handle owners separately because API sends plain array
      if (this.activeUserTab === "owners") {
        this.users = res?.owners || [];
        this.totalUsers = this.users.length; // count manually
      } else {
        this.users = res?.data || [];
        this.totalUsers = res?.count ?? this.users.length; // fallback
      }

      this.filteredUsers = [...this.users];
    } catch (err) {
      console.error(err);
      this.users = [];
      this.filteredUsers = [];
      this.totalUsers = 0;
    }
  },


    async applyUserFilter() {
      if (!this.userFilter.from || !this.userFilter.to) {
        this.filteredUsers = [...this.users];
        return;
      }
      const from = new Date(this.userFilter.from);
      const to = new Date(this.userFilter.to);
      this.filteredUsers = this.users.filter(u => {
        const date = new Date(u.created_at);
        return date >= from && date <= to;
      });
    },

    /** PAYMENTS */
    async fetchAllPayments() {
      await this.fetchSubscriptionPayments();
      await this.fetchSalesPayments();
      await this.fetchRentPayments();
      await this.fetchRentalPayments();
    },
    async fetchSubscriptionPayments() {
      const res = await this.$apiGet("/get_subscription_payment");
      this.subscriptionPayments = res?.data || [];
      this.filteredSubscriptionPayments = [...this.subscriptionPayments];
    },
    async fetchSalesPayments() {
      const res = await this.$apiGet("/get_sales_payments");
      this.salesPayments = res?.data || [];
      this.filteredSalesPayments = [...this.salesPayments];
    },
    async fetchRentPayments() {
      const res = await this.$apiGet("/get_payments");
      this.rentPayments = res?.data || [];
      this.filteredRentPayments = [...this.rentPayments];
    },
    async fetchRentalPayments() {
      const res = await this.$apiGet("/get_rental_payments");
      this.rentalPayments = res?.data || [];
      this.filteredRentalPayments = [...this.rentalPayments];
    },

    async applySubscriptionFilter() {
      try {
        if (!this.subscriptionPaymentFilter.from || !this.subscriptionPaymentFilter.to) {
          this.filteredSubscriptionPayments = [...this.subscriptionPayments];
          return;
        }
        const params = {
          paid_at__gte: this.subscriptionPaymentFilter.from,
          paid_at__lte: this.subscriptionPaymentFilter.to,
        };
        const res = await this.$apiGet("/get_subscription_payment", params);
        
        this.subscriptionPayments = res?.data || [];
        this.filteredSubscriptionPayments = [...this.subscriptionPayments];
      } catch (error) {
        console.error("Error fetching filtered subscription payments:", error);
      }
    },

    async applySalesFilter() {
      try {
        if (!this.salesPaymentFilter.from || !this.salesPaymentFilter.to) {
          this.filteredSalesPayments = [...this.salesPayments];
          return;
        }
        const params = {
          due_date__gte: this.salesPaymentFilter.from,
          due_date__lte: this.salesPaymentFilter.to,
        };
        const res = await this.$apiGet("/get_sales_payments", params);
        this.salesPayments = res?.data || [];
        this.filteredSalesPayments = [...this.salesPayments];
      } catch (error) {
        console.error("Error fetching filtered sales payments:", error);
      }
    },

    async applyRentFilter() {
      try {
        if (!this.rentPaymentFilter.from || !this.rentPaymentFilter.to) {
          this.filteredRentPayments = [...this.rentPayments];
          return;
        }
        const params = {
          due_date__gte: this.rentPaymentFilter.from,
          due_date__lte: this.rentPaymentFilter.to,
        };
        const res = await this.$apiGet("/get_payments", params);
        this.rentPayments = res?.data || [];
        this.filteredRentPayments = [...this.rentPayments];
      } catch (error) {
        console.error("Error fetching filtered rent payments:", error);
      }
    },

    async applyRentalFilter() {
      try {
        if (!this.rentalPaymentFilter.from || !this.rentalPaymentFilter.to) {
          this.filteredRentalPayments = [...this.rentalPayments];
          return;
        }
        const params = {
          [`${this.cowrk_type}__gte`]: this.rentalPaymentFilter.from,
          [`${this.cowrk_type}__lte`]: this.rentalPaymentFilter.to,
        };
        const res = await this.$apiGet("/get_rental_payments", params);
        this.rentalPayments = res?.data || [];
        this.filteredRentalPayments = [...this.rentalPayments];
      } catch (error) {
        console.error("Error fetching filtered rental payments:", error);
      }
    },

    /** EXPORT */
    exportExcel(data, fileName, sheetName) {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, fileName);
    },
    downloadUsers() {
      this.exportExcel(this.filteredUsers, `${this.activeUserTab}.xlsx`, "Users");
    },
    downloadSubscriptionPayments() {
      this.exportExcel(this.filteredSubscriptionPayments, "SubscriptionPayments.xlsx", "Subscription");
    },
    downloadSalesPayments() {
      this.exportExcel(this.filteredSalesPayments, "SalesPayments.xlsx", "Sales");
    },
    downloadRentPayments() {
      this.exportExcel(this.filteredRentPayments, "RentPayments.xlsx", "Rent");
    },
    downloadRentalPayments() {
      this.exportExcel(this.filteredRentalPayments, "RentalPayments.xlsx", "Rental");
    },
  },
};
</script>
