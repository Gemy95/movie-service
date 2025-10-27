import { ApiKeyStrategy } from '@App/modules/auth/api.key.strategy';
import { AuthMiddleware } from '@App/modules/auth/auth.middleware';
import { AuthService } from '@App/modules/auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule, ConfigModule, HttpModule],
  providers: [AuthService, ApiKeyStrategy, AuthMiddleware],
  exports: [AuthService, ApiKeyStrategy, AuthMiddleware],
})
export class AuthModule {}
