const runQuery = require("../helper/queryRunner");
const { videoUpload } = require("../helper/s3Upload");
const { selectTagsForTable } = require("../helper/tags");

// constructor
const Job = function(job) {
  this.info = job.info;
  this.company_id = job.company_id;
  this.test_time = job.test_time;
  this.total_questions = job.total_questions;
  this.video_time = job.video_time;
  this.video_num = job.video_num;
  this.obj_time = job.obj_time;
  this.obj_num = job.obj_num;
  this.sub_num = job.sub_num;
  this.sub_time = job.sub_time;
  (this.ctc_min = job.ctc_min),
    (this.ctc_max = job.ctc_max),
    (this.experience_required_min = job.experience_required_min),
    (this.experience_required_max = job.experience_required_max),
    (this.notice_period = job.notice_period);
};

Job.create = async (newJob, job_tags, result) => {
  try {
    if (
      newJob.sub_time + newJob.obj_time + newJob.video_time !=
      newJob.test_time
    ) {
      return result(
        {
          message: "Error in question number or time. The sums don't add up"
        },
        null
      );
    }
    const res = await runQuery("INSERT INTO jobs SET ?", newJob);
    const tags = await selectTagsForTable(job_tags, res.insertId);
    const tags_inserted = await runQuery(
      `INSERT INTO job_tags (tag_id, job_id) VALUES ?`,
      [tags]
    );
    return result(null, {
      id: res.insertId,
      ...newJob
    });
  } catch (err) {
    return result(err, null);
  }
};

Job.delete = async (job_id, result) => {
  try {
    const res = await runQuery(
      "UPDATE jobs SET active = false WHERE job_id = ?",
      job_id
    );
    if (res.affectedRows == 0) {
      // not found Jobs with the id
      return result(
        {
          kind: "not_found"
        },
        null
      );
    }
    const hiredJob = await runQuery(
      "UPDATE candidate_job SET active = false WHERE job_id = ?",
      job_id
    );
    return result(null, { id: job_id });
  } catch (err) {
    return result(err, null);
  }
};

Job.hireCandidate = async (hire, result) => {
  try {
    const res = await runQuery(
      `UPDATE candidate_job SET hired = true WHERE job_id = ? AND candidate_id = ?`,
      [hire.job_id, hire.candidate_id]
    );
    if (res.affectedRows == 0) {
      // not found Job with the id
      return result(
        {
          kind: "not_found"
        },
        null
      );
    }
    const notHired = await runQuery(
      `UPDATE candidate_job SET active = false WHERE job_id = ?`,
      hire.job_id
    );
    return result(null, res);
  } catch (err) {
    return result(err, null);
  }
};

Job.selectQuestion = async (selection, result) => {
  try {
    const company_for_question = await runQuery(
      "SELECT company_id FROM question_bank WHERE question_id = ?",
      selection.question_id
    );
    if (
      Number(company_for_question[0].company_id) !==
      Number(selection.company_id)
    ) {
      return result({ kind: "not_authorised" }, null);
    }
    const res = await runQuery("INSERT INTO question_selected SET ?", {
      job_id: selection.job_id,
      question_id: selection.question_id
    });
    if (res.affectedRows == 0) {
      // not found Job with the id
      return result(
        {
          kind: "not_found"
        },
        null
      );
    }
    return result(null, selection);
  } catch (err) {
    return result(err, null);
  }
};

Job.addTags = async (job_id, job_tags, result) => {
  try {
    const tags = await selectTagsForTable(job_tags, job_id);
    const res = await runQuery(
      `INSERT INTO job_tags (tag_id, job_id) VALUES ?`,
      [tags]
    );
    return result(null, res);
  } catch (err) {
    return result(err, null);
  }
};

// TODO : Check if all times match
Job.getQuestions = async (candidate_job, result) => {
  try {
    const checkIfActive = await runQuery(
      "SELECT * FROM candidate_job WHERE candidate_id = ? AND job_id = ?",
      [candidate_job.candidate_id, candidate_job.job_id]
    );
    if (checkIfActive.length == 0) {
      return result(
        {
          kind: "not_found",
          type: "candidate_id"
        },
        null
      );
    }
    if (checkIfActive[0].active == false) {
      return result({
        kind: "hired",
        type: "job_id"
      });
    }
    const question_ids = await runQuery(
      "SELECT question_id FROM question_selected WHERE job_id = ?",
      candidate_job.job_id
    );
    const questionIds = question_ids.map(el => el.question_id, []);
    if (questionIds.length == 0) {
      return result(
        {
          kind: "not_found_questions",
          type: "questions"
        },
        null
      );
    }
    const questionDetails = await runQuery(
      `SELECT * from question_bank WHERE question_id IN (?)`,
      [questionIds]
    );

    const question_tags = await runQuery(
      `SELECT * FROM question_tags WHERE question_id IN (?)`,
      [questionIds]
    );

    const tags = await runQuery(`SELECT * FROM tags WHERE tag_id IN (?)`, [
      question_tags.map(el => el.tag_id, [])
    ]);

    questionDetails.forEach(element => {
      element.question_tags = tags.filter(el =>
        question_tags
          .filter(e => e.question_id === element.question_id)
          .map(e => e.tag_id, [])
          .includes(el.tag_id)
      );
    });
    return result(null, {
      id: candidate_job.job_id,
      questions: questionDetails
    });
  } catch (err) {
    return result(err, null);
  }
};

Job.submitObjective = async (answers, result) => {
  try {
    const insertObject = answers.answers.map(
      el => [answers.candidate_id, answers.job_id, el.question_id, el.answer],
      []
    );
    const res = await runQuery(
      `INSERT INTO answers (candidate_id, job_id, question_id, answer) VALUES ?`,
      [insertObject]
    );

    return result(null, {
      candidate_id: answers.candidate_id,
      id: answers.job_id,
      res
    });
  } catch (err) {
    return result(err, null);
  }
};

Job.submitSubjective = async (answers, result) => {
  try {
    const insertObject = answers.answers.map(
      el => [answers.candidate_id, answers.job_id, el.question_id, el.answer],
      []
    );
    const res = await runQuery(
      `INSERT INTO answers (candidate_id, job_id, question_id, answer) VALUES ?`,
      [insertObject]
    );

    return result(null, {
      candidate_id: answers.candidate_id,
      id: answers.job_id,
      res
    });
  } catch (err) {
    return result(err, null);
  }
};

Job.submitVideo = async (answer, result) => {
  try {
    const data = await videoUpload(answer);
    const fileData = {
      candidate_id: answer.candidate_id,
      job_id: answer.job_id,
      question_id: answer.question_id,
      answer: data.Location
    };
    const res = await runQuery("INSERT INTO answers SET ?", fileData);
    return result(null, {
      id: res.insertId,
      candidate_id: answer.candidate_id,
      job_id: answer.job_id,
      question_id: answer.question_id
    });
  } catch (err) {
    return result(err, null);
  }
};

module.exports = Job;
