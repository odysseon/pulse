import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RedisService } from '../../shared/redis/redis.service.js';
import { IUserRepository } from '../core/ports/user.repository.interface.js';
import { UpdateUserProfileDto } from '../delivery/http/dto/update-user-profile.dto.js';
import { UserEntity } from '../core/domain/user.types.js';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  private getCacheKey(accountId: string): string {
    return `user:accountId:${accountId}`;
  }

  private updateCacheAsync(user: UserEntity): void {
    Promise.resolve()
      .then(async () => {
        await this.redisService.set(this.getCacheKey(user.accountId), user);
      })
      .catch(() => {});
  }

  async create(accountId: string, username: string): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        accountId,
        username,
      },
    });

    const domain = { ...user, role: user.role, businessId: null };
    this.updateCacheAsync(domain);
    return domain;
  }

  async findByAccountId(accountId: string): Promise<UserEntity | null> {
    const cached = await this.redisService.get<UserEntity>(this.getCacheKey(accountId));
    if (cached) return cached;
    const user = await this.prisma.user.findUnique({
      where: { accountId },
      include: {
        account: true,
        businessProfile: true,
      },
    });

    if (!user) return null;

    const { businessProfile, account, ...rest } = user;
    const domain = {
      ...rest,
      role: user.role,
      businessId: businessProfile?.id || null,
    };
    this.updateCacheAsync(domain);
    return domain;
  }

  async updateProfile(accountId: string, payload: UpdateUserProfileDto): Promise<UserEntity> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { accountId },
        data: {
          ...(payload.username !== undefined && { username: payload.username }),
          ...(payload.avatarUrl !== undefined && { avatarUrl: payload.avatarUrl }),
          ...(payload.avatarId !== undefined && { avatarId: payload.avatarId }),
        },
        include: {
          businessProfile: true,
        },
      });

      const { businessProfile, account, ...rest } = updatedUser as any;
      const domain = {
        ...rest,
        role: updatedUser.role,
        businessId: businessProfile?.id || null,
      };
      this.updateCacheAsync(domain);
      return domain;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025' // Prisma "Record to update not found" code
      ) {
        throw new NotFoundException('User profile not found for this account.');
      }
      throw error;
    }
  }
}
