import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IBusinessProfileRepository } from '../../domain/ports/business-profile.repository.port.js';
import { ContactMethod } from '../../api/dto/request.dto.js';
import { RedisService } from '../../../../shared/redis/redis.service.js';
import { BusinessProfileView } from '../../domain/types/business-profile.types.js';

@Injectable()
export class VerifyContactOtpUseCase {
  constructor(
    private readonly businessProfileRepo: IBusinessProfileRepository,
    private readonly redisService: RedisService,
  ) {}

  async execute(businessId: string, userId: string, method: ContactMethod, otp: string): Promise<BusinessProfileView> {
    const profile = await this.businessProfileRepo.findById(businessId);
    
    if (!profile || profile.ownerId !== userId) {
      throw new NotFoundException('Business profile not found.');
    }

    const redisKey = `contact_verification:${businessId}:${method}`;
    const storedOtp = await this.redisService.getClient().get(redisKey);

    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestException('Invalid or expired OTP.');
    }

    // Delete OTP
    await this.redisService.getClient().del(redisKey);

    let isEmailVerified = profile.isEmailVerified;
    let isPhoneVerified = profile.isPhoneVerified;

    if (method === ContactMethod.EMAIL) {
      isEmailVerified = true;
    } else if (method === ContactMethod.PHONE || method === ContactMethod.WHATSAPP) {
      isPhoneVerified = true;
    }

    let newStatus = profile.verificationStatus;
    if (isEmailVerified && isPhoneVerified) {
      newStatus = 'VERIFIED';
    }

    return this.businessProfileRepo.update(businessId, {
      isEmailVerified,
      isPhoneVerified,
      verificationStatus: newStatus,
    });
  }
}
