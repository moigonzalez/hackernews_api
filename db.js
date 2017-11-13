const { Client } = require('pg')
const client = new Client()

const { Pool } = require('pg')
const pool = new Pool()

class DB {
    constructor() {
      this.createTableNews = `
        CREATE TABLE IF NOT EXISTS news (
        id INT PRIMARY KEY NOT NULL,
        link TEXT
      );`
      this.createSummariesTable = `
      CREATE TABLE IF NOT EXISTS summaries (
        id INT PRIMARY KEY NOT NULL,
        link TEXT,
        sentiment numeric,
        title TEXT,
        topics TEXT,
        words INT,
        difficulty numeric,
        minutes INT,
        image TEXT
      );`;
    }

    async insertNews(params) {
      const insertQuery = 'INSERT INTO news(id, link) VALUES($1, $2)  RETURNING *';
      const existsQuery = 'SELECT * FROM news WHERE id = $1';
      try {
        const exists = await client.query(existsQuery, [params[0]])
        if (exists.rowCount > 0) {
          return;
        }
        const res = await pool.query(insertQuery, params)
      } catch(err) {
        console.log(err.stack)
      }
    }

    async getNews(entries = 1, offset = 0) {
      const selectQuery = `SELECT * FROM news LIMIT ${entries} OFFSET ${offset}`;
      try {
        const res = await client.query(selectQuery)
        return res.rows;
      } catch(err) {
        console.log(err.stack)
      }
    }

    async insertSummary(params) {
      const existsQuery = `SELECT * FROM summaries WHERE id = $1`;
      const insertQuery = 'INSERT INTO summaries(id, link, sentiment, title, topics, words, difficulty, minutes, image) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)  RETURNING *';
      try {
        const exists = await client.query(existsQuery, [params.id]);
        if (exists.rowCount > 0) {
          return;
        }
        const res = await client.query(insertQuery, [
          params.id,
          params.link,
          params.summary.sentiment,
          params.summary.title,
          params.summary.topics.toString(),
          params.summary.words,
          params.summary.difficulty,
          params.summary.minutes,
          params.summary.image]);
        return res.rows;
      } catch(err) {
        console.log(err.stack)
      }
    }

    async getSummaries(entries = 1, offset = 0) {
      const selectQuery = `SELECT * FROM summaries LIMIT ${entries} OFFSET ${offset}`;
      try {
        const res = await client.query(selectQuery)
        return res.rows;
      } catch(err) {
        console.log(err.stack)
      }
    }

    async init() {
      const self = this;
      try {
        await client.connect();
      } catch(e) {
        console.log(e);
      }
      try {
        await client.query(self.createTableNews);
        await client.query(self.createSummariesTable);
      } catch(e) {
        console.log(e, 'Error creating tables');
      }
    }
}

module.exports = DB;
