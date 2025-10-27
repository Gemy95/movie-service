import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ example: '/iZLqwEwUViJdSkGVjePGhxYzbDb.jpg' })
  @IsString()
  backdrop_path: string;

  @ApiProperty({ example: [878, 53] })
  @IsArray()
  genre_ids: number[];

  @ApiProperty({ example: 755898 })
  @IsNumber()
  media_id: number;

  @ApiProperty({ example: 'en' })
  @IsString()
  original_language: string;

  @ApiProperty({ example: 'War of the Worlds' })
  @IsString()
  original_title: string;

  @ApiProperty({
    example: 'Will Radford is a top analyst for Homeland Security who tracks potential threats...',
  })
  @IsString()
  overview: string;

  @ApiProperty({ example: 319.0359 })
  @IsNumber()
  popularity: number;

  @ApiProperty({ example: '/yvirUYrva23IudARHn3mMGVxWqM.jpg' })
  @IsString()
  poster_path: string;

  @ApiProperty({ example: '2025-07-29' })
  @IsDateString()
  release_date: string;

  @ApiProperty({ example: 'War of the Worlds' })
  @IsString()
  title: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  video: boolean;

  @ApiProperty({ example: 4.37 })
  @IsNumber()
  vote_average: number;

  @ApiProperty({ example: 652 })
  @IsNumber()
  vote_count: number;
}
