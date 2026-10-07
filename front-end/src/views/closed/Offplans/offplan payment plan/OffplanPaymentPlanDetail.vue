<template>
  <div class="min-h-full bg-slate-50 p-3 md:p-5">
    <div class="mx-auto max-w-7xl">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <button @click="$router.back()" class="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 hover:text-primary">
            <i class="fas fa-arrow-left"></i> Back to payment plans
          </button>
          <p class="text-[10px] font-semibold uppercase tracking-wide text-primary">Offplan payment plan</p>
          <h1 class="text-xl font-semibold text-slate-900">{{ item.name || "Payment plan" }}</h1>
          <p class="mt-0.5 text-xs text-slate-500">Plan #{{ item.id || id || "—" }}</p>
        </div>
        <button v-if="item.id" @click="editOpen=true" class="border border-primary bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90">
          <i class="fas fa-pen mr-1"></i> Edit
        </button>
      </div>

      <section v-if="error" class="mb-4 border border-red-200 bg-red-50 p-3 text-xs text-red-700">
        <div class="flex items-center justify-between gap-3">
          <span>{{ error }}</span>
          <button @click="load" class="border border-red-300 bg-white px-2.5 py-1.5 text-[10px] font-semibold">Retry</button>
        </div>
      </section>

      <div v-if="loading" class="border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
        <i class="fas fa-spinner fa-spin mr-2"></i>Loading payment plan…
      </div>

      <template v-else>
        <section class="border border-slate-200 bg-white">
          <div class="border-b border-slate-200 px-4 py-3">
            <h2 class="text-xs font-semibold text-slate-900">Payment plan</h2>
          </div>
          <div class="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Plan type" :value="display(item.plan_type)" />
            <Info label="Total price" :value="formatNumber(item.total_price)" />
            <Info label="Down payment" :value="formatNumber(item.down_payment_amount) + ' · ' + (item.down_payment_percentage ?? '—') + '%'" />
            <Info label="Installment amount" :value="formatNumber(item.installment_amount)" />
            <Info label="Installments" :value="(item.number_of_installments ?? '—') + ' × every ' + (item.installment_interval_months ?? '—') + ' month(s)'" />
            <Info label="Penalty rate / day" :value="item.penalty_rate_per_day ?? '0.0000'" />
            <Info label="Grace period" :value="(item.grace_period_days ?? 0) + ' days'" />
            <Info label="Status" :value="item.is_active ? 'Active' : 'Inactive'" />
            <Info label="Sale type" :value="display(property?.sale_type)" />
            <Info label="Pre-handover payment" :value="display(property?.pre_handover_payment)" />
            <Info label="Created" :value="formatDate(item.created_at)" />
            <Info label="Updated" :value="formatDate(item.updated_at)" />
          </div>
          <div v-if="item.description" class="border-t border-slate-200 px-4 py-3">
            <h3 class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Description</h3>
            <p class="mt-1 text-xs leading-5 text-slate-600">{{ item.description }}</p>
          </div>
        </section>

        <section class="mt-4 border border-slate-200 bg-white">
          <div class="border-b border-slate-200 px-4 py-3">
            <h2 class="text-xs font-semibold text-slate-900">Offplan property</h2>
          </div>
          <div class="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Property ID" :value="property?.id ? '#' + property.id : '—'" />
            <Info label="Developer" :value="property?.developer" />
            <Info label="Property type" :value="display(property?.property_type)" />
            <Info label="Property price" :value="formatNumber(property?.price)" />
            <Info label="Beds / baths" :value="(property?.bedrooms ?? '—') + ' / ' + (property?.bathrooms ?? '—')" />
            <Info label="Area / size" :value="property?.area_or_size" />
            <Info label="Completion" :value="display(property?.completion_status)" />
            <Info label="Project status" :value="display(property?.project_status)" />
            <Info label="Project completion" :value="display(property?.project_completion)" />
            <Info label="Sale type" :value="display(property?.sale_type)" />
            <Info label="Pre-handover payment" :value="display(property?.pre_handover_payment)" />
            <Info label="Zone" :value="property?.property_zone?.name" />
            <Info label="Zone address" :value="zoneAddress(property?.property_zone)" />
          </div>
        </section>

        <section class="mt-4 border border-slate-200 bg-white">
          <div class="border-b border-slate-200 px-4 py-3">
            <h2 class="text-xs font-semibold text-slate-900">Ownership & management</h2>
          </div>
          <div class="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Owner" :value="personName(owner)" />
            <Info label="Owner ID" :value="owner?.id ? '#' + owner.id : '—'" />
            <Info label="Owner email" :value="owner?.email" />
            <Info label="Owner phone" :value="owner?.phone_number" />
            <Info label="Manager" :value="personName(manager)" />
            <Info label="Manager ID" :value="manager?.id ? '#' + manager.id : '—'" />
            <Info label="Manager email" :value="manager?.email" />
            <Info label="Manager phone" :value="manager?.phone_number" />
          </div>
        </section>
      </template>
    </div>

    <EditOffplanPaymentPlan :open="editOpen" :id="id" @close="editOpen=false" @saved="load" />
  </div>
</template>

<script>
import EditOffplanPaymentPlan from "./EditOffplanPaymentPlan.vue";

const Info = {
  props: { label: String, value: [String, Number] },
  template: '<div class="border border-slate-200 p-2.5"><p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{{ label }}</p><p class="mt-1 text-xs font-medium text-slate-900">{{ value || "—" }}</p></div>'
};

export default {
  name: "OffplanPaymentPlanDetail",
  components: { EditOffplanPaymentPlan, Info },
  props: { id: [String, Number] },
  data() {
    return { item: {}, loading: false, error: "", editOpen: false };
  },
  computed: {
    property() {
      if (this.item?.offplan_property && typeof this.item.offplan_property === "object") return this.item.offplan_property;
      if (this.item?.property && typeof this.item.property === "object") return this.item.property;
      return null;
    },
    owner() {
      return this.item?.owner || this.property?.owner || this.property?.property_zone?.owner || null;
    },
    manager() {
      return this.item?.manager || this.property?.manager || this.property?.property_zone?.manager || null;
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
        const response = await this.$apiGetById("/get_offplan_product", this.id);
        const payload = response?.data ?? response;
        const body = payload?.data ?? payload?.offplan_product ?? payload?.product ?? payload;
        this.item = Array.isArray(body) ? (body[0] || {}) : (body || {});
      } catch (e) {
        this.item = {};
        this.error = e?.message || "Unable to load this payment plan.";
      } finally {
        this.loading = false;
      }
    },
    personName(person) {
      if (!person) return "Not assigned";
      return person.name || person.full_name || [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(" ") || person.username || person.email || ("User #" + person.id);
    },
    zoneAddress(zone) {
      if (!zone) return "—";
      return [zone.address, zone.city, zone.state].filter(Boolean).join(", ") || "—";
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
    }
  }
};
</script>
