<template>
  <div class="min-h-full bg-background p-3 md:p-4">
    <div class="mx-auto max-w-4xl">
      <div v-if="loading" class="border border-slate-200 bg-white p-8 text-center text-xs text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading application…</div>
      <template v-else>
        <div class="mb-3 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div class="mb-2 flex items-center gap-2 text-[10px] text-slate-500">
              <router-link :to="{ name: 'OffplanApplication-view' }" class="hover:text-primary">Offplan Applications</router-link>
              <i class="fas fa-chevron-right text-[10px]"></i>
              <span>Application detail</span>
            </div>
            <h1 class="text-lg font-semibold tracking-tight text-slate-900">Offplan Application</h1>
            <p class="mt-0.5 text-[10px] text-slate-500">Application #{{ id }}</p>
          </div>
          <div class="flex gap-2">
            <button type="button" @click="editOpen = true" class="border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"><i class="fas fa-pen mr-2"></i>Edit</button>
            <router-link :to="{ name: 'OffplanApplication-view' }" class="border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Back</router-link>
          </div>
        </div>

        <div v-if="error" class="mb-3 flex h-7 items-center overflow-hidden border border-red-200 bg-red-50 px-2 text-[10px] text-red-700">{{ error }}</div>

        <div class="border border-slate-200 bg-white">
          <div class="border-b border-slate-200 px-4 py-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Application</p>
                <h2 class="mt-1 text-xs font-semibold text-slate-900">#{{ id }}</h2>
              </div>
              <span class="border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{{ display(form.application_status) }}</span>
            </div>
          </div>

          <div class="grid border-b border-slate-200 sm:grid-cols-3">
            <div class="border-b border-slate-200 p-3 sm:border-b-0 sm:border-r">
              <p class="text-xs uppercase tracking-wide text-slate-500">Agreed price</p>
              <p class="mt-2 text-base font-semibold text-slate-900">{{ form.agreed_price || "—" }}</p>
            </div>
            <div class="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r">
              <p class="text-xs uppercase tracking-wide text-slate-500">Payment method</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">{{ form.preferred_payment_method || "—" }}</p>
            </div>
            <div class="p-5">
              <p class="text-xs uppercase tracking-wide text-slate-500">Status</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">{{ display(form.application_status) }}</p>
            </div>
          </div>

          <div class="grid gap-3 p-4 md:grid-cols-2">
            <Info label="Offplan property" :value="relationLabel(form.offplan_property)" />
            <Info label="Customer" :value="relationLabel(form.customer)" />
            <Info label="Created" :value="formatDate(form.created_at)" />
            <Info label="Updated" :value="formatDate(form.updated_at)" />
            <div class="md:col-span-2">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Notes</p>
              <p class="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-700">{{ form.notes || "No notes provided." }}</p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <EditOffplanApplication :open="editOpen" :id="id" @close="editOpen = false" @saved="load" />
  </div>
</template>

<script>
import EditOffplanApplication from "./EditOffplanApplication.vue";

export default {
  name: "OffplanApplicationDetail",
  components: { EditOffplanApplication },
  props: { id: { type: [String, Number], default: null } },
  data() {
    return { form: {}, loading: false, error: "", editOpen: false };
  },
  mounted() {
    this.load();
  },
  methods: {
    async load() {
      if (!this.id) return;
      this.loading = true;
      this.error = "";
      try {
        const items = await this.$getOffplanApplications();
        const item = items.find(row => String(row?.id) === String(this.id));
        if (!item) throw new Error("Application not found.");
        this.form = item;
      } catch (e) {
        this.error = e?.message || "Unable to load the application.";
      } finally {
        this.loading = false;
      }
    },
    display(value) {
      return String(value || "—").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    },
    relationLabel(value) {
      if (value && typeof value === "object") {
        return value.name || value.full_name || value.title || value.id || "—";
      }
      return value ?? "—";
    },
    formatDate(value) {
      if (!value) return "—";
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
    }
  }
};
</script>
