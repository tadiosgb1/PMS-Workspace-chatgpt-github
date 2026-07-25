<template>
  <div class="flex flex-col h-screen bg-slate-50 font-sans">
    <header class="relative bg-white w-full shadow-sm border-b border-slate-100 sticky top-0 z-20 px-4 py-1.5">
      <div class="flex items-center justify-between w-full max-w-[1920px] mx-auto">
        
        <div class="flex items-center space-x-4">
          <button
            v-if="screenWidth < 1024"
            @click="toggleSidebar"
            class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary transition-all focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <i class="fas fa-bars text-xl"></i>
          </button>

          <div class="flex items-center space-x-3 group cursor-pointer">
            <div class="relative">
              <img
                src="../../assets/img/logo1.jpg"
                alt="Logo"
                class="h-9 w-9 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-primary/30 transition-all shadow-sm"
              />

            
            </div>
            <div class="flex flex-col">
              <h1 class="text-lg font-black text-dprimary leading-none tracking-tight group-hover:text-primary transition-colors">
                PMS
              </h1>
           </div>
          </div>
        </div>

        <div class="flex items-center space-x-2 sm:space-x-5">
          
          <div class="relative" @click.stop="toggleNotificationDropdown">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-primary cursor-pointer transition-all relative">
              <i class="fas fa-bell text-lg"></i>
              <span
                v-if="notifications.length > 0"
                class="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm"
              >
                {{ notifications.length }}
              </span>
            </div>

            <transition name="fade">
              <div
                v-show="isNotificationDropdownOpen"
                class="absolute right-0 mt-3 w-80 bg-white shadow-2xl shadow-slate-200 z-50 rounded-[1.5rem] border border-slate-100 overflow-hidden"
              >
                <div class="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <span class="text-xs font-black text-slate-800 uppercase tracking-widest">Notifications</span>
                  <span class="text-[10px] text-primary font-bold">{{ notifications.length }} New</span>
                </div>
                
                <ul class="max-h-80 overflow-y-auto">
                  <li
                    v-for="(notif, index) in notifications"
                    :key="index"
                    class="px-5 py-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                    @click="goToNotification(notif.id)"
                  >
                    <div class="flex items-start space-x-3">
                      <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <i class="fas fa-info-circle text-xs"></i>
                      </div>
                      <div class="flex-1">
                        <div class="flex justify-between items-center mb-1">
                          <p class="text-[11px] font-black text-slate-700 uppercase tracking-tight">
                            {{ notif.notification_type }}
                          </p>
                          <span class="text-[9px] text-slate-400">{{ notif.created_at }}</span>
                        </div>
                        <p class="text-xs text-slate-500 leading-relaxed font-medium">
                          {{ notif.message }}
                        </p>
                      </div>
                    </div>
                  </li>

                  <li v-if="notifications.length === 0" class="px-5 py-10 text-center">
                    <i class="fas fa-check-circle text-slate-200 text-3xl mb-3"></i>
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">All caught up!</p>
                  </li>
                </ul>
              </div>
            </transition>
          </div>

          <div class="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <div class="flex items-center space-x-3 cursor-pointer group" @click.stop="toggleProfileDropdown">
            <div class="hidden sm:flex flex-col items-end">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Welcome,</span>
              <h1 class="text-xs font-black text-dprimary group-hover:text-primary transition-colors">
                {{ name }}
              </h1>
            </div>

            <div class="relative">
              <div class="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:bg-primary transition-all active:scale-90">
                <i class="fas fa-user text-xs"></i>
              </div>
            </div>

            <transition name="fade">
              <div
                v-show="isProfileDropdownOpen"
                class="absolute right-0 top-full mt-3 w-52 bg-white shadow-2xl shadow-slate-200 z-50 rounded-[1.5rem] border border-slate-100 overflow-hidden"
              >
                <div class="p-2">
                  <a @click="openProfile" href="#" class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 group/item">
                    <div class="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover/item:bg-secondary group-hover/item:text-white transition-all">
                      <i class="fas fa-user-circle text-xs"></i>
                    </div>
                    <span class="text-xs font-bold uppercase tracking-tighter">My Profile</span>
                  </a>
                  
                  <a href="#" class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 group/item">
                    <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover/item:bg-slate-900 group-hover/item:text-white transition-all">
                      <i class="fas fa-key text-xs"></i>
                    </div>
                    <span class="text-xs font-bold uppercase tracking-tighter">Security</span>
                  </a>

                  <div class="h-px bg-slate-100 my-2 mx-2"></div>

                  <a @click="logout" href="#" class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-red-500 group/item">
                    <div class="w-8 h-8 rounded-lg bg-red-100/50 flex items-center justify-center text-red-500 group-hover/item:bg-red-500 group-hover/item:text-white transition-all">
                      <i class="fas fa-power-off text-xs"></i>
                    </div>
                    <span class="text-xs font-black uppercase tracking-tighter">Sign Out</span>
                  </a>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden relative">
      <!-- Desktop Sidebar -->
      <aside class="hidden lg:flex flex-col w-52 shrink-0 bg-white border-r border-slate-100 h-full overflow-y-auto sidebar-scroll">
        <Sidebar />
      </aside>

      <!-- Mobile Overlay -->
      <transition name="fade">
        <div
          v-if="showSidebar && screenWidth < 1024"
          class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          @click="toggleSidebar"
        ></div>
      </transition>

      <!-- Mobile Sidebar -->
      <transition name="slide">
        <aside
          v-if="showSidebar && screenWidth < 1024"
          class="fixed left-0 top-0 w-60 bg-white shadow-2xl z-50 h-full overflow-hidden flex flex-col"
        >
          <div class="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigation</h2>
            <button @click="toggleSidebar" class="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm border border-slate-200 hover:text-red-500 transition-colors">
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto sidebar-scroll">
            <Sidebar />
          </div>
        </aside>
      </transition>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto main-scroll bg-slate-50/50">
        <div class="max-w-[1920px] mx-auto">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>

    <Profile
      :visible="showProfileModal"
      @close="closeProfile"
      @updated="onProfileUpdated"
    />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}

