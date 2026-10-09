<template>
  <div class="min-h-full bg-background p-3">
    <div class="mx-auto max-w-7xl">
      <div class="mb-3 flex items-end justify-between">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide text-primary">Offplan</p>
          <h1 class="text-sm font-semibold text-slate-900">Offplan payments</h1>
          <p class="mt-1 text-xs text-slate-500">Review payment slips and approve or reject each payment.</p>
        </div>
        <button @click="load" :disabled="loading" class="border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-60">
          <i :class="['fas fa-sync-alt mr-1', loading ? 'fa-spin' : '']"></i>Refresh
        </button>
      </div>

      <div class="mb-3 flex gap-2 border border-slate-200 bg-white p-2">
        <input v-model="search" class="h-8 w-full border border-slate-300 px-2 text-xs outline-none" placeholder="Search customer, property, payment or status" />
      </div>

      <div v-if="error" class="mb-3 flex min-h-8 items-center border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
        <i class="fas fa-exclamation-circle mr-2 shrink-0"></i>{{ error }}
      </div>
      <div v-if="notice" class="mb-3 border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{{ notice }}</div>

      <div class="overflow-x-auto border border-slate-200 bg-white">
        <table class="min-w-full text-left text-xs">
          <thead class="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-3 py-2">Customer</th>
              <th class="px-3 py-2">Property / Application</th>
              <th class="px-3 py-2">Agreed price</th>
              <th class="px-3 py-2">Payment</th>
              <th class="px-3 py-2">Payment slip</th>
              <th class="px-3 py-2">Status</th>
              <th class="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filtered" :key="item.id" class="border-t border-slate-100 align-top hover:bg-slate-50">
              <td class="px-3 py-3">
                <p class="font-semibold text-slate-900">{{ customerName(item) }}</p>
                <p class="mt-1 text-[11px] text-slate-500">{{ item.customer?.phone_number || '—' }}</p>
              </td>
              <td class="px-3 py-3">
                <p class="font-medium text-slate-900">{{ propertyName(item) }}</p>
                <p class="mt-1 text-[11px] text-slate-500">Application #{{ relationId(item.application) }} · {{ display(item.application?.application_status) }}</p>
              </td>
              <td class="px-3 py-3 font-medium text-slate-900">{{ money(item.application?.agreed_price) }}</td>
              <td class="px-3 py-3">
                <p class="font-semibold text-slate-900">{{ money(item.amount) }}</p>
                <p class="mt-1 text-[11px] text-slate-500">{{ display(item.payment_method) }}</p>
                <p v-if="item.transaction_id" class="mt-1 break-all text-[11px] text-slate-500">Ref: {{ item.transaction_id }}</p>
              </td>
              <td class="px-3 py-3">
                <a v-if="slipUrl(item)" :href="slipUrl(item)" target="_blank" rel="noopener noreferrer" class="inline-flex flex-col items-start gap-1">
                  <img :src="slipUrl(item)" alt="Payment slip" class="h-20 w-28 border border-slate-200 object-cover" @error="markSlipUnavailable(item.id)" />
                  <span class="text-[10px] font-semibold text-primary">View full slip ↗</span>
                </a>
                <span v-else class="text-[11px] text-slate-400">No slip uploaded</span>
              </td>
              <td class="px-3 py-3">
                <span class="inline-block border px-2 py-1 text-[10px] font-semibold" :class="statusClass(item.payment_status)">{{ display(item.payment_status || 'pending') }}</span>
              </td>
              <td class="px-3 py-3 text-right">
                <div class="flex flex-wrap justify-end gap-1.5">
                  <button @click="viewDetails(item)" class="border border-primary/30 bg-primary/5 px-2 py-1.5 text-[10px] font-semibold text-primary hover:bg-primary/10">Details</button>
                  <template v-if="isPending(item)">
                    <button @click="confirmAction(item, 'approve')" :disabled="savingId === item.id" class="border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">Approve</button>
                    <button @click="confirmAction(item, 'reject')" :disabled="savingId === item.id" class="border border-red-200 bg-red-50 px-2 py-1.5 text-[10px] font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50">Reject</button>
                  </template>
                  <span v-else class="self-center text-[10px] text-slate-400">Reviewed</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="loading" class="p-6 text-center text-xs text-slate-500">Loading payments...</div>
        <div v-else-if="!filtered.length" class="p-6 text-center text-xs text-slate-500">No payments found.</div>
      </div>
    </div>

    <div v-if="actionItem" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div class="w-full max-w-md border border-slate-200 bg-white p-5 shadow-xl">
        <h2 class="text-sm font-semibold text-slate-900">{{ actionType === 'approve' ? 'Approve payment?' : 'Reject payment?' }}</h2>
        <p class="mt-2 text-xs leading-5 text-slate-600">
          {{ actionType === 'approve' ? 'This will mark the payment as completed.' : 'This will mark the payment as failed.' }}
          Payment #{{ actionItem.id }} · {{ money(actionItem.amount) }}
        </p>
        <div class="mt-5 flex justify-end gap-2">
          <button @click="actionItem = null" :disabled="savingId === actionItem.id" class="border border-slate-200 px-3 py-2 text-xs text-slate-700 disabled:opacity-50">Cancel</button>
          <button @click="submitAction" :disabled="savingId === actionItem.id" class="px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" :class="actionType === 'approve' ? 'bg-emerald-600' : 'bg-red-600'">
            {{ savingId === actionItem.id ? 'Saving…' : (actionType === 'approve' ? 'Confirm approval' : 'Confirm rejection') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ViewOffplanPayment",
  data() {
    return {
      items: [],
      search: "",
      loading: false,
      error: "",
      notice: "",
      savingId: null,
      actionItem: null,
      actionType: null,
      unavailableSlips: []
    };
  },
  computed: {
    filtered() {
      const q = this.search.trim().toLowerCase();
      if (!q) return this.items;
      return this.items.filter(item => [
        item.id, item.amount, item.payment_status, item.payment_method, item.transaction_id,
        this.customerName(item), this.propertyName(item), item.application?.id,
        item.application?.application_status, item.application?.agreed_price
      ].join(" ").toLowerCase().includes(q));
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      this.error = "";
      this.notice = "";
      try {
        this.items = await this.$getOffplanPayments();
      } catch (e) {
        this.error = this.shortError(e, "Unable to load offplan payments.");
      } finally {
        this.loading = false;
      }
    },
    customerName(item) {
      const customer = item?.customer || item?.application?.customer;
      if (!customer || typeof customer !== "object") return customer || "—";
      return [customer.first_name, customer.middle_name, customer.last_name]
        .filter(v => v && String(v).trim()).join(" ") || customer.email || customer.phone_number || (customer.id ? `Customer #${customer.id}` : "—");
    },
    propertyName(item) {
      const property = item?.application?.offplan_property
        || item?.payment_product?.offplan_property
        || item?.offplan_property;
      if (!property || typeof property !== "object") return "—";
      return property.property_zone?.name || property.name || property.title || property.developer || (property.id ? `Property #${property.id}` : "—");
    },
    relationId(value) {
      if (value && typeof value === "object") return value.id ?? "—";
      return value ?? "—";
    },
    slipUrl(item) {
      if (this.unavailableSlips.includes(item.id)) return "";
      const url = item?.slip_picture;
      if (!url) return "";
      if (/^https?:\/\//i.test(url)) return url;
      return `https://api.property.alpha.com.et${url.startsWith("/") ? "" : "/"}${url}`;
    },
    markSlipUnavailable(id) {
      if (!this.unavailableSlips.includes(id)) this.unavailableSlips.push(id);
    },
    isPending(item) {
      return ["pending", "submitted", "under_review"].includes(String(item.payment_status || "pending").toLowerCase());
    },
    statusClass(value) {
      const status = String(value || "pending").toLowerCase();
      if (["completed", "approved", "paid"].includes(status)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
      if (["failed", "rejected", "cancelled"].includes(status)) return "border-red-200 bg-red-50 text-red-700";
      return "border-amber-200 bg-amber-50 text-amber-700";
    },
    display(value) {
      if (value === null || value === undefined || value === "") return "—";
      return String(value).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    },
    money(value) {
      if (value === null || value === undefined || value === "") return "—";
      const number = Number(value);
      return Number.isFinite(number) ? number.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value;
    },
    shortError(error, fallback) {
      const raw = String(error?.response?.data?.detail || error?.response?.data?.message || error?.message || fallback);
      const cleaned = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      return cleaned.length > 180 ? cleaned.slice(0, 177) + "..." : cleaned;
    },
    viewDetails(item) {
      this.$router.push({
        name: "OffplanPayment-detail",
        params: { id: item.id }
      });
    },
    confirmAction(item, type) {
      this.actionItem = item;
      this.actionType = type;
      this.error = "";
      this.notice = "";
    },
    async submitAction() {
      if (!this.actionItem || !this.actionType) return;
      const item = this.actionItem;
      const type = this.actionType;
      this.savingId = item.id;
      this.error = "";
      this.notice = "";
      try {
        const payment_status = type === "approve" ? "completed" : "failed";
        await this.$apiPatch("/update_offplan_payment", item.id, { payment_status });
        item.payment_status = payment_status;
        this.actionItem = null;
        this.actionType = null;
        this.notice = type === "approve" ? "Payment approved successfully." : "Payment rejected successfully.";
        await this.load();
      } catch (e) {
        this.error = this.shortError(e, type === "approve" ? "Unable to approve payment." : "Unable to reject payment.");
      } finally {
        this.savingId = null;
      }
    }
  }
};
</script>
