import { ISort } from '@App/shared/interfaces/sort.interface';

export const transformSort = (
  orderBy: ISort | ISort[],
): { [key: string]: 1 | -1 } => {
  if (Array.isArray(orderBy)) {
    return orderBy.reduce((acc, sort) => ({ ...acc, ...sort }), {});
  }
  return orderBy;
};
