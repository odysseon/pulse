import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import {
  JoseReceiptVerifier,
} from '@odysseon/whoami-adapter-jose';
import { joseConfig } from '../../../../auth/password.config.js';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly verifier: JoseReceiptVerifier;
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.getOrThrow<string>('RECEIPT_SECRET');
    this.verifier = new JoseReceiptVerifier({ ...joseConfig, secret });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();

    const rawToken: string | undefined =
      client.handshake.auth?.['token'] ?? client.handshake.headers?.authorization;

    if (!rawToken) {
      throw new WsException('Missing authentication token.');
    }

    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;

    try {
      const identity = await this.verifier.verify(token);
      // Attach resolved identity for downstream handlers
      client.data.identity = identity;
      return true;
    } catch (err) {
      this.logger.warn('WebSocket auth failed', err);
      throw new WsException('Invalid or expired token.');
    }
  }
}
