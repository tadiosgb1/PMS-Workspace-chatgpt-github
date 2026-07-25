<template>
  <div>
    <Toast ref="toast" />
    <div
      v-if="visible"
      class="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
    >
      <div class="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col relative animate-in zoom-in duration-200 border border-gray-100 overflow-hidden">
        
        <div class="bg-gradient-to-r from-dprimary to-primary px-8 py-6 flex justify-between items-center shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white border border-white/20 backdrop-blur-md">
              <i class="fas fa-camera text-lg"></i>
            </div>
            <div>
              <h2 class="text-lg font-black text-white tracking-tight uppercase leading-none">Add Picture</h2>
              <p class="text-white/60 text-[9px] uppercase tracking-[0.2em] font-bold mt-1">Rent ID: {{ rentId }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 text-white hover:bg-white/20 transition-all">
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>

        <form @submit.prevent="submitForm" class="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          
          <div class="space-y-4">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visual Evidence</label>
            
            <div v-if="!form.preview">
              <label
                for="file-upload"
                class="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-200 rounded-[2rem] cursor-pointer bg-gray-50/50 hover:bg-primary/5 hover:border-primary transition-all group"
              >
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300 group-hover:text-primary transition-colors mb-4">
                    <i class="fas fa-cloud-upload-alt text-2xl"></i>
                  </div>
                  <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">Click to upload image</p>
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

            <div v-if="form.preview" class="relative group rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg animate-in fade-in slide-in-from-bottom-2">
              <img :src="form.preview" alt="preview" class="w-full h-auto max-h-80 object-contain bg-gray-50" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label for="file-upload" class="bg-white text-gray-800 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer">
                  Change Image
                </label>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Documentation Notes</label>
              <span class="text-[9px] font-bold px-2 py-0.5 rounded-md bg-gray-50 text-gray-400">
                {{ form.description.length }} / 200
              </span>
            </div>
            <textarea 
              v-model="form.description" 
              maxlength="200" 
              placeholder="Provide context for this image..."
              class="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all h-32 resize-none shadow-sm"
            />
          </div>
        </form>

        <div class="p-8 border-t border-gray-50 flex items-center justify-end gap-4 shrink-0 bg-white rounded-b-[2.5rem]">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-rose-500 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="submitForm"
            :disabled="loading"
            class="bg-primary hover:bg-dprimary disabled:bg-gray-200 text-white font-black text-[10px] uppercase tracking-[0.2em] px-10 py-4 rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center gap-3"
          >
            <i v-if="loading" class="fas fa-circle-notch animate-spin"></i>
            {{ loading ? "Uploading..." : "Save Documentation" }}
          </button>
        </div>
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
    visible: Boolean,
    rentId:Number,

  },
  data() {
    return {
      properties: [],
      form: {
        description: '',
        rent_id: this.rentId,
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
        fd.append('rent_id', this.form.rent_id);
        if (this.form.file) fd.append('rent_image', this.form.file);

        const res = await this.$apiPost('/post_rent_picture', fd, { 'Content-Type': 'multipart/form-data' });
        const msg = res?.message || 'Property picture added';
        this.$root.$refs.toast.showToast(msg, 'success');
        this.$emit('refresh');
        this.$emit('close');
        // Reset form
        this.form.description = '';
        this.form.rent_id = '';
        this.form.file = null;
        this.form.preview = null;
      } catch (err) {
        console.error(err);
        this.$root.$refs.toast.showToast('Failed to add picture', 'error');
      }
    }
  }
};
</script>

<style scoped>
/* scoped styles */
</style>
