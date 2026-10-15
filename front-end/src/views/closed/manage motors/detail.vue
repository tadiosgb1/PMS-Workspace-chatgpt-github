<template>
  <div class="min-h-screen bg-white p-4 text-base text-slate-800 md:px-8 md:py-6">
    <Toast ref="toast" />
    <Loading :visible="loading || savingImage" :message="savingImage ? 'Saving image...' : 'Loading motor details...'" />
    <div v-if="motor && Object.keys(motor).length" class="mx-auto max-w-6xl space-y-6">
      <div class="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white pb-5 md:pb-6">
        <button @click="$router.back()" class="grid h-10 w-10 place-items-center border border-slate-300 text-slate-700 transition hover:bg-slate-100" aria-label="Go back"><i class="fas fa-arrow-left"></i></button>
        <div class="min-w-0 flex-1"><p class="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400"></p><h1 class="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900">{{ motor.name || 'Motor details' }}</h1><p class="mt-1 text-sm text-slate-500"></p></div>
        <button v-if="canEdit" type="button" @click="openEditMotor" class="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30"><i class="fas fa-pen text-[11px]"></i><span>Edit motor</span></button>
      </div>

      <nav class="flex items-center gap-6 overflow-x-auto border-b border-slate-200 bg-white" aria-label="Motor detail tabs">
        <button v-for="tab in tabs" :key="tab.id" type="button" @click="activeTab = tab.id" :class="['whitespace-nowrap border-b-2 px-1 py-4 text-sm font-semibold transition', activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900']">{{ tab.label }} <span v-if="tab.id === 'pictures'" class="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px]">{{ pictures.length }}</span></button>
      </nav>

      <section v-if="activeTab === 'details'" class="overflow-hidden border border-slate-200 bg-white">
        <header class="border-b border-slate-200 bg-slate-50/70 px-5 py-5 md:px-6"><p class="text-xs font-bold uppercase tracking-wider text-primary">Motor details</p><h2 class="mt-1 text-xl font-bold text-slate-950">Specifications and contacts</h2><p class="mt-1 text-sm text-slate-600">A clear overview of the motor, its pricing, and assigned contacts.</p></header>
        <div class="grid grid-cols-1 gap-3 p-4 sm:p-5 md:grid-cols-2 xl:gap-4">
          <article v-for="entry in entries" :key="entry.key" class="flex min-w-0 items-start gap-3 border border-slate-200 bg-white px-3 py-2.5 transition hover:border-slate-300 hover:shadow-sm" :class="entry.key === 'description' ? 'md:col-span-2' : ''">
            <p class="w-28 shrink-0 pt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">{{ entry.label }}</p>
            <p class="min-w-0 flex-1 break-words text-sm font-medium leading-5 text-slate-900">{{ entry.key === 'owner' || entry.key === 'manager' ? displayPerson(motor[entry.key]) : display(motor[entry.key]) }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="activeTab === 'pictures'" class="overflow-hidden border-t border-slate-200 bg-white">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-5"><div><h2 class="text-xs font-bold uppercase tracking-wider text-gray-700">Motor pictures</h2><p class="mt-1 text-xs text-gray-500">Add pictures or edit their descriptions and image files.</p></div><button type="button" @click="openAddImage" class="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30"><i class="fas fa-plus text-[11px]"></i>Add image</button></header>
        <div v-if="pictures.length" class="grid grid-cols-1 gap-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
          <article v-for="(picture, index) in pictures" :key="picture.id || index" class="overflow-hidden border border-slate-200 bg-white">
            <img v-if="pictureUrl(picture)" :src="pictureUrl(picture)" :alt="picture.description || motor.name || 'Motor picture'" class="h-52 w-full bg-slate-50 object-cover" />
            <div v-else class="grid h-52 place-items-center bg-slate-50 text-sm text-slate-500"><i class="fas fa-image mr-2"></i>No image URL available</div>
            <div class="flex items-start justify-between gap-3 border-t border-slate-100 p-4"><div class="min-w-0"><p class="break-words text-sm font-semibold text-gray-800">{{ picture.description || 'No description' }}</p><p class="mt-1 text-[10px] text-gray-500">Image {{ index + 1 }}</p></div><button type="button" @click="openEditImage(picture)" class="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"><i class="fas fa-pen text-[10px]"></i>Edit</button></div>
          </article>
        </div>
        <div v-else class="p-10 text-center"><i class="fas fa-images text-3xl text-gray-300"></i><p class="mt-3 text-sm font-semibold text-gray-700">No pictures yet</p><p class="mt-1 text-xs text-gray-500">Add an image to keep it with this motor's details.</p><button type="button" @click="openAddImage" class="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-3.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30">Add first image</button></div>
      </section>

    </div>
    <div v-else-if="!loading" class="py-20 text-center text-gray-500">Motor property not found.</div>

    <EditMotor v-if="editMotorVisible" :data="motor" @close="editMotorVisible = false" @refresh="onMotorUpdated" />
    <Teleport to="body">
      <div v-if="imageModalOpen" class="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4" @click.self="closeImageModal">
        <section class="w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          <header class="flex items-center justify-between border-b border-gray-200 px-5 py-4"><div><h2 class="text-base font-bold text-gray-900">{{ editingPicture ? 'Edit motor image' : 'Add motor image' }}</h2><p class="mt-1 text-xs text-gray-500">Images are sent as multipart form data.</p></div><button type="button" @click="closeImageModal" class="grid h-8 w-8 place-items-center rounded border border-gray-300 text-xl text-gray-500 hover:bg-gray-50" aria-label="Close">&times;</button></header>
          <form @submit.prevent="saveImage" class="space-y-4 p-5">
            <label class="block text-xs font-semibold text-gray-700">Description <span class="text-gray-400">(optional)</span><textarea v-model.trim="imageForm.description" rows="3" class="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-primary" placeholder="Describe this picture"></textarea></label>
            <label class="block text-xs font-semibold text-gray-700">{{ editingPicture ? 'Replace image file (optional)' : 'Image file' }}<input ref="imageFile" type="file" accept="image/*" :required="!editingPicture" class="mt-2 block w-full rounded-md border border-gray-300 p-2 text-xs font-normal" @change="onImageChange" /><span class="mt-1 block text-[11px] font-normal text-gray-500">{{ editingPicture ? 'Choose a new file to replace the existing image.' : 'Select an image to upload for this motor.' }}</span></label>
            <img v-if="imagePreview || (editingPicture && pictureUrl(editingPicture))" :src="imagePreview || pictureUrl(editingPicture)" alt="Image preview" class="max-h-56 w-full rounded-lg border border-gray-200 bg-gray-50 object-contain" />
            <div class="flex justify-end gap-2 border-t border-gray-100 pt-4"><button type="button" @click="closeImageModal" class="rounded-md border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" :disabled="savingImage || (!editingPicture && !selectedImage)" class="rounded-md bg-primary px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{{ savingImage ? 'Saving…' : (editingPicture ? 'Save image changes' : 'Upload image') }}</button></div>
          </form>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script>
import Loading from "@/components/Loading.vue";
import Toast from "@/components/Toast.vue";
import EditMotor from "./edit.vue";
const known = ["name", "motor_type", "property_type", "brand", "model", "registration_number", "year", "color", "price", "description", "usage", "location", "created_at", "updated_at", "pictures", "motor_property_pictures", "images", "motor_property_picture", "owner", "owner_id", "manager", "manager_id", "property_zone", "property_zone_id"];
export default {
  name: "ManageMotorsDetail",
  components: { Loading, Toast, EditMotor },
  data: () => ({ motor: {}, loading: false, activeTab: "details", imageModalOpen: false, editingPicture: null, selectedImage: null, imagePreview: "", savingImage: false, imageForm: { description: "" }, editMotorVisible: false }),
  computed: {
    tabs() { return [{ id: "details", label: "Motor details" }, { id: "pictures", label: "Images" }]; },
    canEdit() { const role = this.$getRole?.() || "tenant"; return ["superuser", "owner", "admin", "super_staff"].includes(String(role).toLowerCase()); },
    entries() { return [{key:"name",label:"Motor name"},{key:"property_type",label:"Motor type"},{key:"motor_type",label:"Motor subtype"},{key:"usage",label:"Condition"},{key:"make",label:"Make"},{key:"brand",label:"Brand"},{key:"model",label:"Model"},{key:"year",label:"Year"},{key:"color",label:"Color"},{key:"registration_number",label:"Registration number"},{key:"price",label:"Price"},{key:"location",label:"Location"},{key:"owner",label:"Owner"},{key:"manager",label:"Manager"},{key:"description",label:"Description"},{key:"created_at",label:"Created"},{key:"updated_at",label:"Last updated"}]; },
    extraEntries() { return Object.entries(this.motor || {}).filter(([key]) => !known.includes(key) && key !== "id" && !key.endsWith("_id") && !["user_permissions","groups","is_staff","is_superuser","is_active","last_login","date_joined","profile_picture","whats_app_link"].includes(key)).map(([key,value]) => ({key,value})); },
    pictures() { const value = this.motor?.pictures || this.motor?.motor_property_pictures || this.motor?.images || this.motor?.motor_property_picture; if (!value) return []; return Array.isArray(value) ? value : [value]; }
  },
  async mounted() { await this.loadMotor(); },
  beforeUnmount() { if (this.imagePreview) URL.revokeObjectURL(this.imagePreview); },
  methods: {
    async loadMotor() {
      this.loading = true;
      try {
        const response = await this.$apiGetById("/get_motor_property", this.$route.params.id);
        this.motor = response?.data ?? response?.result ?? response ?? {};
        if (this.motor && !Array.isArray(this.motor)) {
          try {
            const pictureResponse = await this.$apiGet("/get_motor_property_pictures", {});
            const payload = pictureResponse?.data ?? pictureResponse?.results ?? pictureResponse;
            const allPictures = Array.isArray(payload) ? payload : payload?.results || payload?.motor_property_pictures || payload?.data || [];
            const related = allPictures.filter(pic => Number(pic.motor_property?.id ?? pic.motor_property ?? pic.motor_property_id) === Number(this.motor.id ?? this.$route.params.id));
            if (related.length) {
              const embedded = this.motor.pictures || this.motor.motor_property_pictures || this.motor.images || this.motor.motor_property_picture;
              const current = Array.isArray(embedded) ? embedded : embedded ? [embedded] : [];
              const merged = [...current];
              related.forEach(pic => { if (!merged.some(existing => existing.id && existing.id === pic.id)) merged.push(pic); });
              this.motor = { ...this.motor, pictures: merged };
            }
          } catch (pictureError) { console.warn("Motor pictures could not be loaded:", pictureError); }
        }
      } catch (error) { console.error("Failed to load motor:", error); this.motor = {}; }
      finally { this.loading = false; }
    },
    displayPerson(value) { if (!value || typeof value !== "object") return ""; return [value.first_name, value.middle_name, value.last_name].filter(Boolean).join(" "); },
    openEditMotor() { this.editMotorVisible = true; },
    async onMotorUpdated() { this.editMotorVisible = false; await this.loadMotor(); },
    display(value) { if (value === null || value === undefined || value === "") return ""; if (Array.isArray(value)) return value.map(item => this.display(item)).join(", "); if (typeof value === "object") { const preferred = value.name ?? value.title ?? value.label ?? value.description ?? value.url ?? value.image; return preferred !== undefined ? this.display(preferred) : Object.entries(value).filter(([key]) => key !== "id" && !key.endsWith("_id") && !["user_permissions","groups","is_staff","is_superuser","is_active","last_login","date_joined","profile_picture","whats_app_link"].includes(key)).map(([key,item]) => this.label(key) + ": " + this.display(item)).filter(part => !part.endsWith(": ")).join(" · "); } if (typeof value === "boolean") return value ? "Yes" : "No"; return String(value).replace(/_/g, " "); },
    pictureUrl(picture) { const image = picture?.image || picture?.url || picture?.image_url || picture?.picture || picture?.motor_property_image; if (typeof image === "string") return image; return image?.url || image?.image || ""; },
    label(key) { return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); },
    openAddImage() { this.editingPicture = null; this.imageForm = { description: "" }; this.selectedImage = null; this.resetPreview(); this.imageModalOpen = true; },
    openEditImage(picture) { this.editingPicture = picture; this.imageForm = { description: picture?.description || "" }; this.selectedImage = null; this.resetPreview(); this.imageModalOpen = true; },
    onImageChange(event) { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith("image/")) { this.$root.$refs.toast?.showToast("Please select an image file", "error"); event.target.value = ""; return; } this.selectedImage = file; this.resetPreview(); this.imagePreview = URL.createObjectURL(file); },
    resetPreview() { if (this.imagePreview) URL.revokeObjectURL(this.imagePreview); this.imagePreview = ""; },
    closeImageModal() { if (this.savingImage) return; this.imageModalOpen = false; this.editingPicture = null; this.selectedImage = null; this.resetPreview(); },
    async saveImage() {
      const motorId = this.motor?.id ?? this.$route.params.id;
      if (!motorId) { this.$root.$refs.toast?.showToast("Motor ID is missing", "error"); return; }
      if (!this.editingPicture && !this.selectedImage) { this.$root.$refs.toast?.showToast("Please choose an image file", "error"); return; }
      this.savingImage = true;
      try {
        const formData = new FormData();
        formData.append("description", this.imageForm.description || "");
        formData.append("motor_property", String(motorId));
        if (this.selectedImage) formData.append("image", this.selectedImage);
        let response;
        if (this.editingPicture?.id) response = await this.$apiPut("/update_motor_property_picture", this.editingPicture.id, formData, { "Content-Type": "multipart/form-data" });
        else response = await this.$apiPost("/post_motor_property_picture", formData, { "Content-Type": "multipart/form-data" });
        if (response?.error) throw new Error(typeof response.error === "string" ? response.error : "Could not save the image.");
        this.$root.$refs.toast?.showToast(this.editingPicture ? "Motor image updated successfully" : "Motor image added successfully", "success");
        this.imageModalOpen = false;
        this.editingPicture = null;
        this.selectedImage = null;
        this.resetPreview();
        await this.loadMotor();
        this.activeTab = "pictures";
      } catch (error) { console.error("Failed to save motor picture:", error); this.$root.$refs.toast?.showToast(error?.message || "Failed to save motor image", "error"); }
      finally { this.savingImage = false; }
    }
  }
};
</script>
