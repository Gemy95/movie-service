import { AddToFavoriteMovieDto } from '@App/modules/movie/dto/add-to-favorite-movie.dto';
import { AddToWatchMovieDto } from '@App/modules/movie/dto/add-to-watch-movie.dto';
import { CreateMovieDto } from '@App/modules/movie/dto/create-movie.dto';
import { FindAllFavoriteMoviesDto } from '@App/modules/movie/dto/find-all-favorite-movie.dto';
import { FindAllMoviesDto } from '@App/modules/movie/dto/find-all-movie.dto';
import { FindAllWatchMoviesDto } from '@App/modules/movie/dto/find-all-watch-movie.dto';
import { RateMovieDto } from '@App/modules/movie/dto/rate-movie.dto';
import {
  IMovieResponse,
  IFindAllMoviesResponse,
  IFindOneMovieResponse,
  IMovie,
  IFindAllFavoriteMoviesResponse,
  IFindAllWatchMoviesResponse,
} from '@App/modules/movie/interfaces/movie.interface';
import { MovieApiService } from '@App/modules/movie/api/movie.api.service';
import { swaggerTags } from '@App/shared/constants/swagger.tags.constant';
import { Body, Controller, Post, Query, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags(swaggerTags.Movie)
@Controller({ path: '/movie', version: ['1'] })
export class MovieApiController {
  constructor(private readonly movieApiService: MovieApiService) {}

  @ApiOperation({ summary: 'Fetch All Movies' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true,
    example: 'my-secret-key',
  })
  @ApiResponse({ status: 200, description: 'Movies fetched successfully' })
  @UseGuards(AuthGuard('api-key'))
  @Get('')
  async findAll(@Query() query: FindAllMoviesDto): Promise<IFindAllMoviesResponse> {
    const movies = await this.movieApiService.findAll(query);
    const data = (movies?.results || [])?.map((movie: IMovie) => {
      return {
        id: movie.id,
        attributes: movie,
      };
    });
    return {
      data,
      pagination: {
        page: movies.page || 0,
        pages: movies.total_pages || 0,
        count: movies.total_results || 0,
      },
    };
  }

  @ApiOperation({ summary: 'Fetch All Favorite Movies' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true,
    example: 'my-secret-key',
  })
  @ApiResponse({ status: 200, description: 'Favorite Movies fetched successfully' })
  @UseGuards(AuthGuard('api-key'))
  @Get('favorite')
  async findAllFavorite(@Query() query: FindAllFavoriteMoviesDto): Promise<IFindAllFavoriteMoviesResponse> {
    const movies = await this.movieApiService.findAllFavorite(query);
    const data = (movies?.results || [])?.map((movie: IMovie) => {
      return {
        id: movie.id,
        attributes: movie,
      };
    });
    return {
      data,
      pagination: {
        page: movies.page || 0,
        pages: movies.total_pages || 0,
        count: movies.total_results || 0,
      },
    };
  }

  @ApiOperation({ summary: 'Fetch All Watch Movies' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true,
    example: 'my-secret-key',
  })
  @ApiResponse({ status: 200, description: 'Watch Movies fetched successfully' })
  @UseGuards(AuthGuard('api-key'))
  @Get('watch')
  async findAllWatch(@Query() query: FindAllWatchMoviesDto): Promise<IFindAllWatchMoviesResponse> {
    const movies = await this.movieApiService.findAllWatch(query);
    const data = (movies?.results || [])?.map((movie: IMovie) => {
      return {
        id: movie.id,
        attributes: movie,
      };
    });
    return {
      data,
      pagination: {
        page: movies.page || 0,
        pages: movies.total_pages || 0,
        count: movies.total_results || 0,
      },
    };
  }

  @ApiOperation({ summary: 'Fetch One Movie' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true,
    example: 'my-secret-key',
  })
  @ApiResponse({ status: 200, description: 'Movie fetched successfully' })
  @UseGuards(AuthGuard('api-key'))
  @Get(':id')
  async findOne(@Query('id') id: string): Promise<IFindOneMovieResponse> {
    const movie = await this.movieApiService.findOne(id);

    return {
      id: movie.id,
      attributes: movie,
    };
  }

  @ApiOperation({ summary: 'Add To Watch' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true,
    example: 'my-secret-key',
  })
  @ApiBody({
    description: 'Movie added to watch',
    type: AddToWatchMovieDto,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Movie Added to watch successfully',
  })
  @UseGuards(AuthGuard('api-key'))
  @Post('addToWatch')
  async addToWatch(@Body() dto: AddToWatchMovieDto): Promise<void> {
    return this.movieApiService.addToWatch(dto);
  }

  @ApiOperation({ summary: 'Add To Favorite' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true,
    example: 'my-secret-key',
  })
  @ApiBody({
    description: 'Movie added to favorite',
    type: AddToWatchMovieDto,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Movie Added to favorite successfully',
  })
  @UseGuards(AuthGuard('api-key'))
  @Post('addToFavorite')
  async addToFavorite(@Body() dto: AddToFavoriteMovieDto): Promise<void> {
    return this.movieApiService.addToFavorite(dto);
  }

  @ApiOperation({ summary: 'Rate Movie' })
  @ApiBody({
    description: 'Movie rated',
    type: RateMovieDto,
    required: true,
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true,
    example: 'my-secret-key',
  })
  @ApiResponse({
    status: 200,
    description: 'Movie rated successfully',
  })
  @UseGuards(AuthGuard('api-key'))
  @Post('makeRate')
  async makeRate(@Body() dto: RateMovieDto): Promise<void> {
    return this.movieApiService.makeRate(dto);
  }

  @ApiOperation({ summary: 'Create New Movie' })
  @ApiBody({
    description: 'Movie details to create',
    type: CreateMovieDto,
    required: true,
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true,
    example: 'my-secret-key',
  })
  @ApiResponse({ status: 200, description: 'Movie created successfully' })
  @UseGuards(AuthGuard('api-key'))
  @Post('')
  async create(@Body() dto: CreateMovieDto): Promise<IMovieResponse> {
    const createdMovie = await this.movieApiService.create(dto);

    return {
      id: createdMovie.id,
      attributes: createdMovie,
    };
  }
}
