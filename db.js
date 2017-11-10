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
      const text = 'INSERT INTO news(id, link) VALUES($1, $2)  RETURNING *';
      try {
        const exists = await client.query('SELECT * FROM news WHERE id = $1', [params[0]])
        if (exists.rowCount > 0) {
          return;
        }
        const res = await pool.query(text, params)
      } catch(err) {
        console.log(err.stack)
      }
    }

    async getNews(pages) {

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
