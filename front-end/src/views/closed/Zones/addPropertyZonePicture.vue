<template>
  <div>
    <Toast ref="toast" />
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div class="bg-white w-full max-w-md rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">

        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 class="text-base font-black text-gray-800 tracking-tight">Add Zone Picture</h2>
          <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <form id="pictureForm" @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description <span class="text-red-400">*</span></label>
              <textarea v-model="form.description" maxlength="200" rows="3" required placeholder="Describe this image..." class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition resize-none"></textarea>
              <p class="text-[10px] text-gray-400 mt-1 text-right">{{ form.description.length }}/200</p>
            </div>

            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Upload Image</label>
              <label 
                for="file-upload" 
                class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition overflow-hidden group relative"
                :class="errorMessage ? 'border-red-400 bg-red-50/30' : 'border-gray-200'"
              >
                <div v-if="!form.preview" class="flex flex-col items-center gap-2 text-gray-400 text-center p-4">
                  <div class="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center transition-all duration-200"
                    :class="errorMessage ? 'text-red-500 scale-105' : 'text-gray-400 group-hover:text-gray-600'">
                    <i :class="errorMessage ? 'fas fa-exclamation-circle text-lg' : 'fas fa-cloud-upload-alt text-lg'"></i>
                  </div>
                  <p class="text-xs font-semibold text-gray-700 transition-colors">Click to upload</p>
                  <p class="text-[10px] text-gray-400">JPG, PNG, GIF or WEBP format</p>
                </div>
                
                <div v-else class="w-full h-full relative group">
                  <img :src="form.preview" class="w-full h-full object-cover" alt="Selected zone preview" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <span class="bg-white text-gray-900 px-3 py-1.5 rounded-lg font-bold text-xs shadow-md">
                      Change Image
                    </span>
                  </div>
                </div>
                
                <input 
                  id="file-upload" 
                  type="file" 
                  class="hidden" 
                  @change="onFileChange" 
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" 
                />
              </label>

              <div v-if="errorMessage" class="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100 mt-2 animate-in fade-in duration-200">
                <i class="fas fa-exclamation-triangle shrink-0"></i>
                <span>{{ errorMessage }}</span>
              </div>
            </div>
          </form>
        </div>

        <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button v-if="$hasPermission('pms.add_propertyzonepicture')" form="pictureForm" type="submit" class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition">
            <i class="fas fa-save text-xs"></i> Save Picture
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";

export default {
  name: "AddPropertyZonePicture",
  components: { Toast },
  props: { visible: Boolean, zoneId: Number },
  data() {
    return { 
      errorMessage: "", 
      form: { description: "", property_zone_id: this.zoneId, file: null, preview: null } 
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.resetValidationState();
      }
    }
  },
  methods: {
    onFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;

      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      const maxSize = 10 * 1024 * 1024; // 10MB Bound Capacity Limit Checking
      
      // Always reset errors at start of an active evaluation process
      this.errorMessage = ""; 

      // 1. Enforce strict image base class check
      if (!fileType.startsWith('image/')) {
        this.errorMessage = 'The selected file is not an image. Please upload a standard image asset.';
        this.clearFileInput(e);
        return;
      }

      // 2. Explicitly trap and throw human-readable errors for SVG items
      if (fileType === 'image/svg+xml' || fileName.endsWith('.svg')) {
        this.errorMessage = 'SVG format is not allowed. Please select a valid image format such as JPG, PNG, GIF, or WEBP.';
        this.clearFileInput(e);
        return;
      }

      // 3. Match against explicitly whitelisted types
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(fileType)) {
        this.errorMessage = 'Unsupported format. Only JPG, PNG, GIF, and WEBP images are accepted.';
        this.clearFileInput(e);
        return;
      }

      // 4. Maximum dimensional size constraint checkpoint
      if (file.size > maxSize) {
        this.errorMessage = 'The chosen file exceeds our 10MB size limit. Please compress or select a smaller image.';
        this.clearFileInput(e);
        return;
      }

      // All checkpoints passed cleanly
      this.form.file = file;
      this.form.preview = URL.createObjectURL(file);
    },
    clearFileInput(e) {
      e.target.value = '';
      this.form.file = null;
      this.form.preview = null;
    },
    resetValidationState() {
      this.errorMessage = "";
      this.form = { description: "", property_zone_id: this.zoneId, file: null, preview: null };
      const el = document.getElementById('file-upload');
      if (el) el.value = '';
    },
    async submitForm() {
      if (!this.$hasPermission("pms.add_propertyzonepicture")) {
        this.errorMessage = "You do not have permission to add zone pictures.";
        return;
      }
      // Don't submit if there is an active file validation error banner showing
      if (this.errorMessage) return;

      // Don't let users attempt to process without choosing an actual asset
      if (!this.form.file) {
        this.errorMessage = "Please upload a valid image file before attempting to save.";
        return;
      }

      try {
        const fd = new FormData();
        fd.append("description", this.form.description);
        fd.append("property_zone_id", this.zoneId);
        fd.append("property_image", this.form.file);

        const res = await this.$apiPost("/post_property_zone_picture", fd, { "Content-Type": "multipart/form-data" });
        this.$root.$refs.toast.showToast(res?.message || "Picture added successfully", "success");
        this.$emit("refresh");
        this.$emit("close");
        this.resetValidationState();
      } catch (err) { 
        console.error(err); 
        this.$root.$refs.toast.showToast("Failed to add picture asset", "error"); 
      }
    },
  },
};
</script>