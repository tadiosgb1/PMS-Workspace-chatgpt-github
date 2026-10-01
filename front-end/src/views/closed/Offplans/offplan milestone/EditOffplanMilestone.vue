<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
    <div class="w-full max-w-3xl max-h-[92vh] overflow-hidden border border-slate-200 bg-white shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4"><div><h2 class="text-lg font-semibold text-slate-900">Edit offplan milestone</h2><p class="mt-0.5 text-xs text-slate-500">Update milestone progress and dates.</p></div><button type="button" @click="close" class="flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-500"><i class="fas fa-times"></i></button></div>
      <div v-if="loadingData" class="flex min-h-64 items-center justify-center text-sm text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading milestone…</div>
      <form v-else @submit.prevent="submitForm" class="max-h-[calc(92vh-132px)] overflow-y-auto">
        <div class="grid gap-5 p-6 md:grid-cols-2">
          <Field label="Name" required><input v-model="form.name" class="input" required /></Field>
          <Field label="Status" required><select v-model="form.status" class="input" required><option value="planned">Planned</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="delayed">Delayed</option><option value="cancelled">Cancelled</option></select></Field>
          <Field label="Planned date" required><input v-model="form.planned_date" type="date" class="input" required /></Field>
          <Field label="Actual date"><input v-model="form.actual_date" type="date" class="input" /></Field>
          <Field label="Completion percentage" required><input v-model="form.completion_percentage" class="input" required /></Field>
          <Field label="Offplan property ID" required><input v-model.number="form.offplan_property" type="number" min="1" class="input" required /></Field>
          <Field label="Description"><textarea v-model="form.description" class="input min-h-28 resize-y"></textarea></Field>
        </div>
        <div v-if="error" class="mx-6 mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
        <div class="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4"><button type="button" @click="close" class="border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700">Cancel</button><button type="submit" :disabled="saving" class="border border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"><i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>{{saving?"Saving…":"Save changes"}}</button></div>
      </form>
    </div>
  </div>
</template>
<script>
import OffplanField from "../offplan property/OffplanField.vue";
const defaults={name:"",description:"",planned_date:"",actual_date:"",completion_percentage:"",status:"planned",offplan_property:0};
export default {name:"EditOffplanMilestone",components:{Field:OffplanField},props:{open:{type:Boolean,default:false},id:{type:[String,Number],default:null}},data(){return{form:{...defaults},loadingData:false,saving:false,error:""}},watch:{open(v){if(v)this.load()}},methods:{close(){if(!this.saving)this.$emit("close")},async load(){if(!this.id)return;this.loadingData=true;this.error="";try{const res=await this.$apiGetById("/get_offplan_milestone",this.id);this.form={...defaults,...(res?.data?.data||res?.data||res?.milestone||res)}}catch(e){this.error=e?.message||"Unable to load the milestone."}finally{this.loadingData=false}},async submitForm(){this.saving=true;this.error="";const payload={...this.form,offplan_property:Number(this.form.offplan_property)};try{await this.$apiPatch("/update_offplan_milestone",this.id,payload);this.$emit("saved");this.$emit("close")}catch(e){this.error=e?.message||"Unable to update the milestone."}finally{this.saving=false}}}};
</script>
<style scoped>.input{width:100%;border:1px solid #cbd5e1;padding:.625rem .75rem;outline:none;background:#fff;color:#0f172a;font-size:.875rem}.input:focus{border-color:#5f5ffc;box-shadow:0 0 0 2px rgba(95,95,252,.12)}</style>
