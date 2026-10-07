<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3" @keydown.esc="close">
    <div class="w-full max-w-3xl max-h-[92vh] overflow-hidden border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true">
      <div class="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide text-primary">Offplan</p>
          <h2 class="text-base font-semibold text-slate-900">New payment plan</h2>
          <p class="mt-0.5 text-xs text-slate-500">Create a payment schedule for an offplan property.</p>
        </div>
        <button type="button" @click="close" class="h-8 w-8 border border-slate-200 text-slate-500">×</button>
      </div>

      <form @submit.prevent="submit">
        <div class="max-h-[calc(92vh-125px)] overflow-y-auto p-4">
          <div class="grid gap-3 md:grid-cols-2">
            <Field label="Offplan property" required>
              <select v-model.number="form.offplan_property" class="input" required>
                <option :value="0" disabled>Select offplan property</option>
                <option v-for="item in properties" :key="item.id" :value="item.id">{{ propertyOption(item) }}</option>
              </select>
            </Field>
            <Field label="Plan name" required><input v-model.trim="form.name" class="input" required placeholder="40/60 Plan" /></Field>
            <Field label="Plan type" required>
              <select v-model="form.plan_type" class="input" required>
                <option value="installment">Installment</option><option value="down_payment">Down payment</option><option value="final_payment">Final payment</option><option value="other">Other</option>
              </select>
            </Field>
            <Field label="Total price" required><input v-model="form.total_price" class="input" required inputmode="decimal" placeholder="700000.00" /></Field>
            <Field label="Down payment %"><input v-model="form.down_payment_percentage" class="input" inputmode="decimal" /></Field>
            <Field label="Number of installments"><input v-model.number="form.number_of_installments" type="number" min="0" class="input" /></Field>
            <Field label="Installment interval (months)"><input v-model.number="form.installment_interval_months" type="number" min="0" class="input" /></Field>
            <Field label="Penalty rate / day"><input v-model="form.penalty_rate_per_day" class="input" inputmode="decimal" /></Field>
            <Field label="Grace period (days)"><input v-model.number="form.grace_period_days" type="number" min="0" class="input" /></Field>
            <label class="flex items-center gap-2 border border-slate-200 px-3 py-2.5 text-xs text-slate-700">
              <input v-model="form.is_active" type="checkbox" class="h-4 w-4" /> Active plan
            </label>
          </div>

          <div v-if="selectedProperty" class="mt-4 border border-slate-200 bg-slate-50 p-3">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-xs font-semibold text-slate-900">Property ownership context</h3>
              <span class="text-[10px] text-slate-500">Property #{{ selectedProperty.id }}</span>
            </div>
            <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Developer" :value="selectedProperty.developer" />
              <Info label="Owner" :value="personName(ownerFromProperty(selectedProperty))" />
              <Info label="Owner contact" :value="ownerContact(selectedProperty)" />
              <Info label="Manager" :value="personName(managerFromProperty(selectedProperty))" />
              <Info label="Zone" :value="selectedProperty.property_zone?.name" />
              <Info label="Property type" :value="display(selectedProperty.property_type)" />
              <Info label="Property price" :value="formatNumber(selectedProperty.price)" />
              <Info label="Project status" :value="display(selectedProperty.project_status)" />
            </div>
          </div>

          <div v-if="error" class="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{{ error }}</div>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
          <button type="button" @click="close" class="border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700">Cancel</button>
          <button :disabled="loading" class="border border-primary bg-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">{{ loading ? "Creating…" : "Create plan" }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import OffplanField from "../offplan property/OffplanField.vue";

const Info = {
  props: { label: String, value: String },
  template: '<div><p class="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{{ label }}</p><p class="mt-0.5 text-[11px] font-medium text-slate-900">{{ value || "—" }}</p></div>'
};

const blank = () => ({
  offplan_property: 0,
  name: "",
  plan_type: "installment",
  total_price: "",
  down_payment_percentage: "0.00",
  number_of_installments: 0,
  installment_interval_months: 1,
  penalty_rate_per_day: "0.0000",
  grace_period_days: 0,
  is_active: true
});

export default {
  name: "AddOffplanPaymentPlan",
  components: { Field: OffplanField, Info },
  props: { open: Boolean },
  data() { return { form: blank(), properties: [], loading: false, error: "" }; },
  computed: {
    selectedProperty() {
      return this.properties.find(item => String(item.id) === String(this.form.offplan_property)) || null;
    }
  },
  watch: { open(value) { if (value) { this.form = blank(); this.error = ""; this.loadProperties(); } } },
  methods: {
    async loadProperties() {
      try {
        const rows = await this.$getOffplanProperties();
        this.properties = Array.isArray(rows) ? rows : [];
      } catch (e) {
        this.error = "Unable to load offplan properties.";
      }
    },
    propertyOption(item) {
      return [item?.id ? "#" + item.id : "", item?.developer, this.display(item?.property_type), item?.property_zone?.name].filter(Boolean).join(" · ");
    },
    ownerFromProperty(property) {
      return property?.owner || property?.property_zone?.owner || null;
    },
    managerFromProperty(property) {
      return property?.manager || property?.property_zone?.manager || null;
    },
    personName(person) {
      if (!person) return "Not assigned";
      return person.name || person.full_name || [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(" ") || person.username || person.email || ("User #" + person.id);
    },
    ownerContact(property) {
      const owner = this.ownerFromProperty(property);
      return owner ? [owner.email, owner.phone_number].filter(Boolean).join(" · ") || "No contact" : "Not assigned";
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
    close() { if (!this.loading) this.$emit("close"); },
    payload() {
      return {
        offplan_property: Number(this.form.offplan_property),
        name: this.form.name.trim(),
        plan_type: this.form.plan_type,
        total_price: String(this.form.total_price),
        down_payment_percentage: Number(this.form.down_payment_percentage || 0).toFixed(2),
        number_of_installments: Number(this.form.number_of_installments || 0),
        installment_interval_months: Number(this.form.installment_interval_months || 0),
        penalty_rate_per_day: Number(this.form.penalty_rate_per_day || 0).toFixed(4),
        grace_period_days: Number(this.form.grace_period_days || 0),
        is_active: Boolean(this.form.is_active)
      };
    },
    async submit() {
      this.loading = true;
      this.error = "";
      try {
        await this.$apiPost("/post_offplan_product", this.payload());
        this.loading = false;
        this.$emit("close");
        this.$emit("saved");
      } catch (e) {
        this.error = e?.message || "Unable to create payment plan.";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.input{width:100%;border:1px solid #cbd5e1;padding:.55rem .65rem;font-size:.75rem;line-height:1rem;outline:none;background:#fff;color:#0f172a}
.input:focus{border-color:#5f5ffc;box-shadow:0 0 0 2px rgba(95,95,252,.12)}
</style>
