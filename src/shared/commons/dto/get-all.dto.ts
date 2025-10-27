import { SortDto } from '@App/shared/commons/dto/sort.dto';
import { IsValidSort } from '@App/shared/validator/is-valid-sort.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class GetAllDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  perPage?: number = 25;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  })
  @Type(() => SortDto)
  @IsObject()
  @IsValidSort()
  orderBy?: SortDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
