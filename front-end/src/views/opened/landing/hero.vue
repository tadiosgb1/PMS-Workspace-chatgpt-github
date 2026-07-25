<template>
  <div class="relative overflow-hidden font-sans">
    <section
      id="hero"
      class="relative min-h-[90vh] flex flex-col justify-center items-center text-center bg-cover bg-center transition-all duration-[2000ms] ease-in-out"
      :style="{ backgroundImage: `url(${currentBg})` }"
    >
      <div class="absolute inset-0 bg-slate-900/60 z-0"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-primary/40 via-dprimary/80 to-slate-900 z-0"></div>

      <div class="relative z-10 space-y-8 px-6 max-w-5xl">
        
        <div class="flex justify-center animate-fade-in">
          <span class="text-white px-4 py-1 border border-white/20 rounded-full bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] text-secondary">
            The Future of Property Tech
          </span>
        </div>

        <h1 class="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.1] tracking-tight animate-slide-up">
          Alpha <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/80">Property Management</span>
        </h1>

        <div class="space-y-4 max-w-3xl mx-auto">
          <p class="text-lg sm:text-xl md:text-2xl text-white/90 font-medium leading-relaxed animate-fade-in-delayed">
            Smart, secure, and seamless solutions for managing your properties and assets with enterprise-grade precision.
          </p>
          <p class="text-sm sm:text-md md:text-lg text-white/60 font-medium tracking-wide animate-fade-in-delayed-more">
            Real-time monitoring • Financial tracking • Tenant intelligence
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-5 pt-4 animate-fade-in-delayed-more">
          <button 
            @click="showLogin()" 
            class="group relative bg-primary hover:bg-dprimary text-white font-black text-xs uppercase tracking-[0.2em] py-5 px-10 rounded-2xl shadow-2xl shadow-primary/40 transition-all duration-300 active:scale-95 overflow-hidden"
          >
            <span class="relative z-10 flex items-center gap-3">
              Get Started <i class="fas fa-chevron-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
            </span>
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>

          <button
            class="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-primary text-white font-black text-xs uppercase tracking-[0.2em] py-5 px-10 rounded-2xl transition-all duration-300 active:scale-95"
          >
            Explore Platform
          </button>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent z-0"></div>
    </section>
  </div>
</template>

<script>
import bg1 from "@/assets/img/hero/bg1.jpg";
import bg2 from "@/assets/img/hero/bg2.jpg";
import bg3 from "@/assets/img/hero/bg3.jpg";
import bg4 from "@/assets/img/hero/bg4.jpg";

export default {
  data() {
    return {
      bgImages: [bg1, bg2, bg3, bg4],
      currentBgIndex: 0,
      currentBg: "",
    };
  },
  mounted() {
    this.currentBg = this.bgImages[0];
    setInterval(() => {
      this.currentBgIndex = (this.currentBgIndex + 1) % this.bgImages.length;
      this.currentBg = this.bgImages[this.currentBgIndex];
    }, 8000);
  },
  methods: {
    showLogin() {
      this.$emit("openLogin");
    }
  }
};
</script>

<style scoped>
/* High-End Entrance Animations */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-slide-up {
  animation: slide-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  animation: fade-in 1.5s ease-out forwards;
}

.animate-fade-in-delayed {
  opacity: 0;
  animation: fade-in 1.5s ease-out 0.4s forwards;
}

.animate-fade-in-delayed-more {
  opacity: 0;
  animation: fade-in 1.5s ease-out 0.8s forwards;
}

/* Background transition duration is set in :style or the class */
#hero {
  background-blend-mode: overlay;
}
</style>