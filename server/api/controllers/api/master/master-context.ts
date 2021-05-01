import { connect, Mongoose } from 'mongoose';

export class MasterContext {
  get context(): Mongoose {
    
    if (!this.m_context) {

      (async () => {

          this.m_context = await connect(
            'mongodb://localhost/ecdiscoMaster',
            { useNewUrlParser: true, useUnifiedTopology: true }
          );

          this.m_context.pluralize(null); // By default mongoose is trying to be smart and makes things pluralize.

      })();
    }

    return this.m_context;
  }
  private m_context: Mongoose;

}
