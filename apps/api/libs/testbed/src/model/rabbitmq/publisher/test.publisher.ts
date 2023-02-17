import { AmqpConnectionManager } from '@lib/queue/model/amqp/connection-manager';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestPublisher {
  constructor(private acm: AmqpConnectionManager) {}

  async publish() {
    await this.acm
      .getConnection()
      .publish('testbed-exchange1', 'testbed-routing-key', {
        msg: +new Date(),
      });
  }
}
