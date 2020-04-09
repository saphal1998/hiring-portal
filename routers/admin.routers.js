const expressJoi = require("express-joi-validator");
const { isAuthenticatedAdmin } = require("../helper/auth");
const {
  AdminAddQuestionSchema,
  AdminCreateSchema,
  AdminLoginSchema
} = require("../validator/admin.validator");

module.exports = app => {
  const admin = require("../controllers/admin.controller.js");
  // Create a new Admin
  app.post("/admin/signup", expressJoi(AdminCreateSchema), admin.create);

  // Login to the system as an Admin
  app.post("/admin/signin", expressJoi(AdminLoginSchema), admin.login);

  // Add Questions as an Admin - Only adds to standard question bank
  app.post(
    "/admin/addQuestion",
    expressJoi(AdminAddQuestionSchema),
    isAuthenticatedAdmin,
    admin.addQuestion
  );
};
