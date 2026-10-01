<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" @keydown.esc="close">
    <div class="w-full max-w-3xl max-h-[92vh] overflow-hidden border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="add-offplan-application-title">
      <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 id="add-offplan-application-title" class="text-lg font-semibold text-slate-900">Add offplan application</h2>
          <p class="mt-0.5 text-xs text-slate-500">Create an application against an offplan property and customer.</p>
        </div>
        <button type="button" @click="close" class="flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="submitForm" class="max-h-[calc(92vh-132px)] overflow-y-auto">
        <div class="grid gap-5 p-6 md:grid-cols-2">
          <div class="md:col-span-2 border-b border-slate-100 pb-3">
            <h3 class="text-sm font-semibold text-slate-900">Application information</h3>
            <p class="mt-1 text-xs text-slate-500">Enter the agreed commercial terms and related records.</p>
          </div>

          <Field label="Agreed price" required>
            <input v-model="form.agreed_price" class="input" required placeholder="e.g. 2500000" />
          </Field>

          <Field label="Application status" required>
            <select v-model="form.application_status" class="input" required>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field>

          <Field label="Preferred payment method" required>
            <input v-model="form.preferred_payment_method" class="input" required placeholder="getremit" />
          </Field>

          <Field label="Offplan property ID" required>
            <input v-model.number="form.offplan_property" class="input" type="number" min="1" required placeholder="Property ID" />
          </Field>

          <Field label="Customer ID" required>
            <input v-model.number="form.customer" class="input" type="number" min="1" required placeholder="Customer ID" />
          </Field>

          <Field label="Notes">
            <textarea v-model="form.notes" class="input min-h-28 resize-y" placeholder="Add application notes"></textarea>
          </Field>
        </div>

        <div v-if="error" class="mx-6 mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

        <div class="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" @click="close" class="border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" :disabled="loading" class="border border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>{{ loading ? "Creating…" : "Create application" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import OffplanField from "../offplan property/OffplanField.vue";

const emptyForm = () => ({
  agreed_price: "",
  application_status: "pending",
  preferred_payment_method: "getremit",
  notes: "",
  offplan_property: 0,
  customer: 0
});

export default {
  name: "AddOffplanApplication",
  components: { Field: OffplanField },
  props: { open: { type: Boolean, default: false } },
  data() {
    return { form: emptyForm(), loading: false, error: "" };
  },
  watch: {
    open(value) {
      if (value) {
        this.form = emptyForm();
        this.error = "";
      }
    }
  },
  methods: {
    close() {
      if (!this.loading) this.$emit("close");
    },
    async submitForm() {
      this.loading = true;
      this.error = "";
      const payload = {
        agreed_price: this.form.agreed_price,
        application_status: this.form.application_status,
        preferred_payment_method: this.form.preferred_payment_method,
        notes: this.form.notes,
        offplan_property: Number(this.form.offplan_property),
        customer: Number(this.form.customer)
      };
      try {
        await this.$apiPost("/post_offplan_application", payload);
        this.$emit("saved");
        this.$emit("close");
      } catch (e) {
        this.error = e?.message || "Unable to create the offplan application.";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #cbd5e1;
  padding: .625rem .75rem;
  outline: none;
  background: #fff;
  color: #0f172a;
  font-size: .875rem;
}
.input:focus {
  border-color: #5f5ffc;
  box-shadow: 0 0 0 2px rgba(95,95,252,.12);
}
</style>
