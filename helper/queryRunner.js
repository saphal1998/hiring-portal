const sql = require("./db");

const runQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    sql.query(query, params, (err, rows, fields) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

module.exports = runQuery;
