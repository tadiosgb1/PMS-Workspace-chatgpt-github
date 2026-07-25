<template>
  <header class="bg-gradient-to-br from-[#1B2559] to-[#1B2559]/90  sticky top-0 z-50">
    <div class="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
      <!-- Logo Section -->
      <div class="flex items-center space-x-3">
        <img src="@/assets/img/logo.jpg" alt="Alpha PMS" class="w-10 h-10 rounded-full shadow" />
        <span class="text-2xl font-bold text-white tracking-wide">Alpha PMS</span>
      </div>
      <!-- Right Side Navigation -->
      <div class="flex items-center space-x-6">
        <a
          href="#contact"
          class="text-gray-300 hover:text-white font-medium transition duration-200 text-sm"
        >
          Contact
        </a>
        <router-link
          to="/login"
          class="inline-flex items-center justify-center px-6 py-2 font-semibold text-white text-sm bg-indigo-500 hover:bg-indigo-600 rounded transition-all duration-200"
        >
          Login
        </router-link>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderSection',
};
</script>
