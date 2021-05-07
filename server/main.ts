import { NestFactory } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import Consola from 'consola';
import config from '../nuxt.config';
import { ApplicationModule } from './application.module';
import { AuthenticatedGuard } from './auth/session/session-guard';
import NuxtServer from './nuxt/';
import { NuxtFilter } from './nuxt/nuxt.filter';

declare const module: any;

async function bootstrap() {
  const { host, port } = config.env;

  const nuxt = await NuxtServer.getInstance().run(
    config.dev ? !(module.hot && module.hot._main) : true,
  );
  const server = await NestFactory.create(ApplicationModule);

  server.useGlobalFilters(new NuxtFilter(nuxt)); // On 404: This loads nuxt. Like other SPA do.

  server.setGlobalPrefix('api');
  server.useGlobalGuards(new AuthenticatedGuard());
  
  await server.listen(port, host, () => {
    Consola.ready({
      message: `Server listening on http://${host}:${port}`,
      badge: true,
    });
  });

  if (config.dev && module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.close());
  }
}

bootstrap();
