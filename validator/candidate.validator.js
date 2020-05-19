const Joi = require('joi');

// TODO: Validator for Phone Number
const CandidateCreateSchema = {
	body: {
		email: Joi.string().required().email(),
		phone_number: Joi.string()
			.trim()
			.regex(/^[0-9]{7,10}$/)
			.required(),
		active: Joi.boolean(),
		name: Joi.string().required(),
		password: Joi.string().required(),
		tags: Joi.array().items({
			word: Joi.string(),
		}),
	},
};

const CandidateLoginSchema = {
	body: Joi.object()
		.keys({
			password: Joi.string().required(),
			email: Joi.string().email(),
			phone_number: Joi.string()
				.trim()
				.regex(/^[0-9]{7,10}$/),
		})
		.xor('phone_number', 'email'),
};

const CandidateForgotPassword = {
	body: Joi.object()
		.keys({
			email: Joi.string().email(),
			phone_number: Joi.string()
				.trim()
				.regex(/^[0-9]{7,10}$/),
		})
		.xor('phone_number', 'email'),
};

const CandidateValidateToken = {
	body: Joi.object()
		.keys({
			email: Joi.string().email(),
			phone_number: Joi.string()
				.trim()
				.regex(/^[0-9]{7,10}$/),
			new_password: Joi.string().required(),
		})
		.xor('phone_number', 'email'),
	headers: {
		token: Joi.string().length(Number(process.env.TOTP_DIGITS)),
	},
};

const CandidateGetJobs = {
	headers: {
		candidate_id: Joi.number().integer().required(),
	},
};

const CandidateJobEndpoints = {
	headers: {
		candidate_id: Joi.number().integer().required(),
		job_id: Joi.number().integer().required(),
	},
};

const CandidateGetProfile = {
	headers: {
		candidate_id: Joi.number().integer().required(),
	},
};

const CandidateInsertTags = {
	headers: {
		candidate_id: Joi.number().integer().required(),
	},
	body: {
		tags: Joi.array().items({
			word: Joi.string(),
		}),
	},
};

module.exports = {
	CandidateCreateSchema,
	CandidateLoginSchema,
	CandidateGetJobs,
	CandidateJobEndpoints,
	CandidateForgotPassword,
	CandidateValidateToken,
	CandidateGetProfile,
	CandidateInsertTags,
};
