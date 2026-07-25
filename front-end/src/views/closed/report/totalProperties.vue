<template>

    <div
      v-if="totalPropertiesVisible"
      class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-auto"
    >
      <div class="bg-white w-full sm:w-auto sm:max-w-[700px] md:max-w-[850px] lg:max-w-[950px] xl:max-w-[1050px] rounded-lg shadow-lg overflow-hidden relative mx-auto">
        
        <!-- Header -->
        <div class="bg-primary hover:bg-primary text-white px-6 py-4 text-xl font-semibold flex justify-between items-center">
          Add New Rent
          <button @click="$emit('close')" class="text-white hover:text-gray-200 text-lg font-bold">✕</button>
        </div>

        <button 
          @click="downloadProperties"
          class="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          ⬇ Download
        </button>

       
      </div>
    </div>
</template>

<script>

 export default {

    props: {
    totalPropertiesVisible: Boolean,

  },

      data(){

         return {

      properties: []

         }

      },

      mounted() {
    this.fetchTotalProperties();
  },

  methods:{

    async fetchTotalProperties() {
      try {
        const response = await this.$apiGet("/get_properties");
        if (response) {
          this.stats.totalProperties = response.count ?? 0;

          this.properties = [];
          let nextUrl = "/get_properties";
          while (nextUrl) {
            const pageRes = await this.$apiGet(nextUrl);
            if (pageRes && pageRes.data) {
              this.properties.push(...pageRes.data);
              nextUrl = pageRes.next
                ? pageRes.next.replace("https://alphapms.sunriseworld.org/api", "")
                : null;
            } else {
              nextUrl = null;
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch total properties:", error);
      }
    },
      /** ------------------ DOWNLOAD AS EXCEL ------------------ **/
    downloadProperties() {
      if (!this.properties.length) return alert("No property data available.");
      const cleaned = this.properties.map(p => ({
        ID: p.id,
        Name: p.name,
        Type: p.property_type,
        Address: p.address,
        City: p.city,
        State: p.state,
        Zip: p.zip_code,
        Price: p.price,
        Bedrooms: p.bed_rooms,
        Bathrooms: p.bath_rooms,
        Rent: p.rent,
        Status: p.status,
        CreatedAt: p.created_at,
      }));
      this.exportExcel(cleaned, "Properties.xlsx", "Properties");
    },

  }




 }

</script>