<template>
  <div class="pms-brand-page">
    <Toast ref="toast" />
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div class="bg-white w-full max-w-md rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">

        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 class="text-base font-black text-gray-800 tracking-tight">Update Zone Picture</h2>
          <button @click="$emit('close')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition text-lg font-bold">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <form id="updatePictureForm" @submit.prevent="updateModalVisible = true" class="space-y-4">
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</label>
              <textarea v-model="form.description" maxlength="200" rows="3" class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition resize-none" placeholder="Update description..."></textarea>
              <p class="text-[10px] text-gray-400 mt-1 text-right">{{ (form.description || "").length }}/200</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div v-if="form.property_image">
                <p class="text-xs font-semibold text-gray-400 uppercase mb-1.5">Current</p>
                <div class="aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img :src="form.property_image" class="w-full h-full object-cover opacity-70" />
                </div>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase mb-1.5">New Replacement</p>
                <label for="update-upload" class="aspect-video flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden transition">
                  <div v-if="!form.preview" class="flex flex-col items-center gap-1 text-gray-400">
                    <i class="fas fa-upload text-sm"></i>
                    <span class="text-[10px] font-semibold">Replace file</span>
                  </div>
                  <img v-else :src="form.preview" class="w-full h-full object-cover" />
                  <input id="update-upload" type="file" class="hidden" @change="onFileChange" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" />
                </label>
              </div>
            </div>

            <div v-if="errorMessage" class="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">
              <i class="fas fa-exclamation-triangle shrink-0"></i>
              <span>{{ errorMessage }}</span>
            </div>

            <div class="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
              <i class="fas fa-exclamation-triangle mr-1 text-amber-500"></i>
              Updating will permanently replace the current image.
            </div>
          </form>
        </div>

        <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button v-if="$hasPermission('pms.change_propertyzonepicture')" form="updatePictureForm" type="submit" class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition">
            <i class="fas fa-save text-xs"></i> Update
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm -->
    <ConfirmModal :visible="updateModalVisible" title="Confirm Replacement" message="Are you sure you want to replace this zone picture?" @cancel="updateModalVisible = false" @confirm="submitForm" />
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";

export default {
  name: "UpdatePropertyZonePicture",
  components: { Toast, ConfirmModal },
  props: { visible: Boolean, picture: Object, zoneId: Number },
  data() {
    return { 
      form: { 
        id: null, 
        description: "", 
        property_image: "", 
        property_zone_id: this.zoneId, 
        file: null, 
        preview: null 
      }, 
      updateModalVisible: false,
      errorMessage: '' // For file validation errors
    };
  },
  watch: {
    picture: { immediate: true, handler(newVal) { if (newVal) this.form = { ...newVal, description: newVal.description || "", property_zone_id: this.zoneId, file: null, preview: null }; } },
  },
  methods: {
    onFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;

      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      
      // Clear previous error states
      this.errorMessage = ''; 

      // 1. Check if it's an image file
      if (!fileType.startsWith('image/')) {
        this.errorMessage = 'Only image files are allowed. Please select a valid image file.';
        this.clearFileForm(e);
        return;
      }

      // 2. Explicitly reject SVG files
      if (fileType === 'image/svg+xml' || fileName.endsWith('.svg')) {
        this.errorMessage = 'SVG images are not supported. Please use JPG, PNG, GIF, or WEBP format.';
        this.clearFileForm(e);
        return;
      }

      // 3. Check allowed image formats
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(fileType)) {
        this.errorMessage = 'Invalid image format. Only JPG, PNG, GIF, and WEBP images are allowed.';
        this.clearFileForm(e);
        return;
      }

      // 4. Check file size
      if (file.size > maxSize) {
        this.errorMessage = 'File size exceeds 10MB limit. Please choose a smaller image.';
        this.clearFileForm(e);
        return;
      }

      // Success - proceed with file processing
      this.form.file = file;
      this.form.preview = URL.createObjectURL(file);
    },
    clearFileForm(e) {
      e.target.value = '';
      this.form.file = null;
      this.form.preview = null;
    },
    async submitForm() {
      this.updateModalVisible = false;
      if (!this.$hasPermission("pms.change_propertyzonepicture")) {
        this.$root.$refs.toast.showToast("You do not have permission to update zone pictures.", "error");
        return;
      }
      try {
        // Check for validation errors before submitting
        if (this.errorMessage) {
          this.$root.$refs.toast.showToast(this.errorMessage, 'error');
          return;
        }

        const fd = new FormData();
        fd.append("description", this.form.description);
        fd.append("property_zone_id", this.zoneId);
        if (this.form.file) fd.append("property_image", this.form.file);
        const res = await this.$apiPut("/update_property_zone_picture", this.form.id, fd, { "Content-Type": "multipart/form-data" });
        this.$root.$refs.toast.showToast(res?.message || "Picture updated", "success");
        this.$emit("refresh");
        setTimeout(() => this.$emit("close"), 1000);
      } catch (err) { 
        console.error(err); 
        this.$root.$refs.toast.showToast("Failed to update picture", "error"); 
      }
    },
  },
};
</script>
