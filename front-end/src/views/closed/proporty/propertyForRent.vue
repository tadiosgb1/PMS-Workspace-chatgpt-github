<template>
  <div class="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6">
    <div class="mx-auto max-w-7xl">
      <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Rentals</p>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Properties for Rent</h1>
          <p class="mt-1 text-sm text-slate-500">Browse and manage properties currently listed for rent.</p>
        </div>
        <button type="button" @click="fetchProperties()" :disabled="loading"
          class="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60">
          <i class="fas fa-rotate-right" :class="{ 'fa-spin': loading }"></i>
          Refresh
        </button>
      </header>

      <div class="mb-5 flex flex-col gap-3 border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative w-full sm:max-w-md">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input v-model="searchTerm" type="search" placeholder="Search property, city, or address"
            class="w-full border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="text-sm text-slate-500">
          <span class="font-semibold text-slate-800">{{ count }}</span> properties for rent
        </div>
      </div>

      <div v-if="error" class="mb-5 flex items-start gap-3 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <i class="fas fa-circle-exclamation mt-0.5"></i>
        <div class="flex-1">{{ error }}</div>
        <button type="button" @click="fetchProperties()" class="font-semibold underline">Try again</button>
      </div>

      <div v-if="loading && properties.length === 0" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div v-for="n in 6" :key="n" class="h-72 animate-pulse border border-slate-200 bg-white">
          <div class="h-40 bg-slate-100"></div><div class="space-y-3 p-4"><div class="h-4 w-2/3 bg-slate-100"></div><div class="h-3 w-1/2 bg-slate-100"></div><div class="h-8 bg-slate-100"></div></div>
        </div>
      </div>

      <div v-else-if="filteredProperties.length" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <article v-for="property in filteredProperties" :key="property.id" class="group overflow-hidden border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div class="relative h-52 bg-slate-100">
            <img v-if="imageFor(property)" :src="imageFor(property)" :alt="property.name || 'Rental property'"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" @error="hideBrokenImage" />
            <div v-else class="flex h-full items-center justify-center text-slate-300">
              <i class="fas fa-house text-4xl"></i>
            </div>
            <span class="absolute left-3 top-3 bg-emerald-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">For Rent</span>
            <span v-if="property.furnished" class="absolute right-3 top-3 bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700">Furnished</span>
          </div>
          <div class="p-4">
            <div class="mb-2 flex items-start justify-between gap-3">
              <h2 class="line-clamp-1 text-lg font-bold text-slate-900">{{ property.name || 'Untitled property' }}</h2>
              <span class="shrink-0 text-right text-lg font-extrabold text-indigo-700">{{ formatMoney(property.rent ?? property.price) }}<span class="text-xs font-medium text-slate-500"> / month</span></span>
            </div>
            <p class="mb-4 flex items-center gap-2 text-sm text-slate-500">
              <i class="fas fa-location-dot text-slate-400"></i>
              <span class="line-clamp-1">{{ locationFor(property) }}</span>
            </p>
            <div class="grid grid-cols-3 border-y border-slate-100 py-3 text-sm">
              <div class="flex items-center gap-2 text-slate-600"><i class="fas fa-bed text-slate-400"></i><span>{{ numberLabel(property.bed_rooms) }} beds</span></div>
              <div class="flex items-center gap-2 text-slate-600"><i class="fas fa-bath text-slate-400"></i><span>{{ numberLabel(property.bath_rooms) }} baths</span></div>
              <div class="flex items-center gap-2 text-slate-600"><i class="fas fa-ruler-combined text-slate-400"></i><span>{{ property.area || '—' }} area</span></div>
            </div>
            <p v-if="property.content || property.description" class="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{{ property.content || property.description }}</p>
            <div class="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Property #{{ property.id }}</span>
              <span v-if="property.property_zone?.name" class="line-clamp-1 max-w-[60%]">{{ property.property_zone.name }}</span>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-slate-100 text-slate-400"><i class="fas fa-house-circle-check text-2xl"></i></div>
        <h2 class="text-lg font-bold text-slate-800">{{ searchTerm ? 'No matching properties' : 'No properties for rent yet' }}</h2>
        <p class="mt-1 text-sm text-slate-500">{{ searchTerm ? 'Try another property name or location.' : 'Properties returned by the rental listings API will appear here.' }}</p>
        <button v-if="searchTerm" type="button" @click="searchTerm = ''" class="mt-4 text-sm font-semibold text-indigo-700 hover:underline">Clear search</button>
      </div>

      <footer v-if="properties.length || previous || next" class="mt-6 flex flex-col gap-3 border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-slate-500">Page <span class="font-semibold text-slate-800">{{ currentPage }}</span> of <span class="font-semibold text-slate-800">{{ totalPages }}</span></p>
        <div class="flex gap-2">
          <button type="button" @click="fetchProperties(previous)" :disabled="!previous || loading"
            class="border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
            <i class="fas fa-arrow-left mr-2"></i>Previous
          </button>
          <button type="button" @click="fetchProperties(next)" :disabled="!next || loading"
            class="border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
            Next<i class="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const RENTAL_PROPERTIES_URL = 'https://alphapms.sunriseworld.org/api/get_properties?status__in=for_rent';

export default {
  name: 'PropertyForRent',
  data() {
    return {
      properties: [],
      count: 0,
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
      searchTerm: '',
      loading: false,
      error: '',
    };
  },
  computed: {
    filteredProperties() {
      const query = this.searchTerm.trim().toLowerCase();
      if (!query) return this.properties;
      return this.properties.filter((property) =>
        [property.name, property.address, property.city, property.state, property.zip_code, property.property_zone?.name]
          .some((value) => String(value || '').toLowerCase().includes(query))
      );
    },
  },
  created() {
    this.fetchProperties();
  },
  methods: {
    async fetchProperties(url = null) {
      if (this.loading) return;
      this.loading = true;
      this.error = '';
      try {
        const token = localStorage.getItem('access') || localStorage.getItem('token');
        const response = await axios.get(url || RENTAL_PROPERTIES_URL, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const result = response.data || {};
        this.properties = Array.isArray(result.data) ? result.data : [];
        this.count = Number(result.count || 0);
        this.currentPage = Number(result.current_page || 1);
        this.totalPages = Number(result.total_pages || 1);
        this.next = result.next || null;
        this.previous = result.previous || null;
      } catch (err) {
        console.error('Failed to load rental properties:', err);
        this.error = err.response?.data?.detail || err.response?.data?.message || 'Could not load properties for rent. Please check your connection and try again.';
      } finally {
        this.loading = false;
      }
    },
    imageFor(property) {
      const picture = property.property_pictures?.[0]?.property_image
        || property.pictures?.[0]?.property_image;
      if (!picture) return '';
      if (/^https?:\/\//i.test(picture)) return picture;
      return `https://alphapms.sunriseworld.org${picture.startsWith('/') ? '' : '/'}${picture}`;
    },
    hideBrokenImage(event) {
      event.target.style.display = 'none';
    },
    locationFor(property) {
      return [property.address, property.city, property.state].filter(Boolean).join(', ') || 'Location not specified';
    },
    numberLabel(value) {
      if (value === null || value === undefined || value === '') return '—';
      const parsed = Number(value);
      return Number.isFinite(parsed) ? String(parsed) : String(value);
    },
    formatMoney(value) {
      if (value === null || value === undefined || value === '') return 'Price on request';
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return String(value);
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(parsed);
    },
  },
};
</script>
