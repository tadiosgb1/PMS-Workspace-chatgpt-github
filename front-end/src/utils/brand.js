export const DEFAULT_BRANDS = {
  primary: "#5f5ffc",
  dprimary: "#5f5ffc",
  secondary: "#FF6B00",
  tertiary: "#c7d2fe",
  icon: "#FF6B00",
  background: "#f0f4f8",
  main: "#3490dc",
  mainDark: "#1e3a8a",
};

export const BRAND_STORAGE_KEY = "alpha_pms_brand";

export function applyBrandTheme(brand = DEFAULT_BRANDS) {
  if (typeof document === "undefined") return;

  const palette = { ...DEFAULT_BRANDS, ...(brand || {}) };
  const root = document.documentElement;

  root.style.setProperty("--color-primary", palette.primary);
  root.style.setProperty("--color-dprimary", palette.dprimary);
  root.style.setProperty("--color-secondary", palette.secondary);
  root.style.setProperty("--color-tertiary", palette.tertiary);
  root.style.setProperty("--color-icon", palette.icon);
  root.style.setProperty("--color-background", palette.background);
  root.style.setProperty("--color-main", palette.main);
  root.style.setProperty("--color-main-dark", palette.mainDark);
}

export function loadBrandTheme() {
  try {
    const stored = JSON.parse(localStorage.getItem(BRAND_STORAGE_KEY) || "null");
    const palette = { ...DEFAULT_BRANDS, ...(stored || {}) };
    applyBrandTheme(palette);
    return palette;
  } catch {
    applyBrandTheme(DEFAULT_BRANDS);
    return { ...DEFAULT_BRANDS };
  }
}

export function restoreDefaultBrandTheme() {
  const palette = { ...DEFAULT_BRANDS };
  localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(palette));
  localStorage.setItem("alpha_pms_active_brand_name", "Default");
  applyBrandTheme(palette);
  return palette;
}

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
