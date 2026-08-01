<template>
  <div class="min-h-screen flex flex-col bg-slate-100">
    <NavBar />

    <div class="h-24"></div>

    <div class="flex-1 flex items-center justify-center px-4 py-16">
      <div class="bg-white border border-slate-200 rounded-md w-full max-w-2xl">
        <div class="p-8 md:p-10">

          <div class="mb-8 border-b border-slate-100 pb-4">
            <h2 class="text-xl font-bold text-slate-900 tracking-tight">Create Account</h2>
            <p class="text-xs font-medium text-slate-500 mt-1">
              Setting up your Alpha PMS subscription
              <span v-if="selectedPlanName" class="ml-1">— <span class="text-primary font-semibold">{{ selectedPlanName }}</span></span>
            </p>
            <!-- Step indicator -->
            <div class="flex items-center gap-2 mt-4">
              <div
                class="flex items-center gap-1.5"
                :class="currentStep === 1 ? 'text-primary' : 'text-slate-400'"
              >
                <span
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border"
                  :class="currentStep === 1 ? 'bg-primary text-white border-primary' : 'bg-slate-100 border-slate-300'"
                >1</span>
                <span class="text-xs font-semibold uppercase tracking-wider">Company</span>
              </div>
              <div class="flex-1 h-px bg-slate-200"></div>
              <div
                class="flex items-center gap-1.5"
                :class="currentStep === 2 ? 'text-primary' : 'text-slate-400'"
              >
                <span
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border"
                  :class="currentStep === 2 ? 'bg-primary text-white border-primary' : 'bg-slate-100 border-slate-300'"
                >2</span>
                <span class="text-xs font-semibold uppercase tracking-wider">Contact Person</span>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleFormAction" class="space-y-5">

            <!-- ═══════════ STEP 1: Company Info ═══════════ -->
            <template v-if="currentStep === 1">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Company Name</label>
                <input v-model="form.company_name" required placeholder="Company name" class="field" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">TIN Number</label>
                  <input v-model="form.tin_number" required placeholder="TIN number" class="field" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Business License</label>
                  <input v-model="form.business_license" required placeholder="Business license number" class="field" />
                </div>
              </div>
            </template>

            <!-- ═══════════ STEP 2: Contact Person ═══════════ -->
            <template v-else-if="currentStep === 2">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">First Name</label>
                  <input v-model="form.first_name" required placeholder="First name" class="field" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Middle Name</label>
                  <input v-model="form.middle_name" placeholder="Middle name" class="field" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    class="field"
                    :class="{ 'border-red-400 focus:border-red-400 focus:ring-red-300': emailExistsError }"
                  />
                  <p v-if="emailExistsError" class="text-xs font-medium text-red-600">{{ emailExistsError }}</p>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone Number</label>
                  <input
                    v-model="form.phone_number"
                    type="tel"
                    required
                    placeholder="+251..."
                    class="field"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                  <input
                    v-model="form.password"
                    type="password"
                    required
                    placeholder="Create a password"
                    class="field"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Confirm Password</label>
                  <input
                    v-model="form.confirmPassword"
                    type="password"
                    required
                    placeholder="Repeat password"
                    class="field"
                    :class="{ 'border-red-400 focus:border-red-400 focus:ring-red-300': passwordMismatch }"
                  />
                  <p v-if="passwordMismatch" class="text-xs font-medium text-red-600">Passwords do not match</p>
                </div>
              </div>
            </template>

            <!-- Navigation buttons -->
            <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <p class="text-xs text-slate-500">
                Already have an account?
                <router-link to="/login" class="text-primary font-medium hover:underline ml-1">Sign in</router-link>
              </p>

              <div class="flex items-center gap-3 w-full sm:w-auto">
                <button
                  v-if="currentStep > 1"
                  type="button"
                  @click="goBack"
                  class="w-full sm:w-auto border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded font-semibold text-sm transition-all duration-150"
                >
                  Back
                </button>

                <button
                  type="submit"
                  :disabled="loading"
                  class="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded font-semibold text-sm transition-all duration-150 active:bg-slate-950 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <div v-if="loading" class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <template v-if="currentStep === 1">
                    Next
                  </template>
                  <template v-else>
                    {{ loading ? 'Creating Account...' : 'Complete Registration' }}
                  </template>
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>

    <LandingFooter />
  </div>
</template>

<script>
import NavBar from "./NavBar.vue";
import LandingFooter from "./footer.vue";

export default {
  name: "RegisterPage",
  components: { NavBar, LandingFooter },
  data() {
    return {
      currentStep: 1,
      form: {
        plan: null,
        company_name: "",
        tin_number: "",
        business_license: "",
        first_name: "",
        middle_name: "",
        email: "",
        phone_number: "",
        password: "",
        confirmPassword: "",
      },
      selectedPlanName: "",
      passwordMismatch: false,
      emailExistsError: "",
      loading: false,
    };
  },
  created() {
    const { plan, name } = this.$route.query;
    if (plan) {
      this.form.plan = plan;
      this.selectedPlanName = name || "";
    }
  },
  methods: {
    goBack() {
      if (this.currentStep > 1) {
        this.currentStep -= 1;
        this.passwordMismatch = false;
        this.emailExistsError = "";
      }
    },

    handleFormAction() {
      if (this.currentStep === 1) {
        this.currentStep = 2;
        return;
      }
      this.submitForm();
    },

    async submitForm() {
      this.passwordMismatch = false;
      this.emailExistsError = "";

      if (this.form.password !== this.form.confirmPassword) {
        this.passwordMismatch = true;
        return;
      }

      this.loading = true;
      try {
        const payload = {
          plan: this.form.plan,
          company_name: this.form.company_name,
          tin_number: this.form.tin_number,
          business_license: this.form.business_license,
          first_name: this.form.first_name,
          middle_name: this.form.middle_name,
          email: this.form.email,
          phone_number: this.form.phone_number,
          password: this.form.password,
        };

        await this.$apiPost("sign_up", payload);

        // Registration succeeded
        alert("Account created successfully! You can now log in.");
        this.$router.push("/login");
      } catch (error) {
        const errorMsg = error.response?.data?.error;
        if (errorMsg === "This email already exists in the system") {
          this.emailExistsError = errorMsg;
        } else {
          alert(errorMsg || "Registration failed. Please try again.");
        }
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