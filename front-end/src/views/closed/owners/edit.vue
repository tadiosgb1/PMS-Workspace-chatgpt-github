<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <div class="bg-white shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
        <div class="px-6 py-5 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Edit Owner</h2>
            <p class="text-sm text-gray-500">Update property owner information</p>
          </div>
          <button @click="close" class="text-gray-400 hover:text-gray-600 transition">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>

        <div class="flex-1 overflow-auto p-6">
          <form @submit.prevent="submitForm" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-700 uppercase tracking-wider">First Name</label>
                <input v-model="form.first_name" required class="field" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-700 uppercase tracking-wider">Middle Name</label>
                <input v-model="form.middle_name" class="field" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Name</label>
                <input v-model="form.last_name" required class="field" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</label>
                <input v-model="form.email" type="email" required class="field" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone Number</label>
                <input v-model="form.phone_number" type="tel" required class="field" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-700 uppercase tracking-wider">Subscription Plan</label>
              <select v-model="form.plan" required class="field">
                <option value="" disabled>Select a plan</option>
                <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                  {{ plan.name }} — {{ plan.price ? ' ETB' + plan.price : 'Free' }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-700 uppercase tracking-wider">Start Date</label>
                <input v-model="form.start_date" type="date" class="field" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-700 uppercase tracking-wider">End Date</label>
                <input v-model="form.end_date" type="date" class="field" />
              </div>
            </div>

          </form>
        </div>

        <div class="px-6 py-5 border-t bg-gray-50">
          <div v-if="errorMessages.length" class="text-red-700 text-sm bg-red-50 border border-red-200 p-4 rounded-lg">
            <ul class="space-y-1">
              <li v-for="(message, index) in errorMessages" :key="index" class="flex items-start gap-2">
                <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                <span>{{ message }}</span>
              </li>
            </ul>
          </div>
          <div class="flex justify-end gap-3 mt-4">
          <button @click="close" class="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Cancel</button>
          <button
            @click="submitForm"
            :disabled="loading"
            class="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-60"
          >
            <span v-if="loading" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
            {{ loading ? 'Saving Owner...' : 'Save Changes' }}
          </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "EditOwner",
  props: {
    visible: { type: Boolean, default: false },
    owner: { type: Object, default: null },
  },
  emits: ["close", "success"],
  data() {
    return {
      form: {
        id: null,
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        plan: "",
        start_date: "",
        end_date: "",
      },
      plans: [],
      loading: false,
      errorMessages: [],
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.populateForm();
        this.fetchPlans();
      }
    },
    owner: {
      deep: true,
      handler() {
        if (this.visible) this.populateForm();
      },
    },
  },
  mounted() {
    if (this.visible) {
      this.populateForm();
      this.fetchPlans();
    }
  },
  methods: {
    populateForm() {
      const owner = this.owner || {};
      this.form = {
        id: owner.id ?? null,
        first_name: owner.first_name || "",
        middle_name: owner.middle_name || "",
        last_name: owner.last_name || "",
        email: owner.email || "",
        phone_number: owner.phone_number || "",
        plan: owner.plan?.id ?? owner.plan ?? "",
        start_date: owner.start_date || "",
        end_date: owner.end_date || "",
      };
      this.errorMessages = [];
    },

    async fetchPlans() {
      try {
        const res = await this.$apiGet("/get_plans", { page_size: 1000 });
        this.plans = res.plans || res.data || res.results || [];
      } catch (error) {
        console.error("Failed to load plans", error);
        this.plans = [];
      }
    },

    close() {
      this.$emit("close");
    },

    async submitForm() {
      if (!this.form.id) {
        this.errorMessages = ["Owner ID is missing."];
        return;
      }

      this.loading = true;
      this.errorMessages = [];

      try {
        const payload = {
          first_name: this.form.first_name,
          middle_name: this.form.middle_name,
          last_name: this.form.last_name,
          email: this.form.email,
          phone_number: this.form.phone_number,
          plan: this.form.plan,
          start_date: this.form.start_date,
          end_date: this.form.end_date,
        };

        const response = await this.$apiPut("/update_owner", this.form.id, payload);
        const message = response?.message || "Owner updated successfully";

        this.$root.$refs.toast?.showToast(message, "success");
        this.$emit("success", response);
        this.close();
      } catch (error) {
        this.errorMessages = this.getApiErrorMessages(error);
      } finally {
        this.loading = false;
      }
    },

    getApiErrorMessages(error) {
      const data = error?.response?.data;
      const source = data ?? (error?.message && typeof error.message === "object" ? error.message : null);

      const flatten = (value, field = "") => {
        if (typeof value === "string" && value.trim()) return [value.trim()];
        if (Array.isArray(value)) return value.flatMap((item) => flatten(item, field));
        if (value && typeof value === "object") {
          return Object.entries(value).flatMap(([key, messages]) => {
            const label = key === "non_field_errors" ? "" : key.replace(/_/g, " ");
            return flatten(messages, label);
          });
        }
        return [];
      };

      const candidates = [source?.error, source?.message, source, error?.message];
      for (const candidate of candidates) {
        const messages = flatten(candidate);
        if (messages.length) {
          return messages.map((message) => {
            // Field names are already represented by the backend object structure.
            return message;
          });
        }
      }
      return ["Failed to update owner"];
    },
  },
};
</script>

<style scoped>
.field {
  @apply w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>