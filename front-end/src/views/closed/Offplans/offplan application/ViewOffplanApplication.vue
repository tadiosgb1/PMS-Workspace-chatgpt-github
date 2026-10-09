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

      <div class="mb-3 flex flex-col gap-2 border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
        <div class="relative w-full md:max-w-md">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
          <input v-model="search" class="w-full border border-slate-200 py-1.5 pl-8 pr-2.5 text-xs outline-none focus:border-primary" placeholder="Search applications, customer or property" />
        </div>
        <button type="button" @click="load" :disabled="loading" class="border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
          <i :class="['fas fa-sync-alt mr-2', loading ? 'fa-spin' : '']"></i>Refresh
        </button>
      </div>

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
                <td class="px-2 py-1.5"><span class="font-bold text-slate-900">#{{ item.id }}</span><p class="mt-0.5 text-xs text-slate-500">{{ formatDate(item.created_at) }}</p></td>
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

        <p class="mb-4 text-xs text-slate-500">Application #{{ actionItem.id }}</p>

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
  mounted() {
    this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      this.error = "";
      try {
        this.applications = await this.$getOffplanProductApplications();
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
