import { Profile } from '@/lib/db/schemas/auth/profile';
import { ProfileDTO } from '@/lib/types/auth/profile.dto';

export const ProfileMapper = {
  toDTO: (model: Profile): ProfileDTO => {
    return {
      id: model.id,
      email: model.email,
      roles: model.roles,
      username: model.username || null,
      full_name: model.full_name || null,
      avatar_url: model.avatar_url || null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    };
  },
  fromDTO: (dto: ProfileDTO): Partial<Profile> => {
    return {
      id: dto.id,
      email: dto.email,
      roles: dto.roles,
      username: dto.username,
      full_name: dto.full_name,
      avatar_url: dto.avatar_url,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      deletedAt: dto.deletedAt,
    };
  },
  toDTOList: (models: Profile[]): ProfileDTO[] => {
    return models.map(ProfileMapper.toDTO);
  },
  fromDTOList: (dtos: ProfileDTO[]): Partial<Profile>[] => {
    return dtos.map(ProfileMapper.fromDTO);
  },
};