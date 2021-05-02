import { ObjectID } from 'bson';

export class ModelBase {
  _id: ObjectID;
  get id(): ObjectID {
    return this._id;
  }
  set id(value: ObjectID) {
    this._id = value;
  }
}
