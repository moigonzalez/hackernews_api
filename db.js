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
      console.log('is this running');
      const text = 'INSERT INTO news(id, link) VALUES($1, $2)  RETURNING *';
      try {
        const res = await pool.query(text, params)
        console.log(res.rows[0])
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
