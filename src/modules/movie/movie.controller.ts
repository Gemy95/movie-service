import { AddToFavoriteMovieDto } from '@App/modules/movie/dto/add-to-favorite-movie.dto';
import { AddToWatchMovieDto } from '@App/modules/movie/dto/add-to-watch-movie.dto';
import { CreateMovieDto } from '@App/modules/movie/dto/create-movie.dto';
import { FindAllMoviesDto } from '@App/modules/movie/dto/find-all-movie.dto';
import { RateMovieDto } from '@App/modules/movie/dto/rate-movie.dto';
import { ICreateMovieResponse, IFindAllMoviesResponse, IMovie } from '@App/modules/movie/interfaces/movie.interface';
import { MovieService } from '@App/modules/movie/movie.service';
import { swaggerTags } from '@App/shared/constants/swagger.tags.constant';
import { Body, Controller, Post, Query, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags(swaggerTags.Movie)
@Controller({ path: '/movie', version: ['1'] })
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

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
  async create(@Body() dto: CreateMovieDto): Promise<ICreateMovieResponse> {
    const createdMovie = await this.movieService.create(dto);

    return {
      id: createdMovie.id,
      attributes: createdMovie,
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
  async findOne(@Query('id') id: string): Promise<ICreateMovieResponse> {
    const movie = await this.movieService.findOne(id);

    return {
      id: movie.id,
      attributes: movie,
    };
  }

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
    const movies = await this.movieService.findAll(query);
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

  @ApiOperation({ summary: 'Add to watch' })
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
    return this.movieService.addToWatch(dto);
  }

  @ApiOperation({ summary: 'Add to Favorite' })
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
    return this.movieService.addToFavorite(dto);
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
    return this.movieService.makeRate(dto);
  }
}
