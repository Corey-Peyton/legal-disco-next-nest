import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ObjectID } from 'bson';
import { AuthenticatedGuard } from '../../../../../auth/oidc/session-guard';
import { DatabaseServerModel } from '../../../../../ecdisco-models/master/database-server';
import { datasourceModel } from '../../../../../ecdisco-models/master/datasource';
import {
  Project,
  ProjectModel,
} from '../../../../../ecdisco-models/master/project';
import { GlobalConfiguration } from '../../../global-configuration';
import { ProjectBaseController } from '../../project/project-base-controller';
import { MasterBaseController } from '../master-base-controller';

 @UseGuards(AuthenticatedGuard)
@Controller('Project')
export class ProjectController extends MasterBaseController {
  
  @Post('deleteProject')
  deleteProject(projectId: ObjectID): void {

    this.masterContext;

    ProjectModel.findByIdAndDelete(projectId);

    // TODO: Need to make some common methods for following types of db operations.
    const projectController = new ProjectBaseController();
    projectController.projectId = projectId;
    const connection = projectController.projectContext;
    connection.connection.db.dropDatabase();
  }

  @Post('getProjects')
  async getProjects(): Promise<Project[]> {

    this.masterContext;

    const projects = await ProjectModel.find({});
    return projects.map((project) => {
      const projectBaseController = new ProjectBaseController();
      projectBaseController.projectId = project.id;

      projectBaseController.projectContext;
      (async () => {
        project.datasource = await datasourceModel.find();
      })();

      return project;
    });
  }

  @Post('saveProject')
  async saveProject(@Body() project: Project): Promise<ObjectID> {

    this.masterContext;

    const avail = GlobalConfiguration.AvailableDatabaseServer;

    await DatabaseServerModel.updateOne(
      {
        name: avail,
      },
      {
        name: avail,
      },
      { upsert: true },
    );

    // TODO: We will fetch this based on computed storage of cloud. For now it is fixed from Global Configuration.
    project.databaseServerId = (
      await DatabaseServerModel.findOne({
        name: avail,
      })
    ).id;

    if (project.id) {
      project = await ProjectModel.findOneAndUpdate(
        { _id: project.id },
        {
          $set: {
            name: project.name,
            databaseServerId: project.databaseServerId,
          },
        },
      );
    } else {
      project = await ProjectModel.create({
        name: project.name,
        databaseServerId: project.databaseServerId,
      });
    }

    return project.id;
  }
}
