export type RoleType = 'USER' | 'ADMIN';

export interface UserEntity {
  id: string;
  accountId: string;
  name: string;
  role: RoleType;
  avatarUrl: string | null;
  avatarId: string | null;
}
