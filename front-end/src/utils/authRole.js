// Centralized authentication role helper.
export function getRole() {
  try {
    if (localStorage.getItem("is_superuser") === "true") return "superuser";
    const storedRole = String(localStorage.getItem("role") || "").trim().toLowerCase();
    const rawGroups = localStorage.getItem("groups");
    let names = [];
    if (rawGroups) {
      const groups = JSON.parse(rawGroups);
      if (Array.isArray(groups)) {
        names = groups.map(group => typeof group === "string" ? group : group?.name || group?.group || group?.role || "")
          .map(group => String(group).trim().toLowerCase()).filter(Boolean);
      }
    }
    const candidates = [storedRole, ...names];
    const priority = ["superuser", "admin", "super_staff", "owner", "manager", "staff", "developer", "tenant"];
    return priority.find(role => candidates.includes(role)) || storedRole || names[0] || "tenant";
  } catch { return "tenant"; }
}
