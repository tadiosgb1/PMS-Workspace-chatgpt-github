<template>
  <div class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
      
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
            <i class="fas fa-cog"></i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-800">Add System Configuration</h2>
            <p class="text-xs text-gray-500">Create a new application setting</p>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ✕
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitForm" class="flex-1 overflow-y-auto p-6 space-y-5">
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Key</label>
            <input 
              v-model="form.key" 
              type="text" 
              required
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 transition"
              placeholder="e.g., SITE_NAME, MAX_UPLOAD_SIZE"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Value</label>
            <input 
              v-model="form.value" 
              type="text" 
              required
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 transition"
              placeholder="Enter configuration value"
            />
          </div>
        </div>
      </form>

      <!-- Footer Actions -->
      <div class="border-t border-gray-100 px-6 py-4 bg-gray-50 flex gap-3 justify-end">
        <button 
          type="button" 
          @click="$emit('close')"
          class="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          @click="submitForm"
          class="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition flex items-center gap-2"
        >
          <i class="fas fa-check"></i>
          Add Configuration
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AddSystemConfigurations",
  props: {
    data: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      form: {
        key: this.data?.key || '',
        value: this.data?.value || ''
      }
    };
  },
  methods: {
    async submitForm() {
      if (!this.form.key || !this.form.value) return;

      try {
        const res = await this.$apiPost("/post_system_configuration", this.form);
        
        if (res) {
          this.$root.$refs.toast?.showToast('Configuration added successfully', 'success');
          this.$emit("saved");
          this.$emit("close");
        }
      } catch (e) {
        console.error(e);
        this.$root.$refs.toast?.showToast('Failed to add configuration', 'error');
      }
    }
  }
};
</script>