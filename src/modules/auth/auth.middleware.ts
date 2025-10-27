import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { NextFunction } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly baseUrl;
  private readonly accessTokenV3;

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('services.movie.url');
    this.accessTokenV3 = this.configService.get<string>(
      'services.movie.accessTokenV3',
    );
  }
  async use(_req: Request, _res: Response, next: NextFunction) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/3/authentication`, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${this.accessTokenV3}`,
          },
        }),
      );

      if (!response?.data?.success) {
        throw new BadRequestException({
          message: 'Failed to authenticate status with TMDB.',
        });
      }
      next();
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message ||
          error.message ||
          'Failed to authentication TMDB.';

        throw new BadRequestException({
          statusCode,
          message,
        });
      }

      throw new BadRequestException(
        error?.message || 'An unexpected error occurred.',
      );
    }
  }
}
