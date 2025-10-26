import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MovieDocument = HydratedDocument<Movie>;

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'movies',
  strict: false, // allowing any future data
})
export class Movie {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true })
  backdrop_path: string;

  @Prop({ type: [Number], required: true })
  genre_ids: number[];

  @Prop({ required: true })
  original_language: string;

  @Prop({ required: true })
  original_title: string;

  @Prop({ required: true })
  overview: string;

  @Prop({ required: true })
  popularity: number;

  @Prop({ required: true })
  poster_path: string;

  @Prop({ required: true })
  release_date: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  video: boolean;

  @Prop({ required: true })
  vote_average: number;

  @Prop({ required: true })
  vote_count: number;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
MovieSchema.index({ id: 1 });
