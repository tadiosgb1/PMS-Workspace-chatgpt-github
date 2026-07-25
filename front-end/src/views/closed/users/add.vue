<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white w-full max-w-xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 class="text-base font-semibold text-gray-800">Add New User</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <!-- Body -->
        <div class="overflow-y-auto p-5 space-y-5">
          <form id="addUserForm" @submit.prevent="submitForm">

            <!-- Name row -->
            <div class="grid grid-cols-3 gap-3 mb-4">
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

            <!-- Contact row -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label class="form-label">Email <span class="text-red-400">*</span></label>
                <input v-model="form.email" type="email" required placeholder="john@example.com" class="form-input" />
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
                <label class="form-label">Address</label>
                <input v-model="form.address" type="text" placeholder="City, Country" class="form-input" />
              </div>
            </div>

            <!-- Flags -->
            <div class="flex flex-wrap gap-5 pt-3 border-t border-gray-100">
              <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input type="checkbox" v-model="form.is_active" class="rounded" /> Active
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input type="checkbox" v-model="form.is_staff" class="rounded" /> Staff
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-sm text-red-500">
                <input type="checkbox" v-model="form.is_superuser" class="rounded" /> Superuser
              </label>
            </div>

          </form>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button form="addUserForm" type="submit" class="btn-primary">Save User</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "AddUserModal",
  props: { visible: { type: Boolean, default: false } },
  data() {
    return {
      form: {
        password: "", email: "", first_name: "", middle_name: "", last_name: "",
        phone_number: "", address: "", is_active: true, is_staff: false, is_superuser: false,
        last_login: new Date().toISOString(), date_joined: new Date().toISOString(),
      },
    };
  },
  methods: {
    async submitForm() {
      try {
        await this.$apiPost("/post_user", { ...this.form });
        this.$root.$refs.toast.showToast("User created successfully", "success");
        this.$emit("success");
        this.$emit("close");
      } catch (error) {
        this.$root.$refs.toast.showToast(error.message || "Failed to create user", "error");
      }
    },
  },
};
</script>

<style scoped>
.form-label { @apply block text-xs font-medium text-gray-600 mb-1; }
.form-input  { @apply w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30; }
.btn-cancel  { @apply px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition; }
.btn-primary { @apply px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition; }
</style>
