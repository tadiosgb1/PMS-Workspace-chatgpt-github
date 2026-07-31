<template>
  <!-- Loading State -->
  <div v-if="loading" class="flex items-center justify-center py-24 min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
    <div class="flex flex-col items-center gap-3">
      <div class="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-sm text-slate-500 font-semibold tracking-wide">Loading portfolio…</p>
    </div>
  </div>

  <!-- Error State -->
  <div v-else-if="error"
    class="m-6 flex items-start gap-3 bg-rose-50 border border-rose-200 p-4 rounded-2xl text-sm text-rose-700 font-medium shadow-sm">
    <svg class="w-5 h-5 mt-0.5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    </svg>
    {{ error }}
  </div>

  <!-- Main Dashboard -->
  <div v-else class="space-y-6 max-w-[1600px] mx-auto p-5 bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 min-h-screen">

    <!-- ── Header ── -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900 tracking-tight">{{ report?.owner_name }}</h2>
          <p v-if="report?.generated_at" class="text-xs text-slate-400 mt-0.5 font-medium">
            Updated {{ formatDate(report.generated_at) }}
          </p>
        </div>
      </div>
      <button @click="fetchReport"
        class="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Refresh
      </button>
    </div>

    <!-- ── Portfolio Summary Cards ── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
            <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wide">Portfolio</span>
        </div>
        <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.portfolio_summary?.total_properties || 0 }}</p>
        <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Total Properties</p>
      </div>

      <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
            <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">{{ report?.portfolio_summary?.occupied_units || 0 }} occupied</span>
        </div>
        <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.portfolio_summary?.occupancy_rate_pct || 0 }}<span class="text-lg text-slate-500">%</span></p>
        <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Occupancy Rate</p>
      </div>

      <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-300 transition-all group">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
            <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
          </div>
          <span class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wide">Status</span>
        </div>
        <div class="flex flex-col gap-1.5 mt-1">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-500 font-medium">For Sale</span>
            <span class="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">{{ report?.portfolio_summary?.for_sale || 0 }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-500 font-medium">Maintenance</span>
            <span class="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg">{{ report?.portfolio_summary?.under_maintenance || 0 }}</span>
          </div>
        </div>
        <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-2">Allocations</p>
      </div>

      <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-300 transition-all group">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded-xl bg-sky-50 group-hover:bg-sky-100 flex items-center justify-center transition-colors">
            <svg class="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span class="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full uppercase tracking-wide">ETB</span>
        </div>
        <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.portfolio_summary?.avg_rent_per_unit || 0 }}</p>
        <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Avg Rent / Unit</p>
      </div>
    </div>

    <!-- ── Charts Row 1: Property Status + Financial Overview ── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Property Status Donut -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-4">
          <div class="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
            </svg>
          </div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Property Status Breakdown</h3>
        </div>
        <apexchart type="donut" height="260" :options="propertyStatusChartOptions" :series="propertyStatusSeries" />
      </div>

      <!-- Financial Overview Bar -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-4">
          <div class="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Financial Overview (ETB)</h3>
          <span class="ml-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Current Cycle
          </span>
        </div>
        <apexchart type="bar" height="260" :options="financialBarOptions" :series="financialBarSeries" />
      </div>
    </div>

    <!-- ── Financial Insights Panel ── -->
    <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-sm font-bold text-slate-900">Financial Insights</h3>
        </div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-200">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Current Cycle
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <div class="bg-rose-50 border border-rose-100 p-4 rounded-xl">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-[11px] font-bold text-rose-700 uppercase tracking-wide">Outstanding Rent</p>
          </div>
          <p class="text-2xl font-black text-rose-700 tracking-tight">{{ report?.financials?.outstanding_rent || 0 }}</p>
          <p class="text-[10px] font-bold text-rose-400 mt-0.5">ETB</p>
        </div>
        <div class="bg-slate-50 border border-slate-200 p-4 rounded-xl">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            <p class="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Collected This Month</p>
          </div>
          <p class="text-2xl font-black text-slate-900 tracking-tight">{{ report?.financials?.collected_this_month || 0 }}</p>
          <p class="text-[10px] font-bold text-slate-400 mt-0.5">ETB</p>
        </div>
        <div class="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <p class="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">Net Portfolio Income</p>
          </div>
          <p class="text-2xl font-black text-indigo-700 tracking-tight">{{ report?.financials?.net_income || 0 }}</p>
          <p class="text-[10px] font-bold text-indigo-400 mt-0.5">ETB</p>
        </div>
        <div class="bg-amber-50 border border-amber-100 p-4 rounded-xl">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-[11px] font-bold text-amber-700 uppercase tracking-wide">Late Payments</p>
          </div>
          <p class="text-2xl font-black text-slate-900 tracking-tight">{{ report?.financials?.late_payments?.count || 0 }}</p>
          <p class="text-[10px] font-bold text-amber-600 mt-0.5">{{ report?.financials?.late_payments?.amount || 0 }} ETB</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="flex justify-between items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div class="flex items-center gap-2">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
            </svg>
            <span class="font-semibold text-slate-600">PMS Fees Deducted</span>
          </div>
          <span class="font-mono font-extrabold text-slate-900">{{ report?.financials?.pms_fees_deducted || 0 }} ETB</span>
        </div>
        <div class="flex justify-between items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div class="flex items-center gap-2">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            <span class="font-semibold text-slate-600">Pending Escrow Payments</span>
          </div>
          <span class="font-mono font-extrabold text-slate-900">{{ report?.financials?.pending_payments || 0 }} ETB</span>
        </div>
      </div>
    </div>

    <!-- ── Center Row ── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Tenant Allocations & Lease Pipeline -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Tenant Allocations</h3>
          </div>
          <span class="inline-flex items-center px-2.5 py-1 bg-sky-50 text-sky-700 text-[10px] font-bold rounded-full border border-sky-200">
            {{ report?.tenant_metrics?.active_tenants || 0 }} Active
          </span>
        </div>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between items-center py-2 px-3 bg-rose-50 rounded-lg border border-rose-100">
            <span class="text-slate-600 font-medium">Expirations (30 days)</span>
            <span class="px-2 py-0.5 font-bold text-rose-700 bg-rose-100 border border-rose-200 rounded-full font-mono">{{ report?.tenant_metrics?.lease_expirations?.next_30_days || 0 }}</span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-amber-50 rounded-lg border border-amber-100">
            <span class="text-slate-600 font-medium">Expirations (60 days)</span>
            <span class="font-bold font-mono text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">{{ report?.tenant_metrics?.lease_expirations?.next_60_days || 0 }}</span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-600 font-medium">Expirations (90 days)</span>
            <span class="font-bold font-mono text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full">{{ report?.tenant_metrics?.lease_expirations?.next_90_days || 0 }}</span>
          </div>
        </div>
        <div v-if="report?.tenant_metrics?.upcoming_expirations?.length" class="space-y-2 pt-1">
          <p class="text-[10px] uppercase font-bold tracking-wide text-slate-400 flex items-center gap-1.5">
            <svg class="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            Lease Pipeline Alerts
          </p>
          <div v-for="lease in report.tenant_metrics.upcoming_expirations" :key="lease.id"
            class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-3 rounded-xl text-[11px] text-slate-900 space-y-1">
            <div class="flex justify-between font-bold">
              <span class="text-slate-900">{{ lease.property_name }}</span>
              <span class="text-amber-700 font-mono text-[10px] bg-amber-100 px-2 py-0.5 rounded-full">Ends: {{ formatDateShort(lease.end_date) }}</span>
            </div>
            <div class="text-slate-500 font-mono text-[10px] flex justify-between">
              <span>{{ lease.tenant_email }}</span>
              <span>{{ lease.tenant_phone }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Coworking Ecosystem -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div class="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Coworking Ecosystem</h3>
        </div>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-600 font-medium">Managed Shared Spaces</span>
            <span class="font-bold text-slate-900">{{ report?.coworking?.total_spaces || 0 }} spaces</span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-600 font-medium">Total Structural Capacity</span>
            <span class="font-bold text-slate-900">{{ report?.coworking?.total_capacity_seats || 0 }} seats</span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-600 font-medium">Avg Room Utilisation</span>
            <span class="font-mono font-bold text-slate-900">{{ report?.coworking?.avg_utilisation_pct || 0 }}%</span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-purple-50 rounded-lg border border-purple-200">
            <span class="text-slate-700 font-semibold">Aggregated Revenue</span>
            <span class="px-2.5 py-1 bg-purple-600 text-white font-mono font-bold rounded-lg text-[11px]">{{ report?.coworking?.total_revenue || 0 }} ETB</span>
          </div>
        </div>
        <div v-if="report?.coworking?.spaces?.length" class="space-y-2 pt-1">
          <p class="text-[10px] uppercase font-bold tracking-wide text-slate-400">Locations Status</p>
          <div v-for="space in report.coworking.spaces" :key="space.id"
            class="bg-gradient-to-r from-slate-50 to-purple-50 border border-slate-200 p-3 rounded-xl text-[11px] text-slate-900 flex justify-between items-center hover:border-purple-200 transition-colors">
            <div>
              <p class="font-bold text-slate-900">{{ space.name }}</p>
              <p class="text-[10px] text-slate-400 font-medium mt-0.5">{{ space.location }} · {{ space.capacity }} seats</p>
            </div>
            <div class="text-right">
              <p class="font-mono font-bold text-slate-900 text-xs">{{ space.price_monthly }} ETB/mo</p>
              <span class="text-[9px] px-2 py-0.5 font-bold uppercase tracking-wide rounded-full mt-1 inline-block"
                :class="space.active_rentals > 0 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-500'">
                {{ space.active_rentals }} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Work Orders + Chart -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <div class="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Work Orders</h3>
        </div>
        <!-- Mini stat row -->
        <div class="grid grid-cols-4 gap-2 text-center mb-3">
          <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div class="text-lg font-extrabold text-slate-900">{{ report?.maintenance?.total || 0 }}</div>
            <div class="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Total</div>
          </div>
          <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <div class="text-lg font-extrabold text-amber-700">{{ report?.maintenance?.pending || 0 }}</div>
            <div class="text-[9px] font-bold text-amber-500 uppercase mt-0.5">Pending</div>
          </div>
          <div class="p-2.5 bg-sky-50 border border-sky-200 rounded-xl">
            <div class="text-lg font-extrabold text-sky-700">{{ report?.maintenance?.open || 0 }}</div>
            <div class="text-[9px] font-bold text-sky-500 uppercase mt-0.5">Open</div>
          </div>
          <div class="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div class="text-lg font-extrabold text-emerald-700">{{ report?.maintenance?.resolved || 0 }}</div>
            <div class="text-[9px] font-bold text-emerald-500 uppercase mt-0.5">Resolved</div>
          </div>
        </div>
        <!-- Maintenance donut chart -->
        <apexchart type="donut" height="220" :options="maintenanceChartOptions" :series="maintenanceSeries" />
        <div class="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5 text-slate-500">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="font-medium">Mean Resolution Timeline</span>
          </div>
          <span class="font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
            {{ report?.maintenance?.avg_resolution_hours || 'N/A' }}
          </span>
        </div>
      </div>

    </div>
  </div><!-- end v-else -->
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'

const CHART_FONT = 'Inter, ui-sans-serif, system-ui, sans-serif'
const BASE_CHART = {
  toolbar: { show: false },
  zoom: { enabled: false }
}

export default {
  name: 'OwnerDashboard',
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
    // ── Property Status Donut ──────────────────────────────────
    propertyStatusSeries() {
      const s = this.report?.portfolio_summary
      if (!s) return [0, 0, 0, 0]
      const occupied = s.occupied_units || 0
      const forSale  = s.for_sale || 0
      const maint    = s.under_maintenance || 0
      const total    = s.total_properties || 0
      const vacant   = Math.max(0, total - occupied - forSale - maint)
      return [occupied, vacant, forSale, maint]
    },
    propertyStatusChartOptions() {
      return {
        chart: { ...BASE_CHART, type: 'donut', fontFamily: CHART_FONT },
        labels: ['Occupied', 'Vacant', 'For Sale', 'Maintenance'],
        colors: ['#10b981', '#94a3b8', '#f59e0b', '#f97316'],
        legend: { position: 'bottom', fontSize: '11px', fontWeight: 600,
          labels: { colors: '#64748b' },
          markers: { width: 10, height: 10, radius: 3 }
        },
        dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 700 },
          dropShadow: { enabled: false }
        },
        plotOptions: { pie: { donut: {
          size: '65%',
          labels: { show: true,
            total: { show: true, label: 'Total', fontSize: '11px', fontWeight: 700, color: '#64748b',
              formatter: () => (this.report?.portfolio_summary?.total_properties || 0)
            },
            value: { fontSize: '18px', fontWeight: 800, color: '#0f172a' }
          }
        }}},
        stroke: { width: 0 },
        tooltip: { y: { formatter: (v) => `${v} units` } }
      }
    },

    // ── Financial Bar ──────────────────────────────────────────
    financialBarSeries() {
      const f = this.report?.financials
      if (!f) return [{ data: [0, 0, 0, 0] }]
      return [{
        name: 'ETB',
        data: [
          f.collected_this_month || 0,
          f.net_income           || 0,
          f.outstanding_rent     || 0,
          f.pms_fees_deducted    || 0
        ]
      }]
    },
    financialBarOptions() {
      return {
        chart: { ...BASE_CHART, type: 'bar', fontFamily: CHART_FONT },
        plotOptions: { bar: { borderRadius: 6, columnWidth: '50%', distributed: true } },
        colors: ['#10b981', '#6366f1', '#f43f5e', '#f59e0b'],
        dataLabels: { enabled: false },
        xaxis: {
          categories: ['Collected', 'Net Income', 'Outstanding', 'PMS Fees'],
          labels: { style: { fontSize: '11px', fontWeight: 600, colors: '#64748b' } },
          axisBorder: { show: false }, axisTicks: { show: false }
        },
        yaxis: { labels: { style: { fontSize: '10px', colors: '#94a3b8' },
          formatter: (v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v
        }},
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        legend: { show: false },
        tooltip: { y: { formatter: (v) => `${v.toLocaleString()} ETB` } }
      }
    },

    // ── Maintenance Donut ──────────────────────────────────────
    maintenanceSeries() {
      const m = this.report?.maintenance
      if (!m) return [0, 0, 0]
      return [m.pending || 0, m.open || 0, m.resolved || 0]
    },
    maintenanceChartOptions() {
      return {
        chart: { ...BASE_CHART, type: 'donut', fontFamily: CHART_FONT },
        labels: ['Pending', 'Open', 'Resolved'],
        colors: ['#f59e0b', '#0ea5e9', '#10b981'],
        legend: { position: 'bottom', fontSize: '11px', fontWeight: 600,
          labels: { colors: '#64748b' },
          markers: { width: 10, height: 10, radius: 3 }
        },
        dataLabels: { enabled: true, style: { fontSize: '10px', fontWeight: 700 },
          dropShadow: { enabled: false }
        },
        plotOptions: { pie: { donut: { size: '60%',
          labels: { show: true,
            total: { show: true, label: 'Orders', fontSize: '10px', fontWeight: 700, color: '#64748b',
              formatter: () => (this.report?.maintenance?.total || 0)
            },
            value: { fontSize: '16px', fontWeight: 800, color: '#0f172a' }
          }
        }}},
        stroke: { width: 0 },
        tooltip: { y: { formatter: (v) => `${v} requests` } }
      }
    }
  },
  methods: {
    async fetchReport() {
      try {
        this.loading = true
        this.error = null
        this.report = await this.$apiGet("/owner_report")
      } catch (err) {
        console.error(err)
        this.error = "Failed to load property owner portfolio metrics."
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
    },
    formatDateShort(dateStr) {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      })
    }
  }
}
</script>
