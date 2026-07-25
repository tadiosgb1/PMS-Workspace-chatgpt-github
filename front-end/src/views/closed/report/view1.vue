<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <!-- Header -->
    <h1 class="text-3xl font-bold mb-6">🏠 Property Manager Dashboard</h1>

    <!-- Top Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Properties Card -->
      <!-- <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-gray-600">Total Properties</h2>
        <p class="text-2xl font-semibold">{{ stats.totalProperties }}</p>
        <button 
          @click="downloadProperties"
          class="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          ⬇ Export
        </button>
      </div> -->

      <!-- Total Zones Card -->
      <!-- <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-gray-600">Total Property Zones</h2>
        <p class="text-2xl font-semibold">{{ stats.totalZones }}</p>
        <button 
          @click="downloadZones"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ⬇ Export
        </button>
      </div> -->

      <!-- Total Subscriptions Card -->
      <!-- <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-gray-600">Total Subscriptions</h2>
        <p class="text-2xl font-semibold">{{ stats.totalSubscriptions }}</p> -->

        <!-- Date Filters -->
        <!-- <div class="mt-4 flex flex-col space-y-2">
          <strong>From</strong>
          <input type="date" v-model="subscriptionFilter.from" class="border rounded p-2" />
          <strong>To</strong>
          <input type="date" v-model="subscriptionFilter.to" class="border rounded p-2" />
        </div>

        <button 
          @click="downloadSubscriptions"
          class="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          ⬇ Export
        </button>
      </div> -->

      <!-- Total Tenants Card -->
      <!-- <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-gray-600">Total Tenants</h2>
        <p class="text-2xl font-semibold">{{ stats.totalTenants }}</p>
        <button 
          @click="downloadTenants"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          ⬇ Export
        </button>
      </div> -->

      <!-- Total Subscription Payments Card -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-gray-600">Subscription Payments</h2>
        <p class="text-2xl font-semibold">{{ stats.totalSubscriptionPayments }}</p>

        <div class="mt-4 flex flex-col space-y-2">
          <strong>From</strong>
          <input type="date" v-model="subscriptionPaymentFilter.from" class="border rounded p-2" />
          <strong>To</strong>
          <input type="date" v-model="subscriptionPaymentFilter.to" class="border rounded p-2" />
        </div>

        <button 
          @click="downloadSubscriptionPayments"
          class="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          ⬇ Export
        </button>
      </div>

      <!-- Total Sales Payments Card -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-gray-600">Sales Payments</h2>
        <p class="text-2xl font-semibold">{{ stats.totalSalesPayments }}</p>

        <div class="mt-4 flex flex-col space-y-2">
          <strong>From</strong>
          <input type="date" v-model="salesPaymentFilter.from" class="border rounded p-2" />
          <strong>To</strong>
          <input type="date" v-model="salesPaymentFilter.to" class="border rounded p-2" />
        </div>

        <button 
          @click="downloadSalesPayments"
          class="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          ⬇ Export
        </button>
      </div>

      <!-- Total Rent Payments Card -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-gray-600">Rent Payments</h2>
        <p class="text-2xl font-semibold">{{ stats.totalRentPayments }}</p>

        <div class="mt-4 flex flex-col space-y-2">
          <strong>From</strong>
          <input type="date" v-model="rentPaymentFilter.from" class="border rounded p-2" />
          <strong>To</strong>
          <input type="date" v-model="rentPaymentFilter.to" class="border rounded p-2" />
        </div>

        <button 
          @click="downloadRentPayments"
          class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          ⬇ Export
        </button>
      </div>

      <!-- User Exports Card -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-gray-600">Export Users</h2>

        <!-- Dropdown -->
        <select v-model="selectedUserType" @change="fetchUserCount" class="mt-2 border rounded p-2 w-full">
          <option value="">-- Select User Type --</option>
          <option value="staffs">Staffs</option>
          <option value="managers">Managers</option>
          <option value="owners">Owners</option>
          <option value="tenants">Tenants</option>
        </select>

        <!-- Count -->
        <p v-if="selectedUserType" class="text-2xl font-semibold mt-4">
          Total {{ capitalize(selectedUserType) }}: {{ userCount }}
        </p>

        <!-- Export Button -->
        <button
          @click="downloadUsers"
          class="mt-4 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 w-full"
          :disabled="!selectedUserType"
        >
          ⬇ Export {{ selectedUserType ? capitalize(selectedUserType) : '' }}
        </button>
      </div>

      <TotalProperties
        v-if="totalPropertiesVisible"
        :totalPropertiesVisible="totalPropertiesVisible"
        @close="totalPropertiesVisible = false"
      />
    </div>
  </div>
