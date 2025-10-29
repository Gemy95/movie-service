import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { MovieRepository } from '@App/modules/movie/repositories/movie.repository';
import { CreateMovieDto } from '@App/modules/movie/dto/create-movie.dto';
import { FindAllMoviesDto } from '@App/modules/movie/dto/find-all-movie.dto';
import { AddToWatchMovieDto } from '@App/modules/movie/dto/add-to-watch-movie.dto';
import { AddToFavoriteMovieDto } from '@App/modules/movie/dto/add-to-favorite-movie.dto';
import { RateMovieDto } from '@App/modules/movie/dto/rate-movie.dto';
import { Genre, genresObj } from '@App/modules/movie/constants/movie.enum.constants';
import { MovieApiService } from '@App/modules/movie/api/movie.api.service';

const mockMovie = {
  id: '1',
  title: 'Test Movie',
  overview: 'Test overview',
  popularity: 100,
  vote_average: 8.5,
  vote_count: 1000,
};

const mockMoviesList = {
  results: [mockMovie],
  page: 1,
  total_pages: 1,
  total_results: 1,
};

const mockGenresResponse = {
  genres: [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
  ],
};

const mockMovieRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  upsertMany: jest.fn(),
};

const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
};

const mockCacheManager = {
  set: jest.fn(),
  get: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config = {
      'services.movie.url': 'https://api.themoviedb.org',
      'services.movie.apiKey': 'test-api-key',
      'services.movie.accessTokenV3': 'test-token-v3',
      'services.movie.sessionId': 'test-session-id',
      'services.movie.accountId': '22414830',
    };
    return config[key];
  }),
};

