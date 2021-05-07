import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
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
import { ConfigModule, ConfigType } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtStrategy } from './auth/jwt/jwt';
import { UserService } from './user/user.service';


@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    PassportModule.register({ session: true }),
    JwtModule.register({
      secret: "jwtConfig.secretKey",
    }),
  ],
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
  providers: [JwtStrategy, UserService],
})
export class ApplicationModule {}
