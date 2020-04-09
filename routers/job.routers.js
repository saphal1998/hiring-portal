const expressJoi = require("express-joi-validator");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {
  isAuthenticatedCompany,
  isAuthenticatedCandidate
} = require("../helper/auth");
const {
  JobsHireCandidate,
  JobsCreateSchema,
  JobsSelectQuestionSchema,
  JobsDeleteSchema,
  JobsSubmitObjective,
  JobsSubmitVideo,
  JobsSubmitSubjective,
  JobsGetQuestions,
  JobsInsertTags
} = require("../validator/jobs.validator");

module.exports = app => {
  const job = require("../controllers/job.controller");
  // Create a new Job for authenticated company
  app.post(
    "/job/create",
    expressJoi(JobsCreateSchema),
    isAuthenticatedCompany,
    job.create
  );

  app.post(
    "/jobs/addTags",
    expressJoi(JobsInsertTags),
    isAuthenticatedCompany,
    job.addTags
  );

  // Deletes a job (by setting active=false)
  app.post(
    "/job/delete",
    expressJoi(JobsDeleteSchema),
    isAuthenticatedCompany,
    job.delete
  );

  // Select questions for the job for authenticated company
  app.post(
    "/job/selectQuestion",
    expressJoi(JobsSelectQuestionSchema),
    isAuthenticatedCompany,
    job.selectQuestion
  );

  // Hire candidate for authenticated company
  app.post(
    "/job/hire",
    expressJoi(JobsHireCandidate),
    isAuthenticatedCompany,
    job.hireCandidate
  );

  // Get Questions for Job
  app.get(
    "/job/questions",
    expressJoi(JobsGetQuestions),
    isAuthenticatedCandidate,
    job.questions
  );

  // Submit test answers for job for authenticated company
  app.post(
    "/job/submitAnswers/objective",
    isAuthenticatedCandidate,
    expressJoi(JobsSubmitObjective),
    job.submitObjective
  );
  app.post(
    "/job/submitAnswers/subjective",
    isAuthenticatedCandidate,
    expressJoi(JobsSubmitSubjective),
    job.submitSubjective
  );
  app.post(
    "/job/submitAnswers/video",
    upload.single("video"),
    expressJoi(JobsSubmitVideo),
    isAuthenticatedCandidate,
    job.submitVideo
  );
};
