<template>
  <div class="min-h-full bg-slate-50 px-3 py-4 md:px-4 md:py-5">
    <div class="mx-auto max-w-[1800px]">
      <header class="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide text-primary">Offplan</p>
          <h1 class="text-lg font-semibold text-slate-900">Payment plans</h1>
          <p class="mt-1 text-xs text-slate-500">Manage payment schedules against the correct offplan property and see ownership context at a glance.</p>
        </div>
        <button @click="addOpen=true" class="inline-flex items-center justify-center gap-2 border border-primary bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90">
          <i class="fas fa-plus"></i> New payment plan
        </button>
      </header>

      <section class="mb-3 grid gap-2 border border-slate-200 bg-white p-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="border border-slate-200 p-3">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Plans</p>
          <p class="mt-1 text-lg font-semibold text-slate-900">{{ filtered.length }}</p>
        </div>
        <div class="border border-slate-200 p-3">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Active</p>
          <p class="mt-1 text-lg font-semibold text-slate-900">{{ filtered.filter(x => x.is_active).length }}</p>
        </div>
        <div class="border border-slate-200 p-3">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Properties covered</p>
          <p class="mt-1 text-lg font-semibold text-slate-900">{{ uniquePropertyCount }}</p>
        </div>
        <div class="border border-slate-200 p-3">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Owners represented</p>
          <p class="mt-1 text-lg font-semibold text-slate-900">{{ uniqueOwnerCount }}</p>
        </div>
      </section>

      <section class="mb-3 border border-slate-200 bg-white">
        <div class="grid gap-2 p-3 md:grid-cols-2 xl:grid-cols-4">
          <input v-model="filters.search" class="border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-primary" placeholder="Search plan, property, owner, developer, zone..." />
          <select v-model="filters.offplan_property" class="border border-slate-300 px-2.5 py-2 text-xs">
            <option value="">All offplan properties</option>
            <option v-for="p in properties" :key="p.id" :value="p.id">{{ propertyOption(p) }}</option>
          </select>
          <select v-model="filters.plan_type" class="border border-slate-300 px-2.5 py-2 text-xs">
            <option value="">All plan types</option>
            <option value="installment">Installment</option>
            <option value="down_payment">Down payment</option>
            <option value="final_payment">Final payment</option>
            <option value="other">Other</option>
          </select>
          <select v-model="filters.is_active" class="border border-slate-300 px-2.5 py-2 text-xs">
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
          <div class="text-[10px] text-slate-500">{{ filtered.length }} result<span v-if="filtered.length !== 1">s</span></div>
          <div class="flex gap-2">
            <button @click="clearFilters" class="border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50">Clear</button>
            <button @click="load" class="border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50"><i class="fas fa-rotate mr-1"></i>Refresh</button>
          </div>
        </div>
      </section>

      <section v-if="error" class="mb-3 border border-red-200 bg-red-50 p-3 text-xs text-red-700">
        <div class="flex items-center justify-between gap-3"><span>{{ error }}</span><button @click="load" class="border border-red-300 bg-white px-2.5 py-1.5 text-[10px] font-semibold">Retry</button></div>
      </section>

      <section class="overflow-hidden border border-slate-200 bg-white">
        <div v-if="loading" class="p-10 text-center text-xs text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading payment plans…</div>
        <div v-else-if="!filtered.length" class="p-10 text-center">
          <div class="mb-2 text-primary"><i class="fas fa-file-invoice-dollar text-xl"></i></div>
          <h2 class="text-xs font-semibold text-slate-900">No payment plans found</h2>
          <p class="mt-1 text-xs text-slate-500">Create a plan or adjust the filters.</p>
        </div>
        <div v-else class="w-full overflow-hidden">
          <table class="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col class="w-[16%]" /><col class="w-[19%]" /><col class="w-[17%]" /><col class="w-[20%]" /><col class="w-[11%]" /><col class="w-[9%]" /><col class="w-[8%]" />
            </colgroup>
            <thead class="bg-slate-50">
              <tr class="border-b border-slate-200">
                <th class="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Plan</th>
                <th class="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Offplan property</th>
                <th class="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Owner</th>
                <th class="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Plan terms</th>
                <th class="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Penalty / grace</th>
                <th class="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th class="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="x in filtered" :key="x.id" class="border-b border-slate-100 align-top hover:bg-slate-50">
                <td class="min-w-0 px-2.5 py-2.5">
                  <div class="truncate font-semibold text-xs text-slate-900" :title="x.name || 'Unnamed plan'">{{ x.name || "Unnamed plan" }}</div>
                  <div class="mt-0.5 text-[10px] text-slate-500">#{{ x.id }} · {{ display(x.plan_type) }}</div>
                  <div v-if="x.description" class="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{{ x.description }}</div>
                </td>
                <td class="min-w-0 px-2.5 py-2.5">
                  <div class="line-clamp-2 font-medium text-xs leading-4 text-slate-900" :title="propertyLabel(propertyFromPlan(x))">{{ propertyLabel(propertyFromPlan(x)) }}</div>
                  <div class="mt-0.5 text-[10px] text-slate-500">ID {{ propertyFromPlan(x)?.id || "—" }}</div>
                  <div class="mt-1 text-[10px] text-slate-600">{{ display(propertyFromPlan(x)?.developer) || "Developer not set" }}</div>
                </td>
                <td class="min-w-0 px-2.5 py-2.5">
                  <div class="truncate font-medium text-xs text-slate-900" :title="personName(ownerFromPlan(x))">{{ personName(ownerFromPlan(x)) }}</div>
                  <div v-if="ownerFromPlan(x)?.email" class="mt-0.5 text-[10px] text-slate-500">{{ ownerFromPlan(x).email }}</div>
                  <div v-if="ownerFromPlan(x)?.phone_number" class="text-[10px] text-slate-500">{{ ownerFromPlan(x).phone_number }}</div>
                  <div v-if="ownerFromPlan(x)?.id" class="mt-0.5 text-[10px] text-slate-400">Owner #{{ ownerFromPlan(x).id }}</div>
                </td>
                <td class="min-w-0 px-2.5 py-2.5">
                  <div class="font-semibold text-xs text-slate-900">Total {{ formatNumber(x.total_price) }}</div>
                  <div class="mt-0.5 text-[10px] text-slate-600">Down: {{ formatNumber(x.down_payment_amount) }} ({{ x.down_payment_percentage ?? "—" }}%)</div>
                  <div class="mt-0.5 text-[10px] text-slate-600">Installment: {{ formatNumber(x.installment_amount) }}</div>
                  <div class="mt-0.5 text-[10px] text-slate-600">{{ x.number_of_installments ?? "—" }} payments · every {{ x.installment_interval_months ?? "—" }} month(s)</div>
                </td>
                <td class="min-w-0 px-2.5 py-2.5">
                  <div class="text-xs text-slate-700">{{ x.penalty_rate_per_day ?? "0.0000" }} / day</div>
                  <div class="mt-0.5 text-[10px] text-slate-500">{{ x.grace_period_days ?? 0 }} day grace period</div>
                </td>
                <td class="min-w-0 px-2.5 py-2.5">
                  <span :class="x.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'" class="inline-flex border px-2 py-0.5 text-[10px] font-medium">{{ x.is_active ? "Active" : "Inactive" }}</span>
                  <div class="mt-1 text-[10px] text-slate-500">Sale: {{ display(propertyFromPlan(x)?.sale_type) }}</div>
                  <div class="mt-0.5 text-[10px] text-slate-500">Pre-handover: {{ display(propertyFromPlan(x)?.pre_handover_payment) }}</div>
                </td>
                <td class="px-2 py-2.5 text-right">
                  <button @click="$router.push({ name: 'OffplanPaymentPlan-detail', params: { id: x.id } })" class="mb-1 w-full border border-slate-300 bg-white px-1.5 py-1.5 text-[10px] font-semibold text-slate-700 hover:border-primary hover:text-primary">View</button>
                  <button @click="edit(x.id)" class="w-full border border-primary bg-primary px-1.5 py-1.5 text-[10px] font-semibold text-white hover:opacity-90">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <AddOffplanPaymentPlan :open="addOpen" @close="addOpen=false" @saved="load" />
    <EditOffplanPaymentPlan :open="editOpen" :id="selectedId" @close="editOpen=false" @saved="load" />


  </div>
