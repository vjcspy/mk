import { getAppName, getInstanceId } from '@lib/core/config/base.config';
import type { LoggerService } from '@nestjs/common';
import { utilities, WinstonModule } from 'nest-winston';
import { Logger as SplunkLogger } from 'splunk-logging';
import * as winston from 'winston';
import * as TransportStream from 'winston-transport';

class SplunkTransport extends TransportStream {
  private maxError = 10;

  private errorCount = 0;

  private enable = false;

  private name: string;

  private defaultMetadata: any;

  private server: SplunkLogger;

  constructor(config) {
    super(config);

    if (config?.enable !== 'true' && config?.enable !== true) {
      return;
    }

    if (config?.url && config?.token) {
      // This gets around a problem with setting maxBatchCount
      this.server = new SplunkLogger({
        maxBatchCount: 1,
        token: config.token,
        url: config.url,
      });
      this.enable = true;
    } else {
      return;
    }

    this.name = 'SplunkStreamEvent';
    this.level = config.level || 'info';

    this.defaultMetadata = {
      source: config?.source ?? getAppName(),
      sourcetype: '_json',
      index: config.index,
    };
    if (config?.splunk?.source) {
      this.defaultMetadata.source = config.splunk.source;
    }
    if (config?.splunk?.sourcetype) {
      this.defaultMetadata.sourcetype = config.splunk.sourcetype;
    }
    if (config?.splunk?.index) {
      this.defaultMetadata.index = config.splunk.index;
    }

    // Override the default event formatter
    if (config?.splunk?.eventFormatter) {
      this.server.eventFormatter = config.splunk.eventFormatter;
    } else {
      this.server.eventFormatter = (message, severity) => {
        if (typeof message === 'string') {
          // eslint-disable-next-line no-param-reassign
          message = {
            message,
          };
        }
        return {
          ...message,
          severity,
        };
      };
    }
  }

  log(info, callback) {
    if (!this.enable || this.maxError < this.errorCount) {
      callback(null, true);
      return;
    }

    const self = this;
    const level = info[Symbol.for('level')];
    const meta = { ...info };
    delete meta[Symbol.for('level')];
    delete meta[Symbol.for('splat')];
    delete meta[Symbol.for('message')];

    const splunkInfo = info.splunk || {};

    const payload = {
      message: meta,
      metadata: { ...this.defaultMetadata, ...splunkInfo },
      severity: level,
    };

    this.server.send(payload, (error) => {
      self.emit('logged');
      if (error) {
        // eslint-disable-next-line no-console
        console.error('splunk forward error', error);
        this.errorCount += 1;
      }
      callback(null, true);
    });
  }
}

let logger: LoggerService;
export const initLoggerInstance = (config: {
  splunk: {
    enable: string;
    token: string; // token được tạo từ HEC config
    url: string;
    index: string; // index phải được create trước ở splunk, mỗi một token chỉ allow 1 số index nào đó
    source?: string; // source thì có thể là bất cứ giá trị nào, dùng để seperate mỗi trường
  };
}): LoggerService => {
  if (!logger) {
    logger = WinstonModule.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD hh:mm:ss',
        }),
        winston.format.json({
          space: 4,
          maximumBreadth: 1,
          maximumDepth: 1,
          circularValue: null,
        }),
      ),
      levels: winston.config.cli.levels,
      level: 'silly',
      defaultMeta: {
        iid: getAppName(),
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.ms(),
            winston.format.colorize({
              message: true,
              level: true,
              all: true,
              colors: {
                error: 'bold red',
                debug: 'blue',
                warn: 'underline yellow',
                data: 'magenta',
                info: 'white',
                verbose: 'cyan',
                silly: 'grey',
              },
            }),
            utilities.format.nestLike(getInstanceId(), {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
        // new winston.transports.File({
        //   format: winston.format.uncolorize(),
        //   filename: `logs/${getInstanceId()}.debug.log`,
        //   level: 'debug',
        // }),
        // new winston.transports.File({
        //   format: winston.format.uncolorize(),
        //   filename: `logs/${getInstanceId()}.info.log`,
        //   level: 'info',
        // }),
        // new winston.transports.File({
        //   format: winston.format.uncolorize(),
        //   filename: `logs/${getInstanceId()}.error.log`,
        //   level: 'error',
        // }),
        // new winston.transports.File({
        //   format: winston.format.uncolorize(),
        //   filename: 'logs/combined.log',
        // }),
        new SplunkTransport({
          enable: config?.splunk?.enable,
          url: config?.splunk?.url,
          token: config?.splunk?.token,
          index: config?.splunk?.index,
          source: config?.splunk?.source,
        }),
      ],
    });
  }

  return logger;
};

export const getLoggerInstance = () => logger;
