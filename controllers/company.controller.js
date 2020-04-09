const Company = require("../models/company.models");
const { genSalt, hash, compare } = require("bcrypt");

exports.create = async (req, res) => {
  const company = new Company({
    hr_email: req.body.hr_email,
    name: req.body.name,
    password: req.body.password,
    website: req.body.website,
    description: req.body.description,
    year_founded: req.body.year_founded,
    team_size: req.body.team_size,
    CEO: req.body.CEO,
    CEO_social: req.body.CEO_social
  });

  Company.create(company, req.body.tags, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Company."
      });
    else
      res.status(201).send({
        status: "OK",
        company_id: data.id,
        token: data.token
      });
  });
};

exports.login = (req, res) => {
  const company = {
    hr_email: req.body.hr_email,
    password: req.body.password
  };

  Company.loginCompany(company, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Company with ${err.type}.`
        });
      } else if (err.kind === "incorrect_password") {
        res.status(401).send({
          message: `Incorrect password : ${req.body.password}`
        });
      }
    } else res.status(200).send(data);
  });
};

exports.getJobs = (req, res) => {
  Company.getJobs(req.headers.company_id, (err, data) => {
    if (err) {
      if (err.kind == "not_found")
        res.status(404).send({
          message: "No jobs found!"
        });
      else
        res.status(500).send({
          message: err.message || "Some error occurred while fetching jobs."
        });
    } else
      res.status(200).send({
        status: "OK",
        jobs: data
      });
  });
};

exports.info = (req, res) => {
  Company.info(req.headers.company_id, (err, data) => {
    if (err) {
      if (err.kind == "not_found")
        res.status(404).send({
          message: "No company info found!"
        });
      else
        res.status(500).send({
          message: err.message || "Some error occurred while getting info."
        });
    } else
      res.status(200).send({
        status: "OK",
        info: data
      });
  });
};

exports.addTags = (req, res) => {
  Company.addTags(req.headers.company_id, req.body.tags, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while adding tags"
      });
    }
    res.status(200).send(data);
  });
};

exports.questionAddTags = (req, res) => {
  Company.questionAddTags(
    req.headers.question_id,
    req.body.tags,
    (err, data) => {
      if (err) {
        return res.status(500).send({
          message: err.message || "Some error occurred while adding tags"
        });
      }
      res.status(200).send(data);
    }
  );
};

exports.addMoreInfo = (req, res) => {
  const moreInfo = {
    info: req.body.info,
    tag: req.body.tag,
    url: req.body.url
  };
  Company.addMoreInfo(req.headers.company_id, moreInfo, (err, data) => {
    if (err) {
      return res.status(500).send({
        message:
          err.message ||
          "Some error occurred while adding more information for the company"
      });
    }
    res.status(200).send(data);
  });
};

exports.mediaUpload = (req, res) => {
  const mediaInfo = {
    resource: req.body.resource,
    file: req.file
  };
  Company.mediaUpload(req.headers.company_id, mediaInfo, (err, data) => {
    if (err) {
      return res.status(500).send({
        message:
          err.message ||
          "Some error occurred while adding media for the company"
      });
    }
    res.status(200).send(data);
  });
};

exports.addQuestion = (req, res) => {
  const question = {
    company_id: req.headers.company_id,
    question: req.body.question,
    time: req.body.time,
    options: req.body.options,
    answer: req.body.answer
  };
  Company.addQuestion(question, req.body.tags, (err, data) => {
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
