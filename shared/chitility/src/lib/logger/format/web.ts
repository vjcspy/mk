import type { Format } from 'logform';
import { format } from 'winston';

export type WebFormatOptions = {
  colors?: boolean;
  prettyPrint?: boolean;
};

const clc = {
  bold: (text: string) => `\x1B[1m${text}\x1B[0m`,
  green: (text: string) => `\x1B[32m${text}\x1B[39m`,
  yellow: (text: string) => `\x1B[33m${text}\x1B[39m`,
  red: (text: string) => `\x1B[31m${text}\x1B[39m`,
  magentaBright: (text: string) => `\x1B[95m${text}\x1B[39m`,
  cyanBright: (text: string) => `\x1B[96m${text}\x1B[39m`,
};

const nestLikeColorScheme: Record<string, (text: string) => string> = {
  info: clc.green,
  error: clc.red,
  warn: clc.yellow,
  debug: clc.magentaBright,
  verbose: clc.cyanBright,
};

export const webConsoleFormat = (options: WebFormatOptions): Format => {
  const { colors = !process.env.NO_COLOR } = options;

  return format.printf((info) => {
    // eslint-disable-next-line prefer-const
    let { level, timestamp, message, ms, context } = info;
    if (typeof timestamp !== 'undefined') {
      // Only format the timestamp to a locale representation if it's ISO 8601 format. Any format
      // that is not a valid date string will throw, just ignore it (it will be printed as-is).
      try {
        if (timestamp === new Date(timestamp).toISOString()) {
          timestamp = new Date(timestamp).toLocaleString();
        }
      } catch (error) {
        // eslint-disable-next-line no-empty
      }
    }

    // Text color
    let color = (text: string): string => text;
    if (colors) {
      // @ts-ignore
      color = nestLikeColorScheme[info[Symbol.for('level')]];
    }

    const yellow = colors ? clc.yellow : (text: string): string => text;

    // const stringifiedMeta = safeStringify(meta);
    // const formattedMeta = options.prettyPrint
    //   ? inspect(JSON.parse(stringifiedMeta), {
    //       colors: options.colors,
    //       depth: null,
    //     })
    //   : stringifiedMeta;

    return (
      `${yellow(level.charAt(0).toUpperCase() + level.slice(1))}\t${
        typeof timestamp !== 'undefined' ? `${timestamp} ` : ''
      }${
        typeof context !== 'undefined' ? `${yellow(`[${context}]`)} ` : ''
      }${color(message)} - ` +
      `${typeof ms !== 'undefined' ? ` ${yellow(ms)}` : ''}`
    );
  });
};
