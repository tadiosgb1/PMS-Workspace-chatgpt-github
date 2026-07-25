// src/composables/useTenant.js

export function useTenant() {
  const { hostname, pathname, port } = window.location;

  // Define your base SaaS domain (update this for production)
  const baseSaaSAppDomain = 'propertymsaas.com'; 

  let tenantType = 'client'; // default fallback
  let tenantId = null;

  // 1. PORT-BASED DETECTION (Local Dev)
  if (port === '7001') {
    return { tenantType: 'saas-owner', tenantId: 'admin' };
  }
  if (['7002', '7003', '7004', '7005'].includes(port)) {
    return { tenantType: 'client', tenantId: 'localhost-client' };
  }

  // 2. PATH-BASED FALLBACK (Useful for testing)
  if (pathname.startsWith('/saas-admin')) {
    return { tenantType: 'saas-owner', tenantId: 'admin' };
  }

  // 3. DOMAIN / SUBDOMAIN DETECTION (Production/Staging)
  // Split hostname into parts: ['subdomain', 'propertymsaas', 'com']
  const parts = hostname.toLowerCase().split('.');
  
  if (parts.length > 1) {
    const firstSubdomain = parts[0];

    // Check if it's explicitly the platform owner portal
    if (firstSubdomain === 'admin' || firstSubdomain === 'saas') {
      return { tenantType: 'saas-owner', tenantId: 'admin' };
    }

    // If it's a custom domain (e.g., 'myrealestate.com' instead of '*.propertymsaas.com')
    // or a dedicated tenant subdomain (e.g., 'acme.propertymsaas.com')
    if (hostname !== baseSaaSAppDomain && hostname !== 'localhost') {
      return { 
        tenantType: 'client', 
        tenantId: firstSubdomain // This acts as your client identifier slug
      };
    }
  }

  // Default Fallback
  return { tenantType: 'saas-owner', tenantId: 'admin' };
}