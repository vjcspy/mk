import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import rabbitmqConfig, {
  RABBIT_ARGS_METADATA,
  RABBIT_HANDLER,
} from '@lib/queue/config/rabbitmq.config';
import {
  AmqpConnectionManager,
  amqpConnectionManager,
} from '@lib/queue/model/amqp/connection-manager';
import type {
  RabbitHandlerConfig,
  RabbitMQConfig,
} from '@lib/queue/model/interface/rabbitmq.interface';
import type { OPTIONS_TYPE } from '@lib/queue/queue.module-definition';
import {
  MODULE_OPTIONS_TOKEN,
  QueueConfigurableModuleClass,
} from '@lib/queue/queue.module-definition';
import type { DynamicModule, OnApplicationBootstrap } from '@nestjs/common';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import * as _ from 'lodash';

@Module({
  imports: [ConfigModule.forFeature(rabbitmqConfig), DiscoveryModule],
  providers: [
    {
      provide: AmqpConnectionManager,
      useFactory: async (
        config: RabbitMQConfig,
      ): Promise<AmqpConnectionManager> => {
        amqpConnectionManager.config(config);
        return amqpConnectionManager;
      },
      inject: [MODULE_OPTIONS_TOKEN],
    },
  ],
  exports: [AmqpConnectionManager],
})
export class QueueModule
  extends QueueConfigurableModuleClass
  implements OnApplicationBootstrap
{
  private readonly logger = new Logger(QueueModule.name);

  private static handlers = [];

  private static bootstrapped = false;

  constructor(
    private readonly discover: DiscoveryService,
    private readonly externalContextCreator: ExternalContextCreator,
    private readonly connectionManager: AmqpConnectionManager,
  ) {
    super();
  }

  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.register(options);
    if (Array.isArray(options.handlers)) {
      dynamicModule.providers = [
        ...dynamicModule.providers,
        ...options.handlers,
      ];
      dynamicModule.exports = [
        ...(dynamicModule.exports ?? []),
        ...options.handlers,
      ];
      QueueModule.handlers = _.uniq([
        ...QueueModule.handlers,
        ...options.handlers,
      ]);
    }

    return dynamicModule;
  }

  public async onApplicationBootstrap() {
    if (QueueModule.bootstrapped) {
      return;
    }

    QueueModule.bootstrapped = true;
    for (let i = 0; i < this.connectionManager.getConnections().length; i++) {
      const connection = this.connectionManager.getConnections()[i];
      await connection.initialize();
    }

    const rabbitMeta =
      await this.discover.providerMethodsWithMetaAtKey<RabbitHandlerConfig>(
        RABBIT_HANDLER,
        (item) => {
          return _.find(
            QueueModule.handlers,
            (provider) => provider.name === item.name,
          );
        },
      );

    await Promise.all(
      rabbitMeta.map(async ({ meta, discoveredMethod }) => {
        const connectionName = meta?.connection ?? 'default';
        const connection = this.connectionManager.getConnection(connectionName);

        if (!connection) {
          this.logger.warn(
            `Connection ${connectionName} not found. Please register at least one configuration with uri property`,
          );

          return undefined;
        }

        const handler = this.externalContextCreator.create(
          discoveredMethod.parentClass.instance,
          discoveredMethod.handler,
          discoveredMethod.methodName,
          RABBIT_ARGS_METADATA,
          this.rpcParamsFactory,
          undefined, // contextId
          undefined, // inquirerId
          undefined, // options
          'rmq', // contextType
        );

        const { exchange, routingKey, queue, queueOptions } = meta;

        const handlerDisplayName = `${discoveredMethod.parentClass.name}.${
          discoveredMethod.methodName
        } {${meta.type}} -> ${
          queueOptions?.channel ? `${queueOptions.channel}::` : ''
        }${exchange}::${routingKey}::${queue || 'amqpgen'}`;

        if (
          meta.type === 'rpc' &&
          !connection.configuration.enableDirectReplyTo
        ) {
          this.logger.warn(
            `Direct Reply-To Functionality is disabled. RPC handler ${handlerDisplayName} will not be registered`,
          );
        }

        this.logger.log(handlerDisplayName);

        return meta.type === 'rpc'
          ? connection.createRpc(handler, meta)
          : connection.createSubscriber(
              handler,
              meta,
              discoveredMethod.methodName,
            );
      }),
    );
  }
}
