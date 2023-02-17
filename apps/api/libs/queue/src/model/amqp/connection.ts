import {
  defaultAssertQueueErrorHandler,
  getHandlerForLegacyBehavior,
  MessageHandlerErrorBehavior,
} from '@lib/queue/model/amqp/error-behavior';
import type { RpcResponse } from '@lib/queue/model/amqp/handler-response';
import { Nack } from '@lib/queue/model/amqp/handler-response';
import type {
  MessageHandlerOptions,
  RabbitMQChannelConfig,
  RabbitMQConfig,
  SubscriberHandler,
} from '@lib/queue/model/interface/rabbitmq.interface';
import type { LoggerService } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import type {
  AmqpConnectionManager,
  ChannelWrapper,
} from 'amqp-connection-manager';
import { connect } from 'amqp-connection-manager';
import type {
  ConfirmChannel,
  Connection,
  ConsumeMessage,
  Options,
  Replies,
} from 'amqplib';
import * as _ from 'lodash';

const defaultConfig: RabbitMQConfig = {
  name: 'default',
  prefetchCount: 1,
  defaultExchangeType: 'topic',
  defaultRpcErrorBehavior: MessageHandlerErrorBehavior.REQUEUE,
  defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.REQUEUE,
  exchanges: [],
  defaultRpcTimeout: 10000,
  connectionInitOptions: {
    wait: true,
    timeout: 5000,
    reject: true,
  },
  connectionManagerOptions: {},
  registerHandlers: true,
  enableDirectReplyTo: true,
  channels: {},
  handlers: [],
  enableControllerDiscovery: false,
};
export class AmqpConnection {
  private readonly logger: LoggerService;

  private readonly config: RabbitMQConfig;

  private _managedConnection!: AmqpConnectionManager;

  /**
   * Will now specify the default managed channel.
   */
  private _managedChannel!: ChannelWrapper;

  private _managedChannels: Record<string, ChannelWrapper> = {};

  /**
   * Will now specify the default channel.
   */
  private _channel: ConfirmChannel;

  private _channels: Record<string, ConfirmChannel> = {};

  private _connection?: Connection;

  constructor(config: RabbitMQConfig) {
    this.config = {
      deserializer: (message) => JSON.parse(message.toString()),
      serializer: (value) => Buffer.from(JSON.stringify(value)),
      logger: config.logger || new Logger(AmqpConnection.name),
      ...defaultConfig,
      ...config,
    };

    this.logger = this.config.logger;
  }

  get configuration() {
    return this.config;
  }

