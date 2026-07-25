<template>
  <div class="min-h-screen bg-slate-50 font-sans selection:bg-primary/30">

    <NavBar />

    <!-- Spacer — compensates for the fixed navbar height -->
    <div class="h-24"></div>

    <div id="home">
      <Hero @openLogin="$router.push('/login')" />
    </div>

    <div id="features" class="bg-white py-10">
      <Features />
    </div>

    <PropertiesSection />

    <Fqs/>

    <div id="contact">
      <ContactUs />
    </div>

    <Footer />

    <!-- Floating scroll-to-top -->
    <transition name="fade-up">
      <button
        v-if="showScrollTop"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 z-50 w-10 h-10 bg-primary hover:bg-dprimary text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95"
        aria-label="Scroll to top"
      >
        <i class="fas fa-chevron-up text-xs"></i>
      </button>
    </transition>
  </div>
</template>

<script>
import NavBar from "./NavBar.vue";
import Hero from "./hero.vue";
import Features from "./features.vue";
import PropertiesSection from "./PropertiesSection.vue";
import Fqs from "./fqs.vue";
import ContactUs from "./contactUs.vue";
import Footer from "./footer.vue";

export default {
  name: "HomePage",
  components: {
    NavBar,
    Hero,
    Features,
    PropertiesSection,
    Fqs,
    ContactUs,
    Footer,
  },
  data() {
    return {
      showScrollTop: false,
    };
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      this.showScrollTop = window.scrollY > 400;
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  },
};
</script>

<style scoped>
::selection {
  background: var(--color-primary);
  color: white;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
