<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <section class="pms-brand-page my-6 w-full max-w-xl overflow-hidden border border-slate-200 bg-white">
        <header class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><i class="fas fa-pen"></i></span>
            <div><h2 class="font-black text-slate-900">Edit property subtype</h2><p class="mt-1 text-xs text-slate-500">Update its parent type or display name.</p></div>
          </div>
          <button type="button" @click="$emit('close')" aria-label="Close" class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700">&times;</button>
        </header>
        <form @submit.prevent="submitForm('PUT')" class="space-y-5 p-6">
          <div>
            <label for="edit-subtype-parent" class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Parent property type <span class="text-red-500">*</span></label>
            <select id="edit-subtype-parent" v-model="form.property_type" required class="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" :disabled="loadingTypes">
              <option value="" disabled>{{ loadingTypes ? 'Loading property types…' : 'Select a property type' }}</option>
              <option v-for="type in propertyTypes" :key="type.id" :value="String(type.id)">{{ type.name }}</option>
            </select>
          </div>
          <div>
            <label for="edit-subtype-name" class="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Subtype name <span class="text-red-500">*</span></label>
            <input id="edit-subtype-name" v-model.trim="form.name" type="text" required maxlength="120" class="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">{{ errorMessage }}</p>
          <footer class="flex flex-col-reverse justify-between gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
            <p class="text-[11px] text-slate-400">PUT replaces the editable fields; PATCH sends a partial update.</p>
            <div class="flex justify-end gap-2">
              <button type="button" @click="$emit('close')" class="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="button" @click="submitForm('PATCH')" :disabled="saving || loadingTypes" class="rounded-xl border border-primary px-4 py-2.5 font-bold text-primary transition hover:bg-primary/5 disabled:opacity-50">{{ saving && method === 'PATCH' ? 'Saving…' : 'Quick update' }}</button>
              <button type="submit" :disabled="saving || loadingTypes" class="rounded-xl bg-primary px-4 py-2.5 font-bold text-white transition hover:opacity-90 disabled:opacity-50">{{ saving && method === 'PUT' ? 'Saving…' : 'Save all' }}</button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "EditPropertySubtype",
  props: {
    visible: Boolean,
    data: { type: Object, default: () => ({}) },
  },
  emits: ["close", "refresh"],
  data() {
    return { saving: false, loadingTypes: false, method: "", errorMessage: "", propertyTypes: [], form: { property_type: "", name: "" } };
  },
  watch: {
    data: {
      immediate: true,
      handler(value) {
        if (!value) return;
        const parent = value.property_type && typeof value.property_type === "object" ? value.property_type.id : (value.property_type_id ?? value.property_type);
        this.form = { property_type: parent == null ? "" : String(parent), name: value.name || "" };
      },
    },
  },
  mounted() { this.fetchPropertyTypes(); },
  methods: {
    async fetchPropertyTypes() {
      this.loadingTypes = true;
      try {
        const response = await this.$apiGet("/get_property_types", { page: 1, page_size: 1000 });
        this.propertyTypes = Array.isArray(response) ? response : (response?.data || response?.results || response?.property_types || []);
      } catch (error) {
        this.errorMessage = error?.message || "Unable to load property types.";
      } finally { this.loadingTypes = false; }
    },
    async submitForm(method) {
      this.errorMessage = "";
      const name = this.form.name.trim();
      const propertyTypeId = Number(this.form.property_type);
      if (!name || !Number.isInteger(propertyTypeId) || propertyTypeId <= 0) {
        this.errorMessage = "Select a property type and enter a subtype name.";
        return;
      }
      if (!this.data?.id) {
        this.errorMessage = "The subtype ID is missing. Close this dialog and try again.";
        return;
      }
      this.method = method;
      this.saving = true;
      try {
        const payload = { property_type: propertyTypeId, name };
        if (method === "PUT") await this.$apiPut("/update_property_subtype", this.data.id, payload);
        else await this.$apiPatch("/update_property_subtype", this.data.id, payload);
        this.$root.$refs.toast?.showToast("Property subtype updated successfully.", "success");
        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        console.error("Failed to update property subtype:", error);
        this.errorMessage = error?.message || "Could not update this subtype. Please try again.";
      } finally { this.saving = false; this.method = ""; }
    },
  },
};
</script>
