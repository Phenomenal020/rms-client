// Utility functions to check verification link expiration times

import prisma from "./prisma";

/**
 * Check when a verification link expires by identifier (email)
 * @param identifier - The email address or identifier used for verification
 * @returns The expiration date/time or null if not found
 */
export async function getVerificationExpiration(identifier: string) {
  const verification = await prisma.verification.findFirst({
    where: {
      identifier: identifier,
    },
    orderBy: {
      createdAt: "desc", // Get the most recent verification
    },
    select: {
      expiresAt: true,
      createdAt: true,
      identifier: true,
    },
  });

  if (!verification) {
    return null;
  }

  return {
    expiresAt: verification.expiresAt,
    createdAt: verification.createdAt,
    identifier: verification.identifier,
    isExpired: new Date() > verification.expiresAt,
    timeRemaining: verification.expiresAt.getTime() - Date.now(),
    timeRemainingFormatted: formatTimeRemaining(
      verification.expiresAt.getTime() - Date.now()
    ),
  };
}

/**
 * Get all active (non-expired) verifications for an identifier
 * @param identifier - The email address or identifier
 * @returns Array of active verification records
 */
export async function getActiveVerifications(identifier: string) {
  const verifications = await prisma.verification.findMany({
    where: {
      identifier: identifier,
      expiresAt: {
        gt: new Date(), // Only get non-expired verifications
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      expiresAt: true,
      createdAt: true,
      identifier: true,
    },
  });

  return verifications.map((v) => ({
    ...v,
    timeRemaining: v.expiresAt.getTime() - Date.now(),
    timeRemainingFormatted: formatTimeRemaining(
      v.expiresAt.getTime() - Date.now()
    ),
  }));
}

/**
 * Format time remaining in a human-readable format
 * @param milliseconds - Time remaining in milliseconds
 * @returns Formatted string (e.g., "2 hours 30 minutes")
 */
function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) {
    return "Expired";
  }

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days} day${days > 1 ? "s" : ""}${remainingHours > 0 ? ` ${remainingHours} hour${remainingHours > 1 ? "s" : ""}` : ""}`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? "s" : ""}${remainingMinutes > 0 ? ` ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}` : ""}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else {
    return `${seconds} second${seconds > 1 ? "s" : ""}`;
  }
}

/**
 * Configuration constants for verification expiration times
 * These should match the values in auth.ts
 */
export const VERIFICATION_EXPIRATION_TIMES = {
  EMAIL_VERIFICATION: 24 * 60 * 60, // 24 hours in seconds
  PASSWORD_RESET: 60 * 60, // 1 hour in seconds
  EMAIL_CHANGE: 24 * 60 * 60, // 24 hours in seconds
} as const;

