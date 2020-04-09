const AWS = require("aws-sdk");

const videoUpload = answer => {
  return new Promise((resolve, reject) => {
    const filename = `${answer.candidate_id}-${answer.job_id}-${
      answer.question_id
    }.${answer.answer.originalname.split(".")[1]}`;
    const s3Instance = new AWS.S3({
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: filename,
      Body: answer.answer.buffer
    };
    s3Instance.upload(params, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const resouceUpload = (mediaInfo, company_id) => {
  return new Promise((resolve, reject) => {
    const filename = `${mediaInfo.resource}-${company_id}.${
      mediaInfo.file.originalname.split(".")[1]
    }`;
    const s3Instance = new AWS.S3({
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: filename,
      Body: mediaInfo.file.buffer
    };
    s3Instance.upload(params, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

module.exports = { videoUpload, resouceUpload };
