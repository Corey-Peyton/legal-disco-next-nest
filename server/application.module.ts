import { Module } from '@nestjs/common';
import { ProjectController } from './api/controllers/api/master/project/project-controller';
import { DatasourceController } from './api/controllers/api/project/datasource/datasource-controller';
import { DocumentFieldController } from './api/controllers/api/project/document-field/document-field-controller';
import { DocumentAnnotationController } from './api/controllers/api/project/document/document-annotation-controller';
import { DocumentController } from './api/controllers/api/project/document/document-controller';
import { DocumentSearchController } from './api/controllers/api/project/document/document-search-controller';
import { IndexController } from './api/controllers/api/project/document/index-controller';
import { SessionController } from './api/controllers/api/project/general/session-controller';
import { ProductionController } from './api/controllers/api/project/production/production-controller';
import { SearchController } from './api/controllers/api/project/search/search-controller';
import { AuthRedirectController } from './api/controllers/auth-redirect-controller';
import { HomeController } from './api/controllers/home-controller';
import { UploadController } from './api/controllers/upload-controller';
import { WebViewController } from './api/controllers/web-view-controller';
import { AppController } from './application.controller';
import { AuthModule } from './auth/oidc/auth.module';

@Module({
  // imports: [
  //   AuthModule // TODO: Temporary. disabled auth to depoly to docker.
  // ],
  controllers: [
    AppController,
    AuthRedirectController,
    HomeController,
    UploadController,
    WebViewController,
    ProjectController,
    DatasourceController,
    DocumentAnnotationController,
    DocumentController,
    DocumentSearchController,
    IndexController,
    DocumentFieldController,
    SessionController,
    ProductionController,
    SearchController,
  ],
})
export class ApplicationModule {}
