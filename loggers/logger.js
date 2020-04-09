const { createLogger, transports, format } = require("winston");
const date = new Date();
const logger = createLogger({
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss:ms"
    }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.File({
      filename: `./logs/${String(date.getDate()) +
        "-" +
        String(date.getMonth()) +
        "-" +
        String(date.getFullYear())}.log`,
      json: false,
      maxsize: 5242880,
      maxFiles: 5
    }),
    new transports.Console()
  ]
});

module.exports = {
  logger
};
