import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { IBusinessProfileRepository } from '../../domain/ports/business-profile.repository.port.js';
import { ContactMethod } from '../../api/dto/request.dto.js';
import { RedisService } from '../../../../shared/redis/redis.service.js';
import { MailQueueService } from '../../../../mail/mail-queue.service.js';
import * as crypto from 'crypto';

@Injectable()
export class RequestContactVerificationUseCase {
  private readonly logger = new Logger(RequestContactVerificationUseCase.name);

  constructor(
    private readonly businessProfileRepo: IBusinessProfileRepository,
    private readonly redisService: RedisService,
    private readonly mailQueueService: MailQueueService,
  ) {}

  async execute(businessId: string, userId: string, method: ContactMethod): Promise<void> {
    const profile = await this.businessProfileRepo.findById(businessId);

    if (!profile || profile.ownerId !== userId) {
      throw new NotFoundException('Business profile not found.');
    }

    let contactValue: string | null = null;

    switch (method) {
      case ContactMethod.EMAIL:
        contactValue = profile.email;
        if (profile.isEmailVerified) throw new BadRequestException('Email is already verified.');
        break;
      case ContactMethod.PHONE:
        contactValue = profile.phoneNumber;
        if (profile.isPhoneVerified)
          throw new BadRequestException('Phone number is already verified.');
        break;
      case ContactMethod.WHATSAPP:
        contactValue = profile.whatsapp;
        if (profile.isPhoneVerified)
          throw new BadRequestException('Phone number (WhatsApp) is already verified.');
        break;
    }

    if (!contactValue) {
      throw new BadRequestException(`No ${method.toLowerCase()} associated with this profile.`);
    }

    // Generate 6 digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const redisKey = `contact_verification:${businessId}:${method}`;

    // Store in Redis with 10 mins expiry
    await this.redisService.getClient().set(redisKey, otp, 'EX', 600);

    if (method === ContactMethod.EMAIL) {
      await this.mailQueueService.enqueueMail({
        to: contactValue,
        subject: 'Verify your Business Email',
        template: 'business-verification',
        context: {
          businessName: profile.name,
          otp,
        },
      });
    } else {
      // Mock SMS/WhatsApp delivery
      this.logger.log(`[MOCK SMS/WHATSAPP] Sending OTP ${otp} to ${contactValue} for ${method}`);
    }
  }
}
