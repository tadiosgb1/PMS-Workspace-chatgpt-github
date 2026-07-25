<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white w-full max-w-xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">

        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 class="text-base font-semibold text-gray-800">Add Group</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div class="overflow-y-auto p-5 space-y-4">
          <form id="addGroupForm" @submit.prevent="submitForm">

            <div class="mb-4">
              <label class="form-label">Group Name <span class="text-red-400">*</span></label>
              <input v-model="form.name" type="text" required placeholder="e.g. owner_manager" class="form-input" />
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="form-label !mb-0">Permissions</label>
                <span class="text-xs text-primary font-semibold">{{ form.permissions.length }} selected</span>
              </div>
              <!-- Search inside permissions list -->
              <input v-model="permSearch" type="text" placeholder="Filter permissions..."
                class="form-input mb-2 text-xs" />
              <div class="border border-gray-200 rounded-lg overflow-y-auto max-h-56 divide-y divide-gray-100">
                <label v-for="perm in filteredPerms" :key="perm.codename"
                  class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer transition">
                  <input type="checkbox" :value="perm.codename" v-model="form.permissions"
                    class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 shrink-0" />
                  <div>
                    <span class="text-xs font-medium text-gray-700">{{ perm.name }}</span>
                    <span class="block text-[10px] text-gray-400 font-mono">{{ perm.codename }}</span>
                  </div>
                </label>
                <div v-if="!filteredPerms.length" class="px-3 py-4 text-xs text-gray-400 italic text-center">
                  No permissions found.
                </div>
              </div>
            </div>

          </form>
        </div>

        <div class="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button form="addGroupForm" type="submit" class="btn-primary">Save Group</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "AddGroup",
  props: { visible: Boolean },
  data() {
    return {
      form: { name: "", permissions: [] },
      availablePermissions: [],
      permSearch: "",
    };
  },
  computed: {
    filteredPerms() {
      const q = this.permSearch.toLowerCase();
      return q
        ? this.availablePermissions.filter(p => p.codename.includes(q) || p.name.toLowerCase().includes(q))
        : this.availablePermissions;
    },
  },
  mounted() { this.fetchPermissions(); },
  methods: {
    async fetchPermissions() {
      try {
        const res = await this.$apiGet("/get_permissions", { page_size: 1000 });
        this.availablePermissions = res.data || [];
      } catch (e) { console.error(e); }
    },
    async submitForm() {
      try {
        await this.$apiPost("/post_group", { name: this.form.name, permissions: this.form.permissions });
        this.$root.$refs.toast.showToast("Group created successfully", "success");
        this.$emit("saved");
        this.$emit("close");
      } catch (e) {
        this.$root.$refs.toast.showToast(e.message || "Failed to create group", "error");
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
