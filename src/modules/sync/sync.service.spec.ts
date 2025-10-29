import { Test, TestingModule } from '@nestjs/testing';
import { MovieApiService } from '@App/modules/movie/api/movie.api.service';
import { MovieRepository } from '@App/modules/movie/repositories/movie.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { IFindAllMovies } from '@App/modules/movie/interfaces/movie.interface';
import { SyncService } from '@App/modules/sync/sync.service';

const mockMoviesPage1: IFindAllMovies = {
  page: 1,
  total_pages: 2,
  total_results: 3,
  results: [
    {
      id: 1,
      title: 'Movie 1',
      overview: '',
      backdrop_path: '',
      genre_ids: [],
      original_language: '',
      original_title: '',
      popularity: 0,
      poster_path: '',
      release_date: '',
      video: false,
      vote_average: 0,
      vote_count: 0,
    },
    {
      id: 2,
      title: 'Movie 2',
      overview: '',
      backdrop_path: '',
      genre_ids: [],
      original_language: '',
      original_title: '',
      popularity: 0,
      poster_path: '',
      release_date: '',
      video: false,
      vote_average: 0,
      vote_count: 0,
    },
  ],
};

const mockMoviesPage2: IFindAllMovies = {
  page: 2,
  total_pages: 2,
  total_results: 3,
  results: [
    {
      id: 3,
      title: 'Movie 3',
      overview: '',
      backdrop_path: '',
      genre_ids: [],
      original_language: '',
      original_title: '',
      popularity: 0,
      poster_path: '',
      release_date: '',
      video: false,
      vote_average: 0,
      vote_count: 0,
    },
  ],
};

const mockEmptyPage: IFindAllMovies = {
  page: 3,
  total_pages: 2,
  results: [],
  total_results: 0,
};

describe('SyncService', () => {
  let service: SyncService;
  let movieApiService: jest.Mocked<MovieApiService>;
  let movieRepository: jest.Mocked<MovieRepository>;
  let cacheManager: { set: jest.Mock };

  beforeEach(async () => {
    const movieApiServiceMock = { findAll: jest.fn() };
    const movieRepositoryMock = { upsertMany: jest.fn() };
    const cacheManagerMock = { set: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      imports: [ScheduleModule.forRoot()],
      providers: [
        SyncService,
        { provide: MovieApiService, useValue: movieApiServiceMock },
        { provide: MovieRepository, useValue: movieRepositoryMock },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
    movieApiService = module.get(MovieApiService);
    movieRepository = module.get(MovieRepository);
    cacheManager = module.get(CACHE_MANAGER);

    jest.spyOn(service['logger'], 'log').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.clearAllMocks());

  describe('handleSyncMoviesCron', () => {
    it('should sync all pages successfully', async () => {
      movieApiService.findAll.mockResolvedValueOnce(mockMoviesPage1).mockResolvedValueOnce(mockMoviesPage2);
      movieRepository.upsertMany.mockResolvedValue(undefined);

      jest.spyOn(service, 'delay').mockResolvedValue(undefined);

      await service.handleSyncMoviesCron();

      expect(movieApiService.findAll).toHaveBeenCalledTimes(2);
      expect(movieRepository.upsertMany).toHaveBeenCalledTimes(2);
      expect(cacheManager.set).toHaveBeenCalledTimes(3);
      expect(service['logger'].log).toHaveBeenCalledWith('Movie synchronization completed successfully.');
    });

    it('should stop early if no results on a page', async () => {
      movieApiService.findAll.mockResolvedValueOnce(mockMoviesPage1).mockResolvedValueOnce(mockEmptyPage);
      movieRepository.upsertMany.mockResolvedValue(undefined);
      jest.spyOn(service, 'delay').mockResolvedValue(undefined);

      await service.handleSyncMoviesCron();

      expect(movieApiService.findAll).toHaveBeenCalledTimes(2);
      expect(movieRepository.upsertMany).toHaveBeenCalledTimes(1);
      expect(cacheManager.set).toHaveBeenCalledTimes(2);
      expect(service['logger'].warn).toHaveBeenCalledWith('No results found on page 2.');
    });

    it('should handle API error gracefully', async () => {
      const apiError = new Error('API is down');
      movieApiService.findAll.mockRejectedValueOnce(apiError);

      await service.handleSyncMoviesCron();

      expect(service['logger'].error).toHaveBeenCalledWith(`Movie synchronization failed: ${apiError.message}`);
    });

    it('should handle upsert error and log', async () => {
      movieApiService.findAll.mockResolvedValueOnce(mockMoviesPage1);
      movieRepository.upsertMany.mockRejectedValueOnce(new Error('DB write failed'));
      jest.spyOn(service, 'delay').mockResolvedValue(undefined);

      await service.handleSyncMoviesCron();

      expect(service['logger'].error).toHaveBeenCalledWith(expect.stringContaining('DB write failed'));
    });
  });

  describe('delay', () => {
    it('should delay for specified milliseconds', async () => {
      jest.useFakeTimers();
      let resolved = false;
      const p = service.delay(500).then(() => (resolved = true));
      expect(resolved).toBe(false);

      jest.advanceTimersByTime(500);
      await p;
      expect(resolved).toBe(true);
      jest.useRealTimers();
    });
  });

  describe('@Cron decorator', () => {
    it('should have handleSyncMoviesCron method', () => {
      expect(typeof service.handleSyncMoviesCron).toBe('function');
    });
  });
});
