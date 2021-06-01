﻿import { Controller } from '@nestjs/common';
import express from 'express';
import { Connection, Mongoose } from 'mongoose';
import { MasterContext } from './master-context';
import { MasterController } from './master-controller';

@Controller()
export class MasterBaseController extends MasterController {
  sessionId: number;

  get masterContext(): Promise<Connection> {
    if (!this.m_masterContext) {
      this.m_masterContext = new MasterContext().context;
    }
    return this.m_masterContext;
  }
  private m_masterContext: Promise<Connection>;
}
