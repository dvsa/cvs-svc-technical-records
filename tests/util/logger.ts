import { createLogger, format, transports } from "winston";

const { printf } = format;

const logFormat = printf((info) => {
  // Checks if log is an error - has stack info
  if (info.stack) {
    return `${info.level}: ${info.stack as string}`;
  }
  return `${info.level}: ${info.message}`;
});

const config = {
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
};

const logger = createLogger();
logger.add(new transports.Console(config));

export default logger;
