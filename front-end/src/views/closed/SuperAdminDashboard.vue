<template>
  <!-- Loading -->
  <div v-if="loading" class="flex items-center justify-center py-24 min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
    <div class="flex flex-col items-center gap-3">
      <div class="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-sm text-slate-500 font-semibold tracking-wide">Loading report…</p>
    </div>
  </div>

  <!-- Error -->
  <div v-else-if="error"
    class="m-6 flex items-start gap-3 bg-rose-50 border border-rose-200 p-4 rounded-none text-sm text-rose-700 font-medium shadow-sm">
    <svg class="w-5 h-5 mt-0.5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    </svg>
    {{ error }}
  </div>

  <!-- Main -->
  <div v-else class="space-y-6 max-w-[1600px] mx-auto p-5 bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 min-h-screen">

    <!-- ── Header ── -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-none px-6 py-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
          </svg>
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900 tracking-tight">Platform Overview</h2>
          <p v-if="report?.generated_at" class="text-xs text-slate-400 mt-0.5 font-medium">
            Updated {{ formatDate(report.generated_at) }}
          </p>
        </div>
      </div>
      <button @click="fetchReport"
        class="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Refresh
      </button>
    </div>

    <!-- ── Core KPI Grid ── -->
    <div class="grid grid-cols-2 lg:grid-cols-6 gap-4">
      <div class="bg-white border border-slate-200 p-2 rounded-none shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group h-16 flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center shrink-0 transition-colors">
          <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.platform_overview?.total_properties || 0 }}</p>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Properties</p>
      </div>
      <div class="bg-white border border-slate-200 p-2 rounded-none shadow-sm hover:shadow-md hover:border-sky-300 transition-all group h-16 flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-sky-50 group-hover:bg-sky-100 flex items-center justify-center shrink-0 transition-colors">
          <svg class="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
        </div>
        <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.platform_overview?.total_zones || 0 }}</p>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Zones</p>
      </div>
      <div class="bg-white border border-slate-200 p-2 rounded-none shadow-sm hover:shadow-md hover:border-purple-300 transition-all group h-16 flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center shrink-0 transition-colors">
          <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.platform_overview?.total_coworking_spaces || 0 }}</p>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Coworking</p>
      </div>
      <div class="bg-white border border-slate-200 p-2 rounded-none shadow-sm hover:shadow-md hover:border-amber-300 transition-all group h-16 flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors">
          <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </div>
        <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.platform_overview?.total_users || 0 }}</p>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Users</p>
      </div>
      <div class="bg-white border border-slate-200 p-2 rounded-none shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group h-16 flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center shrink-0 transition-colors">
          <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
          </svg>
        </div>
        <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.platform_overview?.active_subscriptions || 0 }}</p>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Subscriptions</p>
      </div>
      <div class="bg-white border border-slate-200 p-2 rounded-none shadow-sm hover:shadow-md hover:border-teal-300 transition-all group h-16 flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center shrink-0 transition-colors">
          <svg class="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
          </svg>
        </div>
        <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.platform_overview?.active_rents || 0 }}</p>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Active Rents</p>
      </div>
    </div>

    <!-- ── Charts Row: Users by Role + Revenue Comparison + Rent Activity ── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Users by Role – Donut (replaces list) -->
      <div class="bg-white border border-slate-200 rounded-none p-4 shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <div class="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Users by Role</h3>
          <span class="ml-auto text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            {{ report?.platform_overview?.total_users || 0 }} total
          </span>
        </div>
        <apexchart type="donut" height="280" :options="usersByRoleChartOptions" :series="usersByRoleSeries" />
      </div>

      <!-- Revenue Comparison – Grouped Bar (30d vs All Time) -->
      <div class="bg-white border border-slate-200 rounded-none p-4 shadow-sm lg:col-span-2">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <div class="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Revenue Breakdown (ETB)</h3>
          <div class="ml-auto flex gap-2">
            <span class="text-[9px] font-bold px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full border border-sky-200">30 Days</span>
            <span class="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">All Time</span>
          </div>
        </div>
        <apexchart type="bar" height="280" :options="revenueComparisonOptions" :series="revenueComparisonSeries" />
      </div>
    </div>

    <!-- ── Revenue & Billing Metrics ── -->
    <div class="bg-white border border-slate-200 rounded-none p-4 shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-sm">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-sm font-bold text-slate-900">Revenue &amp; Billing</h3>
        </div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-200">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Active
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200 p-4 rounded-none">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Revenue All Time</p>
          </div>
          <p class="text-2xl font-black text-slate-900 tracking-tight">{{ report?.revenue_billing?.total_revenue_all_time || 0 }}</p>
          <p class="text-[10px] font-bold text-indigo-500 mt-0.5">ETB</p>
        </div>
        <div class="bg-slate-50 border border-slate-200 p-4 rounded-none">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">MRR / ARPU</p>
          </div>
          <p class="text-xl font-bold text-slate-900 tracking-tight">{{ report?.revenue_billing?.mrr || 0 }} / {{ report?.revenue_billing?.arpu || 0 }}</p>
          <p class="text-[10px] font-semibold text-slate-400 mt-0.5">ETB</p>
        </div>
        <div class="border border-slate-200 p-4 rounded-xl" :class="(report?.revenue_billing?.overdue_invoices?.count || 0) > 0 ? 'bg-rose-50' : 'bg-slate-50'">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-3.5 h-3.5" :class="(report?.revenue_billing?.overdue_invoices?.count || 0) > 0 ? 'text-rose-500' : 'text-slate-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Overdue Invoices</p>
          </div>
          <p class="text-2xl font-black tracking-tight" :class="(report?.revenue_billing?.overdue_invoices?.count || 0) > 0 ? 'text-rose-600' : 'text-slate-900'">
            {{ report?.revenue_billing?.overdue_invoices?.count || 0 }}
          </p>
          <p class="text-[10px] font-semibold text-slate-500 mt-0.5">{{ report?.revenue_billing?.overdue_invoices?.amount || 0 }} ETB</p>
        </div>
        <div class="bg-slate-50 border border-slate-200 p-4 rounded-none">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pending Sub. Payments</p>
          </div>
          <p class="text-2xl font-black text-slate-900 tracking-tight">{{ report?.revenue_billing?.pending_subscription_payments || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- ── Center Row: Tenant/Landlord + Coworking + Rent Activity Chart ── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Tenant & Landlord -->
      <div class="bg-white border border-slate-200 rounded-none p-4 shadow-sm space-y-4">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div class="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Tenant &amp; Landlord</h3>
        </div>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-slate-500 font-medium">Owners / Tenants</span>
            <span class="px-2 py-0.5 bg-white border border-slate-200 text-slate-900 rounded-none font-mono font-bold">
              {{ report?.tenant_landlord?.totals?.owners || 0 }} / {{ report?.tenant_landlord?.totals?.tenants || 0 }}
            </span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <span class="text-slate-600 font-medium">New Signups (30d)</span>
            <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg font-mono font-bold">
              +{{ report?.tenant_landlord?.new_signups_last_30_days?.owners || 0 }} / +{{ report?.tenant_landlord?.new_signups_last_30_days?.tenants || 0 }}
            </span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-amber-50 rounded-xl border border-amber-100">
            <span class="text-slate-600 font-medium">Avg Occupancy Rate</span>
            <span class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg font-mono font-bold">{{ report?.tenant_landlord?.avg_occupancy_rate_pct || 0 }}%</span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-purple-50 rounded-xl border border-purple-100">
            <span class="text-slate-600 font-medium">Rented / Total</span>
            <span class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg font-mono font-bold">
              {{ report?.tenant_landlord?.rented_properties || 0 }} / {{ report?.tenant_landlord?.total_properties || 0 }}
            </span>
          </div>
        </div>
        <div class="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div class="bg-indigo-50 border border-indigo-100 p-3 rounded-none">
            <p class="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Active</p>
            <p class="font-extrabold text-indigo-700 text-lg mt-0.5">{{ report?.tenant_landlord?.active_rents || 0 }}</p>
          </div>
          <div class="bg-rose-50 border border-rose-100 p-3 rounded-none">
            <p class="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Terminated</p>
            <p class="font-extrabold text-rose-700 text-lg mt-0.5">{{ report?.tenant_landlord?.terminated_rents || 0 }}</p>
          </div>
          <div class="bg-emerald-50 border border-emerald-100 p-3 rounded-none">
            <p class="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">New (30d)</p>
            <p class="font-extrabold text-emerald-700 text-lg mt-0.5">{{ report?.tenant_landlord?.new_rents_last_30_days || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Coworking -->
      <div class="bg-white border border-slate-200 rounded-none p-4 shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <div class="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Coworking</h3>
        </div>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-slate-500 font-medium">Total Spaces</span>
            <span class="font-bold text-slate-900">{{ report?.coworking?.total_coworking_spaces || 0 }} spaces</span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-slate-500 font-medium">Total Capacity</span>
            <span class="font-bold text-slate-900">{{ report?.coworking?.total_capacity_seats || 0 }} seats</span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-slate-500 font-medium">Active Memberships</span>
            <span class="font-bold text-slate-900">{{ report?.coworking?.active_memberships || 0 }} members</span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-slate-500 font-medium">Rentals All Time</span>
            <span class="font-bold text-slate-900">{{ report?.coworking?.total_rentals_all_time || 0 }} rentals</span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-slate-500 font-medium">Avg Utilisation</span>
            <span class="font-mono font-bold text-slate-900">{{ report?.coworking?.avg_utilisation_pct || 0 }}%</span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-purple-50 rounded-xl border border-purple-200">
            <span class="font-semibold text-purple-700">Total Revenue</span>
            <span class="px-2.5 py-1 bg-purple-600 text-white font-mono font-bold rounded-lg text-[11px]">{{ report?.coworking?.total_revenue || 0 }} ETB</span>
          </div>
        </div>
      </div>

      <!-- Rent Activity Donut -->
      <div class="bg-white border border-slate-200 rounded-none p-4 shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <div class="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
          </div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Rent Activity</h3>
        </div>
        <apexchart type="donut" height="260" :options="rentActivityChartOptions" :series="rentActivitySeries" />
      </div>
    </div>

    <!-- ── Bottom Row: Maintenance + Audit ── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Maintenance – stats + bar chart -->
      <div class="bg-white border border-slate-200 rounded-none p-4 shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <div class="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Maintenance Requests</h3>
        </div>
        <div class="grid grid-cols-4 gap-2 text-center mb-4">
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-none">
            <div class="text-xl font-extrabold text-slate-900">{{ report?.maintenance?.total || 0 }}</div>
            <div class="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Total</div>
          </div>
          <div class="p-3 bg-amber-50 border border-amber-200 rounded-none">
            <div class="text-xl font-extrabold text-amber-700">{{ report?.maintenance?.pending || 0 }}</div>
            <div class="text-[9px] font-bold text-amber-500 uppercase mt-0.5">Pending</div>
          </div>
          <div class="p-3 bg-sky-50 border border-sky-200 rounded-none">
            <div class="text-xl font-extrabold text-sky-700">{{ report?.maintenance?.open || 0 }}</div>
            <div class="text-[9px] font-bold text-sky-500 uppercase mt-0.5">Open</div>
          </div>
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-none">
            <div class="text-xl font-extrabold text-emerald-700">{{ report?.maintenance?.resolved || 0 }}</div>
            <div class="text-[9px] font-bold text-emerald-500 uppercase mt-0.5">Resolved</div>
          </div>
        </div>
        <apexchart type="bar" height="160" :options="maintenanceBarOptions" :series="maintenanceBarSeries" />
      </div>

      <!-- Audit Events -->
      <div class="bg-white border border-slate-200 rounded-none p-4 shadow-sm">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <div class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
          </div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Audit Events</h3>
        </div>
        <div class="space-y-3 text-xs">
          <div class="flex justify-between items-center py-2 px-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <span class="text-slate-600 font-medium">Events Last 24 Hours</span>
            <span class="font-mono text-indigo-700 font-bold px-2.5 py-1 bg-indigo-100 rounded-lg border border-indigo-200">{{ report?.audit?.events_last_24h || 0 }} events</span>
          </div>
          <!-- Audit actions bar chart -->
          <apexchart type="bar" height="140" :options="auditActionsBarOptions" :series="auditActionsBarSeries" />
          <div class="flex flex-wrap gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
            <span class="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded-none font-medium text-[11px] shadow-sm">
              <svg class="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
              Create: <strong class="font-mono text-slate-900 ml-1">{{ report?.audit?.by_action?.create || 0 }}</strong>
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded-none font-medium text-[11px] shadow-sm">
              <svg class="w-3 h-3 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Update: <strong class="font-mono text-slate-900 ml-1">{{ report?.audit?.by_action?.update || 0 }}</strong>
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded-none font-medium text-[11px] shadow-sm">
              <svg class="w-3 h-3 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Delete: <strong class="font-mono text-slate-900 ml-1">{{ report?.audit?.by_action?.delete || 0 }}</strong>
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg font-medium text-[11px] shadow-sm border"
              :class="report?.audit?.not_applicable ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'">
              N/A: <strong class="font-mono ml-1">{{ report?.audit?.not_applicable ? 'True' : 'False' }}</strong>
            </span>
          </div>
          <div>
            <p class="text-[10px] uppercase font-bold tracking-wide text-slate-400 flex items-center gap-1.5 mb-2">
              <svg class="w-3 h-3 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              Top Actors
            </p>
            <div v-for="(actor, idx) in report?.audit?.top_actors" :key="idx"
              class="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 p-2.5 rounded-none flex justify-between items-center font-mono text-[11px] text-slate-900 mb-1.5">
              <span class="text-slate-600 font-medium truncate max-w-[70%]">{{ actor.actor__email || 'None' }} / {{ actor.actor__phone_number || 'None' }}</span>
              <span class="shrink-0 ml-2 px-2.5 py-1 bg-white border border-slate-200 text-slate-900 font-bold rounded-none shadow-sm text-[10px]">{{ actor.events }} events</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div><!-- end v-else -->
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'

const CHART_FONT = 'Inter, ui-sans-serif, system-ui, sans-serif'
const BASE_CHART = { toolbar: { show: false }, zoom: { enabled: false } }

export default {
  name: 'SuperAdminDashboard',
  components: { apexchart: VueApexCharts },
  data() {
    return {
      report: null,
      loading: true,
      error: null
    }
  },
  async created() {
    await this.fetchReport()
  },
  computed: {
    // ── Users by Role Donut ────────────────────────────────────
    usersByRoleSeries() {
      const roles = this.report?.platform_overview?.users_by_role
      if (!roles) return []
      return Object.values(roles).map(v => Number(v) || 0)
    },
    usersByRoleChartOptions() {
      const roles = this.report?.platform_overview?.users_by_role || {}
      const labels = Object.keys(roles).map(r => r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
      return {
        chart: { ...BASE_CHART, type: 'donut', fontFamily: CHART_FONT },
        labels,
        colors: ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#f43f5e', '#8b5cf6', '#14b8a6'],
        legend: {
          position: 'bottom', fontSize: '11px', fontWeight: 600,
          labels: { colors: '#64748b' },
          markers: { width: 10, height: 10, radius: 3 }
        },
        dataLabels: {
          enabled: true, style: { fontSize: '10px', fontWeight: 700 },
          dropShadow: { enabled: false },
          formatter: (val) => `${val.toFixed(0)}%`
        },
        plotOptions: { pie: { donut: {
          size: '62%',
          labels: { show: true,
            total: { show: true, label: 'Users', fontSize: '11px', fontWeight: 700, color: '#64748b',
              formatter: () => (this.report?.platform_overview?.total_users || 0)
            },
            value: { fontSize: '18px', fontWeight: 800, color: '#0f172a' }
          }
        }}},
        stroke: { width: 0 },
        tooltip: { y: { formatter: (v) => `${v} users` } }
      }
    },

    // ── Revenue Comparison Grouped Bar ────────────────────────
    revenueComparisonSeries() {
      const r30  = this.report?.revenue_billing?.revenue_last_30_days || {}
      const rAll = this.report?.revenue_billing?.revenue_all_time     || {}
      return [
        { name: 'Last 30 Days', data: [r30.rent||0, r30.sales||0, r30.subscription||0, r30.workspace||0] },
        { name: 'All Time',     data: [rAll.rent||0, rAll.sales||0, rAll.subscription||0, rAll.workspace||0] }
      ]
    },
    revenueComparisonOptions() {
      return {
        chart: { ...BASE_CHART, type: 'bar', fontFamily: CHART_FONT },
        plotOptions: { bar: { borderRadius: 5, columnWidth: '55%', groupPadding: 0.1 } },
        colors: ['#0ea5e9', '#10b981'],
        dataLabels: { enabled: false },
        xaxis: {
          categories: ['Rent', 'Sales', 'Subscription', 'Workspace'],
          labels: { style: { fontSize: '11px', fontWeight: 600, colors: '#64748b' } },
          axisBorder: { show: false }, axisTicks: { show: false }
        },
        yaxis: { labels: { style: { fontSize: '10px', colors: '#94a3b8' },
          formatter: (v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v
        }},
        legend: {
          position: 'top', horizontalAlign: 'right', fontSize: '11px', fontWeight: 600,
          labels: { colors: '#64748b' }, markers: { width: 10, height: 10, radius: 3 }
        },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        tooltip: { y: { formatter: (v) => `${v.toLocaleString()} ETB` } }
      }
    },

    // ── Rent Activity Donut ────────────────────────────────────
    rentActivitySeries() {
      const t = this.report?.tenant_landlord
      if (!t) return [0, 0, 0]
      return [t.active_rents || 0, t.terminated_rents || 0, t.new_rents_last_30_days || 0]
    },
    rentActivityChartOptions() {
      return {
        chart: { ...BASE_CHART, type: 'donut', fontFamily: CHART_FONT },
        labels: ['Active', 'Terminated', 'New (30d)'],
        colors: ['#6366f1', '#f43f5e', '#10b981'],
        legend: {
          position: 'bottom', fontSize: '11px', fontWeight: 600,
          labels: { colors: '#64748b' }, markers: { width: 10, height: 10, radius: 3 }
        },
        dataLabels: {
          enabled: true, style: { fontSize: '11px', fontWeight: 700 },
          dropShadow: { enabled: false }
        },
        plotOptions: { pie: { donut: {
          size: '65%',
          labels: { show: true,
            total: { show: true, label: 'Total Rents', fontSize: '10px', fontWeight: 700, color: '#64748b',
              formatter: () => {
                const t = this.report?.tenant_landlord
                return t ? (t.active_rents||0) + (t.terminated_rents||0) + (t.new_rents_last_30_days||0) : 0
              }
            },
            value: { fontSize: '18px', fontWeight: 800, color: '#0f172a' }
          }
        }}},
        stroke: { width: 0 },
        tooltip: { y: { formatter: (v) => `${v} rents` } }
      }
    },

    // ── Maintenance Bar ────────────────────────────────────────
    maintenanceBarSeries() {
      const m = this.report?.maintenance
      if (!m) return [{ data: [0, 0, 0] }]
      return [{ name: 'Requests', data: [m.pending || 0, m.open || 0, m.resolved || 0] }]
    },
    maintenanceBarOptions() {
      return {
        chart: { ...BASE_CHART, type: 'bar', fontFamily: CHART_FONT },
        plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: '55%', distributed: true } },
        colors: ['#f59e0b', '#0ea5e9', '#10b981'],
        dataLabels: { enabled: true, style: { fontSize: '10px', fontWeight: 700 },
          formatter: (v) => `${v}`
        },
        xaxis: {
          categories: ['Pending', 'Open', 'Resolved'],
          labels: { style: { fontSize: '10px', colors: '#94a3b8' } },
          axisBorder: { show: false }, axisTicks: { show: false }
        },
        yaxis: { labels: { style: { fontSize: '11px', fontWeight: 600, colors: '#64748b' } } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
        legend: { show: false },
        tooltip: { y: { formatter: (v) => `${v} requests` } }
      }
    },

    // ── Audit Actions Bar ──────────────────────────────────────
    auditActionsBarSeries() {
      const a = this.report?.audit?.by_action || {}
      return [{ name: 'Events', data: [a.create||0, a.update||0, a.delete||0] }]
    },
    auditActionsBarOptions() {
      return {
        chart: { ...BASE_CHART, type: 'bar', fontFamily: CHART_FONT },
        plotOptions: { bar: { borderRadius: 5, columnWidth: '45%', distributed: true } },
        colors: ['#10b981', '#0ea5e9', '#f43f5e'],
        dataLabels: { enabled: true, style: { fontSize: '10px', fontWeight: 700 },
          dropShadow: { enabled: false }
        },
        xaxis: {
          categories: ['Create', 'Update', 'Delete'],
          labels: { style: { fontSize: '11px', fontWeight: 600, colors: '#64748b' } },
          axisBorder: { show: false }, axisTicks: { show: false }
        },
        yaxis: { labels: { style: { fontSize: '10px', colors: '#94a3b8' } } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        legend: { show: false },
        tooltip: { y: { formatter: (v) => `${v} events` } }
      }
    }
  },
  methods: {
    async fetchReport() {
      try {
        this.loading = true
        this.error = null
        this.report = await this.$apiGet("/platform_report")
      } catch (err) {
        console.error(err)
        this.error = "Failed to load dashboard report metrics."
      } finally {
        this.loading = false
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true
      })
    }
  }
}
</script>