describe('MovieService', () => {
  let service: MovieApiService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let httpService: HttpService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let movieRepository: MovieRepository;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let cacheManager: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieApiService,
        { provide: MovieRepository, useValue: mockMovieRepository },
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<MovieApiService>(MovieApiService);
    httpService = module.get<HttpService>(HttpService);
    movieRepository = module.get<MovieRepository>(MovieRepository);
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return movies with search query', async () => {
      const query: FindAllMoviesDto = { search: 'test', page: 1 };
      const mockResponse: AxiosResponse = {
        data: mockMoviesList,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));
      mockMovieRepository.upsertMany.mockResolvedValue(undefined);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.findAll(query);

      expect(result).toEqual(mockMoviesList);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/search/movie?api_key=test-api-key&query=test&page=1',
        { headers: { accept: 'application/json' } }
      );
      expect(mockMovieRepository.upsertMany).toHaveBeenCalledWith(mockMoviesList.results);
      expect(mockCacheManager.set).toHaveBeenCalledTimes(mockMoviesList.results.length);
    });

    it('should return movies with genres filter', async () => {
      const query: FindAllMoviesDto = { withGenres: [Genre.Action, Genre.Dokumentarfilm] };
      const mockResponse: AxiosResponse = {
        data: mockMoviesList,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));
      mockMovieRepository.upsertMany.mockResolvedValue(undefined);
      mockCacheManager.set.mockResolvedValue(undefined);

      await service.findAll(query);

      const expectedGenresIds = `${genresObj.Action},${genresObj.Dokumentarfilm},`;
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `https://api.themoviedb.org/3/discover/movie?api_key=test-api-key&with_genres=${expectedGenresIds}`,
        { headers: { accept: 'application/json' } }
      );
    });

    it('should handle empty results array', async () => {
      const query: FindAllMoviesDto = {};
      const mockResponse: AxiosResponse = {
        data: { results: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));
      mockMovieRepository.upsertMany.mockResolvedValue(undefined);

      const result = await service.findAll(query);

      expect(result.results).toEqual([]);
      expect(mockMovieRepository.upsertMany).not.toHaveBeenCalled();
      expect(mockCacheManager.set).not.toHaveBeenCalled();
    });

    it('should handle AxiosError with response', async () => {
      const query: FindAllMoviesDto = {};
      const axiosError = {
        name: 'AxiosError',
        message: 'Request failed',
        response: {
          status: 404,
          data: { status_message: 'Not found' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockHttpService.get.mockReturnValue(throwError(() => axiosError));

      await expect(service.findAll(query)).rejects.toThrow(BadRequestException);
      await expect(service.findAll(query)).rejects.toMatchObject({
        response: {
          statusCode: 400,
          message: 'Request failed',
        },
      });
    });

    it('should handle AxiosError without response', async () => {
      const query: FindAllMoviesDto = {};
      const axiosError = {
        name: 'AxiosError',
        message: 'Network error',
        isAxiosError: true,
      } as AxiosError;

      mockHttpService.get.mockReturnValue(throwError(() => axiosError));

      await expect(service.findAll(query)).rejects.toThrow(BadRequestException);
      await expect(service.findAll(query)).rejects.toMatchObject({
        response: {
          statusCode: 400,
          message: 'Network error',
        },
      });
    });

    it('should handle generic error', async () => {
      const query: FindAllMoviesDto = {};
      const genericError = new Error('Generic error');

      mockHttpService.get.mockReturnValue(throwError(() => genericError));

      await expect(service.findAll(query)).rejects.toThrow(BadRequestException);
      await expect(service.findAll(query)).rejects.toMatchObject({
        response: {
          message: 'Generic error',
        },
      });
    });
  });

  describe('create', () => {
    it('should return existing movie if found', async () => {
      const dto: CreateMovieDto = {
        media_id: 1,
        backdrop_path: '',
        genre_ids: [],
        original_language: '',
        original_title: '',
        overview: '',
        popularity: 0,
        poster_path: '',
        release_date: '',
        title: '',
        video: false,
        vote_average: 0,
        vote_count: 0,
      };

      mockMovieRepository.findOne.mockResolvedValue(mockMovie);

      const result = await service.create(dto);

      expect(result).toEqual(mockMovie);
      expect(mockMovieRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.media_id },
      });
      expect(mockHttpService.post).not.toHaveBeenCalled();
    });

    it('should create new movie if not found', async () => {
      const dto: CreateMovieDto = {
        media_id: 1,
        backdrop_path: '',
        genre_ids: [],
        original_language: '',
        original_title: '',
        overview: '',
        popularity: 0,
        poster_path: '',
        release_date: '',
        title: '',
        video: false,
        vote_average: 0,
        vote_count: 0,
      };
      const mockResponse: AxiosResponse = {
        data: mockMovie,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      mockMovieRepository.findOne.mockResolvedValue(null);
      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockMovieRepository.create.mockResolvedValue(mockMovie);

      const result = await service.create(dto);

      expect(result).toEqual(mockMovie);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/list/120174/add_item?api_key=test-api-key&session_id=test-session-id',
        { media_id: dto.media_id },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: 'Bearer test-token-v3',
          },
        }
      );
      expect(mockMovieRepository.create).toHaveBeenCalledWith(mockMovie);
    });

    it('should handle AxiosError in create with response', async () => {
      const dto: CreateMovieDto = {
        media_id: 1,
        backdrop_path: '',
        genre_ids: [],
        original_language: '',
        original_title: '',
        overview: '',
        popularity: 0,
        poster_path: '',
        release_date: '',
        title: '',
        video: false,
        vote_average: 0,
        vote_count: 0,
      };
      const axiosError = {
        name: 'AxiosError',
        message: 'Create failed',
        response: {
          status: 400,
          data: { status_message: 'Bad request' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockMovieRepository.findOne.mockResolvedValue(null);
      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should handle AxiosError in create without response', async () => {
      const dto: CreateMovieDto = {
        media_id: 1,
        backdrop_path: '',
        genre_ids: [],
        original_language: '',
        original_title: '',
        overview: '',
        popularity: 0,
        poster_path: '',
        release_date: '',
        title: '',
        video: false,
        vote_average: 0,
        vote_count: 0,
      };
      const axiosError = {
        name: 'AxiosError',
        message: 'Network error',
        isAxiosError: true,
      } as AxiosError;

      mockMovieRepository.findOne.mockResolvedValue(null);
      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should handle generic error in create', async () => {
      const dto: CreateMovieDto = {
        media_id: 1,
        backdrop_path: '',
        genre_ids: [],
        original_language: '',
        original_title: '',
        overview: '',
        popularity: 0,
        poster_path: '',
        release_date: '',
        title: '',
        video: false,
        vote_average: 0,
        vote_count: 0,
      };
      const genericError = new Error('Generic create error');

      mockMovieRepository.findOne.mockResolvedValue(null);
      mockHttpService.post.mockReturnValue(throwError(() => genericError));

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return existing movie from repository', async () => {
      mockMovieRepository.findOne.mockResolvedValue(mockMovie);

      const result = await service.findOne('1');

      expect(result).toEqual(mockMovie);
      expect(mockHttpService.get).not.toHaveBeenCalled();
    });

    it('should fetch from API and create if not found in repository', async () => {
      const mockResponse: AxiosResponse = {
        data: mockMovie,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      mockMovieRepository.findOne.mockResolvedValue(null);
      mockHttpService.get.mockReturnValue(of(mockResponse));
      mockMovieRepository.create.mockResolvedValue(mockMovie);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.findOne('1');

      expect(result).toEqual(mockMovie);
      expect(mockHttpService.get).toHaveBeenCalledWith('https://api.themoviedb.org/3/movie/1?api_key=test-api-key', {
        headers: { accept: 'application/json' },
      });
      expect(mockMovieRepository.create).toHaveBeenCalledWith(mockMovie);
      expect(mockCacheManager.set).toHaveBeenCalledWith(`movie:${mockMovie.id}`, mockMovie);
    });

    it('should handle AxiosError in findOne with response', async () => {
      const axiosError = {
        name: 'AxiosError',
        message: 'Not found',
        response: {
          status: 404,
          data: { status_message: 'Movie not found' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockMovieRepository.findOne.mockResolvedValue(null);
      mockHttpService.get.mockReturnValue(throwError(() => axiosError));

      await expect(service.findOne('1')).rejects.toThrow(BadRequestException);
    });

    it('should handle AxiosError in findOne without response', async () => {
      const axiosError = {
        name: 'AxiosError',
        message: 'Network error',
        isAxiosError: true,
      } as AxiosError;

      mockMovieRepository.findOne.mockResolvedValue(null);
      mockHttpService.get.mockReturnValue(throwError(() => axiosError));

      await expect(service.findOne('1')).rejects.toThrow(BadRequestException);
    });

    it('should handle generic error in findOne', async () => {
      const genericError = new Error('Generic find error');

      mockMovieRepository.findOne.mockResolvedValue(null);
      mockHttpService.get.mockReturnValue(throwError(() => genericError));

      await expect(service.findOne('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('addToWatch', () => {
    it('should successfully add movie to watchlist', async () => {
      const dto: AddToWatchMovieDto = { media_id: 1 };
      const mockResponse: AxiosResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.addToWatch(dto);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/account/22414830/watchlist?api_key=test-api-key',
        {
          media_type: 'movie',
          media_id: dto.media_id,
          watchlist: true,
        },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: 'Bearer test-token-v3',
          },
        }
      );
    });

    it('should handle AxiosError in addToWatch with response', async () => {
      const dto: AddToWatchMovieDto = { media_id: 1 };
      const axiosError = {
        name: 'AxiosError',
        message: 'Failed to add',
        response: {
          status: 400,
          data: { status_message: 'Invalid request' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.addToWatch(dto)).rejects.toThrow(BadRequestException);
    });

    it('should handle AxiosError in addToWatch without response', async () => {
      const dto: AddToWatchMovieDto = { media_id: 1 };
      const axiosError = {
        name: 'AxiosError',
        message: 'Network error',
        isAxiosError: true,
      } as AxiosError;

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.addToWatch(dto)).rejects.toThrow(BadRequestException);
    });

    it('should handle generic error in addToWatch', async () => {
      const dto: AddToWatchMovieDto = { media_id: 1 };
      const genericError = new Error('Generic watch error');

      mockHttpService.post.mockReturnValue(throwError(() => genericError));

      await expect(service.addToWatch(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('addToFavorite', () => {
    it('should successfully add movie to favorites', async () => {
      const dto: AddToFavoriteMovieDto = { media_id: 1 };
      const mockResponse: AxiosResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.addToFavorite(dto);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/account/22414830/favorite?api_key=test-api-key',
        {
          media_type: 'movie',
          media_id: dto.media_id,
          favorite: true,
        },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: 'Bearer test-token-v3',
          },
        }
      );
    });

    it('should handle AxiosError in addToFavorite with response', async () => {
      const dto: AddToFavoriteMovieDto = { media_id: 1 };
      const axiosError = {
        name: 'AxiosError',
        message: 'Failed to add',
        response: {
          status: 400,
          data: { status_message: 'Invalid request' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.addToFavorite(dto)).rejects.toThrow(BadRequestException);
    });

    it('should handle AxiosError in addToFavorite without response', async () => {
      const dto: AddToFavoriteMovieDto = { media_id: 1 };
      const axiosError = {
        name: 'AxiosError',
        message: 'Network error',
        isAxiosError: true,
      } as AxiosError;

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.addToFavorite(dto)).rejects.toThrow(BadRequestException);
    });

    it('should handle generic error in addToFavorite', async () => {
      const dto: AddToFavoriteMovieDto = { media_id: 1 };
      const genericError = new Error('Generic favorite error');

      mockHttpService.post.mockReturnValue(throwError(() => genericError));

      await expect(service.addToFavorite(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('makeRate', () => {
    it('should successfully rate a movie', async () => {
      const dto: RateMovieDto = { movie_id: 1, value: 8.5 };
      const mockResponse: AxiosResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.makeRate(dto);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/movie/1/rating?api_key=test-api-key',
        {
          value: dto.value,
        },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: 'Bearer test-token-v3',
          },
        }
      );
    });

    it('should handle AxiosError in makeRate with response', async () => {
      const dto: RateMovieDto = { movie_id: 1, value: 8.5 };
      const axiosError = {
        name: 'AxiosError',
        message: 'Failed to rate',
        response: {
          status: 400,
          data: { status_message: 'Invalid rating' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.makeRate(dto)).rejects.toThrow(BadRequestException);
    });

    it('should handle AxiosError in makeRate without response', async () => {
      const dto: RateMovieDto = { movie_id: 1, value: 8.5 };
      const axiosError = {
        name: 'AxiosError',
        message: 'Network error',
        isAxiosError: true,
      } as AxiosError;

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.makeRate(dto)).rejects.toThrow(BadRequestException);
    });

    it('should handle generic error in makeRate', async () => {
      const dto: RateMovieDto = { movie_id: 1, value: 8.5 };
      const genericError = new Error('Generic rate error');

      mockHttpService.post.mockReturnValue(throwError(() => genericError));

      await expect(service.makeRate(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findGenres', () => {
    it('should return genres list', async () => {
      const mockResponse: AxiosResponse = {
        data: mockGenresResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.findGenres();

      expect(result).toEqual(mockGenresResponse);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/genre/movie/list?language=en?api_key=test-api-key',
        { headers: { accept: 'application/json' } }
      );
    });

    it('should handle AxiosError in findGenres with response', async () => {
      const axiosError = {
        name: 'AxiosError',
        message: 'Failed to fetch genres',
        response: {
          status: 400,
          data: { status_message: 'Invalid request' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockHttpService.get.mockReturnValue(throwError(() => axiosError));

      await expect(service.findGenres()).rejects.toThrow(BadRequestException);
    });

    it('should handle AxiosError in findGenres without response', async () => {
      const axiosError = {
        name: 'AxiosError',
        message: 'Network error',
        isAxiosError: true,
      } as AxiosError;

      mockHttpService.get.mockReturnValue(throwError(() => axiosError));

      await expect(service.findGenres()).rejects.toThrow(BadRequestException);
    });

    it('should handle generic error in findGenres', async () => {
      const genericError = new Error('Generic genres error');

      mockHttpService.get.mockReturnValue(throwError(() => genericError));

      await expect(service.findGenres()).rejects.toThrow(BadRequestException);
    });
  });
});
