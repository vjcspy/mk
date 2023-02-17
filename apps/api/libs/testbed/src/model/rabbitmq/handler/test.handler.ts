import { RabbitSubscribe } from '@lib/queue/decorator/rabbitmq.decorator';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestHandler {
  @RabbitSubscribe({
    connection: 'default',
    exchange: 'testbed-exchange1',
    routingKey: 'testbed-routing-key',
    queue: 'testbed-queue',
  })
  public async pubSubHandler(msg: {}) {
    console.log(`Received message: ${JSON.stringify(msg)}`);
  }
}
