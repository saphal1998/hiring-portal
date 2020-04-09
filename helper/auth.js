const jwt = require("jsonwebtoken");
const fs = require("fs");
let privateKey = fs.readFileSync("./private.pem", "utf8");

const isAuthenticatedCandidate = (req, res, next) => {
  if (typeof req.headers.authorization !== "undefined") {
    // retrieve the authorization header and parse out the
    // JWT using the split function
    const token = req.headers.authorization.split(" ")[1];
    // Here we validate that the JSON Web Token is valid and has been
    // created using the same private pass phrase
    jwt.verify(
      token,
      privateKey,
      {
        algorithm: "HS256"
      },
      (err, user) => {
        // if there has been an error...
        if (err) {
          // shut them out!
          res.status(500).json({
            error: "Bad Request"
          });
          throw new Error("Bad Request");
        }
        if (Number(req.headers.candidate_id) !== user.id) {
          res.status(403).json({
            error: "Bad Request"
          });
          throw new Error("Bad Request");
        }
        // if the JWT is valid, allow them to hit
        // the intended endpoint
        return next();
      }
    );
  } else {
    // No authorization header exists on the incoming
    // request, return Bad Request and throw a new error
    res.status(401).json({
      error: "Bad Request"
    });
    throw new Error("Bad Request");
  }
};

const isAuthenticatedCompany = (req, res, next) => {
  if (typeof req.headers.authorization !== "undefined") {
    // retrieve the authorization header and parse out the
    // JWT using the split function
    const token = req.headers.authorization.split(" ")[1];
    // Here we validate that the JSON Web Token is valid and has been
    // created using the same private pass phrase
    jwt.verify(
      token,
      privateKey,
      {
        algorithm: "HS256"
      },
      (err, user) => {
        // if there has been an error...
        if (err) {
          // shut them out!
          res.status(500).json({
            error: "Bad Request"
          });
          throw new Error("Bad Request");
        }

        if (Number(req.headers.company_id) !== user.id) {
          res.status(403).json({
            error: "Bad Request"
          });
          throw new Error("Bad Request");
        }
        // if the JWT is valid, allow them to hit
        // the intended endpoint
        return next();
      }
    );
  } else {
    // No authorization header exists on the incoming
    // request, return Bad Request and throw a new error
    res.status(401).json({
      error: "Bad Request"
    });
    throw new Error("Bad Request");
  }
};

const isAuthenticatedAdmin = (req, res, next) => {
  if (typeof req.headers.authorization !== "undefined") {
    // retrieve the authorization header and parse out the
    // JWT using the split function
    const token = req.headers.authorization.split(" ")[1];
    // Here we validate that the JSON Web Token is valid and has been
    // created using the same private pass phrase
    jwt.verify(
      token,
      privateKey,
      {
        algorithm: "HS256"
      },
      (err, user) => {
        // if there has been an error...
        if (err) {
          // shut them out!
          res.status(500).json({
            error: "Bad Request"
          });
          throw new Error("Bad Request");
        }

        if (Number(req.headers.admin_id) !== user.id) {
          res.status(403).json({
            error: "Bad Request"
          });
          throw new Error("Bad Request");
        }
        // if the JWT is valid, allow them to hit
        // the intended endpoint
        return next();
      }
    );
  } else {
    // No authorization header exists on the incoming
    // request, return Bad Request and throw a new error
    res.status(401).json({
      error: "Bad Request"
    });
    throw new Error("Bad Request");
  }
};

module.exports = {
  isAuthenticatedCandidate,
  isAuthenticatedAdmin,
  isAuthenticatedCompany
};
