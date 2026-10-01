<template>
  <div class="min-h-full bg-slate-50 p-4 md:p-6 lg:p-8">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><div class="mb-2 flex items-center gap-2 text-sm text-slate-500"><router-link :to="{name:'OffplanProperty-view'}" class="hover:text-blue-600">Offplan Properties</router-link><i class="fas fa-chevron-right text-[10px]"></i><span>Edit</span></div><h1 class="text-2xl font-black tracking-tight text-slate-900">Edit Offplan Property</h1><p class="mt-1 text-sm text-slate-500">Update project details, commercial terms and amenities.</p></div>
        <router-link :to="{name:'OffplanProperty-detail',params:{id}}" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"><i class="fas fa-eye"></i> View property</router-link>
      </div>
      <div v-if="loadingData" class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading property…</div>
      <form v-else @submit.prevent="submitForm" class="space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-6 py-5"><h2 class="font-bold text-slate-900">Property information</h2><p class="text-xs text-slate-500">Keep the property record aligned with the offplan project.</p></div>
          <div class="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Property type"><select v-model="form.property_type" class="input"><option value="residential">Residential</option><option value="commercial">Commercial</option></select></Field>
            <Field label="Completion status"><select v-model="form.completion_status" class="input"><option value="ready">Ready</option><option value="offplan">Offplan</option><option value="under_construction">Under construction</option></select></Field>
            <Field label="Price"><input v-model="form.price" class="input" type="text" /></Field>
            <Field label="Bedrooms"><input v-model="form.bedrooms" class="input" type="text" /></Field>
            <Field label="Bathrooms"><input v-model="form.bathrooms" class="input" type="text" /></Field>
            <Field label="Area / size"><input v-model="form.area_or_size" class="input" type="text" /></Field>
            <Field label="Sale type"><select v-model="form.sale_type" class="input"><option value="initial_sale">Initial sale</option><option value="resale">Resale</option></select></Field>
            <Field label="Project completion"><select v-model="form.project_completion" class="input"><option value="under_25">Under 25%</option><option value="25_50">25% – 50%</option><option value="50_75">50% – 75%</option><option value="over_75">Over 75%</option></select></Field>
            <Field label="Pre-handover payment"><select v-model="form.pre_handover_payment" class="input"><option value="under_25">Under 25%</option><option value="25_50">25% – 50%</option><option value="50_75">50% – 75%</option><option value="over_75">Over 75%</option></select></Field>
            <Field label="Project status"><select v-model="form.project_status" class="input"><option value="under_construction">Under construction</option><option value="planned">Planned</option><option value="completed">Completed</option></select></Field>
            <Field label="Developer"><input v-model="form.developer" class="input" type="text" /></Field>
            <Field label="Property zone"><input v-model.number="form.property_zone" class="input" type="number" min="0" /></Field>
            <Field label="Owner"><input v-model.number="form.owner" class="input" type="number" min="0" /></Field>
            <Field label="Manager"><input v-model.number="form.manager" class="input" type="number" min="0" /></Field>
          </div>
        </section>
        <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-6 py-5"><h2 class="font-bold text-slate-900">Amenities & features</h2></div>
          <div class="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
            <label v-for="item in amenityOptions" :key="item.key" class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-blue-50/40"><input v-model="form[item.key]" type="checkbox" class="h-4 w-4 rounded text-blue-600" /><span class="text-sm font-medium text-slate-700">{{item.label}}</span></label>
          </div>
        </section>
        <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{error}}</div>
        <div class="flex justify-end gap-3"><router-link :to="{name:'OffplanProperty-view'}" class="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700">Cancel</router-link><button :disabled="saving" class="rounded-xl bg-slate-900 px-7 py-3 text-sm font-bold text-white disabled:opacity-60"><i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>{{saving?'Saving…':'Save changes'}}</button></div>
      </form>
    </div>
  </div>
</template>
<script>
const defaults = {property_type:"residential",completion_status:"ready",price:"",bedrooms:"",bathrooms:"",area_or_size:"",sale_type:"initial_sale",project_completion:"under_25",pre_handover_payment:"under_25",project_status:"under_construction",developer:"",is_furnished:true,has_maids_room:true,has_study:true,has_central_or_ac_and_heating:true,has_balcony:true,has_private_garden:true,has_private_pool:true,has_private_gym:true,has_private_jacuzzi:true,has_shared_pool:true,has_shared_spa:true,property_zone:0,owner:0,manager:0};
export default { name:"EditOffplanProperty", props:{id:[String,Number]}, components:{Field:{props:["label"],template:'<div><label class="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">{{label}}</label><slot/></div>'}}, data(){return{form:{...defaults},loadingData:true,saving:false,error:"",amenityOptions:[{key:"is_furnished",label:"Furnished"},{key:"has_maids_room",label:"Maid’s room"},{key:"has_study",label:"Study"},{key:"has_central_or_ac_and_heating",label:"Central A/C & heating"},{key:"has_balcony",label:"Balcony"},{key:"has_private_garden",label:"Private garden"},{key:"has_private_pool",label:"Private pool"},{key:"has_private_gym",label:"Private gym"},{key:"has_private_jacuzzi",label:"Private jacuzzi"},{key:"has_shared_pool",label:"Shared pool"},{key:"has_shared_spa",label:"Shared spa"}]}}, async mounted(){await this.load()},methods:{async load(){try{const res=await this.$apiGetById("/get_offplan_property",this.id);const item=res?.data?.data||res?.data||res?.property||res;this.form={...defaults,...item}}catch(e){this.error=e?.message||"Unable to load property."}finally{this.loadingData=false}},async submitForm(){this.saving=true;this.error="";try{await this.$apiPatch("/update_offplane_property",this.id,{...this.form});this.$router.push({name:"OffplanProperty-detail",params:{id:this.id},query:{updated:"1"}})}catch(e){this.error=e?.message||"Unable to update the offplan property."}finally{this.saving=false}}}};
</script>
<style scoped>.input{width:100%;border:1px solid #e2e8f0;border-radius:.75rem;padding:.7rem .9rem;outline:none;background:#fff;color:#0f172a}.input:focus{border-color:#93c5fd;box-shadow:0 0 0 3px rgba(59,130,246,.1)}</style>
