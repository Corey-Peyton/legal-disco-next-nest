import { connect, Mongoose } from 'mongoose';

export class ProjectContext {
  projectId: number;

  get context(): Mongoose {
    if (this.m_context === null) {
      (async () => {
        this.m_context = await connect(
          `mongodb://localhost/ecdiscoProject_${this.projectId}`,
          { useNewUrlParser: true, useUnifiedTopology: true }
        );
      })();
    }

    return this.m_context;
  }
  private m_context: Mongoose;
}
