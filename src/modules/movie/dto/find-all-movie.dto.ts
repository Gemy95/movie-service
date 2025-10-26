import { Genre } from '@App/modules/movie/constants/movie.enum.constants';
import { GetAllDto } from '@App/shared/commons/dto/get-all.dto';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional } from 'class-validator';

export class FindAllMoviesDto extends PartialType(GetAllDto) {
  @ApiPropertyOptional({
    description: 'List of genres to filter by',
    enum: Genre,
    isArray: true,
    example: [Genre.Action, Genre.Thriller, Genre.Horror],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Genre, { each: true })
  withGenres?: Genre[];
}
