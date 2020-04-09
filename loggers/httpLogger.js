const morgan = require("morgan");
const { logger } = require("./logger");

logger.stream = {
  write: message => logger.info(message.substring(0, message.lastIndexOf("\n")))
};

module.exports = {
  httpLogger: morgan(
    ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
    {
      stream: logger.stream
    }
  )
};
