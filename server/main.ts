import { NestFactory } from '@nestjs/core';
import Consola from 'consola';
import session from 'express-session';
import passport from 'passport';
import config from '../nuxt.config';
import { ApplicationModule } from './application.module';
import NuxtServer from './nuxt/';
import { NuxtFilter } from './nuxt/nuxt.filter';

declare const module: any;

async function bootstrap() {
  const { host, port } = config.env;

  //https://stackoverflow.com/questions/22584268/node-js-https-pem-error-routinespem-read-biono-start-line
  // TODO: Remove this later for https
  // const httpsOptions = { 
  //   key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem'), 'utf8'),
  //   cert: fs.readFileSync(path.resolve(__dirname, 'ssl/server.crt'), 'utf8'),
  // };

  //https://github.com/panva/node-openid-client/issues/157
  //https://stackoverflow.com/a/21961005
  // TODO: Remove this later for https
  //(process.env["NODE_TLS_REJECT_UNAUTHORIZED"] as any) = 0;

  const nuxt = await NuxtServer.getInstance().run(
    config.dev ? !(module.hot && module.hot._main) : true,
  );
  const server = await NestFactory.create(ApplicationModule);

  server.useGlobalFilters(new NuxtFilter(nuxt)); // On 404: This loads nuxt. Like other SPA do.

  server.setGlobalPrefix('api');
  //server.useGlobalGuards(new AuthenticatedGuard());

  // Authentication & Session
  server.use(session({
  //    store: connectMongo.create({
  //      mongoUrl: 'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false'
  //  }), // where session will be stored
    secret: 'processenvSESSION_SECRET', // to sign session id
    resave: false, // will default to false in near future: https://github.com/expressjs/session#resave
    saveUninitialized: false, // will default to false in near future: https://github.com/expressjs/session#saveuninitialized
    rolling: true, // keep session alive
    cookie: {
      maxAge: 30 * 60 * 1000, // session expires in 1hr, refreshed by `rolling: true` option.
      httpOnly: true, // so that cookie can't be accessed via client-side script
    }
  }));

  server.use(passport.initialize());
  server.use(passport.session());

  await server.listen(port, host, () => {
    Consola.ready({
      message: `Server listening on https://${host}:${port}`,
      badge: true,
    });
  });

  if (config.dev && module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.close());
  }
}

bootstrap();
