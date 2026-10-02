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
                <td class="px-5 py-4 text-xs font-medium text-slate-700">{{ relationLabel(item.customer) }}</td>
                <td class="px-5 py-4 text-xs text-slate-700">{{ relationLabel(item.offplan_property) }}</td>
                <td class="px-5 py-4 text-xs font-bold text-slate-900">{{ item.agreed_price || "—" }}</td>
                <td class="px-5 py-4 text-xs text-slate-600">{{ item.preferred_payment_method || "—" }}</td>
                <td class="px-5 py-4"><span class="border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">{{ display(item.application_status) }}</span></td>
                <td class="px-5 py-4">
                  <div class="flex justify-end gap-2">
                    <router-link :to="{ name: 'OffplanApplication-detail', params: { id: item.id } }" class="border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:border-primary hover:text-primary">View</router-link>
                    <select :value="normalizedStatus(item.application_status)" @change="changeStatus(item, $event.target.value)" class="border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 outline-none focus:border-primary" :disabled="statusSavingId === item.id">
                      <option value="pending">Pending</option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
      statusSavingId: null
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
          this.relationLabel(item.customer),
          this.relationLabel(item.offplan_property)
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
        this.applications = await this.$getOffplanApplications();
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
    async changeStatus(item, status) {
      const previous = this.normalizedStatus(item.application_status);
      if (status === previous) return;
      this.statusSavingId = item.id;
      this.error = "";
      try {
        await this.$apiPatch("/update_offplan_application_status", item.id, { application_status: status });
        item.application_status = status;
      } catch (e) {
        this.error = this.shortError(e, "Unable to update the application status.");
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
    formatDate(value) {
      if (!value) return "—";
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
    }
  }
};
</script>
