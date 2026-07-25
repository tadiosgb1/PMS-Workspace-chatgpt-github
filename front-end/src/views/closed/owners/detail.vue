<template>
  <div class="min-h-screen bg-slate-50 pb-12">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading owner profile..." />

    <!-- Back -->
    <div class="px-4 md:px-8 pt-5 pb-2">
      <button @click="$router.back()"
        class="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition uppercase tracking-wider">
        <i class="fas fa-arrow-left text-[10px]"></i> Back to Owners
      </button>
    </div>

    <div v-if="owner" class="px-4 md:px-8 space-y-5 max-w-7xl mx-auto">

      <!-- ── Hero Card ───────────────────────────────────────────────── -->
  <div class="bg-slate-50 border border-slate-200 shadow-sm overflow-hidden">
    <!-- Header with better contrast on gray theme -->
    <div class="p-3 bg-gray-300 flex flex-col sm:flex-row sm:items-center gap-5">
      
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-black text-black tracking-tight">{{ owner.full_name || '—' }}</h1>
      </div>
     <span 
  :class="owner.is_active 
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    : 'bg-red-50 text-red-700 border-red-200'"
  class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest shrink-0 flex items-center gap-1">
  
  {{ owner.is_active ? '● Active' : '○ Inactive' }}
</span>
    </div>

    <!-- Content area - visible on gray bg -->
    <div class="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 px-6 py-4 bg-white/70">
      <div class="py-3 sm:py-0 sm:pr-6">
        <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Email</p>
        <p class="text-xs font-semibold text-slate-700 truncate">{{ owner.email || '—' }}</p>
      </div>
      <div class="py-3 sm:py-0 sm:px-6">
        <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Phone</p>
        <p class="text-xs font-semibold text-slate-700">{{ owner.phone || '—' }}</p>
      </div>
      <div class="py-3 sm:py-0 sm:px-6">
        <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Date Joined</p>
        <p class="text-xs font-semibold text-slate-700">{{ fmt(owner.date_joined) }}</p>
      </div>
     
    </div>
  </div>
      <!-- ── KPI Cards ──────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-2">
  <div 
    v-for="kpi in kpis" 
    :key="kpi.label"
    class="bg-white rounded-xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] px-3 py-2 flex flex-col justify-between min-w-0 hover:border-slate-200 hover:shadow-md transition-all duration-200 ease-in-out"
  >
    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate leading-none">
      {{ kpi.label }}
    </p>
    
    <p class="text-lg font-black tracking-tight my-1 leading-none truncate" :class="kpi.color">
      {{ kpi.value }}
    </p>
    
    <p class="text-[9px] text-slate-400/80 font-medium truncate leading-none">
      {{ kpi.sub }}
    </p>
  </div>
