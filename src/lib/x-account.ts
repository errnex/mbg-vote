import type { SessionXUser } from "@/lib/types";

export const MINIMUM_X_ACCOUNT_AGE_MONTHS = 1;

type TwitterApiProfile = {
  data?: {
    id?: string;
    username?: string;
    name?: string;
    profile_image_url?: string | null;
    created_at?: string;
  };
};

export function isXAccountOldEnough(
  xCreatedAt: string | Date | null | undefined,
  now = new Date()
) {
  if (!xCreatedAt) {
    return false;
  }

  const createdAt =
    xCreatedAt instanceof Date ? xCreatedAt : new Date(xCreatedAt);

  if (Number.isNaN(createdAt.getTime())) {
    return false;
  }

  const minimumCreatedAt = new Date(now);
  minimumCreatedAt.setMonth(
    minimumCreatedAt.getMonth() - MINIMUM_X_ACCOUNT_AGE_MONTHS
  );

  return createdAt <= minimumCreatedAt;
}

export function extractXProfile(profile: unknown): SessionXUser | null {
  const data = (profile as TwitterApiProfile | undefined)?.data;

  if (!data?.id || !data.username || !data.name || !data.created_at) {
    return null;
  }

  return {
    xUserId: data.id,
    username: data.username,
    displayName: data.name,
    profileImageUrl: data.profile_image_url ?? null,
    xCreatedAt: new Date(data.created_at).toISOString()
  };
}
