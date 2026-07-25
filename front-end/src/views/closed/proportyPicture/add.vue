<template>
  <div>
    <Toast ref="toast" />
    <div
      v-if="visible"
      class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-auto"
    >
      <div class="bg-white w-full sm:w-auto sm:max-w-[700px] md:max-w-[850px] rounded-lg shadow-lg overflow-hidden relative mx-auto">
        <div class="bg-primary text-white px-6 py-4 text-2xl font-semibold flex justify-between items-center">
          Add Property Picture
          <button @click="$emit('close')" class="text-white hover:text-gray-200 text-lg font-bold">✕</button>
        </div>

        <form @submit.prevent="submitForm" class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
          <!-- Description -->
          <div class="md:col-span-2">
            <label class="block mb-2 font-medium text-gray-700">Description</label>
            <textarea v-model="form.description" maxlength="200" class="w-full px-4 py-2 border rounded-md" />
            <p class="text-xs text-gray-400 mt-1">{{ form.description.length }}/200</p>
          </div>

          <!-- Property select -->
          <div>
            <label class="block mb-2 font-medium text-gray-700">Property</label>
            <select v-model="form.property_id" class="w-full px-4 py-2 border rounded-md" required>
              <option value="" disabled>Select Property</option>
              <option v-for="p in properties" :key="p.id" :value="p.id">{{ p.name || p.id }}</option>
            </select>
          </div>

          <!-- Image upload -->
          <div>
            <label class="block mb-2 font-medium text-gray-700">Property Image</label>
            <label
              for="file-upload"
              class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500"
            >
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a2 2 0 002 2h12..."></path>
                </svg>
                <p class="text-sm text-gray-500">Click to upload</p>
              </div>
              <input id="file-upload" type="file" class="hidden" @change="onFileChange" accept="image/*" />
            </label>

            <div v-if="form.preview" class="mt-4">
              <img :src="form.preview" alt="preview" class="rounded-lg max-h-48 object-cover" />
            </div>
          </div>

          <div class="md:col-span-2 text-right">
            <button type="submit" class="bg-primary text-white font-semibold px-6 py-3 rounded shadow">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from '@/components/Toast.vue';

export default {
  name: 'AddPropertyPicture',
  components: { Toast },
  props: {
    visible: Boolean
  },
  data() {
    return {
      properties: [],
      form: {
        description: '',
        property_id: '',
        file: null,
        preview: null
      }
    };
  },
  mounted() {
    this.fetchProperties();
  },
  methods: {
    async fetchProperties() {
      try {
        const res = await this.$apiGet('/get_properties');
        this.properties = res.data || res;
      } catch (err) {
        console.error('Failed to fetch properties', err);
      }
    },
    onFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.form.file = file;
      this.form.preview = URL.createObjectURL(file);
    },
    async submitForm() {
      try {
        const fd = new FormData();
        fd.append('description', this.form.description);
        fd.append('property_id', this.form.property_id);
        if (this.form.file) fd.append('property_image', this.form.file);

        const res = await this.$apiPost('/post_property_picture', fd, { 'Content-Type': 'multipart/form-data' });
        const msg = res?.message || 'Property picture added';
        this.$root.$refs.toast.showToast(msg, 'success');
        this.$emit('refresh');
        // close modal after short delay to show toast like other samples
        setTimeout(() => this.$emit('close'), 1000);
        this.resetForm();
      } catch (err) {
        console.error(err);
        alert('Failed to save property picture');
      }
    },
    resetForm() {
      this.form = { description: '', property_id: '', file: null, preview: null };
    }
  }
};
</script>

<style scoped>
/* Tailwind used for styling; keep file-specific tweaks here if needed */
</style>
