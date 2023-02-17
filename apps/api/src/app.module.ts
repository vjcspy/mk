import { AppController } from '@api/app.controller';
import { AppService } from '@api/app.service';
import { CoreModule } from '@lib/core';
import { PrismaModule } from '@lib/prisma';
import { QueueModule } from '@lib/queue';
import { getRabbitUri } from '@lib/queue/config/rabbitmq.config';
import { ReactiveModule } from '@lib/reactive';
import { TestbedModule } from '@lib/testbed';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CoreModule,
    ReactiveModule,
    QueueModule.register({
      uri: getRabbitUri(),
    }),
    PrismaModule,
    TestbedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
