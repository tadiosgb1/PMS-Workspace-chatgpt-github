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
          </div>

          <form @submit.prevent="submitForm" class="space-y-5">

            <!-- Name row -->
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

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Last Name</label>
              <input v-model="form.last_name" required placeholder="Family name" class="field" />
            </div>

            <!-- Contact row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
                <div class="relative group">
                  <i class="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs group-focus-within:text-primary transition-colors"></i>
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    class="field pl-9"
                    :class="{ 'border-red-400 focus:border-red-400 focus:ring-red-300': emailExistsError }"
                  />
                </div>
                <p v-if="emailExistsError" class="text-xs font-medium text-red-600">{{ emailExistsError }}</p>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone Number</label>
                <div class="relative group">
                  <i class="fas fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs group-focus-within:text-primary transition-colors"></i>
                  <input v-model="form.phone_number" type="tel" required placeholder="+251..." class="field pl-9" />
                </div>
              </div>
            </div>

            <!-- Password row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                <div class="relative group">
                  <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs group-focus-within:text-primary transition-colors"></i>
                  <input v-model="form.password" type="password" required placeholder="Create a password" class="field pl-9" />
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Confirm Password</label>
                <div class="relative group">
                  <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs group-focus-within:text-primary transition-colors"></i>
                  <input
                    v-model="form.confirmPassword"
                    type="password"
                    required
                    placeholder="Repeat password"
                    class="field pl-9"
                    :class="{ 'border-red-400 focus:border-red-400 focus:ring-red-300': passwordMismatch }"
                  />
                </div>
                <p v-if="passwordMismatch" class="text-xs font-medium text-red-600">Passwords do not match</p>
              </div>
            </div>

            <!-- Membership dates -->
            <div class="border border-slate-100 rounded p-5 bg-slate-50">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Membership Period</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Start Date</label>
                  <input v-model="form.start_date" type="date" class="field" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">End Date</label>
                  <input v-model="form.end_date" type="date" class="field" />
                </div>
              </div>
            </div>

            <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <p class="text-xs text-slate-500">
                Already have an account?
                <router-link to="/login" class="text-primary font-medium hover:underline ml-1">Sign in</router-link>
              </p>
              <button
                type="submit"
                :disabled="loading"
                class="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded font-semibold text-sm transition-all duration-150 active:bg-slate-950 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <div v-if="loading" class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                {{ loading ? 'Creating Account...' : 'Complete Registration' }}
                <i v-if="!loading" class="fas fa-arrow-right text-xs"></i>
              </button>
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
                <span class="font-semibold text-slate-700">{{ form.phone_number }}</span>
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
      form: {
        plan: null,
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        start_date: "",
        end_date: "",
        password: "",
        confirmPassword: "",
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
    // ── Step 1: Register ──────────────────────────────────────────────
    async submitForm() {
      this.passwordMismatch = false;
      this.emailExistsError = "";

      if (this.form.password !== this.form.confirmPassword) {
        this.passwordMismatch = true;
        return;
      }

      this.loading = true;
      try {
        const payload = { ...this.form };
        delete payload.confirmPassword;
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
      const payload = { phone_number: this.form.phone_number };
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
          phone_number: this.form.phone_number,
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
