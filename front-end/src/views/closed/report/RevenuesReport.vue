<template>
<div class="min-h-screen bg-slate-50 p-5 text-sm text-slate-800">
  <div class="mx-auto max-w-[1600px] space-y-5">
    <header class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div class="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">Alpha PMS · Executive Report</div>
        
        
      </div>
      <button @click="exportCsv" class="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white"><i class="fas fa-download mr-2"></i>Export Transactions</button>
    </header>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div v-for="c in cards" :key="c.label" class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="text-[10px] font-black uppercase tracking-wider text-slate-400">{{c.label}}</div>
        <div class="mt-2 text-2xl font-black text-slate-900">{{c.value}}</div>
        <div class="mt-1 text-[11px] text-slate-500">{{c.note}}</div>
      </div>
    </div>

    <section class="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="font-black">Monthly Revenue Trend</h2>
        <p class="mt-1 text-xs text-slate-400">Successful operating transactions · subscriptions excluded</p>
        <div class="mt-8 flex h-56 items-end gap-3 border-b border-slate-100 pb-1">
          <div v-for="m in months" :key="m.label" class="flex h-full flex-1 flex-col justify-end gap-2">
            <div class="rounded-t-lg bg-primary/80" :style="{height:(m.total/maxRevenue*100)+'%'}"></div>
            <span class="text-center text-[10px] font-bold text-slate-400">{{m.label}}</span>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="font-black">Revenue Mix</h2>
        <p class="mt-1 text-xs text-slate-400">Operating revenue by transaction type</p>
        <div class="mt-5 space-y-4">
          <div v-for="r in streams" :key="r.name">
            <div class="mb-1 flex justify-between text-xs font-bold"><span>{{r.name}}</span><span>{{r.value.toLocaleString()}} ETB</span></div>
            <div class="h-2 rounded-full bg-slate-100"><div class="h-full rounded-full bg-primary" :style="{width:r.pct+'%'}"></div></div>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="font-black">Transactions</h2>
          <p class="mt-1 text-xs text-slate-400">All transaction records are shown here; only successful non-subscription transactions contribute to revenue.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <select v-model="categoryFilter" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold">
            <option value="all">All types</option>
            <option value="subscription">Subscription</option>
            <option value="rent">Rent</option>
            <option value="sale">Sale</option>
            <option value="workspace">Workspace</option>
            <option value="offplan">Off-plan</option>
          </select>
          <select v-model="statusFilter" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold">
            <option value="all">All statuses</option>
            <option value="success">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
            <tr>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Reference</th>
              <th class="px-4 py-3">Payer / Customer</th>
              <th class="px-4 py-3">Type</th>
              <th class="px-4 py-3">Amount</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Revenue</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="t in filteredTransactions" :key="t.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 text-xs">{{t.date}}</td>
              <td class="px-4 py-3 text-xs font-bold">{{t.reference}}</td>
              <td class="px-4 py-3 text-xs">{{t.payer}}</td>
              <td class="px-4 py-3 text-xs font-semibold capitalize">{{labelFor(t.category)}}</td>
              <td class="px-4 py-3 text-xs font-bold">{{t.amount.toLocaleString()}} ETB</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-1 text-[10px] font-black uppercase" :class="statusClass(t.status)">{{t.status}}</span>
              </td>
              <td class="px-4 py-3 text-xs font-bold">
                <span v-if="isRevenue(t)" class="text-emerald-600">Included</span>
                <span v-else class="text-slate-400">{{t.category === 'subscription' ? 'Excluded' : 'Not recognized'}}</span>
              </td>
            </tr>
            <tr v-if="!filteredTransactions.length">
              <td colspan="7" class="px-4 py-10 text-center text-xs text-slate-400">No transactions match the selected filters.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</div>
</template>

