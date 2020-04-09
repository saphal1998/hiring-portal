const runQuery = require("./queryRunner");

const checkAndCreateTags = async tags => {
  try {
    tags = tags.map(el => el.trim().toLowerCase(), []);
    let res = await runQuery(`SELECT * FROM tags WHERE WORD IN (?)`, [tags]);
    res = res.map(el => el.word, []);
    let tagsToInsert = tags.filter(el => !res.includes(el));
    let returnObject = {
      wordsPresent: res,
      tagsToInsert: tagsToInsert
    };
    tagsToInsert = tagsToInsert.map(el => [el], []);
    if (tagsToInsert.length > 0) {
      res = await runQuery(`INSERT INTO tags (word) VALUES ?`, [tagsToInsert]);
    }
    return returnObject;
  } catch (err) {
    return Promise.reject(new Error(err));
  }
};

const selectTagsForTable = async (tags, id) => {
  try {
    if (tags[0].word) {
      tags = tags.map(el => el.word, []);
    }
    tags = await checkAndCreateTags(tags);
    tags = [...tags.wordsPresent, ...tags.tagsToInsert];
    tags = await runQuery(`SELECT tag_id FROM tags WHERE word IN (?)`, [tags]);
    tags = tags.map(el => [el.tag_id, id], []);
    return tags;
  } catch (err) {
    return Promise.reject(new Error(err));
  }
};

module.exports = {
  checkAndCreateTags,
  selectTagsForTable
};
