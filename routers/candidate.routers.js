const expressJoi = require("express-joi-validator");
const { isAuthenticatedCandidate } = require("../helper/auth");
const {
  CandidateCreateSchema,
  CandidateLoginSchema,
  CandidateGetJobs,
  CandidateGetProfile,
  CandidateJobEndpoints,
  CandidateForgotPassword,
  CandidateValidateToken,
  CandidateInsertTags
} = require("../validator/candidate.validator");

module.exports = app => {
  const candidate = require("../controllers/candidate.controller.js");

  // Create a new Candidate
  app.post(
    "/candidate/signup",
    expressJoi(CandidateCreateSchema),
    candidate.create
  );

  // Login to the system as a candidate
  app.post(
    "/candidate/signin",
    expressJoi(CandidateLoginSchema),
    candidate.login
  );

  app.post(
    "/candidate/forgotPassword",
    expressJoi(CandidateForgotPassword),
    candidate.forgotPassword
  );

  app.post(
    "/candidate/validateToken",
    expressJoi(CandidateValidateToken),
    candidate.validateToken
  );

  // Get all the Jobs on the platform
  app.get(
    "/candidate/getAllJobs",
    expressJoi(CandidateGetJobs),
    isAuthenticatedCandidate,
    candidate.getAllJobs
  );

  app.get(
    "/candidate/me",
    expressJoi(CandidateGetProfile),
    isAuthenticatedCandidate,
    candidate.getProfile
  );

  app.post(
    "/candidate/addTags",
    expressJoi(CandidateInsertTags),
    isAuthenticatedCandidate,
    candidate.addTags
  );

  // Get the applied Jobs for an authenticated candidate
  app.get(
    "/candidate/jobs",
    expressJoi(CandidateGetJobs),
    isAuthenticatedCandidate,
    candidate.getApplied
  );

  // Apply for a job for an authenticated candidate
  app.post(
    "/candidate/apply",
    expressJoi(CandidateJobEndpoints),
    isAuthenticatedCandidate,
    candidate.applyJob
  );

  // Get the job status (selected/attempted/hired) for an authenticated candidate
  app.get(
    "/candidate/jobStatus",
    expressJoi(CandidateJobEndpoints),
    isAuthenticatedCandidate,
    candidate.jobStatus
  );
};
