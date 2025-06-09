"use server";

import { getTranslations } from 'next-intl/server';

import { withPermission } from "@/lib/permission/guards/action";
import { AppError } from "@/lib/types/app.error";
import { PageParams } from "@/utils/drizzle.page";
import { ProfileQuery } from "@/lib/db/crud/auth/profile.query";
import { ProfileMapper } from "@/lib/mappers/auth/profile";
import { ProfileDTO } from "@/lib/types/auth/profile.dto";
import { Profile } from "@/lib/db/schemas/auth/profile";

export const listUserProfile = withPermission(
  "listUserProfile",
  async (
    params?: PageParams<Profile>
  ): Promise<{ data: ProfileDTO[]; total: number; page: number; pageSize: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }> => {
    const t = await getTranslations('AuthListUserProfile');
    try {
      // Note: The current PermissionConfigQuery.getAll() does not support pagination, filtering, or sorting.
      // This implementation assumes these capabilities will be added to the query layer.
      // For now, we fetch all and apply client-side logic.
      const profiles = await ProfileQuery.getPagination(params || {});

      // Map database results to DTOs
      const dtos = ProfileMapper.toDTOList(profiles.data);

      return {
        data: dtos,
        total: profiles.total,
        page: profiles.page,
        pageSize: profiles.pageSize,
        totalPages: profiles.totalPages,
        hasNext: profiles.hasNext,
        hasPrevious: profiles.hasPrevious,
      };
    } catch (error) {
      console.error('errorFetchingUserProfiles', error);
      if (error instanceof AppError) {
        throw error;
      }
      return {
        data: [],
        total: 0,
        page: 0,
        pageSize: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
    }
  }
);