  /**
   * Se duoc call khi app bootstrap de tao connection va channel
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.configuration.uri) {
      this._managedConnection = connect(
        this.configuration.uri,
        this.config.connectionManagerOptions,
      );
      this._managedConnection.on('connect', ({ connection }) => {
        this._connection = connection;
        this.logger.log(
          `Successfully connected to RabbitMQ broker (${this.config.name})`,
        );
      });

      this._managedConnection.on('disconnect', ({ err }) => {
        this.logger.error(
          `Disconnected from RabbitMQ broker (${this.config.name})`,
          err?.stack,
        );
      });

      const defaultChannel: { name: string; config: RabbitMQChannelConfig } = {
        name: AmqpConnection.name,
        config: {
          prefetchCount: this.config.prefetchCount,
          default: true,
        },
      };

      if (this.configuration?.channels) {
        await Promise.all([
          Object.keys(this.config.channels).map(async (channelName) => {
            const config = this.config.channels[channelName];

            // Only takes the first channel specified as default so other ones get created.
            if (defaultChannel.name === AmqpConnection.name && config.default) {
              defaultChannel.name = channelName;
              defaultChannel.config.prefetchCount =
                config.prefetchCount || this.config.prefetchCount;
              return;
            }

            return this.setupManagedChannel(channelName, {
              ...config,
              prefetchCount: config.prefetchCount || this.config.prefetchCount,
              default: false,
            });
          }),
          // default channel is always created
          this.setupManagedChannel(defaultChannel.name, defaultChannel.config),
        ]);
      }
    }
  }

  private async setupManagedChannel(
    name: string,
    config: RabbitMQChannelConfig,
  ) {
    const channel = this._managedConnection.createChannel({
      name,
      json: config.json === true,
    });

    this._managedChannels[name] = channel;

    if (config.default) {
      this._managedChannel = channel;
    }

    channel.on('connect', () =>
      this.logger.log(`Successfully connected a RabbitMQ channel "${name}"`),
    );

    // eslint-disable-next-line @typescript-eslint/no-shadow
    channel.on('error', (err, { name }) =>
      this.logger.log(
        `Failed to setup a RabbitMQ channel - name: ${name} / error: ${err.message} ${err.stack}`,
      ),
    );

    channel.on('close', () =>
      this.logger.log(`Successfully closed a RabbitMQ channel "${name}"`),
    );

    return channel.addSetup((c) => this.preConfigChannel(c, name, config));
  }

  /**
   * Khi channel duoc created thi se config truoc mot so gia tri chung vi du nhu: prefetch, exchange...
   *
   * @param channel
   * @param name
   * @param config
   * @returns {Promise<void>}
   */
  private async preConfigChannel(
    channel: ConfirmChannel,
    name: string,
    config: RabbitMQChannelConfig,
  ): Promise<void> {
    this._channels[name] = channel;

    await channel.prefetch(config.prefetchCount || this.config.prefetchCount);

    this._channel = channel;

    for (let i = 0; i < this.config.exchanges.length; i++) {
      const x = this.config.exchanges[i];
      try {
        await channel.assertExchange(
          x.name,
          x.type || this.config.defaultExchangeType,
          x.options,
        );
      } catch (e) {
        this.logger.error(`Failed create exchange name ${x.name}`);
      }
    }
  }

  /**
   * Declare RPC
   *
   * @param handler
   * @param rpcOptions
   * @returns {Promise<void>}
   */
  public async createRpc<T, U>(
    handler: (
      msg: T | undefined,
      rawMessage?: ConsumeMessage,
      headers?: any,
    ) => Promise<RpcResponse<U>>,
    rpcOptions: MessageHandlerOptions,
  ): Promise<any> {
    // TODO: implement for RPC
    this.logger.warn(
      'Not yet implemented RPC for rabbitmq',
      handler,
      rpcOptions,
    );
  }

  /**
   * Selects managed channel based on name, if not found uses default.
   * @param name name of the channel
   * @returns channel wrapper
   */
  private selectManagedChannel(name?: string): ChannelWrapper {
    if (!name) return this._managedChannel;
    const channel = this._managedChannels[name];
    if (!channel) {
      this.logger.warn(
        `Channel "${name}" does not exist, using default channel.`,
      );

      return this._managedChannel;
    }
    return channel;
  }

  /**
   * Declare consumer
   *
   * @param handler
   * @param msgOptions
   * @param originalHandlerName
   * @returns {Promise<unknown>}
   */
  public async createSubscriber<T>(
    handler: SubscriberHandler<T>,
    msgOptions: MessageHandlerOptions,
    originalHandlerName: string,
  ): Promise<any> {
    return new Promise((res) => {
      let result: any;
      this.selectManagedChannel(msgOptions?.queueOptions?.channel)
        .addSetup(async (channel) => {
          const consumerTag = await this.setupSubscriberChannel<T>(
            handler,
            msgOptions,
            channel,
            originalHandlerName,
          );
          result = { consumerTag };
        })
        .then(() => {
          res(result);
        });
    });
  }

  /**
   * Create queue and bind to exchange
   *
   * @param subscriptionOptions
   * @param channel
   * @returns {Promise<string>}
   */
  private async setupQueue(
    subscriptionOptions: MessageHandlerOptions,
    channel: ConfirmChannel,
  ): Promise<string> {
    const {
      exchange,
      routingKey,
      createQueueIfNotExists = true,
      assertQueueErrorHandler = defaultAssertQueueErrorHandler,
      queueOptions,
      queue: queueName,
    } = subscriptionOptions;

    let actualQueue: string;

    if (createQueueIfNotExists) {
      try {
        const { queue } = await channel.assertQueue(queueName, queueOptions);
        actualQueue = queue;
      } catch (error) {
        actualQueue = await assertQueueErrorHandler(
          channel,
          queueName,
          queueOptions,
          error,
        );
      }
    } else {
      const { queue } = await channel.checkQueue(queueName);
      actualQueue = queue;
    }

    const bindQueueArguments =
      subscriptionOptions.queueOptions?.bindQueueArguments;

    const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey];

