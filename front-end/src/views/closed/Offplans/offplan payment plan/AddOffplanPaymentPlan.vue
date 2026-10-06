<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3">
    <div class="w-full max-w-2xl max-h-[92vh] overflow-hidden border border-slate-200 bg-white shadow-lg">
      <div class="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <div><h2 class="text-sm font-semibold text-slate-900">New payment plan</h2><p class="text-[10px] text-slate-500">Create an offplan product payment plan</p></div>
        <button type="button" @click="close" class="h-7 w-7 border border-slate-200 text-xs text-slate-500">×</button>
      </div>

      <form @submit.prevent="submit">
        <div class="grid gap-2 p-3 md:grid-cols-2 max-h-[calc(92vh-112px)] overflow-y-auto">
          <Field label="Offplan property" required>
            <select v-model.number="form.property" class="input" required>
              <option :value="0" disabled>Select offplan property</option>
              <option v-for="item in properties" :key="item.id" :value="item.id">{{ propertyOption(item) }}</option>
            </select>
          </Field>
          <Field label="Plan name" required><input v-model.trim="form.name" class="input" required placeholder="40/60 Plan"/></Field>
          <Field label="Plan type" required>
            <select v-model="form.plan_type" class="input" required><option value="installment">installment</option><option value="down_payment">down_payment</option><option value="final_payment">final_payment</option><option value="other">other</option></select>
          </Field>
          <Field label="Total price" required><input v-model="form.total_price" class="input" required inputmode="decimal"/></Field>
          <Field label="Down payment %" required><input v-model="form.down_payment_percentage" class="input" required inputmode="decimal"/></Field>
          <Field label="Number of installments"><input v-model.number="form.number_of_installments" type="number" min="0" class="input"/></Field>
          <Field label="Installment interval (months)"><input v-model.number="form.installment_interval_months" type="number" min="0" class="input"/></Field>
          <Field label="Penalty rate / day"><input v-model="form.penalty_rate_per_day" class="input" inputmode="decimal"/></Field>
          <Field label="Grace period (days)"><input v-model.number="form.grace_period_days" type="number" min="0" class="input"/></Field>
          <Field label="Active"><input v-model="form.is_active" type="checkbox" class="h-4 w-4"/></Field>
        </div>

        <div v-if="error" class="mx-3 mb-2 border border-red-200 bg-red-50 px-2 py-1.5 text-[10px] text-red-700">{{ error }}</div>
        <div class="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2">
          <button type="button" @click="close" class="border px-3 py-1.5 text-xs">Cancel</button>
          <button :disabled="loading" class="bg-primary px-3 py-1.5 text-white text-xs">{{loading?'Saving…':'Create plan'}}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import OffplanField from "../offplan property/OffplanField.vue";

const blank = () => ({
  property: 0,
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
  components: { Field: OffplanField },
  props: { open: Boolean },
  data() { return { form: blank(), properties: [], loading: false, error: "" }; },
  watch: { open(value) { if (value) { this.form = blank(); this.error = ""; this.loadProperties(); } } },
  methods: {
    async loadProperties() {
      try {
        const rows = await this.$getOffplanProperties();
        this.properties = Array.isArray(rows) ? rows : [];
      } catch (e) { this.error = "Unable to load offplan properties."; }
    },
    propertyOption(item) {
      const location = item?.property_zone?.name || item?.zone?.name || item?.property_zone_name || "";
      const type = item?.property_type || "Offplan property";
      const developer = item?.developer || item?.project_name || "";
      return [item?.id ? "#" + item.id : "", developer, type, location].filter(Boolean).join(" · ");
    },
    close() { if (!this.loading) this.$emit("close"); },
    payload() {
      return {
        property: Number(this.form.property),
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
        this.$emit("saved");
        this.close();
      } catch (e) { this.error = e?.message || "Unable to create payment plan."; }
      finally { this.loading = false; }
    }
  }
};
</script>

<style scoped>
.input{width:100%;border:1px solid #cbd5e1;padding:.4rem .55rem;font-size:.75rem;line-height:1rem;outline:none}
</style>