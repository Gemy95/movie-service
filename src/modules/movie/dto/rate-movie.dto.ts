import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class RateMovieDto {
  @ApiProperty({ type: Number, example: 100 })
  @IsNotEmpty()
  @IsNumber()
  movie_id: number;

  @ApiProperty({ type: Number, example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.5)
  @Max(10)
  value: number;
}
