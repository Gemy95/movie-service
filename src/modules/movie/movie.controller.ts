import { AddToWatchMovieDto } from '@App/modules/movie/dto/add-to-watch-movie.dto';
import { CreateMovieDto } from '@App/modules/movie/dto/create-movie.dto';
import { FindAllMoviesDto } from '@App/modules/movie/dto/find-all-movie.dto';
import { RateMovieDto } from '@App/modules/movie/dto/rate-movie.dto';
import {
  ICreateMovieResponse,
  IFindAllMoviesResponse,
  IMovie,
} from '@App/modules/movie/interfaces/movie.interface';
import { MovieService } from '@App/modules/movie/movie.service';
import { swaggerTags } from '@App/shared/constants/swagger.tags.constant';
import { Body, Controller, Post, Query, Get } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
  @ApiResponse({ status: 200, description: 'Movie created successfully' })
  @Post('')
  async create(@Body() dto: CreateMovieDto): Promise<ICreateMovieResponse> {
    const createdMovie = await this.movieService.create(dto);

    return {
      id: createdMovie.id,
      attributes: createdMovie,
    };
  }

  @ApiOperation({ summary: 'Fetch One Movie' })
  @ApiResponse({ status: 200, description: 'Movie fetched successfully' })
  @Get(':id')
  async findOne(@Query('id') id: string): Promise<ICreateMovieResponse> {
    const movie = await this.movieService.findOne(id);

    return {
      id: movie.id,
      attributes: movie,
    };
  }

  @ApiOperation({ summary: 'Fetch All Movies' })
  @ApiResponse({ status: 200, description: 'Movies fetched successfully' })
  @Get('')
  async findAll(
    @Query() query: FindAllMoviesDto,
  ): Promise<IFindAllMoviesResponse> {
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
  @ApiBody({
    description: 'Movie added to watch',
    type: AddToWatchMovieDto,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Movie Added to watch successfully',
  })
  @Post('addToWatch')
  async addToWatch(@Body() dto: AddToWatchMovieDto): Promise<void> {
    return this.movieService.addToWatch(dto);
  }

  @ApiOperation({ summary: 'Rate Movie' })
  @ApiBody({
    description: 'Movie rated',
    type: RateMovieDto,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Movie rated successfully',
  })
  @Post('makeRate')
  async makeRate(@Body() dto: RateMovieDto): Promise<void> {
    return this.movieService.makeRate(dto);
  }
}
