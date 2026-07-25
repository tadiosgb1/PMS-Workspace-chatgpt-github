<template>
  <div class="bg-white rounded-2xl shadow p-6 hover:shadow-md transition-shadow">
    <div class="flex items-center gap-4">
      <!-- Icon -->
      <div class="w-12 h-12 flex items-center justify-center text-3xl bg-gray-100 rounded-xl">
        {{ icon }}
      </div>
      
      <div class="flex-1">
        <p class="text-sm text-gray-500 font-medium">{{ title }}</p>
        <p 
          :class="[
            'text-4xl font-bold mt-1',
            color === 'green' ? 'text-green-600' : 
            color === 'red' ? 'text-red-600' : 
            'text-gray-900'
          ]"
        >
          {{ value }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    icon: {
      type: String,
      default: '📊'
    },
    color: {
      type: String,
      default: 'default', // 'default', 'green', 'red'
      validator: (value) => ['default', 'green', 'red'].includes(value)
    }
  }
}
</script>