import { ObjectID } from 'bson';
import { connect, Connection, createConnection, Mongoose } from 'mongoose';

export class ProjectContext {
  projectId: ObjectID;

  constructor(projectId: ObjectID) {
    this.projectId = projectId;
  }

  get context(): Promise<Connection> {
    if (!this.m_context) {
      this.m_context = createConnection(
        `mongodb://localhost/ecdiscoProject_${this.projectId}`, // This will be used for some other db queries. depending on tenant.
        { useNewUrlParser: true, useUnifiedTopology: true },
      );
    }

    return this.m_context;
  }
  private m_context: Promise<Connection>;
}
