# REST API for tests

## Authentication Scheme

1. Candidate Authentication
2. Company Authentication
3. Admin Authentication

## Entities

1. Candidate - The person who is using the portal
2. Company - The company that use our portal for hiring purposes
3. Jobs - The jobs that candidates apply for that are created by the companies
4. Admins - Millow Admins who can control certain aspects of the test, eg. Making the standard question bank

## Endpoints

1. Candidate
   - Signup
   - Signin
   - Get All Applied jobs
   - Apply for a particular job
   - Check the status of his/her job application
2. Company
   - Create
   - Login
   - Get Jobs posted by Company
   - Add question to the company database
3. Jobs
   - Create
   - Delete
   - Select Question to be asked for the job
   - Hire a candidate for the job
   - Submit Objective Answers
   - Submit Subjective Answers
4. Admin
   - Signup
   - Signin
   - Add Question to standard Database

## TODO

[] Checking if the times add up for jobs
