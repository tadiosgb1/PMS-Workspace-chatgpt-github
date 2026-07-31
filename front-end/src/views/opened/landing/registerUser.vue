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
                  <input v-model="form.contact_person.first_name" required placeholder="First name" class="field" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Middle Name</label>
                  <input v-model="form.contact_person.middle_name" placeholder="Middle name" class="field" />
                </div>
              </div>

              

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
                  <input
                    v-model="form.contact_person.email"
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
                    v-model="form.contact_person.phone_number"
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
                    v-model="form.contact_person.password"
                    type="password"
                    required
                    placeholder="Create a password"
                    class="field"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Confirm Password</label>
                  <input
                    v-model="form.contact_person.confirmPassword"
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

    <!-- ── OTP Verification Modal ─────────────────────────────────────── -->
    <transition name="fade">
      <div
        v-if="showOtpModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-sm p-8 space-y-6 relative">

          <!-- Close button -->
          <button
            @click="closeOtpModal"
            class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            <i class="fas fa-times text-base"></i>
          </button>

          <!-- ── Success state ── -->
          <template v-if="otpVerified">
            <div class="text-center space-y-4 py-2">
              <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
                <i class="fas fa-check-circle text-green-600 text-2xl"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900">Account Verified!</h3>
                <p class="text-xs text-slate-500 mt-1">Your phone number has been verified successfully.</p>
              </div>
              <router-link
                to="/login"
                class="inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded font-semibold text-sm transition-all duration-150"
              >
                Go to Login
                <i class="fas fa-arrow-right text-xs"></i>
              </router-link>
            </div>
          </template>

          <!-- ── OTP entry state ── -->
          <template v-else>
            <!-- Header -->
            <div class="text-center space-y-1">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-2">
                <i class="fas fa-mobile-alt text-slate-700 text-lg"></i>
              </div>
              <h3 class="text-lg font-bold text-slate-900">Verify Your Phone</h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                We sent a one-time code to<br />
                <span class="font-semibold text-slate-700">{{ form.contact_person.phone_number }}</span>
              </p>
            </div>

            <!-- OTP input -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">OTP Code</label>
              <input
                v-model="otpCode"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="Enter 6-digit code"
                class="field text-center tracking-[0.3em] text-lg font-semibold"
                :class="{ 'border-red-400 focus:border-red-400 focus:ring-red-300': otpError }"
                @input="otpError = ''"
              />
              <p v-if="otpError" class="text-xs font-medium text-red-600">{{ otpError }}</p>
            </div>

            <!-- Verify button -->
            <button
              @click="verifyOtp"
              :disabled="verifyLoading || !otpCode"
              class="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded font-semibold text-sm transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <div v-if="verifyLoading" class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              {{ verifyLoading ? 'Verifying...' : 'Verify & Continue' }}
            </button>

            <!-- Resend row -->
            <div class="text-center text-xs text-slate-500">
              Didn't receive a code?
              <button
                @click="resendOtp"
                :disabled="resendLoading || resendCooldown > 0"
                class="ml-1 font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
              >
                <span v-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
                <span v-else-if="resendLoading">Sending...</span>
                <span v-else>Resend OTP</span>
              </button>
            </div>
          </template>

        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import axios from "axios";
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
        contact_person: {
          first_name: "",
          middle_name: "",
          email: "",
          phone_number: "",
          password: "",
          confirmPassword: "",
        },
      },
      selectedPlanName: "",
      passwordMismatch: false,
      emailExistsError: "",
      loading: false,

      // OTP modal state
      showOtpModal: false,
      otpVerified: false,
      otpCode: "",
      otpError: "",
      verifyLoading: false,
      resendLoading: false,
      resendCooldown: 0,
      resendTimer: null,
    };
  },
  created() {
    const { plan, name } = this.$route.query;
    if (plan) {
      this.form.plan = plan;
      this.selectedPlanName = name || "";
    }
  },
  beforeUnmount() {
    if (this.resendTimer) clearInterval(this.resendTimer);
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
        // Validate company fields (HTML required handles most; just advance)
        this.currentStep = 2;
        return;
      }
      // Step 2 → submit
      this.submitForm();
    },

    // ── Step 1: Register ──────────────────────────────────────────────
    async submitForm() {
      this.passwordMismatch = false;
      this.emailExistsError = "";

      if (this.form.contact_person.password !== this.form.contact_person.confirmPassword) {
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
          contact_person: {
            first_name: this.form.contact_person.first_name,
            middle_name: this.form.contact_person.middle_name,
            last_name: this.form.contact_person.last_name,
            email: this.form.contact_person.email,
            phone_number: this.form.contact_person.phone_number,
            password: this.form.contact_person.password,
          },
        };

        const response = this.$apiPost("sign_up", payload);

        if (response) {
          // Registration succeeded — send OTP then open modal
          await this.sendOtp();
          this.showOtpModal = true;
          this.startResendCooldown();
        }
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

    // ── Step 2a: Send / Resend OTP ────────────────────────────────────
    async sendOtp() {
      const payload = { phone_number: this.form.contact_person.phone_number };
      await this.$apiPost("resend_otp", payload);
    },

    async resendOtp() {
      this.resendLoading = true;
      this.otpError = "";
      try {
        await this.sendOtp();
        this.startResendCooldown();
      } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.message;
        this.otpError = msg || "Could not resend OTP. Please try again.";
      } finally {
        this.resendLoading = false;
      }
    },

    // ── Step 2b: Verify OTP ───────────────────────────────────────────
    async verifyOtp() {
      if (!this.otpCode.trim()) {
        this.otpError = "Please enter the OTP code.";
        return;
      }

      this.verifyLoading = true;
      this.otpError = "";
      try {
        const payload = {
          phone_number: this.form.contact_person.phone_number,
          otp_code: this.otpCode.trim(),
        };
        await this.$apiPost("verify_otp", payload);

        // Show success state inside the modal
        this.otpVerified = true;
        if (this.resendTimer) clearInterval(this.resendTimer);
      } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.message;
        this.otpError = msg || "Invalid OTP code. Please try again.";
      } finally {
        this.verifyLoading = false;
      }
    },

    // ── Close modal ───────────────────────────────────────────────────
    closeOtpModal() {
      this.showOtpModal = false;
      this.otpCode = "";
      this.otpError = "";
      this.otpVerified = false;
      if (this.resendTimer) clearInterval(this.resendTimer);
      this.resendCooldown = 0;
    },

    // ── Cooldown timer ────────────────────────────────────────────────
    startResendCooldown(seconds = 60) {
      if (this.resendTimer) clearInterval(this.resendTimer);
      this.resendCooldown = seconds;
      this.resendTimer = setInterval(() => {
        this.resendCooldown -= 1;
        if (this.resendCooldown <= 0) {
          clearInterval(this.resendTimer);
          this.resendTimer = null;
        }
      }, 1000);
    },
  },
};
</script>

<style scoped>
.field {
  @apply w-full bg-white border border-slate-300 rounded py-2.5 px-3 text-sm text-slate-800
         placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>