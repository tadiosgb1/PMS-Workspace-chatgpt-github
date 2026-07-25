<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white w-full max-w-md rounded-xl shadow-xl flex flex-col max-h-[80vh]">

        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 class="text-base font-semibold text-gray-800">Edit Groups</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div class="overflow-y-auto p-5">
          <p class="text-xs text-gray-400 mb-3">Select the groups this user belongs to.</p>
          <div v-if="allGroups.length" class="space-y-2">
            <label v-for="group in allGroups" :key="group.name"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition">
              <input type="checkbox" :value="group.name" v-model="selectedGroups"
                class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
              <span class="text-sm text-gray-700">{{ group.name }}</span>
            </label>
          </div>
          <p v-else class="text-sm text-gray-400 italic">No groups available.</p>
        </div>

        <div class="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button @click="saveGroups" class="btn-primary">Save</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "EditGroupsModal",
  props: {
    groups: { type: Array, default: () => [] },
    userId: { type: [Number, String], required: true },
  },
  data() {
    return { allGroups: [], selectedGroups: [...this.groups] };
  },
  async mounted() {
    try {
      const res = await this.$apiGet("/get_groups", { page_size: 1000 });
      this.allGroups = res.data || [];
      const names = this.allGroups.map(g => g.name);
      this.selectedGroups = this.groups.filter(g => names.includes(g));
    } catch (e) { console.error(e); }
  },
  methods: {
    async saveGroups() {
      try {
        await this.$apiPost("/set_user_groups", { user_id: this.userId, groups: this.selectedGroups });
        this.$root.$refs.toast.showToast("Groups updated", "success");
        this.$emit("close");
      } catch (e) {
        this.$root.$refs.toast.showToast(e.message || "Failed to save groups", "error");
      }
    },
  },
};
</script>

<style scoped>
.btn-cancel  { @apply px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition; }
.btn-primary { @apply px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition; }
</style>
