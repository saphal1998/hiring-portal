const expressJoi = require("express-joi-validator");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { isAuthenticatedCompany } = require("../helper/auth");
const {
  CompanyAddQuestion,
  CompanyCreateSchema,
  CompanyGetInfo,
  CompanyLoginSchema,
  CompanyInsertTags,
  CompanyMoreInfo,
  CompanyMedia,
  CompanyQuestionAddTags
} = require("../validator/company.validator");

module.exports = app => {
  const company = require("../controllers/company.controller");
  // Create a new Job
  app.post("/company/signup", expressJoi(CompanyCreateSchema), company.create);

  // Login to the system as a company
  app.post("/company/signin", expressJoi(CompanyLoginSchema), company.login);

  //Get company info
  app.get(
    "/company/info",
    expressJoi(CompanyGetInfo),
    isAuthenticatedCompany,
    company.info
  );

  app.post(
    "/company/addTags",
    expressJoi(CompanyInsertTags),
    isAuthenticatedCompany,
    company.addTags
  );

  app.post(
    "/company/question/addTags",
    expressJoi(CompanyQuestionAddTags),
    isAuthenticatedCompany,
    company.questionAddTags
  );

  app.post(
    "/company/moreInfo",
    expressJoi(CompanyMoreInfo),
    isAuthenticatedCompany,
    company.addMoreInfo
  );

  app.post(
    "/company/media",
    upload.single("image"),
    expressJoi(CompanyMedia),
    isAuthenticatedCompany,
    company.mediaUpload
  );

  // Get the jobs for a particular authenticated company
  app.get(
    "/company/jobs",
    expressJoi(CompanyGetInfo),
    isAuthenticatedCompany,
    company.getJobs
  );

  // Add questions into personal company question bank, for an authenticated company
  app.post(
    "/company/addQuestion",
    expressJoi(CompanyAddQuestion),
    isAuthenticatedCompany,
    company.addQuestion
  );
};
