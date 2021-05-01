export class ModelBase {
  _id: any;
  get id(): any {
    return this._id;
  }
  set id(value: any) {
    this._id = value;
  }
}
