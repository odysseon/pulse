import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CurrentIdentity, type RequestIdentity } from '@odysseon/whoami-adapter-nestjs';
import { DeleteBusinessProfileUseCase } from '../../application/use-cases/delete-business-profile.use-case.js';
import { GetMyBusinessProfileUseCase } from '../../application/use-cases/get-my-business-profile.use-case.js';
import { UpdateBusinessProfileUseCase } from '../../application/use-cases/update-business-profile.use-case.js';
import { CreateBusinessProfileUseCase } from '../../application/use-cases/create-business-profile.use-case.js';
import { SetOperatingHoursUseCase } from '../../application/use-cases/set-operating-hours.use-case.js';
import { SetBusinessTagsUseCase } from '../../application/use-cases/set-business-tags.use-case.js';
import { GetDashboardStatsUseCase } from '../../application/use-cases/get-dashboard-stats.use-case.js';
import { RequestContactVerificationUseCase } from '../../application/use-cases/request-contact-verification.use-case.js';
import { VerifyContactOtpUseCase } from '../../application/use-cases/verify-contact-otp.use-case.js';
import {
  CreateBusinessProfileDto,
  UpdateBusinessProfileDto,
  RequestContactVerificationDto,
  VerifyContactOtpDto,
} from '../dto/request.dto.js';
import { BusinessProfileResponseDto, DashboardStatsResponseDto } from '../dto/response.dto.js';
import { SetOperatingHoursDto } from '../dto/operating-hours.dto.js';
import { SetTagsDto } from '../dto/tag.dto.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('business management')
@Controller()
export class BusinessProfileController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createBusinessProfile: CreateBusinessProfileUseCase,
    private readonly requestContactVerification: RequestContactVerificationUseCase,
    private readonly verifyContactOtp: VerifyContactOtpUseCase,
    private readonly updateBusinessProfile: UpdateBusinessProfileUseCase,
    private readonly deleteBusinessProfile: DeleteBusinessProfileUseCase,
    private readonly getMyBusinessProfile: GetMyBusinessProfileUseCase,
    private readonly setOperatingHours: SetOperatingHoursUseCase,
    private readonly setBusinessTags: SetBusinessTagsUseCase,
    private readonly getDashboardStats: GetDashboardStatsUseCase,
  ) {}

  @Post('business')
  async createProfile(
    @CurrentIdentity() identity: RequestIdentity,
    @Body() dto: CreateBusinessProfileDto,
  ): Promise<BusinessProfileResponseDto> {
    const { id: userId } = await this.resolveUser(identity.accountId);
    const profile = await this.createBusinessProfile.execute({
      ownerId: userId,
      ...dto,
    });
    return BusinessProfileResponseDto.from(profile);
  }

  @Post('business/:id/contacts/request-verification')
  @HttpCode(HttpStatus.OK)
  async requestContactVerificationEndpoint(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
    @Body() dto: RequestContactVerificationDto,
  ): Promise<void> {
    const { id: userId } = await this.resolveUser(identity.accountId);
    await this.requestContactVerification.execute(id, userId, dto.method);
  }

  @Post('business/:id/contacts/verify')
  @HttpCode(HttpStatus.OK)
  async verifyContactOtpEndpoint(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
    @Body() dto: VerifyContactOtpDto,
  ): Promise<BusinessProfileResponseDto> {
    const { id: userId } = await this.resolveUser(identity.accountId);
    const profile = await this.verifyContactOtp.execute(id, userId, dto.method, dto.otp);
    return BusinessProfileResponseDto.from(profile);
  }

  @Patch('business/:id')
  async update(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessProfileDto,
  ): Promise<BusinessProfileResponseDto> {
    const { id: userId } = await this.resolveUser(identity.accountId);

    const profile = await this.updateBusinessProfile.execute(id, userId, {
      ...dto,
    });

    return BusinessProfileResponseDto.from(profile);
  }

  @Delete('business/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
  ): Promise<void> {
    const { id: userId } = await this.resolveUser(identity.accountId);
    await this.deleteBusinessProfile.execute(id, userId);
  }

  @Get('users/me/business')
  async getMyProfile(
    @CurrentIdentity() identity: RequestIdentity,
  ): Promise<BusinessProfileResponseDto> {
    const { id: userId } = await this.resolveUser(identity.accountId);
    const profile = await this.getMyBusinessProfile.execute(userId);
    if (!profile) {
      throw new NotFoundException('You do not have a business profile.');
    }
    return BusinessProfileResponseDto.from(profile);
  }

  @Get('business/:id/dashboard-stats')
  async getStats(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
  ): Promise<DashboardStatsResponseDto> {
    const { id: userId } = await this.resolveUser(identity.accountId);
    const stats = await this.getDashboardStats.execute(id, userId);
    return stats;
  }

  @Put('business/:id/hours')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateHours(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
    @Body() dto: SetOperatingHoursDto,
  ): Promise<void> {
    const { id: userId, isAdmin } = await this.resolveUser(identity.accountId);
    await this.setOperatingHours.execute(id, dto.hours, userId, isAdmin);
  }

  @Put('business/:id/tags')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateTags(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
    @Body() dto: SetTagsDto,
  ): Promise<void> {
    const { id: userId, isAdmin } = await this.resolveUser(identity.accountId);
    await this.setBusinessTags.execute(id, dto.tagIds, userId, isAdmin);
  }

  private async resolveUser(accountId: string): Promise<{ id: string; isAdmin: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { accountId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    return {
      id: user.id,
      isAdmin: user.role === 'ADMIN',
    };
  }
}
