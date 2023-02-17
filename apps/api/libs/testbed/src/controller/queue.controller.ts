import { TestPublisher } from '@lib/testbed/model/rabbitmq/publisher/test.publisher';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class QueueController {
  constructor(private testPublisher: TestPublisher) {}

  @Get('queue/test-publisher')
  async getPostById() {
    await this.testPublisher.publish();
  }
}
