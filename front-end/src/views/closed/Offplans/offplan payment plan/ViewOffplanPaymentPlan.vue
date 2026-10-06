<template>
  <div class="min-h-full bg-background p-3">
    <div class="mx-auto max-w-7xl">
      <div class="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
        <div><p class="text-[10px] font-semibold uppercase tracking-wide text-primary">Offplan</p><h1 class="text-sm font-semibold text-slate-900">Payment plans</h1></div>
        <button @click="addOpen=true" class="bg-primary px-3 py-1.5 text-[10px] font-semibold text-white">+ New plan</button>
      </div>
      <div class="mb-2 grid gap-2 border border-slate-200 bg-white p-2 md:grid-cols-4">
        <input v-model="filters.search" class="border border-slate-200 px-2 py-1.5 text-[10px] outline-none" placeholder="Search plan name, property..."/>
        <select v-model="filters.property" class="border border-slate-200 px-2 py-1.5 text-[10px]"><option value="">All properties</option><option v-for="p in properties" :key="p.id" :value="p.id">{{propertyOption(p)}}</option></select>
        <select v-model="filters.plan_type" class="border border-slate-200 px-2 py-1.5 text-[10px]"><option value="">All plan types</option><option value="installment">installment</option><option value="down_payment">down_payment</option><option value="final_payment">final_payment</option><option value="other">other</option></select>
        <select v-model="filters.is_active" class="border border-slate-200 px-2 py-1.5 text-[10px]"><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select>
        <select v-model="filters.zone" class="border border-slate-200 px-2 py-1.5 text-[10px]"><option value="">All zones</option><option v-for="z in zones" :key="z.id" :value="z.id">{{z.name || z.title || z.id}}</option></select>
        <select v-model="filters.completion_status" class="border border-slate-200 px-2 py-1.5 text-[10px]"><option value="">All completion statuses</option><option value="off_plan">off_plan</option><option value="ready">ready</option><option value="completed">completed</option></select>
        <select v-model="filters.project_status" class="border border-slate-200 px-2 py-1.5 text-[10px]"><option value="">All project statuses</option><option value="under_construction">under_construction</option><option value="completed">completed</option></select>
        <input v-model="filters.owner" class="border border-slate-200 px-2 py-1.5 text-[10px]" placeholder="Owner ID (e.g. 10)"/>
      </div>
      <div class="mb-2 flex justify-end"><button @click="load" class="border border-slate-200 px-3 py-1.5 text-[10px] font-medium text-slate-700">Refresh</button></div>
      <div class="overflow-x-auto border border-slate-200 bg-white">
        <table class="min-w-full text-left text-[10px]">
          <thead class="border-b border-slate-200 bg-slate-50"><tr><th class="px-2 py-1.5 font-semibold">Plan</th><th class="px-2 py-1.5 font-semibold">Property</th><th class="px-2 py-1.5 font-semibold">Type</th><th class="px-2 py-1.5 font-semibold">Total price</th><th class="px-2 py-1.5 font-semibold">Down payment</th><th class="px-2 py-1.5 font-semibold">Installments</th><th class="px-2 py-1.5 font-semibold">Active</th><th class="px-2 py-1.5 text-right font-semibold">Actions</th></tr></thead>
          <tbody><tr v-for="x in filtered" :key="x.id" class="border-t border-slate-100"><td class="px-2 py-1.5 font-semibold">{{x.name||"—"}}</td><td class="px-2 py-1.5">{{propertyName(x.property)}}</td><td class="px-2 py-1.5">{{x.plan_type||"—"}}</td><td class="px-2 py-1.5">{{x.total_price||"—"}}</td><td class="px-2 py-1.5">{{x.down_payment_percentage ?? "—"}}%</td><td class="px-2 py-1.5">{{x.number_of_installments ?? "—"}} × / {{x.installment_interval_months ?? "—"}} mo</td><td class="px-2 py-1.5">{{x.is_active?"Yes":"No"}}</td><td class="px-2 py-1.5 text-right whitespace-nowrap"><button @click="edit(x.id)" class="border border-primary px-2 py-1 text-[10px] text-primary">Edit</button></td></tr></tbody>
        </table>
        <div v-if="!loading&&!filtered.length" class="p-6 text-center text-[10px] text-slate-500">No payment plans found.</div>
      </div>
    </div>
    <AddOffplanPaymentPlan :open="addOpen" @close="addOpen=false" @saved="load"/>
    <EditOffplanPaymentPlan :open="editOpen" :id="selectedId" @close="editOpen=false" @saved="load"/>
  </div>
</template>
<script>
import AddOffplanPaymentPlan from "./AddOffplanPaymentPlan.vue";
import EditOffplanPaymentPlan from "./EditOffplanPaymentPlan.vue";
export default {
  name:"ViewOffplanPaymentPlan",
  components:{AddOffplanPaymentPlan,EditOffplanPaymentPlan},
  data(){return{items:[],properties:[],zones:[],loading:false,addOpen:false,editOpen:false,selectedId:null,filters:{search:"",property:"",plan_type:"",is_active:"",zone:"",completion_status:"",project_status:"",owner:""}};},
  computed:{filtered(){const f=this.filters,q=f.search.toLowerCase().trim();return this.items.filter(x=>{const p=x.property&&typeof x.property==="object"?x.property:null;const propertyId=p?.id??x.property;const zoneId=p?.property_zone?.id??p?.property_zone_id??p?.zone?.id;const ownerId=p?.owner?.id??p?.owner_id??p?.owner;const hay=[x.id,x.name,x.plan_type,x.total_price,propertyId,p?.developer,p?.property_type].join(" ").toLowerCase();return(!q||hay.includes(q))&&(!f.property||String(propertyId)===String(f.property))&&(!f.plan_type||String(x.plan_type)===f.plan_type)&&(!f.is_active||String(Boolean(x.is_active))===f.is_active)&&(!f.zone||String(zoneId)===String(f.zone))&&(!f.completion_status||String(p?.completion_status)===f.completion_status)&&(!f.project_status||String(p?.project_status)===f.project_status)&&(!f.owner||String(ownerId)===String(f.owner));});}},
  watch:{filters:{handler(){this.load();},deep:true}},
  mounted(){this.loadBaseData();this.load();},
  methods:{
    async loadBaseData(){try{this.properties=await this.$getOffplanProperties();}catch(e){this.properties=[];}try{const r=await this.$getZones({page:1,pageSize:1000});this.zones=r?.zones||[];}catch(e){this.zones=[];}},
    async load(){this.loading=true;try{const params={};if(this.filters.property)params.property=this.filters.property;if(this.filters.plan_type)params.plan_type=this.filters.plan_type;if(this.filters.is_active)params.is_active=this.filters.is_active;if(this.filters.zone)params.property__property_zone=this.filters.zone;if(this.filters.completion_status)params.property__completion_status=this.filters.completion_status;if(this.filters.project_status)params.property__project_status=this.filters.project_status;if(this.filters.owner)params.property__owner=this.filters.owner;this.items=await this.$getOffplanProducts(params);}catch(e){this.items=[];}finally{this.loading=false;}},
    propertyName(value){const id=value&&typeof value==="object"?value.id:value;const p=this.properties.find(x=>String(x.id)===String(id));return p?this.propertyOption(p):(value?.name||id||"—");},
    propertyOption(item){return[item?.id?"#"+item.id:"",item?.developer||item?.project_name||"",item?.property_type||"Offplan property"].filter(Boolean).join(" · ");},
    edit(id){this.selectedId=id;this.editOpen=true;}
  }
};
</script>