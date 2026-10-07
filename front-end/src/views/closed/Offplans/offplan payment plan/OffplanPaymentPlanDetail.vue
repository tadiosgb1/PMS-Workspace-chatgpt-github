<template>
  <div class="min-h-full bg-slate-50 p-3 md:p-4">
    <div class="mx-auto max-w-6xl border border-slate-200 bg-white shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide text-primary">Offplan payment plan</p>
          <h1 class="text-base font-semibold text-slate-900">{{ item.name || "Payment plan" }}</h1>
          <p class="mt-0.5 text-[10px] text-slate-500">Plan #{{ item.id || "—" }}</p>
        </div>
        <button @click="editOpen=true" class="border border-primary bg-primary px-3 py-1.5 text-[10px] font-semibold text-white">Edit</button>
      </div>

      <div class="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <Info label="Plan type" :value="display(item.plan_type)" />
        <Info label="Total price" :value="formatNumber(item.total_price)" />
        <Info label="Down payment" :value="formatNumber(item.down_payment_amount) + ' · ' + (item.down_payment_percentage ?? '—') + '%'" />
        <Info label="Installment amount" :value="formatNumber(item.installment_amount)" />
        <Info label="Installments" :value="(item.number_of_installments ?? '—') + ' × every ' + (item.installment_interval_months ?? '—') + ' month(s)'" />
        <Info label="Penalty / grace" :value="(item.penalty_rate_per_day ?? '0.0000') + ' / day · ' + (item.grace_period_days ?? 0) + ' days'" />
        <Info label="Status" :value="item.is_active ? 'Active' : 'Inactive'" />
        <Info label="Created" :value="formatDate(item.created_at)" />
        <Info label="Updated" :value="formatDate(item.updated_at)" />
      </div>

      <div class="border-t border-slate-200 p-4">
        <h2 class="text-xs font-semibold text-slate-900">Offplan property</h2>
        <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Property ID" :value="property?.id ? '#' + property.id : '—'" />
          <Info label="Developer" :value="property?.developer" />
          <Info label="Property type" :value="display(property?.property_type)" />
          <Info label="Property price" :value="formatNumber(property?.price)" />
          <Info label="Beds / baths" :value="(property?.bedrooms ?? '—') + ' / ' + (property?.bathrooms ?? '—')" />
          <Info label="Area / size" :value="property?.area_or_size" />
          <Info label="Completion" :value="display(property?.completion_status)" />
          <Info label="Project status" :value="display(property?.project_status)" />
          <Info label="Sale type" :value="display(property?.sale_type)" />
          <Info label="Project completion" :value="display(property?.project_completion)" />
          <Info label="Pre-handover payment" :value="display(property?.pre_handover_payment)" />
          <Info label="Zone" :value="property?.property_zone?.name" />
        </div>
      </div>

      <div class="border-t border-slate-200 p-4">
        <h2 class="text-xs font-semibold text-slate-900">Ownership & management</h2>
        <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Owner" :value="personName(owner)" />
          <Info label="Owner email" :value="owner?.email" />
          <Info label="Owner phone" :value="owner?.phone_number" />
          <Info label="Manager" :value="personName(manager)" />
        </div>
      </div>

      <div v-if="item.description" class="border-t border-slate-200 p-4">
        <h2 class="text-xs font-semibold text-slate-900">Description</h2>
        <p class="mt-1 text-xs leading-5 text-slate-600">{{ item.description }}</p>
      </div>
    </div>

    <EditOffplanPaymentPlan :open="editOpen" :id="id" @close="editOpen=false" @saved="load" />
  </div>
</template>

<script>
import EditOffplanPaymentPlan from "./EditOffplanPaymentPlan.vue";

const Info = {
  props: { label: String, value: String },
  template: '<div class="border border-slate-200 p-2.5"><p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{{ label }}</p><p class="mt-1 text-xs font-medium text-slate-900">{{ value || "—" }}</p></div>'
};

export default {
  name: "OffplanPaymentPlanDetail",
  components: { EditOffplanPaymentPlan, Info },
  props: { id: [String, Number] },
  data() { return { item: {} }; },
  computed: {
    property() { return this.item?.offplan_property && typeof this.item.offplan_property === "object" ? this.item.offplan_property : null; },
    owner() { return this.property?.owner || this.property?.property_zone?.owner || null; },
    manager() { return this.property?.manager || this.property?.property_zone?.manager || null; }
  },
  mounted() { this.load(); },
  methods: {
    async load() {
      const r = await this.$apiGetById("/get_offplan_payment_plan", this.id);
      this.item = r?.data?.data || r?.data || r?.payment_plan || r;
    },
    personName(person) {
      if (!person) return "Not assigned";
      return person.name || person.full_name || [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(" ") || person.username || person.email || ("User #" + person.id);
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
