const Joi = require('joi');

const AdminCreateSchema = {
	body: {
		email: Joi.string().required().email(),
		name: Joi.string().required(),
		password: Joi.string().required(),
	},
};

const AdminLoginSchema = {
	body: {
		password: Joi.string().required(),
		email: Joi.string().email(),
	},
};

const AdminAddQuestionSchema = {
	body: {
		question: Joi.string().required(),
		time: Joi.number().integer().required(),
		options: Joi.string().allow(null),
		answer: Joi.string().allow(null),
	},
	headers: {
		admin_id: Joi.number().integer().required(),
		company_id: Joi.number()
			.integer()
			.equal(Number(process.env.COMPANY_ID))
			.allow(null),
		job_type_id: Joi.number().integer().required(),
	},
};

module.exports = {
	AdminCreateSchema,
	AdminLoginSchema,
	AdminAddQuestionSchema,
};
