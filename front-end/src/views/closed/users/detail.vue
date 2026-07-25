<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-screen">
    <Loading :visible="loading" message="Loading user..." />

    <div v-if="user" class="max-w-4xl mx-auto space-y-4">

      <!-- Back + title -->
      <div class="flex items-center gap-3">
        <button @click="$router.go(-1)"
          class="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition">
          <i class="fas fa-arrow-left text-xs"></i> Back
        </button>
        <h1 class="text-lg font-semibold text-gray-800">
          {{ [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User Detail' }}
        </h1>
        <span :class="user.is_active ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
          class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ml-auto">
          {{ user.is_active ? 'Active' : 'Inactive' }}
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- Profile form -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h2 class="text-sm font-semibold text-gray-700">Profile</h2>
          </div>
          <form @submit.prevent="saveProfile(user)" class="p-5 space-y-4">

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="form-label">First Name</label>
                <input type="text" v-model="user.first_name" class="form-input" />
              </div>
              <div>
                <label class="form-label">Middle Name</label>
                <input type="text" v-model="user.middle_name" class="form-input" />
              </div>
              <div>
                <label class="form-label">Last Name</label>
                <input type="text" v-model="user.last_name" class="form-input" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label">Email</label>
                <input type="email" v-model="user.email" class="form-input" />
              </div>
              <div>
                <label class="form-label">Phone</label>
                <input type="text" v-model="user.phone_number" class="form-input" />
              </div>
            </div>

            <div>
              <label class="form-label">Address</label>
              <input type="text" v-model="user.address" class="form-input" />
            </div>

            <div class="flex flex-wrap gap-5 pt-3 border-t border-gray-100">
              <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" v-model="user.is_active" class="rounded" /> Active
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" v-model="user.is_staff" class="rounded" /> Staff
              </label>
              <label class="flex items-center gap-2 text-sm text-red-500 cursor-pointer">
                <input type="checkbox" v-model="user.is_superuser" class="rounded" /> Superuser
              </label>
            </div>

            <div class="flex justify-end pt-2">
              <button type="submit" class="btn-primary">Save Profile</button>
            </div>
          </form>
        </div>

        <!-- Side panel -->
        <div class="space-y-4">

          <!-- Joined date -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p class="text-xs text-gray-400 font-medium uppercase mb-1">Date Joined</p>
            <p class="text-sm font-semibold text-gray-700">{{ formatDate(user.date_joined) }}</p>
          </div>

          <!-- Groups -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 class="text-sm font-semibold text-gray-700">Groups</h3>
              <button @click="showGroupsModal = true"
                class="text-xs font-semibold text-primary hover:underline">Edit</button>
            </div>
            <div class="p-4 flex flex-wrap gap-1 min-h-[48px]">
              <span v-for="g in user.groups" :key="g"
                class="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold border border-green-200">
                {{ g }}
              </span>
              <span v-if="!user.groups.length" class="text-xs text-gray-400 italic">No groups assigned</span>
            </div>
          </div>

          <!-- Permissions -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 class="text-sm font-semibold text-gray-700">Permissions</h3>
              <button @click="showPermissionsModal = true"
                class="text-xs font-semibold text-primary hover:underline">Edit</button>
            </div>
            <div class="p-4 flex flex-wrap gap-1 max-h-48 overflow-y-auto min-h-[48px]">
              <span v-for="p in user.user_permissions" :key="p"
                class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-mono border border-blue-100">
                {{ p }}
              </span>
              <span v-if="!user.user_permissions.length" class="text-xs text-gray-400 italic">No direct permissions</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <EditGroupsModal v-if="showGroupsModal" :groups="user.groups" :userId="user.id"
      @close="showGroupsModal = false; fetchUser();" />
    <EditPermissionsModal v-if="showPermissionsModal" :permissions="user.user_permissions" :userId="user.id"
      @close="showPermissionsModal = false; fetchUser();" />
  </div>
</template>

<script>
import EditGroupsModal from "./EditGroupsModal.vue";
import EditPermissionsModal from "./EditPermissionsModal.vue";
import Loading from "@/components/Loading.vue";

export default {
  name: "UserDetail",
  components: { EditGroupsModal, EditPermissionsModal, Loading },
  data() {
    return { user: null, showGroupsModal: false, showPermissionsModal: false, loading: false };
  },
  mounted() { this.fetchUser(); },
  methods: {
    async fetchUser() {
      this.loading = true;
      try {
        this.user = await this.$apiGetById("/get_user", this.$route.params.id);
      } catch (e) { console.error(e); } finally { this.loading = false; }
    },
    async saveProfile(user) {
      try {
        const payload = { address: user.address, email: user.email, first_name: user.first_name, last_name: user.last_name, middle_name: user.middle_name, phone_number: user.phone_number, date_joined: user.date_joined, last_login: user.last_login, is_active: user.is_active, is_staff: user.is_staff, is_superuser: user.is_superuser };
        const res = await this.$apiPut("/old_update_user", user.id, payload);
        this.$root.$refs.toast.showToast(res.message || "Saved", "success");
      } catch (e) { this.$root.$refs.toast.showToast(e.message || "Failed to save", "error"); }
    },
    formatDate(d) { return d ? new Date(d).toLocaleString() : "—"; },
  },
};
</script>

<style scoped>
.form-label { @apply block text-xs font-medium text-gray-600 mb-1; }
.form-input  { @apply w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30; }
.btn-primary { @apply px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition; }
</style>
