import { Test, TestingModule } from '@nestjs/testing';
import { MovieApiService } from '@App/modules/movie/api/movie.api.service';
import { CreateMovieDto } from '@App/modules/movie/dto/create-movie.dto';
import { FindAllMoviesDto } from '@App/modules/movie/dto/find-all-movie.dto';
import { AddToWatchMovieDto } from '@App/modules/movie/dto/add-to-watch-movie.dto';
import { AddToFavoriteMovieDto } from '@App/modules/movie/dto/add-to-favorite-movie.dto';
import { RateMovieDto } from '@App/modules/movie/dto/rate-movie.dto';
import { MovieApiController } from '@App/modules/movie/api/movie.api.controller';

describe('MovieApiController', () => {
  let controller: MovieApiController;
  let service: MovieApiService;

  const mockMovieService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    addToWatch: jest.fn(),
    addToFavorite: jest.fn(),
    makeRate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieApiController],
      providers: [
        {
          provide: MovieApiService,
          useValue: mockMovieService,
        },
      ],
    }).compile();

    controller = module.get<MovieApiController>(MovieApiController);
    service = module.get<MovieApiService>(MovieApiService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new movie and return formatted response', async () => {
      const dto: CreateMovieDto = {
        title: 'Inception',
        backdrop_path: '',
        genre_ids: [],
        media_id: 0,
        original_language: '',
        original_title: '',
        overview: '',
        popularity: 0,
        poster_path: '',
        release_date: '',
        video: false,
        vote_average: 0,
        vote_count: 0,
      };
      const mockMovie = { id: 1, title: 'Inception' };
      mockMovieService.create.mockResolvedValue(mockMovie);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        id: mockMovie.id,
        attributes: mockMovie,
      });
    });
  });

  describe('findOne', () => {
    it('should return a movie by id', async () => {
      const mockMovie = { id: 1, title: 'Inception' };
      mockMovieService.findOne.mockResolvedValue(mockMovie);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        id: mockMovie.id,
        attributes: mockMovie,
      });
    });
  });

  describe('findAll', () => {
    it('should return formatted movies list with pagination', async () => {
      const query: FindAllMoviesDto = {};
      const mockMovies = {
        results: [{ id: 1, title: 'Inception' }],
        page: 1,
        total_pages: 5,
        total_results: 10,
      };
      mockMovieService.findAll.mockResolvedValue(mockMovies);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: [
          {
            id: 1,
            attributes: { id: 1, title: 'Inception' },
          },
        ],
        pagination: {
          page: 1,
          pages: 5,
          count: 10,
        },
      });
    });
  });

  describe('addToWatch', () => {
    it('should call movieService.addToWatch', async () => {
      const dto: AddToWatchMovieDto = { media_id: 1 };
      mockMovieService.addToWatch.mockResolvedValue(undefined);

      await controller.addToWatch(dto);

      expect(service.addToWatch).toHaveBeenCalledWith(dto);
    });
  });

  describe('addToFavorite', () => {
    it('should call movieService.addToFavorite', async () => {
      const dto: AddToFavoriteMovieDto = { media_id: 1 };
      mockMovieService.addToFavorite.mockResolvedValue(undefined);

      await controller.addToFavorite(dto);

      expect(service.addToFavorite).toHaveBeenCalledWith(dto);
    });
  });

  describe('makeRate', () => {
    it('should call movieService.makeRate', async () => {
      const dto: RateMovieDto = { movie_id: 1, value: 9 };
      mockMovieService.makeRate.mockResolvedValue(undefined);

      await controller.makeRate(dto);

      expect(service.makeRate).toHaveBeenCalledWith(dto);
    });
  });
});
