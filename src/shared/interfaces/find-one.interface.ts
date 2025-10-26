import { ISort } from '@App/shared/interfaces/sort.interface';
import { PopulateOptions } from 'mongoose';

export interface IFindOne {
  where?: object;
  include?: object;
  populate?: (string | PopulateOptions)[];
  orderBy?: ISort | Array<ISort>;
  select?: Record<string, string | number | boolean | object>;
  options?: object;
}
