<template>
  <div>
    <Toast ref="toast" />
    <div class="min-h-screen bg-gray-100 p-6">
      <div class="max-w-7xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-primary text-white px-6 py-4 text-xl font-bold flex justify-between items-center">
          Property Pictures
          <button
            @click="showAdd = true"
            class="bg-white text-blue-700 font-semibold px-1 lg:px-4 py-2 rounded shadow hover:bg-gray-100 hover:shadow-md transition-all duration-200 border border-gray-300"
          >
            <span class="text-primary">+</span> Add
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Search pictures..."
            class="w-full max-w-md px-4 py-2 mb-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div class="overflow-x-auto">
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-sm">
              <thead>
                <tr class="bg-gray-200 text-gray-700 text-left">
                  <th class="border border-gray-300 px-3 py-2">ID</th>
                  <th class="border border-gray-300 px-3 py-2">Description</th>
                  <th class="border border-gray-300 px-3 py-2">Image</th>
                  <th class="border border-gray-300 px-3 py-2">Property ID</th>
                  <th class="border border-gray-300 px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pic in filtered" :key="pic.id" class="hover:bg-gray-100">
                  <td class="border border-gray-300 px-3 py-2 whitespace-nowrap">{{ pic.id }}</td>
                  <td class="border border-gray-300 px-3 py-2 whitespace-nowrap">{{ pic.description }}</td>
                  <td class="border border-gray-300 px-3 py-2 whitespace-nowrap">
                    <img v-if="pic.property_image" :src="pic.property_image" alt="pic" class="h-16 w-24 object-cover rounded" />
                  </td>
                  <td class="border border-gray-300 px-3 py-2 whitespace-nowrap">{{ pic.property_id }}</td>
                  <td class="border border-gray-300 px-3 py-2 text-center space-x-2">
                    <button @click="openEdit(pic)" class="text-blue-600 hover:text-blue-800" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="askDeleteConfirmation(pic)" class="text-red-600 hover:text-red-800" title="Delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>

                <tr v-if="filtered.length === 0">
                  <td :colspan="5" class="text-center py-6 text-gray-500">No property pictures found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <AddPropertyPicture
        v-if="showAdd"
        :visible="showAdd"
        @close="showAdd = false"
        @refresh="fetchPictures"
      />
      <UpdatePropertyPicture
        v-if="showUpdate"
        :visible="showUpdate"
        :picture="pictureToEdit"
        @close="showUpdate = false"
        @refresh="fetchPictures"
      />

      <ConfirmModal
        v-if="confirmVisible"
        :visible="confirmVisible"
        title="Confirm Deletion"
        message="Are you sure you want to delete this picture?"
        @confirm="confirmDelete"
        @cancel="confirmVisible = false"
      />
    </div>
  </div>
</template>

<script>
import AddPropertyPicture from '@/views/closed/proportyPicture/add.vue';
import UpdatePropertyPicture from '@/views/closed/proportyPicture/update.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import Toast from '@/components/Toast.vue';

export default {
  name: 'PropertyPictureView',
  components: { AddPropertyPicture, UpdatePropertyPicture, ConfirmModal, Toast },
  data() {
    return {
      pictures: [],
      showAdd: false,
      showUpdate: false,
      pictureToEdit: null,
      pictureToDelete: null,
      confirmVisible: false,
      searchTerm: ''
    };
  },
  computed: {
    filtered() {
      const term = this.searchTerm.toLowerCase();
      return this.pictures.filter(p =>
        Object.values(p).some(v => String(v).toLowerCase().includes(term))
      );
    }
  },
  mounted() {
    this.fetchPictures();
  },
  methods: {
    async fetchPictures() {
      try {
        const res = await this.$apiGet('/get_property_pictures');
        // If your backend returns data property, adapt accordingly
        this.pictures = res.data || res;
      } catch (err) {
        console.error('Failed to fetch property pictures', err);
        alert('Could not load property pictures.');
      }
    },
    openEdit(pic) {
      this.pictureToEdit = { ...pic };
      this.showUpdate = true;
    },
    askDeleteConfirmation(pic) {
      this.pictureToDelete = pic;
      this.confirmVisible = true;
    },
    async confirmDelete() {
      this.confirmVisible = false;
      if (!this.pictureToDelete) return;
      try {
        const res = await this.$apiDelete(`/delete_property_picture/${this.pictureToDelete.id}`);
        // show toast if backend returns message
       // const msg = res?.message || 'Deleted successfully';
        this.$root.$refs.toast.showToast("Picture Deleted", 'success');
        this.fetchPictures();
      } catch (err) {
        console.error(err);
        alert('Failed to delete property picture.');
      } finally {
        this.pictureToDelete = null;
      }
    }
  }
};
</script>

<style scoped>
/* keep same look & feel as properties samples */
</style>
