export function formatSubscription(sub: string | null | undefined): string {
  if (!sub) return "";
  return sub.charAt(0) + sub.slice(1).toLowerCase();
}

export function formatRole(role: string | null | undefined): string {
  if (!role) return "";
  return role.charAt(0) + role.slice(1).toLowerCase();
}
