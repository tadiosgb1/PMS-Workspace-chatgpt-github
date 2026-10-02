<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3" @keydown.esc="close">
    <div class="w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-200 bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="edit-offplan-application-title">
      <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h2 id="edit-offplan-application-title" class="text-sm font-semibold text-slate-900">Edit offplan application</h2>
          <p class="mt-0.5 text-[10px] text-slate-500">Update the application record from the applications endpoint.</p>
        </div>
        <button type="button" @click="close" class="flex h-7 w-7 items-center justify-center border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-900" aria-label="Close"><i class="fas fa-times"></i></button>
      </div>

      <div v-if="loadingData" class="flex min-h-40 items-center justify-center text-xs text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading application…</div>

      <form v-else @submit.prevent="submitForm" class="max-h-[calc(90vh-108px)] overflow-y-auto">
        <div class="grid gap-3 p-4 md:grid-cols-2">
          <Field label="Agreed price" required><input v-model="form.agreed_price" class="input" required /></Field>
          <Field label="Application status" required>
            <select v-model="form.application_status" class="input" required>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field>
          <Field label="Preferred payment method" required><input v-model="form.preferred_payment_method" class="input" required /></Field>
          <Field label="Offplan property ID" required><input v-model.number="form.offplan_property" class="input" type="number" min="1" required /></Field>
          <Field label="Customer ID" required><input v-model.number="form.customer" class="input" type="number" min="1" required /></Field>
          <Field label="Notes"><textarea v-model="form.notes" class="input min-h-20 resize-y"></textarea></Field>
        </div>

        <div v-if="error" class="mx-4 mb-3 flex h-7 items-center overflow-hidden border border-red-200 bg-red-50 px-2 text-[10px] text-red-700" :title="error">
          <i class="fas fa-exclamation-circle mr-2 shrink-0"></i><span class="truncate">{{ error }}</span>
        </div>

        <div class="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
          <button type="button" @click="close" class="border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" :disabled="saving || loadingData" class="border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            <i v-if="saving" class="fas fa-spinner fa-spin mr-1.5"></i>{{ saving ? "Saving…" : "Save changes" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import OffplanField from "../offplan property/OffplanField.vue";

const defaults = {
  agreed_price: "",
  application_status: "pending",
  preferred_payment_method: "getremit",
  notes: "",
  offplan_property: 0,
  customer: 0
};

export default {
  name: "EditOffplanApplication",
  components: { Field: OffplanField },
  props: { open: { type: Boolean, default: false }, id: { type: [String, Number], default: null } },
  data() {
    return { form: { ...defaults }, loadingData: false, saving: false, error: "" };
  },
  watch: {
    open(value) {
      if (value) this.load();
    }
  },
  methods: {
    close() {
      if (!this.saving) this.$emit("close");
    },
    shortError(error, fallback) {
      const raw = String(error?.response?.data?.detail || error?.response?.data?.message || error?.message || fallback);
      const cleaned = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      return cleaned.length > 140 ? `${cleaned.slice(0, 137)}...` : cleaned;
    },
    async load() {
      if (!this.id) return;
      this.loadingData = true;
      this.error = "";
      try {
        const items = await this.$getOffplanApplications();
        const item = items.find(row => String(row?.id) === String(this.id));
        if (!item) throw new Error("Application not found.");
        this.form = { ...defaults, ...item, application_status: item.application_status || "pending" };
      } catch (e) {
        this.error = this.shortError(e, "Unable to load the application.");
      } finally {
        this.loadingData = false;
      }
    },
    async submitForm() {
      this.saving = true;
      this.error = "";
      const payload = {
        agreed_price: this.form.agreed_price,
        application_status: this.form.application_status || "pending",
        preferred_payment_method: this.form.preferred_payment_method,
        notes: this.form.notes,
        offplan_property: Number(this.form.offplan_property),
        customer: Number(this.form.customer)
      };
      try {
        await this.$apiPatch("/update_offplan_application", this.id, payload);
        this.$emit("saved");
        this.$emit("close");
      } catch (e) {
        this.error = this.shortError(e, "Unable to update the offplan application.");
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #cbd5e1;
  padding: .45rem .6rem;
  outline: none;
  background: #fff;
  color: #0f172a;
  font-size: .75rem;
}
.input:focus {
  border-color: #5f5ffc;
  box-shadow: 0 0 0 2px rgba(95,95,252,.12);
}
</style>
