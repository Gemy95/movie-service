import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { MovieRepository } from '@App/modules/movie/repositories/movie.repository';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  IFindAllMovies,
  IMovie,
} from '@App/modules/movie/interfaces/movie.interface';
import { CreateMovieDto } from '@App/modules/movie/dto/create-movie.dto';
import { FindAllMoviesDto } from '@App/modules/movie/dto/find-all-movie.dto';
import { genresObj } from '@App/modules/movie/constants/movie.enum.constants';
import { AddToWatchMovieDto } from '@App/modules/movie/dto/add-to-watch-movie.dto';
import { RateMovieDto } from '@App/modules/movie/dto/rate-movie.dto';
import { AddToFavoriteMovieDto } from '@App/modules/movie/dto/add-to-favorite-movie.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

const sessionId = '8b4ebc30e303562c47a9e2a4d10c3976';
const listId = 120174;
const accountId = '22414830';
const accessTokenV3 =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmYTA1ZDg3NTJlNTFkMDI0MGNhMzRjNTNiYzhlMjE5NCIsIm5iZiI6MTc2MTQ4Mzk4NC41NTQsInN1YiI6IjY4ZmUxY2QwZTk0ZDNjYTUwOWZiNmUyZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-fztVO1jeHAW2l3m1OsIwAnLtJHKKbABWEUfp5Ed7EQ';
// const accessTokenV4 =
//   'eyJhbGciOiJIUzI1NiIsInR5cCIdIkpXVCJ9.eyJuYmYiOjE0ODM1NzM4MzUsInZlcnNpb24iOjEsInN1YiI6IjRiYzg4OTJhMDE3YTNjMGY5MjAwMDAwMiIsImF1ZCI6IlNmODc4NTdiZTIwOWQzNTE5ODMzYjMwMGExM2QwZTEyIiwic2NvcGVzIjpbImFwaV9yZWFkIiwiYXBpX3dyaXRlIl0sImp0aSI6Ijg4In0.b76OiEs10gdp9oNOoGpBJ94nO9Zi17Y7SvAXJQW8nH2';

@Injectable()
export class MovieService {
  private readonly baseUrl;
  private readonly apiKey;

  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.baseUrl = this.configService.get<string>('services.movie.url');
    this.apiKey = this.configService.get<string>('services.movie.apiKey');
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
          ? withGenres?.reduce(
              (accumulator, currentValue) =>
                accumulator + genresObj[currentValue] + ',',
              '',
            )
          : withGenres;
        apiUrl += `&with_genres=${genresIds}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(apiUrl, {
          headers: {
            accept: 'application/json',
          },
        }),
      );

      const results =
        response?.data?.results && Array.isArray(response.data?.results)
          ? response.data.results
          : [];

      if (Array.isArray(results) && results?.length) {
        await this.movieRepository.upsertMany(results);
        await Promise.all(
          results.map(async (movie) => {
            this.cacheManager.set(`movie:${movie.id}`, { ...movie });
          }),
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message ||
          error.message ||
          'Failed to fetch movies details from TMDB.';

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

  async create(dto: CreateMovieDto): Promise<IMovie> {
    try {
      const existing = await this.movieRepository.findOne({
        where: { id: dto.media_id },
      });
      if (existing) return existing;

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/3/list/${listId}/add_item?api_key=${this.apiKey}&session_id=${sessionId}`,
          { media_id: dto.media_id },
          {
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              Authorization: `Bearer ${accessTokenV3}`,
            },
          },
        ),
      );

      const movie = response.data;

      const created = await this.movieRepository.create({ ...movie });

      return created;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message ||
          error.message ||
          'Failed to fetch movie details from TMDB.';

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

  async findOne(id: string): Promise<IMovie> {
    try {
      const existing = await this.movieRepository.findOne({
        where: { id },
      });
      if (existing) return existing;

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/3/movie/${id}?api_key=${this.apiKey}`,
          {
            headers: {
              accept: 'application/json',
            },
          },
        ),
      );

      const movie = response.data;

      const created = await this.movieRepository.create({
        ...movie,
      });

      await this.cacheManager.set(`movie:${movie.id}`, { ...movie });

      return created;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message ||
          error.message ||
          'Failed to fetch movie details from TMDB.';

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

  async addToWatch(dto: AddToWatchMovieDto): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/3/account/${accountId}/watchlist?api_key=${this.apiKey}`,
          {
            media_type: 'movie',
            media_id: dto.media_id,
            watchlist: true,
          },
          {
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              Authorization: `Bearer ${accessTokenV3}`,
            },
          },
        ),
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message ||
          error.message ||
          'Failed to movie add to watch TMDB.';

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

  async addToFavorite(dto: AddToFavoriteMovieDto): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/3/account/${accountId}/favorite?api_key=${this.apiKey}`,
          {
            media_type: 'movie',
            media_id: dto.media_id,
            favorite: true,
          },
          {
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              Authorization: `Bearer ${accessTokenV3}`,
            },
          },
        ),
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message ||
          error.message ||
          'Failed to movie add to favorite TMDB.';

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
              Authorization: `Bearer ${accessTokenV3}`,
            },
          },
        ),
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message ||
          error.message ||
          'Failed to movie add to watch TMDB.';

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

  async findGenres() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/3/genre/movie/list?language=en?api_key=${this.apiKey}`,
          {
            headers: {
              accept: 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status || 400;
        const message =
          error.response?.data?.status_message ||
          error.message ||
          'Failed to fetch genre details from TMDB.';

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
