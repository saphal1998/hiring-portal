const Candidate = require("../models/candidate.models.js");

// Create and Save a new Candidate
exports.create = (req, res) => {
  // Create a Candidate
  const candidate = new Candidate({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    phone_number: req.body.phone_number
  });
  // Save Candidate in the database
  Candidate.create(candidate, req.body.tags, (err, data) => {
    if (err)
      return res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Candidate."
      });
    else
      res.status(201).send({
        status: "OK",
        candidate_id: data.id,
        token: data.token
      });
  });
};

exports.login = (req, res) => {
  const candidate = {
    email: req.body.email,
    password: req.body.password,
    phone_number: req.body.phone_number
  };
  Candidate.loginCandidate(candidate, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({
          message: `Not found Candidate with ${err.type}.`
        });
      } else if (err.kind === "incorrect_password") {
        return res.status(401).send({
          message: `Incorrect password : ${req.body.password}`
        });
      }
    } else return res.status(200).send(data);
  });
};

exports.forgotPassword = (req, res) => {
  const candidateDetails = {
    email: req.body.email,
    phone_number: req.body.phone_number
  };
  Candidate.forgotPassword(candidateDetails, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({
          message: `Not found Candidate with ${err.type}.`
        });
      }
    } else return res.status(200).send(data);
  });
};

exports.validateToken = (req, res) => {
  const candidateDetails = {
    email: req.body.email,
    phone_number: req.body.phone_number,
    token: req.headers.token,
    new_password: req.body.new_password
  };
  Candidate.validateToken(candidateDetails, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(400).send({
          message: `Could not find candidate with ${err.type}`
        });
      }
      if (err.kind === "invalid_token") {
        return res.status(410).send({
          message: `The token passed was either expired or invalid`
        });
      }
      return res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Candidate."
      });
    } else {
      return res.status(200).send(data);
    }
  });
};

exports.getAllJobs = (req, res) => {
  Candidate.getAllJobs(req.headers.candidate_id, (err, data) => {
    if (err) {
      return res.status(503).send({
        message: `Some error occured in fetching the jobs`
      });
    }
    return res.status(200).send(data);
  });
};

exports.getProfile = (req, res) => {
  Candidate.getProfile(req.headers.candidate_id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({
          message: `Could not find any jobs for this candidate with ${err.type}.`
        });
      }
      return res.status(500).send({
        message: err.message || "Some error occurred while applying for job"
      });
    }
    res.status(200).send(data);
  });
};

exports.addTags = (req, res) => {
  Candidate.addTags(req.headers.candidate_id, req.body.tags, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Some error occurred while adding tags"
      });
    }
    res.status(200).send(data);
  });
};

exports.getApplied = (req, res) => {
  Candidate.getApplied(req.headers.candidate_id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({
          message: `Could not find any jobs for this candidate with ${err.type}.`
        });
      }
      return res.status(500).send({
        message: err.message || "Some error occurred while applying for job"
      });
    } else return res.status(200).send(data);
  });
};

exports.applyJob = (req, res) => {
  const candidate_job = {
    candidate_id: req.headers.candidate_id,
    job_id: req.headers.job_id
  };
  Candidate.applyJob(candidate_job, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({
          message: `Could not find job or candidate.`
        });
      }
      return res.status(500).send({
        message: err.message || "Some error occurred while applying for job"
      });
    } else return res.status(200).send(data);
  });
};

exports.jobStatus = (req, res) => {
  const candidate_job = {
    candidate_id: req.headers.candidate_id,
    job_id: req.headers.job_id
  };
  Candidate.jobStatus(candidate_job, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({
          message: `Could not find job or candidate.`
        });
      }
      return res.status(500).send({
        message: err.message || "Some error occurred while getting job Status"
      });
    } else return res.send(data);
  });
};
