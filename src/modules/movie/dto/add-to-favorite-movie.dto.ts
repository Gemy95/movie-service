import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddToFavoriteMovieDto {
  @ApiProperty({ type: Number, example: 100 })
  @IsNotEmpty()
  @IsNumber()
  media_id: number;
}
