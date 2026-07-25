<template>
  <div>
    <Toast ref="toast" />
    <div class="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div class="bg-white rounded-lg overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-gray-200 flex items-center gap-4">
          <div>
            <h1 class="text-xl font-black text-gray-800 tracking-tight">Super Staff Management</h1>
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Manage All Super Staff</p>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 sm:p-6">
          <superStaffs />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import superStaffs from "./superStaf.vue";

export default {
  components: {
    superStaffs,
  },
};
</script>
