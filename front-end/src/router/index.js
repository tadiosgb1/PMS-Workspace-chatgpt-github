import { createRouter, createWebHistory } from "vue-router";

import { getTenantContext } from '../composables/useTenant.js';
import { getRole } from '../utils/utils';
// --- Views Imports ---
import Login from '../views/opened/auth/login.vue'
import Pricing from '../views/opened/landing/PricingPage.vue'
import Home from "../views/opened/landing/Home.vue";
import ResetPassword from '../views/opened/auth/ResetPassword.vue'
import ForgotPasssword from '../views/opened/auth/forgotPassword.vue'
import ActivateEmailMessage from '../views/opened/landing/activateEmailMessage.vue'
import Registration from '../views/opened/landing/registerUser.vue'
import ForgotPassword from '../views/opened/auth/forgotPassword.vue';
import Reset from '../views/opened/auth/reset.vue';
import AccessDenied from "../views/opened/auth/accessDenied.vue";
import first_dash from '../views/closed/first_dash.vue'
import dashboard from '../views/closed/dashboard.vue'
import Properties from '../views/closed/proporty/view.vue';
import PropertyDetail from '../views/closed/proporty/PropertyDetail.vue'
import rentPay from '../views/closed/rent/view.vue'
import PropertyZoneDetail from '../views/closed/Zones/propertyZoneDetail.vue';
import PropertyZone from '../views/closed/Zones/view.vue';
import PropertyPicture from '../views/closed/proportyPicture/view.vue';
import Payments from '../views/closed/Payments/view.vue';
import Rents from '../views/closed/rent/view.vue';
import RentDetail from '../views/closed/rent/rentDetail.vue';
import OverdueRents from '../views/closed/rent/OverdueRents.vue';
import MaintenanceRequests from '../views/closed/maintenanceRequests/view1.vue';
import User_view from '../views/closed/users/view.vue';
import User_add from '../views/closed/users/add.vue';
import UserEdit from '../views/closed/users/edit.vue';
import UserDetail from '../views/closed/users/detail.vue';
import Tenants from '../views/closed/tenant/view.vue';
import Permissions_add from '../views/closed/permissions/add.vue';
import permissions_view from '../views/closed/permissions/view.vue';
import plans_view from '../views/closed/plans/view.vue';
import subscriptions_view from '../views/closed/subscriptions/view.vue'
import subscriptionsPayment_view from '../views/closed/subscriptions/SubscriptionPayment/view.vue'
import view_groups from '../views/closed/groups/view.vue'
import view_managers from '../views/closed/managers/view.vue'
import view_owners from '../views/closed/owners/view.vue'
import OwnerDetail from '../views/closed/owners/detail.vue'
import Sales_Payments from '../views/closed/SalesPayment/view.vue'
import Rent_Payments from '../views/closed/rent/RentPayments.vue'
import staffs from '../views/closed/stafs/view.vue'
import Notifications from '../views/closed/notifications/view.vue'
import notificationDetail from '../views/closed/notifications/notificationDeatil.vue'
import Reports from '../views/closed/report/view.vue'
import ClientReport from '../views/closed/report/ClientReport.vue'
import SubscriptionReport from '../views/closed/report/SubscriptionReport.vue'
import PropertiesReport from '../views/closed/report/PropertiesReport.vue'
import OffplanPropertiesReport from '../views/closed/report/OffplanPropertiesReport.vue'
import RevenuesReport from '../views/closed/report/RevenuesReport.vue'
import WorkspaceReport from '../views/closed/report/WorkspaceReport.vue'
import CowrkingSpaces from '../views/closed/coworkingSpace/view.vue'
import CowrkingSpaceRental from '../views/closed/workspaceRental/view.vue'
import Contacts from '../views/closed/contacts/view.vue'
import CropertiesListForSale from '../views/closed/propertiesListForSale/view.vue'
import Configurations from '../views/closed/Configurations/view.vue'
import CoworkspacePayments from '../views/closed/workspacePayment/view.vue'
import brokers from '../views/closed/brokers/view.vue'
import BrokerDetail from '../views/closed/brokers/detail.vue'
import brokerDetail from '../views/closed/brokers/brokerDetail.vue'
import subDetail from '../views/closed/subscriptions/subDetail.vue'
import workSpaceDetail from '../views/closed/coworkingSpace/detail.vue'
import Brands from "../views/closed/brands/BrandsView.vue";
import workSpaceRentalDetail from '../views/closed/workspaceRental/detail.vue'

