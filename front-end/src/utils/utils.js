import axios from "axios";
import router from '../router';
import store from '../store';

router.push('/');

// ─── HTTP Client ─────────────────────────────────────────────────────────────

export function reloadPage() {
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

export function getApiClient() {
  const isProduction = import.meta.env.MODE === "production";
  const baseUrl = isProduction
    ? import.meta.env.VITE_APP_BASE_URL_PRODUCTION
    : import.meta.env.VITE_APP_BASE_URL_LOCAL;

  return axios.create({ baseURL: baseUrl });
}

function handleApiError(error) {
  let status = 0;
  let message = "An unexpected error occurred.";

  if (error.response) {
    status = error.response.status;

    if (status === 401 && error.response.data?.error?.option === 1) {
      return;
    }

    if (status >= 100 && status < 200) {
      message = `Informational response: ${status}. Please wait...`;
    } else if (status >= 300 && status < 400) {
      message = `Redirection: ${status}. The resource has moved.`;
    } else if (status >= 400 && status < 500) {
      const errorMessages = {
        400: "Bad Request. Please check your input.",
        401: "Unauthorized. Please log in.",
        403: "Forbidden. You don't have permission.",
        404: "Resource not found.",
        405: "Method not allowed.",
        408: "Request timed out.",
        409: "Conflict with current resource state.",
        410: "The resource is no longer available.",
        429: "Too many requests. Slow down!",
      };
      message =
        error.response.data ||
        error.response.data?.message ||
        errorMessages[status] ||
        `Client Error: ${status}. Please check your request.`;
    } else if (status >= 500 && status < 600) {
      const errorMessages = {
        500: "Internal server error.",
        501: "Not implemented.",
        502: "Bad gateway.",
        503: "Service unavailable.",
        504: "Gateway timeout.",
        505: "HTTP version not supported.",
      };
      message =
        error.response.data ||
        error.response.data?.message ||
        errorMessages[status] ||
        `Server Error: ${status}. Please try again later.`;
    } else {
      message = `Unexpected Error: ${status}. Please contact support.`;
    }
  } else if (error.request) {
    message = "No response received from the server. Please check your connection.";
  } else if (error.message) {
    message = `Error: ${error.message}`;
  }

  console.error("API Error:", { status, message, error });
  throw { status, message };
}

function getDefaultHeaders(customHeaders = {}) {
  const token = localStorage.getItem("access");

  // Create base headers first
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Strictly check if token exists and isn't a weird string artifact
  if (token && token !== "null" && token !== "undefined") {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Merge with custom headers
  const headers = {
    ...defaultHeaders,
    ...customHeaders,
  };

  // Let the browser set the boundary for FormData
  if (customHeaders["Content-Type"] === "multipart/form-data") {
    delete headers["Content-Type"];
  }

  return headers;
}

// ─── HTTP Methods ─────────────────────────────────────────────────────────────

export async function apiGet(url, params = {}, customHeaders = {}) {
  const apiClient = getApiClient();
  try {
    const headers = getDefaultHeaders(customHeaders);
    const response = await apiClient.get(url, { params, headers });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function apiGetById(url, id, customHeaders = {}) {
  const apiClient = getApiClient();
  try {
    const headers = getDefaultHeaders(customHeaders);
    const response = await apiClient.get(`${url}/${id}`, { headers });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function apiPost(url, data, customHeaders = {}) {
  const apiClient = getApiClient();
  try {
    const headers = getDefaultHeaders(customHeaders);
    const response = await apiClient.post(url, data, { headers });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function apiPut(url, id, data, customHeaders = {}) {
  const apiClient = getApiClient();
  try {
    const headers = getDefaultHeaders(customHeaders);
    const response = await apiClient.put(`${url}/${id}`, data, { headers });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function apiPatch(url, id, data, customHeaders = {}) {
  const apiClient = getApiClient();
  try {
    const headers = getDefaultHeaders(customHeaders);
    const response = await apiClient.patch(`${url}/${id}`, data, { headers });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function apiDelete(url, id = null, customHeaders = {}) {
  const apiClient = getApiClient();
  try {
    const headers = getDefaultHeaders(customHeaders);
    const finalUrl = id ? `${url}/${id}` : url;
    const response = await apiClient.delete(finalUrl, { headers });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function isStrongPassword(password) {
  const minLength = 8;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!password || password.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters long` };
  }
  if (!regex.test(password)) {
    return { valid: false, message: 'Password must include uppercase, lowercase, number, and special character' };
  }
  return { valid: true, message: 'Password is strong' };
}

export function validateField(formName, fieldName, value, formSchema) {
  const fieldSchema = formSchema[formName]?.fields[fieldName];
  if (!fieldSchema) {
    console.error('No schema found for this field');
    return { valid: true, message: '' };
  }

  const generateErrorMessage = (rule) => {
    switch (rule) {
      case 'required':  return `${fieldName} is required`;
      case 'minLength': return `${fieldName} must be at least ${fieldSchema.minLength} characters long`;
      case 'maxLength': return `${fieldName} cannot exceed ${fieldSchema.maxLength} characters`;
      case 'pattern':   return `Please enter a valid ${fieldName}`;
      case 'match':     return `${fieldName} must match the password`;
      default:          return `${fieldName} is invalid`;
    }
  };

  if (fieldSchema.rules.required && !value)
    return { valid: false, message: generateErrorMessage('required') };
  if (fieldSchema.rules.minLength && value.length < fieldSchema.rules.minLength)
    return { valid: false, message: generateErrorMessage('minLength') };
  if (fieldSchema.rules.maxLength && value.length > fieldSchema.rules.maxLength)
    return { valid: false, message: generateErrorMessage('maxLength') };
  if (fieldSchema.rules.pattern && !fieldSchema.rules.pattern.test(value))
    return { valid: false, message: generateErrorMessage('pattern') };
  if (fieldSchema.rules.match && value !== fieldSchema.rules.match)
    return { valid: false, message: generateErrorMessage('match') };

  return { valid: true, message: '' };
}

// ─── Date Utilities ───────────────────────────────────────────────────────────

export function gregorianToEthiopian(today) {
  const ETHIOPIAN_EPOCH_OFFSET = 8;
  const GREGORIAN_NEW_YEAR = new Date(today.getFullYear(), 8, 11);

  let ethiopianYear = today.getFullYear() - ETHIOPIAN_EPOCH_OFFSET;
  if (today < GREGORIAN_NEW_YEAR) ethiopianYear -= 1;

  const ethiopianNewYear = new Date(ethiopianYear + ETHIOPIAN_EPOCH_OFFSET, 8, 11);
  const daysSinceNewYear = Math.floor((today - ethiopianNewYear) / (1000 * 60 * 60 * 24));

  let ethiopianMonth = Math.floor(daysSinceNewYear / 30) + 1;
  let ethiopianDay   = (daysSinceNewYear % 30) + 1;

  if (ethiopianMonth > 13) {
    ethiopianMonth = 13;
    ethiopianDay   = daysSinceNewYear - 360 + 1;
  }

  return `${ethiopianYear}-${ethiopianMonth.toString().padStart(2, "0")}-${ethiopianDay.toString().padStart(2, "0")}`;
}

// ─── File Utilities ───────────────────────────────────────────────────────────

export function getPdfBlobUrl(base64Data) {
  const binaryData = atob(base64Data);
  const arrayBuffer = new ArrayBuffer(binaryData.length);
  const uint8Array  = new Uint8Array(arrayBuffer);
  for (let i = 0; i < binaryData.length; i++) {
    uint8Array[i] = binaryData.charCodeAt(i);
  }
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

export function base64ToFile(base64, fileName, mimeType) {
  const byteString = atob(base64);
  const ab  = new ArrayBuffer(byteString.length);
  const ia  = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
}

export function processFilesToAdd(fileList) {
  return new Promise((resolve) => {
    const processedFiles = [];
    let processedCount   = 0;

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        processedFiles.push({
          filename:     file.name,
          fileType:     file.type,
          size:         file.size,
          description:  "",
          fileData:     reader.result.split(",")[1],
          preview:      reader.result.split(",")[1],
          uploadedDate: "Not Uploaded/Not Saved",
        });
        processedCount += 1;
        if (processedCount === fileList.length) resolve(processedFiles);
      };
      reader.readAsDataURL(file);
    });

    if (fileList.length === 0) resolve(processedFiles);
  });
}

export function triggerFileInput(ref) {
  if (ref && ref.click) ref.click();
}

export function handleFileInput(event, method, callback) {
  let files = [];
  if (method === "input") {
    files = Array.from(event.target.files);
  } else if (method === "drop") {
    files = Array.from(event.dataTransfer.files);
  }
  if (typeof callback === "function") callback(files);
}

export function toggleDragState(context, isDragging) {
  if (context) context.isDragging = isDragging;
}

export function removeAttachment(filesArray, index) {
  if (Array.isArray(filesArray) && index >= 0 && index < filesArray.length) {
    filesArray.splice(index, 1);
  }
}

export function handleAnyFileInput(refName) {
  const fileInput = this.$refs[refName];
  if (fileInput && fileInput.files.length > 0) {
    return fileInput.files[0];
  }
  console.error("No file selected.");
  return null;
}

export function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload  = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function loadPermissions($apiPost) {
  const groups = JSON.parse(localStorage.getItem("groups") || "[]");
  let allPermissions = JSON.parse(localStorage.getItem("permissions") || "[]");

  for (const groupName of groups) {
    try {
      const res = await $apiPost("/get_group_permissions", { name: groupName });
      if (res && Array.isArray(res.permissions)) {
        allPermissions.push(...res.permissions);
      }
    } catch (err) {
      console.error(`Failed to fetch permissions for group: ${groupName}`, err);
    }
  }

  allPermissions = [...new Set(allPermissions)];
  localStorage.setItem("permissions", JSON.stringify(allPermissions));
}

export function hasPermission(permission) {
  const userPermissions = JSON.parse(localStorage.getItem("permissions") || "[]");
  return userPermissions.includes(permission);
}

// ─── User Helpers ─────────────────────────────────────────────────────────────

const userCache = {};

export async function getFullNameById(id) {
  if (!id) return "";
  if (userCache[id]) return userCache[id];

  try {
    const res = await this.$apiGetById(`/get_user`, id);
    if (res && res.first_name && res.middle_name) {
      userCache[id] = `${res.first_name} ${res.middle_name}`;
      return userCache[id];
    }
    userCache[id] = "";
    return "";
  } catch (err) {
    console.error("Error fetching user:", err);
    userCache[id] = "Unknown";
    return "";
  }
}

// ─── Data Fetchers (superuser / super_staff — no tenant-level filtering) ─────

/**
 * Fetch all property zones. superuser and super_staff see everything.
 */
export async function getZones(url = null, pageSize = 1000) {
  try {
    const apiUrl  = url || `/get_property_zones?page=1&page_size=${pageSize}`;
    const response = await this.$apiGet(apiUrl, {});
    const zones   = response.data || [];

    for (const zone of zones) {
      try {
        zone.ownerName   = zone.owner_id   ? await this.$getFullNameById(zone.owner_id)   : "-";
      } catch { zone.ownerName = "-"; }
      try {
        zone.managerName = zone.manager_id ? await this.$getFullNameById(zone.manager_id) : "-";
      } catch { zone.managerName = "-"; }
    }

    return {
      zones,
      currentPage: response.current_page || 1,
      totalPages:  response.total_pages  || 1,
      next:        response.next         || null,
      previous:    response.previous     || null,
    };
  } catch (err) {
    console.error("Error fetching zones:", err);
    return { zones: [], currentPage: 1, totalPages: 1, next: null, previous: null };
  }
}

// export async function getZones(search = "", params = {}) {
//   try {
//     const pageSize = params.pageSize || 1000000;
//     let apiUrl = `/get_property_zones?page=1&page_size=${pageSize}`;

//     // Add search parameter if provided
//     if (search && search.trim() !== "") {
//       apiUrl += `&search=${encodeURIComponent(search.trim())}`;
//     }

//     const response = await this.$apiGet(apiUrl, {});

//     const zones = response.data || [];

//     // Optional: enrich with owner/manager names
//     for (const zone of zones) {
//       try {
//         zone.ownerName = zone.owner_id ? await this.$getFullNameById(zone.owner_id) : "-";
//       } catch { zone.ownerName = "-"; }
//       try {
//         zone.managerName = zone.manager_id ? await this.$getFullNameById(zone.manager_id) : "-";
//       } catch { zone.managerName = "-"; }
//     }

//     return {
//       zones,
//       currentPage: response.current_page || 1,
//       totalPages: response.total_pages || 1,
//       next: response.next || null,
//       previous: response.previous || null,
//     };
//   } catch (err) {
//     console.error("Error fetching zones:", err);
//     return { zones: [], currentPage: 1, totalPages: 1, next: null, previous: null };
//   }
// }

/**
 * Fetch all managers. superuser and super_staff see all owners' managers.
 */
export async function getManagers(searchTerm = "") {
  try {
    const params = { page: 1, page_size: 1000, search: searchTerm.trim() };
    const response = await this.$apiGet(`/get_owner_managers`, params);
    const managers = response.data || [];

    return {
      managers,
      currentPage: response.current_page,
      totalPages:  response.total_pages,
      next:        response.next,
      previous:    response.previous,
    };
  } catch (err) {
    console.error("Error fetching managers:", err);
    return { managers: [], currentPage: 1, totalPages: 1, next: null, previous: null };
  }
}

/**
 * Fetch all properties. superuser and super_staff see everything.
 */
export async function getProperties(
  url = "/get_properties?page=1&page_size=10",
  extraParams = null
) {
  try {
    let params = {};

    if (extraParams && typeof extraParams === "object") {
      params = { ...params, ...extraParams };
    }

    const urlObj   = new URL(url, window.location.origin);
    const page     = params.page     || urlObj.searchParams.get("page")      || 1;
    const pageSize = params.page_size || urlObj.searchParams.get("page_size") || 10;
    const finalUrl = `/get_properties?page=${page}&page_size=${pageSize}`;

    const response   = await this.$apiGet(finalUrl, params);
    const properties = response.data || [];

    await Promise.all(
      properties.map(async (property) => {
        try {
          if (property.owner_id) {
            const ownerRes = await this.$apiGetById("get_user", property.owner_id);
            property.ownerName = ownerRes.first_name || "-";
          } else {
            property.ownerName = "-";
          }
        } catch { property.ownerName = "-"; }

        try {
          if (property.manager_id) {
            const managerRes = await this.$apiGetById("get_user", property.manager_id);
            property.managerName = managerRes.first_name || "-";
          } else {
            property.managerName = "-";
          }
        } catch { property.managerName = "-"; }

        try {
          if (property.property_zone_id) {
            const zoneRes = await this.$apiGetById("get_property_zone", property.property_zone_id);
            property.zoneName = zoneRes.name || "-";
          } else {
            property.zoneName = "-";
          }
        } catch { property.zoneName = "-"; }
      })
    );

    return {
      properties,
      currentPage: response.current_page || 1,
      totalPages:  response.total_pages  || 1,
      next:        response.next         || null,
      previous:    response.previous     || null,
    };
  } catch (err) {
    console.error("Error fetching properties:", err);
    return { properties: [], currentPage: 1, totalPages: 1, next: null, previous: null };
  }
}

/**
 * Fetch all tenants. superuser and super_staff see everything.
 */
export async function getTenants(url = null, pageSize = 10, searchTerm = "") {
  try {
    const params   = { search: searchTerm };
    const apiUrl   = url || `/my_tenants?page=1&page_size=${pageSize}`;
    const response = await this.$apiGet(apiUrl, params);
    const tenants  = response.data || [];

    return {
      tenants,
      currentPage: response.current_page || 1,
      totalPages:  response.total_pages  || 1,
      next:        response.next         || null,
      previous:    response.previous     || null,
    };
  } catch (err) {
    console.error("Error fetching tenants:", err);
    return { tenants: [], currentPage: 1, totalPages: 1, next: null, previous: null };
  }
}

/**
 * Fetch all coworking spaces. superuser and super_staff see everything.
 */
export async function getCoworkingSpaces(url = null, pageSize = 10) {
  try {
    const apiUrl   = url || `/get_coworking_spaces?page=1&page_size=${pageSize}`;
    const response = await this.$apiGet(apiUrl, {});
    const spaces   = response.data || [];

    return {
      spaces,
      currentPage: response.current_page || 1,
      totalPages:  response.total_pages  || 1,
      next:        response.next         || null,
      previous:    response.previous     || null,
    };
  } catch (err) {
    console.error("Error fetching coworking spaces:", err);
    return { spaces: [], currentPage: 1, totalPages: 1, next: null, previous: null };
  }
}

/**
 * Fetch all workspace rentals. superuser and super_staff see everything.
 */
export async function getWorkspaceRentals(url = null, pageSize = 100) {
  try {
    const apiUrl   = url || `/get_workspace_rentals?page=1&page_size=${pageSize}`;
    const response = await this.$apiGet(apiUrl, {});
    const rentals  = response.data?.results || response.data || [];

    return {
      rentals,
      currentPage: response.current_page || 1,
      totalPages:  response.total_pages  || 1,
      next:        response.next         || null,
      previous:    response.previous     || null,
    };
  } catch (err) {
    console.error("Error fetching workspace rentals:", err);
    return { rentals: [], currentPage: 1, totalPages: 1, next: null, previous: null };
  }
}

/**
 * Fetch all workspace payments. superuser and super_staff see everything.
 */
export async function getWorkspacePayments(url = null, params = {}) {
  try {
    const apiUrl   = url || `/get_rental_payments?page=1&page_size=${params.page_size || 10}`;
    const response = await this.$apiGet(apiUrl, params);
    const payments = response.data?.results || response.data || [];

    return {
      payments,
      currentPage: response.current_page || 1,
      totalPages:  response.total_pages  || 1,
      next:        response.next         || null,
      previous:    response.previous     || null,
    };
  } catch (err) {
    console.error("Error fetching workspace payments:", err);
    return { payments: [], currentPage: 1, totalPages: 1, next: null, previous: null };
  }
}


// ─── Offplan centralized data fetchers ───────────────────────────────────────

function offplanList(response, keys = []) {
  const raw = response?.data ?? response;
  if (Array.isArray(raw)) return raw;
  for (const key of keys) if (Array.isArray(raw?.[key])) return raw[key];
  return Array.isArray(raw?.results) ? raw.results : [];
}

async function getOffplanCollection(url, keys, params = {}) {
  try {
    // These collection getters intentionally do not apply role-based filtering yet.
    // Role/ownership rules will be implemented once the backend role relationships
    // are fully defined. The backend remains the authorization boundary.
    const response = await apiGet(url, { page: 1, page_size: 1000, ...params });
    return offplanList(response, keys);
  } catch (err) {
    console.error("Error fetching " + url + ":", err);
    return [];
  }
}

export function getOffplanApplications(params = {}) {
  return getOffplanCollection("/get_offplan_applications", ["applications"], params);
}

export function getOffplanProperties(params = {}) {
  return getOffplanCollection("/get_offplan_properties", ["properties"], params);
}

export function getOffplanPayments(params = {}) {
  return getOffplanCollection("/get_offplan_payments", ["payments"], params);
}

export function getOffplanPaymentPlans(params = {}) {
  return getOffplanCollection("/get_offplan_payment_plans", ["payment_plans"], params);
}

export function getOffplanMilestones(params = {}) {
  return getOffplanCollection("/get_offplan_milestones", ["milestones"], params);
}

export function getOffplanBankFinancings(params = {}) {
  return getOffplanCollection("/get_offplan_bank_financings", ["financings"], params);
}

// ─── Authentication / Role Helper ────────────────────────────────────────────
export function getRole() {
  try {
    if (localStorage.getItem("is_superuser") === "true") return "superuser";

    const storedRole = localStorage.getItem("role");
    if (storedRole === "super_staff") return "super_staff";

    const rawGroups = localStorage.getItem("groups");
    if (rawGroups) {
      const groups = JSON.parse(rawGroups);
      if (Array.isArray(groups) && groups.length > 0) {
        return String(groups[0]).trim().toLowerCase();
      }
    }

    return storedRole ? String(storedRole).trim().toLowerCase() : "tenant";
  } catch {
    return "tenant";
  }
}
