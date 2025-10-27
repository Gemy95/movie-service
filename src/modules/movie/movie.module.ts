import { AuthMiddleware } from '@App/modules/auth/auth.middleware';
import { MovieController } from '@App/modules/movie/movie.controller';
import { MovieService } from '@App/modules/movie/movie.service';
import { MovieRepository } from '@App/modules/movie/repositories/movie.repository';
import { Movie, MovieSchema } from '@App/shared/schemas/movie.schema';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [HttpModule, MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }])],
  controllers: [MovieController],
  providers: [MovieService, MovieRepository],
})
export class MovieModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'v1/movie', method: RequestMethod.POST },
        { path: 'v1/movie', method: RequestMethod.GET },
        { path: 'v1/movie/:id', method: RequestMethod.GET },
        { path: 'v1/movie/addToWatch', method: RequestMethod.POST },
        { path: 'v1/movie/addToFavorite', method: RequestMethod.POST },
        { path: 'v1/movie/makeRate', method: RequestMethod.POST }
      );
  }
}
