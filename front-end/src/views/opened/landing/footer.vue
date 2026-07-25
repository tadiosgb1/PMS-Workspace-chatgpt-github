<template>
  <footer class="relative bg-primary text-white pt-20 pb-10 px-6 overflow-hidden">
    
    <div class="absolute top-0 left-0 w-full h-1 bg-white/10"></div>
    <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 relative z-10">
      
      <div class="md:col-span-2 space-y-6">
        <div class="flex items-center space-x-3">
           <div class="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <img src="@/assets/img/logo1.jpg" alt="Alpha PMS" class="w-8 h-8 rounded-lg" />
           </div>
           <span class="text-2xl font-black tracking-tighter">ALPHA PMS</span>
        </div>
        
        <p class="text-white/70 text-sm leading-relaxed max-w-sm font-medium">
          A comprehensive ecosystem designed to bridge the gap between property owners and modern management technology. Scalable, secure, and built for growth.
        </p>

        <div class="flex space-x-5 mt-6">
          <a v-for="icon in socials" :key="icon.name" href="#" 
             class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all duration-300 group">
            <i :class="[icon.class, 'text-lg group-hover:text-white transition-colors']"></i>
          </a>
        </div>
      </div>

      <div v-for="group in navGroups" :key="group.title">
        <h3 class="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">{{ group.title }}</h3>
        <ul class="space-y-4">
          <li v-for="link in group.links" :key="link">
            <a href="#" class="text-sm text-white/60 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
              {{ link }}
            </a>
          </li>
        </ul>
      </div>

    </div>

    <div class="mt-20 border-t border-white/10 pt-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
      <div class="text-xs font-bold text-white/40 uppercase tracking-widest">
        © {{ new Date().getFullYear() }} Alpha Property Management Suite.
      </div>
      
      <div class="flex gap-8 mt-6 md:mt-0 text-[11px] font-black uppercase tracking-widest">
        <a href="#" class="text-white/40 hover:text-secondary transition-colors">Terms of Service</a>
        <a href="#" class="text-white/40 hover:text-secondary transition-colors">Privacy Policy</a>
        <a href="#" class="text-white/40 hover:text-secondary transition-colors">Security</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
const socials = [
  { name: 'Twitter', class: 'fab fa-twitter' },
  { name: 'LinkedIn', class: 'fab fa-linkedin-in' },
  { name: 'Facebook', class: 'fab fa-facebook-f' },
  { name: 'Instagram', class: 'fab fa-instagram' }
];

const navGroups = [
  {
    title: 'Product',
    links: ['Core Features', 'Global Pricing', 'Integrations', 'System Roadmap']
  },
  {
    title: 'Company',
    links: ['Our Story', 'Careers', 'Latest Blog', 'Channel Partners']
  },
  {
    title: 'Support',
    links: ['Knowledge Base', 'Direct Contact', 'Service Status', 'Platform FAQs']
  }
];
</script>

<style scoped>
/* Optional: Adds a very subtle glass texture to the footer */
footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}
</style>