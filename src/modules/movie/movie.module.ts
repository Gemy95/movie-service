import { AuthMiddleware } from '@App/modules/auth/auth.middleware';
import { MovieApiController } from '@App/modules/movie/api/movie.api.controller';
import { MovieApiService } from '@App/modules/movie/api/movie.api.service';
import { MovieRepository } from '@App/modules/movie/repositories/movie.repository';
import { Movie, MovieSchema } from '@App/shared/schemas/movie.schema';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [HttpModule, MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }])],
  controllers: [MovieApiController],
  providers: [MovieApiService, MovieRepository],
  exports: [MovieApiService, MovieRepository],
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
        { path: 'v1/movie/makeRate', method: RequestMethod.POST },
        { path: 'v1/movie/favorite', method: RequestMethod.GET },
        { path: 'v1/movie/watch', method: RequestMethod.GET }
      );
  }
}
