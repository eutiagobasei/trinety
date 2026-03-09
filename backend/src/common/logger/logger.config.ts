import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, context, trace, ...meta }) => {
  let log = `${timestamp} [${level}]`;

  if (context) {
    log += ` [${context}]`;
  }

  log += `: ${message}`;

  if (Object.keys(meta).length > 0) {
    log += ` ${JSON.stringify(meta)}`;
  }

  if (trace) {
    log += `\n${trace}`;
  }

  return log;
});

const jsonFormat = printf(({ level, message, timestamp, context, trace, ...meta }) => {
  return JSON.stringify({
    timestamp,
    level,
    context,
    message,
    trace,
    ...meta,
  });
});

export const loggerConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? combine(timestamp(), errors({ stack: true }), jsonFormat)
          : combine(
              colorize({ all: true }),
              timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              errors({ stack: true }),
              logFormat,
            ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), errors({ stack: true }), jsonFormat),
      maxsize: 10485760,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), errors({ stack: true }), jsonFormat),
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
};
