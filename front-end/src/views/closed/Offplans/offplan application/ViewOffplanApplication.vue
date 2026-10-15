<template>
  <div class="min-h-full bg-background p-4 md:p-6 lg:p-8">
    <div class="mx-auto max-w-7xl">
      <header class="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
        <h1 class="text-lg font-semibold text-slate-900">Offplan applications</h1>
      </header>

      <div class="mb-3 grid border border-slate-200 bg-white sm:grid-cols-3">
        <div class="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-3 sm:border-b-0 sm:border-r">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Total</p><p class="text-lg font-semibold leading-none text-slate-900">{{ filteredApplications.length }}</p>
        </div>
        <div class="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-3 sm:border-b-0 sm:border-r">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Pending</p><p class="text-lg font-semibold leading-none text-primary">{{ pendingCount }}</p>
        </div>
        <div class="flex h-14 items-center justify-between border border-slate-200 bg-white px-3">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Agreed value</p><p class="text-lg font-semibold leading-none text-slate-900">{{ agreedValue }}</p>
        </div>
      </div>

      <section class="mb-3 border border-slate-200 bg-white p-3">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label class="mb-1 block text-[11px] font-semibold text-slate-600">Search applications</label>
            <input v-model="search" @keyup.enter="applyFilters" class="w-full border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary" placeholder="Search applications, customer or property" />
          </div>
          <div>
            <label for="application-ordering" class="mb-1 block text-[11px] font-semibold text-slate-600">Order by</label>
            <select id="application-ordering" v-model="filters.ordering" class="w-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary">
              <option value="-created_at">Newest first</option><option value="created_at">Oldest first</option>
              <option value="application_status">Status A to Z</option><option value="-application_status">Status Z to A</option>
            </select>
          </div>
          <div>
            <label for="application-property" class="mb-1 block text-[11px] font-semibold text-slate-600">Offplan property</label>
            <select id="application-property" v-model="filters.offplan_property" class="w-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary">
              <option value="">All properties</option><option v-for="property in offplanProperties" :key="property.id" :value="String(property.id)">{{ property.name }}</option>
            </select>
          </div>
          <div>
            <label for="application-payment-product" class="mb-1 block text-[11px] font-semibold text-slate-600">Payment product</label>
            <input id="application-payment-product" v-model.trim="filters.payment_product" @keyup.enter="applyFilters" class="w-full border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary" placeholder="Exact payment product" />
          </div>
          <div>
            <label for="application-phone" class="mb-1 block text-[11px] font-semibold text-slate-600">Customer phone number</label>
            <input id="application-phone" v-model.trim="filters.customer__phone_number" @keyup.enter="applyFilters" class="w-full border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary" placeholder="Exact phone number" />
          </div>
          <div>
            <label for="application-status" class="mb-1 block text-[11px] font-semibold text-slate-600">Application status</label>
            <select id="application-status" v-model="filters.application_status" class="w-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary">
              <option value="">All statuses</option><option v-for="status in applicationStatuses" :key="status" :value="status">{{ display(status) }}</option>
            </select>
          </div>
          <div>
            <label for="application-zone" class="mb-1 block text-[11px] font-semibold text-slate-600">Property zone</label>
            <select id="application-zone" v-model="filters.offplan_property__property_zone" class="w-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary">
              <option value="">All zones</option><option v-for="zone in zones" :key="zone.id" :value="String(zone.id)">{{ zone.name }}</option>
            </select>
          </div>
          <div v-if="canFilterOwners" class="relative">
            <label for="application-owner-search" class="mb-1 block text-[11px] font-semibold text-slate-600">Property owner</label>
            <input id="application-owner-search" v-model="ownerSearch" type="search" autocomplete="off" @focus="onOwnerFocus" @input="searchOwners" @keydown.esc="ownerDropdownOpen = false" class="w-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary" placeholder="Search owners…" />
            <button v-if="filters.offplan_property__owner" type="button" @click="clearOwner" class="absolute right-2 top-7 px-1 text-sm text-slate-500" aria-label="Clear owner">×</button>
            <div v-if="ownerDropdownOpen" class="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto border border-slate-200 bg-white shadow-lg">
              <div v-if="ownersLoading" class="px-3 py-2 text-xs text-slate-500">Searching owners…</div>
              <div v-else-if="owners.length === 0" class="px-3 py-2 text-xs text-slate-500">No owners found</div>
              <button v-else v-for="owner in owners" :key="owner.id" type="button" @mousedown.prevent="selectOwner(owner)" class="block w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50">{{ owner.name }}</button>
            </div>
          </div>
        </div>
        <div class="mt-3 flex flex-wrap justify-end gap-2">
          <button type="button" @click="resetFilters" :disabled="loading" class="border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Clear filters</button>
          <button type="button" @click="applyFilters" :disabled="loading" class="bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90">Apply filters</button>
          <button type="button" @click="load" :disabled="loading" class="border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"><i :class="['fas fa-sync-alt mr-2', loading ? 'fa-spin' : '']"></i>Refresh</button>
        </div>
      </section>

      <div v-if="error" class="mb-3 flex min-h-8 max-h-8 items-center overflow-hidden border border-red-200 bg-red-50 px-3 text-xs text-red-700" :title="error">
        <i class="fas fa-exclamation-circle mr-2 shrink-0"></i><span class="truncate">{{ error }}</span>
      </div>

      <div class="overflow-hidden border border-slate-200 bg-white">
        <div v-if="loading" class="p-12 text-center text-sm text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading applications…</div>
        <div v-else-if="filteredApplications.length === 0" class="p-12 text-center">
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-primary/20 bg-primary/10 text-primary"><i class="fas fa-file-signature"></i></div>
          <p class="font-semibold text-slate-900">No applications found</p>
          <p class="mt-1 text-sm text-slate-500">Customer applications will appear here when submitted.</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-left">
            <thead class="border-b border-slate-200 bg-slate-50">
              <tr class="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th class="px-2 py-2">Application</th>
                <th class="px-5 py-3">Customer</th>
                <th class="px-5 py-3">Property</th>
                <th class="px-5 py-3">Agreed price</th>
                <th class="px-5 py-3">Payment</th>
                <th class="px-5 py-3">Status</th>
                <th class="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in filteredApplications" :key="item.id" class="hover:bg-slate-50">
                <td class="px-2 py-1.5"><span class="font-bold text-slate-900">{{ formatDate(item.created_at) }}</span></td>
                <td class="px-5 py-4 text-xs font-medium text-slate-700">{{ customerLabel(item) }}</td>
                <td class="px-5 py-4 text-xs text-slate-700">{{ propertyLabel(item) }}</td>
                <td class="px-5 py-4 text-xs font-bold text-slate-900">{{ item.agreed_price || "—" }}</td>
                <td class="px-5 py-4 text-xs text-slate-600">{{ item.preferred_payment_method || "—" }}</td>
                <td class="px-5 py-4"><span class="border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">{{ display(item.application_status) }}</span></td>
                <td class="px-5 py-4">
                  <div class="flex justify-end gap-2">
                    <router-link :to="{ name: 'OffplanApplication-detail', params: { id: item.id } }" class="border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:border-primary hover:text-primary">View</router-link>
                    <button
                      v-if="normalizedStatus(item.application_status) === 'pending'"
                      type="button"
                      @click="openAction(item, 'approve')"
                      class="border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                      :disabled="statusSavingId === item.id"
                    >Approve</button>
                    <button
                      v-if="normalizedStatus(item.application_status) === 'pending'"
                      type="button"
                      @click="openAction(item, 'reject')"
                      class="border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                      :disabled="statusSavingId === item.id"
                    >Reject</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="actionItem" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div class="w-full max-w-md border border-slate-200 bg-white p-5 shadow-xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-900">{{ actionType === 'approve' ? 'Approve application' : 'Reject application' }}</h2>
          <button type="button" @click="closeAction" class="text-slate-400 hover:text-slate-700" :disabled="statusSavingId === actionItem.id">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <p class="mb-4 text-xs text-slate-500">Please confirm this application.</p>

        <div v-if="actionType === 'approve'">
          <label class="mb-1 block text-xs font-medium text-slate-700">Start date</label>
          <input v-model="actionStartDate" type="date" class="w-full border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary" />
        </div>

        <div v-else>
          <label class="mb-1 block text-xs font-medium text-slate-700">Notes</label>
          <textarea v-model="actionNotes" rows="4" class="w-full resize-none border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary" placeholder="Enter the reason for rejection"></textarea>
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <button type="button" @click="closeAction" class="border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50" :disabled="statusSavingId === actionItem.id">Cancel</button>
          <button
            type="button"
            @click="submitAction"
            class="px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            :class="actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'"
            :disabled="statusSavingId === actionItem.id || (actionType === 'approve' ? !actionStartDate : !actionNotes.trim())"
          >
            {{ statusSavingId === actionItem.id ? 'Saving…' : (actionType === 'approve' ? 'Approve application' : 'Reject application') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ViewOffplanApplication",
  data() {
    return {
      applications: [],
      offplanProperties: [],
      zones: [],
      owners: [],
      ownerSearch: "",
      ownerDropdownOpen: false,
      ownersLoading: false,
      ownerSearchRequest: 0,
      role: "",
      filters: { ordering: "-created_at", offplan_property: "", payment_product: "", customer: "", "customer__phone_number": "", application_status: "", "offplan_property__property_zone": "", "offplan_property__owner": "" },
      loading: false,
      error: "",
      search: "",
      statusSavingId: null,
      actionItem: null,
      actionType: null,
      actionStartDate: "",
      actionNotes: ""
    };
  },
  computed: {
    canFilterOwners() {
      return ["superuser", "super_user", "super_staff"].includes(this.role);
    },
    applicationStatuses() {
      return [...new Set(this.applications.map(item => item?.application_status).filter(Boolean))].sort();
    },
    filteredApplications() {
      const query = this.search.trim().toLowerCase();
      if (!query) return this.applications;
      return this.applications.filter(item => {
        const haystack = [
          item.id,
          item.agreed_price,
          item.application_status,
          item.preferred_payment_method,
          item.notes,
          this.customerLabel(item),
          this.propertyLabel(item)
        ].join(" ").toLowerCase();
        return haystack.includes(query);
      });
    },
    pendingCount() {
      return this.filteredApplications.filter(item => this.normalizedStatus(item.application_status) === "pending").length;
    },
    agreedValue() {
      const total = this.filteredApplications.reduce((sum, item) => {
        const value = Number(String(item.agreed_price || "").replace(/,/g, ""));
        return Number.isFinite(value) ? sum + value : sum;
      }, 0);
      return total ? total.toLocaleString() : "—";
    }
  },
  async mounted() {
    this.role = String(this.$getRole ? this.$getRole() : localStorage.getItem("role") || "").trim().toLowerCase().replace(/[ -]/g, "_");
    await Promise.all([this.loadLookups(), this.load()]);
  },
  methods: {
    normalizeList(response, keys = []) {
      const raw = response?.data ?? response;
      if (Array.isArray(raw)) return raw;
      for (const key of keys) if (Array.isArray(raw?.[key])) return raw[key];
      return Array.isArray(raw?.results) ? raw.results : [];
    },
    normalizeOwner(item) {
      const id = item?.id ?? item?.user_id ?? item?.owner_id;
      const name = item?.name || item?.full_name || [item?.first_name, item?.last_name].filter(Boolean).join(" ") || item?.username || item?.email || ("Owner " + id);
      return { id: Number(id), name: String(name).trim() };
    },
    async loadLookups() {
      try {
        const [propertiesResponse, zoneResponse] = await Promise.all([
          this.$getOffplanProperties(),
          this.$getZones({ page: 1, pageSize: 1000 })
        ]);
        this.offplanProperties = this.normalizeList(propertiesResponse, ["properties", "offplan_properties", "results"]).map(item => ({
          id: item?.id ?? item?.offplan_property_id,
          name: item?.name || item?.title || item?.developer || ("Property " + (item?.id ?? item?.offplan_property_id))
        })).filter(item => item.id != null);
        this.zones = (zoneResponse?.zones || zoneResponse?.data?.zones || []).map(item => ({ id: item.id ?? item.zone_id, name: item.name || item.zone_name || item.title || "Unnamed zone" })).filter(item => item.id != null);
        if (this.canFilterOwners) await this.fetchOwners("");
      } catch (e) {
        this.error = this.shortError(e, "Unable to load application filter options.");
      }
    },
    async onOwnerFocus() {
      this.ownerDropdownOpen = true;
      if (!this.owners.length) await this.fetchOwners(this.ownerSearch);
    },
    async searchOwners() {
      this.filters["offplan_property__owner"] = "";
      this.ownerDropdownOpen = true;
      await this.fetchOwners(this.ownerSearch);
    },
    async fetchOwners(search = "") {
      const requestId = ++this.ownerSearchRequest;
      this.ownersLoading = true;
      try {
        const params = { page: 1, page_size: 50 };
        if (String(search).trim()) params.search = String(search).trim();
        const response = await this.$apiGet("/get_owners", params);
        if (requestId === this.ownerSearchRequest) this.owners = this.normalizeList(response, ["owners", "results"]).map(this.normalizeOwner).filter(item => item.id);
      } catch (e) {
        if (requestId === this.ownerSearchRequest) this.owners = [];
      } finally {
        if (requestId === this.ownerSearchRequest) this.ownersLoading = false;
      }
    },
    selectOwner(owner) {
      this.filters["offplan_property__owner"] = String(owner.id);
      this.ownerSearch = owner.name;
      this.ownerDropdownOpen = false;
    },
    clearOwner() {
      this.filters["offplan_property__owner"] = "";
      this.ownerSearch = "";
      this.ownerDropdownOpen = true;
      this.fetchOwners("");
    },
    applyFilters() {
      this.ownerDropdownOpen = false;
      this.load();
    },
    resetFilters() {
      this.search = "";
      this.ownerSearch = "";
      this.ownerDropdownOpen = false;
      this.filters = { ordering: "-created_at", offplan_property: "", payment_product: "", customer: "", "customer__phone_number": "", application_status: "", "offplan_property__property_zone": "", "offplan_property__owner": "" };
      this.load();
    },
    async load() {
      this.loading = true;
      this.error = "";
      try {
        const params = { ...this.filters };
        Object.keys(params).forEach(key => { if (params[key] === "" || params[key] == null) delete params[key]; });
        if (!this.canFilterOwners) delete params["offplan_property__owner"];
        const response = await this.$getOffplanProductApplications(params);
        this.applications = this.normalizeList(response, ["applications", "results", "data"]);
      } catch (e) {
        this.error = this.shortError(e, "Unable to load offplan applications.");
      } finally {
        this.loading = false;
      }
    },
    shortError(error, fallback) {
      const raw = String(error?.response?.data?.detail || error?.response?.data?.message || error?.message || fallback);
      const cleaned = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      return cleaned.length > 140 ? `${cleaned.slice(0, 137)}...` : cleaned;
    },
    normalizedStatus(value) {
      return value ? String(value).toLowerCase() : "pending";
    },
    openAction(item, type) {
      this.actionItem = item;
      this.actionType = type;
      this.actionStartDate = "";
      this.actionNotes = "";
      this.error = "";
    },
    closeAction() {
      if (this.statusSavingId) return;
      this.actionItem = null;
      this.actionType = null;
      this.actionStartDate = "";
      this.actionNotes = "";
    },
    async submitAction() {
      if (!this.actionItem) return;

      const item = this.actionItem;
      const type = this.actionType;
      this.statusSavingId = item.id;
      this.error = "";

      try {
        if (type === "approve") {
          if (!this.actionStartDate) return;
          await this.$apiPost("/approve_offplan_product_application", {
            application_id: item.id,
            start_date: this.actionStartDate
          });
        } else {
          const notes = this.actionNotes.trim();
          if (!notes) return;
          await this.$apiPost("/reject_offplan_product_application", {
            application_id: item.id,
            notes
          });
        }

        this.actionItem = null;
        this.actionType = null;
        this.actionStartDate = "";
        this.actionNotes = "";
        await this.load();
      } catch (e) {
        this.error = this.shortError(e, type === "approve"
          ? "Unable to approve the application."
          : "Unable to reject the application.");
      } finally {
        this.statusSavingId = null;
      }
    },
    display(value) {
      return String(value || "—").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    },
    relationLabel(value) {
      if (value && typeof value === "object") {
        return value.name || value.full_name || value.title || value.display_name || value.id || "—";
      }
      return value ?? "—";
    },
    customerLabel(item) {
      const customer = item?.customer;
      if (customer && typeof customer === "object") {
        const fullName = [customer.first_name, customer.last_name]
          .filter(part => part != null && String(part).trim())
          .map(part => String(part).trim())
          .join(" ");
        return fullName || customer.full_name || customer.name || customer.display_name || customer.phone || customer.phone_number || customer.id || "—";
      }
      return this.relationLabel(customer);
    },
    propertyLabel(item) {
      const property = item?.payment_product?.offplan_property
        || (item?.offplan_property && typeof item.offplan_property === "object" ? item.offplan_property : null);
      if (property && typeof property === "object") {
        const zoneName = property.property_zone?.name || property.propertyZone?.name;
        return zoneName || property.name || property.title || property.display_name || property.developer || property.id || "—";
      }
      return this.relationLabel(item?.offplan_property);
    },
    formatDate(value) {
      if (!value) return "—";
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
    }
  }
};
</script>
