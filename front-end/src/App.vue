<template>
  <div>
    <router-view :key="$route.fullPath"></router-view>
    <Toast ref="toast" />
    <!-- Global Loading Component -->
    <Loading :visible="loading" message="Loading..." />
  </div>
</template>

<script>
import '@fortawesome/fontawesome-free/css/all.css';
import Toast from './components/Toast1.vue';
import Loading from './components/Loading.vue'; // import your Loading component
import { reactive } from 'vue';

// Global reactive loading state
export const globalLoading = reactive({ value: false });

export default {
  components: {
    Toast,
    Loading,
  },
  data() {
    return {
      serviceBanks: [],
      blockBanks: [],
      inactivityTimeout: null, // Timeout for inactivity
      bankRefreshInterval: null,
    };
  },
  computed: {
    loading() {
      return globalLoading.value; // Bind to global loading state
    },
  },
  created() {
    this.$store.dispatch('fetchBanks');
    this.bankRefreshInterval = setInterval(() => {
      this.$store.dispatch('fetchBanks');
    }, 60000); // Fetch every 60 seconds
  },
  mounted() {
    // Add global event listeners to track user activity
    document.addEventListener('mousemove', this.resetInactivityTimer);
    document.addEventListener('mousedown', this.resetInactivityTimer);
    document.addEventListener('click', this.resetInactivityTimer);
    document.addEventListener('keydown', this.resetInactivityTimer);
    document.addEventListener('touchstart', this.resetInactivityTimer);
    document.addEventListener('scroll', this.resetInactivityTimer, true);

    // Start the initial inactivity timer
    this.resetInactivityTimer();
  },
  beforeUnmount() {
    // Remove the event listeners and timers to avoid memory leaks
    document.removeEventListener('mousemove', this.resetInactivityTimer);
    document.removeEventListener('mousedown', this.resetInactivityTimer);
    document.removeEventListener('click', this.resetInactivityTimer);
    document.removeEventListener('keydown', this.resetInactivityTimer);
    document.removeEventListener('touchstart', this.resetInactivityTimer);
    document.removeEventListener('scroll', this.resetInactivityTimer, true);

    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }

    if (this.bankRefreshInterval) {
      clearInterval(this.bankRefreshInterval);
      this.bankRefreshInterval = null;
    }
  },
  methods: {
    resetInactivityTimer() {
      if (this.inactivityTimeout) {
        clearTimeout(this.inactivityTimeout);
      }
      this.inactivityTimeout = setTimeout(() => {
        this.handleInactivity();
      }, 60 * 1000); // 1 minute
    },
    handleInactivity() {
      if (this.$route.meta.requiresAuth) {
        console.log('User has been inactive for 1 minute. Logging out.');
        localStorage.removeItem('access');
        localStorage.removeItem('token');
        this.$router.push('/login');
      }
    },
  },
};
</script>

<style>
/* Global styles for jTable */
.jtable {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.jtable th,
.jtable td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #e2e8f0;
}

.jtable th {
  background-color: #f7fafc;
  font-weight: bold;
}

.jtable tbody tr:hover {
  background-color: #f1f5f9;
}

.jtable tbody tr:nth-child(even) {
  background-color: #f9fafb;
}

.jtable .pagination-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.jtable .pagination-btn:hover {
  background-color: #e2e8f0;
}

:root {
  --color-primary: #FA7118;   /* Default Orange */
  --color-dprimary: #ea580c;
  --color-secondary: #A6093D;
}
</style>
