import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddToWatchMovieDto {
  @ApiProperty({ type: Number, example: 100 })
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
