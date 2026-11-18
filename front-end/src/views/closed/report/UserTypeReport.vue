<template>
  <section class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/50 p-4 sm:p-6 space-y-6">
    <header class="flex items-center gap-3 border-b border-slate-200 pb-5"><span class="grid h-11 w-11 place-items-center bg-sky-100 text-sky-700"><i class="fas fa-users-gear text-lg"></i></span><div><p class="text-[10px] font-black uppercase tracking-[.2em] text-sky-700">Platform analytics</p><h1 class="text-2xl font-black text-slate-900">User Type Report</h1><p class="text-sm text-slate-500 mt-1">Account distribution across platform groups.</p></div></header>
    <div v-if="loading" class="py-16 text-center text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading user report…</div>
    <div v-else-if="error" class="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{{ error }}</div>
    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="border-l-4 border-l-sky-500 border-y border-r border-slate-200 bg-white p-4"><p class="text-xs font-bold uppercase text-slate-500">Total users</p><p class="mt-3 text-3xl font-black text-slate-900">{{ totalUsers.toLocaleString() }}</p></div>
        <div class="border-l-4 border-l-violet-500 border-y border-r border-slate-200 bg-white p-4"><p class="text-xs font-bold uppercase text-slate-500">User groups</p><p class="mt-3 text-3xl font-black text-slate-900">{{ rows.length.toLocaleString() }}</p></div>
        <div class="border-l-4 border-l-emerald-500 border-y border-r border-slate-200 bg-white p-4"><p class="text-xs font-bold uppercase text-slate-500">Largest group</p><p class="mt-3 text-xl font-black text-slate-900 break-words">{{ largestGroup }}</p></div>
      </div>
      <section class="border border-slate-200 bg-white"><div class="border-b border-slate-200 p-4"><h2 class="font-extrabold text-slate-900"><i class="fas fa-chart-bar text-sky-600 mr-2"></i>Users by group</h2></div>
        <div v-if="!rows.length" class="p-8 text-center text-sm text-slate-500">No user group data is available.</div>
        <div v-else class="divide-y divide-slate-100"><div v-for="row in rows" :key="row.group" class="grid grid-cols-[minmax(90px,150px)_1fr_64px] items-center gap-3 p-4"><span class="text-sm font-bold capitalize text-slate-700 break-words">{{ row.group }}</span><div class="h-3 bg-slate-100"><div class="h-3 bg-sky-500" :style="{width: row.share + '%'}"></div></div><span class="text-right text-sm font-black tabular-nums text-slate-900">{{ row.count.toLocaleString() }}</span></div></div>
      </section>
    </template>
  </section>
</template>
<script>
export default {
  name: "UserTypeReport",
  data() { return { report: null, loading: true, error: "" }; },
  computed: {
    rows() {
      return (this.report?.groups || []).map((group, index) => {
        const count = Number(this.report?.counts?.[index]) || 0;
        return { group, count, share: this.totalUsers ? count / this.totalUsers * 100 : 0 };
      });
    },
    totalUsers() { return this.rows.reduce((sum, row) => sum + row.count, 0); },
    largestGroup() { return [...this.rows].sort((a, b) => b.count - a.count)[0]?.group || "—"; }
  },
  async created() {
    try { this.report = await this.$apiGet("/get_user_type_report"); }
    catch (error) { console.error(error); this.error = "Unable to load user type report."; }
    finally { this.loading = false; }
  }
};
</script>