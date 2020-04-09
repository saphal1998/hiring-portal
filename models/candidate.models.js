const fs = require("fs");
const jwt = require("jsonwebtoken");
const { compare, genSalt, hash } = require("bcrypt");
const speakeasy = require("speakeasy");
const sendMail = require("../helper/emailOTP");
const sendSMS = require("../helper/telephoneOTP");
const runQuery = require("../helper/queryRunner");
const { selectTagsForTable } = require("../helper/tags");

let privateKey = fs.readFileSync("./private.pem", "utf8");
const saltRounds = Number(process.env.SALT_ROUNDS);

// constructor
const Candidate = function(candidate) {
  this.email = candidate.email;
  this.name = candidate.name;
  this.password = candidate.password;
  this.phone_number = candidate.phone_number;
};

Candidate.create = async (newCandidate, candidate_tags, result) => {
  try {
    const salt = await genSalt(saltRounds);
    newCandidate.password = await hash(newCandidate.password, salt);
    const res = await runQuery("INSERT INTO candidate SET ?", newCandidate);
    const tags = await selectTagsForTable(candidate_tags, res.insertId);
    const tags_inserted = await runQuery(
      `INSERT INTO candidate_tags (tag_id, candidate_id) VALUES ?`,
      [tags]
    );
    const token = jwt.sign(
      {
        id: res.insertId
      },
      privateKey,
      {
        algorithm: "HS256",
        expiresIn: "3h"
      }
    );
    return result(null, {
      id: res.insertId,
      token: token,
      name: newCandidate.name,
      email: newCandidate.email,
      phone_number: newCandidate.phone_number,
      tags: tags,
      active: res.active
    });
  } catch (err) {
    return result(err, null);
  }
};

Candidate.loginCandidate = async (
  { email, password, phone_number },
  result
) => {
  try {
    if (email) {
      let res = await runQuery(
        "SELECT candidate_id, password, name, email, phone_number, created_at, active FROM candidate WHERE email = ? LIMIT 1",
        email
      );
      if (res.length == 0) {
        // not found Candidate with the id
        return result(
          {
            kind: "not_found",
            type: "email"
          },
          null
        );
      }
      res = res[0];
      const isCorrect = await compare(password, res.password);
      if (!isCorrect) {
        return result(
          {
            kind: "incorrect_password"
          },
          null
        );
      }
      const token = jwt.sign(
        {
          id: res.candidate_id
        },
        privateKey,
        {
          algorithm: "HS256",
          expiresIn: "3h"
        }
      );
      return result(null, {
        token: token,
        candidate_id: res.candidate_id,
        name: res.name,
        active: res.active
      });
    } else if (phone_number) {
      let res = await runQuery(
        "SELECT candidate_id, password, name, email, phone_number, created_at, active FROM candidate WHERE phone_number = ? LIMIT 1",
        phone_number
      );
      if (res.length == 0) {
        // not found Candidate with the id
        return result(
          {
            kind: "not_found",
            type: "phone_number"
          },
          null
        );
      }
      res = res[0];
      const isCorrect = await compare(password, res.password);
      if (!isCorrect) {
        return result(
          {
            kind: "incorrect_password"
          },
          null
        );
      }
      const token = jwt.sign(
        {
          id: res.candidate_id
        },
        privateKey,
        {
          algorithm: "HS256",
          expiresIn: "3h"
        }
      );
      return result(null, {
        token: token,
        candidate_id: res.candidate_id,
        name: res.name,
        active: res.active
      });
    }
  } catch (err) {
    return result(err, null);
  }
};

Candidate.forgotPassword = async ({ email, phone_number }, result) => {
  try {
    if (phone_number) {
      let res = await runQuery(
        "SELECT candidate_id, created_at, active FROM candidate WHERE phone_number = ? LIMIT 1",
        phone_number
      );
      if (res.length == 0) {
        // not found Candidate with the id
        return result(
          {
            kind: "not_found",
            type: "phone_number"
          },
          null
        );
      }
      res = res[0];
      privateKey += phone_number;
      const token = speakeasy.totp({
        secret: privateKey,
        encoding: "base64",
        digits: Number(process.env.TOTP_DIGITS)
      });
      const sent = await sendSMS(phone_number, token);
      return result(null, {
        message: `OTP sent to ${phone_number}`,
        token: token,
        res: sent
      });
    } else if (email) {
      const res = await runQuery(
        "SELECT candidate_id, created_at, active FROM candidate WHERE email = ? LIMIT 1",
        email
      );
      if (res.length == 0) {
        // not found Candidate with the id
        return result(
          {
            kind: "not_found",
            type: "email"
          },
          null
        );
      }
      privateKey += email;
      const token = speakeasy.totp({
        secret: privateKey,
        encoding: "base64",
        digits: Number(process.env.TOTP_DIGITS)
      });
      const sent = await sendMail(email, token);
      return result(null, {
        message: `OTP sent to ${email}`,
        token: token,
        res: sent
      });
    }
  } catch (err) {
    return result(err, null);
  }
};

