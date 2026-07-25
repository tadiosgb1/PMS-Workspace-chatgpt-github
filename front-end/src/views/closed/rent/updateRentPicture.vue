<template>
  <div>
    <Toast ref="toast" />
    <div
      v-if="visible"
      class="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
    >
      <div class="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col relative animate-in zoom-in duration-200 border border-gray-100 overflow-hidden">
        
        <div class="bg-gradient-to-r from-secondary to-dprimary px-8 py-6 flex justify-between items-center shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white border border-white/20 backdrop-blur-md">
              <i class="fas fa-sync-alt text-lg"></i>
            </div>
            <div>
              <h2 class="text-lg font-black text-white tracking-tight uppercase leading-none">Update Documentation</h2>
              <p class="text-white/60 text-[9px] uppercase tracking-[0.2em] font-bold mt-1">Modifying Picture Entry</p>
            </div>
          </div>
          <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 text-white hover:bg-white/20 transition-all border border-white/10">
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>

        <form @submit.prevent="submitForm" class="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Documentation Notes</label>
              <span class="text-[9px] font-bold px-2 py-0.5 rounded-md bg-gray-50 text-gray-400">
                {{ (form.description || '').length }} / 200
              </span>
            </div>
            <textarea
              v-model="form.description"
              maxlength="200"
              placeholder="Update the context for this documentation..."
              class="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-secondary focus:ring-4 focus:ring-secondary/5 outline-none transition-all h-28 resize-none shadow-sm"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="form.rent_image" class="space-y-3">
              <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Entry</p>
              <div class="rounded-2xl overflow-hidden border border-gray-100 shadow-sm opacity-60">
                <img :src="form.rent_image" class="w-full h-40 object-cover" />
              </div>
            </div>

            <div class="space-y-3">
              <p class="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Replace With</p>
              
              <div v-if="!form.preview" class="relative group">
                <label
                  for="update-upload"
                  class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50/30 hover:bg-primary/5 hover:border-primary transition-all"
                >
                  <i class="fas fa-plus text-gray-300 group-hover:text-primary mb-2"></i>
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select File</span>
                  <input id="update-upload" type="file" @change="onFileChange" accept="image/*" class="hidden" />
                </label>
              </div>

              <div v-if="form.preview" class="relative rounded-2xl overflow-hidden border-2 border-primary shadow-lg animate-in zoom-in duration-300">
                <img :src="form.preview" class="w-full h-40 object-cover" />
                <button @click="form.preview = null" class="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px]">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </form>

        <div class="p-8 border-t border-gray-50 flex items-center justify-end gap-4 shrink-0 bg-white rounded-b-[2.5rem]">
          <button
            type="button"
            @click="$emit('close')"
            class="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-rose-500 transition-colors"
          >
            Discard
          </button>
          <button
            @click="submitForm"
            :disabled="loading"
            class="bg-secondary hover:bg-dprimary disabled:bg-gray-200 text-white font-black text-[10px] uppercase tracking-[0.2em] px-10 py-4 rounded-2xl shadow-xl shadow-secondary/30 active:scale-95 transition-all flex items-center gap-3"
          >
            <i v-if="loading" class="fas fa-circle-notch animate-spin text-xs"></i>
            {{ loading ? "Processing..." : "Commit Update" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Toast from "@/components/Toast.vue";

export default {
  name: "UpdateRentPicture",
  components: { Toast },
  props: {
    visible: Boolean,
    picture: Object,
    rentId: Number,
  },
  data() {
    return {
      form: {
        id: null,
        description: "",
        rent_image: "",
        rent_id: this.rentId,
        file: null,
        preview: null,
      },
    };
  },
  watch: {
    picture: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.form = {
            ...newVal,
            description: newVal.description || "",
            rent_id: this.rentId,
            file: null,
            preview: null,
          };
        }
      },
    },
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
        fd.append("description", this.form.description);
        fd.append("rent_id", this.form.rent_id);
        if (this.form.file) fd.append("rent_image", this.form.file);

        const res = await this.$apiPut(
          "/update_rent_picture",
          this.form.id,
          fd,
          { "Content-Type": "multipart/form-data" }
        );
        const msg = res?.message || "Rent picture updated";
        this.$root.$refs.toast.showToast(msg, "success");
        this.$emit("refresh");
        setTimeout(() => this.$emit("close"), 1000);
      } catch (err) {
        console.error(err);
        this.$root.$refs.toast.showToast("Failed to update rent picture", "error");
      }
    },
  },
};
</script>

<style scoped>
.custom-input {
  @apply w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500;
}
</style>
