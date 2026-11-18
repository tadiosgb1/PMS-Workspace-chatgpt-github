<template>
  <section class="min-h-screen bg-slate-50/70 p-3 sm:p-5 text-xs text-slate-700">
    <div class="mx-auto max-w-[1500px] space-y-4">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[9px] font-bold uppercase tracking-[0.16em] text-primary">Alpha PMS · Executive Report</p>
          <h1 class="mt-1 text-xl font-bold tracking-tight text-slate-900">Revenue Report</h1>
          <p class="mt-1 text-[10px] text-slate-400">Monthly revenue across rent, sales, subscriptions and workspace.</p>
        </div>
        <button @click="exportCsv" :disabled="!monthlyRows.length" class="rounded-md bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50">
          <i class="fas fa-download mr-2"></i>Export Revenue CSV
        </button>
      </header>

      <div v-if="loading" class="rounded-xl border border-slate-200 bg-white py-16 text-center text-slate-500">
        <i class="fas fa-spinner fa-spin mr-2"></i>Loading revenue report…
      </div>
      <div v-else-if="error" class="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{{ error }}</div>
      <template v-else>
        <div class="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
          <article v-for="card in cards" :key="card.label" class="relative overflow-hidden rounded-lg border border-slate-200/80 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400">{{ card.label }}</span>
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-500"><i :class="['fas', card.icon, 'text-[11px]']"></i></span>
            </div>
            <p class="mt-1 text-lg font-bold tracking-tight text-slate-900 tabular-nums sm:text-xl">{{ formatAmount(card.value) }} <span class="text-[10px] font-medium text-slate-400">ETB</span></p>
            <div class="mt-1 flex items-center justify-between gap-2">
              <span class="text-[10px] text-slate-400">{{ card.note }}</span>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500">Total</span>
            </div>
            <span class="absolute bottom-0 left-0 h-[2px] w-full bg-primary/60"></span>
          </article>
        </div>

        <section class="grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
          <div class="rounded-lg border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <h2 class="text-xs font-bold text-slate-800">Monthly Revenue Trend</h2>
            <p class="mt-0.5 text-[10px] text-slate-400">Total revenue by month across all reported categories</p>
            <div v-if="monthlyRows.length" class="mt-5 flex h-44 items-end gap-2 border-b border-slate-100 pb-1 sm:gap-3">
              <div v-for="month in monthlyRows" :key="month.month" class="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
                <div class="w-full rounded-t-sm bg-primary/80 transition-all" :style="{ height: barHeight(month.total) }" :title="formatAmount(month.total) + ' ETB'"></div>
                <span class="truncate text-center text-[9px] font-semibold text-slate-400">{{ month.label }}</span>
              </div>
            </div>
            <p v-else class="py-12 text-center text-xs text-slate-400">No monthly revenue data returned.</p>
          </div>

          <div class="rounded-lg border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-xs font-bold text-slate-800">Revenue Mix</h2>
              <span class="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold text-primary">BY CATEGORY</span>
            </div>
            <p class="mt-0.5 text-[10px] text-slate-400">Share of total reported revenue</p>
            <div class="mt-4 space-y-3.5">
              <div v-for="stream in streams" :key="stream.key">
                <div class="mb-1 flex items-center justify-between gap-2">
                  <span class="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{{ stream.label }}</span>
                  <span class="text-[10px] font-semibold tabular-nums text-slate-700">{{ formatAmount(stream.value) }} <span class="font-normal text-slate-400">ETB</span></span>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div class="h-full rounded-full bg-primary" :style="{ width: stream.share + '%' }"></div>
                </div>
                <p class="mt-0.5 text-right text-[9px] text-slate-400">{{ stream.share }}%</p>
              </div>
            </div>
          </div>
        </section>

        <section class="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div>
              <h2 class="text-xs font-bold text-slate-800">Monthly Revenue Breakdown</h2>
              <p class="mt-0.5 text-[10px] text-slate-400">Monthly totals by revenue stream</p>
            </div>
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold text-slate-500">{{ monthlyRows.length }} {{ monthlyRows.length === 1 ? 'MONTH' : 'MONTHS' }}</span>
          </div>
          <div v-if="!monthlyRows.length" class="p-8 text-center text-xs text-slate-400">No revenue records are available.</div>
          <div v-else class="overflow-x-auto">
            <table class="w-full min-w-[650px] text-left text-[11px]">
              <thead class="bg-slate-50/80 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th class="px-3 py-2">Month</th>
                  <th class="px-3 py-2 text-right">Rent</th>
                  <th class="px-3 py-2 text-right">Sale</th>
                  <th class="px-3 py-2 text-right">Subscription</th>
                  <th class="px-3 py-2 text-right">Workspace</th>
                  <th class="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="month in monthlyRows" :key="month.month" class="hover:bg-slate-50">
                  <td class="px-3 py-2 font-semibold text-slate-700">{{ month.label }}</td>
                  <td class="px-3 py-2 text-right tabular-nums text-slate-500">{{ formatAmount(month.rent) }}</td>
                  <td class="px-3 py-2 text-right tabular-nums text-slate-500">{{ formatAmount(month.sale) }}</td>
                  <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(month.subscription) }}</td>
                  <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(month.workspace) }}</td>
                  <td class="px-3 py-2 text-right font-bold tabular-nums text-slate-800">{{ formatAmount(month.total) }} ETB</td>
                </tr>
              </tbody>
              <tfoot class="border-t-2 border-slate-200 bg-slate-50">
                <tr>
                  <td class="px-3 py-2 font-bold">Total</td>
                  <td class="px-3 py-2 text-right font-semibold">{{ formatAmount(totals.rent) }}</td>
                  <td class="px-3 py-2 text-right font-semibold">{{ formatAmount(totals.sale) }}</td>
                  <td class="px-4 py-3 text-right font-bold">{{ formatAmount(totals.subscription) }}</td>
                  <td class="px-4 py-3 text-right font-bold">{{ formatAmount(totals.workspace) }}</td>
                  <td class="px-3 py-2 text-right font-bold">{{ formatAmount(totals.all) }} ETB</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </template>
    </div>
  </section>
