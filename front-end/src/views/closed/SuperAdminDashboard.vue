<template>
  <div v-if="loading" class="flex items-center justify-center py-20">
    <div class="flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-xs text-slate-500 font-medium tracking-wide">Loading report...</p>
    </div>
  </div>
  
  <div v-else-if="error" class="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-600 font-medium">
    {{ error }}
  </div>

  <div v-else class="space-y-6 max-w-[1600px] mx-auto p-4 bg-slate-50/30 min-h-screen">
    <!-- Clean Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
      <div>
        <h2 class="text-lg font-bold tracking-tight text-slate-900">Platform Overview</h2>
        <p v-if="report?.generated_at" class="text-xs text-slate-500 mt-1">
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

    <!-- Core Grid Metrics with Accent Dots -->
    <div class="grid grid-cols-2 lg:grid-cols-6 gap-4">
      <!-- Total Properties -->
      <div class="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-colors">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Properties</p>
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
        </div>
        <div class="mt-4 flex items-baseline gap-1">
          <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.platform_overview?.total_properties || 0 }}</p>
          <span class="text-[10px] text-slate-400 font-semibold uppercase">properties</span>
        </div>
      </div>

      <!-- Total Zones -->
      <div class="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:border-sky-200 transition-colors">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Zones</p>
          <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
        </div>
        <div class="mt-4 flex items-baseline gap-1">
          <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.platform_overview?.total_zones || 0 }}</p>
          <span class="text-[10px] text-slate-400 font-semibold uppercase">zones</span>
        </div>
      </div>

      <!-- Coworking Spaces -->
      <div class="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:border-purple-200 transition-colors">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Coworking Spaces</p>
          <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
        </div>
        <div class="mt-4 flex items-baseline gap-1">
          <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.platform_overview?.total_coworking_spaces || 0 }}</p>
          <span class="text-[10px] text-slate-400 font-semibold uppercase">spaces</span>
        </div>
      </div>

      <!-- System Users -->
      <div class="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:border-amber-200 transition-colors">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Users</p>
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        </div>
        <div class="mt-4 flex items-baseline gap-1">
          <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.platform_overview?.total_users || 0 }}</p>
          <span class="text-[10px] text-slate-400 font-semibold uppercase">users</span>
        </div>
      </div>

      <!-- Subscriptions -->
      <div class="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-colors">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Subscriptions</p>
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>
        <div class="mt-4 flex items-baseline gap-1">
          <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.platform_overview?.active_subscriptions || 0 }}</p>
          <span class="text-[10px] text-slate-400 font-semibold uppercase">active</span>
        </div>
      </div>

      <!-- Active Rents -->
      <div class="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:border-teal-200 transition-colors">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Rents</p>
          <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
        </div>
        <div class="mt-4 flex items-baseline gap-1">
          <p class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ report?.platform_overview?.active_rents || 0 }}</p>
          <span class="text-[10px] text-slate-400 font-semibold uppercase">rents</span>
        </div>
      </div>
    </div>

    <!-- Revenue & Billing -->
    <div class="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Revenue Billing</h3>
        <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Active</span>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
          <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Revenue All Time</p>
          <p class="text-2xl font-black text-slate-900 mt-1 tracking-tight">{{ report?.revenue_billing?.total_revenue_all_time || 0 }} <span class="text-xs font-bold text-indigo-600">ETB</span></p>
        </div>
        <div class="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
          <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">MRR / ARPU</p>
          <p class="text-xl font-bold text-slate-900 mt-2 tracking-tight">
            {{ report?.revenue_billing?.mrr || 0 }} / {{ report?.revenue_billing?.arpu || 0 }} <span class="text-xs font-semibold text-slate-400">ETB</span>
          </p>
        </div>
        <div class="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
          <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Overdue Invoices</p>
          <div class="flex items-baseline gap-2 mt-1">
            <p class="text-2xl font-black tracking-tight" :class="report?.revenue_billing?.overdue_invoices?.count > 0 ? 'text-rose-600' : 'text-slate-900'">
              {{ report?.revenue_billing?.overdue_invoices?.count || 0 }}
            </p>
            <span class="text-xs font-semibold text-slate-500">({{ report?.revenue_billing?.overdue_invoices?.amount || 0 }} ETB)</span>
          </div>
        </div>
        <div class="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
          <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pending Subscription Payments</p>
          <p class="text-2xl font-black text-slate-900 mt-1 tracking-tight">{{ report?.revenue_billing?.pending_subscription_payments || 0 }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Revenue Breakdowns -->
        <div class="border border-slate-100 rounded-xl p-4 bg-white">
          <p class="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Revenue Last 30 Days</span>
            <span class="px-2 py-0.5 bg-sky-50 text-sky-700 text-[9px] font-bold rounded-md uppercase">30 Days</span>
          </p>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between items-center py-1.5 border-b border-slate-100 text-slate-900"><span>Rent</span><span class="font-mono font-bold text-slate-900">{{ report?.revenue_billing?.revenue_last_30_days?.rent || 0 }} ETB</span></div>
            <div class="flex justify-between items-center py-1.5 border-b border-slate-100 text-slate-900"><span>Sales</span><span class="font-mono font-bold text-slate-900">{{ report?.revenue_billing?.revenue_last_30_days?.sales || 0 }} ETB</span></div>
            <div class="flex justify-between items-center py-1.5 border-b border-slate-100 text-slate-900"><span>Subscription</span><span class="font-mono font-bold text-slate-900">{{ report?.revenue_billing?.revenue_last_30_days?.subscription || 0 }} ETB</span></div>
            <div class="flex justify-between items-center py-1.5 border-b border-slate-100 text-slate-900"><span>Workspace</span><span class="font-mono font-bold text-slate-900">{{ report?.revenue_billing?.revenue_last_30_days?.workspace || 0 }} ETB</span></div>
            <div class="flex justify-between items-center pt-2.5 font-bold text-slate-900"><span>Total</span><span class="font-mono font-extrabold text-indigo-600 bg-indigo-50/60 px-2 py-1 rounded">{{ report?.revenue_billing?.revenue_last_30_days?.total || 0 }} ETB</span></div>
          </div>
        </div>

        <div class="border border-slate-100 rounded-xl p-4 bg-white">
          <p class="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Revenue All Time</span>
            <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-md uppercase">All Time</span>
          </p>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between items-center py-1.5 border-b border-slate-100 text-slate-900"><span>Rent</span><span class="font-mono font-bold text-slate-900">{{ report?.revenue_billing?.revenue_all_time?.rent || 0 }} ETB</span></div>
            <div class="flex justify-between items-center py-1.5 border-b border-slate-100 text-slate-900"><span>Sales</span><span class="font-mono font-bold text-slate-900">{{ report?.revenue_billing?.revenue_all_time?.sales || 0 }} ETB</span></div>
            <div class="flex justify-between items-center py-1.5 border-b border-slate-100 text-slate-900"><span>Subscription</span><span class="font-mono font-bold text-slate-900">{{ report?.revenue_billing?.revenue_all_time?.subscription || 0 }} ETB</span></div>
            <div class="flex justify-between items-center py-1.5 border-b border-slate-100 text-slate-900"><span>Workspace</span><span class="font-mono font-bold text-slate-900">{{ report?.revenue_billing?.revenue_all_time?.workspace || 0 }} ETB</span></div>
            <div class="flex justify-between items-center pt-2.5 font-bold text-slate-900"><span>Total Revenue All Time</span><span class="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">{{ report?.revenue_billing?.total_revenue_all_time || 0 }} ETB</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Center Breakdown Blocks -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Users by Role -->
      <div class="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <div class="border-b border-slate-100 pb-3 mb-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Users by Role</h3>
        </div>
        <div class="grid grid-cols-1 gap-2 text-xs">
          <div v-for="(count, role) in report?.platform_overview?.users_by_role" :key="role" class="flex justify-between items-center py-1.5 px-2 bg-slate-50/60 rounded-lg text-slate-900">
            <span class="capitalize font-medium">{{ role.replace('_', ' ') }}</span>
            <span class="font-mono font-bold px-2 py-0.5 bg-white border border-slate-100 shadow-sm text-slate-900 rounded-md min-w-[32px] text-center">
              {{ count }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tenant & Landlord Data -->
      <div class="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <div class="border-b border-slate-100 pb-3 mb-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Tenant & Landlord</h3>
          </div>
          <div class="space-y-3 text-xs">
            <div class="flex justify-between items-center text-slate-900">
              <span>Totals (Owners / Tenants)</span>
              <span class="px-2 py-0.5 bg-slate-100 text-slate-900 rounded font-mono font-bold">{{ report?.tenant_landlord?.totals?.owners || 0 }} owners / {{ report?.tenant_landlord?.totals?.tenants || 0 }} tenants</span>
            </div>
            <div class="flex justify-between items-center text-slate-900">
              <span>New Signups Last 30 Days</span>
              <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono font-bold">+{{ report?.tenant_landlord?.new_signups_last_30_days?.owners || 0 }} owners / +{{ report?.tenant_landlord?.new_signups_last_30_days?.tenants || 0 }} tenants</span>
            </div>
            <div class="flex justify-between items-center text-slate-900">
              <span>Average Occupancy Rate</span>
              <span class="px-2 py-0.5 bg-amber-50 text-amber-700 rounded font-mono font-bold">{{ report?.tenant_landlord?.avg_occupancy_rate_pct || 0 }}%</span>
            </div>
            <div class="flex justify-between items-center text-slate-900">
              <span>Rented Properties / Total</span>
              <span class="px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-mono font-bold">{{ report?.tenant_landlord?.rented_properties || 0 }} of {{ report?.tenant_landlord?.total_properties || 0 }} properties</span>
            </div>
          </div>
        </div>
        <div class="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div class="bg-indigo-50/40 border border-indigo-100/40 p-2 rounded-lg">
            <p class="text-slate-500 font-medium text-[10px] uppercase">Active Rents</p>
            <p class="font-bold text-indigo-700 text-base mt-0.5">{{ report?.tenant_landlord?.active_rents || 0 }}</p>
          </div>
          <div class="bg-rose-50/40 border border-rose-100/40 p-2 rounded-lg">
            <p class="text-slate-500 font-medium text-[10px] uppercase">Terminated</p>
            <p class="font-bold text-rose-700 text-base mt-0.5">{{ report?.tenant_landlord?.terminated_rents || 0 }}</p>
          </div>
          <div class="bg-emerald-50/40 border border-emerald-100/40 p-2 rounded-lg">
            <p class="text-slate-500 font-medium text-[10px] uppercase">New Rents (30d)</p>
            <p class="font-bold text-emerald-700 text-base mt-0.5">{{ report?.tenant_landlord?.new_rents_last_30_days || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Coworking Metrics -->
      <div class="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <div class="border-b border-slate-100 pb-3 mb-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Coworking</h3>
        </div>
        <div class="space-y-3 text-xs">
          <div class="flex justify-between items-center text-slate-900">
            <span>Total Coworking Spaces</span>
            <span class="font-bold text-slate-900">{{ report?.coworking?.total_coworking_spaces || 0 }} spaces</span>
          </div>
          <div class="flex justify-between items-center text-slate-900">
            <span>Total Capacity Seats</span>
            <span class="font-bold text-slate-900">{{ report?.coworking?.total_capacity_seats || 0 }} seats</span>
          </div>
          <div class="flex justify-between items-center text-slate-900">
            <span>Active Memberships</span>
            <span class="font-bold text-slate-900">{{ report?.coworking?.active_memberships || 0 }} members</span>
          </div>
          <div class="flex justify-between items-center text-slate-900">
            <span>Total Rentals All Time</span>
            <span class="font-bold text-slate-900">{{ report?.coworking?.total_rentals_all_time || 0 }} rentals</span>
          </div>
          <div class="flex justify-between items-center text-slate-900">
            <span>Average Utilisation Rate</span>
            <span class="font-mono font-bold text-slate-900">{{ report?.coworking?.avg_utilisation_pct || 0 }}%</span>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-slate-100">
            <span class="font-semibold text-slate-900">Total Revenue</span>
            <span class="px-2 py-1 bg-purple-50 text-purple-700 font-mono font-bold rounded">{{ report?.coworking?.total_revenue || 0 }} ETB</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Metrics Components -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Maintenance Logs -->
      <div class="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <div class="border-b border-slate-100 pb-3 mb-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Maintenance Requests</h3>
        </div>
        <div class="grid grid-cols-4 gap-3 text-center">
          <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div class="text-xl font-bold text-slate-900">{{ report?.maintenance?.total || 0 }}</div>
            <div class="text-[10px] font-bold text-slate-500 uppercase mt-1">Total</div>
          </div>
          <div class="p-3 bg-amber-50/80 border border-amber-100/30 rounded-xl">
            <div class="text-xl font-bold text-amber-700">{{ report?.maintenance?.pending || 0 }}</div>
            <div class="text-[10px] font-bold text-amber-600 uppercase mt-1">Pending</div>
          </div>
          <div class="p-3 bg-sky-50 border border-sky-100/30 rounded-xl">
            <div class="text-xl font-bold text-sky-700">{{ report?.maintenance?.open || 0 }}</div>
            <div class="text-[10px] font-bold text-sky-600 uppercase mt-1">Open</div>
          </div>
          <div class="p-3 bg-emerald-50 border border-emerald-100/30 rounded-xl">
            <div class="text-xl font-bold text-emerald-700">{{ report?.maintenance?.resolved || 0 }}</div>
            <div class="text-[10px] font-bold text-emerald-600 uppercase mt-1">Resolved</div>
          </div>
        </div>
      </div>

      <!-- Audit Trails -->
      <div class="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <div class="border-b border-slate-100 pb-3 mb-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Audit Events</h3>
        </div>
        <div class="space-y-3 text-xs">
          <div class="flex justify-between items-center text-slate-900">
            <span class="font-medium">Events Last 24 Hours</span>
            <span class="font-mono text-indigo-700 font-bold px-2 py-0.5 bg-indigo-50/60 rounded-md border border-indigo-100/40">{{ report?.audit?.events_last_24h || 0 }} events</span>
          </div>
          <div class="flex flex-wrap gap-2 text-[11px] text-slate-900 border-t border-b border-slate-100 py-2.5">
            <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Create: <strong class="font-mono text-slate-900 font-bold">{{ report?.audit?.by_action?.create || 0 }}</strong></span>
            <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Update: <strong class="font-mono text-slate-900 font-bold">{{ report?.audit?.by_action?.update || 0 }}</strong></span>
            <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Delete: <strong class="font-mono text-slate-900 font-bold">{{ report?.audit?.by_action?.delete || 0 }}</strong></span>
            <span class="px-2 py-0.5 text-slate-700 rounded-md font-medium" :class="report?.audit?.not_applicable ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'">
              Not Applicable: <strong class="font-mono font-bold">{{ report?.audit?.not_applicable ? 'True' : 'False' }}</strong>
            </span>
          </div>
          <div>
            <p class="text-[10px] uppercase font-bold tracking-wide text-slate-400 mb-2">Top Actors</p>
            <div v-for="(actor, idx) in report?.audit?.top_actors" :key="idx" class="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex justify-between items-center font-mono text-[11px] text-slate-900">
              <span class="text-slate-900 font-medium">
                Email: {{ actor.actor__email || 'None' }} / Phone: {{ actor.actor__phone_number || 'None' }}
              </span>
              <span class="px-2 py-0.5 bg-white border border-slate-200/60 text-slate-900 font-bold rounded shadow-sm">{{ actor.events }} events</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SuperAdminDashboard',
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
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
  }
}
</script>