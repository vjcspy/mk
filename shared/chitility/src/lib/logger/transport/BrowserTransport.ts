import type * as winston from 'winston';
import TransportStream = require('winston-transport');
import type { AbstractConfigSetLevels } from 'winston/lib/winston/config';

export const BrowserLevel: AbstractConfigSetLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 4,
};
export default class BrowserConsole extends TransportStream {
  private methods = {
    debug: 'debug',
    error: 'error',
    info: 'info',
    warn: 'warn',
  };

  constructor(opts?: TransportStream.TransportStreamOptions) {
    super(opts);

    // eslint-disable-next-line no-prototype-builtins
    if (opts && opts.level && BrowserLevel.hasOwnProperty(opts.level)) {
      this.level = opts.level;
    }
  }

  public log(logEntry: winston.LogEntry, next: () => void) {
    // (window as any).l = logEntry;
    setImmediate(() => {
      (this as any).emit('logged', logEntry);
    });

    // @ts-ignore
    const level = logEntry[Symbol.for('level')];
    // @ts-ignore
    const message = logEntry[Symbol.for('message')];
    // @ts-ignore
    const splat = logEntry[Symbol.for('splat')] ?? [];
    const mappedMethod = this.methods[level];
    console[mappedMethod](message, ...splat);

    next();
  }
}
