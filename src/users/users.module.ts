import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersController } from './delivery/http/users.controller.js';
import { UsersService } from './use-cases/users.service.js';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository.js';
import { USER_REPOSITORY_TOKEN } from './core/ports/user.repository.interface.js';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
