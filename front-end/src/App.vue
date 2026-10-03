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
    // If the browser/tab was closed, the previous pagehide handler leaves a
    // marker behind. A normal new visit means the old client session must end.
    // A normal reload is allowed to keep the current login.
    this.handlePreviousTabClose();

    // Add global event listeners to track user activity.
    document.addEventListener('mousemove', this.resetInactivityTimer);
    document.addEventListener('mousedown', this.resetInactivityTimer);
    document.addEventListener('click', this.resetInactivityTimer);
    document.addEventListener('keydown', this.resetInactivityTimer);
    document.addEventListener('touchstart', this.resetInactivityTimer);
    document.addEventListener('scroll', this.resetInactivityTimer, true);
    window.addEventListener('pagehide', this.handlePageHide);

    // Check the wall-clock time as well as the in-memory timer. This covers
    // cases where the computer is powered off, sleeps, or the browser process
    // is killed and therefore cannot run the normal timeout.
    this.checkLastActivity();

    // Start the initial inactivity timer.
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
    window.removeEventListener('pagehide', this.handlePageHide);

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
      if (!localStorage.getItem('access')) return;

      const now = Date.now();
      localStorage.setItem('lastActivityAt', String(now));

      if (this.inactivityTimeout) {
        clearTimeout(this.inactivityTimeout);
      }

      this.inactivityTimeout = setTimeout(() => {
        this.handleInactivity();
      }, 60 * 1000); // 1 minute
    },

    checkLastActivity() {
      if (!localStorage.getItem('access')) return;

      const lastActivity = Number(localStorage.getItem('lastActivityAt') || 0);
      if (lastActivity && Date.now() - lastActivity >= 60 * 1000) {
        this.logout('The session expired after 1 minute of inactivity.');
      }
    },

    handlePreviousTabClose() {
      const tabClosed = localStorage.getItem('pmsTabClosed');
      if (!tabClosed || !localStorage.getItem('access')) return;

      // A normal browser navigation/new tab means the previous tab was closed.
      // A reload keeps the current login so refreshing the page is not treated
      // as a logout.
      const navigationType = performance.getEntriesByType('navigation')[0]?.type;
      if (navigationType !== 'reload') {
        this.logout('The previous browser tab was closed. Please sign in again.');
      }

      localStorage.removeItem('pmsTabClosed');
    },

    handlePageHide() {
      if (!localStorage.getItem('access')) return;

      // pagehide is the closest browser signal for a tab/window closing.
      // It is not available for a sudden power loss, which is why
      // lastActivityAt is also checked when the application starts again.
      localStorage.setItem('pmsTabClosed', String(Date.now()));
    },

    logout(message) {
      console.log(message);
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('token');
      localStorage.removeItem('permissions');
      localStorage.removeItem('groups');
      localStorage.removeItem('userId');
      localStorage.removeItem('is_superuser');
      localStorage.removeItem('phone_number');
      localStorage.removeItem('name');
      localStorage.removeItem('role');
      localStorage.removeItem('lastActivityAt');
      localStorage.removeItem('pmsTabClosed');

      if (this.$route.path !== '/login') {
        this.$router.push('/login');
      }
    },

    handleInactivity() {
      if (this.$route.matched.some(record => record.meta.requiresAuth)) {
        this.logout('User has been inactive for 1 minute. Logging out.');
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
