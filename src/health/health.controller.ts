import { Controller, Get } from '@nestjs/common';
import { Public } from '@odysseon/whoami-adapter-nestjs';

@Public()
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