</template>

<script>
import AddOffplanPaymentPlan from "./AddOffplanPaymentPlan.vue";
import EditOffplanPaymentPlan from "./EditOffplanPaymentPlan.vue";

export default {
  name: "ViewOffplanPaymentPlan",
  components: { AddOffplanPaymentPlan, EditOffplanPaymentPlan },
  data() {
    return {
      items: [],
      properties: [],
      loading: false,
      error: "",
      addOpen: false,
      editOpen: false,
      selectedId: null,
      filters: { search: "", offplan_property: "", plan_type: "", is_active: "" }
    };
  },
  computed: {
    filtered() {
      const f = this.filters;
      const q = f.search.toLowerCase().trim();
      return this.items.filter(x => {
        const p = this.propertyFromPlan(x);
        const owner = this.ownerFromPlan(x);
        const zone = this.zoneFromPlan(x);
        const hay = [
          x.id, x.name, x.description, x.plan_type, x.total_price,
          p?.id, p?.developer, p?.property_type, p?.project_status,
          p?.completion_status, zone?.name, zone?.address,
          owner?.id, this.personName(owner), owner?.email, owner?.phone_number
        ].join(" ").toLowerCase();
        return (!q || hay.includes(q))
          && (!f.offplan_property || String(p?.id) === String(f.offplan_property))
          && (!f.plan_type || String(x.plan_type) === f.plan_type)
          && (!f.is_active || String(Boolean(x.is_active)) === f.is_active);
      });
    },
    uniquePropertyCount() {
      return new Set(this.filtered.map(x => this.propertyFromPlan(x)?.id).filter(Boolean)).size;
    },
    uniqueOwnerCount() {
      return new Set(this.filtered.map(x => this.ownerFromPlan(x)?.id).filter(Boolean)).size;
    }
  },
  watch: {
    "filters.search"() { },
    "filters.offplan_property"() { },
    "filters.plan_type"() { },
    "filters.is_active"() { }
  },
  mounted() {
    this.loadBaseData();
    this.load();
  },
  methods: {
    async loadBaseData() {
      try {
        const rows = await this.$getOffplanProperties();
        this.properties = Array.isArray(rows) ? rows : [];
      } catch (e) {
        this.properties = [];
      }
    },
    async load() {
      this.loading = true;
      this.error = "";
      try {
        const params = {};
        if (this.filters.offplan_property) params.offplan_property = this.filters.offplan_property;
        if (this.filters.plan_type) params.plan_type = this.filters.plan_type;
        if (this.filters.is_active) params.is_active = this.filters.is_active;
        this.items = await this.$getOffplanProducts(params);
      } catch (e) {
        this.error = e?.message || "Unable to load payment plans.";
        this.items = [];
      } finally {
        this.loading = false;
      }
    },
    propertyFromPlan(plan) {
      if (plan?.offplan_property && typeof plan.offplan_property === "object") return plan.offplan_property;
      if (plan?.property && typeof plan.property === "object") return plan.property;
      const id = plan?.offplan_property ?? plan?.property;
      return this.properties.find(item => String(item.id) === String(id)) || null;
    },
    ownerFromPlan(plan) {
      const p = this.propertyFromPlan(plan);
      return p?.owner || p?.property_zone?.owner || null;
    },
    managerFromPlan(plan) {
      const p = this.propertyFromPlan(plan);
      return p?.manager || p?.property_zone?.manager || null;
    },
    zoneFromPlan(plan) {
      return this.propertyFromPlan(plan)?.property_zone || null;
    },
    propertyLabel(p) {
      if (!p) return "Offplan property —";
      return [p.id ? "#" + p.id : "", p.developer, this.display(p.property_type), this.zoneFromPlan({ offplan_property: p })?.name].filter(Boolean).join(" · ");
    },
    propertyOption(p) {
      return this.propertyLabel(p);
    },
    personName(person) {
      if (!person) return "Not assigned";
      return person.name || person.full_name || [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(" ") || person.username || person.email || ("User #" + person.id);
    },
    zoneAddress(zone) {
      if (!zone) return "";
      return [zone.address, zone.city, zone.state].filter(Boolean).join(", ");
    },
    display(value) {
      if (value === null || value === undefined || value === "") return "—";
      return String(value).replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
    },
    formatNumber(value) {
      if (value === null || value === undefined || value === "") return "—";
      const n = Number(value);
      return Number.isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(value);
    },
    formatDate(value) {
      if (!value) return "—";
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
    },
    clearFilters() {
      this.filters = { search: "", offplan_property: "", plan_type: "", is_active: "" };
    },
    edit(id) {
      this.selectedId = id;
      this.editOpen = true;
    },
  }
};
</script>
