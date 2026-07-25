<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-3 sm:p-4 overflow-y-auto">
      <div class="bg-white w-full max-w-4xl rounded-xl shadow-xl flex flex-col my-4 sm:my-8">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 class="text-base font-semibold text-gray-800">Edit Group</h2>
            <p class="text-xs text-gray-400 mt-0.5">Update name and assign permissions</p>
          </div>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">&times;</button>
        </div>

        <!-- Body -->
        <form id="updateGroupForm" @submit.prevent="submitForm">
          <div class="p-5 space-y-5">

            <!-- Group Name -->
            <div>
              <label class="form-label">Group Name <span class="text-red-400">*</span></label>
              <input v-model="form.name" type="text" required placeholder="e.g. Property Managers" class="form-input" />
            </div>

            <!-- Permissions -->
            <div>
              <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label class="form-label !mb-0">Permissions</label>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-500 font-semibold">
                    <span class="text-gray-800 font-bold">{{ form.permissions.length }}</span> / {{ availablePermissions.length }} selected
                  </span>
                  <button type="button" @click="selectAll"
                    class="px-2.5 py-1 text-[10px] font-semibold bg-gray-800 text-white rounded hover:bg-gray-700 transition">
                    Select All
                  </button>
                  <button type="button" @click="deselectAll"
                    class="px-2.5 py-1 text-[10px] font-semibold border border-gray-300 text-gray-600 rounded hover:bg-gray-100 transition">
                    Deselect All
                  </button>
                </div>
              </div>

              <!-- Search filter -->
              <div class="relative mb-2">
                <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input v-model="permSearch" type="search" placeholder="Filter permissions by name or codename..."
                  class="form-input pl-8 text-xs" />
              </div>

              <!-- Group by app label -->
              <div class="border border-gray-200 rounded-lg overflow-hidden">
                <!-- Mobile: scrollable single list -->
                <div class="sm:hidden overflow-y-auto max-h-64 divide-y divide-gray-100">
                  <label v-for="perm in filteredPerms" :key="perm.codename"
                    class="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition">
                    <input type="checkbox" :value="perm.codename" v-model="form.permissions"
                      class="h-4 w-4 rounded border-gray-300 shrink-0" />
                    <div class="min-w-0">
                      <span class="text-xs font-medium text-gray-700 block truncate">{{ perm.name }}</span>
                      <span class="text-[10px] text-gray-400 font-mono block truncate">{{ perm.codename }}</span>
                    </div>
                  </label>
                  <div v-if="!filteredPerms.length" class="px-3 py-6 text-xs text-gray-400 italic text-center">
                    No permissions match your search.
                  </div>
                </div>

                <!-- Desktop: 3-column grid -->
                <div class="hidden sm:block overflow-y-auto max-h-72">
                  <div v-if="filteredPerms.length" class="grid grid-cols-3 divide-x divide-y divide-gray-100">
                    <label v-for="perm in filteredPerms" :key="perm.codename"
                      class="flex items-start gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer transition group">
                      <input type="checkbox" :value="perm.codename" v-model="form.permissions"
                        class="h-4 w-4 rounded border-gray-300 shrink-0 mt-0.5" />
                      <div class="min-w-0">
                        <span class="text-xs font-medium text-gray-700 block leading-tight">{{ perm.name }}</span>
                        <span class="text-[10px] text-gray-400 font-mono block truncate">{{ perm.codename }}</span>
                      </div>
                    </label>
                  </div>
                  <div v-else class="px-3 py-6 text-xs text-gray-400 italic text-center">
                    No permissions match your search.
                  </div>
                </div>
              </div>

              <!-- Quick stats bar -->
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-if="form.permissions.length" class="text-[10px] text-gray-500">
                  Selected: 
                  <span v-for="(c, i) in form.permissions.slice(0, 5)" :key="c"
                    class="font-mono text-blue-600">{{ c }}<span v-if="i < Math.min(form.permissions.length, 5) - 1">, </span></span>
                  <span v-if="form.permissions.length > 5" class="text-gray-400"> +{{ form.permissions.length - 5 }} more</span>
                </span>
              </div>
            </div>

          </div>
        </form>

        <!-- Footer -->
        <div class="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl shrink-0">
          <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button form="updateGroupForm" type="submit" :disabled="saving"
            class="btn-primary flex items-center gap-2">
            <i v-if="saving" class="fas fa-spinner fa-spin text-xs"></i>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "UpdateGroup",
  props: {
    visible: Boolean,
    groupData: Object,
  },
  data() {
    return {
      form: { id: null, name: "", permissions: [] },
      availablePermissions: [],
      permSearch: "",
      saving: false,
    };
  },
  computed: {
    filteredPerms() {
      const q = this.permSearch.toLowerCase().trim();
      if (!q) return this.availablePermissions;
      return this.availablePermissions.filter(
        p => p.codename.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
      );
    },
  },
  watch: {
    groupData: {
      immediate: true,
      handler(v) {
        if (!v) return;
        const perms = (v.permissions || []).map(p =>
          typeof p === "string" ? p : (p.codename || p)
        );
        this.form = { id: v.id, name: v.name, permissions: [...perms] };
      },
    },
    visible(val) {
      if (val && !this.availablePermissions.length) this.fetchPermissions();
    },
  },
  mounted() {
    this.fetchPermissions();
  },
  methods: {
    async fetchPermissions() {
      try {
        const res = await this.$apiGet("/get_permissions", { page_size: 10000 });
        this.availablePermissions = res.data || [];
      } catch (e) {
        console.error("Failed to fetch permissions:", e);
      }
    },

    selectAll() {
      const toAdd = this.filteredPerms
        .map(p => p.codename)
        .filter(c => !this.form.permissions.includes(c));
      this.form.permissions = [...this.form.permissions, ...toAdd];
    },

    deselectAll() {
      const toRemove = new Set(this.filteredPerms.map(p => p.codename));
      this.form.permissions = this.form.permissions.filter(c => !toRemove.has(c));
    },

    async submitForm() {
      this.saving = true;
      try {
        await this.$apiPost("/set_group_permissions", {
          group_id: this.form.id,
          name: this.form.name,
          permissions: this.form.permissions,
        });

        this.$root.$refs.toast.showToast("Group updated successfully", "success");
        this.$emit("updated");
        this.$emit("close");
      } catch (e) {
        console.error("Update failed:", e);
        this.$root.$refs.toast.showToast(e?.message || "Failed to update group", "error");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.form-label {
  @apply block text-xs font-medium text-gray-600 mb-1;
}
.form-input {
  @apply w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition;
}
.btn-cancel {
  @apply px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition;
}
.btn-primary {
  @apply px-5 py-2 text-sm font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
