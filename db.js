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



    async insertSummaries(params) {
      const existsSummaryQuery = `SELECT * FROM summaries WHERE id = $1`;
      try {
        const exists = await client.query(existsSummaryQuery, [params[0]])
        if (exists.rowCount > 0) {
          return;
        }
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
        console.log(e, 'error creating');
      }
    }
}

module.exports = DB;
