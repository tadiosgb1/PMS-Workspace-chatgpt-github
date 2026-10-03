// Centralized authentication role helper.
// Kept independent from the router to avoid a circular dependency.
export function getRole() {
  try {
    if (localStorage.getItem("is_superuser") === "true") return "superuser";
    const storedRole = localStorage.getItem("role");
    if (storedRole === "super_staff") return "super_staff";
    const rawGroups = localStorage.getItem("groups");
    if (rawGroups) {
      const groups = JSON.parse(rawGroups);
      if (Array.isArray(groups) && groups.length > 0) return String(groups[0]).trim().toLowerCase();
    }
    return storedRole ? String(storedRole).trim().toLowerCase() : "tenant";
  } catch { return "tenant"; }
}
