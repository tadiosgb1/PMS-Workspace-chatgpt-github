<template>
  <section class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-4 sm:p-6 space-y-6">
    <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
      <div class="flex items-center gap-3"><span class="grid h-11 w-11 place-items-center bg-emerald-100 text-emerald-700"><i class="fas fa-layer-group text-lg"></i></span><div><p class="text-[10px] font-black uppercase tracking-[.2em] text-emerald-700">Platform analytics</p><h1 class="text-2xl font-black text-slate-900">Subscription Report</h1><p class="text-sm text-slate-500 mt-1">Subscribers and revenue by plan.</p></div></div>
      <button @click="exportCsv" class="inline-flex items-center gap-2 bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700"><i class="fas fa-download"></i> Export CSV</button>
    </header>
    <div v-if="loading" class="py-16 text-center text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading subscription report…</div>
    <div v-else-if="error" class="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{{ error }}</div>
    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><article v-for="item in highlights" :key="item.label" class="border-l-4 border-y border-r border-slate-200 bg-white p-4 shadow-sm" :class="item.accent"><div class="flex items-center justify-between"><p class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ item.label }}</p><span class="grid h-9 w-9 place-items-center" :class="item.iconBg"><i :class="[item.icon,item.iconColor]"></i></span></div><p class="mt-4 text-2xl font-black text-slate-900 tabular-nums">{{ item.value }}</p></article></div>
      <section class="border border-slate-200 bg-white"><div class="border-b border-slate-200 p-4"><h2 class="font-extrabold text-slate-900"><i class="fas fa-chart-column text-emerald-600 mr-2"></i>Plan performance</h2><p class="mt-1 text-xs text-slate-500">Plan list is generated dynamically from the API response.</p></div>
        <div v-if="!rows.length" class="p-8 text-center text-sm text-slate-500">No subscription plan data is available.</div>
        <div v-else class="overflow-x-auto"><table class="w-full min-w-[520px] text-left text-sm"><thead class="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500"><tr><th class="px-4 py-3">Plan</th><th class="px-4 py-3 text-right">Subscribers</th><th class="px-4 py-3 text-right">Revenue</th><th class="px-4 py-3">Share</th></tr></thead><tbody class="divide-y divide-slate-100"><tr v-for="row in rows" :key="row.plan" class="hover:bg-emerald-50/40"><td class="px-4 py-4 font-bold text-slate-800"><i class="fas fa-cube text-emerald-600 mr-2"></i>{{ row.plan }}</td><td class="px-4 py-4 text-right font-semibold tabular-nums">{{ format(row.users) }}</td><td class="px-4 py-4 text-right font-bold text-emerald-700 tabular-nums">{{ format(row.revenue) }} ETB</td><td class="px-4 py-4"><div class="flex items-center gap-3"><div class="h-2 min-w-20 flex-1 bg-slate-100"><div class="h-2 bg-emerald-500" :style="{width: row.share + '%'}"></div></div><span class="w-10 text-right text-xs font-bold text-slate-500">{{ row.share }}%</span></div></td></tr></tbody></table></div>
      </section>
    </template>
  </section>
</template>
<script>
export default {
  name: "SubscriptionReport",
  data() { return { report: null, loading: true, error: "" }; },
  computed: {
    rows() {
      return (this.report?.plans || []).map((plan, index) => ({ plan: String(plan), users: Number(this.report?.users?.[index]) || 0, revenue: Number(this.report?.revenue?.[index]) || 0 }))
        .map(row => ({ ...row, share: this.totalUsers ? Math.round(row.users / this.totalUsers * 100) : 0 }));
    },
    totalUsers() { return (this.report?.users || []).reduce((sum, value) => sum + (Number(value) || 0), 0); },
    totalRevenue() { return (this.report?.revenue || []).reduce((sum, value) => sum + (Number(value) || 0), 0); },
    highlights() { return [
      { label: "Total subscribers", value: this.format(this.totalUsers), icon: "fas fa-users", iconBg: "bg-sky-50", iconColor: "text-sky-600", accent: "border-l-sky-500" },
      { label: "Plans available", value: this.format(this.rows.length), icon: "fas fa-layer-group", iconBg: "bg-violet-50", iconColor: "text-violet-600", accent: "border-l-violet-500" },
      { label: "Total plan revenue", value: this.format(this.totalRevenue) + " ETB", icon: "fas fa-coins", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", accent: "border-l-emerald-500" }
    ]; }
  },
  async created() {
    try { this.report = await this.$apiGet("/get_subscription_report"); }
    catch (error) { console.error(error); this.error = "Unable to load subscription report."; }
    finally { this.loading = false; }
  },
  methods: {
    format(value) { return Number(value || 0).toLocaleString(); },
    exportCsv() {
      const rows = [["Plan", "Subscribers", "Revenue"], ...this.rows.map(row => [row.plan, row.users, row.revenue])];
      const csv = rows.map(row => row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(",")).join("\n");
      const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      link.download = "subscription-report.csv"; link.click(); URL.revokeObjectURL(link.href);
    }
  }
};
</script>