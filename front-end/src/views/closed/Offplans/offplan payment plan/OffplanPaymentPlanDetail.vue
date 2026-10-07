<template>
  <div class="min-h-full bg-slate-50 p-3 md:p-5">
    <div class="mx-auto max-w-7xl">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <button @click="$router.back()" class="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 hover:text-primary"><i class="fas fa-arrow-left"></i> Back to payment plans</button>
          <p class="text-[10px] font-semibold uppercase tracking-wide text-primary">Offplan payment plan</p>
          <h1 class="text-xl font-semibold text-slate-900">{{ item.name || "Payment plan" }}</h1>
          <p class="mt-0.5 text-xs text-slate-500">Plan #{{ item.id || id || "—" }}</p>
        </div>
        <button v-if="item.id" @click="editOpen=true" class="border border-primary bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90"><i class="fas fa-pen mr-1"></i> Edit</button>
      </div>
      <section v-if="error" class="mb-4 border border-red-200 bg-red-50 p-3 text-xs text-red-700"><div class="flex items-center justify-between gap-3"><span>{{ error }}</span><button @click="load" class="border border-red-300 bg-white px-2.5 py-1.5 text-[10px] font-semibold">Retry</button></div></section>
      <div v-if="loading" class="border border-slate-200 bg-white p-12 text-center text-xs text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading payment plan…</div>
      <template v-else>
        <section class="border border-slate-200 bg-white">
          <div class="border-b border-slate-200 px-4 py-3"><h2 class="text-xs font-semibold text-slate-900">Payment plan</h2></div>
          <div class="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Plan type" :value="display(item.plan_type)" />
            <Info label="Total price" :value="formatNumber(item.total_price)" />
            <Info label="Down payment" :value="formatNumber(item.down_payment_amount) + ' · ' + (item.down_payment_percentage ?? '—') + '%'" />
            <Info label="Installment amount" :value="formatNumber(item.installment_amount)" />
            <Info label="Installments" :value="installmentText" />
            <Info label="Penalty rate / day" :value="item.penalty_rate_per_day ?? '—'" />
            <Info label="Grace period" :value="(item.grace_period_days ?? 0) + ' days'" />
            <Info label="Status" :value="item.is_active ? 'Active' : 'Inactive'" />
            <Info label="Sale type" :value="display(property && property.sale_type)" />
            <Info label="Pre-handover payment" :value="display(property && property.pre_handover_payment)" />
            <Info label="Created" :value="formatDate(item.created_at)" />
            <Info label="Updated" :value="formatDate(item.updated_at)" />
          </div>
          <div v-if="item.description" class="border-t border-slate-200 px-4 py-3"><h3 class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Description</h3><p class="mt-1 text-xs leading-5 text-slate-600">{{ item.description }}</p></div>
        </section>
        <section class="mt-4 border border-slate-200 bg-white">
          <div class="border-b border-slate-200 px-4 py-3"><h2 class="text-xs font-semibold text-slate-900">Related records</h2></div>
          <div class="grid gap-3 p-4 sm:grid-cols-2">
            <div class="border border-slate-100 p-3">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Offplan property</p>
              <router-link
                v-if="property && property.id"
                :to="{ name: 'OffplanProperty-detail', params: { id: property.id } }"
                class="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                {{ propertyName }}
                <i class="fas fa-arrow-up-right-from-square text-[9px]"></i>
              </router-link>
              <p v-else class="mt-1 text-sm text-slate-500">Not assigned</p>
            </div>

            <div class="border border-slate-100 p-3">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Owner</p>
              <router-link
                v-if="owner && owner.id"
                :to="{ name: 'owner-detail', params: { id: owner.id } }"
                class="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                {{ personName(owner) }}
                <i class="fas fa-arrow-up-right-from-square text-[9px]"></i>
              </router-link>
              <p v-else class="mt-1 text-sm text-slate-500">Not assigned</p>
            </div>
          </div>
        </section>
      </template>
    </div>
    <EditOffplanPaymentPlan :open="editOpen" :id="id" @close="editOpen=false" @saved="load" />
  </div>
</template>

<script>
import EditOffplanPaymentPlan from "./EditOffplanPaymentPlan.vue";
import OffplanInfo from "../offplan property/OffplanInfo.vue";

export default {
  name: "OffplanPaymentPlanDetail",
  components: { EditOffplanPaymentPlan, Info: OffplanInfo },
  props: { id: [String, Number] },
  data() { return { item: {}, loading: false, error: "", editOpen: false }; },
  computed: {
    property() {
      const p = this.item && this.item.offplan_property;
      return p && typeof p === "object" ? p : null;
    },
    owner() {
      return (this.item && this.item.owner) || (this.property && this.property.owner) || (this.property && this.property.property_zone && this.property.property_zone.owner) || null;
    },
    manager() {
      return (this.item && this.item.manager) || (this.property && this.property.manager) || (this.property && this.property.property_zone && this.property.property_zone.manager) || null;
    },
    installmentText() {
      const count = this.item && this.item.number_of_installments != null ? this.item.number_of_installments : "—";
      const interval = this.item && this.item.installment_interval_months != null ? this.item.installment_interval_months : "—";
      return count + " × every " + interval + " month(s)";
    },
    bedsBaths() {
      const beds = this.property && this.property.bedrooms != null ? this.property.bedrooms : "—";
      const baths = this.property && this.property.bathrooms != null ? this.property.bathrooms : "—";
      return beds + " / " + baths;
    }
  },
  mounted() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      this.error = "";
      try {
        const res = await this.$apiGetById("/get_offplan_product", this.id);
        let body = res;
        if (body && body.data && body.data.data) body = body.data.data;
        else if (body && body.data) body = body.data;
        else if (body && body.payment_plan) body = body.payment_plan;
        else if (body && body.offplan_payment_plan) body = body.offplan_payment_plan;
        if (Array.isArray(body)) body = body[0] || {};
        this.item = body && typeof body === "object" ? body : {};
      } catch (e) {
        this.item = {};
        this.error = e && e.message ? e.message : "Unable to load this payment plan.";
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