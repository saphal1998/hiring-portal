const sql = require("../helper/db");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { compare, genSalt, hash } = require("bcrypt");
const runQuery = require("../helper/queryRunner");
const { selectTagsForTable } = require("../helper/tags");
const { resouceUpload } = require("../helper/s3Upload");

const saltRounds = Number(process.env.SALT_ROUNDS);
let privateKey = fs.readFileSync("./private.pem", "utf8");
// constructor
const Company = function(company) {
  (this.hr_email = company.hr_email),
    (this.name = company.name),
    (this.password = company.password),
    (this.website = company.website),
    (this.description = company.description),
    (this.year_founded = company.year_founded),
    (this.team_size = company.team_size),
    (this.CEO = company.CEO),
    (this.CEO_social = company.CEO_social);
};

Company.create = async (newCompany, company_tags, result) => {
  try {
    const salt = await genSalt(saltRounds);
    newCompany.password = await hash(newCompany.password, salt);
    const res = await runQuery("INSERT INTO company SET ?", newCompany);
    const tags = await selectTagsForTable(company_tags, res.insertId);
    const tags_inserted = await runQuery(
      `INSERT INTO company_tags (tag_id, company_id) VALUES ?`,
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
      name: newCompany.name,
      active: res.active
    });
  } catch (err) {
    return result(err, null);
  }
};

Company.loginCompany = async ({ hr_email, password }, result) => {
  try {
    const res = (
      await runQuery(
        "SELECT company_id, password, name, hr_email, created_at FROM company WHERE hr_email = ?",
        hr_email
      )
    )[0];
    if (res.length == 0) {
      // not found Company with the id
      return result(
        {
          kind: "not_found",
          type: "email"
        },
        null
      );
    }
    const isCorrect = await compare(password, res.password);
    if (isCorrect) {
      const token = jwt.sign(
        {
          id: res.company_id
        },
        privateKey,
        {
          algorithm: "HS256",
          expiresIn: "3h"
        }
      );
      return result(null, {
        token: token,
        company_id: res.company_id,
        name: res.name
      });
    } else {
      return result(
        {
          kind: "incorrect_password"
        },
        null
      );
    }
  } catch (err) {
    return result(err, null);
  }
};

Company.info = async (company_id, result) => {
  try {
    const data = {};
    const company_info = await runQuery(
      `SELECT name, hr_email, website, description, year_founded, team_size, CEO, CEO_social, created_at FROM company WHERE company_id = ?`,
      company_id
    );
    if (company_info.length == 0) {
      return result({ message: "Company Not Found", kind: "not_found" }, null);
    }
    data.company_info = company_info;
    const tagIds = await runQuery(
      `SELECT tag_id FROM company_tags WHERE company_id = ?`,
      company_id
    );
    if (tagIds.length > 0) {
      const tags = await runQuery(`SELECT word FROM tags WHERE tag_id IN (?)`, [
        tagIds.map(el => el.tag_id, [])
      ]);
      data.tags = tags;
    }
    const media = await runQuery(
      `SELECT * FROM media WHERE company_id = ?`,
      company_id
    );
    if (media.length > 0) {
      const media_tags = await runQuery(
        `SELECT * FROM tags WHERE tag_id IN (?)`,
        [media.map(el => el.tag_id, [])]
      );
      media.map(
        el => (el.tag = media_tags.filter(tag => tag.tag_id === el.tag_id))
      );
    }
    data.media = media;
    let more_info = await runQuery(
      `SELECT * FROM company_more_info WHERE company_id = ?`,
      company_id
    );
    if (more_info.length > 0) {
      const more_info_tags = await runQuery(
        `SELECT * FROM tags WHERE tag_id IN (?)`,
        [more_info.map(el => el.tag_id, [])]
      );
      more_info.map(
        el => (el.tag = more_info_tags.filter(tag => tag.tag_id === el.tag_id))
      );
    }
    data.more_info = more_info;
    return result(null, data);
  } catch (err) {
    return result(err, null);
  }
};

Company.addTags = async (company_id, company_tags, result) => {
  try {
    const tags = await selectTagsForTable(company_tags, company_id);
    const res = await runQuery(
      `INSERT INTO company_tags (tag_id, company_id) VALUES ?`,
      [tags]
    );
    return result(null, res);
  } catch (err) {
    return result(err, null);
  }
};

Company.questionAddTags = async (question_id, question_tags, result) => {
  try {
    const tags = await selectTagsForTable(question_tags, question_id);
    const res = await runQuery(
      `INSERT INTO question_tags (tag_id, question_id) VALUES ?`,
      [tags]
    );
    return result(null, res);
  } catch (err) {
    return result(err, null);
  }
};

Company.addMoreInfo = async (company_id, more_info, result) => {
  try {
    more_info.tag = await selectTagsForTable([more_info.tag], company_id);
    const tags = await runQuery(
      `INSERT INTO company_tags (tag_id, company_id) VALUES ?`,
      [more_info.tag]
    );
    more_info.tag = more_info.tag.map(el => el[0], [])[0];
    more_info = {
      info: more_info.info,
      tag_id: more_info.tag,
      urls: more_info.url,
      company_id: company_id
    };
    const res = await runQuery(
      `INSERT INTO company_more_info SET ?`,
      more_info
    );
    return result(null, res);
  } catch (err) {
    return result(err, null);
  }
};

Company.mediaUpload = async (company_id, mediaInfo, result) => {
  try {
    mediaInfo.resource = await selectTagsForTable(
      [mediaInfo.resource],
      company_id
    );
    const tags = await runQuery(
      `INSERT INTO company_tags (tag_id, company_id) VALUES ?`,
      [mediaInfo.resource]
    );
    mediaInfo.resource = mediaInfo.resource.map(el => el[0], [])[0];
    const dbData = {
      company_id,
      tag_id: mediaInfo.resource
    };
    if (mediaInfo.file) {
      const data = await resouceUpload(mediaInfo, company_id);
      dbData.url = data.Location;
    }
    const res = await runQuery(`INSERT INTO media SET ?`, dbData);
    return result(null, dbData);
  } catch (err) {
    return result(err, null);
  }
};

Company.getJobs = async (company_id, result) => {
  try {
    const res = await runQuery(
      `SELECT * FROM jobs WHERE company_id = ?`,
      company_id
    );
    if (res.affectedRows == 0) {
      return result(
        {
          kind: "not_found"
        },
        null
      );
    }
    return result(null, res);
  } catch (err) {
    return result(err, null);
  }
};

Company.addQuestion = async (question, question_tags, result) => {
  try {
    const res = await runQuery("INSERT INTO question_bank SET ?", question);
    const tags = await selectTagsForTable(question_tags, res.insertId);
    const tags_inserted = await runQuery(
      `INSERT INTO question_tags (tag_id, question_id) VALUES ?`,
      [tags]
    );
    return result(null, {
      id: res.insertId,
      ...question
    });
  } catch (err) {
    return result(err, null);
  }
};

module.exports = Company;
