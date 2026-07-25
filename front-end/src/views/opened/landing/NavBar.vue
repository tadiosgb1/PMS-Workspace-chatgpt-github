<template>
  <header class="fixed top-0 left-0 right-0 z-50">

    <!-- Top utility bar -->
    <div class="bg-dprimary border-b border-white/10">
      <div class="max-w-7xl mx-auto px-6 flex items-center justify-between h-8">

        <!-- Left: contact snippets -->
        <div class="hidden md:flex items-center gap-5 text-white text-[11px] font-medium">
          <a href="tel:+251911000000" class="flex items-center gap-1.5 hover:text-white transition">
            <i class="fas fa-phone text-[9px]"></i>
            +251 911 000 000
          </a>
          <span class="w-px h-3 bg-white/20"></span>
          <a href="mailto:hello@alphapms.com" class="flex items-center gap-1.5 hover:text-white transition">
            <i class="fas fa-envelope text-[9px]"></i>
            hello@alphapms.com
          </a>
          <span class="w-px h-3 bg-white/20"></span>
          <span class="flex items-center gap-1.5">
            <i class="fas fa-clock text-[9px] text-white/40"></i>
            Mon – Fri, 8 AM – 6 PM
          </span>
        </div>

        <!-- Mobile: just email -->
        <a href="mailto:hello@alphapms.com" class="md:hidden flex items-center gap-1.5 text-white/60 hover:text-white text-[10px] transition">
          <i class="fas fa-envelope text-[9px]"></i>
          hello@alphapms.com
        </a>

        <!-- Right: social icons -->
        <div class="flex items-center gap-3">
          <a v-for="s in socials" :key="s.label" :href="s.href" target="_blank" rel="noopener"
            :title="s.label"
            class="w-5 h-5 flex items-center justify-center text-white hover:text-white transition text-[11px]">
            <i :class="s.icon"></i>
          </a>
        </div>

      </div>
    </div>

    <!-- Main nav bar -->
    <div class="bg-primary border-b border-white/10   bg-opacity-95 transition-all duration-500">
      <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-3 group">
          <div class="h-11 w-11 bg-white rounded-xl flex items-center justify-center shadow-inner transform group-hover:rotate-12 transition-transform duration-300">
            <img src="@/assets/img/logo1.jpg" alt="Alpha PMS" class="w-9 h-9 rounded-lg" />
          </div>
          <span class="text-xl font-black text-white tracking-tighter leading-none">ALPHA PMS</span>
        </router-link>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center space-x-8 text-white/90 text-sm font-bold uppercase tracking-widest">
          <a :href="homeHref"     @click.prevent="navigate('home')"     class="nav-link">Home</a>
          <a :href="featuresHref" @click.prevent="navigate('features')" class="nav-link">Features</a>
          <a :href="pricingHref"  @click.prevent="navigate('plans')"    class="nav-link">Pricing</a>
          <a :href="contactHref"  @click.prevent="navigate('contact')"  class="nav-link">Contact</a>
        </nav>

        <!-- Desktop right -->
        <div class="hidden md:flex items-center space-x-4">
          <div class="relative">
            <select
              v-model="selectedLang"
              class="appearance-none cursor-pointer bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest px-4 py-2 pr-8 rounded-xl border border-white/20 focus:outline-none transition-all"
            >
              <option value="en" class="text-slate-800">EN</option>
              <option value="am" class="text-slate-800">AM</option>
              <option value="ti" class="text-slate-800">TI</option>
            </select>
            <i class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-[10px] pointer-events-none"></i>
          </div>

          <router-link
            to="/login"
            class="flex items-center gap-2 px-6 py-2.5 font-black text-xs uppercase tracking-widest text-white bg-secondary rounded-xl hover:bg-opacity-90 active:scale-95 transition-all duration-300"
          >
            <i class="fas fa-lock text-[10px]"></i> Login
          </router-link>
        </div>

        <!-- Mobile hamburger -->
        <button @click="mobileOpen = !mobileOpen" class="md:hidden text-white text-2xl">
          <i class="fas" :class="mobileOpen ? 'fa-times' : 'fa-bars-staggered'"></i>
        </button>
      </div>

      <!-- Mobile menu -->
      <transition name="menu-slide">
        <div v-if="mobileOpen" class="md:hidden bg-dprimary border-t border-white/10 px-6 py-6 space-y-5">
          <nav class="flex flex-col space-y-4 text-white font-bold uppercase tracking-widest text-sm">
            <a :href="homeHref"     @click.prevent="navigate('home');     mobileOpen=false">Home</a>
            <a :href="featuresHref" @click.prevent="navigate('features'); mobileOpen=false">Features</a>
            <a :href="pricingHref"  @click.prevent="navigate('plans');    mobileOpen=false">Pricing</a>
            <a :href="contactHref"  @click.prevent="navigate('contact');  mobileOpen=false">Contact</a>
          </nav>

          <!-- Mobile social row -->
          <div class="flex items-center gap-4 pt-1 border-t border-white/10">
            <a v-for="s in socials" :key="s.label" :href="s.href" target="_blank" rel="noopener"
              class="text-white/50 hover:text-white transition text-sm">
              <i :class="s.icon"></i>
            </a>
          </div>

          <router-link
            to="/login"
            @click="mobileOpen = false"
            class="block w-full bg-white text-primary font-black py-3.5 rounded-xl text-center text-sm"
          >
             LOGIN
          </router-link>
        </div>
      </transition>
    </div>

  </header>
</template>

<script>
export default {
  name: "NavBar",
  data() {
    return {
      selectedLang: "en",
      mobileOpen: false,
      socials: [
        { label: "Facebook",  icon: "fab fa-facebook-f",  href: "#" },
        { label: "Twitter",   icon: "fab fa-twitter",     href: "#" },
        { label: "LinkedIn",  icon: "fab fa-linkedin-in", href: "#" },
        { label: "Instagram", icon: "fab fa-instagram",   href: "#" },
        { label: "YouTube",   icon: "fab fa-youtube",     href: "#" },
      ],
    };
  },
  computed: {
    isHome() {
      return this.$route.path === "/";
    },
    homeHref()     { return this.isHome ? "#home"     : "/#home"; },
    featuresHref() { return this.isHome ? "#features" : "/#features"; },
    pricingHref()  { return "/pricing"; },
    contactHref()  { return this.isHome ? "#contact"  : "/#contact"; },
  },
  methods: {
    navigate(section) {
      if (section === "plans") {
        this.$router.push("/pricing");
        return;
      }
      if (this.isHome) {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        this.$router.push({ path: "/", hash: `#${section}` });
      }
    },
  },
};
</script>

<style scoped>
.nav-link {
  @apply hover:text-white transition relative
         after:content-[''] after:absolute after:-bottom-1 after:left-0
         after:w-0 after:h-0.5 after:bg-secondary after:transition-all hover:after:w-full;
}

.menu-slide-enter-active,
.menu-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.menu-slide-enter-from,
.menu-slide-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>
