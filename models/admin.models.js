const fs = require("fs");
const jwt = require("jsonwebtoken");
const { genSalt, hash, compare } = require("bcrypt");
const runQuery = require("../helper/queryRunner");

const saltRounds = Number(process.env.SALT_ROUNDS);
let privateKey = fs.readFileSync("./private.pem", "utf8");
// constructor
const admin = function(admin) {
  this.email = admin.email;
  this.name = admin.name;
  this.password = admin.password;
};

admin.create = async (newAdmin, result) => {
  try {
    const salt = await genSalt(saltRounds);
    newAdmin.password = await hash(newAdmin.password, salt);
    const res = await runQuery("INSERT INTO admin SET ?", newAdmin);
    const token = jwt.sign(
      {
        id: res.insertId
      },
      privateKey,
      {
        algorithm: "HS256",
        expiresIn: "3h"
      }
    );
    return result(null, {
      id: res.insertId,
      token: token,
      name: newAdmin.name,
      active: res.active
    });
  } catch (err) {
    return result(err, null);
  }
};

admin.loginAdmin = async ({ email, password }, result) => {
  try {
    const res = (
      await runQuery(
        "SELECT admin_id, password, name, email, created_at FROM admin WHERE email = ?",
        email
      )
    )[0];
    if (res.length == 0) {
      // not found Admin with the id
      return result(
        {
          kind: "not_found",
          type: "email"
        },
        null
      );
    }
    const isCorrect = await compare(password, res.password);
    if (!isCorrect) {
      return result(
        {
          kind: "incorrect_password"
        },
        null
      );
    }
    const token = jwt.sign(
      {
        id: res.admin_id
      },
      privateKey,
      {
        algorithm: "HS256",
        expiresIn: "3h"
      }
    );
    return result(null, {
      token: token,
      admin_id: res.admin_id,
      name: res.name
    });
  } catch (err) {
    return result(err, null);
  }
};

// TODO: We need to find a way to make sure duplicate questions don't get stored in question_bank - Implement some kind of fuzzy match
admin.addQuestion = async (newQuestion, result) => {
  try {
    const res = await runQuery("INSERT INTO question_bank SET ?", newQuestion);
    return result(null, {
      id: res.insertId,
      ...newQuestion
    });
  } catch (err) {
    return result(err, null);
  }
};

module.exports = admin;
