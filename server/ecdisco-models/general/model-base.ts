import { ObjectID } from 'bson';

export class ModelBase {
  _id?: ObjectID;
  
  get id(): ObjectID {
    return this._id;
  }
  set id(value: ObjectID) {
    this._id = value;
  }
}

export const DefaultTransform = {
  schemaOptions: {
      toJSON: {
          virtuals: true,
          versionKey: false,
          transform: (doc, ret, options) => {
              delete ret._id;
              return ret;
          }
      }
  }
}