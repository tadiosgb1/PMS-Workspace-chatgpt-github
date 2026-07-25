<template>
  <div class="custom-scrollbar overflow-y-auto h-full">
    <Toast ref="toast" />
    <Loading :visible="loading" message="Loading Contacts..." />

    <div class="min-h-screen bg-slate-50/50 p-4 md:p-2">
      <div class="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-100">
        
        <div class="bg-gradient-to-r from-primary to-dprimary px-8 py-6">
          <h2 class="text-white text-xl font-black tracking-tight flex items-center gap-3">
            <i class="fas fa-address-book opacity-80"></i>
            Contact Messages
          </h2>
          <p class="text-white/70 text-xs font-medium uppercase tracking-widest mt-1">Manage user inquiries and feedback</p>
        </div>

        <div class="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-50">
          <div class="relative w-full max-w-md group">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"></i>
            <input
              v-model="contactSearch"
              @input="fetchContactUs"
              type="search"
              placeholder="Search by name, email, or subject..."
              class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>

          <div class="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <label for="contactPageSize" class="text-xs font-black uppercase tracking-wider text-slate-500">Show</label>
            <select
              id="contactPageSize"
              v-model="contactPageSize"
              @change="fetchContactUs"
              class="bg-transparent font-bold text-sm text-primary focus:outline-none cursor-pointer"
            >
              <option v-for="size in contactPageSizes" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
            <span class="text-xs font-black uppercase tracking-wider text-slate-500">Rows</span>
          </div>
        </div>

        <div class="overflow-x-auto hidden md:block">
          <table class="min-w-full table-auto text-sm text-left">
            <thead>
              <tr class="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                <th class="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Full Name</th>
                <th class="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Email</th>
                <th class="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Subject</th>
                <th class="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Message</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="msg in contactMessages" :key="msg.id" class="hover:bg-primary/[0.02] transition-colors group">
                <td class="px-6 py-4 font-bold text-slate-700">{{ msg.full_name }}</td>
                <td class="px-6 py-4">
                  <span class="text-primary hover:underline cursor-pointer font-medium">{{ msg.email }}</span>
                </td>
                <td class="px-6 py-4 font-semibold text-slate-600">{{ msg.subject }}</td>
                <td class="px-6 py-4 text-slate-500 max-w-xs truncate" :title="msg.message">
                  {{ msg.message }}
                </td>
              </tr>
              <tr v-if="contactMessages.length === 0">
                <td colspan="4" class="text-center py-12">
                   <i class="fas fa-inbox block text-3xl text-slate-200 mb-2"></i>
                   <span class="text-slate-400 font-medium">No messages found in your inbox.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="md:hidden space-y-4 p-4 bg-slate-50">
          <div
            v-for="msg in contactMessages"
            :key="msg.id"
            class="border border-slate-100 rounded-2xl p-5 shadow-sm bg-white"
          >
            <div class="flex justify-between items-start mb-3">
               <h3 class="font-black text-slate-800">{{ msg.full_name }}</h3>
               <span class="text-[10px] bg-secondary/10 text-secondary px-2 py-1 rounded-full font-black uppercase">New</span>
            </div>
            <div class="space-y-2 text-sm">
              <p class="flex items-center gap-2 text-slate-500"><i class="fas fa-envelope w-4 text-primary"></i> {{ msg.email }}</p>
              <p class="flex items-center gap-2 text-slate-700 font-bold"><i class="fas fa-bookmark w-4 text-primary"></i> {{ msg.subject }}</p>
              <div class="mt-3 p-3 bg-slate-50 rounded-lg text-slate-600 italic">
                "{{ msg.message }}"
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center p-6 border-t border-slate-50 bg-white">
          <button
            :disabled="!contactPrev"
            @click="fetchContactUs(contactPrev)"
            class="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <i class="fas fa-arrow-left text-xs"></i> Previous
          </button>
          
          <div class="hidden sm:flex items-center gap-1">
            <span class="text-xs font-black uppercase tracking-widest text-slate-400">Page</span>
            <span class="bg-primary/10 text-primary px-3 py-1 rounded-lg font-black text-sm">{{ contactCurrentPage }}</span>
            <span class="text-xs font-black uppercase tracking-widest text-slate-400 px-1">of</span>
            <span class="text-slate-700 font-black text-sm">{{ contactTotalPages }}</span>
          </div>

          <button
            :disabled="!contactNext"
            @click="fetchContactUs(contactNext)"
            class="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all bg-primary text-white shadow-lg shadow-primary/20 hover:bg-dprimary disabled:opacity-50 disabled:shadow-none"
          >
            Next <i class="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Unified Thin Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}

/* Custom transitions */
tr {
  transition: all 0.2s ease;
}
</style>

<script>
import Toast from "@/components/Toast.vue";
import Loading from "@/components/Loading.vue"; // <-- Added Loading



export default {
  name: "ContactView",
  components: { Toast,Loading },
  data() {
    return {
      contactMessages: [],
      contactSearch: "",
      contactPageSize: 10,
      contactPageSizes: [5, 10, 20, 50, 100],
      contactCurrentPage: 1,
      contactTotalPages: 1,
      contactNext: null,
      contactPrev: null,
      loading:false,
    };
  },
  mounted() {
    this.fetchContactUs();
  },
  methods: {
    async fetchContactUs(url = null) {
      this.loading=true;
      try {
        const params = {
          page_size: this.contactPageSize,
          search: this.contactSearch || "",
          ordering: "-id",
        };
        const res = url
          ? await this.$apiGet(url)
          : await this.$apiGet("/contact_us", params);

        const data = res.data?.results || res.data || [];
        this.contactMessages = Array.isArray(data) ? data : [];

        this.contactNext = res.next || null;
        this.contactPrev = res.previous || null;
        this.contactCurrentPage =
          res.current_page ||
          (this.contactNext || this.contactPrev
            ? this.contactCurrentPage
            : 1);
        this.contactTotalPages = res.total_pages || 1;
      } catch (error) {
        console.error("Failed to fetch contact messages:", error);
        this.contactMessages = [];
        this.$refs.toast?.showToast("Failed to fetch messages", "error");
      }finally{
        this.loading=false;
      }
    },
  },
};
</script>
