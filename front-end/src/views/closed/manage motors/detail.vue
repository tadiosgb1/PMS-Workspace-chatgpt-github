<template>
  <div class="min-h-screen bg-background p-4 text-sm md:p-6">
    <Loading :visible="loading" message="Loading motor details..." />
    <div v-if="motor && Object.keys(motor).length" class="mx-auto max-w-4xl space-y-4">
      <div class="flex items-center gap-3"><button @click="$router.back()" class="text-xs text-gray-600 hover:text-primary"><i class="fas fa-arrow-left mr-1"></i>Back</button><span class="h-4 w-px bg-gray-300"></span><div><h1 class="text-xl font-black text-primary">{{ motor.name || 'Motor details' }}</h1><p class="mt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Motor property · ID #{{ motor.id ?? $route.params.id }}</p></div></div>
      <section class="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm"><header class="border-b border-primary/10 bg-primary/5 px-5 py-3"><h2 class="text-xs font-bold uppercase tracking-wider text-gray-700">Motor information</h2></header><div class="grid grid-cols-1 gap-x-8 gap-y-5 p-5 sm:grid-cols-2">
        <div v-for="entry in entries" :key="entry.key" class="min-w-0"><p class="text-[10px] font-bold uppercase tracking-wider text-gray-500">{{ entry.label }}</p><p class="mt-1 break-words text-sm text-gray-800">{{ display(motor[entry.key]) }}</p></div>
      </div></section>
      <section v-if="extraEntries.length" class="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm"><header class="border-b border-primary/10 bg-primary/5 px-5 py-3"><h2 class="text-xs font-bold uppercase tracking-wider text-gray-700">Additional information</h2></header><div class="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2"><div v-for="entry in extraEntries" :key="entry.key" class="min-w-0"><p class="text-[10px] font-bold uppercase tracking-wider text-gray-500">{{ label(entry.key) }}</p><p class="mt-1 break-words text-sm text-gray-800">{{ display(entry.value) }}</p></div></div></section>
    </div>
    <div v-else-if="!loading" class="py-20 text-center text-gray-500">Motor property not found.</div>
  </div>
</template>
<script>
import Loading from "@/components/Loading.vue";
const known = ["name", "motor_type", "brand", "model", "registration_number", "year", "color", "price", "description", "created_at", "updated_at"];
export default {
  name: "ManageMotorsDetail", components: { Loading }, data: () => ({ motor: {}, loading: false }),
  computed: {
    entries() { return [{key:"name",label:"Name"},{key:"motor_type",label:"Motor type"},{key:"brand",label:"Brand"},{key:"model",label:"Model"},{key:"registration_number",label:"Registration number"},{key:"year",label:"Year"},{key:"color",label:"Color"},{key:"price",label:"Price"},{key:"description",label:"Description"},{key:"created_at",label:"Created"},{key:"updated_at",label:"Last updated"}]; },
    extraEntries() { return Object.entries(this.motor || {}).filter(([key]) => !known.includes(key) && key !== "id").map(([key,value]) => ({key,value})); }
  },
  async mounted() {
    this.loading = true;
    try { const response = await this.$apiGetById("/get_motor_property", this.$route.params.id); this.motor = response?.data ?? response?.result ?? response ?? {}; }
    catch (error) { console.error("Failed to load motor:", error); this.motor = {}; }
    finally { this.loading = false; }
  },
  methods: {
    display(value) { if (value === null || value === undefined || value === "") return "—"; if (typeof value === "object") return JSON.stringify(value); return String(value); },
    label(key) { return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
  }
};
</script>
