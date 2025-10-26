import { AppController } from '@App/app.controller';
import { AppService } from '@App/app.service';
import { configuration } from '@App/config/configuration';
import { validate } from '@App/config/env.validation';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
