<template>
  <div class="min-h-full bg-background p-4 md:p-6 lg:p-8"><div class="mx-auto max-w-5xl">
    <div v-if="loading" class="border border-slate-200 bg-white p-12 text-center text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading milestone…</div>
    <template v-else>
      <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div class="mb-2 flex items-center gap-2 text-sm text-slate-500"><router-link :to="{name:'OffplanMilestone-view'}" class="hover:text-primary">Offplan Milestones</router-link><i class="fas fa-chevron-right text-[10px]"></i><span>Milestone detail</span></div><h1 class="text-2xl font-black text-slate-900">Offplan Milestone</h1><p class="mt-1 text-sm text-slate-500">Milestone #{{id}}</p></div><div class="flex gap-2"><button @click="editOpen=true" class="border border-primary bg-primary px-5 py-2.5 text-sm font-bold text-white">Edit</button><router-link :to="{name:'OffplanMilestone-view'}" class="border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Back</router-link></div></div>
      <div v-if="error" class="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{error}}</div>
      <div class="border border-slate-200 bg-white"><div class="border-b border-slate-200 px-6 py-5 flex items-center justify-between"><div><p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Milestone</p><h2 class="mt-1 text-lg font-bold text-slate-900">{{form.name||"#"+id}}</h2></div><span class="border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{{display(form.status)}}</span></div>
        <div class="grid border-b border-slate-200 sm:grid-cols-4"><div class="border-b sm:border-b-0 sm:border-r p-5"><p class="label">Planned date</p><p class="value">{{form.planned_date||"—"}}</p></div><div class="border-b sm:border-b-0 sm:border-r p-5"><p class="label">Actual date</p><p class="value">{{form.actual_date||"—"}}</p></div><div class="border-b sm:border-b-0 sm:border-r p-5"><p class="label">Completion</p><p class="value">{{form.completion_percentage||"—"}}</p></div><div class="p-5"><p class="label">Property</p><p class="value">{{relationLabel(form.offplan_property)}}</p></div></div>
        <div class="p-6"><p class="label">Description</p><p class="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{{form.description||"No description provided."}}</p></div>
      </div>
    </template></div><EditOffplanMilestone :open="editOpen" :id="id" @close="editOpen=false" @saved="load"/>
  </div>
</template>
<script>
import EditOffplanMilestone from "./EditOffplanMilestone.vue";
export default {name:"OffplanMilestoneDetail",components:{EditOffplanMilestone},props:{id:{type:[String,Number],default:null}},data(){return{form:{},loading:false,error:"",editOpen:false}},mounted(){this.load()},methods:{async load(){if(!this.id)return;this.loading=true;this.error="";try{const res=await this.$apiGetById("/get_offplan_milestone",this.id);this.form=res?.data?.data||res?.data||res?.milestone||res}catch(e){this.error=e?.message||"Unable to load the milestone."}finally{this.loading=false}},display(v){return String(v||"—").replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())},relationLabel(v){return v&&typeof v==="object"?(v.name||v.title||v.id||"—"):v??"—"}}};
</script>
<style scoped>.label{font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#64748b}.value{margin-top:.5rem;font-size:.875rem;font-weight:600;color:#0f172a}</style>
