<template>
  <div class="min-h-full bg-background p-3">
    <div class="mx-auto max-w-4xl border border-slate-200 bg-white">
      <div class="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <div><p class="text-[10px] font-semibold uppercase tracking-wide text-primary">Offplan payment</p><h1 class="text-sm font-semibold text-slate-900">{{item.amount||"Payment"}}</h1></div>
        <button @click="editOpen=true" class="border border-primary px-3 py-1.5 text-[10px] font-semibold text-primary">Edit</button>
      </div>
      <div class="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="(v,k) in fields" :key="k" class="border border-slate-200 p-2">
          <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{{label(k)}}</p>
          <p class="mt-0.5 text-xs font-medium text-slate-900">{{v??"—"}}</p>
        </div>
      </div>
    </div>
    <EditOffplanPayment :open="editOpen" :id="id" @close="editOpen=false" @saved="load"/>
  </div>
</template>
<script>
import EditOffplanPayment from "./EditOffplanPayment.vue";
export default{name:"OffplanPaymentDetail",components:{EditOffplanPayment},props:{id:[String,Number]},data(){return{item:{},editOpen:false}},computed:{fields(){return{amount:this.item.amount,payment_status:this.item.payment_status,payment_method:this.item.payment_method,verified_by:this.rel(this.item.verified_by),transaction_id:this.item.transaction_id,paid_at:this.item.paid_at,due_date:this.item.due_date,application:this.rel(this.item.application),payment_plan:this.rel(this.item.payment_plan),notes:this.item.notes}}},mounted(){this.load()},methods:{async load(){const r=await this.$apiGetById("/get_offplan_payment",this.id);this.item=r?.data?.data||r?.data||r?.payment||r},label(v){return v.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())},rel(v){return v&&typeof v==="object"?(v.name||v.full_name||v.username||v.email||v.id||"—"):v??"—"}}};
</script>