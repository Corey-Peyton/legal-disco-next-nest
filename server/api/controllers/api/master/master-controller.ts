import { Controller } from '@nestjs/common';
import express from 'express';
import { Mongoose } from 'mongoose';
import { MasterContext } from './master-context';

@Controller()
export class MasterController {
  sessionId: number;
}
