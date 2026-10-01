<template>
  <div>
    <transition name="slide">
      <aside class="w-72 flex flex-col fixed md:relative z-15 h-full bg-white border-r border-slate-200 shadow-sm">

        <!-- Sidebar Header -->
        <div
          v-if="showTitle"
          class="flex items-center gap-3 px-5 py-4 bg-white border-b border-slate-200 sticky top-0 z-10"
        >
          <div class="w-9 h-9 rounded-lg overflow-hidden shrink-0 shadow-sm ring-1 ring-slate-100">
            <div class="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-black text-base">
              α
            </div>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-bold text-slate-900 leading-none tracking-tight">Alpha PMS</p>
            <p class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1 truncate">
              {{ displayRole }}
            </p>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="flex-1 overflow-y-auto py-3 sidebar-inner">
          <ul class="px-3 space-y-0.5">
            <li v-for="(item, index) in filteredMenuItems" :key="item.id || item.name">

              <!-- Menu Item with Dropdown Children -->
              <div v-if="item.children && item.children.length > 0">
                <button
                  @click="toggleMenu(index)"
                  class="w-full flex items-center justify-between px-3.5 py-2 rounded-lg transition-all duration-150 group"
                  :class="openMenuIndex === index
                    ?  'bg-primary/10 text-primary'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div
                      class="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 transition-colors"
                      :class="openMenuIndex === index
                        ?  'bg-primary/10 text-primary'
                        :  'bg-primary/10 text-primary group-hover:bg-primary/15'"
                    >
                      <i :class="[item.icon, 'text-sm']"></i>
                    </div>
                    <span class="text-sm font-semibold tracking-tight truncate">{{ item.name }}</span>
                  </div>
                  <i
                    class="fas text-[10px] transition-transform duration-200 shrink-0 ml-2"
                    :class="[
                      openMenuIndex === index ?  'fa-chevron-down text-primary' : 'fa-chevron-right text-slate-400',
                    ]"
                  ></i>
                </button>

                <transition name="fade">
                  <ul
                    v-if="openMenuIndex === index"
                    class="mt-0.5 mb-1 ml-4 pl-3.5 space-y-0.5 border-l-2 border-primary/20"
                  >
                    <li v-for="child in item.children" :key="child.id || (child.name + child.route)">
                      <router-link
                        :to="{ name: child.route }"
                        class="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150"
                        :class="$route.name === child.route
                          ?  'bg-primary text-white shadow-sm'
                          :  'text-slate-600 hover:bg-primary/10 hover:text-primary'"
                      >
                        <span
                          class="w-1.5 h-1.5 rounded-full shrink-0 transition-colors"
                          :class="$route.name === child.route ? 'bg-white' :  'bg-primary/50'"
                        ></span>
                        <span class="truncate">{{ child.name }}</span>
                      </router-link>
                    </li>
                  </ul>
                </transition>
              </div>

              <!-- Standalone Link Menu Item -->
              <router-link
                v-else
                :to="{ name: item.route }"
                class="flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 group"
                :class="$route.name === item.route
                  ?  'bg-primary text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'"
              >
                <div
                  class="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 transition-colors"
                  :class="$route.name === item.route
                    ?  'bg-primary text-white'
                    :  'bg-primary/10 text-primary group-hover:bg-primary/15'"
                >
                  <i :class="[item.icon, 'text-sm']"></i>
                </div>
                <span class="truncate">{{ item.name }}</span>
              </router-link>

            </li>
          </ul>
          <div class="h-6"></div>
        </div>

      </aside>
    </transition>
  </div>
</template>

<script>
const ROLE_LEVELS = {
  superuser: 100,
  admin: 95,
  super_staff: 90,
  owner: 4,
  staff: 3,
  manager: 2,
  tenant: 1
};

