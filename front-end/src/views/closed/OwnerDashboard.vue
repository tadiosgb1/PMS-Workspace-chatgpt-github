<template>
  <div v-if="loading" class="flex items-center justify-center py-20">
    <div class="flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-xs text-slate-800 font-bold tracking-wide">Loading portfolio...</p>
    </div>
  </div>
  
  <div v-else-if="error" class="bg-rose-50 border border-rose-300 p-4 rounded-xl text-xs text-rose-700 font-bold">
    {{ error }}
  </div>

  <div v-else class="space-y-6 max-w-[1600px] mx-auto p-4 bg-slate-100/40 min-h-screen">
    <!-- Header Area -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-300 pb-5">
      <div>
        <h2 class="text-lg font-bold tracking-tight text-slate-900">{{ report?.owner_name  }} </h2>
        <p v-if="report?.generated_at" class="text-xs text-slate-800 mt-1 font-medium">
          Generated at: {{ formatDate(report.generated_at) }}
        </p>
      </div>
      <button 
        @click="fetchReport"
        class="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all shadow-sm active:scale-95"
      >
        Refresh
      </button>
    </div>

    <!-- Portfolio Summary Cards Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Properties -->
      <div class="bg-white border border-slate-300 p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:border-indigo-400 transition-colors">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Total Properties</p>
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
        </div>
        <div class="mt-4 flex items-baseline gap-1">
          <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.portfolio_summary?.total_properties || 0 }}</p>
          <span class="text-[10px] text-slate-700 font-bold uppercase">units</span>
        </div>
      </div>

      <!-- Occupancy Rate -->
      <div class="bg-white border border-slate-300 p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:border-emerald-400 transition-colors">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Occupancy Rate</p>
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
        </div>
        <div class="mt-4 flex items-baseline gap-1">
          <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.portfolio_summary?.occupancy_rate_pct || 0 }}%</p>
          <span class="text-[10px] text-slate-700 font-bold uppercase">
            ({{ report?.portfolio_summary?.occupied_units || 0 }} occupied)
          </span>
        </div>
      </div>

      <!-- Under Maintenance -->
      <div class="bg-white border border-slate-300 p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:border-amber-400 transition-colors">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Status Allocations</p>
          <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
        </div>
        <div class="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-slate-800 font-bold">
          <span>For Sale: <strong class="text-slate-900 font-black">{{ report?.portfolio_summary?.for_sale || 0 }}</strong></span>
          <span class="text-slate-400">|</span>
          <span>Maintenance: <strong class="text-slate-900 font-black">{{ report?.portfolio_summary?.under_maintenance || 0 }}</strong></span>
        </div>
      </div>

      <!-- Average Rent -->
      <div class="bg-white border border-slate-300 p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:border-sky-400 transition-colors">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Avg Rent Per Unit</p>
          <span class="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
        </div>
        <div class="mt-4 flex items-baseline gap-1">
          <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.portfolio_summary?.avg_rent_per_unit || 0 }}</p>
          <span class="text-[10px] font-black uppercase text-indigo-700">ETB</span>
        </div>
      </div>
    </div>

    <!-- Financial Matrix Panel -->
    <div class="bg-white border border-slate-300 rounded-xl p-5 shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Financial Insights</h3>
        <span class="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-extrabold rounded-full uppercase tracking-wider">Current Cycle</span>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-slate-100 p-4 rounded-xl border border-slate-300">
          <p class="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Outstanding Rent</p>
          <p class="text-2xl font-black mt-1 tracking-tight text-rose-700">
            {{ report?.financials?.outstanding_rent || 0 }} <span class="text-xs font-bold text-slate-800">ETB</span>
          </p>
        </div>
        <div class="bg-slate-100 p-4 rounded-xl border border-slate-300">
          <p class="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Collected This Month</p>
          <p class="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            {{ report?.financials?.collected_this_month || 0 }} <span class="text-xs font-bold text-slate-800">ETB</span>
          </p>
        </div>
        <div class="bg-slate-100 p-4 rounded-xl border border-slate-300">
          <p class="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Net Portfolio Income</p>
          <p class="text-2xl font-black text-indigo-700 mt-1 tracking-tight">
            {{ report?.financials?.net_income || 0 }} <span class="text-xs font-bold text-slate-800">ETB</span>
          </p>
        </div>
        <div class="bg-slate-100 p-4 rounded-xl border border-slate-300">
          <p class="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Late Payments</p>
          <div class="flex items-baseline gap-2 mt-1">
            <p class="text-2xl font-black tracking-tight text-slate-900">
              {{ report?.financials?.late_payments?.count || 0 }}
            </p>
            <span class="text-xs font-bold text-slate-800">({{ report?.financials?.late_payments?.amount || 0 }} ETB)</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div class="flex justify-between items-center py-2 px-3 bg-slate-100 rounded-lg text-slate-900 border border-slate-200">
          <span class="font-bold text-slate-800">PMS Fees Deducted</span>
          <span class="font-mono font-extrabold">{{ report?.financials?.pms_fees_deducted || 0 }} ETB</span>
        </div>
        <div class="flex justify-between items-center py-2 px-3 bg-slate-100 rounded-lg text-slate-900 border border-slate-200">
          <span class="font-bold text-slate-800">Pending Escrow Payments</span>
          <span class="font-mono font-extrabold">{{ report?.financials?.pending_payments || 0 }} ETB</span>
        </div>
      </div>
    </div>

    <!-- Center Breakdown Rows -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Tenant Metrics & Expirations -->
      <div class="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <div class="border-b border-slate-300 pb-3 mb-3 flex justify-between items-center">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Tenant Allocations</h3>
            <span class="px-2 py-0.5 bg-slate-200 text-slate-900 text-[10px] font-extrabold rounded">
              Active: {{ report?.tenant_metrics?.active_tenants || 0 }}
            </span>
          </div>
          
          <div class="space-y-2 text-xs">
            <div class="flex justify-between items-center text-slate-900 py-1 border-b border-slate-200">
              <span class="text-slate-800 font-bold">Expirations (Next 30 Days)</span>
              <span class="px-2 py-0.5 font-black font-mono text-rose-700 bg-rose-100 rounded">
                {{ report?.tenant_metrics?.lease_expirations?.next_30_days || 0 }}
              </span>
            </div>
            <div class="flex justify-between items-center text-slate-900 py-1 border-b border-slate-200">
              <span class="text-slate-800 font-bold">Expirations (Next 60 Days)</span>
              <span class="font-black font-mono text-slate-900">{{ report?.tenant_metrics?.lease_expirations?.next_60_days || 0 }}</span>
            </div>
            <div class="flex justify-between items-center text-slate-900 py-1">
              <span class="text-slate-800 font-bold">Expirations (Next 90 Days)</span>
              <span class="font-black font-mono text-slate-900">{{ report?.tenant_metrics?.lease_expirations?.next_90_days || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Upcoming Expirations Pipeline List -->
        <div v-if="report?.tenant_metrics?.upcoming_expirations?.length" class="space-y-2 pt-1">
          <p class="text-[10px] uppercase font-bold tracking-wide text-slate-800">Lease Pipeline Alerts</p>
          <div 
            v-for="lease in report.tenant_metrics.upcoming_expirations" 
            :key="lease.id" 
            class="bg-slate-100 border border-slate-300 p-2.5 rounded-xl text-[11px] text-slate-900 space-y-1"
          >
            <div class="flex justify-between font-extrabold">
              <span class="text-slate-900">{{ lease.property_name }}</span>
              <span class="text-amber-800 font-mono text-[10px]">Ends: {{ formatDateShort(lease.end_date) }}</span>
            </div>
            <div class="text-slate-800 font-mono text-[10px] flex justify-between font-bold">
              <span>{{ lease.tenant_email }}</span>
              <span>{{ lease.tenant_phone }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Coworking Metrics -->
      <div class="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
        <div class="border-b border-slate-300 pb-3 mb-1">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Coworking Ecosystem</h3>
        </div>
        
        <div class="space-y-2 text-xs">
          <div class="flex justify-between items-center text-slate-900">
            <span class="text-slate-800 font-bold">Managed Shared Spaces</span>
            <span class="font-black text-slate-900">{{ report?.coworking?.total_spaces || 0 }} spaces</span>
          </div>
          <div class="flex justify-between items-center text-slate-900">
            <span class="text-slate-800 font-bold">Total Structural Capacity</span>
            <span class="font-black text-slate-900">{{ report?.coworking?.total_capacity_seats || 0 }} seats</span>
          </div>
          <div class="flex justify-between items-center text-slate-900">
            <span class="text-slate-800 font-bold">Average Room Utilisation</span>
            <span class="font-mono font-black text-slate-900">{{ report?.coworking?.avg_utilisation_pct || 0 }}%</span>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-slate-300 font-bold">
            <span class="text-slate-900">Aggregated Revenue</span>
            <span class="px-2 py-0.5 bg-purple-100 text-purple-900 font-mono font-black rounded">
              {{ report?.coworking?.total_revenue || 0 }} ETB
            </span>
          </div>
        </div>

        <!-- Inline Spaces Array Breakdown -->
        <div v-if="report?.coworking?.spaces?.length" class="space-y-2 pt-1">
          <p class="text-[10px] uppercase font-bold tracking-wide text-slate-800">Locations Status</p>
          <div 
            v-for="space in report.coworking.spaces" 
            :key="space.id"
            class="bg-slate-100 border border-slate-300 p-2.5 rounded-xl text-[11px] text-slate-900 flex justify-between items-center"
          >
            <div>
              <p class="font-black text-slate-900">{{ space.name }}</p>
              <p class="text-[10px] text-slate-800 font-bold">{{ space.location }} · {{ space.capacity }} seats</p>
            </div>
            <div class="text-right">
              <p class="font-mono font-black text-slate-900">{{ space.price_monthly }} ETB/mo</p>
              <span class="text-[9px] px-1.5 py-0.5 font-extrabold uppercase tracking-wide rounded" :class="space.active_rentals > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-300 text-slate-900'">
                {{ space.active_rentals }} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Maintenance Management -->
      <div class="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div class="border-b border-slate-300 pb-3 mb-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Work Orders</h3>
          </div>
          <div class="grid grid-cols-2 gap-3 text-center">
            <div class="p-3 bg-slate-100 border border-slate-300 rounded-xl">
              <div class="text-xl font-black text-slate-900">{{ report?.maintenance?.total || 0 }}</div>
              <div class="text-[10px] font-bold text-slate-800 uppercase mt-1">Total Logs</div>
            </div>
            <div class="p-3 bg-amber-100 border border-amber-300 rounded-xl">
              <div class="text-xl font-black text-amber-900">{{ report?.maintenance?.pending || 0 }}</div>
              <div class="text-[10px] font-bold text-amber-800 uppercase mt-1">Pending</div>
            </div>
            <div class="p-3 bg-sky-100 border border-sky-300 rounded-xl">
              <div class="text-xl font-black text-sky-900">{{ report?.maintenance?.open || 0 }}</div>
              <div class="text-[10px] font-bold text-sky-800 uppercase mt-1">Open</div>
            </div>
            <div class="p-3 bg-emerald-100 border border-emerald-300 rounded-xl">
              <div class="text-xl font-black text-emerald-900">{{ report?.maintenance?.resolved || 0 }}</div>
              <div class="text-[10px] font-bold text-emerald-800 uppercase mt-1">Resolved</div>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-300 text-xs text-slate-800 flex justify-between items-center font-bold">
          <span>Mean Resolution Timeline</span>
          <span class="font-mono font-black text-slate-900">
            {{ report?.maintenance?.avg_resolution_hours || 'N/A' }}
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'OwnerDashboard',
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
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    },
    formatDateShort(dateStr) {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
  }
}
</script>