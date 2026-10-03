<template>
  <div class="min-h-screen bg-slate-50 p-5 text-sm text-slate-800"><div class="mx-auto max-w-[1600px] space-y-5">
    <header class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div class="mb-2 flex items-center gap-2"><span class="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><i class="fas fa-users"></i></span><span class="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Alpha PMS · Executive Report</span></div><p class="mt-1 text-xs font-medium text-slate-500">Sample client portfolio and account activity · demo data only</p></div><div class="flex gap-2"><select v-model="segment" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"><option>All</option><option>Owner</option><option>Tenant</option><option>Manager</option><option>Staff</option></select><button @click="exportCsv" class="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white"><i class="fas fa-download mr-2"></i>Export</button></div></header>
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4"><div v-for="c in cards" :key="c.label" class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div class="text-[10px] font-black uppercase tracking-wider text-slate-400">{{c.label}}</div><div class="mt-2 text-2xl font-black text-slate-900">{{c.value}}</div><div class="mt-1 text-[11px] font-semibold text-emerald-600">{{c.note}}</div></div></div>
    <section class="grid gap-5 lg:grid-cols-[1.35fr_.65fr]"><div class="rounded-xl border border-slate-200 bg-white shadow-sm"><div class="border-b border-slate-100 p-4"><h2 class="font-black">Client Directory</h2><p class="mt-1 text-xs text-slate-400">Representative PMS client records</p></div><div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400"><tr><th class="px-4 py-3">Client</th><th class="px-4 py-3">Role</th><th class="px-4 py-3">Portfolio</th><th class="px-4 py-3">Joined</th><th class="px-4 py-3">Status</th></tr></thead><tbody class="divide-y divide-slate-100"><tr v-for="row in filteredClients" :key="row.id" class="hover:bg-slate-50"><td class="px-4 py-3"><div class="font-bold">{{row.name}}</div><div class="text-[11px] text-slate-400">{{row.email}}</div></td><td class="px-4 py-3"><span class="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black text-primary">{{row.role}}</span></td><td class="px-4 py-3 text-xs font-semibold">{{row.portfolio}}</td><td class="px-4 py-3 text-xs text-slate-500">{{row.joined}}</td><td class="px-4 py-3"><span :class="row.status==='Active'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'" class="rounded-full px-2 py-1 text-[10px] font-bold">{{row.status}}</span></td></tr></tbody></table></div></div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 class="font-black">Client Mix</h2><p class="mt-1 text-xs text-slate-400">Sample account distribution</p><div class="mt-6 space-y-4"><div v-for="m in mix" :key="m.label"><div class="mb-1 flex justify-between text-xs font-bold"><span>{{m.label}}</span><span>{{m.value}}</span></div><div class="h-2 rounded-full bg-slate-100"><div class="h-full rounded-full bg-primary" :style="{width:m.pct+'%'}"></div></div></div></div><div class="mt-8 rounded-lg bg-slate-50 p-4"><p class="text-[10px] font-black uppercase tracking-wider text-slate-400">Data source</p><p class="mt-1 text-xs font-semibold text-slate-600">Static sample records are used until the reporting API is connected.</p></div></div>
    </section>
  </div></div>
</template>
<script>
export default {
  name:"ClientReport",
  data(){return{segment:"All",clients:[
    {id:1,name:"Amanuel Tesfaye",email:"amanuel@example.com",role:"Owner",portfolio:"8 properties",joined:"2026-01-12",status:"Active"},
    {id:2,name:"Sara Bekele",email:"sara@example.com",role:"Tenant",portfolio:"2 rentals",joined:"2026-02-04",status:"Active"},
    {id:3,name:"Daniel Mekonnen",email:"daniel@example.com",role:"Manager",portfolio:"14 properties",joined:"2026-02-19",status:"Active"},
    {id:4,name:"Hana Worku",email:"hana@example.com",role:"Owner",portfolio:"5 properties",joined:"2026-03-02",status:"Active"},
    {id:5,name:"Yonas Girma",email:"yonas@example.com",role:"Staff",portfolio:"9 assigned",joined:"2026-03-18",status:"Pending"},
    {id:6,name:"Marta Alemu",email:"marta@example.com",role:"Tenant",portfolio:"1 rental",joined:"2026-04-08",status:"Active"}]}},
  computed:{
    filteredClients(){return this.segment==="All"?this.clients:this.clients.filter(c=>c.role===this.segment)},
    cards(){const c=this.clients;return[
      {label:"Total clients",value:c.length,note:"+8.4% sample period"},
      {label:"Owners",value:c.filter(x=>x.role==="Owner").length,note:"Property stakeholders"},
      {label:"Tenants",value:c.filter(x=>x.role==="Tenant").length,note:"Rental accounts"},
      {label:"Active accounts",value:c.filter(x=>x.status==="Active").length,note:"Current status"}]},
    mix(){const total=this.clients.length;return["Owner","Tenant","Manager","Staff"].map(label=>{const value=this.clients.filter(c=>c.role===label).length;return{label,value,pct:Math.round(value/total*100)}})}
  },
  methods:{
    exportCsv(){const rows=[["Name","Email","Role","Portfolio","Joined","Status"],...this.filteredClients.map(c=>[c.name,c.email,c.role,c.portfolio,c.joined,c.status])];const csv=rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="alpha-pms-client-report.csv";a.click();URL.revokeObjectURL(a.href)}
  }
}
</script>