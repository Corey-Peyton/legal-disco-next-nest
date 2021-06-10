import { mongoose } from '@typegoose/typegoose';
import { Model } from 'mongoose';
import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { ModelType, prop, staticMethod, Typegoose } from 'typegoose';

export class Dummy extends Typegoose {

  @staticMethod
  static async findOneAndUpsert<T extends mongoose.Document<any, {}>>(
    this: ModelType<T>,
    filter?: FilterQuery<T>,
    update?: UpdateQuery<T>,
    options?: QueryOptions | null,
    callback?: (err: any, doc: T | null, res: any) => void,
  ): Promise<T> {
    if (filter.id) {
      return (this as Model<T>).findOneAndUpdate(filter, update, options, callback);
    } else {
      return (this as Model<T>).findById((await this.create((update as any).$set)).id);
    }
  }
}

mongoose.model.prototype.findOneAndUpsert = async function <
  T extends mongoose.Document<any, {}> // I think this is done. because here I have to explicitly mention extend. but because
>(
  filter?: FilterQuery<T>,
  update?: UpdateQuery<T>,
  options?: QueryOptions | null,
  callback?: (err: any, doc: T | null, res: any) => void,
): Promise<T> {
  const model = this as mongoose.Model<T>;
  if (filter.id) {
    return model.findOneAndUpdate(filter, update, options, callback);
  } else {
    return model.findById((await model.create((update as any).$set)).id);
  }
};

mongoose.Collection.prototype.findOneAndUpsert = async function <
  T extends mongoose.Document<any, {}> // I think this is done. because here I have to explicitly mention extend. but because
>(
  filter?: FilterQuery<T>,
  update?: UpdateQuery<T>,
  options?: QueryOptions | null,
  callback?: (err: any, doc: T | null, res: any) => void,
): Promise<T> {
  const model = this as mongoose.Model<T>;
  if (filter.id) {
    return model.findOneAndUpdate(filter, update, options, callback);
  } else {
    return model.findById((await model.create((update as any).$set)).id);
  }
};

declare module 'mongoose' {
  interface Model<T>
    extends NodeJS.EventEmitter,
      AcceptsDiscriminator {
    findOneAndUpsert<T>( 
      filter?: FilterQuery<T>,
      update?: UpdateQuery<T>,
      options?: QueryOptions | null,
      callback?: (err: any, doc: T | null, res: any) => void,
    ): Promise<T>;
  }
}

export class MongoHelper {

    async findOneAndUpsert<T extends mongoose.Document>(
      this: Model<T>,
      filter?: FilterQuery<T>,
      update?: UpdateQuery<T>,
      options?: QueryOptions | null,
      callback?: (err: any, doc: T | null, res: any) => void,
    ): Promise<T> {
      if (filter.id) {
        return this.findOneAndUpdate(filter, update, options, callback);
      } else {
        return this.findById((await this.create((update as any).$set)).id);
      }
    }
  }