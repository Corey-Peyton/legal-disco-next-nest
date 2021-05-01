﻿import { Body, Controller, Post } from '@nestjs/common';
import { DatabaseServerModel } from '../../../../../ecdisco-models/master/database-server';
import { datasourceModel } from '../../../../../ecdisco-models/master/datasource';
import {
  Project,
  ProjectModel,
} from '../../../../../ecdisco-models/master/project';
import { GlobalConfiguration } from '../../../global-configuration';
import { ProjectBaseController } from '../../project/project-base-controller';
import { MasterController } from '../master-controller';

@Controller('Project')
export class ProjectController extends MasterController {
  DeleteProject(projectId: number): void {
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
  async saveProject(@Body() projects: Project): Promise<number> {
    this.masterContext;
    const project = new Project();

    project.name = projects.name;

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

    return (
      await ProjectModel.findOneAndUpdate(
        { _id: projects.id },
        {
          $set: {
            name: projects.name,
            databaseServerId: project.databaseServerId,
          },
        },
        { upsert: true },
      )
    ).id;
  }
}