Candidate.validateToken = async (
  { email, phone_number, token, new_password },
  result
) => {
  try {
    if (phone_number) {
      privateKey += phone_number;
      const isValidOTP = speakeasy.totp.verify({
        secret: privateKey,
        encoding: "base64",
        token: token,
        window: Number(process.env.TOTP_WINDOW)
      });
      if (isValidOTP) {
        const salt = await genSalt(saltRounds);
        const n_password = await hash(new_password, salt);
        const res = await runQuery(
          `UPDATE candidate SET password = ? WHERE phone_number = ?`,
          [n_password, phone_number]
        );
        if (res.length == 0) {
          // not found Candidate with the id
          return result(
            {
              kind: "not_found",
              type: "candidate_id"
            },
            null
          );
        }
        return result(null, {
          message: `Token was validated successfully for ${phone_number} and new password was added`
        });
      } else {
        return result(
          {
            kind: "Invalid Token",
            type: "token"
          },
          null
        );
      }
    } else if (email) {
      privateKey += email;
      const isValidOTP = speakeasy.totp.verify({
        secret: privateKey,
        encoding: "base64",
        token: token,
        window: Number(process.env.TOTP_WINDOW)
      });
      if (isValidOTP) {
        const salt = await genSalt(saltRounds);
        const n_password = await hash(new_password, salt);
        const res = await runQuery(
          `UPDATE candidate SET password = ? WHERE email = ?`,
          [n_password, email]
        );
        if (res.length == 0) {
          // not found Candidate with the id
          return result(
            {
              kind: "not_found",
              type: "candidate_id"
            },
            null
          );
        }
        return result(null, {
          message: `Token was validated successfully for ${email} and new password was added`
        });
      } else {
        return result(
          {
            kind: "invalid_token",
            type: "token"
          },
          null
        );
      }
    }
  } catch (err) {
    return result(err, null);
  }
};

Candidate.getAllJobs = async (candidate_id, result) => {
  try {
    const res = await runQuery(`SELECT * FROM jobs`);
    const company_ids = res.map(el => el.company_id, []);
    const companies = await runQuery(
      `SELECT hr_email, name, company_id FROM company WHERE company_id IN (?)`,
      [company_ids]
    );
    const appliedJobs = await runQuery(
      `SELECT job_id, active, hired, testStatus FROM candidate_job WHERE candidate_id = ?`,
      candidate_id
    );
    res.forEach(element => {
      element.jobStatus = appliedJobs.filter(
        el => el.job_id === element.job_id
      );
    });
    const job_tags = await runQuery(`SELECT * FROM job_tags`);
    const company_tags = await runQuery(
      `SELECT * FROM company_tags WHERE company_id IN (?)`,
      [company_ids]
    );
    if (job_tags.length > 0) {
      const job_tags_words = await runQuery(
        `SELECT * FROM tags WHERE tag_id IN (?)`,
        [job_tags.map(el => el.tag_id, [])]
      );
      res.forEach(element => {
        element.job_tags = job_tags_words.filter(el =>
          job_tags
            .filter(e => e.job_id === element.job_id)
            .map(e => e.tag_id, [])
            .includes(el.tag_id)
        );
      });
    }
    if (company_tags.length > 0) {
      const company_tags_words = await runQuery(
        `SELECT * FROM tags WHERE tag_id IN (?)`,
        [company_tags.map(el => el.tag_id, [])]
      );
      companies.forEach(element => {
        element.company_tags = company_tags_words.filter(el =>
          company_tags
            .filter(e => e.company_id === element.company_id)
            .map(e => e.tag_id, [])
            .includes(el.tag_id)
        );
      });
    }
    res.forEach(
      el =>
        (el.company_info = companies.filter(
          company => company.company_id === el.company_id
        ))
    );
    return result(null, res);
  } catch (err) {
    return result(err, null);
  }
};

Candidate.getProfile = async (candidate_id, result) => {
  try {
    let res = await runQuery(
      "SELECT name,email,phone_number FROM candidate WHERE candidate_id = ? LIMIT 1",
      candidate_id
    );
    if (res.length == 0) {
      // not found Candidate with the id
      return result(
        {
          kind: "not_found",
          type: "candidate_id"
        },
        null
      );
    }
    res = res[0];
    let tags = await runQuery(
      `SELECT tag_id FROM candidate_tags WHERE candidate_id = ?`,
      candidate_id
    );
    if (tags.length == 0) {
      return result(null, res);
    }
    tags = tags.map(el => el.tag_id, []);
    res.tags = await runQuery(`SELECT word FROM tags WHERE tag_id IN (?)`, [
      tags
    ]);
    return result(null, res);
  } catch (err) {
    return result(err, null);
  }
};

