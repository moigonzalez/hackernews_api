require('dotenv').config()
const express = require('express')
const app = express()
const request = require('request')
const cheerio = require('cheerio')
const summarize = require('summarize')
const DB = require('./DB')


class News {

  constructor(...args) {
    this.db = new DB();
    this.db.init();
    this.state = {
      news: [],
      summaries: []
    }
  }

  init() {
    const self = this;
    this.getLatestNews().then(() => {
      self.convertNewsToSummaries(2);
    });
    this.initNews();
  }

  getLatestNews() {
    return this.getNews('1');
  }

  initNews() {
    const self = this;
    app.get('/hackernews', function (req, res) {
      self.db.getNews(req.query.entries)
          .then((rows) => {
            res.send(JSON.stringify(rows))
          });
    })
  }

  getNews(page) {
    const self = this;
    return new Promise((resolve, reject) => {
      request(`https://news.ycombinator.com/news?p=${page}`, (er, re, body) => {
        if (er) {
          reject('error')
          return
        }
        let $ = cheerio.load(body)
        $('.athing').each((i, e) => {
          let currentNews = {
            id: $(e).attr('id'),
            link: $(e).find('.title a').attr('href'),
            title: $(e).find('.title a').text()
          }
          self.db.insertNews([currentNews.id, currentNews.link])
        })
        resolve('success news');
      })
    })
  }

  getSummarizedBody(body) {
    return new Promise ((resolve, reject) => {
      const s = summarize(body);
      if (s) resolve(JSON.stringify(s));
      else reject('error')
    }).then((x) => x);
  }

  async getSummary(news) {
    const self = this;
    return new Promise ((resolve, reject) => {
      request(news.link, (er, re, body) => {
        if (er) {
          reject ('error')
          return;
        }
        self.getSummarizedBody(body)
            .then((x => resolve(JSON.stringify({id: news.id, summary: JSON.parse(x)}))));
        })
    });
  }

  async convertNewsToSummaries(entries = 1, offset = 0) {
    const self = this;
    this.db.getNews(entries)
    .then((rows) => {
      return Promise.all(rows.map(x => self.getSummary(x)));
    }).then((y) => console.log('IS THIS RUNNING', y));
  }

  initSummary() {
    const self = this;
    app.get('/summary/:newsId', function (req, res) {
      const article = self.state.summaries.filter(x => x.id == req.params.newsId);
      res.send(article)
    })
  }
}

const news = new News();

news.init();

app.listen(process.env.PORT)