/* Thin, elegant scrollbar — sidebar */
.sidebar-scroll {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
.sidebar-scroll::-webkit-scrollbar {
  width: 3px;
}
.sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-scroll::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 99px;
}
.sidebar-scroll:hover::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
}

/* Thin, elegant scrollbar — main content */
.main-scroll {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
.main-scroll::-webkit-scrollbar {
  width: 4px;
}
.main-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.main-scroll::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 99px;
}
.main-scroll:hover::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
}
</style>
<script>
import Sidebar from "@/components/layouts/leftSidevar.vue";
import Profile from "./Profile.vue";

export default {
  name: "AppLayout",
  components: { Sidebar, Profile },
  data() {
    return {
      showProfileModal: false,
      notifications: [],
      name: localStorage.getItem("name"),
      showSidebar: false,
      isLangOpen: false,
      isProfileDropdownOpen: false,
      isNotificationDropdownOpen: false,
      screenWidth: window.innerWidth,
      currentLanguage: "English",
    };
  },
  async created() {
    window.addEventListener("resize", this.handleResize);
    this.name = localStorage.getItem("name");

    try {
      const res = await this.$apiGetById(
        `/get_unread_notifications`,
        localStorage.getItem("userId")
      );
      this.notifications = res.data || [];
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    openProfile() {
      this.isProfileDropdownOpen = false;
      this.showProfileModal = true;
    },
    closeProfile() {
      this.showProfileModal = false;
    },
    onProfileUpdated(updatedUser) {
      if (updatedUser?.name) {
        this.name = updatedUser.name;
        localStorage.setItem("name", updatedUser.name);
      }
    },
    goToNotification(id) {
      this.$router.push({ name: "notificationDetail", params: { id } });
      this.isNotificationDropdownOpen = false;
    },
    handleResize() {
      this.screenWidth = window.innerWidth;
      if (this.screenWidth > 1024) {
        this.showSidebar = false; // prevent mobile sidebar from sticking open
      }
    },
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },
    toggleProfileDropdown() {
      this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    },
    toggleNotificationDropdown() {
      this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;
    },
    logout() {
      localStorage.clear();
      this.$router.push("/");
    },
  },
};
</script>


