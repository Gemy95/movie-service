const DEFAULT_SERVER_PORT = 5000;

export interface Configuration {
  app: AppSetting;
  mongoDatabase: MongoDatabase;
  redis: Redis;
  services: Services;
}

export interface AppSetting {
  env: string;
  port: number;
}

export interface Movie {
  url: string;
  apiKey: string;
  accessTokenV3: string;
  sessionId: string;
}
export interface Services {
  movie: Movie;
}

export interface MongoDatabase {
  host: string;
  port: string;
  databaseName: string;
  username: string;
  password: string;
  databaseAuth: string;
  dsn: string;
}

export interface Redis {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export const configuration = (): Configuration => {
  const defaultConfiguration: Configuration = {
    app: {
      env: process.env.NODE_ENV,
      port: parseInt(process.env.SERVER_PORT, 10) || DEFAULT_SERVER_PORT,
    },
    mongoDatabase: {
      host: process.env.MONGO_HOST,
      port: process.env.MONGO_PORT!,
      databaseName: process.env.MONGO_DATABASE,
      username: process.env.MONGO_USERNAME,
      password: process.env.MONGO_PASSWORD,
      databaseAuth: process.env.MONGO_DATABASE_AUTH,
      dsn: process.env.MONGO_DNS_SERVE,
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    },
    services: {
      movie: {
        url: process.env.MOVIE_BASE_URL,
        apiKey: process.env.MOVIE_API_KEY,
        accessTokenV3: process.env.MOVIE_ACCESS_TOKEN_V3,
        sessionId: process.env.MOVIE_SESSION_ID,
      },
    },
  };
  return defaultConfiguration;
};
