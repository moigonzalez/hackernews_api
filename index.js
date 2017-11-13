require('dotenv').config()
const express = require('express')
const app = express()
const request = require('request')
const cheerio = require('cheerio')
const summarize = require('summarize')
const DB = require(`${__dirname}/db.js`)
const cron = require('node-cron')

class News {

  constructor(...args) {
    this.db = new DB();
    this.db.init();
  }

  init() {
    const self = this;
    this.getLatestNews();
    this.initNews();
    this.initSummaries();
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
          reject('Error getting news')
          return
        }
        let $ = cheerio.load(body)
        $('.athing').each((i, e) => {
          let currentNews = {
            id: $(e).attr('id'),
            link: $(e).find('.title .storylink').attr('href'),
            title: $(e).find('.title .storylink').text()
          }
          self.db.insertNews([currentNews.id, currentNews.link])
        })
        resolve('success news');
      })
    }).catch((err) => {
        console.log(err);
    });
  }

  getSummarizedBody(body) {
    return new Promise ((resolve, reject) => {
      const s = summarize(body);
      if (s) resolve(JSON.stringify(s));
      else reject('Error getting summarized body');
    }).then((x) => x).catch((err) => {
        console.log(err);
    });;
  }

  async getSummary(news) {
    const self = this;
    return new Promise ((resolve, reject) => {
      request(news.link, (er, re, body) => {
        if (er) {
          console.log(er);
          reject ('Error getting summary', news.link);
          return;
        }
        self.getSummarizedBody(body)
            .then((x => resolve(JSON.stringify({id: news.id, link: news.link, summary: JSON.parse(x)}))))
            .catch((err) => {
                console.log(err);
            });
        })
    }).catch((err) => {
        console.log(err);
    });
  }

  async convertNewsToSummaries(entries = 1, offset = 0) {
    const self = this;
    this.db.getNews(entries)
    .then((rows) => {
      return Promise.all(rows.map(x => self.getSummary(x)));
    }).then((x) => {
      x.forEach((y => { const z = JSON.parse(y); if (z.summary.ok) self.db.insertSummary(z)}))
    }).catch((err) => {
        console.log(err);
    });;
  }

  initSummaries() {
    const self = this;
    app.get('/summaries', function (req, res) {
      self.db.getSummaries(req.query.entries)
          .then((rows) => {
            res.send(rows)
          });
    })
  }
}

const news = new News();
news.init();

cron.schedule('*/30 * * * *', function() {
  news.getLatestNews();
});

cron.schedule('*/10 * * * *', function() {
  news.convertNewsToSummaries('15');
});

app.listen(process.env.PORT)
