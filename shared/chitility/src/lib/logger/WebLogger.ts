import type { LeveledLogMethod } from 'winston';
import winston from 'winston';

import { webConsoleFormat } from './format/web';
import type { LoggerConfig } from './Logger';
import { Logger } from './Logger';
import BrowserConsole, { BrowserLevel } from './transport/BrowserTransport';

export type WebLoggerConfig = {} & LoggerConfig;

export class WebLogger extends Logger {
  constructor(config: WebLoggerConfig | string) {
    if (typeof config === 'string') {
      // eslint-disable-next-line no-param-reassign
      config = {
        type: 'web',
        context: config,
      };
    }
    if (typeof config?.level === 'undefined') {
      // eslint-disable-next-line no-param-reassign
      config.level = 'debug';
    }
    super(config);
  }

  createWinston() {
    return winston.createLogger({
      levels: BrowserLevel,
      level: this.level,
      transports: [
        new BrowserConsole({
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
            webConsoleFormat({
              colors: true,
            }),
          ),
        }),
        ...this.transports,
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
      ],
    });
  }

  render: LeveledLogMethod = (message: any, ...args: any[]) => {
    this.getInstance().defaultMeta = {
      ...this.getInstance().defaultMeta,
      logRender: true,
    };
    return this.getInstance().debug(message, ...args);
  };
}