Candidate.addTags = async (candidate_id, candidate_tags, result) => {
  try {
    const tags = await selectTagsForTable(candidate_tags, candidate_id);
    const res = await runQuery(
      `INSERT INTO candidate_tags (tag_id, candidate_id) VALUES ?`,
      [tags]
    );

    return result(null, res);
  } catch (err) {
    return result(err, null);
  }
};

Candidate.getApplied = async (candidate_id, result) => {
  try {
    const getJobs = await runQuery(
      "SELECT job_id FROM candidate_job WHERE candidate_id = ?",
      candidate_id
    );
    if (getJobs.length == 0) {
      // not found Candidate with the id applied for any job
      return result(
        {
          kind: "not_found",
          type: "candidate_id"
        },
        null
      );
    }
    const job_ids = getJobs.map(el => el.job_id, []);
    const jobDetails = await runQuery(
      `SELECT * FROM jobs where job_id IN (?)`,
      [job_ids]
    );
    if (jobDetails.affectedRows == 0) {
      // not found any job with the candidate_id
      return result(
        {
          kind: "not_found",
          type: "candidate_id"
        },
        null
      );
    }
    const appliedJobs = await runQuery(
      `SELECT job_id, active, hired, testStatus FROM candidate_job WHERE candidate_id = ?`,
      candidate_id
    );
    jobDetails.forEach(element => {
      element.jobStatus = appliedJobs.filter(
        el => el.job_id === element.job_id
      );
    });
    const job_tags = await runQuery(`SELECT * FROM job_tags`);
    if (job_tags.length > 0) {
      const job_tags_words = await runQuery(
        `SELECT * FROM tags WHERE tag_id IN (?)`,
        [job_tags.map(el => el.tag_id, [])]
      );
      jobDetails.forEach(element => {
        element.job_tags = job_tags_words.filter(el =>
          job_tags
            .filter(e => e.job_id === element.job_id)
            .map(e => e.tag_id, [])
            .includes(el.tag_id)
        );
      });
    }
    const company_ids = jobDetails.map(el => el.company_id, []);
    const companyDetails = await runQuery(
      `SELECT name, company_id, hr_email, website, description, year_founded, team_size, CEO, CEO_social, created_at FROM company WHERE company_id IN (?)`,
      [company_ids]
    );
    const tagIds = await runQuery(
      `SELECT tag_id FROM company_tags WHERE company_id IN (?)`,
      [company_ids]
    );
    if (tagIds.length > 0) {
      const tags = await runQuery(`SELECT word FROM tags WHERE tag_id IN (?)`, [
        tagIds.map(el => el.tag_id, [])
      ]);
      companyDetails.forEach(element => {
        element.company_tags = tags.filter(el =>
          tagIds
            .filter(e => e.company_id === element.company_id)
            .map(e => e.tag_id, [])
            .includes(el.tag_id)
        );
      });
    }
    const media = await runQuery(
      `SELECT * FROM media WHERE company_id IN (?)`,
      [company_ids]
    );
    if (media.length > 0) {
      const media_tags = await runQuery(
        `SELECT * FROM tags WHERE tag_id IN (?)`,
        [media.map(el => el.tag_id, [])]
      );
      media.map(
        el => (el.tag = media_tags.filter(tag => tag.tag_id === el.tag_id))
      );
      companyDetails.forEach(element => {
        element.media = media.filter(
          el => el.company_id === element.company_id
        );
      });
    }
    let more_info = await runQuery(
      `SELECT * FROM company_more_info WHERE company_id IN (?)`,
      [company_ids]
    );
    if (more_info.length > 0) {
      const more_info_tags = await runQuery(
        `SELECT * FROM tags WHERE tag_id IN (?)`,
        [more_info.map(el => el.tag_id, [])]
      );
      more_info.map(
        el => (el.tag = more_info_tags.filter(tag => tag.tag_id === el.tag_id))
      );
      companyDetails.forEach(element => {
        element.more_info = more_info.filter(
          el => el.company_id === element.company_id
        );
      });
    }
    jobDetails.map(
      job =>
        (job.company_details = companyDetails.filter(
          el => el.company_id === job.company_id
        ))
    );
    return result(null, jobDetails);
  } catch (err) {
    return result(err, null);
  }
};

Candidate.applyJob = async (candidate_job, result) => {
  try {
    const res = await runQuery(
      "INSERT INTO candidate_job SET ?",
      candidate_job
    );
    return result(null, res);
  } catch (err) {
    return result(err, null);
  }
};

Candidate.jobStatus = async ({ job_id, candidate_id }, result) => {
  try {
    const res = await runQuery(
      `SELECT active, hired, testStatus FROM candidate_job WHERE job_id = ? AND candidate_id = ?`,
      [job_id, candidate_id]
    );
    if (res.length == 0) {
      // not found any job with the candidate_id
      return result(
        {
          kind: "not_found",
          type: "candidate_id"
        },
        null
      );
    }
    return result(null, res);
  } catch (err) {
    return result(err, null);
  }
};

module.exports = Candidate;
