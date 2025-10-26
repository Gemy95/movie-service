import { BadRequestException, Injectable } from '@nestjs/common';
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

@Injectable()
export class MovieService {
  private readonly baseUrl;
  private readonly apiKey;

  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>('services.movie.url');
    this.apiKey = this.configService.get<string>('services.movie.apiKey');
  }

  async findAll(query: FindAllMoviesDto): Promise<IFindAllMovies> {
    try {
      let apiUrl = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}`;
      if (query?.search) {
        apiUrl = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${query.search}`;
      }
      if (query?.page) {
        apiUrl += `&page=${query.page}`;
      }
      if (query?.withGenres) {
        const genresIds = Array.isArray(query?.withGenres)
          ? query?.withGenres?.reduce(
              (accumulator, currentValue) =>
                accumulator + genresObj[currentValue] + ',',
              '',
            )
          : query?.withGenres;
        apiUrl += `&with_genres=${genresIds}`;
      }
      const response = await firstValueFrom(
        this.httpService.get(apiUrl, {
          headers: {
            accept: 'application/json',
          },
        }),
      );

      if (
        Array.isArray(response?.data?.results) &&
        response?.data?.results?.length
      ) {
        await this.movieRepository.upsertMany(response.data?.results);
      }

      return response.data;
    } catch (error) {
      console.log(error);
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

  async create(dto: CreateMovieDto): Promise<IMovie> {
    try {
      const existing = await this.movieRepository.findOne({
        where: { id: dto.id },
      });
      if (existing) return existing;

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/list/${dto.id}/add_item?api_key=${this.apiKey}&session_id=111`,
          dto,
          {
            headers: {
              accept: 'application/json',
            },
          },
        ),
      );

      const movie = response.data;

      const created = await this.movieRepository.create({ ...movie });

      return created;
    } catch (error) {
      console.log(error);
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
          `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}`,
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

      return created;
    } catch (error) {
      console.log(error);
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

  async findGenres() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/genre/movie/list?language=en?api_key=${this.apiKey}`,
          {
            headers: {
              accept: 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      console.log(error);
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

  async addToWatch(dto: AddToWatchMovieDto): Promise<void> {
    try {
      const accountId = '22414830';
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/account/${accountId}/watchlist?api_key=${this.apiKey}`,
          {
            media_type: 'movie',
            media_id: dto.id,
            watchlist: true,
          },
          {
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              Authorization:
                'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmYTA1ZDg3NTJlNTFkMDI0MGNhMzRjNTNiYzhlMjE5NCIsIm5iZiI6MTc2MTQ4Mzk4NC41NTQsInN1YiI6IjY4ZmUxY2QwZTk0ZDNjYTUwOWZiNmUyZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-fztVO1jeHAW2l3m1OsIwAnLtJHKKbABWEUfp5Ed7EQ',
            },
          },
        ),
      );
    } catch (error) {
      console.log(error);
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
}
