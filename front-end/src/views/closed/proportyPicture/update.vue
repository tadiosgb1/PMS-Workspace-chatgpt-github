<template>
  <div>
    <Toast ref="toast" />
    <div
      v-if="visible"
      class="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 transition-all duration-300"
    >
      <div class="bg-white w-full max-w-md md:max-w-xl lg:max-w-2xl rounded-xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden border border-gray-100 animate-in zoom-in duration-200">
        
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div class="flex items-center gap-2">
            <h2 class="text-base font-bold text-gray-800">Update Property Picture</h2>
            <span class="text-xs font-semibold text-gray-400">| ID: {{ form.id }}</span>
          </div>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form @submit.prevent="submitForm" class="flex-1 overflow-y-auto p-6 space-y-5">
          
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-800 tracking-wide">Assigned Property</label>
            <select 
              v-model="form.property_id" 
              class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all outline-none" 
              required
            >
              <option value="" disabled>Select Property</option>
              <option v-for="p in properties" :key="p.id" :value="p.id">
                {{ p.name || `Property #${p.id}` }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-800 tracking-wide">Media Replacement Matrix</label>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div v-if="form.property_image" class="space-y-1">
                <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Image</span>
                <div class="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video flex items-center justify-center">
                  <img :src="form.property_image" class="w-full h-full object-cover opacity-70" alt="Active state" />
                  <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span class="bg-gray-900/60 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">Active Version</span>
                  </div>
                </div>
              </div>

              <div class="space-y-1">
                <span class="block text-[10px] font-bold uppercase tracking-wider" :class="errorMessage ? 'text-red-500' : 'text-gray-400'">New Selection</span>
                
                <div v-if="!form.preview" class="relative group">
                  <label
                    for="file-upload-update"
                    class="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 group-hover:bg-gray-100 transition-all duration-200"
                    :class="errorMessage ? 'border-red-400 bg-red-50/30 group-hover:border-red-400' : 'border-gray-300 group-hover:border-gray-400'"
                  >
                    <div class="flex flex-col items-center justify-center text-center p-2">
                      <div class="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 mb-1.5"
                        :class="errorMessage ? 'text-red-500 scale-105' : 'text-gray-400 group-hover:text-gray-700 group-hover:scale-105'">
                        <i :class="errorMessage ? 'fas fa-exclamation-circle text-sm' : 'fas fa-cloud-upload-alt text-sm'"></i>
                      </div>
                      <p class="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Choose New File</p>
                      <p class="text-[9px] text-gray-400 font-medium mt-0.5">JPG, PNG, WEBP max 10MB</p>
                    </div>
                    <input id="file-upload-update" type="file" @change="onFileChange" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" class="hidden" />
                  </label>
                </div>
                
                <div v-else class="relative rounded-xl overflow-hidden shadow-sm border border-gray-200 aspect-video group">
                  <img :src="form.preview" class="w-full h-full object-cover" alt="Dynamic new upload replacement presentation" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                     <label for="file-upload-update" class="cursor-pointer bg-white text-gray-900 px-3 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all hover:scale-105">
                      Change File
                    </label>
                  </div>
                  <input id="file-upload-update" type="file" @change="onFileChange" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" class="hidden" />
                </div>

              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between items-end">
              <label class="block text-xs font-bold text-gray-800 tracking-wide">Media Description</label>
              <span class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {{ (form.description || '').length }}/200
              </span>
            </div>
            <textarea 
              v-model="form.description" 
              maxlength="200" 
              placeholder="e.g. Master Bedroom with Ocean View..."
              class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all outline-none min-h-[100px] resize-none"
            />
          </div>

          <div v-if="errorMessage" class="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100 mt-2">
            <i class="fas fa-exclamation-triangle shrink-0"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <div class="sticky bottom-0 bg-white pt-4 pb-1 mt-auto border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button" 
              @click="$emit('close')" 
              class="px-4 py-2 text-sm text-gray-700 font-semibold border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-5 py-2 text-sm font-bold text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <i class="fas fa-check-circle text-xs"></i> Update Asset
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
  name: 'UpdatePropertyPicture',
  components: { Toast },
  props: {
    visible: Boolean,
    picture: Object
  },
  data() {
    return {
      properties: [],
      errorMessage: '', 
      form: {
        id: null,
        description: '',
        property_image: '',
        property_id: '',
        file: null,
        preview: null
      }
    };
  },
  watch: {
    picture: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.form = { 
            ...newVal, 
            description: newVal.description || '',
            file: null, 
            preview: null 
          };
          this.errorMessage = ''; 
        }
      }
    }
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

      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      
      this.errorMessage = ''; 

      // 1. Direct Image Checking Verification Guard
      if (!fileType.startsWith('image/')) {
        this.errorMessage = 'Only image files are allowed. Please select a valid image file.';
        this.clearFileForm(e);
        return;
      }

      // 2. Reject SVG files explicitly 
      if (fileType === 'image/svg+xml' || fileName.endsWith('.svg')) {
        this.errorMessage = 'SVG images are not supported. Please use JPG, PNG, GIF, or WEBP format.';
        this.clearFileForm(e);
        return;
      }

      // 3. Allowed Image Formats Array List evaluation block mapping setup
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(fileType)) {
        this.errorMessage = 'Invalid image format. Only JPG, PNG, GIF, and WEBP images are allowed.';
        this.clearFileForm(e);
        return;
      }

      // 4. File Size boundary threshold processing restriction check
      if (file.size > maxSize) {
        this.errorMessage = 'File size exceeds 10MB limit. Please choose a smaller image.';
        this.clearFileForm(e);
        return;
      }

      // Success Hooks assignment block
      this.form.file = file;
      this.form.preview = URL.createObjectURL(file);
    },
    clearFileForm(e) {
      const input = document.getElementById('file-upload-update');
      if (input) input.value = '';
      this.form.file = null;
      this.form.preview = null;
    },
    async submitForm() {
      // Clear dynamic messages before submission loop execution begins
      this.errorMessage = '';

      // Block form progression if any previous input validation logic error has been flagged 
      if (this.errorMessage) return;

      // Mandatory validation check: User must select a replacement file 
      if (!this.form.file) {
        this.errorMessage = 'Please select a valid new image file to replace the asset.';
        return;
      }

      try {
        const fd = new FormData();
        fd.append('description', this.form.description);
        fd.append('property_id', this.form.property_id);
        fd.append('property_image', this.form.file);

        const res = await this.$apiPut('/update_property_picture', this.form.id, fd, { 'Content-Type': 'multipart/form-data' });
        const msg = res?.message || 'Property picture updated';
        
        this.$root.$refs.toast.showToast(msg, 'success');
        this.$emit('refresh');
        this.$emit('close');
      } catch (err) {
        console.error(err);
        this.$root.$refs.toast.showToast('Failed to update property picture', 'error');
      }
    }
  }
};
</script>

<style scoped>
/* Standardized styling containment */
</style>