</div>

      <!-- ── Tabs ──────────────────────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="border-b border-slate-100 flex gap-0.5 px-3 pt-3 overflow-x-auto">
          <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
            class="flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-bold rounded-t-lg border-b-2 whitespace-nowrap transition-all"
            :class="activeTab === tab.key
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'">
            <i :class="tab.icon" class="text-[10px]"></i>
            {{ tab.label }}
            <span v-if="tab.count !== undefined"
              class="px-1.5 py-0.5 rounded-full text-[9px] font-black"
              :class="activeTab === tab.key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'">
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- ── Managers Tab ──────────────────────────────────────────── -->
        <div v-if="activeTab === 'managers'" class="p-5">
          <Loading :visible="busy.managers" message="Loading managers..." />
          <div class="overflow-x-auto rounded-lg border border-slate-100">
            <table class="w-full text-xs">
              <thead class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <tr>
                  <th class="px-3 py-2.5 text-left">Name</th>
                  <th class="px-3 py-2.5 text-left">Email</th>
                  <th class="px-3 py-2.5 text-left">Groups</th>
                  <th class="px-3 py-2.5 text-center">Status</th>
                  <th class="px-3 py-2.5 text-right">View</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="m in managers" :key="m.id" class="hover:bg-slate-50 transition">
                  <td class="px-3 py-2.5">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center uppercase shrink-0">
                        {{ ((m.manager?.first_name||'')[0]||'')}}{{ ((m.manager?.last_name||'')[0]||'') }}
                      </div>
                      <span class="font-semibold text-slate-800">
                        {{ [m.manager?.first_name, m.manager?.middle_name, m.manager?.last_name].filter(Boolean).join(' ') || '—' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-3 py-2.5 text-slate-500">{{ m.manager?.email || '—' }}</td>
                  <td class="px-3 py-2.5">
                    <div class="flex flex-wrap gap-1">
                      <span v-for="g in (m.manager?.groups||[])" :key="g"
                        class="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-semibold uppercase">{{ g }}</span>
                      <span v-if="!m.manager?.groups?.length" class="text-slate-300 italic text-[10px]">—</span>
                    </div>
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <span :class="m.is_active ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
                      class="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase">
                      {{ m.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-3 py-2.5 text-right">
                    <button @click="$router.push(`/user_detail/${m.manager?.id}`)" class="btn-action btn-blue"><i class="fas fa-eye"></i></button>
                  </td>
                </tr>
                <tr v-if="!managers.length && !busy.managers">
                  <td colspan="5" class="py-8 text-center text-slate-400 italic">No managers found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Staffs Tab ─────────────────────────────────────────────── -->
        <div v-if="activeTab === 'staffs'" class="p-5">
          <Loading :visible="busy.staffs" message="Loading staffs..." />
          <div class="overflow-x-auto rounded-lg border border-slate-100">
            <table class="w-full text-xs">
              <thead class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <tr>
                  <th class="px-3 py-2.5 text-left">Name</th>
                  <th class="px-3 py-2.5 text-left">Email</th>
                  <th class="px-3 py-2.5 text-left">Phone</th>
                  <th class="px-3 py-2.5 text-left">Groups</th>
                  <th class="px-3 py-2.5 text-center">Status</th>
                  <th class="px-3 py-2.5 text-right">View</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="s in staffs" :key="s.id" class="hover:bg-slate-50 transition">
                  <td class="px-3 py-2.5">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center uppercase shrink-0">
                        {{ ((s.staff?.first_name||'')[0]||'')}}{{ ((s.staff?.last_name||'')[0]||'') }}
                      </div>
                      <span class="font-semibold text-slate-800">
                        {{ [s.staff?.first_name, s.staff?.middle_name, s.staff?.last_name].filter(Boolean).join(' ') || '—' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-3 py-2.5 text-slate-500">{{ s.staff?.email || '—' }}</td>
                  <td class="px-3 py-2.5 text-slate-500">{{ s.staff?.phone_number || '—' }}</td>
                  <td class="px-3 py-2.5">
                    <div class="flex flex-wrap gap-1">
                      <span v-for="g in (s.staff?.groups||[])" :key="g"
                        class="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-semibold uppercase">{{ g }}</span>
                      <span v-if="!s.staff?.groups?.length" class="text-slate-300 italic text-[10px]">—</span>
                    </div>
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <span :class="s.staff?.is_active ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
                      class="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase">
                      {{ s.staff?.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-3 py-2.5 text-right">
                    <button @click="$router.push(`/user_detail/${s.staff?.id}`)" class="btn-action btn-blue"><i class="fas fa-eye"></i></button>
                  </td>
                </tr>
                <tr v-if="!staffs.length && !busy.staffs">
                  <td colspan="6" class="py-8 text-center text-slate-400 italic">No staffs found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Zones Tab ──────────────────────────────────────────────── -->
        <div v-if="activeTab === 'zones'" class="p-5">
          <Loading :visible="busy.zones" message="Loading zones..." />
          <div class="overflow-x-auto rounded-lg border border-slate-100">
            <table class="w-full text-xs">
              <thead class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <tr>
                  <th class="px-3 py-2.5 text-left">Zone Name</th>
                  <th class="px-3 py-2.5 text-left">Location</th>
                  <th class="px-3 py-2.5 text-left">City / State</th>
                  <th class="px-3 py-2.5 text-center">Map</th>
                  <th class="px-3 py-2.5 text-right">View</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="z in zones" :key="z.id" class="hover:bg-slate-50 transition">
                  <td class="px-3 py-2.5 font-semibold text-slate-800">{{ z.name }}</td>
                  <td class="px-3 py-2.5 text-slate-500">{{ z.address || '—' }}</td>
                  <td class="px-3 py-2.5 text-slate-500">{{ z.city }}, {{ z.state }}</td>
                  <td class="px-3 py-2.5 text-center">
                    <a v-if="z.latlong" :href="`https://www.google.com/maps/search/?api=1&query=${z.latlong}`"
                      target="_blank" class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-600 text-[9px] font-bold hover:bg-red-600 hover:text-white transition">
                      <i class="fa-solid fa-location-dot"></i> Map
                    </a>
                    <span v-else class="text-slate-300 text-[9px]">—</span>
                  </td>
                  <td class="px-3 py-2.5 text-right">
                    <button @click="$router.push(`/zones/${z.id}`)" class="btn-action btn-blue"><i class="fas fa-eye"></i></button>
                  </td>
                </tr>
                <tr v-if="!zones.length && !busy.zones">
                  <td colspan="5" class="py-8 text-center text-slate-400 italic">No zones found for this owner.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- ── Properties Tab ─────────────────────────────────────────── -->
        <div v-if="activeTab === 'properties'" class="p-5">
          <Loading :visible="busy.properties" message="Loading properties..." />
          <div class="overflow-x-auto rounded-lg border border-slate-100">
            <table class="w-full text-xs">
              <thead class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <tr>
                  <th class="px-3 py-2.5 text-left">Property</th>
                  <th class="px-3 py-2.5 text-left">Type</th>
                  <th class="px-3 py-2.5 text-left">City / Zone</th>
                  <th class="px-3 py-2.5 text-center">Status</th>
                  <th class="px-3 py-2.5 text-right">View</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="p in properties" :key="p.id" class="hover:bg-slate-50 transition">
                  <td class="px-3 py-2.5">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center uppercase shrink-0">
                        {{ (p.name||'').substring(0,2) }}
                      </div>
                      <span class="font-semibold text-slate-800">{{ p.name }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-2.5 text-slate-500 capitalize">{{ p.property_type?.name || '—' }}</td>
                  <td class="px-3 py-2.5 text-slate-500">{{ p.city || '—' }} / {{ p.zoneName || '—' }}</td>
                  <td class="px-3 py-2.5 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase"
                      :class="{
                        'bg-green-100 text-green-700': p.status==='available',
                        'bg-blue-100 text-blue-700': p.status==='rent',
                        'bg-orange-100 text-orange-700': p.status==='sale',
                        'bg-pink-100 text-pink-700': p.status==='under_maintenance'
                      }">{{ p.status }}</span>
                  </td>
                  <td class="px-3 py-2.5 text-right">
                    <button @click="$router.push({ name:'PropertyDetail', params:{ id: p.id } })" class="btn-action btn-blue"><i class="fas fa-eye"></i></button>
                  </td>
                </tr>
                <tr v-if="!properties.length && !busy.properties">
                  <td colspan="5" class="py-8 text-center text-slate-400 italic">No properties found for this owner.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Rents Tab ───────────────────────────────────────────────── -->
        <div v-if="activeTab === 'rents'" class="p-5">
          <Loading :visible="busy.rents" message="Loading rents..." />
          <div class="overflow-x-auto rounded-lg border border-slate-100">
            <table class="w-full text-xs">
              <thead class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <tr>
                  <th class="px-3 py-2.5 text-left">Property</th>
                  <th class="px-3 py-2.5 text-left">Tenant</th>
                  <th class="px-3 py-2.5 text-right">Amount</th>
                  <th class="px-3 py-2.5 text-left">Cycle</th>
                  <th class="px-3 py-2.5 text-left">Period</th>
                  <th class="px-3 py-2.5 text-center">Status</th>
                  <th class="px-3 py-2.5 text-right">View</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="r in rents" :key="r.id" class="hover:bg-slate-50 transition">
                  <td class="px-3 py-2.5 font-semibold text-slate-800">{{ r.property_id?.name || '—' }}</td>
                  <td class="px-3 py-2.5 text-slate-500">{{ r.user_id?.first_name }} {{ r.user_id?.last_name }}</td>
                  <td class="px-3 py-2.5 text-right font-black text-primary">${{ r.rent_amount }}</td>
                  <td class="px-3 py-2.5 text-slate-500 capitalize">{{ r.payment_cycle }}</td>
                  <td class="px-3 py-2.5 text-slate-400">{{ fmt(r.start_date) }} → {{ fmt(r.end_date) }}</td>
                  <td class="px-3 py-2.5 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase"
                      :class="r.status==='active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                      {{ r.status }}
                    </span>
                  </td>
                  <td class="px-3 py-2.5 text-right">
                    <button @click="$router.push({ name:'rent-detail', params:{ id: r.id } })" class="btn-action btn-blue"><i class="fas fa-eye"></i></button>
                  </td>
                </tr>
                <tr v-if="!rents.length && !busy.rents">
                  <td colspan="7" class="py-8 text-center text-slate-400 italic">No rent records found for this owner.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Rent Payments Tab ───────────────────────────────────────── -->
        <div v-if="activeTab === 'rent_payments'" class="p-5">
          <Loading :visible="busy.rentPayments" message="Loading rent payments..." />
          <div class="overflow-x-auto rounded-lg border border-slate-100">
            <table class="w-full text-xs">
              <thead class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <tr>
                  <th class="px-3 py-2.5 text-right">Amount</th>
                  <th class="px-3 py-2.5 text-left">Method</th>
                  <th class="px-3 py-2.5 text-left">Transaction</th>
                  <th class="px-3 py-2.5 text-left">Due Date</th>
                  <th class="px-3 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="p in rentPayments" :key="p.id" class="hover:bg-slate-50 transition">
                  <td class="px-3 py-2.5 text-right font-black text-slate-800">{{ p.amount }} ETB</td>
                  <td class="px-3 py-2.5 text-slate-500 uppercase">{{ p.payment_method || '—' }}</td>
                  <td class="px-3 py-2.5 font-mono text-slate-400 text-[10px]">{{ p.transaction_id || '—' }}</td>
                  <td class="px-3 py-2.5 text-slate-500">{{ fmt(p.due_date) }}</td>
                  <td class="px-3 py-2.5 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase"
                      :class="{
                        'bg-emerald-100 text-emerald-700': p.status==='paid'||p.status==='complete',
                        'bg-amber-100 text-amber-700': p.status==='pending',
                        'bg-rose-100 text-rose-700': p.status==='cancelled'
                      }">{{ p.status }}</span>
                  </td>
                </tr>
                <tr v-if="!rentPayments.length && !busy.rentPayments">
                  <td colspan="5" class="py-8 text-center text-slate-400 italic">No rent payment records found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Property Sales Tab ─────────────────────────────────────── -->
        <div v-if="activeTab === 'sales'" class="p-5">
          <Loading :visible="busy.sales" message="Loading property sales..." />
          <div class="overflow-x-auto rounded-lg border border-slate-100">
            <table class="w-full text-xs">
              <thead class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <tr>
                  <th class="px-3 py-2.5 text-left">Property / Zone</th>
                  <th class="px-3 py-2.5 text-right">Listing Price</th>
                  <th class="px-3 py-2.5 text-right">Selling Price</th>
                  <th class="px-3 py-2.5 text-left">Broker</th>
                  <th class="px-3 py-2.5 text-center">Status</th>
                  <th class="px-3 py-2.5 text-left">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="s in sales" :key="s.id" class="hover:bg-slate-50 transition">
                  <td class="px-3 py-2.5 font-semibold text-slate-800">
                    {{ s.property_id?.name || s.property_zone_id?.name || '—' }}
                  </td>
                  <td class="px-3 py-2.5 text-right text-slate-600">{{ currency(s.listing_price) }}</td>
                  <td class="px-3 py-2.5 text-right font-black text-emerald-600">{{ currency(s.selling_price) }}</td>
                  <td class="px-3 py-2.5 text-slate-500">{{ s.broker || '—' }}</td>
                  <td class="px-3 py-2.5 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase"
                      :class="s.status==='active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">
                      {{ s.status }}
                    </span>
                  </td>
                  <td class="px-3 py-2.5 text-slate-400">{{ fmt(s.created_at) }}</td>
                </tr>
                <tr v-if="!sales.length && !busy.sales">
                  <td colspan="6" class="py-8 text-center text-slate-400 italic">No property sales found for this owner.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Subscriptions Tab ──────────────────────────────────────── -->
        <div v-if="activeTab === 'subscriptions'" class="p-5">
          <Loading :visible="busy.subscriptions" message="Loading subscriptions..." />
          <div class="overflow-x-auto rounded-lg border border-slate-100">
            <table class="w-full text-xs">
              <thead class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <tr>
                  <th class="px-3 py-2.5 text-left">Plan</th>
                  <th class="px-3 py-2.5 text-right">Price</th>
                  <th class="px-3 py-2.5 text-left">Start Date</th>
                  <th class="px-3 py-2.5 text-left">End Date</th>
                  <th class="px-3 py-2.5 text-center">Status</th>
                  <th class="px-3 py-2.5 text-right">Payments</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="sub in subscriptions" :key="sub.id" class="hover:bg-slate-50 transition">
                  <td class="px-3 py-2.5 font-semibold text-slate-800">{{ sub.plan_name || '—' }}</td>
                  <td class="px-3 py-2.5 text-right font-black text-primary">{{ sub.price }}</td>
                  <td class="px-3 py-2.5 text-slate-500">{{ fmt(sub.start_date) }}</td>
                  <td class="px-3 py-2.5 text-slate-500">{{ fmt(sub.end_date) }}</td>
                  <td class="px-3 py-2.5 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase"
                      :class="{
                        'bg-green-100 text-green-700': sub.status==='active',
                        'bg-amber-100 text-amber-700': sub.status==='pending',
                        'bg-rose-100 text-rose-700': sub.status==='expired'||sub.status==='terminated'
                      }">{{ sub.status }}</span>
                  </td>
                  <td class="px-3 py-2.5 text-right">
                    <button @click="$router.push({ name:'subscriptionsPayment_view', params:{ id: sub.id } })"
                      class="btn-action btn-blue"><i class="fas fa-receipt"></i></button>
                  </td>
                </tr>
                <tr v-if="!subscriptions.length && !busy.subscriptions">
                  <td colspan="6" class="py-8 text-center text-slate-400 italic">No subscriptions found for this owner.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Subscription Payments Tab ──────────────────────────────── -->
        <div v-if="activeTab === 'sub_payments'" class="p-5">
          <Loading :visible="busy.subPayments" message="Loading subscription payments..." />
          <div class="overflow-x-auto rounded-lg border border-slate-100">
            <table class="w-full text-xs">
              <thead class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <tr>
                  <th class="px-3 py-2.5 text-left">Transaction Ref</th>
                  <th class="px-3 py-2.5 text-left">Plan</th>
                  <th class="px-3 py-2.5 text-right">Amount</th>
                  <th class="px-3 py-2.5 text-left">Method</th>
                  <th class="px-3 py-2.5 text-center">Status</th>
                  <th class="px-3 py-2.5 text-left">Valid Until</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="p in subPayments" :key="p.id" class="hover:bg-slate-50 transition">
                  <td class="px-3 py-2.5 font-mono text-[10px] text-slate-500">{{ p.transaction_id || '—' }}</td>
                  <td class="px-3 py-2.5 font-semibold text-slate-800">{{ p.planName || '—' }}</td>
                  <td class="px-3 py-2.5 text-right font-black text-primary">{{ p.amount }} ETB</td>
                  <td class="px-3 py-2.5 text-slate-500 uppercase">{{ p.payment_method || '—' }}</td>
                  <td class="px-3 py-2.5 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase"
                      :class="{
                        'bg-emerald-100 text-emerald-700': p.status==='paid',
                        'bg-amber-100 text-amber-700': p.status==='pending',
                        'bg-rose-100 text-rose-700': p.status==='canceled'
                      }">{{ p.status }}</span>
                  </td>
                  <td class="px-3 py-2.5 text-slate-400">{{ fmt(p.end_date) }}</td>
                </tr>
                <tr v-if="!subPayments.length && !busy.subPayments">
                  <td colspan="6" class="py-8 text-center text-slate-400 italic">No subscription payment records found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Maintenance Tab ────────────────────────────────────────── -->
        <div v-if="activeTab === 'maintenance'" class="p-5">
          <Loading :visible="busy.maintenance" message="Loading maintenance requests..." />
          <div class="overflow-x-auto rounded-lg border border-slate-100">
            <table class="w-full text-xs">
              <thead class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <tr>
                  <th class="px-3 py-2.5 text-left">Description</th>
                  <th class="px-3 py-2.5 text-left">Property</th>
                  <th class="px-3 py-2.5 text-left">Requested By</th>
                  <th class="px-3 py-2.5 text-left">Requested At</th>
                  <th class="px-3 py-2.5 text-center">Status</th>
                  <th class="px-3 py-2.5 text-left">Resolved At</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="m in maintenance" :key="m.id" class="hover:bg-slate-50 transition">
                  <td class="px-3 py-2.5 max-w-xs truncate text-slate-700 font-medium" :title="m.description">{{ m.description }}</td>
                  <td class="px-3 py-2.5 text-slate-500">{{ m.property_id?.name || '—' }}</td>
                  <td class="px-3 py-2.5 text-slate-500">
                    {{ [m.user_id?.first_name, m.user_id?.last_name].filter(Boolean).join(' ') || '—' }}
                  </td>
                  <td class="px-3 py-2.5 text-slate-400">{{ fmt(m.requested_at) }}</td>
                  <td class="px-3 py-2.5 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase"
                      :class="m.status==='pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'">
                      {{ m.status }}
                    </span>
                  </td>
                  <td class="px-3 py-2.5 text-slate-400">{{ m.resolved_at ? fmt(m.resolved_at) : '—' }}</td>
                </tr>
                <tr v-if="!maintenance.length && !busy.maintenance">
                  <td colspan="6" class="py-8 text-center text-slate-400 italic">No maintenance requests found for this owner.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div><!-- end tab card -->
    </div><!-- end v-if owner -->

    <!-- Not found -->
    <div v-if="!owner && !loading" class="flex flex-col items-center justify-center mt-24 text-slate-400">
      <i class="fas fa-user-slash text-5xl mb-4"></i>
      <p class="text-sm font-bold uppercase tracking-wider">Owner not found</p>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";

export default {
  name: "OwnerDetail",
  components: { Toast, Loading },

  data() {
    return {
      owner:         null,
      managers:      [],
      staffs:        [],
      zones:         [],
      properties:    [],
      rents:         [],
      rentPayments:  [],
      sales:         [],
      subscriptions: [],
      subPayments:   [],
      maintenance:   [],

      loading: false,
      busy: {
        managers: false, staffs: false, zones: false,
        properties: false, rents: false, rentPayments: false,
        sales: false, subscriptions: false, subPayments: false,
        maintenance: false,
      },
      activeTab: "managers",
    };
  },

  computed: {
    tabs() {
      return [
        { key: "managers",      label: "Managers",         icon: "fas fa-user-tie",      count: this.managers.length },
        { key: "staffs",        label: "Staffs",           icon: "fas fa-users",          count: this.staffs.length },
        { key: "zones",         label: "Zones",            icon: "fas fa-map",            count: this.zones.length },
        { key: "properties",    label: "Properties",       icon: "fas fa-building",       count: this.properties.length },
        { key: "rents",         label: "Rents",            icon: "fas fa-file-contract",  count: this.rents.length },
        { key: "rent_payments", label: "Rent Payments",    icon: "fas fa-coins",          count: this.rentPayments.length },
        { key: "sales",         label: "Property Sales",   icon: "fas fa-tags",           count: this.sales.length },
        { key: "subscriptions", label: "Subscriptions",    icon: "fas fa-layer-group",    count: this.subscriptions.length },
        { key: "sub_payments",  label: "Sub Payments",     icon: "fas fa-receipt",        count: this.subPayments.length },
        { key: "maintenance",   label: "Maintenance",      icon: "fas fa-screwdriver-wrench", count: this.maintenance.length },
      ];
    },
    kpis() {
      const activeRents  = this.rents.filter(r => r.status === 'active').length;
      const activeSubs   = this.subscriptions.filter(s => s.status === 'active').length;
      const pendingMaint = this.maintenance.filter(m => m.status === 'pending').length;
      const totalRentRev = this.rentPayments
        .filter(p => p.status === 'paid' || p.status === 'complete')
        .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
      return [
        { label: "Zones",         value: this.zones.length,        color: "text-primary",       sub: "registered" },
        { label: "Properties",    value: this.properties.length,   color: "text-blue-600",      sub: "units" },
        { label: "Active Rents",  value: activeRents,              color: "text-emerald-600",   sub: "active leases" },
        { label: "Sales",         value: this.sales.length,        color: "text-amber-600",     sub: "listed" },
        { label: "Active Plan",   value: activeSubs,               color: "text-purple-600",    sub: "subscription" },
        { label: "Rent Revenue",  value: this.currency(totalRentRev), color: "text-green-700",  sub: "paid payments" },
        { label: "Managers",      value: this.managers.length,     color: "text-slate-700",     sub: "assigned" },
        { label: "Staffs",        value: this.staffs.length,       color: "text-slate-700",     sub: "assigned" },
        { label: "Pending Maint", value: pendingMaint,             color: "text-rose-600",      sub: "open requests" },
        { label: "Sub Payments",  value: this.subPayments.length,  color: "text-indigo-600",    sub: "records" },
      ];
    },
  },

  async mounted() {
    const ownerId = this.$route.params.id;
    await this.loadOwner(ownerId);
    // fire everything in parallel
    this.loadManagers(ownerId);
    this.loadStaffs(ownerId);
    this.loadZones(ownerId);
    this.loadProperties(ownerId);
    this.loadRents(ownerId);
    this.loadRentPayments(ownerId);
    this.loadSales(ownerId);
    this.loadSubscriptions(ownerId);
    this.loadMaintenance(ownerId);
  },

  methods: {
    async loadOwner(id) {
      this.loading = true;
      try {
        const res  = await this.$apiGet("/get_owners", { page_size: 1000 });
        const list = res.owners || [];
        this.owner = list.find(o => String(o.id) === String(id)) || null;
        if (!this.owner) {
          const u = await this.$apiGetById("/get_user", id);
          this.owner = {
            id: u.id,
            full_name:   [u.first_name, u.middle_name, u.last_name].filter(Boolean).join(' '),
            email:       u.email,
            phoneNumber: u.phone_number,
            is_active:   u.is_active,
            date_joined: u.date_joined,
          };
        }
      } catch (e) { console.error(e); } finally { this.loading = false; }
    },

    async loadManagers(ownerId) {
      this.busy.managers = true;
      try {
        const res = await this.$apiGet("/get_owner_managers", { owner__id: ownerId, page_size: 1000 });
        this.managers = res.data || [];
      } catch (e) { this.managers = []; } finally { this.busy.managers = false; }
    },

    async loadStaffs(ownerId) {
      this.busy.staffs = true;
      try {
        const res = await this.$apiGet("/get_owner_staffs", { owner__id: ownerId, page_size: 1000 });
        this.staffs = Array.isArray(res.data) ? res.data : [];
      } catch (e) { this.staffs = []; } finally { this.busy.staffs = false; }
    },

    async loadZones(ownerId) {
      this.busy.zones = true;
      try {
        const res = await this.$apiGet("/get_property_zones", { as_owner: ownerId, page_size: 1000 });
        this.zones = res.data || [];
      } catch (e) { this.zones = []; } finally { this.busy.zones = false; }
    },

    async loadProperties(ownerId) {
      this.busy.properties = true;
      try {
        const res = await this.$apiGet("/get_properties", { as_owner: ownerId, page_size: 1000 });
        const list = res.data || [];
        // enrich zone names
        await Promise.all(list.map(async p => {
          try {
            if (p.property_zone_id) {
              const z = await this.$apiGetById("get_property_zone", p.property_zone_id);
              p.zoneName = z.name || '—';
            }
          } catch { p.zoneName = '—'; }
        }));
        this.properties = list;
      } catch (e) { this.properties = []; } finally { this.busy.properties = false; }
    },

    async loadRents(ownerId) {
      this.busy.rents = true;
      try {
        const res = await this.$apiGet("/get_rents", {
          as_owner: ownerId,
          page_size: 1000,
        });
        this.rents = res.data || [];
      } catch (e) { this.rents = []; } finally { this.busy.rents = false; }
    },

    async loadRentPayments(ownerId) {
      this.busy.rentPayments = true;
      try {
        const res = await this.$apiGet("/get_payments", {
          as_owner: ownerId,
          page_size: 1000,
        });
        this.rentPayments = res.data || [];
      } catch (e) { this.rentPayments = []; } finally { this.busy.rentPayments = false; }
    },

    async loadSales(ownerId) {
      this.busy.sales = true;
      try {
        const res = await this.$apiGet("/get_property_zone_sales", {
          as_owner: ownerId,
          page_size: 1000,
        });
        this.sales = res.data || [];
      } catch (e) { this.sales = []; } finally { this.busy.sales = false; }
    },

    async loadSubscriptions(ownerId) {
      this.busy.subscriptions = true;
      try {
        const res = await this.$apiGet("/get_subscription", {
          as_owner: ownerId,
          page_size: 1000,
        });
        this.subscriptions = res.data || [];
        // load sub payments after we know the subscription IDs
        this.loadSubPayments(ownerId);
      } catch (e) { this.subscriptions = []; this.busy.subPayments = false; } finally { this.busy.subscriptions = false; }
    },

    async loadSubPayments(ownerId) {
      this.busy.subPayments = true;
      try {
        const res = await this.$apiGet("/get_subscription_payment", {
          as_owner: ownerId,
          page_size: 1000,
        });
        const list = res.data || [];
        // enrich plan name
        await Promise.all(list.map(async p => {
          try {
            if (p.subscription_id) {
              const s = await this.$apiGetById("get_subscription", p.subscription_id);
              p.planName = s.plan_name || '—';
            }
          } catch { p.planName = '—'; }
        }));
        this.subPayments = list;
      } catch (e) { this.subPayments = []; } finally { this.busy.subPayments = false; }
    },

    async loadMaintenance(ownerId) {
      this.busy.maintenance = true;
      try {
        const res = await this.$apiGet("get_maintenance_requests", {
          as_owner: ownerId,
          page_size: 1000,
        });
        this.maintenance = res.data || [];
      } catch (e) { this.maintenance = []; } finally { this.busy.maintenance = false; }
    },

    initials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    },
    fmt(d) { return d ? new Date(d).toLocaleDateString() : '—'; },
    currency(v) {
      if (!v && v !== 0) return '—';
      const n = parseFloat(v);
      if (isNaN(n)) return v;
      return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    },
  },
};
</script>

<style scoped>
.btn-action { @apply h-7 w-7 flex items-center justify-center rounded-lg text-xs transition; }
.btn-blue   { @apply bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white; }
</style>
