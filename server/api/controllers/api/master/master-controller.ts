import { Controller } from '@nestjs/common';
import express from 'express';
import { Mongoose } from 'mongoose';
import { MasterContext } from './master-context';

@Controller()
export class MasterController {
    sessionId: number;
    request: express.Request
    response: express.Response

    get masterContext(): Mongoose {

        if (this.m_masterContext === null) {
            this.m_masterContext = new MasterContext().context;
        }

        return this.m_masterContext;
    }
    private m_masterContext: Mongoose;

}
