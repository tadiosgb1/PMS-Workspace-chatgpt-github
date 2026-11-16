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
                <input v-model.trim="form.company_name" required maxlength="150" placeholder="Company name" class="field" :class="{ 'field-error': errors.company_name }" />
                <p v-if="errors.company_name" class="validation-error">{{ errors.company_name }}</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">TIN Number</label>
                  <input v-model="form.tin_number" required inputmode="numeric" maxlength="10" placeholder="10-digit TIN number" class="field" :class="{ 'field-error': errors.tin_number }" />
                  <p v-if="errors.tin_number" class="validation-error">{{ errors.tin_number }}</p>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Business License</label>
                  <input v-model.trim="form.business_license" required maxlength="50" placeholder="Business license number" class="field" :class="{ 'field-error': errors.business_license }" />
                  <p v-if="errors.business_license" class="validation-error">{{ errors.business_license }}</p>
                </div>
              </div>

              <div class="rounded-md border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div class="space-y-1">
                  <p class="text-sm font-semibold text-slate-800">Does your company manage off-plan properties?</p>
                  <p class="text-xs text-slate-600">
                    Select this if your company develops or manages properties that are sold before construction is complete.
                    This helps us tailor your workspace to your business.
                  </p>
                </div>
                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    v-model="form.is_developer"
                    type="checkbox"
                    class="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm font-medium text-slate-700">
                    Yes, our company develops or manages off-plan properties.
                  </span>
                </label>
              </div>
            </template>

            <!-- ═══════════ STEP 2: Contact Person ═══════════ -->
            <template v-else-if="currentStep === 2">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">First Name</label>
                  <input v-model.trim="form.first_name" required maxlength="80" autocomplete="given-name" placeholder="First name" class="field" :class="{ 'field-error': errors.first_name }" />
                  <p v-if="errors.first_name" class="validation-error">{{ errors.first_name }}</p>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Middle Name</label>
                  <input v-model.trim="form.middle_name" maxlength="80" autocomplete="additional-name" placeholder="Middle name (optional)" class="field" :class="{ 'field-error': errors.middle_name }" />
                  <p v-if="errors.middle_name" class="validation-error">{{ errors.middle_name }}</p>
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
                    autocomplete="email"
                    maxlength="254"
                    :class="{ 'field-error': errors.email || emailExistsError }"
                  />
                  <p v-if="errors.email" class="validation-error">{{ errors.email }}</p>
                  <p v-if="emailExistsError" class="validation-error">{{ emailExistsError }}</p>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone Number</label>
                  <input
                    v-model="form.phone_number"
                    type="tel"
                    required
                    placeholder="+251912345678"
                    autocomplete="tel"
                    maxlength="25"
                    class="field"
                    :class="{ 'field-error': errors.phone_number }"
                  />
                  <p v-if="errors.phone_number" class="validation-error">{{ errors.phone_number }}</p>
                  <p class="text-[11px] text-slate-400">Include the country code, e.g. +251912345678.</p>
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
                    autocomplete="new-password"
                    maxlength="128"
                    class="field"
                    :class="{ 'field-error': errors.password }"
                  />
                  <ul class="mt-2 space-y-1 text-[11px]" :class="errors.password ? 'text-red-600' : 'text-slate-500'">
                    <li :class="{ 'text-green-600': passwordChecks.length }">• At least 8 characters</li>
                    <li :class="{ 'text-green-600': passwordChecks.upper }">• One uppercase letter (A–Z)</li>
                    <li :class="{ 'text-green-600': passwordChecks.lower }">• One lowercase letter (a–z)</li>
                    <li :class="{ 'text-green-600': passwordChecks.number }">• One number (0–9)</li>
                    <li :class="{ 'text-green-600': passwordChecks.special }">• One special character (e.g. !@#$%)</li>
                  </ul>
                  <p v-if="errors.password" class="validation-error">{{ errors.password }}</p>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Confirm Password</label>
                  <input
                    v-model="form.confirmPassword"
                    type="password"
                    required
                    placeholder="Repeat password"
                    class="field"
                    autocomplete="new-password"
                    maxlength="128"
                    class="field"
                    :class="{ 'field-error': errors.confirmPassword || passwordMismatch }"
                  />
                  <p v-if="errors.confirmPassword || passwordMismatch" class="validation-error">{{ errors.confirmPassword || 'Passwords do not match' }}</p>
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
        is_developer: false,
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
      errors: {},
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
        this.errors = {};
        this.passwordMismatch = false;
        this.emailExistsError = "";
      }
    },

    getPasswordChecks(password = "") {
      return {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9\\s]/.test(password),
      };
    },

    validateCompanyStep() {
      const errors = {};
      const companyName = this.form.company_name.trim();
      const tin = this.form.tin_number.trim();
      const license = this.form.business_license.trim();

      if (!companyName) errors.company_name = "Company name is required.";
      else if (companyName.length < 2) errors.company_name = "Company name must contain at least 2 characters.";
      else if (!/^[\\p{L}\\p{N}][\\p{L}\\p{N} .,'’&()\\-/]*$/u.test(companyName)) {
        errors.company_name = "Use letters, numbers, spaces and common business-name punctuation only.";
      }

      if (!/^\\d{10}$/.test(tin)) errors.tin_number = "TIN must contain exactly 10 digits (numbers only).";

      if (!license) errors.business_license = "Business license number is required.";
      else if (license.length < 2 || license.length > 50) errors.business_license = "Business license must be between 2 and 50 characters.";
      else if (!/^[\\p{L}\\p{N}][\\p{L}\\p{N} ._\\-/]*$/u.test(license)) {
        errors.business_license = "Use letters, numbers, spaces, dots, hyphens or slashes only.";
      }

      this.errors = errors;
      return Object.keys(errors).length === 0;
    },

    validateContactStep() {
      const errors = {};
      const firstName = this.form.first_name.trim();
      const middleName = this.form.middle_name.trim();
      const email = this.form.email.trim();
      const phone = this.form.phone_number.trim();
      const password = this.form.password;
      const checks = this.getPasswordChecks(password);

      const namePattern = /^[\\p{L}\\p{M}]+(?:[ '\\u2019-][\\p{L}\\p{M}]+)*$/u;
      if (!firstName) errors.first_name = "First name is required.";
      else if (firstName.length > 80 || !namePattern.test(firstName)) errors.first_name = "Enter a valid name using letters, spaces, apostrophes or hyphens.";

      if (middleName && (middleName.length > 80 || !namePattern.test(middleName))) {
        errors.middle_name = "Enter a valid middle name, or leave this field blank.";
      }

      const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/;
      if (!email) errors.email = "Email address is required.";
      else if (email.length > 254 || !emailPattern.test(email)) errors.email = "Enter a valid email address.";

      const phoneDigits = phone.replace(/\\D/g, "");
      if (!phone) errors.phone_number = "Phone number is required.";
      else if (!/^\\+[0-9().\\s-]+$/.test(phone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
        errors.phone_number = "Enter an international phone number with +country code and 7–15 digits.";
      }

      if (!password) errors.password = "Password is required.";
      else if (!checks.length || !checks.upper || !checks.lower || !checks.number || !checks.special || /\\s/.test(password)) {
        errors.password = "Password must be at least 8 characters and include uppercase, lowercase, a number and a special character, with no spaces.";
      }

      if (!this.form.confirmPassword) errors.confirmPassword = "Please confirm your password.";
      else if (password !== this.form.confirmPassword) errors.confirmPassword = "Passwords do not match.";

      this.errors = errors;
      this.passwordMismatch = Boolean(errors.confirmPassword && this.form.confirmPassword);
      return Object.keys(errors).length === 0;
    },

    handleFormAction() {
      if (this.currentStep === 1) {
        if (!this.validateCompanyStep()) return;
        this.currentStep = 2;
        this.errors = {};
        return;
      }
      this.submitForm();
    },

    async submitForm() {
      this.passwordMismatch = false;
      this.emailExistsError = "";

      // Revalidate both steps immediately before the API request.
      if (!this.validateCompanyStep()) {
        this.currentStep = 1;
        return;
      }
      if (!this.validateContactStep()) return;

      this.loading = true;
      try {
        const payload = {
          plan: this.form.plan,
          company_name: this.form.company_name.trim(),
          tin_number: this.form.tin_number.trim(),
          business_license: this.form.business_license.trim(),
          is_developer: this.form.is_developer,
          first_name: this.form.first_name.trim(),
          middle_name: this.form.middle_name.trim(),
          email: this.form.email.trim().toLowerCase(),
          phone_number: this.form.phone_number.trim(),
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
.field-error {
  @apply border-red-400 focus:border-red-400 focus:ring-red-300;
}
.validation-error {
  @apply text-xs font-medium text-red-600 mt-1;
}
</style>