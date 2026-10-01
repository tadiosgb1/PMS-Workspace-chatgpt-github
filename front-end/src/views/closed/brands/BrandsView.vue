<template>
  <section class="p-5 md:p-6 space-y-5">
    <header class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-5">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">System appearance</p>
        <h1 class="mt-1 text-xl font-semibold text-slate-900">Brands</h1>
        <p class="mt-1 text-sm text-slate-500">Manage the application brand palette at runtime. The current setup is stored locally and can later be moved to the server.</p>
      </div>
      <button type="button" class="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50" @click="restoreDefaults">
        <i class="fas fa-rotate-left text-xs"></i>
        Restore Default Brands
      </button>
    </header>

    <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5">
      <div class="border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 class="text-sm font-semibold text-slate-900">Brand palette</h2>
            <p class="mt-1 text-xs text-slate-500">Changes are applied immediately to the running application.</p>
          </div>
          <span class="text-xs font-medium text-slate-500">{{ activeBrandName }}</span>
        </div>

        <div class="p-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="field in brandFields" :key="field.key" class="border border-slate-200 p-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <label class="text-sm font-semibold text-slate-800">{{ field.label }}</label>
                  <p class="mt-0.5 text-xs text-slate-500">{{ field.description }}</p>
                </div>
                <div class="h-8 w-12 border border-slate-300" :style="{ backgroundColor: form[field.key] }"></div>
              </div>

              <div class="mt-3 flex gap-2">
                <input v-model="form[field.key]" type="color" class="h-9 w-12 cursor-pointer border border-slate-300 bg-white p-0.5" @input="apply" />
                <input v-model="form[field.key]" type="text" maxlength="20" class="min-w-0 flex-1 border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary" @input="apply" />
              </div>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
            <button type="button" class="border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90" @click="saveBrand">Save Current Brand</button>
            <button type="button" class="border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" @click="restoreDefaults">Reset</button>
            <span v-if="savedMessage" class="text-xs font-medium text-emerald-600">{{ savedMessage }}</span>
          </div>
        </div>
      </div>

      <aside class="border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-200 px-5 py-4">
          <h2 class="text-sm font-semibold text-slate-900">Saved brands</h2>
          <p class="mt-1 text-xs text-slate-500">Keep reusable local palettes until brand settings move to the server.</p>
        </div>

        <div class="p-5 space-y-3">
          <div class="border border-slate-200 p-3">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-800">Default</p>
                <p class="text-xs text-slate-500 mt-0.5">Original system palette</p>
              </div>
              <button type="button" class="border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" @click="restoreDefaults">Apply</button>
            </div>
          </div>

          <div v-for="(brand, name) in savedBrands" :key="name" class="border border-slate-200 p-3">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-slate-800">{{ name }}</p>
                <div class="mt-2 flex gap-1.5">
                  <span v-for="field in brandFields.slice(0, 4)" :key="field.key" class="h-4 w-4 border border-slate-300" :style="{ backgroundColor: brand[field.key] }"></span>
                </div>
              </div>
              <div class="flex shrink-0 gap-1.5">
                <button type="button" class="border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" @click="applySaved(name)">Apply</button>
                <button type="button" class="border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50" @click="deleteSaved(name)">Delete</button>
              </div>
            </div>
          </div>

          <p v-if="Object.keys(savedBrands).length === 0" class="border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">No saved custom brands yet.</p>
        </div>
      </aside>
    </div>
  </section>
</template>

<script>
import { DEFAULT_BRANDS, BRAND_STORAGE_KEY, applyBrandTheme } from "../../../utils/brand.js";

const SAVED_KEY = "alpha_pms_saved_brands";

export default {
  name: "BrandsView",
  data() {
    return {
      form: { ...DEFAULT_BRANDS },
      savedBrands: {},
      savedMessage: "",
      brandFields: [
        { key: "primary", label: "Primary", description: "Main actions and emphasis." },
        { key: "dprimary", label: "Dark Primary", description: "Primary dark/hover companion." },
        { key: "secondary", label: "Secondary", description: "Secondary actions and accents." },
        { key: "tertiary", label: "Tertiary", description: "Soft supporting brand color." },
        { key: "icon", label: "Icon", description: "Icon and visual accent color." },
        { key: "background", label: "Background", description: "Application background surface." },
        { key: "main", label: "Main", description: "General main brand color." },
        { key: "mainDark", label: "Main Dark", description: "Dark main brand color." }
      ]
    };
  },
  computed: {
    activeBrandName() {
      return localStorage.getItem("alpha_pms_active_brand_name") || "Default";
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    normalizeBrand(value) {
      return { ...DEFAULT_BRANDS, ...(value || {}) };
    },
    load() {
      try {
        const stored = JSON.parse(localStorage.getItem(BRAND_STORAGE_KEY) || "null");
        if (stored) this.form = this.normalizeBrand(stored);
      } catch {
        this.form = { ...DEFAULT_BRANDS };
      }
      try {
        this.savedBrands = JSON.parse(localStorage.getItem(SAVED_KEY) || "{}") || {};
      } catch {
        this.savedBrands = {};
      }
      this.apply();
    },
    apply() {
      applyBrandTheme(this.form);
    },
    saveBrand() {
      const name = window.prompt("Brand name", "My Brand");
      if (!name || !name.trim()) return;
      const cleanName = name.trim();
      const brand = this.normalizeBrand(this.form);
      this.savedBrands = { ...this.savedBrands, [cleanName]: brand };
      localStorage.setItem(SAVED_KEY, JSON.stringify(this.savedBrands));
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brand));
      localStorage.setItem("alpha_pms_active_brand_name", cleanName);
      this.apply();
      this.savedMessage = "Brand saved and applied.";
      setTimeout(() => { this.savedMessage = ""; }, 2500);
    },
    applySaved(name) {
      const brand = this.savedBrands[name];
      if (!brand) return;
      this.form = this.normalizeBrand(brand);
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(this.form));
      localStorage.setItem("alpha_pms_active_brand_name", name);
      this.apply();
      this.savedMessage = name + " applied.";
      setTimeout(() => { this.savedMessage = ""; }, 2500);
    },
    restoreDefaults() {
      this.form = { ...DEFAULT_BRANDS };
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(this.form));
      localStorage.setItem("alpha_pms_active_brand_name", "Default");
      this.apply();
      this.savedMessage = "Default brands restored.";
      setTimeout(() => { this.savedMessage = ""; }, 2500);
    },
    deleteSaved(name) {
      const next = { ...this.savedBrands };
      delete next[name];
      this.savedBrands = next;
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    }
  }
};
</script>
