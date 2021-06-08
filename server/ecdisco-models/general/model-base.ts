import {
  getModelForClass,
  modelOptions,
  Severity
} from '@typegoose/typegoose';
import { AnyParamConstructor, BeAnObject } from '@typegoose/typegoose/lib/types';
import { ObjectID } from 'bson';
import { Connection } from 'mongoose';

export const defaultOptions = {
  options: {
    allowMixed: Severity.ALLOW,
  },
};

@modelOptions(defaultOptions)
export class ModelBase {
  _id?: ObjectID;

  get id(): ObjectID {
    return this._id;
  }
  set id(value: ObjectID) {
    this._id = value;
  }
}

export const defaultTransform = {
  schemaOptions: {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret, options) => {
        delete ret._id;
        return ret;
      },
    },
  },
};

export const getCommonModelForClass = <
  U extends AnyParamConstructor<any>,
  QueryHelpers = BeAnObject
>(
  cl: U,
  connection: Connection,
) => {
  return getModelForClass(cl, {
    ...defaultTransform,
    ...{
      existingConnection: connection,
    },
  });
};
