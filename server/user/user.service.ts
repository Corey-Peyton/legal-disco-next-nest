import { Injectable } from '@nestjs/common';
import { MasterBaseController } from 'server/api/controllers/api/master/master-base-controller';
import { AppUser, AppUserModel } from 'server/ecdisco-models/master/app-user';
import { FindOneOptions } from 'typeorm';

@Injectable()
export class UserService extends MasterBaseController {
  public findOne(where: any): Promise<AppUser | undefined> {
    this.masterContext;

    return AppUserModel.findOne({ where }).exec();
  }
}
