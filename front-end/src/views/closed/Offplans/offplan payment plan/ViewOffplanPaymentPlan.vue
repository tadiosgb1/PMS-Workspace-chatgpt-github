<template>
  <div class="min-h-full bg-background p-3">
    <div class="mx-auto max-w-7xl">
      <div class="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
        <div><p class="text-[10px] font-semibold uppercase tracking-wide text-primary">Offplan</p><h1 class="text-sm font-semibold text-slate-900">Payment plans</h1></div>
        <button @click="addOpen=true" class="bg-primary px-3 py-1.5 text-[10px] font-semibold text-white">+ New plan</button>
      </div>
      <div class="mb-2 flex gap-2 border border-slate-200 bg-white p-2">
        <input v-model="search" class="w-full border border-slate-200 px-2 py-1.5 text-[10px] outline-none" placeholder="Search payment plans"/>
        <button @click="load" class="border border-slate-200 px-3 py-1.5 text-[10px] font-medium text-slate-700">Refresh</button>
      </div>
      <div class="overflow-x-auto border border-slate-200 bg-white">
        <table class="min-w-full text-left text-[10px]">
          <thead class="border-b border-slate-200 bg-slate-50"><tr><th class="px-2 py-1.5 font-semibold">Type</th><th class="px-2 py-1.5 font-semibold">Frequency</th><th class="px-2 py-1.5 font-semibold">Amount</th><th class="px-2 py-1.5 font-semibold">Due</th><th class="px-2 py-1.5 font-semibold">Installment</th><th class="px-2 py-1.5 font-semibold">Completed</th><th class="px-2 py-1.5 text-right font-semibold">Actions</th></tr></thead>
          <tbody><tr v-for="x in filtered" :key="x.id" class="border-t border-slate-100"><td class="px-2 py-1.5 font-semibold">{{x.payment_type||"—"}}</td><td class="px-2 py-1.5">{{x.frequency||"—"}}</td><td class="px-2 py-1.5">{{x.amount||"—"}}</td><td class="px-2 py-1.5">{{x.due_date||"—"}}</td><td class="px-2 py-1.5">{{x.installment_number||"—"}} / {{x.total_installments||"—"}}</td><td class="px-2 py-1.5">{{x.is_completed?"Yes":"No"}}</td><td class="px-2 py-1.5 text-right whitespace-nowrap"><router-link :to="{name:'OffplanPaymentPlan-detail',params:{id:x.id}}" class="border border-slate-200 px-2 py-1 text-[10px]">View</router-link> <button @click="edit(x.id)" class="border border-primary px-2 py-1 text-[10px] text-primary">Edit</button></td></tr></tbody>
        </table>
        <div v-if="!loading&&!filtered.length" class="p-6 text-center text-[10px] text-slate-500">No payment plans found.</div>
      </div>
    </div>
    <AddOffplanPaymentPlan :open="addOpen" @close="addOpen=false" @saved="load"/>
    <EditOffplanPaymentPlan :open="editOpen" :id="selectedId" @close="editOpen=false" @saved="load"/>
  </div>
</template>
<script>import AddOffplanPaymentPlan from "./AddOffplanPaymentPlan.vue";import EditOffplanPaymentPlan from "./EditOffplanPaymentPlan.vue";export default{name:"ViewOffplanPaymentPlan",components:{AddOffplanPaymentPlan,EditOffplanPaymentPlan},data(){return{items:[],search:"",loading:false,addOpen:false,editOpen:false,selectedId:null}},computed:{filtered(){const q=this.search.toLowerCase().trim();return q?this.items.filter(x=>[x.id,x.payment_type,x.frequency,x.amount,x.due_date,x.application].join(" ").toLowerCase().includes(q)):this.items}},mounted(){this.load()},methods:{async load(){this.loading=true;try{const r=await this.$getOffplanPaymentPlans();const d=r?.data?.data||r?.data||r?.payment_plans||r;this.items=Array.isArray(d)?d:(d?.results||[])}catch(e){}finally{this.loading=false}},edit(id){this.selectedId=id;this.editOpen=true}}};</script>