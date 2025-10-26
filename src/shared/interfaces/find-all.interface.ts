import { ISort } from '@App/shared/interfaces/sort.interface';
import { PopulateOptions } from 'mongoose';

export interface IFindAll {
  page?: number;
  perPage?: number;
  orderBy?: ISort;
  where?: object;
  select?: Record<string, string | number | boolean | object>;
  include?: object;
  populate?: (string | PopulateOptions)[];
  search?: string;
}