<script>
export default {
  name: "RevenuesReport",
  data() {
    return {
      categoryFilter: "all",
      statusFilter: "all",
      transactions: [
        {id:1,date:"2026-10-01",reference:"PAY-1001",payer:"Horizon Properties",category:"rent",amount:812000,status:"success"},
        {id:2,date:"2026-10-02",reference:"PAY-1002",payer:"SaaS Owner · Addis Estates",category:"subscription",amount:59600,status:"success"},
        {id:3,date:"2026-10-03",reference:"PAY-1003",payer:"Meseret Tadesse",category:"sale",amount:690000,status:"success"},
        {id:4,date:"2026-10-04",reference:"PAY-1004",payer:"Bole Workspace",category:"workspace",amount:174000,status:"success"},
        {id:5,date:"2026-10-05",reference:"PAY-1005",payer:"Off-plan Buyer · Hana K.",category:"offplan",amount:1340000,status:"success"},
        {id:6,date:"2026-10-06",reference:"PAY-1006",payer:"SaaS Owner · Blue Nile Realty",category:"subscription",amount:59600,status:"pending"},
        {id:7,date:"2026-10-07",reference:"PAY-1007",payer:"Kazanchis Apartments",category:"rent",amount:785000,status:"success"},
        {id:8,date:"2026-10-08",reference:"PAY-1008",payer:"Property Buyer · Dawit A.",category:"sale",amount:540000,status:"failed"},
        {id:9,date:"2026-10-09",reference:"PAY-1009",payer:"Off-plan Buyer · Selam T.",category:"offplan",amount:1260000,status:"success"},
        {id:10,date:"2026-10-10",reference:"PAY-1010",payer:"Century Workspace",category:"workspace",amount:166000,status:"success"},
        {id:11,date:"2026-10-11",reference:"PAY-1011",payer:"SaaS Owner · Prime Living",category:"subscription",amount:59600,status:"success"},
        {id:12,date:"2026-10-12",reference:"PAY-1012",payer:"Lideta Apartments",category:"rent",amount:760000,status:"success"},
        {id:13,date:"2026-10-13",reference:"PAY-1013",payer:"Off-plan Buyer · Abel M.",category:"offplan",amount:980000,status:"success"},
        {id:14,date:"2026-10-14",reference:"PAY-1014",payer:"SaaS Owner · Metro Homes",category:"subscription",amount:59600,status:"success"},
        {id:15,date:"2026-10-15",reference:"PAY-1015",payer:"Property Buyer · Rahel G.",category:"sale",amount:810000,status:"success"},
        {id:16,date:"2026-10-16",reference:"PAY-1016",payer:"Bole Workspace",category:"workspace",amount:157000,status:"success"}
      ]
    }
  },
  computed: {
    successfulRevenueTransactions() {
      return this.transactions.filter(t => this.isRevenue(t))
    },
    months() {
      const monthNames = ["May","Jun","Jul","Aug","Sep","Oct"]
      return monthNames.map(label => {
        const monthIndex = ["May","Jun","Jul","Aug","Sep","Oct"].indexOf(label)
        const source = this.transactions.filter(t => this.isRevenue(t) && new Date(t.date).getMonth() === monthIndex + 4)
        const rent = source.filter(t => t.category === "rent").reduce((a,t) => a + t.amount, 0)
        const sales = source.filter(t => t.category === "sale").reduce((a,t) => a + t.amount, 0)
        const workspace = source.filter(t => t.category === "workspace").reduce((a,t) => a + t.amount, 0)
        const offplan = source.filter(t => t.category === "offplan").reduce((a,t) => a + t.amount, 0)
        return {label,rent,sales,workspace,offplan,total:rent+sales+workspace+offplan}
      })
    },
    maxRevenue() {
      return Math.max(...this.months.map(m => m.total), 1)
    },
    streams() {
      const keys = [["Rent","rent"],["Sales","sales"],["Workspace","workspace"],["Off-plan","offplan"]]
      const total = this.successfulRevenueTransactions.reduce((a,t) => a + t.amount, 0)
      return keys.map(([name,key]) => {
        const value = this.successfulRevenueTransactions.filter(t => t.category === key).reduce((a,t) => a + t.amount, 0)
        return {name,key,value,pct: total ? Math.round(value / total * 100) : 0}
      })
    },
    cards() {
      const total = this.successfulRevenueTransactions.reduce((a,t) => a + t.amount, 0)
      const latest = this.months[this.months.length - 1].total
      return [
        {label:"Recognized revenue",value:(total/1000000).toFixed(2)+"M ETB",note:"Successful operating transactions"},
        {label:"Latest month",value:(latest/1000000).toFixed(2)+"M ETB",note:"Subscriptions excluded"},
        {label:"Operating streams",value:4,note:"Rent, sales, workspace, off-plan"},
        {label:"Excluded subscriptions",value:this.transactions.filter(t => t.category === "subscription").length,note:"SaaS owner fees are not revenue"}
      ]
    },
    filteredTransactions() {
      return this.transactions.filter(t =>
        (this.categoryFilter === "all" || t.category === this.categoryFilter) &&
        (this.statusFilter === "all" || t.status === this.statusFilter)
      )
    }
  },
  methods: {
    isRevenue(transaction) {
      return transaction.status === "success" && transaction.category !== "subscription"
    },
    labelFor(category) {
      return {subscription:"Subscription",rent:"Rent",sale:"Sale",workspace:"Workspace",offplan:"Off-plan"}[category] || category
    },
    statusClass(status) {
      return {
        success:"bg-emerald-50 text-emerald-700",
        pending:"bg-amber-50 text-amber-700",
        failed:"bg-rose-50 text-rose-700"
      }[status] || "bg-slate-100 text-slate-500"
    },
    exportCsv() {
      const rows = [
        ["Date","Reference","Payer / Customer","Type","Amount","Status","Revenue Included"],
        ...this.filteredTransactions.map(t => [
          t.date,t.reference,t.payer,this.labelFor(t.category),t.amount,t.status,this.isRevenue(t) ? "Yes" : "No"
        ])
      ]
      const a = document.createElement("a")
      a.href = URL.createObjectURL(new Blob([rows.map(r => r.join(",")).join("\n")], {type:"text/csv"}))
      a.download = "alpha-pms-revenue-transactions.csv"
      a.click()
      URL.revokeObjectURL(a.href)
    }
  }
}
</script>
