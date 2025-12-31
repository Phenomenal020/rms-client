/**
 * Format subscription enum value for display
 * @param {string} sub - Subscription enum value (e.g., "REGULAR", "PRO")
 * @returns {string} Formatted subscription (e.g., "Regular", "Pro")
 */
export function formatSubscription(sub) {
  if (!sub) return "";
  return sub.charAt(0) + sub.slice(1).toLowerCase();
}

/**
 * Format role enum value for display
 * @param {string} role - Role enum value (e.g., "TEACHER", "ADMIN")
 * @returns {string} Formatted role (e.g., "Teacher", "Admin")
 */
export function formatRole(role) {
  if (!role) return "";
  return role.charAt(0) + role.slice(1).toLowerCase();
}

