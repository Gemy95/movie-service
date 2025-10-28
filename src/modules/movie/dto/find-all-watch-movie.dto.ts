import { GetAllDto } from '@App/shared/commons/dto/get-all.dto';
import { PartialType } from '@nestjs/swagger';

export class FindAllWatchMoviesDto extends PartialType(GetAllDto) {}
