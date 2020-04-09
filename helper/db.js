const { createPool } = require("mysql");
require("dotenv").config();

const pool = createPool({
  host: process.env.LOCAL_HOSTNAME,
  user: process.env.LOCAL_USERNAME,
  password: process.env.LOCAL_PASSWORD,
  port: process.env.LOCAL_PORT,
  database: process.env.LOCAL_DBNAME,
  connectionLimit: Number(process.env.SQL_CONNECTION_LIMIT)
});

module.exports = pool;
