const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { httpLogger } = require("./loggers/httpLogger");
const { logger } = require("./loggers/logger");
const runQuery = require("./helper/queryRunner");

const app = express();
require("dotenv").config();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
// Change to Domain
app.use(
  cors({
    origin: `*`
  })
);
app.use(httpLogger);

// Import middleware
require("./routers/candidate.routers")(app);
require("./routers/job.routers")(app);
require("./routers/company.routers")(app);
require("./routers/admin.routers")(app);

app.get("*", (req, res) => {
  res.status("404");
  res.json({
    errorCode: "404",
    name: "Millow",
    errorMessage: "Page not found."
  });
});

app.use(function(err, req, res, next) {
  if (err.isBoom) {
    return res.status(err.output.statusCode).json(err.output.payload);
  }
});

app.listen(process.env.APP_PORT, async () => {
  try {
    const millowId = await runQuery(
      `SELECT company_id FROM company WHERE hr_email = ?`,
      process.env.MILLOW_EMAIL
    );
    process.env.MILLOW_ID = millowId[0].company_id;
  } catch (err) {
    console.log(err);
  }
  logger.info(`Server listening on port ${process.env.APP_PORT}`);
});
