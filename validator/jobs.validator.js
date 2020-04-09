const Joi = require("joi");

const JobsCreateSchema = {
  body: {
    info: Joi.string().required(),
    test_time: Joi.number()
      .integer()
      .required(),
    total_questions: Joi.number()
      .integer()
      .required(),
    video_time: Joi.number()
      .integer()
      .required(),
    video_num: Joi.number()
      .integer()
      .required(),
    obj_time: Joi.number()
      .integer()
      .required(),
    obj_num: Joi.number()
      .integer()
      .required(),
    sub_num: Joi.number()
      .integer()
      .required(),
    sub_time: Joi.number()
      .integer()
      .required(),
    ctc_max: Joi.number()
      .integer()
      .required(),
    ctc_min: Joi.number()
      .integer()
      .required(),
    experience_required_max: Joi.number()
      .integer()
      .required(),
    experience_required_min: Joi.number()
      .integer()
      .required(),
    notice_period: Joi.number()
      .integer()
      .required(),
    active: Joi.boolean(),
    tags: Joi.array().items({
      word: Joi.string()
    })
  },
  headers: {
    company_id: Joi.number()
      .integer()
      .required()
  }
};

const JobsDeleteSchema = {
  headers: {
    job_id: Joi.number()
      .integer()
      .required()
  }
};

const JobsSelectQuestionSchema = {
  headers: {
    job_id: Joi.number()
      .integer()
      .required(),
    question_id: Joi.number()
      .integer()
      .required(),
    company_id: Joi.number()
      .integer()
      .required()
  }
};

const JobsHireCandidate = {
  headers: {
    job_id: Joi.number()
      .integer()
      .required(),
    candidate_id: Joi.number()
      .integer()
      .required()
  }
};

const JobsGetQuestions = {
  headers: {
    job_id: Joi.number()
      .integer()
      .required(),
    candidate_id: Joi.number()
      .integer()
      .required()
  }
};

const JobsSubmitObjective = {
  body: {
    answers: Joi.array().items({
      question_id: Joi.number()
        .integer()
        .required(),
      answer: Joi.number().required()
    })
  },
  headers: {
    job_id: Joi.number()
      .integer()
      .required(),
    candidate_id: Joi.number()
      .integer()
      .required()
  }
};

const JobsSubmitSubjective = {
  body: {
    answers: Joi.array().items({
      question_id: Joi.number()
        .integer()
        .required(),
      answer: Joi.string().required()
    })
  },
  headers: {
    job_id: Joi.number()
      .integer()
      .required(),
    candidate_id: Joi.number()
      .integer()
      .required()
  }
};

const JobsSubmitVideo = {
  body: {
    question_id: Joi.number()
      .integer()
      .required()
  },
  file: Joi.array().items({
    buffer: Joi.any().required()
  }),
  headers: {
    job_id: Joi.number()
      .integer()
      .required(),
    candidate_id: Joi.number()
      .integer()
      .required()
  }
};

const JobsInsertTags = {
  headers: {
    company_id: Joi.number()
      .integer()
      .required(),
    job_id: Joi.number()
      .integer()
      .required()
  },
  body: {
    tags: Joi.array().items({
      word: Joi.string()
    })
  }
};

module.exports = {
  JobsHireCandidate,
  JobsCreateSchema,
  JobsSelectQuestionSchema,
  JobsDeleteSchema,
  JobsSubmitObjective,
  JobsSubmitSubjective,
  JobsSubmitVideo,
  JobsGetQuestions,
  JobsInsertTags
};
