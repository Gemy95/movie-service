import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type MovieDocument = HydratedDocument<Movie>;

@Schema({
  _id: false,
  timestamps: true,
  versionKey: false,
  collection: 'movies',
  strict: false, // allowing any future data
})
export class Movie {
  @Prop({ type: String, default: uuidv4 })
  id: string;

  @Prop({ type: Date, default: null, name: 'deleted_at' })
  deletedAt?: Date;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
MovieSchema.index({ id: 1 });
