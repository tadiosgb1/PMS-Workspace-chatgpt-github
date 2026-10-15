<template>
  <div class="min-h-screen bg-background p-4 text-sm md:p-6">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading motors..." />
    <div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div><h1 class="text-xl font-black tracking-tight text-primary">Manage Motors</h1><p class="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Motor property records</p></div>
      <button @click="addVisible = true" class="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary/90"><i class="fas fa-plus"></i> Add Motor</button>
    </div>
    <div class="mb-4 flex flex-col gap-3 rounded-lg border border-primary/10 bg-white p-4 sm:flex-row sm:items-center">
      <input v-model="search" @input="fetchMotors" type="search" placeholder="Search motors..." class="w-full max-w-sm rounded-lg border border-primary/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
      <div class="text-xs text-gray-500 sm:ml-auto">{{ motors.length }} record(s)</div>
    </div>
    <div class="overflow-hidden rounded-lg border border-primary/10 bg-white">
      <div class="overflow-x-auto"><table class="w-full text-left text-sm">
        <thead class="border-b border-primary/10 bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th class="px-4 py-3">Image</th><th class="px-4 py-3">Motor</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">Brand / Model</th><th class="px-4 py-3">Registration</th><th class="px-4 py-3">Price</th><th class="px-4 py-3 text-right">Actions</th></tr></thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="motor in filteredMotors" :key="motor.id" class="hover:bg-primary/5">
            <td class="px-4 py-3"><img v-if="motorImage(motor)" :src="motorImage(motor)" :alt="motor.name || 'Motor image'" class="h-12 w-16 rounded object-cover" /><span v-else class="text-xs text-gray-400">No image</span></td><td class="px-4 py-3 font-semibold text-primary">{{ displayValue(motor.name) }}</td><td class="px-4 py-3">{{ displayValue(motor.property_type || motor.motor_type) }}</td><td class="px-4 py-3">{{ [motor.brand, motor.model].filter(Boolean).join(' / ') || '—' }}</td><td class="px-4 py-3">{{ motor.registration_number || '—' }}</td><td class="px-4 py-3">{{ motor.price ?? '—' }}</td>
            <td class="px-4 py-3"><div class="flex justify-end gap-1"><button @click="viewDetail(motor.id)" title="View details" class="h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white"><i class="fas fa-eye"></i></button><button v-if="canEdit" @click="editMotor(motor)" title="Edit" class="h-8 w-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white"><i class="fas fa-edit"></i></button></div></td>
          </tr>
          <tr v-if="!loading && filteredMotors.length === 0"><td colspan="7" class="px-4 py-12 text-center text-gray-400">No motor properties found.</td></tr>
        </tbody>
      </table></div>
    </div>
    <AddMotor v-if="addVisible" @close="addVisible = false" @refresh="fetchMotors" />
    <EditMotor v-if="editVisible" :data="selectedMotor" @close="editVisible = false" @refresh="fetchMotors" />
  </div>
</template>
<script>
import AddMotor from "./add.vue";
import EditMotor from "./edit.vue";
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue";
export default {
  name: "ManageMotorsView", components: { AddMotor, EditMotor, Toast, Loading },
  data: () => ({ motors: [], loading: false, addVisible: false, editVisible: false, selectedMotor: null, search: "", searchTimeout: null }),
  computed: { canEdit() { const role = this.$getRole?.() || "tenant"; return ["superuser", "owner", "admin", "super_staff"].includes(String(role).toLowerCase()); }, filteredMotors() { const q = this.search.trim().toLowerCase(); return this.motors.filter(m => !q || Object.values(m || {}).some(v => this.displayValue(v).toLowerCase().includes(q))); } },
  mounted() { this.fetchMotors(); },
  beforeUnmount() { clearTimeout(this.searchTimeout); },
  methods: {
    async fetchMotors() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(async () => {
        this.loading = true;
        try {
          const response = await this.$apiGet("/get_motor_properties", this.search.trim() ? { search: this.search.trim() } : {});
          const payload = response?.data ?? response?.results ?? response;
          this.motors = Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : Array.isArray(payload?.motor_properties) ? payload.motor_properties : [];
          try {
            const pictureResponse = await this.$apiGet("/get_motor_property_pictures", {});
            const picturePayload = pictureResponse?.data ?? pictureResponse?.results ?? pictureResponse;
            const pictures = Array.isArray(picturePayload) ? picturePayload : picturePayload?.results || picturePayload?.motor_property_pictures || picturePayload?.data || [];
            this.motors = this.motors.map(motor => {
              const related = pictures.filter(pic => Number(pic.motor_property?.id ?? pic.motor_property ?? pic.motor_property_id) === Number(motor.id));
              return { ...motor, pictures: motor.pictures || motor.motor_property_pictures || related };
            });
          } catch (pictureError) { console.warn("Motor pictures could not be loaded:", pictureError); }
        } catch (error) { console.error("Failed to load motors:", error); this.motors = []; this.$root.$refs.toast?.showToast("Failed to load motor properties", "error"); }
        finally { this.loading = false; }
      }, this.search ? 250 : 0);
    },
    displayValue(value) { if (value === null || value === undefined || value === "") return "—"; if (typeof value === "object") { const preferred = value.name ?? value.title ?? value.label ?? value.description ?? value.url ?? value.image ?? value.id; return preferred !== undefined ? this.displayValue(preferred) : Object.entries(value).map(([k,v]) => this.labelKey(k) + ": " + this.displayValue(v)).join(", "); } if (typeof value === "boolean") return value ? "Yes" : "No"; return String(value).replace(/_/g, " "); },
    labelKey(key) { return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); },
    motorImage(motor) { const pics = motor?.pictures || motor?.motor_property_pictures || motor?.images || motor?.motor_property_picture; const first = Array.isArray(pics) ? pics[0] : pics; return first?.image || first?.url || first?.image_url || first?.picture || motor?.image || motor?.image_url || ""; },
    editMotor(motor) { this.selectedMotor = { ...motor }; this.editVisible = true; },
    viewDetail(id) { this.$router.push({ name: "ManageMotors-detail", params: { id } }); }
  }
};
</script>
