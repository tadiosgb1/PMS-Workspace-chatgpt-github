<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white w-full max-w-sm rounded-xl shadow-xl flex flex-col">

        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 class="text-base font-semibold text-gray-800">Edit Permission</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form id="editPermForm" @submit.prevent="askConfirm" class="p-5 space-y-4">
          <div>
            <label class="form-label">Display Name <span class="text-red-400">*</span></label>
            <input v-model="form.name" type="text" required class="form-input" />
          </div>
          <div>
            <label class="form-label">Codename <span class="text-red-400">*</span></label>
            <input v-model="form.codename" type="text" required class="form-input font-mono text-xs" />
          </div>
          <div>
            <label class="form-label">Content Type ID</label>
            <input v-model="form.content_type" type="number" class="form-input" />
          </div>
        </form>

        <div class="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button form="editPermForm" type="submit" class="btn-primary">Update</button>
        </div>

      </div>
    </div>

    <ConfirmModal :visible="showConfirm" title="Confirm Update"
      :message="`Update '${form.name}'?`"
      @cancel="showConfirm = false" @confirm="submitForm" />
  </Teleport>
</template>

<script>
import ConfirmModal from "@/components/ConfirmModal.vue";

export default {
  name: "UpdatePermission",
  components: { ConfirmModal },
  props: { visible: Boolean, permission: Object },
  data() {
    return { form: { id: null, content_type: 20, name: "", codename: "" }, showConfirm: false };
  },
  watch: {
    permission: {
      immediate: true,
      handler(v) { if (v) this.form = { ...v }; },
    },
  },
  methods: {
    askConfirm() { this.showConfirm = true; },
    async submitForm() {
      this.showConfirm = false;
      try {
        await this.$apiPut("/update_permission", this.form.id, { ...this.form });
        this.$root.$refs.toast.showToast("Permission updated", "success");
        this.$emit("refresh");
        this.$emit("close");
      } catch (e) {
        this.$root.$refs.toast.showToast(e.message || "Failed", "error");
      }
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
