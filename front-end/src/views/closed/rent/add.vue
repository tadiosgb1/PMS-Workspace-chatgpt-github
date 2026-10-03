<template>
  <div class="pms-brand-page">
    <Toast ref="toast" />
    <div
      v-if="visible"
      class="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="bg-white w-full max-w-[950px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-gray-100">
        
        <!-- Header -->
        <div class="px-8 py-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 bg-gray-100 rounded-2xl flex items-center justify-center">
              <i class="fas fa-file-contract text-xl text-gray-700"></i>
            </div>
            <div>
              <h2 class="text-2xl font-black text-gray-800 tracking-tight">Add New Rent</h2>
              <p class="text-gray-500 text-sm">Contract Configuration</p>
            </div>
          </div>
          <button 
            @click="$emit('close')" 
            class="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-8 space-y-10">
          
          <!-- Section 1 -->
          <div class="space-y-6">
            <div class="flex items-center gap-4">
              <span class="flex-none text-xs font-bold text-gray-500 uppercase tracking-widest">01. Property & Type</span>
              <div class="flex-1 h-px bg-gray-100"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="relative">
                <label class="block text-xs font-semibold text-gray-500 mb-2">Property</label>
                <div class="relative">
                  <i class="fas fa-building absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    v-model="propertySearch"
                    @input="fetchProperties"
                    @focus="propertyDropdown = true"
                    class="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                    placeholder="Search Property"
                    required
                  />
                </div>
                <ul v-if="propertyDropdown && properties.length" class="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                  <li
                    v-for="p in properties" :key="p.id"
                    @mousedown.prevent="selectProperty(p)"
                    class="px-5 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0"
                  >
                    {{ p.name }}
                  </li>
                </ul>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-2">Rent Type</label>
                <select v-model="form.rent_type" class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white" required>
                  <option value="">Select Rent Type</option>
                  <option value="lease">Lease</option>
                  <option value="house_rent">House Rent</option>
                  <option value="vehicle_rent">Vehicle Rent</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-2">Start Date</label>
                  <input v-model="form.start_date" type="date" class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" required />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-2">End Date</label>
                  <input v-model="form.end_date" type="date" class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-2">Payment Cycle</label>
                <select v-model="form.payment_cycle" class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white" required>
                  <option value="">Payment Cycle</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Section 2: Pricing -->
          <div class="bg-gray-50 border border-gray-100 rounded-3xl p-8">
            <div class="flex items-center gap-4 mb-6">
              <span class="flex-none text-xs font-bold text-gray-500 uppercase tracking-widest">02. Pricing</span>
              <div class="flex-1 h-px bg-gray-200"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-2">Rent Amount</label>
                <input v-model="form.rent_amount" type="number" class="w-full px-5 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="0.00" required />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-2">Deposit Amount</label>
                <input v-model="form.deposit_amount" type="number" class="w-full px-5 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="0.00" required />
              </div>
            </div>
          </div>

          <!-- Tenant Section -->
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">03. Tenant Information</span>
              <button type="button" @click="toggleTenantMode" class="text-xs font-semibold px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors">
                {{ tenantMode === 'search' ? 'Add New Tenant' : 'Search Existing' }}
              </button>
            </div>

            <div v-if="tenantMode === 'search'" class="relative">
              <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                v-model="tenantSearch"
                @input="fetchTenants"
                @focus="tenantDropdown = true"
                class="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Search Tenant by Name or Phone"
              />
              <ul v-if="tenantDropdown && tenants.length" class="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                <li v-for="u in tenants" :key="u.id" @mousedown.prevent="selectTenant(u)" class="px-5 py-3 hover:bg-gray-50 cursor-pointer">
                  {{ u.first_name }} {{ u.last_name }} <span class="text-xs text-gray-400">({{ u.phone_number }})</span>
                </li>
              </ul>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input v-model="tenant.first_name" class="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="First Name" />
              <input v-model="tenant.middle_name" class="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Middle Name" />
              <input v-model="tenant.last_name" class="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Last Name" />
              <input v-model="tenant.email" class="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Email" />
              <input v-model="tenant.phone_number" class="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Phone Number" />
              <input v-model="tenant.address" class="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Address" />
              <input v-model="tenant.password" type="password" class="md:col-span-3 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Set Password" />
            </div>
          </div>

          <!-- Broker Section -->
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">04. Broker Attribution</span>
              <button type="button" @click="toggleBrokerMode" class="text-xs font-semibold px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors">
                {{ brokerMode === 'search' ? 'Add New Broker' : 'Search Existing' }}
              </button>
            </div>

            <div v-if="brokerMode === 'search'" class="relative">
              <input
                v-model="brokerSearch"
                @input="fetchBrokers"
                @focus="brokerDropdown = true"
                class="w-full px-5 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Search Broker"
              />
              <ul v-if="brokerDropdown && brokers.length" class="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                <li v-for="u in brokers" :key="u.id" @mousedown.prevent="selectBroker(u)" class="px-5 py-3 hover:bg-gray-50 cursor-pointer">
                  {{ u.first_name }} {{ u.last_name }}
                </li>
              </ul>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input v-model="brokerForm.first_name" class="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="First Name" />
              <input v-model="brokerForm.middle_name" class="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Middle Name" />
              <input v-model="brokerForm.last_name" class="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Last Name" />
              <input v-model="brokerForm.email" class="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Email" />
              <input v-model="brokerForm.phone_number" class="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Phone Number" />
              <input v-model="brokerForm.address" class="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Address" />
              <input v-model="brokerForm.password" type="password" class="md:col-span-3 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Set Password" />
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="sticky bottom-0 bg-white pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
            <button type="button" @click="$emit('close')" class="px-8 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="loading"
              class="px-10 py-3 bg-gray-900 hover:bg-black text-white rounded-2xl font-semibold flex items-center gap-2 transition-all"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              {{ loading ? 'Saving...' : 'Save Rent Contract' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";

export default {
  components: { Toast },
  props: { visible: Boolean },

  data() {
    return {
      loading: false,

      tenantMode: "search",
      brokerMode: "search",

      properties: [],
      propertySearch: "",
      propertyDropdown: false,

      tenants: [],
      tenantSearch: "",
      tenantDropdown: false,
      selectedTenant: null,

      brokers: [],
      brokerSearch: "",
      brokerDropdown: false,
      selectedBroker: null,

      form: {
        property_id: "",
        rent_type: "",
        start_date: "",
        end_date: "",
        payment_cycle: "",
        rent_amount: "",
        deposit_amount: "",
        status: "pending"
      },

      tenant: {
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        address: "",
        password: "",
        is_tenant: true,
      },

      brokerForm: {
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        address: "",
        password: "",
      },
    };
  },

  methods: {
    toggleTenantMode() {
      this.tenantMode = this.tenantMode === "search" ? "add" : "search";
      this.selectedTenant = null;
      this.tenantSearch = "";
    },

    toggleBrokerMode() {
      this.brokerMode = this.brokerMode === "search" ? "add" : "search";
      this.selectedBroker = null;
      this.brokerSearch = "";
    },

    async fetchProperties() {
      try {
        const res = await this.$getProperties({ page: 1, page_size: 1000, search: this.propertySearch });
        this.properties = res.properties || [];
      } catch (e) {}
    },

    selectProperty(p) {
      this.form.property_id = p.id;
      this.propertySearch = p.name;
      this.propertyDropdown = false;
    },

    async fetchTenants() {
      try {
        const res = await this.$apiGet("/get_users", { search: this.tenantSearch, is_tenant: true });
        this.tenants = res.data || [];
      } catch (e) {}
    },

    selectTenant(u) {
      this.selectedTenant = u;
      this.tenantSearch = `${u.first_name} ${u.last_name}`;
      this.tenantDropdown = false;
    },

    async fetchBrokers() {
      try {
        const res = await this.$apiGet("/get_users", { search: this.brokerSearch, is_broker: true });
        this.brokers = res.data || [];
      } catch (e) {}
    },

    selectBroker(u) {
      this.selectedBroker = u;
      this.brokerSearch = `${u.first_name} ${u.last_name}`;
      this.brokerDropdown = false;
    },

    async handleSubmit() {
      this.loading = true;
      try {
        const tenantId = this.tenantMode === "search" && this.selectedTenant
          ? this.selectedTenant.id
          : (await this.$apiPost("/sign_up", { ...this.tenant, is_tenant: true })).user.id;

        await this.$apiPost("/post_rent", {
          ...this.form,
          user_id: tenantId,
          broker: null,
        });

        this.$root.$refs.toast.showToast("Rent added successfully", "success");
        this.$emit("refresh");
        this.$emit("close");
      } catch (e) {
        this.$root.$refs.toast.showToast("Failed to add rent", "error");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>