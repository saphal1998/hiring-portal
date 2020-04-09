const admin = require("../models/admin.models.js");

exports.create = async (req, res) => {
  const adminNew = {
    email: req.body.email,
    name: req.body.name,
    password: req.body.password
  };

  admin.create(adminNew, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Admin."
      });
    else
      res.status(201).send({
        status: "OK",
        admin_id: data.id,
        token: data.token
      });
  });
};

exports.login = (req, res) => {
  const adminNew = {
    email: req.body.email,
    password: req.body.password
  };
  admin.loginAdmin(adminNew, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Admin with ${err.type}.`
        });
      } else if (err.kind === "incorrect_password") {
        res.status(401).send({
          message: `Incorrect password : ${req.body.password}`
        });
      }
    } else res.status(200).send(data);
  });
};

exports.addQuestion = (req, res) => {
  const question = {
    job_type_id: req.headers.job_type_id,
    question: req.body.question,
    time: req.body.time,
    options: req.body.options,
    answer: req.body.answer
  };
  admin.addQuestion(question, (err, data) => {
    if (err) {
      return res.status(500).send({
        message:
          err.message || "Some error occured during addition of this question"
      });
    } else {
      res.status(201).send({
        status: "OK",
        question: data
      });
    }
  });
};