const routes = [
  {
    path: "/", 
    name: "home", // Changed string name to valid identifier 'home'
    component: Home,
    meta: { requiresGuest: true }
  },
  {
    path: "/login", 
    name: "login",
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: "/pricing", 
    name: "pricing",
    component: Pricing,
    meta: { requiresGuest: true }
  },
  {
    path: "/register", 
    name: "register",
    component: Registration,
    meta: { requiresGuest: true }
  },
  {
    path: "/email-activate-message", 
    name: "email-activate-message",
    component: ActivateEmailMessage,
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasssword,
    props: true
  },
  {
    path: "/:lang/reset-password",
    name: "ResetPassword",
    component: ResetPassword,
    props: true,
  },
  {
    path: "/dashboard", 
    name: "dashboard",
    component: dashboard,
    meta: { requiresAuth: true }, // Changed to true so logged out users can't view private layout
    children: [
      {
        path: "categories",
        name: "Categories-view",
        component: () => import('../views/closed/Categories/CategoriesView.vue'),
      },
      {
        path: "categories/add",
        name: "Categories-add",
        component: () => import('../views/closed/Categories/AddCategories.vue'),
      },
      {
        path: "categories/edit/:id",
        name: "Categories-edit",
        component: () => import('../views/closed/Categories/EditCategories.vue'),
        props: true,
      },
      {
        path: "categories/detail/:id",
        name: "Categories-detail",
        component: () => import('../views/closed/Categories/CategoriesDetail.vue'),
        props: true,
      },
      {
        path: "brokerlistsales",
        name: "BrokerListSales-view",
        component: () => import('../views/closed/BrokerListSales/BrokerListSalesView.vue'),
      },
      {
        path: "brokerlistsales/add",
        name: "BrokerListSales-add",
        component: () => import('../views/closed/BrokerListSales/AddBrokerListSales.vue'),
      },
      {
        path: "brokerlistsales/edit/:id",
        name: "BrokerListSales-edit",
        component: () => import('../views/closed/BrokerListSales/EditBrokerListSales.vue'),
        props: true,
      },
      {
        path: "brokerlistsales/detail/:id",
        name: "BrokerListSales-detail",
        component: () => import('../views/closed/BrokerListSales/BrokerListSalesDetail.vue'),
        props: true,
      },
      {
        path: "propertytypes",
        name: "PropertyTypes-view",
        component: () => import('../views/closed/PropertyTypes/PropertyTypesView.vue'),
      },
      {
        path: "propertytypes/add",
        name: "PropertyTypes-add",
        component: () => import('../views/closed/PropertyTypes/AddPropertyTypes.vue'),
      },
      {
        path: "propertytypes/edit/:id",
        name: "PropertyTypes-edit",
        component: () => import('../views/closed/PropertyTypes/EditPropertyTypes.vue'),
        props: true,
      },
      {
        path: "propertytypes/detail/:id",
        name: "PropertyTypes-detail",
        component: () => import('../views/closed/PropertyTypes/PropertyTypesDetail.vue'),
        props: true,
      },
      {
        path: "brands",
        name: "Brands-view",
        component: Brands,
      },
      {
        path: "offplan-properties",
        name: "OffplanProperty-view",
        component: () => import('../views/closed/Offplans/offplan property/ViewOffplanProperty.vue'),
      },
      {
        path: "offplan-properties/detail/:id",
        name: "OffplanProperty-detail",
        component: () => import('../views/closed/Offplans/offplan property/OffplanPropertyDetail.vue'),
        props: true,
      },
      {
        path: "offplan-applications",
        name: "OffplanApplication-view",
        component: () => import('../views/closed/Offplans/offplan application/ViewOffplanApplication.vue'),
      },
      {
        path: "offplan-applications/detail/:id",
        name: "OffplanApplication-detail",
        component: () => import('../views/closed/Offplans/offplan application/OffplanApplicationDetail.vue'),
        props: true,
      },
      {
        path: "offplan-milestones",
        name: "OffplanMilestone-view",
        component: () => import('../views/closed/Offplans/offplan milestone/ViewOffplanMilestone.vue'),
      },
      {
        path: "offplan-milestones/detail/:id",
        name: "OffplanMilestone-detail",
        component: () => import('../views/closed/Offplans/offplan milestone/OffplanMilestoneDetail.vue'),
        props: true,
      },
      {
        path: "offplan-bank-financing",
        name: "OffplanBankFinancing-view",
        component: () => import('../views/closed/Offplans/offplan bank financing/ViewOffplanBankFinancing.vue'),
      },
      {
        path: "offplan-bank-financing/detail/:id",
        name: "OffplanBankFinancing-detail",
        component: () => import('../views/closed/Offplans/offplan bank financing/OffplanBankFinancingDetail.vue'),
        props: true,
      },
      {
        path: "offplan-payments",
        name: "OffplanPayment-view",
        component: () => import('../views/closed/Offplans/offplan payment/ViewOffplanPayment.vue'),
      },
      {
        path: "offplan-payments/detail/:id",
        name: "OffplanPayment-detail",
        component: () => import('../views/closed/Offplans/offplan payment/OffplanPaymentDetail.vue'),
        props: true,
      },
      {
        path: "offplan-payment-plans",
        name: "OffplanPaymentPlan-view",
        component: () => import('../views/closed/Offplans/offplan payment plan/ViewOffplanPaymentPlan.vue'),
      },
      {
        path: "offplan-payment-plans/detail/:id",
        name: "OffplanPaymentPlan-detail",
        component: () => import('../views/closed/Offplans/offplan payment plan/OffplanPaymentPlanDetail.vue'),
        props: true,
      },
      {
        path: "tenantspropertsalerequests",
        name: "TenantPropertySaleRequest-view",
        component: () => import('../views/closed/TenantsPropertSaleRequests/TenantPropertySaleRequestView.vue'),
      },
      {
        path: "tenantspropertsalerequests/add",
        name: "TenantPropertySaleRequest-add",
        component: () => import('../views/closed/TenantsPropertSaleRequests/AddTenantPropertySaleRequest.vue'),
      },
      {
        path: "tenantspropertsalerequests/edit/:id",
        name: "TenantPropertySaleRequest-edit",
        component: () => import('../views/closed/TenantsPropertSaleRequests/EditTenantPropertySaleRequest.vue'),
        props: true,
      },
      {
        path: "tenantspropertsalerequests/detail/:id",
        name: "TenantPropertySaleRequest-detail",
        component: () => import('../views/closed/TenantsPropertSaleRequests/TenantPropertySaleRequestDetail.vue'),
        props: true,
      },
      {
        path: "tenantproperty",
        name: "TenatProperty-view",
        component: () => import('../views/closed/TenantProperty/TenatPropertyView.vue'),
      },
      {
        path: "tenantproperty/add",
        name: "TenatProperty-add",
        component: () => import('../views/closed/TenantProperty/AddTenatProperty.vue'),
      },
      {
        path: "tenantproperty/edit/:id",
        name: "TenatProperty-edit",
        component: () => import('../views/closed/TenantProperty/EditTenatProperty.vue'),
        props: true,
      },
      {
        path: "tenantproperty/detail/:id",
        name: "TenatProperty-detail",
        component: () => import('../views/closed/TenantProperty/TenatPropertyDetail.vue'),
        props: true,
      },
      {
        path: "systemconfigurations",
        name: "SystemConfigurations-view",
        component: () => import('../views/closed/SySTEMcONFIGURATIONS/SystemConfigurationsView.vue'),
      },
      {
        path: "systemconfigurations/add",
        name: "SystemConfigurations-add",
        component: () => import('../views/closed/SySTEMcONFIGURATIONS/AddSystemConfigurations.vue'),
      },
      {
        path: "systemconfigurations/edit/:id",
        name: "SystemConfigurations-edit",
        component: () => import('../views/closed/SySTEMcONFIGURATIONS/EditSystemConfigurations.vue'),
        props: true,
      },
      {
        path: "systemconfigurations/detail/:id",
        name: "SystemConfigurations-detail",
        component: () => import('../views/closed/SySTEMcONFIGURATIONS/SystemConfigurationsDetail.vue'),
        props: true,
      },
      {
        path: "first-dash", 
        name: "first-dash",
        component: first_dash,
      },
      {
        path: '/rent-detail/:id',
        name: 'rent-detail',
        component: RentDetail,
        props: true,
      },
      {
        path: '/sub-detail/:id',
        name: 'sub-detail',
        component: subDetail,
      },
      {
        path: '/co-work-detail/:id',
        name: 'co-work-detail',
        component: workSpaceDetail,
      },
      {
        path: '/co-work-rental-detail/:id',
        name: 'co-work-rental-detail',
        component: workSpaceRentalDetail
      },
      { path: '/properties', name: 'properties', component: Properties },
      { path: 'properties/:id', name: 'PropertyDetail', component: PropertyDetail, props: true },
      { path: '/zones/:id', name: 'zoneDetail', component: PropertyZoneDetail, props: true },
      { path: 'properties/rentPay/:id', name: 'rentPay', component: rentPay, props: true },
      { path: '/zones', name: 'zones', component: PropertyZone },
      { path: '/pictures', name: 'pictures', component: PropertyPicture },
      { path: '/tenants', name: 'tenants', component: Tenants },
      { path: '/payments', name: 'payments', component: Payments },
      { path: '/reports', name: 'reports', component: Reports },
      { path: '/reports/clients', name: 'ClientReport-view', component: ClientReport, meta: { role: 'superuser' } },
      { path: '/reports/subscriptions', name: 'SubscriptionReport-view', component: SubscriptionReport, meta: { role: 'superuser' } },
      { path: '/reports/properties', name: 'PropertiesReport-view', component: PropertiesReport },
      { path: '/reports/offplan-properties', name: 'OffplanPropertiesReport-view', component: OffplanPropertiesReport },
      { path: '/reports/revenues', name: 'RevenuesReport-view', component: RevenuesReport, meta: { role: 'superuser' } },
      { path: '/reports/workspace', name: 'WorkspaceReport-view', component: WorkspaceReport },
      { path: '/notifications', name: 'notifications', component: Notifications },
      { path: 'notification/:id', name: 'notificationDetail', component: notificationDetail },
      { path: '/contacts', name: 'contacts', component: Contacts },
      { path: '/propertiesListForSale', name: 'propertiesListForSale', component: CropertiesListForSale },
      { path: '/configurations', name: 'configurations', component: Configurations },
      { path: '/rents', name: 'rents', component: Rents },
      { path: '/overdue-rents', name: 'overdue-rents', component: OverdueRents },
      { path: '/sales_payments', name: 'sales_payments', component: Sales_Payments },
      { path: '/rents_payments', name: 'rents_payments', component: Rent_Payments },
      { path: '/rents_payments/:id', name: 'rents_payment_detail', component: Rent_Payments, props: true },
      { path: '/maintenance-requests', name: 'maintenance-requests', component: MaintenanceRequests },
      { path: '/user_view', name: 'user_view', component: User_view },
      { path: '/coworking-spaces', name: 'coworking-spaces', component: CowrkingSpaces },
      { path: '/coworking-space-rentals', name: 'coworking-space-rentals', component: CowrkingSpaceRental },
      { path: '/coworking-payments', name: 'coworking-payments', component: CoworkspacePayments },
      { path: '/coworking-payments/:id', name: 'coworking-payments-detail', component: CoworkspacePayments, props: true },
      { path: '/user_add', name: 'user_add', component: User_add },
      {
        path: "/user_edit/:id",
        name: "UserEdit",
        component: UserEdit,
        props: true,
      },
      {
        path: "/user_detail/:id",
        name: "UserDetail",
        component: UserDetail,
        props: true,
      },
      { path: '/permission_add', name: 'permission_add', component: Permissions_add },
      { path: '/permissions_view', name: 'permissions_view', component: permissions_view },
      { path: '/plans_view', name: 'plans_view', component: plans_view },
      { path: '/subscriptions_view', name: 'subscriptions_view', component: subscriptions_view },
      { path: '/subscriptions_view/payment/:id', name: 'subscriptionsPayment_view', component: subscriptionsPayment_view },
      { path: '/groups', name: 'groups', component: view_groups },
      { path: '/managers', name: 'managers', component: view_managers },
      { path: '/owners', name: 'owners', component: view_owners },
      { path: '/owners/:id', name: 'owner-detail', component: OwnerDetail, props: true },
      { path: '/staffs', name: 'staffs', component: staffs },
      { path: '/brokers', name: 'brokers', component: brokers },
      { path: '/brokers/:id', name: 'broker-detail', component: BrokerDetail, props: true },
      { path: '/brokerDetail/:id', name: 'brokerDetail', component: brokerDetail, props: true },
      { path: '/subDetail/:id', name: 'subDetail', component: subDetail, props: true },
    ]
  },
  { path: "/access-denied", name: "access-denied", component: AccessDenied },
  { path: "/forgot-password-root", name: "forgotPassword", component: ForgotPassword },
  { path: "/reset/:token", name: "reset", component: Reset, meta: { requiresGuest: true } },
  { path: "/:pathMatch(.*)*", name: "accessDenied", component: AccessDenied, meta: { requiresGuest: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- DYNAMIC INTERCEPT GUARD ---
router.beforeEach((to, from, next) => {
  const isAuthenticated = Boolean(localStorage.getItem("access"));
  const userRole = getRole();
  const tenantType = getTenantContext().tenantType;

  // 1. DYNAMIC INITIAL LOAD INTERCEPTION (The core request)
  if (to.path === "/") {
    if (tenantType === 'admin') {
      return next('/login');
    }
    return next();
  }

  // 2. STANDARD AUTHENTICATION GUARDS
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  const requiredRole = to.meta.role;

  if (requiresAuth) {
    if (!isAuthenticated) {
      return next("/login");
    } else if (requiredRole && userRole !== requiredRole) {
      return next("/access-denied");
    } else {
      return next();
    }
  } else if (requiresGuest && isAuthenticated && to.path === "/login") {
    // Quality of life fix: If already logged in, do not let them visit /login path
    return next("/dashboard");
  }

  next();
});

export default router;