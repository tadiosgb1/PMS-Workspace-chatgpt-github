<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <!-- <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isSuperuser ? 'Platform Dashboard' : 'My Portfolio Dashboard' }}
        </h1>
      </div> -->

      <!-- Render appropriate dashboard -->
      <SuperAdminDashboard v-if="isSuperuser" />
      <OwnerDashboard v-else />
    </div>
  </div>
</template>

<script>
import SuperAdminDashboard from './SuperAdminDashboard.vue'
import OwnerDashboard from './OwnerDashboard.vue'

export default {
  name: 'Dashboard',
  components: {
    SuperAdminDashboard,
    OwnerDashboard
  },
  data() {
    return {
      isSuperuser: false
    }
  },
  created() {
    // Check superuser status from localStorage
    const storedUser = localStorage.getItem('user')
    const isSuper = localStorage.getItem('is_superuser')

    if (storedUser) {
      const user = JSON.parse(storedUser)
      this.isSuperuser = user.is_superuser === true
    } else if (isSuper) {
      this.isSuperuser = isSuper === 'true'
    }
  }
}
</script>