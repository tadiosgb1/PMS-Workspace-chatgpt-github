<template>
  <div class="pms-brand-page p-6 bg-gray-100 min-h-screen text-sm text-slate-800">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading properties..." />

    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-black text-gray-800 tracking-tight">All Properties</h1>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Manage Real Estate Portfolio</p>
      </div>
      <button v-if="$hasPermission('pms.add_property')" @click="visible = true"
        class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap">
        <i class="fas fa-plus text-xs"></i> Add Property
      </button>
    </div>

    <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4 bg-white p-4 rounded-lg border border-gray-100">
      <div class="flex flex-wrap gap-3 items-center flex-1 w-full">
        <div class="relative flex-1 max-w-sm w-full">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input v-model="searchTerm" @input="onSearchInput" type="search"
            placeholder="Search name, city, owner..."
            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white transition" />
        </div>

        <select v-if="!zone_id_query_set" v-model="zone_id" @change="fetchProperties()"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
          <option value="">All Zones</option>
          <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.name }}</option>
        </select>

        <select v-model="status" @change="applyFilters()"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
          <option value="">All Status</option>
          <option v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
        </select>

        <select v-model="advancedFilters['property_type__name']" @change="applyFilters()"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
          <option value="">All Property Types</option>
          <option v-for="item in propertyTypeOptions" :key="item" :value="item">{{ item }}</option>
        </select>

        <input v-model="advancedFilters.city__icontains" @keyup.enter="applyFilters()" type="search"
          placeholder="City"
          class="w-full sm:w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />

        <button @click="showMoreFilters = true" type="button"
          class="inline-flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 whitespace-nowrap">
          <i class="fas fa-sliders-h"></i> More filters
          <span v-if="activeAdvancedFilterCount" class="rounded-full bg-gray-800 text-white text-[10px] px-1.5 py-0.5">{{ activeAdvancedFilterCount }}</span>
        </button>

        <select v-model="pageSize" @change="applyFilters()"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
          <option v-for="s in pageSizes" :key="s" :value="s">{{ s }} / page</option>
        </select>
      </div>

      <div class="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1 w-full lg:w-auto justify-between lg:justify-start">
        <span class="text-gray-500 px-2 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">Export Data:</span>
        <div class="flex items-center gap-1">
          <button 
            @click="exportToCSV('displayed')" 
            :disabled="properties.length === 0"
            class="px-2.5 py-1.5 bg-white hover:bg-gray-800 hover:text-white rounded border border-gray-200 text-xs font-semibold text-gray-700 transition disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-700"
            title="Export properties visible on current page matching filters"
          >
            <i class="fas fa-file-csv mr-1 text-emerald-600"></i> Current page
          </button>
          <button 
            @click="exportToCSV('all')" 
            class="px-2.5 py-1.5 bg-white hover:bg-gray-800 hover:text-white rounded border border-gray-200 text-xs font-semibold text-gray-700 transition"
            title="Export all database records across pages matching filters"
          >
            <i class="fas fa-database mr-1 text-emerald-600"></i> All properties
          </button>
        </div>
      </div>
    </div>

    <div v-if="showMoreFilters" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-6" @click.self="showMoreFilters = false">
      <section role="dialog" aria-modal="true" aria-labelledby="property-filter-title" class="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        <header class="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 id="property-filter-title" class="text-base font-bold text-gray-800">More property filters</h2>
            <p class="mt-1 text-xs text-gray-500">Combine filters to narrow results. For list filters, enter comma-separated values.</p>
          </div>
          <button type="button" @click="showMoreFilters = false" aria-label="Close filters" class="h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100"><i class="fas fa-times"></i></button>
        </header>
        <div class="overflow-y-auto p-5">
          <div class="mb-4 relative">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input v-model="filterFieldSearch" type="search" placeholder="Find a filter (e.g. owner email, price, address)"
              class="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label v-for="field in visibleAdvancedFields" :key="field.key" class="block min-w-0">
              <span class="mb-1.5 block text-xs font-semibold text-gray-600">{{ field.label }}</span>
              <select v-if="field.options === 'status'" v-model="advancedFilters[field.key]" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
                <option value="">Any status</option>
                <option v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
              </select>
              <select v-else-if="field.options === 'zones'" v-model="advancedFilters[field.key]" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
                <option value="">Choose a zone</option>
                <option v-for="z in zones" :key="z.id" :value="field.key === 'property_zone_id' ? z.id : z.name">{{ z.name }}</option>
              </select>
              <select v-else-if="field.options === 'propertyTypes'" v-model="advancedFilters[field.key]" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
                <option value="">Any property type</option>
                <option v-for="item in propertyTypeOptions" :key="item" :value="item">{{ item }}</option>
              </select>
              <input v-else v-model="advancedFilters[field.key]" :type="field.type || 'text'" :placeholder="field.placeholder || field.key"
                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              <span v-if="field.hint" class="mt-1 block text-[10px] text-gray-400">{{ field.hint }}</span>
            </label>
          </div>
        </div>
        <footer class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4">
          <button type="button" @click="clearFilters" class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">Clear filters</button>
          <div class="flex gap-2 justify-end">
            <button type="button" @click="showMoreFilters = false" class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>
            <button type="button" @click="applyFilters" class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"><i class="fas fa-filter mr-2"></i>Apply filters</button>
          </div>
        </footer>
      </section>
    </div>

    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <tr>
              <th class="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 transition-colors" @click="changeOrdering('name')">
                Property
              </th>
              <th class="px-4 py-3 text-left">Owner & Manager</th>
              <th class="px-4 py-3 text-left">Location</th>
              <th class="px-4 py-3 text-right whitespace-nowrap">Sale price</th>
              <th class="px-4 py-3 text-right whitespace-nowrap">Rent price</th>
              <th class="px-4 py-3 text-left">Type</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="p in properties" :key="p.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <span class="font-semibold text-gray-800 whitespace-nowrap">{{ p.name }}</span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-600">
                <div class="font-semibold text-gray-700 cursor-pointer hover:underline transition" @click="goToUserDetail(p.owner_id)">
                  {{ p.ownerName || '—' }}
                </div>
                <div class="text-gray-400 mt-0.5">{{ p.managerName || '—' }}</div>
              </td>
              <td class="px-4 py-3 text-xs text-gray-600">
                <div class="text-gray-700">{{ p.city || '—' }}</div>
                <div class="text-gray-400 cursor-pointer hover:underline mt-0.5" @click="goToZoneDetail(p.property_zone_id)">
                  {{ p.zoneName || '—' }}
                </div>
              </td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <span class="font-semibold text-gray-700">{{ formatPrice(getSalePrice(p)) }}</span>
              </td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <span class="text-gray-600">{{ formatPrice(getRentPrice(p)) }}</span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-500 capitalize">{{ p?.property_type?.name || '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-col items-center gap-1">
                  <!-- Status Badge with Visual Indicator -->
                  <div class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="{
                      'bg-gray-400': p.status === 'available',
                      'bg-blue-500': p.status === 'for_rent',
                      'bg-orange-500': p.status === 'for_sale', 
                      'bg-green-500': p.status === 'rent',
                      'bg-purple-500': p.status === 'sale',
                      'bg-red-500': p.status === 'under_maintenance'
                    }"></div>
                    <span class="px-1.5 py-0.5 rounded-full text-[9px] leading-3 font-semibold uppercase tracking-tight" :class="{
                      'bg-gray-100 text-gray-700': p.status === 'available',
                      'bg-blue-100 text-blue-700': p.status === 'for_rent',
                      'bg-orange-100 text-orange-700': p.status === 'for_sale',
                      'bg-green-100 text-green-700': p.status === 'rent',
                      'bg-purple-100 text-purple-700': p.status === 'sale',
                      'bg-red-100 text-red-700': p.status === 'under_maintenance'
                    }">
                      {{ getStatusLabel(p.status) }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap items-center justify-center gap-1">
                  <button v-if="$hasPermission('pms.view_property')" @click="goToDetail(p.id)" class="btn-action btn-gray" title="View details" aria-label="View details"><i class="fas fa-eye"></i></button>
                  <button v-if="$hasPermission('pms.change_property')" @click="editProperty(p)" class="btn-action btn-blue" title="Edit property" aria-label="Edit property"><i class="fas fa-pen"></i></button>
                  
                  <!-- Property Status Actions -->
                  <div class="flex flex-wrap gap-1 justify-center">
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'available'" @click="markForRent(p)" class="status-btn bg-blue-50 text-blue-600 hover:bg-blue-600" title="List for Rent">
                      <i class="fas fa-home text-xs"></i>
                    </button>
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'available'" @click="openSaleModal(p.id)" class="status-btn bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white" title="List for sale" aria-label="List for sale">
                      <i class="fas fa-tag text-xs"></i>
                    </button>
                    
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'for_rent'" @click="openRentModal(p)" class="status-btn bg-green-50 text-green-600 hover:bg-green-600 hover:text-white" title="Mark as rented" aria-label="Mark as rented">
                      <i class="fas fa-key text-xs"></i>
                    </button>
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'for_rent'" @click="markAvailable(p)" class="status-btn bg-gray-50 text-gray-600 hover:bg-gray-600" title="Remove from Rent">
                      <i class="fas fa-times text-xs"></i>
                    </button>
                    
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'for_sale'" @click="openMakeSaleModal(p)" class="status-btn bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white" title="Complete property sale" aria-label="Complete property sale">
                      <i class="fas fa-handshake text-xs"></i>
                    </button>
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'for_sale'" @click="markAvailable(p)" class="status-btn bg-gray-50 text-gray-600 hover:bg-gray-600" title="Remove from Sale">
                      <i class="fas fa-times text-xs"></i>
                    </button>
                    
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'rent'" @click="endRental(p)" class="status-btn bg-yellow-50 text-yellow-600 hover:bg-yellow-600" title="End Rental">
                      <i class="fas fa-door-open text-xs"></i>
                    </button>
                    
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'sale'" @click="markAvailable(p)" class="status-btn bg-gray-50 text-gray-600 hover:bg-gray-600" title="Reset to Available">
                      <i class="fas fa-undo text-xs"></i>
                    </button>
                    
                    <button v-if="$hasPermission('pms.change_property') && p.status !== 'under_maintenance'" @click="markMaintenance(p)" class="status-btn bg-red-50 text-red-600 hover:bg-red-600" title="Mark for Maintenance">
                      <i class="fas fa-tools text-xs"></i>
                    </button>
                    <button v-if="$hasPermission('pms.change_property') && p.status === 'under_maintenance'" @click="markAvailable(p)" class="status-btn bg-green-50 text-green-600 hover:bg-green-600" title="Mark Fixed">
                      <i class="fas fa-check-circle text-xs"></i>
                    </button>
                  </div>

                  <!-- Payment Related Actions -->
                  <button v-if="p.status === 'rent'" @click="rentPay(p.id)" class="btn-action bg-green-50 text-green-600 hover:bg-green-600 hover:text-white" title="Rental Payments"><i class="fas fa-receipt"></i></button>
                  <button v-if="p.status === 'sale'" @click="salesPay(p.id)" class="btn-action bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white" title="Sales Payments"><i class="fas fa-dollar-sign"></i></button>
                  
                  <!-- Listing Actions -->
                  <button v-if="$hasPermission('pms.change_property') && p.status === 'for_sale'" @click="openSaleModal(p.id)" class="btn-action btn-orange" title="Edit sale listing" aria-label="Edit sale listing"><i class="fas fa-tag"></i></button>
                  
                  <button v-if="$hasPermission('pms.delete_property')" @click="askDeleteConfirmation(p)" class="btn-action btn-delete" title="Delete property" aria-label="Delete property"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            </tr>
            <tr v-if="!properties.length && !loading">
              <td colspan="8" class="px-4 py-10 text-center text-sm text-gray-400 italic">No properties found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100">
      <span class="text-xs text-gray-500">
        Page <span class="font-semibold text-gray-700">{{ currentPage }}</span> of <span class="font-semibold text-gray-700">{{ totalPages }}</span>
      </span>
      <div class="flex items-center gap-2">
        <button :disabled="!previous" @click="fetchProperties(previous)" class="btn-page">
          <i class="fas fa-chevron-left text-[10px]"></i> Prev
        </button>
        <span class="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-bold min-w-[2rem] text-center">
          {{ currentPage }}
        </span>
        <button :disabled="!next" @click="fetchProperties(next)" class="btn-page">
          Next <i class="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <AddProperty v-if="visible" :visible="visible" @close="visible = false" @refresh="fetchProperties" />
    <UpdateProperty v-if="updateVisible" :visible="updateVisible" :property="propertyToEdit" @close="updateVisible = false" @refresh="fetchProperties" />
    <ConfirmModal v-if="confirmVisible" :visible="confirmVisible" title="Delete Property"
      message="This is permanent. Remove this property?" @confirm="confirmDelete" @cancel="confirmVisible = false" />
    <MakePropertySale v-if="makeSaleVisible" :visible="makeSaleVisible" :listing="saleExecutionListing"
      @close="makeSaleVisible = false" @success="onPropertySaleSuccess" />
    <AddRent v-if="rentModalVisible" :visible="rentModalVisible" :propertyId="rentPropertyId"
      @close="rentModalVisible = false" @refresh="fetchProperties" />
    <SaleModal v-if="saleVisible" :visible="saleVisible" :propertyId="salePropertyId" sourceType="property"
      @close="saleVisible = false" @refresh="fetchProperties" />
  </div>
</template>

<script>
import AddProperty from "@/views/closed/proporty/add.vue";
import UpdateProperty from "@/views/closed/proporty/update.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Toast from "@/components/Toast.vue";
import SaleModal from "../propertiesListForSale/add.vue";
import AddRent from "@/views/closed/rent/add.vue";
import MakePropertySale from "@/views/closed/propertiesListForSale/MakePropertySale.vue";
import Loading from "@/components/Loading.vue";

export default {
  name: "PropertyView",
  components: { AddProperty, UpdateProperty, ConfirmModal, Toast, SaleModal, AddRent, MakePropertySale, Loading },
  data() {
    return {
      zones: [], zone_id: "", zone_id_query_set: false,
      properties: [], visible: false, updateVisible: false, confirmVisible: false,
      propertyToEdit: null, propertyToDelete: null,
      makeSaleVisible: false, saleExecutionListing: null,
      rentModalVisible: false, rentPropertyId: null,
      searchTerm: "", currentPage: 1, totalPages: 1, next: null, previous: null,
      pageSize: 10, pageSizes: [10, 20, 50, 100, 1000],
      ordering: "-id", status: "",
      showMoreFilters: false, filterFieldSearch: "",
      statusOptions: [
        { value: "available", label: "Available (New)" },
        { value: "for_rent", label: "Available for Rent" },
        { value: "for_sale", label: "Available for Sale" },
        { value: "rent", label: "Rented" },
        { value: "sale", label: "Sold" },
        { value: "under_maintenance", label: "Under Maintenance" },
      ],
      advancedFilters: {
        "ordering": "",
        "property_zone_id__name": "",
        "property_zone_id__owner_id__email": "",
        "property_zone_id__manager_id__email": "",
        "property_zone_id__owner_id__id": "",
        "property_zone_id__manager_id__id": "",
        "status": "",
        "status__in": "",
        "property_zone_id": "",
        "property_type__name": "",
        "property_type__name__in": "",
        "property_type__name__icontains": "",
        "property_type__id": "",
        "property_type__id__in": "",
        "property_type__parent_property_type__name": "",
        "property_type__parent_property_type__name__in": "",
        "property_type__parent_property_type__name__icontains": "",
        "property_type__parent_property_type__id": "",
        "property_type__parent_property_type__id__in": "",
        "property_type_category": "",
        "property_type_category__id": "",
        "property_type_category__id__in": "",
        "property_type_category__name": "",
        "property_type_category__name__in": "",
        "property_type_category__name__icontains": "",
        "property_type_category__property_type__id": "",
        "property_type_category__property_type__id__in": "",
        "property_type_category__property_type__name": "",
        "property_type_category__property_type__name__in": "",
        "property_type_category__property_type__name__icontains": "",
        "city": "",
        "city__icontains": "",
        "address": "",
        "address__icontains": "",
        "state": "",
        "state__icontains": "",
        "price": "",
        "price__gte": "",
        "price__lte": "",
        "price__gt": "",
        "price__lt": "",
        "property_type_category__property_type__is_sellable": "",
        "property_type_category__property_type__is_rentable": "",
        "furnished": "",
        "property_type_category__property_type__has_project_completion": "",
        "property_type_category__property_type__project_completion_year": "",
        "property_type_category__property_type__has_project_status": "",
        "property_type_category__property_type__project_status": "",
        "property_type_category__property_type__has_pre_handover_payment": "",
        "property_type_category__property_type__pre_handover_payment": "",
      },
      advancedFields: [
        { key: "ordering", label: "Sort order" },
        { key: "property_zone_id__name", label: "Zone name", options: "zones" },
        { key: "property_zone_id__owner_id__email", label: "Zone owner email" },
        { key: "property_zone_id__manager_id__email", label: "Zone manager email" },
        { key: "property_zone_id__owner_id__id", label: "Zone owner ID" },
        { key: "property_zone_id__manager_id__id", label: "Zone manager ID" },
        { key: "status", label: "Status", options: "status" },
        { key: "status__in", label: "Statuses (comma-separated)", hint: "Comma-separated values" },
        { key: "property_zone_id", label: "Property zone", options: "zones" },
        { key: "property_type__name", label: "Property type", options: "propertyTypes" },
        { key: "property_type__name__in", label: "Property types (comma-separated)", hint: "Comma-separated values" },
        { key: "property_type__name__icontains", label: "Property type contains" },
        { key: "property_type__id", label: "Property type ID" },
        { key: "property_type__id__in", label: "Property type IDs (comma-separated)", hint: "Comma-separated values" },
        { key: "property_type__parent_property_type__name", label: "Parent property type" },
        { key: "property_type__parent_property_type__name__in", label: "Parent types (comma-separated)", hint: "Comma-separated values" },
        { key: "property_type__parent_property_type__name__icontains", label: "Parent type contains" },
        { key: "property_type__parent_property_type__id", label: "Parent property type ID" },
        { key: "property_type__parent_property_type__id__in", label: "Parent type IDs (comma-separated)", hint: "Comma-separated values" },
        { key: "property_type_category", label: "Property type category" },
        { key: "property_type_category__id", label: "Category ID" },
        { key: "property_type_category__id__in", label: "Category IDs (comma-separated)", hint: "Comma-separated values" },
        { key: "property_type_category__name", label: "Category name" },
        { key: "property_type_category__name__in", label: "Category names (comma-separated)", hint: "Comma-separated values" },
        { key: "property_type_category__name__icontains", label: "Category name contains" },
        { key: "property_type_category__property_type__id", label: "Category property type ID" },
        { key: "property_type_category__property_type__id__in", label: "Category property type IDs (comma-separated)", hint: "Comma-separated values" },
        { key: "property_type_category__property_type__name", label: "Category property type name" },
        { key: "property_type_category__property_type__name__in", label: "Category property type names (comma-separated)", hint: "Comma-separated values" },
        { key: "property_type_category__property_type__name__icontains", label: "Category property type contains" },
        { key: "city", label: "City (exact)" },
        { key: "city__icontains", label: "City contains" },
        { key: "address", label: "Address (exact)" },
        { key: "address__icontains", label: "Address contains" },
        { key: "state", label: "State (exact)" },
        { key: "state__icontains", label: "State contains" },
        { key: "price", label: "Price (exact)", type: "number" },
        { key: "price__gte", label: "Minimum price", type: "number" },
        { key: "price__lte", label: "Maximum price", type: "number" },
        { key: "price__gt", label: "Price greater than", type: "number" },
        { key: "price__lt", label: "Price less than", type: "number" },
        { key: "property_type_category__property_type__is_sellable", label: "Sellable" },
        { key: "property_type_category__property_type__is_rentable", label: "Rentable" },
        { key: "furnished", label: "Furnished" },
        { key: "property_type_category__property_type__has_project_completion", label: "Has project completion" },
        { key: "property_type_category__property_type__project_completion_year", label: "Project completion year", type: "number" },
        { key: "property_type_category__property_type__has_project_status", label: "Has project status" },
        { key: "property_type_category__property_type__project_status", label: "Project status" },
        { key: "property_type_category__property_type__has_pre_handover_payment", label: "Has pre-handover payment" },
        { key: "property_type_category__property_type__pre_handover_payment", label: "Pre-handover payment" },
      ],
      saleVisible: false, salePropertyId: null, loading: false,
    };
  },
  computed: {
    propertyTypeOptions() {
      const values = this.properties.map((p) => p?.property_type?.name || p?.property_type).filter((v) => typeof v === "string" && v.trim());
      return [...new Set(values)].sort((a, b) => a.localeCompare(b));
    },
    visibleAdvancedFields() {
      const query = this.filterFieldSearch.trim().toLowerCase();
      if (!query) return this.advancedFields;
      return this.advancedFields.filter((field) => field.label.toLowerCase().includes(query) || field.key.toLowerCase().includes(query));
    },
    activeAdvancedFilterCount() {
      return Object.values(this.advancedFilters).filter((value) => value !== "" && value !== null && value !== undefined).length;
    },
  },
  async created() {
    if (this.$route.query.zone_id) this.zone_id_query_set = true;
    if (this.$route.query.zone) {
      this.zone_id = this.$route.query.zone;
      this.zone_id_query_set = true;
    }
    const r = await this.$getZones();
    this.zones = r.zones || [];
    await this.fetchProperties();
  },
  methods: {
    getSalePrice(property) {
      return property.property_sale?.listing_price
        ?? property.property_sale_listing?.listing_price
        ?? property.sale_listing?.listing_price
        ?? property.sale?.listing_price
        ?? property.listing_price
        ?? property.sale_price
        ?? property.price;
    },
    getRentPrice(property) {
      return property.rent
        ?? property.rent_price
        ?? property.rental_price
        ?? property.monthly_rent;
    },
    formatPrice(value) {
      if (value === null || value === undefined || value === "") return "—";
      const amount = Number(value);
      if (!Number.isFinite(amount) || amount === 0) return "—";
      return amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
    },
    async fetchProperties(url = null) {
      this.loading = true;
      try {
        let params = this.buildPropertyQuery();
        if (url) {
          const urlObj = new URL(url, window.location.origin);
          params = Object.fromEntries(urlObj.searchParams.entries());
          const pageParam = urlObj.searchParams.get("page");
          if (pageParam) this.currentPage = parseInt(pageParam, 10);
          // Preserve currently selected filters while following API pagination links.
          params = { ...this.buildPropertyQuery(), ...params, page: pageParam || this.currentPage, page_size: this.pageSize };
        }

        const result = await this.$getProperties(params);
        this.properties = result.properties || [];
        this.currentPage = result.currentPage || this.currentPage;
        this.totalPages = result.totalPages || 1;
        this.next = result.next;
        this.previous = result.previous;
      } catch (e) {
        console.error(e); this.properties = [];
      } finally { this.loading = false; }
    },
    buildPropertyQuery() {
      const params = {
        page: this.currentPage,
        page_size: this.pageSize,
        search: this.searchTerm.trim(),
        ordering: this.advancedFilters.ordering || this.ordering || "-id",
      };
      const selectedZoneId = this.$route.query.zone_id || this.zone_id;
      if (selectedZoneId) {
        params.property_zone_id = selectedZoneId;
        const selectedZone = this.zones.find((zone) => String(zone.id) === String(selectedZoneId));
        if (selectedZone?.name) params["property_zone_id__name"] = selectedZone.name;
      }
      Object.entries(this.advancedFilters).forEach(([key, rawValue]) => {
        const value = rawValue == null ? "" : String(rawValue).trim();
        if (!value) return;
        if (key === "ordering") {
          params.ordering = value;
          return;
        }
        if (key === "status") {
          params.status = value;
          return;
        }
        // Keep the main zone dropdown authoritative when the same zone filter is used.
        if (key === "property_zone_id" && selectedZoneId) return;
        params[key] = value;
      });
      if (this.status) params.status = this.status;
      return params;
    },
    applyFilters() {
      this.currentPage = 1;
      this.showMoreFilters = false;
      this.fetchProperties();
    },
    clearFilters() {
      this.searchTerm = "";
      this.zone_id = this.zone_id_query_set ? (this.$route.query.zone_id || this.$route.query.zone || "") : "";
      this.status = "";
      this.ordering = "-id";
      Object.keys(this.advancedFilters).forEach((key) => { this.advancedFilters[key] = ""; });
      this.advancedFilters.ordering = "";
      this.currentPage = 1;
      this.showMoreFilters = false;
      this.fetchProperties();
    },
    onSearchInput() {
      this.currentPage = 1;
      this.fetchProperties();
    },
    changeOrdering(field) {
      this.ordering = this.ordering === field ? `-${field}` : field;
      this.fetchProperties();
    },
    editProperty(p) { this.propertyToEdit = p; this.updateVisible = true; },
    askDeleteConfirmation(p) { this.propertyToDelete = p; this.confirmVisible = true; },
    async confirmDelete() {
      this.confirmVisible = false;
      if (!this.$hasPermission("pms.delete_property")) {
        this.$root.$refs.toast.showToast("You do not have permission to delete properties.", "error");
        return;
      }
      try {
        const res = await this.$apiDelete(`/delete_property/${this.propertyToDelete.id}`);
        this.$root.$refs.toast.showToast(res.message || "Deleted", "success");
        this.fetchProperties();
      } catch (e) { this.$root.$refs.toast.showToast("Failed to delete", "error"); }
      this.propertyToDelete = null;
    },
    openSaleModal(id) {
      if (!this.$hasPermission("pms.change_property")) {
        this.$root.$refs.toast.showToast("You do not have permission to change property listings.", "error");
        return;
      }
      this.salePropertyId = id; this.saleVisible = true;
    },
    goToUserDetail(id) { if (id) this.$router.push(`/user_detail/${id}`); },
    goToZoneDetail(id) { if (id) this.$router.push(`/zones/${id}`); },
    goToDetail(id) { if (id) this.$router.push({ name: "PropertyDetail", params: { id } }); },
    rentPay(id) { if (id) this.$router.push({ name: "rentPay", params: { id } }); },
    salesPay(id) { if (id) this.$router.push(`/sales-payments?property_id=${id}`); },

    // Status Management Methods
    getStatusLabel(status) {
      const labels = {
        'available': 'Available',
        'for_rent': 'For Rent',
        'for_sale': 'For Sale', 
        'rent': 'Rented',
        'sale': 'Sold',
        'under_maintenance': 'Maintenance'
      };
      return labels[status] || status;
    },

    async updatePropertyStatus(property, newStatus, successMessage) {
      if (!this.$hasPermission("pms.change_property")) {
        this.$root.$refs.toast.showToast("You do not have permission to change property status.", "error");
        return;
      }
      try {
        const res = await this.$apiPatch(`/update_property`, property.id, {
          id: property.id,
          status: newStatus
        });
        if (res) {
          this.$root.$refs.toast.showToast(successMessage, "success");
          await this.fetchProperties();
        }
      } catch (error) {
        console.error('Status update failed:', error);
        this.$root.$refs.toast.showToast("Failed to update property status", "error");
      }
    },

    markForRent(property) {
      this.updatePropertyStatus(property, 'for_rent', 'Property listed for rent');
    },

    markForSale(property) {
      this.updatePropertyStatus(property, 'for_sale', 'Property listed for sale');
    },

    openRentModal(property) {
      if (!this.$hasPermission("pms.change_property")) {
        this.$root.$refs.toast.showToast("You do not have permission to change property status.", "error");
        return;
      }
      this.rentPropertyId = property.id;
      this.rentModalVisible = true;
    },

    openMakeSaleModal(property) {
      if (!this.$hasPermission("pms.change_property")) {
        this.$root.$refs.toast.showToast("You do not have permission to complete a property sale.", "error");
        return;
      }
      const existingListing = property.property_sale_listing
        || property.property_sale
        || property.sale_listing
        || property.sale;
      const zoneValue = property.property_zone_id;
      this.saleExecutionListing = {
        ...property,
        ...(existingListing && typeof existingListing === "object" ? existingListing : {}),
        listing_price: existingListing?.listing_price ?? this.getSalePrice(property),
        property_zone_id: zoneValue && typeof zoneValue === "object" ? zoneValue : { id: zoneValue },
      };
      this.makeSaleVisible = true;
    },

    async onPropertySaleSuccess() {
      this.makeSaleVisible = false;
      await this.fetchProperties();
    },

    markAvailable(property) {
      this.updatePropertyStatus(property, 'available', 'Property marked as available');
    },

    markMaintenance(property) {
      this.updatePropertyStatus(property, 'under_maintenance', 'Property marked for maintenance');
    },

    endRental(property) {
      // When ending rental, property becomes available again
      this.updatePropertyStatus(property, 'available', 'Rental ended - property now available');
    },

    // CSV Structural File Matrix Processing Engine
    async exportToCSV(type) {
      this.loading = true;
      let dataset = [];

      try {
        if (type === "displayed") {
          dataset = this.properties;
        } else if (type === "all") {
          // Direct API query hitting maximum bounds with matching parameters to process background pipeline
          const params = { ...this.buildPropertyQuery(), page: 1, page_size: 1000000 };

          const result = await this.$getProperties(params);
          dataset = result.properties || [];
        }

        if (dataset.length === 0) {
          this.$root.$refs.toast.showToast("No matching data available to build target spreadsheet", "error");
          return;
        }

        // Establish core headers matching property schema data definitions
        const headers = ["Property ID", "Property Name", "Owner Name", "Manager Name", "City", "Zone Name", "Sale price", "Rent price", "Property Type", "Status"];
        const sanitizeToken = (val) => val ? `"${String(val).replace(/"/g, '""')}"` : '""';

        const rowStream = [
          headers.join(","),
          ...dataset.map(p => [
            sanitizeToken(p.id),
            sanitizeToken(p.name),
            sanitizeToken(p.ownerName || "N/A"),
            sanitizeToken(p.managerName || "N/A"),
            sanitizeToken(p.city || "N/A"),
            sanitizeToken(p.zoneName || "N/A"),
            sanitizeToken(this.getSalePrice(p) ?? "N/A"),
            sanitizeToken(this.getRentPrice(p) ?? "N/A"),
            sanitizeToken(p.property_type?.name || p.property_type || "N/A"),
            sanitizeToken(p.status || "N/A")
          ].join(","))
        ];

        // Format CSV context string as a downloadable Blob document element
        const documentString = "data:text/csv;charset=utf-8," + encodeURIComponent(rowStream.join("\n"));
        const downloadAnchor = document.createElement("a");
        
        downloadAnchor.setAttribute("href", documentString);
        downloadAnchor.setAttribute("download", `Properties_Export_${type}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(downloadAnchor);
        
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        this.$root.$refs.toast.showToast("Real estate inventory spreadsheet downloaded successfully", "success");
      } catch (error) {
        console.error("Export sequence malfunction:", error);
        this.$root.$refs.toast.showToast("Failed to compile target data matrix file", "error");
      } finally {
        this.loading = false;
      }
    }
  },
};
</script>

<style scoped>
.btn-action { @apply h-6 w-6 flex items-center justify-center rounded-md text-[10px] transition-colors; }
.btn-blue   { @apply bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white; }
.btn-green  { @apply bg-green-50 text-green-600 hover:bg-green-600 hover:text-white; }
.btn-orange { @apply bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white; }
.btn-red    { @apply bg-red-50 text-red-600 hover:bg-red-600 hover:text-white; }
.btn-delete { @apply bg-red-100 text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-600 hover:text-white hover:ring-red-600; }
.btn-gray   { @apply bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white; }
.btn-page   { @apply flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all; }
.status-btn { @apply h-5 w-5 flex items-center justify-center rounded text-[9px] transition-colors; }
</style>