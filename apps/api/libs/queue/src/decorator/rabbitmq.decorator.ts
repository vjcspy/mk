import { RABBIT_HANDLER } from '@lib/queue/config/rabbitmq.config';
import type { RabbitHandlerConfig } from '@lib/queue/model/interface/rabbitmq.interface';
import { applyDecorators, SetMetadata } from '@nestjs/common';

export const makeRabbitDecorator =
  <T extends Partial<RabbitHandlerConfig>>(input: T) =>
  (
    config: Pick<
      RabbitHandlerConfig,
      Exclude<keyof RabbitHandlerConfig, keyof T>
    >,
  ) =>
    applyDecorators(SetMetadata(RABBIT_HANDLER, { ...input, ...config }));

export const RabbitHandler =
  (config: RabbitHandlerConfig) => (target, key, descriptor) =>
    SetMetadata(RABBIT_HANDLER, config)(target, key, descriptor);

export const RabbitSubscribe = makeRabbitDecorator({ type: 'subscribe' });

export const RabbitRPC = makeRabbitDecorator({ type: 'rpc' });
