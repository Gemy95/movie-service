import { AppController } from '@App/app.controller';
import { AppService } from '@App/app.service';
import { configuration } from '@App/config/configuration';
import { validate } from '@App/config/env.validation';
import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUsername = configService.get<string>('REDIS_USERNAME');
        const redisPassword = configService.get<string>('REDIS_PASSWORD');
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPort = configService.get<number>('REDIS_PORT');

        const redisUrl = `redis://${redisUsername}:${redisPassword}@${redisHost}:${redisPort}`;
        const safeRedisUrl = `redis://${redisUsername}:****@${redisHost}:${redisPort}`;
        Logger.log(`CacheModule Using Redis URL: ${safeRedisUrl}`);

        return {
          stores: [
            new Keyv({
              store: new CacheableMemory(),
            }),
            createKeyv(redisUrl),
          ],
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
