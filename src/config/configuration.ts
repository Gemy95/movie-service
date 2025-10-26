const DEFAULT_SERVER_PORT = 5000;

export interface Configuration {
  app: AppSetting;
  services: Services;
}

export interface AppSetting {
  env: string;
  port: number;
}

export interface Movie {
  url: string;
  apiKey: string;
}
export interface Services {
  movie: Movie;
}

export const configuration = (): Configuration => {
  const defaultConfiguration: Configuration = {
    app: {
      env: process.env.NODE_ENV,
      port: parseInt(process.env.SERVER_PORT, 10) || DEFAULT_SERVER_PORT,
    },
    services: {
      movie: {
        url: process.env.MOVIE_BASE_URL,
        apiKey: process.env.MOVIE_API_KEY,
      },
    },
  };
  return defaultConfiguration;
};
