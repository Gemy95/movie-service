import { MovieController } from '@App/modules/movie/movie.controller';
import { MovieService } from '@App/modules/movie/movie.service';
import { MovieRepository } from '@App/modules/movie/repositories/movie.repository';
import { Movie, MovieSchema } from '@App/shared/schemas/movie.schema';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
  ],
  controllers: [MovieController],
  providers: [MovieService, MovieRepository],
})
export class MovieModule {}
