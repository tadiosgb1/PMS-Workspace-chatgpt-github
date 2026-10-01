<template>
  <div class="min-h-full bg-background p-4 md:p-6 lg:p-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary">Offplan sales</p>
          <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-900">Offplan Applications</h1>
          <p class="mt-1 text-sm text-slate-500">Manage customer applications, agreed prices and payment preferences.</p>
        </div>
        <button type="button" @click="addOpen = true" class="border border-primary bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90">
          <i class="fas fa-plus mr-2"></i>New application
        </button>
      </div>

      <div class="mb-5 grid gap-3 sm:grid-cols-3">
        <div class="border border-slate-200 bg-white px-5 py-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total applications</p>
          <p class="mt-1 text-2xl font-black text-slate-900">{{ filteredApplications.length }}</p>
        </div>
        <div class="border border-slate-200 bg-white px-5 py-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
          <p class="mt-1 text-2xl font-black text-primary">{{ pendingCount }}</p>
        </div>
        <div class="border border-slate-200 bg-white px-5 py-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Agreed value</p>
          <p class="mt-1 text-2xl font-black text-slate-900">{{ agreedValue }}</p>
        </div>
      </div>

      <div class="mb-4 flex flex-col gap-3 border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div class="relative w-full md:max-w-md">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input v-model="search" class="w-full border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" placeholder="Search applications, customer or property" />
        </div>
        <button type="button" @click="load" :disabled="loading" class="border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
          <i :class="['fas fa-sync-alt mr-2', loading ? 'fa-spin' : '']"></i>Refresh
        </button>
      </div>

      <div v-if="error" class="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

      <div class="overflow-hidden border border-slate-200 bg-white">
        <div v-if="loading" class="p-12 text-center text-sm text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading applications…</div>
        <div v-else-if="filteredApplications.length === 0" class="p-12 text-center">
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-primary/20 bg-primary/10 text-primary"><i class="fas fa-file-signature"></i></div>
          <p class="font-semibold text-slate-900">No applications found</p>
          <p class="mt-1 text-sm text-slate-500">Create the first offplan application to start tracking customer interest.</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-left">
            <thead class="border-b border-slate-200 bg-slate-50">
              <tr class="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th class="px-5 py-3">Application</th>
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
                <td class="px-5 py-4"><span class="font-bold text-slate-900">#{{ item.id }}</span><p class="mt-0.5 text-xs text-slate-500">{{ formatDate(item.created_at) }}</p></td>
                <td class="px-5 py-4 text-sm font-medium text-slate-700">{{ relationLabel(item.customer) }}</td>
                <td class="px-5 py-4 text-sm text-slate-700">{{ relationLabel(item.offplan_property) }}</td>
                <td class="px-5 py-4 text-sm font-bold text-slate-900">{{ item.agreed_price || "—" }}</td>
                <td class="px-5 py-4 text-sm text-slate-600">{{ item.preferred_payment_method || "—" }}</td>
                <td class="px-5 py-4"><span class="border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{{ display(item.application_status) }}</span></td>
                <td class="px-5 py-4">
                  <div class="flex justify-end gap-2">
                    <router-link :to="{ name: 'OffplanApplication-detail', params: { id: item.id } }" class="border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary">View</router-link>
                    <button type="button" @click="openEdit(item.id)" class="border border-primary/20 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10">Edit</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <AddOffplanApplication :open="addOpen" @close="addOpen = false" @saved="load" />
    <EditOffplanApplication :open="editOpen" :id="selectedId" @close="editOpen = false" @saved="load" />
  </div>
</template>

<script>
import AddOffplanApplication from "./AddOffplanApplication.vue";
import EditOffplanApplication from "./EditOffplanApplication.vue";

export default {
  name: "ViewOffplanApplication",
  components: { AddOffplanApplication, EditOffplanApplication },
  data() {
    return {
      applications: [],
      loading: false,
      error: "",
      search: "",
      addOpen: false,
      editOpen: false,
      selectedId: null
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
      return this.applications.filter(item => String(item.application_status).toLowerCase() === "pending").length;
    },
    agreedValue() {
      const total = this.applications.reduce((sum, item) => {
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
        const res = await this.$apiGet("/get_offplan_applications");
        const data = res?.data?.data || res?.data || res?.applications || res;
        this.applications = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
      } catch (e) {
        this.error = e?.message || "Unable to load offplan applications.";
      } finally {
        this.loading = false;
      }
    },
    openEdit(id) {
      this.selectedId = id;
      this.editOpen = true;
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
