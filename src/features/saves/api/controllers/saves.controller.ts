import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentIdentity } from '@odysseon/whoami-adapter-nestjs';
import type { RequestIdentity } from '@odysseon/whoami-adapter-nestjs';
import { PrismaService } from '../../../../prisma/prisma.service.js';

import { SaveBusinessUseCase } from '../../application/use-cases/save-business.use-case.js';
import { UnsaveBusinessUseCase } from '../../application/use-cases/unsave-business.use-case.js';
import { SaveListingUseCase } from '../../application/use-cases/save-listing.use-case.js';
import { UnsaveListingUseCase } from '../../application/use-cases/unsave-listing.use-case.js';
import { GetSavedBusinessesUseCase } from '../../application/use-cases/get-saved-businesses.use-case.js';
import { GetSavedListingsUseCase } from '../../application/use-cases/get-saved-listings.use-case.js';

@ApiTags('Saves')
@Controller()
export class SavesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly saveBusiness: SaveBusinessUseCase,
    private readonly unsaveBusiness: UnsaveBusinessUseCase,
    private readonly saveListing: SaveListingUseCase,
    private readonly unsaveListing: UnsaveListingUseCase,
    private readonly getSavedBusinesses: GetSavedBusinessesUseCase,
    private readonly getSavedListings: GetSavedListingsUseCase,
  ) {}

  private async resolveUser(accountId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { accountId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User profile not found.');
    return user.id;
  }

  @Post('business-profiles/:id/save')
  @HttpCode(HttpStatus.OK)
  async saveBusinessAction(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string) {
    const userId = await this.resolveUser(identity.accountId);
    await this.saveBusiness.execute(userId, id);
    return { success: true };
  }

  @Delete('business-profiles/:id/save')
  @HttpCode(HttpStatus.OK)
  async unsaveBusinessAction(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
  ) {
    const userId = await this.resolveUser(identity.accountId);
    await this.unsaveBusiness.execute(userId, id);
    return { success: true };
  }

  @Post('listings/:id/save')
  @HttpCode(HttpStatus.OK)
  async saveListingAction(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string) {
    const userId = await this.resolveUser(identity.accountId);
    await this.saveListing.execute(userId, id);
    return { success: true };
  }

  @Delete('listings/:id/save')
  @HttpCode(HttpStatus.OK)
  async unsaveListingAction(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string) {
    const userId = await this.resolveUser(identity.accountId);
    await this.unsaveListing.execute(userId, id);
    return { success: true };
  }

  @Get('users/me/saved-businesses')
  async listSavedBusinesses(
    @CurrentIdentity() identity: RequestIdentity,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = await this.resolveUser(identity.accountId);
    const pageNum = parseInt(page ?? '1', 10);
    const limitNum = parseInt(limit ?? '20', 10);
    return this.getSavedBusinesses.execute(
      userId,
      isNaN(pageNum) ? 1 : pageNum,
      isNaN(limitNum) ? 20 : limitNum,
    );
  }

  @Get('users/me/saved-listings')
  async listSavedListings(
    @CurrentIdentity() identity: RequestIdentity,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = await this.resolveUser(identity.accountId);
    const pageNum = parseInt(page ?? '1', 10);
    const limitNum = parseInt(limit ?? '20', 10);
    return this.getSavedListings.execute(
      userId,
      isNaN(pageNum) ? 1 : pageNum,
      isNaN(limitNum) ? 20 : limitNum,
    );
  }
}
