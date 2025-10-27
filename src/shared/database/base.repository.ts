import { generatePagination } from '@App/shared/helpers/generate-pagination.helper';
import { transformSort } from '@App/shared/helpers/transform-sort.helper';
import { IFindAll } from '@App/shared/interfaces/find-all.interface';
import { IFindOne } from '@App/shared/interfaces/find-one.interface';
import { IPagination } from '@App/shared/interfaces/pagination.interface';
import { ISort } from '@App/shared/interfaces/sort.interface';
import { Inject, Injectable } from '@nestjs/common';
import { Model, PopulateOptions } from 'mongoose';

@Injectable()
export abstract class BaseRepository<T> {
  protected readonly model: Model<T>;

  constructor(@Inject('MODEL_TOKEN') model: Model<T>) {
    this.model = model;
  }

  getModel(): Model<T> {
    return this.model;
  }

  async findAll(query?: IFindAll): Promise<{ data: Array<T>; page?: IPagination }> {
    const { page, perPage, where, select, orderBy, populate } = query || {};
    const { take, skip } = generatePagination(page, perPage) || {};
    const count = await this.count(query);
    const sortCriteria: ISort = orderBy ? transformSort(orderBy) : { updatedAt: -1, createdAt: 1 };
    const populateOptions: (string | PopulateOptions)[] = populate
      ? Array.isArray(populate)
        ? populate
        : [populate]
      : [];
    const data = await this.model
      .find(where)
      .select(select)
      .skip(skip)
      .limit(take)
      .sort(sortCriteria)
      .populate(populateOptions);

    const pagination =
      page && perPage
        ? {
            page,
            perPage,
            lastPage: Math.ceil(count / perPage),
            count,
          }
        : undefined;

    return {
      data,
      page: pagination,
    };
  }

  async findOne(query?: IFindOne): Promise<T | null> {
    const { select, populate, where } = query || {};
    const populateOptions: (string | PopulateOptions)[] = populate
      ? Array.isArray(populate)
        ? populate
        : [populate]
      : [];
    return this.model
      .findOne({ ...where })
      .select(select)
      .populate(populateOptions)
      .exec();
  }

  async create(data: object): Promise<T> {
    return this.model.create(data);
  }

  async updateById(id: string, data: object, query?: IFindOne): Promise<T | null> {
    const { select, populate, where, options = {} } = query || {};
    const populateOptions: (string | PopulateOptions)[] = populate
      ? Array.isArray(populate)
        ? populate
        : [populate]
      : [];
    await this.model.findByIdAndUpdate(id, data, { new: true, ...options });
    return this.findOne({
      where: { ...where, id },
      select,
      populate: populateOptions,
    });
  }

  async removeById(id: string, query?: IFindOne): Promise<T | null> {
    const deletedItem = await this.findOne({ where: { ...query?.where, id } });
    await this.model.findByIdAndDelete(id);
    return deletedItem;
  }

  async count(query?: Partial<IFindOne>): Promise<number> {
    const { where } = query || {};
    return this.model.countDocuments(where);
  }

  async findById(id: string) {
    return this.model.findById(id).exec();
  }

  async findByIdAndUpdate(id: string, input: object, options: object) {
    return this.model.findByIdAndUpdate(id, input, options).exec();
  }

  async findByIdAndDelete(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }

  async findOneAndUpdate(query: IFindOne, input: object, options: object) {
    return this.model.findOneAndUpdate(query.where, input, options).exec();
  }

  async findOneAndDelete(query: IFindOne) {
    return this.model.findOneAndDelete(query.where).exec();
  }

  async upsertMany(data: Array<object>): Promise<void> {
    const bulkOps = data?.map((item: any) => {
      const { id, ...rest } = item;
      return {
        updateOne: {
          filter: { id: id },
          update: { $set: rest },
          upsert: true,
        },
      };
    });

    await this.model.bulkWrite(bulkOps);
  }
}
