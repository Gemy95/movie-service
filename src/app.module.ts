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
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@App/modules/auth/auth.module';
import { MovieModule } from '@App/modules/movie/movie.module';

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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('MONGO_HOST');
        const port = configService.get<string>('MONGO_PORT');
        const username = configService.get<string>('MONGO_USERNAME');
        const password = configService.get<string>('MONGO_PASSWORD');
        const database = configService.get<string>('MONGO_DATABASE');
        const authSource = configService.get<string>('MONGO_DATABASE_AUTH');
        const dsn = configService.get<string>('MONGO_DNS_SERVE');

        let credentials = '';
        if (username && password) {
          credentials = `${username}:${password}@`;
        }

        const uri = dsn.includes('mongodb+srv')
          ? `${dsn}${credentials}${host}/${database}?authSource=${authSource}`
          : `${dsn}${credentials}${host}:${port}/${database}?authSource=${authSource}`;

        return { uri };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    MovieModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
