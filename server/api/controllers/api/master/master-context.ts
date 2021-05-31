import {
  connect,
  Connection,
  createConnection,
  mongo,
  Mongoose,
} from 'mongoose';

export class MasterContext {
  get context(): Promise<Connection> {
    
    if (!this.m_context) {
      this.m_context = createConnection('mongodb://localhost/ecdiscoMaster', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        socketTimeoutMS: 60000,
        poolSize: 300,
        bufferCommands: false,
        bufferMaxEntries: 0,
      });
    }

    return this.m_context;
  }
  private m_context: Promise<Connection>;
}
