<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3">
    <div class="w-full max-w-xl max-h-[88vh] overflow-hidden border border-slate-200 bg-white shadow-lg">
      <div class="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <div><p class="text-[10px] font-semibold uppercase tracking-wide text-primary">Offplan payment</p><h2 class="text-sm font-semibold text-slate-900">New payment</h2></div>
        <button @click="close" class="h-7 w-7 border border-slate-300 text-sm">×</button>
      </div>
      <form @submit.prevent="submit">
        <div class="grid max-h-[calc(88vh-112px)] gap-2 overflow-y-auto p-3 md:grid-cols-2">
          <Field v-for="f in textFields" :key="f" :label="label(f)"><input v-model="form[f]" class="input"/></Field>
          <Field label="Payment status"><select v-model="form.payment_status" class="input"><option v-for="s in paymentStatuses" :key="s" :value="s">{{s}}</option></select></Field>
          <Field label="Payment method"><input v-model="form.payment_method" class="input"/></Field>
          <Field label="Paid at"><input v-model="form.paid_at" type="datetime-local" class="input"/></Field>
          <Field label="Due date"><input v-model="form.due_date" type="date" class="input"/></Field>
          <Field label="Application ID"><input v-model.number="form.application" type="number" min="1" class="input"/></Field>
          <Field label="Payment plan ID"><input v-model.number="form.payment_plan" type="number" min="1" class="input"/></Field>
        </div>
        <div v-if="error" class="mx-3 mb-2 flex h-7 items-center overflow-hidden border border-red-200 bg-red-50 px-2 text-[10px] text-red-700" :title="error">{{error}}</div>
        <div class="flex justify-end gap-2 border-t border-slate-200 px-3 py-2"><button type="button" @click="close" class="border border-slate-300 px-3 py-1.5 text-xs">Cancel</button><button :disabled="loading" class="bg-primary px-3 py-1.5 text-xs font-semibold text-white">{{loading?'Saving…':'Create payment'}}</button></div>
      </form>
    </div>
  </div>
</template>
<script>
import OffplanField from "../offplan property/OffplanField.vue";
const blank=()=>({amount:"",payment_status:"pending",payment_method:"getremit",transaction_id:"",paid_at:"",due_date:"",notes:"",application:0,payment_plan:0});
export default{name:"AddOffplanPayment",components:{Field:OffplanField},props:{open:Boolean},data(){return{form:blank(),loading:false,error:"",textFields:["amount","transaction_id","notes"],paymentStatuses:["pending","completed","failed","cancelled","overdue"]}},watch:{open(v){if(v){this.form=blank();this.error=""}}},methods:{close(){if(!this.loading)this.$emit("close")},label(v){return v.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())},async submit(){this.loading=true;this.error="";try{await this.$apiPost("/post_offplan_payment",{...this.form,application:Number(this.form.application),payment_plan:Number(this.form.payment_plan)});this.$emit("saved");this.close()}catch(e){this.error=e?.message||"Unable to create payment."}finally{this.loading=false}}}};
</script>
<style scoped>.input{width:100%;border:1px solid #cbd5e1;padding:.4rem .55rem;font-size:.75rem;line-height:1rem;outline:none}</style>