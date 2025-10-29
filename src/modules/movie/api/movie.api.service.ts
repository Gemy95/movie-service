import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { MovieRepository } from '@App/modules/movie/repositories/movie.repository';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { IFindAllMovies, IMovie } from '@App/modules/movie/interfaces/movie.interface';
import { CreateMovieDto } from '@App/modules/movie/dto/create-movie.dto';
import { FindAllMoviesDto } from '@App/modules/movie/dto/find-all-movie.dto';
import { genresObj } from '@App/modules/movie/constants/movie.enum.constants';
import { AddToWatchMovieDto } from '@App/modules/movie/dto/add-to-watch-movie.dto';
import { RateMovieDto } from '@App/modules/movie/dto/rate-movie.dto';
import { AddToFavoriteMovieDto } from '@App/modules/movie/dto/add-to-favorite-movie.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FindAllFavoriteMoviesDto } from '@App/modules/movie/dto/find-all-favorite-movie.dto';
import { FindAllWatchMoviesDto } from '@App/modules/movie/dto/find-all-watch-movie.dto';

@Injectable()
export class MovieApiService {
  private readonly baseUrl;
  private readonly apiKey;
  private readonly accessTokenV3;
  private readonly sessionId;
  private readonly accountId;

  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    this.baseUrl = this.configService.get<string>('services.movie.url');
    this.apiKey = this.configService.get<string>('services.movie.apiKey');
    this.accessTokenV3 = this.configService.get<string>('services.movie.accessTokenV3');
    this.sessionId = this.configService.get<string>('services.movie.sessionId');
    this.accountId = this.configService.get<string>('services.movie.accountId');
  }

  async findAll(query: FindAllMoviesDto): Promise<IFindAllMovies> {
    try {
      const { search, page, withGenres } = query || {};

      let apiUrl = search
        ? `${this.baseUrl}/3/search/movie?api_key=${this.apiKey}&query=${search}`
        : `${this.baseUrl}/3/discover/movie?api_key=${this.apiKey}`;

      if (page) {
        apiUrl += `&page=${page}`;
      }
      if (withGenres) {
        const genresIds = Array.isArray(withGenres)
          ? withGenres?.reduce((accumulator, currentValue) => accumulator + genresObj[currentValue] + ',', '')
          : withGenres;
        apiUrl += `&with_genres=${genresIds}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(apiUrl, {
          headers: {
            accept: 'application/json',
          },
        })
      );

      const results = response?.data?.results && Array.isArray(response.data?.results) ? response.data.results : [];

      if (Array.isArray(results) && results?.length) {
        await this.movieRepository.upsertMany(results);
        await Promise.all(
          results.map(async (movie) => {
            this.cacheManager.set(`movie:${movie.id}`, { ...movie });
          })
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message || error.message || 'Failed to fetch movies details from TMDB.';

        throw new BadRequestException({
          statusCode,
          message,
        });
      }

      throw new BadRequestException(error?.message || 'An unexpected error occurred.');
    }
  }

  async findAllFavorite(query: FindAllFavoriteMoviesDto): Promise<IFindAllMovies> {
    try {
      const { page } = query || {};

      const apiUrl = `${this.baseUrl}/3/account/${this.accountId}/favorite/movies?page=${page}`;

      const response = await firstValueFrom(
        this.httpService.get(apiUrl, {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: `Bearer ${this.accessTokenV3}`,
          },
        })
      );

      const results = response?.data?.results && Array.isArray(response.data?.results) ? response.data.results : [];

      if (Array.isArray(results) && results?.length) {
        await this.movieRepository.upsertMany(results);
        await Promise.all(
          results.map(async (movie) => {
            this.cacheManager.set(`movie:${movie.id}`, { ...movie });
          })
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message || error.message || 'Failed to fetch favorite movies details from TMDB.';

        throw new BadRequestException({
          statusCode,
          message,
        });
      }

      throw new BadRequestException(error?.message || 'An unexpected error occurred.');
    }
  }

  async findAllWatch(query: FindAllWatchMoviesDto): Promise<IFindAllMovies> {
    try {
      const { page } = query || {};

      const apiUrl = `${this.baseUrl}/3/account/${this.accountId}/watchlist/movies?page=${page}`;

      const response = await firstValueFrom(
        this.httpService.get(apiUrl, {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: `Bearer ${this.accessTokenV3}`,
          },
        })
      );

      const results = response?.data?.results && Array.isArray(response.data?.results) ? response.data.results : [];

      if (Array.isArray(results) && results?.length) {
        await this.movieRepository.upsertMany(results);
        await Promise.all(
          results.map(async (movie) => {
            this.cacheManager.set(`movie:${movie.id}`, { ...movie });
          })
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message || error.message || 'Failed to fetch favorite movies details from TMDB.';

        throw new BadRequestException({
          statusCode,
          message,
        });
      }

      throw new BadRequestException(error?.message || 'An unexpected error occurred.');
    }
  }

  async create(dto: CreateMovieDto): Promise<IMovie> {
    try {
      const existing = await this.movieRepository.findOne({
        where: { id: dto.media_id },
      });
      if (existing) return existing;

      const listId = 120174;

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/3/list/${listId}/add_item?api_key=${this.apiKey}&session_id=${this.sessionId}`,
          { media_id: dto.media_id },
          {
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              Authorization: `Bearer ${this.accessTokenV3}`,
            },
          }
        )
      );

      const movie = response.data;

      const created = await this.movieRepository.create({ ...movie });

      return created;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message || error.message || 'Failed to fetch movie details from TMDB.';

        throw new BadRequestException({
          statusCode,
          message,
        });
      }

      throw new BadRequestException(error?.message || 'An unexpected error occurred.');
    }
  }

  async findOne(id: string): Promise<IMovie> {
    try {
      const existing = await this.movieRepository.findOne({
        where: { id },
      });
      if (existing) return existing;

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/3/movie/${id}?api_key=${this.apiKey}`, {
          headers: {
            accept: 'application/json',
          },
        })
      );

      const movie = response.data;
      let created;
      if (movie) {
        created = await this.movieRepository.create({
          ...movie,
        });
        await this.cacheManager.set(`movie:${movie.id}`, { ...movie });
      }

      return created ? created : movie;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message || error.message || 'Failed to fetch movie details from TMDB.';

        throw new BadRequestException({
          statusCode,
          message,
        });
      }

      throw new BadRequestException(error?.message || 'An unexpected error occurred.');
    }
  }

  async addToWatch(dto: AddToWatchMovieDto): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/3/account/${this.accountId}/watchlist?api_key=${this.apiKey}`,
          {
            media_type: 'movie',
            media_id: dto.media_id,
            watchlist: true,
          },
          {
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              Authorization: `Bearer ${this.accessTokenV3}`,
            },
          }
        )
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message = error.response?.data?.status_message || error.message || 'Failed to movie add to watch TMDB.';

        throw new BadRequestException({
          statusCode,
          message,
        });
      }

      throw new BadRequestException(error?.message || 'An unexpected error occurred.');
    }
  }

  async addToFavorite(dto: AddToFavoriteMovieDto): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/3/account/${this.accountId}/favorite?api_key=${this.apiKey}`,
          {
            media_type: 'movie',
            media_id: dto.media_id,
            favorite: true,
          },
          {
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              Authorization: `Bearer ${this.accessTokenV3}`,
            },
          }
        )
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message || error.message || 'Failed to movie add to favorite TMDB.';

        throw new BadRequestException({
          statusCode,
          message,
        });
      }

      throw new BadRequestException(error?.message || 'An unexpected error occurred.');
    }
  }

  async makeRate(dto: RateMovieDto): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/3/movie/${dto.movie_id}/rating?api_key=${this.apiKey}`,
          {
            value: dto.value,
          },
          {
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              Authorization: `Bearer ${this.accessTokenV3}`,
            },
          }
        )
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message = error.response?.data?.status_message || error.message || 'Failed to movie add to watch TMDB.';

        throw new BadRequestException({
          statusCode,
          message,
        });
      }

      throw new BadRequestException(error?.message || 'An unexpected error occurred.');
    }
  }

  async findGenres() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/3/genre/movie/list?language=en?api_key=${this.apiKey}`, {
          headers: {
            accept: 'application/json',
          },
        })
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message || error.message || 'Failed to fetch genre details from TMDB.';

        throw new BadRequestException({
          statusCode,
          message,
        });
      }

      throw new BadRequestException(error?.message || 'An unexpected error occurred.');
    }
  }
}
