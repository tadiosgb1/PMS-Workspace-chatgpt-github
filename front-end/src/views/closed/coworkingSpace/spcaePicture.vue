<template>
  <div>
    <Toast ref="toast" />

    <div
      v-if="visible"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
    >
      <div 
        class="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200"
      >
        <div class="bg-gradient-to-r from-dprimary to-primary px-6 py-5 flex justify-between items-center shadow-md shrink-0">
          <div class="flex items-center gap-3 text-white">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <i class="fas fa-camera-retro text-lg"></i>
            </div>
            <div>
              <h2 class="text-lg font-bold tracking-tight">Add Space Media</h2>
              <p class="text-white/70 text-[10px] uppercase tracking-widest font-bold">Upload Gallery Assets</p>
            </div>
          </div>
          <button 
            @click="$emit('close')" 
            class="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 text-white hover:bg-white/20 transition-colors"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitForm" class="p-6 md:p-8 space-y-6">
          
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <i class="fas fa-cloud-upload-alt text-primary"></i>
              Select Image Asset
            </label>
            
            <div class="relative">
              <label
                for="file-upload"
                class="group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-primary/5 hover:border-primary transition-all duration-300 overflow-hidden"
              >
                <div v-if="!form.preview" class="flex flex-col items-center justify-center pt-5 pb-6">
                  <div class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <i class="fas fa-image text-gray-400 group-hover:text-primary text-xl"></i>
                  </div>
                  <p class="text-xs font-bold text-gray-500 uppercase tracking-tighter">Click to browse or drag & drop</p>
                  <p class="text-[10px] text-gray-400 mt-1">PNG, JPG or WEBP (Max 5MB)</p>
                </div>

                <div v-else class="relative w-full h-full">
                  <img :src="form.preview" alt="preview" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p class="text-white text-[10px] font-black uppercase bg-primary px-3 py-1.5 rounded-lg shadow-lg">Change Photo</p>
                  </div>
                </div>

                <input
                  required
                  id="file-upload"
                  type="file"
                  class="hidden"
                  @change="onFileChange"
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i class="fas fa-quote-left text-primary text-[9px]"></i>
                Description
              </label>
              <span class="text-[9px] font-bold" :class="form.description.length >= 200 ? 'text-red-500' : 'text-gray-400'">
                {{ form.description.length }}/200
              </span>
            </div>
            <textarea 
              v-model="form.description" 
              maxlength="200" 
              placeholder="e.g. Spacious corner view with natural lighting..."
              class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm min-h-[100px] resize-none font-medium text-gray-700 shadow-inner"
            />
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
            >
              Discard
            </button>
            <button 
              type="submit" 
              :disabled="loading"
              class="flex-1 bg-primary hover:bg-dprimary text-white font-black text-[11px] uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-primary/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i class="fas fa-cloud-upload-alt" v-if="!loading"></i>
              <i class="fas fa-spinner fa-spin" v-else></i>
              {{ loading ? "Uploading..." : "Save Image" }}
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
  name: 'AddPropertySpacePicture',
  components: { Toast },
  props: {
    visible: Boolean,
    spaceId: Number,
  },
  data() {
    return {
      form: {
        description: '',
        space_id: this.spaceId,
        file: null,
        preview: null,
      },
    };
  },
  mounted(){
   console.log("spaceid",this.spaceId);
  },
  methods: {
    
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
        fd.append('coworking_space', this.spaceId);
        if (this.form.file) fd.append('image', this.form.file);

        const res = await this.$apiPost(`/post_coworking_space_picture`, fd, {
          'Content-Type': 'multipart/form-data',
        });
        const msg = res?.message || 'Zone picture added';
        this.$root.$refs.toast.showToast(msg, 'success');
        this.$emit('refresh');
        this.$emit('close');

        this.form = { description: '', coworking_space: this.spaceId, file: null, preview: null };
      } catch (err) {
        console.error(err);
        this.$root.$refs.toast.showToast('Failed to add picture', 'error');
      }
    },
  },
};
</script>
