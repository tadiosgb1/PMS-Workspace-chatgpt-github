// src/composables/useTenant.js

const ADMIN_HOST = 'adminproperty.alpha.com.et';
const PORTAL_HOST = 'property.alpha.com.et';

export function getTenantContext() {
  const { hostname, port } = window.location;
  const lowerHost = hostname.toLowerCase();

  // Development: port identifies the application.
  if (port === '3000') {
    return { tenantType: 'admin', tenantId: 'admin' };
  }

  if (port === '3001') {
    return { tenantType: 'portal', tenantId: 'property' };
  }

  // Production: hostname identifies the application.
  if (lowerHost === ADMIN_HOST) {
    return { tenantType: 'admin', tenantId: 'admin' };
  }

  if (lowerHost === PORTAL_HOST) {
    return { tenantType: 'portal', tenantId: 'property' };
  }

  // Safe default: unknown hosts use the public portal.
  return { tenantType: 'portal', tenantId: 'property' };
}

export function isAdminTenant() {
  return getTenantContext().tenantType === 'admin';
}

export function isPortalTenant() {
  return getTenantContext().tenantType === 'portal';
}

export function useTenant() {
  return getTenantContext();
}