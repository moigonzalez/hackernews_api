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
    this.getLatestNews();
    this.initNews();
  }

  getLatestNews() {
    this.getNews('1');
  }

  initNews() {
    const self = this;
    app.get('/hackernews', function (req, res) {
      self.getNews(req.query.page)
          .then(() => {
            res.send(JSON.stringify(self.state.news))
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

  getSummaries() {
    const self = this;
    return new Promise((resolve, reject) => {
      self.state.news.forEach((x, i) => {
        request(x.link, (er, re, body) => {
          if (er) {
            console.log('there was an error');
            reject('error')
            return
          }
          self.state.summaries.push({id: x.id, summary: summarize(body)})
          console.log(self.state.summaries.length);
          if (self.state.summaries.length === (self.state.news.length - 1)) {
            console.log('all good');
            resolve('success summaries');
          }
        })
      })
  })
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
