export type RoleType = 'USER' | 'VENUE_OWNER' | 'ADMIN';

export interface UserEntity {
  id: string;
  accountId: string;
  name: string;
  role: RoleType;
  avatarUrl: string | null;
  avatarId: string | null;
  phoneNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}