export default {
  name: "UnifiedSidebar",

  data() {
    return {
      showTitle: false,
      userRole: "tenant",
      userPermissions: [],
      openMenuIndex: null,

      menuItems: [
        {
          id: "dashboard",
          name: "Dashboard",
          route: "first-dash",
          icon: "fas fa-gauge"
        },
        {
          id: "user_management",
          name: "User Management",
          icon: "fas fa-users-gear",
          explicitRoles: ["superuser", "owner", "manager", "staff"],
          children: [
            { name: "Super Staffs",           route: "user_view",        permission: "pms.view_user",         explicitRoles: ["superuser"] },
            { name: "Owners",                 route: "owners",           explicitRoles: ["superuser"] },
            { name: "Brokers",                route: "brokers",          explicitRoles: ["superuser"] },
            { name: "Property Managers",      route: "managers",         explicitRoles: ["owner"] },
            { name: "Operational Staffs",     route: "staffs",           explicitRoles: ["owner", "manager", "staff"] },
            { name: "Tenants",       route: "tenants",          explicitRoles: ["owner", "manager", "staff", "superuser"] },
          ],
        },
        {
          id: "properties",
          name: "Properties",
          icon: "fas fa-building",
          minRole: "manager",
          children: [
            { id: "prop_types", name: "Property Types", route: "PropertyTypes-view", explicitRoles: ["superuser", "super_staff"] },
            { id: "prop_zones", name: "Zones",           route: "zones",             minRole: "manager" },
            { id: "prop_list",  name: "Properties",     route: "properties" },
          ],
        },
        {
          id: "offplans",
          name: "Offplans",
          icon: "fas fa-building-circle-check",
          minRole: "manager",
          children: [
            { id: "offplan_prop", name: "Offplan Properties", route: "OffplanProperty-view", minRole: "manager" },
            { id: "offplan_applications", name: "Offplan Applications", route: "OffplanApplication-view", explicitRoles: ["superuser", "admin"] },
            { id: "offplan_milestones", name: "Offplan Milestones", route: "OffplanMilestone-view", explicitRoles: ["superuser", "admin"] },
            { id: "offplan_bank_financing", name: "Offplan Bank Financing", route: "OffplanBankFinancing-view", explicitRoles: ["superuser", "admin"] },
            { id: "offplan_payments", name: "Offplan Payments", route: "OffplanPayment-view", explicitRoles: ["superuser", "admin"] },
            { id: "offplan_payment_plans", name: "Offplan Payment Plans", route: "OffplanPaymentPlan-view", explicitRoles: ["superuser", "admin"] },
          ],
        },
        {
          id: "rentals",
          name: "Rentals",
          icon: "fas fa-file-contract",
          minRole: "manager",
          children: [
            { id: "rent_house",   name: "Property Rentals",  route: "rents" },
            { id: "rent_cowork",  name: "Workspace Rentals", route: "coworking-space-rentals" },
            { id: "rent_overdue", name: "Overdue Rentals",   route: "overdue-rents" },
          ],
        },
        {
          id: "sales_superuser",
          name: "Sales",
          icon: "fas fa-money-bill-wave",
          explicitRoles: ["superuser", "super_staff"],
          children: [
            { id: "sale_broker",   name: "Broker/Tenant For Sale",   route: "BrokerListSales-view" },
            { id: "sale_house",    name: "House Sales",       route: "propertiesListForSale" },
            { id: "sale_all_pay",  name: "All Sale Payments", route: "sales_payments" },
          ],
        },
        {
          id: "sales_pms",
          name: "My Sales",
          icon: "fas fa-money-bill-wave",
          explicitRoles: ["owner", "manager", "staff"],
          children: [
            { id: "my_sale_house", name: "House Sales",    route: "propertiesListForSale" },
            { id: "my_sale_pay",   name: "Sale Payments",  route: "sales_payments" },
          ],
        },
        {
          id: "maintenance",
          name: "Maintenance Requests",
          icon: "fas fa-screwdriver-wrench",
          route: "maintenance-requests",
          explicitRoles: ["superuser", "super_staff", "owner", "staff", "manager"],
        },
        {
          id: "subscriptions",
          name: "Subscriptions",
          route: "subscriptions_view",
          icon: "fas fa-clipboard-list",
          explicitRoles: ["superuser", "super_staff", "owner"],
        },
        {
          id: "finance",
          name: "Finance",
          icon: "fas fa-coins",
          route: "payments",
          minRole: "staff",
          id: "fin_pay"
        },
        {
          id: "cowork_spaces",
          name: "Co-work Spaces",
          icon: "fas fa-people-roof",
          minRole: "manager",
          children: [
            { id: "co_spaces",   name: "Spaces",   route: "coworking-spaces" },
            { id: "co_rentals",  name: "Rentals",  route: "coworking-space-rentals" },
            { id: "co_payments", name: "Payments", route: "coworking-payments" },
          ],
        },

{
          id: "notifications",
          name: "Notifications",
          route: "notifications",
          icon: "fas fa-bell",
          minRole: "manager",
        },
{
          id: "Settings",
          name: "Settings",
          icon: "fas fa-gear",
          explicitRoles: ["superuser", "admin"],
          children: [
            { name: "Roles", route: "groups", permission: "auth.view_group", explicitRoles: ["superuser"] },
            { name: "Permissions", route: "permissions_view", permission: "auth.view_permission", explicitRoles: ["superuser"] },
            {
              id: "configurations",
              name: "Configurations",
              route: "configurations",
              icon: "fas fa-gear",
              explicitRoles: ["superuser"],
            },
            {
              id: "brands",
              name: "Brands",
              route: "Brands-view",
              icon: "fas fa-palette",
              explicitRoles: ["superuser", "admin"],
            },
          ],
        },

      ],
    };
  },

  computed: {
    displayRole() {
      if (!this.userRole) return "Portal";
      return this.userRole.replace("_", " ");
    },

    isPMSContext() {
      return ["owner", "manager", "staff"].includes(this.userRole);
    },

    isSaaSContext() {
      return ["superuser", "super_staff"].includes(this.userRole);
    },

    filteredMenuItems() {
      return this.menuItems
        .map(item => {
          let parentName = item.name;

          if (this.isPMSContext) {
            if (item.id === "properties")    parentName = "My Properties";
            if (item.id === "cowork_spaces") parentName = "My Co-work Spaces";
            if (item.id === "rentals")       parentName = "My Rentals";
            if (item.id === "finance")       parentName = "My Finance";
          }

          if (!item.children) {
            if (!this.isRoleAllowed(item.minRole, item.explicitRoles)) return null;
            if (item.permission && !this.checkPermission(item.permission)) return null;
            return { ...item, name: parentName };
          }

          const filteredChildren = item.children
            .filter(child => {
              if (!this.isRoleAllowed(child.minRole || item.minRole, child.explicitRoles)) return false;
              if (child.permission && !this.checkPermission(child.permission)) return false;
              return true;
            })
            .map(child => {
              let childName = child.name;

              if (this.isPMSContext) {
                if (child.id === "prop_zones")   childName = "My Zones";
                if (child.id === "prop_list")    childName = "My Properties";
                if (child.id === "co_spaces")    childName = "Co-work Spaces";
                if (child.id === "co_rentals")   childName = "Workspace Rentals";
                if (child.id === "co_payments")  childName = "Rental Payments";
                if (child.id === "rent_house")   childName = "House Rentals";
                if (child.id === "rent_pay")     childName = "Rent Payments";
                if (child.id === "fin_pay")      childName = "All Payments";
              }

              return { ...child, name: childName };
            });

          if (filteredChildren.length === 0) return null;
          return { ...item, name: parentName, children: filteredChildren };
        })
        .filter(item => {
          if (!item) return false;
          if (!this.isRoleAllowed(item.minRole, item.explicitRoles)) return false;
          if (item.permission && !this.checkPermission(item.permission)) return false;
          return true;
        });
    },
  },

  methods: {
    isRoleAllowed(minRole, explicitRoles) {
      if (explicitRoles && explicitRoles.length > 0) {
        return explicitRoles.includes(this.userRole);
      }
      if (!minRole) return true;
      const userWeight = ROLE_LEVELS[this.userRole] ?? 0;
      const requiredWeight = ROLE_LEVELS[minRole] ?? 0;
      return userWeight >= requiredWeight;
    },

    checkPermission(perm) {
      if (typeof this.$hasPermission === "function") {
        return this.$hasPermission(perm);
      }
      return this.userPermissions.includes(perm);
    },

    toggleMenu(index) {
      this.openMenuIndex = this.openMenuIndex === index ? null : index;
    },
  },

  mounted() {
    try {
      // Use the same centralized role resolution used throughout the application.
      this.userRole = typeof this.$getRole === "function" ? this.$getRole() : "tenant";
    } catch {
      this.userRole = "tenant";
    }

    try {
      this.userPermissions = JSON.parse(localStorage.getItem("permissions") || "[]");
    } catch {
      this.userPermissions = [];
    }

    this.showTitle = window.innerWidth < 1024;

    this.filteredMenuItems.forEach((item, index) => {
      if (item.children?.some(child => child.route === this.$route.name)) {
        this.openMenuIndex = index;
      }
    });
  },
};
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.sidebar-inner {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.sidebar-inner::-webkit-scrollbar        { width: 4px; }
.sidebar-inner::-webkit-scrollbar-track  { background: transparent; }
.sidebar-inner::-webkit-scrollbar-thumb  { background-color: #e2e8f0; border-radius: 99px; }
.sidebar-inner:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
</style>