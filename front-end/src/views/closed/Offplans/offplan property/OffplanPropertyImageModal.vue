<template>
  <div v-if="open" class="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/55 p-3 md:p-6" @keydown.esc="close">
    <div class="flex min-h-full items-center justify-center py-3 md:py-6">
      <section class="flex w-full max-w-2xl max-h-[calc(100vh-1.5rem)] md:max-h-[calc(100vh-3rem)] flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="property-image-title">
        <header class="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 md:px-5">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-wide text-primary">Property images</p>
            <h2 id="property-image-title" class="mt-0.5 text-sm font-semibold text-slate-900">{{ editing ? "Edit property image" : "Add property image" }}</h2>
            <p class="mt-0.5 text-[11px] text-slate-500">{{ editing ? "Replace the image or update its description." : "Upload an image for this property." }}</p>
          </div>
          <button type="button" @click="close" class="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 hover:border-primary hover:text-primary" aria-label="Close">
            <i class="fas fa-times text-xs"></i>
          </button>
        </header>

        <form @submit.prevent="submit" class="min-h-0 flex-1 overflow-y-auto">
          <div class="space-y-4 p-4 md:p-5">
            <div v-if="previewUrl" class="border border-slate-200 bg-slate-50">
              <div class="flex min-h-40 max-h-[45vh] items-center justify-center overflow-hidden p-2 md:min-h-56">
                <img :src="previewUrl" alt="Property image preview" class="max-h-[42vh] w-full object-contain" />
              </div>
            </div>

            <label class="block">
              <span class="mb-1.5 block text-[11px] font-semibold text-slate-700">{{ editing ? "New image" : "Image" }} <span class="text-red-500">*</span></span>
              <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/gif,image/webp" :required="!editing" @change="onFileChange" class="block w-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-primary" />
              <span class="mt-1 block text-[10px] text-slate-400">JPG, PNG, GIF or WEBP · maximum 10MB.</span>
            </label>

            <label class="block">
              <span class="mb-1.5 block text-[11px] font-semibold text-slate-700">Description</span>
              <textarea v-model="description" maxlength="200" rows="4" class="block min-h-24 w-full resize-y border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-primary" placeholder="Describe this image…"></textarea>
            </label>

            <div v-if="error" class="border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">{{ error }}</div>
          </div>

          <footer class="sticky bottom-0 flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 md:px-5">
            <button type="button" @click="close" :disabled="saving" class="border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="submit" :disabled="saving" class="border border-primary bg-primary px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              <i v-if="saving" class="fas fa-spinner fa-spin mr-1.5"></i>{{ saving ? "Saving…" : editing ? "Update image" : "Add image" }}
            </button>
          </footer>
        </form>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "OffplanPropertyImageModal",
  props: {
    open: { type: Boolean, default: false },
    propertyId: { type: [String, Number], required: true },
    image: { type: Object, default: null }
  },
  data() {
    return { description: "", file: null, preview: "", saving: false, error: "" };
  },
  computed: {
    editing() { return !!this.image; },
    previewUrl() { return this.preview || this.imageUrl(this.image); }
  },
  watch: {
    open(value) {
      if (value) this.reset();
      else this.releasePreview();
    }
  },
  methods: {
    imageUrl(item) {
      return item?.offplan_property_image || item?.image || item?.picture || item?.url || item?.file || "";
    },
    reset() {
      this.releasePreview();
      this.description = this.image?.description || "";
      this.file = null;
      this.preview = "";
      this.error = "";
      this.saving = false;
      if (this.$refs.fileInput) this.$refs.fileInput.value = "";
    },
    releasePreview() {
      if (this.preview) URL.revokeObjectURL(this.preview);
      this.preview = "";
    },
    close() {
      if (!this.saving) this.$emit("close");
    },
    onFileChange(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
        this.error = "Only JPG, PNG, GIF and WEBP images are allowed.";
        event.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.error = "Image size must not exceed 10MB.";
        event.target.value = "";
        return;
      }
      this.error = "";
      this.releasePreview();
      this.file = file;
      this.preview = URL.createObjectURL(file);
    },
    async submit() {
      if (!this.editing && !this.file) {
        this.error = "Please select an image.";
        return;
      }
      this.saving = true;
      this.error = "";
      try {
        const fd = new FormData();
        fd.append("offplan_property", String(this.propertyId));
        fd.append("description", this.description || "");
        if (this.file) fd.append("offplan_property_image", this.file);

        if (this.editing) {
          await this.$apiPut("/update_offplan_property_picture", this.image.id, fd, { "Content-Type": "multipart/form-data" });
        } else {
          await this.$apiPost("/post_offplan_property_picture", fd, { "Content-Type": "multipart/form-data" });
        }

        this.saving = false;
        this.$emit("close");
        this.$emit("saved");
      } catch (e) {
        this.error = e?.response?.data?.offplan_property?.[0] || e?.message || "Unable to save the property image.";
      } finally {
        this.saving = false;
      }
    }
  },
  beforeUnmount() { this.releasePreview(); }
};
</script>
