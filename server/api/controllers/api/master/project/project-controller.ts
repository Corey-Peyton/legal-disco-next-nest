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
  async deleteProject(projectId: ObjectID): Promise<void> {

    ProjectModel(await this.masterContext).findByIdAndDelete(projectId);

    // TODO: Need to make some common methods for following types of db operations.
    const projectController = new ProjectBaseController();
    projectController.projectId = projectId;
    const connection = await projectController.projectContext;
    connection.db.dropDatabase();
  }

  @Post('getProjects')
  async getProjects(): Promise<Project[]> {
    const projects = await ProjectModel(await this.masterContext).find({})
    
    return projects.map((project) => {
      const projectBaseController = new ProjectBaseController();
      projectBaseController.projectId = project.id;

      projectBaseController.projectContext;
      (async () => {
        project.datasource = await datasourceModel(await projectBaseController.projectContext).find({}); // datasource gets stored in project db.
      })();

      return project;
    });
  }

  @Post('saveProject')
  async saveProject(@Body() project: Project): Promise<ObjectID> {

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
      project = await ProjectModel(await this.masterContext).findOneAndUpdate(
        { _id: project.id },
        {
          $set: {
            name: project.name,
            databaseServerId: project.databaseServerId,
          },
        },
      );
    } else {
      project = await ProjectModel(await this.masterContext).create({
        name: project.name,
        databaseServerId: project.databaseServerId,
      });
    }

    return project.id;
  }
}
