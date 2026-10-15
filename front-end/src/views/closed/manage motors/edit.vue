<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <section class="my-6 w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
        <header class="flex items-center justify-between border-b border-primary/10 bg-primary/5 px-6 py-4">
          <div><h2 class="text-base font-bold text-primary">Edit Motor</h2><p class="mt-0.5 text-xs text-gray-500">Update motor property information</p></div>
          <button type="button" @click="$emit('close')" class="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-primary/10">&times;</button>
        </header>
        <form id="motorEditForm" @submit.prevent="submit" class="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <label class="field">Name *<input v-model.trim="form.name" required class="control" /></label>
          <label class="field">Motor type<input v-model.trim="form.motor_type" class="control" /></label>
          <label class="field">Brand<input v-model.trim="form.brand" class="control" /></label>
          <label class="field">Model<input v-model.trim="form.model" class="control" /></label>
          <label class="field">Registration number<input v-model.trim="form.registration_number" class="control" /></label>
          <label class="field">Year<input v-model.number="form.year" type="number" min="1900" class="control" /></label>
          <label class="field">Color<input v-model.trim="form.color" class="control" /></label>
          <label class="field">Price<input v-model.number="form.price" type="number" min="0" step="0.01" class="control" /></label>
          <label class="field sm:col-span-2">Description<textarea v-model.trim="form.description" rows="3" class="control"></textarea></label>
        </form>
        <footer class="flex justify-end gap-3 border-t border-primary/10 bg-primary/5 px-6 py-4">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button form="motorEditForm" type="submit" :disabled="saving" class="btn-primary">{{ saving ? 'Saving…' : 'Save Changes' }}</button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
<script>
const fields = ["name", "motor_type", "brand", "model", "registration_number", "year", "color", "price", "description"];
export default {
  name: "ManageMotorsEdit",
  props: { data: { type: Object, default: () => ({}) } },
  data: () => ({ saving: false, form: {} }),
  watch: { data: { immediate: true, handler(value) { this.form = Object.fromEntries(fields.map(key => [key, value?.[key] ?? (["year", "price"].includes(key) ? null : "")])); } } },
  methods: {
    async submit() {
      if (!this.data?.id) return;
      this.saving = true;
      try {
        const result = await this.$apiPatch("/update_motor_property", this.data.id, { ...this.form });
        if (result?.error) throw new Error(typeof result.error === "string" ? result.error : "Could not update motor.");
        this.$root.$refs.toast?.showToast("Motor updated successfully", "success");
        this.$emit("refresh"); this.$emit("close");
      } catch (error) {
        this.$root.$refs.toast?.showToast(error?.message || "Failed to update motor", "error");
      } finally { this.saving = false; }
    }
  }
};
</script>
<style scoped>
.field { @apply block text-xs font-semibold text-gray-700; }
.control { @apply mt-1 block w-full rounded-lg border border-primary/20 px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary; }
.btn-primary { @apply rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50; }
.btn-secondary { @apply rounded-lg border border-primary/20 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-primary/10; }
</style>
