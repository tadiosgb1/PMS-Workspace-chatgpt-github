<template>
  <div class="min-h-full bg-slate-50 px-3 py-4 md:px-4 md:py-5">
    <div class="mx-auto max-w-[1400px]">
      <div v-if="loading" class="border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
        <i class="fas fa-spinner fa-spin mr-2"></i>Loading property…
      </div>

      <template v-else>
        <div class="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div class="mb-1.5 flex items-center gap-2 text-[11px] text-slate-500">
              <router-link :to="{name:'OffplanProperty-view'}" class="hover:text-blue-600">Offplan Properties</router-link>
              <i class="fas fa-chevron-right text-[10px]"></i><span>Property detail</span>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="text-lg font-semibold text-slate-900">Offplan Property</h1>
              <span class="border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary">{{display(form.project_status)}}</span>
            </div>
            <p class="mt-0.5 text-xs text-slate-500">{{form.developer || 'Developer not specified'}} · {{form.property_type || 'Property'}}</p>
          </div>
          <div class="flex gap-2">
            <button type="button" @click="openEdit" class="border border-primary bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90"><i class="fas fa-pen mr-2"></i>Edit</button>
            <router-link :to="{name:'OffplanProperty-view'}" class="border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary">Back</router-link>
          </div>
        </div>

        <div v-if="error" class="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{{error}}</div>

        <div class="grid gap-4 lg:grid-cols-3">
          <div class="space-y-4 lg:col-span-2">
            <section class="border border-slate-200 bg-white shadow-sm">
              <div class="border-b border-slate-100 px-4 py-3"><h2 class="text-sm font-semibold text-slate-900">Property overview</h2></div>
              <div class="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
                <Stat label="Price" :value="form.price || '—'" /><Stat label="Bedrooms" :value="form.bedrooms || '—'" />
                <Stat label="Bathrooms" :value="form.bathrooms || '—'" /><Stat label="Area / size" :value="form.area_or_size || '—'" />
              </div>
              <div class="grid gap-3 p-4 sm:grid-cols-2">
                <Info label="Completion status" :value="display(form.completion_status)" /><Info label="Sale type" :value="display(form.sale_type)" />
                <Info label="Project completion" :value="display(form.project_completion)" /><Info label="Pre-handover payment" :value="display(form.pre_handover_payment)" />
                <Info label="Project status" :value="display(form.project_status)" /><Info label="Developer" :value="form.developer || '—'" />
                <Info label="Furnished" :value="booleanText(form.is_furnished)" /><Info label="Created" :value="formatDate(form.created_at)" />
                <Info label="Updated" :value="formatDate(form.updated_at)" />
              </div>
            </section>

            <section class="border border-slate-200 bg-white shadow-sm">
              <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div><h2 class="text-sm font-semibold text-slate-900">Property images</h2><p class="mt-0.5 text-[10px] text-slate-500">Manage images attached to this offplan property.</p></div>
                <button type="button" @click="openAddImage" class="border border-primary bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90"><i class="fas fa-plus mr-2"></i>Add image</button>
              </div>
              <div v-if="picturesLoading" class="p-10 text-center text-sm text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading images…</div>
              <div v-else-if="picturesError" class="m-4 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{{picturesError}}</div>
              <div v-else-if="pictures.length" class="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                <article v-for="picture in pictures" :key="picture.id" class="overflow-hidden border border-slate-200 bg-white">
                  <div class="relative aspect-video bg-slate-100">
                    <img v-if="imageUrl(picture)" :src="imageUrl(picture)" :alt="picture.description || 'Property image'" class="h-full w-full object-cover" />
                    <div v-else class="flex h-full items-center justify-center text-slate-400"><i class="fas fa-image text-3xl"></i></div>
                    <div class="absolute right-2 top-2 flex gap-2">
                      <button type="button" @click="openEditImage(picture)" class="flex h-8 w-8 items-center justify-center border border-slate-200 bg-white/90 text-slate-700 shadow hover:bg-white" title="Edit image"><i class="fas fa-pen text-xs"></i></button>
                      <button type="button" @click="deleteImage(picture)" class="flex h-8 w-8 items-center justify-center border border-slate-200 bg-white/90 text-red-600 shadow hover:bg-white" title="Delete image"><i class="fas fa-trash text-xs"></i></button>
                    </div>
                  </div>
                  <div class="p-3"><p class="text-xs font-medium text-slate-700">{{picture.description || 'No description'}}</p></div>
                </article>
              </div>
              <div v-else class="p-10 text-center text-sm text-slate-500"><i class="fas fa-images mb-2 block text-2xl text-slate-300"></i>No images have been added yet.</div>
            </section>

            <section class="border border-slate-200 bg-white shadow-sm">
              <div class="border-b border-slate-100 px-4 py-3"><h2 class="text-sm font-semibold text-slate-900">Amenities & features</h2></div>
              <div class="grid gap-2 p-4 sm:grid-cols-2">
                <div v-for="item in amenityOptions" :key="item.key" class="flex items-center gap-2 border border-slate-100 p-2.5">
                  <span class="flex h-7 w-7 shrink-0 items-center justify-center" :class="form[item.key] ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'"><i :class="form[item.key] ? 'fas fa-check' : 'fas fa-minus'"></i></span>
                  <span class="text-xs font-medium text-slate-700">{{item.label}}</span>
                </div>
              </div>
            </section>
          </div>

          <aside class="space-y-4">
            <section class="border border-slate-200 bg-white p-4 shadow-sm">
              <h2 class="mb-3 text-sm font-semibold text-slate-900">Location & relationships</h2>
              <div class="space-y-3">
                <Info label="Property zone" :value="zoneName(form.property_zone)" />
                <Info label="Address" :value="zoneAddress(form.property_zone)" />
                <Info label="City" :value="form.property_zone?.city || form.city || '—'" />
                <Info label="State" :value="form.property_zone?.state || form.state || '—'" />
                <Info label="Zone status" :value="display(form.property_zone?.zone_status)" />
                <Info label="Owner" :value="personName(form.owner)" />
                <Info label="Manager" :value="personName(form.manager)" />
              </div>
            </section>
            <section class="border border-primary/15 bg-primary/5 p-4"><div class="flex items-start gap-3"><i class="fas fa-circle-info mt-0.5 text-primary"></i><p class="text-xs leading-5 text-slate-700">This record is connected to the authenticated property-management workspace and uses the offplan property API endpoints.</p></div></section>
          </aside>
        </div>
      </template>
    </div>

    <EditOffplanProperty :open="editOpen" :id="selectedId" @close="closeEdit" @saved="handleEditSaved" />
    <OffplanPropertyImageModal :open="imageModalOpen" :property-id="id" :image="editingImage" @close="closeImageModal" @saved="loadPictures" />
  </div>
