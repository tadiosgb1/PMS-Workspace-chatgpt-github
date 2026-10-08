<template>
  <div v-if="open" class="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/55 p-3 md:p-6" @keydown.esc="close">
    <div class="flex min-h-full items-center justify-center py-3 md:py-6">
      <section class="flex w-full max-w-2xl max-h-[calc(100vh-1.5rem)] md:max-h-[calc(100vh-3rem)] flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="milestone-image-title">
        <header class="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 md:px-5">
          <div><h2 id="milestone-image-title" class="text-sm font-semibold text-slate-900">{{ editing ? "Edit milestone image" : "Add milestone image" }}</h2><p class="mt-0.5 text-[10px] text-slate-500">{{ editing ? "Replace the image or update its description." : "Upload a progress image for this milestone." }}</p></div>
          <button type="button" @click="close" class="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Close"><i class="fas fa-times text-xs"></i></button>
        </header>
        <form @submit.prevent="submit" class="min-h-0 flex-1 overflow-y-auto">
          <div class="space-y-4 p-4 md:p-5">
            <div v-if="previewUrl" class="border border-slate-200 bg-slate-50">
              <div class="flex min-h-40 max-h-[42vh] items-center justify-center overflow-hidden p-2 md:min-h-52">
                <img :src="previewUrl" alt="Milestone image preview" class="max-h-[40vh] w-full object-contain" />
              </div>
            </div>
            <label class="block"><span class="mb-1.5 block text-xs font-semibold text-slate-700">{{ editing ? "New image" : "Image" }} <span class="text-red-500">*</span></span><input ref="file" type="file" accept="image/jpeg,image/png,image/gif,image/webp" @change="onFileChange" class="block w-full border border-slate-300 px-3 py-2 text-xs" :required="!editing" /><span class="mt-1 block text-[10px] text-slate-400">JPG, PNG, GIF or WEBP, maximum 10MB.</span></label>
            <label class="block"><span class="mb-1.5 block text-xs font-semibold text-slate-700">Description</span><textarea v-model="description" maxlength="200" class="min-h-20 w-full border border-slate-300 px-3 py-2 text-xs outline-none focus:border-primary" placeholder="Describe this image…"></textarea></label>
            <div v-if="error" class="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{{ error }}</div>
          </div>
          <footer class="sticky bottom-0 flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 md:px-5">
            <button type="button" @click="close" class="border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Cancel</button>
            <button type="submit" :disabled="saving" class="border border-primary bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"><i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>{{ saving ? "Saving…" : editing ? "Update image" : "Add image" }}</button>
          </footer>
        </form>
      </section>
    </div>
  </div>
</template>
<script>
export default {
  name:"OffplanMilestoneImageModal",
  props:{open:{type:Boolean,default:false},milestoneId:{type:[String,Number],required:true},image:{type:Object,default:null}},
  data(){return{description:"",file:null,previewUrl:"",currentUrl:"",saving:false,error:""}},
  computed:{editing(){return !!this.image}},
  watch:{open(v){if(v)this.initialize();else this.cleanup()},image(){if(this.open)this.initialize()}},
  methods:{
    initialize(){this.error="";this.file=null;this.description=this.image?.description||"";this.currentUrl=this.image?.offplan_milestone_image||this.image?.image||this.image?.picture||this.image?.url||this.image?.file||"";this.revokePreview();},
    revokePreview(){if(this.previewUrl){URL.revokeObjectURL(this.previewUrl);this.previewUrl=""}},
    onFileChange(e){const file=e.target.files?.[0];if(!file)return;const allowed=["image/jpeg","image/png","image/gif","image/webp"];if(!allowed.includes(file.type)){this.error="Only JPG, PNG, GIF and WEBP images are allowed.";e.target.value="";return}if(file.size>10*1024*1024){this.error="Image size must not exceed 10MB.";e.target.value="";return}this.error="";this.file=file;this.revokePreview();this.previewUrl=URL.createObjectURL(file)},
    close(){if(!this.saving)this.$emit("close")},
    cleanup(){this.revokePreview()},
    async submit(){this.error="";if(!this.editing&&!this.file){this.error="Please select an image.";return}this.saving=true;try{const fd=new FormData();fd.append("offplan_milestone",String(this.milestoneId));fd.append("description",this.description||"");if(this.file)fd.append("offplan_milestone_image",this.file);if(this.editing)await this.$apiPut("/update_offplan_milestone_picture",this.image.id,fd,{"Content-Type":"multipart/form-data"});else await this.$apiPost("/post_offplan_milestone_picture",fd,{"Content-Type":"multipart/form-data"});this.saving=false;this.$emit("close");this.$emit("saved")}catch(e){this.error=e?.response?.data?.offplan_milestone?.[0]||e?.message||"Unable to save the milestone image."}finally{this.saving=false}}
  }
};
</script>