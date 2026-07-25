<template>
  <section class="bg-white border-t border-slate-100 py-20 px-6">
    <Toast ref="toast" />

    <div class="max-w-5xl mx-auto">

      <!-- Section heading -->
      <div class="mb-12">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Get In Touch</p>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Contact Us</h2>
        <p class="text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
          Have a question or want to learn more? Our team is ready to help you get started.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Contact info column -->
        <div class="space-y-6">

          <div v-for="info in contactInfo" :key="info.label" class="flex items-start gap-4">
            <div class="w-9 h-9 rounded border border-slate-200 flex items-center justify-center shrink-0">
              <i :class="info.icon" class="text-primary text-xs"></i>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{{ info.label }}</p>
              <p class="text-sm font-semibold text-slate-700">{{ info.value }}</p>
            </div>
          </div>

          <!-- Social links -->
          <div class="pt-4 border-t border-slate-100">
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Follow Us</p>
            <div class="flex items-center gap-3">
              <a href="#" class="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all">
                <i class="fab fa-linkedin-in text-xs"></i>
              </a>
              <a href="#" class="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all">
                <i class="fab fa-twitter text-xs"></i>
              </a>
              <a href="#" class="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all">
                <i class="fab fa-instagram text-xs"></i>
              </a>
              <a href="#" class="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all">
                <i class="fab fa-facebook-f text-xs"></i>
              </a>
            </div>
          </div>

        </div>

        <!-- Form column -->
        <div class="lg:col-span-2 bg-slate-50 border border-slate-100 rounded-md p-8">
          <form @submit.prevent="submitForm" class="space-y-5">

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  v-model="form.full_name"
                  required
                  placeholder="Your full name"
                  class="field"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  v-model="form.email"
                  required
                  placeholder="you@example.com"
                  class="field"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Subject</label>
              <input
                type="text"
                v-model="form.subject"
                placeholder="What are you interested in?"
                class="field"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Message</label>
              <textarea
                v-model="form.message"
                rows="4"
                placeholder="Write your message here..."
                class="field resize-none"
              ></textarea>
            </div>

            <div class="flex items-center justify-between gap-4 pt-1">
              <p class="text-xs text-slate-400">
                By sending, you agree to our
                <a href="#" class="text-primary hover:underline">privacy policy</a>.
              </p>
              <button
                type="submit"
                :disabled="loading"
                class="shrink-0 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all duration-150 active:bg-slate-950 disabled:opacity-60"
              >
                <div v-if="loading" class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <i v-else class="fas fa-paper-plane text-[10px]"></i>
                {{ loading ? 'Sending...' : 'Send Message' }}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  </section>
</template>

<script>
import Toast from "../../../components/Toast.vue";
import axios from "axios";

export default {
  name: "ContactUs",
  components: { Toast },
  data() {
    return {
      loading: false,
      contactInfo: [
        { label: "Address", value: "Sur Constraction, HO, B2-03", icon: "fas fa-map-marker-alt" },
        { label: "Email",   value: "alphaengineering41@gmail.com", icon: "fas fa-envelope" },
        { label: "Phone",   value: "0922 421 141", icon: "fas fa-phone" },
      ],
      form: {
        full_name: "",
        email: "",
        subject: "",
        message: "",
      },
    };
  },
  methods: {
    async submitForm() {
      this.loading = true;
      try {
        const response = await axios.post(
          "https://alphapms.sunriseworld.org/api/contact_us",
          { ...this.form }
        );
        this.$root.$refs.toast.showToast(
          response.data.success || "Message sent successfully!",
          "success"
        );
        this.form = { full_name: "", email: "", subject: "", message: "" };
      } catch {
        this.$root.$refs.toast.showToast("Connection error. Please try again.", "error");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.field {
  @apply w-full bg-white border border-slate-300 rounded py-2.5 px-3 text-sm text-slate-800
         placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all;
}
</style>
