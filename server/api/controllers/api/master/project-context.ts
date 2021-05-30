import { ObjectID } from 'bson';
import { connect, Mongoose } from 'mongoose';

export class ProjectContext {
  projectId: ObjectID;

  constructor(projectId: ObjectID) {
    this.projectId = projectId;
  }

  get context(): Mongoose {
    if (!this.m_context) {
      (async () => {
        this.m_context = await connect(
          `mongodb://localhost/ecdiscoProject_${this.projectId}`,
          { useNewUrlParser: true, useUnifiedTopology: true },
        );

        this.m_context.pluralize(null); // By default mongoose is trying to be smart and makes things pluralize.
      })();
    }

    return this.m_context;
  }
  private m_context: Mongoose;
}
