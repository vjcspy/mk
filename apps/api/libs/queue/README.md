[TOC]

## Register 

Khai báo trong các child module. 

Hỗ trợ nhiều connection, nếu muốn khai báo cho connection khác thì thêm `name` property

`QueueModule` sẽ merge các config ở các child modules (`handler`, `exchange`, `channel`).

```typescript
// main module khai báo uri
...
QueueModule.register({
      uri: 'amqp://rabbitmq:rabbitmq@localhost:5672',      
    }),
...
```



```typescript
//Ở child module khái báo handle

@Module({
  imports: [
    PrismaModule,
    QueueModule.register({
      //Nếu không khai báo name thì mặc định là đang config cho default connection  
      exchanges: [
        {
          name: 'testbed-exchange1',
          type: 'topic',
        },
      ],
      // Default channel sẽ luôn được tạo và sử dụng name của connection trừ trường hợp tự khai báo 1 default channel
      channels: {
        'channel-1': {
          prefetchCount: 15,
          default: true,
        },
        'channel-2': {
          prefetchCount: 2,
        },
      },
      // Muốn handler nào được chạy thì cần phải khai báo
      handlers: [TestHandler],
    }),
  ],
  controllers: [FooController],
})
export class TestbedModule {}
```

## Receiving Messages

### Exposing Pub/Sub Handlers

```typescript
import { RabbitSubscribe } from '@lib/queue/decorator/rabbitmq.decorator';
import { Injectable } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';

@Injectable()
export class TestHandler {
  @RabbitSubscribe({
    connection: 'default',
    exchange: 'exchange1',
    routingKey: 'subscribe-route',
    queue: 'subscribe-queue',
  })
    public async pubSubHandler(msg: {}, amqpMsg: ConsumeMessage) {
    console.log(`Correlation id: ${amqpMsg.properties.correlationId}`);
  }
}
```

### Selecting channel for handler

You can optionally select channel which handler uses to consume messages from.

Set the `queueOptions.channel` to the name of the channel to enable this feature. If channel does not exist or you haven't specified one, it will use the default channel. For channel to exist it needs to be created in module config.

```typescript
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
```

## Publising Messages (Fire and Forget)

Sử dụng publish method

```typescript
public publish<T = any>(
  exchange: string,
  routingKey: string,
  message: T,
  options?: amqplib.Options.Publish
)
```

Ví dụ:

```typescript
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


```

