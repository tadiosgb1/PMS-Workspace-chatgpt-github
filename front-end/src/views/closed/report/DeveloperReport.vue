<template>
  <section class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/50 p-4 sm:p-6 space-y-6">
    <header class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
      <div>
        <div class="flex items-center gap-3"><span class="grid h-11 w-11 place-items-center bg-violet-100 text-violet-700"><i class="fas fa-file-lines text-lg"></i></span><div><p class="text-[10px] font-black uppercase tracking-[.2em] text-violet-600">Off-plan portfolio</p><h1 class="text-2xl font-bold text-slate-900">Developer Report</h1></div></div>
        <p class="text-sm text-slate-500 mt-1">Off-plan developer performance and project summary.</p>
      </div>
      <p v-if="report?.generated_at" class="text-xs text-slate-500">Generated {{ formatDate(report.generated_at) }}</p>
    </header>
    <div v-if="loading" class="py-16 text-center text-slate-500">Generating developer report…</div>
    <div v-else-if="error" class="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{{ error }}</div>
    <template v-else>
      <div class="flex items-center gap-3 border-y border-violet-200 bg-violet-50/70 px-4 py-3"><span class="grid h-10 w-10 place-items-center bg-violet-100 text-violet-700"><i class="fas fa-user-tie text-lg"></i></span><div><p class="text-[10px] font-black uppercase tracking-wider text-violet-600">Prepared for</p><p class="text-base font-extrabold text-slate-900">{{ report?.developer_name || "Developer" }}</p></div><span class="ml-auto border border-violet-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700">Performance summary</span></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <article v-for="metric in metrics" :key="metric.key" class="min-w-0 min-h-[104px] border-t-2 border-x border-b border-slate-200 bg-white p-3 shadow-sm flex flex-col justify-between gap-2" :class="metric.accent">
          <div class="flex items-start justify-between gap-2"><p class="text-xs font-bold uppercase tracking-wide text-slate-500 break-words">{{ metric.label }}</p><span class="grid h-8 w-8 shrink-0 place-items-center" :class="metric.iconClass"><i :class="metric.icon"></i></span></div>
          <p class="text-2xl font-black text-slate-900 leading-tight break-words">{{ formatValue(report?.summary?.[metric.key]) }}</p>
        </article>
      </div>
      <section class="border border-slate-200 bg-white overflow-hidden">
        <div class="p-4 border-b border-slate-200"><h2 class="font-bold text-slate-900">Projects</h2></div>
        <div v-if="!report?.projects?.length" class="p-6 text-sm text-slate-500">No project details are available in this report.</div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-sm text-left">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th v-for="heading in projectHeadings" :key="heading" class="px-4 py-3 font-semibold">{{ heading }}</th></tr></thead>
            <tbody class="divide-y divide-slate-100"><tr v-for="(project, index) in report.projects" :key="project.id ?? index">
              <td v-for="(heading, colIndex) in projectHeadings" :key="heading" class="px-4 py-3 text-slate-700">{{ project[projectFields[colIndex]] ?? "—" }}</td>
            </tr></tbody>
          </table>
        </div>
      </section>
    </template>
  </section>
</template>
<script>
export default {
  name: "DeveloperReport",
  data() {
    return { report: null, loading: true, error: "", projectFields: ["name", "status", "total_applications", "agreed_revenue", "payments_received"], projectHeadings: ["Project", "Status", "Applications", "Agreed Revenue", "Payments Received"] };
  },
  computed: {
    metrics() { return [
        { key: "total_projects", label: "Total Projects", icon: "fas fa-building", iconClass: "bg-indigo-50 text-indigo-600", accent: "border-t-indigo-500" },
        { key: "total_applications", label: "Total Applications", icon: "fas fa-file-signature", iconClass: "bg-sky-50 text-sky-600", accent: "border-t-sky-500" },
        { key: "pending_applications", label: "Pending Applications", icon: "fas fa-hourglass-half", iconClass: "bg-amber-50 text-amber-600", accent: "border-t-amber-500" },
        { key: "approved_applications", label: "Approved Applications", icon: "fas fa-circle-check", iconClass: "bg-emerald-50 text-emerald-600", accent: "border-t-emerald-500" },
        { key: "rejected_applications", label: "Rejected Applications", icon: "fas fa-circle-xmark", iconClass: "bg-rose-50 text-rose-600", accent: "border-t-rose-500" },
        { key: "agreed_revenue", label: "Agreed Revenue", icon: "fas fa-handshake", iconClass: "bg-violet-50 text-violet-600", accent: "border-t-violet-500" },
        { key: "payments_received", label: "Payments Received", icon: "fas fa-money-bill-transfer", iconClass: "bg-teal-50 text-teal-600", accent: "border-t-teal-500" },
        { key: "outstanding_balance", label: "Outstanding Balance", icon: "fas fa-wallet", iconClass: "bg-orange-50 text-orange-600", accent: "border-t-orange-500" },
        { key: "overdue_installments", label: "Overdue Installments", icon: "fas fa-calendar-days", iconClass: "bg-red-50 text-red-600", accent: "border-t-red-500" }
      ];
    }
  },
  async created() {
    try {
      this.report = await this.$apiGet("/offplan_developer_report");
    } catch (error) {
      console.error(error);
      this.error = "Unable to load the developer report.";
    } finally {
      this.loading = false;
    }
  },
  methods: {
    formatValue(value) {
      if (value === null || value === undefined || value === "") return "0";
      return typeof value === "number" ? value.toLocaleString() : value;
    },
    formatDate(value) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
    }
  }
};
</script>
