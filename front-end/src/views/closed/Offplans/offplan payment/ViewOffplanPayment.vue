<template>
  <div class="min-h-full bg-background p-3">
    <div class="mx-auto max-w-7xl">
      <div class="mb-3 flex items-end justify-between">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide text-primary">Offplan</p>
          <h1 class="text-sm font-semibold text-slate-900">Payments</h1>
        </div>
        <button @click="addOpen=true" class="bg-primary px-3 py-1.5 text-xs font-semibold text-white">+ New payment</button>
      </div>

      <div class="mb-3 flex gap-2 border border-slate-200 bg-white p-2">
        <input v-model="search" class="h-8 w-full border border-slate-300 px-2 text-xs outline-none" placeholder="Search payment, transaction, status or application" />
        <button @click="load" class="border border-slate-300 px-3 text-xs">Refresh</button>
      </div>

      <div v-if="error" class="mb-3 flex h-8 items-center overflow-hidden border border-red-200 bg-red-50 px-3 text-xs text-red-700" :title="error">
        <i class="fas fa-exclamation-circle mr-2 shrink-0"></i><span class="truncate">{{ error }}</span>
      </div>

      <div class="overflow-x-auto border border-slate-200 bg-white">
        <table class="min-w-full text-left text-[10px]">
          <thead class="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-2 py-2">Amount</th>
              <th class="px-2 py-2">Status</th>
              <th class="px-2 py-2">Verified by</th>
              <th class="px-2 py-2">Method</th>
              <th class="px-2 py-2">Transaction</th>
              <th class="px-2 py-2">Due</th>
              <th class="px-2 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="x in filtered" :key="x.id" class="border-t border-slate-100">
              <td class="px-2 py-1.5 font-semibold text-slate-900">{{ x.amount ?? "—" }}</td>
              <td class="px-2 py-1.5">
                <select
                  :value="normalizedStatus(x.payment_status)"
                  :disabled="statusSavingId === x.id"
                  @change="changeStatus(x, $event.target.value)"
                  class="h-7 border border-slate-300 bg-white px-2 text-[10px] outline-none"
                >
                  <option v-for="status in paymentStatuses" :key="status" :value="status">{{ status }}</option>
                </select>
              </td>
              <td class="px-2 py-1.5 text-slate-600">{{ verifiedBy(x.verified_by) }}</td>
              <td class="px-2 py-1.5">{{ x.payment_method || "—" }}</td>
              <td class="px-2 py-1.5">{{ x.transaction_id || "—" }}</td>
              <td class="px-2 py-1.5">{{ x.due_date || "—" }}</td>
              <td class="px-2 py-1.5 text-right whitespace-nowrap">
                <router-link :to="{name:'OffplanPayment-detail',params:{id:x.id}}" class="border border-slate-300 px-2 py-1 text-[10px]">View</router-link>
                <button @click="edit(x.id)" class="ml-1 border border-primary px-2 py-1 text-[10px] text-primary">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="loading" class="p-6 text-center text-xs text-slate-500">Loading payments...</div>
        <div v-else-if="!filtered.length" class="p-6 text-center text-xs text-slate-500">No payments found.</div>
      </div>
    </div>

    <AddOffplanPayment :open="addOpen" @close="addOpen=false" @saved="load"/>
    <EditOffplanPayment :open="editOpen" :id="selectedId" @close="editOpen=false" @saved="load"/>
  </div>
</template>

<script>
import AddOffplanPayment from "./AddOffplanPayment.vue";
import EditOffplanPayment from "./EditOffplanPayment.vue";

export default {
  name: "ViewOffplanPayment",
  components: { AddOffplanPayment, EditOffplanPayment },
  data() {
    return {
      items: [],
      search: "",
      loading: false,
      error: "",
      addOpen: false,
      editOpen: false,
      selectedId: null,
      statusSavingId: null,
      paymentStatuses: ["pending", "completed", "failed", "cancelled", "overdue"],
    };
  },
  computed: {
    filtered() {
      const q = this.search.toLowerCase().trim();
      if (!q) return this.items;
      return this.items.filter((x) =>
        [x.id, x.amount, x.payment_status, x.payment_method, x.transaction_id, x.application, x.payment_plan, this.verifiedBy(x.verified_by)]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    },
  },
  mounted() {
    this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      this.error = "";
      try {
        const r = await this.$apiGet("/get_offplan_payments");
        const d = r?.data?.data || r?.data || r?.payments || r;
        this.items = Array.isArray(d) ? d : (d?.results || []);
      } catch (e) {
        this.error = this.shortError(e, "Unable to load payments.");
      } finally {
        this.loading = false;
      }
    },
    normalizedStatus(value) {
      return this.paymentStatuses.includes(value) ? value : "pending";
    },
    verifiedBy(value) {
      if (!value) return "—";
      if (typeof value === "object") {
        return value.name || value.full_name || value.username || value.email || value.id || "—";
      }
      return value;
    },
    shortError(error, fallback) {
      const raw = String(error?.response?.data?.detail || error?.response?.data?.message || error?.message || fallback);
      const cleaned = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      return cleaned.length > 140 ? cleaned.slice(0, 137) + "..." : cleaned;
    },
    async changeStatus(item, status) {
      this.statusSavingId = item.id;
      this.error = "";
      try {
        await this.$apiPatch("/update_offplan_payment", item.id, { payment_status: status });
        item.payment_status = status;
      } catch (e) {
        this.error = this.shortError(e, "Unable to update payment status.");
      } finally {
        this.statusSavingId = null;
      }
    },
    edit(id) {
      this.selectedId = id;
      this.editOpen = true;
    },
  },
};
</script>