    if (exchange && routingKeys && actualQueue) {
      const configuredExchange = _.find(
        this.config.exchanges,
        (cx) => cx.name === exchange,
      );
      if (!configuredExchange) {
        this.logger.error(
          `Error when try to bind queue due to exchange name ${exchange} has not been configured`,
        );
        return;
      }
      await Promise.all(
        routingKeys.map((_routingKey) => {
          if (routingKey != null) {
            return channel.bindQueue(
              actualQueue as string,
              exchange,
              _routingKey,
              bindQueueArguments,
            );
          }

          return undefined;
        }),
      );
    }

    return actualQueue;
  }

  private handleMessage<T>(
    handler: (
      msg: T | undefined,
      rawMessage?: ConsumeMessage,
      headers?: any,
    ) => Promise<any>,
    msg: ConsumeMessage,
    allowNonJsonMessages?: boolean,
  ) {
    let message: T | undefined;
    let headers: any;
    if (msg.content) {
      if (allowNonJsonMessages) {
        try {
          message = this.config.deserializer(msg.content) as T;
        } catch {
          // Let handler handle parsing error, it has the raw message anyway
          message = undefined;
        }
      } else {
        message = this.config.deserializer(msg.content) as T;
      }
    }

    if (msg.properties && msg.properties.headers) {
      headers = msg.properties.headers;
    }

    return handler(message, msg, headers);
  }

  private async setupSubscriberChannel<T>(
    handler: SubscriberHandler<T>,
    msgOptions: MessageHandlerOptions,
    channel: ConfirmChannel,
    originalHandlerName = 'unknown',
  ): Promise<any> {
    // Create queue and bind to exchange
    const queue = await this.setupQueue(msgOptions, channel);

    const { consumerTag } = await channel.consume(queue, async (msg) => {
      try {
        if (msg === null) {
          throw new Error('Received null message');
        }

        const response = await this.handleMessage(
          handler,
          msg,
          msgOptions.allowNonJsonMessages,
        );

        if (response instanceof Nack) {
          channel.nack(msg, false, response.requeue);
          return;
        }

        // developers should be responsible to avoid subscribers that return therefore
        // the request will be acknowledged
        if (response) {
          this.logger.warn(
            `Received response: [${this.config.serializer(
              response,
            )}] from subscribe handler [${originalHandlerName}]. Subscribe handlers should only return void`,
          );
        }

        channel.ack(msg);
      } catch (e) {
        if (msg === null) {
          /* empty */
        } else {
          const errorHandler =
            msgOptions.errorHandler ||
            getHandlerForLegacyBehavior(
              msgOptions.errorBehavior ||
                this.config.defaultSubscribeErrorBehavior,
            );

          await errorHandler(channel, msg, e);
        }
      }
    });

    return consumerTag;
  }

  public publish<T = any>(
    exchange: string,
    routingKey: string,
    message: T,
    options?: Options.Publish,
  ): Promise<Replies.Empty> {
    // source amqplib channel is used directly to keep the behavior of throwing connection related errors
    if (!this._managedConnection.isConnected() || !this._channel) {
      throw new Error('AMQP connection is not available');
    }

    let buffer: Buffer;
    if (message instanceof Buffer) {
      buffer = message;
    } else if (message instanceof Uint8Array) {
      buffer = Buffer.from(message);
    } else if (message != null) {
      buffer = this.config.serializer(message);
    } else {
      buffer = Buffer.alloc(0);
    }

    return new Promise((resolve, reject) => {
      this._channel.publish(
        exchange,
        routingKey,
        buffer,
        options,
        (err, ok) => {
          if (err) {
            reject(err);
          } else {
            resolve(ok);
          }
        },
      );
    });
  }
}
