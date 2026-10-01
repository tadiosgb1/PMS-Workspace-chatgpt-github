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

function hexToRgbChannels(value) {
  const hex = String(value || "").trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return hex.match(/.{2}/g).map(part => parseInt(part, 16)).join(" ");
}

export function applyBrandTheme(brand = DEFAULT_BRANDS) {
  if (typeof document === "undefined") return;

  const palette = { ...DEFAULT_BRANDS, ...(brand || {}) };
  const root = document.documentElement;

  const variables = {
    "--color-primary": palette.primary,
    "--color-dprimary": palette.dprimary,
    "--color-secondary": palette.secondary,
    "--color-tertiary": palette.tertiary,
    "--color-icon": palette.icon,
    "--color-background": palette.background,
    "--color-main": palette.main,
    "--color-main-dark": palette.mainDark,
  };

  Object.entries(variables).forEach(([name, value]) => {
    const channels = hexToRgbChannels(value);
    if (channels) {
      root.style.setProperty(name, channels);
    }
  });
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
