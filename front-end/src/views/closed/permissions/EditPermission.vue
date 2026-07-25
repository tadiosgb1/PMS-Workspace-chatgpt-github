<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white w-full max-w-sm rounded-xl shadow-xl flex flex-col">

        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 class="text-base font-semibold text-gray-800">Edit Permission</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form id="editPermFormAlt" @submit.prevent="submitForm" class="p-5 space-y-4">
          <div>
            <label class="form-label">Display Name <span class="text-red-400">*</span></label>
            <input v-model="form.name" type="text" required class="form-input" />
          </div>
          <div>
            <label class="form-label">Codename <span class="text-red-400">*</span></label>
            <input v-model="form.codename" type="text" required class="form-input font-mono text-xs" />
          </div>
        </form>

        <div class="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button form="editPermFormAlt" type="submit" class="btn-primary">Save</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "EditPermission",
  props: { data: Object },
  data() {
    return {
      form: { name: this.data?.name || "", codename: this.data?.codename || "", content_type: this.data?.content_type || 20 },
    };
  },
  methods: {
    async submitForm() {
      try {
        await this.$apiPatch("/permissions", this.data.id, { ...this.form });
        this.$root.$refs.toast.showToast("Updated successfully", "success");
        this.$emit("saved");
        this.$emit("close");
      } catch (e) { console.error(e); }
    },
  },
};
</script>

<style scoped>
.form-label { @apply block text-xs font-medium text-gray-600 mb-1; }
.form-input  { @apply w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30; }
.btn-cancel  { @apply px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition; }
.btn-primary { @apply px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition; }
</style>
