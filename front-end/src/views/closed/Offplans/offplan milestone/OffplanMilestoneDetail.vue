<template>
  <div class="min-h-full bg-background p-4 md:p-6 lg:p-8">
    <div class="mx-auto max-w-5xl">
      <div v-if="loading" class="border border-slate-200 bg-white p-12 text-center text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading milestone…</div>
      <template v-else>
        <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><div class="mb-2 flex items-center gap-2 text-sm text-slate-500"><router-link :to="{name:'OffplanMilestone-view'}" class="hover:text-primary">Offplan Milestones</router-link><i class="fas fa-chevron-right text-[10px]"></i><span>Milestone detail</span></div><h1 class="text-2xl font-black text-slate-900">Offplan Milestone</h1><p class="mt-1 text-sm text-slate-500">Milestone #{{id}}</p></div>
          <div class="flex gap-2"><button @click="editOpen=true" class="border border-primary bg-primary px-5 py-2.5 text-sm font-bold text-white">Edit</button><router-link :to="{name:'OffplanMilestone-view'}" class="border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Back</router-link></div>
        </div>
        <div v-if="error" class="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{error}}</div>

        <div class="border border-slate-200 bg-white">
          <div class="border-b border-slate-200 px-6 py-5 flex items-center justify-between"><div><p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Milestone</p><h2 class="mt-1 text-lg font-bold text-slate-900">{{form.name||"#"+id}}</h2></div><span class="border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{{display(form.status)}}</span></div>
          <div class="grid border-b border-slate-200 sm:grid-cols-4"><div class="border-b sm:border-b-0 sm:border-r p-5"><p class="label">Planned date</p><p class="value">{{form.planned_date||"—"}}</p></div><div class="border-b sm:border-b-0 sm:border-r p-5"><p class="label">Actual date</p><p class="value">{{form.actual_date||"—"}}</p></div><div class="border-b sm:border-b-0 sm:border-r p-5"><p class="label">Completion</p><p class="value">{{form.completion_percentage||"—"}}</p></div><div class="p-5"><p class="label">Property</p><p class="value">{{relationLabel(form.offplan_property)}}</p></div></div>
          <div class="p-6"><p class="label">Description</p><p class="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{{form.description||"No description provided."}}</p></div>
        </div>

        <section class="mt-6 border border-slate-200 bg-white">
          <div class="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div><h2 class="font-bold text-slate-900">Milestone images</h2><p class="mt-1 text-xs text-slate-500">Add, replace, and remove progress images for this milestone.</p></div>
            <button type="button" @click="openAddImage" class="border border-primary bg-primary px-4 py-2 text-sm font-bold text-white"><i class="fas fa-plus mr-2"></i>Add image</button>
          </div>
          <div v-if="picturesLoading" class="p-10 text-center text-sm text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading images…</div>
          <div v-else-if="picturesError" class="m-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{picturesError}}</div>
          <div v-else-if="pictures.length" class="grid gap-4 p-6 sm:grid-cols-2">
            <article v-for="picture in pictures" :key="picture.id" class="overflow-hidden border border-slate-200 bg-white">
              <div class="relative aspect-video bg-slate-100">
                <img v-if="imageUrl(picture)" :src="imageUrl(picture)" :alt="picture.description || 'Milestone image'" class="h-full w-full object-cover" />
                <div v-else class="flex h-full items-center justify-center text-slate-400"><i class="fas fa-image text-3xl"></i></div>
                <div class="absolute right-2 top-2 flex gap-2">
                  <button type="button" @click="openEditImage(picture)" class="flex h-8 w-8 items-center justify-center bg-white/90 text-slate-700 shadow" title="Edit image"><i class="fas fa-pen text-xs"></i></button>
                  <button type="button" @click="deleteImage(picture)" class="flex h-8 w-8 items-center justify-center bg-white/90 text-red-600 shadow" title="Delete image"><i class="fas fa-trash text-xs"></i></button>
                </div>
              </div>
              <div class="p-4"><p class="text-sm font-medium text-slate-700">{{picture.description || 'No description'}}</p></div>
            </article>
          </div>
          <div v-else class="p-10 text-center text-sm text-slate-500"><i class="fas fa-images mb-2 block text-2xl text-slate-300"></i>No images have been added yet.</div>
        </section>
      </template>
    </div>

    <EditOffplanMilestone :open="editOpen" :id="id" @close="editOpen=false" @saved="load"/>
    <OffplanMilestoneImageModal :open="imageModalOpen" :milestone-id="id" :image="editingImage" @close="closeImageModal" @saved="handleImageSaved" />
  </div>
</template>

<script>
import EditOffplanMilestone from "./EditOffplanMilestone.vue";
import OffplanMilestoneImageModal from "./OffplanMilestoneImageModal.vue";

export default {
  name:"OffplanMilestoneDetail",
  components:{EditOffplanMilestone,OffplanMilestoneImageModal},
  props:{id:{type:[String,Number],default:null}},
  data(){return{
    form:{},loading:false,error:"",editOpen:false,
    pictures:[],picturesLoading:false,picturesError:"",
    imageModalOpen:false,editingImage:null,imageSaving:false,imageError:"",
    imageForm:{id:null,description:"",file:null,preview:"",currentUrl:""}
  }},
  mounted(){this.load()},
  methods:{
    async load(){
      if(!this.id)return;
      this.loading=true;this.error="";
      try{
        const res=await this.$apiGetById("/get_offplan_milestone",this.id);
        this.form=res?.data?.data||res?.data||res?.milestone||res;
        await this.loadPictures();
      }catch(e){this.error=e?.message||"Unable to load the milestone."}
      finally{this.loading=false}
    },
    display(v){return String(v||"—").replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())},
    relationLabel(v){return v&&typeof v==="object"?(v.name||v.title||v.id||"—"):v??"—"},
    normalizePictures(res){
      const raw=res?.data??res;
      if(Array.isArray(raw))return raw;
      for(const key of ["pictures","images","results","data"])if(Array.isArray(raw?.[key]))return raw[key];
      return [];
    },
    imageUrl(picture){return picture?.offplan_milestone_image||picture?.image||picture?.picture||picture?.url||picture?.file||""},
    async loadPictures(){
      if(!this.id)return;
      this.picturesLoading=true;this.picturesError="";
      try{
        const res=await this.$apiGet("/get_offplan_milestone_pictures",{offplan_milestone_id:this.id,milestone_id:this.id});
        this.pictures=this.normalizePictures(res);
      }catch(e){this.picturesError=e?.message||"Unable to load milestone images."}
      finally{this.picturesLoading=false}
    },
    openAddImage(){this.editingImage=null;this.imageModalOpen=true},
    openEditImage(picture){this.editingImage={...picture};this.imageModalOpen=true},
    async handleImageSaved(){this.closeImageModal();await this.loadPictures()},
    handleEditSaved(){this.editOpen=false;return this.load()},
    closeImageModal(){this.imageModalOpen=false;this.editingImage=null},
    async deleteImage(picture){
      if(!picture?.id||!window.confirm("Delete this milestone image?"))return;
      try{await this.$apiDelete("/delete_offplan_milestone_picture",picture.id);await this.loadPictures()}
      catch(e){this.picturesError=e?.message||"Unable to delete the milestone image."}
    },
  }
};
</script>
<style scoped>.label{font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#64748b}.value{margin-top:.5rem;font-size:.875rem;font-weight:600;color:#0f172a}</style>
