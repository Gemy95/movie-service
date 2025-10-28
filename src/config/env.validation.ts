import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

export enum Environment {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

class EnvironmentVariables {
  @IsNotEmpty()
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNotEmpty()
  @IsNumber()
  SERVER_PORT: number;

  @IsNotEmpty()
  @IsString()
  MONGO_HOST: string;

  @IsNotEmpty()
  @IsString()
  MONGO_PORT: string;

  @IsOptional()
  @IsString()
  MONGO_USERNAME: string;

  @IsOptional()
  @IsString()
  MONGO_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  MONGO_DATABASE: string;

  @IsNotEmpty()
  @IsString()
  MONGO_DATABASE_AUTH: string;

  @IsNotEmpty()
  @IsString()
  MONGO_DNS_SERVE: string;

  @IsNotEmpty()
  @IsString()
  REDIS_HOST: string;

  @IsNotEmpty()
  @IsString()
  REDIS_PORT: string;

  @IsOptional()
  @IsString()
  REDIS_USERNAME?: string;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsNotEmpty()
  @IsString()
  MOVIE_BASE_URL: string;

  @IsNotEmpty()
  @IsString()
  MOVIE_API_KEY: string;

  @IsNotEmpty()
  @IsString()
  MOVIE_ACCESS_TOKEN_V3: string;

  @IsNotEmpty()
  @IsString()
  MOVIE_SESSION_ID: string;

  @IsNotEmpty()
  @IsString()
  MOVIE_ACCOUNT_ID: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
