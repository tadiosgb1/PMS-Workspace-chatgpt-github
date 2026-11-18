<template>
  <section class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-4 sm:p-6 space-y-6">
    <header>
      <div class="flex items-center gap-3"><span class="grid h-11 w-11 place-items-center bg-indigo-100 text-indigo-700"><i class="fas fa-building text-lg"></i></span><div><p class="text-[10px] font-black uppercase tracking-[.2em] text-indigo-600">Off-plan portfolio</p><h1 class="text-2xl font-black text-slate-900">Developer Dashboard</h1></div></div>
      <p class="text-sm text-slate-500 mt-1">Overview of your off-plan projects, applications and collections.</p>
    </header>
    <div v-if="loading" class="py-16 text-center text-slate-500">Loading developer dashboard…</div>
    <div v-else-if="error" class="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{{ error }}</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <article v-for="metric in metrics" :key="metric.key" class="min-w-0 min-h-[142px] border-l-4 border-y border-r border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between gap-4">
        <div class="flex items-center justify-between gap-2"><p class="text-xs font-bold uppercase tracking-wide text-slate-500 break-words">{{ metric.label }}</p><span class="grid h-10 w-10 shrink-0 place-items-center bg-indigo-50 text-indigo-600"><i class="fas fa-chart-column"></i></span></div>
        <p class="text-2xl sm:text-3xl font-black text-slate-900 leading-tight break-words">{{ formatValue(report?.[metric.key]) }}</p>
      </article>
    </div>
  </section>
</template>
<script>
export default {
  name: "DeveloperDashboard",
  data() { return { report: null, loading: true, error: "" }; },
  computed: {
    metrics() {
      return [
        { key: "total_projects", label: "Total Projects" },
        { key: "total_applications", label: "Total Applications" },
        { key: "pending_applications", label: "Pending Applications" },
        { key: "approved_applications", label: "Approved Applications" },
        { key: "rejected_applications", label: "Rejected Applications" },
        { key: "agreed_revenue", label: "Agreed Revenue" },
        { key: "payments_received", label: "Payments Received" },
        { key: "outstanding_balance", label: "Outstanding Balance" },
        { key: "overdue_installments", label: "Overdue Installments" }
      ];
    }
  },
  async created() {
    try {
      this.report = await this.$apiGet("/offplan_developer_dashboard");
    } catch (error) {
      console.error(error);
      this.error = "Unable to load the developer dashboard.";
    } finally {
      this.loading = false;
    }
  },
  methods: {
    formatValue(value) {
      if (value === null || value === undefined || value === "") return "0";
      return typeof value === "number" ? value.toLocaleString() : value;
    }
  }
};
</script>
