<template>
  <section id="features" class="py-24 bg-white relative overflow-hidden">
    <div class="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none -z-10" 
         style="background-image: radial-gradient(var(--color-primary) 1px, transparent 1px); background-size: 40px 40px;">
    </div>

    <div class="max-w-7xl mx-auto px-6">
      
      <div class="max-w-3xl mx-auto text-center mb-20">
        <span class="inline-block px-4 py-1.5 mb-4 text-[10px] font-black tracking-[0.3em] text-primary bg-primary/10 rounded-full uppercase">
          Ecosystem Excellence
        </span>
        <h2 class="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
          Engineered for <span class="text-primary italic">Modern Real Estate</span>
        </h2>
        <p class="text-slate-500 text-lg font-medium leading-relaxed">
          More than just a management tool—Alpha PMS is a high-performance engine designed to automate your workflow, maximize your revenue, and delight your tenants.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        <div v-for="(feature, index) in features" :key="index"
          class="group relative bg-white border border-slate-100 p-8 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 overflow-hidden"
        >
          <div class="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-[3] transition-transform duration-700"></div>

          <div class="relative w-16 h-16 mb-8 flex items-center justify-center">
            <div class="absolute inset-0 bg-primary/10 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
            <div class="absolute inset-0 bg-primary/5 rounded-2xl -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
            <div class="relative w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <i :class="[feature.icon, 'text-2xl']"></i>
            </div>
          </div>

          <div class="relative z-10">
            <h3 class="text-xl font-black text-slate-800 mb-4 group-hover:text-primary transition-colors tracking-tight">
              {{ feature.title }}
            </h3>
            <p class="text-slate-500 text-sm leading-relaxed font-medium mb-6">
              {{ feature.description }}
            </p>
            
            <ul class="space-y-2">
              <li v-for="point in feature.points" :key="point" class="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <i class="fas fa-check text-secondary"></i> {{ point }}
              </li>
            </ul>
          </div>

          <div class="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
             <span class="text-xs font-black text-primary uppercase tracking-widest cursor-pointer">Explore Feature</span>
             <i class="fas fa-arrow-right text-xs text-primary"></i>
          </div>
        </div>

      </div>

 

    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      features: [
        {
          title: "Property Management",
          icon: "fas fa-building",
          description: "A centralized hub for residential, commercial, and coworking assets with automated unit tracking.",
          points: ["Multi-Unit Hierarchy", "Asset Maintenance", "Inventory Control"]
        },
        {
          title: "Intelligent Sales",
          icon: "fas fa-handshake",
          description: "Transform leads into residents with integrated CRM and commission disbursement engines.",
          points: ["Lead Pipeline", "Commission Calc", "Closing Automation"]
        },
        {
          title: "Lease & Rent Engine",
          icon: "fas fa-key",
          description: "Smart contracts with automated renewal alerts and dynamic billing for any lease structure.",
          points: ["Auto-Invoicing", "Escalation Logic", "Digital Signature"]
        },
        {
          title: "Predictive Analytics",
          icon: "fas fa-chart-pie",
          description: "Deep-dive financial reports and occupancy forecasting to maximize your NOI (Net Operating Income).",
          points: ["ROI Analysis", "Occupancy Rates", "Cash Flow Sync"]
        },
        {
          title: "Self-Service Portal",
          icon: "fas fa-user-astronaut",
          description: "Empower tenants with a 24/7 digital concierge for payments and maintenance requests.",
          points: ["Mobile Payments", "Ticket Tracking", "Document Access"]
        },
        {
          title: "Cloud Infrastructure",
          icon: "fas fa-cloud-bolt",
          description: "Enterprise-grade security and 99.9% uptime, accessible from any device, anywhere in the world.",
          points: ["Bank-Grade Encryption", "Real-time Sync", "Multi-Language"]
        }
      ],
      stats: [
        { label: "Active Units", value: "25,000+" },
        { label: "Revenue Managed", value: "$4.2M+" },
        { label: "Uptime SLA", value: "99.99%" },
        { label: "Daily Transactions", value: "12k+" }
      ]
    };
  }
};
</script>

<style scoped>
/* Smooth Transitions */
.group {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Feature link hover animation */
.group:hover .group-hover\:text-primary {
  color: var(--color-primary);
}
</style>