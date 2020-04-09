const Joi = require("joi");

const CompanyCreateSchema = {
  body: {
    hr_email: Joi.string()
      .required()
      .email(),
    name: Joi.string().required(),
    password: Joi.string().required(),
    website: Joi.string()
      .uri()
      .required(),
    description: Joi.string(),
    year_founded: Joi.number()
      .integer()
      .min(1600)
      .max(new Date().getFullYear())
      .required(),
    team_size: Joi.string(),
    CEO: Joi.string(),
    CEO_social: Joi.string().uri(),
    tags: Joi.array().items({
      word: Joi.string()
    })
  }
};

const CompanyLoginSchema = {
  body: {
    password: Joi.string().required(),
    hr_email: Joi.string().email()
  }
};

const CompanyGetInfo = {
  headers: {
    company_id: Joi.number()
      .integer()
      .required()
  }
};

const CompanyAddQuestion = {
  body: {
    question: Joi.string().required(),
    time: Joi.number().required(),
    options: Joi.string().allow(null),
    answer: Joi.string().allow(null),
    tags: Joi.array().items({
      word: Joi.string()
    })
  },
  headers: {
    company_id: Joi.number()
      .integer()
      .not(Number(process.env.MILLOW_ID))
      .required()
  }
};

const CompanyInsertTags = {
  headers: {
    company_id: Joi.number()
      .integer()
      .required()
  },
  body: {
    tags: Joi.array().items({
      word: Joi.string()
    })
  }
};

const CompanyQuestionAddTags = {
  headers: {
    question_id: Joi.number()
      .integer()
      .required(),
    company_id: Joi.number()
      .integer()
      .required()
  },
  body: {
    tags: Joi.array().items({
      word: Joi.string()
    })
  }
};

const CompanyMedia = {
  body: {
    resource: Joi.string().required()
  },
  file: Joi.array().items({
    buffer: Joi.any()
  }),
  headers: {
    company_id: Joi.number()
      .integer()
      .required()
  }
};

const CompanyMoreInfo = {
  body: {
    info: Joi.string().required(),
    tag: {
      word: Joi.string().required()
    },
    url: Joi.string().uri()
  },
  headers: {
    company_id: Joi.number()
      .integer()
      .required()
  }
};

module.exports = {
  CompanyAddQuestion,
  CompanyCreateSchema,
  CompanyGetInfo,
  CompanyLoginSchema,
  CompanyInsertTags,
  CompanyMedia,
  CompanyMoreInfo,
  CompanyQuestionAddTags
};
