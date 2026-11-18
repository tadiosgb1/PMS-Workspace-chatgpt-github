<template>
  <section class="min-h-screen bg-slate-50 p-4 sm:p-6 space-y-6">
    <header class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Developer Report</h1>
        <p class="text-sm text-slate-500 mt-1">Off-plan developer performance and project summary.</p>
      </div>
      <p v-if="report?.generated_at" class="text-xs text-slate-500">Generated {{ formatDate(report.generated_at) }}</p>
    </header>
    <div v-if="loading" class="py-16 text-center text-slate-500">Generating developer report…</div>
    <div v-else-if="error" class="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{{ error }}</div>
    <template v-else>
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="text-xs uppercase tracking-wide font-semibold text-slate-500">Developer</p>
        <p class="text-lg font-bold text-slate-900 mt-1">{{ report?.developer_name || "Developer" }}</p>
        <p class="text-xs text-slate-500 mt-1">ID: {{ report?.developer_id ?? "—" }}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <article v-for="metric in metrics" :key="metric.key" class="min-w-0 min-h-[112px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 break-words">{{ metric.label }}</p>
          <p class="text-2xl font-bold text-slate-900 leading-tight break-words">{{ formatValue(report?.summary?.[metric.key]) }}</p>
        </article>
      </div>
      <section class="rounded-xl border border-slate-200 bg-white overflow-hidden">
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
