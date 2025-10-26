import { BaseRepository } from '@App/shared/database/base.repository';
import { Movie } from '@App/shared/schemas/movie.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class MovieRepository extends BaseRepository<Movie> {
  constructor(@InjectModel('Movie') private movieModel: Model<Movie>) {
    super(movieModel);
  }
}
