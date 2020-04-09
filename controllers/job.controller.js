const Job = require("../models/job.models");

exports.create = (req, res) => {
  const job = new Job({
    info: req.body.info,
    company_id: req.headers.company_id,
    test_time: req.body.test_time,
    total_questions: req.body.total_questions,
    video_time: req.body.video_time,
    video_num: req.body.video_num,
    obj_time: req.body.obj_time,
    obj_num: req.body.obj_num,
    sub_num: req.body.sub_num,
    sub_time: req.body.sub_time,
    ctc_min: req.body.ctc_min,
    ctc_max: req.body.ctc_max,
    experience_required_min: req.body.experience_required_min,
    experience_required_max: req.body.experience_required_max,
    notice_period: req.body.notice_period
  });
  Job.create(job, req.body.tags, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Job."
      });
    else
      res.status(201).send({
        status: "OK",
        job_id: data.id
      });
  });
};

exports.delete = (req, res) => {
  Job.delete(req.headers.job_id, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({
          message: "Job not found!"
        });
      } else
        res.status(500).send({
          message: err.message || "Some error occurred while deleting the Job."
        });
    } else
      res.status(200).send({
        status: "OK",
        job_id: data.id
      });
  });
};

exports.selectQuestion = (req, res) => {
  const selectedQuestion = {
    job_id: req.headers.job_id,
    question_id: req.headers.question_id,
    company_id: req.headers.company_id
  };
  Job.selectQuestion(selectedQuestion, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Job not found."
        });
      } else if (err.kind === "not_authorised") {
        res.status(403).send({
          message: "Cannot add this question for specified company"
        });
      } else
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while adding the question for the job."
        });
    } else
      res.status(200).send({
        status: "OK",
        data: data
      });
  });
};

exports.addTags = (req, res) => {
  Job.addTags(req.headers.job_id, req.body.tags, (err, data) => {
    if (err) {
      res.status(404).send({
        messsage: err.message || "Some error occurred while adding tags."
      });
    } else {
      res.status(200).send(data);
    }
  });
};

exports.hireCandidate = (req, res) => {
  const hiredCandidate = {
    job_id: req.headers.job_id,
    candidate_id: req.headers.candidate_id
  };
  Job.hireCandidate(hiredCandidate, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({
          message: "Job not found!"
        });
      } else
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while changing the status for the job."
        });
    } else
      res.status(200).send({
        status: "OK",
        data: data
      });
  });
};

exports.questions = (req, res) => {
  const candidate_job = {
    job_id: req.headers.job_id,
    candidate_id: req.headers.candidate_id
  };

  Job.getQuestions(candidate_job, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({
          message: "Job not found!"
        });
      } else if (err.kind == "hired") {
        res.status(406).send({
          message: "Job no longer active"
        });
      } else if (err.kind == "not_found_questions") {
        res.status(404).send({
          message: "Questions not found for this job"
        });
      } else
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while getting the questions for the job."
        });
    } else
      res.status(200).send({
        status: "OK",
        job_id: data.id,
        questions: data.questions
      });
  });
};

exports.submitObjective = (req, res) => {
  const answers = {
    job_id: req.headers.job_id,
    answers: req.body.answers,
    candidate_id: req.headers.candidate_id
  };

  Job.submitObjective(answers, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({
          message: "Job not found!"
        });
      } else
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while submitting answers for the job."
        });
    } else
      res.status(200).send({
        status: "OK",
        job_id: data.id
      });
  });
};

exports.submitSubjective = (req, res) => {
  const answers = {
    job_id: req.headers.job_id,
    answers: req.body.answers,
    candidate_id: req.headers.candidate_id
  };

  Job.submitSubjective(answers, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({
          message: "Job not found!"
        });
      } else
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while submitting answers for the job."
        });
    } else
      res.status(200).send({
        status: "OK",
        job_id: data.id
      });
  });
};

exports.submitVideo = (req, res) => {
  const answer = {
    job_id: req.headers.job_id,
    answer: req.file,
    candidate_id: req.headers.candidate_id,
    question_id: req.headers.question_id
  };
  Job.submitVideo(answer, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({
          message: "Job not found!"
        });
      } else
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while submitting answers for the job."
        });
    } else
      res.status(200).send({
        status: "OK",
        job_id: data.id
      });
  });
};
