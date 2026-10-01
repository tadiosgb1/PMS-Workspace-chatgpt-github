<template>
  <div class="min-h-full bg-background p-3">
    <div class="mx-auto max-w-4xl border border-slate-200 bg-white">
      <div class="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <div><p class="text-[10px] font-semibold uppercase tracking-wide text-primary">Offplan payment plan</p><h1 class="text-sm font-semibold text-slate-900">{{ item.payment_type || "Payment plan" }}</h1></div>
        <button @click="editOpen=true" class="border border-primary px-3 py-1.5 text-[10px] font-semibold text-primary">Edit</button>
      </div>
      <div class="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="(v,k) in fields" :key="k" class="border border-slate-200 p-2">
          <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{{ label(k) }}</p>
          <p class="mt-0.5 text-xs font-medium text-slate-900">{{ v ?? "—" }}</p>
        </div>
      </div>
    </div>
    <EditOffplanPaymentPlan :open="editOpen" :id="id" @close="editOpen=false" @saved="load"/>
  </div>
</template>
<script>import EditOffplanPaymentPlan from "./EditOffplanPaymentPlan.vue";export default{name:"OffplanPaymentPlanDetail",components:{EditOffplanPaymentPlan},props:{id:[String,Number]},data(){return{item:{},editOpen:false}},computed:{fields(){return{payment_type:this.item.payment_type,frequency:this.item.frequency,amount:this.item.amount,due_date:this.item.due_date,installment_number:this.item.installment_number,total_installments:this.item.total_installments,is_completed:this.item.is_completed,application:this.rel(this.item.application),description:this.item.description}}},mounted(){this.load()},methods:{async load(){const r=await this.$apiGetById("/get_offplan_payment_plan",this.id);this.item=r?.data?.data||r?.data||r?.payment_plan||r},label(v){return v.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())},rel(v){return v&&typeof v==="object"?(v.name||v.id||"—"):v??"—"}}};</script>