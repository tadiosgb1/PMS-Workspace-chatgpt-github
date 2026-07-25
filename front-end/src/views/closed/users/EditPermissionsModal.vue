<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[85vh]">

        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 class="text-base font-semibold text-gray-800">Edit Permissions</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <!-- Search -->
        <div class="px-5 pt-3">
          <input v-model="search" type="text" placeholder="Search permissions..."
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        <div class="overflow-y-auto px-5 py-3 flex-1">
          <p class="text-xs text-gray-400 mb-3">{{ selectedPermissions.length }} selected</p>
          <div v-if="filteredPermissions.length" class="space-y-1">
            <label v-for="perm in filteredPermissions" :key="perm.codename"
              class="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition">
              <input type="checkbox" :value="perm.codename" v-model="selectedPermissions"
                class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 shrink-0" />
              <span class="text-xs text-gray-700 font-mono">{{ perm.codename }}</span>
            </label>
          </div>
          <p v-else class="text-sm text-gray-400 italic">No permissions found.</p>
        </div>

        <div class="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button @click="savePermissions" class="btn-primary">Save</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "EditPermissionsModal",
  props: {
    permissions: { type: Array, default: () => [] },
    userId: { type: [Number, String], required: true },
  },
  data() {
    return { allPermissions: [], selectedPermissions: [], search: "" };
  },
  computed: {
    filteredPermissions() {
      const q = this.search.toLowerCase();
      return q ? this.allPermissions.filter(p => p.codename.toLowerCase().includes(q)) : this.allPermissions;
    },
  },
  async mounted() {
    try {
      const res = await this.$apiGet("/get_permissions", { page_size: 1000 });
      this.allPermissions = res.data || [];
      const all = this.allPermissions.map(p => p.codename);
      this.selectedPermissions = this.permissions.filter(p => all.includes(p));
    } catch (e) { console.error(e); }
  },
  methods: {
    async savePermissions() {
      try {
        await this.$apiPost("/set_user_permissions", { user_id: this.userId, permissions: this.selectedPermissions });
        this.$root.$refs.toast.showToast("Permissions updated", "success");
        this.$emit("close");
      } catch (e) {
        this.$root.$refs.toast.showToast(e.message || "Failed to save permissions", "error");
      }
    },
  },
};
</script>

<style scoped>
.btn-cancel  { @apply px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition; }
.btn-primary { @apply px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition; }
</style>
