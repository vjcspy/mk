import { PrismaModule } from '@lib/prisma';
import { QueueModule } from '@lib/queue';
import { FooController } from '@lib/testbed/controller/foo.controller';
import { QueueController } from '@lib/testbed/controller/queue.controller';
import { TestHandler } from '@lib/testbed/model/rabbitmq/handler/test.handler';
import { TestPublisher } from '@lib/testbed/model/rabbitmq/publisher/test.publisher';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    PrismaModule,
    QueueModule.register({
      exchanges: [
        {
          name: 'testbed-exchange1',
          type: 'topic',
        },
      ],
      handlers: [TestHandler],
    }),
  ],
  providers: [TestPublisher],
  controllers: [FooController, QueueController],
})
export class TestbedModule {}
