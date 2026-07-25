<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[90vh]">

        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 class="text-base font-semibold text-gray-800">Add Manager</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div class="overflow-y-auto p-5">
          <form id="managerForm" @submit.prevent="submitForm" class="space-y-4">

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
                <input v-model="form.email" type="email" required placeholder="manager@example.com" class="form-input" />
              </div>
              <div>
                <label class="form-label">Phone <span class="text-red-400">*</span></label>
                <input v-model="form.phone_number" type="tel" required placeholder="+251..." class="form-input" />
              </div>
              <div>
                <label class="form-label">Password <span class="text-red-400">*</span></label>
                <input v-model="form.password" type="password" required placeholder="••••••••" class="form-input" />
              </div>
              <div>
                <label class="form-label">Property Zone <span class="text-red-400">*</span></label>
                <select v-model="form.property_zone" required class="form-input">
                  <option disabled value="">Select zone</option>
                  <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.name }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="form-label">Address</label>
              <input v-model="form.address" type="text" placeholder="City, Country" class="form-input" />
            </div>

          </form>
        </div>

        <div class="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
          <button form="managerForm" type="submit" class="btn-primary">Save Manager</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: "AddManagerModal",
  props: { visible: Boolean },
  data() {
    return {
      zones: [],
      form: {
        first_name: "", middle_name: "", last_name: "",
        email: "", phone_number: "", password: "", address: "",
        property_zone: "", owner_id: localStorage.getItem("userId"), is_manager: true,
      },
    };
  },
  async mounted() {
    const result = await this.$getZones();
    this.zones = result.zones || [];
  },
  methods: {
    async submitForm() {
      try {
        await this.$apiPost("/create_manager", { ...this.form });
        this.$root.$refs.toast.showToast("Manager added successfully", "success");
        this.$emit("success");
        this.$emit("close");
      } catch (e) {
        this.$root.$refs.toast.showToast(e.message || "Failed to add manager", "error");
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