</template>

<script>
export default {
  name: "RevenuesReport",
  data() {
    return {
      report: null,
      loading: true,
      error: ""
    };
  },
  computed: {
    monthlyRows() {
      const report = this.report || {};
      const months = Array.isArray(report.months) ? report.months : [];
      const amountAt = (key, index) => {
        const values = Array.isArray(report[key]) ? report[key] : [];
        const value = Number(values[index]);
        return Number.isFinite(value) ? value : 0;
      };

      return months.map((month, index) => {
        const rent = amountAt("rent", index);
        const sale = amountAt("sale", index);
        const subscription = amountAt("subscription", index);
        const workspace = amountAt("workspace", index);
        return {
          month: String(month),
          label: this.formatMonth(month),
          rent,
          sale,
          subscription,
          workspace,
          total: rent + sale + subscription + workspace
        };
      });
    },
    totals() {
      return this.monthlyRows.reduce((sum, month) => ({
        rent: sum.rent + month.rent,
        sale: sum.sale + month.sale,
        subscription: sum.subscription + month.subscription,
        workspace: sum.workspace + month.workspace,
        all: sum.all + month.total
      }), { rent: 0, sale: 0, subscription: 0, workspace: 0, all: 0 });
    },
    cards() {
      return [
        { label: "Total Revenue", value: this.totals.all, note: "All revenue streams", icon: "fa-wallet" },
        { label: "Sales Revenue", value: this.totals.sale, note: "Property sales", icon: "fa-house" },
        { label: "Subscription Revenue", value: this.totals.subscription, note: "Subscription payments", icon: "fa-repeat" },
        { label: "Rent & Workspace", value: this.totals.rent + this.totals.workspace, note: "Rental and workspace", icon: "fa-building" }
      ];
    },
    streams() {
      const categories = [
        { key: "rent", label: "Rent", value: this.totals.rent },
        { key: "sale", label: "Sale", value: this.totals.sale },
        { key: "subscription", label: "Subscription", value: this.totals.subscription },
        { key: "workspace", label: "Workspace", value: this.totals.workspace }
      ];
      return categories.map(item => ({
        ...item,
        share: this.totals.all ? Math.round(item.value / this.totals.all * 100) : 0
      }));
    },
    maxRevenue() {
      return Math.max(1, ...this.monthlyRows.map(month => month.total));
    }
  },
  async created() {
    try {
      this.report = await this.$apiGet("/get_revenue_report");
    } catch (error) {
      console.error("Failed to load revenue report:", error);
      this.error = "Unable to load the revenue report. Please try again later.";
    } finally {
      this.loading = false;
    }
  },
  methods: {
    formatAmount(value) {
      return Number(value || 0).toLocaleString();
    },
    formatMonth(value) {
      const match = /^(\d{4})-(\d{2})$/.exec(String(value));
      if (!match) return String(value);
      const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
      return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
    },
    barHeight(value) {
      return (Number(value || 0) / this.maxRevenue * 100) + "%";
    },
    exportCsv() {
      const rows = [
        ["Month", "Rent", "Sale", "Subscription", "Workspace", "Total"],
        ...this.monthlyRows.map(month => [
          month.month, month.rent, month.sale, month.subscription, month.workspace, month.total
        ]),
        ["Total", this.totals.rent, this.totals.sale, this.totals.subscription, this.totals.workspace, this.totals.all]
      ];
      const csv = rows.map(row => row.map(value =>
        '"' + String(value).replaceAll('"', '""') + '"'
      ).join(",")).join("\n");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
      link.download = "alpha-pms-revenue-report.csv";
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }
};
</script>
