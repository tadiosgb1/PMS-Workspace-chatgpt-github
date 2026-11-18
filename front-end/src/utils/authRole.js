// Centralized authentication role helper.
export function getRole() {
  try {
    if (localStorage.getItem("is_superuser") === "true") return "superuser";
    const storedRole = localStorage.getItem("role");
    if (storedRole) return String(storedRole).trim().toLowerCase();
    const rawGroups = localStorage.getItem("groups");
    if (rawGroups) {
      const groups = JSON.parse(rawGroups);
      if (Array.isArray(groups) && groups.length) {
        const names = groups.map(group => typeof group === "string" ? group : group?.name || group?.group || group?.role || "")
          .map(group => String(group).trim().toLowerCase()).filter(Boolean);
        const priority = ["superuser", "admin", "super_staff", "owner", "manager", "staff", "tenant"];
        return priority.find(role => names.includes(role)) || names[0] || "tenant";
      }
    }
    return "tenant";
  } catch { return "tenant"; }
}
