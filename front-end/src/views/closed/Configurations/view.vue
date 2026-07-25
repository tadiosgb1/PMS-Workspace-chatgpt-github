<template>
  <div class="p-6 bg-gray-100 min-h-screen text-sm">

    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-xl font-black text-gray-800 tracking-tight">System Configurations</h1>
      <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Global settings for the platform</p>
    </div>

    <!-- Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

      <!-- Subscription Plans -->
      <div class="bg-white border border-gray-100 rounded-lg p-6 flex flex-col hover:border-gray-300 hover:shadow-sm transition">
        <h3 class="font-black text-gray-800 mb-2">Subscription Plans</h3>
        <p class="text-xs text-gray-500 leading-relaxed mb-6">
          Manage tier limitations, feature access, and pricing structures for all customer accounts.
        </p>
        <div class="mt-auto">
          <router-link
            to="/plans_view"
            class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition w-fit"
          >
            Configure Plans <i class="fas fa-arrow-right text-xs"></i>
          </router-link>
        </div>
      </div>

      <!-- Post Fee -->
      <div class="bg-white border border-gray-100 rounded-lg p-6 flex flex-col hover:border-gray-300 hover:shadow-sm transition">
        <h3 class="font-black text-gray-800 mb-2">Post Fee Setup</h3>
        <p class="text-xs text-gray-500 leading-relaxed mb-6">
          Set post fees for tenants and brokers across the platform.
        </p>
        <div class="mt-auto">
          <router-link
            to="dashboard/systemconfigurations"
            class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition w-fit"
          >
            Configure Fees <i class="fas fa-arrow-right text-xs"></i>
          </router-link>
        </div>
      </div>

    </div>

    <!-- Note -->
    <div class="mt-6 p-4 bg-white border border-gray-100 rounded-lg flex items-start gap-3 text-xs text-gray-500">
      <i class="fas fa-info-circle text-gray-400 mt-0.5 shrink-0"></i>
      <p>
        <span class="font-semibold text-gray-700">Note:</span>
        Changes made here are global. Updating plan limits or fee settings will reflect immediately for new transactions and subscription renewals.
      </p>
    </div>

  </div>
</template>

<script>
export default {
  name: "Configurations",
};
</script>