</template>

<script>
import * as XLSX from "xlsx";
import TotalProperties from "@/views/closed/report/totalProperties.vue";

export default {
  components: { TotalProperties },
  data() {
    return {
      stats: {
        totalProperties: 0,
        totalZones: 0,
        totalSubscriptions: 0,
        totalTenants: 0,
        totalSubscriptionPayments: 0,
        totalSalesPayments: 0,
        totalRentPayments: 0,
      },
      properties: [],
      zones: [],
      subscriptions: [],
      tenants: [],
      subscriptionPayments: [],
      salesPayments: [],
      rentPayments: [],
      totalPropertiesVisible: false,

      // Filters
      subscriptionFilter: { from: "", to: "" },
      subscriptionPaymentFilter: { from: "", to: "" },
      salesPaymentFilter: { from: "", to: "" },
      rentPaymentFilter: { from: "", to: "" },

      // User export
      selectedUserType: "",
      userCount: 0,
    };
  },
  mounted() {
    this.fetchTotalProperties();
    this.fetchTotalZones();
    this.fetchTotalSubscriptions();
    this.fetchTotalTenants();
    this.fetchTotalSubscriptionPayments();
    this.fetchTotalSalesPayments();
    this.fetchTotalRentPayments();
  },
  methods: {
    /** ------------------ FETCH DATA ------------------ **/
    async fetchAllPaginated(endpoint) {
      let results = [];
      let nextUrl = endpoint;
      while (nextUrl) {
        const pageRes = await this.$apiGet(nextUrl);
        if (pageRes && pageRes.data) {
          results.push(...pageRes.data);
          nextUrl = pageRes.next
            ? pageRes.next.replace("https://alphapms.sunriseworld.org/api", "")
            : null;
        } else {
          nextUrl = null;
        }
      }
      return results;
    },

    async fetchTotalProperties() {
      try {
        const response = await this.$apiGet("/get_properties");
        this.stats.totalProperties = response?.count ?? 0;
        this.properties = await this.fetchAllPaginated("/get_properties");
      } catch (error) {
        console.error("Failed to fetch total properties:", error);
      }
    },

    async fetchTotalZones() {
      try {
        const response = await this.$apiGet("/get_property_zones");
        this.stats.totalZones = response?.count ?? 0;
        this.zones = await this.fetchAllPaginated("/get_property_zones");
      } catch (error) {
        console.error("Failed to fetch total zones:", error);
      }
    },

    async fetchTotalSubscriptions() {
      try {
        const response = await this.$apiGet("/get_subscription");
        this.stats.totalSubscriptions = response?.count ?? 0;
        this.subscriptions = await this.fetchAllPaginated("/get_subscription");
      } catch (error) {
        console.error("Failed to fetch total subscriptions:", error);
      }
    },

    async fetchTotalTenants() {
      try {
        const response = await this.$apiGet("/get_tenants");
        this.stats.totalTenants = response?.count ?? 0;
        this.tenants = await this.fetchAllPaginated("/get_tenants");
      } catch (error) {
        console.error("Failed to fetch total tenants:", error);
      }
    },

    async fetchTotalSubscriptionPayments() {
      try {
        const response = await this.$apiGet("/get_subscription_payment");
        this.stats.totalSubscriptionPayments = response?.count ?? 0;
        this.subscriptionPayments = await this.fetchAllPaginated("/get_subscription_payment");
      } catch (error) {
        console.error("Failed to fetch subscription payments:", error);
      }
    },

    async fetchTotalSalesPayments() {
      try {
        const response = await this.$apiGet("/get_sales_payments");
        this.stats.totalSalesPayments = response?.count ?? 0;
        this.salesPayments = await this.fetchAllPaginated("/get_sales_payments");
      } catch (error) {
        console.error("Failed to fetch sales payments:", error);
      }
    },

    async fetchTotalRentPayments() {
      try {
        const response = await this.$apiGet("/get_payments");
        this.stats.totalRentPayments = response?.count ?? 0;
        this.rentPayments = await this.fetchAllPaginated("/get_payments");
      } catch (error) {
        console.error("Failed to fetch rent payments:", error);
      }
    },

    async fetchUserCount() {
      if (!this.selectedUserType) {
        this.userCount = 0;
        return;
      }
      try {
        let endpoint = "";
        if (this.selectedUserType === "staffs") endpoint = "/get_staffs";
        if (this.selectedUserType === "managers") endpoint = "/get_managers";
        if (this.selectedUserType === "owners") endpoint = "/get_owners";
        if (this.selectedUserType === "tenants") endpoint = "/get_tenants";

        const response = await this.$apiGet(endpoint);
        this.userCount = response?.count ?? 0;
      } catch (err) {
        console.error("Failed to fetch user count:", err);
        this.userCount = 0;
      }
    },

    /** ------------------ DOWNLOAD AS EXCEL ------------------ **/
    downloadProperties() {
      if (!this.properties.length) return alert("No property data available.");
      const cleaned = this.properties.map(p => ({
        ID: p.id,
        Name: p.name,
        Type: p.property_type,
        Address: p.address,
        City: p.city,
        State: p.state,
        Zip: p.zip_code,
        Price: p.price,
        Bedrooms: p.bed_rooms,
        Bathrooms: p.bath_rooms,
        Rent: p.rent,
        Status: p.status,
        CreatedAt: p.created_at,
      }));
      this.exportExcel(cleaned, "Properties.xlsx", "Properties");
    },

    downloadZones() {
      if (!this.zones.length) return alert("No property zone data available.");
      const cleaned = this.zones.map(z => ({
        ID: z.id,
        Name: z.name,
        Address: z.address,
        City: z.city,
        State: z.state,
        Owner: z.owner_id,
        Manager: z.manager_id,
      }));
      this.exportExcel(cleaned, "Zones.xlsx", "Zones");
    },

    downloadSubscriptions() {
      if (!this.subscriptions.length) return alert("No subscription data available.");
      let filtered = this.applyDateFilter(this.subscriptions, this.subscriptionFilter, "start_date");
      if (!filtered.length) return alert("No subscriptions found for the selected date range.");

      const cleaned = filtered.map(s => ({
        ID: s.id,
        Plan: s.plan_name,
        BillingCycle: s.billing_cycle,
        Price: s.price,
        User: s.user_id,
        StartDate: s.start_date,
        EndDate: s.end_date,
        Status: s.status,
        CreatedAt: s.created_at,
      }));
      this.exportExcel(cleaned, "Subscriptions.xlsx", "Subscriptions");
    },

    downloadTenants() {
      if (!this.tenants.length) return alert("No tenant data available.");
      const cleaned = this.tenants.map(t => ({
        ID: t.id,
        FullName: t.full_name,
        Email: t.email,
        Phone: t.phone,
        PropertyID: t.property_id,
        Status: t.status,
        CreatedAt: t.created_at,
      }));
      this.exportExcel(cleaned, "Tenants.xlsx", "Tenants");
    },

    downloadSubscriptionPayments() {
      if (!this.subscriptionPayments.length) return alert("No subscription payment data available.");
      let filtered = this.applyDateFilter(this.subscriptionPayments, this.subscriptionPaymentFilter, "payment_date");
      if (!filtered.length) return alert("No subscription payments found for the selected date range.");

      const cleaned = filtered.map(p => ({
        ID: p.id,
        SubscriptionID: p.subscription_id,
        Amount: p.amount,
        Method: p.payment_method,
        Date: p.payment_date,
        Status: p.status,
        CreatedAt: p.created_at,
      }));
      this.exportExcel(cleaned, "SubscriptionPayments.xlsx", "SubscriptionPayments");
    },

    downloadSalesPayments() {
      if (!this.salesPayments.length) return alert("No sales payment data available.");
      let filtered = this.applyDateFilter(this.salesPayments, this.salesPaymentFilter, "payment_date");
      if (!filtered.length) return alert("No sales payments found for the selected date range.");

      const cleaned = filtered.map(p => ({
        ID: p.id,
        SaleID: p.sale_id,
        Amount: p.amount,
        Method: p.payment_method,
        Date: p.payment_date,
        Status: p.status,
        CreatedAt: p.created_at,
      }));
      this.exportExcel(cleaned, "SalesPayments.xlsx", "SalesPayments");
    },

    downloadRentPayments() {
      if (!this.rentPayments.length) return alert("No rent payment data available.");
      let filtered = this.applyDateFilter(this.rentPayments, this.rentPaymentFilter, "due_date");
      if (!filtered.length) return alert("No rent payments found for the selected date range.");

      const cleaned = filtered.map(p => ({
        ID: p.id,
        TenantID: p.tenant_id,
        PropertyID: p.property_id,
        Amount: p.amount,
        Status: p.status,
        DueDate: p.due_date,
        CreatedAt: p.created_at,
      }));
      this.exportExcel(cleaned, "RentPayments.xlsx", "RentPayments");
    },

    async downloadUsers() {
      if (!this.selectedUserType) {
        return alert("Please select a user type to export.");
      }

      try {
        let data = [];
        let cleaned = [];
        let fileName = "";

        if (this.selectedUserType === "staffs") {
          data = await this.fetchAllPaginated("/get_staffs");
          cleaned = data.map(s => ({
            ID: s.id,
            FullName: s.full_name,
            Email: s.email,
            Phone: s.phone,
            Status: s.status,
            CreatedAt: s.created_at,
          }));
          fileName = "Staffs.xlsx";
        }

        if (this.selectedUserType === "managers") {
          data = await this.fetchAllPaginated("/get_managers");
          cleaned = data.map(m => ({
            ID: m.id,
            FullName: m.full_name,
            Email: m.email,
            Phone: m.phone,
            Status: m.status,
            CreatedAt: m.created_at,
          }));
          fileName = "Managers.xlsx";
        }

        if (this.selectedUserType === "owners") {
          data = await this.fetchAllPaginated("/get_owners");
          cleaned = data.map(o => ({
            ID: o.id,
            FullName: o.full_name,
            Email: o.email,
            Phone: o.phone,
            Status: o.status,
            CreatedAt: o.created_at,
          }));
          fileName = "Owners.xlsx";
        }

        if (this.selectedUserType === "tenants") {
          data = await this.fetchAllPaginated("/get_tenants");
          cleaned = data.map(t => ({
            ID: t.id,
            FullName: t.full_name,
            Email: t.email,
            Phone: t.phone,
            PropertyID: t.property_id,
            Status: t.status,
            CreatedAt: t.created_at,
          }));
          fileName = "Tenants.xlsx";
        }

        if (!data.length) return alert(`No ${this.capitalize(this.selectedUserType)} data available.`);

        this.exportExcel(cleaned, fileName, this.selectedUserType);
      } catch (error) {
        console.error("Export failed:", error);
        alert("Failed to export data.");
      }
    },

    /** ------------------ HELPERS ------------------ **/
    applyDateFilter(data, filter, field) {
      if (filter.from && filter.to) {
        const fromDate = new Date(filter.from);
        const toDate = new Date(filter.to);
        return data.filter(item => {
          const date = new Date(item[field]);
          return date >= fromDate && date <= toDate;
        });
      }
      return data;
    },

    exportExcel(data, fileName, sheetName) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, fileName);
    },

    capitalize(str) {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
  },
};
</script>