</template>

<script>
import OffplanInfo from "./OffplanInfo.vue";
import OffplanStat from "./OffplanStat.vue";
import EditOffplanProperty from "./EditOffplanProperty.vue";
import OffplanPropertyImageModal from "./OffplanPropertyImageModal.vue";

export default {
  name: "OffplanPropertyDetail",
  props: { id: [String, Number] },
  components: { Info: OffplanInfo, Stat: OffplanStat, EditOffplanProperty, OffplanPropertyImageModal },
  data() {
    return {
      form: {}, loading: true, error: "",
      pictures: [], picturesLoading: false, picturesError: "",
      editOpen: false, selectedId: null,
      imageModalOpen: false, editingImage: null,
      amenityOptions: [
        {key:"is_furnished",label:"Furnished"},{key:"has_maids_room",label:"Maid’s room"},{key:"has_study",label:"Study"},
        {key:"has_central_or_ac_and_heating",label:"Central A/C & heating"},{key:"has_balcony",label:"Balcony"},{key:"has_private_garden",label:"Private garden"},
        {key:"has_private_pool",label:"Private pool"},{key:"has_private_gym",label:"Private gym"},{key:"has_private_jacuzzi",label:"Private jacuzzi"},
        {key:"has_shared_pool",label:"Shared pool"},{key:"has_shared_spa",label:"Shared spa"}
      ]
    };
  },
  async mounted() {
    try {
      await this.loadProperty();
    } catch (e) {
      this.error = e?.message || "Unable to load property.";
    } finally { this.loading = false; }
  },
  methods: {
    normalizeProperty(res) {
      let body = res;
      if (body?.data?.data) body = body.data.data;
      else if (body?.data) body = body.data;
      else if (body?.property) body = body.property;
      if (Array.isArray(body)) body = body[0] || {};
      return body && typeof body === "object" ? body : {};
    },
    async loadProperty() {
      if (!this.id) return;
      const res = await this.$apiGetById("/get_offplan_property", this.id);
      this.form = this.normalizeProperty(res);
      await this.loadPictures();
    },
    display(v) { if (v === null || v === undefined || v === "") return "—"; return String(v).replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase()); },
    booleanText(v) { return v === true ? "Yes" : v === false ? "No" : "—"; },
    formatDate(v) { if (!v) return "—"; const d = new Date(v); return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString(); },
    personName(person) {
      if (!person || typeof person !== "object") return "—";
      return person.name || person.full_name || [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(" ") || person.username || person.email || "—";
    },
    zoneName(zone) {
      if (!zone || typeof zone !== "object") return "—";
      return zone.name || "—";
    },
    zoneAddress(zone) {
      if (!zone || typeof zone !== "object") return "—";
      return [zone.address, zone.city, zone.state].filter(Boolean).join(", ") || "—";
    },
    normalizePictures(res) {
      const raw = res?.data ?? res;
      if (Array.isArray(raw)) return raw;
      for (const key of ["pictures","images","results","data"]) if (Array.isArray(raw?.[key])) return raw[key];
      return [];
    },
    imageUrl(picture) { return picture?.offplan_property_image || picture?.image || picture?.picture || picture?.url || picture?.file || ""; },
    async loadPictures() {
      if (!this.id) return;
      this.picturesLoading = true; this.picturesError = "";
      try {
        const res = await this.$apiGet("/get_offplan_property_pictures", { offplan_property_id: this.id, property_id: this.id });
        this.pictures = this.normalizePictures(res);
      } catch (e) { this.picturesError = e?.message || "Unable to load property images."; }
      finally { this.picturesLoading = false; }
    },
    openEdit() {
      this.selectedId = this.id;
      this.editOpen = true;
    },
    closeEdit() {
      this.editOpen = false;
      this.selectedId = null;
    },
    async handleEditSaved() {
      await this.loadProperty();
    },
    openAddImage() {
      this.editingImage = null;
      this.imageModalOpen = true;
    },
    openEditImage(picture) {
      this.editingImage = { ...picture };
      this.imageModalOpen = true;
    },
    closeImageModal() {
      this.imageModalOpen = false;
      this.editingImage = null;
    },
    async deleteImage(picture) {
      if (!picture?.id || !window.confirm("Delete this property image?")) return;
      try {
        await this.$apiDelete("/delete_offplan_property_picture", picture.id);
        await this.loadPictures();
      } catch (e) {
        this.picturesError = e?.message || "Unable to delete the property image.";
      }
    }
  }
};
</script>
