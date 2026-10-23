<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <section class="my-6 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><i class="fas fa-layer-group"></i></span>
            <div><h2 class="font-black text-slate-900">Add property subtype</h2><p class="mt-1 text-xs text-slate-500">Create a subtype under a property type.</p></div>
          </div>
          <button type="button" @click="$emit('close')" aria-label="Close" class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700">&times;</button>
        </header>
        <form @submit.prevent="submitForm" class="space-y-5 p-6">
          <div>
            <label for="subtype-parent" class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Parent property type <span class="text-red-500">*</span></label>
            <select id="subtype-parent" v-model="form.property_type" required class="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" :disabled="loadingTypes">
              <option value="" disabled>{{ loadingTypes ? 'Loading property types…' : 'Select a property type' }}</option>
              <option v-for="type in propertyTypes" :key="type.id" :value="String(type.id)">{{ type.name }}</option>
            </select>
            <p v-if="!loadingTypes && propertyTypes.length === 0" class="mt-2 text-xs text-amber-700">No property types were found. Add a property type first.</p>
          </div>
          <div>
            <label for="subtype-name" class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Subtype name <span class="text-red-500">*</span></label>
            <input id="subtype-name" v-model.trim="form.name" type="text" required maxlength="120" placeholder="e.g. Apartment" class="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" />
            <p class="mt-1.5 text-xs text-slate-400">Use a clear name that distinguishes this subtype.</p>
          </div>
          <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">{{ errorMessage }}</p>
          <footer class="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" @click="$emit('close')" class="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" :disabled="saving || loadingTypes || !propertyTypes.length" class="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"><i v-if="saving" class="fas fa-spinner fa-spin"></i><i v-else class="fas fa-check"></i>{{ saving ? 'Creating…' : 'Create subtype' }}</button>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "AddPropertySubtype",
  props: { visible: Boolean, parentTypeId: { type: [String, Number], default: null } },
  emits: ["close", "refresh"],
  data() {
    return { saving: false, loadingTypes: false, errorMessage: "", propertyTypes: [], form: { property_type: this.parentTypeId == null ? "" : String(this.parentTypeId), name: "" } };
  },
  mounted() { this.fetchPropertyTypes(); },
  methods: {
    async fetchPropertyTypes() {
      this.loadingTypes = true;
      try {
        const response = await this.$apiGet("/get_property_types", { page: 1, page_size: 1000 });
        this.propertyTypes = Array.isArray(response) ? response : (response?.data || response?.results || response?.property_types || []);\n        if (this.parentTypeId != null) this.form.property_type = String(this.parentTypeId);
      } catch (error) {
        this.errorMessage = error?.message || "Unable to load property types.";
      } finally { this.loadingTypes = false; }
    },
    async submitForm() {
      this.errorMessage = "";
      const name = this.form.name.trim();
      const propertyTypeId = Number(this.form.property_type);
      if (!name || !Number.isInteger(propertyTypeId) || propertyTypeId <= 0) {
        this.errorMessage = "Select a property type and enter a subtype name.";
        return;
      }
      this.saving = true;
      try {
        await this.$apiPost("/post_property_subtype", { property_type: propertyTypeId, name });
        this.$root.$refs.toast?.showToast("Property subtype created successfully.", "success");
        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        console.error("Failed to create property subtype:", error);
        this.errorMessage = error?.message || "Could not create this subtype. Please try again.";
      } finally { this.saving = false; }
    },
  },
};
</script>
