import { AppModule } from '@api/app.module';
import { initLoggerInstance } from '@lib/core/util/logger';
import { PrismaService } from '@lib/prisma/service/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  await ConfigModule.envVariablesLoaded;
  const app = await NestFactory.create(AppModule, {
    logger: initLoggerInstance({
      splunk: {
        enable: process.env.SPLUNK_ENABLE,
        token: process.env.SPLUNK_TOKEN,
        url: process.env.SPLUNK_URL,
        index: process.env.SPLUNK_INDEX,
        source: process.env.SPLUNK_SOURCE,
      },
    }),
  });

  const configService = app.get(ConfigService);
  await app.listen(configService.get('port'));

  // Fix Prisma interferes with NestJS enableShutdownHooks https://docs.nestjs.com/recipes/prisma#issues-with-enableshutdownhooks
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
}
bootstrap();
