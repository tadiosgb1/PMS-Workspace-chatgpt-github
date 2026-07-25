<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white w-full max-w-xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">

        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 class="text-base font-semibold text-gray-800">Add Super Staff</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div class="overflow-y-auto p-5">
          <form id="addSuperStaffForm" @submit.prevent="submitForm" class="space-y-4">

            <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-start gap-2">
              <i class="fas fa-exclamation-circle mt-0.5 shrink-0"></i>
              <div class="whitespace-pre-line">{{ errorMessage }}</div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="form-label">First Name <span class="text-red-400">*</span></label>
                <input v-model="form.first_name" type="text" required placeholder="John" class="form-input" />
              </div>
              <div>
                <label class="form-label">Middle Name</label>
                <input v-model="form.middle_name" type="text" placeholder="(optional)" class="form-input" />
              </div>
              <div>
                <label class="form-label">Last Name <span class="text-red-400">*</span></label>
                <input v-model="form.last_name" type="text" required placeholder="Doe" class="form-input" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label">Email <span class="text-red-400">*</span></label>
                <input v-model="form.email" type="email" required placeholder="staff@example.com" class="form-input" />
              </div>
              <div>
                <label class="form-label">Phone</label>
                <input v-model="form.phone_number" type="text" placeholder="+251..." class="form-input" />
              </div>
              <div>
                <label class="form-label">Password <span class="text-red-400">*</span></label>
                <input v-model="form.password" type="password" required placeholder="••••••••" class="form-input" />
              </div>
              <div>
                <label class="form-label">Confirm Password <span class="text-red-400">*</span></label>
                <input v-model="confirm_password" type="password" required placeholder="••••••••" class="form-input" />
              </div>
              <div class="col-span-2">
                <label class="form-label">Address</label>
                <input v-model="form.address" type="text" placeholder="City, Country" class="form-input" />
              </div>
            </div>

          </form>
        </div>

        <div class="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button type="button" @click="closeModal" class="btn-cancel" :disabled="submitting">Cancel</button>
          <button form="addSuperStaffForm" type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save' }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "AddSuperStaffModal",
  props: { 
    visible: { type: Boolean, default: false } 
  },
  data() {
    return {
      errorMessage: null,
      submitting: false,
      confirm_password: "",
      form: {
        first_name: "", 
        middle_name: "", 
        last_name: "",
        email: "", 
        phone_number: "", 
        password: "", 
        address: "",
        is_active: true, 
        is_staff: true, 
        is_superuser: true,
        last_login: new Date().toISOString(), 
        date_joined: new Date().toISOString(),
      },
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) this.resetState();
    }
  },
  methods: {
    resetState() {
      this.errorMessage = null;
      this.submitting = false;
      this.confirm_password = "";
      this.form.first_name = "";
      this.form.middle_name = "";
      this.form.last_name = "";
      this.form.email = "";
      this.form.phone_number = "";
      this.form.password = "";
      this.form.address = "";
    },
    closeModal() {
      this.resetState();
      this.$emit('close');
    },
    validatePassword(password) {
      const errors = [];
      if (password.length < 8) {
        errors.push("• Password must be at least 8 characters long.");
      }
      if (!/[A-Z]/.test(password)) {
        errors.push("• Password must contain at least one uppercase letter.");
      }
      if (!/[a-z]/.test(password)) {
        errors.push("• Password must contain at least one lowercase letter.");
      }
      if (!/[0-9]/.test(password)) {
        errors.push("• Password must contain at least one number.");
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("• Password must contain at least one special character (!@#$%^&* etc.).");
      }
      return errors;
    },
    async submitForm() {
      this.errorMessage = null;

      // 1. Check for Password Mismatch
      if (this.form.password !== this.confirm_password) {
        this.errorMessage = "Passwords do not match.";
        return;
      }

      // 2. Validate Password Rules
      const passwordErrors = this.validatePassword(this.form.password);
      if (passwordErrors.length > 0) {
        this.errorMessage = `Invalid Password Setup:\n${passwordErrors.join('\n')}`;
        return;
      }

      this.submitting = true;
      try {
        const res = await this.$apiPost("/post_user", { ...this.form });
        if (res?.id) {
          await this.$apiPost("/set_user_groups", { user_id: res.id, groups: ["super_staff"] });
        }
        this.$emit("success");
        this.closeModal();
      } catch (error) {
        this.errorMessage = error.response?.data?.message || error.message || "Failed to create super staff member.";
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.form-label { @apply block text-xs font-medium text-gray-600 mb-1; }
.form-input  { @apply w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50; }
.btn-cancel  { @apply px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition disabled:opacity-50; }
.btn-primary { @apply px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition disabled:opacity-50; }
</style>