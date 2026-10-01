<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" @keydown.esc="close">
    <div class="w-full max-w-5xl max-h-[92vh] overflow-hidden border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="add-offplan-title">
      <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 id="add-offplan-title" class="text-lg font-semibold text-slate-900">Add offplan property</h2>
          <p class="mt-0.5 text-xs text-slate-500">Create a project record with pricing, progress and property features.</p>
        </div>
        <button type="button" @click="close" class="flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="submitForm" class="max-h-[calc(92vh-132px)] overflow-y-auto">
        <div class="grid gap-5 border-b border-slate-200 p-6 md:grid-cols-2 lg:grid-cols-3">
          <div class="md:col-span-2 lg:col-span-3 border-b border-slate-100 pb-3">
            <h3 class="text-sm font-semibold text-slate-900">Property information</h3>
            <p class="mt-1 text-xs text-slate-500">Core property, project and commercial details.</p>
          </div>
          <Field label="Property type" required><select v-model="form.property_type" class="input" required><option value="residential">Residential</option><option value="commercial">Commercial</option></select></Field>
          <Field label="Completion status" required><select v-model="form.completion_status" class="input" required><option value="ready">Ready</option><option value="offplan">Offplan</option><option value="under_construction">Under construction</option></select></Field>
          <Field label="Price" required><input v-model="form.price" class="input" required placeholder="e.g. 2500000" /></Field>
          <Field label="Bedrooms"><input v-model="form.bedrooms" class="input" placeholder="e.g. 3" /></Field>
          <Field label="Bathrooms"><input v-model="form.bathrooms" class="input" placeholder="e.g. 3.5" /></Field>
          <Field label="Area / size"><input v-model="form.area_or_size" class="input" placeholder="e.g. 180 m²" /></Field>
          <Field label="Sale type" required><select v-model="form.sale_type" class="input" required><option value="initial_sale">Initial sale</option><option value="resale">Resale</option></select></Field>
          <Field label="Project completion" required><select v-model="form.project_completion" class="input" required><option value="under_25">Under 25%</option><option value="25_50">25% – 50%</option><option value="50_75">50% – 75%</option><option value="over_75">Over 75%</option></select></Field>
          <Field label="Pre-handover payment" required><select v-model="form.pre_handover_payment" class="input" required><option value="under_25">Under 25%</option><option value="25_50">25% – 50%</option><option value="50_75">50% – 75%</option><option value="over_75">Over 75%</option></select></Field>
          <Field label="Project status" required><select v-model="form.project_status" class="input" required><option value="under_construction">Under construction</option><option value="planned">Planned</option><option value="completed">Completed</option></select></Field>
          <Field label="Developer" required><input v-model="form.developer" class="input" required placeholder="Developer name" /></Field>
          <Field label="Property zone"><input v-model.number="form.property_zone" class="input" type="number" min="0" /></Field>
          <Field label="Owner"><input v-model.number="form.owner" class="input" type="number" min="0" /></Field>
          <Field label="Manager"><input v-model.number="form.manager" class="input" type="number" min="0" /></Field>
        </div>

        <div class="border-b border-slate-200 p-6">
          <div class="mb-4">
            <h3 class="text-sm font-semibold text-slate-900">Amenities and features</h3>
            <p class="mt-1 text-xs text-slate-500">Select the features included with the property.</p>
          </div>
          <div class="grid border-l border-t border-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            <label v-for="item in amenityOptions" :key="item.key" class="flex cursor-pointer items-center gap-3 border-b border-r border-slate-200 p-3 hover:bg-slate-50">
              <input v-model="form[item.key]" type="checkbox" class="h-4 w-4 border-slate-300 text-primary focus:ring-primary" />
              <span class="text-sm text-slate-700">{{ item.label }}</span>
            </label>
          </div>
        </div>

        <div v-if="error" class="mx-6 my-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

        <div class="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" @click="close" class="border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" :disabled="loading" class="border border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>{{ loading ? "Creating…" : "Create property" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import OffplanField from "./OffplanField.vue";

const emptyForm = () => ({
  property_type: "residential",
  completion_status: "ready",
  price: "",
  bedrooms: "",
  bathrooms: "",
  area_or_size: "",
  sale_type: "initial_sale",
  project_completion: "under_25",
  pre_handover_payment: "under_25",
  project_status: "under_construction",
  developer: "",
  is_furnished: true,
  has_maids_room: true,
  has_study: true,
  has_central_or_ac_and_heating: true,
  has_balcony: true,
  has_private_garden: true,
  has_private_pool: true,
  has_private_gym: true,
  has_private_jacuzzi: true,
  has_shared_pool: true,
  has_shared_spa: true,
  property_zone: 0,
  owner: 0,
  manager: 0
});

export default {
  name: "AddOffplanProperty",
  components: { Field: OffplanField },
  props: { open: { type: Boolean, default: false } },
  data() {
    return {
      form: emptyForm(),
      loading: false,
      error: "",
      amenityOptions: [
        { key: "is_furnished", label: "Furnished" },
        { key: "has_maids_room", label: "Maid’s room" },
        { key: "has_study", label: "Study" },
        { key: "has_central_or_ac_and_heating", label: "Central A/C & heating" },
        { key: "has_balcony", label: "Balcony" },
        { key: "has_private_garden", label: "Private garden" },
        { key: "has_private_pool", label: "Private pool" },
        { key: "has_private_gym", label: "Private gym" },
        { key: "has_private_jacuzzi", label: "Private jacuzzi" },
        { key: "has_shared_pool", label: "Shared pool" },
        { key: "has_shared_spa", label: "Shared spa" }
      ]
    };
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
      try {
        await this.$apiPost("/post_offplan_property", { ...this.form });
        this.$emit("saved");
        this.$emit("close");
      } catch (e) {
        this.error = e?.message || "Unable to create the offplan property.";
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
  border-color: var(--tw-primary, #5f5ffc);
  box-shadow: 0 0 0 2px rgba(95,95,252,.12);
}
</style>
