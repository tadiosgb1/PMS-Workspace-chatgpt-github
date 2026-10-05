<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 px-4">
    <div class="w-full max-w-md py-16">
      <Toast ref="toast" />

      <div class="bg-white border border-slate-200 rounded-md w-full max-w-md">
        <div class="p-8 md:p-10">

          <div class="mb-8 border-b border-slate-100 pb-4">
            <h2 class="text-xl font-bold text-slate-900 tracking-tight">Account Sign In</h2>
            <p class="text-xs font-medium text-slate-500 mt-1">Access your enterprise dashboard</p>
          </div>

          <form @submit.prevent="login" autocomplete="off" class="space-y-5">

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone Number</label>
              <div class="relative group">
                <i class="fas fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs group-focus-within:text-primary transition-colors"></i>
                <input
                  type="tel"
                  autocomplete="off"
                  v-model="form.phone_number"
                  required
                  placeholder="Enter your phone number"
                  class="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                <router-link to="/forgot-password" class="text-xs font-medium text-primary hover:underline">Forgot Password?</router-link>
              </div>
              <div class="relative group">
                <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs group-focus-within:text-primary transition-colors"></i>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  required
                  autocomplete="new-password"
                  placeholder="Enter your password"
                  class="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm text-slate-800 placeholder:text-slate-400"
                />
                <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-xs"></i>
                </button>
              </div>
            </div>

            <transition name="error-shake">
              <div v-if="error" class="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded border border-red-200">
                <i class="fas fa-exclamation-circle text-xs"></i>
                <p class="text-xs font-medium leading-tight">{{ error }}</p>
              </div>
            </transition>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded font-semibold text-sm transition-all duration-150 active:bg-slate-950 disabled:opacity-60"
            >
              <span v-if="!loading" class="flex items-center justify-center gap-2">
                Sign In <i class="fas fa-arrow-right text-xs"></i>
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <div class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Authenticating...
              </span>
            </button>
          </form>

          <div class="mt-8 pt-5 border-t border-slate-100 text-center">
            <p class="text-sm text-slate-600">
              Don't have an account?
              <router-link to="/pricing" class="text-primary font-medium hover:underline ml-1">Create Account</router-link>
            </p>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script>
import Toast from "../../../components/Toast.vue";

export default {
  name: "LoginPage",
  components: { Toast },
  data() {
    return {
      form: { phone_number: "", password: "" },
      error: "",
      loading: false,
      showPassword: false,
    };
  },
  methods: {
    async login() {
      this.error = "";
      this.loading = true;
      try {
        const response = await this.$apiPost("/token", this.form);
        const {
          refresh,
          access,
          permissions,
          id,
          is_superuser,
          phone_number,
          groups,
          role,
        } = response;

        // Admin access is restricted to the admin application.
        // Development:
        //   - port 3000 = admin application
        //   - port 3001 = property application
        // Production:
        //   - adminproperty.alpha.com.et = admin application
        //   - property.alpha.com.et = property application
        const normalizedGroups = Array.isArray(groups)
          ? groups
              .map((group) => {
                if (typeof group === "string") return group;
                return group?.name || group?.group || group?.role || "";
              })
              .map((group) => String(group).trim().toLowerCase())
              .filter(Boolean)
          : [];

        const normalizedRole = String(
          typeof role === "string" ? role : role?.name || role?.group || ""
        )
          .trim()
          .toLowerCase();

        const isSuperuser =
          is_superuser === true ||
          String(is_superuser).toLowerCase() === "true";

        const isAdminUser =
          isSuperuser ||
          ["admin", "superuser", "super_staff"].some(
            (adminRole) =>
              normalizedRole === adminRole ||
              normalizedGroups.includes(adminRole)
          );

        const hostname = window.location.hostname;
        const port = window.location.port;

        const isAdminProductionDomain =
          hostname === "adminproperty.alpha.com.et";
        const isPropertyProductionDomain =
          hostname === "property.alpha.com.et";

        const isAdminDevelopmentPort = port === "3000";
        const isPropertyDevelopmentPort = port === "3001";

        let allowed = false;

        if (isAdminProductionDomain) {
          allowed = isAdminUser;
        } else if (isPropertyProductionDomain) {
          allowed = !isAdminUser;
        } else if (isAdminDevelopmentPort) {
          allowed = isAdminUser;
        } else if (isPropertyDevelopmentPort) {
          allowed = !isAdminUser;
        }

        if (!allowed) {
          this.error = "You have no permission to login from this domain.";
          return;
        }

        // Store the session only after the domain/role check succeeds.
        localStorage.setItem("refresh", refresh);
        localStorage.setItem("access", access);
        localStorage.setItem("lastActivityAt", String(Date.now()));
        localStorage.removeItem("pmsTabClosed");
        localStorage.setItem("permissions", JSON.stringify(permissions));
        localStorage.setItem("groups", JSON.stringify(groups));
        localStorage.setItem("userId", id);
        localStorage.setItem("is_superuser", is_superuser);
        localStorage.setItem("phone_number", phone_number);

        const user = await this.$apiGetById(`/get_user`, id);
        localStorage.setItem("name", user.first_name);

        this.$refs.toast?.showSuccessToastMessage("Login successful!");
        setTimeout(() => {
          this.$router.push({ path: "/dashboard/first-dash" });
        }, 1000);
      } catch (error) {
        this.error = error.response?.data?.message || "Authentication credentials failed.";
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    // Clear any browser-restored login values whenever the login page opens.
    this.form.phone_number = "";
    this.form.password = "";
  },
};
</script>

<style scoped>
.error-shake-enter-active { animation: shake 0.4s both; }
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  30%, 70% { transform: translate3d(-2px, 0, 0); }
  40%, 60% { transform: translate3d(2px, 0, 0); }
}
</style>
